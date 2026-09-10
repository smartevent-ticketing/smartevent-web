"use client"

import { useClock } from "./use-clock"
import { formatCountdown, secondsUntil } from "@/lib/time/deadline"

export function useDeadline(deadline: string | null | undefined) {
  const secondsLeft = secondsUntil(deadline, useClock())
  return { secondsLeft, isExpired: secondsLeft === 0, timerDisplay: formatCountdown(secondsLeft) }
}
