import Link from "next/link"
import { CheckCircle2 } from "lucide-react"

export function RegistrationSuccess({ message }: { message: string }) {
  return (
    <div className="p-6 text-center space-y-4" role="status">
      <CheckCircle2 className="size-12 text-green-500 mx-auto" />
      <h3 className="text-lg font-bold text-gray-900">{message}</h3>
      <Link
        href="/login"
        className="inline-flex items-center justify-center w-full py-3 px-4 bg-primary text-white font-semibold rounded-xl"
      >
        Đăng nhập ngay
      </Link>
    </div>
  )
}
