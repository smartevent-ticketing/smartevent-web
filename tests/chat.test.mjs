import assert from "node:assert/strict"
import { test } from "node:test"

import { POST } from "../src/app/api/chat/route.ts"
import { sendChatMessage } from "../src/features/chat/api/chat-api.ts"

test("chat API rejects non-JSON or missing message with 400", async () => {
  const req1 = new Request("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "invalid-json",
  })
  const res1 = await POST(req1)
  assert.equal(res1.status, 400)
  const data1 = await res1.json()
  assert.equal(data1.success, false)
  assert.equal(data1.code, "INVALID_REQUEST")

  const req2 = new Request("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  })
  const res2 = await POST(req2)
  assert.equal(res2.status, 400)
  const data2 = await res2.json()
  assert.equal(data2.success, false)
  assert.equal(data2.code, "INVALID_REQUEST")

  const req3 = new Request("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "   " }),
  })
  const res3 = await POST(req3)
  assert.equal(res3.status, 400)
  const data3 = await res3.json()
  assert.equal(data3.success, false)
  assert.equal(data3.code, "INVALID_REQUEST")
})

test("chat API rejects message longer than 2000 characters", async () => {
  const req = new Request("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "a".repeat(2001) }),
  })
  const res = await POST(req)
  assert.equal(res.status, 400)
  const data = await res.json()
  assert.equal(data.success, false)
  assert.equal(data.code, "INVALID_REQUEST")
})

test("chat API forwards request to ai-service and returns response", async (t) => {
  const mockAiResponse = {
    conversation_id: "08c25afc-f9c9-4db0-aab7-02c779779d6c",
    intent: "SEARCH_EVENT",
    state: { city: "Hà Nội", quantity: 2 },
    answer: "Danh sách sự kiện tại Hà Nội...",
    grounding: "BACKEND_READ",
    tool_called: "search_events",
    citations: [],
    event_links: [{ event_id: "event-1", title: "Đêm nhạc", slug: "dem-nhac" }],
  }

  const upstream = t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.match(String(url), /\/api\/v1\/chat$/)
    assert.equal(options.method, "POST")
    const body = JSON.parse(options.body)
    assert.equal(body.message, "Tìm 2 vé ở Hà Nội")
    return Response.json(mockAiResponse)
  })

  const req = new Request("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Tìm 2 vé ở Hà Nội" }),
  })

  const res = await POST(req)
  assert.equal(upstream.mock.callCount(), 1)
  assert.equal(res.status, 200)

  const data = await res.json()
  assert.equal(data.conversation_id, "08c25afc-f9c9-4db0-aab7-02c779779d6c")
  assert.equal(data.intent, "SEARCH_EVENT")
  assert.equal(data.state.city, "Hà Nội")
  assert.equal(data.answer, "Danh sách sự kiện tại Hà Nội...")
  assert.deepEqual(data.event_links, mockAiResponse.event_links)
})

test("chat API reports unavailable AI as 502 without leaking transport details", async (t) => {
  t.mock.method(globalThis, "fetch", async () => {
    throw new Error("SECRET_TRANSPORT_DETAILS")
  })
  const response = await POST(
    new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: "xin chào" }),
    }),
  )
  assert.equal(response.status, 502)
  assert.equal((await response.json()).code, "AI_UNAVAILABLE")
})

for (const status of [400, 422, 429, 500, 503, 504]) {
  test(`chat API preserves upstream HTTP ${status} with safe error fields`, async (t) => {
    t.mock.method(globalThis, "fetch", async () =>
      Response.json({ code: "MODEL_UNAVAILABLE", message: "SECRET" }, { status }),
    )
    const response = await POST(
      new Request("http://localhost/api/chat", {
        method: "POST",
        body: JSON.stringify({ message: "xin chào" }),
      }),
    )
    assert.equal(response.status, status)
    const body = await response.json()
    assert.equal(body.code, "MODEL_UNAVAILABLE")
    assert.doesNotMatch(body.message, /SECRET/)
  })
}

