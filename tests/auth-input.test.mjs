import { test } from "node:test"
import assert from "node:assert/strict"
import {
  safeInternalRedirect,
  validateLogin,
  buildRegistrationRequest,
} from "@/features/auth/model/auth-input"
import { requireAuthUser } from "@/features/auth/model/auth-session"

test("login redirects accept internal paths, query strings and hashes", () => {
  assert.equal(safeInternalRedirect("/account?tab=tickets#active"), "/account?tab=tickets#active")
  assert.equal(
    safeInternalRedirect("/events/concert?back=https%3A%2F%2Fexample.com"),
    "/events/concert?back=https%3A%2F%2Fexample.com",
  )
})

test("login redirects cannot navigate to another origin or executable URL", () => {
  for (const destination of [
    null,
    "",
    "https://example.com",
    "javascript:alert(1)",
    "//example.com",
    "/\\example.com",
    "/\n/example.com",
    "/%2fexample.com",
    "/%5cexample.com",
    "/%00example.com",
    "/%0aexample.com",
    "/%not-valid-encoding",
  ]) {
    assert.equal(
      safeInternalRedirect(destination),
      "/account",
      `Rejected destination: ${JSON.stringify(destination)}`,
    )
  }
  assert.equal(safeInternalRedirect("//example.com", "/login"), "/login")
})

test("login rejects missing credentials or malformed email without changing a supplied password", () => {
  assert.ok(validateLogin({ email: " ", password: "password" }))
  assert.ok(validateLogin({ email: "user-at-example.com", password: "password" }))
  assert.ok(validateLogin({ email: "user@example.com", password: "" }))
  assert.equal(validateLogin({ email: " user@example.com ", password: " password " }), null)
})

function registration(overrides = {}) {
  return {
    fullName: "  Nguyễn An  ",
    email: " an@example.com ",
    phone: " 0901234567 ",
    password: " Passw0rd! ",
    confirmPassword: " Passw0rd! ",
    termsAgreed: true,
    ...overrides,
  }
}

test("registration trims contact fields but preserves password bytes and omits UI-only fields", () => {
  assert.deepEqual(buildRegistrationRequest(registration()), {
    fullName: "Nguyễn An",
    email: "an@example.com",
    phone: "0901234567",
    password: " Passw0rd! ",
  })
  assert.equal(
    Object.hasOwn(buildRegistrationRequest(registration({ phone: " " })), "phone"),
    false,
  )
})

test("registration requires name, valid email and a password of at least eight characters", () => {
  for (const overrides of [
    { fullName: " " },
    { email: "not-an-email" },
    { password: "short", confirmPassword: "short" },
  ]) {
    assert.throws(() => buildRegistrationRequest(registration(overrides)))
  }
})

test("registration rejects a different confirmation or unaccepted terms", () => {
  assert.throws(
    () => buildRegistrationRequest(registration({ confirmPassword: "Passw0rd!" })),
    /không khớp/,
  )
  assert.throws(() => buildRegistrationRequest(registration({ termsAgreed: false })), /Điều khoản/)
})

test("an authentication profile must identify a user and provide string roles", () => {
  for (const invalid of [
    undefined,
    null,
    [],
    {},
    { id: "u", roles: [] },
    { email: "u@example.com", roles: [] },
    { id: " ", email: "u@example.com", roles: [] },
    { id: "u", email: "u@example.com", roles: "ADMIN" },
    { id: "u", email: "u@example.com", roles: [{ authority: "ADMIN" }] },
  ]) {
    assert.throws(() => requireAuthUser(invalid))
  }
})

test("a validated profile cannot gain roles through later mutation of the API payload", () => {
  const payload = { id: "user", email: "u@example.com", roles: ["CUSTOMER"], fullName: "An" }
  const user = requireAuthUser(payload)
  payload.roles.push("ADMIN")
  assert.deepEqual(user.roles, ["CUSTOMER"])
  assert.equal(user.fullName, "An")
})

test("optional profile fields do not break a valid session when absent or malformed", () => {
  const user = requireAuthUser({
    id: "user",
    email: "u@example.com",
    roles: [],
    fullName: null,
    phone: 123,
  })
  assert.equal(user.fullName, "")
  assert.equal(user.phone, undefined)
  assert.equal(user.avatarFileId, undefined)
})
