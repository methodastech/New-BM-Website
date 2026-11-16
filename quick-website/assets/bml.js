/* Brand Method Standard + Premium pages: page script. Version 2. No tracking, no third party code.
   What it keeps in the browser, and for how long:
     the brief in progress (package, references, business answers)  this device, until it is sent
     your name, email and WhatsApp                                    this tab only, gone when it closes
     campaign tags (utm_*)                                            this tab only
   Never a card detail. Card payments happen on Stripe's own page. */
(function () {
  var d = document, w = window, root = d.documentElement;
  var SELF = (d.currentScript && d.currentScript.src) || '';
  root.classList.add('bml-js');
  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }
  function store(area, key, val) {
    try {
      if (val === undefined) { return JSON.parse(w[area].getItem(key)) || {}; }
      w[area].setItem(key, JSON.stringify(val));
    } catch (e) {}
    return val || {};
  }
  var params = new URLSearchParams(w.location.search);
  var DATA = {};
  var dataEl = d.getElementById('bml-data');
  if (dataEl) { try { DATA = JSON.parse(dataEl.textContent); } catch (e) {} }
  var STG = w.BML_STAGING || {};
  var APP = String(STG.app || DATA.app || '').replace(/\/$/, '');
  var CHECKOUT = STG.checkout === true || (DATA.flags || {}).checkout === true;

  // currency: every price is on the page in both. The visitor's choice is kept on this device.
  var CURD = DATA.currencies || { list: ['USD', 'MYR'], symbols: { USD: 'US$', MYR: 'RM' }, names: {} };
  var CUR = (function () {
    var saved = null;
    try { saved = w.localStorage.getItem('bml.cur'); } catch (e) {}
    if (CURD.list.indexOf(saved) >= 0) return saved;
    // ringgit first, for every visitor (owner, 15 Nov): we are a Malaysian studio and the headline is in ringgit.
    // A visitor who switches to US dollars keeps that choice on this device.
    return CURD.list.indexOf('MYR') >= 0 ? 'MYR' : CURD.list[0];
  })();
  function setCur(c, keep) {
    if (CURD.list.indexOf(c) < 0) return;
    CUR = c;
    root.setAttribute('data-cur', c);
    if (keep) { try { w.localStorage.setItem('bml.cur', c); } catch (e) {} }
    $$('[data-cur-set]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-cur-set') === c ? 'true' : 'false'); });
    d.dispatchEvent(new CustomEvent('bml:cur'));
  }
  setCur(CUR, false);
  d.addEventListener('click', function (e) {
    var b = e.target.closest('[data-cur-set]');
    if (b) setCur(b.getAttribute('data-cur-set'), true);
  });

  // campaign tags only
  var utm = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (k) {
    var v = params.get(k); if (v) utm[k] = v.slice(0, 120);
  });
  if (Object.keys(utm).length) store('sessionStorage', 'bml.utm', utm);

  var BRIEF = 'bml.brief', CONTACT = 'bml.brief.contact';
  function brief(patch) {
    var s = store('localStorage', BRIEF);
    if (patch) { for (var k in patch) s[k] = patch[k]; store('localStorage', BRIEF, s); }
    return s;
  }
  var known = {};
  (DATA.builds || []).forEach(function (b) { known[b.id] = b.name; });
  var MAX = DATA.maxRefs || 3;
  function refs() { return (brief().refs || []).filter(function (id) { return known[id]; }).slice(0, MAX); }

  // a package button remembers the package for the brief
  d.addEventListener('click', function (e) {
    var a = e.target.closest('[data-pick-plan]');
    if (a) brief({ plan: a.getAttribute('data-pick-plan') });
  });

  // portfolio: open any build, mark up to 3 as references
  var folio = $('[data-folio]');
  if (folio) {
    var tray = $('[data-tray]'), more = $('[data-folio-more]');
    var paintRefs = function () {
      var list = refs();
      $$('[data-ref]', folio).forEach(function (b) {
        var on = list.indexOf(b.getAttribute('data-ref')) >= 0;
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        b.textContent = on ? 'Reference added' : 'Use reference';
      });
      if (tray) {
        $('[data-tray-count]', tray).textContent = list.length ? list.length + ' of ' + MAX + ' references chosen' : 'Use our references';
        $('[data-tray-names]', tray).textContent = list.length ? list.map(function (id) { return known[id]; }).join(', ') + '.' : 'Tap Use reference on up to ' + MAX + ' builds above.';
        // each slot shows the build that was picked; tapping it takes the build out again
        $$('.bml-slot', tray).forEach(function (slot, i) {
          var id = list[i];
          slot.textContent = '';
          slot.classList.toggle('is-on', !!id);
          if (!id) return;
          var from = $('[data-build="' + id + '"] img', folio), b = d.createElement('button'), im = d.createElement('img');
          b.type = 'button'; b.setAttribute('data-unref', id); b.setAttribute('aria-label', 'Remove ' + known[id]);
          im.src = from ? (from.currentSrc || from.src) : ''; im.alt = '';
          b.appendChild(im); slot.appendChild(b);
        });
      }
    };
    if (tray) tray.addEventListener('click', function (e) {
      var b = e.target.closest('[data-unref]'); if (!b) return;
      var list = refs(), at = list.indexOf(b.getAttribute('data-unref'));
      if (at >= 0) list.splice(at, 1);
      brief({ refs: list });
      paintRefs();
    });
    folio.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ref]'); if (!b) return;
      var id = b.getAttribute('data-ref'), list = refs(), at = list.indexOf(id);
      if (at >= 0) list.splice(at, 1);
      else if (list.length < MAX) list.push(id);
      else { $('[data-tray-names]', tray).textContent = 'That is ' + MAX + ' already. Remove 1 to add another.'; return; }
      brief({ refs: list });
      paintRefs();
    });
    // Without this script every build is listed. With it, the later ones fold behind 1 button.
    if (more) {
      $$('[data-more]', folio).forEach(function (el) { el.hidden = true; });
      more.hidden = false;
      more.addEventListener('click', function () {
        $$('[data-more]', folio).forEach(function (el) { el.hidden = false; el.classList.add('is-in'); });
        more.hidden = true;
      });
    }
    paintRefs();
  }

  // the brief: 5 short steps instead of choosing a design
  var form = d.getElementById('bml-brief');
  if (form) {
    var plans = DATA.plans || [], step = 1, LAST = 5;
    var panes = $$('[data-pane]', form), nav = $('[data-brief-nav]', form), msg = $('[data-step-msg]', form), out = $('[data-brief-msg]', form);
    var back = $('[data-brief-back]', form), next = $('[data-brief-next]', form), pay = $('[data-brief-pay]', form);
    if (!CHECKOUT || !APP) pay.textContent = 'Send my brief';  // 16 Nov 2026: no card checkout yet, the brief goes to the team
    var side = form.closest('[data-brief]');
    var URLISH = /^(https?:\/\/)?[a-z0-9][a-z0-9.-]*\.[a-z]{2,}(\/\S*)?$/i, EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;
    var WHY = { bad_currency: 'That currency is not available for this package. Please choose again.', unknown_plan: 'That package is not available online. Please choose again.', bad_brief: 'Something in the brief could not be read. Please check each step.', terms_required: 'Please confirm you have read the package terms.', busy: 'Too many tries in a short time. Please wait a few minutes.', bad_request: 'That did not go through. Please try again.' };
    var planOf = function (id) { for (var i = 0; i < plans.length; i++) if (plans[i].id === id) return plans[i]; return null; };
    // prices follow the currency on show; the server charges the same figure from the catalogue
    var money = function (p, n) { var pr = p.prices && p.prices[CUR], k = n === p.first ? 'first' : 'recurring'; return ((CURD.symbols || {})[CUR] || p.symbol) + Number(pr ? pr[k] : n).toLocaleString('en-US'); };
    var val = function (name) { var el = form.elements[name]; return el && typeof el.value === 'string' ? el.value.trim() : ''; };
    var checked = function (name) { return $$('input[name="' + name + '"]:checked', form).map(function (el) { return el.value; }); };
    var lines = function (text) { return text.split(/[\n,]+/).map(function (x) { return x.trim(); }).filter(Boolean); };

    // restore what was typed before
    var saved = brief(), who = store('sessionStorage', CONTACT);
    var q = params.get('plan');
    if (q && planOf(q)) saved = brief({ plan: q });
    ['link1', 'link2', 'competitors', 'business', 'industry', 'what', 'colours', 'notes'].forEach(function (k) { if (saved[k] && form.elements[k]) form.elements[k].value = saved[k]; });
    ['name', 'email', 'whatsapp'].forEach(function (k) { if (who[k]) form.elements[k].value = who[k]; });
    if (saved.domain_name && form.elements.domain_name) form.elements.domain_name.value = saved.domain_name;
    $$('input[name="domain_choice"]', form).forEach(function (r) { r.checked = r.value === saved.domain_choice; });
    $$('input[name="plan"]', form).forEach(function (r) { r.checked = r.value === saved.plan; });
    var pre = { ref: refs(), include: saved.include || [], style: saved.style || [] };
    Object.keys(pre).forEach(function (k) { $$('input[name="' + k + '"]', form).forEach(function (c) { c.checked = pre[k].indexOf(c.value) >= 0; }); });

    var keep = function () {
      brief({ plan: checked('plan')[0] || null, refs: checked('ref'), include: checked('include'), style: checked('style'), link1: val('link1'), link2: val('link2'), competitors: val('competitors'), business: val('business'), industry: val('industry'), what: val('what'), colours: val('colours'), notes: val('notes'), domain_choice: checked('domain_choice')[0] || '', domain_name: val('domain_name') });
      store('sessionStorage', CONTACT, { name: val('name'), email: val('email'), whatsapp: val('whatsapp') });
    };
    var collect = function () {
      return {
        plan: checked('plan')[0] || '',
        currency: CUR,
        business: { name: val('business'), what: val('what'), industry: val('industry') },
        include: checked('include'), style: checked('style'), colours: val('colours'), notes: val('notes'),
        references: { builds: checked('ref'), links: [val('link1'), val('link2')].filter(Boolean), competitors: lines(val('competitors')).slice(0, 3) },
        contact: { name: val('name'), email: val('email'), whatsapp: val('whatsapp') },
        domain: { choice: checked('domain_choice')[0] || 'later', name: checked('domain_choice')[0] === 'later' ? '' : domName() },
      };
    };
    // the domain: free with your own, a one time add-on when we register it
    var DOMAIN = /^[a-z0-9][a-z0-9-]*(\.[a-z0-9-]+)+$/i, WISH = /^[a-z0-9][a-z0-9-]*(\.[a-z0-9-]+)*$/i;
    var domName = function () { return val('domain_name').toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, ''); };
    var cash = function (n) { return ((CURD.symbols || {})[CUR] || '') + Number(n).toLocaleString('en-US'); };
    var firstOf = function (p) { var pr = p.prices && p.prices[CUR]; return Number(pr ? pr.first : p.first); };
    var domainFee = function () { var a = (DATA.addons || {}).domain; return a && checked('domain_choice')[0] === 'need' ? Number(a.prices[CUR]) || 0 : 0; };
    var paintDomain = function () {
      var box = $('[data-domain]', form); if (!box) return;
      var c = checked('domain_choice')[0] || '', p = planOf(checked('plan')[0]), kind = p && p.kind !== 'subscription' ? 'one_time' : 'subscription';
      $('[data-domain-name]', box).hidden = !(c === 'have' || c === 'need');
      $('[data-domain-label]', box).textContent = c === 'need' ? 'The name you would like' : 'Your domain';
      $$('[data-domain-note]', box).forEach(function (el) { el.hidden = el.getAttribute('data-domain-note') !== c; });
      $$('[data-domain-renew]', box).forEach(function (el) { el.hidden = el.getAttribute('data-domain-renew') !== kind; });
    };
    var mark = function (name, text) {
      var el = form.elements[name]; if (!el || !el.closest) return;
      el.setAttribute('aria-invalid', text ? 'true' : 'false');
      var slot = $('em', el.closest('.bml-field')); if (slot) slot.textContent = text || '';
    };
    var paintOrder = function () {
      var p = planOf(checked('plan')[0]);
      var nextDate = new Date(); nextDate.setMonth(nextDate.getMonth() + 1);
      var when = nextDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      var sub = p && p.kind === 'subscription';
      $('[data-sum-plan]', side).textContent = p ? p.name : 'Choose a package';
      var sumNote = $('[data-sum-note]', side); if (sumNote) sumNote.hidden = !p;
      var fee = p ? domainFee() : 0, row = $('[data-sum-domain-row]', side);
      if (row) { row.hidden = !fee; $('[data-sum-domain]', side).textContent = fee ? cash(fee) + ' once' : ''; }
      $('[data-sum-today]', side).textContent = p ? cash(firstOf(p) + fee) : '';
      paintDomain();
      $('[data-sum-then]', side).textContent = p ? (sub ? money(p, p.recurring) + ' a ' + p.interval + ', from ' + when : 'Nothing. 1 payment') : '';
      $('[data-sum-cur]', side).textContent = p ? ((CURD.names || {})[CUR] || CUR) : '';
      // Every Standard package is paid for here (owner, 16 Nov: "they pay"); the server still decides whether a one time plan may be sold online.
      if (pay) pay.textContent = (CHECKOUT && APP) ? 'Pay and start my website' : 'Send my brief';  // 16 Nov 2026: until card checkout opens, the brief goes to the team
      $$('[data-sum-art]', side).forEach(function (el) { el.hidden = !p || el.getAttribute('data-sum-art') !== p.id; });
    };
    var check = function (n) {
      var ok = true, fail = function (name, text) { mark(name, text); ok = false; };
      if (n === 1 && !checked('plan').length) { msg.textContent = 'Choose a package to continue.'; return false; }
      if (n === 2) {
        ['link1', 'link2'].forEach(function (k) { mark(k, ''); if (val(k) && !URLISH.test(val(k))) fail(k, 'Enter a web address such as example.com.'); });
        mark('competitors', '');
        if (lines(val('competitors')).length > 3) fail('competitors', 'Up to 3, please.');
        else if (lines(val('competitors')).some(function (x) { return !URLISH.test(x); })) fail('competitors', 'Use web addresses, 1 per line.');
      }
      if (n === 3) {
        ['business', 'industry', 'what'].forEach(function (k) { mark(k, ''); if (!val(k)) fail(k, 'This is needed.'); });
        var dc = checked('domain_choice')[0] || '', dm = $('[data-domain-msg]', form);
        mark('domain_name', ''); dm.textContent = '';
        if (!dc) { dm.textContent = 'Choose 1, so we know which address your website uses.'; ok = false; }
        else if (dc === 'have' && !DOMAIN.test(domName())) fail('domain_name', 'Enter your domain, such as yourbusiness.com.');
        else if (dc === 'need' && domName() && !WISH.test(domName())) fail('domain_name', 'Letters, numbers and hyphens only, such as yourbusiness.com.');
      }
      if (n === 4) {
        mark('name', ''); mark('email', ''); mark('whatsapp', '');
        if (!val('name')) fail('name', 'This is needed.');
        if (!EMAIL.test(val('email'))) fail('email', 'Enter an email address we can reach you on.');
        if (val('whatsapp').replace(/\D/g, '').length < 8) fail('whatsapp', val('whatsapp') ? 'Enter the full number.' : 'A phone or WhatsApp number, so we can reach you.');
      }
      msg.textContent = ok ? '' : 'Please check the marked fields.';
      return ok;
    };
    var review = function () {
      var b = collect(), p = planOf(b.plan), rows = [];
      var add = function (k, v) { if (v) rows.push([k, v]); };
      add('Package', p ? p.name : '');
      add('Business', b.business.name);
      add('What you do', b.business.what);
      add('Industry', b.business.industry);
      add('Site includes', b.include.join(', '));
      add('Feel', b.style.join(', '));
      add('Colours', b.colours);
      add('References', b.references.builds.map(function (id) { return known[id]; }).concat(b.references.links).join(', '));
      add('Competitors', b.references.competitors.join(', '));
      add('Domain', b.domain.choice === 'have' ? 'Connect ' + b.domain.name + '. No extra cost' : b.domain.choice === 'need' ? 'Register ' + (b.domain.name || 'a new domain') + ' in my name, ' + cash(domainFee()) + ' once' : 'Decide later. Start on a Brand Method address');
      add('Notes', b.notes);
      add('Send to', b.contact.name + ', ' + b.contact.email);
      var dl = d.createElement('dl');
      rows.forEach(function (r) { var div = d.createElement('div'), dt = d.createElement('dt'), dd = d.createElement('dd'); dt.textContent = r[0]; dd.textContent = r[1]; div.appendChild(dt); div.appendChild(dd); dl.appendChild(div); });
      var box = $('[data-review]', form); box.textContent = ''; box.appendChild(dl);
    };
    var show = function (n, focus) {
      step = n;
      panes.forEach(function (p) { p.hidden = p.getAttribute('data-pane') !== String(n); });
      $$('.bml-prog i', form).forEach(function (el, i) { el.classList.toggle('on', n === 'done' || i < n); el.classList.toggle('now', i === n - 1); });
      var names = String(($('.bml-prog', form) || form).getAttribute('data-step-names') || '').split('|');
      $('[data-step-label]', form).textContent = n === 'done' ? 'Sent' : 'Step ' + n + ' of ' + LAST + (names[n - 1] ? ': ' + names[n - 1] : '');
      nav.hidden = n === 'done';
      // once the brief is sent, the order card has done its job
      var sumCard = $('.bml-sum', side); if (sumCard) sumCard.hidden = n === 'done';
      back.hidden = n === 1 || n === 'done';
      next.hidden = n === LAST || n === 'done';
      msg.textContent = '';
      if (n === LAST) review();
      paintOrder();
      if (focus) { var h = $('[data-pane="' + n + '"] h2', form); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); form.scrollIntoView({ block: 'start', behavior: 'smooth' }); } }
    };
    next.addEventListener('click', function () { keep(); if (check(step)) show(step + 1, true); });
    back.addEventListener('click', function () { keep(); show(step - 1, true); });
    form.addEventListener('change', function (e) {
      var t = e.target;
      // never more than the allowed number of references or feel words
      if (t.name === 'ref' && checked('ref').length > MAX) { t.checked = false; msg.textContent = 'Up to ' + MAX + ' references. Untick 1 to add another.'; }
      // a new domain answer starts clean: the last answer's message no longer applies
      if (t.name === 'domain_choice') { mark('domain_name', ''); $('[data-domain-msg]', form).textContent = ''; }
      if (t.name === 'style' && checked('style').length > 3) { t.checked = false; $('[data-style-msg]', form).textContent = 'Up to 3 words.'; } else if (t.name === 'style') { $('[data-style-msg]', form).textContent = ''; }
      keep(); paintOrder();
    });
    form.addEventListener('input', function (e) { if (e.target.name === 'domain_name') mark('domain_name', ''); keep(); });
    form.addEventListener('submit', function (e) { e.preventDefault(); });

    var ready = function () {
      for (var n = 1; n <= 4; n++) { if (!check(n)) { show(n, true); check(n); return false; } }
      return true;
    };
    // There is no route without a payment (owner, 16 Nov: "there is no free plan in the process", "they have to pay").
    pay.addEventListener('click', function () {
      keep();
      if (!ready()) return;
      var b = collect(), p = planOf(b.plan);
      out.classList.add('is-bad');
      if (!form.elements.terms.checked) { out.textContent = 'Please confirm you have read the package terms.'; form.elements.terms.focus(); return; }
      if (!CHECKOUT || !APP) {
        // Card checkout is not open yet (16 Nov 2026): the brief goes to the team, who confirm the package and take payment.
        out.classList.remove('is-bad'); out.textContent = 'Sending your brief.'; pay.disabled = true;
        fetch('/api/launch-brief', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan: b.plan, currency: CUR, brief: b, terms: true, marketing: !!form.elements.marketing.checked, utm: store('sessionStorage', 'bml.utm') }) })
          .then(function (r) { return r.json().then(function (j) { return { status: r.status, body: j }; }); })
          .then(function (res) {
            if (res.status === 200 && res.body.ok) {
              out.textContent = 'Thank you, your brief is with our team. Card payment is not open yet, so we will contact you by WhatsApp or email to confirm your package and payment. Nothing was charged.';
              return;
            }
            pay.disabled = false; out.classList.add('is-bad');
            out.textContent = res.status === 422 ? 'Please check your name, email and WhatsApp number, then send again.' : (res.body.error || 'That did not send. Please try again.');
          })
          .catch(function () { pay.disabled = false; out.classList.add('is-bad'); out.textContent = 'That did not send. Please try again, or email hello@brandmethod.co.'; });
        return;
      }
      // Hand over to the app with a plain form post. The server sets the price: this sends ids, consents and the brief.
      var f = d.createElement('form'), tags = store('sessionStorage', 'bml.utm'), fields = { plan: b.plan, currency: CUR, terms: 'on', brief: JSON.stringify(b) };
      if (form.elements.marketing.checked) fields.marketing = 'on';
      Object.keys(tags).forEach(function (k) { fields[k] = tags[k]; });
      f.method = 'post'; f.action = APP + '/checkout/start'; f.style.display = 'none';
      Object.keys(fields).forEach(function (k) { var i = d.createElement('input'); i.type = 'hidden'; i.name = k; i.value = fields[k]; f.appendChild(i); });
      d.body.appendChild(f);
      out.classList.remove('is-bad'); out.textContent = 'Opening the secure payment page.'; pay.disabled = true;
      f.submit();
    });

    d.addEventListener('bml:cur', function () { paintOrder(); if (step === LAST) review(); });
    show(1);
    var why = params.get('error');
    if (why) { show(saved.plan ? LAST : 1); out.classList.add('is-bad'); out.textContent = WHY[why] || WHY.bad_request; }
  }

  // after checkout: the result comes from the app's own records, never from this page having loaded
  var ret = $('[data-return]');
  if (ret) {
    var sid = params.get('session_id') || '';
    var showState = function (name) { $$('[data-state]', ret).forEach(function (el) { el.hidden = el.getAttribute('data-state') !== name; }); };
    if (APP && /^cs_[A-Za-z0-9_-]{8,200}$/.test(sid)) {
      var tries = 0;
      var ask = function () {
        tries++;
        fetch(APP + '/api/checkout/status?session_id=' + encodeURIComponent(sid))
          .then(function (r) { return r.json(); })
          .then(function (j) {
            if (j.state === 'paid') {
              $$('[data-sign-in]', ret).forEach(function (a) { a.href = j.sign_in || APP + '/login'; });
              $$('[data-outbox]', ret).forEach(function (a) { if (j.outbox) { a.href = j.outbox; a.closest('[data-outbox-note]').hidden = false; } });
              store('localStorage', BRIEF, {}); store('sessionStorage', CONTACT, {});
              return showState('paid');
            }
            if (j.state === 'failed') return showState('failed');
            if (j.state === 'unknown') return showState('none');
            if (tries < 40) return setTimeout(ask, 1500);
            showState('slow');
          })
          .catch(function () { if (tries < 40) setTimeout(ask, 2500); else showState('slow'); });
      };
      showState('checking'); ask();
    } else { showState('none'); }
  }

  // Premium enquiry: 4 short steps, a live recommendation, 1 post at the end
  var lead = d.getElementById('bml-lead');
  if (lead) {
    var note = $('.bml-form-msg', lead), busy = false, lstep = 1, LLAST = 5;
    var lpanes = $$('[data-lpane]', lead), lsteps = $$('[data-lstep]', lead);
    var lback = $('[data-lback]', lead), lnext = $('[data-lnext]', lead), lsend = $('[data-lsend]', lead);
    var rec = $('.bml-rec');
    var picked = function (name) { var el = $('input[name="' + name + '"]:checked', lead); return el ? el.value : ''; };
    var WORDS = { required: 'This is needed.', 'not an email address': 'Enter a work email address.', 'too long': 'Please shorten this.', 'too short': 'Enter the full number.', 'not a web address': 'Enter a web address such as example.com.', 'unknown value': 'Choose an option.', 'markup is not allowed': 'Plain text only, please.' };
    var STEP_OF = { project_type: 1, needs: 2, goals: 2, objective: 2, notes: 2, budget: 3, timing: 3, meeting_date: 4, meeting_time: 4, meeting_mode: 4, name: 5, email: 5, company: 5, whatsapp: 5, website: 5, consent_contact: 5 };
    var fieldError = function (name, text) {
      var slot = $('[data-lerr="' + name + '"]', lead);
      var el = lead.elements[name];
      if (el && el.setAttribute && !el.length) {
        el.setAttribute('aria-invalid', text ? 'true' : 'false');
        if (!slot && el.closest) slot = $('em', el.closest('.bml-field') || el.closest('.bml-check') || lead);
      }
      if (slot) slot.textContent = text || '';
    };
    var checked = function (name) { return $$('input[name="' + name + '"]:checked', lead).map(function (el) { return el.value; }); };
    var objective = function () {
      var needs = checked('need'), goals = checked('goal'), notes = lead.elements.notes.value.trim();
      return [needs.length ? 'Needs: ' + needs.join(', ') + '.' : '', goals.length ? 'Goals: ' + goals.join(', ') + '.' : '', notes].filter(Boolean).join(' ').slice(0, 1200);
    };
    // the meeting step: the next working days as choices, from tomorrow, in the visitor's own calendar
    var WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var two = function (x) { return ('0' + x).slice(-2); };
    var dayLabel = function (iso) { var x = new Date(iso + 'T12:00:00'); return WD[x.getDay()] + ' ' + x.getDate() + ' ' + MO[x.getMonth()]; };
    var clock12 = function (t) { var h = +t.split(':')[0], m = t.split(':')[1]; return (((h + 11) % 12) + 1) + ':' + m + ' ' + (h < 12 ? 'am' : 'pm'); };
    var daysBox = $('[data-meet-days]', lead);
    if (daysBox) {
      var left = +daysBox.getAttribute('data-count') || 10, day = new Date();
      while (left > 0) {
        day.setDate(day.getDate() + 1);
        if (day.getDay() === 0 || day.getDay() === 6) continue;
        var iso = day.getFullYear() + '-' + two(day.getMonth() + 1) + '-' + two(day.getDate());
        var lab = d.createElement('label'), inp = d.createElement('input'), sp = d.createElement('span');
        lab.className = 'bml-chip'; inp.type = 'radio'; inp.name = 'meeting_date'; inp.value = iso;
        sp.innerHTML = '<b>' + WD[day.getDay()] + '</b> ' + day.getDate() + ' ' + MO[day.getMonth()];
        lab.appendChild(inp); lab.appendChild(sp); daysBox.appendChild(lab);
        left--;
      }
    }
    // what fits the answers so far
    var recFor = function (t, b) {
      if (!t) return 'start';
      if (t === 'unsure' || b === 'need_guidance') return 'discovery';
      if (t === 'mobile_app') return 'custom';
      if (t === 'portal' || t === 'ecommerce') return b === '60k_plus' ? 'custom' : 'corporate_premium';
      if (b === 'below_6k') return 'standard';
      if (b === '10_20k') return 'growth_premium';
      if (b === '20_60k') return 'corporate_premium';
      if (b === '60k_plus') return 'custom';
      return 'business_premium';
    };
    var paintRec = function () {
      if (!rec) return;
      var t = picked('project_type'), b = picked('budget'), key = recFor(t, b);
      $$('[data-rec]', rec).forEach(function (el) { el.hidden = el.getAttribute('data-rec') !== key; });
      var label = function (name) { var el = $('input[name="' + name + '"]:checked', lead); if (!el) return ''; var l = el.closest('label'), b = $('b', l); return (b || l).innerText.trim().replace(/\s+/g, ' '); };
      // on a phone the card sits under the form, so 1 line inside the form says what fits
      var mini = $('[data-rec-mini]', lead), card = $('[data-rec="' + key + '"]', rec);
      if (mini) { mini.hidden = key === 'start' || !card; if (card) mini.textContent = 'Recommended: ' + $('h3', card).textContent + (($('.bml-recc-price', card) || {}).innerText ? ', ' + $('.bml-recc-price', card).innerText.replace(/\s+/g, ' ').trim() : ''); }
      var why = $('[data-rec-why]', rec);
      if (why) why.textContent = t ? 'Based on: ' + [label('project_type'), b ? label('budget') : ''].filter(Boolean).join(', ') + '.' : '';
    };
    var lcheck = function (n) {
      var ok = true, need = function (name, test, text) { if (!test) { fieldError(name, text || WORDS.required); ok = false; } else fieldError(name, ''); };
      if (n === 1) need('project_type', picked('project_type'), 'Choose what you are building.');
      if (n === 2) {
        need('needs', checked('need').length, 'Pick at least 1, or Not sure yet.');
        need('goals', checked('goal').length, 'Pick at least 1 goal.');
        need('objective', lead.elements.notes.value.trim().length >= 12, 'Tell us a little about the project: a line or two.');
      }
      if (n === 3) { need('budget', picked('budget'), 'Choose a budget, or Help me decide.'); need('timing', picked('timing'), 'Choose when you want to start.'); }
      if (n === 4) {
        need('meeting_date', picked('meeting_date'), 'Choose a day.');
        need('meeting_time', picked('meeting_time'), 'Choose a time.');
        need('meeting_mode', picked('meeting_mode'), 'Choose how we meet.');
      }

      if (n === 5) {
        need('name', lead.elements.name.value.trim());
        var em = lead.elements.email.value.trim();
        need('email', /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(em), em ? WORDS['not an email address'] : WORDS.required);
        need('company', lead.elements.company.value.trim());
        var wa = lead.elements.whatsapp.value.trim();
        need('whatsapp', wa.replace(/\D/g, '').length >= 8, wa ? WORDS['too short'] : 'A phone or WhatsApp number, so we can reach you.');
        var site = lead.elements.website.value.trim();
        need('website', !site || /^(https?:\/\/)?[a-z0-9.\-]+\.[a-z]{2,}(\/\S*)?$/i.test(site), WORDS['not a web address']);
        need('consent_contact', lead.elements.consent_contact.checked, 'Please tick this so we may reply.');
      }
      note.classList.toggle('is-bad', !ok);
      note.textContent = ok ? '' : 'Please check the marked fields.';
      return ok;
    };
    var lshow = function (n, focus) {
      lstep = n;
      lpanes.forEach(function (p) { p.hidden = p.getAttribute('data-lpane') !== String(n); });
      $$('[data-guide]', lead).forEach(function (g) { g.hidden = g.getAttribute('data-guide') !== String(n); });
      lsteps.forEach(function (li, i) { li.classList.toggle('now', i === n - 1); li.classList.toggle('done', i < n - 1); });
      lback.hidden = n === 1; lnext.hidden = n === LLAST; lsend.hidden = n !== LLAST;
      if (focus) { var h = $('[data-lpane="' + n + '"] h3', lead); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } var top = lead.getBoundingClientRect().top; if (top < 0 || top > w.innerHeight * .4) lead.scrollIntoView({ block: 'start', behavior: 'smooth' }); }
    };
    lead.addEventListener('change', function (e) {
      paintRec();
      // a single choice on step 1 moves on by itself
      if (e.target.name === 'project_type' && lstep === 1) setTimeout(function () { if (lcheck(1)) lshow(2, true); }, 260);
    });
    lnext.addEventListener('click', function () { if (lcheck(lstep)) lshow(lstep + 1, true); });
    lback.addEventListener('click', function () { note.textContent = ''; lshow(lstep - 1, true); });
    lsteps.forEach(function (li, i) { li.addEventListener('click', function () { if (i < lstep - 1) lshow(i + 1, true); }); });
    // a package button opens this page with its kind of project already chosen (?type=)
    var want = (w.location.search.match(/[?&]type=([a-z_]+)/) || [])[1];
    var pre = want && $('input[name="project_type"][value="' + want + '"]', lead);
    if (pre) { pre.checked = true; lshow(2); }
    lead.addEventListener('submit', function (e) {
      e.preventDefault();
      if (busy) return;
      lead.elements.objective.value = objective();
      for (var n = 1; n <= LLAST; n++) { if (!lcheck(n)) { lshow(n, true); return; } }
      var data = { utm: store('sessionStorage', 'bml.utm') };
      ['name', 'email', 'company', 'whatsapp', 'website', 'objective', 'company_website'].forEach(function (k) { data[k] = lead.elements[k].value.trim(); });
      ['project_type', 'budget', 'timing', 'meeting_date', 'meeting_time', 'meeting_mode'].forEach(function (k) { data[k] = picked(k); });
      data.needs = checked('need');
      data.consent_contact = lead.elements.consent_contact.checked;
      data.consent_marketing = lead.elements.consent_marketing.checked;
      busy = true; lsend.disabled = true; note.classList.remove('is-bad'); note.textContent = 'Sending your brief.';
      fetch(lead.getAttribute('data-endpoint'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { return r.json().then(function (j) { return { status: r.status, body: j }; }); })
        .then(function (res) {
          busy = false; lsend.disabled = false;
          if (res.status === 200 && res.body.ok) {
            store('sessionStorage', 'bml.lead', { route: res.body.route, meeting: { date: data.meeting_date, time: data.meeting_time, mode: data.meeting_mode, when: dayLabel(data.meeting_date) + ', ' + clock12(data.meeting_time) } });
            w.location.href = lead.getAttribute('data-next');
            return;
          }
          note.classList.add('is-bad');
          if (res.status === 422 && res.body.errors) {
            var first = LLAST;
            Object.keys(res.body.errors).forEach(function (k) { fieldError(k, WORDS[res.body.errors[k]] || 'Please check this.'); first = Math.min(first, STEP_OF[k] || LLAST); });
            lshow(first, true);
            note.textContent = 'Please check the marked fields.';
          } else { note.textContent = res.body.error || 'That did not send. Please try again.'; }
        })
        .catch(function () {
          busy = false; lsend.disabled = false; note.classList.add('is-bad');
          note.textContent = 'That did not send. Please try again, or email ' + (lead.getAttribute('data-email') || 'us') + '.';
        });
    });
    paintRec();
  }
  var thanks = $('[data-thanks]');
  if (thanks) {
    var route = store('sessionStorage', 'bml.lead').route || 'website_sales';
    $$('[data-route]', thanks).forEach(function (el) { el.hidden = el.getAttribute('data-route').split(' ').indexOf(route) < 0; });
    // the preferred meeting time, and a calendar file for it: the times are Malaysia time (UTC+8), marked tentative
    var meet = store('sessionStorage', 'bml.lead').meeting, mbox = $('[data-meeting]', thanks);
    if (mbox && meet && /^\d{4}-\d{2}-\d{2}$/.test(meet.date || '') && /^\d{2}:\d{2}$/.test(meet.time || '')) {
      $('[data-meeting-when]', mbox).textContent = meet.when;
      var start = new Date(meet.date + 'T' + meet.time + ':00+08:00'), end = new Date(start.getTime() + 30 * 60000);
      var z = function (x) { return x.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z'); };
      var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Brand Method//Enquiry//EN', 'BEGIN:VEVENT', 'UID:' + z(start) + '-enquiry@brandmethod.co', 'DTSTAMP:' + z(new Date()), 'DTSTART:' + z(start), 'DTEND:' + z(end), 'SUMMARY:Brand Method call (to be confirmed)', 'DESCRIPTION:Your preferred time. Brand Method will contact you to confirm it.', 'STATUS:TENTATIVE', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
      $('[data-meeting-ics]', mbox).setAttribute('href', 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics));
      mbox.hidden = false;
    }
  }

  // Premium hero film: loaded as 1 file in memory, so it loops on any static host. Skipped for small screens and data savers.
  var film = $('[data-film]');
  var saver = w.navigator.connection && w.navigator.connection.saveData;
  if (film && w.fetch && !saver && !(w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
    fetch(film.getAttribute('data-film')).then(function (r) { return r.ok ? r.blob() : null; }).then(function (blob) {
      if (!blob) return;
      film.src = URL.createObjectURL(blob);
      var p = film.play(); if (p && p.catch) p.catch(function () {});
    }).catch(function () {});
  }

  // promise cards: hover turns them on a desktop, a tap or the keyboard turns them everywhere
  d.addEventListener('click', function (e) {
    var card = e.target.closest('[data-gcard]');
    if (card) card.classList.toggle('is-flip');
  });

  // 3D website shop (6 people): about 7 MB, so it loads only on a wide screen, with motion allowed, as the band comes near.
  // If anything fails the drawing simply stays.
  var stage = $('[data-stage3d]');
  var calm = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lean = w.navigator.connection && w.navigator.connection.saveData;
  if (stage && SELF && !calm && !lean && w.innerWidth >= 900 && 'IntersectionObserver' in w) {
    var near = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      near.disconnect();
      try {
        import(new URL('stage3d.js', SELF).href).then(function (mod) { return mod.mount(stage, { onFail: function () {} }); }).catch(function () {});
      } catch (e) {}
    }, { rootMargin: '500px 0px' });
    near.observe(stage);
  }

  // The footer, as on brandmethod.co: a quiet node network behind the columns and a slowly turning star on the wordmark.
  // Both draw only while the footer is on screen. Under reduced motion each draws 1 frame and holds it.
  var foot = $('[data-foot]');
  if (foot && 'IntersectionObserver' in w) {
    var calmF = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var fx = $('.bml-foot-fx', foot), fctx = fx && fx.getContext && fx.getContext('2d');
    var sc = $('[data-foot-star] canvas', foot), sctx = sc && sc.getContext && sc.getContext('2d');
    var FW = 0, FH = 0, nodes = [], mouse = { x: -9999, y: -9999, on: false }, fraf = null, flast = null;
    var LINK = 128, MLINK = 200, TAU = Math.PI * 2;
    var fsize = function () {
      var dpr = Math.min(2, w.devicePixelRatio || 1);
      FW = foot.clientWidth; FH = foot.clientHeight;
      if (fctx) {
        fx.width = Math.round(FW * dpr); fx.height = Math.round(FH * dpr); fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        nodes = [];
        var count = Math.round(Math.min(66, Math.max(30, FW * FH / 24000)));
        for (var i = 0; i < count; i++) nodes.push({ x: Math.random() * FW, y: Math.random() * FH, vx: (Math.random() - .5) * .22, vy: (Math.random() - .5) * .22 });
      }
      if (sctx) { var r = sc.getBoundingClientRect(); if (r.width > 2) { sc.width = Math.round(r.width * dpr); sc.height = Math.round(r.height * dpr); } }
    };
    var net = function (move) {
      var i, a, b, n, dx, dy, dist;
      fctx.clearRect(0, 0, FW, FH);
      for (i = 0; i < nodes.length; i++) {
        n = nodes[i];
        if (move) { n.x += n.vx; n.y += n.vy; }
        if (n.x < 0) { n.x = 0; n.vx *= -1; } if (n.x > FW) { n.x = FW; n.vx *= -1; } if (n.y < 0) { n.y = 0; n.vy *= -1; } if (n.y > FH) { n.y = FH; n.vy *= -1; }
        if (mouse.on) { dx = n.x - mouse.x; dy = n.y - mouse.y; dist = Math.sqrt(dx * dx + dy * dy) || 1; if (dist < 150) { n.x += dx / dist * (150 - dist) / 150 * .9; n.y += dy / dist * (150 - dist) / 150 * .9; } }
      }
      fctx.lineWidth = 1;
      for (a = 0; a < nodes.length; a++) {
        for (b = a + 1; b < nodes.length; b++) {
          dx = nodes[a].x - nodes[b].x; dy = nodes[a].y - nodes[b].y; dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK) { fctx.strokeStyle = 'rgba(255,255,255,' + (.15 * (1 - dist / LINK)).toFixed(3) + ')'; fctx.beginPath(); fctx.moveTo(nodes[a].x, nodes[a].y); fctx.lineTo(nodes[b].x, nodes[b].y); fctx.stroke(); }
        }
        if (mouse.on) {
          dx = nodes[a].x - mouse.x; dy = nodes[a].y - mouse.y; dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MLINK) { fctx.strokeStyle = 'rgba(255,255,255,' + (.32 * (1 - dist / MLINK)).toFixed(3) + ')'; fctx.beginPath(); fctx.moveTo(nodes[a].x, nodes[a].y); fctx.lineTo(mouse.x, mouse.y); fctx.stroke(); }
        }
      }
      fctx.fillStyle = 'rgba(255,255,255,.5)';
      for (i = 0; i < nodes.length; i++) { fctx.beginPath(); fctx.arc(nodes[i].x, nodes[i].y, 1.4, 0, TAU); fctx.fill(); }
      if (mouse.on) { fctx.fillStyle = 'rgba(255,255,255,.92)'; fctx.beginPath(); fctx.arc(mouse.x, mouse.y, 2.6, 0, TAU); fctx.fill(); }
    };
    // the star: the main site's 24 point extruded star with the same tilt, lens and 46 second turn, drawn on a 2D canvas
    var PTS = [], k;
    for (k = 0; k < 24; k++) PTS.push([Math.sin(k * Math.PI / 12) * (k % 2 ? .5 : 1) * .64, Math.cos(k * Math.PI / 12) * (k % 2 ? .5 : 1) * .64]);
    var QX = .941393, QY = .043777, QZ = .067454, QW = .327587, HALF = .0064;
    var norm = function (v) { var l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]); return [v[0] / l, v[1] / l, v[2] / l]; };
    var cross = function (a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; };
    var EYE = [0, -.05 - Math.sin(Math.PI / 60) * 1.95, Math.cos(Math.PI / 60) * 1.95];
    var FWD = norm([0 - EYE[0], -.05 - EYE[1], 0 - EYE[2]]), RGT = norm(cross(FWD, [.13917, .99027, 0])), UPV = cross(RGT, FWD), LENS = 1 / Math.tan(22 * Math.PI / 180);
    var proj = function (x, y, z, S, ox, oy) {
      // tilt by the quaternion, then look through the lens
      var tx = 2 * (QY * z - QZ * y), ty = 2 * (QZ * x - QX * z), tz = 2 * (QX * y - QY * x);
      var px = x + QW * tx + (QY * tz - QZ * ty), py = y + QW * ty + (QZ * tx - QX * tz), pz = z + QW * tz + (QX * ty - QY * tx);
      px -= EYE[0]; py -= EYE[1]; pz -= EYE[2];
      var cx = px * RGT[0] + py * RGT[1] + pz * RGT[2], cy = px * UPV[0] + py * UPV[1] + pz * UPV[2], cz = px * FWD[0] + py * FWD[1] + pz * FWD[2];
      return [ox + (cx / cz * LENS * .5 + .5) * S, oy + (.5 - cy / cz * LENS * .5) * S, cz];
    };
    var poly = function (pts) { sctx.beginPath(); for (var i = 0; i < pts.length; i++) { if (i) sctx.lineTo(pts[i][0], pts[i][1]); else sctx.moveTo(pts[i][0], pts[i][1]); } sctx.closePath(); sctx.fill(); sctx.stroke(); };
    var star = function (turn) {
      var Wd = sc.width, Hd = sc.height, S = Math.min(Wd, Hd), ox = (Wd - S) / 2, oy = (Hd - S) / 2, c = Math.cos(turn), sn = Math.sin(turn), top = [], bot = [], i, x, y, dt = 0, db = 0;
      sctx.clearRect(0, 0, Wd, Hd);
      for (i = 0; i < 24; i++) {
        x = PTS[i][0] * c - PTS[i][1] * sn; y = PTS[i][0] * sn + PTS[i][1] * c;
        top.push(proj(x, y, HALF, S, ox, oy)); bot.push(proj(x, y, -HALF, S, ox, oy));
        dt += top[i][2]; db += bot[i][2];
      }
      var near = dt < db ? top : bot, far = dt < db ? bot : top;
      sctx.lineWidth = 1; sctx.lineJoin = 'round';
      sctx.fillStyle = sctx.strokeStyle = '#dadada';
      poly(far);
      for (i = 0; i < 24; i++) poly([near[i], near[(i + 1) % 24], far[(i + 1) % 24], far[i]]);
      sctx.fillStyle = sctx.strokeStyle = '#fff';
      poly(near);
    };
    var phase = .279, hold = 1, hov = 0, sp = 0, sv = 0;
    var frame = function (t) {
      if (flast === null) flast = t;
      var dt = Math.min(64, t - flast), ds = dt / 1000; flast = t;
      if (fctx) net(true);
      if (sctx && sc.width > 2) {
        hold += ((hov ? 0 : 1) - hold) * .045;     // it stops under the pointer and drifts back when the pointer leaves
        sv += (-26 * sp - 5.2 * sv) * ds; sp += sv * ds;
        phase += dt * TAU / 46000 * hold;
        star(phase + sp);
      }
      fraf = w.requestAnimationFrame(frame);
    };
    var once = function () { fsize(); if (fctx) net(false); if (sctx && sc.width > 2) star(phase); };
    once();
    var word = $('.bml-foot-word', foot); if (word) word.addEventListener('load', once);
    var ft; w.addEventListener('resize', function () { clearTimeout(ft); ft = setTimeout(once, 150); }, { passive: true });
    if (!calmF) {
      foot.addEventListener('mousemove', function (e) { var r = foot.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.on = true; });
      foot.addEventListener('mouseleave', function () { mouse.on = false; });
      var se = $('[data-foot-star]', foot);
      if (se) { se.addEventListener('pointerenter', function () { hov = 1; sv += .55; }); se.addEventListener('pointerleave', function () { hov = 0; sv += .34; }); }
      new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { if (!fraf) { if (!sc || sc.width < 3) fsize(); flast = null; fraf = w.requestAnimationFrame(frame); } }
        else if (fraf) { w.cancelAnimationFrame(fraf); fraf = null; }
      }, { rootMargin: '120px 0px' }).observe(foot);
    }
  }

  // references, the second choice: a website the buyer has in mind. Kept with the brief, so the brief page opens with it filled in.
  var linkBox = d.querySelector('[data-tray-links]');
  if (linkBox) {
    var linkMsg = linkBox.querySelector('[data-tray-linkmsg]'), linkRest = linkMsg.textContent;
    var linkOk = /^(https?:\/\/)?[a-z0-9][a-z0-9.-]*\.[a-z]{2,}(\/\S*)?$/i;
    [].forEach.call(linkBox.querySelectorAll('[data-tray-link]'), function (inp) {
      var key = inp.getAttribute('data-tray-link');
      if (brief()[key]) inp.value = brief()[key];
      var keep = function () {
        var v = inp.value.trim(), patch = {}, bad = v && !linkOk.test(v);
        patch[key] = bad ? '' : v;
        brief(patch);
        inp.setAttribute('aria-invalid', bad ? 'true' : 'false');
        var saved = [].filter.call(linkBox.querySelectorAll('[data-tray-link]'), function (i) { return i.value.trim() && linkOk.test(i.value.trim()); }).length;
        linkMsg.textContent = bad ? 'Enter a web address such as example.com.' : saved ? saved + (saved === 1 ? ' link' : ' links') + ' added to your brief.' : linkRest;
      };
      inp.addEventListener('input', keep);
      inp.addEventListener('change', keep);
      if (inp.value) keep();
    });
  }

  // the banner promise types itself through a short list (Sales page 2). Reduced motion keeps the first line.
  var typedEl = d.querySelector('[data-typed]');
  if (typedEl && !(w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
    var typedList = []; try { typedList = JSON.parse(typedEl.getAttribute('data-typed')) || []; } catch (e) {}
    if (typedList.length > 1) {
      var typedAt = 0, typedText = typedList[0];
      typedEl.classList.add('bml-typed');
      var typedStep = function (target, done) {
        if (typedText === target) return done();
        typedText = target.indexOf(typedText) === 0 ? target.slice(0, typedText.length + 1) : typedText.slice(0, -1);
        typedEl.textContent = typedText || '\u00a0';
        w.setTimeout(function () { typedStep(target, done); }, target.indexOf(typedText) === 0 && typedText.length ? 46 : 24);
      };
      var typedNext = function () {
        w.setTimeout(function () {
          if (d.hidden) return typedNext();
          typedAt = (typedAt + 1) % typedList.length;
          // back to the shared start ("to "), then on to the next promise
          typedStep(typedList[typedAt], typedNext);
        }, 2800);
      };
      typedNext();
    }
  }

  // early bird slots: the number left comes from the app, counted from paid orders. No answer, no number: the line then states the pool only.
  var slotEl = d.querySelector('[data-slots]');
  if (slotEl && w.fetch) {
    var slotBase = APP || String(slotEl.getAttribute('data-app') || '').replace(/\/$/, '');
    var slotN = slotEl.querySelector('[data-slots-n]'), slotT = slotEl.querySelector('[data-slots-t]');
    var slotTotal = Number(slotEl.getAttribute('data-total')) || 0, slotLeft = null, slotShown = null, slotSeen = !('IntersectionObserver' in w);
    var slotFmt = function (n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); };
    var slotPaint = function () {
      if (slotLeft === null || !slotSeen || slotLeft === slotShown) return;
      var from = slotShown === null ? slotTotal : slotShown, to = slotLeft;
      slotShown = to;
      slotT.textContent = 'of ' + slotFmt(slotTotal) + ' ' + slotEl.getAttribute('data-label') + ' left';
      slotEl.setAttribute('data-live', '');
      // the squares: 10 of them, each a tenth of the pool, the last one part filled
      var slotSq = slotEl.querySelectorAll('.bml-slotbar i');
      [].forEach.call(slotSq, function (sq, i) { sq.style.setProperty('--f', Math.round(Math.max(0, Math.min(1, to / slotTotal * slotSq.length - i)) * 100) + '%'); });
      if (from === to || (w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches)) { slotN.textContent = slotFmt(to); return; }
      var t0 = null, dur = Math.min(1200, 320 + Math.abs(from - to) * 40);
      var step = function (t) {
        if (slotShown !== to) return;
        if (t0 === null) t0 = t;
        var k = Math.min(1, (t - t0) / dur);
        slotN.textContent = slotFmt(from + (to - from) * (1 - Math.pow(1 - k, 3)));
        if (k < 1) w.requestAnimationFrame(step);
      };
      w.requestAnimationFrame(step);
      w.setTimeout(function () { if (slotShown === to) slotN.textContent = slotFmt(to); }, dur + 300);
    };
    var slotAsk = function () {
      if (!slotBase || d.hidden) return;
      fetch(slotBase + '/api/founding').then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
        if (!j || typeof j.left !== 'number' || j.total !== slotTotal) return;
        // while nearly the whole pool is left, the card states the pool only
        if (j.left / slotTotal > (Number(slotEl.getAttribute('data-show-below')) || 1)) return;
        slotLeft = Math.max(0, Math.min(slotTotal, j.left));
        slotPaint();
      }).catch(function () {});
    };
    if (!slotSeen) new IntersectionObserver(function (en) { if (en[0].isIntersecting) { slotSeen = true; slotPaint(); } }, { threshold: .4 }).observe(slotEl);
    slotAsk();
    w.setInterval(slotAsk, 30000);
    d.addEventListener('visibilitychange', function () { if (!d.hidden) slotAsk(); });
  }

  // drawings move only while they are on screen
  var arts = $$('[data-iso],[data-live]');
  if ('IntersectionObserver' in w) {
    var live = new IntersectionObserver(function (entries) { entries.forEach(function (en) { en.target.classList.toggle('is-live', en.isIntersecting); }); }, { rootMargin: '80px 0px' });
    arts.forEach(function (el) { live.observe(el); });
  } else { arts.forEach(function (el) { el.classList.add('is-live'); }); }

  // entrance motion: nothing is ever left hidden
  var items = $$('.bml-reveal');
  function showAll() { items.forEach(function (el) { el.classList.add('is-in'); }); }
  var still = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in w) || still || d.hidden) { showAll(); return; }
  var fired = false;
  var io = new IntersectionObserver(function (entries) {
    fired = true;
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
  items.forEach(function (el) { io.observe(el); });
  setTimeout(function () { if (!fired) showAll(); }, 3500);
})();

/* FAQ (16 Nov): one answer open at a time. The items share name="bml-faq", which the browser handles itself;
   this closes the others in browsers that do not support that yet. */
(function () {
  var items = document.querySelectorAll('details.bml-fq-it');
  items.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      items.forEach(function (o) { if (o !== d && o.open) o.open = false; });
    });
  });
})();
