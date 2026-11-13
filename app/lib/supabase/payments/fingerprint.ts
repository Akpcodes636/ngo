import { createHash } from "node:crypto";

type FingerprintInput = {
  amount: number;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  message: string;
  anonymous: boolean;
};

/**
 * Stable SHA-256 fingerprint of a normalized donation request.
 * The same Idempotency-Key reused with different details is rejected by
 * claim_donation_attempt (payload_conflict).
 */
export function createRequestFingerprint(input: FingerprintInput): string {
  // Property order is fixed deliberately.
  const canonical = JSON.stringify([
    input.amount.toFixed(2),
    input.fullName,
    input.email,
    input.phone,
    input.address,
    input.message,
    input.anonymous,
  ]);

  return createHash("sha256").update(canonical).digest("hex");
}
