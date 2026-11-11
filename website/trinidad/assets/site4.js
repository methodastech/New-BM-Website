/* Trinidad Hospitality, Web Prototype 3. One page demo. Everything here is an enhancement: the page reads without it. */
(function(){
'use strict';
var D=document, W=window, R=D.documentElement;
var reduce = W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches;
var $=function(s,r){return (r||D).querySelector(s)}, $$=function(s,r){return Array.prototype.slice.call((r||D).querySelectorAll(s))};
var DATA = W.TH_DATA || {hotels:[],dests:[],map:[]};
var HOT = {}; DATA.hotels.forEach(function(h){ HOT[h.id]=h; });
var DST = {}; DATA.dests.forEach(function(d){ DST[d.id]=d; });

/* ---------- toast ---------- */
var toastT;
function toast(msg){ var t=$('#toast'); if(!t) return; t.textContent=msg; t.classList.add('on'); clearTimeout(toastT); toastT=setTimeout(function(){ t.classList.remove('on'); },3800); }

/* ---------- the demo lock: nothing leaves this page ---------- */
D.addEventListener('click', function(e){
  var a = e.target.closest ? e.target.closest('a,button') : null;
  if(!a) return;
  if(a.classList.contains('demo') || a.hasAttribute('data-demo')){
    e.preventDefault();
    var what = a.getAttribute('data-demo') || 'another page';
    toast('This demo is one page. In the full site this opens ' + what + '.');
    return;
  }
  if(a.tagName==='A'){
    var href=a.getAttribute('href')||'';
    if(href && href.charAt(0)!=='#'){ e.preventDefault(); toast('This demo is one page. Other pages open in the full site.'); }
  }
});

/* ---------- loading screen ---------- */
(function loader(){
  var el=$('#ld'); if(!el) return;
  var mark=$('#ldMark'), fill=$('#ldFill'), paths=mark?$$('.ld-draw path',mark):[];
  R.classList.add('is-loading');
  /* 5 Nov 2026 (Bazil: "quicker if we load fast"): the drawing follows the real load. Once the page is in, the crest finishes in about
     1.7 s and the screen leaves at 2.1 s; a slow load keeps drawing with the files, never past CAP. Before: a fixed 4.3 s hold. */
  var t0=performance.now(), MIN=1800, FAST=1400, CAP=5200, done=false, loaded=D.readyState==='complete', raf=0;
  /* a background tab gets no animation frames: once loaded it leaves at MIN by the clock, so the page is there when the tab is opened */
  W.addEventListener('load', function(){ loaded=true; if(D.hidden) setTimeout(dismiss, Math.max(320, MIN-(performance.now()-t0))); });
  function dismiss(){
    if(done) return; done=true; if(raf) cancelAnimationFrame(raf);
    el.classList.add('ld-done'); R.classList.remove('is-loading'); R.classList.add('ld-gone'); R.setAttribute('data-ld', Math.round(performance.now())); /* when the screen left, ms, for the checks */
    setTimeout(function(){ try{ if(W.ScrollTrigger) ScrollTrigger.refresh(); }catch(e){} },90);
    setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); },2000);
    try{ D.dispatchEvent(new CustomEvent('th:loaded')); }catch(e){}
  }
  el.addEventListener('click', dismiss);
  setTimeout(dismiss, CAP);
  if(reduce || !paths.length){ el.style.setProperty('--cf','1'); el.style.setProperty('--lines','0'); setTimeout(dismiss, 650); return; }
  function realProgress(){
    if(loaded) return 1;
    var imgs=D.images, tot=0, ok=0;
    for(var i=0;i<imgs.length;i++){ if(imgs[i].loading==='lazy') continue; tot++; if(imgs[i].complete) ok++; }
    var rs=D.readyState==='complete'?1:D.readyState==='interactive'?0.55:0.25;
    return Math.min(0.96, 0.35*rs + 0.65*(tot?ok/tot:1));
  }
  var N=paths.length, pd=0, last=0;
  function ss(t){ t=Math.max(0,Math.min(1,t)); return t*t*(3-2*t); }
  /* the longest lines start first; each takes 45% of the way, the whole drawing ends at 90% */
  function frame(){
    if(done) return; raf=requestAnimationFrame(frame);
    var t=performance.now()-t0, dt=Math.min(0.05,Math.max(0.001,(t-last)/1000)); last=t;
    var target=loaded?Math.min(1, t/FAST):Math.min(Math.max(realProgress(), 0.25), t/3400);
    pd+=(target-pd)*(1-Math.exp(-dt/(loaded?0.22:0.32))); if(pd>0.985) pd=1;
    for(var i=0;i<N;i++){ var d0=(i/N)*0.45; paths[i].style.strokeDashoffset=(1-ss((pd-d0)/0.45)).toFixed(4); }
    el.style.setProperty('--cf', ss((pd-0.42)/0.3).toFixed(3));
    el.style.setProperty('--sw', (100-58*ss((pd-0.5)/0.5)).toFixed(2)+'%'); /* one pass of light, settling just right of centre */
    el.style.setProperty('--lines', (1-0.8*ss((pd-0.8)/0.2)).toFixed(3));
    if(pd>=1 && loaded) setTimeout(dismiss, Math.max(320, MIN-(performance.now()-t0)));
  }
  raf=requestAnimationFrame(frame);
})();


