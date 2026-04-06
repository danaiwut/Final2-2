import { redirect } from 'next/navigation'
import { createClient } from "@/lib/supabase/server"
import { ChatInterface } from "@/components/chat/chat-interface"

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ conversation?: string }>
}) {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get user's conversations
  const { data: conversations } = await supabase
    .from("chat_conversations")
    .select("*")
    .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
    .order("last_message_at", { ascending: false })

  // Fetch participant profiles separately
  const conversationsWithProfiles = await Promise.all(
    (conversations || []).map(async (conv) => {
      const otherId = conv.participant1_id === user.id ? conv.participant2_id : conv.participant1_id
      const { data: otherProfile } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .eq("id", otherId)
        .single()

      return {
        ...conv,
        participant1: conv.participant1_id === user.id ? profile : otherProfile,
        participant2: conv.participant2_id === user.id ? profile : otherProfile,
        participant1_id: conv.participant1_id,
        participant2_id: conv.participant2_id,
      }
    }),
  )

  const params = await searchParams
  const initialConversationId = params.conversation || null

  return (
    <div className="flex h-[calc(100vh)] flex-col">
      <div className="border-b border-[#E8DDD1] bg-white px-6 py-4">
        <h1 className="font-['Playfair_Display'] text-2xl font-bold text-[#3B2A1A]">Chat</h1>
        <p className="text-sm text-[#9B8577]">Messages and conversations</p>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          currentUserId={user.id}
          initialConversations={conversationsWithProfiles}
          initialConversationId={initialConversationId}
        />
      </div>
    </div>
  )
}
