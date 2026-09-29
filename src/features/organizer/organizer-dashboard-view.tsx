"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ArrowRight, Plus, RefreshCw, Sparkles } from "lucide-react"

import { useOrganizerEvents } from "@/features/organizer/hooks/use-organizer-events"
import { OrganizerDashboardPanel } from "@/features/organizer/components/dashboard-panel"
import { OrganizerEventsPanel } from "@/features/organizer/components/events-panel"
import { OrganizerInventoryPanel } from "@/features/organizer/components/inventory-panel"

type Section = "dashboard" | "events" | "inventory"

export function OrganizerDashboardView() {
  const pathname = usePathname()
  const router = useRouter()
  const activeSection: Section =
    pathname === "/organizer/inventory"
      ? "inventory"
      : pathname === "/organizer/events"
        ? "events"
        : "dashboard"
  const {
    events,
    isLoading,
    loadError,
    setIsLoading,
    setRefreshTrigger,
    totalEvents,
    publishedCount,
    pendingCount,
    draftCount,
    completedCount,
    totalRevenue,
    totalSold,
    totalCapacity,
    totalHeld,
    overallOccupancyRate,
    avgRevenuePerSoldTicket,
  } = useOrganizerEvents()

  function setActiveSection(section: Section) {
    router.push(section === "dashboard" ? "/organizer/dashboard" : "/organizer/" + section)
  }

  function refresh() {
    setIsLoading(true)
    setRefreshTrigger((previous) => previous + 1)
  }

  return (
    <div className="space-y-7">
      {loadError && (
        <div
          role="alert"
          className="rounded-2xl border border-[#f0cdcb] bg-[#fff0f1] px-5 py-4 text-sm font-medium text-[#a13f47]"
        >
          {loadError}
        </div>
      )}
      {activeSection === "dashboard" && (
        <section className="relative overflow-hidden rounded-[28px] bg-[#211e2b] px-7 py-8 text-white sm:px-9 sm:py-9">
          <div className="pointer-events-none absolute -right-20 -top-36 size-[360px] rounded-full bg-[#a4486c]/30 blur-[75px]" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#ffad95]">
                <Sparkles className="mr-1 inline size-3.5" /> Không gian sự kiện
              </p>
              <h2 className="mt-3 max-w-xl text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
                Tạo trải nghiệm đáng nhớ, quản lý mọi thứ dễ dàng.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#c5becc]">
                Theo dõi bán vé và hoàn thiện các sự kiện đang chuẩn bị mở bán.
              </p>
            </div>
            <Link
              href="/organizer/events/new"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#ff8063] px-5 py-3 text-sm font-extrabold text-[#291b25] transition hover:bg-[#ffa18a]"
            >
              <Plus className="size-4" />
              Tạo sự kiện
            </Link>
          </div>
        </section>
      )}

      {activeSection !== "inventory" && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="workspace-kicker">
              {activeSection === "dashboard" ? "Dữ liệu vận hành" : "Quản lý nội dung"}
            </p>
            <h2 className="mt-1 text-xl font-extrabold">
              {activeSection === "dashboard" ? "Tình hình hiện tại" : "Tất cả sự kiện"}
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={refresh}
              disabled={isLoading}
              className="workspace-secondary-button"
              aria-label="Làm mới dữ liệu"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={"size-4 " + (isLoading ? "animate-spin" : "")} />
              Làm mới
            </button>
            {activeSection === "events" && (
              <Link href="/organizer/events/new" className="workspace-primary-button">
                <Plus className="size-4" />
                Tạo sự kiện
              </Link>
            )}
          </div>
        </div>
      )}

      {activeSection === "dashboard" && (
        <OrganizerDashboardPanel
          events={events}
          isLoading={isLoading}
          totalEvents={totalEvents}
          publishedCount={publishedCount}
          pendingCount={pendingCount}
          draftCount={draftCount}
          completedCount={completedCount}
          totalRevenue={totalRevenue}
          totalSold={totalSold}
          totalCapacity={totalCapacity}
          totalHeld={totalHeld}
          overallOccupancyRate={overallOccupancyRate}
          avgRevenuePerSoldTicket={avgRevenuePerSoldTicket}
          setActiveSection={setActiveSection}
        />
      )}
      {activeSection === "events" && <OrganizerEventsPanel events={events} isLoading={isLoading} />}
      {activeSection === "inventory" && (
        <OrganizerInventoryPanel events={events} isEventsLoading={isLoading} />
      )}
      {activeSection === "dashboard" && (
        <div className="flex justify-end">
          <Link
            href="/organizer/events"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#bd443a] hover:underline"
          >
            Xem tất cả sự kiện <ArrowRight className="size-4" />
          </Link>
        </div>
      )}
    </div>
  )
}
