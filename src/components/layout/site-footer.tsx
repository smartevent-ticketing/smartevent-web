import Link from "next/link"
import { Globe, MessageSquare, Share2, Ticket } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="bg-surface-container-highest border-t border-outline-variant mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Cột 1: Thương hiệu */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
              <span className="bg-primary text-white p-1.5 rounded-lg">
                <Ticket className="size-4" />
              </span>
              <span>SMART EVENT</span>
            </Link>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Nền tảng đặt vé và quản lý sự kiện thông minh, hiện đại và an toàn hàng đầu tại Việt
              Nam.
            </p>
            <p className="text-xs text-on-surface-variant pt-2">
              © {new Date().getFullYear()} SMART EVENT. All rights reserved.
            </p>
          </div>

          {/* Cột 2: Về chúng tôi */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider">
              Về chúng tôi
            </h4>
            <ul className="space-y-2 text-sm text-on-surface-variant">
              <li>
                <Link href="#" className="hover:text-primary transition">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition">
                  Điều khoản dịch vụ
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition">
                  Trung tâm hỗ trợ
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Dành cho Ban tổ chức */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider">
              Dành cho Ban tổ chức
            </h4>
            <ul className="space-y-2 text-sm text-on-surface-variant">
              <li>
                <Link href="/organizer" className="hover:text-primary transition">
                  Tạo sự kiện mới
                </Link>
              </li>
              <li>
                <Link href="/organizer" className="hover:text-primary transition">
                  Giải pháp bán vé thông minh
                </Link>
              </li>
              <li>
                <Link href="/checkin" className="hover:text-primary transition">
                  Ứng dụng quét vé Check-in
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 4: Kết nối */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider">
              Kết nối với chúng tôi
            </h4>
            <p className="text-sm text-on-surface-variant">
              Theo dõi SmartEvent để cập nhật các concert và lễ hội hot nhất.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="#"
                className="size-9 rounded-full bg-white border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition"
                aria-label="Website"
              >
                <Globe className="size-4" />
              </a>
              <a
                href="#"
                className="size-9 rounded-full bg-white border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition"
                aria-label="Share"
              >
                <Share2 className="size-4" />
              </a>
              <a
                href="#"
                className="size-9 rounded-full bg-white border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition"
                aria-label="Message"
              >
                <MessageSquare className="size-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
