import { useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import useMarketFeed from '../hooks/useMarketFeed'
import useInViewPause from '../hooks/useInViewPause'
import CoinLogo from './CoinLogo'
import { fmtSignedPct, fundingColor, sideColor } from '../data/markets'

export function SideBadge({ side, size = 'md' }) {
  const c = sideColor(side)
  return (
    <span
      className={`inline-flex items-center justify-center rounded font-mono font-bold tracking-wide ${
        size === 'md' ? 'min-w-[54px] px-2 py-1 text-[11px]' : 'min-w-[44px] px-1.5 py-0.5 text-[10px]'
      }`}
      style={{ color: c, background: `${c}1a`, border: `1px solid ${c}40` }}
    >
      {side}
    </span>
  )
}

export function MarketIcon({ tick, size = 32 }) {
  return <CoinLogo logo={tick.logo} base={tick.base} size={size} tint={fundingColor(tick.annual)} />
}

export function MarketRow({ tick, compact = false }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-line bg-[#14100e] px-3.5 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <MarketIcon tick={tick} />
        <div className="min-w-0">
          <div className="truncate text-[13.5px] font-semibold">
            {tick.market}
            {!compact && <span className="ml-2 font-mono text-[11px] font-normal text-faint">{tick.markStr}</span>}
          </div>
          {!compact && (
            <div className="font-mono text-[10.5px] text-faint">
              OI {tick.oiStr} · {tick.age}
            </div>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <div className="text-right">
          <div className="font-mono text-[12px]" style={{ color: fundingColor(tick.annual) }}>
            {fmtSignedPct(tick.annual)}
          </div>
          {!compact && (
            <div className="font-mono text-[9.5px] text-faint">
              z {tick.z >= 0 ? '+' : ''}
              {tick.z.toFixed(2)}
            </div>
          )}
        </div>
        <SideBadge side={tick.side} />
      </div>
    </div>
  )
}

const FILTERS = ['SOL', 'BTC', 'ETH', '|z| ≥ 1', 'carry only']

export default function LiveFeedPanel() {
  const ref = useRef(null)
  const inView = useInViewPause(ref)
  const ticks = useMarketFeed({ max: 6, active: inView })

  return (
    <div ref={ref} className="panel relative flex h-[540px] flex-col overflow-hidden p-4">
      <div className="flex items-center justify-between pb-3">
        <span className="flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-acid">
          <span className="live-dot" /> FUNDING MONITOR
        </span>
        <span className="font-mono text-[10.5px] tracking-[0.15em] text-faint">DRIFT · PERPS</span>
      </div>

      <div className="grid grid-cols-[1fr_auto_auto] gap-3 border-t border-line px-1 pb-1 pt-3 font-mono text-[9.5px] tracking-[0.15em] text-[#4a443c]">
        <span>MARKET</span>
        <span className="text-right">ANNUAL FUNDING</span>
        <span className="text-right">SIGNAL</span>
      </div>

      <div className="feed-scroll relative flex-1 space-y-2 overflow-hidden pt-1">
        <AnimatePresence initial={false}>
          {ticks.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -28, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            >
              <MarketRow tick={t} />
            </motion.div>
          ))}
        </AnimatePresence>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#120f0d] to-transparent" />
      </div>

      <div className="mt-3 space-y-2.5 border-t border-line pt-3">
        <div className="flex items-center gap-2 rounded-md border border-line bg-[#14100e] px-3.5 py-2.5">
          <span className="font-mono text-[10px] text-acid">$</span>
          <span className="flex-1 truncate font-mono text-[12px] text-faint">curepay markets</span>
          <span className="flex h-6 w-6 items-center justify-center rounded bg-[rgba(255,255,255,0.06)] text-[11px] text-[#9b9489]">
            ↵
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((c) => (
            <span
              key={c}
              className="rounded-full border border-line px-2.5 py-1 font-mono text-[10.5px] text-[#9b9489]"
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
