import type { SalePhaseItem } from "./event-management.types"

interface TicketCapacity {
  id: string
  areaId?: string
  totalQuota?: number
}

interface AreaCapacity {
  id: string
  capacity?: number
}

export function remainingCapacityForTier(
  ticketTypeId: string,
  ticketTypes: TicketCapacity[],
  areas: AreaCapacity[],
  phases: SalePhaseItem[],
): number {
  const tier = ticketTypes.find((item) => item.id === ticketTypeId)
  if (!tier) return 0
  const area = areas.find((item) => item.id === tier.areaId)
  const capacity = area?.capacity ?? tier.totalQuota ?? 0
  const configured = phases
    .filter((phase) => {
      if (phase.status === "CLOSED") return false
      if (phase.ticketTypeId === tier.id) return true
      const other = ticketTypes.find((item) => item.id === phase.ticketTypeId)
      return Boolean(other?.areaId && tier.areaId && other.areaId === tier.areaId)
    })
    .reduce((sum, phase) => sum + phase.quantity, 0)
  return Math.max(0, capacity - configured)
}

export function hasSalePhaseOverlap(
  phases: SalePhaseItem[],
  ticketTypeId: string,
  startIso: string,
  endIso: string,
  excludePhaseId?: string,
): boolean {
  const start = Date.parse(startIso)
  const end = Date.parse(endIso)
  return phases.some((phase) => {
    if (phase.id === excludePhaseId || phase.ticketTypeId !== ticketTypeId) return false
    const phaseStart = Date.parse(phase.saleStartAt)
    const phaseEnd = Date.parse(phase.saleEndAt)
    return start < phaseEnd && end > phaseStart
  })
}
