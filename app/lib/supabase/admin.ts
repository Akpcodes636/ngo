import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Service-role client. Bypasses RLS: must only ever be used on the server.
// "server-only" makes the build fail if a Client Component imports this file.
//
// Created lazily so a missing variable fails the request that needs it
// (returning a controlled error) instead of crashing module import/build.

let client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable.");
  }

  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable.");
  }

  client = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  return client;
}
