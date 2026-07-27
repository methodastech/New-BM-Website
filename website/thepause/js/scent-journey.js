/* ============================================================
   THE PAUSE : The Scent Journey (full screen overlay)
   Find Your Scent as a popup ritual, not a page.
   Breath intro, three questions, a quiet result.
   ============================================================ */

import { PRODUCTS } from "./data.js";
import { icon, hydrateIcons } from "./icons.js";
import { productCard } from "./components.js";

const REDUCED = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches || location.search.includes("still");

const IMG = {
  bedroom: "assets/lifestyle/bedroom-candle.webp",
  living: "assets/lifestyle/living-room-candle.webp",
  desk: "assets/lifestyle/quiet-ritual-incense.webp",
  airy: "assets/lifestyle/find-your-scent.webp",
  smoke: "assets/lifestyle/incense-ritual.webp",
  jade: "assets/brand/jade-deco-card.webp",
};

const FAMILIES = {
  "warm-woody": ["Amber","Cardamom","Soft Wood","Sandalwood","Cedar","Oak","Tobacco Leaf","Black Tea","Black Oolong","Myrrh"],
  "green-fresh": ["Pine","Cold Air","Green Leaf","Fig","Moss","Yuzu","White Tea","Vetiver","Bergamot","Eucalyptus","Dry Earth","Citrus Peel","Hyssop","Sea Salt","Neroli","Bamboo","Lily","Mint","Citrus"],
  "soft-floral": ["Rose","Lilac","Powder","Neroli","Musk","White Musk","Fig"],
  "smoke-resin": ["Palo Santo","Sweet Resin","Frankincense","Myrrh","Resin","Hinoki","Black Pepper"],
};

const QUESTIONS = [
  {
    key: "space", eyebrow: "Your space", title: "Which space are you scenting?",
    options: [
      { label: "The bedroom", hint: "For rest and slow evenings", mood: "slower-nights", img: IMG.bedroom },
      { label: "The living room", hint: "Where the day gathers", mood: "clear-space", img: IMG.living },
      { label: "A workspace", hint: "For focus and a clear head", mood: "focus", img: IMG.desk },
      { label: "A quiet corner", hint: "For rituals and reset", mood: "soft-reset", img: IMG.smoke },
    ],
  },
  {
    key: "pace", eyebrow: "Your pace", title: "What is the pace of your days?",
    options: [
      { label: "Slow and unhurried", hint: "Long evenings, early nights", mood: "slower-nights", img: IMG.bedroom },
      { label: "Full and focused", hint: "A head that needs clearing", mood: "focus", img: IMG.desk },
      { label: "Open and airy", hint: "Room to breathe", mood: "clear-space", img: IMG.airy },
      { label: "In need of a reset", hint: "A gentle turning of the page", mood: "soft-reset", img: IMG.smoke },
    ],
  },
  {
    key: "mood", eyebrow: "Your mood", title: "The mood you want to create?",
    options: [
      { label: "Warm and grounding", hint: "Amber, sandalwood, wood", family: "warm-woody", img: IMG.living },
      { label: "Fresh and clear", hint: "Pine, citrus, cool cedar", family: "green-fresh", img: IMG.airy },
      { label: "Soft and tender", hint: "Rose, fig, powder", family: "soft-floral", img: IMG.jade },
      { label: "Smoke and ritual", hint: "Palo santo, resin", family: "smoke-resin", img: IMG.smoke },
    ],
  },
];

let overlay = null;
let state = null;

function scoreProducts(answers) {
  const moods = [answers.space?.mood, answers.pace?.mood].filter(Boolean);
  const famNotes = answers.mood?.family ? FAMILIES[answers.mood.family] : [];
  return PRODUCTS.map((p) => {
    let s = 0;
    moods.forEach((m) => { if (p.moods.includes(m)) s += 3; });
    s += p.notes.filter((n) => famNotes.includes(n)).length * 2;
    if (p.badge === "Best Seller") s += 0.5;
    return { p, s };
  }).sort((a, b) => b.s - a.s).slice(0, 3).map((r) => r.p);
}

/* ---------- open / close ---------- */
export function openScentJourney() {
  if (overlay) return;
  state = { step: -1, answers: {}, busy: false };
  overlay = document.createElement("div");
  overlay.className = "journey";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "The Scent and Space Quiz");
  overlay.innerHTML = `
    <div class="journey__veil"></div>
    <div class="journey__inner">
      <header class="journey__bar">
        <span class="journey__mark">The Scent Journey</span>
        <span class="journey__steps" data-journey-steps></span>
        <button class="icon-btn journey__close" data-journey-close aria-label="Close">${icon("close")}</button>
      </header>
      <div class="journey__stage" data-journey-stage></div>
      <div class="journey__breath" aria-hidden="true"><i></i></div>
    </div>`;
  document.body.append(overlay);
  document.documentElement.classList.add("journey-open");
  window.__lenis?.stop();

  overlay.querySelector("[data-journey-close]").addEventListener("click", closeScentJourney);
  overlay.addEventListener("keydown", (e) => { if (e.key === "Escape") closeScentJourney(); });

  const g = window.gsap;
  if (g && !REDUCED()) {
    g.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out" });
    g.fromTo(overlay.querySelector(".journey__inner"), { y: 26 }, { y: 0, duration: 0.7, ease: "power3.out", clearProps: "transform" });
  }
  renderIntro();
  requestAnimationFrame(() => overlay.querySelector("[data-journey-close]").focus());
}

