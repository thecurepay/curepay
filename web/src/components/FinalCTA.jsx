import { motion } from 'framer-motion'
import DragonCanvas from './DragonCanvas'
import { AppIcon } from './Icons'
import { X_URL } from '../data/links'

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[220px] opacity-70">
        <DragonCanvas interactive={false} segmentScale={0.55} />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 pb-32 pt-56 text-center lg:pb-40 lg:pt-64">
        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="font-extrabold leading-[0.98] tracking-[-0.03em]"
          style={{ fontSize: 'clamp(44px, 6.5vw, 84px)' }}
        >
          Read the carry. <em className="text-dim">Read the code.</em>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="mx-auto mt-7 max-w-xl text-[15.5px] leading-relaxed text-[#9b9489]"
        >
          Open source, paper-traded, free to run. Clone it, audit the logic, point it at Drift. Not
          financial advice.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.22 }}
          className="mt-10 flex flex-wrap justify-center gap-3"
        >
          <a href="#/app" className="btn-primary">
            <AppIcon size={15} /> Open App <span aria-hidden>→</span>
          </a>
          <a href={X_URL} target="_blank" rel="noreferrer" className="btn-ghost">
            Follow on X
          </a>
        </motion.div>
      </div>
    </section>
  )
}
