import { test } from "node:test"
import assert from "node:assert/strict"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { InvoiceDetailDialog } from "@/features/account/components/invoice-detail-dialog"
import { getOrderDetailState } from "@/features/account/model/order-detail"
import { invoiceEmailBody } from "@/features/account/model/invoice-email"

test("order detail counts actual quantities from backend items", () => {
  const state = getOrderDetailState(
    {
      status: "PAID",
      items: [
        { id: "item-1", quantity: 2, unitPrice: 120000, totalPrice: 240000 },
        { id: "item-2", quantity: 3, unitPrice: 50000, totalPrice: 150000 },
      ],
    },
    0,
  )

  assert.equal(state.ticketCount, 5)
  assert.equal(state.items[0].totalPrice, 240000)
  assert.equal(state.isPaid, true)
})

test("order detail closes payment actions when the deadline reaches zero", () => {
  const order = { status: "PENDING_PAYMENT", items: [] }
  assert.equal(getOrderDetailState(order, 90).isPending, true)
  assert.equal(getOrderDetailState(order, 0).isPending, false)
  assert.equal(getOrderDetailState(order, 0).isExpired, true)
})

test("invoice detail displays actual line items and no fabricated legal or signature claims", () => {
  const html = renderToStaticMarkup(
    createElement(InvoiceDetailDialog, {
      isOpen: true,
      onClose() {},
      onDownloadPdf() {},
      invoice: {
        id: "invoice-1",
        invoiceCode: "INV-42",
        billingEmail: "buyer@example.org",
        status: "ISSUED",
        subtotal: 150000,
        discountAmount: 0,
        feeAmount: 3000,
        totalAmount: 153000,
        items: [
          {
            id: "line-1",
            description: "Vé ghế B2",
            quantity: 3,
            unitPrice: 50000,
            totalPrice: 150000,
          },
        ],
      },
    }),
  )

  assert.match(html, /Vé ghế B2/)
  assert.match(html, /buyer@example\.org/)
  assert.match(html, /153\.000 ₫/)
  assert.doesNotMatch(html, /chữ ký số|0109988776|1C24TSE|1250000/)
})

test("invoice email uses the chosen recipient and delegates blank input to backend billing email", () => {
  assert.deepEqual(invoiceEmailBody("  finance@example.org "), {
    recipientEmail: "finance@example.org",
  })
  assert.deepEqual(invoiceEmailBody("  "), {})
  assert.deepEqual(invoiceEmailBody(), {})
})
