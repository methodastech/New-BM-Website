/* Home page scenes: every inline script from _source/index.html, ported verbatim per src/CONVERSION.md.
   Shell-owned scripts (nav hide/float, burger drawer, Lenis, universal search, BM ribbon, bmBack/embedded)
   are omitted here; the Shell/Nav/Footer components own them.
   Contract adaptations only: THREE loads from the bundled module (no CDN ladder), GSAP/ScrollTrigger are
   imported (window.* feature checks removed), and every window/document listener, observer, timer, rAF loop
   and WebGL renderer is registered through tiny helpers so the returned cleanup can tear the page down. */
import * as THREE_MOD from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

export default function initHome(){
var dead=false;
var _cleanups=[],_obs=[],_ivs=[],_tos=[],_renderers=[];
function _raf(f){ if(dead) return 0; return requestAnimationFrame(function(ts){ if(dead) return; f(ts); }); }
function onWin(t,f,o){ window.addEventListener(t,f,o); _cleanups.push(function(){ window.removeEventListener(t,f,o); }); }
function onDoc(t,f,o){ document.addEventListener(t,f,o); _cleanups.push(function(){ document.removeEventListener(t,f,o); }); }
function _io(cb,opt){ var o=new IntersectionObserver(cb,opt); _obs.push(o); return o; }
function _ro(cb){ var o=new ResizeObserver(cb); _obs.push(o); return o; }
function _setIv(f,ms){ var id=setInterval(f,ms); _ivs.push(id); return id; }
function _setTo(f,ms){ var id=setTimeout(f,ms); _tos.push(id); return id; }
function _reg(r){ _renderers.push(r); return r; }
/* the homepage's own design tokens are scoped to this class (see styles/home.css) */
document.body.classList.add('page-home');

/* This is a scroll-narrative page with a pinned 960vh showpiece. If the browser restores a deep
   scroll position on reload, ScrollTrigger measures that section before the scroll settles and its
   start/end land wrong (negative), so the cleanroom never assembles or reverses. Always start at the
   top so every measurement has a clean baseline. */
if('scrollRestoration' in history){ try{ history.scrollRestoration='manual'; }catch(e){} }
(function(){
  var el=document.getElementById('loader'); if(!el) return;
  document.documentElement.classList.add('is-loading');
  var reduceL=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
  var t0=performance.now(), MIN=1150, CAP=4200, done=false, raf=null;
  var pct=document.getElementById('ldPct'), lf=document.getElementById('ldLogoFill');
  var loaded=document.readyState==='complete'; onWin('load',function(){loaded=true;});/* SPA: window load never re-fires on client-side navigation */
  function realProgress(){
    if(loaded) return 1;
    var imgs=document.images, tot=imgs.length||1, ok=0;
    for(var i=0;i<imgs.length;i++) if(imgs[i].complete) ok++;
    var rs=document.readyState==='complete'?1:document.readyState==='interactive'?0.55:0.25;
    return Math.min(0.96, 0.35*rs + 0.65*(ok/tot));
  }
  function dismiss(){
    if(done) return; done=true;
    if(raf) cancelAnimationFrame(raf);
    el.classList.add('ld-done');
    document.documentElement.classList.remove('is-loading');
    /* the is-loading overflow lock can poison ScrollTrigger's initial measurements:
       re-measure everything now that the page is scrollable and layout is final */
    _setTo(function(){ try{ ScrollTrigger.refresh(); }catch(e){} },60);
    /* signal the hero reveal to play now that the loader is lifting. Single source of truth: the
       main script owns the tween AND a hard fallback settle, so a frozen ticker can never strand it. */
    try{ window.dispatchEvent(new Event('iaq:loaderdone')); }catch(e){}
    _setTo(function(){ el.style.display='none';/* React owns this node; removing it breaks unmount */
      /* release the preloader's WebGL context immediately (don't leave it for GC) so the page carries one fewer live context */
      try{ var lc=document.getElementById('loaderCv'); if(lc){ var lg=lc.getContext('webgl2')||lc.getContext('webgl'); var ext=lg&&lg.getExtension('WEBGL_lose_context'); if(ext)ext.loseContext(); } }catch(e){}
    },1350);
  }
  window.__iaqLoaderDismiss=dismiss;
  _setTo(dismiss, CAP);
  el.addEventListener('click', dismiss);
  if(reduceL){ _setTo(dismiss, 650); return; }
  function fallback(){ _setTo(dismiss, Math.max(0, MIN-(performance.now()-t0))); }
  var LAND='ffffffffffffffffffffffffffffffffffffffffffffffff|000000000000000000000000000000000000000000000000|800000000000000000000000000000000000000000000000|800000000000000000000000000000000000000000000001|8000000000000000003f8000000000000000000000000001|800000000000ffc1fffff000000000000000000000000001|8000000000001f1ffffff800009000000000000000000001|0000000040007c1ffffffc00000000000000070000000001|80000000090198003ffffc00000000008007fff0007c0001|80000003e00000003ffff800000000040ffffffff87f8001|800e000037067f8007ffd0000000000c1ffffffffffffc01|80ffffff3fcb19f017ffc000007fc007ffffffffffffffff|e0fffffff7dff0780ffc000001fffdffffffffffffffffff|98fffffffffff0780fc00f0003ffffffffffffffffffffff|80ffffffffff003807c006000fffffffffffffffffffffff|80fffffffffe01c0038000001fdffffffffffffffffffff8|80ff93fffffc01e0000000001fdfffffffffffffffffc701|000e00fffffe01fe000000060f9fffffffffffffffe01e01|0010007fffffc1ff000000060f1fffffffffffffff803c00|8000001ffffffbffc000001f0fffffffffffffffffc03801|8000000fffffffffc000001ffffffffffffffffffff01001|8000000fffffffff60000003fffffffffffffffffff00001|00000003ffffbffc70000003ffffffffffffffffffd00001|80000003ffffdffc10000001ffffffffffffffffffd00001|80000003fffff7fe00000001feff3fffffffffffff900001|80000003ffffffe00000001fc37e03cffffffffffc100001|80000003ffffffc00000001f80bfffcffffffffff8200001|80000003ffffff800000001f0013ffcffffffffff0200001|80000001ffffff000000001e7901ffffffffffffb8600001|80000000ffffff0000000007fc001fffffffffff13c00001|800000003ffffc000000000ffc003fffffffffff86000001|800000003ffff8000000001fff3c3fffffffffff80000001|800000000fff98000000003fffffffffffffffff80000001|800000001ff80c000000007fffffdfcfffffffff00000001|8000000003f80400000000ffffffcfe1fffffffe00000001|8000000001f00000000001ffffffeffe0ffffffe80000001|8000000000f04e00000001fffffff7fe07fffff000000001|8000000000f8c020000001fffffff7fe03fc7f2000000001|80000000007fc048000001fffffff3fc03f83f0080000001|80000000001fc000000001fffffffbf001e03f8180000001|800000000001f000000001ffffffffc001e00fc080000001|8000000000003000000001fffffffe0000c00bc040000001|80000000000030f3000000fffffffee000c0098040000001|8000000000001fff8000007fffffffe00060080060000001|80000000000001ffc000003fffffffc00020040060000001|80000000000001fff80000181fffffc00000160e00000001|80000000000001fffc00000007ffff8000000e1e00000001|80000000000003fffe00000007ffff0000000e3e00000001|80000000000007ffff00000007fffe000000073d82000001|80000000000007ffffe0000007fffc00000007bd8be00001|80000000000007fffff0000003fff8000000010100f80001|80000000000007fffffc000003fff80000000050007d0001|80000000000003fffffc000001fff8000000000020360001|80000000000001fffff8000001fffc000000000000010001|80000000000001fffff0000001fffc000000000007100000|80000000000000ffffe0000003fffc60000000001f100001|800000000000007fffe0000003fff8e0000000003f980001|800000000000003fffe0000003fff1c0000000007ffc0002|000000000000001fffe0000001ffe1c000000000fffe0000|000000000000001fffc0000001ffe1c000000007fffe0000|800000000000001fff00000001ffe1800000000fffff0001|800000000000003ffc00000000ffc0000000000fffff8001|800000000000003ffc00000000ffc0000000000fffff8001|800000000000003ffc000000007f800000000007ffff8001|000000000000003ff8000000007f000000000007ffff8001|800000000000003ff0000000003e000000000007c1ff0001|800000000000003fe00000000000000000000002007f0000|800000000000007fc00000000000000000000000003e0004|800000000000007f0000000000000000000000000000000c|800000000000007e00000000000000000000000000000014|800000000000007c00000000000000000000000000040031|800000000000007800000000000000000000000000000061|80000000000000f800000000000000000000000000000001|80000000000000f800000000000000000000000000000001|80000000000000f000000000000000000000000000000000|800000000000007000000000000000000000000000000001|800000000000003800000000000000000000000000000001|800000000000000000000000000000000000000000000001|800000000000000000000000000000000000000000000001|800000000000000000000000000000000000000000000001|800000000000000000000000000000000000000000000000|800000000000000000000000000000000000000000000001|800000000000000100000000000000000000000000000000|8000000000000007000000000000001c00001f9c7fc00001|800000000000000f000000000000e3fffe7ffffffffff001|800000000000007f0000001fffffffffffffffffffffff81|80000000003c007f000001ffffffffffffffffffffffff81|8000312ffc7fffff00001ffffffffffffffffffffffffe01|800dfffffffffffff000fffffffffffffffffffffffffe41|f03fffffffffffffffffffffffffffffffffffffffffffff|ffffffffffffffffffffffffffffffffffffffffffffffff|ffffffffffffffffffffffffffffffffffffffffffffffff|ffffffffffffffffffffffffffffffffffffffffffffffff|ffffffffffffffffffffffffffffffffffffffffffffffff|ffffffffffffffffffffffffffffffffffffffffffffffff|ffffffffffffffffffffffffffffffffffffffffffffffff'.split('|');
  function init(T){
    var canvas=document.getElementById('loaderCv');
    var scene=new T.Scene();
    var camera=new T.PerspectiveCamera(46,1,0.1,60); camera.position.z=4.15;
    var renderer=_reg(new T.WebGLRenderer({canvas:canvas,antialias:true,alpha:true}));
    renderer.setClearColor(0x000000,0); renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));
    if(T.ColorManagement) T.ColorManagement.enabled=false;
    var GW=192,GH=96,R=1.58;
    function bit(y,x){ return (parseInt(LAND[y].charAt(x>>2),16)>>(3-(x&3)))&1; }
    function ll(lat,lon,r){var la=lat*Math.PI/180,lo=lon*Math.PI/180;
      return [r*Math.cos(la)*Math.cos(lo), r*Math.sin(la), -r*Math.cos(la)*Math.sin(lo)];}
    var tgt=[],y,x;
    for(y=1;y<GH;y++)for(x=1;x<GW-1;x++){
      if(!bit(y,x)) continue;
      var lat=90-((y+0.5)/GH)*180, lon=((x+0.5)/GW)*360-180;
      if(Math.random()>Math.cos(lat*Math.PI/180)*0.92+0.05) continue;
      var p3=ll(lat+(Math.random()-0.5)*1.4, lon+(Math.random()-0.5)*1.4, R);
      tgt.push(p3[0],p3[1],p3[2]);
    }
    var N=tgt.length/3;
    var start=new Float32Array(N*3), posn=new Float32Array(N*3), hs=new Float32Array(N);
    for(var k=0;k<N;k++){var o=k*3, a=Math.random()*6.2832, b=Math.acos(2*Math.random()-1), rr=3.0+Math.random()*1.8;
      start[o]=Math.sin(b)*Math.cos(a)*rr; start[o+1]=Math.cos(b)*rr*0.8; start[o+2]=Math.sin(b)*Math.sin(a)*rr;
      posn[o]=start[o]; posn[o+1]=start[o+1]; posn[o+2]=start[o+2]; hs[k]=Math.random();}
    var geo=new T.BufferGeometry();
    var attr=new T.BufferAttribute(posn,3); geo.setAttribute('position',attr);
    geo.setAttribute('aH',new T.BufferAttribute(hs,1));
    var mat=new T.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,blending:T.NormalBlending,
      uniforms:{uDpr:{value:Math.min(window.devicePixelRatio||1,1.75)},uT:{value:0}},
      vertexShader:'uniform float uDpr; attribute float aH; varying float vD; varying float vH;'+
        'void main(){ vec4 mv=modelViewMatrix*vec4(position,1.0); vD=-mv.z; vH=aH;'+
        ' gl_Position=projectionMatrix*mv; gl_PointSize=0.85*uDpr*(15.0/max(0.5,-mv.z)); }',
      fragmentShader:'precision mediump float; uniform float uT; varying float vD; varying float vH;'+
        'void main(){ vec2 c=gl_PointCoord-0.5; float d=length(c); if(d>0.5)discard;'+
        ' float al=smoothstep(0.5,0.24,d); float f=clamp((vD-2.6)/3.2,0.0,1.0);'+
        ' vec3 col=mix(vec3(0.86,0.9,0.98),vec3(0.42,0.5,0.66),f);'+
        ' float tw=0.88+0.12*sin(uT*1.6+vH*6.2832);'+
        ' al*=mix(0.95,0.12,f)*tw; gl_FragColor=vec4(col,al); }'});
    var g=new T.Group(); scene.add(g);
    g.add(new T.Points(geo,mat));
    /* offices pop in at the end */
    var OFF=[[3.1,101.7],[1.35,103.82],[-6.2,106.85],[21.03,105.85],[31.2,121.47],[25.03,121.56],[52.23,21.01],[50.11,8.68]];
    var mp=new Float32Array(OFF.length*3);
    OFF.forEach(function(of,i2){var p4=ll(of[0],of[1],R*1.02); mp[i2*3]=p4[0];mp[i2*3+1]=p4[1];mp[i2*3+2]=p4[2];});
    var mgeo=new T.BufferGeometry(); mgeo.setAttribute('position',new T.BufferAttribute(mp,3));
    var mmat=new T.PointsMaterial({color:0xEC2027,size:4.5,sizeAttenuation:false,transparent:true,opacity:0,depthTest:false});
    g.add(new T.Points(mgeo,mmat));
    var NAMES_L=['Malaysia · HQ','Singapore','Indonesia','Vietnam','China','Taiwan','Poland','Germany'];
    var tagEls=[],tagVs=[],prV=new T.Vector3();
    OFF.forEach(function(of,i2){ var d=document.createElement('div'); d.className='ld-tag'; d.textContent=NAMES_L[i2];
      el.appendChild(d); tagEls.push(d); tagVs.push(new T.Vector3(mp[i2*3],mp[i2*3+1],mp[i2*3+2])); });
    var HOME_X=10*Math.PI/180, HOME_Y=-Math.PI/2-100*Math.PI/180;
    g.rotation.x=HOME_X;
    function resize(){ var w=window.innerWidth, h=window.innerHeight;
      renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();
      camera.position.z=Math.max(4.55, 5.3-Math.min(1, w/h-1)*0.55); }
    resize(); onWin('resize',resize);
    var pd=0, pdLast=0;
    function frame(ts){ if(done) return; raf=_raf(frame);
      var t=performance.now()-t0;
      /* frame-rate independent easing: same feel on 60/120/144Hz, no micro-stutter */
      var dt=Math.min(0.05,Math.max(0.001,(t-pdLast)/1000)); pdLast=t;
      var floor2=Math.min(0.92, t/2600);
      var target=Math.max(realProgress(), floor2);
      pd+=(target-pd)*(1-Math.exp(-dt/0.22)); if(pd>0.9995) pd=1;
      for(var k2=0;k2<N;k2++){ var o2=k2*3;
        var e=(pd-hs[k2]*0.45)/0.55; e=e<0?0:e>1?1:e; e=e*e*(3-2*e);
        posn[o2]=start[o2]+(tgt[o2]-start[o2])*e;
        posn[o2+1]=start[o2+1]+(tgt[o2+1]-start[o2+1])*e;
        posn[o2+2]=start[o2+2]+(tgt[o2+2]-start[o2+2])*e;
      }
      attr.needsUpdate=true;
      mat.uniforms.uT.value=ts/1000;
      mmat.opacity=Math.max(0,(pd-0.78)/0.22)*(0.55+0.45*Math.abs(Math.sin(ts*0.004)));
      if(pd>0.82){ g.updateMatrixWorld();
        /* keep-out box around the centred IAQ logo + % so office tags never pile on top of it
           (SE-Asia offices project near screen centre where the logo sits) */
        var lr=lf&&lf.getBoundingClientRect(), pr=pct&&pct.getBoundingClientRect();
        var kx0=Math.min(lr?lr.left:9e9,pr?pr.left:9e9)-16, kx1=Math.max(lr?lr.right:-9e9,pr?pr.right:-9e9)+16;
        var ky0=(lr?lr.top:9e9)-14, ky1=(pr?pr.bottom:-9e9)+16;
        for(var i3=0;i3<tagEls.length;i3++){
          if(pd<0.82+i3*0.014){ tagEls[i3].style.opacity=0; continue; }
          prV.copy(tagVs[i3]).applyMatrix4(g.matrixWorld);
          var face=prV.z>0.18; prV.project(camera);
          var sx=(prV.x*0.5+0.5)*window.innerWidth, sy=(-prV.y*0.5+0.5)*window.innerHeight;
          tagEls[i3].style.transform='translate('+Math.round(sx+8)+'px,'+Math.round(sy-20)+'px)';
          var hitLogo=(sx>kx0&&sx<kx1&&sy>ky0&&sy<ky1);
          tagEls[i3].style.opacity=(face&&prV.z<1&&!hitLogo)?1:0;
        }
      } else for(var i4=0;i4<tagEls.length;i4++) tagEls[i4].style.opacity=0;
      g.rotation.y=HOME_Y-0.9+pd*0.9+ts*0.00002;
      var shown=Math.round(pd*100);
      if(pct) pct.textContent=shown+'%';
      if(lf) lf.style.setProperty('--fill',(pd*100).toFixed(1)+'%');
      renderer.render(scene,camera);
      if(pd>=1 && loaded){
        var e2=performance.now()-t0;
        _setTo(dismiss, Math.max(260, MIN-e2));
      }
    }
    raf=_raf(frame);
  }
  try{init(THREE_MOD);}catch(err){fallback();}
})();

document.documentElement.classList.add('js');
var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- laminar particle hero: cursor acts as an obstruction in the airflow ---- */
(function(){
  var cv=document.getElementById('heroCanvas'); if(!cv) return;
  var ctx; try{ ctx=cv.getContext('2d'); }catch(e){ return; }
  if(!ctx) return;
  var mob=window.innerWidth>0&&window.innerWidth<760, N=mob?60:150, dpr=Math.min(window.devicePixelRatio||1,1.5);/* DPR 2 = ~4x the pixels of 1x on a full-viewport canvas redrawn every frame: capped for scroll headroom */
  var W=0,H=0,parts=[],running=true,looping=false;
  var mx=-9999,my=-9999,R=110;
  cv.parentElement.addEventListener('pointermove',function(e){
    var r=cv.getBoundingClientRect(); mx=e.clientX-r.left; my=e.clientY-r.top;
  });
  cv.parentElement.addEventListener('pointerleave',function(){ mx=-9999; my=-9999; });
  function fit(){
    var w=cv.clientWidth,h=cv.clientHeight;
    if(!w||!h) return false;
    W=w;H=h;cv.width=w*dpr;cv.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    return true;
  }
  function seed(){
    parts=[];
    for(var i=0;i<N;i++)parts.push({x:Math.random()*W,y:Math.random()*H,v:.35+Math.random()*.75,ph:Math.random()*6.28,r:.8+Math.random()*1.5,red:Math.random()<.32});
  }
  function step(){
    ctx.clearRect(0,0,W,H);
    for(var i=0;i<parts.length;i++){
      var p=parts[i];
      var order=Math.min(1,Math.max(0,p.x/W));
      var wob=(1-order)*14;
      p.x+=p.v; p.ph+=.015;
      var y=p.y+Math.sin(p.ph+p.x*.01)*wob, x=p.x;
      /* the cursor is an obstruction: streamlines bend around it */
      var dx=x-mx,dy=y-my,d2=dx*dx+dy*dy;
      if(d2<R*R){
        var d=Math.sqrt(d2)||1,push=(1-d/R)*26;
        x+=dx/d*push; y+=dy/d*push;
      }
      if(p.x>W+8){p.x=-8;p.y=Math.random()*H;}
      var col=p.red?'255,77,85':'237,242,252';
      ctx.beginPath();
      ctx.arc(x,y,p.r,0,6.28);
      ctx.fillStyle='rgba('+col+','+(0.16+order*0.34)+')';
      ctx.fill();
      if(order>.55){
        ctx.beginPath();ctx.moveTo(x-14*order,y);ctx.lineTo(x-3,y);
        ctx.strokeStyle='rgba('+col+','+(0.06+order*0.14)+')';ctx.lineWidth=1;ctx.stroke();
      }
    }
    if(running && !reduce){ looping=true; _raf(step); } else { looping=false; }
  }
  function boot(){
    if(!fit()){ _setTo(boot,180); return; }
    seed();
    if(reduce){ running=false; step(); return; }
    if(window.IntersectionObserver){
      _io(function(es){es.forEach(function(en){running=en.isIntersecting; if(running&&!looping)_raf(step);});}).observe(cv);
    }
    _raf(step);
  }
  if(window.ResizeObserver){ _ro(function(){ if(fit()){ seed(); if(reduce||!looping) step(); } }).observe(cv); }
  boot();
})();

/* ---- hero video: fade in once the embed has loaded ---- */
/* Reveal a background YouTube loop ONLY once it actually reports PLAYING, so the player's
   loading spinner / centre play button / "unavailable" card is never visible. Until then the
   poster/gradient behind it shows. A short fallback covers browsers that swallow the API event. */
window.__revealOnPlay=function(iframe,wrap){
  if(!iframe||!wrap) return; var done=false,errored=false,timer,armed=false;
  function show(){ if(done||errored)return; done=true; wrap.classList.add('live'); if(timer)clearInterval(timer); }
  function hs(){ try{ iframe.contentWindow.postMessage(JSON.stringify({event:'listening',id:1,channel:'widget'}),'*'); }catch(e){} }
  onWin('message',function(e){
    if(e.source!==iframe.contentWindow||typeof e.data!=='string') return;
    /* if the player reports an error (e.g. 153 config error on file://, an ad-blocker, or a region/embed
       block) keep the poster fallback and NEVER fade the player in, so its error card is never shown */
    if(e.data.indexOf('onError')>-1){ errored=true; if(timer)clearInterval(timer); return; }
    if(e.data.indexOf('onStateChange')<0) return;
    try{ var d=JSON.parse(e.data);
      /* state 1 = playing: wait for YouTube's mobile control overlay (play/pause/next) to auto-dismiss before revealing */
      if(d.event==='onStateChange'&&d.info===1&&!armed){ armed=true; _setTo(show,2600); }
    }catch(_){}
  });
  timer=_setIv(hs,400); hs();
  _setTo(show,5200); /* fallback if the play event is swallowed; no-op if the player reported an error */
};
/* hero: a continuous reel of four clips. Two players cross-fade with a 1.1s overlap.
   Three things make the handover invisible:
     - the incoming player is raised above the outgoing one, so the fade works in BOTH directions
     - the outgoing clip stops looping the moment the fade starts, so it can never jump back to 0
       mid-dissolve
     - the incoming clip is preloaded, rewound and already playing before it is revealed */
(function(){
  var wrap=document.querySelector('.hero-video'); if(!wrap) return;
  var vids=[document.getElementById('hv0'),document.getElementById('hv1')];
  if(!vids[0]||!vids[1]||reduce) return;
  var SRC=['/assets/videos/hero-kl.mp4','/assets/videos/hero-crew.mp4','/assets/videos/hero-cleanroom.mp4','/assets/videos/hero-plant.mp4'];
  var HOLD=6.6, FADE=1100;                 /* clips run 8s, so hand over well before the loop point */
  var cur=0,idx=0,dead=false,swapping=false,timer=null,guard=null;
  function tryPlay(v){ var p=v.play(); if(p&&p.catch)p.catch(function(){
    _setTo(function(){var q=v.play(); if(q&&q.catch)q.catch(function(){});},400); }); }
  vids.forEach(function(v,slot){
    v.muted=true; v.setAttribute('muted',''); v.playsInline=true; v.loop=true; v.preload='auto';
    v.style.zIndex=slot;
    v.addEventListener('error',function(){ if(v===vids[cur]){ dead=true; wrap.classList.remove('live');
      vids.forEach(function(x){x.classList.remove('on');}); } });
    v.addEventListener('stalled',function(){ if(v===vids[cur]&&!dead)tryPlay(v); });
    v.addEventListener('waiting',function(){ if(v===vids[cur]&&!dead)tryPlay(v); });
    v.addEventListener('pause',function(){ if(v===vids[cur]&&!dead&&!swapping)tryPlay(v); });
  });
  function reveal(nxt,out){
    /* the incoming clip goes on top, so a fade-in always reads as a dissolve */
    nxt.style.zIndex=2; out.style.zIndex=1;
    out.loop=false;                         /* never let the outgoing clip restart mid-fade */
    try{ nxt.currentTime=0; }catch(e){}
    tryPlay(nxt);
    nxt.classList.add('on');
    _setTo(function(){
      out.classList.remove('on'); out.pause(); out.loop=true;
      cur=(vids[0]===nxt)?0:1; swapping=false; queueNext();
    },FADE);
  }
  function handover(){
    if(dead||swapping) return;
    swapping=true;
    var out=vids[cur], nxt=vids[1-cur];
    idx=(idx+1)%SRC.length;
    clearTimeout(guard);
    var fired=false;
    var go=function(){
      if(fired)return; fired=true;
      nxt.removeEventListener('canplay',go); clearTimeout(guard);
      if(dead){swapping=false;return;}
      reveal(nxt,out);
    };
    var ready=nxt.getAttribute('src')&&nxt.getAttribute('src').indexOf(SRC[idx])>=0&&nxt.readyState>=3;
    if(ready){ go(); }
    else {
      nxt.addEventListener('canplay',go);
      nxt.src=SRC[idx]; nxt.load();
      /* if the file is slow, keep the current clip running and try again shortly */
      guard=_setTo(function(){
        if(fired)return;
        nxt.removeEventListener('canplay',go);
        swapping=false; vids[cur].loop=true; tryPlay(vids[cur]);
        clearTimeout(timer); timer=_setTo(handover,2000);
      },4000);
    }
  }
  function queueNext(){
    clearTimeout(timer);
    var nxt=vids[1-cur], want=SRC[(idx+1)%SRC.length];
    if(!nxt.getAttribute('src')||nxt.getAttribute('src').indexOf(want)<0){ nxt.src=want; nxt.load(); }
    timer=_setTo(handover,HOLD*1000);
  }
  vids[0].addEventListener('canplay',function once(){
    vids[0].removeEventListener('canplay',once);
    if(dead)return;
    vids[0].style.zIndex=2; vids[1].style.zIndex=1;
    wrap.classList.add('live'); vids[0].classList.add('on'); tryPlay(vids[0]); queueNext();
  });
  onDoc('visibilitychange',function(){ if(!document.hidden&&!dead)tryPlay(vids[cur]); });
  vids[0].src=SRC[0]; vids[0].load();
})();


