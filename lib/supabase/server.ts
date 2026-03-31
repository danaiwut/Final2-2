import { createServerClient } from "@supabase/ssr"
import { cookies, headers } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()
  const headerStore = await headers()

  const authHeader = headerStore.get("authorization")
  const accessToken = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null

  // ถ้ามี Bearer token ให้ใช้ admin client แทน
  if (accessToken) {
    const { createClient: createSupabaseClient } = await import("@supabase/supabase-js")
    return createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      }
    )
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

export { createClient as createServerClient }