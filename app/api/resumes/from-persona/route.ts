import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// POST - Create or update resume from persona data
export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { persona_id } = await request.json()

  if (!persona_id) {
    return NextResponse.json({ error: "Persona ID is required" }, { status: 400 })
  }

  // Fetch persona data
  const { data: persona, error: personaError } = await supabase
    .from("personas")
    .select("*")
    .eq("id", persona_id)
    .eq("user_id", user.id)
    .single()

  if (personaError || !persona) {
    return NextResponse.json({ error: "Persona not found" }, { status: 404 })
  }

  // Fetch user profile for additional data
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Check if resume already exists for this persona
  const { data: existingResume } = await supabase
    .from("resumes")
    .select("id")
    .eq("persona_id", persona_id)
    .eq("user_id", user.id)
    .maybeSingle()

  // Prepare resume data from persona
  const resumeData = {
    user_id: user.id,
    persona_id: persona_id,
    title: `${persona.name} Resume`,
    full_name: profile?.full_name || persona.name,
    email: user.email,
    summary: persona.bio || "",
    skills: persona.skills || [],
    experience: persona.experience || [],
    education: persona.education || [],
    projects: persona.projects || [],
    template_style: persona.tone === "professional" ? "professional" : "modern",
    color_scheme: "brown",
    font_family: "inter",
  }

  let resume

  if (existingResume) {
    // Update existing resume
    const { data, error } = await supabase
      .from("resumes")
      .update(resumeData)
      .eq("id", existingResume.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    resume = data
  } else {
    // Create new resume
    const { data, error } = await supabase
      .from("resumes")
      .insert(resumeData)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    resume = data
  }

  return NextResponse.json({ resume }, { status: 200 })
}
