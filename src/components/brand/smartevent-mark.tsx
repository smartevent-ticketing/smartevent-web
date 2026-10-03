interface SmartEventMarkProps {
  className?: string
}

/** Decorative brand mark; pair with the visible SmartEvent name or a labelled link. */
export function SmartEventMark({ className }: SmartEventMarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect width="32" height="32" rx="9" fill="#c74b31" />
      <path
        d="M8 8h16a3 3 0 0 1 3 3v2a3 3 0 0 0 0 6v2a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-2a3 3 0 0 0 0-6v-2a3 3 0 0 1 3-3Z"
        fill="#fff"
      />
      <path
        d="M16 10v12m-5.2-9 10.4 6m-10.4 0 10.4-6"
        stroke="#c74b31"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
