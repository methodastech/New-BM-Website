import React, { useEffect } from 'react'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import initAbout from '../scenes/about.js'
import '../styles/about.css'

export default function About() {
  useEffect(() => {
    document.title = 'IAQ Group \u00b7 About Us Concept \u00b7 Brand Method'
    return initAbout()
  }, [])
  return (
    <>
      <Nav />

<header className="ab-hero" id="top">
  <div className="plx-back" data-speed="0.22">
    <div className="ph-slot dark"><img className="hero-img" src="/assets/about-hero-dusk.webp" alt="" /></div>
    <div className="ab-video" aria-hidden="true"><video id="abVid" muted loop playsInline autoPlay preload="metadata" poster="/assets/hero-campus-dusk.webp"><source src="/assets/hero-campus-dusk.mp4" type="video/mp4" /></video></div>
    <div className="ab-scrim" aria-hidden="true"></div>
    <canvas className="ab-part" id="abPart" aria-hidden="true"></canvas>
  </div>
  <div className="ab-cap" aria-hidden="true"><i></i>The facility reel · 32 years on site</div>
  <div className="plx-mid" data-speed="0.45" aria-hidden="true"><span>1994</span></div>
  <div className="head wrap">
    <span className="eyebrow">About IAQ · est. 1994</span>
    <h1 id="heroH">From cleanroom specialist to <em>total facility solutions.</em></h1>
    <p className="lede">Thirty-two years of engineering the environments where semiconductors, EV batteries, data and life sciences are made. One team, accountable from design to maintenance, now building across eight countries.</p>
    <div className="head-stats">
      <div className="hchip"><svg className="hic" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="1.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/></svg><b>1994</b><span>Founded, Malaysia</span></div>
      <div className="hchip"><svg className="hic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.3 3.8 5.2 3.8 8.5S14.5 18.2 12 20.5c-2.5-2.3-3.8-5.2-3.8-8.5S9.5 5.8 12 3.5z"/></svg><b data-count="8">0</b><span>Countries</span></div>
      <div className="hchip"><svg className="hic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="8.5" cy="8" r="3.2"/><circle cx="16.5" cy="9.5" r="2.6"/><path d="M2.8 19.5c1.1-3.2 3.2-4.9 5.7-4.9s4.6 1.7 5.7 4.9M14 15c2.1.3 3.8 1.8 4.8 4.3"/></svg><b data-count="450">0</b><span>People</span></div>
      <div className="hchip"><svg className="hic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2l8 4.3-8 4.3-8-4.3z"/><path d="M4 12l8 4.3 8-4.3M4 16.4l8 4.3 8-4.3"/></svg><b><span data-count="250">0</span>+</b><span>Projects delivered</span></div>
    </div>
  </div>
  <div className="spec-tick" aria-hidden="true"><div className="st-track"><span>Total facility solutions<i></i>Est. 1994<i></i>ISO 5 cleanrooms<i></i>8 countries<i></i>1,050,000 m&#178; built<i></i>450 people<i></i>EPCC / EPCM<i></i>Kulim wafer fab RM900m<i></i>ISO 9001 / 14001 / 45001<i></i>CIDB G7<i></i></span></div><div className="st-track"><span>Total facility solutions<i></i>Est. 1994<i></i>ISO 5 cleanrooms<i></i>8 countries<i></i>1,050,000 m&#178; built<i></i>450 people<i></i>EPCC / EPCM<i></i>Kulim wafer fab RM900m<i></i>ISO 9001 / 14001 / 45001<i></i>CIDB G7<i></i></span></div></div>
</header>

<section className="manifesto" id="story">
  <div className="man-video" aria-hidden="true">
    <video id="manVid" muted loop playsInline autoPlay preload="metadata" poster="/assets/about-story-broll.webp">
      <source src="/assets/about-story-build.mp4" type="video/mp4" />
    </video>
  </div>
  <div className="man-scrim" aria-hidden="true"></div>
  <div className="man-cap" aria-hidden="true"><i></i>The build · concept film</div>
  <div className="wrap">
    <span className="eyebrow" style={{color:'#FF8A90'}}>The story</span>
    <p className="mline" data-mline>IAQ began in 1994 with the air itself: indoor air quality, in a country building its high-tech future.</p>
    <p className="mline" data-mline>Three decades on, we design, procure, build, commission and maintain <em>the cleanest environments on earth.</em></p>
    <p className="mline" data-mline>Globally a cleanroom specialist. Regionally, the total solutions partner behind Malaysia's most demanding facilities.</p>
    <p className="mnote">"IAQ's humble journey begins out of a small office, armed with little more than a blueprint and unrelenting spirit." Locally founded and still locally owned, the group has grown from that office into a builder of hi-tech facilities across eight countries, with the same promise it started with: everybody goes home safe, and the room performs to specification.</p>
  </div>
</section>

<section className="tl" id="timeline">
  <div className="tl-head wrap">
    <span className="eyebrow">Three decades</span>
    <h2>The road from one discipline <em>to every discipline.</em></h2>
    <p className="lede">Drag through three decades: a small office in 1994 to listing-grade today.</p>
  </div>
  <div className="tl-nav" aria-hidden="false">
    <button id="tlPrev" type="button" aria-label="Previous milestone"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button>
    <button id="tlNext" type="button" aria-label="Next milestone"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7"/></svg></button>
  </div>
  <div className="tl-stage" id="tlStage">
    <span className="tl-yearbig" id="tlYearBig" aria-hidden="true">1994</span>
    <div className="tl-rail" aria-hidden="true"></div>
    <div className="tl-fill" id="tlFill" aria-hidden="true"></div>
    <div className="tl-track" id="tlTrack">
      <article className="tl-card">
        <div className="tl-img"><img src="/assets/about-1994-workshop.webp" alt="" loading="lazy" /><span className="im-chip">Interim · current site</span></div>
        <div className="tl-body"><span className="tl-year">1994</span><h3>Founded on air</h3><p>Ir. Tiew Soon Aik establishes IAQ in Malaysia as a cleanroom specialist: a small office, a blueprint and an unrelenting spirit.</p></div>
      </article>
      <article className="tl-card">
        <div className="tl-img"><img src="/assets/tl-2000-china.webp" alt="" loading="lazy" /><span className="im-chip">Interim · AI concept</span></div>
        <div className="tl-body"><span className="tl-year">2000</span><h3>First build abroad</h3><p>25,000 m² of cleanroom, M&amp;E and utilities delivered in China for the dot-com boom's chipmakers: the first project beyond Malaysia, with more across China to follow.</p></div>
      </article>
      <article className="tl-card">
        <div className="tl-img"><img src="/assets/tl-2007-europe.webp" alt="" loading="lazy" /><span className="im-chip">Interim · AI concept</span></div>
        <div className="tl-body"><span className="tl-year">2007</span><h3>Into Europe</h3><p>A branch office opens in Poland for engineering, procurement, construction and commissioning; a project in France follows on a client's recommendation.</p></div>
      </article>
      <article className="tl-card">
        <div className="tl-img"><img src="/assets/photo-cleanroom.webp" alt="" loading="lazy" /><span className="im-chip">Interim · concept asset</span></div>
        <div className="tl-body"><span className="tl-year">2009</span><h3>Class 1, delivered</h3><p>A 14,000 m² Class 1 cleanroom is built in Ipoh, among the cleanest rooms in the region, as the group extends its reach to Morocco.</p></div>
      </article>
      <article className="tl-card">
        <div className="tl-img"><img src="/assets/about-2013-energy.webp" alt="" loading="lazy" /><span className="im-chip">Interim · current site</span></div>
        <div className="tl-body"><span className="tl-year">2013</span><h3>The energy pivot</h3><p>Main contractor for Malaysia's largest district cooling plant: an RM310 million system serving 56,000 parties, delivered with zero lost-time injury and a 25-year maintenance mandate.</p></div>
      </article>
      <article className="tl-card">
        <div className="tl-img"><img src="/assets/about-2015-robotics.webp" alt="" loading="lazy" /><span className="im-chip">Interim · current site</span></div>
        <div className="tl-body"><span className="tl-year">2015</span><h3>Semiconductor scale</h3><p>An RM122 million, 43,000 m² backend facility marks a new order of scale; Class 100 cleanroom works for the national wafer-fab initiative follow a year later.</p></div>
      </article>
      <article className="tl-card">
        <div className="tl-img"><img src="/assets/tl-2020-dryroom.webp" alt="" loading="lazy" /><span className="im-chip">Interim · AI concept</span></div>
        <div className="tl-body"><span className="tl-year">2020</span><h3>The EV era</h3><p>Dry rooms and architectural works for a Swedish gigafactory carry IAQ into EV batteries; an RM215 million green-certified plant lands ahead of schedule through the pandemic.</p></div>
      </article>
      <article className="tl-card">
        <div className="tl-img"><img src="/assets/hero-campus.webp" alt="" loading="lazy" /><span className="im-chip">Interim · concept asset</span></div>
        <div className="tl-body"><span className="tl-year">2022</span><h3>Mega projects</h3><p>An RM900 million wafer-fab expansion in Kulim, entry into data centres, and a full design-and-build fab expansion in Kuching the following year.</p></div>
      </article>
      <article className="tl-card">
        <div className="tl-img"><img src="/assets/tl-2025-global.webp" alt="" loading="lazy" /><span className="im-chip">Interim · AI concept</span></div>
        <div className="tl-body"><span className="tl-year">2025</span><h3>Going global</h3><p>A second Malaysian base opens in Penang; IAQ Engineering (DE) GmbH opens in Dresden, joining offices in Singapore, France and India.</p></div>
      </article>
      <article className="tl-card">
        <div className="tl-img"><img src="/assets/photo-team.webp" alt="" loading="lazy" /><span className="im-chip">Interim · concept asset</span></div>
        <div className="tl-body"><span className="tl-year">Today</span><h3>Listing-grade</h3><p>Eight countries, 450 people, more than 250 projects and over a million square metres of cleanroom built-up, and a group preparing for its public listing.</p></div>
      </article>
    </div>
  </div>
  <div className="tl-hint">Drag or arrow through · 1994 → today</div>
</section>

<section className="vm" id="vision">
  <div className="wrap">
    <span className="eyebrow">Vision &amp; mission</span>
    <div className="vm-grid">
      <div className="vm-card" id="vmVision" tabIndex={0}>
        <span className="vm-hint">Hover · explore</span>
        <div className="vm-3d"><canvas id="glbCv"></canvas><span className="vm-tag">The world · live 3D</span></div>
        <span className="vm-k">Vision</span>
        <blockquote data-decode>To be a regional facility solutions provider with engineering excellence, facilitating technological innovation and advancement in quality of life.</blockquote>
        <div className="vm-more">
          <p>The globe carries the record: red markers on every country IAQ has built or opened in. Regional leadership means the home market first, Malaysia and Southeast Asia, with Europe and India as the growth arc and engineering excellence as the entry ticket.</p>
          <div className="vm-facts"><em>8 countries</em><em>3 continents</em><em>Since 1994</em></div>
        </div>
      </div>
      <div className="vm-card" id="vmMission" tabIndex={0}>
        <span className="vm-hint">Hover · explore</span>
        <div className="vm-3d"><canvas id="misCv"></canvas><span className="vm-tag">The countries · live 3D</span></div>
        <span className="vm-k">Mission</span>
        <blockquote data-decode>Providing innovative and sustainable facility and engineering solutions benefitting our clients and stakeholders, driven by our leadership, employees and partners globally.</blockquote>
        <div className="vm-more">
          <p>The mission is built one facility at a time: innovative and sustainable in the same breath, energy-efficient builds with ISO-managed impact, outcomes measured for clients and stakeholders, delivered by leadership, employees and partners working as one team.</p>
          <div className="vm-facts"><em>250+ projects</em><em>1.05M m² cleanroom</em><em>ISO ×3</em></div>
        </div>
      </div>
    </div>
  </div>
</section>

<section className="values" id="values">
  <div className="wrap">
    <span className="eyebrow">What we hold</span>
    <h2>Six values, <em>held on every site.</em></h2>
    <div className="vgrid" id="vGrid">
      <svg className="vlines" id="vLines" aria-hidden="true"></svg>
      <div className="vcol vcol-l">
        <div className="vtile vt-l" data-reveal data-vi="0"><span className="vnum">V·01</span><span className="vico"><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 5 6v5c0 4.3 2.9 7.7 7 9 4.1-1.3 7-4.7 7-9V6z"/><path d="M9.2 12l2 2 3.6-4"/></svg></span><div className="vtx"><h3>Safety commitment</h3><p>An injury-free workplace where everybody goes home safe, on every site, every day.</p></div></div>
        <div className="vtile vt-l" data-reveal data-vi="1"><span className="vnum">V·02</span><span className="vico"><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.2 2"/></svg></span><div className="vtx"><h3>Quality consistency</h3><p>Proactive quality management through established systems and digitalised tracking.</p></div></div>
        <div className="vtile vt-l" data-reveal data-vi="2"><span className="vnum">V·03</span><span className="vico"><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L4.8 9.3l5-.7z"/></svg></span><div className="vtx"><h3>Honesty &amp; integrity</h3><p>Transparent communication of accurate information, encouraging openness and sincerity.</p></div></div>
      </div>
      <div className="vcore" id="vCore" aria-hidden="true">
        <canvas id="valCv"></canvas>
        <span className="vc-cur" id="vcCur"></span>
        <span className="vc-lab">Live 3D · hover a value</span>
      </div>
      <div className="vcol vcol-r">
        <div className="vtile vt-r" data-reveal data-vi="3"><span className="vnum">V·04</span><span className="vico"><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4.5a4.8 4.8 0 0 0-6.6 6L4 14.4V20h5.6l3.9-3.9a4.8 4.8 0 0 0 6-6.6L16 13l-2.5-2.5z"/></svg></span><div className="vtx"><h3>Engineering capabilities</h3><p>A multi-disciplinary in-house team carrying more than two decades of excellence.</p></div></div>
        <div className="vtile vt-r" data-reveal data-vi="4"><span className="vnum">V·05</span><span className="vico"><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M13 3 5 13.5h5L9 21l8-10.5h-5z"/></svg></span><div className="vtx"><h3>Efficiency &amp; proficiency</h3><p>Fast-track execution with innovative solutions, without trading away the standard.</p></div></div>
        <div className="vtile vt-r" data-reveal data-vi="5"><span className="vnum">V·06</span><span className="vico"><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0z"/><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4"/></svg></span><div className="vtx"><h3>Pursuit of excellence</h3><p>The highest degree of engineering excellence, held to ethical standards throughout.</p></div></div>
      </div>
    </div>
  </div>
</section>

<section className="safety" id="safety">
  <div className="wrap">
    <span className="eyebrow">Safety &amp; ESH</span>
    <h2>Everybody <em>goes home safe.</em></h2>
    <p className="creed" data-reveal>"We firmly believe that all incidents are preventable, and that there is no task so important that it is worth endangering the health and wellbeing of our employees and partners."</p>
    <div className="sfgrid">
      <div className="sftile" data-reveal><b><span data-count="2600000">0</span></b><span>Safe manhours · flagship wafer-fab expansion, Kuching</span></div>
      <div className="sftile" data-reveal><b>Zero <i>LTI</i></b><span>Malaysia's largest district cooling build</span></div>
      <div className="sftile" data-reveal><b>Gold</b><span>OSH Management · 20th OSH Excellence Awards 2024</span></div>
      <div className="sftile" data-reveal><b>ISO <i>45001</i></b><span>Occupational health &amp; safety, certified</span></div>
    </div>
    <div className="esg">
      <div className="ecard" data-reveal><canvas className="esg-cv" id="esgEnvCv" aria-hidden="true"></canvas><span className="ek">Environmental</span><h3>Build clean, run lean</h3><p>ISO 14001-managed impact: waste minimisation, resource conservation and energy-efficient, eco-friendly engineering on every site.</p></div>
      <div className="ecard" data-reveal><canvas className="esg-cv" id="esgSocCv" aria-hidden="true"></canvas><span className="ek">Social</span><h3>People and community</h3><p>Employee wellbeing, safe communities, a diverse and inclusive workplace, ethical labour practice, and community programmes at home in Malaysia.</p></div>
      <div className="ecard" data-reveal><canvas className="esg-cv" id="esgGovCv" aria-hidden="true"></canvas><span className="ek">Governance</span><h3>Run like a listed firm</h3><p>Transparency, accountability and compliance standards, held to the bar regulators and investors expect of a public company.</p></div>
    </div>
    <div className="awardrow" data-reveal>
      <img className="award-img" src="/assets/badge-highwire-gold-2024.webp" alt="Highwire Safety Gold 2024" />
      <img className="award-img" src="/assets/badge-iso.webp" alt="ISO certified" />
      <img className="award-img" src="/assets/badge-ukas.webp" alt="UKAS accredited" />
      <img className="award-img" src="/assets/badge-cidb.webp" alt="CIDB registered contractor" />
      <em>ISO 9001:2015</em><em>ISO 14001:2015</em><em>ISO 45001:2018</em><em>Gold · OSH 2024</em>
      <span className="ph-pill">List · full ESH awards, attachment from IAQ pending</span>
    </div>
  </div>
</section>

<section className="model" id="model">
  <span className="wm-ghost" aria-hidden="true">DELIVERED</span>
  <div className="field" aria-hidden="true"><span className="bar"></span><span className="bar"></span><span className="bar"></span><span className="bar"></span><span className="bar"></span></div>
  <div className="wrap">
    <span className="eyebrow">The business model</span>
    <h2>Three pillars, <em>one accountable group.</em></h2>
    <div className="mcards">
      <div className="mcard" data-reveal><span className="nn">01</span><canvas className="mcCv" id="mcEpcCv" aria-hidden="true"></canvas><h3>EPC</h3><p>Engineering, procurement and construction of hi-tech facilities, delivered end to end by one team from concept to handover.</p></div>
      <div className="mcard" data-reveal><span className="nn">02</span><canvas className="mcCv" id="mcUtilCv" aria-hidden="true"></canvas><h3>Process critical utilities &amp; total tool installation</h3><p>The systems production lives on: process utilities, hook-up and tool installation, built and commissioned to specification.</p></div>
      <div className="mcard" data-reveal><span className="nn">03</span><canvas className="mcCv" id="mcEnergyCv" aria-hidden="true"></canvas><h3>Energy management</h3><p>Sustainable performance after handover: district cooling, energy efficiency and the long-term health of the facility.</p></div>
    </div>
    <div className="pipe" id="pipe" aria-label="What delivered means: the five step spine, design to maintain">
      <div className="pipe-head"><span className="pk">What DELIVERED means · the five-step spine</span><span className="pv" id="pipePct" aria-hidden="true">0%</span></div>
      <div className="pipe-track" aria-hidden="true">
        <svg className="pipe-svg" viewBox="0 0 1000 44" preserveAspectRatio="none">
          <defs><linearGradient id="ppGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#E8730C"/><stop offset=".28" stopColor="#2E6FE8"/>
            <stop offset=".55" stopColor="#EC2027"/><stop offset=".78" stopColor="#1FB9A6"/>
            <stop offset="1" stopColor="#1FA463"/></linearGradient></defs>
          <line className="pp-base" x1="10" y1="22" x2="990" y2="22"/>
          <line className="pp-fill" id="ppFill" x1="10" y1="22" x2="990" y2="22"/>
          <line className="pp-flow" x1="10" y1="22" x2="990" y2="22"/>
          <circle className="pp-packet" id="ppPacket" cx="10" cy="22" r="4.5"/>
        </svg>
        <span className="pp-node" style={{'--x':'10%','--sc':'#E8730C','--scT':'rgba(232,115,12,.4)'}}>01</span>
        <span className="pp-node" style={{'--x':'30%','--sc':'#2E6FE8','--scT':'rgba(46,111,232,.4)'}}>02</span>
        <span className="pp-node" style={{'--x':'50%','--sc':'#EC2027','--scT':'rgba(236,32,39,.4)'}}>03</span>
        <span className="pp-node" style={{'--x':'70%','--sc':'#1FB9A6','--scT':'rgba(31,185,166,.4)'}}>04</span>
        <span className="pp-node" style={{'--x':'90%','--sc':'#1FA463','--scT':'rgba(31,164,99,.4)'}}>05</span>
      </div>
      <div className="pstations">
        <div className="pst" style={{'--sc':'#E8730C','--scT':'rgba(232,115,12,.12)'}}><span className="pn">01 · DESIGN</span><h4>Engineered on paper first</h4><canvas className="pdCv" data-step="1" aria-hidden="true"></canvas>
          <ul><li>Concept to detailed CSA + MEP design</li><li>Feasibility and value engineering</li><li>Authority submissions signed off</li></ul></div>
        <div className="pst" style={{'--sc':'#2E6FE8','--scT':'rgba(46,111,232,.12)'}}><span className="pn">02 · PROCURE</span><h4>The right kit, on time</h4><canvas className="pdCv" data-step="2" aria-hidden="true"></canvas>
          <ul><li>Vendors qualified, tenders run</li><li>Long-lead equipment tracked</li><li>Quality and budget locked</li></ul></div>
        <div className="pst" style={{'--sc':'#EC2027','--scT':'rgba(236,32,39,.12)'}}><span className="pn">03 · BUILD</span><h4>One team on site</h4><canvas className="pdCv" data-step="3" aria-hidden="true"></canvas>
          <ul><li>EPCC / EPCM delivery models</li><li>Every trade coordinated</li><li>Schedule and cost held</li></ul></div>
        <div className="pst" style={{'--sc':'#1FB9A6','--scT':'rgba(31,185,166,.12)'}}><span className="pn">04 · COMMISSION</span><h4>Proven, not promised</h4><canvas className="pdCv" data-step="4" aria-hidden="true"></canvas>
          <ul><li>ISO class proven by test</li><li>Systems tuned to specification</li><li>Certified handover dossier</li></ul></div>
        <div className="pst" style={{'--sc':'#1FA463','--scT':'rgba(31,164,99,.12)'}}><span className="pn">05 · MAINTAIN</span><h4>Performing for life</h4><canvas className="pdCv" data-step="5" aria-hidden="true"></canvas>
          <ul><li>Planned preventive programmes</li><li>Rapid breakdown response</li><li>Compliance across the lifecycle</li></ul></div>
      </div>
    </div>
  </div>
</section>

<section className="fp" id="footprint">
  <span className="wm-ghost" aria-hidden="true">WORLDWIDE</span>
  <div className="wrap">
    <span className="eyebrow">Where we are</span>
    <h2>Rooted in Malaysia, <em>building across eight countries.</em></h2>
    <div className="fp-map" data-reveal>
      <div className="fp-globe" id="fpGlobe" role="img" aria-label="Live 3D globe: red pins on the six IAQ offices (Shah Alam HQ, Penang, Singapore, Dresden, France, India) and pale pins on delivered-in countries (China, Sweden, Poland, Morocco). Drag to spin.">
        <canvas id="fpCv"></canvas>
        <span className="fp-cap" aria-hidden="true"><i className="dot of"></i>Offices<i className="dot dl"></i>Delivered in<em>Live 3D · drag to spin</em></span>
        <div className="ph-slot dark fp-fallback">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></svg>
          <span className="ph-k">World footprint</span>
          <span className="ph-d">Offices: Shah Alam HQ, Penang, Singapore, Dresden, France, India. Delivered in China, Sweden, Poland and Morocco.</span>
        </div>
      </div>
    </div>
    <div className="fp-grid">
      <div className="fp-card" data-reveal><span className="fk">Headquarters</span><h3>Shah Alam, Malaysia</h3><p>12, Jalan Sungai Jeluh 32/192, Kawasan Perindustrian Kemuning, Seksyen 32, 40460 Shah Alam, Selangor.</p></div>
      <div className="fp-card" data-reveal><span className="fk">Branch · 2025</span><h3>Penang, Malaysia</h3><p>9, Lorong Valdor Jaya 2, Kawasan Perindustrian Valdor, 14200 Jawi, Penang.</p></div>
      <div className="fp-card" data-reveal><span className="fk">Europe</span><h3>Dresden, Germany</h3><p>IAQ Engineering (DE) GmbH, 8.OG, Budapester Strasse 5, 01069 Dresden.</p></div>
    </div>
    <div className="fp-chips" data-reveal>
      <span className="lbl">Offices</span><em>Singapore</em><em>France</em><em>India</em>
      <span className="lbl" style={{marginLeft:'10px'}}>Delivered in</span><em>China</em><em>Sweden</em><em>Poland</em><em>Morocco</em>
    </div>
  </div>
</section>

<section className="lead" id="leadership">
  <div className="wrap">
    <span className="eyebrow">Leadership</span>
    <h2>The people <em>accountable.</em></h2>
    <p className="lnote">Structure shown for layout: the final line-up, names, titles and portraits are to be confirmed by IAQ before publication.</p>
    <div className="lgrid">
      <div className="lcard" data-reveal><div className="ph-slot ld-slot"><canvas className="ldCv" data-role="founder"></canvas><span className="ph-k">Portrait · founder</span></div><div className="lb"><b>Ir. Tiew Soon Aik</b><span>Founder</span></div></div>
      <div className="lcard" data-reveal><div className="ph-slot ld-slot"><canvas className="ldCv" data-role="ceo"></canvas><span className="ph-k">Portrait · CEO</span></div><div className="lb"><b>Name TBC</b><span>Chief Executive Officer</span></div></div>
      <div className="lcard" data-reveal><div className="ph-slot ld-slot"><canvas className="ldCv" data-role="board"></canvas><span className="ph-k">Portraits · board</span></div><div className="lb"><b>Board of Directors</b><span>Line-up TBC</span></div></div>
      <div className="lcard" data-reveal><div className="ph-slot ld-slot"><canvas className="ldCv" data-role="csuite"></canvas><span className="ph-k">Portraits · c-suite</span></div><div className="lb"><b>C-suite &amp; Management</b><span>Line-up TBC</span></div></div>
    </div>
  </div>
</section>

<section className="scale" id="scale">
  <div className="wrap">
    <span className="eyebrow">The proof</span>
    <h2>The numbers behind <em>the confidence.</em></h2>
    <div className="sgrid">
      <div className="stile" data-reveal><svg className="sic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 13V8.4M12 13l3.4 2M12 2.5h0M9.5 2.5h5"/></svg><b data-count="32">0</b><span>Years of technical excellence</span></div>
      <div className="stile" data-reveal><svg className="sic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.4 4 5.5 4 9s-1.4 6.6-4 9c-2.6-2.4-4-5.5-4-9s1.4-6.6 4-9z"/></svg><b data-count="8">0</b><span>Countries of operation</span></div>
      <div className="stile" data-reveal><svg className="sic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="8.5" cy="8" r="3.4"/><circle cx="16.5" cy="9.5" r="2.7"/><path d="M2.5 20c1.2-3.4 3.4-5.2 6-5.2s4.8 1.8 6 5.2M13.8 15.5c2.2.3 4 1.9 5 4.5"/></svg><b data-count="450">0</b><span>People, group-wide</span></div>
      <div className="stile" data-reveal><svg className="sic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l8 4.5-8 4.5-8-4.5z"/><path d="M4 12l8 4.5 8-4.5M4 16.5L12 21l8-4.5"/></svg><b><span data-count="250">0</span><i>+</i></b><span>Projects delivered</span></div>
      <div className="stile" data-reveal><svg className="sic" viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 3.5h17v17h-17z"/><path d="M3.5 10h17M3.5 16.5h17M10 3.5v17M16.5 3.5v17"/></svg><b><span data-count="1050000">0</span></b><span>m² cleanroom built-up</span></div>
      <div className="stile" data-reveal><svg className="sic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 12h7M9 16h5"/><circle cx="9.5" cy="8" r="1.3"/></svg><b>RM<span data-count="900">0</span><i>m</i></b><span>Largest single contract · Kulim wafer fab</span></div>
    </div>
    <div className="scert" data-reveal>
      <em>ISO 9001:2015</em><em>ISO 14001:2015</em><em>ISO 45001:2018</em><em>CIDB G7</em>
    </div>
    <div className="sfilm" data-reveal>
      <div className="film-ph" id="filmPh" role="button" tabIndex={0} aria-label="Play the corporate film (not available in this concept demo)">
        <canvas className="film-bg" id="filmBgCv" aria-hidden="true"></canvas>
        <div className="fp-face">
          <span className="fp-play"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg></span>
          <span className="fp-k">Video · corporate film</span>
          <span className="fp-d">Drone over the facilities, cleanroom interiors, the team at work. 30-second muted loop from the production shoot.</span>
        </div>
        <div className="fp-denied" aria-hidden="true"><b>Not available in this concept demo</b><span>The film ships with the production video shoot.</span></div>
      </div>
    </div>
  </div>
</section>

<section className="close3d dark-band" id="contact">
  <div className="close-seam" aria-hidden="true"></div>
<div className="close-in wrap split">
    <div>
      <span className="eyebrow" style={{color:'var(--blue)'}}><span data-scramble>START A PROJECT</span></span>
      <h2 style={{marginTop:'14px',maxWidth:'18ch'}}>Tell us what you are building</h2>
      <p className="lede" style={{marginTop:'16px'}}>From feasibility to handover, one accountable team. Response within one working day.</p>
    </div>
    <div style={{display:'grid',gap:'10px'}}>
      <a className="fpc" style={{'--panel':'rgba(15,23,40,.82)'}} href="mailto:info@iaqtechnology.com.my"><span className="ref">Email</span><h3 style={{fontSize:'17px'}}>info@iaqtechnology.com.my</h3></a>
      <a className="fpc" style={{'--panel':'rgba(15,23,40,.82)'}} href="tel:+60351248319"><span className="ref">Phone</span><h3 style={{fontSize:'17px'}}>+603 5124 8319</h3></a>
      <div className="fpc" style={{'--panel':'rgba(15,23,40,.82)',cursor:'default'}}><span className="ref">HQ · Shah Alam</span><h3 style={{fontSize:'15px',lineHeight:'1.45',fontWeight:'500'}}>No.12, Jalan Sungai Jeluh 32/192, Kawasan Perindustrian Kemuning, Seksyen 32, 40460 Shah Alam, Selangor</h3></div>
    </div>
  </div>
  <div className="close-viz" aria-hidden="true"><canvas id="closeCv"></canvas><div className="close-scrim"></div></div>
  <Footer note={'About page concept \u00b7 Brand Method'} />
</section>
    </>
  )
}
