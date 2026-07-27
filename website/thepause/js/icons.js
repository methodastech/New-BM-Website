/* ============================================================
   THE PAUSE : Custom icon set
   One consistent system: 24 grid, 1.5 stroke, round caps,
   geometry tuned to sit beside the wordmark. Inline SVG so
   icons inherit currentColor (black or white by background)
   and can draw themselves on hover (pathLength trick).
   ============================================================ */

const S = (paths, extra = "") => {
  // pathLength="1" lets CSS run a draw-on animation with dasharray 1
  const withLen = paths
    .replace(/<path /g, '<path pathLength="1" ')
    .replace(/<circle /g, '<circle pathLength="1" ')
    .replace(/<rect /g, '<rect pathLength="1" ');
  return `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${withLen}</svg>`;
};

export const ICONS = {
  /* ---- Categories ---- */
  candle: S(`
    <path d="M12 3.6c1.7 1.9 2.5 3.3 2.5 4.5a2.5 2.5 0 1 1-5 0c0-1.2.8-2.6 2.5-4.5Z" class="ic-flame"/>
    <rect x="7.75" y="11.2" width="8.5" height="9.2" rx="1.4"/>
    <path d="M10 14.4h4"/>`),
  diffuser: S(`
    <path d="M9.4 10.4h5.2a1.3 1.3 0 0 1 1.3 1.3v6.4a2.1 2.1 0 0 1-2.1 2.1h-3.6a2.1 2.1 0 0 1-2.1-2.1v-6.4a1.3 1.3 0 0 1 1.3-1.3Z"/>
    <path d="M10.9 10.4V8.8h2.2v1.6"/>
    <path d="M12 8.8V2.9M11.2 8.8 9.2 3.7M12.8 8.8l2-5.1"/>`),
  incense: S(`
    <path d="M7.2 15.6h9.6c0 2.7-2.1 4.6-4.8 4.6s-4.8-1.9-4.8-4.6Z"/>
    <path d="M12 15.6V6.6"/>
    <path d="M12 5.8c1-.8.4-1.8 1.1-2.7" class="ic-smoke"/>`),
  holder: S(`
    <path d="M4.8 15.2h14.4c-.3 3.1-3.2 5.2-7.2 5.2s-6.9-2.1-7.2-5.2Z"/>
    <path d="M8.4 17.6h7.2"/>
    <path d="M11.6 15.2 16.4 5.6" class="ic-stick"/>
    <path d="M17.3 4c.8-.7.3-1.6 1-2.4" class="ic-smoke"/>`),
  spray: S(`
    <rect x="8.2" y="10.6" width="6.8" height="9.6" rx="1.3"/>
    <path d="M10.2 10.6V8.4h2.8v2.2"/>
    <path d="M10.8 8.4V6.6h3.6v1.8"/>
    <path d="M16.8 6h.01M18.6 4.8h.01M18.4 7.6h.01" class="ic-mist"/>`),

  /* ---- Moods ---- */
  "mood-slower-nights": S(`
    <path d="M19.4 14.3A7.7 7.7 0 1 1 9.7 4.6a6.2 6.2 0 0 0 9.7 9.7Z"/>
    <path d="M16.6 5.4h.01M19 8h.01"/>`),
  "mood-focus": S(`
    <circle cx="12" cy="12" r="7.4"/>
    <circle cx="12" cy="12" r="2.8"/>
    <path d="M12 2.2v2.4M12 19.4v2.4M2.2 12h2.4M19.4 12h2.4"/>`),
  "mood-clear-space": S(`
    <path d="M3.6 9.2h9.8a2.6 2.6 0 1 0-2.6-2.6"/>
    <path d="M3.6 13.4h13.6a2.7 2.7 0 1 1-2.7 2.7"/>
    <path d="M3.6 17.4h7.2"/>`),
  "mood-soft-reset": S(`
    <path d="M5 12a7 7 0 1 1 2.1 5"/>
    <path d="M4.6 20.4v-4.2h4.2"/>`),

  /* ---- Value props ---- */
  dealer: S(`
    <path d="M12 2.6 4.8 5.5v5.8c0 4.4 3 7.5 7.2 9.3 4.2-1.8 7.2-4.9 7.2-9.3V5.5L12 2.6Z"/>
    <path d="m8.9 11.8 2.2 2.2 4-4.4"/>`),
  ship: S(`
    <path d="M3.2 8.4 12 4l8.8 4.4v7.2L12 20l-8.8-4.4V8.4Z"/>
    <path d="M3.2 8.4 12 12.8l8.8-4.4M12 12.8V20"/>`),
  curation: S(`
    <path d="M12 3.4 13.9 8.7l5.6.3-4.4 3.5 1.5 5.4L12 14.8l-4.6 3.1 1.5-5.4-4.4-3.5 5.6-.3L12 3.4Z"/>`),
  support: S(`
    <path d="M4 5.8h16a1 1 0 0 1 1 1v8.6a1 1 0 0 1-1 1H9.2L5 19.8v-3.4H4a1 1 0 0 1-1-1V6.8a1 1 0 0 1 1-1Z"/>
    <path d="M8.4 11h.01M12 11h.01M15.6 11h.01"/>`),
  leaf: S(`
    <path d="M5.2 18.8C5.2 11.2 11 6.4 18.8 6.4c0 7.6-5.8 12.4-13.6 12.4Z"/>
    <path d="M5.2 18.8c2.8-3.8 5.8-5.8 9.6-7.2"/>`),

  bloom: S(`
    <circle cx="12" cy="7.8" r="2.8"/>
    <path d="M12 10.6v9.8"/>
    <path d="M12 15.4c-2.4 0-3.9-1.3-4.2-3.7 2.4-.3 3.9 1 4.2 3.7Z"/>
    <path d="M12 18.2c2.4 0 3.9-1.3 4.2-3.7-2.4-.3-3.9 1-4.2 3.7Z"/>`),
  resin: S(`
    <path d="M12 3.4c3 3.6 4.6 6.2 4.6 8.2a4.6 4.6 0 1 1-9.2 0c0-2 1.6-4.6 4.6-8.2Z"/>
    <path d="M9.7 12.2a2.3 2.3 0 0 0 2.3 2.4"/>`),
  cairn: S(`
    <path d="M9.4 6.2c0-1.4 1.1-2.5 2.6-2.5s2.6 1.1 2.6 2.5-1.1 2.5-2.6 2.5S9.4 7.6 9.4 6.2Z"/>
    <path d="M8 11h8a1.6 1.6 0 0 1 0 3.7H8A1.6 1.6 0 0 1 8 11Z"/>
    <path d="M6.2 17h11.6a1.7 1.7 0 0 1 0 3.4H6.2a1.7 1.7 0 0 1 0-3.4Z"/>`),
  feather: S(`
    <path d="M19.6 4.4C14.8 4 10.6 6.4 8.6 10.2c-1.5 2.9-1.7 6-1.6 8.2 2.2.1 5.3-.1 8.2-1.6 3.8-2 6.2-6.2 5.8-11a1.3 1.3 0 0 0-1.4-1.4Z"/>
    <path d="M4.2 19.8 15.4 8.6M9.8 9.2v5M14.6 8.2v3.4M12.4 6.8v2.2"/>`),

  /* ---- UI ---- */
  cart: S(`
    <path d="M6 7h13l-1.3 8.3a2 2 0 0 1-2 1.7H9.3a2 2 0 0 1-2-1.7L5.6 4.9A1 1 0 0 0 4.6 4H3.2"/>
    <circle cx="9.6" cy="19.9" r="1.15"/>
    <circle cx="16.4" cy="19.9" r="1.15"/>`),
  search: S(`<circle cx="11" cy="11" r="6.4"/><path d="m19.8 19.8-4.2-4.2"/>`),
  account: S(`<circle cx="12" cy="8.4" r="3.7"/><path d="M5.2 19.8c1-3.5 3.7-5.3 6.8-5.3s5.8 1.8 6.8 5.3"/>`),
  close: S(`<path d="M6.4 6.4l11.2 11.2M17.6 6.4 6.4 17.6"/>`),
  plus: S(`<path d="M12 5.4v13.2M5.4 12h13.2"/>`),
  minus: S(`<path d="M5.4 12h13.2"/>`),
  arrow: S(`<path d="M4.6 12h14.8M13.4 6l6 6-6 6"/>`),
  "arrow-down": S(`<path d="M12 4.6v14.8M6 13.4l6 6 6-6"/>`),
  "arrow-ne": S(`<path d="M7 17 17 7M9.2 7H17v7.8"/>`),
  menu: S(`<path d="M4 8.2h16M4 15.8h16"/>`),
  instagram: S(`<rect x="4" y="4" width="16" height="16" rx="4.4"/><circle cx="12" cy="12" r="3.5"/><path d="M16.9 7.1h.01"/>`),
};

export function icon(name, extra = "") {
  const svg = ICONS[name];
  if (!svg) return "";
  return extra ? svg.replace("<svg", `<svg ${extra}`) : svg;
}

/* hydrate any element with data-icon="name" */
export function hydrateIcons(root = document) {
  root.querySelectorAll("[data-icon]").forEach((el) => {
    if (el.dataset.iconDone) return;
    el.innerHTML = icon(el.dataset.icon);
    el.dataset.iconDone = "1";
  });
}
