"use client"

import { Loader2, MapPin, Plus, Trash2 } from "lucide-react"
import { ActionFeedback } from "@/components/shared/action-feedback"
import { useAdminVenues } from "@/features/admin/hooks/use-venues"

export function AdminVenuesPanel() {
  const {
    notification,
    setNotification,
    venues,
    isLoadingVenues,
    newVenueName,
    setNewVenueName,
    newVenueCity,
    setNewVenueCity,
    newVenueAddress,
    setNewVenueAddress,
    newVenueCapacity,
    setNewVenueCapacity,
    isAddingVenue,
    handleAddVenue,
    handleDeleteVenue,
  } = useAdminVenues()
  return (
    <div className="space-y-6">
      <ActionFeedback message={notification} onDismiss={() => setNotification(null)} />
      <div className="space-y-6">
        {/* Form thêm địa điểm */}
        <div className="bg-white p-6 rounded-3xl border border-outline-variant/60 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-on-surface">Thêm địa điểm tổ chức mới</h3>
          <form onSubmit={handleAddVenue} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <input
                type="text"
                required
                value={newVenueName}
                onChange={(e) => setNewVenueName(e.target.value)}
                placeholder="Tên địa điểm (SVĐ, Trung tâm triển lãm...)"
                className="px-4 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl"
              />
              <input
                type="text"
                value={newVenueCity}
                onChange={(e) => setNewVenueCity(e.target.value)}
                placeholder="Thành phố (TP.HCM, Hà Nội...)"
                className="px-4 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl"
              />
              <input
                type="text"
                value={newVenueAddress}
                onChange={(e) => setNewVenueAddress(e.target.value)}
                placeholder="Địa chỉ cụ thể"
                className="px-4 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl"
              />
              <input
                type="number"
                value={newVenueCapacity}
                onChange={(e) => setNewVenueCapacity(e.target.value)}
                placeholder="Sức chứa tối đa (người)"
                className="px-4 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isAddingVenue}
                className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Plus className="size-3.5" />
                <span>Thêm địa điểm</span>
              </button>
            </div>
          </form>
        </div>

        {/* Danh sách địa điểm */}
        {isLoadingVenues ? (
          <div className="flex items-center justify-center py-12 text-on-surface-variant gap-2 text-sm">
            <Loader2 className="size-4 animate-spin text-primary" />
            <span>Đang tải danh sách địa điểm...</span>
          </div>
        ) : venues.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant text-sm">
            Chưa có địa điểm nào được tạo
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {venues.map((v) => (
              <div
                key={v.id}
                className="bg-white p-5 rounded-3xl border border-outline-variant/60 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-on-surface">{v.name}</h4>
                  <p className="text-xs text-on-surface-variant flex items-center gap-1">
                    <MapPin className="size-3.5 text-primary shrink-0" />
                    <span>
                      {v.address ? `${v.address}, ` : ""}
                      {v.city || "Việt Nam"}
                    </span>
                  </p>
                  <p className="text-xs text-on-surface-variant pt-1">
                    Sức chứa: <strong>{(v.capacity || 10000).toLocaleString("vi-VN")} chỗ</strong>
                  </p>
                </div>

                <div className="pt-3 border-t border-outline-variant/40 flex justify-end">
                  {v.id && (
                    <button
                      type="button"
                      onClick={() => handleDeleteVenue(v.id!)}
                      className="p-1.5 text-red-500 hover:text-red-700 cursor-pointer text-xs flex items-center gap-1"
                    >
                      <Trash2 className="size-3.5" />
                      <span>Xóa</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
