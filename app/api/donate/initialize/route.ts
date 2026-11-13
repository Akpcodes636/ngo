import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getSupabaseAdmin } from "@/app/lib/supabase/admin";
import { createRequestFingerprint } from "@/app/lib/supabase/payments/fingerprint";
import {
  classifyInitializationResponse,
  generatePaymentLink,
  isValidCheckoutUrl,
} from "@/app/lib/supabase/payments/globalpay";
import {
  isValidIdempotencyKey,
  validateDonationRequest,
} from "@/app/lib/supabase/payments/idempotency";

export const runtime = "nodejs";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type DonationAttempt = {
  id: string;
  merchant_reference: string;
  amount: number;
  status: string;
  checkout_url: string | null;
};

type ClaimResult = {
  decision: string;
  attempt: DonationAttempt;
};

/**
 * Machine-readable error codes returned to the browser.
 * `new_attempt_required` tells the form to generate a fresh Idempotency-Key.
 */
type ErrorCode =
  | "invalid_request"
  | "unavailable"
  | "server_error"
  | "in_progress"
  | "reconcile_required"
  | "new_attempt_required"
  | "already_paid"
  | "rejected";

// -----------------------------------------------------------------------------
// Logging (no donor PII, no secrets)
// -----------------------------------------------------------------------------

function log(
  requestId: string,
  event: string,
  details: Record<string, unknown> = {},
) {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      requestId,
      service: "globalpay-donation",
      event,
      ...details,
    }),
  );
}

// -----------------------------------------------------------------------------
// API responses
// -----------------------------------------------------------------------------

const NO_STORE = { "Cache-Control": "no-store" };

function errorResponse(
  requestId: string,
  code: ErrorCode,
  message: string,
  status: number,
) {
  return NextResponse.json(
    { error: message, code, requestId },
    { status, headers: { ...NO_STORE, "X-Request-ID": requestId } },
  );
}

function successResponse(
  requestId: string,
  authorizationUrl: string,
  reference: string,
  reused: boolean,
) {
  return NextResponse.json(
    { authorizationUrl, reference, requestId, reused },
    { status: 200, headers: { ...NO_STORE, "X-Request-ID": requestId } },
  );
}

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------

