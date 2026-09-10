"use client"
import { ServiceBenefits } from "./components/service-benefits"
import { HomeEvents } from "./components/home-events"
import { CategoryPicker } from "./components/category-picker"
import { HomeHero } from "./components/home-hero"

import { useHome } from "./hooks/use-home"

export function HomeView() {
  const {
    events,
    isLoading,
    loadError,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    selectedCity,
    setSelectedCity,
    displayCategories,
    filteredRealEvents,
  } = useHome()
  return (
    <div className="flex flex-col gap-12 lg:gap-16 pb-20">
      {/* 1. Hero Section */}
      <HomeHero {...{ searchQuery, setSearchQuery, selectedCity, setSelectedCity }} />

      {/* 2. Categories Section */}
      <CategoryPicker
        {...{ isLoading, loadError, selectedCategory, setSelectedCategory, displayCategories }}
      />

      {/* 3. Events Grid */}
      <HomeEvents {...{ events, isLoading, filteredRealEvents }} />

      {/* 4. Why Choose SMART EVENT */}
      <ServiceBenefits />
    </div>
  )
}
