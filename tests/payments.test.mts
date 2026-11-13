// Run with: npm test   (Node's built-in test runner, no extra dependencies)

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { createCipheriv, randomBytes } from "node:crypto";

import {
  isValidIdempotencyKey,
  isValidMerchantReference,
  toKobo,
  validateDonationRequest,
} from "../app/lib/supabase/payments/idempotency.ts";
import { createRequestFingerprint } from "../app/lib/supabase/payments/fingerprint.ts";
import {
  classifyInitializationResponse,
  decryptWebhookPayload,
  evaluateRequeryResponse,
  isValidCheckoutUrl,
  webhookMerchantReference,
} from "../app/lib/supabase/payments/globalpay.ts";
import {
  verifyDonation,
  type BeginRequeryResult,
  type VerificationDeps,
} from "../app/lib/supabase/payments/verification.ts";

const REF = "hgyi_1762958400000_0123456789abcdef";

const validBody = {
  amount: 10000,
  fullName: "Ada  Obi",
  email: "Ada@Example.com",
  phone: "08012345678",
  address: "12 Allen Avenue, Ikeja",
  message: "",
  anonymous: false,
};

// Shape copied from the GlobalPay "Query transaction with Merchant
// Transaction Reference" sample response.
function requeryBody(overrides: Record<string, unknown> = {}) {
  return {
    isSuccessful: true,
    error: null,
    data: {
      amountFromMerchant: 10000.0,
      amountPaid: 10000.0,
      merchantTxnref: REF,
      transactionSource: "Website",
      transactionDate: "2025-01-02T11:56:47.64",
      transactionStatus: "Successful",
      transactionChannel: null,
      retrievalReferenceNumber: "5295178011124XXX",
      chargeBearer: "ChargeMerchant",
      totalCharge: 0.0,
      currency: "NGN",
      ...overrides,
    },
    successMessage: "string",
    responseCode: "string",
  };
}

const expected = { merchantReference: REF, amount: 10000 };

// ---------------------------------------------------------------------------
describe("request validation", () => {
  test("accepts a valid one-time donation and normalizes it", () => {
    const r = validateDonationRequest(validBody);
    assert.equal(r.ok, true);
    if (r.ok) {
      assert.equal(r.donation.fullName, "Ada Obi");
      assert.equal(r.donation.email, "ada@example.com");
      assert.equal(r.donation.amount, 10000);
    }
  });

  for (const [label, amount] of [
    ["below minimum", 99.99],
    ["above GlobalPay Decimal(8,2) max", 1_000_000],
    ["sub-kobo precision", 100.001],
    ["NaN", NaN],
    ["Infinity", Infinity],
    ["negative", -500],
    ["string amount", "10000"],
    ["missing amount", undefined],
  ] as const) {
    test(`rejects amount: ${label}`, () => {
      const r = validateDonationRequest({ ...validBody, amount });
      assert.equal(r.ok, false);
      if (!r.ok) assert.ok(r.invalidFields.includes("amount"));
    });
  }

  test("accepts boundary amounts 100 and 999,999.99 and kobo values", () => {
    for (const amount of [100, 999_999.99, 150.5, 0.1 + 100.2]) {
      const r = validateDonationRequest({ ...validBody, amount });
      assert.equal(r.ok, true, `amount ${amount}`);
    }
    const r = validateDonationRequest({ ...validBody, amount: 0.1 + 100.2 });
    if (r.ok) assert.equal(r.donation.amount, 100.3);
  });

  test("rejects recurring frequency", () => {
    const r = validateDonationRequest({ ...validBody, frequency: "monthly" });
    assert.equal(r.ok, false);
  });

  test("rejects invalid email, phone, address, long message, non-boolean anonymous", () => {
    const cases: Record<string, unknown>[] = [
      { email: "not-an-email" },
      { phone: "+2348012345678" },
      { phone: "0801234567" },
      { address: "abc" },
      { message: "x".repeat(501) },
      { anonymous: "yes" },
      { fullName: "   " },
      { fullName: "a".repeat(101) },
    ];
    for (const c of cases) {
      assert.equal(validateDonationRequest({ ...validBody, ...c }).ok, false, JSON.stringify(c));
    }
  });

  test("rejects non-object bodies", () => {
    for (const body of [null, [], "x", 42]) {
      assert.equal(validateDonationRequest(body).ok, false);
    }
  });

  test("idempotency key format", () => {
    assert.equal(isValidIdempotencyKey(crypto.randomUUID()), true);
    assert.equal(isValidIdempotencyKey("short"), false);
    assert.equal(isValidIdempotencyKey("a".repeat(201)), false);
    assert.equal(isValidIdempotencyKey("bad key with spaces!!"), false);
    assert.equal(isValidIdempotencyKey(null), false);
  });

  test("merchant reference format", () => {
    assert.equal(isValidMerchantReference(REF), true);
    assert.equal(isValidMerchantReference("hgyi_1762958400000_0123abcd"), true); // 001 format
    for (const bad of ["", "abc", "hgyi_1_x", `${REF}?txnref=1`, "../etc", "hgyi_1762958400000_ZZZZZZZZ"]) {
      assert.equal(isValidMerchantReference(bad), false, bad);
    }
  });

  test("toKobo", () => {
    assert.equal(toKobo(100), 10000);
    assert.equal(toKobo("100.50"), 10050);
    assert.equal(toKobo(2857.5), 285750);
    assert.equal(toKobo(100.001), null);
    assert.equal(toKobo("1e3"), null);
    assert.equal(toKobo(null), null);
  });
});

