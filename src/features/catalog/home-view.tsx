"use client"
import { ServiceBenefits } from "./components/service-benefits"
import { HomeEvents } from "./components/home-events"
import { CategoryPicker } from "./components/category-picker"
import { HomeHero } from "./components/home-hero"

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
    <div className="flex flex-col gap-14 lg:gap-20 pb-20">
      {/* 1. Hero Section */}
      <HomeHero
        {...{ searchQuery, setSearchQuery, selectedCity, setSelectedCity, events, bannerUrls }}
      />

      {/* 2. Categories Section */}
      <CategoryPicker {...{ isLoading, loadError, displayCategories }} />

      {/* 3. Events Grid */}
      <HomeEvents {...{ events, isLoading, filteredRealEvents, bannerUrls }} />

      {/* 4. Why Choose SMART EVENT */}
      <ServiceBenefits />
    </div>
  )
}
