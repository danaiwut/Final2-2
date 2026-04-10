"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Building2, Upload, FileText, CheckCircle2, Clock, XCircle,
  AlertTriangle, Loader2, Globe, Phone, ShieldCheck
} from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface VerificationFormProps {
  profile: any
}

export function VerificationForm({ profile }: VerificationFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [formData, setFormData] = useState({
    company_name: profile?.company_name || "",
    company_registration_number: profile?.company_registration_number || "",
    company_website: profile?.company_website || "",
    company_phone: profile?.company_phone || "",
  })
  const [documentUrl, setDocumentUrl] = useState<string>(
    profile?.verification_documents?.[0] || ""
  )

  const status = profile?.verification_status || "none"

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingFile(true)
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${profile.id}/verification_${Date.now()}.${fileExt}`

      const { data, error } = await supabase.storage
        .from("verification-documents")
        .upload(fileName, file, { upsert: true })

      if (error) throw error

      const { data: publicUrlData } = supabase.storage
        .from("verification-documents")
        .getPublicUrl(fileName)

      setDocumentUrl(publicUrlData.publicUrl)
      toast.success("Document uploaded successfully")
    } catch (error: any) {
      toast.error("Upload failed", { description: error.message })
    } finally {
      setUploadingFile(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          company_name: formData.company_name,
          company_registration_number: formData.company_registration_number,
          company_website: formData.company_website || null,
          company_phone: formData.company_phone,
          verification_status: "pending",
          verification_documents: documentUrl ? [documentUrl] : [],
          verification_submitted_at: new Date().toISOString(),
        })
        .eq("id", profile.id)

      if (error) throw error

      toast.success("Verification request submitted!", {
        description: "Our team will review your documents within 1-3 business days.",
      })
      router.refresh()
    } catch (error: any) {
      toast.error("Submission failed", { description: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const statusConfig = {
    none: {
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-200",
      badge: "bg-amber-100 text-amber-700",
      label: "Not Verified",
      description: "Submit your company documents for verification to unlock all features.",
    },
    pending: {
      icon: Clock,
      color: "text-blue-600",
      bg: "bg-blue-50 border-blue-200",
      badge: "bg-blue-100 text-blue-700",
      label: "Pending Review",
      description: "Your verification is under review. This typically takes 1-3 business days.",
    },
    verified: {
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-200",
      badge: "bg-emerald-100 text-emerald-700",
      label: "✔ Verified Company",
      description: "Your company has been verified. You can now post jobs and access all features.",
    },
    rejected: {
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50 border-red-200",
      badge: "bg-red-100 text-red-700",
      label: "Rejected",
      description: "Your verification was rejected. Please update your documents and resubmit.",
    },
  }

  const currentStatus = statusConfig[status as keyof typeof statusConfig] || statusConfig.none
  const StatusIcon = currentStatus.icon

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div className={`rounded-xl border-2 p-6 ${currentStatus.bg} transition-all`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl bg-white shadow-sm ${currentStatus.color}`}>
            <StatusIcon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-lg font-bold text-gray-900">Verification Status</h3>
              <Badge className={`${currentStatus.badge} border-0 font-semibold`}>
                {currentStatus.label}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">{currentStatus.description}</p>
          </div>
        </div>
      </div>

      {/* Form (show if not verified) */}
      {status !== "verified" && (
        <Card className="border-gray-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-gray-50/80 border-b border-gray-100 pb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl">Company Verification</CardTitle>
                <CardDescription>Fill in your company details and upload verification documents.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-700 font-medium">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    Company Name
                  </Label>
                  <Input
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    placeholder="Acme Corporation"
                    required
                    disabled={status === "pending"}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-700 font-medium">
                    <FileText className="h-4 w-4 text-gray-400" />
                    Registration Number
                  </Label>
                  <Input
                    value={formData.company_registration_number}
                    onChange={(e) => setFormData({ ...formData, company_registration_number: e.target.value })}
                    placeholder="e.g. 0105563012345"
                    required
                    disabled={status === "pending"}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-700 font-medium">
                    <Globe className="h-4 w-4 text-gray-400" />
                    Website (Optional)
                  </Label>
                  <Input
                    value={formData.company_website}
                    onChange={(e) => setFormData({ ...formData, company_website: e.target.value })}
                    placeholder="https://www.example.com"
                    disabled={status === "pending"}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-700 font-medium">
                    <Phone className="h-4 w-4 text-gray-400" />
                    Phone Number
                  </Label>
                  <Input
                    value={formData.company_phone}
                    onChange={(e) => setFormData({ ...formData, company_phone: e.target.value })}
                    placeholder="02-xxx-xxxx"
                    required
                    disabled={status === "pending"}
                  />
                </div>
              </div>

              {/* Document Upload */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-gray-700 font-medium">
                  <Upload className="h-4 w-4 text-gray-400" />
                  Verification Document
                </Label>
                <p className="text-xs text-gray-500">
                  Upload your company certificate (หนังสือรับรองบริษัท) or ภ.พ.20
                </p>

                {documentUrl ? (
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <span className="text-sm text-emerald-700 font-medium flex-1 truncate">Document uploaded</span>
                    {status !== "pending" && (
                      <label className="cursor-pointer text-xs text-indigo-600 font-semibold hover:underline">
                        Replace
                        <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} />
                      </label>
                    )}
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all">
                    {uploadingFile ? (
                      <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Click to upload document</span>
                        <span className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (max 10MB)</span>
                      </>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      disabled={uploadingFile || status === "pending"}
                    />
                  </label>
                )}
              </div>

              {status !== "pending" && (
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !formData.company_name || !formData.company_registration_number}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[160px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        {status === "rejected" ? "Resubmit Verification" : "Submit for Verification"}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      )}

      {/* Verified Company Info */}
      {status === "verified" && (
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-gray-500 text-xs uppercase tracking-wider">Company Name</Label>
                <p className="font-semibold text-gray-900 mt-1">{profile.company_name}</p>
              </div>
              <div>
                <Label className="text-gray-500 text-xs uppercase tracking-wider">Registration Number</Label>
                <p className="font-semibold text-gray-900 mt-1">{profile.company_registration_number}</p>
              </div>
              {profile.company_website && (
                <div>
                  <Label className="text-gray-500 text-xs uppercase tracking-wider">Website</Label>
                  <p className="font-semibold text-gray-900 mt-1">{profile.company_website}</p>
                </div>
              )}
              {profile.company_phone && (
                <div>
                  <Label className="text-gray-500 text-xs uppercase tracking-wider">Phone</Label>
                  <p className="font-semibold text-gray-900 mt-1">{profile.company_phone}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
