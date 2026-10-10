import { NextResponse } from "next/server";

// Stub contact endpoint. Wire this up to an email service (e.g. Resend,
// SendGrid) or CRM when credentials are available. Any API key must be
// read from a server-only environment variable — never exposed client-side.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const { name, email, subject, message } = body ?? {};

  if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
    return NextResponse.json(
      { error: "All required fields must be filled in." },
      { status: 400 }
    );
  }

  // TODO: send the message via an email/CRM provider once configured.

  return NextResponse.json({ success: true });
}
