"""Build pricing.html from the designer's standalone Services & Pricing file.

    python tools/build-pricing.py "C:/Users/user/Downloads/BrandMethod-Services latest.html"
    python tools/build-pricing.py "C:/Users/user/Downloads/BM-Pricing-and-Services/Pricing-and-Services.html"

From 11 Nov 2026 the export is a folder: the page plus assets/, data/, fonts/ and a logo beside it.
Those are copied into pricing-files/ and the page's paths point there (the walkthrough film and its
thumbnail stay in video/, the other walkthrough films are not published).

The design file is used as-is, except:
  - its loading screen is removed (#bm-preload up to Oct 2026, #bm-topload since);
  - the site head is kept from the current pricing.html: GTM, favicons, title,
    description, canonical, Open Graph / Twitter tags and the JSON-LD schema;
  - the site nav and footer come from js/layout.js (nav in a shadow root, footer
    classes prefixed bmf-), so the design's CSS and the site's CSS cannot clash;
  - the old WhatsApp number is swapped for the current one;
  - the page stays blank until it is parsed, so it never shows half-styled;
  - TWEAKS: Bespoke tier in violet instead of black, and on desktop the content edges
    follow the site nav (logo on the left, Hire Us on the right);
  - speed (26 Nov 2026, see speed()): the 85 card drawings and the breakdown texts move to their own
    files and load when needed, the phase films load as they come near the screen, files carry a
    version tag, the offline-only script goes and the style blocks lose their comments.
"""
import hashlib
import os
import re
import shutil
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'pricing.html')
FILES = 'pricing-files'  # the export's pictures, fonts and phase films, served beside pricing.html
# what the page loads from beside itself (data/videos/bazil/ goes to video/ instead)
EXPORT_PARTS = ['assets', 'fonts', os.path.join('data', 'videos', 'phases'), 'methodas-lockup-horizontal-blue.png']
OLD_PHONE, PHONE = '60122826371', '60162563030'
HEAD_BEGIN, HEAD_END = '<!-- site head (tools/build-pricing.py) -->', '<!-- /site head -->'
# The page is ~4.5 MB with style blocks spread through <body> and the site nav added at the
# very end, so the browser would paint it half-styled while parsing. Keep it blank until the
# document is parsed (no loading screen or animation), with a safety reveal.
HOLD = ('<style id="bm-hold">html.bm-wait body{opacity:0}</style>'
        "<script>(function(){var r=document.documentElement;r.classList.add('bm-wait');"
        "function show(){r.classList.remove('bm-wait')}"
        "document.addEventListener('DOMContentLoaded',show);setTimeout(show,4000);})()</script>")

