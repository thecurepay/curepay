import { motion } from 'framer-motion'
import { GitHubIcon } from './Icons'
import { GITHUB_URL } from '../data/links'

function Cmd({ children }) {
  return (
    <code className="whitespace-nowrap rounded bg-[rgba(255,255,255,0.07)] px-1.5 py-0.5 font-mono text-[12px] text-acid-soft">
      {children}
    </code>
  )
}

const STEPS = [
  {
    num: '01',
    label: 'INSTALL',
    body: (
      <>
        <Cmd>pip install curepay</Cmd> — or clone the repo and <Cmd>pip install -e &quot;.[dev]&quot;</Cmd>.
        Pure Python, Solana RPC + Drift Data API, no keys to set up.
      </>
    ),
    chips: ['pip install curepay'],
  },
  {
    num: '02',
    label: 'CONFIGURE',
    body: (
      <>
        Copy <Cmd>.env.example</Cmd> and pick your markets, funding floors, leverage and risk-per-trade.
        Every knob has a sane default; <Cmd>mode</Cmd> stays <Cmd>paper</Cmd>.
      </>
    ),
    chips: ['CUREPAY_MARKETS', 'mode=paper'],
  },
  {
    num: '03',
    label: 'RUN',
    body: (
      <>
        <Cmd>curepay markets</Cmd> for the carry table, <Cmd>curepay funding SOL-PERP</Cmd> to drill in,
        <Cmd>curepay run</Cmd> to loop the paper agent.
      </>
    ),
    chips: ['curepay markets', 'curepay run'],
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-line">
      <div className="mx-auto max-w-7xl px-6 py-32 lg:py-40">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="eyebrow">04&nbsp;&nbsp;HOW IT WORKS · CLI</p>
          <h2 className="mt-5 text-5xl font-extrabold tracking-[-0.03em] md:text-6xl">
            Install. Configure. <em className="text-dim">Run.</em>
          </h2>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-[#9b9489]">
            Everything runs from your own machine. This is the entire setup:
          </p>
        </motion.div>

        <div className="relative mt-16">
          <svg
            className="absolute left-0 top-[22px] hidden h-px w-full md:block"
            preserveAspectRatio="none"
            viewBox="0 0 100 1"
          >
            <motion.line
              x1="0"
              y1="0.5"
              x2="100"
              y2="0.5"
              stroke="rgba(207,106,66,0.4)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, ease: 'easeInOut' }}
            />
          </svg>

          <div className="grid gap-12 md:grid-cols-3 md:gap-8">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.45 * i }}
                className="relative"
              >
                <div className="relative z-10 inline-flex h-11 items-center gap-3 rounded-full border border-line bg-ink px-5 font-mono text-[12px] tracking-[0.2em]">
                  <span className="text-acid">{step.num}</span>
                  <span className="text-[#3a342e]">·</span>
                  <span className="text-bright">{step.label}</span>
                </div>
                <p className="mt-6 max-w-xs text-[14.5px] leading-[1.8] text-[#9b9489]">{step.body}</p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {step.chips.map((c) => (
                    <span
                      key={c}
                      className="rounded-md border border-line bg-[#14100e] px-3 py-1.5 font-mono text-[11px] text-[#c4bdaf]"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 flex justify-center"
        >
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="btn-primary">
            <GitHubIcon size={15} /> Read the docs <span aria-hidden>→</span>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
