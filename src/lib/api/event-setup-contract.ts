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

export type AdminEventPaths = {
  "/api/v1/admin/events": {
    get: {
      parameters?: {
        query?: {
          status?: string
          page?: number
          size?: number
          sort?: string
        }
      }
      responses: {
        200: { content: { "application/json": components["schemas"]["ApiResponsePageResponseEventResponse"] } }
        default: { content: { "application/json": { message?: string } } }
      }
    }
  }
  "/api/v1/admin/events/pending": {
    get: {
      parameters?: {
        query?: {
          page?: number
          size?: number
          sort?: string
        }
      }
      responses: {
        200: { content: { "application/json": components["schemas"]["ApiResponsePageResponseEventResponse"] } }
        default: { content: { "application/json": { message?: string } } }
      }
    }
  }
  "/api/v1/admin/events/{id}": {
    get: {
      parameters: {
        path: { id: string }
      }
      responses: {
        200: { content: { "application/json": components["schemas"]["ApiResponseEventResponse"] } }
        default: { content: { "application/json": { message?: string } } }
      }
    }
  }
}

export type SalePhasePaths = {
  "/api/v1/ticket-types/{ticketTypeId}/sale-phases": {
    post: {
      parameters: {
        path: { ticketTypeId: string }
      }
      requestBody: {
        content: {
          "application/json": {
            name: string
            price: number
            quantity: number
            saleStartAt: string
            saleEndAt: string
            maxPerOrder?: number
            maxPerUser?: number
            status?: "ACTIVE" | "PAUSED" | "CLOSED"
          }
        }
      }
      responses: {
        200: { content: { "application/json": { success?: boolean; data?: any; message?: string } } }
        default: { content: { "application/json": { message?: string } } }
      }
    }
  }
}
