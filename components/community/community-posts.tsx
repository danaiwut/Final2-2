"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Eye, Plus, Send, Clock, Building2, CheckCircle2, Flame, Users, Sparkles } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { CommunityPost } from "@/lib/types"

interface CommunityPostsProps {
  posts: CommunityPost[]
  currentUserId: string
}

const POST_TYPE_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  project:     { label: "Project",     color: "text-violet-700", bg: "bg-violet-50 border-violet-200" },
  achievement: { label: "Achievement", color: "text-amber-700",  bg: "bg-amber-50 border-amber-200"  },
  question:    { label: "Question",    color: "text-sky-700",    bg: "bg-sky-50 border-sky-200"       },
  text:        { label: "Post",        color: "text-[#A07850]",  bg: "bg-[#F5EDE2] border-[#D4B896]" },
}

export function CommunityPosts({ posts, currentUserId }: CommunityPostsProps) {
  const router = useRouter()
  const [filter, setFilter] = useState<string>("all")
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())

  const categoryFilters = [
    { key: "all",     label: "All Posts",  icon: <Sparkles className="h-3.5 w-3.5" /> },
    { key: "user",    label: "People",     icon: <Users className="h-3.5 w-3.5" /> },
    { key: "company", label: "Companies",  icon: <Building2 className="h-3.5 w-3.5" /> },
    { key: "hot",     label: "Trending",   icon: <Flame className="h-3.5 w-3.5" /> },
  ]

  const filteredPosts = posts.filter((post) => {
    if (filter === "all") return true
    if (filter === "company") return post.poster_type === "company"
    if (filter === "user") return post.poster_type !== "company"
    if (filter === "hot") return (post.likes_count || 0) >= 5
    return true
  })

  const handleLike = async (postId: string) => {
    setLikedPosts(prev => {
      const next = new Set(prev)
      next.has(postId) ? next.delete(postId) : next.add(postId)
      return next
    })
    try {
      await fetch("/api/community/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      })
      router.refresh()
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  const handleSendMessage = async (userId: string) => {
    try {
      const response = await fetch("/api/chat/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId: userId }),
      })
      if (response.ok) {
        const { conversationId } = await response.json()
        router.push(`/dashboard/chat?conversation=${conversationId}`)
      }
    } catch (error) {
      console.error("Error starting chat:", error)
    }
  }

  return (
    <div className="space-y-5">
      {/* Filter Bar + Create Button */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-[#E8DDD1] shadow-sm">
          {categoryFilters.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === key
                  ? "bg-[#3B2A1A] text-white shadow-sm"
                  : "text-[#6B4C30] hover:bg-[#F5EDE2]"
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        <Button
          asChild
          className="bg-[#A07850] hover:bg-[#7A5C38] text-white rounded-xl shadow-sm gap-2 px-4"
        >
          <Link href="/community/posts/new">
            <Plus className="h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      {/* Posts */}
      {filteredPosts.length > 0 ? (
        <div className="space-y-3">
          {filteredPosts.map((post) => {
            const isCompanyPost = post.poster_type === "company"
            const isVerified = post.profiles?.verification_status === "verified"
            const typeStyle = POST_TYPE_STYLES[post.post_type] || POST_TYPE_STYLES.text
            const isLiked = likedPosts.has(post.id)

            return (
              <article
                key={post.id}
                className={`group relative bg-white rounded-2xl border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 overflow-hidden ${
                  isCompanyPost ? "border-indigo-100" : "border-[#E8DDD1]"
                }`}
              >
                {/* Subtle left accent bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${
                  isCompanyPost ? "bg-indigo-400" : "bg-[#A07850]"
                }`} />

                <div className="p-5 pl-6">
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        <Avatar className={`h-10 w-10 ring-2 ring-offset-1 ${isCompanyPost ? "ring-indigo-200" : "ring-[#D4B896]"}`}>
                          <AvatarImage src={post.profiles?.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback className={`text-sm font-semibold ${isCompanyPost ? "bg-indigo-100 text-indigo-700" : "bg-[#F5EDE2] text-[#A07850]"}`}>
                            {isCompanyPost ? <Building2 className="h-4 w-4" /> : (post.profiles?.full_name?.[0] || "U")}
                          </AvatarFallback>
                        </Avatar>
                        {isVerified && (
                          <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 rounded-full p-0.5">
                            <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-[#3B2A1A] text-sm">
                            {post.profiles?.full_name || post.profiles?.company_name || "Unknown"}
                          </span>
                          {isCompanyPost && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                              Company
                            </span>
                          )}
                          {post.moderation_status === "pending" && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5" /> Pending
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#9B8577] mt-0.5">
                          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                          {post.personas && (
                            <> · via{" "}
                              <Link href={`/community/personas/${post.persona_id}`} className="text-[#A07850] hover:underline">
                                {post.personas.name}
                              </Link>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Post Type Badge */}
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize flex-shrink-0 ${typeStyle.color} ${typeStyle.bg}`}>
                      {typeStyle.label}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="mb-3 space-y-1.5">
                    <h3 className="font-semibold text-[#3B2A1A] text-base leading-snug">
                      <Link href={`/community/posts/${post.id}`} className="hover:text-[#A07850] transition-colors">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-[#6B4C30] leading-relaxed line-clamp-3">
                      {post.content}
                    </p>
                  </div>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {post.tags.map((tag, i) => (
                        <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-[#F5EDE2] text-[#6B4C30] border border-[#E8DDD1]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div className="flex items-center gap-1 pt-3 border-t border-[#F0E8DE]">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-150 ${
                        isLiked
                          ? "text-rose-500 bg-rose-50"
                          : "text-[#9B8577] hover:text-rose-500 hover:bg-rose-50"
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${isLiked ? "fill-rose-500" : ""}`} />
                      <span className="font-medium">{(post.likes_count || 0) + (isLiked ? 1 : 0)}</span>
                    </button>

                    <Link
                      href={`/community/posts/${post.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[#9B8577] hover:text-[#A07850] hover:bg-[#F5EDE2] transition-all"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="font-medium">{post.comments_count || 0}</span>
                    </Link>

                    <div className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#9B8577]">
                      <Eye className="h-4 w-4" />
                      <span>{post.views_count || 0}</span>
                    </div>

                    {post.user_id !== currentUserId && (
                      <button
                        onClick={() => handleSendMessage(post.user_id)}
                        className="ml-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium text-[#A07850] border border-[#D4B896] hover:bg-[#A07850] hover:text-white hover:border-[#A07850] transition-all duration-200"
                      >
                        <Send className="h-3.5 w-3.5" />
                        Message
                      </button>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-[#E8DDD1]">
          <div className="w-16 h-16 rounded-2xl bg-[#F5EDE2] flex items-center justify-center mb-4">
            <MessageCircle className="h-8 w-8 text-[#A07850] opacity-60" />
          </div>
          <h3 className="text-lg font-semibold text-[#3B2A1A] mb-1">No posts yet</h3>
          <p className="text-sm text-[#9B8577] mb-6">Be the first to share something with the community</p>
          <Button asChild className="bg-[#A07850] hover:bg-[#7A5C38] text-white rounded-xl gap-2">
            <Link href="/community/posts/new">
              <Plus className="h-4 w-4" />
              Create Post
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
