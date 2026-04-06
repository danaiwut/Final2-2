import { requireAdmin } from "@/lib/auth/admin"
import { JobForm } from "@/components/admin/job-form"

export default async function NewJobPage() {
  const { user, profile } = await requireAdmin()

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="font-['Playfair_Display'] text-2xl font-bold text-[#3B2A1A]">Post New Job</h1>
          <p className="text-sm text-[#9B8577]">Create a new job listing</p>
        </div>
          <JobForm />
      </div>
    </div>
  )
}