/* ---- 3D dot world: real continents, alive, faced on SEA ---- */
(function(){
  var host=document.getElementById('globeHost'); if(!host) return;
  var canvas=document.getElementById('globeCv'); if(!canvas) return;
  var LAND='ffffffffffffffffffffffffffffffffffffffffffffffff|000000000000000000000000000000000000000000000000|800000000000000000000000000000000000000000000000|800000000000000000000000000000000000000000000001|8000000000000000003f8000000000000000000000000001|800000000000ffc1fffff000000000000000000000000001|8000000000001f1ffffff800009000000000000000000001|0000000040007c1ffffffc00000000000000070000000001|80000000090198003ffffc00000000008007fff0007c0001|80000003e00000003ffff800000000040ffffffff87f8001|800e000037067f8007ffd0000000000c1ffffffffffffc01|80ffffff3fcb19f017ffc000007fc007ffffffffffffffff|e0fffffff7dff0780ffc000001fffdffffffffffffffffff|98fffffffffff0780fc00f0003ffffffffffffffffffffff|80ffffffffff003807c006000fffffffffffffffffffffff|80fffffffffe01c0038000001fdffffffffffffffffffff8|80ff93fffffc01e0000000001fdfffffffffffffffffc701|000e00fffffe01fe000000060f9fffffffffffffffe01e01|0010007fffffc1ff000000060f1fffffffffffffff803c00|8000001ffffffbffc000001f0fffffffffffffffffc03801|8000000fffffffffc000001ffffffffffffffffffff01001|8000000fffffffff60000003fffffffffffffffffff00001|00000003ffffbffc70000003ffffffffffffffffffd00001|80000003ffffdffc10000001ffffffffffffffffffd00001|80000003fffff7fe00000001feff3fffffffffffff900001|80000003ffffffe00000001fc37e03cffffffffffc100001|80000003ffffffc00000001f80bfffcffffffffff8200001|80000003ffffff800000001f0013ffcffffffffff0200001|80000001ffffff000000001e7901ffffffffffffb8600001|80000000ffffff0000000007fc001fffffffffff13c00001|800000003ffffc000000000ffc003fffffffffff86000001|800000003ffff8000000001fff3c3fffffffffff80000001|800000000fff98000000003fffffffffffffffff80000001|800000001ff80c000000007fffffdfcfffffffff00000001|8000000003f80400000000ffffffcfe1fffffffe00000001|8000000001f00000000001ffffffeffe0ffffffe80000001|8000000000f04e00000001fffffff7fe07fffff000000001|8000000000f8c020000001fffffff7fe03fc7f2000000001|80000000007fc048000001fffffff3fc03f83f0080000001|80000000001fc000000001fffffffbf001e03f8180000001|800000000001f000000001ffffffffc001e00fc080000001|8000000000003000000001fffffffe0000c00bc040000001|80000000000030f3000000fffffffee000c0098040000001|8000000000001fff8000007fffffffe00060080060000001|80000000000001ffc000003fffffffc00020040060000001|80000000000001fff80000181fffffc00000160e00000001|80000000000001fffc00000007ffff8000000e1e00000001|80000000000003fffe00000007ffff0000000e3e00000001|80000000000007ffff00000007fffe000000073d82000001|80000000000007ffffe0000007fffc00000007bd8be00001|80000000000007fffff0000003fff8000000010100f80001|80000000000007fffffc000003fff80000000050007d0001|80000000000003fffffc000001fff8000000000020360001|80000000000001fffff8000001fffc000000000000010001|80000000000001fffff0000001fffc000000000007100000|80000000000000ffffe0000003fffc60000000001f100001|800000000000007fffe0000003fff8e0000000003f980001|800000000000003fffe0000003fff1c0000000007ffc0002|000000000000001fffe0000001ffe1c000000000fffe0000|000000000000001fffc0000001ffe1c000000007fffe0000|800000000000001fff00000001ffe1800000000fffff0001|800000000000003ffc00000000ffc0000000000fffff8001|800000000000003ffc00000000ffc0000000000fffff8001|800000000000003ffc000000007f800000000007ffff8001|000000000000003ff8000000007f000000000007ffff8001|800000000000003ff0000000003e000000000007c1ff0001|800000000000003fe00000000000000000000002007f0000|800000000000007fc00000000000000000000000003e0004|800000000000007f0000000000000000000000000000000c|800000000000007e00000000000000000000000000000014|800000000000007c00000000000000000000000000040031|800000000000007800000000000000000000000000000061|80000000000000f800000000000000000000000000000001|80000000000000f800000000000000000000000000000001|80000000000000f000000000000000000000000000000000|800000000000007000000000000000000000000000000001|800000000000003800000000000000000000000000000001|800000000000000000000000000000000000000000000001|800000000000000000000000000000000000000000000001|800000000000000000000000000000000000000000000001|800000000000000000000000000000000000000000000000|800000000000000000000000000000000000000000000001|800000000000000100000000000000000000000000000000|8000000000000007000000000000001c00001f9c7fc00001|800000000000000f000000000000e3fffe7ffffffffff001|800000000000007f0000001fffffffffffffffffffffff81|80000000003c007f000001ffffffffffffffffffffffff81|8000312ffc7fffff00001ffffffffffffffffffffffffe01|800dfffffffffffff000fffffffffffffffffffffffffe41|f03fffffffffffffffffffffffffffffffffffffffffffff|ffffffffffffffffffffffffffffffffffffffffffffffff|ffffffffffffffffffffffffffffffffffffffffffffffff|ffffffffffffffffffffffffffffffffffffffffffffffff|ffffffffffffffffffffffffffffffffffffffffffffffff|ffffffffffffffffffffffffffffffffffffffffffffffff|ffffffffffffffffffffffffffffffffffffffffffffffff'.split('|');
  var GW=192,GH=96,R=1.62;
  var OFFICES=[[3.1,101.7],[1.35,103.82],[-6.2,106.85],[21.03,105.85],[31.2,121.47],[25.03,121.56],[52.23,21.01],[50.11,8.68]];
  var NAMES=['Malaysia','Singapore','Indonesia','Vietnam','China','Taiwan','Poland','Germany'];
  var FLAGS=['🇲🇾','🇸🇬','🇮🇩','🇻🇳','🇨🇳','🇹🇼','🇵🇱','🇩🇪'];
  var HOME_X=10*Math.PI/180, HOME_Y=-Math.PI/2-100*Math.PI/180;
  function bit(y,x){ return (parseInt(LAND[y].charAt(x>>2),16)>>(3-(x&3)))&1; }
  function ll(lat,lon,r){var la=lat*Math.PI/180,lo=lon*Math.PI/180;
    return [r*Math.cos(la)*Math.cos(lo), r*Math.sin(la), -r*Math.cos(la)*Math.sin(lo)];}
  var THREE,scene,camera,renderer,group,raf=null,vis=false;
  var landMat,oceanMat,markerMat,haloMat,travelers=[],travPts,travGeo;
  var rx=HOME_X,ry=HOME_Y,rotXt=HOME_X,rotYt=HOME_Y,dragging=false,lx=0,ly=0;
  var idleY=0,lastT=0,tags=[],tagPos=[],tagV=null,tagN=null,camDir=null;
  function dotMat(size,near,far,alNear,alFar,shimmer){
    return new THREE.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,blending:THREE.NormalBlending,
      uniforms:{uSize:{value:size},uDpr:{value:Math.min(window.devicePixelRatio||1,1.75)},uT:{value:0}},
      vertexShader:'uniform float uSize; uniform float uDpr; attribute float aH; varying float vD; varying float vH; varying float vL; varying float vF;'+
        'void main(){ vec4 mv=modelViewMatrix*vec4(position,1.0); vD=-mv.z; vH=aH;'+
        ' vec3 nv=normalize(normalMatrix*normalize(position)); vF=nv.z;'+
        ' vL=clamp(dot(nv,normalize(vec3(-0.5,0.6,0.62))),0.0,1.0);'+
        ' gl_Position=projectionMatrix*mv; gl_PointSize=uSize*uDpr*(15.0/max(0.5,-mv.z)); }',
      fragmentShader:'precision mediump float; uniform float uT; varying float vD; varying float vH; varying float vL; varying float vF;'+
        'void main(){ vec2 c=gl_PointCoord-0.5; float d=length(c); if(d>0.5)discard;'+
        ' float al=smoothstep(0.5,0.26,d); float f=clamp((vD-2.7)/3.3,0.0,1.0);'+
        ' vec3 col=mix(vec3('+near+'),vec3('+far+'),f);'+
        ' col=mix(col*0.8,col,0.3+0.7*vL);'+
        ' float tw='+(shimmer?'0.9+0.1*sin(uT*1.4+vH*6.2832)':'1.0')+';'+
        ' al*=mix('+alNear+','+alFar+',f)*tw*(0.55+0.45*vL)*smoothstep(-0.08,0.14,vF); gl_FragColor=vec4(col,al); }'});
  }
  function mkCloud(arr,hs,mat){
    var g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(arr),3));
    g.setAttribute('aH',new THREE.BufferAttribute(new Float32Array(hs),1));
    return new THREE.Points(g,mat);
  }
  function init(T){
    THREE=T; if(THREE.ColorManagement) THREE.ColorManagement.enabled=false;
    scene=new THREE.Scene(); group=new THREE.Group(); scene.add(group);
    camera=new THREE.PerspectiveCamera(50,1,0.1,100); camera.position.z=4.05;
    renderer=_reg(new THREE.WebGLRenderer({canvas:canvas,antialias:true,alpha:true}));
    renderer.setClearColor(0x000000,0); renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));/* match peers; a dot cloud gains nothing from 2x on a DPR-3 phone */
    var landPts=[],landH=[],oceanPts=[],oceanH=[],y,x;
    for(y=1;y<GH;y++)for(x=1;x<GW-1;x++){
      var lat=90-((y+0.5)/GH)*180, lon=((x+0.5)/GW)*360-180;
      var w=Math.cos(lat*Math.PI/180); /* equal-area thinning, kills polar clumps */
      if(bit(y,x)){
        for(var rep=0;rep<4;rep++){
          if(Math.random()>(w+0.04)*0.9) continue;
          var p=ll(lat+(Math.random()-0.5)*1.5, lon+(Math.random()-0.5)*1.5, R);
          landPts.push(p[0],p[1],p[2]); landH.push(Math.random());
        }
      } else if(((x*5+y*11)%5)===0 && Math.random()<w*0.9){
        var q=ll(lat+(Math.random()-0.5)*1.6, lon+(Math.random()-0.5)*1.6, R*0.994);
        oceanPts.push(q[0],q[1],q[2]); oceanH.push(Math.random());
      }
    }
    landMat=dotMat(0.6,'0.5,0.56,0.67','0.86,0.89,0.94','0.38','0.0',true);
    oceanMat=dotMat(0.42,'0.72,0.78,0.87','0.97,0.98,1.0','0.06','0.0',true);
    group.add(mkCloud(landPts,landH,landMat));
    group.add(mkCloud(oceanPts,oceanH,oceanMat));
    /* markers + halo */
    var mp=[],mh=[];
    OFFICES.forEach(function(of){var p=ll(of[0],of[1],R*1.02); mp.push(p[0],p[1],p[2]); mh.push(Math.random());});
    markerMat=new THREE.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,blending:THREE.NormalBlending,
      uniforms:{uDpr:{value:Math.min(window.devicePixelRatio||1,1.75)},uTv:{value:0}},
      vertexShader:'uniform float uDpr; uniform float uTv; attribute float aH; varying float vD; varying float vF;'+
        'void main(){ vec4 mv=modelViewMatrix*vec4(position,1.0); vD=-mv.z;'+
        ' vF=normalize(normalMatrix*normalize(position)).z;'+
        ' float pulse=1.0+0.15*sin(uTv*1.9+aH*6.2832);'+
        ' gl_Position=projectionMatrix*mv; gl_PointSize=3.8*pulse*uDpr*(15.0/max(0.5,-mv.z)); }',
      fragmentShader:'precision mediump float; varying float vD; varying float vF;'+
        'void main(){ vec2 c=gl_PointCoord-0.5; float d=length(c); if(d>0.5)discard;'+
        ' float al=smoothstep(0.5,0.16,d); float f=clamp((vD-2.7)/3.3,0.0,1.0);'+
        ' al*=mix(1.0,0.05,f)*smoothstep(0.02,0.2,vF); gl_FragColor=vec4(0.925,0.125,0.153,al); }'});
    haloMat=new THREE.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,blending:THREE.NormalBlending,
      uniforms:{uDpr:{value:Math.min(window.devicePixelRatio||1,1.75)},uTv:{value:0}},
      vertexShader:'uniform float uDpr; uniform float uTv; attribute float aH; varying float vD; varying float vP; varying float vF;'+
        'void main(){ vec4 mv=modelViewMatrix*vec4(position,1.0); vD=-mv.z;'+
        ' vF=normalize(normalMatrix*normalize(position)).z;'+
        ' vP=fract(uTv*0.5+aH);'+
        ' gl_Position=projectionMatrix*mv; gl_PointSize=(4.0+vP*6.0)*uDpr*(15.0/max(0.5,-mv.z)); }',
      fragmentShader:'precision mediump float; varying float vD; varying float vP; varying float vF;'+
        'void main(){ vec2 c=gl_PointCoord-0.5; float d=length(c); if(d>0.5)discard;'+
        ' float ring=smoothstep(0.5,0.42,d)-smoothstep(0.36,0.20,d); if(ring<=0.0)discard;'+
        ' float f=clamp((vD-2.7)/3.3,0.0,1.0);'+
        ' float al=ring*(1.0-vP)*0.28*mix(1.0,0.05,f)*smoothstep(0.02,0.2,vF); gl_FragColor=vec4(0.925,0.125,0.153,al); }'});
    group.add(mkCloud(mp,mh,markerMat));
    group.add(mkCloud(mp,mh,haloMat));
    /* country chips: flag + name, tracked to markers each frame */
    tagV=new THREE.Vector3(); tagN=new THREE.Vector3(); camDir=new THREE.Vector3();
    OFFICES.forEach(function(of,oi){
      var el=document.createElement('div');
      el.className='globe-tag'+(oi===0?' hq':'');
      el.innerHTML='<span class="fl">'+FLAGS[oi]+'</span>'+NAMES[oi]+(oi===0?' &middot; HQ':'');
      host.appendChild(el);
      var tp=ll(of[0],of[1],R*1.02);
      tags.push(el); tagPos.push(new THREE.Vector3(tp[0],tp[1],tp[2]));
    });
    /* arcs + travelling packets */
    var hq=ll(OFFICES[0][0],OFFICES[0][1],R*1.01);
    var hqv=new THREE.Vector3(hq[0],hq[1],hq[2]);
    for(var a=1;a<OFFICES.length;a++){
      var e=ll(OFFICES[a][0],OFFICES[a][1],R*1.01), ev=new THREE.Vector3(e[0],e[1],e[2]);
      var pts=[];
      for(var t=0;t<=48;t++){var f2=t/48;
        var v=new THREE.Vector3().copy(hqv).lerp(ev,f2).normalize()
          .multiplyScalar(R*(1.01+0.2*Math.sin(Math.PI*f2)*(hqv.angleTo(ev)/Math.PI+0.35)));
        pts.push(v);}
      var lg=new THREE.BufferGeometry().setFromPoints(pts);
      group.add(new THREE.Line(lg,new THREE.LineBasicMaterial({color:0xEC2027,transparent:true,opacity:0.16})));
      travelers.push({pts:pts,ph:Math.random(),sp:0.10+Math.random()*0.06});
    }
    travPts=new Float32Array(travelers.length*3);
    travGeo=new THREE.BufferGeometry(); travGeo.setAttribute('position',new THREE.BufferAttribute(travPts,3));
    var travMat=new THREE.PointsMaterial({color:0xEC2027,size:2.4,sizeAttenuation:false,transparent:true,opacity:.7,depthTest:false});
    group.add(new THREE.Points(travGeo,travMat));
    resize(); onWin('resize',resize);
    if(window.ResizeObserver){try{_ro(resize).observe(host);}catch(e){}}
    canvas.addEventListener('pointerdown',function(e){dragging=true;lx=e.clientX;ly=e.clientY;try{canvas.setPointerCapture(e.pointerId);}catch(_){}});
    onWin('pointermove',function(e){if(!dragging)return;var dx=e.clientX-lx,dy=e.clientY-ly;lx=e.clientX;ly=e.clientY;
      rotYt+=dx*0.005;rotXt+=dy*0.004;if(rotXt>1.2)rotXt=1.2;if(rotXt<-1.2)rotXt=-1.2;},{passive:true});
    onWin('pointerup',function(){dragging=false;});
    onWin('pointercancel',function(){dragging=false;});
    onWin('lostpointercapture',function(){dragging=false;});
    group.rotation.x=rx; group.rotation.y=ry;
    step(0); renderer.render(scene,camera); tags2d();
    if(reduce) return;
    if(window.IntersectionObserver){ try{ _io(function(es){ vis=es[0].isIntersecting;
      if(vis){ if(!raf) raf=_raf(frame); } else if(raf){ cancelAnimationFrame(raf); raf=null; } }).observe(host);
    }catch(e){ vis=true; raf=_raf(frame);} } else { vis=true; raf=_raf(frame); }
  }
  function step(t){
    var tv=t/1000;
    if(landMat){landMat.uniforms.uT.value=tv; oceanMat.uniforms.uT.value=tv;}
    if(markerMat){markerMat.uniforms.uTv.value=tv; haloMat.uniforms.uTv.value=tv;}
    if(travGeo){ for(var i=0;i<travelers.length;i++){ var tr=travelers[i];
      var p=tr.pts[Math.floor(((tv*tr.sp+tr.ph)%1)*(tr.pts.length-1))];
      travPts[i*3]=p.x; travPts[i*3+1]=p.y; travPts[i*3+2]=p.z; }
      travGeo.attributes.position.needsUpdate=true; }
  }
  function tags2d(){
    if(!tags.length||!camera)return;
    var w=host.clientWidth||300,h=host.clientHeight||300;
    group.updateMatrixWorld();
    camDir.copy(camera.position).sub(group.position).normalize();
    var boxes=[];
    for(var i=0;i<tags.length;i++){
      var wp=tagV.copy(tagPos[i]).applyMatrix4(group.matrixWorld);
      var facing=tagN.copy(wp).sub(group.position).normalize().dot(camDir);
      wp.project(camera);
      var sx=(wp.x*0.5+0.5)*w, sy=(-wp.y*0.5+0.5)*h, vis=facing>0.12;
      tags[i].style.opacity=vis?'1':'0';
      if(!tags[i].__w){ tags[i].__w=tags[i].offsetWidth||96; tags[i].__h=tags[i].offsetHeight||24; }
      boxes.push({el:tags[i],sx:sx,sy:sy,vis:vis,w:tags[i].__w,h:tags[i].__h});
    }
    /* no-overlap pass: chips that project onto each other stack downward with a gap,
       resolved top-to-bottom so chains settle into a tidy column */
    var vs=boxes.filter(function(b){return b.vis;}).sort(function(a,b){return a.sy-b.sy;});
    for(var a2=1;a2<vs.length;a2++){
      for(var b2=0;b2<a2;b2++){
        var A=vs[a2],B=vs[b2];
        if(Math.abs(A.sx-B.sx)<(A.w+B.w)/2+8 && A.sy-B.sy<B.h+6 && A.sy-B.sy>-(A.h+6)){
          A.sy=B.sy+B.h+6;
        }
      }
    }
    boxes.forEach(function(b){ b.el.style.transform='translate('+b.sx.toFixed(1)+'px,'+b.sy.toFixed(1)+'px) translate(-50%,-140%)'; });
  }
  function frame(ts){ raf=_raf(frame); if(!vis)return;
    var t=ts||0;
    var dt=lastT?Math.min(0.05,(t-lastT)/1000):0; lastT=t;
    if(!dragging){ /* alive: slow idle spin + breathe, pauses while dragging */
      idleY+=dt*0.02;
      rotXt+=((HOME_X+Math.sin(t*0.00028)*0.028)-rotXt)*0.03;
      rotYt+=((HOME_Y+idleY+Math.sin(t*0.00021)*0.05)-rotYt)*0.03;
    }
    rx+=(rotXt-rx)*0.09; ry+=(rotYt-ry)*0.09;
    group.rotation.x=rx; group.rotation.y=ry;
    group.position.y=Math.sin(t*0.00045)*0.014;
    step(t);
    renderer.render(scene,camera); tags2d(); }
  function resize(){ if(!renderer)return; var w=host.clientWidth||300,h=host.clientHeight||300;
    renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix(); renderer.render(scene,camera); tags2d(); }
  function fallback(){ try{ var ctx=canvas.getContext('2d');
    function dr(){ var w=canvas.width=host.clientWidth||300,h=canvas.height=host.clientHeight||300,cx=w/2,cy=h/2,rr=Math.min(w,h)*0.42;
      ctx.clearRect(0,0,w,h);
      for(var y=1;y<GH;y++)for(var x=1;x<GW-1;x++){ if(!bit(y,x))continue;
        var la=(90-((y+0.5)/GH)*180)*Math.PI/180, lo=(((x+0.5)/GW)*360-180)*Math.PI/180-1.75;
        if(Math.random()>Math.cos(la))continue;
        var X=Math.cos(la)*Math.cos(lo), Y=Math.sin(la), Z=-Math.cos(la)*Math.sin(lo);
        if(Z<0)continue;
        ctx.beginPath();ctx.arc(cx+X*rr,cy-Y*rr,1.1,0,6.28);ctx.fillStyle='rgba(18,26,48,'+(0.25+Z*0.6)+')';ctx.fill();}}
    dr(); onWin('resize',dr);}catch(e){} }
  try{init(THREE_MOD);}catch(err){fallback();}
})();

