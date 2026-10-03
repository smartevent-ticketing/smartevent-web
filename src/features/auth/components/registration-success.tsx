import Link from "next/link"
import { ArrowRight, CheckCircle2 } from "lucide-react"

export function RegistrationSuccess({ message }: { message: string }) {
  return (
    <div
      className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center"
      role="status"
    >
      <CheckCircle2 className="mx-auto size-10 text-emerald-600" aria-hidden="true" />
      <h2 className="mt-4 text-lg font-semibold text-foreground">{message}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Tài khoản của bạn đã sẵn sàng. Đăng nhập để khám phá sự kiện và đặt vé.
      </p>
      <Link
        href="/login"
        className="se-button mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        Đăng nhập ngay
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  )
}
