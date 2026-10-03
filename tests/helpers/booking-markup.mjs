import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { SeatMap } from "../../src/features/booking/components/seat-map.tsx"
import { BookingCartPanel } from "../../src/features/booking/components/booking-cart-panel.tsx"

export function renderSeatMap() {
  const seats = ["AVAILABLE", "HELD", "SOLD", "BLOCKED"].map((status, index) => ({
    id: "seat-" + index,
    label: "A" + (index + 1),
    status,
  }))
  return renderToStaticMarkup(
    createElement(SeatMap, {
      availableSeats: seats,
      selectedSeats: [],
      isSeated: true,
      maxAllowed: 4,
      handleToggleSeat() {},
    }),
  )
}

export function seatButtons(markup) {
  return [...markup.matchAll(/<button\b[^>]*>[\s\S]*?<\/button>/g)].map((match) => match[0])
}

export function renderCart(tierCount, isSubmitting = false) {
  const cart = Array.from({ length: tierCount }, (_, index) => ({
    id: "tier-" + index,
    ticketTypeName: "Hạng vé " + (index + 1),
    salePhaseName: "Đợt mở bán",
    areaName: "Khu đứng",
    areaType: "STANDING",
    quantity: 2,
    unitPrice: 100000,
    maxAllowed: 4,
    available: 20,
  }))
  return renderToStaticMarkup(
    createElement(BookingCartPanel, {
      booking: {
        event: { id: "event", startTime: "2026-10-17T12:00:00Z" },
        cart,
        totalCartCount: tierCount * 2,
        totalCartPrice: tierCount * 200000,
        eventTitle: "Sự kiện thử nghiệm",
        locationName: "Hà Nội",
        isSubmitting,
        updateQuantity() {},
        removeFromCart() {},
        clearCart() {},
        handleConfirmReservation() {},
      },
    }),
  )
}

export function reservationButton(markup) {
  return seatButtons(markup).find((button) =>
    /Giữ vé &amp; tiếp tục|Đang xử lý giữ chỗ/.test(button),
  )
}
