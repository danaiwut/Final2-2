import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function requireAdmin() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const isSuper = profile?.email?.includes("danaiwut") || profile?.email === "jantaneepapawarin@gmail.com"

  if (profile?.role !== "admin" && !isSuper) {
    redirect("/dashboard")
  }

  return { user, profile }
}

export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data: profile } = await supabase.from("profiles").select("role, email").eq("id", userId).single()
  const isSuper = profile?.email?.includes("danaiwut") || profile?.email === "jantaneepapawarin@gmail.com"
  return profile?.role === "admin" || isSuper
}

export async function isSuperAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data: profile } = await supabase.from("profiles").select("email").eq("id", userId).single()
  return !!(profile?.email?.includes("danaiwut") || profile?.email === "jantaneepapawarin@gmail.com")
}

export async function isCompany(userId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single()
  return profile?.role === "company"
}

export async function isVerifiedCompany(userId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, verification_status")
    .eq("id", userId)
    .single()
  return profile?.role === "company" && profile?.verification_status === "verified"
}

export async function requireCompany() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profile?.role !== "company") {
    redirect("/dashboard")
  }

  return { user, profile }
}

export async function requireVerifiedCompany() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profile?.role !== "company" || profile?.verification_status !== "verified") {
    redirect("/dashboard/company/verification")
  }

  return { user, profile }
}

export async function requireStandardUser() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profile?.role === "company") {
    redirect("/dashboard")
  }

  return { user, profile }
}
