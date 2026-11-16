/* PeopleX Payroll Health Check (the page's lead generator), Brand Method, 13 Nov 2026.
   Markup: web/fragments/check.html (section #check). Styles: assets/check.css. Prefix pxc-.
   Plain ES5, one IIFE, no libraries, no network calls. Works without window.PX, pxTrack, __pxScrollTo and with storage blocked.
   Public: window.PXCheck = { start(opts), reset(), ics(), state(), init(), alive() }. Any [data-check-start] element starts it. */
(function(){
'use strict';
var W=window,D=document,H=D.documentElement;
if(W.PXCheck&&W.PXCheck.alive&&W.PXCheck.alive())return; /* a live copy already runs on this page */

var KEY='px-check',WA='https://wa.me/60105166680';
var MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
var IND={retail:'retail',manufacturing:'manufacturing',services:'services',other:'other industry'};

/* 100 points across questions 3 to 7. Questions 1, 2 and 8 are not scored. */
var QS=[
  {id:'q1',t:'How many people are on your payroll?',type:'num'},
  {id:'q2',t:'What does your team do?',type:'tiles',o:[['Retail','retail','retail'],['Manufacturing','manufacturing','manufacturing'],['Services','services','services'],['Something else','other','team']]},
  {id:'q3',t:'Who runs payroll today?',max:15,o:[['An accountant or payroll provider',15],['Payroll software we run ourselves',10],['Admin staff on Excel',5],['I do it myself',0]]},
  {id:'q4',t:'EPF, SOCSO, EIS and PCB in the last 12 months?',max:30,o:[['Always paid by the 15th',30],['Late once or twice',10],['We paid a late charge',0],['Not sure',10]]},
  {id:'q5',t:'How do staff clock in and log overtime?',max:20,o:[['An app with GPS or face check',20],['A fingerprint device',12],['WhatsApp or Excel',5],['Paper or punch card',0]]},
  {id:'q6',t:'How are leave and claims handled?',max:15,o:[['In an app',15],['Email and Excel',6],['Paper or WhatsApp',0]]},
  {id:'q7',t:'Hours a month on payroll and HR admin?',max:20,o:[['Under 5',20],['5 to 15',13],['15 to 30',6],['Over 30',0]]},
  {id:'q8',t:'Hiring outside Malaysia in the next 12 months?',o:[['Yes'],['Maybe'],['No']]}
];
var BYID={};QS.forEach(function(q){BYID[q.id]=q});
var SCORED=['q3','q4','q5','q6','q7'];
var BANDS={good:'In good shape',some:'Some risk',risk:'At risk'};
var REC={
  eor:{ic:'eor',name:'Employer of Record',line:'Hire outside Malaysia without setting up a local entity.'},
  hrtech:{ic:'hr-app',name:'HR Tech and Workforce Management',line:'Your filings are in order. Give your people the app.'},
  payroll:{ic:'payroll',name:'Payroll Managed Services',line:'We run payroll and filings every month. The HR app is included free.'}
};
var TIP_OK='Good. That is the rule.',TIP_NO='That one is common. It is on your report.';

/* ---------- helpers ---------- */
function rm(){return H.classList.contains('still')||!!(W.matchMedia&&W.matchMedia('(prefers-reduced-motion: reduce)').matches)}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function fmt(n){return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,',')}
function $(s,c){return (c||D).querySelector(s)}
function $$(s,c){return [].slice.call((c||D).querySelectorAll(s))}
function el(tag,cls,txt){var n=D.createElement(tag);if(cls)n.className=cls;if(txt!=null)n.textContent=txt;return n}
function part(name){return root?root.querySelector('[data-pxc="'+name+'"]'):null}
function pxGet(k){try{return W.PX&&W.PX.get?W.PX.get(k):undefined}catch(e){return undefined}}
function pxSet(k,v){try{if(W.PX&&W.PX.set)W.PX.set(k,v,'check')}catch(e){}}
function track(n,d){try{if(typeof W.pxTrack==='function')W.pxTrack(n,d||{})}catch(e){}}
function focusEl(n){if(!n)return;try{n.focus({preventScroll:true})}catch(e){try{n.focus()}catch(x){}}}
function headerH(){var b=$('.bmws'),n=D.getElementById('nav'),h=0;if(b&&!H.classList.contains('lx-inshell'))h+=b.offsetHeight;if(n)h+=n.offsetHeight;return h}
function scrollToEl(n){if(!n)return;
  if(typeof W.__pxScrollTo==='function'){try{W.__pxScrollTo(n);return}catch(e){}}
  var y=Math.max(0,n.getBoundingClientRect().top+(W.pageYOffset||H.scrollTop||0)-headerH());
  try{W.scrollTo({top:y,behavior:rm()?'auto':'smooth'})}catch(e){W.scrollTo(0,y)}}
function icon(name){var i=D.createElement('img');i.className='ic3';i.src=icBase+name+'.png';i.alt='';i.width=256;i.height=256;return i}
function glyph(name,cls){var i=el('i','ph-duotone ph-'+name+(cls?' '+cls:''));i.setAttribute('aria-hidden','true');return i}

/* ---------- state ---------- */
var root=null,R={},icBase='assets/img/ic3d/';
var S={v:'intro',step:0,a:{},skip2:false};
var hc=25,preInd=null,busy=false,tipT=0,advT=0,numT=0,icsT=0,hcSync=null;

function load(){
  try{var o=JSON.parse(W.sessionStorage.getItem(KEY)||'null');if(!o||typeof o!=='object')return;
    var a=o.a||{};
    QS.forEach(function(q){var v=a[q.id];
      if(q.type==='num'){if(typeof v==='number'&&v>=1&&v<=5000)S.a.q1=Math.round(v)}
      else if(q.type==='tiles'){if(typeof v==='string'&&IND[v])S.a.q2=v}
      else if(typeof v==='number'&&v===Math.floor(v)&&v>=0&&v<q.o.length)S.a[q.id]=v});
    S.skip2=!!o.skip2&&!!S.a.q2;
    if(o.v==='flow'||o.v==='result')S.v=o.v;
    S.step=clamp(parseInt(o.step,10)||0,0,QS.length-1);
  }catch(e){}
}
function save(){try{W.sessionStorage.setItem(KEY,JSON.stringify({v:S.v,step:S.step,a:S.a,skip2:S.skip2}))}catch(e){}}
function answered(i){return S.a[QS[i].id]!=null}
function firstOpen(){for(var i=0;i<QS.length;i++){if(i===1&&S.skip2&&S.a.q2)continue;if(!answered(i))return i}return -1}
function nextStep(){var i=S.step+1;if(i===1&&S.skip2&&S.a.q2)i=2;return i>=QS.length?-1:i}
function prevStep(){var i=S.step-1;if(i===1&&S.skip2&&S.a.q2)i=0;return i}
function pts(id){var v=S.a[id];return v==null?0:BYID[id].o[v][1]}
function tally(){var got=0,of=0;SCORED.forEach(function(id){if(S.a[id]!=null){got+=pts(id);of+=BYID[id].max}});return{got:got,of:of,pct:of?Math.round(got/of*100):0}}

/* the score, the 3 areas, the questions that lost the most points, the service that fits */
function result(){
  var score=0,lost=[];
  SCORED.forEach(function(id,i){var p=pts(id),m=BYID[id].max;score+=p;if(m-p>0)lost.push({id:id,lost:m-p,max:m,i:i})});
  lost.sort(function(a,b){return b.lost-a.lost||b.max-a.max||a.i-b.i});
  var q8=S.a.q8;
  return{score:score,band:score>=80?'good':score>=50?'some':'risk',
    areas:{filing:Math.round((pts('q3')+pts('q4'))/45*100),records:Math.round((pts('q5')+pts('q6'))/35*100),time:Math.round(pts('q7')/20*100)},
    fixes:lost.slice(0,3).map(function(l){return l.id}),
    rec:(q8===0||q8===1)?'eor':(S.a.q3===0&&S.a.q4===0)?'hrtech':'payroll'};
}
/* the band line counts the fix rows that are really shown, so the number never disagrees with the list */
function bandLine(r){var n=r.fixes.length,th=n===1?' thing':' things';
  if(r.band==='good')return 'In good shape.'+(n?' '+n+th+' worth a look.':'');
  if(r.band==='some')return 'Some risk. '+n+th+' to fix before next payday.';
  return 'At risk. Fix these '+n+' before the 15th.'}
function fixFor(id){
  var ind=S.a.q2||'other',v;
  if(id==='q4')return{ic:'filing',rule:'EPF, SOCSO, EIS and PCB are due by the 15th of the next month. Late payment brings charges and interest.',fix:'We pay and file every month, before the 15th.'};
  if(id==='q3')return{ic:'team',rule:'When payroll lives with 1 person or 1 spreadsheet, payday stops when they are away.',fix:'A PeopleX team runs it for you every month.'};
  if(id==='q5'){
    if(ind==='manufacturing')return{ic:'overtime',rule:'Overtime is at least 1.5 times the hourly rate on a normal working day.',fix:'Overtime comes straight from clock in records.'};
    if(ind==='retail')return{ic:'kiosk',rule:'Paper and WhatsApp clock ins cannot prove who was at which outlet.',fix:'GPS and face check in at every outlet.'};
    return{ic:'attendance',rule:'Hours on paper are hard to check and easy to dispute.',fix:'Clock in on the phone, with location.'};
  }
  if(id==='q6')return{ic:'ai-scan',rule:'Claims on paper get lost and paid late.',fix:'Snap the receipt, AI fills in the claim, managers approve on the phone.'};
  v=S.a.q7;
  return{ic:'hourglass',rule:(v===3?'Over 30 hours':'About '+(v===2?22:10)+' hours')+' a month go to payroll and HR admin today.',fix:'Hand it over and keep the hours.'};
}
function totalsLine(n){return fmt(n*12)+' payslips, 48 submissions, '+fmt(n)+(n===1?' EA form':' EA forms')+' by end February'}
function waText(r){return 'My payroll check score is '+r.score+'. '+fmt(S.a.q1||hc)+' staff, '+IND[S.a.q2||'other']+'.'}

/* ---------- gauge ---------- */
function needle(holder,pct,jump){
  var g=holder&&holder.querySelector('.pxc-ndl');if(!g)return;
  if(jump){g.style.transition='none';g.style.transform='rotate('+(pct*1.8).toFixed(1)+'deg)';void g.getBoundingClientRect();g.style.transition=''}
  else g.style.transform='rotate('+(pct*1.8).toFixed(1)+'deg)';
  var svg=holder.querySelector('svg');if(svg&&svg.getAttribute('role')==='img')svg.setAttribute('aria-label','Score gauge, '+pct+' out of 100');
}
function tip(msg){
  var t=R.tip;if(!t)return;clearTimeout(tipT);
  t.textContent=msg;t.classList.add('pxc-on');
  tipT=setTimeout(function(){t.classList.remove('pxc-on');tipT=setTimeout(function(){t.textContent=''},320)},1600);
}
function countTo(node,to,animate){
  cancelAnimationFrame(numT);
  if(!animate||rm()||!W.requestAnimationFrame){node.textContent=to;return}
  var t0=0,dur=900;node.textContent='0';
  numT=requestAnimationFrame(function step(t){if(!t0)t0=t;var k=clamp((t-t0)/dur,0,1);k=1-Math.pow(1-k,3);node.textContent=Math.round(to*k);if(k<1)numT=requestAnimationFrame(step)});
}

/* ---------- views ---------- */
function setView(v){
  S.v=v;root.setAttribute('data-pxc-view',v);
  /* once the check is open nothing in the section waits for the page's reveal observer */
  if(v!=='intro')$$('.rv',root).forEach(function(n){n.classList.add('in')});
  var res=v==='result';
  R.intro.hidden=res;R.card.hidden=res;
  R.rest.hidden=v!=='intro';R.flow.hidden=v!=='flow';
  R.score.hidden=!res;R.fix.hidden=!res;R.year.hidden=!res;R.lead.hidden=!res;
}
function totals(){var n=S.a.q1||hc,t=totalsLine(n);if(R.tot)R.tot.textContent=t;if(R.tot2)R.tot2.textContent=t}

function setHc(v,src){
  hc=clamp(Math.round(v),1,5000);
  if(S.a.q1!=null){S.a.q1=hc;save()}
  pxSet('headcount',hc);
  if(hcSync)hcSync(src);
  totals();
}
function numUI(){
  var w=el('div','pxc-hc'),row=el('div','pxc-hcn'),lab=el('label','pxc-sr','Number of people'),inp=D.createElement('input'),unit=el('span',null,'people'),r=D.createElement('input'),sc=el('div','pxc-scale'),yr=el('p','pxc-tot pxc-tot-q');
  lab.htmlFor='pxc-n';
  inp.id='pxc-n';inp.className='pxc-n';inp.type='number';inp.min='1';inp.max='5000';inp.step='1';inp.setAttribute('inputmode','numeric');
  r.type='range';r.className='rng pxc-rng';r.min='1';r.max='300';r.step='1';r.setAttribute('aria-label','Number of people, 1 to 300');
  sc.setAttribute('aria-hidden','true');sc.appendChild(el('span',null,'1'));sc.appendChild(el('span',null,'300 or more'));
  hcSync=function(src){
    if(src!==inp)inp.value=hc;
    if(src!==r)r.value=Math.min(hc,300);
    r.style.setProperty('--p',((Math.min(hc,300)-1)/299*100).toFixed(2)+'%');
    unit.textContent=hc===1?'person':'people';
    yr.textContent=totalsLine(hc);
  };
  r.addEventListener('input',function(){setHc(+r.value,r)});
  inp.addEventListener('input',function(){var v=parseInt(inp.value,10);if(!isNaN(v)&&v>=1)setHc(v,inp)});
  inp.addEventListener('blur',function(){inp.value=hc});
  inp.addEventListener('keydown',function(e){if(e.target&&e.target.matches&&e.target.matches('.pxc-n')&&e.key==='Enter'){e.preventDefault();inp.value=hc;goNext()}});
  row.appendChild(lab);row.appendChild(inp);row.appendChild(unit);
  w.appendChild(row);w.appendChild(r);w.appendChild(sc);w.appendChild(yr);
  hcSync(null);
  return w;
}
function optUI(q){
  var tiles=q.type==='tiles',g=el('div',tiles?'pxc-tiles':'pxc-opts'),cur=S.a[q.id],sel=-1;
  g.setAttribute('role','radiogroup');g.setAttribute('aria-labelledby','pxc-qt');
  if(tiles){var val=cur||preInd;q.o.forEach(function(o,i){if(o[1]===val)sel=i})}else if(cur!=null)sel=cur;
  q.o.forEach(function(o,i){
    var b=el('button',tiles?'pxc-tile':'pxc-opt');
    b.type='button';b.setAttribute('role','radio');b.setAttribute('aria-checked',i===sel?'true':'false');b.setAttribute('data-i',i);
    b.tabIndex=(sel<0?i===0:i===sel)?0:-1;
    if(tiles){b.appendChild(icon(o[2]));b.appendChild(el('span','pxc-tt',o[0]));b.appendChild(glyph('check-circle','pxc-tk'))}
    else{var d=el('span','pxc-dot');d.setAttribute('aria-hidden','true');b.appendChild(d);b.appendChild(el('span','pxc-ot',o[0]))}
    g.appendChild(b)});
  return g;
}
function renderQ(focus){
  var q=QS[S.step],wrap=el('div','pxc-qin'),h=el('h3','pxc-qt',q.t);
  hcSync=null;busy=false;clearTimeout(advT);
  R.segs.forEach(function(s,i){s.className=i<=S.step?'pxc-on':''});
  R.step.textContent='Question '+(S.step+1)+' of '+QS.length;
  h.id='pxc-qt';wrap.appendChild(h);
  wrap.appendChild(q.type==='num'?numUI():optUI(q));
  R.q.textContent='';R.q.appendChild(wrap);
  R.back.hidden=prevStep()<0;
  R.next.hidden=!(q.type==='num'||S.a[q.id]!=null);
  if(focus)focusEl(q.type==='num'?$('.pxc-rng',R.q):$('[role=radio][tabindex="0"]',R.q));
}
function pick(i){
  var q=QS[S.step];if(busy||!q.o||!q.o[i])return;
  busy=true;
  $$('[role=radio]',R.q).forEach(function(b,j){b.setAttribute('aria-checked',j===i?'true':'false');b.tabIndex=j===i?0:-1});
  if(q.type==='tiles'){S.a.q2=q.o[i][1];preInd=S.a.q2;pxSet('industry',S.a.q2)}else S.a[q.id]=i;
  track('hc_answer',{q:S.step+1});
  if(q.max){needle(R.g1,tally().pct,rm());tip(q.o[i][1]===q.max?TIP_OK:TIP_NO)}
  save();
  clearTimeout(advT);advT=setTimeout(function(){busy=false;advance()},250);
}
function advance(){var n=nextStep();if(n<0){finish();return}S.step=n;save();renderQ(true)}
function goNext(){
  if(busy||S.v!=='flow')return;
  var q=QS[S.step];
  if(q.type==='num'){S.a.q1=hc;pxSet('headcount',hc);track('hc_answer',{q:1});totals()}
  else if(S.a[q.id]==null)return;
  save();advance();
}
function goBack(){if(busy||S.v!=='flow')return;var p=prevStep();if(p<0)return;S.step=p;save();renderQ(true)}

function paintResult(animate){
  var r=result(),bars=$$('.pxc-bar i',R.areas),vals=$$('b',R.areas),av=[r.areas.filing,r.areas.records,r.areas.time];
  setView('result');
  R.band.textContent=bandLine(r);
  countTo(R.num,r.score,animate);
  if(animate&&!rm()){needle(R.g2,0,true);needle(R.g2,r.score)}else needle(R.g2,r.score,true);
  av.forEach(function(p,i){
    vals[i].textContent=p+'%';
    bars[i].style.setProperty('--c',p>=80?'#FBBA00':p>=50?'#FFD25A':'#474B5A');
    if(animate&&!rm()){bars[i].style.transform='scaleX(0)';void bars[i].getBoundingClientRect()}
    bars[i].style.transform='scaleX('+(p/100).toFixed(3)+')'});
  R.rows.textContent='';
  r.fixes.forEach(function(id,i){
    var f=fixFor(id),li=el('li','pxc-row'),box=el('div'),doo=el('p','pxc-do');
    li.style.setProperty('--i',i);li.setAttribute('data-q',id);
    box.appendChild(el('p','pxc-rule',f.rule));doo.appendChild(glyph('check-circle'));doo.appendChild(el('span',null,f.fix));box.appendChild(doo);
    li.appendChild(icon(f.ic));li.appendChild(box);R.rows.appendChild(li)});
  R.rows.hidden=!r.fixes.length;R.fixh.hidden=!r.fixes.length;R.none.hidden=!!r.fixes.length;
  var rc=REC[r.rec],rb=el('div');
  R.rec.textContent='';R.rec.setAttribute('data-rec',r.rec);
  rb.appendChild(el('b',null,rc.name));rb.appendChild(el('p',null,rc.line));
  R.rec.appendChild(icon(rc.ic));R.rec.appendChild(rb);
  totals();
  var href=WA+'?text='+encodeURIComponent(waText(r));
  R.wa.href=href;R.wa2.href=href;
  R.live.textContent='Your score is '+r.score+' out of 100. '+bandLine(r);
  return r;
}
function finish(){
  S.v='result';save();
  var r=paintResult(true);
  pxSet('check',{score:r.score,band:r.band,bandLabel:BANDS[r.band],areas:{filing:r.areas.filing,records:r.areas.records,time:r.areas.time},industry:S.a.q2||'other',headcount:S.a.q1||hc,rec:r.rec,recLabel:REC[r.rec].name});
  track('hc_result',{score:r.score,band:r.band});
  focusEl(R.band);
  scrollToEl(root);
}
function leadReset(){
  R.form.reset();R.form.hidden=false;R.leadl.hidden=false;R.thanks.hidden=true;
  $$('.pxc-fld',R.form).forEach(function(f){f.classList.remove('pxc-bad');var e=$('.pxc-err',f),i=$('input',f);if(e){e.hidden=true;e.textContent=''}if(i)i.removeAttribute('aria-invalid')});
  R.formlive.textContent='';R.icsok.textContent='';
}
function clearAll(){
  clearTimeout(advT);clearTimeout(tipT);cancelAnimationFrame(numT);busy=false;
  S.a={};S.skip2=false;S.step=0;
  if(R.tip){R.tip.textContent='';R.tip.classList.remove('pxc-on')}
  needle(R.g1,0,true);leadReset();
}
/* the section top when the whole card fits under it, the card itself when it does not (phones, short screens) */
function scrollToCheck(){
  var t=root;
  if(S.v==='flow'){
    var a=root.getBoundingClientRect(),c=R.card.getBoundingClientRect(),room=(W.innerHeight||H.clientHeight)-headerH();
    if(c.bottom-a.top>room)t=c.height+16<=room?R.anchor:R.card;
  }
  scrollToEl(t);
}
function preload(){['filing','team','overtime','kiosk','attendance','ai-scan','hourglass','eor','hr-app','payroll','trophy','retail','manufacturing','services'].forEach(function(n){try{(new Image()).src=icBase+n+'.png'}catch(e){}})}

function start(opts){
  opts=opts||{};
  if(!boot())return false;
  if(opts.restart)clearAll();
  var ind=opts.industry;
  if(ind&&IND[ind]){S.a.q2=ind;S.skip2=true;preInd=ind;pxSet('industry',ind)}
  if(opts.entry)pxSet('entry',String(opts.entry));
  track('hc_start',{entry:opts.entry?String(opts.entry):(opts.restart?'again':'check'),industry:S.a.q2||preInd||null});
  preload();
  var i=firstOpen();
  if(i<0){S.v='result';save();paintResult(false);scrollToEl(root);focusEl(R.band);return true}
  S.step=i;setView('flow');save();
  needle(R.g1,tally().pct,true);
  renderQ(true);
  scrollToCheck();
  return true;
}
function reset(){if(!boot())return;clearAll();setView('intro');save();totals()}

/* ---------- the 2027 calendar file ---------- */
function p2(n){return n<10?'0'+n:''+n}
function icsEsc(s){return String(s).replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\r?\n/g,'\\n')}
function icsFold(l){var o='';while(l.length>74){o+=l.slice(0,74)+'\r\n ';l=l.slice(74)}return o+l}
function icsText(){
  var n=new Date(),stamp=n.getUTCFullYear()+p2(n.getUTCMonth()+1)+p2(n.getUTCDate())+'T'+p2(n.getUTCHours())+p2(n.getUTCMinutes())+p2(n.getUTCSeconds())+'Z';
  var L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//PeopleX//Payroll check 2027 filing deadlines//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:PeopleX 2027 filing deadlines'];
  function ev(m,d,uid,sum,desc){
    var a=new Date(Date.UTC(2027,m-1,d)),b=new Date(Date.UTC(2027,m-1,d+1));
    function ymd(x){return x.getUTCFullYear()+p2(x.getUTCMonth()+1)+p2(x.getUTCDate())}
    L.push('BEGIN:VEVENT','UID:'+uid+'@peoplex.ai','DTSTAMP:'+stamp,'DTSTART;VALUE=DATE:'+ymd(a),'DTEND;VALUE=DATE:'+ymd(b),'SUMMARY:'+icsEsc(sum),'DESCRIPTION:'+icsEsc(desc),'TRANSP:TRANSPARENT','END:VEVENT');
  }
  for(var m=1;m<=12;m++){
    var prev=m===1?'December 2026':MONTHS[m-2]+' 2027';
    ev(m,15,'px-check-2027-'+p2(m)+'-15','EPF, SOCSO, EIS and PCB due (for '+prev+')','Monthly statutory payments and filings for '+prev+' wages. From the PeopleX payroll check.');
  }
  ev(2,28,'px-check-2027-02-28-ea','EA forms due to employees','EA forms for 2026 go to every employee by the end of February. From the PeopleX payroll check.');
  L.push('END:VCALENDAR');
  return L.map(icsFold).join('\r\n')+'\r\n';
}
function downloadIcs(){
  var ok=false;
  try{
    var U=W.URL||W.webkitURL,b=new Blob([icsText()],{type:'text/calendar;charset=utf-8'}),u=U.createObjectURL(b),a=D.createElement('a');
    a.href=u;a.download='peoplex-2027-filing-deadlines.ics';a.style.display='none';
    D.body.appendChild(a);a.click();
    setTimeout(function(){if(a.parentNode)a.parentNode.removeChild(a);try{U.revokeObjectURL(u)}catch(e){}},2000);
    ok=true;
  }catch(e){}
  track('hc_ics',{headcount:S.a.q1||hc});
  R.icsok.textContent=ok?'Calendar file saved. Open it to add all 13 dates.':'Your browser blocked the file. Please try again.';
  clearTimeout(icsT);icsT=setTimeout(function(){R.icsok.textContent=''},8000);
}

