import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth/admin"
import { JobForm } from "@/components/admin/job-form"
import { notFound } from "next/navigation"

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { user, profile } = await requireAdmin()
  const supabase = await createClient()

  const { data: job } = await supabase.from("jobs").select("*").eq("id", id).single()

  if (!job) {
    notFound()
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="font-['Playfair_Display'] text-2xl font-bold text-[#3B2A1A]">Edit Job</h1>
          <p className="text-sm text-[#9B8577]">Update job listing details</p>
        </div>
          <JobForm job={job} />
      </div>
    </div>
  )
}