/* ---------- the search: type a place or a hotel, results as you type, keyboard and touch ---------- */
(function find(){
  var inp=$('#pFind'), list=$('#pList'), plan=$('#plan'), where=$('#pWhere'); if(!inp||!list||!plan) return;
  var S=DATA.search||{}, rows=[], act=-1, picked=null;
  var dests=DATA.dests.map(function(d){ var n=d.hotels.length; return {k:'d',dest:d.id,title:d.label,sub:n+(n>1?' hotels':' hotel'),img:(HOT[d.hotels[0]]||{}).img,hay:(d.label+' '+(S[d.id]||'')).toLowerCase()}; });
  var hotels=DATA.hotels.map(function(h){ return {k:'h',id:h.id,dest:h.dest,title:h.name,sub:h.place+', '+h.brand,img:h.img,hay:(h.name+' '+h.place+' '+h.brand+' '+(S[h.dest]||'')).toLowerCase()}; });
  function match(q){ q=q.trim().toLowerCase(); if(!q) return dests.slice(); var t=q.split(/\s+/); function ok(r){ return t.every(function(x){ return r.hay.indexOf(x)>=0; }); } return dests.filter(ok).concat(hotels.filter(ok)); }
  function esc(x){ var e=D.createElement('span'); e.textContent=x; return e.innerHTML; }
  function open(){ rows=match(inp.value); act=-1;
    list.innerHTML = rows.length ? rows.map(function(r,i){ return '<button type="button" class="find-r" role="option" id="fr'+i+'" aria-selected="false" data-i="'+i+'"><img src="'+r.img+'" alt="" width="64" height="48"><span><b>'+esc(r.title)+'</b><small>'+esc(r.sub)+'</small></span></button>'; }).join('')
      : '<p class="find-none">Nothing for that. Try a place, like Melaka, or a hotel name.</p>';
    list.hidden=false; inp.setAttribute('aria-expanded','true'); inp.removeAttribute('aria-activedescendant'); }
  function close(){ list.hidden=true; inp.setAttribute('aria-expanded','false'); inp.removeAttribute('aria-activedescendant'); act=-1; }
  function mark(i){ act=i; $$('.find-r',list).forEach(function(b,k){ var on=k===i; b.classList.toggle('on',on); b.setAttribute('aria-selected',on?'true':'false'); if(on){ inp.setAttribute('aria-activedescendant',b.id); b.scrollIntoView({block:'nearest'}); } }); }
  function choose(r){ picked=r; setDest(r.dest); inp.value=r.title; close(); var go=$('.pgo',plan); if(go) go.focus(); }
  inp.addEventListener('focus',open);
  inp.addEventListener('click',function(){ if(list.hidden) open(); });
  inp.addEventListener('input',function(){ picked=null; if(!inp.value.trim()) setDest('all'); open(); });
  inp.addEventListener('keydown',function(e){
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){ e.preventDefault(); if(list.hidden) open(); if(rows.length) mark(e.key==='ArrowDown'?(act+1)%rows.length:(act-1+rows.length)%rows.length); }
    else if(e.key==='Enter'){ if(!list.hidden&&rows.length){ e.preventDefault(); choose(rows[act<0?0:act]); } }
    else if(e.key==='Escape'){ close(); }
  });
  list.addEventListener('pointerdown',function(e){ e.preventDefault(); });
  list.addEventListener('click',function(e){ var b=e.target.closest?e.target.closest('.find-r'):null; if(b) choose(rows[+b.getAttribute('data-i')]); });
  D.addEventListener('pointerdown',function(e){ if(!list.hidden&&!e.target.closest('.pf-wrap')) close(); });
  D.addEventListener('th:dest',function(e){ if(picked&&picked.dest===e.detail) return; picked=null; if(e.detail==='all'){ if(D.activeElement!==inp) inp.value=''; } else if(DST[e.detail]) inp.value=DST[e.detail].label; });
  /* Find a room: words typed but not picked take the first match; nothing found stays here and says so; a picked hotel is shown on arrival */
  plan.addEventListener('submit',function(e){
    var q=inp.value.trim();
    if(q&&!picked&&!(where&&DST[where.value]&&DST[where.value].label===q)){ var m=match(q); if(!m.length){ e.preventDefault(); e.stopImmediatePropagation(); inp.focus(); open(); return; } choose(m[0]); }
    close();
    if(picked&&picked.k==='h'){ var c=$('.hp[data-hotel="'+picked.id+'"]'); if(c){ c.classList.add('is-picked'); setTimeout(function(){ c.classList.remove('is-picked'); },3200); } }
  });
  $$('a[href="#find"]').forEach(function(a){ a.addEventListener('click',function(e){ e.preventDefault(); W.scrollTo({top:0,behavior:reduce?'auto':'smooth'}); inp.focus({preventScroll:true}); }); });
})();

