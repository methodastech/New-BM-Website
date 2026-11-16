/* PeopleX Web Prototype 1: industries tabs, canvas film and the payslip game ("find the 3 mistakes").
   Brand Method, 13 Nov 2026. Plain ES5, one IIFE, no libraries, no network calls. Every class is prefixed pxg-.
   Uses window.PX, __pxEngine, pxTrack, __pxScrollTo, PXApp and PXCheck when the page has them, and works without each.
   Every statutory figure comes from the payslip engine at run time; the only typed amounts are the payslip's own inputs
   (basic pay, an allowance, a claim, hours) and the rule each mistake breaks. */
(function(){
'use strict';
var D=document,W=window,H=D.documentElement;
var INDS=['retail','manufacturing','services'];
var ALT={retail:'Shop owner at the counter of a retail store',manufacturing:'Factory worker smiling on the production floor',services:'Cafe owner talking with a colleague at the counter'};
/* where the 16 by 9 phone crop sits on the 4 by 5 film, top to bottom (0 to 1): keeps the faces in frame */
var FOCAL={retail:.5,manufacturing:.12,services:.14};
var GROUP={earn:'Earnings',ded:'Deductions',er:'Paid by the employer'};
var MONTH='October 2026';
var HOW={play:'Tap every line you think is wrong. Then check.',reveal:'Your answers, line by line.',fixed:'The same payslip, as PeopleX would run it.'};
var END={all:'Every mistake found. You still have a business to run.',some:'The ones you missed would still reach KWSP, PERKESO or LHDN.',none:'These are common, and each one is a fine or an unhappy employee.'};
var SUM_OK='The sum is right for the lines shown. It changes once the lines above are fixed.';

function $(s,c){return (c||D).querySelector(s)}
function $$(s,c){return [].slice.call((c||D).querySelectorAll(s))}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function calm(){return H.classList.contains('still')||!!(W.matchMedia&&W.matchMedia('(prefers-reduced-motion: reduce)').matches)}
function track(n,d){if(typeof W.pxTrack==='function'){try{W.pxTrack(n,d)}catch(e){}}}

/* ---------- money: every sum is done in whole sen ---------- */
function sen(x){return Math.round(x*100)}
function fmt(s){var n=Math.abs(Math.round(s)),c=n%100;return (s<0?'-':'')+String(Math.floor(n/100)).replace(/\B(?=(\d{3})+(?!\d))/g,',')+'.'+(c<10?'0':'')+c}
function rm(s){return 'RM'+fmt(s)}

/* ---------- the engine: the page's own, or the same formulas when this file runs without site.js ---------- */
var FB=null;
function fallbackEngine(){
  function epf(w,er){var b=w<=5000?Math.ceil(w/20)*20:(w<=20000?Math.ceil(w/100)*100:w);var r=er?(w<=5000?.13:.12):.11;return Math.ceil(b*r-1e-9)}
  function mid(w){return Math.min(Math.ceil(w/100)*100,6000)-50}
  function r05(x){return Math.ceil(x*20-1e-6)/20}
  function socso(w,er){return r05(mid(w)*(er?.0175:.005))}
  function eis(w){return r05(mid(w)*.002)}
  var BR=[[5000,0],[20000,.01],[35000,.03],[50000,.06],[70000,.11],[100000,.19],[400000,.25],[600000,.26],[2000000,.28],[1e15,.30]];
  function tax(c){var t=0,lo=0;for(var i=0;i<BR.length;i++){var hi=BR[i][0];if(c>lo)t+=(Math.min(c,hi)-lo)*BR[i][1];lo=hi}return t}
  function pcb(w){var ch=Math.max(0,w*12-9000-Math.min(epf(w,false)*12,4000));var t=tax(ch);if(ch<=35000)t=Math.max(0,t-400);var m=Math.round(t/12*20)/20;return m<10?0:m}
  function calc(w){var e=epf(w,false),s=socso(w,false),i=eis(w),p=pcb(w);return{g:w,epf:e,soc:s,eis:i,pcb:p,net:w-e-s-i-p,epfR:epf(w,true),socR:socso(w,true),eisR:eis(w),erRate:w<=5000?13:12}}
  return {epf:epf,socso:socso,eis:eis,pcb:pcb,calc:calc};
}
function engine(){var e=W.__pxEngine;if(e&&e.epf&&e.socso&&e.eis&&e.pcb)return e;return FB||(FB=fallbackEngine())}

/* ---------- the 3 rounds. a = the amount on the payslip made by hand, f = the amount PeopleX would produce, both in sen.
   kind: m = mistake, d = decoy (correct, looks odd), ok = correct. ---------- */
function buildRound(ind){
  var E=engine(),R={ind:ind,lines:[]},w,e,s,i,p;
  function add(k,g,t,d,a,f,kind,why,fd){R.lines.push({k:k,g:g,t:t,d:d,fd:fd||d,a:a,f:f,kind:kind,why:why})}
  if(ind==='manufacturing'){
    w=2000;var hr=w/26/8,night=sen(150);
    var o1=sen(10*hr*1),o1f=sen(10*hr*1.5),o2=sen(4*hr*1.5),o2f=sen(4*hr*3),ef=sen(w*.02);
    R.name='Rahim';R.role='Machine operator, foreign worker';
    add('basic','earn','Basic pay','Full time, monthly',sen(w),sen(w),'ok','It matches his contract and is above the RM1,700 minimum wage.');
    add('night','earn','Night shift allowance','Fixed monthly allowance',night,night,'d','Allowances are set by the company. This one matches his contract.');
    add('ot1','earn','Overtime, working days','10 hours at 1.0 times the hourly rate',o1,o1f,'m','Overtime on a normal working day is at least 1.5 times the hourly rate. It should be '+rm(o1f)+'.','10 hours at 1.5 times the hourly rate');
    add('ot2','earn','Overtime, public holiday','4 hours at 1.5 times the hourly rate',o2,o2f,'m','Overtime on a public holiday is at least 3 times the hourly rate. It should be '+rm(o2f)+'.','4 hours at 3 times the hourly rate');
    add('epf','ded','EPF employee','Foreign worker, none deducted',0,ef,'m','Since October 2025 wages, foreign workers and their employers each pay 2% EPF. It should be '+rm(ef)+'.','2% of basic pay');
    add('net','net','Net pay','After deductions',sen(w)+night+o1+o2,sen(w)+night+o1f+o2f-ef,'ok',SUM_OK);
  }else if(ind==='services'){
    w=6800;var claim=sen(186),base=Math.ceil(w/100)*100-50;
    e=sen(E.epf(w,false));s=sen(E.socso(w,false));i=sen(E.eis(w));p=sen(E.pcb(w));
    var sw=sen(base*.005),iw=sen(base*.002);
    R.name='Mei Ling';R.role='Account manager';
    add('basic','earn','Basic pay','Full time, monthly',sen(w),sen(w),'ok','It matches her contract.');
    add('mileage','earn','Mileage claim','Approved claim, paid with salary',claim,claim,'d','Approved claims are paid with salary.');
    add('epf','ded','EPF employee','11% of wages',e,e,'ok','11% of RM6,800. EPF has no wage ceiling.');
    add('socso','ded','SOCSO employee','0.5% of '+rm(sen(base)).replace('.00',''),sw,s,'m','SOCSO stops at the RM6,000 wage ceiling. It should be '+rm(s)+'.','0.5%, up to the RM6,000 ceiling');
    add('eis','ded','EIS employee','0.2% of '+rm(sen(base)).replace('.00',''),iw,i,'m','EIS also stops at the RM6,000 ceiling. It should be '+rm(i)+'.','0.2%, up to the RM6,000 ceiling');
    add('pcb','ded','PCB','Monthly tax deduction',0,p,'m','At RM6,800 a month PCB applies. Our estimate is '+rm(p)+'.');
    add('net','net','Net pay','After deductions',sen(w)+claim-e-sw-iw,sen(w)+claim-e-s-i-p,'ok',SUM_OK);
  }else{
    w=1650;var fw=1700,band=Math.ceil(w/20)*20;
    e=sen(E.epf(w,false));s=sen(E.socso(w,false));i=sen(E.eis(w));p=sen(E.pcb(w));
    var fe=sen(E.epf(fw,false)),fs=sen(E.socso(fw,false)),fi=sen(E.eis(fw)),fp=sen(E.pcb(fw));
    var netOk=sen(w)-e-s-i-p,erHand=sen(Math.ceil(band*.12-1e-9)),erOk=sen(E.epf(w,true));
    R.ind='retail';R.name='Nur Aina';R.role='Cashier, Outlet 3';
    add('basic','earn','Basic pay','Full time, monthly',sen(w),sen(fw),'m','Below the RM1,700 minimum wage, which applies to every employer since 1 August 2025.');
    add('epf','ded','EPF employee','11% of wages',e,fe,'ok','11% of the wage band, rounded up to the next ringgit.');
    add('socso','ded','SOCSO employee','0.5% of wages',s,fs,'d','Correct for this wage band.');
    add('eis','ded','EIS employee','0.2% of wages',i,fi,'ok','It matches the EIS table for this wage.');
    add('pcb','ded','PCB','Monthly tax deduction',p,fp,'ok',p===0?'No PCB is due at this wage.':'It matches our PCB estimate for this wage.');
    add('net','net','Net pay','After deductions',netOk-sen(50),sen(fw)-fe-fs-fi-fp,'m','The lines do not add up. Net pay should be '+rm(netOk)+'.');
    add('erepf','er','Employer EPF','12% of wages',erHand,sen(E.epf(fw,true)),'m','Employer EPF is 13% for wages of RM5,000 and below. It should be '+rm(erOk)+'.','13% of wages');
  }
  return R;
}

/* ---------- state ---------- */
var root=null,el={},S={ind:'retail',round:null,flags:{},phase:'play',found:0,capped:false,busy:0};
var film={v:null,ctx:null,vis:false,loop:false,last:-1,ind:''};

function nextInd(ind){return INDS[(INDS.indexOf(ind)+1)%INDS.length]}
function flagCount(){var n=0,k;for(k in S.flags)if(S.flags[k])n++;return n}
function lineBy(k){var L=S.round.lines,i;for(i=0;i<L.length;i++)if(L[i].k===k)return L[i];return null}

/* ---------- the sheet ---------- */
function mark(cls,icon){return icon?'<i class="pxg-mk '+cls+' ph-duotone ph-'+icon+'" aria-hidden="true"></i>':'<span class="pxg-mk" aria-hidden="true"></span>'}
function sheetHTML(mode){
  var R=S.round,fixed=mode==='fixed',h='',g='',first=true,n=0;
  h+='<div class="pxg-sh-hd"><b class="pxg-nm">'+esc(R.name)+'</b><b class="pxg-mo">Payslip for '+MONTH+'</b><span class="pxg-role">'+esc(R.role)+'</span>'+
    '<span class="pxg-tag'+(fixed?' pxg-tag-y':'')+'">'+(fixed?'Corrected by PeopleX':'Made by hand')+'</span></div><ul class="pxg-lines">';
  R.lines.forEach(function(l,idx){
    var on=!!S.flags[l.k],cls='pxg-li'+(idx%2?' pxg-z':'')+(l.g==='net'?' pxg-net':''),mk,why='',am=fmt(fixed?l.f:l.a),tx;
    if(l.g!==g&&GROUP[l.g]){h+='<li class="pxg-grp"><span>'+GROUP[l.g]+'</span>'+(first?'<span>RM</span>':'')+'</li>';first=false}
    g=l.g;
    tx='<span class="pxg-lt"><b>'+esc(l.t)+'</b><span>'+esc(fixed?l.fd:l.d)+'</span></span>';
    if(mode==='play'){
      h+='<li class="'+cls+(on?' pxg-flag':'')+'" data-pxg-k="'+l.k+'"><button type="button" class="pxg-row" data-pxg-line="'+l.k+'" aria-pressed="'+on+'" aria-label="'+esc(l.t+', '+l.d+', '+rm(l.a))+'">'+
        mark('','flag')+tx+'<span class="pxg-am">'+am+'</span></button></li>';
      return;
    }
    if(fixed){
      if(l.kind==='m'){cls+=' pxg-fixed';mk=mark('pxg-mk-y','check-circle');am+='<span>Was '+fmt(l.a)+'</span>'}else mk=mark('','');
    }else if(l.kind==='m'&&on){cls+=' pxg-found pxg-has';mk=mark('pxg-mk-y','check-circle');why='<span class="pxg-sr">Mistake found. </span>'+esc(l.why)}
    else if(l.kind==='m'){cls+=' pxg-missed pxg-has';mk=mark('pxg-mk-r','x-circle');why='<span class="pxg-sr">Mistake missed. </span>'+esc(l.why)}
    else if(on){cls+=' pxg-wrong pxg-has';mk=mark('','flag');why='<b>This one is correct.</b> '+esc(l.why)}
    else mk=mark('','');
    h+='<li class="'+cls+'" data-pxg-k="'+l.k+'"><div class="pxg-row">'+mk+tx+'<span class="pxg-am">'+am+'</span></div>'+(why?'<p class="pxg-why" style="--pxg-i:'+(n++)+'">'+why+'</p>':'')+'</li>';
  });
  return h+'</ul>';
}

function setStatus(){
  var n=flagCount(),st=el.status;
  st.classList.toggle('pxg-end',S.phase!=='play');
  el.foot.classList.toggle('pxg-stack',S.phase!=='play');
  if(S.phase==='play')st.innerHTML='<b>'+n+' of 3 flagged</b>'+(S.capped?'<span>Tap a flagged line to change your pick.</span>':'');
  else st.innerHTML='<b>You found '+S.found+' of 3.</b><span>'+(S.found===3?END.all:S.found===0?END.none:END.some)+'</span>';
  el.check.hidden=S.phase!=='play';el.check.disabled=n<1;
  el.fix.hidden=S.phase!=='reveal';
  el.cta.hidden=el.next.hidden=S.phase!=='fixed';
  el.how.textContent=HOW[S.phase];
}

/* paint the sheet for the current state. With fade: out, swap, back in (opacity only); at once when motion is off */
function paint(fade){
  var b=el.body,id=++S.busy;
  if(!fade||calm()||!b.innerHTML){b.classList.remove('pxg-out');b.innerHTML=sheetHTML(S.phase);return}
  b.classList.add('pxg-out');
  setTimeout(function(){if(id!==S.busy)return;b.innerHTML=sheetHTML(S.phase);void b.offsetWidth;b.classList.remove('pxg-out')},210);
}

function headerH(){var a=$('.bmws'),n=$('#nav'),h=0;if(a&&!H.classList.contains('lx-inshell'))h+=a.offsetHeight;if(n)h+=n.offsetHeight;return h}
function scrollToEl(t){if(typeof W.__pxScrollTo==='function'){W.__pxScrollTo(t);return}
  var y=t.getBoundingClientRect().top+(W.pageYOffset||H.scrollTop)-headerH();try{W.scrollTo({top:Math.max(0,y),behavior:calm()?'auto':'smooth'})}catch(e){W.scrollTo(0,Math.max(0,y))}}
/* bring the top of the game under the header when it has slipped above it. A short wait lets a scroll that is
   still in flight reach the page's smooth scroller first, or it would drop this one. */
function settle(){setTimeout(function(){if(el.anchor.getBoundingClientRect().top<headerH()-4)scrollToEl(el.anchor)},40)}
function focusQuiet(b){if(!b)return;try{b.focus({preventScroll:true})}catch(e){b.focus()}}

function newRound(fade){
  S.round=buildRound(S.ind);S.flags={};S.phase='play';S.found=0;S.capped=false;
  el.name.textContent=S.round.name;
  el.cta.setAttribute('data-check-industry',S.ind);
  el.next.querySelector('span').textContent='Try the '+nextInd(S.ind)+' payslip';
  setStatus();paint(fade);
}

function toggle(btn){
  var k=btn.getAttribute('data-pxg-line');
  if(S.phase!=='play'||!lineBy(k)||el.body.classList.contains('pxg-out'))return;
  var on=!S.flags[k];
  if(on&&flagCount()>=3){S.capped=true;setStatus();el.status.classList.remove('pxg-nudge');void el.status.offsetWidth;el.status.classList.add('pxg-nudge');return}
  S.flags[k]=on;S.capped=false;
  btn.setAttribute('aria-pressed',String(on));btn.parentNode.classList.toggle('pxg-flag',on);
  setStatus();
}

function check(){
  if(S.phase!=='play'||flagCount()<1)return;
  var n=0;S.round.lines.forEach(function(l){if(l.kind==='m'&&S.flags[l.k])n++});
  S.found=n;S.phase='reveal';
  setStatus();paint(false);
  track('game_round_end',{industry:S.ind,found:n});
  focusQuiet(el.fix);settle();
}

function fix(){
  if(S.phase!=='reveal')return;
  S.phase='fixed';
  setStatus();paint(true);
  focusQuiet(el.cta);settle();
}

/* ---------- the film: a detached video drawn to the canvas, so the page never holds a second visible video ---------- */
function filmFit(){var c=el.cv,r=c.getBoundingClientRect(),d=Math.min(W.devicePixelRatio||1,2),w=Math.round(r.width*d),h=Math.round(r.height*d);if(w&&h&&(c.width!==w||c.height!==h)){c.width=w;c.height=h;film.last=-1}}
function filmDraw(){
  var v=film.v;if(!film.vis||!v){film.loop=false;return}
  if(v.readyState>=2&&v.videoWidth&&v.currentTime!==film.last){
    film.last=v.currentTime;
    var c=el.cv,cw=c.width,ch=c.height,sc=Math.max(cw/v.videoWidth,ch/v.videoHeight),dw=v.videoWidth*sc,dh=v.videoHeight*sc;
    film.ctx.drawImage(v,(cw-dw)/2,(ch-dh)*FOCAL[film.ind],dw,dh);
    if(!c.classList.contains('pxg-on'))c.classList.add('pxg-on');
  }
  W.requestAnimationFrame(filmDraw);
}
function filmPlay(){
  if(calm()||!el.cv||!el.cv.getContext)return;
  if(!film.v){var v=D.createElement('video');v.muted=true;v.setAttribute('muted','');v.loop=true;v.playsInline=true;v.setAttribute('playsinline','');v.preload='auto';film.v=v;film.ctx=el.cv.getContext('2d')}
  if(film.ind!==S.ind){film.ind=S.ind;film.last=-1;film.v.src='assets/video/ind/'+S.ind+'.mp4'}
  filmFit();
  var p=film.v.play();if(p&&p.catch)p.catch(function(){});
  if(!film.loop){film.loop=true;W.requestAnimationFrame(filmDraw)}
}
function filmSet(){
  var tb=el.tabs[INDS.indexOf(S.ind)];if(tb&&el.film.parentNode!==tb){tb.insertBefore(el.film,tb.firstChild.nextSibling);film.last=-1}
  el.poster.setAttribute('src','assets/video/ind/'+S.ind+'.jpg');el.poster.setAttribute('alt',ALT[S.ind]);
  el.film.style.setProperty('--pxg-fy',Math.round(FOCAL[S.ind]*100)+'%');
  el.cv.classList.remove('pxg-on');
  if(film.vis)filmPlay();
}

/* ---------- tabs ---------- */
function pick(ind,write,quiet){
  if(INDS.indexOf(ind)<0)return;
  if(ind===S.ind&&S.round)return;
  S.ind=ind;root.setAttribute('data-pxg-ind',ind);
  el.tabs.forEach(function(t){var on=t.getAttribute('data-pxg-ind')===ind;t.setAttribute('aria-selected',String(on));t.tabIndex=on?0:-1;if(on)el.panel.setAttribute('aria-labelledby',t.id)});
  el.feats.forEach(function(u){u.hidden=u.getAttribute('data-pxg-for')!==ind});
  filmSet();
  newRound(!quiet);
  if(write&&W.PX&&typeof W.PX.set==='function'){try{W.PX.set('industry',ind,'game')}catch(e){}}
}

/* ---------- the app explorer and the payroll check, both built elsewhere ---------- */
function hasApp(){var ok=!!(W.PXApp&&typeof W.PXApp.open==='function');if(root)root.classList.toggle('pxg-app',ok);return ok}
/* the page may already open the explorer for any [data-app-open] (it calls preventDefault when it does).
   Wait for the click to finish, then open it here only if nobody did: 1 call either way. */
function openApp(e,key){setTimeout(function(){if(!e.defaultPrevented&&hasApp()){try{W.PXApp.open(key)}catch(x){}}},0)}
/* PXCheck owns every [data-check-start] click. Without it: keep the answer and go to the check section, or the contact form */
function startCheck(){
  if(W.PXCheck)return;
  if(W.PX&&typeof W.PX.set==='function'){try{W.PX.set('industry',S.ind,'game');W.PX.set('entry','game','game')}catch(e){}}
  var c=D.getElementById('check')||D.getElementById('contact');if(c)scrollToEl(c);
}

function onClick(e){
  var b=e.target&&e.target.closest?e.target.closest('button'):null;if(!b||!root.contains(b))return;
  if(b.classList.contains('pxg-tab'))pick(b.getAttribute('data-pxg-ind'),true);
  else if(b.classList.contains('pxg-row'))toggle(b);
  else if(b.classList.contains('pxg-feat'))openApp(e,b.getAttribute('data-app-open'));
  else if(b===el.check)check();
  else if(b===el.fix)fix();
  else if(b===el.cta)startCheck();
  else if(b===el.next){pick(nextInd(S.ind),true);settle();focusQuiet(el.tabs[INDS.indexOf(S.ind)])}
}
function onKey(e){
  if(!e.target||!e.target.matches)return;
  var k=e.key,i,list;
  if(e.target.matches('.pxg-tab')){
    i=el.tabs.indexOf(e.target);
    if(k==='ArrowRight'||k==='ArrowDown')i=(i+1)%el.tabs.length;
    else if(k==='ArrowLeft'||k==='ArrowUp')i=(i+el.tabs.length-1)%el.tabs.length;
    else if(k==='Home')i=0;else if(k==='End')i=el.tabs.length-1;else return;
    e.preventDefault();pick(el.tabs[i].getAttribute('data-pxg-ind'),true);el.tabs[i].focus();
  }else if(e.target.matches('button.pxg-row')){
    if(k!=='ArrowDown'&&k!=='ArrowUp')return;
    list=$$('button.pxg-row',el.body);i=list.indexOf(e.target)+(k==='ArrowDown'?1:-1);
    if(list[i]){e.preventDefault();list[i].focus()}
  }
}

function init(){
  var r=D.getElementById('industries');
  if(!r||!r.classList.contains('pxg')||r.getAttribute('data-pxg-ready'))return false;
  root=r;root.setAttribute('data-pxg-ready','1');
  el={tabs:$$('.pxg-tab',r),panel:$('#pxg-panel',r),feats:$$('.pxg-feats',r),film:$('.pxg-film',r),poster:$('.pxg-poster',r),cv:$('.pxg-cv',r),
    anchor:$('#pxg-anchor',r),name:$('#pxg-name',r),how:$('#pxg-how',r),body:$('#pxg-body',r),foot:$('.pxg-foot',r),status:$('#pxg-status',r),
    check:$('#pxg-check',r),fix:$('#pxg-fix',r),cta:$('#pxg-cta',r),next:$('#pxg-next',r)};
  S.round=null;film.ind='';
  var start='retail';
  try{if(W.PX&&INDS.indexOf(W.PX.get('industry'))>-1)start=W.PX.get('industry')}catch(e){}
  S.ind=start;pick(start,false,true);
  INDS.forEach(function(n){if(n!==start){var im=new Image();im.src='assets/video/ind/'+n+'.jpg'}});

  r.addEventListener('click',onClick);
  r.addEventListener('keydown',onKey);
  r.addEventListener('pointerover',hasApp,{passive:true});
  r.addEventListener('focusin',hasApp);
  hasApp();if(D.readyState!=='complete')W.addEventListener('load',hasApp);

  /* the film runs only while its tile is on screen */
  if('IntersectionObserver' in W){
    new IntersectionObserver(function(es){film.vis=es[0].isIntersecting;if(film.vis)filmPlay();else if(film.v)film.v.pause()},{threshold:.05}).observe(el.film);
    /* reveal: the page's own observer ran at load; this one covers a section added later */
    if(H.classList.contains('io')){
      var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}})},{rootMargin:'0px 0px -8% 0px',threshold:.01});
      $$('.rv',r).forEach(function(n){if(!n.classList.contains('in'))io.observe(n)});
    }
  }else{film.vis=true;filmPlay()}
  W.addEventListener('resize',function(){if(film.v)filmFit()},{passive:true});
  r.addEventListener('transitionend',function(e){if(e.propertyName==='flex-grow'&&film.v){film.last=-1;filmFit()}});
  return true;
}

/* another part of the page set the industry: follow it */
W.addEventListener('px:change',function(e){
  var d=e&&e.detail;if(!root||!d||d.key!=='industry'||d.src==='game')return;
  if(INDS.indexOf(d.value)>-1&&d.value!==S.ind)pick(d.value,false);
});

W.PXGame={
  init:init,
  open:function(ind){if(root)pick(ind,true)},
  round:function(ind){return buildRound(INDS.indexOf(ind)>-1?ind:S.ind)},
  state:function(){var f=[],k;for(k in S.flags)if(S.flags[k])f.push(k);return {industry:S.ind,phase:S.phase,flagged:f,found:S.found,film:!!film.v,filmOn:film.vis}}
};

if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',init);else init();
})();