// ---------------------------------------------------------------------------
describe("idempotency fingerprint", () => {
  test("is stable for identical donations and changes with any field", () => {
    const r = validateDonationRequest(validBody);
    assert.ok(r.ok);
    if (!r.ok) return;
    const base = createRequestFingerprint(r.donation);
    assert.match(base, /^[a-f0-9]{64}$/);
    assert.equal(createRequestFingerprint({ ...r.donation }), base);
    assert.notEqual(createRequestFingerprint({ ...r.donation, amount: 10001 }), base);
    assert.notEqual(createRequestFingerprint({ ...r.donation, anonymous: true }), base);
    assert.notEqual(createRequestFingerprint({ ...r.donation, email: "x@y.co" }), base);
  });
});

// ---------------------------------------------------------------------------
describe("payment link response classification", () => {
  const docSuccess = {
    isSuccessful: true,
    error: null,
    data: {
      checkoutUrl: "https://checkout.globalpay.ng/pay?txnRef=552305106709XXXX",
      accessCode: "SMB85DAOE1",
      transactionReference: "552305106709XXXX",
    },
    successMessage: "Request was successful",
    responseCode: "0000",
  };

  test("documented 200 response => created", () => {
    const r = classifyInitializationResponse(200, docSuccess);
    assert.equal(r.kind, "created");
    if (r.kind === "created") assert.equal(r.globalPayReference, "552305106709XXXX");
  });

  test("documented 400 response => rejected (no link exists)", () => {
    const r = classifyInitializationResponse(400, {
      data: null,
      successMessage: null,
      responseCode: null,
      isSuccessful: false,
      error: { responseCode: "E01", responseDescription: "x", data: null },
    });
    assert.deepEqual(r, { kind: "rejected", providerResponseCode: "E01" });
  });

  test("5xx, timeouts, rate limits and garbage => unknown (never retried automatically)", () => {
    assert.equal(classifyInitializationResponse(500, { isSuccessful: false }).kind, "unknown");
    assert.equal(classifyInitializationResponse(429, { isSuccessful: false }).kind, "unknown");
    assert.equal(classifyInitializationResponse(200, null).kind, "unknown");
    assert.equal(classifyInitializationResponse(200, { ...docSuccess, responseCode: "9999" }).kind, "unknown");
  });

  test("checkout URL must be https://checkout.globalpay.ng", () => {
    for (const url of [
      "http://checkout.globalpay.ng/pay",
      "https://checkout.globalpay.ng.evil.com/pay",
      "https://evil.com/?checkout.globalpay.ng",
      "https://user:pw@checkout.globalpay.ng/pay",
      "javascript:alert(1)",
    ]) {
      assert.equal(isValidCheckoutUrl(url), false, url);
      const r = classifyInitializationResponse(200, {
        ...docSuccess,
        data: { ...docSuccess.data, checkoutUrl: url },
      });
      assert.equal(r.kind, "unknown", url);
    }
  });
});

