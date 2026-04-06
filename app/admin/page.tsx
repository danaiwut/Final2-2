import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth/admin"
import { AdminStatsCards } from "@/components/admin/admin-stats-cards"
import { UsersTable } from "@/components/admin/users-table"
import { AdminAnalyticsCharts } from "@/components/admin/admin-analytics-charts"

export default async function AdminPage() {
  const { user, profile } = await requireAdmin()
  const supabase = await createClient()

  // Fetch admin stats
  const { data: allUsers } = await supabase.from("profiles").select("*")

  const { data: allPersonas } = await supabase.from("personas").select("*")

  const { data: allMessages } = await supabase.from("chat_messages").select("*")

  const { data: analytics } = await supabase.from("analytics").select("*").order("date", { ascending: false }).limit(30)

  const { data: allPosts } = await supabase.from("community_posts").select("*")
  const { data: allAds } = await supabase.from("ads").select("*")

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="font-['Playfair_Display'] text-2xl font-bold text-[#3B2A1A]">Admin Dashboard</h1>
          <p className="text-sm text-[#9B8577]">System overview and user management</p>
        </div>

          <AdminStatsCards
            usersCount={allUsers?.length || 0}
            personasCount={allPersonas?.length || 0}
            messagesCount={allMessages?.length || 0}
            postsCount={allPosts?.length || 0}
            adsCount={allAds?.length || 0}
            analytics={analytics || []}
          />

          <AdminAnalyticsCharts
            data={analytics || []}
            users={allUsers || []}
            personas={allPersonas || []}
            messages={allMessages || []}
          />

          <div className=" w-full">
            <div className="lg:col-span-2">
              <UsersTable users={allUsers || []} />
            </div>
          </div>
      </div>
    </div>
  )
}
