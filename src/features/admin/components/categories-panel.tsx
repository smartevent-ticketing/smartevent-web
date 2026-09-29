"use client"

import { Check, Loader2, Pencil, Plus, Tags, Trash2, X } from "lucide-react"
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
    editingCategoryId,
    editCatName,
    setEditCatName,
    editCatDesc,
    setEditCatDesc,
    isSavingCategory,
    startEditingCategory,
    cancelEditingCategory,
    saveCategory,
    handleAddCategory,
    handleDeleteCategory,
  } = useAdminCategories()
  return (
    <div className="space-y-6">
      <ActionFeedback message={notification} onDismiss={() => setNotification(null)} />
      <div className="space-y-6">
        <div className="admin-card space-y-5 p-5 sm:p-7">
          <div>
            <p className="admin-kicker">Tạo mới</p>
            <h2 className="mt-1 text-lg font-extrabold">Thêm danh mục sự kiện</h2>
            <p className="mt-1 text-sm text-[#756d77]">
              Đặt tên ngắn gọn để khách hàng dễ tìm đúng loại sự kiện.
            </p>
          </div>
          <form onSubmit={handleAddCategory} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                aria-label="Tên danh mục mới"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Tên danh mục (ví dụ: Lễ hội văn hóa)"
                className="admin-input"
              />
              <input
                type="text"
                aria-label="Mô tả danh mục mới"
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                placeholder="Mô tả danh mục (tùy chọn)"
                className="admin-input"
              />
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={isAddingCat} className="admin-primary-button">
                <Plus className="size-3.5" />
                <span>Thêm danh mục</span>
              </button>
            </div>
          </form>
        </div>

        <div className="admin-card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-[#eee6e1] px-5 py-5 sm:px-7">
            <div>
              <p className="admin-kicker">Danh sách hiện có</p>
              <h2 className="mt-1 text-lg font-extrabold">Danh mục ({categories.length})</h2>
            </div>
            <Tags className="size-5 text-[#bd443a]" />
          </div>
          {isLoadingCategories ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-on-surface-variant">
              <Loader2 className="size-6 animate-spin text-primary" />
              <span className="text-xs">Đang tải danh mục...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table min-w-[580px]">
                <thead>
                  <tr>
                    <th className="px-6 py-4">Tên danh mục</th>
                    <th className="px-6 py-4">Mô tả</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-12 text-center text-[#756d77]">
                        Chưa có danh mục nào. Hãy tạo danh mục đầu tiên.
                      </td>
                    </tr>
                  )}
                  {categories.map((c) => (
                    <tr key={c.id}>
                      <td className="px-6 py-4 font-bold text-on-surface">
                        {editingCategoryId === c.id ? (
                          <input
                            aria-label="Tên danh mục"
                            value={editCatName}
                            onChange={(event) => setEditCatName(event.target.value)}
                            className="admin-input"
                          />
                        ) : (
                          c.name
                        )}
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant">
                        {editingCategoryId === c.id ? (
                          <input
                            aria-label="Mô tả danh mục"
                            value={editCatDesc}
                            onChange={(event) => setEditCatDesc(event.target.value)}
                            className="admin-input"
                          />
                        ) : (
                          c.description || "--"
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {c.id && (
                          <div className="flex justify-end gap-2">
                            {editingCategoryId === c.id ? (
                              <>
                                <button
                                  type="button"
                                  onClick={saveCategory}
                                  disabled={isSavingCategory || !editCatName.trim()}
                                  className="admin-secondary-button !min-h-0 !p-2 text-[#1f7a59]"
                                  title="Lưu danh mục"
                                >
                                  <Check className="size-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEditingCategory}
                                  disabled={isSavingCategory}
                                  className="admin-secondary-button !min-h-0 !p-2"
                                  title="Hủy chỉnh sửa"
                                >
                                  <X className="size-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => startEditingCategory(c)}
                                  className="admin-secondary-button !min-h-0 !p-2"
                                  title="Sửa danh mục"
                                >
                                  <Pencil className="size-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCategory(c.id!)}
                                  className="admin-secondary-button !min-h-0 !p-2 text-[#b7474f]"
                                  title="Xóa danh mục"
                                >
                                  <Trash2 className="size-4" />
                                </button>
                              </>
                            )}
                          </div>
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
