/* NakGas (named NakGas until 12 Oct 2026), The App: the super admin workbench. The MyHero format (Apps/MyHero/MyHero.html, Oct 2026), ported on
   9 Oct 2026: the measured iPhone on the left with its controls, the flow board on the right where every screen is a
   live thumbnail and every press a labelled wire, a Screens view, lane chips, a command palette, zoom and pan.
   THE PROTOTYPE IS THE DATA: screens, their names and what they do come from app-proto.js (window.GS). Presses are read
   off the rendered screens (every data-go), plus the few that happen through an action (MANUAL below).
   House rules in every string: no dashes as separators, no exclamation marks. */
(function () {
  'use strict';
  var G = window.GS; if (!G) { console.warn('GS prototype missing'); return; }
  var S = G.S, R = G.R, LIST = G.LIST, DM = G.DM, PRODN = G.PRODN;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }

  /* ---------- the screens: one entry per prototype screen plus the phone home screen */
  var SCREENS = {}, ORDER = [];
  function def(o) { SCREENS[o.id] = o; ORDER.push(o.id); }
  def({ id: 'device', n: 'Phone home', d: 'Where every session starts: the iPhone home screen. NakGas sits among the everyday apps, one tap opens it. The dealer app is a second icon on the same phone. The icon is judged next to every other app, so it is the first thing the brand has to get right.', prod: 'p', g: 'start' });
  var LANEOF = { 'c-splash': 'start', 'c-lang': 'start', 'c-otp': 'start', 'c-address': 'start', 'c-home': 'home', 'c-order': 'order', 'c-when': 'order', 'c-checkout': 'order', 'c-pay': 'order',
    'c-find': 'delivery', 'c-track': 'delivery', 'c-done': 'delivery', 'c-rate': 'delivery', 'c-orders': 'account', 'c-rewards': 'account', 'c-profile': 'account', 'c-iot': 'account',
    'd-login': 'dealer', 'd-onboard': 'dealer', 'd-home': 'dealer', 'd-incoming': 'dealer', 'd-job': 'dealer', 'd-status': 'dealer', 'd-photo': 'dealer', 'd-cash': 'dealer', 'd-wallet': 'dealer', 'd-fleet': 'dealer',
    'a-dash': 'admin', 'a-orders': 'admin', 'a-suppliers': 'admin', 'a-map': 'admin', 'a-settle': 'admin' };
  ['c', 'd', 'a'].forEach(function (p) { LIST[p].forEach(function (x, i) { def({ id: x[0], n: x[1], d: x[2], prod: p, i: i, g: LANEOF[x[0]] || 'account', p2: x[0] === 'c-iot' ? 'Phase Two' : '' }); }); });
  var N = Object.keys(SCREENS).length;

  /* ---------- lanes (chips) and frames (the blocks on the board) */
  var LANES = { start: ['Start', '#0CA66A', 'flame'], home: ['Home', '#0CA66A', 'home'], order: ['Order', '#0CA66A', 'cyl'], delivery: ['Delivery', '#0CA66A', 'truck'], account: ['Account', '#0CA66A', 'user'], dealer: ['Dealer app', '#0B1530', 'building'], admin: ['Admin portal', '#5A647C', 'dash'] };
  /* 13 Oct 2026: one colour per product (customer flame blue, dealer night ink, admin slate), a plain line per lane,
     and filled icons on a tile, so the board reads as three products at a glance */
  var LDESC = { start: 'First open: language, phone number, address', home: 'One screen, one big button', order: 'Brand, size, time, then pay', delivery: 'A dealer accepts, then the road to the door', account: 'Orders, rewards and profile', dealer: 'Licence first, then accept to cash', admin: 'The web portal for Navin&rsquo;s team, in English' };
  var PRODS = [['Customer app', ['start', 'home', 'order', 'delivery', 'account']], ['Dealer app', ['dealer']], ['Admin portal', ['admin']]];
  var LIC = {
    flame: '<path d="M12 2.2S5.4 9.1 5.4 14.6a6.6 6.6 0 0 0 13.2 0C18.6 9.1 12 2.2 12 2.2z"/><path class="c" d="M12 12.6s-2.4 2.5-2.4 4.4a2.4 2.4 0 0 0 4.8 0c0-1.9-2.4-4.4-2.4-4.4z" opacity=".55"/>',
    home: '<path d="M3.4 10.4 12 3.3l8.6 7.1v9.4c0 .7-.5 1.2-1.2 1.2h-4.6v-5.6H9.2V21H4.6c-.7 0-1.2-.5-1.2-1.2z"/>',
    cyl: '<rect x="8.6" y="2.4" width="6.8" height="2.6" rx=".9"/><rect x="5.2" y="5.6" width="13.6" height="16" rx="3.4"/><rect class="c" x="5.2" y="11.2" width="13.6" height="2" opacity=".5"/>',
    truck: '<path d="M2.4 6.6c0-.9.7-1.6 1.6-1.6h9.6c.9 0 1.6.7 1.6 1.6V8h3.1c.5 0 1 .2 1.3.6l2.1 2.8c.2.3.3.6.3 1V16c0 .9-.7 1.6-1.6 1.6h-.5a2.9 2.9 0 0 0-5.7 0H9.6a2.9 2.9 0 0 0-5.7 0H4c-.9 0-1.6-.7-1.6-1.6z"/><circle cx="6.8" cy="18" r="2.2"/><circle cx="17.2" cy="18" r="2.2"/><path class="c" d="M15.6 9.6h2.5l1.9 2.6h-4.4z" opacity=".5"/>',
    user: '<circle cx="12" cy="7.8" r="4.3"/><path d="M3.8 20.1c0-3.7 3.7-6.4 8.2-6.4s8.2 2.7 8.2 6.4c0 .5-.4.9-.9.9H4.7c-.5 0-.9-.4-.9-.9z"/>',
    building: '<path d="M4.2 3.6h15.6l1.7 5.2a2.7 2.7 0 0 1-5.1 1.3 2.7 2.7 0 0 1-4.4 0 2.7 2.7 0 0 1-4.4 0 2.7 2.7 0 0 1-5.1-1.3z"/><path d="M5 12.6c1.2.4 2.5.2 3.6-.5 1.1.7 2.4.9 3.4.9s2.3-.2 3.4-.9c1.1.7 2.4.9 3.6.5V20c0 .6-.4 1-1 1h-3.9v-4.8H9.9V21H6c-.6 0-1-.4-1-1z"/>',
    dash: '<rect x="3.2" y="3.2" width="7.6" height="9.6" rx="1.8"/><rect x="13.2" y="3.2" width="7.6" height="5.6" rx="1.8"/><rect x="13.2" y="11.2" width="7.6" height="9.6" rx="1.8"/><rect x="3.2" y="15.2" width="7.6" height="5.6" rx="1.8"/>' };
  function tile(g, s) { var L = LANES[g] || LANES.account; return '<i class="lti" style="--c:' + L[1] + ';--s:' + (s || 22) + 'px" aria-hidden="true"><svg viewBox="0 0 24 24">' + LIC[L[2]] + '</svg></i>'; }
  function prodOf(g) { for (var i = 0; i < PRODS.length; i++) if (PRODS[i][1].indexOf(g) > -1) return PRODS[i][0]; return ''; }
  var FRAMES = [
    ['start', 'Start', 'first open', 'start', ['device', 'c-splash', 'c-lang', 'c-otp', 'c-address']],
    ['home', 'Home', '', 'home', ['c-home']],
    ['order', 'Order', 'two taps', 'order', ['c-order', 'c-when', 'c-checkout', 'c-pay']],
    ['delivery', 'Delivery', '45 seconds, then the road', 'delivery', ['c-find', 'c-track', 'c-done', 'c-rate']],
    ['account', 'Account', 'tabs', 'account', ['c-orders', 'c-rewards', 'c-profile', 'c-iot']],
    ['dstart', 'Start', 'licence first', 'dealer', ['d-login', 'd-onboard', 'd-home']],
    ['jobs', 'Jobs', 'accept to cash', 'dealer', ['d-incoming', 'd-job', 'd-status', 'd-photo', 'd-cash']],
    ['money', 'Wallet and fleet', '', 'dealer', ['d-wallet', 'd-fleet']],
    ['admin', 'Operations', 'web, English', 'admin', ['a-dash', 'a-orders', 'a-suppliers', 'a-map', 'a-settle']]];
  var CHIPOF = {}; FRAMES.forEach(function (f) { f[4].forEach(function (id) { CHIPOF[id] = f[3]; }); });
  /* the board: column = how deep you are, row = which lane. The customer axis runs along row 2, Order above it and Account below,
     Delivery continues to the right. The dealer app is row 5, the admin portal row 7 with wider nodes. */
  var GP = { device: [0, 2], 'c-splash': [1, 2], 'c-lang': [2, 2], 'c-otp': [3, 2], 'c-address': [4, 2], 'c-home': [5, 2],
    'c-order': [6, 1], 'c-when': [7, 1], 'c-checkout': [8, 1], 'c-pay': [9, 1], 'c-find': [10, 1], 'c-track': [11, 1], 'c-done': [12, 1], 'c-rate': [13, 1],
    'c-orders': [6, 3], 'c-rewards': [7, 3], 'c-profile': [8, 3], 'c-iot': [9, 3],
    'd-login': [1, 5], 'd-onboard': [2, 5], 'd-home': [3, 5], 'd-incoming': [4, 5], 'd-job': [5, 5], 'd-status': [6, 5], 'd-photo': [7, 5], 'd-cash': [8, 5], 'd-wallet': [9, 5], 'd-fleet': [10, 5],
    'a-dash': [1, 7], 'a-orders': [2.35, 7], 'a-suppliers': [3.7, 7], 'a-map': [5.05, 7], 'a-settle': [6.4, 7] };

  /* ---------- the iPhone home screen, drawn, not pasted */
  var GSICON = '<svg viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0CA66A"/><g class="fl" transform="translate(0.92 4.87) scale(0.8945)"><path class="fl-o" d="M37 3.5C40.2 9.6 47.2 18.6 50.6 29.8C54.6 42.6 48.4 59.4 32.6 59.4C17.2 59.4 11 47 13.9 35.2C16.4 25 27.6 16.4 37 3.5Z" fill="#FFFFFF"/><path class="fl-i" d="M32.6 31C35.2 36.4 40.4 40.6 40.4 46C40.4 50.6 36.8 53.2 32.6 53.2C28.4 53.2 24.8 50.6 24.8 46C24.8 40.6 30 36.4 32.6 31Z" fill="#8FDDB8"/></g></svg>';
  var GSDEALER = GSICON.replace('fill="#0CA66A"', 'fill="#0B1530"').replace('fill="#FFFFFF"', 'fill="#0CA66A"');
  function ios(k) { return '<i><svg viewBox="0 0 60 60">' + (window.IOS && IOS[k] || '') + '</svg></i>'; }
  function sbw() { return '<div class="sb w"><span>9:41</span><span class="sbi">' + ($('#scrn .sb .sbi') ? '' : '') + '</span></div>'; }
  function deviceHTML() {
    var grid = [['Camera', 'camera'], ['Photos', 'photos'], ['Clock', 'clock'], ['Calendar', 'calendar'], ['Mail', 'mail'], ['Notes', 'notes'], ['Maps', 'maps'], ['Wallet', 'wallet'], ['Weather', 'weather'], ['App Store', 'appstore']];
    var g = grid.map(function (a) { return '<button data-act="toast:na" aria-label="' + a[0] + '">' + ios(a[1]) + '<span>' + a[0] + '</span></button>'; }).join('');
    g += '<button class="hero" data-go="c-splash" aria-label="Open NakGas"><i>' + GSICON + '</i><span>NakGas</span></button>';
    g += '<button data-go="d-login" aria-label="Open the dealer app"><i>' + GSDEALER + '</i><span>NG Dealer</span></button>';
    return '<div class="scr dev"><div class="sb w"><span>9:41</span></div><div class="dev-in">' +
      '<div class="wdg"><div><div class="t">Johor Bahru</div><div class="d">31°</div><div class="s">Sunny · H:33° L:25°</div></div><svg viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="11" fill="#FFD60A"/><g stroke="#FFD60A" stroke-width="3" stroke-linecap="round"><path d="M26 4v6M26 42v6M4 26h6M42 26h6M10.4 10.4l4.3 4.3M37.3 37.3l4.3 4.3M10.4 41.6l4.3-4.3M37.3 14.7l4.3-4.3"/></g></svg></div>' +
      '<div class="ai">' + g + '</div><div class="pgd"><i></i><i></i></div><div class="tip">Tap NakGas to open</div>' +
      '<div class="dock"><div class="ai"><button data-act="toast:na" aria-label="Phone">' + ios('phone') + '</button><button data-act="toast:na" aria-label="Safari">' + ios('safari') + '</button><button data-act="toast:na" aria-label="Messages">' + ios('messages') + '</button><button data-act="toast:na" aria-label="Music">' + ios('music') + '</button></div></div></div></div>';
  }

  /* ---------- rendering one screen as HTML, for the thumbnails and the press scan */
  function html(id) {
    if (id === 'device') return deviceHTML();
    var r = R[id](); return id.charAt(0) === 'a' ? r : G.phoneHTML(r);
  }
  function isDesk(id) { return id.charAt(0) === 'a'; }

  /* ---------- presses: every data-go on every screen, plus the ones an action performs */
  var MANUAL = [
    ['c-pay', 'c-find', 'Pay · FPX, card, e-wallet or cash', 0], ['c-find', 'c-track', 'Dealer accepts · about 6 s', 0], ['c-track', 'c-done', 'Tap the step · Delivered', 0],
    ['c-rate', 'c-home', 'Submit the rating', 1], ['c-home', 'c-checkout', 'Reorder · two taps', 1], ['c-profile', 'c-splash', 'Log out', 1], ['c-track', 'c-home', 'Cancel order', 1],
    ['d-onboard', 'd-home', 'Submit · approved in admin', 0], ['d-home', 'd-incoming', 'Go online · an order in 3 s', 0], ['d-incoming', 'd-job', 'Accept', 0], ['d-incoming', 'd-home', 'Decline · or 45 s run out', 1],
    ['d-job', 'd-status', 'Start the run', 0], ['d-status', 'd-photo', 'Delivered · take the photo', 0], ['d-photo', 'd-cash', 'Confirm delivery', 0], ['d-cash', 'd-wallet', 'Cash collected · close the job', 0],
    ['a-dash', 'a-orders', 'Escalated · assign', 0], ['a-dash', 'a-suppliers', 'Licence expiry row', 0], ['a-dash', 'a-settle', 'GMV and fees tiles', 0]];
  var PRI = {}; ['c-home>c-order', 'c-home>c-orders', 'c-home>c-rewards', 'c-home>c-profile', 'c-profile>c-iot', 'd-home>d-status', 'd-home>d-wallet', 'd-home>d-fleet', 'device>c-splash', 'device>d-login', 'a-suppliers>a-map', 'a-orders>a-suppliers', 'c-orders>c-pay'].forEach(function (k) { PRI[k] = 1; });
  function txt(el) {
    var sp = el.querySelector('.tap'), b = el.querySelector('b'); var t = (sp ? sp.textContent : b ? b.textContent : el.textContent) || el.getAttribute('aria-label') || '';
    t = t.replace(/\s+/g, ' ').trim(); if (t.length > 36) t = t.slice(0, 34).replace(/\s\S*$/, '') + '…'; return t;
  }
  var EDGES = [], SEEN = {};
  function addEdge(f, t, l, sec) { if (f === t || !SCREENS[f] || !SCREENS[t]) return; var k = f + '>' + t; if (SEEN[k]) { if (!sec && SEEN[k][3]) { SEEN[k][3] = 0; SEEN[k][2] = l; } return; } var e = [f, t, l, sec ? 1 : 0]; SEEN[k] = e; EDGES.push(e); }
  var tmp = document.createElement('div');
  ORDER.forEach(function (id) {
    tmp.innerHTML = html(id);
    $$('[data-go]', tmp).forEach(function (el) {
      var to = el.getAttribute('data-go'); if (!SCREENS[to]) return;
      var tab = !!el.closest('.ut'), nav = !!el.closest('.dk-sd'), back = el.classList.contains('bk') || !!el.closest('.uh .bk');
      if (back) return;
      var a = SCREENS[id], b = SCREENS[to], pri = PRI[id + '>' + to] || (a.prod === b.prod && b.i === a.i + 1 && !tab && !nav);
      addEdge(id, to, tab ? 'Tab · ' + txt(el) : nav ? 'Menu · ' + txt(el) : txt(el), !pri);
    });
  });
  MANUAL.forEach(function (e) { addEdge(e[0], e[1], e[2], e[3]); });
  tmp = null;

  /* ---------- the board geometry */
  var W = $('#world'), NB = $('#nodes'), SV = $('#wires'), EL = $('#elabels'), ST = $('#stage');
  var CW = 262, CH = 370, OX = 170, OY = 210, NW = 132, NH = 266, TW = 110, TH = 232, DW = 240, DH = 152, FH = 84, FPX = 22, FPB = 54;
  var nodes = [], BY = {};
  ORDER.forEach(function (id) {
    var g = GP[id]; if (!g) { console.warn('no position for', id); return; }
    var sc = SCREENS[id], d = isDesk(id);
    var n = { x: OX + g[0] * CW, y: OY + g[1] * CH, sid: id, sc: sc, c: LANES[sc.g][1], gn: LANES[sc.g][0], tw: d ? DW : TW, th: d ? DH : TH, desk: d, d: (g[0] * .04) + (g[1] * .012) };
    n.top = n.y - NH / 2; nodes.push(n); BY[id] = n;
  });
  function TY(n) { return n.top + n.th / 2; } function LX(n) { return n.x - n.tw / 2; } function RX(n) { return n.x + n.tw / 2; } function TOP(n) { return n.top; } function BOT(n) { return n.top + n.th; }
  function bez(p0, p1, p2, p3, t) { var u = 1 - t; return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]; }
  function elbow(a, b) {
    var bus = RX(a) + 62, gap = (CW - TW) / 2, p;
    if (b.x < a.x) { var y = BOT(a) + 30; p = 'M' + a.x + ',' + BOT(a) + ' V' + y + ' H' + (b.x + 30) + ' V' + (TY(b)) + ' H' + (RX(b) + 7); return { d: p, m: [(a.x + b.x) / 2, y] }; }
    p = 'M' + RX(a) + ',' + TY(a) + (TY(a) !== TY(b) ? ' H' + bus + ' V' + TY(b) : '') + ' H' + (LX(b) - 7);
    return { d: p, m: [(TY(a) !== TY(b) || b.x - a.x < CW * 1.5) ? LX(b) - gap : (RX(a) + LX(b)) / 2, TY(b)] };
  }
  function curve(a, b) {
    var dx = b.x - a.x, dy = b.y - a.y, p1, p2, c1, c2, k, o = 26;
    if (dx > NW * .7) { p1 = [RX(a), TY(a) + o]; p2 = [LX(b) - 6, TY(b) + o]; k = Math.max(60, Math.abs(dx) * .4); c1 = [p1[0] + k, p1[1]]; c2 = [p2[0] - k, p2[1]]; }
    else if (dx < -NW * .7) { p1 = [LX(a), TY(a) + o]; p2 = [RX(b) + 6, TY(b) + o]; k = Math.max(60, Math.abs(dx) * .4); c1 = [p1[0] - k, p1[1]]; c2 = [p2[0] + k, p2[1]]; }
    else if (dy > 0) { p1 = [a.x + o, BOT(a)]; p2 = [b.x + o, TOP(b) - 6]; k = Math.max(40, Math.abs(dy) * .4); c1 = [p1[0], p1[1] + k]; c2 = [p2[0], p2[1] - k]; }
    else { p1 = [a.x + o, TOP(a)]; p2 = [b.x + o, BOT(b) + 6]; k = Math.max(40, Math.abs(dy) * .4); c1 = [p1[0], p1[1] - k]; c2 = [p2[0], p2[1] + k]; }
    return { d: 'M' + p1.join(',') + ' C' + c1.join(',') + ' ' + c2.join(',') + ' ' + p2.join(','), m: bez(p1, c1, c2, p2, .6) };
  }
  var FR = FRAMES.map(function (f) { var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; f[4].forEach(function (id) { var n = BY[id]; if (!n) return; x0 = Math.min(x0, n.x - Math.max(NW, n.tw + 20) / 2 - FPX); x1 = Math.max(x1, n.x + Math.max(NW, n.tw + 20) / 2 + FPX); y0 = Math.min(y0, TOP(n) - FH); y1 = Math.max(y1, BOT(n) + FPB); });
    return { k: f[0], t: f[1], q: f[2], chip: f[3], n: f[4].length, first: f[4][0], x0: x0, y0: y0, x1: x1, y1: y1, wide: x1 - x0 > NW + 2 * FPX + 1 }; });
  var FRB = document.createElement('div'); FRB.id = 'frames'; W.insertBefore(FRB, W.firstChild);
  FRB.innerHTML = FR.map(function (f) { return '<div class="fr" data-k="' + f.k + '" data-chip="' + f.chip + '" style="left:' + f.x0 + 'px;top:' + f.y0 + 'px;width:' + (f.x1 - f.x0) + 'px;height:' + (f.y1 - f.y0) + 'px"><h3>' + tile(f.chip, 22) + '<span class="ft">' + f.t + (f.n > 1 ? '<em>' + f.n + '</em>' : '') + (f.q && f.wide ? '<span class="q"> · ' + f.q + '</span>' : '') + '</span></h3></div>'; }).join('');
  /* product titles above each product's frames: Customer app, Dealer app, Admin portal */
  var PT = PRODS.map(function (p) { var x0 = 1e9, y0 = 1e9, n = 0; FR.forEach(function (f) { if (p[1].indexOf(f.chip) < 0) return; x0 = Math.min(x0, f.x0); y0 = Math.min(y0, f.y0); n += f.n; }); return { t: p[0], x0: x0, y0: y0, n: n }; });
  FRB.insertAdjacentHTML('beforeend', PT.map(function (p) { return '<div class="pt" style="left:' + p.x0 + 'px;top:' + p.y0 + 'px"><b>' + p.t + '</b><span>' + p.n + ' screens</span></div>'; }).join(''));
  var minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
  FR.forEach(function (f) { minX = Math.min(minX, f.x0); maxX = Math.max(maxX, f.x1); minY = Math.min(minY, f.y0); maxY = Math.max(maxY, f.y1); });
  minY -= 150; /* room for the product title above the top frame when pulled back */
  SV.setAttribute('width', maxX + 200); SV.setAttribute('height', maxY + 200);
  var ph = '', LBS = [], LBK = {};
  EDGES.forEach(function (e) {
    var a = BY[e[0]], b = BY[e[1]]; if (!a || !b) return;
    var secn = !!e[3], g = secn ? curve(a, b) : elbow(a, b);
    ph += '<path d="' + g.d + '" class="' + (secn ? 'sec' : 'pri') + '" data-f="' + e[0] + '" data-t="' + e[1] + '" style="--hue:' + a.c + '"/>';
    if (!secn) { var key = Math.round(g.m[0]) + ',' + Math.round(g.m[1]); (LBK[key] = LBK[key] || []).push(LBS.length); }
    LBS.push('<span class="el ' + (secn ? 'sec' : 'pri') + '" data-f="' + e[0] + '" data-t="' + e[1] + '" style="left:' + g.m[0] + 'px;top:' + g.m[1] + 'px;--hue:' + a.c + ';--k:@K@">' + e[2] + '</span>');
  });
  Object.keys(LBK).forEach(function (k) { var a = LBK[k]; a.forEach(function (i, j) { LBS[i] = LBS[i].replace('@K@', j - (a.length - 1) / 2); }); });
  SV.innerHTML = '<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1 1L9 5 1 9z" fill="#AEB4BE"/></marker><marker id="ahh" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1 1L9 5 1 9z" fill="#0CA66A"/></marker></defs>' + ph;
  EL.innerHTML = LBS.join('').replace(/@K@/g, '0');
  NB.innerHTML = nodes.map(function (n, i) {
    var sc = n.sc;
    return '<div class="node fn' + (n.desk ? ' dkn' : '') + '" role="button" tabindex="0" data-i="' + i + '" data-s="' + n.sid + '" style="left:' + n.x + 'px;top:' + n.top + 'px;--c:' + n.c + ';--d:' + n.d + 's" aria-label="' + sc.n + '"><div class="thumb' + (n.desk ? ' dk' : '') + '"><div class="tin ' + (n.desk ? 'dkt' : 'ph-scr') + '"></div></div><b>' + sc.n + (sc.p2 ? '<em>' + sc.p2 + '</em>' : '') + '</b><small>' + n.gn + '</small></div>';
  }).join('');
  function fill(el, id) { el.innerHTML = html(id); el.classList.toggle('dev', id === 'device'); if (!isDesk(id)) { var r = id === 'device' ? null : R[id](); el.classList.toggle('dark', !!(r && r.dark)); } }
  function thumb(id) { var el = NB.querySelector('[data-s="' + id + '"] .tin'); if (el && SCREENS[id]) fill(el, id); }
  function rebuildThumbs() { nodes.forEach(function (n) { thumb(n.sid); }); if (document.body.classList.contains('gal')) buildGallery(); }

  /* ---------- the device on the left: the phone, or the admin browser frame */
  var SCR = $('#scr'), SCRN = $('#scrn'), cur = 'device', lastProd = S.prod, lastLang = S.lang;
  function setDevice(desk) { document.body.classList.toggle('adm', !!desk); fitPhone(); }
  function showDevice() { cur = 'device'; G.clearT(); setDevice(false); SCR.classList.add('dev'); SCR.classList.remove('dark'); SCRN.innerHTML = deviceHTML(); SCR.classList.remove('fwd'); void SCR.offsetWidth; SCR.classList.add('fwd'); after(); }
  function open(id, keep) {
    if (!SCREENS[id]) return;
    if (id === 'device') { showDevice(); return; }
    SCR.classList.remove('dev'); G.go(id);
  }
  G.on(function (id) {
    cur = id; SCR.classList.remove('dev');
    if (S.prod !== lastProd) { lastProd = S.prod; setDevice(S.prod === 'a'); syncSeg(); }
    if (S.lang !== lastLang) { lastLang = S.lang; syncSeg(); rebuildThumbs(); }
    SCR.classList.remove('fwd'); void SCR.offsetWidth; SCR.classList.add('fwd');
    after();
  });
  function after() { markCur(); thumb(cur); paintInfo(); try { history.replaceState(null, '', cur === 'device' ? location.pathname + location.search : '#' + cur); } catch (e) { } }

  /* controls */
  $('#segProd').addEventListener('click', function (e) { var b = e.target.closest('[data-p]'); if (!b) return; var p = b.dataset.p; if (cur !== 'device' && S.prod === p) return; open(S.cur[p]); });
  $('#segLang').addEventListener('click', function (e) { var b = e.target.closest('[data-l]'); if (!b || S.lang === b.dataset.l) return; S.lang = b.dataset.l; lastLang = S.lang; syncSeg(); rebuildThumbs(); if (cur === 'device') { SCRN.innerHTML = deviceHTML(); paintInfo(); } else G.render(); });
  $('#restart').addEventListener('click', function () { G.fresh(); lastProd = S.prod; showDevice(); syncSeg(); rebuildThumbs(); });
  function syncSeg() {
    $$('#segProd button').forEach(function (b) { b.classList.toggle('on', cur !== 'device' && b.dataset.p === S.prod); });
    $$('#segLang button').forEach(function (b) { b.classList.toggle('on', b.dataset.l === S.lang); b.disabled = cur !== 'device' && S.prod === 'a'; });
    var cp = $('#capDev'); if (cp) cp.innerHTML = (cur !== 'device' && S.prod === 'a') ? '<b>Admin portal</b> · web · 1200 × 760 · English · sample data' : '<b>iPhone 18 Pro</b> · 6.3 in · 402 × 874 pt · tap NakGas to open · sample data';
  }

  /* quick info under the device */
  function paintInfo() {
    var Q = $('#qi'); if (!Q) return; var h0 = Q.offsetHeight; var sc = SCREENS[cur] || {}, id = cur;
    var ins = EDGES.filter(function (e) { return e[1] === id; }).length, outs = EDGES.filter(function (e) { return e[0] === id; }).length;
    var tag = id === 'device' ? 'The phone' : sc.p2 ? sc.p2 : 'Phase One';
    var where = id === 'device' ? 'iPhone 18 Pro' : isDesk(id) ? 'Admin portal · web · English' : (S.prod === 'c' ? 'Customer app' : 'Dealer app') + ' · ' + (S.lang === 'bm' ? 'Bahasa Malaysia' : 'English');
    var demo = (DM[id] || []).map(function (d) { return '<button class="zbtn fit" data-act="' + d[1] + '">' + d[0] + '</button>'; }).join('');
    Q.innerHTML = '<section class="qb qs"><header>' + tile(sc.g, 18) + '<b>' + (sc.n || id) + '</b><span class="qtag">' + tag + '</span></header>' +
      '<p class="qm2">' + (LANES[sc.g] ? LANES[sc.g][0] : '') + ' · ' + ins + ' in · ' + outs + ' out · ' + where + '</p><p class="qd">' + (sc.d || '') + '</p>' + (demo ? '<div class="qtry"><span>Try</span>' + demo + '</div>' : '') + '</section>';
    if (h0 && Math.abs(Q.offsetHeight - h0) > 2) fitPhone();
  }
  function fitPhone() {
    var Lf = $('#left'), P = $('#phone'), k, desk = document.body.classList.contains('adm'); P.style.zoom = 1;
    var c = Lf.querySelector('.ctl'), cp = Lf.querySelector('.cap'), qi = $('#qi');
    if (desk) {
      Lf.style.width = ''; var w0 = Lf.clientWidth - 48; k = Math.min(1, w0 / 1200);
      var PH = function () { return P.offsetHeight + 8; }, K = function () { return (Lf.clientHeight - (Lf.scrollHeight - PH())) / PH(); };
      P.style.zoom = k; var kh = K(); if (kh < k) k = Math.max(.3, kh);
      P.style.zoom = k; [c, cp, qi].forEach(function (x) { if (x) x.style.width = Math.round(1200 * k) + 'px'; }); fitLegend(); return;
    }
    if (innerWidth <= 1000) { k = Math.min((innerHeight - 28) / 842, (Lf.clientWidth - 36) / 412); }
    else {
      var PH2 = function () { return P.offsetHeight + 8; }, K2 = function () { return (Lf.clientHeight - (Lf.scrollHeight - PH2())) / PH2(); };
      if (qi) { qi.style.display = ''; qi.classList.remove('compact'); } k = K2();
      if (k < .66 && qi) { qi.classList.add('compact'); k = K2(); }
      if (k < .66 && qi) { qi.style.display = 'none'; k = K2(); qi.style.display = ''; }
    }
    k = Math.max(.42, Math.min(1, k)); P.style.zoom = k;
    if (innerWidth <= 1000) { Lf.style.width = ''; [c, cp, qi].forEach(function (x) { if (x) x.style.width = '100%'; }); return; }
    var w = Math.max(300, Math.round(401 * k)); Lf.style.width = (w + 48) + 'px'; [c, cp, qi].forEach(function (x) { if (x) x.style.width = w + 'px'; }); fitLegend();
  }

  /* ---------- the screens view */
  var GAL = $('#gallery'), GORDER = ['start', 'home', 'order', 'delivery', 'account', 'dealer', 'admin'];
  function buildGallery() {
    var by = {}; ORDER.forEach(function (id) { var g = SCREENS[id].g; (by[g] = by[g] || []).push(id); });
    var top = GAL.scrollTop;
    GAL.innerHTML = GORDER.filter(function (g) { return by[g]; }).map(function (g) {
      var desk = g === 'admin';
      return '<section class="gsec" style="--c:' + LANES[g][1] + '"><header>' + tile(g, 34) + '<div class="gh"><small>' + prodOf(g) + '</small><h2>' + LANES[g][0] + '</h2></div><p>' + (LDESC[g] || '') + '</p><span>' + by[g].length + ' screen' + (by[g].length > 1 ? 's' : '') + '</span></header><div class="ggrid' + (desk ? ' dkg' : '') + '">'
        + by[g].map(function (id) { var sc = SCREENS[id]; return '<button class="gcard' + (cur === id ? ' cur' : '') + (desk ? ' dk' : '') + '" data-s="' + id + '" style="--c:' + LANES[g][1] + ';--i:' + Math.min(14, by[g].indexOf(id)) + '" aria-label="' + sc.n + '"><div class="gph"><div class="gscr' + (desk ? ' dk' : '') + '"><div class="tin ' + (desk ? 'dkt' : 'ph-scr') + '" data-g="' + id + '"></div></div></div><b>' + sc.n + (sc.p2 ? '<em>' + sc.p2 + '</em>' : '') + '</b><small>' + sc.d + '</small></button>'; }).join('')
        + '</div></section>'; }).join('');
    $$('.tin', GAL).forEach(function (el) { fill(el, el.dataset.g); });
    GAL.scrollTop = top;
  }
  GAL.addEventListener('click', function (e) { var c = e.target.closest('.gcard'); if (!c) return; open(c.dataset.s); $$('.gcard.cur', GAL).forEach(function (x) { x.classList.remove('cur'); }); c.classList.add('cur'); });
  ['pointerdown', 'pointermove', 'pointerup', 'wheel', 'touchstart', 'touchmove'].forEach(function (t) { GAL.addEventListener(t, function (e) { e.stopPropagation(); }, { passive: true }); });
  $('#segView').addEventListener('click', function (e) { var b = e.target.closest('[data-view]'); if (!b) return; var v = b.dataset.view;
    document.body.classList.toggle('gal', v === 'screens');
    $$('button', this).forEach(function (x) { x.classList.toggle('on', x === b); });
    var h = $('.head h1'); h.firstChild.nodeValue = v === 'screens' ? 'All screens' : 'The app flow';
    dropLane(); try { localStorage.setItem('gs-view', v); } catch (_) { }
    if (v === 'screens') buildGallery(); setTimeout(fitLegend, 0); });
  function markCur() { $$('.cur', NB).forEach(function (e) { e.classList.remove('cur'); }); var el = NB.querySelector('[data-s="' + cur + '"]'); if (el) el.classList.add('cur'); reveal(cur); follow(); syncChips(); if (document.body.classList.contains('gal')) { $$('.gcard', GAL).forEach(function (c) { c.classList.toggle('cur', c.dataset.s === cur); }); } }
  function follow() { if (!window.__flow || vs < .45 || document.body.classList.contains('gal')) return; var n = BY[cur]; if (!n) return; var r = ST.getBoundingClientRect(), sx = n.x * vs + vx, sy = n.y * vs + vy, mx = 120 * vs, my = 170 * vs; if (sx < mx || sx > r.width - mx || sy < my || sy > r.height - my) panTo(n.x, n.y, vs); }
  function reveal(id) { $$('.sec.show').forEach(function (l) { l.classList.remove('show'); }); $$('.sec[data-f="' + id + '"],.sec[data-t="' + id + '"]').forEach(function (l) { l.classList.add('show'); }); }
  var nSec = EDGES.filter(function (e) { return e[3]; }).length;
  $('[data-foot]').innerHTML = '<b>Read left to right.</b> Each line is a press. Press a screen to open it on the phone. <span>' + nodes.length + ' screens · ' + EDGES.length + ' presses</span>';

  /* ---------- the detail float */
  var DET = $('#detail');
  function showDetail(n) {
    $$('.sel').forEach(function (l) { l.classList.remove('sel'); }); $$('[data-f="' + n.sid + '"]').forEach(function (l) { l.classList.add('sel'); });
    var sc = n.sc; DET.style.setProperty('--dc', n.c);
    $('#dK').textContent = n.gn + ' · ' + (sc.id === 'device' ? 'the phone' : sc.p2 ? sc.p2 + ', not priced' : 'Phase One'); $('#dK').style.color = n.c;
    $('#dT').textContent = sc.n; $('#dP').textContent = sc.d;
    var out = EDGES.filter(function (e) { return e[0] === sc.id; });
    var h = '<div class="h">Press · goes to</div>' + out.map(function (e) { return '<div data-jump="' + e[1] + '"><span>' + e[2] + '</span><i>→</i>' + SCREENS[e[1]].n + '</div>'; }).join('');
    if (!out.length) h += '<div><span>No press leaves this screen</span></div>';
    $('#dR').innerHTML = h; DET.classList.add('on');
  }
  $('#dR').addEventListener('click', function (e) { var d = e.target.closest('[data-jump]'); if (!d) return; open(d.dataset.jump); showDetail(BY[d.dataset.jump]); panTo(BY[d.dataset.jump].x, BY[d.dataset.jump].y, Math.max(vs, .7)); });
  NB.addEventListener('click', function (e) { if (moved > 3) { moved = 0; return; } var b = e.target.closest('[data-s]'); if (!b) return; var n = nodes[+b.dataset.i]; open(n.sid); showDetail(n); if (vs < .45) panTo(n.x, n.y, .8); });
  NB.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { var b = e.target.closest('[data-s]'); if (b) { e.preventDefault(); b.click(); } } });
  $('#dX').addEventListener('click', function () { DET.classList.remove('on'); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') DET.classList.remove('on'); });
  NB.addEventListener('pointerover', function (e) { var el = e.target.closest('[data-s]'); if (!el) return; $$('[data-f="' + el.dataset.s + '"],.sec[data-t="' + el.dataset.s + '"]').forEach(function (l) { l.classList.add('hot'); }); });
  NB.addEventListener('pointerout', function (e) { var el = e.target.closest('[data-s]'); if (!el) return; $$('.hot').forEach(function (l) { l.classList.remove('hot'); }); });
  $('#zAll').addEventListener('click', function () { var on = document.body.classList.toggle('all'); this.textContent = 'Shortcuts · ' + (on ? 'on' : 'off'); this.setAttribute('aria-pressed', on); });

  /* ---------- pan and zoom */
  var vx = 0, vy = 0, vs = 1, fitted = true, _dc = 0;
  function declutter() { var tags = $$('#nodes .lt'), placed = []; tags.forEach(function (t) { t.style.visibility = ''; }); if (ST.dataset.lod === 'hi') return;
    tags.forEach(function (t) { var r = t.getBoundingClientRect(); if (placed.some(function (p) { return !(r.right + 4 < p.left || r.left - 4 > p.right || r.bottom < p.top || r.top > p.bottom); })) t.style.visibility = 'hidden'; else placed.push(r); }); }
  function apply() { var _r = ST.getBoundingClientRect(); if (_r.width) { vx = Math.min(_r.width - 160 - minX * vs, Math.max(160 - maxX * vs, vx)); vy = Math.min(_r.height - 160 - minY * vs, Math.max(160 - maxY * vs, vy)); } ST.style.backgroundPosition = vx + 'px ' + vy + 'px'; var _zp = $('#zPct'); if (_zp) _zp.textContent = Math.round(vs * 100) + '%'; clearTimeout(_dc); _dc = setTimeout(declutter, W.classList.contains('anim') ? 640 : 60); W.style.transform = 'translate(' + vx + 'px,' + vy + 'px) scale(' + vs + ')'; W.style.setProperty('--iz', (1 / vs).toFixed(4)); ST.dataset.lod = vs >= .66 ? 'hi' : (vs >= .45 ? 'mid' : 'lo'); }
  function fit() { var r = ST.getBoundingClientRect(), fb = 52; var w = maxX - minX, h = maxY - minY; vs = Math.min(r.width / (w + 120), (r.height - fb) / (h + 120)); vs = Math.max(.08, Math.min(vs, 1.4)); vx = (r.width - w * vs) / 2 - minX * vs; vy = (r.height - fb - h * vs) / 2 - minY * vs; apply(); fitted = true; }
  function panTo(x, y, s) { fitted = false; var r = ST.getBoundingClientRect(); W.classList.add('anim'); vs = s; vx = r.width / 2 - x * s; vy = r.height / 2 - y * s; apply(); setTimeout(function () { W.classList.remove('anim'); }, 600); }
  var LEG = ['start', 'home', 'order', 'delivery', 'account', 'dealer', 'admin'];
  $('#legend').innerHTML = LEG.map(function (k) { return '<button style="--c:' + LANES[k][1] + '" data-fly="' + k + '" aria-pressed="false">' + tile(k, 20) + LANES[k][0] + '</button>'; }).join('');
  var laneHot = null, laneSel = null;
  function paintLane() { var k = laneHot || laneSel; ST.classList.toggle('lf', !!k); $$('.lon', W).forEach(function (x) { x.classList.remove('lon'); }); if (!k) return;
    $$('.fn', NB).forEach(function (el) { if (CHIPOF[el.dataset.s] === k) el.classList.add('lon'); });
    $$('.fr', FRB).forEach(function (el) { if (el.dataset.chip === k) el.classList.add('lon'); });
    $$('#wires path,#elabels .el', W).forEach(function (l) { var f = CHIPOF[l.dataset.f] === k, t = CHIPOF[l.dataset.t] === k; if (l.classList.contains('sec') ? (f && t) : (f || t)) l.classList.add('lon'); }); }
  function syncChips() { $$('#legend [data-fly]').forEach(function (b) { var on = b.dataset.fly === laneSel; b.classList.toggle('on', on); b.classList.toggle('here', !on && CHIPOF[cur] === b.dataset.fly); b.setAttribute('aria-pressed', on); }); }
  function dropLane() { if (!laneSel && !laneHot) return; laneSel = null; laneHot = null; syncChips(); paintLane(); }
  function zoomBox(x0, y0, x1, y1, n) { var r = ST.getBoundingClientRect(), s = Math.min((r.width - 72) / (x1 - x0), (r.height - 72) / (y1 - y0));
    if (s >= .66) { panTo((x0 + x1) / 2, (y0 + y1) / 2, Math.min(s, 1)); return; }
    s = .72; panTo((x1 - x0) * s <= r.width - 72 ? (x0 + x1) / 2 : x0 + (r.width / 2 - 36) / s, (y1 - y0) * s <= r.height - 72 ? (y0 + y1) / 2 : n.y, s); }
  function zoomLane(k) { var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, first = null; FR.forEach(function (f) { if (f.chip !== k) return; if (!first) first = BY[f.first]; x0 = Math.min(x0, f.x0); y0 = Math.min(y0, f.y0); x1 = Math.max(x1, f.x1); y1 = Math.max(y1, f.y1); }); zoomBox(x0, y0, x1, y1, first); }
  function zoomFrame(k) { var f = FR.filter(function (x) { return x.k === k; })[0]; if (f) zoomBox(f.x0, f.y0, f.x1, f.y1, BY[f.first]); }
  (function () { var LG = $('#legend'), flowOff = function () { return document.body.classList.contains('gal'); };
    LG.addEventListener('click', function (e) { var b = e.target.closest('[data-fly]'); if (!b) return;
      if (flowOff()) { var c = GAL.querySelector('.gsec [data-s]'); var secs = $$('.gsec', GAL), i = GORDER.indexOf(b.dataset.fly); var s = secs[GORDER.filter(function (g) { return GAL.querySelector('.gcard[data-s="' + (FRAMES.filter(function (f) { return f[3] === g; })[0] || [0, 0, 0, 0, ['x']])[4][0] + '"]'); }).indexOf(b.dataset.fly)]; if (s) GAL.scrollTo({ top: Math.max(0, s.offsetTop - 8), behavior: 'smooth' }); return; }
      laneSel = laneSel === b.dataset.fly ? null : b.dataset.fly; syncChips(); paintLane(); if (laneSel) zoomLane(laneSel); });
    LG.addEventListener('pointerover', function (e) { var b = e.target.closest('[data-fly]'); if (!b || flowOff() || laneHot === b.dataset.fly) return; laneHot = b.dataset.fly; paintLane(); });
    LG.addEventListener('pointerout', function (e) { if (!laneHot) return; var to = e.relatedTarget && e.relatedTarget.closest ? e.relatedTarget.closest('[data-fly]') : null; if (to) return; laneHot = null; paintLane(); });
    addEventListener('keydown', function (e) { if (e.key === 'Escape') dropLane(); }); })();
  (function () { var z = document.createElement('div'); z.className = 'zstack'; z.innerHTML = '<span id="zPct"></span>'; ['zIn', 'zOut', 'zFit'].forEach(function (id) { z.appendChild($('#' + id)); }); ST.appendChild(z); ['pointerdown', 'pointerup', 'click', 'wheel'].forEach(function (t) { z.addEventListener(t, function (e) { e.stopPropagation(); }); }); })();
  addEventListener('keydown', function (e) { if (e.metaKey || e.ctrlKey || e.altKey || /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return; var k = e.key.toLowerCase();
    if (k === 'f') $('#segView [data-view="flow"]').click(); else if (k === 's') $('#segView [data-view="screens"]').click(); else if (k === '0') $('#zFit').click(); });
  function thumbs() { $$('.seg').forEach(function (sg) { var t = sg.querySelector('.th'); if (!t) { t = document.createElement('i'); t.className = 'th'; sg.insertBefore(t, sg.firstChild); }
    var on = sg.querySelector('button.on'); if (!on) { t.style.width = '0'; return; } t.style.width = on.offsetWidth + 'px'; t.style.transform = 'translateX(' + on.offsetLeft + 'px)'; }); }
  new MutationObserver(function (m) { if (m.some(function (x) { return x.target.tagName === 'BUTTON'; })) thumbs(); }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(thumbs);
  $('.head h1').insertAdjacentHTML('beforeend', '<em>' + N + '</em>');

  /* ---------- command palette */
  (function () { var K = $('#cmdk'), Q = $('#ckQ'), Lst = $('#ckL'), items = [], shown = [], idx = 0;
    if (K.parentElement !== document.body) document.body.appendChild(K);
    function openScreen(id) { open(id);
      if (document.body.classList.contains('gal')) { var c = GAL.querySelector('.gcard[data-s="' + id + '"]'); if (c) c.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
      else if (BY[id]) { showDetail(BY[id]); panTo(BY[id].x, BY[id].y, Math.max(vs, .7)); } }
    function click(sel) { return function () { var b = $(sel); if (b) b.click(); }; }
    ORDER.forEach(function (id) { var sc = SCREENS[id]; items.push({ g: 'Screens', t: sc.n, h: LANES[sc.g][0] + (sc.p2 ? ' · ' + sc.p2 : ''), ic: LANES[sc.g][2], k: (sc.n + ' ' + LANES[sc.g][0] + ' ' + id + ' ' + sc.d).toLowerCase(), run: function () { openScreen(id); } }); });
    [['Customer app', 'c'], ['Dealer app', 'd'], ['Admin portal', 'a']].forEach(function (a) { items.push({ g: 'Product', t: 'Product: ' + a[0], h: 'Switch', ic: 'star', k: ('product ' + a[0]).toLowerCase(), run: click('#segProd [data-p="' + a[1] + '"]') }); });
    [['Bahasa Malaysia', 'bm'], ['English', 'en']].forEach(function (a) { items.push({ g: 'Language', t: 'Language: ' + a[0], h: 'Switch', ic: 'globe', k: ('language bahasa ' + a[0]).toLowerCase(), run: click('#segLang [data-l="' + a[1] + '"]') }); });
    items.push({ g: 'View', t: 'View: Flow', h: 'F', ic: 'share', k: 'view flow board connections', run: click('#segView [data-view="flow"]') }, { g: 'View', t: 'View: Screens', h: 'S', ic: 'map', k: 'view screens gallery grid all', run: click('#segView [data-view="screens"]') }, { g: 'View', t: 'Restart the prototype', h: 'Phone home', ic: 'refresh', k: 'restart reset home begin', run: click('#restart') });
    function draw() { var q = Q.value.trim().toLowerCase(); shown = items.filter(function (i) { return !q || q.split(/\s+/).every(function (w) { return i.k.indexOf(w) > -1; }); }); if (idx >= shown.length) idx = 0;
      var h = '', g = ''; shown.forEach(function (i, n) { if (i.g !== g) { g = i.g; h += '<div class="ck-grp">' + g + '</div>'; } h += '<button class="ck-it' + (n === idx ? ' act' : '') + '" data-n="' + n + '">' + G.ic(i.ic, 16) + '<span>' + i.t + '</span><small>' + i.h + '</small></button>'; });
      Lst.innerHTML = h || '<div class="ck-empty">Nothing matches. Try a screen name, a lane, or "dealer".</div>'; var a = Lst.querySelector('.act'); if (a) a.scrollIntoView({ block: 'nearest' }); }
    function openK() { K.hidden = false; Q.value = ''; idx = 0; draw(); setTimeout(function () { Q.focus(); }, 0); }
    function close() { K.hidden = true; }
    function run(n) { var i = shown[n]; if (!i) return; close(); i.run(); }
    Q.addEventListener('input', function () { idx = 0; draw(); });
    Q.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown') { idx = Math.min(shown.length - 1, idx + 1); draw(); e.preventDefault(); } else if (e.key === 'ArrowUp') { idx = Math.max(0, idx - 1); draw(); e.preventDefault(); } else if (e.key === 'Enter') { run(idx); e.preventDefault(); } else if (e.key === 'Escape') { close(); } e.stopPropagation(); });
    Lst.addEventListener('click', function (e) { var b = e.target.closest('.ck-it'); if (b) run(+b.dataset.n); });
    Lst.addEventListener('pointermove', function (e) { var b = e.target.closest('.ck-it'); if (b && +b.dataset.n !== idx) { idx = +b.dataset.n; $$('.act', Lst).forEach(function (x) { x.classList.remove('act'); }); b.classList.add('act'); } });
    K.addEventListener('pointerdown', function (e) { if (e.target === K) close(); });
    $('#kOpen').addEventListener('click', openK);
    addEventListener('keydown', function (e) { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); K.hidden ? openK() : close(); } else if (e.key === '/' && K.hidden && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); openK(); } });
  })();
  /* dropdowns: the lane row's More */
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
  function closeDD() { $$('.dd.open').forEach(function (d) { d.classList.remove('open'); d.firstElementChild.setAttribute('aria-expanded', 'false'); }); }
  addEventListener('pointerdown', function (e) { if (!e.target.closest('.dd')) closeDD(); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDD(); });
  function wireDD(d) { d.firstElementChild.addEventListener('click', function (e) { e.stopPropagation(); var was = d.classList.contains('open'); closeDD(); if (!was) { d.classList.add('open'); this.setAttribute('aria-expanded', 'true'); } }); }
  function fitLegend() { var lg = $('#legend'); if (!lg) return; var more = lg.querySelector('.dd'); if (more) more.remove(); var chips = $$(':scope>button', lg); chips.forEach(function (c) { c.hidden = false; });
    var room = lg.clientWidth; if (lg.scrollWidth <= room + 1) return;
    more = document.createElement('div'); more.className = 'dd r'; more.innerHTML = '<button aria-haspopup="menu" aria-expanded="false"><b>More</b>' + CHEV + '</button><menu role="menu"></menu>'; lg.appendChild(more);
    var menu = more.querySelector('menu'), moved = []; for (var i = chips.length - 1; i >= 0 && lg.scrollWidth > room + 1; i--) { chips[i].hidden = true; moved.unshift(chips[i]); }
    menu.innerHTML = moved.map(function (c) { return '<li><button data-fly="' + c.dataset.fly + '">' + c.querySelector('i').outerHTML + c.textContent + '</button></li>'; }).join('');
    wireDD(more); menu.addEventListener('click', function () { closeDD(); }); syncChips(); }
  fit(); rebuildThumbs(); fitPhone(); thumbs(); fitLegend(); addEventListener('resize', function () { fitPhone(); thumbs(); fitLegend(); });
  (function () { var r0 = ST.getBoundingClientRect(), sw = r0.width, sh = r0.height; new ResizeObserver(function () { var r = ST.getBoundingClientRect(); if (!r.width || (r.width === sw && r.height === sh)) return; if (fitted) fit(); else { vx += (r.width - sw) / 2; vy += (r.height - sh) / 2; apply(); } sw = r.width; sh = r.height; }).observe(ST); })();
  $('#zFit').addEventListener('click', fit);
  function zoomAt(px, py, f) { fitted = false; var ns = Math.max(.08, Math.min(vs * f, 2.6)); vx = px - (px - vx) * (ns / vs); vy = py - (py - vy) * (ns / vs); vs = ns; apply(); }
  $('#zIn').addEventListener('click', function () { var r = ST.getBoundingClientRect(); zoomAt(r.width / 2, r.height / 2, 1.25); });
  $('#zOut').addEventListener('click', function () { var r = ST.getBoundingClientRect(); zoomAt(r.width / 2, r.height / 2, .8); });
  ST.addEventListener('wheel', function (e) { e.preventDefault(); var r = ST.getBoundingClientRect(), pad = e.wheelDeltaY ? e.wheelDeltaY === -3 * e.deltaY : e.deltaMode === 0;
    if (e.ctrlKey || e.metaKey) zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-e.deltaY * .012));
    else if (pad && (e.deltaX || e.deltaY)) { fitted = false; vx -= e.deltaX; vy -= e.deltaY; apply(); }
    else zoomAt(e.clientX - r.left, e.clientY - r.top, e.deltaY < 0 ? 1.13 : 0.885); }, { passive: false });
  var drag = null, moved = 0;
  /* capture the pointer only once a real drag begins, or the click never reaches the screen node */
  ST.addEventListener('pointerdown', function (e) { if (e.target.closest('#detail')) return; drag = { x: e.clientX - vx, y: e.clientY - vy, sx: e.clientX, sy: e.clientY, cap: false }; moved = 0; });
  ST.addEventListener('pointermove', function (e) { if (!drag) return; if (!drag.cap) { if (Math.abs(e.clientX - drag.sx) < 5 && Math.abs(e.clientY - drag.sy) < 5) return; drag.cap = true; ST.classList.add('drag'); try { ST.setPointerCapture(e.pointerId); } catch (err) { } } vx = e.clientX - drag.x; vy = e.clientY - drag.y; moved++; fitted = false; apply(); });
  ST.addEventListener('pointerup', function (e) { if (drag && !drag.cap && !e.target.closest('.fn,#detail,.zstack')) { var fr = e.target.closest('.fr'); if (fr && ST.dataset.lod !== 'hi') zoomFrame(fr.dataset.k); else if (laneSel) dropLane(); } drag = null; ST.classList.remove('drag'); });
  ST.addEventListener('pointercancel', function () { drag = null; ST.classList.remove('drag'); });
  ST.addEventListener('scroll', function () { if (ST.scrollLeft || ST.scrollTop) { vx -= ST.scrollLeft; vy -= ST.scrollTop; ST.scrollLeft = 0; ST.scrollTop = 0; apply(); } });
  ST.addEventListener('dblclick', function (e) { var r = ST.getBoundingClientRect(); zoomAt(e.clientX - r.left, e.clientY - r.top, 1.6); });

  /* the website's frame names its language by message, which still works when the pages open from files */
  addEventListener('message', function (e) { var l = e.data && e.data.gsLang, b = (l === 'bm' || l === 'en') && $('#segLang [data-l="' + l + '"]'); if (b) b.click(); });

  /* ---------- arrive: #screen opens that screen; ?stage=1 shows the phone alone (captures) */
  addEventListener('hashchange', function () { var h = location.hash.replace(/^#/, ''); if (SCREENS[h] && cur !== h) { open(h); if (BY[h]) { showDetail(BY[h]); panTo(BY[h].x, BY[h].y, Math.max(vs, .7)); } } });
  (function () { var q = location.search, stage = /[?&]stage=1/.test(q); if (stage) document.body.classList.add('stage');
    var m = q.match(/[?&]s=([a-z-]+)/), h = (m && m[1]) || location.hash.replace(/^#/, '');
    if (h && SCREENS[h] && h !== 'device') { open(h); if (BY[h] && !stage) setTimeout(function () { panTo(BY[h].x, BY[h].y, .7); showDetail(BY[h]); }, 80); }
    else { showDevice(); syncSeg(); if (!stage) setTimeout(function () { var r = ST.getBoundingClientRect(); panTo(BY.device.x + r.width / 1.44 - 150, BY.device.y, .72); }, 80); }
    window.__flow = true; })();
  try { var _v = localStorage.getItem('gs-view'); if (_v === 'screens') { var _b = $('#segView [data-view="' + _v + '"]'); if (_b) _b.click(); } } catch (_) { }
  window.GSB = { SCREENS: SCREENS, EDGES: EDGES, open: open, nodes: nodes, fitPhone: fitPhone };
})();
