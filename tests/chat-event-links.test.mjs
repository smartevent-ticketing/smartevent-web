import assert from "node:assert/strict"
import { test } from "node:test"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"

import { ChatEventLinks, chatEventHref } from "../src/features/chat/components/chat-event-links.tsx"

test("chat event button opens the application event route", () => {
  const markup = renderToStaticMarkup(
    createElement(ChatEventLinks, {
      links: [{ event_id: "1", title: "Lễ hội cuối thu", slug: "seed-2026-draft-002" }],
    }),
  )
  assert.match(markup, /href="\/events\/seed-2026-draft-002"/)
  assert.match(markup, /Xem sự kiện/)
  assert.match(markup, /Lễ hội cuối thu/)
})

test("chat event links cannot navigate to external URLs or arbitrary routes", () => {
  for (const slug of [
    "https://evil.test",
    "//evil.test",
    "../admin",
    "x?redirect=evil",
    "javascript:alert(1)",
    "x%2f..",
    "",
  ]) {
    assert.equal(chatEventHref(slug), null)
    const markup = renderToStaticMarkup(
      createElement(ChatEventLinks, {
        links: [{ event_id: "1", title: "Untrusted title", slug }],
      }),
    )
    assert.doesNotMatch(markup, /href=/)
  }
})

test("chat event titles render as text", () => {
  const markup = renderToStaticMarkup(
    createElement(ChatEventLinks, {
      links: [{ event_id: "1", title: '<img src=x onerror="alert(1)">', slug: "demo" }],
    }),
  )
  assert.doesNotMatch(markup, /<img/)
  assert.match(markup, /&lt;img/)
})
