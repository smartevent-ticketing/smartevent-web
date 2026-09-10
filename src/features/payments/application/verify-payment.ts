import type { components } from "@/lib/api/schema"
import { pause } from "@/lib/async/pause"
import { getPaymentStatus, type VerificationStatus } from "../model/payment-status"

type Order = components["schemas"]["OrderResponse"]

export async function verifyPayment(options: {
  fetchOrder: (signal: AbortSignal) => Promise<Order | undefined>
  signal: AbortSignal
  onAttempt: (attempt: number) => void
  interval?: number
  attempts?: number
}): Promise<{ status: VerificationStatus; order?: Order } | undefined> {
  let lastOrder: Order | undefined
  for (let attempt = 1; attempt <= (options.attempts ?? 5); attempt++) {
    if (options.signal.aborted) return
    options.onAttempt(attempt)
    try {
      lastOrder = await options.fetchOrder(options.signal)
      if (options.signal.aborted) return
      if (lastOrder) {
        const status = getPaymentStatus(lastOrder)
        if (status !== "pending_unconfirmed") return { status, order: lastOrder }
      }
    } catch {
      if (options.signal.aborted) return
      // A transport failure cannot establish the outcome of a payment.
    }
    if (attempt < (options.attempts ?? 5)) await pause(options.interval ?? 3000, options.signal)
  }
  if (!options.signal.aborted) return { status: "pending_unconfirmed", order: lastOrder }
}
