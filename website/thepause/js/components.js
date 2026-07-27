/* ============================================================
   THE PAUSE : Shared chrome + reusable pieces
   Header, mobile menu, footer, product card.
   ============================================================ */

import { icon } from "./icons.js";
import { money, brandById } from "./data.js";
import { mountScentJourney } from "./scent-journey.js";

const NAV = [
  { label: "Shop", href: "shop.html" },
  { label: "Shop by Mood", href: "shop.html#moods" },
  { label: "Brands", href: "brands.html" },
  { label: "Journal", href: "journal.html" },
];

export function mountHeader() {
  // erode filter: renders the wordmark glyphs visually thinner than the source SVG
  if (!document.getElementById("logo-thin")) {
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    defs.setAttribute("width", "0"); defs.setAttribute("height", "0");
    defs.setAttribute("aria-hidden", "true");
    defs.style.position = "absolute";
    defs.innerHTML = `<filter id="logo-thin"><feMorphology operator="erode" radius="0.7"/></filter>`;
    document.body.prepend(defs);
  }
  const header = document.createElement("header");
  header.className = "header";
  header.innerHTML = `
    <div class="announce"><span class="announce__ship">Complimentary shipping over RM 250</span><span class="announce__sep">&nbsp;·&nbsp;</span><span>10% off your first pause</span></div>
    <div class="header__inner">
      <nav class="header__nav header__nav--left" aria-label="Primary">
        ${NAV.map((n) => `<a class="nav-link" href="${n.href}">${n.label}</a>`).join("")}
      </nav>
      <a class="brandmark" href="index.html" data-cursor aria-label="The Pause, home"><span class="logo"></span></a>
      <div class="header__nav header__nav--right">
        <a class="nav-link" href="find-your-scent.html">Find Your Scent</a>
        <div class="header__icons">
          <a class="icon-btn" href="search.html" aria-label="Search">${icon("search")}</a>
          <a class="icon-btn" href="account.html" aria-label="Account">${icon("account")}</a>
          <button class="icon-btn" data-open-cart aria-label="Open cart">
            ${icon("cart")}<span class="cart-count" aria-hidden="true">0</span>
          </button>
          <button class="icon-btn header__menu-toggle" data-open-menu aria-label="Open menu">${icon("menu")}</button>
        </div>
      </div>
    </div>`;

  const menu = document.createElement("div");
  menu.className = "mobile-menu";
  menu.innerHTML = `
    <button class="icon-btn mobile-menu__close" data-close-menu aria-label="Close menu">${icon("close")}</button>
    ${[...NAV,
       { label: "Find Your Scent", href: "find-your-scent.html" },
       { label: "Our Story", href: "our-story.html" },
       { label: "Search", href: "search.html" },
       { label: "Account", href: "account.html" }]
      .map((n) => `<a href="${n.href}">${n.label}</a>`).join("")}`;

  document.body.prepend(header);
  document.body.append(menu);

  // publish the real top-bar height so fixed-header pages can offset correctly
  const setTopbar = () => document.documentElement.style.setProperty("--topbar-h", header.offsetHeight + "px");
  setTopbar();
  window.addEventListener("resize", setTopbar);

  const openBtn = header.querySelector("[data-open-menu]");
  const closeBtn = menu.querySelector("[data-close-menu]");
  menu.id = "mobile-menu";
  menu.setAttribute("role", "dialog");
  menu.setAttribute("aria-modal", "true");
  menu.setAttribute("aria-label", "Menu");
  openBtn.setAttribute("aria-expanded", "false");
  openBtn.setAttribute("aria-controls", "mobile-menu");
  const openMenu = () => {
    menu.classList.add("is-open");
    openBtn.setAttribute("aria-expanded", "true");
    document.documentElement.classList.add("is-locked");
    window.__lenis?.stop();
    requestAnimationFrame(() => closeBtn.focus());
  };
  const closeMenu = () => {
    menu.classList.remove("is-open");
    openBtn.setAttribute("aria-expanded", "false");
    document.documentElement.classList.remove("is-locked");
    window.__lenis?.start();
    openBtn.focus();
  };
  openBtn.addEventListener("click", openMenu);
  closeBtn.addEventListener("click", closeMenu);
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => menu.classList.remove("is-open")));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && menu.classList.contains("is-open")) closeMenu(); });

  return header;
}

