import { test } from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { getApiErrorMessage, ApiRequestError } from "../src/lib/api/result.ts"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const srcDir = path.resolve(__dirname, "../src")

// -------------------------------------------------------------
// CHALLENGE 1: Seat Map UX (R2)
// -------------------------------------------------------------
test("CHALLENGE R2.1: SeatMap verifies 4 statuses styling and disabled state", () => {
  const seatMapPath = path.join(srcDir, "features/booking/components/seat-map.tsx")
  const content = fs.readFileSync(seatMapPath, "utf-8")

  // 1. AVAILABLE: white / blue border, selectable
  assert.match(
    content,
    /bg-white border-2 border-primary\/50 text-primary hover:bg-primary\/10 hover:border-primary cursor-pointer/,
    "AVAILABLE seat must have white background with blue border and cursor-pointer",
  )

  // 2. SELECTED: Primary fill, selectable
  assert.match(
    content,
    /bg-primary text-white border-2 border-primary shadow-sm cursor-pointer/,
    "SELECTED seat must have primary background, white text and cursor-pointer",
  )

  // 3. HELD: Orange / Amber, disabled
  assert.match(
    content,
    /bg-amber-500 text-white border-2 border-amber-600 cursor-not-allowed opacity-90/,
    "HELD seat must have amber-500 background, white text, amber-600 border and cursor-not-allowed",
  )

  // 4. SOLD: Yellow, disabled
  assert.match(
    content,
    /bg-yellow-400 text-yellow-950 border-2 border-yellow-500 cursor-not-allowed font-extrabold/,
    "SOLD seat must have yellow-400 background, yellow-950 text, yellow-500 border and font-extrabold",
  )

  // 5. Disabled logic for HELD, SOLD, and BLOCKED
  assert.match(content, /const isHeld = !isSelected && seat\.status === "HELD"/)
  assert.match(content, /const isSold = !isSelected && seat\.status === "SOLD"/)
  assert.match(content, /const isBlocked = !isSelected && seat\.status === "BLOCKED"/)
  assert.match(content, /const isDisabled\s*=\s*isHeld \|\| isSold \|\| isBlocked/)
  assert.match(content, /disabled=\{isDisabled\}/)
  assert.match(content, /onClick=\{.*!isDisabled && handleToggleSeat\(seat\)\}/)
})

test("CHALLENGE R2.2: SeatMap legend displays all 4 statuses with matching colors", () => {
  const seatMapPath = path.join(srcDir, "features/booking/components/seat-map.tsx")
  const content = fs.readFileSync(seatMapPath, "utf-8")

  // Available chip & label
  assert.match(content, /border-primary\/50 bg-white/)
  assert.match(content, /<span>Còn trống<\/span>/)

  // Selected chip & label
  assert.match(content, /bg-primary border-2 border-primary/)
  assert.match(content, /<span>Đang chọn<\/span>/)

  // Held chip & label
  assert.match(content, /bg-amber-500 border-2 border-amber-600/)
  assert.match(content, /<span>Đang giữ chỗ \(10p\)<\/span>/)

  // Sold chip & label
  assert.match(content, /bg-yellow-400 border-2 border-yellow-500/)
  assert.match(content, /<span>Đã bán<\/span>/)
})

