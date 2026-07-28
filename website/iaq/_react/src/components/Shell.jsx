import React, { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import UniversalSearch from './UniversalSearch.jsx'

gsap.registerPlugin(ScrollTrigger)

/* App shell: buttery Lenis scrolling, cross-route hash deep links (#section and #q=),
   and the BrandMethod embedded back button. Pages render inside. */
export default function Shell({ children }) {
  const location = useLocation()

  /* Lenis: wheel-only smooth scrolling, wired into the GSAP ticker (once) */
  useEffect(() => {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches) return
    const lenis = new Lenis({ lerp: 0.11, smoothWheel: true, wheelMultiplier: 1.8 })
    document.documentElement.style.scrollBehavior = 'auto'
    lenis.on('scroll', ScrollTrigger.update)
    const tick = t => lenis.raf(t * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    const onClick = e => {
      const a = e.target.closest && e.target.closest('a[href^="#"]')
      if (!a) return
      const id = a.getAttribute('href')
      if (!id || id === '#') return
      const el = document.querySelector(id)
      if (!el) return
      e.preventDefault(); lenis.scrollTo(el)
      try { history.pushState(null, '', id) } catch (_) {}
    }
    document.addEventListener('click', onClick)
    window.__lenis = lenis
    return () => { document.removeEventListener('click', onClick); gsap.ticker.remove(tick); lenis.destroy(); delete window.__lenis }
  }, [])

  /* hash deep links survive route changes: retry briefly so lazy pages have time to mount */
  const hashTimer = useRef(null)
  useEffect(() => {
    clearInterval(hashTimer.current)
    const hash = decodeURIComponent((location.hash || '').slice(1))
    if (!hash) return
    if (hash.startsWith('q=')) {
      let tries = 0
      hashTimer.current = setInterval(() => {
        tries += 1
        if (window.__usApplyQ) { window.__usApplyQ(decodeURIComponent(hash.slice(2))); clearInterval(hashTimer.current) }
        else if (tries > 40) clearInterval(hashTimer.current)
      }, 100)
      return
    }
    let tries = 0
    hashTimer.current = setInterval(() => {
      tries += 1
      const el = document.getElementById(hash)
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); clearInterval(hashTimer.current) }
      else if (tries > 40) clearInterval(hashTimer.current)
    }, 100)
    return () => clearInterval(hashTimer.current)
  }, [location])

  /* embedded-in-BM-shell detection + back button */
  useEffect(() => {
    const btn = document.createElement('button')
    btn.id = 'bmBack'; btn.type = 'button'; btn.setAttribute('aria-label', 'Back'); btn.innerHTML = '&larr; Back'
    document.body.appendChild(btn)
    const refresh = () => {
      const embedded = window !== window.parent
      document.body.classList.toggle('embedded', embedded)
      btn.style.display = embedded ? 'flex' : 'none'
    }
    btn.addEventListener('click', () => window.parent.postMessage({ type: 'bm-back' }, '*'))
    refresh()
    window.addEventListener('resize', refresh)
    return () => { window.removeEventListener('resize', refresh); btn.remove() }
  }, [])

  return (
    <>
      {children}
      <UniversalSearch />
    </>
  )
}
