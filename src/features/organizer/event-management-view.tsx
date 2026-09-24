"use client"

import { getApiErrorMessage } from "@/lib/api/result"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Send,
  Ban,
  LayoutDashboard,
  Layers,
  Ticket,
  Clock,
  QrCode,
  Loader2,
  ImageIcon,
  ExternalLink,
} from "lucide-react"
import { ActionFeedback } from "@/components/shared/action-feedback"
import type { ActionMessage } from "@/components/shared/action-feedback"
import { organizerApi } from "@/features/organizer/api/organizer-api"
import { OverviewTab } from "@/features/organizer/components/event-management/overview-tab"
import { MediaTab } from "@/features/organizer/components/event-management/media-tab"
import { AreasSeatsTab } from "@/features/organizer/components/event-management/areas-seats-tab"
import { TicketTypesTab } from "@/features/organizer/components/event-management/ticket-types-tab"
import { SalePhasesTab } from "@/features/organizer/components/event-management/sale-phases-tab"
import type { SalePhaseItem } from "@/features/organizer/components/event-management/sale-phases-tab"
import { SubmissionReadinessCard } from "@/features/organizer/components/event-management/submission-readiness-card"
import { IssuedTicketsTab } from "@/features/organizer/components/event-management/issued-tickets-tab"
import { SubmitConfirmationModal } from "@/features/organizer/components/event-management/submit-confirmation-modal"
import { CancelEventModal } from "@/features/organizer/components/event-management/cancel-event-modal"
import type { EventSubmissionReadiness, SalePhaseStatus } from "@/lib/api/event-setup-contract"

interface EventManagementViewProps {
  eventId: string
}

