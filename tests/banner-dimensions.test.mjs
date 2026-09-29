import assert from "node:assert/strict"
import test from "node:test"
import { bannerResolutionError } from "@/features/organizer/model/banner-dimensions"

test("banner resolution requires enough pixels for the event hero", () => {
  assert.match(bannerResolutionError(800, 450), /1200/)
  assert.match(bannerResolutionError(1920, 500), /1200/)
  assert.equal(bannerResolutionError(1200, 675), null)
  assert.equal(bannerResolutionError(1920, 1080), null)
})