# Site-side adjustments on top of the design, placed after all of its styles.
TWEAKS = r'''<style id="bm-pricing-tweaks">
/* Bespoke tier: tinted violet header like the other tiers, not the black panel */
html body .svc-block .svc-panels .svc-panel.bespoke:nth-child(n) .panel-pic-top[class*="-pic"],html body .svc-block .svc-panels .svc-panel.bespoke:nth-child(n):hover .panel-pic-top[class*="-pic"]{background:#F1EBFE !important;border-bottom-color:#DDD3FB !important}
html body .jm4-hero.is-besp .jm4-pic{background:#F5F1FF;border-left-color:#E4DBFC;border-bottom-color:#E4DBFC}
/* Desktop: content edges follow the site nav (logo left, Hire Us right); --bm-gl/--bm-gr are measured below */
html.bm-fit body .wrap,html.bm-fit body .cx-section,html.bm-fit body .cx-cta,html.bm-fit body .bmpd-bar-inner{max-width:none !important;margin-left:0 !important;margin-right:0 !important;padding-left:var(--bm-gl) !important;padding-right:var(--bm-gr) !important}
html.bm-fit body .bmph,html.bm-fit body #svcnav{padding-left:var(--bm-gl) !important;padding-right:var(--bm-gr) !important}
html.bm-fit body .bmph-inner,html.bm-fit body .ebs-strip{max-width:none !important;margin-left:0 !important;margin-right:0 !important}
html.bm-fit body .cx-footer{max-width:none !important;margin-left:var(--bm-gl) !important;margin-right:var(--bm-gr) !important}
/* four-card rows: fill the content column like the three-card rows (they only scroll when four 384px cards do not fit) */
@supports (grid-template-rows:subgrid){html.bm-fit body .wrap .svc-block .svc-panels.has-four{grid-auto-columns:minmax(384px,1fr) !important;margin-left:0 !important;margin-right:0 !important;padding-left:0 !important;padding-right:0 !important;scroll-padding-left:0 !important}}
/* Phones and tablets: the six-phase section (Branding Process tab) sits straight in the panel with no side padding,
   so it gets the nav logo's inset (--bm-ml, measured below); each phase drawing sits on the left above its label
   instead of floating off the right edge */
html.bm-fit-m body #bm-cont{padding-left:var(--bm-ml) !important;padding-right:var(--bm-ml) !important}
/* 26 Nov 2026, "follow padding nav menu": the four tabs and the whole Branding Process tab (title, walkthrough, phase board,
   the six phases) start on the nav logo's left edge and end on Hire Us, like Services & Price; on phones and tablets
   both sides take the logo's inset */
html.bm-fit body:not(#x) :is(#bm-tabs .bm-tabs-in,.bj2-wrap.bmpd-panel-wrap,#bm-cont,.bj2-why-panel-inner){padding-left:var(--bm-gl) !important;padding-right:var(--bm-gr) !important}
html.bm-fit-m body:not(#x) :is(#bm-tabs .bm-tabs-in,.bj2-wrap.bmpd-panel-wrap,#bm-cont,.bj2-why-panel-inner,.wrap,#svcnav,.bmph,.cx-section,.cx-cta){padding-left:var(--bm-ml) !important;padding-right:var(--bm-ml) !important}
/* phones and tablets: the card rows still swipe out to both screen edges, with the first card at rest on the logo's edge */
html.bm-fit-m body:not(#x) .wrap .svc-block .svc-panels{margin-left:calc(-1 * var(--bm-ml)) !important;margin-right:calc(-1 * var(--bm-ml)) !important;padding-left:var(--bm-ml) !important;padding-right:var(--bm-ml) !important;scroll-padding-left:var(--bm-ml) !important;scroll-padding-right:var(--bm-ml) !important}
@media (max-width:980px){html body #bm-cont .bmc-ill{float:none !important;display:block;width:96px !important;margin:0 0 12px !important}
  /* the heading and its line stack, both on the same left edge, instead of squeezing side by side */
  html body #bm-cont .bmc-head{flex-direction:column !important;align-items:flex-start !important;justify-content:flex-start !important;gap:10px !important}
  html body #bm-cont .bmc-head p{max-width:none !important}}
/* Services & Price (13 Nov): each tier reads as one card: square corners, a soft shadow, lifting on hover */
html body .svc-block .svc-panels>.svc-panel:not(#x){border:1px solid #DFE3EE !important;border-radius:0 !important;overflow:hidden !important;box-shadow:0 1px 2px rgba(16,24,64,.04),0 10px 28px -14px rgba(16,24,64,.16) !important}
@media (hover:hover){html body .svc-block .svc-panels>.svc-panel:not(#x):hover{transform:translateY(-4px);border-color:#CBD2E6 !important;box-shadow:0 2px 4px rgba(16,24,64,.05),0 22px 44px -18px rgba(16,24,64,.24) !important}}
/* the meta lines (saving, delivery, what you get): one icon column and one text column in every card;
   the delivery line carried an empty ::before that took a flex slot plus a gap, pushing its icon 8px right */
html body .svc-panel .panel-meta:not(#x)>:is(.pmeta-save,.pmeta-delivery,.pmeta-note){display:flex !important;align-items:flex-start !important;gap:8px !important;padding-left:0 !important;margin-left:0 !important;text-indent:0 !important}
html body .svc-panel .panel-meta:not(#x)>* svg.bmi{flex:0 0 14px !important;width:14px !important;height:14px !important;margin:2px 0 0 !important}
html body .svc-panel .panel-meta:not(#x)>.pmeta-delivery::before{display:none !important}
/* Desktop (13 Nov): rows of 4 to 6 tiers stay a slider, but it runs out to both screen edges, so the next card
   slides off the side of the screen instead of being cut at the content line; at rest the first card still starts on
   the content edge (--bm-gl / --bm-gr are the nav's logo and Hire Us insets, measured by bm-pricing-fit) */
html.bm-fit body .wrap .svc-block .svc-panels.has-four:not(#x){margin-left:calc(-1 * var(--bm-gl)) !important;margin-right:calc(-1 * var(--bm-gr)) !important;padding-left:var(--bm-gl) !important;padding-right:var(--bm-gr) !important;scroll-padding-left:var(--bm-gl) !important;scroll-padding-right:var(--bm-gr) !important}
html.bm-fit body .wrap .svc-block .has-four-wrap{overflow:visible !important}
/* Cards (13 Nov): each "What's included" line shows its title only; the description is in View full breakdown */
html body .svc-panel .pci:not(#x) .pci-d{display:none !important}
/* Cards (13 Nov): the drawing moves from the band above the title to the right of the title and tag, so a card fits
   the screen; the Good / Great / Excellent badge stays on the card's top left corner; the title and tag keep clear of the
   drawing, the price and the lines below use the full width; every part is pinned to its row of the shared grid */
html body .svc-block .svc-panels>.svc-panel:not(#x)>.panel-pic-top:not(#x){grid-row:2 !important;grid-column:1 !important;justify-self:end !important;align-self:start !important;width:40% !important;max-width:240px !important;height:150px !important;min-height:0 !important;margin:18px 16px 0 0 !important;padding:0 !important;position:static !important;border:0 !important;background:transparent !important;z-index:1;pointer-events:none;overflow:visible !important;transform:none !important}
html body .svc-block .svc-panels>.svc-panel:not(#x)>.panel-pic-top .hero-ico{position:static !important;display:block !important;width:100% !important;height:100% !important;margin:0 !important;padding:0 !important}
html body .svc-block .svc-panels>.svc-panel:not(#x)>.panel-pic-top .hero-ico svg{width:100% !important;height:100% !important;max-width:none !important;max-height:none !important}
html body .svc-block .svc-panels>.svc-panel:not(#x) .pic-quality-badge{position:absolute !important;top:0 !important;left:0 !important;z-index:2}
html body .svc-block .svc-panels>.svc-panel:not(#x) .panel-left-col{grid-row:2 !important;grid-column:1 !important;padding-top:46px !important}
html body .svc-block .svc-panels>.svc-panel:not(#x) .panel-left-col>.panel-title,html body .svc-block .svc-panels>.svc-panel:not(#x) .panel-left-col>.panel-tag{margin-right:calc(min(40%,240px) + 6px) !important}
html body .svc-block .svc-panels>.svc-panel:not(#x) .panel-right-col{grid-row:3 !important;grid-column:1 !important}
html body .svc-block .svc-panels>.svc-panel:not(#x) .panel-view-footer{grid-row:4 !important;grid-column:1 !important}
/* the US dollar line under the second price format, styled like the first */
.panel-price-soft .panel-usd{flex-basis:100%;order:9;margin-top:4px;font:500 13px/1.3 Inter,system-ui,sans-serif;letter-spacing:0;color:#6B7280;text-decoration:none;display:block}
/* Cards (13 Nov): every title keeps two lines of room (one-line titles too), so the tags and prices start level */
html body .svc-block .svc-panels>.svc-panel:not(#x) .panel-left-col>.panel-title{min-height:2.3em !important}
/* "Custom scope" and other word prices wrap inside the card instead of running out of it */
html body .svc-panel .panel-price-soft .pcnt.pword{white-space:normal !important;overflow-wrap:break-word !important;max-width:100% !important;line-height:1.05 !important}
html body .svc-block .svc-panels>.svc-panel:not(#x)>.panel-pic-top .hero-ico svg{overflow:visible !important}
</style>
<script id="bm-pricing-fit">(function(){
  var r=document.documentElement;
  function fit(){
    var h=document.getElementById('bm-nav-host'), s=h&&h.shadowRoot,
        lg=s&&s.querySelector('.nav-logo'), ct=s&&s.querySelector('.nav-right .nav-cta');
    if(lg&&window.innerWidth<=980){ r.style.setProperty('--bm-ml',Math.round(lg.getBoundingClientRect().left)+'px'); r.classList.add('bm-fit-m'); }
    else r.classList.remove('bm-fit-m');
    if(!lg||!ct||window.innerWidth<=980){ r.classList.remove('bm-fit'); return; }
    /* 25 Nov 2026: rectangles come back in zoomed screen px; the gutters are CSS px that the page zoom scales again, so divide it out */
    var Z=parseFloat(getComputedStyle(r).zoom)||1, a=lg.getBoundingClientRect(), b=ct.getBoundingClientRect(), W=r.getBoundingClientRect().width;
    r.style.setProperty('--bm-gl',Math.round(a.left/Z)+'px');
    r.style.setProperty('--bm-gr',Math.round((W-b.right)/Z)+'px');
    r.classList.add('bm-fit');
  }
  fit(); window.addEventListener('resize',fit); window.addEventListener('load',fit);
})();</script>
<script id="bm-pricing-rows">(function(){
  /* Services & Price: the meta lines start on one line across each row of cards, whatever sits above them
     (a two-line title, a "price on request" line): each block is pushed down to the lowest one in its row */
  function even(){
    document.querySelectorAll('.svc-panels').forEach(function(row){
      var ms=[].slice.call(row.querySelectorAll(':scope > .svc-panel .panel-left-col > .panel-meta'));
      ms.forEach(function(m){ m.style.removeProperty('margin-top'); });
      var vis=ms.filter(function(m){ return m.offsetParent; });
      if(vis.length<2) return;
      var tops=vis.map(function(m){ return m.getBoundingClientRect().top-m.closest('.svc-panel').getBoundingClientRect().top; });
      var max=Math.max.apply(null,tops);
      vis.forEach(function(m,i){ var d=max-tops[i]; if(d>.5) m.style.setProperty('margin-top',(parseFloat(getComputedStyle(m).marginTop)+d)+'px','important'); });
    });
  }
  var t; function soon(){ clearTimeout(t); t=setTimeout(even,120); }
  if(document.readyState!=='loading') even(); else document.addEventListener('DOMContentLoaded',even);
  addEventListener('load',even); addEventListener('resize',soon);
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(soon);
  document.addEventListener('click',function(e){ if(e.target.closest&&e.target.closest('[data-tab],button,a')) soon(); });
})();</script>
<script id="bm-usd-soft">(function(){
  /* US dollars as a guide under the cards whose price uses the second format (.panel-price-soft: "RM1,900/mo + ad spend",
     "from RM5,000/mo"). Same rate and rounding as the page's bm-usd script (RM4.08 = US$1, 6 Oct 2026): change both together.
     Prices with no ringgit figure ("Custom scope", "17% of ad spend") get none. */
  var RATE=4.08;
  function usd(rm){ var u=rm/RATE, st=u<1000?5:(u<10000?10:50); return Math.round(u/st)*st; }
  function run(){
    document.querySelectorAll('.panel-price-soft').forEach(function(p){
      if(p.querySelector('.panel-usd')||!p.querySelector('.pcur')) return;
      var n=p.querySelector('.pcnt'); if(!n) return;
      var rm=+n.textContent.replace(/[^0-9]/g,''); if(!rm) return;
      var u=p.querySelector('.punit'), mo=u&&/^\s*\/mo/.test(u.textContent)?'/mo':'';
      var s=document.createElement('span'); s.className='panel-usd';
      s.textContent='≈ '+(p.querySelector('.pfrom')?'from ':'')+'US$'+usd(rm).toLocaleString('en-US')+mo;
      p.appendChild(s);
    });
  }
  if(document.readyState!=='loading') run(); else document.addEventListener('DOMContentLoaded',run);
  addEventListener('load',run);
})();</script>
<script id="bm-pricing-pics">(function(){
  /* Card drawings: each one is framed to its own outline plus the same margin (6% a side), so a drawing the design
     drew small inside a wide frame comes out as big as the rest; done once per drawing, when it is on screen */
  var PAD=.06;
  function fit(){
    document.querySelectorAll('.svc-panel .panel-pic-top svg').forEach(function(s){
      if(s.getAttribute('data-bm-fit')||!s.getClientRects().length) return;
      var b; try{ b=s.getBBox(); }catch(e){ return; }
      if(!b||b.width<1||b.height<1) return;
      var p=Math.max(b.width,b.height)*PAD;
      s.setAttribute('viewBox',[b.x-p,b.y-p,b.width+2*p,b.height+2*p].map(function(v){return +v.toFixed(2);}).join(' '));
      s.setAttribute('preserveAspectRatio','xMidYMid meet');
      s.setAttribute('data-bm-fit','1');
    });
  }
  var t; function soon(){ clearTimeout(t); t=setTimeout(fit,150); }
  if(document.readyState!=='loading') fit(); else document.addEventListener('DOMContentLoaded',fit);
  addEventListener('load',fit); addEventListener('resize',soon);
  document.addEventListener('click',function(e){ if(e.target.closest&&e.target.closest('[data-tab],button,a')) soon(); });
})();</script>
<script id="bm-pricing-titles">(function(){
  /* Card titles on two lines: a title of two or more words that fits on one line is broken at the most even point
     ("UX Redesign / Sprint", "AI Readiness / Audit"); a "·" stays with the word before it; one-word titles and titles
     that already wrap are left alone. Undone and redone on resize, so the break always matches the card's width. */
  /* 25 Nov 2026: screen rectangles come back multiplied by the page zoom (bm-fit-0211, 2.4 at 4K); computed styles do not, so divide it out */
  function zoomOf(el){ if(el&&typeof el.currentCSSZoom==='number') return el.currentCSSZoom||1; var z=parseFloat(getComputedStyle(document.documentElement).zoom); return (z&&z>0)?z:1; }
  function lines(t){ var lh=parseFloat(getComputedStyle(t).lineHeight)||parseFloat(getComputedStyle(t).fontSize)*1.15;
    return Math.round(t.getBoundingClientRect().height/zoomOf(t)/lh); }
  function split(t){
    if(t.hasAttribute('data-bm-html')){ t.innerHTML=t.getAttribute('data-bm-html'); }
    if(!t.getClientRects().length) return;
    t.setAttribute('data-bm-html',t.innerHTML);
    var prev=t.style.minHeight; t.style.setProperty('min-height','0','important');
    var one=lines(t)<=1; t.style.removeProperty('min-height'); if(prev) t.style.minHeight=prev;
    if(!one) return;
    /* the words live in the longest text node (a hidden number span can sit before them) */
    var w=document.createTreeWalker(t,NodeFilter.SHOW_TEXT,null), n, best=null;
    while((n=w.nextNode())) if(!best||n.nodeValue.trim().length>best.nodeValue.trim().length) best=n;
    if(!best) return;
    var txt=best.nodeValue, words=txt.trim().split(/\s+/);
    var toks=[]; words.forEach(function(x){ if(/^[·\-–—\/&+]$/.test(x)&&toks.length) toks[toks.length-1]+=' '+x; else toks.push(x); });
    if(toks.length<2) return;
    var bestK=1, bestV=1e9;
    for(var k=1;k<toks.length;k++){ var a=toks.slice(0,k).join(' ').length, b=toks.slice(k).join(' ').length, v=Math.max(a,b); if(v<bestV){ bestV=v; bestK=k; } }
    var lead=txt.match(/^\s*/)[0], tail=txt.match(/\s*$/)[0];
    var f=document.createDocumentFragment();
    f.appendChild(document.createTextNode(lead+toks.slice(0,bestK).join(' ')+' '));  /* the space stays, so the text still reads "UX Redesign Sprint" for search */
    f.appendChild(document.createElement('br'));
    f.appendChild(document.createTextNode(toks.slice(bestK).join(' ')+tail));
    best.parentNode.replaceChild(f,best);
  }
  /* the drawing beside the title takes the room the title and tag leave free (between 110 and 300px wide) */
  function room(pn){
    var pic=pn.querySelector(':scope > .panel-pic-top'), L=pn.querySelector('.panel-left-col'), t=L&&L.querySelector(':scope > .panel-title'), g=L&&L.querySelector(':scope > .panel-tag');
    if(!pic||!t||!pic.getClientRects().length) return;
    var cs=getComputedStyle(L), lr=L.getBoundingClientRect(), right=lr.right-parseFloat(cs.paddingRight), left=lr.left+parseFloat(cs.paddingLeft);
    var r=document.createRange(); r.selectNodeContents(t);
    var used=left; [].forEach.call(r.getClientRects(),function(x){ if(x.width) used=Math.max(used,x.right); });
    if(g&&g.getClientRects().length) used=Math.max(used,g.getBoundingClientRect().right);
    var w=Math.max(110,Math.min(300,Math.round((right-used)/zoomOf(L)-14+parseFloat(getComputedStyle(pic).marginRight||0))));
    pic.style.setProperty('width',w+'px','important'); pic.style.setProperty('max-width','none','important');
  }
  function run(){ document.querySelectorAll('.svc-panel .panel-left-col > .panel-title').forEach(split); document.querySelectorAll('.svc-panel').forEach(room); }
  var t; function soon(){ clearTimeout(t); t=setTimeout(run,140); }
  if(document.readyState!=='loading') run(); else document.addEventListener('DOMContentLoaded',run);
  addEventListener('load',run); addEventListener('resize',soon);
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(soon);
  document.addEventListener('click',function(e){ if(e.target.closest&&e.target.closest('[data-tab],button,a')) soon(); });
})();</script>
'''


