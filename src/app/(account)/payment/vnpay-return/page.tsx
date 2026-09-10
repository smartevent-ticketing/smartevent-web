import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { VNPayReturnView } from "@/features/payments"

export const metadata = {
  title: "Kết quả thanh toán VNPay | SmartEvent",
  description: "Trang tiếp nhận kết quả giao dịch và xác thực thanh toán từ cổng VNPay",
}

export default function VNPayReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-3 text-on-surface-variant">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Đang tải kết quả giao dịch từ VNPay...</p>
          </div>
        </div>
      }
    >
      <VNPayReturnView />
    </Suspense>
  )
}
