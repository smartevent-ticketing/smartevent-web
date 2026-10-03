import { Check } from "lucide-react"

const steps = ["Chọn vé", "Thanh toán", "Nhận vé"]

export function BookingProgress({ currentStep }: { currentStep: 1 | 2 | 3 }) {
  return (
    <nav aria-label="Tiến trình đặt vé" className="w-full max-w-xl">
      <ol className="flex items-center">
        {steps.map((label, index) => {
          const step = index + 1
          const completed = step < currentStep
          const current = step === currentStep
          return (
            <li key={label} className="flex min-w-0 flex-1 items-center last:flex-none">
              <div
                aria-current={current ? "step" : undefined}
                className="flex flex-col items-center gap-2 sm:flex-row sm:gap-2.5"
              >
                <span
                  aria-hidden="true"
                  className={
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold " +
                    (completed
                      ? "bg-on-surface text-white"
                      : current
                        ? "bg-primary text-white ring-4 ring-primary/10"
                        : "border border-outline-variant bg-white text-on-surface-variant")
                  }
                >
                  {completed ? <Check className="size-4" /> : step}
                </span>
                <span
                  className={
                    "whitespace-nowrap text-xs font-semibold sm:text-sm " +
                    (current || completed ? "text-on-surface" : "text-on-surface-variant")
                  }
                >
                  <span className="sr-only">Bước {step}: </span>
                  {label}
                  {completed && <span className="sr-only">, đã hoàn thành</span>}
                </span>
              </div>
              {step < steps.length && (
                <span
                  aria-hidden="true"
                  className={
                    "mx-3 mb-6 h-px flex-1 sm:mx-5 sm:mb-0 " +
                    (completed ? "bg-on-surface/25" : "bg-outline-variant")
                  }
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
