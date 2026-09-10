import { waitForTokenRefresh } from "@/lib/auth/token-refresher"
import type { LoginCredentials, RegistrationRequest } from "../model/auth-input"

interface SessionResponse {
  success?: boolean
  message?: string
  data?: { accessToken?: string }
}

let pendingMutation: Promise<unknown> = Promise.resolve()

// Cookie updates must complete in intent order: an old login response must not
// recreate the refresh cookie after the user has signed out.
function serializeMutation<T>(operation: () => Promise<T>): Promise<T> {
  const next = pendingMutation.then(async () => {
    await waitForTokenRefresh()
    return operation()
  })
  pendingMutation = next.catch(() => undefined)
  return next
}

async function postSession(path: string, body?: unknown): Promise<SessionResponse> {
  const response = await fetch(`/api/auth/${path}`, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  })
  const payload = (await response.json().catch(() => null)) as SessionResponse | null
  if (!response.ok || payload?.success !== true) {
    throw new Error(
      typeof payload?.message === "string"
        ? payload.message
        : "Không thể hoàn tất yêu cầu. Vui lòng thử lại.",
    )
  }
  return payload
}

export const sessionApi = {
  login: (credentials: LoginCredentials) =>
    serializeMutation(async () => {
      const payload = await postSession("login", {
        ...credentials,
        email: credentials.email.trim(),
      })
      const token = payload.data?.accessToken
      if (typeof token !== "string" || !token.trim()) {
        throw new Error("Phản hồi đăng nhập không hợp lệ. Vui lòng thử lại.")
      }
      return token
    }),
  logout: () => serializeMutation(() => postSession("logout")),
  register: (input: RegistrationRequest) => postSession("register", input),
}
