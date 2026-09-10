"use client"

import { useEffect, useRef, type ReactNode } from "react"

type Props = {
  titleId: string
  children: ReactNode
  onClose: () => void
  busy?: boolean
  wide?: boolean
}

export function AccountDialog({ titleId, children, onClose, busy = false, wide = false }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = dialogRef.current
    dialog?.showModal()
    return () => dialog?.close()
  }, [])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-busy={busy}
      onCancel={(event) => {
        event.preventDefault()
        if (!busy) onClose()
      }}
      className={`m-auto w-[calc(100%-2rem)] ${wide ? "max-w-md" : "max-w-sm"} rounded-3xl bg-white p-6 text-on-surface shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-xs`}
    >
      {children}
    </dialog>
  )
}
