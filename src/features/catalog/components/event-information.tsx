"use client"

import { useState } from "react"
import { AlertCircle, Building, Music, Tag, ImageIcon, Maximize2, X, Armchair } from "lucide-react"
import { useEventDetail } from "@/features/catalog/hooks/use-event-detail"

type Props = Pick<
  ReturnType<typeof useEventDetail>,
  "isSaleActive" | "isEnded" | "categoryName" | "locationName" | "descriptionText" | "galleryUrls"
> & {
  seatMapUrl?: string | null
}

export function EventInformation({
  isSaleActive,
  isEnded,
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
        <div className="grid grid-cols-2 gap-4 rounded-2xl border border-white/15 bg-[#242331] p-5 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#ff9479]/10 text-[#ff9479]">
              <Music className="size-5" />
            </div>
            <div>
              <span className="block text-xs text-[#aaa6b7]">Thể loại</span>
              <span className="text-sm font-bold text-white">{categoryName}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#ff9479]/10 text-[#ff9479]">
              <Building className="size-5" />
            </div>
            <div>
              <span className="block text-xs text-[#aaa6b7]">Địa điểm</span>
              <span className="block max-w-[160px] truncate text-sm font-bold text-white">
                {locationName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#ff9479]/10 text-[#ff9479]">
              <Tag className="size-5" />
            </div>
            <div>
              <span className="block text-xs text-[#aaa6b7]">Trạng thái bán</span>
              <span
                className={`text-sm font-bold ${isSaleActive ? "text-[#ffad95]" : "text-[#aaa6b7]"}`}
              >
                {isEnded ? "Đã kết thúc" : isSaleActive ? "Đang mở bán" : "Tạm khóa đặt"}
              </span>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <section className="space-y-4 rounded-2xl border border-white/15 bg-[#242331] p-6 sm:p-8">
          <h2 className="text-xl font-bold text-white">Giới thiệu sự kiện</h2>
          <div className="whitespace-pre-line text-sm leading-relaxed text-[#c9c4cf] sm:text-base">
            {descriptionText}
          </div>
        </section>

        {/* Gallery / Hình ảnh sự kiện & Poster: Xếp hàng dọc 1 ảnh 1 dòng */}
        {galleryUrls && galleryUrls.length > 0 && (
          <section className="space-y-4 rounded-2xl border border-white/15 bg-[#242331] p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-white/15 pb-3">
              <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                <ImageIcon className="size-5 text-[#ff9479]" />
                <span>Hình ảnh sự kiện & Poster thông tin</span>
              </h2>
              <span className="text-xs font-semibold text-[#bcb7c4]">{galleryUrls.length} ảnh</span>
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
        <section className="space-y-4 rounded-2xl border border-white/15 bg-[#242331] p-6 sm:p-8">
          <h2 className="text-xl font-bold text-white">Sơ đồ phân khu & khán đài</h2>
          <p className="text-xs text-[#bcb7c4] sm:text-sm">
            Khán giả vui lòng kiểm tra kỹ vị trí cổng vào và phân khu tương ứng khi mua vé.
          </p>

          {seatMapUrl ? (
            <div
              onClick={() => setPreviewImage(seatMapUrl)}
              className="group relative mx-auto max-w-3xl cursor-pointer overflow-hidden rounded-2xl border border-white/15 bg-[#161621] p-3 text-center"
              title="Nhấn để xem sơ đồ phóng to"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={seatMapUrl}
                alt="Sơ đồ phân khu & khán đài"
                className="w-full max-h-[540px] object-contain rounded-xl mx-auto group-hover:scale-[1.01] transition"
              />
              <div className="mt-2.5 flex items-center justify-center gap-1.5 text-xs font-semibold text-[#ffad95]">
                <Maximize2 className="size-3.5" />
                <span>Nhấn vào ảnh để xem sơ đồ phóng to chi tiết</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2 rounded-2xl border border-dashed border-white/20 bg-white/5 p-8 text-center">
              <Armchair className="mx-auto size-8 text-[#aaa6b7]" />
              <h4 className="text-sm font-bold text-white">
                Ban tổ chức đang cập nhật sơ đồ khán đài
              </h4>
              <p className="mx-auto max-w-md text-xs text-[#bcb7c4]">
                Sơ đồ vị trí phân khu và chỗ ngồi chính thức sẽ được công bố sớm nhất trước khi mở
                bán.
              </p>
            </div>
          )}
        </section>

        {/* Important booking notes */}
        <section className="flex items-start gap-3 rounded-2xl border border-[#ff9479]/25 bg-[#ff9479]/10 p-6 text-[#f7d6cb]">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-[#ffad95]" />
          <div className="text-xs sm:text-sm space-y-1">
            <h4 className="font-bold text-white">Lưu ý khi đặt vé</h4>
            <ul className="list-inside list-disc space-y-0.5">
              <li>Kiểm tra thông tin sự kiện và hạng vé trước khi thanh toán.</li>
              <li>Xem hướng dẫn tham gia do ban tổ chức cung cấp trước ngày diễn ra.</li>
              <li>Mỗi mã vé QR chỉ có giá trị check-in một lần duy nhất tại cổng soát vé.</li>
              <li>Thời hạn giữ chỗ hiển thị trong bước đặt vé.</li>
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
