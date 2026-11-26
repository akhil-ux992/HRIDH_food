import { useEffect, useState } from 'react'

export default function CountUp({ value = 0, duration = 1300 }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const target = Number(value) || 0
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    if (reduceMotion || target === 0) {
      setDisplay(target)
      return undefined
    }

    let frame = 0
    const start = performance.now()

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(target * eased))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, duration])

  return <>{display.toLocaleString('en-IN')}</>
}
