/* IKRAM, Web Prototype 1, pass 2 (13 Nov 2026). One loop drives every scroll story; content is visible by default (?still turns every reveal on). */
(function(){
'use strict';
var D=document,H=D.documentElement,W=window;
var STILL=H.classList.contains('still');
var RM=W.matchMedia&&W.matchMedia('(prefers-reduced-motion: reduce)').matches;
var FINE=W.matchMedia&&W.matchMedia('(hover:hover) and (pointer:fine)').matches;
var $=function(s,c){return (c||D).querySelector(s)},$$=function(s,c){return Array.prototype.slice.call((c||D).querySelectorAll(s))};
var clamp=function(v,a,b){return v<a?a:v>b?b:v};
function barH(){return parseFloat(getComputedStyle(H).getPropertyValue('--bmx-bar'))||0}

/* custom icon set, 48 grid: .s lines draw in, .a is the green accent */
var IC={
 seimbang:'<path class="s" d="M6 31h36"/><path class="s" d="M24 31l-6 10h12z"/><circle class="s" cx="12" cy="24" r="5.5"/><circle class="s" cx="36" cy="24" r="5.5"/><circle class="a" cx="24" cy="12" r="3.5"/>',
 adil:'<path class="s" d="M24 10v30"/><path class="s" d="M16 41h16"/><path class="s" d="M8 17h32"/><path class="s" d="M8 17L3 28M8 17l5 11"/><path class="s" d="M40 17l-5 11M40 17l5 11"/><path class="s" d="M3 28h10a5 5 0 01-10 0z"/><path class="s" d="M35 28h10a5 5 0 01-10 0z"/><circle class="a" cx="24" cy="8" r="3"/>',
 cemerlang:'<path class="s" d="M24 5l3.2 8.6 9.2.4-7.2 5.7 2.5 8.8L24 23.5l-7.7 5 2.5-8.8-7.2-5.7 9.2-.4z"/><path class="s" d="M24 29v8"/><path class="s" d="M16 42h16"/><circle class="a" cx="39" cy="7" r="2.6"/>',
 keluarga:'<path class="s" d="M6 22L24 8l18 14"/><path class="s" d="M11 19v21h26V19"/><path class="a" d="M24 35s-7-4.2-7-8.8a3.8 3.8 0 017-2.1 3.8 3.8 0 017 2.1c0 4.6-7 8.8-7 8.8z"/>',
 masyarakat:'<circle class="s" cx="24" cy="15" r="5.5"/><path class="s" d="M14 38a10 10 0 0120 0"/><circle class="s" cx="10" cy="20" r="4"/><path class="s" d="M3 36a7 7 0 0111-5.8"/><circle class="s" cx="38" cy="20" r="4"/><path class="s" d="M45 36a7 7 0 00-11-5.8"/><circle class="a" cx="24" cy="15" r="2.2"/>',
 ubah:'<path class="s" d="M6 38l12-12 7 7 15-17"/><path class="s" d="M31 16h9v9"/><circle class="a" cx="6" cy="38" r="3.2"/>',
 borang:'<path class="s" d="M13 5h15l9 9v29H13z"/><path class="s" d="M28 5v9h9"/><path class="s" d="M19 22h12"/><path class="s" d="M19 28h12"/><path class="s" d="M19 34h7"/><circle class="a" cx="35" cy="39" r="4.5"/>',
 emel:'<rect class="s" x="4" y="11" width="34" height="24" rx="3"/><path class="s" d="M5 13l16 12 16-12"/><circle class="a" cx="38" cy="35" r="7.5"/><path class="s w" d="M34.6 35.2l2.4 2.4 4.4-4.8"/>',
 lencana:'<circle class="s" cx="24" cy="19" r="12"/><path class="s" d="M17 29l-3 13 10-5 10 5-3-13"/><path class="s" d="M19 19l3.5 3.5L29.5 16"/><circle class="a" cx="37" cy="8" r="2.8"/>',
 buku:'<path class="s" d="M24 13c-5-4-12-4-19-2v26c7-2 14-2 19 2 5-4 12-4 19-2V11c-7-2-14-2-19 2z"/><path class="s" d="M24 13v26"/><circle class="a" cx="37" cy="6" r="2.8"/>',
 sendiri:'<circle class="s" cx="13" cy="17" r="5"/><path class="s" d="M4 38a9 9 0 0118 0"/><circle class="s f" cx="33" cy="13" r="3.5"/><circle class="s f" cx="42" cy="22" r="3.5"/><circle class="s f" cx="30" cy="26" r="3.5"/><circle class="a" cx="13" cy="17" r="2"/>',
 bantuan:'<circle class="s" cx="24" cy="24" r="16"/><circle class="s" cx="24" cy="24" r="7"/><path class="s" d="M12.7 12.7l6.4 6.4M35.3 12.7l-6.4 6.4M12.7 35.3l6.4-6.4M35.3 35.3l-6.4-6.4"/><circle class="a" cx="24" cy="24" r="2.8"/>',
 ahli:'<circle class="s" cx="24" cy="15" r="7"/><path class="s" d="M10 41a14 14 0 0128 0"/><circle class="a" cx="38" cy="9" r="3"/>',
 cawangan:'<path class="s" d="M24 43s-13-11.5-13-23a13 13 0 0126 0c0 11.5-13 23-13 23z"/><circle class="a" cx="24" cy="20" r="5"/>',
 dunia:'<circle class="s" cx="24" cy="24" r="17"/><ellipse class="s" cx="24" cy="24" rx="7.5" ry="17"/><path class="s" d="M7 24h34"/><path class="s" d="M10 15h28M10 33h28"/><circle class="a" cx="40" cy="8" r="3"/>',
 institusi:'<path class="s" d="M5 17L24 7l19 10z"/><path class="s" d="M10 21v15M18 21v15M30 21v15M38 21v15"/><path class="s" d="M5 41h38"/><circle class="a" cx="24" cy="13" r="2.2"/>',
 sekolah:'<path class="s" d="M3 18l21-9 21 9-21 9z"/><path class="s" d="M12 22v10c0 3 5.4 6 12 6s12-3 12-6V22"/><path class="s" d="M45 18v11"/><circle class="a" cx="45" cy="31" r="2.6"/>'
};
var NEWIC=!!W.IKRAM_IC;if(NEWIC)IC=W.IKRAM_IC;
var IC3=['seimbang','adil','cemerlang','buku','sendiri','bantuan','ahli','cawangan','dunia','institusi','sekolah','keluarga','masyarakat','ubah','borang','emel','lencana'];
$$('[data-ic]').forEach(function(el){
  var key=el.getAttribute('data-ic');
  if(IC3.indexOf(key)>-1){var src='assets/img/ic3d/'+key+'.webp';el.classList.add('ic3d');el.style.setProperty('--m','url("'+new URL(src,location.href).href+'")');el.innerHTML='<span class="i3"><img src="'+src+'" alt="" draggable="false" decoding="async"><i class="i3s"></i></span>';return;}
  var n=IC[key];if(!n)return;
  var vb=NEWIC?64:48;el.innerHTML='<svg viewBox="0 0 '+vb+' '+vb+'" aria-hidden="true" focusable="false">'+n+'</svg>';
  var k=0;$$('.s,.d,.a',el).forEach(function(p){if(p.classList.contains('s')){p.setAttribute('pathLength','1');var tg=p.tagName.toLowerCase(),dd=p.getAttribute('d')||'';if(!NEWIC&&!p.classList.contains('w')&&(tg==='circle'||tg==='rect'||tg==='ellipse'||/z\s*$/i.test(dd)))p.classList.add('fl');}p.style.setProperty('--k',k++);});
});
function draw(ic,again){if(again){ic.classList.remove('on','idle');void ic.getBoundingClientRect();}ic.classList.add('on');clearTimeout(ic._t);ic._t=setTimeout(function(){ic.classList.add('idle')},2400);}

/* smooth scroll */
var lenis=null;
if(!STILL&&!RM&&W.Lenis){try{lenis=new W.Lenis({lerp:.1,smoothWheel:true});}catch(e){lenis=null}}

/* hero letters */
$$('[data-chars]').forEach(function(el,li){var t=el.textContent,o='';for(var i=0;i<t.length;i++)o+='<span class="ch" style="--i:'+(i+li*6)+'">'+t[i]+'</span>';el.innerHTML=o;});

/* loader */
var ld=$('#ld'),ldN=$('.ld-n'),ldRs=$$('.ld-r'),ldWs=$$('.ld-w span'),ldWi=-1;
function ldSet(v){ldRs.forEach(function(r,k){r.style.strokeDashoffset=(1-clamp((v-k*.25)*4,0,1)).toFixed(4)});var wi=Math.min(3,Math.floor(v*4));if(wi!==ldWi){ldWi=wi;ldWs.forEach(function(w,k){w.classList.toggle('on',k===wi);w.classList.toggle('past',k<wi)})}ldN.textContent=Math.round(v*100);}
function ready(){H.classList.add('ready');playFilm();}
if(!ld||STILL||/[?&]noload\b/.test(location.search)){if(ld)ld.remove();ready();}
else{
  var t0=performance.now(),loaded=0,want=3,done=false,bump=function(){loaded++};
  (D.fonts&&D.fonts.ready?D.fonts.ready:Promise.resolve()).then(bump);
  var pv=new Image();pv.onload=pv.onerror=bump;pv.src='assets/img/film/hero-poster.jpg';
  var fv=$('#film');if(fv){fv.addEventListener('canplay',bump,{once:true});fv.load();}else bump();
  (function tick(now){
    var el=now-t0,real=loaded/want,shown=clamp(Math.min(el/2200,real*.6+Math.min(el/2200,1)*.4),0,1);if(el>4500)shown=1;
    ldSet(shown);
    if((shown>=1||(real>=1&&el>2200))&&!done){done=true;ldSet(1);
      setTimeout(function(){ld.classList.add('out');ready();setTimeout(function(){ld.remove()},1500)},380);return;}
    requestAnimationFrame(tick);
  })(t0);
}

/* hero film plays only while seen */
var film=$('#film'),filmOn=true;
function playFilm(){if(film&&filmOn&&!STILL){var p=film.play();if(p&&p.catch)p.catch(function(){});}}
if(film&&'IntersectionObserver' in W)new IntersectionObserver(function(es){filmOn=es[0].isIntersecting;if(filmOn&&H.classList.contains('ready'))playFilm();else film.pause();}).observe($('.hero-pin'));

/* the closing film: loads when near, plays only while seen */
var fcv=$('.fc-v');
if(fcv&&'IntersectionObserver' in W&&!STILL)new IntersectionObserver(function(es){var on=es[0].isIntersecting;if(on){if(!fcv.getAttribute('src'))fcv.src=fcv.dataset.src;var p=fcv.play();if(p&&p.catch)p.catch(function(){});}else fcv.pause();},{rootMargin:'200px 0px'}).observe($('.fc'));

/* split headlines into rising words */
function splitWords(node){var i=0;(function walk(n){Array.prototype.slice.call(n.childNodes).forEach(function(c){
  if(c.nodeType===3){var f=D.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(function(t){if(!t)return;if(/^\s+$/.test(t)){f.appendChild(D.createTextNode(' '));return}var m=D.createElement('span');m.className='wm';var w=D.createElement('span');w.className='wi';w.style.setProperty('--i',i++);w.textContent=t;m.appendChild(w);f.appendChild(m);});n.replaceChild(f,c);}
  else if(c.nodeType===1)walk(c);});})(node);}
$$('[data-split]').forEach(splitWords);

/* manifesto words light with the scroll */
var st=$('[data-st]'),words=[];
if(st){var out=D.createDocumentFragment();Array.prototype.slice.call(st.childNodes).forEach(function(n){var em=n.nodeType===1,host=em?n.cloneNode(false):out;n.textContent.split(/(\s+)/).forEach(function(t){if(!t)return;if(/^\s+$/.test(t)){host.appendChild(D.createTextNode(t));return}var s=D.createElement('span');s.className='w'+(em?' em':'');s.textContent=t;host.appendChild(s);words.push(s);});if(em)out.appendChild(host);});st.textContent='';st.appendChild(out);}

/* reveals, icons, steps */
if('IntersectionObserver' in W&&!STILL){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}})},{rootMargin:'0px 0px -8% 0px',threshold:.06});
  $$('.rv,[data-split]').forEach(function(el){io.observe(el)});
  var ioI=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){draw(e.target);ioI.unobserve(e.target);}})},{threshold:.5});
  $$('.ic').forEach(function(el){ioI.observe(el)});
  var ioS=new IntersectionObserver(function(es){es.forEach(function(e){e.target.classList.toggle('in',e.isIntersecting);var ic=$('.ic',e.target);if(ic&&e.isIntersecting)draw(ic,true);})},{rootMargin:'-38% 0px -38% 0px'});
  $$('[data-stp]').forEach(function(el){ioS.observe(el)});
}else{$$('.rv,[data-split],[data-stp]').forEach(function(el){el.classList.add('in')});$$('.ic').forEach(function(el){el.classList.add('on')});}

