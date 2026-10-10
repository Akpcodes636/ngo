import { NextResponse } from "next/server";

// ----------------------------------------------------------------------------
// Donation initialization endpoint.
// ----------------------------------------------------------------------------
// This route is the single place that talks to Paystack. The secret key is
// read from a server-only environment variable (PAYSTACK_SECRET_KEY) and is
// NEVER sent to the browser. Until that key is configured, the endpoint
// responds with 501 so the donation form can gracefully point donors to the
// Bank Transfer option instead of pretending a payment succeeded.
//
// Flow once PAYSTACK_SECRET_KEY is set:
//   1. Validate the incoming donor + amount payload.
//   2. Call Paystack's /transaction/initialize with the secret key.
//   3. Persist a pending donation record (amount, donor info, reference) —
//      TODO: wire up a database/CMS write here.
//   4. Return { authorizationUrl } so the client redirects the donor to
//      Paystack's hosted checkout.
//   5. Paystack redirects back to /donate/success or /donate/failed.
//   6. The /api/donate/verify route (called from the success page) confirms
//      the transaction server-side before marking the donation complete and
//      triggering a confirmation email/receipt.
// ----------------------------------------------------------------------------

type DonationPayload = {
  amount: number;
  frequency: "one-time" | "monthly";
  fullName: string;
  email: string;
  phone: string;
  message?: string;
  anonymous?: boolean;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as DonationPayload | null;

  if (
    !body ||
    typeof body.amount !== "number" ||
    body.amount < 100 ||
    !body.fullName?.trim() ||
    !body.email?.trim() ||
    !body.phone?.trim()
  ) {
    return NextResponse.json(
      { error: "Missing or invalid donation details." },
      { status: 400 }
    );
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    return NextResponse.json(
      {
        error:
          "Online payment is not yet configured. Please use bank transfer or contact us directly.",
      },
      { status: 501 }
    );
  }

  const reference = `hgyi_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  try {
    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: body.email,
        amount: Math.round(body.amount * 100), // kobo
        reference,
        callback_url: `${new URL(request.url).origin}/donate/success`,
        metadata: {
          fullName: body.anonymous ? "Anonymous Donor" : body.fullName,
          phone: body.phone,
          frequency: body.frequency,
          message: body.message ?? "",
          anonymous: Boolean(body.anonymous),
        },
      }),
    });

    const data = await paystackRes.json();

    if (!paystackRes.ok || !data?.data?.authorization_url) {
      return NextResponse.json(
        { error: "Unable to initialize payment. Please try again." },
        { status: 502 }
      );
    }

    // TODO: persist a "pending" donation record keyed by `reference`.

    return NextResponse.json({
      authorizationUrl: data.data.authorization_url,
      reference,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to reach the payment provider. Please try again." },
      { status: 502 }
    );
  }
}
