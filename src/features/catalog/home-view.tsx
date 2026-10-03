"use client"
import { ServiceBenefits } from "./components/service-benefits"
import { HomeEvents } from "./components/home-events"
import { CategoryPicker } from "./components/category-picker"
import { HomeHero } from "./components/home-hero"
import { MotionReveal } from "@/components/shared/motion-reveal"

import { useHome } from "./hooks/use-home"
import { useEventBannerUrls } from "./hooks/use-event-banner-urls"

export function HomeView() {
  const {
    events,
    isLoading,
    loadError,
    searchQuery,
    setSearchQuery,
    selectedCity,
    setSelectedCity,
    displayCategories,
    filteredRealEvents,
  } = useHome()
  const bannerUrls = useEventBannerUrls(events)
  return (
    <main className="flex flex-col gap-12 pb-16 lg:gap-16 lg:pb-20">
      <HomeHero
        {...{
          searchQuery,
          setSearchQuery,
          selectedCity,
          setSelectedCity,
          events,
          bannerUrls,
          isLoading,
        }}
      />

      <MotionReveal>
        <CategoryPicker {...{ isLoading, loadError, displayCategories }} />
      </MotionReveal>

      <MotionReveal>
        <HomeEvents {...{ events, isLoading, filteredRealEvents, bannerUrls }} />
      </MotionReveal>

      <MotionReveal>
        <ServiceBenefits />
      </MotionReveal>
    </main>
  )
}
