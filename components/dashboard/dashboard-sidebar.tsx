"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { useRouter, usePathname } from "next/navigation"
import type React from "react"
import { useState } from "react"
import {
  IconHome,
  IconChartBar,
  IconUser,
  IconUsers,
  IconFileText,
  IconBriefcase,
  IconBookmark,
  IconGlobe,
  IconMessage,
  IconSettings,
  IconShield,
  IconShieldCheck,
  IconBuilding,
  IconLogout,
  IconChevronRight,
  IconArrowLeft,
  IconBrandOpenai,
} from "@tabler/icons-react"
import { TeamSwitcher } from "./team-switcher"

interface DashboardSidebarProps {
  user: User
  profile: any
}

interface SidebarItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  hasSubItems?: boolean
  route?: string
  subItems?: {
    id: string
    label: string
    icon: React.ComponentType<{ className?: string }>
    route?: string
  }[]
}

export function DashboardSidebar({ user, profile }: DashboardSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [activeItem, setActiveItem] = useState<string | null>(null)

  const isCompanyRole = profile?.role === "company"
  const isAdmin = profile?.role === "admin"

  const displayName =
    profile?.full_name || profile?.company_name || user.email?.split("@")[0] || "User"
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  // Dynamic workspaces/teams based on role
  const teams = isCompanyRole
    ? [
        {
          name: displayName,
          logo: IconBuilding,
          plan: "Company Account",
        },
        {
          name: "Smart Persona",
          logo: IconBrandOpenai,
          plan: "Main Platform",
        },
      ]
    : [
        {
          name: displayName,
          logo: IconUser,
          plan: "Personal Workspace",
        },
        {
          name: "Smart Persona",
          logo: IconBrandOpenai,
          plan: "Main Platform",
        },
      ]

  // Construct items based on role
  const sidebarItems: SidebarItem[] = isCompanyRole
    ? [
        {
          id: "overview",
          label: "Overview",
          icon: IconHome,
          hasSubItems: true,
          subItems: [
            {
              id: "dashboard",
              label: "Dashboard",
              icon: IconChartBar,
              route: "/dashboard",
            },
          ],
        },
        {
          id: "jobs",
          label: "Jobs & Posts",
          icon: IconBriefcase,
          hasSubItems: true,
          subItems: [
            {
              id: "my-jobs",
              label: "My Job Posts",
              icon: IconBriefcase,
              route: "/dashboard/company/jobs",
            },
            {
              id: "applications",
              label: "Applications",
              icon: IconFileText,
              route: "/dashboard/company/applications",
            },
          ],
        },
        {
          id: "verification",
          label: "Verification",
          icon: IconShieldCheck,
          hasSubItems: false,
          route: "/dashboard/company/verification",
        },
        {
          id: "community",
          label: "Community Feed",
          icon: IconGlobe,
          hasSubItems: true,
          subItems: [
            {
              id: "community-home",
              label: "General Feed",
              icon: IconGlobe,
              route: "/community",
            },
            {
              id: "chat",
              label: "Chat Messages",
              icon: IconMessage,
              route: "/dashboard/chat",
            },
          ],
        },
        {
          id: "settings",
          label: "Settings",
          icon: IconSettings,
          hasSubItems: false,
          route: "/dashboard/settings",
        },
      ]
    : [
        {
          id: "overview",
          label: "Overview",
          icon: IconHome,
          hasSubItems: true,
          subItems: [
            {
              id: "dashboard",
              label: "Dashboard",
              icon: IconChartBar,
              route: "/dashboard",
            },
            {
              id: "profile",
              label: "Persona Profile",
              icon: IconUser,
              route: "/dashboard/profile",
            },
          ],
        },
        {
          id: "personas",
          label: "Personas",
          icon: IconUsers,
          hasSubItems: false,
          route: "/dashboard/personas",
        },
        {
          id: "resumes",
          label: "Resumes",
          icon: IconFileText,
          hasSubItems: false,
          route: "/dashboard/resumes",
        },
        {
          id: "jobs",
          label: "Find Jobs",
          icon: IconBriefcase,
          hasSubItems: true,
          subItems: [
            {
              id: "search-jobs",
              label: "Search Jobs",
              icon: IconBriefcase,
              route: "/dashboard/jobs",
            },
            {
              id: "saved-jobs",
              label: "Saved Jobs",
              icon: IconBookmark,
              route: "/dashboard/jobs/saved",
            },
          ],
        },
        {
          id: "community",
          label: "Community",
          icon: IconGlobe,
          hasSubItems: true,
          subItems: [
            {
              id: "community-home",
              label: "General Feed",
              icon: IconGlobe,
              route: "/community",
            },
            {
              id: "chat",
              label: "Chat Messages",
              icon: IconMessage,
              route: "/dashboard/chat",
            },
          ],
        },
        {
          id: "settings",
          label: "Settings",
          icon: IconSettings,
          hasSubItems: false,
          route: "/dashboard/settings",
        },
        ...(isAdmin
          ? [
              {
                id: "admin",
                label: "Admin Panel",
                icon: IconShield,
                hasSubItems: false,
                route: "/admin",
              } as SidebarItem,
            ]
          : []),
      ]

  const activeItemData = sidebarItems.find((item) => item.id === activeItem)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleItemClick = (item: SidebarItem) => {
    if (item.hasSubItems) {
      setActiveItem(item.id)
    } else if (item.route) {
      router.push(item.route)
    }
  }

  const handleSubItemClick = (subItem: { id: string; route?: string }) => {
    if (subItem.route) {
      router.push(subItem.route)
    }
  }

  const handleBackToMain = () => {
    setActiveItem(null)
  }

  const isRouteActive = (route?: string) => {
    if (!route) return false
    if (route === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(route)
  }

  return (
    <div className="flex h-auto self-start bg-[#FDFAF6] border-r border-[#E8DDD1]">
      <Sidebar
        side="left"
        variant="sidebar"
        collapsible="none"
        className="h-auto w-64 border-r border-[#E8DDD1] bg-[#FDFAF6]"
      >
        {!activeItem ? (
          <>
            <SidebarHeader className="border-b border-[#E8DDD1] p-4 bg-[#FDFAF6]">
              <TeamSwitcher teams={teams} />
            </SidebarHeader>

            <SidebarContent className="bg-[#FDFAF6]">
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {sidebarItems.map((item) => {
                      const Icon = item.icon
                      const chevronIndicator = (
                        <IconChevronRight className="h-4 w-4 transition-transform shrink-0 text-[#A07850]" />
                      )
                      const isItemActive = isRouteActive(item.route)

                      return (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            isActive={isItemActive}
                            className={cn(
                              "w-full h-11 px-3 rounded-lg hover:bg-[#F0E6D8] transition-all",
                              isItemActive && "bg-[#A07850] text-white hover:bg-[#A07850]"
                            )}
                            onClick={() => handleItemClick(item)}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <Icon className="h-4 w-4 shrink-0" />
                              <span className="truncate text-sm font-medium">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0 ml-auto min-w-fit">
                              {(item.badge || item.hasSubItems) &&
                                (item.badge ? (
                                  <SidebarMenuBadge
                                    className={cn(
                                      "min-w-fit bg-[#E8DDD1] text-[#6B4C30]",
                                      item.hasSubItems && "gap-x-3"
                                    )}
                                  >
                                    {item.badge}
                                    {item.hasSubItems && chevronIndicator}
                                  </SidebarMenuBadge>
                                ) : (
                                  chevronIndicator
                                ))}
                            </div>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-[#E8DDD1] p-3 bg-[#FDFAF6]">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className="w-full h-12 px-3 hover:bg-[#F0E6D8] rounded-lg text-[#3B2A1A] cursor-pointer"
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      className="flex w-full items-center gap-3"
                      onClick={() => router.push("/dashboard/profile")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          router.push("/dashboard/profile")
                        }
                      }}
                    >
                      <Avatar className="h-8 w-8 rounded-full bg-[#D4B896]">
                        <AvatarFallback className="rounded-full text-xs font-semibold text-[#3B2A1A]">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="text-sm font-medium truncate">{displayName}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSignOut()
                        }}
                        className="ml-auto rounded-md p-1.5 transition-colors hover:bg-[#E8DDD1]"
                        title="Sign Out"
                      >
                        <IconLogout className="h-4 w-4 shrink-0 text-[#A07850]" />
                      </button>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </>
        ) : (
          activeItemData?.subItems && (
            <>
              <SidebarHeader className="flex flex-row items-center justify-between border-b border-[#E8DDD1] px-4 py-3 bg-[#FDFAF6]">
                <button
                  onClick={handleBackToMain}
                  className="h-8 w-8 rounded-md hover:bg-[#F0E6D8] flex items-center justify-center transition-colors border border-[#E8DDD1]"
                >
                  <IconArrowLeft className="h-4 w-4 text-[#A07850]" />
                </button>
                <h3 className="font-semibold text-sm text-[#3B2A1A] flex-1 text-center">
                  {activeItemData.label}
                </h3>
                <div className="w-8" />
              </SidebarHeader>

              <SidebarContent className="bg-[#FDFAF6]">
                <SidebarGroup>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {activeItemData.subItems.map((subItem) => {
                        const SubIcon = subItem.icon
                        const isSubActive = isRouteActive(subItem.route)

                        return (
                          <SidebarMenuItem key={subItem.id}>
                            <SidebarMenuButton
                              isActive={isSubActive}
                              className={cn(
                                "w-full h-10 px-3 rounded-lg hover:bg-[#F0E6D8] transition-all",
                                isSubActive && "bg-[#A07850] text-white hover:bg-[#A07850]"
                              )}
                              onClick={() => handleSubItemClick(subItem)}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <SubIcon className="h-4 w-4 shrink-0" />
                                <span className="truncate text-sm font-medium">{subItem.label}</span>
                              </div>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        )
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
            </>
          )
        )}
      </Sidebar>
    </div>
  )
}
