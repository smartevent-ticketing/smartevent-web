"use client"

import { useHome } from "@/features/catalog/hooks/use-home"

type Props = Pick<
  ReturnType<typeof useHome>,
  "isLoading" | "loadError" | "selectedCategory" | "setSelectedCategory" | "displayCategories"
>

export function CategoryPicker({
  isLoading,
  loadError,
  selectedCategory,
  setSelectedCategory,
  displayCategories,
}: Props) {
  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {loadError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {loadError}
          </div>
        )}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-on-surface">Danh mục sự kiện</h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Khám phá theo sở thích và phong cách của bạn
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-28 bg-white border border-outline-variant/60 rounded-2xl animate-pulse p-4 flex flex-col items-center justify-center"
              >
                <div className="size-10 bg-gray-200 rounded-xl mb-2" />
                <div className="w-16 h-3 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
            {displayCategories.map((cat) => {
              const Icon = cat.icon
              const isActive = selectedCategory === cat.name
              return (
                <button
                  key={cat.id || cat.name}
                  type="button"
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition text-center cursor-pointer ${
                    isActive
                      ? "bg-primary text-white border-primary shadow-md"
                      : "bg-white border-outline-variant/60 hover:border-primary/50 text-on-surface hover:bg-surface-container-low"
                  }`}
                >
                  <div
                    className={`size-12 rounded-xl flex items-center justify-center mb-2.5 ${
                      isActive ? "bg-white/20 text-white" : "bg-surface-container text-primary"
                    }`}
                  >
                    <Icon className="size-6" />
                  </div>
                  <span className="text-sm font-semibold truncate max-w-full px-1">{cat.name}</span>
                </button>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}
