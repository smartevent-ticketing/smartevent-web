"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Camera, RefreshCw, SwitchCamera } from "lucide-react"
import { CameraPermissionDeniedView, CameraUnavailableView } from "./checkin-error-states"

interface ScannerViewportProps {
  onScan?: (code: string) => void
  isScanning?: boolean
}

export function ScannerViewport({ onScan, isScanning = false }: ScannerViewportProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [cameraState, setCameraState] = useState<"idle" | "streaming" | "denied" | "unavailable">("idle")
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment")
  const streamRef = useRef<MediaStream | null>(null)
  const lastScannedCode = useRef<string>("")
  const lastScanTimestamp = useRef<number>(0)
  const isDetecting = useRef<boolean>(false)

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [])

  const startCamera = useCallback(async () => {
    stopCamera()
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraState("unavailable")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play().catch(() => undefined)
      }
      setCameraState("streaming")
    } catch (err: unknown) {
      const errorName = (err as Error)?.name || ""
      if (errorName === "NotAllowedError" || errorName === "PermissionDeniedError") {
        setCameraState("denied")
      } else {
        setCameraState("unavailable")
      }
    }
  }, [facingMode, stopCamera])

  // Continuous Barcode Detection loop if BarcodeDetector is available
  useEffect(() => {
    if (cameraState !== "streaming" || !onScan) return

    let animationFrameId: number
    const barcodeDetectorSupported = typeof window !== "undefined" && "BarcodeDetector" in window
    let detector: any = null

    if (barcodeDetectorSupported) {
      try {
        detector = new (window as any).BarcodeDetector({
          formats: ["qr_code", "code_128", "code_39"],
        })
      } catch {
        detector = null
      }
    }

    const scanFrame = async () => {
      const video = videoRef.current
      if (video && video.readyState >= 2 && detector && !isDetecting.current) {
        isDetecting.current = true
        try {
          const barcodes = await detector.detect(video)
          if (barcodes.length > 0) {
            const rawValue = barcodes[0].rawValue?.trim()
            const now = Date.now()
            if (
              rawValue &&
              (rawValue !== lastScannedCode.current || now - lastScanTimestamp.current > 2500)
            ) {
              lastScannedCode.current = rawValue
              lastScanTimestamp.current = now
              if (navigator.vibrate) navigator.vibrate(100)
              onScan(rawValue)
            }
          }
        } catch {
          // Frame detect error ignored
        } finally {
          isDetecting.current = false
        }
      }
      animationFrameId = requestAnimationFrame(scanFrame)
    }

    if (detector) {
      animationFrameId = requestAnimationFrame(scanFrame)
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    }
  }, [cameraState, onScan])

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [startCamera, stopCamera])

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"))
  }

  if (cameraState === "denied") {
    return (
      <CameraPermissionDeniedView
        onRetry={startCamera}
        onSwitchToManual={() => {}}
      />
    )
  }

  if (cameraState === "unavailable") {
    return (
      <CameraUnavailableView
        onSwitchToManual={() => {}}
      />
    )
  }

  return (
    <div className="relative aspect-square w-full bg-black rounded-3xl overflow-hidden border-2 border-primary/60 shadow-2xl flex flex-col items-center justify-center">
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="absolute inset-0 size-full object-cover"
      />

      {/* Laser scanning beam */}
      <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#22d3ee] animate-bounce duration-1000 top-1/4 pointer-events-none" />

      {/* Corner target reticles */}
      <div className="absolute inset-8 border-2 border-white/20 rounded-2xl pointer-events-none">
        <div className="absolute -top-1 -left-1 size-7 border-t-4 border-l-4 border-cyan-400 rounded-tl-lg" />
        <div className="absolute -top-1 -right-1 size-7 border-t-4 border-r-4 border-cyan-400 rounded-tr-lg" />
        <div className="absolute -bottom-1 -left-1 size-7 border-b-4 border-l-4 border-cyan-400 rounded-bl-lg" />
        <div className="absolute -bottom-1 -right-1 size-7 border-b-4 border-r-4 border-cyan-400 rounded-br-lg" />
      </div>

      {/* Camera Controls Overlay */}
      <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
        <button
          type="button"
          onClick={toggleCamera}
          className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition cursor-pointer border border-white/10"
          title="Đổi camera trước/sau"
        >
          <SwitchCamera className="size-4" />
        </button>
      </div>

      {isScanning && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-xs z-30 flex items-center justify-center gap-2 text-white font-bold text-sm">
          <RefreshCw className="size-5 animate-spin text-cyan-400" />
          <span>Đang xác minh vé...</span>
        </div>
      )}

      {cameraState === "idle" && (
        <div className="z-10 flex flex-col items-center gap-2">
          <Camera className="size-14 text-white/40 animate-pulse" />
          <p className="text-xs text-gray-300 font-medium text-center px-4">
            Đang khởi động camera...
          </p>
        </div>
      )}
    </div>
  )
}