test("chat API maps timeout to 504", async (t) => {
  t.mock.method(globalThis, "fetch", async () => {
    throw new DOMException("timed out", "TimeoutError")
  })
  const response = await POST(
    new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: "xin chào" }),
    }),
  )
  assert.equal(response.status, 504)
  assert.equal((await response.json()).code, "UPSTREAM_TIMEOUT")
})

test("chat client forwards abort signal and retains error status/code", async (t) => {
  const controller = new AbortController()
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(options.signal, controller.signal)
    return Response.json({ code: "BACKEND_UNAVAILABLE" }, { status: 503 })
  })
  await assert.rejects(
    sendChatMessage({ message: "xin chào" }, controller.signal),
    (error) => error.status === 503 && error.code === "BACKEND_UNAVAILABLE",
  )
})

test("sendChatMessage calls /api/chat and parses ChatResponseDTO", async (t) => {
  const mockResponse = {
    conversation_id: "08c25afc-f9c9-4db0-aab7-02c779779d6c",
    intent: "GREETING",
    state: {},
    answer: "Xin chào bạn!",
    grounding: "NO_LIVE_DATA",
    tool_called: null,
    citations: [],
  }

  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(String(url), "/api/chat")
    assert.equal(options.method, "POST")
    return Response.json(mockResponse)
  })

  const result = await sendChatMessage({ message: "Chào bạn" })
  assert.equal(result.conversation_id, "08c25afc-f9c9-4db0-aab7-02c779779d6c")
  assert.equal(result.answer, "Xin chào bạn!")
})

test("chat API strips non-UUID conversation_id and invalid active_intent before forwarding", async (t) => {
  let capturedBody = null
  t.mock.method(globalThis, "fetch", async (url, options) => {
    capturedBody = JSON.parse(options.body)
    return Response.json({
      conversation_id: "08c25afc-f9c9-4db0-aab7-02c779779d6c",
      intent: "GREETING",
      state: {},
      answer: "Xin chào!",
      grounding: "NO_LIVE_DATA",
      tool_called: null,
      citations: [],
    })
  })

  const req = new Request("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Xin chào",
      conversation_id: "non-uuid-conversation-id",
      previous_state: {
        city: "Hà Nội",
        active_intent: "OFFLINE",
      },
    }),
  })

  const res = await POST(req)
  assert.equal(res.status, 200)
  assert.equal(capturedBody.conversation_id, undefined)
  assert.equal(capturedBody.previous_state.city, "Hà Nội")
  assert.equal(capturedBody.previous_state.active_intent, undefined)
})

test("chat API preserves public help intent and source citations across followup turns", async (t) => {
  t.mock.method(globalThis, "fetch", async (_url, options) => {
    const body = JSON.parse(options.body)
    assert.equal(body.previous_state.active_intent, "PUBLIC_HELP")
    return Response.json({
      conversation_id: "08c25afc-f9c9-4db0-aab7-02c779779d6c",
      intent: "PUBLIC_HELP",
      state: body.previous_state,
      answer: "Phiên bản hiện tại tích hợp VNPay.",
      grounding: "APPROVED_CORPUS",
      tool_called: null,
      event_links: [],
      citations: [
        {
          source_id: "HELP-01",
          version: "1.0.0",
          title: "Phương thức thanh toán",
          canonical_uri: "https://example.com/payment",
          chunk_id: "c-01",
          heading_path: ["VNPay"],
          start: 0,
          end: 100,
        },
      ],
    })
  })
  const response = await POST(
    new Request("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Còn MoMo thì sao?",
        previous_state: { active_intent: "PUBLIC_HELP" },
      }),
    }),
  )
  const data = await response.json()
  assert.equal(data.grounding, "APPROVED_CORPUS")
  assert.equal(data.citations[0].source_id, "HELP-01")
})
