"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { components } from "@/lib/api/schema"
import { getApiErrorMessage } from "@/lib/api/result"
import { useAuth } from "@/features/auth"
import { useEventCatalog } from "@/features/catalog"
import { bookingApi } from "../api/booking-api"
import { useActiveReservation } from "./use-active-reservation"
import { useAvailableSeats } from "./use-available-seats"

export type EventSeat = components["schemas"]["EventSeatResponse"]

export interface AvailableTier {
  id: string // ticketTypeId
  name: string
  description?: string
  areaId: string
  areaName: string
  areaType: "STANDING" | "SEATED"
  phaseId: string
  phaseName: string
  price: number
  available: number
  maxAllowed: number
}

export interface CartItem {
  id: string // `${ticketTypeId}-${phaseId}`
  ticketTypeId: string
  ticketTypeName: string
  salePhaseId: string
  salePhaseName: string
  areaId: string
  areaName: string
  areaType: "STANDING" | "SEATED"
  unitPrice: number
  quantity: number
  maxAllowed: number
  available: number
  selectedSeats?: EventSeat[]
}

export function useBookingCart({ eventId }: { eventId: string }) {
  const router = useRouter()
  const params = useSearchParams()
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()

  const catalog = useEventCatalog(eventId)
  const data = catalog.data
  const event = data?.event ?? null

  const active = useActiveReservation(event?.id, isAuthenticated)

  const [cart, setCart] = useState<CartItem[]>([])
  const [isSubmitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // State for Seat Selection Modal (SEATED tickets)
  const [seatModalTier, setSeatModalTier] = useState<AvailableTier | null>(null)
  const [seatModalSelectedSeats, setSeatModalSelectedSeats] = useState<EventSeat[]>([])

  const seats = useAvailableSeats(
    seatModalTier?.areaId || "",
    Boolean(seatModalTier && seatModalTier.areaType === "SEATED"),
  )

  const inFlight = useRef(false)
  const lastRequest = useRef<{ fingerprint: string; key: string } | null>(null)
  const initialPopulated = useRef(false)

  // Map all available ticket tiers from catalog
  const availableTiers = useMemo<AvailableTier[]>(() => {
    if (!data?.types || !data?.phases) return []

    const tiers: AvailableTier[] = []
    const preferredPhaseId = params.get("phase")

    for (const tt of data.types) {
      if (!tt.id) continue

      const area = data.areas?.find((a) => a.id === tt.eventAreaId)
      const areaType = area?.areaType === "SEATED" ? "SEATED" : "STANDING"
      const areaName = area?.name || tt.name || "Khu vực chung"
      const areaId = area?.id || tt.eventAreaId || ""

      const matchingPhases = data.phases.filter((p) => p.ticketTypeId === tt.id)

      let phase = matchingPhases.find((p) => p.id === preferredPhaseId)
      if (!phase) {
        phase = matchingPhases.find((p) => p.status === "ACTIVE")
      }
      if (!phase) {
        phase = matchingPhases[0]
      }

      if (!phase?.id) continue

      const counter = data.inventory?.find((inv) => inv.salePhaseId === phase.id)
      const total = counter?.totalQuantity ?? phase.quantity ?? 0
      const sold = counter?.soldQuantity ?? 0
      const held = counter?.heldQuantity ?? 0
      const available =
        counter?.availableQuantity != null
          ? Number(counter.availableQuantity)
          : Math.max(0, total - sold - held)

      const maxAllowed = Math.min(phase.maxPerOrder ?? 4, phase.maxPerUser ?? Infinity)

      tiers.push({
        id: tt.id,
        name: tt.name || "Vé vào cổng",
        description: tt.description,
        areaId,
        areaName,
        areaType,
        phaseId: phase.id,
        phaseName: phase.name || "Vé tiêu chuẩn",
        price: Number(phase.price) || 0,
        available,
        maxAllowed,
      })
    }

    return tiers
  }, [data, params])

  // Automatically add ticket to cart if arriving from event detail with ?tier=...&phase=...&qty=...
  useEffect(() => {
    if (initialPopulated.current || availableTiers.length === 0) return

    const tierParam = params.get("tier")
    const phaseParam = params.get("phase")
    const qtyParam = Math.max(1, Number(params.get("qty") || 1))

    if (tierParam) {
      const targetTier =
        availableTiers.find(
          (t) => t.id === tierParam && (!phaseParam || t.phaseId === phaseParam),
        ) || availableTiers.find((t) => t.id === tierParam)

      if (targetTier) {
        const initialQty = Math.min(
          qtyParam,
          targetTier.maxAllowed,
          targetTier.available > 0 ? targetTier.available : targetTier.maxAllowed,
        )

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
        initialPopulated.current = true
      }
    }
  }, [availableTiers, params])

  // Cart operations
  function addToCart(tier: AvailableTier, qty = 1) {
    setErrorMessage(null)
    const cartItemId = `${tier.id}-${tier.phaseId}`
    const existing = cart.find((item) => item.id === cartItemId)

    if (existing) {
      const updatedQty = Math.min(
        existing.quantity + qty,
        tier.maxAllowed,
        tier.available > 0 ? tier.available : tier.maxAllowed,
      )
      setCart(
        cart.map((item) => (item.id === cartItemId ? { ...item, quantity: updatedQty } : item)),
      )
    } else {
      const initialQty = Math.min(
        qty,
        tier.maxAllowed,
        tier.available > 0 ? tier.available : tier.maxAllowed,
      )
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
    if (newQty <= 0) {
      removeFromCart(cartItemId)
      return
    }

    setCart(
      cart.map((item) => {
        if (item.id !== cartItemId) return item
        const clampedQty = Math.min(
          newQty,
          item.maxAllowed,
          item.available > 0 ? item.available : item.maxAllowed,
        )
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
    const isSelected = seatModalSelectedSeats.some((s) => s.id === seat.id)
    if (isSelected) {
      setSeatModalSelectedSeats(seatModalSelectedSeats.filter((s) => s.id !== seat.id))
      setErrorMessage(null)
    } else {
      if (seatModalSelectedSeats.length < seatModalTier.maxAllowed) {
        setSeatModalSelectedSeats([...seatModalSelectedSeats, seat])
        setErrorMessage(null)
      } else {
        setErrorMessage(`Tối đa ${seatModalTier.maxAllowed} ghế cho hạng vé này.`)
      }
    }
  }

  function confirmSeatSelection() {
    if (!seatModalTier) return
    if (seatModalSelectedSeats.length === 0) {
      setErrorMessage("Vui lòng chọn ít nhất 1 ghế ngồi.")
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
                quantity: seatModalSelectedSeats.length,
                selectedSeats: seatModalSelectedSeats,
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
          quantity: seatModalSelectedSeats.length,
          maxAllowed: seatModalTier.maxAllowed,
          available: seatModalTier.available,
          selectedSeats: seatModalSelectedSeats,
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
        if (!item.selectedSeats || item.selectedSeats.length !== item.quantity) {
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
    seatModalSelectedSeats,
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
