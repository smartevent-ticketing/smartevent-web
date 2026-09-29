import type { Metadata } from "next"
import type { ReactNode } from "react"
import localFont from "next/font/local"

import { AuthProvider } from "@/features/auth"

import "./globals.css"

const beVietnamPro = localFont({
  src: "../assets/fonts/BeVietnamPro-variable.ttf",
  variable: "--font-be-vietnam",
  display: "swap",
  weight: "100 900",
})

const plusJakartaSans = localFont({
  src: "../assets/fonts/PlusJakartaSans-variable.ttf",
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: "200 800",
})

export const metadata: Metadata = {
  title: {
    default: "SmartEvent",
    template: "%s | SmartEvent",
  },
  description: "Nền tảng bán vé và quản lý sự kiện thông minh.",
}

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="vi"
      className={beVietnamPro.variable + " " + plusJakartaSans.variable + " h-full antialiased"}
    >
      <body className="flex min-h-full flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
