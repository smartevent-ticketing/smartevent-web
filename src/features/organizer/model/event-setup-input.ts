import type { EventSetupRequest } from "@/lib/api/event-setup-contract"
import type { components } from "@/lib/api/schema"

export type TicketTierSetup = EventSetupRequest["tiers"][number] & { id: string }
export type EventSetupInput = {
  eventName: string
  description: string
  startDate: string
  startTime: string
  selectedVenueId: string
  selectedCategoryId: string
  city: string
  ticketTiers: TicketTierSetup[]
}

export function buildEventSetupRequest(
  input: EventSetupInput,
  now = Date.now(),
): EventSetupRequest {
  if (!input.eventName.trim() || !input.selectedVenueId || !input.selectedCategoryId) {
    throw new Error("Vui lòng nhập tên sự kiện, chọn danh mục và địa điểm.")
  }
  const start = new Date(`${input.startDate}T${input.startTime}:00+07:00`)
  const end = new Date(`${input.startDate}T23:59:00+07:00`)
  if (
    !Number.isFinite(start.getTime()) ||
    !Number.isFinite(end.getTime()) ||
    start.getTime() <= now ||
    start >= end
  ) {
    throw new Error("Vui lòng chọn thời gian bắt đầu trong tương lai, trước 23:59 cùng ngày.")
  }
  if (!input.ticketTiers.length) throw new Error("Sự kiện cần ít nhất một hạng vé.")
  const names = new Set<string>()
  const tiers = input.ticketTiers.map((tier) => {
    const name = tier.name.trim()
    if (
      !name ||
      name.length > 100 ||
      !Number.isInteger(tier.capacity) ||
      tier.capacity <= 0 ||
      !Number.isFinite(tier.price) ||
      tier.price < 0
    ) {
      throw new Error(
        "Mỗi hạng vé cần tên không quá 100 ký tự, sức chứa nguyên dương và giá không âm.",
      )
    }
    if (names.has(name.toLocaleLowerCase("vi-VN")))
      throw new Error("Tên các hạng vé không được trùng nhau.")
    names.add(name.toLocaleLowerCase("vi-VN"))
    return { name, areaType: tier.areaType, price: tier.price, capacity: tier.capacity }
  })
  return {
    event: {
      name: input.eventName.trim(),
      description: input.description.trim(),
      venueId: input.selectedVenueId,
      categoryIds: [input.selectedCategoryId],
      city: input.city,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    },
    tiers,
  }
}

export function requireSubmittedEvent(event: components["schemas"]["EventResponse"] | undefined) {
  if (!event?.id || event.status !== "PENDING_APPROVAL") {
    throw new Error(
      "Chưa xác nhận được sự kiện đã gửi duyệt. Vui lòng kiểm tra danh sách sự kiện trước khi gửi lại.",
    )
  }
  return event
}
