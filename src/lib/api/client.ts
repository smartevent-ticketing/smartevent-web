"use client"

import createClient, { type Middleware } from "openapi-fetch"

import { accessTokenStore } from "@/lib/auth/access-token"

import type { paths } from "./schema"

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

if (!apiBaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_API_BASE_URL")
}

const authMiddleware: Middleware = {
  onRequest({ request }) {
    const accessToken = accessTokenStore.get()

    if (accessToken) {
      request.headers.set("Authorization", `Bearer ${accessToken}`)
    }

    return request
  },
}

export const apiClient = createClient<paths>({
  baseUrl: apiBaseUrl,
})

apiClient.use(authMiddleware)