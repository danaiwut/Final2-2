import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { AdSpace } from "@/components/ads/ad-space"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="flex min-h-screen bg-[#FDFAF6]">
      <DashboardSidebar user={user} profile={profile} />
      <div className="flex flex-1 flex-col pl-64 w-full">
        <AdSpace placement="header" />
        
        <div className="flex flex-1 justify-center items-start">
          {/* Universal Left Sidebar Ad */}
          <div className="hidden xl:block shrink-0 px-6 max-w-[280px]">
            <AdSpace placement="sidebar_left" className="sticky top-6 mt-6" />
          </div>
          
          <main className="flex-1 min-w-0 w-full max-w-[1200px]">
            {children}
          </main>

          {/* Universal Right Sidebar Ad */}
          <div className="hidden xl:block shrink-0 px-6 max-w-[280px]">
            <AdSpace placement="sidebar_right" className="sticky top-6 mt-6" />
          </div>
        </div>

        <AdSpace placement="footer" />
      </div>
    </div>
  )
}
