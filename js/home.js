/* ---- B9, 17 Sep: arm a heavy asset only when it is genuinely near the viewport ----
   This layer runs at the end of <body>, before images and fonts have laid out, so the
   document is still short and an IntersectionObserver created at that moment happily
   reports a block 10,000px down the finished page as intersecting. Two guards:
   the observer is not built until window load, and the callback re-measures the
   element before it commits. Falls back to arming straight away with no observer. */
window.__bmxArmPending = window.__bmxArmPending || [];
/* Harness: index.html?bmxarm=all (or window.__bmxArmAll() from the console) loads
   every deferred asset at once. Needed because an IntersectionObserver never fires
   in a hidden preview pane, and useful for a headless capture of the whole page. */
window.__bmxArmAll = function () {
  var q = window.__bmxArmPending.slice();
  window.__bmxArmPending.length = 0;
  q.forEach(function (f) { try { f(); } catch (e) {} });
  return q.length;
};

function bmxArmOnApproach(el, margin, run) {
  var done = false;
  function fire() { if (!done) { done = true; run(); } }
  window.__bmxArmPending.push(fire);
  if (location.search.indexOf('bmxarm=all') > -1) { fire(); return; }
  function near() {
    var r = el.getBoundingClientRect();
    if (!r.width && !r.height) return false;            // display:none, never "near"
    return r.top < (window.innerHeight || 0) + margin && r.bottom > -margin;
  }
  /* IntersectionObserver reports nothing in some renderers (a hidden tab, a
     headless run, a preview pane), and the panel then sits empty forever.
     A passive scroll check runs alongside it and arms on the same geometry. */
  function onMove() {
    if (done) { detach(); return; }
    if (near()) { detach(); fire(); }
  }
  function detach() {
    document.removeEventListener('scroll', onMove, true);
    window.removeEventListener('resize', onMove);
  }
  /* the page scrolls inside body, not the window, so a window scroll listener
     never fires: the capture phase on document catches it from any scroller. */
  document.addEventListener('scroll', onMove, { passive: true, capture: true });
  window.addEventListener('resize', onMove, { passive: true });
  setTimeout(onMove, 1200);

  function build() {
    if (typeof IntersectionObserver !== 'function') { fire(); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting && near()) { io.disconnect(); fire(); } });
    }, { rootMargin: margin + 'px' });
    io.observe(el);
    /* a block on a page that is display:none never intersects, so watch for its
       page being opened and re-arm the observer then */
    var pg = el.closest && el.closest('.pg');
    if (pg && typeof MutationObserver === 'function') {
      var mo = new MutationObserver(function () {
        if (done) { mo.disconnect(); return; }
        if (pg.classList.contains('on')) { io.observe(el); }
      });
      mo.observe(pg, { attributes: true, attributeFilter: ['class'] });
    }
  }
  if (document.readyState === 'complete') build();
  else window.addEventListener('load', build, { once: true });
}

(function(){
  /* Sub pages of Work keep the Work nav item lit and open at the top. */
  var PARENT={'logo-gallery':'work','mascot-gallery':'work','tech-portfolio':'work'};
  function cur(){return (location.hash||'#home').slice(1)}
  function parentOf(id){return PARENT[id]||(/^(case|logo)-/.test(id)?'work':'')}
  function sync(){
    var p=parentOf(cur()); if(!p) return;
    document.querySelectorAll('.nav-links a,.nav-mobile a').forEach(function(a){if(a.getAttribute('data-page')===p)a.classList.add('active')});
  }
  function pauseHidden(){
    document.querySelectorAll('.bmx-video').forEach(function(v){
      if(v.closest('.pg.on')) return;
      v.pause(); var box=v.closest('.rvid,.bmx-reel'); if(box) box.classList.remove('is-playing');
    });
  }
  var last=cur();
  function after(){
    var id=cur();
    /* pass 22: every page opens at the top, not wherever the last page was scrolled to */
    if(id!==last){ if(document.getElementById('pg-'+id)||parentOf(id)||parentOf(last)) window.scrollTo({top:0,behavior:'instant'}); last=id; }
    sync(); pauseHidden();
  }
  document.addEventListener('click',function(e){if(e.target.closest('[data-page]'))setTimeout(after,0)});
  addEventListener('hashchange',function(){setTimeout(after,0)});
  sync();

  /* Logo gallery search */
  var lq=document.getElementById('lgSearch'),lg=document.getElementById('lgGrid'),le=document.getElementById('lgEmpty');
  if(lq&&lg){
    lq.addEventListener('input',function(){
      var v=lq.value.trim().toLowerCase(),n=0;
      lg.querySelectorAll('.bmx-lcard').forEach(function(c){var ok=!v||(c.getAttribute('data-q')||'').indexOf(v)>-1;c.classList.toggle('hide',!ok);if(ok)n++});
      if(le) le.hidden=n>0;
    });
  }

  /* Work grid: empty state for the existing search and filters */
  var wg=document.getElementById('wkgrid'),we=document.getElementById('wkEmpty');
  if(wg&&we){
    var upd=function(){setTimeout(function(){we.hidden=!!wg.querySelector('.wkcard:not(.hide)')},0)};
    var ws=document.getElementById('wkSearch'); if(ws) ws.addEventListener('input',upd);
    document.querySelectorAll('#pg-work .wk-chip').forEach(function(c){c.addEventListener('click',upd)});
  }

  /* Home videos: click to play with sound, click again to pause */
  function wire(box){
    var v=box.querySelector('.bmx-video'); if(!v) return;
    function toggle(){
      if(v.paused){v.muted=false;var p=v.play();if(p&&p.catch)p.catch(function(){});box.classList.add('is-playing')}
      else{v.pause();box.classList.remove('is-playing')}
    }
    box.addEventListener('click',toggle);
    box.addEventListener('keydown',function(e){if(e.target===box&&(e.key==='Enter'||e.key===' ')){e.preventDefault();toggle()}});
    v.addEventListener('ended',function(){box.classList.remove('is-playing')});
  }
  document.querySelectorAll('.rvid,.bmx-reel').forEach(wire);
})();

/* Work hub: panels act as tabs and swap the content below */
(function(){
  var hub=document.querySelector('.bmx-hub'); if(!hub) return;
  var ws=document.getElementById('wkSearch');
  var HINT={branding:'Search projects or industries',logos:'Search logos',mascots:'Search mascots',tech:'Search live builds'};
  function filterPane(){
    var pane=hub.querySelector('.bmx-pane.on'); if(!pane||pane.getAttribute('data-pane')==='branding') return;
    var v=(ws&&ws.value||'').trim().toLowerCase(), items=pane.querySelectorAll('[data-q]'), n=0;
    items.forEach(function(c){var ok=!v||(c.getAttribute('data-q')||'').indexOf(v)>-1;c.classList.toggle('hide',!ok);if(ok)n++});
    var em=pane.querySelector(':scope > .bmx-empty'); if(em) em.hidden=n>0;
  }
  function showPane(key){
    hub.querySelectorAll('.bmx-pane').forEach(function(p){p.classList.toggle('on',p.getAttribute('data-pane')===key)});
    hub.querySelectorAll('.bmx-panel').forEach(function(p){var on=p.getAttribute('data-pane')===key;p.classList.toggle('on',on);if(on)p.setAttribute('aria-current','true');else p.removeAttribute('aria-current')});
    var f=hub.querySelector('.wk-filters'); if(f) f.hidden=key!=='branding';
    hub.querySelectorAll('.bmx-pane-link').forEach(function(l){l.hidden=l.getAttribute('data-for')!==key});
    if(ws){ws.placeholder=HINT[key]||HINT.branding; ws.dispatchEvent(new Event('input'))}
    filterPane();
  }
  if(ws) ws.addEventListener('input',filterPane);
  /* capture phase, so a panel click switches the tab before the site router sees it */
  document.addEventListener('click',function(e){
    var p=e.target.closest('.bmx-panel'); if(!p||!hub.contains(p)) return;
    var key=p.getAttribute('data-pane');
    e.preventDefault();e.stopPropagation();
    /* pass 22 (Bazil): a gallery panel opens its gallery page; only Branding stays a tab */
    var go=hub.querySelector('.bmx-pane-link[data-for="'+key+'"]');
    if(key!=='branding'&&go){ go.click(); return; }
    showPane(key);
  },true);
})();