// ---------------------------------------------------------------------------
describe("requery evaluation", () => {
  test("documented successful transaction => successful", () => {
    const r = evaluateRequeryResponse(200, requeryBody(), expected);
    assert.equal(r.kind, "successful");
    if (r.kind === "successful") {
      assert.equal(r.amountFromMerchant, 10000);
      assert.equal(r.currency, "NGN");
    }
  });

  test("Failed => failed", () => {
    const r = evaluateRequeryResponse(200, requeryBody({ transactionStatus: "Failed" }), expected);
    assert.equal(r.kind, "failed");
  });

  test("Pending / unknown / undocumented statuses => pending, never success", () => {
    for (const s of ["Pending", "Processing", "success", "SUCCESS ", "Approved", "", null]) {
      const r = evaluateRequeryResponse(200, requeryBody({ transactionStatus: s }), expected);
      assert.notEqual(r.kind, "successful", String(s));
    }
  });

  test("responseCode 0000 / ZEN0000 is not treated as success", () => {
    for (const responseCode of ["0000", "ZEN0000"]) {
      const body = { ...requeryBody({ transactionStatus: "Pending" }), responseCode };
      assert.notEqual(evaluateRequeryResponse(200, body, expected).kind, "successful");
    }
  });

  test("amount mismatch => mismatch", () => {
    for (const o of [
      { amountFromMerchant: 100, amountPaid: 100 },
      { amountFromMerchant: 10000, amountPaid: 9999.99 },
      { amountFromMerchant: "abc", amountPaid: 10000 },
      { amountFromMerchant: null, amountPaid: null },
    ]) {
      const r = evaluateRequeryResponse(200, requeryBody(o), expected);
      assert.equal(r.kind, "mismatch", JSON.stringify(o));
    }
  });

  test("ChargeMerchant requires amountPaid == amountFromMerchant", () => {
    const r = evaluateRequeryResponse(200, requeryBody({ amountPaid: 10100 }), expected);
    assert.equal(r.kind, "mismatch");
  });

  test("ChargeCustomer allows amountPaid = amountFromMerchant + charges", () => {
    const ok = evaluateRequeryResponse(
      200,
      requeryBody({ chargeBearer: "ChargeCustomer", amountPaid: 10107.5, totalCharge: 107.5 }),
      expected,
    );
    assert.equal(ok.kind, "successful");
    const bad = evaluateRequeryResponse(
      200,
      requeryBody({ chargeBearer: "ChargeCustomer", amountPaid: 9000 }),
      expected,
    );
    assert.equal(bad.kind, "mismatch");
  });

  test("currency mismatch => mismatch", () => {
    for (const currency of ["USD", "ngn ", null, "NGN | USD | EUR | GBP"]) {
      const r = evaluateRequeryResponse(200, requeryBody({ currency }), expected);
      if (currency === "ngn ") assert.equal(r.kind, "successful");
      else assert.equal(r.kind, "mismatch", String(currency));
    }
  });

  test("another transaction's reference => mismatch", () => {
    const r = evaluateRequeryResponse(200, requeryBody({ merchantTxnref: "hgyi_1_other" }), expected);
    assert.equal(r.kind, "mismatch");
  });

  test("provider errors are never success", () => {
    assert.equal(evaluateRequeryResponse(500, requeryBody(), expected).kind, "unavailable");
    assert.equal(evaluateRequeryResponse(405, requeryBody(), expected).kind, "unavailable");
    assert.equal(evaluateRequeryResponse(401, requeryBody(), expected).kind, "unavailable");
    assert.equal(evaluateRequeryResponse(200, null, expected).kind, "unavailable");
    assert.equal(
      evaluateRequeryResponse(200, { ...requeryBody(), data: [requeryBody().data] }, expected).kind,
      "unavailable",
    );
    assert.equal(
      evaluateRequeryResponse(400, { isSuccessful: false, data: null, error: {} }, expected).kind,
      "pending",
    );
    assert.equal(
      evaluateRequeryResponse(200, { ...requeryBody(), isSuccessful: false }, expected).kind,
      "pending",
    );
  });
});

