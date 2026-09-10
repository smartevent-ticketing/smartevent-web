export interface AuthUser {
  id: string
  email: string
  fullName: string
  phone?: string
  avatarFileId?: string
  roles: string[]
}

export type AuthStatus = "checking" | "authenticated" | "unauthenticated"

export interface LoginResult {
  success: boolean
  message?: string
}

export function requireAuthUser(value: unknown): AuthUser {
  if (!value || typeof value !== "object") {
    throw new Error("Không thể tải hồ sơ tài khoản. Vui lòng đăng nhập lại.")
  }
  const profile = value as Record<string, unknown>
  if (
    typeof profile.id !== "string" ||
    !profile.id.trim() ||
    typeof profile.email !== "string" ||
    !profile.email.trim() ||
    !Array.isArray(profile.roles) ||
    !profile.roles.every((role) => typeof role === "string")
  ) {
    throw new Error("Hồ sơ tài khoản không hợp lệ. Vui lòng đăng nhập lại.")
  }
  return {
    id: profile.id,
    email: profile.email,
    fullName: typeof profile.fullName === "string" ? profile.fullName : "",
    phone: typeof profile.phone === "string" ? profile.phone : undefined,
    avatarFileId: typeof profile.avatarFileId === "string" ? profile.avatarFileId : undefined,
    roles: [...profile.roles],
  }
}
