import { Suspense } from "react"
import { PaymentView } from "@/features/payments"

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-sm text-gray-500">Đang chuẩn bị cổng thanh toán...</p>
        </div>
      }
    >
      <PaymentView />
    </Suspense>
  )
}
