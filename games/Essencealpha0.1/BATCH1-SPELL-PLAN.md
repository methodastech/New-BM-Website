# BATCH 1: SPELL SYSTEM ALIGNMENT (frozen patch script, execute as written)

Mission: align ESSENCE ALPHA 0.1 with the Bonefield Game System Spec v1.0 per the locked rulings.
This file is a self contained patch script: every edit below is an exact OLD → NEW string pair,
verified against the files on 2026-07-11. Execute with Edit calls. Do NOT re-read whole files.

## Execution protocol (token discipline)

1. Apply patches in order, per file. Each OLD string is unique in its file.
2. Line numbers are hints only; the strings are the truth. If an Edit misses, grep a short
   fragment of the OLD string, fix the anchor, continue. Do not re-read large ranges.
3. Game code style: dense one-liners, em-dash banner voice, sparse comments. Keep it.
4. Hard constraints: never touch the rig contract (`buildSkeleton`, joint pivots, rig keys);
   file stays a valid single-file ES-module game; zero console errors.
5. After all patches: run the verification list (§V) with the browser preview tools.

## Locked rulings (context, do not relitigate)

Tier ladder D/C/B stays (×1/1.7/2.5, costs 10/12/14). One-bar essence economy stays. New content
caps at C; existing B content untouched (B chants, Raise Dead B-only). Fire Spear renamed FIRE
ARROW (internal key `firespear` KEPT). Water Prison CUT. Flamethrower unlock C (was B), tier
scaled. New spells: Cyclone (wind C), Bone Cage (death C), Heal (grace D, +20/34/50 HP).
Fireball fragments 4×10 at C, 6×12 at B. Slash blades 1/2/3. Bone Wall HP 80/120/175, the risen
batter it. Active-magic HUD while kindled. Batch 2 later: thunder fusion, charcoal, water fells
trees, melee stops chopping.

---

# FILE 1: `💀 Bonefield Arena/index.html` (the game)

## G1. ELEMENTS form lists (~line 604-608), 3 edits

- OLD: `chant:'spirits of death', forms:['bonespear','bonewall','raisedead']}`
  NEW: `chant:'spirits of death', forms:['bonespear','bonewall','bonecage','raisedead']}`
- OLD: `chant:'spirits of wind', forms:['galeslash','gust']}`
  NEW: `chant:'spirits of wind', forms:['galeslash','gust','cyclone']}`
- OLD: `chant:'spirits of grace', forms:['mend','restoration']} };`
  NEW: `chant:'spirits of grace', forms:['mend','restoration','heal']} };`

## G2. FORMS table (~line 609-614), 4 edits

- OLD: `firespear:{name:'FIRE SPEAR', dmg:20}, flamethrower:{name:'FLAMETHROWER', dmg:16, tierLock:3},`
  NEW: `firespear:{name:'FIRE ARROW', dmg:20}, flamethrower:{name:'FLAMETHROWER', dmg:16, tierLock:2},`
- OLD: `bonewall:{name:'BONE WALL', dmg:0},`
  NEW: `bonewall:{name:'BONE WALL', dmg:0}, bonecage:{name:'BONE CAGE', dmg:0, tierLock:2},`
- OLD: `galeslash:{name:'SLASH', dmg:22}, gust:{name:'GUST', dmg:10},`
  NEW: `galeslash:{name:'SLASH', dmg:22}, gust:{name:'GUST', dmg:10}, cyclone:{name:'CYCLONE', dmg:28, tierLock:2},`
  (28 × 1.7 ≈ 48 at C, × 2.5 = 70 at B; spec says 48/72, accepted fit on the locked ladder)
- OLD: `mend:{name:'MEND', dmg:30}, restoration:{name:'RESTORATION', dmg:16} };`
  NEW: `mend:{name:'MEND', dmg:30}, restoration:{name:'RESTORATION', dmg:16}, heal:{name:'HEAL', dmg:0} };`

## G3. Word maps (~line 1039-1041), 3 edits

- OLD: `raise:'raise',rise:'raise'};`
  NEW: `raise:'raise',rise:'raise',arrow:'arrow',cyclone:'cyclone',cage:'cage',heal:'heal'};`
- OLD (full line): `const FORM_RESOLVE={fire:{ball:'fireball',spear:'firespear',flamethrower:'flamethrower'},water:{geyser:'geyser',torrent:'torrent'},death:{spear:'bonespear',wall:'bonewall',raise:'raisedead'},wind:{gale:'galeslash',gust:'gust'},grace:{mend:'mend',restoration:'restoration'}};`
  NEW: `const FORM_RESOLVE={fire:{ball:'fireball',arrow:'firespear',flamethrower:'flamethrower'},water:{geyser:'geyser',torrent:'torrent'},death:{spear:'bonespear',wall:'bonewall',cage:'bonecage',raise:'raisedead'},wind:{gale:'galeslash',gust:'gust',cyclone:'cyclone'},grace:{mend:'mend',restoration:'restoration',heal:'heal'}};   // "spear" belongs to death alone now; fire answers to "arrow"`
