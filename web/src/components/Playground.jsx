import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import useMarketFeed from '../hooks/useMarketFeed'
import useInViewPause from '../hooks/useInViewPause'
import { MarketRow, SideBadge } from './LiveFeedPanel'
import { convictionColor, fmtSignedPct, makeTick, sideColor } from '../data/markets'

const TABS = ['FEED', 'SIGNAL', 'TRADE']
const ASSETS = ['all', 'SOL', 'BTC', 'ETH']
const MIN_Z = [0, 1, 1.5, 2]
const VIEWS = ['detailed', 'compact']
const TRIGGERS = ['Idle', 'Funding tick', 'Carry spike', 'Signal fired', 'Position opened', 'Carry decayed']

function Pill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded px-2 py-0.5 font-mono text-[10.5px] transition-colors ${
        active ? 'bg-[rgba(207,106,66,0.12)] text-acid' : 'text-faint hover:text-bright'
      }`}
    >
      {children}
    </button>
  )
}

function ConfigJson({ asset, minZ }) {
  const markets = asset === 'all' ? ['SOL-PERP', 'BTC-PERP', 'ETH-PERP'] : [`${asset}-PERP`]
  const k = (s) => <span className="text-[#cc8d63]">"{s}"</span>
  const str = (s) => <span className="text-[#e2a079]">"{s}"</span>
  const num = (n) => <span className="text-[#fbbf24]">{n}</span>
  return (
    <pre className="overflow-x-auto p-4 font-mono text-[11.5px] leading-[1.75] text-[#8b8478]">
      {'{'}
      {'\n  '}{k('markets')}: [{markets.map((s, i) => (
        <span key={s}>
          {str(s)}
          {i < markets.length - 1 ? ', ' : ''}
        </span>
      ))}],
      {'\n  '}{k('min_annual_funding')}: {num(0.05)},
      {'\n  '}{k('min_funding_z')}: {num(minZ)},
      {'\n  '}{k('max_leverage')}: {num(3)},
      {'\n  '}{k('risk_per_trade')}: {num(0.02)},
      {'\n  '}{k('mode')}: {str('paper')}
      {'\n'}{'}'}
    </pre>
  )
}

function SubBar({ label, value, color, delay = 0 }) {
  return (
    <div>
      <div className="flex justify-between font-mono text-[10.5px] text-faint">
        <span>{label}</span>
        <span style={{ color }}>{value}</span>
      </div>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, value)}%` }}
          transition={{ duration: 0.9, ease: 'easeOut', delay }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  )
}

function SignalView({ tick }) {
  const c = convictionColor(tick.conviction)
  const ring = 2 * Math.PI * 44
  const pct = Math.round(tick.conviction * 100)
  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="relative h-[120px] w-[120px]">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="5" />
          <motion.circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke={c}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={ring}
            initial={{ strokeDashoffset: ring }}
            animate={{ strokeDashoffset: ring * (1 - tick.conviction) }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold" style={{ color: c }}>
            {pct}
          </span>
          <span className="font-mono text-[9px] tracking-[0.2em] text-faint">CONVICTION</span>
        </div>
      </div>
      <div className="w-full max-w-[260px]">
        <div className="mb-4 flex items-center justify-center gap-2 text-center text-[14px] font-bold">
          {tick.market}
          <SideBadge side={tick.side} size="sm" />
        </div>
        <div className="space-y-3.5">
          <SubBar
            label="ANNUAL FUNDING"
            value={Math.min(100, Math.abs(tick.annual) * 100)}
            color={sideColor(tick.side)}
          />
          <SubBar label="FUNDING z-SCORE" value={Math.min(100, Math.abs(tick.z) * 33)} color="#fbbf24" delay={0.12} />
          <SubBar label="CONVICTION" value={pct} color={c} delay={0.24} />
        </div>
        <p className="mt-4 text-center font-mono text-[10px] leading-relaxed text-faint">
          {tick.side === 'FLAT'
            ? 'carry too small / ordinary — stand aside'
            : `${tick.side.toLowerCase()} to collect ${fmtSignedPct(tick.annual)} annual funding`}
        </p>
      </div>
    </div>
  )
}

