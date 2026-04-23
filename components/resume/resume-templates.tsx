"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Eye } from "lucide-react"

interface ResumeTemplatesProps {
  selectedTemplate: string
  onSelect: (template: string) => void
  selectedColor: string
  onColorChange: (color: string) => void
}

const templates = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean layout with sidebar accent",
    preview: "bg-gradient-to-br from-slate-50 to-slate-100",
    accent: "border-l-4 border-l-indigo-500",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional professional format",
    preview: "bg-gradient-to-br from-gray-50 to-gray-100",
    accent: "border-t-4 border-t-gray-700",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Sleek and minimalistic design",
    preview: "bg-white",
    accent: "border border-gray-200",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Bold colors and unique layout",
    preview: "bg-gradient-to-br from-purple-50 to-pink-50",
    accent: "border-l-4 border-l-purple-500",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Formal and corporate style",
    preview: "bg-gradient-to-br from-blue-50 to-blue-100",
    accent: "border-t-4 border-t-blue-700",
  },
]

const colorSchemes = [
  { id: "brown", color: "#A07850", name: "Brown" },
  { id: "blue", color: "#3B82F6", name: "Blue" },
  { id: "green", color: "#10B981", name: "Green" },
  { id: "purple", color: "#8B5CF6", name: "Purple" },
  { id: "monochrome", color: "#374151", name: "Monochrome" },
  { id: "red", color: "#EF4444", name: "Red" },
  { id: "orange", color: "#F97316", name: "Orange" },
]

export function ResumeTemplates({
  selectedTemplate,
  onSelect,
  selectedColor,
  onColorChange,
}: ResumeTemplatesProps) {
  const [previewId, setPreviewId] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Choose Template</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => onSelect(template.id)}
              className={`relative group rounded-xl overflow-hidden border-2 transition-all duration-200 hover:shadow-lg ${
                selectedTemplate === template.id
                  ? "border-indigo-500 shadow-md ring-2 ring-indigo-200"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {/* Template Preview */}
              <div className={`${template.preview} ${template.accent} p-3 h-32 flex flex-col`}>
                {/* Mock resume content */}
                <div className="w-12 h-2 bg-gray-400 rounded-full mb-2" />
                <div className="w-20 h-1.5 bg-gray-300 rounded-full mb-3" />
                <div className="space-y-1.5 flex-1">
                  <div className="w-full h-1 bg-gray-200 rounded-full" />
                  <div className="w-3/4 h-1 bg-gray-200 rounded-full" />
                  <div className="w-5/6 h-1 bg-gray-200 rounded-full" />
                  <div className="w-2/3 h-1 bg-gray-200 rounded-full" />
                </div>
              </div>

              {/* Label */}
              <div className="px-3 py-2 bg-white border-t">
                <p className="text-xs font-semibold text-gray-800">{template.name}</p>
                <p className="text-[10px] text-gray-500 truncate">{template.description}</p>
              </div>

              {/* Selected check */}
              {selectedTemplate === template.id && (
                <div className="absolute top-2 right-2 p-1 bg-indigo-500 rounded-full shadow-sm">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Color Scheme */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Color Scheme</h3>
        <div className="flex gap-3">
          {colorSchemes.map((scheme) => (
            <button
              key={scheme.id}
              onClick={() => onColorChange(scheme.id)}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all ${
                selectedColor === scheme.id
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-transparent hover:bg-gray-50"
              }`}
            >
              <div
                className="h-8 w-8 rounded-full shadow-sm border border-gray-200"
                style={{ backgroundColor: scheme.color }}
              />
              <span className="text-[10px] font-medium text-gray-600">{scheme.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
