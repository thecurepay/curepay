import Logo from './Logo'
import { CURE_CA, DEX_URL, GITHUB_URL, HAS_CA, PUMP_URL, X_URL } from '../data/links'

const COLUMNS = [
  [
    'Project',
    [
      ['GitHub', GITHUB_URL],
      ['$CURE', PUMP_URL],
      ['Strategy', '#strategy'],
      ['Commands', '#commands'],
    ],
  ],
  [
    'Resources',
    [
      ['Docs', GITHUB_URL],
      ['Drift Data API', 'https://docs.drift.trade/developers/data-api'],
      ['Drift Protocol', 'https://drift.trade'],
    ],
  ],
  [
    'Community',
    [
      ['X', X_URL],
      ['GitHub Issues', `${GITHUB_URL}/issues`],
    ],
  ],
]

export default function Footer() {
  return (
    <footer>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <Logo />
              <span className="wordmark text-[18px]">Curepay<span className="text-acid">.</span></span>
            </div>
            <p className="mt-4 max-w-[260px] text-[12.5px] leading-relaxed text-faint">
              Open-source funding-carry agent for Solana perps. Read-only, paper-traded, fully
              inspectable. Research tool — not financial advice.
            </p>
          </div>
          {COLUMNS.map(([title, links]) => (
            <div key={title}>
              <p className="eyebrow">{title}</p>
              <ul className="mt-4 space-y-2.5">
                {links.map(([label, href]) => (
                  <li key={label}>
                    <a
                      href={href}
                      target={href.startsWith('http') ? '_blank' : undefined}
                      rel={href.startsWith('http') ? 'noreferrer' : undefined}
                      className="text-[13px] text-[#9b9489] transition-colors hover:text-bright"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-line pt-7 md:flex-row">
          <p className="font-mono text-[11px] text-faint">
            © 2026 · Curepay · funding-carry agent for Solana perps
          </p>
          <a
            href={HAS_CA ? DEX_URL : PUMP_URL}
            target="_blank"
            rel="noreferrer"
            className="max-w-full truncate font-mono text-[11px] text-[#4a443c] transition-colors hover:text-acid"
          >
            $CURE — {HAS_CA ? CURE_CA : 'TBA'}
          </a>
        </div>
      </div>
    </footer>
  )
}
