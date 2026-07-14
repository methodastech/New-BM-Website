```js
      if(seg.pop>0){ ctx.globalAlpha=seg.pop; ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(0,0,sr,0,6.2832); ctx.fill(); ctx.globalAlpha=1; }
      ctx.restore();
    }
    ctx.save(); ctx.translate(x,y);
    if(boss.core.exposed){
      if(!boss.entering && boss.hp/boss.hpMax<0.5) drawEnrage(0,0,rr*0.6,col);
      var eg=ctx.createRadialGradient(0,0,0,0,0,rr*0.7); eg.addColorStop(0,'#fff'); eg.addColorStop(0.35,'#E0447C'); eg.addColorStop(1,'rgba(58,10,22,0)');
      ctx.fillStyle=eg; ctx.shadowColor=col; ctx.shadowBlur=30; ctx.beginPath(); ctx.arc(0,0,rr*(0.5+0.06*Math.sin(boss.t*4)),0,6.2832); ctx.fill();
      if(boss.boardThreshold && boss.hp<=boss.boardThreshold){ ctx.globalAlpha=0.6+0.4*Math.sin(boss.t*6); ctx.strokeStyle='#F1D27A'; ctx.lineWidth=2.4; ctx.setLineDash([8,7]); ctx.beginPath(); ctx.arc(0,0,rr*0.9,0,6.2832); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha=1; }
    } else {
      var cg=ctx.createRadialGradient(-rr*0.3,-rr*0.3,rr*0.1,0,0,rr); cg.addColorStop(0,'#5a2030'); cg.addColorStop(0.6,'#2a0a14'); cg.addColorStop(1,'#0a0206');
      ctx.fillStyle=cg; ctx.strokeStyle=col; ctx.lineWidth=2.4; ctx.shadowColor=col; ctx.shadowBlur=20;
      ctx.beginPath(); ctx.arc(0,0,rr*0.72,0,6.2832); ctx.fill(); ctx.stroke();
    }
    ctx.restore();
    if(boss.lash){ var L=boss.lash;
      if(L.phase==='tele'){ var pr=L.t/BROOD.lashTele; ctx.save(); ctx.globalAlpha=0.35+0.4*pr; ctx.strokeStyle='#E0447C'; ctx.lineWidth=1+pr*3; ctx.setLineDash([6,6]); ctx.shadowColor='#E0447C'; ctx.shadowBlur=10;
        ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+Math.cos(L.aim)*R*1.4,y+Math.sin(L.aim)*R*1.4); ctx.stroke(); ctx.setLineDash([]); ctx.restore(); }
      else { var sweep=(L.t/0.5-0.5)*0.8, a=L.a0+sweep; ctx.save(); ctx.strokeStyle='#ffd2e6'; ctx.lineWidth=7; ctx.lineCap='round'; ctx.shadowColor='#E0447C'; ctx.shadowBlur=22;
        ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+Math.cos(a)*R*1.4,y+Math.sin(a)*R*1.4); ctx.stroke();
        ctx.strokeStyle='#fff'; ctx.lineWidth=2.4; ctx.shadowBlur=0; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+Math.cos(a)*R*1.1,y+Math.sin(a)*R*1.1); ctx.stroke(); ctx.restore(); }
    }
    ctx.save(); ctx.font="bold 11px 'Space Mono',monospace"; ctx.fillStyle=col; ctx.textAlign='center'; ctx.fillText('THE BROODMOTHER', x, y+rr+20); ctx.restore();
  }
```

`bossFire()` (5504) reads `B.moves`; `brood`/`lash`/`spray` fall through to the 5-shot spread — acceptable, on-theme. No `bossFire` edit required.

## P5.2 THE SHADOW upgrade (boss:3, wave 20) — peak-mirror + stat floor + true ending

### P5.2a Apply the peak snapshot when the Shadow spawns — inside `startBoss` `if(num===3){...}` (5495)

```js
    if(num===3){ boss.ty=cy;
      /* P5b: mirror the run's PEAK loadout, not the current one (defeats module-stripping at wave 20) */
      var snap = PEAK_SNAP || {cr:0,ship:{},wlab:{},equip:{},crew:[]};
      var floorCR = shadowFloorCR();                 /* wave-15 budget floor */
      var effCR = Math.max(snap.cr, floorCR);
      boss.mirror = snap;
      boss.hpMax = boss.hp = Math.round(200 + effCR*1.1);   /* base 200 + scaled */
      boss.dmgMul = 1 + Math.min(1.2, effCR/1600);          /* its shots hit harder the stronger you got */
      boss.mirrorCrew = (snap.crew||[]).slice(0,3);         /* shadow-crew shown in the true-ending interior */
      if(window.__boardingReady) boss.interiorSecs=120;
    }
```

```js
function shadowFloorCR(){
  /* ~= Hauler frame + 8 ship pips + 3 wlab marks + 2 modules + 1 crew, per §h wave-15 waypoint */
  return 260 /*hauler*/ + 8*40 + 3*55 + 2*90 + 120 + 100 /*hpMax pad*/ + 70*3 /*gear*/;
}
```

### P5.2b Route the Shadow's damage through the mirror multiplier — `bossFire()` (5507)

```js
    var bd=boss.num===3?(sw?12:10):boss.num===2?10:9;
    if(boss.num===3 && boss.dmgMul) bd=Math.round(bd*boss.dmgMul);   /* P5b: peak-scaled shadow */
```

Its hp is now `boss.hpMax`; existing second-wind logic (`shadowSecondWind`, 7255) sets `boss.hp=boss.hpMax` — auto-scales. `defeatBoss` num===3 (5555) and `shadowThirdWindFail` fire the finale + `endGame(true)` unchanged.

### P5.2c The boardable true-ending interior (near `defeatBoss`)

```js
/* ===== P5b: THE SHADOW true-ending interior ===== */
function shadowInterior(){
  var snap = (boss&&boss.mirror) || PEAK_SNAP || {crew:[]};
  var rooms=[
    {id:'airlock', tpl:'corridor', guards: (snap.crew||[]).slice(0,1).map(shadowBosun),  loot:{cr:[80,140]} },
    {id:'wardroom',tpl:'room',     guards: (snap.crew||[]).slice(1,3).map(shadowBosun),  loot:{cr:[120,200], mod:0.15} },
    {id:'cockpit', tpl:'core',     guards:[], core:true }
  ];
  if(!(snap.crew||[]).length){ rooms[0].guards=[shadowBosun({role:'ghost',name:'Nobody'})]; }  /* solo runs still get one */
  return rooms;
}
function shadowBosun(c){ return { type:'bosun', hp:60*1.5, dmg:12, name:'Shadow '+(c.name||c.role),
  line:'"'+SHADOW_CREW_BARK[c.role]||'"You left me on the dock."'+'"' }; }
var SHADOW_CREW_BARK={ gunner:'"I fired for you. You never asked my name."', engineer:'"I patched your hull. Who patched me?"',
  quartermaster:'"I counted your money. It was never mine."', ghost:'"You did this alone. Remember that."' };

function shadowTrueEnding(choice){
  wonSecret=true; score+=5000;
  if(choice==='destroy'){
    shadowFelled(function(){
      var b=Q('geBannerBig'); showBanner('FREEDOM — EARNED','You looked at what you feared and ended it','#F1D27A');
      unlockCodex('shadow_earned'); shadowCore=1; saveMeta(); endGame(true);
    });
  } else {
    shadowFelled(function(){
      showBanner('FREEDOM — UNDERSTOOD','It dissolved into you. Nothing left to run from','#C4B5FD');
      unlockCodex('shadow_understood'); shadowCore=1; saveMeta(); endGame(true);
    });
  }
}
function unlockCodex(id){ try{ var seen=JSON.parse(STORE.get('bdg_codex')||'{}'); seen[id]=1; STORE.set('bdg_codex',JSON.stringify(seen)); }catch(e){} }
window.__shadowInterior=shadowInterior; window.__shadowTrueEnding=shadowTrueEnding;
```

Interior cockpit dialogue (reuses `showDialog`):

```js
function shadowCockpitDialog(){
  showDialog('YOUR SHADOW', [
    'You built all of this to get free.',
    "I'm what you'd be if you'd stayed.",
    'So. Which of us walks out of here?'
  ], '#E0447C', function(){ /* P4 boarding UI shows two-choice buttons -> shadowTrueEnding('destroy'|'merge') */ });
}
window.__shadowCockpitDialog=shadowCockpitDialog;
```

Both endings terminate in `endGame(true)` with `wonSecret=true`; victory debrief, reward code, badge-3 all fire unchanged. Distinct banners + codex differentiate.

## P5.3 Waves 11 / 18 / 19 — REP branches

Hook in `startLevel(n)` after `mission` is built (5646):

