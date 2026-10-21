/* NakGas website behaviour, shared by every page. No library. Every piece checks its own markup and does nothing
   when the page does not carry it. Content is visible without this file; it only adds motion and interaction.
   12 Oct 2026. */
(function(){
  var D=document,R=D.documentElement,W=window;
  var RM=W.matchMedia&&W.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s,c){return (c||D).querySelector(s);}
  function $$(s,c){return [].slice.call((c||D).querySelectorAll(s));}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function ease(t){return 1-Math.pow(1-t,4);}
  R.classList.add('js');

  /* ---------- language: English first (21 Oct), BM on request, remembered per browser (a new key, so older BM picks reset) */
  var LANG_KEY='nakgas-lang';
  function setLang(l){
    if(l!=='en')l='ms';
    R.setAttribute('data-lang',l);R.lang=l;
    $$('[data-setlang]').forEach(function(b){b.setAttribute('aria-pressed',String(b.getAttribute('data-setlang')===l));});
    $$('img[data-en]').forEach(function(im){
      if(!im.getAttribute('data-ms'))im.setAttribute('data-ms',im.getAttribute('src'));
      var want=l==='en'?im.getAttribute('data-en'):im.getAttribute('data-ms');
      if(im.getAttribute('src')!==want)im.setAttribute('src',want);
    });
    $$('option[data-en]').forEach(function(o){o.textContent=l==='en'?o.getAttribute('data-en'):o.getAttribute('data-ms');});
    $$('[data-alt-en]').forEach(function(im){
      if(!im.getAttribute('data-alt-ms'))im.setAttribute('data-alt-ms',im.getAttribute('alt')||'');
      im.setAttribute('alt',l==='en'?im.getAttribute('data-alt-en'):im.getAttribute('data-alt-ms'));
    });
    $$('[data-ph-en]').forEach(function(f){
      if(!f.getAttribute('data-ph-ms'))f.setAttribute('data-ph-ms',f.getAttribute('placeholder')||'');
      f.setAttribute('placeholder',l==='en'?f.getAttribute('data-ph-en'):f.getAttribute('data-ph-ms'));
    });
    var t=D.querySelector('meta[name="title-en"]');
    if(t){if(!R.getAttribute('data-title-ms'))R.setAttribute('data-title-ms',D.title);D.title=l==='en'?t.content:R.getAttribute('data-title-ms');}
    try{localStorage.setItem(LANG_KEY,l);}catch(e){}
    try{W.dispatchEvent(new CustomEvent('gl-lang',{detail:l}));}catch(e){}
  }
  W.glSetLang=setLang;
  D.addEventListener('click',function(e){var b=e.target.closest('[data-setlang]');if(b)setLang(b.getAttribute('data-setlang'));});
  var saved=null;try{saved=localStorage.getItem(LANG_KEY);}catch(e){}
  var qs=/[?&]lang=(en|ms)/.exec(location.search);
  setLang(qs?qs[1]:(saved||'en'));
  /* the language dropdown: open on click, close on a choice, outside click or Escape */
  $$('.lang-dd').forEach(function(dd){var b=$('.lang-btn',dd);if(!b)return;
    function set(o){dd.classList.toggle('open',o);b.setAttribute('aria-expanded',String(o));}
    b.addEventListener('click',function(e){e.stopPropagation();set(!dd.classList.contains('open'));});
    $$('[data-setlang]',dd).forEach(function(x){x.addEventListener('click',function(){set(false);});});
    D.addEventListener('click',function(e){if(!dd.contains(e.target))set(false);});
    D.addEventListener('keydown',function(e){if(e.key==='Escape')set(false);});});

  /* ---------- header: solid past 40 px, a progress line, the dark start over a dark hero */
  var hd=$('.hd');
  var lastY=W.scrollY||0;
  function onScroll(){
    var y=W.scrollY||0;
    if(hd){hd.classList.toggle('sm',y>40);var h=Math.max(1,D.documentElement.scrollHeight-innerHeight);hd.style.setProperty('--sp',(y/h).toFixed(4));
      /* 20 Oct: the bar hides on the way down past 120px and returns on the way up, or near the top, or while the menu is open */
      var open=D.body.classList.contains('menu-open')||D.documentElement.classList.contains('menu-open');
      if(open||y<80||y<lastY-4)hd.classList.remove('hide');else if(y>120&&y>lastY+4)hd.classList.add('hide');
      lastY=y;}
    para();
    revealCheck();
  }

  /* ---------- the phone menu */
  var menu=$('#menu'),burger=$('.burger');
  function openMenu(o){if(!menu)return;menu.classList.toggle('open',o);D.body.classList.toggle('locked',o);if(burger)burger.setAttribute('aria-expanded',String(o));if(o){var f=$('.menu-close',menu);if(f)setTimeout(function(){f.focus();},50);}else if(burger)burger.focus();}
  if(burger)burger.addEventListener('click',function(){openMenu(true);});
  if(menu){$$('.menu-close',menu).forEach(function(b){b.addEventListener('click',function(){openMenu(false);});});
    $$('nav a',menu).forEach(function(a){a.addEventListener('click',function(){openMenu(false);});});}
  D.addEventListener('keydown',function(e){if(e.key==='Escape'&&menu&&menu.classList.contains('open'))openMenu(false);});

  /* ---------- reveal as you scroll, with a rect check as the fallback (some webviews never fire the observer) */
  var RV=$$('.rv,.rv-scale,.photo');
  function show(el){el.classList.add('is-in');}
  function revealCheck(){
    if(!RV.length)return;var vh=innerHeight;
    RV=RV.filter(function(el){var r=el.getBoundingClientRect();if(r.top<vh*.92&&r.bottom>-40){show(el);return false;}return true;});
  }
  if(RM){RV.forEach(show);RV=[];}
  else if('IntersectionObserver' in W){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){show(e.target);io.unobserve(e.target);}});},{rootMargin:'0px 0px -8% 0px'});
    RV.forEach(function(el){io.observe(el);});
  }
  /* anything already above the fold or scrolled past after a beat is shown, whatever the observer did */
  setTimeout(revealCheck,1200);

  /* ---------- count ups */
  var CU=$$('[data-to]');
  function fmt(v,dec){return dec?v.toFixed(dec):String(Math.round(v));}
  function runCount(el){
    var to=parseFloat(el.getAttribute('data-to')),dec=parseInt(el.getAttribute('data-dec')||'0',10),pre=el.getAttribute('data-pre')||'',suf=el.getAttribute('data-suf')||'';
    if(RM){el.textContent=pre+fmt(to,dec)+suf;return;}
    var t0=performance.now(),dur=1500;
    (function tick(now){var p=clamp((now-t0)/dur,0,1);el.textContent=pre+fmt(to*ease(p),dec)+suf;if(p<1)requestAnimationFrame(tick);})(t0);
  }
  if(CU.length){
    if('IntersectionObserver' in W){var cio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){runCount(e.target);cio.unobserve(e.target);}});},{threshold:.4});CU.forEach(function(el){cio.observe(el);});}
    else CU.forEach(runCount);
  }

  /* ---------- the app film: steps on the left, the phone on the right, plays while on screen */
  $$('[data-film]').forEach(function(root){
    var btns=$$('.fsteps button',root),imgs=$$('.pf img',root),fl=$$('.float',root),tap=$('.tap',root),n=btns.length,i=0,t0=0,run=false,raf=0,pressed=false,HOLD=+(root.getAttribute('data-hold')||3800);
    if(!n)return;
    function set(k){var prev=i;i=(k+n)%n;pressed=false;if(tap)tap.classList.remove('on');
      btns.forEach(function(b,j){b.setAttribute('aria-current',String(j===i));});
      imgs.forEach(function(im,j){im.classList.toggle('on',j===i);im.classList.toggle('out',j===prev&&prev!==i);});
      fl.forEach(function(f){var at=(f.getAttribute('data-at')||'').split(',');f.classList.toggle('on',at.indexOf(String(i))>-1);});
      var tp=(imgs[i].getAttribute('data-tap')||'').split(',');
      if(tap&&tp.length===2){tap.style.setProperty('--tx',tp[0]+'%');tap.style.setProperty('--ty',tp[1]+'%');tap.setAttribute('data-has','1');}else if(tap)tap.removeAttribute('data-has');
      t0=performance.now();}
    function loop(now){if(!run)return;var p=(now-t0)/HOLD;
      if(!pressed&&p>.6&&tap&&tap.hasAttribute('data-has')){pressed=true;tap.classList.remove('on');void tap.offsetWidth;tap.classList.add('on');}
      if(p>=1)set(i+1);raf=requestAnimationFrame(loop);}
    function start(){if(run||RM)return;run=true;t0=performance.now();raf=requestAnimationFrame(loop);}
    function stop(){run=false;cancelAnimationFrame(raf);}
    btns.forEach(function(b,j){b.addEventListener('click',function(){set(j);});});
    set(0);
    if('IntersectionObserver' in W)new IntersectionObserver(function(es){es.forEach(function(e){e.isIntersecting?start():stop();});},{threshold:.25}).observe(root);else start();
    D.addEventListener('visibilitychange',function(){if(D.hidden)stop();});
  });

  /* ---------- the dispatch radar: nearest first, 45 seconds, decline, next accepts, the route */
  $$('[data-radar]').forEach(function(root){
    if(root.hasAttribute('data-rgl')&&(function(){try{var c=document.createElement('canvas');return !!(c.getContext('webgl'));}catch(e){return false;}})())return;   /* 21 Oct: map-gl.js draws it */
    var svg=$('svg',root),dl=$$('.dl',svg),chip=$('.radar-chip',root),num=chip&&$('b',chip),txt=chip&&$$('[data-t]',chip),steps=$$('.rsteps li',root.parentNode),
        route=$('.route',svg),truck=$('.truck',svg),run=false,raf=0,t0=0,C=2*Math.PI*22;
    var A=dl[0],B=dl[1];
    function cd(el,p){var c=$('.cd',el);if(c){c.style.strokeDasharray=C.toFixed(1);c.style.strokeDashoffset=(C*p).toFixed(1);}}
    function step(k){steps.forEach(function(s,j){s.classList.toggle('on',j===k);});}
    function say(k,n,ok){if(!chip)return;txt.forEach(function(t){t.hidden=t.getAttribute('data-t')!==String(k);});if(num)num.textContent=n==null?'':n;chip.classList.toggle('ok',!!ok);}
    var L=route?route.getTotalLength():0;
    function reset(){dl.forEach(function(d){d.classList.remove('act','off','ok');cd(d,1);});if(route){route.style.strokeDasharray=L+' '+L;route.style.strokeDashoffset=L;}if(truck)truck.style.opacity=0;}
    function frame(now){
      var t=(now-t0)/1000;
      if(t<.8){reset();step(0);say(0,null);}
      else if(t<5.3){A.classList.add('act');var p=(t-.8)/4.5;cd(A,p);step(1);say(1,Math.ceil(45*(1-p)));}
      else if(t<6.4){A.classList.remove('act');A.classList.add('off');cd(A,1);step(2);say(2,null);}
      else if(t<7.9){B.classList.add('act');var q=(t-6.4)/1.5;cd(B,q*.16);step(1);say(1,45-Math.round(q*7));}
      else if(t<10.6){B.classList.remove('act');B.classList.add('ok');cd(B,1);step(3);say(3,null,true);
        var u=clamp((t-7.9)/1.1,0,1);if(route)route.style.strokeDashoffset=(L*(1-ease(u))).toFixed(1);
        if(truck&&route){var v=clamp((t-9)/1.6,0,1),pt=route.getPointAtLength(L*ease(v));truck.style.opacity=v>0?1:0;truck.setAttribute('transform','translate('+pt.x.toFixed(1)+' '+pt.y.toFixed(1)+')');}}
      else if(t<13.2){say(4,null,true);}
      else{t0=now;}
      if(run)raf=requestAnimationFrame(frame);
    }
    function start(){if(run)return;run=true;t0=performance.now();raf=requestAnimationFrame(frame);}
    function stop(){run=false;cancelAnimationFrame(raf);}
    var rp=$('.replay',root.parentNode);if(rp)rp.addEventListener('click',function(){stop();start();});
    reset();
    if(RM){B.classList.add('ok');A.classList.add('off');if(route)route.style.strokeDashoffset=0;say(4,null,true);return;}
    if('IntersectionObserver' in W)new IntersectionObserver(function(es){es.forEach(function(e){e.isIntersecting?start():stop();});},{threshold:.2}).observe(root);else start();
  });

  /* ---------- the honest bill: pick how many cylinders, every line updates */
  $$('[data-bill]').forEach(function(root){
    var GAS=26.60,DEL=3.40,FEE=3.50,q=1,MAX=4,cur={};
    var out=$('output',root),minus=$('[data-q="-1"]',root),plus=$('[data-q="1"]',root);
    function money(v){return 'RM'+v.toFixed(2);}
    function tween(el,to){var from=cur[el.id]||to,t0=performance.now();cur[el.id]=to;if(RM||from===to){el.textContent=money(to);return;}
      (function tick(now){var p=clamp((now-t0)/450,0,1);el.textContent=money(from+(to-from)*ease(p));if(p<1)requestAnimationFrame(tick);})(t0);}
    function paint(){
      $$('[data-n]',root).forEach(function(s){s.textContent=q;});
      try{W.dispatchEvent(new CustomEvent('gl-qty',{detail:q}));}catch(e){}   /* 21 Oct: the 3D cylinders follow the bill */
      $$('[data-plural]',root).forEach(function(s){s.hidden=(s.getAttribute('data-plural')==='1')!==(q===1);});
      tween($('#b-gas'),GAS*q);tween($('#b-del'),DEL*q);tween($('#b-fee'),FEE);tween($('#b-tot'),GAS*q+DEL*q+FEE);
      var tot=GAS*q+DEL*q+FEE,parts=[GAS*q,DEL*q,FEE],an=$('[data-anat]');
      if(an){var seg=$$('.anat-bar i',an);parts.forEach(function(v,k){if(seg[k])seg[k].style.width=(v/tot*100).toFixed(2)+'%';});
        ['gas','del','fee'].forEach(function(id,k){var a=$('#a-'+id),pc=$('#p-'+id);if(a)tween(a,parts[k]);if(pc)pc.textContent=Math.round(parts[k]/tot*100)+'%';});}
      minus.disabled=q<=1;plus.disabled=q>=MAX;
    }
    [minus,plus].forEach(function(b){b.addEventListener('click',function(){q=clamp(q+parseInt(b.getAttribute('data-q'),10),1,MAX);paint();});});
    paint();
  });

  /* ---------- the card spotlight follows the pointer */
  $$('.card').forEach(function(c){c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect();c.style.setProperty('--px',(e.clientX-r.left)+'px');c.style.setProperty('--py',(e.clientY-r.top)+'px');});});

  /* ---------- photo bands drift a little slower than the page */
  var BG=$$('.band .bg');
  function para(){if(RM||!BG.length)return;var vh=innerHeight;BG.forEach(function(b){var r=b.parentNode.getBoundingClientRect();if(r.bottom<0||r.top>vh)return;var p=(r.top+r.height/2-vh/2)/(vh+r.height);b.style.transform='translate3d(0,'+(p*-14).toFixed(2)+'%,0)';});}

  /* ---------- forms. 21 Oct: on the local preview they are checked and nothing is sent (sample forms). On a real host
     html.live is set and a valid form posts to Netlify Forms (the form carries data-netlify, form-name and a honeypot),
     or to the form's action if the developer sets one. A failed send shows the error line, never a false "received".
     ?forms=demo or ?forms=live forces a mode for testing. */
  var FM=(location.search.match(/[?&]forms=(demo|live)/)||[])[1];
  var LIVE=FM?FM==='live':(location.protocol!=='file:'&&!/^(localhost|127\.|0\.0\.0\.0|\[::1\]|.+\.localhost$|.+\.local$|.+\.test$)/.test(location.hostname));
  if(LIVE)R.classList.add('live');
  $$('form[data-form]').forEach(function(f){
    f.setAttribute('novalidate','');
    $$('.file input',f).forEach(function(inp){inp.addEventListener('change',function(){var s=$('span[data-file]',inp.closest('.file'));if(s&&inp.files&&inp.files[0])s.textContent=inp.files[0].name;});});
    function bad(el,on){var w=el.closest('.field')||el.closest('.check');if(w)w.classList.toggle('bad',on);}
    f.addEventListener('input',function(e){bad(e.target,false);});
    f.addEventListener('change',function(e){bad(e.target,false);});
    f.addEventListener('submit',function(e){
      e.preventDefault();var first=null;
      $$('[data-req]',f).forEach(function(el){
        if(!el.getClientRects().length&&el.type!=='checkbox')return;
        var v=el.type==='checkbox'?el.checked:String(el.value||'').trim(),ok=!!v;
        if(ok&&el.type==='tel')ok=/^(\+?6?0)1\d[\s-]?\d{3,4}[\s-]?\d{4}$/.test(String(el.value).replace(/\s+/g,' ').trim());
        if(ok&&el.type==='email')ok=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim());
        bad(el,!ok);if(!ok&&!first)first=el;
      });
      if(first){first.focus();return;}
      function done(){f.classList.add('sent');var d=$('.done',f);if(d){d.setAttribute('tabindex','-1');d.focus();}
        f.scrollIntoView({behavior:RM?'auto':'smooth',block:'center'});}
      if(!R.classList.contains('live')){done();return;}
      var btn=$('button[type=submit]',f),fail=$('.ffail',f),fd=new FormData(f),multi=/multipart/.test(f.getAttribute('enctype')||'');
      if(fail)fail.hidden=true;if(btn)btn.disabled=true;
      fetch(f.getAttribute('action')||'/',multi?{method:'POST',body:fd}:{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(fd).toString()})
        .then(function(r){if(!r.ok)throw new Error(r.status);done();})
        .catch(function(){if(fail){fail.hidden=false;fail.focus&&fail.setAttribute('tabindex','-1');}})
        .then(function(){if(btn)btn.disabled=false;});
    });
    $$('[data-again]',f).forEach(function(b){b.addEventListener('click',function(){f.reset();f.classList.remove('sent');$$('span[data-file]',f).forEach(function(s){s.textContent=s.getAttribute('data-empty')||'';});});});
  });

  /* ---------- try the real app: the prototype in a frame, scaled to fit, in the page's language */
  $$('[data-try]').forEach(function(box){
    var fr=$('iframe',box),src=fr.getAttribute('data-src'),loaded=false;
    function fit(){var host=box.closest('.in')||box.parentNode,w=Math.min(host.getBoundingClientRect().width,innerWidth-40)||402,k=Math.min(1,(w-8)/402,(innerHeight*.86)/842);k=Math.max(.62,k);box.style.setProperty('--k',k.toFixed(3));}
    function lang(){var want=R.getAttribute('data-lang')==='en'?'en':'bm';try{var G=fr.contentWindow.GS,B=fr.contentWindow.GSB;if(!G||!B)return;if(G.S.lang!==want){G.S.lang=want;B.open(G.S.cur[G.S.prod]||'c-splash');}}catch(e){/* opened from files: the frame is another origin, so ask by message */try{fr.contentWindow.postMessage({gsLang:want},'*');}catch(_){}}}
    function load(){if(loaded)return;loaded=true;fr.src=src;}
    fr.addEventListener('load',function(){setTimeout(function(){lang();box.classList.add('ready');},250);});
    W.addEventListener('gl-lang',lang);
    W.addEventListener('resize',fit);fit();
    var rs=$('[data-restart]',box.parentNode.parentNode);if(rs)rs.addEventListener('click',function(){box.classList.remove('ready');fr.src=src+'&r='+Date.now();});
    if('IntersectionObserver' in W)new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)load();});},{rootMargin:'600px 0px'}).observe(box);else load();
  });

  /* ---------- the download page names the right store for this phone */
  var dn=$('[data-device]');
  if(dn){var ua=navigator.userAgent||'',k=/iPhone|iPad|iPod/.test(ua)?'ios':/Android/.test(ua)?'android':'';if(k){var el=$('[data-device-'+k+']');if(el){el.classList.add('on');}}}

  /* ---------- "Demo by BrandMethod.co": the cloth ribbon every Brand Method demo ends with (from the Lirunex build).
     Three sines move the band, the local slope shades it and turns each letter. Runs only while on screen. */
  (function(){
    var cv=D.getElementById('bmRibbon'),fb=$('.ft-ribbon-fb'),ctx=null;try{ctx=cv&&cv.getContext('2d');}catch(e){}
    if(!cv)return;if(!ctx){cv.style.display='none';if(fb)fb.hidden=false;return;}
    var Wd=460,Hd=110,dpr=Math.min(W.devicePixelRatio||1,2);cv.width=Wd*dpr;cv.height=Hd*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    var X0=40,X1=420,BH=32,BY=40,running=false,t=0,GL=null,F='600 12px Inter,sans-serif';
    var SEGS=[{t:'DEMO BY',sp:3.6,a:1,gap:8},{star:true,w:13,gap:9},{t:'BRAND',sp:3.6,a:.98},{t:'METHOD.CO',sp:3.6,a:.98}];
    function build(){GL=[];SEGS.forEach(function(sg){if(sg.star){GL.push({star:true,w:sg.w});if(sg.gap)GL.push({gap:sg.gap});return;}ctx.font=F;
      for(var k=0;k<sg.t.length;k++){var ch=sg.t[k];if(ch===' '){GL.push({gap:6.5});continue;}GL.push({ch:ch,a:sg.a,w:ctx.measureText(ch).width+sg.sp});}if(sg.gap)GL.push({gap:sg.gap});});}
    function wave(x,tt){return 4*Math.sin(x*.0135+tt*.0011)+2.4*Math.sin(x*.029-tt*.00068)+1.2*Math.sin(x*.055+tt*.0016);}
    function slope(x,tt){return(wave(x+2,tt)-wave(x-2,tt))/4;}
    function lerp(a,b,p){return a+(b-a)*p;}
    function shade(p){return 'rgb('+Math.round(lerp(18,86,p))+','+Math.round(lerp(28,116,p))+','+Math.round(lerp(158,255,p))+')';}
    function tail(xe,dir,tt){var y=BY+wave(xe,tt)*.7+9,x2=xe-dir*40;ctx.beginPath();ctx.moveTo(xe,y);ctx.lineTo(x2,y+7);ctx.lineTo(x2+dir*13,y+7+BH/2);ctx.lineTo(x2,y+7+BH);ctx.lineTo(xe,y+BH);ctx.closePath();ctx.fillStyle='#101C96';ctx.fill();ctx.fillStyle='rgba(0,0,0,.22)';ctx.fill();}
    function draw(tt){if(!GL)build();ctx.clearRect(0,0,Wd,Hd);tail(X0+6,1,tt);tail(X1-6,-1,tt);var x,y,sl,p;
      for(x=X0;x<=X1;x+=2){y=BY+wave(x,tt);sl=slope(x,tt);p=Math.max(0,Math.min(1,.52+sl*5.5+.14*Math.sin(x*.006-tt*.00042)));ctx.fillStyle=shade(p);ctx.fillRect(x-1,y,2.4,BH);}
      ctx.beginPath();for(x=X0;x<=X1;x+=4){y=BY+wave(x,tt);x===X0?ctx.moveTo(x,y+.6):ctx.lineTo(x,y+.6);}ctx.strokeStyle='rgba(255,255,255,.28)';ctx.lineWidth=1.1;ctx.stroke();
      ctx.beginPath();for(x=X0;x<=X1;x+=4){y=BY+wave(x,tt)+BH;x===X0?ctx.moveTo(x,y-.6):ctx.lineTo(x,y-.6);}ctx.strokeStyle='rgba(0,10,60,.4)';ctx.lineWidth=1.2;ctx.stroke();
      ctx.textAlign='left';ctx.textBaseline='middle';var tot=0;GL.forEach(function(g){tot+=g.w||g.gap||0;});var xs=(X0+X1)/2-tot/2;
      GL.forEach(function(g){if(g.gap){xs+=g.gap;return;}var cx=xs+(g.w||0)/2,yy=BY+wave(cx,tt)+BH/2+.5,a=Math.atan(slope(cx,tt));ctx.save();ctx.translate(cx,yy);ctx.rotate(a);
        if(g.star){ctx.strokeStyle='rgba(255,255,255,.97)';ctx.lineWidth=1.5;ctx.lineCap='round';for(var k=0;k<4;k++){var an=k*Math.PI/4;ctx.beginPath();ctx.moveTo(-Math.cos(an)*4.6,-Math.sin(an)*4.6);ctx.lineTo(Math.cos(an)*4.6,Math.sin(an)*4.6);ctx.stroke();}}
        else{ctx.font=F;ctx.fillStyle='rgba(2,8,40,.4)';ctx.fillText(g.ch,-(g.w/2)+.7,1.1);ctx.fillStyle='rgba(255,255,255,'+g.a+')';ctx.fillText(g.ch,-(g.w/2),0);}
        ctx.restore();xs+=g.w||0;});}
    function frame(){if(!running)return;t+=16;draw(t);requestAnimationFrame(frame);}
    draw(0);if(D.fonts&&D.fonts.ready)D.fonts.ready.then(function(){GL=null;draw(t);});
    if(RM)return;
    if('IntersectionObserver' in W)new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){if(!running){running=true;requestAnimationFrame(frame);}}else running=false;});}).observe(cv);
  })();

  /* ---------- the hero entrance */
  var hero=$('.hero,.phero');if(hero){requestAnimationFrame(function(){requestAnimationFrame(function(){hero.classList.add('go');});});setTimeout(function(){hero.classList.add('go');},120);}   /* 21 Oct: a timer too, so the copy shows even where animation frames are paused */

  W.addEventListener('scroll',onScroll,{passive:true});W.addEventListener('resize',onScroll);onScroll();
})();

