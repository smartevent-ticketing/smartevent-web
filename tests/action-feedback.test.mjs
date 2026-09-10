import { test } from "node:test"
import assert from "node:assert/strict"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { ActionFeedback } from "@/components/shared/action-feedback"

function render(message) {
  return renderToStaticMarkup(createElement(ActionFeedback, { message, onDismiss() {} }))
}

test("feedback is absent when there is no action result", () => {
  assert.equal(render(null), "")
})

test("errors are announced as alerts and support an accessible dismiss action", () => {
  const html = render({ type: "error", text: "Vé đã được sử dụng" })
  assert.match(html, /role="alert"/)
  assert.match(html, /Vé đã được sử dụng/)
  assert.match(html, /aria-label="Đóng thông báo"/)
  assert.match(html, /type="button"/)
})

test("success is a status message and server text is escaped", () => {
  const html = render({ type: "success", text: "<script>alert(1)</script>" })
  assert.match(html, /role="status"/)
  assert.doesNotMatch(html, /<script>/)
  assert.match(html, /&lt;script&gt;/)
})