/* ---------- capture (demo: nothing is sent) ---------- */
function phoneOk(v){var d=v.replace(/\D/g,'');if(/^\s*\+?60/.test(v))d=d.slice(2);return d.length>=9}
function submitLead(e){
  e.preventDefault();
  var f=R.form,bad=null,n=0,rules=[
    ['name',function(v){return v.length>0},'Enter your name.'],
    ['email',function(v){return /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v)},'Enter a valid work email.'],
    ['phone',phoneOk,'Enter a WhatsApp number with 9 or more digits.']];
  rules.forEach(function(r){
    var inp=f.elements[r[0]],box=inp.parentNode,err=$('.pxc-err',box),ok=r[1](String(inp.value||'').trim());
    box.classList.toggle('pxc-bad',!ok);
    if(ok){inp.removeAttribute('aria-invalid');err.hidden=true;err.textContent=''}
    else{inp.setAttribute('aria-invalid','true');err.textContent=r[2];err.hidden=false;n++;if(!bad)bad=inp}});
  if(bad){R.formlive.textContent=n+(n===1?' field needs':' fields need')+' a look.';focusEl(bad);return}
  var first=String(f.elements.name.value).trim().split(/\s+/)[0],r=result();
  track('hc_lead',{score:r.score,band:r.band,rec:r.rec});
  R.thanksh.textContent='Thanks, '+first+'.';
  R.form.hidden=true;R.leadl.hidden=true;R.thanks.hidden=false;
  f.reset();
  focusEl(R.thanksh);
}

