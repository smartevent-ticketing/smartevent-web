import { AdminWorkspace } from "@/features/admin"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminWorkspace>{children}</AdminWorkspace>
}