/* ---------- Prototype 4: smooth scroll, the statement, the sliding lines ---------- */
(function p4(){
  var chips=$$('.chip');
  chips.forEach(function(c){ c.addEventListener('click',function(){ setDest(c.getAttribute('data-chip')); }); });
  D.addEventListener('th:dest',function(e){ chips.forEach(function(c){ c.classList.toggle('on',c.getAttribute('data-chip')===e.detail); }); });
  if(W.Lenis && !reduce){
    var lenis=new Lenis({lerp:.09,anchors:true}); W.__lenis=lenis;
    if(R.classList.contains('is-loading')){ lenis.stop(); D.addEventListener('th:loaded',function(){ lenis.start(); }); }
    if(W.gsap){ gsap.ticker.add(function(t){ lenis.raf(t*1000); }); gsap.ticker.lagSmoothing(0); if(W.ScrollTrigger) lenis.on('scroll',ScrollTrigger.update); }
    else { (function r(t){ lenis.raf(t); requestAnimationFrame(r); })(0); }
  }
  if(!W.gsap||!W.ScrollTrigger||reduce) return;
  gsap.registerPlugin(ScrollTrigger);
  var say=$('.say-t');
  if(say){
    (function split(n){ Array.prototype.slice.call(n.childNodes).forEach(function(c){
      if(c.nodeType===3){ var f=D.createDocumentFragment(); c.nodeValue.split(/(\s+)/).forEach(function(t){ if(!t) return; if(/^\s+$/.test(t)){ f.appendChild(D.createTextNode(' ')); return; } var s=D.createElement('span'); s.className='w'; s.textContent=t; f.appendChild(s); }); n.replaceChild(f,c); }
      else if(c.nodeType===1) split(c);
    }); })(say);
    gsap.fromTo($$('.w',say),{opacity:.14},{opacity:1,stagger:.12,ease:'none',scrollTrigger:{trigger:say,start:'top 80%',end:'bottom 55%',scrub:.4}});
  }
  var kin=$('.kin');
  if(kin){
    gsap.fromTo('.kin-row.a',{xPercent:-4},{xPercent:-26,ease:'none',immediateRender:false,scrollTrigger:{trigger:kin,start:'top bottom',end:'bottom top',scrub:.5}});
    gsap.fromTo('.kin-row.b',{xPercent:-26},{xPercent:-4,ease:'none',immediateRender:false,scrollTrigger:{trigger:kin,start:'top bottom',end:'bottom top',scrub:.5}});
    gsap.set('.kin-row.b',{xPercent:-26});
    /* the photograph changes with the names: in turn every 3.6 s while the band is on screen, and at once under a hovered or focused name */
    var imgs=$$('.kin-fig img',kin), cap=$('#kinCap'), btns=$$('.kin-row button',kin), ki=0, kt=null, kHover=false;
    function kShow(id){
      imgs.forEach(function(im,n){ var on=im.getAttribute('data-dest')===id; im.classList.toggle('on',on); if(on) ki=n; });
      btns.forEach(function(b){ b.classList.toggle('is-cur',b.getAttribute('data-pick')===id); });
      if(cap){ var b0=btns.filter(function(b){ return b.getAttribute('data-pick')===id; })[0]; if(b0) cap.textContent=b0.textContent; }
    }
    function kNext(){ if(kHover||D.hidden||!imgs.length||(kin.querySelector('.kin-fig.is-prev'))) return; kShow(imgs[(ki+1)%imgs.length].getAttribute('data-dest')); }
    function kStart(){ if(kt||reduce) return; kt=setInterval(kNext,3600); }
    function kStop(){ if(kt){ clearInterval(kt); kt=null; } }
    btns.forEach(function(b){
      b.addEventListener('mouseenter',function(){ kHover=true; kShow(b.getAttribute('data-pick')); });
      b.addEventListener('mouseleave',function(){ kHover=false; });
      b.addEventListener('focus',function(){ kShow(b.getAttribute('data-pick')); });
    });
    if(imgs.length){
      kShow(imgs[0].getAttribute('data-dest'));
      if('IntersectionObserver' in W){ new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting) kStart(); else kStop(); }); },{threshold:.15}).observe(kin); } else kStart();
    }
  }
  W.addEventListener('load',function(){ ScrollTrigger.refresh(); });
})();

