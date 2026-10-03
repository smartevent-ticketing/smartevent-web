"use client"

import type { useHome } from "@/features/catalog/hooks/use-home"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { catalogUrl } from "../model/catalog-url"
import { MotionReveal } from "@/components/shared/motion-reveal"

type Props = Pick<ReturnType<typeof useHome>, "isLoading" | "loadError" | "displayCategories">

export function CategoryPicker({ isLoading, loadError, displayCategories }: Props) {
  return (
    <section
      className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
      aria-labelledby="home-categories-title"
    >
      {loadError && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {loadError}
        </div>
      )}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2
          id="home-categories-title"
          className="text-lg font-bold tracking-tight text-foreground sm:text-xl"
        >
          Bạn muốn khám phá điều gì?
        </h2>
        <Link
          href="/events"
          className="se-text-link inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-primary"
        >
          Tất cả sự kiện <ArrowRight className="size-3.5" />
        </Link>
      </div>
      {isLoading ? (
        <div
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
          aria-label="Đang tải danh mục"
        >
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="h-20 animate-pulse rounded-2xl bg-surface-container-low" />
          ))}
        </div>
      ) : (
        <div
          className={
            "grid grid-cols-2 gap-3 sm:grid-cols-3 " +
            (displayCategories.length === 8 ? "lg:grid-cols-4" : "lg:grid-cols-6")
          }
        >
          {displayCategories.map((cat, index) => {
            const Icon = cat.icon
            const colors = [
              "bg-orange-50 text-primary",
              "bg-violet-50 text-violet-600",
              "bg-sky-50 text-sky-600",
              "bg-emerald-50 text-emerald-600",
              "bg-amber-50 text-amber-600",
              "bg-rose-50 text-rose-600",
            ]
            return (
              <MotionReveal
                key={cat.id || cat.name}
                delay={(index % 6) * 40}
                className="h-full min-w-0"
              >
                <Link
                  href={catalogUrl({ categoryId: cat.id === "all" ? "" : cat.id })}
                  className="se-category-card flex h-full min-h-22 items-center gap-3 rounded-2xl border border-border bg-white px-3 py-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <div
                    className={
                      "flex size-10 shrink-0 items-center justify-center rounded-xl " +
                      colors[index % colors.length]
                    }
                  >
                    <Icon className="size-5" />
                  </div>
                  <span className="min-w-0 text-xs font-semibold leading-5 text-foreground">
                    {cat.name}
                  </span>
                </Link>
              </MotionReveal>
            )
          })}
        </div>
      )}
    </section>
  )
}
