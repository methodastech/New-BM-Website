(function(){
'use strict';
var D=document, W=window, R=D.documentElement;
var reduce = W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches;
var $=function(s,r){return (r||D).querySelector(s)}, $$=function(s,r){return Array.prototype.slice.call((r||D).querySelectorAll(s))};
var toastT;
function toast(msg){ var t=$('#toast'); if(!t) return; t.textContent=msg; t.classList.add('on'); clearTimeout(toastT); toastT=setTimeout(function(){ t.classList.remove('on'); },3800); }

 
D.addEventListener('click', function(e){
  var a = e.target.closest ? e.target.closest('a,button') : null; if(!a) return; if(a.closest('.bmws')) return;  
  if(a.classList.contains('demo') || a.hasAttribute('data-demo')){ e.preventDefault(); toast('FAR Capital’s new site is one page. In the full build this opens ' + (a.getAttribute('data-demo')||'the same place') + ' from here.'); return; }
  if(a.tagName==='A'){ var href=a.getAttribute('href')||''; if(href && href.charAt(0)!=='#'){ e.preventDefault(); toast('FAR Capital’s new site is one page. Outside links are switched off in this draft.'); } }
});

 
(function header(){
  var hd=$('#hd'); if(!hd) return; var last=W.scrollY||0, hidden=false;
  function upd(){ var y=W.scrollY||0; hd.classList.toggle('solid', y>40); var dy=y-last;
    if(y>180 && dy>6 && !hidden){ hidden=true; hd.classList.add('hide'); } else if((dy<-6 || y<180) && hidden){ hidden=false; hd.classList.remove('hide'); } last=y; }
  W.addEventListener('scroll', upd, {passive:true}); upd();
  var b=$('.burger',hd), m=$('#mnav');
  if(b&&m){ b.addEventListener('click', function(){ var o=!m.classList.contains('open'); m.classList.toggle('open',o); b.setAttribute('aria-expanded',o?'true':'false'); R.classList.toggle('menu-open',o); });
    $$('a',m).forEach(function(a){ a.addEventListener('click', function(){ m.classList.remove('open'); b.setAttribute('aria-expanded','false'); R.classList.remove('menu-open'); }); });
     
    D.addEventListener('keydown', function(e){ if(e.key==='Escape' && m.classList.contains('open')){ m.classList.remove('open'); b.setAttribute('aria-expanded','false'); R.classList.remove('menu-open'); b.focus(); } });
    W.addEventListener('resize', function(){ if(W.innerWidth>1024 && m.classList.contains('open')){ m.classList.remove('open'); b.setAttribute('aria-expanded','false'); R.classList.remove('menu-open'); } }, {passive:true}); }
})();

 
if(/[?&]still\b/.test(location.search)){ R.classList.add('still'); $$('img[loading="lazy"]').forEach(function(im){ im.loading='eager'; }); }
 
(function reveals(){
  var all=$$('.rise,[data-rv],[data-st],.wp'); var later=all.filter(function(e){ return e.classList.contains('after-ld'); }); var now=all.filter(function(e){ return !e.classList.contains('after-ld'); });
  function on(e){ e.classList.add('on'); } function heroIn(){ later.forEach(on); }
  if(W.__lxReady || !$('#ld')) heroIn(); else W.addEventListener('lxready', function(){ setTimeout(heroIn, 350); });
  setTimeout(heroIn, 7000);  
  if(!('IntersectionObserver' in W) || reduce){ now.forEach(on); return; }
  var io=new IntersectionObserver(function(ents){ ents.forEach(function(en){ if(en.isIntersecting){ on(en.target); io.unobserve(en.target); } }); },{threshold:0, rootMargin:'0px 0px -6% 0px'});
  now.forEach(function(e){ io.observe(e); });
  function sweep(){ now.forEach(function(e){ if(!e.classList.contains('on')){ var r=e.getBoundingClientRect(); if(r.top<W.innerHeight && r.bottom>0) on(e); } }); }
  W.addEventListener('load', function(){ setTimeout(sweep, 1500); setTimeout(sweep, 4000); });
  var swT=0; W.addEventListener('scroll', function(){ if(swT) return; swT=setTimeout(function(){ swT=0; sweep(); }, 450); }, {passive:true});
})();

 
(function heroScroll(){
  var hero=$('.hero'); if(!hero || reduce || R.classList.contains('still')) return; var raf=0, h=1;
  function size(){ h=hero.offsetHeight||1; } size(); W.addEventListener('resize', size);
  function upd(){ raf=0; var y=W.scrollY||0; if(y>h+60) return; var p=Math.max(0,Math.min(1,y/h)); hero.style.setProperty('--hp',p.toFixed(3)); }
  W.addEventListener('scroll', function(){ if(!raf) raf=requestAnimationFrame(upd); }, {passive:true}); upd();
})();

 
(function tower(){
  var fig=$('#tower'); if(!fig) return; var wins=$$('.cb-dots i',fig), N=wins.length, n=$('#twN'), pur=$('#twP'), bar=$('#twBar'), pct=$('#twPct'), raf=0, vis=false, lit=-1;
  function cl(v){ return Math.max(0,Math.min(1,v)); }
  function paint(p){ var k=Math.round(p*N); if(k!==lit){ wins.forEach(function(w,i){ w.classList.toggle('lit', i<k); }); lit=k; }
    n.textContent=String(Math.round(54*cl(p/.45))); pur.classList.toggle('on', p>=.5); var q=cl((p-.6)/.4); bar.style.setProperty('--w',(1-.28*q).toFixed(3)); pct.textContent=String(Math.round(28*q)); }
  if(reduce || R.classList.contains('still') || !('IntersectionObserver' in W)){ paint(1); return; }
  function upd(){ raf=0; var r=fig.getBoundingClientRect(), vh=W.innerHeight; paint(cl((vh*.85 - r.top)/(vh*.55))); }
  W.addEventListener('scroll', function(){ if(vis && !raf) raf=requestAnimationFrame(upd); }, {passive:true}); W.addEventListener('resize', upd);
  var io=new IntersectionObserver(function(ents){ ents.forEach(function(en){ vis=en.isIntersecting; if(vis) upd(); }); },{threshold:0, rootMargin:'20% 0px 20% 0px'}); io.observe(fig); upd();
})();

 
(function gates(){
  if(!('IntersectionObserver' in W)) return; var els=$$('.rail,.mq,.tiers'); if(!els.length) return;
  var io=new IntersectionObserver(function(ents){ ents.forEach(function(en){ en.target.classList.toggle('off', !en.isIntersecting); }); },{threshold:0});
  els.forEach(function(e){ io.observe(e); });
})();

 
(function evDrift(){
  var r=$('#evRail'), ul=r&&r.querySelector('.ev'); if(!ul || reduce || R.classList.contains('still') || !W.matchMedia('(hover:hover)').matches || !('IntersectionObserver' in W)) return;
  R.classList.add('drift'); var x=0, half=0, hot=false, down=false, sx=0, x0=0, moved=false, vis=false, raf=0, last=0, py=-1;
  W.addEventListener('pointermove', function(e){ py=e.clientY; }, {passive:true});
  function size(){ half=ul.scrollWidth/2; } size(); W.addEventListener('resize', size);
  function frame(ts){ raf=0; if(!vis) return; var dt=last?Math.min(50,ts-last):16; last=ts;
    if(hot && py>=0){ var rc=r.getBoundingClientRect(); if(py<rc.top || py>rc.bottom) hot=false; }    
    if(!hot && !down) x-=dt*.028; if(x<=-half) x+=half; if(x>0) x-=half;
    ul.style.transform='translate3d('+x.toFixed(1)+'px,0,0)'; raf=requestAnimationFrame(frame); }
  function go(){ if(!raf){ last=0; raf=requestAnimationFrame(frame); } }
  var io=new IntersectionObserver(function(ents){ ents.forEach(function(en){ vis=en.isIntersecting; if(vis) go(); else hot=false; }); },{threshold:0}); io.observe(r);
  r.addEventListener('pointerenter', function(){ hot=true; }); r.addEventListener('pointerleave', function(){ hot=false; });
  r.addEventListener('pointerdown', function(e){ down=true; moved=false; sx=e.clientX; x0=x; r.classList.add('drag'); });
  W.addEventListener('pointermove', function(e){ if(!down) return; var dx=e.clientX-sx; if(Math.abs(dx)>4) moved=true; x=x0+dx; });
  W.addEventListener('pointerup', function(){ down=false; r.classList.remove('drag'); });
  r.addEventListener('click', function(e){ if(moved){ e.preventDefault(); e.stopPropagation(); } }, true);
})();

 
(function stmt(){
  var s=$('.stmt'); if(!s) return; var ws=$$('.w',s), n=ws.length, raf=0;
  if(reduce || R.classList.contains('still')){ ws.forEach(function(w){ w.classList.add('lit'); }); return; }
  function upd(){ raf=0; var r=s.getBoundingClientRect(), vh=W.innerHeight; if(r.bottom<0 || r.top>vh) return;
    var p=(vh*.9 - r.top)/(r.height*.75 + vh*.2); p=Math.max(0,Math.min(1,p)); var k=Math.round(p*(n+1));
    ws.forEach(function(w,i){ w.classList.toggle('lit', i<k); }); }
  W.addEventListener('scroll', function(){ if(!raf) raf=requestAnimationFrame(upd); }, {passive:true}); W.addEventListener('resize', upd); upd(); setTimeout(upd, 800);
})();

 
(function counts(){
  var els=$$('[data-count]'); if(!els.length) return;
  function fmt(n){ return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function run(el){ var to=parseFloat(el.getAttribute('data-count'))||0, t0=0, dur=1600;
    function f(ts){ if(!t0) t0=ts; var p=Math.min(1,(ts-t0)/dur); p=1-Math.pow(1-p,3); el.textContent=fmt(to*p); if(p<1) requestAnimationFrame(f); else el.textContent=fmt(to); }
    requestAnimationFrame(f); }
  if(!('IntersectionObserver' in W) || reduce || R.classList.contains('still')){ els.forEach(function(e){ e.textContent=fmt(parseFloat(e.getAttribute('data-count'))||0); }); return; }
  var io=new IntersectionObserver(function(ents){ ents.forEach(function(en){ if(en.isIntersecting){ run(en.target); io.unobserve(en.target); } }); },{threshold:0.5});
  els.forEach(function(e){ io.observe(e); });
})();

 
(function screening(){
  var f=$('#scr'); if(!f) return; var out=$('#scrOut'), nd=$('#sgN');
  function val(n){ var c=f.querySelector('input[name="'+n+'"]:checked'); return c?c.value:''; }
  function fmt(n){ return 'RM ' + String(Math.round(n/1000)*1000).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function calc(){ var i=+val('sInc'), c=+val('sCom'), g=val('sGoal'), dsr=c/i; var room=Math.max(0, i*0.7 - c); var lo=room*190, hi=room*225;
    var k = dsr<=0.4 ? 'st-g' : dsr<=0.6 ? 'st-a' : 'st-r', d=$('#rDsr'), st=$('#rStat');
    d.textContent=Math.round(dsr*100)+'%'; d.className=k;
    $('#rLoan').textContent= room>0 ? fmt(lo)+' to '+fmt(hi) : 'Needs a fix first';
    var t = dsr<=0.4 ? 'Bankable' : dsr<=0.6 ? 'Bankable with 1 to 3 fixes' : 'Fix the commitments first';
    if(g==='debt') t = dsr>0.4 ? 'A debt plan first, then the property' : 'Bankable, a property can carry the debt';
    st.textContent=t; st.className=k; if(nd) nd.style.transform='rotate('+(-90+Math.min(1,dsr)*180).toFixed(1)+'deg)'; out.classList.add('on'); }
  f.addEventListener('submit', function(e){ e.preventDefault(); });
  f.addEventListener('change', calc); calc();
})();



(function calculators(){
  var box=$('#cx'); if(!box) return;
  var tabs=$$('#tools [role=tab]'), panes=$$('.cxp', box);
  function fin(x){ x=+x; return isFinite(x)?x:0; }
  function grp(n){ return String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function rm(n, step){ n=fin(n); step=step||1; n=Math.round(n/step)*step; return (n<0?'minus ':'')+'RM\u00a0'+grp(n); }
  function r100(n){ return rm(n, 100); }
  function pct(n){ return (Math.round(fin(n)*10)/10)+'%'; }
  function pmt(L, ra, n){ var r=ra/12; if(L<=0||n<=0) return 0; if(r<=0) return L/n; return L*r/(1-Math.pow(1+r,-n)); }
  function pv(M, ra, n){ var r=ra/12; if(M<=0||n<=0) return 0; if(r<=0) return M*n; return M*(1-Math.pow(1+r,-n))/r; }
  function balAfter(L, ra, M, k){ var r=ra/12, b=L; for(var i=0;i<k && b>0;i++){ b=b*(1+r)-M; } return Math.max(0,b); }
  function sro(x){ if(x<=0) return 0; return Math.max(500, Math.min(x,500000)*0.0125 + Math.max(0,x-500000)*0.01); }
  function motStamp(x){ var t=[[100000,.01],[400000,.02],[500000,.03],[Infinity,.04]], left=x, d=0; for(var i=0;i<t.length && left>0;i++){ var a=Math.min(left,t[i][0]); d+=a*t[i][1]; left-=a; } return d; }
  function fees(P, L){ var legal=(sro(P)+sro(L))*1.08, stamp=motStamp(P)+L*0.005, val=Math.max(300, P*0.0025); return {legal:legal, stamp:stamp, val:val, all:legal+stamp+val}; }
  function span(m){ if(!isFinite(m)) return 'never'; var y=Math.floor(m/12), mo=m%12, a=[]; if(y) a.push(y+(y>1?' years':' year')); if(mo) a.push(mo+(mo>1?' months':' month')); return a.join(' ')||'this month'; }
  function when(m){ var d=new Date(); d.setDate(1); d.setMonth(d.getMonth()+m); return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]+' '+d.getFullYear(); }

   
  function parse(v){ v=String(v).replace(/[^0-9.]/g,''); var p=v.split('.'); if(p.length>2) v=p[0]+'.'+p.slice(1).join(''); return (v===''||v==='.')?NaN:parseFloat(v); }
  function show(v, kind){ return kind==='rm' ? grp(v) : String(Math.round(v*100)/100); }
  function limitText(f, v){ var lo=+f.dataset.min, hi=+f.dataset.max, k=f.dataset.kind; var w=function(x){ return k==='rm'?'RM '+grp(x):k==='pct'?x+'%':x; }; return v<lo ? 'Taken as '+w(lo)+', the lowest this tool reads.' : 'Taken as '+w(hi)+', the highest this tool reads.'; }
  function fill(r){ var lo=+r.min, hi=+r.max; r.style.setProperty('--p', ((+r.value-lo)/(hi-lo)*100).toFixed(1)+'%'); }
  function val(pane, k){
    var f=pane.querySelector('input[data-k="'+k+'"]:not([type=radio])');
    if(!f){ var c=pane.querySelector('input[data-k="'+k+'"]:checked'); return c?c.value:''; }
    var v=parse(f.value), lo=+f.dataset.min, hi=+f.dataset.max; if(isNaN(v)) v=+f.dataset.def; return Math.min(hi, Math.max(lo, v));
  }
  panes.forEach(function(pane){
    $$('.cxf-in input', pane).forEach(function(f){
      var wrap=f.closest('.cxf'), r=$('.cxf-r', wrap), h=$('.cxf-h', wrap);
      if(r) fill(r);
      function check(){ var v=parse(f.value), lo=+f.dataset.min, hi=+f.dataset.max, bad=!isNaN(v) && (v<lo||v>hi); wrap.classList.toggle('ov', bad); h.textContent= bad ? limitText(f, v) : (isNaN(v) && f.value.trim()!=='' ? 'Numbers only.' : ''); return bad; }
      f.addEventListener('input', function(){ check(); if(r){ r.value=val(pane, f.dataset.k); fill(r); } run(pane); });
      f.addEventListener('blur', function(){ var v=val(pane, f.dataset.k); f.value=show(v, f.dataset.kind); wrap.classList.remove('ov'); h.textContent=''; if(r){ r.value=v; fill(r); } run(pane); });
      f.addEventListener('focus', function(){ setTimeout(function(){ try{ f.select(); }catch(e){} }, 0); });
      f.addEventListener('keydown', function(e){ if(e.key!=='ArrowUp' && e.key!=='ArrowDown') return; e.preventDefault(); var st=+f.dataset.step*(e.shiftKey?10:1), v=val(pane, f.dataset.k)+(e.key==='ArrowUp'?st:-st); v=Math.min(+f.dataset.max, Math.max(+f.dataset.min, Math.round(v/ +f.dataset.step)* +f.dataset.step)); f.value=show(v, f.dataset.kind); if(r){ r.value=v; fill(r); } run(pane); });
      if(r) r.addEventListener('input', function(){ f.value=show(+r.value, f.dataset.kind); fill(r); wrap.classList.remove('ov'); h.textContent=''; run(pane); });
    });
    $$('input[type=radio]', pane).forEach(function(x){ x.addEventListener('change', function(){ run(pane); }); });
  });

   
  var tw=new WeakMap();
  function tween(el, to, fmt){
    var from=tw.has(el)?tw.get(el):0; tw.set(el, to);
    if(reduce || R.classList.contains('still') || !isFinite(from) || !isFinite(to) || Math.abs(to-from)<1){ el.textContent=fmt(to); return; }
    var t0=performance.now(), d=520; el._k=(el._k||0)+1; var k=el._k;
    (function step(t){ if(k!==el._k) return; var u=Math.min(1,(t-t0)/d), e=1-Math.pow(1-u,3); el.textContent=fmt(from+(to-from)*e); if(u<1) requestAnimationFrame(step); })(t0);
  }
  function o(pane, k){ return pane.querySelector('[data-o="'+k+'"]'); }
  function rows(pane, list){ o(pane,'rows').innerHTML=list.map(function(x){ return '<dt'+(x[2]?' class="cx-tot"':'')+'>'+(x[3]!=null?'<i class="cxc'+x[3]+'"></i>':'')+x[0]+'</dt><dd'+(x[2]?' class="cx-tot"':'')+'>'+x[1]+'</dd>'; }).join(''); }
  function bars(pane, a, b, la, lb){ var m=Math.max(Math.abs(a),Math.abs(b),1);
    [[la,a],[lb,b]].forEach(function(p){ var el=pane.querySelector('[data-v="'+p[0]+'"]'); el.querySelector('.cx-fl').style.setProperty('--w', (Math.max(0,p[1])/m).toFixed(4)); tween(o(pane,p[0]+'V'), p[1], r100); });
    pane.querySelector('[data-v="'+la+'"]').classList.toggle('cx-win', a>=b); pane.querySelector('[data-v="'+lb+'"]').classList.toggle('cx-win', b>a); }
  function head(pane, k, big, fmt, sub, say){ o(pane,'k').textContent=k; if(typeof big==='number') tween(o(pane,'big'), big, fmt||r100); else { tw.set(o(pane,'big'), NaN); o(pane,'big').textContent=big; } o(pane,'sub').textContent=sub; clearTimeout(pane._say); pane._say=setTimeout(function(){ o(pane,'say').textContent=say||(k+': '+o(pane,'big').textContent+'. '+sub); }, 700); }

  var C={
    cap:function(p){
      var P=val(p,'price'), dp=P*val(p,'dp')/100, L=P-dp, F=fees(P,L), reno=val(p,'reno'), tot=dp+F.all+reno, M=pmt(L,.042,420);
      head(p, 'Cash you need before you get the keys', tot, r100, 'On a '+rm(P)+' home with '+pct(val(p,'dp'))+' down. The bank lends '+r100(L)+'.');
      [dp,F.legal,F.stamp,F.val,reno].forEach(function(x,i){ p.querySelector('[data-v="s'+i+'"]').style.setProperty('--g', Math.max(0.0001,x/tot).toFixed(4)); });
      rows(p, [['Down payment', r100(dp), 0, 0], ['Legal fees, with SST', r100(F.legal), 0, 1], ['Stamp duty', r100(F.stamp), 0, 2], ['Valuation, about', r100(F.val), 0, 3], ['Renovation and furnishing', r100(reno), 0, 4], ['Instalment after, at 4.2% over 35 years', rm(M,10)+' a month', 1]]);
    },
    rob:function(p){
      var P=val(p,'price'), R=val(p,'rent'), N=+val(p,'yrs')||10, ra=val(p,'rate')/100, g=val(p,'grow')/100, n=N*12;
      var L=P*.9, dp=P*.1, F=fees(P,L), M=pmt(L,ra,420), bN=balAfter(L,ra,M,n), interest=M*n-(L-bN), upkeep=P*.01*N, gain=P*(Math.pow(1+g,N)-1);
      var buy=interest+F.all+upkeep-gain, rentPaid=0; for(var y=0;y<N;y++) rentPaid+=R*12*Math.pow(1.03,y);
      var earn=(dp+F.all)*(Math.pow(1.035,N)-1), rent=rentPaid-earn, d=rent-buy;
      head(p, 'Over '+N+' years', d>=0?'Buying wins':'Renting wins', null, (d>=0?'Owning costs ':'Renting costs ')+r100(Math.abs(d))+' less than '+(d>=0?'renting':'buying')+', once the home’s growth and your savings are counted.');
      bars(p, rent, buy, 'rent', 'buy');
      rows(p, [['Instalment against rent today', rm(M,10)+' / '+rm(R,10)], ['Rent paid over '+N+' years', r100(rentPaid)], ['Interest paid', r100(interest)], ['Fees and upkeep', r100(F.all+upkeep)], ['The home’s growth', r100(gain)], ['Net cost of buying', buy<0?'a gain of '+r100(-buy):r100(buy), 1], ['Net cost of renting', r100(rent), 1]]);
    },
    debt:function(p){
      var D=[['cc','Credit card'],['pl','Personal loan'],['car','Car loan']].map(function(x){ return {k:x[0], n:x[1], b:val(p,x[0]+'B'), r:val(p,x[0]+'R')/100/12, m:val(p,x[0]+'M')}; }).filter(function(d){ return d.b>0; });
      $$('.cx-tlr', p).forEach(function(r){ r.hidden=true; });
      if(!D.length){ head(p,'Your debts','RM 0',null,'Nothing owed. Put the extra to a home deposit.'); rows(p,[]); return; }
      var extra=val(p,'extra'), way=val(p,'way');
      function sim(roll){ var ds=D.map(function(d){ return {k:d.k,n:d.n,b:d.b,r:d.r,m:d.m,done:0}; }), ord=ds.slice().sort(way==='snow'?function(a,b){ return a.b-b.b; }:function(a,b){ return b.r-a.r; }), paid=0, m=0;
        while(m<600 && ds.some(function(d){ return d.b>0.5; })){ m++; var left=roll?extra:0;
          ds.forEach(function(d){ if(d.b>0.5){ var i=d.b*d.r; d.b+=i; paid+=i; var p2=Math.min(d.m,d.b); d.b-=p2; if(roll) left+=d.m-p2; } else if(roll) left+=d.m; });
          if(roll) for(var j=0;j<ord.length && left>0.5;j++){ var d=ord[j]; if(d.b>0.5){ var p3=Math.min(left,d.b); d.b-=p3; left-=p3; } }
          ds.forEach(function(d){ if(d.b<=0.5 && !d.done){ d.b=0; d.done=m; } }); }
        return {m: ds.every(function(d){ return d.done; }) ? m : Infinity, paid:paid, ds:ds, ord:ord}; }
      var a=sim(true), base=sim(false), last=a.m;
      if(!isFinite(last)){ head(p,'Your debts','Not yet',null,'The payments do not cover the interest. Raise a payment or the extra, or ask us for a debt plan.'); rows(p,[['Interest each month now', rm(D.reduce(function(s,d){ return s+d.b*d.r; },0),10)]]); return; }
      var gainM=isFinite(base.m)?base.m-last:Infinity; head(p, 'Debt free in', span(last), null, 'By '+when(last)+'. '+(!isFinite(base.m)?'The payments alone never get there.':gainM>0?span(gainM)+' sooner and '+r100(base.paid-a.paid)+' less interest than the payments alone.':'Add an extra each month to clear it sooner.'));
      var pos=0; a.ord.forEach(function(d){ var r=p.querySelector('[data-v="'+d.k+'"]'); r.hidden=false; r.style.order=pos++; o(p,d.k+'N').textContent=d.n; o(p,d.k+'W').textContent=when(d.done); r.querySelector('.cx-fl').style.setProperty('--w',(d.done/last).toFixed(4)); });
      rows(p, [['Order', a.ord.map(function(d){ return d.n; }).join(', then ')], ['Interest you pay', r100(a.paid)], ['Payments alone', isFinite(base.m)?r100(base.paid)+' over '+span(base.m):'never cleared'], ['Each month', rm(D.reduce(function(s,d){ return s+d.m; },0)+extra,10), 1]]);
    },
    keep:function(p){
      var V=val(p,'val'), Lb=val(p,'loan'), Bp=val(p,'paid'), own=+val(p,'own')||6, R=val(p,'rent'), I=val(p,'inst'), Cst=val(p,'cost'), g=val(p,'grow')/100, N=+val(p,'yrs')||10;
      var sc=V*.03, gain=V-Bp-sc, rate=own<=3?.3:own===4?.2:own===5?.15:0, rpgt=rate*Math.max(0, gain-Math.max(10000, gain*.1)), cashNow=V-Lb-sc-rpgt, sell=cashNow*Math.pow(1.035,N);
      var b=Lb, r=.042/12, flow=0; for(var m=0;m<N*12;m++){ var due=b>0?Math.min(I, b*(1+r)):0; if(b>0) b=Math.max(0, b*(1+r)-I); flow+=R-due-Cst; }
      var VN=V*Math.pow(1+g,N), held=own+N, rate2=held<=3?.3:held===4?.2:held===5?.15:0, gain2=VN*.97-Bp, keep=VN*.97-b-rate2*Math.max(0,gain2-Math.max(10000,gain2*.1))+flow, d=keep-sell, mo=R-I-Cst;
      head(p, 'In '+N+' years', d>=0?'Keep it':'Sell it', null, (d>=0?'Keeping leaves you ':'Selling today leaves you ')+r100(Math.abs(d))+' better off, with the cash from a sale kept at 3.5%.');
      bars(p, keep, sell, 'keep', 'sell');
      rows(p, [['Cash if you sell today', r100(cashNow)], ['RPGT on a sale today', r100(rpgt)], [mo>=0?'It pays you each month':'It costs you each month', rm(Math.abs(mo),10)], ['Worth in '+N+' years', r100(VN)], ['Loan left in '+N+' years', r100(b)], ['Your share in '+N+' years', r100(keep), 1]]);
    },
    loan:function(p){
      var G=val(p,'inc'), Cm=val(p,'com'), A=val(p,'age'), ra=val(p,'rate')/100, net=G*(G<=5000?.87:G<=10000?.83:.78), cap=net<=3500?.6:.7, yrs=Math.max(5,Math.min(35,70-A)), Mx=cap*net-Cm, L=pv(Mx,ra,yrs*12), dsr=Cm/net;
      o(p,'dsr').textContent=Math.round(dsr*100)+'%'; p.querySelector('[data-v="nd"]').style.transform='rotate('+(-90+Math.min(1,dsr)*180).toFixed(1)+'deg)';
      if(Mx<=50){ head(p,'A bank may lend','Not yet',null,'Your loans and cards take the room a home loan needs. The free screening shows the fix.'); rows(p,[['Take home, estimated', rm(net,10)], ['Most banks allow for all loans', pct(cap*100)+' of it']]); return; }
      head(p, 'A bank may lend up to', L, r100, 'A home up to '+r100(L/.9)+' at a 90% loan, paid over '+yrs+' years.');
      rows(p, [['Take home, estimated', rm(net,10)], ['Room for a new instalment', rm(Mx,10)+' a month'], ['Loan tenure', yrs+' years'], ['Home price that fits', r100(L/.9), 1]]);
    }
  };
  function run(pane){ try{ C[pane.dataset.cx](pane); }catch(err){ o(pane,'k').textContent='Check the figures'; o(pane,'big').textContent='Try again'; } }
  function pick(t, focus){
    tabs.forEach(function(x){ var on=x===t; x.setAttribute('aria-selected', on?'true':'false'); x.tabIndex=on?0:-1; var p=$('#'+x.getAttribute('aria-controls')); p.hidden=!on; p.classList.toggle('cx-on', on); });
    if(focus) t.focus(); var bi=$('.bi', t); if(bi){ bi.classList.remove('go'); void bi.offsetWidth; bi.classList.add('go'); setTimeout(function(){ bi.classList.remove('go'); }, 2200); }
    if(t.scrollIntoView && W.innerWidth<=760){ var tl=t.parentNode; tl.scrollTo({left:t.offsetLeft-20, behavior:reduce?'auto':'smooth'}); }
    run($('#'+t.getAttribute('aria-controls')));
  }
  tabs.forEach(function(t, i){
    t.addEventListener('click', function(){ pick(t); });
    t.addEventListener('keydown', function(e){ var j=e.key==='ArrowRight'?i+1:e.key==='ArrowLeft'?i-1:e.key==='Home'?0:e.key==='End'?tabs.length-1:null; if(j===null) return; e.preventDefault(); pick(tabs[(j+tabs.length)%tabs.length], true); });
  });
  panes.forEach(run);
  $$('[data-tool]').forEach(function(a){ a.addEventListener('click', function(){ var t=$('#cxt-'+a.getAttribute('data-tool')); if(t) setTimeout(function(){ pick(t); }, 60); }); });
})();

 
(function qs(){ var ds=$$('.qs details'); ds.forEach(function(d){ d.addEventListener('toggle', function(){ if(d.open) ds.forEach(function(o){ if(o!==d) o.open=false; }); }); }); })();

 
(function film(){
  var v=$('#heroVid'); if(!v) return; v.addEventListener('error', function(){ v.style.display='none'; }, true);
  var s=v.querySelector('source'); if(s) s.addEventListener('error', function(){ v.style.display='none'; });
  var p=v.play && v.play(); if(p && p.catch) p.catch(function(){});
  D.addEventListener('visibilitychange', function(){ if(D.hidden) v.pause(); else { var q=v.play(); if(q&&q.catch) q.catch(function(){}); } });
})();

 
(function smooth(){
  if(reduce || !W.Lenis || W.matchMedia('(hover:none)').matches) return;
  var lenis=new Lenis({lerp:.09, wheelMultiplier:1, smoothWheel:true});
  function raf(t){ lenis.raf(t); requestAnimationFrame(raf); } requestAnimationFrame(raf);
  D.addEventListener('click', function(e){ var a=e.target.closest ? e.target.closest('a[href^="#"]') : null; if(!a || a.classList.contains('demo')) return; var id=a.getAttribute('href'); if(id.length<2) return; var t=D.querySelector(id); if(!t) return; e.preventDefault(); lenis.scrollTo(t,{offset:-(parseFloat(getComputedStyle(R).getPropertyValue('--bmx-bar'))||0)-84, duration:1.2}); });
  W.__lenis=lenis;
})();

 
(function parallax(){
  var hero=$('.hero'); if(!hero || reduce || !W.matchMedia('(hover:hover)').matches) return; var raf=0, mx=0, my=0;
  hero.addEventListener('pointermove', function(e){ var r=hero.getBoundingClientRect(); mx=(e.clientX-r.left)/r.width-.5; my=(e.clientY-r.top)/r.height-.5; if(!raf) raf=requestAnimationFrame(function(){ raf=0; hero.style.setProperty('--px',(mx*-18).toFixed(1)+'px'); hero.style.setProperty('--py',(my*-12).toFixed(1)+'px'); }); });
  hero.addEventListener('pointerleave', function(){ hero.style.setProperty('--px','0px'); hero.style.setProperty('--py','0px'); });
})();

 
(function pillars(){
  var band=$('#pillars'), f=$('#plFollow'); if(!band || !f) return; var img=f.querySelector('img'), stat=$('#plPic img');
  var fine=W.matchMedia('(hover:hover)').matches && !reduce && !R.classList.contains('still');
  var tx=0, ty=0, cx=0, cy=0, hot=false, raf=0, seeded=false;
  function loop(){ cx+=(tx-cx)*.14; cy+=(ty-cy)*.14; f.style.transform='translate3d('+(cx-150).toFixed(1)+'px,'+(cy-190).toFixed(1)+'px,0)'; if(hot || Math.abs(tx-cx)>.4 || Math.abs(ty-cy)>.4) raf=requestAnimationFrame(loop); else raf=0; }
  $$('.words a[data-pic]').forEach(function(w){
    w.addEventListener('pointerenter', function(){ var src=w.getAttribute('data-pic'); if(img.getAttribute('src')!==src){ img.src=src; } if(stat && stat.getAttribute('src')!==src) stat.src=src; if(fine){ hot=true; f.classList.add('on'); if(!raf) raf=requestAnimationFrame(loop); } });
    w.addEventListener('pointerleave', function(){ hot=false; f.classList.remove('on'); });
  });
  if(fine) band.addEventListener('pointermove', function(e){ var r=band.getBoundingClientRect(); tx=e.clientX-r.left; ty=e.clientY-r.top; if(!seeded){ seeded=true; cx=tx; cy=ty; } if(!raf) raf=requestAnimationFrame(loop); });
})();

 
(function rail(){
  var r=$('#evRail'); if(!r || R.classList.contains('drift')) return; var down=false, sx=0, sl=0, moved=false;
  r.addEventListener('pointerdown', function(e){ down=true; moved=false; sx=e.clientX; sl=r.scrollLeft; r.classList.add('drag'); });
  W.addEventListener('pointermove', function(e){ if(!down) return; var dx=e.clientX-sx; if(Math.abs(dx)>4) moved=true; r.scrollLeft=sl-dx; });
  W.addEventListener('pointerup', function(){ down=false; r.classList.remove('drag'); });
  r.addEventListener('click', function(e){ if(moved){ e.preventDefault(); e.stopPropagation(); } }, true);
})();

 


(function(){
  var cv=document.getElementById('bmRibbon'),fb=document.querySelector('.ft-ribbon-fb'),ctx=null;try{ctx=cv&&cv.getContext('2d');}catch(e){}
  if(!ctx){if(cv)cv.style.display='none';if(fb)fb.hidden=false;return;}
  var RMr=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches,W=460,H=110,dpr=Math.min(window.devicePixelRatio||1,2);
  cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
  var X0=40,X1=420,BH=32,BY=40,running=false,looping=false,t=0,GL=null,F='600 12px "Instrument Sans",sans-serif';
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

 
(function film(){
  var fm=$('#fm'); if(!fm) return; var v=$('#fmV'), st=$('#fmStage'), sub=$('#fmSub'), pp=$('.fm-pp',fm), tl=$('#fmTl'), bar=tl.querySelector('i'), tm=$('#fmTm'), mu=$('#fmMu'), endc=$('#fmEnd'),
      TOTAL=+fm.dataset.total, END=+fm.dataset.end, cur=-1,
      caps=$$('.fm-caps li',fm).map(function(l){ return {t:+l.dataset.t, x:l.textContent, s:l.dataset.s||''}; }), figs=$$('#fmFigs li',fm).map(function(l){ return {a:+l.dataset.a, b:+l.dataset.b, el:l}; });
  function fmt(x){ x=Math.floor(x); var s=x%60; return Math.floor(x/60)+':'+(s<10?'0':'')+s; }
  function cap(k){ if(k===cur) return; cur=k; sub.setAttribute('data-s', k<0 ? '' : caps[k].s); sub.innerHTML = k<0 ? '' : caps[k].x.split(' ').map(function(w,i){ return '<span style="--k:'+i+'">'+w+'</span>'; }).join(' '); }
  function upd(){ var t=v.currentTime||0, k=-1; for(var i=0;i<caps.length;i++){ if(caps[i].t<=t+0.05) k=i; } cap(t>=END ? -1 : k);
    figs.forEach(function(f){ var on=t>=f.a && t<f.b; if(on && !f.el.classList.contains('on')){ var c=f.el.querySelector('[data-count]'); if(c) countTo(c); } f.el.classList.toggle('on', on); }); endc.classList.toggle('on', t>=END);
    bar.style.setProperty('--p',(t/TOTAL).toFixed(4)); tm.textContent=fmt(t)+' / '+fmt(TOTAL); tl.setAttribute('aria-valuenow', Math.round(t)); }
  function countTo(el){ var n=+el.dataset.count, t0=performance.now(); (function step(now){ var p=Math.min(1,(now-t0)/1700), e=1-Math.pow(1-p,3); el.textContent=String(Math.round(n*e)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); if(p<1) requestAnimationFrame(step); })(t0); }
   
  var ldP=null;
  function load(){ if(v.getAttribute('src')) return Promise.resolve(); if(ldP) return ldP;
    ldP=(W.fetch ? fetch(v.dataset.src).then(function(r){ if(!r.ok) throw 0; return r.blob(); }).then(function(b){ v.src=URL.createObjectURL(b); }) : Promise.reject(0)).catch(function(){ v.setAttribute('src', v.dataset.src); });
    return ldP; }
  function go(){ st.classList.add('playing'); load().then(function(){ var p=v.play(); if(p && p.catch) p.catch(function(){}); }); }
  function start(){ load().then(function(){ if(v.ended || v.currentTime>=TOTAL-0.3){ try{ v.currentTime=0; }catch(e){} } go(); }); }
  function seek(t){ st.classList.add('playing'); bar.style.setProperty('--p',(t/TOTAL).toFixed(4)); tm.textContent=fmt(t)+' / '+fmt(TOTAL);
    load().then(function(){ function s(){ try{ v.currentTime=t; }catch(x){} } if(v.readyState>=1) s(); else v.addEventListener('loadedmetadata', s, {once:true}); }); }
  function state(){ pp.classList.toggle('paused', v.paused); pp.setAttribute('aria-label', v.paused?'Play':'Pause'); }
  v.addEventListener('timeupdate', upd); v.addEventListener('play', state); v.addEventListener('pause', state); v.addEventListener('ended', state);
  $('#fmPlay').addEventListener('click', function(e){ e.stopPropagation(); start(); });
  st.addEventListener('click', function(e){ if(e.target.closest('a')) return; if(!st.classList.contains('playing')){ start(); } else if(v.paused){ start(); } else { v.pause(); } });
  pp.addEventListener('click', function(){ if(v.paused) start(); else v.pause(); });
  mu.addEventListener('click', function(){ v.muted=!v.muted; mu.textContent=v.muted?'Sound off':'Sound on'; mu.setAttribute('aria-pressed', v.muted?'false':'true'); });
  function at(e){ var r=tl.getBoundingClientRect(); return Math.max(0, Math.min(TOTAL-0.1, (e.clientX-r.left)/r.width*TOTAL)); }
  var drag=false; v.addEventListener('seeked', upd);
  tl.addEventListener('pointerdown', function(e){ drag=true; try{ tl.setPointerCapture(e.pointerId); }catch(x){} seek(at(e)); });
  tl.addEventListener('pointermove', function(e){ if(drag) seek(at(e)); });
  tl.addEventListener('pointerup', function(){ drag=false; }); tl.addEventListener('pointercancel', function(){ drag=false; });
  tl.addEventListener('keydown', function(e){ if(e.key==='ArrowRight' || e.key==='ArrowLeft'){ e.preventDefault(); seek(Math.max(0, Math.min(TOTAL-0.1, (v.currentTime||0) + (e.key==='ArrowRight' ? 5 : -5)))); } });
  if(!('IntersectionObserver' in W)) return;
  var io=new IntersectionObserver(function(ents){ ents.forEach(function(en){ if(!en.isIntersecting && !v.paused) v.pause(); }); },{threshold:.2}); io.observe(fm);
})();

 
(function iconsAlive(){
  if(reduce || R.classList.contains('still')) return; var all=$$('.bi'); if(!all.length) return;
  setInterval(function(){ if(D.hidden) return; var vh=W.innerHeight;
    var c=all.filter(function(b){ var r=b.getBoundingClientRect(); return r.top>70 && r.bottom<vh && b.closest('.on') && !b.classList.contains('go'); });
    if(!c.length) return; var b=c[Math.floor(Math.random()*c.length)]; b.classList.add('go'); setTimeout(function(){ b.classList.remove('go'); }, 2200); }, 1700);
})();

$$('[data-year]').forEach(function(e){ e.textContent=new Date().getFullYear(); });
})();
