"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { EmptyState } from "@/components/ui/empty-state"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Send, Search, MessageSquare, Menu, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { createClient } from "@/lib/supabase/client"

interface ChatInterfaceProps {
  currentUserId: string
  initialConversations: any[]
  initialConversationId?: string | null
}

export function ChatInterface({ currentUserId, initialConversations, initialConversationId }: ChatInterfaceProps) {
  const [conversations, setConversations] = useState(initialConversations)
  const [selectedConversation, setSelectedConversation] = useState<string | null>(initialConversationId || null)
  const [messages, setMessages] = useState<any[]>([])
  const [message, setMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileConversationsOpen, setMobileConversationsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hoveredMsg, setHoveredMsg] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const selectedChat = conversations.find((c) => c.id === selectedConversation)
  const otherParticipant =
    selectedChat?.participant1_id === currentUserId ? selectedChat.participant2 : selectedChat?.participant1

  useEffect(() => {
    const loadConversation = async () => {
      if (!initialConversationId) return
      const existingConv = conversations.find((c) => c.id === initialConversationId)
      if (existingConv) { setSelectedConversation(initialConversationId); return }
      setIsLoading(true)
      const { data: conversation } = await supabase
        .from("chat_conversations")
        .select(`*, participant1:profiles!participant1_id(id, full_name, avatar_url), participant2:profiles!participant2_id(id, full_name, avatar_url)`)
        .eq("id", initialConversationId)
        .single()
      if (conversation) {
        setConversations((prev) => [conversation, ...prev])
        setSelectedConversation(initialConversationId)
      }
      setIsLoading(false)
    }
    loadConversation()
  }, [initialConversationId, currentUserId])

  useEffect(() => {
    const channel = supabase
      .channel("conversations")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_conversations" }, async (payload) => {
        const newConv = payload.new as any
        if (newConv.participant1_id !== currentUserId && newConv.participant2_id !== currentUserId) return
        const { data } = await supabase
          .from("chat_conversations")
          .select(`*, participant1:profiles!participant1_id(id, full_name, avatar_url), participant2:profiles!participant2_id(id, full_name, avatar_url)`)
          .eq("id", newConv.id)
          .single()
        if (data) setConversations((prev) => [data, ...prev])
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [currentUserId])

  useEffect(() => {
    if (!selectedConversation) return
    loadMessages()
    const channel = supabase
      .channel(`chat:${selectedConversation}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => {
        const newMsg = payload.new as any
        if (
          (newMsg.sender_id === currentUserId && newMsg.receiver_id === otherParticipant?.id) ||
          (newMsg.sender_id === otherParticipant?.id && newMsg.receiver_id === currentUserId)
        ) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })
          scrollToBottom()
          if (newMsg.sender_id === otherParticipant?.id) {
            supabase.from("chat_messages").update({ is_read: true }).eq("id", newMsg.id)
          }
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [selectedConversation, currentUserId, otherParticipant?.id])

  const loadMessages = async () => {
    if (!selectedConversation || !otherParticipant) return
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${otherParticipant.id}),and(sender_id.eq.${otherParticipant.id},receiver_id.eq.${currentUserId})`)
      .order("created_at", { ascending: true })
    setMessages(data || [])
    scrollToBottom()
    await supabase.from("chat_messages").update({ is_read: true }).eq("receiver_id", currentUserId).eq("sender_id", otherParticipant.id)
  }

  const sendMessage = async () => {
    if (!message.trim() || !otherParticipant) return
    try {
      const response = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: otherParticipant.id, message: message.trim(), conversationId: selectedConversation }),
      })
      if (!response.ok) throw new Error("Failed to send message")
      const { message: newMessage } = await response.json()
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMessage.id)) return prev
        return [...prev, newMessage]
      })
      setMessage("")
      scrollToBottom()
      if (selectedConversation) {
        await supabase.from("chat_conversations").update({ last_message_at: new Date().toISOString() }).eq("id", selectedConversation)
        setConversations((prev) =>
          prev.map((conv) => conv.id === selectedConversation ? { ...conv, last_message_at: new Date().toISOString() } : conv)
            .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())
        )
      }
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Failed to send message. Please try again.")
    }
  }

  const deleteMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/chat/messages/${messageId}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete message")
      setMessages((prev) => prev.filter((m) => m.id !== messageId))
    } catch (error) {
      console.error("Error deleting message:", error)
    }
  }

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) }

  const filteredConversations = conversations.filter((conv) => {
    const participant = conv.participant1_id === currentUserId ? conv.participant2 : conv.participant1
    return participant?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  // ---- Conversation List (shared between desktop & mobile) ----
  const ConversationList = ({ onSelect }: { onSelect?: () => void }) => (
    <>
      {/* Search */}
      <div className="p-3 border-b border-[#E8DDD1]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9B8577]" />
          <Input
            placeholder="Search conversations…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 text-sm bg-[#F5EDE2] border-[#E8DDD1] rounded-xl focus-visible:ring-[#A07850] placeholder:text-[#C4B5A5]"
          />
        </div>
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        {filteredConversations.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-[#9B8577]">No conversations found</p>
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="mt-2 text-xs text-[#A07850] hover:underline">
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="p-2 space-y-0.5">
            {filteredConversations.map((conv) => {
              const participant = conv.participant1_id === currentUserId ? conv.participant2 : conv.participant1
              const isActive = selectedConversation === conv.id
              return (
                <button
                  key={conv.id}
                  onClick={() => { setSelectedConversation(conv.id); onSelect?.() }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-left ${
                    isActive
                      ? "bg-[#3B2A1A] text-white"
                      : "hover:bg-[#F5EDE2] text-[#3B2A1A]"
                  }`}
                >
                  <Avatar className="h-9 w-9 flex-shrink-0">
                    <AvatarImage src={participant?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className={`text-sm font-semibold ${isActive ? "bg-[#A07850] text-white" : "bg-[#F5EDE2] text-[#A07850]"}`}>
                      {participant?.full_name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm truncate ${isActive ? "text-white" : "text-[#3B2A1A]"}`}>
                      {participant?.full_name}
                    </p>
                    <p className={`text-xs truncate ${isActive ? "text-white/60" : "text-[#9B8577]"}`}>
                      {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </>
  )

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-[#FDFAF6]">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#F5EDE2] flex items-center justify-center mx-auto">
            <MessageSquare className="h-7 w-7 text-[#A07850] animate-pulse" />
          </div>
          <p className="text-sm text-[#9B8577]">Loading conversation…</p>
        </div>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          icon={MessageSquare}
          title="No conversations yet"
          description="Start connecting with other users by messaging them from their profiles or posts in the community section."
          action={{ label: "Explore Community", href: "/community" }}
        />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#FDFAF6]">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-72 flex-col bg-white border-r border-[#E8DDD1]">
        {/* Sidebar Header */}
        <div className="px-4 py-3.5 border-b border-[#E8DDD1]">
          <h2 className="font-['Playfair_Display'] font-semibold text-[#3B2A1A] text-base">Messages</h2>
          <p className="text-xs text-[#9B8577] mt-0.5">{conversations.length} conversation{conversations.length !== 1 ? "s" : ""}</p>
        </div>
        <ConversationList />
      </div>

      {/* Mobile Sheet + Chat Area */}
      <Sheet open={mobileConversationsOpen} onOpenChange={setMobileConversationsOpen}>
        <SheetContent side="left" className="w-72 p-0 md:hidden bg-white border-r border-[#E8DDD1]">
          <div className="flex flex-col h-full">
            <div className="px-4 py-3.5 border-b border-[#E8DDD1]">
              <h2 className="font-['Playfair_Display'] font-semibold text-[#3B2A1A] text-base">Messages</h2>
            </div>
            <ConversationList onSelect={() => setMobileConversationsOpen(false)} />
          </div>
        </SheetContent>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {selectedConversation && otherParticipant ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-[#E8DDD1] flex-shrink-0">
                <SheetTrigger asChild className="md:hidden">
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F5EDE2] text-[#6B4C30] transition-colors">
                    <Menu className="h-4 w-4" />
                  </button>
                </SheetTrigger>
                <Avatar className="h-9 w-9 flex-shrink-0 ring-2 ring-[#D4B896] ring-offset-1">
                  <AvatarImage src={otherParticipant.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-[#F5EDE2] text-[#A07850] font-semibold text-sm">
                    {otherParticipant.full_name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold text-[#3B2A1A] text-sm truncate">{otherParticipant.full_name}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-5 min-h-0 space-y-1">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-[#F5EDE2] flex items-center justify-center mx-auto">
                        <MessageSquare className="h-7 w-7 text-[#A07850] opacity-60" />
                      </div>
                      <p className="text-sm font-medium text-[#3B2A1A]">No messages yet</p>
                      <p className="text-xs text-[#9B8577]">Say hello to start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, idx) => {
                      const isOwn = msg.sender_id === currentUserId
                      const prevMsg = messages[idx - 1]
                      const nextMsg = messages[idx + 1]
                      const isSameAsPrev = prevMsg?.sender_id === msg.sender_id
                      const isSameAsNext = nextMsg?.sender_id === msg.sender_id
                      const isHovered = hoveredMsg === msg.id

                      return (
                        <div
                          key={msg.id}
                          className={`flex items-end gap-2 ${isOwn ? "justify-end" : "justify-start"} ${isSameAsPrev ? "mt-0.5" : "mt-3"}`}
                          onMouseEnter={() => setHoveredMsg(msg.id)}
                          onMouseLeave={() => setHoveredMsg(null)}
                        >
                          {/* Avatar for other user */}
                          {!isOwn && (
                            <div className="flex-shrink-0 w-7">
                              {!isSameAsNext && (
                                <Avatar className="h-7 w-7">
                                  <AvatarImage src={otherParticipant.avatar_url || "/placeholder.svg"} />
                                  <AvatarFallback className="text-[10px] bg-[#F5EDE2] text-[#A07850]">
                                    {otherParticipant.full_name?.[0] || "U"}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          )}

                          {/* Delete button (own messages) */}
                          {isOwn && isHovered && (
                            <button
                              onClick={() => deleteMessage(msg.id)}
                              className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-[#9B8577] hover:text-rose-500 hover:bg-rose-50 transition-all"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {/* Bubble */}
                          <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[75%] md:max-w-[65%]`}>
                            <div
                              className={`px-3.5 py-2.5 text-sm leading-relaxed break-words ${
                                isOwn
                                  ? `bg-[#A07850] text-white ${isSameAsNext ? "rounded-2xl rounded-br-md" : "rounded-2xl rounded-br-sm"}`
                                  : `bg-white border border-[#E8DDD1] text-[#3B2A1A] shadow-sm ${isSameAsNext ? "rounded-2xl rounded-bl-md" : "rounded-2xl rounded-bl-sm"}`
                              }`}
                            >
                              {msg.message}
                            </div>
                            {/* Timestamp — show only on last in group or hovered */}
                            {(!isSameAsNext || isHovered) && (
                              <p className={`text-[10px] mt-1 px-1 ${isOwn ? "text-[#9B8577]" : "text-[#9B8577]"}`}>
                                {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message Input */}
              <div className="px-4 py-3 bg-white border-t border-[#E8DDD1] flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Type a message…"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                      className="pr-4 bg-[#F5EDE2] border-[#E8DDD1] rounded-xl text-sm text-[#3B2A1A] placeholder:text-[#C4B5A5] focus-visible:ring-[#A07850] h-10"
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!message.trim()}
                    className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-[#A07850] text-white hover:bg-[#7A5C38] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Empty state: no conversation selected */
            <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
              <SheetTrigger asChild className="md:hidden">
                <Button className="bg-[#A07850] hover:bg-[#7A5C38] text-white rounded-xl gap-2">
                  <Menu className="h-4 w-4" />
                  View Conversations
                </Button>
              </SheetTrigger>
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-[#F5EDE2] flex items-center justify-center mx-auto">
                  <MessageSquare className="h-8 w-8 text-[#A07850] opacity-60" />
                </div>
                <p className="font-medium text-[#3B2A1A]">Select a conversation</p>
                <p className="text-sm text-[#9B8577]">Choose from the list on the left to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </Sheet>
    </div>
  )
}
