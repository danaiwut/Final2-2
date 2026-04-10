import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isVerifiedCompany } from "@/lib/auth/admin"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_name")
      .eq("id", user.id)
      .single()

    const { data: jobs, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("company_user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ jobs })
  } catch (error) {
    console.error("Error fetching company jobs:", error)
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !(await isVerifiedCompany(user.id))) {
      return NextResponse.json(
        { error: "Only verified companies can post jobs" },
        { status: 403 }
      )
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_name")
      .eq("id", user.id)
      .single()

    const body = await request.json()

    const { data, error } = await supabase
      .from("jobs")
      .insert({
        ...body,
        company: profile?.company_name || body.company,
        company_user_id: user.id,
        is_active: true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error creating job:", error)
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 })
  }
}
