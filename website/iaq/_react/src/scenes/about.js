/* About page scenes: every inline script from _source/about.html, ported verbatim per src/CONVERSION.md.
   Shell-owned scripts (nav, Lenis, universal search, BM ribbon, embedded detection) are omitted. */
import * as THREE_MOD from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function initAbout(){
  var dead=false;
  var cleanups=[];
  var renderers=[];
  function onWin(t,fn,opts){ window.addEventListener(t,fn,opts); cleanups.push(function(){ window.removeEventListener(t,fn,opts); }); }
  function onLoad(fn){
    if(document.readyState==='complete'){ var id=setTimeout(fn,0); cleanups.push(function(){ clearTimeout(id); }); }
    else onWin('load',fn);
  }
  function trackIO(io){ cleanups.push(function(){ io.disconnect(); }); return io; }
  function trackRO(ro){ cleanups.push(function(){ ro.disconnect(); }); return ro; }
  function trackInterval(id){ cleanups.push(function(){ clearInterval(id); }); return id; }

/* ── main choreography: count-ups, reveals, hero, manifesto, timeline, decode, values tiles, pipeline, ghosts ── */
(function(){

  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gs=gsap,ST=ScrollTrigger;
  var live=!reduce;

  /* ---- count-ups: run plainly if GSAP absent so numbers are never stuck at 0 ---- */
  function fmt(n){return n>=10000?n.toLocaleString('en-US'):String(n);}
  var counted=[];
  document.querySelectorAll('[data-count]').forEach(function(el){
    var target=parseInt(el.getAttribute('data-count'),10)||0;
    if(!live){el.textContent=fmt(target);return;}
    counted.push(el);
    ST.create({trigger:el,start:'top 92%',once:true,onEnter:function(){
      var o={v:0};
      gs.to(o,{v:target,duration:1.6,ease:'power3.out',onUpdate:function(){el.textContent=fmt(Math.round(o.v));},onComplete:function(){el.textContent=fmt(target);}});
    }});
  });
  if(!live){document.querySelectorAll('[data-count]').forEach(function(el){el.textContent=fmt(parseInt(el.getAttribute('data-count'),10)||0);});}

  /* ---- reveal-on-scroll: immediateRender:false + load sweep so nothing strands hidden ---- */
  if(live){
    document.querySelectorAll('[data-reveal]').forEach(function(el,i){
      gs.from(el,{y:26,opacity:0,duration:.85,ease:'power3.out',immediateRender:false,
        scrollTrigger:{trigger:el,start:'top 90%',once:true}});
    });
    onLoad(function(){setTimeout(function(){
      document.querySelectorAll('[data-reveal]').forEach(function(el){
        if(parseFloat(getComputedStyle(el).opacity)<0.9){gs.set(el,{clearProps:'all'});}
      });
    },2600);});
  }

  /* ---- hero: blur-to-focus (filter+scale only, opacity never below 1) ---- */
  if(live){
    var h=document.getElementById('heroH');
    if(h){
      gs.fromTo(h,{filter:'blur(14px)',scale:1.045,transformOrigin:'0 100%'},
        {filter:'blur(0px)',scale:1,duration:1.4,ease:'power3.out',delay:.15,
         onInterrupt:function(){gs.set(h,{clearProps:'filter,transform'});}});
      setTimeout(function(){gs.set(h,{clearProps:'filter,transform'});},2400);
    }
  }

  /* ---- hero multi-plane parallax (desktop only) ---- */
  if(live){
    ST.matchMedia?null:0;
    if(matchMedia('(min-width:961px)').matches){
      document.querySelectorAll('.ab-hero [data-speed]').forEach(function(layer){
        var sp=parseFloat(layer.getAttribute('data-speed'))||0.3;
        gs.to(layer,{yPercent:sp*36,ease:'none',
          scrollTrigger:{trigger:'.ab-hero',start:'top top',end:'bottom top',scrub:true,invalidateOnRefresh:true}});
      });
    }
  }

  /* ---- manifesto: tonal dark->light scrub + line reveals ---- */
  var man=document.querySelector('.manifesto');
  if(man){
    if(live){
      gs.to(man,{'--p':1,ease:'none',
        scrollTrigger:{trigger:man,start:'top 85%',end:'top 30%',scrub:true,invalidateOnRefresh:true}});
      var mm=document.getElementById('manMedia');
      if(mm && matchMedia('(min-width:1101px)').matches){
        gs.fromTo(mm,{yPercent:26},{yPercent:-26,ease:'none',
          scrollTrigger:{trigger:man,start:'top bottom',end:'bottom top',scrub:true,invalidateOnRefresh:true}});
      }
      document.querySelectorAll('[data-mline]').forEach(function(l,i){
        gs.from(l,{y:34,opacity:0,duration:.9,ease:'power3.out',immediateRender:false,
          scrollTrigger:{trigger:l,start:'top 88%',once:true}});
      });
      onLoad(function(){setTimeout(function(){
        document.querySelectorAll('[data-mline]').forEach(function(l){
          if(parseFloat(getComputedStyle(l).opacity)<0.9)gs.set(l,{clearProps:'all'});
        });
      },2600);});
    } else { man.style.setProperty('--p','1'); }
  }

  /* ---- timeline: tactile snap-scroll gallery (no pin, no dead scroll). The fill bar and the
     big ghost year ride the strip's own scrollLeft; drag anywhere; arrows step card by card. ---- */
  (function(){
    var stage=document.getElementById('tlStage'),track=document.getElementById('tlTrack');
    if(!stage||!track) return;
    var yearBig=document.getElementById('tlYearBig'), fill=document.getElementById('tlFill'), lastIdx=-1;
    var years=[].map.call(track.querySelectorAll('.tl-year'),function(y){return y.textContent;});
    function onScroll(){
      var span=Math.max(1,track.scrollWidth-track.clientWidth);
      var p=Math.min(1,Math.max(0,track.scrollLeft/span));
      if(fill) fill.style.width=(p*100).toFixed(1)+'%';
      var idx=Math.min(years.length-1,Math.round(p*(years.length-1)));
      if(idx!==lastIdx&&yearBig){ lastIdx=idx; yearBig.textContent=years[idx]; }
    }
    track.addEventListener('scroll',onScroll,{passive:true}); onScroll();
    /* drag-to-scroll with momentum feel */
    var drag=false,sx=0,sl=0;
    track.addEventListener('pointerdown',function(e){ if(e.pointerType==='touch')return;
      drag=true; sx=e.clientX; sl=track.scrollLeft; track.style.cursor='grabbing'; });
    onWin('pointermove',function(e){ if(!drag)return; track.scrollLeft=sl-(e.clientX-sx); },{passive:true});
    onWin('pointerup',function(){ drag=false; track.style.cursor=''; });
    /* arrows step one card */
    function step(dir){ var card=track.querySelector('.tl-card'); if(!card)return;
      track.scrollBy({left:dir*(card.offsetWidth+24),behavior:'smooth'}); }
    var pv=document.getElementById('tlPrev'), nx=document.getElementById('tlNext');
    if(pv) pv.addEventListener('click',function(){step(-1);});
    if(nx) nx.addEventListener('click',function(){step(1);});
  })();

  /* ---- decode-on-scroll for vision & mission (hide only inside a live trigger) ---- */
  if(live){
    var GL='#$%&/\\=+*<>0123456789ABCDEFGHKMNPQRSTUVWXZ';
    document.querySelectorAll('[data-decode]').forEach(function(el){
      var full=el.textContent;
      ST.create({trigger:el,start:'top 86%',once:true,onEnter:function(){
        var t0=performance.now(),D=1400,head=0;
        (function tick(now){
          var p=Math.min(1,(now-t0)/D);
          head=Math.floor(full.length*p);
          var out=full.slice(0,head),tail='';
          if(p<1){for(var k=0;k<Math.min(10,full.length-head);k++){var ch=full[head+k];tail+=(ch===' ')?' ':GL[(Math.random()*GL.length)|0];}}
          el.textContent=out+tail;
          if(p<1)requestAnimationFrame(tick);else el.textContent=full;
        })(t0);
      }});
    });
  }

  /* ---- value tiles: placeholder square resolves into line icon on reveal ---- */
  if(live){
    document.querySelectorAll('.vtile').forEach(function(t,i){
      ST.create({trigger:t,start:'top 90%',once:true,onEnter:function(){
        setTimeout(function(){t.classList.add('iconed');},220+i*120);
      }});
    });
    onLoad(function(){setTimeout(function(){
      document.querySelectorAll('.vtile').forEach(function(t){t.classList.add('iconed');});
    },3000);});
  }else{
    document.querySelectorAll('.vtile').forEach(function(t){t.classList.add('iconed');});
  }

  /* ---- delivery pipeline: scrubbed fill + stations lighting as the spine passes them.
     Stations are fully readable with no JS; the scrub only ADDS the accents, and a dead
     trigger leaves everything lit via the load sweep below. ---- */
  (function(){
    var pipe=document.getElementById('pipe'); if(!pipe) return;
    var fill=document.getElementById('ppFill'), pct=document.getElementById('pipePct');
    var nodes=pipe.querySelectorAll('.pp-node'), sts=pipe.querySelectorAll('.pst');
    var packet=document.getElementById('ppPacket');
    function setP(p){
      if(fill) fill.style.strokeDashoffset=(980*(1-p)).toFixed(1);
      if(packet){ packet.setAttribute('cx',(10+980*p).toFixed(1)); packet.classList.toggle('go',p>0.005&&p<0.998); }
      if(pct) pct.textContent=Math.round(p*100)+'%';
      for(var i=0;i<5;i++){ var on=p*5>=i+0.45;
        if(nodes[i]) nodes[i].classList.toggle('on',on);
        if(sts[i]) sts[i].classList.toggle('on',on); }
    }
    if(!live){ setP(1); return; }
    gs.to({v:0},{v:1,ease:'none',scrollTrigger:{trigger:pipe,start:'top 82%',end:'bottom 52%',scrub:.8,invalidateOnRefresh:true,
      onUpdate:function(self){ setP(self.progress); }}});
    /* proven-live safety: if the user is already BELOW the pipe and the scrub never fired, light it */
    onLoad(function(){ setTimeout(function(){
      if(pct && pct.textContent==='0%' && pipe.getBoundingClientRect().bottom<0) setP(1);
    },2600); });
  })();

  /* ---- ghost watermarks drift slowly against their sections ---- */
  if(live){
    document.querySelectorAll('.wm-ghost').forEach(function(w){
      gs.fromTo(w,{yPercent:16},{yPercent:-16,ease:'none',
        scrollTrigger:{trigger:w.parentElement,start:'top bottom',end:'bottom top',scrub:true,invalidateOnRefresh:true}});
    });
  }

  /* ---- keep trigger points honest after fonts/images settle ---- */
  if(live){
    onLoad(function(){ST.refresh();});
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){if(!dead)ST.refresh();});
  }
})();

