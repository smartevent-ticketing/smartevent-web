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
      className={`w-full ${compact ? "h-11" : "h-12"} bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer`}
    >
      {isSubmitting && <Loader2 className="size-4 animate-spin" />}
      <span>{isSubmitting ? pendingLabel : label}</span>
      {!isSubmitting && <ArrowRight className="size-4" />}
    </button>
  )
}