/* ---- 3D showpiece v3: engineering-accurate cleanroom, shadows + edges ---- */
var S3D=window.S3D={str:1,mep:1,ffu:1,flow:1,prog:0,zoom:0,spin:0};
(function(){
  var stageEl=document.getElementById('stage'); if(!stageEl) return;
  var section=document.getElementById('showpiece');
  var canvas=document.getElementById('stageCv'); if(!canvas) return;
  var T,renderer,scene,camera,root,raf=null,visb=false,portrait=false,tagEls=[],tagV,lsvg=null,tagByName={},rayTick=null,mTick=null,ffuGrills=[];
  var coarse=(window.matchMedia&&matchMedia('(pointer:coarse)').matches)||window.innerWidth<900;/* touch/narrow: tighten smoothing so the model tracks the finger */
  var gStruct,gStr,gMEP,gFFU,gFlow,flows=[];
  var spinFans=[],pulseLamps=[],beacon=null;/* living details: chiller fans, tool status lamps, stack beacon */
  var AIRSYS=null;/* laminar recirculation: entrained particles down, plenum return up, floor light pool */
  var shFN=0;/* shadow-pass frame counter (re-bake every 3rd frame) */
  var dragX=0,dragXt=0,dragVel=0,dragging=false,lx=0,zWas=0;
  var SM=null; /* rate-capped mirror of S3D so the assembly plays at a controlled pace, not scroll speed */
  /* camera keyframes hoisted out of frame() so the zoom re-framing allocates nothing per frame */
  var CAM={p0L:[8.8,6.05,9.2],p0P:[14.4,10.1,14.9],p1L:[7.55,4.5,7.85],p1P:[12.6,8.2,13.1],l0L:[-3.2,-0.65,0],l0P:[0,1.15,0],l1L:[0,0.15,0],l1P:[0,1.0,0]};
  var EDGE=new (function(){this.mat=null;})();
  function mat(c,o){ o=o||{};
    return new T.MeshStandardMaterial({color:c,roughness:o.rough!==undefined?o.rough:.7,metalness:o.metal||0,
      transparent:o.op!==undefined,opacity:o.op!==undefined?o.op:1,side:o.side||T.FrontSide}); }
  function box(w,h,d,c,o){ o=o||{};
    var m=new T.Mesh(new T.BoxGeometry(w,h,d),mat(c,o));
    m.userData.baseOp=o.op!==undefined?o.op:1;
    if(o.shadow!==false){m.castShadow=true;m.receiveShadow=true;}
    if(o.edges){ var eg=new T.LineSegments(new T.EdgesGeometry(m.geometry),new T.LineBasicMaterial({color:0x0B1120,transparent:true,opacity:.55})); eg.userData.baseOp=.55; m.add(eg); }
    return m; }
  function cyl(r,h,c,o){ o=o||{};
    var m=new T.Mesh(new T.CylinderGeometry(r,r,h,20),mat(c,{rough:o.rough!==undefined?o.rough:.4,metal:o.metal!==undefined?o.metal:.2,op:o.op}));
    m.userData.baseOp=o.op!==undefined?o.op:1; m.castShadow=true; return m; }
  function init(mod){
    T=mod; if(T.ColorManagement) T.ColorManagement.enabled=true;
    EDGE.mat=new T.LineBasicMaterial({color:0x0B1120,transparent:true,opacity:.55});
    scene=new T.Scene();
    camera=new T.PerspectiveCamera(30,1.6,0.1,100);
    renderer=_reg(new T.WebGLRenderer({canvas:canvas,antialias:true,alpha:true,powerPreference:'high-performance'}));
    renderer.setClearColor(0x000000,0); renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));/* 1.8 cost ~44% more pixels than 1.5 for no visible gain on this soft-shadowed scene; frame headroom = smoother scrub */
    /* shadows are the heaviest per-frame GPU cost: a 1024² PCF map re-baked every frame across the
       whole 960vh runway. Skip them on phones (<900px), where the baked radial contact plane already
       grounds the model; desktop keeps real shadows. Decided once at init (phones never cross 900px). */
    renderer.shadowMap.enabled=(stageEl.clientWidth||window.innerWidth)>=900; renderer.shadowMap.type=T.PCFShadowMap;/* PCFSoftShadowMap is deprecated in this three build; PCF is soft enough */
    /* the shadow depth pass nearly doubles draw calls: re-bake it every 3rd frame only (soft
       shadows cannot visibly lag at 20-40Hz); frame() flips needsUpdate on a counter */
    renderer.shadowMap.autoUpdate=false; renderer.shadowMap.needsUpdate=true;
    renderer.toneMapping=T.ACESFilmicToneMapping; renderer.toneMappingExposure=1.12;
    scene.add(new T.HemisphereLight(0xEAF2FF,0x39435B,0.72));
    var sun=new T.DirectionalLight(0xF4F7FF,2.6); sun.position.set(7,12,6);
    sun.castShadow=true; sun.shadow.mapSize.set(512,512);
    sun.shadow.camera.left=-3.8; sun.shadow.camera.right=3.8; sun.shadow.camera.top=4.4; sun.shadow.camera.bottom=-2.4;
    sun.shadow.camera.near=2; sun.shadow.camera.far=25; sun.shadow.bias=-0.00025; sun.shadow.normalBias=0.035;
    scene.add(sun);
    var rim=new T.DirectionalLight(0x8FB5FF,0.85); rim.position.set(-5,6,-8); scene.add(rim);
    var fill=new T.DirectionalLight(0x9FB8FF,0.45); fill.position.set(-6,3,-4); scene.add(fill);
    root=new T.Group(); scene.add(root); root.position.y=-0.5;
    var X=3.3, Z=2.2, i, j;

    /* ------- STRUCTURE ------- */
    gStruct=new T.Group(); root.add(gStruct);
    for(i=0;i<3;i++)for(j=0;j<2;j++){
      var px=-X/2+0.35+i*(X-0.7)/2, pz=-Z/2+0.3+j*(Z-0.6);
      var pile=cyl(0.075,0.55,0x9AA3AF); pile.position.set(px,-1.5,pz); gStruct.add(pile);
      var cap=box(0.34,0.16,0.34,0x8A94A2,{edges:true}); cap.position.set(px,-1.16,pz); gStruct.add(cap);
      if(i<2){ var tie=box((X-0.7)/2,0.1,0.12,0x8A94A2); tie.position.set(px+(X-0.7)/4,-1.14,pz); gStruct.add(tie); }
    }
    var slab=box(X,0.14,Z,0x39424F,{edges:true}); slab.position.y=-1.0; gStruct.add(slab);
    /* one unified site platform: the building slab and the chiller yard share a single base,
       no more two abutting plates (fixes the overlap/seam the client flagged). */
    /* site platform darkened to the section's own dark tone so it blends into the background
       rather than reading as a lighter slab floating on a darker void (client note) */
    var base=box(6.7,0.07,Z+1.1,0x0F1728,{edges:true}); base.position.set(-0.72,-1.1,0); gStruct.add(base);
    var baseRim=box(6.86,0.04,Z+1.26,0x0A101F); baseRim.position.set(-0.72,-1.135,0); gStruct.add(baseRim);
    var kerb=box(1.9,0.09,0.06,0x8A94A2); kerb.position.set(-X/2-1.35,-1.06,-Z/2+0.05); gStruct.add(kerb);
    /* round studio-floor disc removed (user: cancel the round platform); the rectangular
       base plate grounds the model and a soft contact shadow keeps it from floating. */
    /* soft radial contact-tint floor layer */
    var shCv=document.createElement('canvas'); shCv.width=shCv.height=256;
    var shCtx=shCv.getContext('2d');
    var shGr=shCtx.createRadialGradient(128,128,8,128,128,128);
    shGr.addColorStop(0,'rgba(0,0,0,.32)'); shGr.addColorStop(.55,'rgba(0,0,0,.13)'); shGr.addColorStop(1,'rgba(0,0,0,0)');
    shCtx.fillStyle=shGr; shCtx.fillRect(0,0,256,256);
    var contact=new T.Mesh(new T.PlaneGeometry(8.6,6.6),
      new T.MeshBasicMaterial({map:new T.CanvasTexture(shCv),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
    contact.rotation.x=-Math.PI/2; contact.position.set(-0.7,-1.76,0); contact.userData.baseOp=1; gStruct.add(contact);
    /* perforated raised access floor: tile grid with gaps */
    var tw=(X-0.3)/10, tz=(Z-0.3)/7;
    for(i=0;i<10;i++)for(j=0;j<7;j++){
      var tile=box(tw*0.985,0.045,tz*0.985,(i+j)%2?0xB4BDCA:0xAEB8C6,{rough:.55});
      tile.position.set(-X/2+0.15+tw*(i+0.5),-0.885,-Z/2+0.15+tz*(j+0.5)); tile.userData.part='Raised floor'; gStruct.add(tile);
    }
    /* pedestal hint under raised floor corners */
    for(i=0;i<5;i++){ var ped=cyl(0.02,0.09,0x707A88); ped.position.set(-X/2+0.3+i*(X-0.6)/4,-0.935,0); ped.userData.part='Raised floor'; gStruct.add(ped); }
    /* buildable structure: columns + envelope rise one by one in stage 1;
       the piles/slab/ground base above stays always visible */
    gStr=new T.Group(); root.add(gStr); gStr.userData.drop=3.6;
    /* columns to roof steel */
    for(i=0;i<3;i++)for(j=0;j<2;j++){
      /* skip the single front-center column that occludes the interior process tools */
      if(i===1&&j===1) continue;
      var cx=-X/2+0.35+i*(X-0.7)/2, cz=-Z/2+0.3+j*(Z-0.6);
      var col=box(0.15,3.0,0.15,0xC7CFDA,{rough:.5,edges:true}); col.position.set(cx,0.52,cz); gStr.add(col);
      var base=box(0.24,0.05,0.24,0x8A94A2); base.position.set(cx,-0.95,cz); gStr.add(base);
    }
    /* cleanroom envelope: white wall panels with mullions, glass viewing wall on the right */
    var wallB=box(X,2.28,0.05,0xE8EDF4,{rough:.85,op:.97}); wallB.position.set(0,0.23,-Z/2-0.03); gStr.add(wallB);
    for(i=0;i<8;i++){ var mull=box(0.02,2.28,0.02,0xC2CBD8); mull.position.set(-X/2+0.2+i*(X-0.4)/7,0.23,-Z/2); gStr.add(mull); }
    var glassR=box(0.04,2.28,Z,0x9FD8D0,{op:.18,side:T.DoubleSide,shadow:false}); glassR.position.set(X/2+0.02,0.23,0); gStr.add(glassR);
    var louver=box(0.55,0.42,0.04,0x9AA6B6,{rough:.4,metal:.3,edges:true}); louver.position.set(-X/2+0.55,-0.3,-Z/2-0.05); gStr.add(louver);
    for(var lv=0;lv<4;lv++){ var slat=box(0.5,0.02,0.05,0x707A88); slat.position.set(-X/2+0.55,-0.44+lv*0.09,-Z/2-0.055); gStr.add(slat); }
    var door=box(0.3,0.64,0.04,0xC2CBD8,{edges:true}); door.position.set(X/2-0.5,-0.56,-Z/2-0.05); gStr.add(door);
    for(j=0;j<5;j++){ var mullR=box(0.05,2.28,0.03,0xC2CBD8); mullR.position.set(X/2+0.02,0.23,-Z/2+j*(Z/4)); gStr.add(mullR); }

    /* ------- PROCESS & MEP ------- */
    gMEP=new T.Group(); root.add(gMEP); gMEP.userData.drop=4.2;
    /* semiconductor process tools: white cabinets, dark front panel, status lamp */
    var tools=[[-0.95,-0.2],[0.0,0.2],[0.95,-0.25]];
    tools.forEach(function(tp,k){
      var body=box(0.55,0.72,0.5,0xEDF1F7,{rough:.5,edges:true}); body.position.set(tp[0],-0.5,tp[1]); gMEP.add(body);
      var front=box(0.4,0.5,0.02,0x2A3242,{rough:.35}); front.position.set(tp[0],-0.5,tp[1]+0.271);
      front.material.polygonOffset=true; front.material.polygonOffsetFactor=-2; front.material.polygonOffsetUnits=-2; gMEP.add(front);
      var lamp=cyl(0.018,0.07,k===1?0x2E6FE8:0x1FA463); lamp.position.set(tp[0]+0.2,-0.1,tp[1]+0.2); gMEP.add(lamp);
      /* status lamps breathe: emissive pulse is untouched by the layer-fade opacity math */
      lamp.material.emissive=new T.Color(k===1?0x2E6FE8:0x1FA463); lamp.material.emissiveIntensity=0.6;
      pulseLamps.push({m:lamp.material,ph:k*2.1});
      var vent=box(0.3,0.05,0.3,0xC2CBD8); vent.position.set(tp[0],-0.11,tp[1]); gMEP.add(vent);
      body.userData.part=front.userData.part=lamp.userData.part=vent.userData.part='Process tools';
    });
    /* interstitial services with hangers */
    var runs=[[0x1FA463,0.065,1.62,-0.62],[0xD7263D,0.05,1.62,-0.36],[0x2E6FE8,0.05,1.62,-0.1]];
    runs.forEach(function(p){
      var pi=cyl(p[1],X*0.92,p[0],{rough:.32,metal:.3}); pi.rotation.z=Math.PI/2; pi.position.set(0,p[2],p[3]); gMEP.add(pi);
      for(var hk=0;hk<4;hk++){ var rod=cyl(0.008,0.24,0x8A94A2); rod.position.set(-X*0.35+hk*X*0.235,p[2]+0.13,p[3]); gMEP.add(rod); }
      var f1=cyl(p[1]*1.4,0.028,p[0]); f1.rotation.z=Math.PI/2; f1.position.set(-X*0.26,p[2],p[3]); gMEP.add(f1);
      var f2=f1.clone(); f2.position.x=X*0.26; gMEP.add(f2);
      if(p[0]===0x1FA463){ pi.userData.part=f1.userData.part=f2.userData.part='Chilled water'; }
    });
    var tray=box(X*0.9,0.03,0.22,0xD8892B,{rough:.5,edges:true}); tray.position.set(0,1.52,0.2); gMEP.add(tray);
    var trayEdge=box(X*0.9,0.06,0.02,0xC77B22); trayEdge.position.set(0,1.545,0.09); gMEP.add(trayEdge);
    var trayEdge2=trayEdge.clone(); trayEdge2.position.z=0.31; gMEP.add(trayEdge2);
    tray.userData.part=trayEdge.userData.part=trayEdge2.userData.part='Cable tray';
    var duct=box(X*0.88,0.18,0.3,0xC5CEDA,{rough:.35,metal:.4,edges:true}); duct.position.set(0,1.72,0.55); gMEP.add(duct);
    for(i=0;i<4;i++){ var fl=box(0.02,0.2,0.32,0xAAB4C2); fl.position.set(-X*0.33+i*X*0.22,1.72,0.55); gMEP.add(fl); }
    var ahu=box(0.66,0.46,0.52,0xE4E9F0,{rough:.5,edges:true}); ahu.position.set(-X/2+0.42,1.74,0.52); gMEP.add(ahu);
    var ahuTrim=box(0.68,0.05,0.54,0xEC2027); ahuTrim.position.set(-X/2+0.42,1.99,0.52); gMEP.add(ahuTrim);
    var drop=cyl(0.05,0.44,0x1FA463); drop.position.set(-X/2+0.42,1.32,0.52); gMEP.add(drop);
    ahu.userData.part=ahuTrim.userData.part=drop.userData.part='AHU';
    /* external plant: two air-cooled chillers on the yard */
    for(var ck=0;ck<2;ck++){
      var czz=-Z/2+0.55+ck*(Z-1.0);
      /* body lifted so its bottom clears the base-plate top by 25mm (was 5mm = shimmer risk) */
      var ch=box(0.98,0.5,0.62,0xCBD4DF,{rough:.45,metal:.2,edges:true}); ch.position.set(-X/2-1.35,-0.79,czz); gMEP.add(ch);
      /* plinth is wider/deeper than the body so no side face is coplanar with it (was 0.98x0.62 = z-fight) */
      var chb=box(1.1,0.1,0.74,0x2A3242); chb.position.set(-X/2-1.35,-1.02,czz); gMEP.add(chb);
      for(var fk=0;fk<2;fk++){ var fx=-X/2-1.55+fk*0.42;
        /* THE chiller-yard jitter fix: the old disc/ring/body-top trio all shared the plane y=-0.56
           and z-fought as the camera swayed. Every horizontal face now has its own y with clear gaps. */
        var fring=cyl(0.185,0.02,0x8F99A8); fring.position.set(fx,-0.526,czz); gMEP.add(fring);   /* rim: -0.536..-0.516, 4mm above body top -0.54 */
        var fan2=cyl(0.16,0.024,0x39424F); fan2.position.set(fx,-0.500,czz); gMEP.add(fan2);      /* bowl: -0.512..-0.488, 4mm above rim */
        /* live blades spinning inside the ring: the yard reads as running plant, not a static prop */
        var fg=new T.Group(); fg.position.set(fx,-0.478,czz); gMEP.add(fg);
        var hub=cyl(0.032,0.024,0x8F99A8,{metal:.4,rough:.3}); fg.add(hub);
        for(var bk=0;bk<3;bk++){ var bl=box(0.125,0.006,0.045,0x707F92,{rough:.35,metal:.3,shadow:false});
          bl.position.x=0.078; var bp=new T.Group(); bp.rotation.y=bk*2.0944; bp.add(bl); fg.add(bp); }
        fg.userData.spin=(fk?-1:1)*(2.4+ck*0.5); spinFans.push(fg);
        fan2.userData.part=fring.userData.part='Chiller yard';
        fg.traverse(function(n){ n.userData.part='Chiller yard'; });
      }
      /* x -0.88 put the panel face EXACTLY flush with the widened plinth face (both -2.45) = z-fight */
      var cpanel=box(0.16,0.3,0.5,0xEC2027,{rough:.5}); cpanel.position.set(-X/2-0.90,-0.86,czz); gMEP.add(cpanel);
      ch.userData.part=chb.userData.part=cpanel.userData.part='Chiller yard';
    }
    /* pipe rack from the yard into the building */
    var rackP=[[0x1FA463,0.05,-0.15],[0x2E6FE8,0.045,0.05]];
    rackP.forEach(function(rp,ri){
      var run=cyl(rp[1],1.7,rp[0],{rough:.35,metal:.3}); run.rotation.z=Math.PI/2; run.position.set(-X/2-0.6,-0.62+ri*0.14,rp[2]); gMEP.add(run);
      var riser=cyl(rp[1],1.9,rp[0],{rough:.35,metal:.3}); riser.position.set(-X/2+0.22,0.35+ri*0.07,rp[2]); gMEP.add(riser);
      run.userData.part=riser.userData.part='Chiller yard';
    });
    /* posts 1mm slimmer than the beams so their side faces never share a plane (grazing shimmer) */
    for(var pk=0;pk<3;pk++){ var post=box(0.044,0.5,0.044,0x8A94A2); post.position.set(-X/2-1.15+pk*0.55,-0.85,-0.05); gMEP.add(post);
      var beam2=box(0.05,0.05,0.42,0x8A94A2); beam2.position.set(-X/2-1.15+pk*0.55,-0.6,-0.05); gMEP.add(beam2); }
    /* exhaust stack */
    var stack=cyl(0.09,1.7,0xB9C2CE,{rough:.4,metal:.3}); stack.position.set(-X/2-0.35,-0.15,-Z/2+0.3); gMEP.add(stack);
    /* band radius 0.095->0.11: the old 5mm skin around the stack shimmered at grazing angles */
    var stackBand=cyl(0.11,0.12,0xEC2027); stackBand.position.set(-X/2-0.35,0.62,-Z/2+0.3); gMEP.add(stackBand);
    var stackGuy=box(0.03,1.0,0.03,0x8A94A2); stackGuy.position.set(-X/2-0.35,-0.6,-Z/2+0.3); gMEP.add(stackGuy);
    /* slow-pulsing aviation beacon on the stack tip: a live light that carries the industrial read */
    beacon=new T.Mesh(new T.SphereGeometry(0.035,10,10),new T.MeshBasicMaterial({color:0xEC2027,transparent:true}));
    beacon.position.set(-X/2-0.35,0.74,-Z/2+0.3); beacon.userData.baseOp=1; gMEP.add(beacon);

    /* ------- FFU CEILING + ROOF TRUSS ------- */
    gFFU=new T.Group(); root.add(gFFU); gFFU.userData.drop=4.8;
    /* ceiling T-grid */
    for(i=0;i<8;i++){ var gridX=box(0.02,0.03,Z-0.2,0xD5DCE6); gridX.position.set(-X/2+0.35+i*(X-0.7)/7,1.24,0); gridX.userData.part='FFU ceiling'; gFFU.add(gridX); }
    for(j=0;j<6;j++){ var gridZ=box(X-0.6,0.03,0.02,0xD5DCE6); gridZ.position.set(0,1.24,-Z/2+0.3+j*(Z-0.6)/5); gridZ.userData.part='FFU ceiling'; gFFU.add(gridZ); }
    /* FFU units: housing + fan disc on top */
    for(i=0;i<7;i++)for(j=0;j<5;j++){
      var fx=-X/2+0.42+i*(X-0.84)/6, fz=-Z/2+0.32+j*(Z-0.64)/4;
      var ffu=box(0.34,0.09,0.31,0xF4F7FB,{rough:.55,edges:true}); ffu.position.set(fx,1.31,fz); gFFU.add(ffu);
      var fan=cyl(0.09,0.02,0x9AA6B6); fan.position.set(fx,1.37,fz); gFFU.add(fan);
      var grill=box(0.28,0.015,0.25,0x8F99A8,{shadow:false}); grill.position.set(fx,1.245,fz); gFFU.add(grill);
      /* the working face: each grill emits a cyan pulse while the downflow runs */
      grill.material.emissive.setHex(0x2BD9C0); grill.material.emissiveIntensity=0;
      ffuGrills.push(grill);
      ffu.userData.part=fan.userData.part=grill.userData.part='FFU ceiling';
    }
    /* proper roof trusses: top+bottom chords, verticals, diagonals */
    var tb=2.02, tt=2.5;
    for(i=0;i<4;i++){
      var txp=-X/2+0.35+i*(X-0.7)/3;
      var bot=box(0.06,0.06,Z+0.25,0xE8730C,{rough:.55,metal:.25}); bot.position.set(txp,tb,0); bot.userData.part='Roof truss'; gFFU.add(bot);
      var top=box(0.06,0.06,Z+0.25,0xE8730C,{rough:.55,metal:.25}); top.position.set(txp,tt,0); top.userData.part='Roof truss'; gFFU.add(top);
      for(var v=0;v<5;v++){
        var vz=-Z/2+v*(Z/4);
        var vert=box(0.045,tt-tb,0.045,0xE8730C,{rough:.55,metal:.25}); vert.position.set(txp,(tt+tb)/2,vz); vert.userData.part='Roof truss'; gFFU.add(vert);
        if(v<4){ var dg=box(0.04,0.04,Math.hypot(tt-tb,Z/4),0xE8730C,{rough:.55,metal:.25});
          dg.position.set(txp,(tt+tb)/2,vz+Z/8); dg.rotation.x=Math.atan2(tt-tb,Z/4)*(v%2?1:-1); dg.userData.part='Roof truss'; gFFU.add(dg); }
      }
    }
    /* purlins across trusses + metal deck roof */
    for(j=0;j<6;j++){ var pur=box(X+0.2,0.05,0.05,0xD8892B,{rough:.5}); pur.position.set(0,tt+0.05,-Z/2+j*(Z/5)); pur.userData.part='Roof truss'; gFFU.add(pur); }
    var roof=box(X+0.34,0.035,Z+0.34,0x3A5F51,{rough:.5,edges:true}); roof.position.y=tt+0.12; roof.userData.part='Roof truss'; gFFU.add(roof);
    for(i=0;i<12;i++){ var rib=box(0.02,0.02,Z+0.34,0x2F5245); rib.position.set(-X/2+0.1+i*(X+0.1)/11,tt+0.145,0); gFFU.add(rib); }
    for(i=0;i<2;i++){ var cowl=cyl(0.11,0.22,0xB9C2CE,{rough:.4,metal:.3}); cowl.position.set(-X/2+0.8+i*1.6,tt+0.25,-Z/2+0.5); gFFU.add(cowl);
      var cap2=box(0.3,0.03,0.3,0x8F99A8); cap2.position.set(-X/2+0.8+i*1.6,tt+0.38,-Z/2+0.5); gFFU.add(cap2); }

    /* interstitial walkway with handrail, access ladder, extra tray tier */
    var walk=box(X-0.7,0.045,0.42,0x39424F,{rough:.6,edges:true}); walk.position.set(0,1.44,-Z/2+0.28); gMEP.add(walk);
    for(i=0;i<6;i++){ var hp=box(0.025,0.3,0.025,0xC7CFDA); hp.position.set(-X/2+0.5+i*(X-1.0)/5,1.62,-Z/2+0.12); gMEP.add(hp); }
    var rail=box(X-0.7,0.025,0.025,0xC7CFDA); rail.position.set(0,1.77,-Z/2+0.12); gMEP.add(rail);
    var railm=box(X-0.7,0.02,0.02,0xC7CFDA); railm.position.set(0,1.62,-Z/2+0.12); gMEP.add(railm);
    var str1=box(0.03,2.3,0.05,0xB9C2CE); str1.position.set(X/2-0.35,0.32,-Z/2+0.06); gMEP.add(str1);
    var str2=str1.clone(); str2.position.x=X/2-0.15; gMEP.add(str2);
    for(i=0;i<6;i++){ var rung=box(0.2,0.022,0.022,0xB9C2CE); rung.position.set(X/2-0.25,-0.6+i*0.42,-Z/2+0.06); gMEP.add(rung); }
    var tray2=box(X*0.82,0.028,0.18,0xD8892B,{rough:.5,edges:true}); tray2.position.set(0,1.63,0.16); gMEP.add(tray2); tray2.userData.part='Cable tray';

    /* ------- LAMINAR FLOW: unidirectional piston of parallel arrows, FFU face to raised floor ------- */
    gFlow=new T.Group(); root.add(gFlow); gFlow.userData.drop=0;
    function mkArrow(op){
      /* additive blending: the arrows read as moving LIGHT, not tinted plastic */
      var g2=new T.Group();
      var shaft=new T.Mesh(new T.CylinderGeometry(0.011,0.011,0.3,6),
        new T.MeshBasicMaterial({color:0x3BE6CE,transparent:true,opacity:op,blending:T.AdditiveBlending,depthWrite:false}));
      shaft.position.y=0.19;
      var tip=new T.Mesh(new T.ConeGeometry(0.034,0.095,10),
        new T.MeshBasicMaterial({color:0x5FF2DC,transparent:true,opacity:op,blending:T.AdditiveBlending,depthWrite:false}));
      tip.rotation.x=Math.PI; tip.position.y=0;
      shaft.castShadow=false; tip.castShadow=false;
      g2.add(shaft); g2.add(tip);
      g2.userData.mats=[shaft.material,tip.material];
      return g2;
    }
    /* 2 phases per column (was 3): the rain still reads continuous and it drops ~108 draw calls
       per frame from the pinned stage, which is exactly where scroll smoothness is won */
    for(i=0;i<9;i++)for(j=0;j<6;j++){
      for(var kk=0;kk<2;kk++){
        var ar=mkArrow(.55);
        ar.position.set(-X/2+0.4+i*(X-0.8)/8, 1.14, -Z/2+0.32+j*(Z-0.64)/5);
        ar.userData.ph=kk/2; flows.push(ar); gFlow.add(ar);
      }
    }
    /* single unidirectional downflow only: no bottom return arrows (top curtain reads as the story) */
    /* HOW THE AIR WORKS, made visible: fine entrained particles ride the piston down to the floor,
       and a thin sheet climbs the return plenum outside the glass wall back up to the FFU deck.
       The recirculation loop reads at a glance. All of it fades with the flow stage. */
    (function(){
      var AIRN=240, airPos=new Float32Array(AIRN*3), airPh=new Float32Array(AIRN), airSp=new Float32Array(AIRN);
      for(var ai=0;ai<AIRN;ai++){
        airPos[ai*3]=-X/2+0.35+Math.random()*(X-0.7);
        airPos[ai*3+2]=-Z/2+0.3+Math.random()*(Z-0.6);
        airPos[ai*3+1]=1.08;
        airPh[ai]=Math.random(); airSp[ai]=0.8+Math.random()*0.55;
      }
      var airGeo=new T.BufferGeometry(); airGeo.setAttribute('position',new T.BufferAttribute(airPos,3));
      var airMat=new T.PointsMaterial({color:0x9FF2E4,size:0.02,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false});
      var air=new T.Points(airGeo,airMat); air.castShadow=false; gFlow.add(air);
      var RETN=54, retPos=new Float32Array(RETN*3), retPh=new Float32Array(RETN);
      for(var ri=0;ri<RETN;ri++){
        retPos[ri*3]=X/2+0.1+Math.random()*0.12;
        retPos[ri*3+2]=-Z/2+0.2+Math.random()*(Z-0.4);
        retPos[ri*3+1]=-0.85;
        retPh[ri]=Math.random();
      }
      var retGeo=new T.BufferGeometry(); retGeo.setAttribute('position',new T.BufferAttribute(retPos,3));
      var retMat=new T.PointsMaterial({color:0x5FE8D2,size:0.017,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false});
      var ret=new T.Points(retGeo,retMat); ret.castShadow=false; gFlow.add(ret);
      /* soft light pool where the downflow meets the raised floor (7mm above the tiles, no coplanar) */
      var poolCv=document.createElement('canvas'); poolCv.width=poolCv.height=128;
      var pctx=poolCv.getContext('2d'); var pgr=pctx.createRadialGradient(64,64,6,64,64,64);
      pgr.addColorStop(0,'rgba(95,242,220,.5)'); pgr.addColorStop(.6,'rgba(95,242,220,.15)'); pgr.addColorStop(1,'rgba(95,242,220,0)');
      pctx.fillStyle=pgr; pctx.fillRect(0,0,128,128);
      var pool=new T.Mesh(new T.PlaneGeometry(X-0.5,Z-0.5),
        new T.MeshBasicMaterial({map:new T.CanvasTexture(poolCv),transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false}));
      pool.rotation.x=-Math.PI/2; pool.position.y=-0.855; pool.castShadow=false; gFlow.add(pool);
      AIRSYS={airGeo:airGeo,airPos:airPos,airPh:airPh,airSp:airSp,AIRN:AIRN,airMat:airMat,
              retGeo:retGeo,retPos:retPos,retPh:retPh,RETN:RETN,retMat:retMat,pool:pool};
    })();

    for(i=0;i<4;i++){ var bol=cyl(0.035,0.2,0xEC2027,{rough:.5}); bol.position.set(-X/2+0.5+i*(X-1.0)/3,-0.97,Z/2+0.32); gStr.add(bol); }

    /* cascade order: children reveal one by one inside their stage */
    [gStr,gMEP,gFFU].forEach(function(g){ var n=g.children.length;
      g.children.forEach(function(ch,i){ ch.userData.ph=i/Math.max(1,n-1); ch.userData.by=ch.position.y; }); });
    /* part labels shown when the camera steps inside */
    var LBLS=[
      ['FFU ceiling',0,1.31,0,'#F4F7FB','Fan filter units. HEPA and ULPA modules push clean air straight down.','HEPA H14 · 0.45 m/s downflow'],
      ['Process tools',0,-0.38,0.2,'#DDE3EB','Semiconductor process equipment the cleanroom is built to serve.','Point of use · vibration isolated'],
      ['Chilled water',0,1.6,-0.62,'#1FA463','Chilled water loop feeding the air handling coils.','7°C supply · closed loop'],
      ['Cable tray',0,1.52,0.2,'#D8892B','Power and signal cabling routed above the ceiling.','Segregated power and data'],
      ['Raised floor',0.9,-0.85,0.3,'#B4BDCA','Perforated access floor. It returns air and routes services below.','Perforated · plenum return'],
      ['AHU',-X/2+0.42,1.99,0.52,'#EC2027','Air handling unit. It conditions and pressurises the primary air.','Pre and HEPA filtration'],
      ['Roof truss',0.9,2.26,0,'#E8730C','Structural steel spanning the wide clean space.','Long span steel · column free'],
      ['Chiller yard',-X/2-1.35,-0.5,0,'#CBD4DF','External chillers rejecting process and cooling heat.','N+1 redundancy · heat rejection']];
    /* bespoke line icons per part: one stroke weight, tinted by the part colour */
    var PICON={
      'FFU ceiling':'<path d="M4 5h16M4 8h16M9 12v6M9 18l-2-2M9 18l2-2M15 12v6M15 18l-2-2M15 18l2-2"/>',
      'Process tools':'<rect x="5" y="6" width="14" height="13" rx="1"/><rect x="8.5" y="10" width="7" height="5.5"/><path d="M9.5 3v3M14.5 3v3"/>',
      'Chilled water':'<path d="M12 3.5s5.5 6.1 5.5 10a5.5 5.5 0 0 1-11 0c0-3.9 5.5-10 5.5-10z"/><path d="M9.4 14c.85.85 1.75.85 2.6 0s1.75-.85 2.6 0"/>',
      'Cable tray':'<path d="M5 5v14M19 5v14M5 9h14M5 15h14"/>',
      'Raised floor':'<path d="M3 8h18M7 8v7M12 8v7M17 8v7M3 15h18"/>',
      'AHU':'<rect x="3" y="6.5" width="18" height="12" rx="1"/><circle cx="9.2" cy="12.5" r="3"/><path d="M15.5 9.5v6M18 9.5v6"/>',
      'Roof truss':'<path d="M2.5 16h19M3.5 16 12 8.5l8.5 7.5M7.7 12.7 12 16M16.3 12.7 12 16"/>',
      'Chiller yard':'<rect x="4" y="8" width="16" height="11" rx="1"/><circle cx="9" cy="12" r="2.2"/><circle cx="15" cy="12" r="2.2"/><path d="M7 5.5h10"/>'
    };
    /* interactive tags: each card parks in a fixed slot at the stage edge, a leader line points
       to its part, and hovering the card makes the actual part glow green in the model. */
    var SLOT={'AHU':['L',0],'FFU ceiling':['L',1],'Process tools':['L',2],'Chiller yard':['L',3],
              'Roof truss':['R',0],'Chilled water':['R',1],'Cable tray':['R',2],'Raised floor':['R',3]};
    var PRAD={'FFU ceiling':2.3,'Process tools':1.15,'Chilled water':0.5,'Cable tray':0.55,
              'Raised floor':1.7,'AHU':0.95,'Roof truss':2.6,'Chiller yard':1.7};
    var GLOW=0x16C79A, GLOWC='#16C79A', partCache={}, wv1=new T.Vector3(), wv2=new T.Vector3();
    function partOf(node){ var q=node; while(q&&q!==root){ if(q.userData&&q.userData.part) return q.userData.part; q=q.parent; } return null; }
    function partMeshes(name,anchor){
      if(partCache[name]) return partCache[name];
      var out=[];
      /* precise: meshes carry userData.part markers set at build time */
      root.traverse(function(n){ if(n.isMesh&&n.material&&n.material.emissive&&partOf(n)===name) out.push(n); });
      if(!out.length){ /* safety net for anything untagged */
        var rad=PRAD[name]||1.0;
        wv1.set(anchor.x,anchor.y,anchor.z).applyMatrix4(root.matrixWorld);
        root.traverse(function(n){ if(n.isMesh&&n.material&&n.material.emissive){ n.getWorldPosition(wv2); if(wv2.distanceTo(wv1)<=rad) out.push(n); }});
      }
      partCache[name]=out; return out;
    }
    function setGlow(name,anchor,on){
      partMeshes(name,anchor).forEach(function(n){
        var m=n.material;
        if(on){ if(n.userData.__em===undefined){ n.userData.__em=m.emissive.getHex(); n.userData.__emi=m.emissiveIntensity; }
          m.emissive.setHex(GLOW); if(m.emissiveIntensity!==undefined) m.emissiveIntensity=1.1; }
        else if(n.userData.__em!==undefined){ m.emissive.setHex(n.userData.__em); if(n.userData.__emi!==undefined) m.emissiveIntensity=n.userData.__emi; }
      });
    }
    var NS='http://www.w3.org/2000/svg';
    lsvg=document.createElementNS(NS,'svg'); lsvg.setAttribute('class','p3d-lines'); lsvg.style.opacity=0; stageEl.appendChild(lsvg);
    tagEls=LBLS.map(function(L){ var d2=document.createElement('div'); d2.className='p3d-tag';
      var ic=PICON[L[0]]||'';
      d2.innerHTML='<span class="p3d-hd"><span class="p3d-ic" style="color:'+L[4]+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+ic+'</svg></span>'+L[0]+'</span><span class="p3d-more">'+L[5]+'<span class="p3d-spec"><i style="background:'+L[4]+'"></i>'+L[6]+'</span></span>';
      stageEl.appendChild(d2);
      var ln=document.createElementNS(NS,'line'); ln.setAttribute('stroke','rgba(255,255,255,.32)'); ln.setAttribute('stroke-width','1'); lsvg.appendChild(ln);
      var dot=document.createElementNS(NS,'circle'); dot.setAttribute('r','3.2'); dot.setAttribute('fill',L[4]); lsvg.appendChild(dot);
      var anchor={x:L[1],y:L[2],z:L[3]};
      var tg={el:d2,v:new T.Vector3(L[1],L[2],L[3]),slot:SLOT[L[0]]||['R',0],ln:ln,dot:dot,tw:0,name:L[0],col:L[4],anchor:anchor,desc:L[5],spec:L[6],ic:ic};
      d2.addEventListener('mouseenter',function(){ hotTag(tg.name,true); });
      d2.addEventListener('mouseleave',function(){ hotTag(tg.name,false); });
      tagByName[L[0]]=tg;
      return tg;
    });
    tagV=new T.Vector3();
    /* one switch for both directions: card hover OR 3D-part hover marks the pair hot */
    function hotTag(name,on){
      var tg=tagByName[name]; if(!tg) return;
      tg.el.classList.toggle('hot',on);
      tg.ln.setAttribute('stroke',on?GLOWC:'rgba(255,255,255,.32)');
      tg.ln.setAttribute('stroke-width',on?'1.6':'1');
      tg.dot.setAttribute('fill',on?GLOWC:tg.col);
      /* premium select: the leader line runs with moving dashes and the dot pulses while hot */
      try{ tg.ln.classList.toggle('hot',on); tg.dot.classList.toggle('hot',on); }catch(e){}
      tg.thUntil=performance.now()+520;/* keep re-measuring the card height while its open/close animates */
      try{ setGlow(name,tg.anchor,on); }catch(e){}
    }
    /* hover the 3D part itself: raycast from the pointer, pick the nearest labelled part */
    var rayc=new T.Raycaster(), hoverNDC=null, hoverPart=null, frameN=0;
    canvas.addEventListener('pointermove',function(e){ var r=canvas.getBoundingClientRect();
      hoverNDC={x:((e.clientX-r.left)/r.width)*2-1, y:-((e.clientY-r.top)/r.height)*2+1}; },{passive:true});
    canvas.addEventListener('pointerleave',function(){ hoverNDC=null; });
    rayTick=function(show){
      frameN++;
      if(!show||!hoverNDC||dragging){ if(hoverPart){ hotTag(hoverPart,false); hoverPart=null; } return; }
      if(frameN%3) return; /* raycast every 3rd frame is plenty */
      var pname=null;
      try{
        rayc.setFromCamera(hoverNDC,camera);
        var hits=rayc.intersectObjects(root.children,true);
        /* exact: the hovered mesh's own part marker (closest labelled hit wins) */
        for(var hi=0;hi<hits.length&&hi<4;hi++){ var pp=partOf(hits[hi].object); if(pp){ pname=pp; break; } }
      }catch(e){ pname=null; }
      if(pname!==hoverPart){ if(hoverPart)hotTag(hoverPart,false); if(pname)hotTag(pname,true); hoverPart=pname; }
    };
    /* MOBILE part explorer: top title + prev/next stepper + swipeable chip strip + info card
       (built once, shown only ≤900px zoomed) */
    var mtitle=document.createElement('div'); mtitle.className='p3d-mtitle';
    mtitle.innerHTML='<span class="mt-k">Exploded view &middot; ISO 5 unidirectional</span><b>One cleanroom, four engineered layers</b><span class="mt-h">Step through each part below</span><span class="mt-cue"><i class="mt-bar"><i id="mtBarFill"></i></i><span class="mt-cue-l">Scroll to continue</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M12 19l-5-5M12 19l5-5"/></svg></span>';
    var mbar=document.createElement('div'); mbar.className='p3d-mbar';
    var mprev=document.createElement('button'); mprev.type='button'; mprev.className='p3d-mnavbtn'; mprev.setAttribute('aria-label','Previous part');
    mprev.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>';
    var mstrip=document.createElement('div'); mstrip.className='p3d-mstrip';
    var mnext=document.createElement('button'); mnext.type='button'; mnext.className='p3d-mnavbtn'; mnext.setAttribute('aria-label','Next part');
    mnext.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>';
    mbar.appendChild(mprev); mbar.appendChild(mstrip); mbar.appendChild(mnext);
    var mcard=document.createElement('div'); mcard.className='p3d-tag p3d-mcard';
    stageEl.appendChild(mtitle); stageEl.appendChild(mcard); stageEl.appendChild(mbar);
    var chipByName={}, mActive=null;
    function mset(name){
      if(mActive){ try{ setGlow(mActive,tagByName[mActive].anchor,false); }catch(e){}
        if(chipByName[mActive]) chipByName[mActive].classList.remove('on'); }
      mActive=name;
      if(!name){ mcard.classList.remove('on','hot'); return; }
      var tg=tagByName[name]; if(!tg) return;
      chipByName[name].classList.add('on');
      try{ chipByName[name].scrollIntoView({inline:'center',block:'nearest',behavior:'smooth'}); }catch(e){}
      mcard.innerHTML='<span class="p3d-hd"><span class="p3d-ic" style="color:'+tg.col+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+tg.ic+'</svg></span>'+tg.name+'</span><span class="p3d-more">'+tg.desc+'<span class="p3d-spec"><i style="background:'+tg.col+'"></i>'+tg.spec+'</span></span>';
      mcard.classList.add('on','hot');
      try{ setGlow(name,tg.anchor,true); }catch(e){}
    }
    LBLS.forEach(function(L){
      var c=document.createElement('button'); c.type='button'; c.className='p3d-chip';
      c.innerHTML='<span style="color:'+L[4]+';display:inline-flex"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" width="15" height="15">'+(PICON[L[0]]||'')+'</svg></span>'+L[0];
      c.addEventListener('click',function(){ mset(mActive===L[0]?null:L[0]); });
      chipByName[L[0]]=c; mstrip.appendChild(c);
    });
    /* prev/next: step through the parts in order, wrapping at the ends */
    function mstep(dir){ var names=LBLS.map(function(L){return L[0];}); if(!names.length)return;
      var i=mActive?names.indexOf(mActive):(dir>0?-1:0); i=(i+dir+names.length)%names.length; mset(names[i]); }
    mprev.addEventListener('click',function(){ mstep(-1); });
    mnext.addEventListener('click',function(){ mstep(1); });
    mTick=function(show){ if(!show&&mActive) mset(null); };
    /* QA hook: returns what each label would highlight, so selection can be audited per part */
    window.__p3dQA=function(name){ try{ var tg=tagByName[name]; if(!tg) return 'no tag';
      var ms=partMeshes(name,tg.anchor); var wrong=0;
      ms.forEach(function(n){ if(partOf(n)!==name) wrong++; });
      return {count:ms.length, mislabeled:wrong}; }catch(e){ return 'ERR '+e.message; } };
    section.classList.add('webgl');
    resize(); onWin('resize',resize);
    if(window.ResizeObserver){try{_ro(resize).observe(stageEl);}catch(e){}}
    canvas.addEventListener('pointerdown',function(e){dragging=true;dragVel=0;lx=e.clientX;try{canvas.setPointerCapture(e.pointerId);}catch(_){}});
    /* free spin: no clamp, and track velocity so a flick keeps spinning */
    onWin('pointermove',function(e){if(!dragging)return;var d=(e.clientX-lx)*0.006;dragXt+=d;dragVel=dragVel*0.6+d*0.4;lx=e.clientX;},{passive:true});
    onWin('pointerup',function(){dragging=false;});
    onWin('pointercancel',function(){dragging=false;});
    onWin('lostpointercapture',function(){dragging=false;});
    apply(0); renderer.render(scene,camera);
    if(window.IntersectionObserver){ try{ _io(function(es){ visb=es[0].isIntersecting;
      if(visb){ if(!raf) raf=_raf(frame); } else if(raf){ cancelAnimationFrame(raf); raf=null; } }).observe(stageEl);
    }catch(e){ visb=true; raf=_raf(frame);} } else { visb=true; raf=_raf(frame); }
  }
  /* hoisted opacity setter (reused for every mesh instead of allocating a closure per child per frame) */
  var _e=0;
  function _setOp(n){ if(n.isMesh||n.isLineSegments){ var b=n.userData.baseOp!==undefined?n.userData.baseOp:1;
    if(_e<0.999||b<1){ n.material.transparent=true; n.material.opacity=b*_e; } else { n.material.opacity=b; } } }
  function setGroup(g,k){
    if(!g)return;
    if(g.userData.lastK===k) return;/* unchanged since last frame: a settled/static group does zero opacity work */
    g.userData.lastK=k;
    var d=g.userData.drop||0;
    g.visible=k>0.02;
    g.position.y=(1-k)*d*0.22;
    g.children.forEach(function(ch){
      /* wide stagger: parts rain in as a cascade (starts spread over 55% of the stage,
         each part falls within 45%), never as one block */
      var p=(ch.userData.ph||0)*0.55;
      var e=(k-p)/0.45; e=e<0?0:e>1?1:e; e=e*e*(3-2*e);
      if(ch.userData.by===undefined) ch.userData.by=ch.position.y;
      ch.position.y=ch.userData.by+(1-e)*d*0.78;
      ch.visible=e>0.01;
      _e=e; ch.traverse(_setOp);
    });
  }
  function apply(t,V){
    V=V||S3D;
    setGroup(gStr,V.str); setGroup(gMEP,V.mep); setGroup(gFFU,V.ffu);
    if(gFlow){ gFlow.visible=V.flow>0.02;
      if(!reduce){ flows.forEach(function(ar){
        var up=ar.userData.up, back=ar.userData.back;
        var p=(ar.userData.ph+t*(up?0.00022:back?0.00026:0.00042))%1;
        var env=Math.min(1,p/0.12)*Math.min(1,(1-p)/0.15);
        var o=(up?0.45:back?0.35:0.95)*env*V.flow;
        ar.userData.mats[0].opacity=o; ar.userData.mats[1].opacity=Math.min(1,o*1.25);
        if(up){ ar.position.y=-0.75+p*1.75; }
        else if(back){ ar.position.z=0.7-p*1.7; }
        else { ar.position.y=1.14-p*1.96; }
      });
      /* the recirculation loop: entrained particles fall FFU->floor, the return sheet climbs the
         side plenum, the floor pool breathes. All scaled by the flow stage so it assembles with it. */
      if(AIRSYS){
        AIRSYS.airMat.opacity=0.5*V.flow; AIRSYS.retMat.opacity=0.32*V.flow;
        AIRSYS.pool.material.opacity=(0.14+0.05*Math.sin(t*0.0012))*V.flow;
        for(var ai2=0;ai2<AIRSYS.AIRN;ai2++){ var ap2=(AIRSYS.airPh[ai2]+t*0.000115*AIRSYS.airSp[ai2])%1;
          AIRSYS.airPos[ai2*3+1]=1.08-ap2*1.94; }
        AIRSYS.airGeo.attributes.position.needsUpdate=true;
        for(var ri3=0;ri3<AIRSYS.RETN;ri3++){ var rp3=(AIRSYS.retPh[ri3]+t*0.00009)%1;
          AIRSYS.retPos[ri3*3+1]=-0.85+rp3*1.9; }
        AIRSYS.retGeo.attributes.position.needsUpdate=true;
      } } }
  }
  function frame(ts){ raf=_raf(frame); if(!visb)return;
    var t=ts||0;
    /* on release: coast with the flick's momentum, then hold position (no snap back home) */
    if(!dragging){ dragXt+=dragVel; dragVel*=0.92; if(dragVel<0.00003&&dragVel>-0.00003)dragVel=0; }
    dragX+=(dragXt-dragX)*0.08;
    /* rate-cap: ease a mirror of S3D toward the scroll target at a fixed pace, so however
       fast you flick the pinned section the parts still fall in at a controlled speed. */
    if(!SM){ SM={str:S3D.str,mep:S3D.mep,ffu:S3D.ffu,flow:S3D.flow,zoom:S3D.zoom}; }
    /* hard reset requested (e.g. the hide-once trigger zeroed S3D): snap the smoothing mirror
       instantly so the phantom fully-built model never dissolves over the assembly */
    if(window.__resetSM){ window.__resetSM=false; SM.str=S3D.str;SM.mep=S3D.mep;SM.ffu=S3D.ffu;SM.flow=S3D.flow;SM.zoom=S3D.zoom; }
    if(reduce){ SM.str=S3D.str;SM.mep=S3D.mep;SM.ffu=S3D.ffu;SM.flow=S3D.flow;SM.zoom=S3D.zoom; }
    else {
      /* calm ~3s cascade for small deltas, but resync FAST when the mirror is far from the target
         (e.g. re-entering the section after blasting past it) so scrolling back up always reverses
         cleanly instead of the parts staying frozen mid-build */
      var gap=Math.abs(S3D.str-SM.str)+Math.abs(S3D.mep-SM.mep)+Math.abs(S3D.ffu-SM.ffu)+Math.abs(S3D.flow-SM.flow)+Math.abs(S3D.zoom-SM.zoom);
      /* resync fast for any real move (lower threshold + higher base rate) so DISASSEMBLY on a reverse
         scroll tracks the scroll instead of trailing it frozen; the old 0.5 gate only fired on a hard
         blast-past, never on a deliberate slow scroll-back-up, which read as "cannot reverse". */
      var R=gap>0.25?0.12:(coarse?0.09:0.05);
      SM.str+=(S3D.str-SM.str)*R; SM.mep+=(S3D.mep-SM.mep)*R;
      SM.ffu+=(S3D.ffu-SM.ffu)*R; SM.flow+=(S3D.flow-SM.flow)*R;
      SM.zoom+=(S3D.zoom-SM.zoom)*R; }
    var z=SM.zoom; z=z*z*(3-2*z);
    /* rotation = a gentle continuous drift (prog) PLUS a stepped turn (spin) that the timeline
       nudges during the hold after each layer lands, so the model settles then turns a bit before
       the next layer kicks in */
    var baseRot=dragX-0.1+S3D.prog*0.15+(S3D.spin||0)+(reduce?0:Math.sin(t*0.00019)*0.05+Math.sin(t*0.00007)*0.03);
    root.rotation.y=baseRot*(1-z)+z*(0.34+dragX);
    root.position.y=-0.5+(portrait?-0.35*(1-z):0)+(reduce?0:Math.sin(t*0.00027)*0.012)*(1-z);
    if(z>0.001){
      var P0=portrait?CAM.p0P:CAM.p0L, P1=portrait?CAM.p1P:CAM.p1L;
      var L0=portrait?CAM.l0P:CAM.l0L, L1=portrait?CAM.l1P:CAM.l1L;/* assembly: bigger + centred in the right half; zoomed lifted off the bottom edge, uncut */
      camera.position.set(P0[0]+(P1[0]-P0[0])*z,P0[1]+(P1[1]-P0[1])*z,P0[2]+(P1[2]-P0[2])*z);
      camera.lookAt(L0[0]+(L1[0]-L0[0])*z,L0[1]+(L1[1]-L0[1])*z,L0[2]+(L1[2]-L0[2])*z);
    } else if(zWas>0.001){ resize(); }
    zWas=z;
    /* shadow re-bake at 1/3 rate (autoUpdate is off; see init) */
    shFN++; if(shFN%3===0) renderer.shadowMap.needsUpdate=true;
    /* living details: fans turn, lamps breathe, the stack beacon pulses (skipped under reduced motion) */
    if(!reduce){
      for(var sf=0;sf<spinFans.length;sf++) spinFans[sf].rotation.y=t*0.001*spinFans[sf].userData.spin;
      for(var pl2=0;pl2<pulseLamps.length;pl2++) pulseLamps[pl2].m.emissiveIntensity=0.55+0.45*Math.sin(t*0.0016+pulseLamps[pl2].ph);
      /* write opacity DIRECTLY: setGroup caches per-layer state and early-returns once the layer
         settles, so a userData.baseOp pulse would freeze ~seconds after every scroll stop. During
         assembly setGroup overwrites this with the layer fade (baseOp=1), which is what we want. */
      if(beacon) beacon.material.opacity=0.35+0.65*Math.abs(Math.sin(t*0.0021));
    }
    apply(t,SM);
    /* the FFU working faces breathe with cyan light while the downflow runs */
    if(ffuGrills.length){ var fe=(SM?SM.flow:0)*(0.55+(reduce?0:0.22*Math.sin(t*0.0016)));
      for(var gi=0;gi<ffuGrills.length;gi++){ ffuGrills[gi].material.emissiveIntensity=fe; } }
    section.classList.toggle('zoomed', z>0.55);
    if(tagEls.length){ var w2=stageEl.clientWidth,h2=stageEl.clientHeight,show=z>0.72;
      if(lsvg){ lsvg.setAttribute('viewBox','0 0 '+w2+' '+h2); lsvg.style.opacity=(show&&!portrait)?1:0; }
      if(rayTick) rayTick(show&&!portrait);
      if(mTick) mTick(show);
      tagEls.forEach(function(tg){
        if(!show){ if(tg.el.style.opacity!=='0'){tg.el.style.opacity=0;tg.el.style.pointerEvents='none';tg.ln.style.opacity=0;tg.dot.style.opacity=0;} return; }
        tagV.copy(tg.v).applyMatrix4(root.matrixWorld).project(camera);
        var sx=(tagV.x*0.5+0.5)*w2, sy=(-tagV.y*0.5+0.5)*h2, vis=(tagV.z<1);
        if(!tg.tw||tg.el.style.opacity==='0') tg.tw=tg.el.offsetWidth||220;
        var tx=tg.slot[0]==='L'?12:Math.round(w2-12-tg.tw);
        /* the main info panel sits top-centre, so both columns can use the full height */
        var ty=Math.round(h2*(0.14+tg.slot[1]*0.185));
        tg.el.style.transform='translate('+tx+'px,'+ty+'px)';
        tg.el.style.opacity=vis?1:0;
        tg.el.style.pointerEvents=vis?'auto':'none';
        /* leader line starts EXACTLY on the card border, at the card's vertical centre: it stays
           stuck to the box edge whether the card is collapsed or expanded (hot cards re-measure
           live so the anchor rides the open animation) */
        var isHot=tg.el.classList.contains('hot');
        if(isHot||!tg.th||(tg.thUntil&&t<tg.thUntil)) tg.th=tg.el.offsetHeight||34;
        var x1=tg.slot[0]==='L'?tx+tg.tw:tx, y1=ty+Math.round(tg.th/2);
        tg.ln.setAttribute('x1',x1); tg.ln.setAttribute('y1',y1);
        tg.ln.setAttribute('x2',Math.round(sx)); tg.ln.setAttribute('y2',Math.round(sy));
        tg.dot.setAttribute('cx',Math.round(sx)); tg.dot.setAttribute('cy',Math.round(sy));
        tg.ln.style.opacity=vis?1:0; tg.dot.style.opacity=vis?1:0;
      });
    }
    renderer.render(scene,camera); }
  function resize(){ if(!renderer)return; var w=stageEl.clientWidth||300,h=stageEl.clientHeight||300;
    renderer.shadowMap.needsUpdate=true;/* resize renders outside the frame loop: bake fresh shadows */
    portrait=w<900;/* match the mobile-UI CSS breakpoint (@media max-width:900px) so the 3D framing and the chip/caption chrome switch together */
    renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();
    if(portrait){ camera.position.set(14.4,10.1,14.9); camera.lookAt(0,1.15,0); }
    else { camera.position.set(8.8,6.05,9.2); camera.lookAt(-3.2,-0.65,0); }
    renderer.render(scene,camera); }
  try{init(THREE_MOD);}catch(err){}
})();

/* ---- GSAP: progress bar, hero mask reveal, reveals, counters, pinned stage ---- */
(function(){
  if(reduce){
    document.querySelectorAll('[data-count]').forEach(function(el){el.textContent=(+el.dataset.count).toLocaleString('en-US');});
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  /* scroll progress bar */

  /* hero masked line reveal is CSS-driven (see @keyframes hlRise). Add .motion when the loader lifts
     so the intro plays in view. Content is visible by default, so if the signal never arrives the
     headline just shows without the intro, and a frozen ticker can never strand it (rule 10). */
  (function(){
    var root=document.documentElement, played=false;
    function playHero(){ if(played) return; played=true; root.classList.add('motion'); }
    var _ld=document.getElementById('loader');
    if(!_ld || _ld.classList.contains('ld-done')) playHero();
    else { onWin('iaq:loaderdone',playHero,{once:true}); _setTo(playHero,2000); }
  })();

  /* reveals: visible by default, immediateRender:false */
  gsap.utils.toArray('[data-reveal]').forEach(function(el){
    gsap.from(el,{opacity:0,y:24,duration:.9,ease:'power3.out',immediateRender:false,scrollTrigger:{trigger:el,start:'top 90%'}});
  });

  /* counters */
  gsap.utils.toArray('[data-count]').forEach(function(el){
    var end=+el.dataset.count;
    el.textContent='0';
    ScrollTrigger.create({trigger:el,start:'top 92%',once:true,onEnter:function(){
      gsap.to({v:0},{v:end,duration:1.6,ease:'power2.out',onUpdate:function(){el.textContent=Math.round(this.targets()[0].v).toLocaleString('en-US');}});
    }});
  });

  /* gentle hero canvas parallax, desktop only */
  var mm=gsap.matchMedia();
  _cleanups.push(function(){ try{ mm.revert(); }catch(e){} });
  mm.add('(min-width: 761px)',function(){
    gsap.to('#heroCanvas',{yPercent:14,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:.6,invalidateOnRefresh:true}});
    gsap.fromTo('.globe-host',{y:20},{y:-20,ease:'none',scrollTrigger:{trigger:'.glance',start:'top bottom',end:'bottom top',scrub:.5,invalidateOnRefresh:true}});
    /* no vertical parallax on the film poster: it translated the 100%-tall image and exposed the
       dark card background as a black band top/bottom before the loop kicked in. The poster now sits
       static and fully covers the card (a clean thumbnail); click still opens the film. */
    gsap.fromTo('.gstats',{y:26},{y:-14,ease:'none',scrollTrigger:{trigger:'.glance',start:'top bottom',end:'bottom top',scrub:.9,invalidateOnRefresh:true}});
  });

  /* pinned showpiece: the cleanroom assembles in four layers.
     Layers are visible by default; a missed trigger leaves the full cutaway. */
  mm.add('(prefers-reduced-motion: no-preference)',function(){
    var stage=document.getElementById('stage');
    if(!stage)return;
    var coarse=(window.matchMedia&&matchMedia('(pointer:coarse)').matches)||window.innerWidth<900;/* touch/narrow: lighter scrub so the model tracks the finger instead of trailing ~2.2s */
    stage.classList.add('pinned');
    var caps=gsap.utils.toArray('#stagecaps .stagecap');
    var cueFill=document.querySelector('.scroll-cue .cue-bar i');
    var cueEl=cueFill?cueFill.closest('.scroll-cue'):null;
    var railFill=document.getElementById('capRailFill');
    var mrailFill=document.getElementById('spMrailFill');            /* mobile scroll-down rail (static HTML, so present now) */
    var mtBarFill=null;                                              /* top-panel scroll-continue gauge (built async by the 3D layer, grabbed lazily) */
    var mrailEl=mrailFill?mrailFill.closest('.sp-mrail'):null;
    /* Layers stay visible in CSS. They are hidden only inside a proven-live trigger,
       the moment the stage first peeks into the viewport, so a dead ScrollTrigger
       can never strand the cutaway half-built. */
    var hideOnce=ScrollTrigger.create({
      trigger:stage,start:'top bottom',once:true,
      onEnter:function(){gsap.set(['#gMEP','#gFFU','#gFlow'],{opacity:0}); S3D.str=0;S3D.mep=0;S3D.ffu=0;S3D.flow=0;S3D.zoom=0;S3D.spin=0; window.__resetSM=true;}
    });
    var tl=gsap.timeline({
      scrollTrigger:{
        trigger:'#showpiece',start:'top top',end:'bottom bottom',scrub:coarse?0.9:1.2,invalidateOnRefresh:true,/* Lenis now supplies the inertia; the old 2.2 on top of it double-smoothed into a laggy, heavy feel */
        /* no snap: the scroll parks wherever the user stops, even mid-fall (SM smoothing still paces the parts) */
        onToggle:function(self){ window.__spActive=self.isActive; },
        /* the scrub timeline can lag past the section edges and strand S3D mid-build (e.g. prog=1 but
           flow<1, zoom=0). Settle it to a clean boundary the moment the section is fully out of range,
           so scrolling back UP always reverses from a coherent end/start state. */
        onLeave:function(){ S3D.str=1;S3D.mep=1;S3D.ffu=1;S3D.flow=1;S3D.zoom=1;S3D.spin=0.48; if(cueEl)cueEl.classList.remove('cue-on'); if(stage)stage.classList.remove('sp-hold'); },
        onLeaveBack:function(){ S3D.str=0;S3D.mep=0;S3D.ffu=0;S3D.flow=0;S3D.zoom=0;S3D.spin=0; if(cueEl)cueEl.classList.remove('cue-on'); if(stage)stage.classList.remove('sp-hold'); },
        onUpdate:function(self){
          window.__spActive=self.isActive;
          S3D.prog=self.progress;
          /* caption bands keyed to the REAL timeline: each layer ASSEMBLES then holds+turns before
             the next kicks in. A layer's caption stays lit through its turn-hold. Assemble starts:
             structure 0.15 (IMMEDIATE, user: no empty-stage wait), MEP 1.25, FFU 2.35, flow 3.45,
             zoom 4.55 — keep in sync with tl below */
          var u=self.progress*self.animation.duration();/* key on real timeline seconds, robust to tail changes */
          var idx = u>=4.55 ? -1 : u>=3.45 ? 3 : u>=2.35 ? 2 : u>=1.25 ? 1 : 0;
          caps.forEach(function(c,i){c.classList.toggle('act',i===idx);});
          /* layer-progress rail: fills from the first layer starting (u=0.15) to all four in (u=4.55),
             so the bar reaches full exactly as the model begins its final zoom */
          if(railFill){ var rp=(u-0.15)/(4.55-0.15); rp=rp<0?0:rp>1?1:rp;
            railFill.style.clipPath='inset(0 0 '+((1-rp)*100).toFixed(1)+'% 0)'; }
          /* cue bar: fills across the zoom phase (zoom start -> section release), keyed to real
             timeline seconds so it stays aligned when the tail length changes */
          /* the bar is the section GATE, reached differently by layout:
             - DESKTOP/tablet-landscape: the hover tags sit AROUND the model, so the bottom cue coexists
               with them. It appears the MOMENT the zoom completes (u=6.0) and fills across the hold 6.0->6.9.
             - MOBILE/tablet-portrait: the chip strip owns the bottom, so it gets an interactive dwell first
               (u 6.0->6.6), then the cue arrives at u>6.6 and sp-hold hands the bottom from strip to cue. */
          /* ONE cue per layout. DESKTOP: the bottom chip, zoom-end (6.0) -> release. MOBILE: only the
             top-panel gauge (its bottom chip is display:none in CSS), filling to 100% exactly at the
             release. Upper gate D-0.02 hides the fixed chip just before the sticky release
             (gate on u, not self.progress: the scrubbed progress oscillates near 1 and thrashes). */
          var D=self.animation.duration();
          if(cueFill){ var mob=window.innerWidth<=900;
            var f=(u-5.25)/(D-5.25); f=f<0?0:f>1?1:f; cueFill.style.transform='scaleX('+f.toFixed(3)+')';
            if(cueEl) cueEl.classList.toggle('cue-on', !mob && u>5.25 && u<D-0.02); }
          if(!mtBarFill) mtBarFill=document.getElementById('mtBarFill');
          if(mtBarFill){ var tf=(u-5.1)/(D-5.1); tf=tf<0?0:tf>1?1:tf; mtBarFill.style.transform='scaleX('+tf.toFixed(3)+')'; }
          /* mobile left-edge rail: literal whole-runway scroll progress (0..1), filled top->down. Keyed on
             self.progress (not u-seconds) so it fills 1:1 with how far the section has scrolled. */
          if(mrailFill){ var mp=self.progress; mp=mp<0?0:mp>1?1:mp;
            mrailFill.style.clipPath='inset(0 0 '+((1-mp)*100).toFixed(1)+'% 0)';
            if(mrailEl){ var aff=(0.90-mp)/(0.90-0.70); aff=aff<0?0:aff>1?1:aff;
              mrailEl.style.setProperty('--aff',aff.toFixed(2));
              mrailEl.classList.toggle('done',mp>0.985); }
          }
        }
      }
    });
    /* 4 stages, each: ASSEMBLE (~.7) then HOLD-AND-TURN (~.4) before the next kicks in, so a layer
       lands, the model turns a bit to let the user take it in, then the next layer starts. The build
       starts IMMEDIATELY at u=0.15 (user: no empty-stage wait). Timeline total is 5.6 units; the
       caption/cue math keys off self.animation.duration(). Assemble starts: str .15, MEP 1.25, FFU 2.35, flow 3.45. */
    tl.fromTo('#gMEP',{opacity:0,y:34},{opacity:1,y:0,duration:.7,ease:'power2.inOut',immediateRender:false},1.25)
      .fromTo('#gFFU',{opacity:0,y:-26},{opacity:1,y:0,duration:.7,ease:'power2.inOut',immediateRender:false},2.35)
      .fromTo('#gFlow',{opacity:0},{opacity:1,duration:.7,ease:'power2.inOut',immediateRender:false},3.45)
      .to({},{duration:.12});
    tl.fromTo(S3D,{str:0},{str:1,duration:.7,ease:'power2.inOut',immediateRender:false},0.15)
      .fromTo(S3D,{mep:0},{mep:1,duration:.7,ease:'power2.inOut',immediateRender:false},1.25)
      .fromTo(S3D,{ffu:0},{ffu:1,duration:.7,ease:'power2.inOut',immediateRender:false},2.35)
      .fromTo(S3D,{flow:0},{flow:1,duration:.7,ease:'power2.inOut',immediateRender:false},3.45);
    /* the post-landing turns: a small cumulative rotation nudge parked in each hold between layers */
    tl.fromTo(S3D,{spin:0},{spin:0.12,duration:.4,ease:'power1.inOut',immediateRender:false},0.85)
      .fromTo(S3D,{spin:0.12},{spin:0.24,duration:.4,ease:'power1.inOut',immediateRender:false},1.95)
      .fromTo(S3D,{spin:0.24},{spin:0.36,duration:.4,ease:'power1.inOut',immediateRender:false},3.05)
      .fromTo(S3D,{spin:0.36},{spin:0.48,duration:.4,ease:'power1.inOut',immediateRender:false},4.15);
    tl.fromTo(S3D,{zoom:0},{zoom:1,duration:0.7,ease:'power2.inOut',immediateRender:false},4.55)
      /* SHORT tail everywhere (user: no extra scroll-to-continue hold): the build finishes, the cue
         bar fills across this brief settle, the section releases. The mobile chip strip stays
         interactive right up to the release, so it needs no dwell of its own. */
      .to({},{duration:0.35});
    return function(){
      hideOnce.kill();
      gsap.set(['#gMEP','#gFFU','#gFlow'],{clearProps:'all'}); S3D.str=1;S3D.mep=1;S3D.ffu=1;S3D.flow=1;
      stage.classList.remove('pinned');
      caps.forEach(function(c){c.classList.remove('act');});
    };
  });

  var _irt;
  document.querySelectorAll('img').forEach(function(im){
    if(!im.complete){ im.addEventListener('load',function(){ clearTimeout(_irt); _irt=_setTo(function(){try{ScrollTrigger.refresh();}catch(e){}},150); },{once:true}); }
  });
  onWin('load',function(){ScrollTrigger.refresh();});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){ if(dead) return; try{ScrollTrigger.refresh();}catch(e){} });
})();


