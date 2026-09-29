"use client"

import { CheckCircle2, X, XCircle } from "lucide-react"
import type { ApprovalDossier } from "../hooks/use-approvals"

interface ApprovalDetailDialogProps {
  dossier: ApprovalDossier | null
  onClose: () => void
  onApprove: (dossier: ApprovalDossier) => void
  onReject: (dossier: ApprovalDossier) => void
}

const dateLabel = (value?: string) =>
  value ? new Date(value).toLocaleString("vi-VN") : "Chưa thiết lập"

export function ApprovalDetailDialog({
  dossier,
  onClose,
  onApprove,
  onReject,
}: ApprovalDetailDialogProps) {
  if (!dossier) return null

  const { event, areas, ticketTypes, salePhases, media } = dossier
  const totalCapacity = areas.reduce((sum, area) => sum + (area.capacity ?? 0), 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#171420]/75 p-3 backdrop-blur-sm sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="approval-detail-title"
        className="my-6 flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-[#e8ded8] bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#eee6e1] bg-[#faf7f5] p-5 sm:p-7">
          <div className="space-y-1">
            <p className="admin-kicker">Hồ sơ phê duyệt</p>
            <h2
              id="approval-detail-title"
              className="mt-2 text-xl font-extrabold text-[#251f29] sm:text-2xl"
            >
              {event.name}
            </h2>
            <p className="text-xs text-[#756d77]">
              Chờ duyệt · Tạo lúc {dateLabel(event.createdAt)}
            </p>
            <p className="break-all font-mono text-[11px] text-[#9b8f96]">ID: {event.id}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hồ sơ"
            className="admin-secondary-button !min-h-0 !p-2"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 space-y-7 overflow-y-auto p-5 text-sm sm:p-8">
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 rounded-2xl border border-[#eee6e1] bg-[#fbf9f7] p-5">
              <h3 className="font-extrabold">Ban tổ chức và địa điểm</h3>
              <p>BTC: {event.organizerId ?? "Chưa có ID"}</p>
              <p>{event.venue?.name ?? "Chưa chọn địa điểm"}</p>
              <p>{event.venue?.address ?? event.city ?? "Chưa có địa chỉ"}</p>
              <p>
                Danh mục:{" "}
                {event.categories
                  ?.map((category) => category.name)
                  .filter(Boolean)
                  .join(", ") || "Chưa có"}
              </p>
            </div>
            <div className="space-y-2 rounded-2xl border border-[#eee6e1] bg-[#fbf9f7] p-5">
              <h3 className="font-extrabold">Thời gian và sức chứa</h3>
              <p>Bắt đầu: {dateLabel(event.startTime)}</p>
              <p>Kết thúc: {dateLabel(event.endTime)}</p>
              <p>Tổng sức chứa: {totalCapacity.toLocaleString("vi-VN")} chỗ</p>
              <p>Giới hạn mỗi người: {event.maxTicketsPerUser ?? "Không giới hạn"}</p>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="font-extrabold">Mô tả sự kiện</h3>
            <p className="whitespace-pre-wrap rounded-2xl border border-[#eee6e1] bg-[#fbf9f7] p-5 leading-6">
              {event.description || "Chưa có mô tả"}
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-extrabold">
              Phân khu và đợt bán ({areas.length} khu, {salePhases.length} đợt)
            </h3>
            <div className="overflow-x-auto rounded-2xl border border-[#eee6e1]">
              <table className="admin-table min-w-[580px]">
                <thead>
                  <tr>
                    <th className="px-4 py-3">Phân khu / Hạng vé</th>
                    <th className="px-4 py-3">Đợt bán</th>
                    <th className="px-4 py-3 text-right">Giá</th>
                    <th className="px-4 py-3 text-right">Số vé</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40">
                  {salePhases.map((phase) => {
                    const ticketType = ticketTypes.find((type) => type.id === phase.ticketTypeId)
                    const area = areas.find((item) => item.id === ticketType?.eventAreaId)
                    return (
                      <tr key={phase.id}>
                        <td className="px-4 py-3">
                          {area?.name ?? "Chưa có khu"} / {ticketType?.name ?? "Chưa có hạng vé"}
                        </td>
                        <td className="px-4 py-3">{phase.name ?? "—"}</td>
                        <td className="px-4 py-3 text-right">
                          {phase.price?.toLocaleString("vi-VN") ?? "—"} ₫
                        </td>
                        <td className="px-4 py-3 text-right">
                          {phase.quantity?.toLocaleString("vi-VN") ?? "—"}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {salePhases.length === 0 && (
                <p className="p-4 text-on-surface-variant">Chưa có đợt bán vé.</p>
              )}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="font-extrabold">Ảnh và tài liệu ({media.length})</h3>
            {media.length === 0 ? (
              <p className="text-on-surface-variant">Chưa có tệp nào.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {media.map((file) => (
                  <div key={file.id} className="overflow-hidden rounded-xl border border-[#eee6e1]">
                    {file.url ? (
                      <a href={file.url} target="_blank" rel="noreferrer" className="block">
                        {file.type === "DOCUMENT" ? (
                          <span className="h-28 flex items-center justify-center text-primary">
                            Mở tài liệu
                          </span>
                        ) : (
                          // Remote presigned URLs have a dynamic MinIO host.
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={file.url}
                            alt={`Tệp ${file.type}`}
                            className="h-28 w-full object-cover"
                          />
                        )}
                      </a>
                    ) : (
                      <p className="h-28 flex items-center justify-center text-red-700 text-xs p-3">
                        Không tải được tệp
                      </p>
                    )}
                    <p className="p-2 text-xs font-semibold">{file.type}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eee6e1] bg-[#faf7f5] p-5 sm:p-6">
          <button type="button" onClick={onClose} className="admin-secondary-button">
            Đóng
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onReject(dossier)}
              className="admin-secondary-button !border-[#f0cdcb] !text-[#b7474f]"
            >
              <XCircle className="size-4" /> Từ chối
            </button>
            <button
              type="button"
              onClick={() => onApprove(dossier)}
              className="admin-primary-button !bg-[#257555] hover:!bg-[#1b6046]"
            >
              <CheckCircle2 className="size-4" /> Phê duyệt
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
