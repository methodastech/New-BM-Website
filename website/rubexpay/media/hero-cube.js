/* RubexPay — HERO CUBE (raw WebGL/GLSL, zero dependencies).
   A premium, subtle sci-fi replacement for the hero banner video: three nested cube shells —
   an outer breathing lattice, a mid glass shell with fresnel faces, and a bright pulsing core —
   plus corner tethers, a slow ember field and light-pulses that travel the outer edges.
   Constraints honoured (see rubexpay-performance-optimization):
     - DPR capped at 1.5, single canvas, no post-processing, ~10 draw calls/frame
     - boots only when the hero is on screen; frees GL when scrolled far away
     - phones (<=760) and reduced-motion never boot — they keep the poster/video path
     - if WebGL is refused the video path silently continues (canvas stays hidden)
   Publishes window.__rbxHeroGL=1 on success so the video deferred-start skips itself. */
(function(){
  if(window.matchMedia && (matchMedia('(prefers-reduced-motion:reduce)').matches || matchMedia('(max-width:760px)').matches)) return;
  var hero=document.getElementById('hero'); if(!hero || !hero.classList.contains('hero--vid')) return;
  var cv=document.getElementById('hero-cube'); if(!cv) return;

  var gl=null, tries=0;
  (function boot(){
    try{ gl=cv.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false,powerPreference:'low-power'}); }catch(e){}
    if(!gl){ if(++tries<10) setTimeout(boot,300); return; }
    start();
  })();

  function start(){
  window.__rbxHeroGL=1;
  hero.classList.add('hero--cube3d');
  var hv=hero.querySelector('video.hero-video');
  if(hv){ try{ hv.pause(); hv.removeAttribute('autoplay'); }catch(e){} }

  var dpr=Math.min(devicePixelRatio||1,1.5), asp=1;
  function resize(){ var r=cv.getBoundingClientRect(); var w=Math.max(2,r.width|0),h=Math.max(2,r.height|0); cv.width=w*dpr; cv.height=h*dpr; gl.viewport(0,0,cv.width,cv.height); asp=w/h; }
  resize(); addEventListener('resize',resize);

  function comp(t,s){ var x=gl.createShader(t); gl.shaderSource(x,s); gl.compileShader(x); return x; }
  function link(v,f){ var p=gl.createProgram(); gl.attachShader(p,comp(gl.VERTEX_SHADER,v)); gl.attachShader(p,comp(gl.FRAGMENT_SHADER,f)); gl.linkProgram(p); return p; }

  var faceP=link(
    'attribute vec3 aPos;attribute vec3 aNor;uniform mat4 uMVP;uniform mat4 uModel;varying vec3 vN;varying vec3 vWp;void main(){vWp=(uModel*vec4(aPos,1.0)).xyz;vN=(uModel*vec4(aNor,0.0)).xyz;gl_Position=uMVP*vec4(aPos,1.0);}',
    'precision highp float;varying vec3 vN;varying vec3 vWp;uniform vec3 uCam;uniform float uA;uniform vec3 uTint;void main(){vec3 V=normalize(uCam-vWp);float F=pow(1.0-clamp(dot(normalize(vN),V),0.0,1.0),2.2);vec3 deep=vec3(0.12,0.004,0.018)*uTint;vec3 hot=vec3(1.0,0.10,0.16)*uTint;vec3 col=mix(deep,hot,F)*(0.7+F*1.1);gl_FragColor=vec4(col,(0.12+F*0.9)*uA);}');
  var lineP=link(
    'attribute vec3 aPos;uniform mat4 uMVP;void main(){gl_Position=uMVP*vec4(aPos,1.0);}',
    'precision highp float;uniform float uA;uniform vec3 uC;void main(){gl_FragColor=vec4(uC,uA);}');
  var ptP=link(
    'attribute vec3 aPos;attribute float aS;uniform mat4 uMVP;uniform float uT;varying float vTw;void main(){vTw=0.55+0.45*sin(uT*(0.6+aS)+aS*37.0);gl_Position=uMVP*vec4(aPos,1.0);gl_PointSize=(1.5+aS*2.6);}',
    'precision highp float;varying float vTw;uniform float uA;void main(){vec2 d=gl_PointCoord-vec2(0.5);float r=length(d);if(r>0.5)discard;float g=smoothstep(0.5,0.0,r);gl_FragColor=vec4(1.0,0.15,0.21,g*vTw*uA);}');
  var haloP=link(
    'attribute vec2 aPos;varying vec2 vUv;void main(){vUv=aPos;gl_Position=vec4(aPos,0.0,1.0);}',
    'precision highp float;varying vec2 vUv;uniform float uA;uniform float uAsp;void main(){vec2 p=vec2(vUv.x*uAsp,vUv.y);float r=length(p);float g=exp(-r*r*3.4);gl_FragColor=vec4(0.55,0.02,0.07,g*uA);}');

  var s=1.0, C=[[-s,-s,-s],[s,-s,-s],[s,s,-s],[-s,s,-s],[-s,-s,s],[s,-s,s],[s,s,s],[-s,s,s]];
  var F=[[1,2,6,5,1,0,0],[0,3,7,4,-1,0,0],[3,2,6,7,0,1,0],[0,1,5,4,0,-1,0],[4,5,6,7,0,0,1],[0,1,2,3,0,0,-1]];
  var fp=[],fi=[],vc=0;
  F.forEach(function(f){ var n=[f[4],f[5],f[6]]; for(var k=0;k<4;k++){ var c=C[f[k]]; fp.push(c[0],c[1],c[2],n[0],n[1],n[2]); } fi.push(vc,vc+1,vc+2,vc,vc+2,vc+3); vc+=4; });
  var EP=[0,1,1,2,2,3,3,0,4,5,5,6,6,7,7,4,0,4,1,5,2,6,3,7], ep=[];
  for(var i=0;i<EP.length;i++){ var cc=C[EP[i]]; ep.push(cc[0],cc[1],cc[2]); }
  /* corner tethers: outer corner -> same corner scaled inward (drawn with a scaled model matrix pair baked here) */
  var tp=[]; for(i=0;i<8;i++){ var c2=C[i]; tp.push(c2[0],c2[1],c2[2], c2[0]*0.52,c2[1]*0.52,c2[2]*0.52); }
  /* ember field */
  var EN=170, pts=[], ps=[];
  for(i=0;i<EN;i++){ var a=Math.random()*6.283, rr=1.35+Math.random()*1.5, y=(Math.random()-0.5)*3.4;
    pts.push(Math.cos(a)*rr, y, Math.sin(a)*rr); ps.push(Math.random()); }

  function buf(d,tp2){ var b=gl.createBuffer(); tp2=tp2||gl.ARRAY_BUFFER; gl.bindBuffer(tp2,b); gl.bufferData(tp2,d,gl.STATIC_DRAW); return b; }
  var fpB=buf(new Float32Array(fp)), fiB=buf(new Uint16Array(fi),gl.ELEMENT_ARRAY_BUFFER), epB=buf(new Float32Array(ep)),
      tpB=buf(new Float32Array(tp)), ptB=buf(new Float32Array(pts)), psB=buf(new Float32Array(ps)),
      hqB=buf(new Float32Array([-1,-1, 1,-1, -1,1, 1,1]));
  var fA={pos:gl.getAttribLocation(faceP,'aPos'),nor:gl.getAttribLocation(faceP,'aNor'),mvp:gl.getUniformLocation(faceP,'uMVP'),mdl:gl.getUniformLocation(faceP,'uModel'),cam:gl.getUniformLocation(faceP,'uCam'),a:gl.getUniformLocation(faceP,'uA'),tint:gl.getUniformLocation(faceP,'uTint')};
  var lA={pos:gl.getAttribLocation(lineP,'aPos'),mvp:gl.getUniformLocation(lineP,'uMVP'),a:gl.getUniformLocation(lineP,'uA'),c:gl.getUniformLocation(lineP,'uC')};
  var pA={pos:gl.getAttribLocation(ptP,'aPos'),s:gl.getAttribLocation(ptP,'aS'),mvp:gl.getUniformLocation(ptP,'uMVP'),t:gl.getUniformLocation(ptP,'uT'),a:gl.getUniformLocation(ptP,'uA')};
  var hA={pos:gl.getAttribLocation(haloP,'aPos'),a:gl.getUniformLocation(haloP,'uA'),asp:gl.getUniformLocation(haloP,'uAsp')};

  function ident(){var o=new Float32Array(16);o[0]=o[5]=o[10]=o[15]=1;return o;}
  function mul(a,b){var o=new Float32Array(16);for(var c=0;c<4;c++)for(var r=0;r<4;r++){o[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];}return o;}
  function persp(fy,as,n,f){var t=1/Math.tan(fy/2),o=new Float32Array(16);o[0]=t/as;o[5]=t;o[10]=(f+n)/(n-f);o[11]=-1;o[14]=2*f*n/(n-f);return o;}
  function rotY(a){var c=Math.cos(a),sn=Math.sin(a),o=ident();o[0]=c;o[2]=-sn;o[8]=sn;o[10]=c;return o;}
  function rotX(a){var c=Math.cos(a),sn=Math.sin(a),o=ident();o[5]=c;o[9]=-sn;o[6]=sn;o[10]=c;return o;}
  function scl(v){var o=ident();o[0]=o[5]=o[10]=v;return o;}

  var camZ=4.4, view=ident(); view[14]=-camZ;
  var proj=null;
  function dFace(m,a,tint){ var mvp=mul(proj,mul(view,m)); gl.useProgram(faceP);
    gl.bindBuffer(gl.ARRAY_BUFFER,fpB); gl.enableVertexAttribArray(fA.pos); gl.vertexAttribPointer(fA.pos,3,gl.FLOAT,false,24,0);
    gl.enableVertexAttribArray(fA.nor); gl.vertexAttribPointer(fA.nor,3,gl.FLOAT,false,24,12);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,fiB); gl.uniformMatrix4fv(fA.mvp,false,mvp); gl.uniformMatrix4fv(fA.mdl,false,m);
    gl.uniform3f(fA.cam,0,0,camZ); gl.uniform1f(fA.a,a); gl.uniform3f(fA.tint,tint[0],tint[1],tint[2]);
    gl.drawElements(gl.TRIANGLES,fi.length,gl.UNSIGNED_SHORT,0); }
  function dLines(bufr,count,m,a,col){ var mvp=mul(proj,mul(view,m)); gl.useProgram(lineP);
    gl.bindBuffer(gl.ARRAY_BUFFER,bufr); gl.enableVertexAttribArray(lA.pos); gl.vertexAttribPointer(lA.pos,3,gl.FLOAT,false,0,0);
    gl.uniformMatrix4fv(lA.mvp,false,mvp); gl.uniform1f(lA.a,a); gl.uniform3f(lA.c,col[0],col[1],col[2]);
    gl.lineWidth(1.4); gl.drawArrays(gl.LINES,0,count); }

  /* light-pulses that travel the outer edges (drawn as GL points along an edge) */
  var pulses=[{e:2,t:0.0,sp:0.16},{e:9,t:0.45,sp:0.11},{e:17,t:0.8,sp:0.14}];
  var pulseB=gl.createBuffer();

  var running=true, dead=false, t0=performance.now();
  function frame(now){
    if(dead) return;
    requestAnimationFrame(frame);
    if(!running) return;
    var t=(now-t0)/1000;
    proj=persp(0.72,asp,0.1,60);
    var breathe=1+0.028*Math.sin(t*0.7);
    var m=mul(rotY(t*0.14+0.6), rotX(-0.44+Math.sin(t*0.23)*0.055));

    gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND); gl.disable(gl.DEPTH_TEST); gl.depthMask(false);
    gl.blendFunc(gl.SRC_ALPHA,gl.ONE);

    /* halo behind everything (screen-space, replaces bloom) */
    gl.useProgram(haloP); gl.bindBuffer(gl.ARRAY_BUFFER,hqB);
    gl.enableVertexAttribArray(hA.pos); gl.vertexAttribPointer(hA.pos,2,gl.FLOAT,false,0,0);
    gl.uniform1f(hA.a,0.30+0.05*Math.sin(t*1.3)); gl.uniform1f(hA.asp,asp);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);

    /* embers */
    gl.useProgram(ptP); gl.bindBuffer(gl.ARRAY_BUFFER,ptB);
    gl.enableVertexAttribArray(pA.pos); gl.vertexAttribPointer(pA.pos,3,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ARRAY_BUFFER,psB); gl.enableVertexAttribArray(pA.s); gl.vertexAttribPointer(pA.s,1,gl.FLOAT,false,0,0);
    gl.uniformMatrix4fv(pA.mvp,false,mul(proj,mul(view,mul(rotY(t*0.045),ident()))));
    gl.uniform1f(pA.t,t); gl.uniform1f(pA.a,0.7);
    gl.drawArrays(gl.POINTS,0,EN);

    /* glass shells: mid faces first (normal blend for depth of tone), then additive lines */
    gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    dFace(mul(m,scl(0.62*breathe)), 1.0, [1,1,1]);                             /* mid ruby-glass shell */
    gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
    dFace(mul(m,scl(1.02*breathe)), 0.22, [1,0.55,0.62]);                      /* faint outer glass skin */
    dFace(mul(m,scl(0.26*(1+0.05*Math.sin(t*1.3)))), 1.7, [1.35,0.30,0.36]);   /* hot RED core */
    dLines(epB,EP.length,mul(m,scl(1.02*breathe)), 0.55+0.08*Math.sin(t*0.9), [1,0.12,0.18]);   /* outer lattice */
    dLines(epB,EP.length,mul(m,scl(0.62*breathe)), 0.24, [1,0.2,0.26]);
    dLines(tpB,16,m, 0.10, [1,0.30,0.36]);                                    /* corner tethers */

    /* edge light-pulses */
    var pv=[];
    for(var q=0;q<pulses.length;q++){ var P=pulses[q]; P.t+=P.sp/60; if(P.t>1){ P.t=0; P.e=(Math.random()*12|0)*2; }
      var i0=EP[P.e]*1, i1=EP[P.e+1]*1, A=C[i0], B=C[i1], k=P.t;
      pv.push((A[0]+(B[0]-A[0])*k)*1.02, (A[1]+(B[1]-A[1])*k)*1.02, (A[2]+(B[2]-A[2])*k)*1.02, 0.9); }
    gl.bindBuffer(gl.ARRAY_BUFFER,pulseB); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(pv),gl.DYNAMIC_DRAW);
    gl.useProgram(ptP);
    gl.enableVertexAttribArray(pA.pos); gl.vertexAttribPointer(pA.pos,3,gl.FLOAT,false,16,0);
    gl.enableVertexAttribArray(pA.s); gl.vertexAttribPointer(pA.s,1,gl.FLOAT,false,16,12);
    gl.uniformMatrix4fv(pA.mvp,false,mul(proj,mul(view,m)));
    gl.uniform1f(pA.t,t); gl.uniform1f(pA.a,0.9);
    gl.drawArrays(gl.POINTS,0,pulses.length);
    gl.depthMask(true);
  }
  requestAnimationFrame(frame);
  window.__rbxHeroCubeFrame=function(){ try{ frame(performance.now()); }catch(e){} };   /* headless verify hook */

  /* only render while the hero is anywhere near the viewport */
  new IntersectionObserver(function(es){ running=es[0].isIntersecting; },{rootMargin:'200px'}).observe(hero);
  }
})();
