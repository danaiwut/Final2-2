import { redirect } from 'next/navigation'
import { createClient } from "@/lib/supabase/server"
import { requireStandardUser } from "@/lib/auth/admin"
import { PersonaForm } from "@/components/personas/persona-form"
import { PersonaVisibilitySettings } from "@/components/personas/persona-visibility-settings"

export default async function EditPersonaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { user } = await requireStandardUser()
  const supabase = await createClient()

  const { data: persona } = await supabase
    .from("personas")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle()

  if (!persona) {
    redirect("/dashboard/personas")
  }

  const isPublic = persona.visibility === "published" || persona.is_public === true

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="font-['Playfair_Display'] text-2xl font-bold text-[#3B2A1A]">Edit Persona</h1>
          <p className="text-sm text-[#9B8577]">Update your AI personality</p>
        </div>
        <PersonaVisibilitySettings personaId={persona.id} isPublic={isPublic} />
        <PersonaForm userId={user.id} persona={persona} />
      </div>
    </div>
  )
}
