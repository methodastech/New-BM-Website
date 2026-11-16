/* Simple Matcha, Web Prototype 1, v2. One file, no libraries (the 3D pouch is assets/pack3d.js on Three.js).
   Data contract for the developer: PRODUCTS mirrors the Shopify catalogue (handle, price, compare at price).
   The cart lives in localStorage "sm-cart"; checkout is a demo and sends nothing. */
(function(){
'use strict';
var W=window,D=document,H=D.documentElement;
function $(s,c){return (c||D).querySelector(s)}
function $$(s,c){return Array.prototype.slice.call((c||D).querySelectorAll(s))}
var STILL=H.classList.contains('still'),RM=STILL||(W.matchMedia&&W.matchMedia('(prefers-reduced-motion:reduce)').matches);
var FINE=W.matchMedia&&W.matchMedia('(hover:hover) and (pointer:fine)').matches;
function rm(n){return 'RM'+(Math.round(n*100)%100?n.toFixed(2):Math.round(n).toLocaleString('en-MY'))}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}

var PRODUCTS={
  zhu:{han:'竹',name:'Zhu 50g',sub:'Everyday Ceremonial',price:60,was:80,cup:'About 8 cups, RM7.20 a cup',img:'assets/img/cut/zhu-f.webp',handle:'zhu-ceremonial-matcha'},
  ling:{han:'铃',name:'Ling 50g',sub:'Upper Ceremonial',price:85,was:115,cup:'About 8 cups, RM10.20 a cup',img:'assets/img/cut/ling-f.webp',handle:'ling-50g'},
  zhu20:{han:'竹',name:'Zhu 20g',sub:'About 3 cups',price:30,was:30,cup:'',img:'assets/img/zhu-cut.webp',handle:'11-11-exclusive-zhu-20g'}
};
var FREE=50;

/* ---------- intro, then the hero comes in ---------- */
function ready(){H.classList.add('ready')}
if(H.classList.contains('intro')&&!RM){
  var ip=$('.intro-p'),done=false;
  var end=function(){if(done)return;done=true;H.classList.add('intro-done');ready()};
  ip.addEventListener('animationend',function(e){if(e.animationName==='introUp')end()});
  ip.addEventListener('click',end);setTimeout(end,2800);setTimeout(ready,1500);
}else{H.classList.remove('intro');ready()}

/* ---------- reveal on scroll: content stays visible unless the observer runs ---------- */
if('IntersectionObserver' in W&&!RM){
  H.classList.add('io');
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'});
  $$('.rv').forEach(function(e){io.observe(e)});
  var live=true,tick=false;
  var sweep=function(){tick=false;if(!live)return;var vh=W.innerHeight,left=0;$$('.rv:not(.in)').forEach(function(e){var r=e.getBoundingClientRect();if(r.top<vh*.94&&r.bottom>0)e.classList.add('in');else left++});if(!left)live=false};
  var on=function(){if(live&&!tick){tick=true;setTimeout(sweep,90)}};
  W.addEventListener('scroll',on,{passive:true});W.addEventListener('resize',on,{passive:true});W.addEventListener('load',function(){setTimeout(sweep,500)});setTimeout(sweep,2400);
}else{H.classList.add('no-io')}

/* blocks with looping icons or motion only run while on screen */
function onScreen(el,fn,th){if(!el)return;if(!('IntersectionObserver' in W)){fn(true);return}new IntersectionObserver(function(es){fn(es[0].isIntersecting)},{threshold:th||0}).observe(el)}
$$('[data-vis]').forEach(function(el){onScreen(el,function(v){el.classList.toggle('vis',v&&!RM)})});

/* ---------- announcement rotates ---------- */
(function(){var s=$$('.ann-r span');if(!s.length)return;var i=0;s[0].classList.add('on');if(RM||s.length<2)return;
  setInterval(function(){if(D.hidden)return;s[i].classList.remove('on');s[i].classList.add('out');var o=s[i];setTimeout(function(){o.classList.remove('out')},700);i=(i+1)%s.length;s[i].classList.add('on')},4200)})();

/* ---------- marquee: a second copy makes the loop seamless ---------- */
(function(){var t=$('.mq-t');if(!t)return;var r=$('.mq-r',t);var c=r.cloneNode(true);c.setAttribute('aria-hidden','true');t.appendChild(c)})();

/* ---------- films: fetched as a Blob so they loop on any server ---------- */
function loadFilm(v,cb){
  if(v._ok){cb&&cb();return}if(v._cbs){cb&&v._cbs.push(cb);return}v._cbs=cb?[cb]:[];
  var src=v.getAttribute('data-film');if(RM||!src)return;
  var fin=function(u){v.src=u;v._ok=true;v._cbs.forEach(function(f){f()});v._cbs=[]};
  fetch(src).then(function(r){if(!r.ok)throw 0;return r.blob()}).then(function(b){fin(URL.createObjectURL(b))}).catch(function(){fin(src)});
}
function play(v){if(v._userPaused)return;var p=v.play();if(p&&p.catch)p.catch(function(){})}
/* ---------- hero: the film plays while on screen; the picker swaps the pack, price and button ---------- */
(function(){
  var v=$('.hero-film video'),pp=$('[data-pp]');if(!v)return;var vis=false;
  onScreen(v,function(s){vis=s;if(s)loadFilm(v,function(){if(vis)play(v)});else v.pause()},.2);
  if(pp)pp.addEventListener('click',function(){if(v.paused){v._userPaused=false;loadFilm(v,function(){play(v)});pp.classList.remove('paused');pp.setAttribute('aria-label','Pause the film')}else{v._userPaused=true;v.pause();pp.classList.add('paused');pp.setAttribute('aria-label','Play the film')}});
})();
function setHeroVariant(k){
  var p=PRODUCTS[k];if(!p)return;
  $('[data-hp]').textContent=rm(p.price);$('[data-hw]').textContent=rm(p.was);$('[data-hpct]').textContent='Save '+rm(p.was-p.price);$('[data-hc]').textContent=p.cup;
  $('[data-hero-add]').setAttribute('data-add',k);
  var hz=$('[data-han]');if(hz){hz.classList.add('swap');setTimeout(function(){hz.textContent=k==='ling'?'铃':'竹';hz.classList.remove('swap')},220)}
  $$('.hs-pk img').forEach(function(im){var on=im.getAttribute('data-v')===k;im.classList.toggle('on',on);if(on)im.setAttribute('data-fly-src','');else im.removeAttribute('data-fly-src')});
}
$$('.vo input').forEach(function(r){r.addEventListener('change',function(){if(r.checked)setHeroVariant(r.value)})});

/* ---------- shop ---------- */
/* taste notes: each taste has its own colour, scored in 5 leaves (the icon beside the label was removed on request) */
var TASTE={Umami:['waves','#2E7D4A'],Sweet:['cookie','#7FB236'],Bitter:['coffee-bean','#8B7A50'],Body:['drop-half','#2C8A80']};
$$('.dots li').forEach(function(li){var s=$('span',li),k=s.textContent.trim(),m=TASTE[k]||['leaf','#2E7D4A'],lv=$('.lv',li),v=+lv.getAttribute('data-v'),h='';
  li.style.setProperty('--c',m[1]);
  for(var n=1;n<=5;n++)h+='<i class="ph-duotone ph-leaf'+(n<=v?' f':'')+'" aria-hidden="true"></i>';lv.innerHTML=h;lv.setAttribute('role','img');lv.setAttribute('aria-label',k+' '+v+' of 5')});
$$('[data-pick]').forEach(function(b){b.addEventListener('click',function(){
  $$('[data-pick]').forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});
  var id=b.getAttribute('data-pick');$$('.pc,.pm').forEach(function(c){c.classList.toggle('rec',c.getAttribute('data-product')===id)});
  $('#pickA').textContent=b.getAttribute('data-say');
})});
$$('.pc [data-qty],.hero-shop [data-qty]').forEach(function(q){var o=$('output',q);q.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;o.textContent=clamp(+o.textContent+(+b.getAttribute('data-d')),1,12)})});

