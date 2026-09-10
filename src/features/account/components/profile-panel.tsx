"use client"

import { UserCheck } from "lucide-react"
import { useAuth } from "@/features/auth/auth-provider"

export function CustomerProfilePanel() {
  const { user } = useAuth()
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-outline-variant/60 shadow-xs max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-bold text-on-surface">Thông tin tài khoản</h2>
        <p className="text-xs text-on-surface-variant">
          Dữ liệu tài khoản được đồng bộ từ hệ thống định danh bảo mật SmartEvent.
        </p>
      </div>

      <div className="space-y-4 text-xs sm:text-sm">
        <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/60 space-y-3">
          <div className="flex justify-between py-1 border-b border-outline-variant/40">
            <span className="text-on-surface-variant font-medium">Họ và tên:</span>
            <span className="font-bold text-on-surface">{user?.fullName || "Chưa cập nhật"}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-outline-variant/40">
            <span className="text-on-surface-variant font-medium">Email tài khoản:</span>
            <span className="font-mono text-on-surface">{user?.email || "Chưa cập nhật"}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-outline-variant/40">
            <span className="text-on-surface-variant font-medium">Số điện thoại:</span>
            <span className="text-on-surface">{user?.phone || "Chưa thiết lập"}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-on-surface-variant font-medium">Quyền hạn hệ thống:</span>
            <span className="font-semibold text-primary">
              {user?.roles?.join(", ") || "ROLE_CUSTOMER"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-on-surface-variant bg-blue-50/60 p-3.5 rounded-xl border border-blue-200/60">
          <UserCheck className="size-4 text-primary shrink-0" />
          <span>
            Tài khoản đang hoạt động bình thường và được bảo vệ bằng phiên đăng nhập mã hóa an toàn.
          </span>
        </div>
      </div>
    </div>
  )
}
