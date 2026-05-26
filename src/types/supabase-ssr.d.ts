declare module "@supabase/ssr" {
  import { SupabaseClient } from "@supabase/supabase-js"

  interface CookieOptions {
    name: string
    value: string
    options?: {
      domain?: string
      path?: string
      maxAge?: number
      secure?: boolean
      httpOnly?: boolean
      sameSite?: "lax" | "strict" | "none"
    }
  }

  export function createBrowserClient(
    supabaseUrl: string,
    supabaseKey: string
  ): SupabaseClient

  export function createServerClient(
    supabaseUrl: string,
    supabaseKey: string,
    options: {
      cookies: {
        getAll(): { name: string; value: string }[]
        setAll(cookies: CookieOptions[]): void
      }
    }
  ): SupabaseClient
}
