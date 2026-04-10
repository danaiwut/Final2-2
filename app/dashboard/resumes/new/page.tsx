import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
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
  const { data: personas } = await supabase.from("personas").select("*").eq("user_id", user.id)

  // Create a new empty resume object
  const newResume = {
    id: null,
    title: "My Persona Resume",
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
    color_scheme: "#3B2A1A", // Use hex codes for the new templates
    persona_id: null, // Keep track of the selected persona
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <ResumeEditor resume={newResume} isNew={true} personas={personas || []} />
      </div>
    </div>
  )
}