/* ---- featured projects: four live 3D miniatures, hover to turn ---- */
(function(){
  var hosts=document.querySelectorAll('.fp3d'); if(!hosts.length) return;
  /* these miniatures are hover-to-turn, which buys nothing on touch, and four live WebGL contexts
     would push the phone past iOS Safari's live-context cap and blank a canvas. On touch/narrow (and
     reduced-motion) render one frame to a static poster and free the context (see build). */
  var mobile=(window.matchMedia&&matchMedia('(hover:none)').matches)||window.innerWidth<900;
  function build(T,host){
    var canvas=host.querySelector('canvas');
    var scene=new T.Scene();
    var camera=new T.PerspectiveCamera(30,16/9,0.1,60); camera.position.set(3.4,2.3,3.6); camera.lookAt(0,0.22,0);
    var renderer=_reg(new T.WebGLRenderer({canvas:canvas,antialias:true,alpha:true,preserveDrawingBuffer:(mobile||reduce)}));
    renderer.setClearColor(0x000000,0); renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));
    renderer.toneMapping=T.ACESFilmicToneMapping; renderer.toneMappingExposure=1.12;
    scene.add(new T.HemisphereLight(0xF2F7FF,0x2E374A,1.5));
    var sun=new T.DirectionalLight(0xF4F7FF,2.0); sun.position.set(4,6,3); scene.add(sun);
    var rim=new T.DirectionalLight(0x8FB5FF,0.7); rim.position.set(-4,3,-4); scene.add(rim);
    var g=new T.Group(); scene.add(g); g.position.y=-0.28;
    function mat(c,o){o=o||{};return new T.MeshStandardMaterial({color:c,roughness:o.rough!==undefined?o.rough:.62,metalness:o.metal||0});}
    function bx(w,h,d,c,o){var m=new T.Mesh(new T.BoxGeometry(w,h,d),mat(c,o));
      m.add(new T.LineSegments(new T.EdgesGeometry(m.geometry),new T.LineBasicMaterial({color:0x0B1120,transparent:true,opacity:.4})));return m;}
    function cl(r,h,c,o){return new T.Mesh(new T.CylinderGeometry(r,r,h,18),mat(c,o));}
    var pad=bx(2.9,0.08,2.0,0x2B3547); pad.position.y=-0.05; g.add(pad);
    var disc=new T.Mesh(new T.CircleGeometry(2.6,40),new T.MeshBasicMaterial({color:0x0C1526,transparent:true,opacity:.55}));
    disc.rotation.x=-Math.PI/2; disc.position.y=-0.1; g.add(disc);
    var kind=host.dataset.kind;
    if(kind==='fab'){
      var b1=bx(1.9,0.62,1.25,0xE8EDF4); b1.position.y=0.32; g.add(b1);
      var band=bx(1.92,0.07,1.27,0xC22730); band.position.y=0.52; g.add(band);
      var pent=bx(0.9,0.3,0.7,0xD5DCE6); pent.position.set(-0.3,0.78,0); g.add(pent);
      for(var i2=0;i2<2;i2++){var ru=bx(0.26,0.16,0.26,0xB9C2CE); ru.position.set(0.55+i2*0.4,0.71,-0.3); g.add(ru);}
      var stk=cl(0.05,0.7,0xC7CFDA); stk.position.set(0.85,0.75,0.4); g.add(stk);
      var dr=bx(0.22,0.3,0.03,0xC22730); dr.position.set(-0.5,0.16,0.64); g.add(dr);
    } else if(kind==='backend'){
      var m1=bx(1.5,0.55,1.05,0xE8EDF4); m1.position.set(-0.45,0.28,0); g.add(m1);
      var m2=bx(0.95,0.82,0.8,0xDDE3EB); m2.position.set(0.75,0.42,-0.1); g.add(m2);
      var trim=bx(0.97,0.06,0.82,0xC22730); trim.position.set(0.75,0.86,-0.1); g.add(trim);
      var brg=bx(0.42,0.18,0.3,0xC7CFDA); brg.position.set(0.15,0.5,0); g.add(brg);
      for(var i3=0;i3<3;i3++){var ah=bx(0.24,0.14,0.3,0xB9C2CE); ah.position.set(-0.85+i3*0.4,0.63,0.15); g.add(ah);}
    } else if(kind==='dryroom'){
      var hall=bx(2.2,0.5,1.15,0xE8EDF4); hall.position.y=0.26; g.add(hall);
      for(var i4=0;i4<7;i4++){var rib=bx(0.05,0.05,1.2,0xC7CFDA); rib.position.set(-0.95+i4*0.32,0.54,0); g.add(rib);}
      var end=bx(0.03,0.32,0.5,0xC22730); end.position.set(1.11,0.22,0.15); g.add(end);
      var silo=cl(0.16,0.62,0xD5DCE6); silo.position.set(-1.28,0.32,0.35); g.add(silo);
      var lock=bx(0.4,0.3,0.35,0xD5DCE6); lock.position.set(1.28,0.16,-0.25); g.add(lock);
    } else {
      var plinth=bx(2.2,0.12,1.3,0x39424F); plinth.position.y=0.07; g.add(plinth);
      for(var i5=0;i5<3;i5++){
        var chb=bx(0.6,0.42,0.55,0xCBD4DF); chb.position.set(-0.7+i5*0.7,0.36,-0.15); g.add(chb);
        var fan=cl(0.16,0.03,0x39424F); fan.position.set(-0.7+i5*0.7,0.585,-0.15); g.add(fan);
        var pnl=bx(0.1,0.26,0.4,0xC22730); pnl.position.set(-0.42+i5*0.7,0.3,-0.15); g.add(pnl);
      }
      var hdr=cl(0.05,2.0,0xC22730); hdr.rotation.z=Math.PI/2; hdr.position.set(0,0.2,0.45); g.add(hdr);
      for(var i6=0;i6<2;i6++){var pmp=cl(0.09,0.2,0xA63A48); pmp.rotation.z=Math.PI/2; pmp.position.set(-0.35+i6*0.7,0.16,0.45); g.add(pmp);}
    }
    var ry=-0.5,ryt=-0.5,raf2=null,visb=false,hovering=false;
    function resize(){var w=host.clientWidth||300,h2=host.clientHeight||170;renderer.setSize(w,h2,false);camera.aspect=w/h2;camera.updateProjectionMatrix();renderer.render(scene,camera);}
    resize();
    /* touch/narrow (no hover) and reduced-motion: bake ONE frame to a static <img> poster, then free
       the GL context so four live miniatures can't push the phone past the live-context cap (7->3). */
    if(mobile||reduce){
      g.rotation.y=-0.5; renderer.render(scene,camera);
      var shot=false;
      try{ var u=canvas.toDataURL('image/png'); var im=new Image(); im.setAttribute('aria-hidden','true');
        im.style.cssText='width:100%;height:100%;display:block'; im.src=u; canvas.style.display='none'; host.appendChild(im); shot=true; }catch(e){}
      /* only free the context once the poster is in place; if the snapshot failed, keep the live frame
         rather than blanking the canvas */
      if(shot){ try{ var gl=renderer.getContext(); var lo=gl&&gl.getExtension('WEBGL_lose_context'); if(lo)lo.loseContext(); }catch(e){}
                try{ renderer.dispose(); renderer.forceContextLoss(); }catch(e){} }
      return;
    }
    if(window.ResizeObserver){try{_ro(resize).observe(host);}catch(e){}}
    host.addEventListener('pointermove',function(e){var r=host.getBoundingClientRect();hovering=true;
      ryt=-0.5+((e.clientX-r.left)/r.width-0.5)*1.6;},{passive:true});
    host.addEventListener('pointerleave',function(){hovering=false;});
    var fN=0;
    function frame(ts){ raf2=_raf(frame); if(!visb)return;
      fN++; if(!hovering&&(fN&1)) return;/* ambient turn renders at 30fps; hover gets the full 60 */
      if(!hovering) ryt+=0.0044;/* doubled step keeps the visual turn speed at half rate */
      ry+=(ryt-ry)*0.07; g.rotation.y=ry;
      renderer.render(scene,camera); }
    if(window.IntersectionObserver){ try{ _io(function(es){ visb=es[0].isIntersecting;
      if(visb){ if(!raf2) raf2=_raf(frame); } else if(raf2){ cancelAnimationFrame(raf2); raf2=null; } }).observe(host);
    }catch(e){ visb=true; raf2=_raf(frame);} } else { visb=true; raf2=_raf(frame); }
  }
  try{
    /* lazy: each miniature builds its WebGL context only when it nears the viewport, so all four
       are not spun up at page load (keeps the page's live GL-context count lower on entry) */
    if(window.IntersectionObserver){
      var io=_io(function(es){ es.forEach(function(en){ if(en.isIntersecting){ io.unobserve(en.target); try{build(THREE_MOD,en.target);}catch(_){} } }); },{rootMargin:'250px'});
      hosts.forEach(function(h){ io.observe(h); });
    } else { hosts.forEach(function(h){build(THREE_MOD,h);}); }
  }catch(err){}
})();


