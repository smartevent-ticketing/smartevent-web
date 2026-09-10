"use client"

import { useRef, useState, type FormEvent } from "react"
import { sessionApi } from "../api/session-api"
import { buildRegistrationRequest } from "../model/auth-input"

export function useRegisterForm() {
  const [fullName, setFullName] = useState("")

  const [email, setEmail] = useState("")

  const [phone, setPhone] = useState("")

  const [password, setPassword] = useState("")

  const [confirmPassword, setConfirmPassword] = useState("")

  const [showPassword, setShowPassword] = useState(false)

  const [termsAgreed, setTermsAgreed] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const submitting = useRef(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting.current) return
    setErrorMessage(null)
    try {
      const request = buildRegistrationRequest({
        fullName,
        email,
        phone,
        password,
        confirmPassword,
        termsAgreed,
      })
      submitting.current = true
      setIsSubmitting(true)
      await sessionApi.register(request)
      setSuccessMessage("Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.")
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.",
      )
    } finally {
      submitting.current = false
      setIsSubmitting(false)
    }
  }

  return {
    fullName,
    setFullName,
    email,
    setEmail,
    phone,
    setPhone,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    termsAgreed,
    setTermsAgreed,
    isSubmitting,
    errorMessage,
    successMessage,
    handleSubmit,
  }
}
