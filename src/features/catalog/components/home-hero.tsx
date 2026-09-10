"use client"

import { MapPin, Search, Sparkles } from "lucide-react"

import { useHome } from "@/features/catalog/hooks/use-home"

type Props = Pick<
  ReturnType<typeof useHome>,
  "searchQuery" | "setSearchQuery" | "selectedCity" | "setSelectedCity"
>

export function HomeHero({ searchQuery, setSearchQuery, selectedCity, setSelectedCity }: Props) {
  return (
    <>
      <section className="relative min-h-[540px] lg:min-h-[600px] w-full flex flex-col items-center justify-center overflow-hidden">
        {/* Background Image & Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <div
            className="bg-cover bg-center w-full h-full"
            style={{
              backgroundImage: "url('/images/concert-banner.jpg')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111c2d]/95 via-[#111c2d]/70 to-[#111c2d]/40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center pt-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white text-xs sm:text-sm font-medium mb-6">
            <Sparkles className="size-4 text-yellow-400" />
            <span>Nền tảng đặt vé sự kiện thông minh SMART EVENT</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-4 drop-shadow-md leading-tight max-w-4xl">
            Khám phá & Đặt vé <br className="hidden sm:inline" />
            những sự kiện đỉnh cao nhất
          </h1>
          <p className="text-sm sm:text-lg text-gray-200 mb-10 max-w-2xl">
            Hòa mình vào không khí cuồng nhiệt của các đêm concert, giải đấu thể thao và hội thảo
            quốc tế hàng đầu.
          </p>

          {/* Integrated Search Bar */}
          <div className="w-full max-w-4xl bg-white rounded-2xl p-3 sm:p-4 shadow-2xl border border-gray-100 flex flex-col md:flex-row gap-3 items-center">
            {/* Input từ khóa */}
            <div className="flex-1 w-full relative flex items-center bg-surface-container-low border border-outline-variant/60 rounded-xl">
              <Search className="absolute left-3.5 size-4 text-on-surface-variant pointer-events-none" />
              <input
                type="text"
                placeholder="Tên sự kiện, địa điểm, nghệ sĩ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none"
              />
            </div>

            {/* Select địa điểm */}
            <div className="w-full md:w-52 relative flex items-center bg-surface-container-low border border-outline-variant/60 rounded-xl">
              <MapPin className="absolute left-3.5 size-4 text-on-surface-variant pointer-events-none" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-transparent text-sm text-on-surface focus:outline-none appearance-none cursor-pointer"
              >
                <option value="all">Tất cả địa điểm</option>
                <option value="hcm">TP. Hồ Chí Minh</option>
                <option value="hn">Hà Nội</option>
              </select>
            </div>

            {/* Nút Tìm kiếm */}
            <button
              type="button"
              className="w-full md:w-auto px-6 py-3 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-sm cursor-pointer whitespace-nowrap"
            >
              <Search className="size-4" />
              <span>Tìm kiếm</span>
            </button>
          </div>
        </div>
      </section>
    </>
  )
}
