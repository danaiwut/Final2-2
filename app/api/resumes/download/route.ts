import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { resumeId, userId } = await request.json()

    if (!resumeId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data: resume } = await supabase
      .from("resumes")
      .select("id, user_id")
      .eq("id", resumeId)
      .eq("user_id", userId)
      .maybeSingle()

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    if (user.id === userId) {
      return NextResponse.json({ success: true, skipped: true })
    }

    // Get company name if downloader is a company
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_name, role")
      .eq("id", user.id)
      .single()

    const { data, error } = await supabase
      .from("resume_downloads")
      .insert({
        resume_id: resumeId,
        user_id: userId,
        downloaded_by: user.id,
        company_name: profile?.company_name || null,
      })
      .select()
      .single()

    if (error) throw error

    // Notify the resume owner
    await supabase.from("notifications").insert({
      user_id: userId,
      type: "persona_view",
      title: "Resume Downloaded",
      message: `${profile?.company_name || "Someone"} downloaded your resume`,
      link: "/dashboard/resumes/history",
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error tracking download:", error)
    return NextResponse.json({ error: "Failed to track download" }, { status: 500 })
  }
}