```js
    mission={t:L.t, target:L.target||0, prog:0};
    applyRepBranch(n, L);   /* P5a: waves 11/18/19 rep-gated composition & assists */
```

```js
function applyRepBranch(n, L){
  var band=repBand();  /* 'Deputized'|'Trusted'|'Watched'|'Marked'|'OUTLAW' */
  if(n===11) return branchAudit(band);
  if(n===18) return branchReckoning(band);
  if(n===19) return branchStorm(band);
}
```

### P5.3a Wave 11 — "The Audit"

```js
function branchAudit(band){
  if(band==='Deputized'||band==='Trusted'){
    scheduleAssist('imperial', 3.0);
    showBanner('THE AUDIT','Your record is clean — the Navy stands with you','#7FA8FF');
  } else if(band==='OUTLAW'){
    mission.impHostile=true;
    spawnFactionWing('imperial', 2);   /* impPatrol×2 that target the player */
    showBanner('THE AUDIT','You are wanted. The Navy opens fire','#E0447C');
  } else {
    mission.observer = spawnObserver();
    mission.obsRepCap = 0;
    showBanner('THE AUDIT','An observer frigate is watching. Kill clean, stay near it','#F1D27A');
  }
}
function spawnObserver(){
  var ang=-1.5708, d=R*0.55, ob={x:cx+Math.cos(ang)*d, y:cy+Math.sin(ang)*d, hp:400, r:22, kind:'observer'};
  observers.push(ob); return ob;
}
```

Add `var observers=[];` near `traders=[]` (4042); clear it in `startLevel` reset (5640): `observers.length=0;`.

Scoring hook — in `killEnemy(e,j,byNpc)` (5396), after the kill is credited:

```js
  if(mission&&mission.observer&&!mission.observer.dead){
    if(Math.hypot(e.x-mission.observer.x,e.y-mission.observer.y)<500){
      if((mission.obsRepCap||0)<8){ mission.obsRepCap=(mission.obsRepCap||0)+1; repAdd('imperial',1,'observed'); }
    }
  }
```

Shooting the observer — in `updatePBul` enemy collision loop:

```js
      if(mission&&mission.observer&&!mission.observer.dead){ var ob=mission.observer;
        if(Math.hypot(b.x-ob.x,b.y-ob.y)<ob.r+4){
          ob.dead=true; boomFx(ob.x,ob.y,'#7FA8FF',true);
          var was=repBand();
          repAdd('imperial', was==='Marked'? -45 : -25, 'shot_observer');  /* Marked→Outlaw, else →Marked */
          RUN_LOG.push('shot_observer');
          showBanner(repBand()==='OUTLAW'?'OUTLAW':'MARKED','You fired on the Navy','#E0447C'); sfx('boss');
          pbul.splice(i,1); continue;
        }
      }
```

Render the observer via a `drawObservers()` invoked where enemies are drawn (blue-white frigate + scanning cone).

### P5.3b Wave 18 — "The Reckoning"

```js
function branchReckoning(band){
  if(band==='Deputized'||band==='Trusted'){
    scheduleAssist('imperial', 2.5, true);
    showBanner('THE RECKONING','The Navy drills at your side','#7FA8FF');
  } else if(band==='OUTLAW'){
    spawnFactionWing('imperial', 1, 'impCutter');   /* heavy escort mini-boss */
    mission.impHostile=true; mission.cap=(mission.cap||18)+2;
    showBanner('THE RECKONING','An Imperial capital ship comes for you','#E0447C');
  } else {
    showBanner('THE RECKONING',"The Navy didn't come. Nobody remembers the unremarkable.",'#8A93A6');
  }
}
```

### P5.3c Wave 19 — "The Storm" (fixed-budget composition from RUN_LOG)

```js
function branchStorm(band){
  var pool=[];
  var log=RUN_LOG;
  var flavor=[];
  if(log.indexOf('sold_mutineer')>=0){ pool.push('clanRaider','clanRaider'); flavor.push('the crew you sold'); }
  if(log.indexOf('refused_rex')>=0 || log.indexOf('rex_gone')>=0){ pool.push('rival'); flavor.push('Rex'); }
  if(log.indexOf('hid_deserter')>=0){ pool.push('sniper'); flavor.push('the deserter you hid'); }
  if(log.indexOf('hot_cargo')>=0 || log.indexOf('salvage_claim')>=0){ pool.push('leech'); flavor.push('the law you dodged'); }
  if(log.indexOf('spared_captain')>=0){ pool.push('clanRaider'); flavor.push('the captain you spared'); }
  if(pool.length<3){ pool=LEVELS[18].pool.slice(); }
  mission.stormPool=pool;                    /* spawnDirector reads mission.stormPool over LEVELS pool if present */
  mission.threatBudget=stormBudget(19);      /* FIXED — identical clean vs messy */
  var who = flavor.length? ('Everyone returns: '+flavor.slice(0,3).join(', ')) : 'Everyone you spared or wronged returns at once';
  showBanner('THE STORM', who, '#E0447C');
}
function stormBudget(w){ return 120 + w*4; }   /* deterministic; RUN_LOG cannot change this number */
```

`spawnDirector` integration:

```js
    var pool = (mission&&mission.stormPool) ? mission.stormPool : (L.pool||['lowball']);
```

`cap`/`spawnRateMul` from `LEVELS[18]` still govern concurrency/rate → total threat bounded identically regardless of RUN_LOG.

### P5.3d Shared assist / faction-wing helpers

```js
function scheduleAssist(fac, delay, guaranteed){
  mission.assistFac=fac; mission.assistT=delay; mission.assistGuar=!!guaranteed;
}
function tickAssist(dt){
  if(!mission||!mission.assistFac) return;
  mission.assistT-=dt; if(mission.assistT>0) return;
  var fac=mission.assistFac; mission.assistFac=null;
  var chance = mission.assistGuar?1:(0.25 + REP.imperial/200 + 0.02*(SKILLS.charisma||0));
  if(Math.random()>chance) return;
  spawnFactionWing(fac, repBand()==='Deputized'?3:2, fac==='imperial'?'impPatrol':'clanRaider', true /*ally*/);
  flash=Math.max(flash,0.3); flashCol='#7FA8FF';
  showBanner('IMPERIAL NAVY ON STATION','Assist wing on the grid','#7FA8FF'); sfx('win');
}
function spawnFactionWing(fac, n, key, ally){
  key=key||(fac==='imperial'?'impPatrol':'clanRaider');
  for(var i=0;i<n;i++){ spawnEnemy(key); var e=enemies[enemies.length-1];
    if(e){ e.ally=!!ally; e.dmgMul=ally?0.5:1; if(!ally) e.huntPlayer=true; } }
}
```

Call `tickAssist(dt)` in the play-sim block (7550):

```js
      updateEnemies(dt); /* ...existing... */ updateHaven(dt); tickAssist(dt);
```

`updateEnemies` must skip player-collision damage and retarget to nearest pirate when `e.ally` — add a two-line guard at the top of the per-enemy body (mirrors the `ally.active` PIXEL rescue pattern).

## P5.4 OUTLAW — Black Market dock tab

### P5.4a Contraband module defs — add to `MODULES` area (4088)

```js
  var CONTRA={
    dirtyRail: {n:'Dirty Railgun',    c:'#F97316', slot:'w', bm:true, d:'+30% damage · 5% chance to jam the gun 1.5s', f:function(S){ S.dmgMul*=1.30; S.jamPct=(S.jamPct||0)+0.05; }},
    ocCoils:   {n:'Overclocked Coils', c:'#F1D27A', slot:'w', bm:true, d:'+25% fire rate · drains 1 energy/s passively', f:function(S){ S.fireMul*=1.25; S.passiveDrain=(S.passiveDrain||0)+1; }},
    vampPlate: {n:'Vampire Plating',   c:'#E0447C', slot:'r', bm:true, d:'Kills restore 2 hull · shield cap −25%', f:function(S){ S.killHeal=(S.killHeal||0)+2; S.shMax=Math.round(S.shMax*0.75); }},
    redline:   {n:'Redline Injector',  c:'#C4B5FD', slot:'r', bm:true, d:'Dash leaves a 20-dmg wake · dash cd +0.5s', f:function(S){ S.wake=1; S.dashWakeDmg=(S.dashWakeDmg||0)+20; S.dashCdAdd=(S.dashCdAdd||0)+0.5; }},
    ghostBaf:  {n:'Ghost Baffles',     c:'#7FA8FF', slot:'r', bm:true, d:'Enemies acquire you 30% slower · hull −15%', f:function(S){ S.stealth=(S.stealth||0)+0.30; S.hpMax=Math.round(S.hpMax*0.85); }}
  };
```

Extend the `recomputeStats` module loop (4266) to apply equipped contraband:

