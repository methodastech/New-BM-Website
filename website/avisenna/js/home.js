/*
 * Behaviour for the home page (HomeTestPage), ported from the two inline scripts in
 * Hers/index-v39-footer.html. The markup is static JSX that never re-renders,
 * so the original vanilla DOM logic runs once on mount against the page root.
 * Everything it attaches (listeners, observers, timers, frames) is tracked and
 * released by the cleanup function this returns.
 */
const WA_NUMBER = '60199866792';
const bookUrl = (centre) =>
  `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hi AviSenna, I'd like to book my baseline visit${centre ? ` at ${centre}` : ''}.`)}`;
const BOOK_URL = bookUrl('');

/* Malaysian postcode system. State ranges follow the national two-digit
   allocation (Pos Malaysia). TOWN_HINTS maps postcode prefixes to our centres;
   verify against the "Malaysia Postcode System" reference before launch. */
const PC_STATES = [
  [1, 2, 'Perlis'], [5, 9, 'Kedah'], [10, 14, 'Penang'], [15, 18, 'Kelantan'],
  [20, 24, 'Terengganu'], [25, 28, 'Pahang'], [30, 36, 'Perak'], [39, 39, 'Pahang'],
  [40, 48, 'Selangor'], [49, 49, 'Pahang'], [50, 60, 'Kuala Lumpur'], [62, 62, 'Putrajaya'],
  [63, 64, 'Selangor'], [68, 68, 'Selangor'], [69, 69, 'Pahang'], [70, 73, 'Negeri Sembilan'],
  [75, 78, 'Melaka'], [79, 86, 'Johor'], [87, 87, 'Labuan'], [88, 91, 'Sabah'], [93, 98, 'Sarawak'],
];
const PC_FALLBACK = { Putrajaya: 'Selangor', Labuan: 'Sabah' };
const TOWN_HINTS = [
  ['47301', ['Ara Damansara']], ['47810', ['Kota Damansara']], ['50480', ['Desa Sri Hartamas']],
  ['43000', ['Kajang']], ['43300', ['Seri Kembangan']], ['43500', ['Semenyih']],
  ['14000', ['Bukit Mertajam']], ['34000', ['Taiping']], ['36000', ['Teluk Intan']],
  ['32000', ['Sitiawan']], ['78000', ['Alor Gajah']], ['28400', ['Mentakab']],
  ['7545', ['Ayer Keroh']], ['7535', ['Batu Berendam']],
  ['474', ['Damansara Utama', 'Petaling Jaya']], ['475', ['Subang Jaya']], ['476', ['Subang Jaya']],
  ['471', ['Puchong']], ['480', ['Rawang']], ['531', ['Gombak', 'Setapak']], ['681', ['Gombak']],
  ['521', ['Kepong']], ['560', ['Cheras']], ['561', ['Cheras']], ['570', ['Sri Petaling', 'Bukit Jalil']],
  ['551', ['Pandan Indah', 'Pandan Jaya', 'Pudu']], ['533', ['Setapak']], ['530', ['Setapak']],
  ['501', ['Medan Tuanku']], ['503', ['Medan Tuanku']], ['119', ['Bayan Lepas']],
  ['804', ['Taman Pelangi']], ['813', ['Skudai']], ['811', ['Johor Jaya', 'Mount Austin']],
  ['817', ['Permas Jaya']], ['810', ['Kulai']], ['703', ['Seremban 2', 'Seremban']],
  ['46', ['Petaling Jaya']], ['40', ['Shah Alam']], ['41', ['Klang']], ['42', ['Klang']],
  ['59', ['Bangsar']], ['10', ['Georgetown']], ['12', ['Butterworth']], ['13', ['Butterworth']],
  ['30', ['Ipoh Town', 'Ipoh South', 'Ipoh Greentown']], ['31', ['Ipoh Town', 'Ipoh South', 'Ipoh Greentown']],
  ['79', ['Iskandar Puteri']], ['83', ['Batu Pahat']], ['84', ['Muar']], ['85', ['Segamat']],
  ['75', ['Melaka Raya']], ['77', ['Jasin']], ['70', ['Seremban']], ['05', ['Alor Setar']],
  ['08', ['Sungai Petani']], ['01', ['Kangar']], ['02', ['Kangar']], ['25', ['Kuantan']], ['26', ['Kuantan']],
  ['39', ['Cameron Highlands']], ['15', ['Kota Bharu']], ['16', ['Kota Bharu']],
  ['20', ['Kuala Terengganu']], ['21', ['Kuala Terengganu']], ['93', ['Kuching', 'Tabuan']],
  ['96', ['Sibu']], ['97', ['Bintulu']], ['98', ['Miri']], ['88', ['Kota Kinabalu', 'Inanam']],
  ['90', ['Sandakan']], ['91', ['Tawau']],
].sort((a, b) => b[0].length - a[0].length);

function stateFor(code) {
  const two = parseInt(code.slice(0, 2), 10);
  const hit = PC_STATES.find(([lo, hi]) => two >= lo && two <= hi);
  return hit ? hit[2] : null;
}
function hintsFor(code) {
  const hit = TOWN_HINTS.find(([prefix]) => code.indexOf(prefix) === 0);
  return hit ? hit[1] : [];
}

function initHomeTest(root) {
  const $$ = (sel) => Array.from(root.querySelectorAll(sel));
  const byId = (id) => root.querySelector(`#${id}`);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const disposers = [];
  const on = (target, type, fn, opts) => {
    target.addEventListener(type, fn, opts);
    disposers.push(() => target.removeEventListener(type, fn, opts));
  };
  const timers = new Set();
  const later = (fn, ms) => {
    const id = setTimeout(() => { timers.delete(id); fn(); }, ms);
    timers.add(id);
  };
  const frames = new Set();
  const frame = (fn) => {
    const id = requestAnimationFrame((t) => { frames.delete(id); fn(t); });
    frames.add(id);
  };
  const observers = [];
  let disposed = false;

  /* Mobile menu: full screen under the bar, so the page behind it is locked
     while it is open and released when it closes or the page unmounts. */
  const burger = byId('burger');
  const menu = byId('mmenu');
  if (burger && menu) {
    /* Locks <html> only. The shared lockScroll() also locks <body>, which
       turns <body> into the scroll container and drops this page's sticky
       header out of view when the menu is opened part-way down the page.
       <html> is the scrolling element here, so locking it alone holds the
       page still. */
    const setOpen = (open) => {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.classList.toggle('open', open);
      document.documentElement.classList.toggle('hometest-menu-open', open);
    };
    on(burger, 'click', () => setOpen(burger.getAttribute('aria-expanded') !== 'true'));
    on(menu, 'click', (e) => {
      if (e.target.closest('a, button')) setOpen(false);
    });
    on(document, 'keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('open')) setOpen(false);
    });
    disposers.push(() => document.documentElement.classList.remove('hometest-menu-open'));
  }

  /* Nav: hide while scrolling down, reveal on the way back up, like the site
     header on every other page. The promo bar stays pinned and moves up into
     its place. Tiny jitters are ignored, it always shows near the top, and it
     never hides while the menu is open. */
  {
    let last = window.scrollY;
    on(window, 'scroll', () => {
      const y = window.scrollY;
      if (Math.abs(y - last) <= 6) return;
      const menuOpen = menu && menu.classList.contains('open');
      root.classList.toggle('nav-hidden', !menuOpen && y > last && y > 120);
      last = y;
    }, { passive: true });
    disposers.push(() => root.classList.remove('nav-hidden'));
  }

  /* Accordions (FAQ, full test list, pricing stack) */
  $$('.faq-q').forEach((btn) => {
    on(btn, 'click', () => {
      const item = btn.closest('.faq-item');
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      item.classList.toggle('open', !open);
    });
  });

  /* Reveal on scroll */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  observers.push(io);
  $$('.rv').forEach((el) => io.observe(el));

  /* Persistent CTA — on screen for the whole scroll. It reads "See plan and
     pricing" (→ #pricing) until the pricing card's button comes into view,
     then slides away and comes back as "Book my baseline visit" (→ booking);
     scrolling back above the price reverses it.

     It steps aside twice: while the postcode field is focused, because the
     phone keyboard would cover it, and once the footer comes into view, where
     it would otherwise sit on top of the footer's own links. Scrolling back up
     above the footer brings it straight back. */
  const cta = byId('floatCta');
  const priceBtn = byId('priceBtn');
  const pcField = byId('pc');
  const footer = root.querySelector('.footer');
  if (cta && priceBtn) {
    const ctaLabel = cta.querySelector('.fc-label');
    let phase2 = false, typing = false, swapping = false;
    const applyPhase = (p2) => {
      ctaLabel.textContent = p2 ? 'Book my baseline visit' : 'See plan and pricing';
      cta.classList.toggle('phase2', p2);
      if (p2) { cta.setAttribute('href', BOOK_URL); cta.setAttribute('target', '_blank'); cta.setAttribute('rel', 'noopener noreferrer'); }
      else { cta.setAttribute('href', '#pricing'); cta.removeAttribute('target'); cta.removeAttribute('rel'); }
    };
    const syncCta = () => {
      const wantP2 = priceBtn.getBoundingClientRect().top < window.innerHeight;
      if (wantP2 !== phase2 && !swapping) {
        swapping = true; phase2 = wantP2;
        cta.classList.remove('show');
        later(() => { applyPhase(phase2); swapping = false; syncCta(); }, 420);
        return;
      }
      const atFooter = footer ? footer.getBoundingClientRect().top < window.innerHeight : false;
      if (!swapping) cta.classList.toggle('show', !typing && !atFooter);
    };
    applyPhase(false);
    syncCta();
    let ctaTick = false;
    on(window, 'scroll', () => { if (!ctaTick) { ctaTick = true; frame(() => { ctaTick = false; syncCta(); }); } }, { passive: true });
    on(window, 'resize', syncCta);
    if (pcField) {
      on(pcField, 'focus', () => { typing = true; syncCta(); });
      on(pcField, 'blur', () => { typing = false; syncCta(); });
    }
  }

  /* Disclaimer expander in the key-facts strip */
  const discBtn = byId('discMore'), discTxt = byId('discMoreTxt');
  if (discBtn && discTxt) {
    on(discBtn, 'click', () => {
      const open = discBtn.getAttribute('aria-expanded') === 'true';
      discBtn.setAttribute('aria-expanded', String(!open));
      discTxt.hidden = open;
      discBtn.textContent = open ? 'Read more' : 'Read less';
    });
  }

  /* Collection-centre search */
  const pcInput = byId('pc');
  const pcBtn = byId('pcBtn');
  const pcNote = byId('pcNote');
  const pcResult = byId('pcResult');
  const centresItem = byId('centresItem');
  const centresGrid = byId('centresGrid');
  if (pcInput && pcBtn && pcNote && centresItem && centresGrid) {
    const pcDefault = pcNote.textContent;

    const openCentres = () => {
      centresItem.querySelector('.faq-q').setAttribute('aria-expanded', 'true');
      centresItem.classList.add('open');
    };
    const resetCentres = () => {
      centresGrid.querySelectorAll('.cgroup').forEach((g) => {
        g.classList.remove('pc-hide');
        g.querySelectorAll('li').forEach((li) => li.classList.remove('pc-hide', 'pc-hit'));
      });
    };

    const pcSearch = () => {
      const q = pcInput.value.trim();
      const groups = centresGrid.querySelectorAll('.cgroup');
      if (!q) { resetCentres(); pcNote.textContent = pcDefault; return; }

      const digits = q.replace(/[\s-]/g, '');
      if (/^\d+$/.test(digits)) {
        if (digits.length < 5) { pcNote.textContent = 'Malaysian postcodes have 5 digits. Keep typing…'; return; }
        if (digits.length > 5) { pcNote.textContent = 'That’s more than 5 digits. Please check your postcode.'; return; }
        const state = stateFor(digits);
        if (!state) {
          resetCentres();
          pcNote.textContent = 'That doesn’t look like a Malaysian postcode. Try your area or state name instead.';
          return;
        }
        const showState = PC_FALLBACK[state] || state;
        const hints = hintsFor(digits);
        let count = 0, hitCount = 0;
        groups.forEach((g) => {
          const match = g.querySelector('h4').textContent === showState;
          g.classList.toggle('pc-hide', !match);
          g.querySelectorAll('li').forEach((li) => {
            li.classList.remove('pc-hide');
            let hit = false;
            if (match) {
              count++;
              hit = hints.some((h) => li.textContent.indexOf(h) !== -1);
            }
            li.classList.toggle('pc-hit', match && hit);
            if (match && hit) hitCount++;
          });
        });
        openCentres();
        let msg;
        if (PC_FALLBACK[state]) {
          msg = `No centre in ${state} yet. Your closest options are in ${showState}.`;
        } else {
          msg = `${count}${count === 1 ? ' centre serves ' : ' centres serve '}postcode ${digits} (${showState}).`;
          if (hitCount) msg += ' Closest highlighted.';
        }
        pcNote.textContent = msg;
        return;
      }

      const ql = q.toLowerCase();
      let hits = 0;
      groups.forEach((g) => {
        const stateHit = g.querySelector('h4').textContent.toLowerCase().indexOf(ql) !== -1;
        let any = false;
        g.querySelectorAll('li').forEach((li) => {
          li.classList.remove('pc-hit');
          const hit = stateHit || li.textContent.toLowerCase().indexOf(ql) !== -1;
          li.classList.toggle('pc-hide', !hit);
          if (hit) { any = true; hits++; }
        });
        g.classList.toggle('pc-hide', !any);
      });
      openCentres();
      pcNote.textContent = hits
        ? `${hits}${hits === 1 ? ' centre matches ' : ' centres match '}“${q}”.`
        : 'No centre matches that yet. Try a nearby area or state name.';
    };

    /* Nearest-centre result under the search (no dropdown) */
    const renderNearest = () => {
      if (!pcResult) return;
      const hits = [], rest = [];
      centresGrid.querySelectorAll('.cgroup').forEach((g) => {
        if (g.classList.contains('pc-hide')) return;
        g.querySelectorAll('li').forEach((li) => {
          if (li.classList.contains('pc-hide')) return;
          (li.classList.contains('pc-hit') ? hits : rest).push(li.textContent);
        });
      });
      const names = hits.concat(rest);
      if (!pcInput.value.trim() || !names.length || names.length > 60) { pcResult.hidden = true; pcResult.replaceChildren(); return; }

      const max = 8;
      const nodes = names.slice(0, max).map((n, i) => {
        const span = document.createElement('span');
        if (i < hits.length) span.className = 'hit';
        span.textContent = n;
        return span;
      });
      if (names.length > max) {
        const more = document.createElement('span');
        more.textContent = `+${names.length - max} more`;
        nodes.push(more);
      }
      const row = document.createElement('div');
      row.className = 'pc-book-row';
      const book = document.createElement('a');
      book.className = 'btn btn--dark pc-book';
      book.dataset.cta = 'book';
      book.href = bookUrl(names[0]);
      book.target = '_blank';
      book.rel = 'noopener noreferrer';
      book.textContent = `Book at ${names[0]}`;
      row.appendChild(book);
      nodes.push(row);
      pcResult.replaceChildren(...nodes);
      pcResult.hidden = false;
    };

    on(pcBtn, 'click', () => { pcSearch(); later(renderNearest, 0); });
    on(pcInput, 'input', pcSearch);
    on(pcInput, 'keydown', (e) => { if (e.key === 'Enter') { pcSearch(); later(renderNearest, 0); } });
  }

  /* Rails (testimonials, offers) */
  $$('.tc-nav').forEach((btn) => {
    on(btn, 'click', () => {
      const rail = btn.getAttribute('data-rail')
        ? byId(btn.getAttribute('data-rail'))
        : btn.parentElement.querySelector('.tc-rail, .offer-rail');
      if (!rail) return;
      const card = rail.firstElementChild;
      const step = card ? card.getBoundingClientRect().width + 16 : 320;
      rail.scrollBy({ left: btn.classList.contains('tc-next') ? step : -step, behavior: 'smooth' });
    });
  });
  const mmRail = byId('mmRail'), mmDots = byId('mmDots'), mmCount = byId('mmCount');
  if (mmRail && mmDots) {
    const mmN = mmRail.children.length;
    on(mmRail, 'scroll', () => {
      const w = mmRail.firstElementChild.getBoundingClientRect().width + 16;
      const idx = Math.max(0, Math.min(mmN - 1, Math.round(mmRail.scrollLeft / w)));
      mmDots.querySelectorAll('i').forEach((d, i) => d.classList.toggle('on', i === idx));
      if (mmCount) mmCount.textContent = `${idx + 1} / ${mmN}`;
    }, { passive: true });
  }

  /* Scroll-scrubbed card deck (everlab.com.au) + pinned scrubbed steps (joinpomegranate.com) */
  (() => {
    const clamp = (v) => Math.max(0, Math.min(1, v));
    const panels = $$('.stack-panel');
    const steps = $$('.hiw-step');

    /* In-card reveals (list stagger, chart draw, gauge) fire once when a card is in view */
    if ('IntersectionObserver' in window && !reduced) {
      const pio = new IntersectionObserver((es) => {
        es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); pio.unobserve(e.target); } });
      }, { threshold: 0.35 });
      observers.push(pio);
      panels.forEach((p) => pio.observe(p));
    } else {
      panels.forEach((p) => p.classList.add('in'));
    }

    const runway = byId('stack');
    const how = byId('how'), stage = byId('hiwStage'), track = byId('hiwTrack');
    if (reduced || !runway || !how || !stage || !track || !panels.length || !steps.length) return;
    root.classList.add('scrub');

    /* Deck: progress over the pinned distance (runway minus one viewport); cards slide 1:1 with the scroll */
    const HIDDEN = 200, PEEK = 110, STOPS = [0, 3, 6, 9], BASE = [255, 255, 255];
    const n = panels.length, seg = 1 / (n - 1);
    const deckTarget = () => {
      const r = runway.getBoundingClientRect();
      return clamp(-r.top / (runway.offsetHeight - window.innerHeight));
    };
    const applyDeck = (progress) => {
      const dark = panels.map(() => 0);
      panels.forEach((card, i) => {
        if (i === 0) return;
        const ownStart = (i - 1) * seg, emergeStart = (i - 2) * seg;
        const emerge = clamp((progress - emergeStart) / seg), own = clamp((progress - ownStart) / seg);
        const y = progress < ownStart ? HIDDEN + (PEEK - HIDDEN) * emerge : PEEK + (STOPS[i] - PEEK) * own;
        card.style.transform = `translateY(${y.toFixed(3)}%)`;
        if (own > 0) { for (let j = 0; j < i; j++) dark[j] = Math.max(dark[j], (i - j) * 12 * own); }
      });
      panels.forEach((card, i) => {
        const d = dark[i];
        card.style.background = d ? `rgb(${Math.round(BASE[0] - d)},${Math.round(BASE[1] - d)},${Math.round(BASE[2] - d)})` : '';
      });
    };

    /* Steps: section pinned, one step per 800px of scroll, everything linear with scroll */
    const PIN = parseFloat(getComputedStyle(root).getPropertyValue('--hiw-pin')) || 2400;
    const parts = steps.map((st) => ({
      tile: st.querySelector('.hiw-tile'), ico: st.querySelector('.hiw-ico'), det: st.querySelector('.hiw-detail'), el: st,
    }));
    const narrow = () => window.innerWidth <= 1020;
    const applyStep = (pt, t) => {
      pt.tile.style.opacity = t.toFixed(3); pt.tile.style.transform = `translateY(${(-100 * (1 - t)).toFixed(1)}px)`;
      pt.ico.style.transform = `scale(${t.toFixed(3)})`;
      pt.det.style.opacity = t.toFixed(3); pt.det.style.transform = `translateY(${(100 * (1 - t)).toFixed(1)}px)`;
    };
    const stepsTarget = () => clamp(-how.getBoundingClientRect().top / PIN);
    const applySteps = (progress) => {
      parts.forEach((pt, k) => applyStep(pt, clamp(progress * parts.length - k)));
      track.firstElementChild.style.transform = `scaleX(${progress.toFixed(4)})`;
    };
    /* Narrow screens: no pin; each step is scrubbed by its own position in the viewport */
    const applyNarrowSteps = () => {
      const vh = window.innerHeight;
      parts.forEach((pt) => { const top = pt.el.getBoundingClientRect().top; applyStep(pt, clamp((vh * 0.92 - top) / (vh * 0.42))); });
    };
    const positionTrack = () => {
      const ir = parts[0].ico.getBoundingClientRect(), sr = stage.getBoundingClientRect();
      track.style.top = `${Math.round(ir.top + ir.height / 2 - sr.top)}px`;
    };

    /* One frame loop with light easing, so the deck stays smooth on wheel mice */
    const cur = { deck: 0, steps: 0 }, target = { deck: 0, steps: 0 }, EASE = 0.18;
    let running = false;
    const tick = () => {
      let done = true;
      ['deck', 'steps'].forEach((k) => {
        const diff = target[k] - cur[k];
        if (Math.abs(diff) < 0.0006) cur[k] = target[k]; else { cur[k] += diff * EASE; done = false; }
      });
      applyDeck(cur.deck);
      if (!narrow()) applySteps(cur.steps);
      if (!done) frame(tick); else running = false;
    };
    const update = () => {
      target.deck = deckTarget();
      if (narrow()) { applyNarrowSteps(); target.steps = 0; } else { target.steps = stepsTarget(); }
      if (!running) { running = true; frame(tick); }
    };
    const snap = () => {
      cur.deck = target.deck = deckTarget();
      cur.steps = target.steps = narrow() ? 0 : stepsTarget();
      applyDeck(cur.deck);
      if (narrow()) applyNarrowSteps(); else applySteps(cur.steps);
    };
    on(window, 'scroll', update, { passive: true });
    on(window, 'resize', () => { positionTrack(); snap(); });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => { if (!disposed) { positionTrack(); snap(); } });
    }
    positionTrack(); snap();
  })();

  disposers.push(initSocialSwitch(root, later));

  return () => {
    disposed = true;
    disposers.forEach((d) => d && d());
    observers.forEach((o) => o.disconnect());
    timers.forEach(clearTimeout);
    frames.forEach(cancelAnimationFrame);
    root.classList.remove('scrub');
  };
}

