import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

/* BrandMethod ribbon: the animated fabric signature, ported verbatim from the static concept */
function initRibbon(cv, fb) {
  let ctx; try { ctx = cv && cv.getContext('2d') } catch (e) {}
  if (!ctx) { if (cv) cv.style.display = 'none'; if (fb) fb.hidden = false; return () => {} }
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const W = 460, H = 110, dpr = Math.min(window.devicePixelRatio || 1, 2)
  cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  const X0 = 40, X1 = 420, BH = 32, BY = 40
  let running = false, looping = false, t = 0, dead = false
  const SEGS = [
    { t: 'DEMO BY', f: '600 12px Inter,sans-serif', sp: 3.6, a: 1, dy: 0, gap: 8 },
    { star: true, w: 13, gap: 9 },
    { t: 'BRAND', f: '600 12px Inter,sans-serif', sp: 3.6, a: 0.98, dy: 0 },
    { t: 'METHOD.CO', f: '600 12px Inter,sans-serif', sp: 3.6, a: 0.98, dy: 0 },
  ]
  let GLYPHS = null
  function buildGlyphs() {
    GLYPHS = []
    SEGS.forEach(s => {
      if (s.star) { GLYPHS.push({ star: true, w: s.w }); if (s.gap) GLYPHS.push({ gap: s.gap }); return }
      if (!s.t) { if (s.gap) GLYPHS.push({ gap: s.gap }); return }
      ctx.font = s.f
      for (let i = 0; i < s.t.length; i++) {
        const ch = s.t[i]
        if (ch === ' ') { GLYPHS.push({ gap: 6.5 }); continue }
        GLYPHS.push({ ch, f: s.f, a: s.a, dy: s.dy || 0, w: ctx.measureText(ch).width + s.sp })
      }
      if (s.gap) GLYPHS.push({ gap: s.gap })
    })
  }
  const wave = (x, tt) => 4.0 * Math.sin(x * 0.0135 + tt * 0.0011) + 2.4 * Math.sin(x * 0.029 - tt * 0.00068) + 1.2 * Math.sin(x * 0.055 + tt * 0.0016)
  const slope = (x, tt) => (wave(x + 2, tt) - wave(x - 2, tt)) / 4
  const lerp = (a, b, p) => a + (b - a) * p
  const shade = p => `rgb(${Math.round(lerp(18, 86, p))},${Math.round(lerp(28, 116, p))},${Math.round(lerp(158, 255, p))})`
  function tail(xEdge, dir, tt) {
    const y = BY + wave(xEdge, tt) * 0.7 + 9
    const x2 = xEdge - dir * 40
    ctx.beginPath()
    ctx.moveTo(xEdge, y); ctx.lineTo(x2, y + 7); ctx.lineTo(x2 + dir * 13, y + 7 + BH / 2)
    ctx.lineTo(x2, y + 7 + BH); ctx.lineTo(xEdge, y + BH); ctx.closePath()
    ctx.fillStyle = '#101C96'; ctx.fill()
    ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.fill()
  }
  function draw(tt) {
    if (!GLYPHS) buildGlyphs()
    ctx.clearRect(0, 0, W, H)
    tail(X0 + 6, 1, tt); tail(X1 - 6, -1, tt)
    for (let x = X0; x <= X1; x += 2) {
      const y = BY + wave(x, tt), s = slope(x, tt)
      const p = Math.max(0, Math.min(1, 0.52 + s * 5.5 + 0.14 * Math.sin(x * 0.006 - tt * 0.00042)))
      ctx.fillStyle = shade(p)
      ctx.fillRect(x - 1, y, 2.4, BH)
    }
    ctx.beginPath()
    for (let x = X0; x <= X1; x += 4) { const y = BY + wave(x, tt); x === X0 ? ctx.moveTo(x, y + 0.6) : ctx.lineTo(x, y + 0.6) }
    ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = 1.1; ctx.stroke()
    ctx.beginPath()
    for (let x = X0; x <= X1; x += 4) { const y = BY + wave(x, tt) + BH; x === X0 ? ctx.moveTo(x, y - 0.6) : ctx.lineTo(x, y - 0.6) }
    ctx.strokeStyle = 'rgba(0,10,60,.4)'; ctx.lineWidth = 1.2; ctx.stroke()
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
    let total = 0; GLYPHS.forEach(g => { total += g.w || g.gap || 0 })
    let xs = (X0 + X1) / 2 - total / 2
    GLYPHS.forEach(g => {
      if (g.gap) { xs += g.gap; return }
      const cxx = xs + (g.w || 0) / 2
      const y = BY + wave(cxx, tt) + BH / 2 + 0.5, a = Math.atan(slope(cxx, tt))
      ctx.save(); ctx.translate(cxx, y); ctx.rotate(a)
      if (g.star) {
        ctx.strokeStyle = 'rgba(255,255,255,.97)'; ctx.lineWidth = 1.5; ctx.lineCap = 'round'
        for (let sp = 0; sp < 4; sp++) {
          const an = sp * Math.PI / 4
          ctx.beginPath(); ctx.moveTo(-Math.cos(an) * 4.6, -Math.sin(an) * 4.6); ctx.lineTo(Math.cos(an) * 4.6, Math.sin(an) * 4.6); ctx.stroke()
        }
      } else {
        ctx.font = g.f
        ctx.fillStyle = 'rgba(2,8,40,.4)'; ctx.fillText(g.ch, -((g.w || 0) / 2) + 0.7, (g.dy || 0) + 1.1)
        ctx.fillStyle = `rgba(255,255,255,${g.a})`; ctx.fillText(g.ch, -((g.w || 0) / 2), g.dy || 0)
      }
      ctx.restore()
      xs += g.w || 0
    })
  }
  function frame() { if (dead || !running) { looping = false; return } looping = true; t += 16; draw(t); requestAnimationFrame(frame) }
  draw(0)
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!dead) { GLYPHS = null; draw(t) } })
  let io = null
  const onVis = () => {
    if (document.hidden) { running = false } else {
      const r = cv.getBoundingClientRect()
      if (r.top < innerHeight && r.bottom > 0) { running = true; if (!looping) requestAnimationFrame(frame) }
    }
  }
  if (!reduce) {
    if (window.IntersectionObserver) {
      io = new IntersectionObserver(es => es.forEach(en => { running = en.isIntersecting; if (running && !looping) requestAnimationFrame(frame) }))
      io.observe(cv)
    } else { running = true; requestAnimationFrame(frame) }
    document.addEventListener('visibilitychange', onVis)
  }
  return () => { dead = true; running = false; io && io.disconnect(); document.removeEventListener('visibilitychange', onVis) }
}

