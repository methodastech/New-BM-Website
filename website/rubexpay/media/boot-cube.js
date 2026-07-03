/* RubexPay — shared boot-loader cube (raw WebGL/GLSL, no dependencies).
   Brand-mark composition: outer glowing glass cube, counter-rotating inner core cube,
   white-hot heart, gentle float. Falls back silently to the SVG mark if WebGL is unavailable. */
(function(){
  var pre = document.getElementById('pre'); if(!pre) return;
  if(pre.style.display === 'none') return;                                     /* already booted this session */
  try{ if(sessionStorage.getItem('rbx-booted')) return; }catch(e){}             /* repeat visit: loader will be skipped */
  if(window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  var cv = pre.querySelector('.pl-gl'); if(!cv) return;
  /* the GPU can refuse a context during a busy page boot — retry briefly, else keep the SVG mark */
  var tries = 0;
  (function boot(){
  var gl = null;
  try{ gl = cv.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false}) || cv.getContext('experimental-webgl'); }catch(e){}
  if(!gl){ if(++tries < 12 && pre.style.display !== 'none') setTimeout(boot, 220); return; }
  var box = pre.querySelector('.pl-cube'); if(box) box.classList.add('gl-on');

  var dpr = Math.min(devicePixelRatio||1, 2), asp = 1;                          /* small canvas — crisp is cheap */
  function resize(){ var r=cv.getBoundingClientRect(); var w=Math.max(2,r.width|0),h=Math.max(2,r.height|0); cv.width=w*dpr; cv.height=h*dpr; gl.viewport(0,0,cv.width,cv.height); asp=w/h; }
  resize(); window.addEventListener('resize',resize);

  function comp(t,src){ var s=gl.createShader(t); gl.shaderSource(s,src); gl.compileShader(s); return s; }
  function link(vs,fs){ var p=gl.createProgram(); gl.attachShader(p,comp(gl.VERTEX_SHADER,vs)); gl.attachShader(p,comp(gl.FRAGMENT_SHADER,fs)); gl.linkProgram(p); return p; }

  var faceP=link(
    'attribute vec3 aPos;attribute vec3 aNor;uniform mat4 uMVP;uniform mat4 uModel;uniform vec3 uCam;varying float vF;void main(){vec3 wp=(uModel*vec4(aPos,1.0)).xyz;vec3 N=normalize((uModel*vec4(aNor,0.0)).xyz);vec3 V=normalize(uCam-wp);vF=pow(1.0-clamp(dot(N,V),0.0,1.0),1.7);gl_Position=uMVP*vec4(aPos,1.0);}',
    'precision highp float;varying float vF;uniform float uA;uniform vec3 uTint;void main(){vec3 deep=vec3(0.40,0.02,0.05)*uTint;vec3 hot=vec3(1.0,0.42,0.48)*uTint;vec3 col=mix(deep,hot,vF)*(0.95+vF*1.5);float a=(0.40+vF*0.6)*uA;gl_FragColor=vec4(col,a);}'
  );
  var edgeP=link(
    'attribute vec3 aPos;uniform mat4 uMVP;void main(){gl_Position=uMVP*vec4(aPos,1.0);}',
    'precision highp float;uniform float uA;uniform vec3 uC;void main(){gl_FragColor=vec4(uC,uA);}'
  );

  var s=0.82;
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
  function scl(v){var o=ident();o[0]=o[5]=o[10]=v;return o;}
  function trn(x,y,z){var o=ident();o[12]=x;o[13]=y;o[14]=z;return o;}

  gl.clearColor(0,0,0,0);
  var camZ=2.85, t0=performance.now(), stop=false, pd=0;
  var proj=null;

  function drawFaces(model,alpha,tint){
    var mvp=mul(proj,mul(view,model));
    gl.useProgram(faceP);
    gl.bindBuffer(gl.ARRAY_BUFFER,fpB);
    gl.enableVertexAttribArray(fA.pos); gl.vertexAttribPointer(fA.pos,3,gl.FLOAT,false,24,0);
    gl.enableVertexAttribArray(fA.nor); gl.vertexAttribPointer(fA.nor,3,gl.FLOAT,false,24,12);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,fiB);
    gl.uniformMatrix4fv(fA.mvp,false,mvp); gl.uniformMatrix4fv(fA.mdl,false,model);
    gl.uniform3f(fA.cam,0,0,camZ); gl.uniform1f(fA.a,alpha); gl.uniform3f(fA.tint,tint[0],tint[1],tint[2]);
    gl.drawElements(gl.TRIANGLES,fi.length,gl.UNSIGNED_SHORT,0);
  }
  function drawEdges(model,alpha,col,verts){
    if(alpha<=0.012) return;
    var mvp=mul(proj,mul(view,model));
    gl.useProgram(edgeP);
    gl.bindBuffer(gl.ARRAY_BUFFER,epB);
    gl.enableVertexAttribArray(eA.pos); gl.vertexAttribPointer(eA.pos,3,gl.FLOAT,false,0,0);
    gl.uniformMatrix4fv(eA.mvp,false,mvp); gl.uniform1f(eA.a,alpha); gl.uniform3f(eA.c,col[0],col[1],col[2]);
    gl.lineWidth(2); gl.drawArrays(gl.LINES,0,Math.min(ep.length/3, verts||ep.length/3));
  }

  var view=ident(); view[14]=-camZ;
  function frame(now){
    if(stop) return;
    if(pre.style.display==='none'){ stop=true; return; }
    var t=(now-t0)/1000;
    var intro=Math.min(t/0.85,1), sc=0.25+(1-Math.pow(1-intro,3))*0.75;
    var ay=t*0.85+0.62, ax=-0.42+Math.sin(t*0.55)*0.12;
    var bob=Math.sin(t*1.5)*0.05*intro;
    /* THE CUBE IS THE LOADER: it assembles with the real boot progress —
       edges rise first (bottom ring, top ring, columns), faces glass in,
       the core forms, the heart ignites, then the outer energy shells wake */
    var target=(typeof window.__rbxBootP==='number')?window.__rbxBootP:Math.min(t/1.9,1);
    pd+=(target-pd)*0.14; if(pd>0.995)pd=1;
    var edgeVerts=Math.max(2,Math.ceil(pd*12)*2);
    var faceA =Math.max(0,Math.min(1,(pd-0.35)/0.5));
    var coreA =Math.max(0,Math.min(1,(pd-0.5)/0.3));
    var heartA=Math.max(0,Math.min(1,(pd-0.72)/0.24));
    var shellA=Math.max(0,Math.min(1,(pd-0.86)/0.14));
    /* PAD: the canvas is ~1.92x larger than the cube box (CSS), the scene scales down to match,
       so rotating corners and glow always have air and are never cut by the canvas edge */
    var PAD=0.52;
    function M(k,yA,xA){ return mul(trn(0,bob*PAD,0),mul(mul(rotY(yA),rotX(xA)),scl(k*PAD))); }
    var mO=M(sc,ay,ax);                                          /* outer glass shell */
    var mC=M(sc*0.46*(0.7+0.3*coreA),-ay*1.6+0.8,ax*0.55);       /* core cube pops in as it forms */
    var mH=M(sc*0.17*(0.55+0.45*heartA),ay*2.3,ax);              /* the heart ignites near the end */
    var glow=intro*(0.85+Math.sin(t*2.0)*0.12);
    proj=persp(0.92,asp,0.1,50);

    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.disable(gl.DEPTH_TEST); gl.enable(gl.BLEND); gl.depthMask(false);
    /* glass passes, painter-sorted inner -> outer */
    gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    if(heartA>0.01) drawFaces(mH, glow*1.8*heartA, [1.9,1.45,1.5]);
    if(coreA>0.01)  drawFaces(mC, glow*1.15*coreA, [1.25,0.9,0.95]);
    if(faceA>0.01)  drawFaces(mO, glow*0.72*faceA, [1,1,1]);
    /* additive glowing wireframes + soft outer shells */
    gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
    drawEdges(mC, glow*0.9*coreA, [1,0.72,0.78]);
    drawEdges(mO, glow,     [1,0.55,0.6], edgeVerts);
    drawEdges(M(sc*1.07,ay,ax), glow*0.4*shellA,  [1,0.4,0.46]);
    drawEdges(M(sc*1.15,ay,ax), glow*0.16*shellA, [1,0.3,0.36]);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  setTimeout(function(){ stop=true; var lc=gl.getExtension('WEBGL_lose_context'); if(lc) lc.loseContext(); }, 9000);
  })();
})();
