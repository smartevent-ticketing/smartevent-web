"use client"

import { adminApi } from "@/features/admin/api/admin-api"
import { catalogApi } from "@/features/catalog/api/catalog-api"

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

  async function handleAddVenue(e: React.FormEvent) {
    e.preventDefault()
    if (!newVenueName.trim()) return

    setIsAddingVenue(true)
    try {
      const res = await adminApi.createVenue({
        body: {
          name: newVenueName.trim(),
          city: newVenueCity.trim() || "Việt Nam",
          address: newVenueAddress.trim() || "Chưa cập nhật địa chỉ chi tiết",
          capacity: parseInt(newVenueCapacity || "10000", 10),
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
    handleAddVenue,
    handleDeleteVenue,
  }
}
