"use client"

import { useEffect, useRef, useState } from "react"
import {
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Trash2,
  UploadCloud,
  ImageIcon,
  Lock,
} from "lucide-react"
import { organizerApi } from "@/features/organizer/api/organizer-api"
import type { EventMediaResponse } from "@/lib/api/event-setup-contract"
import { getApiErrorMessage } from "@/lib/api/result"

interface MediaTabProps {
  eventId: string
  isDraft: boolean
  onMediaChanged?: () => void | Promise<void>
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

export function MediaTab({ eventId, isDraft, onMediaChanged }: MediaTabProps) {
  const [bannerMedia, setBannerMedia] = useState<EventMediaResponse | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [galleryMedia, setGalleryMedia] = useState<EventMediaResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploadingBanner, setIsUploadingBanner] = useState(false)
  const [isUploadingGallery, setIsUploadingGallery] = useState(false)
  const [isDraggingBanner, setIsDraggingBanner] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const bannerInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let isMounted = true
    async function fetchMedia() {
      setIsLoading(true)
      setErrorMessage(null)
      try {
        const res = await organizerApi.getEventMedia(eventId)
        if (!isMounted) return
        const list = (res.data?.data ?? res.data ?? []) as EventMediaResponse[]
        const banner = list.find((m) => m.fileType === "BANNER") || null
        const gallery = list
          .filter((m) => m.fileType === "GALLERY")
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        setBannerMedia(banner)
        setGalleryMedia(gallery)
      } catch (err) {
        if (!isMounted) return
        setErrorMessage(
          getApiErrorMessage(err, "Không thể tải danh sách tài nguyên ảnh của sự kiện."),
        )
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchMedia()
    return () => {
      isMounted = false
    }
  }, [eventId])

