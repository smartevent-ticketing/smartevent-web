"use client"

import {
  BadgeCheck,
  Building2,
  CalendarDays,
  Camera,
  Hash,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react"
import { useRef, useState, type ChangeEvent, type ReactNode } from "react"

import { useAuth } from "@/features/auth"
import { UserAvatar } from "@/components/ui/user-avatar"

function ProfileField({ icon, label, value }: { icon: ReactNode; label: string; value?: string }) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-outline-variant bg-surface p-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-container text-primary">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-on-surface-variant">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold text-on-surface">
          {value?.trim() || "Chưa cập nhật"}
        </p>
      </div>
    </div>
  )
}

function roleLabel(role: string) {
  const normalized = role.toUpperCase().replace(/^ROLE_/, "")
  if (normalized === "ADMIN") return "Quản trị viên"
  if (normalized === "ORGANIZER") return "Ban tổ chức"
  if (normalized === "CUSTOMER" || normalized === "USER") return "Khách hàng"
  return role
}

export function CustomerProfilePanel() {
  const { user, avatarUrl, updateAvatar } = useAuth()
  const fileInput = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [avatarMessage, setAvatarMessage] = useState("")
  const [avatarError, setAvatarError] = useState("")
  const initials = (user?.fullName || user?.email || "S")
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    setAvatarMessage("")
    setAvatarError("")
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setAvatarError("Vui lòng chọn ảnh JPG, PNG hoặc WEBP.")
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("Ảnh đại diện cần nhỏ hơn hoặc bằng 2 MB.")
      return
    }
    setIsUploading(true)
    try {
      await updateAvatar(file)
      setAvatarMessage("Đã cập nhật ảnh đại diện.")
    } catch (error) {
      setAvatarError(error instanceof Error ? error.message : "Không thể cập nhật ảnh đại diện.")
    } finally {
      setIsUploading(false)
    }
  }
  const joined = user?.createdAt ? new Date(user.createdAt) : null
  const joinedText =
    joined && Number.isFinite(joined.getTime())
      ? joined.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          timeZone: "Asia/Ho_Chi_Minh",
        })
      : undefined
  const status =
    user?.status === "ACTIVE"
      ? "Đang hoạt động"
      : user?.status === "DISABLED"
        ? "Tạm khóa"
        : user?.status === "DELETED"
          ? "Đã vô hiệu hóa"
          : undefined
  const role = user?.roles.map(roleLabel).join(", ") || "Khách hàng"
  const organizer = user?.organizerProfile

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center gap-5 rounded-2xl border border-outline-variant bg-white p-5 shadow-sm sm:p-7">
        <UserAvatar
          src={avatarUrl}
          name={user?.fullName}
          initials={initials}
          className="flex size-20 items-center justify-center rounded-2xl bg-primary-container text-2xl font-bold text-primary"
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold text-on-surface">Ảnh đại diện</h3>
          <p className="mt-1 text-sm text-on-surface-variant">
            Dùng ảnh JPG, PNG hoặc WEBP, tối đa 2 MB.
          </p>
          <input
            ref={fileInput}
            type="file"
            disabled={isUploading}
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            aria-label="Chọn ảnh đại diện"
            onChange={(event) => void handleAvatarChange(event)}
          />
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInput.current?.click()}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
          >
            <Camera className="size-4" /> {isUploading ? "Đang tải ảnh..." : "Cập nhật ảnh"}
          </button>
          {avatarMessage && (
            <p role="status" className="mt-2 text-sm text-emerald-700">
              {avatarMessage}
            </p>
          )}
          {avatarError && (
            <p role="alert" className="mt-2 text-sm text-red-700">
              {avatarError}
            </p>
          )}
        </div>
      </section>
      <section className="overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant px-6 py-5 sm:px-7">
          <div>
            <h3 className="text-lg font-bold text-on-surface">Thông tin cá nhân</h3>
            <p className="mt-1 text-sm text-on-surface-variant">
              Thông tin liên hệ gắn với tài khoản của bạn.
            </p>
          </div>
          {status && (
            <span
              className={
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold " +
                (user?.status === "ACTIVE"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700")
              }
            >
              <BadgeCheck className="size-4" /> {status}
            </span>
          )}
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-7">
          <ProfileField
            icon={<UserRound className="size-4" />}
            label="Họ và tên"
            value={user?.fullName}
          />
          <ProfileField
            icon={<Mail className="size-4" />}
            label="Email đăng nhập"
            value={user?.email}
          />
          <ProfileField
            icon={<Phone className="size-4" />}
            label="Số điện thoại"
            value={user?.phone}
          />
          <ProfileField
            icon={<CalendarDays className="size-4" />}
            label="Tham gia từ"
            value={joinedText}
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-sm">
        <div className="border-b border-outline-variant px-6 py-5 sm:px-7">
          <h3 className="text-lg font-bold text-on-surface">Thông tin tài khoản</h3>
          <p className="mt-1 text-sm text-on-surface-variant">
            Vai trò và mã hồ sơ giúp nhận diện tài khoản SmartEvent của bạn.
          </p>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-7">
          <ProfileField icon={<ShieldCheck className="size-4" />} label="Vai trò" value={role} />
          <ProfileField
            icon={<BadgeCheck className="size-4" />}
            label="Trạng thái"
            value={status}
          />
        </div>
      </section>

      {organizer && (
        <section className="overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-sm">
          <div className="border-b border-outline-variant px-6 py-5 sm:px-7">
            <h3 className="text-lg font-bold text-on-surface">Hồ sơ ban tổ chức</h3>
            <p className="mt-1 text-sm text-on-surface-variant">
              Thông tin đơn vị tổ chức đã lưu trên hệ thống.
            </p>
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-7">
            <ProfileField
              icon={<Building2 className="size-4" />}
              label="Tên đơn vị"
              value={organizer.companyName}
            />
            <ProfileField
              icon={<Hash className="size-4" />}
              label="Mã số thuế"
              value={organizer.taxCode}
            />
            <div className="sm:col-span-2">
              <ProfileField
                icon={<MapPin className="size-4" />}
                label="Địa chỉ kinh doanh"
                value={organizer.businessAddress}
              />
            </div>
            <ProfileField
              icon={<ShieldCheck className="size-4" />}
              label="Trạng thái tài khoản ngân hàng"
              value={organizer.bankAccountStatus}
            />
          </div>
        </section>
      )}
    </div>
  )
}
