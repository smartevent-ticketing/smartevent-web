import { test } from "node:test"
import assert from "node:assert/strict"
import {
  cartQuantityLimit,
  parseRequestedQuantity,
} from "../src/features/booking/model/cart-limits.ts"

test("URL quantity is always a positive safe integer", () => {
  assert.equal(parseRequestedQuantity("3"), 3)
  for (const value of [null, "", "abc", "Infinity", "NaN", "2.5", "-1", "9007199254740992"]) {
    assert.equal(parseRequestedQuantity(value), 1, `Invalid quantity: ${value}`)
  }
})

test("cart quantity respects stock and the remaining event allowance across tiers", () => {
  assert.equal(cartQuantityLimit(4, 0, 10, 2), 0)
  assert.equal(cartQuantityLimit(4, 5, 3, 2), 1)
  assert.equal(cartQuantityLimit(4, 5, 3, 3), 0)
  assert.equal(cartQuantityLimit(4, 2, undefined, 0), 2)
})