FB_ACTIONS_OLD = '''      <button type="button" class="fb-send" onclick="sendFeedback('wa')">📱 Send via WhatsApp</button>
      <button type="button" class="fb-send fb-send-alt" onclick="sendFeedback('email')">📧 Send via email</button>
    </div>
    <div class="fb-note">'''
FB_ACTIONS_NEW = '''      <button type="button" class="fb-send" id="fb-send-btn" onclick="sendFeedback('send')">Send feedback</button>
      <button type="button" class="fb-send fb-send-alt" onclick="sendFeedback('wa')">📱 Send via WhatsApp</button>
      <input type="text" id="fb-honey" tabindex="-1" autocomplete="off" aria-hidden="true" style="display:none">
    </div>
    <div class="fb-note" id="fb-note">'''
# from the mailto / WhatsApp branch to the end of sendFeedback
FB_SEND_FROM = "    if(mode === 'email'){"
FB_SEND_TO = '\n  };\n})();'
FB_SEND_NEW = r'''    var card = document.getElementById('fb-card');
    function thanks(msg){
      if(card) card.innerHTML = '<div class="fb-thanks"><div class="fb-th-ic">🙏</div><h3>Thank you, that really helps</h3><p>' + msg + '</p></div>';
    }
    if(mode === 'wa'){
      window.open('https://wa.me/60162563030?text=' + encodeURIComponent(body), '_blank', 'noopener');
      thanks('Your WhatsApp message is ready to send in the window that just opened. If it did not open, reach us at wa.me/60162563030.');
      return;
    }
    if(document.getElementById('fb-honey').value) return thanks('Your feedback is with the BrandMethod team.');  // a bot filled the hidden field
    var btn = document.getElementById('fb-send-btn'), note = document.getElementById('fb-note');
    btn.disabled = true; btn.textContent = 'Sending...';
    fetch('https://formsubmit.co/ajax/bazil@brandmethod.co', {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
      body: JSON.stringify({
        _subject: 'Services page feedback' + (fbRating ? ' (' + fbRating + '/5)' : ''),
        _cc: 'amina@brandmethod.co', _template: 'table', _captcha: 'false',
        'Rating': fbRating ? fbRating + '/5' : 'not given',
        'Stood out / missing': picked.join(', ') || '-',
        'Improve or fix': improve || '-',
        'Would like added': add || '-',
        'Name': name || '-',
        'Company or email': contact || '-',
        'Page': location.href
      })
    }).then(function(r){
      return r.json().then(function(d){ if(!r.ok || String(d.success) !== 'true') throw new Error(d.message || r.status); });
    }).then(function(){
      thanks('Your feedback is with the BrandMethod team.' + (contact ? ' We will get back to you if a reply helps.' : ''));
    }).catch(function(){
      btn.disabled = false; btn.textContent = 'Send feedback';
      note.textContent = 'That did not go through. Please try again, or send it via WhatsApp.';
      note.style.color = '#DC2626';
    });'''


