window.CANDIDATES.push({name:'LATHE', make:(function(){const THREE=window.THREE;
function buildHumanoid(o){
  const M=o.mats, mk=o.mk, rig={};
  const F=(o.gender==='f');
  const hip=new THREE.Group(); rig.hip=hip; rig.root=hip;
  const spine=new THREE.Group(); spine.position.y=(o.spineY!=null?o.spineY:1.55); hip.add(spine); rig.spine=rig.torso=spine;
  regMat('cloth',M.cloth); regMat('leather',M.leather); if(M.cloak)regMat('cloth',M.cloak);   // woven/leather texture maps land on every humanoid
  const TSX=F?1.02:1.12, TSZ=F?0.70:0.76;   // same skeleton, narrower cut for 'f'
  // ---- TORSO : ONE continuous lathe profile (hip flare -> waist -> chest -> shoulder slope -> standing collar). No bolted-on muscle bumps. ----
  const prof=[[0,-0.52],[0.20,-0.475],[0.235,-0.37],[0.222,-0.25],[0.202,-0.135],[0.205,-0.03],[0.228,0.12],[0.252,0.27],[0.253,0.375],[0.23,0.46],[0.16,0.505],[0.135,0.535],[0.14,0.565],[0.125,0.59],[0,0.60]];
  const chest=mk(new THREE.LatheGeometry(prof.map(p=>new THREE.Vector2(p[0],p[1])),16),M.cloth,0,0,0,1);
  chest.scale.set(TSX,1,TSZ); spine.add(chest); rig.chestMesh=chest;
  const belt=mk(new THREE.CylinderGeometry(0.218,0.235,0.11,14),M.leather,0,-0.155,0,1); belt.scale.set(TSX,1,TSZ+0.04); spine.add(belt);
  spine.add(mk(new THREE.BoxGeometry(0.075,0.07,0.035),M.trim,0,-0.155,0.235*(TSZ+0.04)+0.008));   // belt buckle
  if(F){const sk=mk(new THREE.ConeGeometry(0.32,0.6,14,1,true),M.cloth,0,-0.44,0,1);sk.scale.set(1.0,1,0.85);spine.add(sk);}   // A-line skirt
  else{const sk=mk(new THREE.CylinderGeometry(0.235,0.30,0.34,14,1,true),M.cloth,0,-0.40,0,1);sk.scale.set(1.08,1,0.8);spine.add(sk);}   // tunic hem skirt
  for(const s of[-1,1]){const rl=mk(new THREE.SphereGeometry(0.095,10,8),M.cloth,s*0.255,0.465,0,1);rl.scale.set(0.85,0.7,0.85);spine.add(rl);}   // sleeve-seam rolls: tailoring, and the stump left behind if an arm is severed
  // ---- NECK + HEAD : clean skull+jaw volume, subtle nose/ears, one sculpted hairdo. The face plane carries the features. ----
  const neck=new THREE.Group();neck.position.y=0.56;spine.add(neck);rig.neck=neck;
  neck.add(mk(new THREE.CylinderGeometry(0.062,0.085,0.22,10),M.skin,0,0,0,1));   // tapered neck rises out of the lathe collar
  const head=new THREE.Group();head.position.y=0.18;neck.add(head);rig.head=rig.headG=head;
  const skull=mk(new THREE.SphereGeometry(0.175,16,14),M.skin,0,0.035,-0.008,1);skull.scale.set(0.88,1.02,0.9);head.add(skull);   // front stays behind the face plane (z<=0.15)
  const jaw=mk(new THREE.SphereGeometry(0.15,14,12),M.skin,0,-0.07,0.02,1);jaw.scale.set(0.8,0.72,0.9);head.add(jaw);   // one rounded mandible+chin volume, no cheek bumps
  for(const s of[-1,1]){const ear=mk(new THREE.SphereGeometry(0.037,8,7),M.skin,s*0.15,-0.005,-0.01);ear.scale.set(0.4,0.95,0.7);head.add(ear);}
  {const nose=mk(new THREE.ConeGeometry(0.021,0.065,6),M.skin,0,-0.028,0.152);nose.rotation.x=Math.PI/2-0.32;head.add(nose);}   // small nose pokes just through the face plane
  const capH=mk(new THREE.SphereGeometry(0.183,16,10,0,Math.PI*2,0,Math.PI*0.42),M.hair,0,0.05,-0.02,1);capH.scale.set(0.93,1,0.93);head.add(capH);   // crown
  {const bk=mk(new THREE.SphereGeometry(0.183,16,8,Math.PI*0.75,Math.PI*1.5,Math.PI*0.34,Math.PI*0.24),M.hair,0,0.05,-0.02);bk.scale.set(0.95,1,0.95);bk.rotation.x=-0.12;head.add(bk);}   // back+side sweep, open over the face, ear lobes show
  {const fr=mk(new THREE.SphereGeometry(0.183,14,6,0,Math.PI*2,0,Math.PI*0.26),M.hair,0,0.05,-0.012);fr.scale.set(0.94,1,0.94);fr.rotation.x=0.25;head.add(fr);}   // swept fringe above the brow line â€” reads as one hairdo with the crown
  if(F){const bun=mk(new THREE.SphereGeometry(0.075,10,8),M.hair,0,0.0,-0.155);bun.scale.set(0.85,0.95,0.8);head.add(bun);}   // tied-back knot
  const face=mk(new THREE.PlaneGeometry(0.2,0.2),new THREE.MeshBasicMaterial({map:o.faceMap||null,transparent:true,depthWrite:false}),0,0.0,0.158);face.renderOrder=2;head.add(face);rig.face=face;
  // ---- ARMS : tapered cylinder chain with ball-capped joints (elbow ball sits ON the pivot so a 1.1rad bend never opens a gap) ----
  function arm(side){const sh=new THREE.Group();sh.position.set(side*0.28,0.44,0);spine.add(sh);
    {const cp=mk(new THREE.SphereGeometry(0.1,12,9),M.cloth,0,-0.005,0,1);cp.scale.set(1.02,1.18,1.02);sh.add(cp);}   // tailored sleeve head blends into the lathe shoulder
    sh.add(mk(new THREE.CylinderGeometry(0.094,0.082,0.24,10,1,true),M.cloth,0,-0.15,0,1));   // fitted short sleeve
    sh.add(mk(new THREE.CylinderGeometry(0.072,0.058,0.36,10),M.skin,0,-0.33,0,1));   // upper arm tapers toward the elbow
    sh.add(mk(new THREE.SphereGeometry(0.06,9,8),M.skin,0,-0.5,0));   // elbow ball on the pivot
    const el=new THREE.Group();el.position.y=-0.5;sh.add(el);
    el.add(mk(new THREE.CylinderGeometry(0.056,0.043,0.4,9),M.skin,0,-0.21,0,1));   // forearm tapers to the wrist
    el.add(mk(new THREE.CylinderGeometry(0.048,0.055,0.1,9),M.leather,0,-0.43,0));   // glove cuff
    const hand=new THREE.Group();hand.position.y=-0.48;el.add(hand);
    hand.add(mk(new THREE.BoxGeometry(0.08,0.095,0.045),M.skin,0,-0.02,0,1));
    for(let f=0;f<4;f++){const fin=mk(new THREE.CapsuleGeometry(0.011,0.052+(f===1||f===2?0.012:0),3,6),M.skin,(f-1.5)*0.021,-0.098,0.004);fin.rotation.x=0.16;hand.add(fin);}   // four fingers, middle two longer
    {const th=mk(new THREE.CapsuleGeometry(0.013,0.042,3,6),M.skin,side*-0.048,-0.032,0.018);th.rotation.z=side*-0.65;hand.add(th);}   // opposable thumb
    return{shoulder:sh,sh,forearm:el,el,hand};}
  rig.armR=arm(1);rig.armL=arm(-1);rig.warm=rig.armR.shoulder;
  if(o.isPlayer){ const cloak=mk(new THREE.CylinderGeometry(0.27,0.46,1.5,16,3,true,Math.PI*0.42,Math.PI*1.16),M.cloak||M.cloth,0,-0.28,-0.02,1); spine.add(cloak); rig.cloak=cloak;   // the mage's cloak down the back
    spine.add(mk(new THREE.SphereGeometry(0.035,8,8),M.trim,0,0.52,0.13)); }   // collar clasp
  // ---- LEGS : thigh > knee > ankle taper, knee ball on the pivot, high boots with a cuff ----
  function leg(side){const hp=new THREE.Group();hp.position.set(side*0.12,-0.38,0);spine.add(hp);
    hp.add(mk(new THREE.SphereGeometry(0.108,10,8),M.dark,0,-0.03,0));   // hip roundel tucked under the hem
    hp.add(mk(new THREE.CylinderGeometry(0.104,0.082,0.6,10),M.dark,0,-0.33,0,1));   // thigh
    hp.add(mk(new THREE.SphereGeometry(0.084,9,8),M.dark,0,-0.64,0));   // knee ball on the pivot
    const knee=new THREE.Group();knee.position.y=-0.64;hp.add(knee);
    knee.add(mk(new THREE.CylinderGeometry(0.078,0.05,0.42,10),M.dark,0,-0.22,0,1));   // calf tapers to the ankle
    knee.add(mk(new THREE.CylinderGeometry(0.088,0.099,0.34,10),M.leather,0,-0.40,0,1));   // high boot shaft
    knee.add(mk(new THREE.CylinderGeometry(0.104,0.106,0.08,10),M.leather,0,-0.26,0));   // rolled boot cuff
    const foot=new THREE.Group();foot.position.set(0,-0.55,0.06);knee.add(foot);
    foot.add(mk(new THREE.BoxGeometry(0.125,0.095,0.26),M.leather,0,0,-0.02,1));
    {const toe=mk(new THREE.SphereGeometry(0.068,9,8),M.leather,0,-0.012,0.115,1);toe.scale.set(0.95,0.68,1.1);foot.add(toe);}   // rounded boot toe
    foot.add(mk(new THREE.BoxGeometry(0.12,0.05,0.1),M.dark,0,-0.032,-0.1));   // heel
    return{hip:hp,lowerLeg:knee,knee,foot};}
  rig.legR=leg(1);rig.legL=leg(-1);
  // ---- WEAPONS (contract unchanged) ----
  const wk=o.weapon;
  if(wk==='sword'){const sword=new THREE.Group();rig.armR.hand.add(sword);rig.sword=sword;sword.add(mk(new THREE.CylinderGeometry(0.03,0.03,0.24,8),new THREE.MeshStandardMaterial({color:0x4a2f1a}),0,0,0));sword.add(mk(new THREE.BoxGeometry(0.26,0.05,0.06),new THREE.MeshStandardMaterial({color:0xcfd6e2,metalness:0.6,roughness:0.4}),0,0.13,0));rig.blade=mk(new THREE.BoxGeometry(0.07,1.0,0.025),new THREE.MeshStandardMaterial({color:0xe2ecf6,metalness:0.7,roughness:0.22}),0,0.64,0,1);sword.add(rig.blade);sword.rotation.x=1.15;
    if(o.isPlayer){const scab=new THREE.Group();scab.position.set(-0.31,-0.14,0.07);scab.rotation.z=0.24;spine.add(scab);rig.scabbard=scab;scab.add(mk(new THREE.CylinderGeometry(0.05,0.045,0.8,8),new THREE.MeshStandardMaterial({color:0x33271a,roughness:0.9}),0,-0.42,0,1));scab.add(mk(new THREE.SphereGeometry(0.05,8,8),new THREE.MeshStandardMaterial({color:0x6b5836,metalness:0.4,roughness:0.45}),0,-0.83,0));scab.add(mk(new THREE.BoxGeometry(0.2,0.045,0.06),new THREE.MeshStandardMaterial({color:0xcfd6e2,metalness:0.6,roughness:0.4}),0,-0.02,0));scab.add(mk(new THREE.CylinderGeometry(0.026,0.026,0.17,8),new THREE.MeshStandardMaterial({color:0x4a2f1a}),0,0.08,0));}}
  else if(wk==='bow'){const hand=rig.armR.hand;const bow=mk(new THREE.TorusGeometry(0.42,0.04,6,12,Math.PI*1.1),new THREE.MeshStandardMaterial({color:0x6a4423,roughness:0.8}),0,-0.05,0.02);bow.rotation.z=Math.PI/2;hand.add(bow);const nock=mk(new THREE.CylinderGeometry(0.018,0.018,0.55,5),new THREE.MeshStandardMaterial({color:0x6a4a28}),0,-0.05,0.12);nock.rotation.x=Math.PI/2;nock.visible=false;hand.add(nock);rig.warm.userData.nock=nock;}
  else if(wk==='claws'){const hand=rig.armR.hand;for(let k=0;k<3;k++){const claw=mk(new THREE.ConeGeometry(0.04,0.3,5),new THREE.MeshStandardMaterial({color:0xddd6c2}),(k-1)*0.05,-0.12,0.02);claw.rotation.x=0.5;hand.add(claw);}}
  return rig;
}
return buildHumanoid;})()});