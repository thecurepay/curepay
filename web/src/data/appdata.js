// Deterministic, simulated data for the App page (CoinGecko-style market view +
// a wall of wallets). Nothing here is live — it's an illustrative preview built
// from fixed seeds so it renders the same every time.
import { MARKETS, signalFor } from './markets'

const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

function makePRNG(seed) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function hashStr(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function address(rng) {
  let a = ''
  for (let i = 0; i < 44; i++) a += B58[Math.floor(rng() * B58.length)]
  return a
}

export function makeWallets(n = 36) {
  const rng = makePRNG(20260612)
  const out = []
  for (let i = 0; i < n; i++) {
    const addr = address(rng)
    const cure = Math.floor(rng() ** 2.2 * 19_000_000) + 4200
    const pnl = Math.round((rng() - 0.42) * 340)
    const market = MARKETS[Math.floor(rng() * MARKETS.length)].symbol
    out.push({
      addr,
      short: addr.slice(0, 4) + '…' + addr.slice(-4),
      cure,
      pct: cure / 1_000_000_000,
      pnl,
      market,
    })
  }
  return out.sort((a, b) => b.cure - a.cure)
}

export function sparkPath(seedStr, w = 132, h = 36, points = 26) {
  const rng = makePRNG(hashStr(seedStr))
  let y = 0.45 + rng() * 0.1
  const pts = []
  for (let i = 0; i < points; i++) {
    y += (rng() - 0.5) * 0.22
    y = Math.max(0.1, Math.min(0.9, y))
    pts.push([(i / (points - 1)) * w, h - y * h])
  }
  const d = 'M' + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L ')
  return { d, up: pts[pts.length - 1][1] <= pts[0][1] }
}

export function marketRows() {
  return MARKETS.map((m, i) => {
    const rng = makePRNG(hashStr(m.symbol))
    const change24 = Math.round((rng() - 0.45) * 1800) / 100 // ~ -8%..+10%
    const oiM = Math.round((0.4 + rng() * 9.6) * 10) / 10
    const volM = Math.round((1 + rng() * 48) * 10) / 10
    const z = m.sample / 0.18
    return { ...m, rank: i + 1, change24, oiM, volM, z, sig: signalFor(m.sample, z) }
  })
}

export function fmtCompact(n) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`
  return `$${n.toFixed(0)}`
}

export function fmtPrice(p) {
  if (p >= 1000) return `$${p.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  if (p >= 1) return `$${p.toFixed(2)}`
  if (p >= 0.01) return `$${p.toFixed(4)}`
  return `$${p.toPrecision(3)}`
}

export function fmtNum(n) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`
  return `${n}`
}
