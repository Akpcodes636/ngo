// Pure validation helpers shared by the donation API routes.
// No framework or database imports so they can be unit-tested directly.

export const MIN_DONATION_AMOUNT = 100;
// GlobalPay documents `amount` as Decimal(8,2), i.e. at most 999,999.99.
export const MAX_DONATION_AMOUNT = 999_999.99;

export const MAX_NAME_LENGTH = 100;
export const MAX_EMAIL_LENGTH = 254;
export const MIN_ADDRESS_LENGTH = 6;
export const MAX_ADDRESS_LENGTH = 300;
export const MAX_MESSAGE_LENGTH = 500;

const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9._:-]{16,200}$/;

// Format produced by claim_donation_attempt: hgyi_<epoch ms>_<hex>.
// 8 hex chars for rows created by migration 001, 16 for migration 003+.
const MERCHANT_REFERENCE_PATTERN = /^hgyi_\d{13}_[a-f0-9]{8,16}$/;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\d{11}$/;

export type NormalizedDonation = {
  amount: number;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  message: string;
  anonymous: boolean;
};

export function isValidIdempotencyKey(value: unknown): value is string {
  return typeof value === "string" && IDEMPOTENCY_KEY_PATTERN.test(value);
}

export function isValidMerchantReference(value: unknown): value is string {
  return (
    typeof value === "string" && MERCHANT_REFERENCE_PATTERN.test(value)
  );
}

/** Converts a naira amount with at most 2 decimals to integer kobo. */
export function toKobo(value: unknown): number | null {
  let amount: number;

  if (typeof value === "number") {
    amount = value;
  } else if (typeof value === "string" && /^\d+(\.\d+)?$/.test(value.trim())) {
    amount = Number(value.trim());
  } else {
    return null;
  }

  if (!Number.isFinite(amount) || amount < 0) return null;

  const kobo = Math.round(amount * 100);

  // Reject sub-kobo precision (e.g. 100.001) instead of silently rounding.
  if (Math.abs(amount * 100 - kobo) > 1e-6) return null;

  return kobo;
}

export function isValidDonationAmount(value: unknown): value is number {
  if (typeof value !== "number") return false;
  const kobo = toKobo(value);
  return (
    kobo !== null &&
    kobo >= MIN_DONATION_AMOUNT * 100 &&
    kobo <= Math.round(MAX_DONATION_AMOUNT * 100)
  );
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export type DonationValidation =
  | { ok: true; donation: NormalizedDonation }
  | { ok: false; invalidFields: string[] };

/** Normalizes and validates an untrusted donation request body. */
export function validateDonationRequest(body: unknown): DonationValidation {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, invalidFields: ["body"] };
  }

  const input = body as Record<string, unknown>;

  const donation: NormalizedDonation = {
    amount: typeof input.amount === "number" ? input.amount : NaN,
    fullName: str(input.fullName).replace(/\s+/g, " "),
    email: str(input.email).toLowerCase(),
    phone: str(input.phone),
    address: str(input.address),
    message: str(input.message),
    anonymous: input.anonymous === true,
  };

  const invalidFields: string[] = [];

  if (!isValidDonationAmount(donation.amount)) invalidFields.push("amount");
  if (!donation.fullName || donation.fullName.length > MAX_NAME_LENGTH) {
    invalidFields.push("fullName");
  }
  if (
    donation.email.length > MAX_EMAIL_LENGTH ||
    !EMAIL_PATTERN.test(donation.email)
  ) {
    invalidFields.push("email");
  }
  if (!PHONE_PATTERN.test(donation.phone)) invalidFields.push("phone");
  if (
    donation.address.length < MIN_ADDRESS_LENGTH ||
    donation.address.length > MAX_ADDRESS_LENGTH
  ) {
    invalidFields.push("address");
  }
  if (donation.message.length > MAX_MESSAGE_LENGTH) {
    invalidFields.push("message");
  }
  if (
    input.anonymous !== undefined &&
    typeof input.anonymous !== "boolean"
  ) {
    invalidFields.push("anonymous");
  }

  // Any attempt to request a recurring donation is rejected explicitly.
  if (input.frequency !== undefined && input.frequency !== "one-time") {
    invalidFields.push("frequency");
  }

  if (invalidFields.length > 0) return { ok: false, invalidFields };

  // Canonical 2-decimal amount (e.g. 100.1 stays 100.1, never 100.10000001).
  donation.amount = (toKobo(donation.amount) as number) / 100;

  return { ok: true, donation };
}
