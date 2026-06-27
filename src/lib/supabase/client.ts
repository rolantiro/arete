import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for use in Client Components ("use client").
 * Reads the public URL + anon key — safe to expose to the browser
 * because all write access is gated by RLS policies (see
 * supabase/migrations/0002_rls_policies.sql).
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    throw new Error(
      "Supabase belum terkonfigurasi: NEXT_PUBLIC_SUPABASE_URL atau " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY tidak ditemukan di environment " +
        "variables. Cek Project Settings > Environment Variables di Vercel."
    );
  }

  return createBrowserClient(url, anonKey);
}