export function mountFooter() {
  const footer = document.createElement("footer");
  footer.className = "footer";
  footer.innerHTML = `
    <div class="footer__film" aria-hidden="true">
      <video muted loop playsinline autoplay preload="metadata" poster="assets/lifestyle/hero-rest-b.webp">
        <source src="assets/video/hero-ambient-pingpong.webm" type="video/mp4">
      </video>
    </div>
    <div class="footer__film-space" aria-hidden="true"></div>
    <div class="wrap">
      <div class="footer__top">
        <div class="footer__brand">
          <a class="brandmark" href="index.html" aria-label="The Pause, home"><span class="logo"></span></a>
          <p class="footer__tag">A space to pause, breathe, and reset. This space is now yours.</p>
          <div style="margin-top:1.5rem; display:flex; gap:.75rem;">
            <a class="icon-btn" href="#" aria-label="Instagram" data-demo="Social accounts are not available in this demo.">${icon("instagram")}</a>
          </div>
        </div>
        <div class="footer__col">
          <h4>Shop</h4>
          <ul>
            <li><a href="shop.html">All</a></li>
            <li><a href="shop.html?category=candles">Candles</a></li>
            <li><a href="shop.html?category=diffusers">Diffusers</a></li>
            <li><a href="shop.html?category=incense">Incense</a></li>
            <li><a href="shop.html?category=room-spray">Room Sprays</a></li>
          </ul>
        </div>
        <div class="footer__col">
          <h4>Explore</h4>
          <ul>
            <li><a href="find-your-scent.html">Find Your Scent</a></li>
            <li><a href="shop.html#moods">Shop by Mood</a></li>
            <li><a href="brands.html">Brands</a></li>
            <li><a href="journal.html">Journal</a></li>
            <li><a href="our-story.html">Our Story</a></li>
          </ul>
        </div>
        <div class="footer__col">
          <h4>Help</h4>
          <ul>
            <li><a href="care-use.html#shipping">Shipping</a></li>
            <li><a href="care-use.html#returns">Returns</a></li>
            <li><a href="care-use.html">Care and Use</a></li>
            <li><a href="contact.html">Contact</a></li>
            <li><a href="faq.html">FAQ</a></li>
          </ul>
        </div>
      </div>
      <div class="footer__bottom">
        <p>© 2026 The Pause. A demo homage, built with care.</p>
        <div style="display:flex; gap:1.5rem;">
          <a href="#" data-demo="Terms and privacy pages are not available in this demo.">Terms</a><a href="#" data-demo="Terms and privacy pages are not available in this demo.">Privacy</a>
        </div>
      </div>
      <div class="bm-footrib" role="img" aria-label="Demo by BrandMethod.co">
        <canvas class="bm-rib-cv" width="460" height="110" aria-hidden="true"></canvas>
        <span class="bm-footrib-fb" hidden>Demo · BrandMethod.co</span>
      </div>
    </div>`;
  document.body.append(footer);

  // footer film: play only while on screen, never under reduced motion
  const film = footer.querySelector(".footer__film video");
  if (film) {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches || location.search.includes("still");
    if (reduced) {
      film.remove(); // poster stays via the band background? keep it simple: swap to the poster image
      const still = document.createElement("img");
      still.src = "assets/lifestyle/hero-rest-b.webp";
      still.alt = "";
      still.style.cssText = "width:100%;height:100%;object-fit:cover;object-position:62% 30%;";
      footer.querySelector(".footer__film").prepend(still);
    } else {
      film.muted = true;
      film.setAttribute("muted", "");
      const nudge = () => film.play().catch(() => {});
      film.addEventListener("loadeddata", nudge, { once: true });
      film.addEventListener("canplay", nudge, { once: true });
      document.addEventListener("click", nudge, { once: true });
      if (window.IntersectionObserver) {
        new IntersectionObserver((es) => es.forEach((en) => {
          if (en.isIntersecting) nudge(); else film.pause();
        }), { threshold: 0.1 }).observe(film);
      } else {
        nudge();
      }
    }
  }
  initBrandRibbon(footer);
  mountWhatsApp();
  initDemoLocks();
  mountScentJourney();
  return footer;
}

