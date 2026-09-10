"use client"

import { useRef, useState, type FormEvent } from "react"

import { useRouter, useSearchParams } from "next/navigation"

import { useAuth } from "@/features/auth/auth-provider"
import { safeInternalRedirect, validateLogin } from "../model/auth-input"

export function useLoginForm() {
  const router = useRouter()

  const searchParams = useSearchParams()

  const { login } = useAuth()

  const [email, setEmail] = useState("")

  const [password, setPassword] = useState("")

  const [showPassword, setShowPassword] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const submitting = useRef(false)

  const redirectTo = safeInternalRedirect(searchParams.get("redirect"))

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting.current) return
    setErrorMessage(null)
    const validationError = validateLogin({ email, password })
    if (validationError) {
      setErrorMessage(validationError)
      return
    }
    submitting.current = true
    setIsSubmitting(true)

    try {
      const result = await login({ email, password })

      if (!result.success) {
        setErrorMessage(result.message || "Đăng nhập thất bại. Vui lòng thử lại.")
        return
      }

      router.push(redirectTo)
    } catch {
      setErrorMessage("Không thể đăng nhập. Vui lòng thử lại.")
    } finally {
      submitting.current = false
      setIsSubmitting(false)
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    isSubmitting,
    errorMessage,
    handleSubmit,
  }
}