```js
    for(var id in mods){ var def=MOD_DEFS[id]; if(!def) continue; for(var s=0;s<mods[id];s++) def.f(MS,s); }
    /* P5b: contraband modules socketed via EQUIP apply once each */
    for(var gk in EQUIP){ for(var gi=0;gi<EQUIP[gk].length;gi++){ var cid=EQUIP[gk][gi]; if(cid&&CONTRA[cid]) CONTRA[cid].f(MS); } }
```

Consume the new `MS` flags at their sites: `MS.jamPct` in `fireWeapon`; `MS.passiveDrain` in the energy-regen block (7553, `-MS.passiveDrain*dt`); `MS.killHeal` in `killEnemy`; `MS.dashCdAdd` in `tryDash`; `MS.stealth` in enemy acquire logic; `S.wake` already exists.

### P5.4b The re-skin: renderSockets shows contraband at OUTLAW

```js
function marketMods(){ /* legal modules always; contraband only at OUTLAW */
  var m={}, id; for(id in MODULES) m[id]=MODULES[id];
  if(repBand()==='OUTLAW'){ for(id in CONTRA) m[id]=CONTRA[id]; }
  return m;
}
```

Replace the two `for(id in MODULES)` loops inside `cycleSocket` (5939) and `renderModInv` (5958) with `var M=marketMods(); for(id in M){ ... M[id] ... }`, and change `md=mid?MODULES[mid]:null` in `renderSockets` (5948) to `md=mid?marketMods()[mid]:null`.

### P5.4c Black Market header + reroller UI

Weapons panel HTML (3746), above `gModInv`:

```html
            <div class="dk-blackmkt" id="gBlackMkt" style="display:none">
              <div class="dk-lab-h" style="color:#E0447C">▓ BLACK MARKET ▓ · contraband, 25% off, no questions</div>
              <button class="dk-buy" id="gMktReroll" type="button"><span class="cr-ic"></span>150 · REROLL SHOP</button>
            </div>
```

```js
function contraPrice(p){ return barterPrice(Math.round(p*0.75)); }
function marketReroll(){
  var free = (SKILLS.entrepreneur>=6 && !mshipVisitReroll);
  if(!free){ if(credits<CONTRABAND.rerollCost){ sfx('deny'); return; } credits-=CONTRABAND.rerollCost; }
  else { mshipVisitReroll=true; }
  rerollModuleShop(); saveMeta(); renderDock(); sfx('shield');
  showBanner('SHOP REROLLED', free?'On the house':'−150 CR','#F1D27A');
}
```

Toggle in `renderDock` (after `renderSockets()`):

```js
    var bm=Q('gBlackMkt'); if(bm) bm.style.display = (repBand()==='OUTLAW')?'block':'none';
```

Bind `gMktReroll` click → `marketReroll()`. `rerollModuleShop()` re-randomizes the current `draftOffer`; `mshipVisitReroll` boolean reset in `openDock()`. Shared with the legal Entrepreneur-R6 reroll.

### P5.4d Scoundrel's Pact (clan-rep assist) — call in `startLevel` after `applyRepBranch`

```js
    applyRepBranch(n, L);
    checkPactAssists(n, L);   /* P5b: per-wave imperial OR scoundrel assist rolls */
```

```js
function checkPactAssists(n, L){
  if(L.t==='boss') return;
  if(!mission.assistFac && REP.imperial>=25 && n>=6){
    var ic = 0.25 + REP.imperial/200 + 0.02*(SKILLS.charisma||0);
    if(Math.random()<ic) scheduleAssist('imperial', 3.0);
  }
  if(!mission.assistFac && REP.clan>=25 && n>=6){
    var cc = 0.25 + REP.clan/200 + 0.02*(SKILLS.charisma||0);
    if(Math.random()<cc){ scheduleAssist('clan', 3.0);
      showBanner("SCOUNDREL'S PACT",'A pirate wing flies your colors','#F97316'); }
  }
  if(REP.clan>=25 && L.pool && L.pool.indexOf('lowball')>=0) mission.spawnScale=0.8;
}
```

`mission.spawnScale` multiplies spawn count in `spawnDirector`.

### P5.4e Smuggling crates — in `startLevel` after mission setup

```js
    if(repBand()==='OUTLAW' && isScoundrelWave(L)){ spawnSmugglingCrates(CONTRABAND.cratesPerWave); }
```

```js
function isScoundrelWave(L){ return L.pool && (L.pool.indexOf('lowball')>=0||L.pool.indexOf('leech')>=0||L.pool.indexOf('rival')>=0); }
function spawnSmugglingCrates(n){ for(var i=0;i<n;i++){ var a=Math.random()*6.2832, r=380+Math.random()*360;
  crates.push({x:Math.cos(a)*r, y:Math.sin(a)*r, r:11, smug:true}); } }
```

In `updateCrates` (5964), instant payout for `smug` crates:

```js
    for(i=crates.length-1;i>=0;i--){ var c=crates[i];
      if(c.smug){ if(Math.hypot(c.x-cx,c.y-cy)<shipR+c.r+4){ var cr=addCredits(CONTRABAND.crateCr[0]+((Math.random()*(CONTRABAND.crateCr[1]-CONTRABAND.crateCr[0]))|0));
        floaters.push({x:cx-20,y:cy-30,vy:-24,a:1.5,txt:'+'+cr+' CONTRABAND',col:'#F97316'}); crates.splice(i,1); sfx('coin'); } continue; }
      /* ...existing cargo-crate handling... */ }
```

Guard the `updateCrates` early-return (5965):

```js
    if(!mission || (mission.t!=='cargo' && !crates.some(function(c){return c.smug;}))) return;
```

Bounty chips at Outlaw pay ×1.5 (base 12 CR): at the chip-value site, multiply by `repBand()==='OUTLAW'?1.5:1`.

## P5.5 Full repricing pass (§h)

### P5.5a Frame costs + trade-in (3991)

```js
    hauler:  {name:'Hauler',   tag:'Twin-thruster · big burn, lazy strafe', cost:2200, ...},
    gunship: {name:'Gunship',  tag:'Dual-everything · agile RCS',           cost:4200, ...},
```

**Trade-in at 60%.** Rewrite `buyFrame` (5720):

```js
  function buyFrame(fk){
    if(!FRAMES[fk]) return;
    if(frame===fk) return;
    if(!frameOwned[fk]){ var fc2=barterPrice(FRAMES[fk].cost); if(credits<fc2){ sfx('deny'); return; } credits-=fc2; frameOwned[fk]=true; }
    var leaving=FRAMES[frame]; if(leaving && frameOwned[fk] && FRAMES[fk].cost < leaving.cost){
      var tradeIn=Math.round((leaving.cost||300)*0.60); credits+=tradeIn; frameOwned[frame]=false;
      floaters.push({x:cx,y:cy,vy:-20,a:1.4,txt:'+'+tradeIn+' TRADE-IN',col:'#5EEAD4'});
    }
    frame=fk; saveMeta(); recomputeStats(); renderDock(); sfx('shield');
  }
```

### P5.5b Facilities cost5/cost6 = 450/700 (4034 + `mshipCost`)

```js
  var MSHIP_DEFS={
    market:{n:'Marketplace',     c:'#F1D27A', m:6, cost:300, cost5:450, cost6:700, d:'...'},
    repair:{n:'Repair Bay',      c:'#5EEAD4', m:6, cost:360, cost5:450, cost6:700, d:'...'},
    turret:{n:'Defense Turrets', c:'#F97316', m:6, cost:420, cost5:450, cost6:700, d:'...'},
    shield:{n:'Shield Generator',c:'#7FA8FF', m:6, cost:400, cost5:450, cost6:700, d:'...'}
  };
```

```js
  function mshipCost(id){ var def=MSHIP_DEFS[id], r=MSHIP[id]||0;
    if(r===4 && def.cost5) return barterPrice(def.cost5);
    if(r===5 && def.cost6) return barterPrice(def.cost6);
    return barterPrice(Math.round(def.cost*Math.pow(1.7,r))); }
```

### P5.5c Discount cap 25% — multiplicative, hard-capped (4093)

```js
  function totalDiscount(){
    var d=1;
    d *= (1 - Math.min(0.25,(SKILLS.entrepreneur||0)*0.02));   /* −2%/rank */
    if(repBand()==='Deputized') d *= 0.90;                      /* Imperial standing */
    if((MSHIP.gearlocker||0)>=3) d *= 0.90;                     /* Gear Locker r3 */
    return Math.max(0.75, d);                                    /* hard cap: never below 75% */
  }
  function barterPrice(p){ var base=p*totalDiscount();
    if(CARD_STATE.price && CARD_STATE.price.docks>0) base*=CARD_STATE.price.mul;   /* P2 supply_blockade folds in here */
    return Math.max(1, Math.round(base)); }
```

### P5.5d Entrepreneur R3 / R6 / R9 hooks

