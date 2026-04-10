"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Eye, Plus, Send, Clock, Building2, CheckCircle2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { CommunityPost } from "@/lib/types"

interface CommunityPostsProps {
  posts: CommunityPost[]
  currentUserId: string
}

export function CommunityPosts({ posts, currentUserId }: CommunityPostsProps) {
  const router = useRouter()
  const [filter, setFilter] = useState<string>("all")

  const categoryFilters = ["all", "user", "company"]

  const filteredPosts = posts.filter((post) => {
    if (filter === "all") return true
    if (filter === "company") return post.poster_type === "company"
    if (filter === "user") return post.poster_type !== "company"
    return true
  })

  const handleLike = async (postId: string) => {
    try {
      const response = await fetch("/api/community/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      })

      if (response.ok) {
        router.refresh()
      }
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {categoryFilters.map((type) => (
            <Button
              key={type}
              variant={filter === type ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(type)}
              className={`capitalize ${
                filter === type
                  ? type === "company"
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                    : "bg-[#A07850] hover:bg-[#7A5C38] text-white"
                  : "bg-transparent"
              }`}
            >
              {type === "company" && <Building2 className="mr-1 h-3.5 w-3.5" />}
              {type === "all" ? "All Posts" : type === "company" ? "Company Posts" : "User Posts"}
            </Button>
          ))}
        </div>
        <Button asChild>
          <Link href="/community/posts/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Post
          </Link>
        </Button>
      </div>

      {filteredPosts.length > 0 ? (
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const isCompanyPost = post.poster_type === "company"
            const isVerified = post.profiles?.verification_status === "verified"

            return (
              <Card
                key={post.id}
                className={`hover:shadow-md transition-shadow ${
                  isCompanyPost
                    ? "border-indigo-200 bg-gradient-to-r from-indigo-50/40 via-white to-purple-50/30"
                    : ""
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Avatar className={isCompanyPost ? "ring-2 ring-indigo-300 ring-offset-1" : ""}>
                        <AvatarImage src={post.profiles?.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback className={isCompanyPost ? "bg-indigo-100 text-indigo-700" : ""}>
                          {isCompanyPost ? (
                            <Building2 className="h-4 w-4" />
                          ) : (
                            post.profiles?.full_name?.[0] || "U"
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{post.title}</CardTitle>
                        <CardDescription className="flex items-center gap-1.5 flex-wrap">
                          <span>{post.profiles?.full_name || post.profiles?.company_name}</span>
                          {isCompanyPost && (
                            <Badge className="bg-indigo-100 text-indigo-700 border-0 text-[10px] px-1.5 py-0">
                              <Building2 className="h-2.5 w-2.5 mr-0.5" />
                              Company
                            </Badge>
                          )}
                          {isCompanyPost && isVerified && (
                            <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px] px-1.5 py-0">
                              <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                              Verified
                            </Badge>
                          )}
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {post.moderation_status === "pending" && (
                        <Badge
                          variant="secondary"
                          className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          Pending Review
                        </Badge>
                      )}
                      <Badge variant="outline" className="capitalize">
                        {post.post_type}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground whitespace-pre-wrap">{post.content}</p>

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {post.personas && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Related Persona:</span>
                      <Link href={`/community/personas/${post.persona_id}`} className="text-primary hover:underline">
                        {post.personas.name}
                      </Link>
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-2 border-t">
                    <Button variant="ghost" size="sm" onClick={() => handleLike(post.id)}>
                      <Heart className="mr-1 h-4 w-4" />
                      {post.likes_count}
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/community/posts/${post.id}`}>
                        <MessageCircle className="mr-1 h-4 w-4" />
                        {post.comments_count}
                      </Link>
                    </Button>
                    {post.user_id !== currentUserId && (
                      <Button variant="outline" size="sm" onClick={() => handleSendMessage(post.user_id)} className="bg-transparent">
                        <Send className="mr-1 h-4 w-4" />
                        Message
                      </Button>
                    )}
                    <div className="flex items-center gap-1 text-sm text-muted-foreground ml-auto">
                      <Eye className="h-4 w-4" />
                      {post.views_count}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MessageCircle className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No posts found</h3>
            <p className="text-center text-sm text-muted-foreground mb-4">
              Be the first to share something with the community
            </p>
            <Button asChild>
              <Link href="/community/posts/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Post
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
