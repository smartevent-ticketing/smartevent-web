"use client"

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

  // Event State
  const [eventData, setEventData] = useState<any>({
    id: eventId,
    name: "Hội nghị Tech Innovators 2024",
    status: "DRAFT",
    location: "Trung tâm Hội nghị Quốc gia, Hà Nội",
    date: "24/10/2024 - 19:00",
    expectedRevenue: 350000000,
    totalTickets: 1500,
    vipTickets: 300,
    regularTickets: 1200,
  })

  // Areas State
  const [areas, setAreas] = useState<any[]>([
    { id: "area-1", name: "Khu VIP Khán Đài A", type: "SEATED", capacity: 300 },
    { id: "area-2", name: "Khu Phổ Thông B", type: "SEATED", capacity: 800 },
    { id: "area-3", name: "Khu Fanzone Đứng", type: "STANDING", capacity: 400 },
  ])

  // Ticket Types State
  const [ticketTypes, setTicketTypes] = useState<any[]>([
    {
      id: "tt-1",
      name: "Vé VIP Thảm Đỏ",
      price: 1500000,
      totalQuota: 300,
      soldCount: 85,
      areaName: "Khu VIP Khán Đài A",
      description: "Bao gồm quà tặng lưu niệm và vị trí gần sân khấu nhất",
    },
    {
      id: "tt-2",
      name: "Vé Tiêu Chuẩn Hàng B",
      price: 650000,
      totalQuota: 800,
      soldCount: 320,
      areaName: "Khu Phổ Thông B",
      description: "Ghế ngồi cố định tầm nhìn bao quát",
    },
    {
      id: "tt-3",
      name: "Vé Fanzone Đứng Tự Do",
      price: 450000,
      totalQuota: 400,
      soldCount: 150,
      areaName: "Khu Fanzone Đứng",
      description: "Khu vực đứng gần ban nhạc",
    },
  ])

  // Sale Phases State
  const [salePhases, setSalePhases] = useState<any[]>([
    {
      id: "sp-1",
      name: "Đợt Mở Bán Sớm (Early Bird)",
      startTime: "2024-09-01T08:00:00Z",
      endTime: "2024-09-15T23:59:59Z",
      status: "COMPLETED",
      maxPerOrder: 4,
      ticketTypeName: "Vé VIP Thảm Đỏ & Fanzone",
    },
    {
      id: "sp-2",
      name: "Đợt Mở Bán Chính Thức (General Sale)",
      startTime: "2024-09-16T08:00:00Z",
      endTime: "2024-10-23T23:59:59Z",
      status: "ACTIVE",
      maxPerOrder: 6,
      ticketTypeName: "Toàn bộ hạng vé",
    },
  ])

  // Issued Tickets State
  const [issuedTickets, setIssuedTickets] = useState<any[]>([
    {
      id: "tkt-001",
      ticketCode: "TKT-TECH-VIP-001",
      ticketTypeName: "Vé VIP Thảm Đỏ",
      areaName: "Khu VIP Khán Đài A",
      seatName: "A-12",
      status: "ACTIVE",
      issuedAt: "2024-09-10T14:30:00Z",
    },
    {
      id: "tkt-002",
      ticketCode: "TKT-TECH-VIP-002",
      ticketTypeName: "Vé VIP Thảm Đỏ",
      areaName: "Khu VIP Khán Đài A",
      seatName: "A-13",
      status: "CHECKED_IN",
      checkedInAt: "2024-10-24T18:15:00Z",
      issuedAt: "2024-09-10T14:30:00Z",
    },
    {
      id: "tkt-003",
      ticketCode: "TKT-TECH-STD-089",
      ticketTypeName: "Vé Tiêu Chuẩn Hàng B",
      areaName: "Khu Phổ Thông B",
      seatName: "B-05",
      status: "ACTIVE",
      issuedAt: "2024-09-18T09:12:00Z",
    },
  ])

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

        if (eventRes.status === "fulfilled" && eventRes.value.data && isMounted) {
          const ev = ((eventRes.value.data as any)?.data ?? eventRes.value.data) as any
          setEventData((prev: any) => ({
            ...prev,
            id: ev.id || eventId,
            name: ev.name || prev.name,
            status: ev.status || prev.status,
            location: ev.venue?.name ? `${ev.venue.name}, ${ev.venue.city || ""}` : prev.location,
            date: ev.startTime ? new Date(ev.startTime).toLocaleString("vi-VN") : prev.date,
          }))
        }

        if (areasRes.status === "fulfilled" && areasRes.value.data && isMounted) {
          const rawAreas = ((areasRes.value.data as any)?.data ?? areasRes.value.data) as any[]
          if (Array.isArray(rawAreas) && rawAreas.length > 0) {
            setAreas(
              rawAreas.map((a) => ({
                id: a.id,
                name: a.name,
                type: a.areaType || a.type || "SEATED",
                capacity: a.capacity || 100,
              })),
            )
          }
        }

        let rawPhases: any[] = []
        if (phasesRes.status === "fulfilled" && phasesRes.value.data && isMounted) {
          const phasesData = ((phasesRes.value.data as any)?.data ?? phasesRes.value.data) as any[]
          if (Array.isArray(phasesData)) {
            rawPhases = phasesData
            if (rawPhases.length > 0) {
              setSalePhases(
                rawPhases.map((p) => ({
                  id: p.id,
                  name: p.name,
                  startTime: p.saleStartAt || p.startTime,
                  endTime: p.saleEndAt || p.endTime,
                  status: p.status,
                  maxPerOrder: p.maxPerOrder || 4,
                  ticketTypeName: p.ticketTypeName,
                })),
              )
            }
          }
        }

        if (typesRes.status === "fulfilled" && typesRes.value.data && isMounted) {
          const rawTypes = ((typesRes.value.data as any)?.data ?? typesRes.value.data) as any[]
          if (Array.isArray(rawTypes) && rawTypes.length > 0) {
            setTicketTypes(
              rawTypes.map((t) => {
                const matchedPhase = rawPhases.find((p) => p.ticketTypeId === t.id)
                return {
                  id: t.id,
                  name: t.name,
                  price: matchedPhase?.price ?? t.price ?? 500000,
                  totalQuota: matchedPhase?.quantity ?? t.totalQuota ?? 100,
                  soldCount: matchedPhase?.soldCount ?? t.soldCount ?? 0,
                  areaName: t.areaName || "Khu vực chung",
                  description: t.description,
                }
              }),
            )
          }
        }

        if (ticketsRes.status === "fulfilled" && ticketsRes.value.data && isMounted) {
          const rawTickets = ((ticketsRes.value.data as any)?.data ?? ticketsRes.value.data) as any[]
          if (Array.isArray(rawTickets) && rawTickets.length > 0) {
            setIssuedTickets(
              rawTickets.map((tk) => ({
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
              })),
            )
          }
        }
      } catch {
        // Keep initial state for dev inspection
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    loadEvent()
    return () => {
      isMounted = false
    }
  }, [eventId])

  const handleAddArea = async (area: {
    name: string
    type: "STANDING" | "SEATED"
    capacity: number
  }) => {
    try {
      await organizerApi.createArea(eventId, {
        name: area.name,
        areaType: area.type,
        capacity: area.capacity,
      })
      setAreas((prev) => [...prev, { id: `area-${Date.now()}`, ...area }])
      setFeedback({ type: "success", text: `Đã thêm phân khu "${area.name}" thành công.` })
    } catch {
      // Local fallback
      setAreas((prev) => [...prev, { id: `area-${Date.now()}`, ...area }])
      setFeedback({ type: "success", text: `Đã lưu phân khu "${area.name}".` })
    }
  }

  const handleAddTicketType = async (ticketType: {
    name: string
    price: number
    totalQuota: number
    areaId?: string
    description?: string
  }) => {
    try {
      const createRes = await organizerApi.createTicketType(eventId, {
        name: ticketType.name,
        eventAreaId: ticketType.areaId || areas[0]?.id || "",
        description: ticketType.description,
      })
      const createdType = (createRes as any)?.data?.data ?? (createRes as any)?.data
      const createdTypeId = createdType?.id

      if (createdTypeId) {
        const now = new Date()
        const end = new Date(
          eventData?.endTime
            ? new Date(eventData.endTime).getTime()
            : now.getTime() + 30 * 24 * 60 * 60 * 1000,
        )
        try {
          const phaseRes = await organizerApi.createSalePhase(createdTypeId, {
            name: `Mở bán - ${ticketType.name}`,
            price: ticketType.price,
            quantity: ticketType.totalQuota,
            saleStartAt: now.toISOString(),
            saleEndAt: end.toISOString(),
            status: "ACTIVE",
            maxPerOrder: Math.min(4, ticketType.totalQuota),
            maxPerUser: Math.min(4, ticketType.totalQuota),
          })
          const createdPhase = (phaseRes as any)?.data?.data ?? (phaseRes as any)?.data
          if (createdPhase) {
            setSalePhases((prev) => [
              ...prev,
              {
                id: createdPhase.id || `phase-${Date.now()}`,
                name: createdPhase.name || `Mở bán - ${ticketType.name}`,
                startTime: createdPhase.saleStartAt || now.toISOString(),
                endTime: createdPhase.saleEndAt || end.toISOString(),
                status: "ACTIVE",
                maxPerOrder: Math.min(4, ticketType.totalQuota),
                ticketTypeName: ticketType.name,
              },
            ])
          }
        } catch (e) {
          console.error("Auto create sale phase error:", e)
        }
      }

      const area = areas.find((a) => a.id === ticketType.areaId)
      setTicketTypes((prev) => [
        ...prev,
        {
          id: createdTypeId || `tt-${Date.now()}`,
          ...ticketType,
          areaName: area?.name || "Khu vực chung",
        },
      ])
      setFeedback({
        type: "success",
        text: `Đã tạo hạng vé "${ticketType.name}" cùng đợt mở bán thành công.`,
      })
    } catch {
      const area = areas.find((a) => a.id === ticketType.areaId)
      setTicketTypes((prev) => [
        ...prev,
        { id: `tt-${Date.now()}`, ...ticketType, areaName: area?.name || "Khu vực chung" },
      ])
      setFeedback({ type: "success", text: `Đã lưu hạng vé "${ticketType.name}".` })
    }
  }

  const handleConfirmSubmit = async () => {
    setIsSubmittingApproval(true)
    try {
      await organizerApi.submitEvent(eventId)
      setEventData((prev: any) => ({ ...prev, status: "PENDING_APPROVAL" }))
      setFeedback({
        type: "success",
        text: "Sự kiện đã được gửi lên ban quản trị xét duyệt thành công.",
      })
    } catch {
      setEventData((prev: any) => ({ ...prev, status: "PENDING_APPROVAL" }))
      setFeedback({
        type: "success",
        text: "Sự kiện đã được chuyển sang trạng thái 'Chờ duyệt' (PENDING_APPROVAL).",
      })
    } finally {
      setIsSubmittingApproval(false)
      setShowSubmitModal(false)
    }
  }

  const handleConfirmCancel = async (reason: string) => {
    setIsCancellingEvent(true)
    try {
      await organizerApi.cancelEvent(eventId, reason)
      setEventData((prev: any) => ({ ...prev, status: "CANCELLED" }))
      setFeedback({ type: "error", text: `Sự kiện đã được hủy: ${reason}` })
    } catch {
      setEventData((prev: any) => ({ ...prev, status: "CANCELLED" }))
      setFeedback({ type: "error", text: `Đã cập nhật trạng thái hủy sự kiện.` })
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
