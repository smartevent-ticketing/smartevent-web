"use client"

import Link from "next/link"
import { Lock, Mail } from "lucide-react"
import { useLoginForm } from "./hooks/use-login-form"
import { AuthField } from "./components/auth-field"
import { AuthFormShell } from "./components/auth-form-shell"
import { AuthSubmitButton } from "./components/auth-submit-button"

export function LoginForm() {
  const form = useLoginForm()
  return (
    <AuthFormShell
      bannerTitle="Trải nghiệm không giới hạn"
      bannerDescription="Tham gia hàng ngàn sự kiện âm nhạc, thể thao và văn hóa hàng đầu."
    >
      <div className="mb-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Chào mừng trở lại</h1>
        <p className="text-sm text-gray-500">Vui lòng đăng nhập để tiếp tục</p>
      </div>
      {form.errorMessage && (
        <div
          role="alert"
          className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 flex items-center gap-2"
        >
          <span>{form.errorMessage}</span>
        </div>
      )}
      <form onSubmit={form.handleSubmit} className="space-y-5" aria-busy={form.isSubmitting}>
        <AuthField
          id="email"
          label="Email"
          icon={Mail}
          type="email"
          autoComplete="username"
          placeholder="Nhập email của bạn"
          required
          disabled={form.isSubmitting}
          value={form.email}
          onChange={form.setEmail}
        />
        <AuthField
          id="password"
          label="Mật khẩu"
          icon={Lock}
          type={form.showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Nhập mật khẩu"
          required
          disabled={form.isSubmitting}
          value={form.password}
          onChange={form.setPassword}
          onToggleVisibility={() => form.setShowPassword(!form.showPassword)}
        />
        <div className="pt-2">
          <AuthSubmitButton
            isSubmitting={form.isSubmitting}
            label="Đăng nhập"
            pendingLabel="Đang đăng nhập..."
          />
        </div>
      </form>
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Chưa có tài khoản?{" "}
          <Link className="text-primary font-medium hover:underline rounded-sm" href="/register">
            Đăng ký tài khoản mới
          </Link>
        </p>
      </div>
    </AuthFormShell>
  )
}