/* ---------- money tween (lands on the final value even if frames are throttled) ---------- */
function tween(el,from,to){
  if(RM||from===to){el.textContent=rm(to);return}
  var t0=null,dur=650,id=(el._tid||0)+1;el._tid=id;
  function f(t){if(el._tid!==id)return;if(!t0)t0=t;var p=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-p,3);el.textContent=rm(Math.round(from+(to-from)*e));if(p<1)W.requestAnimationFrame(f)}
  W.requestAnimationFrame(f);setTimeout(function(){if(el._tid===id)el.textContent=rm(to)},dur+250);
}

/* ---------- the café latte maths ---------- */
(function(){
  var n=5,row=$('#cupsR');if(!row)return;var CAFE=26,HOME=7.2,prev={c:0,h:0,s:0};
  var cup='<svg viewBox="0 0 26 30"><path class="lq" d="M5.3 14h15.4l-1.3 12.6H6.6z"/><path d="M4 7h18l-2 21H6z"/><path d="M15 7l3.2-5.5"/></svg>';
  var h='';for(var i=0;i<14;i++)h+=cup;row.innerHTML=h;var cups=$$('svg',row);
  function upd(pop){
    $('#cupsN').textContent=n;
    cups.forEach(function(c,i){var was=c.classList.contains('on');c.classList.toggle('on',i<n);if(pop&&!was&&i<n){c.classList.add('pop');setTimeout(function(){c.classList.remove('pop')},300)}});
    var c=n*52*CAFE,hm=Math.round(n*52*HOME),s=c-hm;
    tween($('#cafeY'),prev.c,c);tween($('#homeY'),prev.h,hm);tween($('#saveY'),prev.s,s);prev={c:c,h:hm,s:s};
  }
  $$('[data-cups]').forEach(function(b){b.addEventListener('click',function(){n=clamp(n+(+b.getAttribute('data-cups')),1,14);upd(true)})});
  prev={c:n*52*CAFE,h:Math.round(n*52*HOME),s:n*52*CAFE-Math.round(n*52*HOME)};upd(false);
})();

