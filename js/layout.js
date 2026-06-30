// Shared logo SVG (path-based, no font dependency)
const nestedSections = ['/blog/', '/logo-page/', '/work/'];
const basePath = nestedSections.some((section) => window.location.pathname.includes(section)) ? '../' : '';
const logoSVG = (width, height) => `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 100" width="${width}" height="${height}" aria-label="Brand Method">
    <path fill="#0000ff" fill-rule="evenodd" d="M 0,0 L 25,0 A 47,25 0 0,1 25,50 A 50,25 0 0,1 25,100 L 0,100 Z M 25,8 A 35,17 0 0,1 25,42 Z M 25,57 A 38,17.5 0 0,1 25,92 Z"/>
    <polygon fill="#0000ff" points="160,7 164,34.5 181.5,12.7 171.3,38.7 197.2,28.5 175.5,45.9 203,50 175.5,54.1 197.2,71.5 171.3,61.3 181.5,87.3 164,65.5 160,93 156,65.5 138.5,87.3 148.7,61.3 122.8,71.5 144.5,54.1 117,50 144.5,45.9 122.8,28.5 148.7,38.7 138.5,12.7 156,34.5"/>
  </svg>`;

// Inject nav
document.body.insertAdjacentHTML('afterbegin', `
<nav>
  <div class="nav-inner">
    <div class="nav-left">
      <a href="${basePath}index.html" class="nav-logo" aria-label="Brand Method home">
        <img class="nav-logo-mark" src="${basePath}brand-method-wordmark.png" alt="Brand Method" decoding="async">
      </a>
      <span class="nav-tag"><span class="dot"></span>BM / INTERNATIONAL</span>
    </div>
    <div class="nav-links">
      <a href="${basePath}index.html">Home</a>
      <a href="${basePath}about.html">About</a>
      <a href="${basePath}work.html">Work</a>
      <div class="nav-dd">
        <a href="${basePath}services.html" class="nav-dd-trigger" aria-haspopup="true" aria-expanded="false">Services <svg class="cv" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 4l4 4 4-4"/></svg></a>
        <div class="nav-dd-panel">
          <div class="ddp-col">
            <span class="ddp-head">By service</span>
            <a class="ddp-all" href="${basePath}services.html">All services overview <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
            <a class="ddp-svc" href="${basePath}brand-strategy.html" style="--dc:#d63a7e"><span class="ddp-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7 5h10l3 5-8 11L4 10z"/><path d="M4 10h16" stroke-opacity=".5"/><path d="M9.5 5 8 10l4 11 4-11-1.5-5" stroke-opacity=".4"/></svg></span><span class="ddp-txt"><span class="ddp-nm">Brand Strategy <span class="amp">&amp;</span> Identity</span><span class="ddp-desc">Positioning, naming &amp; a full visual identity</span></span></a>
            <a class="ddp-svc" href="${basePath}system-playbook.html" style="--dc:#3a55e8"><span class="ddp-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2.4"/><circle cx="5" cy="6" r="1.7"/><circle cx="19" cy="6" r="1.7"/><circle cx="5" cy="18" r="1.7"/><circle cx="19" cy="18" r="1.7"/><path d="M6.3 7.1 10 10.2M17.7 7.1 14 10.2M6.3 16.9 10 13.8M17.7 16.9 14 13.8" stroke-opacity=".55"/></svg></span><span class="ddp-txt"><span class="ddp-nm">Systems <span class="amp">&amp;</span> Playbook</span><span class="ddp-desc">Guidelines that keep every touchpoint on-brand</span></span></a>
            <a class="ddp-svc" href="${basePath}marketing-ads.html" style="--dc:#c8890d"><span class="ddp-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16" stroke-opacity=".5"/><path d="M5 16l4-4 3 2 6-7"/><path d="M18 7h-3M18 7v3"/></svg></span><span class="ddp-txt"><span class="ddp-nm">Marketing <span class="amp">&amp;</span> Ads</span><span class="ddp-desc">Campaigns engineered to convert</span></span></a>
            <a class="ddp-svc" href="${basePath}content-creation.html" style="--dc:#7a4ee8"><span class="ddp-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M10 8.4 16 12 10 15.6z" fill="currentColor" stroke="none"/></svg></span><span class="ddp-txt"><span class="ddp-nm">Content Creation</span><span class="ddp-desc">Social, video &amp; creative that performs</span></span></a>
            <a class="ddp-svc" href="${basePath}website-apps.html" style="--dc:#0fa67a"><span class="ddp-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="13.5" height="11"/><path d="M3 8.4h13.5" stroke-opacity=".5"/><rect x="14.5" y="11" width="6.5" height="9" fill="#fff"/><rect x="14.5" y="11" width="6.5" height="9"/></svg></span><span class="ddp-txt"><span class="ddp-nm">Website, App <span class="amp">&amp;</span> E-Commerce</span><span class="ddp-desc">Websites, apps &amp; stores built to sell</span></span></a>
          </div>
          <a class="ddp-feature" href="${basePath}pricing.html">
            <span class="ddp-feat-vis" aria-hidden="true">
              <span class="ddp-grid"></span>
              <span class="ddp-glow"></span>
              <svg class="ddp-ladder" viewBox="0 0 240 116" fill="none" preserveAspectRatio="xMidYMax meet">
                <line class="ddp-base" x1="22" y1="99" x2="218" y2="99"/>
                <rect class="ddp-bar b1" x="30" y="69" width="22" height="30"/>
                <rect class="ddp-bar b2" x="70" y="57" width="22" height="42"/>
                <rect class="ddp-bar b3" x="110" y="45" width="22" height="54"/>
                <rect class="ddp-bar b4" x="150" y="33" width="22" height="66"/>
                <rect class="ddp-bar b5" x="190" y="19" width="22" height="80"/>
                <path class="ddp-trend" pathLength="100" d="M41 69 L81 57 L121 45 L161 33 L201 19"/>
                <path class="ddp-spark" d="M201 8 C202.4 14.6 204.4 16.6 211 18 C204.4 19.4 202.4 21.4 201 28 C199.6 21.4 197.6 19.4 191 18 C197.6 16.6 199.6 14.6 201 8 Z"/>
              </svg>
            </span>
            <span class="ddp-feat-body">
              <span class="ddp-head">Go deeper</span>
              <span class="ddp-feature-title">Details <span class="amp">&amp;</span> Pricing</span>
              <p>Every phase, every deliverable and exactly what it costs. Fixed prices, money-back guarantee.</p>
              <span class="ddp-feature-link">View details <span class="amp">&amp;</span> pricing <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
            </span>
          </a>
        </div>
      </div>
      <a href="${basePath}resources.html">Resources</a>
    </div>
    <div class="nav-right">
      <button class="nav-ss" type="button" aria-label="Super Strategist members area"><span class="nav-ss-t">SS</span><span class="nav-ss-dot"></span></button>
      <a href="${basePath}contact.html" class="nav-cta">Hire Us</a>
      <button class="nav-hamburger" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
</nav>
<div class="nav-mobile">
  <a href="${basePath}index.html">Home</a>
  <a href="${basePath}about.html">About</a>
  <a href="${basePath}work.html">Work</a>
  <div class="nav-mobile-services">
    <div class="nav-mobile-services-row">
      <a href="${basePath}services.html">Services</a>
      <button class="nav-mobile-services-toggle" type="button" aria-label="Toggle services submenu" aria-expanded="false">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
    <div class="nav-mobile-sub" id="nav-mobile-services-sub">
      <a href="${basePath}brand-strategy.html">Brand Strategy &amp; Identity</a>
      <a href="${basePath}system-playbook.html">Systems &amp; Playbook</a>
      <a href="${basePath}marketing-ads.html">Marketing &amp; Ads</a>
      <a href="${basePath}content-creation.html">Content Creation</a>
      <a href="${basePath}website-apps.html">Website, App &amp; E-Commerce</a>
      <a href="${basePath}pricing.html">Details &amp; Pricing</a>
    </div>
  </div>
  <a href="${basePath}resources.html">Resources</a>
  <a href="${basePath}contact.html" class="nav-cta">Hire Us</a>
</div>
`);

