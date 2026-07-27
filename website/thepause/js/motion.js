/* ============================================================
   THE PAUSE : Motion
   Lenis smooth scroll + GSAP. Slow, eased, subtle.
   Everything degrades gracefully with reduced motion.
   ============================================================ */

const STILL = location.search.includes("still"); // QA flag: freeze motion for stable capture
const REDUCED = STILL || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

/* ---------- Smooth scroll ---------- */
export function initSmoothScroll() {
  if (REDUCED || !window.Lenis || !gsap || !ScrollTrigger) return null;
  const lenis = new window.Lenis({
    lerp: 0.085,          // frame-independent smoothing, buttery
    smoothWheel: true,
    wheelMultiplier: 0.95,
    touchMultiplier: 1.5,
  });
  window.__lenis = lenis;
  lenis.on("scroll", () => ScrollTrigger && ScrollTrigger.update());
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // anchor links go through lenis
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: -80, duration: 1.3 }); }
  });
  return lenis;
}

/* ---------- Split a plain-text element into masked lines ----------
   Uses real space text-nodes so words never run together.        */
export function splitLines(el) {
  if (!el || el.dataset.split === "done") return [];
  const words = el.textContent.trim().split(/\s+/);
  el.textContent = "";
  const holders = words.map((w, i) => {
    const span = document.createElement("span");
    span.textContent = w;               // inline (default) so whitespace flows normally
    el.appendChild(span);
    if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    return span;
  });
  // group words into visual lines by vertical offset
  const lines = [];
  let cur = null, top = null;
  holders.forEach((s) => {
    const t = s.offsetTop;
    if (top === null || Math.abs(t - top) > 2) { cur = []; lines.push(cur); top = t; }
    cur.push(s);
  });
  el.textContent = "";
  const lineSpans = lines.map((group) => {
    const mask = document.createElement("span");
    mask.className = "split-line";
    const inner = document.createElement("span");
    group.forEach((s, i) => {
      inner.appendChild(s);
      if (i < group.length - 1) inner.appendChild(document.createTextNode(" "));
    });
    mask.appendChild(inner);
    el.appendChild(mask);
    return inner;
  });
  el.dataset.split = "done";
  return lineSpans;
}

/* ---------- Hero intro: fast, no loader wall ---------- */
export function heroIntro() {
  const hero = document.querySelector(".hero");
  if (!hero) return;
  if (REDUCED) return;

  const media = hero.querySelector(".hero__media img, .hero__media video");
  const lines = hero.querySelectorAll(".hero__title .split-line > span");
  const fadeUps = hero.querySelectorAll("[data-hero-fade]");

  gsap.set(lines, { yPercent: 115 });
  gsap.set(fadeUps, { y: 24, opacity: 0 });
  if (media) gsap.set(media, { opacity: 0 });

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  if (media) tl.to(media, { opacity: 1, duration: 1.4, ease: "power2.out" }, 0); // gentle fade, no zoom
  tl.to(lines, { yPercent: 0, duration: 1.0, stagger: 0.09 }, 0.15)
    .to(fadeUps, { y: 0, opacity: 1, duration: 0.9, stagger: 0.1 }, 0.5);
  return tl;
}