- OLD: `const FORM_HOME={ball:'fire',flamethrower:'fire',geyser:'water',torrent:'water',spear:'death',wall:'death',raise:'death',gale:'wind',gust:'wind',mend:'grace',restoration:'grace'};`
  NEW: `const FORM_HOME={ball:'fire',arrow:'fire',flamethrower:'fire',geyser:'water',torrent:'water',spear:'death',wall:'death',cage:'death',raise:'death',gale:'wind',gust:'wind',cyclone:'wind',mend:'grace',restoration:'grace',heal:'grace'};`

`VOCAB` merges FORM_WORDS automatically; `arrow/cyclone/cage/heal` collide with nothing.
Preserved yield behavior (no code change): "spear" over a fire-D rite yields to death and casts
bone spear; over an invested fire-C rite it is refused (riteHold).

## G4. Bone Cage pre-check inside `castSpell` (~line 677)

After this line (keep it, add a new line below it):
OLD: `if(form==='flamethrower'&&P.flameT>0){ banner('the flames already rage — let them burn out first','#8fa0c0'); return false; }   // refuse a re-kindle mid-channel: otherwise re-tiering to B and recasting before the ~1.15s burn expires chain-refreshes it indefinitely`
NEW (append below):
```js
  if(form==='bonecage'){ P._cageTgt=homingTarget(aimDir(),null); if(!P._cageTgt){ banner('no foe to cage — the stakes need a prisoner','#8fa0c0'); return false; } }   // refused before the rite is spent, like the tier refusals
```

## G5. New cast branches (~line 766, end of the torrent branch)

