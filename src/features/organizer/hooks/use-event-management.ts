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
  IssuedTicketItem,
  CreateAreaInput,
  UpdateAreaInput,
  CreateTicketTypeInput,
  CreateSalePhaseInput,
} from "../model/event-management.types"
import type { SalePhaseItem } from "../components/event-management/sale-phases-tab"
import type { EventSubmissionReadiness, SalePhaseStatus } from "@/lib/api/event-setup-contract"

export function useEventManagement(eventId: string) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()

  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [feedback, setFeedback] = useState<ActionMessage | null>(null)
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false)
  const [isCancellingEvent, setIsCancellingEvent] = useState(false)

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
      } catch (err: any) {
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

  // Area Handlers
  const handleAddArea = async (area: CreateAreaInput) => {
    try {
      const res = await organizerApi.createArea(eventId, {
        name: area.name,
        areaType: area.type,
        capacity: area.capacity,
      })
      const created = (res.data as any)?.data ?? res.data
      setAreas((prev) => [
        ...prev,
        {
          id: created?.id,
          name: created?.name || area.name,
          type: created?.areaType || area.type,
          capacity: created?.capacity || area.capacity,
        },
      ])
      setFeedback({ type: "success", text: `Đã thêm phân khu "${area.name}" thành công.` })
      refreshReadiness()
    } catch (error: any) {
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
      const updated = (res.data as any)?.data ?? res.data
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
    } catch (error: any) {
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
    } catch (error: any) {
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

      const createRes = await organizerApi.createTicketType(eventId, {
        name: ticketType.name,
        eventAreaId: targetAreaId,
        description: ticketType.description,
      })
      const createdType = (createRes as any)?.data?.data ?? (createRes as any)?.data
      const typeId = createdType?.id
      const area = areas.find((a) => a.id === targetAreaId)

      setTicketTypes((prev) => [
        ...prev,
        {
          id: typeId,
          name: createdType?.name || ticketType.name,
          price: 0,
          totalQuota: area?.capacity || 0,
          soldCount: 0,
          areaName: area?.name || "Khu vực chung",
          areaId: targetAreaId,
          description: createdType?.description || ticketType.description,
        },
      ])

      setFeedback({
        type: "success",
        text: `Đã tạo hạng vé "${ticketType.name}" thành công! Vui lòng vào tab "Đợt mở bán" để phân bổ số lượng vé và định giá.`,
      })
      refreshReadiness()
    } catch (error: any) {
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

  // Sale Phase Handler
  const handleAddSalePhase = async (phaseData: CreateSalePhaseInput) => {
    try {
      const res = await organizerApi.createSalePhase(phaseData.ticketTypeId, {
        name: phaseData.name,
        price: phaseData.price,
        quantity: phaseData.quantity,
        saleStartAt: phaseData.saleStartAt,
        saleEndAt: phaseData.saleEndAt,
        maxPerOrder: phaseData.maxPerOrder,
        maxPerUser: phaseData.maxPerUser,
      })
      const created = (res as any)?.data?.data ?? (res as any)?.data ?? res
      const matchedType = ticketTypes.find((t) => t.id === phaseData.ticketTypeId)

      const newPhase: SalePhaseItem = {
        id: created?.id || Math.random().toString(),
        ticketTypeId: phaseData.ticketTypeId,
        name: created?.name || phaseData.name,
        price: phaseData.price,
        quantity: phaseData.quantity,
        saleStartAt: created?.saleStartAt || phaseData.saleStartAt,
        saleEndAt: created?.saleEndAt || phaseData.saleEndAt,
        status: (created?.status as SalePhaseStatus) || "DRAFT",
        maxPerOrder: phaseData.maxPerOrder || 4,
        maxPerUser: phaseData.maxPerUser,
        ticketTypeName: matchedType?.name || created?.ticketTypeName,
      }

      setSalePhases((prev) => [...prev, newPhase])

      // Update ticket type display price/quota
      setTicketTypes((prev) =>
        prev.map((t) =>
          t.id === phaseData.ticketTypeId
            ? {
                ...t,
                price: t.price === 0 ? phaseData.price : t.price,
                totalQuota: (t.totalQuota || 0) + phaseData.quantity,
              }
            : t,
        ),
      )

      // Update event stats
      setEventData((prev) =>
        prev
          ? {
              ...prev,
              expectedRevenue: (prev.expectedRevenue || 0) + phaseData.price * phaseData.quantity,
              totalTickets: (prev.totalTickets || 0) + phaseData.quantity,
            }
          : prev,
      )

      setFeedback({
        type: "success",
        text: `Đã tạo đợt mở bán "${newPhase.name}" thành công!`,
      })
      refreshReadiness()
    } catch (error: any) {
      setFeedback({
        type: "error",
        text: getApiErrorMessage(error, "Không thể tạo đợt mở bán. Vui lòng thử lại."),
      })
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
    } catch (error: any) {
      setFeedback({
        type: "error",
        text: getApiErrorMessage(error, "Không thể cập nhật trạng thái đợt mở bán."),
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
    } catch (error: any) {
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
    } catch (error: any) {
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

    // Handlers
    handleAddArea,
    handleUpdateArea,
    handleDeleteArea,
    handleAddTicketType,
    handleAddSalePhase,
    handleUpdatePhaseStatus,
    handleConfirmSubmit,
    handleConfirmCancel,
    refreshReadiness,
    refresh,
  }
}
