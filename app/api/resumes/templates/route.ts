import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Fetch active templates
    const { data: templates, error } = await supabase
      .from("resume_templates")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) throw error

    // If no templates found, return defaults
    if (!templates || templates.length === 0) {
      return NextResponse.json([
        { id: "modern", name: "Modern Dark Side", base_layout: "modern", primary_color: "#0F172A", is_active: true },
        { id: "minimal", name: "Blue Minimal", base_layout: "minimal", primary_color: "#3B82F6", is_active: true },
        { id: "professional", name: "Solid Header Circle Photo", base_layout: "professional", primary_color: "#10B981", is_active: true },
        { id: "creative", name: "Peach Split", base_layout: "creative", primary_color: "#F97316", is_active: true }
      ])
    }

    return NextResponse.json(templates)
  } catch (error) {
    console.error("Fetch templates error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