/* ---------- Demo locks: journal is greyed out and answers with a quiet notice ---------- */
let demoToast, demoToastTimer;
export function showDemoToast(message) {
  if (!demoToast) {
    demoToast = document.createElement("div");
    demoToast.className = "demo-toast";
    demoToast.setAttribute("role", "status");
    document.body.append(demoToast);
  }
  demoToast.textContent = message;
  demoToast.classList.add("is-visible");
  clearTimeout(demoToastTimer);
  demoToastTimer = setTimeout(() => demoToast.classList.remove("is-visible"), 2600);
}
function initDemoLocks() {
  /* Anything that would need a real backend, a real destination or a real
     inbox answers with the same quiet notice rather than a dead click. */
  const lock = (el, message) => {
    el.setAttribute("aria-disabled", "true");
    el.dataset.demo = message;
  };
  document.querySelectorAll('a[href*="journal.html"]').forEach((a) =>
    lock(a, "The journal is not available in this demo."));
  document.querySelectorAll('a[href="#"], a[href=""]').forEach((a) => {
    if (a.dataset.demo) return;
    const label = (a.getAttribute("aria-label") || a.textContent || "").trim();
    lock(a, label ? `${label} is not available in this demo.` : "Not available in this demo.");
  });
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-demo]");
    if (!el) return;
    e.preventDefault();
    showDemoToast(el.dataset.demo);
  });
}

