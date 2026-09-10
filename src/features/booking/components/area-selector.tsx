"use client"

import { CheckCircle2 } from "lucide-react"
import { useSeatSelection } from "@/features/booking/hooks/use-seat-selection"

type Props = Pick<
  ReturnType<typeof useSeatSelection>,
  "areas" | "selectedAreaId" | "setSelectedAreaId"
>

export function AreaSelector({ areas, selectedAreaId, setSelectedAreaId }: Props) {
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {areas.map((area) => {
          const isSelected = selectedAreaId === area.id
          return (
            <button
              key={area.id}
              type="button"
              onClick={() => setSelectedAreaId(area.id || "")}
              className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-xs"
                  : "border-outline-variant/60 hover:border-primary/40 bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-on-surface">{area.name}</span>
                {isSelected && <CheckCircle2 className="size-4 text-primary" />}
              </div>
              <span className="text-xs text-on-surface-variant block">
                {area.areaType === "STANDING" ? "Khu đứng (Standing)" : "Khu có ghế (Seated)"}
              </span>
            </button>
          )
        })}
      </div>
    </>
  )
}
