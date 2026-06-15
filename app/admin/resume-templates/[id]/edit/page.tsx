import { requireAdmin } from "@/lib/auth/admin"
import { ResumeTemplateForm } from "@/components/admin/resume-template-form"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

export default async function EditResumeTemplatePage({ params }: { params: { id: string } }) {
  await requireAdmin()
  const supabase = await createClient()

  const { data: template, error } = await supabase
    .from("resume_templates")
    .select("*")
    .eq("id", params.id)
    .single()

  if (error || !template) {
    notFound()
  }

  return <ResumeTemplateForm initialData={template} isEdit />
}
