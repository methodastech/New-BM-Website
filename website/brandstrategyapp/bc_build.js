if(!Element.prototype.__zrect){Element.prototype.__zrect=function(){var r=this.getBoundingClientRect();var z=parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--dz"))||1;if(z===1)return r;return{left:r.left/z,top:r.top/z,right:r.right/z,bottom:r.bottom/z,width:r.width/z,height:r.height/z,x:r.x/z,y:r.y/z};};}
window.__buildBrandComm=function(){
  var sec=document.getElementById('s-comm'); if(!sec) return;
  var CH=[
   {k:'ev', side:'int', a:90, aB:103, aG:80, name:'Executive Vision',        c:'#94A3B8', desc:'The story leadership tells about where this is all going.', bad:'Boring mission statement', good:'Enticing narrative', move:'Rewrite the mission as a <b>story people can repeat</b> without the slide deck.'},
   {k:'ld', side:'int', a:136, name:'Leadership Development',  c:'#34D399', desc:'How the brand grows its next layer of leaders.', bad:'Weak middle management', good:'Strong emerging leaders', move:'Teach managers to carry <b>the brand voice</b>, not just the KPIs.'},
   {k:'cd', side:'int', a:171, name:'Career Development',      c:'#34D399', desc:'What staying here actually promises your people.', bad:'Dead-end jobs', good:'Inspired career paths', move:'Map a <b>visible next step</b> for every single role.'},
   {k:'cc', side:'int', a:206, name:'Corporate Communication', c:'#34D399', desc:'The everyday messages the company sends itself.', bad:'Internal white noise', good:'Lively messages, empowered mission', move:'Fewer, clearer messages. Every memo answers <b>why this matters</b>.'},
   {k:'ot', side:'int', a:241, aB:252, aG:228, name:'Onboarding &amp; Training', c:'#34D399', desc:'A new hire&rsquo;s very first contact with the brand.', bad:'Fostering disengagement', good:'Impassioned, inspired new hires', move:'Onboard into <b>the mission first</b>, the tools second.'},
   {k:'pr', side:'ext', a:44,  name:'Public Relations',        c:'#60A5FA', desc:'How the world hears your story secondhand.', bad:'Sound bites that don&rsquo;t resonate', good:'Intriguing messages that sell', move:'Lead every release with <b>the one word you own</b>.'},
   {k:'so', side:'ext', a:9,   name:'Social',                  c:'#60A5FA', desc:'The brand&rsquo;s daily voice out in public.', bad:'Rogue messaging', good:'Glowing brand sentiment', move:'One voice guide, <b>every platform</b>, no freelancing.'},
   {k:'ba', side:'ext', a:-26, name:'Brand Advertising',       c:'#60A5FA', desc:'Paid reach for the brand idea itself.', bad:'Expensive image shaping', good:'Perfect positioning in culture', move:'Advertise <b>the position</b>, not the aesthetics.'},
   {k:'lm', side:'ext', a:-61, aB:-72, aG:-48, name:'Local Marketing',         c:'#60A5FA', desc:'How the brand shows up close to home.', bad:'Broad and desperate discounting', good:'Segmented customer on-ramping', move:'<b>Segment first.</b> Welcome people in, never mark yourself down.'}
  ];
  var map=document.getElementById('cmMap'), wires=document.getElementById('cmWires'),
      panel=document.getElementById('cmPanel'), stage=document.getElementById('cmStage');
  var nodes={}, lines={}, lock=null, tourTmr=null, tourIdx=0;
  var SVGNS='http://www.w3.org/2000/svg';
  var ICON={
   ev:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/></svg>',
   ld:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><path d="M3.5 20c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/><path d="M17 3.5v6M14 6.5h6"/></svg>',
   cd:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19l5-5 4 3 7-8"/><path d="M14 9h6v6"/></svg>',
   cc:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l16-6v14L3 13z"/><path d="M8.5 13.5V18a2 2 0 0 0 4 0"/></svg>',
   ot:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 9.5 12 5l9.5 4.5L12 14z"/><path d="M6.5 11.5V16c0 1.5 2.5 3 5.5 3s5.5-1.5 5.5-3v-4.5"/></svg>',
   pr:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.6 2.4 2.6 14.6 0 17M12 3.5c-2.6 2.4-2.6 14.6 0 17"/></svg>',
   so:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11.5a7.5 7.5 0 0 1-11 6.6L4 19.5l1.5-4.5A7.5 7.5 0 1 1 20 11.5z"/></svg>',
   ba:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/></svg>',
   lm:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11z"/><circle cx="12" cy="9.7" r="2.6"/></svg>'};

  CH.forEach(function(d){
    ['ch','bad','good'].forEach(function(t){
      var b=document.createElement('button'); b.type='button';
      b.className='cm-node cm-'+t+(t==='ch'?' '+d.side+(d.k==='ev'?' ev':''):''); b.dataset.k=d.k; b.style.setProperty('--c',d.c);
      b.style.animationDelay=(Math.random()*4).toFixed(2)+'s';
      b.innerHTML=(t==='ch'?'<span class="ci">'+ICON[d.k]+'</span>':'')+'<span>'+(t==='ch'?d.name:(t==='bad'?d.bad:d.good))+'</span>';
      b.addEventListener('mouseenter',function(){ stopTour(); if(!lock) setActive(d.k); });
      b.addEventListener('click',function(){ stopTour(); lock=(lock===d.k?null:d.k); setActive(d.k); });
      map.appendChild(b); nodes[d.k+t]=b;
    });
    ['a','b','c'].forEach(function(seg){
      var l=document.createElementNS(SVGNS,'path');
      l.setAttribute('class','cm-wire'); l.setAttribute('fill','none');
      l.style.setProperty('--lc',d.c); wires.appendChild(l); lines[d.k+seg]=l;
    });
  });
  // corner connectors (2 per corner) + panel link + the two section arc bands
  var cornerLines=[], plink=document.createElementNS(SVGNS,'polyline');
  for(var ci=0;ci<2;ci++){ var cl=document.createElementNS(SVGNS,'path'); cl.setAttribute('class','cm-cl'+(ci>0?' gl':'')); cl.setAttribute('fill','none'); wires.appendChild(cl); cornerLines.push(cl); }
  plink.setAttribute('class','cm-plink'); plink.setAttribute('fill','none'); wires.appendChild(plink);

  map.addEventListener('mouseleave',function(){ if(!lock) clearActive(); });
  map.addEventListener('click',function(e){ if(e.target===map){ stopTour(); clearActive(); } });
  var hubEl=document.getElementById('cmHub');
  hubEl.addEventListener('click',function(){ stopTour(); clearActive(); });
  hubEl.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); stopTour(); clearActive(); } });

  function layout(){
    if(!map.offsetParent) return;
    var W=map.clientWidth, H=map.clientHeight, cx=W/2, cy=H/2;
    var ns=Math.max(.6,Math.min(1,Math.min(H/600,W/980)));
    map.style.setProperty('--hx',cx+'px'); map.style.setProperty('--hy',cy+'px');
    map.style.setProperty('--ns',ns);
    var Rx=cx-66*ns-20, Ry=cy-26*ns-10;
    var pts={};
    var bodies=[];
    CH.forEach(function(d,idx){
      var P=function(f,ang){ var r=(ang||d.a)*Math.PI/180; return [cx+Math.cos(r)*Rx*f, cy-Math.sin(r)*Ry*f]; };
      var p1=P(.45), p2=P(.72,d.aB), p3=P(1.0,d.aG), h=P(.17);
      pts[d.k]={p1:p1,p2:p2,p3:p3,h:h};
      [['ch',p1],['bad',p2],['good',p3]].forEach(function(pair){
        var n=nodes[d.k+pair[0]];
        bodies.push({k:d.k,t:pair[0],el:n,x:pair[1][0],y:pair[1][1],sh:(pair[0]==='ch'?'c':'r'),
                     hw:n.offsetWidth/2,hh:n.offsetHeight/2});
      });
    });
    /* fixed obstacles: round hub + round corner bubbles, rectangular section pills */
    var roundObs=[{x:cx,y:cy,rad:71*ns+6}];
    ['cmCornerBad','cmCornerGood'].forEach(function(id){
      var r=document.getElementById(id).__zrect(), mb=map.__zrect();
      roundObs.push({x:r.left-mb.left+r.width/2,y:r.top-mb.top+r.height/2,rad:r.width/2+5});
    });
    /* relaxation: circles push radially, rectangles push on the tighter axis */
    var GAP=12;
    for(var it=0;it<60;it++){
      var moved=false;
      for(var i=0;i<bodies.length;i++){
        for(var j=i+1;j<bodies.length;j++){
          var A=bodies[i],B=bodies[j];
          if(A.sh==='c'&&B.sh==='c'){
            var dx=B.x-A.x, dy=B.y-A.y, dd=Math.hypot(dx,dy)||.01;
            var need=A.hw+B.hw+GAP;
            if(dd<need){ moved=true; var push=(need-dd)/2; A.x-=dx/dd*push; A.y-=dy/dd*push; B.x+=dx/dd*push; B.y+=dy/dd*push; }
          } else {
            var dx2=B.x-A.x, dy2=B.y-A.y;
            var ox=(A.hw+B.hw+GAP)-Math.abs(dx2), oy=(A.hh+B.hh+GAP)-Math.abs(dy2);
            if(ox>0&&oy>0){
              moved=true;
              if(ox<oy){ var sx=(dx2<0?-1:1)*ox/2; A.x-=sx; B.x+=sx; }
              else     { var sy=(dy2<0?-1:1)*oy/2; A.y-=sy; B.y+=sy; }
            }
          }
        }
        var A1=bodies[i];
        for(var o=0;o<roundObs.length;o++){
          var O=roundObs[o];
          var px=Math.max(A1.x-A1.hw,Math.min(O.x,A1.x+A1.hw));
          var py=Math.max(A1.y-A1.hh,Math.min(O.y,A1.y+A1.hh));
          var dxo=px-O.x, dyo=py-O.y, ddo=Math.hypot(dxo,dyo);
          if(ddo<O.rad+4){
            moved=true;
            var ux=(A1.x-O.x), uy=(A1.y-O.y), ud=Math.hypot(ux,uy)||.01;
            var pushO=(O.rad+4-ddo);
            A1.x+=ux/ud*pushO; A1.y+=uy/ud*pushO;
          }
        }
        A1.x=Math.min(Math.max(A1.x,A1.hw+2),W-A1.hw-2);
        A1.y=Math.min(Math.max(A1.y,A1.hh+2),H-A1.hh-2);
      }
      if(!moved) break;
    }
    bodies.forEach(function(bd){
      bd.el.style.left=bd.x+'px'; bd.el.style.top=bd.y+'px';
      pts[bd.k]['p'+(bd.t==='ch'?1:bd.t==='bad'?2:3)]=[bd.x,bd.y];
    });
    /* curved wire helper: a soft bow away from the hub, like routed cabling */
    function curveD(pa,pb){
      var mx=(pa[0]+pb[0])/2, my=(pa[1]+pb[1])/2;
      var dx=pb[0]-pa[0], dy=pb[1]-pa[1], len=Math.hypot(dx,dy)||1;
      var px=-dy/len, py=dx/len;
      var ox=mx-cx, oy=my-cy;
      var sign=(px*ox+py*oy)>=0?1:-1;
      var k=Math.min(24,len*.22)*sign;
      return 'M '+pa[0].toFixed(1)+' '+pa[1].toFixed(1)+' Q '+(mx+px*k).toFixed(1)+' '+(my+py*k).toFixed(1)+' '+pb[0].toFixed(1)+' '+pb[1].toFixed(1);
    }
    CH.forEach(function(d){
      var q=pts[d.k];
      var seg=function(sg,pa,pb){ lines[d.k+sg].setAttribute('d',curveD(pa,pb)); };
      seg('a',q.h,q.p1); seg('b',q.p1,q.p2); seg('c',q.p2,q.p3);
    });
    // corner bubbles connect to their two nearest family nodes
    var cb=document.getElementById('cmCornerBad').__zrect(), mb=map.__zrect();
    var cg=document.getElementById('cmCornerGood').__zrect();
    var bC=[cb.left-mb.left+cb.width/2, cb.top-mb.top+cb.height/2];
    var gC=[cg.left-mb.left+cg.width/2, cg.top-mb.top+cg.height/2];
    var near=function(c,t){ return CH.map(function(d){var p=t==='bad'?pts[d.k].p2:pts[d.k].p3;
        return {p:p,d:Math.hypot(p[0]-c[0],p[1]-c[1])};}).sort(function(a,b){return a.d-b.d;}).slice(0,1); };
    near(bC,'bad').forEach(function(n){ cornerLines[0].setAttribute('d',curveD(bC,n.p)); });
    near(gC,'good').forEach(function(n){ cornerLines[1].setAttribute('d',curveD(gC,n.p)); });
    if(lock) drawPanelLink(lock); 
  }
  function drawPanelLink(k){
    var n=nodes[k+'ch'].__zrect(), mb=map.__zrect(), pb=panel.__zrect();
    var x1=n.left-mb.left+n.width/2+n.width*0.45, y1=n.top-mb.top+n.height/2;
    var x2=pb.left-mb.left, y2=Math.min(Math.max(y1,70),mb.height-70);
    var midx=x2-26;
    plink.setAttribute('points',[x1,y1,midx,y1,midx,y2,x2,y2].join(','));
    plink.classList.add('on');
    var d=CH.find(function(x){return x.k===k;});
    plink.style.setProperty('--lc',d.c);
    panel.style.setProperty('--ay',(y2-(pb.top-mb.top)-15)+'px');
  }
  function setActive(k){
    var d=CH.find(function(x){return x.k===k;});
    stage.classList.add('hasAct'); stage.classList.remove('allBad','allGood');
    CH.forEach(function(x){
      ['ch','bad','good'].forEach(function(t){ nodes[x.k+t].classList.toggle('act',x.k===k); });
      ['a','b','c'].forEach(function(sg){ lines[x.k+sg].classList.toggle('act',x.k===k); });
    });
    drawPanelLink(k);
    panel.classList.remove('swap'); void panel.offsetWidth; panel.classList.add('swap');
    panel.style.setProperty('--c',d.c);
    panel.innerHTML=
      '<span class="cm-p-tag">'+(d.k==='ev'?'The source &middot; leadership sets the story':(d.side==='int'?'Internal channel &middot; builds the team':'External channel &middot; builds the market'))+(lock===k?' &middot; pinned':'')+'</span>'+
      '<div class="cm-p-name"><span class="cm-p-ic">'+ICON[d.k]+'</span>'+d.name+'</div>'+
      '<div class="cm-p-desc">'+d.desc+'</div>'+
      '<div class="cm-p-card cm-p-bad"><b>&#10007; Obscurity sounds like</b>'+d.bad+'</div>'+
      '<div class="cm-p-card cm-p-good"><b>&#10003; Clarity looks like</b>'+d.good+'</div>'+
      '<div class="cm-p-move"><b>The move:</b> '+d.move+'</div>';
  }
  function cornerLink(which){
    var el=document.getElementById(which==='bad'?'cmCornerBad':'cmCornerGood');
    var n=el.__zrect(), mb=map.__zrect(), pb=panel.__zrect();
    var x1=n.left-mb.left+n.width*(which==='bad'?0.92:0.86), y1=n.top-mb.top+n.height*0.62;
    var x2=pb.left-mb.left, y2=Math.min(Math.max(y1,70),mb.height-70);
    var midx=x2-26;
    plink.setAttribute('points',[x1,y1,midx,y1,midx,y2,x2,y2].join(','));
    plink.style.setProperty('--lc', which==='bad'?'#FB7185':'#818CF8');
    plink.classList.add('on');
    panel.style.setProperty('--ay',(y2-(pb.top-mb.top)-15)+'px');
  }
  function showCorner(which,fromPin){
    stopTour(); if(lock && !fromPin) return;
    stage.classList.add(which==='bad'?'allBad':'allGood'); stage.classList.remove(which==='bad'?'allGood':'allBad','hasAct');
    Object.keys(nodes).forEach(function(n){nodes[n].classList.remove('act');});
    Object.keys(lines).forEach(function(n){lines[n].classList.remove('act');});
    cornerLink(which);
    panel.classList.remove('swap'); void panel.offsetWidth; panel.classList.add('swap');
    var bad=which==='bad';
    panel.style.setProperty('--c', bad?'#FB7185':'#818CF8');
    panel.innerHTML=
      '<span class="cm-p-tag">'+(bad?'The failure state':'The goal state')+'</span>'+
      '<div class="cm-p-name">'+(bad?'Obscurity':'Clarity')+'</div>'+
      '<div class="cm-p-desc">'+(bad
        ?'Being unclear, difficult to understand, or not easily recognised. The condition of being unknown, lacking prominence. Every red bubble is a channel speaking in obscurity.'
        :'Being clear, transparent and easily understood. Expressed so it is easy to perceive, free from confusion or ambiguity. Every blue bubble is a channel speaking with clarity.')+'</div>'+
      '<div class="cm-p-move"><b>'+(bad?'The cost:':'The payoff:')+'</b> '+(bad?'the market cannot buy what it cannot place. Obscure brands compete on price.':'clear brands get chosen before the price question. <b>Clarity compounds.</b>')+'</div>';
  }
  document.getElementById('cmCornerBad').addEventListener('mouseenter',function(){showCorner('bad');});
  document.getElementById('cmCornerGood').addEventListener('mouseenter',function(){showCorner('good');});
  document.getElementById('cmCornerBad').addEventListener('click',function(){ lock=(lock==='bad*'?null:'bad*'); if(lock) showCorner('bad',true); else clearActive(); });
  document.getElementById('cmCornerGood').addEventListener('click',function(){ lock=(lock==='good*'?null:'good*'); if(lock) showCorner('good',true); else clearActive(); });
  function clearActive(){
    lock=null; stage.classList.remove('hasAct','allBad','allGood');
    Object.keys(nodes).forEach(function(n){nodes[n].classList.remove('act');});
    Object.keys(lines).forEach(function(n){lines[n].classList.remove('act');});
    plink.classList.remove('on');
    defaultPanel();
  }
  function defaultPanel(){
    panel.classList.remove('swap'); void panel.offsetWidth; panel.classList.add('swap');
    panel.style.setProperty('--c','#34D399');
    panel.innerHTML=
      '<span class="cm-p-tag">The clarity test</span>'+
      '<div class="cm-p-name">Hover any channel</div>'+
      '<div class="cm-p-desc">Nine channels, one test: does this build clarity or breed obscurity? Hover the corner bubbles to light up each family.</div>'+
      '<div class="cm-p-card cm-p-bad"><b>&#10007; Obscurity</b>Unclear, hard to process. The brand stays unknown.</div>'+
      '<div class="cm-p-card cm-p-good"><b>&#10003; Clarity</b>Easy to perceive, free of confusion. The brand compounds.</div>'+
      '<button class="cm-tour" id="cmTour">&#9654; Tour the nine channels</button>';
    document.getElementById('cmTour').addEventListener('click',toggleTour);
  }
  function toggleTour(){
    if(tourTmr) return stopTour(true);
    tourIdx=0;
    var step=function(){ setActive(CH[tourIdx].k); tourIdx=(tourIdx+1)%CH.length; };
    step(); tourTmr=setInterval(step,2000);
  }
  function stopTour(reset){
    if(tourTmr){ clearInterval(tourTmr); tourTmr=null; if(reset) clearActive(); }
  }
  var list=document.getElementById('cmList');
  ['int','ext'].forEach(function(side){
    var h=document.createElement('div'); h.className='cm-grp-h';
    h.textContent=(side==='int'?'Internal · builds the team':'External · builds the market');
    list.appendChild(h);
    CH.filter(function(d){return d.side===side;}).forEach(function(d){
      var det=document.createElement('details'); det.className='cm-li'; det.style.setProperty('--c',d.c);
      det.innerHTML='<summary><span class="cm-li-ic">'+ICON[d.k]+'</span>'+d.name+'<i>+</i></summary>'+
        '<div class="cm-li-body"><div class="cm-li-d">'+d.desc+'</div>'+
        '<div class="cm-p-card cm-p-bad"><b>&#10007; Obscurity</b>'+d.bad+'</div>'+
        '<div class="cm-p-card cm-p-good"><b>&#10003; Clarity</b>'+d.good+'</div>'+
        '<div class="cm-p-move" style="--c:'+d.c+'"><b>The move:</b> '+d.move+'</div></div>';
      list.appendChild(det);
    });
  });
  layout(); defaultPanel();
  window.addEventListener('resize',layout);
  new ResizeObserver(layout).observe(map);
};

