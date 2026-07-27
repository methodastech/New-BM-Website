/* ============================================================
   THE PAUSE : Product detail page
   ============================================================ */

import { byId, brandById, moodById, money, PRODUCTS } from "./data.js";
import { icon, hydrateIcons } from "./icons.js";
import { mountHeader, mountFooter, productCard, bindAddButtons } from "./components.js";
import * as cart from "./cart.js";
import { initMotion } from "./motion.js";

const header = mountHeader();
mountFooter();
cart.mountDrawer();
document.querySelector("[data-open-cart]").addEventListener("click", cart.openDrawer);
cart.bindCountBadge(document.querySelector(".cart-count"));

const id = new URLSearchParams(location.search).get("id");
const p = byId(id);
const root = document.querySelector("[data-pdp]");

if (!p) {
  root.innerHTML = `<div class="shop-empty" style="padding:6rem 0"><span class="serif">This piece has drifted off.</span><p>It may have sold out or moved. <a class="link" href="shop.html">Return to the shop</a></p></div>`;
} else {
  const b = brandById(p.brand);
  const gallery = [...new Set(p.image.gallery)];
  document.title = `${p.name} · THE PAUSE`;

  // ---- SEO / social / structured data ----
  const abs = (u) => new URL(u, location.href).href;
  const setMeta = (attr, key, val) => {
    let m = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!m) { m = document.createElement("meta"); m.setAttribute(attr, key); document.head.appendChild(m); }
    m.setAttribute("content", val);
  };
  setMeta("name", "description", p.blurb);
  setMeta("property", "og:title", `${p.name} · The Pause`);
  setMeta("property", "og:description", p.blurb);
  setMeta("property", "og:image", abs(p.image.front));
  setMeta("property", "og:type", "product");
  setMeta("name", "twitter:card", "summary_large_image");
  const ld = document.createElement("script");
  ld.type = "application/ld+json";
  ld.textContent = JSON.stringify({
    "@context": "https://schema.org", "@type": "Product",
    name: p.name, image: [abs(p.image.front)], description: p.story,
    brand: { "@type": "Brand", name: b ? b.name : p.brand },
    offers: { "@type": "Offer", price: p.price, priceCurrency: "MYR", availability: "https://schema.org/InStock" },
  });
  document.head.appendChild(ld);

  root.innerHTML = `
    <nav class="crumb"><a href="shop.html">Shop</a> / <a href="shop.html?category=${p.category}">${cap(p.category)}</a> / <span>${p.name}</span></nav>
    <div class="pdp">
      <div class="pdp__gallery">
        <div class="pdp__main"><img data-main src="${gallery[0]}" alt="${p.name}"></div>
        ${gallery.length > 1 ? `<div class="pdp__thumbs">
          ${gallery.map((g, i) => `<button class="pdp__thumb ${i === 0 ? "is-active" : ""}" data-thumb="${g}" aria-label="View image ${i + 1}"><img src="${g}" alt=""></button>`).join("")}
        </div>` : ""}
      </div>

      <div class="pdp__info">
        <div class="pdp__brand">${b ? b.name : p.brand}${b ? " · " + b.origin : ""}</div>
        <h1 class="pdp__title">${p.name}</h1>
        <div class="pdp__price">${money(p.price)}</div>
        <p class="pdp__blurb">${p.blurb}</p>
        <p class="pdp__story">${p.story}</p>

        <div class="pdp__notes">
          <p class="pdp__field-label">Scent notes</p>
          <div class="note-chips">${p.notes.map((n) => `<span class="note-chip">${n}</span>`).join("")}</div>
        </div>
        <div class="pdp__moods" style="margin-top:1.5rem">
          <p class="pdp__field-label">Suits the mood</p>
          <div class="note-chips">${p.moods.map((m) => { const mo = moodById(m); return `<a class="note-chip note-chip--mood" data-mood="${m}" href="shop.html?mood=${m}">${mo ? mo.short : m}</a>`; }).join("")}</div>
        </div>

        <div class="pdp__buy">
          <div class="pdp__qty">
            <button data-dec aria-label="Decrease">${icon("minus")}</button>
            <span data-qty>1</span>
            <button data-inc aria-label="Increase">${icon("plus")}</button>
          </div>
          <button class="btn" data-buy>Add to cart · ${money(p.price)}</button>
        </div>

        <div class="pdp__trust">
          <span>${icon("dealer")} Authorised dealer</span>
          <span>${icon("ship")} Ships in 3 to 5 days</span>
          <span>${icon("curation")} Considered edit</span>
        </div>

        <div class="accordion">
          ${accItem("How to use", useCopy(p))}
          ${accItem("Shipping & returns", "Packed with care and usually dispatched within three to five business days. Complimentary shipping on orders over RM 250. Returns accepted within 14 days on unopened items.")}
          ${accItem("The maker", b ? b.story : "A considered house, chosen for quiet living.")}
        </div>
      </div>
    </div>

    <section class="related">
      <h2>Pairs well with</h2>
      <div class="product-grid" data-related></div>
    </section>`;

  /* gallery thumbs */
  const mainImg = root.querySelector("[data-main]");
  root.querySelectorAll("[data-thumb]").forEach((t) => {
    t.addEventListener("click", () => {
      mainImg.src = t.dataset.thumb;
      root.querySelectorAll(".pdp__thumb").forEach((x) => x.classList.remove("is-active"));
      t.classList.add("is-active");
    });
  });

  /* qty + add (price tracks quantity) */
  let qty = 1;
  const qtyEl = root.querySelector("[data-qty]");
  const buyBtn = root.querySelector("[data-buy]");
  const setBuy = () => { buyBtn.textContent = `Add to cart · ${money(p.price * qty)}`; };
  root.querySelector("[data-inc]").onclick = () => { qty++; qtyEl.textContent = qty; setBuy(); };
  root.querySelector("[data-dec]").onclick = () => { qty = Math.max(1, qty - 1); qtyEl.textContent = qty; setBuy(); };
  buyBtn.onclick = () => {
    cart.add(p.id, qty);
    buyBtn.textContent = "Added to cart";
    clearTimeout(buyBtn.__t);
    buyBtn.__t = setTimeout(setBuy, 1400);
  };

  /* accordion */
  root.querySelectorAll(".acc-item").forEach((it) => {
    const head = it.querySelector(".acc-head");
    const body = it.querySelector(".acc-body");
    head.addEventListener("click", () => {
      const open = it.classList.toggle("is-open");
      head.setAttribute("aria-expanded", String(open));
      if (open) {
        body.style.maxHeight = body.scrollHeight + "px";
        body.addEventListener("transitionend", function te() {
          if (it.classList.contains("is-open")) body.style.maxHeight = "none";
        }, { once: true });
      } else {
        body.style.maxHeight = body.scrollHeight + "px";
        requestAnimationFrame(() => { body.style.maxHeight = 0; });
      }
    });
  });

  /* related: same mood, then same brand, exclude self */
  const rel = PRODUCTS.filter((x) => x.id !== p.id && (x.moods.some((m) => p.moods.includes(m)) || x.brand === p.brand)).slice(0, 4);
  const relFill = rel.length < 4 ? [...rel, ...PRODUCTS.filter((x) => x.id !== p.id && !rel.includes(x)).slice(0, 4 - rel.length)] : rel;
  root.querySelector("[data-related]").innerHTML = relFill.map((x) => productCard(x, { reveal: false })).join("");

  bindAddButtons(document.body, cart);
}

hydrateIcons();
initMotion({ header });

function cap(s) { return s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()); }
function accItem(title, body) {
  return `<div class="acc-item"><button class="acc-head" aria-expanded="false">${title}${icon("plus")}</button><div class="acc-body"><div class="acc-body__inner">${body}</div></div></div>`;
}
function useCopy(p) {
  const map = {
    candles: "Trim the wick to 5mm before each light. Burn for at least an hour the first time so the pool reaches the edge. Never leave a flame unattended.",
    diffusers: "Place the reeds in the oil and let them draw. Flip the reeds every few days to refresh the scent. Keep away from direct sun and heat.",
    incense: "Light the tip, let it catch, then gently blow out the flame. Rest the plank on a heatproof holder and let the smoke do the rest.",
    "incense-holders": "Rest a stick of incense in the carved groove. Wipe clean with a soft, dry cloth. A natural stone object, each one unique.",
    "room-spray": "Two or three presses into the air, or over soft furnishings. Let it settle for a moment before you breathe it in.",
  };
  return map[p.category] || "Use gently, and often. A small ritual, repeated.";
}
