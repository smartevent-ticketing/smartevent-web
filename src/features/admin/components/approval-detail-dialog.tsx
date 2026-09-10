"use client"

import {
  X,
  Calendar,
  MapPin,
  Building,
  Ticket,
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
} from "lucide-react"

interface ApprovalDetailDialogProps {
  event: any | null
  isOpen: boolean
  onClose: () => void
  onApprove: (event: any) => void
  onReject: (event: any) => void
}

export function ApprovalDetailDialog({
  event,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: ApprovalDetailDialogProps) {
  if (!isOpen || !event) return null

  const ticketTiers = event.ticketTiers || [
    { name: "Vé VIP Thảm Đỏ", area: "Khu VIP Khán Đài A", price: 1500000, quota: 300 },
    { name: "Vé Tiêu Chuẩn Hàng B", area: "Khu Phổ Thông B", price: 650000, quota: 800 },
    { name: "Vé Fanzone Đứng Tự Do", area: "Khu Fanzone Đứng", price: 450000, quota: 400 },
  ]

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-outline-variant/60 overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-outline-variant/60 flex items-center justify-between bg-surface-container-low/40">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                {event.id}
              </span>
              <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                Chờ duyệt (PENDING_APPROVAL)
              </span>
            </div>
            <h3 className="text-lg font-bold text-on-surface">{event.name}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant transition cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Dossier Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Organizer & Venue Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-surface-container-low/60 border border-outline-variant/60 space-y-2">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Building className="size-4" />
                <span>Đơn vị tổ chức sự kiện</span>
              </div>
              <p className="font-bold text-sm text-on-surface">
                {event.organizer || "Công ty Giải trí Âm nhạc Việt"}
              </p>
              <p className="text-on-surface-variant">
                Ngày gửi hồ sơ: {event.submittedDate || "Gần đây"}
              </p>
              <p className="text-on-surface-variant flex items-center gap-1 text-green-700 font-semibold pt-1">
                <FileCheck className="size-3.5" />
                <span>Hồ sơ pháp lý hợp lệ</span>
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface-container-low/60 border border-outline-variant/60 space-y-2">
              <div className="flex items-center gap-2 text-primary font-bold">
                <MapPin className="size-4" />
                <span>Địa điểm & Thời gian</span>
              </div>
              <p className="font-bold text-sm text-on-surface">
                {event.venue || "Trung tâm Hội nghị Quốc gia"}
              </p>
              <p className="text-on-surface-variant flex items-center gap-1.5">
                <Calendar className="size-3.5 text-primary" />
                <span>24/10/2024 - 19:30</span>
              </p>
              <p className="text-on-surface-variant flex items-center gap-1.5">
                <Layers className="size-3.5 text-primary" />
                <span>Sức chứa phê duyệt: 1.500 chỗ</span>
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="font-bold text-on-surface text-xs uppercase tracking-wider">
              Mô tả & Nội dung chương trình
            </h4>
            <div className="p-4 rounded-2xl bg-surface-container-low/40 border border-outline-variant/60 text-on-surface leading-relaxed">
              {event.description ||
                "Sự kiện âm nhạc và công nghệ thường niên quy tụ các chuyên gia hàng đầu và nghệ sĩ khách mời đặc biệt. Hệ thống âm thanh ánh sáng chuẩn quốc tế kết hợp sơ đồ phân khu hiện đại."}
            </div>
          </div>

          {/* Proposed Ticket Tiers */}
          <div className="space-y-3">
            <h4 className="font-bold text-on-surface text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Ticket className="size-4 text-primary" />
              <span>Cơ cấu các hạng vé phát hành</span>
            </h4>
            <div className="border border-outline-variant/60 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-container-low text-on-surface-variant uppercase font-bold border-b border-outline-variant/60">
                  <tr>
                    <th className="px-4 py-3">Hạng vé</th>
                    <th className="px-4 py-3">Phân khu</th>
                    <th className="px-4 py-3 text-right">Đơn giá niêm yết</th>
                    <th className="px-4 py-3 text-right">Số lượng phát hành</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40">
                  {ticketTiers.map((tier: any, idx: number) => (
                    <tr key={idx} className="hover:bg-surface-container-low/30">
                      <td className="px-4 py-3 font-bold text-on-surface">{tier.name}</td>
                      <td className="px-4 py-3 text-on-surface-variant">{tier.area}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-primary">
                        {tier.price.toLocaleString("vi-VN")} ₫
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {tier.quota.toLocaleString("vi-VN")} vé
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-outline-variant/60 bg-surface-container-low/40 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition cursor-pointer"
          >
            Đóng
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onReject(event)}
              className="px-5 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl transition cursor-pointer inline-flex items-center gap-1.5"
            >
              <XCircle className="size-4" />
              <span>Từ chối (Draft)</span>
            </button>

            <button
              type="button"
              onClick={() => onApprove(event)}
              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
            >
              <CheckCircle2 className="size-4" />
              <span>Phê duyệt (Publish)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
