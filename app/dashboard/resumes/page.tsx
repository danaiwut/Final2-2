import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { requireStandardUser } from "@/lib/auth/admin"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, FileText, Edit, Download, Trash2, Clock } from "lucide-react"

interface Resume {
  id: string
  title: string
  template_style: string
  color_scheme: string
  is_default: boolean
  updated_at: string
  created_at: string
}

const templateColors: Record<string, string> = {
  modern: "bg-blue-100 text-blue-700",
  classic: "bg-amber-100 text-amber-700",
  minimal: "bg-gray-100 text-gray-700",
  creative: "bg-purple-100 text-purple-700",
}

export default async function ResumesPage() {
  await requireStandardUser()
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: resumes } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })

  return (
    <div className="p-6 md:p-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-['Playfair_Display'] text-2xl font-bold text-[#3B2A1A]">My Resumes</h1>
          <p className="mt-1 text-sm text-[#9B8577]">
            {resumes?.length ?? 0} {(resumes?.length ?? 0) === 1 ? "resume" : "resumes"} — manage and customize your professional documents
          </p>
        </div>
        <Button asChild className="bg-[#A07850] text-white hover:bg-[#8A6640] gap-1.5 rounded-lg">
          <Link href="/dashboard/resumes/new">
            <Plus className="h-4 w-4" />
            New Resume
          </Link>
        </Button>
      </div>

      {!resumes || resumes.length === 0 ? (
        /* Empty State */
        <div className="rounded-xl border border-[#E8DDD1] bg-white p-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F5EDE2]">
            <FileText className="h-8 w-8 text-[#A07850]" />
          </div>
          <h3 className="font-['Playfair_Display'] text-xl font-semibold text-[#3B2A1A]">No resumes yet</h3>
          <p className="mt-2 text-sm text-[#9B8577]">Create your first resume to stand out to employers.</p>
          <Button asChild className="mt-6 bg-[#A07850] text-white hover:bg-[#8A6640] rounded-lg">
            <Link href="/dashboard/resumes/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Resume
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {resumes.map((resume: Resume) => {
            const templateClass = templateColors[resume.template_style?.toLowerCase()] ?? "bg-[#F5EDE2] text-[#A07850]"
            return (
              <div
                key={resume.id}
                className="group rounded-xl border border-[#E8DDD1] bg-white shadow-sm transition-all hover:shadow-md"
              >
                {/* Preview Area */}
                <div className="relative flex h-44 items-center justify-center rounded-t-xl bg-gradient-to-br from-[#F5EDE2] to-[#EDE0D4]">
                  <FileText className="h-16 w-16 text-[#C4A882] opacity-60" />
                  {resume.is_default && (
                    <div className="absolute left-3 top-3">
                      <Badge className="bg-[#A07850] text-white text-[10px] shadow-sm">Default</Badge>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 overflow-hidden">
                      <h3 className="truncate font-semibold text-[#3B2A1A]">{resume.title}</h3>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {resume.template_style && (
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${templateClass}`}>
                            {resume.template_style}
                          </span>
                        )}
                        {resume.color_scheme && (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                            {resume.color_scheme}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 flex items-center gap-1 text-xs text-[#9B8577]">
                    <Clock className="h-3 w-3" />
                    Updated {new Date(resume.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>

                  {/* Actions */}
                  <div className="mt-4 flex items-center gap-2 border-t border-[#F0E6D8] pt-4">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1 text-xs border-[#D4B896] text-[#A07850] hover:bg-[#F5EDE2] hover:text-[#7A5C38]"
                    >
                      <Link href={`/dashboard/resumes/${resume.id}/edit`}>
                        <Edit className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-xs border-[#D4B896] text-[#A07850] hover:bg-[#F5EDE2]"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-xs border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
