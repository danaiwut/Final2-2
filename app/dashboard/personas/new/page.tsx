import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PersonaForm } from "@/components/personas/persona-form"

export default async function NewPersonaPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

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