/* ---------- journey: a stepper that advances on its own while on screen; click any step. Not tied to scrolling. ---------- */
(function(){
  var g=$('.jr-g'),steps=$$('.jstep'),vids=$$('.jr-v video'),num=$('#jrNum');if(!steps.length)return;
  var cur=0,vis=false;
  function set(i,user){
    cur=(i+steps.length)%steps.length;
    steps.forEach(function(s,k){var on=k===cur;s.classList.toggle('on',on);s.setAttribute('aria-pressed',on?'true':'false');var b=$('.js-bar i',s);if(b){b.style.animation='none';void b.offsetWidth;b.style.animation=''}});
    num.textContent=cur+1;
    vids.forEach(function(v,k){if(k===cur){v.classList.add('on');if(vis)loadFilm(v,function(){if(cur===k&&vis)play(v)})}else{v.classList.remove('on');v.pause()}});
    if(vis&&vids[cur+1])loadFilm(vids[cur+1]);
  }
  steps.forEach(function(s,k){
    s.addEventListener('click',function(){set(k,true)});
    var b=$('.js-bar i',s);if(b)b.addEventListener('animationend',function(){if(s.classList.contains('on')&&!RM)set(cur+1)});
  });
  g.addEventListener('mouseenter',function(){g.classList.add('hold')});g.addEventListener('mouseleave',function(){g.classList.remove('hold')});
  g.addEventListener('focusin',function(){g.classList.add('hold')});g.addEventListener('focusout',function(){g.classList.remove('hold')});
  onScreen(g,function(v){vis=v;if(v)set(cur);else vids.forEach(function(x){x.pause()})},.3);
  W.SMJourney={set:set,get:function(){return cur}};
})();

/* ---------- rituals: a card plays its film on hover, or when it is the one in view on touch screens ---------- */
(function(){
  var cards=$$('.rc3');cards.forEach(function(c){var v=$('video',c);if(!v)return;
    if(FINE){c.addEventListener('mouseenter',function(){loadFilm(v,function(){play(v)})});c.addEventListener('mouseleave',function(){v.pause()})}
    else onScreen(c,function(s){if(s)loadFilm(v,function(){play(v)});else v.pause()},.75);
  });
})();

/* ---------- notify me ---------- */
$$('[data-notify]').forEach(function(f){f.addEventListener('submit',function(e){e.preventDefault();var i=$('input',f);
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(i.value)){i.focus();i.setAttribute('aria-invalid','true');return}
  var p=D.createElement('p');p.className='ntf-ok';p.textContent='Noted. We will email you when it is back. (Demo: nothing was sent.)';f.replaceWith(p)})});

/* ---------- magnetic primary buttons (fine pointers) ---------- */
if(FINE&&!RM)$$('.mag').forEach(function(b){
  b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect();b.style.setProperty('--mx',clamp((e.clientX-r.left-r.width/2)*.16,-8,8)+'px');b.style.setProperty('--my',clamp((e.clientY-r.top-r.height/2)*.3,-6,6)+'px')});
  b.addEventListener('pointerleave',function(){b.style.setProperty('--mx','0px');b.style.setProperty('--my','0px')});
});


/* ---------- main menu: hover or click opens a wing; destinations stay on the home page in this demo ---------- */
(function(){
  var nav=$('.nav'),items=$$('.mm-i'),burger=$('.mm-burger');if(!items.length)return;var tO=0,tC=0,big=function(){return W.innerWidth>1100};
  function close(){items.forEach(function(i){i.classList.remove('open');$('.mm-t',i).setAttribute('aria-expanded','false')})}
  function open(i){items.forEach(function(x){if(x!==i){x.classList.remove('open');$('.mm-t',x).setAttribute('aria-expanded','false')}});i.classList.add('open');$('.mm-t',i).setAttribute('aria-expanded','true')}
  items.forEach(function(i){
    var b=$('.mm-t',i);
    b.addEventListener('click',function(){if(i.classList.contains('open'))close();else open(i)});
    i.addEventListener('mouseenter',function(){if(!big()||!FINE)return;clearTimeout(tC);clearTimeout(tO);tO=setTimeout(function(){open(i)},90)});
    i.addEventListener('mouseleave',function(){if(!big()||!FINE)return;clearTimeout(tO);tC=setTimeout(close,160)});
  });
  D.addEventListener('click',function(e){if(!e.target.closest('.mm-i,.mm-burger'))close()});
  D.addEventListener('keydown',function(e){if(e.key==='Escape'){close();H.classList.remove('mm-open');if(burger)burger.setAttribute('aria-expanded','false')}});
  if(burger)burger.addEventListener('click',function(){var o=!H.classList.contains('mm-open');if(o)H.style.setProperty('--mm-top',Math.round(nav.getBoundingClientRect().bottom)+'px');H.classList.toggle('mm-open',o);burger.setAttribute('aria-expanded',o?'true':'false');burger.setAttribute('aria-label',o?'Close the menu':'Open the menu');if(!o)close()});
  W.addEventListener('resize',function(){if(big()){H.classList.remove('mm-open')}});
})();
/* demo: every page link stays here and says where it would go */
function toast(msg){var t=$('#toast');if(!t)return;t.innerHTML='<i class="ph-duotone ph-info" aria-hidden="true"></i>'+msg;t.classList.add('on');clearTimeout(t._t);t._t=setTimeout(function(){t.classList.remove('on')},2600)}
function demoPop(el){var pop=$('#demoPop');if(!pop){toast('That page is not in this demo.');return}
  var r=el.getBoundingClientRect(),pw=Math.min(340,W.innerWidth-24);pop.style.width='';
  var x=Math.max(12,Math.min(W.innerWidth-pw-12,r.left)),y=r.bottom+10;if(y+96>W.innerHeight)y=Math.max(12,r.top-96);
  pop.style.left=x+'px';pop.style.top=y+'px';pop.classList.remove('on');void pop.offsetWidth;pop.classList.add('on');clearTimeout(pop._t);pop._t=setTimeout(function(){pop.classList.remove('on')},2600)}
