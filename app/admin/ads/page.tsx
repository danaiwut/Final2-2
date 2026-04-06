import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/auth/admin"
import { AdsManager } from "@/components/admin/ads-manager"

export default async function AdminAdsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const admin = await isAdmin(user.id)
  if (!admin) {
    redirect("/dashboard")
  }

  const { data: ads } = await supabase.from("ads").select("*").order("created_at", { ascending: false })

  const { data: stats } = await supabase.from("ads").select("impressions, clicks")

  const totalImpressions = stats?.reduce((sum, ad) => sum + (ad.impressions || 0), 0) || 0
  const totalClicks = stats?.reduce((sum, ad) => sum + (ad.clicks || 0), 0) || 0
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0"

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="font-['Playfair_Display'] text-2xl font-bold text-[#3B2A1A]">Ads Management</h1>
          <p className="text-sm text-[#9B8577]">Create and manage advertisements</p>
        </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <h3 className="text-sm font-medium text-muted-foreground">Total Impressions</h3>
              <p className="text-2xl font-bold">{totalImpressions.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="text-sm font-medium text-muted-foreground">Total Clicks</h3>
              <p className="text-2xl font-bold">{totalClicks.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="text-sm font-medium text-muted-foreground">Click Through Rate</h3>
              <p className="text-2xl font-bold">{ctr}%</p>
            </div>
          </div>

          <AdsManager ads={ads || []} adminId={user.id} />
      </div>
    </div>
  )
}
