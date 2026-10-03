import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { SmartEventMark } from "@/components/brand/smartevent-mark"

export function SiteFooter() {
  const linkStyle =
    "rounded-sm text-sm text-muted transition hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
  return (
    <footer className="mt-auto border-t border-border bg-white text-foreground">
      <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8 lg:pt-14">
        <div className="grid gap-10 pb-10 md:grid-cols-[1.5fr_1fr_1fr] lg:gap-20">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 rounded-sm text-xl font-extrabold tracking-[-0.05em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              <SmartEventMark className="size-9 shrink-0" />
              SmartEvent
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-7 text-muted">
              Tìm trải nghiệm bạn yêu thích. Chọn tấm vé phù hợp. Sẵn sàng cho khoảnh khắc tiếp
              theo.
            </p>
          </div>
          <nav aria-label="Khám phá ở cuối trang">
            <h2 className="mb-4 text-sm font-semibold">Khám phá & đặt vé</h2>
            <ul className="space-y-3">
              <li>
                <Link href="/events" className={linkStyle}>
                  Tất cả sự kiện
                </Link>
              </li>
              <li>
                <Link href="/account" className={linkStyle}>
                  Tài khoản & vé của tôi
                </Link>
              </li>
              <li>
                <Link href="/login" className={linkStyle}>
                  Đăng nhập
                </Link>
              </li>
            </ul>
          </nav>
          <nav aria-label="Ban tổ chức ở cuối trang">
            <h2 className="mb-4 text-sm font-semibold">Dành cho ban tổ chức</h2>
            <ul className="space-y-3">
              <li>
                <Link href="/organizer" className={linkStyle}>
                  Quản lý sự kiện
                </Link>
              </li>
              <li>
                <Link href="/checkin" className={linkStyle}>
                  Kiểm tra vé tại sự kiện
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className={`${linkStyle} inline-flex items-center gap-1.5 font-medium text-primary`}
                >
                  Tạo tài khoản
                  <ArrowUpRight className="size-3.5" aria-hidden="true" />
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="border-t border-border py-5 text-xs text-muted">
          © {new Date().getFullYear()} SmartEvent.
        </div>
      </div>
    </footer>
  )
}
