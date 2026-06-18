import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { CommunityChatSidebar } from "@/components/community/community-chat-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Globe, Twitter, Linkedin, Github, Facebook, Instagram, Users, Briefcase, Mail } from "lucide-react"
import { FollowButton } from "@/components/community/follow-button"
import Link from "next/link"
import { resolveProfileLink, profileLinkLabel } from "@/lib/profile-links"

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: currentUserProfile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

  const { id } = await params

  // Fetch the viewed user's profile
  const { data: viewedProfile } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle()

  if (!viewedProfile) {
    notFound()
  }

  // Fetch user's personas
  const { data: personas } = await supabase
    .from("personas")
    .select("*")
    .eq("user_id", id)
    .eq("visibility", "published")
    .order("created_at", { ascending: false })

  // Fetch user's posts
  const { data: posts } = await supabase
    .from("community_posts")
    .select("*")
    .eq("user_id", id)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(5)

  // Check follow status
  const { data: followData } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("following_id", id)
    .maybeSingle()

  const isFollowing = !!followData

  // Get follower/following counts
  const { data: followerCount } = await supabase.rpc("get_follower_count", { user_id: id })
  const { data: followingCount } = await supabase.rpc("get_following_count", { user_id: id })

  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const isOwnProfile = user.id === id

  const socialLinks = [
    { key: "website", icon: Globe, value: viewedProfile.website },
    { key: "linkedin", icon: Linkedin, value: viewedProfile.linkedin },
    { key: "github", icon: Github, value: viewedProfile.github },
    { key: "facebook", icon: Facebook, value: viewedProfile.facebook },
    { key: "instagram", icon: Instagram, value: viewedProfile.instagram },
    { key: "twitter", icon: Twitter, value: viewedProfile.twitter },
  ]
    .map((item) => {
      const href = resolveProfileLink(item.value, item.key)
      if (!href) return null
      return {
        ...item,
        href,
        label: profileLinkLabel(item.key),
      }
    })
    .filter(Boolean) as Array<{
    key: string
    icon: typeof Globe
    value?: string
    href: string
    label: string
  }>

  return (
    <div className="flex min-h-screen w-full bg-[#FDFAF6]">
      <DashboardSidebar user={user} profile={currentUserProfile} />
      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden pt-16 md:pt-0">
        <main className="min-w-0 w-full flex-1 p-6 md:p-8">
          <div className="mx-auto w-full max-w-5xl space-y-6">
          {/* Profile Header */}
          <Card className="overflow-hidden border-[#E8DDD1] bg-white shadow-sm">
            <div className="h-40 bg-gradient-to-r from-[#8C6741] via-[#B68B61] to-[#E2C39E]" />
            <CardContent className="px-6 pb-6 pt-0">
              <div className="-mt-16 space-y-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                  <div className="flex flex-col gap-5 md:flex-row md:items-end">
                    <Avatar className="h-28 w-28 border-4 border-white shadow-xl ring-4 ring-[#F5EDE2]">
                      <AvatarImage src={viewedProfile.avatar_url || "/placeholder.svg"} alt={viewedProfile.full_name} />
                      <AvatarFallback className="bg-[#A07850] text-3xl font-semibold text-white">
                        {getInitials(viewedProfile.full_name || "U")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#A07850]">Profile</p>
                        <div className="flex flex-wrap items-center gap-3">
                          <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#3B2A1A]">
                            {viewedProfile.full_name || "User"}
                          </h1>
                        </div>
                        <p className="max-w-2xl text-sm leading-relaxed text-[#6B4C30]">
                          {viewedProfile.bio || "This profile does not have a bio yet."}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-[#6B4C30]">
                        {viewedProfile.location && (
                          <div className="flex items-center gap-1.5 rounded-full bg-[#FAF4EC] px-3 py-1.5">
                            <MapPin className="h-4 w-4 text-[#A07850]" />
                            <span>{viewedProfile.location}</span>
                          </div>
                        )}
                        {viewedProfile.email && (
                          <div className="flex items-center gap-1.5 rounded-full bg-[#FAF4EC] px-3 py-1.5">
                            <Mail className="h-4 w-4 text-[#A07850]" />
                            <span>{viewedProfile.email}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 rounded-full bg-[#FAF4EC] px-3 py-1.5">
                          <Users className="h-4 w-4 text-[#A07850]" />
                          <span>{personas?.length || 0} personas</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {!isOwnProfile && (
                    <FollowButton userId={user.id} targetUserId={params.id} isFollowing={isFollowing} />
                  )}
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-[#F0E6D8] bg-[#FDFAF6] p-4">
                    <p className="text-xs text-[#9B8577]">Followers</p>
                    <p className="mt-1 text-2xl font-semibold text-[#3B2A1A]">{followerCount || 0}</p>
                  </div>
                  <div className="rounded-2xl border border-[#F0E6D8] bg-[#FDFAF6] p-4">
                    <p className="text-xs text-[#9B8577]">Following</p>
                    <p className="mt-1 text-2xl font-semibold text-[#3B2A1A]">{followingCount || 0}</p>
                  </div>
                  <div className="rounded-2xl border border-[#F0E6D8] bg-[#FDFAF6] p-4">
                    <p className="text-xs text-[#9B8577]">Personas</p>
                    <p className="mt-1 text-2xl font-semibold text-[#3B2A1A]">{personas?.length || 0}</p>
                  </div>
                </div>

                {socialLinks.length > 0 && (
                  <div className="flex flex-wrap gap-3 border-t border-[#F0E6D8] pt-5">
                    {socialLinks.map(({ key, icon: Icon, href, label, value }) => (
                      <a
                        key={key}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-[#E8DDD1] bg-white px-3 py-2 text-sm text-[#6B4C30] shadow-sm transition-colors hover:border-[#CFAE8A] hover:bg-[#FDFAF6]"
                      >
                        <Icon className="h-4 w-4 text-[#A07850]" />
                        <span className="font-medium">{label}</span>
                        <span className="max-w-[180px] truncate text-xs text-[#9B8577]">
                          {(value || "").replace(/^https?:\/\//i, "")}
                        </span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Personas Section */}
          {personas && personas.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Personas ({personas.length})
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {personas.map((persona) => (
                    <Link key={persona.id} href={`/community/personas/${persona.id}`}>
                      <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                        <CardHeader>
                          <CardTitle className="text-lg">{persona.name}</CardTitle>
                          <CardDescription className="line-clamp-2">{persona.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div>{persona.views_count || 0} views</div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Posts */}
          {posts && posts.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Recent Posts ({posts.length})
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {posts.map((post) => (
                    <Link key={post.id} href={`/community/posts/${post.id}`}>
                      <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-base">{post.title}</CardTitle>
                              <CardDescription className="mt-1 line-clamp-2">{post.content}</CardDescription>
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {post.post_type}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div>{post.likes_count} likes</div>
                            <div>{post.comments_count} comments</div>
                            <div>{post.views_count} views</div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          </div>
        </main>
        <CommunityChatSidebar currentUserId={user.id} />
      </div>
    </div>
  )
}
