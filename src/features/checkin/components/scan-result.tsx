"use client"

import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react"
import { useCheckin } from "@/features/checkin/hooks/use-checkin"

type Props = Pick<ReturnType<typeof useCheckin>, "resultStatus" | "lastScanned" | "handleScan">

export function ScanResult({ resultStatus, lastScanned, handleScan }: Props) {
  if (!lastScanned) return null
  return (
    <>
      {resultStatus === "SUCCESS" && lastScanned && (
        <div className="p-5 rounded-3xl bg-green-950/80 border-2 border-green-500 shadow-xl space-y-3 animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="size-8 text-green-400 shrink-0" />
            <div>
              <span className="text-xs font-black uppercase text-green-400 tracking-wider">
                HỢP LỆ — MỜI VÀO
              </span>
              <h3 className="text-lg font-black text-white">CHECK-IN THÀNH CÔNG!</h3>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-green-900/40 text-xs space-y-1.5 border border-green-700/50">
            <div className="flex justify-between">
              <span className="text-gray-300">Khách hàng:</span>
              <strong className="text-white">{lastScanned.name}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Hạng vé / Ghế:</span>
              <strong className="text-green-300">
                {lastScanned.tier}
                {lastScanned.seatCode ? ` • Ghế ${lastScanned.seatCode}` : ""}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Cổng soát vé:</span>
              <strong className="text-white">{lastScanned.gate}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Mã vé:</span>
              <strong className="font-mono text-white">{lastScanned.code}</strong>
            </div>
            {lastScanned.message && (
              <p className="text-[11px] text-green-200 pt-1 border-t border-green-800/60">
                {lastScanned.message}
              </p>
            )}
          </div>
        </div>
      )}

      {resultStatus === "DUPLICATE" && lastScanned && (
        <div className="p-5 rounded-3xl bg-amber-950/80 border-2 border-amber-500 shadow-xl space-y-3 animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="size-8 text-amber-400 shrink-0" />
            <div>
              <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                CẢNH BÁO TRÙNG LẶP
              </span>
              <h3 className="text-lg font-black text-white">VÉ ĐÃ ĐƯỢC CHECK-IN TRƯỚC ĐÓ!</h3>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-900/40 text-xs space-y-1.5 border border-amber-700/50">
            <div className="flex justify-between">
              <span className="text-gray-300">Mã vé:</span>
              <strong className="font-mono text-white">{lastScanned.code}</strong>
            </div>
            {lastScanned.time && (
              <div className="flex justify-between">
                <span className="text-gray-300">Thời gian quét:</span>
                <strong className="text-amber-300">{lastScanned.time}</strong>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-300">Cổng phát hiện:</span>
              <strong className="text-white">{lastScanned.gate}</strong>
            </div>
            <p className="text-[11px] text-amber-200 pt-1.5 border-t border-amber-800/60">
              ⚠️ Khách đã qua cửa hoặc vé đã bị chia sẻ trái phép. Vui lòng mời khách đến bàn hỗ trợ
              đối soát.
            </p>
          </div>
        </div>
      )}

      {resultStatus === "INVALID" && lastScanned && (
        <div className="p-5 rounded-3xl bg-red-950/80 border-2 border-red-500 shadow-xl space-y-3 animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3">
            <XCircle className="size-8 text-red-400 shrink-0" />
            <div>
              <span className="text-xs font-black uppercase text-red-400 tracking-wider">
                TỪ CHỐI VÀO CỬA
              </span>
              <h3 className="text-lg font-black text-white">MÃ VÉ KHÔNG HỢP LỆ!</h3>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-red-900/40 text-xs space-y-1 border border-red-700/50">
            <p>
              Mã vé <strong className="font-mono text-white">{lastScanned.code}</strong> không tồn
              tại trong hệ thống hoặc không thuộc sự kiện này.
            </p>
            {lastScanned.message && (
              <p className="text-[11px] text-red-300 pt-1">{lastScanned.message}</p>
            )}
          </div>
        </div>
      )}

      {resultStatus === "TIMEOUT" && (
        <div className="p-5 rounded-3xl bg-amber-950/90 border-2 border-amber-400 shadow-xl space-y-3 animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="size-8 text-amber-400 shrink-0" />
            <div>
              <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                CẢNH BÁO HỆ THỐNG
              </span>
              <h3 className="text-lg font-black text-white">
                CHƯA XÁC ĐỊNH KẾT QUẢ — VUI LÒNG KIỂM TRA LẠI
              </h3>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-900/40 text-xs space-y-2 border border-amber-700/50 text-amber-100">
            <p className="font-semibold">
              Không nhận được phản hồi xác thực từ hệ thống (mất kết nối mạng hoặc quá thời gian
              chờ).
            </p>
            <p className="text-[11px] text-amber-200/90">
              ⚠️ <strong>Quy định soát vé:</strong> Tuyệt đối không tự ý kết luận vé hợp lệ hay từ
              chối khách. Vui lòng kiểm tra lại đường truyền mạng hoặc bấm nút thử lại bên dưới.
            </p>
            {lastScanned?.code && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => handleScan(lastScanned.code)}
                  className="w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition cursor-pointer"
                >
                  Thử quét lại mã này
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
