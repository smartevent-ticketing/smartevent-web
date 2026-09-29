"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth"
import { getApiErrorMessage } from "@/lib/api/result"
import type { ActionMessage } from "@/components/shared/action-feedback"
import { organizerApi } from "../api/organizer-api"
import {
  loadEventManagementData,
  fetchSubmissionReadiness,
} from "../services/event-management.service"
import type {
  EventManagementData,
  AreaItem,
  TicketTypeItem,
  SalePhaseItem,
  IssuedTicketItem,
  CreateAreaInput,
  UpdateAreaInput,
  CreateTicketTypeInput,
  CreateSalePhaseInput,
} from "../model/event-management.types"
import type { EventSubmissionReadiness, SalePhaseStatus } from "@/lib/api/event-setup-contract"
import type { EventDetails } from "@/lib/api/event-setup-contract"
import type { components } from "@/lib/api/schema"
import { buildTicketLimitUpdateRequest } from "../model/ticket-purchase-limit"

export function useEventManagement(eventId: string) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()

  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [feedback, setFeedback] = useState<ActionMessage | null>(null)
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false)
  const [isCancellingEvent, setIsCancellingEvent] = useState(false)
  const [isSavingTicketLimit, setIsSavingTicketLimit] = useState(false)

  const [readiness, setReadiness] = useState<EventSubmissionReadiness | null>(null)
  const [isLoadingReadiness, setIsLoadingReadiness] = useState(false)

  const [eventData, setEventData] = useState<EventManagementData | null>(null)
  const [isLoadingEvent, setIsLoadingEvent] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [areas, setAreas] = useState<AreaItem[]>([])
  const [ticketTypes, setTicketTypes] = useState<TicketTypeItem[]>([])
  const [salePhases, setSalePhases] = useState<SalePhaseItem[]>([])
  const [issuedTickets, setIssuedTickets] = useState<IssuedTicketItem[]>([])

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace(`/login?callbackUrl=${encodeURIComponent(`/organizer/events/${eventId}`)}`)
    }
  }, [isAuthLoading, isAuthenticated, router, eventId])

  // Load event management data
  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) return

    let isMounted = true

    async function loadData() {
      setIsLoadingEvent(true)
      setLoadError(null)

      try {
        const result = await loadEventManagementData(eventId)
        if (!isMounted) return

        if (result.event) {
          setEventData(result.event)
        } else {
          setLoadError(result.errorMessage || "Không thể tải thông tin sự kiện.")
          setFeedback({
            type: "error",
            text: result.errorMessage || "Không thể tải thông tin sự kiện.",
          })
        }

        setAreas(result.areas)
        setSalePhases(result.salePhases)
        setTicketTypes(result.ticketTypes)
        setIssuedTickets(result.issuedTickets)
        setReadiness(result.readiness)
      } catch (err: unknown) {
        if (!isMounted) return
        const msg = getApiErrorMessage(err, "Không thể tải dữ liệu sự kiện.")
        setLoadError(msg)
        setFeedback({ type: "error", text: msg })
      } finally {
        if (isMounted) setIsLoadingEvent(false)
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [eventId, isAuthLoading, isAuthenticated, refreshTrigger])

  // Refresh submission readiness
  const refreshReadiness = useCallback(async () => {
    setIsLoadingReadiness(true)
    try {
      const data = await fetchSubmissionReadiness(eventId)
      if (data) setReadiness(data)
    } finally {
      setIsLoadingReadiness(false)
    }
  }, [eventId])

  const handleUpdateTicketLimit = async (limit: number | undefined) => {
    setIsSavingTicketLimit(true)
    try {
      const currentResponse = await organizerApi.getEvent(eventId)
      const current = currentResponse.data?.data as EventDetails | undefined
      if (!current) throw new Error("Không thể tải thông tin sự kiện để cập nhật giới hạn vé.")
      const updatedResponse = await organizerApi.updateEvent(
        eventId,
        buildTicketLimitUpdateRequest(current, limit),
      )
      const updated = updatedResponse.data?.data as EventDetails | undefined
      setEventData((previous) =>
        previous
          ? { ...previous, maxTicketsPerUser: updated?.maxTicketsPerUser ?? limit ?? null }
          : previous,
      )
      setFeedback({ type: "success", text: "Đã cập nhật giới hạn vé mỗi tài khoản." })
    } catch (error) {
      setFeedback({
        type: "error",
        text: getApiErrorMessage(error, "Không thể cập nhật giới hạn vé. Vui lòng thử lại."),
      })
      throw error
    } finally {
      setIsSavingTicketLimit(false)
    }
  }

  // Area Handlers
  const handleAddArea = async (area: CreateAreaInput) => {
    try {
      const res = await organizerApi.createArea(eventId, {
        name: area.name,
        areaType: area.type,
        capacity: area.capacity,
      })
      const created = res.data?.data
      const createdId = created?.id
      if (!createdId) throw new Error("Máy chủ chưa xác nhận phân khu vừa tạo.")
      setAreas((prev) => [
        ...prev,
        {
          id: createdId,
          name: created?.name || area.name,
          type: created?.areaType || area.type,
          capacity: created?.capacity || area.capacity,
        },
      ])
      setFeedback({ type: "success", text: `Đã thêm phân khu "${area.name}" thành công.` })
      refreshReadiness()
    } catch (error: unknown) {
      setFeedback({
        type: "error",
        text: getApiErrorMessage(error, `Không thể tạo phân khu "${area.name}". Vui lòng thử lại.`),
      })
      throw error
    }
  }

  const handleUpdateArea = async (areaId: string, area: UpdateAreaInput) => {
    try {
      const res = await organizerApi.updateArea(areaId, {
        name: area.name,
        areaType: area.type,
        capacity: area.capacity,
      })
      const updated = res.data?.data
      setAreas((prev) =>
        prev.map((a) =>
          a.id === areaId
            ? {
                ...a,
                name: updated?.name || area.name,
                type: updated?.areaType || area.type,
                capacity: updated?.capacity || area.capacity,
              }
            : a,
        ),
      )
      setFeedback({ type: "success", text: `Đã cập nhật phân khu "${area.name}" thành công.` })
      refreshReadiness()
    } catch (error: unknown) {
      const msg = getApiErrorMessage(error, `Không thể cập nhật phân khu "${area.name}".`)
      setFeedback({ type: "error", text: msg })
      throw error
    }
  }

  const handleDeleteArea = async (areaId: string) => {
    try {
      await organizerApi.deleteArea(areaId)
      setAreas((prev) => prev.filter((a) => a.id !== areaId))
      setFeedback({ type: "success", text: "Đã xóa phân khu thành công." })
      refreshReadiness()
    } catch (error: unknown) {
      const msg = getApiErrorMessage(error, "Không thể xóa phân khu.")
      setFeedback({ type: "error", text: msg })
      throw error
    }
  }

  // Ticket Type Handler - Manual sale phase flow (NO AUTO-CREATION)
  const handleAddTicketType = async (ticketType: CreateTicketTypeInput) => {
    try {
      const targetAreaId = ticketType.areaId || areas[0]?.id
      if (!targetAreaId) {
        setFeedback({
          type: "error",
          text: "Vui lòng tạo ít nhất một phân khu trước khi tạo hạng vé.",
        })
        return
      }

      const priceTag = ticketType.price && ticketType.price > 0 ? `[PRICE:${ticketType.price}]` : ""
      const combinedDesc = ticketType.description
        ? `${ticketType.description.trim()}${priceTag ? `\n${priceTag}` : ""}`
        : priceTag || undefined

      const createRes = await organizerApi.createTicketType(eventId, {
        name: ticketType.name,
        eventAreaId: targetAreaId,
        description: combinedDesc,
      })
      const createdType = createRes.data?.data
      const typeId = createdType?.id
      if (!typeId) throw new Error("Backend không trả mã hạng vé vừa tạo.")
      const area = areas.find((a) => a.id === targetAreaId)

      setTicketTypes((prev) => [
        ...prev,
        {
          id: typeId,
          name: createdType?.name || ticketType.name,
          price: ticketType.price || 0,
          basePrice: ticketType.price || 0,
          totalQuota: area?.capacity || 0,
          soldCount: 0,
          areaName: area?.name || "Khu vực chung",
          areaId: targetAreaId,
          description: ticketType.description || "",
        },
      ])

      setFeedback({
        type: "success",
        text: `Đã tạo hạng vé "${ticketType.name}" thành công! Vui lòng vào tab "Đợt mở bán" để phân bổ số lượng vé và định giá.`,
      })
      refreshReadiness()
    } catch (error: unknown) {
      setFeedback({
        type: "error",
        text: getApiErrorMessage(
          error,
          `Không thể tạo hạng vé "${ticketType.name}". Vui lòng thử lại.`,
        ),
      })
      throw error
    }
  }

  const handleUpdateTicketType = async (id: string, ticketType: CreateTicketTypeInput) => {
    try {
      if (!ticketType.areaId) throw new Error("Vui lòng chọn phân khu.")
      const priceTag = ticketType.price && ticketType.price > 0 ? `[PRICE:${ticketType.price}]` : ""
      const description = [ticketType.description?.trim(), priceTag].filter(Boolean).join("\n")
      await organizerApi.updateTicketType(id, {
        eventAreaId: ticketType.areaId,
        name: ticketType.name.trim(),
        description: description || undefined,
      })
      setRefreshTrigger((previous) => previous + 1)
      setFeedback({ type: "success", text: "Đã cập nhật hạng vé." })
    } catch (error) {
      setFeedback({ type: "error", text: getApiErrorMessage(error, "Không thể cập nhật hạng vé.") })
      throw error
    }
  }

  const handleDeleteTicketType = async (id: string) => {
    try {
      await organizerApi.deleteTicketType(id)
      setRefreshTrigger((previous) => previous + 1)
      setFeedback({ type: "success", text: "Đã xóa hạng vé." })
    } catch (error) {
      setFeedback({ type: "error", text: getApiErrorMessage(error, "Không thể xóa hạng vé.") })
      throw error
    }
  }

  // Sale Phase Handler (supports single or multiple ticket types)
  const handleAddSalePhase = async (phaseData: CreateSalePhaseInput | CreateSalePhaseInput[]) => {
    const phases = Array.isArray(phaseData) ? phaseData : [phaseData]
    if (phases.length === 0) return

    const createdPhaseIds: string[] = []

    try {
      const results: components["schemas"]["TicketSalePhaseResponse"][] = []
      for (const p of phases) {
        const res = await organizerApi.createSalePhase(p.ticketTypeId, {
          name: p.name,
          price: p.price,
          quantity: p.quantity,
          saleStartAt: p.saleStartAt,
          saleEndAt: p.saleEndAt,
          maxPerOrder: p.maxPerOrder,
          maxPerUser: p.maxPerUser,
        })
        const created = res.data?.data
        if (!created?.id) throw new Error("Backend không trả mã đợt bán vừa tạo.")
        createdPhaseIds.push(created.id)
        results.push(created)
      }

      const newPhases: SalePhaseItem[] = phases.map((p, idx) => {
        const created = results[idx]
        const matchedType = ticketTypes.find((t) => t.id === p.ticketTypeId)
        return {
          id: created!.id!,
          ticketTypeId: p.ticketTypeId,
          name: created?.name || p.name,
          price: p.price,
          quantity: p.quantity,
          saleStartAt: created?.saleStartAt || p.saleStartAt,
          saleEndAt: created?.saleEndAt || p.saleEndAt,
          status: (created?.status as SalePhaseStatus) || "DRAFT",
          maxPerOrder: p.maxPerOrder || 4,
          maxPerUser: p.maxPerUser,
          ticketTypeName: matchedType?.name || created?.ticketTypeName,
        }
      })

      setSalePhases((prev) => [...prev, ...newPhases])

      // Update ticket type display price/quota
      setTicketTypes((prev) =>
        prev.map((t) => {
          const added = phases.find((p) => p.ticketTypeId === t.id)
          if (!added) return t
          const newBase = added.basePrice || t.basePrice || (t.price === 0 ? added.price : t.price)
          return {
            ...t,
            price: newBase,
            basePrice: newBase,
            totalQuota: (t.totalQuota || 0) + added.quantity,
          }
        }),
      )

      // Update event stats
      const addedRevenue = phases.reduce((sum, p) => sum + p.price * p.quantity, 0)
      const addedTickets = phases.reduce((sum, p) => sum + p.quantity, 0)
      setEventData((prev) =>
        prev
          ? {
              ...prev,
              expectedRevenue: (prev.expectedRevenue || 0) + addedRevenue,
              totalTickets: (prev.totalTickets || 0) + addedTickets,
            }
          : prev,
      )

      setFeedback({
        type: "success",
        text:
          phases.length > 1
            ? `Đã tạo đợt mở bán "${phases[0]?.name}" cho ${phases.length} hạng vé thành công!`
            : `Đã tạo đợt mở bán "${phases[0]?.name}" thành công!`,
      })
      refreshReadiness()
    } catch (error: unknown) {
      // Revert partially created phases in this batch so the database is never left dirty
      if (createdPhaseIds.length > 0) {
        console.warn(
          `[Batch Create] Reverting ${createdPhaseIds.length} partially created phases due to error...`,
        )
        await Promise.allSettled(createdPhaseIds.map((id) => organizerApi.deleteSalePhase(id)))
      }
      setRefreshTrigger((prev) => prev + 1)
      setFeedback({
        type: "error",
        text: getApiErrorMessage(error, "Không thể tạo đợt mở bán. Vui lòng thử lại."),
      })
      throw error
    }
  }

  const handleUpdateSalePhase = async (id: string, phase: CreateSalePhaseInput) => {
    try {
      await organizerApi.updateSalePhase(id, {
        name: phase.name.trim(),
        price: phase.price,
        quantity: phase.quantity,
        saleStartAt: phase.saleStartAt,
        saleEndAt: phase.saleEndAt,
        maxPerOrder: phase.maxPerOrder,
        maxPerUser: phase.maxPerUser,
      })
      setRefreshTrigger((previous) => previous + 1)
      setFeedback({ type: "success", text: "Đã cập nhật đợt bán." })
    } catch (error) {
      setFeedback({ type: "error", text: getApiErrorMessage(error, "Không thể cập nhật đợt bán.") })
      throw error
    }
  }

  // Update Sale Phase Status
  const handleUpdatePhaseStatus = async (phaseId: string, newStatus: SalePhaseStatus) => {
    try {
      await organizerApi.updateSalePhaseStatus(phaseId, newStatus)
      setSalePhases((prev) => prev.map((p) => (p.id === phaseId ? { ...p, status: newStatus } : p)))
      setFeedback({
        type: "success",
        text: "Đã cập nhật trạng thái đợt mở bán thành công.",
      })
      refreshReadiness()
    } catch (error: unknown) {
      setFeedback({
        type: "error",
        text: getApiErrorMessage(error, "Không thể cập nhật trạng thái đợt mở bán."),
      })
      throw error
    }
  }

  // Delete Sale Phase Handler
  const handleDeleteSalePhase = async (phaseId: string) => {
    try {
      await organizerApi.deleteSalePhase(phaseId)
      const targetPhase = salePhases.find((p) => p.id === phaseId)
      setSalePhases((prev) => prev.filter((p) => p.id !== phaseId))

      // Recalculate event stats
      if (targetPhase) {
        setEventData((prev) =>
          prev
            ? {
                ...prev,
                expectedRevenue: Math.max(
                  0,
                  (prev.expectedRevenue || 0) - targetPhase.price * targetPhase.quantity,
                ),
                totalTickets: Math.max(0, (prev.totalTickets || 0) - targetPhase.quantity),
              }
            : prev,
        )
      }

      setFeedback({
        type: "success",
        text: `Đã xóa đợt mở bán thành công. Số vé đã được hoàn trả về sức chứa khán đài.`,
      })
      refreshReadiness()
    } catch (error: unknown) {
      setFeedback({
        type: "error",
        text: getApiErrorMessage(error, "Không thể xóa đợt mở bán."),
      })
      throw error
    }
  }

  // Event Approval Submission
  const handleConfirmSubmit = async () => {
    setIsSubmittingApproval(true)
    try {
      await organizerApi.submitEvent(eventId)
      setEventData((prev) => (prev ? { ...prev, status: "PENDING_APPROVAL" } : null))
      setFeedback({
        type: "success",
        text: "Sự kiện đã được gửi lên ban quản trị xét duyệt thành công.",
      })
    } catch (error: unknown) {
      setFeedback({
        type: "error",
        text: getApiErrorMessage(
          error,
          "Gửi duyệt sự kiện thất bại. Vui lòng kiểm tra lại điều kiện sự kiện.",
        ),
      })
      throw error
    } finally {
      setIsSubmittingApproval(false)
    }
  }

  // Event Cancellation
  const handleConfirmCancel = async (reason: string) => {
    setIsCancellingEvent(true)
    try {
      await organizerApi.cancelEvent(eventId, reason)
      setEventData((prev) => (prev ? { ...prev, status: "CANCELLED" } : null))
      setFeedback({ type: "info", text: `Sự kiện đã được hủy: ${reason}` })
    } catch (error: unknown) {
      setFeedback({
        type: "error",
        text: getApiErrorMessage(error, "Hủy sự kiện thất bại. Vui lòng thử lại."),
      })
      throw error
    } finally {
      setIsCancellingEvent(false)
    }
  }

  const refresh = () => setRefreshTrigger((prev) => prev + 1)

  return {
    // Auth & loading
    isAuthLoading,
    isLoadingEvent,
    loadError,
    setLoadError,
    setIsLoadingEvent,

    // Data
    eventData,
    areas,
    ticketTypes,
    salePhases,
    issuedTickets,
    readiness,
    isLoadingReadiness,

    // Feedback
    feedback,
    setFeedback,

    // Modals & Action states
    isSubmittingApproval,
    isCancellingEvent,
    isSavingTicketLimit,

    // Handlers
    handleAddArea,
    handleUpdateArea,
    handleDeleteArea,
    handleAddTicketType,
    handleUpdateTicketType,
    handleDeleteTicketType,
    handleAddSalePhase,
    handleUpdateSalePhase,
    handleUpdatePhaseStatus,
    handleDeleteSalePhase,
    handleConfirmSubmit,
    handleConfirmCancel,
    handleUpdateTicketLimit,
    refreshReadiness,
    refresh,
  }
}
