"use client"

import Link from "next/link"
import { AlertCircle, ArrowLeft, Check, CheckCircle2 } from "lucide-react"
import { useEventSetup } from "@/features/organizer/hooks/use-event-setup"
import { EventBasicInfoStep } from "@/features/organizer/components/event-setup/basicinfo-step"
import { EventScheduleStep } from "@/features/organizer/components/event-setup/schedule-step"
import { EventMediaStep } from "@/features/organizer/components/event-setup/media-step"
import { EventTicketsStep } from "@/features/organizer/components/event-setup/tickets-step"
import { EventReviewStep } from "@/features/organizer/components/event-setup/review-step"

export function EventCreateWizard() {
  const {
    currentStep,
    setCurrentStep,
    categories,
    venues,
    eventName,
    setEventName,
    selectedCategoryId,
    setSelectedCategoryId,
    description,
    setDescription,
    startDate,
    setStartDate,
    startTime,
    setStartTime,
    selectedVenueId,
    setSelectedVenueId,
    maxTicketsPerUser,
    setMaxTicketsPerUser,
    bannerMedia,
    galleryMedia,
    isCreatingDraft,
    isUploadingBanner,
    isUploadingGallery,
    mediaError,
    handleProceedToMedia,
    handleUploadBanner,
    handleDeleteBanner,
    seatMapMedia,
    isUploadingSeatMap,
    handleUploadSeatMap,
    handleDeleteSeatMap,
    handleUploadGallery,
    handleDeleteGallery,
    ticketTiers,
    setTicketTiers,
    isSubmitting,
    isDone,
    errorMessage,
    addTier,
    removeTier,
    handleComplete,
    steps,
  } = useEventSetup()

  if (isDone) {
    return (
      <div className="workspace-card mx-auto max-w-2xl space-y-6 px-6 py-14 text-center sm:px-10">
        <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-[#eaf7ee] text-[#257555]">
          <CheckCircle2 className="size-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-[#251f29]">
            Gửi yêu cầu phê duyệt thành công!
          </h2>
          <p className="text-sm text-on-surface-variant max-w-md mx-auto">
            Sự kiện của bạn đã được chuyển sang trạng thái <strong>Chờ phê duyệt</strong>. Bạn có
            thể theo dõi trạng thái trong danh sách sự kiện.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 pt-4">
          <Link href="/organizer/events" className="workspace-primary-button">
            Xem sự kiện của tôi
          </Link>
          <Link href="/organizer/dashboard" className="workspace-secondary-button">
            Về tổng quan
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3">
        <Link href="/organizer/events" className="workspace-secondary-button">
          <ArrowLeft className="size-4" />
          <span>Về danh sách</span>
        </Link>
        <span className="rounded-full bg-[#fff1e9] px-3 py-2 text-xs font-extrabold text-[#bd443a]">
          Bước {currentStep} / {steps.length}
        </span>
      </div>

      {/* Stepper Progress (5 steps) */}
      <ol aria-label="Tiến độ tạo sự kiện" className="flex gap-2 overflow-x-auto pb-1">
        {steps.map((step) => {
          const isPassed = step.num < currentStep
          const isCurrent = step.num === currentStep

          return (
            <li
              key={step.num}
              aria-current={isCurrent ? "step" : undefined}
              className={`min-w-36 flex-1 rounded-2xl border p-3 transition ${
                isCurrent
                  ? "border-[#bd443a] bg-[#fff1e9] text-[#a73530]"
                  : isPassed
                    ? "border-[#c7dfce] bg-[#eaf7ee] text-[#257555]"
                    : "border-[#e8ded8] bg-white text-[#837780]"
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold">
                <span
                  className={`size-5 shrink-0 rounded-full flex items-center justify-center text-[10px] text-white ${
                    isCurrent ? "bg-[#bd443a]" : isPassed ? "bg-[#257555]" : "bg-[#b7abb2]"
                  }`}
                >
                  {isPassed ? <Check className="size-3" /> : step.num}
                </span>
                <span className="truncate">{step.label}</span>
              </div>
            </li>
          )
        })}
      </ol>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: Basic Info */}
      {currentStep === 1 && (
        <fieldset disabled={isSubmitting}>
          <EventBasicInfoStep
            setCurrentStep={setCurrentStep}
            categories={categories}
            eventName={eventName}
            setEventName={setEventName}
            selectedCategoryId={selectedCategoryId}
            setSelectedCategoryId={setSelectedCategoryId}
            description={description}
            setDescription={setDescription}
            maxTicketsPerUser={maxTicketsPerUser}
            setMaxTicketsPerUser={setMaxTicketsPerUser}
          />
        </fieldset>
      )}

      {/* STEP 2: Time & Venue */}
      {currentStep === 2 && (
        <fieldset disabled={isSubmitting || isCreatingDraft}>
          <EventScheduleStep
            setCurrentStep={setCurrentStep}
            venues={venues}
            startDate={startDate}
            setStartDate={setStartDate}
            startTime={startTime}
            setStartTime={setStartTime}
            selectedVenueId={selectedVenueId}
            setSelectedVenueId={setSelectedVenueId}
            handleProceedToMedia={handleProceedToMedia}
            isCreatingDraft={isCreatingDraft}
          />
        </fieldset>
      )}

      {/* STEP 3: Media Upload (Banner & Gallery) */}
      {currentStep === 3 && (
        <fieldset disabled={isSubmitting}>
          <EventMediaStep
            setCurrentStep={setCurrentStep}
            bannerMedia={bannerMedia}
            seatMapMedia={seatMapMedia}
            galleryMedia={galleryMedia}
            onUploadBanner={handleUploadBanner}
            onDeleteBanner={handleDeleteBanner}
            onUploadSeatMap={handleUploadSeatMap}
            onDeleteSeatMap={handleDeleteSeatMap}
            onUploadGallery={handleUploadGallery}
            onDeleteGallery={handleDeleteGallery}
            isUploadingBanner={isUploadingBanner}
            isUploadingSeatMap={isUploadingSeatMap}
            isUploadingGallery={isUploadingGallery}
            mediaError={mediaError}
          />
        </fieldset>
      )}

      {/* STEP 4: Ticket Tiers Setup */}
      {currentStep === 4 && (
        <fieldset disabled={isSubmitting}>
          <EventTicketsStep
            setCurrentStep={setCurrentStep}
            ticketTiers={ticketTiers}
            setTicketTiers={setTicketTiers}
            addTier={addTier}
            removeTier={removeTier}
          />
        </fieldset>
      )}

      {/* STEP 5: Review and Submit */}
      {currentStep === 5 && (
        <fieldset disabled={isSubmitting}>
          <EventReviewStep
            setCurrentStep={setCurrentStep}
            venues={venues}
            eventName={eventName}
            startDate={startDate}
            startTime={startTime}
            selectedVenueId={selectedVenueId}
            ticketTiers={ticketTiers}
            bannerMedia={bannerMedia}
            seatMapMedia={seatMapMedia}
            maxTicketsPerUser={maxTicketsPerUser}
            isSubmitting={isSubmitting}
            handleComplete={handleComplete}
          />
        </fieldset>
      )}
    </div>
  )
}