- **R3** — bounty-chip drop: `chip *= (SKILLS.entrepreneur>=3?1.5:1)` (or read `MS.chipMul`).
- **R6** — free reroll: `marketReroll()` checks `SKILLS.entrepreneur>=6`; reset `mshipVisitReroll=false;` in `openDock()`.
- **R9 interest** — in `levelDone()` (5717), after `addCredits`:

```js
    if(SKILLS.entrepreneur>=9){ var interest=Math.min(90, Math.round(credits*0.03));
      if(interest>0){ credits+=interest; saveMeta(); floaters.push({x:cx-30,y:cy-64,vy:-20,a:1.4,txt:'+'+interest+' INTEREST',col:'#5EEAD4'}); } }
```

- **R10 capstone** — boss bounty at `defeatBoss` (5545) and `dropCredits` for bosses: `*= (SKILLS.entrepreneur>=10?1.25:1)`.

### P5.5e Payout formula

`levelDone` wave clear is `55 + level*22` (5717) — matches §h. `MS.payoutMul` already applied. No change.

## P5.6 Shadow Core prestige token → T4 weapon next run

### P5.6a Grant on Shadow defeat

Grant `shadowCore=1; saveMeta();` before `endGame(true)` in: `defeatBoss` num===3 dialogue callback (5559), `shadowThirdWindFail` (7250), and both branches of `shadowTrueEnding` (§P5.2c, already included above).

### P5.6b T4 weapons + next-run unlock

```js
  var WPN_T4={ singularity:{name:'Singularity Lance', tag:'T4 · collapsing beam', col:'#C4B5FD'},
               swarm:{name:'Swarm Battery', tag:'T4 · seeking cloud', col:'#5EEAD4'} };
```

Register in `WEAPONS` (4457). At run start (`startRun`, 5635 / fresh-run reset ~5040):

```js
  function startRun(){
    if(shadowCore>0){
      WEAPONS.singularity=WPN_T4.singularity; WPN_UNLOCKED.singularity=1;
      showBanner('SHADOW CORE SPENT','Singularity Lance online — T4','#C4B5FD');
      shadowCore=0; saveMeta();
    }
    level=1; runCredits=0; startLevel(1);
  }
```

> **Ambiguity resolved (final, cross-cutting):** two readings exist — spend-on-next-run (this P5b code) vs permanent-unlock-folded-into-`WPN_UNLOCKED` (integration plan). Ship the **permanent-unlock** reading to stay consistent with every other unlock in the codebase: on first run after the Shadow kill, fold `singularity` into `WPN_UNLOCKED` permanently and leave `shadowCore` at its earned value (do NOT zero it). If you prefer the consumable feel, use the `startRun` code above verbatim. Pick one; do not ship both — they differ only in whether `shadowCore` is zeroed.

## ✅ P5 VERIFY

Add two probes near the other `window.__*` hooks (4393):

```js
  window.__forceBoss=function(n){ mode='boss'; startBoss(n|0); return {num:n, hp:boss&&boss.hp, segs:boss&&boss.segs&&boss.segs.length}; };
  window.__peek=function(){ return {peak:PEAK_SNAP, floor:shadowFloorCR(), band:repBand(), core:shadowCore}; };
```

| # | Setup | Expected |
|---|---|---|
| 1 | `__forceBoss(4)` | 3 lobes; each 900hp+400sh; birth drone every ~9s; lash telegraph→sweep; all lobes dead → "CORE EXPOSED"; core killable → wave 15 completes, +700 CR, T3 unlocks. |
| 2 | `__boardingReady=true`, drop Broodmother to 15% | breach ring shows; `__completeBoardedBoss()` completes + pays 700, no double-pay. |
| 3 | Build wave-10 loadout, strip all `EQUIP` at wave 20, `__forceBoss(3)` | `__peek().peak.cr` reflects the wave-10 peak; Shadow hp uses `Math.max(peak, floor)` — strip-cheese fails. |
| 4 | Naked run, `__forceBoss(3)` | Shadow hp floored at `shadowFloorCR()` — never trivial. |
| 5 | Board Shadow at 15% → `__shadowTrueEnding('destroy')`/`('merge')` | two distinct banners, both → `endGame(true)`, badge-3, codex entry. |
| 6 | `__forceRep(50)` then wave 11 | Imperial assist wing; no observer. Wave 18 → guaranteed navy drill. |
| 7 | `__forceRep(-10)` (Watched) then wave 11 | observer frigate; kills within 500u give +Imp (cap +8); shooting it → Marked + `shot_observer`. |
| 8 | `__forceRep(-70)` (Outlaw) | wave 11 imperials attack; wave 18 capital-ship midboss; Black Market visible; contraband socketable; smuggling crates; Scoundrel's Pact on clan-rep. |
| 9 | Wave 19 empty vs full RUN_LOG | `mission.threatBudget` identical (`stormBudget(19)`); only `mission.stormPool` + banner differ. |
| 10 | `__forceSkill('entrepreneur',9)` | interest on wave clear (cap 90); R6 free reroll once/dock; frames/facilities per §h; discount never exceeds 25%. |
| 11 | Kill Shadow → new run | `shadowCore` grants Singularity Lance T4 (or permanent unlock per the resolved ambiguity). |
| 12 | Outlaw run vs loyalist run | `runCredits` within ±10%. |
| 13 | Pre-2.0 save load | `bdg_bm` defaults, no throw; owned contraband survives. |

**Regression guards:** boss ids fire correctly (1→w5, 2→w10, 4→w15, 3→w20 via `openFinalUp`); `defeatBoss` num===4 falls through the generic `else` (badge-2 + `levelDone`); `recomputeStats` applies contraband only when socketed; `barterPrice` still ≥1.

---

# PHASE P6 — ART, JUICE, MUSIC, BALANCE

Complete, paste-ready implementation for master prompt §g P1/P2 + Art Addendum + balance verification. All state respects `reduceMo`, `muted`, and the hidden-tab driver.

**Global convention.** Add a single juice-state block near `killFlashes`/`shieldArcs` (~3967):

```js
/* ===== P6 juice/art/weather state ===== */
var LETTER={t:0,dur:0,name:'',sub:'',col:'#22D3EE',sig:'',fired:false}; /* wave-intro letterbox */
var CLEARCAM={t:0,x:0,y:0,payFrom:0,payTo:0,payShown:0,tick:0,stampT:0}; /* wave-clear killcam */
var BOSSDIM={t:0,x:0,y:0,col:'#E0447C'};        /* boss-intro darken+spotlight */
var afterimgs=[];                                /* dash afterimage stamps {x,y,ang,a} */
var shootStars=[];                               /* per-theme shooting stars */
var comboPitch=1;                                /* combo pitch-rise multiplier, decays to 1 */
var slowmo=1, slowmoT=0;                         /* killcam slow-mo */
var sfxPitch=1;                                  /* one-shot pitch bend for the next sfx */
```

## P6.1 Faction silhouettes — distinct hulls in `drawEnemy`

Add after `drawHullShape` closes (after 6770):

