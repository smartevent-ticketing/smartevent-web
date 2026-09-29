import type { components } from "@/lib/api/schema"

type Order = components["schemas"]["OrderResponse"]

export function getOrderDetailState(order: Order, secondsLeft: number) {
  const isPending = order.status === "PENDING_PAYMENT" && secondsLeft > 0
  return {
    isPending,
    isPaid: order.status === "PAID",
    isCancelled: order.status === "CANCELLED",
    isExpired:
      order.status === "EXPIRED" || (order.status === "PENDING_PAYMENT" && secondsLeft === 0),
    items: order.items ?? [],
    ticketCount: (order.items ?? []).reduce((sum, item) => sum + (item.quantity ?? 0), 0),
  }
}
