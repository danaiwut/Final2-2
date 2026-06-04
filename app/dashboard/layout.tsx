import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { AdSpace } from "@/components/ads/ad-space"
import { SidebarProvider } from "@/components/ui/sidebar"

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
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#FDFAF6]">
        <DashboardSidebar user={user} profile={profile} />
        <div className="flex min-w-0 flex-1 flex-col w-full overflow-x-hidden">
          <AdSpace placement="header" />
          
          <div className="flex min-w-0 flex-1 items-start">
            {/* Universal Left Sidebar Ad */}
            <div className="hidden xl:block shrink-0 px-6 max-w-[280px]">
              <AdSpace placement="sidebar_left" className="sticky top-6 mt-6" />
            </div>
            
            <main className="min-w-0 flex flex-1 w-full flex-col">
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
    </SidebarProvider>
  )
}
