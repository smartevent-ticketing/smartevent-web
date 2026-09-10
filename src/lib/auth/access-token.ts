"use client"

let accessToken: string | null = null
let version = 0
let refreshAllowed = true

export const accessTokenStore = {
  get(): string | null {
    return accessToken
  },

  set(token: string): void {
    accessToken = token
    version += 1
    refreshAllowed = true
  },

  clear(): void {
    accessToken = null
    version += 1
    refreshAllowed = false
  },

  getVersion(): number {
    return version
  },

  canRefresh(): boolean {
    return refreshAllowed
  },
}
