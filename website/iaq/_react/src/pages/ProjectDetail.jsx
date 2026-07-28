import React, { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import initProjectPage from '../scenes/project.js'
import { PROJECTS, INDLBL, REGLBL, TYPLBL, ICONS, CLOGOS, SCOPES, BLURB, pad3, fmtSize } from '../data/projects.js'
import '../styles/project.css'

/* registry card, identical markup to the ported registry renderer */
function RelCard({ idx }) {
  const p = PROJECTS[idx]
  return (
    <Link className="pc" to={`/projects/${idx}`}>
      {p.img ? (
        <div className="pcv photo"><div className="clip"><img src={p.img} alt={`${p.client} project`} loading="lazy" /></div><span className="ph-cap">{p.cap || 'Site photo'}</span></div>
      ) : (
        <div className="pcv"><div className="grid-bg"></div><span className="ph-ico" dangerouslySetInnerHTML={{ __html: ICONS[p.ind] || '' }} /><span className="ph-cap">{INDLBL[p.ind]} &middot; photo at production</span></div>
      )}
      <div className="pc-in">
        <div className="ref"><span>IAQ-PRJ-{pad3(idx + 1)}</span><span className="iso">{p.iso}</span></div>
        <h3>{p.name}</h3>
        <div className="cl">{CLOGOS[p.client] ? <img src={CLOGOS[p.client]} alt={p.client} loading="lazy" /> : p.client}</div>
        <div className="meta"><span>{p.loc}</span>{p.size ? <span>{p.size.toLocaleString('en-US')} m&sup2;</span> : null}</div>
        <div className="tags"><span className="tag b">{INDLBL[p.ind]}</span><span className="tag">{REGLBL[p.region]}</span><span className="tag">{TYPLBL[p.type]}</span></div>
      </div>
    </Link>
  )
}

export default function ProjectDetail() {
  const { id } = useParams()
  const v = parseInt(id, 10)
  const PIDX = v >= 0 && v < PROJECTS.length ? v : 0
  const P = PROJECTS[PIDX]

  useEffect(() => {
    document.title = 'IAQ Group · ' + P.client + ' · ' + INDLBL[P.ind] + ' · Brand Method'
  }, [PIDX])
  useEffect(() => initProjectPage(), [])

  /* related: same industry first, then nearest neighbours */
  const rel = []
  PROJECTS.forEach((p, i) => { if (i !== PIDX && p.ind === P.ind) rel.push(i) })
  for (let r2 = 1; rel.length < 3 && r2 < PROJECTS.length; r2++) {
    const cand = (PIDX + r2) % PROJECTS.length
    if (cand !== PIDX && rel.indexOf(cand) < 0) rel.push(cand)
  }
  const related = rel.slice(0, 3)
  const pv = (PIDX - 1 + PROJECTS.length) % PROJECTS.length
  const nx = (PIDX + 1) % PROJECTS.length
  const chips = [P.client, P.loc, fmtSize(P), P.iso, TYPLBL[P.type]].filter(Boolean)

  return (
    <>
      <Nav />

      <div className="prj-hero">
        {P.img ? <img id="prjHero" src={P.img} alt="" /> : null}
        <div className="prj-scrim" aria-hidden="true"></div>
        <div className="prj-head wrap">
          <span className="eyebrow" id="prjRef">IAQ-PRJ-{pad3(PIDX + 1)} &middot; {INDLBL[P.ind]}</span>
          <h1 id="prjTitle">{P.name}</h1>
          <div className="prj-chips" id="prjChips">{chips.map((c, i) => <span key={i}>{c}</span>)}</div>
        </div>
      </div>

      <main className="prj-grid wrap">
        <article className="prj-body">
          <span className="pb-k">The brief</span>
          <p className="pb-lede" id="prjBrief">For {P.client}, IAQ delivered {P.name.charAt(0).toLowerCase() + P.name.slice(1)} in {P.loc}: {BLURB[P.ind]}.</p>
          <p id="prjBrief2">Engineered, procured, built and commissioned as one accountable delivery, the facility moved from first drawing to handover under a single team, with {TYPLBL[P.type]} scope at its core and the standards of the {INDLBL[P.ind].toLowerCase()} sector holding every decision.</p>
          <span className="pb-k">Scope of work</span>
          <ul className="pb-scope" id="prjScope">{(SCOPES[P.ind] || []).map((s, i) => <li key={i}>{s}</li>)}</ul>
          {P.img ? (
            <figure className="pb-fig"><img id="prjPhoto" src={P.img} alt="" /><figcaption id="prjCap">{(P.cap || 'Site photo')} &middot; {P.client}</figcaption></figure>
          ) : null}
          <span className="pb-k">Delivered</span>
          <div className="pb-stats" id="prjStats">
            <div className="st"><b>{fmtSize(P)}</b><span>Built-up</span></div>
            <div className="st"><b>{P.iso}</b><span>Specification</span></div>
            <div className="st"><b>{TYPLBL[P.type]}</b><span>Delivery scope</span></div>
            <div className="st"><b>{REGLBL[P.region]}</b><span>Region</span></div>
          </div>
        </article>
        <aside className="prj-side">
          <div className="ps-card">
            <div className="ps-logo" id="prjLogo">{CLOGOS[P.client] ? <img src={CLOGOS[P.client]} alt={P.client} /> : <span className="txt">{P.client}</span>}</div>
            <dl id="prjFacts">
              <dt>Client</dt><dd>{P.client}</dd>
              <dt>Industry</dt><dd>{INDLBL[P.ind]}</dd>
              <dt>Location</dt><dd>{P.loc}</dd>
              <dt>Delivery</dt><dd>{TYPLBL[P.type]}</dd>
              <dt>Class</dt><dd>{P.iso}</dd>
              <dt>Size</dt><dd>{fmtSize(P)}</dd>
            </dl>
            <Link className="cta" to="/contact">Start a project</Link>
          </div>
          <Link className="ps-back" to="/projects">&larr; All projects</Link>
        </aside>
      </main>

      <section className="prj-rel"><div className="wrap">
        <span className="eyebrow">Related work</span>
        <h2 id="relTitle">More in {INDLBL[P.ind]}</h2>
        <div className="reg" id="relReg">{related.map(idx => <RelCard key={idx} idx={idx} />)}</div>
        <div className="prj-pager">
          <Link id="prevP" to={`/projects/${pv}`}><small>&larr; Previous project</small><b>{PROJECTS[pv].client} &middot; {PROJECTS[pv].name}</b></Link>
          <Link id="nextP" to={`/projects/${nx}`} className="nx"><small>Next project &rarr;</small><b>{PROJECTS[nx].client} &middot; {PROJECTS[nx].name}</b></Link>
        </div>
      </div></section>

      <section className="close3d dark-band" id="contact">
        <div className="close-in wrap split">
          <div>
            <span className="eyebrow" style={{ color: 'var(--blue)' }}><span data-scramble="">START A PROJECT</span></span>
            <h2 style={{ marginTop: '14px', maxWidth: '18ch' }}>Tell us what you are building</h2>
            <p className="lede" style={{ marginTop: '16px' }}>From feasibility to handover, one accountable team. Response within one working day.</p>
          </div>
          <div style={{ display: 'grid', gap: '10px' }}>
            <a className="fpc" style={{ '--panel': 'rgba(15,23,40,.82)' }} href="mailto:info@iaqtechnology.com.my"><span className="ref">Email</span><h3 style={{ fontSize: '17px' }}>info@iaqtechnology.com.my</h3></a>
            <a className="fpc" style={{ '--panel': 'rgba(15,23,40,.82)' }} href="tel:+60351248319"><span className="ref">Phone</span><h3 style={{ fontSize: '17px' }}>+603 5124 8319</h3></a>
            <div className="fpc" style={{ '--panel': 'rgba(15,23,40,.82)', cursor: 'default' }}><span className="ref">HQ &middot; Shah Alam</span><h3 style={{ fontSize: '15px', lineHeight: 1.45, fontWeight: 500 }}>No.12, Jalan Sungai Jeluh 32/192, Kawasan Perindustrian Kemuning, Seksyen 32, 40460 Shah Alam, Selangor</h3></div>
          </div>
        </div>
        <div className="close-viz" aria-hidden="true"><canvas id="closeCv"></canvas><div className="close-scrim"></div></div>
        <Footer note="Registry concept · Brand Method" />
      </section>
    </>
  )
}
