import { test } from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { getApiErrorMessage, ApiRequestError } from "../src/lib/api/result.ts"
import { buildEventSetupRequest } from "../src/features/organizer/model/event-setup-input.ts"

import {
  renderSeatMap,
  seatButtons,
  renderCart,
  reservationButton,
} from "./helpers/booking-markup.mjs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const srcDir = path.resolve(__dirname, "../src")

test("R3: getApiErrorMessage maps EXCEEDED_TICKET_LIMIT to standard message", () => {
  const err = new ApiRequestError("Server rejected limit", 400, "EXCEEDED_TICKET_LIMIT")
  assert.equal(getApiErrorMessage(err, "Default"), "Bạn đã mua giới hạn số vé cho phép")

  const errObj = { code: "EXCEEDED_TICKET_LIMIT" }
  assert.equal(getApiErrorMessage(errObj, "Default"), "Bạn đã mua giới hạn số vé cho phép")

  const errMaxPerUser = { code: "MAX_PER_USER_EXCEEDED" }
  assert.equal(getApiErrorMessage(errMaxPerUser, "Default"), "Bạn đã mua giới hạn số vé cho phép")

  const errText = new Error("Số vé yêu cầu vượt quá số lượng vé tối đa được phép")
  assert.equal(getApiErrorMessage(errText, "Default"), "Bạn đã mua giới hạn số vé cho phép")
})

test("R1/Event Setup: buildEventSetupRequest supports maxTicketsPerUser", () => {
  const inputData = {
    eventName: "Gala Concert",
    description: "Concert test description",
    startDate: "2030-12-01",
    startTime: "19:00",
    selectedVenueId: "venue-uuid-123",
    selectedCategoryId: "cat-uuid-456",
    city: "Hà Nội",
    ticketTiers: [{ id: "t1", name: "VIP Zone", areaType: "SEATED", price: 500000, capacity: 500 }],
    maxTicketsPerUser: 4,
  }

  const result = buildEventSetupRequest(inputData, 0)
  assert.equal(result.event.maxTicketsPerUser, 4)
  assert.equal(result.event.name, "Gala Concert")
})

test("Seat map labels unavailable seats and disables them", () => {
  const buttons = seatButtons(renderSeatMap())
  assert.equal(buttons.length, 4)
  assert.match(buttons[0], /Ghế A1: Còn trống/)
  assert.doesNotMatch(buttons[0], /disabled=/)
  for (const button of buttons.slice(1)) assert.match(button, /disabled=""/)
  assert.match(buttons[1], /Ghế A2: Đang được giữ chỗ/)
  assert.match(buttons[2], /Ghế A3: Đã bán/)
  assert.match(buttons[3], /Ghế A4: Tạm khóa/)
})

test("Reservation action is disabled for an empty cart and while submitting", () => {
  assert.match(reservationButton(renderCart(0)), /disabled=""/)
  assert.match(reservationButton(renderCart(2, true)), /disabled=""/)
  assert.doesNotMatch(reservationButton(renderCart(2)), /disabled=/)
})

test("R3: Absolute zero alert() or window.alert() in entire smartevent-web/src directory", () => {
  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    const results = []
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        results.push(...scanDir(fullPath))
      } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
        const text = fs.readFileSync(fullPath, "utf-8")
        // Check for alert() calls, ignoring comments
        const lines = text.split("\n")
        lines.forEach((line, index) => {
          const trimmed = line.trim()
          if (
            trimmed.startsWith("//") ||
            trimmed.startsWith("/*") ||
            trimmed.startsWith("*") ||
            trimmed.startsWith("{/*")
          ) {
            return
          }
          if (/(?:^|[^\w$.])(?:window\.)?alert\s*\(/.test(line)) {
            results.push({ file: fullPath, line: index + 1, content: line })
          }
        })
      }
    }
    return results
  }

  const alertCalls = scanDir(srcDir)
  assert.deepEqual(
    alertCalls,
    [],
    `Found forbidden alert() calls: ${JSON.stringify(alertCalls, null, 2)}`,
  )
})
