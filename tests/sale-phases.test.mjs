import { test } from "node:test"
import assert from "node:assert/strict"
import {
  isPhaseOpen,
  selectSalePhase,
  buildTicketTiers,
} from "../src/features/catalog/model/sale-phases.ts"

const NOW = Date.parse("2026-09-09T12:00:00.000Z")

test("isPhaseOpen checks ACTIVE status and date boundaries", () => {
  const activePhase = {
    id: "p1",
    status: "ACTIVE",
    saleStartAt: "2026-09-01T00:00:00.000Z",
    saleEndAt: "2026-09-15T00:00:00.000Z",
  }
  assert.equal(isPhaseOpen(activePhase, NOW), true)

  // Expired
  const expiredPhase = { ...activePhase, saleEndAt: "2026-09-08T00:00:00.000Z" }
  assert.equal(isPhaseOpen(expiredPhase, NOW), false)

  // Future
  const futurePhase = { ...activePhase, saleStartAt: "2026-09-10T00:00:00.000Z" }
  assert.equal(isPhaseOpen(futurePhase, NOW), false)

  // Non-active status
  const closedPhase = { ...activePhase, status: "CLOSED" }
  assert.equal(isPhaseOpen(closedPhase, NOW), false)
})

test("selectSalePhase strictly respects ticketTypeId and never borrows phase of another tier (Bug P2 regression)", () => {
  const gaPhase = {
    id: "phase-ga",
    ticketTypeId: "tier-ga",
    status: "ACTIVE",
    saleStartAt: "2026-09-01T00:00:00.000Z",
    saleEndAt: "2026-09-15T00:00:00.000Z",
    price: 300000,
  }

  // Only GA has an active phase; VIP has no active phase
  const phases = [gaPhase]

  // Selecting phase for VIP MUST NOT return GA phase
  const vipSelected = selectSalePhase(phases, "tier-vip", undefined, NOW)
  assert.equal(vipSelected, undefined)

  // Selecting phase for GA returns GA phase
  const gaSelected = selectSalePhase(phases, "tier-ga", undefined, NOW)
  assert.equal(gaSelected?.id, "phase-ga")
})

test("selectSalePhase prioritizes preferred phase if eligible and open", () => {
  const earlyBird = {
    id: "phase-early",
    ticketTypeId: "tier-ga",
    status: "ACTIVE",
    saleStartAt: "2026-09-01T00:00:00.000Z",
    saleEndAt: "2026-09-15T00:00:00.000Z",
  }
  const regular = {
    id: "phase-reg",
    ticketTypeId: "tier-ga",
    status: "ACTIVE",
    saleStartAt: "2026-09-05T00:00:00.000Z",
    saleEndAt: "2026-09-15T00:00:00.000Z",
  }

  // Requesting early bird specifically
  const chosen = selectSalePhase([earlyBird, regular], "tier-ga", "phase-early", NOW)
  assert.equal(chosen?.id, "phase-early")

  // Requesting a closed or mismatched preferred phase falls back to another eligible phase
  const chosenFallback = selectSalePhase([earlyBird, regular], "tier-ga", "non-existent", NOW)
  assert.equal(chosenFallback?.id, "phase-reg")
})

test("buildTicketTiers does not borrow cross-tier phases and reflects actual inventory", () => {
  const types = [
    { id: "tier-vip", name: "VIP", eventAreaId: "area-1" },
    { id: "tier-ga", name: "GA", eventAreaId: "area-2" },
  ]
  const areas = [
    { id: "area-1", name: "Khu VIP", areaType: "SEATED" },
    { id: "area-2", name: "Khu GA", areaType: "STANDING" },
  ]
  // Only GA has an active phase
  const phases = [
    {
      id: "phase-ga",
      ticketTypeId: "tier-ga",
      name: "Mở bán GA Đợt 1",
      status: "ACTIVE",
      saleStartAt: "2026-09-01T00:00:00.000Z",
      saleEndAt: "2026-09-15T00:00:00.000Z",
      price: 250000,
      quantity: 500,
    },
  ]
  const inventory = [{ salePhaseId: "phase-ga", availableQuantity: 42 }]

  const tiers = buildTicketTiers(types, areas, phases, inventory, NOW)

  // VIP must NOT be included because it has no open phase
  assert.equal(tiers.length, 1)
  assert.equal(tiers[0].ticketTypeId, "tier-ga")
  assert.equal(tiers[0].name, "GA")
  assert.equal(tiers[0].price, 250000)
  assert.equal(tiers[0].available, 42) // matches counter, not total 500
})

test("malformed or incomplete sale windows cannot open ticket sales", () => {
  const phase = {
    status: "ACTIVE",
    saleStartAt: "2026-09-01T00:00:00.000Z",
    saleEndAt: "2026-09-15T00:00:00.000Z",
  }
  for (const invalid of [undefined, "", "not-a-date"]) {
    assert.equal(isPhaseOpen({ ...phase, saleStartAt: invalid }, NOW), false)
    assert.equal(isPhaseOpen({ ...phase, saleEndAt: invalid }, NOW), false)
  }
  assert.equal(
    isPhaseOpen({ ...phase, saleStartAt: phase.saleEndAt, saleEndAt: phase.saleStartAt }, NOW),
    false,
  )
})

test("phase selection never mutates the API response ordering", () => {
  const phases = [
    {
      id: "old",
      ticketTypeId: "tier",
      status: "ACTIVE",
      saleStartAt: "2026-09-01T00:00:00.000Z",
      saleEndAt: "2026-09-15T00:00:00.000Z",
    },
    {
      id: "new",
      ticketTypeId: "tier",
      status: "ACTIVE",
      saleStartAt: "2026-09-05T00:00:00.000Z",
      saleEndAt: "2026-09-15T00:00:00.000Z",
    },
  ]
  const snapshot = structuredClone(phases)
  assert.equal(selectSalePhase(phases, "tier", undefined, NOW).id, "new")
  assert.deepEqual(phases, snapshot)
})

test("inventory matches the selected phase even when another phase of the same tier appears first", () => {
  const types = [{ id: "tier", name: "VIP" }]
  const phases = [
    {
      id: "current",
      ticketTypeId: "tier",
      status: "ACTIVE",
      saleStartAt: "2026-09-01T00:00:00.000Z",
      saleEndAt: "2026-09-15T00:00:00.000Z",
    },
  ]
  const staleCounter = { ticketTypeId: "tier", salePhaseId: "previous", availableQuantity: 100 }
  const currentCounter = { ticketTypeId: "tier", salePhaseId: "current", availableQuantity: 2 }
  assert.equal(
    buildTicketTiers(types, [], phases, [staleCounter, currentCounter], NOW)[0].available,
    2,
  )
  assert.equal(buildTicketTiers(types, [], phases, [staleCounter], NOW)[0].available, 0)
  assert.equal(
    buildTicketTiers(types, [], phases, [{ ...currentCounter, availableQuantity: -1 }], NOW)[0]
      .available,
    0,
  )
})
