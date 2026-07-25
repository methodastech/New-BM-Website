/* RubexPay — boot-loader VOXEL-PROGRESS cube (raw WebGL/GLSL, zero dependencies).
   The cube IS the loading meter: 27 slots sit as a faint empty lattice, and one solid red-glass
   voxel drops into place per ~3.7% of real boot progress (window.__rbxBootP), filling from one
   corner diagonally across. At 100% every slot is filled — the cube is whole — a white-hot core
   ignites and the edges blaze. Contract preserved:
     - reads window.__rbxBootP (0..1), publishes window.__rbxPd, dispatches 'rbx-heart' at pd>=0.72,
     - draws into .pl-gl, adds .gl-on to .pl-cube, retries a refused context, refits, frees GL after.
   Falls back silently to the SVG mark if WebGL is unavailable or reduced-motion is set. */
(function(){
  var pre = document.getElementById('pre'); if(!pre) return;
  if(pre.style.display === 'none') return;
  if(window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  var cv = pre.querySelector('.pl-gl'); if(!cv) return;
  var tries = 0;
  (function boot(){
  var gl = null;
  try{ gl = cv.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false}) || cv.getContext('experimental-webgl'); }catch(e){}
  if(!gl){ if(++tries < 12 && pre.style.display !== 'none') setTimeout(boot, 220); return; }
  var box = pre.querySelector('.pl-cube'); if(box) box.classList.add('gl-on');

  var dpr = Math.min(Math.max(devicePixelRatio||1, 2), 3), asp = 1;   /* force >=2x: the loader canvas is tiny, keep it crisp (not pixelated) */
  function resize(){ var r=cv.getBoundingClientRect(); var w=Math.max(2,r.width|0),h=Math.max(2,r.height|0); cv.width=w*dpr; cv.height=h*dpr; gl.viewport(0,0,cv.width,cv.height); asp=w/h; }
  resize(); window.addEventListener('resize',resize);

  function comp(t,src){ var s=gl.createShader(t); gl.shaderSource(s,src); gl.compileShader(s); return s; }
  function link(vs,fs){ var p=gl.createProgram(); gl.attachShader(p,comp(gl.VERTEX_SHADER,vs)); gl.attachShader(p,comp(gl.FRAGMENT_SHADER,fs)); gl.linkProgram(p); return p; }

  var faceP=link(
    'attribute vec3 aPos;attribute vec3 aNor;uniform mat4 uMVP;uniform mat4 uModel;uniform vec3 uCam;varying float vF;void main(){vec3 wp=(uModel*vec4(aPos,1.0)).xyz;vec3 N=normalize((uModel*vec4(aNor,0.0)).xyz);vec3 V=normalize(uCam-wp);vF=pow(1.0-clamp(dot(N,V),0.0,1.0),1.8);gl_Position=uMVP*vec4(aPos,1.0);}',
    'precision highp float;varying float vF;uniform float uA;uniform vec3 uTint;void main(){vec3 deep=vec3(0.42,0.02,0.06)*uTint;vec3 hot=vec3(1.0,0.42,0.48)*uTint;vec3 col=mix(deep,hot,vF)*(0.9+vF*0.95);float a=(0.30+vF*0.74)*uA;gl_FragColor=vec4(col,a);}'
  );
  var edgeP=link(
    'attribute vec3 aPos;uniform mat4 uMVP;void main(){gl_Position=uMVP*vec4(aPos,1.0);}',
    'precision highp float;uniform float uA;uniform vec3 uC;void main(){gl_FragColor=vec4(uC,uA);}'
  );

  var s=1.0;
  var C=[[-s,-s,-s],[s,-s,-s],[s,s,-s],[-s,s,-s],[-s,-s,s],[s,-s,s],[s,s,s],[-s,s,s]];
  var faces=[[1,2,6,5,1,0,0],[0,3,7,4,-1,0,0],[3,2,6,7,0,1,0],[0,1,5,4,0,-1,0],[4,5,6,7,0,0,1],[0,1,2,3,0,0,-1]];
  var fp=[],fi=[],vc=0;
  faces.forEach(function(f){ var n=[f[4],f[5],f[6]]; for(var k=0;k<4;k++){ var c=C[f[k]]; fp.push(c[0],c[1],c[2],n[0],n[1],n[2]); } fi.push(vc,vc+1,vc+2,vc,vc+2,vc+3); vc+=4; });
  var EP=[0,1,1,2,2,3,3,0,4,5,5,6,6,7,7,4,0,4,1,5,2,6,3,7], ep=[];
  for(var i=0;i<EP.length;i++){ var cc=C[EP[i]]; ep.push(cc[0],cc[1],cc[2]); }

  function buf(data,tp){ var b=gl.createBuffer(); tp=tp||gl.ARRAY_BUFFER; gl.bindBuffer(tp,b); gl.bufferData(tp,data,gl.STATIC_DRAW); return b; }
  var fpB=buf(new Float32Array(fp)), fiB=buf(new Uint16Array(fi),gl.ELEMENT_ARRAY_BUFFER), epB=buf(new Float32Array(ep));
  var fA={pos:gl.getAttribLocation(faceP,'aPos'),nor:gl.getAttribLocation(faceP,'aNor'),mvp:gl.getUniformLocation(faceP,'uMVP'),mdl:gl.getUniformLocation(faceP,'uModel'),cam:gl.getUniformLocation(faceP,'uCam'),a:gl.getUniformLocation(faceP,'uA'),tint:gl.getUniformLocation(faceP,'uTint')};
  var eA={pos:gl.getAttribLocation(edgeP,'aPos'),mvp:gl.getUniformLocation(edgeP,'uMVP'),a:gl.getUniformLocation(edgeP,'uA'),c:gl.getUniformLocation(edgeP,'uC')};

  function ident(){var o=new Float32Array(16);o[0]=o[5]=o[10]=o[15]=1;return o;}
  function mul(a,b){var o=new Float32Array(16);for(var c=0;c<4;c++)for(var r=0;r<4;r++){o[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];}return o;}
  function persp(fy,as,n,f){var t=1/Math.tan(fy/2),o=new Float32Array(16);o[0]=t/as;o[5]=t;o[10]=(f+n)/(n-f);o[11]=-1;o[14]=2*f*n/(n-f);return o;}
  function rotY(a){var c=Math.cos(a),sn=Math.sin(a),o=ident();o[0]=c;o[2]=-sn;o[8]=sn;o[10]=c;return o;}
  function rotX(a){var c=Math.cos(a),sn=Math.sin(a),o=ident();o[5]=c;o[9]=-sn;o[6]=sn;o[10]=c;return o;}
  function rotZ(a){var c=Math.cos(a),sn=Math.sin(a),o=ident();o[0]=c;o[1]=sn;o[4]=-sn;o[5]=c;return o;}
  function scl(v){var o=ident();o[0]=o[5]=o[10]=v;return o;}
  function trn(x,y,z){var o=ident();o[12]=x;o[13]=y;o[14]=z;return o;}
  function smooth(x){ x=x<0?0:(x>1?1:x); return x*x*(3-2*x); }

  /* 27 slots. Fill order = CENTRE OUTWARD (shell by shell) so the partially-built cube is always
     balanced around the middle instead of leaning to one corner; each voxel gets a short drop-in
     offset + tumble as it seats. */
  var CELL=0.58, HALF=0.26, N=27, SPAN=1.7/27, vox=[];   /* SPAN = how much progress one voxel takes to seat */
  for(var gx=-1;gx<=1;gx++)for(var gy=-1;gy<=1;gy++)for(var gz=-1;gz<=1;gz++){
    var off=[ (Math.random()-0.5), 0.5+Math.random()*0.5, (Math.random()-0.5) ];   /* drops mostly from above */
    var ol=Math.sqrt(off[0]*off[0]+off[1]*off[1]+off[2]*off[2])||1, mag=0.7+Math.random()*0.5;
    vox.push({ gp:[gx*CELL,gy*CELL,gz*CELL],
               off:[off[0]/ol*mag, off[1]/ol*mag, off[2]/ol*mag],
               sr:[Math.random()*3.1,Math.random()*3.1,Math.random()*3.1],
               key:(gx*gx+gy*gy+gz*gz)*10 + Math.random()*0.9 });   /* centre-out, always symmetric */
  }
  vox.sort(function(a,b){ return a.key-b.key; });
  /* thresholds are spread across [0, 1-SPAN] so the LAST voxel finishes seating exactly at 100%
     (thr=i/N left it ~63% seated at pd=1, which is why the build looked unfinished). */
  for(var i=0;i<vox.length;i++) vox[i].thr=(i/(N-1))*(1-SPAN);

  gl.clearColor(0,0,0,0);
  var t0=performance.now(), stop=false, pd=0, proj=null;
  var camZ=3.0, PAD=0.62;   /* bigger cube */
  var view=ident(); view[14]=-camZ;

  function dF(m,a,ti){ if(a<=0.003)return; var mvp=mul(proj,mul(view,m)); gl.useProgram(faceP); gl.bindBuffer(gl.ARRAY_BUFFER,fpB); gl.enableVertexAttribArray(fA.pos); gl.vertexAttribPointer(fA.pos,3,gl.FLOAT,false,24,0); gl.enableVertexAttribArray(fA.nor); gl.vertexAttribPointer(fA.nor,3,gl.FLOAT,false,24,12); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,fiB); gl.uniformMatrix4fv(fA.mvp,false,mvp); gl.uniformMatrix4fv(fA.mdl,false,m); gl.uniform3f(fA.cam,0,0,camZ); gl.uniform1f(fA.a,a); gl.uniform3f(fA.tint,ti[0],ti[1],ti[2]); gl.drawElements(gl.TRIANGLES,fi.length,gl.UNSIGNED_SHORT,0); }
  function dE(m,a,co){ if(a<=0.003)return; var mvp=mul(proj,mul(view,m)); gl.useProgram(edgeP); gl.bindBuffer(gl.ARRAY_BUFFER,epB); gl.enableVertexAttribArray(eA.pos); gl.vertexAttribPointer(eA.pos,3,gl.FLOAT,false,0,0); gl.uniformMatrix4fv(eA.mvp,false,mvp); gl.uniform1f(eA.a,a); gl.uniform3f(eA.c,co[0],co[1],co[2]); gl.lineWidth(1.5); gl.drawArrays(gl.LINES,0,ep.length/3); }

  function frame(now){
    if(stop) return;
    if(pre.style.display==='none'){ stop=true; return; }
    var t=(now-t0)/1000;
    var target=(typeof window.__rbxBootP==='number')?window.__rbxBootP:Math.min(t/1.6,1);
    pd += (target-pd)*(window.__rbxFast?0.34:0.17);   /* cached page = assemble fast */
    if(pd>0.995) pd=1; if(pd<0.0005) pd=0;
    window.__rbxPd=pd;
    if(pd>=0.72 && !window.__rbxHeart){ window.__rbxHeart=1; document.dispatchEvent(new Event('rbx-heart')); }

    var ay=t*0.5+0.7, ax=-0.5+Math.sin(t*0.42)*0.14, big=mul(rotY(ay),rotX(ax));
    var glow=0.9+Math.sin(t*3.0)*0.1;
    proj=persp(0.9,asp,0.1,50);

    /* per-voxel state up front (used by both draw passes) */
    var seated=[];
    for(var i=0;i<vox.length;i++){
      var v=vox[i], gp=v.gp, e=smooth((pd - v.thr)/SPAN);   /* 0 empty .. 1 seated */
      if(e<=0.004){ seated.push(null); continue; }
      var rr=(1-e)*(1-e);
      var px=gp[0]+v.off[0]*rr, py=gp[1]+v.off[1]*rr, pz=gp[2]+v.off[2]*rr;
      var local=mul(mul(rotY(v.sr[1]*rr),rotX(v.sr[0]*rr)),rotZ(v.sr[2]*rr));
      var vs=HALF*(0.34+0.66*e);
      /* premium idle: seated voxels breathe ~1.8% out of phase across the grid (subtle life) */
      if(e>=0.999) vs*=1+0.018*Math.sin(t*1.7+(gp[0]+gp[1]*1.37+gp[2]*1.93)*5.2);
      seated.push({ e:e, m:mul(scl(PAD),mul(big,mul(trn(px,py,pz),mul(local,scl(vs))))) });
    }

    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.BLEND);

    /* PASS 1 — SOLID red glass, depth-tested so the filled cubes actually occlude each other
       (opacity climbs with fill so a seated voxel reads as solid red, not a pale ghost) */
    gl.enable(gl.DEPTH_TEST); gl.depthMask(true); gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(1.0,1.0);   /* let surface edges win the depth test */
    for(i=0;i<seated.length;i++){ var sD=seated[i]; if(!sD) continue;
      dF(sD.m, glow*(0.55+2.1*sD.e), [1.0,0.42,0.46]); }   /* red tint (not white/glassy), near-opaque when seated */
    /* white centre core removed (client) — the cube fills with red voxels only */

    /* PASS 2 — additive glow (empty lattice, seated edges, outer shell); depth-tested, no depth writes */
    gl.disable(gl.POLYGON_OFFSET_FILL);
    /* depth test ON (mask off): enclosed geometry — the centre voxel — can no longer bleed through */
    gl.depthMask(false); gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
    for(i=0;i<vox.length;i++){ var vv=vox[i], g2=vv.gp, e2=smooth((pd - vv.thr)/SPAN);
      if(e2<0.985){ dE(mul(scl(PAD),mul(big,mul(trn(g2[0],g2[1],g2[2]),scl(HALF)))), glow*0.10*(1-0.7*e2), [0.9,0.24,0.3]); }
      var sD2=seated[i]; if(!sD2) continue;
      var pop=1+0.25*Math.max(0,1-Math.abs(sD2.e-0.82)/0.18);
      /* travelling glint: every ~1.4s one seated voxel's edges catch the light and fade */
      var gk=(t*0.72), gi=((gk|0)*11+5)%N, gf=gk-(gk|0);
      var glint=(i===gi&&sD2.e>=0.99)?0.55*Math.sin(gf*3.1416):0;
      dE(sD2.m, glow*(0.22+0.34*sD2.e)*pop+glint, [1,0.17,0.24]); }   /* stays RED when lines stack */
    var shellA=smooth((pd-0.92)/0.08);   /* white heart cube removed (client) */
    if(shellA>0.01){ dE(mul(scl(PAD),mul(big,scl(CELL*1.62))), glow*0.22*shellA,[1,0.36,0.42]); dE(mul(scl(PAD),mul(big,scl(CELL*1.78))), glow*0.10*shellA,[1,0.30,0.36]); }
    gl.depthMask(true);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  /* the page can force the finished state before fading out, so the cube never vanishes mid-build */
  window.__rbxSnapComplete=function(){ if(stop) return; window.__rbxBootP=1; pd=1; window.__rbxPd=1;
    try{ frame(performance.now()); }catch(e){} };
  setTimeout(function(){ stop=true; var lc=gl.getExtension('WEBGL_lose_context'); if(lc) lc.loseContext(); }, 9000);
  })();
})();
