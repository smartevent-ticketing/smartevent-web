"use client"

import { adminApi } from "@/features/admin/api/admin-api"
import { catalogApi } from "@/features/catalog"

import { useEffect, useState } from "react"

import { getApiErrorMessage } from "@/lib/api/result"
import type { AdminNotification, CategoryResponse } from "../model/admin-types"

export function useAdminCategories() {
  const [notification, setNotification] = useState<AdminNotification | null>(null)

  const [categories, setCategories] = useState<CategoryResponse[]>([])

  const [isLoadingCategories, setIsLoadingCategories] = useState(true)

  const [newCatName, setNewCatName] = useState("")

  const [newCatDesc, setNewCatDesc] = useState("")

  const [isAddingCat, setIsAddingCat] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editCatName, setEditCatName] = useState("")
  const [editCatDesc, setEditCatDesc] = useState("")
  const [isSavingCategory, setIsSavingCategory] = useState(false)

  function startEditingCategory(category: CategoryResponse) {
    if (!category.id) return
    setEditingCategoryId(category.id)
    setEditCatName(category.name ?? "")
    setEditCatDesc(category.description ?? "")
    setNotification(null)
  }

  function cancelEditingCategory() {
    setEditingCategoryId(null)
    setEditCatName("")
    setEditCatDesc("")
  }

  async function saveCategory() {
    if (!editingCategoryId || !editCatName.trim() || isSavingCategory) return
    setIsSavingCategory(true)
    try {
      const result = await adminApi.updateCategory(editingCategoryId, {
        name: editCatName.trim(),
        description: editCatDesc.trim() || undefined,
      })
      const updated = result.data?.data
      if (!updated) throw new Error("Máy chủ chưa xác nhận danh mục đã cập nhật.")
      setCategories((current) =>
        current.map((item) => (item.id === editingCategoryId ? updated : item)),
      )
      cancelEditingCategory()
      setNotification({ type: "success", text: "Đã cập nhật danh mục." })
    } catch (error) {
      setNotification({
        type: "error",
        text: getApiErrorMessage(error, "Không thể cập nhật danh mục."),
      })
    } finally {
      setIsSavingCategory(false)
    }
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!newCatName.trim()) return

    setIsAddingCat(true)
    try {
      const res = await adminApi.createCategory({
        body: {
          name: newCatName.trim(),
          description: newCatDesc.trim() || undefined,
        },
      })

      if (res.data?.data) {
        setCategories((prev) => [...prev, res.data!.data!])
        setNotification({
          type: "success",
          text: `Đã thêm danh mục "${newCatName}" thành công!`,
        })
        setNewCatName("")
        setNewCatDesc("")
      }
    } catch {
      setNotification({
        type: "error",
        text: "Thêm danh mục thất bại. Vui lòng thử lại.",
      })
    } finally {
      setIsAddingCat(false)
    }
  }

  async function handleDeleteCategory(id: string) {
    try {
      await adminApi.deleteCategory({
        params: { path: { id } },
      })
      setCategories((prev) => prev.filter((c) => c.id !== id))
      setNotification({
        type: "success",
        text: "Đã xóa danh mục thành công.",
      })
    } catch {
      setNotification({
        type: "error",
        text: "Không thể xóa danh mục này (có thể đang chứa sự kiện).",
      })
    }
  }

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const results = await Promise.all([catalogApi.getCategories()])
        if (!mounted) return
        setCategories(results[0].data?.data ?? [])
      } catch (error) {
        if (mounted)
          setNotification({
            type: "error",
            text: getApiErrorMessage(error, "Không thể tải dữ liệu. Vui lòng thử lại."),
          })
      } finally {
        if (mounted) {
          setIsLoadingCategories(false)
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
    categories,
    isLoadingCategories,
    newCatName,
    setNewCatName,
    newCatDesc,
    setNewCatDesc,
    isAddingCat,
    editingCategoryId,
    editCatName,
    setEditCatName,
    editCatDesc,
    setEditCatDesc,
    isSavingCategory,
    startEditingCategory,
    cancelEditingCategory,
    saveCategory,
    handleAddCategory,
    handleDeleteCategory,
  }
}
