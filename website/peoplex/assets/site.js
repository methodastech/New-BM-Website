/* PeopleX Web Prototype 1, Brand Method. Hand written, no build step. */
(function(){
'use strict';
var D=document,W=window,H=D.documentElement;
var RM=(W.matchMedia&&W.matchMedia('(prefers-reduced-motion: reduce)').matches)||H.classList.contains('still');
var FINE=W.matchMedia&&W.matchMedia('(hover:hover) and (pointer:fine)').matches;
function $(s,c){return (c||D).querySelector(s)}
function $$(s,c){return [].slice.call((c||D).querySelectorAll(s))}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function money(n){return n.toLocaleString('en-MY',{minimumFractionDigits:2,maximumFractionDigits:2})}
function int(n){return Math.round(n).toLocaleString('en-MY')}
function barH(){var b=$('.bmws');return H.classList.contains('lx-inshell')||!b?0:b.offsetHeight}
function navH(){var n=$('#nav');return n?n.offsetHeight:0}
var GS=!!(W.gsap&&W.ScrollTrigger);

/* ---------- shared page state: set once, read everywhere (salary, headcount, industry, the check result) ---------- */
var PX=(function(){
  var K='px-state',s={salary:5000,headcount:25,industry:null,need:null,check:null,entry:null};
  try{var o=JSON.parse(sessionStorage.getItem(K)||'null');if(o)for(var k in o)if(k in s)s[k]=o[k]}catch(e){}
  function fire(k,v,src){var ev;try{ev=new CustomEvent('px:change',{detail:{key:k,value:v,src:src||''}})}catch(e){ev=D.createEvent('CustomEvent');ev.initCustomEvent('px:change',false,false,{key:k,value:v,src:src||''})}W.dispatchEvent(ev)}
  return {get:function(k){return s[k]},
    set:function(k,v,src){if(!(k in s)||s[k]===v)return;s[k]=v;try{sessionStorage.setItem(K,JSON.stringify(s))}catch(e){}fire(k,v,src)},
    all:function(){var c={};for(var k in s)c[k]=s[k];return c}};
})();
W.PX=PX;
/* the focus ring is for the keyboard: a click turns it off until Tab or an arrow key is pressed */
D.addEventListener('pointerdown',function(){H.classList.add('ptr')},true);
D.addEventListener('keydown',function(e){if(e.key==='Tab'||/^Arrow/.test(e.key))H.classList.remove('ptr')},true);
W.pxTrack=function(name,data){var d={event:name},k;for(k in (data||{}))d[k]=data[k];(W.dataLayer=W.dataLayer||[]).push(d)};


/* ---------- toast ---------- */
var toastEl=$('#toast'),toastT=0;
function toast(msg){if(!toastEl)return;toastEl.textContent=msg;toastEl.classList.add('on');clearTimeout(toastT);toastT=setTimeout(function(){toastEl.classList.remove('on')},3600)}

/* ---------- ready (hero entrance after the loader) ---------- */
if(W.__pxLd&&!W.__pxLd.done)W.addEventListener('px:loaded',function(){setTimeout(function(){H.classList.add('ready')},200)});else setTimeout(function(){H.classList.add('ready')},60);

/* ---------- smooth scroll ---------- */
var lenis=null;
if(!RM&&W.Lenis&&FINE){
  try{
    lenis=new W.Lenis({lerp:.11,smoothWheel:true,wheelMultiplier:1});
    if(GS){lenis.on('scroll',W.ScrollTrigger.update);W.gsap.ticker.add(function(t){lenis.raf(t*1000)});W.gsap.ticker.lagSmoothing(0);}
    else{(function raf(t){lenis.raf(t);requestAnimationFrame(raf)})(0);}
  }catch(e){lenis=null}
}
if(GS){W.gsap.registerPlugin(W.ScrollTrigger);W.ScrollTrigger.config({ignoreMobileResize:true});}
/* a scroll lock on <html> (the search palette sets overflow hidden) also pauses the smooth scroll */
W.__pxLenis=lenis;
if(lenis&&H.classList.contains('is-loading')){lenis.stop();W.addEventListener('px:loaded',function(){lenis.start()})}
if(lenis&&W.MutationObserver){var lockOn=false;new MutationObserver(function(){var l=H.style.overflow==='hidden'||H.style.overflowY==='hidden'||getComputedStyle(H).overflowY==='hidden';if(l!==lockOn){lockOn=l;if(l)lenis.stop();else lenis.start()}}).observe(H,{attributes:true,attributeFilter:['style','class']})}
function scrollToY(y){if(lenis)lenis.scrollTo(y,{duration:1.2});else W.scrollTo({top:y,behavior:RM?'auto':'smooth'})}
W.__pxScrollTo=function(el){closeSheet();scrollToEl(el)};
function scrollToEl(el){var y=el===$('#top')?0:el.getBoundingClientRect().top+W.pageYOffset-barH()-navH()+1;scrollToY(Math.max(0,y))}

/* ---------- links ---------- */
D.addEventListener('click',function(e){
  var a=e.target&&e.target.closest?e.target.closest('a'):null;if(!a||a.closest('.bmws'))return;
  if(a.hasAttribute('data-off')){e.preventDefault();toast('Built in the full site. This demo shows the home page.');return;}
  if(a.hasAttribute('data-check-start')&&W.PXCheck)return;
  var h=a.getAttribute('href')||'';
  if(h.charAt(0)==='#'&&h.length>1){var t=D.getElementById(h.slice(1));if(t){e.preventDefault();closeSheet();scrollToEl(t);if(h==='#contact'){setTimeout(function(){var f=$('#fName');if(f)try{f.focus({preventScroll:true})}catch(x){}},900)}}}
});

/* ---------- header ---------- */
var nav=$('#nav'),hero=$('#hero'),burger=$('#burger'),sheet=$('#sheet');
function closeSheet(){if(!sheet||sheet.hidden)return;sheet.hidden=true;nav.classList.remove('open');burger.setAttribute('aria-expanded','false');burger.setAttribute('aria-label','Open menu')}
if(burger)burger.addEventListener('click',function(){var o=sheet.hidden;sheet.hidden=!o;nav.classList.toggle('open',o);burger.setAttribute('aria-expanded',String(o));burger.setAttribute('aria-label',o?'Close menu':'Open menu')});
var navTick=false;
var ftEl=$('#footer');
function navState(){navTick=false;var y=W.pageYOffset,lim=hero?hero.offsetHeight-navH()-8:80,overFt=ftEl&&ftEl.getBoundingClientRect().top<barH()+navH()-2;nav.classList.toggle('solid',y>lim&&!overFt);nav.classList.toggle('dim',(y>24&&y<=lim)||!!overFt)}
W.addEventListener('scroll',function(){if(!navTick){navTick=true;requestAnimationFrame(navState)}},{passive:true});
navState();

/* ---------- reveal ---------- */
if('IntersectionObserver' in W&&!H.classList.contains('still')){
  H.classList.add('io');
  var rio=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');rio.unobserve(en.target)}})},{rootMargin:'0px 0px -8% 0px',threshold:.01});
  $$('.rv').forEach(function(el,i){
    var sib=el.parentElement?[].slice.call(el.parentElement.children).filter(function(c){return c.classList.contains('rv')}):[];
    var k=sib.indexOf(el);if(k>0)el.style.transitionDelay=Math.min(k,6)*0.07+'s';
    rio.observe(el)});
}
/* a section is "live" only while on screen: loops pause off screen */
function onScreen(el,cb){if(!el)return;if(!('IntersectionObserver' in W)){cb(true);return}new IntersectionObserver(function(es){cb(es[0].isIntersecting)},{threshold:.05}).observe(el)}

/* ---------- magnetic buttons ---------- */
if(FINE&&!RM){$$('[data-mag]').forEach(function(b){
  b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.16).toFixed(1)+'px,'+((e.clientY-r.top-r.height/2)*.28).toFixed(1)+'px)'});
  b.addEventListener('pointerleave',function(){b.style.transform=''});
})}

/* ---------- hero film ---------- */
var hv=$('#heroVid');
if(hv){
  if(!RM){
    var small=W.innerWidth<=760&&hv.getAttribute('data-src-m');if(small)hv.poster=hv.getAttribute('data-poster-m');
    var startFilm=function(){if(hv.getAttribute('src'))return;hv.src=small?hv.getAttribute('data-src-m'):hv.getAttribute('data-src');hv.load();var p=hv.play();if(p&&p.catch)p.catch(function(){})};
    if(D.readyState==='complete')setTimeout(startFilm,200);else W.addEventListener('load',function(){setTimeout(startFilm,200)});
    onScreen(hero,function(v){if(!hv.getAttribute('src'))return;if(v){var p=hv.play();if(p&&p.catch)p.catch(function(){})}else hv.pause()});
    if(GS){W.gsap.to('.hero-film',{yPercent:14,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:true}});
      if(W.innerWidth>1023)W.gsap.to('.hero-copy',{yPercent:-10,opacity:.25,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:true}});}
  }
}

/* ================= PAYSLIP ENGINE =================
   Estimate for a Malaysian employee under 60, single, no other reliefs.
   EPF: 11% employee; employer 13% up to RM5,000, 12% above. Wage bands of RM20 (to RM5,000) and RM100 (to RM20,000), ringgit rounded up.
   SOCSO (first category) 0.5% / 1.75% and EIS 0.2% / 0.2% on the RM100 band midpoint, wage ceiling RM6,000, rounded to 5 sen.
   PCB: annualised resident scale, RM9,000 individual relief, EPF relief up to RM4,000, RM400 rebate to RM35,000, nothing under RM10. */
