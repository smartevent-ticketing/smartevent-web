import { test } from "node:test"
import assert from "node:assert/strict"
import { requireApiSuccess, ApiRequestError } from "../src/lib/api/result.ts"

for (const status of [400, 403, 409, 500]) {
  test(`HTTP ${status} cannot reach a mutation's success branch`, async () => {
    let success = false
    await assert.rejects(
      async () => {
        await requireApiSuccess(
          Promise.resolve({
            response: new Response(null, { status }),
            error: { message: "Rejected" },
          }),
        )
        success = true
      },
      (error) =>
        error instanceof ApiRequestError && error.status === status && error.message === "Rejected",
    )
    assert.equal(success, false)
  })
}

test("204 deletion succeeds without a response body", async () => {
  const result = { response: new Response(null, { status: 204 }) }
  assert.equal(await requireApiSuccess(Promise.resolve(result)), result)
})