```js
/* P6 Art#1: faction silhouette overlay — stamped in local ship space (nose at +x), after the base hull. */
var FAC_TINT={ scoundrel:'#1a1206', imperial:'#0a1424', civilian:'#1a1608', clan:'#1c0810', alien:'#140a1e', freelancer:'#06201c' };
function drawFacOverlay(ctx, fac, rr, col, al, tt){
  var ac=(FACTIONS[fac]||{}).col||col;
  ctx.save(); ctx.globalAlpha=al; ctx.strokeStyle=ac; ctx.fillStyle=ac; ctx.lineWidth=1.6; ctx.shadowColor=ac; ctx.shadowBlur=6;
  if(fac==='imperial'){
    ctx.fillStyle='#dff1ff'; ctx.shadowColor='#bfe0ff';
    ctx.beginPath(); ctx.arc(-rr*0.25,-rr*0.85,rr*0.09,0,6.2832); ctx.fill();
    ctx.beginPath(); ctx.arc(-rr*0.25, rr*0.85,rr*0.09,0,6.2832); ctx.fill();
    ctx.strokeStyle=ac; ctx.shadowColor=ac; ctx.beginPath(); ctx.moveTo(rr*0.1,0); ctx.lineTo(-rr*0.5,-rr*0.05); ctx.lineTo(-rr*0.5,rr*0.05); ctx.closePath(); ctx.stroke();
  } else if(fac==='clan'){
    ctx.strokeStyle='#ff3b6e'; ctx.shadowColor='#ff3b6e'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(rr*0.6,-rr*0.5); ctx.lineTo(rr*1.15,-rr*0.28); ctx.moveTo(rr*0.6,rr*0.5); ctx.lineTo(rr*1.15,rr*0.28); ctx.stroke();
    var pz=0.5+0.5*Math.sin(tt*6); ctx.globalAlpha=al*(0.4+pz*0.5); ctx.fillStyle='#ff3b6e'; ctx.beginPath(); ctx.arc(0,0,rr*0.16,0,6.2832); ctx.fill();
  } else if(fac==='alien'){
    ctx.strokeStyle=ac; ctx.shadowColor=ac; ctx.globalAlpha=al*0.8; ctx.lineWidth=1.3;
    for(var s=-1;s<=1;s++){ ctx.beginPath(); ctx.arc(rr*0.1, 0, rr*(0.35+s*0.22)+rr*0.4, -1.1, 1.1); ctx.stroke(); }
    var bz=0.5+0.5*Math.sin(tt*4+rr); ctx.globalAlpha=al*(0.3+bz*0.5); ctx.fillStyle=ac; ctx.beginPath(); ctx.ellipse(rr*0.15,0,rr*0.2,rr*0.3,0,0,6.2832); ctx.fill();
  } else if(fac==='civilian'){
    ctx.strokeStyle='#F1D27A'; ctx.shadowColor='#F1D27A'; ctx.globalAlpha=al*0.7; ctx.lineWidth=1.2;
    ctx.strokeRect(-rr*0.55,-rr*0.5,rr*0.5,rr*1.0);
    var cz=0.5+0.5*Math.sin(tt*3); ctx.globalAlpha=al*(0.4+cz*0.5); ctx.fillStyle='#F1D27A'; ctx.beginPath(); ctx.arc(rr*0.5,0,rr*0.1,0,6.2832); ctx.fill();
  } else if(fac==='freelancer'){
    ctx.strokeStyle='#5EEAD4'; ctx.shadowColor='#5EEAD4'; ctx.beginPath(); ctx.moveTo(rr*0.9,0); ctx.lineTo(rr*0.4,-rr*0.15); ctx.lineTo(rr*0.4,rr*0.15); ctx.closePath(); ctx.stroke();
  }
  /* scoundrel = the default dirty hull; no overlay. */
  ctx.shadowBlur=0; ctx.restore();
}
```

Wire into `drawEnemy` (6779), inside the open `translate/rotate` block:

```js
    if(sp>12){ /* ...existing thruster wedge... */ }
    /* P6 Art#1: darker faction-tinted hull fill so factions differ in VALUE, not just accent line */
    var _ft=FAC_TINT[fac]; if(_ft){ ctx.save(); ctx.globalAlpha=al*0.5; ctx.fillStyle=_ft; ctx.beginPath(); ctx.arc(0,0,rr*0.9,0,6.2832); ctx.fill(); ctx.restore(); }
    drawHullShape(ctx, ship, rr, col, al, e.t, fc);
    drawFacOverlay(ctx, fac, rr, col, al, e.t);   /* <-- ADD */
    if(d.behavior==='sniper' && e.charge>0){ /* ...existing... */ }
```

## P6.2 Nebula weather — per-theme drifting gradient + shooting stars

Add near `LEVELS` + after `starfield` (after 4321):

```js
/* P6 weather: each wave theme paints the void a different colour. Keyed to LEVELS[].theme. */
var THEME_NEB={
  toll:'#1d3a6b', smashgrab:'#243a4e', claimjump:'#2a4a52', softening:'#3a2f5a',
  boss1:'#4a1e2e', refugee:'#2e3a58', alien1:'#3a1e52', redledger:'#4a1424',
  minelayer:'#40381e', boss2:'#4a2214', audit:'#403052', sporetide:'#2a1e4a',
  headhunt:'#123c38', siegeworks:'#1e3050', boss4:'#3a1450', warlord:'#4a2a10',
  broodguard:'#3a1440', reckoning:'#3a1830', storm:'#301838', boss3:'#4a0f24'
};
function hexToRGBA(h,a){ var n=parseInt(h.slice(1),16); return 'rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+','+a+')'; }
var nebPhase=0;
function nebula(dt){
  var L=LEVELS[level-1]||{}, base=THEME_NEB[L.theme]||'#20304f';
  nebPhase+=dt*0.06;
  ctx.save(); ctx.globalCompositeOperation='lighter';
  var cxo=(-cx*0.10), cyo=(-cy*0.10);
  var c1x=W*0.32+Math.sin(nebPhase)*W*0.10+cxo%W, c1y=H*0.4+Math.cos(nebPhase*0.8)*H*0.08+cyo%H;
  var g1=ctx.createRadialGradient(c1x,c1y,0,c1x,c1y,Math.max(W,H)*0.55);
  g1.addColorStop(0,hexToRGBA(base,0.16)); g1.addColorStop(0.5,hexToRGBA(base,0.06)); g1.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=g1; ctx.fillRect(0,0,W,H);
  var c2x=W*0.7-Math.cos(nebPhase*0.7)*W*0.12+cxo%W, c2y=H*0.62+Math.sin(nebPhase*1.1)*H*0.10+cyo%H;
  var g2=ctx.createRadialGradient(c2x,c2y,0,c2x,c2y,Math.max(W,H)*0.45);
  g2.addColorStop(0,hexToRGBA(base,0.12)); g2.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=g2; ctx.fillRect(0,0,W,H);
  ctx.restore();
  if(!reduceMo){
    var rate=(L.theme==='storm'||L.theme==='reckoning')?0.05:0.018;
    if(Math.random()<rate*dt*60){ var sa=Math.PI*(0.15+Math.random()*0.2); shootStars.push({x:Math.random()*W, y:-20, vx:Math.cos(sa)*(520+Math.random()*380), vy:Math.sin(sa)*(520+Math.random()*380), life:0.7, col:hexToRGBA(base,1)}); }
    shootStars=shootStars.filter(function(s){ s.x+=s.vx*dt; s.y+=s.vy*dt; s.life-=dt;
      ctx.save(); ctx.globalAlpha=Math.max(0,s.life)*0.9; ctx.strokeStyle='#dff1ff'; ctx.lineWidth=1.6; ctx.shadowColor=s.col; ctx.shadowBlur=10;
      ctx.beginPath(); ctx.moveTo(s.x,s.y); ctx.lineTo(s.x-s.vx*0.03,s.y-s.vy*0.03); ctx.stroke(); ctx.restore(); return s.life>0 && s.y<H+30; });
  }
}
```

Wire between `starfield(px,py)` and the lead-camera math (after 7461, before the world translate):

```js
    starfield(px,py);
    if(view==='play'||view==='menu') nebula(rdt);   /* rdt so weather keeps drifting during hitstop */
```

## P6.3 Haven damage states in `drawHaven`

Insert before the closing `drawTraders(); drawRescue();` (before 6151), drawing damage un-rotated over the hull center:

```js
    /* P6: THE HAVEN wears its wounds. */
    var hf=frac;
    if(hf<0.60){
      var nb=hf<0.30?4:2, bi;
      for(bi=0;bi<nb;bi++){ if(Math.random()<0.4){
        var ba=Math.random()*6.2832, brd=30+Math.random()*70, bx=Math.cos(ba)*brd, by=Math.sin(ba)*brd*0.9;
        ctx.save(); ctx.globalAlpha=0.7+Math.random()*0.3; ctx.strokeStyle='#bfe0ff'; ctx.lineWidth=1+Math.random(); ctx.shadowColor='#7FA8FF'; ctx.shadowBlur=8;
        ctx.beginPath(); ctx.moveTo(bx,by); ctx.lineTo(bx+(Math.random()-0.5)*14, by+(Math.random()-0.5)*14); ctx.stroke(); ctx.restore();
      }}
    }
    if(hf<0.30){
      var fi; for(fi=0;fi<3;fi++){ var fy=-60+fi*55, fz=0.5+0.5*Math.sin(t*7+fi*2);
        var fg=ctx.createRadialGradient(0,fy,1,0,fy,16+fz*8); fg.addColorStop(0,'rgba(255,180,80,'+(0.6+fz*0.3)+')'); fg.addColorStop(0.5,'rgba(224,60,40,'+(0.3*fz)+')'); fg.addColorStop(1,'rgba(224,60,40,0)');
        ctx.save(); ctx.globalAlpha=0.9; ctx.fillStyle=fg; ctx.beginPath(); ctx.arc((fi-1)*14,fy,16+fz*8,0,6.2832); ctx.fill(); ctx.restore();
      }
      if(!defendNode._evac){ defendNode._evac={x:0,y:74,vx:40+Math.random()*30,vy:20,t:0}; }
      var ev=defendNode._evac; ev.x+=ev.vx*0.016; ev.y+=ev.vy*0.016; if(ev.x>320){ ev.x=0; ev.y=74; ev.vx=40+Math.random()*30; }
      ctx.save(); ctx.translate(ev.x,ev.y); ctx.rotate(Math.atan2(ev.vy,ev.vx)); ctx.fillStyle='#F1D27A'; ctx.strokeStyle='#E0703C'; ctx.shadowColor='#F1D27A'; ctx.shadowBlur=6; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(6,0); ctx.lineTo(-4,-3); ctx.lineTo(-4,3); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.globalAlpha=0.6; ctx.fillStyle='#E0703C'; ctx.beginPath(); ctx.arc(-6,0,1.4+Math.random(),0,6.2832); ctx.fill(); ctx.restore();
    }
```