/* ── mini 3D trio: vision globe · mission carousel · values temple + ESG dioramas + pillar loops ── */
(function(){
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce) return;
  var T;
  var SH=null, SHW=1280, SHH=820, SPR=Math.min(window.devicePixelRatio||1,1.5);
  function shared(){ if(!SH){ SH=new T.WebGLRenderer({antialias:true,alpha:true}); renderers.push(SH);
    SH.setPixelRatio(SPR); SH.setSize(SHW,SHH,false); SH.setClearColor(0x000000,0); SH.setScissorTest(true); }
    return SH; }
  function mini(canvasId,hostSel,build){
    var canvas=document.getElementById(canvasId); if(!canvas) return null;
    var host=document.querySelector(hostSel)||canvas.parentElement;
    var ctx2=canvas.getContext('2d'); if(!ctx2) return null;
    var scene=new T.Scene(), camera=new T.PerspectiveCamera(34,2,0.1,60);
    scene.add(new T.HemisphereLight(0xEAF2FF,0x1A2233,1.0));
    var key=new T.DirectionalLight(0xF4F7FF,1.4); key.position.set(4,6,5); scene.add(key);
    var st={scene:scene,camera:camera,canvas:canvas,host:host,visb:false,raf:null,hot:false,api:build(scene,camera)};
    host.addEventListener('pointerenter',function(){st.hot=true;});
    host.addEventListener('pointerleave',function(){st.hot=false;});
    function frame(ts){ if(dead){st.raf=null;return;} st.raf=requestAnimationFrame(frame); if(!st.visb)return;
      var cr=canvas.getBoundingClientRect();
      var w=Math.min(SHW,Math.max(2,Math.round(cr.width))), h=Math.min(SHH,Math.max(2,Math.round(cr.height)));
      if(!w||!h) return;
      var bw=Math.round(w*SPR), bh=Math.round(h*SPR);
      if(canvas.width!==bw||canvas.height!==bh){ canvas.width=bw; canvas.height=bh; }
      camera.aspect=w/h; camera.updateProjectionMatrix();
      st.api.tick(ts||0,st.hot);
      var R=shared();
      R.setViewport(0,SHH-h,w,h); R.setScissor(0,SHH-h,w,h);
      R.render(scene,camera);
      ctx2.clearRect(0,0,bw,bh);
      ctx2.drawImage(R.domElement,0,0,bw,bh,0,0,bw,bh); }
    if(window.IntersectionObserver){ try{ trackIO(new IntersectionObserver(function(es){ st.visb=es[0].isIntersecting;
      if(st.visb){ if(!st.raf) st.raf=requestAnimationFrame(frame); } else if(st.raf){ cancelAnimationFrame(st.raf); st.raf=null; } })).observe(host);
    }catch(e){ st.visb=true; st.raf=requestAnimationFrame(frame);} } else { st.visb=true; st.raf=requestAnimationFrame(frame); }
    cleanups.push(function(){ if(st.raf){ cancelAnimationFrame(st.raf); st.raf=null; } });
    return st;
  }
  function init(mod){ T=mod;
    /* ── VISION: a globe of points, red markers on every IAQ country ── */
    mini('glbCv','#vmVision',function(scene,camera){
      var g=new T.Group(); scene.add(g);
      /* the actual world, not random fuzz: land dots from the shared bitmask */
      var L2='ffffffffffffffffffffffffffffffffffffffffffffffff|000000000000000000000000000000000000000000000000|800000000000000000000000000000000000000000000000|800000000000000000000000000000000000000000000001|8000000000000000003f8000000000000000000000000001|800000000000ffc1fffff000000000000000000000000001|8000000000001f1ffffff800009000000000000000000001|0000000040007c1ffffffc00000000000000070000000001|80000000090198003ffffc00000000008007fff0007c0001|80000003e00000003ffff800000000040ffffffff87f8001|800e000037067f8007ffd0000000000c1ffffffffffffc01|80ffffff3fcb19f017ffc000007fc007ffffffffffffffff|e0fffffff7dff0780ffc000001fffdffffffffffffffffff|98fffffffffff0780fc00f0003ffffffffffffffffffffff|80ffffffffff003807c006000fffffffffffffffffffffff|80fffffffffe01c0038000001fdffffffffffffffffffff8|80ff93fffffc01e0000000001fdfffffffffffffffffc701|000e00fffffe01fe000000060f9fffffffffffffffe01e01|0010007fffffc1ff000000060f1fffffffffffffff803c00|8000001ffffffbffc000001f0fffffffffffffffffc03801|8000000fffffffffc000001ffffffffffffffffffff01001|8000000fffffffff60000003fffffffffffffffffff00001|00000003ffffbffc70000003ffffffffffffffffffd00001|80000003ffffdffc10000001ffffffffffffffffffd00001|80000003fffff7fe00000001feff3fffffffffffff900001|80000003ffffffe00000001fc37e03cffffffffffc100001|80000003ffffffc00000001f80bfffcffffffffff8200001|80000003ffffff800000001f0013ffcffffffffff0200001|80000001ffffff000000001e7901ffffffffffffb8600001|80000000ffffff0000000007fc001fffffffffff13c00001|800000003ffffc000000000ffc003fffffffffff86000001|800000003ffff8000000001fff3c3fffffffffff80000001|800000000fff98000000003fffffffffffffffff80000001|800000001ff80c000000007fffffdfcfffffffff00000001|8000000003f80400000000ffffffcfe1fffffffe00000001|8000000001f00000000001ffffffeffe0ffffffe80000001|8000000000f04e00000001fffffff7fe07fffff000000001|8000000000f8c020000001fffffff7fe03fc7f2000000001|80000000007fc048000001fffffff3fc03f83f0080000001|80000000001fc000000001fffffffbf001e03f8180000001|800000000001f000000001ffffffffc001e00fc080000001|8000000000003000000001fffffffe0000c00bc040000001|80000000000030f3000000fffffffee000c0098040000001|8000000000001fff8000007fffffffe00060080060000001|80000000000001ffc000003fffffffc00020040060000001|80000000000001fff80000181fffffc00000160e00000001|80000000000001fffc00000007ffff8000000e1e00000001|80000000000003fffe00000007ffff0000000e3e00000001|80000000000007ffff00000007fffe000000073d82000001|80000000000007ffffe0000007fffc00000007bd8be00001|80000000000007fffff0000003fff8000000010100f80001|80000000000007fffffc000003fff80000000050007d0001|80000000000003fffffc000001fff8000000000020360001|80000000000001fffff8000001fffc000000000000010001|80000000000001fffff0000001fffc000000000007100000|80000000000000ffffe0000003fffc60000000001f100001|800000000000007fffe0000003fff8e0000000003f980001|800000000000003fffe0000003fff1c0000000007ffc0002|000000000000001fffe0000001ffe1c000000000fffe0000|000000000000001fffc0000001ffe1c000000007fffe0000|800000000000001fff00000001ffe1800000000fffff0001|800000000000003ffc00000000ffc0000000000fffff8001|800000000000003ffc00000000ffc0000000000fffff8001|800000000000003ffc000000007f800000000007ffff8001|000000000000003ff8000000007f000000000007ffff8001|800000000000003ff0000000003e000000000007c1ff0001|800000000000003fe00000000000000000000002007f0000|800000000000007fc00000000000000000000000003e0004|800000000000007f0000000000000000000000000000000c|800000000000007e00000000000000000000000000000014|800000000000007c00000000000000000000000000040031|800000000000007800000000000000000000000000000061|80000000000000f800000000000000000000000000000001|80000000000000f800000000000000000000000000000001|80000000000000f000000000000000000000000000000000|800000000000007000000000000000000000000000000001|800000000000003800000000000000000000000000000001|800000000000000000000000000000000000000000000001|800000000000000000000000000000000000000000000001|800000000000000000000000000000000000000000000001|800000000000000000000000000000000000000000000000|800000000000000000000000000000000000000000000001|800000000000000100000000000000000000000000000000|8000000000000007000000000000001c00001f9c7fc00001|800000000000000f000000000000e3fffe7ffffffffff001|800000000000007f0000001fffffffffffffffffffffff81|80000000003c007f000001ffffffffffffffffffffffff81|8000312ffc7fffff00001ffffffffffffffffffffffffe01|800dfffffffffffff000fffffffffffffffffffffffffe41|f03fffffffffffffffffffffffffffffffffffffffffffff|ffffffffffffffffffffffffffffffffffffffffffffffff|ffffffffffffffffffffffffffffffffffffffffffffffff|ffffffffffffffffffffffffffffffffffffffffffffffff|ffffffffffffffffffffffffffffffffffffffffffffffff|ffffffffffffffffffffffffffffffffffffffffffffffff|ffffffffffffffffffffffffffffffffffffffffffffffff'.split('|');
      function b2(y,x){ return (parseInt(L2[y].charAt(x>>2),16)>>(3-(x&3)))&1; }
      var pts=[];
      for(var gy=1;gy<96;gy++)for(var gx=1;gx<191;gx++){ if(!b2(gy,gx)) continue;
        var la=(90-((gy+0.5)/96)*180)*Math.PI/180, lo=(((gx+0.5)/192)*360-180)*Math.PI/180;
        if(Math.random()>Math.cos(la)*0.6+0.05) continue;
        pts.push(Math.cos(la)*Math.cos(lo),Math.sin(la),-Math.cos(la)*Math.sin(lo)); }
      var gg=new T.BufferGeometry(); gg.setAttribute('position',new T.BufferAttribute(new Float32Array(pts),3));
      g.add(new T.Points(gg,new T.PointsMaterial({color:0xA9C2E8,size:0.024,transparent:true,opacity:.9,depthWrite:false})));
      /* markers: MY SG IN CN DE FR PL SE MA — lat/lon to sphere */
      var LOCS=[[3,101],[1.3,103.8],[20,77],[32,114],[51,13.7],[46,2],[52,19],[60,15],[31,-7]];
      var mp=new Float32Array(LOCS.length*3);
      LOCS.forEach(function(ll,i){ var la=ll[0]*Math.PI/180, lo=ll[1]*Math.PI/180;
        mp[i*3]=Math.cos(la)*Math.cos(lo)*1.02; mp[i*3+1]=Math.sin(la)*1.02; mp[i*3+2]=-Math.cos(la)*Math.sin(lo)*1.02; });
      var mg=new T.BufferGeometry(); mg.setAttribute('position',new T.BufferAttribute(mp,3));
      var mMat=new T.PointsMaterial({color:0xFF3B44,size:0.105,transparent:true,opacity:1,depthWrite:false}); g.add(new T.Points(mg,mMat));
      /* faint equator + meridian rings for the engineered feel */
      [[0,0],[Math.PI/2,0],[0,Math.PI/2]].forEach(function(rot){
        var ring=new T.Mesh(new T.TorusGeometry(1.001,0.0028,8,96),new T.MeshBasicMaterial({color:0x5A6C94,transparent:true,opacity:.75}));
        ring.rotation.x=rot[0]; ring.rotation.y=rot[1]; g.add(ring); });
      /* flavour: red routes out of Malaysia with light pulses riding them */
      var kl=[Math.cos(3*Math.PI/180)*Math.cos(101*Math.PI/180),Math.sin(3*Math.PI/180),-Math.cos(3*Math.PI/180)*Math.sin(101*Math.PI/180)];
      var klV=new T.Vector3(kl[0],kl[1],kl[2]).multiplyScalar(1.01);
      var travs2=[], tp2=new Float32Array((LOCS.length-1)*3);
      for(var li=1;li<LOCS.length;li++){ var L=LOCS[li];
        var la2=L[0]*Math.PI/180, lo2=L[1]*Math.PI/180;
        var ev2=new T.Vector3(Math.cos(la2)*Math.cos(lo2),Math.sin(la2),-Math.cos(la2)*Math.sin(lo2)).multiplyScalar(1.01);
        var ang2=klV.angleTo(ev2), pts2=[];
        for(var k2=0;k2<=30;k2++){ var f2=k2/30;
          pts2.push(new T.Vector3().copy(klV).lerp(ev2,f2).normalize().multiplyScalar(1.01+Math.sin(Math.PI*f2)*(0.06+ang2*0.07))); }
        var lg2=new T.BufferGeometry().setFromPoints(pts2);
        g.add(new T.Line(lg2,new T.LineBasicMaterial({color:0xFF6A70,transparent:true,opacity:.28})));
        travs2.push({pts:pts2,ph:Math.random(),sp:0.8+Math.random()*0.7}); }
      var tg2=new T.BufferGeometry(); tg2.setAttribute('position',new T.BufferAttribute(tp2,3));
      var tm2=new T.PointsMaterial({color:0xFFD9DC,size:0.055,transparent:true,opacity:.95,depthWrite:false});
      g.add(new T.Points(tg2,tm2));
      camera.position.set(0,0.03,3.45); camera.lookAt(0,0,0);/* full-card canvas: the sphere fills the box without clipping */
      var sp=1;
      return {tick:function(t,hot){ sp+=((hot?3.2:1)-sp)*0.05;
        g.rotation.y+=0.0016*sp; g.rotation.x=0.28+Math.sin(t*0.0004)*0.05;
        mMat.size=0.105+0.022*Math.sin(t*0.004);
        for(var ti2=0;ti2<travs2.length;ti2++){ var tr2=travs2[ti2];
          var pp2=tr2.pts[Math.floor(((t*0.0002*tr2.sp+tr2.ph)%1)*(tr2.pts.length-1))];
          tp2[ti2*3]=pp2.x; tp2[ti2*3+1]=pp2.y; tp2[ti2*3+2]=pp2.z; }
        tg2.attributes.position.needsUpdate=true;
        var sc=1+(hot?0.05:0); g.scale.set(sc,sc,sc); }};
    });
    /* ── MISSION: the countries, orbiting as a carousel of chips ── */
    mini('misCv','#vmMission',function(scene,camera){
      var g=new T.Group(); scene.add(g);
      function chip(txt,hq){ var cv=document.createElement('canvas'); cv.width=512; cv.height=96;
        var c=cv.getContext('2d');
        c.font='700 34px "JetBrains Mono",monospace';
        var tw=c.measureText(txt).width, bw=tw+96, bx0=(512-bw)/2;
        c.fillStyle=hq?'rgba(194,39,48,0.95)':'rgba(14,22,40,0.92)';
        c.strokeStyle=hq?'rgba(255,255,255,0.5)':'rgba(143,160,190,0.55)'; c.lineWidth=3;
        c.beginPath(); c.roundRect(bx0,14,bw,68,8); c.fill(); c.stroke();
        c.fillStyle=hq?'#FFFFFF':'#FF4D55'; c.fillRect(bx0+26,40,16,16);
        c.fillStyle='#EAF0FB'; c.textBaseline='middle'; c.fillText(txt,bx0+62,50);
        var tex=new T.CanvasTexture(cv); if(T.SRGBColorSpace) tex.colorSpace=T.SRGBColorSpace;
        var sp2=new T.Sprite(new T.SpriteMaterial({map:tex,transparent:true,depthWrite:false}));
        sp2.scale.set(1.75,0.33,1); return sp2; }
      var CN=[['MALAYSIA · HQ',true],['SINGAPORE',false],['GERMANY',false],['FRANCE',false],['INDIA',false],
              ['CHINA',false],['SWEDEN',false],['POLAND',false],['MOROCCO',false]];
      var sats=[];
      CN.forEach(function(cn,i){ var sp3=chip(cn[0],cn[1]); sp3.userData.a=i/CN.length*Math.PI*2;
        sp3.userData.y=((i%3)-1)*0.42; g.add(sp3); sats.push(sp3); });
      var core=new T.Mesh(new T.SphereGeometry(0.16,14,14),new T.MeshBasicMaterial({color:0xFF3B44,transparent:true,opacity:.75}));
      g.add(core);
      var ring=new T.Mesh(new T.TorusGeometry(1.5,0.004,8,90),new T.MeshBasicMaterial({color:0x44557A,transparent:true,opacity:.5}));
      ring.rotation.x=Math.PI/2; g.add(ring);
      camera.position.set(0,0.5,4.4); camera.lookAt(0,0,0);
      var rot=0,sp=1;
      return {tick:function(t,hot){ sp+=((hot?2.8:1)-sp)*0.05; rot+=0.0035*sp;
        for(var i=0;i<sats.length;i++){ var an=sats[i].userData.a+rot;
          sats[i].position.set(Math.cos(an)*1.5,sats[i].userData.y+Math.sin(t*0.0009+i)*0.05,Math.sin(an)*1.5);
          var depth=(Math.sin(an)+1)/2; sats[i].material.opacity=0.35+0.65*depth; }
        core.material.opacity=0.5+0.3*Math.abs(Math.sin(t*0.0016)); }};
    });
    /* ── VALUES CORE: a six-faced prism, one face per value; hovering a tile turns it ── */
    var coreTarget=-1;
    mini('valCv','#vCore',function(scene,camera){
    /* THE METAPHOR: six pillars, one per value, carry the roof over the site core.
       Remove any one and the structure fails. Hover a value: its pillar takes the load. */
    var g=new T.Group(); scene.add(g);
    var rim2=new T.DirectionalLight(0xDCE8FF,0.55); rim2.position.set(-5,3.4,-4); scene.add(rim2);
    var warm2=new T.PointLight(0xFFFFFF,0.5,12); warm2.position.set(2.4,3.0,2.6); scene.add(warm2);
    scene.add(new T.AmbientLight(0xffffff,.35));
    var RED=0xEC2027;
    function edges(mesh,c,o){ mesh.add(new T.LineSegments(new T.EdgesGeometry(mesh.geometry),
      new T.LineBasicMaterial({color:c||0x9AA6BB,transparent:true,opacity:o||.22}))); return mesh; }
    var ground=edges(new T.Mesh(new T.CylinderGeometry(1.96,2.04,0.075,72),
      new T.MeshStandardMaterial({color:0xFFFFFF,roughness:.48,metalness:.02})),0x9AA6BB,.18);
    ground.position.y=-0.95; g.add(ground);
    var roof=edges(new T.Mesh(new T.CylinderGeometry(1.8,1.84,0.048,72),
      new T.MeshStandardMaterial({color:0xFFFFFF,roughness:.32,metalness:.02})),0x9AA6BB,.24);
    roof.position.y=0.72; g.add(roof);
    var roof2=new T.Mesh(new T.CylinderGeometry(1.68,1.74,0.032,72),
      new T.MeshStandardMaterial({color:0xFCFDFF,roughness:.38,metalness:.02}));
    roof2.position.y=0.678; g.add(roof2);
    var groundStep=new T.Mesh(new T.CylinderGeometry(1.72,1.8,0.045,72),
      new T.MeshStandardMaterial({color:0xFCFDFF,roughness:.48,metalness:.02}));
    groundStep.position.y=-0.9; g.add(groundStep);
    var trim=new T.Mesh(new T.TorusGeometry(1.74,0.006,10,90),
      new T.MeshStandardMaterial({color:0xEC2027,roughness:.35,metalness:.05}));
    trim.rotation.x=Math.PI/2; trim.position.y=0.657; g.add(trim);
    /* the IAQ mark, genuinely 3D: an extruded stack of layers that swings to face the viewer */
    var core=new T.Group(); core.position.y=-0.38; g.add(core);
    var coreFront=null;
    new T.TextureLoader().load('/assets/iaq-logo-mark.webp',function(tex){ if(T.SRGBColorSpace) tex.colorSpace=T.SRGBColorSpace;
      tex.anisotropy=8;
      var LG=new T.PlaneGeometry(1.0,0.41);
      for(var li=0;li<7;li++){ var back=li<6;
        var lm=new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,
          color:back?0x481014:0xFFFFFF});
        var lp=new T.Mesh(LG,lm); lp.position.z=-0.096+li*0.016; lp.renderOrder=li;
        core.add(lp); if(!back) coreFront=lm; } });
    var ped=edges(new T.Mesh(new T.CylinderGeometry(0.3,0.34,0.13,24),
      new T.MeshStandardMaterial({color:0xFCFDFF,roughness:.44,metalness:.02})));
    ped.position.y=-0.82; g.add(ped);
    function vlabel(i){ var cv=document.createElement('canvas'); cv.width=256; cv.height=96;
      var c=cv.getContext('2d'); c.font='700 44px "JetBrains Mono",monospace';
      c.textAlign='center'; c.textBaseline='middle'; c.fillStyle='#C22730'; c.fillText('V\u00b70'+(i+1),128,48);
      var tex=new T.CanvasTexture(cv); if(T.SRGBColorSpace) tex.colorSpace=T.SRGBColorSpace;
      var sp2=new T.Sprite(new T.SpriteMaterial({map:tex,transparent:true,opacity:.12,depthWrite:false}));
      sp2.scale.set(0.62,0.23,1); sp2.material.opacity=0; return sp2; }
    /* the emblem IS the statue: each value stands on its capital as a monument in its own right,
       carved at scale, nobody holding it */
    function statue(i){
      var st2=new T.Group();
      var stoneS=new T.MeshStandardMaterial({color:0xFCFDFF,roughness:.42,metalness:.03});
      var stoneD=new T.MeshStandardMaterial({color:0xF4F7FB,roughness:.48,metalness:.02});
      var red=new T.MeshStandardMaterial({color:0xEC2027,roughness:.3,metalness:.08});
      var redD=new T.MeshStandardMaterial({color:0xC2151B,roughness:.34,metalness:.06});
      /* a low plinth, the way a monument meets its pedestal */
      var pl=new T.Mesh(new T.CylinderGeometry(0.11,0.125,0.04,28),stoneD); pl.position.y=0.02; st2.add(pl);
      var mv=new T.Group(); mv.position.y=0.075; st2.add(mv);
      st2.userData.mv=mv; st2.userData.type=i;

      if(i===0){            /* SAFETY: a standing shield */
        var sp=[new T.Vector2(0,0),new T.Vector2(0.085,0.055),new T.Vector2(0.1,0.145),
                new T.Vector2(0.072,0.235),new T.Vector2(0,0.285)];
        var shield=new T.Mesh(new T.LatheGeometry(sp,26),red);
        shield.scale.z=0.34; mv.add(shield);
        var rim=new T.Mesh(new T.TorusGeometry(0.098,0.008,8,30),stoneS);
        rim.scale.set(1,1.35,0.34); rim.position.y=0.145; mv.add(rim);
        var chev=new T.Mesh(new T.BoxGeometry(0.075,0.016,0.03),stoneS);
        chev.position.set(0,0.15,0.03); mv.add(chev);
      }else if(i===1){      /* QUALITY: a monumental dial */
        var dial=new T.Mesh(new T.CylinderGeometry(0.115,0.115,0.035,34),red);
        dial.rotation.x=Math.PI/2; dial.position.y=0.125; mv.add(dial);
        var bez=new T.Mesh(new T.TorusGeometry(0.118,0.014,10,36),stoneS); bez.position.y=0.125; mv.add(bez);
        var faceD=new T.Mesh(new T.CircleGeometry(0.098,30),stoneS); faceD.position.set(0,0.125,0.019); mv.add(faceD);
        for(var q=0;q<12;q++){ var qa=q/12*Math.PI*2;
          var tk=new T.Mesh(new T.BoxGeometry(0.007,q%3===0?0.024:0.013,0.006),redD);
          tk.position.set(Math.cos(qa)*0.081,0.125+Math.sin(qa)*0.081,0.023); tk.rotation.z=qa+Math.PI/2; mv.add(tk); }
        var nd=new T.Mesh(new T.BoxGeometry(0.011,0.078,0.009),red); nd.geometry.translate(0,0.039,0);
        nd.position.set(0,0.125,0.028); mv.add(nd); st2.userData.needle=nd;
      }else if(i===2){      /* INTEGRITY: a cut gem raised clear of its pedestal on a slender stem */
        var stem=new T.Mesh(new T.CylinderGeometry(0.013,0.017,0.1,14),stoneS); stem.position.y=0.05; mv.add(stem);
        var gem=new T.Mesh(new T.OctahedronGeometry(0.098,0),red); gem.position.y=0.2; mv.add(gem);
        var facet=new T.LineSegments(new T.EdgesGeometry(new T.OctahedronGeometry(0.098,0)),
          new T.LineBasicMaterial({color:0xFFFFFF,transparent:true,opacity:.5})); facet.position.y=0.2; mv.add(facet);
      }else if(i===3){      /* ENGINEERING: a great cog set upright */
        var gearG=new T.Group(); gearG.position.y=0.125; mv.add(gearG); st2.userData.gearG=gearG;
        var gw=new T.Mesh(new T.CylinderGeometry(0.092,0.092,0.036,26),red); gw.rotation.x=Math.PI/2; gearG.add(gw);
        for(var tt=0;tt<10;tt++){ var ta=tt*Math.PI*2/10;
          var th=new T.Mesh(new T.BoxGeometry(0.03,0.03,0.038),red);
          th.position.set(Math.cos(ta)*0.108,Math.sin(ta)*0.108,0); th.rotation.z=ta; gearG.add(th); }
        var hub=new T.Mesh(new T.CylinderGeometry(0.03,0.03,0.042,18),stoneS); hub.rotation.x=Math.PI/2; gearG.add(hub);
      }else if(i===4){      /* EFFICIENCY: a bolt driven upward */
        var b1=new T.Mesh(new T.BoxGeometry(0.052,0.13,0.032),red); b1.position.set(0.026,0.155,0); b1.rotation.z=0.5; mv.add(b1);
        var b2=new T.Mesh(new T.BoxGeometry(0.052,0.13,0.032),red); b2.position.set(-0.026,0.055,0); b2.rotation.z=0.5; mv.add(b2);
      }else{                /* EXCELLENCE: a trophy on its stand */
        var cupg=[new T.Vector2(0.012,0),new T.Vector2(0.03,0.024),new T.Vector2(0.026,0.07),
                  new T.Vector2(0.088,0.098),new T.Vector2(0.095,0.2)];
        var trophy=new T.Mesh(new T.LatheGeometry(cupg,26),red); trophy.position.y=0.022; mv.add(trophy);
        [-1,1].forEach(function(sg){ var handle=new T.Mesh(new T.TorusGeometry(0.036,0.009,8,20,Math.PI),red);
          handle.position.set(sg*0.092,0.178,0); handle.rotation.z=sg>0?-Math.PI/2:Math.PI/2; mv.add(handle); });
      }
      return st2; }
    var pillars=[],picks=[],P_pool=null;
    for(var i=0;i<6;i++){ var a=i*Math.PI/3+Math.PI/6, px=Math.cos(a)*1.42, pz=Math.sin(a)*1.42;
      var mat=new T.MeshStandardMaterial({color:0xFDFEFF,roughness:.33,metalness:.03});
      var shaftPts=[];
      for(var sv=0;sv<=12;sv++){ var u=sv/12; /* subtle entasis: a classical swell, not a tube */
        shaftPts.push(new T.Vector2(0.072+0.009*Math.sin(Math.PI*u*0.86)-0.011*u, -0.75+1.5*u)); }
      var col=new T.Mesh(new T.LatheGeometry(shaftPts,44),mat);
      /* shallow flutes, finer now: carved, not corrugated */
      for(var fl=0;fl<16;fl++){ var fa=fl/16*Math.PI*2;
        var flute=new T.Mesh(new T.CylinderGeometry(0.0075,0.0075,1.44,6),
          new T.MeshStandardMaterial({color:0xF8FAFD,roughness:.48,metalness:.02}));
        flute.position.set(Math.cos(fa)*0.0735,0,Math.sin(fa)*0.0735); col.add(flute); }
      col.position.set(px,-0.13,pz); g.add(col);
      var pad=new T.Group();
      var pd1=new T.Mesh(new T.CylinderGeometry(0.175,0.19,0.036,40),
        new T.MeshStandardMaterial({color:0xFBFCFE,roughness:.44,metalness:.02})); pd1.position.y=0.018; pad.add(pd1);
      var pd2=new T.Mesh(new T.TorusGeometry(0.135,0.018,10,40),
        new T.MeshStandardMaterial({color:0xF7FAFD,roughness:.4,metalness:.03})); pd2.rotation.x=Math.PI/2; pd2.position.y=0.05; pad.add(pd2);
      pad.position.set(px,-0.87,pz); g.add(pad);
      var capMat=new T.MeshStandardMaterial({color:0xFDFEFF,roughness:.33,metalness:.03});
      var cap=new T.Group();
      var cp1=new T.Mesh(new T.TorusGeometry(0.115,0.018,10,40),capMat); cp1.rotation.x=Math.PI/2; cp1.position.y=-0.008; cap.add(cp1);
      var cp2=new T.Mesh(new T.CylinderGeometry(0.165,0.142,0.036,40),capMat); cp2.position.y=0.028; cap.add(cp2);
      cap.material=capMat;
      cap.position.set(px,0.645,pz); g.add(cap);
      /* a shaft of light that falls onto the chosen value */
      var beam=new T.Mesh(new T.CylinderGeometry(0.028,0.15,1.9,24,1,true),
        new T.MeshBasicMaterial({color:0xFFD9DB,transparent:true,opacity:0,depthWrite:false,
          side:T.DoubleSide,blending:T.AdditiveBlending}));
      beam.position.set(px,1.85,pz); g.add(beam);
      /* a soft pool where the light lands */
      var pool=new T.Mesh(new T.CircleGeometry(0.26,32),
        new T.MeshBasicMaterial({color:0xEC2027,transparent:true,opacity:0,depthWrite:false}));
      pool.rotation.x=-Math.PI/2; pool.position.set(px,0.768,pz); g.add(pool);
      P_pool=pool;
      var lab=vlabel(i); lab.position.set(px*1.12,1.42,pz*1.12); g.add(lab);
      var ring=new T.Mesh(new T.TorusGeometry(0.36,0.014,8,60),
        new T.MeshBasicMaterial({color:RED,transparent:true,opacity:0}));
      ring.rotation.x=Math.PI/2; ring.position.set(px,-0.88,pz); g.add(ring);
      var st=statue(i); st.position.set(px,0.744,pz); st.lookAt(0,0.744,0); g.add(st);
      /* an invisible column you can actually point at */
      var pick=new T.Mesh(new T.CylinderGeometry(0.34,0.34,2.5,10),
        new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,depthTest:false}));
      pick.position.set(px,0.05,pz); pick.userData.vi=i; g.add(pick); picks.push(pick);
      pillars.push({pool:P_pool.material,mat:mat,col:col,beam:beam.material,lab:lab.material,ring:ring,ringM:ring.material,a:a,px:px,pz:pz,st:st,cap:cap,h:0}); }
    [2.3,2.66].forEach(function(rr,ri){ var gr3=new T.Mesh(new T.TorusGeometry(rr,0.006,6,110),
      new T.MeshBasicMaterial({color:0xB6C0D2,transparent:true,opacity:ri?0.14:0.24}));
      gr3.rotation.x=Math.PI/2; gr3.position.y=-1.02; g.add(gr3); });
    var _vz=((vcv&&vcv.clientWidth?vcv.clientWidth:innerWidth)<760)?8.7:10.4; camera.position.set(0,1.85,_vz); camera.lookAt(0,0.0,0); var prjV=new T.Vector3(), vcv=document.getElementById('valCv');
    /* point at the temple itself: hover a pillar, click to hold it */
    (function(){
      if(!vcv) return;
      var rayV=new T.Raycaster(), pv=new T.Vector2(-9,-9), lockV=-1;
      window.__vSetLock=function(v){ lockV=v; };
      function pickAt(e){
        var r=vcv.getBoundingClientRect();
        pv.x=((e.clientX-r.left)/r.width)*2-1; pv.y=-((e.clientY-r.top)/r.height)*2+1;
        rayV.setFromCamera(pv,camera);
        var h=rayV.intersectObjects(picks,false)[0];
        return h?h.object.userData.vi:-1;
      }
      vcv.style.pointerEvents='auto';
      var lastVi=-1, offT=null, settleT=null, turning=false;
      window.__vTurning=function(){ turning=true; clearTimeout(settleT);
        /* ignore new picks until the turn has settled, or the model would chase the cursor */
        settleT=setTimeout(function(){turning=false;},620); };
      vcv.addEventListener('pointermove',function(e){
        window.__vCanvasHover=true;
        if(turning) return;
        var vi=pickAt(e);
        vcv.style.cursor=vi>=0?'pointer':'default';
        if(vi>=0){
          clearTimeout(offT); offT=null;
          if(vi!==lastVi){ lastVi=vi; if(window.__vHover)window.__vHover(vi); if(window.__vTurning)window.__vTurning(); }
        }else if(lockV<0&&lastVi>=0&&!offT){
          /* leaving a pillar: wait a beat before dropping it, so a shaky hand keeps the selection */
          offT=setTimeout(function(){ offT=null; lastVi=-1; if(window.__vHover)window.__vHover(-1); },260);
        }
      });
      vcv.addEventListener('pointerleave',function(){
        window.__vCanvasHover=false; vcv.style.cursor='default';
        clearTimeout(offT); offT=null; lastVi=-1;
        if(lockV<0&&window.__vHover)window.__vHover(-1);
      });
      vcv.addEventListener('click',function(e){
        var vi=pickAt(e);
        if(vi<0) return;
        lockV=(lockV===vi)?-1:vi;
        window.__vCanvasHover=(lockV<0);   /* locked: allow the turn-to-face */
        if(window.__vHover)window.__vHover(lockV<0?vi:lockV,lockV>=0);
      });
    })();
    var rotT=0.5, rot=0.5, base=new T.Color(0xF7FAFD), redC=new T.Color(0xEC2027);
    return {tick:function(t,hot){
      /* only turn to face a value chosen from the tiles or a click: rotating while the cursor
         is on the model would slide a different pillar under the pointer and oscillate */
      /* bring the chosen value round to the front, wherever the choice came from */
      if(coreTarget>=0){ rotT=pillars[coreTarget].a-Math.PI/2; } else { rotT+=0.0016; }
      var d=rotT-rot; d=Math.atan2(Math.sin(d),Math.cos(d)); rot+=d*0.055; g.rotation.y=rot;
      var anyH=0;
      for(var i2=0;i2<6;i2++){ var P=pillars[i2], tgt=(coreTarget===i2)?1:0;
        P.h+=(tgt-P.h)*0.065; anyH=Math.max(anyH,P.h);
        /* the chosen column lights from within, warm white into brand red at the capital */
        P.mat.color.copy(base).lerp(new T.Color(0xFFFFFF),P.h);
        if(P.mat.emissive)P.mat.emissive.setRGB(0.30*P.h,0.045*P.h,0.055*P.h);
        P.cap.material.color.copy(new T.Color(0xFFFFFF)).lerp(redC,P.h);
        if(P.cap.material.emissive)P.cap.material.emissive.setRGB(0.34*P.h,0.05*P.h,0.06*P.h);
        P.col.scale.y=1+0.05*P.h;
        P.col.position.y=-0.13+0.045*P.h;
        P.beam.opacity=0.22*P.h*(0.85+0.15*Math.sin(t*0.0022));
        if(P.pool)P.pool.opacity=0.10*P.h;
        P.lab.opacity=P.h;
        var UD=P.st.userData, MV=UD.mv, amp=1+2.2*P.h;
        /* the emblem itself lifts into full brand red when its value is chosen */
        P.st.traverse(function(o){ if(o.material&&o.material.emissive&&o.material.color&&
          o.material.color.r>0.5&&o.material.color.g<0.4){ o.material.emissive.setRGB(0.26*P.h,0.02*P.h,0.025*P.h); } });
        if(UD.type===0){ var hb3=1+(0.02+0.02*P.h)*Math.sin(t*0.0014); MV.scale.set(hb3,hb3,hb3); }
        else if(UD.type===1){ UD.needle.rotation.z=-0.55+(0.4+0.3*P.h)*Math.sin(t*0.001); }
        else if(UD.type===2){ MV.position.y=0.03*(1+0.6*P.h)*Math.sin(t*0.0012); MV.rotation.y=0.3*Math.sin(t*0.0006); }
        else if(UD.type===3){ UD.gearG.rotation.z-=0.006+0.016*P.h; }
        else if(UD.type===4){ var j2=Math.pow(Math.max(0,Math.sin(t*0.0014)),12);
          var js=1+0.09*j2*(0.6+0.6*P.h); MV.scale.set(js,js,js); }
        else { MV.position.y=(0.018+0.016*Math.sin(t*0.0008))*(1+0.6*P.h); MV.rotation.z=0.04*Math.sin(t*0.0007); }
        var ss2=1.02+0.24*P.h; P.st.scale.set(ss2,ss2,ss2);
        P.ringM.opacity=0;
        var rs=1+0.18*P.h*(0.5+0.5*Math.sin(t*0.002)); P.ring.scale.set(rs,rs,1); }
      roof.position.y=0.72+0.05*anyH; roof2.position.y=0.678+0.05*anyH; trim.position.y=0.657+0.05*anyH;
      for(var i5=0;i5<6;i5++){ pillars[i5].st.position.y=0.744+0.05*anyH; pillars[i5].cap.position.y=0.645+0.05*anyH; }
      if(window.__valTrack&&vcv){ g.updateMatrixWorld();
        var cr4=vcv.getBoundingClientRect(), pts4=[];
        for(var i6=0;i6<6;i6++){ var P6=pillars[i6];
          prjV.set(P6.px,1.05,P6.pz).applyMatrix4(g.matrixWorld).project(camera);
          pts4.push({x:cr4.left+(prjV.x*0.5+0.5)*cr4.width, y:cr4.top+(prjV.y*-0.5+0.5)*cr4.height, h:P6.h}); }
        window.__valTrack(pts4); }
      core.rotation.y=-rot+0.24*Math.sin(t*0.0006);
      core.position.y=-0.38+0.03*Math.sin(t*0.0012);
      var cs2=1+0.07*anyH; core.scale.set(cs2,cs2,cs2);
      if(coreFront) coreFront.opacity=0.9+0.1*Math.sin(t*0.0016);
      warm2.intensity=0.45+0.9*anyH;
      g.position.y=0.03*Math.sin(t*0.0007);
    }};
  });
    /* ── ESG dioramas: environmental grove, the people, the balance ── */
    mini('esgEnvCv','#noesg1',function(scene,camera){
      var g=new T.Group(); scene.add(g);
      var gr=new T.Mesh(new T.CylinderGeometry(1.5,1.5,0.12,6),new T.MeshStandardMaterial({color:0x14203A,roughness:.8}));
      gr.position.y=-0.6; g.add(gr);
      var grass=new T.Mesh(new T.CylinderGeometry(1.32,1.32,0.05,6),new T.MeshStandardMaterial({color:0x1E5C46,roughness:.75}));
      grass.position.y=-0.52; g.add(grass);
      var trees=[];
      [[-0.75,0.3,1],[0.85,-0.2,0.8],[0.35,0.75,0.65]].forEach(function(u){
        var tg=new T.Group();
        var c1=new T.Mesh(new T.ConeGeometry(0.22*u[2],0.5*u[2],8),new T.MeshStandardMaterial({color:0x2E8B6A,roughness:.7})); c1.position.y=0.25*u[2]; tg.add(c1);
        var c2=new T.Mesh(new T.ConeGeometry(0.17*u[2],0.4*u[2],8),new T.MeshStandardMaterial({color:0x37A57E,roughness:.7})); c2.position.y=0.5*u[2]; tg.add(c2);
        tg.position.set(u[0],-0.5,u[1]); g.add(tg); trees.push(tg); });
      var bld=new T.Mesh(new T.BoxGeometry(0.8,0.5,0.55),new T.MeshStandardMaterial({color:0xEDF1F7,roughness:.5}));
      bld.position.set(-0.15,-0.24,-0.25); g.add(bld);
      var cap=new T.Mesh(new T.BoxGeometry(0.84,0.05,0.59),new T.MeshStandardMaterial({color:0xC22730,roughness:.5}));
      cap.position.set(-0.15,0.04,-0.25); g.add(cap);
      var ring=new T.Mesh(new T.TorusGeometry(1.15,0.012,8,80),new T.MeshBasicMaterial({color:0x37A57E,transparent:true,opacity:.5}));
      ring.rotation.x=Math.PI/2; ring.position.y=0.1; g.add(ring);
      var orb=new T.Mesh(new T.SphereGeometry(0.05,10,10),new T.MeshBasicMaterial({color:0x53D0A2}));
      g.add(orb);
      camera.position.set(0,1.5,4.2); camera.lookAt(0,-0.15,0);
      return {tick:function(t,hot){ g.rotation.y+=hot?0.012:0.004;
        for(var i=0;i<3;i++) trees[i].rotation.z=0.045*Math.sin(t*0.0012+i*2);
        var a=t*0.0012; orb.position.set(Math.cos(a)*1.15,0.1,Math.sin(a)*1.15); }};
    });
    mini('esgSocCv','#noesg2',function(scene,camera){
      var g=new T.Group(); scene.add(g);
      var fl=new T.Mesh(new T.CylinderGeometry(1.4,1.4,0.1,32),new T.MeshStandardMaterial({color:0x16223C,roughness:.8})); fl.position.y=-0.62; g.add(fl);
      var rring=new T.Mesh(new T.TorusGeometry(1.2,0.012,8,70),new T.MeshBasicMaterial({color:0xFF4D55,transparent:true,opacity:.4}));
      rring.rotation.x=Math.PI/2; rring.position.y=-0.55; g.add(rring);
      function figure(x,z,suit,vest){ var Pp=new T.Group();
        function bb(w,h,d,c){ return new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshStandardMaterial({color:c,roughness:.6})); }
        var l1=bb(0.09,0.3,0.1,0x141F36); l1.position.set(-0.07,-0.42,0); Pp.add(l1);
        var l2=bb(0.09,0.3,0.1,0x141F36); l2.position.set(0.07,-0.42,0); Pp.add(l2);
        var to=bb(0.3,0.36,0.16,vest?0xC22730:suit); to.position.y=-0.09; Pp.add(to);
        var a1=bb(0.08,0.32,0.1,suit); a1.position.set(-0.2,-0.11,0); Pp.add(a1);
        var a2=bb(0.08,0.32,0.1,suit); a2.position.set(0.2,-0.11,0); Pp.add(a2);
        var hd=bb(0.18,0.18,0.18,0xD9B99B); hd.position.y=0.2; Pp.add(hd);
        var hr=bb(0.19,0.06,0.19,0x161A24); hr.position.y=0.3; Pp.add(hr);
        Pp.position.set(x,0,z); g.add(Pp); return Pp; }
      var ppl=[figure(-0.55,0.15,0x25344F,false),figure(0,0.35,0x1B2B45,true),figure(0.55,0.1,0x2A3A57,false)];
      camera.position.set(0,0.7,3.6); camera.lookAt(0,-0.25,0);
      return {tick:function(t,hot){ g.rotation.y=0.22*Math.sin(t*0.0004)+(hot?0.1:0);
        for(var i=0;i<3;i++) ppl[i].position.y=0.015*Math.sin(t*0.002+i*1.9); }};
    });
    mini('esgGovCv','#noesg3',function(scene,camera){
      var g=new T.Group(); scene.add(g);
      var fl2=new T.Mesh(new T.CylinderGeometry(1.3,1.3,0.1,6),new T.MeshStandardMaterial({color:0x16223C,roughness:.8})); fl2.position.y=-0.66; g.add(fl2);
      var base2=new T.Mesh(new T.BoxGeometry(0.5,0.08,0.5),new T.MeshStandardMaterial({color:0xC7CFDA,roughness:.5})); base2.position.y=-0.58; g.add(base2);
      var col=new T.Mesh(new T.CylinderGeometry(0.11,0.13,1.0,14),new T.MeshStandardMaterial({color:0xE7ECF4,roughness:.45})); col.position.y=-0.1; g.add(col);
      var capG=new T.Mesh(new T.BoxGeometry(0.3,0.06,0.3),new T.MeshStandardMaterial({color:0xC22730,roughness:.5})); capG.position.y=0.44; g.add(capG);
      var beam=new T.Group(); beam.position.y=0.52; g.add(beam);
      var bar=new T.Mesh(new T.BoxGeometry(1.5,0.04,0.05),new T.MeshStandardMaterial({color:0xB7C2D1,roughness:.35,metalness:.3})); beam.add(bar);
      [-0.7,0.7].forEach(function(x){
        var wire=new T.Mesh(new T.CylinderGeometry(0.008,0.008,0.34,6),new T.MeshStandardMaterial({color:0x8A94A2})); wire.position.set(x,-0.19,0); beam.add(wire);
        var pan=new T.Mesh(new T.CylinderGeometry(0.17,0.14,0.05,16),new T.MeshStandardMaterial({color:0xC22730,roughness:.45})); pan.position.set(x,-0.38,0); beam.add(pan); });
      camera.position.set(0,0.55,3.7); camera.lookAt(0,-0.05,0);
      return {tick:function(t,hot){ g.rotation.y+=hot?0.012:0.0035;
        beam.rotation.z=0.09*Math.sin(t*0.0011); }};
    });
    /* ── the three pillars: live 3D loops, subtle and premium ── */
    mini('mcEpcCv','#nomc1',function(scene,camera){
      var g=new T.Group(); scene.add(g);
      var slab=new T.Mesh(new T.BoxGeometry(2.2,0.12,1.6),new T.MeshStandardMaterial({color:0x1B2B45,roughness:.7}));
      slab.position.y=-0.62; g.add(slab);
      var blocks=[],mats=[];
      [[-0.6,-0.35,0],[0.1,-0.35,0],[0.8,-0.35,0],[-0.25,0.2,0.05],[0.45,0.2,0.05],[0.1,0.72,0.1]].forEach(function(u,i){
        var mt=new T.MeshStandardMaterial({color:i===5?0xC22730:0xE7ECF4,roughness:.5,transparent:true});
        var b=new T.Mesh(new T.BoxGeometry(0.62,0.5,0.9),mt); b.position.set(u[0],u[1],u[2]);
        g.add(b); blocks.push({m:b,y0:u[1],i:i}); mats.push(mt); });
      var mast=new T.Mesh(new T.CylinderGeometry(0.03,0.03,2.0,8),new T.MeshStandardMaterial({color:0x9AA6B8,roughness:.4,metalness:.2}));
      mast.position.set(-1.35,0.35,0); g.add(mast);
      var jib=new T.Group(); jib.position.set(-1.35,1.3,0); g.add(jib);
      var arm=new T.Mesh(new T.BoxGeometry(1.5,0.05,0.05),new T.MeshStandardMaterial({color:0xC22730,roughness:.5}));
      arm.position.x=0.6; jib.add(arm);
      camera.position.set(0,1.15,4.4); camera.lookAt(0,-0.05,0);
      return {tick:function(t,hot){ g.rotation.y=0.35+0.16*Math.sin(t*0.0003)+(hot?0.12:0);
        jib.rotation.y=t*0.0006;
        for(var i=0;i<blocks.length;i++){ var B=blocks[i];
          var ph=((t*0.00022)-B.i*0.13)%1.7; if(ph<0)ph+=1.7;
          var up=Math.min(1,Math.max(0,ph*2.4)), out=Math.max(0,Math.min(1,(ph-1.45)*4));
          var e=up*up*(3-2*up), k=e*(1-out);
          B.m.position.y=B.y0+(1-k)*1.0; B.m.material.opacity=k; } }};
    });
    mini('mcUtilCv','#nomc2',function(scene,camera){
      /* a disciplined process line: pump skid feeds a tool through one clean rise */
      var g=new T.Group(); scene.add(g);
      var base=new T.Mesh(new T.BoxGeometry(3.4,0.1,1.2),new T.MeshStandardMaterial({color:0x16223C,roughness:.75}));
      base.position.y=-0.78; g.add(base);
      var pump=new T.Mesh(new T.BoxGeometry(0.52,0.42,0.44),new T.MeshStandardMaterial({color:0xE7ECF4,roughness:.5}));
      pump.position.set(-1.45,-0.5,0); g.add(pump);
      var pCap=new T.Mesh(new T.BoxGeometry(0.54,0.05,0.46),new T.MeshStandardMaterial({color:0xC22730,roughness:.5}));
      pCap.position.set(-1.45,-0.27,0); g.add(pCap);
      var tool=new T.Mesh(new T.BoxGeometry(0.56,0.6,0.46),new T.MeshStandardMaterial({color:0xF2F5FA,roughness:.5}));
      tool.position.set(1.5,-0.42,0); g.add(tool);
      var tBand=new T.Mesh(new T.BoxGeometry(0.58,0.05,0.48),new T.MeshStandardMaterial({color:0xC22730,roughness:.5}));
      tool.add(tBand); tBand.position.y=0.325;
      var PTS=[[-1.45,-0.2,0],[-0.55,-0.2,0],[-0.55,0.34,0],[0.6,0.34,0],[0.6,-0.2,0],[1.5,-0.2,0]];
      var pipeM=new T.MeshStandardMaterial({color:0x9AA6B8,roughness:.3,metalness:.45});
      for(var i=0;i<PTS.length-1;i++){ var a=new T.Vector3().fromArray(PTS[i]), b=new T.Vector3().fromArray(PTS[i+1]);
        var len=a.distanceTo(b);
        var seg=new T.Mesh(new T.CylinderGeometry(0.05,0.05,len,14),pipeM);
        seg.position.copy(a).lerp(b,0.5);
        if(Math.abs(b.x-a.x)>Math.abs(b.y-a.y)) seg.rotation.z=Math.PI/2;
        g.add(seg);
        if(i<PTS.length-2){ var el=new T.Mesh(new T.SphereGeometry(0.062,12,12),pipeM);
          el.position.copy(b); g.add(el); } }
      /* valves seated on the runs: bonnet + handwheel facing camera */
      var wheels=[];
      [[-1.0,-0.2],[0.02,0.34]].forEach(function(u){
        var bon=new T.Mesh(new T.CylinderGeometry(0.045,0.055,0.1,10),new T.MeshStandardMaterial({color:0x5A6C94,roughness:.4,metalness:.3}));
        bon.position.set(u[0],u[1]+0.08,0); g.add(bon);
        var wh=new T.Mesh(new T.TorusGeometry(0.085,0.018,8,26),new T.MeshStandardMaterial({color:0xC22730,roughness:.4}));
        wh.rotation.x=Math.PI/2; wh.position.set(u[0],u[1]+0.15,0); g.add(wh); wheels.push(wh); });
      var pulse=new T.Mesh(new T.SphereGeometry(0.06,10,10),new T.MeshBasicMaterial({color:0xFF4D55}));
      g.add(pulse);
      camera.position.set(0,0.5,3.9); camera.lookAt(0,-0.16,0);
      return {tick:function(t,hot){ g.rotation.y=0.08*Math.sin(t*0.0003)+(hot?0.1:0);
        for(var w=0;w<2;w++) wheels[w].rotation.y+=(w?-1:1)*(hot?0.05:0.018);
        var tp=(t*0.00026)%1, total=5, fi=Math.min(4,Math.floor(tp*total)), ff=tp*total-fi;
        var A=PTS[fi], B2=PTS[fi+1];
        pulse.position.set(A[0]+(B2[0]-A[0])*ff, A[1]+(B2[1]-A[1])*ff, 0);
        var pk=1+0.12*Math.sin(t*0.005); pump.scale.set(1,1+0.008*Math.sin(t*0.003),1); pulse.scale.set(pk,pk,pk); }};
    });
    mini('mcEnergyCv','#nomc3',function(scene,camera){
      var g=new T.Group(); scene.add(g);
      var ch=new T.Mesh(new T.BoxGeometry(1.15,0.75,0.8),new T.MeshStandardMaterial({color:0xE7ECF4,roughness:.5}));
      ch.position.set(-0.7,-0.3,0); g.add(ch);
      var chT=new T.Mesh(new T.BoxGeometry(1.19,0.06,0.84),new T.MeshStandardMaterial({color:0xC22730,roughness:.5}));
      chT.position.set(-0.7,0.11,0); g.add(chT);
      var fanG=new T.Group(); fanG.position.set(-0.7,0.2,0); g.add(fanG);
      var ring=new T.Mesh(new T.TorusGeometry(0.26,0.028,10,30),new T.MeshStandardMaterial({color:0x1A2233,roughness:.5}));
      ring.rotation.x=Math.PI/2; fanG.add(ring);
      var blades=new T.Group(); fanG.add(blades);
      for(var b3=0;b3<3;b3++){ var bl=new T.Mesh(new T.BoxGeometry(0.4,0.015,0.09),
        new T.MeshStandardMaterial({color:0x8FA0BE,roughness:.4,metalness:.3}));
        bl.rotation.y=b3*Math.PI/1.5; blades.add(bl); }
      var bld2=new T.Mesh(new T.BoxGeometry(0.7,1.0,0.6),new T.MeshStandardMaterial({color:0xF2F5FA,roughness:.5}));
      bld2.position.set(0.95,-0.18,0); g.add(bld2);
      var band=new T.Mesh(new T.BoxGeometry(0.72,0.06,0.62),new T.MeshStandardMaterial({color:0xC22730,roughness:.5}));
      band.position.set(0.95,0.22,0); g.add(band);
      var sup=new T.Mesh(new T.CylinderGeometry(0.035,0.035,1.15,10),new T.MeshStandardMaterial({color:0x3E6FD8,roughness:.4}));
      sup.rotation.z=Math.PI/2; sup.position.set(0.1,-0.06,0.18); g.add(sup);
      var ret=sup.clone(); ret.position.set(0.1,-0.5,0.18); ret.material=new T.MeshStandardMaterial({color:0xC22730,roughness:.4}); g.add(ret);
      var p1=new T.Mesh(new T.SphereGeometry(0.055,10,10),new T.MeshBasicMaterial({color:0x6FA0FF})); g.add(p1);
      var p2=new T.Mesh(new T.SphereGeometry(0.055,10,10),new T.MeshBasicMaterial({color:0xFF4D55})); g.add(p2);
      camera.position.set(0,0.7,4.1); camera.lookAt(0.05,-0.15,0);
      return {tick:function(t,hot){ g.rotation.y=0.3+0.14*Math.sin(t*0.0003)+(hot?0.12:0);
        blades.rotation.y+=hot?0.14:0.055;
        var f1=(t*0.0004)%1, f2=1-((t*0.0004+0.5)%1);
        p1.position.set(-0.55+1.3*f1,-0.06,0.18); p2.position.set(-0.55+1.3*f2,-0.5,0.18); }};
    });
    /* tile hover → core face + label */
    var names=['Safety commitment','Quality consistency','Honesty & integrity','Engineering capabilities','Efficiency & proficiency','Pursuit of excellence'];
    var coreEl=document.getElementById('vCore'), curEl=document.getElementById('vcCur');
    var tiles=[].slice.call(document.querySelectorAll('.vtile[data-vi]')), vLock=-1;
    function setValue(vi,lock){
      if(typeof lock==='boolean') vLock=lock?vi:-1;
      if(vi<0&&vLock>=0) vi=vLock;
      coreTarget=vi;
      tiles.forEach(function(t){ t.classList.toggle('hot',parseInt(t.getAttribute('data-vi'),10)===vi); });
      if(coreEl)coreEl.classList.toggle('lit',vi>=0);
      if(curEl&&vi>=0)curEl.textContent=names[vi];
    }
    window.__vHover=setValue;
    tiles.forEach(function(tile){
      var vi=parseInt(tile.getAttribute('data-vi'),10);
      tile.style.cursor='pointer';
      tile.addEventListener('pointerenter',function(){ window.__vCanvasHover=false; setValue(vi); });
      tile.addEventListener('pointerleave',function(){ setValue(-1); });
      tile.addEventListener('click',function(){ var lock=vLock!==vi; setValue(vi,lock); if(window.__vSetLock)window.__vSetLock(lock?vi:-1); });
    });
  }
  try{init(THREE_MOD);}catch(err){}
})();

