export { EventCreateWizard } from "./event-create-wizard"
export { OrganizerDashboardView } from "./organizer-dashboard-view"
export { EventManagementView } from "./event-management-view"

export { OrganizerDashboardPanel } from "./components/dashboard-panel"
export { OrganizerEventsPanel } from "./components/events-panel"
export { OrganizerInventoryPanel } from "./components/inventory-panel"

export { EventBasicInfoStep } from "./components/event-setup/basicinfo-step"
export { EventReviewStep } from "./components/event-setup/review-step"
export { EventScheduleStep } from "./components/event-setup/schedule-step"
export { EventTicketsStep } from "./components/event-setup/tickets-step"

export { useEventSetup } from "./hooks/use-event-setup"
export { useOrganizerEvents } from "./hooks/use-organizer-events"
export type { DisplayEvent } from "./hooks/use-organizer-events"
export { useEventManagement } from "./hooks/use-event-management"

export type { TicketTierSetup, EventSetupInput } from "./model/event-setup-input"
export { buildEventSetupRequest, requireSubmittedEvent } from "./model/event-setup-input"
export type {
  EventManagementData,
  AreaItem,
  TicketTypeItem,
  IssuedTicketItem,
  CreateAreaInput,
  UpdateAreaInput,
  CreateTicketTypeInput,
  CreateSalePhaseInput,
} from "./model/event-management.types"

export {
  loadEventManagementData,
  fetchSubmissionReadiness,
  computePhaseStats,
} from "./services/event-management.service"

export { organizerApi } from "./api/organizer-api"
