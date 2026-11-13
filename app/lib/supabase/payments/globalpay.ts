// GlobalPay Nigeria integration helpers.
//
// Source: https://docs.globalpay.ng (Payment Link, Requery, Webhook pages),
// reviewed 2026-11-12. Every rule below is taken from those docs; anything the
// docs do not define is treated as "not confirmed" (fail closed), never as
// success.
//
// Pure functions (no framework/database imports) so they can be unit-tested.

import { createDecipheriv } from "node:crypto";
import { toKobo } from "./idempotency.ts";

export const GLOBALPAY_API_BASE =
  "https://paygw.globalpay.com.ng/globalpay-paymentgateway/api/paymentgateway";

export const GLOBALPAY_CHECKOUT_HOST = "checkout.globalpay.ng";

export const GLOBALPAY_TIMEOUT_MS = 15_000;

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function trimmedString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function isValidCheckoutUrl(value: unknown): value is string {
  if (typeof value !== "string" || !value.trim()) return false;

  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === GLOBALPAY_CHECKOUT_HOST &&
      url.username === "" &&
      url.password === "" &&
      url.port === ""
    );
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Payment link (POST /generate-payment-link)
//
// Documented 200: { isSuccessful: true, data: { checkoutUrl, transactionReference, ... },
//                   responseCode: "0000", ... }
// Documented 400: { isSuccessful: false, data: null, responseCode: null,
//                   error: { responseCode, responseDescription } }
// ---------------------------------------------------------------------------

export type InitializationOutcome =
  | {
      kind: "created";
      checkoutUrl: string;
      globalPayReference: string | null;
      responseCode: string;
    }
  | { kind: "rejected"; providerResponseCode: string | null }
  | { kind: "unknown"; reason: string };

// 4xx statuses that mean the request was refused and no link was created.
// 408 (timeout) and 429 (rate limit) are deliberately excluded.
const DEFINITIVE_REJECTION_STATUSES = new Set([400, 401, 403, 404, 405, 415, 422]);

export function classifyInitializationResponse(
  httpStatus: number,
  body: unknown,
): InitializationOutcome {
  if (!isRecord(body)) return { kind: "unknown", reason: "invalid_body" };

  const responseCode = trimmedString(body.responseCode);
  const data = isRecord(body.data) ? body.data : null;
  const checkoutUrl = data?.checkoutUrl;
  const errorCode = isRecord(body.error)
    ? trimmedString(body.error.responseCode)
    : null;

  const ok = httpStatus >= 200 && httpStatus < 300;

  if (
    ok &&
    body.isSuccessful === true &&
    responseCode === "0000" &&
    isValidCheckoutUrl(checkoutUrl)
  ) {
    return {
      kind: "created",
      checkoutUrl,
      globalPayReference: trimmedString(data?.transactionReference),
      responseCode,
    };
  }

  // Explicit refusal with no checkout link: safe to mark as failed.
  if (
    body.isSuccessful === false &&
    !checkoutUrl &&
    (ok || DEFINITIVE_REJECTION_STATUSES.has(httpStatus))
  ) {
    return {
      kind: "rejected",
      providerResponseCode: responseCode ?? errorCode,
    };
  }

  // 5xx, 408, 429, success without a valid URL, etc. The link may exist.
  return { kind: "unknown", reason: `http_${httpStatus}` };
}

// ---------------------------------------------------------------------------
// Requery (query-single-transaction-by-merchant-reference/{merchantTransRef})
//
// Documented 200 body:
//   { isSuccessful: true, data: { amountFromMerchant, amountPaid, merchantTxnref,
//     transactionStatus, currency, chargeBearer, totalCharge,
//     retrievalReferenceNumber, ... }, responseCode: "string" }
// Documented rules:
//   1. transactionStatus "Successful" => successful
//   2. ChargeMerchant => amountPaid = amountFromMerchant
//   3. ChargeCustomer => amountPaid = amountFromMerchant + totalCharge
//   4. amountFromMerchant = amount we sent to generate-payment-link
// Webhook docs: Status is "Successful" or "Failed".
//
// The requery responseCode is documented only as "string", so it is NOT used
// as a success signal (ZEN0000 does not appear anywhere in the docs).
// ---------------------------------------------------------------------------

export type RequeryOutcome =
  | {
      kind: "successful";
      amountFromMerchant: number;
      amountPaid: number;
      currency: "NGN";
      chargeBearer: string | null;
      transactionStatus: string;
      retrievalReferenceNumber: string | null;
    }
  | { kind: "failed"; transactionStatus: string }
  | { kind: "pending"; transactionStatus: string | null; reason: string }
  | { kind: "mismatch"; reasons: string[]; transactionStatus: string | null }
  | { kind: "unavailable"; reason: string };