/* ── footprint: live 3D globe with office pins, tags and flight arcs ── */
(function(){
  var host=document.getElementById('fpGlobe'); if(!host) return;
  var canvas=document.getElementById('fpCv'); if(!canvas) return;
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
  var LAND='ffffffffffffffffffffffffffffffffffffffffffffffff|000000000000000000000000000000000000000000000000|800000000000000000000000000000000000000000000000|800000000000000000000000000000000000000000000001|8000000000000000003f8000000000000000000000000001|800000000000ffc1fffff000000000000000000000000001|8000000000001f1ffffff800009000000000000000000001|0000000040007c1ffffffc00000000000000070000000001|80000000090198003ffffc00000000008007fff0007c0001|80000003e00000003ffff800000000040ffffffff87f8001|800e000037067f8007ffd0000000000c1ffffffffffffc01|80ffffff3fcb19f017ffc000007fc007ffffffffffffffff|e0fffffff7dff0780ffc000001fffdffffffffffffffffff|98fffffffffff0780fc00f0003ffffffffffffffffffffff|80ffffffffff003807c006000fffffffffffffffffffffff|80fffffffffe01c0038000001fdffffffffffffffffffff8|80ff93fffffc01e0000000001fdfffffffffffffffffc701|000e00fffffe01fe000000060f9fffffffffffffffe01e01|0010007fffffc1ff000000060f1fffffffffffffff803c00|8000001ffffffbffc000001f0fffffffffffffffffc03801|8000000fffffffffc000001ffffffffffffffffffff01001|8000000fffffffff60000003fffffffffffffffffff00001|00000003ffffbffc70000003ffffffffffffffffffd00001|80000003ffffdffc10000001ffffffffffffffffffd00001|80000003fffff7fe00000001feff3fffffffffffff900001|80000003ffffffe00000001fc37e03cffffffffffc100001|80000003ffffffc00000001f80bfffcffffffffff8200001|80000003ffffff800000001f0013ffcffffffffff0200001|80000001ffffff000000001e7901ffffffffffffb8600001|80000000ffffff0000000007fc001fffffffffff13c00001|800000003ffffc000000000ffc003fffffffffff86000001|800000003ffff8000000001fff3c3fffffffffff80000001|800000000fff98000000003fffffffffffffffff80000001|800000001ff80c000000007fffffdfcfffffffff00000001|8000000003f80400000000ffffffcfe1fffffffe00000001|8000000001f00000000001ffffffeffe0ffffffe80000001|8000000000f04e00000001fffffff7fe07fffff000000001|8000000000f8c020000001fffffff7fe03fc7f2000000001|80000000007fc048000001fffffff3fc03f83f0080000001|80000000001fc000000001fffffffbf001e03f8180000001|800000000001f000000001ffffffffc001e00fc080000001|8000000000003000000001fffffffe0000c00bc040000001|80000000000030f3000000fffffffee000c0098040000001|8000000000001fff8000007fffffffe00060080060000001|80000000000001ffc000003fffffffc00020040060000001|80000000000001fff80000181fffffc00000160e00000001|80000000000001fffc00000007ffff8000000e1e00000001|80000000000003fffe00000007ffff0000000e3e00000001|80000000000007ffff00000007fffe000000073d82000001|80000000000007ffffe0000007fffc00000007bd8be00001|80000000000007fffff0000003fff8000000010100f80001|80000000000007fffffc000003fff80000000050007d0001|80000000000003fffffc000001fff8000000000020360001|80000000000001fffff8000001fffc000000000000010001|80000000000001fffff0000001fffc000000000007100000|80000000000000ffffe0000003fffc60000000001f100001|800000000000007fffe0000003fff8e0000000003f980001|800000000000003fffe0000003fff1c0000000007ffc0002|000000000000001fffe0000001ffe1c000000000fffe0000|000000000000001fffc0000001ffe1c000000007fffe0000|800000000000001fff00000001ffe1800000000fffff0001|800000000000003ffc00000000ffc0000000000fffff8001|800000000000003ffc00000000ffc0000000000fffff8001|800000000000003ffc000000007f800000000007ffff8001|000000000000003ff8000000007f000000000007ffff8001|800000000000003ff0000000003e000000000007c1ff0001|800000000000003fe00000000000000000000002007f0000|800000000000007fc00000000000000000000000003e0004|800000000000007f0000000000000000000000000000000c|800000000000007e00000000000000000000000000000014|800000000000007c00000000000000000000000000040031|800000000000007800000000000000000000000000000061|80000000000000f800000000000000000000000000000001|80000000000000f800000000000000000000000000000001|80000000000000f000000000000000000000000000000000|800000000000007000000000000000000000000000000001|800000000000003800000000000000000000000000000001|800000000000000000000000000000000000000000000001|800000000000000000000000000000000000000000000001|800000000000000000000000000000000000000000000001|800000000000000000000000000000000000000000000000|800000000000000000000000000000000000000000000001|800000000000000100000000000000000000000000000000|8000000000000007000000000000001c00001f9c7fc00001|800000000000000f000000000000e3fffe7ffffffffff001|800000000000007f0000001fffffffffffffffffffffff81|80000000003c007f000001ffffffffffffffffffffffff81|8000312ffc7fffff00001ffffffffffffffffffffffffe01|800dfffffffffffff000fffffffffffffffffffffffffe41|f03fffffffffffffffffffffffffffffffffffffffffffff|ffffffffffffffffffffffffffffffffffffffffffffffff|ffffffffffffffffffffffffffffffffffffffffffffffff|ffffffffffffffffffffffffffffffffffffffffffffffff|ffffffffffffffffffffffffffffffffffffffffffffffff|ffffffffffffffffffffffffffffffffffffffffffffffff|ffffffffffffffffffffffffffffffffffffffffffffffff'.split('|');
  var GW=192,GH=96,R=1.62;
  var OFFICES=[[3.08,101.53,'Shah Alam \u00b7 HQ','\ud83c\uddf2\ud83c\uddfe'],[5.18,100.49,'Penang','\ud83c\uddf2\ud83c\uddfe'],[1.35,103.82,'Singapore','\ud83c\uddf8\ud83c\uddec'],
               [51.05,13.74,'Dresden','\ud83c\udde9\ud83c\uddea'],[46.6,2.4,'France','\ud83c\uddeb\ud83c\uddf7'],[21.0,78.0,'India','\ud83c\uddee\ud83c\uddf3']];
  var DELIVERED=[[31.2,121.5],[63.8,20.3],[52.2,21.0],[33.6,-7.6]];
  var T,renderer,scene,camera,g,ofMat,dlMat,raf=null,visb=false,intro=0,tagEls=[],tagVs=[],prV;
  cleanups.push(function(){ if(raf){ cancelAnimationFrame(raf); raf=null; } });
  var travs=[],travGeo=null,travPts=null,travMat=null;
  var rotY,rotYt,rotX=0.32,rotXt=0.32,dragging=false,lx=0,ly=0;
  function bit(y,x){ return (parseInt(LAND[y].charAt(x>>2),16)>>(3-(x&3)))&1; }
  function ll(lat,lon,r){ var la=lat*Math.PI/180,lo=lon*Math.PI/180;
    return [r*Math.cos(la)*Math.cos(lo), r*Math.sin(la), -r*Math.cos(la)*Math.sin(lo)]; }
  function init(mod){
    T=mod;
    scene=new T.Scene();
    camera=new T.PerspectiveCamera(40,2,0.1,60); camera.position.z=6.6;
    renderer=new T.WebGLRenderer({canvas:canvas,antialias:true,alpha:true}); renderers.push(renderer);
    renderer.setClearColor(0x000000,0); renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
    if(T.ColorManagement) T.ColorManagement.enabled=false;
    g=new T.Group(); scene.add(g);
    var pts=[],y,x;
    for(y=1;y<GH;y++)for(x=1;x<GW-1;x++){ if(!bit(y,x)) continue;
      var lat=90-((y+0.5)/GH)*180, lon=((x+0.5)/GW)*360-180;
      if(Math.random()>Math.cos(lat*Math.PI/180)*0.9+0.06) continue;
      var p=ll(lat+(Math.random()-0.5)*1.3, lon+(Math.random()-0.5)*1.3, R);
      pts.push(p[0],p[1],p[2]); }
    var geo=new T.BufferGeometry(); geo.setAttribute('position',new T.BufferAttribute(new Float32Array(pts),3));
    g.add(new T.Points(geo,new T.PointsMaterial({color:0x8FB0DC,size:1.7,sizeAttenuation:false,transparent:true,opacity:.55,depthWrite:false})));
    function pinCloud(list,color,size,r){ var arr=new Float32Array(list.length*3);
      list.forEach(function(o,i){ var p=ll(o[0],o[1],r); arr[i*3]=p[0];arr[i*3+1]=p[1];arr[i*3+2]=p[2]; });
      var pg=new T.BufferGeometry(); pg.setAttribute('position',new T.BufferAttribute(arr,3));
      var pm=new T.PointsMaterial({color:color,size:size,sizeAttenuation:false,transparent:true,opacity:0,depthTest:false});
      g.add(new T.Points(pg,pm)); return pm; }
    ofMat=pinCloud(OFFICES,0xFF3B44,6.0,R*1.015);
    dlMat=pinCloud(DELIVERED,0x9FB4D8,4.2,R*1.015);
    /* flight arcs out of Shah Alam: red to offices, pale to delivered-in countries,
       each with a light pulse travelling the route */
    var hq=ll(3.08,101.53,R*1.008), hqV=new T.Vector3(hq[0],hq[1],hq[2]);
    var routes=OFFICES.slice(1).map(function(o){return [o[0],o[1],0xFF6A70,0.30];})
      .concat(DELIVERED.map(function(d){return [d[0],d[1],0x9FB4D8,0.22];}));
    travPts=new Float32Array(routes.length*3);
    routes.forEach(function(rt){
      var e2=ll(rt[0],rt[1],R*1.008), ev=new T.Vector3(e2[0],e2[1],e2[2]);
      var ang=hqV.angleTo(ev), pts=[];
      for(var k=0;k<=42;k++){ var f=k/42;
        var v=new T.Vector3().copy(hqV).lerp(ev,f).normalize()
          .multiplyScalar(R*(1.008+Math.sin(Math.PI*f)*(0.09+ang*0.085)));
        pts.push(v); }
      var lg=new T.BufferGeometry().setFromPoints(pts);
      g.add(new T.Line(lg,new T.LineBasicMaterial({color:rt[2],transparent:true,opacity:rt[3]})));
      travs.push({pts:pts,ph:Math.random(),sp:0.85+Math.random()*0.6});
    });
    travGeo=new T.BufferGeometry(); travGeo.setAttribute('position',new T.BufferAttribute(travPts,3));
    travMat=new T.PointsMaterial({color:0xFFD9DC,size:3.4,sizeAttenuation:false,transparent:true,opacity:0,depthTest:false});
    g.add(new T.Points(travGeo,travMat));
    /* soft atmosphere halo behind the sphere */
    var haloCv=document.createElement('canvas'); haloCv.width=haloCv.height=128;
    var hx=haloCv.getContext('2d'); var hgr=hx.createRadialGradient(64,64,30,64,64,64);
    hgr.addColorStop(0,'rgba(96,138,226,0)'); hgr.addColorStop(0.7,'rgba(96,138,226,0.16)'); hgr.addColorStop(1,'rgba(96,138,226,0)');
    hx.fillStyle=hgr; hx.fillRect(0,0,128,128);
    var halo=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(haloCv),transparent:true,depthWrite:false}));
    halo.scale.set(R*2.9,R*2.9,1); scene.add(halo);
    /* a tilted graticule orbit: the engineered, out-of-this-world signature */
    var orb=new T.Mesh(new T.TorusGeometry(R*1.24,0.0045,8,140),new T.MeshBasicMaterial({color:0x44557A,transparent:true,opacity:.42}));
    orb.rotation.x=Math.PI/2.3; orb.rotation.y=0.38; g.add(orb);
    var orb2=new T.Mesh(new T.TorusGeometry(R*1.42,0.003,8,140),new T.MeshBasicMaterial({color:0x33415E,transparent:true,opacity:.28}));
    orb2.rotation.x=Math.PI/2.05; orb2.rotation.y=-0.3; g.add(orb2);
    prV=new T.Vector3();
    OFFICES.forEach(function(o){ var d=document.createElement('div'); d.className='fp-tag';
      d.innerHTML='<i>'+(o[3]||'')+'</i>'+o[2];
      host.appendChild(d); tagEls.push(d); var p=ll(o[0],o[1],R*1.02); tagVs.push(new T.Vector3(p[0],p[1],p[2])); });
    rotY=rotYt=-Math.PI/2-101*Math.PI/180; /* open on Malaysia */
    g.rotation.x=rotX; g.rotation.y=rotY;
    canvas.addEventListener('pointerdown',function(e){ dragging=true; lx=e.clientX; ly=e.clientY;
      try{canvas.setPointerCapture(e.pointerId);}catch(_){}} );
    onWin('pointermove',function(e){ if(!dragging) return;
      rotYt+=(e.clientX-lx)*0.005; rotXt+=(e.clientY-ly)*0.004; lx=e.clientX; ly=e.clientY;
      if(rotXt>0.9)rotXt=0.9; if(rotXt<-0.6)rotXt=-0.6; },{passive:true});
    onWin('pointerup',function(){dragging=false;});
    onWin('pointercancel',function(){dragging=false;});
    resize(); onWin('resize',resize);
    if(window.ResizeObserver){try{trackRO(new ResizeObserver(resize)).observe(host);}catch(e){}}
    host.classList.add('live');
    renderer.render(scene,camera);
    if(reduce){ intro=1; ofMat.opacity=.95; dlMat.opacity=.8; renderer.render(scene,camera); tags(); return; }
    if(window.IntersectionObserver){ try{ trackIO(new IntersectionObserver(function(es){ visb=es[0].isIntersecting;
      if(visb){ if(!raf) raf=requestAnimationFrame(frame); } else if(raf){ cancelAnimationFrame(raf); raf=null; } })).observe(host);
    }catch(e){ visb=true; raf=requestAnimationFrame(frame);} } else { visb=true; raf=requestAnimationFrame(frame); }
  }
  function tags(){
    var w=host.clientWidth,h=host.clientHeight;
    g.updateMatrixWorld();
    var placed=[];
    for(var i=0;i<tagEls.length;i++){
      var wp=prV.copy(tagVs[i]).applyMatrix4(g.matrixWorld);
      var facing=wp.z>0.25; wp.project(camera);
      var vis=(facing&&wp.z<1&&intro>0.6);
      var tx=(wp.x*0.5+0.5)*w+8, ty=(-wp.y*0.5+0.5)*h-18;
      if(vis){
        var tw=tagEls[i].offsetWidth||90, th=tagEls[i].offsetHeight||18, guard=0;
        /* nudge downward until this tag clears every tag already placed */
        for(var q=0;q<placed.length&&guard<24;q++){
          var pz=placed[q];
          if(Math.abs(tx-pz.x)<Math.max(tw,pz.w)*.82 && Math.abs(ty-pz.y)<th+5){
            ty=pz.y+th+5; q=-1; guard++;
          }
        }
        placed.push({x:tx,y:ty,w:tw});
      }
      tagEls[i].style.transform='translate('+Math.round(tx)+'px,'+Math.round(ty)+'px)';
      tagEls[i].style.opacity=vis?1:0; }
  }
  function frame(ts){ if(dead){raf=null;return;} raf=requestAnimationFrame(frame); if(!visb) return;
    var t=ts||0;
    if(intro<1){ intro=Math.min(1,intro+0.016); var e=intro*intro*(3-2*intro);
      ofMat.opacity=.95*e; dlMat.opacity=.8*e; }
    if(!dragging){ var MYC=-Math.PI/2-101*Math.PI/180; rotYt+=(MYC+Math.sin(t*0.00012)*0.55-rotYt)*0.02; rotXt+=(0.18-rotXt)*0.01; }
    rotY+=(rotYt-rotY)*0.08; rotX+=(rotXt-rotX)*0.08;
    g.rotation.y=rotY; g.rotation.x=rotX;
    ofMat.size=6.0+Math.sin(t*0.003)*0.9; /* office pins breathe */
    if(travGeo){ travMat.opacity=0.9*intro;
      for(var ti=0;ti<travs.length;ti++){ var tr=travs[ti];
        var pp=tr.pts[Math.floor(((t*0.00018*tr.sp+tr.ph)%1)*(tr.pts.length-1))];
        travPts[ti*3]=pp.x; travPts[ti*3+1]=pp.y; travPts[ti*3+2]=pp.z; }
      travGeo.attributes.position.needsUpdate=true; }
    var hotI=Math.floor(t/3200)%tagEls.length;
    for(var hi=0;hi<tagEls.length;hi++) tagEls[hi].classList.toggle('hot',hi===hotI);
    renderer.render(scene,camera); tags(); }
  function resize(){ if(!renderer) return;
    var w=host.clientWidth||600,h=host.clientHeight||420;
    renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();
    camera.position.z=w<640?8.6:6.6;
    renderer.render(scene,camera); }
  try{init(THREE_MOD);}catch(err){}
})();

