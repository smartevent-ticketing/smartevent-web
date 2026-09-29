"use client"

import { ShieldCheck, Users, Zap } from "lucide-react"

export function ServiceBenefits() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-white/10 bg-[#1d1d2a] p-7 sm:p-9 lg:p-12">
        <div className="mb-10 max-w-2xl">
          <span className="nightline-kicker">Trải nghiệm liền mạch</span>
          <h2 className="nightline-heading mt-2 text-3xl text-[#f8f2ed] sm:text-4xl">
            Cứ tận hưởng. Để vé cho chúng tôi.
          </h2>
          <p className="mt-3 text-sm text-[#aaa6b7]">
            Từ lúc chọn sự kiện đến lúc vào cửa, mọi thứ đều nằm trong tầm tay.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          <div className="space-y-3 rounded-2xl border border-white/10 bg-[#272633] p-6">
            <div className="flex size-12 items-center justify-center rounded-xl bg-[#ff9479]/10 text-[#ff9479]">
              <ShieldCheck className="size-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Vé điện tử riêng cho bạn</h3>
            <p className="text-sm leading-relaxed text-[#bcb7c4]">
              Mỗi vé có mã QR riêng và được lưu trong tài khoản để bạn dễ dàng sử dụng khi đến sự
              kiện.
            </p>
          </div>

          <div className="space-y-3 rounded-2xl border border-white/10 bg-[#272633] p-6">
            <div className="flex size-12 items-center justify-center rounded-xl bg-[#ff9479]/10 text-[#ff9479]">
              <Zap className="size-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Đặt vé thuận tiện</h3>
            <p className="text-sm leading-relaxed text-[#bcb7c4]">
              Xem hạng vé, chọn số lượng và hoàn tất thanh toán qua VNPay trên một hành trình rõ
              ràng.
            </p>
          </div>

          <div className="space-y-3 rounded-2xl border border-white/10 bg-[#272633] p-6">
            <div className="flex size-12 items-center justify-center rounded-xl bg-[#ff9479]/10 text-[#ff9479]">
              <Users className="size-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Check-in với mã QR</h3>
            <p className="text-sm leading-relaxed text-[#bcb7c4]">
              Mở mã QR của vé trên điện thoại để ban tổ chức kiểm tra khi bạn đến nơi.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
