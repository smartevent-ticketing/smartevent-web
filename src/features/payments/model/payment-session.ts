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
  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new Error("Liên kết thanh toán không hợp lệ.")
  }
  const localHttp =
    url.protocol === "http:" &&
    (url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "[::1]")
  if (url.protocol !== "https:" && !localHttp) throw new Error("Liên kết thanh toán không hợp lệ.")
  return url.href
}
