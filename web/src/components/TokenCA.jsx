import { useState } from 'react'
import { motion } from 'framer-motion'
import { CURE_CA, DEX_URL, HAS_CA, PUMP_URL } from '../data/links'

export default function TokenCA() {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    if (!HAS_CA) return
    navigator.clipboard?.writeText(CURE_CA).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <section id="token" className="border-b border-line">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="panel relative overflow-hidden p-6 md:p-8"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(circle at 85% 20%, rgba(207,106,66,0.08), transparent 55%)' }}
          />
          <div className="relative flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="eyebrow flex items-center gap-2.5">
                <span className="live-dot" /> $CURE · {HAS_CA ? 'LIVE ON PUMP.FUN' : 'PUMP.FUN — TBA'}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="text-3xl font-extrabold tracking-tight text-acid">$CURE</span>
                <span className="rounded-full border border-[rgba(207,106,66,0.35)] bg-[rgba(207,106,66,0.08)] px-3 py-1 font-mono text-[10.5px] tracking-[0.15em] text-acid-soft">
                  SOLANA · PUMP.FUN
                </span>
              </div>

              <div className="mt-5 flex w-full max-w-full items-center gap-2">
                <span className="hidden font-mono text-[10px] tracking-[0.2em] text-faint sm:block">CA</span>
                <code className="min-w-0 flex-1 truncate rounded-md border border-line bg-[#14100e] px-3.5 py-2.5 font-mono text-[11.5px] text-[#c4bdaf] sm:text-[12.5px]">
                  {HAS_CA ? CURE_CA : 'contract address — dropping at launch'}
                </code>
                <button
                  onClick={copy}
                  disabled={!HAS_CA}
                  className={`shrink-0 rounded-md border px-3.5 py-2.5 font-mono text-[11px] transition-all ${
                    copied
                      ? 'border-[rgba(207,106,66,0.5)] bg-[rgba(207,106,66,0.12)] text-acid'
                      : 'border-line text-[#9b9489] enabled:hover:border-[rgba(255,255,255,0.3)] enabled:hover:text-bright disabled:opacity-40'
                  }`}
                >
                  {copied ? '✓ Copied' : HAS_CA ? 'Copy' : 'TBA'}
                </button>
              </div>
              <p className="mt-3 font-mono text-[10.5px] leading-relaxed text-[#6f685c]">
                Community token. No claim on the software, no promise of returns. Not financial advice.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-3">
              <a
                href={PUMP_URL}
                target="_blank"
                rel="noreferrer"
                className="btn-primary !bg-acid !text-ink hover:!bg-acid-soft"
              >
                {HAS_CA ? 'View on pump.fun' : 'pump.fun'} <span aria-hidden>→</span>
              </a>
              <a href={DEX_URL} target="_blank" rel="noreferrer" className="btn-ghost">
                Chart
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
