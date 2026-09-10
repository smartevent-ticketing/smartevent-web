import { test } from "node:test"
import assert from "node:assert/strict"
import {
  normalizeScanInput,
  isQrToken,
  mapCheckinHistory,
} from "../src/features/checkin/model/checkin.ts"

test("uppercases and trims human-entered ticket codes", () => {
  assert.equal(normalizeScanInput("  se-sol-89241-01  "), "SE-SOL-89241-01")
  assert.equal(normalizeScanInput("tk-vip-001"), "TK-VIP-001")
  assert.equal(normalizeScanInput("ticket123"), "TICKET123")
  assert.equal(normalizeScanInput(""), "")
  assert.equal(normalizeScanInput("   "), "")
})

test("identifies and preserves QR token case sensitivity (prefix, dots, colons, base64)", () => {
  // Prefix format with mixed case
  const prefixToken = "TCK-QR.7a8b9c.saltedHashValue"
  assert.equal(isQrToken(prefixToken), true)
  assert.equal(normalizeScanInput(prefixToken), prefixToken)

  // Token with signature / dots
  const dottedToken = "header.payloadToken.sig_XyZ123"
  assert.equal(isQrToken(dottedToken), true)
  assert.equal(normalizeScanInput(dottedToken), dottedToken)

  // Token with salt and colon
  const saltedToken = "salt:tokenValue:sigAbc"
  assert.equal(isQrToken(saltedToken), true)
  assert.equal(normalizeScanInput(saltedToken), saltedToken)

  // UUID format with lowercase hex characters
  const uuidToken = "c7b9e078-43d9-4b17-a068-07e5c5bb4f89"
  assert.equal(isQrToken(uuidToken), true)
  assert.equal(normalizeScanInput(uuidToken), uuidToken)
  // Ensure it didn't get uppercased
  assert.notEqual(normalizeScanInput(uuidToken), uuidToken.toUpperCase())

  // Long mixed-case cryptographic token
  const cryptoToken = "dGhpc0lzQVZhbGlkU2lnbmVkUVJUb2tlbkZvclNldXAgMTIz"
  assert.equal(isQrToken(cryptoToken), true)
  assert.equal(normalizeScanInput(cryptoToken), cryptoToken)
})

test("maps checkin history accurately", () => {
  const items = [
    {
      id: "scan-1",
      ticketId: "tck-12345-long-id",
      checkedByUserId: "user-uuid-123",
      gateName: "Cổng Đông",
      checkedAt: "2026-09-09T10:30:00.000Z",
      result: "SUCCESS",
    },
    {
      id: "scan-2",
      ticketId: "tck-99999",
      result: "DUPLICATE",
    },
    {
      ticketId: "tck-invalid",
      result: "TIMEOUT",
    },
  ]

  const mapped = mapCheckinHistory(items)
  assert.deepEqual(mapCheckinHistory(items), mapped)
  assert.equal(mapped[0].id, "scan-1")
  assert.equal(mapped.length, 3)
  assert.equal(mapped[0].status, "SUCCESS")
  assert.equal(mapped[0].gate, "Cổng Đông")
  assert.equal(mapped[0].code, "TCK-12345-LON")
  assert.equal(mapped[1].status, "DUPLICATE")
  assert.equal(mapped[1].gate, "Cổng chung")
  assert.equal(mapped[2].status, "INVALID")
})

test("QR normalization removes surrounding whitespace while preserving every token byte", () => {
  const token = "TCK-QR.aBcDeF0123456789.sig_XyZ"
  assert.equal(normalizeScanInput(` \n${token}\t `), token)
})
