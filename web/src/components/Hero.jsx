import { motion } from 'framer-motion'
import LiveFeedPanel from './LiveFeedPanel'
import { AppIcon } from './Icons'

const BULLETS = [
  ['Read', 'funding rates + open interest across Drift perp markets, straight from the public Data API'],
  ['Score', 'every market by how large and how unusual its funding is — a carry signal with a conviction number'],
  ['Size', 'the trade through a risk manager and run it in a paper simulator — read-only, no keys, no live orders'],
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut', delay: 0.08 * i } }),
}

export default function Hero() {
  return (
    <section id="monitor" className="relative border-b border-line">
      <div className="mx-auto grid min-h-screen max-w-7xl items-center gap-14 px-6 pb-20 pt-36 lg:grid-cols-2 lg:gap-10 lg:pt-28">
        <div>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0}
            className="eyebrow flex items-center gap-2.5"
          >
            <span className="live-dot" /> OPEN SOURCE · PAPER-TRADED
          </motion.p>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="mt-7 font-extrabold leading-[0.95] tracking-[-0.03em]"
            style={{ fontSize: 'clamp(52px, 7.5vw, 104px)' }}
          >
            The funding
            <br />
            carry agent
            <br />
            for <em className="not-italic italic text-dim">Solana perps.</em>
          </motion.h1>

          <div className="mt-10 space-y-4">
            {BULLETS.map(([lead, rest], i) => (
              <motion.p
                key={lead}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                custom={2 + i}
                className="flex items-baseline gap-3 text-[15px] leading-relaxed text-[#9b9489]"
              >
                <span className="font-mono text-[11px] text-acid">▸</span>
                <span>
                  <strong className="font-bold text-bright">{lead}</strong> — {rest}
                </span>
              </motion.p>
            ))}
          </div>

          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={5} className="mt-10 flex flex-wrap gap-3">
            <a href="#/app" className="btn-primary">
              <AppIcon size={15} /> Open App <span aria-hidden>→</span>
            </a>
            <a href="#playground" className="btn-ghost">
              See it run
            </a>
          </motion.div>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={6}
            className="mt-6 max-w-md font-mono text-[11px] leading-relaxed text-[#6f685c]"
          >
            Research tool. Read-only, paper-traded, no profit promises. Not financial advice.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.25 }}
          className="relative"
        >
          <div
            aria-hidden
            className="absolute -inset-12 -z-10"
            style={{ background: 'radial-gradient(circle at 60% 40%, rgba(207,106,66,0.07), transparent 65%)' }}
          />
          <LiveFeedPanel />
        </motion.div>
      </div>
    </section>
  )
}
