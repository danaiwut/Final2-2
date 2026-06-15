"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { EmptyState } from "@/components/ui/empty-state"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Send, Search, MessageSquare, Menu, Trash2, Video, Phone, Bold, Italic, Link as LinkIcon, Paperclip, Smile, AtSign, Clock, Plus, Pencil, X, Check, ArrowUpRight } from "lucide-react"
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
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const selectedChat = conversations.find((c) => c.id === selectedConversation)
  const otherParticipant =
    selectedChat?.participant1_id === currentUserId ? selectedChat.participant2 : selectedChat?.participant1
  const profileHref = otherParticipant?.id ? `/community/users/${otherParticipant.id}` : "#"

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
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_messages" }, (payload) => {
        if (payload.eventType === "INSERT") {
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
        } else if (payload.eventType === "UPDATE") {
          const updatedMsg = payload.new as any
          setMessages((prev) => prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m)))
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
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, is_deleted: true, message: "" } : m)))
    } catch (error) {
      console.error("Error deleting message:", error)
    }
  }

  const editMessage = async (messageId: string) => {
    if (!editingContent.trim()) return
    try {
      const response = await fetch(`/api/chat/messages/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: editingContent.trim() }),
      })
      if (!response.ok) throw new Error("Failed to edit message")
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, is_edited: true, message: editingContent.trim() } : m)))
      setEditingMessageId(null)
      setEditingContent("")
    } catch (error) {
      console.error("Error editing message:", error)
      alert("Failed to edit message. Please try again.")
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
      {/* Search and New Message */}
      <div className="p-4 border-b border-gray-100 space-y-4">
        <Button className="w-full bg-[#A07850] hover:bg-[#8A6640] text-white rounded-xl h-11 font-medium gap-2 shadow-sm shadow-[#A07850]/20">
          <Plus className="h-5 w-5" />
          New Message
        </Button>
        <p className="text-xs font-semibold text-gray-400 tracking-wider pt-2">RECENT CHATS</p>
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        {filteredConversations.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-gray-500">No conversations found</p>
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="mt-2 text-xs text-[#A07850] hover:underline">
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="p-3 space-y-1">
            {filteredConversations.map((conv) => {
              const participant = conv.participant1_id === currentUserId ? conv.participant2 : conv.participant1
              const isActive = selectedConversation === conv.id
              return (
                <button
                  key={conv.id}
                  onClick={() => { setSelectedConversation(conv.id); onSelect?.() }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 text-left relative ${
                    isActive
                      ? "bg-[#F5EDE2] text-[#3B2A1A]"
                      : "hover:bg-[#F5EDE2]/50 text-[#6B4C30]"
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#A07850] rounded-r-full" />
                  )}
                  <div className="relative">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={participant?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback className="text-sm font-semibold bg-[#F5EDE2] text-[#A07850]">
                        {participant?.full_name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`font-semibold text-sm truncate ${isActive ? "text-gray-900" : "text-gray-700"}`}>
                        {participant?.full_name}
                      </p>
                      <p className="text-[10px] text-gray-400 flex-shrink-0">
                        {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      The project deck is ready for review.
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
    <div className="flex h-full min-w-0 bg-white font-sans text-gray-800">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-80 flex-col bg-[#FDFAF6] border-r border-[#E8DDD1]">
        {/* Sidebar Header */}
        <div className="px-6 py-5 border-b border-[#E8DDD1] flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#A07850] flex items-center justify-center shadow-sm">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-['Playfair_Display'] font-bold text-[#3B2A1A] text-lg leading-tight">Messages</h2>
            <p className="text-xs text-[#9B8577] font-medium">Your Conversations</p>
          </div>
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
              <div className="flex items-center gap-4 px-6 py-4 bg-white border-b border-[#E8DDD1] flex-shrink-0">
                <SheetTrigger asChild className="md:hidden">
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors">
                    <Menu className="h-4 w-4" />
                  </button>
                </SheetTrigger>
                
                <Link href={profileHref} className="flex min-w-0 items-center gap-3 rounded-xl p-1 transition-colors hover:bg-gray-50">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={otherParticipant.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className="bg-[#F5EDE2] text-[#A07850] font-semibold text-sm">
                      {otherParticipant.full_name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-bold text-[#3B2A1A] text-sm truncate">{otherParticipant.full_name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    <p className="text-xs font-medium text-[#9B8577]">Active Now</p>
                    </div>
                  </div>
                </Link>

                <div className="ml-auto flex items-center gap-3">
                  <div className="hidden md:block relative mr-2">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search in conversation..."
                      className="pl-9 h-9 w-64 text-sm bg-[#F5EDE2] border-none rounded-xl focus-visible:ring-1 focus-visible:ring-[#D4B896] focus-visible:bg-white placeholder:text-[#9B8577] transition-all"
                    />
                  </div>
                  <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-50 text-gray-500 transition-colors">
                    <Video className="h-4 w-4" />
                  </button>
                  <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-50 text-gray-500 transition-colors">
                    <Phone className="h-4 w-4" />
                  </button>
                  <Button asChild variant="outline" size="sm" className="hidden md:inline-flex h-9 rounded-full px-3 text-xs font-medium border-[#D4B896] text-[#A07850] hover:bg-[#F5EDE2]">
                    <Link href={profileHref}>
                      <ArrowUpRight className="mr-1.5 h-4 w-4" />
                      View Profile
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-6 min-h-0 space-y-6">

                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto">
                        <MessageSquare className="h-7 w-7 text-gray-400 opacity-60" />
                      </div>
                      <p className="text-sm font-semibold text-gray-900">No messages yet</p>
                      <p className="text-xs text-gray-500">Say hello to start the conversation!</p>
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
                      const isEditing = editingMessageId === msg.id

                      // Date separator logic
                      const currentMsgDate = new Date(msg.created_at).toDateString()
                      const prevMsgDate = prevMsg ? new Date(prevMsg.created_at).toDateString() : null
                      const showDateSeparator = currentMsgDate !== prevMsgDate

                      let dateLabel = ""
                      if (showDateSeparator) {
                        const today = new Date().toDateString()
                        const yesterday = new Date(Date.now() - 86400000).toDateString()
                        if (currentMsgDate === today) dateLabel = "Today"
                        else if (currentMsgDate === yesterday) dateLabel = "Yesterday"
                        else dateLabel = new Date(msg.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      }

                      return (
                        <div key={msg.id}>
                          {showDateSeparator && (
                            <div className="flex items-center justify-center my-6">
                              <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase bg-white px-4">{dateLabel}</span>
                            </div>
                          )}
                          <div
                            className={`flex items-end gap-3 ${isOwn ? "justify-end" : "justify-start"} ${isSameAsPrev && !showDateSeparator ? "mt-1.5" : "mt-4"}`}
                            onMouseEnter={() => setHoveredMsg(msg.id)}
                            onMouseLeave={() => setHoveredMsg(null)}
                          >
                            {/* Avatar for other user */}
                            {!isOwn && (
                              <div className="flex-shrink-0 w-8 mb-4">
                                {(!isSameAsNext || showDateSeparator) && (
                                  <Avatar className="h-8 w-8 shadow-sm">
                                    <AvatarImage src={otherParticipant.avatar_url || "/placeholder.svg"} />
                                    <AvatarFallback className="text-xs font-semibold bg-gray-100 text-gray-600">
                                      {otherParticipant.full_name?.[0] || "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                              </div>
                            )}

                            {/* Actions (own messages, not deleted) */}
                            {isOwn && isHovered && !msg.is_deleted && !isEditing && (
                              <div className="flex items-center gap-1 mb-4 mr-2">
                                <button
                                  onClick={() => {
                                    setEditingMessageId(msg.id)
                                    setEditingContent(msg.message)
                                  }}
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-[#A07850] hover:bg-[#F5EDE2] transition-all"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => deleteMessage(msg.id)}
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}

                            {/* Bubble */}
                            <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[70%]`}>
                              {isEditing ? (
                                <div className="bg-white border border-gray-200 rounded-xl p-2 shadow-sm flex flex-col gap-2 min-w-[200px]">
                                  <Input
                                    value={editingContent}
                                    onChange={(e) => setEditingContent(e.target.value)}
                                    className="border-none shadow-none focus-visible:ring-0 p-1 h-auto text-[14px]"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); editMessage(msg.id) }
                                      if (e.key === "Escape") { setEditingMessageId(null) }
                                    }}
                                  />
                                  <div className="flex justify-end gap-1">
                                    <button onClick={() => setEditingMessageId(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-md">
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                    <button onClick={() => editMessage(msg.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-md">
                                      <Check className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  className={`px-5 py-3.5 text-[14px] leading-[1.6] break-words shadow-sm ${
                                    msg.is_deleted
                                      ? "bg-gray-50 border border-gray-100 text-gray-400 italic rounded-2xl"
                                      : isOwn
                                      ? `bg-[#A07850] text-white ${isSameAsNext && !showDateSeparator ? "rounded-2xl rounded-br-md" : "rounded-2xl rounded-br-sm"}`
                                      : `bg-white border border-gray-100 text-gray-800 ${isSameAsNext && !showDateSeparator ? "rounded-2xl rounded-bl-md" : "rounded-2xl rounded-bl-sm"}`
                                  }`}
                                >
                                  {msg.is_deleted ? "User unsent a message" : msg.message}
                                </div>
                              )}

                              {/* Timestamp */}
                              {(!isSameAsNext || isHovered || showDateSeparator) && (
                                <div className={`flex items-center gap-1.5 mt-1.5 ${isOwn ? "justify-end" : "justify-start"}`}>
                                  {msg.is_edited && !msg.is_deleted && (
                                    <span className="text-[10px] text-gray-400 font-medium">(edited)</span>
                                  )}
                                  <p className="text-[10px] font-medium text-gray-400">
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                  {isOwn && !msg.is_deleted && (
                                    <svg className="w-3.5 h-3.5 text-[#A07850]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message Input */}
              <div className="px-6 py-5 bg-white flex-shrink-0">
                <div className="border border-[#E8DDD1] rounded-2xl overflow-hidden focus-within:ring-1 focus-within:ring-[#A07850] focus-within:border-[#A07850] transition-all bg-white shadow-sm">
                  {/* Text Input area */}
                  <div className="px-4 py-3">
                    <Input
                      placeholder={`Message #${otherParticipant.full_name}...`}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                      className="border-none shadow-none focus-visible:ring-0 p-0 h-10 text-[15px] placeholder:text-gray-400"
                    />
                  </div>
                  
                  {/* Toolbar */}
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50/50 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors">
                        <Bold className="h-4 w-4" />
                      </button>
                      <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors">
                        <Italic className="h-4 w-4" />
                      </button>
                      <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors">
                        <LinkIcon className="h-4 w-4" />
                      </button>
                      <div className="w-px h-4 bg-gray-300 mx-1"></div>
                      <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors">
                        <Paperclip className="h-4 w-4" />
                      </button>
                      <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors">
                        <Smile className="h-4 w-4" />
                      </button>
                      <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors">
                        <AtSign className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors">
                        <Clock className="h-4 w-4" />
                      </button>
                      <Button
                        onClick={sendMessage}
                        disabled={!message.trim()}
                        className="bg-[#A07850] hover:bg-[#8A6640] text-white rounded-xl px-5 h-9 font-medium shadow-sm flex items-center gap-2 disabled:opacity-50"
                      >
                        Send
                        <Send className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
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
