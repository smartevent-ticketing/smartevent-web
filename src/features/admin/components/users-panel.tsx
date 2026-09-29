"use client"

import { useEffect, useState, type FormEvent } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  ShieldCheck,
  UserRoundPlus,
  UsersRound,
  X,
} from "lucide-react"

import { ActionFeedback } from "@/components/shared/action-feedback"
import { useAuth } from "@/features/auth"
import { getApiErrorMessage } from "@/lib/api/result"
import type { AdminUser, AdminUsersPage, GrantableRole } from "@/lib/api/admin-users-contract"
import { adminApi } from "../api/admin-api"
import type { AdminNotification } from "../model/admin-types"

const grantableRoles: GrantableRole[] = ["CUSTOMER", "ORGANIZER", "ADMIN"]

function roleLabel(role: string) {
  switch (role.replace(/^ROLE_/, "").toUpperCase()) {
    case "ADMIN":
      return "Quản trị viên"
    case "ORGANIZER":
      return "Ban tổ chức"
    case "CUSTOMER":
      return "Khách hàng"
    default:
      return role
  }
}

function statusLabel(status: string) {
  if (status === "ACTIVE") return "Đang hoạt động"
  if (status === "DISABLED") return "Tạm khóa"
  return status
}

function dateLabel(value?: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? date.toLocaleDateString("vi-VN") : "—"
}

