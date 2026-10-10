"use client";

import { FormEvent, useState } from "react";
import clsx from "clsx";
import { Loader2 } from "lucide-react";
import { DonationAmountSelector } from "./DonationAmountSelector";

type Frequency = "one-time" | "monthly";

export function DonationForm() {
  const [frequency, setFrequency] = useState<Frequency>("one-time");
  const [amount, setAmount] = useState<number | "custom" | null>(10000);
  const [customAmount, setCustomAmount] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "unavailable" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState("");

  const finalAmount = amount === "custom" ? Number(customAmount) : amount;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");

    if (!finalAmount || finalAmount < 100) {
      setErrorMsg("Please choose or enter a valid donation amount.");
      return;
    }
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg("Please fill in your name, email and phone number.");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/donate/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalAmount,
          frequency,
          fullName,
          email,
          phone,
          message,
          anonymous,
        }),
      });

      const data = await res.json();

      if (res.status === 501) {
        setStatus("unavailable");
        return;
      }
      if (!res.ok || !data.authorizationUrl) {
        setStatus("error");
        setErrorMsg(data.error || "We couldn't start your donation. Please try again.");
        return;
      }

      window.location.href = data.authorizationUrl;
    } catch {
      setStatus("error");
      setErrorMsg("A network error occurred. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      <fieldset>
        <legend className="mb-3 text-sm font-bold uppercase tracking-wide text-forest-700">
          Donation Frequency
        </legend>
        <div className="inline-flex rounded-md border-2 border-forest-200 p-1">
          {(["one-time", "monthly"] as Frequency[]).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={frequency === f}
              onClick={() => setFrequency(f)}
              className={clsx(
                "rounded px-6 py-2.5 text-sm font-bold capitalize transition-colors",
                frequency === f
                  ? "bg-forest-700 text-white"
                  : "text-forest-700 hover:bg-forest-50"
              )}
            >
              {f === "one-time" ? "One-Time" : "Monthly"}
            </button>
          ))}
        </div>
      </fieldset>

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

      <fieldset className="space-y-4">
        <legend className="mb-1 text-sm font-bold uppercase tracking-wide text-forest-700">
          Your Details
        </legend>

        <div>
          <label htmlFor="fullName" className="mb-1.5 block text-sm font-semibold text-forest-800">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-md border-2 border-forest-200 px-4 py-3 text-base focus-visible:outline-[3px] focus-visible:outline-gold-500"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-forest-800">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border-2 border-forest-200 px-4 py-3 text-base focus-visible:outline-[3px] focus-visible:outline-gold-500"
            />
          </div>
          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-forest-800">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-md border-2 border-forest-200 px-4 py-3 text-base focus-visible:outline-[3px] focus-visible:outline-gold-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="message" className="mb-1.5 block text-sm font-semibold text-forest-800">
            Optional Message
          </label>
          <textarea
            id="message"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-md border-2 border-forest-200 px-4 py-3 text-base focus-visible:outline-[3px] focus-visible:outline-gold-500"
          />
        </div>

        <label className="flex items-center gap-3 text-[15px] font-medium text-forest-800">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            className="h-5 w-5 rounded border-2 border-forest-300 text-forest-700 focus-visible:outline-[3px] focus-visible:outline-gold-500"
          />
          Make my donation anonymous
        </label>
      </fieldset>

      {errorMsg && (
        <p role="alert" className="rounded-md bg-gold-100 px-4 py-3 text-sm font-medium text-forest-800">
          {errorMsg}
        </p>
      )}

      {status === "unavailable" && (
        <p role="alert" className="rounded-md bg-gold-100 px-4 py-3 text-sm leading-relaxed text-forest-800">
          Online card payment is being finalized. In the meantime, please use
          the <strong>Bank Transfer</strong> details below, or reach us at{" "}
          <strong>{"[TO BE PROVIDED]"}</strong> to complete your donation.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-gold-500 px-6 py-4 text-lg font-bold text-forest-900 transition-colors hover:bg-gold-400 disabled:opacity-60"
      >
        {status === "loading" && <Loader2 className="animate-spin" size={20} aria-hidden />}
        Donate Securely
      </button>
      <p className="text-center text-xs text-stone-warm">
        Payments are processed securely. We never store your card details.
      </p>
    </form>
  );
}
