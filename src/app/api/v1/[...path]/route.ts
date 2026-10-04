import { proxyBackendRequest } from "@/lib/api/backend-proxy"

export const runtime = "nodejs"

function forward(request: Request): Promise<Response> {
  return proxyBackendRequest(request, process.env.API_BASE_URL)
}

export {
  forward as GET,
  forward as HEAD,
  forward as POST,
  forward as PUT,
  forward as PATCH,
  forward as DELETE,
}
