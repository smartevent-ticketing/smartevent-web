"use client"

import { useState } from "react"
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
import { useEventManagement } from "@/features/organizer/hooks/use-event-management"
import { OverviewTab } from "@/features/organizer/components/event-management/overview-tab"
import { MediaTab } from "@/features/organizer/components/event-management/media-tab"
import { AreasSeatsTab } from "@/features/organizer/components/event-management/areas-seats-tab"
import { TicketTypesTab } from "@/features/organizer/components/event-management/ticket-types-tab"
import { SalePhasesTab } from "@/features/organizer/components/event-management/sale-phases-tab"
import { SubmissionReadinessCard } from "@/features/organizer/components/event-management/submission-readiness-card"
import { IssuedTicketsTab } from "@/features/organizer/components/event-management/issued-tickets-tab"
import { SubmitConfirmationModal } from "@/features/organizer/components/event-management/submit-confirmation-modal"
import { CancelEventModal } from "@/features/organizer/components/event-management/cancel-event-modal"

interface EventManagementViewProps {
  eventId: string
}

export function EventManagementView({ eventId }: EventManagementViewProps) {
  const {
    isAuthLoading,
    isLoadingEvent,
    loadError,
    setLoadError,
    setIsLoadingEvent,
    eventData,
    areas,
    ticketTypes,
    salePhases,
    issuedTickets,
    readiness,
    isLoadingReadiness,
    feedback,
    setFeedback,
    isSubmittingApproval,
    isCancellingEvent,
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
  } = useEventManagement(eventId)

  const [activeTab, setActiveTab] = useState<
    "overview" | "media" | "areas" | "ticket-types" | "sale-phases" | "tickets"
  >("overview")
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  // Loading state
  if (isAuthLoading || (isLoadingEvent && !eventData)) {
    return (
      <div className="py-24 text-center space-y-4">
        <Loader2 className="size-8 animate-spin text-primary mx-auto" />
        <p className="text-sm font-medium text-on-surface-variant">Đang tải thông tin sự kiện...</p>
      </div>
    )
  }

  // Error state
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
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setLoadError(null)
                setIsLoadingEvent(true)
                refresh()
              }}
              className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition cursor-pointer shadow-xs"
            >
              Thử lại
            </button>
            <Link
              href="/organizer/events"
              className="inline-block px-5 py-2.5 border border-outline-variant text-on-surface-variant text-xs font-bold rounded-xl hover:bg-surface-container transition"
            >
              Quay lại danh sách
            </Link>
          </div>
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
        onRefresh={refreshReadiness}
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
          <MediaTab eventId={eventId} isDraft={isDraft} onMediaChanged={refreshReadiness} />
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
            areas={areas}
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
