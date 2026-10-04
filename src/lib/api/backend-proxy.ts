const REQUEST_HEADERS = [
  "accept",
  "authorization",
  "content-type",
  "if-modified-since",
  "if-none-match",
  "range",
  // Next supplies this from the incoming proxy/socket; VNPay uses it for client IP metadata.
  "x-forwarded-for",
]

const RESPONSE_HEADERS = [
  "accept-ranges",
  "content-disposition",
  "content-range",
  "content-type",
  "etag",
  "last-modified",
  "location",
  "retry-after",
]

function copyHeaders(source: Headers, names: string[]): Headers {
  const headers = new Headers()
  for (const name of names) {
    const value = source.get(name)
    if (value !== null) headers.set(name, value)
  }
  return headers
}

/** Forward API traffic to the configured backend without exposing its address to the browser. */
export async function proxyBackendRequest(
  request: Request,
  apiBaseUrl: string | undefined,
): Promise<Response> {
  if (!apiBaseUrl?.trim()) {
    return Response.json(
      { success: false, message: "Máy chủ chưa được cấu hình" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    )
  }

  const incomingUrl = new URL(request.url)
  if (!incomingUrl.pathname.startsWith("/api/v1/")) {
    return Response.json({ success: false, message: "Đường dẫn API không hợp lệ" }, { status: 404 })
  }

  let backendUrl: URL
  try {
    backendUrl = new URL(
      apiBaseUrl.trim().replace(/\/$/, "") + incomingUrl.pathname + incomingUrl.search,
    )
    if (backendUrl.protocol !== "http:" && backendUrl.protocol !== "https:") {
      throw new Error("Invalid backend protocol")
    }
  } catch {
    return Response.json(
      { success: false, message: "Cấu hình máy chủ không hợp lệ" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    )
  }

  const hasBody = request.method !== "GET" && request.method !== "HEAD" && request.body !== null
  const options: RequestInit & { duplex?: "half" } = {
    method: request.method,
    headers: copyHeaders(request.headers, REQUEST_HEADERS),
    body: hasBody ? request.body : undefined,
    ...(hasBody ? { duplex: "half" as const } : {}),
    cache: "no-store",
    redirect: "manual",
    signal: request.signal,
  }

  try {
    const backendResponse = await fetch(backendUrl, options)
    const headers = copyHeaders(backendResponse.headers, RESPONSE_HEADERS)
    headers.set("Cache-Control", "no-store")
    // The upstream stream may already be decompressed; do not copy its length/encoding.
    return new Response(backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers,
    })
  } catch {
    return Response.json(
      { success: false, message: "Không thể kết nối đến máy chủ. Vui lòng thử lại." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    )
  }
}
