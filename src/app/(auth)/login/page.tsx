import type { Metadata } from "next"
import { LoginForm } from "@/features/auth"

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập SmartEvent để đặt vé, xem vé và quản lý đơn hàng của bạn.",
}

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[radial-gradient(ellipse_at_top_left,#fff2ea_0%,#f7f8fa_45%,#f7f8fa_100%)]">
      <LoginForm />
    </main>
  )
}
