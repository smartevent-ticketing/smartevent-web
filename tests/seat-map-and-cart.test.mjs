import { test } from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { getApiErrorMessage, ApiRequestError } from "../src/lib/api/result.ts"
import { buildEventSetupRequest } from "../src/features/organizer/model/event-setup-input.ts"

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

test("R2: SeatMap source code contains 4 distinct statuses and updated legend", () => {
  const seatMapPath = path.join(srcDir, "features/booking/components/seat-map.tsx")
  const content = fs.readFileSync(seatMapPath, "utf-8")

  // Check 4 status styles
  assert.match(
    content,
    /bg-amber-500 text-white border-2 border-amber-600 cursor-not-allowed opacity-90/,
  )
  assert.match(
    content,
    /bg-yellow-400 text-yellow-950 border-2 border-yellow-500 cursor-not-allowed font-extrabold/,
  )
  assert.match(
    content,
    /bg-white border-2 border-primary\/50 text-primary hover:bg-primary\/10 hover:border-primary cursor-pointer/,
  )
  assert.match(content, /bg-primary text-white border-2 border-primary shadow-sm cursor-pointer/)

  // Check disabled attributes for HELD and SOLD
  assert.match(content, /const isHeld = !isSelected && seat\.status === "HELD"/)
  assert.match(content, /const isSold = !isSelected && seat\.status === "SOLD"/)
  assert.match(content, /disabled=\{isDisabled\}/)

  // Check 4-status Legend chips
  assert.match(content, /Còn trống/)
  assert.match(content, /Đang chọn/)
  assert.match(content, /Đang giữ chỗ \(10p\)/)
  assert.match(content, /Đã bán/)
})

test("R4: booking cart sidebar layout enforces vertical scrolling and sticky CTA", () => {
  const viewPath = path.join(srcDir, "features/booking/components/booking-cart-panel.tsx")
  const content = fs.readFileSync(viewPath, "utf-8")

  // Check flex and max-h container
  assert.match(content, /flex flex-col max-h-\[calc\(100vh-6rem\)\]/)

  // Check internal scrolling cart list
  assert.match(content, /flex-1 min-h-0 overflow-y-auto/)

  // Check shrink-0 footer with persistent CTA button
  assert.match(content, /shrink-0 pt-1 space-y-4/)
  assert.match(content, /Xác nhận & Giữ chỗ 10 phút/)
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
