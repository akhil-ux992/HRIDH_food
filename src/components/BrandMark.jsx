export default function BrandMark({ className = 'h-10 w-10' }) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[30%] bg-forest text-cream shadow-[0_8px_20px_-10px_rgb(10_42_32/0.65)] ring-1 ring-cream/20 ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 48 48" fill="none" className="h-full w-full">
        <path
          d="M10 31c0-9 6.3-16 14-16s14 7 14 16"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          d="M8.5 31h31"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          d="M17.5 31v-6M24 31v-8.5M30.5 31v-6"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle cx="35" cy="13.5" r="3.4" fill="#E9A23B" />
      </svg>
    </span>
  )
}
