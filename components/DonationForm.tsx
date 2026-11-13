"use client";

import { FormEvent, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { DonationAmountSelector } from "./DonationAmountSelector";

type PaymentResponse = {
  authorizationUrl?: string;
  reference?: string;
  requestId?: string;
  error?: string;
  code?: string;
};

type IdempotencyRequest = {
  fingerprint: string;
  key: string;
};

export function DonationForm() {
  const [amount, setAmount] = useState<number | "custom" | null>(10000);
  const [customAmount, setCustomAmount] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);

  const [status, setStatus] = useState<
    "idle" | "loading" | "unavailable" | "error"
  >("idle");

  const [errorMsg, setErrorMsg] = useState("");

  // Reuse the same key when retrying the same donation.
  const idempotencyRef = useRef<IdempotencyRequest | null>(null);

  // Prevent multiple submissions from this component at once.
  const submittingRef = useRef(false);

  // Calculate the final donation amount.
  const finalAmount =
    amount === "custom" ? Number(customAmount) : amount;

  // ---------------------------------------------------------------------------
  // Submit donation
  // ---------------------------------------------------------------------------

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (submittingRef.current) return;

    setErrorMsg("");
    setStatus("idle");

    // Validate amount.
    if (
      !finalAmount ||
      !Number.isFinite(finalAmount) ||
      finalAmount < 100 ||
      finalAmount > 999999.99 ||
      Math.abs(finalAmount * 100 - Math.round(finalAmount * 100)) > 1e-8
    ) {
      setErrorMsg(
        "Please enter a valid donation amount between ₦100 and ₦999,999.99."
      );
      setStatus("error");
      return;
    }

    // Validate donor details.
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg("Please fill in your name, email and phone number.");
      setStatus("error");
      return;
    }

    if (fullName.trim().length > 100) {
      setErrorMsg("Your name cannot exceed 100 characters.");
      setStatus("error");
      return;
    }

    // Validate phone number.
    if (!/^\d{11}$/.test(phone.trim())) {
      setErrorMsg(
        "Please enter your 11-digit phone number, e.g. 08012345678."
      );
      setStatus("error");
      return;
    }

    // Validate address.
    if (address.trim().length <= 5 || address.trim().length > 300) {
      setErrorMsg(
        "Please enter a valid address (6 to 300 characters)."
      );
      setStatus("error");
      return;
    }

    // Validate email.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg("Please enter a valid email address.");
      setStatus("error");
      return;
    }

    // Validate optional message.
    if (message.trim().length > 500) {
      setErrorMsg("Your message cannot exceed 500 characters.");
      setStatus("error");
      return;
    }

    // -------------------------------------------------------------------------
    // Prepare one-time donation request
    // -------------------------------------------------------------------------

    const donationPayload = {
      // Normalize to 2 decimal places (kobo) to avoid float artefacts.
      amount: Math.round(finalAmount * 100) / 100,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      message: message.trim(),
      anonymous,
    };

    // Create a fingerprint to identify the donation details.
    const fingerprint = JSON.stringify(donationPayload);

    // Reuse the existing key if the donor is retrying the same donation.
    // Generate a new key if the donation details have changed.
    if (
      !idempotencyRef.current ||
      idempotencyRef.current.fingerprint !== fingerprint
    ) {
      idempotencyRef.current = {
        fingerprint,
        key: crypto.randomUUID(),
      };
    }

    const idempotencyKey = idempotencyRef.current.key;

    // -------------------------------------------------------------------------
    // Initialize payment
    // -------------------------------------------------------------------------

    submittingRef.current = true;
    setStatus("loading");

    try {
      const res = await fetch("/api/donate/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify(donationPayload),
      });

      const data = (await res
        .json()
        .catch(() => null)) as PaymentResponse | null;

      console.log("Donation initialization:", {
        status: res.status,
        requestId: data?.requestId,
        success: res.ok,
      });

      // Payment configuration missing.
      if (res.status === 501) {
        setStatus("unavailable");
        return;
      }

      // The server says this key can never succeed (payment failed, provider
      // rejected the request, or it was already paid). Drop the key so the
      // next submit starts a genuinely new donation attempt. All other
      // failures keep the key, so a retry cannot create a second payment.
      if (data?.code === "new_attempt_required" || data?.code === "already_paid") {
        idempotencyRef.current = null;
      }

      // Handle failed initialization.
      if (!res.ok || !data?.authorizationUrl) {
        setStatus("error");

        setErrorMsg(
          data?.error ||
            "We couldn't start your donation. Please try again."
        );

        return;
      }

      // Redirect donor to GlobalPay checkout.
      window.location.assign(data.authorizationUrl);
    } catch (error) {
      console.error("Donation request failed:", error);

      setStatus("error");

      setErrorMsg(
        "A network error occurred. Please check your connection and try again."
      );
    } finally {
      submittingRef.current = false;
    }
  }


  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      {/* Donation Amount (one-time donations only) */}

      <fieldset>
        <legend className="mb-3 text-sm font-bold uppercase tracking-wide text-forest-700">
          Select Amount
        </legend>
        <DonationAmountSelector
          selected={amount}
          customAmount={customAmount}
          onSelect={setAmount}
          onCustomAmountChange={setCustomAmount}
        />
      </fieldset>

      {/* Donor Details */}

      <fieldset className="space-y-4">
        <legend className="mb-1 text-sm font-bold uppercase tracking-wide text-forest-700">
          Your Details
        </legend>

        {/* Full Name */}

        <div>
          <label
            htmlFor="fullName"
            className="mb-1.5 block text-sm font-semibold text-forest-800"
          >
            Full Name
          </label>

          <input
            id="fullName"
            type="text"
            required
            autoComplete="name"
            maxLength={100}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-md border-2 border-forest-200 px-4 py-3 text-base focus-visible:outline-none"
          />
        </div>

        {/* Email and Phone */}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-semibold text-forest-800"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              maxLength={254}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border-2 border-forest-200 px-4 py-3 text-base focus-visible:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-1.5 block text-sm font-semibold text-forest-800"
            >
              Phone Number
            </label>

            <input
              id="phone"
              type="tel"
              required
              inputMode="numeric"
              autoComplete="tel"
              maxLength={11}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08012345678"
              className="w-full rounded-md border-2 border-forest-200 px-4 py-3 text-base focus-visible:outline-none"
            />
          </div>
        </div>

        {/* Address */}

        <div>
          <label
            htmlFor="address"
            className="mb-1.5 block text-sm font-semibold text-forest-800"
          >
            Address
          </label>

          <input
            id="address"
            type="text"
            required
            autoComplete="street-address"
            maxLength={300}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your residential or business addresss"
            className="w-full rounded-md border-2 border-forest-200 px-4 py-3 text-base focus-visible:outline-none"
          />
        </div>

        {/* Optional Message */}

        <div>
          <label
            htmlFor="message"
            className="mb-1.5 block text-sm font-semibold text-forest-800"
          >
            Optional Message
          </label>

          <textarea
            id="message"
            rows={3}
            maxLength={500}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-md border-2 border-forest-200 px-4 py-3 text-base focus-visible:outline-none"
          />
        </div>

        {/* Anonymous Donation */}

        <label className="flex items-center gap-3 text-[15px] font-medium text-forest-800">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            className="h-5 w-5 rounded border-2 border-forest-300 text-forest-700 focus-visible:outline-none"
          />

          Make my donation anonymous
        </label>
      </fieldset>

      {/* Error Message */}

      {errorMsg && (
        <p
          role="alert"
          className="rounded-md bg-gold-100 px-4 py-3 text-sm font-medium text-forest-800"
        >
          {errorMsg}
        </p>
      )}

      {/* Payment Unavailable */}

      {status === "unavailable" && (
        <p
          role="alert"
          className="rounded-md bg-gold-100 px-4 py-3 text-sm leading-relaxed text-forest-800"
        >
          Online card payment is being finalized. In the meantime, please use
          the <strong>Bank Transfer</strong> details below, or reach us at{" "}
          <strong>{"[TO BE PROVIDED]"}</strong> to complete your donation.
        </p>
      )}

      {/* Submit Button */}

      <button
        type="submit"
        disabled={status === "loading"}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-gold-500 px-6 py-4 text-lg font-bold text-forest-900 transition-colors hover:bg-gold-400 disabled:opacity-60"
      >
        {status === "loading" && (
          <Loader2
            className="animate-spin"
            size={20}
            aria-hidden
          />
        )}

        {status === "loading"
          ? "Initializing Payment..."
          : "Donate Securely"}
      </button>

      <p className="text-center text-xs text-stone-warm">
        Payments are processed securely. We never store your card details.
      </p>
    </form>
  );
}