/* hover: icons redraw, the light follows the pointer, buttons lean toward it */
$$('.spot,.hd-card').forEach(function(c){
  c.addEventListener('pointerenter',function(){var ic=$('.ic',c);if(ic&&ic.classList.contains('on'))draw(ic,true);});
  c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px');});
});
if(FINE&&!RM)$$('.btn').forEach(function(b){
  b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;b.style.setProperty('--bx',x+'px');b.style.setProperty('--by',y+'px');b.style.transform='translate('+((x-r.width/2)*.18).toFixed(1)+'px,'+((y-r.height/2)*.3).toFixed(1)+'px)';});
  b.addEventListener('pointerleave',function(){b.style.transform='';});
});

/* figures: rolling digits, and each card keeps its own icon large in the back */
function fmt(n){return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,',')}
$$('[data-n]').forEach(function(b){var t=fmt(+b.dataset.n),h='',k=0;for(var i=0;i<t.length;i++){var c=t[i];if(/\d/.test(c)){var col='';for(var j=0;j<20;j++)col+='<span>'+(j%10)+'</span>';h+='<span class="od"><span class="odc" style="--d:'+(+c+10)+';--k:'+(k++)+'">'+col+'</span></span>';}else h+='<span class="odp">'+c+'</span>';}b.innerHTML='<span class="sr">'+t+'</span>'+h.replace(/<span class="od">/g,'<span class="od" aria-hidden="true">').replace(/<span class="odp">/g,'<span class="odp" aria-hidden="true">');});
function sizeOd(){$$('.num b').forEach(function(b){$$('.od',b).forEach(function(od){var d=parseInt(od.firstChild.style.getPropertyValue('--d'),10)-10,pr=D.createElement('span');pr.textContent=d;pr.style.cssText='position:absolute;visibility:hidden;white-space:nowrap';b.appendChild(pr);od.style.width=pr.getBoundingClientRect().width+'px';b.removeChild(pr);});});}
sizeOd();if(D.fonts&&D.fonts.ready)D.fonts.ready.then(sizeOd);addEventListener('resize',sizeOd);
$$('.num').forEach(function(c){var ic=$('.ic',c);if(!ic||!$('svg',ic))return;var w=D.createElement('i');w.className='wmk';w.setAttribute('aria-hidden','true');w.innerHTML=$('svg',ic).outerHTML;c.appendChild(w);});
if(!STILL&&'IntersectionObserver' in W){var io3=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('roll');io3.unobserve(e.target);}})},{threshold:.4});$$('.num').forEach(function(c){io3.observe(c)});}else $$('.num').forEach(function(c){c.classList.add('roll')});

