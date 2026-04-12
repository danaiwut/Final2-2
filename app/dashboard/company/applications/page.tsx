import { createClient } from "@/lib/supabase/server"
import { requireCompany } from "@/lib/auth/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, FileText, Clock, CheckCircle2, XCircle, Eye } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ResumeDownloadButton } from "@/components/resumes/resume-download-button"

export default async function CompanyApplicationsPage() {
  const { user } = await requireCompany()
  const supabase = await createClient()

  // Get all jobs by this company
  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, title")
    .eq("company_user_id", user.id)

  const jobIds = (jobs || []).map((j) => j.id)
  const jobMap = new Map((jobs || []).map((j) => [j.id, j.title]))

  // Get all applications for these jobs
  const { data: applications } = jobIds.length > 0
    ? await supabase
        .from("job_applications")
        .select("*")
        .in("job_id", jobIds)
        .order("applied_at", { ascending: false })
    : { data: [] }

  // Get applicant profiles
  const applicantIds = [...new Set((applications || []).map((a) => a.user_id))]
  const { data: applicantProfiles } = applicantIds.length > 0
    ? await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .in("id", applicantIds)
    : { data: [] }

  const profileMap = new Map((applicantProfiles || []).map((p) => [p.id, p]))

  const statusConfig: Record<string, { color: string; icon: any }> = {
    pending: { color: "bg-amber-100 text-amber-700", icon: Clock },
    reviewed: { color: "bg-blue-100 text-blue-700", icon: Eye },
    accepted: { color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
    rejected: { color: "bg-red-100 text-red-700", icon: XCircle },
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
            <Users className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="font-['Playfair_Display'] text-2xl font-bold text-[#3B2A1A]">Applications</h1>
            <p className="text-sm text-[#9B8577]">Review candidates who applied to your jobs</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applications?.length || 0}</div>
            </CardContent>
          </Card>
          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {applications?.filter((a) => a.status === "pending").length || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Accepted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {applications?.filter((a) => a.status === "accepted").length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {(applications?.length || 0) > 0 ? (
          <div className="space-y-4">
            {applications!.map((app) => {
              const applicant = profileMap.get(app.user_id)
              const sc = statusConfig[app.status] || statusConfig.pending
              const StatusIcon = sc.icon

              return (
                <Card key={app.id} className="border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-11 w-11">
                        <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">
                          {applicant?.full_name?.[0] || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-gray-900">{applicant?.full_name || "Unknown"}</h3>
                          <Badge className={`${sc.color} border-0`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {app.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">
                          Applied for <span className="font-semibold text-gray-700">{jobMap.get(app.job_id) || "Unknown Job"}</span>
                          {" · "}
                          {formatDistanceToNow(new Date(app.applied_at), { addSuffix: true })}
                        </p>
                        {app.cover_letter && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{app.cover_letter}</p>
                        )}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {app.resume_id && (
                          <ResumeDownloadButton
                            resumeId={app.resume_id}
                            ownerUserId={app.user_id}
                            variant="outline"
                            size="sm"
                            className="bg-transparent"
                            label="Resume"
                            trackDownload={true}
                          />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="border-gray-200">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Users className="mb-4 h-12 w-12 text-gray-300" />
              <h3 className="mb-2 text-lg font-semibold text-gray-700">No applications yet</h3>
              <p className="text-center text-sm text-gray-500">
                Applications will appear here once candidates start applying to your jobs.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