/* ---------- 20 Oct: the nav pill follows the hovered link and rests on the current page */
(function(){var nav=document.querySelector('.hd .nav'),pill=nav&&nav.querySelector('.pill');if(!pill)return;
  var cur=nav.querySelector('a[aria-current="page"]');
  function to(a){if(!a){pill.classList.remove('on');return;}var r=a.getBoundingClientRect(),n=nav.getBoundingClientRect();pill.style.left=(r.left-n.left)+'px';pill.style.width=r.width+'px';pill.classList.add('on');}
  nav.addEventListener('pointerover',function(e){var a=e.target.closest('a');if(a)to(a);});
  nav.addEventListener('pointerleave',function(){to(cur);});
  nav.addEventListener('focusin',function(e){var a=e.target.closest('a');if(a)to(a);});
  nav.addEventListener('focusout',function(){to(cur);});
  function rest(){pill.style.transition='none';to(cur);requestAnimationFrame(function(){pill.style.transition='';});}
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(rest);else rest();
  addEventListener('resize',rest);
})();

/* 21 Oct 2026: the hero scenes, now video. Each clip plays once; near its end the next fades in and starts, and the set loops.
   Paused off screen and when the tab is hidden; reduced motion keeps the first poster still. Photos (img.hs) still cross fade. */
