"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Save, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface ResumeTemplateFormProps {
  initialData?: any
  isEdit?: boolean
}

const BASE_LAYOUTS = [
  { id: "modern", name: "Modern Dark Side" },
  { id: "minimal", name: "Blue Header Minimal" },
  { id: "professional", name: "Solid Header Circle Photo" },
  { id: "creative", name: "Peach Split" }
]

export function ResumeTemplateForm({ initialData, isEdit = false }: ResumeTemplateFormProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    base_layout: initialData?.base_layout || "modern",
    primary_color: initialData?.primary_color || "#0F172A",
    thumbnail_url: initialData?.thumbnail_url || "",
    is_active: initialData?.is_active ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      const endpoint = isEdit ? `/api/admin/resume-templates/${initialData.id}` : "/api/admin/resume-templates"
      const method = isEdit ? "PUT" : "POST"

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save template")
      }

      router.push("/admin/resume-templates")
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/admin/resume-templates" className="text-sm text-muted-foreground hover:underline inline-flex items-center mb-4">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Templates
        </Link>
        <h1 className="text-3xl font-bold">{isEdit ? "Edit Template" : "New Template"}</h1>
        <p className="text-muted-foreground mt-1">Configure the base layout and styling for this template.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-md bg-destructive/15 text-destructive text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Template Details</CardTitle>
            <CardDescription>Basic information and visibility.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Ocean Blue Minimal"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <Label htmlFor="is_active" className="text-base">Active Status</Label>
                <p className="text-sm text-muted-foreground">Make this template available to users.</p>
              </div>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Design Configuration</CardTitle>
            <CardDescription>Select the core layout and default color.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Base Layout</Label>
              <Select
                value={formData.base_layout}
                onValueChange={(val) => setFormData({ ...formData, base_layout: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a layout" />
                </SelectTrigger>
                <SelectContent>
                  {BASE_LAYOUTS.map((layout) => (
                    <SelectItem key={layout.id} value={layout.id}>
                      {layout.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="primary_color">Primary Color (Hex)</Label>
              <div className="flex gap-3 items-center">
                <Input
                  id="primary_color"
                  required
                  type="text"
                  pattern="^#[0-9A-Fa-f]{6}$"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  placeholder="#0F172A"
                  className="flex-1"
                />
                <div 
                  className="w-10 h-10 rounded-md border" 
                  style={{ backgroundColor: formData.primary_color }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Media</CardTitle>
            <CardDescription>Upload a thumbnail to show users in the resume builder.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="thumbnail_url">Thumbnail URL (Optional)</Label>
              <Input
                id="thumbnail_url"
                type="url"
                value={formData.thumbnail_url}
                onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                placeholder="https://example.com/thumbnail.png"
              />
              {formData.thumbnail_url && (
                <div className="mt-4 rounded-md overflow-hidden border w-48 h-48">
                  <img src={formData.thumbnail_url} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Template"}
          </Button>
        </div>
      </form>
    </div>
  )
}
