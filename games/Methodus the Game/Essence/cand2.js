window.CANDIDATES.push({name:'ATHLETIC', make:(function(){const THREE=window.THREE;
function buildHumanoid(o){
  const M=o.mats, mk=o.mk, rig={};
  regMat('cloth',M.cloth); regMat('leather',M.leather); if(M.cloak)regMat('cloth',M.cloak);   // woven/leather texture maps land on every humanoid
  const hip=new THREE.Group(); rig.hip=hip; rig.root=hip;
  const spine=new THREE.Group(); spine.position.y=(o.spineY!=null?o.spineY:1.55); hip.add(spine); rig.spine=rig.torso=spine;
  const F=(o.gender==='f'), CW=F?1.02:1.12;   // chest width â€” women read narrower through the shoulders
  // ---- TORSO : ONE continuous lathe profile, broad shoulders tapering to the waist. No bolted-on muscle bumps. ----
  const prof=[[0,-0.365],[0.148,-0.35],[0.16,-0.24],[0.163,-0.16],[0.172,-0.04],[0.198,0.12],[0.222,0.28],[0.232,0.4],[0.212,0.485],[0.15,0.55],[0.088,0.585],[0,0.6]].map(p=>new THREE.Vector2(p[0],p[1]));
  const chest=mk(new THREE.LatheGeometry(prof,16),M.cloth,0,0,0,1); chest.scale.set(CW,1,0.78); spine.add(chest); rig.chestMesh=chest;
  {const col=mk(new THREE.CylinderGeometry(0.075,0.102,0.09,12),M.cloth,0,0.565,0); col.scale.set(1.05,1,0.9); spine.add(col);}   // subtle rolled collar
  const belt=mk(new THREE.CylinderGeometry(0.172,0.18,0.1,16),M.leather,0,-0.2,0,1); belt.scale.set(CW+0.03,1,0.81); spine.add(belt);
  spine.add(mk(new THREE.BoxGeometry(0.08,0.062,0.03),M.trim,0,-0.2,0.152));   // buckle
  if(F){ const sk=mk(new THREE.CylinderGeometry(0.175,0.31,0.52,14,1,true),M.cloth,0,-0.5,0,1); sk.scale.set(1.05,1,0.88); spine.add(sk); }   // long flared skirt tucked under the belt, falling over the hips
  else { const hem=mk(new THREE.CylinderGeometry(0.166,0.235,0.36,14,1,true),M.cloth,0,-0.4,0,1); hem.scale.set(1.12,1,0.8); spine.add(hem); }   // tunic hem â€” top radius matches the waist so there is no seam
  // ---- NECK + HEAD : clean skull-and-jaw volume; the face plane texture carries the features (no brow/cheek bumps) ----
  const neck=new THREE.Group(); neck.position.y=0.56; spine.add(neck); rig.neck=neck;
  neck.add(mk(new THREE.CylinderGeometry(0.06,0.085,0.22,10),M.skin,0,0.03,0,1));
  const head=new THREE.Group(); head.position.y=0.18; neck.add(head); rig.head=rig.headG=head;
  const skull=mk(new THREE.SphereGeometry(0.165,18,14),M.skin,0,0.045,-0.004,1); skull.scale.set(0.92,1.05,0.92); head.add(skull);
  const jaw=mk(new THREE.SphereGeometry(0.135,16,12),M.skin,0,-0.07,0.012,1); jaw.scale.set(0.88,0.82,0.9); head.add(jaw);
  {const chin=mk(new THREE.SphereGeometry(0.052,10,8),M.skin,0,-0.138,0.062); chin.scale.set(1.15,0.8,0.95); head.add(chin);}   // smooth chin bridge into the jaw
  for(const s of[-1,1]){const ear=mk(new THREE.SphereGeometry(0.034,8,6),M.skin,s*0.147,-0.004,-0.012); ear.scale.set(0.42,0.95,0.7); head.add(ear);}
  {const nose=mk(new THREE.ConeGeometry(0.017,0.055,6),M.skin,0,-0.03,0.15); nose.rotation.x=Math.PI/2-0.32; head.add(nose);}   // small subtle nose past the face plane
  // one tidy hairdo: crown cap + soft fringe + nape shell (front left open so the face plane is never occluded)
  {const cap=mk(new THREE.SphereGeometry(0.175,18,12,0,Math.PI*2,0,Math.PI*0.42),M.hair,0,0.048,-0.008,1); cap.scale.set(0.98,1.06,0.96); head.add(cap);}
  {const fr=mk(new THREE.SphereGeometry(0.085,12,8),M.hair,0,0.108,0.092); fr.scale.set(1.5,0.5,0.7); fr.rotation.x=0.3; head.add(fr);}
  {const nape=mk(new THREE.SphereGeometry(0.172,16,10,Math.PI*0.9,Math.PI*1.2,Math.PI*0.28,Math.PI*0.5),M.hair,0,0.05,-0.01,1); nape.scale.set(0.99,1.05,0.99); head.add(nape);}
  const face=mk(new THREE.PlaneGeometry(0.2,0.2),new THREE.MeshBasicMaterial({map:o.faceMap||null,transparent:true,depthWrite:false}),0,0.0,0.158); face.renderOrder=2; head.add(face); rig.face=face;
  // ---- ARMS : fitted sleeve into a tapered arm; joint balls live on the PARENT side so a 1.1-rad elbow bend never opens a gap ----
  function arm(side){
    const sh=new THREE.Group(); sh.position.set(side*0.28,0.44,0); spine.add(sh);
    {const cap=mk(new THREE.SphereGeometry(0.095,12,10),M.cloth,side*-0.012,-0.005,0,1); cap.scale.set(1.02,1.2,1); sh.add(cap);}   // tailored sleeve cap seals arm to torso
    sh.add(mk(new THREE.CylinderGeometry(0.082,0.072,0.24,10),M.cloth,0,-0.14,0,1));   // fitted short sleeve
    sh.add(mk(new THREE.CylinderGeometry(0.066,0.056,0.34,10),M.skin,0,-0.32,0,1));    // upper arm tapers to the elbow
    sh.add(mk(new THREE.SphereGeometry(0.057,10,8),M.skin,0,-0.5,0));                  // elbow ball at the pivot
    const el=new THREE.Group(); el.position.y=-0.5; sh.add(el);
    el.add(mk(new THREE.CylinderGeometry(0.054,0.043,0.36,10),M.skin,0,-0.2,0,1));     // forearm, thicker at the elbow than the wrist
    el.add(mk(new THREE.CylinderGeometry(0.058,0.05,0.15,10),M.leather,0,-0.3,0));     // slim bracer
    el.add(mk(new THREE.CylinderGeometry(0.042,0.045,0.09,8),M.skin,0,-0.43,0));       // wrist into the hand
    const hand=new THREE.Group(); hand.position.y=-0.48; el.add(hand);
    hand.add(mk(new THREE.BoxGeometry(0.076,0.092,0.042),M.skin,0,-0.02,0,1));
    for(let f2=0;f2<4;f2++){const fin=mk(new THREE.CapsuleGeometry(0.011,0.05+(f2===1||f2===2?0.012:0),3,6),M.skin,(f2-1.5)*0.02,-0.096,0.004); fin.rotation.x=0.16; hand.add(fin);}   // four fingers, middle two longer
    {const th=mk(new THREE.CapsuleGeometry(0.012,0.04,3,6),M.skin,side*-0.046,-0.03,0.017); th.rotation.z=side*-0.65; hand.add(th);}   // opposable thumb
    return {shoulder:sh,sh,forearm:el,el,hand};
  }
  rig.armR=arm(1); rig.armL=arm(-1); rig.warm=rig.armR.shoulder;
  if(o.isPlayer){ const cloak=mk(new THREE.CylinderGeometry(0.27,0.46,1.5,16,3,true,Math.PI*0.42,Math.PI*1.16),M.cloak||M.cloth,0,-0.28,-0.02,1); spine.add(cloak); rig.cloak=cloak;   // a mage's cloak down the back
    spine.add(mk(new THREE.SphereGeometry(0.035,8,8),M.trim,0,0.52,0.15)); }   // throat clasp
  // ---- LEGS : thigh > knee > ankle taper, knee ball on the parent side, high boots with a cuff ----
  function leg(side){
    const hp=new THREE.Group(); hp.position.set(side*0.12,-0.38,0); spine.add(hp);
    hp.add(mk(new THREE.SphereGeometry(0.095,10,8),M.dark,0,-0.045,0));                // hip mass hidden under the hem
    hp.add(mk(new THREE.CylinderGeometry(0.092,0.072,0.56,12),M.dark,0,-0.34,0,1));    // thigh
    hp.add(mk(new THREE.SphereGeometry(0.073,10,8),M.dark,0,-0.64,0));                 // knee ball at the pivot
    const knee=new THREE.Group(); knee.position.y=-0.64; hp.add(knee);
    knee.add(mk(new THREE.CylinderGeometry(0.068,0.052,0.3,12),M.dark,0,-0.16,0,1));   // calf tapering into the boot
    knee.add(mk(new THREE.CylinderGeometry(0.079,0.073,0.09,10),M.leather,0,-0.255,0));// boot cuff
    knee.add(mk(new THREE.CylinderGeometry(0.072,0.06,0.3,10),M.leather,0,-0.4,0,1));  // high boot shaft
    const foot=new THREE.Group(); foot.position.set(0,-0.55,0.06); knee.add(foot);
    foot.add(mk(new THREE.BoxGeometry(0.115,0.085,0.235),M.leather,0,-0.01,-0.02,1));
    {const toe=mk(new THREE.SphereGeometry(0.062,10,8),M.leather,0,-0.02,0.1,1); toe.scale.set(0.95,0.7,1.15); foot.add(toe);}   // rounded boot toe
    foot.add(mk(new THREE.BoxGeometry(0.11,0.05,0.09),M.dark,0,-0.038,-0.1));          // heel
    return {hip:hp,lowerLeg:knee,knee,foot};
  }
  rig.legR=leg(1); rig.legL=leg(-1);
  const wk=o.weapon;
  if(wk==='sword'){ const sword=new THREE.Group(); rig.armR.hand.add(sword); rig.sword=sword;
    sword.add(mk(new THREE.CylinderGeometry(0.03,0.03,0.24,8),new THREE.MeshStandardMaterial({color:0x4a2f1a}),0,0,0));
    sword.add(mk(new THREE.SphereGeometry(0.028,8,8),new THREE.MeshStandardMaterial({color:0x6b5836,metalness:0.5,roughness:0.4}),0,-0.13,0));   // pommel
    sword.add(mk(new THREE.BoxGeometry(0.26,0.05,0.06),new THREE.MeshStandardMaterial({color:0xcfd6e2,metalness:0.6,roughness:0.4}),0,0.13,0));
    rig.blade=mk(new THREE.BoxGeometry(0.07,1.0,0.025),new THREE.MeshStandardMaterial({color:0xe2ecf6,metalness:0.7,roughness:0.22}),0,0.64,0,1); sword.add(rig.blade); sword.rotation.x=1.15;
    if(o.isPlayer){ const scab=new THREE.Group(); scab.position.set(-0.31,-0.14,0.07); scab.rotation.z=0.24; spine.add(scab); rig.scabbard=scab;
      scab.add(mk(new THREE.CylinderGeometry(0.05,0.045,0.8,8),new THREE.MeshStandardMaterial({color:0x33271a,roughness:0.9}),0,-0.42,0,1));
      scab.add(mk(new THREE.SphereGeometry(0.05,8,8),new THREE.MeshStandardMaterial({color:0x6b5836,metalness:0.4,roughness:0.45}),0,-0.83,0));
      scab.add(mk(new THREE.BoxGeometry(0.2,0.045,0.06),new THREE.MeshStandardMaterial({color:0xcfd6e2,metalness:0.6,roughness:0.4}),0,-0.02,0));
      scab.add(mk(new THREE.CylinderGeometry(0.026,0.026,0.17,8),new THREE.MeshStandardMaterial({color:0x4a2f1a}),0,0.08,0)); } }
  else if(wk==='bow'){ const hand=rig.armR.hand;
    const bow=mk(new THREE.TorusGeometry(0.42,0.04,6,12,Math.PI*1.1),new THREE.MeshStandardMaterial({color:0x6a4423,roughness:0.8}),0,-0.05,0.02); bow.rotation.z=Math.PI/2; hand.add(bow);
    const nock=mk(new THREE.CylinderGeometry(0.018,0.018,0.55,5),new THREE.MeshStandardMaterial({color:0x6a4a28}),0,-0.05,0.12); nock.rotation.x=Math.PI/2; nock.visible=false; hand.add(nock); rig.warm.userData.nock=nock; }
  else if(wk==='claws'){ const hand=rig.armR.hand; for(let k=0;k<3;k++){const claw=mk(new THREE.ConeGeometry(0.04,0.3,5),new THREE.MeshStandardMaterial({color:0xddd6c2}),(k-1)*0.05,-0.12,0.02); claw.rotation.x=0.5; hand.add(claw);} }
  return rig;
}
return buildHumanoid;})()});