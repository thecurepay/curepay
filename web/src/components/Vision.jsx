import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import DragonCanvas from './DragonCanvas'

const SCATTER = [
  ['代码', '12%', '18%'],
  ['funding', '78%', '12%'],
  ['신호', '8%', '72%'],
  ['carry', '85%', '64%'],
  ['سرعة', '22%', '88%'],
  ['z-score', '68%', '85%'],
  ['basis', '45%', '8%'],
]

export default function Vision() {
  const [isTouch, setIsTouch] = useState(false)
  useEffect(() => {
    setIsTouch(window.matchMedia('(pointer: coarse)').matches)
  }, [])

  return (
    <section className="relative overflow-hidden border-b border-line">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
      >
        <span className="text-[28vw] font-extrabold tracking-tighter text-white opacity-[0.03]">Curepay</span>
      </div>
      {SCATTER.map(([word, left, top]) => (
        <span
          key={word}
          aria-hidden
          className="pointer-events-none absolute select-none font-mono text-[10px] text-white opacity-[0.07]"
          style={{ left, top }}
        >
          {word}
        </span>
      ))}

      <div className="relative mx-auto max-w-7xl px-6 py-32 lg:py-40">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="eyebrow pointer-events-none relative z-10 flex items-center gap-2.5"
        >
          <span className="live-dot" /> THE IDEA
        </motion.p>

        <div className="pointer-events-none relative z-10 mt-10 grid gap-12 lg:grid-cols-2">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-5xl font-extrabold leading-[1.02] tracking-[-0.03em] md:text-6xl"
          >
            The crowded side always pays.
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.12 }}
          >
            <h3 className="text-2xl font-bold tracking-tight md:text-3xl">Read. Score. Size. Hold.</h3>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[#9b9489]">
              Every hour on a perp, whoever&apos;s crowded pays funding to the other side. Most people
              trade through it. Curepay sits on the paid side and collects it — only when the carry is
              large enough and unusual enough to matter. Boring on purpose.
            </p>
          </motion.div>
        </div>

        <div className="relative mt-10 h-[420px] cursor-crosshair md:h-[480px]">
          <DragonCanvas interactive />
        </div>
        <p className="pointer-events-none relative z-10 mt-4 text-center font-mono text-[10.5px] tracking-[0.2em] text-faint">
          {isTouch ? 'drag to lead · hold to breathe fire' : 'move cursor · hold to breathe fire'}
        </p>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="pointer-events-none relative z-10 mt-16 text-center text-[14px] text-dim"
        >
          Not a signal to ape. A small edge, sized for survival, run in the open.
        </motion.p>
      </div>
    </section>
  )
}