/* ---------- Scroll reveals ---------- */
export function initReveals() {
  const els = gsap ? gsap.utils.toArray("[data-reveal]") : [];
  if (REDUCED || !gsap) {
    document.querySelectorAll("[data-reveal], [data-split-reveal]").forEach((el) => { el.style.opacity = 1; el.style.transform = "none"; });
    return;
  }
  els.forEach((el) => {
    gsap.fromTo(el,
      { y: 30, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 1.0, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
  });

  // headline reveals for [data-split-reveal] : whole-block rise.
  // (No per-line splitting: it wraps unpredictably and is not worth the fragility.)
  gsap.utils.toArray("[data-split-reveal]").forEach((el) => {
    gsap.fromTo(el, { y: 28, opacity: 0 }, {
      y: 0, opacity: 1, duration: 1.0, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 86%", once: true },
    });
  });

  // gentle parallax for [data-parallax]
  gsap.utils.toArray("[data-parallax]").forEach((el) => {
    const depth = parseFloat(el.dataset.parallax) || 0.15;
    gsap.to(el, {
      yPercent: -depth * 100,
      ease: "none",
      scrollTrigger: { trigger: el.closest("section") || el, start: "top bottom", end: "bottom top", scrub: true },
    });
  });
}

/* ---------- Header behavior ---------- */
export function initHeader(header) {
  if (!header) return;
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("is-solid", y > 40);
    // the bar retires on the way down and returns the moment you scroll up
    const menuOpen = document.querySelector(".mobile-menu.is-open");
    if (!menuOpen) {
      if (y > lastY && y > 220) header.classList.add("is-hidden");
      else if (y < lastY - 2 || y <= 220) header.classList.remove("is-hidden");
    }
    lastY = y;
  };
  // capture on document catches the scroll no matter which element Lenis drives
  document.addEventListener("scroll", onScroll, { passive: true, capture: true });
  if (window.__lenis?.on) window.__lenis.on("scroll", onScroll);
  onScroll();
}

/* ---------- Custom cursor (dot + trailing ring) ---------- */
export function initCursor() {
  if (REDUCED || window.matchMedia("(pointer: coarse)").matches) return;
  const dot = document.createElement("div"); dot.className = "cursor-dot";
  const ring = document.createElement("div"); ring.className = "cursor-ring";
  ring.innerHTML = `<span class="cursor__label"></span>`;
  document.body.append(dot, ring);
  const label = ring.querySelector(".cursor__label");

  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
  window.addEventListener("mousemove", (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    dot.classList.add("is-active"); ring.classList.add("is-active");
  });
  const loop = () => {
    rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  };
  loop();

  document.addEventListener("mouseover", (e) => {
    const labelEl = e.target.closest("[data-cursor-label]");
    const hoverEl = e.target.closest("a, button, [data-cursor], input, select");
    if (labelEl) {
      ring.classList.add("is-label"); ring.classList.remove("is-hover"); dot.classList.add("is-hidden");
      label.textContent = labelEl.dataset.cursorLabel;
    } else if (hoverEl) {
      ring.classList.add("is-hover"); ring.classList.remove("is-label"); dot.classList.remove("is-hidden");
    } else {
      ring.classList.remove("is-hover", "is-label"); dot.classList.remove("is-hidden");
    }
  });
  document.addEventListener("mouseleave", () => { dot.classList.remove("is-active"); ring.classList.remove("is-active"); });
}

/* ---------- Page transition (fade through paper) ---------- */
export function initPageTransition() {
  if (REDUCED || !gsap) return;
  const ov = document.createElement("div"); ov.className = "pt-overlay"; document.body.appendChild(ov);
  // exit-only: cover before navigating. On bfcache restore the overlay comes back
  // opaque, so fade it out then.
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) {
      gsap.set(ov, { opacity: 1, visibility: "visible" });
      gsap.to(ov, { opacity: 0, duration: 0.6, ease: "power2.out", onComplete: () => gsap.set(ov, { visibility: "hidden" }) });
    }
  });
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a || e.defaultPrevented) return; // demo locks and the scent journey handle their own links
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto") || href.startsWith("tel") ||
        a.target === "_blank" || a.hasAttribute("download") || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    gsap.set(ov, { visibility: "visible" });
    gsap.to(ov, { opacity: 1, duration: 0.45, ease: "power2.inOut", onComplete: () => { window.location.href = href; } });
  });
}

/* ---------- Scroll progress line ---------- */
export function initScrollProgress() {
  const bar = document.createElement("div"); bar.className = "scroll-progress"; document.body.appendChild(bar);
  const update = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
  };
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
}

/* ---------- Magnetic buttons ---------- */
export function initMagnetic() {
  if (REDUCED || window.matchMedia("(pointer: coarse)").matches) return;
  document.querySelectorAll("[data-magnetic]").forEach((el) => {
    const strength = parseFloat(el.dataset.magnetic) || 0.35;
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const mx = e.clientX - (r.left + r.width / 2);
      const my = e.clientY - (r.top + r.height / 2);
      gsap.to(el, { x: mx * strength, y: my * strength, duration: 0.5, ease: "power3.out" });
    });
    el.addEventListener("mouseleave", () => gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,0.4)" }));
  });
}

/* ---------- Marquee ---------- */
export function initMarquee() {
  document.querySelectorAll(".marquee").forEach((m) => {
    const track = m.querySelector(".marquee__track");
    if (!track) return;
    track.innerHTML += track.innerHTML; // duplicate for seamless loop
    if (REDUCED || !gsap) return;
    const w = track.scrollWidth / 2;
    gsap.to(track, { x: -w, duration: 26, ease: "none", repeat: -1 });
  });
}

