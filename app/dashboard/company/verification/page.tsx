import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { VerificationForm } from "@/components/company/verification-form"
import { ShieldCheck } from "lucide-react"

export default async function CompanyVerificationPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Only company role can access
  if (profile?.role !== "company") {
    redirect("/dashboard")
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
            <ShieldCheck className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="font-['Playfair_Display'] text-2xl font-bold text-[#3B2A1A]">Company Verification</h1>
            <p className="text-sm text-[#9B8577]">Verify your company to unlock job posting and premium features</p>
          </div>
        </div>

        <VerificationForm profile={profile} />
      </div>
    </div>
  )
}
