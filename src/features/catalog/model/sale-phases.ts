import type { components } from "@/lib/api/schema"

type SalePhase = components["schemas"]["TicketSalePhaseResponse"]
type TicketType = components["schemas"]["TicketTypeResponse"]
type Area = components["schemas"]["EventAreaResponse"]
type Inventory = components["schemas"]["InventoryCounterResponse"]

export function isPhaseOpen(phase: SalePhase, now = Date.now()): boolean {
  const start = Date.parse(phase.saleStartAt ?? "")
  const end = Date.parse(phase.saleEndAt ?? "")
  return (
    phase.status === "ACTIVE" &&
    Number.isFinite(start) &&
    Number.isFinite(end) &&
    start <= now &&
    now <= end
  )
}

export function selectSalePhase(
  phases: SalePhase[],
  ticketTypeId: string,
  preferredId?: string,
  now = Date.now(),
) {
  const eligible = phases.filter(
    (phase) => phase.ticketTypeId === ticketTypeId && isPhaseOpen(phase, now),
  )
  if (preferredId) {
    const preferred = eligible.find((phase) => phase.id === preferredId)
    if (preferred) return preferred
  }
  return eligible.toSorted(
    (a, b) =>
      (Date.parse(b.saleStartAt ?? "") || 0) - (Date.parse(a.saleStartAt ?? "") || 0) ||
      (a.id ?? "").localeCompare(b.id ?? ""),
  )[0]
}

export interface TicketTier {
  id: string
  ticketTypeId: string
  salePhaseId: string
  name: string
  price: number
  description: string
  available: number
  maxPerOrder: number
  areaType?: "STANDING" | "SEATED"
  areaName?: string
}

export function buildTicketTiers(
  types: TicketType[],
  areas: Area[],
  phases: SalePhase[],
  inventory: Inventory[],
  now = Date.now(),
): TicketTier[] {
  return types.flatMap((type) => {
    if (!type.id) return []
    const phase = selectSalePhase(phases, type.id, undefined, now)
    if (!phase?.id) return []
    const area = areas.find((area) => area.id === type.eventAreaId)
    const counter = inventory.find((item) => item.salePhaseId === phase.id)
    return [
      {
        id: type.id,
        ticketTypeId: type.id,
        salePhaseId: phase.id,
        name: type.name ?? phase.name ?? "Vé vào cửa",
        price: phase.price ?? 0,
        description:
          type.description ??
          (area?.areaType === "STANDING" ? "Khu vực đứng tự do" : "Khu vực có số ghế chỉ định"),
        available: Math.max(0, counter?.availableQuantity ?? 0),
        maxPerOrder: phase.maxPerOrder ?? 4,
        areaType: area?.areaType ?? type.areaType,
        areaName: area?.name ?? type.areaName,
      },
    ]
  })
}