# 25 Nov 2026 (4K and scroll fixes). The design zooms the whole page to the window (bm-fit-0211: laid out at 1600 CSS px,
# 2.4x at 3840) and some of its scripts measure screen rectangles, which come back zoomed. These patch the design's own
# blocks; the build stops if one is no longer there, so a changed export is noticed instead of shipping half fixed.
DESIGN_PATCHES = [
    ('html{zoom:var(--bm-fit,1)}\n',
     'html{zoom:var(--bm-fit,1)}\n'
     '/* 25 Nov 2026: "nav bar big" at 4K, then "nav bar different size" against the other pages. The shared nav (js/layout.js) has its\n'
     '   own big-screen zoom ladder (1.86 at 3840), which multiplied with this page zoom (2.4). The host now gets ladder / page zoom\n'
     '   (--bm-navz, set by bm-fit-0211-js), so on screen the nav is exactly the size it is on every other page. A rule on the host\n'
     '   from outside beats the shadow root\'s :host rules. */\n'
     '@media(min-width:1601px){#bm-nav-host{zoom:var(--bm-navz,1) !important}}\n',
     'the page zoom rule (bm-fit-0211)'),
    ("  function fit(){ var w=window.innerWidth||1600; var z=Math.min(MAX,Math.max(MIN,w/DW)); document.documentElement.style.setProperty('--bm-fit',z.toFixed(3)); }",
     "  /* the shared nav's big-screen ladder (js/layout.js), so the nav here matches the other pages once the page zoom is divided out */\n"
     "  var NAVZ=[[7000,3],[5600,2.5],[4600,2.1],[3800,1.86],[3400,1.7],[3000,1.56],[2700,1.44],[2400,1.34],[2100,1.24],[1900,1.18],[1700,1.12],[1500,1.06]];\n"
     "  function fit(){ var w=window.innerWidth||1600; var z=Math.min(MAX,Math.max(MIN,w/DW)); document.documentElement.style.setProperty('--bm-fit',z.toFixed(3));\n"
     "    var L=1; for(var i=0;i<NAVZ.length;i++){ if(w>=NAVZ[i][0]){ L=NAVZ[i][1]; break; } }\n"
     "    document.documentElement.style.setProperty('--bm-navz',(L/z).toFixed(4)); }",
     'the page zoom script (bm-fit-0211-js)'),
    ("  function fit(){ var n=nxt(); if(!n) return; var d=n.getBoundingClientRect().top-t.getBoundingClientRect().top;\n"
     "    if(d>0&&d<120) nav.style.setProperty('top',(-Math.round(d))+'px','important'); }",
     "  /* 25 Nov 2026: d is in zoomed screen px (bm-fit-0211), so it is divided by the page zoom; once bm-nav-autohide is on\n"
     "     the page it places the tab strip itself (under the nav, or at the top when the nav hides) */\n"
     "  function fit(){ var n=nxt(); if(!n) return; var Z=parseFloat(getComputedStyle(document.documentElement).zoom)||1, d=(n.getBoundingClientRect().top-t.getBoundingClientRect().top)/Z;\n"
     "    if(d>0&&d<120){ nav.setAttribute('data-bm-tuck',Math.round(d)); if(window.bmSvcPlace) window.bmSvcPlace(); else nav.style.setProperty('top',(-Math.round(d))+'px','important'); } }",
     'the tab strip tuck (bm-qa-js)'),
    # 26 Nov 2026: the strip highlight moved to bm-nav-autohide (this one knew 4 of the 28 links); the progress bar stays
    ('sections.push({el: el, pill: pill, accent: accent});',
     'sections.push({el: el, pill: null, accent: accent});   /* 26 Nov 2026: the strip highlight lives in bm-nav-autohide */',
     'the old strip highlight (slick-polish-js)'),
    # 26 Nov 2026, "follow this sequence" (1 Branding Process, 2 Services & Price, 3 Why Branding, 4 Modules): the page opens
    # on tab 1 every time, instead of Services & Price or the tab last opened; ?tab= still picks one
    ("var start='svc'; try{ start=localStorage.getItem('bm_price_tab')||'svc'; }catch(e){}",
     "var start='proc';   /* 26 Nov 2026: opens on 1 Branding Process, the first of the four */",
     'the opening tab (bm-tabs-1020-js)'),
]

