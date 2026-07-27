/* ============================================================
   THE PAUSE : Home page orchestrator
   ============================================================ */

import { MOODS, CATEGORIES, BRANDS, bestSellers, PRODUCTS } from "./data.js";
import { icon, hydrateIcons } from "./icons.js";
import { mountHeader, mountFooter, productCard, bindAddButtons, mountWelcome } from "./components.js";
import * as cart from "./cart.js";
import { initMotion, heroIntro } from "./motion.js";
import { initHeroAmbient } from "./ambient.js";

/* ---------- Chrome ---------- */
const header = mountHeader();
header.classList.add("header--over-hero");
mountFooter();
cart.mountDrawer();
document.querySelector("[data-open-cart]").addEventListener("click", cart.openDrawer);
cart.bindCountBadge(document.querySelector(".cart-count"));
bindAddButtons(document.body, cart);

/* ---------- Mood section ---------- */
const moodImg = {
  "slower-nights": "assets/lifestyle/bedroom-candle.webp",
  "focus": "assets/lifestyle/quiet-ritual-incense.webp",
  "clear-space": "assets/lifestyle/find-your-scent.webp",
  "soft-reset": "assets/lifestyle/incense-ritual.webp",
};
const moodsMount = document.querySelector('[data-mount="moods"]');
if (moodsMount) {
  moodsMount.innerHTML = MOODS.map((m, i) => `
    <a class="mood" href="shop.html?mood=${m.id}" data-mood="${m.id}" data-reveal="1" data-cursor-label="Explore">
      <div class="mood__media"><img src="${moodImg[m.id]}" alt="" loading="lazy"></div>
      <span class="mood__icon">${icon("mood-" + m.id)}</span>
      <span class="mood__arrow">${icon("arrow-ne")}</span>
      <h3 class="mood__name">${m.name}</h3>
      <p class="mood__line">${m.line}</p>
      <span class="mood__note">${m.note}</span>
    </a>`).join("");
}

/* ---------- Categories ---------- */
const catsMount = document.querySelector('[data-mount="categories"]');
if (catsMount) {
  catsMount.innerHTML = CATEGORIES.map((c) => `
    <a class="cat${c.tone === "light" ? " cat--light" : ""}" href="shop.html?category=${c.id}" data-reveal="1" data-cursor-label="Shop">
      <div class="cat__media"><img src="${c.img}" alt="" loading="lazy"></div>
      <span class="cat__icon">${icon(c.icon)}</span>
      <span class="cat__arrow">${icon("arrow-ne")}</span>
      <div class="cat__body">
        <span class="cat__name">${c.name}</span>
        <span class="cat__line">${c.line}</span>
      </div>
    </a>`).join("");
}

/* ---------- Best sellers ---------- */
const bestMount = document.querySelector('[data-mount="best"]');
if (bestMount) {
  const picks = bestSellers().slice(0, 4);
  bestMount.innerHTML = picks.map((p) => productCard(p)).join("");
}

/* ---------- Brands ---------- */
const brandsMount = document.querySelector('[data-mount="brands"]');
if (brandsMount) {
  brandsMount.innerHTML = BRANDS.map((b) => `
    <a class="brandcard" href="brands.html#${b.id}" data-reveal="1" data-cursor-label="Discover">
      <div class="brandcard__media"><img src="${b.card}" alt="${b.name}" loading="lazy"></div>
      <span class="brandcard__origin">${b.origin}</span>
      <h3 class="brandcard__name">${b.name}</h3>
      <span class="brandcard__tag">${b.tagline}</span>
      <p class="brandcard__story">${b.story}</p>
    </a>`).join("");
}

/* ---------- The essence, explained ---------- */
const essence = document.querySelector("[data-essence]");
if (essence) {
  const spots = [...essence.querySelectorAll(".essence__spot, .essence__rail button, .essence__diagram [data-act]")];
  const panels = [...essence.querySelectorAll("[data-act-panel]")];
  const dots = [...essence.querySelectorAll(".essence__nav button")];
  const HOLD = 5500;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches || location.search.includes("still");
  let current = -1, timer = null;

  const films = [...essence.querySelectorAll("[data-act-media]")];
  const diagram = essence.querySelector("[data-essence-diagram]");
  const select = (i, { user = false } = {}) => {
    if (i === current) return;
    current = i;
    if (diagram) diagram.dataset.live = i;
    spots.forEach((s) => s.classList.toggle("is-active", +s.dataset.act === i));
    panels.forEach((p) => p.classList.toggle("is-active", +p.dataset.actPanel === i));
    films.forEach((f) => {
      const active = +f.dataset.actMedia === i;
      f.classList.toggle("is-active", active);
      const v = f.querySelector("video");
      if (!v) return;
      if (active && !reduced) { v.muted = true; v.play().catch(() => {}); }
      else v.pause();
    });
    dots.forEach((d) => {
      const active = +d.dataset.act === i;
      d.classList.remove("is-active");
      if (active) requestAnimationFrame(() => d.classList.add("is-active"));
      d.setAttribute("aria-selected", String(active));
    });
    if (user) hold(true);
  };
  const advance = () => select((current + 1) % panels.length);
  const hold = (longer) => {
    clearInterval(timer);
    if (reduced) return;
    timer = setInterval(advance, longer ? HOLD * 2 : HOLD);
  };
  [...spots, ...dots].forEach((b) => {
    b.addEventListener("click", () => select(+b.dataset.act, { user: true }));
    b.addEventListener("pointerenter", () => select(+b.dataset.act, { user: true }));
    // svg groups are not native buttons: give them keyboard parity
    if (b.hasAttribute("tabindex")) {
      b.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(+b.dataset.act, { user: true }); }
      });
    }
  });
  essence.addEventListener("pointerenter", () => clearInterval(timer));
  essence.addEventListener("pointerleave", () => hold(false));
  select(0);
  hold(false);
}

/* ---------- Icons + motion ---------- */
hydrateIcons();
initMotion({ header });
heroIntro();
initHeroAmbient(document.querySelector(".hero"));
mountWelcome();

// hero video: play (muted) unless the visitor prefers reduced motion
const heroVideo = document.querySelector(".hero__media video");
if (heroVideo) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    heroVideo.removeAttribute("autoplay");
    heroVideo.pause();
  } else {
    heroVideo.muted = true; // required for autoplay in most browsers
    heroVideo.setAttribute("muted", "");
    const tryPlay = () => heroVideo.play().catch(() => {});
    tryPlay();
    heroVideo.addEventListener("loadeddata", tryPlay, { once: true });
    heroVideo.addEventListener("canplay", tryPlay, { once: true });
    document.addEventListener("click", tryPlay, { once: true }); // last-resort user-gesture unlock
  }
}

/* keep ScrollTrigger honest once images settle */
window.addEventListener("load", () => window.ScrollTrigger && window.ScrollTrigger.refresh());