function epf(w,er){var b=w<=5000?Math.ceil(w/20)*20:(w<=20000?Math.ceil(w/100)*100:w);var r=er?(w<=5000?.13:.12):.11;return Math.ceil(b*r-1e-9)}
function mid(w){return Math.min(Math.ceil(w/100)*100,6000)-50}
function r05(x){return Math.ceil(x*20-1e-6)/20}
function socso(w,er){return r05(mid(w)*(er?.0175:.005))}
function eis(w){return r05(mid(w)*.002)}
var BR=[[5000,0],[20000,.01],[35000,.03],[50000,.06],[70000,.11],[100000,.19],[400000,.25],[600000,.26],[2000000,.28],[1e15,.30]];
function tax(c){var t=0,lo=0;for(var i=0;i<BR.length;i++){var hi=BR[i][0];if(c>lo)t+=(Math.min(c,hi)-lo)*BR[i][1];lo=hi}return t}
function pcb(w){var ch=Math.max(0,w*12-9000-Math.min(epf(w,false)*12,4000));var t=tax(ch);if(ch<=35000)t=Math.max(0,t-400);var m=Math.round(t/12*20)/20;return m<10?0:m}
function calc(w){var e=epf(w,false),s=socso(w,false),i=eis(w),p=pcb(w);return{g:w,epf:e,soc:s,eis:i,pcb:p,net:w-e-s-i-p,epfR:epf(w,true),socR:socso(w,true),eisR:eis(w),erRate:w<=5000?13:12}}
W.__pxCalc=calc;W.__pxEngine={epf:epf,socso:socso,eis:eis,pcb:pcb,calc:calc};

/* number tween */
function tweenNum(el,to,fmt){if(!el)return;var from=el._v==null?to:el._v;el._v=to;if(RM||from===to){el.textContent=fmt(to);return}
  var t0=performance.now(),dur=520;cancelAnimationFrame(el._r);
  (function step(t){var k=clamp((t-t0)/dur,0,1);k=1-Math.pow(1-k,3);el.textContent=fmt(from+(to-from)*k);if(k<1)el._r=requestAnimationFrame(step)})(t0)}


/* odometer: each digit is a strip of 0 to 9 that rolls into place */
function odo(el,str){if(!el)return;el.setAttribute('aria-label','RM '+str);var sig=str.replace(/\d/g,'d');
  if(el._sig!==sig){el._sig=sig;el.innerHTML=str.split('').map(function(c){return /\d/.test(c)?'<span class="od" aria-hidden="true"><span class="od-s">'+'0123456789'.split('').map(function(d){return '<span>'+d+'</span>'}).join('')+'</span></span>':'<span class="od-p" aria-hidden="true">'+c+'</span>'}).join('');void el.offsetWidth}
  var cols=el.querySelectorAll('.od-s'),n=cols.length,k=0;
  str.split('').forEach(function(c){if(/\d/.test(c)){var col=cols[k];col.style.transitionDelay=((n-1-k)*28)+'ms';col.style.transform='translateY('+(-(+c)*10)+'%)';k++}})}
var slip=$('#slip');
if(slip){
  var sIn=$('#slipIn'),sR=$('#slipR'),view='ee',wage=clamp(+PX.get('salary')||5000,1700,200000),bars=$$('.slip-bar i',slip),vals=$$('[data-v]',slip),labs=$$('[data-l]',slip),sws=$$('.slip-r .sw',slip),net=$('#slipNet'),netL=$('#slipNetL'),gh=$('#slipGh'),chips=$$('#slipChips li');
  vals.forEach(function(v){v._v=parseFloat(v.textContent.replace(/,/g,''))});net._v=4305.35;
  var setBar=function(i,l,f){bars[i].style.transform='translateX('+(l*100).toFixed(3)+'%) scaleX('+f.toFixed(4)+')'};
  var team=clamp(+PX.get('headcount')||25,1,5000),nIn=$('#slipN'),inL=$('#slipInL'),cta=$('#slipCta'),ctaT=$('#slipCtaT'),pres=$$('#slipPre button');
  var setRows=function(L,V,S,I){L.forEach(function(t,i){labs[i].textContent=t;sws[i].className='sw ph-duotone ph-'+I[i]+' '+S[i];tweenNum(vals[i],V[i],money)})};
  var render=function(){
    var c=calc(wage);
    if(view==='ee'){
      gh.textContent='Deductions';netL.textContent='Take home pay';inL.textContent='Monthly salary';
      setRows(['EPF 11%','SOCSO','EIS','PCB, estimate'],[c.epf,c.soc,c.eis,c.pcb],['b2','b4','b4','b3'],['piggy-bank','shield-check','umbrella','receipt']);
      odo(net,money(c.net));
      var G=c.g,a=c.net/G,b=c.epf/G,p=c.pcb/G,s=(c.soc+c.eis)/G;
      setBar(0,0,a);setBar(1,a,b);setBar(2,a+b,p);setBar(3,a+b+p,s);
    }else if(view==='er'){
      gh.textContent='Employer contributions';netL.textContent='Your total monthly cost';inL.textContent='Monthly salary';
      var T=c.g+c.epfR+c.socR+c.eisR;
      setRows(['EPF '+c.erRate+'%','SOCSO','EIS','Salary'],[c.epfR,c.socR,c.eisR,c.g],['b2','b4','b4','b1'],['piggy-bank','shield-check','umbrella','money']);
      odo(net,money(T));
      setBar(0,0,c.g/T);setBar(1,c.g/T,c.epfR/T);setBar(2,0,0);setBar(3,(c.g+c.epfR)/T,(c.socR+c.eisR)/T);
    }else{
      var n=team,TT=n*(c.g+c.epfR+c.socR+c.eisR),rem=n*(c.epf+c.epfR+c.soc+c.socR+2*c.eis+c.pcb);
      gh.textContent='For '+int(n)+(n===1?' person':' people')+', every month';netL.textContent='Your monthly payroll cost';inL.textContent='Average monthly salary';
      setRows(['Salaries','Employer EPF','Employer SOCSO and EIS','Paid to KWSP, PERKESO and LHDN'],[n*c.g,n*c.epfR,n*(c.socR+c.eisR),rem],['b1','b2','b4','b3'],['users-three','piggy-bank','shield-check','bank']);
      odo(net,money(TT));
      var t1=n*c.g/TT,t2=n*c.epfR/TT;setBar(0,0,t1);setBar(1,t1,t2);setBar(2,0,0);setBar(3,t1+t2,n*(c.socR+c.eisR)/TT);
    }
    ctaT.textContent=view==='team'?'Get my free quote for '+int(team)+(team===1?' person':' people'):'Get my free quote';
    var rec=$('#slipRec');if(rec){rec.hidden=view!=='team';if(view==='team'){var rate=team<=10?80:(team<=50?48:(team<=100?40:0));rec.innerHTML='<img class="ic3" src="assets/img/ic3d/payroll.webp" alt="" width="256" height="256"><span>'+(rate?'<b>Payroll Managed Services</b> for '+int(team)+(team===1?' person':' people')+': about RM '+int(team*rate)+' a month at the published PeopleX price (RM'+rate+' a person), with the HR app included free.':'<b>Payroll Managed Services</b> for '+int(team)+' people: PeopleX quotes teams over 100 individually. The HR app is included free.')+'</span>'}}
    pres.forEach(function(p){p.classList.toggle('on',+p.getAttribute('data-w')===wage)});
    sR.style.setProperty('--p',((clamp(wage,1700,20000)-1700)/(20000-1700)*100).toFixed(2)+'%');
  };
  pres.forEach(function(p){p.addEventListener('click',function(){wage=+p.getAttribute('data-w');sR.value=clamp(wage,1700,20000);sIn.value=int(wage);PX.set('salary',wage,'slip');render()})});
  var setTeam=function(v){team=clamp(isNaN(v)?team:Math.round(v),1,5000);nIn.value=int(team);PX.set('headcount',team,'slip');render()};
  W.addEventListener('px:change',function(e){var d=e.detail||{};if(d.src==='slip')return;if(d.key==='headcount'){team=clamp(+d.value||team,1,5000);nIn.value=int(team);render()}if(d.key==='salary'){wage=clamp(+d.value||wage,1700,200000);sR.value=clamp(wage,1700,20000);sIn.value=int(wage);render()}});
  $$('.slip-step button',slip).forEach(function(b){b.addEventListener('click',function(){setTeam(team+(+b.getAttribute('data-d'))*(team>=100?10:1))})});
  nIn.addEventListener('input',function(){var v=parseInt(nIn.value.replace(/[^0-9]/g,''),10);if(!isNaN(v)&&v>=1){team=Math.min(v,5000);render()}});
  nIn.addEventListener('blur',function(){setTeam(parseInt(nIn.value.replace(/[^0-9]/g,''),10))});
  nIn.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();nIn.blur()}else if(e.key==='ArrowUp'){e.preventDefault();setTeam(team+1)}else if(e.key==='ArrowDown'){e.preventDefault();setTeam(team-1)}});
  cta.addEventListener('click',function(){PX.set('need','Payroll','slip');PX.set('entry','slip','slip');var m=$('#fMsg');if(!m)return;var c=calc(wage),who=view==='team'?'Team size: '+int(team)+' people. Average':'Monthly';m.value=who+' salary: RM '+int(wage)+'. Estimated monthly payroll cost: RM '+money((view==='team'?team:1)*(c.g+c.epfR+c.socR+c.eisR))+'. Please send me a quote for payroll outsourcing.';m.dispatchEvent(new Event('input'))});
  sR.addEventListener('input',function(){wage=+sR.value;sIn.value=int(wage);PX.set('salary',wage,'slip');render()});
  sIn.addEventListener('input',function(){var v=parseInt(sIn.value.replace(/[^0-9]/g,''),10);if(isNaN(v))return;if(v>=1700&&v<=200000){wage=v;sR.value=clamp(v,1700,20000);render()}});
  sIn.addEventListener('blur',function(){var v=parseInt(sIn.value.replace(/[^0-9]/g,''),10);wage=clamp(isNaN(v)?wage:v,1700,200000);sIn.value=int(wage);sR.value=clamp(wage,1700,20000);PX.set('salary',wage,'slip');render()});
  sIn.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();sIn.blur()}});
  $$('.slip-tg button',slip).forEach(function(b){b.addEventListener('click',function(){view=b.getAttribute('data-view');slip.setAttribute('data-view',view);$$('.slip-tg button',slip).forEach(function(x){x.setAttribute('aria-selected',String(x===b))});render()})});
  sIn.value=int(wage);sR.value=clamp(wage,1700,20000);nIn.value=int(team);
  render();
  /* a gentle first move so the card reads as live: the salary walks up then settles */
  if(!RM){var demoDone=false;setTimeout(function(){if(demoDone||D.activeElement===sIn)return;var w0=wage,seq=[Math.min(w0+600,20000),Math.min(w0+1400,20000),w0],k=0;(function nx(){if(demoDone||D.activeElement===sR||D.activeElement===sIn)return;wage=seq[k];sR.value=wage;sIn.value=int(wage);render();k++;if(k<seq.length)setTimeout(nx,900)})()},W.__pxLd&&!W.__pxLd.done?5400:1400);
    slip.addEventListener('pointerdown',function(){demoDone=true});}
}


