import { useState } from 'react'

// Renders a token logo from /public/coins, falling back to an initials badge
// if the image is missing. `tint` colours the ring + fallback.
export default function CoinLogo({ logo, base, size = 40, tint = '#cf6a42' }) {
  const [failed, setFailed] = useState(false)

  if (failed || !logo) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-full font-mono font-bold"
        style={{
          width: size,
          height: size,
          fontSize: size * 0.3,
          background: `${tint}1a`,
          color: tint,
          border: `1px solid ${tint}40`,
        }}
      >
        {base.slice(0, 3)}
      </div>
    )
  }

  return (
    <img
      src={logo}
      alt={`${base} logo`}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      className="shrink-0 rounded-full object-cover"
      style={{ width: size, height: size, background: '#1a1512', border: `1px solid ${tint}33` }}
    />
  )
}
