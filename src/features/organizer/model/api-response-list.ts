/** The API client returns a transport result containing an ApiResponse envelope. */
export function readApiResponseList<T>(result: { data?: { data?: T[] } } | undefined): T[] {
  const items = result?.data?.data
  return Array.isArray(items) ? items : []
}
