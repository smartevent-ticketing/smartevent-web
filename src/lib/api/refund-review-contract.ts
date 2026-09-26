export type RefundReviewStatus =
  "REQUIRED" | "IN_REVIEW" | "REFUNDED_CONFIRMED" | "CLOSED_NO_REFUND"

export interface RefundReview {
  id: string
  paymentId: string
  orderId: string
  amount: number
  reason: string
  status: RefundReviewStatus
  resolutionNote: string | null
  evidenceReference: string | null
  updatedByUserId: string | null
  resolvedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface RefundReviewAction {
  id: string
  reviewId: string
  previousStatus: RefundReviewStatus
  newStatus: RefundReviewStatus
  note: string
  evidenceReference: string | null
  adminUserId: string
  createdAt: string
}

type Envelope<T> = { success: boolean; message: string; data: T; timestamp: string }
type ErrorEnvelope = { message?: string; code?: string }

export type RefundReviewPaths = {
  "/api/v1/admin/payment-refund-reviews": {
    get: {
      parameters: { query: { status: RefundReviewStatus; page?: number; size?: number } }
      responses: {
        200: {
          content: {
            "application/json": Envelope<{
              content: RefundReview[]
              page: number
              size: number
              totalElements: number
              totalPages: number
              last: boolean
            }>
          }
        }
        default: { content: { "application/json": ErrorEnvelope } }
      }
    }
  }
  "/api/v1/admin/payment-refund-reviews/{id}": {
    patch: {
      parameters: { path: { id: string } }
      requestBody: {
        content: {
          "application/json": {
            status: RefundReviewStatus
            note: string
            evidenceReference?: string
          }
        }
      }
      responses: {
        200: { content: { "application/json": Envelope<RefundReview> } }
        default: { content: { "application/json": ErrorEnvelope } }
      }
    }
  }
  "/api/v1/admin/payment-refund-reviews/{id}/history": {
    get: {
      parameters: { path: { id: string } }
      responses: {
        200: { content: { "application/json": Envelope<RefundReviewAction[]> } }
        default: { content: { "application/json": ErrorEnvelope } }
      }
    }
  }
}