// ---------------------------------------------------------------------------
// Verification workflow with an in-memory fake of the database RPCs.
// The fake mirrors the SQL semantics (row lock, throttle, idempotent
// completion) closely enough to test the application-level flow; the real SQL
// is tested separately against PostgreSQL.

type Row = { reference: string; amount: number; status: string; lastRequery: number | null };

function harness(rows: Row[], provider: (ref: string) => { httpStatus: number; body: unknown } | Error) {
  const db = new Map(rows.map((r) => [r.reference, { ...r }]));
  const calls = { begin: 0, provider: 0, complete: 0, record: [] as unknown[] };
  let now = 1_000_000;

  const deps: VerificationDeps = {
    async beginRequery(ref, minInterval): Promise<BeginRequeryResult> {
      calls.begin++;
      const row = db.get(ref);
      if (!row) return { found: false };
      const base = { found: true as const, merchant_reference: ref, amount: row.amount, status: row.status };
      if (row.status === "successful") return { ...base, allowed: false, reason: "already_successful" };
      if (["failed", "expired"].includes(row.status)) return { ...base, allowed: false, reason: "terminal" };
      if (row.lastRequery !== null && row.lastRequery > now - minInterval * 1000) {
        return { ...base, allowed: false, reason: "throttled" };
      }
      row.lastRequery = now;
      return { ...base, allowed: true, reason: "allowed" };
    },
    async queryProvider(ref) {
      calls.provider++;
      const r = provider(ref);
      if (r instanceof Error) throw r;
      return r;
    },
    async completePayment(args) {
      calls.complete++;
      const row = db.get(args.merchantReference);
      if (!row || args.amountFromMerchant !== row.amount) return false;
      row.status = "successful";
      return true;
    },
    async recordResult(args) {
      calls.record.push(args);
      const row = db.get(args.merchantReference);
      if (row && args.paymentFailed && row.status !== "successful") row.status = "payment_failed";
    },
    log() {},
  };

  return { deps, db, calls, advance: (ms: number) => (now += ms) };
}

const initialized = (): Row => ({ reference: REF, amount: 10000, status: "initialized", lastRequery: null });