/* ---------- BrandMethod demo ribbon (canvas, ported from the rubexpay build) ---------- */
function initBrandRibbon(footer) {
  const cv = footer.querySelector(".bm-rib-cv");
  const fb = footer.querySelector(".bm-footrib-fb");
  let ctx; try { ctx = cv && cv.getContext("2d"); } catch { /* no canvas */ }
  if (!ctx) { if (cv) cv.style.display = "none"; if (fb) fb.hidden = false; return; }
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const W = 460, H = 110, dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const X0 = 40, X1 = 420, BH = 32, BY = 40;
  let running = false, looping = false, t = 0;
  const SEGS = [
    { t: "DEMO BY", f: "600 12px Inter,sans-serif", sp: 3.6, a: 1, dy: 0, gap: 8 },
    { star: true, w: 13, gap: 9 },
    { t: "BRAND", f: "600 12px Inter,sans-serif", sp: 3.6, a: 0.98, dy: 0 },
    { t: "METHOD.CO", f: "600 12px Inter,sans-serif", sp: 3.6, a: 0.98, dy: 0 },
  ];
  let GLYPHS = null;
  function buildGlyphs() {
    GLYPHS = [];
    SEGS.forEach((s) => {
      if (s.star) { GLYPHS.push({ star: true, w: s.w }); if (s.gap) GLYPHS.push({ gap: s.gap }); return; }
      if (!s.t) { if (s.gap) GLYPHS.push({ gap: s.gap }); return; }
      ctx.font = s.f;
      for (const ch of s.t) {
        if (ch === " ") { GLYPHS.push({ gap: 6.5 }); continue; }
        GLYPHS.push({ ch, f: s.f, a: s.a, dy: s.dy || 0, w: ctx.measureText(ch).width + s.sp });
      }
      if (s.gap) GLYPHS.push({ gap: s.gap });
    });
  }
  const wave = (x, tt) => 4.0 * Math.sin(x * 0.0135 + tt * 0.0011) + 2.4 * Math.sin(x * 0.029 - tt * 0.00068) + 1.2 * Math.sin(x * 0.055 + tt * 0.0016);
  const slope = (x, tt) => (wave(x + 2, tt) - wave(x - 2, tt)) / 4;
  const lerp = (a, b, p) => a + (b - a) * p;
  const shade = (p) => `rgb(${Math.round(lerp(18, 86, p))},${Math.round(lerp(28, 116, p))},${Math.round(lerp(158, 255, p))})`;
  function tail(xEdge, dir, tt) {
    const y = BY + wave(xEdge, tt) * 0.7 + 9;
    const x2 = xEdge - dir * 40;
    ctx.beginPath();
    ctx.moveTo(xEdge, y);
    ctx.lineTo(x2, y + 7);
    ctx.lineTo(x2 + dir * 13, y + 7 + BH / 2);
    ctx.lineTo(x2, y + 7 + BH);
    ctx.lineTo(xEdge, y + BH);
    ctx.closePath();
    ctx.fillStyle = "#101C96"; ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,.22)"; ctx.fill();
  }
  function draw(tt) {
    if (!GLYPHS) buildGlyphs();
    ctx.clearRect(0, 0, W, H);
    tail(X0 + 6, 1, tt); tail(X1 - 6, -1, tt);
    for (let x = X0; x <= X1; x += 2) {
      const y = BY + wave(x, tt), s = slope(x, tt);
      const p = Math.max(0, Math.min(1, 0.52 + s * 5.5 + 0.14 * Math.sin(x * 0.006 - tt * 0.00042)));
      ctx.fillStyle = shade(p);
      ctx.fillRect(x - 1, y, 2.4, BH);
    }
    ctx.beginPath();
    for (let x = X0; x <= X1; x += 4) { const y = BY + wave(x, tt); (x === X0) ? ctx.moveTo(x, y + 0.6) : ctx.lineTo(x, y + 0.6); }
    ctx.strokeStyle = "rgba(255,255,255,.28)"; ctx.lineWidth = 1.1; ctx.stroke();
    ctx.beginPath();
    for (let x = X0; x <= X1; x += 4) { const y = BY + wave(x, tt) + BH; (x === X0) ? ctx.moveTo(x, y - 0.6) : ctx.lineTo(x, y - 0.6); }
    ctx.strokeStyle = "rgba(0,10,60,.4)"; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.textAlign = "left"; ctx.textBaseline = "middle";
    let total = 0; GLYPHS.forEach((g) => { total += g.w || g.gap || 0; });
    let xs = (X0 + X1) / 2 - total / 2;
    GLYPHS.forEach((g) => {
      if (g.gap) { xs += g.gap; return; }
      const cxx = xs + (g.w || 0) / 2;
      const y = BY + wave(cxx, tt) + BH / 2 + 0.5, a = Math.atan(slope(cxx, tt));
      ctx.save(); ctx.translate(cxx, y); ctx.rotate(a);
      if (g.star) {
        ctx.strokeStyle = "rgba(255,255,255,.97)"; ctx.lineWidth = 1.5; ctx.lineCap = "round";
        for (let sp = 0; sp < 4; sp++) {
          const an = sp * Math.PI / 4;
          ctx.beginPath(); ctx.moveTo(-Math.cos(an) * 4.6, -Math.sin(an) * 4.6); ctx.lineTo(Math.cos(an) * 4.6, Math.sin(an) * 4.6); ctx.stroke();
        }
      } else {
        ctx.font = g.f;
        ctx.fillStyle = "rgba(2,8,40,.4)"; ctx.fillText(g.ch, -((g.w || 0) / 2) + 0.7, (g.dy || 0) + 1.1);
        ctx.fillStyle = `rgba(255,255,255,${g.a})`; ctx.fillText(g.ch, -((g.w || 0) / 2), g.dy || 0);
      }
      ctx.restore();
      xs += g.w || 0;
    });
  }
  function frame() { if (!running) { looping = false; return; } looping = true; t += 16; draw(t); requestAnimationFrame(frame); }
  draw(0);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { GLYPHS = null; draw(t); });
  if (reduce) return;
  if (window.IntersectionObserver) {
    new IntersectionObserver((es) => es.forEach((en) => { running = en.isIntersecting; if (running && !looping) requestAnimationFrame(frame); })).observe(cv);
  } else { running = true; requestAnimationFrame(frame); }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { running = false; }
    else { const r = cv.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) { running = true; if (!looping) requestAnimationFrame(frame); } }
  });
}