# The nav hides on scroll down and comes back on scroll up, as on the other pages (js/main.js, which never reaches the
# shadow nav); the sticky tab strip follows it. Goes right after layout.js.
AUTOHIDE = r'''<style id="bm-svcnav-title-0126">/* 26 Nov 2026: on the Services & Price tab the strip's title row is hidden by design
   (body.bm-tab-svc .svcnav-title), but "#svcnav.is-stuck .svcnav-title{display:flex}" brought it back whenever the strip
   pinned. Pinning then grew the strip by a row, the tabs jumped, the strip unpinned, the row went again, so the tabs bounced
   mid-slide and the title showed half cut at the top of the screen. It stays hidden on that tab now, pinned or not. */
html body.bm-tab-svc #svcnav:not(#x) .svcnav-title{display:none!important}
</style>
<style id="bm-was-0126">/* 26 Nov 2026: "can you place else where so that not overlay with illustrations" (the struck-out old price ran under the
   card art on AI Setup, UX Redesign, App Build, Booth...). The old price leaves the price row and follows the USD line:
   "RM 19,000 [50% off]" then "~ US$4,660  RM 38,000". The row breaks after the chip with an empty full-width item.
   Then "yes move the 50% off chip too" (it still sat on the art on SEO Audit Sprint, Bespoke Engagement, Premium...): the
   first line is the price alone, and the second reads "~ US$465  RM 3,800  [50% OFF]". */
html body .svc-panel :is(.panel-price,.panel-price-soft):not(#x):has(.panel-usd,.panel-was,.panel-off)::after{content:"";order:8;flex:0 0 100%;height:0}
html body .svc-panel :is(.panel-price,.panel-price-soft):not(#x):has(.panel-usd,.panel-was,.panel-off){row-gap:6px!important;align-items:baseline!important}
html body .svc-panel :is(.panel-price,.panel-price-soft):not(#x) .panel-usd{order:9!important;flex:0 0 auto!important;width:auto!important}
html body .svc-panel :is(.panel-price,.panel-price-soft):not(#x) .panel-was{order:10!important;margin-left:0!important}
html body .svc-panel :is(.panel-price,.panel-price-soft):not(#x) .panel-off{order:11!important;margin:0!important;align-self:center!important;transform:none!important}
html body .svc-panel :is(.panel-price,.panel-price-soft):not(#x) :is(.panel-usd,.panel-was){align-self:center!important;margin-top:0!important}
/* "why bos this looks like thin?" (phone): ".svc-panels .svc-panel:last-child{margin-right:12vw}" was an end spacer for the
   old flex slider; the row is a grid now, so the margin came out of the last card's own column (281px against 330px on
   every 3-card row). The row's own padding keeps the end gap. */
@media(max-width:1000px){html body .svc-block .svc-panels:not(#x) > .svc-panel:last-child{margin-right:0!important}}
/* "Custom scope two line text": the word price on Enterprise / Portal takes two lines so it clears the art */
html body .svc-panel .panel-price-soft:not(#x) .pcnt.pword{display:inline-block!important;width:min-content!important;white-space:normal!important;line-height:1!important}
</style>
<script id="bm-nav-autohide">/* 25 Nov 2026: "isnt nav bar suppose to disappear when scroll", "this one should follow" (the service tab strip),
   then "why scrolling up the our process nav bar under nav bar" (Firefox).
   The other pages hide the nav on scroll down and bring it back on scroll up (js/main.js); this page uses the shadow nav
   from js/layout.js, which main.js never reaches, so the same rule lives here. The sticky tab strip (#svcnav) sits right
   under the nav while it shows and moves up to the top of the screen when it hides. */
(function(){
  var last=window.scrollY, hidden=false, hold=false, svc=document.getElementById('svcnav');
  var EASE='.45s cubic-bezier(0.25,0.46,0.45,0.94)';
  function navEl(){ var h=document.getElementById('bm-nav-host'); return h&&h.shadowRoot&&h.shadowRoot.querySelector('.nav'); }
  /* screen px per CSS px of the strip, read off the strip itself, so it holds whichever way a browser reports zoomed boxes */
  function scale(){ var h=svc.offsetHeight; return h?svc.getBoundingClientRect().height/h:1; }
  /* the strip sticks so its row of tabs (the first visible block after the title) lands right under the nav while the
     nav shows, or at the top of the screen when it hides; whatever sits above the tabs (the title row, when it shows)
     slides out of view. Measured each time, since the title row comes and goes. */
  function tabsEl(){ var t=svc.querySelector('.svcnav-title'), e=t&&t.nextElementSibling;
    while(e&&(/^(SCRIPT|STYLE)$/.test(e.tagName)||!e.getClientRects().length||/fixed|absolute/.test(getComputedStyle(e).position))) e=e.nextElementSibling; return e; }
  /* 26 Nov 2026: "still when i scroll up the nav bar overlay with nav menu" (Firefox). The strip used to slide by animating its
     sticky top while the nav slid by transform; the two fell out of step (150ms into a scroll up, Firefox had the nav 77% down
     and the strip 47% down, so the tabs sat under the nav). Now the new top is set at once and the jump is played back as a
     transform with the nav's own timing, so both slide together in every browser. */
  function place(n){
    if(!svc) return; n=n||navEl();
    var K=scale(), e=tabsEl(); if(!e) return;
    var eT=e.getBoundingClientRect().top;
    var above=(eT-svc.getBoundingClientRect().top)/K-(parseFloat(getComputedStyle(svc).paddingTop)||0);   /* CSS px above the tabs, padding kept */
    var h=(n&&!hidden)?n.getBoundingClientRect().height/K:0;
    var top=Math.round(h-Math.max(0,above))+'px';
    if(svc.style.getPropertyValue('top')!==top){
      svc.style.setProperty('transition','none'); svc.style.setProperty('transform','none','important');
      svc.style.setProperty('top',top,'important');
      var d=eT-e.getBoundingClientRect().top;   /* how far the tabs just jumped on screen (0 while the strip is not pinned) */
      if(Math.abs(d)>0.5){
        svc.style.setProperty('transform','translateY('+(d/K).toFixed(2)+'px)','important'); svc.getBoundingClientRect();
        svc.style.setProperty('transition','transform '+EASE); svc.style.setProperty('transform','none','important');
      }
    }
    settle();
  }
  /* Check against the screen once the strip has settled: the tabs should start one padding below the nav's bottom edge
     (or below the top of the screen while the nav hides). The difference is measured in screen px on both sides and
     taken off, up to 4 passes, so a browser that applies the page zoom to a sticky offset differently still lines up. */
  var st=null;
  function settle(){ clearTimeout(st); st=setTimeout(function(){ fix(4); },520); }
  function fix(k){
    if(!svc||k<=0||!svc.classList.contains('is-stuck')&&svc.getBoundingClientRect().top>(navEl()?navEl().getBoundingClientRect().bottom:0)+2) return;   /* not pinned: nothing to line up */
    var n=navEl(), e=tabsEl(); if(!e) return;
    var K=scale(), pad=(parseFloat(getComputedStyle(svc).paddingTop)||0)*K;
    var want=((n&&!hidden)?Math.max(0,n.getBoundingClientRect().bottom):0)+pad;
    var err=e.getBoundingClientRect().top-want;
    if(Math.abs(err)<1.5) return;
    var cur=parseFloat(svc.style.getPropertyValue('top'))||0;
    svc.style.setProperty('transition','none'); svc.style.setProperty('transform','none','important');
    svc.style.setProperty('top',Math.round(cur-err/K)+'px','important');
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ fix(k-1); }); });
  }
  window.bmSvcPlace=function(){ place(); };

  /* 26 Nov 2026: "when i click on the personal brand, the indicator why website". The design's highlight (slick-polish-js)
     only knew the sections named svc-1 to svc-13, which matched four of the strip's 28 links, so from Website on it stayed
     put. This one reads each link's own target, so every link lights up as its section reaches the top third under the strip. */
  var spots=[], cur=null, jumping=null;
  if(svc) [].forEach.call(svc.querySelectorAll('.bm-mpill[onclick]'),function(a){
    var m=/bmMenuGo\('([^']+)'\)/.exec(a.getAttribute('onclick')||''); if(!m) return;
    for(var i=0;i<spots.length;i++) if(spots[i].id===m[1]){ spots[i].pills.push(a); return; }
    spots.push({id:m[1],pills:[a]});
  });
  function mark(s){
    if(s===cur) return;
    if(cur) cur.pills.forEach(function(a){ a.classList.remove('active'); a.removeAttribute('aria-current'); });
    cur=s; if(!s) return;
    s.pills.forEach(function(a){ a.classList.add('active'); a.setAttribute('aria-current','true'); });
    var row=document.getElementById('bm-menubar-row'), p=s.pills[0];   /* keep the lit link in view inside the row */
    if(row&&p&&row.scrollWidth>row.clientWidth&&innerWidth>860){
      var rr=row.getBoundingClientRect(), pr=p.getBoundingClientRect();
      if(pr.left<rr.left+40||pr.right>rr.right-40) row.scrollBy({left:(pr.left-rr.left-rr.width*0.3)/scale(),behavior:'smooth'});
    }
  }
  function spy(){
    if(!svc||!spots.length||!document.body.classList.contains('bm-tab-svc')) return;
    if(jumping) return mark(jumping);
    var b=Math.max(0,svc.getBoundingClientRect().bottom), line=b+(innerHeight-b)*0.3, pick=null;
    for(var i=0;i<spots.length;i++){ var el=document.getElementById(spots[i].id), r=el&&el.getClientRects().length&&el.getBoundingClientRect(), cx=r&&(r.left+r.right)/2;
      /* a card slid out of view sideways (Enterprise / Portal is the 5th card of the Website slider) does not count */
      if(r&&r.top<=line&&cx>0&&cx<innerWidth) pick=spots[i]; }
    mark(pick||spots[0]);
  }

  /* 26 Nov 2026: a jump from the strip lands the section just under the strip. The nav stays hidden for the whole jump
     (up or down), the target's scroll margin is set from the strip as measured, and once the scroll stops the landing is
     checked on screen and nudged if it is off. Before this a jump upward brought the nav back and the section landed
     under the strip. */
  var jt=null;
  function landing(){ var e=tabsEl(), K=scale(), pad=(parseFloat(getComputedStyle(svc).paddingTop)||0)*K;
    return pad+(svc.getBoundingClientRect().bottom-(e?e.getBoundingClientRect().top:svc.getBoundingClientRect().top))+16*K; }
  function aim(el,smooth){ el.style.setProperty('scroll-margin-top',(landing()/scale()).toFixed(1)+'px','important');
    el.scrollIntoView({behavior:smooth?'smooth':'instant',block:'start'}); }   /* instant: 'auto' follows the page's scroll-behavior:smooth */
  function jump(id){
    try{ if(typeof bmMenuClose==='function') bmMenuClose(); }catch(e){}
    var el=document.getElementById(id); if(!el) return;
    if(!svc||!document.body.classList.contains('bm-tab-svc')){ el.scrollIntoView({behavior:'smooth'}); return; }
    for(var i=0;i<spots.length;i++) if(spots[i].id===id){ jumping=spots[i]; mark(jumping); }
    hold=true; var n=navEl(); if(n&&window.scrollY>(n.offsetHeight||60)+40){ hidden=true; showNav(n); place(n); }
    aim(el,true);
    clearTimeout(jt); var lastY=null, tries=0;
    (function wait(){ jt=setTimeout(function(){
      if(window.scrollY!==lastY&&tries++<60){ lastY=window.scrollY; return wait(); }
      var err=el.getBoundingClientRect().top-(Math.max(0,svc.getBoundingClientRect().bottom)+16*scale());
      if(Math.abs(err)>3) aim(el,false);
      setTimeout(function(){ hold=false; jumping=null; last=window.scrollY; spy(); },150);
    },160); })();
  }
  window.bmMenuGo=jump;
  /* the reader takes over (wheel, touch, keys): the jump lets go at once, so scrolling up mid-jump brings the nav back as usual */
  function letGo(){ if(!hold) return; clearTimeout(jt); hold=false; jumping=null; last=window.scrollY; }
  ['wheel','touchstart','keydown'].forEach(function(t){ addEventListener(t,letGo,{passive:true}); });

  function showNav(n){ n.style.setProperty('transition','transform '+EASE); n.style.setProperty('transform',hidden?'translateY(-110%)':'none','important'); }
  function upd(){
    var n=navEl(), y=window.scrollY; if(!n) return;
    var menuOpen=n.querySelector('.nav-mobile.open,.open[class*="menu"]')||document.querySelector('.nav-mobile.open');
    var nh=n.offsetHeight||60;
    if(hold) hidden=y>nh+40;
    else if(y>last+2 && y>nh+40 && !menuOpen) hidden=true;
    else if(y<last-2 || y<=nh+40) hidden=false;
    last=y;
    showNav(n); place(n); spy();
  }
  /* the strip's title row shows or hides when the strip sticks (is-stuck), which can happen after the last scroll event:
     place it again whenever that class changes, so it never stays parked one title row too high */
  if(svc&&window.MutationObserver) new MutationObserver(function(){ place(); }).observe(svc,{attributes:true,attributeFilter:['class']});
  /* a tab change (body class) clears the highlight and reads it again */
  if(window.MutationObserver) new MutationObserver(function(){ if(cur) cur.pills.forEach(function(a){ a.classList.remove('active'); }); cur=null; spy(); }).observe(document.body,{attributes:true,attributeFilter:['class']});
  addEventListener('scroll',upd,{passive:true}); addEventListener('resize',upd);
  if(document.readyState==='complete') upd(); else addEventListener('load',upd);
})();</script>
'''


