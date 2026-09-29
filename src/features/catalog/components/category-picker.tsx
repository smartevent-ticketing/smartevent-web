"use client"

import { useHome } from "@/features/catalog/hooks/use-home"
import Link from "next/link"
import { catalogUrl } from "../model/catalog-url"

type Props = Pick<ReturnType<typeof useHome>, "isLoading" | "loadError" | "displayCategories">

export function CategoryPicker({ isLoading, loadError, displayCategories }: Props) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      {loadError && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200"
        >
          {loadError}
        </div>
      )}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <span className="nightline-kicker">Tìm theo cảm hứng</span>
          <h2 className="nightline-heading mt-2 text-3xl text-[#f8f2ed] sm:text-4xl">
            Khám phá danh mục
          </h2>
          <p className="mt-2 text-sm text-[#aaa6b7]">
            Âm nhạc, thể thao, nghệ thuật và nhiều hơn nữa.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex h-28 animate-pulse flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#242331] p-4"
            >
              <div className="mb-2 size-10 rounded-xl bg-white/10" />
              <div className="h-3 w-16 rounded bg-white/10" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
          {displayCategories.map((cat) => {
            const Icon = cat.icon
            return (
              <Link
                key={cat.id || cat.name}
                href={catalogUrl({ categoryId: cat.id === "all" ? "" : cat.id })}
                className="group flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#242331] p-4 text-center text-[#f8f2ed] transition hover:-translate-y-1 hover:border-[#ff9479] hover:bg-[#2b2938] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff9479]"
              >
                <div className="mb-2.5 flex size-12 items-center justify-center rounded-xl bg-[#ff9479]/10 text-[#ff9479] transition group-hover:bg-[#ff9479] group-hover:text-[#261621]">
                  <Icon className="size-6" />
                </div>
                <span className="text-sm font-semibold truncate max-w-full px-1">{cat.name}</span>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}
