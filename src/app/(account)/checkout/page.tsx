import { Suspense } from "react"
import { CheckoutView } from "@/features/booking"

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-sm text-gray-500">Đang tải thông tin đơn hàng...</p>
        </div>
      }
    >
      <CheckoutView />
    </Suspense>
  )
}
