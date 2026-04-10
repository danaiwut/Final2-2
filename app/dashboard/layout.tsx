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
      <div className="flex flex-1 flex-col pl-64">
        <AdSpace placement="header" />
        <main className="flex-1">{children}</main>
        <AdSpace placement="footer" />
      </div>
    </div>
  )
}
