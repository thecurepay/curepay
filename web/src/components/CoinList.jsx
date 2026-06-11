import { motion } from 'framer-motion'
import CoinLogo from './CoinLogo'
import { MARKETS, fmtSignedPct, fundingColor, signalFor, sideColor } from '../data/markets'

export default function CoinList() {
  return (
    <section id="coins" className="border-b border-line">
      <div className="mx-auto max-w-7xl px-6 py-32 lg:py-40">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="eyebrow">03&nbsp;&nbsp;THE BOOK · MARKETS WATCHED</p>
          <h2 className="mt-5 text-5xl font-extrabold tracking-[-0.03em] md:text-6xl">
            The coins it reads.
          </h2>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-[#9b9489]">
            Curepay watches Drift&apos;s liquid perpetuals and scores each by funding carry. Add or remove
            markets in one config line.{' '}
            <span className="text-[#6f685c]">Funding shown is an illustrative sample.</span>
          </p>
        </motion.div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {MARKETS.map((m, i) => {
            const sig = signalFor(m.sample, m.sample / 0.18)
            return (
              <motion.div
                key={m.symbol}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.04 * i }}
                className="group flex items-center gap-4 bg-ink p-6 transition-colors hover:bg-[#15110f]"
              >
                <CoinLogo logo={m.logo} base={m.base} size={40} tint={fundingColor(m.sample)} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="truncate text-[18px] font-semibold tracking-tight">{m.symbol}</span>
                  </div>
                  <div className="font-mono text-[11px] tracking-[0.1em] text-faint">{m.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[13px]" style={{ color: fundingColor(m.sample) }}>
                    {fmtSignedPct(m.sample)}
                  </div>
                  <div
                    className="mt-1 inline-block rounded px-1.5 py-0.5 font-mono text-[9.5px] font-bold tracking-wide"
                    style={{
                      color: sideColor(sig.side),
                      background: `${sideColor(sig.side)}1a`,
                      border: `1px solid ${sideColor(sig.side)}40`,
                    }}
                  >
                    {sig.side}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        <p className="mt-6 font-mono text-[11px] tracking-[0.1em] text-[#6f685c]">
          CUREPAY_MARKETS = SOL-PERP, BTC-PERP, ETH-PERP, JUP-PERP, WIF-PERP, …
        </p>
      </div>
    </section>
  )
}
