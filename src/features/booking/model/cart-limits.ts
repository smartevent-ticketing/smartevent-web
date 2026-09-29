export function parseRequestedQuantity(raw: string | null): number {
  const quantity = Number(raw ?? 1)
  return Number.isSafeInteger(quantity) && quantity > 0 ? quantity : 1
}

export function cartQuantityLimit(
  tierLimit: number,
  available: number,
  eventLimit: number | null | undefined,
  otherCartQuantity: number,
): number {
  const remainingForEvent =
    eventLimit != null && eventLimit > 0 ? Math.max(0, eventLimit - otherCartQuantity) : Infinity
  return Math.max(0, Math.min(tierLimit, available, remainingForEvent))
}
