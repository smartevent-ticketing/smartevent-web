import { test } from "node:test"
import assert from "node:assert/strict"
import {
  hasSalePhaseOverlap,
  remainingCapacityForTier,
} from "../src/features/organizer/model/sale-phase-availability.ts"

const tiers = [
  { id: "vip", areaId: "hall", totalQuota: 100 },
  { id: "standard", areaId: "hall", totalQuota: 100 },
  { id: "standing", areaId: "field", totalQuota: 50 },
]
const areas = [
  { id: "hall", capacity: 100 },
  { id: "field", capacity: 50 },
]
const phases = [
  {
    id: "early",
    ticketTypeId: "vip",
    quantity: 30,
    status: "ACTIVE",
    saleStartAt: "2030-01-01T00:00:00.000Z",
    saleEndAt: "2030-01-10T00:00:00.000Z",
  },
  {
    id: "regular",
    ticketTypeId: "standard",
    quantity: 20,
    status: "SCHEDULED",
    saleStartAt: "2030-01-10T00:00:00.000Z",
    saleEndAt: "2030-01-20T00:00:00.000Z",
  },
  {
    id: "closed",
    ticketTypeId: "vip",
    quantity: 10,
    status: "CLOSED",
    saleStartAt: "2029-12-01T00:00:00.000Z",
    saleEndAt: "2029-12-10T00:00:00.000Z",
  },
]

test("remaining capacity counts other tiers in the same area but releases closed phases", () => {
  assert.equal(remainingCapacityForTier("vip", tiers, areas, phases), 50)
  assert.equal(remainingCapacityForTier("standard", tiers, areas, phases), 50)
  assert.equal(remainingCapacityForTier("standing", tiers, areas, phases), 50)
  assert.equal(remainingCapacityForTier("missing", tiers, areas, phases), 0)
})

test("sale phase overlap only rejects intersecting windows for the same tier", () => {
  assert.equal(
    hasSalePhaseOverlap(phases, "vip", "2030-01-05T00:00:00.000Z", "2030-01-11T00:00:00.000Z"),
    true,
  )
  assert.equal(
    hasSalePhaseOverlap(phases, "vip", "2030-01-10T00:00:00.000Z", "2030-01-20T00:00:00.000Z"),
    false,
  )
  assert.equal(
    hasSalePhaseOverlap(
      phases,
      "vip",
      "2030-01-05T00:00:00.000Z",
      "2030-01-06T00:00:00.000Z",
      "early",
    ),
    false,
  )
})
