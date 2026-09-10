"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useAuthSession } from "./hooks/use-auth-session"

export type { AuthUser } from "./model/auth-session"

type AuthContextValue = ReturnType<typeof useAuthSession>
const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === null) throw new Error("useAuth() phải được gọi bên trong <AuthProvider>")
  return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const value = useAuthSession()
  return <AuthContext value={value}>{children}</AuthContext>
}
