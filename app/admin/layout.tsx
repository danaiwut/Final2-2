import { requireAdmin } from "@/lib/auth/admin"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireAdmin()

  return (
    <div className="flex min-h-screen bg-[#FDFAF6]">
      <AdminSidebar user={user} profile={profile} />
      <div className="flex flex-1 flex-col pl-64 w-full">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
