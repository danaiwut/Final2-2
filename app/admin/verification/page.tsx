import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth/admin"
import { VerificationList } from "@/components/admin/verification-list"
import { ShieldCheck } from "lucide-react"

export default async function AdminVerificationPage() {
  const { user, profile } = await requireAdmin()
  const supabase = await createClient()

  const { data: companyRequests } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "company")
    .neq("verification_status", "none")
    .order("verification_submitted_at", { ascending: false })

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
            <ShieldCheck className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="font-['Playfair_Display'] text-2xl font-bold text-[#3B2A1A]">Company Verification</h1>
            <p className="text-sm text-[#9B8577]">Review and manage company verification requests</p>
          </div>
        </div>

        <VerificationList requests={companyRequests || []} />
      </div>
    </div>
  )
}
