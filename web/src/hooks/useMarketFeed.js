import { useEffect, useRef, useState } from 'react'
import { makeTick } from '../data/markets'

export default function useMarketFeed({ max = 7, active = true, minInterval = 1800, maxInterval = 3600 } = {}) {
  const [ticks, setTicks] = useState(() => Array.from({ length: 5 }, makeTick))
  const timer = useRef(null)

  useEffect(() => {
    if (!active) return
    let cancelled = false
    const tick = () => {
      if (cancelled) return
      setTicks((prev) => [makeTick(), ...prev].slice(0, max))
      timer.current = setTimeout(tick, minInterval + Math.random() * (maxInterval - minInterval))
    }
    timer.current = setTimeout(tick, minInterval)
    return () => {
      cancelled = true
      clearTimeout(timer.current)
    }
  }, [active, max, minInterval, maxInterval])

  return ticks
}
