import { createClient } from "@/lib/supabase/server"
import { requireStandardUser } from "@/lib/auth/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Download, Building2, Clock, FileText } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export default async function ResumeHistoryPage() {
  const { user } = await requireStandardUser()
  const supabase = await createClient()

  const { data: downloads } = await supabase
    .from("resume_downloads")
    .select("*")
    .eq("user_id", user.id)
    .order("downloaded_at", { ascending: false })

  // Get downloader profiles
  const downloaderIds = [...new Set((downloads || []).map((d) => d.downloaded_by))]
  const { data: profiles } = downloaderIds.length > 0
    ? await supabase
        .from("profiles")
        .select("id, full_name, company_name, role, avatar_url")
        .in("id", downloaderIds)
    : { data: [] }

  const profileMap = new Map((profiles || []).map((p) => [p.id, p]))

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5EDE2]">
            <Download className="h-5 w-5 text-[#A07850]" />
          </div>
          <div>
            <h1 className="font-['Playfair_Display'] text-2xl font-bold text-[#3B2A1A]">Resume Download History</h1>
            <p className="text-sm text-[#9B8577]">See who has viewed and downloaded your resume</p>
          </div>
        </div>

        {(downloads?.length || 0) > 0 ? (
          <div className="space-y-3">
            {downloads!.map((download) => {
              const downloader = profileMap.get(download.downloaded_by)
              const isCompany = downloader?.role === "company"

              return (
                <Card key={download.id} className="border-gray-200 hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className={`h-10 w-10 ${isCompany ? "ring-2 ring-indigo-200" : ""}`}>
                        <AvatarFallback className={isCompany ? "bg-indigo-100 text-indigo-700" : "bg-gray-100"}>
                          {isCompany ? <Building2 className="h-4 w-4" /> : (downloader?.full_name?.[0] || "?")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 truncate">
                            {downloader?.company_name || downloader?.full_name || "Unknown"}
                          </p>
                          {isCompany && (
                            <Badge className="bg-indigo-100 text-indigo-700 border-0 text-[10px]">Company</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                          <Clock className="h-3 w-3" />
                          <span>{formatDistanceToNow(new Date(download.downloaded_at), { addSuffix: true })}</span>
                        </div>
                      </div>
                      <Download className="h-4 w-4 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="border-gray-200">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="mb-4 h-12 w-12 text-gray-300" />
              <h3 className="mb-2 text-lg font-semibold text-gray-700">No downloads yet</h3>
              <p className="text-center text-sm text-gray-500">
                Download history will appear here when companies view your resume.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
