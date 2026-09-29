"use client"

import type { Dispatch, SetStateAction } from "react"
import type { SalePhasesTabProps, TierPhaseConfig } from "./sale-phase-types"

type TicketTier = SalePhasesTabProps["ticketTypes"][number]
type Area = NonNullable<SalePhasesTabProps["areas"]>[number]

interface Props {
  tier: TicketTier
  config: TierPhaseConfig
  area?: Area
  areaCapacity: number
  remainingCapacity: number
  tiersInSameArea: TicketTier[]
  selectedTiers: TicketTier[]
  setTierConfigs: Dispatch<SetStateAction<Record<string, TierPhaseConfig>>>
}

export function SalePhaseTierCard({
  tier: t,
  config: cfg,
  area: matchedArea,
  areaCapacity: totalAreaCapacity,
  remainingCapacity,
  tiersInSameArea,
  selectedTiers,
  setTierConfigs,
}: Props) {
  return (
    <div
      key={t.id}
      className={`border rounded-2xl p-3 transition ${
        cfg.selected
          ? "border-primary/50 bg-white shadow-2xs"
          : "border-outline-variant/60 bg-surface-container-low/40 opacity-70"
      }`}
    >
      {/* Checkbox & Tiêu đề Hạng vé */}
      <div className="flex items-start justify-between gap-3">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={cfg.selected}
            onChange={(e) => {
              setTierConfigs((prev) => ({
                ...prev,
                [t.id]: { ...cfg, selected: e.target.checked },
              }))
            }}
            className="size-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
          />
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-on-surface text-xs block">{t.name}</span>
              {tiersInSameArea.length > 1 && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  Chung khán đài ({tiersInSameArea.length} hạng vé)
                </span>
              )}
            </div>
            <span className="text-[11px] text-on-surface-variant font-medium">
              {matchedArea?.name || t.areaName || "Khán đài"} (
              {totalAreaCapacity.toLocaleString("vi-VN")} chỗ)
            </span>
          </div>
        </label>

        <span className="text-[11px] font-mono text-primary font-bold">
          {tiersInSameArea.length > 1 ? "Khả dụng khán đài: " : "Khả dụng: "}
          {remainingCapacity.toLocaleString("vi-VN")} vé
        </span>
      </div>

      {/* Chi tiết Giá vé & Số lượng khi được chọn */}
      {cfg.selected && (
        <div className="mt-3 pt-3 border-t border-outline-variant/40 space-y-3">
          {/* Hàng cấu hình Giá: Giá gốc & Giá mở bán */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Cột 1: Giá vé gốc / niêm yết */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-on-surface flex items-center gap-1">
                  <span>Giá vé gốc (niêm yết)</span>
                  <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] text-on-surface-variant font-medium">
                  (Tham chiếu)
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="500000"
                  value={cfg.basePrice}
                  onChange={(e) => {
                    const newBase = e.target.value === "" ? "" : Math.max(0, Number(e.target.value))
                    const discount = cfg.discountPercent || 0
                    const newPrice =
                      newBase === ""
                        ? ""
                        : discount > 0
                          ? Math.round((Number(newBase) * (1 - discount / 100)) / 1000) * 1000
                          : newBase
                    setTierConfigs((prev) => ({
                      ...prev,
                      [t.id]: {
                        ...cfg,
                        basePrice: newBase,
                        price: newPrice,
                      },
                    }))
                  }}
                  className="w-full px-3 py-1.5 rounded-xl border border-outline-variant font-mono text-xs font-bold text-on-surface focus:outline-primary bg-surface-container-low/40"
                  required
                />
                <span className="absolute right-3 top-1.5 text-xs text-on-surface-variant font-mono pointer-events-none">
                  ₫
                </span>
              </div>
            </div>

            {/* Cột 2: Giá mở bán thực tế của đợt này */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-primary flex items-center gap-1">
                  <span>Giá mở bán đợt này</span>
                  <span className="text-red-500">*</span>
                </label>
                {typeof cfg.basePrice === "number" &&
                  typeof cfg.price === "number" &&
                  cfg.basePrice > 0 && (
                    <span className="text-[10px] font-semibold">
                      {cfg.price < cfg.basePrice ? (
                        <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          Giảm {Math.round((1 - Number(cfg.price) / Number(cfg.basePrice)) * 100)}%
                        </span>
                      ) : cfg.price === cfg.basePrice ? (
                        <span className="text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          Giá gốc
                        </span>
                      ) : (
                        <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          Tăng {Math.round((Number(cfg.price) / Number(cfg.basePrice) - 1) * 100)}%
                        </span>
                      )}
                    </span>
                  )}
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={cfg.price}
                  onChange={(e) => {
                    const val = e.target.value === "" ? "" : Math.max(0, Number(e.target.value))
                    const base = Number(cfg.basePrice) || 0
                    let discountPct = 0
                    if (base > 0 && typeof val === "number") {
                      discountPct = Math.round((1 - val / base) * 100)
                    }
                    setTierConfigs((prev) => ({
                      ...prev,
                      [t.id]: {
                        ...cfg,
                        price: val,
                        discountPercent: discountPct,
                      },
                    }))
                  }}
                  className="w-full px-3 py-1.5 rounded-xl border-2 border-primary/40 focus:border-primary font-mono text-xs font-bold text-primary bg-primary/5 focus:outline-hidden"
                  required
                />
                <span className="absolute right-3 top-1.5 text-xs text-primary font-mono font-bold pointer-events-none">
                  ₫
                </span>
              </div>
            </div>
          </div>

          {/* Nút chọn mức giảm giá nhanh */}
          <div className="bg-surface-container-low/70 rounded-xl p-2.5 space-y-1.5 border border-outline-variant/40">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                Mức ưu đãi / Chiết khấu:
              </span>
              {typeof cfg.basePrice === "number" &&
                typeof cfg.price === "number" &&
                cfg.basePrice > 0 &&
                cfg.price < cfg.basePrice && (
                  <span className="text-[10px] font-mono text-emerald-700 font-bold">
                    Tiết kiệm: {(Number(cfg.basePrice) - Number(cfg.price)).toLocaleString("vi-VN")}{" "}
                    ₫ / vé
                  </span>
                )}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { label: "Giá gốc (0%)", percent: 0 },
                { label: "Giảm 5%", percent: 5 },
                { label: "Giảm 10%", percent: 10 },
                { label: "Giảm 15%", percent: 15 },
                { label: "Giảm 20%", percent: 20 },
              ].map((item) => {
                const base = Number(cfg.basePrice) || 0
                const targetPrice =
                  item.percent === 0
                    ? base
                    : Math.round((base * (1 - item.percent / 100)) / 1000) * 1000
                const isSelected =
                  base > 0 && (cfg.discountPercent === item.percent || cfg.price === targetPrice)

                return (
                  <button
                    key={item.percent}
                    type="button"
                    onClick={() => {
                      setTierConfigs((prev) => ({
                        ...prev,
                        [t.id]: {
                          ...cfg,
                          discountPercent: item.percent,
                          price: targetPrice,
                        },
                      }))
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer ${
                      isSelected
                        ? item.percent === 0
                          ? "bg-slate-800 text-white shadow-xs"
                          : "bg-emerald-600 text-white shadow-xs"
                        : "bg-white hover:bg-surface-container text-on-surface border border-outline-variant/60"
                    }`}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>

            {/* Hiển thị chi tiết công thức tính */}
            {typeof cfg.basePrice === "number" && cfg.basePrice > 0 && (
              <div className="text-[10px] text-on-surface-variant font-mono pt-0.5">
                {typeof cfg.price === "number" && cfg.price < cfg.basePrice ? (
                  <span>
                    🏷️ Đã giảm: {cfg.basePrice.toLocaleString("vi-VN")} ₫ -{" "}
                    {Math.round((1 - cfg.price / cfg.basePrice) * 100)}% (-
                    {(cfg.basePrice - cfg.price).toLocaleString("vi-VN")} ₫) ={" "}
                    <strong className="text-emerald-700 font-bold">
                      {cfg.price.toLocaleString("vi-VN")} ₫
                    </strong>
                  </span>
                ) : (
                  <span>
                    Bán theo giá gốc:{" "}
                    <strong className="text-on-surface">
                      {cfg.basePrice.toLocaleString("vi-VN")} ₫
                    </strong>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Số lượng vé */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-on-surface">
                Số lượng vé mở bán đợt này *
              </label>
              {remainingCapacity > 0 && (
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={remainingCapacity > 0 && Number(cfg.quantity) === remainingCapacity}
                    onChange={(e) => {
                      setTierConfigs((prev) => {
                        const updated = { ...prev }
                        if (e.target.checked) {
                          // If this tier claims the entire available capacity of its shared area,
                          // reset other tiers in the same area to avoid batch capacity overflow
                          if (t.areaId) {
                            selectedTiers.forEach((ot) => {
                              if (ot.id !== t.id && ot.areaId === t.areaId && updated[ot.id]) {
                                updated[ot.id] = {
                                  ...updated[ot.id],
                                  quantity: "",
                                }
                              }
                            })
                          }
                          updated[t.id] = {
                            ...cfg,
                            quantity: remainingCapacity,
                          }
                        } else {
                          updated[t.id] = {
                            ...cfg,
                            quantity: remainingCapacity >= 50 ? 50 : remainingCapacity || "",
                          }
                        }
                        return updated
                      })
                    }}
                    className="size-3.5 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
                  />
                  <span className="text-[10px] font-bold text-primary">
                    Bán toàn bộ ({remainingCapacity.toLocaleString("vi-VN")} vé)
                  </span>
                </label>
              )}
            </div>
            <input
              type="number"
              min="1"
              max={remainingCapacity > 0 ? remainingCapacity : undefined}
              placeholder={remainingCapacity > 0 ? `Tối đa ${remainingCapacity}` : "100"}
              value={cfg.quantity}
              onChange={(e) => {
                const val = e.target.value === "" ? "" : Math.max(1, Number(e.target.value))
                setTierConfigs((prev) => ({
                  ...prev,
                  [t.id]: { ...cfg, quantity: val },
                }))
              }}
              className="w-full px-3 py-1.5 rounded-xl border border-outline-variant font-mono text-xs text-on-surface focus:outline-primary"
              required
            />

            {/* Chọn nhanh số lượng */}
            {remainingCapacity > 0 && (
              <div className="flex items-center gap-1 pt-0.5 flex-wrap">
                <span className="text-[10px] text-on-surface-variant mr-1">Nhanh:</span>
                {remainingCapacity >= 50 && (
                  <button
                    type="button"
                    onClick={() =>
                      setTierConfigs((prev) => ({
                        ...prev,
                        [t.id]: { ...cfg, quantity: 50 },
                      }))
                    }
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium transition cursor-pointer ${
                      cfg.quantity === 50
                        ? "bg-primary text-white"
                        : "bg-surface-container hover:bg-surface-container-high text-on-surface"
                    }`}
                  >
                    50 vé
                  </button>
                )}
                {remainingCapacity >= 100 && (
                  <button
                    type="button"
                    onClick={() =>
                      setTierConfigs((prev) => ({
                        ...prev,
                        [t.id]: { ...cfg, quantity: 100 },
                      }))
                    }
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium transition cursor-pointer ${
                      cfg.quantity === 100
                        ? "bg-primary text-white"
                        : "bg-surface-container hover:bg-surface-container-high text-on-surface"
                    }`}
                  >
                    100 vé
                  </button>
                )}
                <button
                  type="button"
                  onClick={() =>
                    setTierConfigs((prev) => ({
                      ...prev,
                      [t.id]: { ...cfg, quantity: remainingCapacity },
                    }))
                  }
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                    cfg.quantity === remainingCapacity
                      ? "bg-primary text-white"
                      : "bg-primary/10 hover:bg-primary/20 text-primary"
                  }`}
                >
                  Toàn bộ ({remainingCapacity} vé)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
