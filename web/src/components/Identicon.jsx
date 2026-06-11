import { hashStr } from '../data/appdata'

// A small GitHub-style symmetric identicon derived from the seed, tinted into
// the warm palette so the wall of wallets stays on-brand.
export default function Identicon({ seed, size = 36 }) {
  const h = hashStr(seed)
  const hue = 8 + (h % 46) // 8..54 — orange/amber/sage-warm band
  const fg = `hsl(${hue}, 58%, 56%)`
  const cells = 5
  const cell = size / cells

  const rects = []
  for (let col = 0; col < 3; col++) {
    for (let row = 0; row < cells; row++) {
      const bit = (h >> (col * cells + row)) & 1
      if (!bit) continue
      const cols = col === 2 ? [2] : [col, cells - 1 - col]
      for (const c of cols) {
        rects.push(<rect key={`${c}-${row}`} x={c * cell} y={row * cell} width={cell + 0.5} height={cell + 0.5} fill={fg} />)
      }
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="shrink-0 rounded-md"
      style={{ background: '#1a1512', border: '1px solid rgba(236,230,216,0.10)' }}
      aria-hidden
    >
      {rects}
    </svg>
  )
}
