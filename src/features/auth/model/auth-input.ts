export interface LoginCredentials {
  email: string
  password: string
}

export interface RegistrationInput extends LoginCredentials {
  fullName: string
  phone: string
  confirmPassword: string
  termsAgreed: boolean
}

export interface RegistrationRequest extends LoginCredentials {
  fullName: string
  phone?: string
}

export function safeInternalRedirect(value: string | null, fallback = "/account"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback

  // URL parsers normalize backslashes and control characters before navigation.
  if (/[\\\u0000-\u0020\u007f]/u.test(value)) return fallback
  try {
    const decoded = decodeURIComponent(value)
    if (decoded.startsWith("//") || /[\\\u0000-\u001f\u007f]/u.test(decoded)) return fallback
    const base = "https://smartevent.invalid"
    const destination = new URL(value, base)
    return destination.origin === base
      ? `${destination.pathname}${destination.search}${destination.hash}`
      : fallback
  } catch {
    return fallback
  }
}

export function validateLogin(input: LoginCredentials): string | null {
  if (!input.email.trim()) return "Vui lòng nhập email."
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(input.email.trim())) return "Email không hợp lệ."
  if (!input.password) return "Vui lòng nhập mật khẩu."
  return null
}

export function buildRegistrationRequest(input: RegistrationInput): RegistrationRequest {
  if (!input.fullName.trim()) throw new Error("Vui lòng nhập họ và tên.")
  const loginError = validateLogin(input)
  if (loginError) throw new Error(loginError)
  if (input.password.length < 8) throw new Error("Mật khẩu phải có tối thiểu 8 ký tự.")
  if (input.password !== input.confirmPassword) throw new Error("Mật khẩu xác nhận không khớp.")
  if (!input.termsAgreed) throw new Error("Bạn cần đồng ý với Điều khoản dịch vụ để tiếp tục.")

  return {
    fullName: input.fullName.trim(),
    email: input.email.trim(),
    password: input.password,
    ...(input.phone.trim() ? { phone: input.phone.trim() } : {}),
  }
}
