"use client"

import { Loader2, Trash2 } from "lucide-react"
import type { AreasSeatsController } from "../../hooks/use-areas-seats"
import type { AreasSeatsTabProps } from "./areas-seats-types"

interface Props {
  controller: AreasSeatsController
  canEdit: boolean
  onDeleteArea?: AreasSeatsTabProps["onDeleteArea"]
}

export function AreaManagementDialogs({ controller, canEdit, onDeleteArea }: Props) {
  const {
    showAddModal,
    setShowAddModal,
    name,
    setName,
    type,
    setType,
    capacity,
    setCapacity,
    isSubmitting,
    showEditModal,
    setShowEditModal,
    editingArea,
    editName,
    setEditName,
    editType,
    setEditType,
    editCapacity,
    setEditCapacity,
    isUpdatingArea,
    isDeletingArea,
    handleUpdateSubmit,
    handleDeleteAreaConfirm,
    handleSubmit,
  } = controller
  return (
    <>
      {/* Add Area Modal */}
      {showAddModal && canEdit && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <h3 className="text-lg font-bold text-on-surface">Thêm phân khu sự kiện mới</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant">
                  Tên phân khu
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Khu A VIP, Khán đài Đông..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant">
                  Loại phân khu
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setType("SEATED")}
                    className={`p-3 rounded-xl border text-xs font-bold text-center cursor-pointer transition ${
                      type === "SEATED"
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-outline-variant text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    Khu có ghế (SEATED)
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("STANDING")}
                    className={`p-3 rounded-xl border text-xs font-bold text-center cursor-pointer transition ${
                      type === "STANDING"
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-outline-variant text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    Khu đứng (STANDING)
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant">
                  Sức chứa tối đa
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
                  <span>Lưu phân khu</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Area Modal */}
      {showEditModal && canEdit && editingArea && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <h3 className="text-lg font-bold text-on-surface">Chỉnh sửa phân khu sự kiện</h3>
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant">
                  Tên phân khu
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Khu A VIP, Khán đài Đông..."
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant">
                  Loại phân khu
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditType("SEATED")}
                    className={`p-3 rounded-xl border text-xs font-bold text-center cursor-pointer transition ${
                      editType === "SEATED"
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-outline-variant text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    Khu có ghế (SEATED)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditType("STANDING")}
                    className={`p-3 rounded-xl border text-xs font-bold text-center cursor-pointer transition ${
                      editType === "STANDING"
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-outline-variant text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    Khu đứng (STANDING)
                  </button>
                </div>
                {editingArea.type === "SEATED" && editType === "STANDING" && (
                  <p className="text-[11px] text-amber-600 mt-1">
                    * Lưu ý: Chuyển sang khu đứng sẽ tự động xóa các ghế trống chưa được giữ/bán.
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant">
                  Sức chứa tối đa (vé)
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={editCapacity}
                  onChange={(e) => setEditCapacity(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-outline-variant/40">
                {onDeleteArea ? (
                  <button
                    type="button"
                    disabled={isDeletingArea || isUpdatingArea}
                    onClick={handleDeleteAreaConfirm}
                    className="px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer inline-flex items-center gap-1.5"
                  >
                    {isDeletingArea ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                    <span>Xóa phân khu</span>
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingArea || isDeletingArea}
                    className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                  >
                    {isUpdatingArea && <Loader2 className="size-3.5 animate-spin" />}
                    <span>Lưu thay đổi</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
