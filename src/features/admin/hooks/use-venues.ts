"use client"

import { adminApi } from "@/features/admin/api/admin-api"
import { catalogApi } from "@/features/catalog"

import { useEffect, useState } from "react"

import { getApiErrorMessage } from "@/lib/api/result"
import type { AdminNotification, VenueResponse } from "../model/admin-types"

export function useAdminVenues() {
  const [notification, setNotification] = useState<AdminNotification | null>(null)

  const [venues, setVenues] = useState<VenueResponse[]>([])

  const [isLoadingVenues, setIsLoadingVenues] = useState(true)

  const [newVenueName, setNewVenueName] = useState("")

  const [newVenueCity, setNewVenueCity] = useState("TP. Hồ Chí Minh")

  const [newVenueAddress, setNewVenueAddress] = useState("")

  const [newVenueCapacity, setNewVenueCapacity] = useState("10000")

  const [isAddingVenue, setIsAddingVenue] = useState(false)
  const [editingVenue, setEditingVenue] = useState<VenueResponse | null>(null)
  const [editVenueName, setEditVenueName] = useState("")
  const [editVenueCity, setEditVenueCity] = useState("")
  const [editVenueAddress, setEditVenueAddress] = useState("")
  const [editVenueCapacity, setEditVenueCapacity] = useState("")
  const [isSavingVenue, setIsSavingVenue] = useState(false)

  function startEditingVenue(venue: VenueResponse) {
    if (!venue.id) return
    setEditingVenue(venue)
    setEditVenueName(venue.name ?? "")
    setEditVenueCity(venue.city ?? "")
    setEditVenueAddress(venue.address ?? "")
    setEditVenueCapacity(venue.capacity?.toString() ?? "")
    setNotification(null)
  }

  function cancelEditingVenue() {
    setEditingVenue(null)
  }

  async function saveVenue() {
    if (!editingVenue?.id || isSavingVenue) return
    const capacity = Number(editVenueCapacity)
    if (
      !editVenueName.trim() ||
      !editVenueCity.trim() ||
      !editVenueAddress.trim() ||
      !Number.isSafeInteger(capacity) ||
      capacity <= 0
    ) {
      setNotification({
        type: "error",
        text: "Vui lòng nhập tên, thành phố, địa chỉ và sức chứa nguyên dương.",
      })
      return
    }
    setIsSavingVenue(true)
    try {
      const result = await adminApi.updateVenue(editingVenue.id, {
        name: editVenueName.trim(),
        city: editVenueCity.trim(),
        address: editVenueAddress.trim(),
        capacity,
        latitude: editingVenue.latitude,
        longitude: editingVenue.longitude,
      })
      const updated = result.data?.data
      if (!updated) throw new Error("Máy chủ chưa xác nhận địa điểm đã cập nhật.")
      setVenues((current) => current.map((item) => (item.id === editingVenue.id ? updated : item)))
      cancelEditingVenue()
      setNotification({ type: "success", text: "Đã cập nhật địa điểm." })
    } catch (error) {
      setNotification({
        type: "error",
        text: getApiErrorMessage(error, "Không thể cập nhật địa điểm."),
      })
    } finally {
      setIsSavingVenue(false)
    }
  }

  async function handleAddVenue(e: React.FormEvent) {
    e.preventDefault()
    const capacity = Number(newVenueCapacity)
    if (
      !newVenueName.trim() ||
      !newVenueCity.trim() ||
      !newVenueAddress.trim() ||
      !Number.isSafeInteger(capacity) ||
      capacity <= 0
    ) {
      setNotification({
        type: "error",
        text: "Vui lòng nhập tên, thành phố, địa chỉ và sức chứa nguyên dương.",
      })
      return
    }

    setIsAddingVenue(true)
    try {
      const res = await adminApi.createVenue({
        body: {
          name: newVenueName.trim(),
          city: newVenueCity.trim(),
          address: newVenueAddress.trim(),
          capacity,
        },
      })

      if (res.data?.data) {
        setVenues((prev) => [...prev, res.data!.data!])
        setNotification({
          type: "success",
          text: `Đã thêm địa điểm "${newVenueName}" thành công!`,
        })
        setNewVenueName("")
        setNewVenueAddress("")
      }
    } catch {
      setNotification({
        type: "error",
        text: "Thêm địa điểm thất bại. Vui lòng kiểm tra quyền Admin.",
      })
    } finally {
      setIsAddingVenue(false)
    }
  }

  async function handleDeleteVenue(id: string) {
    try {
      await adminApi.deleteVenue({
        params: { path: { id } },
      })
      setVenues((prev) => prev.filter((v) => v.id !== id))
      setNotification({
        type: "success",
        text: "Đã xóa địa điểm thành công.",
      })
    } catch {
      setNotification({
        type: "error",
        text: "Không thể xóa địa điểm này (đang được gán cho sự kiện).",
      })
    }
  }

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const results = await Promise.all([catalogApi.getVenues()])
        if (!mounted) return
        setVenues(results[0].data?.data ?? [])
      } catch (error) {
        if (mounted)
          setNotification({
            type: "error",
            text: getApiErrorMessage(error, "Không thể tải dữ liệu. Vui lòng thử lại."),
          })
      } finally {
        if (mounted) {
          setIsLoadingVenues(false)
        }
      }
    }
    void load()
    return () => {
      mounted = false
    }
  }, [])

  return {
    notification,
    setNotification,
    venues,
    isLoadingVenues,
    newVenueName,
    setNewVenueName,
    newVenueCity,
    setNewVenueCity,
    newVenueAddress,
    setNewVenueAddress,
    newVenueCapacity,
    setNewVenueCapacity,
    isAddingVenue,
    editingVenue,
    editVenueName,
    setEditVenueName,
    editVenueCity,
    setEditVenueCity,
    editVenueAddress,
    setEditVenueAddress,
    editVenueCapacity,
    setEditVenueCapacity,
    isSavingVenue,
    startEditingVenue,
    cancelEditingVenue,
    saveVenue,
    handleAddVenue,
    handleDeleteVenue,
  }
}
