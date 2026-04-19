"use client"

import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye, Briefcase, GraduationCap, ArrowRight, TrendingUp } from "lucide-react"
import Link from "next/link"

interface CommunityPersonasProps {
  personas: any[]
}

export function CommunityPersonas({ personas }: CommunityPersonasProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [industryFilter, setIndustryFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState("views")

  const industries = Array.from(new Set(personas.map((p) => p.career?.industry).filter(Boolean)))

  const filteredPersonas = useMemo(() => {
    const filtered = personas.filter((persona) => {
      const matchesSearch =
        persona.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        persona.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        persona.career?.title?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesIndustry = industryFilter === "all" || persona.career?.industry === industryFilter
      return matchesSearch && matchesIndustry
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "views":  return (b.views_count || 0) - (a.views_count || 0)
        case "recent": return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "name":   return a.name.localeCompare(b.name)
        default:       return 0
      }
    })

    return filtered
  }, [personas, searchQuery, industryFilter, sortBy])

  return (
    <div className="space-y-6">
      {/* Search + Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, title, or description…"
          className="md:w-96"
        />
        <div className="flex gap-2">
          <Select value={industryFilter} onValueChange={setIndustryFilter}>
            <SelectTrigger className="w-[180px] bg-white border-[#D4B896] rounded-xl">
              <SelectValue placeholder="Industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              {industries.map((industry) => (
                <SelectItem key={industry} value={industry}>{industry}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[150px] bg-white border-[#D4B896] rounded-xl">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="views">Most Viewed</SelectItem>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="name">Name (A–Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Count */}
      <p className="text-sm text-[#9B8577]">
        Showing <span className="font-semibold text-[#3B2A1A]">{filteredPersonas.length}</span> of {personas.length} personas
      </p>

      {/* Grid */}
      {filteredPersonas.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPersonas.map((persona, idx) => {
            const isTopViewed = idx < 3 && sortBy === "views" && (persona.views_count || 0) > 0
            return (
              <div
                key={persona.id}
                className="group relative bg-white rounded-2xl border border-[#E8DDD1] overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                {/* Top gradient accent */}
                <div className="h-1.5 w-full bg-gradient-to-r from-[#A07850] via-[#C4976A] to-[#D4B896]" />

                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <Avatar className="h-12 w-12 ring-2 ring-[#D4B896] ring-offset-1 flex-shrink-0">
                      <AvatarImage src={persona.profiles?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback className="bg-[#F5EDE2] text-[#A07850] font-bold text-base">
                        {persona.profiles?.full_name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h3 className="font-semibold text-[#3B2A1A] text-base truncate">{persona.name}</h3>
                        {isTopViewed && (
                          <span className="flex-shrink-0 flex items-center gap-0.5 text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                            <TrendingUp className="h-2.5 w-2.5" /> Top
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#9B8577] truncate">{persona.profiles?.full_name}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-[#6B4C30] line-clamp-2 mb-4 leading-relaxed">
                    {persona.description}
                  </p>

                  {/* Career Info */}
                  <div className="space-y-2 mb-4">
                    {persona.career?.title && (
                      <div className="flex items-center gap-2 text-sm text-[#3B2A1A]">
                        <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-[#F5EDE2] flex items-center justify-center">
                          <Briefcase className="h-3.5 w-3.5 text-[#A07850]" />
                        </div>
                        <span className="font-medium truncate">{persona.career.title}</span>
                      </div>
                    )}
                    {persona.education?.degree && (
                      <div className="flex items-center gap-2 text-sm text-[#9B8577]">
                        <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-[#F5EDE2] flex items-center justify-center">
                          <GraduationCap className="h-3.5 w-3.5 text-[#A07850]" />
                        </div>
                        <span className="truncate">{persona.education.degree}</span>
                      </div>
                    )}
                  </div>

                  {/* Industry + Skills */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {persona.career?.industry && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#A07850] text-white">
                        {persona.career.industry}
                      </span>
                    )}
                    {persona.career?.specializations?.slice(0, 3).map((skill: string, i: number) => (
                      <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-[#F5EDE2] text-[#6B4C30] border border-[#E8DDD1]">
                        {skill}
                      </span>
                    ))}
                    {(persona.career?.specializations?.length || 0) > 3 && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#F5EDE2] text-[#9B8577] border border-[#E8DDD1]">
                        +{persona.career.specializations.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#F0E8DE]">
                    <div className="flex items-center gap-1.5 text-sm text-[#9B8577]">
                      <Eye className="h-4 w-4" />
                      <span>{persona.views_count || 0} views</span>
                    </div>
                    <Link
                      href={`/community/personas/${persona.id}`}
                      className="flex items-center gap-1 text-sm font-medium text-[#A07850] hover:text-[#7A5C38] group/link transition-colors"
                    >
                      View Profile
                      <ArrowRight className="h-3.5 w-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-[#E8DDD1]">
          <div className="w-16 h-16 rounded-2xl bg-[#F5EDE2] flex items-center justify-center mb-4">
            <Briefcase className="h-8 w-8 text-[#A07850] opacity-60" />
          </div>
          <h3 className="text-lg font-semibold text-[#3B2A1A] mb-1">No personas found</h3>
          <p className="text-sm text-[#9B8577]">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}
