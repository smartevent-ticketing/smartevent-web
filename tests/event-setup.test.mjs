import { test } from "node:test"
import assert from "node:assert/strict"
import {
  buildEventSetupRequest,
  requireSubmittedEvent,
} from "../src/features/organizer/model/event-setup-input.ts"

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
