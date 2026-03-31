import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ResumeEditor } from "@/components/resumes/resume-editor"

export default async function EditResumePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  
  const { data: resume } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single()

  if (!resume) {
    redirect("/dashboard/resumes")
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FDFAF6]">
      <DashboardHeader user={user} profile={profile} />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-7xl">
          <ResumeEditor resume={resume} />
        </div>
      </main>
    </div>
  )
}
