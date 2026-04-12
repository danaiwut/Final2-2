"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface ResumeDownloadButtonProps {
  resumeId?: string | null
  ownerUserId?: string | null
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  label?: string
  disabledMessage?: string
  trackDownload?: boolean
}

export function ResumeDownloadButton({
  resumeId,
  ownerUserId,
  variant = "outline",
  size = "sm",
  className,
  label = "Download Resume",
  disabledMessage = "No resume available",
  trackDownload = false,
}: ResumeDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const hasLabel = label.trim().length > 0

  const handleDownload = async () => {
    if (!resumeId) return

    setIsDownloading(true)
    try {
      if (trackDownload && ownerUserId) {
        await fetch("/api/resumes/download", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeId, userId: ownerUserId }),
        })
      }

      window.open(`/resumes/${resumeId}/download?autoprint=1`, "_blank", "noopener,noreferrer")
    } catch (error) {
      console.error("Error downloading resume:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Button
      onClick={handleDownload}
      variant={variant}
      size={size}
      className={className}
      disabled={!resumeId || isDownloading}
      title={!resumeId ? disabledMessage : undefined}
    >
      <Download className={`${hasLabel ? "mr-2" : ""} h-4 w-4`} />
      {hasLabel ? (!resumeId ? disabledMessage : isDownloading ? "Opening..." : label) : null}
    </Button>
  )
}
