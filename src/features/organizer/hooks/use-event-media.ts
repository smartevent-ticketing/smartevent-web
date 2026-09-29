"use client"

import { useEffect, useRef, useState } from "react"
import { organizerApi } from "../api/organizer-api"
import type { EventMediaResponse } from "@/lib/api/event-setup-contract"
import { getApiErrorMessage } from "@/lib/api/result"
import type { MediaTabProps } from "../components/event-management/media-tab-types"
import { bannerResolutionError, readImageDimensions } from "../model/banner-dimensions"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

export function useEventMedia({ eventId, isDraft, onMediaChanged }: MediaTabProps) {
  const [bannerMedia, setBannerMedia] = useState<EventMediaResponse | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [seatMapMedia, setSeatMapMedia] = useState<EventMediaResponse | null>(null)
  const [seatMapPreview, setSeatMapPreview] = useState<string | null>(null)
  const [galleryMedia, setGalleryMedia] = useState<EventMediaResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploadingBanner, setIsUploadingBanner] = useState(false)
  const [isUploadingSeatMap, setIsUploadingSeatMap] = useState(false)
  const [isUploadingGallery, setIsUploadingGallery] = useState(false)
  const [isReorderingGallery, setIsReorderingGallery] = useState(false)
  const [isDraggingBanner, setIsDraggingBanner] = useState(false)
  const [isDraggingSeatMap, setIsDraggingSeatMap] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const bannerInputRef = useRef<HTMLInputElement>(null)
  const seatMapInputRef = useRef<HTMLInputElement>(null)
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
        const seatMap = list.find((m) => m.fileType === "SEAT_MAP") || null
        const gallery = list
          .filter((m) => m.fileType === "GALLERY")
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        setBannerMedia(banner)
        setSeatMapMedia(seatMap)
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

    try {
      const { width, height } = await readImageDimensions(file)
      const resolutionError = bannerResolutionError(width, height)
      if (resolutionError) {
        setErrorMessage(resolutionError)
        return
      }
    } catch {
      setErrorMessage("Không thể đọc kích thước ảnh bìa. Vui lòng chọn ảnh khác.")
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
      URL.revokeObjectURL(preview)
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

  const handleSeatMapSelect = async (file: File) => {
    if (!isDraft) return
    setErrorMessage(null)
    setSuccessMessage(null)

    const err = validateFile(file)
    if (err) {
      setErrorMessage(err)
      return
    }

    const preview = URL.createObjectURL(file)
    setSeatMapPreview(preview)
    setIsUploadingSeatMap(true)
    try {
      const res = await organizerApi.uploadEventMedia(eventId, file, "SEAT_MAP")
      const media = (res.data?.data ?? res.data) as EventMediaResponse
      if (media) {
        setSeatMapMedia(media)
        setSeatMapPreview(null)
        setSuccessMessage("Đã cập nhật ảnh sơ đồ phân khu & khán đài thành công.")
        await onMediaChanged?.()
      }
    } catch (apiErr) {
      setSeatMapPreview(null)
      setErrorMessage(
        getApiErrorMessage(apiErr, "Không thể tải ảnh sơ đồ phân khu lên. Vui lòng thử lại."),
      )
    } finally {
      URL.revokeObjectURL(preview)
      setIsUploadingSeatMap(false)
    }
  }

  const handleDeleteSeatMap = async () => {
    if (!isDraft) return
    setErrorMessage(null)
    setSuccessMessage(null)

    setIsUploadingSeatMap(true)
    try {
      if (seatMapMedia?.eventFileId) {
        await organizerApi.deleteEventMedia(eventId, seatMapMedia.eventFileId)
      }
      setSeatMapMedia(null)
      setSeatMapPreview(null)
      setSuccessMessage("Đã gỡ ảnh sơ đồ phân khu.")
      await onMediaChanged?.()
    } catch (apiErr) {
      setErrorMessage(getApiErrorMessage(apiErr, "Không thể xóa ảnh sơ đồ phân khu."))
    } finally {
      setIsUploadingSeatMap(false)
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

  const handleMoveGallery = async (index: number, direction: -1 | 1) => {
    if (!isDraft || isReorderingGallery || isUploadingGallery) return
    const destination = index + direction
    if (destination < 0 || destination >= galleryMedia.length) return
    const next = [...galleryMedia]
    ;[next[index], next[destination]] = [next[destination], next[index]]
    setErrorMessage(null)
    setSuccessMessage(null)
    setIsReorderingGallery(true)
    try {
      await organizerApi.updateMediaOrder(eventId, {
        items: next.map((media, order) => ({
          eventFileId: media.eventFileId,
          sortOrder: order + 1,
        })),
      })
      setGalleryMedia(next.map((media, order) => ({ ...media, sortOrder: order + 1 })))
      setSuccessMessage("Đã cập nhật thứ tự ảnh trong bộ sưu tập.")
      await onMediaChanged?.()
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Không thể sắp xếp ảnh. Vui lòng thử lại."))
    } finally {
      setIsReorderingGallery(false)
    }
  }

  return {
    bannerMedia,
    bannerPreview,
    seatMapMedia,
    seatMapPreview,
    galleryMedia,
    isLoading,
    isUploadingBanner,
    isUploadingSeatMap,
    isUploadingGallery,
    isReorderingGallery,
    isDraggingBanner,
    setIsDraggingBanner,
    isDraggingSeatMap,
    setIsDraggingSeatMap,
    errorMessage,
    successMessage,
    bannerInputRef,
    seatMapInputRef,
    galleryInputRef,
    handleBannerSelect,
    handleDeleteBanner,
    handleSeatMapSelect,
    handleDeleteSeatMap,
    handleGallerySelect,
    handleDeleteGallery,
    handleMoveGallery,
  }
}
