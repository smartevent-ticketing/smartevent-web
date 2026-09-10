export class ApiRequestError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiRequestError"
    this.status = status
  }
}

/** openapi-fetch resolves HTTP failures; callers must check them before updating UI. */
export async function requireApiSuccess<T extends { response: Response; error?: unknown }>(
  request: Promise<T>,
): Promise<T> {
  const result = await request
  if (!result.response.ok || result.error != null) {
    const error = result.error
    const message =
      error && typeof error === "object" && "message" in error && typeof error.message === "string"
        ? error.message
        : `Yêu cầu không thành công (${result.response.status}). Vui lòng thử lại.`
    throw new ApiRequestError(message, result.response.status)
  }
  return result
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}