(function(){
  var bg=document.querySelector('.hero [data-scenes]');if(!bg)return;
  var el=[].slice.call(bg.querySelectorAll('.hs')),n=el.length,i=0,run=false,raf=0,t0=0,HOLD=5600,FADE=.9;
  var RMq=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(n<2||RMq)return;
  function isV(x){return x.tagName==='VIDEO';}
  function show(k){var prev=i;i=(k+n)%n;el.forEach(function(x,j){x.classList.toggle('on',j===i);});
    var v=el[i];if(isV(v)){try{v.currentTime=0;}catch(e){}var p=v.play();if(p&&p.catch)p.catch(function(){});}
    var o=el[prev];if(o!==v&&isV(o))setTimeout(function(){if(!o.classList.contains('on'))o.pause();},1600);
    var nx=el[(i+1)%n];if(isV(nx)&&nx.preload!=='auto'){nx.preload='auto';try{nx.load();}catch(e){}}
    t0=performance.now();}
  function loop(now){if(!run)return;var v=el[i];
    if(isV(v)){if(v.duration&&v.currentTime>=v.duration-FADE)show(i+1);else if(!v.duration&&now-t0>HOLD)show(i+1);}
    else if(now-t0>HOLD)show(i+1);
    raf=requestAnimationFrame(loop);}
  function start(){if(run)return;run=true;var v=el[i];if(isV(v)){var p=v.play();if(p&&p.catch)p.catch(function(){});}t0=performance.now();raf=requestAnimationFrame(loop);}
  function stop(){run=false;cancelAnimationFrame(raf);el.forEach(function(x){if(isV(x))x.pause();});}
  show(0);
  if('IntersectionObserver' in window)new IntersectionObserver(function(es){es.forEach(function(e){e.isIntersecting?start():stop();});},{threshold:.1}).observe(bg);else start();
  document.addEventListener('visibilitychange',function(){document.hidden?stop():start();});
})();

/* 21 Oct 2026: How it works: the phone follows the step in the middle of the screen */
(function(){
  var root=document.querySelector('[data-flow]');if(!root)return;
  var steps=[].slice.call(root.querySelectorAll('.fstep')),imgs=[].slice.call(root.querySelectorAll('.fphone img')),dots=[].slice.call(root.querySelectorAll('.fdots i')),cur=-1;
  function set(k){if(k===cur)return;cur=k;steps.forEach(function(s,j){s.classList.toggle('on',j===k);});imgs.forEach(function(m,j){m.classList.toggle('on',j===k);if(Math.abs(j-k)<=1)m.loading='eager';});dots.forEach(function(d,j){d.classList.toggle('on',j===k);});}
  set(0);
  if(!('IntersectionObserver' in window)){steps.forEach(function(s){s.classList.add('on');});return;}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)set(+e.target.getAttribute('data-step'));});},{rootMargin:'-45% 0px -45% 0px'});
  steps.forEach(function(s){io.observe(s);});
})();