/* Footer "Follow us" switcher: Community | Business, as WAI-ARIA tabs.
   Without this both groups simply show.

   Exported because the same footer is now the whole site's footer
   (components/layout/Footer), which has to start the switcher itself. */
function initSocialSwitch(page, later) {
  const root = page.querySelector('.social-switch');
  if (!root) return null;

  const SIDES = ['community', 'business'];
  const KEY = 'social-switch-side';
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const T_OUT = reduced ? 0 : 140, T_SWIPE = reduced ? 120 : 320;

  const tablist = root.querySelector('.social-switch__tabs');
  const tabs = Array.from(root.querySelectorAll('.social-switch__tab'));
  const line = root.querySelector('.social-switch__line');
  const lineText = line && line.querySelector('.social-switch__line-text');
  const panels = {};
  SIDES.forEach((side) => { panels[side] = root.querySelector(`.social-switch__panel[data-side="${side}"]`); });
  if (tabs.length !== 2 || !panels.community || !panels.business) return null;

  let current = null;

  const remember = (side) => { try { window.localStorage.setItem(KEY, side); } catch (e) { /* storage unavailable */ } };
  const recall = () => { try { return window.localStorage.getItem(KEY); } catch (e) { return null; } };
  const fromUrl = () => {
    const m = /[?&]side=(business|community)\b/i.exec(window.location.search);
    return m ? m[1].toLowerCase() : null;
  };
  const track = (name, params) => {
    if (typeof window.gtag === 'function') { try { window.gtag('event', name, params); } catch (e) { /* ignore */ } }
  };

  const showPanel = (side, hide) => {
    const p = panels[side];
    if (hide) { p.classList.add('is-hidden'); p.setAttribute('inert', ''); p.setAttribute('aria-hidden', 'true'); }
    else { p.classList.remove('is-hidden'); p.removeAttribute('inert'); p.removeAttribute('aria-hidden'); }
  };
  const setTabs = (side) => {
    tabs.forEach((t) => {
      const isOn = t.getAttribute('data-side') === side;
      t.setAttribute('aria-selected', isOn ? 'true' : 'false');
      t.setAttribute('tabindex', isOn ? '0' : '-1');
    });
  };
  const setLine = (side) => { if (lineText) lineText.textContent = panels[side].getAttribute('data-line') || ''; };

  const apply = (requested, animate) => {
    const side = SIDES.includes(requested) ? requested : 'community';
    if (side === current) return;
    const prev = current;
    current = side;
    root.setAttribute('data-side', side);
    setTabs(side);

    if (!animate || !prev) { /* first paint: no motion */
      SIDES.forEach((s) => { showPanel(s, s !== side); panels[s].classList.remove('is-leaving', 'is-entering'); });
      setLine(side);
      if (line) line.classList.remove('is-leaving', 'is-entering');
      return;
    }
    /* Community → Business swipes left to right; the way back, right to left */
    root.setAttribute('data-dir', side === 'business' ? 'right' : 'left');
    const next = panels[side];
    /* 1. place the new panel just outside on the incoming side, then let both slide together */
    next.classList.remove('is-leaving'); next.classList.add('is-entering'); showPanel(side, false);
    void next.offsetWidth; /* commit the entry position before it moves */
    next.classList.remove('is-entering');
    panels[prev].classList.remove('is-entering'); panels[prev].classList.add('is-leaving');
    if (line) line.classList.add('is-leaving');
    later(() => {
      setLine(side);
      if (line) { line.classList.remove('is-leaving'); line.classList.add('is-entering'); void line.offsetWidth; line.classList.remove('is-entering'); }
    }, T_OUT);
    /* 2. once the swipe has finished, the old panel is hidden and unreachable */
    later(() => {
      if (current !== side) return; /* a newer switch took over */
      showPanel(prev, true); panels[prev].classList.remove('is-leaving');
    }, T_SWIPE);
  };

  const select = (side, viaUser) => {
    apply(side, true);
    if (viaUser) { remember(side); track('side_switch', { side }); }
  };

  const disposers = [];
  const on = (target, type, fn) => {
    target.addEventListener(type, fn);
    disposers.push(() => target.removeEventListener(type, fn));
  };

  tabs.forEach((t) => on(t, 'click', () => select(t.getAttribute('data-side'), true)));
  /* Keyboard: Left/Right move and select, Home/End jump */
  on(tablist, 'keydown', (e) => {
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    let j = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % tabs.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') j = 0;
    else if (e.key === 'End') j = tabs.length - 1;
    if (j === null) return;
    e.preventDefault();
    tabs[j].focus();
    select(tabs[j].getAttribute('data-side'), true);
  });
  /* Card clicks (analytics only if the site ever adds Google Analytics) */
  on(root, 'click', (e) => {
    const a = e.target.closest && e.target.closest('.social-switch__card');
    if (a) track('social_click', { side: current, platform: a.getAttribute('data-platform') || '' });
  });

  /* ?side= in the URL beats the remembered choice, which beats the default.
     The side is set before the control is shown, so nothing slides on load. */
  apply(fromUrl() || recall() || 'community', false);
  root.classList.add('is-ready');

  return () => disposers.forEach((d) => d());
}

/* Start-up, as in pages/HomeTestPage.jsx */
(function () {
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.style.scrollBehavior = 'smooth';
  initHomeTest(document.getElementById('hometest'));
})();
