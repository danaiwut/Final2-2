import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/auth/admin"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // ========== SELECT ==========
    // Check if the user is an admin
    const userIsAdmin = await isAdmin(user.id)

    if (!userIsAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { action, reason } = await request.json()
    const { id: postId } = await params

    // Fetch the post to get the user_id for notification
    const { data: post } = await supabase.from("community_posts").select("user_id, title").eq("id", postId).single()
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    if (action === "approve") {
      // ========== UPDATE ==========
      // อัปเดตสถานะ post เป็น "approved" และเปิด publish พร้อมบันทึกว่าใครรีวิวและเมื่อไหร่
      const { error } = await supabase
        .from("community_posts")
        .update({
          moderation_status: "approved",
          is_published: true,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
        })
        .eq("id", postId)

      if (error) {
        console.error("Error approving post:", error)
        return NextResponse.json({ error: "Failed to approve post" }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    } else if (action === "reject") {
      if (!reason) {
        return NextResponse.json({ error: "Rejection reason required" }, { status: 400 })
      }

      // ========== UPDATE ==========
      // อัปเดตสถานะ post เป็น "rejected" และปิด publish พร้อมบันทึกเหตุผลที่ปฏิเสธ
      const { error } = await supabase
        .from("community_posts")
        .update({
          moderation_status: "rejected",
          is_published: false,
          rejection_reason: reason,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
        })
        .eq("id", postId)

      if (error) {
        console.error("Error rejecting post:", error)
        return NextResponse.json({ error: "Failed to reject post" }, { status: 500 })
      }

      // Create notification for the user
      await supabase.from("notifications").insert({
        user_id: post.user_id,
        type: "post_rejected",
        title: "Post Rejected",
        message: `Your post "${post.title}" was rejected by an admin. Reason: ${reason}`,
        link: `/community/posts/${postId}`,
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error moderating post:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}