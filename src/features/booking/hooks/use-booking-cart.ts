"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ApiRequestError, getApiErrorMessage } from "@/lib/api/result"
import { useAuth } from "@/features/auth"
import { isPhaseOpen, useEventCatalog } from "@/features/catalog"
import { useClock } from "@/hooks/use-clock"
import { bookingApi } from "../api/booking-api"
import { cartQuantityLimit, parseRequestedQuantity } from "../model/cart-limits"
import { buildAvailableTiers } from "../model/available-tiers"
import type { AvailableTier, CartItem, EventSeat } from "../model/booking-cart"
import {
  hasDuplicateSelectedSeats,
  isSeatSelectable,
  reconcileSeatedCart,
  sameSeatIds,
  selectedSeatIdsInOtherCartItems,
  selectAvailableSeats,
} from "../model/available-seat-selection"
import { useActiveReservation } from "./use-active-reservation"
import { useAvailableSeats } from "./use-available-seats"

export function useBookingCart({ eventId }: { eventId: string }) {
  const router = useRouter()
  const params = useSearchParams()
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const now = useClock(15_000)

  const catalog = useEventCatalog(eventId)
  const data = catalog.data
  const event = data?.event ?? null
  const [eventOccupied, setEventOccupied] = useState(0)
  const [phaseOccupied, setPhaseOccupied] = useState<Record<string, number>>({})
  const phaseIdsKey = (data?.phases ?? [])
    .map((phase) => phase.id)
    .filter(Boolean)
    .sort()
    .join(",")
  const eventRemainingLimit =
    event?.maxTicketsPerUser != null && event.maxTicketsPerUser > 0
      ? Math.max(0, event.maxTicketsPerUser - eventOccupied)
      : undefined

  useEffect(() => {
    if (!isAuthenticated || !event?.id) {
      setEventOccupied(0)
      setPhaseOccupied({})
      return
    }
    let activeRequest = true
    const phaseIds = phaseIdsKey.split(",").filter(Boolean)
    Promise.all([
      bookingApi.getMyEventCounter(event.id),
      Promise.all(
        phaseIds.map(async (id) => {
          const response = await bookingApi.getMyPhaseCounter(id)
          return [id, response.data?.data?.effectiveOccupiedQuantity ?? 0] as const
        }),
      ),
    ])
      .then(([eventResponse, counters]) => {
        if (!activeRequest) return
        setEventOccupied(eventResponse.data?.data ?? 0)
        setPhaseOccupied(Object.fromEntries(counters))
      })
      .catch(() => {
        if (activeRequest)
          setErrorMessage("Không tải được hạn mức đã mua; máy chủ sẽ kiểm tra lại khi giữ chỗ.")
      })
    return () => {
      activeRequest = false
    }
  }, [isAuthenticated, event?.id, phaseIdsKey])

  const active = useActiveReservation(event?.id, isAuthenticated)

  const [cart, setCart] = useState<CartItem[]>([])
  const [isSubmitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // State for Seat Selection Modal (SEATED tickets)
  const [seatModalTier, setSeatModalTier] = useState<AvailableTier | null>(null)
  const [seatModalSelectedSeats, setSeatModalSelectedSeats] = useState<EventSeat[]>([])

  const onSeatsLoaded = useCallback((areaId: string, refreshed: EventSeat[]) => {
    setSeatModalSelectedSeats((previous) => {
      const current = selectAvailableSeats(previous, refreshed)
      return sameSeatIds(previous, current) ? previous : current
    })
    setCart((previous) => reconcileSeatedCart(previous, new Map([[areaId, refreshed]])).cart)
  }, [])
  const seats = useAvailableSeats(
    seatModalTier?.areaId || "",
    Boolean(seatModalTier && seatModalTier.areaType === "SEATED"),
    onSeatsLoaded,
  )
  const modalSelectedSeats = selectAvailableSeats(seatModalSelectedSeats, seats.availableSeats)
  const seatsInOtherTiers = selectedSeatIdsInOtherCartItems(
    cart,
    `${seatModalTier?.id}-${seatModalTier?.phaseId}`,
  )
  const otherCartQuantityForModal = cart
    .filter((item) => item.id !== `${seatModalTier?.id}-${seatModalTier?.phaseId}`)
    .reduce((sum, item) => sum + item.quantity, 0)
  const modalMaxAllowed = seatModalTier
    ? cartQuantityLimit(
        seatModalTier.maxAllowed,
        seatModalTier.available,
        eventRemainingLimit,
        otherCartQuantityForModal,
      )
    : 0

  const inFlight = useRef(false)
  const lastRequest = useRef<{ fingerprint: string; key: string } | null>(null)
  const initialPopulated = useRef(false)

  const preferredPhaseId = params.get("phase") ?? undefined
  const availableTiers = useMemo<AvailableTier[]>(
    () => buildAvailableTiers(data, phaseOccupied, preferredPhaseId, now),
    [data, phaseOccupied, preferredPhaseId, now],
  )

  useEffect(() => {
    setCart((previous) => {
      let changed = false
      let remainingForEvent = eventRemainingLimit ?? Infinity
      const next = previous.flatMap((item) => {
        const tier = availableTiers.find(
          (candidate) =>
            candidate.id === item.ticketTypeId && candidate.phaseId === item.salePhaseId,
        )
        if (!tier) return [item]
        const quantity = Math.min(item.quantity, tier.maxAllowed, remainingForEvent)
        remainingForEvent -= quantity
        if (quantity <= 0) {
          changed = true
          return []
        }
        if (quantity === item.quantity && tier.maxAllowed === item.maxAllowed) return [item]
        changed = true
        return [
          {
            ...item,
            quantity,
            maxAllowed: tier.maxAllowed,
            selectedSeats: item.selectedSeats?.slice(0, quantity),
          },
        ]
      })
      return changed ? next : previous
    })
  }, [availableTiers, eventRemainingLimit])

  // Automatically add ticket to cart if arriving from event detail with ?tier=...&phase=...&qty=...
  useEffect(() => {
    if (initialPopulated.current || availableTiers.length === 0) return

    const tierParam = params.get("tier")
    const phaseParam = params.get("phase")
    const qtyParam = parseRequestedQuantity(params.get("qty"))

    if (tierParam) {
      const targetTier =
        availableTiers.find(
          (t) => t.id === tierParam && (!phaseParam || t.phaseId === phaseParam),
        ) || availableTiers.find((t) => t.id === tierParam)

      if (targetTier) {
        const initialQty = Math.min(
          qtyParam,
          cartQuantityLimit(targetTier.maxAllowed, targetTier.available, eventRemainingLimit, 0),
        )
        if (initialQty <= 0) return
        if (targetTier.areaType === "SEATED") {
          setSeatModalTier(targetTier)
        } else {
          setCart([
            {
              id: `${targetTier.id}-${targetTier.phaseId}`,
              ticketTypeId: targetTier.id,
              ticketTypeName: targetTier.name,
              salePhaseId: targetTier.phaseId,
              salePhaseName: targetTier.phaseName,
              areaId: targetTier.areaId,
              areaName: targetTier.areaName,
              areaType: targetTier.areaType,
              unitPrice: targetTier.price,
              quantity: initialQty,
              maxAllowed: targetTier.maxAllowed,
              available: targetTier.available,
              selectedSeats: [],
            },
          ])
        }
        initialPopulated.current = true
      }
    }
  }, [availableTiers, eventRemainingLimit, params])

  // Cart operations
  function addToCart(tier: AvailableTier, qty = 1) {
    setErrorMessage(null)
    if (!Number.isSafeInteger(qty) || qty < 1) return
    const cartItemId = `${tier.id}-${tier.phaseId}`
    const existing = cart.find((item) => item.id === cartItemId)
    const maxEventLimit = eventRemainingLimit
    const currentTotal = cart.reduce((sum, item) => sum + item.quantity, 0)
    const currentTierQty = existing ? existing.quantity : 0

    const maxPossible = cartQuantityLimit(
      tier.maxAllowed,
      tier.available,
      maxEventLimit,
      currentTotal - currentTierQty,
    )

    if (existing) {
      if (existing.quantity >= maxPossible) {
        setErrorMessage("Bạn đã mua giới hạn số vé cho phép")
        return
      }
      const updatedQty = Math.min(existing.quantity + qty, maxPossible)
      if (updatedQty < existing.quantity + qty)
        setErrorMessage("Giỏ hàng đã đạt số vé còn lại hoặc giới hạn cho phép.")
      setCart(
        cart.map((item) => (item.id === cartItemId ? { ...item, quantity: updatedQty } : item)),
      )
    } else {
      if (maxPossible <= 0) {
        setErrorMessage("Bạn đã mua giới hạn số vé cho phép")
        return
      }
      const initialQty = Math.min(qty, maxPossible)
      if (initialQty < qty) setErrorMessage("Giỏ hàng đã đạt số vé còn lại hoặc giới hạn cho phép.")
      setCart([
        ...cart,
        {
          id: cartItemId,
          ticketTypeId: tier.id,
          ticketTypeName: tier.name,
          salePhaseId: tier.phaseId,
          salePhaseName: tier.phaseName,
          areaId: tier.areaId,
          areaName: tier.areaName,
          areaType: tier.areaType,
          unitPrice: tier.price,
          quantity: initialQty,
          maxAllowed: tier.maxAllowed,
          available: tier.available,
          selectedSeats: [],
        },
      ])
    }
  }

  function updateQuantity(cartItemId: string, newQty: number) {
    setErrorMessage(null)
    if (!Number.isSafeInteger(newQty)) return
    if (newQty <= 0) {
      removeFromCart(cartItemId)
      return
    }

    const targetItem = cart.find((item) => item.id === cartItemId)
    if (!targetItem) return

    const maxEventLimit = eventRemainingLimit
    const currentTotal = cart.reduce((sum, item) => sum + item.quantity, 0)
    const maxPossible = cartQuantityLimit(
      targetItem.maxAllowed,
      targetItem.available,
      maxEventLimit,
      currentTotal - targetItem.quantity,
    )
    if (newQty > targetItem.quantity && maxPossible <= targetItem.quantity) {
      setErrorMessage("Giỏ hàng đã đạt số vé còn lại hoặc giới hạn cho phép.")
      return
    }
    const clampedQty = Math.min(newQty, maxPossible)
    if (clampedQty <= 0) {
      removeFromCart(cartItemId)
      return
    }
    if (clampedQty < newQty)
      setErrorMessage("Giỏ hàng đã đạt số vé còn lại hoặc giới hạn cho phép.")

    setCart(
      cart.map((item) => {
        if (item.id !== cartItemId) return item
        return {
          ...item,
          quantity: clampedQty,
          selectedSeats:
            item.areaType === "SEATED" && item.selectedSeats
              ? item.selectedSeats.slice(0, clampedQty)
              : item.selectedSeats,
        }
      }),
    )
  }

  function removeFromCart(cartItemId: string) {
    setCart(cart.filter((item) => item.id !== cartItemId))
  }

  function clearCart() {
    setCart([])
    setErrorMessage(null)
  }

  // Seat modal management for SEATED tickets
  function openSeatModal(tier: AvailableTier) {
    setSeatModalTier(tier)
    const existing = cart.find((item) => item.id === `${tier.id}-${tier.phaseId}`)
    setSeatModalSelectedSeats(existing?.selectedSeats || [])
  }

  function closeSeatModal() {
    setSeatModalTier(null)
    setSeatModalSelectedSeats([])
  }

  function handleToggleSeatModal(seat: EventSeat) {
    if (!seatModalTier) return

    // Reject toggling if seat status is HELD, SOLD, or BLOCKED
    if (seat.status && seat.status !== "AVAILABLE") {
      return
    }

    const current = seats.availableSeats.find((item) => item.id === seat.id)
    if (!current || !isSeatSelectable(current) || !seats.hasLoadedSeats || seats.isLoadingSeats)
      return

    const isSelected = modalSelectedSeats.some((s) => s.id === seat.id)
    if (isSelected) {
      setSeatModalSelectedSeats(modalSelectedSeats.filter((s) => s.id !== seat.id))
      setErrorMessage(null)
    } else {
      if (current.id && seatsInOtherTiers.has(current.id)) {
        setErrorMessage("Ghế này đã được chọn ở hạng vé khác trong giỏ hàng.")
        return
      }
      if (modalSelectedSeats.length >= modalMaxAllowed) {
        setErrorMessage("Đã đạt số ghế còn lại hoặc giới hạn cho phép.")
        return
      }

      setSeatModalSelectedSeats([...modalSelectedSeats, current])
      setErrorMessage(null)
    }
  }

  function confirmSeatSelection() {
    if (!seatModalTier) return
    if (!seats.hasLoadedSeats || seats.isLoadingSeats) {
      setErrorMessage("Chưa tải được trạng thái ghế. Vui lòng thử lại.")
      return
    }
    if (modalSelectedSeats.length === 0) {
      setErrorMessage("Vui lòng chọn ít nhất 1 ghế ngồi.")
      return
    }
    if (modalSelectedSeats.some((seat) => seat.id && seatsInOtherTiers.has(seat.id))) {
      setErrorMessage("Một ghế đã được chọn ở hạng vé khác. Vui lòng chọn ghế khác.")
      return
    }
    if (modalSelectedSeats.length > modalMaxAllowed) {
      setErrorMessage("Số ghế đã chọn vượt lượng vé còn lại hoặc giới hạn cho phép.")
      return
    }

    const cartItemId = `${seatModalTier.id}-${seatModalTier.phaseId}`
    const existing = cart.find((item) => item.id === cartItemId)

    if (existing) {
      setCart(
        cart.map((item) =>
          item.id === cartItemId
            ? {
                ...item,
                quantity: modalSelectedSeats.length,
                selectedSeats: modalSelectedSeats,
              }
            : item,
        ),
      )
    } else {
      setCart([
        ...cart,
        {
          id: cartItemId,
          ticketTypeId: seatModalTier.id,
          ticketTypeName: seatModalTier.name,
          salePhaseId: seatModalTier.phaseId,
          salePhaseName: seatModalTier.phaseName,
          areaId: seatModalTier.areaId,
          areaName: seatModalTier.areaName,
          areaType: "SEATED",
          unitPrice: seatModalTier.price,
          quantity: modalSelectedSeats.length,
          maxAllowed: seatModalTier.maxAllowed,
          available: seatModalTier.available,
          selectedSeats: modalSelectedSeats,
        },
      ])
    }

    closeSeatModal()
  }

  // Cancel existing active reservation
  async function handleCancelActiveReservation() {
    if (!active.activeReservation?.id || inFlight.current) return
    inFlight.current = true
    setSubmitting(true)
    try {
      await bookingApi.cancelReservation({
        params: { path: { id: active.activeReservation.id } },
      })
      active.clearActiveReservation()
      lastRequest.current = null
      setErrorMessage(null)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Không thể hủy phiên giữ chỗ cũ."))
    } finally {
      inFlight.current = false
      setSubmitting(false)
    }
  }

  // Confirm and hold reservation for all items in the cart
  async function handleConfirmReservation() {
    if (inFlight.current || cart.length === 0) return

    if (!isAuthenticated) {
      router.push(
        "/login?redirect=" + encodeURIComponent(window.location.pathname + window.location.search),
      )
      return
    }

    // Check if seated items have selected seats
    for (const item of cart) {
      if (item.areaType === "SEATED") {
        if (!item.selectedSeats?.length || item.selectedSeats.length !== item.quantity) {
          setErrorMessage(
            `Hạng vé "${item.ticketTypeName}" là vé ngồi, vui lòng chọn đủ ${item.quantity} ghế ngồi.`,
          )
          return
        }
      }
    }

    inFlight.current = true
    setSubmitting(true)
    setErrorMessage(null)

    try {
      if (!event?.id) throw new Error("Không tìm thấy sự kiện.")
      if (
        cart.some(
          (item) =>
            !data?.phases.some(
              (phase) =>
                phase.id === item.salePhaseId &&
                phase.ticketTypeId === item.ticketTypeId &&
                isPhaseOpen(phase, Date.now()),
            ),
        )
      )
        throw new Error("Đợt bán của một hạng vé đã kết thúc. Vui lòng chọn vé đang mở bán.")
      if (hasDuplicateSelectedSeats(cart))
        throw new Error("Có ghế được chọn trùng giữa các hạng vé. Vui lòng chọn lại.")

      const seatedAreas = [
        ...new Set(cart.filter((item) => item.areaType === "SEATED").map((item) => item.areaId)),
      ]
      const currentSeatsByArea = new Map(
        await Promise.all(
          seatedAreas.map(async (areaId) => {
            const response = await bookingApi.getAvailableSeats({ params: { path: { areaId } } })
            return [areaId, response.data?.data ?? []] as const
          }),
        ),
      )
      const refreshedCart = reconcileSeatedCart(cart, currentSeatsByArea)
      if (refreshedCart.changed) {
        setCart(refreshedCart.cart)
        throw new Error("Một số ghế vừa hết chỗ. Vui lòng chọn lại ghế còn trống.")
      }

      const items: {
        ticketTypeId: string
        salePhaseId: string
        eventSeatId?: string
        quantity: number
      }[] = []

      for (const item of cart) {
        if (item.areaType === "SEATED" && item.selectedSeats && item.selectedSeats.length > 0) {
          for (const s of item.selectedSeats) {
            items.push({
              ticketTypeId: item.ticketTypeId,
              salePhaseId: item.salePhaseId,
              eventSeatId: s.id,
              quantity: 1,
            })
          }
        } else {
          items.push({
            ticketTypeId: item.ticketTypeId,
            salePhaseId: item.salePhaseId,
            quantity: item.quantity,
          })
        }
      }

      const fingerprint = JSON.stringify({ eventId: event.id, items })
      if (lastRequest.current?.fingerprint !== fingerprint) {
        lastRequest.current = { fingerprint, key: crypto.randomUUID() }
      }

      const response = await bookingApi.createReservation({
        body: {
          eventId: event.id,
          items,
          idempotencyKey: lastRequest.current.key,
        },
      })

      if (!response.data?.data?.id) {
        throw new Error("Chưa xác nhận được phiên giữ chỗ. Vui lòng thử lại.")
      }

      router.push("/checkout?reservationId=" + response.data.data.id)
    } catch (error) {
      if (error instanceof ApiRequestError && error.code === "SEAT_ALREADY_HELD") {
        const seatedAreas = [
          ...new Set(cart.filter((item) => item.areaType === "SEATED").map((item) => item.areaId)),
        ]
        const refreshed = await Promise.allSettled(
          seatedAreas.map(async (areaId) => {
            const response = await bookingApi.getAvailableSeats({ params: { path: { areaId } } })
            return [areaId, response.data?.data ?? []] as const
          }),
        )
        const seatsByArea = new Map(
          refreshed.flatMap((result) => (result.status === "fulfilled" ? [result.value] : [])),
        )
        if (seatsByArea.size > 0)
          setCart((previous) => reconcileSeatedCart(previous, seatsByArea).cart)
      }
      setErrorMessage(getApiErrorMessage(error, "Giữ chỗ không thành công. Vui lòng thử lại."))
    } finally {
      inFlight.current = false
      setSubmitting(false)
    }
  }

  // Calculated totals
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalCartPrice = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)

  const eventTitle = event?.name || "Sự kiện"
  const locationName = event?.venue?.name || event?.city || "Địa điểm linh hoạt"

  return {
    isAuthLoading,
    event,
    availableTiers,
    cart,
    totalCartCount,
    totalCartPrice,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    // Seat modal
    seatModalTier,
    seatModalSelectedSeats: modalSelectedSeats,
    modalMaxAllowed,
    seatsInOtherTiers,
    openSeatModal,
    closeSeatModal,
    handleToggleSeatModal,
    confirmSeatSelection,
    modalAvailableSeats: seats.availableSeats,
    isLoadingModalSeats: seats.isLoadingSeats,
    // Actions
    activeReservation: active.activeReservation,
    handleCancelActiveReservation,
    handleConfirmReservation,
    isLoading: catalog.isLoading,
    isSubmitting,
    errorMessage: errorMessage || catalog.error || active.reservationError,
    setErrorMessage,
    eventTitle,
    locationName,
  }
}