/* ---- closing section: interactive 3D IAQ campus, follows the cursor ---- */
(function(){
  var host=document.querySelector('.close-stage')||document.querySelector('.close3d'); if(!host) return;
  var canvas=document.getElementById('closeCv'); if(!canvas) return;
  var T,renderer,scene,camera,g,beacons=[],raf=null,visb=false,truck,dust,stars,clouds,starMat,trees=[],folk=[];
  var px=0,py=0,pxt=0,pyt=0;
  /* self-contained reduced-motion flag so this engine works on every page it is propagated to */
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function mat(c,o){o=o||{};return new T.MeshStandardMaterial({color:c,roughness:o.rough!==undefined?o.rough:.65,metalness:o.metal||0});}
  function bx(w,h,d,c,o){var m=new T.Mesh(new T.BoxGeometry(w,h,d),mat(c,o));
    m.castShadow=true;m.receiveShadow=true;
    m.add(new T.LineSegments(new T.EdgesGeometry(m.geometry),new T.LineBasicMaterial({color:0x0B1120,transparent:true,opacity:.38})));return m;}
  function cl(r,h,c,o){var m=new T.Mesh(new T.CylinderGeometry(r,r,h,18),mat(c,o));m.castShadow=true;return m;}
  function init(mod){
    T=mod;
    scene=new T.Scene();
    /* the ground plane's far edge was cutting a hard horizon line across the canvas.
       Fog it out into the section colour so the site dissolves into the night. */
    scene.fog=new T.Fog(0x141F36,26,49);
    /* the sky is rendered, not CSS: both the fog and the backdrop then pass through the
       same ACES tone mapping, so the ground's far edge has nothing to step against.
       The CSS scrim still masks the canvas top and bottom into the section navy. */
    scene.background=new T.Color(0x141F36);/* matches the horizon band of .close-viz so the ground edge vanishes */
    camera=new T.PerspectiveCamera(30,2,3,66);/* tight near/far: the depth buffer stops shimmering on the facades */
    renderer=_reg(new T.WebGLRenderer({canvas:canvas,antialias:true,alpha:true}));
    renderer.setClearColor(0x000000,0); renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));
    renderer.shadowMap.enabled=true; renderer.shadowMap.type=T.PCFShadowMap;/* grounded contact shadows read as a real site */
    renderer.toneMapping=T.ACESFilmicToneMapping; renderer.toneMappingExposure=1.1;
    scene.add(new T.HemisphereLight(0xEAF2FF,0x2A3346,1.05));
    var sun=new T.DirectionalLight(0xF4F7FF,2.2); sun.position.set(7,11,5);
    sun.castShadow=true; sun.shadow.mapSize.set(512,512);
    sun.shadow.camera.left=-9; sun.shadow.camera.right=9; sun.shadow.camera.top=7; sun.shadow.camera.bottom=-5;
    sun.shadow.camera.near=2; sun.shadow.camera.far=32; sun.shadow.bias=-0.0002; sun.shadow.normalBias=0.03;
    scene.add(sun);
    var rim=new T.DirectionalLight(0x7FA8FF,0.8); rim.position.set(-6,5,-7); scene.add(rim);
    /* subtle dusk fog: the far ground melts into the sky instead of a hard edge */
    scene.fog=new T.Fog(0x14203C,24,64);
    /* ---- SKY: dusk gradient dome + starfield + soft moon + horizon haze + drifting clouds ---- */
    (function(){
      var scn=document.createElement('canvas'); scn.width=8; scn.height=256; var sc=scn.getContext('2d');
      var sg=sc.createLinearGradient(0,0,0,256);
      /* cool twilight: a SMOOTH monotonic ramp from deep navy zenith to a soft blue horizon glow,
         evenly spaced so there is no hard band edge / horizontal seam line in the sky */
      sg.addColorStop(0.00,'#05080F'); sg.addColorStop(0.28,'#0A1526'); sg.addColorStop(0.48,'#152740');
      sg.addColorStop(0.64,'#1F3B61'); sg.addColorStop(0.80,'#2A5080'); sg.addColorStop(0.92,'#326096');
      sg.addColorStop(1.00,'#35669E');
      sc.fillStyle=sg; sc.fillRect(0,0,8,256);
      var stex=new T.CanvasTexture(scn); if(T.SRGBColorSpace) stex.colorSpace=T.SRGBColorSpace;
      var sky=new T.Mesh(new T.SphereGeometry(72,24,16),new T.MeshBasicMaterial({map:stex,side:T.BackSide,depthWrite:false,fog:false}));
      sky.position.y=-8; sky.renderOrder=-10; scene.add(sky);
    })();
    function radialTex(stops){ var cv=document.createElement('canvas'); cv.width=cv.height=128; var g2=cv.getContext('2d');
      var rg=g2.createRadialGradient(64,64,2,64,64,64); stops.forEach(function(s){rg.addColorStop(s[0],s[1]);});
      g2.fillStyle=rg; g2.fillRect(0,0,128,128); return new T.CanvasTexture(cv); }
    /* sparse dusk stars, low over the horizon so a few sit in the visible sky strip */
    var stn=130, stp=new Float32Array(stn*3);
    for(var si=0;si<stn;si++){ var th=Math.random()*Math.PI*2, rr=40+Math.random()*16;
      stp[si*3]=Math.cos(th)*rr; stp[si*3+1]=2.6+Math.random()*9; stp[si*3+2]=Math.sin(th)*rr-2; }
    var stgeo=new T.BufferGeometry(); stgeo.setAttribute('position',new T.BufferAttribute(stp,3));
    starMat=new T.PointsMaterial({color:0xDCE8FF,size:0.2,transparent:true,opacity:0.8,depthWrite:false,fog:false});
    stars=new T.Points(stgeo,starMat); scene.add(stars);
    /* soft moon low on the horizon (a moonrise behind the site), off to one side so buildings don't hide it */
    var moon=new T.Sprite(new T.SpriteMaterial({map:radialTex([[0,'rgba(240,244,255,0.95)'],[0.32,'rgba(210,224,255,0.4)'],[0.6,'rgba(200,216,250,0.12)'],[1,'rgba(200,216,250,0)']]),transparent:true,depthWrite:false,fog:false}));
    moon.scale.set(6,6,1); moon.position.set(15.5,3.6,-18); scene.add(moon);
    /* (horizon haze removed: its additive glow band drew a hard horizontal line where it met the dark sky) */
    /* drifting cloud banks along the horizon */
    var cloudTex=radialTex([[0,'rgba(158,176,212,0.42)'],[0.5,'rgba(158,176,212,0.11)'],[1,'rgba(158,176,212,0)']]);
    clouds=[];
    for(var ci=0;ci<6;ci++){ var csp=new T.Sprite(new T.SpriteMaterial({map:cloudTex,transparent:true,depthWrite:false,fog:false,opacity:0.5}));
      var cw=7+Math.random()*7; csp.scale.set(cw,cw*0.3,1);
      csp.position.set(-18+Math.random()*36,2.8+Math.random()*3.2,-11-Math.random()*9);
      csp.userData.sp=0.5+Math.random()*0.7; scene.add(csp); clouds.push(csp); }
    g=new T.Group(); scene.add(g);
    /* ---- ground: layered site, not a black void ----
       dark asphalt base, a lit concrete apron the campus stands on, kerbs, and a front service road */
    var gnd=new T.Mesh(new T.PlaneGeometry(96,64),new T.MeshStandardMaterial({color:0x090D14,roughness:1,metalness:0}));
    gnd.rotation.x=-Math.PI/2; gnd.position.y=-0.03; gnd.receiveShadow=true; g.add(gnd);
    /* concrete apron slab: the campus footprint sits on a grounded pad */
    var apron=new T.Mesh(new T.PlaneGeometry(12.6,5.6),new T.MeshStandardMaterial({color:0x1B2432,roughness:.9,metalness:0}));
    apron.rotation.x=-Math.PI/2; apron.position.set(0.2,-0.012,0.05); apron.receiveShadow=true; g.add(apron);
    /* apron kerb: a thin raised edge around the pad */
    var kerbMat=new T.MeshStandardMaterial({color:0x2A3546,roughness:.85});
    [[0.2,-0.008,3.60,12.6,0.16],[0.2,-0.008,-2.75,12.6,0.16]].forEach(function(k){
      var kb=new T.Mesh(new T.BoxGeometry(k[3],0.06,k[4]),kerbMat); kb.position.set(k[0],0.02,k[2]); kb.receiveShadow=true; g.add(kb); });
    [[-6.1,-0.008,0.40,0.16,6.4],[6.5,-0.008,0.40,0.16,6.4]].forEach(function(k){
      var kb=new T.Mesh(new T.BoxGeometry(k[3],0.06,k[4]),kerbMat); kb.position.set(k[0],0.02,k[2]); kb.receiveShadow=true; g.add(kb); });
    /* front service road (the truck + bollards run here) with a dashed centre line */
    var road=new T.Mesh(new T.PlaneGeometry(15,1.80),new T.MeshStandardMaterial({color:0x0C1017,roughness:1}));
    road.rotation.x=-Math.PI/2; road.position.set(0.2,-0.006,2.62); road.receiveShadow=true; g.add(road);
    for(var dl=0;dl<11;dl++){ var dash=new T.Mesh(new T.PlaneGeometry(0.5,0.05),new T.MeshBasicMaterial({color:0x5C6A7E}));
      dash.rotation.x=-Math.PI/2; dash.position.set(-6.3+dl*1.3,0.002,2.62); g.add(dash); }
    /* solid edge lines top and bottom of the carriageway */
    [1.80,3.44].forEach(function(ez){ var eg=new T.Mesh(new T.PlaneGeometry(15,0.035),new T.MeshBasicMaterial({color:0x46536A}));
      eg.rotation.x=-Math.PI/2; eg.position.set(0.2,0.002,ez); g.add(eg); });
    /* landscaped strip behind the campus for depth */
    var lawn=new T.Mesh(new T.PlaneGeometry(12.6,0.9),new T.MeshStandardMaterial({color:0x122019,roughness:1}));
    lawn.rotation.x=-Math.PI/2; lawn.position.set(0.2,-0.008,-2.4); lawn.receiveShadow=true; g.add(lawn);
    /* ---- floor detail: expansion joints, parking bays, landscaping ---- */
    /* concrete expansion joints (subtle darker seams gridding the apron) */
    var jointMat=new T.MeshBasicMaterial({color:0x121A26,transparent:true,opacity:0.55});
    for(var jz=0;jz<4;jz++){ var jl=new T.Mesh(new T.PlaneGeometry(12.4,0.03),jointMat); jl.rotation.x=-Math.PI/2; jl.position.set(0.2,0.0006,-2.0+jz*1.35); g.add(jl); }
    for(var jx=0;jx<7;jx++){ var jc=new T.Mesh(new T.PlaneGeometry(0.03,5.4),jointMat); jc.rotation.x=-Math.PI/2; jc.position.set(-5.6+jx*1.72,0.0006,0.05); g.add(jc); }
    /* painted parking bays, front-left corner of the apron */
    var lineMat=new T.MeshBasicMaterial({color:0x8B97AB});
    for(var pk=0;pk<6;pk++){ var pl=new T.Mesh(new T.PlaneGeometry(0.045,1.0),lineMat); pl.rotation.x=-Math.PI/2; pl.position.set(-5.4+pk*0.62,0.0012,1.15); g.add(pl); }
    var pbCap=new T.Mesh(new T.PlaneGeometry(3.15,0.045),lineMat); pbCap.rotation.x=-Math.PI/2; pbCap.position.set(-4.47,0.0012,0.66); g.add(pbCap);
    /* landscaping trees along the rear lawn (two-tier conifers, they cast shadows) */
    function tree(x,z,s){ var tg=new T.Group(); tg.userData.ph=Math.random()*6.283; trees.push(tg);
      var trunk=new T.Mesh(new T.CylinderGeometry(0.05*s,0.07*s,0.5*s,6),new T.MeshStandardMaterial({color:0x4A3A2E,roughness:1})); trunk.position.y=0.25*s; trunk.castShadow=true; tg.add(trunk);
      var f1=new T.Mesh(new T.ConeGeometry(0.42*s,0.95*s,7),new T.MeshStandardMaterial({color:0x24513A,roughness:1})); f1.position.y=0.78*s; f1.castShadow=true; tg.add(f1);
      var f2=new T.Mesh(new T.ConeGeometry(0.31*s,0.66*s,7),new T.MeshStandardMaterial({color:0x2E6247,roughness:1})); f2.position.y=1.12*s; f2.castShadow=true; tg.add(f2);
      tg.position.set(x,0,z); g.add(tg); }
    [[-5.3,-2.45,1.05],[-3.5,-2.55,0.85],[1.0,-2.5,0.8],[3.6,-2.55,0.92],[5.4,-2.45,1.08]].forEach(function(tp){ tree(tp[0],tp[1],tp[2]); });
    /* campus: fab, tower, dry hall, chiller yard, stacks */
    var fab=bx(3.0,1.0,1.8,0xE8EDF4); fab.position.set(-3.6,0.5,-0.4); g.add(fab);
    var band=bx(3.04,0.1,1.84,0xC22730); band.position.set(-3.6,0.82,-0.4); g.add(band);
    var pent=bx(1.3,0.35,1.0,0xD5DCE6); pent.position.set(-3.9,1.18,-0.4); g.add(pent);
    for(var i=0;i<3;i++){var ru=bx(0.34,0.22,0.34,0xB9C2CE); ru.position.set(-4.3+i*0.6,1.11,-0.4); g.add(ru);}
    var hq=bx(1.7,1.9,1.3,0xDDE3EB); hq.position.set(-0.5,0.95,-0.9); g.add(hq);
    var hqTrim=bx(1.74,0.08,1.34,0xC22730); hqTrim.position.set(-0.5,1.94,-0.9); g.add(hqTrim);
    /* IAQ sign on the tower crown */
    var signBack=bx(1.5,0.58,0.07,0xFFFFFF,{rough:.25}); signBack.position.set(-0.5,1.56,-0.22); g.add(signBack);
    new T.TextureLoader().load('/assets/iaq-logo.webp',function(tex){
      if(T.SRGBColorSpace) tex.colorSpace=T.SRGBColorSpace;
      tex.anisotropy=8;
      var sm=new T.MeshBasicMaterial({map:tex,transparent:true});
      var sp=new T.Mesh(new T.PlaneGeometry(1.16,0.48),sm); sp.position.set(-0.5,1.56,-0.178); g.add(sp);
    });
    /* ---- photoreal curtain wall ----------------------------------------------
       Each facade is ONE textured plane, not a pile of boxes. The texture is drawn
       procedurally: sky-reflecting glass with per-pane tint jitter, drawn blinds,
       lit interiors with ceiling strips and desk silhouettes, spandrel bands and a
       brushed-aluminium mullion grid. A PMREM environment map off a dusk-sky canvas
       gives the glass genuine specular reflection and fresnel at grazing angles. */
    var ENVTEX=null;
    try{
      var sc=document.createElement('canvas'); sc.width=256; sc.height=128;
      var sx=sc.getContext('2d');
      var sg=sx.createLinearGradient(0,0,0,128);
      sg.addColorStop(0.00,'#4A6699'); sg.addColorStop(0.34,'#31486F');
      sg.addColorStop(0.49,'#1B2740'); sg.addColorStop(0.51,'#0C1420');
      sg.addColorStop(1.00,'#070C18');
      sx.fillStyle=sg; sx.fillRect(0,0,256,128);
      /* a low sun glow so the glass catches a highlight */
      var hg=sx.createRadialGradient(196,52,2,196,52,54);
      hg.addColorStop(0,'rgba(255,224,190,.85)'); hg.addColorStop(1,'rgba(255,224,190,0)');
      sx.fillStyle=hg; sx.fillRect(140,0,116,110);
      var eqt=new T.CanvasTexture(sc); eqt.mapping=T.EquirectangularReflectionMapping;
      if(T.SRGBColorSpace) eqt.colorSpace=T.SRGBColorSpace;
      var pmrem=new T.PMREMGenerator(renderer);
      ENVTEX=pmrem.fromEquirectangular(eqt).texture;
      pmrem.dispose();
    }catch(e){ ENVTEX=null; }

    function rng(seed){ return function(){ seed|=0; seed=seed+0x6D2B79F5|0;
      var t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t;
      return ((t^t>>>14)>>>0)/4294967296; }; }

    function facadeTex(cols,rows,seed){
      var CW=52,CH=58,PAD=4,SP=9;                 /* cell, frame pad, spandrel band */
      var c=document.createElement('canvas'); c.width=cols*CW; c.height=rows*CH;
      var x=c.getContext('2d');
      var l=document.createElement('canvas'); l.width=c.width; l.height=c.height;
      var lx=l.getContext('2d'); lx.fillStyle='#000'; lx.fillRect(0,0,l.width,l.height);
      /* brushed aluminium curtain-wall frame behind everything */
      var fr=x.createLinearGradient(0,0,0,c.height);
      fr.addColorStop(0,'#D9E1EC'); fr.addColorStop(0.5,'#C6CFDB'); fr.addColorStop(1,'#AEB8C6');
      x.fillStyle=fr; x.fillRect(0,0,c.width,c.height);
      /* a lit room reads as glow, not geometry: warm wash brightest at the ceiling,
         pooling toward the middle of the room and falling off at the reveals */
      function litPane(ctx2,px,py,pw,ph,wi,gain){
        var wg=ctx2.createLinearGradient(px,py,px,py+ph);
        wg.addColorStop(0,   'rgba(255,228,186,'+(0.76*wi*gain).toFixed(3)+')');
        wg.addColorStop(0.45,'rgba(238,193,140,'+(0.50*wi*gain).toFixed(3)+')');
        wg.addColorStop(1,   'rgba(178,131,84,'+(0.24*wi*gain).toFixed(3)+')');
        ctx2.fillStyle=wg; ctx2.fillRect(px,py,pw,ph);
        var rg=ctx2.createRadialGradient(px+pw*0.5,py+ph*0.34,1,px+pw*0.5,py+ph*0.34,pw*0.82);
        rg.addColorStop(0,'rgba(255,243,220,'+(0.44*wi*gain).toFixed(3)+')');
        rg.addColorStop(1,'rgba(255,243,220,0)');
        ctx2.fillStyle=rg; ctx2.fillRect(px,py,pw,ph);
      }
      var R=rng(seed);
      for(var r=0;r<rows;r++){
        for(var q=0;q<cols;q++){
          var px=q*CW+PAD, py=r*CH+PAD, pw=CW-PAD*2, ph=CH-PAD*2-SP;
          var v=R(), jit=(R()-0.5)*9;
          function cl(a,t2){ return Math.max(0,Math.round(a+jit)); }
          /* near-black glass: a whisper of dusk sky above the reflected horizon */
          var gd=x.createLinearGradient(px,py,px,py+ph);
          gd.addColorStop(0,   'rgb('+cl(38)+','+cl(52)+','+cl(80)+')');
          gd.addColorStop(0.44,'rgb('+cl(25)+','+cl(35)+','+cl(56)+')');
          gd.addColorStop(0.53,'rgb('+cl(11)+','+cl(16)+','+cl(26)+')');
          gd.addColorStop(1,   'rgb('+cl(8)+','+cl(12)+','+cl(19)+')');
          x.fillStyle=gd; x.fillRect(px,py,pw,ph);
          /* a lit room: ceiling strip and a soft warm wash. Kept sparse on purpose. */
          if(v<0.17){
            /* light spilling out of the room: a soft warm pool, no hardware, no bars */
            var wi=0.40+R()*0.60;
            litPane(x,px,py,pw,ph,wi,1.00);
            litPane(lx,px,py,pw,ph,wi,1.06);
          }
          /* half-drawn blinds, very low contrast so the facade stays quiet */
          else if(v<0.28){
            var drop=ph*(0.34+R()*0.42);
            x.fillStyle='rgba(150,163,182,.34)'; x.fillRect(px,py,pw,drop);
            x.fillStyle='rgba(90,103,124,.26)';
            for(var bl=2;bl<drop;bl+=4) x.fillRect(px,py+bl,pw,1.2);
          }
          /* clean sheet catching one soft diagonal of sky */
          else if(v<0.56){
            x.save(); x.beginPath(); x.rect(px,py,pw,ph); x.clip();
            var st=x.createLinearGradient(px,py+ph,px+pw,py);
            st.addColorStop(0,'rgba(255,255,255,0)'); st.addColorStop(0.48,'rgba(150,180,230,.12)');
            st.addColorStop(0.56,'rgba(150,180,230,.12)'); st.addColorStop(1,'rgba(255,255,255,0)');
            x.fillStyle=st; x.fillRect(px,py,pw,ph); x.restore();
          }
          /* glazing bead and head reveal */
          x.fillStyle='rgba(255,255,255,.14)'; x.fillRect(px,py,pw,1);
          x.fillStyle='rgba(0,0,0,.30)'; x.fillRect(px,py-2,pw,2);
          x.fillStyle='rgba(0,0,0,.14)'; x.fillRect(px-2,py,2,ph);
          /* spandrel: kept close to the building's own white so the wall reads as one plane */
          x.fillStyle='#C2CBD8'; x.fillRect(px-PAD,py+ph+1,pw+PAD*2,SP+PAD-1);
          x.fillStyle='rgba(255,255,255,.20)'; x.fillRect(px-PAD,py+ph+1,pw+PAD*2,1);
        }
      }
      /* mullion highlights over the grid, restrained */
      x.fillStyle='rgba(255,255,255,.18)';
      for(var mv=0;mv<=cols;mv++) x.fillRect(mv*CW-1,0,1.4,c.height);
      for(var mh=0;mh<=rows;mh++) x.fillRect(0,mh*CH-1,c.width,1.2);
      function mk(cv){ var t3=new T.CanvasTexture(cv); t3.anisotropy=8;
        if(T.SRGBColorSpace) t3.colorSpace=T.SRGBColorSpace; return t3; }
      return {map:mk(c),lit:mk(l)};
    }

    function facade(fx,fy,fz,w,h,cols,rows,face,seed){
      var tx=facadeTex(cols,rows,seed);
      var mt=new T.MeshStandardMaterial({map:tx.map,emissive:0xFFFFFF,emissiveMap:tx.lit,
        emissiveIntensity:0.85,roughness:0.09,metalness:0.20,
        polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4});
      if(ENVTEX){ mt.envMap=ENVTEX; mt.envMapIntensity=1.85; }
      var pl=new T.Mesh(new T.PlaneGeometry(w,h),mt); var d=0.035;
      if(face==='z+'){ pl.position.set(fx,fy,fz+d); }
      else if(face==='z-'){ pl.position.set(fx,fy,fz-d); pl.rotation.y=Math.PI; }
      else if(face==='x+'){ pl.position.set(fx+d,fy,fz); pl.rotation.y=Math.PI/2; }
      else { pl.position.set(fx-d,fy,fz); pl.rotation.y=-Math.PI/2; }
      g.add(pl);
    }
    /* HQ tower */
    facade(-0.5,0.74,-0.25,1.50,0.96,5,3,'z+',8641);
    facade(0.35,0.98,-0.9,1.12,1.46,4,4,'x+',3311);
    facade(-1.35,0.98,-0.9,1.12,1.46,4,4,'x-',5519);
    /* fab: long ribbon glazing */
    facade(-3.6,0.54,0.50,2.70,0.42,9,1,'z+',7717);
    facade(-2.1,0.54,-0.4,1.55,0.42,5,1,'x+',9923);
    /* dry hall clerestory */
    facade(2.9,0.48,0.60,3.05,0.34,10,1,'z+',2287);
    facade(1.2,0.48,-0.2,1.35,0.34,4,1,'x-',4703);
    var hall=bx(3.4,0.8,1.6,0xE8EDF4); hall.position.set(2.9,0.4,-0.2); g.add(hall);
    for(var r2=0;r2<8;r2++){var rib=bx(0.06,0.06,1.66,0xC7CFDA); rib.position.set(1.45+r2*0.42,0.83,-0.2); g.add(rib);}
    var dock=bx(0.5,0.4,0.9,0xD5DCE6); dock.position.set(4.85,0.2,-0.2); g.add(dock);
    /* chiller yard */
    var plinth=bx(2.2,0.12,1.1,0x39424F); plinth.position.set(0.9,0.06,1.15); g.add(plinth);
    for(var c2=0;c2<3;c2++){
      var ch=bx(0.58,0.42,0.5,0xCBD4DF); ch.position.set(0.25+c2*0.66,0.35,1.15); g.add(ch);
      /* the fan sits INSIDE the unit: only a recessed dark intake with louvres shows on top */
      var gr=bx(0.34,0.015,0.34,0x141B27,{rough:.9}); gr.position.set(0.25+c2*0.66,0.563,1.15); gr.castShadow=false; g.add(gr);
      for(var gb=0;gb<4;gb++){ var lv=bx(0.30,0.008,0.04,0x2A3546); lv.position.set(0.25+c2*0.66,0.572,1.024+gb*0.084); lv.castShadow=false; g.add(lv); }
      var pn=bx(0.09,0.24,0.36,0xC22730); pn.position.set(0.52+c2*0.66,0.28,1.15); g.add(pn);
    }
    var run=cl(0.045,1.9,0xC22730); run.rotation.z=Math.PI/2; run.position.set(0.9,0.2,1.72); g.add(run);
    /* stacks with aviation beacons */
    [[-2.1,1.6,-1.1],[3.9,1.3,-1.0]].forEach(function(sp){
      var stк=cl(0.09,sp[1],0xC7CFDA); stк.position.set(sp[0],sp[1]/2,sp[2]); g.add(stк);
      var bcn=new T.Mesh(new T.SphereGeometry(0.05,10,10),new T.MeshBasicMaterial({color:0xEC2027,transparent:true}));
      bcn.position.set(sp[0],sp[1]+0.06,sp[2]); g.add(bcn); beacons.push(bcn);
    });
    /* drifting dust in the sky */
    var dn=140, dp=new Float32Array(dn*3);
    for(var di=0;di<dn;di++){ dp[di*3]=(Math.random()-0.5)*26; dp[di*3+1]=1.5+Math.random()*6; dp[di*3+2]=-6+Math.random()*10; }
    var dg=new T.BufferGeometry(); dg.setAttribute('position',new T.BufferAttribute(dp,3));
    var dm=new T.PointsMaterial({color:0x9FB4D8,size:0.035,transparent:true,opacity:.5,depthWrite:false});
    dust=new T.Points(dg,dm); g.add(dust);
    /* a little site truck looping the front road */
    /* walking people on the front walkway (red vest = site lead) */
    folk=[];
    function walker(vest){ var Wg=new T.Group();
      var tr2=bx(0.05,0.09,0.05,0x1A2233); tr2.position.y=0.045; Wg.add(tr2);
      var bd2=bx(0.075,0.11,0.05,vest?0xC22730:0xC9D2DE); bd2.position.y=0.15; Wg.add(bd2);
      var hd2=new T.Mesh(new T.SphereGeometry(0.032,10,10),mat(0xD9B99B)); hd2.position.y=0.245; Wg.add(hd2);
      var hm2=bx(0.052,0.02,0.052,0xF2F5FA); hm2.position.y=0.272; Wg.add(hm2);
      Wg.scale.setScalar(0.72);/* a person reads ~1.75m against a 4.5m car and a 16m rig */
      return Wg; }
    [[-1.6,0.9,0.78,0.9],[0.35,1.3,0.7,1.25],[1.3,0.55,0.86,0.7],[-0.45,1.1,0.62,1.05]].forEach(function(u,i){
      var Pw=walker(i===1); Pw.position.set(u[0],0,u[2]); g.add(Pw);
      folk.push({m:Pw,x0:u[0],range:u[1],sp:u[3]}); });
    truck=new T.Group();
    /* a proper articulated rig at real scale: long chassis, tall red tractor cab with
       windscreen, grille, bumper and twin stacks, then a high white box trailer on a
       fifth wheel, riding on ten wheels. Roughly 3.5x the length of a parked car. */
    var chas=bx(1.78,0.05,0.30,0x1A2233); chas.position.set(-0.05,0.150,0); truck.add(chas);
    /* tractor unit, coupled tight to the trailer nose the way a real rig sits */
    var cab=bx(0.36,0.40,0.34,0xC22730); cab.position.set(0.62,0.375,0); truck.add(cab);
    var cabRf=bx(0.30,0.05,0.345,0xA81C24); cabRf.position.set(0.62,0.595,0); truck.add(cabRf);
    var wind=bx(0.025,0.15,0.29,0x0E1622,{rough:.22}); wind.position.set(0.805,0.455,0); truck.add(wind);
    var grille=bx(0.03,0.13,0.30,0x39424F); grille.position.set(0.808,0.265,0); truck.add(grille);
    var bump=bx(0.05,0.06,0.36,0x2A3446); bump.position.set(0.82,0.175,0); truck.add(bump);
    for(var hl=0;hl<2;hl++){ var lamp=bx(0.02,0.045,0.07,0xF2F5FA);
      lamp.position.set(0.822,0.235,hl?0.115:-0.115); truck.add(lamp); }
    [0.15,-0.15].forEach(function(sz){ var stk=cl(0.022,0.34,0x8A94A2);
      stk.position.set(0.435,0.44,sz); truck.add(stk); });
    var fifth=bx(0.22,0.05,0.26,0x39424F); fifth.position.set(0.32,0.195,0); truck.add(fifth);
    /* box trailer, nose almost touching the cab */
    var boxT=bx(1.28,0.50,0.36,0xE8EDF4); boxT.position.set(-0.28,0.47,0); truck.add(boxT);
    var bandT=bx(1.285,0.085,0.365,0xC22730); bandT.position.set(-0.28,0.305,0); truck.add(bandT);
    var boxRf=bx(1.29,0.035,0.37,0xD5DCE7); boxRf.position.set(-0.28,0.735,0); truck.add(boxRf);
    var doorT=bx(0.025,0.44,0.33,0xCBD4E0); doorT.position.set(-0.925,0.47,0); truck.add(doorT);
    /* ten wheels: steer axle, tractor tandem, trailer tandem */
    [0.68,0.22,0.06,-0.60,-0.76].forEach(function(ax){ for(var side=0;side<2;side++){
      var wh=cl(0.085,0.07,0x0D1420); wh.rotation.x=Math.PI/2;
      wh.position.set(ax,0.085,side?0.175:-0.175); truck.add(wh);
      var hub=cl(0.035,0.075,0x39424F); hub.rotation.x=Math.PI/2;
      hub.position.set(ax,0.085,side?0.178:-0.178); truck.add(hub); } });
    /* the truck is the only moving caster: drop its shadow so the static shadow map can be baked once */
    truck.traverse(function(n){ if(n.isMesh) n.castShadow=false; });
    truck.position.set(-9,0,3.05); g.add(truck);/* running the near lane of the widened carriageway */
    /* red site bollards: an even protective row along the front kerb, centred on the apron (x0.2),
       forward of the truck lane (z2.4 box reaches 2.57) and inside the side kerbs and front kerb (z2.77) */
    for(var b2=0;b2<9;b2++){var bd=cl(0.035,0.17,0xC22730); bd.position.set(-5.4+b2*1.4,0.085,1.79); g.add(bd);}
    /* parked cars in the painted bays: static, so their shadows bake with the site */
    function car(x,c){ var cg=new T.Group();
      var bd2=bx(0.285,0.105,0.60,c); bd2.position.y=0.113; cg.add(bd2);
      var cab2=bx(0.245,0.10,0.31,0x11192A,{rough:.3}); cab2.position.set(0,0.213,-0.02); cg.add(cab2);
      for(var cw=0;cw<4;cw++){ var wh2=cl(0.055,0.05,0x0D1420); wh2.rotation.z=Math.PI/2;
        wh2.position.set(cw%2?0.138:-0.138,0.055,cw<2?0.19:-0.19); cg.add(wh2); }
      cg.position.set(x,0,1.12); g.add(cg); }
    car(-5.09,0x9AA6B6); car(-3.85,0x3A4557); car(-2.61,0x7E1F27);
    resize(); onWin('resize',resize);
    if(window.ResizeObserver){try{var ro=_ro(resize);ro.observe(host);ro.observe(canvas);}catch(e){}}
    host.addEventListener('pointermove',function(e){
      var r=host.getBoundingClientRect();
      pxt=((e.clientX-r.left)/r.width-0.5); pyt=((e.clientY-r.top)/r.height-0.5);
    },{passive:true});
    host.addEventListener('pointerleave',function(){pxt=0;pyt=0;});
    renderer.render(scene,camera);
    /* bake the static shadow map once, then stop re-rendering it every frame (only the truck moves, and it no longer casts) */
    renderer.shadowMap.needsUpdate=true; renderer.render(scene,camera); renderer.shadowMap.autoUpdate=false;
    if(reduce) return;
    /* run immediately; the observer only pauses the loop when the footer is far offscreen */
    visb=true; raf=_raf(frame);
    /* watchdog: if rAF is being throttled by the embedder, step the scene on a timer */
    _setIv(function(){ if(document.hidden||!visb) return;
      if(performance.now()-lastF>700){ try{ frame(performance.now()); }catch(e){} } },350);
    if(window.IntersectionObserver){ try{ _io(function(es){ visb=es[0].isIntersecting;
      if(visb){ if(!raf) raf=_raf(frame); } else if(raf){ cancelAnimationFrame(raf); raf=null; } },{rootMargin:'200px'}).observe(host);
    }catch(e){ visb=true; if(!raf) raf=_raf(frame);} }
  }
  var lastF=0;
  function frame(ts){ raf=_raf(frame); lastF=performance.now(); if(!visb)return;
    var t=ts||0;
    px+=(pxt-px)*0.05; py+=(pyt-py)*0.05;
    /* orbit AROUND the campus centre (CX) with a gentle idle swing, so the model sits in the
       middle of the frame on every breakpoint instead of drifting to the right */
    var CX=0.3;/* campus bounding-box centre in x */
    var a=px*0.32+Math.sin(t*0.00005)*0.12;
    /* the canvas is now a WIDE contained strip, not a full-height band: camera sits closer and
       lower so the campus fills the strip while its full width stays in frame */
    var mob=canvas.clientWidth<720;
    var camR=mob?17.4:6.4, camH=(mob?4.6:3.0)+py*0.8;/* closer + lower: campus fills the strip end to end */
    camera.position.set(CX+Math.sin(a)*camR*0.55, camH, Math.cos(a)*camR*0.8+2.6);
    camera.lookAt(CX+px*0.5, mob?0.7:0.35, 0);
    beacons.forEach(function(b3,bi){ b3.material.opacity=0.35+0.65*Math.abs(Math.sin(t*0.0018+bi*1.7)); });
    if(truck){ var tp=((t*0.00013)%1); truck.position.x=-10+tp*20; }
    for(var fw=0;fw<folk.length;fw++){ var u2=folk[fw], w2=t*0.00038*u2.sp;
      u2.m.position.x=u2.x0+Math.sin(w2)*u2.range;
      u2.m.position.y=Math.abs(Math.sin(w2*7))*0.013;
      u2.m.rotation.y=Math.cos(w2)>0?Math.PI/2:-Math.PI/2; }
    if(dust){ dust.rotation.y=t*0.000012; }
    /* a light wind: each tree sways on its own phase, small enough that baked shadows still read true */
    for(var tw=0;tw<trees.length;tw++){ var tg2=trees[tw];
      tg2.rotation.z=Math.sin(t*0.0011+tg2.userData.ph)*0.024;
      tg2.rotation.x=Math.sin(t*0.0009+tg2.userData.ph*1.7)*0.014; }
    if(starMat){ starMat.opacity=0.68+0.22*Math.sin(t*0.0009); }
    if(clouds){ for(var ck=0;ck<clouds.length;ck++){ var ccl=clouds[ck]; ccl.position.x+=ccl.userData.sp*0.003; if(ccl.position.x>22)ccl.position.x=-22; } }
    renderer.render(scene,camera); }
  function resize(){ if(!renderer)return; var cr=canvas.getBoundingClientRect();
    var w=Math.round(cr.width)||host.clientWidth||600, h=Math.round(cr.height)||host.clientHeight||500;
    renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();
    var mob=w<720;
    camera.position.set(0.3,mob?4.6:3.0,mob?17.4:7.7); camera.lookAt(0.3,mob?0.7:0.35,0);
    renderer.render(scene,camera); }
  try{init(THREE_MOD);}catch(err){}
})();

