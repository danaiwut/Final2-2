"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Building2, CheckCircle2, XCircle, Clock, Eye, ExternalLink,
  Loader2, FileText, Globe, Phone, Calendar
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"

interface VerificationListProps {
  requests: any[]
}

export function VerificationList({ requests }: VerificationListProps) {
  const router = useRouter()
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>("pending")

  const filteredRequests = requests.filter((r) => {
    if (filter === "all") return true
    return r.verification_status === filter
  })

  const handleAction = async (userId: string, action: "verified" | "rejected") => {
    setProcessingId(userId)
    try {
      const response = await fetch("/api/admin/verification", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: action }),
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Error processing verification:", error)
    } finally {
      setProcessingId(null)
    }
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-100 text-amber-700 border-0"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case "verified":
        return <Badge className="bg-emerald-100 text-emerald-700 border-0"><CheckCircle2 className="h-3 w-3 mr-1" />Verified</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-700 border-0"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-2">
        {["pending", "verified", "rejected", "all"].map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            className={`capitalize ${filter === f ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-transparent"}`}
          >
            {f}
            {f === "pending" && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-700">
                {requests.filter((r) => r.verification_status === "pending").length}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Requests */}
      {filteredRequests.length > 0 ? (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Company Info */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12 bg-indigo-100">
                        <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">
                          {request.company_name?.[0] || "C"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-gray-900 text-lg">{request.company_name || "Unknown Company"}</h3>
                          {statusBadge(request.verification_status)}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">{request.email}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span className="truncate">Reg: {request.company_registration_number || "N/A"}</span>
                          </div>
                          {request.company_website && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Globe className="h-4 w-4 text-gray-400" />
                              <a href={request.company_website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline truncate">
                                {request.company_website}
                              </a>
                            </div>
                          )}
                          {request.company_phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span>{request.company_phone}</span>
                            </div>
                          )}
                          {request.verification_submitted_at && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span>Submitted {formatDistanceToNow(new Date(request.verification_submitted_at), { addSuffix: true })}</span>
                            </div>
                          )}
                        </div>

                        {/* Documents */}
                        {request.verification_documents?.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Documents</p>
                            <div className="flex gap-2 flex-wrap">
                              {request.verification_documents.map((doc: string, i: number) => (
                                <a
                                  key={i}
                                  href={doc}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  View Document {i + 1}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {request.verification_status === "pending" && (
                    <div className="flex md:flex-col gap-2 p-6 md:border-l border-t md:border-t-0 border-gray-100 bg-gray-50/50 justify-center items-center">
                      <Button
                        onClick={() => handleAction(request.id, "verified")}
                        disabled={processingId === request.id}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px]"
                      >
                        {processingId === request.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="mr-1.5 h-4 w-4" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleAction(request.id, "rejected")}
                        disabled={processingId === request.id}
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 min-w-[120px]"
                      >
                        <XCircle className="mr-1.5 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="mb-4 h-12 w-12 text-gray-300" />
            <h3 className="mb-2 text-lg font-semibold text-gray-700">No verification requests</h3>
            <p className="text-center text-sm text-gray-500">
              {filter === "pending" ? "All pending requests have been processed." : `No ${filter} requests found.`}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