/* ── closing section: interactive 3D IAQ campus ── */
(function(){
  var host=document.querySelector('.close-stage')||document.querySelector('.close3d'); if(!host) return;
  var canvas=document.getElementById('closeCv'); if(!canvas) return;
  var T,renderer,scene,camera,g,beacons=[],raf=null,visb=false,truck,dust,stars,clouds,starMat,trees=[],folk=[];
  cleanups.push(function(){ if(raf){ cancelAnimationFrame(raf); raf=null; } });
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
    renderer=new T.WebGLRenderer({canvas:canvas,antialias:true,alpha:true}); renderers.push(renderer);
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
      var bcn=new T.Mesh(new T.SphereGeometry(0.05,10,10),new T.MeshBasicMaterial({color:0xFF3B44,transparent:true}));
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
    if(window.ResizeObserver){try{var ro=trackRO(new ResizeObserver(resize));ro.observe(host);ro.observe(canvas);}catch(e){}}
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
    visb=true; raf=requestAnimationFrame(frame);
    /* watchdog: if rAF is being throttled by the embedder, step the scene on a timer */
    trackInterval(setInterval(function(){ if(document.hidden||!visb) return;
      if(performance.now()-lastF>700){ try{ frame(performance.now()); }catch(e){} } },350));
    if(window.IntersectionObserver){ try{ trackIO(new IntersectionObserver(function(es){ visb=es[0].isIntersecting;
      if(visb){ if(!raf) raf=requestAnimationFrame(frame); } else if(raf){ cancelAnimationFrame(raf); raf=null; } },{rootMargin:'200px'})).observe(host);
    }catch(e){ visb=true; if(!raf) raf=requestAnimationFrame(frame);} }
  }
  var lastF=0;
  function frame(ts){ if(dead){raf=null;return;} raf=requestAnimationFrame(frame); lastF=performance.now(); if(!visb)return;
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

/* ── films: cross-fading loops for the hero and story videos ── */
(function(){
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
  function film(id,onWrap){
    var a=document.getElementById(id); if(!a) return;
    var wrap=a.parentElement;
    if(reduce){ a.removeAttribute('autoplay'); try{a.pause();}catch(_){} if(onWrap) wrap.classList.add('on'); return; }
    if(onWrap){ a.addEventListener('canplay',function(){ wrap.classList.add('on'); },{once:true});
      if(a.readyState>=3) wrap.classList.add('on'); }
    var b=a.cloneNode(true); b.removeAttribute('id'); b.muted=true; b.autoplay=false; b.preload='auto';
    a.loop=false; b.loop=false; b.style.opacity='0'; wrap.appendChild(b);
    var F=0.42, act=a, idl=b, on=true, swapping=false;
    a.style.transition='opacity '+F+'s linear'; b.style.transition='opacity '+F+'s linear';
    (function step(){ if(dead)return; requestAnimationFrame(step);
      if(!on||swapping||!act.duration) return;
      if(act.currentTime>act.duration-F){
        swapping=true;
        try{ idl.currentTime=0; var pr=idl.play(); if(pr&&pr.catch)pr.catch(function(){}); }catch(_){}
        idl.style.opacity='1'; act.style.opacity='0';
        setTimeout(function(){ try{act.pause();}catch(_){}
          var t2=act; act=idl; idl=t2; swapping=false; },F*1000+80); } })();
    if(window.IntersectionObserver){ try{ trackIO(new IntersectionObserver(function(es){
      on=es[0].isIntersecting;
      try{ if(on){ act.play(); } else { act.pause(); idl.pause(); } }catch(_){}
    },{threshold:0.05})).observe(wrap); }catch(e){} }
  }
  film('abVid',true); film('manVid',false);
})();

/* ── corporate film placeholder: honest denial ── */
(function(){
  var f=document.getElementById('filmPh'); if(!f) return;
  var t=null;
  function deny(){ f.classList.add('denied'); clearTimeout(t); t=setTimeout(function(){ f.classList.remove('denied'); },2600); }
  f.addEventListener('click',deny);
  f.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); deny(); } });
})();