/* ---- the film: magnetic play button, expanding theatre ---- */
(function(){
  var card=document.getElementById('filmCard'), stage=document.getElementById('filmStage'),
      frame=document.getElementById('filmFrame'), closeB=document.getElementById('filmClose'),
      play=document.getElementById('filmPlay');
  if(!card||!stage) return;
  var VID='VUG1QFOCL2E';
  /* Loop preview plays ONLY on hover so scrolling stays light (no video decode during scroll). */
  var lp=document.getElementById('filmLoop');
  if(lp){
    var loaded=false;
    var reduceMo=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
    function ytPost(fn){ try{ lp.contentWindow.postMessage(JSON.stringify({event:'command',func:fn,args:''}),'*'); }catch(e){} }
    function loopIn(){
      if(reduceMo) return;
      if(!loaded){ loaded=true;
        lp.addEventListener('load',function(){ window.__revealOnPlay(lp,card); },{once:true});
        lp.src=lp.getAttribute('data-src');
      } else { card.classList.add('live'); ytPost('playVideo'); }
    }
    function loopOut(){ if(!loaded) return; card.classList.remove('live'); ytPost('pauseVideo'); }
    /* Ambient loop: plays only once the film is the focus of the viewport, pauses when you scroll
       away, so the video decodes when it is being watched and never fights a fast scroll-past. */
    if(window.IntersectionObserver){
      _io(function(es){ es.forEach(function(en){ if(en.isIntersecting) loopIn(); else loopOut(); }); },{threshold:0.55}).observe(card);
    }
    card.addEventListener('pointerenter',loopIn);
  }
  if(card && play && window.matchMedia && matchMedia('(hover:hover)').matches){
    card.addEventListener('pointermove',function(e){
      var r=card.getBoundingClientRect();
      var dx=(e.clientX-r.left-r.width/2)/r.width, dy=(e.clientY-r.top-r.height/2)/r.height;
      play.style.transform='translate('+(dx*46)+'px,'+(dy*34)+'px)';
    },{passive:true});
    card.addEventListener('pointerleave',function(){play.style.transform='translate(0,0)';});
  }
  function open(){
    stage.classList.add('open'); stage.setAttribute('aria-hidden','false');
    document.documentElement.style.overflow='hidden';
    frame.innerHTML='<iframe src="https://www.youtube-nocookie.com/embed/'+VID+'?autoplay=1&rel=0&modestbranding=1" title="IAQ film" allow="autoplay; encrypted-media; fullscreen" referrerpolicy="origin" allowfullscreen></iframe>';
  }
  function close(){
    stage.classList.remove('open'); stage.setAttribute('aria-hidden','true');
    document.documentElement.style.overflow='';
    _setTo(function(){frame.innerHTML='';},450);
  }
  card.addEventListener('click',open);
  card.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});
  closeB.addEventListener('click',close);
  stage.addEventListener('click',function(e){if(e.target===stage)close();});
  onDoc('keydown',function(e){if(e.key==='Escape'&&stage.classList.contains('open'))close();});
})();

