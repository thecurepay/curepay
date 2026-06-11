import { useState } from 'react'
import { motion } from 'framer-motion'

const BANDS = [
  {
    range: '0.00',
    label: 'FLAT',
    color: '#666666',
    body: 'carry too small or too ordinary — no trade, the agent stands aside',
  },
  {
    range: '0.01–0.32',
    label: 'LIGHT',
    color: '#f59e0b',
    body: 'a real but modest edge; small notional if leverage room allows',
  },
  {
    range: '0.33–0.65',
    label: 'BUILDING',
    color: '#cf6a42',
    body: 'funding is clearly stretched vs history — a proper carry position',
  },
  {
    range: '0.66–1.00',
    label: 'STRONG',
    color: '#e2a079',
    body: 'large and unusual funding; sized up to the leverage cap',
    glow: true,
  },
]

function bandFor(c) {
  if (c >= 0.66) return BANDS[3]
  if (c >= 0.33) return BANDS[2]
  if (c > 0) return BANDS[1]
  return BANDS[0]
}

function DemoBar({ label, value, color, max = 100 }) {
  return (
    <div>
      <div className="flex justify-between font-mono text-[10.5px] text-faint">
        <span>{label}</span>
        <span style={{ color }}>{Math.round(value)}</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${(value / max) * 100}%`, background: color }}
        />
      </div>
    </div>
  )
}

export default function ScoreBreakdown() {
  // annual funding slider in %, drives a conviction read
  const [annual, setAnnual] = useState(40)
  const z = annual / 18 // simulated z roughly tracks stretch
  const magF = Math.min(1, annual / 100 / (0.05 * 4))
  const zF = Math.min(1, Math.abs(z) / (1 * 3))
  const conviction = annual / 100 >= 0.05 && Math.abs(z) >= 1 ? Math.round(((magF + zF) / 2) * 100) / 100 : 0
  const band = bandFor(conviction)
  const side = conviction === 0 ? 'FLAT' : 'SHORT'

  return (
    <section id="strategy" className="border-b border-line">
      <div className="mx-auto max-w-7xl px-6 py-32 lg:py-40">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="eyebrow">05&nbsp;&nbsp;THE STRATEGY · CONVICTION</p>
          <h2 className="mt-5 text-5xl font-extrabold tracking-[-0.03em] md:text-6xl">
            Every signal has <em className="text-dim">a number.</em>
          </h2>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-[#9b9489]">
            Conviction blends how far funding clears its floor with how unusual it is versus recent
            history. Drag the funding rate and watch the read move.
          </p>
        </motion.div>

        <div className="mt-16 grid items-start gap-14 lg:grid-cols-2">
          <div className="space-y-7">
            {BANDS.map((b, i) => (
              <motion.div
                key={b.label}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.08 * i }}
                className="flex gap-5 border-b border-line pb-7"
              >
                <span
                  className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: b.color, boxShadow: b.glow ? `0 0 14px ${b.color}` : 'none' }}
                />
                <p className="text-[15px] leading-relaxed text-[#9b9489]">
                  <strong className="font-mono font-bold tracking-wide" style={{ color: b.color }}>
                    {b.range} · {b.label}
                  </strong>{' '}
                  — {b.body}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="panel p-8"
            style={{
              boxShadow: conviction >= 0.66 ? `0 0 60px -12px ${band.color}55` : 'none',
              transition: 'box-shadow 0.4s ease',
            }}
          >
            <div className="text-center">
              <div
                className="text-[88px] font-extrabold leading-none tracking-tight transition-colors duration-300"
                style={{ color: band.color }}
              >
                {conviction.toFixed(2)}
              </div>
              <div
                className="mt-2 inline-block rounded-full border px-4 py-1 font-mono text-[11px] tracking-[0.25em] transition-colors duration-300"
                style={{ color: band.color, borderColor: `${band.color}55`, background: `${band.color}10` }}
              >
                {band.label} · {side}
              </div>
            </div>

            <div className="mt-9 flex justify-between font-mono text-[10.5px] text-faint">
              <span>ANNUAL FUNDING</span>
              <span style={{ color: band.color }}>{annual}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="120"
              value={annual}
              onChange={(e) => setAnnual(Number(e.target.value))}
              className="mt-2 w-full accent-[#cf6a42]"
              aria-label="Annual funding demo slider"
            />
            <div className="mt-1 flex justify-between font-mono text-[9.5px] text-[#4a443c]">
              <span>0%</span>
              <span>5%</span>
              <span>40%</span>
              <span>120%</span>
            </div>

            <div className="mt-9 space-y-4">
              <DemoBar label="FUNDING MAGNITUDE" value={magF * 100} color={band.color} />
              <DemoBar label="z-SCORE STRETCH" value={zF * 100} color="#fbbf24" />
              <DemoBar label="CONVICTION" value={conviction * 100} color={band.color} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
