import Link from "next/link"
import { Asterisk, ArrowUpRight } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="bg-[#10101a] border-t border-white/10 text-[#f8f2ed] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Cột 1: Thương hiệu */}
          <div className="space-y-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-extrabold tracking-[-0.06em] text-white"
            >
              <span className="bg-[#ff8063] text-[#261621] p-1.5 rounded-[9px_14px_9px_14px]">
                <Asterisk className="size-4" strokeWidth={3} />
              </span>
              <span>SmartEvent</span>
            </Link>
            <p className="text-sm text-[#bcb7c4] leading-relaxed">
              Mỗi tấm vé là điểm bắt đầu của một câu chuyện đáng nhớ.
            </p>
            <p className="text-xs text-[#928d9e] pt-2">
              © {new Date().getFullYear()} SMART EVENT. All rights reserved.
            </p>
          </div>

          {/* Cột 2: Điều hướng */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Khám phá</h4>
            <ul className="space-y-2 text-sm text-[#bcb7c4]">
              <li>
                <Link href="/" className="hover:text-[#ff9479] transition">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-[#ff9479] transition">
                  Tìm sự kiện
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-[#ff9479] transition">
                  Tài khoản của tôi
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Dành cho Ban tổ chức */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Dành cho Ban tổ chức
            </h4>
            <ul className="space-y-2 text-sm text-[#bcb7c4]">
              <li>
                <Link href="/organizer" className="hover:text-[#ff9479] transition">
                  Tạo sự kiện mới
                </Link>
              </li>
              <li>
                <Link href="/organizer" className="hover:text-[#ff9479] transition">
                  Giải pháp bán vé thông minh
                </Link>
              </li>
              <li>
                <Link href="/checkin" className="hover:text-[#ff9479] transition">
                  Ứng dụng quét vé Check-in
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 4: Tài khoản */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Bắt đầu</h4>
            <p className="text-sm text-[#bcb7c4]">
              Tạo tài khoản để đặt vé và theo dõi đơn hàng của bạn.
            </p>
            <div className="flex flex-wrap gap-3 pt-2 text-sm font-semibold text-[#ff9479]">
              <Link href="/register" className="inline-flex items-center gap-1 hover:underline">
                Đăng ký <ArrowUpRight className="size-3.5" />
              </Link>
              <Link href="/login" className="hover:underline">
                Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
