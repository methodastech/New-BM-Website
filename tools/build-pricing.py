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
    follow the site nav (logo on the left, Hire Us on the right).
"""
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
    var a=lg.getBoundingClientRect(), b=ct.getBoundingClientRect();
    r.style.setProperty('--bm-gl',Math.round(a.left)+'px');
    r.style.setProperty('--bm-gr',Math.round(r.clientWidth-b.right)+'px');
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
  function lines(t){ var lh=parseFloat(getComputedStyle(t).lineHeight)||parseFloat(getComputedStyle(t).fontSize)*1.15;
    return Math.round(t.getBoundingClientRect().height/lh); }
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
    var w=Math.max(110,Math.min(300,Math.round(right-used-14+parseFloat(getComputedStyle(pic).marginRight||0))));
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
            '<script src="js/layout.js?v=%s"></script>\n' % (ver.group(1) if ver else '11') + TWEAKS)
    i = s.rindex('</body>')
    s = s[:i] + tail + s[i:]

    open(OUT, 'w', encoding='utf-8', newline='').write(s)
    print('wrote %s (%d bytes)' % (OUT, len(s.encode('utf-8'))))


if __name__ == '__main__':
    main()
