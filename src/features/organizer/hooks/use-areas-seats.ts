"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { organizerApi } from "../api/organizer-api"
import type { components } from "@/lib/api/schema"
import { getApiErrorMessage } from "@/lib/api/result"
import type { AreaItem } from "../model/event-management.types"
import type { AreasSeatsTabProps } from "../components/event-management/areas-seats-types"

export function useAreasSeats({
  canEdit,
  areas,
  onAddArea,
  onUpdateArea,
  onDeleteArea,
}: AreasSeatsTabProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [name, setName] = useState("")
  const [type, setType] = useState<"STANDING" | "SEATED">("SEATED")
  const [capacity, setCapacity] = useState(200)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedAreaId, setSelectedAreaId] = useState<string>(areas[0]?.id || "")

  // Edit area state
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingArea, setEditingArea] = useState<AreaItem | null>(null)
  const [editName, setEditName] = useState("")
  const [editType, setEditType] = useState<"STANDING" | "SEATED">("SEATED")
  const [editCapacity, setEditCapacity] = useState(200)
  const [isUpdatingArea, setIsUpdatingArea] = useState(false)
  const [isDeletingArea, setIsDeletingArea] = useState(false)

  // Real seats state
  const [realSeats, setRealSeats] = useState<components["schemas"]["EventSeatResponse"][]>([])
  const [seatPage, setSeatPage] = useState(0)
  const [seatTotalPages, setSeatTotalPages] = useState(0)
  const [seatTotalElements, setSeatTotalElements] = useState(0)
  const [selectedSeat, setSelectedSeat] = useState<
    components["schemas"]["EventSeatResponse"] | null
  >(null)
  const [isLoadingSeats, setIsLoadingSeats] = useState(false)
  const seatRequestId = useRef(0)
  const [showSingleSeatModal, setShowSingleSeatModal] = useState(false)
  const [singleSeatRow, setSingleSeatRow] = useState("")
  const [singleSeatNumber, setSingleSeatNumber] = useState("")
  const [singleSeatLabel, setSingleSeatLabel] = useState("")
  const [isSavingSingleSeat, setIsSavingSingleSeat] = useState(false)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [fromRow, setFromRow] = useState("A")
  const [toRow, setToRow] = useState("E")
  const [seatsPerRowInput, setSeatsPerRowInput] = useState(12)
  const [isGenerating, setIsGenerating] = useState(false)
  const [seatMessage, setSeatMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  const selectedArea = areas.find((a) => a.id === selectedAreaId) || areas[0]
  const activeAreaId = selectedArea?.id ?? ""

  const loadSeats = useCallback(async (areaId: string, page = 0) => {
    const requestId = ++seatRequestId.current
    if (!areaId) {
      setRealSeats([])
      setSeatTotalPages(0)
      setSeatTotalElements(0)
      return
    }
    setIsLoadingSeats(true)
    setSelectedSeat(null)
    setSeatMessage(null)
    try {
      const res = await organizerApi.getSeatsByArea(areaId, page)
      if (requestId !== seatRequestId.current) return
      const data = res.data?.data
      setRealSeats(data?.content ?? [])
      setSeatPage(page)
      setSeatTotalPages(data?.totalPages ?? 0)
      setSeatTotalElements(data?.totalElements ?? 0)
      setSelectedSeat(null)
    } catch (error) {
      if (requestId !== seatRequestId.current) return
      setRealSeats([])
      setSeatMessage({
        type: "error",
        text: getApiErrorMessage(error, "Không thể tải danh sách ghế từ máy chủ."),
      })
    } finally {
      if (requestId === seatRequestId.current) setIsLoadingSeats(false)
    }
  }, [])

  useEffect(() => {
    if (selectedArea?.type === "SEATED" && selectedArea?.id) {
      loadSeats(selectedArea.id)
    } else {
      seatRequestId.current += 1
      setIsLoadingSeats(false)
      setRealSeats([])
      setSeatTotalPages(0)
      setSeatTotalElements(0)
      setSelectedSeat(null)
    }
  }, [selectedArea?.id, selectedArea?.type, loadSeats])

  // Tự động tính số hàng và ghế tương thích với sức chứa phân khu
  const handleAutoFillByCapacity = () => {
    if (!selectedArea) return
    const cap = selectedArea.capacity
    let rows = 1
    let seats = cap
    // Tìm cấu hình hàng x ghế đẹp mắt (tối đa 26 hàng A-Z, mỗi hàng tối đa 50 ghế)
    for (let r = 26; r >= 1; r--) {
      if (cap % r === 0 && cap / r <= 50) {
        rows = r
        seats = cap / r
        if (rows <= 15) break // Tỷ lệ cân đối đẹp (ví dụ 200 = 10 hàng x 20 ghế)
      }
    }
    if (rows === 1 && cap > 26) {
      rows = Math.min(26, Math.ceil(Math.sqrt(cap)))
      seats = Math.ceil(cap / rows)
    }
    setFromRow("A")
    setToRow(String.fromCharCode(65 + rows - 1))
    setSeatsPerRowInput(seats)
  }

  // Tính số ghế dự kiến tạo theo fromRow, toRow, seatsPerRowInput
  const calculatedRowCount = useMemo(() => {
    const f = fromRow.trim().toUpperCase().charCodeAt(0) || 65
    const t = toRow.trim().toUpperCase().charCodeAt(0) || 65
    return Math.max(0, t - f + 1)
  }, [fromRow, toRow])

  const calculatedTotalSeats = useMemo(() => {
    return calculatedRowCount * (Number(seatsPerRowInput) || 0)
  }, [calculatedRowCount, seatsPerRowInput])

  const isExceedingCapacity = Boolean(
    selectedArea?.capacity && seatTotalElements + calculatedTotalSeats > selectedArea.capacity,
  )

  const handleGenerateSeats = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canEdit || !selectedArea?.id) return
    if (isExceedingCapacity) {
      setSeatMessage({
        type: "error",
        text: `Tổng số ghế sau khi tạo (${seatTotalElements + calculatedTotalSeats}) vượt quá sức chứa phân khu (${selectedArea.capacity} vé).`,
      })
      return
    }
    setIsGenerating(true)
    setSeatMessage(null)
    try {
      await organizerApi.generateSeats(selectedArea.id, {
        fromRow: fromRow.trim().toUpperCase(),
        toRow: toRow.trim().toUpperCase(),
        seatsPerRow: Number(seatsPerRowInput),
      })
      setSeatMessage({ type: "success", text: "Sinh sơ đồ ghế tự động thành công!" })
      setShowGenerateModal(false)
      await loadSeats(selectedArea.id)
    } catch {
      setSeatMessage({
        type: "error",
        text: "Sinh ghế thất bại. Vui lòng kiểm tra lại thông số hàng và ghế.",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDeleteSeats = async () => {
    if (
      !canEdit ||
      !selectedArea?.id ||
      !confirm("Bạn có chắc chắn muốn xóa toàn bộ sơ đồ ghế của phân khu này?")
    )
      return
    try {
      await organizerApi.deleteAllSeatsInArea(selectedArea.id)
      setSeatMessage({ type: "success", text: "Đã xóa toàn bộ sơ đồ ghế." })
      await loadSeats(selectedArea.id)
    } catch {
      setSeatMessage({ type: "error", text: "Xóa sơ đồ ghế thất bại." })
    }
  }

  const handleCreateSingleSeat = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!canEdit || !selectedArea?.id || isSavingSingleSeat) return
    const rowName = singleSeatRow.trim().toUpperCase()
    const seatNumber = singleSeatNumber.trim()
    if (!rowName || !seatNumber) return
    setIsSavingSingleSeat(true)
    setSeatMessage(null)
    try {
      await organizerApi.createSingleSeat(selectedArea.id, {
        rowName,
        seatNumber,
        label: singleSeatLabel.trim() || undefined,
      })
      setShowSingleSeatModal(false)
      setSingleSeatNumber("")
      setSingleSeatLabel("")
      await loadSeats(selectedArea.id, seatPage)
      setSeatMessage({ type: "success", text: "Đã thêm ghế vào phân khu." })
    } catch (error) {
      setSeatMessage({ type: "error", text: getApiErrorMessage(error, "Không thể thêm ghế.") })
    } finally {
      setIsSavingSingleSeat(false)
    }
  }

  const handleDeleteSingleSeat = async () => {
    if (
      !canEdit ||
      !selectedSeat?.id ||
      !selectedArea?.id ||
      !confirm(
        `Xóa ghế ${selectedSeat.label || `${selectedSeat.rowName}-${selectedSeat.seatNumber}`}?`,
      )
    )
      return
    setIsSavingSingleSeat(true)
    setSeatMessage(null)
    try {
      await organizerApi.deleteSeat(selectedSeat.id)
      await loadSeats(
        selectedArea.id,
        realSeats.length === 1 && seatPage > 0 ? seatPage - 1 : seatPage,
      )
      setSeatMessage({ type: "success", text: "Đã xóa ghế." })
    } catch (error) {
      setSeatMessage({ type: "error", text: getApiErrorMessage(error, "Không thể xóa ghế.") })
    } finally {
      setIsSavingSingleSeat(false)
    }
  }

  const openEditModal = (area: AreaItem) => {
    setEditingArea(area)
    setEditName(area.name)
    setEditType(area.type)
    setEditCapacity(area.capacity)
    setShowEditModal(true)
  }

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingArea || !onUpdateArea || !editName.trim() || editCapacity <= 0) return
    setIsUpdatingArea(true)
    try {
      await onUpdateArea(editingArea.id, {
        name: editName.trim(),
        type: editType,
        capacity: editCapacity,
      })
      setShowEditModal(false)
      setSeatMessage({
        type: "success",
        text: `Đã cập nhật phân khu "${editName}" thành công.`,
      })
    } catch (err: unknown) {
      setSeatMessage({
        type: "error",
        text: getApiErrorMessage(err, "Cập nhật phân khu thất bại."),
      })
    } finally {
      setIsUpdatingArea(false)
    }
  }

  const handleDeleteAreaConfirm = async () => {
    if (!canEdit || !editingArea || !onDeleteArea) return
    if (
      !confirm(
        `Bạn có chắc chắn muốn xóa phân khu "${editingArea.name}"? Mọi dữ liệu liên quan sẽ bị xóa vĩnh viễn.`,
      )
    )
      return
    setIsDeletingArea(true)
    try {
      await onDeleteArea(editingArea.id)
      setShowEditModal(false)
      setSeatMessage({
        type: "success",
        text: `Đã xóa phân khu "${editingArea.name}".`,
      })
    } catch (err: unknown) {
      setSeatMessage({
        type: "error",
        text: getApiErrorMessage(err, "Xóa phân khu thất bại."),
      })
    } finally {
      setIsDeletingArea(false)
    }
  }

  const seatRows = useMemo(() => {
    if (realSeats.length === 0) return []
    const map: Record<string, components["schemas"]["EventSeatResponse"][]> = {}
    realSeats.forEach((seat) => {
      const row = seat.rowName || "A"
      if (!map[row]) map[row] = []
      map[row].push(seat)
    })
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
  }, [realSeats])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || capacity <= 0) return
    setIsSubmitting(true)
    try {
      await onAddArea({ name: name.trim(), type, capacity })
      setName("")
      setCapacity(200)
      setShowAddModal(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    showAddModal,
    setShowAddModal,
    name,
    setName,
    type,
    setType,
    capacity,
    setCapacity,
    isSubmitting,
    activeAreaId,
    setSelectedAreaId,
    showEditModal,
    setShowEditModal,
    editingArea,
    editName,
    setEditName,
    editType,
    setEditType,
    editCapacity,
    setEditCapacity,
    isUpdatingArea,
    isDeletingArea,
    realSeats,
    seatPage,
    seatTotalPages,
    seatTotalElements,
    selectedSeat,
    setSelectedSeat,
    isLoadingSeats,
    showSingleSeatModal,
    setShowSingleSeatModal,
    singleSeatRow,
    setSingleSeatRow,
    singleSeatNumber,
    setSingleSeatNumber,
    singleSeatLabel,
    setSingleSeatLabel,
    isSavingSingleSeat,
    showGenerateModal,
    setShowGenerateModal,
    fromRow,
    setFromRow,
    toRow,
    setToRow,
    seatsPerRowInput,
    setSeatsPerRowInput,
    isGenerating,
    seatMessage,
    setSeatMessage,
    selectedArea,
    loadSeats,
    handleAutoFillByCapacity,
    calculatedRowCount,
    calculatedTotalSeats,
    isExceedingCapacity,
    handleGenerateSeats,
    handleDeleteSeats,
    handleCreateSingleSeat,
    handleDeleteSingleSeat,
    openEditModal,
    handleUpdateSubmit,
    handleDeleteAreaConfirm,
    seatRows,
    handleSubmit,
  }
}

export type AreasSeatsController = ReturnType<typeof useAreasSeats>
