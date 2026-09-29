import { test } from "node:test"
import assert from "node:assert/strict"
import {
  buildEventSetupRequest,
  buildSeatGenerationBatches,
  requireSubmittedEvent,
} from "../src/features/organizer/model/event-setup-input.ts"
import {
  buildTicketLimitUpdateRequest,
  parseTicketPurchaseLimit,
} from "../src/features/organizer/model/ticket-purchase-limit.ts"

function input() {
  return {
    eventName: " Concert ",
    description: "Test",
    startDate: "2030-10-15",
    startTime: "19:00",
    selectedVenueId: "venue",
    selectedCategoryId: "category",
    city: "Hà Nội",
    ticketTiers: [{ id: "ui-only", name: "VIP", areaType: "SEATED", price: 100, capacity: 2000 }],
  }
}

test("builds one complete request and converts Vietnamese local time to UTC", () => {
  const result = buildEventSetupRequest(input(), 0)
  assert.equal(result.event.startTime, "2030-10-15T12:00:00.000Z")
  assert.equal(result.event.name, "Concert")
  assert.deepEqual(result.tiers, [{ name: "VIP", areaType: "SEATED", price: 100, capacity: 2000 }])
})

test("supports maxTicketsPerUser event anti-scalping limit configuration", () => {
  const withLimit = { ...input(), maxTicketsPerUser: 4 }
  const result = buildEventSetupRequest(withLimit, 0)
  assert.equal(result.event.maxTicketsPerUser, 4)

  const withoutLimit = input()
  const resultDefault = buildEventSetupRequest(withoutLimit, 0)
  assert.equal(resultDefault.event.maxTicketsPerUser, undefined)
  assert.throws(() => buildEventSetupRequest({ ...input(), maxTicketsPerUser: 0 }, 0))
  assert.throws(() => buildEventSetupRequest({ ...input(), maxTicketsPerUser: 1.5 }, 0))
})

test("validates ticket limit and preserves other event settings on update", () => {
  assert.equal(parseTicketPurchaseLimit(""), undefined)
  assert.equal(parseTicketPurchaseLimit("4"), 4)
  for (const invalid of ["0", "-1", "1.5", "NaN", "2147483648"]) {
    assert.throws(() => parseTicketPurchaseLimit(invalid), invalid)
  }

  const event = {
    name: "Concert",
    description: "Description",
    venue: { id: "venue" },
    startTime: "2030-10-15T12:00:00.000Z",
    endTime: "2030-10-15T16:59:00.000Z",
    city: "Hà Nội",
    resaleEnabled: true,
    maxResalePriceMultiplier: 1.5,
    virtualQueueEnabled: true,
    queueBatchSize: 25,
  }
  const updated = buildTicketLimitUpdateRequest(event, 4)
  assert.equal(updated.maxTicketsPerUser, 4)
  assert.equal(updated.resaleEnabled, true)
  assert.equal(updated.virtualQueueEnabled, true)
  assert.equal(updated.queueBatchSize, 25)
  assert.equal(updated.venueId, "venue")
  assert.equal(updated.categoryIds, undefined)

  const cleared = buildTicketLimitUpdateRequest(event, undefined)
  assert.equal(cleared.clearMaxTicketsPerUser, true)
  assert.equal(cleared.maxTicketsPerUser, undefined)
})

test("generates exactly the requested seats when capacity is not divisible by rows", () => {
  const batches = buildSeatGenerationBatches(2000)
  const total = batches.reduce(
    (sum, batch) =>
      sum + (batch.toRow.charCodeAt(0) - batch.fromRow.charCodeAt(0) + 1) * batch.seatsPerRow,
    0,
  )
  assert.equal(total, 2000)
  assert.deepEqual(buildSeatGenerationBatches(1), [{ fromRow: "A", toRow: "A", seatsPerRow: 1 }])
})

test("rejects missing metadata and invalid ticket capacity before sending anything", () => {
  assert.throws(() => buildEventSetupRequest({ ...input(), selectedVenueId: "" }, 0))
  assert.throws(() => buildEventSetupRequest({ ...input(), ticketTiers: [] }, 0))
  assert.throws(() =>
    buildEventSetupRequest(
      { ...input(), ticketTiers: [{ ...input().ticketTiers[0], capacity: 0 }] },
      0,
    ),
  )
})

test("rejects duplicate tier names and past start dates", () => {
  const values = input()
  assert.throws(() =>
    buildEventSetupRequest(
      {
        ...values,
        ticketTiers: [...values.ticketTiers, { ...values.ticketTiers[0], id: "2", name: " vip " }],
      },
      0,
    ),
  )
  assert.throws(() => buildEventSetupRequest(values, Date.parse("2031-01-01")))
})

test("does not report success for missing or unsubmitted events", () => {
  assert.throws(() => requireSubmittedEvent(undefined))
  assert.throws(() => requireSubmittedEvent({ id: "event", status: "DRAFT" }))
  assert.throws(() => requireSubmittedEvent({ status: "PENDING_APPROVAL" }))
  const submitted = { id: "event", status: "PENDING_APPROVAL" }
  assert.equal(requireSubmittedEvent(submitted), submitted)
})
