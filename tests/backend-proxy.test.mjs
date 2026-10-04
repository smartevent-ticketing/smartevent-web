import assert from "node:assert/strict"
import { test } from "node:test"
import { proxyBackendRequest } from "../src/lib/api/backend-proxy.ts"

const frontend = "https://v67k28th-3000.asse.devtunnels.ms"
const backend = "http://localhost:8080"

test("profile requests keep authorization and query while isolating frontend cookies", async (t) => {
  const upstream = t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(String(url), backend + "/api/v1/auth/me?detail=full")
    assert.equal(options.method, "GET")
    assert.equal(options.headers.get("authorization"), "Bearer access-token")
    assert.equal(options.headers.get("x-forwarded-for"), "192.0.2.17")
    assert.equal(options.headers.get("cookie"), null)
    assert.equal(options.headers.get("origin"), null)
    assert.equal(options.cache, "no-store")
    return Response.json({ success: true, data: { email: "user@example.test" } })
  })
  const response = await proxyBackendRequest(
    new Request(frontend + "/api/v1/auth/me?detail=full", {
      headers: {
        Authorization: "Bearer access-token",
        Cookie: "smartevent_refresh_token=private-cookie",
        Origin: frontend,
        "X-Forwarded-For": "192.0.2.17",
      },
    }),
    backend,
  )
  assert.equal(upstream.mock.callCount(), 1)
  assert.equal(response.status, 200)
  assert.equal(response.headers.get("cache-control"), "no-store")
  assert.equal((await response.json()).data.email, "user@example.test")
})

test("backend rejections preserve their status and error message for the UI", async (t) => {
  let status = 401
  t.mock.method(globalThis, "fetch", async () =>
    Response.json({ success: false, message: "Backend rejected request" }, { status }),
  )
  for (status of [400, 401, 403, 429, 503]) {
    const response = await proxyBackendRequest(new Request(frontend + "/api/v1/auth/me"), backend)
    assert.equal(response.status, status)
    assert.equal((await response.json()).message, "Backend rejected request")
  }
})

test("JSON mutations and multipart uploads retain their bytes and content type", async (t) => {
  const form = new FormData()
  form.append("file", new Blob([new Uint8Array([0, 1, 255, 42])]), "avatar.png")
  const requests = [
    new Request(frontend + "/api/v1/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: 2, note: "Giữ vé" }),
    }),
    new Request(frontend + "/api/v1/auth/me/avatar", { method: "PUT", body: form }),
  ]
  const forwarded = []
  t.mock.method(globalThis, "fetch", async (url, options) => {
    forwarded.push(new Request(url, options))
    return new Response(null, { status: 204 })
  })
  for (const request of requests) {
    const original = request.clone()
    const response = await proxyBackendRequest(request, backend)
    const received = forwarded.at(-1)
    assert.equal(received.method, original.method)
    assert.equal(received.headers.get("content-type"), original.headers.get("content-type"))
    assert.deepEqual(await received.arrayBuffer(), await original.arrayBuffer())
    assert.equal(response.status, 204)
    assert.equal(await response.text(), "")
  }
})

test("PDF downloads preserve file headers and bytes without upstream cookies or encoding", async (t) => {
  const bytes = new Uint8Array([37, 80, 68, 70, 45, 0, 255])
  t.mock.method(
    globalThis,
    "fetch",
    async () =>
      new Response(bytes, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="invoice.pdf"',
          "Content-Encoding": "gzip",
          "Content-Length": "1000",
          "Set-Cookie": "backend_session=private",
        },
      }),
  )
  const response = await proxyBackendRequest(
    new Request(frontend + "/api/v1/invoices/invoice-id/download"),
    backend,
  )
  assert.equal(response.headers.get("content-type"), "application/pdf")
  assert.equal(response.headers.get("content-disposition"), 'attachment; filename="invoice.pdf"')
  for (const name of ["content-encoding", "content-length", "set-cookie"]) {
    assert.equal(response.headers.get(name), null)
  }
  assert.deepEqual(new Uint8Array(await response.arrayBuffer()), bytes)
})

test("unreachable or unconfigured backends return a readable API error", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () => {
    throw new TypeError("fetch failed")
  })
  const request = () => new Request(frontend + "/api/v1/auth/me")
  for (const config of [undefined, " ", "ftp://localhost", "not-a-url"]) {
    const response = await proxyBackendRequest(request(), config)
    assert.equal(response.status, 500)
    assert.equal((await response.json()).success, false)
  }
  assert.equal(fetch.mock.callCount(), 0)
  const response = await proxyBackendRequest(request(), backend)
  assert.equal(response.status, 502)
  assert.match((await response.json()).message, /Không thể kết nối/)
})

test("forwarding is restricted to the API namespace and preserves upstream redirects", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async (_url, options) => {
    assert.equal(options.redirect, "manual")
    return new Response(null, {
      status: 302,
      headers: { Location: "https://payment.example.test/return" },
    })
  })
  const outside = await proxyBackendRequest(new Request(frontend + "/private"), backend)
  assert.equal(outside.status, 404)
  assert.equal(fetch.mock.callCount(), 0)
  const response = await proxyBackendRequest(
    new Request(frontend + "/api/v1/payments/vnpay-return"),
    backend,
  )
  assert.equal(response.status, 302)
  assert.equal(response.headers.get("location"), "https://payment.example.test/return")
})
