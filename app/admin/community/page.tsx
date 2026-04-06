import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth/admin"
import { AdminCommunityPosts } from "@/components/admin/admin-community-posts"

export default async function AdminCommunityPage() {
  const { user, profile } = await requireAdmin()
  const supabase = await createClient()

  // ========== SELECT ==========
  // ดึง post ทั้งหมดจากตาราง community_posts เรียงจากใหม่ไปเก่า
  const { data: posts } = await supabase
    .from("community_posts")
    .select("*")
    .order("created_at", { ascending: false })

  // ========== SELECT (batch) ==========
  // รวบรวม user_id ที่ไม่ซ้ำกันจากทุก post แล้วดึง profiles ทีเดียวในครั้งเดียว
  // แทนที่จะวนลูป query ทีละคน (แก้ปัญหา N+1 Query)
  const userIds = [...new Set((posts || []).map((post) => post.user_id))]

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", userIds) // SELECT ... WHERE id IN (id1, id2, id3, ...)

  // สร้าง Map สำหรับ lookup profile โดยใช้ user_id เป็น key เพื่อความเร็ว O(1)
  const profileMap = new Map((profiles || []).map((p) => [p.id, p]))

  // Merge post กับ profile โดยไม่ต้องยิง query เพิ่ม
  const postsWithProfiles = (posts || []).map((post) => ({
    ...post,
    profiles: profileMap.get(post.user_id) || null,
  }))

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="font-['Playfair_Display'] text-2xl font-bold text-[#3B2A1A]">Community Management</h1>
          <p className="text-sm text-[#9B8577]">View and manage all community posts</p>
        </div>

          <AdminCommunityPosts posts={postsWithProfiles} currentUserId={user.id} />
      </div>
    </div>
  )
}