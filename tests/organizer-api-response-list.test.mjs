import assert from "node:assert/strict"
import test from "node:test"
import { readApiResponseList } from "@/features/organizer/model/api-response-list"

test("organizer metrics read lists from the API response envelope", () => {
  const counters = [{ salePhaseId: "phase-1", soldQuantity: 12 }]
  assert.deepEqual(readApiResponseList({ data: { success: true, data: counters } }), counters)
  assert.deepEqual(readApiResponseList({ data: { success: true } }), [])
  assert.deepEqual(readApiResponseList(undefined), [])
})
