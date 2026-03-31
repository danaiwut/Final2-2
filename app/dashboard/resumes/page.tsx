import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ResumesList } from "@/components/resumes/resumes-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function ResumesPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  
  const { data: resumes } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })

  return (
    <div className="flex min-h-screen flex-col bg-[#FDFAF6]">
      <DashboardHeader user={user} profile={profile} />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#3B2A1A]">My Resumes</h1>
              <p className="text-[#6B4C30]">Manage and customize your professional resumes</p>
            </div>
            <Button asChild className="bg-[#A07850] hover:bg-[#7A5C38]">
              <Link href="/dashboard/resumes/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Resume
              </Link>
            </Button>
          </div>

          <ResumesList resumes={resumes || []} />
        </div>
      </main>
    </div>
  )
}