/* the payslip leans a little toward the pointer */
var tilt=$('#slipTilt');
if(tilt&&FINE&&!RM&&hero){hero.addEventListener('pointermove',function(e){var r=tilt.getBoundingClientRect(),x=clamp((e.clientX-(r.left+r.width/2))/r.width,-1,1),y=clamp((e.clientY-(r.top+r.height/2))/r.height,-1,1);tilt.style.setProperty('--ry',(x*3.2).toFixed(2)+'deg');tilt.style.setProperty('--rx',(-y*2.6).toFixed(2)+'deg')});
  hero.addEventListener('pointerleave',function(){tilt.style.setProperty('--rx','0deg');tilt.style.setProperty('--ry','0deg')})}

/* ================= PAYDAY: WITH PEOPLEX VS BY HAND ================= */
var cp=$('#cp');
if(cp){
  var colA=$('.cp-px',cp),colB=$('.cp-hand',cp),la=$$('.cp-px .cp-list li',cp),lb=$$('.cp-hand .cp-list li',cp),cpBar=$('#cpBar'),cpT=[];
  var cpSt=function(col,t){col.querySelector('.cp-st em').textContent=t};
  var off=function(el,c){el.classList.toggle(c,false)};
  var cpReset=function(){cpT.forEach(clearTimeout);cpT=[];[colA,colB].forEach(function(c){off(c,'going');off(c,'fin')});la.concat(lb).forEach(function(l){off(l,'ok');off(l,'now')});cpBar.style.transform='scaleX(0)';cpSt(colA,'Ready');cpSt(colB,'Ready')};
  var tick=function(list,i){list.forEach(function(x){off(x,'now')});if(i>=0){list[i].classList.add('ok');list[i].classList.add('now')}};
  var cpRun=function(){cpReset();
    if(RM){la.concat(lb).forEach(function(l){l.classList.add('ok')});colA.classList.add('fin');colB.classList.add('fin');cpBar.style.transform='scaleX(1)';cpSt(colA,'Done');cpSt(colB,'Every month');return}
    colA.classList.add('going');colB.classList.add('going');cpSt(colA,'Running');cpSt(colB,'Working');
    la.forEach(function(l,i){cpT.push(setTimeout(function(){tick(la,i)},500+i*650))});
    cpT.push(setTimeout(function(){tick(la,-1);off(colA,'going');colA.classList.add('fin');cpSt(colA,'Done')},500+la.length*650+150));
    lb.forEach(function(l,i){cpT.push(setTimeout(function(){tick(lb,i);cpBar.style.transform='scaleX('+((i+1)/lb.length).toFixed(3)+')'},900+i*900))});
    cpT.push(setTimeout(function(){tick(lb,-1);off(colB,'going');colB.classList.add('fin');cpSt(colB,'Every month')},900+lb.length*900+250));
  };
  var cpSeen=false;onScreen(cp,function(v){if(v&&!cpSeen){cpSeen=true;setTimeout(cpRun,450)}});
}

/* ---------- logo marquee ---------- */
var LOGOS=[['colour/ea.webp',39,0],['trim/Hyundai-160-bw.png',33,1],['colour/kenwise.webp',39,0],['colour/niosh.webp',56,0],['trim/Fourier-logo-160.png',27,1],['colour/engenious.webp',34,0],['colour/veltra.webp',38,0],['trim/Air-mineral-Desa160-bw.png',58,1],['colour/frontier.webp',39,0],['colour/syntrino.webp',38,0],['trim/Zolkhoo-160-bw.png',44,1],['colour/eapp.webp',39,0],['colour/seedset.webp',30,0],['trim/MS-Synergy-160-bw.png',57,1],['colour/swif.webp',41,0],['colour/enpro.webp',56,0],['trim/EliteLinks-160-bw.png',43,1],['colour/adansys.webp',42,0],['colour/keasmiles.webp',56,0],['trim/BPO-logo_bw_160.png',49,1],['colour/mna.webp',31,0]];
var mq=$('#mq');
if(mq){var hh=LOGOS.map(function(l){return '<span><img src="assets/img/logos/'+l[0]+'" alt="" style="height:'+l[1]+'px;width:auto"'+(l[2]?' class="mono"':'')+' loading="lazy"></span>'}).join('');mq.innerHTML='<div class="mq-in">'+hh+'</div><div class="mq-in" aria-hidden="true">'+hh+'</div>';}

