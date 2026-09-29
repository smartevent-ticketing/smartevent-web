import type { AreaItem, CreateAreaInput, UpdateAreaInput } from "../../model/event-management.types"

export interface AreasSeatsTabProps {
  canEdit: boolean
  areas: AreaItem[]
  onAddArea: (area: CreateAreaInput) => Promise<void>
  onUpdateArea?: (areaId: string, area: UpdateAreaInput) => Promise<void>
  onDeleteArea?: (areaId: string) => Promise<void>
}