/* ---------- the film (5 Nov 2026): the poster previews it under the pointer and opens it on a click ---------- */
(function film(){
  var fig=$('#kinFig'), prev=$('#kinPrev'), play=$('#kinPlay'), box=$('#film'), fin=$('#filmIn'), vid=$('#filmVid'), x=$('#filmX'), hero=$('#heroVid');
  if(!fig||!box||!fin||!vid) return;
  /* where each place is in the film, in seconds; a place without its own scene starts at the top */
  var SC={kl:0,langkawi:12.45,melaka:16.4}, src=null, opener=null, hideT=0, tr=0;
  function cur(){ var im=fig.querySelector('img.on'); return im?im.getAttribute('data-dest'):''; }
  function at(id){ return SC[id]||0; }
  function srcOf(){ if(src) return src; var s=hero?hero.querySelector('source:last-of-type'):null; src=s?s.getAttribute('src'):'assets/video/hero.mp4'; return src; }
  function quiet(p){ if(p&&p.catch) p.catch(function(){}); }
  /* the film is fetched once and played from a blob URL: a seek to a place's scene needs byte ranges, which the demo's local server does
     not serve (the banner never seeks, so it does not care). The file is already in the browser's cache from the banner. */
  var blobP=null;
  function film(){ if(blobP) return blobP; blobP=fetch(srcOf()).then(function(r){ if(!r.ok) throw 0; return r.blob(); }).then(function(b){ return URL.createObjectURL(b); }).catch(function(){ return srcOf(); }); return blobP; }
  /* a time set before the file's metadata is in is dropped: wait for it, then seek */
  function seek(v,t){ if(v.readyState>=1){ try{ v.currentTime=t; }catch(e){} return; } v.addEventListener('loadedmetadata',function f(){ v.removeEventListener('loadedmetadata',f); try{ v.currentTime=t; }catch(e){} }); }
  function pOn(){ if(reduce||!prev||!box.hidden) return; fig.classList.add('is-prev');
    film().then(function(u){ if(!fig.classList.contains('is-prev')) return; if(prev.getAttribute('src')!==u) prev.src=u; seek(prev,at(cur())); quiet(prev.play()); }); }
  function pOff(){ fig.classList.remove('is-prev'); if(prev) setTimeout(function(){ if(!fig.classList.contains('is-prev')) prev.pause(); },720); }
  fig.addEventListener('mouseenter',pOn); fig.addEventListener('mouseleave',pOff);
  fig.addEventListener('pointermove',function(e){ if(reduce||tr) return; var cx=e.clientX, cy=e.clientY; tr=requestAnimationFrame(function(){ tr=0; var r=fig.getBoundingClientRect(); if(!r.width) return; var tx=(cx-r.left)/r.width-.5, ty=(cy-r.top)/r.height-.5;
    fig.style.transform='perspective(900px) translateY(-6px) scale(1.015) rotateX('+(-ty*5).toFixed(2)+'deg) rotateY('+(tx*6).toFixed(2)+'deg)'; }); });
  fig.addEventListener('pointerleave',function(){ fig.style.transform=''; });
  function open(){
    if(!box.hidden) return; opener=D.activeElement; clearTimeout(hideT);
    box.hidden=false; R.classList.add('film-open'); if(W.__lenis) W.__lenis.stop();
    if(!reduce){ var z=W.__zoomf||1, fr=fig.getBoundingClientRect(), br=fin.getBoundingClientRect();
      /* the start frame is set with the transition off (set with it on, the reflow itself starts a transition that the real one then reverses) */
      fin.style.transition='none';
      fin.style.setProperty('--ct',((fr.top-br.top)/z).toFixed(1)+'px'); fin.style.setProperty('--cl',((fr.left-br.left)/z).toFixed(1)+'px');
      fin.style.setProperty('--cr',((br.right-fr.right)/z).toFixed(1)+'px'); fin.style.setProperty('--cb',((br.bottom-fr.bottom)/z).toFixed(1)+'px'); void fin.offsetWidth; fin.style.transition=''; }
    box.classList.add('is-on');
    requestAnimationFrame(function(){ ['--ct','--cl','--cr','--cb'].forEach(function(k){ fin.style.removeProperty(k); }); });
    pOff(); if(hero) hero.pause();
    var t=at(cur()); film().then(function(u){ if(box.hidden) return; if(vid.getAttribute('src')!==u){ vid.src=u; } seek(vid,t); quiet(vid.play()); });
    if(x) x.focus({preventScroll:true});
  }
  function close(){
    if(box.hidden) return; vid.pause(); box.classList.remove('is-on'); R.classList.remove('film-open'); if(W.__lenis) W.__lenis.start();
    if(hero) quiet(hero.play());
    hideT=setTimeout(function(){ box.hidden=true; },520);
    if(opener&&opener.focus) opener.focus({preventScroll:true});
  }
  fig.addEventListener('click',open);
  if(play) play.addEventListener('click',function(e){ e.stopPropagation(); open(); });
  if(x) x.addEventListener('click',close);
  box.addEventListener('click',function(e){ if(e.target===box) close(); });
  D.addEventListener('keydown',function(e){ if(e.key==='Escape'&&!box.hidden) close(); });
})();

/* the Brand Method demo ribbon: the same cloth ribbon IAQ, Tenthpin and Yacht Style end with. Three sines move the band,
   the local slope shades it and turns each letter. Runs only while on screen. */
