import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/auth/admin"

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId, status } = await request.json()

    if (!userId || !["verified", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        verification_status: status,
        verification_reviewed_at: new Date().toISOString(),
        verification_reviewed_by: user.id,
      })
      .eq("id", userId)

    if (error) throw error

    // Create notification for the company user
    await supabase.from("notifications").insert({
      user_id: userId,
      type: "verification_status",
      title: status === "verified" ? "Company Verified! ✔" : "Verification Rejected",
      message:
        status === "verified"
          ? "Your company has been verified. You can now post jobs and access all premium features."
          : "Your company verification was rejected. Please update your documents and resubmit.",
      link: "/dashboard/company/verification",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing verification:", error)
    return NextResponse.json({ error: "Failed to process verification" }, { status: 500 })
  }
}