D.addEventListener('click',function(e){var a=e.target.closest('a[data-page]');if(!a){var pop=$('#demoPop');if(pop&&pop.classList.contains('on')&&!e.target.closest('.demo-pop'))pop.classList.remove('on');return}e.preventDefault();demoPop(a)});
W.addEventListener('scroll',function(){var pop=$('#demoPop');if(pop)pop.classList.remove('on')},{passive:true});

/* ---------- search: products, the sections of this page and every question ---------- */
(function(){
  var box=$('#search'),inp=$('#srIn'),out=$('#srR');if(!box)return;var last=null,act=-1;
  var IDX=[
    {t:'Zhu 50g',d:'Everyday ceremonial, RM60',img:'assets/img/cut/zhu-f.webp',go:'#p-zhu',add:'zhu',k:'zhu everyday ceremonial latte iced hot smooth mild umami 50g'},
    {t:'Ling 50g',d:'Upper ceremonial, RM85',img:'assets/img/cut/ling-f.webp',go:'#p-ling',add:'ling',k:'ling upper ceremonial whisked sweet umami seaweed refined 50g'},
    {t:'Zhu 20g',d:'The first taste, RM30',img:'assets/img/zhu-cut.webp',go:'#promise',add:'zhu20',k:'zhu 20g trial first taste try small'},
    {t:'First order offer',d:'10% off with FIRSTWHISK',ic:'gift',go:'#promo',k:'promo code discount offer firstwhisk sale 10%'},
    {t:'Café vs home',d:'What your latte habit costs a year',ic:'calculator',go:'#maths',k:'cafe latte cost price save saving year rm26 money'},
    {t:'Leaf to cup',d:'Shaded, harvested, stone milled, sealed',ic:'plant',go:'#journey',k:'process shade grown harvest stone milled sealed fresh farm quality'},
    {t:'3 ways to drink it',d:'Whisked, iced latte, shaken',ic:'coffee',go:'#brew',k:'brew recipe how to make whisk iced latte shaken milo oat milk guide'},
    {t:'Reviews',d:'First sips, honest words',ic:'star',go:'#reviews',k:'reviews testimonials customers rating stars'},
    {t:'Our promise',d:'Not for you? We make it right',ic:'shield-check',go:'#promise',k:'guarantee refund return promise taste test'}
  ];
  $$('.qa').forEach(function(q){var s=$('summary span',q);if(s)IDX.push({t:s.textContent,d:'Question',ic:'question',go:q,k:(s.textContent+' '+$('p',q).textContent).toLowerCase()})});
  function draw(q){
    q=(q||'').trim().toLowerCase();var h='';act=-1;
    if(!q){h='<p class="sr-h">Try</p><div class="sr-tags">'+['Zhu','Ling','Iced latte','Shipping','Promo code','Storage'].map(function(s){return '<button type="button" data-q="'+s+'">'+s+'</button>'}).join('')+'</div>';q=null}
    var words=q?q.split(/\s+/):[],hits=q?IDX.filter(function(it){var s=(it.t+' '+it.d+' '+it.k).toLowerCase();return words.every(function(w){return s.indexOf(w)>-1})}):IDX.slice(0,3);
    var prod=hits.filter(function(x){return x.add}),rest=hits.filter(function(x){return !x.add});
    if(prod.length)h+='<p class="sr-h">Products</p>'+prod.map(function(it){return '<div class="sr-i" data-i="'+IDX.indexOf(it)+'" role="button" tabindex="0"><img src="'+it.img+'" alt=""><span><b>'+it.t+'</b><span>'+it.d+'</span></span><button class="btn soft" type="button" data-add="'+it.add+'" data-stay>Add</button></div>'}).join('');
    if(rest.length)h+='<p class="sr-h">On this page</p>'+rest.map(function(it){return '<div class="sr-i" data-i="'+IDX.indexOf(it)+'" role="button" tabindex="0"><i class="ph-duotone ph-'+it.ic+'" aria-hidden="true"></i><span><b>'+it.t+'</b><span>'+it.d+'</span></span></div>'}).join('');
    if(q&&!hits.length)h+='<p class="sr-none">No match for "'+q.replace(/[<>&"]/g,'')+'". Try Zhu, iced latte or shipping.</p>';
    out.innerHTML=h;
  }
  function openS(){last=D.activeElement;H.classList.add('search-open');box.setAttribute('aria-hidden','false');inp.value='';draw('');setTimeout(function(){inp.focus()},60)}
  function closeS(){H.classList.remove('search-open');box.setAttribute('aria-hidden','true');if(last&&last.focus)last.focus()}
  function go(i){var it=IDX[i];if(!it)return;closeS();var el=typeof it.go==='string'?$(it.go):it.go;if(!el)return;if(el.tagName==='DETAILS')el.open=true;setTimeout(function(){el.scrollIntoView({behavior:RM?'auto':'smooth',block:'center'})},60)}
  inp.addEventListener('input',function(){draw(inp.value)});
  inp.addEventListener('keydown',function(e){var rows=$$('.sr-i',out);if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(!rows.length)return;act=(act+(e.key==='ArrowDown'?1:-1)+rows.length)%rows.length;rows.forEach(function(r,k){r.classList.toggle('act',k===act)})}else if(e.key==='Enter'){var r=rows[act>-1?act:0];if(r)go(+r.getAttribute('data-i'))}});
  out.addEventListener('click',function(e){var tg=e.target.closest('[data-q]');if(tg){inp.value=tg.getAttribute('data-q');draw(inp.value);inp.focus();return}if(e.target.closest('[data-add]'))return;var r=e.target.closest('.sr-i');if(r)go(+r.getAttribute('data-i'))});
  out.addEventListener('keydown',function(e){var r=e.target.closest('.sr-i');if(r&&(e.key==='Enter'||e.key===' ')){e.preventDefault();go(+r.getAttribute('data-i'))}});
  $$('[data-search-open]').forEach(function(b){b.addEventListener('click',openS)});
  $$('[data-search-close]').forEach(function(b){b.addEventListener('click',closeS)});
  D.addEventListener('keydown',function(e){var typing=/INPUT|TEXTAREA/.test((D.activeElement||{}).tagName||'');
    if((e.key==='/'&&!typing)||(e.key.toLowerCase()==='k'&&(e.metaKey||e.ctrlKey))){e.preventDefault();openS()}
    else if(e.key==='Escape'&&H.classList.contains('search-open'))closeS()});
  W.SMSearch={open:openS,query:function(q){inp.value=q;draw(q);return $$('.sr-i',out).map(function(r){return IDX[+r.getAttribute('data-i')].t})}};
})();

/* ---------- their wordmark, cut into letters (glyph runs measured on logo-white.png, 1277 x 180) ---------- */
(function(){
  var RUNS=[[0,85],[100,39],[154,116],[285,88],[389,79],[484,79],[640,116],[767,187],[968,85],[1068,92],[1170,107]];
  var ok=W.CSS&&(CSS.supports('mask-image','url(x.png)')||CSS.supports('-webkit-mask-image','url(x.png)'));
  if(!ok){H.classList.add('no-mask');return}
  $$('[data-wm]').forEach(function(el){
    el.setAttribute('role','img');el.setAttribute('aria-label','Simple Matcha');
    el.innerHTML=RUNS.map(function(r,k){return '<i style="--x:'+r[0]+';--w:'+r[1]+';--k:'+k+'"></i>'}).join('')+'<span class="gl"><b></b></span>';
  });
  function play(el){if(RM)return;el.classList.remove('play');void el.offsetWidth;el.classList.add('play')}
  var nav=$('.wm-nav');
  if(nav){
    setTimeout(function(){play(nav)},H.classList.contains('intro')?2600:900);
    setInterval(function(){if(!D.hidden&&W.pageYOffset<99999)play(nav)},11000);
    nav.closest('a').addEventListener('mouseenter',function(){play(nav)});
  }
  var end=$('.wm-end');if(end)onScreen(end,function(v){if(v)play(end)},.6);
  W.SMLogo={play:function(){play(nav)}};
})();

/* ---------- reviews: 2 rows drift in opposite directions, pause under the pointer, drag or swipe ---------- */
(function(){
  $$('.row').forEach(function(row){
    var track=$('.row-t',row);if(!track)return;var dir=+row.getAttribute('data-dir')||1;
    track.innerHTML+=track.innerHTML;$$('.rcard',track).slice(track.children.length/2).forEach(function(c){c.setAttribute('aria-hidden','true')});
    var x=0,half=0,hover=false,drag=false,lx=0,v=0,vis=false,raf=0,last=0,speed=34;
    function measure(){half=track.scrollWidth/2}
    function wrap(){if(!half)return;if(x<=-half)x+=half;if(x>0)x-=half}
    function draw(){track.style.transform='translate3d('+x.toFixed(1)+'px,0,0)'}
    function step(t){raf=0;if(!vis)return;var dt=Math.min(.05,(t-(last||t))/1000);last=t;
      if(!drag){if(Math.abs(v)>2){x+=v*dt;v*=Math.pow(.06,dt)}else if(!hover&&!RM){x+=dir*speed*dt}}
      wrap();draw();raf=W.requestAnimationFrame(step)}
    function go(){if(!raf&&vis){last=0;raf=W.requestAnimationFrame(step)}}
    measure();x=dir>0?-half/2:0;wrap();draw();W.addEventListener('resize',measure);
    row.addEventListener('mouseenter',function(){hover=true});row.addEventListener('mouseleave',function(){hover=false});
    row.addEventListener('pointerdown',function(e){drag=true;lx=e.clientX;v=0;row.classList.add('drag');row.setPointerCapture(e.pointerId)});
    row.addEventListener('pointermove',function(e){if(!drag)return;var dx=e.clientX-lx;lx=e.clientX;x+=dx;v=dx*60;wrap();draw()});
    var up=function(){drag=false;row.classList.remove('drag')};row.addEventListener('pointerup',up);row.addEventListener('pointercancel',up);
    onScreen(row,function(s){vis=s;if(s)go()});
    setInterval(function(){if(vis&&!drag&&!hover&&!RM&&!raf){x+=dir*speed*.25;wrap();draw()}},250);
  });
})();

/* ---------- promo codes (SAMPLE: confirm the offer with Simple Matcha) ---------- */
var PROMOS={FIRSTWHISK:{pct:10,label:'FIRSTWHISK, 10% off'}};
var promo=null;try{promo=localStorage.getItem('sm-promo')}catch(e){}if(!PROMOS[promo])promo=null;

/* ---------- cart ---------- */
var cart={};try{cart=JSON.parse(localStorage.getItem('sm-cart')||'{}')||{}}catch(e){}
Object.keys(cart).forEach(function(k){if(!PRODUCTS[k]||!(cart[k]>0))delete cart[k]});
function save(){try{localStorage.setItem('sm-cart',JSON.stringify(cart));if(promo)localStorage.setItem('sm-promo',promo);else localStorage.removeItem('sm-promo')}catch(e){}}
function money(n){return 'RM'+(Math.round(n*100)%100?n.toFixed(2):Math.round(n).toLocaleString('en-MY'))}
function render(){
  var list=$('#cartList'),up=$('#cartUp'),n=0,sub=0,was=0,h='';
  Object.keys(cart).forEach(function(k){var p=PRODUCTS[k],q=cart[k];n+=q;sub+=p.price*q;was+=p.was*q;
    h+='<div class="ci" data-k="'+k+'"><div class="ci-i"><img src="'+p.img+'" alt=""></div><div><b>'+p.name+' <span class="han" lang="zh">'+p.han+'</span></b><span class="ci-s">'+p.sub+', '+money(p.price)+' each</span>'+
       '<div class="ci-r2"><div class="qty"><button type="button" data-d="-1" aria-label="Fewer">&minus;</button><output>'+q+'</output><button type="button" data-d="1" aria-label="More">+</button></div>'+
       '<button type="button" class="ci-rm" data-rm aria-label="Remove '+p.name+'"><i class="ph-duotone ph-trash"></i></button></div></div>'+
       '<div class="ci-p"><b>'+money(p.price*q)+'</b>'+(p.was>p.price?'<s>'+money(p.was*q)+'</s>':'')+'</div></div>';});
  if(!n)h='<div class="cd-e"><img src="assets/img/cut/zhu-f.webp" alt=""><p class="cd-et">Your cart is empty</p><p>Start with a pack. Shipping is free over RM50.</p><div><button class="btn" type="button" data-add="zhu" data-stay>Add Zhu, RM60</button><button class="btn soft" type="button" data-add="ling" data-stay>Add Ling, RM85</button></div></div>';
  list.innerHTML=h;
  var ups=['ling','zhu','zhu20'].filter(function(k){return !cart[k]}).slice(0,2);
  up.innerHTML=n&&ups.length?'<h3>Complete your ritual</h3><div class="up-g">'+ups.map(function(k){var u=PRODUCTS[k];return '<div class="up"><img src="'+u.img+'" alt=""><div><b>'+u.name+'</b><span>'+money(u.price)+'</span></div><button class="btn soft" type="button" data-add="'+k+'" data-stay>Add</button></div>'}).join('')+'</div>':'';
  var off=promo&&n?Math.round(sub*PROMOS[promo].pct)/100:0,total=sub-off,free=sub>=FREE;
  $$('[data-cart-count]').forEach(function(c){c.textContent=n});$('#cartCount').textContent=n;
  $('#cartSub').textContent=money(sub);
  $('#cartSave').textContent=money(was-sub);$('#cartSaveRow').style.display=was>sub?'':'none';
  $('#cartPromoL').textContent=promo?'Promo '+promo:'Promo';$('#cartPromo').textContent=money(off)+' off';$('#cartPromoRow').style.display=off?'':'none';
  $('#cartShip').textContent=!n?'':(free?'Free':'Flat rate at checkout');
  $('#cartTotal').textContent=money(total);
  var s=Math.min(1,sub/FREE),sh=$('.ship');sh.style.setProperty('--s',s.toFixed(3));sh.classList.toggle('free',free&&n>0);
  $('#shipMsg').innerHTML=!n?'Free shipping on orders over RM50':(free?'<b>You have free shipping</b> to West Malaysia':'Add <b>'+money(FREE-sub)+'</b> more for free shipping');
  var f=$('#promoForm');f.classList.toggle('on',!!promo);var inp=$('#promoIn');if(promo&&D.activeElement!==inp)inp.value=promo;
  $('#checkout').disabled=!n;$('#cartNote').textContent='';$('#cart').classList.toggle('empty',!n);
}
function applyPromo(code,quiet){
  code=(code||'').trim().toUpperCase();var m=$('#promoMsg');
  if(!code){promo=null;save();render();m.textContent='';m.classList.remove('err');return false}
  if(PROMOS[code]){promo=code;save();render();m.classList.remove('err');m.textContent=quiet?'Code '+code+' is on your cart: '+PROMOS[code].pct+'% off.':PROMOS[code].label+' applied.';return true}
  m.classList.add('err');m.textContent='That code is not valid. Try FIRSTWHISK.';return false;
}
$('#promoForm').addEventListener('submit',function(e){e.preventDefault();applyPromo($('#promoIn').value)});
$$('[data-copy]').forEach(function(b){b.addEventListener('click',function(){
  var c=b.getAttribute('data-copy'),done=function(){var s=$('span',b);var o=s.textContent;s.textContent='Copied';b.classList.add('done');setTimeout(function(){s.textContent=o;b.classList.remove('done')},1600)};
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(c).then(done,done);else done();
})});
$$('[data-apply-promo]').forEach(function(b){b.addEventListener('click',function(){applyPromo('FIRSTWHISK',true);openCart()})});
var lastFocus=null;
function openCart(){lastFocus=D.activeElement;$('.cd-s').scrollTop=0;H.classList.add('cart-open');$('#cart').setAttribute('aria-hidden','false');setTimeout(function(){$('.cd-x').focus()},60)}
function closeCart(){H.classList.remove('cart-open');$('#cart').setAttribute('aria-hidden','true');if(lastFocus&&lastFocus.focus)lastFocus.focus()}
function bump(){$$('[data-cart-count]').forEach(function(c){c.classList.add('pop');setTimeout(function(){c.classList.remove('pop')},350)});var b=$('.cart-b');b.classList.remove('hit');void b.offsetWidth;b.classList.add('hit')}
function add(k,q){if(!PRODUCTS[k])return;cart[k]=Math.min(24,(cart[k]||0)+(q||1));save();render()}
/* the pack flies into the cart */
function fly(k,from,then){
  var target=$('.cart-b');if(RM||!target||!from||!from.animate){then();return}
  var a=from.getBoundingClientRect(),t=target.getBoundingClientRect();if(!a.width){then();return}
  var w=Math.min(140,a.width),h=w*1.8,sx=a.left+a.width/2-w/2,sy=a.top+a.height/2-h/2;
  var im=D.createElement('img');im.className='fly';im.src=PRODUCTS[k].img;im.alt='';im.style.cssText='left:'+sx+'px;top:'+sy+'px;width:'+w+'px;height:'+h+'px';D.body.appendChild(im);
  var dx=t.left+t.width/2-(sx+w/2),dy=t.top+t.height/2-(sy+h/2);
  var an=im.animate([{transform:'translate(0,0) scale(1) rotate(0)',opacity:1},{transform:'translate('+dx*.55+'px,'+(dy*.55-120)+'px) scale(.55) rotate(-10deg)',opacity:1,offset:.55},{transform:'translate('+dx+'px,'+dy+'px) scale(.12) rotate(-18deg)',opacity:.2}],{duration:820,easing:'cubic-bezier(.5,0,.3,1)'});
  var ok=false,go=function(){if(ok)return;ok=true;im.remove();then()};an.onfinish=go;setTimeout(go,1100);
}
D.addEventListener('click',function(e){
  var t=e.target,a=t.closest('[data-add]');
  if(a){
    var k=a.getAttribute('data-add'),scope=a.closest('.pc,.hero-shop'),qo=scope&&$('[data-qty] output',scope),q=qo?+qo.textContent:1;
    if(qo)qo.textContent=1;
    if(a.closest('.cd')){add(k,q);bump();return}
    var src=a.closest('.hero-shop')?$('.hs-pk img.on'):(a.closest('[data-product]')&&$('[data-fly-src]',a.closest('[data-product]')))||a;
    fly(k,src,function(){add(k,q);bump();if(!a.hasAttribute('data-stay'))setTimeout(openCart,180)});
    return;
  }
  if(t.closest('[data-cart-open]')){openCart();return}
  if(t.closest('[data-cart-close]')){closeCart();return}
  var ci=t.closest('.ci');
  if(ci){var ck=ci.getAttribute('data-k'),b=t.closest('[data-d]');
    if(b){cart[ck]=cart[ck]+(+b.getAttribute('data-d'));if(cart[ck]<1)delete cart[ck];save();render();return}
    if(t.closest('[data-rm]')){delete cart[ck];save();render();return}}
  if(t.closest('#checkout')){$('#cartNote').textContent='Demo: on the live store this opens the Shopify checkout'+(promo?' with '+promo+' applied.':'.');return}
  var off=t.closest('a.off,[aria-disabled="true"]');if(off)e.preventDefault();
});
D.addEventListener('keydown',function(e){if(e.key==='Escape'&&H.classList.contains('cart-open'))closeCart()});
render();
W.SMCart={get:function(){return JSON.parse(JSON.stringify(cart))},promo:function(){return promo},clear:function(){cart={};promo=null;save();render()}};

/* ================= Brand Method demo ribbon (the same cloth ribbon as FAR Capital, Lirunex and IKRAM) ================= */
(function(){
  var cv=D.getElementById('bmRibbon'),fb=$('.ft-ribbon-fb'),ctx=null;try{ctx=cv&&cv.getContext('2d');}catch(e){}
  if(!ctx){if(cv)cv.style.display='none';if(fb)fb.hidden=false;return;}
  var Wd=460,Ht=110,dpr=Math.min(W.devicePixelRatio||1,2);cv.width=Wd*dpr;cv.height=Ht*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
  var X0=40,X1=420,BH=32,BY=40,running=false,looping=false,t=0,GL=null,F='600 12px "Instrument Sans",sans-serif';
  var SEGS=[{t:'DEMO BY',sp:3.6,a:1,gap:8},{star:true,w:13,gap:9},{t:'BRAND',sp:3.6,a:.98},{t:'METHOD.CO',sp:3.6,a:.98}];
  function build(){GL=[];SEGS.forEach(function(s){if(s.star){GL.push({star:true,w:s.w});if(s.gap)GL.push({gap:s.gap});return;}ctx.font=F;
    for(var i=0;i<s.t.length;i++){var ch=s.t[i];if(ch===' '){GL.push({gap:6.5});continue;}GL.push({ch:ch,a:s.a,w:ctx.measureText(ch).width+s.sp});}if(s.gap)GL.push({gap:s.gap});});}
  function wave(x,tt){return 4*Math.sin(x*.0135+tt*.0011)+2.4*Math.sin(x*.029-tt*.00068)+1.2*Math.sin(x*.055+tt*.0016);}
  function slope(x,tt){return(wave(x+2,tt)-wave(x-2,tt))/4;}
  function lerp(a,b,p){return a+(b-a)*p;}
  function shade(p){return 'rgb('+Math.round(lerp(18,86,p))+','+Math.round(lerp(28,116,p))+','+Math.round(lerp(158,255,p))+')';}
  function tail(xe,dir,tt){var y=BY+wave(xe,tt)*.7+9,x2=xe-dir*40;ctx.beginPath();ctx.moveTo(xe,y);ctx.lineTo(x2,y+7);ctx.lineTo(x2+dir*13,y+7+BH/2);ctx.lineTo(x2,y+7+BH);ctx.lineTo(xe,y+BH);ctx.closePath();ctx.fillStyle='#101C96';ctx.fill();ctx.fillStyle='rgba(0,0,0,.22)';ctx.fill();}
  function drawR(tt){if(!GL)build();ctx.clearRect(0,0,Wd,Ht);tail(X0+6,1,tt);tail(X1-6,-1,tt);var x,y,s,p;
    for(x=X0;x<=X1;x+=2){y=BY+wave(x,tt);s=slope(x,tt);p=Math.max(0,Math.min(1,.52+s*5.5+.14*Math.sin(x*.006-tt*.00042)));ctx.fillStyle=shade(p);ctx.fillRect(x-1,y,2.4,BH);}
    ctx.beginPath();for(x=X0;x<=X1;x+=4){y=BY+wave(x,tt);x===X0?ctx.moveTo(x,y+.6):ctx.lineTo(x,y+.6);}ctx.strokeStyle='rgba(255,255,255,.28)';ctx.lineWidth=1.1;ctx.stroke();
    ctx.beginPath();for(x=X0;x<=X1;x+=4){y=BY+wave(x,tt)+BH;x===X0?ctx.moveTo(x,y-.6):ctx.lineTo(x,y-.6);}ctx.strokeStyle='rgba(0,10,60,.4)';ctx.lineWidth=1.2;ctx.stroke();
    ctx.textAlign='left';ctx.textBaseline='middle';var tot=0;GL.forEach(function(g){tot+=g.w||g.gap||0;});var xs=(X0+X1)/2-tot/2;
    GL.forEach(function(g){if(g.gap){xs+=g.gap;return;}var cx2=xs+(g.w||0)/2,yy=BY+wave(cx2,tt)+BH/2+.5,a=Math.atan(slope(cx2,tt));ctx.save();ctx.translate(cx2,yy);ctx.rotate(a);
      if(g.star){ctx.strokeStyle='rgba(255,255,255,.97)';ctx.lineWidth=1.5;ctx.lineCap='round';for(var k=0;k<4;k++){var an=k*Math.PI/4;ctx.beginPath();ctx.moveTo(-Math.cos(an)*4.6,-Math.sin(an)*4.6);ctx.lineTo(Math.cos(an)*4.6,Math.sin(an)*4.6);ctx.stroke();}}
      else{ctx.font=F;ctx.fillStyle='rgba(2,8,40,.4)';ctx.fillText(g.ch,-(g.w/2)+.7,1.1);ctx.fillStyle='rgba(255,255,255,'+g.a+')';ctx.fillText(g.ch,-(g.w/2),0);}
      ctx.restore();xs+=g.w||0;});}
  function fr(){if(!running){looping=false;return;}looping=true;t+=16;drawR(t);requestAnimationFrame(fr);}
  drawR(0);if(D.fonts&&D.fonts.ready)D.fonts.ready.then(function(){GL=null;drawR(t);});
  if(RM||!('IntersectionObserver' in W))return;
  new IntersectionObserver(function(es){running=es[0].isIntersecting&&!D.hidden;if(running&&!looping)requestAnimationFrame(fr);}).observe(cv);
})();


})();
