export function secondsUntil(deadline: string | null | undefined, now = Date.now()) {
  const timestamp = Date.parse(deadline ?? "")
  return Number.isFinite(timestamp) ? Math.max(0, Math.ceil((timestamp - now) / 1000)) : 0
}

export function formatCountdown(seconds: number) {
  return `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`
}
