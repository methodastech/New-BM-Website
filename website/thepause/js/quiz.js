/* ============================================================
   THE PAUSE : Find Your Scent
   Three gentle questions, framed the way the house frames it:
   your space, your pace, and the mood you want to create.
   Robust transitions (never stick), reduced-motion aware.
   ============================================================ */

import { PRODUCTS } from "./data.js";
import { icon, hydrateIcons } from "./icons.js";
import { mountHeader, mountFooter, productCard, bindAddButtons } from "./components.js";
import * as cart from "./cart.js";
import { initMotion } from "./motion.js";

const header = mountHeader();
mountFooter();
cart.mountDrawer();
document.querySelector("[data-open-cart]").addEventListener("click", cart.openDrawer);
cart.bindCountBadge(document.querySelector(".cart-count"));
bindAddButtons(document.body, cart);

const gsap = window.gsap;
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches || location.search.includes("still");

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
      { label: "Full and focused", hint: "A head that needs clearing", mood: "focus", img: IMG.airy },
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

const answers = {};
let step = 0;
let busy = false;
let stepStarted = false;
const root = document.querySelector("[data-quiz]");

/* ---------- Step ---------- */
function renderStep() {
  const q = QUESTIONS[step];
  root.innerHTML = `
    <div class="quiz__progress">
      ${QUESTIONS.map((_, i) => `<span class="quiz__dot ${i < step ? "is-done" : ""} ${i === step ? "is-active" : ""}"><span></span></span>`).join("")}
    </div>
    <div class="quiz__step">
      <p class="quiz__count">${q.eyebrow} · Question ${step + 1} of ${QUESTIONS.length}</p>
      <h1 class="quiz__q" tabindex="-1">${q.title}</h1>
      <div class="quiz__options">
        ${q.options.map((o, i) => `
          <button class="quiz-opt" data-opt="${i}">
            <div class="quiz-opt__media"><img src="${o.img}" alt="" loading="eager"></div>
            <span class="quiz-opt__idx">0${i + 1}</span>
            <span class="quiz-opt__label">${o.label}</span>
            <span class="quiz-opt__hint">${o.hint}</span>
          </button>`).join("")}
      </div>
      ${step > 0 ? `<button class="quiz__back" data-back>${icon("arrow")} Back</button>` : ""}
    </div>`;

  root.querySelectorAll("[data-opt]").forEach((b) => {
    b.addEventListener("click", () => choose(q, q.options[+b.dataset.opt]));
  });
  const back = root.querySelector("[data-back]");
  if (back) back.addEventListener("click", goBack);

  hydrateIcons();
  if (gsap && !REDUCED) {
    gsap.from(".quiz__q", { y: 24, opacity: 0, duration: 0.7, ease: "power3.out", clearProps: "all" });
    gsap.from(".quiz-opt", { y: 30, opacity: 0, duration: 0.7, stagger: 0.08, ease: "power3.out", delay: 0.05, clearProps: "all" });
  }
  if (stepStarted) requestAnimationFrame(() => root.querySelector(".quiz__q")?.focus({ preventScroll: true }));
  stepStarted = true;
}

/* ---------- Robust advance (never sticks) ---------- */
function advance() {
  if (busy) return;
  busy = true;
  const el = root.querySelector(".quiz__step, .quiz__result");
  const done = () => {
    try { (step < QUESTIONS.length ? renderStep : renderResult)(); }
    finally { busy = false; }
  };
  if (gsap && !REDUCED && el) {
    gsap.to(el, { opacity: 0, y: -14, duration: 0.28, ease: "power2.in" });
    setTimeout(done, 300); // timeout, not gsap onComplete, so it can never hang
  } else {
    done();
  }
}
function choose(q, opt) { answers[q.key] = opt; step++; advance(); }
function goBack() { if (step > 0) { step--; advance(); } }

/* ---------- Scoring ---------- */
function scoreProducts() {
  const moods = [answers.space?.mood, answers.pace?.mood].filter(Boolean);
  const fam = answers.mood?.family;
  const famNotes = fam ? FAMILIES[fam] : [];
  return PRODUCTS.map((p) => {
    let s = 0;
    moods.forEach((m) => { if (p.moods.includes(m)) s += 3; });
    s += p.notes.filter((n) => famNotes.includes(n)).length * 2;
    if (p.badge === "Best Seller") s += 0.5;
    return { p, s };
  }).sort((a, b) => b.s - a.s);
}

/* ---------- Result ---------- */
function renderResult() {
  const picks = scoreProducts().slice(0, 3).map((r) => r.p);
  const moodLine = (answers.mood?.label || "quiet").toLowerCase();
  const spaceLine = (answers.space?.label || "your space").toLowerCase();

  root.innerHTML = `
    <div class="quiz__result">
      <div class="quiz__result-head">
        <p class="quiz__count">Your pause</p>
        <h1 tabindex="-1">A ${moodLine} note for <em>${spaceLine}.</em></h1>
        <p>A small handful, matched to your space, your pace, and the mood you want to create. Begin with one.</p>
      </div>
      <div class="product-grid quiz__result-grid">
        ${picks.map((p) => productCard(p, { reveal: false })).join("")}
      </div>
      <div class="quiz__result-actions">
        <a class="btn" href="shop.html">Explore the full edit</a>
        <button class="quiz__restart link" data-restart>${icon("arrow-down")} Take it again</button>
      </div>
    </div>`;

  root.querySelector("[data-restart]").addEventListener("click", () => {
    step = 0; for (const k in answers) delete answers[k];
    advance();
  });

  hydrateIcons();
  if (gsap && !REDUCED) {
    gsap.from(".quiz__result-head > *", { y: 24, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power3.out", clearProps: "all" });
    gsap.from(".quiz__result .card", { y: 34, opacity: 0, duration: 0.9, stagger: 0.12, ease: "power3.out", delay: 0.2, clearProps: "all" });
  }
  requestAnimationFrame(() => root.querySelector(".quiz__result-head h1")?.focus({ preventScroll: true }));
}

renderStep();
initMotion({ header });
