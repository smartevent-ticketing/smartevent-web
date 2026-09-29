"use client"

import { Plus, AlertCircle, Loader2, X } from "lucide-react"
import { useCreateSalePhase } from "../../hooks/use-create-sale-phase"
import { SalePhaseTierCard } from "./sale-phase-tier-card"
import type { CreateSalePhaseDialogProps } from "./sale-phase-types"

export function CreateSalePhaseDialog(props: CreateSalePhaseDialogProps) {
  const { ticketTypes, areas = [], onClose } = props
  const {
    name,
    setName,
    saleStartAt,
    setSaleStartAt,
    saleEndAt,
    setSaleEndAt,
    maxTicketsPerCustomer,
    setMaxTicketsPerCustomer,
    formError,
    isSubmitting,
    tierConfigs,
    setTierConfigs,
    getRemainingCapacity,
    handleCreateSubmit,
    selectedTiers,
    allTiersSelected,
    totalRemainingSelected,
    isAllRemainingSelected,
    handleToggleAllRemaining,
    handleToggleSelectAllTiers,
    handleBatchDiscount,
  } = useCreateSalePhase(props)

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-outline-variant/60 shadow-xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Plus className="size-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-on-surface">Thêm đợt mở bán mới</h4>
              <p className="text-[11px] text-on-surface-variant">
                Thiết lập chiến dịch bán vé và áp dụng cho một hoặc nhiều hạng vé cùng lúc
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onClose()}
            className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {formError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="size-4 shrink-0 text-red-500 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          {/* 1. Tên đợt mở bán */}
          <div className="space-y-1">
            <label className="font-bold text-on-surface">Tên đợt mở bán *</label>
            <input
              type="text"
              placeholder="Ví dụ: Early Bird, Đợt 1, Mở bán chính thức..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-outline-variant text-on-surface focus:outline-primary"
              required
            />
            <div className="flex items-center gap-1.5 pt-1 flex-wrap">
              <span className="text-[10px] text-on-surface-variant">Gợi ý:</span>
              {["Early Bird", "Mở bán đợt 1", "Mở bán chính thức", "Chót giờ (Last Minute)"].map(
                (preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setName(preset)}
                    className="px-2 py-0.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-[10px] font-medium transition cursor-pointer"
                  >
                    {preset}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* 2. Thời gian bắt đầu & kết thúc */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-on-surface">Thời gian bắt đầu *</label>
              <input
                type="datetime-local"
                value={saleStartAt}
                onChange={(e) => setSaleStartAt(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-outline-variant font-mono text-on-surface focus:outline-primary"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-on-surface">Thời gian kết thúc *</label>
              <input
                type="datetime-local"
                value={saleEndAt}
                onChange={(e) => setSaleEndAt(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-outline-variant font-mono text-on-surface focus:outline-primary"
                required
              />
            </div>
          </div>

          {/* 3. Hạn mức mua tối đa mỗi khách */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-bold text-on-surface">Số vé tối đa mỗi khách được mua *</label>
              <span className="text-[10px] text-on-surface-variant font-normal">
                (Giới hạn trên 1 tài khoản)
              </span>
            </div>
            <input
              type="number"
              min="1"
              max="20"
              value={maxTicketsPerCustomer}
              onChange={(e) =>
                setMaxTicketsPerCustomer(
                  e.target.value === "" ? "" : Math.max(1, Number(e.target.value)),
                )
              }
              className="w-full px-3 py-2 rounded-xl border border-outline-variant font-mono text-on-surface focus:outline-primary"
              placeholder="4"
              required
            />
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] text-on-surface-variant">Chọn nhanh:</span>
              {[2, 4, 6, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setMaxTicketsPerCustomer(num)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-medium transition cursor-pointer ${
                    maxTicketsPerCustomer === num
                      ? "bg-primary text-white"
                      : "bg-surface-container hover:bg-surface-container-high text-on-surface"
                  }`}
                >
                  {num} vé
                </button>
              ))}
            </div>
          </div>

          {/* 4. Danh sách chọn các hạng vé mở bán trong đợt này */}
          <div className="space-y-2.5 pt-2 border-t border-outline-variant/40">
            <div className="flex items-center justify-between">
              <label className="font-bold text-on-surface">
                Các hạng vé mở bán trong đợt này *
              </label>
              <span className="text-[11px] text-on-surface-variant font-medium">
                Đã chọn:{" "}
                <strong className="text-primary font-bold">
                  {selectedTiers.length}/{ticketTypes.length}
                </strong>{" "}
                hạng vé
              </span>
            </div>

            {/* Thanh điều khiển hàng loạt & Ô lọc chọn bán toàn bộ vé cho đợt */}
            <div className="bg-surface-container-low/90 border border-outline-variant/70 rounded-2xl p-3 space-y-2.5 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                {/* Ô tích lọc chọn bán toàn bộ vé cho đợt đấy */}
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAllRemainingSelected}
                    onChange={(e) => handleToggleAllRemaining(e.target.checked)}
                    className="size-4.5 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                      <span>Bán toàn bộ vé khả dụng cho đợt này</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-mono font-bold">
                        {totalRemainingSelected.toLocaleString("vi-VN")} vé
                      </span>
                    </span>
                    <span className="text-[10px] text-on-surface-variant block">
                      Tự động phân bổ tối đa 100% hạn ngạch vé cho tất cả các hạng vé được chọn
                    </span>
                  </div>
                </label>

                {/* Nút chọn / bỏ chọn tất cả hạng vé */}
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={handleToggleSelectAllTiers}
                    className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-[11px] font-semibold text-primary transition cursor-pointer"
                  >
                    {allTiersSelected ? "Bỏ chọn tất cả" : "Chọn tất cả hạng vé"}
                  </button>
                </div>
              </div>

              {/* Thanh áp dụng chiết khấu hàng loạt cho các hạng vé được chọn */}
              {selectedTiers.length > 0 && (
                <div className="pt-2 border-t border-outline-variant/40 flex items-center justify-between gap-2 flex-wrap text-[10px]">
                  <span className="text-on-surface-variant font-medium">
                    Áp dụng mức giá / chiết khấu hàng loạt:
                  </span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {[
                      { label: "Giá gốc", percent: 0 },
                      { label: "Giảm 5%", percent: 5 },
                      { label: "Giảm 10%", percent: 10 },
                      { label: "Giảm 15%", percent: 15 },
                      { label: "Giảm 20%", percent: 20 },
                    ].map((btn) => (
                      <button
                        key={btn.percent}
                        type="button"
                        onClick={() => handleBatchDiscount(btn.percent)}
                        className="px-2 py-0.5 rounded-md bg-white hover:bg-surface-container border border-outline-variant/60 font-mono font-bold text-on-surface transition cursor-pointer"
                        title={`Áp dụng ${btn.label} cho ${selectedTiers.length} hạng vé đã chọn`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {ticketTypes.map((t) => {
                const cfg = tierConfigs[t.id] || {
                  selected: false,
                  basePrice: "",
                  discountPercent: 0,
                  price: "",
                  quantity: "",
                }
                const matchedArea = areas.find((a) => a.id === t.areaId)
                const totalAreaCapacity = matchedArea?.capacity ?? t.totalQuota ?? 0
                const remainingCapacity = getRemainingCapacity(t.id)
                const tiersInSameArea = t.areaId
                  ? ticketTypes.filter((ot) => ot.areaId === t.areaId)
                  : []

                return (
                  <SalePhaseTierCard
                    key={t.id}
                    tier={t}
                    config={cfg}
                    area={matchedArea}
                    areaCapacity={totalAreaCapacity}
                    remainingCapacity={remainingCapacity}
                    tiersInSameArea={tiersInSameArea}
                    selectedTiers={selectedTiers}
                    setTierConfigs={setTierConfigs}
                  />
                )
              })}
            </div>
          </div>

          {/* Nút hành động */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/40">
            <button
              type="button"
              onClick={() => onClose()}
              className="px-4 py-2 border border-outline-variant text-on-surface hover:bg-surface-container font-semibold rounded-xl transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition cursor-pointer inline-flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
              <span>{isSubmitting ? "Đang tạo..." : "Lưu đợt mở bán"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