(function(){
  var cv=document.getElementById('bmRibbon'),fb=document.querySelector('.ft-ribbon-fb'),ctx=null;try{ctx=cv&&cv.getContext('2d');}catch(e){}
  if(!ctx){if(cv)cv.style.display='none';if(fb)fb.hidden=false;return;}
  var RMr=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches,W=460,H=110,dpr=Math.min(window.devicePixelRatio||1,2);
  cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
  var X0=40,X1=420,BH=32,BY=40,running=false,looping=false,t=0,GL=null,F='600 12px Jost,sans-serif';
  var SEGS=[{t:'DEMO BY',sp:3.6,a:1,gap:8},{star:true,w:13,gap:9},{t:'BRAND',sp:3.6,a:.98},{t:'METHOD.CO',sp:3.6,a:.98}];
  function build(){GL=[];SEGS.forEach(function(s){if(s.star){GL.push({star:true,w:s.w});if(s.gap)GL.push({gap:s.gap});return;}ctx.font=F;
    for(var i=0;i<s.t.length;i++){var ch=s.t[i];if(ch===' '){GL.push({gap:6.5});continue;}GL.push({ch:ch,a:s.a,w:ctx.measureText(ch).width+s.sp});}if(s.gap)GL.push({gap:s.gap});});}
  function wave(x,tt){return 4*Math.sin(x*.0135+tt*.0011)+2.4*Math.sin(x*.029-tt*.00068)+1.2*Math.sin(x*.055+tt*.0016);}
  function slope(x,tt){return(wave(x+2,tt)-wave(x-2,tt))/4;}
  function lerp(a,b,p){return a+(b-a)*p;}
  function shade(p){return 'rgb('+Math.round(lerp(18,86,p))+','+Math.round(lerp(28,116,p))+','+Math.round(lerp(158,255,p))+')';}
  function tail(xe,dir,tt){var y=BY+wave(xe,tt)*.7+9,x2=xe-dir*40;ctx.beginPath();ctx.moveTo(xe,y);ctx.lineTo(x2,y+7);ctx.lineTo(x2+dir*13,y+7+BH/2);ctx.lineTo(x2,y+7+BH);ctx.lineTo(xe,y+BH);ctx.closePath();ctx.fillStyle='#101C96';ctx.fill();ctx.fillStyle='rgba(0,0,0,.22)';ctx.fill();}
  function draw(tt){if(!GL)build();ctx.clearRect(0,0,W,H);tail(X0+6,1,tt);tail(X1-6,-1,tt);var x,y,s,p;
    for(x=X0;x<=X1;x+=2){y=BY+wave(x,tt);s=slope(x,tt);p=Math.max(0,Math.min(1,.52+s*5.5+.14*Math.sin(x*.006-tt*.00042)));ctx.fillStyle=shade(p);ctx.fillRect(x-1,y,2.4,BH);}
    ctx.beginPath();for(x=X0;x<=X1;x+=4){y=BY+wave(x,tt);x===X0?ctx.moveTo(x,y+.6):ctx.lineTo(x,y+.6);}ctx.strokeStyle='rgba(255,255,255,.28)';ctx.lineWidth=1.1;ctx.stroke();
    ctx.beginPath();for(x=X0;x<=X1;x+=4){y=BY+wave(x,tt)+BH;x===X0?ctx.moveTo(x,y-.6):ctx.lineTo(x,y-.6);}ctx.strokeStyle='rgba(0,10,60,.4)';ctx.lineWidth=1.2;ctx.stroke();
    ctx.textAlign='left';ctx.textBaseline='middle';var tot=0;GL.forEach(function(g){tot+=g.w||g.gap||0;});var xs=(X0+X1)/2-tot/2;
    GL.forEach(function(g){if(g.gap){xs+=g.gap;return;}var cx=xs+(g.w||0)/2,yy=BY+wave(cx,tt)+BH/2+.5,a=Math.atan(slope(cx,tt));ctx.save();ctx.translate(cx,yy);ctx.rotate(a);
      if(g.star){ctx.strokeStyle='rgba(255,255,255,.97)';ctx.lineWidth=1.5;ctx.lineCap='round';for(var k=0;k<4;k++){var an=k*Math.PI/4;ctx.beginPath();ctx.moveTo(-Math.cos(an)*4.6,-Math.sin(an)*4.6);ctx.lineTo(Math.cos(an)*4.6,Math.sin(an)*4.6);ctx.stroke();}}
      else{ctx.font=F;ctx.fillStyle='rgba(2,8,40,.4)';ctx.fillText(g.ch,-(g.w/2)+.7,1.1);ctx.fillStyle='rgba(255,255,255,'+g.a+')';ctx.fillText(g.ch,-(g.w/2),0);}
      ctx.restore();xs+=g.w||0;});}
  function frame(){if(!running){looping=false;return;}looping=true;t+=16;draw(t);requestAnimationFrame(frame);}
  draw(0);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){GL=null;draw(t);});
  if(RMr||!('IntersectionObserver' in window))return;
  new IntersectionObserver(function(es){running=es[0].isIntersecting&&!document.hidden;if(running&&!looping)requestAnimationFrame(frame);}).observe(cv);
})();

/* ---------- header ---------- */
(function header(){
  var hd=$('#hd'); if(!hd) return;
  var last=W.scrollY||0, hidden=false;
  function upd(){
    var y=W.scrollY||0; hd.classList.toggle('solid', y>40);
    var dy=y-last;
    if(y>180 && dy>6 && !hidden){ hidden=true; hd.classList.add('hide'); }
    else if((dy<-6 || y<180) && hidden){ hidden=false; hd.classList.remove('hide'); }
    last=y;
  }
  W.addEventListener('scroll', upd, {passive:true}); upd();
  var b=$('.burger',hd), m=$('#mnav');
  if(b&&m){
    b.addEventListener('click', function(){ var o=!m.classList.contains('open'); m.classList.toggle('open',o); b.setAttribute('aria-expanded',o?'true':'false'); R.classList.toggle('menu-open',o); });
    $$('a',m).forEach(function(a){ a.addEventListener('click', function(){ m.classList.remove('open'); b.setAttribute('aria-expanded','false'); R.classList.remove('menu-open'); }); });
  }
})();

