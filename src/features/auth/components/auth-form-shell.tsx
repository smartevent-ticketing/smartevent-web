import type { ReactNode } from "react"

interface AuthFormShellProps {
  children: ReactNode
  bannerTitle: string
  bannerDescription: string
  variant?: "login" | "register"
}

export function AuthFormShell({
  children,
  bannerTitle,
  bannerDescription,
  variant = "login",
}: AuthFormShellProps) {
  const registering = variant === "register"
  return (
    <div
      className={`flex flex-col md:flex-row w-full max-w-[1200px] mx-auto ${registering ? "min-h-[650px]" : "min-h-[600px]"} items-center justify-center p-4 lg:p-12 gap-8`}
    >
      <div
        className={`hidden md:flex w-1/2 ${registering ? "h-[650px]" : "h-[600px]"} items-center justify-center relative rounded-2xl overflow-hidden shadow-xl border border-gray-100`}
      >
        <div
          className="bg-cover bg-center w-full h-full absolute inset-0"
          style={{ backgroundImage: "url('/images/concert-banner.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111c2d]/90 via-[#111c2d]/40 to-transparent flex flex-col justify-end p-8 text-white">
          <h2 className="text-2xl lg:text-3xl font-bold mb-2">{bannerTitle}</h2>
          <p className="text-sm lg:text-base text-gray-200">{bannerDescription}</p>
        </div>
      </div>
      <div className="w-full md:w-1/2 flex items-center justify-center p-2 sm:p-4">
        <div
          className={`bg-white p-6 sm:p-10 rounded-2xl shadow-xl w-full ${registering ? "max-w-[480px]" : "max-w-[460px]"} border border-gray-100`}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
