"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Edit, Trash2, Download } from "lucide-react"
import Link from "next/link"
import { FadeUp } from "@/components/FadeUp"

interface Resume {
  id: string
  title: string
  template_style: string
  color_scheme: string
  is_default: boolean
  updated_at: string
}

interface ResumesListProps {
  resumes: Resume[]
}

export function ResumesList({ resumes }: ResumesListProps) {
  if (resumes.length === 0) {
    return (
      <Card className="border border-[#D4B896] bg-[#F5EDE2]">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-[#A07850] mb-4" />
          <h3 className="font-['Playfair_Display'] text-xl font-semibold text-[#3B2A1A] mb-2">
            No resumes yet
          </h3>
          <p className="text-[#6B4C30] mb-6">Create your first resume to get started</p>
          <Button asChild className="bg-[#A07850] hover:bg-[#7A5C38]">
            <Link href="/dashboard/resumes/new">Create Resume</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {resumes.map((resume, index) => (
        <FadeUp key={resume.id} delay={index * 0.08}>
          <Card className="border border-[#D4B896] bg-[#F5EDE2] hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="font-['Playfair_Display'] text-lg text-[#3B2A1A]">
                    {resume.title}
                  </CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge className="bg-[#A07850] text-white text-[11px] uppercase tracking-[0.08em]">
                      {resume.template_style}
                    </Badge>
                    {resume.is_default && (
                      <Badge variant="outline" className="text-[11px] uppercase tracking-[0.08em]">
                        Default
                      </Badge>
                    )}
                  </div>
                </div>
                <FileText className="h-8 w-8 text-[#A07850]" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#6B4C30] mb-4">
                Updated {new Date(resume.updated_at).toLocaleDateString()}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="flex-1 border-[#A07850] text-[#A07850] hover:bg-[#A07850] hover:text-white"
                >
                  <Link href={`/dashboard/resumes/${resume.id}/edit`}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#A07850] text-[#A07850] hover:bg-[#A07850] hover:text-white"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </FadeUp>
      ))}
    </div>
  )
}
