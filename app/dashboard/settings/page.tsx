import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { UserAISettings } from "@/components/settings/user-ai-settings"
import { ProfileSettings } from "@/components/settings/profile-settings"
import { UserPreferencesComponent } from "@/components/settings/user-preferences"

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: aiSettings } = await supabase.from("ai_settings").select("*").eq("user_id", user.id).single()

  const { data: userPreferences } = await supabase.from("user_preferences").select("*").eq("user_id", user.id).single()

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="font-['Playfair_Display'] text-2xl font-bold text-[#3B2A1A]">Settings</h1>
          <p className="text-sm text-[#9B8577]">Manage your account and preferences</p>
        </div>
        <ProfileSettings profile={profile} userId={user.id} />
        {/* <UserPreferencesComponent preferences={userPreferences} userId={user.id} />
        <UserAISettings settings={aiSettings} userId={user.id} /> */}
      </div>
    </div>
  )
}
