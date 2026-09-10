import type { components } from "@/lib/api/schema"

type Seat = components["schemas"]["EventSeatResponse"]
type Phase = components["schemas"]["TicketSalePhaseResponse"]

export function buildReservationItems(selection: {
  ticketTypeId: string
  phase: Phase | undefined
  seated: boolean
  seats: Seat[]
  quantity: number
}) {
  const { phase, ticketTypeId, seated, seats, quantity } = selection
  if (!phase?.id || phase.ticketTypeId !== ticketTypeId)
    throw new Error("Không có đợt bán phù hợp cho loại vé này.")
  const count = seated ? seats.length : quantity
  const maxAllowed = Math.min(phase.maxPerOrder ?? 4, phase.maxPerUser ?? Infinity)
  if (!Number.isInteger(count) || count < 1 || count > maxAllowed)
    throw new Error("Số lượng vé không hợp lệ hoặc vượt giới hạn mỗi đơn.")
  if (
    seated &&
    (seats.some((seat) => !seat.id) || new Set(seats.map((seat) => seat.id)).size !== seats.length)
  )
    throw new Error("Danh sách ghế không hợp lệ.")
  return seated
    ? seats.map((seat) => ({
        ticketTypeId,
        salePhaseId: phase.id!,
        eventSeatId: seat.id,
        quantity: 1,
      }))
    : [{ ticketTypeId, salePhaseId: phase.id, quantity }]
}
