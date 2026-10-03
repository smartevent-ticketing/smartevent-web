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
  hint?: string
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
  hint,
  onToggleVisibility,
}: AuthFieldProps) {
  const visible = type === "text"
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-foreground" htmlFor={id}>
        {label}
        {required && (
          <span className="ml-1 text-primary" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <div className="group relative">
        <Icon
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-muted transition-colors group-focus-within:text-primary"
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
          aria-describedby={hint ? `${id}-hint` : undefined}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full ${compact ? "h-12" : "h-14"} rounded-xl border border-border bg-[#fcfcfd] pl-11 ${onToggleVisibility ? "pr-14" : "pr-4"} text-base text-foreground outline-none transition placeholder:text-sm placeholder:text-muted hover:border-slate-300 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-surface disabled:opacity-60 sm:text-sm`}
        />
        {onToggleVisibility && (
          <button
            type="button"
            disabled={disabled}
            onClick={onToggleVisibility}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-muted transition hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed"
            aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            aria-controls={id}
            aria-pressed={visible}
          >
            {visible ? (
              <Eye className="size-4" aria-hidden="true" />
            ) : (
              <EyeOff className="size-4" aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      {hint && (
        <p id={`${id}-hint`} className="mt-2 text-xs leading-5 text-muted">
          {hint}
        </p>
      )}
    </div>
  )
}
