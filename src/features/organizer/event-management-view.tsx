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
    isSavingTicketLimit,
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
  } = useEventManagement(eventId)

  const [activeTab, setActiveTab] = useState<
    "overview" | "media" | "areas" | "ticket-types" | "sale-phases" | "tickets"
  >("overview")
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  // Loading state
  if (isAuthLoading || (isLoadingEvent && !eventData)) {
    return (
      <div className="workspace-card space-y-4 py-24 text-center">
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
        <div className="workspace-card space-y-4 border-[#f0cdcb] p-12 text-center">
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
              className="workspace-primary-button"
            >
              Thử lại
            </button>
            <Link href="/organizer/events" className="workspace-secondary-button">
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
          <Link href="/organizer/events" className="workspace-secondary-button !min-h-0 !py-2">
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
            className="workspace-secondary-button !min-h-0 !py-2"
          >
            <span>Trang bán vé</span>
            <ExternalLink className="size-3.5" />
          </Link>
        )}
      </div>

      <ActionFeedback message={feedback} onDismiss={() => setFeedback(null)} />

      {/* Main Event Header Card */}
      <div className="relative overflow-hidden rounded-[28px] bg-[#211e2b] p-6 text-white sm:p-8">
        {/* Soft background ambient gradient glow */}
        <div className="pointer-events-none absolute -right-10 -top-10 size-96 rounded-full bg-[#a4486c]/25 blur-[75px]" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[#ff8063] text-[#291b25] sm:size-20">
              <Ticket className="size-8 sm:size-10" />
            </div>

            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                  {eventData.name}
                </h2>
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

              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#e5dfe8]">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/8 px-2.5 py-1">
                  <Calendar className="size-3.5 text-[#ffad95]" />
                  <span>{eventData.date}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/8 px-2.5 py-1">
                  <MapPin className="size-3.5 text-[#ffad95]" />
                  <span className="max-w-[260px] sm:max-w-md truncate">{eventData.location}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 self-stretch lg:self-center">
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
                    ? "border border-white/15 bg-white/10 text-[#aaa5b8]"
                    : "bg-[#ff8063] text-[#291b25] hover:bg-[#ffa18a]"
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
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#f7b2ae]/45 px-4 py-2.5 text-xs font-bold text-[#ffc1b8] transition hover:bg-white/10"
              >
                <Ban className="size-3.5" />
                <span>Hủy sự kiện</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick event stats bar */}
        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/15 pt-5 text-xs sm:grid-cols-4">
          <div>
            <span className="block text-[11px] font-medium text-[#bdb6c7]">Tổng số vé</span>
            <span className="font-mono text-sm font-bold text-white">
              {eventData.totalTickets?.toLocaleString("vi-VN") || 0} vé
            </span>
          </div>
          <div>
            <span className="block text-[11px] font-medium text-[#bdb6c7]">Doanh thu dự kiến</span>
            <span className="font-mono text-sm font-bold text-[#ffad95]">
              {eventData.expectedRevenue?.toLocaleString("vi-VN") || 0} ₫
            </span>
          </div>
          <div>
            <span className="block text-[11px] font-medium text-[#bdb6c7]">
              Phân khu / Khán đài
            </span>
            <span className="font-mono text-sm font-bold text-white">{areas.length} khu vực</span>
          </div>
          <div>
            <span className="block text-[11px] font-medium text-[#bdb6c7]">Đợt mở bán</span>
            <span className="font-mono text-sm font-bold text-white">{salePhases.length} đợt</span>
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
      <nav
        aria-label="Mục quản lý sự kiện"
        className="workspace-card flex items-center gap-1 overflow-x-auto p-2"
      >
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          aria-pressed={activeTab === "overview"}
          className={`px-4 py-3 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
            activeTab === "overview"
              ? "border-[#bd443a] text-[#bd443a]"
              : "border-transparent text-[#756d77] hover:text-[#251f29]"
          }`}
        >
          <LayoutDashboard className="size-4" />
          <span>Tổng quan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("media")}
          aria-pressed={activeTab === "media"}
          className={`px-4 py-3 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
            activeTab === "media"
              ? "border-[#bd443a] text-[#bd443a]"
              : "border-transparent text-[#756d77] hover:text-[#251f29]"
          }`}
        >
          <ImageIcon className="size-4" />
          <span>Ảnh sự kiện</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("areas")}
          aria-pressed={activeTab === "areas"}
          className={`px-4 py-3 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
            activeTab === "areas"
              ? "border-[#bd443a] text-[#bd443a]"
              : "border-transparent text-[#756d77] hover:text-[#251f29]"
          }`}
        >
          <Layers className="size-4" />
          <span>Khu vực & Ghế ({areas.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ticket-types")}
          aria-pressed={activeTab === "ticket-types"}
          className={`px-4 py-3 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
            activeTab === "ticket-types"
              ? "border-[#bd443a] text-[#bd443a]"
              : "border-transparent text-[#756d77] hover:text-[#251f29]"
          }`}
        >
          <Ticket className="size-4" />
          <span>Hạng vé ({ticketTypes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("sale-phases")}
          aria-pressed={activeTab === "sale-phases"}
          className={`px-4 py-3 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
            activeTab === "sale-phases"
              ? "border-[#bd443a] text-[#bd443a]"
              : "border-transparent text-[#756d77] hover:text-[#251f29]"
          }`}
        >
          <Clock className="size-4" />
          <span>Đợt mở bán ({salePhases.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tickets")}
          aria-pressed={activeTab === "tickets"}
          className={`px-4 py-3 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
            activeTab === "tickets"
              ? "border-[#bd443a] text-[#bd443a]"
              : "border-transparent text-[#756d77] hover:text-[#251f29]"
          }`}
        >
          <QrCode className="size-4" />
          <span>Vé đã phát hành ({issuedTickets.length})</span>
        </button>
      </nav>

      {/* Tab Panels */}
      <div>
        {activeTab === "overview" && (
          <OverviewTab
            key={`${eventData.id}-${eventData.maxTicketsPerUser ?? "unlimited"}`}
            event={eventData}
            areas={areas}
            ticketTypes={ticketTypes}
            salePhases={salePhases}
            isSavingTicketLimit={isSavingTicketLimit}
            onUpdateTicketLimit={handleUpdateTicketLimit}
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
            canEdit={eventData.status === "DRAFT" || eventData.status === "PENDING_APPROVAL"}
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
            onUpdateTicketType={handleUpdateTicketType}
            onDeleteTicketType={handleDeleteTicketType}
            canEdit={eventData.status === "DRAFT" || eventData.status === "PENDING_APPROVAL"}
          />
        )}

        {activeTab === "sale-phases" && (
          <SalePhasesTab
            eventStatus={eventData.status}
            eventStartTime={eventData.startTime}
            eventEndTime={eventData.endTime}
            salePhases={salePhases}
            ticketTypes={ticketTypes}
            areas={areas}
            onAddSalePhase={handleAddSalePhase}
            onUpdateSalePhase={handleUpdateSalePhase}
            canEditConfig={eventData.status === "DRAFT" || eventData.status === "PENDING_APPROVAL"}
            onUpdatePhaseStatus={handleUpdatePhaseStatus}
            onDeleteSalePhase={handleDeleteSalePhase}
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
