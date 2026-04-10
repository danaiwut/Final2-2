import { requireStandardUser } from "@/lib/auth/admin"
import { PersonaForm } from "@/components/personas/persona-form"

export default async function NewPersonaPage() {
  const { user } = await requireStandardUser()

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="font-['Playfair_Display'] text-2xl font-bold text-[#3B2A1A]">Create Persona</h1>
          <p className="text-sm text-[#9B8577]">Define a new AI personality</p>
        </div>
        <PersonaForm userId={user.id} />
      </div>
    </div>
  )
}
