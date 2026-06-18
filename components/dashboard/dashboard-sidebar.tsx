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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { useRouter, usePathname } from "next/navigation"
import type React from "react"
import { useEffect, useState } from "react"
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
  const { setOpenMobile } = useSidebar()

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
  const teams = []

  if (isAdmin || profile?.role === "super_admin") {
    teams.push({
      name: "Admin Workspace",
      logo: IconShield,
      plan: "System Controller",
      url: "/admin",
    })
  }

  if (isCompanyRole) {
    teams.push({
      name: displayName,
      logo: IconBuilding,
      plan: "Company Account",
      url: "/dashboard",
    })
  } else {
    teams.push({
      name: displayName,
      logo: IconUser,
      plan: "Personal Workspace",
      url: "/dashboard",
    })
  }

  teams.push({
    name: "Smart Persona",
    logo: IconBrandOpenai,
    plan: "Main Platform",
    url: "/dashboard",
  })

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

  useEffect(() => {
    setOpenMobile(false)
  }, [pathname, setOpenMobile])

  const handleSignOut = async () => {
    setOpenMobile(false)
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleItemClick = (item: SidebarItem) => {
    if (item.hasSubItems) {
      setActiveItem(item.id)
    } else if (item.route) {
      setOpenMobile(false)
      router.push(item.route)
    }
  }

  const handleSubItemClick = (subItem: { id: string; route?: string }) => {
    if (subItem.route) {
      setOpenMobile(false)
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
    <>
      <div className="fixed left-4 top-4 z-50 md:hidden">
        <SidebarTrigger className="h-11 w-11 rounded-full border border-[#E8DDD1] bg-[#FDFAF6] text-[#3B2A1A] shadow-lg shadow-[#3B2A1A]/10" />
      </div>
      <Sidebar
        side="left"
        variant="sidebar"
        className="h-full w-64 border-r border-[#E8DDD1] bg-[#FDFAF6]"
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
              <div
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-[#F0E6D8] transition-colors cursor-pointer"
                onClick={() => {
                  setOpenMobile(false)
                  router.push("/dashboard/profile")
                }}
              >
                <Avatar className="h-8 w-8 rounded-full bg-[#D4B896]">
                  <AvatarFallback className="rounded-full text-xs font-semibold text-[#3B2A1A]">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate text-[#3B2A1A]">{displayName}</div>
                  <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSignOut()
                  }}
                  className="p-1.5 hover:bg-[#E8DDD1] rounded-md transition-colors"
                  title="Sign Out"
                >
                  <IconLogout className="h-4 w-4 shrink-0 text-[#A07850]" />
                </button>
              </div>
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
    </>
  )
}
