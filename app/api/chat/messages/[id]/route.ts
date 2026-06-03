import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: messageId } = await params

    // ตรวจสอบว่าเป็นเจ้าของข้อความหรือไม่
    const { data: message, error: fetchError } = await supabase
      .from("chat_messages")
      .select("sender_id")
      .eq("id", messageId)
      .single()

    if (fetchError || !message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    if (message.sender_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Soft delete ข้อความ
    const { error: deleteError } = await supabase
      .from("chat_messages")
      .update({ is_deleted: true, message: "" })
      .eq("id", messageId)

    if (deleteError) throw deleteError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting message:", error)
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: messageId } = await params
    const body = await request.json()
    const { message: newMessageContent } = body

    if (!newMessageContent || !newMessageContent.trim()) {
      return NextResponse.json({ error: "Message content cannot be empty" }, { status: 400 })
    }

    // ตรวจสอบว่าเป็นเจ้าของข้อความหรือไม่
    const { data: message, error: fetchError } = await supabase
      .from("chat_messages")
      .select("sender_id")
      .eq("id", messageId)
      .single()

    if (fetchError || !message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    if (message.sender_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Update ข้อความ
    const { error: updateError } = await supabase
      .from("chat_messages")
      .update({ message: newMessageContent, is_edited: true, updated_at: new Date().toISOString() })
      .eq("id", messageId)

    if (updateError) throw updateError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error editing message:", error)
    return NextResponse.json({ error: "Failed to edit message" }, { status: 500 })
  }
}