/* ---------- boot ---------- */
function boot(){
  if(root&&root.isConnected!==false&&D.documentElement.contains(root))return true;
  var r=D.getElementById('check');
  if(!r||!r.querySelector('[data-pxc="card"]'))return false;
  root=r;R={};
  ['intro','card','anchor','tip','rest','flow','step','q','back','next','score','num','band','areas','fix','fixh','rows','none','rec','year','tot','tot2','lead','leadl','form','formlive','thanks','thanksh','wa','wa2','live','icsok'].forEach(function(k){R[k]=part(k)});
  R.g1=part('gauge');R.g2=part('gauge2');R.segs=$$('i',part('segs'));
  var im=$('img.ic3',root),src=im?im.getAttribute('src')||'':'';if(src.indexOf('/')>-1)icBase=src.slice(0,src.lastIndexOf('/')+1);
  /* the result reuses the card's gauge and calendar */
  var svg=$('svg',R.g1);
  if(svg&&!R.g2.firstChild){var c=svg.cloneNode(true);c.removeAttribute('role');c.removeAttribute('aria-label');R.g2.appendChild(c)}
  var cal2=part('cal2');
  if(cal2&&!cal2.firstChild){var cc=part('cal').cloneNode(true),kk=part('key').cloneNode(true);cc.removeAttribute('data-pxc');kk.removeAttribute('data-pxc');cal2.appendChild(cc);cal2.appendChild(kk)}
  /* loops run only on screen */
  var cals=$$('.pxc-cal',root);
  if('IntersectionObserver' in W){var io=new IntersectionObserver(function(es){es.forEach(function(en){en.target.classList.toggle('pxc-live',en.isIntersecting)})},{threshold:.05});cals.forEach(function(c){io.observe(c)})}
  else cals.forEach(function(c){c.classList.add('pxc-live')});

  root.addEventListener('click',function(e){
    var t=e.target&&e.target.closest?e.target.closest('[data-pxc]'):null,k=t?t.getAttribute('data-pxc'):'';
    if(k==='back')goBack();
    else if(k==='next')goNext();
    else if(k==='again'||k==='again2')start({restart:true});
    else if(k==='ics')downloadIcs();
    else if(k==='wa'||k==='wa2')track('hc_whatsapp',{score:result().score});
  });
  R.q.addEventListener('click',function(e){var b=e.target&&e.target.closest?e.target.closest('[role=radio]'):null;if(b)pick(+b.getAttribute('data-i'))});
  R.q.addEventListener('keydown',function(e){
    if(!(e.target&&e.target.matches&&e.target.matches('[role=radio]')))return;
    var k=e.key,all=$$('[role=radio]',R.q),i=all.indexOf(e.target),n;
    if(k==='ArrowDown'||k==='ArrowRight')n=(i+1)%all.length;
    else if(k==='ArrowUp'||k==='ArrowLeft')n=(i-1+all.length)%all.length;
    else if(k==='Home')n=0;
    else if(k==='End')n=all.length-1;
    else return;
    e.preventDefault();
    all.forEach(function(b,j){b.tabIndex=j===n?0:-1});focusEl(all[n]);
  });
  R.form.addEventListener('submit',submitLead);
  R.form.addEventListener('input',function(e){var b=e.target&&e.target.closest?e.target.closest('.pxc-fld'):null;if(!b||!b.classList.contains('pxc-bad'))return;b.classList.remove('pxc-bad');e.target.removeAttribute('aria-invalid');var er=$('.pxc-err',b);if(er){er.hidden=true;er.textContent=''}});

  /* resume */
  S={v:'intro',step:0,a:{},skip2:false};load();
  var h=parseInt(S.a.q1!=null?S.a.q1:pxGet('headcount'),10);hc=isNaN(h)?25:clamp(h,1,5000);
  var pi=S.a.q2||pxGet('industry');preInd=IND[pi]?pi:null;
  if(S.v==='result'&&firstOpen()>=0)S.v='flow';
  if(S.v==='flow'){
    var fo=firstOpen();
    if(fo>=0&&S.step>fo)S.step=fo;
    if(S.step===1&&S.skip2&&S.a.q2)S.step=fo<0?2:fo;
    setView('flow');needle(R.g1,tally().pct,true);renderQ(false);
  }else if(S.v==='result'){paintResult(false)}
  else setView('intro');
  totals();
  return true;
}

