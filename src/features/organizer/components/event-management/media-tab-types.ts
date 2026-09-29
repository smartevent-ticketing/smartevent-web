export interface MediaTabProps {
  eventId: string
  isDraft: boolean
  onMediaChanged?: () => void | Promise<void>
}