/* hero: the description turns through the four circles, about every 2.6 s; a step jumps to its line */
var hrB=$('[data-hr]'),hrL=hrB?$$('.hr-l',hrB):[],hrS=hrB?$$('.hr-s',hrB):[],hrI=0,hrT=null;
function hrGo(i){if(i===hrI)return;hrL.forEach(function(l,k){l.classList.remove('out');if(k===hrI)l.classList.add('out');l.classList.toggle('on',k===i)});hrS.forEach(function(b,k){b.classList.toggle('on',k===i);b.classList.toggle('done',k<i)});hrI=i;}
function hrRun(){clearInterval(hrT);hrT=setInterval(function(){if(!D.hidden)hrGo((hrI+1)%hrL.length)},2600);}
if(hrB&&!STILL&&!RM){hrRun();hrS.forEach(function(b){b.addEventListener('click',function(){hrGo(+b.dataset.hrGo);hrS[hrI].classList.remove('on');void hrS[hrI].offsetWidth;hrS[hrI].classList.add('on');hrRun();})});}

/* nav and menu */
var nav=$('#nav'),lastY=scrollY,menu=$('#menu'),burger=$('.burger');
if(burger)burger.addEventListener('click',function(){var o=!menu.classList.contains('open');menu.classList.toggle('open',o);burger.setAttribute('aria-expanded',o);});
$$('#menu a').forEach(function(a){a.addEventListener('click',function(){menu.classList.remove('open');burger.setAttribute('aria-expanded','false');})});