// Inject footer
document.body.insertAdjacentHTML('beforeend', `
<footer>
  <canvas class="footer-fx" aria-hidden="true"></canvas>
  <svg class="footer-grain" aria-hidden="true" preserveAspectRatio="none"><filter id="fgrain"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#fgrain)"/></svg>
  <div class="footer-inner">
    <div class="footer-top">
      <div class="footer-brand">
        <h4>Address</h4>
        <p>Mranti Park, Office 25, Level 1,<br>Taman Teknologi Mranti, Bukit Jalil,<br>57000 Kuala Lumpur</p>
      </div>
      <div class="footer-col footer-col-menu">
        <h4>Menu</h4>
        <ul>
          <li><a href="${basePath}index.html">Home</a></li>
          <li><a href="${basePath}about.html">About</a></li>
          <li><a href="${basePath}work.html">Work</a></li>
          <li><a href="${basePath}services.html">Services</a></li>
          <li><a href="${basePath}resources.html">Resources</a></li>
        </ul>
      </div>
      <div class="footer-col footer-col-services">
        <h4>Our Services</h4>
        <ul>
          <li><a href="${basePath}brand-strategy.html">Brand Strategy &amp; Identity</a></li>
          <li><a href="${basePath}system-playbook.html">System &amp; Playbook</a></li>
          <li><a href="${basePath}marketing-ads.html">Marketing &amp; Ads</a></li>
          <li><a href="${basePath}content-creation.html">Content Creation</a></li>
          <li><a href="${basePath}website-apps.html">Website, Apps &amp; E-Commerce</a></li>
        </ul>
      </div>
      <div class="footer-col footer-col-contact">
        <h4>Contact</h4>
        <ul>
          <li><a href="tel:+60122826371">+6012-282 6371</a></li>
          <li><a href="mailto:hello@brandmethod.co">hello@brandmethod.co</a></li>
          <li><a href="https://instagram.com/brandmethod" target="_blank" rel="noopener">Instagram</a></li>
          <li><a href="https://linkedin.com/company/brandmethod" target="_blank" rel="noopener">LinkedIn</a></li>
          <li><a href="https://www.facebook.com/brandmethodinternational/" target="_blank" rel="noopener">Facebook</a></li>
          <li><a href="https://www.tiktok.com/@bazilzieel69" target="_blank" rel="noopener">TikTok</a></li>
          <li><a href="https://dribbble.com/BazilZieel" target="_blank" rel="noopener">Dribbble</a></li>
          <li><a href="https://www.behance.net/BazilZieel" target="_blank" rel="noopener">Behance</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-lockup">
      <div class="bm-logo">
        <div class="bm-wrap">
          <img class="bm-wordmark" id="bmWordmark" alt="Brand Method">
          <div class="bm-sheen" id="bmSheen"></div>
          <div class="bm-star" id="bmStar"><canvas id="bmCanvas"></canvas></div>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2026 BrandMethod Agency Sdn Bhd (1553794-X). All rights reserved.</p>
      <div class="footer-bottom-links">
        <a href="${basePath}terms-of-service.html">Terms of Service</a>
        <a href="${basePath}privacy-policy.html">Privacy Policy</a>
      </div>
    </div>
  </div>
</footer>
<a href="https://wa.me/60122826371" class="wa-float" target="_blank" aria-label="WhatsApp">
  <svg viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
</a>
<button class="scroll-top-float" type="button" aria-label="Scroll to top">
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 5l-7 7m7-7 7 7M12 5v14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</button>
`);

// Load footer FX (3D spinning star logo + node-network background) after the footer is in the DOM.
(function () {
  function loadScript(src, onload) {
    var s = document.createElement('script');
    s.src = src;
    s.defer = true;
    if (onload) s.onload = onload;
    document.body.appendChild(s);
  }
  loadScript(basePath + 'js/three.min.js', function () {
    loadScript(basePath + 'js/footer-fx.js');
  });
})();
