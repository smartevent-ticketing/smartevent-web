"use client"

import { useEffect, useState } from "react"

export function useClock(interval = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const update = () => setNow(Date.now())
    const timer = setInterval(update, interval)
    document.addEventListener("visibilitychange", update)
    return () => {
      clearInterval(timer)
      document.removeEventListener("visibilitychange", update)
    }
  }, [interval])
  return now
}
