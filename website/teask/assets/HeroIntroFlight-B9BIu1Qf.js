import{b4 as O,b5 as Rt,aQ as At,S as tt,aD as Et,X as Nt,G as at,as as Tt,aE as Dt,at as zt,V as Ft,av as st,z as it,bc as ut,y as It,C as Wt,j as Bt,I as jt,k as kt,ba as L,ar as rt}from"./index-Cz1ifc9x.js";const _t=7200,pt=340,Gt=-470,J=[150,-26,-300],mt=920,Ht=`
uniform vec3 sunPosition; uniform float rayleigh; uniform float turbidity; uniform float mieCoefficient;
varying vec3 vWorldPosition; varying vec3 vSunDirection; varying float vSunfade; varying vec3 vBetaR; varying vec3 vBetaM; varying float vSunE;
const vec3 up = vec3(0.0,1.0,0.0);
const float e = 2.71828182845904523536028747135266249775724709369995957;
const float pi = 3.141592653589793238462643383279502884197169;
const vec3 totalRayleigh = vec3(5.804542996261093e-6, 1.3562911419845635e-5, 3.0265902468824876e-5);
const vec3 MieConst = vec3(1.8399918514433978e14, 2.7798023919660528e14, 4.0790479543861094e14);
const float cutoffAngle = 1.6110731556870734;
const float steepness = 1.5;
const float EE = 1000.0;
float sunIntensity(float zenithAngleCos){
  zenithAngleCos = clamp(zenithAngleCos, -1.0, 1.0);
  return EE * max(0.0, 1.0 - pow(e, -((cutoffAngle - acos(zenithAngleCos)) / steepness)));
}
vec3 totalMie(float T){ float c = (0.2 * T) * 10e-18; return 0.434 * c * MieConst; }
void main(){
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position.z = gl_Position.w;
  vSunDirection = normalize(sunPosition);
  vSunE = sunIntensity(dot(vSunDirection, up));
  vSunfade = 1.0 - clamp(1.0 - exp((sunPosition.y / 450000.0)), 0.0, 1.0);
  float rayleighCoefficient = rayleigh - (1.0 * (1.0 - vSunfade));
  vBetaR = totalRayleigh * rayleighCoefficient;
  vBetaM = totalMie(turbidity) * mieCoefficient;
}`,Lt=`
varying vec3 vWorldPosition; varying vec3 vSunDirection; varying float vSunfade; varying vec3 vBetaR; varying vec3 vBetaM; varying float vSunE;
uniform float mieDirectionalG;
const vec3 cameraPos = vec3(0.0);
const float pi = 3.141592653589793238462643383279502884197169;
const float rayleighZenithLength = 8.4e3;
const float mieZenithLength = 1.25e3;
const vec3 up = vec3(0.0,1.0,0.0);
const float sunAngularDiameterCos = 0.99993;
float rayleighPhase(float cosTheta){ return (3.0 / (16.0 * pi)) * (1.0 + pow(cosTheta, 2.0)); }
float hgPhase(float cosTheta, float g){
  float g2 = pow(g, 2.0);
  float inv = 1.0 / pow(1.0 - 2.0 * g * cosTheta + g2, 1.5);
  return (1.0 / (4.0 * pi)) * ((1.0 - g2) * inv);
}
void main(){
  vec3 direction = normalize(vWorldPosition - cameraPos);
  float zenithAngle = acos(max(0.0, dot(up, direction)));
  float inv = 1.0 / (cos(zenithAngle) + 0.15 * pow(93.885 - ((zenithAngle * 180.0) / pi), -1.253));
  float sR = rayleighZenithLength * inv;
  float sM = mieZenithLength * inv;
  vec3 Fex = exp(-(vBetaR * sR + vBetaM * sM));
  float cosTheta = dot(direction, vSunDirection);
  float rPhase = rayleighPhase(cosTheta * 0.5 + 0.5);
  vec3 betaRTheta = vBetaR * rPhase;
  float mPhase = hgPhase(cosTheta, mieDirectionalG);
  vec3 betaMTheta = vBetaM * mPhase;
  vec3 Lin = pow(vSunE * ((betaRTheta + betaMTheta) / (vBetaR + vBetaM)) * (1.0 - Fex), vec3(1.5));
  Lin *= mix(vec3(1.0), pow(vSunE * ((betaRTheta + betaMTheta) / (vBetaR + vBetaM)) * Fex, vec3(0.5)),
             clamp(pow(1.0 - dot(up, vSunDirection), 5.0), 0.0, 1.0));
  vec3 L0 = vec3(0.1) * Fex;
  float sundisk = smoothstep(sunAngularDiameterCos, sunAngularDiameterCos + 0.00022, cosTheta);
  L0 += (vSunE * 19000.0 * Fex) * sundisk;
  vec3 texColor = (Lin + L0) * 0.04 + vec3(0.0, 0.0003, 0.00075);
  vec3 retColor = pow(texColor, vec3(1.0 / (1.2 + (1.2 * vSunfade))));
  /* Below the horizon the scattering model has nothing to integrate through, so
     extrapolating it just yields murk. Substitute luminous dawn mist instead:
     it brightens as the sun climbs and warms toward the sun's azimuth, which is
     what ground fog actually does at first light. */
  float sunUp = smoothstep(-0.10, 0.16, vSunDirection.y);
  vec3 flatDir = normalize(vec3(direction.x, 0.0, direction.z));
  vec3 flatSun = normalize(vec3(vSunDirection.x, 0.0, vSunDirection.z));
  float facing = pow(max(dot(flatDir, flatSun), 0.0), 3.0);
  vec3 mist = mix(vec3(0.62, 0.66, 0.74), vec3(1.35, 1.08, 0.82), facing * (0.35 + 0.65 * sunUp));
  mist *= (0.55 + 1.15 * sunUp);
  gl_FragColor = vec4(mix(retColor, mist, smoothstep(0.015, 0.32, -direction.y)), 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;function $t(E,x=512){const a=document.createElement("canvas");a.width=a.height=x;const i=a.getContext("2d"),M=i.createRadialGradient(x/2,x/2,0,x/2,x/2,x/2);E.forEach(([c,d])=>M.addColorStop(c,d)),i.fillStyle=M,i.fillRect(0,0,x,x);const g=new rt(a);return g.colorSpace=tt,g}function Ot(){const a=document.createElement("canvas");a.width=512,a.height=128;const i=a.getContext("2d"),M=i.createImageData(512,128),g=M.data;for(let d=0;d<128;d++){const y=Math.abs(d/128*2-1),h=Math.exp(-y*y*26);for(let w=0;w<512;w++){const p=Math.abs(w/512*2-1),o=Math.pow(Math.max(0,1-p),2.6)*Math.exp(-p*2.2),m=(d*512+w)*4;g[m]=255,g[m+1]=226-p*34,g[m+2]=186-p*62,g[m+3]=Math.min(255,h*o*255)}}i.putImageData(M,0,0);const c=new rt(a);return c.colorSpace=tt,c}function Ut(E){const a=document.createElement("canvas");a.width=a.height=512;const i=a.getContext("2d");let M=E>>>0;const g=()=>(M=M*1664525+1013904223>>>0,M/4294967296),c=64,d=new Float32Array(c*c);for(let n=0;n<d.length;n++)d[n]=g();const y=n=>n*n*(3-2*n),h=n=>(n%c+c)%c,w=(n,l)=>{const f=Math.floor(n),b=Math.floor(l),u=h(f),C=h(b),N=u+1===c?0:u+1,r=C+1===c?0:C+1,F=y(n-f),$=y(l-b),H=d[C*c+u],ot=d[C*c+N],Z=d[r*c+u],q=d[r*c+N];return H+(ot-H)*F+(Z-H)*$+(H-ot-Z+q)*F*$},p=(n,l)=>{let f=0,b=.52,u=1;for(let C=0;C<5;C++)f+=b*w(n*u,l*u),b*=.5,u*=2.03;return f},o=96,m=new Float32Array(o*o),W=new Float32Array(o*o),v=383/384*5.5;for(let n=0;n<o;n++)for(let l=0;l<o;l++){const f=l/(o-1)*v,b=n/(o-1)*v;m[n*o+l]=p(f+11.7,b+3.1),W[n*o+l]=p(f-5.2,b+9.4)}const et=(n,l,f)=>{const b=Math.min(o-2,l|0),u=Math.min(o-2,f|0),C=l-b,N=f-u,r=n[u*o+b],F=n[u*o+b+1],$=n[(u+1)*o+b],H=n[(u+1)*o+b+1];return r+(F-r)*C+($-r)*N+(r-F-$+H)*C*N},ct=i.createImageData(384,384),U=ct.data,B=new Float32Array(384*384);for(let n=0;n<384;n++){const l=n/383*(o-1);for(let f=0;f<384;f++){const b=f/384*5.5,u=n/384*5.5,C=et(m,f/383*(o-1),l),N=et(W,f/383*(o-1),l);let r=p(b+C*1.9,u+N*1.9);r=Math.max(0,r-.535)/.465,B[n*384+f]=Math.pow(r,1.35)}}for(let n=0;n<384;n++)for(let l=0;l<384;l++){const f=n*384+l,b=B[f],u=B[n*384+Math.min(383,l+2)]-B[n*384+Math.max(0,l-2)],C=B[Math.min(383,n+2)*384+l]-B[Math.max(0,n-2)*384+l],N=Math.max(0,Math.min(1,.55-C*3.2+u*.6)),r=f*4;U[r]=118+N*137,U[r+1]=128+N*92,U[r+2]=152+N*46,U[r+3]=Math.min(212,b*235)}const G=document.createElement("canvas");G.width=G.height=384,G.getContext("2d").putImageData(ct,0,0),i.drawImage(G,0,0,512,512);const K=i.createRadialGradient(256,256,512*.26,256,256,256);K.addColorStop(0,"rgba(0,0,0,0)"),K.addColorStop(1,"rgba(0,0,0,1)"),i.globalCompositeOperation="destination-out",i.fillStyle=K,i.fillRect(0,0,512,512);const nt=new rt(a);return nt.colorSpace=tt,nt}function gt(E){const x=document.createElement("canvas");x.width=x.height=256;const a=x.getContext("2d");let i=E>>>0;const M=()=>(i=i*1664525+1013904223>>>0,i/4294967296);for(let d=0;d<15;d++){const y=M()*Math.PI*2,h=M()*62,w=128+Math.cos(y)*h,p=132+Math.sin(y)*h*.55-8,o=34+M()*46,m=.22+M()*.3,W=a.createRadialGradient(w,p,0,w,p,o);W.addColorStop(0,`rgba(255,255,255,${m})`),W.addColorStop(.6,`rgba(244,246,250,${m*.5})`),W.addColorStop(1,"rgba(255,255,255,0)"),a.fillStyle=W,a.beginPath(),a.arc(w,p,o,0,Math.PI*2),a.fill()}const g=a.createRadialGradient(128,128,66,128,128,128);g.addColorStop(0,"rgba(0,0,0,0)"),g.addColorStop(1,"rgba(0,0,0,1)"),a.globalCompositeOperation="destination-out",a.fillStyle=g,a.fillRect(0,0,256,256);const c=new rt(x);return c.colorSpace=tt,c}function Kt(){const a=document.createElement("canvas");a.width=64,a.height=512;const i=a.getContext("2d"),M=i.createImageData(64,512),g=M.data;for(let d=0;d<512;d++){const y=Math.abs(d/512*2-1),h=Math.pow(Math.max(0,1-y),1.7);for(let w=0;w<64;w++){const p=Math.abs(w/64*2-1),o=(d*64+w)*4;g[o]=255,g[o+1]=214,g[o+2]=150,g[o+3]=Math.min(255,h*Math.exp(-p*p*9)*190)}}i.putImageData(M,0,0);const c=new rt(a);return c.colorSpace=tt,c}const dt=(E,x,a)=>{const i=Math.min(1,Math.max(0,(a-E)/(x-E)));return i*i*(3-2*i)};function Vt({onDone:E}){const x=O.useRef(null),a=O.useRef(null),i=O.useRef(null),M=O.useRef(null),g=O.useRef(null),c=O.useRef(null),d=O.useRef(E);return d.current=E,O.useEffect(()=>{const y=x.current;if(!y)return;let h;try{h=new Rt({antialias:!1,alpha:!0,powerPreference:"high-performance"})}catch{d.current();return}let w=Math.min(window.devicePixelRatio||1,1.5);h.setPixelRatio(w),h.toneMapping=At,h.toneMappingExposure=.42,h.outputColorSpace=tt,Object.assign(h.domElement.style,{width:"100%",height:"100%",display:"block"}),y.appendChild(h.domElement);const p=document.createElement("canvas");p.width=1280,p.height=720,Object.assign(p.style,{position:"absolute",inset:"0",width:"100%",height:"100%",pointerEvents:"none"});{const t=p.getContext("2d");for(let e=0;e<170;e++){const s=Math.random()*1280,P=Math.pow(Math.random(),1.6)*470,D=Math.random()<.88?.6+Math.random()*.7:1.3+Math.random()*.9;t.fillStyle=`rgba(255,255,255,${.2+Math.random()*.6})`,t.beginPath(),t.arc(s,P,D,0,Math.PI*2),t.fill()}}y.appendChild(p);const o=new Et,m=new Nt(48,1,.1,3e3),W=[],v=t=>(W.push(t),t),et=new Ft(0,-40,-mt),ct={turbidity:{value:7.5},rayleigh:{value:2.6},mieCoefficient:{value:.009},mieDirectionalG:{value:.82},sunPosition:{value:et}},U=new at(v(new Tt(1500,32,20)),v(new Dt({uniforms:ct,vertexShader:Ht,fragmentShader:Lt,side:zt,depthWrite:!1})));o.add(U);const B=new at(v(new st(640,640)),v(new it({map:v($t([[0,"rgba(255,250,238,0.95)"],[.22,"rgba(255,216,150,0.6)"],[.55,"rgba(255,170,86,0.2)"],[1,"rgba(255,140,60,0)"]])),transparent:!0,blending:ut,depthWrite:!1})));o.add(B);const G=new at(v(new st(1700,95)),v(new it({map:v(Ot()),transparent:!0,blending:ut,depthWrite:!1,opacity:.28})));o.add(G);const K=new at(v(new st(95,760)),v(new it({map:v(Kt()),transparent:!0,blending:ut,depthWrite:!1,opacity:0})));o.add(K);const nt=J.map((t,e)=>{const s=new at(v(new st(3400,3400)),v(new it({map:v(Ut(1e3+e*7919)),transparent:!0,side:It,depthWrite:!1,opacity:.4})));return s.rotation.x=-Math.PI/2,s.rotation.z=e*1.7,s.position.set(0,t,-700*.35),o.add(s),s}),n=[v(gt(11)),v(gt(313)),v(gt(9241))],l=[];{let t=424242;const e=()=>(t=t*1664525+1013904223>>>0,t/4294967296),s=[];J.forEach((D,j)=>{for(let R=0;R<66;R++){const T=.4+e()*.42,A=e(),I=(e()<.5?-1:1)*(40+e()*1150),S=D-30+e()*96,z=-(150+e()*1600),Y=95+e()*520,Q=Y*(.42+e()*.34);s.push({map:(j+R)%3,x:I,y:S,z,w:Y,h:Q,a:T,c:new Wt().setRGB(.86+A*.14,.84+A*.1,.84-A*.04)})}});const P=new Bt;n.forEach((D,j)=>{const R=s.filter(S=>S.map===j).sort((S,z)=>S.z-z.z),T=v(new it({map:D,transparent:!0,depthWrite:!1}));T.onBeforeCompile=S=>{S.vertexShader=S.vertexShader.replace("#include <common>",`#include <common>