/* ================= APP EXPLORER: every feature, its real recording, steps that jump the recording, a 3D phone ================= */
var AXF=[
 {k:'attendance',n:'Attendance',ic:'attendance',v:'attendance',one:'Clock in and out with a selfie and your GPS location.',st:[[8,'Open Attendance and line up your face'],[14,'Tap Check in. The time and place are saved'],[18,'Managers see the whole team\'s day']],why:'No punch cards or fingerprint devices to buy.',who:['Your people','Managers'],tag:'Clocked in with GPS',kw:'clock in gps selfie face kehadiran'},
 {k:'leave',n:'Leave',ic:'leave',v:'leave',one:'Apply for leave, follow its status and see your balances.',st:[[2,'Pick the leave type and dates'],[8,'Submit. Your manager gets an alert'],[12,'Follow the status and your balances']],why:'No forms and no chasing. Balances stay up to date.',who:['Your people','Managers'],tag:'Leave request sent',kw:'annual leave cuti balance'},
 {k:'claims',n:'Claims',ic:'claims',v:'claim',one:'Send an expense claim with a photo of the receipt.',st:[[6,'Pick the category'],[10,'Enter the receipt details'],[20,'Add a photo of the receipt and submit']],why:'No lost receipts and no month end pile up.',who:['Your people'],tag:'Receipt attached',kw:'expense claim receipt tuntutan'},
 {k:'ai-scan',n:'AI receipt scan',tn:'AI scan',ic:'ai-scan',v:'ai-scan',isNew:1,one:'Photograph a receipt and the claim fills itself in.',st:[[5.6,'Tap Scan with AI'],[13.1,'Photograph the receipt'],[18.7,'Check the filled in fields, then submit']],why:'From receipt to claim in seconds, with no typing.',who:['Your people'],tag:'Filled in by AI',kw:'ai scan receipt claim artificial intelligence'},
 {k:'payslip',n:'E-Payslip',ic:'payslip',v:'payslip',one:'Every payslip on your phone, month by month.',st:[[4,'Open E-Payslip'],[8,'Unlock the PDF with your IC or passport number'],[16,'Pick any month']],why:'No printing and no handing out payslips.',who:['Your people','HR'],tag:'Payslip PDF, any month',kw:'payslip slip gaji salary pdf'},
 {k:'approvals',n:'Approvals',ic:'approvals',v:'approvals',one:'One inbox for leave, claims, overtime, shifts and tasks.',st:[[0,'Open a request and add a comment'],[8.8,'Check the claim and its receipt'],[15.4,'Reject one item with a reason, approve the rest']],why:'Requests get answered on the phone, with no email threads.',who:['Managers'],tag:'Approved on the phone',kw:'approve approval manager kelulusan'},
 {k:'shifts',n:'Shifts',ic:'shift',v:'shifts',one:'Start a shift with a selfie, see what is coming up and swap with a colleague.',st:[[2.2,'Start your shift with a selfie and location'],[6.6,'See your upcoming shifts'],[8.8,'Swap a shift with a colleague']],why:'Shift changes are agreed in the app, with a record.',who:['Your people','Managers'],tag:'Shift swap sent',kw:'shift swap roster syif'},
 {k:'overtime',n:'Overtime',ic:'overtime',v:'overtime',one:'Request overtime against your real clock in times.',st:[[4.4,'Pick the date you worked'],[6.6,'Scheduled and actual hours come from your clock ins'],[8.8,'Add the overtime hours and submit']],why:'Overtime is tied to attendance, so the hours are easy to check.',who:['Your people','Managers'],tag:'Hours from clock ins',kw:'overtime ot kerja lebih masa'},
 {k:'tasks',n:'Task request',ic:'task',v:'tasks',one:'Ask for work from home, a business trip or time off on a ready template.',st:[[2.2,'Pick a template, such as Work from home'],[4.4,'Set the dates and give a reason'],[15.4,'Submit and follow its status']],why:'Approval comes before the trip, with no back and forth.',who:['Your people','Managers'],tag:'Request sent',kw:'task request work from home wfh business trip'},
 {k:'mileage',n:'Mileage claim',ic:'mileage',v:'mileage',one:'Enter where you started and where you went. The app works out the rest.',st:[[6.6,'Enter the start and the destination'],[17.6,'The app draws the route and measures it'],[22,'The amount is worked out. Add tolls and submit']],why:'No mileage log and no manual sums.',who:['Your people'],tag:'Distance worked out',kw:'mileage travel petrol toll perbatuan'},
 {k:'benefits',n:'Flexi benefits',ic:'benefits',v:'benefits',one:'Claim against your benefit allowance and see what is left.',st:[[8.8,'Pick the benefit. Your balance shows first'],[15.4,'Enter the receipt'],[24.2,'Attach a photo and submit']],why:'People see their allowance before they claim.',who:['Your people','HR'],tag:'Balance shown first',kw:'flexi benefits allowance medical dental faedah'},
 {k:'replacement',n:'Replacement credit',ic:'hourglass',v:'replacement',one:'Worked on a rest day or a public holiday? Apply for the leave you earned.',st:[[2.2,'Pick the day you worked'],[6.6,'Give the reason and submit'],[15.4,'Follow the status']],why:'Approved credit is added to the leave balance automatically.',who:['Your people','HR'],tag:'Credit added to leave',kw:'replacement leave credit rest day public holiday'},
 {k:'esign',n:'E-Signature',ic:'esign',v:'esign',one:'Sign HR letters on your phone with your finger.',st:[[4.4,'Open the letter waiting for you'],[8.8,'Sign with your finger'],[15.4,'Submit. A copy can go to your email']],why:'No printing, signing and scanning.',who:['Your people','HR'],tag:'Signed on the phone',kw:'sign signature letter contract tandatangan'},
 {k:'edocs',n:'My documents',ic:'filing',v:'edocs',one:'Your letters and HR documents in one place.',st:[[0,'Open My Document from the menu'],[4.4,'Search and open any letter']],why:'Nobody has to ask HR for a copy.',who:['Your people','HR'],tag:'Every letter in 1 place',kw:'documents letters confirmation dokumen'},
 {k:'handbook',n:'Handbook',ic:'handbook',v:'handbook',one:'Company policies, searchable on the phone.',st:[[0,'Open Employee Handbook'],[2.2,'Search for a policy'],[4.4,'Read it on your phone']],why:'Everyone reads the same, current policy.',who:['Your people','HR'],tag:'Policies in your pocket',kw:'employee handbook policy sop buku panduan'},
 {k:'directory',n:'Directory',ic:'team',v:'directory',one:'Find any colleague by name: role, department and contact.',st:[[2.2,'Search by name'],[6.6,'Open a colleague for their details']],why:'Teams and branches find each other fast.',who:['Your people'],tag:'Find any colleague',kw:'staff directory intranet colleague contact direktori'},
 {k:'dashboard',n:'Dashboard',ic:'announce',v:'calendar',one:'Company news, your tasks and the team calendar on one screen.',st:[[0,'Read the latest announcement'],[2.2,'Open the calendar'],[4.4,'Switch between leave, WFH, holidays, birthdays and trips']],why:'Everyone sees who is away before they plan.',who:['Your people','Managers'],tag:'News, tasks, calendar',kw:'dashboard announcement calendar holiday birthday pengumuman'},
 {k:'assets',n:'Assets',ic:'asset',v:'assets',one:'See the company devices assigned to you.',st:[[0,'Open Asset from the menu'],[4.4,'See every device in your name'],[6.6,'Open one for its tag, model and serial number']],why:'Every device has a named owner.',who:['Your people','HR'],tag:'Devices on record',kw:'asset laptop device equipment aset'}
];
var AXG=[['Every day',['attendance','leave','approvals','payslip','dashboard','directory']],['Claims and benefits',['claims','ai-scan','mileage','benefits']],['Shifts and overtime',['shifts','overtime','tasks','replacement']],['Documents',['esign','edocs','handbook','assets']]];
var axSec=$('#app');
if(axSec){(function(){
  var groups=$('#axGroups'),list=$('#axList'),idx=$('#axIdx'),vid=$('#axVid'),poster=$('#axPoster'),scr=$('.ax-scr',axSec),bar=$('#axBar'),playB=$('#axPlay'),stage=$('#axStage'),d3=$('#ax3d');
  var F={},ORDER=[];AXF.forEach(function(f){F[f.k]=f});AXG.forEach(function(g,gi){g[1].forEach(function(k){ORDER.push([k,gi])})});
  var curK=null,curG=-1,live=false,userPaused=false,tok=0,stepBtns=[],blobs={};
  function esc(t){return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;')}
  var IOSV={calendar:1,card:1,directory:1,edocs:1,esign:1,handbook:1,payslip:1},tcv=D.createElement('canvas'),tcx=null;tcv.width=tcv.height=1;try{tcx=tcv.getContext('2d',{willReadFrequently:true})}catch(e){}
  function geo(f){var t=f.v==='ai-scan'?22:0,nb=f.v==='ai-scan'?46:(f.v==='assets'?54:(IOSV[f.v]?14:40));scr._t=t;scr.classList.toggle('ios',!!IOSV[f.v]);scr.style.setProperty('--vt',(-t/720*100).toFixed(3)+'%');scr.style.setProperty('--nb',(nb/720*100).toFixed(3)+'%');scr.style.setProperty('--ph',t?'3.4%':(IOSV[f.v]?'2.6%':'1.5%'))}
  function tint(el){if(!tcx)return;try{var w=el.videoWidth||el.naturalWidth,h=el.videoHeight||el.naturalHeight;if(!w)return;tcx.drawImage(el,w*4/348,h*((scr._t||0)+(scr.classList.contains('ios')?22:4))/734,1,1,0,0,1,1);var p=tcx.getImageData(0,0,1,1).data;scr.style.setProperty('--hc','rgb('+p[0]+','+p[1]+','+p[2]+')');scr.style.setProperty('--hi',(p[0]*.3+p[1]*.59+p[2]*.11)>150?'#14161B':'#fff')}catch(e){}}
  poster.addEventListener('load',function(){if(!vid.classList.contains('on'))tint(poster)});
  groups.innerHTML=AXG.map(function(g,i){return '<button type="button" class="ax-g" role="tab" aria-selected="false" data-g="'+i+'">'+esc(g[0])+'<span>'+g[1].length+'</span></button>'}).join('');
  idx.innerHTML=AXF.map(function(f){return '<button type="button" tabindex="-1" data-app-open="'+f.k+'" data-search="'+esc(f.n)+'" data-search-group="App" data-search-desc="'+esc(f.one)+'" data-search-text="'+esc(f.kw)+'" data-search-action="click">'+esc(f.n)+'</button>'}).join('');
  var gBtns=$$('.ax-g',groups);
  function setPlayIcon(p){playB.innerHTML='<i class="ph-duotone '+(p?'ph-pause':'ph-play')+'" aria-hidden="true"></i>';playB.setAttribute('aria-label',p?'Pause the recording':'Play the recording')}
  function srcFor(f,cb){var u='assets/video/app/'+f.v+'.mp4';if(blobs[u])return cb(blobs[u]);if(!W.fetch||!W.URL||!URL.createObjectURL)return cb(u);fetch(u).then(function(r){if(!r.ok)throw 0;return r.blob()}).then(function(bl){blobs[u]=URL.createObjectURL(bl);cb(blobs[u])}).catch(function(){cb(u)})}
  function load(f,t,play){var my=++tok;vid.classList.remove('on');scr.classList.remove('sw');vid.pause();vid.setAttribute('data-k',f.k);
    srcFor(f,function(u){if(my!==tok)return;vid.src=u;vid.loop=true;
      vid.addEventListener('loadedmetadata',function(){if(my!==tok)return;try{vid.currentTime=t}catch(e){}if(play){var p=vid.play();if(p&&p.catch)p.catch(function(){})}},{once:true});
      vid.addEventListener('seeked',function(){if(my===tok){vid.classList.add('on');scr.classList.add('sw');tint(vid)}},{once:true});vid.load()})}
  function markStep(t){var f=F[curK],n=-1;if(f)f.st.forEach(function(s,k){if(t>=s[0]-.05)n=k});stepBtns.forEach(function(b,k){b.classList.toggle('on',k===n)})}
  function showGroup(gi){curG=gi;gBtns.forEach(function(b,n){var on=n===gi;b.classList.toggle('on',on);b.setAttribute('aria-selected',String(on))});
    list.innerHTML=AXG[gi][1].map(function(k){var f=F[k];return '<div class="ax-row" data-app="'+k+'"><button type="button" class="ax-rb" aria-expanded="false"><img class="ic3" src="assets/img/ic3d/'+f.ic+'.webp" alt="" width="256" height="256"><span class="ax-rt"><b>'+esc(f.n)+(f.isNew?'<em>New</em>':'')+'</b><span>'+esc(f.one)+'</span></span><i class="ax-ch" aria-hidden="true"></i></button><div class="ax-more"><div><ol class="ax-steps">'+f.st.map(function(s,n){return '<li><button type="button" data-t="'+s[0]+'"><b>'+(n+1)+'</b><span>'+esc(s[1])+'</span></button></li>'}).join('')+'</ol><p class="ax-why"><i class="ph-duotone ph-check-circle" aria-hidden="true"></i><span>'+esc(f.why)+'</span></p><ul class="ax-who" aria-label="Who it helps">'+f.who.map(function(w){return '<li>For '+(w==='HR'?'HR':w.toLowerCase())+'</li>'}).join('')+'</ul></div></div></div>'}).join('');
    $$('.ax-rb',list).forEach(function(b){b.addEventListener('click',function(){select(b.parentElement.getAttribute('data-app'),{user:true})})});
    $$('.ax-steps button',list).forEach(function(b){b.addEventListener('click',function(){var k=b.closest('.ax-row').getAttribute('data-app'),f=F[k],t=+b.getAttribute('data-t');if(k!==curK)select(k,{user:true});userPaused=false;if(vid.getAttribute('data-k')!==k||vid.readyState<1){load(f,t,!RM)}else{try{vid.currentTime=t}catch(e){}if(!RM){var p=vid.play();if(p&&p.catch)p.catch(function(){})}}setPlayIcon(!RM);markStep(t)})})}
  function select(k,opts){var f=F[k];if(!f)return;var gi=0;ORDER.forEach(function(o){if(o[0]===k)gi=o[1]});if(gi!==curG)showGroup(gi);
    if(k===curK&&!(opts&&opts.force))return;curK=k;
    $$('.ax-row',list).forEach(function(r){var on=r.getAttribute('data-app')===k;r.classList.toggle('on',on);r.querySelector('.ax-rb').setAttribute('aria-expanded',String(on))});
    stepBtns=$$('.ax-row.on .ax-steps button',list);
    geo(f);poster.src='assets/video/app/'+f.v+'.jpg';if(poster.complete&&poster.naturalWidth)tint(poster);scr.classList.remove('sw');vid.classList.remove('on');bar.style.transform='scaleX(0)';markStep(-1);
    if(live&&!RM){userPaused=false;load(f,f.st[0][0],true);setPlayIcon(true)}else{tok++;vid.removeAttribute('data-k');setPlayIcon(false)}
    W.pxTrack&&opts&&opts.user&&W.pxTrack('app_feature',{feature:k})}
  function step(d){var i=0;ORDER.forEach(function(o,n){if(o[0]===curK)i=n});select(ORDER[(i+d+ORDER.length)%ORDER.length][0],{user:true})}
  gBtns.forEach(function(b,i){b.addEventListener('click',function(){if(i!==curG){showGroup(i);select(AXG[i][1][0],{user:true,force:true})}})});
  groups.addEventListener('keydown',function(e){if(!e.target||!e.target.matches||!e.target.matches('.ax-g'))return;var d=e.key==='ArrowRight'?1:(e.key==='ArrowLeft'?-1:0);if(!d)return;e.preventDefault();var n=(curG+d+AXG.length)%AXG.length;showGroup(n);select(AXG[n][1][0],{user:true,force:true});gBtns[n].focus()});
  vid.addEventListener('timeupdate',function(){if(!vid.duration)return;bar.style.transform='scaleX('+(vid.currentTime/vid.duration).toFixed(4)+')';markStep(vid.currentTime);tint(vid)});
  playB.addEventListener('click',function(){var f=F[curK];if(vid.getAttribute('data-k')!==f.k||vid.readyState<1){userPaused=false;load(f,f.st[0][0],true);setPlayIcon(true);return}if(vid.paused){userPaused=false;var p=vid.play();if(p&&p.catch)p.catch(function(){});setPlayIcon(true)}else{userPaused=true;vid.pause();setPlayIcon(false)}});
  onScreen(stage,function(v){live=v;if(v){if(RM)return;var f=F[curK];if(vid.getAttribute('data-k')!==f.k){load(f,f.st[0][0],true);setPlayIcon(true)}else if(!userPaused){var p=vid.play();if(p&&p.catch)p.catch(function(){});setPlayIcon(true)}}else{vid.pause()}});
  W.PXApp={open:function(key){if(!F[key])return false;select(key,{user:true,force:true});scrollToEl(axSec);return true},keys:AXF.map(function(f){return f.k})};
  D.addEventListener('click',function(e){var a=e.target&&e.target.closest?e.target.closest('[data-app-open]'):null;if(a){e.preventDefault();W.PXApp.open(a.getAttribute('data-app-open'))}});
  select('attendance');
  if(RM||!FINE)return;
  /* the phone leans a few degrees toward the pointer and settles back; it never turns away */
  var rx=0,ry=0,tx=0,ty=0,hov=0,run=false;
  stage.addEventListener('pointermove',function(e){var r=stage.getBoundingClientRect();tx=(e.clientX-r.left)/r.width-.5;ty=(e.clientY-r.top)/r.height-.5;hov=1});
  stage.addEventListener('pointerleave',function(){hov=0});
  function loop(){if(!run)return;var gy=hov?tx*12:0,gx=hov?-ty*7:0;rx+=(gx-rx)*.08;ry+=(gy-ry)*.08;d3.style.transform='rotateX('+rx.toFixed(2)+'deg) rotateY('+ry.toFixed(2)+'deg)';requestAnimationFrame(loop)}
  onScreen(stage,function(v){if(v&&!run){run=true;requestAnimationFrame(loop)}else if(!v){run=false}});
})()}

/* ================= SERVICES ================= */
var svList=$$('.sv-it'),svPanes=$$('.svp'),svSec=$('#services'),svCur=0,svLive=false,svHold=false;
var NAMES=[['SB','Sofiah Bella','Operations',5000],['RT','Raymond Tan','Finance',6200],['SH','Siti Hafidah','Sales',3800],['MR','Mohammad Ridwan','Warehouse',2600]];
var svVids=$$('.sv-film video');
function svFilm(){svVids.forEach(function(v,k){var on=k===svCur,p;v.classList.toggle('on',on);if(!on||!svLive||RM){v.pause();return}
  if(v.getAttribute('src')){p=v.play();if(p&&p.catch)p.catch(function(){});return}
  if(v._ld)return;v._ld=1;var u=v.getAttribute('data-src'),go=function(src){v.src=src;if(svCur===k&&svLive){var q=v.play();if(q&&q.catch)q.catch(function(){})}};
  if(W.fetch&&W.URL&&URL.createObjectURL)fetch(u).then(function(r){if(!r.ok)throw 0;return r.blob()}).then(function(b){go(URL.createObjectURL(b))}).catch(function(){go(u)});else go(u)})}
var runRows=$('#runRows');
if(runRows){runRows.innerHTML=NAMES.map(function(n){return '<li><span class="run-av">'+n[0]+'</span><span class="run-nm"><b>'+n[1]+'</b><span>'+n[2]+'</span></span><span class="run-am">RM '+money(calc(n[3]).net)+'</span><span class="run-ps"><em>Checking</em></span></li>'}).join('')}
var runTimers=[];function clearRun(){runTimers.forEach(clearTimeout);runTimers=[]}
function runLoop(){
  clearRun();var run=$('#run'),rows=$$('#runRows li'),tot=$('#runTot'),stt=$('#runSt em');if(!run)return;
  run.classList.remove('done');stt.textContent='Running';rows.forEach(function(r){r.classList.remove('paid');r.querySelector('.run-ps em').textContent='Checking'});tot._v=0;tot.textContent='0.00';
  if(RM){rows.forEach(function(r){r.classList.add('paid');r.querySelector('.run-ps em').textContent='Paid'});run.classList.add('done');stt.textContent='Completed';tot.textContent=money(NAMES.reduce(function(a,n){return a+calc(n[3]).net},0));return}
  var sum=0;
  rows.forEach(function(r,i){runTimers.push(setTimeout(function(){r.classList.add('paid');r.querySelector('.run-ps em').textContent='Paid';sum+=calc(NAMES[i][3]).net;tweenNum(tot,sum,money)},700+i*620))});
  runTimers.push(setTimeout(function(){run.classList.add('done');stt.textContent='Completed'},700+rows.length*620+200));
  runTimers.push(setTimeout(function(){if(svLive&&svCur===0)runLoop()},700+rows.length*620+3600));
}
var eorTimers=[];function clearEor(){eorTimers.forEach(clearTimeout);eorTimers=[]}
function eorLoop(){
  clearEor();var li=$$('#eorList li'),stp=$('#eorStamp');li.forEach(function(l){l.classList.remove('ok')});stp.classList.remove('on');
  if(RM){li.forEach(function(l){l.classList.add('ok')});stp.classList.add('on');return}
  li.forEach(function(l,i){eorTimers.push(setTimeout(function(){l.classList.add('ok')},500+i*600))});
  eorTimers.push(setTimeout(function(){stp.classList.add('on')},500+li.length*600+100));
  eorTimers.push(setTimeout(function(){if(svLive&&svCur===1)eorLoop()},500+li.length*600+3600));
}
function svSet(i,user){
  svCur=i;if(user){svHold=true}
  svList.forEach(function(b,k){var on=k===i;b.classList.toggle('on',on);b.setAttribute('aria-selected',String(on));b.classList.toggle('hold',svHold&&on);var pr=b.querySelector('.sv-pr');if(on&&pr){pr.style.animation='none';void pr.offsetWidth;pr.style.animation=''}});
  svPanes.forEach(function(p,k){var on=k===i;p.classList.toggle('on',on);if(on)p.removeAttribute('hidden');else p.setAttribute('hidden','')});
  clearRun();clearEor();svFilm();
  if(svLive){if(i===0)runLoop();if(i===1)eorLoop()}
}
svList.forEach(function(b,k){
  b.addEventListener('click',function(){svSet(k,true)});
  var pr=b.querySelector('.sv-pr');if(pr)pr.addEventListener('animationend',function(){if(!svHold&&svLive&&svCur===k)svSet((k+1)%svList.length,false)});
});
onScreen(svSec,function(v){svLive=v;svSec.classList.toggle('vis',v);if(v){svSet(svCur,false)}else{clearRun();clearEor();svFilm()}});

/* ================= CUSTOMER STORIES ================= */
var stGrid=$('#stGrid');
if(stGrid){(function(){
  var cards=$$('.st-c',stGrid),rows=[],live=false,raf=0,last=0;
  function fit(){$$('.st-c',stGrid).forEach(function(c){var p=c.querySelector('blockquote p'),bn=c.querySelector('.st-rm');if(!p||!bn||c.classList.contains('open'))return;bn.hidden=!(p.scrollHeight>p.clientHeight+2)})}
  stGrid.addEventListener('click',function(e){var bn=e.target.closest?e.target.closest('.st-rm'):null;if(!bn)return;var c=bn.closest('.st-c'),o=!c.classList.contains('open');c.classList.toggle('open',o);bn.textContent=o?'Show less':'Read more';bn.hidden=false});
  /* 2 rows: 6 cards and 5 cards, each followed by a copy of itself so the row can loop; the top row moves right to left, the bottom row left to right */
  [cards.slice(0,6),cards.slice(6)].forEach(function(set,k){var row=D.createElement('div'),tr=D.createElement('div');row.className='st-row';tr.className='st-tr';
    set.forEach(function(c){tr.appendChild(c)});
    if(!RM)set.forEach(function(c){var cl=c.cloneNode(true);cl.setAttribute('aria-hidden','true');$$('a,button',cl).forEach(function(b){b.tabIndex=-1});tr.appendChild(cl)});
    row.appendChild(tr);stGrid.appendChild(row);rows.push({el:row,tr:tr,n:set.length,x:k?230:0,v:k?-32:36,hold:0,drag:false,sx:0,ss:0,moved:0})});
  stGrid.classList.add('st-rows');
  function half(r){var a=r.tr.children[0],b=r.tr.children[r.n];return b?b.offsetLeft-a.offsetLeft:0}
  function wrap(r,x){var hf=half(r);if(!hf)return x;while(x>=hf)x-=hf;while(x<0)x+=hf;return x}
  function frame(t){raf=0;if(!live)return;var dt=Math.min(.05,(t-last)/1000||.016);last=t;
    rows.forEach(function(r){var open=!!r.tr.querySelector('.st-c.open');
      if(r.drag||r.hold>t||open){r.x=wrap(r,r.el.scrollLeft);if(Math.abs(r.x-r.el.scrollLeft)>1)r.el.scrollLeft=r.x;return}
      r.x=wrap(r,r.x+r.v*dt);r.el.scrollLeft=r.x});
    raf=W.requestAnimationFrame(frame)}
  rows.forEach(function(r){var el=r.el;
    function rest(ms){r.hold=(W.performance?performance.now():0)+ms}
    el.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse'||e.button)return;r.drag=true;r.moved=0;r.sx=e.clientX;r.ss=el.scrollLeft;el.classList.add('drag');try{el.setPointerCapture(e.pointerId)}catch(x){}});
    el.addEventListener('pointermove',function(e){if(!r.drag)return;var dx=e.clientX-r.sx;r.moved=Math.max(r.moved,Math.abs(dx));el.scrollLeft=wrap(r,r.ss-dx)});
    function up(){if(!r.drag)return;r.drag=false;el.classList.remove('drag');r.x=el.scrollLeft;rest(1400)}
    el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
    el.addEventListener('click',function(e){if(r.moved>6){e.preventDefault();e.stopPropagation();r.moved=0}},true);
    el.addEventListener('touchstart',function(){rest(60000)},{passive:true});el.addEventListener('touchend',function(){rest(1800)},{passive:true});
    el.addEventListener('wheel',function(e){if(Math.abs(e.deltaX)>Math.abs(e.deltaY))rest(1600)},{passive:true});
    el.addEventListener('mouseenter',function(){rest(60000)});el.addEventListener('mouseleave',function(){if(!r.drag)rest(350)});
    if(!RM)el.scrollLeft=r.x});
  fit();W.addEventListener('load',fit);W.addEventListener('resize',fit);if(D.fonts&&D.fonts.ready)D.fonts.ready.then(fit);
  if(!RM)onScreen(stGrid,function(v){live=v;if(v&&!raf){last=W.performance?performance.now():0;raf=W.requestAnimationFrame(frame)}});
  W.__pxStories={rows:function(){return rows.map(function(r){return {x:Math.round(r.el.scrollLeft),half:half(r),cards:r.tr.children.length}})}};
})()}

/* ================= FAQ: one open at a time ================= */
$$('.fq-it').forEach(function(d){d.addEventListener('toggle',function(){if(d.open)$$('.fq-it').forEach(function(o){if(o!==d)o.open=false});if(GS)setTimeout(function(){W.ScrollTrigger.refresh()},520)})});

/* ================= hero: the first line changes, the promise stays ================= */
(function(){var ln=$('.hero h1 .ln>span');if(!ln||RM)return;
  var first=ln.textContent,rot=D.createElement('span'),its=[],i=0,t=0,vis=true;
  rot.className='rot';
  [first,'EPF and PCB,','HR admin,','Hiring abroad,'].forEach(function(w,n){var e=D.createElement('span');e.textContent=w;if(n)e.setAttribute('aria-hidden','true');else e.className='on';rot.appendChild(e);its.push(e)});
  ln.textContent='';ln.appendChild(rot);
  function next(){var a=its[i];i=(i+1)%its.length;var b=its[i];a.className='out';b.className='pre';b.offsetWidth;b.className='on';setTimeout(function(){if(a.className==='out')a.className=''},1000)}
  function run(){clearInterval(t);if(vis&&!D.hidden&&(!W.__pxLd||W.__pxLd.done))t=setInterval(next,2900)}
  onScreen($('.hero'),function(v){vis=v;run()});D.addEventListener('visibilitychange',run);W.addEventListener('px:loaded',run);
  W.__pxHeroRot={next:next,count:its.length};
})();

/* ================= the PeopleX helper: waves, and answers from this page's own facts ================= */
(function(){var mc=$('#mc');if(!mc)return;
  var fig=$('#mcFig'),txt=$('#mcTxt'),go=$('#mcGo'),form=$('#mcForm'),q=$('#fqQ'),say=$('#mcSay'),sec=$('#faq'),its=$$('#fqList .fq-it');
  var wT=0,sT=0,pT=0,vis=false,seen=false,tip=0,WA='https://wa.me/60105166680';
  var STOP={the:1,and:1,for:1,how:1,what:1,does:1,is:1,are:1,can:1,you:1,your:1,our:1,with:1,much:1,long:1,about:1,that:1,this:1,have:1,from:1,will:1,who:1,should:1,take:1,it:1,to:1,'do':1,we:1,'in':1,of:1,on:1,a:1,i:1,my:1,me:1,really:1,peoplex:1,there:1,any:1,get:1,need:1,want:1,tell:1,please:1,an:1,or:1,if:1,use:1};
  var FACTS=['Statutory payments are due by the 15th of each month. PeopleX files them for you.','The minimum wage is RM1,700 a month.','Switching takes 4 to 6 weeks, with a parallel run first.'];
  function pose(p){mc.setAttribute('data-pose',p)}
  var WAVE=['wave-a','wave-b','wave-c','wave-b'];
  function wave(n){clearInterval(wT);clearTimeout(pT);if(RM){pose('wave-b');return}var k=0,m=(n||3)*4+1;pose('wave-a');wT=setInterval(function(){k++;if(k>=m){clearInterval(wT);pose('idle');return}pose(WAVE[k%4])},125)}
  function blink(){if(mc.getAttribute('data-pose')!=='idle')return;pose('blink');setTimeout(function(){if(mc.getAttribute('data-pose')==='blink')pose('idle')},150)}
  function hop(){if(RM)return;fig.classList.remove('hop');fig.offsetWidth;fig.classList.add('hop')}
  fig.addEventListener('animationend',function(e){if(e.animationName==='mcHop')fig.classList.remove('hop')});
  function act(label,fn,href){var a=D.createElement(href?'a':'button');if(href){a.href=href;if(/^https/.test(href)){a.target='_blank';a.rel='noopener'}}else a.type='button';a.textContent=label;if(fn)a.addEventListener('click',fn);return a}
  var bob=$('.mc-bob',mc),tT=0,asked=false,idleN=0,IDLE=['Hi. Ask me about price, switching, the app or your take home pay.','Try me: what does payroll cost for 25 people?','Press me for a payroll fact.'];
  function type(t){var ws=String(t).split(' ');txt.textContent='';ws.forEach(function(w,i){var e=D.createElement('span');e.textContent=w+(i<ws.length-1?' ':'');e.style.animationDelay=(i*40)+'ms';txt.appendChild(e)});
    say.style.setProperty('--gd',(ws.length*40+120)+'ms');say.classList.remove('pop');say.offsetWidth;say.classList.add('pop');
    if(!RM){bob.classList.add('talk');clearTimeout(tT);tT=setTimeout(function(){bob.classList.remove('talk')},ws.length*40+420)}}
  function speak(t,acts,p){clearInterval(wT);clearTimeout(sT);clearTimeout(pT);say.classList.add('think');if(!RM)pose('think');
    sT=setTimeout(function(){go.textContent='';(acts||[]).forEach(function(a){go.appendChild(a)});go.hidden=!(acts&&acts.length);say.classList.remove('think');type(t);
      if(p==='wave')wave(2);else{pose(p||'point');if(p==='cheer')hop();pT=setTimeout(function(){pose('idle')},p==='cheer'?2200:6500)}},RM?0:520)}
  function amount(s){var m=s.replace(/,/g,'').match(/(\d+(?:\.\d+)?)\s*(k\b|ribu)?/);if(!m)return 0;var v=parseFloat(m[1])*(m[2]?1000:1);return v>=500&&v<=100000?Math.round(v):0}
  function stem(x){return x.length>4?x.replace(/(ing|es|s)$/,''):x}
  function openFaq(d){its.forEach(function(o){o.hidden=false;o.open=o===d});d.classList.add('in');d.classList.remove('hit');d.offsetWidth;d.classList.add('hit')}
  function ask(raw,src){asked=true;var s=(raw||'').toLowerCase().replace(/[?!.;:]+/g,' ').replace(/\s+/g,' ').trim(),kind='none',w,c;
    if(!s){speak('Type a question, or pick one below.',null,'wave');return 'empty'}
    w=amount(s);
    if(/^(hi|hello|hey|hai|helo|salam|yo)\b/.test(s)&&s.split(' ').length<4){kind='hello';speak('Hello. Ask me about price, switching, the app or your take home pay.',null,'wave')}
    else if(/thank|terima kasih/.test(s)){kind='thanks';speak('Any time.',null,'cheer')}
    else if(w&&/epf|kwsp|socso|perkeso|eis|pcb|tax|cukai|take home|net|salary|gaji|deduct|potong|pay|rm|^\d/.test(s)){kind='calc';c=W.__pxEngine.calc(w);
      speak('On RM'+int(w)+' a month: EPF RM'+money(c.epf)+', SOCSO RM'+money(c.soc)+', EIS RM'+money(c.eis)+', PCB about RM'+money(c.pcb)+'. Take home RM'+money(c.net)+'.',[act('Open the calculator',function(){PX.set('salary',clamp(w,1700,20000),'mascot');scrollToEl($('#top'))})],'cheer')}
    else if(/who are you|your name|what are you|mascot|robot|\bbot\b/.test(s)){kind='about';speak('I am the PeopleX helper. I answer from this page. For anything else, the team is on WhatsApp.',[act('WhatsApp the team',null,WA)],'wave')}
    else if(/human|person|expert|\bcall\b|talk|demo|consult|contact|meet|sales|email|phone/.test(s)){kind='contact';speak('Sure. Book a free consultation, or message the team on WhatsApp.',[act('Book a consultation',function(){scrollToEl($('#contact'))}),act('WhatsApp the team',null,WA)],'point')}
    else if(/\bcheck\b|score|health|audit|risk/.test(s)){kind='check';speak('Take the 60 second check. You get a score out of 100 with no sign up.',[act('Start the check',function(){if(W.PXCheck)W.PXCheck.start({entry:'mascot'});else scrollToEl($('#check'))})],'point')}
    else if(/\beor\b|employer of record|abroad|overseas|luar negara|indonesia|thailand|vietnam|myanmar|countr|office|where are/.test(s)){kind='eor';speak('PeopleX has teams in Malaysia, Indonesia, Myanmar, Thailand and Vietnam, and can be your Employer of Record when you hire outside Malaysia.',[act('See the services',function(){scrollToEl($('#services'))})],'point')}
    else{var ws=s.split(' ').filter(function(x){return x.length>1&&!STOP[x]}).map(stem),best=null,bs=0,bf=null,fs=0;
      its.forEach(function(d){var sm=$('summary',d).textContent.toLowerCase(),kw=(d.getAttribute('data-kw')||'').toLowerCase(),bd=d.textContent.toLowerCase(),sc=0;
        ws.forEach(function(x){if(x==='app')sc+=1;else if(kw.indexOf(x)>-1)sc+=3;else if(sm.indexOf(x)>-1)sc+=2;else if(bd.indexOf(x)>-1)sc+=1});if(sc>bs){bs=sc;best=d}});
      AXF.forEach(function(f){var t=(f.n+' '+f.kw).toLowerCase(),sc=0;ws.forEach(function(x){if(x!=='app'&&t.indexOf(x)>-1)sc+=3});if(sc>fs){fs=sc;bf=f}});
      if(bf&&fs>=3&&fs>=bs){kind='feature';speak('Yes. '+bf.one,[act('Watch it in the app',function(){W.PXApp&&W.PXApp.open(bf.k)})],'point')}
      else if(best&&bs>=2){kind='faq';openFaq(best);speak(best.getAttribute('data-a')||$('summary',best).textContent,[act('Read the full answer',function(){scrollToEl(best)})],'point')}
      else speak('I do not have that one yet. A PeopleX expert does.',[act('WhatsApp the team',null,WA),act('Book a consultation',function(){scrollToEl($('#contact'))})],'wave')}
    W.pxTrack&&W.pxTrack('mascot_ask',{q:String(raw).slice(0,120),kind:kind,src:src||'typed'});return kind}
  form.addEventListener('submit',function(e){e.preventDefault();ask(q.value,'typed')});
  $$('#mcChips [data-ask]').forEach(function(b){b.addEventListener('click',function(){q.value=b.getAttribute('data-ask');ask(q.value,'chip')})});
  fig.addEventListener('click',function(){asked=true;speak(FACTS[tip++%FACTS.length],null,'cheer');W.pxTrack&&W.pxTrack('mascot_tap',{n:tip})});
  fig.addEventListener('pointerenter',function(){if(/^(idle|blink)$/.test(mc.getAttribute('data-pose'))&&!say.classList.contains('think'))wave(2)});
  onScreen(mc,function(v){vis=v;if(v&&!seen){seen=true;setTimeout(function(){if(!asked){type(IDLE[0]);wave(3)}},500)}});
  if(!RM){setInterval(function(){if(vis&&!D.hidden&&mc.getAttribute('data-pose')==='idle'&&!say.classList.contains('think')){if(!asked){go.hidden=true;type(IDLE[++idleN%IDLE.length])}wave(2)}},9000);setInterval(function(){if(vis&&!D.hidden)blink()},3400)}
  W.PXMascot={ask:ask,pose:function(){return mc.getAttribute('data-pose')}};
})();


/* ================= CONTACT (demo: nothing is sent) ================= */
var form=$('#ctForm');
if(form){
  var ctDone=$('#ctDone'),ctSum=$('#ctSum'),IND={retail:'Retail',manufacturing:'Manufacturing',services:'Services',other:'Other'};
  function sizeFor(n){return n<=10?'1 to 10':(n<=50?'11 to 50':(n<=100?'51 to 100':'Over 100'))}
  function pick(name,val){$$('input[name="'+name+'"]',form).forEach(function(r){r.checked=r.value===val})}
  function fromState(){
    if(!form.getAttribute('data-size-set'))pick('size',sizeFor(+PX.get('headcount')||25));
    if(PX.get('need')&&!form.getAttribute('data-need-set'))pick('need',PX.get('need'));
    var c=PX.get('check');
    if(c&&typeof c.score==='number'){ctSum.hidden=false;ctSum.textContent='From your check: '+c.score+' of 100, '+int(c.headcount||PX.get('headcount'))+' people'+(c.industry&&IND[c.industry]?', '+IND[c.industry]:'')+'.'}
  }
  fromState();W.addEventListener('px:change',fromState);
  $$('input[name="size"]',form).forEach(function(r){r.addEventListener('change',function(){form.setAttribute('data-size-set','1')})});
  $$('input[name="need"]',form).forEach(function(r){r.addEventListener('change',function(){form.setAttribute('data-need-set','1');PX.set('need',r.value,'contact')})});
  function setErr(f,msg){var w=f.parentElement,e=w.querySelector('.fld-e');w.classList.toggle('bad',!!msg);if(msg){if(!e){e=D.createElement('span');e.className='fld-e';e.setAttribute('role','alert');w.appendChild(e)}e.textContent=msg}else if(e){w.removeChild(e)}}
  form.addEventListener('submit',function(e){e.preventDefault();var first=null;
    [['#fName','Please tell us your name.',function(v){return v.length>1}],['#fMail','Please enter a valid work email.',function(v){return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)}],['#fTel','Please enter a phone number we can WhatsApp.',function(v){return v.replace(/\D/g,'').length>=9}]].forEach(function(r){var f=$(r[0]),ok=r[2](f.value.trim());setErr(f,ok?'':r[1]);if(!ok&&!first)first=f});
    if(first){first.focus();return}
    var nm=$('#fName').value.trim().split(/\s+/)[0];$('#ctDoneT').textContent='Thanks, '+nm+'.';
    W.pxTrack&&W.pxTrack('form_submit',{entry:PX.get('entry')||'contact',need:(form.need&&form.need.value)||'',size:(form.size&&form.size.value)||''});
    form.hidden=true;ctDone.hidden=false;try{ctDone.focus({preventScroll:true})}catch(x){}});
  $$('.fld input,.fld textarea',form).forEach(function(f){f.addEventListener('input',function(){setErr(f,'')})});
  $('#ctAgain').addEventListener('click',function(){form.reset();form.removeAttribute('data-size-set');form.removeAttribute('data-need-set');fromState();ctDone.hidden=true;form.hidden=false;$('#fName').focus()});
}

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

