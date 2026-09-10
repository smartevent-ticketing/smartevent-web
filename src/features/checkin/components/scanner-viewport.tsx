"use client"

import { Camera } from "lucide-react"

export function ScannerViewport() {
  return (
    <>
      <div className="relative aspect-square w-full bg-black rounded-3xl overflow-hidden border-2 border-primary/60 shadow-2xl flex flex-col items-center justify-center">
        {/* Laser scanning beam */}
        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#22d3ee] animate-bounce duration-1000 top-1/4" />

        {/* Corner target reticles */}
        <div className="absolute inset-8 border-2 border-white/20 rounded-2xl pointer-events-none">
          <div className="absolute -top-1 -left-1 size-7 border-t-4 border-l-4 border-cyan-400 rounded-tl-lg" />
          <div className="absolute -top-1 -right-1 size-7 border-t-4 border-r-4 border-cyan-400 rounded-tr-lg" />
          <div className="absolute -bottom-1 -left-1 size-7 border-b-4 border-l-4 border-cyan-400 rounded-bl-lg" />
          <div className="absolute -bottom-1 -right-1 size-7 border-b-4 border-r-4 border-cyan-400 rounded-br-lg" />
        </div>

        <Camera className="size-14 text-white/30 mb-2 animate-pulse" />
        <p className="text-xs text-gray-300 font-medium z-10 text-center px-4">
          Hướng camera vào mã QR vé của khách
        </p>
        <p className="text-[10px] text-gray-500 z-10 pt-1">
          Máy ảnh đang sẵn sàng tự động nhận diện mã
        </p>
      </div>
    </>
  )
}