/* anchors through Lenis, landing under the bar and the nav */
D.addEventListener('click',function(e){
  var a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a)return;
  var id=a.getAttribute('href');var t=id==='#top'?D.body:(id.length>1?$(id):null);if(!t)return;e.preventDefault();
  var y=id==='#top'?0:t.getBoundingClientRect().top+scrollY-barH()-(/perjalanan|kesukaran|bersama/.test(id)?0:40);
  if(lenis)lenis.scrollTo(y,{duration:1.6});else scrollTo({top:y,behavior:'smooth'});
});

/* demo lock: outside links and forms; the ribbon is never locked */
var toast=$('#toast'),tt=null;
function say(m){toast.textContent=m;toast.classList.add('on');clearTimeout(tt);tt=setTimeout(function(){toast.classList.remove('on')},2600);}
D.addEventListener('click',function(e){
  var a=e.target.closest&&e.target.closest('a');if(!a||a.closest('.ft-ribbon'))return;
  var h=a.getAttribute('href')||'';
  if(a.hasAttribute('data-page')){e.preventDefault();say('Halaman '+a.getAttribute('data-page')+' belum tersedia dalam demo ini.');return;}
  if(a.hasAttribute('data-out')||/^https?:/.test(h)){e.preventDefault();say('Prototaip: pautan ini akan dibuka di laman sebenar.');}
});
$$('form[data-demo]').forEach(function(f){f.addEventListener('submit',function(e){e.preventDefault();say('Prototaip: borang ini akan berfungsi di laman sebenar.');})});

/* the film section: YouTube in place, only loaded on play */
var yt=$('#yt');
function playYT(){if(!yt||yt.classList.contains('on'))return;yt.classList.add('on');yt.insertAdjacentHTML('beforeend','<iframe src="https://www.youtube-nocookie.com/embed/'+yt.dataset.yt+'?autoplay=1&rel=0&modestbranding=1&playsinline=1" title="Bersama IKRAM Membina Negara" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>');if(film)film.pause();}
if(yt)$('.yt-play',yt).addEventListener('click',playYT);
$$('[data-film]').forEach(function(b){b.addEventListener('click',function(){setTimeout(playYT,1500);});});

