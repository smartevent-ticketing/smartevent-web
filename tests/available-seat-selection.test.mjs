import { test } from "node:test"
import assert from "node:assert/strict"
import {
  hasDuplicateSelectedSeats,
  isSeatSelectable,
  reconcileSeatedCart,
  sameSeatIds,
  selectedSeatIdsInOtherCartItems,
  selectAvailableSeats,
} from "../src/features/booking/model/available-seat-selection.ts"
import { buildReservationItems } from "../src/features/booking/model/reservation-selection.ts"

test("refreshed seat statuses remove held, sold, blocked, and missing selections", () => {
  const previous = ["a", "b", "c", "d", "e"].map((id) => ({ id, status: "AVAILABLE" }))
  const refreshed = [
    { id: "a", status: "AVAILABLE", label: "A1" },
    { id: "b", status: "HELD" },
    { id: "c", status: "SOLD" },
    { id: "d", status: "BLOCKED" },
  ]

  const current = selectAvailableSeats(previous, refreshed)
  assert.deepEqual(current, [refreshed[0]])
  assert.equal(current[0], refreshed[0])
  assert.equal(sameSeatIds(previous, current), false)
  assert.equal(isSeatSelectable(refreshed[1]), false)
  assert.equal(isSeatSelectable({ id: "f" }), false)
})

test("one seat cannot be selected for two ticket tiers in the same cart", () => {
  const cart = [
    { id: "vip", selectedSeats: [{ id: "seat-1", status: "AVAILABLE" }] },
    { id: "regular", selectedSeats: [{ id: "seat-2", status: "AVAILABLE" }] },
  ]
  assert.deepEqual([...selectedSeatIdsInOtherCartItems(cart, "regular")], ["seat-1"])
  assert.equal(hasDuplicateSelectedSeats(cart), false)
  assert.equal(
    hasDuplicateSelectedSeats([
      ...cart,
      { id: "balcony", selectedSeats: [{ id: "seat-1", status: "AVAILABLE" }] },
    ]),
    true,
  )
})

test("reservation payload cannot contain a seat that became unavailable", () => {
  const selected = [
    { id: "a", status: "AVAILABLE" },
    { id: "b", status: "AVAILABLE" },
  ]
  const refreshed = [
    { id: "a", status: "AVAILABLE" },
    { id: "b", status: "SOLD" },
  ]
  const current = selectAvailableSeats(selected, refreshed)
  assert.equal(sameSeatIds(selected, current), false)

  const items = buildReservationItems({
    ticketTypeId: "ticket-1",
    phase: { id: "phase-1", ticketTypeId: "ticket-1", maxPerOrder: 4 },
    seated: true,
    seats: current,
    quantity: 2,
  })
  assert.deepEqual(
    items.map((item) => item.eventSeatId),
    ["a"],
  )
})

test("cart refresh reduces partial selections and removes fully lost seated rows", () => {
  const available = (id) => ({ id, status: "AVAILABLE" })
  const cart = [
    {
      id: "partial",
      areaId: "area-1",
      areaType: "SEATED",
      quantity: 2,
      selectedSeats: [available("a"), available("b")],
    },
    {
      id: "lost",
      areaId: "area-1",
      areaType: "SEATED",
      quantity: 1,
      selectedSeats: [available("c")],
    },
    {
      id: "empty",
      areaId: "area-1",
      areaType: "SEATED",
      quantity: 2,
      selectedSeats: [],
    },
    {
      id: "missing",
      areaId: "area-1",
      areaType: "SEATED",
      quantity: 1,
    },
    {
      id: "standing",
      areaId: "area-2",
      areaType: "STANDING",
      quantity: 3,
    },
  ]
  const refreshed = new Map([
    ["area-1", [available("a"), { id: "b", status: "HELD" }, { id: "c", status: "SOLD" }]],
  ])

  const result = reconcileSeatedCart(cart, refreshed)
  assert.equal(result.changed, true)
  assert.deepEqual(
    result.cart.map((item) => item.id),
    ["partial", "standing"],
  )
  assert.equal(result.cart[0].quantity, 1)
  assert.deepEqual(
    result.cart[0].selectedSeats.map((seat) => seat.id),
    ["a"],
  )
  assert.equal(result.cart[1], cart[4])
  assert.equal(reconcileSeatedCart(result.cart, refreshed).changed, false)
})
