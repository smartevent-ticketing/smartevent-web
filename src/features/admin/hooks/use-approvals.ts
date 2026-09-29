"use client"

import { adminApi } from "@/features/admin/api/admin-api"
import { catalogApi } from "@/features/catalog"
import { getApiErrorMessage } from "@/lib/api/result"
import type { components } from "@/lib/api/schema"
import { useCallback, useEffect, useState } from "react"

import type { AdminNotification } from "../model/admin-types"

type EventResponse = components["schemas"]["EventResponse"]
type EventAreaResponse = components["schemas"]["EventAreaResponse"]
type TicketTypeResponse = components["schemas"]["TicketTypeResponse"]
type TicketSalePhaseResponse = components["schemas"]["TicketSalePhaseResponse"]

export interface ApprovalDossier {
  event: EventResponse
  areas: EventAreaResponse[]
  ticketTypes: TicketTypeResponse[]
  salePhases: TicketSalePhaseResponse[]
  media: { id: string; type: string; url: string | null }[]
}

export function useAdminApprovals() {
  const [notification, setNotification] = useState<AdminNotification | null>(null)
  const [customEventIdToApprove, setCustomEventIdToApprove] = useState("")
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [pendingEvents, setPendingEvents] = useState<EventResponse[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const fetchPendingEvents = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await adminApi.getPendingEvents({
        params: { query: { page, size: 20 } },
      })
      const data = res.data?.data
      setPendingEvents((data?.content ?? []).filter((event) => Boolean(event.id)))
      setTotalPages(data?.totalPages ?? 0)
      setTotalElements(data?.totalElements ?? 0)
    } catch (error) {
      setPendingEvents([])
      setNotification({
        type: "error",
        text: getApiErrorMessage(error, "Không tải được danh sách sự kiện chờ duyệt."),
      })
    } finally {
      setIsLoading(false)
    }
  }, [page])

  useEffect(() => {
    void fetchPendingEvents()
  }, [fetchPendingEvents])

  async function loadDossier(id: string): Promise<ApprovalDossier | null> {
    setIsLoadingDetail(true)
    setNotification(null)
    try {
      const [detail, areas, ticketTypes, salePhases] = await Promise.all([
        adminApi.getAdminEventDetail(id),
        catalogApi.getAreas({ params: { path: { eventId: id } } }),
        catalogApi.getTicketTypes({ params: { path: { eventId: id } } }),
        catalogApi.getSalePhases({ params: { path: { eventId: id } } }),
      ])
      const event = detail.data?.data
      if (!event?.id || event.status !== "PENDING_APPROVAL") {
        throw new Error("Sự kiện không còn ở trạng thái chờ duyệt.")
      }
      const media = await Promise.all(
        (event.files ?? [])
          .filter((file) => Boolean(file.fileId))
          .map(async (file) => {
            let url: string | null = null
            try {
              const response = await catalogApi.getMediaUrl({
                params: { path: { fileId: file.fileId! } },
              })
              url = response.data?.data?.url ?? null
            } catch {
              // The rest of the dossier remains reviewable if one image is unavailable.
            }
            return { id: file.id ?? file.fileId!, type: file.fileType ?? "FILE", url }
          }),
      )
      return {
        event,
        areas: areas.data?.data ?? [],
        ticketTypes: ticketTypes.data?.data ?? [],
        salePhases: salePhases.data?.data ?? [],
        media,
      }
    } catch (error) {
      setNotification({
        type: "error",
        text: getApiErrorMessage(error, "Không tải được hồ sơ sự kiện. Vui lòng thử lại."),
      })
      return null
    } finally {
      setIsLoadingDetail(false)
    }
  }

  async function handleApprove(id: string): Promise<boolean> {
    setIsApproving(true)
    try {
      await adminApi.approveEvent({ params: { path: { id } } })
      setNotification({ type: "success", text: "Đã phê duyệt và công bố sự kiện." })
      await fetchPendingEvents()
      setCustomEventIdToApprove("")
      return true
    } catch (error) {
      setNotification({
        type: "error",
        text: getApiErrorMessage(error, "Phê duyệt sự kiện thất bại."),
      })
      return false
    } finally {
      setIsApproving(false)
    }
  }

  async function handleReject(id: string, reason: string): Promise<boolean> {
    setIsRejecting(true)
    try {
      await adminApi.rejectEvent({
        params: { path: { id }, query: { reason: reason.trim() } },
      })
      setNotification({ type: "info", text: "Đã từ chối hồ sơ sự kiện." })
      await fetchPendingEvents()
      setCustomEventIdToApprove("")
      return true
    } catch (error) {
      setNotification({
        type: "error",
        text: getApiErrorMessage(error, "Từ chối sự kiện thất bại."),
      })
      return false
    } finally {
      setIsRejecting(false)
    }
  }

  return {
    notification,
    setNotification,
    customEventIdToApprove,
    setCustomEventIdToApprove,
    isApproving,
    isRejecting,
    isLoading,
    isLoadingDetail,
    pendingEvents,
    page,
    setPage,
    totalPages,
    totalElements,
    handleApprove,
    handleReject,
    loadDossier,
    fetchPendingEvents,
  }
}
