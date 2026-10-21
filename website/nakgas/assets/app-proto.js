/* NakGas (named Gas Sekarang until 12 Oct 2026), The App: clickable prototype of the customer app, the dealer app and the admin portal.
   Every name, phone number, plate, order, count and balance on these screens is sample data. The fixed
   figures are the KPDN controlled price (RM26.60 for 14 kg) and the bill from the 1 Oct 2026 call
   (delivery RM3.40, platform and processing fee RM3.50 per order, option B, pending the price audit).
   House rules apply to every string below: no dashes as separators, no exclamation marks. */
(function () {
  'use strict';
  var D = document;
  function $(s, r) { return (r || D).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || D).querySelectorAll(s)); }
  var OLD = !!$('#ptList'); /* the old page (boards.html) carries its own list and frame; the workbench (app.html) drives this script through window.GS */
  var HOOKS = [];
  /* no early return: pages without a screen holder (the Codex) still read LIST, R and the icons through window.GS */

  /* ---------- icons: line, 1.75 stroke, round caps, 24 grid */
  var P = {home: '<rect x="5" y="10.5" width="14" height="10.5" rx="1.5" fill="currentColor" opacity=".22"/><path d="M12 2.6 2.8 10.4l1.3 1.5L12 5.3l7.9 6.6 1.3-1.5z" fill="currentColor"/><rect x="10" y="14" width="4" height="7" rx="1" fill="currentColor"/>', orders: '<rect x="5" y="2.5" width="14" height="19" rx="2" fill="currentColor" opacity=".22"/><rect x="8" y="7.5" width="8" height="1.8" rx="0.9" fill="currentColor"/><rect x="8" y="11.5" width="8" height="1.8" rx="0.9" fill="currentColor"/><rect x="8" y="15.5" width="5" height="1.8" rx="0.9" fill="currentColor"/>', gift: '<rect x="4" y="10.5" width="16" height="10.5" rx="1.5" fill="currentColor" opacity=".22"/><rect x="3" y="6.5" width="18" height="4.5" rx="1.2" fill="currentColor"/><rect x="11" y="6.5" width="2" height="14.5" fill="currentColor"/><path d="M9 3.2a2.2 2.2 0 0 1 2.2 2.2V7H9a2 2 0 0 1 0-3.8zm6 0a2.2 2.2 0 0 0-2.2 2.2V7H15a2 2 0 0 0 0-3.8z" fill="currentColor"/>', user: '<circle cx="12" cy="8" r="4.2" fill="currentColor"/><path d="M4 20.5c0-4 3.6-6.8 8-6.8s8 2.8 8 6.8c0 .6-.4 1-1 1H5c-.6 0-1-.4-1-1z" fill="currentColor" opacity=".22"/>', users: '<circle cx="9" cy="8.5" r="3.6" fill="currentColor"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6c0 .6-.4 1-1 1h-11c-.6 0-1-.4-1-1z" fill="currentColor"/><circle cx="16.8" cy="9" r="3" fill="currentColor" opacity=".22"/><path d="M14.8 14.2c.7-.1 1.3-.2 2-.2 2.9 0 5.2 2 5.2 4.9 0 .6-.4 1-1 1h-3.6c0-2.3-1-4.3-2.6-5.7z" fill="currentColor" opacity=".22"/>', chevR: '<path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>', chevL: '<path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>', arrowR: '<path d="M4 12h16M14 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>', arrow: '<path d="M4 12h16M14 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>', pin: '<path d="M12 22.2S4.6 15.4 4.6 9.6a7.4 7.4 0 0 1 14.8 0c0 5.8-7.4 12.6-7.4 12.6zm0-9.9a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6z" fill="currentColor" fill-rule="evenodd"/><circle cx="12" cy="9.5" r="2.8" fill="currentColor" opacity=".22"/>', building: '<rect x="4" y="3" width="16" height="18" rx="1.5" fill="currentColor" opacity=".22"/><rect x="7" y="6" width="3" height="2.6" rx="0.5" fill="currentColor"/><rect x="14" y="6" width="3" height="2.6" rx="0.5" fill="currentColor"/><rect x="7" y="10.5" width="3" height="2.6" rx="0.5" fill="currentColor"/><rect x="14" y="10.5" width="3" height="2.6" rx="0.5" fill="currentColor"/><rect x="7" y="15" width="3" height="2.6" rx="0.5" fill="currentColor"/><rect x="14" y="15" width="3" height="2.6" rx="0.5" fill="currentColor"/><rect x="10" y="17" width="4" height="4" rx="0.6" fill="currentColor"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>', checkc: '<circle cx="12" cy="12" r="9.5" fill="currentColor" opacity=".22"/><path d="M7.5 12.3l3 3 6-6.3" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>', clock: '<circle cx="12" cy="12" r="9.5" fill="currentColor" opacity=".22"/><path d="M12 7v5.3l3.4 2" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>', cal: '<rect x="3" y="5" width="18" height="16" rx="2.2" fill="currentColor" opacity=".22"/><rect x="3" y="5" width="18" height="4.8" rx="2.2" fill="currentColor"/><rect x="6.8" y="2.5" width="2.2" height="4.4" rx="1.1" fill="currentColor"/><rect x="15" y="2.5" width="2.2" height="4.4" rx="1.1" fill="currentColor"/><rect x="6.5" y="12.2" width="2.6" height="2.6" rx="0.6" fill="currentColor"/><rect x="10.7" y="12.2" width="2.6" height="2.6" rx="0.6" fill="currentColor"/><rect x="14.9" y="12.2" width="2.6" height="2.6" rx="0.6" fill="currentColor"/><rect x="6.5" y="16.2" width="2.6" height="2.6" rx="0.6" fill="currentColor"/><rect x="10.7" y="16.2" width="2.6" height="2.6" rx="0.6" fill="currentColor"/>', truck: '<rect x="2" y="5.5" width="12.5" height="10.5" rx="1.4" fill="currentColor" opacity=".22"/><path d="M14.5 8h3.4c.5 0 .9.2 1.2.6l2.5 3.2c.2.3.4.7.4 1.1V15a1 1 0 0 1-1 1h-6.5z" fill="currentColor"/><circle cx="6.5" cy="18" r="2.4" fill="currentColor"/><circle cx="17" cy="18" r="2.4" fill="currentColor"/><circle cx="6.5" cy="18" r="0.9" fill="currentColor" opacity=".22"/><circle cx="17" cy="18" r="0.9" fill="currentColor" opacity=".22"/>', camera: '<rect x="3" y="7" width="18" height="13" rx="2.6" fill="currentColor" opacity=".22"/><rect x="8.3" y="4" width="7.4" height="3.6" rx="1.2" fill="currentColor"/><circle cx="12" cy="13.5" r="4" fill="currentColor"/><circle cx="12" cy="13.5" r="1.9" fill="currentColor" opacity=".22"/><rect x="16.5" y="9.2" width="2.6" height="1.6" rx="0.8" fill="currentColor"/>', wallet: '<rect x="3" y="6" width="18" height="14.5" rx="2.6" fill="currentColor" opacity=".22"/><rect x="3" y="6" width="18" height="4.6" rx="2.2" fill="currentColor"/><rect x="14.5" y="12" width="6.5" height="5" rx="1.4" fill="currentColor"/><circle cx="17.5" cy="14.5" r="1.1" fill="currentColor" opacity=".22"/>', card: '<rect x="2.5" y="5" width="19" height="14" rx="2.6" fill="currentColor" opacity=".22"/><rect x="2.5" y="8.4" width="19" height="3.2" fill="currentColor"/><rect x="5.5" y="14.6" width="5" height="2" rx="0.6" fill="currentColor"/>', bank: '<rect x="3" y="18" width="18" height="3.2" rx="0.8" fill="currentColor" opacity=".22"/><path d="M12 2.6 2.8 7.4V9h18.4V7.4z" fill="currentColor"/><rect x="5" y="10" width="2.6" height="7" rx="0.6" fill="currentColor"/><rect x="10.7" y="10" width="2.6" height="7" rx="0.6" fill="currentColor"/><rect x="16.4" y="10" width="2.6" height="7" rx="0.6" fill="currentColor"/>', cash: '<rect x="2.5" y="6" width="19" height="12" rx="2.2" fill="currentColor" opacity=".22"/><circle cx="12" cy="12" r="3.2" fill="currentColor"/><circle cx="6" cy="12" r="1.1" fill="currentColor"/><circle cx="18" cy="12" r="1.1" fill="currentColor"/>', star: '<path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8z" fill="currentColor"/>', share: '<circle cx="18" cy="5.2" r="2.8" fill="currentColor"/><circle cx="6" cy="12" r="2.8" fill="currentColor"/><circle cx="18" cy="18.8" r="2.8" fill="currentColor"/><path d="M8.4 10.7l7.2-4.1M8.4 13.3l7.2 4.1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>', bell: '<path d="M6.2 16.2V11a5.8 5.8 0 0 1 11.6 0v5.2l1.6 1.8v1.2H4.6V18z" fill="currentColor" opacity=".22"/><rect x="4.6" y="17.2" width="14.8" height="2.4" rx="1.2" fill="currentColor"/><rect x="9.8" y="19.8" width="4.4" height="2.6" rx="1.3" fill="currentColor"/><circle cx="12" cy="3.4" r="1.5" fill="currentColor"/>', globe: '<circle cx="12" cy="12" r="9.5" fill="currentColor" opacity=".22"/><path d="M12 2.5a9.5 9.5 0 0 1 0 19M12 2.5a9.5 9.5 0 0 0 0 19M2.5 12h19M12 2.5c-2.6 2.6-3.8 6-3.8 9.5s1.2 6.9 3.8 9.5c2.6-2.6 3.8-6 3.8-9.5s-1.2-6.9-3.8-9.5z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>', shield: '<path d="M12 2.2 20 5.2v6c0 5.3-3.4 9.3-8 10.8-4.6-1.5-8-5.5-8-10.8v-6z" fill="currentColor" opacity=".22"/><path d="M8.4 12.2l2.5 2.5 4.9-5.1" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>', help: '<circle cx="12" cy="12" r="9.5" fill="currentColor" opacity=".22"/><path d="M9.4 9.4a2.7 2.7 0 1 1 3.9 2.4c-.9.5-1.3 1-1.3 1.9" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="17" r="1.3" fill="currentColor"/>', logout: '<rect x="3" y="3" width="10.5" height="18" rx="2.2" fill="currentColor" opacity=".22"/><path d="M13 12h8M18 9l3 3-3 3" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>', plus: '<path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>', minus: '<path d="M5 12h14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>', x: '<path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>', menu: '<path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>', upload: '<rect x="3" y="15" width="18" height="6" rx="2" fill="currentColor" opacity=".22"/><path d="M12 3v11M8 7l4-4 4 4" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>', download: '<rect x="3" y="15" width="18" height="6" rx="2" fill="currentColor" opacity=".22"/><path d="M12 3v11M8 10l4 4 4-4" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>', file: '<path d="M6 2h8.2l5 5v15H6z" fill="currentColor" opacity=".22"/><path d="M14.2 2v5h5z" fill="currentColor"/><rect x="9" y="12" width="7" height="1.8" rx="0.9" fill="currentColor"/><rect x="9" y="16" width="7" height="1.8" rx="0.9" fill="currentColor"/>', doc: '<path d="M6 2h8.2l5 5v15H6z" fill="currentColor" opacity=".22"/><path d="M14.2 2v5h5z" fill="currentColor"/><rect x="9" y="12" width="7" height="1.8" rx="0.9" fill="currentColor"/><rect x="9" y="16" width="7" height="1.8" rx="0.9" fill="currentColor"/>', box: '<rect x="3" y="8.5" width="18" height="12.5" rx="1.4" fill="currentColor" opacity=".22"/><path d="M3 8.5 12 3l9 5.5-9 4.5z" fill="currentColor"/><rect x="11" y="8.5" width="2" height="12.5" fill="currentColor"/>', alert: '<path d="M12 2.8 22 20.2H2z" fill="currentColor" opacity=".22"/><rect x="10.9" y="9" width="2.2" height="6" rx="1.1" fill="currentColor"/><circle cx="12" cy="17.6" r="1.3" fill="currentColor"/>', chart: '<rect x="3" y="3" width="18" height="18" rx="2.2" fill="currentColor" opacity=".22"/><rect x="6.5" y="12.5" width="2.8" height="5.5" rx="0.7" fill="currentColor"/><rect x="10.6" y="8.5" width="2.8" height="9.5" rx="0.7" fill="currentColor"/><rect x="14.7" y="5.5" width="2.8" height="12.5" rx="0.7" fill="currentColor"/>', map: '<path d="M3 5.8 9 4l6 2 6-2v14.2L15 20l-6-2-6 2z" fill="currentColor" opacity=".22"/><circle cx="12" cy="10" r="2.6" fill="currentColor"/><path d="M9 4v14M15 6v14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>', dash: '<rect x="3" y="3" width="8" height="10.5" rx="1.6" fill="currentColor"/><rect x="13" y="3" width="8" height="6.5" rx="1.6" fill="currentColor" opacity=".22"/><rect x="13" y="11.5" width="8" height="9.5" rx="1.6" fill="currentColor" opacity=".22"/><rect x="3" y="15.5" width="8" height="5.5" rx="1.6" fill="currentColor"/>', flame: '<g transform="translate(1.2 1.2) scale(.3375)"><path d="M37 3.5C40.2 9.6 47.2 18.6 50.6 29.8C54.6 42.6 48.4 59.4 32.6 59.4C17.2 59.4 11 47 13.9 35.2C16.4 25 27.6 16.4 37 3.5Z" fill="currentColor"/><path d="M32.6 31C35.2 36.4 40.4 40.6 40.4 46C40.4 50.6 36.8 53.2 32.6 53.2C28.4 53.2 24.8 50.6 24.8 46C24.8 40.6 30 36.4 32.6 31Z" fill="currentColor" opacity=".22"/></g>', cyl: '<rect x="7" y="7" width="10" height="14.5" rx="3.2" fill="currentColor"/><rect x="9.4" y="2.6" width="5.2" height="2.8" rx="0.9" fill="currentColor"/><rect x="11.1" y="5" width="1.8" height="2.4" fill="currentColor"/><rect x="7" y="10.6" width="10" height="2.2" fill="#fff" opacity=".28"/><rect x="8" y="20" width="8" height="1.8" rx="0.9" fill="currentColor" opacity=".22"/>', lock: '<rect x="4" y="10" width="16" height="11" rx="2.6" fill="currentColor" opacity=".22"/><path d="M8 10V7.2a4 4 0 0 1 8 0V10" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="15.2" r="1.7" fill="currentColor"/><rect x="11.2" y="15.2" width="1.6" height="3" rx="0.8" fill="currentColor"/>', gauge: '<path d="M3.2 16.2A8.8 8.8 0 0 1 20.8 16.2" fill="currentColor" opacity=".22" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" fill-opacity="0"/><path d="M12 16.2l4.6-5.6" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="16.2" r="2" fill="currentColor"/>', refresh: '<path d="M20 11A8 8 0 0 0 5.3 7.3L4 9M4 13a8 8 0 0 0 14.7 3.7L20 15M4 4v5h5M20 20v-5h-5" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>', repeat: '<path d="M20 11A8 8 0 0 0 5.3 7.3L4 9M4 13a8 8 0 0 0 14.7 3.7L20 15M4 4v5h5M20 20v-5h-5" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>', cpu: '<rect x="5" y="5" width="14" height="14" rx="2.2" fill="currentColor" opacity=".22"/><rect x="9" y="9" width="6" height="6" rx="1.2" fill="currentColor"/><rect x="2" y="8" width="3" height="1.6" rx="0.8" fill="currentColor"/><rect x="2" y="14.4" width="3" height="1.6" rx="0.8" fill="currentColor"/><rect x="19" y="8" width="3" height="1.6" rx="0.8" fill="currentColor"/><rect x="19" y="14.4" width="3" height="1.6" rx="0.8" fill="currentColor"/><rect x="8" y="2" width="1.6" height="3" rx="0.8" fill="currentColor"/><rect x="14.4" y="2" width="1.6" height="3" rx="0.8" fill="currentColor"/><rect x="8" y="19" width="1.6" height="3" rx="0.8" fill="currentColor"/><rect x="14.4" y="19" width="1.6" height="3" rx="0.8" fill="currentColor"/>', power: '<path d="M7.2 6.8a7.5 7.5 0 1 0 9.6 0M12 3v9" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>', print: '<rect x="4" y="9" width="16" height="8.5" rx="2.2" fill="currentColor" opacity=".22"/><rect x="7" y="3" width="10" height="5" rx="1" fill="currentColor"/><rect x="7" y="14.5" width="10" height="6.5" rx="1" fill="currentColor"/><circle cx="17" cy="12" r="1.1" fill="currentColor"/>', phone: '<rect x="6.5" y="2" width="11" height="20" rx="2.6" fill="currentColor"/><rect x="8.3" y="4.6" width="7.4" height="12.2" rx="1" fill="#fff" opacity=".9"/><circle cx="12" cy="19" r="1.1" fill="#fff"/>', call: '<path d="M6.6 3.5h3.2l1.8 4.6-2.4 1.6a11.5 11.5 0 0 0 5.1 5.1l1.6-2.4 4.6 1.8v3.2c0 .9-.7 1.6-1.6 1.6A15.5 15.5 0 0 1 5 5.1c0-.9.7-1.6 1.6-1.6z" fill="currentColor"/><path d="M15 6.8a3.6 3.6 0 0 1 2.2 2.2M15.3 3.4a7 7 0 0 1 5.3 5.3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity=".4"/>', nocall: '<path d="M6.6 3.5h3.2l1.8 4.6-2.4 1.6a11.5 11.5 0 0 0 5.1 5.1l1.6-2.4 4.6 1.8v3.2c0 .9-.7 1.6-1.6 1.6A15.5 15.5 0 0 1 5 5.1c0-.9.7-1.6 1.6-1.6z" fill="currentColor" opacity=".22"/><path d="M4 4l16 16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>', tag: '<path d="M3 11.6V4.6C3 3.7 3.7 3 4.6 3h7l9.6 9.6c.6.6.6 1.6 0 2.2l-6.4 6.4c-.6.6-1.6.6-2.2 0z" fill="currentColor" opacity=".22"/><circle cx="7.8" cy="7.8" r="1.7" fill="currentColor"/><path d="M3 11.6V4.6C3 3.7 3.7 3 4.6 3h7l1.6 1.6H5.4A.8.8 0 0 0 4.6 5.4v6.2z" fill="currentColor"/>', info: '<circle cx="12" cy="12" r="9.5" fill="currentColor" opacity=".22"/><rect x="10.9" y="10.4" width="2.2" height="7" rx="1.1" fill="currentColor"/><circle cx="12" cy="7.6" r="1.4" fill="currentColor"/>', chat: '<path d="M4 5.6c0-1.2.9-2.1 2.1-2.1h11.8c1.2 0 2.1.9 2.1 2.1v8.6c0 1.2-.9 2.1-2.1 2.1H9.6L5 20.2v-4.3C4.4 15.5 4 14.9 4 14.2z" fill="currentColor" opacity=".22"/><rect x="7.8" y="7.6" width="8.4" height="1.8" rx="0.9" fill="currentColor"/><rect x="7.8" y="11.2" width="5.4" height="1.8" rx="0.9" fill="currentColor"/>', mail: '<rect x="3" y="5" width="18" height="14" rx="2.4" fill="currentColor" opacity=".22"/><path d="M3.6 6.6 12 12.6l8.4-6v2.4L12 15.2 3.6 9z" fill="currentColor"/>', store: '<rect x="4" y="10" width="16" height="11" fill="currentColor" opacity=".22"/><path d="M3 9.4 4.6 4h14.8L21 9.4a2.3 2.3 0 0 1-4.5.2 2.25 2.25 0 0 1-4.5 0 2.25 2.25 0 0 1-4.5 0A2.3 2.3 0 0 1 3 9.4z" fill="currentColor"/><rect x="10" y="14" width="4" height="7" rx="0.8" fill="currentColor"/>', window: '<rect x="3.5" y="3.5" width="17" height="17" rx="2" fill="currentColor" opacity=".22"/><rect x="11.1" y="3.5" width="1.8" height="17" fill="currentColor"/><rect x="3.5" y="11.1" width="17" height="1.8" fill="currentColor"/>', switch: '<rect x="2.5" y="7" width="19" height="10" rx="5" fill="currentColor" opacity=".22"/><circle cx="16.5" cy="12" r="3.7" fill="currentColor"/>', nofire: '<g transform="translate(1.2 1.2) scale(.3375)"><path d="M37 3.5C40.2 9.6 47.2 18.6 50.6 29.8C54.6 42.6 48.4 59.4 32.6 59.4C17.2 59.4 11 47 13.9 35.2C16.4 25 27.6 16.4 37 3.5Z" fill="currentColor" opacity=".22"/></g><path d="M4 4l16 16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>', radius: '<circle cx="12" cy="12" r="9.5" fill="currentColor" opacity=".22"/><circle cx="12" cy="12" r="5.4" fill="none" stroke="currentColor" stroke-width="1.9"/><circle cx="12" cy="12" r="1.9" fill="currentColor"/>', eye: '<path d="M2.2 12S5.8 5.2 12 5.2 21.8 12 21.8 12 18.2 18.8 12 18.8 2.2 12 2.2 12z" fill="currentColor" opacity=".22"/><circle cx="12" cy="12" r="3.8" fill="currentColor"/><circle cx="13.2" cy="10.8" r="1.1" fill="#fff" opacity=".9"/>', trash: '<path d="M6 7.5h12l-1 12.8c-.1.5-.5.9-1 .9H8c-.5 0-.9-.4-1-.9z" fill="currentColor" opacity=".22"/><rect x="4" y="5" width="16" height="2.2" rx="1.1" fill="currentColor"/><rect x="9.5" y="2.6" width="5" height="2.4" rx="1" fill="currentColor"/><rect x="10" y="10.2" width="1.6" height="7.4" rx="0.8" fill="currentColor"/><rect x="12.4" y="10.2" width="1.6" height="7.4" rx="0.8" fill="currentColor"/>', edit: '<rect x="3" y="3" width="13" height="18" rx="2" fill="currentColor" opacity=".22"/><path d="M14.9 4.6l4.5 4.5L8.9 19.6l-5.5 1 1-5.5z" fill="currentColor"/><path d="M16.9 2.6l4.5 4.5-1.6 1.6-4.5-4.5z" fill="currentColor"/>', calendar: '<rect x="3" y="5" width="18" height="16" rx="2.2" fill="currentColor" opacity=".22"/><rect x="3" y="5" width="18" height="4.8" rx="2.2" fill="currentColor"/><rect x="6.8" y="2.5" width="2.2" height="4.4" rx="1.1" fill="currentColor"/><rect x="15" y="2.5" width="2.2" height="4.4" rx="1.1" fill="currentColor"/><rect x="6.5" y="12.2" width="2.6" height="2.6" rx="0.6" fill="currentColor"/><rect x="10.7" y="12.2" width="2.6" height="2.6" rx="0.6" fill="currentColor"/><rect x="14.9" y="12.2" width="2.6" height="2.6" rx="0.6" fill="currentColor"/><rect x="6.5" y="16.2" width="2.6" height="2.6" rx="0.6" fill="currentColor"/><rect x="10.7" y="16.2" width="2.6" height="2.6" rx="0.6" fill="currentColor"/>', cylinder: '<rect x="7" y="7" width="10" height="14.5" rx="3.2" fill="currentColor"/><rect x="9.4" y="2.6" width="5.2" height="2.8" rx="0.9" fill="currentColor"/><rect x="11.1" y="5" width="1.8" height="2.4" fill="currentColor"/><rect x="7" y="10.6" width="10" height="2.2" fill="#fff" opacity=".28"/><rect x="8" y="20" width="8" height="1.8" rx="0.9" fill="currentColor" opacity=".22"/>'};
  function ic(n, s) { s = s || 22; return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" class="ic2" aria-hidden="true">' + (P[n] || P.help) + '</svg>'; }   /* 20 Oct: the duotone set from tools/icons.py */
  var MARKP = '<g class="fl" transform="translate(0.00 0.00) scale(1.0000)"><path class="fl-o" d="M37 3.5C40.2 9.6 47.2 18.6 50.6 29.8C54.6 42.6 48.4 59.4 32.6 59.4C17.2 59.4 11 47 13.9 35.2C16.4 25 27.6 16.4 37 3.5Z" fill="#0CA66A"/><path class="fl-i" d="M32.6 31C35.2 36.4 40.4 40.6 40.4 46C40.4 50.6 36.8 53.2 32.6 53.2C28.4 53.2 24.8 50.6 24.8 46C24.8 40.6 30 36.4 32.6 31Z" fill="#8FDDB8"/></g>';
  function mark(s) { return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 64 64" aria-hidden="true">' + MARKP + '</svg>'; }
  /* 20 Oct: the lockups as outlines from assets/lockup.svg and lockup-stacked.svg (synced by tools/sync-lockups.py), so the
     placement of flame and word in the app is the file's own. LOCK_SVG_START / LOCK_SVG_END are the sync markers. */
  /* LOCK_SVG_START */
  var LOCK_VB = '0 0 169.6 59.8', LOCK_B = '<g class="fl" transform="translate(-3.50 3.54) scale(0.7037)"><path class="fl-o" d="M37 3.5C40.2 9.6 47.2 18.6 50.6 29.8C54.6 42.6 48.4 59.4 32.6 59.4C17.2 59.4 11 47 13.9 35.2C16.4 25 27.6 16.4 37 3.5Z" fill="#0CA66A"/><path class="fl-i" d="M32.6 31C35.2 36.4 40.4 40.6 40.4 46C40.4 50.6 36.8 53.2 32.6 53.2C28.4 53.2 24.8 50.6 24.8 46C24.8 40.6 30 36.4 32.6 31Z" fill="#8FDDB8"/></g><g transform="translate(41.58 45.34)"><path d="M1.94 0V-18.58H8.55V-17.37Q10.6 -18.96 13.6 -18.96Q15.58 -18.96 17.18 -18.03Q18.77 -17.1 19.68 -15.52Q20.6 -13.95 20.6 -12.01V0H13.98V-10.49Q13.98 -11.78 13.21 -12.52Q12.43 -13.26 11.29 -13.26Q10.11 -13.26 9.33 -12.52Q8.55 -11.78 8.55 -10.49V0ZM30.32 0.38Q27.74 0.38 25.73 -0.87Q23.71 -2.13 22.57 -4.31Q21.43 -6.5 21.43 -9.27Q21.43 -12.08 22.57 -14.27Q23.71 -16.45 25.73 -17.71Q27.74 -18.96 30.32 -18.96Q31.73 -18.96 32.97 -18.52Q34.2 -18.09 35.11 -17.29V-18.58H41.61V0H35.11V-1.25Q34.2 -0.49 32.97 -0.06Q31.73 0.38 30.32 0.38ZM31.73 -5.51Q33.36 -5.51 34.37 -6.55Q35.38 -7.6 35.38 -9.31Q35.38 -10.94 34.37 -12.01Q33.36 -13.07 31.77 -13.07Q30.17 -13.07 29.15 -12.01Q28.12 -10.94 28.12 -9.31Q28.12 -7.64 29.15 -6.57Q30.17 -5.51 31.73 -5.51ZM43.97 0V-27.7H50.58V-10.53L55.86 -18.58H63.12L56.81 -9.88L63.5 0H55.9L50.58 -8.82V0Z" fill="#0B1530"/><path d="M71.44 -0.68Q68.86 -0.68 66.86 -1.9Q64.87 -3.12 63.73 -5.19Q62.59 -7.26 62.59 -9.84Q62.59 -12.39 63.73 -14.46Q64.87 -16.53 66.86 -17.75Q68.86 -18.96 71.44 -18.96Q74.02 -18.96 75.85 -17.63V-18.58H82.35V-1.29Q82.35 1.67 80.96 3.86Q79.57 6.04 77.18 7.24Q74.78 8.44 71.74 8.44Q68.63 8.44 66.27 7.39Q63.92 6.35 62.59 4.45L66.58 0.49Q67.53 1.56 68.67 2.13Q69.81 2.7 71.44 2.7Q73.42 2.7 74.57 1.73Q75.73 0.76 75.73 -1.06V-1.9Q73.91 -0.68 71.44 -0.68ZM72.66 -6.42Q74.25 -6.42 75.18 -7.43Q76.11 -8.44 76.11 -9.84Q76.11 -11.21 75.18 -12.24Q74.25 -13.26 72.69 -13.26Q71.14 -13.26 70.2 -12.22Q69.27 -11.17 69.27 -9.84Q69.27 -8.51 70.19 -7.47Q71.1 -6.42 72.66 -6.42ZM92.42 0.38Q89.83 0.38 87.82 -0.87Q85.8 -2.13 84.66 -4.31Q83.52 -6.5 83.52 -9.27Q83.52 -12.08 84.66 -14.27Q85.8 -16.45 87.82 -17.71Q89.83 -18.96 92.42 -18.96Q93.82 -18.96 95.06 -18.52Q96.29 -18.09 97.2 -17.29V-18.58H103.7V0H97.2V-1.25Q96.29 -0.49 95.06 -0.06Q93.82 0.38 92.42 0.38ZM93.82 -5.51Q95.46 -5.51 96.46 -6.55Q97.47 -7.6 97.47 -9.31Q97.47 -10.94 96.46 -12.01Q95.46 -13.07 93.86 -13.07Q92.26 -13.07 91.24 -12.01Q90.21 -10.94 90.21 -9.31Q90.21 -7.64 91.24 -6.57Q92.26 -5.51 93.82 -5.51ZM113.13 0.53Q110.58 0.53 108.15 -0.44Q105.72 -1.41 104.27 -2.96L107.88 -6.65Q108.79 -5.7 110.07 -5.17Q111.34 -4.64 112.78 -4.64Q114.49 -4.64 114.49 -5.51Q114.49 -6.12 113.87 -6.44Q113.24 -6.76 112.23 -7.01Q111.23 -7.26 110.11 -7.6Q108.98 -7.94 108 -8.57Q107.01 -9.2 106.36 -10.28Q105.72 -11.36 105.72 -13.11Q105.72 -14.86 106.69 -16.23Q107.65 -17.59 109.4 -18.37Q111.15 -19.15 113.51 -19.15Q115.9 -19.15 118.07 -18.34Q120.23 -17.52 121.56 -15.88L117.91 -12.2Q117 -13.22 115.9 -13.62Q114.8 -14.02 113.89 -14.02Q112.25 -14.02 112.25 -13.11Q112.25 -12.58 112.88 -12.29Q113.51 -12.01 114.49 -11.76Q115.48 -11.51 116.6 -11.13Q117.72 -10.75 118.71 -10.09Q119.7 -9.42 120.33 -8.3Q120.95 -7.18 120.95 -5.47Q120.95 -2.7 118.83 -1.08Q116.7 0.53 113.13 0.53Z" fill="#0CA66A"/></g>', LOCK_W = '<g class="fl" transform="translate(-3.50 3.54) scale(0.7037)"><path class="fl-o" d="M37 3.5C40.2 9.6 47.2 18.6 50.6 29.8C54.6 42.6 48.4 59.4 32.6 59.4C17.2 59.4 11 47 13.9 35.2C16.4 25 27.6 16.4 37 3.5Z" fill="#FFFFFF"/><path class="fl-i" d="M32.6 31C35.2 36.4 40.4 40.6 40.4 46C40.4 50.6 36.8 53.2 32.6 53.2C28.4 53.2 24.8 50.6 24.8 46C24.8 40.6 30 36.4 32.6 31Z" fill="#8FDDB8"/></g><g transform="translate(41.58 45.34)"><path d="M1.94 0V-18.58H8.55V-17.37Q10.6 -18.96 13.6 -18.96Q15.58 -18.96 17.18 -18.03Q18.77 -17.1 19.68 -15.52Q20.6 -13.95 20.6 -12.01V0H13.98V-10.49Q13.98 -11.78 13.21 -12.52Q12.43 -13.26 11.29 -13.26Q10.11 -13.26 9.33 -12.52Q8.55 -11.78 8.55 -10.49V0ZM30.32 0.38Q27.74 0.38 25.73 -0.87Q23.71 -2.13 22.57 -4.31Q21.43 -6.5 21.43 -9.27Q21.43 -12.08 22.57 -14.27Q23.71 -16.45 25.73 -17.71Q27.74 -18.96 30.32 -18.96Q31.73 -18.96 32.97 -18.52Q34.2 -18.09 35.11 -17.29V-18.58H41.61V0H35.11V-1.25Q34.2 -0.49 32.97 -0.06Q31.73 0.38 30.32 0.38ZM31.73 -5.51Q33.36 -5.51 34.37 -6.55Q35.38 -7.6 35.38 -9.31Q35.38 -10.94 34.37 -12.01Q33.36 -13.07 31.77 -13.07Q30.17 -13.07 29.15 -12.01Q28.12 -10.94 28.12 -9.31Q28.12 -7.64 29.15 -6.57Q30.17 -5.51 31.73 -5.51ZM43.97 0V-27.7H50.58V-10.53L55.86 -18.58H63.12L56.81 -9.88L63.5 0H55.9L50.58 -8.82V0Z" fill="#FFFFFF"/><path d="M71.44 -0.68Q68.86 -0.68 66.86 -1.9Q64.87 -3.12 63.73 -5.19Q62.59 -7.26 62.59 -9.84Q62.59 -12.39 63.73 -14.46Q64.87 -16.53 66.86 -17.75Q68.86 -18.96 71.44 -18.96Q74.02 -18.96 75.85 -17.63V-18.58H82.35V-1.29Q82.35 1.67 80.96 3.86Q79.57 6.04 77.18 7.24Q74.78 8.44 71.74 8.44Q68.63 8.44 66.27 7.39Q63.92 6.35 62.59 4.45L66.58 0.49Q67.53 1.56 68.67 2.13Q69.81 2.7 71.44 2.7Q73.42 2.7 74.57 1.73Q75.73 0.76 75.73 -1.06V-1.9Q73.91 -0.68 71.44 -0.68ZM72.66 -6.42Q74.25 -6.42 75.18 -7.43Q76.11 -8.44 76.11 -9.84Q76.11 -11.21 75.18 -12.24Q74.25 -13.26 72.69 -13.26Q71.14 -13.26 70.2 -12.22Q69.27 -11.17 69.27 -9.84Q69.27 -8.51 70.19 -7.47Q71.1 -6.42 72.66 -6.42ZM92.42 0.38Q89.83 0.38 87.82 -0.87Q85.8 -2.13 84.66 -4.31Q83.52 -6.5 83.52 -9.27Q83.52 -12.08 84.66 -14.27Q85.8 -16.45 87.82 -17.71Q89.83 -18.96 92.42 -18.96Q93.82 -18.96 95.06 -18.52Q96.29 -18.09 97.2 -17.29V-18.58H103.7V0H97.2V-1.25Q96.29 -0.49 95.06 -0.06Q93.82 0.38 92.42 0.38ZM93.82 -5.51Q95.46 -5.51 96.46 -6.55Q97.47 -7.6 97.47 -9.31Q97.47 -10.94 96.46 -12.01Q95.46 -13.07 93.86 -13.07Q92.26 -13.07 91.24 -12.01Q90.21 -10.94 90.21 -9.31Q90.21 -7.64 91.24 -6.57Q92.26 -5.51 93.82 -5.51ZM113.13 0.53Q110.58 0.53 108.15 -0.44Q105.72 -1.41 104.27 -2.96L107.88 -6.65Q108.79 -5.7 110.07 -5.17Q111.34 -4.64 112.78 -4.64Q114.49 -4.64 114.49 -5.51Q114.49 -6.12 113.87 -6.44Q113.24 -6.76 112.23 -7.01Q111.23 -7.26 110.11 -7.6Q108.98 -7.94 108 -8.57Q107.01 -9.2 106.36 -10.28Q105.72 -11.36 105.72 -13.11Q105.72 -14.86 106.69 -16.23Q107.65 -17.59 109.4 -18.37Q111.15 -19.15 113.51 -19.15Q115.9 -19.15 118.07 -18.34Q120.23 -17.52 121.56 -15.88L117.91 -12.2Q117 -13.22 115.9 -13.62Q114.8 -14.02 113.89 -14.02Q112.25 -14.02 112.25 -13.11Q112.25 -12.58 112.88 -12.29Q113.51 -12.01 114.49 -11.76Q115.48 -11.51 116.6 -11.13Q117.72 -10.75 118.71 -10.09Q119.7 -9.42 120.33 -8.3Q120.95 -7.18 120.95 -5.47Q120.95 -2.7 118.83 -1.08Q116.7 0.53 113.13 0.53Z" fill="#FFFFFF"/></g>', STACK_VB = '0 0 170.6 150.8', STACK_B = '<g class="fl" transform="translate(43.24 1.49) scale(1.2885)"><path class="fl-o" d="M37 3.5C40.2 9.6 47.2 18.6 50.6 29.8C54.6 42.6 48.4 59.4 32.6 59.4C17.2 59.4 11 47 13.9 35.2C16.4 25 27.6 16.4 37 3.5Z" fill="#0CA66A"/><path class="fl-i" d="M32.6 31C35.2 36.4 40.4 40.6 40.4 46C40.4 50.6 36.8 53.2 32.6 53.2C28.4 53.2 24.8 50.6 24.8 46C24.8 40.6 30 36.4 32.6 31Z" fill="#8FDDB8"/></g><g transform="translate(6.00 133.84) scale(1.300)"><path d="M1.94 0V-18.58H8.55V-17.37Q10.6 -18.96 13.6 -18.96Q15.58 -18.96 17.18 -18.03Q18.77 -17.1 19.68 -15.52Q20.6 -13.95 20.6 -12.01V0H13.98V-10.49Q13.98 -11.78 13.21 -12.52Q12.43 -13.26 11.29 -13.26Q10.11 -13.26 9.33 -12.52Q8.55 -11.78 8.55 -10.49V0ZM30.32 0.38Q27.74 0.38 25.73 -0.87Q23.71 -2.13 22.57 -4.31Q21.43 -6.5 21.43 -9.27Q21.43 -12.08 22.57 -14.27Q23.71 -16.45 25.73 -17.71Q27.74 -18.96 30.32 -18.96Q31.73 -18.96 32.97 -18.52Q34.2 -18.09 35.11 -17.29V-18.58H41.61V0H35.11V-1.25Q34.2 -0.49 32.97 -0.06Q31.73 0.38 30.32 0.38ZM31.73 -5.51Q33.36 -5.51 34.37 -6.55Q35.38 -7.6 35.38 -9.31Q35.38 -10.94 34.37 -12.01Q33.36 -13.07 31.77 -13.07Q30.17 -13.07 29.15 -12.01Q28.12 -10.94 28.12 -9.31Q28.12 -7.64 29.15 -6.57Q30.17 -5.51 31.73 -5.51ZM43.97 0V-27.7H50.58V-10.53L55.86 -18.58H63.12L56.81 -9.88L63.5 0H55.9L50.58 -8.82V0Z" fill="#0B1530"/><path d="M71.44 -0.68Q68.86 -0.68 66.86 -1.9Q64.87 -3.12 63.73 -5.19Q62.59 -7.26 62.59 -9.84Q62.59 -12.39 63.73 -14.46Q64.87 -16.53 66.86 -17.75Q68.86 -18.96 71.44 -18.96Q74.02 -18.96 75.85 -17.63V-18.58H82.35V-1.29Q82.35 1.67 80.96 3.86Q79.57 6.04 77.18 7.24Q74.78 8.44 71.74 8.44Q68.63 8.44 66.27 7.39Q63.92 6.35 62.59 4.45L66.58 0.49Q67.53 1.56 68.67 2.13Q69.81 2.7 71.44 2.7Q73.42 2.7 74.57 1.73Q75.73 0.76 75.73 -1.06V-1.9Q73.91 -0.68 71.44 -0.68ZM72.66 -6.42Q74.25 -6.42 75.18 -7.43Q76.11 -8.44 76.11 -9.84Q76.11 -11.21 75.18 -12.24Q74.25 -13.26 72.69 -13.26Q71.14 -13.26 70.2 -12.22Q69.27 -11.17 69.27 -9.84Q69.27 -8.51 70.19 -7.47Q71.1 -6.42 72.66 -6.42ZM92.42 0.38Q89.83 0.38 87.82 -0.87Q85.8 -2.13 84.66 -4.31Q83.52 -6.5 83.52 -9.27Q83.52 -12.08 84.66 -14.27Q85.8 -16.45 87.82 -17.71Q89.83 -18.96 92.42 -18.96Q93.82 -18.96 95.06 -18.52Q96.29 -18.09 97.2 -17.29V-18.58H103.7V0H97.2V-1.25Q96.29 -0.49 95.06 -0.06Q93.82 0.38 92.42 0.38ZM93.82 -5.51Q95.46 -5.51 96.46 -6.55Q97.47 -7.6 97.47 -9.31Q97.47 -10.94 96.46 -12.01Q95.46 -13.07 93.86 -13.07Q92.26 -13.07 91.24 -12.01Q90.21 -10.94 90.21 -9.31Q90.21 -7.64 91.24 -6.57Q92.26 -5.51 93.82 -5.51ZM113.13 0.53Q110.58 0.53 108.15 -0.44Q105.72 -1.41 104.27 -2.96L107.88 -6.65Q108.79 -5.7 110.07 -5.17Q111.34 -4.64 112.78 -4.64Q114.49 -4.64 114.49 -5.51Q114.49 -6.12 113.87 -6.44Q113.24 -6.76 112.23 -7.01Q111.23 -7.26 110.11 -7.6Q108.98 -7.94 108 -8.57Q107.01 -9.2 106.36 -10.28Q105.72 -11.36 105.72 -13.11Q105.72 -14.86 106.69 -16.23Q107.65 -17.59 109.4 -18.37Q111.15 -19.15 113.51 -19.15Q115.9 -19.15 118.07 -18.34Q120.23 -17.52 121.56 -15.88L117.91 -12.2Q117 -13.22 115.9 -13.62Q114.8 -14.02 113.89 -14.02Q112.25 -14.02 112.25 -13.11Q112.25 -12.58 112.88 -12.29Q113.51 -12.01 114.49 -11.76Q115.48 -11.51 116.6 -11.13Q117.72 -10.75 118.71 -10.09Q119.7 -9.42 120.33 -8.3Q120.95 -7.18 120.95 -5.47Q120.95 -2.7 118.83 -1.08Q116.7 0.53 113.13 0.53Z" fill="#0CA66A"/></g>';
  /* LOCK_SVG_END */
  function lockup(h, white) { var vb = LOCK_VB.split(' '); return '<svg class="lk-svg" height="' + h + '" width="' + Math.round(h * vb[2] / vb[3]) + '" viewBox="' + LOCK_VB + '" role="img" aria-label="nakgas">' + (white ? LOCK_W : LOCK_B) + '</svg>'; }
  function stacked(h) { var vb = STACK_VB.split(' '); return '<svg class="lk-svg lk-anim" height="' + h + '" width="' + Math.round(h * vb[2] / vb[3]) + '" viewBox="' + STACK_VB + '" role="img" aria-label="nakgas">' + STACK_B + '</svg>'; }
  var WM = '<span class="wm">nak<em>gas</em></span>';
  var SBI = '<svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>' +
    '<svg width="16" height="12" viewBox="0 0 16 12"><path d="M8 11.5 5.6 9a3.4 3.4 0 0 1 4.8 0z"/><path d="M3.4 6.8a6.5 6.5 0 0 1 9.2 0l-1.4 1.4a4.5 4.5 0 0 0-6.4 0z"/><path d="M1.2 4.6a9.6 9.6 0 0 1 13.6 0l-1.4 1.4a7.6 7.6 0 0 0-10.8 0z"/></svg>' +
    '<svg width="27" height="12" viewBox="0 0 27 12"><rect x=".5" y=".5" width="22" height="11" rx="3" fill="none" stroke="currentColor" opacity=".45"/><rect x="2" y="2" width="16" height="8" rx="1.6"/><rect x="23.6" y="4" width="2" height="4" rx="1" opacity=".45"/></svg>';

  /* ---------- state */
  function freshC() { return { otp: false, addr: 'landed', lift: true, type: 'swap', brand: 'PETRONAS', qty: 1, when: 'now', day: 1, slot: 0, promo: '', promoOpen: false, pay: 'fpx', find: { n: 0, ph: 'offer', left: 45, el: 0, adm: false }, trk: 2, stars: 0, tags: {}, remind: 28, notif: true, help: -1, helpSent: false, mkt: false, loc: true, saved: false }; }
  function freshD() { return { role: 'shop', lic: false, sub: 0, online: false, t: 45, acc: false, driver: 0, st: 3, shot: false, cash: false, stock: [42, 18, 25], radius: 5, addk: 'driver', added: false }; }
  function freshA() { return { sel: 'NG-10488', assigned: '', appr: [0, 0, 0], rad: true, pend: true, fee: 'b', filter: 'all', paid: false }; }
  var S = { prod: 'c', lang: 'bm', cur: { c: 'c-splash', d: 'd-login', a: 'a-dash' }, c: freshC(), d: freshD(), a: freshA() };
  function L(e, m) { return S.lang === 'bm' ? m : e; }

  /* ---------- dates, times, money */
  var T0 = new Date(); T0.setHours(12, 0, 0, 0);
  function dAdd(n) { var d = new Date(T0.getTime()); d.setDate(d.getDate() + n); return d; }
  var MO = { en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], bm: ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'] };
  var WK = { en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], bm: ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'] };
  function fdate(d, lg, wk, yr) {
    lg = lg || S.lang;
    var s = d.getDate() + ' ' + MO[lg][d.getMonth()] + (yr ? ' ' + d.getFullYear() : '');
    return wk ? WK[lg][d.getDay()] + (lg === 'bm' ? ', ' : ' ') + s : s;
  }
  function tm(h, m, lg) {
    lg = lg || S.lang;
    var hh = h % 12 || 12, mm = (m < 10 ? '0' : '') + m;
    if (lg === 'bm') return hh + ':' + mm + (h < 12 ? ' pg' : h < 14 ? ' tgh' : ' ptg');
    return hh + ':' + mm + (h < 12 ? 'am' : 'pm');
  }
  function rm(x) { var p = (Math.round(x * 100) / 100).toFixed(2).split('.'); return 'RM' + p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + p[1]; }
  var MINUS = '−';
  function bill() {
    var q = S.c.qty, gas = 26.6 * q, del = 3.4 * q, fee = 3.5, disc = S.c.promo ? 2 : 0;
    return { gas: gas, del: del, fee: fee, disc: disc, tot: gas + del + fee - disc };
  }

  /* ---------- screen registry: id, name, what it shows (captions are English, the document's language) */
  var PRODN = { c: 'Customer app', d: 'Dealer app', a: 'Admin portal' };
  var LIST = {
    c: [
      ['c-splash', 'Splash', 'First open: the flame, the name and the promise. Tap anywhere on the screen to start.'],
      ['c-lang', 'Language picker', 'Shown once on first open and sets the whole app. The BM / EN switch above does the same, and Settings changes it any time.'],
      ['c-otp', 'Phone and OTP', 'A phone number and a six digit code by SMS. No password.'],
      ['c-address', 'Address', 'Landed or high-rise. High-rise adds the unit, floor and lift, so the dealer knows before setting off. Delivery fee tiers for high-rise are to confirm.'],
      ['c-home', 'Home', 'The usual order, the reorder reminder and one Order button. Phase One reminder: a simple scheduled push from the customer’s own rhythm, about 28 days by default, adjustable. Predictive and smart regulator reminders are Phase Two.'],
      ['c-order', 'Choose the gas', 'Swap or new cylinder, size, brand and quantity. 14 kg is the hero; 12 kg depends on brand and its price is to confirm; C50 commercial is Phase Two. Brands shown are sample options: the brands carried and any logo rights are to confirm.'],
      ['c-when', 'Now or scheduled', 'Now goes straight to the order engine. Scheduled picks a day and a three hour slot (sample slots).'],
      ['c-checkout', 'Checkout', 'The KPDN controlled price is the first line, then the delivery fee, then one platform and processing fee per order (option B, RM3.50, pending the price audit). One promo code or points per order.'],
      ['c-pay', 'Payment', 'FPX, card or e-wallet through one Malaysian gateway, or cash on delivery.'],
      ['c-find', 'Finding a dealer', 'The engine offers the order to the nearest available dealer with stock, who has 45 seconds. A decline or timeout moves it to the next nearest; four in a row go to Admin. In this demo the dealer accepts after about 6 seconds.'],
      ['c-track', 'Tracking', 'Confirmed, dealer assigned, out for delivery, delivered. The dealer’s name and truck plate, never a phone number. Status comes from the driver’s confirmations, not live GPS. Tap the current step to move on.'],
      ['c-done', 'Delivered', 'Photo proof taken by the driver at the door, and the receipt with the same three lines.'],
      ['c-rate', 'Rate', 'Stars, quick tags and an optional comment. Submitting sets the next scheduled reminder.'],
      ['c-orders', 'Orders', 'History with one tap reorder: Reorder, then Pay. The date of the next scheduled reminder sits on top.'],
      ['c-rewards', 'Rewards and referral', 'Points and a referral link. The values shown are placeholders: the rewards mechanic is to confirm.'],
      ['c-profile', 'Profile and settings', 'Language any time, the reminder rhythm, order updates, help and safety tips, cancellation rules, privacy.'],
      ['c-help', 'Help with an order', 'Pick what went wrong, add a note, and the NakGas team answers in the app. Leak or safety goes to a safety screen first.'],
      ['c-receipt', 'Receipt', 'The full receipt with the three lines, the dealer and the payment, saved as a PDF.'],
      ['c-safety', 'Safety tips', 'What to do if you smell gas, and the everyday habits: upright cylinder, regulator off after cooking, open windows. Emergency 999.'],
      ['c-cancel', 'Cancellation rules', 'Free to cancel until the dealer sets off; after that the team handles it. The final rules are to confirm with VIN Industries.'],
      ['c-privacy', 'Privacy and consent', 'What NakGas keeps and why, consent switches (order updates, offers, location for the pin), and a request to delete the account. PDPA.'],
      ['c-iot', 'Smart regulator', 'Phase Two teaser, not in Phase One and not priced: a smart regulator reads the gas balance so the reorder can be predicted. Device type and safety questions are open.']
    ],
    d: [
      ['d-login', 'Login and role', 'Phone and OTP, then the role: shop operator or driver. One app for both. The language switch sits on this screen too.'],
      ['d-onboard', 'Onboarding', 'KPDN licence upload with its expiry date, SSM, bank account and radius. Then admin approval. Tap the licence row to upload, then submit.'],
      ['d-home', 'Home', 'Online or offline, today’s earnings, stock at a glance. Location is captured only while online. Go online and an order arrives in about 3 seconds.'],
      ['d-incoming', 'Incoming order', 'A live 45 second countdown. Accept, or decline and the order goes to the next nearest dealer. At zero it moves on by itself.'],
      ['d-job', 'Job detail', 'Address with the high-rise notes, payment type, and the driver and truck for the run.'],
      ['d-status', 'Status updates', 'Each step the driver confirms is the step the customer sees.'],
      ['d-photo', 'Photo proof', 'Mandatory: the order cannot close without it.'],
      ['d-cash', 'Cash collected', 'For cash on delivery the driver marks the cash as collected. How the RM3.50 fee on a cash order is settled (netted against the wallet) is our read, to confirm.'],
      ['d-wallet', 'Wallet and settlements', 'No commission: the gas price and the delivery fee are the dealer’s in full. Weekly payouts are a sample cadence.'],
      ['d-fleet', 'Fleet and stock', 'Drivers and trucks as separate records, stock by brand and size, delivery radius.'],
      ['d-add', 'Add a driver or truck', 'A driver with a phone number and a licence photo, or a truck with its plate. Admin checks documents before the first job.']
    ],
    a: [
      ['a-dash', 'Dashboard', 'Orders today, live, late, escalated, GMV and platform fees, and what needs a person now. Tiles open the detail.'],
      ['a-orders', 'Live orders', 'Every order with its full trail. NG-10488 was declined four times in a row and waits for an admin: assign it from the panel.'],
      ['a-suppliers', 'Suppliers and approvals', 'New dealers from the website form, with their documents, and KPDN licence expiry flags. Approvals here update the supplier map.'],
      ['a-map', 'Supplier map', 'Static heat map of dealers with radius circles on a stylised Johor Bahru, not to scale. Overlaps read as coverage; gaps show at a glance.'],
      ['a-settle', 'Settlements and fees', 'Weekly payouts with cash order fees netted, the platform fee setting (pending the price audit), promos and reports.']
    ]
  };
  var DM = {
    'c-find': [['Simulate a decline', 'find:decline'], ['Simulate four declines', 'find:esc']],
    'c-track': [['Next status', 'trk:next']],
    'd-onboard': [['Approve in admin', 'onb:approve']],
    'd-home': [['Send a test order', 'go:d-incoming']],
    'd-incoming': [['Restart the 45 seconds', 'go:d-incoming'], ['Jump to timeout', 'inc:timeout']],
    'a-orders': [['Reset the escalation', 'areset:1']]
  };

  /* ---------- shared bits */
  function hd(title, back, right) {
    return '<div class="uh">' + (back ? '<button class="bk" data-go="' + back + '" aria-label="' + L('Back', 'Kembali') + '">' + ic('chevL', 24) + '</button>' : '') + '<div class="tt">' + title + '</div>' + (right || '') + '</div>';
  }
  function bigHd(title, right) { return '<div class="uh"><div class="tt big">' + title + '</div>' + (right || '') + '</div>'; }
  function row(icn, t, s, go, right, cls) {
    var tag = go ? 'button' : 'div', at = go ? (go.indexOf(':') > 0 ? ' data-act="' + go + '"' : ' data-go="' + go + '"') : '';
    var r = right !== undefined && right !== null ? right : (go ? '<span class="rc">' + ic('chevR', 18) + '</span>' : '');
    return '<' + tag + at + ' class="ur"><span class="ri' + (cls ? ' ' + cls : '') + '">' + ic(icn) + '</span><span class="rt"><b>' + t + '</b>' + (s ? '<small>' + s + '</small>' : '') + '</span>' + r + '</' + tag + '>';
  }
  function kv(a, s, v, cls) { return '<div class="kv"><span>' + a + (s ? '<small>' + s + '</small>' : '') + '</span><span class="a' + (cls ? ' ' + cls : '') + '">' + v + '</span></div>'; }
  function fld(l, v) { return '<div class="fl"><small>' + l + '</small><div class="fi">' + v + '</div></div>'; }
  function opt(act, on, t, s) { return '<button class="opt' + (on ? ' on' : '') + '" data-act="' + act + '"><span class="rd"></span><span class="ot"><b>' + t + '</b>' + (s ? '<small>' + s + '</small>' : '') + '</span></button>'; }
  function tli(state, t, s, act) {
    var tag = act ? 'button' : 'div';
    return '<' + tag + (act ? ' data-act="' + act + '"' : '') + ' class="tli ' + state + '"><span class="dt">' + (state === 'dn' ? ic('check', 14) : '') + '</span><span class="tx"><b>' + t + '</b>' + (s ? '<small>' + s + '</small>' : '') + '</span></' + tag + '>';
  }
  function ring(left, total, warn) {
    var C = 2 * Math.PI * 64, off = C * (1 - left / total);
    return '<div class="ring"><svg width="168" height="168" viewBox="0 0 168 168"><circle cx="84" cy="84" r="64" fill="none" stroke="#E2E6EE" stroke-width="8"/><circle class="rg" cx="84" cy="84" r="64" fill="none" stroke="' + (warn ? '#E8890C' : '#0CA66A') + '" stroke-width="8" stroke-linecap="round" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '" transform="rotate(-90 84 84)"/></svg><div class="rn"><b>' + (warn ? ic('users', 40) : left) + '</b><small>' + (warn ? 'Admin' : L('seconds', 'saat')) + '</small></div></div>';
  }
  function upRing(left, total) {
    var g = $('#scrn .rg'), n = $('#scrn .rn b');
    if (!g || !n) return;
    var C = 2 * Math.PI * 64;
    g.setAttribute('stroke-dashoffset', (C * (1 - left / total)).toFixed(1));
    n.textContent = left;
  }
  function tabbar(cur) {
    var items = S.prod === 'c'
      ? [['c-home', 'home', L('Home', 'Utama')], ['c-orders', 'orders', L('Orders', 'Pesanan')], ['c-rewards', 'gift', L('Rewards', 'Ganjaran')], ['c-profile', 'user', L('Profile', 'Profil')]]
      : [['d-home', 'home', L('Home', 'Utama')], ['d-status', 'truck', L('Jobs', 'Tugasan')], ['d-wallet', 'wallet', L('Wallet', 'Dompet')], ['d-fleet', 'box', L('Fleet', 'Armada')]];
    return '<nav class="ut">' + items.map(function (x) { return '<button data-go="' + x[0] + '" class="' + (x[0] === cur ? 'on' : '') + '">' + ic(x[1], 24) + '<span>' + x[2] + '</span></button>'; }).join('') + '</nav>';
  }
  function phoneHTML(o) {
    return '<div class="scr' + (o.cls === 'splash' ? ' w' : '') + '">' +
      '<div class="sb"><span>9:41</span><span class="sbi">' + SBI + '</span></div>' +
      '<div class="ub' + (o.cls ? ' ' + o.cls : '') + '">' + o.b + '</div>' +
      (o.f ? '<div class="uf' + (o.t ? ' wt' : '') + '">' + o.f + '</div>' : '') +
      (o.t ? tabbar(o.t) : '') + '</div>';
  }
  function addrLine() { return S.c.addr === 'high' ? 'B-12-03, Pangsapuri Seri Austin' : '18, Jalan Molek 2/4, Taman Molek'; }
  function addrMeta() {
    return S.c.addr === 'high'
      ? L('High-rise, floor 12, ', 'Bangunan tinggi, tingkat 12, ') + (S.c.lift ? L('lift', 'ada lif') : L('stairs only', 'tangga sahaja'))
      : L('Landed house', 'Rumah bertanah');
  }
  function slots() { return [L('9am to 12pm', '9 pagi hingga 12 tengah hari'), L('12pm to 3pm', '12 tengah hari hingga 3 petang'), L('3pm to 6pm', '3 petang hingga 6 petang')]; }
  function dayName(i) { return i === 0 ? L('Today', 'Hari ini') : i === 1 ? L('Tomorrow', 'Esok') : fdate(dAdd(i), null, true); }
  function whenText() { return S.c.when === 'now' ? L('Now, nearest available dealer', 'Sekarang, pengedar terdekat yang ada') : dayName(S.c.day) + ', ' + slots()[S.c.slot]; }
  function payName() { return { fpx: L('FPX online banking', 'Perbankan dalam talian FPX'), card: L('Card', 'Kad'), ew: L('E-wallet', 'E-dompet'), cod: L('Cash on delivery', 'Tunai semasa penghantaran') }[S.c.pay]; }
  function billLines(withPromo) {
    var c = S.c, x = bill();
    return kv(L('LPG 14 kg, KPDN controlled price', 'LPG 14 kg, harga kawalan KPDN'), c.qty + ' × RM26.60 · ' + c.brand + ' · ' + (c.type === 'swap' ? L('swap', 'tukar tong') : L('new cylinder', 'tong baru')), rm(x.gas)) +
      (c.type === 'new' ? kv(L('Cylinder, new', 'Tong baru'), L('Price set by the dealer', 'Harga ditetapkan pengedar'), L('By dealer', 'Ikut pengedar'), 'm') : '') +
      kv(L('Delivery fee', 'Caj penghantaran'), c.qty + ' × RM3.40', rm(x.del)) +
      kv(L('Platform & processing fee', 'Fi platform & pemprosesan'), L('Once per order', 'Sekali bagi setiap pesanan'), rm(x.fee)) +
      (withPromo && c.promo ? kv(c.promo === 'code' ? L('Promo GASPERTAMA', 'Promo GASPERTAMA') : L('200 points used', '200 mata digunakan'), '', MINUS + rm(2)) : '') +
      '<div class="kv tot"><span>' + L('Total', 'Jumlah') + (c.type === 'new' ? '<small>' + L('plus the cylinder', 'tambah harga tong') + '</small>' : '') + '</span><span class="a">' + rm(x.tot) + '</span></div>';
  }
  function proofTall() {
    return '<svg viewBox="0 0 300 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="300" height="420" fill="#EEF1F6"/><rect y="330" width="300" height="90" fill="#DCE1EA"/>' +
      '<rect x="22" y="58" width="152" height="272" fill="#D2D9E5"/><rect x="32" y="68" width="132" height="262" fill="#C3CCDB"/><circle cx="148" cy="200" r="5" fill="#8A93A8"/>' +
      '<rect x="60" y="90" width="58" height="20" rx="2" fill="#fff"/><text x="89" y="104" font-size="12" font-weight="600" text-anchor="middle" fill="#4F5B76" font-family="Inter,sans-serif">B-12-03</text>' +
      '<g transform="translate(192 210)"><rect x="22" y="0" width="34" height="14" rx="4" fill="#8A93A8"/><rect x="0" y="14" width="78" height="112" rx="22" fill="#B3BCCB"/><rect x="0" y="56" width="78" height="15" fill="#9EA9BA"/></g>' +
      (S.d.shot ? '<rect x="12" y="12" width="168" height="28" rx="6" fill="#0B1530" fill-opacity=".62"/><text x="24" y="31" font-size="13" fill="#fff" font-family="Inter,sans-serif">' + tm(15, 6) + ' \u00b7 NG-10493</text>' : '') + '</svg>';
  }
  function proofSVG() {
    return '<svg viewBox="0 0 356 210" aria-hidden="true"><rect width="356" height="210" fill="#EEF1F6"/><rect y="168" width="356" height="42" fill="#DCE1EA"/>' +
      '<rect x="36" y="26" width="118" height="142" fill="#D2D9E5"/><rect x="45" y="35" width="100" height="133" fill="#C3CCDB"/><circle cx="133" cy="104" r="4" fill="#8A93A8"/>' +
      '<rect x="64" y="48" width="44" height="16" rx="2" fill="#fff"/><text x="86" y="60" font-size="12" font-weight="600" text-anchor="middle" fill="#4F5B76" font-family="Inter,sans-serif">' + (S.prod === 'd' || S.c.addr === 'high' ? 'B-12-03' : 'No. 18') + '</text>' +
      '<g transform="translate(208 76)"><rect x="18" y="0" width="28" height="11" rx="3" fill="#8A93A8"/><rect x="0" y="11" width="64" height="82" rx="17" fill="#B3BCCB"/><rect x="0" y="42" width="64" height="12" fill="#9EA9BA"/></g>' +
      '<rect x="10" y="10" width="156" height="26" rx="5" fill="#0B1530" fill-opacity=".62"/><text x="20" y="27" font-size="12" fill="#fff" font-family="Inter,sans-serif">' + (S.prod === 'd' ? tm(15, 6) + ' · NG-10493' : tm(15, 18) + ' · NG-10482') + '</text></svg>';
  }

  /* ---------- customer screens */
  var R = {};
  R['c-splash'] = function () {
    return { cls: 'splash', b: '<button class="spl" data-go="c-lang">' + stacked(150) + '<span class="tag">' + L('Your gas, without the phone call.', 'Gas sampai. Tak payah call.') + '</span><span class="tap">' + L('Tap to start', 'Ketik untuk mula') + '</span></button>' };
  };
  R['c-lang'] = function () {
    return {
      b: '<div class="top-mark">' + mark(40) + '</div><div class="ut1">' + L('Choose your language', 'Pilih bahasa anda') + '</div><div class="us">' + L('You can change this any time in Settings.', 'Anda boleh tukar bila-bila masa di Tetapan.') + '</div>' +
        opt('lang:bm', S.lang === 'bm', 'Bahasa Malaysia', 'Gunakan aplikasi dalam Bahasa Malaysia') + opt('lang:en', S.lang === 'en', 'English', 'Use the app in English'),
      f: '<button class="btn" data-go="c-otp">' + L('Continue', 'Teruskan') + '</button>'
    };
  };
  R['c-otp'] = function () {
    var c = S.c;
    var b = hd('', 'c-lang') + '<div class="ut1">' + L('Your phone number', 'Nombor telefon anda') + '</div><div class="us">' + L('We send a six digit code by SMS. No password needed.', 'Kami hantar kod enam digit melalui SMS. Tiada kata laluan diperlukan.') + '</div>' +
      fld(L('Phone number', 'Nombor telefon'), '<span class="pre">+60</span>12-345 6789');
    if (c.otp) b += '<div class="fl"><small>' + L('Enter the code sent to +60 12-345 6789', 'Masukkan kod yang dihantar ke +60 12-345 6789') + '</small><div class="otp"><i>4</i><i>8</i><i>2</i><i>1</i><i>0</i><i>6</i></div></div><div class="hint2">' + L('Resend code in 0:42', 'Hantar semula kod dalam 0:42') + '</div>';
    return { b: b, f: c.otp ? '<button class="btn" data-go="c-address">' + L('Verify', 'Sahkan') + '</button>' : '<button class="btn" data-act="otp">' + L('Send code', 'Hantar kod') + '</button>' };
  };
  R['c-address'] = function () {
    var c = S.c, hr = c.addr === 'high';
    var b = hd(L('Delivery address', 'Alamat penghantaran'), 'c-otp') + '<div class="us">' + L('So your dealer finds you on the first try.', 'Supaya pengedar terus jumpa tempat anda.') + '</div>' +
      '<div class="fl"><div class="sg"><button class="' + (hr ? '' : 'on') + '" data-act="addr:landed">' + ic('home', 18) + L('Landed', 'Rumah bertanah') + '</button><button class="' + (hr ? 'on' : '') + '" data-act="addr:high">' + ic('building', 18) + L('High-rise', 'Bangunan tinggi') + '</button></div></div>';
    if (!hr) {
      b += fld(L('Address', 'Alamat'), '18, Jalan Molek 2/4') + fld(L('Area and postcode', 'Kawasan dan poskod'), 'Taman Molek, 81100 Johor Bahru') + fld(L('Note for the dealer (optional)', 'Nota untuk pengedar (pilihan)'), L('Blue gate, corner house', 'Pagar biru, rumah lot tepi'));
    } else {
      b += fld(L('Building', 'Bangunan'), 'Pangsapuri Seri Austin, Blok B') + '<div class="two">' + fld('Unit', 'B-12-03') + fld(L('Floor', 'Tingkat'), '12') + '</div>' +
        '<div class="fl"><small>' + L('Lift to the unit', 'Lif ke unit') + '</small><div class="sg"><button class="' + (c.lift ? 'on' : '') + '" data-act="lift:1">' + L('Lift available', 'Ada lif') + '</button><button class="' + (c.lift ? '' : 'on') + '" data-act="lift:0">' + L('Stairs only', 'Tangga sahaja') + '</button></div></div>' +
        fld(L('Area and postcode', 'Kawasan dan poskod'), 'Mount Austin, 81100 Johor Bahru') + fld(L('Note for the dealer (optional)', 'Nota untuk pengedar (pilihan)'), L('Register at the guard house', 'Daftar di pondok pengawal'));
    }
    b += '<div class="uc p0">' + row('pin', L('Location pinned', 'Lokasi ditanda'), (hr ? 'Mount Austin' : 'Taman Molek') + ', Johor Bahru', null, '<span class="sig ok">' + ic('check', 14) + L('Set', 'Siap') + '</span>') + '</div>';
    return { b: b, f: '<button class="btn" data-go="c-home">' + L('Save address', 'Simpan alamat') + '</button>' };
  };
  R['c-home'] = function () {
    var h = new Date().getHours();
    var g = h < 12 ? L('Good morning', 'Selamat pagi') : h < 14 ? L('Good afternoon', 'Selamat tengah hari') : h < 19 ? L('Good afternoon', 'Selamat petang') : L('Good evening', 'Selamat malam');
    var b = '<div class="hm-top">' + lockup(27) + '<button class="ib" data-go="c-orders" aria-label="' + L('Notifications', 'Notifikasi') + '">' + ic('bell', 22) + '</button></div>' +
      '<div class="ut1">' + g + ', Aisyah</div>' +
      '<button class="adr" data-go="c-address">' + ic('pin', 18) + '<span>' + L('Home', 'Rumah') + ' · ' + addrLine() + '</span>' + ic('chevR', 16) + '</button>' +
      '<button class="uc" data-go="c-profile"><div class="lw">' + ic('bell', 22) + '<div><b>' + L('Time to reorder?', 'Masa untuk pesan semula?') + '<span class="sig low">' + L('Reminder', 'Peringatan') + '</span></b><small>' + L('Your last order was 26 days ago. You usually reorder every ' + S.c.remind + ' days.', 'Pesanan terakhir anda 26 hari lalu. Biasanya anda pesan semula setiap ' + S.c.remind + ' hari.') + '</small></div></div></button>' +
      '<div class="ul">' + L('Your usual', 'Pesanan biasa anda') + '</div>' +
      '<div class="uc hero-usual"><div class="hu-pic"><img src="assets/app/cyl.webp" alt="" width="300" height="230"></div><div class="hu-txt"><span class="sig ok">' + L('Usual order', 'Pesanan biasa') + '</span><b>LPG 14 kg · PETRONAS</b><small>' + L('Swap · 1 cylinder · FPX', 'Tukar tong · 1 tong · FPX') + '</small><div class="hu-amt">RM33.50</div></div>' +
      '<button class="btn2" data-act="reorder">' + ic('refresh', 18) + L('Reorder', 'Pesan semula') + '</button><div class="fine">' + L('Two taps: Reorder, then Pay.', 'Dua ketik: Pesan semula, kemudian Bayar.') + '</div></div>' +
      '<div class="uc p0">' + row('shield', L('Safety tip', 'Tip keselamatan'), L('Turn the regulator off after cooking.', 'Tutup regulator selepas memasak.')) + '</div>';
    return { b: b, f: '<button class="btn" data-go="c-order">' + ic('flame', 20) + L('Order gas', 'Pesan gas') + '</button>', t: 'c-home' };
  };
  R['c-order'] = function () {
    var c = S.c;
    var b = hd(L('Order gas', 'Pesan gas'), 'c-home') +
      '<div class="ul">' + L('Type', 'Jenis') + '</div>' +
      opt('type:swap', c.type === 'swap', L('Swap', 'Tukar tong'), L('Hand over your empty cylinder. Pay for the gas only.', 'Serahkan tong kosong anda. Bayar harga gas sahaja.')) +
      opt('type:new', c.type === 'new', L('New cylinder', 'Tong baru'), L('For a first cylinder. The cylinder price is added at checkout.', 'Untuk tong pertama. Harga tong ditambah semasa bayaran.')) +
      '<div class="ul">' + L('Size', 'Saiz') + '</div><div class="sz">' +
      '<button class="szb on" data-act="nop"><b>14 kg</b><small>' + L('Household', 'Rumah') + '</small></button>' +
      '<button class="szb" disabled><b>12 kg</b><small>' + L('Selected brands', 'Jenama terpilih') + '</small></button>' +
      '<button class="szb" disabled><b>C50</b><small>' + L('Phase Two', 'Fasa Dua') + '</small></button></div>' +
      '<div class="ul">' + L('Brand', 'Jenama') + '</div><div class="chipg">' + ['PETRONAS', 'Petron', 'MyGaz'].map(function (x) { return '<button class="ch' + (c.brand === x ? ' on' : '') + '" data-act="brand:' + x + '">' + x + '</button>'; }).join('') + '</div>' +
      '<div class="ul">' + L('Quantity', 'Kuantiti') + '</div><div class="uc qty"><div><b>' + c.qty + ' ' + (c.qty > 1 ? L('cylinders', 'tong') : L('cylinder', 'tong')) + '</b><small>RM26.60 ' + L('each, KPDN controlled price', 'setong, harga kawalan KPDN') + '</small></div><div class="stp"><button data-act="qty:-1" aria-label="' + L('Fewer', 'Kurang') + '">' + ic('minus', 20) + '</button><span>' + c.qty + '</span><button data-act="qty:1" aria-label="' + L('More', 'Tambah') + '">' + ic('plus', 20) + '</button></div></div>';
    return { b: b, f: '<div class="sum"><span>' + c.qty + ' × LPG 14 kg · ' + c.brand + '</span><b>' + rm(26.6 * c.qty) + '</b></div><button class="btn" data-go="c-when">' + L('Continue', 'Teruskan') + '</button>' };
  };
  R['c-when'] = function () {
    var c = S.c;
    var b = hd(L('When should it arrive?', 'Bila mahu dihantar?'), 'c-order') +
      opt('when:now', c.when === 'now', ic('flame', 18) + L('Now', 'Sekarang'), L('The nearest available dealer accepts and sets off.', 'Pengedar terdekat yang ada terima dan terus bergerak.')) +
      opt('when:later', c.when === 'later', ic('cal', 18) + L('Schedule', 'Jadualkan'), L('Pick a day and a time slot.', 'Pilih hari dan slot masa.'));
    if (c.when === 'later') {
      b += '<div class="ul">' + L('Day', 'Hari') + '</div><div class="chipg">' + [0, 1, 2].map(function (i) { return '<button class="ch' + (c.day === i ? ' on' : '') + '" data-act="day:' + i + '">' + dayName(i) + '</button>'; }).join('') + '</div>' +
        '<div class="ul">' + L('Time slot', 'Slot masa') + '</div><div class="chipg col">' + slots().map(function (s, i) { return '<button class="ch' + (c.slot === i ? ' on' : '') + '" data-act="slot:' + i + '">' + ic('clock', 18) + s + '</button>'; }).join('') + '</div>';
    }
    return { b: b, f: '<button class="btn" data-go="c-checkout">' + L('Continue', 'Teruskan') + '</button>' };
  };
  R['c-checkout'] = function () {
    var c = S.c, x = bill();
    var b = hd(L('Review and pay', 'Semak dan bayar'), 'c-when') +
      '<div class="uc p0">' + row('pin', L('Deliver to', 'Hantar ke'), addrLine() + '<br>' + addrMeta(), 'c-address') + row('clock', L('When', 'Bila'), whenText(), 'c-when') + '</div>' +
      '<div class="ul">' + L('Your bill', 'Bil anda') + '</div><div class="uc bill">' + billLines(true) + '</div>' +
      '<div class="uc p0"><button class="ur" data-act="promo:toggle"><span class="ri">' + ic('gift') + '</span><span class="rt"><b>' + L('Promo code or points', 'Kod promo atau mata') + '</b><small>' + L('One per order', 'Satu bagi setiap pesanan') + '</small></span><span class="rx">' + (c.promo ? L('Applied', 'Digunakan') : L('Add', 'Tambah')) + '</span></button>' +
      (c.promoOpen
        ? '<button class="ur sub" data-act="promo:code"><span class="rd' + (c.promo === 'code' ? ' on' : '') + '"></span><span class="rt"><b>GASPERTAMA</b><small>' + L('RM2.00 off this order', 'Potongan RM2.00 untuk pesanan ini') + '</small></span></button>' +
          '<button class="ur sub" data-act="promo:pts"><span class="rd' + (c.promo === 'pts' ? ' on' : '') + '"></span><span class="rt"><b>' + L('Use 200 points', 'Guna 200 mata') + '</b><small>' + L('RM2.00 off. You have 240 points.', 'Potongan RM2.00. Anda ada 240 mata.') + '</small></span></button>' +
          '<button class="ur sub" data-act="promo:none"><span class="rd' + (c.promo ? '' : ' on') + '"></span><span class="rt"><b>' + L('None', 'Tiada') + '</b></span></button>'
        : '') + '</div>' +
      '<div class="fine">' + L('The controlled price is set by KPDN. The delivery fee is set by the dealer for your area.', 'Harga kawalan ditetapkan oleh KPDN. Caj penghantaran ditetapkan oleh pengedar bagi kawasan anda.') + '</div>';
    return { b: b, f: '<button class="btn" data-go="c-pay">' + L('Continue to payment', 'Teruskan ke pembayaran') + ' · ' + rm(x.tot) + '</button>' };
  };
  R['c-pay'] = function () {
    var c = S.c, x = bill();
    var m = [
      ['fpx', 'bank', L('FPX online banking', 'Perbankan dalam talian FPX'), L('Pay straight from your bank account', 'Bayar terus dari akaun bank anda')],
      ['card', 'card', L('Card', 'Kad'), L('Debit or credit card', 'Kad debit atau kredit')],
      ['ew', 'wallet', L('E-wallet', 'E-dompet'), L('Wallets supported by the gateway', 'E-dompet yang disokong gerbang pembayaran')],
      ['cod', 'cash', L('Cash on delivery', 'Tunai semasa penghantaran'), L('Pay the dealer at your door', 'Bayar kepada pengedar di pintu anda')]
    ];
    var b = hd(L('Payment', 'Pembayaran'), 'c-checkout') + '<div class="uc p0">' + m.map(function (r) {
      return '<button class="ur" data-act="paym:' + r[0] + '"><span class="ri">' + ic(r[1]) + '</span><span class="rt"><b>' + r[2] + '</b><small>' + r[3] + '</small></span><span class="rd' + (c.pay === r[0] ? ' on' : '') + '"></span></button>';
    }).join('') + '</div>' +
      '<div class="fine" style="display:flex;gap:8px;align-items:flex-start">' + ic('lock', 16) + '<span>' + L('Online payments go through one Malaysian payment gateway.', 'Bayaran dalam talian melalui satu gerbang pembayaran Malaysia.') + '</span></div>' +
      '<div class="uc bill">' + kv(L('Total', 'Jumlah'), '', rm(x.tot)) + '</div>';
    return { b: b, f: '<button class="btn" data-act="pay">' + (c.pay === 'cod' ? L('Place order', 'Buat pesanan') + ' · ' + rm(x.tot) : L('Pay', 'Bayar') + ' ' + rm(x.tot)) + '</button>' };
  };
  R['c-find'] = function () {
    var f = S.c.find, b;
    if (f.ph === 'found') {
      b = '<div class="fd"><div class="okc">' + ic('check', 44) + '</div><div class="ut1 c">' + L('Dealer found', 'Pengedar ditemui') + '</div><div class="us c">' +
        (f.adm ? L('An admin assigned Kedai Gas Seri Molek to your order.', 'Admin telah menetapkan Kedai Gas Seri Molek untuk pesanan anda.') : L('Kedai Gas Seri Molek accepted your order.', 'Kedai Gas Seri Molek telah terima pesanan anda.')) + '</div></div>' +
        '<div class="uc"><div class="dlr">' + ic('truck', 28) + '<div><b>Kedai Gas Seri Molek</b><small>Rahman Yusof <span class="plate">JQA 4821</span></small></div></div><div class="priv">' + ic('lock', 16) + L('Phone numbers stay private on both sides.', 'Nombor telefon kekal peribadi bagi kedua-dua pihak.') + '</div></div>';
      return { b: b, f: '<button class="btn" data-act="track">' + L('Track order', 'Jejak pesanan') + '</button>' };
    }
    var esc = f.ph === 'esc';
    b = '<div class="fd fd-map"><div class="fd-bg" style="background-image:url(assets/app/map-find.webp)"></div><div class="fd-ring">' + ring(f.left, 45, esc) + '</div></div><div class="osm">© OpenStreetMap</div><div class="fd2"><div class="ut1 c">' + (esc ? L('Our team is on it', 'Pasukan kami sedang uruskan') : L('Finding your dealer', 'Mencari pengedar anda')) + '</div><div class="us c">' +
      (esc ? L('Four dealers nearby could not take it. An admin is assigning a dealer for you now.', 'Empat pengedar berhampiran tidak dapat terima. Admin sedang menetapkan pengedar untuk anda.') : L('The nearest dealer with stock has 45 seconds to accept.', 'Pengedar terdekat yang ada stok ada 45 saat untuk terima.')) + '</div></div>' +
      '<div class="uc tl">' +
      tli('dn', L('Order received', 'Pesanan diterima'), 'NG-10482') +
      tli('dn', L('Nearest dealer with stock found', 'Pengedar terdekat dengan stok ditemui'), f.n ? L('Dealer ' + Math.min(f.n + 1, 4) + ' of 4', 'Pengedar ' + Math.min(f.n + 1, 4) + ' daripada 4') : L('2.1 km away', '2.1 km dari anda')) +
      tli(esc ? 'dn' : 'cur', L('Waiting for the dealer to accept', 'Menunggu pengedar terima'), f.n && !esc ? L('The previous dealer could not take it. Sent to the next nearest.', 'Pengedar sebelumnya tidak dapat terima. Dihantar kepada yang terdekat seterusnya.') : '') +
      (esc ? tli('cur', L('Admin assigning a dealer', 'Admin sedang menetapkan pengedar'), '') : '') +
      '</div><div class="fine c">' + L('You never have to pick a dealer.', 'Anda tidak perlu pilih pengedar.') + '</div>';
    return { b: b, f: '<button class="btn2" data-act="cancel">' + L('Cancel order', 'Batal pesanan') + '</button>' };
  };
  R['c-track'] = function () {
    var k = S.c.trk, x = bill();
    var st = [[L('Order confirmed', 'Pesanan disahkan'), tm(14, 41)], [L('Dealer assigned', 'Pengedar ditetapkan'), tm(14, 42)], [L('Out for delivery', 'Dalam perjalanan'), k >= 3 ? tm(14, 55) : ''], [L('Delivered', 'Telah dihantar'), L('With photo proof', 'Dengan bukti foto')]];
    var head = k >= 3 ? L('Order received. Your dealer is on the way.', 'Pesanan diterima. Abang gas sedang dalam perjalanan.') : L('Dealer assigned. Your cylinder is being prepared.', 'Pengedar ditetapkan. Tong anda sedang disediakan.');
    var b = hd(L('Order status', 'Status pesanan'), 'c-home', '<span class="sig mute">NG-10482</span>') +
      '<div class="head-line">' + head + '</div>' +
      /* 21 Oct: a static delivery-area card, not live tracking (decision of 28 Sep: no live map for the customer in Phase One) */
      '<div class="uc p0 trk-map"><img src="assets/app/map-find.webp" alt="" width="900" height="773"><span class="eta"><b>' + L('0.9 km', '0.9 km') + '</b><small>' + L('Kedai Gas Seri Molek to you', 'Kedai Gas Seri Molek ke anda') + '</small></span><span class="osm">© OpenStreetMap</span></div>' +
      '<div class="uc tl">' + st.map(function (s, i) { var n = i + 1, state = n < k ? 'dn' : n === k ? 'cur' : 'pend'; return tli(state, s[0], s[1], n === k + 1 ? 'trk:next' : null); }).join('') + '</div>' +
      '<div class="uc"><div class="dlr">' + ic('truck', 28) + '<div><b>Kedai Gas Seri Molek</b><small>Rahman Yusof <span class="plate">JQA 4821</span></small></div></div><div class="priv">' + ic('lock', 16) + L('Phone numbers stay private on both sides.', 'Nombor telefon kekal peribadi bagi kedua-dua pihak.') + '</div></div>' +
      '<div class="uc p0">' + row('cyl', 'LPG 14 kg × ' + S.c.qty + ' · ' + S.c.brand, rm(x.tot) + ' · ' + payName()) + row('help', L('Help with this order', 'Bantuan untuk pesanan ini'), '', 'c-help') + '</div>';
    return { b: b };
  };
  R['c-done'] = function () {
    var b = hd(L('Delivered', 'Telah dihantar'), 'c-home') +
      '<div class="dn"><span class="okc sm">' + ic('check', 26) + '</span><div><div class="ut2">' + L('Your gas has arrived.', 'Gas anda sudah sampai.') + '</div><small>' + L('Delivered at ', 'Dihantar pada ') + tm(15, 18) + ' · NG-10482</small></div></div>' +
      '<div class="ul">' + L('Photo proof', 'Bukti foto') + '</div><div class="uc p0 proof"><div class="pp-img"><img src="assets/app/proof.webp" alt="" width="800" height="795"><span class="stamp">' + tm(15, 18) + ' · NG-10482</span></div><div class="pp-cap">' + L('Fitted by Rahman Yusof in your kitchen, ', 'Dipasang oleh Rahman Yusof di dapur anda, ') + tm(15, 18) + '</div></div>' +
      '<div class="ul">' + L('Receipt', 'Resit') + '</div><div class="uc bill">' + billLines(true) + kv(L('Paid by', 'Dibayar melalui'), '', payName(), 'm') + '</div>' +
      '<button class="btn3" data-go="c-receipt">' + ic('download', 18) + L('View receipt', 'Lihat resit') + '</button>';
    return { b: b, f: '<button class="btn" data-go="c-rate">' + L('Rate this delivery', 'Nilai penghantaran ini') + '</button>' };
  };
  R['c-rate'] = function () {
    var c = S.c;
    var words = ['', L('Poor', 'Teruk'), L('Could be better', 'Kurang baik'), L('Okay', 'Sederhana'), L('Good', 'Baik'), L('Excellent', 'Cemerlang')];
    var tags = [L('On time', 'Tepat masa'), L('Polite', 'Sopan'), L('Careful with the cylinder', 'Cermat dengan tong'), L('Carried it up', 'Bantu angkat ke atas')];
    var b = hd(L('Rate your delivery', 'Nilai penghantaran anda'), 'c-done') +
      '<div class="uc"><div class="dlr">' + ic('truck', 28) + '<div><b>Kedai Gas Seri Molek</b><small>Rahman Yusof <span class="plate">JQA 4821</span></small></div></div></div>' +
      '<div class="stars">' + [1, 2, 3, 4, 5].map(function (i) { return '<button data-act="star:' + i + '" class="' + (i <= c.stars ? 'on' : '') + '" aria-label="' + i + '">' + ic('star', 38) + '</button>'; }).join('') + '</div>' +
      '<div class="rtx c">' + (c.stars ? words[c.stars] : '<span style="color:var(--gs-mist);font-weight:500">' + L('Tap a star', 'Ketik bintang') + '</span>') + '</div>' +
      '<div class="chipg">' + tags.map(function (t, i) { return '<button class="ch' + (c.tags[i] ? ' on' : '') + '" data-act="tag:' + i + '">' + t + '</button>'; }).join('') + '</div>' +
      '<div class="fl" style="margin-top:16px"><small>' + L('Comment (optional)', 'Komen (pilihan)') + '</small><div class="fi ta">' + L('Tell us more', 'Ceritakan lagi') + '</div></div>';
    return { b: b, f: '<button class="btn' + (c.stars ? '' : ' off') + '" data-act="rate">' + L('Submit rating', 'Hantar penilaian') + '</button>' };
  };
  R['c-orders'] = function () {
    var rows = [[0, 'NG-10482'], [-28, 'GS-09611'], [-57, 'GS-08870'], [-85, 'GS-08102']];
    var b = bigHd(L('Orders', 'Pesanan')) +
      '<div class="uc p0">' + row('bell', L('Next reminder', 'Peringatan seterusnya'), fdate(dAdd(S.c.remind), null, true) + ' · ' + L('every ' + S.c.remind + ' days, from your rhythm', 'setiap ' + S.c.remind + ' hari, ikut kebiasaan anda'), 'c-profile') + '</div>' +
      rows.map(function (r) {
        return '<div class="uc oc"><div class="oh"><b>' + (r[0] === 0 ? L('Today', 'Hari ini') : fdate(dAdd(r[0]), null, true)) + '</b><span class="sig ok">' + L('Delivered', 'Dihantar') + '</span></div><div class="om">LPG 14 kg × 1 · PETRONAS · ' + L('Swap', 'Tukar tong') + '</div><div class="om2">' + r[1] + ' · RM33.50</div><button class="btn2 sm" data-act="reorder">' + ic('refresh', 16) + L('Reorder', 'Pesan semula') + '</button></div>';
      }).join('');
    return { b: b, t: 'c-orders' };
  };
  R['c-rewards'] = function () {
    var b = bigHd(L('Rewards', 'Ganjaran')) +
      '<div class="uc pts"><small>' + L('Your points', 'Mata anda') + '</small><div class="big">240</div><small>' + L('200 points take RM2.00 off an order. One promo or points per order.', '200 mata untuk potongan RM2.00. Satu promo atau mata bagi setiap pesanan.') + '</small></div>' +
      '<div class="ul">' + L('Invite a neighbour', 'Ajak jiran anda') + '</div><div class="uc"><div class="ref">' + ic('users', 26) + '<b>' + L('They get RM3.00 off their first order. You get 300 points.', 'Mereka dapat potongan RM3.00 untuk pesanan pertama. Anda dapat 300 mata.') + '</b></div><div class="code">AISYAH24</div><button class="btn" data-act="toast:share">' + ic('share', 18) + L('Share link', 'Kongsi pautan') + '</button></div>' +
      '<div class="ul">' + L('History', 'Sejarah') + '</div><div class="uc p0">' +
      row('cyl', L('Order', 'Pesanan') + ' NG-10482', L('Today', 'Hari ini'), null, '<span class="pv">+34</span>') +
      row('cyl', L('Order', 'Pesanan') + ' GS-09611', fdate(dAdd(-28)), null, '<span class="pv">+34</span>') +
      row('users', L('Referral: Faizal joined', 'Rujukan: Faizal menyertai'), fdate(dAdd(-40)), null, '<span class="pv">+300</span>') + '</div>';
    return { b: b, t: 'c-rewards' };
  };
  R['c-profile'] = function () {
    var c = S.c;
    var b = bigHd(L('Profile', 'Profil')) +
      '<div class="uc pr"><span class="av">A</span><div><b>Nur Aisyah Kamal</b><small>+60 12-345 6789</small></div></div>' +
      '<div class="ul">' + L('Settings', 'Tetapan') + '</div><div class="uc p0">' +
      '<div class="ur"><span class="ri">' + ic('globe') + '</span><span class="rt"><b>' + L('Language', 'Bahasa') + '</b></span><div class="sg mini"><button class="' + (S.lang === 'bm' ? 'on' : '') + '" data-act="lang:bm">BM</button><button class="' + (S.lang === 'en' ? 'on' : '') + '" data-act="lang:en">EN</button></div></div>' +
      row('pin', L('Saved addresses', 'Alamat tersimpan'), L('Home, Mum’s house', 'Rumah, Rumah mak'), 'c-address') +
      '<div class="ur"><span class="ri">' + ic('bell') + '</span><span class="rt"><b>' + L('Reorder reminder', 'Peringatan pesan semula') + '</b><small>' + L('A reminder every ' + c.remind + ' days, from your own rhythm', 'Peringatan setiap ' + c.remind + ' hari, ikut kebiasaan anda') + '</small></span><div class="stp sm"><button data-act="rem:-1" aria-label="' + L('Fewer days', 'Kurang hari') + '">' + ic('minus', 16) + '</button><span>' + c.remind + '</span><button data-act="rem:1" aria-label="' + L('More days', 'Lebih hari') + '">' + ic('plus', 16) + '</button></div></div>' +
      '<div class="ur"><span class="ri">' + ic('orders') + '</span><span class="rt"><b>' + L('Order updates', 'Kemas kini pesanan') + '</b><small>' + L('Push notifications', 'Notifikasi tolak') + '</small></span><button class="tg' + (c.notif ? ' on' : '') + '" data-act="notif" aria-label="' + L('Order updates', 'Kemas kini pesanan') + '"></button></div>' +
      '</div>' +
      '<div class="ul">' + L('Coming in Phase Two', 'Akan datang dalam Fasa Dua') + '</div><div class="uc p0">' + row('gauge', L('Smart regulator', 'Regulator pintar'), L('Predictive reorder from your real gas balance', 'Pesan semula ramalan daripada baki gas sebenar'), 'c-iot') + '</div>' +
      '<div class="ul">' + L('Help', 'Bantuan') + '</div><div class="uc p0">' +
      row('help', L('Help with an order', 'Bantuan untuk pesanan'), '', 'c-help') +
      row('shield', L('Safety tips', 'Tip keselamatan'), '', 'c-safety') +
      row('file', L('Cancellation rules', 'Peraturan pembatalan'), '', 'c-cancel') +
      row('lock', L('Privacy and consent', 'Privasi dan persetujuan'), '', 'c-privacy') +
      row('logout', L('Log out', 'Log keluar'), '', 'logout:1', '') + '</div>';
    return { b: b, t: 'c-profile' };
  };

  /* 21 Oct 2026: the screens behind the last dead buttons (Zieel: "the app complete") */
  R['c-help'] = function () {
    var c = S.c, iss = [['clock', L('My gas has not arrived', 'Gas saya belum sampai')], ['cyl', L('Wrong cylinder or brand', 'Tong atau jenama salah')], ['alert', L('Gas leak or a safety worry', 'Bocor gas atau risau keselamatan')], ['card', L('A payment problem', 'Masalah bayaran')], ['chat', L('Something else', 'Lain-lain')]];
    var b = hd(L('Help', 'Bantuan'), 'c-track') +
      '<div class="uc p0">' + row('cyl', 'NG-10482 · LPG 14 kg × ' + c.qty, 'Kedai Gas Seri Molek · ' + payName()) + '</div>' +
      '<div class="ul">' + L('What happened?', 'Apa yang berlaku?') + '</div>' +
      iss.map(function (x, i) { return opt('help:' + i, c.help === i, ic(x[0], 18) + x[1], ''); }).join('') +
      (c.help === 2 ? '<div class="uc warn">' + ic('alert', 22) + '<div><b>' + L('Safety first', 'Keselamatan dahulu') + '</b><small>' + L('Leave the kitchen, open the windows, light nothing. If it is serious, call 999.', 'Keluar dari dapur, buka tingkap, jangan nyalakan apa-apa. Jika serius, hubungi 999.') + '</small></div></div>' : '') +
      (c.help >= 0 ? '<div class="fl"><small>' + L('Add a note (optional)', 'Tambah nota (pilihan)') + '</small><div class="fi ta">' + L('Tell the team what you need', 'Beritahu pasukan apa yang anda perlukan') + '</div></div>' : '') +
      (c.helpSent ? '<div class="uc okm">' + ic('check', 20) + '<span>' + L('Sent. The NakGas team answers here in the app.', 'Dihantar. Pasukan NakGas akan menjawab di sini dalam aplikasi.') + '</span></div>' : '');
    return { b: b, f: c.help === 2 ? '<div class="two"><button class="btn2" data-go="c-safety">' + L('Safety tips', 'Tip keselamatan') + '</button><button class="btn" data-act="helpsend">' + L('Send to the team', 'Hantar kepada pasukan') + '</button></div>' : '<button class="btn' + (c.help >= 0 && !c.helpSent ? '' : ' off') + '" data-act="helpsend">' + L('Send to the team', 'Hantar kepada pasukan') + '</button>' };
  };
  R['c-receipt'] = function () {
    var x = bill();
    var b = hd(L('Receipt', 'Resit'), 'c-done') +
      '<div class="uc rcpt"><div class="rc-top">' + lockup(24) + '<span class="sig ok">' + L('Paid', 'Dibayar') + '</span></div>' +
      '<div class="rc-meta"><div><small>' + L('Order', 'Pesanan') + '</small><b>NG-10482</b></div><div><small>' + L('Date', 'Tarikh') + '</small><b>' + fdate(dAdd(0), null, true) + ', ' + tm(15, 18) + '</b></div></div>' +
      '<div class="rc-meta"><div><small>' + L('Delivered to', 'Dihantar ke') + '</small><b>' + addrLine() + '</b></div></div>' +
      '<div class="rc-meta"><div><small>' + L('Dealer', 'Pengedar') + '</small><b>Kedai Gas Seri Molek</b><small>' + L('KPDN licence on file', 'Lesen KPDN dalam rekod') + '</small></div></div>' +
      '<div class="rc-lines">' + billLines(true) + kv(L('Paid by', 'Dibayar melalui'), '', payName(), 'm') + '</div>' +
      '<div class="fine">' + L('Sample receipt from the prototype. Tax lines to confirm.', 'Contoh resit daripada prototaip. Baris cukai akan disahkan.') + '</div></div>';
    return { b: b, f: '<button class="btn" data-act="rcpt">' + ic('download', 18) + (S.c.saved ? L('Saved to your phone', 'Disimpan ke telefon anda') : L('Save as PDF', 'Simpan sebagai PDF')) + '</button>' };
  };
  R['c-safety'] = function () {
    var tips = [['nofire', L('Smell gas? Light nothing', 'Bau gas? Jangan nyalakan apa-apa'), L('Do not light a flame or press a switch. Turn the regulator off if it is safe.', 'Jangan nyalakan api atau tekan suis. Tutup regulator jika selamat.')],
      ['window', L('Open windows and doors', 'Buka tingkap dan pintu'), L('Let the air flow and leave the house. Call for help from outside.', 'Biarkan udara mengalir dan keluar dari rumah. Minta bantuan dari luar.')],
      ['cylinder', L('Keep the cylinder upright', 'Pastikan tong sentiasa tegak'), L('In a ventilated place, away from flames and direct sun, never inside a closed cabinet.', 'Di tempat berudara, jauh dari api dan matahari terus, bukan di dalam kabinet tertutup.')],
      ['switch', L('Regulator off after cooking', 'Tutup regulator selepas memasak'), L('One small habit. The home screen reminds you.', 'Satu tabiat kecil. Skrin utama akan mengingatkan anda.')]];
    var b = hd(L('Safety tips', 'Tip keselamatan'), 'c-profile') +
      '<div class="uc sos">' + ic('alert', 26) + '<div><b>' + L('Emergency: 999', 'Kecemasan: 999') + '</b><small>' + L('Call from outside the house if you smell a strong leak.', 'Hubungi dari luar rumah jika bau bocor kuat.') + '</small></div></div>' +
      '<div class="uc p0">' + tips.map(function (x) { return row(x[0], x[1], x[2]); }).join('') + '</div>' +
      '<div class="fine">' + L('General guidance. Follow your cylinder maker and your local authority.', 'Panduan umum. Ikut arahan pengeluar tong dan pihak berkuasa tempatan anda.') + '</div>';
    return { b: b };
  };
  R['c-cancel'] = function () {
    var b = hd(L('Cancellation rules', 'Peraturan pembatalan'), 'c-profile', '<span class="sig low">' + L('Draft', 'Draf') + '</span>') +
      '<div class="uc tl">' + tli('dn', L('Before a dealer accepts', 'Sebelum pengedar terima'), L('Cancel free from the order screen.', 'Batal percuma dari skrin pesanan.')) +
      tli('dn', L('After a dealer accepts, before he sets off', 'Selepas pengedar terima, sebelum bertolak'), L('Cancel free. The dealer is told at once.', 'Batal percuma. Pengedar dimaklumkan serta-merta.')) +
      tli('cur', L('After the dealer sets off', 'Selepas pengedar bertolak'), L('Ask the team from Help. The rule for this case is being set.', 'Minta bantuan pasukan melalui Bantuan. Peraturan untuk keadaan ini sedang ditetapkan.')) + '</div>' +
      '<div class="fine">' + L('Online payments for a cancelled order go back to the same method. The final rules are to confirm with VIN Industries.', 'Bayaran dalam talian untuk pesanan yang dibatalkan dikembalikan melalui kaedah yang sama. Peraturan akhir akan disahkan bersama VIN Industries.') + '</div>';
    return { b: b, f: '<button class="btn2" data-go="c-help">' + L('Ask the team', 'Tanya pasukan') + '</button>' };
  };
  R['c-privacy'] = function () {
    var c = S.c;
    function sw(k, on, t, sub) { return '<div class="ur"><span class="ri">' + ic(k === 'mkt' ? 'gift' : k === 'loc' ? 'pin' : 'orders') + '</span><span class="rt"><b>' + t + '</b><small>' + sub + '</small></span><button class="tg' + (on ? ' on' : '') + '" data-act="' + (k === 'notif' ? 'notif' : 'pv:' + k) + '" aria-label="' + t + '"></button></div>'; }
    var b = hd(L('Privacy and consent', 'Privasi dan persetujuan'), 'c-profile') +
      '<div class="us">' + L('NakGas keeps your phone number, addresses, orders and the photo proof, to deliver gas and settle disputes. Dealers see your address and order, never your number.', 'NakGas menyimpan nombor telefon, alamat, pesanan dan bukti foto anda, untuk menghantar gas dan menyelesaikan pertikaian. Pengedar melihat alamat dan pesanan anda, bukan nombor anda.') + '</div>' +
      '<div class="ul">' + L('Your consent', 'Persetujuan anda') + '</div><div class="uc p0">' +
      sw('notif', c.notif, L('Order updates', 'Kemas kini pesanan'), L('Needed to follow a delivery', 'Diperlukan untuk mengikuti penghantaran')) +
      sw('loc', c.loc, L('Location for the address pin', 'Lokasi untuk pin alamat'), L('Only while you set an address', 'Hanya semasa anda menetapkan alamat')) +
      sw('mkt', c.mkt, L('Offers and news', 'Tawaran dan berita'), L('Off unless you switch it on', 'Tutup kecuali anda hidupkan')) + '</div>' +
      '<div class="uc p0">' + row('file', L('Privacy policy', 'Dasar privasi'), L('Personal Data Protection Act 2010', 'Akta Perlindungan Data Peribadi 2010'), 'toast:pdpa') + row('trash', L('Delete my account', 'Padam akaun saya'), L('We confirm by SMS before anything is deleted', 'Kami sahkan melalui SMS sebelum apa-apa dipadam'), 'toast:del') + '</div>';
    return { b: b };
  };
  R['c-iot'] = function () {
    var p = 23, a0 = Math.PI * 0.75, sweep = Math.PI * 1.5, cx = 120, cy = 112, r = 92;
    function pt(t) { var a = a0 + sweep * t; return (cx + r * Math.cos(a)).toFixed(1) + ' ' + (cy + r * Math.sin(a)).toFixed(1); }
    var arc = function (t) { return 'M' + pt(0) + 'A' + r + ' ' + r + ' 0 ' + (sweep * t > Math.PI ? 1 : 0) + ' 1 ' + pt(t); };
    var b = hd(L('Smart regulator', 'Regulator pintar'), 'c-profile', '<span class="sig blue">' + L('Phase Two', 'Fasa Dua') + '</span>') +
      '<div class="gauge"><svg viewBox="0 0 240 190"><path d="' + arc(1) + '" fill="none" stroke="#E2E6EE" stroke-width="14" stroke-linecap="round"/><path d="' + arc(p / 100) + '" fill="none" stroke="#E8890C" stroke-width="14" stroke-linecap="round"/></svg><div class="gv"><b>' + p + '%</b><small>' + L('About 6 days left', 'Kira-kira 6 hari lagi') + '</small></div></div>' +
      '<div class="us c">' + L('A smart regulator reads the gas balance before the flame changes colour, so your next order is placed before you run out.', 'Regulator pintar membaca baki gas sebelum warna api berubah, supaya pesanan seterusnya dibuat sebelum gas habis.') + '</div>' +
      '<div class="uc p0">' + row('cpu', L('Fits your cylinder', 'Dipasang pada tong anda'), L('Weight based or regulator based, to be decided', 'Berasaskan berat atau regulator, belum diputuskan')) + row('bell', L('Predictive reorder', 'Pesan semula ramalan'), L('From the real balance, not the calendar', 'Daripada baki sebenar, bukan kalendar')) + '</div>';
    return { b: b, f: '<button class="btn2" disabled>' + L('Coming in Phase Two', 'Akan datang dalam Fasa Dua') + '</button>' };
  };

  /* ---------- dealer screens */
  var DRV = [['Rahman Yusof', 'JQA 4821'], ['Kumar Selvam', 'JRT 1907'], ['Lim Wei Jie', 'JVB 3356']];
  var STK = ['PETRONAS 14 kg', 'Petron 14 kg', 'MyGaz 14 kg'];
  R['d-login'] = function () {
    var d = S.d;
    var b = '<div class="dl-top">' + lockup(27) + '<span class="sig mute">' + L('Dealer', 'Pengedar') + '</span><div class="sg mini"><button class="' + (S.lang === 'bm' ? 'on' : '') + '" data-act="lang:bm">BM</button><button class="' + (S.lang === 'en' ? 'on' : '') + '" data-act="lang:en">EN</button></div></div>' +
      '<div class="ut1">' + L('Log in', 'Log masuk') + '</div><div class="us">' + L('One app for shop operators and drivers.', 'Satu aplikasi untuk operator kedai dan pemandu.') + '</div>' +
      fld(L('Phone number', 'Nombor telefon'), '<span class="pre">+60</span>17-208 5531') +
      '<div class="fl"><small>' + L('Code sent by SMS', 'Kod dihantar melalui SMS') + '</small><div class="otp"><i>7</i><i>3</i><i>0</i><i>9</i><i>5</i><i>2</i></div></div>' +
      '<div class="ul">' + L('Your role', 'Peranan anda') + '</div>' +
      opt('role:shop', d.role === 'shop', L('Shop operator', 'Operator kedai'), L('Orders, fleet, stock and wallet', 'Pesanan, armada, stok dan dompet')) +
      opt('role:driver', d.role === 'driver', L('Driver', 'Pemandu'), L('Jobs, status updates and photo proof', 'Tugasan, kemas kini status dan bukti foto'));
    return { b: b, f: '<button class="btn" data-go="d-onboard">' + L('Continue', 'Teruskan') + '</button>' };
  };
  R['d-onboard'] = function () {
    var d = S.d, b;
    if (d.sub === 1) {
      b = hd(L('Registration', 'Pendaftaran'), 'd-login') + '<div class="fd"><div class="okc" style="background:#FFF4E5;color:var(--gs-low-text)">' + ic('clock', 44) + '</div><div class="ut1 c">' + L('Waiting for admin approval', 'Menunggu kelulusan admin') + '</div><div class="us c">' + L('Admin checks your KPDN licence and SSM. You get a notification when it is done.', 'Admin akan semak lesen KPDN dan SSM anda. Anda akan terima notifikasi apabila selesai.') + '</div></div>' +
        '<div class="uc p0">' + row('file', L('KPDN licence', 'Lesen KPDN'), L('Received, under review', 'Diterima, sedang disemak'), null, '<span class="sig low">' + L('Review', 'Semakan') + '</span>') + row('building', 'SSM 202301045678', L('Received, under review', 'Diterima, sedang disemak'), null, '<span class="sig low">' + L('Review', 'Semakan') + '</span>') + '</div>';
      return { b: b, f: '<button class="btn2" data-act="onb:approve">' + ic('refresh', 18) + L('Check status', 'Semak status') + '</button>' };
    }
    if (d.sub === 2) {
      b = hd(L('Registration', 'Pendaftaran'), 'd-login') + '<div class="fd"><div class="okc">' + ic('check', 44) + '</div><div class="ut1 c">' + L('Approved', 'Diluluskan') + '</div><div class="us c">' + L('Kedai Gas Seri Molek can now go online and take orders.', 'Kedai Gas Seri Molek kini boleh masuk dalam talian dan terima pesanan.') + '</div></div>' +
        '<div class="uc p0">' + row('file', L('KPDN licence', 'Lesen KPDN'), L('Valid to ', 'Sah hingga ') + fdate(new Date(2027, 2, 31), null, false, true), null, '<span class="sig ok">' + L('Verified', 'Disahkan') + '</span>') + '</div>';
      return { b: b, f: '<button class="btn" data-go="d-home">' + L('Start', 'Mula') + '</button>' };
    }
    function ck(t, s) { return row('check', t, s, null, '', 'ok'); }
    b = hd(L('Register as a dealer', 'Daftar sebagai pengedar'), 'd-login') + '<div class="us">' + L('Admin checks every licence before your first order. Dealers pay no commission.', 'Admin semak setiap lesen sebelum pesanan pertama anda. Pengedar tidak dikenakan komisen.') + '</div>' +
      '<div class="uc p0">' +
      ck(L('Business and SSM', 'Perniagaan dan SSM'), 'Kedai Gas Seri Molek · SSM 202301045678') +
      (d.lic ? ck(L('KPDN licence', 'Lesen KPDN'), 'Lesen_KPDN.pdf · ' + L('expires ', 'tamat ') + fdate(new Date(2027, 2, 31), null, false, true))
        : '<button class="ur" data-act="lic"><span class="ri bl">' + ic('upload') + '</span><span class="rt"><b>' + L('Upload your KPDN licence', 'Muat naik lesen KPDN') + '</b><small>' + L('Photo or PDF, with the expiry date', 'Foto atau PDF, dengan tarikh tamat') + '</small></span><span class="rc">' + ic('chevR', 18) + '</span></button>') +
      ck(L('Bank account for payouts', 'Akaun bank untuk bayaran'), 'Maybank · •••• 4821') +
      ck(L('Delivery radius', 'Radius penghantaran'), '5 km ' + L('from the shop', 'dari kedai')) +
      ck(L('Opening stock', 'Stok permulaan'), 'PETRONAS, Petron, MyGaz · 14 kg') +
      '</div>' + (d.lic ? '<div class="fine">' + L('We remind you before the licence expires.', 'Kami ingatkan anda sebelum lesen tamat.') + '</div>' : '');
    return { b: b, f: '<button class="btn' + (d.lic ? '' : ' off') + '" data-act="onb:submit">' + L('Submit for approval', 'Hantar untuk kelulusan') + '</button>' };
  };
  R['d-home'] = function () {
    var d = S.d;
    var b = '<div class="dh-top"><div><small>' + L('Dealer', 'Pengedar') + '</small><b>Kedai Gas Seri Molek</b></div><span class="av sm">KM</span></div>' +
      '<button class="uc onl' + (d.online ? ' on' : '') + '" data-act="online"><div><div class="ut2">' + (d.online ? L('You are online', 'Anda dalam talian') : L('You are offline', 'Anda luar talian')) + '</div><small>' +
      (d.online ? L('Location shared for nearest orders. Waiting for an order.', 'Lokasi dikongsi untuk pesanan terdekat. Menunggu pesanan.') : L('Go online to receive orders near you. Location is shared only while online.', 'Masuk dalam talian untuk terima pesanan berhampiran. Lokasi dikongsi hanya semasa dalam talian.')) + '</small></div><span class="tg big' + (d.online ? ' on' : '') + '"></span></button>' +
      '<div class="two"><div class="uc st1"><small>' + L('Today’s earnings', 'Pendapatan hari ini') + '</small><b>RM240.00</b><small>' + L('8 deliveries', '8 penghantaran') + '</small></div><div class="uc st1"><small>' + L('Commission', 'Komisen') + '</small><b>RM0.00</b><small>' + L('Gas and delivery are yours', 'Gas dan caj hantar milik anda') + '</small></div></div>' +
      '<div class="ul">' + L('Stock', 'Stok') + '</div><div class="uc p0">' + STK.map(function (s, i) { return row('cyl', s, '', null, '<span class="rv">' + d.stock[i] + '</span>'); }).join('') + '</div>' +
      '<div class="ul">' + L('Active job', 'Tugasan aktif') + '</div>' +
      (d.acc ? '<div class="uc p0">' + row('truck', 'NG-10493 · Mount Austin', DRV[d.driver][0] + ' · ' + DRV[d.driver][1], 'd-status') + '</div>' : '<div class="fine">' + L('No active job.', 'Tiada tugasan aktif.') + '</div>');
    return { b: b, t: 'd-home' };
  };
  R['d-incoming'] = function () {
    var d = S.d;
    var b = '<div class="inc-h"><span class="sig blue">' + L('New order', 'Pesanan baru') + '</span><span>NG-10493</span></div>' + ring(d.t, 45) +
      '<div class="us c">' + L('Accept within 45 seconds, or it goes to the next nearest dealer.', 'Terima dalam 45 saat, atau pesanan pergi ke pengedar terdekat seterusnya.') + '</div>' +
      '<div class="uc p0">' + row('cyl', 'LPG 14 kg × 1 · PETRONAS', L('Swap', 'Tukar tong')) + row('pin', 'Mount Austin · 2.4 km', L('High-rise, floor 12, lift', 'Bangunan tinggi, tingkat 12, ada lif')) + row('cash', L('Cash on delivery', 'Tunai semasa penghantaran'), L('Collect RM33.50 at the door', 'Kutip RM33.50 di pintu')) + '</div>' +
      '<div class="uc earn"><span>' + L('You receive', 'Anda terima') + '</span><b>RM30.00</b><small>RM26.60 ' + L('gas', 'gas') + ' + RM3.40 ' + L('delivery. No commission.', 'penghantaran. Tiada komisen.') + '</small></div>';
    return { b: b, f: '<div class="two"><button class="btn2" data-act="inc:decline">' + L('Decline', 'Tolak') + '</button><button class="btn" data-act="inc:accept">' + L('Accept', 'Terima') + '</button></div>' };
  };
  R['d-job'] = function () {
    var d = S.d;
    var b = hd(L('Job', 'Tugasan') + ' NG-10493', 'd-home', '<span class="sig ok">' + L('Accepted ', 'Diterima ') + tm(14, 52) + '</span>') +
      '<div class="ul">' + L('Deliver to', 'Hantar ke') + '</div><div class="uc"><b class="blk">Siti</b><div>B-12-03, Pangsapuri Seri Austin, Blok B</div><div style="color:var(--gs-steel);font-size:14px">Jalan Austin Perdana 2, Mount Austin, 81100 Johor Bahru</div>' +
      '<div class="hrn"><span class="sig mute">' + ic('building', 14) + L('High-rise', 'Bangunan tinggi') + '</span><span class="sig mute">' + L('Floor 12', 'Tingkat 12') + '</span><span class="sig mute">' + L('Lift available', 'Ada lif') + '</span></div>' +
      '<div class="nt2">' + ic('file', 18) + '<span>' + L('Customer note: register at the guard house.', 'Nota pelanggan: daftar di pondok pengawal.') + '</span></div></div>' +
      '<div class="ul">' + L('Order', 'Pesanan') + '</div><div class="uc p0">' + row('cyl', 'LPG 14 kg × 1 · PETRONAS', L('Swap: collect the empty cylinder', 'Tukar tong: ambil tong kosong')) + row('cash', L('Cash on delivery', 'Tunai semasa penghantaran'), L('Collect RM33.50', 'Kutip RM33.50')) + '</div>' +
      '<div class="ul">' + L('Driver and truck', 'Pemandu dan lori') + '</div><div class="chipg col">' + DRV.slice(0, 2).map(function (x, i) { return '<button class="ch' + (d.driver === i ? ' on' : '') + '" data-act="drv:' + i + '">' + ic('truck', 18) + x[0] + ' <span class="plate">' + x[1] + '</span></button>'; }).join('') + '</div>';
    return { b: b, f: '<button class="btn" data-act="job:start">' + L('Start delivery', 'Mula penghantaran') + '</button>' };
  };
  R['d-status'] = function () {
    var d = S.d;
    var steps = [[L('Accepted', 'Diterima'), tm(14, 52)], [L('Driver assigned', 'Pemandu ditetapkan'), DRV[d.driver][0] + ' · ' + DRV[d.driver][1]], [L('Out for delivery', 'Dalam perjalanan'), tm(14, 55)], [L('Arrived', 'Tiba di lokasi'), d.st >= 4 ? tm(15, 4) : ''], [L('Delivered', 'Telah dihantar'), L('Photo proof required', 'Bukti foto wajib')]];
    var b = hd(L('Job', 'Tugasan') + ' NG-10493', 'd-home') + '<div class="us">' + L('Each step you confirm is the step the customer sees.', 'Setiap langkah yang anda sahkan dilihat oleh pelanggan.') + '</div>' +
      '<div class="uc tl">' + steps.map(function (s, i) { var n = i + 1, state = n < d.st ? 'dn' : n === d.st ? 'cur' : 'pend'; return tli(state, s[0], s[1]); }).join('') + '</div>' +
      '<div class="uc p0">' + row('pin', 'B-12-03, Pangsapuri Seri Austin', L('Floor 12, lift, register at the guard house', 'Tingkat 12, ada lif, daftar di pondok pengawal'), 'd-job') + '</div>';
    var f = d.st <= 3 ? '<button class="btn" data-act="st:arrive">' + L('Mark arrived', 'Tandakan tiba') + '</button>' : '<button class="btn" data-go="d-photo">' + ic('camera', 20) + L('Take photo proof', 'Ambil bukti foto') + '</button>';
    return { b: b, f: f, t: 'd-status' };
  };
  R['d-photo'] = function () {
    var d = S.d;
    var b = '<div class="cam-h"><button data-go="d-status" aria-label="' + L('Close', 'Tutup') + '">' + ic('x', 24) + '</button><span>' + L('Photo proof', 'Bukti foto') + '</span><span style="width:40px"></span></div>' +
      '<div class="vf">' + proofTall() + (d.shot ? '' : '<div class="fr"></div>') + '</div>' +
      '<div class="cam-t">' + (d.shot ? L('Photo saved with time and order number.', 'Foto disimpan dengan masa dan nombor pesanan.') : L('Show the cylinder and the unit door clearly.', 'Pastikan tong dan pintu unit jelas.')) + '</div>';
    var f = d.shot
      ? '<div class="two"><button class="btn2" data-act="shot:0">' + L('Retake', 'Ambil semula') + '</button><button class="btn" data-act="deliver">' + L('Confirm delivered', 'Sahkan dihantar') + '</button></div>'
      : '<div class="shut"><button data-act="shot:1" aria-label="' + L('Take photo', 'Ambil foto') + '"></button></div>';
    return { b: b, f: f, cls: 'cam', dark: true };
  };
  R['d-cash'] = function () {
    var d = S.d;
    var b = hd(L('Collect cash', 'Kutip tunai'), 'd-photo') + '<div class="cash-amt"><small>' + L('Collect from the customer', 'Kutip daripada pelanggan') + '</small><b>RM33.50</b></div>' +
      '<div class="uc bill">' + kv(L('LPG 14 kg, KPDN controlled price', 'LPG 14 kg, harga kawalan KPDN'), '', 'RM26.60') + kv(L('Delivery fee', 'Caj penghantaran'), '', 'RM3.40') + kv(L('Platform & processing fee', 'Fi platform & pemprosesan'), '', 'RM3.50') + '<div class="kv tot"><span>' + L('Total', 'Jumlah') + '</span><span class="a">RM33.50</span></div></div>' +
      '<div class="fine">' + L('RM30.00 is yours. The RM3.50 fee is settled against your wallet.', 'RM30.00 milik anda. Fi RM3.50 diselaraskan melalui dompet anda.') + '</div>' +
      '<button class="ckr' + (d.cash ? ' on' : '') + '" data-act="cashck"><span class="ck">' + ic('check', 16) + '</span>' + L('I have collected RM33.50 in cash', 'Saya telah terima RM33.50 tunai') + '</button>';
    return { b: b, f: '<button class="btn' + (d.cash ? '' : ' off') + '" data-act="cash">' + L('Mark cash collected', 'Tandakan tunai diterima') + '</button>' };
  };
  R['d-wallet'] = function () {
    var b = bigHd(L('Wallet', 'Dompet')) +
      '<div class="uc pts"><small>' + L('Next payout, this week', 'Bayaran seterusnya, minggu ini') + '</small><div class="big">RM1,236.00</div><small>' + L('To Maybank •••• 4821', 'Ke Maybank •••• 4821') + '</small></div>' +
      '<div class="uc p0">' + row('card', L('Online orders', 'Pesanan dalam talian'), L('40 orders, 44 cylinders at RM30.00', '40 pesanan, 44 tong pada RM30.00'), null, '<span class="rv">RM1,320.00</span>') +
      row('cash', L('Cash orders: fees due', 'Pesanan tunai: fi perlu dibayar'), L('24 orders at RM3.50', '24 pesanan pada RM3.50'), null, '<span class="rv">' + MINUS + 'RM84.00</span>') + '</div>' +
      '<div class="fine">' + L('No commission. The gas price and the delivery fee are yours in full.', 'Tiada komisen. Harga gas dan caj penghantaran milik anda sepenuhnya.') + '</div>' +
      '<div class="ul">' + L('Settlements', 'Penyelesaian') + '</div><div class="uc p0">' + [[-8, 'RM1,187.50'], [-15, 'RM1,302.00'], [-22, 'RM1,098.00']].map(function (r) {
        return row('bank', fdate(dAdd(r[0]), null, true), 'Maybank •••• 4821 · ' + L('Paid', 'Dibayar'), null, '<span class="rv">' + r[1] + '</span>');
      }).join('') + '</div>';
    return { b: b, t: 'd-wallet' };
  };
  R['d-fleet'] = function () {
    var d = S.d;
    var ds = [L('On a job', 'Sedang bertugas'), L('Available', 'Sedia'), L('Off today', 'Cuti hari ini')];
    var b = bigHd(L('Fleet and stock', 'Armada dan stok')) +
      '<div class="ul">' + L('Drivers', 'Pemandu') + '</div><div class="uc p0">' + DRV.map(function (x, i) { return row('user', x[0], ds[i], null, '<span class="sig ' + (i === 0 ? 'blue' : i === 1 ? 'ok' : 'mute') + '">' + (i === 2 ? L('Off', 'Cuti') : i === 0 ? L('Busy', 'Sibuk') : L('Free', 'Sedia')) + '</span>'); }).join('') + '</div>' +
      '<div class="ul">' + L('Trucks', 'Lori') + '</div><div class="uc p0">' + DRV.map(function (x, i) { return row('truck', '<span class="plate">' + x[1] + '</span>', i < 2 ? x[0] : L('Parked', 'Diparkir')); }).join('') + '</div>' +
      '<div class="ul">' + L('Stock by brand and size', 'Stok ikut jenama dan saiz') + '</div><div class="uc p0">' + STK.map(function (s, i) { return row('cyl', s, '', null, '<div class="stp sm"><button data-act="stk:' + i + ',-1" aria-label="' + L('Less', 'Kurang') + '">' + ic('minus', 16) + '</button><span>' + d.stock[i] + '</span><button data-act="stk:' + i + ',1" aria-label="' + L('More', 'Tambah') + '">' + ic('plus', 16) + '</button></div>'); }).join('') + '</div>' +
      '<div class="ul">' + L('Delivery radius', 'Radius penghantaran') + '</div><div class="uc p0">' + row('pin', d.radius + ' km ' + L('from the shop', 'dari kedai'), L('Orders outside it never reach you', 'Pesanan di luar radius tidak sampai kepada anda'), null, '<div class="stp sm"><button data-act="rad:-1" aria-label="' + L('Less', 'Kurang') + '">' + ic('minus', 16) + '</button><span>' + d.radius + '</span><button data-act="rad:1" aria-label="' + L('More', 'Tambah') + '">' + ic('plus', 16) + '</button></div>') + '</div>' +
      '<button class="btn3" data-go="d-add">' + ic('plus', 18) + L('Add a driver or truck', 'Tambah pemandu atau lori') + '</button>';
    return { b: b, t: 'd-fleet' };
  };


  R['d-add'] = function () {
    var d = S.d, dr = d.addk === 'driver';
    var b = hd(L('Add to your fleet', 'Tambah ke armada'), 'd-fleet') +
      '<div class="fl"><div class="sg"><button class="' + (dr ? 'on' : '') + '" data-act="addk:driver">' + ic('user', 18) + L('Driver', 'Pemandu') + '</button><button class="' + (dr ? '' : 'on') + '" data-act="addk:truck">' + ic('truck', 18) + L('Truck', 'Lori') + '</button></div></div>' +
      (dr ? fld(L('Full name', 'Nama penuh'), 'Mohd Rahim Ismail') + fld(L('Phone number', 'Nombor telefon'), '<span class="pre">+60</span>13-774 2190') +
        '<div class="uc p0">' + row('upload', L('Driving licence photo', 'Foto lesen memandu'), L('Front and back, valid date showing', 'Depan dan belakang, tarikh sah jelas'), null, '<span class="sig ok">' + ic('check', 14) + L('Added', 'Ditambah') + '</span>') + '</div>' +
        '<div class="fine">' + L('The driver logs in with this number and an SMS code.', 'Pemandu log masuk dengan nombor ini dan kod SMS.') + '</div>'
      : fld(L('Plate number', 'Nombor plat'), 'JUA 6610') + fld(L('Type', 'Jenis'), L('Lorry with a cylinder cage, 1 tonne', 'Lori dengan sangkar tong, 1 tan')) + fld(L('Capacity', 'Muatan'), L('40 cylinders of 14 kg', '40 tong 14 kg'))) +
      (d.added ? '<div class="uc okm">' + ic('check', 20) + '<span>' + L('Sent to admin. Ready for jobs once the documents are checked.', 'Dihantar kepada admin. Sedia untuk tugasan selepas dokumen disemak.') + '</span></div>' : '');
    return { b: b, f: '<button class="btn" data-act="addfleet">' + (dr ? L('Add driver', 'Tambah pemandu') : L('Add truck', 'Tambah lori')) + '</button>' };
  };
  /* ---------- admin portal (English only) */
  var ORD = [
    { id: 'NG-10488', area: 'Tampoi', dealer: '', st: 'esc', age: '6 min', dec: 4, pay: 'FPX' },
    { id: 'NG-10495', area: 'Skudai', dealer: 'Offered to Lim Gas Supply', st: 'search', age: '1 min', dec: 2, pay: 'Card' },
    { id: 'NG-10493', area: 'Mount Austin', dealer: 'Kedai Gas Seri Molek', st: 'out', age: '14 min', dec: 0, pay: 'Cash' },
    { id: 'NG-10491', area: 'Taman Molek', dealer: 'Kedai Gas Seri Molek', st: 'assigned', age: '9 min', dec: 1, pay: 'FPX' },
    { id: 'NG-10486', area: 'Tebrau', dealer: 'Tebrau Gas Trading', st: 'late', age: '52 min', dec: 0, pay: 'E-wallet' },
    { id: 'NG-10484', area: 'Permas Jaya', dealer: 'Permas Gas', st: 'out', age: '31 min', dec: 0, pay: 'Cash' },
    { id: 'NG-10482', area: 'Taman Molek', dealer: 'Kedai Gas Seri Molek', st: 'done', age: '37 min', dec: 0, pay: 'FPX' }
  ];
  var STN = { esc: ['Escalated', 'low'], search: ['Searching', 'blue'], out: ['Out for delivery', 'mute'], assigned: ['Dealer assigned', 'mute'], late: ['Late', 'low'], done: ['Delivered', 'ok'] };
  var TRAIL = {
    'NG-10488': [['2:49pm', 'Placed: 1 × LPG 14 kg, paid by FPX, Tampoi'], ['2:49pm', 'Offered to Tampoi Gas Centre, 1.2 km: <b>declined</b>', 'w'], ['2:50pm', 'Offered to Kedai Gas Bandar, 3.1 km: <b>no answer in 45 s</b>', 'w'], ['2:51pm', 'Offered to Lim Gas Supply Skudai, 3.8 km: <b>declined</b>', 'w'], ['2:52pm', 'Offered to Kedai Gas Seri Molek, 4.6 km: <b>declined</b>', 'w'], ['2:52pm', '<b>Escalated to Admin after 4 declines in a row</b>', 'w']],
    'NG-10495': [['2:57pm', 'Placed: 2 × LPG 14 kg, paid by card, Skudai'], ['2:57pm', 'Offered to Kedai Runcit Ah Hock: not approved, skipped'], ['2:57pm', 'Offered to Tampoi Gas Centre, 2.9 km: <b>declined</b>', 'w'], ['2:57pm', 'Offered to Lim Gas Supply Skudai, 3.4 km: waiting, 45 s window']],
    'NG-10493': [['2:51pm', 'Placed: 1 × LPG 14 kg, cash on delivery, Mount Austin, high-rise floor 12'], ['2:52pm', 'Offered to Kedai Gas Seri Molek, 2.4 km: <b>accepted</b>', 'o'], ['2:53pm', 'Driver Rahman Yusof, truck JQA 4821'], ['2:55pm', 'Out for delivery']],
    'NG-10491': [['2:56pm', 'Placed: 1 × LPG 14 kg, paid by FPX, Taman Molek'], ['2:56pm', 'Offered to Perniagaan Gas Austin, 1.9 km: <b>no answer in 45 s</b>', 'w'], ['2:57pm', 'Offered to Kedai Gas Seri Molek, 2.2 km: <b>accepted</b>', 'o']],
    'NG-10486': [['2:13pm', 'Placed: 1 × LPG 14 kg, e-wallet, Tebrau, scheduled 12pm to 3pm'], ['2:14pm', 'Offered to Tebrau Gas Trading, 1.4 km: <b>accepted</b>', 'o'], ['2:20pm', 'Out for delivery'], ['3:00pm', '<b>Late: past the end of the slot</b>', 'w']],
    'NG-10484': [['2:34pm', 'Placed: 1 × LPG 14 kg, cash on delivery, Permas Jaya'], ['2:34pm', 'Offered to Permas Gas, 0.8 km: <b>accepted</b>', 'o'], ['2:40pm', 'Out for delivery']],
    'NG-10482': [['2:41pm', 'Placed: 1 × LPG 14 kg, paid by FPX, Taman Molek'], ['2:42pm', 'Offered to Kedai Gas Seri Molek, 2.1 km: <b>accepted</b>', 'o'], ['2:55pm', 'Out for delivery'], ['3:18pm', '<b>Delivered, photo proof received</b>', 'o']]
  };
  var CAND = [['Tampoi Gas Centre', '1.2 km', 'declined at 2:49pm'], ['Kedai Gas Bandar', '3.1 km', 'no answer at 2:50pm'], ['Lim Gas Supply Skudai', '3.8 km', 'declined at 2:51pm'], ['Kedai Gas Seri Molek', '4.6 km', 'declined at 2:52pm']];
  var APPR = [
    { n: 'Gas Medini Utama', a: 'Medini, Iskandar Puteri', s: '2 hours ago', docs: [['ok', 'KPDN licence, expires ' + fdate(new Date(2027, 3, 30), 'en', false, true)], ['ok', 'SSM 202401023456'], ['ok', 'Bank account verified']] },
    { n: 'Pasir Gudang Gas Trading', a: 'Pasir Gudang', s: 'Yesterday', docs: [['ok', 'KPDN licence, expires ' + fdate(new Date(2027, 1, 15), 'en', false, true)], ['ok', 'SSM 201901038812'], ['low', 'Bank account: name mismatch']] },
    { n: 'Kedai Runcit Ah Hock', a: 'Skudai', s: '2 days ago', docs: [['bad', 'KPDN licence missing'], ['ok', 'SSM 202201017745'], ['ok', 'Bank account verified']] }
  ];
  function supRows() {
    return [
      ['Kedai Gas Seri Molek', 'Taman Molek', 3, 3, fdate(new Date(2027, 2, 31), 'en', false, true), 'ok', 'Active'],
      ['Perniagaan Gas Austin', 'Mount Austin', 2, 2, fdate(dAdd(12), 'en', false, true), 'low', 'Expires in 12 days'],
      ['Gas Indah Enterprise', 'Bukit Indah', 2, 1, fdate(dAdd(-4), 'en', false, true), 'bad', 'Expired 4 days ago'],
      ['Lim Gas Supply Skudai', 'Skudai', 2, 2, fdate(new Date(2027, 5, 30), 'en', false, true), 'ok', 'Active'],
      ['Tampoi Gas Centre', 'Tampoi', 3, 2, fdate(new Date(2027, 0, 14), 'en', false, true), 'ok', 'Active'],
      ['Kedai Gas Bandar', 'JB city centre', 2, 2, fdate(new Date(2027, 8, 2), 'en', false, true), 'ok', 'Active'],
      ['Tebrau Gas Trading', 'Tebrau', 1, 1, fdate(new Date(2026, 11, 9), 'en', false, true), 'ok', 'Active'],
      ['Permas Gas', 'Permas Jaya', 2, 2, fdate(new Date(2027, 4, 20), 'en', false, true), 'ok', 'Active']
    ];
  }
  function pendingN() { return S.a.appr.filter(function (x) { return x === 0; }).length; }
  function adm(id, title, inner, right) {
    var nav = [['a-dash', 'dash', 'Dashboard'], ['a-orders', 'orders', 'Live orders'], ['a-suppliers', 'users', 'Suppliers'], ['a-map', 'map', 'Supplier map'], ['a-settle', 'wallet', 'Settlements, fees']];
    return '<div class="dk"><div class="dk-top"><i></i><i></i><i></i><span>NakGas Admin · sample data</span></div><div class="dk-b"><aside class="dk-sd"><div class="lk">' + lockup(23) + '</div><div class="dk-sl">Admin portal</div>' +
      nav.map(function (n) {
        var badge = n[0] === 'a-orders' && !S.a.assigned ? '<span class="bdg w">1</span>' : n[0] === 'a-suppliers' && pendingN() ? '<span class="bdg">' + pendingN() + '</span>' : '';
        return '<button data-go="' + n[0] + '" class="' + (n[0] === id ? 'on' : '') + '">' + ic(n[1], 18) + n[2] + badge + '</button>';
      }).join('') +
      '<div class="dk-u">' + ic('user', 20) + '<span>Super admin<br><small>Sub-admins see only their scope</small></span></div></aside>' +
      '<main class="dk-m"><div class="dk-h"><div><div class="tt">' + title + '</div><small>' + fdate(T0, 'en', true, true) + ' · Johor Bahru · sample data</small></div>' + (right || '') + '</div>' + inner + '</main></div></div>';
  }
  function aChip(k, t) { return '<span class="sig ' + k + '">' + t + '</span>'; }
  function barsSVG() {
    var v = [6, 11, 15, 18, 21, 19, 17, 20, 21], n = 15, x0 = 30, w = 480, slot = w / n, bw = 18, base = 128, mx = 24;
    var s = '<svg class="bars" viewBox="0 0 520 150" role="img" aria-label="Orders by hour today, sample data">';
    [10, 20].forEach(function (g) { var y = base - g / mx * 110; s += '<line x1="' + x0 + '" x2="' + (x0 + w) + '" y1="' + y + '" y2="' + y + '" stroke="#EEF1F5"/><text x="' + (x0 - 6) + '" y="' + (y + 4) + '" text-anchor="end">' + g + '</text>'; });
    for (var i = 0; i < n; i++) {
      var x = x0 + i * slot + (slot - bw) / 2;
      if (i < v.length) { var h = v[i] / mx * 110; s += '<rect x="' + x.toFixed(1) + '" y="' + (base - h).toFixed(1) + '" width="' + bw + '" height="' + h.toFixed(1) + '" rx="2" fill="' + (i === v.length - 1 ? '#0CA66A' : '#B9C4D9') + '"/>'; }
      else s += '<rect x="' + x.toFixed(1) + '" y="' + (base - 2) + '" width="' + bw + '" height="2" fill="#E2E6EE"/>';
      if (i % 3 === 0) { var hr = 7 + i; s += '<text x="' + (x + bw / 2).toFixed(1) + '" y="146" text-anchor="middle">' + (hr % 12 || 12) + (hr < 12 ? 'am' : 'pm') + '</text>'; }
    }
    return s + '<line x1="' + x0 + '" x2="' + (x0 + w) + '" y1="' + base + '" y2="' + base + '" stroke="#CDD3DE"/></svg>';
  }
  function mapSVG() {
    var a = S.a;
    var sup = [[655, 300, 'ok'], [700, 182, 'low'], [225, 335, 'bad'], [265, 160, 'ok'], [415, 290, 'ok'], [560, 398, 'ok'], [605, 96, 'ok'], [770, 392, 'ok']];
    var pend = [[132, 420], [852, 340], [300, 196]];
    var areas = [['Skudai', 250, 128], ['Bukit Indah', 205, 374], ['Medini', 128, 392], ['Tampoi', 418, 268], ['JB city centre', 560, 426], ['Taman Molek', 655, 278], ['Mount Austin', 702, 158], ['Tebrau', 605, 72], ['Permas Jaya', 772, 372], ['Pasir Gudang', 852, 304]];
    var s = '<svg class="jbmap" viewBox="0 0 900 540" role="img" aria-label="Stylised map of Johor Bahru with dealers and their radius circles, sample data">' +
      '<rect width="900" height="540" fill="#F7F9FC"/>' +
      '<path d="M0 452C90 440 170 476 260 462S420 418 520 438 690 482 780 452 860 410 900 418V540H0Z" fill="#E3EBFA"/>' +
      '<path d="M0 514C160 502 300 518 450 508S740 502 900 512V540H0Z" fill="#ECEFF4"/><text x="450" y="532" text-anchor="middle" class="mt">Singapore</text><text x="620" y="486" class="mt">Straits of Johor</text>' +
      '<path d="M250 0C240 120 300 230 282 330S300 420 300 460" stroke="#E3EBFA" stroke-width="7" fill="none"/><path d="M730 0C700 120 760 220 722 330S740 420 735 452" stroke="#E3EBFA" stroke-width="6" fill="none"/>' +
      '<g stroke="#E1E6EE" stroke-width="4" fill="none" stroke-linecap="round"><path d="M330 0C350 120 420 220 470 300S540 400 560 440"/><path d="M40 300C200 302 350 300 470 300S700 290 900 300"/><path d="M560 440C600 330 640 220 700 0"/><path d="M110 440C200 380 300 340 420 300"/></g>';
    var live = sup.filter(function (p) { return p[2] !== 'bad'; }).concat(pend.filter(function (p, i) { return a.appr[i] === 1; }).map(function (p) { return [p[0], p[1], 'ok']; }));
    if (a.rad) live.forEach(function (p) { s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="80" fill="#0CA66A" fill-opacity=".08" stroke="#0CA66A" stroke-opacity=".5" stroke-width="1.25"/>'; });
    if (a.appr[0] !== 1) s += '<circle cx="132" cy="420" r="60" fill="none" stroke="#E8890C" stroke-width="1.5" stroke-dasharray="5 5"/><text x="132" y="352" text-anchor="middle" class="gp">Coverage gap</text>';
    if (a.appr[1] !== 1) s += '<circle cx="852" cy="338" r="60" fill="none" stroke="#E8890C" stroke-width="1.5" stroke-dasharray="5 5"/><text x="852" y="270" text-anchor="middle" class="gp">Coverage gap</text>';
    areas.forEach(function (t) { s += '<text x="' + t[1] + '" y="' + t[2] + '" text-anchor="middle" class="ma">' + t[0] + '</text>'; });
    var col = { ok: '#0B1530', low: '#E8890C', bad: '#C4292E' };
    sup.forEach(function (p) { s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="7.5" fill="' + col[p[2]] + '" stroke="#fff" stroke-width="2.5"/>'; });
    pend.forEach(function (p, i) {
      if (a.appr[i] === 1) s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="7.5" fill="#0B1530" stroke="#fff" stroke-width="2.5"/>';
      else if (a.pend && a.appr[i] === 0) s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="6.5" fill="#fff" stroke="#0B1530" stroke-width="2"/>';
    });
    return s + '</svg>';
  }
  R['a-dash'] = function () {
    var a = S.a;
    var k = [['Orders today', '148', '', 'a-orders'], ['Live now', '23', '', 'a-orders'], ['Late', '3', 'low', 'a-orders'], ['Escalated', a.assigned ? '0' : '1', a.assigned ? '' : 'low', 'a-orders'], ['GMV today', 'RM5,648.00', 's', 'a-settle'], ['Platform fees', 'RM518.00', 's', 'a-settle']];
    var att = (a.assigned ? '<button class="arow" data-go="a-orders"><span class="ic-o">' + ic('check', 20) + '</span><span class="rt"><b>NG-10488 assigned by admin</b><small>Tampoi · to ' + a.assigned + '</small></span>' + ic('chevR', 16) + '</button>'
      : '<button class="arow" data-act="sel:NG-10488"><span class="ic-w">' + ic('alert', 20) + '</span><span class="rt"><b>NG-10488 escalated after 4 declines</b><small>Tampoi · waiting 6 min for an admin</small></span>' + aChip('low', 'Assign') + '</button>') +
      '<button class="arow" data-go="a-suppliers"><span class="ic-w">' + ic('file', 20) + '</span><span class="rt"><b>KPDN licence expires in 12 days</b><small>Perniagaan Gas Austin</small></span>' + ic('chevR', 16) + '</button>' +
      '<button class="arow" data-go="a-suppliers"><span class="ic-b">' + ic('file', 20) + '</span><span class="rt"><b>KPDN licence expired</b><small>Gas Indah Enterprise · receives no offers</small></span>' + ic('chevR', 16) + '</button>' +
      (pendingN() ? '<button class="arow" data-go="a-suppliers"><span class="ic-s">' + ic('users', 20) + '</span><span class="rt"><b>' + pendingN() + ' new supplier' + (pendingN() > 1 ? 's' : '') + ' to review</b><small>From the website form</small></span>' + ic('chevR', 16) + '</button>' : '') +
      '<button class="arow" data-go="a-map"><span class="ic-s">' + ic('map', 20) + '</span><span class="rt"><b>Coverage gaps</b><small>' + (a.appr[0] === 1 && a.appr[1] === 1 ? 'None left on the map' : 'Medini and Pasir Gudang') + '</small></span>' + ic('chevR', 16) + '</button>';
    var inner = '<div class="kp">' + k.map(function (x) { return '<button class="kt ' + x[2] + '" data-go="' + x[3] + '"><small>' + x[0] + '</small><b class="' + (x[2] === 's' ? 's' : '') + '">' + x[1] + '</b></button>'; }).join('') + '</div>' +
      '<div class="dg"><div class="pn"><div class="pn-h">Orders by hour, today<small>Now: 3pm</small></div>' + barsSVG() + '</div><div class="pn"><div class="pn-h">Needs a person</div>' + att + '</div></div>' +
      '<div class="dg e"><div class="pn"><div class="pn-h">Order engine today</div><div class="setl"><span>Accepted on the first offer</span><span>81%</span><span>Declines</span><span>11</span><span>Timeouts (45 s)</span><span>6</span><span>Escalated to Admin</span><span>' + (a.assigned ? 0 : 1) + '</span></div></div>' +
      '<div class="pn"><div class="pn-h">Payment mix</div><div class="setl"><span>FPX</span><span>52</span><span>Card</span><span>21</span><span>E-wallet</span><span>27</span><span>Cash on delivery</span><span>48</span></div></div>' +
      '<div class="pn"><div class="pn-h">Busiest dealers</div><div class="setl"><span>Kedai Gas Seri Molek</span><span>21</span><span>Tampoi Gas Centre</span><span>18</span><span>Kedai Gas Bandar</span><span>16</span><span>Permas Gas</span><span>14</span></div></div></div>';
    return adm('a-dash', 'Dashboard', inner, '<button class="ab" data-act="exp:Daily report">' + ic('download', 16) + 'Export the day</button>');
  };
  R['a-orders'] = function () {
    var a = S.a;
    var rows = ORD.map(function (o) { var x = {}; for (var k in o) x[k] = o[k]; if (o.id === 'NG-10488' && a.assigned) { x.st = 'assigned'; x.dealer = a.assigned + ' (by admin)'; } return x; });
    var cnt = { all: rows.length, esc: 0, search: 0, late: 0 };
    rows.forEach(function (o) { if (cnt[o.st] !== undefined) cnt[o.st]++; });
    var shown = rows.filter(function (o) { return a.filter === 'all' || o.st === a.filter; });
    var tb = '<table class="at o"><thead><tr><th>Order</th><th>Area</th><th>Dealer</th><th>Status</th><th class="r">Age</th><th class="r">Declines</th></tr></thead><tbody>' +
      shown.map(function (o) {
        return '<tr class="ck' + (a.sel === o.id ? ' sel' : '') + '" data-act="sel:' + o.id + '"><td><b>' + o.id + '</b><small>' + o.pay + '</small></td><td>' + o.area + '</td><td class="dl" title="' + (o.dealer || 'None yet') + '">' + (o.dealer || '<span style="color:var(--gs-mist)">None yet</span>') + '</td><td>' + aChip(STN[o.st][1], STN[o.st][0]) + '</td><td class="r">' + o.age + '</td><td class="r">' + (o.dec >= 4 ? '<b style="color:var(--gs-low-text)">' + o.dec + '</b>' : o.dec) + '</td></tr>';
      }).join('') + (shown.length ? '' : '<tr><td colspan="6" style="color:#4F5B76">Nothing in this filter.</td></tr>') + '</tbody></table>';
    var sel = rows.filter(function (o) { return o.id === a.sel; })[0] || rows[0];
    var tr = (TRAIL[sel.id] || []).slice();
    if (sel.id === 'NG-10488' && a.assigned) tr.push(['3:01pm', '<b>Assigned by admin to ' + a.assigned + '</b>. Customer and dealer notified.', 'o']);
    var panel = '<div class="pn"><div class="pn-h">' + sel.id + aChip(STN[sel.st][1], STN[sel.st][0]) + '</div><div class="pn-h" style="font:400 13px/1.4 Inter,sans-serif;color:var(--gs-steel);margin-top:-4px">Trail</div><ul class="trl">' + tr.map(function (t) { return '<li class="' + (t[2] || '') + '"><span>' + t[0] + '</span><span>' + t[1] + '</span></li>'; }).join('') + '</ul>' +
      (sel.id === 'NG-10488' && !a.assigned ? '<div class="asg"><div class="pn-h">Assign by hand<small>After a call to the dealer</small></div>' + CAND.map(function (c, i) { return '<div class="arow"><span class="rt"><b>' + c[0] + '</b><small>' + c[1] + ' · ' + c[2] + '</small></span><button class="ab' + (i === 0 ? ' pri' : '') + '" data-act="assign:' + c[0] + '">Assign</button></div>'; }).join('') + '</div>' : '') + '</div>';
    var fl = [['all', 'All live'], ['esc', 'Escalated'], ['search', 'Searching'], ['late', 'Late']];
    var inner = '<div class="fbar">' + fl.map(function (f) { return '<button class="' + (a.filter === f[0] ? 'on' : '') + '" data-act="flt:' + f[0] + '">' + f[1] + ' ' + cnt[f[0]] + '</button>'; }).join('') + '</div>' +
      '<div class="dg o"><div class="pn" style="padding:6px 6px 0">' + tb + '</div>' + panel + '</div>';
    return adm('a-orders', 'Live orders', inner, '<small style="color:#4F5B76">Showing 7 of 23 live orders</small>');
  };
  R['a-suppliers'] = function () {
    var a = S.a;
    var cards = APPR.map(function (p, i) {
      var st = a.appr[i];
      var acts = st === 1 ? aChip('ok', 'Approved') : st === 2 ? aChip('bad', 'Rejected') : st === 3 ? aChip('blue', 'Licence requested') :
        (i === 2 ? '<button class="ab" data-act="appr:2,3">Ask for the licence</button><button class="ab" data-act="appr:2,2">Reject</button>' : '<button class="ab pri" data-act="appr:' + i + ',1">Approve</button><button class="ab" data-act="appr:' + i + ',2">Reject</button>');
      return '<div class="apc"><b>' + p.n + '</b><small>' + p.a + ' · submitted ' + p.s + '</small><div class="dc">' + p.docs.map(function (d) { return '<span>' + aChip(d[0], d[0] === 'ok' ? ic('check', 13) : ic('alert', 13)) + ' ' + d[1] + '</span>'; }).join('') + '</div><div class="ac">' + acts + '</div></div>';
    }).join('');
    var rows = supRows();
    APPR.forEach(function (p, i) { if (a.appr[i] === 1) rows.push([p.n, p.a, 1, 1, p.docs[0][1].replace('KPDN licence, expires ', ''), 'ok', 'Active, new']); });
    var tb = '<table class="at"><thead><tr><th>Supplier</th><th>Area</th><th class="r">Drivers</th><th class="r">Trucks</th><th>KPDN licence</th><th>Status</th><th></th></tr></thead><tbody>' +
      rows.map(function (r) {
        return '<tr><td><b>' + r[0] + '</b></td><td>' + r[1] + '</td><td class="r">' + r[2] + '</td><td class="r">' + r[3] + '</td><td>' + r[4] + '</td><td>' + aChip(r[5], r[6]) + '</td><td class="r">' + (r[5] !== 'ok' ? '<button class="ab" data-act="toast:renew">Send renewal reminder</button>' : '') + '</td></tr>';
      }).join('') + '</tbody></table>';
    var inner = '<div class="pn-h">Approvals queue<small>New dealers from the website form</small></div><div class="apg">' + cards + '</div>' +
      '<div class="pn" style="padding:6px 6px 0"><div class="pn-h" style="padding:10px 10px 0">Suppliers<small>Branches, drivers, trucks and documents sit on each record</small></div>' + tb + '</div>';
    return adm('a-suppliers', 'Suppliers and approvals', inner);
  };
  R['a-map'] = function () {
    var a = S.a;
    var inner = '<div class="dg m"><div class="pn" style="padding:8px">' + mapSVG() + '</div><div class="pn"><div class="pn-h">Layers</div>' +
      '<button class="tgl" data-act="maptg:rad">Radius circles<span class="tg' + (a.rad ? ' on' : '') + '"></span></button>' +
      '<button class="tgl" data-act="maptg:pend">Pending suppliers<span class="tg' + (a.pend ? ' on' : '') + '"></span></button>' +
      '<div class="pn-h" style="margin-top:14px">Key</div><div class="lg"><span><i></i>Approved dealer</span><span><i class="w"></i>Licence expiring soon</span><span><i class="b"></i>Licence expired, no offers</span><span><i class="p"></i>Pending approval</span><span><i class="r"></i>Delivery radius, 5 km</span><span><i class="g"></i>Coverage gap</span></div>' +
      '<div class="pn-h" style="margin-top:14px">Read</div><div style="font-size:13px;color:#4F5B76;line-height:1.5">Darker blue where radii overlap: more dealers can take an order there. Approving the pending dealers in Medini and Pasir Gudang closes both gaps.</div>' +
      '<button class="ab" style="margin-top:12px" data-go="a-suppliers">Open approvals</button></div></div>' +
      '<div style="font-size:12.5px;color:var(--gs-mist)">Stylised Johor Bahru, not to scale and not a map tile. Static in Phase One; a live map for customers is Phase Two.</div>';
    return adm('a-map', 'Supplier map', inner);
  };
  R['a-settle'] = function () {
    var a = S.a;
    var st = [['Kedai Gas Seri Molek', 40, 'RM1,320.00', 24, 'RM84.00', 'RM1,236.00'], ['Perniagaan Gas Austin', 22, 'RM720.00', 15, 'RM52.50', 'RM667.50'], ['Tampoi Gas Centre', 31, 'RM990.00', 18, 'RM63.00', 'RM927.00'], ['Kedai Gas Bandar', 27, 'RM840.00', 9, 'RM31.50', 'RM808.50']];
    var tb = '<table class="at"><thead><tr><th>Dealer</th><th class="r">Online orders</th><th class="r">Owed: gas + delivery</th><th class="r">Cash orders</th><th class="r">Fees due on cash</th><th class="r">Net payout</th><th>Status</th></tr></thead><tbody>' +
      st.map(function (r, i) { var paid = a.paid || i === 3; return '<tr><td><b>' + r[0] + '</b></td><td class="r">' + r[1] + '</td><td class="r">' + r[2] + '</td><td class="r">' + r[3] + '</td><td class="r">' + MINUS + r[4] + '</td><td class="r"><b>' + r[5] + '</b></td><td>' + aChip(paid ? 'ok' : 'blue', paid ? 'Paid' : 'Ready') + '</td></tr>'; }).join('') + '</tbody></table>';
    var inner = '<div class="pn" style="padding:6px 6px 10px;margin-bottom:12px"><div class="pn-h" style="padding:10px 10px 0">This week’s settlements<small>No commission: dealers keep RM26.60 + RM3.40 per cylinder</small></div>' + tb +
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 10px 0"><small style="color:#4F5B76;font-size:12.5px">Cash orders: the dealer holds RM33.50 and owes the RM3.50 fee, netted here. Netting method to confirm.</small>' + (a.paid ? aChip('ok', 'Payouts approved') : '<button class="ab pri" data-act="payout">Approve 3 payouts</button>') + '</div></div>' +
      '<div class="dg e"><div class="pn"><div class="pn-h">Platform fee<small>Per order, not per cylinder</small></div>' +
      '<button class="feeo' + (a.fee === 'a' ? ' on' : '') + '" data-act="fee:a"><span class="rd' + (a.fee === 'a' ? ' on' : '') + '"></span><span><b>Option A: RM3.00</b><small>Gateway, about 66 sen, absorbed. About RM2.34 kept</small></span></button>' +
      '<button class="feeo' + (a.fee === 'b' ? ' on' : '') + '" data-act="fee:b"><span class="rd' + (a.fee === 'b' ? ' on' : '') + '"></span><span><b>Option B: RM3.50</b><small>Platform and processing fee. About 67 sen gateway, about RM2.83 kept</small></span></button>' +
      aChip('low', 'Pending the price audit') + '</div>' +
      '<div class="pn"><div class="pn-h">Engine and app settings</div><div class="setl"><span>Acceptance window</span><span>45 s</span><span>Declines before Admin</span><span>4 in a row</span><span>Default delivery radius</span><span>5 km</span><span>Delivery fee, JB landed</span><span>RM3.40</span><span>High-rise tiers</span><span>To confirm</span><span>Reorder reminder default</span><span>28 days</span><span>App languages</span><span>BM, EN</span></div></div>' +
      '<div class="pn"><div class="pn-h">Promos and reports</div><div class="setl"><span>GASPERTAMA, RM2.00 off</span><span>412 uses</span><span>Points: 200 for RM2.00</span><span>On</span><span>Rule</span><span>One per order</span></div>' +
      '<div class="pn-h" style="margin-top:14px">Export</div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="ab" data-act="exp:Excel">' + ic('download', 15) + 'Excel</button><button class="ab" data-act="exp:CSV">' + ic('download', 15) + 'CSV</button><button class="ab" data-act="exp:Print">' + ic('print', 15) + 'Print</button></div></div></div>';
    return adm('a-settle', 'Settlements and fees', inner);
  };

  /* ---------- timers, toast */
  var TM = [];
  function later(ms, f) { TM.push(setTimeout(f, ms)); }
  function every(ms, f) { TM.push(setInterval(f, ms)); }
  function clearT() { TM.forEach(function (t) { clearTimeout(t); clearInterval(t); }); TM = []; }
  var tt;
  function toast(m) { var t = $('#toast'); if (!t) return; t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(function () { t.classList.remove('on'); }, 2800); }
  function here(id) { return S.cur[S.prod] === id; }

  /* ---------- navigation */
  function enter(id) {
    if (id === 'c-otp') S.c.otp = false;
    if (id === 'c-find') {
      S.c.find = { n: 0, ph: 'offer', left: 45, el: 0, adm: false };
      every(1000, function () {
        if (!here('c-find')) return;
        var f = S.c.find; if (f.ph !== 'offer') return;
        f.left--; f.el++;
        if (f.el >= 6) { f.ph = 'found'; render(); return; }
        upRing(f.left, 45);
      });
    }
    if (id === 'c-track' && S.c.trk < 2) S.c.trk = 2;
    if (id === 'd-incoming') {
      S.d.t = 45;
      every(1000, function () {
        if (!here('d-incoming')) return;
        S.d.t--;
        if (S.d.t <= 0) { toast(L('Time is up. The order went to the next nearest dealer.', 'Masa tamat. Pesanan dihantar kepada pengedar terdekat seterusnya.')); go('d-home'); return; }
        upRing(S.d.t, 45);
      });
    }
    if (id === 'd-status' && S.d.st < 3) S.d.st = 3;
    if (id === 'd-photo') S.d.shot = false;
    if (id === 'd-cash') S.d.cash = false;
  }
  function go(id) {
    var p = id.charAt(0);
    clearT();
    if (p !== S.prod) { S.prod = p; buildFrame(); buildList(); syncBar(); }
    S.cur[p] = id;
    enter(id);
    render(true);
  }
  function render(fresh) {
    var id = S.cur[S.prod], el = $('#scrn'); if (!el) return;
    var sc = el.querySelector(S.prod === 'a' ? '.dk-m' : '.ub'), top = (!fresh && sc && el.getAttribute('data-id') === id) ? sc.scrollTop : 0;
    var r = R[id]();
    if (S.prod === 'a') el.innerHTML = r;
    else { el.innerHTML = phoneHTML(r); var ps = $('.ph-scr'); if (ps) ps.classList.toggle('dark', !!r.dark); }
    el.setAttribute('data-id', id);
    sc = el.querySelector(S.prod === 'a' ? '.dk-m' : '.ub'); if (sc && top) sc.scrollTop = top;
    syncList(); cap(); HOOKS.forEach(function (h) { h(id); });
  }
  function buildFrame() {
    if (!OLD) return;
    var st = $('#stage');
    st.innerHTML = S.prod === 'a'
      ? '<div class="fitbox" id="fit"><div class="dev" id="dev"><div id="scrn"></div><div class="toast" id="toast" role="status"></div></div></div>'
      : '<div class="fitbox" id="fit"><div class="dev" id="dev"><div class="ph"><div class="ph-scr"><div id="scrn"></div><div class="toast" id="toast" role="status"></div><div class="ph-isl"></div><div class="ph-hi"></div></div></div></div></div>';
    if (S.prod === 'a') { var d = $('#dev'); d.style.width = '1200px'; d.style.height = '760px'; var t = $('#toast'); t.style.cssText = 'left:auto;right:24px;top:auto;bottom:24px;width:380px'; }
    fit();
  }
  function fit() {
    if (!OLD) return;
    var st = $('#stage'), fb = $('#fit'), dv = $('#dev'); if (!st || !fb || !dv) return;
    var w = st.clientWidth - 4, W, H, s;
    if (S.prod === 'a') { W = 1200; H = 760; s = Math.min(1, w / W); if (s < 0.5) s = 0.5; }
    else { W = 410; H = 864; var vh = (window.innerHeight || 900) - 150; s = Math.min(1, w / W, Math.max(0.62, vh / H)); }
    fb.style.width = Math.floor(W * s) + 'px'; fb.style.height = Math.floor(H * s) + 'px';
    dv.style.transform = 'scale(' + s + ')';
  }
  function buildList() {
    if (!OLD) return;
    var L0 = LIST[S.prod];
    $('#ptList').innerHTML = '<div class="pt-lh">' + PRODN[S.prod] + ' · ' + L0.length + ' screens</div><ol>' + L0.map(function (x, i) { return '<li><button data-scr="' + x[0] + '"><span>' + (i + 1) + '</span>' + x[1] + (x[0] === 'c-iot' ? '<em>Phase Two</em>' : '') + '</button></li>'; }).join('') + '</ol>';
    $('#ptSel').innerHTML = L0.map(function (x, i) { return '<option value="' + x[0] + '">' + (i + 1) + '. ' + x[1] + (x[0] === 'c-iot' ? ' (Phase Two)' : '') + '</option>'; }).join('');
  }
  function syncList() {
    if (!OLD) return;
    var id = S.cur[S.prod];
    $$('#ptList button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-scr') === id); });
    var sel = $('#ptSel'); if (sel) sel.value = id;
  }
  function syncBar() {
    if (!OLD) return;
    $$('#ptProd button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-prod') === S.prod); });
    $$('#ptLang button').forEach(function (b) { b.classList.toggle('on', S.prod !== 'a' && b.getAttribute('data-lang') === S.lang); b.disabled = S.prod === 'a'; });
    var n = $('#ptLangNote'); if (n) n.textContent = S.prod === 'a' ? 'Admin portal is in English' : '';
  }
  function cap() {
    if (!OLD) return;
    var L0 = LIST[S.prod], id = S.cur[S.prod], i = 0;
    for (var j = 0; j < L0.length; j++) if (L0[j][0] === id) i = j;
    $('#capK').textContent = PRODN[S.prod] + ' · ' + (i + 1) + ' of ' + L0.length;
    $('#capT').textContent = L0[i][1];
    $('#capD').textContent = L0[i][2];
    var prev = i > 0 ? L0[i - 1][0] : '', next = i < L0.length - 1 ? L0[i + 1][0] : '';
    $('#capX').innerHTML = (prev ? '<button class="tbtn" data-scr="' + prev + '">' + ic('chevL', 16) + 'Previous</button>' : '') + (next ? '<button class="tbtn" data-scr="' + next + '">Next screen' + ic('chevR', 16) + '</button>' : '') +
      ((DM[id] || []).length ? '<span class="lbl" style="margin-left:8px">Try</span>' + DM[id].map(function (d) { return '<button class="tbtn" data-act="' + d[1] + '">' + d[0] + '</button>'; }).join('') : '');
  }

  /* ---------- actions */
  var A = {
    nop: function () {},
    go: function (v) { go(v); },
    lang: function (v) { S.lang = v; syncBar(); render(); },
    otp: function () { S.c.otp = true; render(); },
    addr: function (v) { S.c.addr = v; render(); },
    lift: function (v) { S.c.lift = v === '1'; render(); },
    type: function (v) { S.c.type = v; render(); },
    brand: function (v) { S.c.brand = v; render(); },
    qty: function (v) { S.c.qty = Math.max(1, Math.min(4, S.c.qty + (+v))); render(); },
    when: function (v) { S.c.when = v; render(); },
    day: function (v) { S.c.day = +v; render(); },
    slot: function (v) { S.c.slot = +v; render(); },
    promo: function (v) { if (v === 'toggle') S.c.promoOpen = !S.c.promoOpen; else { S.c.promo = v === 'none' ? '' : v; S.c.promoOpen = false; } render(); },
    paym: function (v) { S.c.pay = v; render(); },
    pay: function () { go('c-find'); },
    find: function (v) {
      var f = S.c.find; if (f.ph !== 'offer') return;
      f.n = v === 'esc' ? 4 : f.n + 1; f.left = 45; f.el = 0;
      if (f.n >= 4) {
        f.ph = 'esc'; render();
        later(3500, function () { if (here('c-find') && S.c.find.ph === 'esc') { S.c.find.ph = 'found'; S.c.find.adm = true; render(); } });
      } else render();
    },
    track: function () { S.c.trk = 2; go('c-track'); },
    trk: function () { if (S.c.trk < 3) { S.c.trk = 3; render(); } else { S.c.trk = 4; go('c-done'); } },
    star: function (v) { S.c.stars = +v; render(); },
    tag: function (v) { S.c.tags[v] = !S.c.tags[v]; render(); },
    rate: function () {
      if (!S.c.stars) { toast(L('Tap a star first.', 'Ketik bintang dahulu.')); return; }
      S.c.stars = 0; S.c.tags = {}; go('c-home');
      toast(L('Thank you. Your next reminder comes in about ' + S.c.remind + ' days.', 'Terima kasih. Peringatan seterusnya dalam kira-kira ' + S.c.remind + ' hari.'));
    },
    reorder: function () { var c = S.c; c.type = 'swap'; c.brand = 'PETRONAS'; c.qty = 1; c.when = 'now'; c.promo = ''; c.promoOpen = false; c.pay = 'fpx'; go('c-checkout'); },
    rem: function (v) { S.c.remind = Math.max(14, Math.min(45, S.c.remind + (+v))); render(); },
    notif: function () { S.c.notif = !S.c.notif; render(); },
    logout: function () { var l = S.lang; S.c = freshC(); S.lang = l; go('c-splash'); },
    cancel: function () { go('c-home'); toast(L('Order cancelled.', 'Pesanan dibatalkan.')); },
    toast: function (k) {
      var m = {
        na: L('Not part of this prototype.', 'Tiada dalam prototaip ini.'),
        share: L('Referral link copied.', 'Pautan rujukan disalin.'),
        pdpa: L('Opening the privacy policy.', 'Membuka dasar privasi.'),
        del: L('We sent an SMS to confirm the request.', 'Kami hantar SMS untuk mengesahkan permintaan.'),
        renew: 'Renewal reminder sent to the dealer. Sample only.'
      };
      toast(m[k] || m.na);
    },
    role: function (v) { S.d.role = v; render(); },
    help: function (v) { S.c.help = +v; S.c.helpSent = false; render(); },
    helpsend: function () { if (S.c.help < 0) { toast(L('Pick what happened first.', 'Pilih apa yang berlaku dahulu.')); return; } S.c.helpSent = true; render(); toast(L('Sent to the NakGas team.', 'Dihantar kepada pasukan NakGas.')); },
    rcpt: function () { S.c.saved = true; render(); toast(L('Receipt saved as NG-10482.pdf.', 'Resit disimpan sebagai NG-10482.pdf.')); },
    pv: function (k) { S.c[k] = !S.c[k]; render(); },
    addk: function (v) { S.d.addk = v; S.d.added = false; render(); },
    addfleet: function () { S.d.added = true; render(); toast(S.d.addk === 'driver' ? L('Driver added, waiting for the check.', 'Pemandu ditambah, menunggu semakan.') : L('Truck added, waiting for the check.', 'Lori ditambah, menunggu semakan.')); },
    lic: function () { S.d.lic = true; render(); toast(L('Licence uploaded. Expiry date read: 31 Mar 2027.', 'Lesen dimuat naik. Tarikh tamat: 31 Mac 2027.')); },
    onb: function (v) {
      if (v === 'submit') { if (!S.d.lic) { toast(L('Upload your KPDN licence first.', 'Muat naik lesen KPDN dahulu.')); return; } S.d.sub = 1; render(); }
      else { if (!here('d-onboard')) go('d-onboard'); S.d.lic = true; S.d.sub = 2; render(); }
    },
    online: function () {
      S.d.online = !S.d.online; render();
      if (S.d.online) later(3000, function () { if (here('d-home') && S.d.online) go('d-incoming'); });
    },
    inc: function (v) {
      if (v === 'accept') { S.d.acc = true; S.d.st = 3; go('d-job'); }
      else if (v === 'decline') { go('d-home'); toast(L('Declined. The order went to the next nearest dealer.', 'Ditolak. Pesanan dihantar kepada pengedar terdekat seterusnya.')); }
      else if (v === 'timeout') { S.d.t = 4; upRing(4, 45); }
    },
    drv: function (v) { S.d.driver = +v; render(); },
    job: function () { S.d.st = 3; go('d-status'); },
    st: function () { S.d.st = 4; render(); },
    shot: function (v) { S.d.shot = v === '1'; render(); },
    deliver: function () { S.d.st = 5; go('d-cash'); },
    cashck: function () { S.d.cash = !S.d.cash; render(); },
    cash: function () {
      if (!S.d.cash) { toast(L('Tick the box once the cash is in hand.', 'Tandakan kotak selepas tunai diterima.')); return; }
      S.d.acc = false; S.d.st = 3; go('d-wallet');
      toast(L('Job done. NG-10493 is closed.', 'Tugasan selesai. NG-10493 ditutup.'));
    },
    stk: function (v) { var p = v.split(','); S.d.stock[+p[0]] = Math.max(0, S.d.stock[+p[0]] + (+p[1])); render(); },
    rad: function (v) { S.d.radius = Math.max(1, Math.min(15, S.d.radius + (+v))); render(); },
    flt: function (v) { S.a.filter = v; render(); },
    sel: function (v) { S.a.sel = v; if (!here('a-orders')) { S.a.filter = 'all'; go('a-orders'); } else render(); },
    assign: function (v) { S.a.assigned = v; S.a.sel = 'NG-10488'; render(); toast('NG-10488 assigned to ' + v + '. The dealer and the customer are notified.'); },
    areset: function () { S.a.assigned = ''; S.a.sel = 'NG-10488'; S.a.filter = 'all'; render(); },
    appr: function (v) {
      var p = v.split(','), i = +p[0], s = +p[1]; S.a.appr[i] = s; render();
      toast(s === 1 ? APPR[i].n + ' approved. It now receives offers and shows on the supplier map.' : s === 2 ? APPR[i].n + ' rejected. The applicant is told why.' : 'Licence requested from ' + APPR[i].n + '.');
    },
    maptg: function (v) { S.a[v] = !S.a[v]; render(); },
    fee: function (v) { S.a.fee = v; render(); toast('Fee option ' + v.toUpperCase() + ' selected. The live value waits on the price audit.'); },
    payout: function () { S.a.paid = true; render(); toast('Payouts approved. Dealers see them in their wallet. Sample only.'); },
    exp: function (v) { toast(v + ' export: sample only in this prototype.'); }
  };
  function act(s) { var i = s.indexOf(':'), n = i < 0 ? s : s.slice(0, i), v = i < 0 ? '' : s.slice(i + 1); if (A[n]) A[n](v); }

  /* ---------- events */
  D.addEventListener('click', function (e) {
    var t = e.target.closest('[data-jump],[data-scr],[data-prod],[data-lang],[data-restart],[data-go],[data-act]');
    var inFrame = e.target.closest('#scrn');
    if (!t) {
      if (inFrame) { inFrame.classList.add('hint'); setTimeout(function () { inFrame.classList.remove('hint'); }, 700); }
      return;
    }
    if (t.disabled) return;
    if (t.hasAttribute('data-jump')) { e.preventDefault(); go(t.getAttribute('data-jump')); var p = $('#ptTop'); if (p) p.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    if (t.hasAttribute('data-scr')) { go(t.getAttribute('data-scr')); return; }
    if (t.hasAttribute('data-prod')) { var pr = t.getAttribute('data-prod'); if (pr !== S.prod) go(S.cur[pr]); return; }
    if (t.hasAttribute('data-lang')) { if (S.prod !== 'a') A.lang(t.getAttribute('data-lang')); return; }
    if (t.hasAttribute('data-restart')) {
      var l = S.lang;
      if (S.prod === 'c') S.c = freshC(); else if (S.prod === 'd') S.d = freshD(); else S.a = freshA();
      S.lang = l; go(LIST[S.prod][0][0]); return;
    }
    if (t.hasAttribute('data-go')) { go(t.getAttribute('data-go')); return; }
    if (t.hasAttribute('data-act')) act(t.getAttribute('data-act'));
  });
  if (OLD) {
    $('#ptSel').addEventListener('change', function () { go(this.value); });
    if (window.ResizeObserver) new ResizeObserver(fit).observe($('#stage'));
    window.addEventListener('resize', fit);
    buildFrame(); buildList(); syncBar(); go('c-splash');
  } else {
    /* the workbench: state, renderers and navigation, nothing more. The bench owns the device, the board and the start screen. */
    window.GS = { S: S, R: R, LIST: LIST, DM: DM, PRODN: PRODN, phoneHTML: phoneHTML, go: go, render: render, act: act, L: L, mark: mark, WM: WM, ic: ic, clearT: clearT,
      fresh: function () { var l = S.lang; S.c = freshC(); S.d = freshD(); S.a = freshA(); S.lang = l; S.cur = { c: 'c-splash', d: 'd-login', a: 'a-dash' }; clearT(); },
      on: function (fn) { HOOKS.push(fn); } };
  }
})();
