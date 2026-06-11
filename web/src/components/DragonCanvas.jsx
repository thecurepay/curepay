import { useEffect, useRef } from 'react'

const BODY_GLYPHS = ['~', '≈', '/', '\\', '^', '*', '+', 'Δ', 'V', 'Ψ', 'x', 'ヂ', 'ナ', '7', '彡', '3']
const FIRE_GLYPHS = ['*', '+', '.', "'", '∧', 'x', '※']
const FIRE_COLORS = ['#ffffff', '#fde047', '#fb923c', '#f97316', '#dc2626']
const MAX_PARTICLES = 600

function lerp(a, b, t) {
  return a + (b - a) * t
}

// shared dragon engine — interactive in the Vision section, idle-only mini
// version in the final CTA (interactive=false)
export default function DragonCanvas({ interactive = true, segmentScale = 1 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const isMobile = window.innerWidth < 768

    const SEG_COUNT = Math.round((isMobile ? 40 : 80) * segmentScale)
    const HEAD_SIZE = 18 * segmentScale
    const TAIL_SIZE = 6 * segmentScale
    const BASE_SPACING = (isMobile ? 9 : 11) * segmentScale

    let w = 0
    let h = 0
    let dpr = 1
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.parentElement.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    // body segments
    const segs = Array.from({ length: SEG_COUNT }, (_, i) => ({
      x: w / 2 - i * BASE_SPACING,
      y: h / 2,
      glyph: BODY_GLYPHS[Math.floor(Math.random() * BODY_GLYPHS.length)],
    }))

    // particle pool
    const pool = Array.from({ length: MAX_PARTICLES }, () => ({ alive: false }))
    let poolCursor = 0
    const spawnParticle = (x, y, angle) => {
      const p = pool[poolCursor]
      poolCursor = (poolCursor + 1) % MAX_PARTICLES
      const spread = ((Math.random() - 0.5) * 50 * Math.PI) / 180 // ±25°
      const speed = 2.5 + Math.random() * 4
      p.alive = true
      p.x = x
      p.y = y
      p.vx = Math.cos(angle + spread) * speed
      p.vy = Math.sin(angle + spread) * speed
      p.life = 0
      p.maxLife = 36 + Math.random() * 24 // ~0.6-1s @60fps
      p.size = 10 + Math.random() * 8
      p.glyph = FIRE_GLYPHS[Math.floor(Math.random() * FIRE_GLYPHS.length)]
    }

    let mouse = { x: w / 2, y: h / 2 }
    let hasPointer = false
    let lastMove = 0
    let firing = false
    let time = 0
    let running = true
    let raf = null

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      hasPointer = true
      lastMove = performance.now()
    }
    const onTouchMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      const t = e.touches[0]
      if (!t) return
      mouse = { x: t.clientX - rect.left, y: t.clientY - rect.top }
      hasPointer = true
      lastMove = performance.now()
    }
    const onDown = () => {
      if (!reduced) firing = true
    }
    const onUp = () => {
      firing = false
    }

    const parent = canvas.parentElement
    if (interactive && !reduced) {
      parent.addEventListener('mousemove', onMove)
      parent.addEventListener('mousedown', onDown)
      parent.addEventListener('touchmove', onTouchMove, { passive: true })
      parent.addEventListener('touchstart', onDown, { passive: true })
      window.addEventListener('mouseup', onUp)
      window.addEventListener('touchend', onUp)
      parent.addEventListener('mouseleave', () => {
        hasPointer = false
      })
    }

    const draw = () => {
      if (!running) return
      time += 0.016
      ctx.clearRect(0, 0, w, h)

      const idle =
        reduced || !interactive || !hasPointer || performance.now() - lastMove > 2000

      // target: cursor or Lissajous figure-8 around center
      let target
      if (idle) {
        target = {
          x: w / 2 + Math.sin(time * 0.55) * w * 0.3,
          y: h / 2 + Math.sin(time * 1.1) * h * 0.22,
        }
      } else {
        target = mouse
      }

      // breathing: spacing oscillates ±10%
      const spacing = BASE_SPACING * (1 + Math.sin(time * 1.6) * 0.1)

      // head eases toward target, segments chase the previous one
      const head = segs[0]
      head.x = lerp(head.x, target.x, 0.12)
      head.y = lerp(head.y, target.y, 0.12)
      for (let i = 1; i < SEG_COUNT; i++) {
        const prev = segs[i - 1]
        const seg = segs[i]
        const dx = seg.x - prev.x
        const dy = seg.y - prev.y
        const dist = Math.hypot(dx, dy) || 1
        const nx = dx / dist
        const ny = dy / dist
        seg.x = lerp(seg.x, prev.x + nx * spacing, 0.5)
        seg.y = lerp(seg.y, prev.y + ny * spacing, 0.5)
      }

      // screen shake while breathing fire
      let shakeX = 0
      let shakeY = 0
      if (firing) {
        shakeX = (Math.random() - 0.5) * 3
        shakeY = (Math.random() - 0.5) * 3
      }
      ctx.save()
      ctx.translate(shakeX, shakeY)

      const headAngle = Math.atan2(target.y - head.y, target.x - head.x)

      // body — back to front so the head draws on top
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      for (let i = SEG_COUNT - 1; i >= 1; i--) {
        const seg = segs[i]
        const t = i / SEG_COUNT
        const size = lerp(HEAD_SIZE, TAIL_SIZE, t)
        // sine undulation perpendicular to body direction
        const prev = segs[i - 1]
        const ang = Math.atan2(seg.y - prev.y, seg.x - prev.x)
        const wave = Math.sin(time * 3 + i * 0.45) * (4 + t * 5)
        const wx = seg.x + Math.cos(ang + Math.PI / 2) * wave
        const wy = seg.y + Math.sin(ang + Math.PI / 2) * wave

        let color
        let alpha
        if (t < 0.25) {
          color = '#f59e0b'
          alpha = 0.95
        } else if (t < 0.6) {
          color = '#fb923c'
          alpha = 0.8 - (t - 0.25) * 0.8
        } else {
          color = '#7c2d12'
          alpha = Math.max(0.05, 0.55 - (t - 0.6) * 1.2)
        }
        ctx.globalAlpha = alpha
        ctx.fillStyle = color
        ctx.font = `${size}px "JetBrains Mono", monospace`
        ctx.fillText(seg.glyph, wx, wy)

        // wing/fin clusters every 8th segment
        if (i % 8 === 0 && i < SEG_COUNT - 6) {
          ctx.globalAlpha = alpha * 0.7
          ctx.save()
          ctx.translate(wx, wy)
          ctx.rotate(ang)
          ctx.font = `${size * 0.85}px "JetBrains Mono", monospace`
          ctx.fillText('«', 0, -size * 1.2)
          ctx.fillText('»', 0, size * 1.2)
          ctx.font = `${size * 0.7}px "JetBrains Mono", monospace`
          ctx.fillText('/\\', 0, -size * 2)
          ctx.restore()
        }
      }

      // head — glyph cluster rotated toward movement, two bright eyes
      ctx.save()
      ctx.translate(head.x, head.y)
      ctx.rotate(headAngle)
      ctx.globalAlpha = 1
      ctx.fillStyle = '#f59e0b'
      ctx.font = `bold ${HEAD_SIZE * 1.25}px "JetBrains Mono", monospace`
      ctx.fillText('◣▰◢', 0, 0)
      ctx.fillStyle = '#fde047'
      ctx.beginPath()
      ctx.arc(HEAD_SIZE * 0.45, -HEAD_SIZE * 0.28, 1.8, 0, Math.PI * 2)
      ctx.arc(HEAD_SIZE * 0.45, HEAD_SIZE * 0.28, 1.8, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      // fire breathing
      if (firing) {
        const n = 20 + Math.floor(Math.random() * 20)
        const mx = head.x + Math.cos(headAngle) * HEAD_SIZE
        const my = head.y + Math.sin(headAngle) * HEAD_SIZE
        for (let i = 0; i < n; i++) spawnParticle(mx, my, headAngle)

        // radial glow at the head
        const glow = ctx.createRadialGradient(mx, my, 0, mx, my, 70)
        glow.addColorStop(0, 'rgba(251, 146, 60, 0.35)')
        glow.addColorStop(1, 'rgba(251, 146, 60, 0)')
        ctx.globalAlpha = 1
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(mx, my, 70, 0, Math.PI * 2)
        ctx.fill()
      }

      // particles
      for (const p of pool) {
        if (!p.alive) continue
        p.life++
        if (p.life >= p.maxLife) {
          p.alive = false
          continue
        }
        p.x += p.vx
        p.y += p.vy
        p.vy -= 0.04 // slight upward drift
        const lt = p.life / p.maxLife
        const ci = Math.min(FIRE_COLORS.length - 1, Math.floor(lt * FIRE_COLORS.length))
        ctx.globalAlpha = 1 - lt
        ctx.fillStyle = FIRE_COLORS[ci]
        ctx.font = `${p.size * (1 - lt * 0.6)}px "JetBrains Mono", monospace`
        ctx.fillText(p.glyph, p.x, p.y)
      }

      ctx.restore()
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }

    // pause the loop entirely when off-screen
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true
          raf = requestAnimationFrame(draw)
        } else if (!entry.isIntersecting && running) {
          running = false
          if (raf) cancelAnimationFrame(raf)
        }
      },
      { rootMargin: '60px' }
    )
    obs.observe(canvas)
    raf = requestAnimationFrame(draw)

    return () => {
      running = false
      if (raf) cancelAnimationFrame(raf)
      obs.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchend', onUp)
      if (interactive && !reduced) {
        parent.removeEventListener('mousemove', onMove)
        parent.removeEventListener('mousedown', onDown)
        parent.removeEventListener('touchmove', onTouchMove)
        parent.removeEventListener('touchstart', onDown)
      }
    }
  }, [interactive, segmentScale])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
}
