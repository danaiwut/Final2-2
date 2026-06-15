import { requireAdmin } from "@/lib/auth/admin"
import { ResumeTemplateForm } from "@/components/admin/resume-template-form"

export default async function NewResumeTemplatePage() {
  await requireAdmin()
  return <ResumeTemplateForm />
}
