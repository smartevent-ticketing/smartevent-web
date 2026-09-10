import { Suspense } from "react"
import { SeatSelectionView } from "@/features/booking"

interface ReservationPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ReservationPage({ params }: ReservationPageProps) {
  const { id } = await params

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-sm text-gray-500">Đang tải sơ đồ đặt vé...</p>
        </div>
      }
    >
      <SeatSelectionView eventId={id} />
    </Suspense>
  )
}
