// Payment verification workflow.
//
// Dependencies (database RPCs and the GlobalPay call) are injected so the
// workflow can be unit-tested without network or database access. The real
// bindings live in ./service.ts.

import {
  evaluateRequeryResponse,
  type ProviderHttpResult,
} from "./globalpay.ts";
import { isValidMerchantReference } from "./idempotency.ts";

export type BeginRequeryResult =
  | { found: false }
  | {
      found: true;
      allowed: boolean;
      reason: string;
      merchant_reference: string;
      amount: number | string;
      status: string;
    };

export type VerificationDeps = {
  beginRequery(
    merchantReference: string,
    minIntervalSeconds: number,
  ): Promise<BeginRequeryResult>;
  queryProvider(merchantReference: string): Promise<ProviderHttpResult>;
  completePayment(args: {
    merchantReference: string;
    amountFromMerchant: number;
    amountPaid: number;
    currency: "NGN";
    transactionStatus: string;
    chargeBearer: string | null;
    retrievalReferenceNumber: string | null;
  }): Promise<boolean>;
  recordResult(args: {
    merchantReference: string;
    providerStatus: string;
    paymentFailed: boolean;
    errorCode: string | null;
  }): Promise<void>;
  log(event: string, details?: Record<string, unknown>): void;
};

export type VerificationState =
  | "successful"
  | "pending"
  | "failed"
  | "not_found"
  | "invalid_reference"
  | "needs_review"
  | "unavailable";

export type VerificationResult = {
  state: VerificationState;
  reference: string | null;
  /** Donation amount from OUR database (authoritative), only when successful. */
  amount: number | null;
};

export const DEFAULT_REQUERY_INTERVAL_SECONDS = 10;

function result(
  state: VerificationState,
  reference: string | null,
  amount: number | null = null,
): VerificationResult {
  return { state, reference, amount };
}

export async function verifyDonation(
  rawReference: unknown,
  deps: VerificationDeps,
  options: { minIntervalSeconds?: number } = {},
): Promise<VerificationResult> {
  if (!isValidMerchantReference(rawReference)) {
    return result("invalid_reference", null);
  }

  const reference = rawReference;

  let begin: BeginRequeryResult;
  try {
    begin = await deps.beginRequery(
      reference,
      options.minIntervalSeconds ?? DEFAULT_REQUERY_INTERVAL_SECONDS,
    );
  } catch {
    deps.log("verify_begin_failed", { reference });
    return result("unavailable", reference);
  }

  if (!begin.found) return result("not_found", null);

  const dbAmount = Number(begin.amount);

  if (begin.status === "successful") {
    return result("successful", reference, dbAmount);
  }

  if (!begin.allowed) {
    // Throttled or terminal: answer from our own record without calling
    // GlobalPay again.
    if (begin.status === "payment_failed" || begin.status === "failed" || begin.status === "expired") {
      return result("failed", reference);
    }
    return result("pending", reference);
  }

  let provider: ProviderHttpResult;
  try {
    provider = await deps.queryProvider(reference);
  } catch (error) {
    deps.log("verify_provider_unreachable", {
      reference,
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
    return result("unavailable", reference);
  }

  const outcome = evaluateRequeryResponse(provider.httpStatus, provider.body, {
    merchantReference: reference,
    amount: dbAmount,
  });

  deps.log("verify_provider_evaluated", {
    reference,
    httpStatus: provider.httpStatus,
    outcome: outcome.kind,
    ...(outcome.kind === "mismatch" ? { reasons: outcome.reasons } : {}),
    ...(outcome.kind === "unavailable" ? { reason: outcome.reason } : {}),
  });

  try {
    switch (outcome.kind) {
      case "successful": {
        const completed = await deps.completePayment({
          merchantReference: reference,
          amountFromMerchant: outcome.amountFromMerchant,
          amountPaid: outcome.amountPaid,
          currency: outcome.currency,
          transactionStatus: outcome.transactionStatus,
          chargeBearer: outcome.chargeBearer,
          retrievalReferenceNumber: outcome.retrievalReferenceNumber,
        });

        if (!completed) {
          deps.log("verify_completion_rejected_by_database", { reference });
          return result("needs_review", reference);
        }

        return result("successful", reference, dbAmount);
      }

      case "failed":
        await deps.recordResult({
          merchantReference: reference,
          providerStatus: outcome.transactionStatus,
          paymentFailed: true,
          errorCode: null,
        });
        return result("failed", reference);

      case "pending":
        if (outcome.transactionStatus) {
          await deps.recordResult({
            merchantReference: reference,
            providerStatus: outcome.transactionStatus,
            paymentFailed: false,
            errorCode: null,
          });
        }
        return result("pending", reference);

      case "mismatch":
        await deps.recordResult({
          merchantReference: reference,
          providerStatus: outcome.transactionStatus ?? "UNKNOWN",
          paymentFailed: false,
          errorCode: "REQUERY_MISMATCH",
        });
        return result("needs_review", reference);

      case "unavailable":
        return result("unavailable", reference);
    }
  } catch {
    deps.log("verify_persistence_failed", { reference, outcome: outcome.kind });
    return result("unavailable", reference);
  }
}
