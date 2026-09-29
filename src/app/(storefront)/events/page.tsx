import { EventsCatalogView } from "@/features/catalog"
import { Suspense } from "react"

export default function EventsPage() {
  return (
    <Suspense fallback={<p className="p-8">Đang tải sự kiện...</p>}>
      <EventsCatalogView />
    </Suspense>
  )
}
