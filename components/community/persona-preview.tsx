import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Briefcase, GraduationCap, Code, MapPin, ExternalLink, DollarSign, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface PersonaPreviewProps {
  persona: any
}

export function PersonaPreview({ persona }: PersonaPreviewProps) {
  const profile = persona.profiles || {}

  return (
    <div className="space-y-6 pt-4">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <Avatar className="h-24 w-24 ring-4 ring-[#F5EDE2]">
          <AvatarImage src={profile.avatar_url || "/placeholder.svg"} />
          <AvatarFallback className="text-2xl bg-[#A07850] text-white">
            {profile.full_name?.[0] || persona.name?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-2xl font-bold text-[#3B2A1A]">{persona.name}</h2>
          <p className="text-sm font-medium text-[#A07850] mt-1">
            by {profile.full_name || "Anonymous"}
          </p>
          
          {profile.location && (
            <div className="flex items-center justify-center sm:justify-start gap-1 text-sm text-[#9B8577] mt-2">
              <MapPin className="h-4 w-4" />
              <span>{profile.location}</span>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-[#6B4C30] bg-[#F5EDE2]/50 p-2 rounded-lg max-w-fit">
            <div className="flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-[#A07850]" />
              <span className="font-semibold">{persona.views_count || 0}</span> Views
            </div>
            {/* You could add Follower count here if passed as prop later */}
          </div>
        </div>
        
        <Button asChild className="bg-[#A07850] hover:bg-[#8B6845] text-white rounded-xl shadow-sm shrink-0">
          <Link href={`/community/personas/${persona.id}`}>
            Full Profile
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: About & Skills */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-[#3B2A1A] border-b border-[#E8DDD1] pb-2 mb-3">About Persona</h3>
            <p className="text-sm text-[#6B4C30] leading-relaxed whitespace-pre-line">
              {persona.description || profile.bio || "No description provided."}
            </p>
          </div>

          {persona.career?.specializations && persona.career.specializations.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-[#3B2A1A] border-b border-[#E8DDD1] pb-2 mb-3">Skills & Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {persona.career.specializations.map((skill: string, i: number) => (
                  <Badge key={i} className="bg-[#F5EDE2] text-[#A07850] hover:bg-[#E8DDD1] border-none shadow-sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {persona.projects && persona.projects.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-[#3B2A1A] border-b border-[#E8DDD1] pb-2 mb-3">Projects</h3>
              <div className="space-y-4">
                {persona.projects.map((project: any, index: number) => (
                  <div key={index} className="bg-white border border-[#E8DDD1] rounded-xl p-4 shadow-sm">
                    <h4 className="font-semibold text-[#3B2A1A]">{project.title}</h4>
                    <p className="mt-1 text-sm text-[#6B4C30]">{project.description}</p>
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {project.technologies.map((tech: string, i: number) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Career, Edu, Prefs */}
        <div className="space-y-6">
          {(persona.career?.title || persona.career?.industry) && (
            <div className="bg-[#FDFAF6] rounded-xl p-4 border border-[#E8DDD1] shadow-sm">
              <h3 className="font-semibold text-[#3B2A1A] flex items-center gap-2 mb-4">
                <Briefcase className="h-4 w-4 text-[#A07850]" /> Career Details
              </h3>
              <div className="space-y-3 text-sm">
                {persona.career.title && (
                  <div>
                    <span className="text-xs text-[#9B8577] block">Position</span>
                    <span className="font-medium text-[#3B2A1A]">{persona.career.title}</span>
                  </div>
                )}
                {persona.career.industry && (
                  <div>
                    <span className="text-xs text-[#9B8577] block">Industry</span>
                    <span className="text-[#3B2A1A]">{persona.career.industry}</span>
                  </div>
                )}
                {persona.career.experience_years && (
                  <div>
                    <span className="text-xs text-[#9B8577] block">Experience</span>
                    <span className="text-[#3B2A1A]">{persona.career.experience_years} years</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {(persona.education?.degree || persona.education?.institution) && (
            <div className="bg-[#FDFAF6] rounded-xl p-4 border border-[#E8DDD1] shadow-sm">
              <h3 className="font-semibold text-[#3B2A1A] flex items-center gap-2 mb-4">
                <GraduationCap className="h-4 w-4 text-[#A07850]" /> Education
              </h3>
              <div className="space-y-3 text-sm">
                {persona.education.degree && (
                  <div>
                    <span className="text-xs text-[#9B8577] block">Degree</span>
                    <span className="font-medium text-[#3B2A1A]">{persona.education.degree}</span>
                  </div>
                )}
                {persona.education.institution && (
                  <div>
                    <span className="text-xs text-[#9B8577] block">Institution</span>
                    <span className="text-[#3B2A1A]">{persona.education.institution}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
