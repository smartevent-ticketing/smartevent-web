"use client"

import { CameraOff, ShieldAlert, WifiOff, RefreshCw, KeyRound, ArrowLeft } from "lucide-react"

interface CameraPermissionDeniedProps {
  onRetry: () => void
  onSwitchToManual: () => void
}

export function CameraPermissionDeniedView({
  onRetry,
  onSwitchToManual,
}: CameraPermissionDeniedProps) {
  return (
    <div className="bg-white border border-outline-variant/60 rounded-3xl p-8 sm:p-12 text-center space-y-5 max-w-lg mx-auto shadow-xs">
      <div className="size-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
        <CameraOff className="size-8" />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-bold text-on-surface">Quyền truy cập Camera bị từ chối</h3>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Trình duyệt của bạn đang chặn quyền sử dụng máy ảnh. Để tiếp tục quét mã QR vé tại cổng,
          vui lòng cấp quyền cho trang web.
        </p>
      </div>

      <div className="p-4 bg-surface-container-low rounded-2xl text-left text-xs space-y-2 border border-outline-variant/60">
        <span className="font-bold text-on-surface block">Cách bật lại quyền Camera:</span>
        <ol className="list-decimal list-inside space-y-1 text-on-surface-variant">
          <li>Bấm vào biểu tượng ổ khóa hoặc camera trên thanh địa chỉ của trình duyệt.</li>
          <li>Chuyển cài đặt Camera từ &ldquo;Chặn&rdquo; sang &ldquo;Cho phép&rdquo;.</li>
          <li>Tải lại trang hoặc bấm nút thử lại bên dưới.</li>
        </ol>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={onRetry}
          className="w-full sm:w-auto px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs inline-flex items-center justify-center gap-1.5"
        >
          <RefreshCw className="size-3.5" />
          <span>Thử lại kết nối camera</span>
        </button>

        <button
          type="button"
          onClick={onSwitchToManual}
          className="w-full sm:w-auto px-5 py-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold rounded-xl transition cursor-pointer inline-flex items-center justify-center gap-1.5"
        >
          <KeyRound className="size-3.5 text-primary" />
          <span>Nhập mã vé thủ công</span>
        </button>
      </div>
    </div>
  )
}

interface CameraUnavailableProps {
  onSwitchToManual: () => void
}

export function CameraUnavailableView({ onSwitchToManual }: CameraUnavailableProps) {
  return (
    <div className="bg-white border border-outline-variant/60 rounded-3xl p-8 sm:p-12 text-center space-y-5 max-w-lg mx-auto shadow-xs">
      <div className="size-16 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
        <CameraOff className="size-8" />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-bold text-on-surface">Không tìm thấy thiết bị Camera</h3>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Thiết bị của bạn không có máy ảnh khả dụng hoặc camera đang bị ứng dụng khác chiếm giữ.
        </p>
      </div>

      <button
        type="button"
        onClick={onSwitchToManual}
        className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
      >
        <KeyRound className="size-3.5" />
        <span>Chuyển sang chế độ nhập mã thủ công</span>
      </button>
    </div>
  )
}

interface AccessForbiddenProps {
  onBackToEvents: () => void
}

export function AccessForbiddenView({ onBackToEvents }: AccessForbiddenProps) {
  return (
    <div className="bg-white border border-outline-variant/60 rounded-3xl p-8 sm:p-12 text-center space-y-5 max-w-lg mx-auto shadow-xs border-red-100">
      <div className="size-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
        <ShieldAlert className="size-8" />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-bold text-on-surface">Không có quyền soát vé sự kiện này</h3>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Tài khoản nhân viên của bạn chưa được Ban tổ chức phân quyền kiểm soát cổng cho sự kiện đã
          chọn.
        </p>
      </div>

      <button
        type="button"
        onClick={onBackToEvents}
        className="px-6 py-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold rounded-xl transition cursor-pointer inline-flex items-center gap-1.5"
      >
        <ArrowLeft className="size-3.5" />
        <span>Chọn sự kiện hoặc cổng khác</span>
      </button>
    </div>
  )
}

interface NetworkErrorProps {
  onRetry: () => void
}

export function NetworkErrorView({ onRetry }: NetworkErrorProps) {
  return (
    <div className="bg-white border border-outline-variant/60 rounded-3xl p-8 sm:p-12 text-center space-y-5 max-w-lg mx-auto shadow-xs border-amber-100">
      <div className="size-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
        <WifiOff className="size-8" />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-bold text-on-surface">Mất kết nối máy chủ soát vé</h3>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Đường truyền mạng tại cổng đang không ổn định. Hệ thống không thể xác minh mã vé lúc này.
        </p>
      </div>

      <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/60 text-xs text-amber-900">
        Theo quy tắc an toàn soát vé, khi mất kết nối mạng hệ thống không kết luận vé hợp lệ hay
        không hợp lệ. Vui lòng bấm thử lại khi mạng ổn định.
      </div>

      <button
        type="button"
        onClick={onRetry}
        className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
      >
        <RefreshCw className="size-3.5" />
        <span>Thử lại kiểm tra</span>
      </button>
    </div>
  )
}