/* Hero video banner: keep it running when the tab comes back or Home is reopened */
(function(){
  var v=document.querySelector('.bmx-hero-vid'); if(!v) return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){v.pause();return}
  function go(){ if(document.hidden||!v.closest('.pg.on')) return; var p=v.play(); if(p&&p.catch)p.catch(function(){}); }
  document.addEventListener('visibilitychange',go);
  addEventListener('hashchange',function(){setTimeout(go,60)});
  document.addEventListener('click',function(e){if(e.target.closest('[data-page="home"]'))setTimeout(go,60)});
  go();
})();

/* Super admin bar: publish its height so the site nav and sticky bars sit below it */
(function(){
  var bar=document.querySelector('.bmws'); if(!bar) return;
  function set(){var h=getComputedStyle(bar).display==='none'?0:Math.round(bar.getBoundingClientRect().height);document.documentElement.style.setProperty('--bmx-bar',h+'px')}
  set(); addEventListener('resize',set);
  if(window.ResizeObserver) new ResizeObserver(set).observe(bar);
})();

/* Contact: a live 3D map of the office, Brand Method night palette, loaded when Contact opens */
(function(){
  var host=document.getElementById('bmxMap'); if(!host) return;
  /* Resource Centre (MRANTI), the building Bazil circled on Google Maps.
     Google place marker for MRANTI Park is 3.0475953, 101.6887874; the Resource Centre sits
     just south west of it inside the Bulatan Inovasi ring. */
  var HQ=[101.68872,3.04712], booted=false, map=null;
  var TILES='https://tiles.openfreemap.org/planet';
  function onContact(){return !!host.closest('.pg.on')}
  function style(){
    /* Light, realistic city: white ground, real roads, solid 3D massing with roofs and shadows.
       Brand Method blue stays the accent. */
    var H=['coalesce',['get','render_height'],['case',['==',['get','class'],'residential'],9,['+',10,['*',3,['%',['to-number',['coalesce',['id'],7]],5]]]]];
    return {version:8, glyphs:'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
      sources:{om:{type:'vector',url:TILES}},
      light:{anchor:'map', color:'#ffffff', intensity:.5, position:[1.6,215,28]},
      layers:[
        {id:'bg',type:'background',paint:{'background-color':'#f3f6ff'}},
        {id:'land',type:'fill',source:'om','source-layer':'landcover',
          paint:{'fill-color':['match',['get','class'],'wood','#dbe7d6','grass','#e3edda','#eef1f7'],'fill-opacity':.95}},
        {id:'park',type:'fill',source:'om','source-layer':'park',paint:{'fill-color':'#e0ebd9','fill-opacity':.95}},
        {id:'landuse',type:'fill',source:'om','source-layer':'landuse',minzoom:12,
          paint:{'fill-color':['match',['get','class'],'commercial','#f0f0f7','industrial','#eeeef3','residential','#f4f4f9','#f1f3f8'],'fill-opacity':.8}},
        {id:'water',type:'fill',source:'om','source-layer':'water',paint:{'fill-color':'#c3d6f2'}},
        {id:'waterway',type:'line',source:'om','source-layer':'waterway',paint:{'line-color':'#c3d6f2','line-width':1.6}},
        {id:'road-case',type:'line',source:'om','source-layer':'transportation',minzoom:11,
          layout:{'line-cap':'round','line-join':'round'},
          paint:{'line-color':['match',['get','class'],['motorway','trunk'],'#a9b7dd',['primary','secondary'],'#bcc8e4','#d3d9ea'],
                 'line-width':['interpolate',['exponential',1.5],['zoom'],11,1.8,16,12,19,32]}},
        {id:'road',type:'line',source:'om','source-layer':'transportation',minzoom:11,
          layout:{'line-cap':'round','line-join':'round'},
          paint:{'line-color':['match',['get','class'],['motorway','trunk'],'#ffffff',['primary','secondary'],'#ffffff','#fdfdff'],
                 'line-width':['interpolate',['exponential',1.5],['zoom'],11,.9,16,8,19,23]}},
        {id:'road-accent',type:'line',source:'om','source-layer':'transportation',minzoom:13,
          filter:['match',['get','class'],['motorway','trunk','primary'],true,false],
          paint:{'line-color':'#2536F5','line-opacity':.14,
                 'line-width':['interpolate',['exponential',1.5],['zoom'],13,1.4,16,4.5,19,10]}},
        {id:'rail',type:'line',source:'om','source-layer':'transportation',minzoom:12,
          filter:['==',['get','class'],'rail'],
          paint:{'line-color':'#98a6cb','line-width':1.2,'line-dasharray':[3,2]}},
        /* fake ground shadow so the massing does not read flat */
        {id:'building-shadow',type:'fill',source:'om','source-layer':'building',minzoom:14,
          paint:{'fill-color':'#3b4ea8','fill-opacity':.16,'fill-translate':[8,8],'fill-translate-anchor':'viewport'}},
        {id:'building',type:'fill-extrusion',source:'om','source-layer':'building',minzoom:13,
          paint:{'fill-extrusion-color':['interpolate',['linear'],['get','render_height'],0,'#e9edfd',12,'#dde4fb',35,'#c9d5f8',90,'#b2c2f4'],
                 'fill-extrusion-height':H,'fill-extrusion-base':['get','render_min_height'],
                 'fill-extrusion-opacity':.84,'fill-extrusion-vertical-gradient':true}},
        /* a crisp roof cap reads as a real rooftop and sharpens every edge */
        {id:'building-roof',type:'fill-extrusion',source:'om','source-layer':'building',minzoom:14.5,
          paint:{'fill-extrusion-color':'#ffffff','fill-extrusion-height':['+',H,.5],
                 'fill-extrusion-base':H,'fill-extrusion-opacity':.9}},
        {id:'building-glow',type:'line',source:'om','source-layer':'building',minzoom:14,
          paint:{'line-color':'#2536F5','line-opacity':.3,'line-width':2.6,'line-blur':3}},
        {id:'building-edge',type:'line',source:'om','source-layer':'building',minzoom:14,
          paint:{'line-color':'#3d55e8','line-opacity':.78,'line-width':.7}},
        {id:'street-labels',type:'symbol',source:'om','source-layer':'transportation_name',minzoom:14.5,
          layout:{'text-field':['get','name'],'text-font':['Noto Sans Regular'],'text-size':10,'symbol-placement':'line','text-letter-spacing':.04},
          paint:{'text-color':'#6f7ca3','text-halo-color':'#ffffff','text-halo-width':1.7}},
        {id:'labels',type:'symbol',source:'om','source-layer':'place',minzoom:11,
          layout:{'text-field':['get','name'],'text-font':['Noto Sans Regular'],'text-size':11.5,'text-letter-spacing':.1,'text-transform':'uppercase'},
          paint:{'text-color':'#39456f','text-halo-color':'#ffffff','text-halo-width':1.9}},
        {id:'poi',type:'symbol',source:'om','source-layer':'poi',minzoom:16.5,
          filter:['<=',['get','rank'],10],
          layout:{'text-field':['get','name'],'text-font':['Noto Sans Regular'],'text-size':9.5,'text-offset':[0,.9],'text-anchor':'top'},
          paint:{'text-color':'#8590b0','text-halo-color':'#ffffff','text-halo-width':1.5}}
      ]};
  }
  function chrome(){
    /* Holotable chrome over the model: corner brackets, readout, scale, sweep */
    var holo=document.createElement('div'); holo.className='bmx-holo'; host.appendChild(holo);
    var scan=document.createElement('div'); scan.className='bmx-scanline'; host.appendChild(scan);
    var hud=document.createElement('div'); hud.className='bmx-hud';
    hud.innerHTML='<span class="bmx-c tl"></span><span class="bmx-c tr"></span><span class="bmx-c bl"></span><span class="bmx-c br"></span>'+
      '<div class="bmx-readout"><b>Live view</b><span>MRANTI Park &middot; Bukit Jalil</span><span class="bmx-rd" id="bmxRead"></span></div>'+
      '<div class="bmx-scale"><i></i><span id="bmxScale"></span></div>'+
      '<div class="bmx-sweep"></div>';
    host.appendChild(hud);
    function read(){
      var c=map.getCenter();
      var rd=document.getElementById('bmxRead'); if(rd) rd.textContent=c.lat.toFixed(4)+' N / '+c.lng.toFixed(4)+' E  \u00b7  TILT '+Math.round(map.getPitch())+'\u00b0  \u00b7  Z'+map.getZoom().toFixed(1);
      var mpp=156543.03392*Math.cos(c.lat*Math.PI/180)/Math.pow(2,map.getZoom());
      var bar=document.querySelector('.bmx-scale i'), lab=document.getElementById('bmxScale');
      if(bar&&lab){var m=100; var px=Math.round(m/mpp); if(px>170){m=50;px=Math.round(m/mpp)} if(px<50){m=200;px=Math.round(m/mpp)} bar.style.width=px+'px'; lab.textContent=m+' m';}
    }
    read(); map.on('move',read);
  }

  function boot(){
    if(booted||!onContact()) return; booted=true;
    var css=document.createElement('link'); css.rel='stylesheet'; css.href=''; document.head.appendChild(css);
    var sc=document.createElement('script'); sc.src=''; sc.onload=init; sc.onerror=function(){booted=false}; document.head.appendChild(sc);
  }
  function init(){
    if(!window.maplibregl) return;
    map=new maplibregl.Map({container:host, style:style(), center:HQ, zoom:17.1, pitch:60, bearing:-24,
      antialias:true, attributionControl:{compact:true}, customAttribution:'\u00a9 OpenStreetMap contributors'});
    window.__bmxMap=map;
    map.on('load',function(){
      host.classList.add('is-ready');
      chrome();
      var beam=document.createElement('div'); beam.className='bmx-beam';
      new maplibregl.Marker({element:beam, anchor:'bottom'}).setLngLat(HQ).addTo(map);
      var el=document.createElement('div'); el.className='bmx-pin'; el.innerHTML='<i class="bmx-ret"></i><i class="bmx-ret2"></i><span></span><i class="bmx-lead"></i><b>Brand Method HQ<em>Office 25, Level 1</em></b>';
      new maplibregl.Marker({element:el}).setLngLat(HQ).addTo(map);
    });
  }
  addEventListener('hashchange',function(){setTimeout(boot,80)});
  document.addEventListener('click',function(e){if(e.target.closest('[data-page="contact"]'))setTimeout(boot,140)});
  boot();
})();

