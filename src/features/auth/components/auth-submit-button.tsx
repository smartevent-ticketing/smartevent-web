import { ArrowRight, Loader2 } from "lucide-react"

interface AuthSubmitButtonProps {
  isSubmitting: boolean
  label: string
  pendingLabel: string
  compact?: boolean
}

export function AuthSubmitButton({
  isSubmitting,
  label,
  pendingLabel,
  compact,
}: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className={`se-button group flex w-full ${compact ? "h-12" : "h-14"} items-center justify-center gap-3 rounded-xl bg-primary text-sm font-semibold text-white shadow-[0_6px_16px_-6px_rgba(199,75,49,0.45)] transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      <span>{isSubmitting ? pendingLabel : label}</span>
      {!isSubmitting && <ArrowRight className="size-4" aria-hidden="true" />}
    </button>
  )
}
