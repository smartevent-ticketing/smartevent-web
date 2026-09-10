"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { accessTokenStore } from "@/lib/auth/access-token"
import { refreshAccessToken } from "@/lib/auth/token-refresher"
import { authApi } from "../api/auth-api"
import { sessionApi } from "../api/session-api"
import type { LoginCredentials } from "../model/auth-input"
import {
  requireAuthUser,
  type AuthStatus,
  type AuthUser,
  type LoginResult,
} from "../model/auth-session"

async function loadProfile(): Promise<AuthUser> {
  const { data } = await authApi.getProfile()
  return requireAuthUser(data?.data)
}

export function useAuthSession() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>("checking")
  const operationVersion = useRef(0)

  const resetLocalSession = useCallback(() => {
    accessTokenStore.clear()
    setUser(null)
    setStatus("unauthenticated")
  }, [])

  useEffect(() => {
    const operation = ++operationVersion.current
    const isCurrent = () => operationVersion.current === operation

    async function restore() {
      try {
        if (!accessTokenStore.get()) {
          const result = await refreshAccessToken()
          if (!isCurrent()) return
          if (result.status !== "refreshed") {
            setStatus("unauthenticated")
            return
          }
        }
        const profile = await loadProfile()
        if (isCurrent()) {
          setUser(profile)
          setStatus("authenticated")
        }
      } catch {
        // A failed /me request must settle loading even when transport throws.
        if (isCurrent()) resetLocalSession()
      }
    }

    void restore()
    return () => {
      operationVersion.current += 1
    }
  }, [resetLocalSession])

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<LoginResult> => {
      const operation = ++operationVersion.current
      const isCurrent = () => operationVersion.current === operation
      resetLocalSession()
      setStatus("checking")
      try {
        const token = await sessionApi.login(credentials)
        if (!isCurrent()) return { success: false, message: "Yêu cầu đăng nhập đã được thay thế." }
        accessTokenStore.set(token)
        const profile = await loadProfile()
        if (!isCurrent()) return { success: false, message: "Yêu cầu đăng nhập đã được thay thế." }
        setUser(profile)
        setStatus("authenticated")
        return { success: true }
      } catch (error) {
        if (isCurrent()) {
          resetLocalSession()
          // Incomplete logins must also discard the cookie set by the BFF.
          await sessionApi.logout().catch(() => undefined)
        }
        return {
          success: false,
          message:
            error instanceof Error ? error.message : "Không thể đăng nhập. Vui lòng thử lại.",
        }
      }
    },
    [resetLocalSession],
  )

  const logout = useCallback(async () => {
    const operation = ++operationVersion.current
    resetLocalSession()
    await sessionApi.logout().catch(() => undefined)
    if (operationVersion.current === operation) router.push("/login")
  }, [resetLocalSession, router])

  const hasRole = useCallback((role: string) => user?.roles.includes(role) ?? false, [user])

  return {
    user,
    status,
    isAuthenticated: status === "authenticated",
    isLoading: status === "checking",
    hasRole,
    login,
    logout,
  }
}
