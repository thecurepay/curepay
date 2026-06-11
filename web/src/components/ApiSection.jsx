import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const ENTRIES = [
  {
    kind: 'CLI',
    name: 'curepay markets',
    cmd: '$ curepay markets',
    out: `Drift perps — funding carry view
MARKET     MARK        FUND/h   ANNUAL    z      SIGNAL  CONV
SOL-PERP   $152.41    +0.0044%  +38.6%   +2.14   short   0.71
BTC-PERP   $64,102     +0.0007%  +6.2%   +0.41   flat    0.00
ETH-PERP   $3,380     -0.0026%  -22.9%   -1.83   long    0.58
WIF-PERP   $2.31      +0.0082%  +71.4%   +2.77   short   0.88`,
  },
  {
    kind: 'CLI',
    name: 'curepay funding SOL-PERP',
    cmd: '$ curepay funding SOL-PERP',
    out: `SOL-PERP
mark: 152.41   index: 152.18   basis: +0.15%
funding/h: +0.0044%   annualised: +38.6%   z: +2.14
open interest: 8,420,113
history points: 168

signal: short  (conviction 0.71)
short to collect carry: annual funding 38.6%, z=2.14`,
  },
  {
    kind: 'CLI',
    name: 'curepay run --once',
    cmd: '$ curepay run --once',
    out: `Curepay agent · mode=paper · equity=10000.00
OPEN short SOL-PERP 1420.00 USD @ 152.34 (fee 0.71)
OPEN short WIF-PERP 1760.00 USD @ 2.312 (fee 0.88)
tick: equity=9998.41 open=2 opened=[SOL-PERP, WIF-PERP] closed=[] funding=+0.42`,
  },
  {
    kind: 'DATA',
    name: 'GET /contracts',
    cmd: '$ curl https://data.api.drift.trade/contracts',
    out: `{
  "contracts": [
    {
      "ticker_id": "SOL-PERP",
      "last_price": "152.41",
      "index_price": "152.18",
      "funding_rate": "0.0000441",
      "open_interest": "8420113",
      "quote_volume": "41200000"
    }
  ]
}`,
  },
  {
    kind: 'DATA',
    name: 'GET /fundingRates',
    cmd: '$ curl "https://data.api.drift.trade/fundingRates?marketName=SOL-PERP"',
    out: `{
  "fundingRates": [
    {
      "ts": 1717977600,
      "fundingRate": "6710000",
      "oraclePriceTwap": "152180000"
    }
  ]
}`,
  },
]

export default function ApiSection() {
  const [selected, setSelected] = useState(0)
  const [typed, setTyped] = useState('')

  const entry = ENTRIES[selected]

  useEffect(() => {
    setTyped('')
    const full = entry.out
    let i = 0
    const interval = setInterval(() => {
      i += 6
      setTyped(full.slice(0, i))
      if (i >= full.length) clearInterval(interval)
    }, 12)
    return () => clearInterval(interval)
  }, [selected, entry.out])

  return (
    <section id="commands" className="border-b border-line">
      <div className="mx-auto max-w-7xl px-6 py-32 lg:py-40">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="eyebrow">06&nbsp;&nbsp;COMMANDS &amp; DATA</p>
          <h2 className="mt-5 text-5xl font-extrabold tracking-[-0.03em] md:text-6xl">
            Run it yourself. <em className="text-dim">Read the source.</em>
          </h2>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-[#9b9489]">
            The whole agent is three commands over two public, read-only endpoints. No hosted API, no
            keys, nothing to trust but the code.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="panel mt-12 grid overflow-hidden lg:grid-cols-[300px_1fr]"
        >
          <div className="border-b border-line lg:border-b-0 lg:border-r">
            <p className="border-b border-line px-4 py-3 font-mono text-[10px] tracking-[0.2em] text-faint">
              COMMANDS · ENDPOINTS
            </p>
            {ENTRIES.map((e, i) => (
              <button
                key={e.name}
                onClick={() => setSelected(i)}
                className={`flex w-full items-center gap-3 border-b border-line px-4 py-3.5 text-left font-mono text-[12px] transition-colors last:border-b-0 ${
                  selected === i ? 'bg-[rgba(207,106,66,0.06)] text-bright' : 'text-[#9b9489] hover:text-bright'
                }`}
              >
                <span
                  className={`w-11 shrink-0 text-[10px] font-bold ${
                    e.kind === 'CLI' ? 'text-acid' : 'text-[#b8ad99]'
                  }`}
                >
                  {e.kind}
                </span>
                {e.name}
              </button>
            ))}
            <p className="px-4 py-4 text-[12px] leading-relaxed text-faint">
              Read-only. Paper-traded. The agent never holds keys or places live orders.
            </p>
          </div>

          <div>
            <pre className="overflow-x-auto border-b border-line bg-[#14100e] p-4 font-mono text-[11.5px] leading-relaxed text-[#cc8d63]">
              {entry.cmd}
            </pre>
            <div className="px-4 pt-3 font-mono text-[10px] tracking-[0.15em] text-faint">
              OUTPUT <span className="text-acid">{entry.kind === 'DATA' ? '200 OK' : 'ok'}</span>
            </div>
            <pre className="min-h-[260px] overflow-x-auto p-4 font-mono text-[11.5px] leading-[1.7] text-[#e2a079]">
              {typed}
              <span className="animate-pulse text-bright">▌</span>
            </pre>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
