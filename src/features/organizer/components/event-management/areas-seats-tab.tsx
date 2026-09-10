"use client"

import { useState } from "react"
import { Layers, Plus, Armchair, Users, Loader2 } from "lucide-react"

interface AreaItem {
  id: string
  name: string
  type: "STANDING" | "SEATED"
  capacity: number
  totalSeats?: number
}

interface AreasSeatsTabProps {
  eventId: string
  areas: AreaItem[]
  onAddArea: (area: {
    name: string
    type: "STANDING" | "SEATED"
    capacity: number
  }) => Promise<void>
}

export function AreasSeatsTab({ areas, onAddArea }: AreasSeatsTabProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [name, setName] = useState("")
  const [type, setType] = useState<"STANDING" | "SEATED">("SEATED")
  const [capacity, setCapacity] = useState(200)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedAreaId, setSelectedAreaId] = useState<string>(areas[0]?.id || "area-1")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || capacity <= 0) return
    setIsSubmitting(true)
    try {
      await onAddArea({ name: name.trim(), type, capacity })
      setName("")
      setCapacity(200)
      setShowAddModal(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedArea = areas.find((a) => a.id === selectedAreaId) || areas[0]

  // Render dummy rows for seated area visualization
  const rows = ["A", "B", "C", "D", "E"]
  const seatsPerRow = 12

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-base font-bold text-on-surface">Danh sách phân khu sự kiện</h3>
          <p className="text-xs text-on-surface-variant">
            Thiết lập khu đứng tự do hoặc khu có ghế cố định theo sơ đồ địa điểm.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
        >
          <Plus className="size-4" />
          <span>Thêm phân khu</span>
        </button>
      </div>

      {/* Areas Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {areas.map((area) => {
          const isSelected = area.id === selectedAreaId
          const isSeated = area.type === "SEATED"

          return (
            <div
              key={area.id}
              onClick={() => setSelectedAreaId(area.id)}
              className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-3 ${
                isSelected
                  ? "bg-white border-primary ring-2 ring-primary/20 shadow-sm"
                  : "bg-white/80 border-outline-variant/60 hover:bg-white hover:border-outline-variant"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-2 rounded-xl ${
                      isSeated ? "bg-primary/10 text-primary" : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {isSeated ? (
                      <Armchair className="size-4" />
                    ) : (
                      <Users className="size-4 text-emerald-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-on-surface">{area.name}</h4>
                    <span className="text-[10px] font-semibold text-on-surface-variant">
                      {isSeated ? "Khu có ghế" : "Khu đứng tự do"}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-primary">
                  {area.capacity.toLocaleString("vi-VN")} vé
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Visual Seat Map or Standing Zone Section */}
      <div className="bg-white border border-outline-variant/60 rounded-3xl p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-outline-variant/40 pb-4">
          <div className="flex items-center gap-2">
            <Layers className="size-5 text-primary" />
            <div>
              <h4 className="text-sm font-bold text-on-surface">
                Sơ đồ cấu hình: {selectedArea ? selectedArea.name : "Chưa chọn khu vực"}
              </h4>
              <p className="text-xs text-on-surface-variant">
                {selectedArea?.type === "SEATED"
                  ? "Sơ đồ bố trí hàng ghế và mã ghế vật lý"
                  : "Khu đứng tự do - Sức chứa quản lý theo số lượng vé phát hành"}
              </p>
            </div>
          </div>
          {selectedArea?.type === "SEATED" && (
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-md bg-surface-container-high border border-outline-variant" />
                Ghế trống
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-md bg-primary text-white" />
                Đã gán hạng vé
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-md bg-slate-300" />
                Khóa / Giữ chỗ
              </span>
            </div>
          )}
        </div>

        {selectedArea?.type === "SEATED" ? (
          <div className="space-y-4 py-4">
            {/* Stage indicator */}
            <div className="w-2/3 mx-auto py-2 bg-slate-100 border border-slate-200 text-center rounded-xl text-xs font-bold uppercase tracking-widest text-slate-600">
              &mdash; SÂN KHẤU CHÍNH &mdash;
            </div>

            {/* Seat Grid */}
            <div className="space-y-2.5 max-w-2xl mx-auto pt-4 overflow-x-auto">
              {rows.map((row) => (
                <div key={row} className="flex items-center justify-center gap-2">
                  <span className="w-5 text-xs font-bold font-mono text-on-surface-variant">
                    {row}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: seatsPerRow }).map((_, idx) => {
                      const seatNum = idx + 1
                      const isLocked = (idx + 1) % 5 === 0
                      const isVip = row === "A" || row === "B"

                      return (
                        <div
                          key={seatNum}
                          title={`Hàng ${row} - Ghế ${seatNum}`}
                          className={`size-7 rounded-md flex items-center justify-center text-[10px] font-mono font-bold transition cursor-default ${
                            isLocked
                              ? "bg-slate-200 text-slate-400"
                              : isVip
                                ? "bg-primary text-white shadow-xs"
                                : "bg-surface-container-high border border-outline-variant/60 text-on-surface hover:border-primary"
                          }`}
                        >
                          {seatNum}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-12 text-center bg-surface-container-low/60 rounded-2xl border border-dashed border-outline-variant space-y-2">
            <Users className="size-10 text-emerald-600 mx-auto" />
            <h4 className="text-sm font-bold text-on-surface">
              Khu vực vé đứng (General Admission)
            </h4>
            <p className="text-xs text-on-surface-variant max-w-md mx-auto">
              Khu vực không cố định số ghế. Khách hàng quét mã vé tại cổng và tự do chọn vị trí
              trong khu vực tương ứng. Sức chứa tối đa:{" "}
              <strong>{selectedArea?.capacity.toLocaleString("vi-VN")} người</strong>.
            </p>
          </div>
        )}
      </div>

      {/* Add Area Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <h3 className="text-lg font-bold text-on-surface">Thêm phân khu sự kiện mới</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant">
                  Tên phân khu
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Khu A VIP, Khán đài Đông..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant">
                  Loại phân khu
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setType("SEATED")}
                    className={`p-3 rounded-xl border text-xs font-bold text-center cursor-pointer transition ${
                      type === "SEATED"
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-outline-variant text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    Khu có ghế (SEATED)
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("STANDING")}
                    className={`p-3 rounded-xl border text-xs font-bold text-center cursor-pointer transition ${
                      type === "STANDING"
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-outline-variant text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    Khu đứng (STANDING)
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant">
                  Sức chứa tối đa
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant text-xs"
                />
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
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
                  <span>Lưu phân khu</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
