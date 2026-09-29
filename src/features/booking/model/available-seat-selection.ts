import type { components } from "@/lib/api/schema"

type Seat = components["schemas"]["EventSeatResponse"]

export function isSeatSelectable(seat: Seat): boolean {
  return Boolean(seat.id) && seat.status === "AVAILABLE"
}

export function selectAvailableSeats(selected: readonly Seat[], seats: readonly Seat[]): Seat[] {
  const availableById = new Map(seats.filter(isSeatSelectable).map((seat) => [seat.id, seat]))
  return selected.flatMap((seat) => {
    const current = availableById.get(seat.id)
    return current ? [current] : []
  })
}

export function sameSeatIds(first: readonly Seat[], second: readonly Seat[]): boolean {
  return (
    first.length === second.length && first.every((seat, index) => seat.id === second[index].id)
  )
}

export function selectedSeatIdsInOtherCartItems<T extends { id: string; selectedSeats?: Seat[] }>(
  cart: readonly T[],
  excludedItemId: string,
): Set<string> {
  const ids = new Set<string>()
  for (const item of cart) {
    if (item.id === excludedItemId) continue
    for (const seat of item.selectedSeats ?? []) {
      if (seat.id) ids.add(seat.id)
    }
  }
  return ids
}

export function hasDuplicateSelectedSeats<T extends { selectedSeats?: Seat[] }>(
  cart: readonly T[],
): boolean {
  const ids = new Set<string>()
  for (const item of cart) {
    for (const seat of item.selectedSeats ?? []) {
      if (!seat.id || ids.has(seat.id)) return true
      ids.add(seat.id)
    }
  }
  return false
}

export function reconcileSeatedCart<
  T extends { areaId: string; areaType: string; quantity: number; selectedSeats?: Seat[] },
>(cart: T[], seatsByArea: ReadonlyMap<string, readonly Seat[]>): { cart: T[]; changed: boolean } {
  let changed = false
  const currentCart: T[] = []

  for (const item of cart) {
    const refreshed = seatsByArea.get(item.areaId)
    if (item.areaType !== "SEATED" || !refreshed) {
      currentCart.push(item)
      continue
    }
    const selectedSeats = selectAvailableSeats(item.selectedSeats ?? [], refreshed)
    if (
      item.selectedSeats &&
      sameSeatIds(item.selectedSeats, selectedSeats) &&
      item.quantity === selectedSeats.length
    ) {
      currentCart.push(item)
      continue
    }
    changed = true
    if (selectedSeats.length > 0)
      currentCart.push({ ...item, quantity: selectedSeats.length, selectedSeats })
  }

  return { cart: changed ? currentCart : cart, changed }
}
