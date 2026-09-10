import { Eye, EyeOff, type LucideIcon } from "lucide-react"
import type { HTMLInputAutoCompleteAttribute, HTMLInputTypeAttribute } from "react"

interface AuthFieldProps {
  id: string
  label: string
  icon: LucideIcon
  value: string
  onChange: (value: string) => void
  type?: HTMLInputTypeAttribute
  autoComplete?: HTMLInputAutoCompleteAttribute
  placeholder?: string
  required?: boolean
  disabled?: boolean
  compact?: boolean
  onToggleVisibility?: () => void
}

export function AuthField({
  id,
  label,
  icon: Icon,
  value,
  onChange,
  type = "text",
  autoComplete,
  placeholder,
  required,
  disabled,
  compact,
  onToggleVisibility,
}: AuthFieldProps) {
  const visible = type === "text"
  return (
    <div>
      <label
        className={`block text-sm font-medium text-gray-700 ${compact ? "mb-1" : "mb-1.5"}`}
        htmlFor={id}
      >
        {label}
        {compact && required && <span className="text-red-500"> *</span>}
      </label>
      <div className="relative">
        <Icon
          className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${compact ? "size-4" : "size-5"} text-gray-400 pointer-events-none`}
        />
        <input
          id={id}
          name={id}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full ${compact ? "pl-10 py-2.5" : "pl-11 py-3"} ${onToggleVisibility ? "pr-11" : "pr-4"} bg-[#f9f9ff] border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition disabled:opacity-60`}
        />
        {onToggleVisibility && (
          <button
            type="button"
            disabled={disabled}
            onClick={onToggleVisibility}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition cursor-pointer"
            aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            aria-controls={id}
            aria-pressed={visible}
          >
            {visible ? (
              <Eye className={compact ? "size-4" : "size-5"} />
            ) : (
              <EyeOff className={compact ? "size-4" : "size-5"} />
            )}
          </button>
        )}
      </div>
    </div>
  )
}
