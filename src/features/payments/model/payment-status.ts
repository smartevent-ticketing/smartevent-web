import type { components } from "@/lib/api/schema"

export type VerificationStatus =
  "verifying" | "success" | "pending_unconfirmed" | "late_payment" | "failed"

/** Query-string values and the viewer's clock never establish whether money was received. */
export function getPaymentStatus(
  order: components["schemas"]["OrderResponse"],
): VerificationStatus {
  if (order.status === "PAID") return "success"
  if (order.status === "CANCELLED" && order.customerNote?.startsWith("LATE_PAYMENT_EXPIRED:"))
    return "late_payment"
  if (order.status === "CANCELLED" || order.status === "EXPIRED") return "failed"
  return "pending_unconfirmed"
}
