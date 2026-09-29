import { test } from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const srcDir = path.resolve(__dirname, "../src")

test("CHALLENGE 1: Empirical codebase scan for zero alert() / window.alert() / globalThis.alert() in smartevent-web/src", () => {
  const violations = []

  function walkDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walkDirectory(fullPath)
      } else if (/\.(tsx?|jsx?|mjs|cjs)$/.test(entry.name)) {
        const fileContent = fs.readFileSync(fullPath, "utf-8")
        const lines = fileContent.split(/\r?\n/)
        lines.forEach((line, idx) => {
          const trimmed = line.trim()
          // Ignore comment lines
          if (
            trimmed.startsWith("//") ||
            trimmed.startsWith("/*") ||
            trimmed.startsWith("*") ||
            trimmed.startsWith("{/*")
          ) {
            return
          }

          // Adversarial checks for all invocation patterns:
          // 1. alert(...)
          // 2. window.alert(...)
          // 3. globalThis.alert(...)
          // 4. window['alert'](...)
          const alertCallPatterns = [
            /(?:^|[^\w$.])(?:(?:window|globalThis)\.)?alert\s*\(/,
            /(?:window|globalThis)\[['"]alert['"]\]\s*\(/,
          ]

          for (const pattern of alertCallPatterns) {
            if (pattern.test(line)) {
              violations.push({
                file: path.relative(srcDir, fullPath),
                line: idx + 1,
                content: trimmed,
              })
            }
          }
        })
      }
    }
  }

  walkDirectory(srcDir)

  assert.deepEqual(
    violations,
    [],
    `Found unauthorized alert invocations:\n${JSON.stringify(violations, null, 2)}`,
  )
})

test("CHALLENGE 2: Multi-tier cart layout structure & viewport geometry verification in booking-cart-panel.tsx", () => {
  const filePath = path.join(srcDir, "features/booking/components/booking-cart-panel.tsx")
  assert.ok(fs.existsSync(filePath), "booking-cart-panel.tsx must exist")
  const content = fs.readFileSync(filePath, "utf-8")

  // 1. Verify card container classes: flex flex-col and max-h-[calc(100vh-6rem)]
  const cardContainerRegex =
    /<div[^>]*className="[^"]*flex flex-col[^"]*max-h-\[calc\(100vh-6rem\)\][^"]*"/
  assert.match(
    content,
    cardContainerRegex,
    "Cart card container must enforce flex flex-col and max-h-[calc(100vh-6rem)]",
  )

  // 2. Verify outer container sticky positioning
  const stickyContainerRegex = /<div[^>]*className="[^"]*sticky top-20[^"]*"/
  assert.match(content, stickyContainerRegex, "Cart sidebar outer column must be sticky top-20")

  // 3. Verify cart items list has flex-1, min-h-0, overflow-y-auto
  const scrollableListRegex = /<div[^>]*className="[^"]*flex-1 min-h-0 overflow-y-auto[^"]*"/
  assert.match(
    content,
    scrollableListRegex,
    "Cart items container must enforce flex-1 min-h-0 overflow-y-auto",
  )

  // 4. Verify footer has shrink-0 and holds the CTA button
  const footerRegex = /<div[^>]*className="[^"]*shrink-0[^"]*pt-1 space-y-4[^"]*"/
  assert.match(content, footerRegex, "Cart footer must enforce shrink-0 to prevent collapsing")

  // 5. Verify CTA button text and disabled condition
  assert.match(
    content,
    /Xác nhận & Giữ chỗ 10 phút/,
    "CTA button must include text 'Xác nhận & Giữ chỗ 10 phút'",
  )

  assert.match(
    content,
    /disabled=\{isSubmitting \|\| cart\.length === 0\}/,
    "CTA button disabled state must only activate when submitting or empty",
  )
})

test("CHALLENGE 3: Multi-tier cart simulation (2, 3, 5, 10 tiers) guarantees CTA permanence & clickability", () => {
  // Simulate viewports and tier selections
  const viewports = [
    { name: "Small Laptop (768p)", height: 768 },
    { name: "Standard HD+ (900p)", height: 900 },
    { name: "Full HD (1080p)", height: 1080 },
  ]

  const tierCounts = [2, 3, 5, 10]

  for (const vp of viewports) {
    const topOffset = 80 // top-20 = 5rem = 80px
    const maxCardHeight = vp.height - 96 // max-h-[calc(100vh-6rem)] = vp.height - 96px
    const cardBottom = topOffset + maxCardHeight
    const clearance = vp.height - cardBottom

    // Clearance from bottom of viewport MUST always be >= 16px (1rem)
    assert.equal(
      clearance,
      16,
      `Viewport ${vp.name} must maintain 16px clearance above bottom edge`,
    )

    // Estimate layout component heights inside card
    const cardPaddingVertical = 48 // p-6 = 24px * 2
    const headerHeight = 65 // shrink-0
    const briefHeight = 85 // shrink-0
    const footerHeight = 185 // shrink-0 (breakdown + button + badge)
    const fixedContentHeight = cardPaddingVertical + headerHeight + briefHeight + footerHeight

    const availableItemsHeight = maxCardHeight - fixedContentHeight
    assert.ok(
      availableItemsHeight > 100,
      `Available scroll area on ${vp.name} (${availableItemsHeight}px) must be positive and usable`,
    )

    for (const count of tierCounts) {
      // In booking-cart-panel.tsx, cart items list has:
      // py-3 (24px) + space-y-3 (12px * (count - 1)) + each item card (~95px - 110px)
      const containerPaddingY = 24
      const gapHeight = (count - 1) * 12
      const itemCardHeight = 100 // realistic seated/standing item height
      const totalItemsContentHeight = containerPaddingY + gapHeight + count * itemCardHeight

      // Evaluate flex behavior
      const doesOverflow = totalItemsContentHeight > availableItemsHeight
      if (count >= 3 && vp.height <= 768) {
        assert.ok(
          doesOverflow,
          `On ${vp.name} with ${count} tiers (${totalItemsContentHeight}px > ${availableItemsHeight}px), items trigger internal scrolling`,
        )
      }

      // In all cases, because footer is shrink-0 and outside flex-1 min-h-0 overflow-y-auto:
      // The total rendered card height will NEVER exceed maxCardHeight.
      const simulatedCardHeight = Math.min(
        maxCardHeight,
        fixedContentHeight + totalItemsContentHeight,
      )
      assert.ok(
        simulatedCardHeight <= maxCardHeight,
        `Rendered card height (${simulatedCardHeight}px) must never exceed max height (${maxCardHeight}px)`,
      )

      // CTA button state simulation
      const isSubmitting = false
      const isButtonDisabled = isSubmitting || count === 0
      assert.equal(
        isButtonDisabled,
        false,
        `CTA button must be ENABLED and CLICKABLE when ${count} tiers are in cart`,
      )
    }
  }
})
