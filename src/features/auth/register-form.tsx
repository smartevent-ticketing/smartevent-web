"use client"

import Link from "next/link"
import { Lock, Mail, Phone, Ticket, User } from "lucide-react"
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
      bannerTitle="Cảm nhận nhịp đập của đêm hội"
      bannerDescription="Khám phá hàng ngàn sự kiện, đặt vé an toàn và tận hưởng những khoảnh khắc đáng nhớ nhất cùng SMART EVENT."
    >
      <div className="mb-6 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-2 text-primary font-bold text-lg mb-1">
          <Ticket className="size-5" />
          <span>SMART EVENT</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tạo tài khoản mới</h1>
        <p className="text-sm text-gray-500 mt-1">
          Điền thông tin bên dưới để bắt đầu hành trình của bạn.
        </p>
      </div>
      {form.errorMessage && (
        <div
          role="alert"
          className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600"
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
              placeholder="Tối thiểu 8 ký tự"
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
            <div className="flex items-start gap-2 pt-1">
              <input
                id="terms"
                type="checkbox"
                checked={form.termsAgreed}
                onChange={(event) => form.setTermsAgreed(event.target.checked)}
                className="mt-1 size-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
              />
              <label
                htmlFor="terms"
                className="text-xs text-gray-600 leading-relaxed cursor-pointer"
              >
                Tôi đồng ý với{" "}
                <Link href="#" className="text-primary hover:underline">
                  Điều khoản dịch vụ
                </Link>{" "}
                và{" "}
                <Link href="#" className="text-primary hover:underline">
                  Chính sách bảo mật
                </Link>{" "}
                của SMART EVENT.
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
      <div className="mt-6 text-center text-sm text-gray-600">
        Đã có tài khoản?{" "}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Đăng nhập ngay
        </Link>
      </div>
    </AuthFormShell>
  )
}