/* ---- services: the delivery cycle galaxy ---- */
(function(){
  var stage=document.getElementById('lpStage'); if(!stage) return;
  var canvas=document.getElementById('lpCv'), tagsHost=document.getElementById('lpTags');
  var D=[
    {name:'Engineering Design & Consultation',short:'Design',img:'/assets/ph-blueprint.webp',kick:'Where every great facility begins',tag:'CSA · MEP',desc:'Concept to detailed design across CSA and MEP, with expert advice through the development of the project.',pts:['Concept to detailed design across CSA and MEP','Feasibility studies and value engineering','Regulatory submissions and authority liaison']},
    {name:'Procurement',short:'Procure',img:'/assets/ph-digital.webp',kick:'The right materials, the right partners, right on time',tag:'Supply chain',desc:'Tracked, organized sourcing aligned to project requirements, quality standards and budget constraints.',pts:['Vendor qualification and tender management','Long-lead equipment tracking','Sourcing aligned to quality and budget']},
    {name:'Construction',short:'Construct',img:'/assets/ph-crane.webp',kick:'Precision engineering, built to exact standards',tag:'EPCC · EPCM',desc:'Project management, coordination and communication through a construction program tailored to each client, on schedule and within budget.',pts:['EPCC and EPCM delivery models','Site management across all trades','Schedule and cost control to handover']},
    {name:'Testing & Commissioning',short:'Commission',img:'/assets/ph-electrical.webp',kick:'Proven performance before you move in',tag:'Validation',desc:'Established T&C programs that prove every facility operates as intended, at its optimum, before handover.',pts:['ISO cleanroom classification testing','System performance verification','Certified documentation for handover']},
    {name:'Maintenance',short:'Maintain',img:'/assets/ph-boiler.webp',kick:'Protecting your investment, long after handover',tag:'Lifecycle',desc:'Planned maintenance that protects asset lifespan, minimizes downtime and keeps facilities compliant.',pts:['Planned preventive maintenance programs','Rapid breakdown response','Compliance and asset lifecycle care','Feeds the next cycle: retrofit, expansion and upgrade']}
  ];
  var elImg=document.getElementById('lpImg'),elNum=document.getElementById('lpNum'),elKick=document.getElementById('lpKick'),elTitle=document.getElementById('lpTitle'),elDesc=document.getElementById('lpDesc'),elList=document.getElementById('lpList'),elTag=document.getElementById('lpTag'),elStep=document.getElementById('lpStep'),card=document.getElementById('lpPanel');
  var stepBtns=[].slice.call(document.querySelectorAll('#lpSteps button'));
  var touch=window.matchMedia&&matchMedia('(hover:none)').matches;
  var mobile=window.matchMedia&&matchMedia('(max-width:900px)').matches;
  if(touch){var hx=document.getElementById('lpHintTx');if(hx)hx.textContent='One continuous cycle · tap a stage';}
  var active=0,swapT=null,hover=false,inView=false,api=null;
  function pad(n){return String(n);}
  function fillPanel(i){
    var d=D[i];
    elNum.textContent=pad(i+1); if(elImg)elImg.src=d.img; elKick.textContent=d.kick; elTitle.textContent=d.name; elDesc.textContent=d.desc;
    elList.innerHTML=d.pts.map(function(p){return '<li>'+p+'</li>';}).join('');
    elTag.textContent=d.tag; elStep.textContent='Step '+pad(i+1)+' of 05';
  }
  fillPanel(0);
  /* the panel is always on: content crossfades as the cycle travels */
  function swapPanel(i){
    card.classList.add('out');
    clearTimeout(swapT);
    swapT=_setTo(function(){fillPanel(i);card.classList.remove('out');},190);
  }
  function activate(i,user){
    if(i===active)return;
    var prev=active; active=i;
    stepBtns.forEach(function(b,k){b.classList.toggle('on',k===i);b.setAttribute('aria-pressed',k===i?'true':'false');});
    swapPanel(i);
    if(api)api.setActive(i,prev);
  }
  stepBtns.forEach(function(b){
    b.addEventListener('click',function(){activate(+b.dataset.i,true);});
    if(!touch)b.addEventListener('mouseenter',function(){activate(+b.dataset.i,true);});
  });
  var AUTO=5200;
  if(!reduce)_setIv(function(){ if(inView&&!hover&&!document.hidden)activate((active+1)%5,false); },AUTO);
  if(window.IntersectionObserver){
    _io(function(es){es.forEach(function(en){
      inView=en.isIntersecting;
      if(inView)stage.classList.add('go');
      if(api)api.setRun(inView);
    });},{threshold:.2}).observe(stage);
  } else { inView=true; stage.classList.add('go'); }
  stage.addEventListener('pointerenter',function(){hover=true;});
  stage.addEventListener('pointerleave',function(){hover=false;});

  /* ---------- WebGL: the delivery cycle ----------
     Composition: 01 sits at the top, the sequence runs clockwise, the ring never drifts.
     Motion: ONE motion at a time. Choosing a stage eases it to the front and everything stops.
     States: stages behind the current one read as done, ahead of it as still to come. */
  function nogl(){ stage.classList.add('nogl'); canvas.style.display='none'; stage.classList.add('go'); }
  function init(T){
    var W=stage.clientWidth||700,H=stage.clientHeight||600;
    var renderer=_reg(new T.WebGLRenderer({canvas:canvas,antialias:true,alpha:true}));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    renderer.setSize(W,H,false);
    renderer.setClearColor(0x000000,0);
    if(T.ColorManagement)T.ColorManagement.enabled=false;
    var scene=new T.Scene();
    var camera=new T.PerspectiveCamera(36,W/H,0.1,40);
    var camZ=5.6, camY=2.75;                       /* a steeper look, so the ring reads as a ring */
    camera.position.set(0,camY,camZ); camera.lookAt(0,-.02,0);

    scene.add(new T.AmbientLight(0xffffff,.9));
    var kl=new T.DirectionalLight(0xffffff,.75); kl.position.set(-2.4,4.2,3); scene.add(kl);
    var fl2=new T.DirectionalLight(0xDCE6F6,.4); fl2.position.set(2.8,1.4,-2.4); scene.add(fl2);

    /* one palette, one job each: ink draws, red marks the current stage, nothing else is red */
    var INK=new T.Color(0x3E4A63), DONE=new T.Color(0x7A879F), AHEAD=new T.Color(0x97A2B6), RED=new T.Color(0xEC2027);
    var uni=new T.Group(); scene.add(uni);
    var sys=new T.Group(); uni.add(sys);
    var R=2.02, STEP=Math.PI*2/5, A0=-Math.PI/2;   /* 01 at the top, clockwise from there */
    function angOf(i){ return A0+i*STEP; }
    function ptOn(a,y){ return new T.Vector3(R*Math.cos(a),y||0,R*Math.sin(a)); }

    /* the ring itself: the strongest line in the picture */
    var rail=new T.Mesh(new T.TorusGeometry(R,.0105,10,240),
      new T.MeshBasicMaterial({color:0x9AA5BA,transparent:true,opacity:.85}));
    rail.rotation.x=Math.PI/2; sys.add(rail);

    /* travelled distance: five pre-built arcs, 01 up to the current stage. Never ambiguous. */
    var arcs=[];
    for(var ai=0;ai<5;ai++){
      if(ai===0){ arcs.push(null); continue; }
      var pts=[]; for(var s=0;s<=ai*30;s++){ pts.push(ptOn(A0+(s/30)*STEP,.004)); }
      var tube=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),ai*30,.019,8,false),
        new T.MeshBasicMaterial({color:0xEC2027}));
      tube.visible=false; sys.add(tube); arcs.push(tube);
    }

    /* direction: five arrowheads glide slowly along the ring, so the journey itself is the motion.
       They dim as they pass a station node, then re-emerge on the other side. */
    var dirs=[];
    for(var cv=0;cv<5;cv++){
      var sh2=new T.Shape(); sh2.moveTo(.1,0); sh2.lineTo(-.058,.062); sh2.lineTo(-.03,0); sh2.lineTo(-.058,-.062);
      var cm=new T.Mesh(new T.ShapeGeometry(sh2),
        new T.MeshBasicMaterial({color:0x6F7B93,transparent:true,opacity:.92,side:T.DoubleSide}));
      cm.rotation.x=-Math.PI/2;
      dirs.push({m:cm,u:(cv+.5)/5});
      sys.add(cm);
    }
    function seatDir(d){
      var a=A0+d.u*Math.PI*2;
      d.m.position.copy(ptOn(a,.034));
      d.m.rotation.z=-a-Math.PI/2;
      /* the journey leaves the current stage: brightest just after it, spent as it returns */
      var rel=((d.u-active/5)%1+1)%1;
      var env=Math.min(1,rel/.05,(1-rel)/.14);
      /* and each arrow dips as it passes through a station node */
      var f=((d.u%.2)+.2)%.2, nd=Math.min(f,.2-f);
      d.m.material.opacity=Math.max(0,.92*env*(.12+.88*Math.min(1,nd/.05)));
    }
    dirs.forEach(seatDir);

    /* the core: an armillary of three fine rings around a small red centre. Few lines, much space. */
    var coreG=new T.Group(); sys.add(coreG);
    function circlePts2(r,n){ var p=[]; for(var k=0;k<(n||96);k++){var a2=k/(n||96)*Math.PI*2;
      p.push(new T.Vector3(r*Math.cos(a2),r*Math.sin(a2),0));} return p; }
    var CR=.36;
    function hoop(r,op,tilt,axis){
      var m=new T.LineLoop(new T.BufferGeometry().setFromPoints(circlePts2(r)),
        new T.LineBasicMaterial({color:0x9BA5B8,transparent:true,opacity:op}));
      if(axis==='x')m.rotation.x=tilt; else m.rotation.y=tilt;
      var g2=new T.Group(); g2.add(m); coreG.add(g2); return g2;
    }
    var h1=hoop(CR,.5,Math.PI/2,'x');            /* the equator, lying in the ring's own plane */
    var h2=hoop(CR*.86,.36,.32,'y');
    var h3=hoop(CR*.7,.26,-.5,'y');

    /* the centre: small, jewel-like, with the faintest bloom */
    var core=new T.Mesh(new T.SphereGeometry(.052,26,26),new T.MeshBasicMaterial({color:0xEC2027}));
    coreG.add(core);
    var coreGlow=new T.Mesh(new T.SphereGeometry(.13,20,20),
      new T.MeshBasicMaterial({color:0xEC2027,transparent:true,opacity:.07,depthWrite:false}));
    coreG.add(coreGlow);

    /* one wire per stage, and a quiet pulse that runs out along it */
    var links=[], pulses=[];
    for(var lk=0;lk<5;lk++){
      var lmat=new T.LineBasicMaterial({color:AHEAD.clone(),transparent:true,opacity:.3});
      var lp=[new T.Vector3(Math.cos(angOf(lk))*CR,0,Math.sin(angOf(lk))*CR), ptOn(angOf(lk))];
      sys.add(new T.Line(new T.BufferGeometry().setFromPoints(lp),lmat));
      links.push(lmat);
      var pm=new T.Mesh(new T.SphereGeometry(.019,10,10),
        new T.MeshBasicMaterial({color:0xEC2027,transparent:true,opacity:0,depthWrite:false}));
      sys.add(pm); pulses.push({m:pm,a:angOf(lk),t:lk*0.2});
    }

    /* ---- ONE ICON GRAMMAR ----
       Every mark: the same 0.24 envelope, the same 0.011 member, ink structure, and exactly one
       part that turns red when its stage is current. Each sits on its own node. */
    /* ---- ONE ICON GRAMMAR, DRAWN AS WIREFRAME ----
       Same envelope, same line weight, ink structure, and exactly one small solid part that turns
       red when its stage is current. Built in 3D so none of them flattens out. */
    function makeGlyph(i){
      var g=new T.Group();
      var line=new T.LineBasicMaterial({color:INK.clone(),transparent:true,opacity:.95});
      var accentMat=new T.MeshBasicMaterial({color:AHEAD.clone()});
      var accents=[];
      function edges(geo){ return new T.LineSegments(new T.EdgesGeometry(geo),line); }
      function loop(pts){ return new T.LineLoop(new T.BufferGeometry().setFromPoints(pts),line); }
      function seg(pts){ return new T.LineSegments(new T.BufferGeometry().setFromPoints(pts),line); }
      function circle(r,n){ var p=[]; for(var k=0;k<(n||44);k++){var a2=k/(n||44)*Math.PI*2;
        p.push(new T.Vector3(r*Math.cos(a2),r*Math.sin(a2),0));} return p; }
      function accent(geo){ var m=new T.Mesh(geo,accentMat); accents.push(m); return m; }

      if(i===0){          /* DESIGN: two rings truing a centre. Two reads cleaner than three. */
        g.add(loop(circle(.125)));
        var c2=loop(circle(.086)); c2.rotation.y=Math.PI/2; g.add(c2);
        g.add(accent(new T.SphereGeometry(.032,16,16)));
      }else if(i===1){    /* PROCURE: a crate around what it carries */
        g.add(edges(new T.BoxGeometry(.2,.2,.2)));
        g.add(accent(new T.BoxGeometry(.072,.072,.072)));
        g.rotation.set(.26,.44,0);
      }else if(i===2){    /* CONSTRUCT: decks landing, the next one in red */
        var p1=edges(new T.BoxGeometry(.215,.016,.215)); p1.position.y=-.072; g.add(p1);
        var p2=edges(new T.BoxGeometry(.16,.016,.16)); p2.position.y=-.024; g.add(p2);
        var md=accent(new T.BoxGeometry(.096,.024,.096)); md.position.y=.03; g.add(md);
        g.userData.build={p1:p1,p2:p2,mod:md,y1:-.072,y2:-.024,ym:.03};
      }else if(i===3){    /* COMMISSION: a filter proven by the air through it */
        g.add(edges(new T.BoxGeometry(.2,.026,.2)));
        var gr2=[]; for(var gi=-1;gi<=1;gi++){ gr2.push(new T.Vector3(-.086,0,gi*.055),new T.Vector3(.086,0,gi*.055)); }
        g.add(seg(gr2));
        var fp=[]; [[-.056,-.056],[.056,-.056],[-.056,.056],[.056,.056]].forEach(function(p){
          fp.push(new T.Vector3(p[0],-.032,p[1]),new T.Vector3(p[0],-.125,p[1])); });
        var flow=new T.LineSegments(new T.BufferGeometry().setFromPoints(fp),
          new T.LineBasicMaterial({color:INK.clone(),transparent:true,opacity:.5}));
        g.add(flow); g.userData.flow=flow;
        g.add(accent(new T.SphereGeometry(.026,14,14)).translateY(.055));
      }else{              /* MAINTAIN: a gear, cut through two planes so it never flattens */
        var gg=new T.Group(); g.add(gg); g.userData.gear=gg;
        var tp=[]; var NT=9;
        for(var k4=0;k4<NT*4;k4++){ var s4=Math.floor(k4/2)%2, r4=(s4===0)?.082:.118;
          var a4=k4/(NT*4)*Math.PI*2; tp.push(new T.Vector3(r4*Math.cos(a4),r4*Math.sin(a4),0)); }
        var f1=loop(tp); gg.add(f1);
        var sp3=[]; for(var k6=0;k6<4;k6++){ var a6=k6/4*Math.PI*2;
          sp3.push(new T.Vector3(0,0,0),new T.Vector3(.082*Math.cos(a6),.082*Math.sin(a6),0)); }
        gg.add(seg(sp3));
        gg.add(loop(circle(.04,26)));
        gg.add(accent(new T.SphereGeometry(.026,14,14)));
      }
      g.userData.accents=accents; g.userData.accentMat=accentMat;
      g.userData.lines=[line];
      g.traverse(function(o){ if(o.material&&o.material.isLineBasicMaterial&&g.userData.lines.indexOf(o.material)<0)g.userData.lines.push(o.material); });
      return g;
    }

    /* the five stages, fixed on the ring, each carrying its mark on a short stem */
    var stations=[],hits=[];
    for(var i=0;i<5;i++){
      var g=new T.Group(); g.position.copy(ptOn(angOf(i)));
      var nmat=new T.MeshBasicMaterial({color:AHEAD.clone()});
      var node=new T.Mesh(new T.SphereGeometry(.07,24,24),nmat); g.add(node);
      var stemM=new T.MeshBasicMaterial({color:AHEAD.clone(),transparent:true,opacity:.6});
      var stem=new T.Mesh(new T.CylinderGeometry(.005,.005,.28,6),stemM);
      stem.position.y=.14; g.add(stem);
      var glyph=makeGlyph(i); glyph.position.y=.6; g.add(glyph);
      var hit=new T.Mesh(new T.SphereGeometry(.34,10,10),
        new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,depthTest:false}));
      hit.position.y=.2; hit.userData.i=i; g.add(hit); hits.push(hit);
      sys.add(g);
      stations.push({g:g,node:node,nmat:nmat,stem:stemM,glyph:glyph,a:angOf(i),lit:0});
    }

    /* the one travelling thing, and only while a stage is being handed over */
    var comet=new T.Mesh(new T.SphereGeometry(.052,16,16),new T.MeshBasicMaterial({color:0xEC2027}));
    comet.visible=false; sys.add(comet);

    /* labels: one rule, always outboard on the node's own radius */
    var tags=[];
    for(var l=0;l<5;l++){
      var b=document.createElement('button');
      b.type='button'; b.className='lp-tag'+(l===0?' on':''); b.setAttribute('aria-label',D[l].name);
      b.innerHTML='<span class="no">'+pad(l+1)+'</span><span class="nm">'+D[l].short+'</span>';
      (function(li){
        b.addEventListener('click',function(){activate(li,true);});
        if(!touch)b.addEventListener('mouseenter',function(){activate(li,true);});
      })(l);
      tagsHost.appendChild(b); tags.push(b);
    }
    function placeCoreTag(){}

    /* ---- MOTION: one eased turn per selection, then rest ---- */
    var ry=0, ryFrom=0, ryTo=0, tw=1, TWD=.9;      /* tw = 1 means settled */
    var FRONT=Math.PI/2;                            /* the chosen stage comes to the near side */
    function targetFor(i){ return stations[i].a-FRONT; }
    function shortest(from,to){ var d=to-from; while(d>Math.PI)d-=Math.PI*2; while(d<-Math.PI)d+=Math.PI*2; return from+d; }
    ry=ryTo=ryFrom=targetFor(0); sys.rotation.y=ry;
    var cm={on:false,t:0,from:0,to:0};

    api={
      setActive:function(i,prev){
        ryFrom=ry; ryTo=shortest(ry,targetFor(i)); tw=0;
        cm.on=true; cm.t=0; cm.from=stations[prev].a; cm.to=stations[i].a; comet.visible=true;
        arcs.forEach(function(a2,k){ if(a2)a2.visible=(k===i); });
        if(mini)mini.show(i);
        tags.forEach(function(t2,k){t2.classList.toggle('on',k===i);});
      },
      setRun:function(v){ if(v&&!looping){looping=true;_raf(frame);} }
    };
    arcs.forEach(function(a2,k){ if(a2)a2.visible=(k===0); });

    /* the card carries the same mark, live: one small renderer, five glyphs, one visible */
    var mini=(function(){
      var mc=document.getElementById('lpIcon'); if(!mc) return null;
      var mr;
      try{ mr=_reg(new T.WebGLRenderer({canvas:mc,antialias:true,alpha:true})); }catch(e){ return null; }
      mr.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
      mr.setSize(96,96,false); mr.setClearColor(0x000000,0);
      var ms=new T.Scene(), mcam=new T.OrthographicCamera(-.24,.24,.24,-.24,.01,10);
      mcam.position.set(0,0,2); mcam.lookAt(0,0,0);
      var gl=[];
      for(var k=0;k<5;k++){ var gg2=makeGlyph(k); gg2.visible=(k===0); gg2.rotation.set(0,0,0); ms.add(gg2); gl.push(gg2);
        gg2.userData.accentMat.color.copy(RED);
        for(var q=0;q<gg2.userData.lines.length;q++){ gg2.userData.lines[q].color.copy(INK); gg2.userData.lines[q].opacity=1; } }
      return {r:mr,s:ms,c:mcam,g:gl,
        show:function(i){ for(var k2=0;k2<5;k2++)this.g[k2].visible=(k2===i); },
        tick:function(){ this.r.render(this.s,this.c); }};
    })();
    if(mini)window.__lpMini=mini;

    /* interaction: hover to choose, drag to look around. No ambient spin. */
    var ray=new T.Raycaster(), ptr=new T.Vector2(-9,-9), px=0, hovIdx=-1;
    var drag=false,dragged=false,lastX=0,lastY=0,tilt=0;
    canvas.addEventListener('pointerdown',function(e){drag=true;dragged=false;lastX=e.clientX;lastY=e.clientY;canvas.classList.add('grabbing');});
    onWin('pointerup',function(){drag=false;canvas.classList.remove('grabbing');});
    canvas.addEventListener('pointermove',function(e){
      var r2=canvas.getBoundingClientRect();
      ptr.x=((e.clientX-r2.left)/r2.width)*2-1;
      ptr.y=-((e.clientY-r2.top)/r2.height)*2+1;
      px=ptr.x;
      if(drag){
        var dx=e.clientX-lastX, dy=e.clientY-lastY; lastX=e.clientX; lastY=e.clientY;
        if(Math.abs(dx)>1||Math.abs(dy)>1)dragged=true;
        ry+=dx*.005; ryTo=ry; ryFrom=ry; tw=1;
        tilt=Math.max(-.3,Math.min(.5,tilt-dy*.004));
      }
    });
    canvas.addEventListener('pointerleave',function(){ptr.set(-9,-9);px=0;});
    canvas.addEventListener('click',function(e){ if(dragged)return;
      var r3=canvas.getBoundingClientRect();
      ptr.x=((e.clientX-r3.left)/r3.width)*2-1; ptr.y=-((e.clientY-r3.top)/r3.height)*2+1;
      ray.setFromCamera(ptr,camera);
      var hit3=ray.intersectObjects(hits,false)[0];
      if(hit3)activate(hit3.object.userData.i,true); else if(hovIdx>=0)activate(hovIdx,true); });

    var looping=false,last=0,intro=0;
    var easeOut=function(k){ return 1-Math.pow(1-k,3); };
    var easeIO=function(k){ return k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2; };
    var vec=new T.Vector3(), _pq=new T.Quaternion();
    function drawLink(){}
    var fchk=0;
    function frame(ts){
      _raf(frame);   /* always re-register: survives frozen tabs and missed visibility events */
      if(!inView){
        /* observer callbacks can be lost while a tab is suspended: recheck the rect ourselves */
        if((fchk++%45)===0){ var rr0=stage.getBoundingClientRect(); if(rr0.top<innerHeight&&rr0.bottom>0){ inView=true; stage.classList.add('go'); } }
        if(!inView){ last=ts; return; }
      }
      var dt=Math.min(.05,(ts-last)/1000||.016); last=ts;
      var t=ts/1000;
      if(intro<1)intro=Math.min(1,intro+dt/1.1);
      var ik=easeOut(intro);
      uni.scale.setScalar(.94+.06*ik);

      /* the single motion: the ring eases the chosen stage to the front, then holds */
      if(tw<1){ tw=Math.min(1,tw+dt/TWD); ry=ryFrom+(ryTo-ryFrom)*easeIO(tw); }
      sys.rotation.y=ry;
      if(!reduce){
        /* three hoops drifting at different rates: alive, but almost still */
        h1.rotation.y+=.05*dt;
        h2.rotation.x+=.035*dt; h2.rotation.z=Math.sin(t*.22)*.1;
        h3.rotation.z-=.045*dt;
        /* the arrows travel the ring: slow, constant, one lap a minute */
        for(var dz=0;dz<dirs.length;dz++){ var D4=dirs[dz]; D4.u+=dt*.017; if(D4.u>1)D4.u-=1; seatDir(D4); }
        var cb=1+Math.sin(t*1.2)*.045; core.scale.setScalar(cb);
        coreGlow.material.opacity=.055+.03*(0.5+0.5*Math.sin(t*1.2));
        /* a pulse leaves the core along every wire, staggered, and fades as it arrives */
        for(var pz=0;pz<pulses.length;pz++){
          var P3=pulses[pz]; P3.t+=dt*.42; if(P3.t>1)P3.t-=1;
          var rr3=CR+(R-CR)*P3.t;
          P3.m.position.set(rr3*Math.cos(P3.a),0,rr3*Math.sin(P3.a));
          P3.m.material.opacity=Math.sin(P3.t*Math.PI)*.45;
        }
      }
      uni.rotation.x+=((tilt*.55)-uni.rotation.x)*Math.min(1,dt*3);
      uni.rotation.z+=((px*.016)-uni.rotation.z)*Math.min(1,dt*2.4);   /* a whisper of parallax */

      for(var i=0;i<5;i++){
        var s=stations[i], on=i===active, done=i<active;
        s.lit+=((on?1:0)-s.lit)*Math.min(1,dt*7);
        var base=done?DONE:AHEAD;
        s.nmat.color.copy(base).lerp(RED,s.lit);
        s.stem.color.copy(base).lerp(RED,s.lit);
        s.stem.opacity=.45+s.lit*.4;
        var ns=(done?.9:.82)+s.lit*.5; s.node.scale.setScalar(ns);
        links[i].color.copy(done?DONE:AHEAD).lerp(RED,s.lit);
        links[i].opacity=(done?.34:.2)+s.lit*.4;
        /* every mark holds still and faces you; only the current one is animated */
        s.g.getWorldQuaternion(_pq);
        s.glyph.quaternion.copy(_pq).invert();
        s.glyph.rotateX(-Math.atan2(camera.position.y+.02,camera.position.z));
        var gs=(1.3+s.lit*.3)*(done?1:.97); s.glyph.scale.setScalar(gs);
        var GU=s.glyph.userData;
        for(var lm=0;lm<GU.lines.length;lm++){
          GU.lines[lm].color.copy(done?INK:AHEAD).lerp(INK,s.lit);
          GU.lines[lm].opacity=(done?.95:.88)+s.lit*.05;
        }
        GU.accentMat.color.copy(done?DONE:AHEAD).lerp(RED,s.lit);
        if(!reduce&&on){
          if(GU.gear) GU.gear.rotation.z-=1.15*dt;
          if(GU.build){
            var B=GU.build, ph=(t*.3)%1;
            var stp=function(a3,b3){ var k=(ph-a3)/(b3-a3); k=k<0?0:k>1?1:k; return easeOut(k); };
            B.p1.position.y=B.y1+.26*(1-stp(.02,.24));
            B.p2.position.y=B.y2+.26*(1-stp(.26,.5));
            B.mod.position.y=B.ym+.26*(1-stp(.54,.8));
            B.p1.visible=ph>.02; B.p2.visible=ph>.26; B.mod.visible=ph>.54;
          }
          if(GU.flow) GU.flow.material.opacity=.3+.45*(0.5+0.5*Math.sin(t*3));
        }else if(GU.build){
          B=GU.build; B.p1.visible=B.p2.visible=B.mod.visible=true;
          B.p1.position.y=B.y1; B.p2.position.y=B.y2; B.mod.position.y=B.ym;
        }
      }
      if(cm.on){
        cm.t+=dt/TWD;
        if(cm.t>=1){cm.on=false;comet.visible=false;}
        else{
          var d2=cm.to-cm.from; d2=((d2%(Math.PI*2))+Math.PI*2)%(Math.PI*2);
          var aa=cm.from+d2*easeIO(cm.t);
          comet.position.copy(ptOn(aa,.02));
          var cs=1+Math.sin(cm.t*Math.PI)*.5; comet.scale.setScalar(cs);
        }
      }
      hovIdx=-1;
      if(ptr.x>-5&&!drag){
        ray.setFromCamera(ptr,camera);
        var hit=ray.intersectObjects(hits,false)[0];
        if(hit)hovIdx=hit.object.userData.i;
      }
      canvas.classList.toggle('pick',hovIdx>=0);
      if(hovIdx>=0&&!touch&&hovIdx!==active) activate(hovIdx,true);
      var SW=stage.clientWidth, SH=stage.clientHeight;
      /* label layout: start from the node, push radially clear of it, resolve any collisions,
         then keep every chip inside the stage */
      vec.set(0,0,0).applyMatrix4(sys.matrixWorld).project(camera);
      var ccx=(vec.x*.5+.5)*SW, ccy=(-vec.y*.5+.5)*SH;
      var lay=[];
      for(var l2=0;l2<5;l2++){
        var st2=stations[l2];
        st2.g.getWorldPosition(vec); vec.project(camera);
        var nx=(vec.x*.5+.5)*SW, ny=(-vec.y*.5+.5)*SH;
        var dx=nx-ccx, dy=ny-ccy, dl=Math.sqrt(dx*dx+dy*dy)||1;
        var tr=tags[l2].getBoundingClientRect();
        var tw2=Math.round(tr.width)||110, th2=Math.round(tr.height)||26;
        /* PHONE: the mark floats ABOVE its node, so the name is seated directly BELOW the node.
           By construction it can never cover an icon, and it stays inside the wheel.
           DESKTOP: unchanged, pushed radially outward clear of the node. */
        var narrow=SW<760;
        if(narrow){
          lay.push({i:l2,x:nx,y:ny+24,w:tw2,h:th2,left:false,narrow:true});
        } else {
          var GAP=34+tw2*.5;
          lay.push({i:l2,x:nx+dx/dl*GAP,y:ny+dy/dl*GAP+16,w:tw2,h:th2,left:dx<0,narrow:false});
        }
      }
      /* the marks float above their nodes: treat each as an obstacle the chips must clear */
      var NAR=SW<760;
      var blocks=[];
      for(var bq=0;bq<5;bq++){                          /* the marks floating above every node */
        vec.set(0,.6,0); stations[bq].g.updateMatrixWorld();
        vec.applyMatrix4(stations[bq].g.matrixWorld); vec.project(camera);
        blocks.push({x:(vec.x*.5+.5)*SW,y:(-vec.y*.5+.5)*SH,w:NAR?50:52,h:NAR?50:52});
      }
      if(NAR){
        /* inside the wheel the chips also have to clear the nodes themselves and the core */
        for(var nq=0;nq<5;nq++){
          stations[nq].g.getWorldPosition(vec); vec.project(camera);
          blocks.push({x:(vec.x*.5+.5)*SW,y:(-vec.y*.5+.5)*SH,w:30,h:30});
        }
        blocks.push({x:ccx,y:ccy,w:92,h:70});
      }
      /* separate chip from chip, and chip from mark, nudging vertically */
      /* inside the wheel a chip can escape sideways as well as vertically, so on phones push
         along whichever axis is the shorter way out. Desktop keeps its vertical-only nudge. */
      var MX=NAR?7:0, MY=NAR?6:0;
      for(var pass=0;pass<(NAR?8:4);pass++){
        for(var q1=0;q1<5;q1++){
          for(var q2=q1+1;q2<5;q2++){
            var A=lay[q1],B2=lay[q2];
            var ox=(A.w+B2.w)*.5+MX-Math.abs(A.x-B2.x), oy=(A.h+B2.h)*.5+8-Math.abs(A.y-B2.y);
            if(ox>0&&oy>0){
              if(NAR&&ox<oy){ var sg=A.x<=B2.x?-1:1; A.x+=sg*ox*.5; B2.x-=sg*ox*.5; }
              else if(A.y<=B2.y){A.y-=oy*.5;B2.y+=oy*.5;} else {A.y+=oy*.5;B2.y-=oy*.5;}
            }
          }
          for(var q3=0;q3<blocks.length;q3++){
            var C=lay[q1],K=blocks[q3];
            var ox2=(C.w+K.w)*.5+MX-Math.abs(C.x-K.x), oy2=(C.h+K.h)*.5+MY-Math.abs(C.y-K.y);
            if(ox2>0&&oy2>0){
              if(NAR&&ox2<oy2){ C.x+=(C.x>=K.x?1:-1)*ox2; }
              else { C.y+=(C.y>=K.y?1:-1)*oy2; }
            }
          }
        }
        /* clamp INSIDE the loop: a chip shoved past the edge is pulled back now, so the next
           pass can resolve anything that pull re-collided with */
        if(NAR){ for(var cq=0;cq<5;cq++){ var Lc=lay[cq];
          Lc.x=Math.min(SW-Lc.w*.5-8,Math.max(Lc.w*.5+8,Lc.x));
          Lc.y=Math.max(Lc.h*.5+6,Math.min(Lc.y,SH-Lc.h*.5-8)); } }
      }
      for(var l3=0;l3<5;l3++){
        var L=lay[l3], P2=10;
        if(L.narrow){
          var cx2=Math.min(SW-L.w*.5-P2,Math.max(L.w*.5+P2,L.x));
          var cy2=Math.max(L.h*.5+6,Math.min(L.y,SH-L.h*.5-8));
          tags[L.i].style.transform='translate('+cx2.toFixed(1)+'px,'+cy2.toFixed(1)+'px) translate(-50%,-50%)';
        } else {
        var sx=L.left?Math.max(L.w+P2,Math.min(L.x+L.w*.5,SW-P2))
                     :Math.min(SW-L.w-P2,Math.max(L.x-L.w*.5,P2));
        var sy=Math.max(L.h*.5+6,Math.min(L.y,SH-L.h*.5-30));
        tags[L.i].style.transform='translate('+sx.toFixed(1)+'px,'+sy.toFixed(1)+'px) '+(L.left?'translate(-100%,-50%)':'translate(0,-50%)');
        }
        tags[L.i].style.opacity=(stage.classList.contains('go')?1:0);
      }
      renderer.render(scene,camera);
      if(mini)mini.tick();
    }
    function fit(){
      var w=stage.clientWidth||700,h=stage.clientHeight||600;
      renderer.setSize(w,h,false);
      camera.aspect=w/h;camera.updateProjectionMatrix();
      /* the marks float at y≈.6 ABOVE the rim, so the frame test has to include their corners,
         otherwise the icons at the far left and right get clipped by the stage edge */
      var GH=.62,GR=.2;
      var pts2=[new T.Vector3(R+.2,0,0),new T.Vector3(-(R+.2),0,0),new T.Vector3(0,0,R+.2),
                new T.Vector3(0,0,-(R+.2)),new T.Vector3(0,.62,R*.9),new T.Vector3(0,-.42,R*.9),
                new T.Vector3(R+GR,GH,0),new T.Vector3(-(R+GR),GH,0),
                new T.Vector3(0,GH,R+GR),new T.Vector3(0,GH,-(R+GR)),
                new T.Vector3(R*.71+GR,GH,R*.71),new T.Vector3(-(R*.71+GR),GH,-(R*.71))];
      var z=3.8,ok=false,v=new T.Vector3();
      while(z<=11&&!ok){
        camera.position.set(0,2.75*(z/5.6),z); camera.lookAt(0,-.02,0); camera.updateMatrixWorld();
        ok=true;
        for(var p3=0;p3<pts2.length;p3++){ v.copy(pts2[p3]).project(camera);
          var _tx=(stage.clientWidth<760)?.93:.86,_ty=(stage.clientWidth<760)?.94:.9;
          if(Math.abs(v.x)>_tx||Math.abs(v.y)>_ty){ok=false;break;} }
        if(!ok)z+=.2;
      }
      camZ=z; camY=2.75*(z/5.6); camera.position.set(0,camY,z); camera.lookAt(0,-.02,0);
      renderer.render(scene,camera);
    }
    if(window.ResizeObserver)_ro(fit).observe(stage);
    fit();
    onDoc('visibilitychange',function(){ if(!document.hidden&&inView&&!looping){looping=true;_raf(frame);} });
    looping=true;_raf(frame);
    if(reduce){ intro=1; uni.scale.setScalar(1); fit(); }
  }
  try{
    var testCv=document.createElement('canvas');
    if(!(window.WebGLRenderingContext&&(testCv.getContext('webgl2')||testCv.getContext('webgl')))){nogl();}
    else { try{init(THREE_MOD);}catch(err){if(window.console&&console.error)console.error('LP init failed',err);nogl();} }
  }catch(e){nogl();}
})();

