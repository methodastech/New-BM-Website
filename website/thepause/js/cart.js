/* ============================================================
   THE PAUSE : Cart (local, persistent)
   State in localStorage. Renders the slide-over drawer.
   ============================================================ */

import { byId, money } from "./data.js";
import { icon } from "./icons.js";

const KEY = "pause-cart";
const FREE_SHIP = 250; // RM threshold

let items = load();
const listeners = new Set();

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch { return []; }
}
function save() {
  localStorage.setItem(KEY, JSON.stringify(items));
  listeners.forEach((fn) => fn());
}

export function onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
export function count() { return items.reduce((n, i) => n + i.qty, 0); }
export function subtotal() {
  return items.reduce((s, i) => { const p = byId(i.id); return s + (p ? p.price * i.qty : 0); }, 0);
}

export function add(id, qty = 1) {
  const line = items.find((i) => i.id === id);
  if (line) line.qty += qty; else items.push({ id, qty });
  save();
  openDrawer();
  pulseCount();
}
export function setQty(id, qty) {
  const line = items.find((i) => i.id === id);
  if (!line) return;
  line.qty = qty;
  if (line.qty <= 0) items = items.filter((i) => i.id !== id);
  save();
}
export function remove(id) { items = items.filter((i) => i.id !== id); save(); }

/* ---------- Drawer ---------- */
let scrim, drawer, itemsEl, footEl, shipEl;

export function mountDrawer() {
  scrim = document.createElement("div");
  scrim.className = "drawer-scrim";
  scrim.addEventListener("click", closeDrawer);

  drawer = document.createElement("aside");
  drawer.className = "drawer";
  drawer.setAttribute("aria-label", "Cart");
  drawer.setAttribute("role", "dialog");
  drawer.setAttribute("aria-modal", "true");
  drawer.innerHTML = `
    <div class="drawer__head">
      <span class="drawer__title">Your cart</span>
      <button class="icon-btn" data-close aria-label="Close cart">${icon("close")}</button>
    </div>
    <div class="drawer__ship">
      <div class="drawer__ship-label"></div>
      <div class="meter"><div class="meter__fill"></div></div>
    </div>
    <div class="drawer__items"></div>
    <div class="drawer__foot"></div>`;

  document.body.append(scrim, drawer);
  drawer.querySelector("[data-close]").addEventListener("click", closeDrawer);
  itemsEl = drawer.querySelector(".drawer__items");
  footEl = drawer.querySelector(".drawer__foot");
  shipEl = drawer.querySelector(".drawer__ship");
  onChange(renderDrawer);
  renderDrawer();
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawer(); });
}

let lastFocus = null;
export function openDrawer() {
  if (!drawer) return;
  lastFocus = document.activeElement;
  scrim.classList.add("is-open");
  drawer.classList.add("is-open");
  /* is-locked is the real lock: lenis-stopped only bites while Lenis is running */
  document.documentElement.classList.add("lenis-stopped", "is-locked");
  window.__lenis?.stop();
  requestAnimationFrame(() => drawer.querySelector("[data-close]")?.focus());
}
export function closeDrawer() {
  if (!drawer || !drawer.classList.contains("is-open")) return;
  scrim.classList.remove("is-open");
  drawer.classList.remove("is-open");
  document.documentElement.classList.remove("lenis-stopped", "is-locked");
  window.__lenis?.start();
  if (lastFocus && lastFocus.isConnected) lastFocus.focus();
  lastFocus = null;
}

function renderDrawer() {
  const sub = subtotal();
  // ship meter
  const remain = Math.max(0, FREE_SHIP - sub);
  const pct = Math.min(100, (sub / FREE_SHIP) * 100);
  shipEl.querySelector(".drawer__ship-label").innerHTML =
    remain > 0
      ? `Add <b>${money(remain)}</b> for complimentary shipping.`
      : `You have earned <b>complimentary shipping</b>.`;
  shipEl.querySelector(".meter__fill").style.width = pct + "%";

  if (!items.length) {
    itemsEl.innerHTML = `
      <div class="drawer__empty">
        <p class="serif">Your cart is still empty.</p>
        <p>A few quiet things are waiting to be discovered.</p>
        <a href="shop.html" class="btn btn--ghost btn--sm">Explore the shop</a>
      </div>`;
    footEl.innerHTML = "";
    return;
  }

  itemsEl.innerHTML = items.map((i) => {
    const p = byId(i.id); if (!p) return "";
    return `
      <div class="cart-item" data-id="${p.id}">
        <img class="cart-item__img" src="${p.image.front}" alt="${p.name}" loading="lazy">
        <div>
          <div class="cart-item__brand">${brandName(p.brand)}</div>
          <div class="cart-item__name">${p.name}</div>
          <div class="qty">
            <button data-dec aria-label="Decrease quantity">${icon("minus")}</button>
            <span>${i.qty}</span>
            <button data-inc aria-label="Increase quantity">${icon("plus")}</button>
          </div>
        </div>
        <div style="text-align:right">
          <div class="cart-item__price">${money(p.price * i.qty)}</div>
          <button class="cart-item__remove" data-remove>Remove</button>
        </div>
      </div>`;
  }).join("");

  itemsEl.querySelectorAll(".cart-item").forEach((row) => {
    const id = row.dataset.id;
    const q = items.find((i) => i.id === id)?.qty || 1;
    row.querySelector("[data-inc]").onclick = () => setQty(id, q + 1);
    row.querySelector("[data-dec]").onclick = () => setQty(id, q - 1);
    row.querySelector("[data-remove]").onclick = () => remove(id);
  });

  footEl.innerHTML = `
    <div class="drawer__row">
      <span>Subtotal</span>
      <span class="lg">${money(sub)}</span>
    </div>
    <button class="btn btn--block" data-checkout>Checkout</button>
    <p class="drawer__note">Taxes and shipping calculated at checkout. This is a demo, no payment is taken.</p>`;
  footEl.querySelector("[data-checkout]").onclick = () => {
    const btn = footEl.querySelector("[data-checkout]");
    btn.textContent = "Payment is not available in this demo";
    btn.disabled = true;
    setTimeout(() => { if (btn.isConnected) { btn.textContent = "Checkout"; btn.disabled = false; } }, 2600);
  };
}

function brandName(id) {
  return ({ "hetkinen":"Hetkinen","tribe-earth":"Tribe Earth","jade-deco":"Jade Deco","project-element":"Project Element","nornorm":"nornōrm","common-sense":"Common Sense" })[id] || id;
}

/* header count badge */
export function bindCountBadge(el) {
  const update = () => {
    const c = count();
    el.textContent = c;
    el.classList.toggle("is-active", c > 0);
  };
  onChange(update); update();
}
function pulseCount() {
  const el = document.querySelector(".cart-count");
  if (!el) return;
  el.style.transform = "scale(1.35)";
  setTimeout(() => (el.style.transform = ""), 180);
}
