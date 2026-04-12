import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ResumeTemplateView } from "@/components/resumes/resume-template-views"
import { ResumePrintTrigger } from "@/components/resumes/resume-print-trigger"

interface ResumeDownloadPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ autoprint?: string }>
}

export default async function ResumeDownloadPage({ params, searchParams }: ResumeDownloadPageProps) {
  const { id } = await params
  const { autoprint } = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  const { data: viewerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const { data: resume } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (!resume) {
    notFound()
  }

  const { data: persona } = resume.persona_id
    ? await supabase
        .from("personas")
        .select("id, user_id, visibility")
        .eq("id", resume.persona_id)
        .maybeSingle()
    : { data: null }

  const isOwner = resume.user_id === user.id
  const isCompanyViewer = viewerProfile?.role === "company"
  const isPublicPersonaResume = !!persona && persona.user_id === resume.user_id && persona.visibility === "published"

  if (!isOwner && !isCompanyViewer && !isPublicPersonaResume) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-[#f3f4f6] p-6 print:bg-white print:p-0">
      <ResumePrintTrigger autoPrint={autoprint === "1"} />
      <div className="mx-auto w-full max-w-[794px] bg-white shadow-2xl print:max-w-none print:shadow-none">
        <div className="min-h-[1123px]">
          <ResumeTemplateView resume={resume} />
        </div>
      </div>
    </main>
  )
}