# ---------------------------------------------------------------------------------------------------------
# Speed (26 Nov 2026, "check on pricing page about the load ... load faster without reduce the quality").
# Measured before: 4.8 MB page (1 MB gzipped), 30,572 elements of which 17,540 sat inside the 85 card drawings
# on the Services & Price tab, a 511 KB breakdown script read at load, all 7 phase films starting to download
# on phones; first paint 4.5 s on desktop and 7.7 s on a phone, the phone busy for 44 s.
# Nothing here changes what the page looks like: the drawings are the same inline SVGs, inserted as their row
# comes near the screen (and the rest once the page is idle); the films keep their posters and play the same.
# ---------------------------------------------------------------------------------------------------------
SPEED_PATCHES = [
    # the drawing's assemble-once animation, callable for a drawing that arrives after its card came into view
    ("  if(still||!('IntersectionObserver' in window)){ cards.forEach(function(c){ c.classList.add('bmi-live'); }); return; }",
     "  window.bmArtBuild=build;   /* 26 Nov 2026: the drawings load as their row nears (bm-speed) */\n"
     "  if(still||!('IntersectionObserver' in window)){ cards.forEach(function(c){ c.classList.add('bmi-live'); }); return; }",
     'the drawing build (bm-cards-refine-js)'),
    # phase films: the poster shows at once; the film's address is given as it comes near the screen
    # (bmFilmNear), or on play, whichever comes first. Before, phones fetched ~330 KB of each of the 7 films at load.
    ("v.preload='metadata'; v.poster=base+'-poster.jpg'; v.src=base+'-web.mp4';",
     "v.preload='none'; v.poster=base+'-poster.jpg'; v.dataset.src=base+'-web.mp4'; "
     "v.play=(function(p){ return function(){ bmFilmSrc(v); return p.apply(v,arguments); }; })(v.play);",
     'the phase film source (bm-cont)'),
    ("art.insertBefore(box,art.firstChild); art.classList.add('has-vid'); ui(); upd(); if(io) io.observe(screen);",
     "art.insertBefore(box,art.firstChild); art.classList.add('has-vid'); ui(); upd(); if(io) io.observe(screen); bmFilmNear(v);",
     'the phase film placement (bm-cont)'),
    # the films ship with the page, so the 7 "is it there?" requests at load are not needed
    ("fetch('data/videos/phases/phase'+n+'-web.mp4',{method:'HEAD'}).then(function(r){ if(r.ok) build(row,n); }).catch(function(){});",
     "build(row,n);",
     'the phase film check (bm-cont)'),
    # Scripts that measured the page while it was still being read: each measurement restyled everything read so
    # far, again and again (about 36 s of restyle and layout at 4x CPU before the page could show). They now
    # measure once the page has been read; nothing they show is on screen before then (the page is held blank).
    ("  window.addEventListener('scroll',chk,{passive:true});\n  chk();",
     "  window.addEventListener('scroll',chk,{passive:true});\n  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',chk); else chk();",
     'the strip pin check (svcnav)'),
    ("    var accent = hdr ? getComputedStyle(hdr).getPropertyValue('--sa').trim() : '#2563EB';",
     "    var accent = '#2563EB';   /* 26 Nov 2026: only fed the old strip highlight, which bm-nav-autohide replaced */",
     'the strip accent read (slick-polish-js)'),
    ("      if(row){ row.classList.add('has-four'); window.dispatchEvent(new Event('resize')); }",
     "      if(row){ row.classList.add('has-four'); if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){ window.dispatchEvent(new Event('resize')); }); else window.dispatchEvent(new Event('resize')); }",
     'the mid-page resize (bm-edgy-icons)'),
    ("    setTimeout(refresh,400);",
     "    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){ setTimeout(refresh,0); }); else setTimeout(refresh,400);",
     'the row counter start (card rows)'),
    ('<script id="bm-trig-js">\n/* the diagram: select a trigger (hover, click, keys) and its drawer opens under its bar while the rows below slide down;\n'
     '   focus a group (chips); walk the twelve on its own until touched */\n(function(){',
     '<script id="bm-trig-js">\n/* the diagram: select a trigger (hover, click, keys) and its drawer opens under its bar while the rows below slide down;\n'
     '   focus a group (chips); walk the twelve on its own until touched. 26 Nov 2026: starts once the page has been read */\n'
     "if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bmTrigStart); else bmTrigStart();\nfunction bmTrigStart(){",
     'the trigger diagram start (bm-trig-js)'),
    ('&&root.getBoundingClientRect().top<innerHeight) start(); },1500); }\n  else start();\n})();\n</script>',
     '&&root.getBoundingClientRect().top<innerHeight) start(); },1500); }\n  else start();\n}\n</script>',
     'the trigger diagram end (bm-trig-js)'),
    ("  fit(); window.addEventListener('resize',fit);\n  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(fit);\n  window.addEventListener('load',fit);",
     "  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',fit); else fit(); window.addEventListener('resize',fit);\n"
     "  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(fit);\n  window.addEventListener('load',fit);",
     'the strip tuck start (bm-qa-js)'),
    # the hero drawing's fit: the ResizeObserver already calls it once as soon as the drawing is laid out
    ("  fit(); window.addEventListener('resize',fit); if(window.ResizeObserver) new ResizeObserver(fit).observe(el);",
     "  if(!window.ResizeObserver) fit(); window.addEventListener('resize',fit); if(window.ResizeObserver) new ResizeObserver(fit).observe(el);",
     'the hero drawing fit start (bm-hero3d-js)'),
    # the three made-up resize events after the page zoom is set: one costs ~0.24 s on a phone; the zoom only exists
    # above 1600px wide (below it the page is at 1), so below that there is nothing to announce
    ("  requestAnimationFrame(nudge); setTimeout(nudge,900); setTimeout(nudge,3000);",
     "  if((window.innerWidth||DW)>DW){ requestAnimationFrame(nudge); setTimeout(nudge,900); setTimeout(nudge,3000); }",
     'the zoom resize nudges (bm-fit-0211-js)'),
]

# in <head>: the build's version tag for files whose address scripts put together, and the film loader
SPEED_HEAD = '''<script id="bm-speed-head">window.BMV='%s';
/* document.fonts.ready read while the page is still being read makes the browser restyle and lay out everything read
   so far (3.3 s on a phone, from one line in bm-qa-js; six scripts ask): until the page has been read, the answer is
   the same promise, handed over once reading is done */
(function(){ try{ var P=window.FontFaceSet&&FontFaceSet.prototype, d=P&&Object.getOwnPropertyDescriptor(P,'ready'); if(!d||!d.get) return;
  Object.defineProperty(P,'ready',{configurable:true,enumerable:d.enumerable,get:function(){ var self=this; if(document.readyState!=='loading') return d.get.call(self);
    return new Promise(function(ok,no){ document.addEventListener('DOMContentLoaded',function(){ d.get.call(self).then(ok,no); }); }); }}); }catch(e){} })();
window.bmFilmSrc=function(v){ if(!v.getAttribute('src')&&v.dataset.src){ v.preload='metadata'; v.src=v.dataset.src; } };
window.bmFilmNear=(function(){ var io=('IntersectionObserver' in window)?new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ io.unobserve(e.target); bmFilmSrc(e.target); } }); },{rootMargin:'900px 0px'}):null;
  return function(v){ if(io) io.observe(v); else bmFilmSrc(v); }; })();</script>
'''

