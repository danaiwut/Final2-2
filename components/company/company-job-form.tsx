"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Briefcase, MapPin, DollarSign, FileText, Loader2, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"

interface CompanyJobFormProps {
  companyName: string
  initialData?: any
}

export function CompanyJobForm({ companyName, initialData }: CompanyJobFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    requirements: initialData?.requirements?.join("\n") || "",
    skills: initialData?.skills?.join(", ") || "",
    location: initialData?.location || "",
    remote: initialData?.remote || false,
    job_type: initialData?.job_type || "full-time",
    salary_min: initialData?.salary_min || "",
    salary_max: initialData?.salary_max || "",
    industry: initialData?.industry || "",
    experience_required: initialData?.experience_required || "",
    application_url: initialData?.application_url || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const jobData = {
        ...formData,
        company: companyName,
        requirements: formData.requirements.split("\n").filter(Boolean),
        skills: formData.skills.split(",").map((s: string) => s.trim()).filter(Boolean),
        salary_min: formData.salary_min ? Number(formData.salary_min) : null,
        salary_max: formData.salary_max ? Number(formData.salary_max) : null,
        experience_required: formData.experience_required ? Number(formData.experience_required) : null,
        posted_date: new Date().toISOString(),
      }

      const response = await fetch("/api/company/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobData),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || "Failed to post job")
      }

      toast.success("Job posted successfully!")
      router.push("/dashboard/company/jobs")
      router.refresh()
    } catch (error: any) {
      toast.error("Failed to post job", { description: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/company/jobs"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs
      </Link>

      <Card className="border-gray-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-gray-50/80 border-b border-gray-100 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl">{initialData ? "Edit Job Post" : "Post a New Job"}</CardTitle>
              <CardDescription>Posting as <span className="font-semibold text-indigo-600">{companyName}</span></CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="font-medium text-gray-700">Job Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Senior Frontend Developer"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-medium text-gray-700">Description *</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the role and responsibilities..."
                    rows={6}
                    required
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-medium text-gray-700">Requirements</Label>
                  <Textarea
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    placeholder="One requirement per line..."
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-400">Enter each requirement on a new line</p>
                </div>

                <div className="space-y-2">
                  <Label className="font-medium text-gray-700">Skills</Label>
                  <Input
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="React, TypeScript, Node.js"
                  />
                  <p className="text-xs text-gray-400">Separate skills with commas</p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6 bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                <div className="space-y-2">
                  <Label className="font-medium text-gray-700 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    Job Type *
                  </Label>
                  <Select
                    value={formData.job_type}
                    onValueChange={(value) => setFormData({ ...formData, job_type: value })}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-medium text-gray-700 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    Location
                  </Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Bangkok, Thailand"
                    className="bg-white"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                  <div>
                    <Label className="font-semibold cursor-pointer">Remote Work</Label>
                    <p className="text-xs text-gray-500">Allow working from anywhere</p>
                  </div>
                  <Switch
                    checked={formData.remote}
                    onCheckedChange={(checked) => setFormData({ ...formData, remote: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-medium text-gray-700 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    Salary Range (THB/month)
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="number"
                      value={formData.salary_min}
                      onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                      placeholder="Min"
                      className="bg-white"
                    />
                    <Input
                      type="number"
                      value={formData.salary_max}
                      onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                      placeholder="Max"
                      className="bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-medium text-gray-700">Industry</Label>
                  <Input
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder="e.g. Technology, Finance"
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-medium text-gray-700">Experience Required (years)</Label>
                  <Input
                    type="number"
                    value={formData.experience_required}
                    onChange={(e) => setFormData({ ...formData, experience_required: e.target.value })}
                    placeholder="e.g. 3"
                    className="bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="bg-transparent"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !formData.title || !formData.description}
                className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Briefcase className="mr-2 h-4 w-4" />
                    {initialData ? "Update Job" : "Post Job"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
