"use client"

import { useEffect, useState } from "react"
import { catalogApi } from "../api/catalog-api"
import type { components } from "@/lib/api/schema"

type Event = components["schemas"]["EventResponse"]

export function useEventBannerUrls(events: Event[]) {
  const [urls, setUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    const controller = new AbortController()
    const banners = events.flatMap((event) => {
      const fileId = event.files?.find((file) => file.fileType === "BANNER")?.fileId
      return event.id && fileId ? [{ eventId: event.id, fileId }] : []
    })

    if (banners.length > 0) {
      void Promise.allSettled(
        banners.map(async ({ eventId, fileId }) => {
          const result = await catalogApi.getMediaUrl({
            params: { path: { fileId } },
            signal: controller.signal,
          })
          return { eventId, url: result.data?.data?.url }
        }),
      ).then((results) => {
        if (controller.signal.aborted) return
        setUrls((current) => {
          const next = { ...current }
          for (const result of results) {
            if (result.status === "fulfilled" && result.value.url) {
              next[result.value.eventId] = result.value.url
            }
          }
          return next
        })
      })
    }

    return () => controller.abort()
  }, [events])

  return urls
}