Section lights going dark — edit 6125 and 6144:

```js
    for(i=0;i<7;i++){ if((i*7)%3===0) continue; if(frac<0.6 && (i%2===0) && Math.random()<0.5) continue;
      ctx.fillRect(-9,-84+i*22,4,2.2); ctx.fillRect(5,-84+i*22,4,2.2); }
```
```js
    for(i=-2;i<=2;i++){ if(frac<0.35 && Math.random()<0.4) continue; ctx.globalAlpha=0.4+0.5*Math.abs(Math.sin(t*3+i)); ctx.fillStyle='#bff6ec'; ctx.beginPath(); ctx.arc(0,i*36,1.8,0,6.2832); ctx.fill(); }
```

`defendNode._evac` clears automatically since `startLevel` (5650) builds a fresh `defendNode` each defend wave.

## P6.4 Juice P1 — letterbox intro, clear killcam, combo pitch-rise, boss spotlight

### P6.4a Wave-intro letterbox — replace the `showBanner` at 5656 with a letterbox trigger, add after 5654 (`musStart(...)`):

```js
    var domFac = L.pool ? eFacOfKey(L.pool[0]) : 'scoundrel';
    LETTER={t:0.8,dur:0.8,name:'WAVE '+n, sub:L.story||'', col:(FACTIONS[domFac]||{}).col||'#22D3EE', sig:domFac, fired:false};
    sfx('klaxon');
```

Helper near `eFac` (4374): `function eFacOfKey(k){ return (ROSTER[k]&&ROSTER[k].fac)||'scoundrel'; }`

`klaxon` voice in `sfx` (after the `heart` branch ~4680):

```js
    else if(kind==='klaxon'){ tone(c,440,300,n,0.28,0.05,'sawtooth'); tone(c,300,220,n+0.3,0.34,0.05,'sawtooth'); }
```

Draw as a screen-space overlay after `updateHud()` (after 7576):

```js
    /* ===== P6 letterbox / killcam / boss-dim overlays (screen space, post-HUD) ===== */
    if(LETTER.t>0){ LETTER.t-=rdt; var p=1-Math.max(0,LETTER.t)/LETTER.dur, ease=p<0.5?p*2:1;
      var bh=Math.min(0.14,ease*0.14)*H; ctx.save();
      ctx.fillStyle='rgba(0,0,0,0.82)'; ctx.fillRect(0,0,W,bh); ctx.fillRect(0,H-bh,W,bh);
      ctx.globalAlpha=Math.min(1,ease*1.4);
      ctx.fillStyle=LETTER.col; ctx.shadowColor=LETTER.col; ctx.shadowBlur=16; ctx.textAlign='center';
      ctx.font="800 34px 'Orbitron',sans-serif"; ctx.fillText(LETTER.name, W*0.5, H*0.5-6);
      ctx.shadowBlur=0; ctx.globalAlpha=Math.min(0.9,ease*1.2); ctx.fillStyle='#dfe6f2'; ctx.font="13px 'Space Mono',monospace";
      ctx.fillText(LETTER.sub, W*0.5, H*0.5+20);
      drawSigil(ctx, LETTER.sig, W*0.5, H*0.5-70, 22, LETTER.col);
      ctx.restore();
      if(!LETTER.fired && p>0.55){ LETTER.fired=true; enemies.forEach(function(e){ grings.push({x:e.x,y:e.y,r:6,a:0.9,col:(FACTIONS[eFac(e)]||{}).col||'#7FA8FF',grow:false,spd:520,lw:2.4}); }); flash=Math.max(flash,0.10); }
    }
```

Sigil drawer near `drawFacOverlay`:

```js
function drawSigil(ctx,fac,x,y,r,col){
  ctx.save(); ctx.translate(x,y); ctx.strokeStyle=col; ctx.fillStyle=col; ctx.lineWidth=2.4; ctx.shadowColor=col; ctx.shadowBlur=12;
  if(fac==='imperial'){ ctx.beginPath(); for(var i=0;i<6;i++){var a=i/6*6.2832-1.5708; ctx[i?'lineTo':'moveTo'](Math.cos(a)*r,Math.sin(a)*r);} ctx.closePath(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0,-r*0.5); ctx.lineTo(0,r*0.5); ctx.moveTo(-r*0.5,0); ctx.lineTo(r*0.5,0); ctx.stroke(); }
  else if(fac==='clan'){ ctx.beginPath(); ctx.moveTo(0,-r); ctx.lineTo(r,r); ctx.lineTo(-r,r); ctx.closePath(); ctx.stroke(); ctx.beginPath(); ctx.arc(0,r*0.2,r*0.3,0,6.2832); ctx.fill(); }
  else if(fac==='alien'){ ctx.beginPath(); for(var s=0;s<3;s++){ ctx.arc(0,0,r*(0.4+s*0.3),0.6,2.5); } ctx.stroke(); ctx.beginPath(); ctx.arc(0,0,r*0.2,0,6.2832); ctx.fill(); }
  else if(fac==='civilian'){ ctx.strokeRect(-r*0.7,-r*0.7,r*1.4,r*1.4); }
  else if(fac==='freelancer'){ ctx.beginPath(); ctx.arc(0,0,r,0,6.2832); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0,-r); ctx.lineTo(0,r); ctx.stroke(); }
  else { ctx.beginPath(); ctx.arc(0,0,r,0.4,5.8); ctx.stroke(); ctx.beginPath(); ctx.moveTo(r*0.7,-r*0.5); ctx.lineTo(r,0); ctx.lineTo(r*0.5,r*0.3); ctx.stroke(); }
  ctx.restore();
}
```

### P6.4b Wave-clear killcam — trigger in `levelDone` after `var rew=...` (5690)

```js
    var _lk = enemies.length ? enemies[enemies.length-1] : null;
    CLEARCAM={t:1.6, x:_lk?_lk.x:cx, y:_lk?_lk.y:cy, payFrom:0, payTo:rew, payShown:0, tick:0, stampT:1.6};
    slowmo=0.3; slowmoT=0.55;
```

Slow-mo scaling — after the `hitstop` line (7441):

```js
    if(hitstopT>0){ hitstopT-=rdt; dt=0; }
    if(slowmoT>0){ slowmoT-=rdt; dt*=slowmo; if(slowmoT<=0) slowmo=1; }   /* <-- ADD */
```

Draw the stamp + count-up in the same post-HUD block:

```js
    if(CLEARCAM.t>0){ CLEARCAM.t-=rdt;
      CLEARCAM.payShown+=(CLEARCAM.payTo-CLEARCAM.payShown)*Math.min(1,rdt*4);
      CLEARCAM.tick-=rdt; if(CLEARCAM.tick<=0 && CLEARCAM.payShown<CLEARCAM.payTo-1){ CLEARCAM.tick=0.05; sfx('coin'); }
      var ez=Math.min(1,(1.6-CLEARCAM.t)/0.3);
      ctx.save(); ctx.textAlign='center';
      ctx.globalAlpha=Math.min(1,ez); ctx.fillStyle='#5EEAD4'; ctx.shadowColor='#5EEAD4'; ctx.shadowBlur=18;
      ctx.font="800 40px 'Orbitron',sans-serif"; ctx.fillText('WAVE CLEAR', W*0.5, H*0.42);
      ctx.shadowBlur=6; ctx.fillStyle='#F1D27A'; ctx.font="700 26px 'Space Mono',monospace";
      ctx.fillText('+'+Math.round(CLEARCAM.payShown)+' CR', W*0.5, H*0.42+40);
      ctx.restore();
    }
```

### P6.4c Combo pitch-rise — in `killEnemy` after `combo++` (5424):

```js
    comboPitch=Math.min(2.0, 1+combo*0.05);
```

Decay in the loop where `comboT` decays (7474):

```js
      if(comboT>0){ comboT-=dt; if(comboT<=0){ combo=0; mult=1; comboLatch=false; comboPitch=1; } }
      else if(comboPitch>1){ comboPitch+=(1-comboPitch)*Math.min(1,dt*1.5); }
```

Apply in the kill sound. `sfx` crunch branch (4675) reads `sfxPitch`:

