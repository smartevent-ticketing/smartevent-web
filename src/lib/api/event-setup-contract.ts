import type { components } from "./schema"

/** Additive contract for the event setup endpoint; existing generated endpoints remain unchanged. */
export type EventSetupRequest = {
  event: components["schemas"]["CreateEventRequest"]
  tiers: { name: string; areaType: "STANDING" | "SEATED"; price: number; capacity: number }[]
}

export type EventSetupPaths = {
  "/api/v1/events/setup": {
    post: {
      requestBody: { content: { "application/json": EventSetupRequest } }
      responses: {
        200: { content: { "application/json": components["schemas"]["ApiResponseEventResponse"] } }
        default: { content: { "application/json": { message?: string } } }
      }
    }
  }
}
