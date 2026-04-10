import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { requireVerifiedCompany } from "@/lib/auth/admin"
import { CompanyJobForm } from "@/components/company/company-job-form"

export default async function NewCompanyJobPage() {
  const { user, profile } = await requireVerifiedCompany()

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-5xl">
        <CompanyJobForm companyName={profile.company_name || "My Company"} />
      </div>
    </div>
  )
}
