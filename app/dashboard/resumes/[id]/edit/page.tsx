import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { requireStandardUser } from "@/lib/auth/admin"
import { ResumeEditor } from "@/components/resumes/resume-editor"

export default async function EditResumePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { user } = await requireStandardUser()
  const supabase = await createClient()

  const { data: personas } = await supabase.from("personas").select("*").eq("user_id", user.id)

  const { data: resume } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!resume) {
    redirect("/dashboard/resumes")
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <ResumeEditor resume={resume} personas={personas || []} />
      </div>
    </div>
  )
}
