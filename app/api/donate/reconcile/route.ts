import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { getSupabaseAdmin } from "@/app/lib/supabase/admin";
import {
  logPaymentEvent,
  verifyDonationPayment,
} from "@/app/lib/supabase/payments/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// GET /api/donate/reconcile
// Authorization: Bearer <CRON_SECRET>
//
// Requeries GlobalPay for recent donations that never reached a final state
// (donor closed the browser, webhook lost, unknown initialization result).
// Intended to be called by a scheduler (e.g. Vercel Cron every 15 minutes).
// Disabled (404) unless CRON_SECRET is set.

function secretsMatch(provided: string, expected: string): boolean {
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET?.trim();

  if (!expected || expected.length < 32) {
    return new NextResponse(null, { status: 404 });
  }

  const auth = request.headers.get("authorization") ?? "";
  const provided = auth.startsWith("Bearer ") ? auth.slice(7) : "";

  if (!secretsMatch(provided, expected)) {
    return new NextResponse(null, { status: 401 });
  }

  const { data, error } = await getSupabaseAdmin().rpc(
    "list_donations_to_reconcile",
    { p_limit: 25 },
  );

  if (error) {
    logPaymentEvent("reconcile_list_failed", { databaseCode: error.code });
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const rows = (data ?? []) as { merchant_reference: string }[];
  const summary: Record<string, number> = {};

  // Sequential on purpose: keeps load on GlobalPay low.
  for (const row of rows) {
    const outcome = await verifyDonationPayment(row.merchant_reference, {
      minIntervalSeconds: 0,
    });
    summary[outcome.state] = (summary[outcome.state] ?? 0) + 1;
  }

  logPaymentEvent("reconcile_completed", { checked: rows.length, summary });

  return NextResponse.json(
    { ok: true, checked: rows.length, summary },
    { headers: { "Cache-Control": "no-store" } },
  );
}