Insert-after pattern. OLD (this exact line, unique, the torrent branch's last line):
```js
    for(const dm of dummies){ if(!dm.dead&&push(dm.g.position.x,dm.g.position.z,false))hurtDummy(dm,dmg,'#9fd0ff'); } }
```
NEW (same line, then the three branches appended after it):
```js
    for(const dm of dummies){ if(!dm.dead&&push(dm.g.position.x,dm.g.position.z,false))hurtDummy(dm,dmg,'#9fd0ff'); } }
  else if(form==='cyclone'){ let cx,cz,chit=false;   // C+: the sky grabs the pack at your aim and holds it aloft ~2s — the lift IS the punish window
    const s0=camera.position.distanceTo(player.position)+0.5;
    for(let s=s0;s<40;s+=0.5){ const x=camera.position.x+dir.x*s, y=camera.position.y+dir.y*s, z=camera.position.z+dir.z*s;
      if(y<=terrainH(x,z)+0.9){ cx=x; cz=z; chit=true; break; } }
    if(!chit){ cx=camera.position.x+dir.x*24; cz=camera.position.z+dir.z*24; }
    const cd2=Math.hypot(cx-player.position.x,cz-player.position.z);
    if(cd2>32){ const s2=32/cd2; cx=player.position.x+(cx-player.position.x)*s2; cz=player.position.z+(cz-player.position.z)*s2; }
    SFX.wall(); addShake(0.25); flash(0.08); ring(cx,terrainH(cx,cz)+0.15,cz,0xbfe6a0,5);
    for(let i2=0;i2<24;i2++){ const sa=R(0,6.283),sd=R(0.5,5); burst(cx+Math.sin(sa)*sd,terrainH(cx,cz)+R(0.3,2.6),cz+Math.cos(sa)*sd,0xd9f0b0,1,2.2,3.4,0.5); }
    for(const e of foes){ if(e.dead)continue; const dd=Math.hypot(e.g.position.x-cx,e.g.position.z-cz); if(dd>5)continue;
      hurtFoe(e,dmg,'#bfe6a0'); e.stun=Math.max(e.stun,2); e.liftT=2;
      const pk=(1-dd/5)*3; e.kx+=(cx-e.g.position.x)/Math.max(dd,0.001)*pk; e.kz+=(cz-e.g.position.z)/Math.max(dd,0.001)*pk; } }
  else if(form==='bonecage'){ const ct=P._cageTgt; P._cageTgt=null;   // C+: a ring of grave stakes imprisons ONE foe — it batters its way out
    const bx=ct.g.position.x, bz=ct.g.position.z, by=terrainH(bx,bz);
    SFX.wall(); addShake(0.22); const wg=new THREE.Group();
    for(let i2=0;i2<10;i2++){ const aa=i2/10*6.283; const st=box(0.2,1.9+R(-0.15,0.25),0.2,M.bone,0,0,0);
      st.position.set(Math.sin(aa)*1.6,0.8,Math.cos(aa)*1.6); st.rotation.z=R(-0.08,0.08); st.rotation.y=aa; wg.add(st); }
    wg.position.set(bx,by,bz); wg.scale.y=0.05; scene.add(wg);
    walls.push({g:wg,x:bx,z:bz,life:10+tr,grow:0.18,r:1.6,hp:(tr===2?150:220),keepIn:true});   // spec durability C 150 · B 220
    burst(bx,by+0.4,bz,0xd9d2c0,14,2.4,3,0.5); ring(bx,by+0.1,bz,0xbfe8c8,2.2);
    banner('the stakes rise — the cage holds while it stands','#e8e2d0'); }
  else if(form==='heal'){ const amt=[0,20,34,50][tr]; P.hp=Math.min(P.maxHp,P.hp+amt); updateHud();   // the spec's Life table, D/C/B slice — grace finally mends flesh, not just timber
    SFX.kindle(); ring(player.position.x,player.position.y+0.15,player.position.z,0x8cf0aa,2.5);
    for(let i2=0;i2<14;i2++){ const sa=R(0,6.283),sd=R(0.3,1.2); burst(player.position.x+Math.sin(sa)*sd,player.position.y+R(0.4,1.8),player.position.z+Math.cos(sa)*sd,0x8cf0aa,1,1.6,2.2,0.5); }
    banner('the flesh knits — +'+amt+' health','#8cf0aa'); }
```
(The existing `if(tr>=3){ stopT=... }` line that follows in the file stays untouched below the
inserted branches.)

## G6. Slash blades 1/2/3 (replace the whole `galeslash` branch, ~line 699-707)

OLD (branch start): `else if(form==='galeslash'){ const yaw=Math.atan2(fly.x,fly.z);   // an instant cutting wedge: fells trees for wood, cuts foes too`
Replace the ENTIRE branch (through the `hitCone(...)` line ending `'#bfe6a0'); }`) with:
```js
  else if(form==='galeslash'){ const yaw=Math.atan2(fly.x,fly.z), nB=tr;   // blades 1/2/3 with tier, the spec's multi-blade rows — each cut fells trees for wood
    SFX.crack(); addShake(0.15+tr*0.05); flash(0.08);
    for(let i=0;i<8+tr*4;i++){ const rr=R(0.6,3.2+tr*0.6), aa=yaw+R(-0.32,0.32);
      burst(tip.x+Math.sin(aa)*rr,tip.y+R(-0.3,0.6),tip.z+Math.cos(aa)*rr,0xd9f0b0,1,2.6,2,0.35); }
    for(let b2=0;b2<nB;b2++){ const yb=yaw+(b2-(nB-1)/2)*0.4;   // the FAN is the tier's width now; each blade keeps the tight arc
      const gp=new THREE.Group(); gp.position.set(player.position.x+Math.sin(yb)*1.4,player.position.y+1.15,player.position.z+Math.cos(yb)*1.4); gp.rotation.y=yb;
      const cm=new THREE.Mesh(new THREE.TorusGeometry(1.5+tr*0.5,0.08+tr*0.025,5,20,2.4),new THREE.MeshBasicMaterial({color:0xbfe6a0,transparent:true,opacity:0.85,side:THREE.DoubleSide}));
      cm.rotation.x=Math.PI/2-0.22; cm.rotation.z=0.35; gp.add(cm); scene.add(gp);
      slashes.push({g:gp,m:cm,life:0.3,max:0.3,grow:1.6+tr*0.6});
      hitCone(tip.x,tip.z,yb,3.5+tr*1.2,0.28,dmg,5,'#bfe6a0'); } }
```

## G7. Flamethrower C unlock, tier scaled (2 edits)

- Cast branch (~line 697):
  OLD: `else if(form==='flamethrower'){ P.flameT=1.15; P.flameTick=0; SFX.boom(); addShake(0.3); flash(0.15);   // tier B only — a sustained cone burn you can sweep across the pack`
  NEW: `else if(form==='flamethrower'){ P.flameT=1.15; P.flameTick=0; P.flameTr=tr; SFX.boom(); addShake(0.3); flash(0.15);   // C+: a sustained cone burn you can sweep across the pack — hotter and further at B`
- Channel tick (~line 1451):
  OLD: `if(P.flameTick<=0){ P.flameTick=0.1; hitCone(ftip.x,ftip.z,fyaw,8.5,0.46,FORMS.flamethrower.dmg*TIER_MULT[3]*WPN[weapon].dmg,4,'#ff5a12'); addShake(0.06); if(Math.random()<0.4)SFX.crack(); }`
  NEW: `if(P.flameTick<=0){ P.flameTick=0.1; hitCone(ftip.x,ftip.z,fyaw,(P.flameTr===2?8.5:10.5),0.46,FORMS.flamethrower.dmg*TIER_MULT[P.flameTr||3]*WPN[weapon].dmg,4,'#ff5a12'); addShake(0.06); if(Math.random()<0.4)SFX.crack(); }`
  Then rewrite the trailing comment on that line to: `// the channel scales by the tier it was cast at (C or B) — computed independently of castSpell's dmg`

## G8. Fireball fragments at C (~line 1638-1642, projectile impact block)

- OLD: `if(pr.tr>=3&&(hit||py<=terrainH(px,pz)+1.5)){ const n=4+(Math.random()<0.5?0:1);   // tier B: the blast births 4-5 real, visible smaller fireballs that arc outward and blow again where they land`
  NEW: `if(pr.tr>=2&&(hit||py<=terrainH(px,pz)+1.5)){ const n=pr.tr>=3?6:4;   // spec fragments — C births 4×10, B births 6×12: real, visible smaller fireballs that arc outward and blow again where they land`
- OLD: `projectiles.push({m:mm,vx:Math.sin(sa)*sp3,vy:R(4.5,7.5),vz:Math.cos(sa)*sp3,kind:'fire',dmg:pr.dmg*0.35,blast:1.2,life:2.4,grav:9,tr:0}); } } }   // tr:0 — the children never splatter again, no infinite chain`
  NEW: `projectiles.push({m:mm,vx:Math.sin(sa)*sp3,vy:R(4.5,7.5),vz:Math.cos(sa)*sp3,kind:'fire',dmg:pr.tr>=3?12:10,blast:1.2,life:2.4,grav:9,tr:0}); } } }   // tr:0 — the children never splatter again, no infinite chain · fragment damage is the spec's flat 10/12`

Note: `fireSplat`/`bolts kind:'splat'` (~line 670, 1643) is already dead code (nothing pushes
splat bolts); leave it untouched.

## G9. Bone Wall HP (~line 744)

OLD: `walls.push({g:wg,x:wx,z:wz,life:6+tr,grow:0.18,r:0.55*half+0.9});   // r: blocking radius grows with the span; longer chants also stand a little longer`
NEW: `walls.push({g:wg,x:wx,z:wz,life:6+tr,grow:0.18,r:0.55*half+0.9,hp:[0,80,120,175][tr]});   // spec durability D 80 · C 120 · B 175 — the risen batter it down like any door; r: blocking radius grows with the span`

## G10. Wall damage helper (insert after `geyserStrike`, ~line 774, before the `// ---------- melee` comment)

OLD: `  hitArea(b.x,b.z,3+b.c,b.dmg,1.1,'#9fd0ff'); }`
NEW:
```js
  hitArea(b.x,b.z,3+b.c,b.dmg,1.1,'#9fd0ff'); }
function damageWallAt(x,z,dmg){ for(let i=walls.length-1;i>=0;i--){ const w=walls[i]; if(w.hp===undefined)continue;   // only rites with durability can be battered — walls and cages
  if(Math.hypot(w.x-x,w.z-z)<(w.r||1.6)+0.9){ w.hp-=dmg; burst(w.x,terrainH(w.x,w.z)+0.9,w.z,0xd9d2c0,3,1.6,1.6,0.3); SFX.rattle();
    if(w.hp<=0){ burst(w.x,terrainH(w.x,w.z)+0.6,w.z,0xd9d2c0,16,2.6,3,0.6); SFX.crack(); scene.remove(w.g); w.g.children.forEach(c=>c.geometry.dispose()); walls.splice(i,1); }
    return true; } } return false; }
```

## G11. The risen batter bone (2 edits)

- Batter branch (~line 1546):
  OLD: `else{ const bp=nearestPieceTo(e.g.position.x+Math.sin(e.g.rotation.y)*1.1,e.g.position.z+Math.cos(e.g.rotation.y)*1.1,1.8,e.g.position.y); if(bp)damagePiece(bp,A.door); } } }   // blocked: batter the door — or, Valheim-style, the wall itself`
  NEW: `else{ const bp=nearestPieceTo(e.g.position.x+Math.sin(e.g.rotation.y)*1.1,e.g.position.z+Math.cos(e.g.rotation.y)*1.1,1.8,e.g.position.y); if(bp)damagePiece(bp,A.door); else damageWallAt(e.g.position.x+Math.sin(e.g.rotation.y)*1.1,e.g.position.z+Math.cos(e.g.rotation.y)*1.1,A.door); } } }   // blocked: batter the door, the built wall — or the BONE rampart itself`
- Cage containment, foe-vs-wall push (~line 1533):
  OLD: `for(const w of walls){ const wx=e.g.position.x-w.x,wz=e.g.position.z-w.z,wd=Math.hypot(wx,wz); if(wd<1.5&&wd>0.001){ const pu=1.5-wd; e.g.position.x+=wx/wd*pu; e.g.position.z+=wz/wd*pu; } }   // knockback cannot hurl foes through bone walls`
  NEW: `for(const w of walls){ const wx=e.g.position.x-w.x,wz=e.g.position.z-w.z,wd=Math.hypot(wx,wz); if(w.keepIn){ if(wd>(w.r-0.35)&&wd>0.001){ const pu=wd-(w.r-0.35); e.g.position.x-=wx/wd*pu; e.g.position.z-=wz/wd*pu; } } else if(wd<1.5&&wd>0.001){ const pu=1.5-wd; e.g.position.x+=wx/wd*pu; e.g.position.z+=wz/wd*pu; } }   // knockback cannot hurl foes through bone walls — and a caged foe stays caged`
- Steering loop (~line 1554): add `if(w.keepIn)continue; ` right after the `{` so caged foes do not fight their prison every frame:
  OLD: `for(const w of walls){ const wr=(w.r||1.7)+0.1, wx=e.g.position.x-w.x,wz=e.g.position.z-w.z,wd=Math.hypot(wx,wz); if(wd<wr&&wd>0.001){ mvx+=wx/wd*1.6; mvz+=wz/wd*1.6; } }`
  NEW: `for(const w of walls){ if(w.keepIn)continue; const wr=(w.r||1.7)+0.1, wx=e.g.position.x-w.x,wz=e.g.position.z-w.z,wd=Math.hypot(wx,wz); if(wd<wr&&wd>0.001){ mvx+=wx/wd*1.6; mvz+=wz/wd*1.6; } }`

## G12. Cyclone lift (2 edits)

- Foe spawn (~line 990): OLD: `cd:R(0.5,1.5),stun:0,hurtF:0,` NEW: `cd:R(0.5,1.5),stun:0,liftT:0,hurtF:0,`
- Ground clamp (~line 1588):
  OLD: `    e.g.position.y=surfaceH(e.g.position.x,e.g.position.z,e.g.position.y);`
  NEW: `    if(e.liftT>0){ e.liftT-=dt; e.g.position.y=surfaceH(e.g.position.x,e.g.position.z,e.g.position.y)+1.4+Math.sin(e.liftT*9)*0.15; if(Math.random()<0.3)burst(e.g.position.x,e.g.position.y+R(0,1),e.g.position.z,0xd9f0b0,1,1.2,1.2,0.25); } else e.g.position.y=surfaceH(e.g.position.x,e.g.position.z,e.g.position.y);`
  (This OLD occurs for the FOE update; confirm the match is inside the foes loop, near the
  `eyeMat.color.setHex` telegraph line that follows it. If the string matches elsewhere first,
  anchor with the following line included.)

## G13. Active-magic HUD (3 edits)

- CSS: append after the `#heard{...}` rule (~line 31):
  `#riteHud{position:fixed;left:50%;bottom:118px;transform:translateX(-50%);z-index:6;pointer-events:none;font:20px "VT323","Courier New",monospace;color:#cfe0ff;letter-spacing:1px;text-shadow:0 0 12px rgba(150,190,255,.6),0 2px 4px #000;display:none;white-space:nowrap;}`
- DOM: OLD: `<div id="spells"></div>` NEW: `<div id="spells"></div>`+newline+`<div id="riteHud"></div>`
- JS, end of `updateChips` (~line 643):
  OLD: `d.querySelector('small').textContent=FORMS[selForm[k]].name; }); }   // no digit hints — the numbers belong to the belt now`
  NEW:
```js
  d.querySelector('small').textContent=FORMS[selForm[k]].name; });
  const rh=document.getElementById('riteHud');   // the kindled rite made visible: what you hold, and every name it will answer to — no casting from memory
  if(kindled){ rh.style.display='block'; rh.innerHTML='<b style="color:'+ELEMENTS[kindled].col+'">'+ELEMENTS[kindled].name+' · '+TIER_NAME[tier]+'</b> — say '+ELEMENTS[kindled].forms.map(f=>(FORMS[f].tierLock&&tier<FORMS[f].tierLock)?'<span style="opacity:.35">'+FORMS[f].name+'</span>':FORMS[f].name).join(' · '); }
  else rh.style.display='none'; }   // no digit hints — the numbers belong to the belt now
```

## G14. Spellbook overlay `#spellbook` (~line 136-160), 8 edits

- OLD: `<div class="sbForms"><b>FIREBALL</b> — hurled blast · 26 · at B the blast births smaller fireballs over the area</div>`
  NEW: `<div class="sbForms"><b>FIREBALL</b> — hurled blast · 26 · at C the blast births 4 smaller fireballs, at B six</div>`
- OLD: `<div class="sbForms"><b>FIRE SPEAR</b> — homing bolts · 20 · volley grows 1 / 3 / 6 with tier</div>`
  NEW: `<div class="sbForms"><b>FIRE ARROW</b> — homing bolts · 20 · volley grows 1 / 3 / 6 with tier</div>`
- OLD: `<div class="sbForms"><b>FLAMETHROWER</b> — B ONLY · sweeping fire cone · 16 a tick</div>`
  NEW: `<div class="sbForms"><b>FLAMETHROWER</b> — needs C · sweeping fire cone · 16 a tick · hotter and further at B</div>`
- OLD: `<div class="sbForms"><b>BONE WALL</b> — bone barricade · widens 5 / 7 / 9 stakes with tier</div>`
  NEW: `<div class="sbForms"><b>BONE WALL</b> — bone barricade · widens 5 / 7 / 9 stakes · takes 80 / 120 / 175 battering by tier</div>`+newline+`  <div class="sbForms"><b>BONE CAGE</b> — needs C · stakes imprison one foe until battered down</div>`
- OLD: `<div class="sbForms"><b>SLASH</b> — cutting wind crescent · 22 · fells trees, cracks rock, arc widens</div>`
  NEW: `<div class="sbForms"><b>SLASH</b> — cutting wind blades 1 / 2 / 3 with tier · 22 · fells trees, cracks rock</div>`
- OLD: `<div class="sbForms"><b>GUST</b> — pure knockback · the wedge fans wider and further each tier</div>`
  NEW: `<div class="sbForms"><b>GUST</b> — pure knockback · the wedge fans wider and further each tier</div>`+newline+`  <div class="sbForms"><b>CYCLONE</b> — needs C · lifts the pack skyward ~2s · 28</div>`
- OLD: `<div class="sbForms"><b>RESTORATION</b> — repair pulse over radius 6 / 8 / 10 · 16</div>`
  NEW: `<div class="sbForms"><b>RESTORATION</b> — repair pulse over radius 6 / 8 / 10 · 16</div>`+newline+`  <div class="sbForms"><b>HEAL</b> — knits your own flesh · 20 / 34 / 50 health by tier</div>`
- RAISE DEAD line: unchanged (stays B ONLY).

## G15. Pause-menu codex cards `#codex .fm` (~line 184-211), 7 edits

- OLD: `<div class="fm"><b>FIREBALL</b> — a hurled orb that bursts, blast widens each tier. at <b>B</b> the impact splatters into 3-4 smaller fireballs.<br>D 26 · C 44 · B 65 + splatter</div>`
  NEW: `<div class="fm"><b>FIREBALL</b> — a hurled orb that bursts, blast widens each tier. at <b>C</b> the impact splatters into 4 smaller fireballs, at <b>B</b> six.<br>D 26 · C 44 + 4×10 · B 65 + 6×12</div>`
- OLD: `<div class="fm"><b>FIRE SPEAR</b> — homing darts that hunt the pack. <b>D</b> looses 1 · <b>C</b> looses 3 · <b>B</b> looses 6, each hitting harder.<br>D 20×1 · C 34×3 · B 50×6</div>`
  NEW: same but `<b>FIRE ARROW</b>` instead of `<b>FIRE SPEAR</b>`
- OLD: `<div class="fm"><b>FLAMETHROWER</b> — <b>B ONLY</b>: a sustained cone of fire you sweep across the field. very big, very strong — chant all the way to B before naming it, or it refuses.<br>~40/tick for ~1.1s</div>`
  NEW: `<div class="fm"><b>FLAMETHROWER</b> — needs <b>C</b>: a sustained cone of fire you sweep across the field. hotter and further at B.<br>C ~27/tick · B ~40/tick for ~1.1s</div>`
- OLD: `<div class="fm"><b>BONE WALL</b> — a rampart of bone that blocks the risen. holds 6s.</div>`
  NEW: `<div class="fm"><b>BONE WALL</b> — a rampart of bone that blocks the risen. stands ~7-9s, or 80 / 120 / 175 battering by tier.</div>`+newline+`      <div class="fm"><b>BONE CAGE</b> — needs <b>C</b>: ten grave stakes imprison one foe where it stands. it batters its way out — 150 at C, 220 at B.</div>`
- OLD: `<div class="fm"><b>SLASH</b> — a cutting wedge of wind. cuts foes <i>and</i> fells trees for wood.<br>D 22 · C 37 · B 55</div>`
  NEW: `<div class="fm"><b>SLASH</b> — cutting wind blades, 1 / 2 / 3 with tier. cuts foes <i>and</i> fells trees for wood.<br>D 22×1 · C 37×2 · B 55×3</div>`
- OLD: `<div class="fm"><b>GUST</b> — a wide blast of pure knockback, no chop.<br>D 10 · C 17 · B 25 + heavy knockback</div>`
  NEW: `<div class="fm"><b>GUST</b> — a wide blast of pure knockback, no chop.<br>D 10 · C 17 · B 25 + heavy knockback</div>`+newline+`      <div class="fm"><b>CYCLONE</b> — needs <b>C</b>: the sky grabs the pack at your aim and holds it aloft ~2s.<br>C 48 · B 70</div>`
- OLD: `<div class="fm"><b>RESTORATION</b> — a pulse that restores everything damaged around you at once, radius widens each tier. this is how a battered wing of your fort is made whole again before it breaks.<br>D 16 · C 27 · B 40, radius 6/8/10</div>`
  NEW: same line +newline+`      <div class="fm"><b>HEAL</b> — grace turns to flesh: knits your own wounds.<br>D +20 · C +34 · B +50 health</div>`

## G16. Debug handle (~line 1789), 2 edits

- OLD: `window._bf={player,camera,PR,P,foes,dummies,scene,projectiles,walls,`
  NEW: `window._bf={player,camera,PR,P,foes,dummies,scene,projectiles,walls,castSpell,tierUp,FORMS,TIER_MULT,`
- OLD: `get kindled(){return kindled;},`
  NEW: `get kindled(){return kindled;},get tier(){return tier;},get mana(){return mana;},`

---

# FILE 2: `💀 Bonefield Arena/bonefield-codex.html` (in-game system codex)
# FILE 3: `Bonefield Website/codex.html` (website codex)

The two files mirror each other row for row. Apply every patch C1-C15 to BOTH files (line hints:
website / arena). Row text is identical in both unless noted. Watch the en-dash in "4–5".

- **C1** (744 / 415): OLD: `Freeze unlocks at C. In the build, form-locks work the same way: Flamethrower and Raise Dead are <b>B-only</b>.</p>`
  NEW: `Freeze unlocks at C. In the build the rule is now universal: every form carries an unlock rung — Cyclone, Bone Cage and Flamethrower need <b>C</b>, Raise Dead stays <b>B-only</b>, and a refused cast names the tier it demands.</p>`
- **C2** (810 / 434): OLD: `<tr data-s="ingame"><td><b>Fireball</b></td><td class="n">26</td><td>Hurled blast. At B the impact births 4–5 real smaller fireballs over the area.</td></tr>`
  NEW: `<tr data-s="ingame"><td><b>Fireball</b></td><td class="n">26</td><td>Hurled blast. At C the impact births <b>4×10</b> real smaller fireballs, at B <b>6×12</b> — the spec's fragment rows.</td></tr>`
- **C3** (811 / 435): OLD: `<tr data-s="ingame"><td><b>Fire Spear</b></td><td class="n">20</td><td>Homing bolts. Volley grows <b>1 / 3 / 6</b> with tier.</td></tr>`
  NEW: `<tr data-s="ingame"><td><b>Fire Arrow</b> <span style="color:var(--faint)">(was Fire Spear)</span></td><td class="n">20</td><td>Homing bolts. Volley grows <b>1 / 3 / 6</b> with tier.</td></tr>`
- **C4** (812 / 436): OLD: `<tr data-s="ingame"><td><b>Flamethrower</b> <span class="tag t-planned" style="font-size:9px">B only</span></td><td class="n">16/tick</td><td>Sustained sweeping cone.</td></tr>`
  NEW: `<tr data-s="ingame"><td><b>Flamethrower</b> <span class="tag t-ingame" style="font-size:9px">C+</span></td><td class="n">16/tick</td><td>Sustained sweeping cone. Damage &amp; reach scale with tier from C.</td></tr>`
- **C5** (824 / 448): OLD: `Fire Arrow (unlock D): 45→115 dmg, tracks/pierces. Flamethrower (unlock C): 30→75 dmg/s channelled, 8→18 m. Full per-tier tables in the v1.0 spec §16.`
  NEW: `Fire Arrow (unlock D): 45→115 dmg, tracks/pierces. Flamethrower (unlock C — the build now matches): 30→75 dmg/s channelled, 8→18 m. Full per-tier tables in the v1.0 spec §16.`
- **C6** (834 / 458): OLD: `<tr data-s="ingame"><td><b>Slash</b></td><td class="n">22</td><td>Cutting wind crescent. Fells trees for wood, cracks nothing. Arc widens with tier.</td></tr>`
  NEW: `<tr data-s="ingame"><td><b>Slash</b></td><td class="n">22</td><td>Cutting wind blades — <b>1 / 2 / 3</b> with tier, the spec's multi-blade rows. Fells trees for wood.</td></tr>`
- **C7** (after Gust row, 835 / 459): OLD: `<tr data-s="ingame"><td><b>Gust</b></td><td class="n">10</td><td>Pure knockback wedge; fans wider &amp; further each tier.</td></tr>`
  NEW: same line +newline+`        <tr data-s="ingame"><td><b>Cyclone</b> <span class="tag t-ingame" style="font-size:9px">C+</span></td><td class="n">28</td><td>Lifts &amp; suspends the pack at your aim ~2 s. C 48 · B 70.</td></tr>`
- **C8** (845 / 469): OLD: `<tr data-s="locked"><td>Cyclone <span style="color:var(--faint)">(working)</span></td><td>C</td><td class="n">lift ~4 s</td><td class="n">48→180</td></tr>`
  NEW: `<tr data-s="ingame"><td>Cyclone <span class="tag t-ingame" style="font-size:9px">shipped</span></td><td>C</td><td class="n">lift ~2 s (build)</td><td class="n">48→180</td></tr>`
- **C9** (867 / 491): OLD: `<tr data-s="locked"><td>Water Prison <span style="color:var(--faint)">(working)</span></td><td>C</td><td class="n">3→12 s</td><td>Traps &amp; interrupts incantations</td></tr>`
  NEW: `<tr data-s="diverge"><td><s>Water Prison</s> <span class="tag t-diverge" style="font-size:9px">cut</span></td><td>C</td><td class="n">3→12 s</td><td>Cut from the build — Bone Cage carries the trap role.</td></tr>`
  (`t-diverge` tag class + `data-s="diverge"` both already exist in these files.)
- **C10** (880 / 504): OLD: `<tr data-s="ingame"><td><b>Bone Wall</b></td><td class="n">—</td><td>Barricade to hide behind; widens <b>5 / 7 / 9</b> stakes with tier.</td></tr>`
  NEW: `<tr data-s="ingame"><td><b>Bone Wall</b></td><td class="n">—</td><td>Barricade to hide behind; widens <b>5 / 7 / 9</b> stakes with tier. HP <b>80 / 120 / 175</b> — the risen batter it down.</td></tr>`+newline+`        <tr data-s="ingame"><td><b>Bone Cage</b> <span class="tag t-ingame" style="font-size:9px">C+</span></td><td class="n">—</td><td>Ten stakes imprison one foe. Durability <b>150 / 220</b> (C/B); it batters its way out.</td></tr>`
- **C11** (890 / 514): OLD: `<tr data-s="locked"><td>Bone Cage <span style="color:var(--faint)">(working)</span></td><td>C</td><td class="n">150→500 durability</td></tr>`
  NEW: `<tr data-s="ingame"><td>Bone Cage <span class="tag t-ingame" style="font-size:9px">shipped</span></td><td>C</td><td class="n">150→500 durability (build: 150/220)</td></tr>`
- **C12** (903 / 527): OLD: `<tr data-s="ingame"><td><b>Restoration</b></td><td class="n">16</td><td>Repair pulse over radius <b>6 / 8 / 10</b> — every damaged piece at once.</td></tr>`
  NEW: same line +newline+`        <tr data-s="ingame"><td><b>Heal</b> <span class="tag t-ingame" style="font-size:9px">new</span></td><td class="n">—</td><td>Knits the caster's own flesh: <b>+20 / +34 / +50</b> HP by tier. Unlocks at D.</td></tr>`
- **C13** (906 / 530): OLD: `<div class="note diverge"><b>Divergence:</b> the spec's fifth element is <b>Life</b> (heal HP, limb reattach/regrow). The build's <b>Grace</b> heals structures rather than flesh — it is the fort's mason, not the medic. Player HP healing (the spec's Heal E→S 20→130) is a planned merge.</div>`
  NEW: `<div class="note"><b>Merged:</b> the spec's fifth element is <b>Life</b> (heal HP, limb reattach/regrow). The build's <b>Grace</b> now carries both — Mend and Restoration for timber, <b>Heal</b> for flesh (the spec's Heal table, D/C/B slice = 20/34/50). Limb reattach/regrow stays future.</div>`
- **C14** (907 / 531): OLD: `<h3>Spec Life · Heal scaling <span class="tag t-locked">Locked design</span></h3>`
  NEW: `<h3>Spec Life · Heal scaling <span class="tag t-ingame">In game — D/C/B slice</span></h3>`
- **C15** both files, final sweep: `grep -n "Fire Spear\|FIRE SPEAR" <file>` must return zero after
  patching. Also `grep -rn "Fire Spear" "Bonefield Website"` (excluding `_archive`) must be clean:
  as of 2026-07-11 the only website hits were codex.html; other pages (magic/arena/press/index)
  carry no spell-name rows.

---

# §V. VERIFICATION (run after all patches)

Serve: Arena launch config `bonefield` (python http.server 8877). Use preview tools + console.

1. Boot: title screen loads, zero console errors.
2. `_bf.tierUp('wind')` → `_bf.castSpell('cyclone')===false`, banner names tier C. Rite still kindled (`_bf.tier===1`).
3. `_bf.tierUp('wind')` (C) → `castSpell('cyclone')===true`; a foe within 5 of aim has `liftT>0` and floats ~1.4 up for ~2 s, then drops.
4. Heal: `_bf.P.hp=40` → chant grace D → `castSpell('heal')` → `_bf.P.hp===60`; at C +34, at B +50; capped at `maxHp`.
5. Fireball at C into a foe pack: impact spawns exactly 4 child projectiles (`kind:'fire'`, `dmg:10`); at B: 6 children `dmg:12`; children never re-splatter.
6. Slash: `slashes` gains 1/2/3 crescents at D/C/B; three hitCones at B.
7. Flamethrower: refused at D (banner names C); cast at C: `_bf.P.flameTr===2`, cone reaches ~8.5; at B ~10.5 and hits harder.
8. Bone wall at C: `_bf.walls[0].hp===120`; skeletons batter it (bone burst per hit) and it collapses at 0.
9. Bone cage with no live foe near aim: `castSpell('bonecage')===false`, rite NOT consumed. With a foe: cage entry has `keepIn:true, hp:150` at C; the foe stays inside r≈1.6. WATCH-ITEM: confirm a caged foe far from the player still swings and batters the cage; if it idles instead, wire the batter: when the keepIn clamp holds a foe for >1 s, start its attack cycle (reuse the blocked-batter branch).
10. Fire Arrow: chant fire, type/say `arrow` → volley flies, `FORMS.firespear.name==='FIRE ARROW'` everywhere on screen. Type `spear` over fire-D → yields to death, casts bone spear. Over fire-C → refused, fire rite holds.
11. Typed chant (T) equals voice for all new words: `cyclone`, `cage`, `heal`, `arrow`.
12. Active-magic HUD: kindle fire D → `FIRE · D — say FIREBALL · FIRE ARROW · FLAMETHROWER` with FLAMETHROWER greyed; at C it ungreys; HUD clears on cast, on gutter (sword draw), on death.
13. R (cycleForm) cycles through the new forms without errors; the chip label shows CYCLONE/BONE CAGE/HEAL when selected.
14. Both codex pages: open in browser, filter chips (In game / Locked / Planned / Divergence) still filter the edited rows correctly; Water Prison row shows struck-through with `cut`; no layout break.
15. Parse check: extract the game's module script to a temp `.mjs` and `node --check` it: zero syntax errors.

# Out of scope (do not touch)

Batch 2: thunder/storm fusion, charcoal, water fells trees, melee stops chopping, contained-magic
fourth resource. The old Essence story/multiplayer builds (`Bonefield Website/v3-summit.html`,
`multiplayer.html`): different engine, untouched. `fireSplat` dead code: leave.