test("CHALLENGE R2.3: SeatMap logic emulation on synthetic seats", () => {
  // Pure logic replica of SeatMap's seat status computation
  function evaluateSeat(seat, selectedSeats) {
    const isSelected = selectedSeats.some((s) => s.id === seat.id)
    const isHeld = !isSelected && seat.status === "HELD"
    const isSold = !isSelected && seat.status === "SOLD"
    const isBlocked = !isSelected && seat.status === "BLOCKED"
    const isDisabled = isHeld || isSold || isBlocked
    const seatText = seat.label || `${seat.rowName || ""}${seat.seatNumber || ""}`

    let status = "AVAILABLE"
    if (isSelected) status = "SELECTED"
    else if (isHeld) status = "HELD"
    else if (isSold) status = "SOLD"
    else if (isBlocked) status = "BLOCKED"

    return { status, isDisabled, seatText }
  }

  const seatA1 = { id: "1", rowName: "A", seatNumber: 1, status: "AVAILABLE" }
  const seatA2 = { id: "2", rowName: "A", seatNumber: 2, status: "HELD" }
  const seatA3 = { id: "3", rowName: "A", seatNumber: 3, status: "SOLD" }
  const seatA4 = { id: "4", rowName: "A", seatNumber: 4, status: "BLOCKED" }
  const seatCustom = { id: "5", label: "VIP-99", status: "AVAILABLE" }

  // 1. Available unselected
  const eval1 = evaluateSeat(seatA1, [])
  assert.equal(eval1.status, "AVAILABLE")
  assert.equal(eval1.isDisabled, false)
  assert.equal(eval1.seatText, "A1")

  // 2. Available selected
  const eval2 = evaluateSeat(seatA1, [seatA1])
  assert.equal(eval2.status, "SELECTED")
  assert.equal(eval2.isDisabled, false)

  // 3. Held
  const eval3 = evaluateSeat(seatA2, [])
  assert.equal(eval3.status, "HELD")
  assert.equal(eval3.isDisabled, true)
  assert.equal(eval3.seatText, "A2")

  // 4. Sold
  const eval4 = evaluateSeat(seatA3, [])
  assert.equal(eval4.status, "SOLD")
  assert.equal(eval4.isDisabled, true)
  assert.equal(eval4.seatText, "A3")

  // 5. Blocked
  const eval5 = evaluateSeat(seatA4, [])
  assert.equal(eval5.status, "BLOCKED")
  assert.equal(eval5.isDisabled, true)

  // 6. Custom label
  const eval6 = evaluateSeat(seatCustom, [])
  assert.equal(eval6.seatText, "VIP-99")
})

// -------------------------------------------------------------
// CHALLENGE 2: Error Mapping & Zero Alert (R3)
// -------------------------------------------------------------
test("CHALLENGE R3.1: getApiErrorMessage comprehensive error permutations", () => {
  // 1. ApiRequestError with EXCEEDED_TICKET_LIMIT
  const err1 = new ApiRequestError("Server rejected limit", 400, "EXCEEDED_TICKET_LIMIT")
  assert.equal(getApiErrorMessage(err1, "Fallback"), "Bạn đã mua giới hạn số vé cho phép")

  // 2. Object with code EXCEEDED_TICKET_LIMIT
  assert.equal(
    getApiErrorMessage({ code: "EXCEEDED_TICKET_LIMIT" }, "Fallback"),
    "Bạn đã mua giới hạn số vé cho phép",
  )

  // 3. Object with code MAX_PER_USER_EXCEEDED
  assert.equal(
    getApiErrorMessage({ code: "MAX_PER_USER_EXCEEDED" }, "Fallback"),
    "Bạn đã mua giới hạn số vé cho phép",
  )

  // 4. Error with Vietnamese message including "vượt quá số lượng vé"
  const errVietnamese1 = new Error("Tài khoản đã vượt quá số lượng vé cho phép của sự kiện")
  assert.equal(getApiErrorMessage(errVietnamese1, "Fallback"), "Bạn đã mua giới hạn số vé cho phép")

  // 5. Error with Vietnamese message including "giới hạn số vé"
  const errVietnamese2 = new Error("Đã chạm giới hạn số vé tối đa")
  assert.equal(getApiErrorMessage(errVietnamese2, "Fallback"), "Bạn đã mua giới hạn số vé cho phép")

  // 6. Object with code substring in message
  const errInMessage = { message: "Error code EXCEEDED_TICKET_LIMIT triggered by user" }
  assert.equal(getApiErrorMessage(errInMessage, "Fallback"), "Bạn đã mua giới hạn số vé cho phép")

  // 7. Non-limit error falls back to Error.message
  const generalError = new Error("Network timeout")
  assert.equal(getApiErrorMessage(generalError, "Fallback"), "Network timeout")

  // 8. Non-error falsy inputs fall back to fallback string
  assert.equal(getApiErrorMessage(null, "Fallback"), "Fallback")
  assert.equal(getApiErrorMessage(undefined, "Fallback"), "Fallback")
  assert.equal(getApiErrorMessage(123, "Fallback"), "Fallback")
})

