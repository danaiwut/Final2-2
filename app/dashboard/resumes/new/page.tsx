import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ResumeEditor } from "@/components/resumes/resume-editor"

export default async function NewResumePage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Create a new empty resume object
  const newResume = {
    id: null,
    title: "New Resume",
    full_name: profile?.full_name || "",
    email: user.email || "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    summary: "",
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    template_style: "modern",
    color_scheme: "brown",
    font_family: "inter",
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FDFAF6]">
      <DashboardHeader user={user} profile={profile} />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-7xl">
          <ResumeEditor resume={newResume} isNew={true} />
        </div>
      </main>
    </div>
  )
}