/* ── leadership: live character studies ── */
(function(){
  var cvs=document.querySelectorAll('.ldCv'); if(!cvs.length) return;
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
  function init(T){
    if(T.ColorManagement) T.ColorManagement.enabled=false;
    var SPRL=Math.min(window.devicePixelRatio||1,1.5), SHWL=980, SHHL=760;
    var SHL=new T.WebGLRenderer({antialias:true,alpha:true}); renderers.push(SHL);
    SHL.setPixelRatio(SPRL); SHL.setSize(SHWL,SHHL,false); SHL.setClearColor(0x000000,0); SHL.setScissorTest(true);
    function cap(r,len,color,rough){ var geo=T.CapsuleGeometry?new T.CapsuleGeometry(r,len,6,14):new T.CylinderGeometry(r,r,len+2*r,14);
      return new T.Mesh(geo,new T.MeshStandardMaterial({color:color,roughness:rough||.6,metalness:.05})); }
    function person(suit,skin,hgt){
      var P=new T.Group(), sc=hgt||1;
      function bx(w,h,d,color,rough){ return new T.Mesh(new T.BoxGeometry(w,h,d),
        new T.MeshStandardMaterial({color:color,roughness:rough||.62,metalness:.04})); }
      var trouser=0x141F36;
      [-0.1,0.1].forEach(function(x){ var l=bx(0.13,0.5,0.14,trouser); l.position.set(x,0.35,0); P.add(l);
        var f=bx(0.14,0.07,0.22,0x0D1626); f.position.set(x,0.035,0.03); P.add(f); });
      var torso=bx(0.4,0.5,0.22,suit,.55); torso.position.y=0.85; P.add(torso); P.userData.torso=torso;
      var shirt=bx(0.14,0.26,0.02,0xE8EDF5); shirt.position.set(0,0.93,0.115); P.add(shirt);
      var tie=bx(0.06,0.24,0.02,0xC22730); tie.position.set(0,0.88,0.125); P.add(tie);
      var lapL=bx(0.05,0.24,0.02,suit,.5); lapL.position.set(-0.09,0.94,0.117); lapL.rotation.z=0.12; P.add(lapL);
      var lapR=bx(0.05,0.24,0.02,suit,.5); lapR.position.set(0.09,0.94,0.117); lapR.rotation.z=-0.12; P.add(lapR);
      var arms=[];
      [-0.26,0.26].forEach(function(x){ var a=bx(0.11,0.46,0.13,suit,.55);
        a.position.set(x,0.87,0); P.add(a); arms.push(a);
        var hnd=bx(0.09,0.09,0.09,skin); hnd.position.set(x,0.6,0); P.add(hnd); });
      P.userData.arms=arms;
      var head=bx(0.26,0.26,0.26,skin,.55); head.position.y=1.26; P.add(head); P.userData.head=head;
      var hair=bx(0.27,0.09,0.27,0x161A24,.8); hair.position.set(0,1.41,0); P.add(hair);
      var hair2=bx(0.27,0.1,0.06,0x161A24,.8); hair2.position.set(0,1.34,-0.11); P.add(hair2);
      P.scale.set(sc,sc,sc); return P; }
    cvs.forEach(function(cv,ci){
      var role=cv.getAttribute('data-role');
      var ctx2L=cv.getContext('2d'); if(!ctx2L) return;
      var scene=new T.Scene(), camera=new T.PerspectiveCamera(30,1,0.1,50);
      scene.add(new T.HemisphereLight(0xEAF2FF,0x0C1220,0.95));
      var key=new T.DirectionalLight(0xFFF4E6,1.25); key.position.set(2.5,3.5,4); scene.add(key);
      var rim=new T.PointLight(0xFF4D55,0.85,10); rim.position.set(-2.2,1.6,-1.8); scene.add(rim);
      var g=new T.Group(); scene.add(g);
      var floor=new T.Mesh(new T.CylinderGeometry(1.5,1.5,0.06,40),
        new T.MeshStandardMaterial({color:0x111A2E,roughness:.85}));
      floor.position.y=-0.03; g.add(floor);
      var ringF=new T.Mesh(new T.TorusGeometry(1.32,0.008,8,80),new T.MeshBasicMaterial({color:0xC22730,transparent:true,opacity:.5}));
      ringF.rotation.x=Math.PI/2; ringF.position.y=0.012; g.add(ringF);
      var people=[];
      function addP(suit,skin,x,h,ry){ var pr=person(suit,skin,h); pr.position.x=x; pr.rotation.y=ry||0; g.add(pr); people.push(pr); }
      if(role==='founder'){ addP(0x25344F,0xD9B99B,0,1.04,0); camera.position.set(0,1.15,4.1); }
      else if(role==='ceo'){ addP(0x1B2B45,0xC99B7C,0,1.02,0); camera.position.set(0,1.15,4.1); }
      else if(role==='board'){ addP(0x22324E,0xD9B99B,-0.78,1.0,0.24); addP(0x1B2B45,0xB98A66,0,1.05,0); addP(0x2A3A57,0xE3C6A8,0.78,0.97,-0.24);
        camera.position.set(0,1.2,4.9); }
      else { addP(0x1E2E49,0xC99B7C,-0.45,1.0,0.16); addP(0x26364F,0xE3C6A8,0.45,1.02,-0.16);
        camera.position.set(0,1.18,4.5); }
      camera.lookAt(0,0.95,0);
      function drawTo(){ var r=cv.getBoundingClientRect();
        var w=Math.min(SHWL,Math.max(2,Math.round(r.width)||300)), h=Math.min(SHHL,Math.max(2,Math.round(r.height)||260));
        var bw=Math.round(w*SPRL), bh=Math.round(h*SPRL);
        if(cv.width!==bw||cv.height!==bh){ cv.width=bw; cv.height=bh; }
        camera.aspect=w/h; camera.updateProjectionMatrix();
        SHL.setViewport(0,SHHL-h,w,h); SHL.setScissor(0,SHHL-h,w,h);
        SHL.render(scene,camera);
        ctx2L.clearRect(0,0,bw,bh);
        ctx2L.drawImage(SHL.domElement,0,0,bw,bh,0,0,bw,bh); }
      drawTo();
      if(reduce){ return; }
      var visb=false,raf=null;
      cleanups.push(function(){ if(raf){ cancelAnimationFrame(raf); raf=null; } });
      function frame(ts){ if(dead){raf=null;return;} raf=requestAnimationFrame(frame); if(!visb) return;
        var t=ts||0;
        g.rotation.y=Math.sin(t*0.00028+ci)*0.3;
        for(var i=0;i<people.length;i++){ var pp=people[i];
          var br=1+0.014*Math.sin(t*0.0016+i*1.7);
          pp.userData.torso.scale.set(1,br,1);
          pp.userData.head.rotation.y=0.14*Math.sin(t*0.0005+i*2.1);
          if(pp.userData.arms) for(var ar=0;ar<2;ar++) pp.userData.arms[ar].rotation.x=0.06*Math.sin(t*0.0016+i*1.7+ar*Math.PI);
          pp.position.y=0.008*Math.sin(t*0.0016+i*1.7); }
        ringF.material.opacity=0.35+0.2*Math.sin(t*0.002);
        drawTo(); }
      if(window.IntersectionObserver){ try{ trackIO(new IntersectionObserver(function(es){ visb=es[0].isIntersecting;
        if(visb){ if(!raf) raf=requestAnimationFrame(frame); } else if(raf){ cancelAnimationFrame(raf); raf=null; } })).observe(cv);
      }catch(e){ visb=true; raf=requestAnimationFrame(frame);} } else { visb=true; raf=requestAnimationFrame(frame); }
    });
  }
  try{init(THREE_MOD);}catch(err){}
})();