/* the hero scroll cue fades once the visitor has scrolled */
(function(){var on=false;function f(){var o=W.pageYOffset>60;if(o!==on){on=o;H.classList.toggle('hs-off',o)}}W.addEventListener('scroll',f,{passive:true});f()})();

/* ================= reveal safety net: anything on screen that the observer missed is shown ================= */
(function(){if(!H.classList.contains('io'))return;var tick=false,live=true;
  function sweep(){tick=false;if(!live)return;var vh=W.innerHeight,left=0;$$('.rv:not(.in)').forEach(function(e){var r=e.getBoundingClientRect();if(!r.width&&!r.height)return;if(r.top<vh*.94&&r.bottom>0)e.classList.add('in');else left++});if(!left)live=false}
  function on(){if(live&&!tick){tick=true;W.requestAnimationFrame(sweep)}}
  W.addEventListener('scroll',on,{passive:true});W.addEventListener('resize',on,{passive:true});W.addEventListener('load',function(){setTimeout(sweep,600)});W.addEventListener('px:loaded',function(){setTimeout(sweep,900)});setTimeout(sweep,2500);
})();

/* ================= premium pass: headline lines, the cursor ring, card tilt, the kinetic band ================= */
$$('h2.h2').forEach(function(hd){if(hd.querySelector('.hl'))return;hd.innerHTML=hd.innerHTML.split(/<br\s*\/?>/i).map(function(p,i){return '<span class="hl" style="--i:'+i+'"><span>'+p+'</span></span>'}).join('');hd.classList.add('hx')});
onScreen($('#kb'),function(v){var k=$('#kb');if(k)k.classList.toggle('vis',v)});
if(FINE&&!RM){(function(){
  var cur=D.createElement('div'),x=0,y=0,tx=0,ty=0,on=false,raf=0,last=0;cur.className='cur';cur.setAttribute('aria-hidden','true');D.body.appendChild(cur);
  function fr(t){var dt=Math.min(.05,((t-last)/1000)||.016),k=1-Math.exp(-14*dt);last=t;x+=(tx-x)*k;y+=(ty-y)*k;cur.style.transform='translate3d('+x.toFixed(1)+'px,'+y.toFixed(1)+'px,0)';raf=(Math.abs(tx-x)+Math.abs(ty-y)>.3)?W.requestAnimationFrame(fr):0}
  D.addEventListener('pointermove',function(e){if(e.pointerType==='touch')return;tx=e.clientX;ty=e.clientY;if(!on){on=true;x=tx;y=ty;cur.classList.add('on')}if(!raf){last=W.performance?performance.now():0;raf=W.requestAnimationFrame(fr)}
    var t=e.target&&e.target.closest?e.target.closest('a,button,[role=tab],summary,input[type=range],label,.pz-c'):null;cur.classList.toggle('act',!!t)},{passive:true});
  D.documentElement.addEventListener('mouseleave',function(){on=false;cur.classList.remove('on')});
  D.addEventListener('pointerdown',function(){cur.classList.add('dn')},true);D.addEventListener('pointerup',function(){cur.classList.remove('dn')},true);
  $$('.sk-c,.pz-c,.pn-c').forEach(function(c){
    c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect(),px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;c.style.transitionDelay='0s';c.style.transition='transform .25s';c.style.transform='perspective(1000px) rotateX('+(-py*3).toFixed(2)+'deg) rotateY('+(px*3).toFixed(2)+'deg) translateY(-3px)'});
    c.addEventListener('pointerleave',function(){c.style.transition='transform .8s cubic-bezier(.16,1,.3,1)';c.style.transform='';setTimeout(function(){c.style.transition=''},820)})});
})()}

