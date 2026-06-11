const ITEMS = [
  'Drift perps funding',
  'Open interest tracking',
  'Funding z-score',
  'Carry signal engine',
  'Annualised funding',
  'Mark / index basis',
  'Risk-sized notional',
  'Drawdown kill-switch',
  'Paper-trade simulator',
  'Solana RPC health',
  'CoinGecko index check',
  'Read-only, no keys',
  'Open source Python',
  'CLI + test suite',
  'Funding accrual PnL',
]

function Row({ reverse = false }) {
  const content = (
    <>
      {ITEMS.map((item, i) => (
        <span key={i} className="whitespace-nowrap px-4 font-mono text-[12px] text-faint">
          {item} <span className="pl-7 text-[#3a342e]">·</span>
        </span>
      ))}
    </>
  )
  return (
    <div className="marquee-row overflow-hidden py-3">
      <div className={`marquee-track ${reverse ? 'reverse' : ''}`}>
        <div className="flex shrink-0">{content}</div>
        <div className="flex shrink-0" aria-hidden>
          {content}
        </div>
      </div>
    </div>
  )
}

export default function Marquee() {
  return (
    <section className="border-b border-line">
      <Row />
      <div className="border-t border-line" />
      <Row reverse />
    </section>
  )
}
