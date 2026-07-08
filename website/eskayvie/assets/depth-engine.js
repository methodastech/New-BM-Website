(function(){
  "use strict";
  /* ESKAYVIE MINDTROPIC :: DEPTH ENGINE v1 (single IIFE).
     One rAF scroll loop drives data-par parallax, orb drift, framed
     media drift and the progress bar. A separate IO drives kinetic
     reveals. Auto wires across sections, skipping every legacy hook. */
  var DOC=document, WIN=window, HTML=DOC.documentElement;
  var REDUCE = (WIN.matchMedia && WIN.matchMedia("(prefers-reduced-motion: reduce)").matches)
            || HTML.hasAttribute("data-depth-off");
  var FINE = WIN.matchMedia && WIN.matchMedia("(pointer: fine)").matches;

  /* legacy owned elements we must never bind */
  var SKIP_SEL=".reveal,.hb-parallax,.tm-row,[data-count],#tl,#tlfill,.tlfill";
  function inSkip(el){ return !!(el && el.closest && el.closest(SKIP_SEL)); }
  function isReveal(el){ return !!(el.classList && el.classList.contains("reveal")); }

  /* progress bar (one, at very top of body) */
  var bar=DOC.createElement("div"); bar.className="dx-bar";
  var barI=DOC.createElement("i"); bar.appendChild(barI);
  DOC.body.insertBefore(bar, DOC.body.firstChild);

  /* loop collections */
  var parItems=[], orbItems=[], driftItems=[];

  function addPar(el, speed){
    if(!el || el.__dxPar || isReveal(el)) return;
    el.__dxPar=1; el.classList.add("dx-par");
    parItems.push({el:el, speed:speed});
  }

  /* auto orbs per section */
  var ORB_TINT=["dx-orb-violet","dx-orb-leaf","dx-orb-gold"];
  function makeOrbs(sec, idx){
    if(sec.hasAttribute("data-no-orb")) return;
    var host=DOC.createElement("div"); host.className="dx-orbs"; host.setAttribute("aria-hidden","true");
    var a=DOC.createElement("span"), b=DOC.createElement("span");
    a.className="dx-orb "+ORB_TINT[idx%3];
    b.className="dx-orb "+ORB_TINT[(idx+1)%3];
    a.style.cssText="top:-6%;left:-8%;width:42vmax;height:42vmax";
    b.style.cssText="bottom:-10%;right:-6%;width:34vmax;height:34vmax";
    host.appendChild(a); host.appendChild(b);
    sec.insertBefore(host, sec.firstChild);
    if(!REDUCE){ orbItems.push({el:a,speed:0.06}); orbItems.push({el:b,speed:-0.05}); }
  }

  /* framed media drift */
  function frameMedia(img){
    if(img.__dxFr) return;
    if(/dx-no-clip|logo|icon|seal|brandmark/i.test(img.className)) return;
    var w=img.closest("figure,.frame,.dx-frame");
    if(!w){ var p=img.parentElement; if(!p) return;
      w=DOC.createElement("span"); w.className="dx-frame"; p.insertBefore(w,img); w.appendChild(img); }
    w.classList.add("dx-frame");
    img.__dxFr=1; img.classList.add("dx-frmedia");
    if(!REDUCE) driftItems.push({el:img,speed:0.05});
  }

  /* kinetic reveal (own IO and class namespace) */
  var rvIO=null;
  function hasRvVariant(el){
    var c=el.classList;
    return c.contains("rv-up")||c.contains("rv-left")||c.contains("rv-right")||
           c.contains("rv-scale")||c.contains("rv-blur")||c.contains("rv-clip")||c.contains("rv");
  }
  function tagReveal(el, delay){
    if(el.__dxRv || isReveal(el)) return;
    el.__dxRv=1; el.classList.add("dx-rv");
    if(!hasRvVariant(el)) el.classList.add("rv-up");
    if(delay) el.style.setProperty("--dx-d", delay+"ms");
    if(REDUCE){ el.classList.add("dx-in"); return; }
    if(rvIO) rvIO.observe(el); else el.classList.add("dx-in");
  }
  function buildIO(){
    if(REDUCE || !("IntersectionObserver" in WIN)) return;
    rvIO=new IntersectionObserver(function(ents){
      for(var i=0;i<ents.length;i++){ var e=ents[i];
        if(e.isIntersecting){ e.target.classList.add("dx-in"); rvIO.unobserve(e.target); } }
    },{rootMargin:"0px 0px -10% 0px", threshold:0.12});
  }

  /* sibling card stagger (explicit selectors + structural heuristic) */
  var ROW_SEL=".cards,.tiers,.actives,.range,.badges,.cert-row,[data-cards],[data-rv-stagger]";
  function sig(el){
    var c=(el.className||"").trim().split(/\s+/).slice(0,2).join(".");
    return el.tagName+(c?"."+c:"");
  }
  function staggerGroup(parent){
    if(parent.__dxStg) return;
    var kids=[], n=parent.children, i;
    for(i=0;i<n.length;i++){ if(n[i].nodeType===1) kids.push(n[i]); }
    if(kids.length<3) return;
    var map={}, best=0, bestSig="";
    for(i=0;i<kids.length;i++){ var s=sig(kids[i]); map[s]=(map[s]||0)+1; if(map[s]>best){best=map[s];bestSig=s;} }
    if(best<3) return;
    parent.__dxStg=1;
    var step=parseInt(parent.getAttribute("data-rv-stagger"),10); if(isNaN(step)) step=90;
    var order=0;
    for(i=0;i<kids.length;i++){ var k=kids[i];
      if(sig(k)!==bestSig) continue;
      if(isReveal(k) || inSkip(k) || k.__dxRv) continue;
      tagReveal(k, order*step); order++;
    }
  }

  /* tilt on hover */
  function bindTilt(el){
    if(el.__dxTilt || el.hasAttribute("data-no-tilt") || inSkip(el)) return;
    el.__dxTilt=1; el.classList.add("dx-tilt");
    var raf=0, rx=0, ry=0;
    function apply(){ raf=0; el.style.setProperty("--dx-rx",rx.toFixed(2)+"deg"); el.style.setProperty("--dx-ry",ry.toFixed(2)+"deg"); }
    el.addEventListener("pointermove",function(ev){
      var r=el.getBoundingClientRect();
      ry=((ev.clientX-r.left)/r.width-0.5)*6;
      rx=-((ev.clientY-r.top)/r.height-0.5)*6;
      if(!raf) raf=requestAnimationFrame(apply);
    });
    el.addEventListener("pointerleave",function(){
      if(raf)cancelAnimationFrame(raf); raf=0;
      el.style.setProperty("--dx-rx","0deg"); el.style.setProperty("--dx-ry","0deg");
    });
  }

  /* auto wiring across the page */
  var TILT_SEL=".tier,.pcard,.acard,.card,.tile,[data-tilt],.tilt";
  function autowire(){
    [].forEach.call(DOC.querySelectorAll("section"),function(sec,idx){
      if(WIN.getComputedStyle(sec).position==="static") sec.style.position="relative";
      sec.classList.add("dx-host");
      makeOrbs(sec,idx);
      [].forEach.call(sec.querySelectorAll("h2,.shead"),function(h){
        if(isReveal(h)||inSkip(h)) return;
        tagReveal(h,0);
        if(h.tagName==="H2") h.classList.add("dx-h2");
      });
    });

    [].forEach.call(DOC.querySelectorAll(ROW_SEL),function(r){ if(!inSkip(r)) staggerGroup(r); });
    [].forEach.call(DOC.querySelectorAll("section .wrap > *"),function(grp){
      if(grp.children && grp.children.length>=3 && !inSkip(grp)) staggerGroup(grp);
    });

    [].forEach.call(DOC.querySelectorAll("figure img,.frame img,.dx-frame img"),frameMedia);

    [].forEach.call(DOC.querySelectorAll("[data-par]"),function(el){
      if(el.__dxPar||isReveal(el)||inSkip(el)) return;
      var v=parseFloat(el.getAttribute("data-par")); if(isNaN(v)) v=0.1;
      addPar(el,v);
    });

    if(FINE && !REDUCE){
      [].forEach.call(DOC.querySelectorAll(TILT_SEL),function(el){ if(!inSkip(el)) bindTilt(el); });
    }
  }

  /* single rAF scroll loop */
  var vh=WIN.innerHeight||HTML.clientHeight, ticking=false;
  function frame(){
    ticking=false;
    var sc=WIN.pageYOffset||HTML.scrollTop||0;
    var max=(HTML.scrollHeight-vh)||1;
    barI.style.transform="scaleX("+Math.max(0,Math.min(1,sc/max))+")";
    if(REDUCE) return;
    var i, it, r, off;
    for(i=0;i<parItems.length;i++){ it=parItems[i]; r=it.el.getBoundingClientRect();
      off=(r.top+r.height/2 - vh/2);
      it.el.style.transform="translate3d(0,"+(off*it.speed).toFixed(2)+"px,0)"; }
    for(i=0;i<orbItems.length;i++){ it=orbItems[i]; r=it.el.getBoundingClientRect();
      off=(r.top+r.height/2 - vh/2);
      it.el.style.transform="translate3d(0,"+(off*it.speed).toFixed(2)+"px,0)"; }
    for(i=0;i<driftItems.length;i++){ it=driftItems[i]; r=it.el.getBoundingClientRect();
      off=(r.top+r.height/2 - vh/2);
      it.el.style.transform="translate3d(0,"+(off*it.speed).toFixed(2)+"px,0) scale(1.14)"; }
  }
  function onScroll(){ if(!ticking){ ticking=true; requestAnimationFrame(frame); } }
  function onResize(){ vh=WIN.innerHeight||HTML.clientHeight; onScroll(); }

  function init(){
    buildIO();
    autowire();
    if(REDUCE){
      [].forEach.call(DOC.querySelectorAll(".dx-rv"),function(e){e.classList.add("dx-in");});
      frame();
      return;
    }
    WIN.addEventListener("scroll",onScroll,{passive:true});
    WIN.addEventListener("resize",onResize,{passive:true});
    frame();
  }
  if(DOC.readyState==="loading") DOC.addEventListener("DOMContentLoaded",init);
  else init();
})();
