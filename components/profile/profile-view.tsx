"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MapPin, Globe, Twitter, Linkedin, Github, Edit, Briefcase, Eye, FileText, Send, Reply } from "lucide-react"
import { ProfileEditDialog } from "./profile-edit-dialog"

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

export function PersonaView({ profile, persona, userId, stats }: ProfileViewProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)

  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} alt={profile?.full_name} />
              <AvatarFallback className="text-2xl">{getInitials(profile?.full_name || "U")}</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[#A07850]">Persona View</p>
                  <h1 className="text-2xl font-bold">{persona?.name || profile?.full_name || "User"}</h1>
                  <p className="text-muted-foreground">
                    {persona?.career?.title || profile?.email || "No primary persona selected yet"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {persona?.tone && (
                      <Badge variant="secondary" className="capitalize">
                        {persona.tone}
                      </Badge>
                    )}
                    {persona?.response_style && (
                      <Badge variant="outline" className="capitalize">
                        {persona.response_style}
                      </Badge>
                    )}
                    {persona?.visibility && (
                      <Badge variant="outline" className="capitalize">
                        {persona.visibility}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button onClick={() => setIsEditOpen(true)} size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </div>

              <p className="text-sm leading-relaxed">{persona?.description || profile?.bio || "Add a persona description to make this page more complete."}</p>

              <div className="grid gap-3 md:grid-cols-4">
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    Persona Views
                  </div>
                  <div className="mt-1 text-2xl font-bold">{stats.totalViews}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    Resumes
                  </div>
                  <div className="mt-1 text-2xl font-bold">{stats.resumesCount}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Send className="h-4 w-4" />
                    Applications
                  </div>
                  <div className="mt-1 text-2xl font-bold">{stats.applicationsCount}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Reply className="h-4 w-4" />
                    Responses
                  </div>
                  <div className="mt-1 text-2xl font-bold">{stats.responsesCount}</div>
                </div>
              </div>

              {persona?.career && (
                <div className="rounded-lg border p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <h2 className="font-semibold">Career Snapshot</h2>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Industry</p>
                      <p>{persona.career.industry || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Experience</p>
                      <p>{persona.career.experience_years ? `${persona.career.experience_years} years` : "-"}</p>
                    </div>
                  </div>
                  {persona.career.specializations?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {persona.career.specializations.map((skill: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="rounded-lg border p-4">
                <h2 className="font-semibold">Application Summary</h2>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Reviewed</p>
                    <p className="text-lg font-semibold">{stats.reviewedCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Accepted</p>
                    <p className="text-lg font-semibold">{stats.acceptedCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rejected</p>
                    <p className="text-lg font-semibold">{stats.rejectedCount}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {profile?.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </div>
                )}
                {profile?.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                )}
                {profile?.twitter && (
                  <a
                    href={`https://twitter.com/${profile.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    <Twitter className="h-4 w-4" />
                    Twitter
                  </a>
                )}
                {profile?.linkedin && (
                  <a
                    href={`https://linkedin.com/in/${profile.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                )}
                {profile?.github && (
                  <a
                    href={`https://github.com/${profile.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                  </a>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ProfileEditDialog profile={profile} userId={userId} open={isEditOpen} onOpenChange={setIsEditOpen} />
    </>
  )
}
