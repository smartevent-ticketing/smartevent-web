"use client"

import { useEffect, useRef, useState } from "react"
import { AlertCircle, Armchair, Building2, ImageIcon, Maximize2, Tag, X } from "lucide-react"

import { MotionReveal } from "@/components/shared/motion-reveal"
import { EventMediaImage } from "./event-media-image"
import type { useEventDetail } from "@/features/catalog/hooks/use-event-detail"

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
  const [previewImage, setPreviewImage] = useState<{ url: string; alt: string } | null>(null)
  const previewDialogRef = useRef<HTMLDialogElement>(null)
  const previewTriggerRef = useRef<HTMLButtonElement>(null)

  function closePreview() {
    previewDialogRef.current?.close()
    setPreviewImage(null)
    previewTriggerRef.current?.focus()
  }

  useEffect(() => {
    const dialog = previewDialogRef.current
    if (!previewImage || !dialog) return
    dialog.showModal()
    return () => dialog.close()
  }, [previewImage])

  return (
    <>
      <div className="min-w-0 space-y-6 lg:col-span-8">
        <div className="grid gap-5 rounded-2xl border border-border bg-white p-5 sm:grid-cols-3 sm:gap-4 sm:p-6">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-container text-primary">
              <Tag className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <span className="block text-xs text-muted">Danh mục</span>
              <span className="mt-1 block break-words text-sm font-semibold text-foreground">
                {categoryName}
              </span>
            </div>
          </div>
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-container text-primary">
              <Building2 className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <span className="block text-xs text-muted">Địa điểm</span>
              <span className="mt-1 block break-words text-sm font-semibold text-foreground">
                {locationName}
              </span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-container text-primary">
              <Armchair className="size-4" aria-hidden="true" />
            </span>
            <div>
              <span className="block text-xs text-muted">Tình trạng</span>
              <span
                className={
                  "mt-1 block text-sm font-semibold " +
                  (isSaleActive ? "text-emerald-700" : "text-muted")
                }
              >
                {isEnded ? "Đã kết thúc" : isSaleActive ? "Đang mở bán" : "Chưa mở bán"}
              </span>
            </div>
          </div>
        </div>

        <MotionReveal>
          <section
            aria-labelledby="event-description-title"
            className="rounded-2xl border border-border bg-white p-6 sm:p-8"
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              Về trải nghiệm này
            </span>
            <h2
              id="event-description-title"
              className="mt-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl"
            >
              Giới thiệu sự kiện
            </h2>
            <div className="mt-5 whitespace-pre-line break-words text-sm leading-8 text-muted sm:text-base">
              {descriptionText}
            </div>
          </section>
        </MotionReveal>

        {galleryUrls.length > 0 && (
          <MotionReveal>
            <section
              aria-labelledby="event-gallery-title"
              className="rounded-2xl border border-border bg-white p-6 sm:p-8"
            >
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                    Từ ban tổ chức
                  </span>
                  <h2
                    id="event-gallery-title"
                    className="mt-2 text-xl font-bold tracking-tight text-foreground"
                  >
                    Hình ảnh &amp; thông tin
                  </h2>
                </div>
                <span className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted">
                  <ImageIcon className="size-3.5" aria-hidden="true" />
                  {galleryUrls.length} ảnh
                </span>
              </div>
              <div className="flex flex-col gap-5">
                {galleryUrls.map((url, idx) => (
                  <button
                    key={url + idx}
                    type="button"
                    onClick={(event) => {
                      previewTriggerRef.current = event.currentTarget
                      setPreviewImage({ url, alt: "Hình ảnh sự kiện " + (idx + 1) })
                    }}
                    aria-label={"Phóng to hình ảnh sự kiện " + (idx + 1)}
                    className="group relative mx-auto w-full max-w-2xl cursor-zoom-in overflow-hidden rounded-xl border border-border bg-surface text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                  >
                    <EventMediaImage
                      src={url}
                      alt={"Hình ảnh sự kiện " + (idx + 1)}
                      className="mx-auto h-auto w-full object-contain"
                    />
                    <span className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-lg border border-white/60 bg-white/95 px-3 py-2 text-xs font-semibold text-foreground shadow-sm transition-colors group-hover:bg-primary group-hover:text-on-primary group-focus-visible:bg-primary group-focus-visible:text-on-primary">
                      <Maximize2 className="size-3.5" aria-hidden="true" />
                      Xem phóng to
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </MotionReveal>
        )}

        <MotionReveal>
          <section
            aria-labelledby="event-seatmap-title"
            className="rounded-2xl border border-border bg-white p-6 sm:p-8"
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              Chuẩn bị trước khi tham gia
            </span>
            <h2
              id="event-seatmap-title"
              className="mt-2 text-xl font-bold tracking-tight text-foreground"
            >
              Sơ đồ phân khu &amp; khán đài
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              Xem vị trí phân khu và cổng vào do ban tổ chức cung cấp để chọn hạng vé phù hợp.
            </p>
            {seatMapUrl ? (
              <button
                type="button"
                onClick={(event) => {
                  previewTriggerRef.current = event.currentTarget
                  setPreviewImage({ url: seatMapUrl, alt: "Sơ đồ phân khu và khán đài" })
                }}
                aria-label="Phóng to sơ đồ phân khu và khán đài"
                className="group mt-5 w-full cursor-zoom-in overflow-hidden rounded-xl border border-border bg-surface p-3 text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                <EventMediaImage
                  src={seatMapUrl}
                  alt="Sơ đồ phân khu và khán đài"
                  className="mx-auto max-h-[540px] w-full rounded-lg object-contain"
                />
                <span className="mt-3 flex items-center justify-center gap-2 pb-1 text-xs font-semibold text-primary">
                  <Maximize2 className="size-3.5" aria-hidden="true" />
                  Xem sơ đồ chi tiết
                </span>
              </button>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-border bg-surface px-5 py-9 text-center">
                <span className="mx-auto flex size-12 items-center justify-center rounded-xl border border-border bg-white text-slate-400">
                  <Armchair className="size-6" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-sm font-semibold text-foreground">
                  Chưa có sơ đồ phân khu
                </h3>
                <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-muted">
                  Ban tổ chức chưa cung cấp hình ảnh sơ đồ cho sự kiện này. Kiểm tra thông tin phân
                  khu tại bước chọn vé.
                </p>
              </div>
            )}
          </section>
        </MotionReveal>

        <section
          aria-labelledby="event-notes-title"
          className="flex items-start gap-3.5 rounded-2xl border border-primary/15 bg-primary-container p-5 sm:p-6"
        >
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <h2 id="event-notes-title" className="text-sm font-semibold text-foreground">
              Trước khi đặt vé
            </h2>
            <ul className="mt-3 list-outside list-disc space-y-2 pl-4 text-xs leading-6 text-muted sm:text-sm">
              <li>Kiểm tra thời gian, địa điểm và hạng vé trước khi thanh toán.</li>
              <li>Thời hạn giữ chỗ được hiển thị trong bước đặt vé.</li>
              <li>Mỗi vé QR được check-in một lần tại cổng soát vé.</li>
              <li>Xem hướng dẫn tham gia do ban tổ chức cung cấp trước ngày diễn ra.</li>
            </ul>
          </div>
        </section>
      </div>

      {previewImage && (
        <dialog
          ref={previewDialogRef}
          aria-label={previewImage.alt}
          onCancel={(event) => {
            event.preventDefault()
            closePreview()
          }}
          onClick={(event) => {
            if (event.target !== event.currentTarget) return
            const bounds = event.currentTarget.getBoundingClientRect()
            if (
              event.clientX < bounds.left ||
              event.clientX > bounds.right ||
              event.clientY < bounds.top ||
              event.clientY > bounds.bottom
            )
              closePreview()
          }}
          className="fixed inset-0 m-auto max-h-[92dvh] w-[calc(100%_-_2rem)] max-w-6xl overflow-auto rounded-2xl border border-white/15 bg-slate-950 p-3 text-white shadow-2xl backdrop:bg-slate-950/85 backdrop:backdrop-blur-sm sm:p-5"
        >
          <div className="mb-3 flex items-center justify-between gap-4">
            <p className="text-xs font-medium text-slate-300">{previewImage.alt}</p>
            <button
              type="button"
              onClick={closePreview}
              aria-label="Đóng ảnh phóng to"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
          <EventMediaImage
            src={previewImage.url}
            alt={previewImage.alt}
            className="mx-auto max-h-[78dvh] max-w-full rounded-lg object-contain"
          />
        </dialog>
      )}
    </>
  )
}