/* ── living diagrams: 2D canvas loops for pillars, stations and film backdrop ── */
(function(){
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
  var items=[];
  function reg(cv,draw){ if(!cv) return;
    var dpr=Math.min(window.devicePixelRatio||1,2), st={cv:cv,cx:cv.getContext('2d'),draw:draw,vis:false,dpr:dpr};
    function size(){ var r=cv.getBoundingClientRect(); cv.width=Math.max(60,r.width*dpr); cv.height=Math.max(40,r.height*dpr); }
    size(); if(window.ResizeObserver){try{trackRO(new ResizeObserver(size)).observe(cv);}catch(e){}}
    if(window.IntersectionObserver){ try{ trackIO(new IntersectionObserver(function(es){st.vis=es[0].isIntersecting;})).observe(cv);}catch(e){st.vis=true;} } else st.vis=true;
    items.push(st); }
  function loop(ts){ if(dead)return; requestAnimationFrame(loop);
    for(var i=0;i<items.length;i++){ var it=items[i]; if(!it.vis) continue;
      var c=it.cx,W=it.cv.width/it.dpr,H=it.cv.height/it.dpr;
      c.setTransform(it.dpr,0,0,it.dpr,0,0); c.clearRect(0,0,W,H);
      c.lineCap='round'; c.lineJoin='round';
      it.draw(c,W,H,ts||0); } }
  /* pillar 01 EPC: an isometric block assembly, endlessly topping out */
  function iso(c,x,y,s,h,f1,f2,f3){ c.beginPath(); c.moveTo(x,y); c.lineTo(x+s,y-s*0.5); c.lineTo(x+2*s,y); c.lineTo(x+s,y+s*0.5); c.closePath(); c.fillStyle=f1; c.fill();
    c.beginPath(); c.moveTo(x,y); c.lineTo(x,y+h); c.lineTo(x+s,y+h+s*0.5); c.lineTo(x+s,y+s*0.5); c.closePath(); c.fillStyle=f2; c.fill();
    c.beginPath(); c.moveTo(x+s,y+s*0.5); c.lineTo(x+s,y+h+s*0.5); c.lineTo(x+2*s,y+h); c.lineTo(x+2*s,y); c.closePath(); c.fillStyle=f3; c.fill(); }
  function drawEPC(c,W,H,t){ var cx=W/2-30,cy=H*0.52,s=15;
    var order=[[0,0],[1,0],[0,1],[1,1],[0.5,0.5]];
    for(var i=0;i<order.length;i++){ var ph=((t*0.00035)-i*0.22)%2; if(ph<0)ph+=2;
      var up=Math.min(1,Math.max(0,ph)); if(ph>1.55) up=Math.max(0,1-(ph-1.55)*2.2);
      if(up<=0.01) continue;
      var lift=(1-up)*26, lvl=i===4?1:0;
      iso(c,cx+ (order[i][0]-order[i][1])*s, cy+(order[i][0]+order[i][1])*s*0.5 - lvl*16 - lift, s,12,
        i===4?'#F3B7BA':'#E2E9F3', i===4?'#D9868C':'#B9C6D8', i===4?'#C4565e':'#9DACC2');
      c.globalAlpha=up; c.globalAlpha=1; }
    c.strokeStyle='rgba(236,32,39,.8)'; c.lineWidth=1.4;
    c.strokeRect(cx-16,cy-34,4,50);
    c.beginPath(); c.moveTo(cx-14,cy-34); c.lineTo(cx+46,cy-34); c.stroke();
    var hx=cx-14+((t*0.02)%60);
    c.beginPath(); c.moveTo(hx,cy-34); c.lineTo(hx,cy-22); c.stroke();
    c.fillStyle='#EC2027'; c.fillRect(hx-3,cy-22,6,5); }
  /* pillar 02 UTILITIES: pipe route with running flow */
  function drawUTIL(c,W,H,t){ var y=H*0.5;
    var pts=[[16,y+18],[W*0.3,y+18],[W*0.3,y-14],[W*0.62,y-14],[W*0.62,y+12],[W-18,y+12]];
    c.strokeStyle='rgba(30,42,64,.5)'; c.lineWidth=6; c.beginPath();
    pts.forEach(function(pt,i){ i?c.lineTo(pt[0],pt[1]):c.moveTo(pt[0],pt[1]); }); c.stroke();
    c.strokeStyle='#EC2027'; c.lineWidth=2.2; c.setLineDash([9,8]); c.lineDashOffset=-(t*0.03)%17;
    c.beginPath(); pts.forEach(function(pt,i){ i?c.lineTo(pt[0],pt[1]):c.moveTo(pt[0],pt[1]); }); c.stroke(); c.setLineDash([]);
    [[W*0.3,y+2],[W*0.62,y-1]].forEach(function(v,i){ c.beginPath(); c.arc(v[0],v[1],5.5,0,7);
      c.fillStyle='#FFFFFF'; c.fill(); c.strokeStyle='#1E2A40'; c.lineWidth=1.6; c.stroke();
      c.save(); c.translate(v[0],v[1]); c.rotate(t*0.0025*(i?-1:1));
      c.beginPath(); c.moveTo(-4,0); c.lineTo(4,0); c.stroke(); c.restore(); });
    var pu=1+0.08*Math.sin(t*0.005);
    c.fillStyle='rgba(236,32,39,.14)'; c.fillRect(8,y+10,16*pu,16*pu);
    c.strokeStyle='#EC2027'; c.lineWidth=1.6; c.strokeRect(8,y+10,16*pu,16*pu); }
  /* pillar 03 ENERGY: cooling waves + efficiency line settling */
  function drawENERGY(c,W,H,t){
    for(var w=0;w<3;w++){ c.beginPath();
      for(var x=0;x<=W-30;x+=4){ var yy=H*0.36+w*10+Math.sin(x*0.06+t*0.0024+w*1.6)*5;
        x?c.lineTo(15+x,yy):c.moveTo(15+x,yy); }
      c.strokeStyle='rgba(46,111,232,'+(0.5-w*0.13)+')'; c.lineWidth=1.6; c.stroke(); }
    var ph=(t*0.0004)%1.6, k=Math.min(1,ph/1);
    c.beginPath();
    for(var x2=0;x2<=(W-34)*k;x2+=4){ var f=x2/(W-34);
      var yv=H*0.82-f*H*0.3-Math.exp(-f*3.2)*Math.sin(f*22)*7;
      x2?c.lineTo(17+x2,yv):c.moveTo(17+x2,yv); }
    c.strokeStyle='#EC2027'; c.lineWidth=2; c.stroke();
    c.fillStyle='rgba(12,18,32,.55)'; c.font='700 8px "JetBrains Mono",monospace';
    c.fillText('KW / M²',15,H*0.9+6); }
  /* stations 01..05 */
  var SC={1:'#E8730C',2:'#2E6FE8',3:'#EC2027',4:'#1FB9A6',5:'#1FA463'};
  function drawS1(c,W,H,t){ var col=SC[1], m=14, ph=(t*0.00035)%1.4, k=Math.min(1,ph/1);
    c.strokeStyle=col; c.lineWidth=1.6; c.globalAlpha=.9;
    var per=2*((W-2*m)+ (H-24)), draw=per*k;
    c.setLineDash([per,per]); c.lineDashOffset=per-draw;
    c.strokeRect(m,12,W-2*m,H-24); c.setLineDash([]);
    if(k>0.4){ c.globalAlpha=(k-0.4)/0.6;
      c.beginPath(); c.moveTo(m,H*0.55); c.lineTo(m+(W-2*m)*0.42,H*0.55); c.lineTo(m+(W-2*m)*0.42,H-12); c.stroke();
      c.beginPath(); c.moveTo(W*0.6,12); c.lineTo(W*0.6,H*0.42); c.arc(W*0.6+11,H*0.42,11,Math.PI,Math.PI/2,true); c.stroke(); }
    c.globalAlpha=.75; var cxx=m+((t*0.014)%(W-2*m));
    c.beginPath(); c.moveTo(cxx,8); c.lineTo(cxx,H-8); c.strokeStyle=col; c.lineWidth=0.7; c.stroke(); c.globalAlpha=1; }
  function drawS2(c,W,H,t){ var col=SC[2]; var y=H*0.62;
    c.strokeStyle='rgba(30,42,64,.4)'; c.lineWidth=1.4; c.beginPath(); c.moveTo(12,y); c.lineTo(W-12,y); c.stroke();
    c.strokeStyle=col; c.lineWidth=1.6;
    c.strokeRect(W-34,y-22,22,22);
    c.beginPath(); c.moveTo(W-34,y-11); c.lineTo(W-12,y-11); c.stroke();
    var ph=(t*0.0004)%1.3, k=Math.min(1,ph);
    var bx=12+(W-58)*k;
    c.fillStyle='rgba(46,111,232,.15)'; c.fillRect(bx,y-16,16,16);
    c.strokeRect(bx,y-16,16,16);
    c.beginPath(); c.moveTo(bx+3,y-8); c.lineTo(bx+13,y-8); c.stroke();
    if(k>=1||ph>1){ c.beginPath(); c.moveTo(W-30,y-13); c.lineTo(W-26,y-9); c.lineTo(W-18,y-19); c.stroke(); } }
  function drawS3(c,W,H,t){ var col=SC[3];
    c.strokeStyle=col; c.lineWidth=1.8;
    c.beginPath(); c.moveTo(20,H-8); c.lineTo(20,12); c.moveTo(14,12); c.lineTo(26,12); c.stroke();
    c.beginPath(); c.moveTo(20,16); c.lineTo(W-24,16); c.stroke();
    var ph=(t*0.00045)%2, drop=ph<1?ph:1, rise=ph>1?(ph-1):0;
    var hy=16+drop*(H-46)-rise*(H-46);
    var hx2=W*0.62;
    c.lineWidth=1; c.beginPath(); c.moveTo(hx2,16); c.lineTo(hx2,hy); c.stroke();
    c.lineWidth=1.8; c.strokeRect(hx2-9,hy,18,8);
    c.strokeStyle='rgba(30,42,64,.55)';
    for(var b=0;b<3;b++) c.strokeRect(W*0.35,H-14-b*9,26,8);
    c.strokeStyle=col; c.beginPath(); c.moveTo(10,H-6); c.lineTo(W-10,H-6); c.stroke(); }
  function drawS4(c,W,H,t){ var col=SC[4], cx2=W/2, cy2=H*0.86, R=H*0.62;
    c.strokeStyle='rgba(30,42,64,.4)'; c.lineWidth=2;
    c.beginPath(); c.arc(cx2,cy2,R,Math.PI,0); c.stroke();
    var ph=(t*0.0005)%2.2, k=ph<1?ph*ph*(3-2*ph):(ph<1.7?1:Math.max(0,1-(ph-1.7)*2));
    var target=Math.PI*(1-0.82*k);
    c.strokeStyle=col; c.beginPath(); c.arc(cx2,cy2,R,Math.PI,Math.PI+ (Math.PI*0.82*k)); c.stroke();
    for(var tk=0;tk<=8;tk++){ var an=Math.PI+tk/8*Math.PI, lit=an<=Math.PI+Math.PI*0.82*k;
      c.strokeStyle=lit?col:'rgba(30,42,64,.35)'; c.lineWidth=1.4;
      c.beginPath(); c.moveTo(cx2+Math.cos(an)*(R-4),cy2+Math.sin(an)*(R-4));
      c.lineTo(cx2+Math.cos(an)*(R+3),cy2+Math.sin(an)*(R+3)); c.stroke(); }
    var na=Math.PI+Math.PI*0.82*k;
    c.strokeStyle=col; c.lineWidth=2;
    c.beginPath(); c.moveTo(cx2,cy2); c.lineTo(cx2+Math.cos(na)*(R-9),cy2+Math.sin(na)*(R-9)); c.stroke();
    c.beginPath(); c.arc(cx2,cy2,2.6,0,7); c.fillStyle=col; c.fill(); }
  function drawS5(c,W,H,t){ var col=SC[5], cx3=W/2, cy3=H/2, R2=H*0.34;
    c.strokeStyle=col; c.lineWidth=1.8;
    for(var half=0;half<2;half++){ c.save(); c.translate(cx3,cy3); c.rotate(t*0.0016+half*Math.PI);
      c.beginPath(); c.arc(0,0,R2,0,Math.PI*0.78); c.stroke();
      var ea=Math.PI*0.78, tx=Math.cos(ea)*R2, ty=Math.sin(ea)*R2, tang=ea+Math.PI/2;
      c.beginPath();
      c.moveTo(tx+Math.cos(tang-2.6)*7,ty+Math.sin(tang-2.6)*7);
      c.lineTo(tx,ty);
      c.lineTo(tx+Math.cos(tang+2.6)*7,ty+Math.sin(tang+2.6)*7);
      c.stroke(); c.restore(); }
    var hb=(t*0.0022)%(Math.PI*2);
    c.beginPath();
    for(var x3=0;x3<=W-24;x3+=3){ var f2=x3/(W-24), yb=cy3;
      var d=Math.abs(f2-((t*0.00022)%1));
      if(d<0.08) yb=cy3-Math.sin((0.08-d)/0.08*Math.PI)*9;
      x3?c.lineTo(12+x3,yb):c.moveTo(12+x3,yb); }
    c.strokeStyle='rgba(31,164,99,.5)'; c.lineWidth=1.2; c.stroke(); }
  /* film backdrop: drone wireframe of the campus, scan sweep, beacon blips */
  function drawFILM(c,W,H,t){
    function isoW(x,y,w2,d2,h2,al){ c.strokeStyle='rgba(143,160,190,'+al+')'; c.lineWidth=1;
      var p=[[x,y],[x+w2,y-w2*0.5],[x+w2+d2,y-w2*0.5+d2*0.5],[x+d2,y+d2*0.5]];
      c.beginPath(); c.moveTo(p[0][0],p[0][1]); for(var i2=1;i2<4;i2++)c.lineTo(p[i2][0],p[i2][1]); c.closePath(); c.stroke();
      c.beginPath();
      for(var i3=0;i3<4;i3++){ c.moveTo(p[i3][0],p[i3][1]); c.lineTo(p[i3][0],p[i3][1]+h2); }
      c.stroke();
      c.beginPath(); c.moveTo(p[0][0],p[0][1]+h2); c.lineTo(p[1][0],p[1][1]+h2); c.lineTo(p[2][0],p[2][1]+h2); c.lineTo(p[3][0],p[3][1]+h2); c.closePath(); c.stroke(); }
    var breathe=0.10+0.05*Math.sin(t*0.0008);
    isoW(W*0.12,H*0.42,90,150,64,breathe);
    isoW(W*0.62,H*0.34,70,110,110,breathe*0.9);
    isoW(W*0.42,H*0.62,52,80,40,breathe*0.8);
    [[W*0.19,H*0.30],[W*0.72,H*0.18]].forEach(function(u,i4){
      var bk=Math.pow(Math.max(0,Math.sin(t*0.0024+i4*2.1)),14);
      c.beginPath(); c.arc(u[0],u[1],2.4+bk*1.6,0,7);
      c.fillStyle='rgba(255,77,85,'+(0.25+0.75*bk)+')'; c.fill(); });
    var sx=((t*0.03)%(W*1.6))-W*0.3;
    var gr2=c.createLinearGradient(sx-70,0,sx+70,0);
    gr2.addColorStop(0,'rgba(143,160,190,0)'); gr2.addColorStop(0.5,'rgba(143,160,190,0.05)'); gr2.addColorStop(1,'rgba(143,160,190,0)');
    c.fillStyle=gr2; c.fillRect(sx-70,0,140,H); }
  reg(document.getElementById('filmBgCv'),drawFILM);
  reg(document.querySelector('.pdCv[data-step="1"]'),drawS1);
  reg(document.querySelector('.pdCv[data-step="2"]'),drawS2);
  reg(document.querySelector('.pdCv[data-step="3"]'),drawS3);
  reg(document.querySelector('.pdCv[data-step="4"]'),drawS4);
  reg(document.querySelector('.pdCv[data-step="5"]'),drawS5);
  if(reduce){ requestAnimationFrame(function(ts){ items.forEach(function(it){it.vis=true;});
    var c;for(var i=0;i<items.length;i++){ var it=items[i]; c=it.cx;
      c.setTransform(it.dpr,0,0,it.dpr,0,0); it.draw(c,it.cv.width/it.dpr,it.cv.height/it.dpr,900); } }); }
  else requestAnimationFrame(loop);
})();