export function evaluateRequeryResponse(
  httpStatus: number,
  body: unknown,
  expected: { merchantReference: string; amount: number },
): RequeryOutcome {
  if (httpStatus >= 500 || httpStatus === 408 || httpStatus === 429) {
    return { kind: "unavailable", reason: `http_${httpStatus}` };
  }

  if (!isRecord(body)) {
    return { kind: "unavailable", reason: "invalid_body" };
  }

  if (httpStatus === 401 || httpStatus === 403 || httpStatus === 405) {
    // Credentials or HTTP method problem on our side: never infer a result.
    return { kind: "unavailable", reason: `http_${httpStatus}` };
  }

  // Not found / not yet paid / provider-side refusal. Not proof of failure.
  if (body.isSuccessful !== true || httpStatus < 200 || httpStatus >= 300) {
    return { kind: "pending", transactionStatus: null, reason: "not_confirmed" };
  }

  if (!isRecord(body.data)) {
    return { kind: "unavailable", reason: "unexpected_data_shape" };
  }

  const tx = body.data;
  const transactionStatus = trimmedString(tx.transactionStatus);

  // 1. The transaction must be ours.
  if (trimmedString(tx.merchantTxnref) !== expected.merchantReference) {
    return {
      kind: "mismatch",
      reasons: ["merchant_reference"],
      transactionStatus,
    };
  }

  const normalizedStatus = transactionStatus?.toLowerCase();

  if (normalizedStatus === "failed") {
    return { kind: "failed", transactionStatus: transactionStatus as string };
  }

  if (normalizedStatus !== "successful") {
    return { kind: "pending", transactionStatus, reason: "status_not_final" };
  }

  // 2. Successful: every monetary field must agree with our record.
  const reasons: string[] = [];

  const currency = trimmedString(tx.currency)?.toUpperCase();
  if (currency !== "NGN") reasons.push("currency");

  const expectedKobo = toKobo(expected.amount);
  const fromMerchantKobo = toKobo(tx.amountFromMerchant);
  const paidKobo = toKobo(tx.amountPaid);

  if (expectedKobo === null || fromMerchantKobo !== expectedKobo) {
    reasons.push("amount_from_merchant");
  }

  const chargeBearer = trimmedString(tx.chargeBearer);

  if (paidKobo === null || fromMerchantKobo === null) {
    reasons.push("amount_paid");
  } else if (chargeBearer === "ChargeCustomer") {
    if (paidKobo < fromMerchantKobo) reasons.push("amount_paid");
  } else if (paidKobo !== fromMerchantKobo) {
    // ChargeMerchant, missing or undocumented bearer: must be exact.
    reasons.push("amount_paid");
  }

  if (reasons.length > 0) {
    return { kind: "mismatch", reasons, transactionStatus };
  }

  return {
    kind: "successful",
    amountFromMerchant: (fromMerchantKobo as number) / 100,
    amountPaid: (paidKobo as number) / 100,
    currency: "NGN",
    chargeBearer,
    transactionStatus: transactionStatus as string,
    retrievalReferenceNumber: trimmedString(tx.retrievalReferenceNumber),
  };
}

// ---------------------------------------------------------------------------
// HTTP calls (server-side only; the API key never leaves the server)
// ---------------------------------------------------------------------------

export type ProviderHttpResult = { httpStatus: number; body: unknown };

async function readJson(res: Response): Promise<unknown> {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Requery by our merchant reference.
 *
 * HTTP method: the docs' method table says POST, but every code sample on the
 * same page (Node, PHP) and the mobile guide (Swift) use GET with no body.
 * GET is used here. If GlobalPay answers 405, evaluateRequeryResponse returns
 * "unavailable" (never success), and the logs show http_405.
 */
export async function requeryByMerchantReference(
  apiKey: string,
  merchantReference: string,
  fetchImpl: typeof fetch = fetch,
): Promise<ProviderHttpResult> {
  const res = await fetchImpl(
    `${GLOBALPAY_API_BASE}/query-single-transaction-by-merchant-reference/` +
      encodeURIComponent(merchantReference),
    {
      method: "GET",
      headers: { apikey: apiKey, Accept: "application/json" },
      signal: AbortSignal.timeout(GLOBALPAY_TIMEOUT_MS),
      cache: "no-store",
    },
  );

  return { httpStatus: res.status, body: await readJson(res) };
}

export async function generatePaymentLink(
  apiKey: string,
  payload: unknown,
  fetchImpl: typeof fetch = fetch,
): Promise<ProviderHttpResult> {
  const res = await fetchImpl(`${GLOBALPAY_API_BASE}/generate-payment-link`, {
    method: "POST",
    headers: {
      apikey: apiKey,
      language: "en",
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(GLOBALPAY_TIMEOUT_MS),
    cache: "no-store",
  });

  return { httpStatus: res.status, body: await readJson(res) };
}

// ---------------------------------------------------------------------------
// Webhook decryption
//
// Docs: body is { "Request": base64(IV[16] + AES-128-CBC ciphertext) },
// PKCS7 padding, key = API key (16 chars) as UTF-8 bytes.
// There is NO signature/MAC, so the payload is only used as a hint: we take
// the merchant reference from it and confirm everything via requery.
// ---------------------------------------------------------------------------

export function decryptWebhookPayload(
  encrypted: unknown,
  apiKey: string,
): unknown {
  if (typeof encrypted !== "string" || encrypted.length > 20_000) {
    throw new Error("Invalid webhook payload");
  }

  const key = Buffer.from(apiKey, "utf8");
  if (key.length !== 16) throw new Error("Webhook key must be 16 bytes");

  const raw = Buffer.from(encrypted, "base64");
  if (raw.length < 32 || (raw.length - 16) % 16 !== 0) {
    throw new Error("Invalid webhook payload");
  }

  const decipher = createDecipheriv("aes-128-cbc", key, raw.subarray(0, 16));
  const plaintext = Buffer.concat([
    decipher.update(raw.subarray(16)),
    decipher.final(),
  ]).toString("utf8");

  return JSON.parse(plaintext);
}

export function webhookMerchantReference(payload: unknown): string | null {
  if (!isRecord(payload)) return null;
  // Docs spell it "MerchantTransactionreference" (lower-case r).
  return trimmedString(payload.MerchantTransactionreference);
}
