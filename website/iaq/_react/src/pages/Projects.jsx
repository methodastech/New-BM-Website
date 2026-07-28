import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import initProjectsPage from '../scenes/projects.js'
import '../styles/projects.css'

export default function Projects() {
  const navigate = useNavigate()
  useEffect(() => {
    document.title = 'IAQ Group · Project Registry Concept · Brand Method'
    return initProjectsPage({ navigate })
  }, [])
  return (
    <>
      <Nav />

      <div className="headband"><div className="hb" aria-hidden="true"><img src="/assets/projects/bosch.webp" alt="" /></div><header className="head wrap">
        <span className="eyebrow">Project registry</span>
        <h1>230+ projects. <em>Findable in seconds.</em></h1>
        <p className="lede">Every project carries structured tags: industry, location, delivery model and cleanroom class. One registry powers filtering, search, related projects and SEO. This working sample holds 18 published projects; the full registry migrates at launch.</p>
      </header></div>

      <div className="console" id="console"><div className="wrap">
        <div className="row">
          <label className="search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg><input id="q" type="search" placeholder="Search project, client, location" aria-label="Search projects" /></label>
          <button className="fbtn" id="fbtn" type="button" aria-expanded="false" aria-controls="fpanel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5h18l-7 8.5V19l-4 2v-7.5z" /></svg>Filter<span className="fcount" id="fcount" hidden>0</span><svg className="fcar" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg></button>
          <button className="clearbtn" id="clear" type="button">Reset</button>
          <span className="readout" id="readout" role="status" aria-live="polite"></span>
        </div>
        <div className="fpanel" id="fpanel">
          <div className="row">
            <span className="flabel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21V9l6 4V9l6 4V5l6-2v18z" /></svg>Industry</span>
            <div className="chips" id="fIndustry"></div>
          </div>
          <div className="row">
            <span className="flabel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 11-8 11s-8-5-8-11a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="2.6" /></svg>Location</span>
            <div className="chips" id="fRegion"></div>
          </div>
          <div className="row">
            <span className="flabel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l9 5-9 5-9-5z" /><path d="M3 13l9 5 9-5" /></svg>Tag</span>
            <div className="chips" id="fType"></div>
          </div>
          <div className="row">
            <div className="sortseg" id="sortSeg" role="group" aria-label="Sort projects">
              <span className="ss-lab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M11 5h10M11 9h7M11 13h4M3 17h18" /><path d="M5.5 5v9M3 11.5L5.5 14 8 11.5" /></svg>Sort</span>
              <button type="button" className="ss on" data-v="default">Featured</button>
              <button type="button" className="ss" data-v="az">A&ndash;Z</button>
              <button type="button" className="ss" data-v="size">Largest</button>
              <button type="button" className="ss" data-v="industry">Industry</button>
            </div>
          </div>
        </div>
      </div></div>

      <main className="wrap">
        <div className="reg" id="reg"></div>
        <div className="empty" id="empty">
          <h3>No projects match that combination</h3>
          <p>Loosen a filter or clear the search. On the production site this state suggests the nearest matches.</p>
        </div>
        <p className="note">Sample registry compiled from iaqtechnology.com.my &middot; photography from IAQ project records &middot; full 230+ registry migrates with the new site</p>
      </main>

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
