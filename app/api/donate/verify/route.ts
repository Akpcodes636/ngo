import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import {
  getGlobalPayApiKey,
  verifyDonationPayment,
} from "@/app/lib/supabase/payments/service";
import type { VerificationState } from "@/app/lib/supabase/payments/verification";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/donate/verify?reference=<merchant reference>
//
// Asks GlobalPay (server-side requery) whether the donation identified by OUR
// merchant reference was paid. A reference only selects which of our records
// to check; it can never mark anything as paid by itself. Success requires
// GlobalPay to confirm status, our reference, NGN and our stored amount.

const HTTP_STATUS: Record<VerificationState, number> = {
  successful: 200,
  pending: 200,
  failed: 200,
  not_found: 404,
  invalid_reference: 400,
  needs_review: 409,
  unavailable: 503,
};

const MESSAGES: Partial<Record<VerificationState, string>> = {
  not_found: "Donation reference not found.",
  invalid_reference: "A valid donation reference is required.",
  needs_review:
    "We could not automatically confirm this payment. Our team will review it. Please contact support with your reference.",
  unavailable: "We can't confirm your payment right now. Please try again shortly.",
};

export async function GET(request: Request) {
  const requestId = randomUUID();
  const headers = { "Cache-Control": "no-store", "X-Request-ID": requestId };

  if (!getGlobalPayApiKey()) {
    return NextResponse.json(
      { verified: false, status: "unavailable", error: "Payment verification is not configured.", requestId },
      { status: 501, headers },
    );
  }

  const reference = new URL(request.url).searchParams.get("reference")?.trim();
  const outcome = await verifyDonationPayment(reference);

  return NextResponse.json(
    {
      verified: outcome.state === "successful",
      status: outcome.state,
      reference: outcome.reference,
      ...(outcome.state === "successful"
        ? { amount: outcome.amount, currency: "NGN" }
        : {}),
      ...(MESSAGES[outcome.state] ? { error: MESSAGES[outcome.state] } : {}),
      requestId,
    },
    { status: HTTP_STATUS[outcome.state], headers },
  );
}
