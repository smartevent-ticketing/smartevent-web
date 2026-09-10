import type { ReactNode } from "react"
import { SiteHeader, SiteFooter } from "@/components/layout"

interface StorefrontLayoutProps {
  children: ReactNode
}

export default function StorefrontLayout({ children }: StorefrontLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  )
}
