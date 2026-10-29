import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import type { ChatEventLink } from "../model/chat"

/** Only application event routes; URLs are never supplied by model text. */
export function chatEventHref(slug: string): string | null {
  if (typeof slug !== "string" || slug.length > 255 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug)) {
    return null
  }
  return `/events/${slug}`
}

export function ChatEventLinks({ links }: { links: ChatEventLink[] }) {
  return (
    <div className="mt-3 space-y-2 border-t border-border/40 pt-2.5">
      {links.slice(0, 10).map((event) => {
        const href = chatEventHref(event.slug)
        if (!href) return null
        return (
          <Link
            key={event.event_id}
            href={href}
            prefetch={false}
            className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background/80 px-3 py-2 text-xs transition-colors hover:border-primary/50 hover:bg-primary/5"
            aria-label={`Xem sự kiện ${event.title}`}
          >
            <span className="min-w-0">
              <span className="block font-medium">{event.title}</span>
              <span className="mt-0.5 block text-primary">Xem sự kiện</span>
            </span>
            <ArrowUpRight className="size-3.5 shrink-0 text-primary" />
          </Link>
        )
      })}
    </div>
  )
}
