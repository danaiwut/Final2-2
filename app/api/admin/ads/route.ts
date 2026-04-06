import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/auth/admin"

export async function POST(request: Request) {
  try {
    // ========== CONNECT ==========
    // เชื่อมต่อ Supabase client และตรวจสอบ session ของ user ปัจจุบัน
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // ========== INSERT ==========
    // เพิ่มข้อมูล ad ใหม่เข้าตาราง ads แล้ว SELECT row ที่เพิ่งสร้างกลับมา
    const { data, error } = await supabase.from("ads").insert(body).select().single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error creating ad:", error)
    return NextResponse.json({ error: "Failed to create ad" }, { status: 500 })
  }
}