"use client"

import Link from "next/link"
import { AlertCircle, ArrowUpRight, Lock, Mail } from "lucide-react"
import { useLoginForm } from "./hooks/use-login-form"
import { AuthField } from "./components/auth-field"
import { AuthFormShell } from "./components/auth-form-shell"
import { AuthSubmitButton } from "./components/auth-submit-button"

export function LoginForm() {
  const form = useLoginForm()
  return (
    <AuthFormShell
      bannerTitle="Mỗi tấm vé, một điều đáng nhớ."
      bannerDescription="Tìm sự kiện dành cho bạn. Đặt vé cho khoảnh khắc tiếp theo. Lưu giữ mọi trải nghiệm trong một tài khoản."
    >
      <div className="mb-8">
        <p className="mb-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
          <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
          Tài khoản của bạn
        </p>
        <h1 className="text-[clamp(1.5rem,7vw,2rem)] leading-tight font-semibold tracking-[-0.045em] text-foreground sm:text-[34px]">
          Chào mừng trở lại
        </h1>
        <p className="mt-3 max-w-[340px] text-sm leading-6 text-muted">
          Đăng nhập để tiếp tục đặt vé và theo dõi những sự kiện bạn yêu thích.
        </p>
      </div>
      {form.errorMessage && (
        <div
          role="alert"
          className="se-feedback-enter mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm leading-6 text-red-700"
        >
          <AlertCircle className="mt-1 size-4 shrink-0" aria-hidden="true" />
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
          placeholder="ban@example.com"
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
      <div className="mt-8 border-t border-border pt-6 text-center">
        <p className="text-sm text-muted">Chưa có tài khoản SmartEvent?</p>
        <Link
          className="group mt-1 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-primary transition hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          href="/register"
        >
          Tạo tài khoản
          <ArrowUpRight
            className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none"
            aria-hidden="true"
          />
        </Link>
      </div>
    </AuthFormShell>
  )
}
