"use client"

import { AlertCircle, Building, Music, Tag } from "lucide-react"
import { useEventDetail } from "@/features/catalog/hooks/use-event-detail"

type Props = Pick<
  ReturnType<typeof useEventDetail>,
  "isSaleActive" | "categoryName" | "locationName" | "descriptionText"
>

export function EventInformation({
  isSaleActive,
  categoryName,
  locationName,
  descriptionText,
}: Props) {
  return (
    <>
      <div className="lg:col-span-8 space-y-8">
        {/* Quick Info Bar */}
        <div className="bg-white rounded-2xl p-5 border border-outline-variant/60 shadow-xs grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
              <Music className="size-5" />
            </div>
            <div>
              <span className="text-xs text-on-surface-variant block">Thể loại</span>
              <span className="text-sm font-bold text-on-surface">{categoryName}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
              <Building className="size-5" />
            </div>
            <div>
              <span className="text-xs text-on-surface-variant block">Địa điểm</span>
              <span className="text-sm font-bold text-on-surface truncate block max-w-[160px]">
                {locationName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
            <div className="size-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
              <Tag className="size-5" />
            </div>
            <div>
              <span className="text-xs text-on-surface-variant block">Trạng thái bán</span>
              <span
                className={`text-sm font-bold ${isSaleActive ? "text-primary" : "text-gray-500"}`}
              >
                {isSaleActive ? "Đang mở bán" : "Tạm khóa đặt"}
              </span>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 border border-outline-variant/60 shadow-xs space-y-4">
          <h2 className="text-xl font-bold text-on-surface">Giới thiệu sự kiện</h2>
          <div className="text-sm sm:text-base text-on-surface-variant leading-relaxed whitespace-pre-line">
            {descriptionText}
          </div>
        </section>

        {/* Sơ đồ khu vực */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 border border-outline-variant/60 shadow-xs space-y-4">
          <h2 className="text-xl font-bold text-on-surface">Sơ đồ phân khu & khán đài</h2>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Khán giả vui lòng kiểm tra kỹ vị trí cổng vào và phân khu tương ứng khi mua vé.
          </p>
          <div className="rounded-xl overflow-hidden border border-outline-variant bg-surface-container-low p-4 text-center">
            <img
              src="/images/concert-banner.jpg"
              alt="Seating Plan"
              className="w-full max-h-[360px] object-cover rounded-lg"
            />
            <span className="text-xs text-on-surface-variant mt-2 block">
              Sơ đồ phân khu: {locationName}
            </span>
          </div>
        </section>

        {/* Important Rules */}
        <section className="bg-amber-50 rounded-2xl p-6 border border-amber-200 text-amber-900 flex items-start gap-3">
          <AlertCircle className="size-5 shrink-0 text-amber-600 mt-0.5" />
          <div className="text-xs sm:text-sm space-y-1">
            <h4 className="font-bold">Quy định tham gia sự kiện:</h4>
            <ul className="list-disc list-inside space-y-0.5 text-amber-800">
              <li>Khán giả từ 12 tuổi trở lên mới được tham dự.</li>
              <li>Không mang đồ ăn, thức uống, vật sắc nhọn hoặc chất cấm vào sự kiện.</li>
              <li>Mỗi mã vé QR chỉ có giá trị check-in một lần duy nhất tại cổng soát vé.</li>
              <li>Phiên giữ chỗ đặt vé sẽ tự động hết hạn sau 10 phút.</li>
            </ul>
          </div>
        </section>
      </div>
    </>
  )
}