/* journey */
var jr=$('#perjalanan'),jSteps=$$('.jr-step'),jPics=$$('.jr-media img'),jBtns=$$('.jr-h button'),jRings=$$('.jr-ring'),jCount=null,jIdx=0;
var jWin=$('.jr-win'),jEdge=$('.jr-edge'),jv=$('.jr-v'),JR=[.56,.71,.86,1],JC=['jiwa','keluarga','masyarakat','negara'],jRef=0,jSeen=false;
function sizeJ(){if(!jWin)return;var w=jWin.clientWidth,h=jWin.clientHeight;jRef=Math.min(w,h)/2;jRings.forEach(function(r,k){r.style.setProperty('--d',(2*JR[k+1]*jRef).toFixed(1)+'px')});}
function jRad(jp){var x=clamp(jp*4-.5,0,3),i=Math.floor(x),f=x-i;if(i>=3)return JR[3];f=f*f*(3-2*f);return JR[i]+(JR[i+1]-JR[i])*f;}
function jPlay(){if(!jv||STILL)return;var src='assets/video/jr-'+JC[jIdx]+'.mp4';if(jv.getAttribute('src')!==src){jv.classList.remove('live');jv.setAttribute('src',src);}if(jSeen){var pp=jv.play();if(pp&&pp.catch)pp.catch(function(){});}else jv.pause();}
if(jv&&jWin){jv.addEventListener('playing',function(){jv.classList.add('live')});if('IntersectionObserver' in W)new IntersectionObserver(function(es){jSeen=es[0].isIntersecting;jPlay();},{threshold:.15}).observe(jWin);}
sizeJ();addEventListener('resize',sizeJ);
function setJ(i){if(i===jIdx)return;jIdx=i;
  jSteps.forEach(function(s,k){s.classList.toggle('on',k===i);s.classList.toggle('past',k<i)});
  jPics.forEach(function(p,k){p.classList.toggle('on',k===i);p.classList.toggle('past',k<i)});
  jBtns.forEach(function(b,k){b.classList.toggle('on',k===i)});
  if(jCount)jCount.textContent=i+1;jPlay();}
function fitBig(){var col=$('.jr-steps');if(!col||innerWidth<=900){if(jr)jr.style.removeProperty('--bigfs');return;}var pr=D.createElement('span');pr.style.cssText='position:absolute;left:-9999px;top:0;white-space:nowrap;font:600 100px/.92 Poppins,sans-serif;letter-spacing:-.055em';D.body.appendChild(pr);var mx=1;$$('.jr-step .big').forEach(function(b){pr.textContent=b.textContent;mx=Math.max(mx,pr.getBoundingClientRect().width)});D.body.removeChild(pr);jr.style.setProperty('--bigfs',Math.min(148,Math.floor(col.clientWidth/mx*100*.96))+'px');}
fitBig();if(D.fonts&&D.fonts.ready)D.fonts.ready.then(fitBig);addEventListener('resize',fitBig);
jBtns.forEach(function(b){b.addEventListener('click',function(){var i=+b.dataset.go,top=jr.getBoundingClientRect().top+scrollY-barH(),span=jr.offsetHeight-(innerHeight-barH()),y=top+span*((i+.5)/4);if(lenis)lenis.scrollTo(y,{duration:1.4});else scrollTo({top:y,behavior:'smooth'});})});

/* one pass per frame */
var hero=$('#hero'),hw=$('.hero-words'),hd=$('#kesukaran'),track=$('.hd-track'),hCards=$$('.hd-card'),hEnd=$('.hd-end'),vps=$$('[data-vp]'),band=$('[data-band]'),fc=$('.fc');
function prog(el,mode){var r=el.getBoundingClientRect(),h=innerHeight-barH();if(mode==='pin')return clamp(-(r.top-barH())/(r.height-h),0,1);return clamp((innerHeight-r.top)/(innerHeight+r.height),0,1);}
function frame(){
  var y=scrollY,hp=0;
  if(hero){hp=prog(hero,'pin');hero.style.setProperty('--hp',hp.toFixed(4));if(hw)hw.classList.toggle('on',hp>.72);}
  if(st&&words.length){var r=st.getBoundingClientRect(),p=clamp((innerHeight*.82-r.top)/(r.height+innerHeight*.3),0,1),n=Math.round(p*words.length*1.05);for(var i=0;i<words.length;i++)words[i].classList.toggle('lit',i<n);}
  if(band){var bp=prog(band);band.style.setProperty('--bp',bp.toFixed(4));band.style.setProperty('--bp2',clamp(bp*2.2,0,1).toFixed(4));}
  if(jr){var jp=prog(jr,'pin'),jrr=jRad(jp);jr.style.setProperty('--jp',jp.toFixed(4));jr.style.setProperty('--jr',(jrr*jRef).toFixed(1)+'px');if(jEdge)jEdge.style.setProperty('--d',(2*jrr*jRef).toFixed(1)+'px');jRings.forEach(function(r,k){r.classList.toggle('gone',jrr>=JR[k+1]-.015)});setJ(Math.min(3,Math.floor(jp*4)));}
  if(hd&&track&&innerWidth>900){var p2=prog(hd,'pin'),max=track.scrollWidth-innerWidth;track.style.transform='translate3d('+(-max*p2).toFixed(1)+'px,0,0)';
    hCards.forEach(function(c){var r=c.getBoundingClientRect();c.style.setProperty('--cx',clamp((r.left+r.width/2)/innerWidth-.5,-1,1).toFixed(3))});
    if(hEnd){var re=hEnd.getBoundingClientRect();hEnd.style.setProperty('--ce',clamp(1-(re.left-innerWidth*.08)/(innerWidth*.55),0,1).toFixed(3));}}
  vps.forEach(function(el){el.style.setProperty('--vp',prog(el).toFixed(4))});
  if(yt){var yr=yt.getBoundingClientRect();yt.style.setProperty('--yp',clamp((innerHeight-yr.top)/(innerHeight*.9),0,1).toFixed(4));}
  if(fc)fc.style.setProperty('--fp',clamp(prog(fc,'pin')*1.6+(fc.getBoundingClientRect().top-barH()<innerHeight*.5?.1:0),0,1).toFixed(4));
  var heroEnd=hero?hero.offsetTop+hero.offsetHeight*.28:200;
  nav.classList.toggle('solid',hp>.03||y>heroEnd||menu.classList.contains('open'));
  var down=y>lastY+2,up=y<lastY-2;
  if(y>heroEnd+innerHeight*.6&&down&&!menu.classList.contains('open'))nav.classList.add('hide');else if(up||y<heroEnd)nav.classList.remove('hide');
  lastY=y;
}
function raf(t){if(lenis)lenis.raf(t);frame();requestAnimationFrame(raf);}
requestAnimationFrame(raf);
addEventListener('resize',function(){sizeMap();});

