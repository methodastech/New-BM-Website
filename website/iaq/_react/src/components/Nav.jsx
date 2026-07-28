import React, { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { openSearch } from './UniversalSearch.jsx'

const LOGO = '/assets/iaq-logo.webp'
const DEPTHS = [-6.3, -5.6, -4.9, -4.2, -3.5, -2.8, -2.1, -1.4]

export default function Nav() {
  const navRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const openedY = useRef(0)

  useEffect(() => {
    const nav = navRef.current
    const tb = document.querySelector('.topbar')
    let lastY = window.scrollY || 0
    const onScroll = () => {
      const y = window.scrollY
      if (y < 90) { nav.classList.remove('nav-hide', 'nav-float'); tb && tb.classList.remove('tb-hide') }
      else if (y > lastY + 5) { nav.classList.add('nav-hide'); nav.classList.remove('nav-float'); tb && tb.classList.add('tb-hide') }
      else if (y < lastY - 5) { nav.classList.remove('nav-hide'); nav.classList.add('nav-float') }
      lastY = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    openedY.current = window.scrollY
    const onKey = e => { if (e.key === 'Escape') setMenuOpen(false) }
    const onScroll = () => { if (Math.abs(window.scrollY - openedY.current) > 90) setMenuOpen(false) }
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { document.removeEventListener('keydown', onKey); window.removeEventListener('scroll', onScroll) }
  }, [menuOpen])

  const here = ({ isActive }) => (isActive ? 'here' : undefined)
  const close = () => setMenuOpen(false)

  return (
    <>
      <div className="topbar"><div className="topbar-in">
        <span className="brandmark">BM</span>
        <nav className="wsw">
          <a href="/audit.html">01 Audit</a><a href="/framework.html">02 Framework</a><Link to="/" className="on">03 Website</Link>
        </nav>
      </div></div>

      <nav className={'nav' + (menuOpen ? ' menu-open' : '')} ref={navRef}><div className="nav-in">
        <Link className="wordmark" to="/"><span className="logo3d"><span className="logo3d-in">
          {DEPTHS.map(z => (
            <img key={z} className="ldepth" src={LOGO} alt="" aria-hidden="true" style={{ transform: `translateZ(${z}px)` }} />
          ))}
          <img className="lface" src={LOGO} alt="IAQ" />
        </span></span></Link>
        <div className="nav-links">
          <NavLink to="/" end className={here}>Home</NavLink>
          <NavLink to="/about" className={here}>About</NavLink>
          <span className="nav-dis" title="Not available in this demo" aria-disabled="true">Services</span>
          <NavLink to="/projects" className={here}>Projects</NavLink>
          <NavLink to="/careers" className={here}>Careers</NavLink>
        </div>
        <button className="nav-search" type="button" aria-label="Search the site" title="Search ( / )" onClick={openSearch}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
        </button>
        <Link className="cta" to="/contact">Start a project</Link>
        <button className="nav-burger" type="button" aria-label="Menu" aria-expanded={menuOpen} aria-controls="navDrawer"
          onClick={() => setMenuOpen(o => !o)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path className="bx-lid" d="M12 2.6 20.4 7.4 12 12.2 3.6 7.4z" />
            <path className="bx-body" d="M3.6 7.4v9.2L12 21.4l8.4-4.8V7.4M3.6 7.4 12 12.2l8.4-4.8M12 12.2v9.2" />
          </svg>
        </button>
      </div>
        <div className="nav-drawer" id="navDrawer">
          <span className="nd-k">Menu</span>
          <Link to="/" onClick={close}><span className="nn">01</span>Home</Link>
          <Link to="/about" onClick={close}><span className="nn">02</span>About</Link>
          <span className="nd-dis"><span className="nn">--</span>Services</span>
          <Link to="/projects" onClick={close}><span className="nn">03</span>Projects</Link>
          <Link to="/careers" onClick={close}><span className="nn">04</span>Careers</Link>
          <Link className="nd-cta" to="/contact" onClick={close}>Start a project →</Link>
        </div></nav>
    </>
  )
}
