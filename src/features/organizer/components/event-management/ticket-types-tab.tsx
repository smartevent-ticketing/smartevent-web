"use client"

import { useState } from "react"
import { Ticket, Plus, Tag, Loader2, Sparkles } from "lucide-react"

interface TicketTypeItem {
  id: string
  name: string
  price: number
  totalQuota: number
  soldCount?: number
  areaName?: string
  areaId?: string
  description?: string
}

interface TicketTypesTabProps {
  eventId: string
  ticketTypes: TicketTypeItem[]
  areas: Array<{ id: string; name: string; capacity?: number; type?: string }>
  onAddTicketType: (ticketType: {
    name: string
    price?: number
    areaId?: string
    description?: string
  }) => Promise<void>
}

export function TicketTypesTab({ ticketTypes, areas, onAddTicketType }: TicketTypesTabProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [name, setName] = useState("")
  const [price, setPrice] = useState<number | "">("")
  const [areaId, setAreaId] = useState(areas[0]?.id || "")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleOpenAddModal = () => {
    const defaultArea = areas[0]
    setAreaId(defaultArea?.id || "")
    setName(defaultArea?.name || "")
    setPrice("")
    setDescription("")
    setShowAddModal(true)
  }

  const selectedArea = areas.find((a) => a.id === areaId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !areaId) return
    setIsSubmitting(true)
    try {
      await onAddTicketType({
        name: name.trim(),
        price: price === "" ? 0 : Number(price),
        areaId: areaId || undefined,
        description: description.trim() || undefined,
      })
      setName("")
      setPrice("")
      setDescription("")
      setShowAddModal(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-base font-bold text-on-surface">Cấu hình các hạng vé</h3>
          <p className="text-xs text-on-surface-variant">
            Khởi tạo các hạng vé theo từng phân khu khán đài. Giá vé và số lượng mở bán sẽ được phân
            bổ tại tab <strong>&quot;Đợt mở bán&quot;</strong>.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
        >
          <Plus className="size-4" />
          <span>Thêm hạng vé</span>
        </button>
      </div>

      {/* Ticket Types Table */}
      <div className="bg-white border border-outline-variant/60 rounded-3xl shadow-xs overflow-hidden">
        {ticketTypes.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Ticket className="size-10 text-primary/40 mx-auto" />
            <h4 className="text-sm font-bold text-on-surface">Chưa có hạng vé nào</h4>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
              Hãy tạo hạng vé đầu tiên (ví dụ: Vé VIP, Vé tiêu chuẩn) để bắt đầu mở bán cho khách
              hàng.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-low text-xs uppercase font-bold text-on-surface-variant border-b border-outline-variant/60">
                <tr>
                  <th className="px-6 py-4">Hạng vé</th>
                  <th className="px-6 py-4">Phân khu / Khán đài</th>
                  <th className="px-6 py-4">Giá vé niêm yết (gốc)</th>
                  <th className="px-6 py-4">Sức chứa khán đài</th>
                  <th className="px-6 py-4">Đã bán</th>
                  <th className="px-6 py-4 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {ticketTypes.map((t) => {
                  const sold = t.soldCount || 0
                  const isSoldOut = t.totalQuota > 0 && sold >= t.totalQuota
                  const hasActiveSale = t.price > 0

                  return (
                    <tr key={t.id} className="hover:bg-surface-container-low/40 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <Tag className="size-4 text-primary shrink-0" />
                          <div>
                            <span className="font-bold text-on-surface block">{t.name}</span>
                            {t.description && (
                              <span className="text-[11px] text-on-surface-variant line-clamp-1">
                                {t.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-on-surface-variant">
                        {t.areaName || "Toàn địa điểm"}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-primary">
                        {hasActiveSale ? (
                          <div>
                            <span>{t.price.toLocaleString("vi-VN")} ₫</span>
                            <span className="text-[10px] font-normal text-on-surface-variant block">
                              (Giá gốc niêm yết)
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-normal text-on-surface-variant italic">
                            Chưa đặt giá gốc
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">
                        {t.totalQuota.toLocaleString("vi-VN")} vé
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-on-surface-variant">
                        {sold.toLocaleString("vi-VN")} vé
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isSoldOut
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : hasActiveSale
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : "bg-slate-100 text-slate-600 border border-slate-300"
                          }`}
                        >
                          {isSoldOut ? "Hết vé" : hasActiveSale ? "Đã định giá" : "Chưa định giá"}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info card */}
      <div className="bg-surface-container-low/70 border border-outline-variant/60 rounded-2xl p-4 text-xs text-on-surface-variant flex items-start gap-3">
        <Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-on-surface">Lưu ý về quy trình phân bổ đợt mở bán</span>
          <p className="text-[11px] leading-relaxed">
            Hạng vé được gắn liền với phân khu/khán đài để quản lý sơ đồ và sức chứa. Sau khi tạo
            hạng vé, hãy chuyển sang tab <strong>&quot;Đợt mở bán&quot;</strong> để tạo các chiến
            dịch bán vé (như Early Bird, Mở bán chính thức) với mức giá và số lượng mong muốn.
          </p>
        </div>
      </div>

      {/* Add Ticket Type Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div>
              <h3 className="text-lg font-bold text-on-surface">Thêm hạng vé sự kiện</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Hạng vé gắn liền với từng phân khu khán đài đã thiết lập.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 1. Chọn Khán đài trước */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant">
                  Khán đài / Phân khu áp dụng <span className="text-red-500">*</span>
                </label>
                {areas.length > 0 ? (
                  <select
                    value={areaId}
                    onChange={(e) => {
                      const newAreaId = e.target.value
                      setAreaId(newAreaId)
                      const target = areas.find((a) => a.id === newAreaId)
                      if (target) {
                        setName(target.name)
                      }
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant text-xs bg-white cursor-pointer font-medium"
                  >
                    {areas.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.type === "SEATED" ? "Khu có ghế" : "Khu đứng"} —{" "}
                        {a.capacity?.toLocaleString("vi-VN")} chỗ)
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                    Sự kiện chưa có phân khu nào. Vui lòng tạo phân khu trước tại tab &quot;Phân khu
                    &amp; Ghế ngồi&quot;.
                  </div>
                )}
              </div>

              {/* 2. Tên hạng vé (Tự động điền theo tên khán đài) */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant">
                  Tên hạng vé <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Khán đài A, Vé VIP 1..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant text-xs"
                />
              </div>

              {/* Đơn giá vé niêm yết & Sức chứa khán đài */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface-variant">
                    Giá vé gốc / niêm yết (VNĐ)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={10000}
                    placeholder="Ví dụ: 500000"
                    value={price}
                    onChange={(e) =>
                      setPrice(e.target.value === "" ? "" : Math.max(0, Number(e.target.value)))
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant text-xs font-mono font-bold"
                  />
                  <p className="text-[10px] text-on-surface-variant">
                    Mức giá gốc để tính chiết khấu khi mở bán
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface-variant">
                    Sức chứa khán đài
                  </label>
                  <div className="px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/60 text-xs font-mono font-bold text-primary flex items-center justify-between">
                    <span>
                      {selectedArea?.capacity
                        ? `${selectedArea.capacity.toLocaleString("vi-VN")} vé`
                        : "Theo khán đài"}
                    </span>
                    <span className="text-[11px] font-normal text-on-surface-variant">
                      {selectedArea?.type === "SEATED" ? "Có ghế" : "Vé đứng"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Mô tả quyền lợi vé */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant">
                  Quyền lợi của hạng vé
                </label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Đã bao gồm 01 đồ uống miễn phí, lối vào ưu tiên, quà tặng kỷ niệm..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-outline-variant text-xs resize-none"
                />
              </div>

              {/* Ghi chú về đợt bán */}
              <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-[11px] text-blue-900 leading-relaxed">
                💡 <strong>Định giá theo đợt mở bán:</strong> Giá vé gốc ở trên sẽ dùng làm mức giá
                chuẩn. Khi tạo từng đợt mở bán (như Early Bird, Đợt 1), bạn có thể chọn giữ nguyên
                giá hoặc áp dụng mức giảm <strong>5%, 10%, 15%</strong> tại tab{" "}
                <strong>&quot;Đợt mở bán&quot;</strong>.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || areas.length === 0}
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5 shadow-xs"
                >
                  {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
                  <span>Lưu hạng vé</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
