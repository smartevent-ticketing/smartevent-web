import { test, beforeEach, afterEach } from "node:test"
import assert from "node:assert/strict"
import { accessTokenStore } from "@/lib/auth/access-token"
import { refreshAccessToken, waitForTokenRefresh } from "@/lib/auth/token-refresher"

beforeEach(() => accessTokenStore.set("current-session-token"))
afterEach(async () => {
  await waitForTokenRefresh()
  accessTokenStore.clear()
})

function deferred() {
  let resolve
  const promise = new Promise((done) => {
    resolve = done
  })
  return { promise, resolve }
}

test("concurrent refresh callers share one request and receive the same new token", async (t) => {
  const response = deferred()
  const request = t.mock.method(globalThis, "fetch", () => response.promise)
  const first = refreshAccessToken()
  const second = refreshAccessToken()
  assert.equal(request.mock.callCount(), 1)
  response.resolve(Response.json({ data: { accessToken: "refreshed-token" } }))
  assert.deepEqual(await first, { status: "refreshed", accessToken: "refreshed-token" })
  assert.deepEqual(await second, { status: "refreshed", accessToken: "refreshed-token" })
  assert.equal(accessTokenStore.get(), "refreshed-token")
})

test("a refresh completing after logout cannot restore the session or start another refresh", async (t) => {
  const response = deferred()
  const request = t.mock.method(globalThis, "fetch", () => response.promise)
  const refreshing = refreshAccessToken()
  accessTokenStore.clear()
  response.resolve(Response.json({ data: { accessToken: "obsolete-token" } }))
  assert.deepEqual(await refreshing, { status: "superseded" })
  assert.equal(accessTokenStore.get(), null)
  assert.deepEqual(await refreshAccessToken(), { status: "session_expired" })
  assert.equal(request.mock.callCount(), 1)
})

test("an old session's rejected refresh cannot clear a newer login", async (t) => {
  const response = deferred()
  t.mock.method(globalThis, "fetch", () => response.promise)
  const refreshing = refreshAccessToken()
  accessTokenStore.set("new-login-token")
  response.resolve(new Response(null, { status: 401 }))
  assert.deepEqual(await refreshing, { status: "superseded" })
  assert.equal(accessTokenStore.get(), "new-login-token")
  assert.equal(accessTokenStore.canRefresh(), true)
})

test("an old successful refresh also cannot replace a newer login token", async (t) => {
  const response = deferred()
  t.mock.method(globalThis, "fetch", () => response.promise)
  const refreshing = refreshAccessToken()
  accessTokenStore.set("new-login-token")
  response.resolve(Response.json({ data: { accessToken: "old-refreshed-token" } }))
  assert.deepEqual(await refreshing, { status: "superseded" })
  assert.equal(accessTokenStore.get(), "new-login-token")
})

test("temporary server and transport failures preserve the existing session for retry", async (t) => {
  const request = t.mock.method(
    globalThis,
    "fetch",
    async () => new Response(null, { status: 503 }),
  )
  assert.equal((await refreshAccessToken()).status, "network_error")
  assert.equal(accessTokenStore.get(), "current-session-token")
  request.mock.mockImplementation(async () => {
    throw new TypeError("Failed to fetch")
  })
  assert.equal((await refreshAccessToken()).status, "network_error")
  assert.equal(accessTokenStore.get(), "current-session-token")
  assert.equal(accessTokenStore.canRefresh(), true)
})

test("rejected refresh and successful responses without a token end the session", async (t) => {
  const request = t.mock.method(
    globalThis,
    "fetch",
    async () => new Response(null, { status: 403 }),
  )
  assert.deepEqual(await refreshAccessToken(), { status: "session_expired" })
  assert.equal(accessTokenStore.get(), null)
  accessTokenStore.set("second-session-token")
  request.mock.mockImplementation(async () => Response.json({ data: {} }))
  assert.deepEqual(await refreshAccessToken(), { status: "session_expired" })
  assert.equal(accessTokenStore.get(), null)
})

test("waiting for token refresh observes an existing request without creating one", async (t) => {
  const response = deferred()
  const request = t.mock.method(globalThis, "fetch", () => response.promise)
  await waitForTokenRefresh()
  assert.equal(request.mock.callCount(), 0)
  const refreshing = refreshAccessToken()
  let finished = false
  const waiting = waitForTokenRefresh().then(() => {
    finished = true
  })
  await Promise.resolve()
  assert.equal(finished, false)
  response.resolve(Response.json({ data: { accessToken: "refreshed-token" } }))
  await Promise.all([refreshing, waiting])
  assert.equal(finished, true)
  assert.equal(request.mock.callCount(), 1)
})