/* Nav gets a scrim as soon as the page scrolls; over the hero it stays clear at the top */
(function(){
  var nav=document.querySelector('#nav'); if(!nav) return;
  function upd(){nav.classList.toggle('is-stuck', (window.scrollY||0) > 18)}
  addEventListener('scroll',upd,{passive:true}); addEventListener('hashchange',function(){setTimeout(upd,60)}); upd();
})();

/* ---- About: the history chapters ---- */
document.querySelectorAll('.bmx-hist').forEach(function (root) {
  var rail = [].slice.call(root.querySelectorAll('.bmx-hist-y'));
  var panes = [].slice.call(root.querySelectorAll('.bmx-hist-pane'));
  if (!rail.length || rail.length !== panes.length) return;
  var i = 0;
  function go(n, focus) {
    i = (n + rail.length) % rail.length;
    rail.forEach(function (b, k) {
      var on = k === i;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });
    panes.forEach(function (p, k) { p.classList.toggle('is-on', k === i); });
    if (focus) rail[i].focus();
  }
  rail.forEach(function (b, k) { b.addEventListener('click', function () { go(k); }); });
  root.querySelectorAll('.bmx-hist-btn').forEach(function (b) {
    b.addEventListener('click', function () { go(i + (+b.dataset.h)); });
  });
  root.querySelector('.bmx-hist-rail').addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { go(i + 1, true); e.preventDefault(); }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { go(i - 1, true); e.preventDefault(); }
    if (e.key === 'Home') { go(0, true); e.preventDefault(); }
    if (e.key === 'End') { go(rail.length - 1, true); e.preventDefault(); }
  });
  go(0);
});

/* ---- the Work dropdown: the site's own script only wires the first .nav-dd ---- */
document.querySelectorAll('.nav-dd.bmx-navdd').forEach(function (dd) {
  var trg = dd.querySelector('.nav-dd-trigger');
  var panel = dd.querySelector('.nav-dd-panel');
  if (!trg || !panel) return;
  var t = null, pinned = false;
  function open() { dd.classList.add('open'); trg.setAttribute('aria-expanded', 'true'); }
  function hardClose() { pinned = false; dd.classList.remove('open'); trg.setAttribute('aria-expanded', 'false'); }
  function softClose() { if (!pinned) { dd.classList.remove('open'); trg.setAttribute('aria-expanded', 'false'); } }
  function keep() { clearTimeout(t); open(); }
  function leave() { clearTimeout(t); t = setTimeout(softClose, 320); }
  trg.addEventListener('mouseenter', keep);
  trg.addEventListener('mouseleave', leave);
  panel.addEventListener('mouseenter', keep);
  panel.addEventListener('mouseleave', leave);
  function toggle(e) { e.preventDefault(); e.stopPropagation(); clearTimeout(t); if (pinned) { hardClose(); } else { pinned = true; open(); } }
  trg.addEventListener('click', function (e) { if (e.target.closest('.cv')) toggle(e); });
  trg.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') toggle(e); });
  panel.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { hardClose(); }); });
  document.addEventListener('click', function (e) { if (!dd.contains(e.target)) hardClose(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hardClose(); });
});

