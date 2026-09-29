import type { components } from "@/lib/api/schema"
import { selectSalePhase } from "@/features/catalog/model"
import type { AvailableTier } from "./booking-cart"

type CatalogSnapshot = {
  types: components["schemas"]["TicketTypeResponse"][]
  areas: components["schemas"]["EventAreaResponse"][]
  phases: components["schemas"]["TicketSalePhaseResponse"][]
  inventory: components["schemas"]["InventoryCounterResponse"][]
}

export function buildAvailableTiers(
  data: CatalogSnapshot | undefined,
  phaseOccupied: Record<string, number>,
  preferredPhaseId: string | undefined,
  now: number,
): AvailableTier[] {
  if (!data) return []

  const tiers: AvailableTier[] = []
  for (const ticketType of data.types) {
    if (!ticketType.id) continue

    const area = data.areas.find((item) => item.id === ticketType.eventAreaId)
    const areaType = area?.areaType === "SEATED" ? "SEATED" : "STANDING"
    const areaName = area?.name || ticketType.name || "Khu vực chung"
    const areaId = area?.id || ticketType.eventAreaId || ""

    const phase = selectSalePhase(data.phases, ticketType.id, preferredPhaseId, now)
    if (!phase?.id) continue

    const counter = data.inventory.find((item) => item.salePhaseId === phase.id)
    const total = counter?.totalQuantity ?? phase.quantity ?? 0
    const sold = counter?.soldQuantity ?? 0
    const held = counter?.heldQuantity ?? 0
    const available =
      counter?.availableQuantity != null
        ? Number(counter.availableQuantity)
        : Math.max(0, total - sold - held)

    const remainingForPhase =
      phase.maxPerUser != null
        ? Math.max(0, phase.maxPerUser - (phaseOccupied[phase.id] ?? 0))
        : Infinity

    tiers.push({
      id: ticketType.id,
      name: ticketType.name || "Vé vào cổng",
      description: ticketType.description,
      areaId,
      areaName,
      areaType,
      phaseId: phase.id,
      phaseName: phase.name || "Vé tiêu chuẩn",
      price: Number(phase.price) || 0,
      available,
      maxAllowed: Math.min(phase.maxPerOrder ?? 4, remainingForPhase),
    })
  }
  return tiers
}
