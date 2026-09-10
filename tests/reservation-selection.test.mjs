import { test } from "node:test"
import assert from "node:assert/strict"
import { buildReservationItems } from "../src/features/booking/model/reservation-selection.ts"

const validPhase = {
  id: "phase-1",
  ticketTypeId: "tt-1",
  maxPerOrder: 4,
}

test("buildReservationItems builds standing reservation items correctly", () => {
  const items = buildReservationItems({
    ticketTypeId: "tt-1",
    phase: validPhase,
    seated: false,
    seats: [],
    quantity: 2,
  })
  assert.deepEqual(items, [{ ticketTypeId: "tt-1", salePhaseId: "phase-1", quantity: 2 }])
})

test("buildReservationItems builds seated reservation items correctly", () => {
  const seats = [
    { id: "seat-A1", seatCode: "A1" },
    { id: "seat-A2", seatCode: "A2" },
  ]
  const items = buildReservationItems({
    ticketTypeId: "tt-1",
    phase: validPhase,
    seated: true,
    seats,
    quantity: 1,
  })
  assert.deepEqual(items, [
    { ticketTypeId: "tt-1", salePhaseId: "phase-1", eventSeatId: "seat-A1", quantity: 1 },
    { ticketTypeId: "tt-1", salePhaseId: "phase-1", eventSeatId: "seat-A2", quantity: 1 },
  ])
})

test("buildReservationItems throws error when phase is missing or belongs to different ticket type", () => {
  assert.throws(
    () =>
      buildReservationItems({
        ticketTypeId: "tt-1",
        phase: undefined,
        seated: false,
        seats: [],
        quantity: 1,
      }),
    /Không có đợt bán phù hợp/,
  )

  const wrongTypePhase = { id: "p-wrong", ticketTypeId: "tt-other", maxPerOrder: 4 }
  assert.throws(
    () =>
      buildReservationItems({
        ticketTypeId: "tt-1",
        phase: wrongTypePhase,
        seated: false,
        seats: [],
        quantity: 1,
      }),
    /Không có đợt bán phù hợp/,
  )
})

test("buildReservationItems throws error when count exceeds maxPerOrder or is invalid", () => {
  // Exceeds maxPerOrder (4)
  assert.throws(
    () =>
      buildReservationItems({
        ticketTypeId: "tt-1",
        phase: validPhase,
        seated: false,
        seats: [],
        quantity: 5,
      }),
    /Số lượng vé không hợp lệ/,
  )

  // Zero quantity
  assert.throws(
    () =>
      buildReservationItems({
        ticketTypeId: "tt-1",
        phase: validPhase,
        seated: false,
        seats: [],
        quantity: 0,
      }),
    /Số lượng vé không hợp lệ/,
  )
})

test("buildReservationItems throws error when seated reservation has duplicate or invalid seats", () => {
  // Duplicate seat ID
  const duplicateSeats = [
    { id: "seat-A1", seatCode: "A1" },
    { id: "seat-A1", seatCode: "A1" },
  ]
  assert.throws(
    () =>
      buildReservationItems({
        ticketTypeId: "tt-1",
        phase: validPhase,
        seated: true,
        seats: duplicateSeats,
        quantity: 2,
      }),
    /Danh sách ghế không hợp lệ/,
  )
})

test("standing quantities must be positive integers and seated selections must contain real seat IDs", () => {
  const selection = {
    ticketTypeId: "tt-1",
    phase: validPhase,
    seated: false,
    seats: [],
    quantity: 1,
  }
  for (const quantity of [-1, 1.5, NaN, Infinity]) {
    assert.throws(
      () => buildReservationItems({ ...selection, quantity }),
      /Số lượng vé không hợp lệ/,
    )
  }
  assert.throws(
    () => buildReservationItems({ ...selection, seated: true }),
    /Số lượng vé không hợp lệ/,
  )
  assert.throws(
    () => buildReservationItems({ ...selection, seated: true, seats: [{ seatCode: "A1" }] }),
    /Danh sách ghế không hợp lệ/,
  )
})
