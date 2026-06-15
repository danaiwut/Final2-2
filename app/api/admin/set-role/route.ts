import { createClient } from "@/lib/supabase/server"
import { isAdmin, isSuperAdmin } from "@/lib/auth/admin"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if requesting user is admin
    const userIsAdmin = await isAdmin(user.id)
    const userIsSuper = await isSuperAdmin(user.id)

    if (!userIsAdmin) {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
    }

    const { userId, role } = await request.json()

    if (!userId || !role) {
      return NextResponse.json({ error: "Missing userId or role" }, { status: 400 })
    }

    if (!["admin", "user", "company"].includes(role)) {
      return NextResponse.json({ error: "Invalid role. Must be 'admin', 'user', or 'company'" }, { status: 400 })
    }

    // Only super_admin can set role to 'admin'
    if (role === "admin" && !userIsSuper) {
      return NextResponse.json({ error: "Forbidden - Only Super Admin can assign the Admin role" }, { status: 403 })
    }

    // Update user role
    const { error } = await supabase.from("profiles").update({ role }).eq("id", userId)

    if (error) throw error

    return NextResponse.json({ success: true, message: "Role updated successfully" })
  } catch (error) {
    console.error("[v0] Set role error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
