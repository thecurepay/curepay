import { useMemo } from 'react'
import { motion } from 'framer-motion'
import CoinLogo from './components/CoinLogo'
import Identicon from './components/Identicon'
import { SideBadge } from './components/LiveFeedPanel'
import { GitHubIcon, XIcon } from './components/Icons'
import { convictionColor, fmtSignedPct, fundingColor, sideColor } from './data/markets'
import { fmtCompact, fmtNum, fmtPrice, makeWallets, marketRows, sparkPath } from './data/appdata'
import { GITHUB_URL, PUMP_URL, X_URL } from './data/links'

function Sparkline({ seed }) {
  const { d, up } = sparkPath(seed)
  const c = up ? '#8aa06f' : '#cf6a42'
  return (
    <svg width="132" height="36" viewBox="0 0 132 36" className="overflow-visible">
      <path d={d} fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChangePill({ value }) {
  const up = value >= 0
  return (
    <span className="font-mono text-[13px]" style={{ color: up ? '#8aa06f' : '#cf6a42' }}>
      {up ? '▲' : '▼'} {Math.abs(value).toFixed(2)}%
    </span>
  )
}

function ConvictionCell({ value }) {
  const c = convictionColor(value)
  return (
    <div className="flex items-center justify-end gap-2">
      <div className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-[rgba(236,230,216,0.08)] sm:block">
        <div className="h-full rounded-full" style={{ width: `${value * 100}%`, background: c }} />
      </div>
      <span className="font-mono text-[13px]" style={{ color: c }}>
        {value.toFixed(2)}
      </span>
    </div>
  )
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-[rgba(16,13,11,0.85)] backdrop-blur-md">
      <div className="mx-auto flex h-[64px] max-w-7xl items-center justify-between px-5">
        <div className="flex items-center gap-5">
          <a href="#/" className="wordmark text-[20px]">
            Curepay<span className="text-acid">.</span>
          </a>
          <span className="hidden font-mono text-[11px] tracking-[0.2em] text-faint sm:inline">/ APP</span>
        </div>
        <div className="flex items-center gap-2.5">
          <a href="#/" className="btn-ghost !py-1.5 !text-[12px]">
            ← Site
          </a>
          <a href={X_URL} target="_blank" rel="noreferrer" className="btn-ghost !px-2.5 !py-1.5">
            <XIcon size={13} />
          </a>
          <a href={PUMP_URL} target="_blank" rel="noreferrer" className="btn-primary !py-1.5 !text-[12px]">
            Buy $CURE →
          </a>
        </div>
      </div>
    </header>
  )
}

function StatStrip({ rows }) {
  const totalOi = rows.reduce((s, r) => s + r.oiM, 0)
  const totalVol = rows.reduce((s, r) => s + r.volM, 0)
  const avgFunding = rows.reduce((s, r) => s + Math.abs(r.annual), 0) / rows.length
  const stats = [
    ['MARKETS', `${rows.length}`],
    ['OPEN INTEREST', fmtCompact(totalOi * 1e6)],
    ['24H VOLUME', fmtCompact(totalVol * 1e6)],
    ['AVG |FUNDING|', `${(avgFunding * 100).toFixed(1)}%`],
    ['ACTIVE SIGNALS', `${rows.filter((r) => r.sig.side !== 'FLAT').length}`],
  ]
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3 lg:grid-cols-5">
      {stats.map(([k, v]) => (
        <div key={k} className="bg-ink px-5 py-4">
          <div className="eyebrow">{k}</div>
          <div className="mt-1.5 font-mono text-[19px] text-bright">{v}</div>
        </div>
      ))}
    </div>
  )
}