/* ================= figures count up once, the first time they are seen ================= */
$$('[data-count]').forEach(function(e){if(RM)return;var to=+e.getAttribute('data-count'),done=false;e._v=0;e.textContent='0';onScreen(e,function(v){if(v&&!done){done=true;tweenNum(e,to,int)}})});

/* ================= the plan: a parallel run that reconciles, then go live ================= */
(function(){var box=$('#pnRun');if(!box)return;var rows=$('#pnRows'),stt=$('#pnSt'),okL=$('#pnOk'),T=[],live=false,P4=NAMES.slice(0,4);
  rows.innerHTML=P4.map(function(n){return '<li><span class="pn-nm">'+n[1]+'</span><span class="pn-a">RM '+money(calc(n[3]).net)+'</span><span class="pn-b">RM <em>0.00</em></span><span class="pn-ok" aria-hidden="true"><i class="ph-duotone ph-check"></i></span></li>'}).join('');
  var lis=$$('li',rows);
  function clear(){T.forEach(clearTimeout);T=[]}
  function loop(){clear();box.classList.remove('done');stt.textContent='Reconciling';okL.textContent='0 of 4 match';
    lis.forEach(function(l,i){var e=$('.pn-b em',l),to=calc(P4[i][3]).net;l.classList.remove('ok');
      if(RM){l.classList.add('ok');e.textContent=money(to);return}
      e._v=0;e.textContent='0.00';
      T.push(setTimeout(function(){tweenNum(e,to,money)},500+i*700));
      T.push(setTimeout(function(){l.classList.add('ok');okL.textContent=(i+1)+' of 4 match'},500+i*700+700))});
    if(RM){box.classList.add('done');stt.textContent='Matched';okL.textContent='4 of 4 match';return}
    T.push(setTimeout(function(){box.classList.add('done');stt.textContent='Matched'},500+4*700+500));
    T.push(setTimeout(function(){if(live)loop()},500+4*700+4400))}
  onScreen(box,function(v){live=v;if(v)loop();else clear()});
})();