/* map: dots of Malaysia, 15 offices, waves out of each office */
var OFF=[
 ['Perlis',4.12,9.36,'Pejabat IKRAM negeri. Alamat penuh di laman rasmi IKRAM.'],
 ['Kedah',6.64,17.39,'Pejabat IKRAM negeri. Alamat penuh di laman rasmi IKRAM.'],
 ['Pulau Pinang',4.58,27.59,'Pejabat IKRAM negeri. Alamat penuh di laman rasmi IKRAM.'],
 ['Kelantan',18.32,17.39,'Pejabat IKRAM negeri. Alamat penuh di laman rasmi IKRAM.'],
 ['Terengganu',23.44,31.94,'Pejabat IKRAM negeri. Alamat penuh di laman rasmi IKRAM.'],
 ['Perak',8.32,41.81,'Pejabat IKRAM negeri. Alamat penuh di laman rasmi IKRAM.'],
 ['Pahang',24.20,58.03,'Pejabat IKRAM negeri. Alamat penuh di laman rasmi IKRAM.'],
 ['Selangor',12.44,58.19,'Pejabat IKRAM negeri. Alamat penuh di laman rasmi IKRAM.'],
 ['Kuala Lumpur',15.19,61.2,'Pejabat IKRAM negeri. Alamat penuh di laman rasmi IKRAM.'],
 ['Putrajaya',15.65,65.55,'Pejabat IKRAM negeri. Alamat penuh di laman rasmi IKRAM.'],
 ['Negeri Sembilan',16.56,71.40,'Pejabat IKRAM negeri. Alamat penuh di laman rasmi IKRAM.'],
 ['Melaka',19.31,76.92,'Pejabat IKRAM negeri. Alamat penuh di laman rasmi IKRAM.'],
 ['Johor',29.24,87.12,'Pejabat IKRAM negeri. Alamat penuh di laman rasmi IKRAM.'],
 ['Sarawak',44.89,89.13,'Pejabat IKRAM negeri. Alamat penuh di laman rasmi IKRAM.'],
 ['Sabah',79.01,28.09,'Pejabat IKRAM negeri. Alamat penuh di laman rasmi IKRAM.']
];
var FL=['perlis','kedah','penang','kelantan','terengganu','perak','pahang','selangor','kl','putrajaya','nsembilan','melaka','johor','sarawak','sabah'];
var map=$('#map'),cv=map&&$('canvas',map),cx=cv&&cv.getContext('2d'),card=$('.pr-card'),states=$('#states'),pins=[],active=-1,mapOn=false,t00=performance.now();
var M=W.IKMAP||{w:1310,h:598,s:9,p:[]},MP=[];for(var k=0;k<M.p.length;k+=2)MP.push([M.p[k]/M.w,M.p[k+1]/M.h]);
/* the sea: a finer dot field around the coasts; swells roll outward from the land and fade with distance */
var SEA=[];(function(){var g=M.s||9,o=4,C=Math.floor((M.w-o)/g)+1,R=Math.floor((M.h-o)/g)+1,land=new Uint8Array(C*R),near=new Int8Array(C*R).fill(-1),q=[],MAXD=13;
  for(var k=0;k<M.p.length;k+=2){var i=Math.round((M.p[k]-o)/g),j=Math.round((M.p[k+1]-o)/g);if(i>=0&&i<C&&j>=0&&j<R&&!land[j*C+i]){land[j*C+i]=1;near[j*C+i]=0;q.push(j*C+i);}}
  for(var h=0;h<q.length;h++){var c=q[h],ci=c%C,cj=(c-ci)/C;if(near[c]>=MAXD)continue;for(var di=-1;di<=1;di++)for(var dj=-1;dj<=1;dj++){var ni=ci+di,nj=cj+dj;if(ni<0||nj<0||ni>=C||nj>=R)continue;var n=nj*C+ni;if(near[n]<0){near[n]=near[c]+1;q.push(n);}}}
  for(var j2=0;j2<R;j2++)for(var i2=0;i2<C;i2++){var c2=j2*C+i2;if(land[c2]||near[c2]<1)continue;var best=99;
    for(var a=-MAXD;a<=MAXD;a++)for(var b=-MAXD;b<=MAXD;b++){var ii=i2+a,jj=j2+b;if(ii<0||jj<0||ii>=C||jj>=R||!land[jj*C+ii])continue;var dd=Math.sqrt(a*a+b*b);if(dd<best)best=dd;}
    if(best<=MAXD&&best>=1.4)SEA.push((o+(i2+.5)*g)/M.w,(o+(j2+.5)*g)/M.h,best);}
})();
function drawSea(t,w,h,rad){if(!SEA.length)return;var B=[[],[],[],[],[],[],[],[]],r=rad*.5;
  for(var i=0;i<SEA.length;i+=3){var x=SEA[i]*w,y=SEA[i+1]*h,d=SEA[i+2],ph=((d*9-t*15)%48+48)%48,band=Math.pow(Math.max(0,1-Math.abs(ph-24)/12),1.6),fade=Math.pow(Math.max(0,1-d/13),1.1),drift=.7+.3*Math.sin(x*.006+y*.004+t*.35),a=.44*band*drift*fade;
    if(a<.025)continue;B[Math.min(7,Math.floor(a/.055))].push(x,y);}
  for(var k=0;k<8;k++){var L=B[k];if(!L.length)continue;cx.fillStyle='rgba(0,174,187,'+((k+.7)*.055).toFixed(3)+')';cx.beginPath();for(var m=0;m<L.length;m+=2){cx.moveTo(L[m]+r,L[m+1]);cx.arc(L[m],L[m+1],r,0,6.283);}cx.fill();}}
