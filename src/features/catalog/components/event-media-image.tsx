"use client"

import { useState } from "react"
import { ImageOff } from "lucide-react"

export function EventMediaImage({
  src,
  alt,
  className = "",
}: {
  src: string
  alt: string
  className?: string
}) {
  const [failedUrl, setFailedUrl] = useState<string>()
  if (failedUrl === src) {
    return (
      <div
        role="img"
        aria-label={alt + ": ảnh không khả dụng"}
        className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-xl bg-surface p-6 text-center text-muted"
      >
        <ImageOff className="size-6" />
        <span className="text-xs">Ảnh tạm thời không khả dụng</span>
      </div>
    )
  }
  // Storage serves signed URLs from a configurable host.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailedUrl(src)}
      className={className}
    />
  )
}
