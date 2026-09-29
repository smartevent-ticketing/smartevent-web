import { test } from "node:test"
import assert from "node:assert/strict"
import { requireApiSuccess, ApiRequestError, getApiErrorMessage } from "../src/lib/api/result.ts"

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

test("getApiErrorMessage maps EXCEEDED_TICKET_LIMIT to standardized Vietnamese message", () => {
  const errWithCode = new ApiRequestError("Custom server error", 400, "EXCEEDED_TICKET_LIMIT")
  assert.equal(getApiErrorMessage(errWithCode, "Fallback"), "Bạn đã mua giới hạn số vé cho phép")

  const errObj = { code: "EXCEEDED_TICKET_LIMIT" }
  assert.equal(getApiErrorMessage(errObj, "Fallback"), "Bạn đã mua giới hạn số vé cho phép")

  const errMaxUser = { code: "MAX_PER_USER_EXCEEDED" }
  assert.equal(getApiErrorMessage(errMaxUser, "Fallback"), "Bạn đã mua giới hạn số vé cho phép")

  const errMessage = new Error("Lỗi: vượt quá số lượng vé cho phép")
  assert.equal(getApiErrorMessage(errMessage, "Fallback"), "Bạn đã mua giới hạn số vé cho phép")

  const errGeneric = new Error("Something else went wrong")
  assert.equal(getApiErrorMessage(errGeneric, "Fallback"), "Something else went wrong")

  assert.equal(getApiErrorMessage(null, "Fallback message"), "Fallback message")
})
