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
  CheckCircle2,
} from "lucide-react"
import { ActionFeedback } from "@/components/shared/action-feedback"
import type { ActionMessage } from "@/components/shared/action-feedback"
import { organizerApi } from "@/features/organizer/api/organizer-api"
import { OverviewTab } from "@/features/organizer/components/event-management/overview-tab"
import { AreasSeatsTab } from "@/features/organizer/components/event-management/areas-seats-tab"
import { TicketTypesTab } from "@/features/organizer/components/event-management/ticket-types-tab"
import { SalePhasesTab } from "@/features/organizer/components/event-management/sale-phases-tab"
import { IssuedTicketsTab } from "@/features/organizer/components/event-management/issued-tickets-tab"
import { SubmitConfirmationModal } from "@/features/organizer/components/event-management/submit-confirmation-modal"
import { CancelEventModal } from "@/features/organizer/components/event-management/cancel-event-modal"

interface EventManagementViewProps {
  eventId: string
}

export function EventManagementView({ eventId }: EventManagementViewProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "areas" | "ticket-types" | "sale-phases" | "tickets"
  >("overview")
  const [feedback, setFeedback] = useState<ActionMessage | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false)
  const [isCancellingEvent, setIsCancellingEvent] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

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
    vipTickets?: number
    regularTickets?: number
  }>({
    id: eventId,
    name: "Đang tải thông tin sự kiện...",
    status: "DRAFT"
  })
  const [areas, setAreas] = useState<any[]>([])
  const [ticketTypes, setTicketTypes] = useState<any[]>([])
  const [salePhases, setSalePhases] = useState<any[]>([])
  const [issuedTickets, setIssuedTickets] = useState<any[]>([])
  // Fetch real event data on load
  useEffect(() => {
    let isMounted = true
        async function loadEvent() {
      setIsLoading(true)
      try {
        const [eventRes, areasRes, typesRes, phasesRes, ticketsRes] = await Promise.allSettled([
          organizerApi.getEvent(eventId),
          organizerApi.getAreas(eventId),
          organizerApi.getTicketTypes(eventId),
          organizerApi.getSalePhases(eventId),
          organizerApi.getEventTickets(eventId),
        ])

                // 1. Xử lý thông tin chính của sự kiện (Event Core)
        if (eventRes.status === "fulfilled" && eventRes.value?.data) {
          const ev = (eventRes.value.data as any)?.data ?? eventRes.value.data
          setEventData({
            id: ev.id,
            name: ev.name, // Lấy đúng tên thật từ server, không bịa fallback
            status: ev.status, // Lấy đúng enum trạng thái từ server
            location: ev.venue?.name ? `${ev.venue.name}, ${ev.venue.city || ""}` : "Chưa cấu hình địa điểm",
            date: ev.startTime ? new Date(ev.startTime).toLocaleString("vi-VN") : "Chưa cấu hình thời gian",
            startTime: ev.startTime,
            endTime: ev.endTime,
            expectedRevenue: 0,
            totalTickets: 0,
          })
        }


        // 2. Xử lý phân khu (Areas) - Cập nhật đúng mảng server trả về (kể cả rỗng)
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
              : []
          )
        }

        // 3. Xử lý đợt mở bán (Sale Phases)
        let rawPhases: any[] = []
        if (phasesRes.status === "fulfilled" && phasesRes.value?.data) {
          const phasesData = ((phasesRes.value.data as any)?.data ?? phasesRes.value.data) as any[]
          if (Array.isArray(phasesData)) {
            rawPhases = phasesData
            setSalePhases(
              rawPhases.map((p) => ({
                id: p.id,
                name: p.name,
                startTime: p.saleStartAt || p.startTime,
                endTime: p.saleEndAt || p.endTime,
                status: p.status,
                maxPerOrder: p.maxPerOrder || 4,
                ticketTypeName: p.ticketTypeName,
              }))
            )
          }
        }

        // 4. Xử lý hạng vé (Ticket Types) - Không bịa giá 500k hay quota 100
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
              : []
          )
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
              : []
          )
        }
      } catch (err: any) {
        setFeedback({
          type: "error",
          text: err?.message || "Đã xảy ra lỗi không xác định khi nạp dữ liệu sự kiện.",
        })
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadEvent()
    return () => {
      isMounted = false
    }
  }, [eventId])

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
    } catch (error: any) {
      setFeedback({
        type: "error",
        text: getApiErrorMessage(error, `Không thể tạo phân khu "${area.name}". Vui lòng thử lại.`),
      })
    }
  }

  // 2. Thêm hạng vé: Chỉ tạo hạng vé, không sinh phase ngầm, nhận ID thật từ server
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

      const area = areas.find((a) => a.id === targetAreaId)
      setTicketTypes((prev) => [
        ...prev,
        {
          id: createdType?.id,
          name: createdType?.name || ticketType.name,
          price: ticketType.price,
          totalQuota: ticketType.totalQuota,
          soldCount: 0,
          areaName: area?.name || "Khu vực chung",
          description: createdType?.description || ticketType.description,
        },
      ])
      setFeedback({
        type: "success",
        text: `Đã tạo hạng vé "${ticketType.name}" thành công.`,
      })
    } catch (error: any) {
      setFeedback({
        type: "error",
        text: getApiErrorMessage(error, `Không thể tạo hạng vé "${ticketType.name}". Vui lòng thử lại.`),
      })
    }
  }

  // 3. Gửi duyệt: Chỉ cập nhật trạng thái khi server thành công, thất bại thì giữ nguyên DRAFT
  const handleConfirmSubmit = async () => {
    setIsSubmittingApproval(true)
    try {
      await organizerApi.submitEvent(eventId)
      setEventData((prev) => ({ ...prev, status: "PENDING_APPROVAL" }))
      setFeedback({
        type: "success",
        text: "Sự kiện đã được gửi lên ban quản trị xét duyệt thành công.",
      })
    } catch (error: any) {
      setFeedback({
        type: "error",
        text: getApiErrorMessage(error, "Gửi duyệt sự kiện thất bại. Vui lòng kiểm tra lại điều kiện sự kiện."),
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
      setEventData((prev) => ({ ...prev, status: "CANCELLED" }))
      setFeedback({ type: "error", text: `Sự kiện đã được hủy: ${reason}` })
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


  const isDraft = eventData.status === "DRAFT"
  const isPending = eventData.status === "PENDING_APPROVAL"
  const isPublished = eventData.status === "PUBLISHED"
  const isCancelled = eventData.status === "CANCELLED"

  return (
    <div className="space-y-6">
      {/* Back to Events list breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
        <Link
          href="/organizer/events"
          className="inline-flex items-center gap-1.5 hover:text-primary transition"
        >
          <ArrowLeft className="size-3.5" />
          <span>Danh sách sự kiện</span>
        </Link>
        <span>/</span>
        <span className="text-on-surface">{eventData.name}</span>
      </div>

      <ActionFeedback message={feedback} onDismiss={() => setFeedback(null)} />

      {/* Main Event Header Card */}
      <div className="bg-white border border-outline-variant/60 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="size-20 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
            <Ticket className="size-10" />
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-on-surface">{eventData.name}</h1>
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-semibold ${
                  isPublished
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : isPending
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : isCancelled
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                }`}
              >
                {isPublished
                  ? "Đã xuất bản (PUBLISHED)"
                  : isPending
                    ? "Chờ duyệt (PENDING)"
                    : isCancelled
                      ? "Đã hủy (CANCELLED)"
                      : "Bản nháp (DRAFT)"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-on-surface-variant">
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5 text-primary" />
                {eventData.date}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5 text-primary" />
                {eventData.location}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 self-end lg:self-center">
          {isDraft && (
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
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
              setActiveTab(t as "overview" | "areas" | "ticket-types" | "sale-phases" | "tickets")
            }
          />
        )}

        {activeTab === "areas" && (
          <AreasSeatsTab eventId={eventId} areas={areas} onAddArea={handleAddArea} />
        )}
        {activeTab === "ticket-types" && (
          <TicketTypesTab
            eventId={eventId}
            ticketTypes={ticketTypes}
            areas={areas}
            onAddTicketType={handleAddTicketType}
          />
        )}
        {activeTab === "sale-phases" && <SalePhasesTab eventId={eventId} salePhases={salePhases} />}
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
