"use client";

import { FormEvent, useState } from "react";

export function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [email, setEmail] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p className="mt-4 rounded-md bg-forest-700 px-4 py-3 text-sm font-medium text-white">
        Thank you — you&rsquo;re subscribed.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4" noValidate>
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className="w-full rounded-md border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-sage-light/60 focus-visible:outline-[3px] focus-visible:outline-gold-400"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="shrink-0 rounded-md bg-gold-500 px-5 py-2.5 text-sm font-semibold text-forest-900 transition-colors hover:bg-gold-400 disabled:opacity-60"
        >
          {status === "loading" ? "Subscribing…" : "Subscribe"}
        </button>
      </div>
      {status === "error" && (
        <p className="mt-2 text-sm text-gold-300">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}