/* ================= pricing: a team size slider lights the visitor's own tier and totals the month ================= */
(function(){var grid=$('#pzGrid');if(!grid)return;var rng=$('#pzR'),cards=$$('.pz-c',grid),pplL=$('#pzPpl'),sum=$('#pzSum'),sumW=$('#pzSumW'),n=clamp(+PX.get('headcount')||25,1,5000);
  function ppl(k){return int(k)+(k===1?' person':' people')}
  var ctl=$('#pzCtl'),bub=$('#pzBub');
  function render(){var v=Math.min(n,120),over=n>100;rng.value=v;ctl.style.setProperty('--p',((v-1)/119*100).toFixed(2)+'%');ctl.style.setProperty('--pf',((v-1)/119).toFixed(4));bub.textContent=over?'100+':int(n);
    pplL.textContent=over?'Over 100 people':ppl(n);sumW.classList.toggle('q',over);
    cards.forEach(function(c){var a=+c.getAttribute('data-min'),b=+c.getAttribute('data-max'),r=+c.getAttribute('data-rate'),on=n>=a&&n<=b;c.classList.toggle('on',on);$('[data-tag]',c).hidden=!on;
      $('[data-tot]',c).textContent=!r?'Tell us your headcount and we price it for you.':(on?ppl(n)+': RM '+int(n*r)+' a month':'For example, '+ppl(b)+': RM '+int(b*r)+' a month');
      if(on){if(r)tweenNum(sum,n*r,int);else{sum._v=null;sum.textContent='Quoted for you'}}})}
  function set(v,src){n=clamp(isNaN(v)?n:Math.round(v),1,5000);PX.set('headcount',n,src||'pricing');render()}
  sum._v=n*48;
  rng.addEventListener('input',function(){var v=+rng.value;set(v>100?Math.max(n>100?n:101,101):v)});
  cards.forEach(function(c){c.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('a'))return;var a=+c.getAttribute('data-min'),b=+c.getAttribute('data-max');if(n<a||n>b)set(+c.getAttribute('data-mid'))})});
  W.addEventListener('px:change',function(e){var d=e.detail||{};if(d.key==='headcount'&&d.src!=='pricing'){n=clamp(+d.value||n,1,5000);render()}});
  $$('[data-pz-cta]').forEach(function(a){a.addEventListener('click',function(){PX.set('need','Payroll','pricing');PX.set('entry','pricing','pricing');var m=$('#fMsg');if(m){m.value='Team size: '+(n>100?'over 100 people':ppl(n))+'. Please send me a quote for payroll outsourcing with the HR app.';m.dispatchEvent(new Event('input'))}W.pxTrack&&W.pxTrack('pricing_cta',{headcount:n})})});
  render();
})();

/* refresh triggers once fonts and images settle */
if(GS){W.addEventListener('load',function(){W.ScrollTrigger.refresh()});if(D.fonts&&D.fonts.ready)D.fonts.ready.then(function(){W.ScrollTrigger.refresh()})}
})();