test("CHALLENGE R3.2: use-booking-cart defenses and banner triggers without alert()", () => {
  const cartHookPath = path.join(srcDir, "features/booking/hooks/use-booking-cart.ts")
  const content = fs.readFileSync(cartHookPath, "utf-8")

  // The shared cart limit helper covers add and update flows without repeating error branches.
  assert.match(content, /cartQuantityLimit\(/)
  const occurrences = content.match(/setErrorMessage\("Bạn đã mua giới hạn số vé cho phép"\)/g)
  assert.ok(
    occurrences && occurrences.length >= 1,
    `Expected a clear limit message, found ${occurrences?.length}`,
  )

  // Verify seat modal rejects HELD or SOLD seats
  assert.match(
    content,
    /if\s*\(\s*seat\.status\s*&&\s*seat\.status\s*!==\s*"AVAILABLE"\s*\)\s*\{\s*return\s*\}/,
  )

  // Verify absence of alert() calls in hook
  assert.doesNotMatch(content, /(?:^|[^\w$.])(?:window\.)?alert\s*\(/)
})

test("CHALLENGE R3.3: UI Error Banners rendered in booking view and seat dialog without alert()", () => {
  const viewPath = path.join(srcDir, "features/booking/seat-selection-view.tsx")
  const content = fs.readFileSync(viewPath, "utf-8")
  const dialogPath = path.join(srcDir, "features/booking/components/booking-seat-dialog.tsx")
  const dialogContent = fs.readFileSync(dialogPath, "utf-8")

  // Page level error banner with AlertCircle and dismiss
  assert.match(content, /\{errorMessage && \(/)
  assert.match(content, /bg-red-50 border border-red-200 text-red-700/)
  assert.match(content, /<AlertCircle className="size-4 shrink-0" \/>/)
  assert.match(content, /onClick=\{.*setErrorMessage\(null\)\}/)

  // Modal error banner with AlertCircle and dismiss
  assert.match(dialogContent, /\{\/\* Modal Error Banner \*\/\}/)
  assert.match(dialogContent, /\{errorMessage && \(/)
  assert.match(dialogContent, /onClick=\{.*setErrorMessage\(null\)\}/)

  // Absolute zero alert() in seat-selection-view
  assert.doesNotMatch(content, /(?:^|[^\w$.])(?:window\.)?alert\s*\(/)
  assert.doesNotMatch(dialogContent, /(?:^|[^\w$.])(?:window\.)?alert\s*\(/)
})

test("CHALLENGE R3.4: Complete codebase sweep for alert() / window.alert() in smartevent-web/src", () => {
  function scan(dir) {
    const list = fs.readdirSync(dir, { withFileTypes: true })
    const violations = []
    for (const item of list) {
      const p = path.join(dir, item.name)
      if (item.isDirectory()) {
        violations.push(...scan(p))
      } else if (/\.(tsx?|jsx?|mjs)$/.test(item.name)) {
        const text = fs.readFileSync(p, "utf-8")
        const lines = text.split("\n")
        lines.forEach((line, idx) => {
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
            violations.push({ file: p, line: idx + 1, content: line })
          }
        })
      }
    }
    return violations
  }

  const violations = scan(srcDir)
  assert.deepEqual(
    violations,
    [],
    `Discovered alert() calls: ${JSON.stringify(violations, null, 2)}`,
  )
})