function PaperFill({ tick }) {
  const exit = tick.side === 'LONG' ? 'SHORT' : 'LONG'
  const collecting = tick.side !== 'FLAT'
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className="mx-auto w-full max-w-[330px] rounded-xl border border-[rgba(207,106,66,0.25)] bg-[#14100e] p-4 font-mono"
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded bg-[rgba(207,106,66,0.14)] text-[11px] text-acid">
          ✓
        </span>
        <span className="text-[12.5px] font-bold text-acid">PAPER FILL</span>
        <span className="ml-auto text-[9.5px] text-faint">simulated</span>
      </div>
      <p className="text-[13px] leading-relaxed text-[#d8d2c4]">
        OPEN <span style={{ color: sideColor(tick.side) }}>{tick.side}</span>{' '}
        <strong className="text-bright">{tick.market}</strong>
        <br />
        <span className="text-[11px] text-[#9b9489]">
          entry {tick.markStr} · notional ~${(tick.conviction * 2000).toFixed(0)} · {fmtSignedPct(tick.annual)}/yr
          funding
        </span>
      </p>
      <div className="mt-3 flex gap-2 text-[10px]">
        <span className="rounded border border-[rgba(207,106,66,0.3)] px-2 py-1 text-acid">
          {collecting ? 'collecting carry' : 'flat'}
        </span>
        <span className="rounded border border-line px-2 py-1 text-faint">exit → {exit} on decay</span>
      </div>
    </motion.div>
  )
}

function EventCard({ event }) {
  const styles = {
    'Funding tick': { icon: '·', text: 'New funding observation pulled from Drift', cls: '' },
    'Carry spike': { icon: '⚡', text: 'Funding z-score jumped — carry stretched', cls: 'glow-moon border-[rgba(207,106,66,0.5)]' },
    'Signal fired': { icon: '◎', text: 'Carry signal crossed threshold', cls: '' },
    'Position opened': { icon: '✓', text: 'Paper position opened — collecting funding', cls: 'glow-moon border-[rgba(207,106,66,0.5)]' },
    'Carry decayed': { icon: '↘', text: 'Funding edge faded — position closed', cls: 'shake-rug border-[rgba(245,158,11,0.5)]' },
    Idle: { icon: '·', text: 'Agent idle — watching funding', cls: '' },
  }
  const s = styles[event.kind] || styles.Idle
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0 }}
      className={`flex items-center gap-3 rounded-md border border-line bg-[#14100e] px-3.5 py-3 ${s.cls}`}
    >
      <span className="text-[15px]">{s.icon}</span>
      <span className="text-[12.5px] text-[#c4bdaf]">{s.text}</span>
      <span className="ml-auto font-mono text-[9.5px] text-faint">just now</span>
    </motion.div>
  )
}

