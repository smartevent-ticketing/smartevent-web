"use client"

import Link from "next/link"
import { AlertCircle, ArrowLeft, Check, CheckCircle2 } from "lucide-react"
import { useEventSetup } from "@/features/organizer/hooks/use-event-setup"
import { EventBasicInfoStep } from "@/features/organizer/components/event-setup/basicinfo-step"
import { EventScheduleStep } from "@/features/organizer/components/event-setup/schedule-step"
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
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="size-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="size-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-on-surface">
            Gửi yêu cầu phê duyệt thành công!
          </h1>
          <p className="text-sm text-on-surface-variant max-w-md mx-auto">
            Sự kiện của bạn đã được chuyển sang trạng thái{" "}
            <strong>CHỜ PHÊ DUYỆT (PENDING_APPROVAL)</strong>. Đội ngũ kiểm duyệt SmartEvent sẽ xem
            xét trong vòng 24 giờ.
          </p>
        </div>
        <div className="pt-4 flex justify-center gap-4">
          <Link
            href="/organizer"
            className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-xs transition"
          >
            Quay lại Dashboard
          </Link>
        </div>
      </div>
    )
  }
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-outline-variant/60 pb-4">
        <Link
          href="/organizer"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-on-surface-variant hover:text-primary transition"
        >
          <ArrowLeft className="size-4" />
          <span>Hủy & Thoát</span>
        </Link>
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Bước {currentStep} / {steps.length}
        </span>
      </div>

      {/* Stepper Progress */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {steps.map((step) => {
          const isPassed = step.num < currentStep
          const isCurrent = step.num === currentStep

          return (
            <div
              key={step.num}
              className={`p-3.5 rounded-2xl border transition ${
                isCurrent
                  ? "border-primary bg-primary/5 text-primary"
                  : isPassed
                    ? "border-green-300 bg-green-50 text-green-700"
                    : "border-outline-variant/60 bg-white text-on-surface-variant"
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold">
                <span
                  className={`size-5 rounded-full flex items-center justify-center text-[10px] text-white ${
                    isCurrent ? "bg-primary" : isPassed ? "bg-green-600" : "bg-gray-300"
                  }`}
                >
                  {isPassed ? <Check className="size-3" /> : step.num}
                </span>
                <span>{step.label}</span>
              </div>
            </div>
          )
        })}
      </div>

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
          />
        </fieldset>
      )}

      {/* STEP 2: Time & Venue */}
      {currentStep === 2 && (
        <fieldset disabled={isSubmitting}>
          <EventScheduleStep
            setCurrentStep={setCurrentStep}
            venues={venues}
            startDate={startDate}
            setStartDate={setStartDate}
            startTime={startTime}
            setStartTime={setStartTime}
            selectedVenueId={selectedVenueId}
            setSelectedVenueId={setSelectedVenueId}
          />
        </fieldset>
      )}

      {/* STEP 3: Ticket Tiers Setup */}
      {currentStep === 3 && (
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

      {/* STEP 4: Review and Submit */}
      {currentStep === 4 && (
        <fieldset disabled={isSubmitting}>
          <EventReviewStep
            setCurrentStep={setCurrentStep}
            venues={venues}
            eventName={eventName}
            startDate={startDate}
            startTime={startTime}
            selectedVenueId={selectedVenueId}
            ticketTiers={ticketTiers}
            isSubmitting={isSubmitting}
            handleComplete={handleComplete}
          />
        </fieldset>
      )}
    </div>
  )
}
