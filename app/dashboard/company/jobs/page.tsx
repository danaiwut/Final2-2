import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { requireCompany } from "@/lib/auth/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Briefcase, Eye, Users, AlertTriangle, ShieldCheck } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export default async function CompanyJobsPage() {
  const { user, profile } = await requireCompany()
  const supabase = await createClient()

  const isVerified = profile.verification_status === "verified"

  const { data: jobs } = isVerified
    ? await supabase
        .from("jobs")
        .select("*")
        .eq("company_user_id", user.id)
        .order("created_at", { ascending: false })
    : { data: [] }

  // Get application counts per job
  const jobIds = (jobs || []).map((j: any) => j.id)
  const { data: applications } = jobIds.length > 0
    ? await supabase
        .from("job_applications")
        .select("job_id")
        .in("job_id", jobIds)
    : { data: [] }

  const appCountMap = new Map<string, number>()
  ;(applications || []).forEach((app: any) => {
    appCountMap.set(app.job_id, (appCountMap.get(app.job_id) || 0) + 1)
  })

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
              <Briefcase className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="font-['Playfair_Display'] text-2xl font-bold text-[#3B2A1A]">My Job Posts</h1>
              <p className="text-sm text-[#9B8577]">Manage your job listings</p>
            </div>
          </div>
          {isVerified && (
            <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Link href="/dashboard/company/jobs/new">
                <Plus className="mr-2 h-4 w-4" />
                Post New Job
              </Link>
            </Button>
          )}
        </div>

        {!isVerified ? (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="p-4 bg-amber-100 rounded-full mb-4">
                <AlertTriangle className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Verification Required</h3>
              <p className="text-center text-sm text-gray-600 max-w-md mb-6">
                Your company must be verified before you can post jobs. Please complete the verification process first.
              </p>
              <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Link href="/dashboard/company/verification">
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Start Verification
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Jobs</CardTitle>
                  <Briefcase className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{jobs?.length || 0}</div>
                </CardContent>
              </Card>
              <Card className="border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Active Jobs</CardTitle>
                  <Eye className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{jobs?.filter((j: any) => j.is_active).length || 0}</div>
                </CardContent>
              </Card>
              <Card className="border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Applications</CardTitle>
                  <Users className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{applications?.length || 0}</div>
                </CardContent>
              </Card>
            </div>

            {/* Jobs List */}
            {(jobs?.length || 0) > 0 ? (
              <div className="space-y-4">
                {jobs!.map((job: any) => (
                  <Card key={job.id} className="border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-bold text-lg text-gray-900">{job.title}</h3>
                            <Badge variant={job.is_active ? "default" : "secondary"} className={job.is_active ? "bg-emerald-100 text-emerald-700 border-0" : ""}>
                              {job.is_active ? "Active" : "Inactive"}
                            </Badge>
                            {job.remote && <Badge variant="outline">Remote</Badge>}
                            {job.job_type && <Badge variant="outline" className="capitalize">{job.job_type}</Badge>}
                          </div>
                          <p className="text-sm text-gray-500 mb-2">
                            {job.location && `📍 ${job.location} • `}
                            {job.salary_min && job.salary_max && `💰 ฿${job.salary_min.toLocaleString()}-${job.salary_max.toLocaleString()} • `}
                            Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>
                        </div>
                        <div className="ml-4 text-right flex-shrink-0">
                          <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                            <Users className="h-4 w-4" />
                            <span className="font-semibold">{appCountMap.get(job.id) || 0}</span>
                            <span>applicants</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-gray-200">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Briefcase className="mb-4 h-12 w-12 text-gray-300" />
                  <h3 className="mb-2 text-lg font-semibold text-gray-700">No jobs posted yet</h3>
                  <p className="text-center text-sm text-gray-500 mb-4">Start attracting talent by posting your first job.</p>
                  <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Link href="/dashboard/company/jobs/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Post Your First Job
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
