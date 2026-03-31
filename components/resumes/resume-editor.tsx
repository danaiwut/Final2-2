"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Eye } from "lucide-react"
import { useRouter } from "next/navigation"

interface ResumeEditorProps {
  resume: any
  isNew?: boolean
}

export function ResumeEditor({ resume, isNew = false }: ResumeEditorProps) {
  const router = useRouter()
  const [formData, setFormData] = useState(resume)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (isNew) {
        // Create new resume
        const response = await fetch("/api/resumes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })

        if (response.ok) {
          router.push("/dashboard/resumes")
        }
      } else {
        // Update existing resume
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#3B2A1A]">Edit Resume</h1>
          <p className="text-[#6B4C30]">Customize your resume content and style</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-[#A07850] text-[#A07850]">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-[#A07850] hover:bg-[#7A5C38]"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Content Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4">
              <Card className="border border-[#D4B896] bg-[#F5EDE2]">
                <CardHeader>
                  <CardTitle className="font-['Playfair_Display'] text-[#3B2A1A]">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        value={formData.full_name || ""}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={formData.email || ""}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        value={formData.phone || ""}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        value={formData.location || ""}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Professional Summary</Label>
                    <Textarea
                      rows={4}
                      value={formData.summary || ""}
                      onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="experience">
              <Card className="border border-[#D4B896] bg-[#F5EDE2]">
                <CardHeader>
                  <CardTitle className="font-['Playfair_Display'] text-[#3B2A1A]">Work Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#6B4C30]">Add your work experience here</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="education">
              <Card className="border border-[#D4B896] bg-[#F5EDE2]">
                <CardHeader>
                  <CardTitle className="font-['Playfair_Display'] text-[#3B2A1A]">Education</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#6B4C30]">Add your education here</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="skills">
              <Card className="border border-[#D4B896] bg-[#F5EDE2]">
                <CardHeader>
                  <CardTitle className="font-['Playfair_Display'] text-[#3B2A1A]">Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#6B4C30]">Add your skills here</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel - Style Customization */}
        <div className="space-y-6">
          <Card className="border border-[#D4B896] bg-[#F5EDE2]">
            <CardHeader>
              <CardTitle className="font-['Playfair_Display'] text-[#3B2A1A]">Resume Style</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Template Style</Label>
                <Select
                  value={formData.template_style}
                  onValueChange={(value) => setFormData({ ...formData, template_style: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="classic">Classic</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Color Scheme</Label>
                <Select
                  value={formData.color_scheme}
                  onValueChange={(value) => setFormData({ ...formData, color_scheme: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brown">Brown</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="monochrome">Monochrome</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Font Family</Label>
                <Select
                  value={formData.font_family}
                  onValueChange={(value) => setFormData({ ...formData, font_family: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inter">Inter</SelectItem>
                    <SelectItem value="playfair">Playfair Display</SelectItem>
                    <SelectItem value="roboto">Roboto</SelectItem>
                    <SelectItem value="lato">Lato</SelectItem>
                    <SelectItem value="opensans">Open Sans</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#D4B896] bg-[#F5EDE2]">
            <CardHeader>
              <CardTitle className="font-['Playfair_Display'] text-[#3B2A1A]">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-[8.5/11] bg-white border border-[#D4B896] rounded p-4">
                <p className="text-xs text-[#6B4C30] text-center">Resume preview will appear here</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