export function EventManagementView({ eventId }: EventManagementViewProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "media" | "areas" | "ticket-types" | "sale-phases" | "tickets"
  >("overview")
  const [feedback, setFeedback] = useState<ActionMessage | null>(null)
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false)
  const [isCancellingEvent, setIsCancellingEvent] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  const [readiness, setReadiness] = useState<EventSubmissionReadiness | null>(null)
  const [isLoadingReadiness, setIsLoadingReadiness] = useState(false)

  const [eventData, setEventData] = useState<{
    id: string
    name: string
    status: string
    location?: string
    date?: string
    startTime?: string
    endTime?: string
    expectedRevenue?: number
    totalTickets?: number
  } | null>(null)
  const [isLoadingEvent, setIsLoadingEvent] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [areas, setAreas] = useState<any[]>([])
  const [ticketTypes, setTicketTypes] = useState<any[]>([])
  const [salePhases, setSalePhases] = useState<SalePhaseItem[]>([])
  const [issuedTickets, setIssuedTickets] = useState<any[]>([])
  // Fetch real event data on load
  useEffect(() => {
    let isMounted = true
    async function loadEvent() {
      setIsLoadingEvent(true)
      setLoadError(null)

      const [eventRes, areasRes, typesRes, phasesRes, ticketsRes, readinessRes] =
        await Promise.allSettled([
          organizerApi.getEvent(eventId),
          organizerApi.getAreas(eventId),
          organizerApi.getTicketTypes(eventId),
          organizerApi.getSalePhases(eventId),
          organizerApi.getEventTickets(eventId),
          organizerApi.getSubmissionReadiness(eventId),
        ])

      if (!isMounted) return

      // 1. Xử lý thông tin chính của sự kiện (Event Core)
      if (eventRes.status === "fulfilled" && eventRes.value?.data) {
        const ev = (eventRes.value.data as any)?.data ?? eventRes.value.data
        // Revenue & tickets sẽ được tính từ phases bên dưới
        setEventData({
          id: ev.id,
          name: ev.name,
          status: ev.status,
          location: ev.venue?.name
            ? `${ev.venue.name}, ${ev.venue.city || ""}`
            : "Chưa cấu hình địa điểm",
          date: ev.startTime
            ? new Date(ev.startTime).toLocaleString("vi-VN")
            : "Chưa cấu hình thời gian",
          startTime: ev.startTime,
          endTime: ev.endTime,
          expectedRevenue: 0,
          totalTickets: 0,
        })
      } else {
        const errMsg =
          eventRes.status === "rejected"
            ? eventRes.reason?.message || "Không thể tải thông tin sự kiện."
            : "Dữ liệu sự kiện không hợp lệ."
        setLoadError(errMsg)
        setFeedback({ type: "error", text: errMsg })
      }

      // Readiness Check
      if (readinessRes.status === "fulfilled" && readinessRes.value?.data) {
        const rData = ((readinessRes.value.data as any)?.data ??
          readinessRes.value.data) as EventSubmissionReadiness
        setReadiness(rData)
      }

      // 2. Xử lý phân khu (Areas)
      if (areasRes.status === "fulfilled" && areasRes.value?.data) {
        const rawAreas = ((areasRes.value.data as any)?.data ?? areasRes.value.data) as any[]
        setAreas(
          Array.isArray(rawAreas)
            ? rawAreas.map((a) => ({
                id: a.id,
                name: a.name,
                type: a.areaType || a.type || "SEATED",
                capacity: a.capacity || 0,
              }))
            : [],
        )
      } else if (areasRes.status === "rejected") {
        setFeedback({ type: "error", text: "Không thể tải danh sách phân khu." })
      }

      // 3. Xử lý đợt mở bán (Sale Phases) — cần trước ticket types để tính giá
      let rawPhases: any[] = []
      if (phasesRes.status === "fulfilled" && phasesRes.value?.data) {
        const phasesData = ((phasesRes.value.data as any)?.data ?? phasesRes.value.data) as any[]
        if (Array.isArray(phasesData)) {
          rawPhases = phasesData
          setSalePhases(
            rawPhases.map((p) => ({
              id: p.id,
              ticketTypeId: p.ticketTypeId,
              name: p.name,
              price: Number(p.price) || 0,
              quantity: Number(p.quantity) || 0,
              saleStartAt: p.saleStartAt || p.startTime,
              saleEndAt: p.saleEndAt || p.endTime,
              status: (p.status as SalePhaseStatus) || "DRAFT",
              maxPerOrder: p.maxPerOrder || 4,
              maxPerUser: p.maxPerUser,
              ticketTypeName: p.ticketTypeName,
            })),
          )
        }
      } else if (phasesRes.status === "rejected") {
        setFeedback({ type: "error", text: "Không thể tải danh sách đợt mở bán." })
      }

      // Tính revenue & tickets thực từ phases
      const totalRevenue = rawPhases.reduce(
        (sum, p) => sum + (Number(p.price) || 0) * (Number(p.quantity) || 0),
        0,
      )
      const totalTickets = rawPhases.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0)
      setEventData((prev) =>
        prev ? { ...prev, expectedRevenue: totalRevenue, totalTickets } : prev,
      )

      // 4. Xử lý hạng vé (Ticket Types)
      if (typesRes.status === "fulfilled" && typesRes.value?.data) {
        const rawTypes = ((typesRes.value.data as any)?.data ?? typesRes.value.data) as any[]
        setTicketTypes(
          Array.isArray(rawTypes)
            ? rawTypes.map((t) => {
                const matchedPhase = rawPhases.find((p) => p.ticketTypeId === t.id)
                return {
                  id: t.id,
                  name: t.name,
                  price: matchedPhase?.price ?? t.price ?? 0,
                  totalQuota: matchedPhase?.quantity ?? t.totalQuota ?? 0,
                  soldCount: matchedPhase?.soldCount ?? t.soldCount ?? 0,
                  areaName: t.areaName || "Khu vực chung",
                  description: t.description || "",
                }
              })
            : [],
        )
      } else if (typesRes.status === "rejected") {
        setFeedback({ type: "error", text: "Không thể tải danh sách hạng vé." })
      }

      // 5. Xử lý vé đã phát hành (Issued Tickets)
      if (ticketsRes.status === "fulfilled" && ticketsRes.value?.data) {
        const rawTickets = ((ticketsRes.value.data as any)?.data ?? ticketsRes.value.data) as any[]
        setIssuedTickets(
          Array.isArray(rawTickets)
            ? rawTickets.map((tk) => ({
                id: tk.id,
                ticketCode: tk.ticketCode || tk.code || tk.id,
                ticketTypeName: tk.ticketTypeName || "Vé sự kiện",
                areaName: tk.areaName,
                seatName: tk.seatName || tk.seatCode,
                status:
                  tk.status === "ISSUED"
                    ? "ACTIVE"
                    : tk.status === "USED"
                      ? "CHECKED_IN"
                      : tk.status || "ACTIVE",
                checkedInAt: tk.usedAt || tk.checkedInAt,
                issuedAt: tk.issuedAt || tk.createdAt,
              }))
            : [],
        )
      } else if (ticketsRes.status === "rejected") {
        setFeedback({ type: "error", text: "Không thể tải danh sách vé đã phát hành." })
      }

      if (isMounted) setIsLoadingEvent(false)
    }

    loadEvent()
    return () => {
      isMounted = false
    }
  }, [eventId])

  const fetchReadiness = async () => {
    setIsLoadingReadiness(true)
    try {
      const res = await organizerApi.getSubmissionReadiness(eventId)
      const data = ((res as any)?.data?.data ??
        (res as any)?.data ??
        res) as EventSubmissionReadiness
      setReadiness(data)
    } catch {
      // ignore
    } finally {
      setIsLoadingReadiness(false)
    }
  }

  // 1. Thêm phân khu: Dùng ID thật từ response của server, lỗi thì báo lỗi thật
  const handleAddArea = async (area: {
    name: string
    type: "STANDING" | "SEATED"
    capacity: number
  }) => {
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
      fetchReadiness()
    } catch (error: any) {
      setFeedback({
        type: "error",
        text: getApiErrorMessage(error, `Không thể tạo phân khu "${area.name}". Vui lòng thử lại.`),
      })
    }
  }

  // Cập nhật phân khu (Đổi tên, loại SEATED <-> STANDING, sức chứa)
  const handleUpdateArea = async (
    areaId: string,
    area: {
      name: string
      type: "STANDING" | "SEATED"
      capacity: number
    },
  ) => {
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
      fetchReadiness()
    } catch (error: any) {
      const msg = getApiErrorMessage(error, `Không thể cập nhật phân khu "${area.name}".`)
      setFeedback({
        type: "error",
        text: msg,
      })
      throw error
    }
  }

  // Xóa phân khu
  const handleDeleteArea = async (areaId: string) => {
    try {
      await organizerApi.deleteArea(areaId)
      setAreas((prev) => prev.filter((a) => a.id !== areaId))
      setFeedback({ type: "success", text: "Đã xóa phân khu thành công." })
      fetchReadiness()
    } catch (error: any) {
      const msg = getApiErrorMessage(error, "Không thể xóa phân khu.")
      setFeedback({
        type: "error",
        text: msg,
      })
      throw error
    }
  }

  // 2. Thêm hạng vé: Tạo hạng vé và tự động khởi tạo đợt mở bán nếu có cấu hình giá & số lượng
  const handleAddTicketType = async (ticketType: {
    name: string
    price: number
    totalQuota: number
    areaId?: string
    description?: string
  }) => {
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

      let autoCreatedPhase = false
      const phaseQuantity = ticketType.totalQuota || area?.capacity || 100
      if (ticketType.price > 0 && typeId) {
        try {
          const nowIso = new Date().toISOString()
          const endIso = eventData?.endTime
            ? new Date(eventData.endTime).toISOString()
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

          const phaseRes = await organizerApi.createSalePhase(typeId, {
            name: "Mở bán chính thức",
            price: ticketType.price,
            quantity: phaseQuantity,
            saleStartAt: nowIso,
            saleEndAt: endIso,
            maxPerOrder: 4,
          })
          const createdPhase = (phaseRes as any)?.data?.data ?? (phaseRes as any)?.data ?? phaseRes
          const newPhase: SalePhaseItem = {
            id: createdPhase?.id || Math.random().toString(),
            ticketTypeId: typeId,
            name: createdPhase?.name || "Mở bán chính thức",
            price: ticketType.price,
            quantity: phaseQuantity,
            saleStartAt: createdPhase?.saleStartAt || nowIso,
            saleEndAt: createdPhase?.saleEndAt || endIso,
            status: (createdPhase?.status as SalePhaseStatus) || "DRAFT",
            maxPerOrder: 4,
            ticketTypeName: createdType?.name || ticketType.name,
          }
          setSalePhases((prev) => [...prev, newPhase])
          setEventData((prev) =>
            prev
              ? {
                  ...prev,
                  expectedRevenue: (prev.expectedRevenue || 0) + ticketType.price * phaseQuantity,
                  totalTickets: (prev.totalTickets || 0) + phaseQuantity,
                }
              : prev,
          )
          autoCreatedPhase = true
        } catch (phaseErr) {
          console.warn("Could not auto-create initial sale phase:", phaseErr)
        }
      }

      setTicketTypes((prev) => [
        ...prev,
        {
          id: typeId,
          name: createdType?.name || ticketType.name,
          price: ticketType.price || 0,
          totalQuota: phaseQuantity,
          soldCount: 0,
          areaName: area?.name || "Khu vực chung",
          description: createdType?.description || ticketType.description,
        },
      ])
      setFeedback({
        type: "success",
        text: autoCreatedPhase
          ? `Đã tạo hạng vé "${ticketType.name}" và khởi tạo đợt mở bán thành công!`
          : `Đã tạo hạng vé "${ticketType.name}" thành công. Vui lòng cấu hình đợt mở bán để định giá và phân bổ số lượng.`,
      })
      fetchReadiness()
    } catch (error: any) {
      setFeedback({
        type: "error",
        text: getApiErrorMessage(
          error,
          `Không thể tạo hạng vé "${ticketType.name}". Vui lòng thử lại.`,
        ),
      })
    }
  }

  // 2b. Thêm đợt mở bán (Sale Phase)
  const handleAddSalePhase = async (phaseData: {
    ticketTypeId: string
    name: string
    price: number
    quantity: number
    saleStartAt: string
    saleEndAt: string
    maxPerOrder?: number
    maxPerUser?: number
  }) => {
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
      setTicketTypes((prev) =>
        prev.map((t) =>
          t.id === phaseData.ticketTypeId && (t.price === 0 || t.totalQuota === 0)
            ? { ...t, price: phaseData.price, totalQuota: (t.totalQuota || 0) + phaseData.quantity }
            : t,
        ),
      )
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
      fetchReadiness()
    } catch (error: any) {
      setFeedback({
        type: "error",
        text: getApiErrorMessage(error, "Không thể tạo đợt mở bán. Vui lòng thử lại."),
      })
      throw error
    }
  }

  // 2c. Cập nhật trạng thái đợt mở bán
  const handleUpdatePhaseStatus = async (phaseId: string, newStatus: SalePhaseStatus) => {
    try {
      await organizerApi.updateSalePhaseStatus(phaseId, newStatus)
      setSalePhases((prev) => prev.map((p) => (p.id === phaseId ? { ...p, status: newStatus } : p)))
      setFeedback({
        type: "success",
        text: `Đã cập nhật trạng thái đợt mở bán thành công.`,
      })
      fetchReadiness()
    } catch (error: any) {
      setFeedback({
        type: "error",
        text: getApiErrorMessage(error, "Không thể cập nhật trạng thái đợt mở bán."),
      })
    }
  }

  // 3. Gửi duyệt: Chỉ cập nhật trạng thái khi server thành công, thất bại thì giữ nguyên DRAFT
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
    } finally {
      setIsSubmittingApproval(false)
      setShowSubmitModal(false)
    }
  }

  // 4. Hủy sự kiện: Chỉ cập nhật CANCELLED khi server xác nhận hủy thành công
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
    } finally {
      setIsCancellingEvent(false)
      setShowCancelModal(false)
    }
  }

  if (isLoadingEvent) {
    return (
      <div className="py-24 text-center space-y-4">
        <Loader2 className="size-8 animate-spin text-primary mx-auto" />
        <p className="text-sm font-medium text-on-surface-variant">Đang tải thông tin sự kiện...</p>
      </div>
    )
  }

  if (loadError && !eventData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
          <Link
            href="/organizer/events"
            className="inline-flex items-center gap-1.5 hover:text-primary transition"
          >
            <ArrowLeft className="size-3.5" />
            <span>Danh sách sự kiện</span>
          </Link>
        </div>
        <ActionFeedback message={feedback} onDismiss={() => setFeedback(null)} />
        <div className="bg-white border border-red-200 rounded-3xl p-12 text-center space-y-4 shadow-xs">
          <Ban className="size-10 text-red-500 mx-auto" />
          <h3 className="text-base font-bold text-on-surface">Không thể tải thông tin sự kiện</h3>
          <p className="text-xs text-on-surface-variant max-w-md mx-auto">{loadError}</p>
          <Link
            href="/organizer/events"
            className="inline-block px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl"
          >
            Quay lại danh sách
          </Link>
        </div>
      </div>
    )
  }

  if (!eventData) return null

  const isDraft = eventData.status === "DRAFT"
  const isPending = eventData.status === "PENDING_APPROVAL"
  const isPublished = eventData.status === "PUBLISHED"
  const isCancelled = eventData.status === "CANCELLED"

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-on-surface-variant">
          <Link
            href="/organizer/events"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-outline-variant/60 hover:text-primary hover:border-primary/40 shadow-2xs font-semibold transition"
          >
            <ArrowLeft className="size-3.5" />
            <span>Danh sách sự kiện</span>
          </Link>
          <span className="text-outline-variant font-bold">/</span>
          <span className="font-semibold text-on-surface truncate max-w-[240px] sm:max-w-md">
            {eventData.name}
          </span>
        </div>

        {isPublished && (
          <Link
            href={`/events/${eventId}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-bold transition"
          >
            <span>Trang bán vé</span>
            <ExternalLink className="size-3.5" />
          </Link>
        )}
      </div>

      <ActionFeedback message={feedback} onDismiss={() => setFeedback(null)} />

      {/* Main Event Header Card */}
      <div className="relative overflow-hidden bg-white border border-outline-variant/60 rounded-3xl p-6 sm:p-8 shadow-xs">
        {/* Soft background ambient gradient glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-gradient-to-br from-primary/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="size-16 sm:size-20 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
              <Ticket className="size-8 sm:size-10" />
            </div>

            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-on-surface">
                  {eventData.name}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    isPublished
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : isPending
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : isCancelled
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-slate-100 text-slate-700 border border-slate-300"
                  }`}
                >
                  <span
                    className={`size-1.5 rounded-full ${
                      isPublished
                        ? "bg-green-600"
                        : isPending
                          ? "bg-amber-600 animate-pulse"
                          : isCancelled
                            ? "bg-red-600"
                            : "bg-slate-500"
                    }`}
                  />
                  {isPublished
                    ? "Đã xuất bản (PUBLISHED)"
                    : isPending
                      ? "Chờ duyệt (PENDING)"
                      : isCancelled
                        ? "Đã hủy (CANCELLED)"
                        : "Bản nháp (DRAFT)"}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-on-surface-variant font-medium">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-low border border-outline-variant/40">
                  <Calendar className="size-3.5 text-primary" />
                  <span>{eventData.date}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-low border border-outline-variant/40">
                  <MapPin className="size-3.5 text-primary" />
                  <span className="max-w-[260px] sm:max-w-md truncate">{eventData.location}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 self-end lg:self-center shrink-0">
            {isDraft && (
              <button
                type="button"
                onClick={() => {
                  if (readiness && !readiness.ready) {
                    const firstBlocker =
                      readiness.blockers?.[0] || "Sự kiện chưa đủ điều kiện gửi duyệt."
                    setFeedback({
                      type: "error",
                      text: `${firstBlocker} Vui lòng xem bảng tiêu chuẩn kiểm duyệt bên dưới.`,
                    })
                    return
                  }
                  setShowSubmitModal(true)
                }}
                className={`px-5 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer shadow-xs inline-flex items-center gap-2 ${
                  readiness && !readiness.ready
                    ? "bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200"
                    : "bg-primary hover:bg-primary-hover text-white shadow-primary/20"
                }`}
              >
                <Send className="size-3.5" />
                <span>Gửi duyệt sự kiện</span>
              </button>
            )}

            {!isCancelled && (
              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                className="px-4 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl transition cursor-pointer inline-flex items-center gap-1.5"
              >
                <Ban className="size-3.5" />
                <span>Hủy sự kiện</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick event stats bar */}
        <div className="mt-6 pt-5 border-t border-outline-variant/40 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[11px] text-on-surface-variant block font-medium">
              Tổng số vé
            </span>
            <span className="text-sm font-bold font-mono text-on-surface">
              {eventData.totalTickets?.toLocaleString("vi-VN") || 0} vé
            </span>
          </div>
          <div>
            <span className="text-[11px] text-on-surface-variant block font-medium">
              Doanh thu dự kiến
            </span>
            <span className="text-sm font-bold font-mono text-primary">
              {eventData.expectedRevenue?.toLocaleString("vi-VN") || 0} ₫
            </span>
          </div>
          <div>
            <span className="text-[11px] text-on-surface-variant block font-medium">
              Phân khu / Khán đài
            </span>
            <span className="text-sm font-bold font-mono text-on-surface">
              {areas.length} khu vực
            </span>
          </div>
          <div>
            <span className="text-[11px] text-on-surface-variant block font-medium">
              Đợt mở bán
            </span>
            <span className="text-sm font-bold font-mono text-on-surface">
              {salePhases.length} đợt
            </span>
          </div>
        </div>
      </div>

      {/* Submission Readiness Card (for DRAFT events) */}
      <SubmissionReadinessCard
        readiness={readiness}
        isLoading={isLoadingReadiness}
        isDraft={isDraft}
        onRefresh={fetchReadiness}
        onSwitchTab={(t) => setActiveTab(t)}
        onSubmitForApproval={() => setShowSubmitModal(true)}
      />

      {/* Tabs Navigation */}
      <div className="border-b border-outline-variant/60 flex items-center gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-3 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
            activeTab === "overview"
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <LayoutDashboard className="size-4" />
          <span>Tổng quan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("media")}
          className={`px-4 py-3 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
            activeTab === "media"
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <ImageIcon className="size-4" />
          <span>Ảnh sự kiện</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("areas")}
          className={`px-4 py-3 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
            activeTab === "areas"
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <Layers className="size-4" />
          <span>Khu vực & Ghế ({areas.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ticket-types")}
          className={`px-4 py-3 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
            activeTab === "ticket-types"
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <Ticket className="size-4" />
          <span>Hạng vé ({ticketTypes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("sale-phases")}
          className={`px-4 py-3 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
            activeTab === "sale-phases"
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <Clock className="size-4" />
          <span>Đợt mở bán ({salePhases.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tickets")}
          className={`px-4 py-3 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
            activeTab === "tickets"
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <QrCode className="size-4" />
          <span>Vé đã phát hành ({issuedTickets.length})</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === "overview" && (
          <OverviewTab
            event={eventData}
            areas={areas}
            ticketTypes={ticketTypes}
            salePhases={salePhases}
            onSwitchTab={(t) =>
              setActiveTab(
                t as "overview" | "media" | "areas" | "ticket-types" | "sale-phases" | "tickets",
              )
            }
          />
        )}

        {activeTab === "media" && (
          <MediaTab eventId={eventId} isDraft={isDraft} onMediaChanged={fetchReadiness} />
        )}

        {activeTab === "areas" && (
          <AreasSeatsTab
            eventId={eventId}
            areas={areas}
            onAddArea={handleAddArea}
            onUpdateArea={handleUpdateArea}
            onDeleteArea={handleDeleteArea}
          />
        )}
        {activeTab === "ticket-types" && (
          <TicketTypesTab
            eventId={eventId}
            ticketTypes={ticketTypes}
            areas={areas}
            onAddTicketType={handleAddTicketType}
          />
        )}
        {activeTab === "sale-phases" && (
          <SalePhasesTab
            eventId={eventId}
            eventStartTime={eventData.startTime}
            eventEndTime={eventData.endTime}
            salePhases={salePhases}
            ticketTypes={ticketTypes}
            onAddSalePhase={handleAddSalePhase}
            onUpdatePhaseStatus={handleUpdatePhaseStatus}
          />
        )}
        {activeTab === "tickets" && <IssuedTicketsTab eventId={eventId} tickets={issuedTickets} />}
      </div>

      {/* Modals */}
      <SubmitConfirmationModal
        eventName={eventData.name}
        isOpen={showSubmitModal}
        isSubmitting={isSubmittingApproval}
        onConfirm={handleConfirmSubmit}
        onClose={() => setShowSubmitModal(false)}
      />

      <CancelEventModal
        eventName={eventData.name}
        isOpen={showCancelModal}
        isCancelling={isCancellingEvent}
        onConfirm={handleConfirmCancel}
        onClose={() => setShowCancelModal(false)}
      />
    </div>
  )
}
