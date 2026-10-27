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
  assert.equal((await res1.json()).success, false)

  const req2 = new Request("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  })
  const res2 = await POST(req2)
  assert.equal(res2.status, 400)
  assert.equal((await res2.json()).success, false)

  const req3 = new Request("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "   " }),
  })
  const res3 = await POST(req3)
  assert.equal(res3.status, 400)
  assert.equal((await res3.json()).success, false)
})

test("chat API rejects message longer than 2000 characters", async () => {
  const req = new Request("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "a".repeat(2001) }),
  })
  const res = await POST(req)
  assert.equal(res.status, 400)
  assert.equal((await res.json()).success, false)
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
})

test("chat API returns safe fallback response when ai-service is unreachable", async (t) => {
  t.mock.method(globalThis, "fetch", async () => {
    throw new Error("Network connection refused")
  })

  const req = new Request("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Có sự kiện gì hôm nay?" }),
  })

  const res = await POST(req)
  assert.equal(res.status, 200)

  const data = await res.json()
  assert.equal(data.intent, "OFFLINE")
  assert.equal(data.grounding, "NO_LIVE_DATA")
  assert.match(data.answer, /Không thể kết nối/i)
})

test("chat API returns safe fallback response when ai-service returns 500 error", async (t) => {
  t.mock.method(globalThis, "fetch", async () => {
    return new Response("Internal Server Error", { status: 500 })
  })

  const req = new Request("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Chính sách hoàn vé" }),
  })

  const res = await POST(req)
  assert.equal(res.status, 200)

  const data = await res.json()
  assert.equal(data.intent, "OFFLINE")
  assert.match(data.answer, /tạm thời không thể phản hồi/i)
})

test("sendChatMessage calls /api/chat and parses ChatResponseDTO", async (t) => {
  const mockResponse = {
    conversation_id: "c1",
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
  assert.equal(result.conversation_id, "c1")
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
