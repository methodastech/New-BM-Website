/* ============================================================
   THE PAUSE : Search (client side)
   ============================================================ */

import { PRODUCTS, brandById } from "./data.js";
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

const input = document.querySelector("[data-search-input]");
const grid = document.querySelector("[data-search-grid]");
const count = document.querySelector("[data-search-count]");

function haystack(p) {
  const b = brandById(p.brand);
  return [p.name, b ? b.name : "", p.category, ...p.notes, ...p.moods].join(" ").toLowerCase();
}

let lastIds = null;
function run(q) {
  q = q.trim().toLowerCase();
  /* keep the address bar honest, so a search can be shared, bookmarked and
     reloaded. shop.js does the same for its filters. */
  const url = q ? `?q=${encodeURIComponent(q)}` : location.pathname;
  if (location.search !== (q ? `?q=${encodeURIComponent(q)}` : "")) history.replaceState(null, "", url);
  const list = q ? PRODUCTS.filter((p) => q.split(/\s+/).every((t) => haystack(p).includes(t))) : PRODUCTS;
  const ids = list.map((p) => p.id).join(",");
  if (ids === lastIds) return; // same result set: skip the teardown/rebuild
  lastIds = ids;
  count.textContent = q ? `${list.length} ${list.length === 1 ? "result" : "results"} for “${q}”` : `${PRODUCTS.length} pieces`;
  grid.innerHTML = list.length
    ? list.map((p) => productCard(p, { reveal: false })).join("")
    : `<div class="shop-empty"><span class="serif">Nothing found.</span><p>Try a scent note, a mood, or a brand name.</p></div>`;
}

let t;
input.addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => run(input.value), 220); });
document.querySelector("[data-search-go]")?.addEventListener("click", () => run(input.value));
input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); run(input.value); } });
if (window.matchMedia("(pointer: fine)").matches) input.focus(); // avoid forcing the mobile keyboard

/* honour ?q= on load: linking or reloading a search used to land on the full
   catalogue with an empty box, so the URL and the page disagreed */
const initialQuery = new URLSearchParams(location.search).get("q") || "";
if (initialQuery) input.value = initialQuery;
run(initialQuery);

hydrateIcons();
initMotion({ header });
