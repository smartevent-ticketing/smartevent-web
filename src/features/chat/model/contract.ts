import type { ChatResponseDTO } from "./chat"

export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const SLUG_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,254}$/
const object = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value)
const uuid = (value: unknown) => typeof value === "string" && UUID_PATTERN.test(value)
const text = (value: unknown) => typeof value === "string" && value.trim().length > 0
const date = (value: unknown) =>
  typeof value === "string" &&
  /(?:Z|[+-]\d\d:\d\d)$/.test(value) &&
  Number.isFinite(Date.parse(value))

export function isChatResponse(value: unknown): value is ChatResponseDTO {
  if (
    !object(value) ||
    !uuid(value.conversation_id) ||
    typeof value.answer !== "string" ||
    !text(value.intent) ||
    !text(value.grounding) ||
    !object(value.state) ||
    !Array.isArray(value.citations)
  )
    return false
  if (
    !value.citations.every(
      (c) =>
        object(c) &&
        ["source_id", "version", "title", "canonical_uri", "chunk_id"].every((k) => text(c[k])) &&
        Array.isArray(c.heading_path) &&
        c.heading_path.every(text) &&
        Number.isInteger(c.start) &&
        Number.isInteger(c.end) &&
        (c.start as number) >= 0 &&
        (c.end as number) > (c.start as number),
    )
  )
    return false
  if (
    value.events !== undefined &&
    (!Array.isArray(value.events) ||
      !value.events.every((e) => {
        if (
          !object(e) ||
          !uuid(e.id) ||
          !text(e.name) ||
          typeof e.slug !== "string" ||
          !SLUG_PATTERN.test(e.slug) ||
          e.detail_path !== `/events/${e.slug}`
        )
          return false
        if (
          ["start_time", "end_time", "price_observed_at"].some((k) => e[k] != null && !date(e[k]))
        )
          return false
        if (
          e.start_time &&
          e.end_time &&
          Date.parse(String(e.start_time)) >= Date.parse(String(e.end_time))
        )
          return false
        return (
          e.price == null ||
          (typeof e.price === "string" &&
            /^\d+(?:\.\d+)?$/.test(e.price) &&
            Number.isFinite(Number(e.price)) &&
            e.currency === "VND" &&
            uuid(e.ticket_type_id) &&
            uuid(e.sale_phase_id) &&
            date(e.price_observed_at) &&
            e.price_basis === "TICKET_FACE_VALUE")
        )
      }))
  )
    return false
  if (
    value.actions !== undefined &&
    (!Array.isArray(value.actions) ||
      !value.actions.every(
        (a) =>
          object(a) &&
          text(a.label) &&
          ((a.type === "BROWSE_EVENTS" && a.route === "/events") ||
            (a.type === "VIEW_EVENT" &&
              uuid(a.event_id) &&
              typeof a.route === "string" &&
              /^\/events\/[a-zA-Z0-9][a-zA-Z0-9_-]{0,254}$/.test(a.route))),
      ))
  )
    return false
  return value.has_more === undefined || typeof value.has_more === "boolean"
}
