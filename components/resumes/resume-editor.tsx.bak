"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Save, ArrowLeft, Plus, X, Download } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { TemplateOne, TemplateTwo, TemplateThree, TemplateFour } from "./resume-template-views"
import { resumeColorToHex } from "@/lib/resumes/normalize"

interface ResumeEditorProps {
  resume: any
  isNew?: boolean
  personas?: any[]
}

const TEMPLATES = [
  { id: "modern", name: "Modern Dark Side" },
  { id: "minimal", name: "Blue Header Minimal" },
  { id: "professional", name: "Solid Header Circle Photo" },
  { id: "creative", name: "Peach Split" }
]

const COLORS = ["#3B2A1A", "#3B82F6", "#10B981", "#8B5CF6", "#DC2626", "#F97316", "#0F172A"]

export function ResumeEditor({ resume, isNew = false, personas = [] }: ResumeEditorProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    ...resume,
    template_style: resume.template_style || "modern",
    color_scheme: resumeColorToHex(resume.color_scheme),
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const prevPersonaIdRef = useRef<string | null>(null)
  const [newSkill, setNewSkill] = useState("")

  const getArray = (val: any) => Array.isArray(val) ? val : []

  useEffect(() => {
    const personaId = formData.persona_id
    if (!personaId || personaId === prevPersonaIdRef.current) return

    prevPersonaIdRef.current = personaId

    const selectedPersona = personas.find(p => p.id === personaId)
    if (!selectedPersona) return

    setFormData((prev: any) => ({
      ...prev,
      full_name: selectedPersona.name || prev.full_name,
      title: selectedPersona.career?.title || "Professional Title",
      summary: selectedPersona.description || "",
      experience: selectedPersona.career ? [{
        company: selectedPersona.career.industry || "Industry",
        title: selectedPersona.career.title || "Job Title",
        duration: `${selectedPersona.career.experience_years} Years`,
        description: selectedPersona.career.specializations?.join(", ") || ""
      }] : [],
      education: selectedPersona.education ? [{
        degree: selectedPersona.education.degree,
        field: selectedPersona.education.field,
        institution: selectedPersona.education.institution,
        graduation_year: selectedPersona.education.graduation_year
      }] : [],
      skills: selectedPersona.career?.specializations || [],
      projects: selectedPersona.projects || []
    }))
  }, [formData.persona_id, personas])

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    try {
      const endpoint = isNew ? "/api/resumes" : `/api/resumes/${resume.id}`
      const method = isNew ? "POST" : "PUT"
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || "Unable to save resume")
      }

      router.refresh()
      router.push("/dashboard/resumes")
    } catch (error) {
      console.error("Error saving resume:", error)
      setError(error instanceof Error ? error.message : "Unable to save resume")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownloadPDF = () => {
    if (!resume?.id) return
    window.open(`/resumes/${resume.id}/download?autoprint=1`, "_blank")
  }

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  const updateArrayItem = (field: "experience" | "education" | "projects", index: number, key: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: getArray(prev[field]).map((item: Record<string, any>, itemIndex: number) =>
        itemIndex === index ? { ...item, [key]: value } : item
      ),
    }))
  }

  const addArrayItem = (field: "experience" | "education" | "projects") => {
    const emptyItem =
      field === "experience"
        ? { title: "", company: "", duration: "", description: "" }
        : field === "education"
          ? { degree: "", field: "", institution: "", graduation_year: "" }
          : { title: "", description: "", technologies: [] }

    setFormData((prev: any) => ({
      ...prev,
      [field]: [...getArray(prev[field]), emptyItem],
    }))
  }

  const removeArrayItem = (field: "experience" | "education" | "projects", index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: getArray(prev[field]).filter((_: unknown, itemIndex: number) => itemIndex !== index),
    }))
  }

  const addSkill = () => {
    const trimmed = newSkill.trim()
    if (!trimmed) return

    setFormData((prev: any) => ({
      ...prev,
      skills: [...getArray(prev.skills), trimmed],
    }))
    setNewSkill("")
  }

  const removeSkill = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      skills: getArray(prev.skills).filter((_: unknown, itemIndex: number) => itemIndex !== index),
    }))
  }

  const renderPreview = () => {
    switch (formData.template_style) {
      case "minimal": return <TemplateTwo resume={formData} />
      case "professional": return <TemplateThree resume={formData} />
      case "creative": return <TemplateFour resume={formData} />
      case "modern":
      default:
        return <TemplateOne resume={formData} />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link href="/dashboard/resumes" className="flex items-center text-sm text-[#A07850] hover:underline mb-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Resumes
          </Link>
          <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#3B2A1A]">
            {isNew ? "Create Persona Resume" : "Edit Persona Resume"}
          </h1>
          <p className="text-[#6B4C30]">Select your persona and choose a design template</p>
        </div>
        <div className="flex gap-2">
          {!isNew && (
            <Button
              variant="outline"
              className="border-[#A07850] text-[#A07850] gap-2"
              onClick={handleDownloadPDF}
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#A07850] hover:bg-[#7A5C38]"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Resume"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

        {/* Left Panel - Configurations */}
        <div className="xl:col-span-4 space-y-6">
          <Card className="border border-[#D4B896] bg-white shadow-sm">
            <CardHeader className="bg-[#F5EDE2] border-b border-[#D4B896]">
              <CardTitle className="font-['Playfair_Display'] text-[#3B2A1A]">Resume Data Source</CardTitle>
              <CardDescription>Select a Persona to automatically populate your resume.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Select Persona</Label>
                <Select
                  value={formData.persona_id || ""}
                  onValueChange={(val) => setFormData({ ...formData, persona_id: val })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a persona..." />
                  </SelectTrigger>
                  <SelectContent>
                    {getArray(personas).map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.persona_id && (
                <div className="p-3 bg-[#F5EDE2] rounded-md text-sm text-[#6B4C30] border border-[#D4B896]">
                  Prefilled from Persona: <strong>{getArray(personas).find((p: any) => p.id === formData.persona_id)?.name}</strong>
                  <br /><br />
                  <span className="text-xs opacity-80">
                    You can still edit the resume details below before saving or downloading.
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-[#D4B896] bg-white shadow-sm">
            <CardHeader className="bg-[#F5EDE2] border-b border-[#D4B896]">
              <CardTitle className="font-['Playfair_Display'] text-[#3B2A1A]">Basic Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" value={formData.full_name || ""} onChange={(e) => updateField("full_name", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Professional Title</Label>
                <Input id="title" value={formData.title || ""} onChange={(e) => updateField("title", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="summary">Summary</Label>
                <Textarea
                  id="summary"
                  rows={5}
                  value={formData.summary || ""}
                  onChange={(e) => updateField("summary", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#D4B896] bg-white shadow-sm">
            <CardHeader className="bg-[#F5EDE2] border-b border-[#D4B896]">
              <CardTitle className="font-['Playfair_Display'] text-[#3B2A1A]">Contact</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={formData.email || ""} onChange={(e) => updateField("email", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={formData.phone || ""} onChange={(e) => updateField("phone", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={formData.location || ""} onChange={(e) => updateField("location", e.target.value)} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" value={formData.website || ""} onChange={(e) => updateField("website", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input id="linkedin" value={formData.linkedin || ""} onChange={(e) => updateField("linkedin", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="github">GitHub</Label>
                <Input id="github" value={formData.github || ""} onChange={(e) => updateField("github", e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#D4B896] bg-white shadow-sm">
            <CardHeader className="bg-[#F5EDE2] border-b border-[#D4B896]">
              <CardTitle className="font-['Playfair_Display'] text-[#3B2A1A]">Skills</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  placeholder="Add a skill"
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addSkill()
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addSkill}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {getArray(formData.skills).map((skill: any, index: number) => (
                  <span
                    key={`${typeof skill === "string" ? skill : skill?.name || index}-${index}`}
                    className="inline-flex items-center gap-1 rounded-full bg-[#F5EDE2] px-3 py-1 text-xs text-[#6B4C30]"
                  >
                    {typeof skill === "string" ? skill : skill?.name || ""}
                    <button type="button" onClick={() => removeSkill(index)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#D4B896] bg-white shadow-sm">
            <CardHeader className="bg-[#F5EDE2] border-b border-[#D4B896] flex flex-row items-center justify-between">
              <CardTitle className="font-['Playfair_Display'] text-[#3B2A1A]">Experience</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("experience")}>
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {getArray(formData.experience).length === 0 && (
                <p className="text-sm text-[#9B8577]">No experience entries yet.</p>
              )}
              {getArray(formData.experience).map((item: any, index: number) => (
                <div key={index} className="rounded-lg border border-[#E8DDD1] p-4 space-y-3">
                  <div className="flex justify-end">
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeArrayItem("experience", index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Job Title</Label>
                      <Input value={item.title || ""} onChange={(e) => updateArrayItem("experience", index, "title", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Company</Label>
                      <Input value={item.company || ""} onChange={(e) => updateArrayItem("experience", index, "company", e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Input value={item.duration || ""} onChange={(e) => updateArrayItem("experience", index, "duration", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea rows={4} value={item.description || ""} onChange={(e) => updateArrayItem("experience", index, "description", e.target.value)} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-[#D4B896] bg-white shadow-sm">
            <CardHeader className="bg-[#F5EDE2] border-b border-[#D4B896] flex flex-row items-center justify-between">
              <CardTitle className="font-['Playfair_Display'] text-[#3B2A1A]">Education</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("education")}>
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {getArray(formData.education).length === 0 && (
                <p className="text-sm text-[#9B8577]">No education entries yet.</p>
              )}
              {getArray(formData.education).map((item: any, index: number) => (
                <div key={index} className="rounded-lg border border-[#E8DDD1] p-4 space-y-3">
                  <div className="flex justify-end">
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeArrayItem("education", index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Degree</Label>
                      <Input value={item.degree || ""} onChange={(e) => updateArrayItem("education", index, "degree", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Field</Label>
                      <Input value={item.field || ""} onChange={(e) => updateArrayItem("education", index, "field", e.target.value)} />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Institution</Label>
                      <Input value={item.institution || ""} onChange={(e) => updateArrayItem("education", index, "institution", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Graduation Year</Label>
                      <Input value={item.graduation_year || ""} onChange={(e) => updateArrayItem("education", index, "graduation_year", e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-[#D4B896] bg-white shadow-sm">
            <CardHeader className="bg-[#F5EDE2] border-b border-[#D4B896] flex flex-row items-center justify-between">
              <CardTitle className="font-['Playfair_Display'] text-[#3B2A1A]">Projects</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("projects")}>
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {getArray(formData.projects).length === 0 && (
                <p className="text-sm text-[#9B8577]">No projects entries yet.</p>
              )}
              {getArray(formData.projects).map((item: any, index: number) => (
                <div key={index} className="rounded-lg border border-[#E8DDD1] p-4 space-y-3">
                  <div className="flex justify-end">
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeArrayItem("projects", index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label>Project Title</Label>
                    <Input value={item.title || ""} onChange={(e) => updateArrayItem("projects", index, "title", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea rows={4} value={item.description || ""} onChange={(e) => updateArrayItem("projects", index, "description", e.target.value)} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-[#D4B896] bg-white shadow-sm">
            <CardHeader className="bg-[#F5EDE2] border-b border-[#D4B896]">
              <CardTitle className="font-['Playfair_Display'] text-[#3B2A1A]">Design Template</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-3">
                <Label>Choose Layout</Label>
                <div className="grid grid-cols-2 gap-3">
                  {TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      onClick={() => setFormData({ ...formData, template_style: tmpl.id })}
                      className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${formData.template_style === tmpl.id
                        ? "border-[#A07850] bg-[#F5EDE2]"
                        : "border-gray-200 hover:border-[#D4B896]"
                        }`}
                    >
                      <span className="text-xs font-semibold text-center mt-2">{tmpl.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Theme Color</Label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((col) => (
                    <button
                      key={col}
                      onClick={() => setFormData({ ...formData, color_scheme: col })}
                      style={{ backgroundColor: col }}
                      className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${formData.color_scheme === col ? "border-white ring-2 ring-gray-400" : "border-transparent"
                        }`}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Live Preview */}
        <div className="resume-editor-shell xl:col-span-8 flex justify-center bg-gray-100 rounded-xl p-4 border border-gray-200 shadow-inner overflow-auto h-[800px]">
          <div
            className="resume-preview-sheet w-full max-w-[700px] h-fit md:h-[900px] bg-white shadow-2xl rounded-sm"
          >
            {renderPreview()}
          </div>
        </div>

      </div>
    </div>
  )
}
