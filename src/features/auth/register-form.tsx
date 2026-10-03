"use client"

import Link from "next/link"
import { Lock, Mail, Phone, User } from "lucide-react"
import { useRegisterForm } from "./hooks/use-register-form"
import { AuthField } from "./components/auth-field"
import { AuthFormShell } from "./components/auth-form-shell"
import { AuthSubmitButton } from "./components/auth-submit-button"
import { RegistrationSuccess } from "./components/registration-success"

export function RegisterForm() {
  const form = useRegisterForm()
  return (
    <AuthFormShell
      variant="register"
      bannerTitle="Khoảnh khắc đáng nhớ bắt đầu từ đây."
      bannerDescription="Âm nhạc, thể thao hay một trải nghiệm mới — tìm sự kiện dành cho bạn và lưu giữ mọi tấm vé trong tài khoản SmartEvent."
    >
      <div className="mb-7">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          Tài khoản SmartEvent
        </p>
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
          Tạo tài khoản
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Một nơi để đặt vé, theo dõi đơn hàng và quản lý trải nghiệm của bạn.
        </p>
      </div>
      {form.errorMessage && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm leading-6 text-red-700"
        >
          {form.errorMessage}
        </div>
      )}
      {form.successMessage ? (
        <RegistrationSuccess message={form.successMessage} />
      ) : (
        <form onSubmit={form.handleSubmit} aria-busy={form.isSubmitting}>
          <fieldset disabled={form.isSubmitting} className="space-y-4">
            <AuthField
              id="fullName"
              label="Họ và tên"
              icon={User}
              autoComplete="name"
              compact
              required
              placeholder="Nguyễn Văn A"
              value={form.fullName}
              onChange={form.setFullName}
            />
            <AuthField
              id="email"
              label="Email"
              icon={Mail}
              type="email"
              autoComplete="email"
              compact
              required
              placeholder="name@example.com"
              value={form.email}
              onChange={form.setEmail}
            />
            <AuthField
              id="phone"
              label="Số điện thoại (tùy chọn)"
              icon={Phone}
              type="tel"
              autoComplete="tel"
              compact
              placeholder="0901234567"
              value={form.phone}
              onChange={form.setPhone}
            />
            <AuthField
              id="password"
              label="Mật khẩu"
              icon={Lock}
              type={form.showPassword ? "text" : "password"}
              autoComplete="new-password"
              compact
              required
              placeholder="Tạo mật khẩu"
              hint="Sử dụng ít nhất 8 ký tự."
              value={form.password}
              onChange={form.setPassword}
              onToggleVisibility={() => form.setShowPassword(!form.showPassword)}
            />
            <AuthField
              id="confirmPassword"
              label="Xác nhận mật khẩu"
              icon={Lock}
              type={form.showPassword ? "text" : "password"}
              autoComplete="new-password"
              compact
              required
              placeholder="Nhập lại mật khẩu"
              value={form.confirmPassword}
              onChange={form.setConfirmPassword}
            />
            <div className="flex items-start gap-3 py-1">
              <input
                id="terms"
                type="checkbox"
                checked={form.termsAgreed}
                onChange={(event) => form.setTermsAgreed(event.target.checked)}
                className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border-border accent-primary focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary"
              />
              <label htmlFor="terms" className="cursor-pointer text-xs leading-5 text-muted">
                Tôi đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của SmartEvent.
              </label>
            </div>
            <AuthSubmitButton
              isSubmitting={form.isSubmitting}
              label="Tạo tài khoản"
              pendingLabel="Đang tạo tài khoản..."
              compact
            />
          </fieldset>
        </form>
      )}
      <div className="mt-6 border-t border-border pt-6 text-center text-sm text-muted">
        Đã có tài khoản?{" "}
        <Link
          href="/login"
          className="rounded-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          Đăng nhập ngay
        </Link>
      </div>
    </AuthFormShell>
  )
}
