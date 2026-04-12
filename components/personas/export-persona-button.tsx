"use client"

import { ResumeDownloadButton } from "@/components/resumes/resume-download-button"
import type { Persona } from "@/lib/types"

interface ExportPersonaButtonProps {
  persona: Persona
  resumeId?: string | null
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  disabledMessage?: string
  trackDownload?: boolean
}

export function ExportPersonaButton({
  persona,
  resumeId,
  variant = "outline",
  size = "sm",
  disabledMessage = "No resume set",
  trackDownload = false,
}: ExportPersonaButtonProps) {
  return (
    <ResumeDownloadButton
      resumeId={resumeId}
      ownerUserId={persona.user_id}
      variant={variant}
      size={size}
      label="Export PDF"
      disabledMessage={disabledMessage}
      trackDownload={trackDownload}
    />
  )
}
