import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Logo from './Logo'
import { AppIcon } from './Icons'
import { X_URL } from '../data/links'

const LINKS = [
  ['Monitor', '#monitor'],
  ['$CURE', '#token'],
  ['Coins', '#coins'],
  ['Agent', '#agent'],
  ['Strategy', '#strategy'],
  ['How it works', '#how-it-works'],
  ['Commands', '#commands'],
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[80] transition-all duration-300 ${
        scrolled
          ? 'border-b border-line bg-[rgba(5,5,5,0.8)] backdrop-blur-md'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6">
        <a href="#" className="flex items-center gap-2.5">
          <Logo />
          <span className="wordmark text-[19px]">Curepay<span className="text-acid">.</span></span>
        </a>

        <div className="hidden items-center gap-7 lg:flex">
          {LINKS.map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="text-[13.5px] font-medium text-[#9b9489] transition-colors hover:text-bright"
            >
              {label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <a href={X_URL} target="_blank" rel="noreferrer" className="btn-ghost !py-2 text-[13px]">
            Follow on X
          </a>
          <a href="#/app" className="btn-primary !py-2 text-[13px]">
            <AppIcon size={14} /> Open App <span aria-hidden>→</span>
          </a>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
          aria-label="Open menu"
        >
          <span className="h-px w-5 bg-bright" />
          <span className="h-px w-5 bg-bright" />
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex flex-col bg-ink px-6 pt-6 lg:hidden"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Logo />
                <span className="wordmark text-[19px]">Curepay<span className="text-acid">.</span></span>
              </div>
              <button onClick={() => setOpen(false)} className="p-2 text-2xl leading-none" aria-label="Close menu">
                ×
              </button>
            </div>
            <div className="mt-12 flex flex-col gap-6">
              {LINKS.map(([label, href], i) => (
                <motion.a
                  key={label}
                  href={href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="text-3xl font-bold tracking-tight"
                >
                  {label}
                </motion.a>
              ))}
            </div>
            <div className="mt-auto mb-10 flex flex-col gap-3">
              <a href={X_URL} target="_blank" rel="noreferrer" className="btn-ghost justify-center">
                Follow on X
              </a>
              <a href="#/app" onClick={() => setOpen(false)} className="btn-primary justify-center">
                <AppIcon size={14} /> Open App →
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