export function closeScentJourney() {
  if (!overlay) return;
  const el = overlay;
  overlay = null;
  document.documentElement.classList.remove("journey-open");
  window.__lenis?.start();
  const g = window.gsap;
  if (g && !REDUCED()) {
    g.to(el, { opacity: 0, duration: 0.4, ease: "power2.in", onComplete: () => el.remove() });
    setTimeout(() => el.isConnected && el.remove(), 600);
  } else {
    el.remove();
  }
}

/* ---------- stages ---------- */
function stage() { return overlay?.querySelector("[data-journey-stage]"); }
function stepsEl() { return overlay?.querySelector("[data-journey-steps]"); }

function swap(renderNext) {
  if (!overlay || state.busy) return;
  state.busy = true;
  const g = window.gsap;
  const current = stage().firstElementChild;
  const done = () => {
    try { renderNext(); } finally { state.busy = false; }
  };
  if (g && !REDUCED() && current) {
    g.to(current, { opacity: 0, y: -18, duration: 0.3, ease: "power2.in" });
    setTimeout(done, 310);
  } else {
    done();
  }
}

function enter(el, targets) {
  const g = window.gsap;
  if (g && !REDUCED()) {
    g.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power2.out", clearProps: "opacity" });
    if (targets) g.fromTo(el.querySelectorAll(targets), { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, stagger: 0.07, ease: "power3.out", delay: 0.08, clearProps: "all" });
  }
}

function renderIntro() {
  stepsEl().textContent = "";
  stage().innerHTML = `
    <section class="journey__panel journey__intro">
      <p class="eyebrow" data-j>Find your scent</p>
      <h2 class="journey__title" data-j>First, <em>a breath.</em></h2>
      <p class="journey__lead" data-j>Three quiet questions. Your space, your pace, and the mood you want to create. It takes less than a minute.</p>
      <button class="btn journey__begin" data-j data-journey-begin>Begin the journey</button>
    </section>`;
  stage().querySelector("[data-journey-begin]").addEventListener("click", () => { state.step = 0; swap(renderStep); });
  enter(stage().firstElementChild, "[data-j]");
}

function renderStep() {
  const q = QUESTIONS[state.step];
  stepsEl().textContent = `0${state.step + 1} / 0${QUESTIONS.length}`;
  stage().innerHTML = `
    <section class="journey__panel">
      <p class="eyebrow" data-j>${q.eyebrow}</p>
      <h2 class="journey__title" data-j tabindex="-1">${q.title}</h2>
      <div class="journey__options">
        ${q.options.map((o, i) => `
          <button class="journey-opt" data-opt="${i}" data-j>
            <span class="journey-opt__media"><img src="${o.img}" alt=""></span>
            <span class="journey-opt__idx">0${i + 1}</span>
            <span class="journey-opt__label">${o.label}</span>
            <span class="journey-opt__hint">${o.hint}</span>
          </button>`).join("")}
      </div>
      ${state.step > 0 ? `<button class="journey__back" data-back>${icon("arrow")} Back</button>` : ""}
    </section>`;

  stage().querySelectorAll("[data-opt]").forEach((b) => {
    b.addEventListener("click", () => {
      const g = window.gsap;
      if (g && !REDUCED()) g.to(b, { scale: 0.97, duration: 0.12, yoyo: true, repeat: 1, ease: "power1.inOut" });
      state.answers[q.key] = q.options[+b.dataset.opt];
      state.step++;
      swap(state.step < QUESTIONS.length ? renderStep : renderResult);
    });
  });
  stage().querySelector("[data-back]")?.addEventListener("click", () => { state.step--; swap(renderStep); });
  hydrateIcons();
  enter(stage().firstElementChild, "[data-j]");
  requestAnimationFrame(() => stage().querySelector(".journey__title")?.focus({ preventScroll: true }));
}

function renderResult() {
  const picks = scoreProducts(state.answers);
  const moodLine = (state.answers.mood?.label || "quiet").toLowerCase();
  const spaceLine = (state.answers.space?.label || "your space").toLowerCase();
  stepsEl().textContent = "Your pause";
  stage().innerHTML = `
    <section class="journey__panel journey__result">
      <p class="eyebrow" data-j>Chosen with care</p>
      <h2 class="journey__title" data-j tabindex="-1">A ${moodLine} note for <em>${spaceLine}.</em></h2>
      <p class="journey__lead" data-j>A small handful, matched to you. Begin with one.</p>
      <div class="product-grid journey__grid">
        ${picks.map((p) => productCard(p, { reveal: false })).join("")}
      </div>
      <div class="journey__actions" data-j>
        <a class="btn" href="shop.html">Explore the full edit</a>
        <button class="link" data-again>${icon("arrow-down")} Take it again</button>
      </div>
    </section>`;
  stage().querySelector("[data-again]").addEventListener("click", () => {
    state = { step: 0, answers: {}, busy: false };
    swap(renderStep);
  });
  hydrateIcons();
  enter(stage().firstElementChild, "[data-j], .card");
  requestAnimationFrame(() => stage().querySelector(".journey__title")?.focus({ preventScroll: true }));
}

/* ---------- global mount: every Find Your Scent link opens the journey ---------- */
export function mountScentJourney() {
  if (/find-your-scent\.html$/.test(location.pathname)) return; // the page itself keeps its inline quiz
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href*="find-your-scent.html"]');
    if (!a) return;
    e.preventDefault();
    openScentJourney();
  });
}
