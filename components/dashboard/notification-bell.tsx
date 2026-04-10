"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Bell, Heart, MessageCircle, Briefcase, ShieldCheck, UserPlus,
  Eye, MessageSquare, Star, Check
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"

export function NotificationBell() {
  const supabase = createClient()
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)

    if (data) {
      setNotifications(data)
      setUnreadCount(data.filter((n) => !n.is_read).length)
    }
  }

  const markAsRead = async (id: string) => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false)

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: true }))
    )
    setUnreadCount(0)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "community_like": return <Heart className="h-4 w-4 text-rose-500" />
      case "community_comment": return <MessageCircle className="h-4 w-4 text-blue-500" />
      case "job_application": return <Briefcase className="h-4 w-4 text-indigo-500" />
      case "verification_status": return <ShieldCheck className="h-4 w-4 text-emerald-500" />
      case "follow": return <UserPlus className="h-4 w-4 text-purple-500" />
      case "persona_view": return <Eye className="h-4 w-4 text-amber-500" />
      case "message":
      case "chat_message": return <MessageSquare className="h-4 w-4 text-cyan-500" />
      case "endorsement": return <Star className="h-4 w-4 text-yellow-500" />
      case "job_match": return <Briefcase className="h-4 w-4 text-green-500" />
      default: return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-[#F0E6D8]">
          <Bell className="h-[18px] w-[18px] text-[#6B4C30]" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white animate-in zoom-in-50">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] p-0 shadow-xl" side="bottom">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50/80">
          <h4 className="font-semibold text-sm text-gray-800">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs text-indigo-600 hover:text-indigo-700 h-auto py-1 px-2"
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-[400px]">
          {notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => {
                    markAsRead(notification.id)
                    if (notification.link) {
                      window.location.href = notification.link
                    }
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-start gap-3 ${
                    !notification.is_read ? "bg-indigo-50/40" : ""
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5 p-1.5 bg-white rounded-lg border shadow-sm">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!notification.is_read ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.message}</p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <div className="flex-shrink-0 mt-1.5">
                      <div className="h-2 w-2 rounded-full bg-indigo-500" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-8 w-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No notifications yet</p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