# at the end of <body>: card drawings and breakdown texts on demand
SPEED_JS = r'''<script id="bm-speed">/* 26 Nov 2026 (tools/build-pricing.py, speed()): the card drawings and the breakdown texts live in their
   own files. A row's drawings are inserted as the row comes within 1200px of the screen; once the page has loaded
   and is idle, the remaining rows fill in one at a time, so a swipe, a tab change or a jump never meets an empty
   card. The breakdown texts load once the page is idle; a click before that waits for them (and for that card's
   drawing, which the pop-up shows) and then opens as before. */
(function(){
  var still=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cards=[].slice.call(document.querySelectorAll('.svc-block .svc-panel')), cache={};
  function idle(f){ (window.requestIdleCallback||function(g){ return setTimeout(g,200); })(f,{timeout:3000}); }
  function get(u){ return cache[u]||(cache[u]=fetch(u).then(function(r){ if(!r.ok) throw new Error(r.status); return r.text(); })); }
  function fill(span){
    if(span._bm) return span._bm;
    return span._bm=get(span.getAttribute('data-bm-art')).then(function(t){
      if(span.querySelector('svg')) return;
      span.insertAdjacentHTML('afterbegin',t);
      var c=span.closest('.svc-panel'), sv=span.querySelector('svg.bmiso'); if(!c||!sv) return;
      /* what bm-cards-refine-js does for each drawing at load: its drift offset, then the assemble-once entrance */
      sv.style.setProperty('--dd',(-(Math.max(0,cards.indexOf(c))*0.83)%7).toFixed(2)+'s');
      if(!still&&('IntersectionObserver' in window)){ sv.classList.add('bmi-pre'); if(c.classList.contains('bmi-live')&&window.bmArtBuild) bmArtBuild(c); }
    }).catch(function(){ span._bm=null; });
  }
  function fillIn(root){ return Promise.all([].map.call(root.querySelectorAll('[data-bm-art]'),fill)); }
  window.bmArtFill=fillIn;
  var rows=[].slice.call(document.querySelectorAll('.svc-block'));
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ io.unobserve(e.target); fillIn(e.target); } }); },{rootMargin:'1200px 0px'});
    rows.forEach(function(r){ io.observe(r); });
  } else fillIn(document);
  var left=rows.slice();
  function rest(){ var r=left.shift(); if(r) fillIn(r).then(function(){ idle(rest); }); }

  var BD='__BD__', bdP=null, ready=false;
  function bd(){ return bdP||(bdP=new Promise(function(ok,no){ var s=document.createElement('script'); s.src=BD; s.onload=function(){ ready=true; ok(); }; s.onerror=function(){ bdP=null; no(); }; document.head.appendChild(s); })); }
  var od=window.openDrawer;
  if(typeof od==='function') window.openDrawer=function(key){
    var self=this, a=arguments, btn=document.querySelector('.svc-panel [onclick*="openDrawer(\''+key+'\')"]'), card=btn&&btn.closest('.svc-panel');
    if(ready&&!(card&&card.querySelector('[data-bm-art]:empty'))) return od.apply(self,a);
    Promise.all([bd(),card?fillIn(card):null]).then(function(){ od.apply(self,a); },function(){ od.apply(self,a); });
  };
  var begun=false;
  function later(){ if(begun) return; begun=true; setTimeout(function(){ idle(function(){ bd().catch(function(){}); idle(rest); }); },1200); }
  if(document.readyState==='complete') later(); else { addEventListener('load',later); setTimeout(later,8000); }   /* 8 s: a slow third-party file can hold "load" back */

  /* the footer effect (js/footer-fx.js) sizes its canvas at start and on window resize only; the three made-up resize
     events used to bring it in line once the footer settled. Now one resize is sent, only when the footer and its
     canvas differ in height (without it, on phones the effect stopped 80 to 220px above the footer's end). */
  if(window.ResizeObserver){
    var ft=null, ftT=null, ro=new ResizeObserver(function(){ clearTimeout(ftT); ftT=setTimeout(function(){
      var c=ft&&ft.querySelector('canvas.bmf-footer-fx');
      if(c&&Math.abs(c.getBoundingClientRect().height-ft.getBoundingClientRect().height)>2) window.dispatchEvent(new Event('resize'));
    },250); });
    (function hook(n){ ft=document.querySelector('footer.bmf'); if(ft) ro.observe(ft); else if(n<40) setTimeout(function(){ hook(n+1); },500); })(0);
  }
})();</script>
'''


def css_min(css):
    """Comments out and runs of white space to one space, outside quoted strings; nothing else changes."""
    out, i, n, q = [], 0, len(css), None
    while i < n:
        c = css[i]
        if q:
            out.append(c)
            if c == '\\' and i + 1 < n:
                out.append(css[i + 1])
                i += 2
                continue
            if c == q:
                q = None
            i += 1
        elif c in '"\'':
            q = c
            out.append(c)
            i += 1
        elif css.startswith('/*', i):
            j = css.find('*/', i + 2)
            i = n if j < 0 else j + 2
        elif c.isspace():
            while i < n and css[i].isspace():
                i += 1
            if out and out[-1] != ' ':
                out.append(' ')
        else:
            out.append(c)
            i += 1
    return ''.join(out).strip()


def speed(s):
    def digest(b):
        return hashlib.sha1(b).hexdigest()[:10]
    files = os.path.join(ROOT, FILES)

    # 1. the 85 card drawings, each to its own file (named by its content, so a changed drawing gets a new name)
    cdir = os.path.join(files, 'cards')
    shutil.rmtree(cdir, ignore_errors=True)
    os.makedirs(cdir)

    def card(m):
        svg = m.group(2).encode('utf-8')
        name = digest(svg) + '.svg'
        with open(os.path.join(cdir, name), 'wb') as f:
            f.write(svg)
        return '<span class="hero-ico bm-iso" data-bm-art="%s/cards/%s"></span>' % (FILES, name)
    s, n = re.subn(r'(<span class="hero-ico bm-iso">)\s*(<svg\b[^>]*class="bmiso.*?</svg>)\s*</span>', card, s, flags=re.S)
    if n < 80 or '<svg class="bmiso' in s or re.search(r'<svg[^>]*class="bmiso', s):
        sys.exit('card drawings: moved %d, some left in the page' % n)

    # 2. the breakdown texts: the data moves to its own file; the drawer code stays
    a = s.find('const breakdowns = {')
    b = s.find('\n};\n// ── PACKAGE DOSSIER ENGINE', a)
    if a < 0 or b < 0:
        sys.exit('could not find the breakdown texts')
    js = ('/* the breakdown texts of pricing.html, loaded on first use (tools/build-pricing.py) */\n'
          'Object.assign(breakdowns,' + s[a + len('const breakdowns = '):b + 2] + ');\n')
    jdir = os.path.join(files, 'js')
    shutil.rmtree(jdir, ignore_errors=True)
    os.makedirs(jdir)
    bd = 'breakdowns.%s.js' % digest(js.encode('utf-8'))
    with open(os.path.join(jdir, bd), 'w', encoding='utf-8', newline='') as f:
        f.write(js)
    s = s[:a] + 'var breakdowns = {};   /* the texts load from %s/js/%s (bm-speed) */' % (FILES, bd) + s[b + 3:]

    # 3. the script that only serves the page opened from a computer (file://)
    s = cut(s, r'<script id="bm-offline-shim">.*?</script>\s*', 'the offline-only script')
    # the engage film ships with the page too: no "is it there?" request
    s, n = re.subn(r"fetch\('pricing-files/data/videos/phases/engage-web\.mp4',\{method:'HEAD'\}\)\.then\(function\(r\)\{ if\(!r\.ok\) return; (.*?) \}\)\.catch\(function\(\)\{\}\);",
                   r'(function(){ \1 })();', s, count=1)
    if n != 1:
        sys.exit('could not find the engage film check')
    for name in ['engage'] + ['phase%d' % i for i in range(1, 7)]:
        if not os.path.isfile(os.path.join(files, 'data', 'videos', 'phases', name + '-web.mp4')):
            sys.exit('the film %s-web.mp4 is missing' % name)

    # 4. version tags. Fixed addresses get their file's own hash; the phase films, posters, subtitles and chapters,
    #    whose addresses the player puts together, get one tag for the whole folder (window.BMV)
    def tag(m):
        p = os.path.join(ROOT, m.group(1).replace('/', os.sep))
        if not os.path.isfile(p):
            return m.group(0)
        return m.group(1) + '?v=' + digest(open(p, 'rb').read())[:8]
    s = re.sub(r'''(?<=["'(])(%s/(?!cards/|js/)[^"'()\s?#]+\.(?:mp4|jpg|jpeg|png|webp|svg|woff2?|ttf|json|vtt))(?=["')])''' % FILES, tag, s)
    ph = os.path.join(files, 'data', 'videos', 'phases')
    bmv = digest(b''.join(open(os.path.join(ph, f), 'rb').read() for f in sorted(os.listdir(ph))))[:8]
    s, n = re.subn(r"base\+'(-web\.mp4|-poster\.jpg|\.vtt|\.chapters\.json)'", r"base+'\1?v='+BMV", s)
    if n < 4:
        sys.exit('film version tags: found %d of the player addresses' % n)
    s = s.replace('</head>', SPEED_HEAD % bmv + '</head>', 1)
    i = s.rindex('</body>')
    s = s[:i] + SPEED_JS.replace('__BD__', '%s/js/%s' % (FILES, bd)) + s[i:]

    # 5. style blocks: comments and spacing out (the notes stay in this script and in the design file); then the 136
    #    blocks spread through <body> go together to the top of <body>, in the same order. Every block met halfway
    #    through the page made the browser restyle everything read so far; that was most of a phone's load time.
    #    Order is what the cascade follows, and it is unchanged: head blocks (and the one a script adds to <head>)
    #    still come first, the body blocks next, in their order. Checked by a computed-style diff of every element.
    tok = r'(<script\b[^>]*>.*?</script>)|(<style\b[^>]*>)(.*?)(</style>)'
    s = re.sub(tok, lambda m: m.group(1) or (m.group(2) + css_min(m.group(3)) + m.group(4)), s, flags=re.S)
    body = re.search(r'<body\b[^>]*>', s).end()
    ns = re.match(r'\s*<!-- Google Tag Manager \(noscript\) -->.*?<!-- End Google Tag Manager \(noscript\) -->', s[body:], re.S)
    at = body + (ns.end() if ns else 0)
    moved, parts, last = [], [], at
    for m in re.finditer(tok, s[at:], flags=re.S):
        if m.group(2):
            parts.append(s[last:at + m.start()])
            moved.append(m.group(0))
            last = at + m.end()
    if len(moved) < 100:
        sys.exit('style blocks: found only %d in the body' % len(moved))
    s = s[:at] + '\n' + ''.join(moved) + ''.join(parts) + s[last:]
    return s


