"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Globe,
  Twitter,
  Linkedin,
  Github,
  Facebook,
  Instagram,
  Edit,
  Briefcase,
  Eye,
  FileText,
  Send,
  Reply,
  Mail,
} from "lucide-react"
import { ProfileEditDialog } from "./profile-edit-dialog"
import { resolveProfileLink, profileLinkLabel } from "@/lib/profile-links"

interface ProfileViewProps {
  profile: any
  persona: any
  userId: string
  stats: {
    personasCount: number
    resumesCount: number
    applicationsCount: number
    responsesCount: number
    acceptedCount: number
    reviewedCount: number
    rejectedCount: number
    totalViews: number
  }
}

const socialLinks = [
  { key: "website", icon: Globe, valueKey: "website" },
  { key: "linkedin", icon: Linkedin, valueKey: "linkedin" },
  { key: "github", icon: Github, valueKey: "github" },
  { key: "facebook", icon: Facebook, valueKey: "facebook" },
  { key: "instagram", icon: Instagram, valueKey: "instagram" },
  { key: "twitter", icon: Twitter, valueKey: "twitter" },
]

export function PersonaView({ profile, persona, userId, stats }: ProfileViewProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)

  const getInitials = (name: string) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U"

  const profileSummary =
    persona?.description ||
    profile?.bio ||
    persona?.career?.title ||
    "Build a polished profile that feels like a personal portfolio."

  const displayedTone = persona?.tone === "formal" ? "professional" : persona?.tone
  const socialItems = socialLinks
    .map((item) => {
      const value = profile?.[item.valueKey]
      const href = resolveProfileLink(value, item.key)
      if (!href) return null
      return {
        ...item,
        href,
        label: profileLinkLabel(item.key),
        value,
      }
    })
    .filter(Boolean) as Array<{
    key: string
    icon: typeof Globe
    href: string
    label: string
    value: string
  }>

  return (
    <>
      <div className="space-y-6">
        <Card className="overflow-hidden border-[#E8DDD1] bg-white shadow-sm">
          <div className="h-40 bg-gradient-to-r from-[#8C6741] via-[#B68B61] to-[#E2C39E]" />
          <CardContent className="px-6 pb-6 pt-0">
            <div className="-mt-16 space-y-6">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex flex-col gap-5 md:flex-row md:items-end">
                  <Avatar className="h-28 w-28 border-4 border-white shadow-xl ring-4 ring-[#F5EDE2]">
                    <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} alt={profile?.full_name} />
                    <AvatarFallback className="bg-[#A07850] text-3xl font-semibold text-white">
                      {getInitials(profile?.full_name || "U")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#A07850]">Profile</p>
                      <div className="flex flex-wrap items-center gap-3">
                        <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#3B2A1A]">
                          {profile?.full_name || persona?.name || "User"}
                        </h1>
                        {profile?.role && (
                          <Badge className="rounded-full bg-[#F5EDE2] px-3 py-1 text-[11px] font-semibold text-[#A07850] hover:bg-[#F5EDE2]">
                            {profile.role}
                          </Badge>
                        )}
                        {displayedTone && (
                          <Badge variant="outline" className="rounded-full capitalize">
                            {displayedTone}
                          </Badge>
                        )}
                      </div>
                      <p className="max-w-2xl text-sm leading-relaxed text-[#6B4C30]">
                        {profileSummary}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-[#6B4C30]">
                      {profile?.location && (
                        <div className="flex items-center gap-1.5 rounded-full bg-[#FAF4EC] px-3 py-1.5">
                          <MapPin className="h-4 w-4 text-[#A07850]" />
                          <span>{profile.location}</span>
                        </div>
                      )}
                      {profile?.email && (
                        <div className="flex items-center gap-1.5 rounded-full bg-[#FAF4EC] px-3 py-1.5">
                          <Mail className="h-4 w-4 text-[#A07850]" />
                          <span>{profile.email}</span>
                        </div>
                      )}
                      {persona?.career?.title && (
                        <div className="flex items-center gap-1.5 rounded-full bg-[#FAF4EC] px-3 py-1.5">
                          <Briefcase className="h-4 w-4 text-[#A07850]" />
                          <span>{persona.career.title}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => setIsEditOpen(true)}
                  size="sm"
                  className="h-10 rounded-full bg-[#A07850] px-4 text-white shadow-sm hover:bg-[#8A6640]"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </div>

              {socialItems.length > 0 && (
                <div className="flex flex-wrap gap-3 border-t border-[#F0E6D8] pt-5">
                  {socialItems.map(({ key, icon: Icon, href, label, value }) => (
                    <a
                      key={key}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-[#E8DDD1] bg-white px-3 py-2 text-sm text-[#6B4C30] shadow-sm transition-colors hover:border-[#CFAE8A] hover:bg-[#FDFAF6]"
                    >
                      <Icon className="h-4 w-4 text-[#A07850]" />
                      <span className="font-medium">{label}</span>
                      <span className="max-w-[180px] truncate text-xs text-[#9B8577]">
                        {value.replace(/^https?:\/\//i, "")}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-[#E8DDD1] shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-[#9B8577]">
                <Eye className="h-4 w-4" />
                Persona Views
              </div>
              <div className="mt-2 text-2xl font-bold text-[#3B2A1A]">{stats.totalViews}</div>
            </CardContent>
          </Card>
          <Card className="border-[#E8DDD1] shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-[#9B8577]">
                <FileText className="h-4 w-4" />
                Resumes
              </div>
              <div className="mt-2 text-2xl font-bold text-[#3B2A1A]">{stats.resumesCount}</div>
            </CardContent>
          </Card>
          <Card className="border-[#E8DDD1] shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-[#9B8577]">
                <Send className="h-4 w-4" />
                Applications
              </div>
              <div className="mt-2 text-2xl font-bold text-[#3B2A1A]">{stats.applicationsCount}</div>
            </CardContent>
          </Card>
          <Card className="border-[#E8DDD1] shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-[#9B8577]">
                <Reply className="h-4 w-4" />
                Responses
              </div>
              <div className="mt-2 text-2xl font-bold text-[#3B2A1A]">{stats.responsesCount}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <Card className="border-[#E8DDD1] shadow-sm">
            <CardContent className="space-y-5 p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A07850]">About</p>
                <p className="mt-2 text-sm leading-relaxed text-[#6B4C30]">
                  {persona?.description || profile?.bio || "Tell people who you are and what you are looking for."}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-[#F0E6D8] bg-[#FDFAF6] p-4">
                  <p className="text-xs text-[#9B8577]">Reviewed</p>
                  <p className="mt-1 text-xl font-semibold text-[#3B2A1A]">{stats.reviewedCount}</p>
                </div>
                <div className="rounded-2xl border border-[#F0E6D8] bg-[#FDFAF6] p-4">
                  <p className="text-xs text-[#9B8577]">Accepted</p>
                  <p className="mt-1 text-xl font-semibold text-[#3B2A1A]">{stats.acceptedCount}</p>
                </div>
                <div className="rounded-2xl border border-[#F0E6D8] bg-[#FDFAF6] p-4">
                  <p className="text-xs text-[#9B8577]">Rejected</p>
                  <p className="mt-1 text-xl font-semibold text-[#3B2A1A]">{stats.rejectedCount}</p>
                </div>
              </div>

              {persona?.career && (
                <div className="rounded-2xl border border-[#E8DDD1] bg-white p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-[#A07850]" />
                    <h2 className="font-semibold text-[#3B2A1A]">Career Snapshot</h2>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs text-[#9B8577]">Industry</p>
                      <p className="text-sm font-medium text-[#3B2A1A]">{persona.career.industry || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#9B8577]">Experience</p>
                      <p className="text-sm font-medium text-[#3B2A1A]">
                        {persona.career.experience_years ? `${persona.career.experience_years} years` : "-"}
                      </p>
                    </div>
                  </div>
                  {persona.career.specializations?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {persona.career.specializations.map((skill: string, index: number) => (
                        <Badge key={index} variant="outline" className="rounded-full bg-[#FAF4EC]">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-[#E8DDD1] shadow-sm">
            <CardContent className="space-y-4 p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A07850]">Application Summary</p>
                <p className="mt-2 text-sm text-[#6B4C30]">A quick snapshot of your job search activity.</p>
              </div>

              <div className="grid gap-3">
                <div className="rounded-2xl border border-[#F0E6D8] bg-[#FDFAF6] p-4">
                  <p className="text-xs text-[#9B8577]">Reviewed</p>
                  <p className="mt-1 text-xl font-semibold text-[#3B2A1A]">{stats.reviewedCount}</p>
                </div>
                <div className="rounded-2xl border border-[#F0E6D8] bg-[#FDFAF6] p-4">
                  <p className="text-xs text-[#9B8577]">Accepted</p>
                  <p className="mt-1 text-xl font-semibold text-[#3B2A1A]">{stats.acceptedCount}</p>
                </div>
                <div className="rounded-2xl border border-[#F0E6D8] bg-[#FDFAF6] p-4">
                  <p className="text-xs text-[#9B8577]">Rejected</p>
                  <p className="mt-1 text-xl font-semibold text-[#3B2A1A]">{stats.rejectedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ProfileEditDialog profile={profile} userId={userId} open={isEditOpen} onOpenChange={setIsEditOpen} />
    </>
  )
}
