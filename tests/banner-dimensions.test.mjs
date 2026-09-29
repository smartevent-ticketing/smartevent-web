import assert from "node:assert/strict"
import test from "node:test"
import { bannerResolutionError } from "@/features/organizer/model/banner-dimensions"

test("banner resolution accepts 1080 × 608 and rejects either dimension below the minimum", () => {
  assert.match(bannerResolutionError(1079, 608), /1080 × 608/)
  assert.match(bannerResolutionError(1080, 607), /1080 × 608/)
  assert.equal(bannerResolutionError(1080, 608), null)
  assert.equal(bannerResolutionError(1200, 675), null)
  assert.equal(bannerResolutionError(1920, 1080), null)
})
