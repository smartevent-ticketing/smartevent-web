"use client"

import { useState } from "react"

type UserAvatarProps = {
  src?: string
  name?: string
  initials: string
  className: string
}

export function UserAvatar({ src, name, initials, className }: UserAvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  return (
    <span className={"relative shrink-0 overflow-hidden " + className}>
      {src && src !== failedSrc ? (
        // Signed MinIO URLs expire and are refreshed by the auth session.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name ? `Ảnh đại diện của ${name}` : "Ảnh đại diện"}
          className="size-full object-cover"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        initials
      )}
    </span>
  )
}
