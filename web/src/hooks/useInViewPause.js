import { useEffect, useState } from 'react'

// returns true while the referenced element is on screen — used to pause
// rAF loops and feed timers when their section scrolls away
export default function useInViewPause(ref, rootMargin = '120px') {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [ref, rootMargin])

  return inView
}
