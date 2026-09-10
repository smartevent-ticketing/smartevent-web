import type { components } from "@/lib/api/schema"

export function canInitiatePayment(
  order: components["schemas"]["OrderResponse"],
  now = Date.now(),
) {
  const deadline = Date.parse(order.paymentDeadline ?? "")
  return (
    Boolean(order.id) &&
    order.status === "PENDING_PAYMENT" &&
    Number.isFinite(deadline) &&
    deadline > now
  )
}

export function getPaymentUrl(value: string | undefined) {
  if (!value) throw new Error("Chưa nhận được liên kết thanh toán.")
  const url = new URL(value)
  if (url.protocol !== "https:" && url.protocol !== "http:")
    throw new Error("Liên kết thanh toán không hợp lệ.")
  return url.href
}
