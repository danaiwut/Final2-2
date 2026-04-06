import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProfileView } from "@/components/profile/profile-view"
import { ProfileStats } from "@/components/profile/profile-stats"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: personas } = await supabase.from("personas").select("*").eq("user_id", user.id)

  const { data: posts } = await supabase
    .from("community_posts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <ProfileView profile={profile} userId={user.id} />
      </div>
    </div>
  )
}
