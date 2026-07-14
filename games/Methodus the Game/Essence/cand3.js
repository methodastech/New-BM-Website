window.CANDIDATES.push({name:'HERO', make:(function(){const THREE=window.THREE;
function buildHumanoid(o){
  const M=o.mats, mk=o.mk, rig={};
  const hip=new THREE.Group(); rig.hip=hip; rig.root=hip;
  const spine=new THREE.Group(); spine.position.y=(o.spineY!=null?o.spineY:1.55); hip.add(spine); rig.spine=rig.torso=spine;
  regMat('cloth',M.cloth); regMat('leather',M.leather); if(M.cloak)regMat('cloth',M.cloak);   // woven/leather texture maps land on every humanoid
  const fem=(o.gender==='f');
  // ---- TORSO : ONE continuous lathe silhouette (broad chest tapering to the waist) - no bolted-on muscle bumps ----
  const prof=[[0,-0.372],[0.105,-0.365],[0.168,-0.335],[0.186,-0.26],[0.178,-0.16],[0.176,-0.06],[0.198,0.05],[0.23,0.17],[0.252,0.29],[0.255,0.37],[0.234,0.435],[0.152,0.5],[0.082,0.54],[0,0.565]].map(p=>new THREE.Vector2(p[0],p[1]));
  const chest=mk(new THREE.LatheGeometry(prof,16),M.cloth,0,0,0,1); chest.scale.set(fem?0.98:1.08,1,0.74); spine.add(chest); rig.chestMesh=chest;
  const belt=mk(new THREE.CylinderGeometry(0.196,0.202,0.1,16),M.leather,0,-0.21,0,1); belt.scale.set(fem?1.0:1.1,1,0.78); spine.add(belt);
  spine.add(mk(new THREE.BoxGeometry(0.075,0.062,0.03),M.trim,0,-0.21,0.16));   // buckle
  if(fem){ const sk=mk(new THREE.ConeGeometry(0.31,0.6,14,1,true),M.cloth,0,-0.42,0,1); sk.scale.set(1.0,1,0.85); spine.add(sk); }   // flared skirt
  else{ const hem=mk(new THREE.CylinderGeometry(0.195,0.275,0.34,14,1,true),M.cloth,0,-0.38,0,1); hem.scale.set(1.06,1,0.8); spine.add(hem); }   // fitted tunic hem
  { const sash=mk(new THREE.CylinderGeometry(0.2,0.262,0.42,10,1,true,Math.PI*1.08,Math.PI*0.8),M.dark,0,-0.41,0,1); sash.scale.set(fem?1.0:1.08,1,0.78); spine.add(sash); }   // layered half-skirt drape over the left hip
  // ---- NECK + HEAD : clean skull+jaw volume, no brow/cheek bumps - the face plane carries the features ----
  const neck=new THREE.Group(); neck.position.y=0.56; spine.add(neck); rig.neck=neck;
  neck.add(mk(new THREE.CylinderGeometry(0.062,0.084,0.2,10),M.skin,0,0,0,1));
  const head=new THREE.Group(); head.position.y=0.18; neck.add(head); rig.head=rig.headG=head;   // head world y unchanged (neck 0.56 + head 0.18 = 0.74)
  const skull=mk(new THREE.SphereGeometry(0.172,18,14),M.skin,0,0.035,0,1); skull.scale.set(0.88,1.04,0.95); head.add(skull);
  const jaw=mk(new THREE.SphereGeometry(0.138,14,12),M.skin,0,-0.07,0.016,1); jaw.scale.set(0.86,0.88,0.88); head.add(jaw);
  for(const s of[-1,1]){ const ear=mk(new THREE.SphereGeometry(0.032,8,6),M.skin,s*0.15,-0.012,-0.01); ear.scale.set(0.45,0.9,0.65); head.add(ear); }
  { const nose=mk(new THREE.ConeGeometry(0.019,0.06,6),M.skin,0,-0.032,0.163); nose.rotation.x=Math.PI/2-0.28; head.add(nose); }   // small subtle nose
  { const cap=mk(new THREE.SphereGeometry(0.184,18,12,0,Math.PI*2,0,Math.PI*0.57),M.hair,0,0.05,-0.01,1); cap.scale.set(0.93,1.02,0.99); head.add(cap);   // hair cap
    const nape=mk(new THREE.SphereGeometry(0.115,12,8),M.hair,0,-0.03,-0.112); nape.scale.set(1.16,fem?1.5:1.05,0.6); head.add(nape);                      // nape mass ('f' wears it longer)
    const fr=mk(new THREE.SphereGeometry(0.125,12,8),M.hair,0.036,0.108,0.096); fr.scale.set(1.26,0.46,0.72); fr.rotation.set(0.32,0,-0.22); head.add(fr); }   // ONE swept fringe
  const face=mk(new THREE.PlaneGeometry(0.2,0.2),new THREE.MeshBasicMaterial({map:o.faceMap||null,transparent:true,depthWrite:false}),0,0.0,0.158); face.renderOrder=2; head.add(face); rig.face=face;
  // ---- ARMS : fitted sleeve -> tapered bare forearm -> leather bracer; elbow ball keeps the joint sealed at full bend ----
  function arm(side){ const sh=new THREE.Group(); sh.position.set(side*0.28,0.44,0); spine.add(sh);
    const delt=mk(new THREE.SphereGeometry(0.088,12,10),M.cloth,0,-0.015,0,1); delt.scale.set(1.02,1.18,1.02); sh.add(delt);   // sleeve cap, radius matched to the upper arm
    sh.add(mk(new THREE.CapsuleGeometry(0.068,0.4,5,10),M.cloth,0,-0.26,0,1));   // upper-arm sleeve, rounded cap overlaps the elbow pivot
    if(side===1){ const pd=mk(new THREE.SphereGeometry(0.118,14,10,0,Math.PI*2,0,Math.PI*0.62),M.leather,0,0.05,0,1); pd.scale.set(1.03,0.8,1.03); sh.add(pd);
      const rim=mk(new THREE.TorusGeometry(0.104,0.011,6,14),M.trim,0,0.004,0); rim.rotation.x=Math.PI/2; sh.add(rim); }   // ONE modest right pauldron + trim rim
    const el=new THREE.Group(); el.position.y=-0.5; sh.add(el);
    el.add(mk(new THREE.SphereGeometry(0.062,10,8),M.skin,0,-0.004,0));   // elbow ball rides the pivot so the bend never gaps
    el.add(mk(new THREE.CylinderGeometry(0.06,0.045,0.36,10),M.skin,0,-0.225,0,1));   // forearm tapers to the wrist
    el.add(mk(new THREE.CylinderGeometry(0.061,0.053,0.16,10),M.leather,0,-0.35,0));   // bracer
    const hand=new THREE.Group(); hand.position.y=-0.48; el.add(hand);
    hand.add(mk(new THREE.BoxGeometry(0.078,0.092,0.046),M.skin,0,-0.025,0,1));
    for(let f=0;f<4;f++){ const fin=mk(new THREE.CapsuleGeometry(0.011,0.052+(f===1||f===2?0.012:0),3,6),M.skin,(f-1.5)*0.021,-0.098,0.004); fin.rotation.x=0.16; hand.add(fin); }   // four fingers, middle two longer
    { const th=mk(new THREE.CapsuleGeometry(0.013,0.042,3,6),M.skin,side*-0.048,-0.036,0.016); th.rotation.z=side*-0.65; hand.add(th); }   // opposable thumb
    return{shoulder:sh,sh,forearm:el,el,hand}; }
  rig.armR=arm(1); rig.armL=arm(-1); rig.warm=rig.armR.shoulder;
  if(o.isPlayer){ const cloak=mk(new THREE.CylinderGeometry(0.27,0.46,1.5,16,3,true,Math.PI*0.42,Math.PI*1.16),M.cloak||M.cloth,0,-0.28,-0.02,1); spine.add(cloak); rig.cloak=cloak;   // cloak down the back
    spine.add(mk(new THREE.SphereGeometry(0.033,8,8),M.trim,0,0.5,0.16)); }   // throat clasp
  // ---- LEGS : thigh > knee > ankle taper, knee ball on the pivot, knee-high boots with a folded cuff ----
  function leg(side){ const hp=new THREE.Group(); hp.position.set(side*0.12,-0.38,0); spine.add(hp);
    const gl=mk(new THREE.SphereGeometry(0.1,12,10),M.dark,0,-0.06,-0.005,1); gl.scale.set(1.06,1.12,1.0); hp.add(gl);   // hip mass rounds the thigh into the hem
    hp.add(mk(new THREE.CylinderGeometry(0.092,0.074,0.52,12),M.dark,0,-0.34,0,1));   // thigh, end radius matched to the knee ball
    const knee=new THREE.Group(); knee.position.y=-0.64; hp.add(knee);
    knee.add(mk(new THREE.SphereGeometry(0.075,10,8),M.dark,0,0,0,1));   // knee ball seals the joint through the walk-cycle bend
    knee.add(mk(new THREE.CylinderGeometry(0.07,0.05,0.42,10),M.dark,0,-0.24,0,1));   // tapered shin
    knee.add(mk(new THREE.CylinderGeometry(0.058,0.075,0.34,10),M.leather,0,-0.38,0,1));   // high boot shaft
    knee.add(mk(new THREE.CylinderGeometry(0.085,0.079,0.08,10),M.leather,0,-0.225,0));    // folded cuff just under the knee
    const foot=new THREE.Group(); foot.position.set(0,-0.55,0.06); knee.add(foot);
    foot.add(mk(new THREE.BoxGeometry(0.115,0.088,0.25),M.leather,0,-0.004,-0.02,1));
    { const toe=mk(new THREE.SphereGeometry(0.06,10,8),M.leather,0,-0.016,0.108,1); toe.scale.set(0.95,0.66,1.08); foot.add(toe); }   // rounded boot toe
    foot.add(mk(new THREE.BoxGeometry(0.11,0.05,0.09),M.dark,0,-0.03,-0.095));   // heel
    return{hip:hp,lowerLeg:knee,knee,foot}; }
  rig.legR=leg(1); rig.legL=leg(-1);
  const wk=o.weapon;
  if(wk==='sword'){ const sword=new THREE.Group(); rig.armR.hand.add(sword); rig.sword=sword;
    sword.add(mk(new THREE.CylinderGeometry(0.028,0.03,0.24,8),new THREE.MeshStandardMaterial({color:0x4a2f1a,roughness:0.85}),0,0,0));
    sword.add(mk(new THREE.SphereGeometry(0.034,8,8),new THREE.MeshStandardMaterial({color:0x6b5836,metalness:0.4,roughness:0.45}),0,-0.13,0));
    sword.add(mk(new THREE.BoxGeometry(0.26,0.045,0.055),new THREE.MeshStandardMaterial({color:0xcfd6e2,metalness:0.6,roughness:0.4}),0,0.13,0));
    rig.blade=mk(new THREE.BoxGeometry(0.07,1.0,0.025),new THREE.MeshStandardMaterial({color:0xe2ecf6,metalness:0.7,roughness:0.22}),0,0.64,0,1); sword.add(rig.blade);
    sword.rotation.x=1.15;
    if(o.isPlayer){ const scab=new THREE.Group(); scab.position.set(-0.31,-0.14,0.07); scab.rotation.z=0.24; spine.add(scab); rig.scabbard=scab;
      scab.add(mk(new THREE.CylinderGeometry(0.05,0.045,0.8,8),new THREE.MeshStandardMaterial({color:0x33271a,roughness:0.9}),0,-0.42,0,1));
      scab.add(mk(new THREE.SphereGeometry(0.05,8,8),new THREE.MeshStandardMaterial({color:0x6b5836,metalness:0.4,roughness:0.45}),0,-0.83,0));
      scab.add(mk(new THREE.BoxGeometry(0.2,0.045,0.06),new THREE.MeshStandardMaterial({color:0xcfd6e2,metalness:0.6,roughness:0.4}),0,-0.02,0));
      scab.add(mk(new THREE.CylinderGeometry(0.026,0.026,0.17,8),new THREE.MeshStandardMaterial({color:0x4a2f1a}),0,0.08,0)); } }
  else if(wk==='bow'){ const hand=rig.armR.hand;
    const bow=mk(new THREE.TorusGeometry(0.42,0.04,6,12,Math.PI*1.1),new THREE.MeshStandardMaterial({color:0x6a4423,roughness:0.8}),0,-0.05,0.02); bow.rotation.z=Math.PI/2; hand.add(bow);
    const nock=mk(new THREE.CylinderGeometry(0.018,0.018,0.55,5),new THREE.MeshStandardMaterial({color:0x6a4a28}),0,-0.05,0.12); nock.rotation.x=Math.PI/2; nock.visible=false; hand.add(nock); rig.warm.userData.nock=nock; }
  else if(wk==='claws'){ const hand=rig.armR.hand; for(let k=0;k<3;k++){ const claw=mk(new THREE.ConeGeometry(0.04,0.3,5),new THREE.MeshStandardMaterial({color:0xddd6c2}),(k-1)*0.05,-0.12,0.02); claw.rotation.x=0.5; hand.add(claw); } }
  return rig;
}
return buildHumanoid;})()});