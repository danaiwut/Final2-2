import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Edit, Image as ImageIcon } from "lucide-react"
import { requireAdmin } from "@/lib/auth/admin"

export default async function ResumeTemplatesAdminPage() {
  await requireAdmin()
  const supabase = await createClient()

  const { data: templates, error } = await supabase
    .from("resume_templates")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching templates:", error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resume Templates</h1>
          <p className="text-muted-foreground mt-1">Manage dynamic resume templates available to users.</p>
        </div>
        <Button asChild>
          <Link href="/admin/resume-templates/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Template
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {templates?.map((template) => (
          <div key={template.id} className="rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col overflow-hidden">
            <div 
              className="h-32 w-full flex items-center justify-center relative overflow-hidden bg-muted"
            >
              {template.thumbnail_url ? (
                <img src={template.thumbnail_url} alt={template.name} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
              )}
              <div 
                className="absolute inset-x-0 bottom-0 h-2" 
                style={{ backgroundColor: template.primary_color }} 
              />
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold leading-none tracking-tight mb-2">{template.name}</h3>
                  <div className="flex gap-2 text-xs">
                    <Badge variant="outline" className="capitalize">
                      {template.base_layout}
                    </Badge>
                    <Badge variant={template.is_active ? "default" : "secondary"}>
                      {template.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="mt-auto pt-4 flex gap-2 border-t">
                {/* We'll just provide a basic edit/deactivate link for now */}
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={`/admin/resume-templates/${template.id}/edit`}>
                    <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ))}

        {(!templates || templates.length === 0) && (
          <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl">
            <h3 className="text-lg font-medium mb-2">No templates found</h3>
            <p className="text-muted-foreground mb-4">Create your first dynamic resume template.</p>
            <Button asChild>
              <Link href="/admin/resume-templates/new">Add Template</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
