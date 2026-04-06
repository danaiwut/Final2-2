import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth/admin"
import { GlobalAISettings } from "@/components/admin/global-ai-settings"

export default async function AdminSettingsPage() {
  const { user, profile } = await requireAdmin()
  const supabase = await createClient()

  const { data: globalSettings } = await supabase.from("ai_settings").select("*").eq("is_global", true).single()

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="font-['Playfair_Display'] text-2xl font-bold text-[#3B2A1A]">Global Settings</h1>
          <p className="text-sm text-[#9B8577]">Configure platform-wide AI settings</p>
        </div>
          <GlobalAISettings settings={globalSettings} />
      </div>
    </div>
  )
}
