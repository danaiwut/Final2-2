"use client"

import { useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SearchInput } from "@/components/ui/search-input"
import { AdSpace } from "@/components/ads/ad-space"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MapPin, DollarSign, Briefcase, ExternalLink, Bookmark, BookmarkCheck, Send, Loader2, Building2, Clock, Zap, TrendingUp, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import type { Job, Persona, JobMatch } from "@/lib/types"
import Link from "next/link"

interface JobsListProps {
  jobs: Job[]
  personas: Persona[]
  jobMatches: JobMatch[]
  resumes: { id: string; persona_id: string }[]
  userId: string
}

function MatchScoreBadge({ score }: { score: number }) {
  if (score <= 0) return null
  const color =
    score >= 70 ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
    score >= 50 ? "bg-amber-50 text-amber-700 border-amber-200" :
                  "bg-slate-50 text-slate-600 border-slate-200"
  return (
    <span className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${color}`}>
      <Zap className="h-2.5 w-2.5" />
      {score}% Match
    </span>
  )
}

export function JobsList({ jobs, personas, jobMatches, resumes, userId }: JobsListProps) {
  const supabase = createClient()
  const [selectedPersona, setSelectedPersona] = useState<string>("all")
  const [filter, setFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [savingJobId, setSavingJobId] = useState<string | null>(null)
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null)

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [selectedJobToApply, setSelectedJobToApply] = useState<Job | null>(null)
  const [selectedResumeId, setSelectedResumeId] = useState<string>("")
  const [coverLetter, setCoverLetter] = useState("")

  const handleOpenApplyModal = (job: Job) => {
    setSelectedJobToApply(job)
    setSelectedResumeId(resumes.length > 0 ? resumes[0].id : "")
    setCoverLetter("")
    setIsApplyModalOpen(true)
  }

  const handleApplySubmit = async () => {
    if (!selectedJobToApply) return
    if (resumes.length === 0) {
      toast.error("You need a resume to apply.")
      return
    }
    setApplyingJobId(selectedJobToApply.id)
    try {
      const response = await fetch("/api/jobs/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: selectedJobToApply.id, resumeId: selectedResumeId, coverLetter }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to apply")
      }
      toast.success("Successfully applied for the job!")
      setIsApplyModalOpen(false)
      window.location.reload()
    } catch (error: any) {
      toast.error("Error applying", { description: error.message })
    } finally {
      setApplyingJobId(null)
    }
  }

  const calculateMatchScore = (job: Job, persona: Persona): number => {
    let score = 0
    if (persona.career?.specializations && job.skills) {
      const matchingSkills = persona.career.specializations.filter((skill) =>
        job.skills.some((jobSkill) => jobSkill.toLowerCase().includes(skill.toLowerCase()))
      )
      score += (matchingSkills.length / Math.max(job.skills.length, 1)) * 40
    }
    if (persona.career?.industry && job.industry && persona.career.industry.toLowerCase() === job.industry.toLowerCase()) score += 20
    if (persona.career?.experience_years && job.experience_required && persona.career.experience_years >= job.experience_required) score += 15
    if (persona.job_preferences?.remote && job.remote) score += 10
    if (persona.job_preferences?.location && job.location) {
      const matchesLocation = persona.job_preferences.location.some((loc) => job.location?.toLowerCase().includes(loc.toLowerCase()))
      if (matchesLocation) score += 10
    }
    if (persona.job_preferences?.salary_range && job.salary_min && job.salary_max) {
      const { min, max } = persona.job_preferences.salary_range
      if (job.salary_min >= min && job.salary_max <= max) score += 5
    }
    return Math.min(Math.round(score), 100)
  }

  const getJobsWithScores = () => {
    if (selectedPersona === "all") {
      return jobs.map((job) => ({ ...job, match_score: personas.length > 0 ? Math.max(...personas.map((p) => calculateMatchScore(job, p))) : 0 }))
    }
    const persona = personas.find((p) => p.id === selectedPersona)
    return jobs.map((job) => ({ ...job, match_score: persona ? calculateMatchScore(job, persona) : 0 }))
  }

  const filteredJobs = useMemo(() => {
    let filtered = getJobsWithScores()
    if (searchQuery) {
      filtered = filtered.filter((job) =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.skills?.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }
    if (filter === "saved") filtered = filtered.filter((job) => jobMatches.some((m) => m.job_id === job.id && m.status === "saved"))
    else if (filter === "applied") filtered = filtered.filter((job) => jobMatches.some((m) => m.job_id === job.id && m.status === "applied"))
    else if (filter === "high-match") filtered = filtered.filter((job) => job.match_score >= 60)
    return filtered.sort((a, b) => b.match_score - a.match_score)
  }, [jobs, selectedPersona, searchQuery, filter, personas, jobMatches])

  const handleToggleSaveJob = async (jobId: string) => {
    setSavingJobId(jobId)
    try {
      const existingMatch = jobMatches.find((m) => m.job_id === jobId)
  
      if (existingMatch && existingMatch.status === "saved") {
        // Cancel Save (ลบงานที่บันทึกไว้)
        await supabase.from("job_matches").delete().eq("id", existingMatch.id)
      } else {
        // Save Job (บันทึกงานใหม่)
        if (existingMatch) {
          await supabase.from("job_matches").update({ status: "saved" }).eq("id", existingMatch.id)
        } else {
          await supabase.from("job_matches").insert({
            user_id: userId,
            job_id: jobId,
            persona_id: selectedPersona !== "all" ? selectedPersona : personas[0]?.id,
            status: "saved",
            match_score: filteredJobs.find((j) => j.id === jobId)?.match_score || 0,
          })
        }
      }
  
      // Optional: Refresh the page or update state
      window.location.reload()
    } catch (error) {
      console.error("Error toggling save job:", error)
    } finally {
      setSavingJobId(null)
    }
  }

  const isJobSaved = (jobId: string) => jobMatches.some((m) => m.job_id === jobId && m.status === "saved")
  const isJobApplied = (jobId: string) => jobMatches.some((m) => m.job_id === jobId && m.status === "applied")

  const filterOptions = [
    { key: "all",        label: "All Jobs" },
    { key: "high-match", label: "Best Match" },
    { key: "saved",      label: "Saved" },
    { key: "applied",    label: "Applied" },
  ]

  return (
    <div className="space-y-5">
      {/* Search + Filters */}
      <div className="space-y-3">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by title, company, skill, or industry…"
          className="w-full"
        />
        <div className="flex flex-wrap items-center gap-3">
          {/* Persona selector */}
          <Select value={selectedPersona} onValueChange={setSelectedPersona}>
            <SelectTrigger className="w-[200px] bg-white border-[#D4B896] rounded-xl">
              <SelectValue placeholder="Select persona" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Personas</SelectItem>
              {personas.map((persona) => (
                <SelectItem key={persona.id} value={persona.id}>{persona.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filter pills */}
          <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-[#E8DDD1] shadow-sm">
            {filterOptions.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filter === key
                    ? "bg-[#3B2A1A] text-white shadow-sm"
                    : "text-[#6B4C30] hover:bg-[#F5EDE2]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-sm text-[#9B8577]">
        Showing <span className="font-semibold text-[#3B2A1A]">{filteredJobs.length}</span> of {jobs.length} jobs
      </p>

      {/* Job Cards */}
      {filteredJobs.length > 0 ? (
        <div className="space-y-3">
          {filteredJobs.map((job, index) => {
            const saved = isJobSaved(job.id)
            const applied = isJobApplied(job.id)

            return (
              <div key={job.id} className="contents">
                <article className="group bg-white rounded-2xl border border-[#E8DDD1] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Company logo placeholder */}
                        <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#F5EDE2] flex items-center justify-center border border-[#E8DDD1]">
                          <Building2 className="h-5 w-5 text-[#A07850]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start flex-wrap gap-2">
                            <h3 className="font-semibold text-[#3B2A1A] text-base leading-snug">{job.title}</h3>
                            <MatchScoreBadge score={job.match_score} />
                            {job.remote && (
                              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                                Remote
                              </span>
                            )}
                            {applied && (
                              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                <CheckCircle className="h-2.5 w-2.5" /> Applied
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-[#9B8577] mt-0.5 truncate">
                            {job.company}
                            {job.industry && <span className="text-[#C4B5A5]"> · {job.industry}</span>}
                          </p>
                        </div>
                      </div>

                      {/* Save button */}
                      {/* Save button */}
                <button
                   onClick={() => handleToggleSaveJob(job.id)} // เปลี่ยนฟังก์ชันเป็น handleToggleSaveJob
                    disabled={savingJobId === job.id}
                    className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 border ${
                      saved
                      ? "bg-[#A07850] border-[#A07850] text-white"
                      : "bg-white border-[#E8DDD1] text-[#9B8577] hover:border-[#A07850] hover:text-[#A07850]"
                     }`}
>
                    {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                    </button>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-[#6B4C30] leading-relaxed line-clamp-2 mb-3">
                      {job.description}
                    </p>

                    {/* Meta row */}
                    <div className="flex flex-wrap gap-3 text-xs text-[#9B8577] mb-3">
                      {job.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {job.location}
                        </div>
                      )}
                      {job.salary_min && job.salary_max && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5" />
                          ${job.salary_min.toLocaleString()} – ${job.salary_max.toLocaleString()}
                        </div>
                      )}
                      {job.job_type && (
                        <div className="flex items-center gap-1 capitalize">
                          <Clock className="h-3.5 w-3.5" />
                          {job.job_type}
                        </div>
                      )}
                      {job.experience_required && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3.5 w-3.5" />
                          {job.experience_required}+ yrs
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {job.skills.map((skill, i) => (
                          <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-[#F5EDE2] text-[#6B4C30] border border-[#E8DDD1]">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t border-[#F0E8DE]">
                      <Button
                        className="flex-1 bg-[#A07850] hover:bg-[#7A5C38] text-white rounded-xl gap-2 text-sm"
                        onClick={() => handleOpenApplyModal(job)}
                        disabled={applied}
                      >
                        {applied ? (
                          <><CheckCircle className="h-4 w-4" /> Applied</>
                        ) : (
                          <><Send className="h-4 w-4" /> Apply with Resume</>
                        )}
                      </Button>
                      {job.application_url && (
                        <a
                          href={job.application_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-[#D4B896] text-[#6B4C30] hover:bg-[#F5EDE2] transition-all"
                        >
                          External
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </article>

                {(index + 1) % 3 === 0 && index !== filteredJobs.length - 1 && (
                  <AdSpace key={`ad-${index}`} placement="feed" targetPage="jobs" />
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-[#E8DDD1]">
          <div className="w-16 h-16 rounded-2xl bg-[#F5EDE2] flex items-center justify-center mb-4">
            <Briefcase className="h-8 w-8 text-[#A07850] opacity-60" />
          </div>
          <h3 className="text-lg font-semibold text-[#3B2A1A] mb-1">No jobs found</h3>
          <p className="text-sm text-[#9B8577] mb-4">
            {searchQuery ? "Try adjusting your search or filters" : "Try adjusting your filters or add career info to your persona"}
          </p>
          {searchQuery && (
            <Button variant="outline" className="rounded-xl border-[#D4B896] bg-transparent" onClick={() => setSearchQuery("")}>
              Clear Search
            </Button>
          )}
        </div>
      )}

      {/* Apply Modal */}
      <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl border-[#E8DDD1]">
          <DialogHeader>
            <DialogTitle className="font-['Playfair_Display'] text-[#3B2A1A]">
              Apply for {selectedJobToApply?.title}
            </DialogTitle>
            <DialogDescription className="text-[#9B8577]">
              Submit your resume and cover letter to {selectedJobToApply?.company}.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {resumes.length === 0 ? (
              <div className="text-center space-y-4 py-8 bg-[#F5EDE2] rounded-xl">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mx-auto">
                  <Briefcase className="h-7 w-7 text-[#A07850] opacity-60" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#3B2A1A]">No Resumes Found</h3>
                  <p className="text-sm text-[#9B8577] mt-1">Create a resume before applying for jobs.</p>
                </div>
                <Button asChild className="bg-[#A07850] hover:bg-[#7A5C38] text-white rounded-xl">
                  <Link href="/dashboard/resumes/new">Create Resume Now</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#3B2A1A]">Select Resume *</label>
                  <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                    <SelectTrigger className="w-full border-[#D4B896] rounded-xl">
                      <SelectValue placeholder="Select a resume" />
                    </SelectTrigger>
                    <SelectContent>
                      {resumes.map((resume) => {
                        const persona = personas.find((p) => p.id === resume.persona_id)
                        return (
                          <SelectItem key={resume.id} value={resume.id}>
                            {persona?.name ? `${persona.name}'s Resume` : "Untitled Resume"}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#3B2A1A]">Cover Letter <span className="text-[#9B8577] font-normal">(Optional)</span></label>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Introduce yourself to the hiring manager…"
                    className="flex min-h-[120px] w-full rounded-xl border border-[#D4B896] bg-transparent px-3 py-2 text-sm text-[#3B2A1A] placeholder:text-[#C4B5A5] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#A07850]"
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApplyModalOpen(false)} className="rounded-xl border-[#D4B896] bg-transparent text-[#6B4C30]">
              Cancel
            </Button>
            {resumes.length > 0 && (
              <Button
                onClick={handleApplySubmit}
                className="bg-[#A07850] hover:bg-[#7A5C38] text-white rounded-xl"
                disabled={!selectedResumeId || applyingJobId === selectedJobToApply?.id}
              >
                {applyingJobId === selectedJobToApply?.id ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…</>
                ) : (
                  "Submit Application"
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
