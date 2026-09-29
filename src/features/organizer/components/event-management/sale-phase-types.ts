import type { SalePhaseStatus } from "@/lib/api/event-setup-contract"
import type { CreateSalePhaseInput, SalePhaseItem } from "../../model/event-management.types"

export interface SalePhasesTabProps {
  eventEndTime?: string
  salePhases: SalePhaseItem[]
  ticketTypes: Array<{
    id: string
    name: string
    areaId?: string
    areaName?: string
    totalQuota?: number
    price?: number
    basePrice?: number
  }>
  areas?: Array<{ id: string; name: string; capacity?: number; type?: string }>
  onAddSalePhase: (phase: CreateSalePhaseInput | CreateSalePhaseInput[]) => Promise<void>
  onUpdatePhaseStatus: (phaseId: string, newStatus: SalePhaseStatus) => Promise<void>
  onDeleteSalePhase?: (phaseId: string) => Promise<void>
  onUpdateSalePhase: (phaseId: string, phase: CreateSalePhaseInput) => Promise<void>
  canEditConfig: boolean
}

export interface TierPhaseConfig {
  selected: boolean
  basePrice: number | ""
  discountPercent: number
  price: number | ""
  quantity: number | ""
}

export type CreateSalePhaseDialogProps = Pick<
  SalePhasesTabProps,
  "eventEndTime" | "salePhases" | "ticketTypes" | "areas" | "onAddSalePhase"
> & { onClose: () => void }
