/* ============================================================
   THE PAUSE : Brands page
   ============================================================ */

import { BRANDS, byBrand } from "./data.js";
import { icon, hydrateIcons } from "./icons.js";
import { mountHeader, mountFooter, bindAddButtons } from "./components.js";
import * as cart from "./cart.js";
import { initMotion } from "./motion.js";

const header = mountHeader();
mountFooter();
cart.mountDrawer();
document.querySelector("[data-open-cart]").addEventListener("click", cart.openDrawer);
cart.bindCountBadge(document.querySelector(".cart-count"));
bindAddButtons(document.body, cart);

const rows = document.querySelector("[data-brand-rows]");
rows.innerHTML = BRANDS.map((b) => {
  const n = byBrand(b.id).length;
  return `
    <article class="brand-row" id="${b.id}" data-reveal="1">
      <a class="brand-row__media" href="shop.html?brand=${b.id}" data-cursor-label="View" aria-label="Shop ${b.name}"><img src="${b.card}" alt="" loading="lazy"></a>
      <div>
        <p class="brand-row__origin">${b.origin} · ${n} ${n === 1 ? "piece" : "pieces"}</p>
        <h2><a href="shop.html?brand=${b.id}">${b.name}</a></h2>
        <p class="brand-row__tag">${b.tagline}</p>
        <p>${b.story}</p>
        <a class="btn btn--ghost brand-row__link" href="shop.html?brand=${b.id}">Shop ${b.name} ${icon("arrow")}</a>
      </div>
    </article>`;
}).join("");

hydrateIcons();
initMotion({ header });
