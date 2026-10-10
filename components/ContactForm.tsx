"use client";

import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-lg border border-forest-200 bg-forest-50 p-8 text-center">
        <h3 className="text-xl font-semibold text-forest-800">
          Message Sent
        </h3>
        <p className="mt-2 text-stone-warm">
          Thank you for reaching out. We&rsquo;ll get back to you as soon as
          possible.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-forest-800">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full rounded-md border-2 border-forest-200 px-4 py-3 text-base focus-visible:outline-[3px] focus-visible:outline-gold-500"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-forest-800">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-md border-2 border-forest-200 px-4 py-3 text-base focus-visible:outline-[3px] focus-visible:outline-gold-500"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-forest-800">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className="w-full rounded-md border-2 border-forest-200 px-4 py-3 text-base focus-visible:outline-[3px] focus-visible:outline-gold-500"
          />
        </div>
        <div>
          <label htmlFor="subject" className="mb-1.5 block text-sm font-semibold text-forest-800">
            Subject
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            required
            className="w-full rounded-md border-2 border-forest-200 px-4 py-3 text-base focus-visible:outline-[3px] focus-visible:outline-gold-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-semibold text-forest-800">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="w-full rounded-md border-2 border-forest-200 px-4 py-3 text-base focus-visible:outline-[3px] focus-visible:outline-gold-500"
        />
      </div>

      {status === "error" && (
        <p role="alert" className="rounded-md bg-gold-100 px-4 py-3 text-sm font-medium text-forest-800">
          Something went wrong. Please try again, or email us directly.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-forest-700 px-7 py-3.5 text-lg font-bold text-white transition-colors hover:bg-forest-600 disabled:opacity-60 sm:w-auto"
      >
        {status === "loading" && <Loader2 className="animate-spin" size={20} aria-hidden />}
        Send Message
      </button>
    </form>
  );
}
