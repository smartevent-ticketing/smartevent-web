"use client"

import {
  Building2,
  Check,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  UsersRound,
  X,
} from "lucide-react"
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
    editingVenue,
    editVenueName,
    setEditVenueName,
    editVenueCity,
    setEditVenueCity,
    editVenueAddress,
    setEditVenueAddress,
    editVenueCapacity,
    setEditVenueCapacity,
    isSavingVenue,
    startEditingVenue,
    cancelEditingVenue,
    saveVenue,
    handleAddVenue,
    handleDeleteVenue,
  } = useAdminVenues()
  return (
    <div className="space-y-6">
      <ActionFeedback message={notification} onDismiss={() => setNotification(null)} />
      <div className="space-y-6">
        <div className="admin-card space-y-5 p-5 sm:p-7">
          <div>
            <p className="admin-kicker">Tạo mới</p>
            <h2 className="mt-1 text-lg font-extrabold">Thêm địa điểm tổ chức</h2>
            <p className="mt-1 text-sm text-[#756d77]">
              Thông tin địa điểm sẽ được hiển thị trên trang sự kiện.
            </p>
          </div>
          <form onSubmit={handleAddVenue} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                type="text"
                aria-label="Tên địa điểm mới"
                required
                value={newVenueName}
                onChange={(e) => setNewVenueName(e.target.value)}
                placeholder="Tên địa điểm (SVĐ, Trung tâm triển lãm...)"
                className="admin-input"
              />
              <input
                type="text"
                aria-label="Thành phố của địa điểm mới"
                required
                value={newVenueCity}
                onChange={(e) => setNewVenueCity(e.target.value)}
                placeholder="Thành phố (TP.HCM, Hà Nội...)"
                className="admin-input"
              />
              <input
                type="text"
                aria-label="Địa chỉ địa điểm mới"
                required
                value={newVenueAddress}
                onChange={(e) => setNewVenueAddress(e.target.value)}
                placeholder="Địa chỉ cụ thể"
                className="admin-input"
              />
              <input
                type="number"
                aria-label="Sức chứa địa điểm mới"
                required
                min="1"
                value={newVenueCapacity}
                onChange={(e) => setNewVenueCapacity(e.target.value)}
                placeholder="Sức chứa tối đa (người)"
                className="admin-input"
              />
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={isAddingVenue} className="admin-primary-button">
                <Plus className="size-3.5" />
                <span>Thêm địa điểm</span>
              </button>
            </div>
          </form>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="admin-kicker">Danh sách hiện có</p>
            <h2 className="mt-1 text-xl font-extrabold">Địa điểm ({venues.length})</h2>
          </div>
          <Building2 className="size-5 text-[#bd443a]" />
        </div>
        {isLoadingVenues ? (
          <div className="flex items-center justify-center py-12 text-on-surface-variant gap-2 text-sm">
            <Loader2 className="size-4 animate-spin text-primary" />
            <span>Đang tải danh sách địa điểm...</span>
          </div>
        ) : venues.length === 0 ? (
          <div className="admin-card py-14 text-center text-sm text-[#756d77]">
            Chưa có địa điểm nào. Hãy thêm địa điểm đầu tiên.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {venues.map((v) => (
              <div
                key={v.id}
                className="admin-card flex flex-col justify-between gap-5 p-5 transition hover:border-[#d6aaa0]"
              >
                {editingVenue?.id === v.id ? (
                  <div className="space-y-2">
                    <input
                      aria-label="Tên địa điểm"
                      value={editVenueName}
                      onChange={(event) => setEditVenueName(event.target.value)}
                      className="admin-input"
                    />
                    <input
                      aria-label="Thành phố"
                      value={editVenueCity}
                      onChange={(event) => setEditVenueCity(event.target.value)}
                      className="admin-input"
                    />
                    <input
                      aria-label="Địa chỉ"
                      value={editVenueAddress}
                      onChange={(event) => setEditVenueAddress(event.target.value)}
                      className="admin-input"
                    />
                    <input
                      aria-label="Sức chứa"
                      type="number"
                      min="1"
                      value={editVenueCapacity}
                      onChange={(event) => setEditVenueCapacity(event.target.value)}
                      className="admin-input"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#fff0e9] text-[#bd443a]">
                        <Building2 className="size-5" />
                      </span>
                      <div>
                        <h3 className="text-base font-extrabold text-[#251f29]">{v.name}</h3>
                        <span className="text-xs font-semibold text-[#a83d37]">
                          {v.city || "Chưa rõ thành phố"}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-on-surface-variant flex items-center gap-1">
                      <MapPin className="size-3.5 text-primary shrink-0" />
                      <span>
                        {[v.address, v.city].filter(Boolean).join(", ") || "Chưa có địa chỉ"}
                      </span>
                    </p>
                    <p className="flex items-center gap-2 text-xs text-[#6d626d] pt-1">
                      <UsersRound className="size-4 text-[#bd443a]" /> Sức chứa:{" "}
                      <strong>
                        {v.capacity != null
                          ? `${v.capacity.toLocaleString("vi-VN")} chỗ`
                          : "Chưa thiết lập"}
                      </strong>
                    </p>
                  </div>
                )}

                <div className="flex justify-end border-t border-[#eee6e1] pt-3">
                  {v.id &&
                    (editingVenue?.id === v.id ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={saveVenue}
                          disabled={isSavingVenue}
                          className="admin-secondary-button !min-h-0 !py-2 text-[#1f7a59]"
                        >
                          <Check className="size-3.5" /> Lưu
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditingVenue}
                          disabled={isSavingVenue}
                          className="admin-secondary-button !min-h-0 !py-2"
                        >
                          <X className="size-3.5" /> Hủy
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEditingVenue(v)}
                          className="admin-secondary-button !min-h-0 !py-2"
                        >
                          <Pencil className="size-3.5" /> Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteVenue(v.id!)}
                          className="admin-secondary-button !min-h-0 !py-2 text-[#b7474f]"
                        >
                          <Trash2 className="size-3.5" /> Xóa
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