  function validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Định dạng không được hỗ trợ. Vui lòng chỉ chọn ảnh JPG, PNG hoặc WebP."
    }
    if (file.size > MAX_FILE_SIZE) {
      return "Dung lượng ảnh vượt quá giới hạn 10MB. Vui lòng nén ảnh trước khi tải lên."
    }
    return null
  }

  const handleBannerSelect = async (file: File) => {
    if (!isDraft) return
    setErrorMessage(null)
    setSuccessMessage(null)

    const err = validateFile(file)
    if (err) {
      setErrorMessage(err)
      return
    }

    const preview = URL.createObjectURL(file)
    setBannerPreview(preview)
    setIsUploadingBanner(true)
    try {
      const res = await organizerApi.uploadEventMedia(eventId, file, "BANNER")
      const media = (res.data?.data ?? res.data) as EventMediaResponse
      if (media) {
        setBannerMedia(media)
        setBannerPreview(null)
        setSuccessMessage("Đã cập nhật ảnh bìa sự kiện thành công.")
        await onMediaChanged?.()
      }
    } catch (apiErr) {
      setBannerPreview(null)
      setErrorMessage(getApiErrorMessage(apiErr, "Không thể tải ảnh bìa lên. Vui lòng thử lại."))
    } finally {
      setIsUploadingBanner(false)
    }
  }

  const handleDeleteBanner = async () => {
    if (!isDraft) return
    setErrorMessage(null)
    setSuccessMessage(null)

    setIsUploadingBanner(true)
    try {
      if (bannerMedia?.eventFileId) {
        await organizerApi.deleteEventMedia(eventId, bannerMedia.eventFileId)
      }
      setBannerMedia(null)
      setBannerPreview(null)
      setSuccessMessage("Đã gỡ ảnh bìa sự kiện.")
      await onMediaChanged?.()
    } catch (apiErr) {
      setErrorMessage(getApiErrorMessage(apiErr, "Không thể xóa ảnh bìa."))
    } finally {
      setIsUploadingBanner(false)
    }
  }

  const handleGallerySelect = async (file: File) => {
    if (!isDraft) return
    setErrorMessage(null)
    setSuccessMessage(null)

    if (galleryMedia.length >= 10) {
      setErrorMessage("Đã đạt giới hạn tối đa 10 ảnh trong bộ sưu tập.")
      return
    }

    const err = validateFile(file)
    if (err) {
      setErrorMessage(err)
      return
    }

    setIsUploadingGallery(true)
    try {
      const res = await organizerApi.uploadEventMedia(eventId, file, "GALLERY")
      const media = (res.data?.data ?? res.data) as EventMediaResponse
      if (media) {
        setGalleryMedia((prev) => [...prev, media])
        setSuccessMessage("Đã thêm ảnh vào bộ sưu tập.")
        await onMediaChanged?.()
      }
    } catch (apiErr) {
      setErrorMessage(getApiErrorMessage(apiErr, "Không thể tải ảnh bộ sưu tập."))
    } finally {
      setIsUploadingGallery(false)
    }
  }

  const handleDeleteGallery = async (eventFileId: string) => {
    if (!isDraft) return
    setErrorMessage(null)
    setSuccessMessage(null)

    setIsUploadingGallery(true)
    try {
      await organizerApi.deleteEventMedia(eventId, eventFileId)
      setGalleryMedia((prev) => prev.filter((m) => m.eventFileId !== eventFileId))
      setSuccessMessage("Đã gỡ ảnh khỏi bộ sưu tập.")
      await onMediaChanged?.()
    } catch (apiErr) {
      setErrorMessage(getApiErrorMessage(apiErr, "Không thể xóa ảnh."))
    } finally {
      setIsUploadingGallery(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white border border-outline-variant/60 rounded-3xl p-12 text-center shadow-xs">
        <Loader2 className="size-8 animate-spin text-primary mx-auto" />
        <p className="text-xs text-on-surface-variant font-medium mt-3">
          Đang tải dữ liệu media của sự kiện...
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-outline-variant/60 rounded-3xl p-6 sm:p-8 shadow-xs space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/40 pb-5">
        <div>
          <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <ImageIcon className="size-5 text-primary" />
            <span>Ảnh sự kiện & Bộ sưu tập</span>
          </h2>
          <p className="text-xs text-on-surface-variant mt-1">
            Quản lý ảnh bìa đại diện (Banner) và các hình ảnh truyền thông (Gallery) của sự kiện.
          </p>
        </div>

        {!isDraft && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-semibold">
            <Lock className="size-3.5 text-amber-600" />
            <span>Chỉ đọc (Sự kiện đã qua bước Nháp)</span>
          </div>
        )}
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-600 flex items-center gap-2.5">
          <AlertCircle className="size-4 shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-700 flex items-center gap-2.5">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ─── 1. BANNER SECTION (BẮT BUỘC) ─────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-bold text-on-surface flex items-center gap-1.5">
              Ảnh bìa sự kiện (Banner) <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-on-surface-variant">
              Tỷ lệ khuyến nghị 16:9 (1200x675px) • Tối đa 10MB • Định dạng JPG, PNG, WebP. Bắt buộc
              có trước khi gửi duyệt.
            </p>
          </div>
          {bannerMedia && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="size-3.5" /> Đã có ảnh bìa hợp lệ
            </span>
          )}
        </div>

        <input
          ref={bannerInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          disabled={!isDraft || isUploadingBanner}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleBannerSelect(file)
            e.target.value = ""
          }}
        />

        {bannerPreview || bannerMedia ? (
          <div className="relative group rounded-2xl overflow-hidden border border-outline-variant/60 aspect-video max-h-[360px] bg-slate-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bannerPreview || bannerMedia?.fileUrl}
              alt="Event Banner"
              className="w-full h-full object-cover"
            />
            {isDraft && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3 p-4">
                <button
                  type="button"
                  disabled={isUploadingBanner}
                  onClick={() => bannerInputRef.current?.click()}
                  className="px-4 py-2 bg-white/95 hover:bg-white text-slate-800 rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
                >
                  Thay đổi ảnh bìa
                </button>
                <button
                  type="button"
                  disabled={isUploadingBanner}
                  onClick={handleDeleteBanner}
                  className="p-2 bg-red-600/90 hover:bg-red-600 text-white rounded-xl shadow-sm transition cursor-pointer"
                  title="Gỡ ảnh bìa"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            )}
            {isUploadingBanner && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 text-white">
                <Loader2 className="size-6 animate-spin text-primary" />
                <span className="text-xs font-medium">Đang xử lý ảnh bìa...</span>
              </div>
            )}
          </div>
        ) : (
          <div
            onDragOver={(e) => {
              if (!isDraft) return
              e.preventDefault()
              setIsDraggingBanner(true)
            }}
            onDragLeave={() => setIsDraggingBanner(false)}
            onDrop={(e) => {
              if (!isDraft) return
              e.preventDefault()
              setIsDraggingBanner(false)
              const file = e.dataTransfer.files?.[0]
              if (file) handleBannerSelect(file)
            }}
            onClick={() => {
              if (isDraft && !isUploadingBanner) bannerInputRef.current?.click()
            }}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition flex flex-col items-center justify-center aspect-video max-h-[260px] ${
              !isDraft
                ? "border-outline-variant/60 bg-surface-container-low cursor-not-allowed opacity-60"
                : isDraggingBanner
                  ? "border-primary bg-primary/5 cursor-pointer"
                  : "border-outline-variant/80 hover:border-primary hover:bg-surface-container-low cursor-pointer"
            }`}
          >
            {isUploadingBanner ? (
              <div className="flex flex-col items-center gap-2 text-on-surface-variant">
                <Loader2 className="size-8 animate-spin text-primary" />
                <span className="text-sm font-semibold">Đang tải ảnh lên hệ thống...</span>
                <span className="text-xs text-on-surface-variant">Vui lòng chờ trong giây lát</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <UploadCloud className="size-6" />
                </div>
                <div>
                  <span className="text-sm font-bold text-on-surface">
                    {isDraft
                      ? "Nhấn để chọn ảnh hoặc kéo thả vào đây"
                      : "Chưa có ảnh bìa được tải lên"}
                  </span>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Tỷ lệ chuẩn 16:9 • Tối đa 10MB • JPG, PNG, WebP
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── 2. GALLERY SECTION (TÙY CHỌN) ────────────────── */}
      <div className="space-y-4 pt-4 border-t border-outline-variant/40">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-bold text-on-surface">
              Bộ sưu tập ảnh phụ (Gallery)
            </label>
            <p className="text-xs text-on-surface-variant">
              Tối đa 10 ảnh ({galleryMedia.length}/10 ảnh đã tải lên)
            </p>
          </div>
          {isDraft && galleryMedia.length < 10 && (
            <button
              type="button"
              disabled={isUploadingGallery}
              onClick={() => galleryInputRef.current?.click()}
              className="px-3.5 py-1.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <ImagePlus className="size-3.5" />
              Thêm ảnh
            </button>
          )}
        </div>

        <input
          ref={galleryInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          disabled={!isDraft || isUploadingGallery}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleGallerySelect(file)
            e.target.value = ""
          }}
        />

        {galleryMedia.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {galleryMedia.map((img) => (
              <div
                key={img.eventFileId}
                className="relative group rounded-xl overflow-hidden border border-outline-variant/60 aspect-video bg-slate-900"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.fileUrl} alt="Gallery item" className="w-full h-full object-cover" />
                {isDraft && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-2">
                    <button
                      type="button"
                      onClick={() => handleDeleteGallery(img.eventFileId)}
                      className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition cursor-pointer"
                      title="Xóa ảnh này"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-surface-container-low border border-dashed border-outline-variant/60 text-center text-xs text-on-surface-variant">
            Chưa có ảnh phụ nào trong bộ sưu tập.
          </div>
        )}

        {isUploadingGallery && (
          <div className="flex items-center gap-2 text-xs text-on-surface-variant p-2">
            <Loader2 className="size-4 animate-spin text-primary" />
            <span>Đang tải ảnh bộ sưu tập...</span>
          </div>
        )}
      </div>
    </div>
  )
}