attribute float aPuffAlpha;
varying float vPuffAlpha;`).replace("#include <project_vertex>",`vPuffAlpha = aPuffAlpha;
  vec4 mvPosition = modelViewMatrix * vec4( instanceMatrix[ 3 ].xyz, 1.0 );
  mvPosition.xy += transformed.xy * vec2( length( instanceMatrix[ 0 ].xyz ), length( instanceMatrix[ 1 ].xyz ) );
  gl_Position = projectionMatrix * mvPosition;`),S.fragmentShader=S.fragmentShader.replace("#include <common>",`#include <common>
varying float vPuffAlpha;`).replace("#include <alphamap_fragment>",`#include <alphamap_fragment>
  diffuseColor.a *= vPuffAlpha;`)};const A=v(new st(1,1)),k=new Float32Array(R.length),I=new jt(A,T,R.length);R.forEach((S,z)=>{P.makeScale(S.w,S.h,1),P.setPosition(S.x,S.y,S.z),I.setMatrixAt(z,P),I.setColorAt(z,S.c),k[z]=S.a}),A.setAttribute("aPuffAlpha",new kt(k,1)),I.instanceMatrix.needsUpdate=!0,I.instanceColor&&(I.instanceColor.needsUpdate=!0),o.add(I),l.push(I)})}const f=()=>{const t=y.clientWidth,e=y.clientHeight;!t||!e||(h.setSize(t,e,!1),m.aspect=t/e,m.updateProjectionMatrix())};f();const b=new ResizeObserver(f);b.observe(y);const u=.78,C=.84,N=t=>{if(t<u)return Math.pow(t/u,2)*C;const e=(t-u)/(1-u),s=2*C/u*(1-u);return C+(1-C)*(3-2*e)*e*e+s*e*(1-e)*(1-e)},r=[[0,.1],[.32,-.18],[.7,-.42],[1,-.6]],F=t=>t*t*(3-2*t),$=(t,e)=>(r[e][1]-r[t][1])/(r[e][0]-r[t][0]),H=r.map((t,e)=>e===0||e===r.length-1?0:($(e-1,e)+$(e,e+1))/2),ot=t=>{for(let e=0;e<r.length-1;e++){const[s,P]=r[e],[D,j]=r[e+1];if(t<=D||e===r.length-2){const R=D-s,T=Math.min(1,Math.max(0,(t-s)/R)),A=T*T,k=A*T;return(2*k-3*A+1)*P+(k-2*A+T)*R*H[e]+(3*A-2*k)*j+(k-A)*R*H[e+1]}}return r[r.length-1][1]};m.position.set(0,pt,0),m.rotation.set(ot(0),0,0),h.render(o,m);let Z=0,q=0,ht=0,X=0,vt=0,xt=!1,Mt="",yt="",wt="";const ft=(t,e,s,P)=>s===P?P:(t.style.setProperty(e,s),s),bt=()=>{xt||(xt=!0,d.current())},St=t=>{q||(q=t);const e=t-ht;ht&&e<250?(X=X?X*.9+e*.1:e,X>26&&w>.75&&t-vt>700&&(w=Math.max(.75,w-.2),h.setPixelRatio(w),f(),X=0,vt=t)):X=0,ht=t;const s=Math.min(1,(t-q)/_t),P=pt+(Gt-pt)*N(s);m.position.set(0,P,0),m.rotation.set(ot(s),0,0),U.position.y=P;const D=(-3.4+9.9*F(s))*Math.PI/180,j=Math.sin(D)*mt,R=-Math.cos(D)*mt;et.set(0,j,R),B.position.set(0,P+j,R),G.position.set(0,P+j,R+1);const T=.68+.5*F(s);B.scale.setScalar(T*(1+Math.sin(t/620)*.03)),G.scale.set(T,T*.8,1),G.material.opacity=.07+.18*F(s),nt.forEach((_,lt)=>{_.rotation.z=lt*1.7+(t-q)*96e-7*(lt+1)});const A=D*180/Math.PI,k=Math.max(0,Math.min(1,(A+1.2)/2.4)),I=1-Math.max(0,Math.min(1,(A-4)/4));K.material.opacity=.2*k*I,K.position.set(0,P+j*.45,R+2),m.rotation.z=Math.sin(t/2600)*.005,m.position.x=Math.sin(t/3400)*2.5,h.toneMappingExposure=.36+.12*F(s);const S=51-5*F(s);Math.abs(m.fov-S)>.01&&(m.fov=S,m.updateProjectionMatrix()),yt=ft(p,"opacity",(1-dt(.06,.4,s)).toFixed(3),yt);const z=dt(.18,.32,s),Y=1-dt(.6,.74,s),Q=Math.min(z,Y);if(M.current){if(M.current.style.opacity=String(Q),i.current){i.current.style.transform=`scale(${(1.12-.12*z).toFixed(4)}) translateY(${((1-z)*16-(1-Y)*34).toFixed(2)}px)`;const _=(Math.round((9*(1-z)+8*(1-Y))*4)/4).toFixed(2),lt=(Math.round(.5*Q*50)/50).toFixed(2),Pt=(Math.round(.35*Q*50)/50).toFixed(2);Mt=ft(i.current,"filter",`blur(${_}px) drop-shadow(0 0 24px rgba(255,244,214,${lt})) drop-shadow(0 2px 60px rgba(255,214,150,${Pt}))`,Mt)}if(g.current&&(g.current.style.opacity=String(.55*Q*(.92+.08*Math.sin(t/480)))),c.current){const _=dt(.26,.4,s)*Y;c.current.style.opacity=String(_),c.current.style.letterSpacing=`${(.64-.2*_).toFixed(3)}em`}}let V=0;for(let _=0;_<J.length-1;_++)V=Math.max(V,Math.max(0,1-Math.abs(P-J[_])/80)*.22);const Ct=Math.min(1,Math.max(0,(J[2]+170-P)/170));V=Math.max(V,Ct*Ct),P<J[2]&&(V=1),a.current&&(wt=ft(a.current,"opacity",Math.min(1,V).toFixed(3),wt)),h.render(o,m),V>=.995&&bt(),s<1?Z=requestAnimationFrame(St):bt()};return Z=requestAnimationFrame(St),()=>{cancelAnimationFrame(Z),b.disconnect(),nt.forEach(t=>o.remove(t)),l.forEach(t=>{o.remove(t),t.dispose()}),W.forEach(t=>t.dispose()),h.dispose(),p.parentNode===y&&y.removeChild(p),h.domElement.parentNode===y&&y.removeChild(h.domElement)}},[]),L.jsxs("div",{className:"absolute inset-0","aria-hidden":"true",children:[L.jsx("div",{ref:x,className:"absolute inset-0"}),L.jsx("div",{className:"pointer-events-none absolute inset-0",style:{background:"radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 58%, rgba(10,14,26,0.20) 100%)"}}),L.jsx("div",{ref:a,className:"pointer-events-none absolute inset-0 bg-white",style:{opacity:0}}),L.jsxs("div",{ref:M,className:"pointer-events-none absolute inset-0 select-none",style:{opacity:0,display:"grid",placeItems:"center"},children:[L.jsx("div",{ref:g,style:{position:"absolute",width:"74vmin",height:"74vmin",borderRadius:"50%",opacity:0,background:"radial-gradient(circle, rgba(255,236,200,0.5) 0%, rgba(255,214,150,0.18) 42%, rgba(255,200,130,0) 70%)"}}),L.jsxs("div",{style:{position:"relative",display:"flex",flexDirection:"column",alignItems:"center"},children:[L.jsx("img",{ref:i,src:"brand/teask-logo-hd.png",alt:"",style:{width:"min(46vw, 520px)",minWidth:"260px",willChange:"transform, filter"}}),L.jsx("div",{ref:c,className:"font-mono uppercase",style:{marginTop:"26px",opacity:0,fontSize:"11px",letterSpacing:"0.64em",paddingLeft:"0.64em",color:"rgba(255,255,255,0.88)",textShadow:"0 1px 24px rgba(10,18,32,0.65)"},children:"Tenaga Alam Sekitar Kita"})]})]})]})}export{Vt as default};