export default function Footer({ note = 'Website concept · Brand Method' }) {
  const cvRef = useRef(null)
  const fbRef = useRef(null)
  useEffect(() => initRibbon(cvRef.current, fbRef.current), [])
  return (
    <footer className="sitefoot">
      <div className="f-in">
        <div><div className="wm"><span>IAQ &middot; Total Facility Solutions</span></div><p>Sustainable and innovative engineering and facility solutions, driven by expertise and leadership since 1994.</p></div>
        <div><h4>The Company</h4><Link to="/#story">Overview</Link><Link to="/#services">Services</Link><Link to="/projects">Projects</Link><Link to="/careers">Careers</Link><Link to="/#news">Newsroom</Link><a href="/portal.html">Client Portal</a></div>
        <div><h4>Compliance</h4><a href="#" tabIndex={-1}>ISO 9001:2015</a><a href="#" tabIndex={-1}>ISO 14001:2015</a><a href="#" tabIndex={-1}>ISO 45001:2018</a><a href="#" tabIndex={-1}>CIDB Registered</a></div>
      </div>
      <div className="f-base"><span>&copy; 2026 IAQ Group (690214-V)</span><span>{note}</span></div>
      <div className="bm-footrib-strip">
        <div className="bm-footrib" role="img" aria-label="Demo by BrandMethod.co">
          <canvas ref={cvRef} width="460" height="110" aria-hidden="true" />
          <span ref={fbRef} className="bm-footrib-fb" hidden>Demo · BrandMethod.co</span>
        </div>
      </div>
    </footer>
  )
}
