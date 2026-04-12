import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { normalizeResumePayload } from "@/lib/resumes/normalize"

type ResumeRouteContext = {
  params: Promise<{ id: string }>
}

// GET - Fetch a specific resume
export async function GET(request: Request, context: ResumeRouteContext) {
  const { id } = await context.params
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role === "company") {
    return NextResponse.json({ error: "Company accounts cannot manage resumes" }, { status: 403 })
  }

  const { data: resume, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  return NextResponse.json({ resume })
}

// PUT - Update a resume
export async function PUT(request: Request, context: ResumeRouteContext) {
  const { id } = await context.params
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role === "company") {
    return NextResponse.json({ error: "Company accounts cannot manage resumes" }, { status: 403 })
  }

  const body = normalizeResumePayload(await request.json())

  const { data: resume, error } = await supabase
    .from("resumes")
    .update(body)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ resume })
}

// DELETE - Delete a resume
export async function DELETE(request: Request, context: ResumeRouteContext) {
  const { id } = await context.params
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role === "company") {
    return NextResponse.json({ error: "Company accounts cannot manage resumes" }, { status: 403 })
  }

  const { error } = await supabase
    .from("resumes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
