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
  LayoutDashboard,
  Users,
  Briefcase,
  Megaphone,
  MessageSquare,
  Globe,
  ChevronRight,
  ShieldAlert,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface AdminSidebarProps {
  user: User | undefined
  profile: any
}

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/community", label: "Community", icon: Globe, exact: false },
  { href: "/admin/jobs", label: "Jobs", icon: Briefcase, exact: false },
  { href: "/admin/ads", label: "Ads", icon: Megaphone, exact: false },
  { href: "/admin/settings", label: "Settings", icon: Settings, exact: false },
]

export function AdminSidebar({ user, profile }: AdminSidebarProps) {
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

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Admin"
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
          <ShieldAlert className="h-5 w-5 text-white" />
        </div>
        <Link href="/admin" className="font-['Playfair_Display'] text-lg font-bold text-[#3B2A1A]">
          Admin Panel
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
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#6B4C30] transition-all duration-150 hover:bg-[#F0E6D8] hover:text-[#3B2A1A]"
          >
            <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
            <span>User Dashboard</span>
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
                <p className="truncate text-xs text-[#6B4C30]">Administrator</p>
              </div>
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-[#A07850]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="mb-2 w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{displayName}</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
                <span className="text-xs font-semibold text-primary">Administrator</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">
                <UserIcon className="mr-2 h-4 w-4" />
                My Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                My Settings
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