export function AdminUsersPanel() {
  const { user: currentUser } = useAuth()
  const [searchText, setSearchText] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const [result, setResult] = useState<AdminUsersPage | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [notification, setNotification] = useState<AdminNotification | null>(null)
  const [savingUserId, setSavingUserId] = useState<string | null>(null)
  const [pendingAdminGrant, setPendingAdminGrant] = useState<AdminUser | null>(null)

  useEffect(() => {
    let active = true
    async function loadUsers() {
      try {
        const response = await adminApi.listUsers(search, page)
        if (!response.data?.data) throw new Error("Máy chủ chưa trả về danh sách người dùng.")
        if (active) {
          setResult(response.data.data)
          setLoadError(null)
        }
      } catch (error) {
        if (active) setLoadError(getApiErrorMessage(error, "Không thể tải danh sách người dùng."))
      } finally {
        if (active) setIsLoading(false)
      }
    }
    void loadUsers()
    return () => {
      active = false
    }
  }, [search, page, refreshKey])

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setLoadError(null)
    setPage(0)
    setSearch(searchText.trim())
    setRefreshKey((value) => value + 1)
  }

  function changePage(nextPage: number) {
    setIsLoading(true)
    setLoadError(null)
    setPage(nextPage)
  }

  async function grantRole(target: AdminUser, roleName: GrantableRole) {
    if (savingUserId) return false
    setSavingUserId(target.id)
    setNotification(null)
    try {
      const response = await adminApi.grantUserRole(target.id, roleName)
      const updated = response.data?.data
      if (!updated) throw new Error("Máy chủ chưa xác nhận quyền vừa cấp.")
      setResult((current) =>
        current
          ? {
              ...current,
              content: current.content.map((item) => (item.id === updated.id ? updated : item)),
            }
          : current,
      )
      setNotification({
        type: "success",
        text: `Đã cấp quyền ${roleLabel(roleName)} cho ${updated.email}. Người dùng cần đăng nhập lại để sử dụng quyền mới.`,
      })
      return true
    } catch (error) {
      setNotification({ type: "error", text: getApiErrorMessage(error, "Không thể cấp quyền.") })
      return false
    } finally {
      setSavingUserId(null)
    }
  }

  const users = result?.content ?? []
  const totalPages = Math.max(1, result?.totalPages ?? 1)

  return (
    <div className="space-y-6">
      <ActionFeedback message={notification} onDismiss={() => setNotification(null)} />

      <section className="admin-card p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="admin-kicker">Tài khoản hệ thống</p>
            <h2 className="mt-1 text-xl font-extrabold text-[#251f29]">Quản lý người dùng</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#756d77]">
              Tìm tài khoản theo tên hoặc email, kiểm tra quyền hiện tại và cấp thêm quyền. Quyền
              mới có hiệu lực khi người dùng đăng nhập lại.
            </p>
          </div>
          <div className="flex size-11 items-center justify-center rounded-2xl bg-[#bd443a]/10 text-[#bd443a]">
            <UsersRound className="size-5" />
          </div>
        </div>
        <form onSubmit={handleSearch} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <label className="relative block flex-1">
            <span className="sr-only">Tìm theo tên hoặc email</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#9a8c92]" />
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              maxLength={100}
              placeholder="Tìm theo tên hoặc email..."
              className="admin-input w-full pl-11"
            />
          </label>
          <button type="submit" className="admin-primary-button justify-center sm:min-w-28">
            Tìm kiếm
          </button>
        </form>
      </section>

      <section className="admin-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eee6e1] px-5 py-5 sm:px-7">
          <div>
            <p className="admin-kicker">Danh sách</p>
            <h2 className="mt-1 text-lg font-extrabold text-[#251f29]">
              {result ? `${result.totalElements} tài khoản` : "Người dùng"}
            </h2>
          </div>
          <ShieldCheck className="size-5 text-[#bd443a]" />
        </div>

        {isLoading ? (
          <div
            role="status"
            className="flex items-center justify-center gap-2 px-5 py-14 text-sm text-[#756d77]"
          >
            <Loader2 className="size-5 animate-spin" /> Đang tải người dùng...
          </div>
        ) : loadError ? (
          <div role="alert" className="space-y-3 px-5 py-12 text-center text-sm text-[#9a3e34]">
            <p>{loadError}</p>
            <button
              type="button"
              className="admin-secondary-button"
              onClick={() => {
                setIsLoading(true)
                setRefreshKey((value) => value + 1)
              }}
            >
              Thử lại
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="px-5 py-14 text-center text-sm text-[#756d77]">
            {search ? "Không tìm thấy tài khoản phù hợp." : "Chưa có tài khoản nào."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table min-w-[860px]">
              <thead>
                <tr>
                  <th className="px-6 py-4">Người dùng</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4">Quyền hiện tại</th>
                  <th className="px-6 py-4">Tham gia</th>
                  <th className="px-6 py-4 text-right">Cấp thêm quyền</th>
                </tr>
              </thead>
              <tbody>
                {users.map((account) => {
                  const existingRoles = new Set(
                    account.roles.map((role) => role.replace(/^ROLE_/, "").toUpperCase()),
                  )
                  const availableRoles = grantableRoles.filter((role) => !existingRoles.has(role))
                  return (
                    <tr key={account.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#f2e8e5] text-sm font-extrabold text-[#a5443c]">
                            {(account.fullName || account.email).trim().charAt(0).toUpperCase()}
                          </span>
                          <span className="min-w-0">
                            <span className="block font-bold text-[#251f29]">
                              {account.fullName || "Chưa có tên"}{" "}
                              {account.id === currentUser?.id && (
                                <span className="text-xs font-medium text-[#a5443c]">(Bạn)</span>
                              )}
                            </span>
                            <span className="block text-xs text-[#756d77]">{account.email}</span>
                            {account.phone && (
                              <span className="block text-xs text-[#9a8c92]">{account.phone}</span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#655a64]">
                        {statusLabel(account.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {account.roles.map((role) => (
                            <span
                              key={role}
                              className="rounded-full bg-[#f4efec] px-2.5 py-1 text-[11px] font-bold text-[#62545f]"
                            >
                              {roleLabel(role)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#756d77]">
                        {dateLabel(account.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {availableRoles.length ? (
                          <div className="flex flex-wrap justify-end gap-2">
                            {availableRoles.map((role) => (
                              <button
                                key={role}
                                type="button"
                                disabled={savingUserId !== null}
                                onClick={() =>
                                  role === "ADMIN"
                                    ? setPendingAdminGrant(account)
                                    : void grantRole(account, role)
                                }
                                className="admin-secondary-button !min-h-0 !px-3 !py-2 text-xs"
                              >
                                {savingUserId === account.id ? (
                                  <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                  <UserRoundPlus className="size-3.5" />
                                )}
                                Cấp {roleLabel(role)}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-[#9a8c92]">Đã có đủ quyền</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && !loadError && result && result.totalPages > 1 && (
          <div className="flex items-center justify-between gap-3 border-t border-[#eee6e1] px-5 py-4 sm:px-7">
            <span className="text-xs text-[#756d77]">
              Trang {page + 1} / {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => changePage(page - 1)}
                className="admin-secondary-button !min-h-0 !p-2"
                aria-label="Trang trước"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                disabled={result.last}
                onClick={() => changePage(page + 1)}
                className="admin-secondary-button !min-h-0 !p-2"
                aria-label="Trang sau"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}
      </section>

      {pendingAdminGrant && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#14121b]/70 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="grant-admin-title"
            aria-describedby="grant-admin-description"
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-[#fff0eb] text-[#bd443a]">
                <ShieldCheck className="size-5" />
              </div>
              <button
                type="button"
                onClick={() => setPendingAdminGrant(null)}
                disabled={savingUserId !== null}
                aria-label="Đóng"
                className="rounded-lg p-2 text-[#756d77] hover:bg-[#f6f1ee]"
              >
                <X className="size-4" />
              </button>
            </div>
            <h2 id="grant-admin-title" className="mt-5 text-xl font-extrabold text-[#251f29]">
              Cấp quyền quản trị viên?
            </h2>
            <p id="grant-admin-description" className="mt-2 text-sm leading-6 text-[#756d77]">
              <strong className="text-[#251f29]">{pendingAdminGrant.email}</strong> sẽ có quyền quản
              lý toàn bộ hệ thống. Hãy xác nhận đúng tài khoản trước khi tiếp tục.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={savingUserId !== null}
                onClick={() => setPendingAdminGrant(null)}
                className="admin-secondary-button"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={savingUserId !== null}
                onClick={async () => {
                  await grantRole(pendingAdminGrant, "ADMIN")
                  setPendingAdminGrant(null)
                }}
                className="admin-primary-button"
              >
                {savingUserId ? "Đang cấp quyền..." : "Xác nhận cấp Admin"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
