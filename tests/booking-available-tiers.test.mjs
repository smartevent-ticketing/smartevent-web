import { test } from "node:test"
import assert from "node:assert/strict"
import { buildAvailableTiers } from "../src/features/booking/model/available-tiers.ts"

const now = Date.parse("2030-04-01T12:00:00.000Z")
const data = {
  types: [
    { id: "vip", name: "VIP", eventAreaId: "seated" },
    { id: "ga", name: "GA", eventAreaId: "standing" },
  ],
  areas: [
    { id: "seated", name: "Khán đài", areaType: "SEATED" },
    { id: "standing", name: "Sân", areaType: "STANDING" },
  ],
  phases: [
    {
      id: "vip-phase",
      ticketTypeId: "vip",
      status: "ACTIVE",
      saleStartAt: "2030-04-01T00:00:00.000Z",
      saleEndAt: "2030-04-02T00:00:00.000Z",
      maxPerOrder: 4,
      maxPerUser: 3,
      price: 100000,
    },
  ],
  inventory: [{ salePhaseId: "vip-phase", availableQuantity: 7 }],
}

test("booking tiers combine the eligible phase, inventory and user's remaining limit", () => {
  const tiers = buildAvailableTiers(data, { "vip-phase": 2 }, "vip-phase", now)
  assert.equal(tiers.length, 1)
  assert.equal(tiers[0].areaType, "SEATED")
  assert.equal(tiers[0].available, 7)
  assert.equal(tiers[0].maxAllowed, 1)
  assert.equal(tiers[0].price, 100000)
  assert.equal(buildAvailableTiers(data, { "vip-phase": 3 }, undefined, now)[0].maxAllowed, 0)
  assert.deepEqual(buildAvailableTiers(data, {}, undefined, Date.parse("2030-04-03")), [])
})