if(map){OFF.forEach(function(o,i){
  var b=D.createElement('button');b.className='pin';b.style.left=o[1]+'%';b.style.top=o[2]+'%';b.style.setProperty('--d',(i*.19).toFixed(2)+'s');b.setAttribute('aria-label','Pejabat IKRAM '+o[0]);b.innerHTML='<span class="pf"><img src="assets/img/flags/'+FL[i]+'.png" alt=""></span>';
  b.addEventListener('mouseenter',function(){show(i)});b.addEventListener('focus',function(){show(i)});b.addEventListener('click',function(){show(i)});map.appendChild(b);pins.push(b);
  var c=D.createElement('button');c.innerHTML='<img src="assets/img/flags/'+FL[i]+'.png" alt=""><span>'+o[0]+'</span>';c.addEventListener('click',function(){show(i)});c.addEventListener('mouseenter',function(){show(i)});states.appendChild(c);});}
function show(i){if(i===active)return;active=i;pins.forEach(function(p,k){p.classList.toggle('on',k===i)});$$('button',states).forEach(function(c,k){c.classList.toggle('on',k===i)});
  var o=OFF[i];$('b',card).textContent='IKRAM '+o[0];$('.ad',card).textContent=o[3];$('.pr-flag',card).src='assets/img/flags/'+FL[i]+'.png';card.classList.remove('swap');void card.offsetWidth;card.classList.add('swap');t00=performance.now();}
function sizeMap(){if(!cv)return;var r=map.getBoundingClientRect(),d=Math.min(2,W.devicePixelRatio||1);cv.width=Math.round(r.width*d);cv.height=Math.round(r.height*d);drawMap(performance.now());}
function drawMap(now){if(!cx)return;var w=cv.width,h=cv.height,rad=Math.max(1.2,(M.s/M.w)*w*.3),t=(now-t00)/1000,P=OFF.map(function(o){return [o[1]/100*w,o[2]/100*h]}),act=active>=0?P[active]:null,sc=w/1300;
  cx.clearRect(0,0,w,h);drawSea(t,w,h,rad);
  for(var i=0;i<MP.length;i++){var x=MP[i][0]*w,y=MP[i][1]*h,g=0;
    for(var j=0;j<P.length;j++){var dx=x-P[j][0],dy=y-P[j][1],dd=Math.sqrt(dx*dx+dy*dy)/sc,ph=(t*90-dd)%260;if(ph>0&&ph<40)g=Math.max(g,Math.sin(ph/40*Math.PI)*Math.max(0,1-dd/520));}
    var a=.28+g*.6,col='0,174,187';
    if(act){var ax=x-act[0],ay=y-act[1],ad=Math.sqrt(ax*ax+ay*ay)/sc;if(ad<120){a=Math.max(a,.95-ad/120*.6);col='1,150,53';}}
    cx.fillStyle='rgba('+col+','+a.toFixed(3)+')';cx.beginPath();cx.arc(x,y,rad*(1+g*.35),0,6.283);cx.fill();}}