/* ---- Site search: index everything, fall back to a web search ---- */
(function () {
  var btn = document.getElementById('bmxSearchBtn');
  var ui = document.getElementById('bmxSearch');
  var input = document.getElementById('bmxSearchInput');
  var out = document.getElementById('bmxSearchOut');
  var raw = document.getElementById('bmxSearchData');
  if (!btn || !ui || !input || !out || !raw) return;
  var data = [];
  try { data = JSON.parse(raw.textContent); } catch (e) { data = []; }
  var rows = [], cur = 0;
  var QUICK = [['Work', 'work'], ['Logo gallery', 'logo-gallery'], ['Services', 'services'],
               ['Culture', 'culture'], ['Pricing', 'pricing'], ['Contact', 'contact']];
  var ORDER = ['Project', 'Logo', 'Service', 'Page', 'Article'];

  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }
  function open() {
    ui.classList.add('open');
    document.documentElement.style.overflow = 'hidden';
    input.value = '';
    render('');
    setTimeout(function () { input.focus(); }, 30);
  }
  function close() { ui.classList.remove('open'); document.documentElement.style.overflow = ''; }
  function norm(t) { return String(t == null ? '' : t).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
  /* every word you type has to land somewhere on the entry, and where it lands
     decides the rank: title start beats title word beats blurb beats kind. */
  function score(item, q) {
    var T = norm(item.t), M = norm(item.m) + ' ' + norm(item.x), K = norm(item.k);
    var toks = norm(q).split(' ').filter(Boolean);
    if (!toks.length) return -1;
    var sum = 0;
    for (var i = 0; i < toks.length; i++) {
      var tk = toks[i], best = -1;
      if (T.indexOf(tk) === 0) best = 0;
      else if ((' ' + T).indexOf(' ' + tk) > 0) best = 1;
      else if (T.indexOf(tk) >= 0) best = 2;
      else if ((' ' + M).indexOf(' ' + tk) > 0) best = 3;
      else if (M.indexOf(tk) >= 0) best = 4;
      else if (K.indexOf(tk) >= 0) best = 5;
      else if (T.replace(/ /g, '').indexOf(tk) >= 0) best = 5;
      if (best < 0) return -1;
      sum += best;
    }
    return sum / toks.length;
  }
  function thumb(d) {
    if (d.i) return '<span class="bmx-sth"><img src="' + d.i + '" alt="" loading="lazy" decoding="async"></span>';
    var ch = d.k === 'Article' ? 'A' : d.k === 'Service' ? 'S' : d.k === 'Page' ? 'P' : 'B';
    return '<span class="bmx-sth bmx-sth--k">' + ch + '</span>';
  }
  function row(d) {
    return '<button class="bmx-srow" type="button" data-p="' + (d.p || '') + '" data-u="' + (d.u || '') + '">'
      + thumb(d)
      + '<span class="bmx-srow-m"><b>' + esc(d.t) + '</b>'
      + (d.m ? '<span>' + esc(d.m) + '</span>' : (d.u ? '<span>brandmethod.co</span>' : ''))
      + '</span><i>' + d.k + '</i></button>';
  }
  function render(q) {
    q = (q || '').trim().toLowerCase();
    var html = '';
    if (!q) {
      html += '<div class="bmx-search-quick">'
        + QUICK.map(function (k) { return '<button class="bmx-sqk" type="button" data-p="' + k[1] + '">' + k[0] + '</button>'; }).join('')
        + '</div>';
      html += '<div class="bmx-search-grp">Start anywhere</div>';
      data.filter(function (d) { return d.k === 'Project'; }).slice(0, 4).forEach(function (d) { html += row(d); });
    } else {
      var hits = [];
      data.forEach(function (d) { var sc = score(d, q); if (sc >= 0) hits.push({ d: d, s: sc }); });
      hits.sort(function (a, b) { return a.s - b.s || a.d.t.length - b.d.t.length; });
      var kinds = {};
      hits.slice(0, 30).forEach(function (h) { (kinds[h.d.k] = kinds[h.d.k] || []).push(h.d); });
      ORDER.concat(Object.keys(kinds)).forEach(function (k, idx, all) {
        if (!kinds[k] || all.indexOf(k) !== idx) return;
        html += '<div class="bmx-search-grp">' + k + '<em>' + kinds[k].length + '</em></div>';
        kinds[k].forEach(function (d) { html += row(d); });
        delete kinds[k];
      });
      if (!hits.length) html += '<div class="bmx-search-none">Nothing on the site matches <b>' + esc(q) + '</b> yet.</div>';
      html += '<div class="bmx-search-grp">The web</div>'
        + '<button class="bmx-srow bmx-srow--web" type="button" data-w="1">'
        + '<span class="bmx-sth bmx-sth--k">&#8599;</span>'
        + '<span class="bmx-srow-m"><b>Search the web for &ldquo;' + esc(q) + '&rdquo;</b>'
        + '<span>Opens a new tab</span></span><i>Web</i></button>';
    }
    out.innerHTML = html;
    rows = [].slice.call(out.querySelectorAll('.bmx-srow,.bmx-sqk'));
    cur = 0;
    mark();
    rows.forEach(function (r, i) {
      r.addEventListener('mouseenter', function () { cur = i; mark(); });
      r.addEventListener('click', function () { go(r); });
    });
  }
  function mark() { rows.forEach(function (r, i) { r.classList.toggle('on', i === cur); }); }
  function go(r) {
    if (!r) return;
    if (r.dataset.w) {
      window.open('https://www.google.com/search?q=' + encodeURIComponent(input.value.trim()), '_blank', 'noopener');
      close(); return;
    }
    if (r.dataset.u) { window.open(r.dataset.u, '_blank', 'noopener'); close(); return; }
    close();
    location.hash = '#' + r.dataset.p;
  }
  btn.addEventListener('click', open);
  ui.querySelectorAll('[data-bmxs-close]').forEach(function (el) { el.addEventListener('click', close); });
  input.addEventListener('input', function () { render(input.value); });
  document.addEventListener('keydown', function (e) {
    var isOpen = ui.classList.contains('open');
    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); isOpen ? close() : open(); return; }
    if (!isOpen) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowDown') { cur = Math.min(cur + 1, rows.length - 1); mark(); rows[cur] && rows[cur].scrollIntoView({ block: 'nearest' }); e.preventDefault(); }
    if (e.key === 'ArrowUp') { cur = Math.max(cur - 1, 0); mark(); rows[cur] && rows[cur].scrollIntoView({ block: 'nearest' }); e.preventDefault(); }
    if (e.key === 'Enter') { go(rows[cur]); e.preventDefault(); }
  });
})();

/* ---- the second book tilts like the first ---- */
(function () {
  var book = document.getElementById('fwBook');
  if (!book) return;
  var stage = book.closest('.pb-stage') || book.parentNode;
  if (!(window.matchMedia && window.matchMedia('(hover:hover)').matches)) return;
  stage.addEventListener('mousemove', function (e) {
    var r = stage.getBoundingClientRect();
    var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    var ry = 26 + (px - 0.5) * 42, rx = 8 - (py - 0.5) * 22;
    book.style.animation = 'none';
    book.style.transform = 'rotateX(' + rx.toFixed(1) + 'deg) rotateY(' + ry.toFixed(1) + 'deg)';
  });
  stage.addEventListener('mouseleave', function () { book.style.transform = ''; book.style.animation = ''; });
})();

/* ---- what is inside the 52 ---- */
(function () {
  var btn = document.getElementById('bmxInsideBtn');
  var ui = document.getElementById('bmxInside');
  if (!btn || !ui) return;
  var vid = document.getElementById('bmxInsideVid');
  function open() { ui.classList.add('open'); document.documentElement.style.overflow = 'hidden'; }
  function close() {
    ui.classList.remove('open');
    document.documentElement.style.overflow = '';
    if (vid && !vid.paused) vid.pause();
  }
  btn.addEventListener('click', open);
  ui.querySelectorAll('[data-bmxm-close]').forEach(function (el) { el.addEventListener('click', close); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && ui.classList.contains('open')) close(); });
})();

/* ---- the live product panels: scale the document into the frame, then move it ---- */
(function () {
  var panels = [].slice.call(document.querySelectorAll('.bmx-scr--live'));
  if (!panels.length) return;
  var slow = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function fit(p) {
    var stage = p.querySelector('.bmx-scr-stage');
    var fr = p.querySelector('.bmx-scr-if');
    if (!stage || !fr) return;
    var w = stage.clientWidth;
    var fw = parseFloat(getComputedStyle(fr).width) || 1340;
    var k = w / fw;
    fr.style.transform = 'scale(' + k.toFixed(4) + ')';
    fr.style.height = Math.ceil(stage.clientHeight / k) + 'px';
  }

  panels.forEach(function (p) {
    var fr = p.querySelector('.bmx-scr-if');
    if (!fr) return;
    var mode = p.dataset.bmxMode || 'roll';
    var live = false, t = null, sec = 0, y = 0;

    /* B9, 17 Sep: the live document is 830 KB / 2.2 MB, and loading="lazy" did not
       keep Chrome from fetching both on every Home load. The path is in data-src
       and only becomes the iframe's src when the panel comes near the viewport.
       Everything below (the load handler, fit, the motion observer) is unchanged. */
    if (!fr.getAttribute('src') && fr.getAttribute('data-src')) {
      bmxArmOnApproach(p, 500, function () {
        fr.setAttribute('src', fr.getAttribute('data-src'));
      });
    }

    fr.addEventListener('load', function () {
      fit(p);
      var doc = null;
      try { doc = fr.contentDocument; } catch (e) { doc = null; }
      if (!doc) return;
      try { doc.documentElement.style.scrollBehavior = 'auto'; } catch (e) {}
      /* pass 25: the module's own section clicks called scrollIntoView, which walks up and
         scrolls this page to the panel every few seconds. The child keeps its scrolling. */
      try {
        var cw = fr.contentWindow;
        cw.Element.prototype.scrollIntoView = function () {};
        var _focus = cw.HTMLElement.prototype.focus;
        cw.HTMLElement.prototype.focus = function (o) { return _focus.call(this, Object.assign({ preventScroll: true }, o || {})); };
      } catch (e) {}
      if (slow) return;

      function step() {
        if (!live) return;
        var win = fr.contentWindow;
        var h = 0;
        try { h = doc.documentElement.scrollHeight - win.innerHeight; } catch (e) { return; }
        if (h > 40) {
          y += 1.5;
          if (y > h) y = 0;
          try { win.scrollTo(0, y); } catch (e) {}
        }
        t = requestAnimationFrame(step);
      }

      function nextSection() {
        if (!live) return;
        // the 52 module lists its sections, the education module uses chapter dots
        var items = doc.querySelectorAll('.sn-item');
        if (!items.length) items = doc.querySelectorAll('.chap-dot');
        if (items.length) {
          sec = (sec + 1) % Math.min(items.length, 24);
          try { items[sec].click(); } catch (e) {}
          y = 0;
          try { fr.contentWindow.scrollTo(0, 0); } catch (e) {}
        }
        setTimeout(nextSection, 4200);
      }

      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting && !live) {
            live = true;
            t = requestAnimationFrame(step);
            if (mode === 'sections') setTimeout(nextSection, 7000);
          } else if (!e.isIntersecting && live) {
            live = false;
            if (t) cancelAnimationFrame(t);
          }
        });
      }, { rootMargin: '120px' });
      io.observe(p);
    });

    window.addEventListener('resize', function () { fit(p); });
    fit(p);
  });
})();

