"use client"

import { useState, useRef, useDeferredValue } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save, ArrowLeft, Plus, X, Download, User, AtSign, Briefcase, GraduationCap, Palette, Check, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { TemplateOne, TemplateTwo, TemplateThree, TemplateFour } from "./resume-template-views"
import { resumeColorToHex } from "@/lib/resumes/normalize"

interface ResumeEditorProps {
  resume: any
  isNew?: boolean
  personas?: any[]
}

const STEPS = [
  { id: "basic", label: "Basic info", desc: "Name, title, summary", icon: User },
  { id: "contact", label: "Contact", desc: "Email, phone, links", icon: AtSign },
  { id: "experience", label: "Experience & skills", desc: "Work history, skills", icon: Briefcase },
  { id: "education", label: "Education", desc: "Degrees, institutions", icon: GraduationCap },
  { id: "design", label: "Design", desc: "Template, color", icon: Palette },
]

const TEMPLATES = [
  { id: "modern", name: "Modern Dark Side", primary_color: "#0F172A" },
  { id: "minimal", name: "Blue Minimal", primary_color: "#3B82F6" },
  { id: "professional", name: "Circle Photo", primary_color: "#10B981" },
  { id: "creative", name: "Peach Split", primary_color: "#F97316" },
]

const COLORS = ["#0071e3", "#10B981", "#8B5CF6", "#DC2626", "#F97316", "#0F172A", "#A07850", "#000000"]

