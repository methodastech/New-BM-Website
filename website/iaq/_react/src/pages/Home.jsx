import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import initHome from '../scenes/home.js'
import '../styles/home.css'

export default function Home() {
  useEffect(() => {
    document.title = 'IAQ Group · Homepage Concept · Brand Method'
    return initHome()
  }, [])
  return (
    <>
    <div id="loader" aria-hidden="true">
      <canvas id="loaderCv"></canvas>
      <div className="ld-ui">
        <div className="ld-logofill" id="ldLogoFill" role="img" aria-label="IAQ"></div>
        <div className="ld-row"><span className="ld-pct" id="ldPct">0%</span></div>
      </div>
    </div>
    <Nav />
    <header className="hero dark-band" id="top">
      <div className="hero-video" aria-hidden="true">
        <video className="hv" id="hv0" muted playsInline preload="auto"></video>
        <video className="hv" id="hv1" muted playsInline preload="none"></video>
      </div>
      <div className="hero-scrim" aria-hidden="true"></div>
      <canvas id="heroCanvas" aria-hidden="true"></canvas>
      <div className="hero-inner">
        <span className="eyebrow"><span data-scramble="" data-scramble-speed="22" data-scramble-stagger="26">TOTAL FACILITY SOLUTIONS · EST. 1994</span></span>
        <h1 aria-label="We build the environments where the future is made.">
          <span className="hl" aria-hidden="true"><span>We build the</span></span>
          <span className="hl" aria-hidden="true"><span>environments where</span></span>
          <span className="hl" aria-hidden="true"><span>the <em>future is made.</em></span></span>
        </h1>
        <p className="lede">Cleanrooms, dry rooms and hi-tech facilities for the companies advancing semiconductors, EV batteries, data and life sciences. Engineered, procured, built, tested and maintained by one team, for 32 years.</p>
        <div className="hero-ctas">
          <Link className="cta" to="/projects">Explore 230+ projects</Link>
          <a className="cta-ghost" href="#showpiece">See the 3D layer</a>
        </div>
      </div>
    </header>


    <section className="glance" id="story">
      <div className="glance-glow" aria-hidden="true"></div>
      <div className="glance-in wrap">
        <div className="glance-head">
          <span className="eyebrow"><span data-scramble="">IAQ AT A GLANCE</span></span>
          <h2 style={{marginTop:'14px',maxWidth:'22ch'}}>One group, measured across the globe</h2>
        </div>
        <div className="glance-body">
          <p className="lede" style={{marginTop:'14px'}}>From a Malaysian indoor air quality specialist to a total facility solutions provider operating across 8 countries. Drag the globe. The numbers are the record.</p>
          <div className="gstats">
            <div className="gstat" data-reveal=""><img className="gic" src="/assets/icons/icons_completed-projet.webp" alt="" /><div className="gtxt"><div className="num"><span data-count="230">0</span>+</div><div className="lab">Completed projects</div></div></div>
            <div className="gstat" data-reveal=""><img className="gic" src="/assets/icons/icons_cleanroom.webp" alt="" /><div className="gtxt"><div className="num"><span data-count="1050000">0</span></div><div className="lab">m&sup2; cleanroom built-up</div></div></div>
            <div className="gstat" data-reveal=""><img className="gic" src="/assets/icons/icons_employee.webp" alt="" /><div className="gtxt"><div className="num"><span data-count="450">0</span></div><div className="lab">Employees group-wide</div></div></div>
            <div className="gstat" data-reveal=""><img className="gic" src="/assets/icons/icons_globla-office.webp" alt="" /><div className="gtxt"><div className="num"><span data-count="8">0</span></div><div className="lab">Countries, global offices</div></div></div>
            <div className="gstat" data-reveal=""><img className="gic" src="/assets/icons/icons_experience.webp" alt="" /><div className="gtxt"><div className="num"><span data-count="2600000">0</span></div><div className="lab">Safe manhours</div></div></div>
            <div className="gstat" data-reveal=""><img className="gic" src="/assets/icons/icons_carbon-footprint.webp" alt="" /><div className="gtxt"><div className="num"><span data-count="20">0</span>t</div><div className="lab">Carbon reduced / yr</div></div></div>
          </div>
        </div>
        <div className="globe-col">
          <div className="globe-host" id="globeHost"><canvas id="globeCv"></canvas></div>
          <div className="globe-cap"><i></i>8 countries &middot; one standard of clean &middot; offices indicative</div>
        </div>
      </div>
    </section>

    <section className="film" id="film">
      <div className="wrap">
        <span className="eyebrow"><span data-scramble="">THE FILM</span></span>
        <h2 style={{marginTop:'14px',maxWidth:'40ch'}}>See the environments in motion</h2>
      </div>
      <div className="wrap"><div className="film-card" id="filmCard" role="button" tabIndex="0" aria-label="Play the film">
        <img src="/assets/film-poster.webp" alt="Opening ceremony of the Bosch Penang plant IAQ delivered" loading="lazy" />
        <div className="film-loop" aria-hidden="true"><iframe id="filmLoop" data-src="https://www.youtube-nocookie.com/embed/VUG1QFOCL2E?autoplay=1&amp;mute=1&amp;controls=0&amp;loop=1&amp;playlist=VUG1QFOCL2E&amp;start=12&amp;playsinline=1&amp;rel=0&amp;modestbranding=1&amp;iv_load_policy=3&amp;disablekb=1&amp;fs=0&amp;enablejsapi=1" title="" tabIndex="-1" allow="autoplay; encrypted-media" referrerPolicy="origin"></iframe></div>
        <div className="film-scrim" aria-hidden="true"></div>
        <div className="film-meta"><span className="fm-k">Bosch Penang &middot; backend site delivered</span><span className="fm-t">Watch the opening of a plant IAQ built</span></div>
        <div className="film-play" id="filmPlay" aria-hidden="true"><i></i><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg></div>
      </div></div>
      <div className="film-stage" id="filmStage" aria-hidden="true">
        <button className="film-close" id="filmClose" type="button">Close &#10005;</button>
        <div className="film-frame" id="filmFrame"></div>
      </div>
    </section>

    <section className="sec lpx-band" id="services" style={{paddingBottom:'0'}}>
      <div className="wrap">
        <span className="eyebrow" style={{color:'var(--blue)'}}><span data-scramble="">THE DELIVERY CYCLE</span></span>
        <h2 style={{marginTop:'14px',maxWidth:'26ch'}}>From blueprint to handover, and beyond.</h2>
        <p className="lp-lede" data-reveal="">One process, five stages, one accountable team. Design leads to procurement, procurement to construction, construction to commissioning, commissioning to maintenance. And maintenance feeds the next design: the cycle never ends, which is why the same team carries a facility for its whole life.</p>
      </div>
      <div className="lpx" id="lpxWrap">
        <div className="lpx-info">
          <div className="lpx-count" aria-hidden="true"><span id="lpNum">1</span><small>/ 5</small><canvas className="lp-icon" id="lpIcon"></canvas></div>
          <div className="lpx-card" id="lpPanel" aria-live="polite">
            <img className="swap" id="lpImg" src="/assets/ph-blueprint.webp" alt="" />
            <div className="in swap">
              <span className="lp-kick" id="lpKick">Where every great facility begins</span>
              <h3 id="lpTitle">Engineering Design &amp; Consultation</h3>
              <p id="lpDesc">Concept to detailed design across CSA and MEP.</p>
              <ul id="lpList"></ul>
              <div className="lp-meta"><span className="svc-tag" id="lpTag">CSA &#183; MEP</span><span className="lp-step" id="lpStep">Step 1 of 5 &#183; the loop continues</span></div>
            </div>
          </div>
          <div className="lp-steps" id="lpSteps" role="group" aria-label="Delivery cycle stages: each stage leads to the next and maintenance returns to design">
            <button type="button" data-i="0" className="on" aria-pressed="true">1<b>Design</b></button>
            <button type="button" data-i="1" aria-pressed="false">2<b>Procure</b></button>
            <button type="button" data-i="2" aria-pressed="false">3<b>Construct</b></button>
            <button type="button" data-i="3" aria-pressed="false">4<b>Commission</b></button>
            <button type="button" data-i="4" aria-pressed="false">5<b>Maintain</b></button>
          </div>
          <div className="lp-loop"><i></i>Maintenance feeds the next design</div>
        </div>
        <div className="lpx-view" id="lpStage">
          <canvas id="lpCv" aria-hidden="true"></canvas>
          <div className="lp-tags" id="lpTags" aria-hidden="true"></div>
          <div className="lp-hint"><i></i><span id="lpHintTx">One continuous cycle &#183; hover a stage</span><i></i></div>
        </div>
      </div>
    </section>

    <section className="sec wrap" id="industries" style={{paddingTop:'20px'}}>
      <span className="eyebrow"><span data-scramble="">WHERE WE BUILD</span></span>
      <h2 style={{marginTop:'14px',maxWidth:'22ch'}}>Seven industries, one standard of clean</h2>
      <div className="inds">
        <Link className="ind" data-reveal="" to="/projects#semiconductor"><div className="indv"><img src="/assets/industries/semiconductor.webp" alt="" loading="lazy" /><span className="no">IND · 01</span></div><div className="ind-b"><span className="iic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M10 7V4M14 7V4M10 20v-3M14 20v-3M7 10H4M7 14H4M20 10h-3M20 14h-3"/></svg></span><h3>Semiconductor</h3><p>Wafer fabs, backend plants, ISO 3 to 6 cleanrooms.</p><span className="go">See projects &rarr;</span></div></Link>
        <Link className="ind" data-reveal="" to="/projects#data-centre"><div className="indv"><img src="/assets/industries/data-centre.webp" alt="" loading="lazy" /><span className="no">IND · 02</span></div><div className="ind-b"><span className="iic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><rect x="4" y="4" width="16" height="7" rx="1.5"/><rect x="4" y="13" width="16" height="7" rx="1.5"/><path d="M8 7.5h.01M8 16.5h.01M12 7.5h4M12 16.5h4"/></svg></span><h3>Data Centre</h3><p>Cooling, power and controlled environments at scale.</p><span className="go">See projects &rarr;</span></div></Link>
        <Link className="ind" data-reveal="" to="/projects#ev-battery"><div className="indv"><img src="/assets/industries/ev-battery.webp" alt="" loading="lazy" /><span className="no">IND · 03</span></div><div className="ind-b"><span className="iic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="16" height="9" rx="2"/><path d="M21 11v3M11.5 9.5l-2 3h3l-2 3"/></svg></span><h3>EV Battery</h3><p>Gigafactory dry rooms, humidity-critical builds.</p><span className="go">See projects &rarr;</span></div></Link>
        <Link className="ind" data-reveal="" to="/projects#photovoltaic"><div className="indv"><img src="/assets/industries/photovoltaic.webp" alt="" loading="lazy" /><span className="no">IND · 04</span></div><div className="ind-b"><span className="iic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M6 14h12l1.6 6H4.4zM9 14l.6-4h4.8l.6 4M12 7V4M7 8L5.5 6M17 8l1.5-2"/></svg></span><h3>Photovoltaic</h3><p>Solar cell and module production facilities.</p><span className="go">See projects &rarr;</span></div></Link>
        <Link className="ind" data-reveal="" to="/projects#pharma"><div className="indv"><img src="/assets/industries/pharma.webp" alt="" loading="lazy" /><span className="no">IND · 05</span></div><div className="ind-b"><span className="iic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3h4M11 3v6l-5 9a2.4 2.4 0 0 0 2.1 3.5h7.8A2.4 2.4 0 0 0 18 18l-5-9V3"/><path d="M8.4 15h7.2"/></svg></span><h3>Pharmaceuticals &amp; Hospitals</h3><p>GMP parenteral, labs and medical device plants.</p><span className="go">See projects &rarr;</span></div></Link>
        <Link className="ind" data-reveal="" to="/projects#fnb"><div className="indv"><img src="/assets/industries/fnb.webp" alt="" loading="lazy" /><span className="no">IND · 06</span></div><div className="ind-b"><span className="iic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16M6 20V9a6 6 0 0 1 12 0v11M12 3v2"/></svg></span><h3>Food &amp; Beverages</h3><p>Hygienic flavor and food production environments.</p><span className="go">See projects &rarr;</span></div></Link>
        <Link className="ind" data-reveal="" to="/projects#district-cooling"><div className="indv"><img src="/assets/industries/district-cooling.webp" alt="" loading="lazy" /><span className="no">IND · 07</span></div><div className="ind-b"><span className="iic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M12 3v18M5 6.5l14 11M19 6.5l-14 11M12 3l-2 2M12 3l2 2M12 21l-2-2M12 21l2-2"/></svg></span><h3>District Cooling &amp; Heating</h3><p>Including Malaysia&rsquo;s largest district cooling centre.</p><span className="go">See projects &rarr;</span></div></Link>
      </div>
    </section>

    <section className="dark-band show3d" id="showpiece" style={{paddingBottom:'0'}}>
      <div className="grid-lines" aria-hidden="true"></div>
      <div className="stage" id="stage">
        <canvas id="stageCv" aria-hidden="true"></canvas>
        <div className="stage-inner">
          <div>
            <span className="eyebrow" style={{color:'var(--blue)'}}><span data-scramble="">THE 3D LAYER</span></span>
            <h2 style={{marginTop:'14px'}}>The cleanroom assembles as you scroll</h2>
            <p className="lede" style={{marginTop:'14px',fontSize:'15px'}}>Four layers of engineering, built in sequence. On the production site this becomes a full WebGL model fed by your 360&deg; site captures.</p>
            <div className="stagecaps" id="stagecaps">
              <div className="cap-rail" aria-hidden="true"><i id="capRailFill"></i></div>
              <div className="stagecap act"><span className="cic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V8l7-5 7 5v13"/><path d="M9 21v-6h6v6M9 11h6"/></svg></span><span className="n">01</span><div><b>The structure</b><p>Shell, slab and envelope: the controlled volume is defined.</p></div></div>
              <div className="stagecap"><span className="cic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h11a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3H8M3 17h13"/><circle cx="18.5" cy="7" r="2"/><circle cx="5.5" cy="17" r="2"/></svg></span><span className="n">02</span><div><b>Process &amp; MEP</b><p>Tools, utilities and services move in beneath the deck.</p></div></div>
              <div className="stagecap"><span className="cic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="1.5"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg></span><span className="n">03</span><div><b>The FFU ceiling</b><p>Fan filter units grid the ceiling: the machine that makes clean.</p></div></div>
              <div className="stagecap"><span className="cic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4v11M7 15l-2.5-2.5M7 15l2.5-2.5M12 4v14M12 18l-2.5-2.5M12 18l2.5-2.5M17 4v11M17 15l-2.5-2.5M17 15l2.5-2.5"/></svg></span><span className="n">04</span><div><b>Laminar downflow</b><p>Air moves in one direction only. ISO 5, live and verified.</p></div></div>
            </div>
            <div className="stage-note">360&deg; site capture and the full WebGL facility model embed here at production &middot; performance-gated, Apple-smooth</div>
          </div>
          <div className="iso-stage" id="isoStage">
            <svg viewBox="0 0 560 360" role="img" aria-label="Isometric cleanroom cutaway assembling in four layers: structure, MEP, FFU ceiling, laminar downflow">
              <defs>
                <linearGradient id="wallg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#243459"/><stop offset="1" stopColor="#131E38"/></linearGradient>
              </defs>
              <g id="gShell">
                <polygon points="280,330 60,220 280,110 500,220" fill="#152036" stroke="#4A5D93" strokeWidth="1.5"/>
                <polygon points="60,220 60,120 280,10 280,110" fill="url(#wallg)" stroke="#4A5D93" strokeWidth="1.5"/>
                <polygon points="280,10 500,120 500,220 280,110" fill="#0F1830" stroke="#4A5D93" strokeWidth="1.5"/>
                <g fontFamily="JetBrains Mono,monospace" fontSize="8.6" letterSpacing="1.6" fill="#9AA8C6">
                  <text x="24" y="292">RAISED FLOOR RETURN</text>
                </g>
              </g>
              <g id="gMEP">
                <g stroke="#FF4D55" strokeWidth="1.3" fill="rgba(255,77,85,.12)">
                  <polygon points="180,272 140,252 180,232 220,252"/>
                  <polygon points="140,252 140,232 180,212 180,232"/>
                  <polygon points="180,272 180,252 220,232 220,252" fill="rgba(255,77,85,.05)"/>
                  <polygon points="360,282 320,262 360,242 400,262"/>
                  <polygon points="320,262 320,238 360,218 360,242"/>
                  <polygon points="360,282 360,258 400,238 400,262" fill="rgba(255,77,85,.05)"/>
                </g>
                <path d="M220 252 L320 262" stroke="#FF4D55" strokeWidth="1" strokeDasharray="3 5" opacity=".6"/>
                <text x="24" y="252" fontFamily="JetBrains Mono,monospace" fontSize="8.6" letterSpacing="1.6" fill="#FF4D55">PROCESS · MEP</text>
              </g>
              <g id="gFFU">
                <g stroke="#5A6DA3" strokeWidth="1.1">
                  <line x1="115" y1="147" x2="335" y2="37"/><line x1="170" y1="174" x2="390" y2="64"/><line x1="225" y1="201" x2="445" y2="91"/>
                  <line x1="115" y1="147" x2="225" y2="201"/><line x1="335" y1="37" x2="445" y2="91"/><line x1="280" y1="65" x2="390" y2="119"/><line x1="225" y1="92" x2="335" y2="146"/><line x1="170" y1="119" x2="280" y2="173"/>
                </g>
                <text x="24" y="100" fontFamily="JetBrains Mono,monospace" fontSize="8.6" letterSpacing="1.6" fill="#9AA8C6">FFU CEILING</text>
              </g>
              <g id="gFlow">
                <g className="flowset">
                  <path className="flow-line" d="M170 130 L170 260"/>
                  <path className="flow-line" style={{animationDelay:'-.7s'}} d="M225 158 L225 288"/>
                  <path className="flow-line" style={{animationDelay:'-1.4s'}} d="M280 130 L280 260"/>
                  <path className="flow-line" style={{animationDelay:'-2.1s'}} d="M335 158 L335 288"/>
                  <path className="flow-line" style={{animationDelay:'-.4s'}} d="M390 130 L390 260"/>
                </g>
                <g fontFamily="JetBrains Mono,monospace" fontSize="8.6" letterSpacing="1.6" fill="#35E0C8">
                  <text x="452" y="150">LAMINAR</text><text x="452" y="163">DOWNFLOW</text>
                </g>
                <text x="452" y="300" fontFamily="JetBrains Mono,monospace" fontSize="8.6" letterSpacing="1.6" fill="#9AA8C6">ISO 5</text>
              </g>
            </svg>
          </div>
        </div>
        <div className="zoom-info" aria-hidden="true">
          <span className="zi-k">Exploded view &middot; ISO 5 unidirectional</span>
          <h3>One cleanroom, four engineered layers</h3>
          <p>Fan filter ceiling down to the raised floor, delivered as a single accountable envelope. Hover any tag for the part detail.</p>
        </div>
        <div className="scroll-cue" aria-hidden="true"><span>Scroll to continue</span><i className="cue-bar"><i></i></i><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v14M12 18l-5-5M12 18l5-5"/></svg></div>
            <div className="sp-mrail" aria-hidden="true"><span className="sp-mrail-tr"><i id="spMrailFill"></i></span><span className="sp-mrail-aff"><span className="sp-mrail-lbl">SCROLL</span><svg className="sp-mrail-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg></span></div>
      </div>
    </section>

    <section className="sec wrap" id="work" style={{paddingTop:'clamp(64px,9vh,110px)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',gap:'16px',flexWrap:'wrap'}}>
        <div><span className="eyebrow"><span data-scramble="">SELECTED WORK</span></span><h2 style={{marginTop:'14px',maxWidth:'20ch'}}>The registry, filterable by industry, region and type</h2></div>
        <Link className="cta-ghost" to="/projects">Open full registry</Link>
      </div>
      <div className="fp">
        <Link className="fpc" data-reveal="" to="/projects#semiconductor"><div className="fp3d" data-kind="fab"><canvas></canvas></div><span className="ref">PRJ · Semiconductor</span><h3>Testing manufacturing plant, 25,000 m² greenfield</h3><span className="cl2">Robert Bosch</span><div className="tags"><span className="tag b">ISO 4 to 6</span><span className="tag">Cleanroom</span><span className="tag">Malaysia</span></div></Link>
        <Link className="fpc" data-reveal="" to="/projects#semiconductor"><div className="fp3d" data-kind="backend"><canvas></canvas></div><span className="ref">PRJ · Semiconductor</span><h3>Backend plant, 43,000 m² test, probe and assembly</h3><span className="cl2">Infineon · Melaka</span><div className="tags"><span className="tag b">ISO 5</span><span className="tag">EPCM</span><span className="tag">Malaysia</span></div></Link>
        <Link className="fpc" data-reveal="" to="/projects#ev-battery"><div className="fp3d" data-kind="dryroom"><canvas></canvas></div><span className="ref">PRJ · EV Battery</span><h3>Lithium-ion gigafactory dry room, 62,000 m²</h3><span className="cl2">Northvolt</span><div className="tags"><span className="tag b">Dry room</span><span className="tag">Europe</span></div></Link>
        <Link className="fpc" data-reveal="" to="/projects#district-cooling"><div className="fp3d" data-kind="cooling"><canvas></canvas></div><span className="ref">PRJ · District Cooling</span><h3>Malaysia&rsquo;s largest district cooling centre</h3><span className="cl2">KLCC · Kuala Lumpur</span><div className="tags"><span className="tag b">Energy</span><span className="tag">Malaysia</span></div></Link>
      </div>
    </section>

    <section className="sec wrap" id="news" style={{paddingTop:'20px'}}>
      <span className="eyebrow"><span data-scramble="">NEWSROOM</span></span>
      <h2 style={{marginTop:'14px'}}>Signals from the group</h2>
      <div className="news">
        <a href="https://iaqtechnology.com.my/iaq-opens-official-branch-office-in-penang-strengthening-commitment-to-the-northern-region/" target="_blank" rel="noopener" data-reveal=""><span className="d">Jul 23, 2025</span><span className="t">IAQ opens official branch office in Penang, strengthening the northern region</span><span className="go">&rarr;</span></a>
        <a href="https://iaqtechnology.com.my/iaq-joins-prime-ministers-high-level-business-roundtable-in-france-representing-malaysias-growing-global-presence/" target="_blank" rel="noopener" data-reveal=""><span className="d">Jul 9, 2025</span><span className="t">IAQ joins the Prime Minister&rsquo;s high-level business roundtable in France</span><span className="go">&rarr;</span></a>
        <a href="https://iaqtechnology.com.my/iaq-featured-in-the-star-a-national-spotlight-on-excellence-in-hi-tech-facility-construction/" target="_blank" rel="noopener" data-reveal=""><span className="d">Dec 24, 2024</span><span className="t">Featured in The Star: a national spotlight on hi-tech facility construction</span><span className="go">&rarr;</span></a>
      </div>
    </section>

    <section className="sec wrap" id="careers">
      <div className="split">
        <div>
          <span className="eyebrow"><span data-scramble="">CAREERS</span></span>
          <h2 style={{marginTop:'14px',maxWidth:'18ch'}}>Build the buildings the future needs</h2>
          <p className="lede" style={{marginTop:'16px'}}>Engineers, project leaders and commercial minds. Filter live openings by location and department.</p>
          <div className="count-pill" data-reveal=""><b><span data-count="16">0</span></b><span>Open roles · 2 locations</span></div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
          <Link className="fpc" data-reveal="" to="/careers"><span className="fpc-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M22 12h-3M5 12H2M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1M18.4 18.4l-2.1-2.1M7.7 7.7 5.6 5.6"/></svg></span><span className="ref">ENG · Shah Alam</span><h3>Senior Engineer, Mechanical</h3><div className="tags"><span className="tag b">Engineering</span><span className="tag">Selangor</span></div></Link>
          <Link className="fpc" data-reveal="" to="/careers"><span className="fpc-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M22 12h-3M5 12H2M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1M18.4 18.4l-2.1-2.1M7.7 7.7 5.6 5.6"/></svg></span><span className="ref">ENG · Simpang Ampat</span><h3>Senior Engineer, Process</h3><div className="tags"><span className="tag b">Engineering</span><span className="tag">Penang</span></div></Link>
          <Link className="cta" style={{textAlign:'center'}} to="/careers">See all 16 openings</Link>
        </div>
      </div>
    </section>

    <section className="close3d dark-band" id="contact">
      <div className="close-stage">
      <div className="close-in wrap split">
        <div>
          <span className="eyebrow" style={{color:'var(--blue)'}}><span data-scramble="">START A PROJECT</span></span>
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
      </div>
      <Footer note="Homepage concept · Brand Method" />
    </section>
    </>
  )
}
