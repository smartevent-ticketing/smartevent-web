"use client"

import { useMemo, useState } from "react"
import {
  allocatedQuantityForPhase,
  hasSalePhaseOverlap,
  remainingCapacityForTier,
} from "../model/sale-phase-availability"
import type {
  CreateSalePhaseDialogProps,
  TierPhaseConfig,
} from "../components/event-management/sale-phase-types"

export function useCreateSalePhase({
  eventEndTime,
  salePhases,
  ticketTypes,
  areas = [],
  onAddSalePhase,
  onClose,
}: CreateSalePhaseDialogProps) {
  // Form State
  const [name, setName] = useState("")
  const [saleStartAt, setSaleStartAt] = useState("")
  const [saleEndAt, setSaleEndAt] = useState("")
  const [maxTicketsPerCustomer, setMaxTicketsPerCustomer] = useState<number | "">(4)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Helper to compute remaining available capacity for a ticket type
  const getRemainingCapacity = (ticketTypeId: string) =>
    remainingCapacityForTier(ticketTypeId, ticketTypes, areas, salePhases)

  // Open modal and pre-initialize tier configs
  const createInitialTierConfigs = (): Record<string, TierPhaseConfig> => {
    // Group ticket types by area to distribute initial quantities fairly
    const areaGroups = new Map<string, typeof ticketTypes>()
    ticketTypes.forEach((t) => {
      const areaKey = t.areaId || `tier-${t.id}`
      const list = areaGroups.get(areaKey) || []
      list.push(t)
      areaGroups.set(areaKey, list)
    })

    const initial: Record<string, TierPhaseConfig> = {}
    areaGroups.forEach((group) => {
      const firstTier = group[0]
      const areaAvailable = getRemainingCapacity(firstTier.id)
      const perTierQuota = Math.floor(areaAvailable / group.length)
      let remainder = areaAvailable % group.length

      group.forEach((t) => {
        const initialBase =
          (t.basePrice && t.basePrice > 0 ? t.basePrice : undefined) ??
          (t.price && t.price > 0 ? t.price : 500000)

        const maxAllowed = perTierQuota + (remainder > 0 ? 1 : 0)
        if (remainder > 0) remainder--
        const initialQty = maxAllowed > 0 ? Math.min(50, maxAllowed) : ""

        initial[t.id] = {
          selected: maxAllowed > 0,
          basePrice: initialBase,
          discountPercent: 0,
          price: initialBase,
          quantity: initialQty,
        }
      })
    })

    return initial
  }

  const [tierConfigs, setTierConfigs] =
    useState<Record<string, TierPhaseConfig>>(createInitialTierConfigs)

  // Handle Form Submit (Multi-tier batch creation)
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!name.trim()) {
      setFormError("Vui lòng nhập tên đợt mở bán.")
      return
    }

    if (!saleStartAt || !saleEndAt) {
      setFormError("Vui lòng chọn đầy đủ thời gian bắt đầu và kết thúc.")
      return
    }

    const startDate = new Date(saleStartAt)
    const endDate = new Date(saleEndAt)

    if (startDate.getTime() >= endDate.getTime()) {
      setFormError("Thời gian kết thúc phải sau thời gian bắt đầu mở bán.")
      return
    }

    if (eventEndTime) {
      const eventEnd = new Date(eventEndTime)
      if (endDate.getTime() > eventEnd.getTime()) {
        setFormError(
          `Thời gian kết thúc mở bán (${endDate.toLocaleString("vi-VN")}) không được vượt quá thời gian kết thúc sự kiện (${eventEnd.toLocaleString("vi-VN")}).`,
        )
        return
      }
    }

    // Filter selected ticket types
    const selectedTiers = ticketTypes.filter((t) => tierConfigs[t.id]?.selected)
    if (selectedTiers.length === 0) {
      setFormError("Vui lòng chọn ít nhất một hạng vé để mở bán trong đợt này.")
      return
    }

    // Validate each selected ticket type
    for (const t of selectedTiers) {
      const cfg = tierConfigs[t.id]
      const numPrice = Number(cfg?.price)
      if (isNaN(numPrice) || numPrice < 0) {
        setFormError(`Giá vé của hạng vé "${t.name}" không hợp lệ.`)
        return
      }
      const numQty = Number(cfg?.quantity)
      if (isNaN(numQty) || numQty <= 0) {
        setFormError(`Số lượng vé của hạng vé "${t.name}" phải lớn hơn 0.`)
        return
      }

      // Capacity verification
      const matchedArea = areas.find((a) => a.id === t.areaId)
      const totalAreaCapacity = matchedArea?.capacity ?? t.totalQuota ?? 0
      const remainingCapacity = getRemainingCapacity(t.id)

      if (totalAreaCapacity > 0 && numQty > remainingCapacity) {
        setFormError(
          `Số lượng vé mở bán của hạng vé "${t.name}" (${numQty.toLocaleString("vi-VN")}) vượt quá số lượng vé còn khả dụng (${remainingCapacity.toLocaleString("vi-VN")} vé). Vui lòng điều chỉnh lại.`,
        )
        return
      }

      if (hasSalePhaseOverlap(salePhases, t.id, startDate.toISOString(), endDate.toISOString())) {
        setFormError(
          `Khoảng thời gian mở bán của hạng vé "${t.name}" bị trùng lặp với một đợt mở bán khác của cùng hạng vé.`,
        )
        return
      }
    }

    // Area-level capacity verification across all selected tiers in the batch
    const areaGroups: Record<
      string,
      { areaName: string; totalAreaCapacity: number; tiers: typeof selectedTiers }
    > = {}
    for (const t of selectedTiers) {
      const areaKey = t.areaId || `tier-${t.id}`
      const matchedArea = areas.find((a) => a.id === t.areaId)
      const areaName = matchedArea?.name || t.name
      const totalAreaCapacity = matchedArea?.capacity ?? t.totalQuota ?? 0
      if (!areaGroups[areaKey]) {
        areaGroups[areaKey] = { areaName, totalAreaCapacity, tiers: [] }
      }
      areaGroups[areaKey].tiers.push(t)
    }

    for (const [areaKey, group] of Object.entries(areaGroups)) {
      if (group.tiers.length > 1) {
        const batchTotalForArea = group.tiers.reduce((sum, t) => {
          return sum + Number(tierConfigs[t.id]?.quantity || 0)
        }, 0)

        // Calculate remaining capacity for this area (considering already saved phases in DB)
        const existingAreaQty = salePhases
          .filter((p) => {
            const tier = ticketTypes.find((ot) => ot.id === p.ticketTypeId)
            return (tier?.areaId && tier.areaId === areaKey) || p.ticketTypeId === areaKey
          })
          .reduce((sum, p) => sum + allocatedQuantityForPhase(p), 0)

        const remainingForArea = Math.max(0, group.totalAreaCapacity - existingAreaQty)

        if (group.totalAreaCapacity > 0 && batchTotalForArea > remainingForArea) {
          const tierDetails = group.tiers
            .map(
              (t) =>
                `"${t.name}" (${Number(tierConfigs[t.id]?.quantity || 0).toLocaleString("vi-VN")} vé)`,
            )
            .join(" + ")
          setFormError(
            `Khu vực / Khán đài "${group.areaName}" chỉ còn lại ${remainingForArea.toLocaleString(
              "vi-VN",
            )} vé khả dụng, nhưng tổng số lượng vé bạn đang phân bổ cho các hạng vé thuộc khu vực này là ${batchTotalForArea.toLocaleString(
              "vi-VN",
            )} vé [${tierDetails}]. Vui lòng điều chỉnh lại để tổng số không vượt quá ${remainingForArea.toLocaleString(
              "vi-VN",
            )} vé.`,
          )
          return
        }
      }
    }

    const customerLimit = Number(maxTicketsPerCustomer) || 4

    const phasesToCreate = selectedTiers.map((t) => ({
      ticketTypeId: t.id,
      name: name.trim(),
      price: Number(tierConfigs[t.id]?.price || 0),
      basePrice: Number(tierConfigs[t.id]?.basePrice) || undefined,
      quantity: Number(tierConfigs[t.id]?.quantity || 0),
      saleStartAt: startDate.toISOString(),
      saleEndAt: endDate.toISOString(),
      maxPerOrder: customerLimit,
      maxPerUser: customerLimit,
    }))

    setIsSubmitting(true)
    try {
      await onAddSalePhase(phasesToCreate)
      onClose()
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : "Không thể tạo đợt mở bán. Vui lòng kiểm tra lại.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Multi-tier Batch Actions & Status Helpers
  const selectedTiers = ticketTypes.filter((t) => tierConfigs[t.id]?.selected)
  const allTiersSelected =
    ticketTypes.length > 0 && ticketTypes.every((t) => tierConfigs[t.id]?.selected)

  // Map each area (or standalone tier) to its available capacity in DB
  const areaRemainingMap = useMemo(() => {
    const map = new Map<string, number>()
    ticketTypes.forEach((t) => {
      const areaKey = t.areaId || `tier-${t.id}`
      if (!map.has(areaKey)) {
        map.set(areaKey, remainingCapacityForTier(t.id, ticketTypes, areas, salePhases))
      }
    })
    return map
  }, [ticketTypes, areas, salePhases])

  // Deduplicated remaining capacity calculation for selected tiers
  // (tiers sharing the same area do not double count the area's remaining capacity)
  const totalRemainingSelected = useMemo(() => {
    const seenAreaKeys = new Set<string>()
    let total = 0
    selectedTiers.forEach((t) => {
      const areaKey = t.areaId || `tier-${t.id}`
      if (!seenAreaKeys.has(areaKey)) {
        seenAreaKeys.add(areaKey)
        total += areaRemainingMap.get(areaKey) ?? 0
      }
    })
    return total
  }, [selectedTiers, areaRemainingMap])

  // Check if all selected tiers are currently configured to sell ALL their available tickets
  const isAllRemainingSelected = useMemo(() => {
    if (selectedTiers.length === 0) return false
    const groups = new Map<string, typeof selectedTiers>()
    selectedTiers.forEach((t) => {
      const areaKey = t.areaId || `tier-${t.id}`
      const list = groups.get(areaKey) || []
      list.push(t)
      groups.set(areaKey, list)
    })

    for (const [areaKey, group] of groups.entries()) {
      const available = areaRemainingMap.get(areaKey) ?? 0
      const currentSum = group.reduce((sum, t) => sum + Number(tierConfigs[t.id]?.quantity || 0), 0)
      if (available > 0 && currentSum !== available) {
        return false
      }
    }
    return true
  }, [selectedTiers, tierConfigs, areaRemainingMap])

  const handleToggleAllRemaining = (checked: boolean) => {
    setTierConfigs((prev) => {
      const updated = { ...prev }
      // Group selected tiers by area to distribute available capacity fairly
      const groups = new Map<string, typeof selectedTiers>()
      selectedTiers.forEach((t) => {
        const areaKey = t.areaId || `tier-${t.id}`
        const list = groups.get(areaKey) || []
        list.push(t)
        groups.set(areaKey, list)
      })

      groups.forEach((group, areaKey) => {
        const available = areaRemainingMap.get(areaKey) ?? 0
        if (checked) {
          const share = Math.floor(available / group.length)
          let remainder = available % group.length
          group.forEach((t) => {
            const qty = share + (remainder > 0 ? 1 : 0)
            if (remainder > 0) remainder--
            if (updated[t.id]) {
              updated[t.id] = {
                ...updated[t.id],
                quantity: qty > 0 ? qty : "",
              }
            }
          })
        } else {
          const share = Math.floor(available / group.length)
          group.forEach((t) => {
            if (updated[t.id]) {
              updated[t.id] = {
                ...updated[t.id],
                quantity: share >= 50 ? 50 : share > 0 ? share : "",
              }
            }
          })
        }
      })
      return updated
    })
  }

  const handleToggleSelectAllTiers = () => {
    const updated: Record<string, TierPhaseConfig> = {}
    ticketTypes.forEach((t) => {
      if (tierConfigs[t.id]) {
        updated[t.id] = { ...tierConfigs[t.id], selected: !allTiersSelected }
      }
    })
    setTierConfigs(updated)
  }

  const handleBatchDiscount = (discountPercent: number) => {
    setTierConfigs((prev) => {
      const updated = { ...prev }
      selectedTiers.forEach((t) => {
        if (updated[t.id]) {
          const base = Number(updated[t.id].basePrice) || 0
          const calculatedPrice =
            discountPercent === 0
              ? base
              : Math.round((base * (1 - discountPercent / 100)) / 1000) * 1000
          updated[t.id] = {
            ...updated[t.id],
            discountPercent,
            price: calculatedPrice,
          }
        }
      })
      return updated
    })
  }

  return {
    name,
    setName,
    saleStartAt,
    setSaleStartAt,
    saleEndAt,
    setSaleEndAt,
    maxTicketsPerCustomer,
    setMaxTicketsPerCustomer,
    formError,
    isSubmitting,
    tierConfigs,
    setTierConfigs,
    getRemainingCapacity,
    handleCreateSubmit,
    selectedTiers,
    allTiersSelected,
    totalRemainingSelected,
    isAllRemainingSelected,
    handleToggleAllRemaining,
    handleToggleSelectAllTiers,
    handleBatchDiscount,
  }
}
