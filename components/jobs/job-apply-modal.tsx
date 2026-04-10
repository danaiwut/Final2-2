"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Send, FileText, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface JobApplyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  job: { id: string; title: string; company: string }
  resumes: Array<{ id: string; title: string }>
}

export function JobApplyModal({ open, onOpenChange, job, resumes }: JobApplyModalProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedResume, setSelectedResume] = useState<string>("")
  const [coverLetter, setCoverLetter] = useState("")
  const [applied, setApplied] = useState(false)

  const handleApply = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/jobs/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          resumeId: selectedResume || null,
          coverLetter: coverLetter || null,
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || "Failed to apply")
      }

      setApplied(true)
      toast.success("Application submitted!", {
        description: `You've applied for ${job.title} at ${job.company}`,
      })

      setTimeout(() => {
        onOpenChange(false)
        setApplied(false)
        setCoverLetter("")
        setSelectedResume("")
        router.refresh()
      }, 2000)
    } catch (error: any) {
      toast.error("Application failed", { description: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {applied ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="p-4 bg-emerald-50 rounded-full mb-4 animate-in zoom-in-50 duration-300">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Application Sent!</h3>
            <p className="text-sm text-gray-500 text-center max-w-sm">
              Your application has been submitted to {job.company}. Good luck!
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">Apply for {job.title}</DialogTitle>
              <DialogDescription>
                at <span className="font-semibold text-indigo-600">{job.company}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-4">
              {/* Resume Selection */}
              <div className="space-y-2">
                <Label className="font-medium text-gray-700 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  Attach Resume (Optional)
                </Label>
                <Select value={selectedResume} onValueChange={setSelectedResume}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a resume" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No resume</SelectItem>
                    {resumes.map((resume) => (
                      <SelectItem key={resume.id} value={resume.id}>
                        {resume.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Cover Letter */}
              <div className="space-y-2">
                <Label className="font-medium text-gray-700">Cover Letter (Optional)</Label>
                <Textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Introduce yourself and explain why you're a great fit..."
                  rows={5}
                  className="resize-none"
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent">
                Cancel
              </Button>
              <Button
                onClick={handleApply}
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[130px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Application
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