/* ---------- reveals: IntersectionObserver adds a class, CSS does the motion ---------- */
(function reveals(){
  var all=$$('.rise,[data-rv],.cur,.sticky');
  var later=all.filter(function(e){ return e.classList.contains('after-ld'); });
  var now=all.filter(function(e){ return !e.classList.contains('after-ld'); });
  function on(e){ e.classList.add('on'); }
  function heroIn(){ later.forEach(on); }
  if($('#ld')) D.addEventListener('th:loaded', function(){ setTimeout(heroIn, 380); }); else heroIn(); /* 380: the hero line rises as the curtain passes it */
  setTimeout(heroIn, 5600); /* belt and braces: the hero is never left hidden */
  if(!('IntersectionObserver' in W) || reduce){ now.forEach(on); return; }
  var io=new IntersectionObserver(function(ents){ ents.forEach(function(en){ if(en.isIntersecting){ on(en.target); io.unobserve(en.target); } }); },{threshold:0, rootMargin:'0px 0px -6% 0px'});
  now.forEach(function(e){ io.observe(e); });
  function sweep(){ now.forEach(function(e){ if(!e.classList.contains('on')){ var r=e.getBoundingClientRect(); if(r.top<W.innerHeight && r.bottom>0) on(e); } }); }
  W.addEventListener('load', function(){ setTimeout(sweep, 1500); setTimeout(sweep, 4000); });
  D.addEventListener('th:loaded', function(){ setTimeout(sweep, 500); });
  var swT=0; W.addEventListener('scroll', function(){ if(swT) return; swT=setTimeout(function(){ swT=0; sweep(); }, 450); }, {passive:true});
})();

/* ---------- count ups on real numbers ---------- */
(function counts(){
  var els=$$('[data-count]'); if(!els.length) return;
  function run(el){ var to=parseFloat(el.getAttribute('data-count'))||0, t0=0, dur=1500;
    function f(ts){ if(!t0) t0=ts; var p=Math.min(1,(ts-t0)/dur); p=1-Math.pow(1-p,3); el.textContent=Math.round(to*p); if(p<1) requestAnimationFrame(f); else el.textContent=el.getAttribute('data-count'); }
    requestAnimationFrame(f); }
  if(!('IntersectionObserver' in W) || reduce) return;
  var io=new IntersectionObserver(function(ents){ ents.forEach(function(en){ if(en.isIntersecting){ run(en.target); io.unobserve(en.target); } }); },{threshold:0.5});
  els.forEach(function(e){ io.observe(e); });
})();

/* ---------- the hero stage and the destination finder ---------- */
var setDest = function(){};
(function hero(){
  var stage=$('#stage'); if(!stage) return;
  var slides=$$('.sl',stage), name=$('#nowName'), place=$('#nowPlace'), bar=$('#nowBar'), where=$('#pWhere'), out=$('#findOut');
  var dest='all', idx=0, timer=0, DUR=6500, started=false;
  var vid=$('#heroVid'), vidOk=!!vid;
  if(vid){ vid.addEventListener('error', function(){ vidOk=false; if(vid.parentElement) vid.parentElement.classList.remove('is-on'); if(started) show(0); });
    var srcEl=vid.querySelector('source:last-of-type'); if(srcEl) srcEl.addEventListener('error', function(){ vidOk=false; if(vid.parentElement) vid.parentElement.classList.remove('is-on'); if(started) show(0); }); }
  function list(){ return slides.filter(function(s){ var isv=s.classList.contains('vid'); if(dest==='all'){ return vidOk ? isv : (!isv && s.getAttribute('data-sharp')==='1'); } return !isv && s.getAttribute('data-dest')===dest; }); }
  function show(i){
    var L=list(); if(!L.length) return; idx=(i+L.length)%L.length; var s=L[idx];
    slides.forEach(function(x){ x.classList.toggle('is-on', x===s); });
    if(vid){ if(s.classList.contains('vid')){ var pr=vid.play(); if(pr&&pr.catch) pr.catch(function(){}); } else vid.pause(); }
    if(name) name.textContent=s.getAttribute('data-name'); if(place) place.textContent=s.getAttribute('data-place');
    if(bar){ bar.parentElement.style.visibility = L.length>1 ? 'visible' : 'hidden'; bar.style.transition='none'; bar.style.transform='scaleX(0)'; void bar.offsetWidth; bar.style.transition='transform '+DUR+'ms linear'; bar.style.transform='scaleX(1)'; }
    clearTimeout(timer); if(!reduce && L.length>1) timer=setTimeout(function(){ show(idx+1); }, DUR);
  }
  setDest=function(d){
    if(!DST[d] && d!=='all') d='all'; dest=d;
    list().forEach(function(s){ var im=s.querySelector('img'); if(im && im.getAttribute('loading')==='lazy'){ im.removeAttribute('loading'); im.loading='eager'; } });
    if(where && where.value!==d) where.value=d;
    show(0);
    if(out){ out.firstChild.nodeValue = d==='all' ? 'See the hotels ' : 'See the hotel'+(DST[d].hotels.length>1?'s':'')+' in '+DST[d].label+' '; }
    try{ D.dispatchEvent(new CustomEvent('th:dest',{detail:d})); }catch(e){}
  };
  if(where) where.addEventListener('change', function(){ setDest(where.value); });
  function start(){ if(started) return; started=true; var cur=$('.sl.is-on',stage), L=list(), i=cur?L.indexOf(cur):-1; show(i<0?0:i); }
  if($('#ld')) D.addEventListener('th:loaded', start); else start();
  setTimeout(start, 5600);
  if(!reduce && W.matchMedia('(min-width:900px) and (hover:hover)').matches){
    var hero=$('.hero');
    hero.addEventListener('pointermove', function(e){ var r=hero.getBoundingClientRect(); var mx=(e.clientX-r.left)/r.width*2-1, my=(e.clientY-r.top)/r.height*2-1; hero.style.setProperty('--mx',mx.toFixed(3)); hero.style.setProperty('--my',my.toFixed(3)); });
    hero.addEventListener('pointerleave', function(){ hero.style.setProperty('--mx','0'); hero.style.setProperty('--my','0'); });
  }
  D.addEventListener('visibilitychange', function(){ if(D.hidden) clearTimeout(timer); else if(started) show(idx); });
})();

