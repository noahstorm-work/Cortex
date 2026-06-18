import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "./server";

/**
 * Authentication helper for Next.js API routes.
 *
 * Creates a server-side Supabase client and verifies the current user session.
 * Returns either the authenticated user/client pair or a 401 JSON response.
 *
 * @example
 * ```ts
 * // In an API route:
 * const { user, supabase, response } = await requireAuth()
 * if (response) return response // 401 Unauthorized
 * // Use supabase with authenticated user context
 * ```
 *
 * @returns An object containing:
 *   - `supabase` - The authenticated Supabase client, or `null` if unauthenticated
 *   - `user` - The authenticated Supabase user, or `null` if unauthenticated
 *   - `response` - A 401 NextResponse if unauthenticated, or `null` if authenticated
 */
export async function requireAuth() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return {
      supabase: null,
      user: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  return { supabase, user, response: null };
}
