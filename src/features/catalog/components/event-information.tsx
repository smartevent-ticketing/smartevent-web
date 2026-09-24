"use client"

import { useState } from "react"
import { AlertCircle, Building, Music, Tag, ImageIcon, Maximize2, X, Armchair } from "lucide-react"
import { useEventDetail } from "@/features/catalog/hooks/use-event-detail"

type Props = Pick<
  ReturnType<typeof useEventDetail>,
  "isSaleActive" | "categoryName" | "locationName" | "descriptionText" | "galleryUrls"
> & {
  seatMapUrl?: string | null
}

export function EventInformation({
  isSaleActive,
  categoryName,
  locationName,
  descriptionText,
  seatMapUrl,
  galleryUrls = [],
}: Props) {
  const [previewImage, setPreviewImage] = useState<string | null>(null)

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

        {/* Gallery / Hình ảnh sự kiện & Poster: Xếp hàng dọc 1 ảnh 1 dòng */}
        {galleryUrls && galleryUrls.length > 0 && (
          <section className="bg-white rounded-2xl p-6 sm:p-8 border border-outline-variant/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
              <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <ImageIcon className="size-5 text-primary" />
                <span>Hình ảnh sự kiện & Poster thông tin</span>
              </h2>
              <span className="text-xs font-semibold text-on-surface-variant">
                {galleryUrls.length} ảnh
              </span>
            </div>
            <div className="flex flex-col gap-6 pt-2">
              {galleryUrls.map((url, idx) => (
                <div
                  key={idx}
                  onClick={() => setPreviewImage(url)}
                  className="w-full max-w-2xl mx-auto rounded-2xl overflow-hidden border border-outline-variant/60 shadow-xs bg-slate-950 cursor-pointer group relative"
                  title="Nhấn để xem ảnh phóng to"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Event poster ${idx + 1}`}
                    className="w-full h-auto object-contain group-hover:scale-[1.01] transition duration-300 mx-auto"
                  />
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <span className="px-3.5 py-1.5 bg-black/70 text-white rounded-xl text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5 shadow-md">
                      <Maximize2 className="size-3.5" />
                      <span>Xem phóng to</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Sơ đồ phân khu & khán đài */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 border border-outline-variant/60 shadow-xs space-y-4">
          <h2 className="text-xl font-bold text-on-surface">Sơ đồ phân khu & khán đài</h2>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Khán giả vui lòng kiểm tra kỹ vị trí cổng vào và phân khu tương ứng khi mua vé.
          </p>

          {seatMapUrl ? (
            <div
              onClick={() => setPreviewImage(seatMapUrl)}
              className="rounded-2xl overflow-hidden border border-outline-variant/60 bg-slate-900/5 p-3 text-center cursor-pointer group relative max-w-3xl mx-auto"
              title="Nhấn để xem sơ đồ phóng to"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={seatMapUrl}
                alt="Sơ đồ phân khu & khán đài"
                className="w-full max-h-[540px] object-contain rounded-xl mx-auto group-hover:scale-[1.01] transition"
              />
              <div className="mt-2.5 flex items-center justify-center gap-1.5 text-xs text-primary font-semibold">
                <Maximize2 className="size-3.5" />
                <span>Nhấn vào ảnh để xem sơ đồ phóng to chi tiết</span>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-surface-container-low/60 border border-dashed border-outline-variant text-center space-y-2">
              <Armchair className="size-8 text-on-surface-variant/40 mx-auto" />
              <h4 className="text-sm font-bold text-on-surface">
                Ban tổ chức đang cập nhật sơ đồ khán đài
              </h4>
              <p className="text-xs text-on-surface-variant max-w-md mx-auto">
                Sơ đồ vị trí phân khu và chỗ ngồi chính thức sẽ được công bố sớm nhất trước khi mở
                bán.
              </p>
            </div>
          )}
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

      {/* Lightbox Modal phóng to ảnh */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl max-h-[92vh] w-full flex items-center justify-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImage}
              alt="Phóng to ảnh"
              className="max-w-full max-h-[88vh] object-contain rounded-2xl shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute -top-3 -right-3 p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full shadow-lg transition cursor-pointer border border-white/20"
              title="Đóng ảnh"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