/* ---------- the hotels strip follows the finder; the plan bar carries the dates to every Book ---------- */
(function strip(){
  var cards=$$('.hp[data-hotel]'), showing=$('#showing'), showAll=$('#showAll'); if(!cards.length) return;
  var plan=$('#plan'), pIn=$('#pIn'), pOut=$('#pOut'), pG=$('#pGuests'), where=$('#pWhere'), cur='all';
  var MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function iso(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
  function parse(v){ var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(v||''); return m ? new Date(+m[1],+m[2]-1,+m[3]) : null; }
  function range(){ var a=parse(pIn&&pIn.value), b=parse(pOut&&pOut.value); if(!a||!b||b<=a) return '';
    return a.getMonth()===b.getMonth() ? a.getDate()+' to '+b.getDate()+' '+MON[b.getMonth()] : a.getDate()+' '+MON[a.getMonth()]+' to '+b.getDate()+' '+MON[b.getMonth()]; }
  function stay(){ var r=range(), g=pG?parseInt(pG.value,10)||2:2; return (r?r+', ':'')+g+(g>1?' guests':' guest'); }
  function names(){ var o={}; (DATA.hotels||[]).forEach(function(h){ o[h.id]=h.name; }); return o; }
  var NM=names();
  function apply(d){
    cur=d; var n=0; cards.forEach(function(c){ var hide = d!=='all' && c.getAttribute('data-dest')!==d; c.hidden=hide; if(!hide) n++;
      var bk=c.querySelector('.btn.demo'); if(bk) bk.setAttribute('data-demo', (NM[c.getAttribute('data-hotel')]||'the hotel')+'\u2019s own reservations, with '+stay()+' filled in'); });
    if(showing) showing.textContent = (d==='all' ? 'Showing all 8 hotels' : 'Showing '+n+(n>1?' hotels':' hotel')+' in '+DST[d].label) + ' for ' + stay();
    if(showAll) showAll.hidden = d==='all';
  }
  if(pIn && pOut && !pIn.value){ var t=new Date(), f=new Date(t.getFullYear(),t.getMonth(),t.getDate()); var add=(5-f.getDay()+7)%7||7; f.setDate(f.getDate()+add); var o=new Date(f); o.setDate(f.getDate()+2); pIn.value=iso(f); pOut.value=iso(o); pIn.min=iso(t); pOut.min=iso(f); }
  if(pIn) pIn.addEventListener('change', function(){ var a=parse(pIn.value); if(a){ pOut.min=iso(a); var b=parse(pOut.value); if(!b||b<=a){ var o=new Date(a); o.setDate(a.getDate()+2); pOut.value=iso(o); } } apply(cur); });
  if(pOut) pOut.addEventListener('change', function(){ apply(cur); });
  if(pG) pG.addEventListener('change', function(){ apply(cur); });
  function toStrip(){ var h=$('#hotels'); if(!h) return; requestAnimationFrame(function(){ requestAnimationFrame(function(){ setTimeout(function(){ h.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'}); }, 80); }); }); }
  if(plan) plan.addEventListener('submit', function(e){ e.preventDefault(); setDest(where?where.value:'all'); toStrip(); });
  D.addEventListener('th:dest', function(e){ apply(e.detail); });
  if(showAll) showAll.addEventListener('click', function(){ setDest('all'); });
  $$('[data-godest]').forEach(function(b){ b.addEventListener('click', function(){ setDest(b.getAttribute('data-godest')); toStrip(); }); });
  apply('all');
})();

/* ---------- where we are: the story scrolls, the map follows ---------- */
(function mapStory(){
  var sec=$('#destinations'); if(!sec) return;
  var blocks=$$('.dblock',sec), pins=$$('.map .dest',sec), img=$('#dxImg'), go=$('#dxGo'), goT=$('#dxGoT');
  function act(id){
    var cur=null;
    blocks.forEach(function(b){ var on=b.getAttribute('data-dest')===id; b.classList.toggle('is-on',on); var h=b.querySelector('.dx-h'); if(h) h.setAttribute('aria-expanded',on?'true':'false'); if(on) cur=b; });
    pins.forEach(function(p){ p.classList.toggle('is-on',p.getAttribute('data-dest')===id); });
    if(!cur) return;
    if(img){ var ni=img.cloneNode(); ni.src=cur.getAttribute('data-th'); img.replaceWith(ni); img=ni; }
    if(go){ go.setAttribute('data-godest',id); if(goT) goT.textContent='See the hotels in '+cur.getAttribute('data-label'); }
  }
  blocks.forEach(function(b){ var h=b.querySelector('.dx-h'); if(h) h.addEventListener('click',function(){ act(b.getAttribute('data-dest')); }); });
  pins.forEach(function(p){ p.addEventListener('click',function(){ act(p.getAttribute('data-dest')); }); p.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); act(p.getAttribute('data-dest')); } }); });
  $$('[data-pick]').forEach(function(b){ b.addEventListener('click',function(){ act(b.getAttribute('data-pick')); if(W.__lenis) W.__lenis.scrollTo(sec,{offset:-60}); else sec.scrollIntoView({behavior:reduce?'auto':'smooth'}); }); });
  D.addEventListener('th:dest',function(e){ if(e.detail!=='all') act(e.detail); });
  if(blocks.length) act(blocks[0].getAttribute('data-dest'));
})();

/* ---------- news: the wire runs the stories, one at a time ---------- */
(function wire(){
  var w=$('#wire'); if(!w) return; var N=DATA.news||[]; if(!N.length) return;
  var img=$('#wireImg'), tag=$('#wireTag'), date=$('#wireDate'), t=$('#wireT'), wh=$('#wireW'), item=$('#wireItem'), rail=$$('.wire-rail button',w);
  var i=0, timer=0, paused=false, DWELL=4500; w.style.setProperty('--dwell', DWELL+'ms');
  function show(k){
    i=(k+N.length)%N.length; var n=N[i];
    var ni=img.cloneNode(); ni.src=n.img; ni.alt=''; img.replaceWith(ni); img=ni;
    if(tag) tag.textContent=n.tag; if(date) date.textContent=n.date; if(t) t.textContent=n.title; if(wh) wh.textContent=n.where; if(item) item.setAttribute('data-demo', n.demo);
    rail.forEach(function(b,k2){ b.classList.toggle('on',k2===i); b.classList.toggle('done',k2<i); var f=b.querySelector('.wire-fill'); if(f){ f.style.animation='none'; void f.offsetWidth; f.style.animation=''; } });
    clearTimeout(timer); if(!reduce && !paused) timer=setTimeout(function(){ show(i+1); }, DWELL);
  }
  w.addEventListener('mouseenter', function(){ paused=true; clearTimeout(timer); w.classList.add('paused'); });
  w.addEventListener('mouseleave', function(){ paused=false; w.classList.remove('paused'); show(i); });
  rail.forEach(function(b,k){ b.addEventListener('click', function(e){ e.stopPropagation(); show(k); }); });
  D.addEventListener('visibilitychange', function(){ if(D.hidden) clearTimeout(timer); else show(i); });
  show(0);
})();

/* ---------- for owners: talk to us ---------- */
(function talk(){
  var b=$('#talkBtn'), p=$('#talk'); if(!b||!p) return;
  b.addEventListener('click', function(){ var o=!p.classList.contains('open'); p.classList.toggle('open',o); b.setAttribute('aria-expanded',o?'true':'false'); if(o) setTimeout(function(){ p.scrollIntoView({behavior:reduce?'auto':'smooth',block:'nearest'}); },350); });
  var f=$('form',p); if(f) f.addEventListener('submit', function(e){ e.preventDefault(); toast('Nothing is sent in this demo. In the live site this reaches the group’s office.'); });
})();

/* ---------- the scrubbed motion: GSAP, desktop only, content never hidden ---------- */
(function scrubs(){
  if(!W.gsap || !W.ScrollTrigger || reduce) return;
  gsap.registerPlugin(ScrollTrigger);
  var mm=gsap.matchMedia();
  mm.add('(min-width:900px)', function(){
    var hero=$('.hero'), stage=$('#stage'), hin=$('.hero-in');
    if(hero && stage){
      gsap.fromTo(stage,{yPercent:0},{yPercent:24, ease:'none', immediateRender:false, scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:true,invalidateOnRefresh:true}});
      gsap.fromTo(hin,{yPercent:0},{yPercent:-16, ease:'none', immediateRender:false, scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:true,invalidateOnRefresh:true}});
    }
    $$('.px img').forEach(function(img){
      var fig=img.closest('.ph, .door, .hp') || img.parentElement;
      gsap.fromTo(img,{yPercent:-6},{yPercent:6, ease:'none', immediateRender:false, scrollTrigger:{trigger:fig,start:'top bottom',end:'bottom top',scrub:true,invalidateOnRefresh:true}});
    });
    var big=$('.big8>b'); if(big) gsap.fromTo(big,{y:40},{y:-40, ease:'none', immediateRender:false, scrollTrigger:{trigger:'#group',start:'top bottom',end:'bottom top',scrub:true}});
    var sec=$('.hs'), track=$('[data-hs-track]'), tw=null;
    /* 4 Nov 2026: the hotels are a grid that scrolls with the page, no pin and no sideways scrub (Bazil) */
    return function(){ if(sec){ sec.classList.remove('hs-enhanced'); gsap.set(track,{clearProps:'transform'}); } if(tw){ if(tw.scrollTrigger) tw.scrollTrigger.kill(); tw.kill(); } };
  });
  W.addEventListener('load', function(){ ScrollTrigger.refresh(); });
  if(D.fonts && D.fonts.ready) D.fonts.ready.then(function(){ ScrollTrigger.refresh(); });
  D.addEventListener('th:dest', function(){ setTimeout(function(){ ScrollTrigger.refresh(); }, 60); });
  D.addEventListener('visibilitychange', function(){ if(!D.hidden) ScrollTrigger.refresh(); });
})();

/* ---------- year ---------- */
$$('[data-year]').forEach(function(y){ y.textContent=new Date().getFullYear(); });
})();
