import type { ReactNode } from "react"
import { SiteHeader, SiteFooter } from "@/components/layout"

interface StorefrontLayoutProps {
  children: ReactNode
}

export default function StorefrontLayout({ children }: StorefrontLayoutProps) {
  return (
    <div className="nightline-storefront flex min-h-screen flex-col">
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  )
}
