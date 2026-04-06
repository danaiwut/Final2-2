"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { useRouter, usePathname } from "next/navigation"
import {
  LogOut,
  Settings,
  UserIcon,
  Shield,
  Bookmark,
  LayoutDashboard,
  Users,
  FileText,
  Briefcase,
  Globe,
  MessageSquare,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface DashboardSidebarProps {
  user: User
  profile: any
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/personas", label: "Personas", icon: Users, exact: false },
  { href: "/dashboard/resumes", label: "Resumes", icon: FileText, exact: false },
  { href: "/dashboard/jobs", label: "Find Jobs", icon: Briefcase, exact: false },
  { href: "/community", label: "Community", icon: Globe, exact: false },
  { href: "/dashboard/chat", label: "Chat", icon: MessageSquare, exact: false },
]

export function DashboardSidebar({ user, profile }: DashboardSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  const displayName = profile?.full_name || user.email?.split("@")[0] || "User"
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-[#E8DDD1] bg-[#FDFAF6]">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-[#E8DDD1] px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#A07850]">
          <span className="font-['Playfair_Display'] text-sm font-bold text-white">SP</span>
        </div>
        <Link href="/dashboard" className="font-['Playfair_Display'] text-lg font-bold text-[#3B2A1A]">
          Smart Persona
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-[#A07850] text-white shadow-sm"
                    : "text-[#6B4C30] hover:bg-[#F0E6D8] hover:text-[#3B2A1A]",
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span>{item.label}</span>
                {active && <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-70" />}
              </Link>
            )
          })}
        </div>

        {/* Divider */}
        <div className="my-4 border-t border-[#E8DDD1]" />

        <div className="space-y-1">
          <Link
            href="/dashboard/jobs/saved"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
              pathname === "/dashboard/jobs/saved"
                ? "bg-[#A07850] text-white shadow-sm"
                : "text-[#6B4C30] hover:bg-[#F0E6D8] hover:text-[#3B2A1A]",
            )}
          >
            <Bookmark className="h-4 w-4 flex-shrink-0" />
            <span>Saved Jobs</span>
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#6B4C30] transition-all duration-150 hover:bg-[#F0E6D8] hover:text-[#3B2A1A]"
          >
            <Shield className="h-4 w-4 flex-shrink-0" />
            <span>Admin Panel</span>
          </Link>
        </div>
      </nav>

      {/* User Profile */}
      <div className="border-t border-[#E8DDD1] p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-150 hover:bg-[#F0E6D8]">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#D4B896] text-[#3B2A1A]">
                <span className="text-xs font-semibold">{initials}</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-[#3B2A1A]">{displayName}</p>
                <p className="truncate text-xs text-[#6B4C30]">{user.email}</p>
              </div>
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-[#A07850]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="mb-2 w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{displayName}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">
                <UserIcon className="mr-2 h-4 w-4" />
                View Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
