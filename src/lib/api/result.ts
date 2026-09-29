export class ApiRequestError extends Error {
  readonly status: number
  readonly code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = "ApiRequestError"
    this.status = status
    this.code = code
  }
}

/** openapi-fetch resolves HTTP failures; callers must check them before updating UI. */
export async function requireApiSuccess<T extends { response: Response; error?: unknown }>(
  request: Promise<T>,
): Promise<T> {
  const result = await request
  if (!result.response.ok || result.error != null) {
    const error = result.error
    let message = `Yêu cầu không thành công (${result.response.status}). Vui lòng thử lại.`
    let code: string | undefined = undefined

    if (error && typeof error === "object") {
      if ("message" in error && typeof error.message === "string" && error.message.trim()) {
        message = error.message
      }
      if ("code" in error && typeof error.code === "string") {
        code = error.code
      }
    }
    throw new ApiRequestError(message, result.response.status, code)
  }
  return result
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object") {
    const code = "code" in error ? String((error as { code?: unknown }).code) : undefined
    const message =
      "message" in error ? String((error as { message?: unknown }).message) : undefined

    if (
      code === "EXCEEDED_TICKET_LIMIT" ||
      code === "MAX_PER_USER_EXCEEDED" ||
      message?.includes("EXCEEDED_TICKET_LIMIT") ||
      message?.includes("vượt quá số lượng vé") ||
      message?.includes("giới hạn số vé")
    ) {
      return "Bạn đã mua giới hạn số vé cho phép"
    }
  }
  return error instanceof Error ? error.message : fallback
}
