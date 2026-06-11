import { motion } from 'framer-motion'

const CARDS = [
  {
    eyebrow: 'DATA',
    title: 'Drift funding + open interest, every market.',
    body: 'Read straight from Drift’s public Data API — no indexer to run, no API key to manage.',
    tags: ['/contracts', '/fundingRates', 'read-only'],
    span: 'lg:col-span-2',
  },
  {
    eyebrow: 'CARRY SIGNAL',
    title: 'Annualised funding × z-score.',
    body: 'Acts only when carry is both large and unusual versus the market’s own history.',
    tags: ['funding z-score', 'conviction 0–1'],
    span: '',
  },
  {
    eyebrow: 'RISK',
    title: 'Sizing, leverage cap, drawdown kill-switch.',
    body: 'Notional scales with equity and conviction, bounded by leverage and a peak-drawdown halt.',
    tags: ['position sizing', 'kill-switch'],
    span: '',
  },
  {
    eyebrow: 'EXECUTION',
    title: 'Paper fills with funding accrual.',
    body: 'Simulated entries and exits, funding booked each tick, PnL marked to the live price.',
    tags: ['paper only', 'no keys'],
    span: '',
  },
  {
    eyebrow: 'EXITS',
    title: 'Out when the edge decays or flips.',
    body: 'A position is held while funding pays it and closed the moment carry fades below the floor.',
    tags: ['auto-exit'],
    span: '',
  },
  {
    eyebrow: 'CLI',
    title: 'One command. Full picture.',
    body: 'A Rich terminal view across every market, plus a paper-trading loop you can run anywhere.',
    tags: ['markets', 'funding', 'run'],
    span: 'lg:col-span-2',
    code: `$ curepay markets
SOL-PERP   +38.6%/yr   z +2.14   short  0.71
ETH-PERP   -22.9%/yr   z -1.83   long   0.58
WIF-PERP   +71.4%/yr   z +2.77   short  0.88
$ curepay run --once
tick · equity=10000.00 open=2 funding=+0.42`,
  },
]

const PILLS = [
  '📊 Funding/h', '📈 Annualised', '🧮 z-score', '🎯 Conviction', '🏦 Open interest', '⚖️ Mark/index basis',
  '🩺 RPC health', '🧷 Index sanity', '📏 Position sizing', '🔧 Leverage cap', '🛑 Drawdown halt', '🔁 Auto-exit',
  '💸 Funding accrual', '📒 PnL marking', '🧪 Test suite', '⚙️ CI', '🐍 Pure Python', '🔓 Open source',
  '📦 pip install', '🖥️ Rich CLI', '🚫 No keys', '🧾 Paper trades', '🌐 Drift Data API', '◎ Solana native',
]

export default function Capabilities() {
  return (
    <section id="features" className="border-b border-line">
      <div className="mx-auto max-w-7xl px-6 py-32 lg:py-40">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center text-5xl font-extrabold leading-[1.02] tracking-[-0.03em] md:text-6xl"
        >
          Everything you need <em className="text-dim">to read the carry.</em>
        </motion.h2>

        <div className="mt-16 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.eyebrow}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.06 * i }}
              className={`group bg-ink p-7 transition-colors hover:bg-[#120f0d] ${card.span}`}
            >
              <p className="eyebrow">{card.eyebrow}</p>
              <h3 className="mt-4 text-lg font-bold tracking-tight">{card.title}</h3>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-[#9b9489]">{card.body}</p>
              {card.code && (
                <pre className="mt-5 overflow-x-auto rounded-md border border-line bg-[#14100e] p-4 font-mono text-[11px] leading-relaxed text-[#d8a06f]">
                  {card.code}
                </pre>
              )}
              <div className="mt-5 flex flex-wrap gap-1.5">
                {card.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-line px-2.5 py-0.5 font-mono text-[10px] text-faint"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="bg-ink p-7 md:col-span-2 lg:col-span-3"
          >
            <p className="eyebrow">WHAT IT TRACKS · EVERY MARKET</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {PILLS.map((p) => (
                <span
                  key={p}
                  className="rounded-full border border-line px-3 py-1.5 font-mono text-[11px] text-[#9b9489] transition-all duration-200 hover:-translate-y-0.5 hover:border-[rgba(207,106,66,0.4)] hover:text-bright"
                >
                  {p}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
