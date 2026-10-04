import assert from "node:assert/strict"
import { test } from "node:test"
import { accessTokenStore } from "@/lib/auth/access-token"

test("login profile loading and token refresh stay on the shared frontend origin", async (t) => {
  const origin = "https://v67k28th-3000.asse.devtunnels.ms"
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window")
  const originalApiBase = process.env.NEXT_PUBLIC_API_BASE_URL
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { location: { origin } },
  })
  process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8080"
  t.after(() => {
    accessTokenStore.clear()
    if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow)
    else delete globalThis.window
    if (originalApiBase === undefined) delete process.env.NEXT_PUBLIC_API_BASE_URL
    else process.env.NEXT_PUBLIC_API_BASE_URL = originalApiBase
  })

  let rejectProfile = false
  const requests = []
  t.mock.method(globalThis, "fetch", async (request) => {
    const url = typeof request === "string" ? new URL(request, origin) : new URL(request.url)
    assert.equal(url.origin, origin, "the browser must never call backend localhost")
    requests.push(url.pathname)
    if (url.pathname === "/api/auth/login") {
      return Response.json({ success: true, data: { accessToken: "login-token" } })
    }
    if (url.pathname === "/api/auth/refresh") {
      return Response.json({ success: true, data: { accessToken: "refreshed-token" } })
    }
    assert.equal(url.pathname, "/api/v1/auth/me")
    if (rejectProfile) {
      rejectProfile = false
      assert.equal(request.headers.get("authorization"), "Bearer login-token")
      return Response.json({ success: false }, { status: 401 })
    }
    assert.equal(request.headers.get("authorization"), `Bearer ${accessTokenStore.get()}`)
    return Response.json({ success: true, data: { email: "user@example.test" } })
  })

  // Import after setting the browser origin to exercise the real API client configuration.
  const { sessionApi } = await import("../src/features/auth/api/session-api.ts")
  const { authApi } = await import("../src/features/auth/api/auth-api.ts")
  const token = await sessionApi.login({ email: "user@example.test", password: "test-password" })
  accessTokenStore.set(token)
  assert.equal((await authApi.getProfile()).data.data.email, "user@example.test")

  rejectProfile = true
  assert.equal((await authApi.getProfile()).data.data.email, "user@example.test")
  assert.equal(accessTokenStore.get(), "refreshed-token")
  assert.deepEqual(requests, [
    "/api/auth/login",
    "/api/v1/auth/me",
    "/api/v1/auth/me",
    "/api/auth/refresh",
    "/api/v1/auth/me",
  ])
})
