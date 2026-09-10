"use client"

import { ShieldCheck, Users, Zap } from "lucide-react"

export function ServiceBenefits() {
  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-surface-container-high rounded-3xl p-8 lg:p-12 border border-outline-variant/60">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-on-surface">
              Vì sao chọn SMART EVENT?
            </h2>
            <p className="text-sm text-on-surface-variant mt-2">
              Trải nghiệm mua vé sự kiện hiện đại, nhanh chóng và an tâm tuyệt đối
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <div className="bg-white p-6 rounded-2xl border border-outline-variant/60 space-y-3">
              <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <ShieldCheck className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-on-surface">100% Vé chính hãng</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Mỗi tấm vé được gắn mã QR duy nhất chống làm giả, liên kết trực tiếp với hệ thống
                Ban tổ chức.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-outline-variant/60 space-y-3">
              <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Zap className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-on-surface">Giữ chỗ & Mua vé tức thì</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Cơ chế đặt chỗ thời gian thực bảo lưu vé trong 10 phút, thanh toán tiện lợi qua cổng
                VNPay.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-outline-variant/60 space-y-3">
              <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Users className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-on-surface">Check-in thông minh</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Vào cửa chỉ với 1 giây quét mã QR trên điện thoại, không cần in vé giấy, không lo
                thất lạc.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