function getAppUrl(request: Request): string | null {
  const configured = process.env.APP_URL?.trim();
  const isProduction = process.env.NODE_ENV === "production";

  // In production the redirect URL must never be derived from the request's
  // Host header.
  if (isProduction && !configured) return null;

  try {
    const url = new URL(configured || new URL(request.url).origin);
    if (isProduction && url.protocol !== "https:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

// -----------------------------------------------------------------------------
// Database helpers
// -----------------------------------------------------------------------------

async function markInitializationUnknown(
  idempotencyKey: string,
  merchantReference: string,
  errorCode: string,
) {
  const { error } = await getSupabaseAdmin().rpc(
    "mark_donation_initialization_unknown",
    {
      p_idempotency_key: idempotencyKey,
      p_merchant_reference: merchantReference,
      p_error_code: errorCode,
    },
  );

  if (error) throw new Error("Unable to update uncertain donation state.");
}

async function failInitialization(
  idempotencyKey: string,
  merchantReference: string,
  errorCode: string,
  providerResponseCode: string | null,
) {
  const { error } = await getSupabaseAdmin().rpc(
    "fail_donation_initialization",
    {
      p_idempotency_key: idempotencyKey,
      p_merchant_reference: merchantReference,
      p_error_code: errorCode,
      p_provider_response_code: providerResponseCode,
    },
  );

  if (error) throw new Error("Unable to update failed donation state.");
}

// -----------------------------------------------------------------------------
// POST /api/donate/initialize
// -----------------------------------------------------------------------------

export async function POST(request: Request) {
  const requestId = randomUUID();
  const startedAt = Date.now();

  let idempotencyKey: string | null = null;
  let merchantReference: string | null = null;
  let claimedNewAttempt = false;

  log(requestId, "request_received");

  try {
    // 1. Idempotency key ----------------------------------------------------

    idempotencyKey = request.headers.get("Idempotency-Key");

    if (!isValidIdempotencyKey(idempotencyKey)) {
      return errorResponse(
        requestId,
        "invalid_request",
        "A valid Idempotency-Key header is required.",
        400,
      );
    }

    // 2. Body ---------------------------------------------------------------

    const body: unknown = await request.json().catch(() => null);
    const validation = validateDonationRequest(body);

    if (!validation.ok) {
      log(requestId, "validation_failed", {
        invalidFields: validation.invalidFields,
      });

      return errorResponse(
        requestId,
        "invalid_request",
        "Please check your donation details and try again.",
        400,
      );
    }

    const payload = validation.donation;

    log(requestId, "validation_succeeded", {
      amount: payload.amount,
      currency: "NGN",
      anonymous: payload.anonymous,
    });

    // 3. Configuration ------------------------------------------------------

    const apiKey = process.env.GLOBALPAY_API_KEY?.trim();

    if (!apiKey) {
      log(requestId, "configuration_error", { reason: "api_key_missing" });

      return errorResponse(
        requestId,
        "unavailable",
        "Online payment is currently unavailable. Please use bank transfer.",
        501,
      );
    }

    const appUrl = getAppUrl(request);

    if (!appUrl) {
      log(requestId, "configuration_error", { reason: "app_url_invalid" });

      return errorResponse(
        requestId,
        "server_error",
        "Payment configuration is currently unavailable.",
        500,
      );
    }

    // 4. Atomically claim the attempt --------------------------------------

    const { data: claimData, error: claimError } =
      await getSupabaseAdmin().rpc("claim_donation_attempt", {
        p_idempotency_key: idempotencyKey,
        p_request_fingerprint: createRequestFingerprint(payload),
        p_amount: payload.amount,
        p_request_payload: payload,
      });

    if (claimError) {
      log(requestId, "donation_claim_failed", {
        databaseCode: claimError.code,
      });

      return errorResponse(
        requestId,
        "server_error",
        "We couldn't securely prepare your donation. Please try again.",
        500,
      );
    }

    const claim = claimData as ClaimResult | null;

    if (!claim?.decision || !claim.attempt?.merchant_reference) {
      log(requestId, "invalid_claim_result");

      return errorResponse(
        requestId,
        "server_error",
        "Unable to prepare your donation.",
        500,
      );
    }

    const attempt = claim.attempt;
    merchantReference = attempt.merchant_reference;

    log(requestId, "donation_claim_resolved", {
      decision: claim.decision,
      merchantReference,
      attemptStatus: attempt.status,
    });

    // 5. Existing attempts --------------------------------------------------

    switch (claim.decision) {
      case "existing_initialized": {
        if (!isValidCheckoutUrl(attempt.checkout_url)) {
          log(requestId, "stored_checkout_url_invalid");

          return errorResponse(
            requestId,
            "server_error",
            "We couldn't retrieve your existing checkout session. Please contact support.",
            500,
          );
        }

        return successResponse(
          requestId,
          attempt.checkout_url,
          merchantReference,
          true,
        );
      }

      case "in_progress":
        return errorResponse(
          requestId,
          "in_progress",
          "Your donation is already being initialized. Please wait a moment and retry.",
          409,
        );

      case "reconcile_required":
        return errorResponse(
          requestId,
          "reconcile_required",
          "Your previous payment request is being checked. Please contact support before trying another donation.",
          409,
        );

      case "already_paid":
        return errorResponse(
          requestId,
          "already_paid",
          "This donation has already been completed. Thank you!",
          409,
        );

      case "payment_failed":
        return errorResponse(
          requestId,
          "new_attempt_required",
          "Your previous payment attempt was not successful. Please submit again to start a new payment.",
          409,
        );

      case "payload_conflict":
      case "terminal":
        return errorResponse(
          requestId,
          "new_attempt_required",
          "This payment session can no longer be used. Please submit again to start a new donation.",
          409,
        );

      case "created":
        // Only a newly claimed attempt is allowed to contact GlobalPay.
        claimedNewAttempt = true;
        break;

      default:
        return errorResponse(
          requestId,
          "server_error",
          "Unable to determine your donation status. Please contact support.",
          500,
        );
    }

    // 6. Build GlobalPay request -------------------------------------------

    const nameParts = payload.fullName.split(" ");
    const firstName = payload.anonymous ? "Anonymous" : nameParts[0];
    const lastName = payload.anonymous
      ? "Donor"
      : nameParts.slice(1).join(" ") || nameParts[0];

    // Our own reference is embedded in the return URL, so the success page
    // never depends on undocumented query parameters added by GlobalPay.
    const redirectUrl = new URL("/donate/success", appUrl);
    redirectUrl.searchParams.set("reference", merchantReference);

    const globalPayPayload = {
      amount: payload.amount,
      merchantTransactionReference: merchantReference,
      redirectUrl: redirectUrl.toString(),
      customer: {
        firstName: firstName.slice(0, 100),
        lastName: lastName.slice(0, 100),
        currency: "NGN",
        phoneNumber: payload.phone,
        address: payload.address,
        emailAddress: payload.email,
        paymentFormCustomFields: [
          { name: "Anonymous Donation", value: payload.anonymous ? "Yes" : "No" },
          ...(payload.message
            ? [{ name: "Donor Message", value: payload.message }]
            : []),
        ],
      },
    };

    // 7. Call GlobalPay -----------------------------------------------------

    const upstreamStartedAt = Date.now();
    let provider: Awaited<ReturnType<typeof generatePaymentLink>>;

    try {
      provider = await generatePaymentLink(apiKey, globalPayPayload);
    } catch (error) {
      const errorName = error instanceof Error ? error.name : "UnknownError";

      log(requestId, "globalpay_network_error", {
        errorName,
        durationMs: Date.now() - upstreamStartedAt,
      });

      // The link may have been created even though we never saw the reply.
      await markInitializationUnknown(
        idempotencyKey,
        merchantReference,
        errorName === "TimeoutError"
          ? "GLOBALPAY_TIMEOUT"
          : "GLOBALPAY_NETWORK_ERROR",
      ).catch(() => log(requestId, "unknown_state_update_failed"));

      return errorResponse(
        requestId,
        "reconcile_required",
        "We couldn't confirm whether your payment session was created. Please contact support before starting another donation.",
        502,
      );
    }

    const outcome = classifyInitializationResponse(
      provider.httpStatus,
      provider.body,
    );

    log(requestId, "globalpay_response_classified", {
      httpStatus: provider.httpStatus,
      outcome: outcome.kind,
      durationMs: Date.now() - upstreamStartedAt,
    });

    // 8. Definitive rejection: no link exists ------------------------------

    if (outcome.kind === "rejected") {
      await failInitialization(
        idempotencyKey,
        merchantReference,
        "GLOBALPAY_REJECTED",
        outcome.providerResponseCode,
      ).catch(() => log(requestId, "failure_state_update_failed"));

      return errorResponse(
        requestId,
        "new_attempt_required",
        "GlobalPay could not initialize this payment. Please review your details or contact support.",
        502,
      );
    }

    // 9. Uncertain result ---------------------------------------------------

    if (outcome.kind === "unknown") {
      await markInitializationUnknown(
        idempotencyKey,
        merchantReference,
        "GLOBALPAY_UNCONFIRMED_RESULT",
      ).catch(() => log(requestId, "unknown_state_update_failed"));

      return errorResponse(
        requestId,
        "reconcile_required",
        "We couldn't confirm your checkout session. Please contact support before trying again.",
        502,
      );
    }

    // 10. Persist checkout URL before handing it to the browser ------------

    const { data: completionData, error: completionError } =
      await getSupabaseAdmin().rpc("complete_donation_initialization", {
        p_idempotency_key: idempotencyKey,
        p_merchant_reference: merchantReference,
        p_checkout_url: outcome.checkoutUrl,
        p_globalpay_reference: outcome.globalPayReference,
        p_provider_response_code: outcome.responseCode,
      });

    if (completionError || completionData !== true) {
      log(requestId, "checkout_persistence_failed", {
        databaseCode: completionError?.code,
      });

      await markInitializationUnknown(
        idempotencyKey,
        merchantReference,
        "CHECKOUT_PERSISTENCE_FAILED",
      ).catch(() => log(requestId, "unknown_state_update_failed"));

      return errorResponse(
        requestId,
        "reconcile_required",
        "Your checkout session could not be safely saved. Please contact support before retrying.",
        503,
      );
    }

    log(requestId, "payment_initialization_succeeded", {
      merchantReference,
      durationMs: Date.now() - startedAt,
    });

    return successResponse(
      requestId,
      outcome.checkoutUrl,
      merchantReference,
      false,
    );
  } catch (error) {
    log(requestId, "unexpected_server_error", {
      errorName: error instanceof Error ? error.name : "UnknownError",
      durationMs: Date.now() - startedAt,
    });

    // Only an attempt THIS request created can have reached GlobalPay.
    if (claimedNewAttempt && idempotencyKey && merchantReference) {
      await markInitializationUnknown(
        idempotencyKey,
        merchantReference,
        "UNEXPECTED_INITIALIZATION_ERROR",
      ).catch(() => log(requestId, "unknown_state_update_failed"));
    }

    return errorResponse(
      requestId,
      "server_error",
      "An unexpected error occurred while initializing your donation.",
      500,
    );
  }
}
