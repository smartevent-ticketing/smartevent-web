import { test } from "node:test"
import assert from "node:assert/strict"
import { getPaymentUrl } from "../src/features/payments/model/payment-session.ts"

test("payment redirects accept secure gateway URLs and local development only", () => {
  assert.equal(
    getPaymentUrl("https://sandbox.example.test/pay?id=1"),
    "https://sandbox.example.test/pay?id=1",
  )
  assert.equal(getPaymentUrl("http://localhost:8080/pay"), "http://localhost:8080/pay")
  assert.throws(() => getPaymentUrl("http://gateway.example.test/pay"), /không hợp lệ/)
  assert.throws(() => getPaymentUrl("javascript:alert(1)"), /không hợp lệ/)
})
