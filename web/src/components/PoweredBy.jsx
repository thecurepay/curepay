import { motion } from 'framer-motion'

const LOGOS = ['Solana', 'Drift Protocol', 'Python', 'httpx', 'Rich', 'CoinGecko', 'GitHub Actions']

export default function PoweredBy() {
  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="eyebrow text-center"
        >
          BUILT ON &amp; POWERED BY
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-5"
        >
          {LOGOS.map((name) => (
            <span
              key={name}
              className="text-[17px] font-bold tracking-tight text-[#8b8478] opacity-50 grayscale transition-opacity duration-300 hover:opacity-100"
            >
              {name}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