export default function Playground() {
  const ref = useRef(null)
  const inView = useInViewPause(ref)
  const [tab, setTab] = useState('FEED')
  const [asset, setAsset] = useState('all')
  const [minZ, setMinZ] = useState(0)
  const [view, setView] = useState('detailed')
  const [events, setEvents] = useState([])
  const [tradeTick, setTradeTick] = useState(null)
  const [copied, setCopied] = useState(false)

  const feed = useMarketFeed({ max: 14, active: inView && tab === 'FEED' })
  const filtered = useMemo(
    () =>
      feed
        .filter((t) => Math.abs(t.z) >= minZ)
        .filter((t) => asset === 'all' || t.base === asset)
        .slice(0, 6),
    [feed, minZ, asset]
  )
  const signalTick = useMemo(() => feed.find((t) => t.side !== 'FLAT') || feed[0], [feed])

  const fire = (kind) => {
    if (kind === 'Position opened') {
      setTab('TRADE')
      setTradeTick(makeTick())
      return
    }
    setEvents((prev) => [{ id: Date.now(), kind }, ...prev].slice(0, 3))
  }

  const copyConfig = () => {
    const markets = asset === 'all' ? ['SOL-PERP', 'BTC-PERP', 'ETH-PERP'] : [`${asset}-PERP`]
    navigator.clipboard
      ?.writeText(
        JSON.stringify(
          {
            markets,
            min_annual_funding: 0.05,
            min_funding_z: minZ,
            max_leverage: 3,
            risk_per_trade: 0.02,
            mode: 'paper',
          },
          null,
          2
        )
      )
      .catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <section id="playground" ref={ref} className="border-b border-line">
      <div className="mx-auto max-w-7xl px-6 py-32 lg:py-40">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="eyebrow">01&nbsp;&nbsp;PLAYGROUND</p>
          <h2 className="mt-5 text-5xl font-extrabold tracking-[-0.03em] md:text-6xl">
            Watch the carry. <em className="text-dim">Read the signal.</em>
          </h2>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-[#9b9489]">
            This is exactly what the agent sees: a funding feed, a conviction signal per market, and the
            paper fill it would take. Filter by market, tighten the z-score, copy the config.{' '}
            <span className="text-[#6f685c]">Numbers here are a simulated preview.</span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="panel mt-12 overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <div className="flex gap-1">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`rounded px-3 py-1.5 font-mono text-[11px] tracking-[0.15em] transition-colors ${
                    tab === t ? 'bg-[rgba(255,255,255,0.08)] text-bright' : 'text-faint hover:text-bright'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <button
              onClick={copyConfig}
              className="rounded border border-line px-3 py-1 font-mono text-[10.5px] text-[#9b9489] transition-colors hover:border-[rgba(255,255,255,0.3)] hover:text-bright"
            >
              {copied ? '✓ Copied' : 'Copy config'}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-line px-4 py-2.5">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] tracking-[0.15em] text-[#4a443c]">MARKET:</span>
              {ASSETS.map((s) => (
                <Pill key={s} active={asset === s} onClick={() => setAsset(s)}>
                  {s}
                </Pill>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] tracking-[0.15em] text-[#4a443c]">MIN |z|:</span>
              {MIN_Z.map((m) => (
                <Pill key={m} active={minZ === m} onClick={() => setMinZ(m)}>
                  {m}
                </Pill>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] tracking-[0.15em] text-[#4a443c]">VIEW:</span>
              {VIEWS.map((v) => (
                <Pill key={v} active={view === v} onClick={() => setView(v)}>
                  {v}
                </Pill>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-2">
            <div className="border-b border-line lg:border-b-0 lg:border-r">
              <div className="flex items-center gap-2 border-b border-line px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-[#3a342e]" />
                <span className="h-2 w-2 rounded-full bg-[#3a342e]" />
                <span className="h-2 w-2 rounded-full bg-[#3a342e]" />
                <span className="ml-2 font-mono text-[10.5px] text-faint">curepay.config.json</span>
              </div>
              <ConfigJson asset={asset} minZ={minZ} />
            </div>

            <div className="flex min-h-[380px] flex-col">
              <div className="flex items-center gap-2 border-b border-line px-4 py-2 font-mono text-[10.5px] text-faint">
                ⏪ live preview <span className="text-acid">· running</span>
              </div>
              <div className="feed-scroll relative flex-1 space-y-2 overflow-hidden p-4">
                {tab === 'SIGNAL' && signalTick ? (
                  <SignalView tick={signalTick} />
                ) : tab === 'TRADE' ? (
                  <div className="flex h-full items-center justify-center py-6">
                    <PaperFill tick={tradeTick || signalTick || makeTick()} />
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {events.map((e) => (
                      <EventCard key={e.id} event={e} />
                    ))}
                    {filtered.map((t) => (
                      <motion.div
                        key={t.id}
                        layout
                        initial={{ opacity: 0, y: -24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                      >
                        <MarketRow tick={t} compact={view === 'compact'} />
                      </motion.div>
                    ))}
                    {filtered.length === 0 && events.length === 0 && (
                      <p className="py-12 text-center font-mono text-[11px] text-faint">
                        no markets with |z| ≥ {minZ} yet — watching…
                      </p>
                    )}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-line px-4 py-3">
            {TRIGGERS.map((t) => (
              <button
                key={t}
                onClick={() => fire(t)}
                className="rounded-full border border-line px-3 py-1.5 font-mono text-[10.5px] text-[#9b9489] transition-all hover:-translate-y-px hover:border-[rgba(255,255,255,0.3)] hover:text-bright"
              >
                {t}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
