import "server-only";

import { getSupabaseAdmin } from "@/app/lib/supabase/admin";
import { requeryByMerchantReference } from "./globalpay.ts";
import {
  verifyDonation,
  type BeginRequeryResult,
  type VerificationResult,
} from "./verification.ts";

export function getGlobalPayApiKey(): string | null {
  return process.env.GLOBALPAY_API_KEY?.trim() || null;
}

export function logPaymentEvent(
  event: string,
  details: Record<string, unknown> = {},
) {
  // Never log donor PII, API keys or full provider payloads here.
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      service: "globalpay-donation",
      event,
      ...details,
    }),
  );
}

/**
 * Server-side verification of a donation against GlobalPay.
 * Used by the verify API route, the success page, the webhook and the
 * reconciliation job. Returns "unavailable" if GlobalPay is not configured.
 */
export async function verifyDonationPayment(
  reference: unknown,
  options: { minIntervalSeconds?: number } = {},
): Promise<VerificationResult> {
  const apiKey = getGlobalPayApiKey();

  if (!apiKey) {
    logPaymentEvent("verify_not_configured");
    return { state: "unavailable", reference: null, amount: null };
  }

  return verifyDonation(
    reference,
    {
      async beginRequery(merchantReference, minIntervalSeconds) {
        const { data, error } = await getSupabaseAdmin().rpc(
          "begin_donation_requery",
          {
            p_merchant_reference: merchantReference,
            p_min_interval_seconds: minIntervalSeconds,
          },
        );
        if (error || !data) throw new Error("begin_donation_requery failed");
        return data as BeginRequeryResult;
      },

      queryProvider(merchantReference) {
        return requeryByMerchantReference(apiKey, merchantReference);
      },

      async completePayment(args) {
        const { data, error } = await getSupabaseAdmin().rpc(
          "complete_donation_payment",
          {
            p_merchant_reference: args.merchantReference,
            p_amount_from_merchant: args.amountFromMerchant,
            p_paid_amount: args.amountPaid,
            p_currency: args.currency,
            p_transaction_status: args.transactionStatus,
            p_charge_bearer: args.chargeBearer,
            p_retrieval_reference_number: args.retrievalReferenceNumber,
          },
        );
        if (error) throw new Error("complete_donation_payment failed");
        return data === true;
      },

      async recordResult(args) {
        const { error } = await getSupabaseAdmin().rpc(
          "record_donation_requery_result",
          {
            p_merchant_reference: args.merchantReference,
            p_provider_status: args.providerStatus,
            p_payment_failed: args.paymentFailed,
            p_error_code: args.errorCode,
          },
        );
        if (error) throw new Error("record_donation_requery_result failed");
      },

      log: logPaymentEvent,
    },
    options,
  );
}