/* ---- pass 22 (Bazil): the word on a dropdown trigger is a link to its page; only the
   chevron opens the menu. Capture phase, so it runs before the site's own pin toggle. ---- */
document.addEventListener('click', function (e) {
  var trg = e.target.closest('.nav-dd-trigger'); if (!trg) return;
  if (e.target.closest('.cv')) return;
  var dd = trg.closest('.nav-dd'); var all = dd && dd.querySelector('.bmdd-all[data-page]'); if (!all) return;
  e.preventDefault(); e.stopPropagation();
  dd.classList.remove('open'); trg.setAttribute('aria-expanded', 'false');
  all.click();
}, true);

/* ---- the leadership rail: drag to scroll, like the old one ---- */
document.querySelectorAll('.leadgrid.bmx-rail').forEach(function (rail) {
  var down = false, x0 = 0, s0 = 0;
  rail.addEventListener('pointerdown', function (e) {
    down = true; x0 = e.clientX; s0 = rail.scrollLeft;
    rail.classList.add('is-drag');
  });
  rail.addEventListener('pointermove', function (e) {
    if (!down) return;
    rail.scrollLeft = s0 - (e.clientX - x0);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) {
    rail.addEventListener(ev, function () { down = false; rail.classList.remove('is-drag'); });
  });
});

/* ---- pass 22 (Bazil): the leadership rail drifts on its own again. Slow, seamless
   (the set is cloned once), pauses under the pointer, on drag, on focus and off screen. ---- */
document.querySelectorAll('.leadgrid.bmx-rail').forEach(function (rail) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var kids = [].slice.call(rail.children); if (kids.length < 3) return;
  kids.forEach(function (k) {
    var c = k.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.classList.add('bmx-rail-clone');
    c.classList.remove('rv'); c.classList.add('in'); c.querySelectorAll('.rv').forEach(function (x) { x.classList.remove('rv'); x.classList.add('in'); });
    rail.appendChild(c);
  });
  rail.classList.add('is-auto');
  rail.style.scrollBehavior = 'auto'; /* the rail's smooth scroll-behavior swallowed the per-frame writes */
  var hold = false, raf = 0, prev = 0, SPEED = 24, pos = rail.scrollLeft;
  function tick(ts) {
    raf = requestAnimationFrame(tick);
    if (!prev) { prev = ts; return; }
    var dt = Math.min(64, ts - prev); prev = ts;
    if (hold || document.hidden) return;
    var h = rail.scrollWidth / 2; if (h <= rail.clientWidth) return;
    /* the position is kept as a float: scrollLeft rounds, and a 0.4px step read back
       from it would round to where it started, so the rail never moved */
    pos += SPEED * dt / 1000; if (pos >= h) pos -= h;
    rail.scrollLeft = pos;
  }
  rail.addEventListener('scroll', function () { if (Math.abs(rail.scrollLeft - pos) > 1.5) pos = rail.scrollLeft; }, { passive: true });
  ['pointerenter', 'pointerdown', 'focusin', 'touchstart'].forEach(function (ev) { rail.addEventListener(ev, function () { hold = true; }, { passive: true }); });
  ['pointerleave', 'focusout'].forEach(function (ev) { rail.addEventListener(ev, function () { hold = false; prev = 0; }, { passive: true }); });
  new IntersectionObserver(function (en) {
    en.forEach(function (x) { if (x.isIntersecting) { if (!raf) raf = requestAnimationFrame(tick); } else { cancelAnimationFrame(raf); raf = 0; prev = 0; } });
  }).observe(rail);
});

/* ---- Work hub panels: cycle the real work, one frame at a time ---- */
document.querySelectorAll('.bmx-reel').forEach(function (reel) {
  var frames = [].slice.call(reel.querySelectorAll('.bmx-reel-f'));
  if (frames.length < 2) { if (frames[0]) frames[0].classList.add('on'); return; }
  var i = 0, t = null, live = false;
  frames[0].classList.add('on');
  function tick() {
    frames[i].classList.remove('on');
    i = (i + 1) % frames.length;
    frames[i].classList.add('on');
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting && !live) { live = true; t = setInterval(tick, 2600); }
      else if (!e.isIntersecting && live) { live = false; clearInterval(t); }
    });
  }, { rootMargin: '100px' });
  io.observe(reel);
  reel.closest('.bmx-panel') && reel.closest('.bmx-panel').addEventListener('mouseenter', function () { clearInterval(t); });
  reel.closest('.bmx-panel') && reel.closest('.bmx-panel').addEventListener('mouseleave', function () { if (live) t = setInterval(tick, 2600); });
});

/* ---- the mascot loop: same play pattern as the hero video ---- */
document.querySelectorAll('.bmx-pv video').forEach(function (v) {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { v.pause(); return; }
  v.muted = true;
  function go() {
    if (document.hidden || !v.closest('.pg.on')) return;
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }
  document.addEventListener('visibilitychange', go);
  addEventListener('hashchange', function () { setTimeout(go, 80); });
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-page="work"]')) setTimeout(go, 120);
  });
  new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) go(); else v.pause(); });
  }, { rootMargin: '200px' }).observe(v);
  go();
  setTimeout(go, 900);
});

/* ---- B9, 17 Sep: heavy videos preload nothing until they are near the viewport ----
   The results webm is 21 MB. preload="metadata" on a webm with a #t=1 fragment made
   Chrome download the whole file on every Home load. The markup now says
   preload="none" data-bmx-preload="metadata"; the moment the block comes near the
   viewport the preload level is raised and load() is called, so the poster frame is
   there by the time it is looked at. Click to play is untouched. */
document.querySelectorAll('video[data-bmx-preload]').forEach(function (v) {
  bmxArmOnApproach(v, 300, function () {
    var lvl = v.getAttribute('data-bmx-preload');
    if (!lvl) return;
    v.removeAttribute('data-bmx-preload');
    v.setAttribute('preload', lvl);
    try { v.load(); } catch (e) {}
  });
});

/* ============================================================================
   B6, 17 Sep: the two lead magnet forms

   The fine print under both blocks promises an emailed link, so the forms
   validate, report, and hand off. They do not send anything: there is exactly
   one hook, and it is the only thing a developer has to replace.

       window.__bmxLeadSubmit = function (lead) {
         // lead = { list, name, email, form }
         //   list  "brand-growth-playbook" | "52-frameworks"  (the form's data-bmx-lead)
         //   name   trimmed first name
         //   email  trimmed, lower-cased address
         //   form   the <form> element, if you need anything else off it
         // Return a promise. Resolve and the success state shows; reject and the
         // visitor is told to try again, with the fields still filled in.
         return fetch('/api/lead', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ list: lead.list, name: lead.name, email: lead.email })
         }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
       };

   Define it before this layer loads, or at any point afterwards: the forms read
   window.__bmxLeadSubmit at submit time, so a later assignment wins. Until one
   exists the stub below resolves without sending, and says so in the console.
   ========================================================================== */