/* ---------- WhatsApp demo chat (floating, bottom right) ---------- */
function mountWhatsApp() {
  if (document.querySelector(".wa")) return;
  const WA_ICON = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a9.9 9.9 0 0 0-8.5 15.1L2 22l5-1.4A10 10 0 1 0 12 2Zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.7.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.4-3c-.3-.4 0-.5.1-.7l.4-.5c.1-.2.2-.3.3-.5v-.5c0-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.1s.9 2.5 1 2.6c.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.5.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2 0-.1-.2-.2-.4-.3Z"/></svg>`;
  const root = document.createElement("div");
  root.className = "wa";
  root.innerHTML = `
    <div class="wa__panel" role="dialog" aria-label="WhatsApp chat" hidden>
      <div class="wa__head">
        <span class="wa__avatar">${WA_ICON}</span>
        <span class="wa__id"><b>The Pause</b><i>Typically replies in a day</i></span>
        <button class="wa__close" type="button" aria-label="Close chat">${icon("close")}</button>
      </div>
      <div class="wa__body" aria-live="polite">
        <div class="wa__msg wa__msg--in">Hello, and welcome to The Pause. How can we help you today?</div>
      </div>
      <form class="wa__foot">
        <input type="text" placeholder="Type a message" aria-label="Message" maxlength="300">
        <button type="submit" aria-label="Send">${icon("arrow")}</button>
      </form>
    </div>
    <button class="wa__fab" type="button" aria-label="Chat on WhatsApp" aria-expanded="false">${WA_ICON}</button>`;
  document.body.append(root);

  // appear only after the visitor has moved past the banner (immediately on bannerless pages)
  const hero = document.querySelector(".hero");
  if (hero) {
    const reveal = () => {
      const past = window.scrollY > hero.offsetHeight * 0.85;
      root.classList.toggle("is-visible", past);
    };
    window.addEventListener("scroll", reveal, { passive: true });
    reveal();
  } else {
    setTimeout(() => root.classList.add("is-visible"), 400);
  }

  const fab = root.querySelector(".wa__fab");
  const panel = root.querySelector(".wa__panel");
  const body = root.querySelector(".wa__body");
  const form = root.querySelector(".wa__foot");
  const input = form.querySelector("input");
  const toggle = (open) => {
    panel.hidden = !open;
    fab.setAttribute("aria-expanded", String(open));
    root.classList.toggle("is-open", open);
    if (open) requestAnimationFrame(() => input.focus());
  };
  fab.addEventListener("click", () => toggle(panel.hidden));
  root.querySelector(".wa__close").addEventListener("click", () => toggle(false));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) toggle(false); });

  let replied = false;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    const out = document.createElement("div");
    out.className = "wa__msg wa__msg--out";
    out.textContent = text;
    body.append(out);
    body.scrollTop = body.scrollHeight;
    const typing = document.createElement("div");
    typing.className = "wa__msg wa__msg--in wa__typing";
    typing.innerHTML = "<span></span><span></span><span></span>";
    setTimeout(() => { body.append(typing); body.scrollTop = body.scrollHeight; }, 450);
    setTimeout(() => {
      typing.remove();
      const reply = document.createElement("div");
      reply.className = "wa__msg wa__msg--in";
      reply.textContent = replied
        ? "This chat is part of a demo, so messages are not delivered. For anything real, hello@thepause.co is always open."
        : "Thank you for writing to us. WhatsApp chat is not available in this demo. When the store goes live, a real person will answer here.";
      replied = true;
      body.append(reply);
      body.scrollTop = body.scrollHeight;
    }, 1700);
  });
}

