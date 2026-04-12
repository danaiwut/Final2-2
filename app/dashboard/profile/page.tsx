import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PersonaView } from "@/components/profile/profile-view"

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

  const { data: personas } = await supabase
    .from("personas")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })

  const { data: resumes } = await supabase.from("resumes").select("id").eq("user_id", user.id)
  const { data: applications } = await supabase
    .from("job_applications")
    .select("id, status")
    .eq("user_id", user.id)

  const primaryPersona =
    personas?.find((persona) => persona.is_active) ||
    personas?.find((persona) => persona.visibility === "published") ||
    personas?.[0] ||
    null

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <PersonaView
          profile={profile}
          persona={primaryPersona}
          userId={user.id}
          stats={{
            personasCount: personas?.length || 0,
            resumesCount: resumes?.length || 0,
            applicationsCount: applications?.length || 0,
            responsesCount: (applications || []).filter((application) => application.status !== "pending").length,
            acceptedCount: (applications || []).filter((application) => application.status === "accepted").length,
            reviewedCount: (applications || []).filter((application) => application.status === "reviewed").length,
            rejectedCount: (applications || []).filter((application) => application.status === "rejected").length,
            totalViews: (personas || []).reduce((sum, item) => sum + (item.views_count || 0), 0),
          }}
        />
      </div>
    </div>
  )
}