describe("verification workflow", () => {
  test("fabricated / malformed reference never reaches the database or provider", async () => {
    const h = harness([initialized()], () => ({ httpStatus: 200, body: requeryBody() }));
    for (const ref of [undefined, "", "anything", `${REF}' or 1=1`, ["a"]]) {
      const r = await verifyDonation(ref, h.deps);
      assert.equal(r.state, "invalid_reference");
    }
    assert.equal(h.calls.begin, 0);
    assert.equal(h.calls.provider, 0);
  });

  test("well-formed but unknown reference => not_found, provider not called", async () => {
    const h = harness([initialized()], () => ({ httpStatus: 200, body: requeryBody() }));
    const r = await verifyDonation("hgyi_1762958400000_ffffffffffffffff", h.deps);
    assert.equal(r.state, "not_found");
    assert.equal(h.calls.provider, 0);
  });

  test("successful payment is completed once; repeat verifications are safe", async () => {
    const h = harness([initialized()], () => ({ httpStatus: 200, body: requeryBody() }));
    const first = await verifyDonation(REF, h.deps);
    assert.deepEqual(first, { state: "successful", reference: REF, amount: 10000 });
    const second = await verifyDonation(REF, h.deps);
    assert.equal(second.state, "successful");
    assert.equal(h.calls.complete, 1);
    assert.equal(h.calls.provider, 1, "already-successful donations are not requeried");
  });

  test("amount reported is our database amount, not the provider's", async () => {
    const h = harness([initialized()], () => ({
      httpStatus: 200,
      body: requeryBody({ chargeBearer: "ChargeCustomer", amountPaid: 10107.5 }),
    }));
    const r = await verifyDonation(REF, h.deps);
    assert.equal(r.amount, 10000);
  });

  test("pending payment stays pending and is throttled", async () => {
    const h = harness([initialized()], () => ({
      httpStatus: 200,
      body: requeryBody({ transactionStatus: "Pending" }),
    }));
    assert.equal((await verifyDonation(REF, h.deps)).state, "pending");
    assert.equal((await verifyDonation(REF, h.deps)).state, "pending");
    assert.equal(h.calls.provider, 1, "second call within interval is throttled");
    h.advance(11_000);
    await verifyDonation(REF, h.deps);
    assert.equal(h.calls.provider, 2);
    assert.equal(h.db.get(REF)?.status, "initialized");
  });

  test("failed payment is recorded as payment_failed", async () => {
    const h = harness([initialized()], () => ({
      httpStatus: 200,
      body: requeryBody({ transactionStatus: "Failed" }),
    }));
    assert.equal((await verifyDonation(REF, h.deps)).state, "failed");
    assert.equal(h.db.get(REF)?.status, "payment_failed");
    assert.equal(h.calls.complete, 0);
  });

  test("a later Successful requery overrides an earlier Failed one", async () => {
    let status = "Failed";
    const h = harness([initialized()], () => ({
      httpStatus: 200,
      body: requeryBody({ transactionStatus: status }),
    }));
    await verifyDonation(REF, h.deps);
    status = "Successful";
    h.advance(11_000);
    assert.equal((await verifyDonation(REF, h.deps)).state, "successful");
  });

  test("amount or currency mismatch => needs_review, never successful", async () => {
    for (const o of [{ amountFromMerchant: 100, amountPaid: 100 }, { currency: "USD" }]) {
      const h = harness([initialized()], () => ({ httpStatus: 200, body: requeryBody(o) }));
      const r = await verifyDonation(REF, h.deps);
      assert.equal(r.state, "needs_review");
      assert.equal(h.calls.complete, 0);
      assert.equal(h.db.get(REF)?.status, "initialized");
    }
  });

  test("database refusing completion => needs_review", async () => {
    const h = harness([initialized()], () => ({ httpStatus: 200, body: requeryBody() }));
    h.deps.completePayment = async () => false;
    assert.equal((await verifyDonation(REF, h.deps)).state, "needs_review");
  });

  test("provider timeout / outage => unavailable, state unchanged", async () => {
    const err = new Error("timeout");
    err.name = "TimeoutError";
    const h = harness([initialized()], () => err);
    assert.equal((await verifyDonation(REF, h.deps)).state, "unavailable");
    assert.equal(h.db.get(REF)?.status, "initialized");
  });

  test("database outage => unavailable", async () => {
    const h = harness([initialized()], () => ({ httpStatus: 200, body: requeryBody() }));
    h.deps.beginRequery = async () => {
      throw new Error("db down");
    };
    assert.equal((await verifyDonation(REF, h.deps)).state, "unavailable");
    assert.equal(h.calls.provider, 0);
  });

  test("initialization-failed donations are not requeried", async () => {
    const h = harness([{ ...initialized(), status: "failed" }], () => ({ httpStatus: 200, body: requeryBody() }));
    assert.equal((await verifyDonation(REF, h.deps)).state, "failed");
    assert.equal(h.calls.provider, 0);
  });
});

// ---------------------------------------------------------------------------
describe("webhook decryption", () => {
  const key = "ABCDEFGHIJKLMNOP"; // 16 chars, as documented

  function encrypt(payload: unknown, k = key) {
    const iv = randomBytes(16);
    const c = createCipheriv("aes-128-cbc", Buffer.from(k, "utf8"), iv);
    const ct = Buffer.concat([c.update(JSON.stringify(payload), "utf8"), c.final()]);
    return Buffer.concat([iv, ct]).toString("base64");
  }

  test("decrypts the documented format and extracts our reference", () => {
    const payload = { MerchantTransactionreference: REF, Status: "Successful", Amount: 10000 };
    const out = decryptWebhookPayload(encrypt(payload), key);
    assert.equal(webhookMerchantReference(out), REF);
  });

  test("wrong key, garbage, or bad key length throws", () => {
    assert.throws(() => decryptWebhookPayload(encrypt({ a: 1 }, "ZZZZZZZZZZZZZZZZ"), key));
    assert.throws(() => decryptWebhookPayload("not base64!!", key));
    assert.throws(() => decryptWebhookPayload(123, key));
    assert.throws(() => decryptWebhookPayload(encrypt({ a: 1 }), "short"));
  });
});
