import type { Metadata } from "next"
import { RegisterForm } from "@/features/auth"

export const metadata: Metadata = {
  title: "Tạo tài khoản",
  description: "Tạo tài khoản SmartEvent để khám phá sự kiện và quản lý mọi tấm vé tại một nơi.",
}

export default function RegisterPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[radial-gradient(ellipse_at_top_left,#fff2ea_0%,#f7f8fa_45%,#f7f8fa_100%)]">
      <RegisterForm />
    </main>
  )
}