/* ---------- Footer reveal ---------- */
export function initFooterReveal() {
  if (REDUCED || !gsap) return;
  const footer = document.querySelector(".footer");
  if (!footer) return;
  const items = footer.querySelectorAll(".footer__brand, .footer__col, .footer__bottom");
  gsap.from(items, {
    y: 34, opacity: 0, duration: 0.9, stagger: 0.07, ease: "power3.out",
    scrollTrigger: { trigger: footer, start: "top 88%", once: true },
  });
}

/* ---------- Icon life: draw-on when icons enter the viewport ---------- */
export function initIconLife() {
  const hosts = document.querySelectorAll(
    ".value, .mood__icon, .cat__icon, .feature-pill, .essence__act-icon, .post__meta, .tenper"
  );
  if (!hosts.length) return;
  if (REDUCED || !window.IntersectionObserver) {
    hosts.forEach((h) => h.classList.add("ic-in", "is-in"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en, idx) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      setTimeout(() => el.classList.add("ic-in", "is-in"), (idx % 5) * 110);
      io.unobserve(el);
    });
  }, { threshold: 0.4 });
  hosts.forEach((h) => io.observe(h));
}

/* ---------- The literal 10%: counts itself up, underlines in pastel ---------- */
export function initTenPercent() {
  const el = document.querySelector("[data-tenper]");
  if (!el) return;
  if (REDUCED || !window.IntersectionObserver) { el.classList.add("is-in"); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      io.unobserve(el);
      let n = 0;
      const tick = () => {
        el.textContent = n + "%";
        if (n < 10) { n += 1; setTimeout(tick, 55 + n * 14); }
        else el.classList.add("is-in");
      };
      tick();
    });
  }, { threshold: 0.7 });
  io.observe(el);
}

/* ---------- Hero film ----------
   The autoplay attribute is not enough on its own: iOS low-power mode and some
   mobile browsers refuse it silently, leaving the poster frozen on screen. Kick
   playback explicitly, retry on the first interaction, and pause it off-screen
   so the loop is not burning decode while nobody is looking. */
export function initHeroFilm() {
  const v = document.querySelector(".hero__media video");
  if (!v) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    v.removeAttribute("autoplay");
    v.pause();
    return;
  }

  const kick = () => v.play().catch(() => {});
  kick();

  /* The 2K loop is a few MB, so the first kick can land before enough of it has
     buffered and quietly do nothing. Retry as data arrives, and poll briefly:
     a silently-rejected play() leaves the poster frozen, which reads as broken. */
  v.addEventListener("loadeddata", kick, { once: true });
  v.addEventListener("canplay", kick, { once: true });
  let tries = 0;
  const retry = setInterval(() => {
    if (!v.paused || ++tries > 10) clearInterval(retry); else kick();
  }, 400);

  const onFirstTouch = () => { kick(); window.removeEventListener("pointerdown", onFirstTouch); };
  window.addEventListener("pointerdown", onFirstTouch, { once: true, passive: true });

  /* Pause only when the hero is genuinely gone from view. A threshold-based test
     fires false negatives while the hero is still on screen and stops the loop
     dead, so key off a zero ratio and keep a margin of slack. */
  const io = new IntersectionObserver(([e]) => {
    if (e.intersectionRatio > 0) kick(); else v.pause();
  }, { threshold: 0, rootMargin: "200px" });
  io.observe(v);

  /* Browsers pause muted autoplay video in a backgrounded tab and do not always
     resume it on return, which leaves the hero frozen on a mid-loop frame. */
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) kick();
  });
}

/* ---------- Boot all generic motion ----------
   Each step isolated so one failure never blocks the rest (content stays visible). */
export function initMotion({ header } = {}) {
  const run = (fn) => { try { fn(); } catch (e) { /* keep going */ } };
  run(initSmoothScroll);
  run(() => initHeader(header));
  run(initReveals);
  run(initCursor);
  run(initMagnetic);
  run(initMarquee);
  run(initPageTransition);
  run(initScrollProgress);
  run(initFooterReveal);
  run(initIconLife);
  run(initTenPercent);
  run(initHeroFilm);
}
