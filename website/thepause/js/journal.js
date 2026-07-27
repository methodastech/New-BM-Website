/* ============================================================
   THE PAUSE : Journal (grid + article views)
   ============================================================ */

import { icon, hydrateIcons } from "./icons.js";
import { mountHeader, mountFooter } from "./components.js";
import * as cart from "./cart.js";
import { initMotion } from "./motion.js";

const header = mountHeader();
mountFooter();
cart.mountDrawer();
document.querySelector("[data-open-cart]").addEventListener("click", cart.openDrawer);
cart.bindCountBadge(document.querySelector(".cart-count"));

const POSTS = [
  {
    slug: "doing-less", tag: "Slow living", read: "4 min",
    title: "The quiet case for doing less",
    img: "assets/lifestyle/common-sense-incense-life.webp",
    excerpt: "On rooms that ask nothing of you, and the small rituals that give the day its shape.",
    body: [
      "There is a particular kind of tiredness that comes not from doing too much, but from being asked too much. The phone, the feed, the open tabs. A room can ask things of you too, in its clutter and its noise.",
      "We think a home should offer less. Fewer objects, chosen with more care. A single candle instead of ten. One scent at a time. The luxury is not in abundance but in the space around each thing.",
      "Start small. Clear one surface. Light one candle. Let the room hold a single note, and notice how much quieter your own thoughts become when the space around them is quiet too.",
    ],
  },
  {
    slug: "end-of-day", tag: "Ritual", read: "3 min",
    title: "A ritual for the end of the day",
    img: "assets/lifestyle/incense-ritual.webp",
    excerpt: "How to light incense with intention, and let the smoke mark the close of the hours.",
    body: [
      "A ritual is just a small action, repeated, that means more than itself. Lighting incense at dusk is one of the oldest. It says, gently, that the working part of the day is over.",
      "Rest the plank on a holder. Light the tip, wait for it to catch, then blow out the flame. Watch the first thread of smoke find the ceiling. That is the whole ceremony. It asks for a minute, no more.",
      "Do it at the same time each evening and it becomes a hinge in your day, a soft line drawn between the hours that belong to others and the hours that belong to you.",
    ],
  },
  {
    slug: "read-a-scent", tag: "Scent 101", read: "5 min",
    title: "How to read a scent",
    img: "assets/lifestyle/bedroom-candle.webp",
    excerpt: "Top, heart and base. A short field guide to the language of fragrance.",
    body: [
      "Every scent unfolds in three acts. The top note is what you meet first, bright and quick to fade. The heart is the middle, the character of the thing. The base is what lingers, low and warm, long after the rest has gone.",
      "When you meet a new fragrance, wait. Give it ten minutes. The scent you smell at first is rarely the scent you will live with. It is the base that stays with a room, and with you.",
      "There is no right answer, only what fits your space, your pace, and the way you want to feel. Trust the note that makes your shoulders drop an inch.",
    ],
  },
  {
    slug: "unhurried-evening", tag: "Slow living", read: "4 min",
    title: "In praise of the unhurried evening",
    img: "assets/lifestyle/living-room-candle.webp",
    excerpt: "The evening does not need to be productive. It needs only to be yours.",
    body: [
      "Somewhere we decided that even rest should be efficient. The optimised evening, the wind down routine, the sleep score. But an evening is not a task to complete.",
      "Let one be slow. Light a candle before you need to. Sit with a scent and nothing else. The point is not to do the evening well. The point is simply to be in it.",
    ],
  },
  {
    slug: "finnish-forest", tag: "The makers", read: "6 min",
    title: "Notes from a Finnish forest",
    img: "assets/brand/hetkinen-card.webp",
    excerpt: "Where Hetkinen begins: cold air, still water, resin and pine.",
    body: [
      "Hetkinen means a moment, in Finnish. The brand was born in the forest, and you can smell it. Cold clean air, the resin of standing pines, the stillness of a lake at first light.",
      "Every blend is made slowly, by hand, in small batches. Nothing is rushed, because the forest is not rushed. To light one is to borrow a little of that northern calm.",
    ],
  },
  {
    slug: "empty-shelf", tag: "Clear space", read: "3 min",
    title: "The art of the empty shelf",
    img: "assets/lifestyle/find-your-scent.webp",
    excerpt: "Emptiness is not absence. It is room, kept on purpose.",
    body: [
      "An empty shelf can feel like a failure, something not yet filled. But space kept empty on purpose is a quiet kind of confidence. It says there is enough already.",
      "Leave a shelf with one object on it. A carved jade pear, a single candle. Let the emptiness around it do the work. The object will look more like itself, and so, somehow, will the room.",
    ],
  },
];

const grid = document.querySelector("[data-journal-grid]");
const article = document.querySelector("[data-article]");
const intro = document.querySelector("[data-journal-intro]");
const slug = new URLSearchParams(location.search).get("post");

const post = slug ? POSTS.find((p) => p.slug === slug) : null;

if (slug && post) {
  // ---- single article, all elements share one 820px axis ----
  document.title = `${post.title} · THE PAUSE`;
  intro.style.display = "none";
  grid.style.display = "none";
  const related = POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);
  article.innerHTML = `
    <div class="article-wrap">
      <nav class="crumb"><a href="journal.html">Journal</a> / <span>${post.tag}</span></nav>
      <header class="article-head" data-reveal>
        <p class="post__meta">${post.tag} · ${post.read}</p>
        <h1 class="article-title">${post.title}</h1>
        <p class="serif-lead article-standfirst">${post.excerpt}</p>
      </header>
      <div class="article-media" data-reveal>
        <img src="${post.img}" alt="A calm interior evoking ${post.tag.toLowerCase()}" loading="eager">
      </div>
      <div class="prose article-body" data-reveal>
        ${post.body.map((para) => `<p>${para}</p>`).join("")}
      </div>
    </div>
    <div class="article-related">
      <p class="eyebrow" style="justify-content:center;">Continue reading</p>
      <div class="journal-page__grid" style="margin-top:1.5rem;">
        ${related.map((p) => `
          <a class="post" href="journal.html?post=${p.slug}" data-reveal data-cursor-label="Read">
            <div class="post__media"><img src="${p.img}" alt="" loading="lazy"></div>
            <div class="post__meta">${p.tag} · ${p.read}</div>
            <h2 class="post__title">${p.title}</h2>
          </a>`).join("")}
      </div>
      <div class="article-back" data-reveal>
        <a class="link" href="journal.html">${icon("arrow-down")} Back to the journal</a>
      </div>
    </div>`;
} else if (slug && !post) {
  // ---- unknown slug: graceful not-found ----
  document.title = "Not found · THE PAUSE";
  intro.style.display = "none";
  grid.style.display = "none";
  article.innerHTML = `
    <div class="shop-empty" style="padding-block:6rem;">
      <span class="serif">We could not find that piece.</span>
      <p>It may have moved. <a class="link" href="journal.html">Return to the journal</a></p>
    </div>`;
} else {
  // ---- grid ----
  grid.innerHTML = POSTS.map((p) => `
    <a class="post" href="journal.html?post=${p.slug}" data-reveal data-cursor-label="Read">
      <div class="post__media"><img src="${p.img}" alt="" loading="lazy"></div>
      <div class="post__meta">${p.tag} · ${p.read}</div>
      <h2 class="post__title">${p.title}</h2>
      <p class="post__excerpt">${p.excerpt}</p>
    </a>`).join("");
}

hydrateIcons();
initMotion({ header });
