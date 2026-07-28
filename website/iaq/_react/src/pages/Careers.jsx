import React, { useEffect } from 'react'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import initCareers from '../scenes/careers.js'
import '../styles/careers.css'

export default function Careers() {
  useEffect(() => {
    document.title = 'IAQ Group · Career Page Concept · Brand Method'
    return initCareers()
  }, [])
  return (
    <>
      <Nav />

      <div className="headband"><div className="hb" aria-hidden="true"><img src="/assets/photo-awards.webp" alt="" /></div><header className="head wrap">
        <span className="eyebrow">Careers</span>
        <h1>Build the buildings <em>the future needs.</em></h1>
        <p className="lede">Live openings, filterable by location and department, searchable by role. Built from the 16 openings published on iaqtechnology.com.my today; the same engine scales to every office as IAQ grows internationally.</p>
        <div className="head-stats">
          <div className="hchip"><b id="totRoles">16</b><span>Open roles</span></div>
          <div className="hchip"><b>2</b><span>Hiring locations</span></div>
          <div className="hchip"><b>4</b><span>Departments</span></div>
          <div className="hchip"><b>8</b><span>Countries, engine-ready</span></div>
        </div>
      </header></div>

      <div className="console"><div className="wrap">
        <div className="row">
          <span className="flabel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 11-8 11s-8-5-8-11a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="2.6" /></svg>Location</span>
          <div className="chips" id="fLoc"></div>
        </div>
        <div className="row">
          <span className="flabel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>Department</span>
          <div className="chips" id="fDept"></div>
        </div>
        <div className="row">
          <span className="flabel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>Search</span>
          <label className="search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg><input id="q" type="search" placeholder="Role, keyword, e.g. mechanical" aria-label="Search roles" /></label>
          <button className="clearbtn" id="clear" type="button">Reset</button>
          <span className="readout" id="readout" role="status" aria-live="polite"></span>
        </div>
      </div></div>

      <main className="wrap">
        <div className="joblist" id="joblist"></div>
        <div className="empty" id="empty">
          <h3>No roles match that combination</h3>
          <p>Loosen a filter or clear the search. New roles appear here the moment HR publishes them.</p>
        </div>
        <p className="note">Prototype uses the 16 openings live on iaqtechnology.com.my &middot; applications route to IAQ HR &middot; syncs with the final job list on supply</p>
      </main>

      <section className="close3d dark-band" id="contact">
        <div className="close-in wrap split">
          <div>
            <span className="eyebrow" style={{ color: 'var(--blue)' }}><span data-scramble>START A PROJECT</span></span>
            <h2 style={{ marginTop: '14px', maxWidth: '18ch' }}>Tell us what you are building</h2>
            <p className="lede" style={{ marginTop: '16px' }}>From feasibility to handover, one accountable team. Response within one working day.</p>
          </div>
          <div style={{ display: 'grid', gap: '10px' }}>
            <a className="fpc" style={{ '--panel': 'rgba(15,23,40,.82)' }} href="mailto:info@iaqtechnology.com.my"><span className="ref">Email</span><h3 style={{ fontSize: '17px' }}>info@iaqtechnology.com.my</h3></a>
            <a className="fpc" style={{ '--panel': 'rgba(15,23,40,.82)' }} href="tel:+60351248319"><span className="ref">Phone</span><h3 style={{ fontSize: '17px' }}>+603 5124 8319</h3></a>
            <div className="fpc" style={{ '--panel': 'rgba(15,23,40,.82)', cursor: 'default' }}><span className="ref">HQ &middot; Shah Alam</span><h3 style={{ fontSize: '15px', lineHeight: '1.45', fontWeight: 500 }}>No.12, Jalan Sungai Jeluh 32/192, Kawasan Perindustrian Kemuning, Seksyen 32, 40460 Shah Alam, Selangor</h3></div>
          </div>
        </div>
        <div className="close-viz" aria-hidden="true"><canvas id="closeCv"></canvas><div className="close-scrim"></div></div>
        <Footer note="Career page concept · Brand Method" />
      </section>
    </>
  )
}
