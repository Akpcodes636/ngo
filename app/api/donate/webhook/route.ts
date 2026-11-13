import { NextResponse } from "next/server";
import {
  decryptWebhookPayload,
  webhookMerchantReference,
} from "@/app/lib/supabase/payments/globalpay";
import { isValidMerchantReference } from "@/app/lib/supabase/payments/idempotency";
import {
  getGlobalPayApiKey,
  logPaymentEvent,
  verifyDonationPayment,
} from "@/app/lib/supabase/payments/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/donate/webhook
//
// Configure this URL in the GlobalPay dashboard. Per the docs, GlobalPay sends
// { "Request": base64(IV + AES-128-CBC ciphertext) } encrypted with our API key
// for every transaction that ends Successful or Failed.
//
// The payload has no signature, so it is NEVER trusted as proof of payment.
// We only extract our merchant reference from it and then run the normal
// server-side requery (exactly what the GlobalPay docs instruct).

function reply(ok: boolean) {
  return NextResponse.json(
    ok
      ? { Status: true, ResponseCode: "00", ResponseDescription: "Request was successful" }
      : { Status: false, ResponseCode: "99", ResponseDescription: "Request was not successful" },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const apiKey = getGlobalPayApiKey();

  if (!apiKey) {
    logPaymentEvent("webhook_not_configured");
    return reply(false);
  }

  const body: unknown = await request.json().catch(() => null);

  let reference: string | null = null;

  try {
    const encrypted =
      body && typeof body === "object" && !Array.isArray(body)
        ? (body as Record<string, unknown>).Request
        : null;

    // Decrypted payload contains donor PII: do not log it.
    reference = webhookMerchantReference(
      decryptWebhookPayload(encrypted, apiKey),
    );
  } catch {
    logPaymentEvent("webhook_decrypt_failed");
    return reply(false);
  }

  if (!isValidMerchantReference(reference)) {
    // Not one of our donation references (e.g. another product on the same
    // merchant account). Acknowledge so GlobalPay does not keep retrying.
    logPaymentEvent("webhook_reference_ignored");
    return reply(true);
  }

  // Bypass the per-reference throttle: this is a provider signal.
  const outcome = await verifyDonationPayment(reference, {
    minIntervalSeconds: 0,
  });

  logPaymentEvent("webhook_processed", { reference, state: outcome.state });

  // Ask GlobalPay to redeliver only when we could not reach a conclusion.
  return reply(outcome.state !== "unavailable");
}
