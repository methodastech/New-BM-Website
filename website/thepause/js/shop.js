/* ============================================================
   THE PAUSE : Shop page
   Client-side filtering + sorting, URL-synced.
   ============================================================ */

import { PRODUCTS, CATEGORIES, MOODS, BRANDS } from "./data.js";
import { hydrateIcons } from "./icons.js";
import { mountHeader, mountFooter, productCard, bindAddButtons } from "./components.js";
import * as cart from "./cart.js";
import { initMotion } from "./motion.js";

const header = mountHeader();
mountFooter();
cart.mountDrawer();
document.querySelector("[data-open-cart]").addEventListener("click", cart.openDrawer);
cart.bindCountBadge(document.querySelector(".cart-count"));
bindAddButtons(document.body, cart);

/* ---------- State from URL ---------- */
const params = new URLSearchParams(location.search);
const state = {
  category: params.get("category") || "all",
  mood: params.get("mood") || "all",
  brand: params.get("brand") || "all",
  sort: params.get("sort") || "featured",
};

/* ---------- Build filter bar ---------- */
const catBar = document.querySelector("[data-cat-chips]");
catBar.innerHTML = [{ id: "all", name: "All" }, ...CATEGORIES]
  .map((c) => `<button class="chip" data-cat="${c.id}" aria-pressed="false">${c.name}</button>`).join("");

const moodBar = document.querySelector("[data-mood-chips]");
moodBar.innerHTML = [{ id: "all", short: "All moods" }, ...MOODS]
  .map((m) => `<button class="chip chip--mood" data-mood="${m.id}" aria-pressed="false">${m.short || m.name}</button>`).join("");

const brandSel = document.querySelector("[data-brand-select]");
brandSel.innerHTML = `<option value="all">All brands</option>` +
  BRANDS.map((b) => `<option value="${b.id}">${b.name}</option>`).join("");

const sortSel = document.querySelector("[data-sort-select]");

/* ---------- Render ---------- */
const grid = document.querySelector("[data-grid]");
const countEl = document.querySelector("[data-count]");

function syncUI() {
  catBar.querySelectorAll(".chip").forEach((c) => { const on = c.dataset.cat === state.category; c.classList.toggle("is-active", on); c.setAttribute("aria-pressed", String(on)); });
  moodBar.querySelectorAll(".chip").forEach((c) => { const on = c.dataset.mood === state.mood; c.classList.toggle("is-active", on); c.setAttribute("aria-pressed", String(on)); });
  brandSel.value = state.brand;
  sortSel.value = state.sort;
}

function apply() {
  let list = PRODUCTS.slice();
  if (state.category !== "all") list = list.filter((p) => p.category === state.category);
  if (state.mood !== "all") list = list.filter((p) => p.moods.includes(state.mood));
  if (state.brand !== "all") list = list.filter((p) => p.brand === state.brand);

  if (state.sort === "price-asc") list.sort((a, b) => a.price - b.price);
  else if (state.sort === "price-desc") list.sort((a, b) => b.price - a.price);
  else if (state.sort === "best") list.sort((a, b) => (b.badge === "Best Seller") - (a.badge === "Best Seller"));

  countEl.textContent = `${list.length} ${list.length === 1 ? "piece" : "pieces"}`;
  grid.innerHTML = list.length
    ? list.map((p) => productCard(p, { reveal: false })).join("")
    : `<div class="shop-empty"><span class="serif">Nothing here, yet.</span><p>Try another mood or category. Quiet things take time to find.</p><button class="btn btn--ghost btn--sm" data-clear>Clear filters</button></div>`;
  const clearBtn = grid.querySelector("[data-clear]");
  if (clearBtn) clearBtn.addEventListener("click", () => { state.category = "all"; state.mood = "all"; state.brand = "all"; apply(); });

  // update URL without reload
  const u = new URLSearchParams();
  Object.entries(state).forEach(([k, v]) => { if (v !== "all" && v !== "featured") u.set(k, v); });
  history.replaceState(null, "", u.toString() ? `?${u}` : location.pathname);

  syncUI();
  if (window.ScrollTrigger) window.ScrollTrigger.refresh();
}

/* ---------- Events ---------- */
catBar.addEventListener("click", (e) => {
  const b = e.target.closest("[data-cat]");
  if (!b) return;
  state.category = b.dataset.cat; apply();
});
moodBar.addEventListener("click", (e) => {
  const b = e.target.closest("[data-mood]");
  if (!b) return;
  state.mood = b.dataset.mood; apply();
});
brandSel.addEventListener("change", () => { state.brand = brandSel.value; apply(); });
sortSel.addEventListener("change", () => { state.sort = sortSel.value; apply(); });

hydrateIcons();
apply();
initMotion({ header });
