export type GrantableRole = "CUSTOMER" | "ORGANIZER" | "ADMIN"

export type AdminUser = {
  id: string
  email: string
  fullName: string
  phone?: string | null
  status: string
  roles: string[]
  createdAt?: string | null
}

export type AdminUsersPage = {
  content: AdminUser[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

type ApiEnvelope<T> = { success?: boolean; message?: string; data?: T }

export type AdminUsersPaths = {
  "/api/v1/admin/users": {
    parameters: { query?: never; header?: never; path?: never; cookie?: never }
    get: {
      parameters: {
        query?: { search?: string; page?: number; size?: number }
        header?: never
        path?: never
        cookie?: never
      }
      responses: {
        200: {
          headers: { [name: string]: unknown }
          content: { "*/*": ApiEnvelope<AdminUsersPage> }
        }
      }
    }
  }
  "/api/v1/admin/users/{userId}/roles": {
    parameters: { query?: never; header?: never; path: { userId: string }; cookie?: never }
    post: {
      parameters: { query?: never; header?: never; path: { userId: string }; cookie?: never }
      requestBody: { content: { "application/json": { roleName: GrantableRole } } }
      responses: {
        200: { headers: { [name: string]: unknown }; content: { "*/*": ApiEnvelope<AdminUser> } }
      }
    }
  }
}
