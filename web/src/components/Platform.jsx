import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { GITHUB_URL } from '../data/links'

function RadarVisual() {
  return (
    <div className="relative mx-auto h-36 w-36">
      {[1, 0.66, 0.33].map((r) => (
        <div
          key={r}
          className="absolute rounded-full border border-[rgba(207,106,66,0.18)]"
          style={{ inset: `${(1 - r) * 50}%` }}
        />
      ))}
      {[
        ['28%', '36%'],
        ['62%', '24%'],
        ['70%', '60%'],
        ['38%', '70%'],
        ['52%', '46%'],
      ].map(([l, t], i) => (
        <span key={i} className="absolute h-1 w-1 rounded-full bg-acid" style={{ left: l, top: t, opacity: 0.7 }} />
      ))}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: 'conic-gradient(from 0deg, rgba(207,106,66,0.35), transparent 70deg)' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
      />
      <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-acid" />
    </div>
  )
}

function ConvictionRingVisual() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [n, setN] = useState(0)

  useEffect(() => {
    if (!inView) return
    let raf
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - start) / 1600)
      setN(Math.round(81 * (1 - Math.pow(1 - t, 3))))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView])

  const ring = 2 * Math.PI * 42
  return (
    <div ref={ref} className="relative mx-auto h-36 w-36">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="5" />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="#cf6a42"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={ring}
          strokeDashoffset={ring * (1 - n / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold text-acid">{n}</span>
        <span className="font-mono text-[9px] tracking-[0.2em] text-faint">CONVICTION</span>
      </div>
    </div>
  )
}

function EquityCurveVisual() {
  return (
    <div className="relative mx-auto h-36 w-44">
      <svg viewBox="0 0 160 110" className="h-full w-full">
        <motion.path
          d="M5 92 L30 84 L55 86 L80 72 L105 70 L130 58 L155 52"
          fill="none"
          stroke="#cf6a42"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
        />
      </svg>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.85 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1.1, type: 'spring', stiffness: 280 }}
        className="absolute right-0 top-2 rounded-md border border-[rgba(207,106,66,0.4)] bg-[rgba(207,106,66,0.1)] px-2 py-1 font-mono text-[10px] font-bold text-acid"
      >
        + carry
      </motion.div>
    </div>
  )
}

const CARDS = [
  {
    num: '01',
    label: 'READ',
    visual: <RadarVisual />,
    title: 'Every market. Every hour.',
    body: 'Funding rates and open interest pulled from Drift’s public Data API, with a Solana RPC health check and a CoinGecko index-price sanity pass before anything acts.',
    link: ['See the monitor →', '#playground'],
  },
  {
    num: '02',
    label: 'SCORE',
    visual: <ConvictionRingVisual />,
    title: 'Large and unusual, or nothing.',
    body: 'Each market gets a carry signal only when annualised funding clears a floor and its z-score versus recent history clears another. The blend becomes a 0–100 conviction.',
    link: ['How scoring works →', '#strategy'],
  },
  {
    num: '03',
    label: 'SIZE',
    visual: <EquityCurveVisual />,
    title: 'Risk first. Paper only.',
    body: 'A risk manager sizes notional from equity, conviction and a leverage cap, trips a drawdown kill-switch, and books the trade in a paper simulator that accrues funding.',
    link: ['Read the code →', GITHUB_URL],
  },
]

export default function Platform() {
  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-7xl px-6 py-32 lg:py-40">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="eyebrow">02&nbsp;&nbsp;THE PIPELINE</p>
          <h2 className="mt-5 text-5xl font-extrabold tracking-[-0.03em] md:text-6xl">
            Read, score, <em className="text-dim">and size.</em>
          </h2>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-[#9b9489]">
            A full path from on-chain funding to a risk-sized paper position: from Drift data to a carry
            signal, from signal to a sized trade.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-3">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.num}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 * i }}
              className="group bg-ink p-8 transition-colors hover:bg-[#120f0d]"
            >
              <p className="font-mono text-[11px] tracking-[0.2em] text-faint">
                {card.num}&nbsp;&nbsp;{card.label}
              </p>
              <div className="py-10">{card.visual}</div>
              <h3 className="text-xl font-bold tracking-tight">{card.title}</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-[#9b9489]">{card.body}</p>
              <a
                href={card.link[1]}
                target={card.link[1].startsWith('http') ? '_blank' : undefined}
                rel={card.link[1].startsWith('http') ? 'noreferrer' : undefined}
                className="mt-5 inline-block text-[13.5px] font-semibold text-bright transition-colors hover:text-acid"
              >
                {card.link[0]}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
