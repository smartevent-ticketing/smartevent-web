"use client"

import { useState } from "react"
import { Ticket, Plus, Tag, Loader2 } from "lucide-react"

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
    price: number
    totalQuota: number
    areaId?: string
    description?: string
  }) => Promise<void>
}

export function TicketTypesTab({ ticketTypes, areas, onAddTicketType }: TicketTypesTabProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [name, setName] = useState("")
  const [price, setPrice] = useState<number | "">("")
  const [totalQuota, setTotalQuota] = useState<number | "">("")
  const [areaId, setAreaId] = useState(areas[0]?.id || "")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleOpenAddModal = () => {
    const defaultArea = areas[0]
    setAreaId(defaultArea?.id || "")
    setName(defaultArea?.name || "")
    setTotalQuota(defaultArea?.capacity || 100)
    setPrice("")
    setDescription("")
    setShowAddModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsedPrice = Number(price) || 0
    const parsedQuota = Number(totalQuota) || 0
    if (!name.trim() || parsedPrice < 0 || parsedQuota <= 0) return
    setIsSubmitting(true)
    try {
      await onAddTicketType({
        name: name.trim(),
        price: parsedPrice,
        totalQuota: parsedQuota,
        areaId: areaId || undefined,
        description: description.trim() || undefined,
      })
      setName("")
      setPrice("")
      setTotalQuota("")
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
            Định giá và phân bổ số lượng vé cho từng hạng vé thuộc các phân khu sự kiện.
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
                  <th className="px-6 py-4">Phân khu</th>
                  <th className="px-6 py-4">Đơn giá</th>
                  <th className="px-6 py-4">Hạn ngạch</th>
                  <th className="px-6 py-4">Đã bán</th>
                  <th className="px-6 py-4 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {ticketTypes.map((t) => {
                  const sold = t.soldCount || 0
                  const isSoldOut = sold >= t.totalQuota

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
                        {t.price.toLocaleString("vi-VN")} ₫
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
                              : "bg-green-50 text-green-700 border border-green-200"
                          }`}
                        >
                          {isSoldOut ? "Hết vé" : "Đang bán"}
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
                        setTotalQuota(target.capacity || 100)
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
                    Sự kiện chưa có phân khu nào. Vui lòng tạo phân khu trước tại tab "Phân khu &
                    Ghế ngồi".
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

              {/* 3. Đơn giá & Sức chứa khán đài */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface-variant">
                    Đơn giá vé (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={10000}
                    required
                    placeholder="500000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant text-xs font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface-variant">
                    Sức chứa khán đài
                  </label>
                  <div className="px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/60 text-xs font-mono font-bold text-primary flex items-center">
                    {totalQuota ? `${Number(totalQuota).toLocaleString("vi-VN")} vé` : "Theo khán đài"}
                  </div>
                </div>
              </div>

              {/* 4. Mô tả quyền lợi vé */}
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
                💡 <strong>Phân bổ số lượng theo đợt bán:</strong> Bạn có thể chia nhỏ số lượng vé để
                bán theo từng đợt (ví dụ: đợt Early Bird bán 50 vé với giá ưu đãi, đợt Mở bán chính
                thức bán số vé còn lại) tại tab <strong>"Đợt mở bán"</strong>.
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
