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

export type EventFileType = "BANNER" | "GALLERY" | "SEAT_MAP" | "DOCUMENT"

export type EventMediaResponse = {
  eventFileId: string
  fileID?: string
  fileId?: string
  fileType: EventFileType
  fileUrl: string
  sortOrder?: number
  createdAt?: string
}

export type EventMediaPaths = {
  "/api/v1/events/{eventId}/media": {
    post: {
      parameters: {
        path: { eventId: string }
        query?: {
          type?: EventFileType
        }
      }
      requestBody?: {
        content: {
          "multipart/form-data": {
            file: Blob | File
            type?: EventFileType
          }
        }
      }
      responses: {
        201: { content: { "application/json": { success?: boolean; data?: EventMediaResponse; message?: string } } }
        200: { content: { "application/json": { success?: boolean; data?: EventMediaResponse; message?: string } } }
        default: { content: { "application/json": { message?: string } } }
      }
    }
    get: {
      parameters: {
        path: { eventId: string }
      }
      responses: {
        200: { content: { "application/json": { success?: boolean; data?: EventMediaResponse[]; message?: string } } }
        default: { content: { "application/json": { message?: string } } }
      }
    }
  }
  "/api/v1/events/{eventId}/media/{eventFileId}": {
    delete: {
      parameters: {
        path: { eventId: string; eventFileId: string }
      }
      responses: {
        200: { content: { "application/json": { success?: boolean; data?: void; message?: string } } }
        default: { content: { "application/json": { message?: string } } }
      }
    }
  }
}