def fill_delivery(s):
    """Cards whose delivery line came empty from the design: the time is in the price line instead
    ("RM 1,900 · ~1 week · Money-back guaranteed"), so it is copied into the line; with no time anywhere
    (Bespoke Experience) the empty line is dropped rather than showing an icon with no text."""
    s = re.sub(r'(<div class="panel-price">[^<·]*·\s*(~?\d[^<·]*?(?:week|day|month)s?)\s*·[^<]*</div>\s*<div class="panel-meta">\s*'
               r'<span class="pmeta-item pmeta-delivery">\U0001F552 )(</span>)', r'\1\2\3', s)
    return s.replace('<span class="pmeta-item pmeta-delivery">\U0001F552 </span>', '')


def one_heading(s):
    """Each card's list opens with one "What's included", like the rest; the design gave three maintenance cards two
    headings of their own ("Three tiers" / "Three plans. Start at the entry rate") in its place."""
    return re.sub(r'<div class="panel-includes">[^<]*</div>(?:\s*<div class="panel-includes">[^<]*</div>)*',
                  '<div class="panel-includes">What\'s included</div>', s)


def short_lists(s):
    """Card lists show the bold title of each item; the words after it go in <span class="pci-d">, hidden on the card
    (View full breakdown opens the drawer, which has the full descriptions of its own)."""
    return re.sub(r'(<div class="pci"><span class="pck">[^<]*</span><div><strong>.*?</strong>)(?!<span class="pci-d">)(.*?)(</div></div>)',
                  lambda m: m.group(1) + ('<span class="pci-d">%s</span>' % m.group(2) if m.group(2).strip() else '') + m.group(3), s, flags=re.S)


def swap(s, old, new, what):
    if s.count(old) != 1:
        sys.exit('could not find %s in the design file' % what)
    return s.replace(old, new)


def cut(s, pattern, what):
    s2, n = re.subn(pattern, '', s, count=1, flags=re.S)
    if n != 1:
        sys.exit('could not find %s in the design file' % what)
    return s2


def site_head(cur):
    """The SEO / tracking part of the current pricing.html <head>."""
    m = re.search(re.escape(HEAD_BEGIN) + r'\n(.*?)\n' + re.escape(HEAD_END), cur, re.S)
    if m:  # pricing.html was built by this script before
        return m.group(1)
    head = cur[:cur.index('</head>')]
    a = head.index('<!-- Google Tag Manager -->')
    b = head.index('<link rel="preconnect"')
    block = re.sub(r'<meta name="viewport"[^>]*>\n?', '', head[a:b]).rstrip()
    ld = re.search(r'<script type="application/ld\+json">.*?</script>', cur, re.S)
    return block + ('\n' + ld.group(0) if ld else '')


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    src = open(sys.argv[1], encoding='utf-8').read()
    cur = open(OUT, encoding='utf-8').read()

    s = src
    if 'bm-preload-css' in s:  # up to Oct 2026: logo, progress bar and percentage
        s = cut(s, r'<style id="bm-preload-css">.*?</style>\s*', 'the loader CSS')
        s = cut(s, r'<div id="bm-preload"[^>]*>.*?<div class="bmpl-cap">.*?</div>\s*</div>\s*', 'the loader markup')
        s = cut(s, r'<script id="bm-preload-js">.*?</script>\s*', 'the loader script')
    else:  # from 27 Oct 2026: a white cover with a thin bar, right after <body>
        s = cut(s, r'<style id="bm-topload-css">.*?</style>', 'the loader CSS')
        s = cut(s, r'<div id="bm-topload"[^>]*><i></i></div>', 'the loader markup')
        s = cut(s, r"<script>\(function\(\)\{ function done\(\)\{ var e=document\.getElementById\('bm-topload'\).*?</script>", 'the loader script')
    if 'bm-preload' in s.replace("getElementById('bm-preload')", '') or 'bm-topload' in s:
        sys.exit('loader leftovers still in the page')

    # site head in place of the design's title and inline favicon
    s = cut(s, r'<title>.*?</title>\s*', 'the <title>')
    # the href is an inline SVG, so it holds '>' characters of its own
    s = cut(s, r'<link rel="icon" href="data:image/svg\+xml[^"]*"[^>]*>\s*', 'the inline favicon')
    s = s.replace('<meta charset="UTF-8">', '<meta charset="UTF-8">\n%s\n%s\n%s\n%s' % (HEAD_BEGIN, site_head(cur), HEAD_END, HOLD), 1)

    gtm_ns = re.search(r'<!-- Google Tag Manager \(noscript\) -->.*?<!-- End Google Tag Manager \(noscript\) -->', cur, re.S)
    s = s.replace('<body>', '<body>' + (gtm_ns.group(0) if gtm_ns else ''), 1)

    s = s.replace(OLD_PHONE, PHONE)
    for old, new, what in DESIGN_PATCHES:
        if s.count(old) != 1:
            sys.exit('could not find %s in the design file (found %d)' % (what, s.count(old)))
        s = s.replace(old, new)
    for patch in SPEED_PATCHES:
        old, new, what = patch[:3]
        want = patch[3] if len(patch) > 3 else 1
        if s.count(old) != want:
            sys.exit('could not find %s in the design file (found %d, expected %d)' % (what, s.count(old), want))
        s = s.replace(old, new)
    s = fill_delivery(s)
    s = one_heading(s)
    s = short_lists(s)

    # Walkthrough films (Branding Process tab): only "The 6 phases, explained" goes live (27 Oct 2026,
    # "let 1 video phases up"); its video, poster and thumbnail live in the site's video/ folder
    s = cut(s, r",\s*\['long-v5',[^\]]*\],\s*\['explained-v2',[^\]]*\](?=\],\s*TH=\{\})", 'the extra walkthrough films')
    s = s.replace('data/videos/bazil/', 'video/')

    # Folder export (11 Nov 2026): copy what the page loads into pricing-files/ and point its paths there
    src_dir = os.path.dirname(os.path.abspath(sys.argv[1]))
    if os.path.isdir(os.path.join(src_dir, 'assets')):
        dest = os.path.join(ROOT, FILES)
        for part in EXPORT_PARTS:
            a, b = os.path.join(src_dir, part), os.path.join(dest, part)
            if os.path.isdir(a):
                if os.path.isdir(b):
                    shutil.rmtree(b)
                shutil.copytree(a, b)
            elif os.path.isfile(a):
                os.makedirs(os.path.dirname(b), exist_ok=True)
                shutil.copy2(a, b)
            else:
                sys.exit('the export has no %s' % part)
        # only quoted paths: the same words inside the design's comments stay as they are
        s = re.sub(r'''(["'])(assets/|fonts/|data/videos/phases/|methodas-lockup-horizontal-blue\.png)''',
                   lambda m: m.group(1) + FILES + '/' + m.group(2), s)
        if re.search(r'''["'](?:assets|fonts|data)/''', s):
            sys.exit('a path to the export folder is still unchanged')

    # Feedback form: the design only opens WhatsApp or a mailto draft, so most feedback never
    # arrives. "Send feedback" now posts it straight to the inbox through FormSubmit (the
    # service the contact form uses); WhatsApp stays as the second option.
    s = swap(s, FB_ACTIONS_OLD, FB_ACTIONS_NEW, 'the feedback buttons')
    a = s.find(FB_SEND_FROM)
    b = s.find(FB_SEND_TO, a)
    if a < 0 or b < 0:
        sys.exit('could not find the feedback send code in the design file')
    s = s[:a] + FB_SEND_NEW + s[b:]

    # site nav + footer; the main pages carry no floating WhatsApp / scroll-top buttons, and the
    # footer relies on the site's link reset, which the design file does not have
    # layout.js keeps the version the current page loads (it is bumped site-wide when the menu changes)
    ver = re.search(r'js/layout\.js\?v=(\d+)', cur)
    tail = ('<style id="bm-site-shell">.wa-float,.scroll-top-float{display:none!important}'
            'footer.bmf a{text-decoration:none}</style>\n'
            '<script src="js/layout.js?v=%s"></script>\n' % (ver.group(1) if ver else '11') + AUTOHIDE + TWEAKS)
    i = s.rindex('</body>')
    s = s[:i] + tail + s[i:]

    s = speed(s)
    open(OUT, 'w', encoding='utf-8', newline='').write(s)
    print('wrote %s (%d bytes)' % (OUT, len(s.encode('utf-8'))))


if __name__ == '__main__':
    main()
