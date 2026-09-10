import { test } from "node:test"
import assert from "node:assert/strict"
import { getPaymentStatus } from "@/features/payments/model/payment-status"
import { verifyPayment } from "@/features/payments/application/verify-payment"

test("PAID order always yields success status regardless of payment deadline or review time", () => {
  // Scenario 1: Order marked PAID before deadline
  const normalPaidOrder = {
    id: "ord-1",
    status: "PAID",
    paymentDeadline: "2099-09-09T12:00:00.000Z",
  }
  assert.equal(getPaymentStatus(normalPaidOrder), "success")

  // Scenario 2 (Bug P1 regression): Order marked PAID but viewed 10 minutes or 1 day AFTER paymentDeadline
  const reviewedAfterDeadlinePaidOrder = {
    id: "ord-2",
    status: "PAID",
    paymentDeadline: "2000-09-09T12:00:00.000Z",
  }
  assert.equal(getPaymentStatus(reviewedAfterDeadlinePaidOrder), "success")

  // Scenario 3: Order marked PAID without paymentDeadline
  const noDeadlinePaidOrder = {
    id: "ord-3",
    status: "PAID",
  }
  assert.equal(getPaymentStatus(noDeadlinePaidOrder), "success")
})

test("maps cancelled order with late payment note to late_payment status", () => {
  const lateCancelledOrder = {
    id: "ord-late",
    status: "CANCELLED",
    customerNote:
      "LATE_PAYMENT_EXPIRED: VNPay received 5 minutes after deadline, auto refund queued",
  }
  assert.equal(getPaymentStatus(lateCancelledOrder), "late_payment")
})

test("maps failed statuses (CANCELLED, EXPIRED) without late payment note to failed status", () => {
  assert.equal(getPaymentStatus({ id: "ord-c", status: "CANCELLED" }), "failed")
  assert.equal(getPaymentStatus({ id: "ord-e", status: "EXPIRED" }), "failed")
})

test("maps pending order to pending_unconfirmed status", () => {
  assert.equal(getPaymentStatus({ id: "ord-p", status: "PENDING" }), "pending_unconfirmed")
})

test("verifyPayment returns confirmed result immediately when order is PAID", async () => {
  let attempts = 0
  const controller = new AbortController()

  const result = await verifyPayment({
    signal: controller.signal,
    onAttempt: (n) => {
      attempts = n
    },
    fetchOrder: async () => ({ id: "ord-1", status: "PAID", totalAmount: 500000 }),
    attempts: 5,
    interval: 10,
  })

  assert.equal(attempts, 1)
  assert.equal(result?.status, "success")
  assert.equal(result?.order?.id, "ord-1")
})

test("verifyPayment returns pending_unconfirmed when order remains pending after all attempts", async () => {
  let attempts = 0
  const controller = new AbortController()

  const result = await verifyPayment({
    signal: controller.signal,
    onAttempt: (n) => {
      attempts = n
    },
    fetchOrder: async () => ({ id: "ord-pending", status: "PENDING" }),
    attempts: 3,
    interval: 10,
  })

  assert.equal(attempts, 3)
  assert.equal(result?.status, "pending_unconfirmed")
})

test("a paid order remains successful even if it contains an old late-payment marker", () => {
  assert.equal(
    getPaymentStatus({ status: "PAID", customerNote: "LATE_PAYMENT_EXPIRED: stale note" }),
    "success",
  )
  assert.equal(
    getPaymentStatus({
      status: "CANCELLED",
      customerNote: "Customer mentions LATE_PAYMENT_EXPIRED:",
    }),
    "failed",
  )
})

test("verification follows pending orders until the backend confirms payment", async () => {
  const attempts = []
  const states = ["PENDING", "PENDING", "PAID"]
  const signal = new AbortController().signal
  const result = await verifyPayment({
    signal,
    attempts: 5,
    interval: 0,
    onAttempt: (attempt) => attempts.push(attempt),
    fetchOrder: async (receivedSignal) => {
      assert.equal(receivedSignal, signal)
      return { id: "order", status: states.shift() }
    },
  })
  assert.deepEqual(attempts, [1, 2, 3])
  assert.equal(result.status, "success")
  assert.equal(result.order.id, "order")
})

test("a temporary transport failure is retried without declaring payment failure", async () => {
  let calls = 0
  const result = await verifyPayment({
    signal: new AbortController().signal,
    attempts: 3,
    interval: 0,
    onAttempt() {},
    fetchOrder: async () => {
      if (++calls === 1) throw new Error("Connection lost")
      return { id: "order", status: "PAID" }
    },
  })
  assert.equal(calls, 2)
  assert.equal(result.status, "success")
})

test("exhausted transport failures leave the payment outcome unconfirmed", async () => {
  let calls = 0
  const result = await verifyPayment({
    signal: new AbortController().signal,
    attempts: 3,
    interval: 0,
    onAttempt() {},
    fetchOrder: async () => {
      calls++
      throw new Error("Connection lost")
    },
  })
  assert.equal(calls, 3)
  assert.equal(result.status, "pending_unconfirmed")
  assert.equal(result.order, undefined)
})

test("an aborted verification never starts a request", async () => {
  const controller = new AbortController()
  controller.abort()
  const result = await verifyPayment({
    signal: controller.signal,
    onAttempt: () => assert.fail("An aborted attempt must not update the UI"),
    fetchOrder: async () => assert.fail("An aborted attempt must not request an order"),
  })
  assert.equal(result, undefined)
})

test("aborting during a request discards its late result", async () => {
  const controller = new AbortController()
  let calls = 0
  const result = await verifyPayment({
    signal: controller.signal,
    onAttempt() {},
    interval: 0,
    fetchOrder: async () => {
      calls++
      controller.abort()
      return { status: "PAID" }
    },
  })
  assert.equal(calls, 1)
  assert.equal(result, undefined)
})

test("aborting the polling delay stops subsequent requests", async () => {
  const controller = new AbortController()
  let calls = 0
  const result = await verifyPayment({
    signal: controller.signal,
    interval: 30_000,
    onAttempt() {},
    fetchOrder: async () => {
      calls++
      setImmediate(() => controller.abort())
      return { status: "PENDING" }
    },
  })
  assert.equal(calls, 1)
  assert.equal(result, undefined)
})