/* ── hero particles ── */
(function(){
  var cv=document.getElementById('abPart'); if(!cv) return;
  if(window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  var cx=cv.getContext('2d'); if(!cx) return;
  var dpr=Math.min(window.devicePixelRatio||1,2),W=0,H=0,ps=[],visb=false,raf=null;
  cleanups.push(function(){ if(raf){ cancelAnimationFrame(raf); raf=null; } });
  function size(){ var r=cv.getBoundingClientRect(); W=r.width; H=r.height;
    cv.width=W*dpr; cv.height=H*dpr; cx.setTransform(dpr,0,0,dpr,0,0); }
  size(); onWin('resize',size);
  for(var i=0;i<64;i++) ps.push({x:Math.random(),y:Math.random(),z:0.3+Math.random()*0.7,
    ph:Math.random()*6.28, red:i%9===0});
  function frame(ts){ if(dead){raf=null;return;} raf=requestAnimationFrame(frame); if(!visb) return;
    var t=ts||0; cx.clearRect(0,0,W,H);
    for(var i=0;i<ps.length;i++){ var pp=ps[i];
      var x=(pp.x+t*0.0000045*pp.z)%1, y=(pp.y-t*0.0000030*pp.z)%1; if(y<0)y+=1;
      var tw=0.5+0.5*Math.sin(t*0.0012*pp.z+pp.ph);
      var a=(pp.red?0.5:0.34)*tw*pp.z, r=(pp.red?1.7:1.15)*pp.z;
      cx.beginPath(); cx.arc(x*W,y*H,r,0,7);
      cx.fillStyle=pp.red?'rgba(255,90,96,'+a.toFixed(3)+')':'rgba(190,214,255,'+a.toFixed(3)+')';
      cx.fill(); } }
  if(window.IntersectionObserver){ try{ trackIO(new IntersectionObserver(function(es){ visb=es[0].isIntersecting;
    if(visb){ if(!raf) raf=requestAnimationFrame(frame); } else if(raf){ cancelAnimationFrame(raf); raf=null; } })).observe(cv);
  }catch(e){ visb=true; raf=requestAnimationFrame(frame);} } else { visb=true; raf=requestAnimationFrame(frame); }
})();

/* ── values lines: tile icons tethered to their pillars ── */
(function(){
  var svg=document.getElementById('vLines'), grid=document.getElementById('vGrid');
  if(!svg||!grid) return;
  var NS='http://www.w3.org/2000/svg', gs=[], icons=[];
  document.querySelectorAll('.vtile[data-vi]').forEach(function(t){
    var vi=parseInt(t.getAttribute('data-vi'),10);
    icons[vi]={el:t.querySelector('.vico'),left:t.classList.contains('vt-l')};
    var gg=document.createElementNS(NS,'g');
    var p=document.createElementNS(NS,'path'); p.setAttribute('class','vpath'); gg.appendChild(p);
    var c1=document.createElementNS(NS,'circle'); c1.setAttribute('class','vanchor'); c1.setAttribute('r',3.2); gg.appendChild(c1);
    var c2=document.createElementNS(NS,'circle'); c2.setAttribute('class','vtip'); c2.setAttribute('r',2.6); gg.appendChild(c2);
    svg.appendChild(gg); gs[vi]={p:p,c1:c1,c2:c2}; });
  window.__valTrack=function(pts){
    if(getComputedStyle(svg).display==='none') return;
    var gr=grid.getBoundingClientRect();
    for(var i=0;i<6;i++){ var ic=icons[i], G=gs[i]; if(!ic||!G||!pts[i]) continue;
      var r=ic.el.getBoundingClientRect();
      var ax=(ic.left?r.right+10:r.left-10)-gr.left, ay=r.top-gr.top+r.height/2;
      var ex=pts[i].x-gr.left, ey=pts[i].y-gr.top;
      var mx=ax+(ex-ax)*0.5, h=pts[i].h;
      G.p.setAttribute('d','M'+ax.toFixed(1)+' '+ay.toFixed(1)+' C '+mx.toFixed(1)+' '+ay.toFixed(1)+', '+mx.toFixed(1)+' '+ey.toFixed(1)+', '+ex.toFixed(1)+' '+ey.toFixed(1));
      G.p.style.stroke=h>0.3?'rgba(236,32,39,'+(0.3+0.55*h).toFixed(2)+')':'rgba(12,18,32,.14)';
      G.p.style.strokeWidth=(1.1+0.9*h).toFixed(2);
      G.c1.setAttribute('cx',ax.toFixed(1)); G.c1.setAttribute('cy',ay.toFixed(1));
      G.c2.setAttribute('cx',ex.toFixed(1)); G.c2.setAttribute('cy',ey.toFixed(1));
      G.c2.style.opacity=(0.25+0.75*h).toFixed(2);
      G.c2.style.fill=h>0.3?'#EC2027':'#9AA6BB'; } };
})();

  return function cleanup(){
    dead=true;
    for(var i=0;i<cleanups.length;i++){ try{ cleanups[i](); }catch(e){} }
    for(var r=0;r<renderers.length;r++){ try{ renderers[r].dispose(); renderers[r].forceContextLoss(); }catch(e){} }
    try{ ScrollTrigger.getAll().forEach(function(t){ t.kill(); }); }catch(e){}
    ['__vHover','__vSetLock','__vCanvasHover','__vTurning','__valTrack'].forEach(function(k){ try{ delete window[k]; }catch(e){} });
  };
}