export function ResumeEditor({ resume, isNew = false, personas = [] }: ResumeEditorProps) {
  const router = useRouter()
  
  // Use existing template style or map 'modern' -> 'system_template_id' later. For now, keep as is.
  const [formData, setFormData] = useState({
    ...resume,
    template_style: resume.template_style || "modern",
    color_scheme: resumeColorToHex(resume.color_scheme),
  })
  
  const deferredFormData = useDeferredValue(formData)
  
  const [currentStep, setCurrentStep] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [hasSavedOnce, setHasSavedOnce] = useState(!isNew)
  const [error, setError] = useState<string | null>(null)
  const prevPersonaIdRef = useRef<string | null>(null)
  const [newSkill, setNewSkill] = useState("")

  const getArray = (val: any) => Array.isArray(val) ? val : []

  const handlePersonaSelect = (personaId: string) => {
    if (!personaId) return
    const selectedPersona = personas.find(p => p.id === personaId)
    if (!selectedPersona) return

    setFormData((prev: any) => ({
      ...prev,
      persona_id: personaId,
      full_name: selectedPersona.name || prev.full_name,
      title: selectedPersona.career?.title || "Professional Title",
      summary: selectedPersona.description || "",
      experience: selectedPersona.career ? [{
        company: selectedPersona.career.industry || "Industry",
        title: selectedPersona.career.title || "Job Title",
        duration: selectedPersona.career.experience_years ? `${selectedPersona.career.experience_years} Years` : "",
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
  }

  const handleSave = async (redirect = false) => {
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
      
      setHasSavedOnce(true)

      if (redirect) {
        router.refresh()
        router.push("/dashboard/resumes")
      }
    } catch (error) {
      console.error("Error saving resume:", error)
      setError(error instanceof Error ? error.message : "Unable to save resume")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownloadPDF = () => {
    if (!resume?.id && !hasSavedOnce) return
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

  const getActiveLayout = () => {
    const activeTemplate = templates.find(t => t.id === formData.template_style || t.base_layout === formData.template_style)
    return activeTemplate ? activeTemplate.base_layout : formData.template_style
  }

  const renderPreview = () => {
    const layout = getActiveLayout()
    switch (layout) {
      case "minimal": return <TemplateTwo resume={deferredFormData} />
      case "professional": return <TemplateThree resume={deferredFormData} />
      case "creative": return <TemplateFour resume={deferredFormData} />
      case "modern":
      default:
        return <TemplateOne resume={deferredFormData} />
    }
  }
  
  const validateStep = (stepIdx: number) => {
    if (stepIdx === 0) return formData.full_name?.length > 0;
    return true; // Simple validation
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-[#3B2A1A]">Tell us about yourself</h2>
              <p className="text-sm text-[#6B4C30] mb-4">This appears at the top of your resume.</p>
              
              {/* Persona Auto-fill Banner */}
              {personas && personas.length > 0 && (
                <div className="bg-[#F5EDE2] p-4 rounded-xl border border-[#D4B896] mb-6 flex items-center justify-between gap-4">
                  <div className="text-sm text-[#6B4C30]">
                    <span className="font-semibold text-[#A07850] block mb-1">Auto-fill from Persona</span>
                    Select a persona to populate your resume instantly.
                  </div>
                  <select
                    className="p-2 border border-[#D4B896] rounded-lg text-sm bg-white"
                    value={formData.persona_id || ""}
                    onChange={(e) => handlePersonaSelect(e.target.value)}
                  >
                    <option value="">Select Persona...</option>
                    {personas.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Full name <span className="text-red-500">*</span></Label>
                  <Input 
                    value={formData.full_name || ""} 
                    onChange={(e) => updateField("full_name", e.target.value)} 
                    placeholder="Alex Johnson" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Professional title</Label>
                  <Input 
                    value={formData.title || ""} 
                    onChange={(e) => updateField("title", e.target.value)} 
                    placeholder="Product Designer" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Summary</Label>
                  <Textarea
                    rows={5}
                    value={formData.summary || ""}
                    onChange={(e) => updateField("summary", e.target.value)}
                    placeholder="A short paragraph about you..."
                    className="resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-[#3B2A1A]">How can employers reach you?</h2>
              <p className="text-sm text-[#6B4C30] mb-4">Only include what you're comfortable sharing.</p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input value={formData.email || ""} onChange={(e) => updateField("email", e.target.value)} placeholder="alex@example.com" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Phone</Label>
                    <Input value={formData.phone || ""} onChange={(e) => updateField("phone", e.target.value)} placeholder="+1 555 000 0000" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Location</Label>
                  <Input value={formData.location || ""} onChange={(e) => updateField("location", e.target.value)} placeholder="San Francisco, CA" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>LinkedIn</Label>
                    <Input value={formData.linkedin || ""} onChange={(e) => updateField("linkedin", e.target.value)} placeholder="linkedin.com/in/..." />
                  </div>
                  <div className="space-y-1.5">
                    <Label>GitHub</Label>
                    <Input value={formData.github || ""} onChange={(e) => updateField("github", e.target.value)} placeholder="github.com/..." />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Personal website</Label>
                  <Input value={formData.website || ""} onChange={(e) => updateField("website", e.target.value)} placeholder="https://yoursite.com" />
                </div>
              </div>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-[#3B2A1A]">Work experience</h2>
              <p className="text-sm text-[#6B4C30] mb-4">Add your most recent roles first.</p>
              
              <div className="space-y-4">
                {getArray(formData.experience).map((item: any, index: number) => (
                  <div key={index} className="p-4 border border-[#D4B896] rounded-xl bg-[#FDFAF6] space-y-3 relative group">
                    <button 
                      onClick={() => removeArrayItem("experience", index)}
                      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Job title</Label>
                        <Input value={item.title || ""} onChange={(e) => updateArrayItem("experience", index, "title", e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Company</Label>
                        <Input value={item.company || ""} onChange={(e) => updateArrayItem("experience", index, "company", e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Duration</Label>
                      <Input value={item.duration || ""} onChange={(e) => updateArrayItem("experience", index, "duration", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Description</Label>
                      <Textarea rows={3} value={item.description || ""} onChange={(e) => updateArrayItem("experience", index, "description", e.target.value)} className="resize-none" />
                    </div>
                  </div>
                ))}
                
                <Button variant="outline" onClick={() => addArrayItem("experience")} className="w-full border-dashed border-2 border-[#D4B896] text-[#A07850] hover:bg-[#F5EDE2]">
                  <Plus className="h-4 w-4 mr-2" /> Add experience
                </Button>
              </div>

              <div className="mt-8">
                <h3 className="text-sm font-medium text-[#3B2A1A] mb-1">Skills</h3>
                <p className="text-xs text-[#9B8577] mb-3">Press Enter to add.</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {getArray(formData.skills).map((skill: any, index: number) => (
                    <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F5EDE2] text-[#A07850] text-sm rounded-full border border-[#E8DDD1]">
                      {typeof skill === "string" ? skill : skill?.name || ""}
                      <button onClick={() => removeSkill(index)} className="hover:text-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input 
                    value={newSkill} 
                    onChange={e => setNewSkill(e.target.value)} 
                    placeholder="e.g. Figma, TypeScript..."
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                  />
                  <Button variant="outline" onClick={addSkill} className="px-3"><Plus className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-[#3B2A1A]">Education</h2>
              <p className="text-sm text-[#6B4C30] mb-4">Add your highest qualification first.</p>
              
              <div className="space-y-4">
                {getArray(formData.education).map((item: any, index: number) => (
                  <div key={index} className="p-4 border border-[#D4B896] rounded-xl bg-[#FDFAF6] space-y-3 relative group">
                    <button 
                      onClick={() => removeArrayItem("education", index)}
                      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Degree</Label>
                        <Input value={item.degree || ""} onChange={(e) => updateArrayItem("education", index, "degree", e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Field of study</Label>
                        <Input value={item.field || ""} onChange={(e) => updateArrayItem("education", index, "field", e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Institution</Label>
                        <Input value={item.institution || ""} onChange={(e) => updateArrayItem("education", index, "institution", e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Graduation year</Label>
                        <Input value={item.graduation_year || ""} onChange={(e) => updateArrayItem("education", index, "graduation_year", e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button variant="outline" onClick={() => addArrayItem("education")} className="w-full border-dashed border-2 border-[#D4B896] text-[#A07850] hover:bg-[#F5EDE2]">
                  <Plus className="h-4 w-4 mr-2" /> Add education
                </Button>
              </div>
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-[#3B2A1A]">Pick your style</h2>
              <p className="text-sm text-[#6B4C30] mb-4">Choose a layout and accent color.</p>
              
              <div className="space-y-6">
                <div>
                  <Label className="text-xs mb-2 block text-[#9B8577]">Template</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {TEMPLATES.map(t => (
                      <div 
                        key={t.id} 
                        onClick={() => setFormData(prev => ({ ...prev, template_style: t.id, color_scheme: t.primary_color || prev.color_scheme }))}
                        className={`border rounded-xl p-3 cursor-pointer text-center transition-all ${
                          formData.template_style === t.id 
                            ? 'border-2 border-[#0071e3] bg-[#e8f0fe]' 
                            : 'border-[#D4B896] hover:border-[#A07850]'
                        }`}
                      >
                        <div className="w-full h-10 rounded mb-2 opacity-80" style={{ backgroundColor: t.primary_color || '#A07850' }}></div>
                        <span className={`text-xs ${formData.template_style === t.id ? 'text-[#0071e3] font-medium' : 'text-[#6B4C30]'}`}>
                          {t.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-xs mb-2 block text-[#9B8577]">Accent color</Label>
                  <div className="flex flex-wrap gap-3">
                    {COLORS.map(c => (
                      <div 
                        key={c}
                        onClick={() => updateField('color_scheme', c)}
                        className={`w-8 h-8 rounded-full cursor-pointer transition-transform hover:scale-110 ${
                          formData.color_scheme === c ? 'outline outline-2 outline-offset-2 outline-[#0071e3]' : ''
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      default: return null
    }
  }

  return (
    <div className="h-full w-full flex flex-col p-4 md:p-6 pb-0">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <Link href="/dashboard/resumes" className="inline-flex items-center text-sm text-[#A07850] hover:text-[#8A6640] group transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1 transition-transform group-hover:-translate-x-1" />
          Back to Dashboard
        </Link>
      </div>
      
      {error && (
        <div className="mb-4 shrink-0 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-[280px_1fr] flex-1 min-h-0 border border-[#E8DDD1] rounded-t-2xl overflow-hidden bg-white shadow-sm">
        
        {/* Sidebar */}
        <div className="bg-[#FDFAF6] border-r border-[#E8DDD1] flex flex-col py-6">
          <div className="px-6 mb-6">
            <h1 className="font-['Playfair_Display'] text-xl font-bold text-[#3B2A1A]">Resume Builder</h1>
            <p className="text-xs text-[#9B8577] mt-1">5 steps to finish</p>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {STEPS.map((step, i) => {
              const Icon = step.icon
              const isActive = currentStep === i
              const isDone = i < currentStep && validateStep(i)
              
              return (
                <button 
                  key={step.id}
                  onClick={() => setCurrentStep(i)}
                  className={`w-full text-left px-6 py-3 flex items-center gap-3 transition-colors relative ${isActive ? 'bg-white' : 'hover:bg-[#F5EDE2]/50'}`}
                >
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0071e3] rounded-r-md" />}
                  
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isActive ? 'bg-[#e8f0fe] text-[#0071e3]' : 
                    isDone ? 'bg-[#e1f5ee] text-[#0f6e56]' : 
                    'bg-[#F5EDE2] text-[#A07850]'
                  }`}>
                    {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  
                  <div>
                    <span className={`block text-sm font-medium ${isActive ? 'text-[#3B2A1A]' : 'text-[#6B4C30]'}`}>
                      {step.label}
                    </span>
                    <span className="block text-[11px] text-[#9B8577]">{step.desc}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 min-w-0 bg-white">
          
          {/* Topbar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8DDD1]">
            <span className="font-semibold text-[#3B2A1A]">{STEPS[currentStep].label}</span>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                className="h-8 px-3 text-xs" 
                onClick={handleDownloadPDF}
                disabled={(!resume?.id && !hasSavedOnce) || currentStep !== 4}
                title={currentStep !== 4 ? "Reach the Design step to download" : ""}
              >
                <Download className="h-3.5 w-3.5 mr-1.5" /> PDF
              </Button>
              <Button 
                className="h-8 px-3 text-xs bg-[#A07850] hover:bg-[#8A6640] text-white" 
                onClick={() => handleSave(false)}
                disabled={isSaving}
              >
                <Save className="h-3.5 w-3.5 mr-1.5" /> 
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 overflow-hidden">
            
            {/* Form Panel */}
            <div className="p-6 overflow-y-auto border-r border-[#E8DDD1]">
              {renderStepContent()}
            </div>

            {/* Preview Panel */}
            <div className="bg-[#F9F6F0] p-6 flex flex-col items-center overflow-y-auto">
              <div className="w-full max-w-[400px]">
                <div className="text-[10px] font-semibold text-[#A07850] uppercase tracking-wider mb-4 flex items-center justify-between">
                  Live Preview
                  {isSaving && <span className="animate-pulse text-[#3B82F6]">Saving...</span>}
                </div>
                
                <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-md overflow-hidden transform scale-[0.6] origin-top md:scale-[0.8] lg:scale-[0.9] xl:scale-100 transition-all duration-300">
                  {/* Container for absolute rendering scaling if needed, but standard components will just render normally */}
                  {renderPreview()}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Nav */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#E8DDD1]">
            <Button 
              variant="ghost" 
              onClick={() => setCurrentStep(c => Math.max(0, c - 1))}
              disabled={currentStep === 0}
              className="text-[#6B4C30]"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>

            <div className="flex gap-2">
              {STEPS.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all ${
                    currentStep === i ? 'w-5 bg-[#0071e3]' : 
                    i < currentStep ? 'w-1.5 bg-[#1d9e75]' : 
                    'w-1.5 bg-[#E8DDD1]'
                  }`} 
                />
              ))}
            </div>

            {currentStep < STEPS.length - 1 ? (
              <Button 
                className="bg-[#A07850] hover:bg-[#8A6640] text-white" 
                onClick={() => setCurrentStep(c => Math.min(STEPS.length - 1, c + 1))}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button 
                className="bg-[#10B981] hover:bg-[#059669] text-white" 
                onClick={() => handleSave(true)}
                disabled={isSaving}
              >
                <Check className="h-4 w-4 mr-1.5" /> Finish & Exit
              </Button>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
