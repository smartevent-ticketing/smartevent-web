import { test } from "node:test"
import assert from "node:assert/strict"
import { secondsUntil, formatCountdown } from "@/lib/time/deadline"

const NOW = Date.parse("2026-09-09T12:00:00.000Z")

test("countdown uses the server deadline and rounds partial seconds up", () => {
  assert.equal(secondsUntil("2026-09-09T12:01:00.001Z", NOW), 61)
  assert.equal(secondsUntil("2026-09-09T12:00:00.001Z", NOW), 1)
  assert.equal(secondsUntil("2026-09-09T12:00:00.000Z", NOW), 0)
  assert.equal(secondsUntil("2026-09-09T11:59:59.999Z", NOW), 0)
})

test("missing or invalid deadlines cannot extend a reservation", () => {
  for (const deadline of [null, undefined, "", "invalid-date"]) {
    assert.equal(secondsUntil(deadline, NOW), 0)
  }
})

test("countdown display retains leading zeroes and does not wrap long holds", () => {
  assert.equal(formatCountdown(0), "00:00")
  assert.equal(formatCountdown(9), "00:09")
  assert.equal(formatCountdown(60), "01:00")
  assert.equal(formatCountdown(6000), "100:00")
})
