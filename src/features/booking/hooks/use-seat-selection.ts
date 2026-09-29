"use client"
import { useCallback, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { components } from "@/lib/api/schema"
import { getApiErrorMessage } from "@/lib/api/result"
import { useClock } from "@/hooks/use-clock"
import { useAuth } from "@/features/auth"
import { useEventCatalog, selectSalePhase } from "@/features/catalog"
import { bookingApi } from "../api/booking-api"
import {
  isSeatSelectable,
  sameSeatIds,
  selectAvailableSeats,
} from "../model/available-seat-selection"
import { buildReservationItems } from "../model/reservation-selection"
import { useAvailableSeats } from "./use-available-seats"
import { useActiveReservation } from "./use-active-reservation"

type Seat = components["schemas"]["EventSeatResponse"]
export function useSeatSelection({ eventId }: { eventId: string }) {
  const router = useRouter()
  const params = useSearchParams()
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const catalog = useEventCatalog(eventId)
  const data = catalog.data
  const event = data?.event ?? null
  const areas = data?.areas ?? []
  const [areaId, chooseArea] = useState("")
  const [ticketId, setSelectedTicketTypeId] = useState(params.get("tier") ?? "")
  const initialType = data?.types.find((type) => type.id === (ticketId || params.get("tier")))
  const selectedAreaId = areas.some((area) => area.id === areaId)
    ? areaId
    : (initialType?.eventAreaId ?? areas[0]?.id ?? "")
  const selectedArea = areas.find((area) => area.id === selectedAreaId)
  const isSeated = selectedArea?.areaType === "SEATED"
  const areaTicketTypes = data?.types.filter((type) => type.eventAreaId === selectedAreaId) ?? []
  const effectiveTicketTypeId =
    areaTicketTypes.find((type) => type.id === ticketId)?.id ?? areaTicketTypes[0]?.id ?? ""
  const phase = selectSalePhase(
    data?.phases ?? [],
    effectiveTicketTypeId,
    params.get("phase") ?? undefined,
    useClock(),
  )
  const [selection, setSelection] = useState<Seat[]>([])
  const onSeatsLoaded = useCallback(
    (loadedAreaId: string, refreshed: Seat[]) => {
      if (loadedAreaId !== selectedAreaId) return
      setSelection((previous) => {
        const current = selectAvailableSeats(previous, refreshed)
        return sameSeatIds(previous, current) ? previous : current
      })
    },
    [selectedAreaId],
  )
  const seats = useAvailableSeats(selectedAreaId, isSeated, onSeatsLoaded)
  const active = useActiveReservation(event?.id, isAuthenticated)
  const selectedSeats = selectAvailableSeats(selection, seats.availableSeats)
  const [quantity, setQuantity] = useState(() => {
    const value = Number(params.get("qty") ?? 1)
    return Number.isInteger(value) && value > 0 ? value : 1
  })
  const [isSubmitting, setSubmitting] = useState(false)
  const [actionError, setErrorMessage] = useState<string | null>(null)
  const inFlight = useRef(false)
  const lastRequest = useRef<{ fingerprint: string; key: string } | null>(null)
  const maxAllowed = Math.min(phase?.maxPerOrder ?? 4, phase?.maxPerUser ?? Infinity)
  function setSelectedAreaId(id: string) {
    chooseArea(id)
    setSelection([])
    setErrorMessage(null)
  }
  function handleToggleSeat(seat: Seat) {
    const current = seats.availableSeats.find((item) => item.id === seat.id)
    if (!current || !isSeatSelectable(current) || seats.isLoadingSeats) return
    if (selectedSeats.some((item) => item.id === current.id))
      setSelection(selectedSeats.filter((item) => item.id !== seat.id))
    else if (selectedSeats.length < maxAllowed) {
      setSelection([...selectedSeats, current])
      setErrorMessage(null)
    } else setErrorMessage(`Bạn đã chọn đủ số ghế tối đa (${maxAllowed} vé) cho đợt bán này.`)
  }
  async function handleCancelActiveReservation() {
    if (!active.activeReservation?.id || inFlight.current) return
    inFlight.current = true
    setSubmitting(true)
    try {
      await bookingApi.cancelReservation({ params: { path: { id: active.activeReservation.id } } })
      active.clearActiveReservation()
      seats.refreshSeats()
      lastRequest.current = null
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Không thể hủy phiên giữ chỗ."))
    } finally {
      inFlight.current = false
      setSubmitting(false)
    }
  }
  async function handleConfirmReservation() {
    if (inFlight.current) return
    if (!isAuthenticated) {
      router.push(
        "/login?redirect=" + encodeURIComponent(window.location.pathname + window.location.search),
      )
      return
    }
    inFlight.current = true
    setSubmitting(true)
    setErrorMessage(null)
    try {
      if (!event?.id) throw new Error("Không tìm thấy sự kiện.")
      if (isSeated && selectedSeats.length > 0) {
        const response = await bookingApi.getAvailableSeats({
          params: { path: { areaId: selectedAreaId } },
        })
        const current = selectAvailableSeats(selectedSeats, response.data?.data ?? [])
        if (!sameSeatIds(selectedSeats, current)) {
          setSelection(current)
          throw new Error("Một số ghế vừa hết chỗ. Vui lòng chọn lại ghế còn trống.")
        }
      }
      const items = buildReservationItems({
        ticketTypeId: effectiveTicketTypeId,
        phase,
        seated: isSeated,
        seats: selectedSeats,
        quantity,
      })
      const fingerprint = JSON.stringify({ eventId: event.id, items })
      if (lastRequest.current?.fingerprint !== fingerprint)
        lastRequest.current = { fingerprint, key: crypto.randomUUID() }
      const response = await bookingApi.createReservation({
        body: { eventId: event.id, items, idempotencyKey: lastRequest.current.key },
      })
      if (!response.data?.data?.id)
        throw new Error("Chưa xác nhận được phiên giữ chỗ. Vui lòng thử lại.")
      router.push("/checkout?reservationId=" + response.data.data.id)
    } catch (error) {
      if (isSeated) {
        seats.refreshSeats()
      }
      setErrorMessage(getApiErrorMessage(error, "Giữ chỗ không thành công."))
    } finally {
      inFlight.current = false
      setSubmitting(false)
    }
  }
  const effectiveQty = isSeated ? selectedSeats.length : quantity
  const unitPrice = phase?.price ?? 0
  return {
    isAuthLoading,
    event,
    areas,
    activeReservation: active.activeReservation,
    availableSeats: seats.availableSeats,
    isLoading: catalog.isLoading,
    isLoadingSeats: seats.isLoadingSeats,
    isSubmitting,
    errorMessage: actionError ?? catalog.error ?? seats.seatsError ?? active.reservationError,
    setErrorMessage,
    selectedAreaId,
    setSelectedAreaId,
    setSelectedTicketTypeId,
    selectedSeats,
    quantity,
    setQuantity,
    selectedArea,
    isSeated,
    areaTicketTypes,
    effectiveTicketTypeId,
    unitPrice,
    effectiveQty,
    totalPrice: unitPrice * effectiveQty,
    maxAllowed,
    handleToggleSeat,
    handleCancelActiveReservation,
    handleConfirmReservation,
    eventTitle: event?.name ?? "Sự kiện",
    locationName: event?.venue?.name ?? event?.city ?? "Địa điểm sự kiện",
  }
}
