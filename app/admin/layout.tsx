import { requireAdmin } from "@/lib/auth/admin"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireAdmin()

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full items-start overflow-x-hidden bg-[#FDFAF6]">
        <AdminSidebar user={user} profile={profile} />
        <div className="flex min-w-0 flex-1 flex-col w-full">
          <main className="min-w-0 flex-1 w-full">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
