"use client"
import { PaymentFailed } from "./components/payment-failed"
import { PaymentLate } from "./components/payment-late"
import { PaymentPending } from "./components/payment-pending"
import { PaymentSuccess } from "./components/payment-success"
import { PaymentVerifying } from "./components/payment-verifying"

import { usePaymentResult } from "./hooks/use-payment-result"

export function VNPayReturnView() {
  const {
    vnp_ResponseCode,
    vnp_TransactionNo,
    vnp_BankCode,
    vnp_PayDate,
    orderCode,
    status,
    pollCount,
    errorMessage,
    handleManualRetry,
    displayAmount,
    formatPayDate,
  } = usePaymentResult()
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-[580px] bg-white rounded-3xl p-6 sm:p-10 border border-outline-variant/60 shadow-xl space-y-6">
        {/* 1. TRẠNG THÁI: ĐANG XÁC THỰC (POLLING) */}
        <PaymentVerifying {...{ status, pollCount }} />

        {/* 2. TRẠNG THÁI: THÀNH CÔNG (PAID) */}
        <PaymentSuccess
          {...{
            vnp_TransactionNo,
            vnp_BankCode,
            vnp_PayDate,
            orderCode,
            status,
            displayAmount,
            formatPayDate,
          }}
        />

        {/* 3. TRẠNG THÁI: CHƯA XÁC NHẬN THANH TOÁN (SAU 5 LẦN VẪN PENDING) */}
        <PaymentPending {...{ orderCode, status, handleManualRetry, displayAmount }} />

        {/* 4. TRẠNG THÁI: THANH TOÁN MUỘN (LATE PAYMENT) */}
        <PaymentLate {...{ vnp_TransactionNo, orderCode, status, displayAmount }} />

        {/* 5. TRẠNG THÁI: THẤT BẠI HOẶC BỊ HỦY */}
        <PaymentFailed {...{ vnp_ResponseCode, orderCode, status, errorMessage }} />
      </div>
    </div>
  )
}
