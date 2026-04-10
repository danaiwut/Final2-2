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

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    // Only regular users can apply for jobs
    if (profile?.role !== "user") {
      return NextResponse.json({ error: "Only users can apply for jobs" }, { status: 403 })
    }

    const body = await request.json()
    const { jobId, resumeId, coverLetter } = body

    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 })
    }

    // Check if already applied
    const { data: existing } = await supabase
      .from("job_applications")
      .select("id")
      .eq("job_id", jobId)
      .eq("user_id", user.id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: "You have already applied for this job" }, { status: 409 })
    }

    const { data, error } = await supabase
      .from("job_applications")
      .insert({
        job_id: jobId,
        user_id: user.id,
        resume_id: resumeId || null,
        cover_letter: coverLetter || null,
        status: "pending",
      })
      .select()
      .single()

    if (error) throw error

    // Get job info for notification
    const { data: job } = await supabase
      .from("jobs")
      .select("title, company_user_id")
      .eq("id", jobId)
      .single()

    // Notify the company
    if (job?.company_user_id) {
      const { data: applicantProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single()

      await supabase.from("notifications").insert({
        user_id: job.company_user_id,
        type: "job_application",
        title: "New Job Application",
        message: `${applicantProfile?.full_name || "Someone"} applied for "${job.title}"`,
        link: "/dashboard/company/applications",
        metadata: { job_id: jobId, applicant_id: user.id },
      })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error applying for job:", error)
    return NextResponse.json({ error: "Failed to apply" }, { status: 500 })
  }
}
