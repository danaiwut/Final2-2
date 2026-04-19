import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") || "/dashboard"

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    await supabase.auth.exchangeCodeForSession(code)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("role, full_name, company_name")
        .eq("id", user.id)
        .maybeSingle()

      const inferredRole = existingProfile?.role || (user.user_metadata?.role === "company" ? "company" : "user")
      const fullName =
        existingProfile?.full_name ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "User"

      await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email,
        full_name: fullName,
        role: inferredRole,
        company_name: existingProfile?.company_name || user.user_metadata?.company_name || null,
        company_registration_number: user.user_metadata?.company_registration_number || null,
        company_website: user.user_metadata?.company_website || null,
        company_phone: user.user_metadata?.company_phone || null,
        updated_at: new Date().toISOString(),
      })
    }
  }

  return NextResponse.redirect(new URL(next, request.url))
}
