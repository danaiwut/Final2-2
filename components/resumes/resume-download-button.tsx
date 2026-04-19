"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface ResumeDownloadButtonProps {
  resumeId?: string | null
  resume?: Record<string, any> | null
  ownerUserId?: string | null
  trackDownload?: boolean
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  label?: string
  disabledMessage?: string
}

export function ResumeDownloadButton({
  resumeId,
  ownerUserId,
  trackDownload = false,
  variant = "outline",
  size = "sm",
  className,
  label = "Download PDF",
  disabledMessage = "No resume available",
}: ResumeDownloadButtonProps) {
  const hasLabel = label.trim().length > 0

  const handleDownload = async () => {
    if (!resumeId) return

    if (trackDownload && ownerUserId) {
      try {
        await fetch("/api/resumes/download", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeId, userId: ownerUserId }),
        })
      } catch {
        // non-critical, continue
      }
    }

    // Open the print-ready page in a new tab — browser handles PDF export natively
    window.open(`/resumes/${resumeId}/download?autoprint=1`, "_blank")
  }

  return (
    <Button
      onClick={handleDownload}
      variant={variant}
      size={size}
      className={className}
      disabled={!resumeId}
      title={!resumeId ? disabledMessage : "Download as PDF"}
    >
      <Download className={`${hasLabel ? "mr-2" : ""} h-4 w-4`} />
      {hasLabel ? (!resumeId ? disabledMessage : label) : null}
    </Button>
  )
}