/* ---- industries: subtle 3D tilt toward the cursor ---- */
(function(){
  if(reduce || !window.matchMedia || !matchMedia('(hover:hover)').matches) return;
  document.querySelectorAll('.ind').forEach(function(card){
    var raf2=null;
    card.addEventListener('pointermove',function(e){
      if(raf2) return;
      raf2=_raf(function(){
        raf2=null;
        var r=card.getBoundingClientRect();
        var px=(e.clientX-r.left)/r.width-0.5, py=(e.clientY-r.top)/r.height-0.5;
        card.style.transform='rotateX('+(-py*5)+'deg) rotateY('+(px*6)+'deg) translateZ(0)';
      });
    });
    card.addEventListener('pointerleave',function(){
      if(raf2){cancelAnimationFrame(raf2);raf2=null;}
      card.style.transition='transform .6s var(--e1), border-color .35s, box-shadow .5s var(--e1)';
      card.style.transform='rotateX(0) rotateY(0)';
      _setTo(function(){card.style.transition='';},600);
    });
  });
})();

/* ---- text scramble / decode on mono labels ---- */
(function(){
  if(reduce)return;
  var GLYPHS='!<>-_\\/[]{}=+*^?#________ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
  function rnd(){return GLYPHS[(Math.random()*GLYPHS.length)|0];}
  function esc(ch){if(ch==='&')return '&amp;';if(ch==='<')return '&lt;';if(ch==='>')return '&gt;';if(ch==='"')return '&quot;';return ch;}
  function makeScrambler(el){
    var finalText=el.textContent;
    var speed=parseFloat(el.dataset.scrambleSpeed)||24;
    var stagger=parseFloat(el.dataset.scrambleStagger)||38;
    var n=finalText.length;
    var revealAt=[];for(var i=0;i<n;i++)revealAt[i]=i*stagger;
    var totalMs=(n-1)*stagger+speed*6;
    var lastGlyphs=new Array(n),raf=null,startTs=0,lastSwap=0,running=false;
    function frame(ts){
      if(!running)return;
      if(!startTs)startTs=ts;
      var elapsed=ts-startTs;
      var doSwap=(ts-lastSwap)>=speed;
      if(doSwap)lastSwap=ts;
      var html='',settled=0;
      for(var i=0;i<n;i++){
        var ch=finalText[i];
        if(ch===' '){html+=' ';settled++;continue;}
        if(elapsed>=revealAt[i]+speed*3){html+=esc(ch);settled++;}
        else{
          if(doSwap||lastGlyphs[i]===undefined)lastGlyphs[i]=rnd();
          html+='<span class="scramble-glyph">'+lastGlyphs[i]+'</span>';
        }
      }
      el.innerHTML=html;
      if(elapsed>=totalMs||settled===n){el.textContent=finalText;stop();return;}
      raf=_raf(frame);
    }
    function start(){if(running)return;running=true;startTs=0;lastSwap=0;for(var i=0;i<n;i++)lastGlyphs[i]=undefined;raf=_raf(frame);}
    function stop(){running=false;if(raf)cancelAnimationFrame(raf);raf=null;}
    return {el:el,start:start,stop:stop,finalText:finalText};
  }
  document.querySelectorAll('[data-scramble]').forEach(function(el){
    var s=makeScrambler(el);
    ScrollTrigger.create({
      trigger:el,start:'top 88%',once:true,
      onEnter:function(){s.start();},
      onLeave:function(){s.el.textContent=s.finalText;s.stop();}
    });
  });
})();


return function cleanup(){
  dead=true;
  _cleanups.forEach(function(f){ try{ f(); }catch(e){} });
  _obs.forEach(function(o){ try{ o.disconnect(); }catch(e){} });
  _ivs.forEach(function(id){ clearInterval(id); });
  _tos.forEach(function(id){ clearTimeout(id); });
  try{ ScrollTrigger.getAll().forEach(function(t){ t.kill(); }); }catch(e){}
  _renderers.forEach(function(r){ try{ r.dispose(); r.forceContextLoss(); }catch(e){} });
  document.body.classList.remove('page-home');
  document.documentElement.classList.remove('is-loading','motion');
  document.documentElement.style.overflow='';
  window.__spActive=false;
  delete window.__revealOnPlay; delete window.__iaqLoaderDismiss; delete window.__resetSM;
  delete window.__p3dQA; delete window.__lpMini; delete window.S3D;
};
}