/* ===== 3D WebGL funnel (Three.js) for Niche Down ===== */
window.__buildNicheGL=function(){
  var canvas=document.getElementById('nicheGL'); if(!canvas||!window.THREE)return;
  var T=window.THREE;
  if(window.__nicheGLraf)cancelAnimationFrame(window.__nicheGLraf);
  if(window.__nicheGLrenderer){try{window.__nicheGLrenderer.dispose();window.__nicheGLrenderer.forceContextLoss();}catch(e){}}
  function size(){return [canvas.clientWidth||560, canvas.clientHeight||440];}
  var wh=size(),W=wh[0],H=wh[1];
  var renderer=new T.WebGLRenderer({canvas:canvas,antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
  renderer.setSize(W,H,false);
  window.__nicheGLrenderer=renderer;
  var scene=new T.Scene();
  var camera=new T.PerspectiveCamera(38,W/H,0.1,100);
  camera.position.set(0,1.9,8.6); camera.lookAt(0,-0.2,0);
  scene.add(new T.AmbientLight(0xffffff,0.62));
  var key=new T.DirectionalLight(0xffffff,1.2); key.position.set(5,9,7); scene.add(key);
  var fill=new T.DirectionalLight(0xbcd0ff,0.5); fill.position.set(-6,2,4); scene.add(fill);
  var rim=new T.DirectionalLight(0xffffff,0.65); rim.position.set(0,3,-9); scene.add(rim);
  var levels=[
    {c:0x2B4BFF,rt:2.5,rb:2.05},{c:0xE0A82E,rt:2.05,rb:1.6},{c:0xE0334B,rt:1.6,rb:1.18},{c:0x9B27D6,rt:1.18,rb:0.78},{c:0x2B9E3A,rt:0.78,rb:0.42}
  ];
  var group=new T.Group();
  var segH=0.86,gap=0.05,total=levels.length*(segH+gap);
  levels.forEach(function(L,i){
    var geo=new T.CylinderGeometry(L.rt,L.rb,segH,80,1,false);
    var mat=new T.MeshStandardMaterial({color:L.c,metalness:0.42,roughness:0.26,emissive:L.c,emissiveIntensity:0.06});
    var m=new T.Mesh(geo,mat);
    m.position.y=total/2 - i*(segH+gap) - segH/2;
    group.add(m);
    var ring=new T.Mesh(new T.TorusGeometry(L.rt,0.018,8,80),new T.MeshStandardMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:0.3,metalness:0,roughness:0.4}));
    ring.rotation.x=Math.PI/2; ring.position.y=m.position.y+segH/2; group.add(ring);
  });
  group.position.y=-0.2; group.rotation.x=0.05;
  scene.add(group);
  function tick(){
    group.rotation.y+=0.006;
    var w2=size(); if(w2[0]!==W||w2[1]!==H){W=w2[0];H=w2[1];renderer.setSize(W,H,false);camera.aspect=W/H;camera.updateProjectionMatrix();}
    renderer.render(scene,camera);
    window.__nicheGLraf=requestAnimationFrame(tick);
  }
  tick();
};
