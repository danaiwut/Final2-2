import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CommunityPersonas } from "@/components/community/community-personas"
import { CommunityPosts } from "@/components/community/community-posts"
import { CommunityChatSidebar } from "@/components/community/community-chat-sidebar"
import { AdSpace } from "@/components/ads/ad-space"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { Globe } from "lucide-react"

export default async function CommunityPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: personasData } = await supabase
    .from("personas")
    .select("*")
    .eq("visibility", "published")
    .order("views_count", { ascending: false })

  const publicPersonas = await Promise.all(
    (personasData || []).map(async (persona) => {
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, bio")
        .eq("id", persona.user_id)
        .maybeSingle()
      return { ...persona, profiles: userProfile }
    }),
  )

  const { data: postsData } = await supabase
    .from("community_posts")
    .select("*")
    .eq("is_published", true)
    .eq("moderation_status", "approved")
    .order("created_at", { ascending: false })
    .limit(50)

  const { data: userPendingPosts } = await supabase
    .from("community_posts")
    .select("*")
    .eq("user_id", user.id)
    .eq("moderation_status", "pending")
    .order("created_at", { ascending: false })

  const allPostsData = [...(postsData || []), ...(userPendingPosts || [])]

  const posts = await Promise.all(
    allPostsData.map(async (post) => {
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .eq("id", post.user_id)
        .maybeSingle()
      let personaData = null
      if (post.persona_id) {
        const { data } = await supabase.from("personas").select("id, name").eq("id", post.persona_id).maybeSingle()
        personaData = data
      }
      return { ...post, profiles: userProfile, personas: personaData }
    }),
  )

  return (
    <div className="flex min-h-screen bg-[#FDFAF6]">
      <DashboardSidebar user={user} profile={profile} />
      <div className="flex flex-1 flex-col pl-64">
        <main className="flex-1 p-6 md:p-8">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5EDE2]">
                <Globe className="h-5 w-5 text-[#A07850]" />
              </div>
              <div>
                <h1 className="font-['Playfair_Display'] text-2xl font-bold text-[#3B2A1A]">Community</h1>
                <p className="text-sm text-[#9B8577]">Discover personas and connect with professionals</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <AdSpace placement="banner" />
          </div>

          <Tabs defaultValue="personas" className="w-full">
            <TabsList className="border border-[#E8DDD1] bg-white">
              <TabsTrigger value="personas" className="data-[state=active]:bg-[#A07850] data-[state=active]:text-white">
                Personas
              </TabsTrigger>
              <TabsTrigger value="posts" className="data-[state=active]:bg-[#A07850] data-[state=active]:text-white">
                Posts
              </TabsTrigger>
            </TabsList>
            <TabsContent value="personas" className="mt-6">
              <CommunityPersonas personas={publicPersonas} />
            </TabsContent>
            <TabsContent value="posts" className="mt-6">
              <CommunityPosts posts={posts} currentUserId={user.id} />
            </TabsContent>
          </Tabs>
        </main>
        <CommunityChatSidebar currentUserId={user.id} />
      </div>
    </div>
  )
}
