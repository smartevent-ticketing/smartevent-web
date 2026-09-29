"use client"

import { Layers, Plus, Armchair, Users, Loader2, Grid, Trash2, Pencil } from "lucide-react"
import { useAreasSeats } from "../../hooks/use-areas-seats"
import { SeatManagementDialogs } from "./seat-management-dialogs"
import { AreaManagementDialogs } from "./area-management-dialogs"
import type { AreasSeatsTabProps } from "./areas-seats-types"

export function AreasSeatsTab(props: AreasSeatsTabProps) {
  const { canEdit, areas, onUpdateArea, onDeleteArea } = props
  const controller = useAreasSeats(props)
  const {
    setShowAddModal,
    activeAreaId,
    setSelectedAreaId,
    realSeats,
    seatPage,
    seatTotalPages,
    seatTotalElements,
    selectedSeat,
    setSelectedSeat,
    isLoadingSeats,
    setShowSingleSeatModal,
    isSavingSingleSeat,
    setShowGenerateModal,
    seatMessage,
    setSeatMessage,
    selectedArea,
    loadSeats,
    handleDeleteSeats,
    handleDeleteSingleSeat,
    openEditModal,
    seatRows,
  } = controller

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-base font-bold text-on-surface">Danh sách phân khu sự kiện</h3>
          <p className="text-xs text-on-surface-variant">
            Thiết lập khu đứng tự do hoặc khu có ghế cố định theo sơ đồ địa điểm.
          </p>
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
          >
            <Plus className="size-4" />
            <span>Thêm phân khu</span>
          </button>
        )}
      </div>

      {areas.length === 0 ? (
        <div className="workspace-card space-y-4 p-12 text-center">
          <div className="size-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto">
            <Layers className="size-7" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-on-surface">Chưa có phân khu nào</h4>
            <p className="text-xs text-on-surface-variant max-w-md mx-auto">
              Sự kiện của bạn cần ít nhất một phân khu (Khu đứng tự do hoặc Khu có ghế ngồi cố định)
              để có thể tạo hạng vé và mở bán.
            </p>
          </div>
          {canEdit && (
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
            >
              <Plus className="size-4" />
              <span>Thêm phân khu đầu tiên</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Areas Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {areas.map((area) => {
              const isSelected = area.id === activeAreaId
              const isSeated = area.type === "SEATED"

              return (
                <div
                  key={area.id}
                  onClick={() => setSelectedAreaId(area.id)}
                  className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? "bg-white border-primary ring-2 ring-primary/20 shadow-sm"
                      : "bg-white/80 border-outline-variant/60 hover:bg-white hover:border-outline-variant"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-2 rounded-xl ${
                          isSeated ? "bg-primary/10 text-primary" : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {isSeated ? (
                          <Armchair className="size-4" />
                        ) : (
                          <Users className="size-4 text-emerald-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-on-surface">{area.name}</h4>
                        <span className="text-[10px] font-semibold text-on-surface-variant">
                          {isSeated ? "Khu có ghế" : "Khu đứng tự do"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-primary">
                        {area.capacity.toLocaleString("vi-VN")} vé
                      </span>
                      {canEdit && onUpdateArea && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            openEditModal(area)
                          }}
                          className="p-1 hover:bg-slate-100 rounded-lg text-on-surface-variant hover:text-primary transition"
                          title="Chỉnh sửa phân khu này"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Visual Seat Map or Standing Zone Section */}
          {/* Feedback Message */}
          {seatMessage && (
            <div
              className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs ${
                seatMessage.type === "success"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}
            >
              <span>{seatMessage.text}</span>
              <button
                type="button"
                onClick={() => setSeatMessage(null)}
                className="text-xs hover:underline cursor-pointer"
              >
                Đóng
              </button>
            </div>
          )}

          {/* Area Layout & Seat Management Container */}
          <div className="workspace-card space-y-6 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-outline-variant/40 pb-4 gap-4">
              <div className="flex items-center gap-2">
                <Layers className="size-5 text-primary" />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-on-surface">
                      Sơ đồ cấu hình: {selectedArea ? selectedArea.name : "Chưa chọn khu vực"}
                    </h4>
                    {canEdit && selectedArea && onUpdateArea && (
                      <button
                        type="button"
                        onClick={() => openEditModal(selectedArea)}
                        className="px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-primary/10 rounded-lg transition inline-flex items-center gap-1 cursor-pointer border border-primary/20"
                        title="Chỉnh sửa thông tin phân khu"
                      >
                        <Pencil className="size-3" />
                        <span>Sửa phân khu</span>
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    {selectedArea?.type === "SEATED"
                      ? `Sơ đồ bố trí hàng ghế (${seatTotalElements.toLocaleString("vi-VN")} ghế đã tạo / Sức chứa: ${selectedArea.capacity.toLocaleString("vi-VN")} vé)`
                      : `Khu đứng tự do - Sức chứa quản lý theo số lượng vé phát hành (${selectedArea?.capacity.toLocaleString("vi-VN")} người)`}
                  </p>
                </div>
              </div>

              {selectedArea?.type === "SEATED" && (
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="size-3 rounded-md bg-surface-container-high border border-outline-variant" />
                      Còn trống
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="size-3 rounded-md bg-amber-500 border border-amber-600" />
                      Đang giữ
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="size-3 rounded-md bg-yellow-400 border border-yellow-500" />
                      Đã bán
                    </span>
                  </div>

                  {canEdit && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowSingleSeatModal(true)}
                        className="px-3.5 py-1.5 border border-primary/40 text-primary text-xs font-bold rounded-xl cursor-pointer inline-flex items-center gap-1"
                      >
                        <Plus className="size-3.5" /> Thêm ghế lẻ
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowGenerateModal(true)}
                        className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                      >
                        <Grid className="size-3.5" />
                        <span>Sinh ghế tự động</span>
                      </button>
                      {seatTotalElements > 0 && (
                        <button
                          type="button"
                          onClick={handleDeleteSeats}
                          className="px-3.5 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl transition cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Trash2 className="size-3.5" />
                          <span>Xóa ghế</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {selectedArea?.type === "SEATED" ? (
              isLoadingSeats ? (
                <div className="py-16 text-center space-y-3">
                  <Loader2 className="size-7 animate-spin text-primary mx-auto" />
                  <p className="text-xs text-on-surface-variant font-medium">
                    Đang tải sơ đồ ghế từ máy chủ...
                  </p>
                </div>
              ) : realSeats.length > 0 ? (
                <div className="space-y-4 py-4">
                  {/* Stage indicator */}
                  <div className="w-2/3 mx-auto py-2 bg-slate-100 border border-slate-200 text-center rounded-xl text-xs font-bold uppercase tracking-widest text-slate-600">
                    &mdash; SÂN KHẤU CHÍNH &mdash;
                  </div>

                  {/* Real Seat Grid */}
                  <div className="space-y-2.5 max-w-3xl mx-auto pt-4 overflow-x-auto">
                    {seatRows.map(([row, rowSeats]) => (
                      <div key={row} className="flex items-center justify-center gap-2">
                        <span className="w-6 text-xs font-bold font-mono text-on-surface-variant text-right">
                          {row}
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap justify-center">
                          {rowSeats.map((seat) => {
                            const isSold = seat.status === "SOLD"
                            const isHeld = seat.status === "HELD"
                            const isBlocked = seat.status === "BLOCKED"

                            return (
                              <button
                                type="button"
                                key={seat.id || seat.label}
                                disabled={!canEdit}
                                onClick={() => setSelectedSeat(seat)}
                                title={`${seat.label || `Ghế ${seat.seatNumber}`} (${seat.status || "AVAILABLE"})`}
                                className={`size-7 rounded-md flex items-center justify-center text-[10px] font-mono font-bold transition ${canEdit ? "cursor-pointer" : "cursor-default"} ${
                                  isSold
                                    ? "bg-yellow-400 text-yellow-950 border border-yellow-500 font-extrabold"
                                    : isHeld
                                      ? "bg-amber-500 text-white border border-amber-600"
                                      : isBlocked
                                        ? "bg-slate-200 text-slate-500 border border-slate-300"
                                        : "bg-surface-container-high border border-outline-variant/60 text-on-surface hover:border-primary"
                                }`}
                              >
                                {seat.seatNumber}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  {seatTotalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 text-xs">
                      <button
                        type="button"
                        disabled={seatPage === 0 || isLoadingSeats}
                        onClick={() => loadSeats(selectedArea.id, seatPage - 1)}
                        className="px-3 py-1.5 border rounded-lg disabled:opacity-40"
                      >
                        Trang trước
                      </button>
                      <span>
                        Trang {seatPage + 1}/{seatTotalPages}
                      </span>
                      <button
                        type="button"
                        disabled={seatPage + 1 >= seatTotalPages || isLoadingSeats}
                        onClick={() => loadSeats(selectedArea.id, seatPage + 1)}
                        className="px-3 py-1.5 border rounded-lg disabled:opacity-40"
                      >
                        Trang sau
                      </button>
                    </div>
                  )}
                  {selectedSeat && canEdit && (
                    <div className="flex items-center justify-center gap-3 text-xs">
                      <span>
                        Ghế{" "}
                        {selectedSeat.label || `${selectedSeat.rowName}-${selectedSeat.seatNumber}`}{" "}
                        · {selectedSeat.status || "AVAILABLE"}
                      </span>
                      <button
                        type="button"
                        disabled={
                          isSavingSingleSeat ||
                          selectedSeat.status === "HELD" ||
                          selectedSeat.status === "SOLD"
                        }
                        onClick={handleDeleteSingleSeat}
                        className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg disabled:opacity-40"
                      >
                        Xóa ghế này
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-12 text-center bg-surface-container-low/60 rounded-2xl border border-dashed border-outline-variant space-y-4">
                  <Armchair className="size-10 text-primary/60 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-on-surface">
                      Chưa có sơ đồ ghế nào được tạo
                    </h4>
                    <p className="text-xs text-on-surface-variant max-w-md mx-auto">
                      Phân khu có ghế yêu cầu tạo danh sách chỗ ngồi cố định. Bạn có thể sinh ghế tự
                      động theo hàng (A..E) và cột (1..12).
                    </p>
                  </div>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => setShowGenerateModal(true)}
                      className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                    >
                      <Grid className="size-4" />
                      <span>Sinh sơ đồ ghế tự động</span>
                    </button>
                  )}
                </div>
              )
            ) : (
              <div className="p-12 text-center bg-surface-container-low/60 rounded-2xl border border-dashed border-outline-variant space-y-2">
                <Users className="size-10 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-on-surface">
                  Khu vực vé đứng (General Admission)
                </h4>
                <p className="text-xs text-on-surface-variant max-w-md mx-auto">
                  Khu vực không cố định số ghế. Khách hàng quét mã vé tại cổng và tự do chọn vị trí
                  trong khu vực tương ứng. Sức chứa tối đa:{" "}
                  <strong>{selectedArea?.capacity.toLocaleString("vi-VN")} người</strong>.
                </p>
              </div>
            )}
          </div>
        </>
      )}

      <SeatManagementDialogs controller={controller} canEdit={canEdit} />
      <AreaManagementDialogs
        controller={controller}
        canEdit={canEdit}
        onDeleteArea={onDeleteArea}
      />
    </div>
  )
}
