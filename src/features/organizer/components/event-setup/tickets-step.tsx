"use client"

import { ArrowRight, Plus, Trash2 } from "lucide-react"
import type { useEventSetup } from "@/features/organizer/hooks/use-event-setup"

type Props = Pick<
  ReturnType<typeof useEventSetup>,
  "setCurrentStep" | "ticketTiers" | "setTicketTiers" | "addTier" | "removeTier"
>
export function EventTicketsStep({
  setCurrentStep,
  ticketTiers,
  setTicketTiers,
  addTier,
  removeTier,
}: Props) {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-outline-variant/60 shadow-xs space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Bước 3: Thiết lập các hạng vé</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Quy định phân khu: Chỉ gồm <strong>Khu đứng (STANDING)</strong> và{" "}
            <strong>Khu có ghế (SEATED)</strong>.
          </p>
        </div>
        <button
          type="button"
          onClick={addTier}
          className="px-3.5 py-2 text-xs font-bold bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl transition flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="size-4" />
          <span>Thêm hạng vé</span>
        </button>
      </div>

      <div className="space-y-4">
        {ticketTiers.map((tier, idx) => (
          <div
            key={tier.id}
            className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/60 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary">Hạng vé #{idx + 1}</span>
              {ticketTiers.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTier(tier.id)}
                  className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1">Tên hạng vé</label>
                <input
                  type="text"
                  value={tier.name}
                  onChange={(e) => {
                    const newTiers = [...ticketTiers]
                    newTiers[idx].name = e.target.value
                    setTicketTiers(newTiers)
                  }}
                  className="w-full px-3 py-2 bg-white border border-outline-variant/60 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Loại phân khu</label>
                <select
                  value={tier.areaType}
                  onChange={(e) => {
                    const newTiers = [...ticketTiers]
                    newTiers[idx].areaType = e.target.value as "STANDING" | "SEATED"
                    setTicketTiers(newTiers)
                  }}
                  className="w-full px-3 py-2 bg-white border border-outline-variant/60 rounded-xl cursor-pointer"
                >
                  <option value="STANDING">Khu đứng (STANDING)</option>
                  <option value="SEATED">Khu có ghế (SEATED)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Giá vé (₫)</label>
                <input
                  type="number"
                  value={tier.price}
                  onChange={(e) => {
                    const newTiers = [...ticketTiers]
                    newTiers[idx].price = Number(e.target.value)
                    setTicketTiers(newTiers)
                  }}
                  className="w-full px-3 py-2 bg-white border border-outline-variant/60 rounded-xl"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 flex justify-between">
        <button
          type="button"
          onClick={() => setCurrentStep(2)}
          className="px-5 py-2.5 border border-outline-variant rounded-xl text-sm font-semibold hover:bg-surface-container cursor-pointer"
        >
          Quay lại
        </button>
        <button
          type="button"
          onClick={() => setCurrentStep(4)}
          className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
        >
          <span>Xem lại & Gửi duyệt</span>
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  )
}
