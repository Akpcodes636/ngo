import { NextResponse } from "next/server";

// Stub newsletter signup endpoint. Wire this up to a real provider
// (e.g. Mailchimp, Brevo, ConvertKit) when credentials are available.
// No secrets are referenced here — any API key must be read from a
// server-only environment variable when the integration is implemented.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";

  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { error: "A valid email address is required." },
      { status: 400 }
    );
  }

  // TODO: forward `email` to the newsletter provider once configured.

  return NextResponse.json({ success: true });
}
