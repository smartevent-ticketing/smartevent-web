"use client"

import { Loader2, Plus, Trash2 } from "lucide-react"
import { ActionFeedback } from "@/components/shared/action-feedback"
import { useAdminCategories } from "@/features/admin/hooks/use-categories"

export function AdminCategoriesPanel() {
  const {
    notification,
    setNotification,
    categories,
    isLoadingCategories,
    newCatName,
    setNewCatName,
    newCatDesc,
    setNewCatDesc,
    isAddingCat,
    handleAddCategory,
    handleDeleteCategory,
  } = useAdminCategories()
  return (
    <div className="space-y-6">
      <ActionFeedback message={notification} onDismiss={() => setNotification(null)} />
      <div className="space-y-6">
        {/* Form thêm danh mục */}
        <div className="bg-white p-6 rounded-3xl border border-outline-variant/60 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-on-surface">Thêm danh mục sự kiện mới</h3>
          <form onSubmit={handleAddCategory} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Tên danh mục (ví dụ: Lễ hội văn hóa)"
                className="px-4 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-xs"
              />
              <input
                type="text"
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                placeholder="Mô tả danh mục (tùy chọn)"
                className="px-4 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-xs"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isAddingCat}
                className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Plus className="size-3.5" />
                <span>Thêm danh mục</span>
              </button>
            </div>
          </form>
        </div>

        {/* Danh sách danh mục */}
        <div className="bg-white rounded-3xl border border-outline-variant/60 shadow-xs overflow-hidden">
          {isLoadingCategories ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-on-surface-variant">
              <Loader2 className="size-6 animate-spin text-primary" />
              <span className="text-xs">Đang tải danh mục...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-container-low text-xs uppercase font-bold text-on-surface-variant border-b border-outline-variant/60">
                  <tr>
                    <th className="px-6 py-4">Tên danh mục</th>
                    <th className="px-6 py-4">Mô tả</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40 text-xs">
                  {categories.map((c) => (
                    <tr key={c.id} className="hover:bg-surface-container-low/50">
                      <td className="px-6 py-4 font-bold text-on-surface">{c.name}</td>
                      <td className="px-6 py-4 text-on-surface-variant">{c.description || "--"}</td>
                      <td className="px-6 py-4 text-right">
                        {c.id && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(c.id!)}
                            className="p-1.5 text-red-500 hover:text-red-700 cursor-pointer"
                            title="Xóa danh mục"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
