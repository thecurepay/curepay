// Solana perp markets for the demo feed. Market names, price levels, mints and
// logos are real (Drift Protocol perps); funding rates, z-scores and signals
// are SIMULATED client-side so the preview is alive without a backend. The live
// agent reads the real numbers from Drift's public Data API.

// Token logos are bundled locally under /public/coins so they always render —
// no external CDN, no adblock, no redirects. Fall back to an initials badge.
export const MARKETS = [
  { symbol: 'SOL-PERP', base: 'SOL', name: 'Solana', price: 152.4, sample: 0.386, logo: '/coins/sol.png' },
  { symbol: 'BTC-PERP', base: 'BTC', name: 'Bitcoin', price: 64100, sample: 0.062, logo: '/coins/btc.png' },
  { symbol: 'ETH-PERP', base: 'ETH', name: 'Ethereum', price: 3380, sample: -0.229, logo: '/coins/eth.png' },
  { symbol: 'JUP-PERP', base: 'JUP', name: 'Jupiter', price: 0.92, sample: 0.144, logo: '/coins/jup.webp' },
  { symbol: 'WIF-PERP', base: 'WIF', name: 'dogwifhat', price: 2.31, sample: 0.714, logo: '/coins/wif.webp' },
  { symbol: 'BONK-PERP', base: 'BONK', name: 'Bonk', price: 0.0000241, sample: 0.512, logo: '/coins/bonk.webp' },
  { symbol: 'POPCAT-PERP', base: 'POPCAT', name: 'Popcat', price: 1.18, sample: 0.331, logo: '/coins/popcat.webp' },
  { symbol: 'PYTH-PERP', base: 'PYTH', name: 'Pyth Network', price: 0.41, sample: -0.118, logo: '/coins/pyth.webp' },
  { symbol: 'PENGU-PERP', base: 'PENGU', name: 'Pudgy Penguins', price: 0.032, sample: 0.205, logo: '/coins/pengu.webp' },
  { symbol: 'DRIFT-PERP', base: 'DRIFT', name: 'Drift', price: 0.88, sample: -0.087, logo: '/coins/drift.webp' },
]

const HOURS_PER_YEAR = 24 * 365

let seed = 90210
function rand() {
  seed |= 0
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v))
}

// thresholds mirror the agent defaults (curepay.utils.config)
export const MIN_ANNUAL = 0.05
export const MIN_Z = 1.0

function annualFunding() {
  const r = rand()
  const sign = rand() < 0.5 ? -1 : 1
  if (r < 0.45) return sign * rand() * 0.08 // calm: 0–8%
  if (r < 0.82) return sign * (0.08 + rand() * 0.32) // active: 8–40%
  return sign * (0.4 + rand() * 0.85) // stretched: 40–125%
}

function formatPrice(p) {
  if (p >= 1000) return `$${p.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  if (p >= 1) return `$${p.toFixed(2)}`
  if (p >= 0.01) return `$${p.toFixed(3)}`
  return `$${p.toPrecision(3)}`
}

function formatOi(oiUsd) {
  if (oiUsd >= 1e6) return `$${(oiUsd / 1e6).toFixed(1)}M`
  return `$${Math.round(oiUsd / 1e3)}K`
}

export function signalFor(annual, z) {
  if (Math.abs(annual) < MIN_ANNUAL || Math.abs(z) < MIN_Z) {
    return { side: 'FLAT', conviction: 0 }
  }
  const side = annual > 0 ? 'SHORT' : 'LONG'
  const magF = clamp(Math.abs(annual) / (MIN_ANNUAL * 4), 0, 1)
  const zF = clamp(Math.abs(z) / (MIN_Z * 3), 0, 1)
  return { side, conviction: Math.round(((magF + zF) / 2) * 100) / 100 }
}

let nextId = 1
let cursor = 0
export function makeTick() {
  cursor = (cursor + 1 + Math.floor(rand() * 2)) % MARKETS.length
  const m = MARKETS[cursor]
  const annual = annualFunding()
  const hourly = annual / HOURS_PER_YEAR
  const z = Math.round((annual / 0.18 + (rand() - 0.5) * 1.2) * 100) / 100
  const { side, conviction } = signalFor(annual, z)
  const mark = m.price * (0.997 + rand() * 0.006)
  const oiUsd = (0.4 + rand() * 9.6) * 1e6
  return {
    id: nextId++,
    market: m.symbol,
    base: m.base,
    name: m.name,
    logo: m.logo,
    mark,
    markStr: formatPrice(mark),
    hourly,
    annual,
    z,
    side,
    conviction,
    oiStr: formatOi(oiUsd),
    age: `${Math.floor(2 + rand() * 50)}s ago`,
  }
}

export function fmtPct(frac, decimals = 2) {
  return `${(frac * 100).toFixed(decimals)}%`
}

export function fmtSignedPct(frac, decimals = 1) {
  const s = frac >= 0 ? '+' : ''
  return `${s}${(frac * 100).toFixed(decimals)}%`
}

// warm palette: short leans burnt-orange (crowded long pays), long leans sage,
// flat is a muted warm grey.
export function sideColor(side) {
  if (side === 'LONG') return '#8aa06f'
  if (side === 'SHORT') return '#cf6a42'
  return '#8a8275'
}

export function fundingColor(annual) {
  if (annual > MIN_ANNUAL) return '#cf6a42'
  if (annual < -MIN_ANNUAL) return '#8aa06f'
  return '#d4923f'
}

export function convictionColor(conviction) {
  if (conviction >= 0.66) return '#cf6a42'
  if (conviction >= 0.33) return '#d4923f'
  return '#8a8275'
}