```js
  function sfx(kind){ if(reduceMo||muted) return; var c=sac(); if(!c) return; if(c.state==='suspended'){ c.resume(); } var n=c.currentTime, P=sfxPitch; sfxPitch=1;
    if(kind==='fire'){ /* ... */ }
    else if(kind==='crunch'){ var cj=(0.9+Math.random()*0.2)*P; tone(c,240*cj,52*cj,n,0.16,0.07,'square'); noise(c,n,0.12,0.05); tone(c,110*P,40*P,n+0.01,0.14,0.045,'sine'); }
```

At 5393 set the pitch before the kill sfx: `if(!byNpc){ /*...*/ sfxPitch=comboPitch; sfx(e.elite?'boomBig':'crunch'); }`

### P6.4d Boss-intro darken + spotlight — after `sfx('boss')` in `startBoss` (5501):

```js
    BOSSDIM={t:1.4, x:boss.x, y:boss.y, col:B.col};
```

Draw after `drawBoss()` (7546), before the screen `ctx.restore()`:

```js
    if(BOSSDIM.t>0 && boss){ BOSSDIM.t-=rdt; var din=Math.min(1,BOSSDIM.t/1.4)*0.72;
      ctx.save();
      var sg=ctx.createRadialGradient(boss.x,boss.y,boss.rad*0.6,boss.x,boss.y,Math.max(W,H)*0.7);
      sg.addColorStop(0,'rgba(0,0,0,0)'); sg.addColorStop(0.35,'rgba(0,0,0,0)'); sg.addColorStop(1,'rgba(2,4,10,'+din.toFixed(3)+')');
      ctx.fillStyle=sg; ctx.fillRect(cx-W,cy-H,W*2,H*2);
      ctx.globalAlpha=din*0.5; ctx.strokeStyle=BOSSDIM.col; ctx.lineWidth=2; ctx.shadowColor=BOSSDIM.col; ctx.shadowBlur=20;
      ctx.beginPath(); ctx.arc(boss.x,boss.y,boss.rad+18,0,6.2832); ctx.stroke(); ctx.restore();
    }
```

## P6.5 Music layers — extending the existing engine (no new AudioContext)

### P6.5a Per-theme pad hue via the existing low-pass — edit 7370:

```js
    if(MUS.flt){ var calm=(MUS.theme==='return_'||MUS.theme==='dock'||MUS.theme==='menu'||MUS.theme==='armory');
      var padHz=(THEMES[MUS.theme]&&THEMES[MUS.theme].padHz)||0;
      var tgt=calm?1700:(950+(MUS.intensity||0)*9500)+padHz;
      MUS.flt.frequency.setTargetAtTime(tgt, c.currentTime, 0.45); }
```

Add `padHz` to theme rows (7302) for flavor (alien darker, boss brighter).

### P6.5b Intensity swells when enemies are near the Haven — replace `else if(mode==='playing')` at 7539:

```js
      if(MUS.on){ var inten=0;
        if(mode==='boss') inten=0.62;
        else if(mode==='playing'){
          inten=Math.min(0.5,enemies.length*0.06)+(player.firing?0.12:0)+((player.hp/player.hpMax)<0.3?0.22:0);
          if(defendNode){ var near=0,ii; for(ii=0;ii<enemies.length;ii++){ var e2=enemies[ii]; if(Math.hypot(e2.x,e2.y)<DOCK_R+200){ var tf=eFac(e2); if(tf!=='civilian'&&!(tf==='imperial'&&wanted<=0)) near++; } }
            inten+=Math.min(0.30, near*0.05);
            if(defendNode.hp/defendNode.hpMax<0.35) inten+=0.18; }
        }
        if(player.knifeT>0) inten+=0.2;
        MUS.intensity+=(Math.min(1,inten)-MUS.intensity)*Math.min(1,dt*2.5); }
```

### P6.5c Boss stings — near `musAccent` (7277):

```js
  function musSting(){ var c=sac(),bus=musBus(); if(!c||!bus||muted||!MUS.on) return; var t0=c.currentTime+0.01, root=3;
    mTone(nf(root),t0,0.5,0.09,'sawtooth'); mTone(nf(root+3),t0,0.5,0.06,'sawtooth'); mTone(nf(root-12),t0,0.7,0.08,'sawtooth'); }
```

Fire from shadow second-wind in `bossFire` (5504):

```js
    var sw=(boss.num===3&&boss.secondWind); if(sw && !boss._stung){ boss._stung=true; musSting(); }
```

General enrage sting in the loop (7522):

```js
      if(mode==='boss'&&boss){ if(!boss._enStung && boss.hp/boss.hpMax<0.3){ boss._enStung=true; musSting(); } updateBoss(dt); }
```

## P6.6 Juice P2 — trails, afterimages, crit floaters, module beacons, button states

### P6.6a Thruster trails — before `drawShip()` (7552):

```js
    if(view==='play'&&(mode==='playing'||mode==='boss'||mode==='return')){ var psp=Math.hypot(player.vx,player.vy);
      if(psp>40 && !reduceMo){ var back=player.ang+Math.PI, tl=Math.min(1,psp/420);
        booms.push({x:cx+Math.cos(back)*shipR*0.8, y:cy+Math.sin(back)*shipR*0.8, vx:Math.cos(back)*psp*0.3+(Math.random()-0.5)*30, vy:Math.sin(back)*psp*0.3+(Math.random()-0.5)*30, life:0.18+tl*0.22, col:tl>0.7?'#bfe0ff':'#7FA8FF'}); }
    }
```

### P6.6b Dash afterimages — at dash start:

```js
    for(var ai=0;ai<3;ai++) afterimgs.push({x:cx-player.vx*0.02*ai, y:cy-player.vy*0.02*ai, ang:player.ang, a:0.5-ai*0.12});
```

Draw + decay before `drawShip()`:

```js
    afterimgs=afterimgs.filter(function(g){ g.a-=rdt*2.2;
      ctx.save(); ctx.globalAlpha=Math.max(0,g.a); ctx.translate(g.x,g.y); ctx.rotate(g.ang);
      ctx.strokeStyle='#22D3EE'; ctx.lineWidth=1.4; ctx.shadowColor='#22D3EE'; ctx.shadowBlur=8;
      ctx.beginPath(); ctx.moveTo(shipR,0); ctx.lineTo(-shipR*0.6,-shipR*0.6); ctx.lineTo(-shipR*0.6,shipR*0.6); ctx.closePath(); ctx.stroke(); ctx.restore(); return g.a>0; });
```

### P6.6c Crit floaters — in `dmgEnemy` where `MS.critPct` applies (set a local `isCrit`):

```js
    if(isCrit){ floaters.push({x:e.x+(Math.random()-0.5)*10, y:e.y-rr-4, vy:-40, a:1.3, txt:'CRIT '+Math.round(dmg), col:'#F1D27A'}); }
```

### P6.6d Module beacon pillars — in `drawHaven` after 6142 (rotated scope):

```js
    function pillar(x, col, h){ var g=ctx.createLinearGradient(x,-140,x,-140-h); g.addColorStop(0,hexToRGBA(col,0.5)); g.addColorStop(1,hexToRGBA(col,0)); ctx.save(); ctx.globalAlpha=0.6+0.2*pz; ctx.fillStyle=g; ctx.fillRect(x-2,-140-h,4,h); ctx.restore(); }
    if(MSHIP.market>0) pillar(-62,'#F1D27A',30+MSHIP.market*14);
    if(MSHIP.turret>0) pillar( 0,'#F97316',30+MSHIP.turret*14);
    if(MSHIP.repair>0) pillar( 62,'#5EEAD4',30+MSHIP.repair*14);
```

### P6.6e Button hover/press — append to the `<style>` block (~3241), guard ~3592:

```css
.go-btn,.dk-buy,.dk-fbuy,.dk-frame,.dr-card,.wp-card,.evo-card{transition:transform .10s cubic-bezier(.2,1.6,.4,1),box-shadow .12s ease,filter .12s ease}
.go-btn:hover,.dk-buy:hover,.dk-fbuy:hover,.dr-card:hover,.wp-card:hover,.evo-card:hover{transform:translateY(-2px);filter:brightness(1.12);box-shadow:0 6px 20px rgba(34,211,238,.22)}
.go-btn:active,.dk-buy:active,.dk-fbuy:active,.dr-card:active,.wp-card:active,.evo-card:active{transform:translateY(0) scale(.97);filter:brightness(.95)}
@media(prefers-reduced-motion:reduce){.go-btn,.dk-buy,.dk-fbuy,.dk-frame,.dr-card,.wp-card,.evo-card{transition:none;transform:none}}
```

## P6.7 Economy verification

Add a dev-only ledger wrapping `addCredits`:

