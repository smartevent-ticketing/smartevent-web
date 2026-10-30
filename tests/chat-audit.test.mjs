import assert from "node:assert/strict"
import { test } from "node:test"
import { POST } from "../src/app/api/chat/route.ts"
import { sendChatMessage } from "../src/features/chat/api/chat-api.ts"
import { bookingApi } from "../src/features/booking/api/booking-api.ts"
import { apiClient } from "../src/lib/api/client.ts"

const id = "08c25afc-f9c9-4db0-aab7-02c779779d6c"
const answer = {
  conversation_id: id,
  answer: "Kết quả",
  state: {},
  intent: "SEARCH_EVENT",
  grounding: "BACKEND_READ",
  citations: [],
}
const request = (body = {}, signal) =>
  new Request("http://localhost/api/chat", {
    method: "POST",
    body: JSON.stringify({ message: "Tìm concert", ...body }),
    signal,
  })

test("client cancellation is 499 and never an upstream timeout", async (t) => {
  const controller = new AbortController()
  t.mock.method(globalThis, "fetch", async () => {
    controller.abort()
    throw new DOMException("cancelled", "AbortError")
  })
  const response = await POST(request({}, controller.signal))
  assert.equal(response.status, 499)
})

test("unrelated AbortError is unavailable rather than timeout", async (t) => {
  t.mock.method(globalThis, "fetch", async () => {
    throw new DOMException("aborted", "AbortError")
  })
  const response = await POST(request())
  assert.equal(response.status, 502)
  assert.equal((await response.json()).code, "AI_UNAVAILABLE")
})

test("PUBLIC_HELP survives sanitization and safe error metadata survives BFF", async (t) => {
  t.mock.method(globalThis, "fetch", async (_url, options) => {
    assert.equal(JSON.parse(options.body).previous_state.active_intent, "PUBLIC_HELP")
    return Response.json(
      { code: "UPSTREAM_CONTRACT_ERROR", message: "SECRET", request_id: id, retryable: false },
      { status: 502 },
    )
  })
  const response = await POST(request({ previous_state: { active_intent: "PUBLIC_HELP" } }))
  const data = await response.json()
  assert.equal(data.request_id, id)
  assert.equal(data.retryable, false)
  assert.equal(data.code, "UPSTREAM_CONTRACT_ERROR")
  assert.doesNotMatch(data.message, /SECRET/)
})

for (const data of [
  null,
  { ...answer, state: [] },
  { ...answer, events: {} },
  {
    ...answer,
    events: [{ id, name: "Concert", slug: "concert", detail_path: "https://evil.invalid/" }],
  },
  {
    ...answer,
    events: [
      { id, name: "Concert", slug: "concert", detail_path: "/events/concert", price: "500000" },
    ],
  },
  { ...answer, citations: ["bad"] },
  { ...answer, actions: [{ type: "VIEW_EVENT", event_id: id, label: "Xem", route: "/admin" }] },
]) {
  test(`malformed success payload is rejected: ${JSON.stringify(data)}`, async (t) => {
    t.mock.method(globalThis, "fetch", async () => Response.json(data))
    assert.equal((await POST(request())).status, 502)
    await assert.rejects(sendChatMessage({ message: "test" }), { code: "UPSTREAM_CONTRACT_ERROR" })
  })
}

test("non-JSON upstream success is a contract error", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response("SECRET HTML"))
  const response = await POST(request())
  assert.equal(response.status, 502)
  assert.equal((await response.json()).code, "UPSTREAM_CONTRACT_ERROR")
})

test("booking explicitly requests the complete seat map", async (t) => {
  t.mock.method(apiClient, "GET", async (_url, options) => {
    assert.equal(options.params.query.includeUnavailable, true)
    assert.equal(options.params.path.areaId, id)
    return { data: { success: true, data: [] }, response: new Response() }
  })
  await bookingApi.getAvailableSeats({ params: { path: { areaId: id } } })
})
