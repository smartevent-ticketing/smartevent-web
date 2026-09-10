export { CheckinAppView } from "./checkin-app-view"

export { CheckinHistory } from "./components/checkin-history"
export { EventGateSelector } from "./components/event-gate-selector"
export { ScanInput } from "./components/scan-input"
export { ScanResult } from "./components/scan-result"
export { ScannerViewport } from "./components/scanner-viewport"
export {
  CameraPermissionDeniedView,
  CameraUnavailableView,
  AccessForbiddenView,
  NetworkErrorView,
} from "./components/checkin-error-states"

export { useCheckin } from "./hooks/use-checkin"
export { useCheckinEvents } from "./hooks/use-checkin-events"
export { useCheckinHistory } from "./hooks/use-checkin-history"

export type { CheckinStatus, ScanRecord } from "./model/checkin"
export { isQrToken, normalizeScanInput, mapCheckinHistory } from "./model/checkin"

export { checkinApi } from "./api/checkin-api"
