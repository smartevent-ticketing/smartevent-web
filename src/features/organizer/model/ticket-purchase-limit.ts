import type { EventDetails, UpdateEventPayload } from "@/lib/api/event-setup-contract"

const MAX_DATABASE_INTEGER = 2_147_483_647

export function parseTicketPurchaseLimit(value: string): number | undefined {
  if (value.trim() === "") return undefined
  if (!/^[1-9]\d*$/.test(value.trim())) {
    throw new Error("Giới hạn vé phải là số nguyên dương.")
  }

  const limit = Number(value.trim())
  if (!Number.isSafeInteger(limit) || limit > MAX_DATABASE_INTEGER) {
    throw new Error("Giới hạn vé vượt quá giá trị cho phép.")
  }
  return limit
}

export function buildTicketLimitUpdateRequest(
  event: EventDetails,
  limit: number | undefined,
): UpdateEventPayload {
  if (!event.name || !event.startTime || !event.endTime) {
    throw new Error("Không đủ dữ liệu sự kiện để cập nhật giới hạn vé. Vui lòng tải lại trang.")
  }
  if (
    limit !== undefined &&
    (!Number.isSafeInteger(limit) || limit <= 0 || limit > MAX_DATABASE_INTEGER)
  ) {
    throw new Error("Giới hạn vé phải là số nguyên dương hợp lệ.")
  }

  return {
    name: event.name,
    description: event.description,
    venueId: event.venue?.id,
    startTime: event.startTime,
    endTime: event.endTime,
    city: event.city,
    resaleEnabled: event.resaleEnabled,
    maxResalePriceMultiplier: event.maxResalePriceMultiplier,
    resaleDeadlineHoursBefore: event.resaleDeadlineHoursBefore,
    virtualQueueEnabled: event.virtualQueueEnabled,
    queueBatchSize: event.queueBatchSize,
    ...(limit === undefined ? { clearMaxTicketsPerUser: true } : { maxTicketsPerUser: limit }),
  }
}
