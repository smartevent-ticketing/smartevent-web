"use client"

import { Calendar, Clock, ShieldAlert } from "lucide-react"

interface SalePhaseItem {
  id: string
  name: string
  startTime: string
  endTime: string
  status?: string
  maxPerOrder?: number
  ticketTypeName?: string
}

interface SalePhasesTabProps {
  eventId: string
  salePhases: SalePhaseItem[]
}

export function SalePhasesTab({ salePhases }: SalePhasesTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-base font-bold text-on-surface">Lịch trình các đợt mở bán</h3>
          <p className="text-xs text-on-surface-variant">
            Kiểm soát thời gian mở cổng bán vé và hạn mức mua vé của khách hàng trong từng giai
            đoạn.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {salePhases.length === 0 ? (
          <div className="col-span-2 bg-white border border-outline-variant/60 rounded-3xl p-12 text-center space-y-3">
            <Calendar className="size-10 text-primary/40 mx-auto" />
            <h4 className="text-sm font-bold text-on-surface">Chưa có đợt bán vé nào</h4>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
              Đợt bán vé sẽ tự động được khởi tạo theo thông tin thời gian mở bán của sự kiện.
            </p>
          </div>
        ) : (
          salePhases.map((phase) => {
            const now = new Date().getTime()
            const start = new Date(phase.startTime).getTime()
            const end = new Date(phase.endTime).getTime()
            const isActive = now >= start && now <= end
            const isUpcoming = now < start
            const isExpired = now > end

            return (
              <div
                key={phase.id}
                className="bg-white border border-outline-variant/60 rounded-3xl p-6 shadow-xs flex flex-col justify-between gap-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <Clock className="size-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-on-surface">{phase.name}</h4>
                      {phase.ticketTypeName && (
                        <span className="text-[11px] text-on-surface-variant">
                          Áp dụng: {phase.ticketTypeName}
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      isActive
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : isUpcoming
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-gray-100 text-gray-600 border border-gray-200"
                    }`}
                  >
                    {isActive ? "Đang mở bán" : isUpcoming ? "Sắp diễn ra" : "Đã kết thúc"}
                  </span>
                </div>

                <div className="space-y-2 bg-surface-container-low/60 rounded-2xl p-4 text-xs">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Thời gian bắt đầu:</span>
                    <strong className="text-on-surface font-mono">
                      {new Date(phase.startTime).toLocaleString("vi-VN")}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Thời gian kết thúc:</span>
                    <strong className="text-on-surface font-mono">
                      {new Date(phase.endTime).toLocaleString("vi-VN")}
                    </strong>
                  </div>
                  <div className="flex justify-between border-t border-outline-variant/40 pt-2">
                    <span className="text-on-surface-variant">Tối đa mỗi đơn:</span>
                    <strong className="text-primary font-mono font-bold">
                      {phase.maxPerOrder || 4} vé / khách
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-on-surface-variant">
                  <ShieldAlert className="size-3.5 text-primary shrink-0" />
                  <span>Thời gian giữ chỗ thanh toán chuẩn 10 phút qua VNPay</span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
