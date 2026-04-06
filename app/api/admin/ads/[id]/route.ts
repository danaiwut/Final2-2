import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/auth/admin"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
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
    const { id } = await params

    // ========== UPDATE ==========
    // อัปเดตข้อมูล ad ในตาราง ads โดยกรองจาก id
    // พร้อมอัปเดต updated_at เป็นเวลาปัจจุบัน แล้ว SELECT row ที่อัปเดตกลับมา
    const { data, error } = await supabase
      .from("ads")
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq("id", id)  // WHERE id = ?
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error updating ad", error)
    return NextResponse.json({ error: "Failed to update ad" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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

    const { id } = await params

    // ========== DELETE ==========
    // ลบข้อมูล ad ออกจากตาราง ads โดยกรองจาก id
    const { error } = await supabase.from("ads").delete().eq("id", id) // WHERE id = ?

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting ad", error)
    return NextResponse.json({ error: "Failed to delete ad" }, { status: 500 })
  }
}