W.addEventListener('px:change',function(e){
  var d=e&&e.detail;if(!d||d.src==='check'||!root||!D.documentElement.contains(root))return;
  if(d.key==='headcount'){var v=parseInt(d.value,10);if(isNaN(v))return;hc=clamp(v,1,5000);if(S.a.q1!=null){S.a.q1=hc;save()}if(hcSync)hcSync(null);totals()}
  else if(d.key==='industry'&&IND[d.value]){
    preInd=d.value;
    if(S.a.q2!=null&&S.a.q2!==d.value){S.a.q2=d.value;save();if(S.v==='result')paintResult(false)}
    else if(S.v==='flow'&&QS[S.step].id==='q2'&&!busy)renderQ(false);
  }
});

/* any element with data-check-start opens the check; bound once, always calls the live copy */
if(!W.__pxcBound){
  W.__pxcBound=true;
  D.addEventListener('click',function(e){
    var t=e.target&&e.target.closest?e.target.closest('[data-check-start]'):null;
    if(!t||!W.PXCheck)return;
    e.preventDefault();
    W.PXCheck.start({industry:t.getAttribute('data-check-industry')||undefined,entry:t.getAttribute('data-check-entry')||undefined});
  });
}

W.PXCheck={
  start:start,
  reset:reset,
  ics:icsText,
  init:boot,
  alive:function(){return !!root&&D.documentElement.contains(root)},
  state:function(){var a={},k;for(k in S.a)a[k]=S.a[k];return{view:S.v,step:S.step+1,answers:a,headcount:S.a.q1||hc,skipQ2:S.skip2,result:firstOpen()<0?result():null}}
};

if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',boot);else boot();
})();
