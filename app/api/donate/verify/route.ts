import { NextResponse } from "next/server";

// Verifies a Paystack transaction server-side using the secret key, then
// (once a database is connected) records the donation and triggers a
// confirmation email/receipt. Called from the /donate/success page.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.json({ error: "Missing reference." }, { status: 400 });
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { error: "Payment verification is not yet configured." },
      { status: 501 }
    );
  }

  try {
    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${secretKey}` } }
    );
    const data = await res.json();

    if (!res.ok || data?.data?.status !== "success") {
      return NextResponse.json({ verified: false }, { status: 200 });
    }

    // TODO: mark the donation record as complete in the database and
    // trigger a confirmation email/receipt to the donor.

    return NextResponse.json({ verified: true, amount: data.data.amount / 100 });
  } catch {
    return NextResponse.json(
      { error: "Unable to verify payment right now." },
      { status: 502 }
    );
  }
}