if(cv){sizeMap();show(8);if('IntersectionObserver' in W)new IntersectionObserver(function(es){mapOn=es[0].isIntersecting;if(mapOn&&!STILL)loopMap()}).observe(map);}
/* footer flags lead back to the map */
var ff=$('#ftFlags');if(ff)OFF.forEach(function(o,i){var a=D.createElement('a');a.href='#kehadiran';a.title='IKRAM '+o[0];a.innerHTML='<img src="assets/img/flags/'+FL[i]+'.png" alt=""><span>'+o[0]+'</span>';a.addEventListener('click',function(){show(i)});ff.appendChild(a);});
function loopMap(){if(!mapOn)return;drawMap(performance.now());requestAnimationFrame(loopMap);}

/* rail: drag and arrows */
var rail=$('#rail');
if(rail){var down=false,sx=0,sl=0,moved=0;
  rail.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse')return;down=true;moved=0;sx=e.clientX;sl=rail.scrollLeft;rail.classList.add('drag');});
  addEventListener('pointermove',function(e){if(!down)return;var dx=e.clientX-sx;moved=Math.max(moved,Math.abs(dx));rail.scrollLeft=sl-dx;});
  addEventListener('pointerup',function(){if(!down)return;down=false;rail.classList.remove('drag');});
  rail.addEventListener('click',function(e){if(moved>6){e.preventDefault();e.stopPropagation();}},true);
  $$('[data-rail]').forEach(function(b){b.addEventListener('click',function(){hold=performance.now()+4000;rail.classList.remove('drift');var c=$('.post:not(.big)',rail);rail.scrollBy({left:(+b.dataset.rail)*(c?c.offsetWidth+24:400),behavior:'smooth'})})});
  var hold=0,over=false,seen=false,dir=1,acc=0,last=0;
  rail.addEventListener('pointerenter',function(){over=true;rail.classList.remove('drift')});rail.addEventListener('pointerleave',function(){over=false;hold=performance.now()+800});
  rail.addEventListener('touchstart',function(){hold=performance.now()+5000;rail.classList.remove('drift')},{passive:true});
  if('IntersectionObserver' in W)new IntersectionObserver(function(es){seen=es[0].isIntersecting},{threshold:.2}).observe(rail);
  if(!STILL&&!RM)(function drift(t){var dt=last?Math.min(50,t-last):16;last=t;if(seen&&!over&&!down&&t>hold){rail.classList.add('drift');acc+=dir*dt*.032;var st=Math.trunc(acc);if(st){rail.scrollLeft+=st;acc-=st;}var mx=rail.scrollWidth-rail.clientWidth;if(rail.scrollLeft>=mx-1)dir=-1;else if(rail.scrollLeft<=0)dir=1;}requestAnimationFrame(drift)})(0);}

/* book tilt */
var book=$('[data-book]'),b3=book&&$('.book-3d',book);
if(book&&FINE){var eb=$('.eb');eb.addEventListener('pointermove',function(e){var r=book.getBoundingClientRect();b3.style.setProperty('--bx',clamp((e.clientX-r.left)/r.width-.5,-1,1).toFixed(3));b3.style.setProperty('--by',clamp((e.clientY-r.top)/r.height-.5,-1,1).toFixed(3));});eb.addEventListener('pointerleave',function(){b3.style.setProperty('--bx',0);b3.style.setProperty('--by',0)});}

/* partner tiles */
var LOGOS=[["04-ikramal.png", 60, 74], ["05-kadri-logo-fa.png", 128, 48], ["07-majlis-pengetua-guru-besar-sekolah.png", 68, 68], ["08-mfp-logo.png", 117, 38], ["09-mib-logo.png", 63, 66], ["11-logo-ikram-academia.png", 105, 64], ["13-logo-ikram-health.png", 72, 74], ["14-ilman.png", 85, 63], ["15-logo-perunding-sdn-bhd.png", 73, 69], ["17-risalah-harmoni.png", 67, 74], ["a4-rasuah-busters-logo.png", 96, 47], ["gbm.png", 90, 74], ["harmoni-logo.png", 55, 65], ["iedb-wording-logo.png", 100, 42], ["logo-gdm-png.png", 63, 74], ["logo-kimb-v2.png", 71, 74], ["logo-ppisb.png", 61, 63], ["logo-yayasan-ikram-malaysia-jawi.png", 83, 67], ["musleh-integrated-education.png", 59, 74], ["mycare-logo_horizontal.png", 143, 47], ["logo-accin-my.png", 123, 60], ["logo-hcf-new.png", 109, 65], ["makpem.png", 74, 74], ["ncwo.png", 160, 40]];
function fillMq(id,list){var m=$(id);if(!m)return;var h=list.map(function(l){return '<span class="lg"><img src="assets/img/partners2/'+l[0]+'" alt="" width="'+Math.round(l[1]*.86)+'" height="'+Math.round(l[2]*.86)+'" loading="lazy"></span>'}).join('');m.innerHTML='<div class="mq-in">'+h+'</div><div class="mq-in" aria-hidden="true">'+h+'</div>';}
fillMq('#mq1',LOGOS.slice(0,12));fillMq('#mq2',LOGOS.slice(12));

/* the Brand Method demo ribbon, taken whole from FAR Capital / Lirunex: the same cloth ribbon every Brand Method demo ends with */
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
