"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Printer, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { TemplateOne, TemplateTwo, TemplateThree, TemplateFour } from "./resume-template-views"

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
    color_scheme: resume.color_scheme && resume.color_scheme.startsWith("#") ? resume.color_scheme : "#3B2A1A"
  })
  const [isSaving, setIsSaving] = useState(false)
  const prevPersonaIdRef = useRef<string | null>(null)

  useEffect(() => {
    const personaId = formData.persona_id
    if (!personaId || personaId === prevPersonaIdRef.current) return

    prevPersonaIdRef.current = personaId

    const selectedPersona = personas.find(p => p.id === personaId)
    if (!selectedPersona) return

    setFormData(prev => ({
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
    try {
      if (isNew) {
        const response = await fetch("/api/resumes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
        if (response.ok) {
          router.push("/dashboard/resumes")
        }
      } else {
        const response = await fetch(`/api/resumes/${resume.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
        if (response.ok) {
          router.push("/dashboard/resumes")
        }
      }
    } catch (error) {
      console.error("Error saving resume:", error)
    } finally {
      setIsSaving(false)
    }
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
          <Button variant="outline" className="border-[#A07850] text-[#A07850]" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print / Save PDF
          </Button>
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
                    {personas.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.persona_id && (
                <div className="p-3 bg-[#F5EDE2] rounded-md text-sm text-[#6B4C30] border border-[#D4B896]">
                  Data is synced from Persona: <strong>{personas.find(p => p.id === formData.persona_id)?.name}</strong>
                  <br /><br />
                  <span className="text-xs opacity-80">
                    Cannot modify the text directly here. Update your persona settings to change data.
                  </span>
                </div>
              )}
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
        <div className="xl:col-span-8 flex justify-center bg-gray-100 rounded-xl p-4 border border-gray-200 shadow-inner overflow-auto h-[800px]">
          <div className="w-full max-w-[700px] h-fit md:h-[900px] bg-white shadow-2xl rounded-sm">
            {renderPreview()}
          </div>
        </div>

      </div>
    </div>
  )
}