(function () {
  var forms = [].slice.call(document.querySelectorAll('form[data-bmx-lead]'));
  if (!forms.length) return;

  /* the placeholder. It never sends and never pretends to have sent. */
  function stub(lead) {
    if (window.console && console.info) {
      console.info('[brandmethod] No window.__bmxLeadSubmit is defined, so nothing was '
        + 'sent. Replace the hook to deliver the ' + lead.list + ' link. '
        + 'The form is documented in tools/live-0916.js and HANDOVER.md.');
    }
    return Promise.resolve({ delivered: false, stub: true });
  }

  /* deliberately permissive: one @, a dot in the domain, no spaces. Real
     validation is the confirmation email, not a regex. */
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  forms.forEach(function (form) {
    var list = form.getAttribute('data-bmx-lead') || 'lead';
    var name = form.querySelector('input[name="name"]');
    var mail = form.querySelector('input[name="email"]');
    var btn = form.querySelector('button[type="submit"]');
    var out = form.querySelector('.pb-status');
    if (!name || !mail || !btn || !out) return;
    var label = btn.innerHTML;
    var busy = false;

    function say(kind, text) {
      out.hidden = false;
      out.textContent = text;
      form.setAttribute('data-bmx-state', kind);
    }
    function clear(input) {
      input.removeAttribute('aria-invalid');
      input.classList.remove('is-bad');
    }
    function bad(input, text) {
      input.setAttribute('aria-invalid', 'true');
      input.classList.add('is-bad');
      say('error', text);
      try { input.focus(); } catch (e) {}
      return false;
    }
    [name, mail].forEach(function (i) {
      i.addEventListener('input', function () {
        clear(i);
        if (form.getAttribute('data-bmx-state') === 'error') {
          out.hidden = true;
          form.removeAttribute('data-bmx-state');
        }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (busy) return;
      var n = (name.value || '').trim();
      var m = (mail.value || '').trim().toLowerCase();
      clear(name); clear(mail);
      if (n.length < 2) return bad(name, 'Add your first name so we know who to write to.');
      if (!EMAIL.test(m)) return bad(mail, 'That email address does not look right.');

      busy = true;
      btn.disabled = true;
      btn.innerHTML = 'Sending';
      say('busy', 'Sending.');

      var hook = typeof window.__bmxLeadSubmit === 'function' ? window.__bmxLeadSubmit : stub;
      var job;
      try {
        job = hook({ list: list, name: n, email: m, form: form });
      } catch (err) {
        job = Promise.reject(err);
      }
      Promise.resolve(job).then(function (res) {
        form.setAttribute('data-bmx-state', 'done');
        out.hidden = false;
        /* the stub resolves with delivered:false. Telling a visitor the file is
           on its way when no mailer is wired would be a promise nobody keeps. */
        if (res && res.delivered === false) {
          out.textContent = 'Saved: ' + m + '. This prototype is not connected to the '
            + 'mailer yet, so nothing has been sent.';
        } else {
          out.textContent = 'On its way to ' + m + '. Check your inbox, and your spam folder '
            + 'if it is not there in a few minutes.';
        }
        /* the fields and the button go: the block has done its job */
        name.hidden = true; mail.hidden = true; btn.hidden = true;
      }, function (err) {
        busy = false;
        btn.disabled = false;
        btn.innerHTML = label;
        say('error', 'That did not go through. Try again in a moment.');
        if (window.console && console.warn) console.warn('[brandmethod] lead hook failed', err);
      });
    });
  });
})();

/* the hero loop: browsers drop muted autoplay more often than the spec suggests,
   so it is kicked on load, when the tab comes back, and on the first gesture. */
(function(){
  var v=document.querySelector('.bmx-hero-vid'); if(!v) return;
  var tries=0;
  function kick(){
    if(!v.paused||tries>24) return;
    tries++;
    var p=v.play();
    if(p&&p.catch) p.catch(function(){});
  }
  kick();
  v.addEventListener('loadeddata',kick);
  v.addEventListener('canplay',kick);
  document.addEventListener('visibilitychange',function(){ if(!document.hidden) kick(); });
  ['pointerdown','touchstart','keydown','scroll'].forEach(function(e){
    window.addEventListener(e,kick,{once:false,passive:true});
  });
  setInterval(function(){ if(!document.hidden) kick(); },1500);
})();

/* The admin bar's height changes with the viewport, but the page offset was a
   fixed 57px, so a white strip showed between the bar and the hero. The real
   height is measured and published as --bmx-bar. */
(function () {
  var bar = document.querySelector('.bmws');
  if (!bar) return;
  function sync() {
    /* offsetHeight is layout pixels and includes the border. getBoundingClientRect
       is multiplied by the html{zoom} ramp, and writing that into a CSS length
       zooms it a second time, which is what left a few white pixels showing. */
    var h = bar.offsetHeight || Math.ceil(bar.getBoundingClientRect().height);
    if (h > 0) document.documentElement.style.setProperty('--bmx-bar', h + 'px');
  }
  sync();
  window.addEventListener('resize', sync, { passive: true });
  window.addEventListener('load', sync);
  if (typeof ResizeObserver === 'function') new ResizeObserver(sync).observe(bar);
})();

/* ---- pass 22: the promise cards flip on tap and on Enter, not only on hover ---- */
(function () {
  var hoverable = matchMedia('(hover: hover)').matches;
  document.addEventListener('click', function (e) {
    var c = e.target.closest('.gcard'); if (!c) return;
    if (hoverable && !e.target.closest('.gcard-hint')) return;
    c.classList.toggle('is-flipped');
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var c = e.target.closest('.gcard'); if (!c) return;
    e.preventDefault(); c.classList.toggle('is-flipped');
  });
})();

/* ---- pass 22: the History journey. Progress line, active year, parallax photos. ---- */
document.querySelectorAll('.bmx-jour').forEach(function (root) {
  var chapters = [].slice.call(root.querySelectorAll('.bmx-jour-ch'));
  var marks = [].slice.call(root.querySelectorAll('.bmx-jour-mark'));
  var big = root.querySelector('.bmx-jour-big'), line = root.querySelector('.bmx-jour-fill');
  var figs = [].slice.call(root.querySelectorAll('.bmx-jour-fig img'));
  var body = root.querySelector('.bmx-jour-body');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!chapters.length || !body) return;
  var cur = -1;
  function setActive(i) {
    if (i === cur) return; cur = i;
    marks.forEach(function (m, k) { m.classList.toggle('on', k === i); });
    if (big) { big.textContent = chapters[i].getAttribute('data-year'); big.classList.remove('tick'); void big.offsetWidth; big.classList.add('tick'); }
  }
  new IntersectionObserver(function (en) {
    en.forEach(function (x) { if (x.isIntersecting) x.target.classList.add('in'); });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 }).observe && chapters.forEach(function (c) {
    new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) x.target.classList.add('in'); }); }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 }).observe(c);
  });
  var ticking = false;
  function frame() {
    ticking = false;
    var vh = innerHeight, r = body.getBoundingClientRect();
    if (!r.height) return;
    var prog = Math.min(1, Math.max(0, (vh * 0.5 - r.top) / r.height));
    if (line) line.style.transform = 'scaleY(' + prog + ')';
    var best = 0, bd = 1e9;
    chapters.forEach(function (c, k) { var b = c.getBoundingClientRect(); var d = Math.abs((b.top + b.height * 0.35) - vh * 0.45); if (d < bd) { bd = d; best = k; } });
    setActive(best);
    if (!reduce) figs.forEach(function (img) {
      var b = img.parentElement.getBoundingClientRect(); if (b.bottom < -80 || b.top > vh + 80) return;
      var p = (b.top + b.height / 2 - vh / 2) / vh;
      img.style.transform = 'translateY(' + (p * -22).toFixed(2) + '%) scale(1.22)';
    });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('scroll', onScroll, { passive: true, capture: true });
  addEventListener('resize', onScroll);
  addEventListener('hashchange', function () { setTimeout(frame, 60); });
  marks.forEach(function (m, k) { m.addEventListener('click', function () { chapters[k].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); }); });
  frame();
});

/* ---- pass 23: the principles as a 3D point cloud (canvas, no library). Six forms, one
   per principle, ~5000 points that morph between them with a staggered ease, a slow
   turn, pointer parallax, depth-shaded brand blue on white. rAF gated to visibility. ---- */
