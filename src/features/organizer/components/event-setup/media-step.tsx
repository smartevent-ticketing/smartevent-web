"use client"

import { useRef, useState } from "react"
import {
  ArrowRight,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Trash2,
  UploadCloud,
  AlertCircle,
} from "lucide-react"
import type { EventMediaResponse } from "@/lib/api/event-setup-contract"

interface Props {
  setCurrentStep: (step: number) => void
  bannerMedia: EventMediaResponse | null
  galleryMedia: EventMediaResponse[]
  onUploadBanner: (file: File) => Promise<void>
  onDeleteBanner: () => Promise<void>
  onUploadGallery: (file: File) => Promise<void>
  onDeleteGallery: (eventFileId: string) => Promise<void>
  isUploadingBanner: boolean
  isUploadingGallery: boolean
  mediaError: string | null
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

export function EventMediaStep({
  setCurrentStep,
  bannerMedia,
  galleryMedia,
  onUploadBanner,
  onDeleteBanner,
  onUploadGallery,
  onDeleteGallery,
  isUploadingBanner,
  isUploadingGallery,
  mediaError,
}: Props) {
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const [localError, setLocalError] = useState<string | null>(null)
  const [isDraggingBanner, setIsDraggingBanner] = useState(false)

  function validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Định dạng không được hỗ trợ. Vui lòng chỉ chọn ảnh JPG, PNG hoặc WebP."
    }
    if (file.size > MAX_FILE_SIZE) {
      return "Dung lượng ảnh vượt quá giới hạn 10MB. Vui lòng nén ảnh trước khi tải lên."
    }
    return null
  }

  async function handleBannerSelect(file: File) {
    setLocalError(null)
    const err = validateFile(file)
    if (err) {
      setLocalError(err)
      return
    }
    try {
      await onUploadBanner(file)
    } catch {
      // Handled by parent hook
    }
  }

  async function handleGallerySelect(file: File) {
    setLocalError(null)
    if (galleryMedia.length >= 8) {
      setLocalError("Đã đạt giới hạn tối đa 8 ảnh trong bộ sưu tập.")
      return
    }
    const err = validateFile(file)
    if (err) {
      setLocalError(err)
      return
    }
    try {
      await onUploadGallery(file)
    } catch {
      // Handled by parent hook
    }
  }

  const activeError = localError || mediaError

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-outline-variant/60 shadow-xs space-y-6">
      <div>
        <h2 className="text-xl font-bold text-on-surface">Bước 3: Ảnh sự kiện & Bộ sưu tập</h2>
        <p className="text-xs text-on-surface-variant mt-1">
          Ảnh bìa đẹp mắt giúp thu hút người mua vé. Sự kiện bắt buộc phải có ít nhất 1 ảnh bìa
          (Banner) trước khi gửi phê duyệt.
        </p>
      </div>

      {activeError && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0 text-red-500" />
          <span>{activeError}</span>
        </div>
      )}

      {/* ─── 1. BANNER UPLOAD (BẮT BUỘC) ─────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-on-surface flex items-center gap-1.5">
            Ảnh bìa sự kiện (Banner) <span className="text-red-500">*</span>
          </label>
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
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleBannerSelect(file)
            e.target.value = ""
          }}
        />

        {bannerMedia ? (
          <div className="relative group rounded-2xl overflow-hidden border border-outline-variant/60 aspect-video max-h-[320px] bg-slate-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bannerMedia.fileUrl}
              alt="Event Banner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3 p-4">
              <button
                type="button"
                disabled={isUploadingBanner}
                onClick={() => bannerInputRef.current?.click()}
                className="px-4 py-2 bg-white/90 hover:bg-white text-slate-800 rounded-xl text-xs font-bold shadow-sm transition"
              >
                Thay đổi ảnh
              </button>
              <button
                type="button"
                disabled={isUploadingBanner}
                onClick={onDeleteBanner}
                className="p-2 bg-red-600/90 hover:bg-red-600 text-white rounded-xl shadow-sm transition"
                title="Gỡ ảnh bìa"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            {isUploadingBanner && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 text-white">
                <Loader2 className="size-6 animate-spin text-primary" />
                <span className="text-xs font-medium">Đang tải ảnh mới lên...</span>
              </div>
            )}
          </div>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDraggingBanner(true)
            }}
            onDragLeave={() => setIsDraggingBanner(false)}
            onDrop={(e) => {
              e.preventDefault()
              setIsDraggingBanner(false)
              const file = e.dataTransfer.files?.[0]
              if (file) handleBannerSelect(file)
            }}
            onClick={() => {
              if (!isUploadingBanner) bannerInputRef.current?.click()
            }}
            className={`cursor-pointer border-2 border-dashed rounded-2xl p-8 text-center transition flex flex-col items-center justify-center aspect-video max-h-[260px] ${
              isDraggingBanner
                ? "border-primary bg-primary/5"
                : "border-outline-variant/80 hover:border-primary hover:bg-surface-container-low"
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
                    Nhấn để chọn ảnh hoặc kéo thả vào đây
                  </span>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Tỷ lệ chuẩn 16:9 (1200x675px) • Tối đa 10MB • JPG, PNG, WebP
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── 2. GALLERY UPLOAD (TÙY CHỌN) ────────────────── */}
      <div className="space-y-3 pt-2 border-t border-outline-variant/40">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-bold text-on-surface">
              Bộ sưu tập ảnh phụ (Gallery)
            </label>
            <p className="text-xs text-on-surface-variant">
              Tối đa 8 ảnh ({galleryMedia.length}/8 ảnh đã tải lên)
            </p>
          </div>
          {galleryMedia.length < 8 && (
            <button
              type="button"
              disabled={isUploadingGallery}
              onClick={() => galleryInputRef.current?.click()}
              className="px-3.5 py-1.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-xl text-xs font-bold transition flex items-center gap-1.5"
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
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleGallerySelect(file)
            e.target.value = ""
          }}
        />

        {galleryMedia.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {galleryMedia.map((img) => (
              <div
                key={img.eventFileId}
                className="relative group rounded-xl overflow-hidden border border-outline-variant/60 aspect-video bg-slate-900"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.fileUrl} alt="Gallery item" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-2">
                  <button
                    type="button"
                    onClick={() => onDeleteGallery(img.eventFileId)}
                    className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition"
                    title="Xóa ảnh này"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isUploadingGallery && (
          <div className="flex items-center gap-2 text-xs text-on-surface-variant p-2">
            <Loader2 className="size-4 animate-spin text-primary" />
            <span>Đang tải ảnh bộ sưu tập...</span>
          </div>
        )}
      </div>

      {/* ─── ACTION BUTTONS ──────────────────────────────── */}
      <div className="pt-4 flex justify-between items-center border-t border-outline-variant/40">
        <button
          type="button"
          onClick={() => setCurrentStep(2)}
          className="px-5 py-2.5 text-xs font-bold text-on-surface-variant hover:text-on-surface transition"
        >
          Quay lại Bước 2
        </button>
        <div className="flex items-center gap-3">
          {!bannerMedia && (
            <span className="text-xs text-amber-600 hidden sm:inline-block">
              * Vui lòng tải ảnh bìa để tiếp tục
            </span>
          )}
          <button
            type="button"
            disabled={!bannerMedia || isUploadingBanner}
            onClick={() => setCurrentStep(4)}
            className="px-6 py-2.5 bg-primary hover:bg-primary-hover disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2"
          >
            Tiếp tục: Thiết lập hạng vé
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
