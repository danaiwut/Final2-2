"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function deletePersona(personaId: string) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "Unauthorized" }
  }

  // Ensure the persona belongs to the user
  const { data: persona } = await supabase
    .from("personas")
    .select("id")
    .eq("id", personaId)
    .eq("user_id", user.id)
    .single()

  if (!persona) {
    return { error: "Persona not found" }
  }

  const { error } = await supabase.from("personas").delete().eq("id", personaId).eq("user_id", user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard/personas")
  return { success: true }
}