(function () {
  var stage = document.querySelector('.bmx-core-3d'); if (!stage) return;
  var root = stage.closest('.bmx-core'), cv = stage.querySelector('canvas'); if (!root || !cv) return;
  var ctx = cv.getContext('2d'); if (!ctx) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var N = 5200, R = 220;
  var SHAPES = [
    function (c) { c.lineWidth = 12; c.beginPath(); c.arc(50, 50, 40, 0, Math.PI * 2); c.stroke(); c.lineWidth = 13; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(31, 51); c.lineTo(44, 64); c.lineTo(70, 36); c.stroke(); },
    function (c) { c.fillRect(14, 58, 16, 34); c.fillRect(42, 40, 16, 52); c.fillRect(70, 18, 16, 74); c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(12, 44); c.lineTo(38, 26); c.lineTo(56, 34); c.lineTo(84, 8); c.stroke(); },
    function (c) { c.beginPath(); c.moveTo(50, 88); c.bezierCurveTo(22, 66, 8, 50, 8, 32); c.arc(29, 32, 21, Math.PI, 0); c.arc(71, 32, 21, Math.PI, 0); c.bezierCurveTo(92, 50, 78, 66, 50, 88); c.closePath(); c.fill(); },
    function (c) { c.beginPath(); c.moveTo(58, 4); c.lineTo(20, 56); c.lineTo(44, 56); c.lineTo(38, 96); c.lineTo(80, 42); c.lineTo(54, 42); c.closePath(); c.fill(); },
    function (c) { c.beginPath(); c.moveTo(18, 8); c.lineTo(82, 8); c.lineTo(82, 16); c.lineTo(56, 50); c.lineTo(82, 84); c.lineTo(82, 92); c.lineTo(18, 92); c.lineTo(18, 84); c.lineTo(44, 50); c.lineTo(18, 16); c.closePath(); c.fill(); },
    function (c) { c.beginPath(); c.moveTo(50, 4); c.quadraticCurveTo(54, 46, 96, 50); c.quadraticCurveTo(54, 54, 50, 96); c.quadraticCurveTo(46, 54, 4, 50); c.quadraticCurveTo(46, 46, 50, 4); c.closePath(); c.fill(); }
  ];
  function sample(draw) {
    var off = document.createElement('canvas'); off.width = off.height = R; var c = off.getContext('2d');
    c.clearRect(0, 0, R, R); c.fillStyle = c.strokeStyle = '#000'; c.save(); c.scale(R / 100, R / 100); draw(c); c.restore();
    var d = c.getImageData(0, 0, R, R).data, px = [];
    for (var y = 0; y < R; y++) for (var x = 0; x < R; x++) if (d[(y * R + x) * 4 + 3] > 90) px.push(x, y);
    var out = new Float32Array(N * 3), n = px.length / 2;
    for (var i = 0; i < N; i++) { var k = (Math.random() * n) | 0; var sx = (px[k * 2] + Math.random()) / R * 2 - 1, sy = (px[k * 2 + 1] + Math.random()) / R * 2 - 1; var rr = Math.min(1, sx * sx + sy * sy); out[i * 3] = sx; out[i * 3 + 1] = sy; out[i * 3 + 2] = (Math.random() - .5) * .16 + (1 - rr) * .12 * (Math.random() < .5 ? 1 : -1); }
    return out;
  }
  var forms = SHAPES.map(sample);
  var pos = new Float32Array(forms[0]), from = new Float32Array(forms[0]), to = forms[0];
  var delay = new Float32Array(N); for (var i = 0; i < N; i++) delay[i] = Math.random() * .38;
  var glow = new Uint8Array(N); for (var g = 0; g < N; g++) glow[g] = Math.random() < .14 ? 1 : 0;
  var morphT = 2, DUR = 1.05, mx = 0, my = 0, tmx = 0, tmy = 0, raf = 0, last = 0, spin = 0, W = 0, H = 0, dpr = 1;
  function fit() { var r = stage.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height); dpr = Math.min(2, devicePixelRatio || 1); cv.width = W * dpr; cv.height = H * dpr; draw(0); }
  function ease(t) { return t < 0 ? 0 : t > 1 ? 1 : 1 - Math.pow(1 - t, 3); }
  function draw(dt) {
    if (!reduce) spin += dt * .22; mx += (tmx - mx) * .06; my += (tmy - my) * .06;
    var ry = spin + mx * .55, rx = -my * .35, cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx);
    var half = Math.min(W, H) / 2, size = half * .74, ox = W / 2, oy = H / 2;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    ctx.save(); ctx.translate(ox, oy); ctx.rotate(spin * .12); ctx.setLineDash([2, 9]); ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(26,38,222,.2)'; ctx.beginPath(); ctx.arc(0, 0, half * .96, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    var m = morphT < DUR + .4;
    for (var i = 0; i < N; i++) {
      var i3 = i * 3;
      if (m) { var e = ease((morphT - delay[i]) / DUR); pos[i3] = from[i3] + (to[i3] - from[i3]) * e; pos[i3 + 1] = from[i3 + 1] + (to[i3 + 1] - from[i3 + 1]) * e; pos[i3 + 2] = from[i3 + 2] + (to[i3 + 2] - from[i3 + 2]) * e; }
      var x = pos[i3], y = pos[i3 + 1], z = pos[i3 + 2];
      var x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
      var y1 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;
      var p = 1 / (1 + z2 * .55), px = ox + x1 * size * p, py = oy + y1 * size * p;
      var d = (z2 + .3) / .6; if (d < 0) d = 0; if (d > 1) d = 1;
      var a = .32 + .62 * d, s = (1.4 + 1.6 * d) * p;
      if (glow[i]) { ctx.fillStyle = 'rgba(26,38,222,' + (.05 * d).toFixed(3) + ')'; ctx.beginPath(); ctx.arc(px, py, s * 3.4, 0, 6.2832); ctx.fill(); }
      ctx.fillStyle = 'rgba(' + (26 + (1 - d) * 120 | 0) + ',' + (38 + (1 - d) * 110 | 0) + ',' + (222 + (1 - d) * 20 | 0) + ',' + a.toFixed(3) + ')';
      ctx.fillRect(px - s / 2, py - s / 2, s, s);
    }
  }
  function frame(ts) {
    raf = requestAnimationFrame(frame);
    var dt = last ? Math.min(.05, (ts - last) / 1000) : 0; last = ts; morphT += dt;
    draw(dt);
  }
  root.__set3d = function (i) { if (!forms[i]) return; from.set(pos); to = forms[i]; morphT = 0; if (reduce) { pos.set(to); morphT = 9; draw(0); } };
  stage.addEventListener('pointermove', function (e) { var r = stage.getBoundingClientRect(); tmx = (e.clientX - r.left) / r.width * 2 - 1; tmy = (e.clientY - r.top) / r.height * 2 - 1; });
  stage.addEventListener('pointerleave', function () { tmx = 0; tmy = 0; });
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(stage); else addEventListener('resize', fit);
  fit();
  new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting && !reduce) { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } } else { cancelAnimationFrame(raf); raf = 0; } }); }).observe(stage);
})();

