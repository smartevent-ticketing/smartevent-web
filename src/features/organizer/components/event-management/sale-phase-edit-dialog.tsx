"use client"

import { useState, type FormEvent } from "react"
import type { CreateSalePhaseInput, SalePhaseItem } from "../../model/event-management.types"

function toLocalInput(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const pad = (number: number) => String(number).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

interface Props {
  phase: SalePhaseItem
  onSave: (id: string, value: CreateSalePhaseInput) => Promise<void>
  onClose: () => void
}

export function SalePhaseEditDialog({ phase, onSave, onClose }: Props) {
  const [name, setName] = useState(phase.name)
  const [price, setPrice] = useState(phase.price)
  const [quantity, setQuantity] = useState(phase.quantity)
  const [start, setStart] = useState(toLocalInput(phase.saleStartAt))
  const [end, setEnd] = useState(toLocalInput(phase.saleEndAt))
  const [maxPerOrder, setMaxPerOrder] = useState(phase.maxPerOrder ?? 4)
  const [maxPerUser, setMaxPerUser] = useState(phase.maxPerUser ?? 4)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim() || price < 0 || quantity < 1 || maxPerOrder < 1 || maxPerUser < 1) {
      setError("Vui lòng kiểm tra tên, giá, số vé và giới hạn mua.")
      return
    }
    const saleStartAt = new Date(start).toISOString()
    const saleEndAt = new Date(end).toISOString()
    if (Date.parse(saleEndAt) <= Date.parse(saleStartAt)) {
      setError("Thời gian kết thúc phải sau thời gian bắt đầu.")
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSave(phase.id, {
        ticketTypeId: phase.ticketTypeId,
        name: name.trim(),
        price,
        quantity,
        saleStartAt,
        saleEndAt,
        maxPerOrder,
        maxPerUser,
      })
      onClose()
    } catch {
      setError("Không cập nhật được đợt bán. Kiểm tra thông báo lỗi rồi thử lại.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <form
        onSubmit={submit}
        className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <h3 className="text-lg font-bold">Sửa đợt bán “{phase.name}”</h3>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        <label className="block text-sm">
          Tên đợt bán
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 w-full border rounded-lg p-2"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            Giá vé (₫)
            <input
              required
              type="number"
              min="0"
              value={price}
              onChange={(event) => setPrice(Number(event.target.value))}
              className="mt-1 w-full border rounded-lg p-2"
            />
          </label>
          <label className="block text-sm">
            Số vé
            <input
              required
              type="number"
              min="1"
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
              className="mt-1 w-full border rounded-lg p-2"
            />
          </label>
          <label className="block text-sm">
            Bắt đầu
            <input
              required
              type="datetime-local"
              value={start}
              onChange={(event) => setStart(event.target.value)}
              className="mt-1 w-full border rounded-lg p-2"
            />
          </label>
          <label className="block text-sm">
            Kết thúc
            <input
              required
              type="datetime-local"
              value={end}
              onChange={(event) => setEnd(event.target.value)}
              className="mt-1 w-full border rounded-lg p-2"
            />
          </label>
          <label className="block text-sm">
            Tối đa mỗi đơn
            <input
              required
              type="number"
              min="1"
              value={maxPerOrder}
              onChange={(event) => setMaxPerOrder(Number(event.target.value))}
              className="mt-1 w-full border rounded-lg p-2"
            />
          </label>
          <label className="block text-sm">
            Tối đa mỗi người
            <input
              required
              type="number"
              min="1"
              value={maxPerUser}
              onChange={(event) => setMaxPerUser(Number(event.target.value))}
              className="mt-1 w-full border rounded-lg p-2"
            />
          </label>
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 border rounded-lg"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50"
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  )
}
