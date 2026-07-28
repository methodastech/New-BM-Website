import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { SEARCH_DATA, KIND_ORDER } from '../data/search.js'

/* tiny event bus so any component (Nav, page CTAs) can open the overlay */
export function openSearch() { window.dispatchEvent(new Event('iaq:search-open')) }

function Highlight({ text, q }) {
  if (!q) return text
  const i = text.toLowerCase().indexOf(q.toLowerCase())
  if (i < 0) return text
  return (<>{text.slice(0, i)}<mark>{text.slice(i, i + q.length)}</mark>{text.slice(i + q.length)}</>)
}

export default function UniversalSearch() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const inputRef = useRef(null)
  const resultsRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  const list = useMemo(() => {
    const toks = q.trim().toLowerCase().split(/\s+/).filter(Boolean)
    if (!toks.length) return SEARCH_DATA.filter(d => d.k === 'Page' || d.k === 'Section')
    const out = []
    SEARCH_DATA.forEach((d, ix) => {
      const hay = (d.t + ' ' + d.d + ' ' + d.s).toLowerCase()
      if (!toks.every(t => hay.includes(t))) return
      const tl = d.t.toLowerCase()
      const sc = tl.indexOf(toks[0]) === 0 ? 0 : (tl.includes(toks[0]) ? 1 : 2)
      out.push({ ...d, sc, ix })
    })
    out.sort((a, b) => a.sc - b.sc || a.ix - b.ix)
    return out.slice(0, 14)
  }, [q])

  const groups = useMemo(() => {
    const g = {}; const order = []
    list.forEach(d => { if (!g[d.k]) { g[d.k] = []; order.push(d.k) } g[d.k].push(d) })
    order.sort((a, b) => KIND_ORDER.indexOf(a) - KIND_ORDER.indexOf(b))
    return order.map(k => ({ k, items: g[k] }))
  }, [list])

  useEffect(() => { setSel(0) }, [q, open])

  useEffect(() => {
    const onOpen = () => { setOpen(true); setTimeout(() => inputRef.current && inputRef.current.focus(), 60) }
    window.addEventListener('iaq:search-open', onOpen)
    const onKey = e => {
      if (e.key === 'Escape') { setOpen(false); return }
      const tag = (e.target.tagName || '').toLowerCase()
      const typing = tag === 'input' || tag === 'textarea' || e.target.isContentEditable
      if (((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') || (!typing && e.key === '/')) { e.preventDefault(); onOpen() }
    }
    document.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('iaq:search-open', onOpen); document.removeEventListener('keydown', onKey) }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('us-lock', open)
    return () => document.documentElement.classList.remove('us-lock')
  }, [open])

  function go(u) {
    setOpen(false)
    const [path, hash] = u.split('#')
    const samePage = path === location.pathname || (path === '/' && location.pathname === '/')
    if (hash && samePage) {
      if (hash.startsWith('q=') && window.__usApplyQ) { window.__usApplyQ(decodeURIComponent(hash.slice(2))); return }
      const el = document.getElementById(hash)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      try { history.pushState(null, '', '#' + hash) } catch (_) {}
      return
    }
    navigate(u) /* the Shell's hash handler finishes the scroll / #q= apply after route change */
  }

  /* keyboard selection follows the rendered (grouped) order, not the raw score order */
  const flatList = useMemo(() => groups.flatMap(g => g.items), [groups])
  function onInputKey(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(s + 1, flatList.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(s => Math.max(s - 1, 0)) }
    else if (e.key === 'Enter' && flatList[sel]) { e.preventDefault(); go(flatList[sel].u) }
  }

  useEffect(() => {
    const res = resultsRef.current
    if (!res) return
    const row = res.querySelectorAll('.us-row')[sel]
    if (!row) return
    const r = row.getBoundingClientRect(), c = res.getBoundingClientRect()
    if (r.bottom > c.bottom || r.top < c.top) row.scrollIntoView({ block: 'nearest' })
  }, [sel])

  let flat = -1
  return (
    <div className={'us-overlay' + (open ? ' open' : '')} role="dialog" aria-modal="true" aria-label="Search the site"
      onMouseDown={e => { if (e.target === e.currentTarget) setOpen(false) }}>
      <div className="us-panel">
        <div className="us-bar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
          <input ref={inputRef} type="search" placeholder="Search pages, services, projects, roles" aria-label="Search the site"
            autoComplete="off" value={q} onChange={e => setQ(e.target.value)} onKeyDown={onInputKey} />
          <button className="us-esc" type="button" onClick={() => setOpen(false)}>ESC</button>
        </div>
        <div className="us-results" ref={resultsRef} data-lenis-prevent="">
          {list.length === 0 ? (
            <div className="us-none">Nothing for <b>{q}</b>. Try a client name, an industry, a service or a role.</div>
          ) : groups.map(({ k, items }) => (
            <React.Fragment key={k}>
              <div className="us-group">{k}{items.length > 1 ? 's' : ''}</div>
              {items.map(d => {
                flat += 1
                const i = flat
                return (
                  <a key={d.t + d.u} className={'us-row' + (i === sel ? ' sel' : '')} href={d.u}
                    onClick={e => { e.preventDefault(); go(d.u) }} onMouseMove={() => setSel(i)}>
                    <span className="us-tx"><span className="us-t"><Highlight text={d.t} q={q.trim()} /></span><span className="us-d">{d.d}</span></span>
                    <span className="us-k">{d.k}</span>
                    <svg className="us-go" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </a>
                )
              })}
            </React.Fragment>
          ))}
        </div>
        <div className="us-foot"><span className="us-keys">&uarr;&darr; navigate &middot; &crarr; open</span><span><span className="us-n">{list.length}</span> results</span></div>
      </div>
    </div>
  )
}