/* ---- pass 22: the principles core. Hover or focus selects, click pins, idle cycles. ---- */
document.querySelectorAll('.bmx-core').forEach(function (root) {
  var data; try { data = JSON.parse(root.getAttribute('data-principles')); } catch (e) { return; }
  var items = [].slice.call(root.querySelectorAll('.bmx-core-list button, .bmx-orbit-node'));
  var spokes = [].slice.call(root.querySelectorAll('.bmx-orbit-spoke'));
  var orbit = root.querySelector('.bmx-orbit');
  function placeNodes() {
    if (!orbit) return;
    root.querySelectorAll('.bmx-orbit-node').forEach(function (n) {
      var k = +n.getAttribute('data-i'), a = (-90 + k * 60) * Math.PI / 180;
      n.style.left = (50 + Math.cos(a) * 44) + '%'; n.style.top = (50 + Math.sin(a) * 44) + '%';
      var sp = spokes[k]; if (sp) { sp.setAttribute('x2', (50 + Math.cos(a) * 40).toFixed(2)); sp.setAttribute('y2', (50 + Math.sin(a) * 40).toFixed(2)); }
    });
  }
  placeNodes(); addEventListener('resize', placeNodes);
  var nodes = [].slice.call(root.querySelectorAll('.bmx-core-node'));
  var segs = [].slice.call(root.querySelectorAll('.bmx-core-seg'));
  var num = root.querySelector('.bmx-core-num'), ttl = root.querySelector('.bmx-core-title'), desc = root.querySelector('.bmx-core-desc');
  var lead = root.querySelector('.bmx-core-lead'), label = root.querySelector('.bmx-core-label');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var i = -1, pinned = false, timer = 0;
  function go(n) {
    n = (n + data.length) % data.length; if (n === i) return; i = n;
    items.forEach(function (b, k) { b.classList.toggle('on', k === i); b.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
    nodes.forEach(function (g, k) { g.classList.toggle('on', k === i); });
    segs.forEach(function (s, k) { s.classList.toggle('on', k === i); });
    spokes.forEach(function (s, k) { s.classList.toggle('on', k === i); });
    if (lead) lead.style.transform = 'rotate(' + (i * 60 + 30) + 'deg)';
    if (label) { label.classList.remove('swap'); void label.offsetWidth; label.classList.add('swap'); }
    num.textContent = i + 1; ttl.textContent = data[i][0]; desc.textContent = data[i][1];
    if (root.__set3d) root.__set3d(i);
    root.querySelectorAll('.bmx-core-lico').forEach(function (e, k) { e.classList.toggle('on', k === i); });
    var say = root.querySelector('.bmx-core-say'); if (say) { var sn = say.querySelector('.bmx-core-say-n b'); if (sn) sn.textContent = i + 1; say.classList.remove('swap'); void say.offsetWidth; say.classList.add('swap'); }
  }
  function auto() { clearInterval(timer); if (reduce || pinned) return; timer = setInterval(function () { if (!root.matches(':hover')) go(i + 1); }, 4200); }
  items.forEach(function (b, k) {
    b.addEventListener('mouseenter', function () { if (!pinned) go(k); });
    b.addEventListener('focus', function () { if (!pinned) go(k); });
    b.addEventListener('click', function () { pinned = !(pinned && k === i); go(k); auto(); });
  });
  nodes.forEach(function (g, k) {
    g.addEventListener('mouseenter', function () { if (!pinned) go(k); });
    g.addEventListener('click', function () { pinned = !(pinned && k === i); go(k); auto(); });
    g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pinned = true; go(k); auto(); } });
  });
  segs.forEach(function (s, k) { s.addEventListener('mouseenter', function () { if (!pinned) go(k); }); });
  go(0); auto();
  new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) auto(); else clearInterval(timer); }); }).observe(root);
});

/* ---- pass 22: the Methodas chip flips on a press, as it does on the Methodas site ---- */
document.addEventListener('click', function (e) {
  if (e.target.closest('a')) return;
  var st = e.target.closest('.bmx-cart .chip-stage'); if (!st) return;
  var b = st.querySelector('.c15-body'); if (b) b.classList.toggle('flipped');
});

/* ---- pass 22: the chip stage scales to its slot. Measured in JS so it holds in every browser. ---- */
(function () {
  var carts = [].slice.call(document.querySelectorAll('.bmx-cart')); if (!carts.length) return;
  function fit(c) { var w = c.clientWidth; if (w) c.style.setProperty('--k', (w / 290).toFixed(4)); }
  carts.forEach(fit);
  if ('ResizeObserver' in window) { var ro = new ResizeObserver(function (en) { en.forEach(function (x) { fit(x.target); }); }); carts.forEach(function (c) { ro.observe(c); }); }
  addEventListener('resize', function () { carts.forEach(fit); });
  addEventListener('load', function () { carts.forEach(fit); });
})();

/* ---- pass 23: the loading screen shows the wordmark only at the end ---- */
(function () {
  var l = document.getElementById('loader'); if (!l) return;
  setTimeout(function () { l.classList.add('bmx-late'); }, 2000);
})();

/* ---- 18 Sep: the role rows animate open and closed, one at a time ---- */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function closeRole(d) {
    if (!d.open) return;
    d.classList.remove('is-open');
    if (reduce) { d.open = false; return; }
    var body = d.querySelector('.bmx-role-body'), done = false;
    function end() { if (done) return; done = true; body.removeEventListener('transitionend', end); if (!d.classList.contains('is-open')) d.open = false; }
    body.addEventListener('transitionend', end); setTimeout(end, 700);
  }
  function openRole(d) {
    document.querySelectorAll('details.bmx-role[open]').forEach(function (o) { if (o !== d) closeRole(o); });
    d.open = true;
    requestAnimationFrame(function () { requestAnimationFrame(function () { d.classList.add('is-open'); }); });
  }
  document.addEventListener('click', function (e) {
    var sum = e.target.closest('details.bmx-role > summary'); if (!sum) return;
    e.preventDefault();
    var d = sum.parentElement;
    if (d.open && d.classList.contains('is-open')) closeRole(d); else openRole(d);
  });
})();

/* ---- 18 Sep: the stair drifts against the scroll, each still at its own rate ---- */
(function () {
  var st = document.querySelector('.bmx-stair'); if (!st) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var tiles = [].slice.call(st.querySelectorAll('.bmx-stair-t')), t = false;
  function frame() {
    t = false;
    if (innerWidth <= 900) { tiles.forEach(function (x) { x.style.marginTop = ''; }); return; }
    var r = st.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
    var p = (innerHeight / 2 - (r.top + r.height / 2)) / innerHeight;
    tiles.forEach(function (x, k) { x.style.marginTop = (p * (k + 1) * 14).toFixed(1) + 'px'; });
  }
  function on() { if (!t) { t = true; requestAnimationFrame(frame); } }
  addEventListener('scroll', on, { passive: true }); document.addEventListener('scroll', on, { passive: true, capture: true }); addEventListener('resize', on); frame();
})();

/* ---- 18 Sep: the pictures in the sentence drift against the scroll, alternating direction ---- */
(function () {
  var tiles = [].slice.call(document.querySelectorAll('.bmx-wordh .bmx-wimg')); if (!tiles.length) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var t = false;
  function frame() {
    t = false; var vh = innerHeight;
    tiles.forEach(function (x, k) {
      var r = x.getBoundingClientRect(); if (r.bottom < -100 || r.top > vh + 100) return;
      var p = (r.top + r.height / 2 - vh / 2) / vh;
      var d = (k % 2 ? 1 : -1) * p * 48;
      x.style.translate = '0 ' + d.toFixed(1) + 'px';
      x.style.rotate = ((k % 2 ? -1 : 1) * p * 2.4).toFixed(2) + 'deg';
    });
  }
  function on() { if (!t) { t = true; requestAnimationFrame(frame); } }
  addEventListener('scroll', on, { passive: true }); document.addEventListener('scroll', on, { passive: true, capture: true }); addEventListener('resize', on); addEventListener('load', on); frame();
})();

/* ---- 18 Sep: the words of the sentence wake as they scroll into view ---- */
(function () {
  var h1 = document.querySelector('.bmx-wordh'); if (!h1) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var walker = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT), nodes = [], n;
  while ((n = walker.nextNode())) { if (n.nodeValue.trim() && !n.parentElement.closest('.bmx-wn')) nodes.push(n); }
  nodes.forEach(function (t) {
    var frag = document.createDocumentFragment(), parts = t.nodeValue.split(/(\s+)/);
    parts.forEach(function (pt) { if (!pt) return; if (/^\s+$/.test(pt)) { frag.appendChild(document.createTextNode(pt)); return; } var sp = document.createElement('span'); sp.className = 'bmx-ww'; sp.textContent = pt; frag.appendChild(sp); });
    t.parentNode.replaceChild(frag, t);
  });
  var words = [].slice.call(h1.querySelectorAll('.bmx-ww')), t = false;
  function frame() {
    t = false; var vh = innerHeight, lim = vh * 0.88, span = vh * 0.42;
    words.forEach(function (w) { var r = w.getBoundingClientRect(); var p = (lim - r.top) / span; p = p < 0 ? 0 : p > 1 ? 1 : p; w.style.setProperty('--o', (0.18 + 0.82 * p).toFixed(3)); });
  }
  function on() { if (!t) { t = true; requestAnimationFrame(frame); } }
  addEventListener('scroll', on, { passive: true }); document.addEventListener('scroll', on, { passive: true, capture: true }); addEventListener('resize', on); addEventListener('hashchange', function () { setTimeout(frame, 80); }); frame();
})();