function MarketTable({ rows }) {
  return (
    <div className="panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line font-mono text-[10px] tracking-[0.15em] text-faint">
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">MARKET</th>
              <th className="px-4 py-3 text-right font-medium">PRICE</th>
              <th className="px-4 py-3 text-right font-medium">24H</th>
              <th className="px-4 py-3 text-right font-medium">ANNUAL FUNDING</th>
              <th className="px-4 py-3 text-right font-medium">OPEN INTEREST</th>
              <th className="px-4 py-3 text-right font-medium">CONVICTION</th>
              <th className="px-4 py-3 text-center font-medium">SIGNAL</th>
              <th className="px-4 py-3 text-right font-medium">LAST 7D</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.symbol} className="border-b border-line transition-colors last:border-b-0 hover:bg-[#15110f]">
                <td className="px-4 py-3 font-mono text-[12px] text-faint">{r.rank}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <CoinLogo logo={r.logo} base={r.base} size={30} tint={fundingColor(r.annual)} />
                    <div>
                      <div className="text-[14px] font-semibold tracking-tight">{r.symbol}</div>
                      <div className="font-mono text-[10.5px] text-faint">{r.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-mono text-[13px]">{fmtPrice(r.mark || r.price)}</td>
                <td className="px-4 py-3 text-right">
                  <ChangePill value={r.change24} />
                </td>
                <td className="px-4 py-3 text-right font-mono text-[13px]" style={{ color: fundingColor(r.annual) }}>
                  {fmtSignedPct(r.annual)}
                  <span className="ml-1 text-[10px] text-faint">z{r.z >= 0 ? '+' : ''}{r.z.toFixed(1)}</span>
                </td>
                <td className="px-4 py-3 text-right font-mono text-[13px] text-[#c4bdaf]">{fmtCompact(r.oiM * 1e6)}</td>
                <td className="px-4 py-3">
                  <ConvictionCell value={r.sig.conviction} />
                </td>
                <td className="px-4 py-3 text-center">
                  <SideBadge side={r.sig.side} size="sm" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <Sparkline seed={r.symbol} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function WalletStrip({ wallets }) {
  // many wallets lined up — a dense avatar wall
  return (
    <div className="flex flex-wrap gap-2">
      {wallets.map((w) => (
        <div
          key={w.addr}
          title={`${w.short} · ${fmtNum(w.cure)} $CURE`}
          className="transition-transform hover:-translate-y-0.5"
        >
          <Identicon seed={w.addr} size={34} />
        </div>
      ))}
    </div>
  )
}

function WalletCard({ w, rank }) {
  const up = w.pnl >= 0
  return (
    <div className="flex items-center gap-3 rounded-lg border border-line bg-ink p-4 transition-colors hover:bg-[#15110f]">
      <span className="w-5 font-mono text-[11px] text-faint">{rank}</span>
      <Identicon seed={w.addr} size={38} />
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[12.5px] text-bright">{w.short}</div>
        <div className="font-mono text-[10.5px] text-faint">
          {fmtNum(w.cure)} $CURE · {(w.pct * 100).toFixed(3)}%
        </div>
      </div>
      <div className="text-right">
        <div className="font-mono text-[12px]" style={{ color: up ? '#8aa06f' : '#cf6a42' }}>
          {up ? '+' : ''}
          {w.pnl}%
        </div>
        <div className="font-mono text-[9.5px] text-faint">{w.market}</div>
      </div>
    </div>
  )
}

export default function AppPage() {
  const rows = useMemo(() => marketRows(), [])
  const wallets = useMemo(() => makeWallets(36), [])

  return (
    <div className="grain min-h-screen">
      <Header />

      <main className="mx-auto max-w-7xl px-5 pb-28 pt-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow flex items-center gap-2.5">
              <span className="live-dot" /> CUREPAY APP · MARKET VIEW
            </p>
            <h1 className="mt-4 text-5xl font-extrabold tracking-[-0.03em] md:text-6xl">Markets</h1>
            <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-[#9b9489]">
              Every Solana perp Curepay watches, scored by funding carry — price, funding, conviction and signal in
              one board. <span className="text-[#6f685c]">Illustrative preview; live data at genesis.</span>
            </p>
          </div>
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="btn-ghost">
            <GitHubIcon size={15} /> Source
          </a>
        </div>

        <div className="mt-10">
          <StatStrip rows={rows} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8"
        >
          <MarketTable rows={rows} />
        </motion.div>

        {/* wallets */}
        <div className="mt-20">
          <p className="eyebrow">THE BOOK · {wallets.length} WALLETS HOLDING $CURE</p>
          <h2 className="mt-4 text-4xl font-extrabold tracking-[-0.03em] md:text-5xl">Wallets on the book</h2>
          <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-[#9b9489]">
            Addresses holding a piece of the agent, lined up by size.{' '}
            <span className="text-[#6f685c]">Addresses and balances are illustrative.</span>
          </p>

          <div className="mt-8 rounded-xl border border-line bg-ink p-5">
            <WalletStrip wallets={wallets} />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {wallets.slice(0, 18).map((w, i) => (
              <WalletCard key={w.addr} w={w} rank={i + 1} />
            ))}
          </div>
        </div>

        <p className="mt-16 border-t border-line pt-8 text-center font-mono text-[11px] leading-relaxed text-faint">
          Curepay is an open-source, read-only, paper-trading research tool. This app view is an illustrative
          preview. Not financial advice.
        </p>
      </main>
    </div>
  )
}