```js
/* P6 economy ledger: dev-only running tally of every credit source, checked against §h */
var LEDGER=window.__ledger={wavePay:[], bounty:0, boss:0, salvage:0, total:0, spent:0};
var _addCredits=addCredits;
addCredits=function(n){ LEDGER.total+=n; LEDGER.wavePay.push({lvl:level, n:n, mode:mode}); return _addCredits(n); };
window.__economyReport=function(){
  var EXPECT=[]; for(var L=1;L<=20;L++){ var base=Math.round((55+L*22)); EXPECT.push({lvl:L, wavePay:base}); }
  var sumPay=LEDGER.wavePay.reduce(function(a,b){return a+b.n;},0);
  return { hWavePayFormula:'55 + level*22', collectedTotal:LEDGER.total, waveEvents:LEDGER.wavePay.slice(),
    expectedFullRunWavePay: EXPECT.reduce(function(a,b){return a+b.wavePay;},0),
    bossBounties:[640,1100,1800], eliteBounty:180, note:'run __economyReport() at the end of a full clear; collectedTotal should ≈ expectedWavePay + bounties + salvage' };
};
```

> **Wrap ordering:** apply the P3.4 crew-mul edit to the base `addCredits` first, then this P6 wrapper. The wrapper must call `_addCredits` (the real one), so define it last.

## ✅ P6 VERIFY

**Playtest A — Economy solvency:**
- [ ] Reach wave 5 able to afford one MSHIP facility without perfect play.
- [ ] After boss 1, the weapon drop + 640 bounty covers a frame deposit or a facility.
- [ ] By wave 15, a cautious player can afford Hauler (2200 post-reprice) OR two facilities, not both.
- [ ] `__economyReport().collectedTotal` for a no-death run within ±10% of `expectedFullRunWavePay + bounties`.

**Playtest B — Juice/readability:**
- [ ] Name the faction of an incoming ship from silhouette alone in <0.5s — imperial fin, clan spurs, alien ribs, civilian pods.
- [ ] Letterbox clears in ~800ms; enemies warp-flash *during* it.
- [ ] Killcam slow-mo reads as a beat; payout count-up finishes before the dock prompt.
- [ ] Nebula legible under combat (check `storm`, `boss3`).
- [ ] Haven damage escalates: sparks at 59%, fires+evac at 29%, sections dark.

**Playtest C — Audio/perf:**
- [ ] Music intensity swells when enemies mass near the Haven, settles when clear.
- [ ] Boss stings fire exactly once on enrage / shadow second-wind (latches).
- [ ] Combo pitch-rise climbs over a streak, resets on drop; no runaway.
- [ ] ~60fps desktop / ~30fps hidden-tab with nebula + trails + afterimages + fires on a wave-20 cap.
- [ ] All new visuals honor `reduceMo`.

**Integration summary:** juice-state ~3967 · `drawFacOverlay`/`FAC_TINT`/`drawSigil` after 6770 · `drawEnemy` wiring 6779 · `THEME_NEB`/`nebula` after 4321, call after 7461 · Haven damage before 6151, lights 6125/6144 · letterbox trigger `startLevel` after 5654, `klaxon` ~4680, `eFacOfKey` ~4374 · overlays post-`updateHud()` after 7576, boss-dim after 7546 · killcam `levelDone` after 5690, slow-mo after 7441 · combo pitch `killEnemy` 5424/5393, decay 7474, `sfx` crunch 4675 · music padHz 7370, intensity 7539, `musSting` 7277, enrage 7522 · trails/afterimages/crit before 7552 · beacon pillars 6142 · button CSS 3241 · economy ledger wraps `addCredits`.

---

# DEFINITION OF DONE — ACCEPTANCE CHECKLIST

Every original owner ask mapped to where it is satisfied.

| Owner ask (R#) | Satisfied by | Where in code | Ship-check |
|---|---|---|---|
| **Dash / shoot / energy** (R1) | Existing dash, fire, one energy pool | `updateShip`, `fireWeapon` (~7515), energy (4195) | Dash-boost-shoot beats 1.0 from rank 0. **Built P0.** |
| **Deeper outfitting** (R2) | Refit rigs + utility modules + EQUIP sockets + Weapon Lab + crew slots + gear | **P3.6** Refit; `EQUIP` (4229), `WLAB` (4222), `GEAR` (4115) | Two saved builds play measurably differently vs wave 13 (**P3 Verify #4**). |
| **Skills to 10 + Engineering** (R3) | `SKILL_MAX=10`, breakpoints 3/6/9 + capstone, Engineering weld; Combat skill | `recomputeStats` (4199-4238), weld (7484-7513), **P4.7** Combat | Rank-8 Hauler out-turns rank-0 Gunship. **Built P0; Combat P4.** |
| **Hull + shield layers** (R4) | Player double-bar; Haven shield; enemy two-layer + ion | `dmgEnemy` (4255), HUD `gHavenWrap` | Double bars from wave 1; shielded enemies. **Built P1/P1.5.** |
| **Faction choice + Imperial help + outlaw** (R5) | Per-run `REP`, capped drift, all-band branches, Imperial assist, Black Market, Scoundrel's Pact | `REP` (4364), **P5.3** branches, **P5.4** Black Market | One fun run each alignment; Watched wave 11 works; Outlaw income ±10% (**P5 Verify #6-8, #12**). |
| **20 waves / 4 bosses** (R6) | `LEVELS[20]`, boss ids 1/2/4/3 at 5/10/15/20, `openFinalUp` at 20 | `LEVELS`, `startLevel` boss case, `BOSSES`, **P5.1** Broodmother, **P5.2** Shadow | Full campaign; finale at wave 20 only (**P5 Verify #1, #5**). |
| **Wave mini-stories** (R7) | `theme/story/pool` + intro letterbox + banners + faction silhouettes | `startLevel` (5656), **P6.1** silhouettes, **P6.4a** letterbox | Every wave shows its line and faction. **Story P1; silhouettes P6.** |
| **Story cards** (R8) | 20-card deck, `waveMod`/`priceMod`, rep, chains, warp-path gate | **P2** entire phase (`CARD_DECK`, `applyOutcome`, `pickCard`, gate at §P2.8) | Choices change the next wave AND prices; cards fire on the warp path (**P2 Verify #1-4, #7**). |
| **Boarding** (R9) | `mode==='boarding'` freeze, E-breach, charges, split timers, gear, true ending | **P4** entire phase; Broodmother/Shadow interiors **P5.1e/P5.2c** | Board the Broodmother and extract; failure is fun (**P4 Verify #2, #5, #6**). |
| **Crew** (R10/R2) | `CREW` 5 roles, bar hiring, injury timers, loyal epilogue + 50% rehire, barks | **P3** entire phase (`CREW` 4366, `CREW_POOL` 4116) | Gunner drains energy + 1-cap; injured grayed exactly 2 waves (**P3 Verify #1, #5, #7**). |
| **Clear economy** (R11) | Full reprice to §h, Entrepreneur payout/chip mults, trade-in, discount cap | **P5.5**; `addCredits` (4149), `barterPrice`, `mshipCost` | Full-run ledger within ±15% of §h on zero-Entrepreneur baseline (**P6.7 / P5 Verify #10**). |
| **Not-boring art / juice** (R12) | JUICE, hitstop, shake, kill flashes, silhouettes, nebula, Haven damage, killcam, music layers | JUICE/`hitstop`/`shakeImpulse`, **P6** entire phase | Per-theme screenshots distinct; kills land hard (**P6 Playtest B/C**). **Juice P0; art/music P6.** |
| **Multiplayer-later** (R13) | Architecture-only: single `applyOutcome`, actor-arg systems, `/* MP: */` on space-freeze, seedable RNG | **P2** `applyOutcome`, **P4** actor args, cross-cutting §C.5 | No netcode; the 5 avoid-list constraints honored from P2 on. |
| **ADDICTIVE** (R14) | Core-loop hooks, card cadence, killcam, count-up debrief, boarding near-miss | Loop cadence, `endGame` debrief (5075), **P6** tuning | Playtester unprompted starts wave N+1 at waves 6/13/19 — the P6-done gut-check. |

**Global done bar (every phase):** load file → `__dbg()` before/after the feature → `__shot()` capture → play 3+ waves touching the feature → **zero console errors** → pre-2.0 save-load check passes → final pass **without godmode**. P6 adds: 3 full playtests (loyalist / outlaw / greedy-neutral) with the "would I play one more wave?" check at waves 6, 13, 19 — any "no" is a pacing bug, not a ship.

**Two ambiguities resolved (carry these into every session):**
1. **`shadowCore`** — treat as a **permanent unlock** folded into `WPN_UNLOCKED` (token stays at earned value), consistent with every other unlock in the codebase, rather than a consumable spent on new-run start. (If you deliberately want the consumable feel, the `startRun` code in P5.6b ships that instead — but ship only one.)
2. **The `frameRig` vs `bdg_refit` save shape** — ship the grounded P3.6 `frameRig` (id strings, saved with `bdg_frame`) version; the cross-cutting `bdg_refit`/numeric-index scheme is the same data in a different encoding. Do not ship both.