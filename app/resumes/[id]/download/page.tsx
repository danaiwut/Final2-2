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

  const { createClient: createSupabaseClient } = await import("@supabase/supabase-js")
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: resume } = await supabaseAdmin
    .from("resumes")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (!resume) {
    notFound()
  }

  const { data: persona } = resume.persona_id
    ? await supabaseAdmin
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
    <>
      {/* Force full color printing across all browsers */}
      <style>{`
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        @media print {
          body { margin: 0; padding: 0; }
          @page { margin: 0; size: A4 portrait; }
        }
      `}</style>
      <main className="min-h-screen bg-[#f3f4f6] p-6 print:bg-white print:p-0">
        <ResumePrintTrigger autoPrint={autoprint === "1"} />
        <div className="mx-auto w-full max-w-[794px] bg-white shadow-2xl print:max-w-none print:shadow-none">
          <div className="min-h-[1123px]">
            <ResumeTemplateView resume={resume} />
          </div>
        </div>
      </main>
    </>
  )
}