/* ---------- Welcome popup (once per session, never blocks intro) ---------- */
export function mountWelcome({ image = "assets/lifestyle/opening-promo.webp" } = {}) {
  if (sessionStorage.getItem("pause-welcomed")) return;

  const scrim = document.createElement("div");
  scrim.className = "welcome-scrim";
  const modal = document.createElement("div");
  modal.className = "welcome";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-label", "Welcome offer");
  modal.innerHTML = `
    <button class="icon-btn welcome__close" data-close aria-label="Close">${icon("close")}</button>
    <div class="welcome__media"><img src="${image}" alt=""></div>
    <div class="welcome__body">
      <p class="eyebrow">A small welcome</p>
      <h3><span class="tenper">10%</span> off your <em>first pause.</em></h3>
      <p>Enter your email to receive 10% off your first order. A quiet beginning, just for you.</p>
      <form class="field" data-form>
        <input type="email" placeholder="Your email" aria-label="Email" required>
        <button class="btn btn--sm" type="submit" aria-label="Subscribe">${icon("arrow")}</button>
      </form>
      <button class="welcome__dismiss" data-close>No thank you, maybe later</button>
    </div>`;
  document.body.append(scrim, modal);

  const close = () => {
    scrim.classList.remove("is-open");
    modal.classList.remove("is-open");
    sessionStorage.setItem("pause-welcomed", "1");
    setTimeout(() => { scrim.remove(); modal.remove(); }, 700);
  };
  const open = () => {
    if (sessionStorage.getItem("pause-welcomed")) return;
    scrim.classList.add("is-open");
    modal.classList.add("is-open");
    requestAnimationFrame(() => modal.querySelector("[data-close]")?.focus());
  };

  scrim.addEventListener("click", close);
  modal.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", close));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  modal.querySelector("[data-form]").addEventListener("submit", (e) => {
    e.preventDefault();
    modal.querySelector(".welcome__body").innerHTML = `<p class="eyebrow">Thank you</p><h3>A quiet beginning <em>awaits.</em></h3><p>Signing up is not available in this demo, so nothing was sent.</p>`;
    setTimeout(close, 2200);
  });

  // trigger: after a delay, or when the visitor scrolls past the hero. Never at the intro.
  let shown = false;
  const trigger = () => { if (!shown) { shown = true; open(); cleanup(); } };
  const onScroll = () => { if (window.scrollY > window.innerHeight * 0.6) trigger(); };
  const timer = setTimeout(trigger, 7000);
  window.addEventListener("scroll", onScroll, { passive: true });
  function cleanup() { clearTimeout(timer); window.removeEventListener("scroll", onScroll); }
}

/* ---------- Reusable product card ---------- */
export function productCard(p, { reveal = true } = {}) {
  const b = brandById(p.brand);
  const hasHover = p.image.hover && p.image.hover !== p.image.front;
  return `
    <article class="card"${reveal ? " data-reveal" : ""}>
      <div class="card__media">
        ${p.badge ? `<span class="card__badge">${p.badge}</span>` : ""}
        <a class="card__link" href="product.html?id=${p.id}" data-cursor-label="View" aria-label="${p.name}">
          <img class="is-front" src="${p.image.front}" alt="${p.name}" loading="lazy">
          ${hasHover ? `<img class="is-hover" src="${p.image.hover}" alt="" loading="lazy" aria-hidden="true">` : ""}
        </a>
        <div class="card__quick">
          <button class="btn btn--light btn--block btn--sm" data-add="${p.id}">Add to cart · ${money(p.price)}</button>
        </div>
      </div>
      <div class="card__body">
        <div>
          <div class="card__brand">${b ? b.name : p.brand}</div>
          <a class="card__name" href="product.html?id=${p.id}">${p.name}</a>
          <div class="card__notes">${p.notes.slice(0, 3).join(", ")}</div>
        </div>
        <div class="card__price">${money(p.price)}</div>
      </div>
    </article>`;
}

/* wire any [data-add] within a root to the cart */
export function bindAddButtons(root, cart) {
  root.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    e.preventDefault();
    cart.add(btn.dataset.add, 1);
    const original = btn.dataset.label || btn.innerHTML;
    btn.dataset.label = original;
    btn.textContent = "Added to cart";
    clearTimeout(btn.__t);
    btn.__t = setTimeout(() => { if (btn.isConnected) btn.innerHTML = original; }, 1400);
  });
}
