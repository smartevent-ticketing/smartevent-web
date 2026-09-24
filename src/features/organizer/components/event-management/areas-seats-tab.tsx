"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  Layers,
  Plus,
  Armchair,
  Users,
  Loader2,
  Grid,
  Trash2,
  Pencil,
  Sparkles,
  AlertTriangle,
} from "lucide-react"
import { organizerApi } from "@/features/organizer/api/organizer-api"
import type { components } from "@/lib/api/schema"

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
  onUpdateArea?: (
    areaId: string,
    area: {
      name: string
      type: "STANDING" | "SEATED"
      capacity: number
    },
  ) => Promise<void>
  onDeleteArea?: (areaId: string) => Promise<void>
}

export function AreasSeatsTab({ areas, onAddArea, onUpdateArea, onDeleteArea }: AreasSeatsTabProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [name, setName] = useState("")
  const [type, setType] = useState<"STANDING" | "SEATED">("SEATED")
  const [capacity, setCapacity] = useState(200)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedAreaId, setSelectedAreaId] = useState<string>(areas[0]?.id || "")

  // Edit area state
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingArea, setEditingArea] = useState<AreaItem | null>(null)
  const [editName, setEditName] = useState("")
  const [editType, setEditType] = useState<"STANDING" | "SEATED">("SEATED")
  const [editCapacity, setEditCapacity] = useState(200)
  const [isUpdatingArea, setIsUpdatingArea] = useState(false)
  const [isDeletingArea, setIsDeletingArea] = useState(false)

  useEffect(() => {
    if (areas.length > 0 && (!selectedAreaId || !areas.some((a) => a.id === selectedAreaId))) {
      setSelectedAreaId(areas[0].id)
    }
  }, [areas, selectedAreaId])

  // Real seats state
  const [realSeats, setRealSeats] = useState<components["schemas"]["EventSeatResponse"][]>([])
  const [isLoadingSeats, setIsLoadingSeats] = useState(false)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [fromRow, setFromRow] = useState("A")
  const [toRow, setToRow] = useState("E")
  const [seatsPerRowInput, setSeatsPerRowInput] = useState(12)
  const [isGenerating, setIsGenerating] = useState(false)
  const [seatMessage, setSeatMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  const selectedArea = areas.find((a) => a.id === selectedAreaId) || areas[0]

  const loadSeats = useCallback(async (areaId: string) => {
    if (!areaId) {
      setRealSeats([])
      return
    }
    setIsLoadingSeats(true)
    setSeatMessage(null)
    try {
      const res = await organizerApi.getSeatsByArea(areaId)
      const data = res.data?.data as any
      const content = Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : []
      setRealSeats(content)
    } catch {
      setRealSeats([])
      setSeatMessage({ type: "error", text: "Không thể tải danh sách ghế từ máy chủ." })
    } finally {
      setIsLoadingSeats(false)
    }
  }, [])

  useEffect(() => {
    if (selectedArea?.type === "SEATED" && selectedArea?.id) {
      loadSeats(selectedArea.id)
    } else {
      setRealSeats([])
    }
  }, [selectedArea?.id, selectedArea?.type, loadSeats])

  // Tự động tính số hàng và ghế tương thích với sức chứa phân khu
  const handleAutoFillByCapacity = () => {
    if (!selectedArea) return
    const cap = selectedArea.capacity
    let rows = 1
    let seats = cap
    // Tìm cấu hình hàng x ghế đẹp mắt (tối đa 26 hàng A-Z, mỗi hàng tối đa 50 ghế)
    for (let r = 26; r >= 1; r--) {
      if (cap % r === 0 && cap / r <= 50) {
        rows = r
        seats = cap / r
        if (rows <= 15) break // Tỷ lệ cân đối đẹp (ví dụ 200 = 10 hàng x 20 ghế)
      }
    }
    if (rows === 1 && cap > 26) {
      rows = Math.min(26, Math.ceil(Math.sqrt(cap)))
      seats = Math.ceil(cap / rows)
    }
    setFromRow("A")
    setToRow(String.fromCharCode(65 + rows - 1))
    setSeatsPerRowInput(seats)
  }

  // Tính số ghế dự kiến tạo theo fromRow, toRow, seatsPerRowInput
  const calculatedRowCount = useMemo(() => {
    const f = fromRow.trim().toUpperCase().charCodeAt(0) || 65
    const t = toRow.trim().toUpperCase().charCodeAt(0) || 65
    return Math.max(0, t - f + 1)
  }, [fromRow, toRow])

  const calculatedTotalSeats = useMemo(() => {
    return calculatedRowCount * (Number(seatsPerRowInput) || 0)
  }, [calculatedRowCount, seatsPerRowInput])

  const isExceedingCapacity = useMemo(() => {
    if (!selectedArea?.capacity) return false
    return calculatedTotalSeats > selectedArea.capacity
  }, [calculatedTotalSeats, selectedArea?.capacity])

  const handleGenerateSeats = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedArea?.id) return
    if (isExceedingCapacity) {
      setSeatMessage({
        type: "error",
        text: `Số lượng ghế dự kiến (${calculatedTotalSeats}) vượt quá sức chứa phân khu (${selectedArea.capacity} vé).`,
      })
      return
    }
    setIsGenerating(true)
    setSeatMessage(null)
    try {
      await organizerApi.generateSeats(selectedArea.id, {
        fromRow: fromRow.trim().toUpperCase(),
        toRow: toRow.trim().toUpperCase(),
        seatsPerRow: Number(seatsPerRowInput),
      })
      setSeatMessage({ type: "success", text: "Sinh sơ đồ ghế tự động thành công!" })
      setShowGenerateModal(false)
      await loadSeats(selectedArea.id)
    } catch {
      setSeatMessage({
        type: "error",
        text: "Sinh ghế thất bại. Vui lòng kiểm tra lại thông số hàng và ghế.",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDeleteSeats = async () => {
    if (
      !selectedArea?.id ||
      !confirm("Bạn có chắc chắn muốn xóa toàn bộ sơ đồ ghế của phân khu này?")
    )
      return
    try {
      await organizerApi.deleteAllSeatsInArea(selectedArea.id)
      setSeatMessage({ type: "success", text: "Đã xóa toàn bộ sơ đồ ghế." })
      await loadSeats(selectedArea.id)
    } catch {
      setSeatMessage({ type: "error", text: "Xóa sơ đồ ghế thất bại." })
    }
  }

  const openEditModal = (area: AreaItem) => {
    setEditingArea(area)
    setEditName(area.name)
    setEditType(area.type)
    setEditCapacity(area.capacity)
    setShowEditModal(true)
  }

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingArea || !onUpdateArea || !editName.trim() || editCapacity <= 0) return
    setIsUpdatingArea(true)
    try {
      await onUpdateArea(editingArea.id, {
        name: editName.trim(),
        type: editType,
        capacity: editCapacity,
      })
      setShowEditModal(false)
      setSeatMessage({
        type: "success",
        text: `Đã cập nhật phân khu "${editName}" thành công.`,
      })
    } catch (err: any) {
      setSeatMessage({
        type: "error",
        text: err?.message || "Cập nhật phân khu thất bại.",
      })
    } finally {
      setIsUpdatingArea(false)
    }
  }

  const handleDeleteAreaConfirm = async () => {
    if (!editingArea || !onDeleteArea) return
    if (
      !confirm(
        `Bạn có chắc chắn muốn xóa phân khu "${editingArea.name}"? Mọi dữ liệu liên quan sẽ bị xóa vĩnh viễn.`,
      )
    )
      return
    setIsDeletingArea(true)
    try {
      await onDeleteArea(editingArea.id)
      setShowEditModal(false)
      setSeatMessage({
        type: "success",
        text: `Đã xóa phân khu "${editingArea.name}".`,
      })
    } catch (err: any) {
      setSeatMessage({
        type: "error",
        text: err?.message || "Xóa phân khu thất bại.",
      })
    } finally {
      setIsDeletingArea(false)
    }
  }

  const seatRows = useMemo(() => {
    if (realSeats.length === 0) return []
    const map: Record<string, components["schemas"]["EventSeatResponse"][]> = {}
    realSeats.forEach((seat) => {
      const row = seat.rowName || "A"
      if (!map[row]) map[row] = []
      map[row].push(seat)
    })
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
  }, [realSeats])

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

      {areas.length === 0 ? (
        <div className="bg-white border border-outline-variant/60 rounded-3xl p-12 text-center space-y-4 shadow-xs">
          <div className="size-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto">
            <Layers className="size-7" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-on-surface">Chưa có phân khu nào</h4>
            <p className="text-xs text-on-surface-variant max-w-md mx-auto">
              Sự kiện của bạn cần ít nhất một phân khu (Khu đứng tự do hoặc Khu có ghế ngồi cố định)
              để có thể tạo hạng vé và mở bán.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
          >
            <Plus className="size-4" />
            <span>Thêm phân khu đầu tiên</span>
          </button>
        </div>
      ) : (
        <>
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
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-primary">
                        {area.capacity.toLocaleString("vi-VN")} vé
                      </span>
                      {onUpdateArea && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            openEditModal(area)
                          }}
                          className="p-1 hover:bg-slate-100 rounded-lg text-on-surface-variant hover:text-primary transition"
                          title="Chỉnh sửa phân khu này"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Visual Seat Map or Standing Zone Section */}
          {/* Feedback Message */}
          {seatMessage && (
            <div
              className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs ${
                seatMessage.type === "success"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}
            >
              <span>{seatMessage.text}</span>
              <button
                type="button"
                onClick={() => setSeatMessage(null)}
                className="text-xs hover:underline cursor-pointer"
              >
                Đóng
              </button>
            </div>
          )}

          {/* Area Layout & Seat Management Container */}
          <div className="bg-white border border-outline-variant/60 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-outline-variant/40 pb-4 gap-4">
              <div className="flex items-center gap-2">
                <Layers className="size-5 text-primary" />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-on-surface">
                      Sơ đồ cấu hình: {selectedArea ? selectedArea.name : "Chưa chọn khu vực"}
                    </h4>
                    {selectedArea && onUpdateArea && (
                      <button
                        type="button"
                        onClick={() => openEditModal(selectedArea)}
                        className="px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-primary/10 rounded-lg transition inline-flex items-center gap-1 cursor-pointer border border-primary/20"
                        title="Chỉnh sửa thông tin phân khu"
                      >
                        <Pencil className="size-3" />
                        <span>Sửa phân khu</span>
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    {selectedArea?.type === "SEATED"
                      ? `Sơ đồ bố trí hàng ghế (${realSeats.length} ghế đã tạo / Sức chứa: ${selectedArea.capacity.toLocaleString("vi-VN")} vé)`
                      : `Khu đứng tự do - Sức chứa quản lý theo số lượng vé phát hành (${selectedArea?.capacity.toLocaleString("vi-VN")} người)`}
                  </p>
                </div>
              </div>

              {selectedArea?.type === "SEATED" && (
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="size-3 rounded-md bg-surface-container-high border border-outline-variant" />
                      Còn trống
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="size-3 rounded-md bg-amber-100 border border-amber-300" />
                      Đang giữ
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="size-3 rounded-md bg-slate-300" />
                      Đã bán
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowGenerateModal(true)}
                      className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                    >
                      <Grid className="size-3.5" />
                      <span>Sinh ghế tự động</span>
                    </button>
                    {realSeats.length > 0 && (
                      <button
                        type="button"
                        onClick={handleDeleteSeats}
                        className="px-3.5 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl transition cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Trash2 className="size-3.5" />
                        <span>Xóa ghế</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {selectedArea?.type === "SEATED" ? (
              isLoadingSeats ? (
                <div className="py-16 text-center space-y-3">
                  <Loader2 className="size-7 animate-spin text-primary mx-auto" />
                  <p className="text-xs text-on-surface-variant font-medium">
                    Đang tải sơ đồ ghế từ máy chủ...
                  </p>
                </div>
              ) : realSeats.length > 0 ? (
                <div className="space-y-4 py-4">
                  {/* Stage indicator */}
                  <div className="w-2/3 mx-auto py-2 bg-slate-100 border border-slate-200 text-center rounded-xl text-xs font-bold uppercase tracking-widest text-slate-600">
                    &mdash; SÂN KHẤU CHÍNH &mdash;
                  </div>

                  {/* Real Seat Grid */}
                  <div className="space-y-2.5 max-w-3xl mx-auto pt-4 overflow-x-auto">
                    {seatRows.map(([row, rowSeats]) => (
                      <div key={row} className="flex items-center justify-center gap-2">
                        <span className="w-6 text-xs font-bold font-mono text-on-surface-variant text-right">
                          {row}
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap justify-center">
                          {rowSeats.map((seat) => {
                            const isSold = seat.status === "SOLD"
                            const isHeld = seat.status === "HELD"
                            const isBlocked = seat.status === "BLOCKED"

                            return (
                              <div
                                key={seat.id || seat.label}
                                title={`${seat.label || `Ghế ${seat.seatNumber}`} (${seat.status || "AVAILABLE"})`}
                                className={`size-7 rounded-md flex items-center justify-center text-[10px] font-mono font-bold transition cursor-default ${
                                  isSold
                                    ? "bg-slate-200 text-slate-400"
                                    : isHeld
                                      ? "bg-amber-100 text-amber-700 border border-amber-300"
                                      : isBlocked
                                        ? "bg-red-100 text-red-600 border border-red-200"
                                        : "bg-surface-container-high border border-outline-variant/60 text-on-surface hover:border-primary"
                                }`}
                              >
                                {seat.seatNumber}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center bg-surface-container-low/60 rounded-2xl border border-dashed border-outline-variant space-y-4">
                  <Armchair className="size-10 text-primary/60 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-on-surface">
                      Chưa có sơ đồ ghế nào được tạo
                    </h4>
                    <p className="text-xs text-on-surface-variant max-w-md mx-auto">
                      Phân khu có ghế yêu cầu tạo danh sách chỗ ngồi cố định. Bạn có thể sinh ghế tự
                      động theo hàng (A..E) và cột (1..12).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowGenerateModal(true)}
                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                  >
                    <Grid className="size-4" />
                    <span>Sinh sơ đồ ghế tự động</span>
                  </button>
                </div>
              )
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
        </>
      )}

      {/* Generate Seats Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <h3 className="text-lg font-bold text-on-surface">Sinh sơ đồ ghế ngồi tự động</h3>
            <p className="text-xs text-on-surface-variant">
              Tạo hàng loạt mã ghế cho phân khu <strong>{selectedArea?.name}</strong> (Sức chứa:{" "}
              <strong>{selectedArea?.capacity} vé</strong>).
            </p>

            {/* Quick autofill button */}
            <button
              type="button"
              onClick={handleAutoFillByCapacity}
              className="w-full py-2.5 px-4 bg-primary/10 hover:bg-primary/15 text-primary text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-primary/20"
            >
              <Sparkles className="size-3.5" />
              <span>⚡ Tự động tính theo sức chứa ({selectedArea?.capacity} ghế)</span>
            </button>

            <form onSubmit={handleGenerateSeats} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface-variant">
                    Hàng bắt đầu
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    value={fromRow}
                    onChange={(e) => setFromRow(e.target.value.toUpperCase())}
                    placeholder="A"
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant text-xs font-mono font-bold uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface-variant">
                    Hàng kết thúc
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    value={toRow}
                    onChange={(e) => setToRow(e.target.value.toUpperCase())}
                    placeholder="E"
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant text-xs font-mono font-bold uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant">
                  Số ghế mỗi hàng
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  required
                  value={seatsPerRowInput}
                  onChange={(e) => setSeatsPerRowInput(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant text-xs font-mono font-bold"
                />
              </div>

              {/* Calculated Summary Badge */}
              <div
                className={`p-3 rounded-xl text-xs flex items-center justify-between border ${
                  isExceedingCapacity
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-slate-50 text-slate-700 border-slate-200"
                }`}
              >
                <span>
                  Dự kiến tạo: <strong>{calculatedTotalSeats} ghế</strong> ({calculatedRowCount}{" "}
                  hàng × {seatsPerRowInput} ghế)
                </span>
                <span className="font-semibold text-on-surface-variant">
                  Sức chứa: {selectedArea?.capacity} vé
                </span>
              </div>

              {isExceedingCapacity && (
                <p className="text-[11px] text-red-600 font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="size-3.5 shrink-0" />
                  <span>
                    Vượt quá sức chứa phân khu ({selectedArea?.capacity} vé). Vui lòng giảm số hàng
                    hoặc số ghế mỗi hàng!
                  </span>
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isGenerating || isExceedingCapacity || calculatedTotalSeats === 0}
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5 shadow-xs"
                >
                  {isGenerating && <Loader2 className="size-3.5 animate-spin" />}
                  <span>{isGenerating ? "Đang sinh ghế..." : "Tạo sơ đồ ghế"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

      {/* Edit Area Modal */}
      {showEditModal && editingArea && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <h3 className="text-lg font-bold text-on-surface">Chỉnh sửa phân khu sự kiện</h3>
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant">
                  Tên phân khu
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Khu A VIP, Khán đài Đông..."
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
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
                    onClick={() => setEditType("SEATED")}
                    className={`p-3 rounded-xl border text-xs font-bold text-center cursor-pointer transition ${
                      editType === "SEATED"
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-outline-variant text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    Khu có ghế (SEATED)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditType("STANDING")}
                    className={`p-3 rounded-xl border text-xs font-bold text-center cursor-pointer transition ${
                      editType === "STANDING"
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-outline-variant text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    Khu đứng (STANDING)
                  </button>
                </div>
                {editingArea.type === "SEATED" && editType === "STANDING" && (
                  <p className="text-[11px] text-amber-600 mt-1">
                    * Lưu ý: Chuyển sang khu đứng sẽ tự động xóa các ghế trống chưa được giữ/bán.
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant">
                  Sức chứa tối đa (vé)
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={editCapacity}
                  onChange={(e) => setEditCapacity(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-outline-variant/40">
                {onDeleteArea ? (
                  <button
                    type="button"
                    disabled={isDeletingArea || isUpdatingArea}
                    onClick={handleDeleteAreaConfirm}
                    className="px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer inline-flex items-center gap-1.5"
                  >
                    {isDeletingArea ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                    <span>Xóa phân khu</span>
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingArea || isDeletingArea}
                    className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                  >
                    {isUpdatingArea && <Loader2 className="size-3.5 animate-spin" />}
                    <span>Lưu thay đổi</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
