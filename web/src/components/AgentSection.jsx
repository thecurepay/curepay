import { motion } from 'framer-motion'
import { GitHubIcon } from './Icons'
import { GITHUB_URL } from '../data/links'

const POINTS = [
  ['curepay markets', 'a funding-carry table across every watched market — mark, funding/h, annualised, z-score, OI, signal, conviction'],
  ['curepay funding SOL-PERP', 'drill into one market: basis, funding history and the exact reason behind its signal'],
  ['curepay run', 'loop the paper agent — it sizes, opens, accrues funding and exits on decayed carry'],
  ['pip install curepay', 'one package, zero keys; the whole engine is readable Python you can audit'],
]

function TerminalMock() {
  return (
    <div className="panel overflow-hidden font-mono">
      <div className="flex items-center gap-2 border-b border-line bg-[#14100e] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#cf6a42]/70" />
        <span className="ml-2 text-[11px] text-faint">curepay — paper</span>
        <span className="ml-auto flex items-center gap-1.5 text-[10.5px] text-acid">
          <span className="live-dot" /> running
        </span>
      </div>

      <div className="space-y-1.5 p-4 text-[12px] leading-relaxed">
        <p className="text-[#8b8478]">
          <span className="text-acid">$</span> curepay markets
        </p>
        <div className="mt-2 grid grid-cols-[1fr_auto_auto_auto] gap-x-4 text-[11px]">
          <span className="text-[#6f685c]">MARKET</span>
          <span className="text-right text-[#6f685c]">ANNUAL</span>
          <span className="text-right text-[#6f685c]">z</span>
          <span className="text-right text-[#6f685c]">SIGNAL</span>

          <Row m="SOL-PERP" a="+38.6%" z="+2.14" s="short" c="#cf6a42" />
          <Row m="BTC-PERP" a="+6.2%" z="+0.41" s="flat" c="#8a8275" />
          <Row m="ETH-PERP" a="-22.9%" z="-1.83" s="long" c="#8aa06f" />
          <Row m="WIF-PERP" a="+71.4%" z="+2.77" s="short" c="#cf6a42" />
          <Row m="JTO-PERP" a="+3.1%" z="+0.22" s="flat" c="#8a8275" />
        </div>
        <p className="pt-3 text-[#8b8478]">
          <span className="text-acid">$</span> curepay run --once
        </p>
        <p className="text-[#9b9489]">
          <span className="text-[#cd8b62]">tick</span> · equity=10000.00 open=2 opened=[SOL-PERP, WIF-PERP]
          closed=[] funding=+0.42
        </p>
        <p className="text-[#6f685c]">
          <span className="animate-pulse text-bright">▌</span>
        </p>
      </div>
    </div>
  )

  function Row({ m, a, z, s, c }) {
    return (
      <>
        <span className="text-[#d8d2c4]">{m}</span>
        <span className="text-right" style={{ color: a.startsWith('-') ? '#8aa06f' : '#cf6a42' }}>
          {a}
        </span>
        <span className="text-right text-[#8b8478]">{z}</span>
        <span className="text-right font-bold" style={{ color: c }}>
          {s}
        </span>
      </>
    )
  }
}

export default function AgentSection() {
  return (
    <section id="agent" className="border-b border-line">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-32 lg:grid-cols-2 lg:py-40">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="eyebrow flex items-center gap-2.5">
            <span className="live-dot" /> THE AGENT · OPEN SOURCE CLI
          </p>
          <h2 className="mt-5 text-5xl font-extrabold leading-[1.02] tracking-[-0.03em] md:text-6xl">
            It lives in <em className="text-dim">your terminal.</em>
          </h2>
          <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-[#9b9489]">
            Curepay isn&apos;t a black box that pings you to ape. It&apos;s a small, readable Python
            agent you run yourself.{' '}
            <code className="rounded bg-[rgba(255,255,255,0.07)] px-1.5 py-0.5 font-mono text-[12.5px] text-acid-soft">
              pip install curepay
            </code>
            , point it at Drift, and every market arrives pre-scored by funding carry. No wallet
            connect, no keys, no live orders — paper only.
          </p>

          <div className="mt-8 space-y-3.5">
            {POINTS.map(([lead, rest], i) => (
              <motion.p
                key={lead}
                initial={{ opacity: 0, x: -14 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: 0.08 * i }}
                className="flex items-baseline gap-3 text-[14px] leading-relaxed text-[#9b9489]"
              >
                <span className="font-mono text-[11px] text-acid">▸</span>
                <span>
                  <code className="rounded bg-[rgba(255,255,255,0.06)] px-1.5 py-0.5 font-mono text-[12.5px] text-bright">
                    {lead}
                  </code>{' '}
                  — {rest}
                </span>
              </motion.p>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="btn-primary">
              <GitHubIcon size={15} /> Read the code <span aria-hidden>→</span>
            </a>
            <a href="#how-it-works" className="btn-ghost">
              How it works
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative"
        >
          <div
            aria-hidden
            className="absolute -inset-12 -z-10"
            style={{ background: 'radial-gradient(circle at 40% 50%, rgba(207,106,66,0.07), transparent 65%)' }}
          />
          <TerminalMock />
        </motion.div>
      </div>
    </section>
  )
}
