# THE FREEDOM INTERIOR EXPANSION BIBLE
### FTL-Style Interior · Riftwork Exotic Arms · Salvage & Tractor · Tab Inventory · Self-Upgrading Haven

**Target file:** `Games/methodas space game/Brand Defense Grid.html` (~8,300 lines, single-file vanilla-JS canvas, no build tools — everything below is pasted into that one file). Line numbers are anchors from the current snapshot and drift ±60 as edits land — **anchor by symbol name, not line number.** Design language everywhere: sheet **runabout-modern-D** — matte charcoal + ONE flat livery color in knife-sharp zones + white neon seam-strips + embedded ring thrusters. 2085 industrial, not 2020 jet fighter.

---

## THE ERA (opening lore — this goes in the codex verbatim)

By 2085 nobody fires mass anymore. Two things killed kinetics: **harmonic shielding** — the phased-energy skins every hull wears shrug off dumb momentum, shattering slugs into harmless plasma dust — and **the Ejecta Accords**, signed after the Ceres Relay was holed by a century-old stray round still coasting at 4 km/s: putting untraceable permanent debris on an orbit became the one crime every faction agrees to prosecute. Chemical propellant and warheads followed; ship magazines became energy banks. What replaced them split into two schools. **Coherent-energy arms** (CE arms) shape the ship's reactor flux into bolts, lances and scatter-fans — cheap, legal, everywhere. **RIFTWORK** is the other school: weapons that don't throw energy *through* space but spend it *deforming* space — pocket gravity wells, phase-slipped lances, dilation fields. Riftwork is Accord-restricted, clan-smithed, and half-feared, because a rift arm doesn't care whose shield harmonics are in the way: it bends the map everyone is standing on. That's the fantasy of the Rift Bay — you're not shooting at the dogfight, you're editing it.

### The exotic-weapon class name (E4 sub-task: 3 options proposed, one picked)

| Option | Rationale | Risk |
|---|---|---|
| **RIFTWORK** | Weapons that *work the rift*. Artisanal/industrial — "riftwright", "rift-forged", "riftwrought" — fits the matte-charcoal 2085 register. | Slightly fantasy-adjacent |
| **X-PHYS** ("Exotic-Physics Array") | Short, technical, reads on HUD chips. | Generic; no story in it |
| **METRIC ARMS** | Hard-SF (deforms the spacetime metric tensor). | Dry, less flavor |

**PICKED: RIFTWORK** — used consistently in every section, label, room name, and codex entry of this document. Vocabulary lock: the exotic bay is the **Rift Bay** (room id `wepB`); individual weapons are **rift arms**; standard weapons are **CE arms** mounted in the **Lance Bay** (room id `wepA`); the tech verb is **riftwrought**. Any prior working name (X-PHYS) is superseded.

---

## CONFLICT RESOLUTIONS (canon decisions — read before building)

The six source specs disagreed in places. These are the binding answers; everything below is already rewritten to match.

| # | Conflict | Canon decision |
|---|---|---|
| C1 | Exotic class name: X-PHYS vs RIFTWORK | **RIFTWORK.** Room label RIFT BAY, class label RIFT, CE side is LANCE BAY. |
| C2 | Room ids: `wpnE/wpnX/core/quarters` vs `wepA/wepB/energy/qtrs` | **`wepA, wepB, shield, engine, energy, life, tractor, qtrs, helm`** (+ layout-only `cargo`, `turret`). EQUIP is keyed by these. |
| C3 | Slot counts per room per frame (two tables disagreed) | **`FRAMES[f].rooms{}` is the single source of truth** (§2.2). `INTERIORS` layout rooms carry NO `slots` field — they read `curFrame().rooms[type]`. |
| C4 | RMB / `weapon2`: keep `wSlots>=2` gate, or swap-fire on small hulls, or ungate? | **One answer: RMB always fires the Rift Bay (`player.weapon2`) on every frame.** `hasW2()` drops the `wSlots>=2` gate (§3.5). `wSlots` continues to gate ONLY turret/reflect caps via `shipMax()` — untouched. A legacy CE weapon sitting in slot 2 still fires via the existing swap trick. Empty Rift Bay = RMB does nothing + "PROJECTOR NOT FITTED" hint. This is what satisfies E4's "two weapon bays on the starter fighter". |
| C5 | Tractor modules: `trange/tgrip/tdual` in `EQUIP.tractor` vs `tbRange/tbGrip/tbWinch` in `EQUIP.tb` | **One set: `trange`, `tgrip`, `tdual`, socketed in `EQUIP.tractor`** (§2.3). `EQUIP.tb` never exists. Latch range 90 → ×1.4 = 126 with `trange`. Tow penalty model is the radius-scaled one (§5.3); `tgrip` relieves 45% of it per socketed copy. |
| C6 | Tractor rank/`bdg_tractor` key vs always-installed | **Tractor beam is standard equipment on every hull** (E4 requires the room on the starter). No `TRACTOR.rank`, no `bdg_tractor` key. |
| C7 | Rest mechanic: interior spec's free-rest/fatigue vs loop spec's three boons | **The three-boon dock rest is canon** (§6.3). Quarters modules (`qbunk/qgalley/qrec`) hook into it as written in §6.3.4. The fatigue idea is dropped (one system, not two). |
| C8 | Save version: "no bump needed" vs v3 | **`SAVE_VERSION='3'`.** One migration: EQUIP re-key `w1→wepA, w2→wepB, re→energy` (§2.4). `bdg_cargo` and `bdg_haven` are additive keys (old saves default `{}` / fund 0). |
| C9 | Interior renderer: full `drawShipInterior` vs inventory fallback `INV_ROOMS_FB` | **`drawShipInterior()` ships in phase I1, so the fallback is never built.** Contract: it returns hit-rects for the click/popover layer (§1.3, §4.4). |
| C10 | Cargo drops (20% roll) vs salvage tiers gating drops | **Salvage tiers are the outer gate** (§5.1): VAPORIZED = no cargo/module ever; CLEAN KILL = existing drop table + 20% cargo-crate roll; HULK DELIVERED = guaranteed full bays. |
| C11 | Module catalog: two catalogs with overlapping tractor/weapon entries | **One unified 33-module catalog** (§2.3). The 7 legacy ids kept verbatim; owner's four named modules are `mcharge/mhoming/mnova/mspread`. |
| C12 (E12) | Owner says "15 levels"; game has **20 waves** (built at the owner's earlier request) | **FLAGGED, not changed.** Everything in this bible is per-wave/per-5-wave-block and works for either count. Recommendation: keep 20. If the owner confirms 15: cut pure-defend waves 2, 4, 11, 17, 19; move bosses to 4/8/11/14/15; multiply wave rewards ×1.33. **Needs an owner decision — do not silently change `LEVELS`.** |

---

# 1) SHIP INTERIOR MODEL & VIEW (E2, E3, E4, E10, E11)

## 1.1 Grounding — what exists

| System | Where | Shape |
|---|---|---|
| `FRAMES` | ~4038 | `runabout{wSlots:1,tSlots:1,sSlots:1,crewSlots:1}`, `hauler{1,2,1,2}`, `gunship{2,2,2,3}` |
| `SHIP` ranks | ~4036 | `{hull,shield,engine,weapon,utility,cargo,energy,reflect,turret,drone}`, `shipMax()` ~4059 |
| `MODULES/INV/EQUIP` | ~4143–4155 | `EQUIP={w1:[2],w2:[2],re:[2]}` (pre-migration) |
| `WLAB` marks | ~4158 | reactor/split/coil/pierce/cycler, consumed in `recomputeStats()` ~4286 |
| On-foot interior engine | `boardTemplate()` 6062, `bWalkable()` 6074, `drawBoarding()` 6182 | walkable px-rects; deck-plate gradient `#141d30→#0c1322`, 32px grid, `rgba(127,168,255,…)` strokes |
| Hull art | `drawPlayerHull()` 6311 (nose +x), `LIVERIES` 6300 (`curLivery().base/mid/lit/acc[frame]`) |
| Crew | `CREW_ROLES` 4046, `crewSlots()` 5985 |
| Damage entry | `player.hp-=dmg` ~5271 |
| REP | `var REP={imperial:0,civilian:0,clan:0}` ~4470 |

**Key insight:** the interior view does NOT try to fit rooms inside the combat sprite (its fuselage is ~6 local units wide). Like FTL itself, the interior is a dedicated **deck-plan silhouette per frame**, drawn in the same charcoal + livery + neon language. The combat sprite is untouched. Scale (E10): grid cell = **1.5 m**; runabout = 14×8 cells = **21 m × 12 m — Milano scale**: small, but every room is genuinely walkable.

## 1.2 The interior data model (paste-ready)

Room registry and layouts. `ROOMS` (module-bearing types) is defined in §2.1; this section adds icons, layouts, and per-run condition.

```js
/* 24x24 stroke icon paths, same convention as SKILL_ICON (~4130) */
var ROOM_ICON={
  helm:   'M12 4a8 8 0 0 1 8 8h-4M12 4a8 8 0 0 0-8 8h4M12 4v5M9 15l3-3 3 3',
  wepA:   'M4 12h10M14 8l6 4-6 4zM6 9v6',
  wepB:   'M12 6a6 6 0 1 0 6 6M12 9a3 3 0 1 0 3 3M18 6l-2 2',
  shield: 'M12 3l7 3v6c0 4-3 7-7 8.5C8 19 5 16 5 12V6z',
  engine: 'M6 8h8l4 4-4 4H6zM6 10v4M18 12h3',
  energy: 'M12 5v14M7 8l10 8M17 8L7 16M12 12m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0',
  life:   'M12 4a5 5 0 0 1 5 5c0 4-5 9-5 9s-5-5-5-9a5 5 0 0 1 5-5M9 9h6',
  tractor:'M12 4v6M8 8l4 2 4-2M6 14a6 3 0 0 0 12 0M8 18a4 2 0 0 0 8 0',
  qtrs:   'M4 17V9l4-3v11M8 12h12v5M8 17h12M17 8h3v2h-3z',
  cargo:  'M5 8h14v11H5zM5 12h14M12 8v11',
  turret: 'M12 12L20 6M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0M12 20v-2'
};
/* ===== SHIP INTERIORS (FTL-style deck plans). Grid cell = 1.5m. Nose at +x. =====
   Room ids double as EQUIP keys where id===type. Multi-instance rooms (engineA/B,
   cargoA/B) carry slotOfs/slotN to slice the type's shared EQUIP array.
   station: crew role manning the room (colored dot when hired). */
var INTERIORS={
  runabout:{ gw:14, gh:8, meters:21, /* Milano-scale starter: 21m, 9 compartments */
    outline:[13.9,4, 12.5,1.6, 10,0.7, 3,0.4, 0.2,1.6, 0.2,6.4, 3,7.6, 10,7.3, 12.5,6.4],
    rooms:[
      {id:'helm',   type:'helm',   x:10,y:3,w:2,h:2, station:null},
      {id:'wepA',   type:'wepA',   x:7, y:1,w:3,h:2, station:'gunner'},
      {id:'wepB',   type:'wepB',   x:7, y:5,w:3,h:2, station:null},
      {id:'shield', type:'shield', x:6, y:3,w:2,h:2, station:'shieldtech'},
      {id:'energy', type:'energy', x:4, y:3,w:2,h:2, station:null},
      {id:'life',   type:'life',   x:4, y:1,w:2,h:2, station:null},
      {id:'tractor',type:'tractor',x:4, y:5,w:2,h:2, station:null},
      {id:'qtrs',   type:'qtrs',   x:2, y:3,w:2,h:2, station:'bruiser',
        note:'single apartment: bunk + galley + head'},
      {id:'engine', type:'engine', x:0, y:2,w:2,h:4, station:'engineer'}
    ]},
  hauler:{ gw:18, gh:10, meters:27, /* 11 compartments */
    outline:[17.9,5, 16.2,2.4, 13,1.2, 3.5,0.6, 0.3,2.2, 0.3,7.8, 3.5,9.4, 13,8.8, 16.2,7.6],
    rooms:[
      {id:'helm',   type:'helm',   x:14,y:4,w:2,h:2, station:null},
      {id:'wepA',   type:'wepA',   x:11,y:1,w:3,h:2, station:'gunner'},
      {id:'wepB',   type:'wepB',   x:11,y:7,w:3,h:2, station:null},
      {id:'shield', type:'shield', x:11,y:4,w:2,h:2, station:'shieldtech'},
      {id:'cargoA', type:'cargo',  x:7, y:1,w:3,h:3, station:'quartermaster'},
      {id:'cargoB', type:'cargo',  x:7, y:6,w:3,h:3, station:null},
      {id:'energy', type:'energy', x:7, y:4,w:2,h:2, station:null},
      {id:'life',   type:'life',   x:5, y:1,w:2,h:2, station:null},
      {id:'tractor',type:'tractor',x:4, y:6,w:3,h:3, station:null,
        note:'oversized bay: haulers tow better (E9 hook — 2 tractor slots)'},
      {id:'qtrs',   type:'qtrs',   x:4, y:3,w:3,h:2, station:'bruiser', note:'two bunks (crewSlots:2)'},
      {id:'engine', type:'engine', x:0, y:2,w:3,h:6, station:'engineer', note:'twin block = tSlots:2'}
    ]},
  gunship:{ gw:20, gh:10, meters:30, /* 13 compartments */
    outline:[19.9,5, 17.6,2.2, 14,1, 4,0.4, 0.3,2, 0.3,8, 4,9.6, 14,9, 17.6,7.8],
    rooms:[
      {id:'helm',   type:'helm',   x:16,y:4,w:2,h:2, station:null},
      {id:'wepA',   type:'wepA',   x:12,y:1,w:4,h:2, station:'gunner',
        note:'big bay: 4 boxes now; catalog scales to 10 on capital hulls (E6)'},
      {id:'wepB',   type:'wepB',   x:12,y:7,w:4,h:2, station:null},
      {id:'turret', type:'turret', x:12,y:4,w:2,h:2, station:null},
      {id:'shield', type:'shield', x:9, y:4,w:2,h:2, station:'shieldtech'},
      {id:'energy', type:'energy', x:6, y:4,w:2,h:2, station:null},
      {id:'life',   type:'life',   x:8, y:1,w:2,h:2, station:null},
      {id:'tractor',type:'tractor',x:8, y:7,w:2,h:2, station:null},
      {id:'qtrs',   type:'qtrs',   x:4, y:1,w:3,h:2, station:'bruiser', note:'three bunks (crewSlots:3)'},
      {id:'cargoA', type:'cargo',  x:4, y:7,w:3,h:2, station:'quartermaster'},
      {id:'engineA',type:'engine', x:0, y:1,w:3,h:4, station:'engineer', slotOfs:0, slotN:1},
      {id:'engineB',type:'engine', x:0, y:5,w:3,h:4, station:null,       slotOfs:1, slotN:1}
    ]}
};
function curInterior(){ return INTERIORS[frame]||INTERIORS.runabout; }
/* module boxes a layout room displays: slice of the type's EQUIP array */
function roomSlotSlice(r){ var arr=EQUIP[r.type]||[];
  if(r.slotN==null) return arr;
  return arr.slice(r.slotOfs||0,(r.slotOfs||0)+r.slotN); }
/* per-run room condition: id -> 0..1 (1=healthy). NOT persisted; reset at dock. */
var ROOMHP={};
function roomHp(id){ return (ROOMHP[id]==null)?1:ROOMHP[id]; }
function resetRooms(){ ROOMHP={}; }
/* is this room installed/powered on this hull+build? drives greyed hazard render */
function roomOffline(r){
  if(r.type==='wepB')   return !(player.weapon2&&(RIFT[player.weapon2]||WEAPONS[player.weapon2]));
  if(r.type==='turret') return (SHIP.turret|0)<=0;
  return false;   /* tractor beam is standard equipment on every hull (C6) */
}
```

**E4 count reconcile:** the owner's required list is 9 sections; the runabout carries all 9 as compact compartments — life support and tractor are alcove-sized, so it *reads* as a 7-room fighter plus two alcoves. Room counts per hull (E11): **runabout 9 · hauler 11 · gunship 13**; future frames (corvette/frigate/capital) keep adding cargo holds, turret nests, split engine rooms.

## 1.3 `drawShipInterior(g,w,h)` — the renderer (paste-ready)

Approved language: matte charcoal (`LV.base/mid`), ONE livery accent (`LV.acc[frame]`), white-neon seam rim, ring thrusters. Deck-plate recipe identical to the proven `drawBoarding()` style (6189–6196). **Contract (C9): returns the hit-rect array** `[{id,n,type,x,y,w,h,slots:[modId|null,…]}]` in canvas px for the TAB overlay's click layer (§4.4). Read-only: consumes `INTERIORS, EQUIP, MODULES, CREW, ROOMHP, curLivery(), player.weapon/weapon2, WEAPONS, RIFT, WLAB, SHIP`.

```js
function drawShipInterior(g,w,h){
  var I=curInterior(), LV=curLivery(), AC=LV.acc[frame]||'#22D3EE', HITS=[];
  var pad=18, cs=Math.min((w-pad*2)/I.gw,(h-pad*2)/I.gh);
  var ox=(w-cs*I.gw)/2, oy=(h-cs*I.gh)/2, i,j,r;
  g.save(); g.translate(ox,oy);
  /* 1) silhouette: charcoal fill + white-neon seam rim */
  g.beginPath(); g.moveTo(I.outline[0]*cs,I.outline[1]*cs);
  for(i=2;i<I.outline.length;i+=2) g.lineTo(I.outline[i]*cs,I.outline[i+1]*cs);
  g.closePath();
  g.fillStyle=LV.base; g.shadowColor=AC; g.shadowBlur=14; g.fill();
  g.shadowBlur=0; g.lineWidth=1.6; g.strokeStyle='rgba(220,240,255,0.75)'; g.stroke();
  g.save(); g.clip();
  var wg=g.createLinearGradient(0,0,0,I.gh*cs); wg.addColorStop(0,LV.mid); wg.addColorStop(1,LV.base);
  g.globalAlpha=0.6; g.fillStyle=wg; g.fillRect(0,0,I.gw*cs,I.gh*cs); g.globalAlpha=1;
  /* 2) rooms */
  for(i=0;i<I.rooms.length;i++){ r=I.rooms[i];
    var x=r.x*cs,y=r.y*cs,rw=r.w*cs,rh=r.h*cs, T=ROOMS[r.type], hp=roomHp(r.id), off=roomOffline(r);
    var slots=roomSlotSlice(r);
    HITS.push({id:r.id,n:T.n,type:r.type,x:x+ox,y:y+oy,w:rw,h:rh,slots:slots.slice()});
    var fg=g.createLinearGradient(x,y,x,y+rh); fg.addColorStop(0,'#141d30'); fg.addColorStop(1,'#0c1322');
    g.fillStyle=fg; g.fillRect(x,y,rw,rh);
    if(hp<1){ g.fillStyle='rgba(224,68,124,'+(0.28*(1-hp))+')'; g.fillRect(x,y,rw,rh); }
    g.strokeStyle='rgba(127,168,255,0.10)'; g.lineWidth=1;               /* FTL sub-grid */
    for(j=1;j<r.w;j++){ g.beginPath(); g.moveTo(x+j*cs,y); g.lineTo(x+j*cs,y+rh); g.stroke(); }
    for(j=1;j<r.h;j++){ g.beginPath(); g.moveTo(x,y+j*cs); g.lineTo(x+rw,y+j*cs); g.stroke(); }
    g.lineWidth=1.6; g.strokeStyle=hp<=0?'#E0447C':(hp<1?'rgba(224,68,124,0.8)':'rgba(150,192,240,0.5)');
    g.strokeRect(x+0.5,y+0.5,rw-1,rh-1);
    if(hp<=0||off){ g.save(); g.beginPath(); g.rect(x,y,rw,rh); g.clip();  /* hazard stripes */
      g.strokeStyle=off?'rgba(138,147,166,0.25)':'rgba(224,68,124,0.30)'; g.lineWidth=3;
      for(j=-rh;j<rw;j+=12){ g.beginPath(); g.moveTo(x+j,y+rh); g.lineTo(x+j+rh,y); g.stroke(); } g.restore(); }
    /* room icon, centered, ~0.9 cell */
    g.save(); var ic=Math.min(rw,rh)*0.42;
    g.translate(x+rw/2,y+rh/2); g.scale(ic/12,ic/12); g.translate(-12,-12);
    g.strokeStyle=hp<=0?'#E0447C':(off?'#8A93A6':T.c); g.lineWidth=1.7/(ic/12);
    g.lineCap='round'; g.lineJoin='round'; g.globalAlpha=off?0.5:0.9;
    g.beginPath(); g.stroke(new Path2D(ROOM_ICON[r.type])); g.restore();
    /* 3) MODULE BOXES (E3/E6): small squares along the room's bottom edge */
    var bs=Math.max(6,cs*0.24), bp=2;
    for(j=0;j<slots.length;j++){
      var bx=x+3+j*(bs+bp), by=y+rh-bs-3, mid=slots[j];
      if(mid&&MODULES[mid]){ g.fillStyle=MODULES[mid].c; g.globalAlpha=0.9;
        g.fillRect(bx,by,bs,bs); g.globalAlpha=1;
        g.strokeStyle='rgba(255,255,255,0.8)'; g.lineWidth=1; g.strokeRect(bx+0.5,by+0.5,bs-1,bs-1); }
      else { g.strokeStyle='rgba(150,192,240,0.35)'; g.lineWidth=1; g.setLineDash([2,2]);
        g.strokeRect(bx+0.5,by+0.5,bs-1,bs-1); g.setLineDash([]); }
    }
    /* cargo/turret are RANK rooms: pips instead of module boxes */
    if(r.type==='cargo'||r.type==='turret'){ var rk=r.type==='cargo'?(SHIP.cargo|0):(SHIP.turret|0);
      g.fillStyle=AC; for(j=0;j<rk;j++) g.fillRect(x+4+j*6,y+rh-7,4,3); }
    /* WLAB marks: permanent gold fitting pips on the Lance Bay's top edge (§2.4) */
    if(r.type==='wepA'){ var marks=(WLAB.reactor|0)+(WLAB.split|0)+(WLAB.coil|0)+(WLAB.pierce|0)+(WLAB.cycler|0);
      g.fillStyle='#F1D27A'; for(j=0;j<Math.min(marks,8);j++) g.fillRect(x+4+j*6,y+3,4,3); }
    /* 4) crew dots at stations (pilot always at helm) */
    var role=r.station, cm=null,ci;
    if(r.type==='helm') cm={role:'pilot'};
    else if(role){ for(ci=0;ci<CREW.length;ci++) if(CREW[ci].role===role){ cm=CREW[ci]; break; } }
    if(cm){ var dc=cm.role==='pilot'?'#dff6ff':(CREW_ROLES[cm.role]||{}).c||'#fff';
      g.save(); g.fillStyle='#0d1526'; g.strokeStyle=dc; g.lineWidth=1.6;
      g.shadowColor=dc; g.shadowBlur=6;
      g.beginPath(); g.arc(x+rw-8,y+9,4,0,6.2832); g.fill(); g.stroke(); g.restore(); }
    /* quarters glows warm while a rest buff is banked (§6.3) */
    if(r.type==='qtrs'&&restBuff){ g.fillStyle='rgba(249,115,22,0.10)'; g.fillRect(x,y,rw,rh); }
  }
  g.restore(); /* un-clip */
  /* 5) embedded ring thrusters on the aft edge (rings, not flames) */
  var er=cs*0.55, n=(curFrame().tSlots>=2)?2:1;
  for(i=0;i<n;i++){ var ey=(I.gh/2+(n===2?(i?1.6:-1.6):0))*cs;
    g.save(); g.strokeStyle=AC; g.lineWidth=2; g.shadowColor=AC; g.shadowBlur=8; g.globalAlpha=0.85;
    g.beginPath(); g.arc(0.15*cs,ey,er*0.5,0,6.2832); g.stroke(); g.restore(); }
  /* 6) label strip */
  g.font="bold 9px 'Space Mono',monospace"; g.textAlign='left'; g.fillStyle='rgba(220,240,255,0.55)';
  g.fillText(curFrame().name.toUpperCase()+' · '+I.meters+'m · '+I.rooms.length+' COMPARTMENTS',4,I.gh*cs+12);
  g.restore();
  return HITS;
}
```

**Render cost:** ~150 draw calls, only while the TAB overlay is open. If the overlay ever animates, draw to an offscreen canvas and redraw on a dirty flag (crew/EQUIP/ROOMHP change).

## 1.4 Room ↔ existing systems mapping (migrate, don't duplicate)

| Room | Backing state | Status line shown in popover | Disabled-room penalty (§1.5) |
|---|---|---|---|
| `helm` | pilot (`SKILLS` ~4121) | pilot name + rank | `MS.spreadMul ×1.15` (shaky aim) |
| `wepA` Lance Bay | `player.weapon` + `EQUIP.wepA` + WLAB pips | `WEAPONS[player.weapon].name` | fire rate ×0.65 |
| `wepB` Rift Bay | `player.weapon2` + `EQUIP.wepB` | rift/CE name or `PROJECTOR NOT FITTED` | weapon2 offline |
| `shield` | `SHIP.shield` + `player.sh/shMax` | `SH 42/60 · MK2` | shield regen frozen |
| `engine` | `SHIP.engine` + `FRAMES[frame].thr` | thrust profile bars | `MS.accelMul ×0.7`, dash locked |
| `energy` | `SHIP.energy` + `EQUIP.energy` | `EN 60/90 · +12/s` | `MS.energyRegen ×0.6` |
| `life` | NEW, mechanical-lite (decision below) | `O2/GRAV NOMINAL` | hull bleeds 1/s down to a 30% floor (can't kill) |
| `tractor` | hulk/tow state (§5) + `EQUIP.tractor` | `TOWING: <hulk>` or `BEAM IDLE` | tow drops, cannot re-latch |
| `qtrs` | rest state (§6.3) + `EQUIP.qtrs` | `RESTED` / `—` | no penalty (fluff room) |
| `cargo` (hauler/gunship) | `SHIP.cargo` rank + `CARGO{}` hold | capacity used (same data as E8 pane) | credit yield bonus off |
| `turret` (gunship) | `SHIP.turret` + `MS.crewGunner` | turret rank | auto-turret offline |

**Life support decision: mechanical-lite.** Not FTL's per-room O2 sim (wrong for a wave-timed arcade run). Disabled life support = hull bleeds 1/s down to a 30% floor + thin cyan "O2" HUD warning bar. Cheap, dramatic, can't create unfair deaths.

## 1.5 Room damage model v1 (paste-ready hooks)

Simple, readable, no per-room targeting yet: **hard hits splash a random room.**

```js
/* call right after `player.hp-=dmg` in the hit handler (~5271) */
function roomDamage(dmg){
  if(dmg<12) return;                                    /* only hard hits reach the deck */
  var I=curInterior(), r=I.rooms[(Math.random()*I.rooms.length)|0];
  if(r.type==='qtrs'||r.type==='cargo') return;         /* fluff rooms don't gate systems */
  ROOMHP[r.id]=Math.max(0,roomHp(r.id)-0.34);           /* 3 hard hits disable a room */
  if(ROOMHP[r.id]<=0) showBanner(ROOMS[r.type].n.toUpperCase()+' DISABLED','Weld it (hold R) or dock to repair','#E0447C');
}
/* penalties: fold into recomputeStats() (~4255) so they stack with everything else */
function applyRoomPenalties(){
  if(roomHp('shield')<=0)  MS.shieldRegenOff=true;
  if(roomHp('engine')<=0||roomHp('engineA')<=0){ MS.accelMul*=0.7; MS.dashLocked=true; }
  if(roomHp('energy')<=0)  MS.energyRegen*=0.6;
  if(roomHp('wepA')<=0)    MS.fireMul*=0.65;
  if(roomHp('helm')<=0)    MS.spreadMul*=1.15;
  /* life support: apply in the update loop, not stats:
     if(roomHp('life')<=0 && player.hp>player.hpMax*0.3) player.hp-=1*dt; */
}
/* repairs — reuse the two existing repair channels, no new verbs:
   1) R-weld completion (engT>=engNeed payout, MS.engRank ~4281): also heal the worst room by 0.5.
   2) Engineer crew (MS.crewEngineer ~4308): out of combat, +0.04 roomHp/s to the worst room.
   3) Dock / wave end at the Haven: resetRooms(). ROOMHP is per-run — never persisted. */
```

## 1.6 Walk your own interior? — v1: **view-only**

v1 is the read-only FTL view in the TAB overlay. Reasons: (a) the run loop is wave-timed — walking mid-wave fights the core loop; (b) the payoff (rest, repair) is expressible as one-click room actions; (c) zero new combat/AI surface. The BOARD engine is deliberately reusable for v2 ("walk your ship between waves"): `bWalkable()` (6074) consumes plain px-rects, and `INTERIORS` converts directly:

```js
/* v2 adapter: deck plan -> BOARD-style walkable rects (cell = 48px on foot) */
function myShipRects(){ var I=curInterior(), out=[],i,r,PX=48;
  for(i=0;i<I.rooms.length;i++){ r=I.rooms[i]; out.push({x:r.x*PX,y:r.y*PX,w:r.w*PX,h:r.h*PX}); }
  return out; /* rooms share edges -> bWalkable() sees them connected, same as boardTemplate() */
}
```
v2 spawns a guard-free, timer-free BOARD with `rects:myShipRects()` and E-interactions per room (bunk = rest, core = inspect, crates = cargo). Nothing in `updateBoarding()` (6106) assumes hostility except the guard/timer arrays being non-empty.

**Enemy interiors (E9 synergy):** the same `INTERIORS` schema replaces the single hand-authored `boardTemplate()` (6062) later — boarding a hauler-class pirate uses `INTERIORS.hauler` rects, and looting its `energy`/`wepA` rooms is what yields modules: exactly the salvage-by-room rule E9 wants.

---

# 2) ROOMS & ROOM-MODULES (E6, E11 — incl. migration from EQUIP/WLAB)

**Core reconciliation decision:** the existing `MODULES/EQUIP` socket system *becomes* the room-module system. Rooms are not a new inventory — they are a re-keying of `EQUIP` from `{w1,w2,re}` to room ids, plus new room groups. `WLAB` stays as-is in data (`bdg_wlab` untouched), re-presented as **permanent Lance Bay fitting marks** (gold pips in the interior view; dock tab renamed "BAY FITTINGS"). `MOD_DEFS` (~4214, in-run roguelite draft mods) is a **different system — never merged, never persisted, untouched.**

## 2.1 Room registry (paste-ready — insert after `FRAMES` ~4044)

```js
/* ===== ROOMS: every ship system is a room with 1-3 module slots (weapon bays scale to 10) ===== */
var ROOMS={
  helm:   {n:'Helm',         c:'#F1D27A', sys:'pilot',   d:'Piloting and fire-control. Modules sharpen aim, sensors and lock-on.'},
  wepA:   {n:'Lance Bay',    c:'#22D3EE', sys:'weapon',  d:'Primary coherent-energy bay (left click). Modules reshape the shot itself.'},
  wepB:   {n:'Rift Bay',     c:'#C4B5FD', sys:'weapon2', d:'Riftwork bay (right click). Exotic-physics arms mount here; same module rules as the Lance Bay.'},
  shield: {n:'Shield Room',  c:'#5EEAD4', sys:'shield',  d:'Barrier projector. Modules tune regen, reflection and emergency surge.'},
  engine: {n:'Engine Room',  c:'#7FA8FF', sys:'engine',  d:'Main drive and RCS. Modules tune dash, boost and drift.'},
  energy: {n:'Energy Core',  c:'#F97316', sys:'energy',  d:'The reactor everything drinks from. Modules add capacity and regen.'},
  life:   {n:'Life Support', c:'#9BE7A8', sys:'life',    d:'Oxygen and gravity. Modules feed boarding stamina and ship handling.'},
  tractor:{n:'Tractor Bay',  c:'#E0529E', sys:'tractor', d:'Graviton projector for salvage and towing. Modules extend reach and grip.'},
  qtrs:   {n:'Quarters',     c:'#E0703C', sys:'rest',    d:'The apartment. Modules improve rest quality and crew recovery.'},
  cargo:  {n:'Cargo Hold',   c:'#E0703C', sys:'cargo',   d:'Freight space. No module slots — its level is the Cargo Bay ship rank.'},
  turret: {n:'Turret Nest',  c:'#F97316', sys:'turret',  d:'Automated point-defense. No module slots — its level is the Turret ship rank.'}
};
var ROOM_ORDER=['helm','wepA','wepB','shield','engine','energy','life','tractor','qtrs'];
```

## 2.2 Slot counts per frame — single source of truth (edit `FRAMES` ~4041–4043)

Rule: **ordinary rooms carry 1–3 slots; weapon bays scale with hull class up to 10.** Formula for future frames: `baySlots = 2 + 2*sizeTier` → runabout 2, hauler 3, gunship 4, corvette 6, frigate 8, capital 10. A missing key = the hull physically lacks that room (E4: availability scales with hull size). `cargoCap` added here too (§4.6).

```js
/* add to each FRAMES entry: */
runabout: { /* existing fields */ cargoCap:10, rooms:{helm:1,wepA:2,wepB:2,shield:1,engine:1,energy:2,life:1,tractor:1,qtrs:1} },
hauler:   { /* ... */             cargoCap:24, rooms:{helm:1,wepA:3,wepB:2,shield:2,engine:2,energy:2,life:1,tractor:2,qtrs:1} },
gunship:  { /* ... */             cargoCap:14, rooms:{helm:2,wepA:4,wepB:3,shield:2,engine:2,energy:3,life:2,tractor:2,qtrs:2} }
/* future frames (doc only): corvette wepA:6, frigate wepA:8, capital wepA:10 */
```

`EQUIP` becomes room-keyed, sized from the frame (replace line ~4154):

```js
var EQUIP={}; /* room type -> array of module ids, length = curFrame().rooms[type] (persist, save v3) */
function equipInit(){ var F=curFrame(),r;
  for(r in ROOMS){ var n=(F.rooms&&F.rooms[r])|0, cur=EQUIP[r]||[];
    cur.length=n; for(var i=0;i<n;i++) if(cur[i]===undefined) cur[i]=null; EQUIP[r]=cur; } }
```

Call `equipInit()` inside `loadMeta()` after the `bdg_equip` read, and inside the frame-switch path (`buyFrame`/`setFrame` ~6260) so slot arrays resize on hull change. Extra modules auto-unsocket back to `INV` because `equippedCount()`/`freeCount()` (6569) no longer see them — zero changes needed there.

## 2.3 THE MODULE CATALOG — 33 modules, one flat `MODULES{}` (E6.1)

Same object the whole codebase already reads (`INV`, drops at 5509/5579/5982, dock at 6590). Each entry gains `room` (replacing `slot`), and `fx` (data-driven effect — kills the hard-coded chain at 4294–4302). `drop:0` = shop-only; `cost:0` = drop-only; shop prices run through `barterPrice()` (4156), sell-back 50%. **The 7 existing ids are kept verbatim so `bdg_inv` counts remain valid with no remap.** The owner's four named modules are `mcharge` (CHARGE), `mhoming` (HOMING), `mnova` (FAST+LONG, Nova-Drift style), `mspread` (SPREAD).

```js
/* ===== MODULES 2.0: room hardware. room:'wep' fits wepA OR wepB; all others fit their named room ===== */
var MODULES={
  /* -- WEAPON BAY — existing five, unchanged ids/numbers -- */
  split2: {n:'Split Coupler',  c:'#5EEAD4', room:'wep', drop:0.020, cost:0,   d:'+1 projectile per shot · weapon draws 35% more energy', fx:function(S){S.projAdd+=1;S.energyCostMul*=1.35;}},
  split3: {n:'Trident Coupler',c:'#22D3EE', room:'wep', drop:0.008, cost:0,   d:'+2 projectiles per shot · weapon draws 70% more energy', fx:function(S){S.projAdd+=2;S.energyCostMul*=1.7;}},
  scharge:{n:'Supercharger',   c:'#F97316', room:'wep', drop:0.014, cost:0,   d:'+30% damage · weapon draws 25% more energy', fx:function(S){S.dmgMul*=1.3;S.energyCostMul*=1.25;}},
  focus:  {n:'Focus Lens',     c:'#C4B5FD', room:'wep', drop:0.020, cost:0,   d:'+10% damage · +15% shot range', fx:function(S){S.dmgMul*=1.1;S.shotLifeMul*=1.15;}},
  cooler: {n:'Coolant Loop',   c:'#7FA8FF', room:'wep', drop:0.020, cost:0,   d:'weapon draws 20% less energy', fx:function(S){S.energyCostMul*=0.8;}},
  /* -- WEAPON BAY — the four the owner named -- */
  mcharge:{n:'Charge Coupler', c:'#F1D27A', room:'wep', drop:0.010, cost:900, d:'HOLD to charge any weapon: up to +150% damage at full charge, shot scales bigger', fx:function(S){S.chargeMod=1;}},
  mhoming:{n:'Seeker Suite',   c:'#E0529E', room:'wep', drop:0.010, cost:1100,d:'shots curve toward the nearest hostile (4 rad/s steer)', fx:function(S){S.homingAdd+=4;}},
  mnova:  {n:'Nova Driver',    c:'#22D3EE', room:'wep', drop:0.008, cost:1200,d:'+60% shot velocity · +50% shot range · -10% damage', fx:function(S){S.shotSpdMul=(S.shotSpdMul||1)*1.6;S.shotLifeMul*=1.5;S.dmgMul*=0.9;}},
  mspread:{n:'Spread Choke',   c:'#5EEAD4', room:'wep', drop:0.012, cost:700, d:'+2 projectiles in a wide fan · each -15% damage', fx:function(S){S.projAdd+=2;S.spreadMul=(S.spreadMul||1)*1.8;S.dmgMul*=0.85;}},
  mleech: {n:'Siphon Coil',    c:'#9BE7A8', room:'wep', drop:0.008, cost:1000,d:'4% of damage dealt returns as energy', fx:function(S){S.energyLeech=(S.energyLeech||0)+0.04;}},
  /* -- ENERGY CORE — existing two, unchanged -- */
  capbank:{n:'Capacitor Bank', c:'#F1D27A', room:'energy', drop:0.014, cost:0,   d:'+30 max energy', fx:function(S){S.energyMax+=30;}},
  turbine:{n:'Flux Turbine',   c:'#5EEAD4', room:'energy', drop:0.014, cost:0,   d:'+30% energy regen', fx:function(S){S.energyRegen*=1.3;}},
  rover:  {n:'Overcharge Reg.',c:'#F97316', room:'energy', drop:0.006, cost:1300,d:'+12% weapon damage while energy above 80%', fx:function(S){S.overchargeDmg=0.12;}},
  /* -- SHIELD ROOM -- */
  sregen: {n:'Regen Booster',  c:'#5EEAD4', room:'shield', drop:0.012, cost:600, d:'+35% shield regen', fx:function(S){S.shieldRegenMul=(S.shieldRegenMul||1)*1.35;}},
  sbubble:{n:'Wide Emitter',   c:'#7FA8FF', room:'shield', drop:0.010, cost:750, d:'+25 max shield', fx:function(S){S.shMax+=25;}},
  smirror:{n:'Mirror Plating', c:'#C4B5FD', room:'shield', drop:0.006, cost:1400,d:'15% of shield hits reflect back at the attacker', fx:function(S){S.reflectPct=(S.reflectPct||0)+0.15;}},
  ssurge: {n:'Surge Capacitor',c:'#22D3EE', room:'shield', drop:0.006, cost:1200,d:'shield break grants 0.6s invulnerability (8s cooldown)', fx:function(S){S.breakInvuln=Math.max(S.breakInvuln||0,0.6);}},
  /* -- ENGINE ROOM -- */
  edash:  {n:'Vector Jets',    c:'#E0703C', room:'engine', drop:0.012, cost:650, d:'dash cooldown -20%', fx:function(S){S.dashCdMul*=0.8;}},
  eboost: {n:'Afterburner Feed',c:'#F97316',room:'engine', drop:0.012, cost:650, d:'+12% boost top speed', fx:function(S){S.boostMul+=0.12;}},
  edrift: {n:'Inertia Damper', c:'#7FA8FF', room:'engine', drop:0.010, cost:800, d:'-15% drag · +15% lateral RCS authority', fx:function(S){S.dragMul*=0.85;S.hndMul*=1.15;}},
  /* -- HELM -- */
  haim:   {n:'Fire-Control Node',c:'#7FA8FF',room:'helm', drop:0.010, cost:900, d:'-20% spread · +5% crit chance', fx:function(S){S.spreadMul=(S.spreadMul||1)*0.8;S.critPct+=0.05;}},
  hsensor:{n:'Sensor Array',   c:'#22D3EE', room:'helm', drop:0.010, cost:700, d:'+40% minimap range · pickups pinged on the map', fx:function(S){S.sensorMul=1.4;S.pingPickups=1;}},
  hlock:  {n:'Target Lock',    c:'#E0529E', room:'helm', drop:0.006, cost:1200,d:'homing shots steer 50% harder · +10% damage to your locked target', fx:function(S){S.homingMul=(S.homingMul||1)*1.5;S.lockDmg=0.10;}},
  /* -- LIFE SUPPORT -- */
  lo2:    {n:'O2 Recycler',    c:'#9BE7A8', room:'life', drop:0.008, cost:800, d:'+25 boarding HP · sprint stamina lasts 30% longer on foot', fx:function(S){S.boardHpAdd=(S.boardHpAdd||0)+25;S.boardStamMul=1.3;}},
  lgrav:  {n:'Grav Trim',      c:'#C4B5FD', room:'life', drop:0.008, cost:800, d:'+8% overall handling (gravity plating tuned to your reflexes)', fx:function(S){S.hndMul*=1.08;}},
  lmed:   {n:'Medbay Loop',    c:'#5EEAD4', room:'life', drop:0.006, cost:1100,d:'+1 hull/s repair out of combat', fx:function(S){S.hullRegenAdd=(S.hullRegenAdd||0)+1;}},
  /* -- TRACTOR BAY (the ONE tractor module set — C5; consumers in §5) -- */
  trange: {n:'Long-Reach Emitter',c:'#E0529E',room:'tractor',drop:0.010,cost:700, d:'+40% tractor latch range (90 → 126)', fx:function(S){S.tractorRangeMul=(S.tractorRangeMul||1)*1.4;}},
  tgrip:  {n:'Grav Clamp',     c:'#F97316', room:'tractor', drop:0.008, cost:950, d:'towing drag reduced 45% (stacks in a second slot, cap 90%)', fx:function(S){S.towGrip=Math.min(0.9,(S.towGrip||0)+0.45);}},
  tdual:  {n:'Twin Projector', c:'#22D3EE', room:'tractor', drop:0.004, cost:1800,d:'tow two objects at once', fx:function(S){S.towSlots=2;}},
  /* -- QUARTERS (rest hooks in §6.3) -- */
  qbunk:  {n:'Deluxe Bunk',    c:'#F97316', room:'qtrs', drop:0.006, cost:600, d:'the rested buff lasts two waves instead of one', fx:function(S){S.restMul=(S.restMul||1)*1.5;}},
  qgalley:{n:'Stocked Galley', c:'#F1D27A', room:'qtrs', drop:0.006, cost:750, d:'after resting: +10% damage for the first 60s of the next wave', fx:function(S){S.restBuffDmg=0.10;}},
  qrec:   {n:'Rec Nook',       c:'#9BE7A8', room:'qtrs', drop:0.004, cost:900, d:'injured crew recover one wave sooner', fx:function(S){S.crewHealAdd=1;}}
};
```

**Fit rule** — replace the filter in `cycleSocket()` (6574):

```js
function roomAccepts(roomId,md){ return md.room===roomId || (md.room==='wep'&&(roomId==='wepA'||roomId==='wepB')); }
/* in cycleSocket: for(id in MODULES){ if(roomAccepts(gk,MODULES[id]) && (freeCount(id)>0||id===cur)) ids.push(id); } */
```

**Rift-arm compatibility gate (E6 × §3):** weapon modules apply to rift arms with explicit rules — `scharge/focus` scale `str`/`rad` +30%/+15%, `cooler` cuts energy cost 20%, but `split2/split3/mspread` are **rejected by the socket UI for field-type rift arms** (`sing, lag, shear, smine`) and valid for `phase/arc/sling` (extra lance/chain/well). One data gate, no new system:

```js
var RIFT_MODOK={sing:{split2:0,split3:0,mspread:0},lag:{split2:0,split3:0,mspread:0},
                shear:{split2:0,split3:0,mspread:0},smine:{split2:0,split3:0,mspread:0}};
```

**`recomputeStats()` rewrite** — replace the hard-coded module block at 4292–4302:

```js
/* socketed room modules: data-driven */
var rm,ri; for(rm in EQUIP){ var arr=EQUIP[rm]||[]; for(ri=0;ri<arr.length;ri++){
  var md=arr[ri]&&MODULES[arr[ri]]; if(md&&md.fx) md.fx(MS); } }
applyRoomPenalties();   /* §1.5 */
```

Defaults to seed in the `base` object (4257–4261): `chargeMod:0, homingAdd:0, homingMul:1, shotSpdMul:1, energyLeech:0, overchargeDmg:0, reflectPct:0, breakInvuln:0, sensorMul:1, pingPickups:0, lockDmg:0, boardHpAdd:0, boardStamMul:1, hullRegenAdd:0, tractorRangeMul:1, towGrip:0, towSlots:1, restMul:1, restBuffDmg:0, crewHealAdd:0.` Note `spreadMul` is already set by Accuracy at 4266 — **multiply, don't overwrite.** New stat keys are the contract for their consumers: firing code (charge/homing/nova/spread/leech/overcharge — built in I3), shield code (mirror/surge — I3), tractor (I4), rest/boarding (I5).

**Sources:** `drop>0` rolls through the existing weighted pool (5509–5511) untouched — it iterates `MODULES` and sums `drop`, so new entries just work. `cost>0` entries additionally sell in the dock's PARTS column (§4.5). Elite/boss guarantees (`MOD_DROP_ELITE=0.45` at 4152, `grantModule()` 5982) unchanged.

## 2.4 THE MIGRATION (E6 "migrate, don't duplicate")

### What maps to what

| Old | New | Save key | Action |
|---|---|---|---|
| `EQUIP.w1[0..1]` | `EQUIP.wepA[0..1]` (new slots 2+ start empty) | `bdg_equip` | rename in `migrateSave()` |
| `EQUIP.w2[0..1]` | `EQUIP.wepB[0..1]` | `bdg_equip` | rename (was `[null,null]` on runabout/hauler — harmless) |
| `EQUIP.re[0..1]` | `EQUIP.energy[0..1]` | `bdg_equip` | rename |
| `MODULES[*].slot:'w'` | `room:'wep'` | none | code constant edit; ids unchanged so `bdg_inv` valid as-is |
| `MODULES[*].slot:'r'` | `room:'energy'` | none | code edit |
| `WLAB` marks | **unchanged data** — "Lance Bay fittings", permanent gold pips in interior + codex; dock tab renamed "BAY FITTINGS" | `bdg_wlab` | zero data change; effects stay at 4283–4291 |
| `SHIP.*` ranks | **unchanged** — the *room's own level*; modules sit on top; interior shows ranks as pips | `bdg_ship` | zero change |
| `MOD_DEFS` draft mods | unchanged, per-run only | none | no action |
| `player.weapon2` (`bdg_w2`) | still weapon2; Rift Bay contents; legacy CE keys keep firing (§3.5) | `bdg_w2` | zero change |

### Paste-ready migration (replace `migrateSave()` body ~4183; `SAVE_VERSION='3'` at 4182)

```js
var SAVE_VERSION='3';
function migrateSave(){
  try{
    var v=STORE.get('bdg_v');
    if(v===SAVE_VERSION) return;
    /* v1 -> v2: nothing destructive (kept). v2 -> v3: EQUIP re-keys to rooms. */
    try{ var eq=JSON.parse(STORE.get('bdg_equip')||'null');
      if(eq && eq.w1 && !eq.wepA){
        var ne={wepA:eq.w1.slice(0,2), wepB:(eq.w2||[null,null]).slice(0,2), energy:(eq.re||[null,null]).slice(0,2)};
        STORE.set('bdg_equip',JSON.stringify(ne));
      } }catch(e2){}
    STORE.set('bdg_v',SAVE_VERSION);
  }catch(e){}
}
```

In `loadMeta()` replace the validity check at ~4202:

```js
try{ var eq=JSON.parse(STORE.get('bdg_equip')||'null'); if(eq&&eq.wepA) EQUIP=eq; }catch(e){}
equipInit(); /* size every room's array from curFrame().rooms; unknown keys pruned by ROOMS loop */
```

Additive keys appended to `saveMeta()`/`loadMeta()` (all try/catch, all default-safe): `bdg_cargo` (§4.6), `bdg_haven` (§6.2). **Nothing in `INV`, `WLAB`, `SHIP`, `MSHIP`, credits, frames, gear, crew, livery, rep is touched** — a v2 save loads with every owned module still owned, every socketed module still socketed in the same physical bay/core, every WLAB mark intact. Do **not** reuse the vestigial `crewq`/`gearlocker` field names already parsed in the `bdg_mship` loader (~4258).

### Dock sockets panel — generalize `renderSockets()` (6580); delete `sockGroups()` (6565)

```js
function renderSockets(){
  var host=Q('gSockets'); if(!host) return; var html='',i,si;
  for(i=0;i<ROOM_ORDER.length;i++){ var rid=ROOM_ORDER[i], R=ROOMS[rid], arr=EQUIP[rid]||[], socks='';
    if(!arr.length) continue;                       /* hull lacks the room: hide row */
    for(si=0;si<arr.length;si++){ var mid=arr[si], md=mid?MODULES[mid]:null;
      socks+='<button class="sock-btn'+(md?' filled':'')+'" data-sock="'+rid+':'+si+'" style="--c:'+(md?md.c:'#7FA8FF')+'">'+(md?md.n.toUpperCase():'&mdash; EMPTY &mdash;')+'</button>'; }
    html+='<div class="dk-row" style="--c:'+R.c+'"><div class="dk-info"><b>'+R.n.toUpperCase()+'</b><span>'+arr.length+' slot'+(arr.length===1?'':'s')+' &#183; click to cycle</span></div><div class="sock-wrap">'+socks+'</div></div>';
  }
  host.innerHTML=html;
}
```

The dock click handler at 8256 (`data-sock="gk:si"`) works unchanged — `gk` is now a room id. `renderModInv()` (6590) needs one string change: `'fits '+(md.room==='wep'?'WEAPON BAY':ROOMS[md.room].n.toUpperCase())`.

**Catalog totals:** 33 modules across 9 slotted room types (10 weapon-bay, 3 energy, 4 shield, 3 engine, 3 helm, 3 life, 3 tractor, 3 quarters) — 7 pre-existing, 26 new; all 5 WLAB fittings retained as permanent bay marks.

---

# 3) RIFTWORK — EXOTIC WEAPONS (E5)

## 3.1 The existing 8 weapons, re-flavored as CE energy arms (E5, zero mechanics change)

Keys, cooldowns (`wcd()`), damage, `ENERGY_COST` (~5338) all stay; only `WEAPONS{}` name/tag strings (~4539–4548) and the tooltip info block (~4802) change. Internal ids (`mgun`, `rocket`…) stay as save-safe keys; bullet `kind` strings (`'bolt','pellet','beam','rocket'`) are internal — keep. The Blaster-Evo tree (`EVO_TIER1/2` ~5342) already uses energy language — no change.

```js
var WEAPONS={
  blaster:{name:'Pulse Blaster',   tag:'standard coherent bolt',       col:'#22D3EE'},
  cannon: {name:'Ion Cannon',      tag:'charge heavy · shield-breaker',col:'#7FA8FF'}, /* already energy — keep */
  shotgun:{name:'Scatter Coil',    tag:'wide flux fan',                col:'#5EEAD4'},
  mgun:   {name:'Repeater Array',  tag:'rapid pulse stream',           col:'#F1D27A'},
  rocket: {name:'Seeker Plasmoid', tag:'homing plasma packets',        col:'#FF7847'}, /* magnetically-bottled plasma; "blast" = bottle rupture (rocketBlast ~7641 re-reads as containment burst) */
  missile:{name:'Lance Accumulator',tag:'heavy charge bolt',           col:'#E0447C'}, /* capacitor dump, not a warhead */
  railgun:{name:'Coherence Rail',  tag:'instant phased pierce',        col:'#C4B5FD'}, /* photonic soliton, not a slug */
  flak:   {name:'Burst Emitter',   tag:'proximity flux burst',         col:'#F97316'}
};
```

## 3.2 Shared rift infrastructure (add once)

Rift arms live in a new `rbul[]` array of *field objects* (not bullets), plus a global force pass that bends `pbul`, `ebul`, and enemy velocities. One new update, called from the main loop next to `updatePBul(dt)` (~8150):

```js
var rbul=[]; /* rift field objects: {k,x,y,vx,vy,life,str,rad,...} */
var RIFT_TICK={}, RIFT_END={};
function updateRift(dt){
  for(var i=rbul.length-1;i>=0;i--){ var f=rbul[i];
    f.x+=(f.vx||0)*dt; f.y+=(f.vy||0)*dt; f.life-=dt;
    RIFT_TICK[f.k](f,dt);
    if(f.life<=0){ if(RIFT_END[f.k]) RIFT_END[f.k](f); rbul.splice(i,1); }
  }
}
/* generic radial force on any {x,y,vx,vy}. sign>0 pulls, <0 pushes */
function riftForce(f,o,dt,sign){
  var dx=f.x-o.x, dy=f.y-o.y, d2=dx*dx+dy*dy;
  if(d2>f.rad*f.rad || d2<1) return 0;
  var d=Math.sqrt(d2), g=f.str*(1-d/f.rad);   /* linear falloff — reads better on canvas than 1/r² and never explodes */
  o.vx+=sign*(dx/d)*g*dt; o.vy+=sign*(dy/d)*g*dt;
  return d;
}
```

Rift arms drain the same `player.energy` bank as CE arms (extend `ENERGY_COST`): **CE arms 1.4–9, rift arms 4–18** — Lance and Rift are always in tension over one reactor. That IS the era's core statement: everything, even the spacetime benders, runs on energy. Numbers assume the stock 60-energy bank.

## 3.3 The family — 8 rift arms

Progression / cost ladder: `sling`(6) → `arc`(8) → `shear`(10) → `phase`(12) → `lag`(14) → `smine`(16) → **`sing`(18)** → `tether`(4/s channel).

### ★ 3.3.1 SINGULARITY CASTER (`sing`) — the owner's mini-black-hole launcher; the flagship rift arm
- **Slot:** Rift Bay (RMB). **Energy:** 18. **Cooldown:** 2.6s. **Color:** `#B08CFF`.
- **Fire:** launches a slow round (sp 260) that collapses into a well on first enemy proximity or at 0.55s, whichever first. Well: `rad:150, str:340, life:2.8, dps:14`.
- The whole trick — iterate the three moving-object pools each tick and add acceleration, so enemy fire (`ebul`, integrated at ~7073) visibly **curves into the hole** (your point-defense), your own bolts (`pbul` ~7047) whip around it (skill ceiling), and enemies (`e.vx/vy`, drag-integrated ~6932) get dragged off their attack runs; hulls near the core take tidal DoT:

```js
RIFT_TICK.sing=function(f,dt){
  var i,d;
  for(i=0;i<enemies.length;i++){ var e=enemies[i]; if(e.disabled) continue;
    d=riftForce(f,e,dt,+1);                                    /* pull hulls */
    if(d&&d<f.rad*0.25){ e.hp-=f.dps*dt; e.shT=0;              /* tidal DoT near core; resets shield regen timer */
      if(e.hp<=0){ killEnemy(e,enemies.indexOf(e)); i--; } }
  }
  for(i=0;i<ebul.length;i++) riftForce(f,ebul[i],dt,+1);       /* bend enemy projectiles */
  for(i=0;i<pbul.length;i++) if(!pbul[i].riftImmune) riftForce(f,pbul[i],dt,+1); /* yours curve too */
  if(boss&&!boss.entering){ d=Math.hypot(boss.x-f.x,boss.y-f.y);
    if(d<f.rad*0.4){ boss.hp-=f.dps*0.5*dt; boss.hurt=1; } }   /* bosses too massive to move — DoT only */
  /* OPTIONAL 'realistic' toggle: riftForce(f,player,dt,+1) at 30% str — pulls YOU too */
  grings.push({x:f.x,y:f.y,r:f.rad*(0.3+0.7*(f.life/2.8)),a:0.12,col:'#B08CFF',grow:false,spd:0,lw:1.4,fade:2});
};
RIFT_END.sing=function(f){ rocketBlast(f.x,f.y,10); };          /* evaporation pop reuses ~7641 */
```
Balance: 18 energy = 3 casts on a full bank; it must *win a moment*, not spam.

### 3.3.2 REPULSOR SHEAR (`shear`) — panic button / crowd control
Energy 10 · cd 1.4s. Instant expanding ring centered on the ship (reuses `grings`). Tick: `riftForce` with `sign:-1`, `rad` grows `420*dt` up to 220, `str:520, life:0.5`. Pushes enemies AND `ebul` outward; deletes enemy bullets it fully overruns (`if(d<f.r-30) ebul.splice(...)`). Damage 2 + collision-style stagger (sets `e.vx/vy` outward at 260). The anti-singularity; with `sling`, one of the two starter-viable rift feels.

### 3.3.3 LAG FIELD (`lag`) — time-dilation bubble
Energy 14 · cd 3.5s. Deployed at cursor, `rad:130, life:4`. No force — a *timescale* drag: `mul=Math.pow(0.25,dt)` applied to `e.vx/vy` and `ebul` velocities inside, plus `e.fireCd+=dt*0.75` so slowed ships shoot at ¼ rate. Your `pbul` are `riftImmune` here (your rift key is tuned to your own emitter). Zero damage; pure setup for the Coherence Rail.

### 3.3.4 ARC LATTICE (`arc`) — chain lightning
Energy 8 · cd 0.9s. Instant: zap nearest enemy within 380px, chain up to 4 jumps ≤160px apart, dmg `6,5,4,3,2`. Resolves in the fire function (greedy nearest-unvisited loop over `enemies`); render 2–3 jittered polylines for 0.12s (push `{k:'arc',pts:[...],life:0.12}` to `rbul`; its tick only draws). Sets `e.shT=0` per link. The "many small enemies" answer the Rift Bay otherwise lacks.

### 3.3.5 PHASE LANCE (`phase`) — shoots through everything
Energy 12 · cd 1.8s. Fires via existing `fireBullet(a,1100,7,999,true,'#8FE3D0',0.6,'beam')` then flags `pbul[pbul.length-1].phase=true; .riftImmune=true`. In `updatePBul` (~7051): a `phase` bolt skips the consume branch (infinite functional pierce; damages each enemy once via `b.hitIds={}`), and — key rift flavor — **ignores shields**: `if(b.phase){ e.hp-=ed; }` bypassing `dmgEnemy`'s shield gate, hitting hull *under* the harmonic skin. This is the weapon the lore says shields fear.

### 3.3.6 GRAV SLING (`sling`) — the trick shot; first rift arm the player gets
Energy 6 · cd 2.2s. Drops a stationary micro-well at cursor: `rad:120, str:300, life:5`, pulling **projectiles only** (both `pbul` and `ebul`, never hulls). Your bolts gain +8% damage per 90° of accumulated turn (`b.slung` accumulator, capped +40%). Fire the Repeater Array *past* it to curve fire around a boss shield arc. Cheap, skill-expressive, teaches the bending mechanic before the player can afford the Caster.

### 3.3.7 SINGULARITY MINE (`smine`) — area denial
Energy 16 · cd 4s, max 2 alive. Stationary stealth dot; arms in 0.8s; triggers when an enemy comes within 70px → becomes a sing field at `str:420, rad:130, life:1.6, dps:22` (reuses `RIFT_TICK.sing`). Defend-wave tool: seed the mothership's flank lanes (`mission.t==='defend'` already distinguishes defend waves ~6927).

### 3.3.8 EVENT TETHER (`tether`) — the tractor beam's violent cousin
Energy 4/s channeled (hooks the existing `player.firing2` RMB-hold plumbing ~8138). Beam locks the nearest enemy in a 40° cone ≤300px; spring force toward a point 120px ahead of your ship: `e.vx+=(tx-e.x)*6*dt`, critically damped with `e.vx*=Math.exp(-3*dt)`. Release to fling: enemy keeps velocity → enemy-vs-enemy overlap damage `hypot(vx,vy)*0.04`. **Shares its spring math with the §5 salvage tow — that code ships once and serves both.**

## 3.4 Sourcing

Rift arms drop from **clan-faction sources and boarding loot only** — never `WPN_TIERS` (~4141; that table stays CE-only). The clan REP path *is* the riftwork path. The first clan story card (~wave 3) grants `sling`. First rift drop shows a one-time banner: *"RIFT BAY CALIBRATED — exotic arms mount to the right hand."*

## 3.5 The two bays — RMB resolution (C4, paste-ready)

Bay A — **Lance Bay** (LMB / `player.weapon`): unchanged; CE arms only; all existing fire paths (`fireWeapon` 5415, charge `endFire` 5324, mobile autofire 8144) untouched. Bay B — **Rift Bay** (RMB / `player.weapon2`): fires on **every frame** (gate removed):

```js
var RIFT={ sling:{cost:6,cd:2.2,fire:...}, arc:{cost:8,cd:0.9,fire:...}, shear:{cost:10,cd:1.4,fire:...},
           phase:{cost:12,cd:1.8,fire:...}, lag:{cost:14,cd:3.5,fire:...}, smine:{cost:16,cd:4,fire:...},
           sing:{cost:18,cd:2.6,fire:...}, tether:{cost:4,channel:1,fire:...} }; /* bodies per §3.3 */
function hasW2(){ return !!(player.weapon2 && (RIFT[player.weapon2]||WEAPONS[player.weapon2]) && WPN_UNLOCKED[player.weapon2]); }
function fireWeapon2(){
  var r=RIFT[player.weapon2];
  if(r){ if(player.energy<r.cost){ player.energyDeny=true; return; }
         player.energy-=r.cost; r.fire(); return; }
  var pw=player.weapon; player.weapon=player.weapon2; fireWeapon(); player.weapon=pw; /* legacy CE-in-slot-2 still works */
}
/* w2cd(): return RIFT[player.weapon2] ? RIFT[player.weapon2].cd : wcd()*1.15;  (legacy formula kept) */
```

**Note:** `shipMax('turret')` (4062) still keys off `wSlots-1` — turret/reflect gating is untouched by this change. Old saves with a CE key in `bdg_w2` (e.g. `'railgun'`) keep working via the legacy branch. The dock `w2-chip` list (~6527) gains a second labeled group (**CE · RIFT**) instead of a new tab. Rift drops set `WPN_UNLOCKED[key]=true` like weapon drops do.

**Interior tie-in (E3):** Lance Bay glows `#22D3EE`/livery; Rift Bay glows `#C4B5FD` with a visibly different emitter (**ring, not barrel**) — same matte charcoal room, the ONE livery color on the CE bay, white neon seam ring on the rift bay.

---

# 4) TAB INVENTORY & DOCKED TWO-PANEL UX (E1, E2, E8, E14)

## 4.1 What exists (anchor by symbol)

The `#gInv` overlay HTML skeleton is **already in the DOM** (~3874–3903: ids `gInvBars gInvRep gInvGear gInvSkills gInvShipName gInvShip gInvShipFoot gInvCargoCap gInvCargo gInvParts gInvTow`, 3-column `.inv-cols`) with matching `.inv-*` CSS (~3485) — but **zero JS wiring**. The view switch (`sho(...)` ~7675) lacks `gInv`; the global keydown (~8340) has no Tab handling; the sim already freezes on any non-play view (`if(view==='play')` ~8155). Dock: `openDock()` ~5919 → `renderDock(); setDockTab('ship'); setView('dock')`; tabs ship/weapons/haven. All sells route through `addCredits()` (~4245, applies +12%/SHIP.cargo + Quartermaster) — **never multiply again**.

## 4.2 Decisions

1. **Tab pauses the game for free** — `setView('inv')` freezes the sim via the existing view gate; it does NOT consume `MAX_PAUSES=10` (that budget is the *pause menu's* drama; `#gInv` deliberately has no Resume/Restart/Quit so it doesn't read as one). Anti-flicker: 0.25s toggle cooldown. *(Owner flag: if free-freeze bothers you, the one-liner is `pauseCount+=0.34` per combat open — not recommended.)*
2. **Docked mode = the SAME `#gInv` overlay side-by-side with `#gDock`** via a `dock-split` class on `#scanStage`. No second DOM, no duplicated render. Inventory left **40vw**, hangar right **60vw**.
3. **Split auto-opens on docking if the hold has cargo** — "return cargo → sell" is one glance, zero clicks.
4. **E8 costs no new systems:** CARGO is the only new store; PARTS is a *view* over existing `INV`/`WPN_UNLOCKED` (`INV[id] − equippedCount(id)` spares + unequipped weapons).

## 4.3 Keybinding rules (E1)

| Context | **Tab** | **Esc** | **P** |
|---|---|---|---|
| `view==='play'`, no `BOARD`, `mode!=='lost'` | open inventory | pause menu (unchanged) | pause (unchanged) |
| `view==='play'` + `BOARD` (on foot) | **swallowed** — no overlay mid-breach | pause | pause |
| `view==='inv'` | close → play | close → play | ignored |
| `view==='dock'` | toggle split panel | split open? close split; else nothing | ignored |
| `'card'/'dlg'/'pause'/'name'/'dev'` | swallowed (`preventDefault`) | existing | existing |
| `'menu'` + sub-screens | **not swallowed** — Tab keeps walking focus (accessibility) | existing | existing |
| typing in an input | untouched (existing `typing` guard returns first) | existing | — |

**Keydown patch** (inside the handler ~8340, AFTER the `typing` guard, BEFORE the `dlg` guard):

```js
    if(e.key==='Tab' && view!=='menu' && view!=='how' && view!=='board'){
      e.preventDefault();
      var nw=performance.now(); if(nw-(invTogT||0)<250) return; invTogT=nw;
      if(view==='play' && !BOARD && mode!=='lost' && mode!=='won') openInv();
      else if(view==='inv') closeInv();
      else if(view==='dock') toggleDockSplit();
      return;
    }
```

**Escape chain patch** (~8349, new first two branches):

```js
    else if(e.key==='Escape'){
      if(view==='inv'){ closeInv(); }
      else if(view==='dock' && dockSplit){ toggleDockSplit(); }
      else if(view==='play') pauseGame(); else if(view==='pause') resumeGame();
      /* …rest unchanged… */
```

**Overlay switch patch** (~7675): `sho('gInv', view==='inv' || (view==='dock' && dockSplit));`
**`setView()` patch** (~5000): leaving dock kills the split:

```js
  function setView(v){ view=v;
    if(v!=='dock' && dockSplit){ dockSplit=false; if(stage) stage.classList.remove('dock-split'); }
    /* …existing body unchanged… */
```

## 4.4 The TAB overlay — wiring (E1 + E2)

Layout is already in the DOM: **left = pilot** (bars, rep, gear, skills) · **center = FTL interior canvas 360×420** · **right = hold** (cargo/parts/tractor). Two HTML additions: inside `.inv-col.inv-ship`, after `#gInvShipFoot`: `<div class="inv-pop" id="gInvPop" style="display:none"></div>`; inside `#gDock`'s `.dk-wallet` (~3781): `<button class="iv-btn dk-holdbtn" id="gDockHold" type="button">&#9664; HOLD &#183; TAB</button>`.

**CSS additions** (append near `.inv-*` block ~3510):

```css
.inv-ship{position:relative}
.iv-btn{flex:none;font-family:'Orbitron',sans-serif;font-weight:700;font-size:.54rem;letter-spacing:.06em;color:#06121f;background:#F1D27A;border:none;padding:4px 9px;cursor:pointer;clip-path:polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px);transition:filter .12s}
.iv-btn:hover{filter:brightness(1.15)}
.iv-btn.iv-scrap{background:none;border:1px solid rgba(224,68,124,.5);color:#ff9dbb}
.dk-holdbtn{margin-top:5px;background:none;border:1px solid rgba(94,234,212,.45);color:#5EEAD4}
.inv-pop{position:absolute;z-index:9;min-width:170px;max-width:230px;background:rgba(8,12,24,.96);border:1px solid rgba(34,211,238,.45);padding:10px 12px;text-align:left;font-family:'Space Mono',monospace;font-size:.6rem;line-height:1.45;color:#cfe0ff;clip-path:polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)}
.inv-pop b{font-family:'Orbitron',sans-serif;font-size:.66rem;color:#dff6ff;display:block;margin-bottom:4px}
.inv-pop .ip-mod{display:flex;align-items:center;gap:6px;margin:3px 0;color:#9fb0cc}
.inv-pop .ip-mod i{width:8px;height:8px;flex:none;background:var(--c);box-shadow:0 0 6px var(--c)}
.inv-pop .ip-empty{color:#7e91b4;font-style:italic}
.inv-pop .ip-hint{margin-top:6px;color:#5EEAD4;font-size:.54rem;letter-spacing:.08em;text-transform:uppercase}
@keyframes invFlash{50%{box-shadow:0 0 0 2px #F1D27A}}
.inv-flash{animation:invFlash .45s ease 2}
```

**Open/close + render** (paste near `openDock` ~5915):

```js
  /* ===== TAB INVENTORY (E1/E2) ===== */
  var dockSplit=false, invTogT=0, INV_ROOM_HIT=[];
  function openInv(){ renderInv(); setView('inv'); sfx('ui'); }
  function closeInv(){ if(view!=='inv') return; var pop=Q('gInvPop'); if(pop) pop.style.display='none'; setView('play'); sfx('ui'); }
  function toggleDockSplit(){ if(view!=='dock') return; dockSplit=!dockSplit;
    if(stage) stage.classList.toggle('dock-split',dockSplit);
    if(dockSplit) renderInv(); sfx('ui'); }

  /* shared REP strip — cut the inline mkRep out of renderDock (~6535) and call this there too */
  function repStripHTML(){
    var mk=function(label,val,col){ var pct=Math.abs(val)/100*50, left=val>=0?'left:50%':'left:'+(50-pct)+'%';
      return '<span class="rp" style="--c:'+col+'"><b>'+label+'</b><i><em style="'+left+';width:'+pct+'%"></em></i>'+val+'</span>'; };
    return mk('IMP',REP.imperial,'#7FA8FF')+mk('CIV',REP.civilian,'#5EEAD4')+mk('CLAN',REP.clan,'#F97316')
      +'<span class="rp-band'+(repBand()==='OUTLAW'?' outlaw':'')+'">'+repBand().toUpperCase()+'</span>'; }

  function renderInv(){
    var bars=Q('gInvBars'); if(bars){
      var mkB=function(lab,v,m,col){ var f=m>0?Math.max(0,Math.min(1,v/m)):0;
        return '<div class="inv-bar" style="--c:'+col+'"><b>'+lab+'</b><i><em style="width:'+(f*100)+'%"></em></i><u>'+Math.round(v)+'/'+Math.round(m)+'</u></div>'; };
      bars.innerHTML=mkB('HULL',player.hp,player.hpMax,'#22D3EE')+mkB('SHIELD',player.sh,player.shMax,'#5EEAD4')+mkB('ENERGY',player.energy,player.energyMax,'#F1D27A');
    }
    var rp=Q('gInvRep'); if(rp) rp.innerHTML=repStripHTML();
    var gr=Q('gInvGear'); if(gr) gr.innerHTML=
      '<div><span>SIDEARM &#183;</span> '+GEAR_DEFS.gun[(GEAR.gun||1)-1].n+'</div>'
      +'<div><span>BLADE &#183;</span> '+GEAR_DEFS.blade[(GEAR.blade||1)-1].n+'</div>'
      +'<div><span>ARMOR &#183;</span> '+GEAR_DEFS.armor[(GEAR.armor||1)-1].n+'</div>';
    var sk=Q('gInvSkills'); if(sk){ var sh='',k;
      for(k in SKILL_DEFS){ var r=SKILLS[k]||0; if(r>0) sh+='<span class="inv-skill" style="--c:'+SKILL_DEFS[k].c+'">'+SKILL_DEFS[k].n+' '+r+'</span>'; }
      sk.innerHTML=sh||'<span class="inv-empty">No skills trained yet</span>'; }
    var nm=Q('gInvShipName'); if(nm) nm.textContent=curFrame().name.toUpperCase();
    var ft=Q('gInvShipFoot'); if(ft) ft.textContent='Click a room to inspect its modules \u00B7 refit at the Haven';
    var cv=Q('gInvShip'); if(cv){ var g=cv.getContext('2d'); g.clearRect(0,0,cv.width,cv.height);
      INV_ROOM_HIT=drawShipInterior(g,cv.width,cv.height)||[]; }        /* §1.3 renderer owns the canvas */
    /* --- right column: HOLD (E8) --- */
    var cap=Q('gInvCargoCap'); if(cap) cap.textContent='\u00B7 '+cargoCount()+' / '+cargoCap();
    var cl=Q('gInvCargo'); if(cl){ var ch='',ck;
      for(ck in CARGO){ var cd=CARGO_DEFS[ck]; if(!cd||!(CARGO[ck]>0)) continue;
        ch+='<div class="inv-item" style="--c:'+cd.c+'"><div><b>'+cd.n+'</b> \u00D7'+CARGO[ck]+' <span>'+cd.d+'</span></div>'
          +'<span class="iv-val">'+(cd.v*CARGO[ck]).toLocaleString()+' CR</span>'
          +(dockSplit?'<button class="iv-btn" data-sell="'+ck+'" type="button">SELL</button>':'')+'</div>'; }
      cl.innerHTML=ch||'<div class="inv-empty">Hold empty \u2014 disable ships, don\u2019t vaporise them</div>'; }
    var pl=Q('gInvParts'); if(pl){ var ph='',id,wk;
      for(id in MODULES){ var spare=(INV[id]||0)-equippedCount(id); if(spare<1) continue;
        ph+='<div class="inv-item" style="--c:'+MODULES[id].c+'"><div><b>'+MODULES[id].n+'</b> \u00D7'+spare+' <span>unsocketed</span></div>'
          +(dockSplit
            ?'<button class="iv-btn" data-fit="'+id+'" type="button">FIT</button><button class="iv-btn iv-scrap" data-scrap="'+id+'" type="button">SCRAP '+(MOD_VAL[id]||120)+'</button>'
            :'<span class="iv-val">fit at the Haven</span>')+'</div>'; }
      for(wk in WPN_UNLOCKED){ if(!(WEAPONS[wk]||RIFT[wk])||wk===player.weapon||wk===player.weapon2) continue;
        var wd=WEAPONS[wk]||{name:wk,col:'#B08CFF'};
        ph+='<div class="inv-item" style="--c:'+wd.col+'"><div><b>'+wd.name+'</b> <span>spare weapon \u2014 refit at the Haven</span></div></div>'; }
      pl.innerHTML=ph||'<div class="inv-empty">No spare parts</div>'; }
    var tw=Q('gInvTow'); if(tw){ var towing=null,ti;
      for(ti=0;ti<hulks.length;ti++) if(hulks[ti].st==='tow'){ towing=hulks[ti]; break; }
      tw.innerHTML=towing
        ?'<b style="color:#5EEAD4">LATCHED</b> \u2014 '+(ROSTER[towing.key]?ROSTER[towing.key].n||towing.key:towing.key)+' hulk under tow ('+Math.round(towing.integ)+'/'+towing.integMax+' integrity). Drag it inside the Haven ring for full salvage.'
        :(rescueShip&&rescueShip.st==='tow')
          ?'<b style="color:#5EEAD4">LATCHED</b> \u2014 disabled civilian under tow. Deliver to the Haven.'
          :'Beam idle. Cripple a ship \u2014 don\u2019t kill it \u2014 and hold G close by to latch on. Towing cuts your thrust.'; }
  }
```

**Room click → module popover:**

```js
  function invRoomClick(e){
    var cv=Q('gInvShip'), pop=Q('gInvPop'); if(!cv||!pop) return;
    var b=cv.getBoundingClientRect(), mx=(e.clientX-b.left)*(cv.width/b.width), my=(e.clientY-b.top)*(cv.height/b.height), i,hit=null;
    for(i=0;i<INV_ROOM_HIT.length;i++){ var r=INV_ROOM_HIT[i]; if(mx>=r.x&&mx<=r.x+r.w&&my>=r.y&&my<=r.y+r.h){ hit=r; break; } }
    if(!hit){ pop.style.display='none'; return; }
    var html='<b>'+hit.n+'</b>', j, any=false;
    for(j=0;j<(hit.slots||[]).length;j++){ var mid=hit.slots[j], m=mid?MODULES[mid]:null;
      html+= m?'<div class="ip-mod" style="--c:'+m.c+'"><i></i>'+m.n+'</div>'
             :'<div class="ip-mod" style="--c:#3a465c"><i></i>empty slot</div>'; any=true; }
    if(!any) html+='<div class="ip-empty">No module slots on this system</div>';
    html+='<div class="ip-hint">'+(view==='dock'?'Refit in the Weapons tab \u2192':'Dock at the Haven to refit')+'</div>';
    pop.innerHTML=html;
    pop.style.left=Math.min(hit.x/cv.width*100,58)+'%'; pop.style.top=(hit.y+hit.h)/cv.height*100+'%';
    pop.style.display='block'; sfx('ui');
  }
```

Clicking a room while **docked** additionally deep-links to `renderSockets()` (the FIT flow, §4.5). Popover status lines come from the §1.4 table.

## 4.5 Docked two-panel mode (E14)

**Flow:** `arriveBase()` (~5925) → `openDock()`. Patch the end of `openDock()`:

```js
  function openDock(){ mode='dock'; returnReady=false; baseReturn=false;
    if(priceDocks>0){ priceDocks--; if(priceDocks<=0) priceMul=1; }
    crewTierUp(); refreshHireOffer();
    restedThisDock=false; havenAutoBuy(); resetRooms();          /* §6 hooks + room repair on dock */
    renderDock(); setDockTab('ship'); setView('dock');
    dockSplit=cargoCount()>0;                                    /* auto-open the hold when there's loot */
    if(stage) stage.classList.toggle('dock-split',dockSplit);
    if(dockSplit) renderInv(); }
```

**Layout CSS** (append after `.dk-*` block ~3560) — both are full-screen `.g-overlay` flex containers, so the split is pure CSS:

```css
/* ===== docked two-panel mode (E14): inventory 40 / hangar 60 ===== */
.dock-split #gInv{justify-content:flex-start}
.dock-split #gInv .go-inv{width:calc(40vw - 24px);max-width:none;margin:auto 0 auto 12px;padding:1.2rem 1.1rem 1rem}
.dock-split #gInv .inv-cols{grid-template-columns:1fr;gap:4px}   /* single column at 40vw */
.dock-split #gInv .inv-cargo{order:-1}                            /* HOLD first: selling is the job here */
.dock-split #gInv .inv-ship{display:none}                         /* hangar already shows the ship portrait */
.dock-split #gInv .inv-hint{display:none}
.dock-split #gDock{justify-content:flex-end}
.dock-split #gDock .go-card{width:calc(60vw - 24px);max-width:none;margin:auto 12px auto 0}
@media(max-width:900px){
  .dock-split #gInv{z-index:8;background:rgba(4,7,14,.82);justify-content:center}
  .dock-split #gInv .go-inv{width:92%;margin:auto}
  .dock-split #gDock{justify-content:center}
  .dock-split #gDock .go-card{width:92%;margin:auto}
}
```

**Click wiring** (add to the big delegated click handler, next to the `.dk-tab` branch ~8292):

```js
    if(t.closest('#gDockHold')){ toggleDockSplit(); return; }
    var sb=t.closest('[data-sell]');  if(sb){ sellCargo(sb.getAttribute('data-sell'),true); return; }
    var xb=t.closest('[data-scrap]'); if(xb){ scrapModule(xb.getAttribute('data-scrap')); return; }
    var fb=t.closest('[data-fit]');   if(fb){ setDockTab('weapons');
      var s=Q('gSockets'); if(s){ s.scrollIntoView({block:'center',behavior:'smooth'}); s.classList.remove('inv-flash'); void s.offsetWidth; s.classList.add('inv-flash'); } return; }
    if(t.closest('#gInvShip')){ invRoomClick(e); return; }
```

- **SELL:** whole stack → `addCredits` (multipliers apply automatically), gold floater on the wallet, both panels re-render. Contraband nudges REP on sale.
- **FIT:** flips the right panel to the existing **Weapons** tab and flashes `#gSockets` — socketing stays the existing `sock-btn` flow (no duplicate install UI).
- **SCRAP:** converts a spare to credits at `MOD_VAL`; equipped copies protected by the spare math.
- The three existing dock tabs (Ship/Weapons/Haven) are untouched in the right panel; the hold panel **replaces any need for a 4th "Cargo" tab**. Only header addition: the `#gDockHold` "◀ HOLD · TAB" toggle. `sellCargo`/`scrapModule` call `renderInv()` and, when docked, `renderDock()`.

## 4.6 CARGO system (E2 + E8 + the "return cargo" leg of E13)

```js
  /* ===== CARGO (E8): sellable goods; ride in the hold until sold at the Haven ===== */
  var CARGO_DEFS={
    scrap:  {n:'Hull Scrap',     c:'#8A93A6', v:8,  d:'torn plating; the Haven smelts it'},
    cells:  {n:'Ion Cells',      c:'#22D3EE', v:14, d:'charged capacitor cores from energy wrecks'},
    goods:  {n:'Trade Goods',    c:'#F1D27A', v:14, d:'sealed freight; someone paid for this once'},
    chitin: {n:'Chitin Plate',   c:'#C4B5FD', v:18, d:'Swarm shell; the labs pay well'},
    coolant:{n:'Coolant Casks',  c:'#7FA8FF', v:20, d:'stabilised coolant, always in demand'},
    sigil:  {n:'Ledger Sigils',  c:'#E0447C', v:25, d:'clan markers; the Navy buys trophies'},
    core:   {n:'Data Cores',     c:'#5EEAD4', v:40, d:'encrypted flight logs and market data'},
    lux:    {n:'Contraband Luxuries', c:'#F97316', v:60, d:'no manifest; selling bends your record', rep:{imperial:-2,clan:2}}
  };
  var CARGO={};  /* key -> qty; persists as bdg_cargo */
  var MOD_VAL={split2:160,split3:420,scharge:220,focus:160,cooler:160,capbank:190,turbine:190}; /* others default 120 */

  function cargoCap(){ return (curFrame().cargoCap||10)+(SHIP.cargo||0)*2; }
  function cargoCount(){ var n=0,k; for(k in CARGO) n+=CARGO[k]; return n; }
  function addCargo(k,q){ q=q||1; var def=CARGO_DEFS[k]; if(!def) return 0;
    var take=Math.max(0,Math.min(q,cargoCap()-cargoCount()));
    if(take>0){ CARGO[k]=(CARGO[k]||0)+take; saveMeta(); }
    if(q>take){ var cr=addCredits(Math.round(def.v*(q-take)*0.5));                 /* hold full: skimmed at 50% */
      floaters.push({x:cx-24,y:cy-30,vy:-24,a:1.4,txt:'HOLD FULL \u2014 SKIMMED +'+cr+' CR',col:'#E0703C'}); }
    return take; }
  function sellCargo(k,all){ var def=CARGO_DEFS[k], q=CARGO[k]||0; if(!def||q<1) return;
    var n=all?q:1, got=addCredits(def.v*n);
    CARGO[k]=q-n; if(CARGO[k]<=0) delete CARGO[k];
    if(def.rep){ var rk; for(rk in def.rep) repAdd(rk,def.rep[rk]*n); }
    saveMeta(); sfx('shield'); showBanner('SOLD \u00D7'+n,def.n+' \u2192 +'+got+' CR',def.c);
    renderInv(); if(view==='dock') renderDock(); }
  function scrapModule(id){ var spare=(INV[id]||0)-equippedCount(id); if(spare<1){ sfx('deny'); return; }
    INV[id]=(INV[id]||0)-1; if(INV[id]<=0) delete INV[id];
    var got=addCredits(MOD_VAL[id]||120); saveMeta(); sfx('shield');
    showBanner('SCRAPPED','+'+got+' CR',(MODULES[id]||{}).c||'#F1D27A');
    renderInv(); if(view==='dock') renderDock(); }
  function dropCargoKey(fac){
    if(fac==='alien') return 'chitin';
    if(fac==='clan')  return Math.random()<0.35?'sigil':'scrap';
    if(fac==='civilian') return 'goods';
    return Math.random()<0.25?'cells':'scrap'; }
```

**Capacity per frame (E11):** runabout 10 · hauler 24 (the freight frame) · gunship 14, **+2 per `SHIP.cargo` rank** (max +8). Reconciliation: `SHIP.cargo` keeps its existing +12% credit yield *and* grants capacity — one upgrade, two coherent effects, no save impact.

**Sources & flow:**
- **Replace the instant-sell branch** in the pickup consumer (~5607: `'CARGO SOLD +N CR'`):
  ```js
  else if(p.type==='cargo'){ var tk=addCargo(p.ck||'goods',1);
    if(tk) floaters.push({x:p.x-14,y:p.y-12,vy:-22,a:1.1,txt:'CARGO '+cargoCount()+'/'+cargoCap(),col:'#E0703C'});
    grings.push({x:p.x,y:p.y,r:6,a:0.9,col:'#E0703C',grow:true}); sfx('shield'); }
  ```
- Civilian wrecks (~5569): add `ck:'goods'` to the two pushed pickups. Hostile **clean kills only** (§5.1 gate): `if(Math.random()<0.20) pickups.push({x:e.x,y:e.y,type:'cargo',ck:dropCargoKey(eFac(e)),vx:(Math.random()-0.5)*80,vy:(Math.random()-0.5)*80,life:12});` — elites additionally drop `ck:'core'`. ≈2–4 drops/wave ≈ 30–60 CR: pocket money next to bounties; **boarding loot and hulk tows are where `core`/`lux` volume comes from** (boarding crates call `addCargo('lux'|'core')` instead of raw credits — one-line hook).
- **Untouched:** `mission.t==='cargo'` delivery crates (`player.carry` ~6755) are objective tokens, not hold goods; `type:'module'`/`'weapon'` pickups already land in `INV`/`WPN_UNLOCKED` = the PARTS side of E8.
- **Selling only at the Haven** (split-mode SELL buttons); in flight the hold is read-only — that's the "return cargo" loop leg (E13).
- **Death stake** in `endGame(false)`: `for(var k in CARGO) CARGO[k]=Math.floor(CARGO[k]*0.5); saveMeta();` — banner `'HALF THE HOLD SPILLED'`. Cargo you didn't bring home matters.

---

# 5) SALVAGE COMBAT & TRACTOR BEAM (E9)

**Reused machinery (verified):** `dmgEnemy(e,dmg,isIon)` ~4330 leaves `e.hp` **negative** after a killing blow → free overkill measurement; ion identity exists (×2.5 shield / ×0.6 hull, `e.ionT` slow). `killEnemy(e,j,byNpc)` ~5514 is the single choke point for all kills. `disableShip(e)` ~6055 + disabled drift/scuttle ~6931 is the hulk-state pattern. The **rescue tow** (`updateHaven` ~6691: latch `< shipR+52`, pull `Math.min(420,(tdd-46)*6)`, deliver inside `DOCK_R=140`) IS the tractor beam — generalized here. Drops route through `dropCredits/maybeDropModule/dropWeapon` ~5495. `ROSTER` fields `hp,rad,cr,elite,board,fac` drive every rule — no new roster fields.

## 5.1 Destruction-Quality Model

```js
var lastHitIon=false;
function dmgEnemy(e,dmg,isIon){ lastHitIon=!!isIon; e.shT=0; /* ...unchanged... */ }
```

Three tiers, checked in `killEnemy` after the existing `d.board` early-return and `byNpc`/non-hostile guards:

| Tier | Condition | Result |
|---|---|---|
| **HULK** (best) | `ovk < (lastHitIon?0.25:0.10)` AND `e.hpMax>=20` AND hostile AND `!d.board` | No explosion. Core vents, ship goes dark, tractorable wreck for 45s. No drops at kill time. |
| **CLEAN KILL** | `ovk < 0.5` | Exactly today's behavior — `dropCredits(cr*3)`, module roll, pity drops, xp, combo. Plus the 20% cargo-crate roll (§4.6). |
| **VAPORIZED** | `ovk >= 0.5` | Core breach. Scrap only: `dropCredits(cr*1.5)`, **no module, no weapon, no cargo**. XP and combo still count. |

```js
function killEnemy(e,j,byNpc){
  var d=ROSTER[e.key], fac=eFac(e), hostile=(fac==='scoundrel'||fac==='freelancer'||fac==='clan'||fac==='alien');
  var ovk=Math.max(0,-e.hp)/e.hpMax;                     /* e.hp is still negative from dmgEnemy */
  if(d.board && !e.scuttled){ /* unchanged boardable clamp -> disableShip */ }
  /* NEW: precision finish -> hulk instead of explosion */
  if(!byNpc && hostile && !d.board && e.hpMax>=20 && ovk < (lastHitIon?0.25:0.10)){
    spawnHulk(e); enemies.splice(j,1); return;
  }
  /* ...existing juice/split/faction blocks... */
  var vape = ovk>=0.5;
  if(vape){
    dropCredits(e.x,e.y,Math.max(1,Math.round((d.cr||1)*1.5)));
    floaters.push({x:e.x-22,y:e.y-18,vy:-24,a:1.2,txt:'VAPORIZED',col:'#8A93A6'});
  } else {
    /* existing elite/normal drop block verbatim + 20% cargo roll (§4.6) */
  }
  /* xp + combo + score: unchanged in BOTH branches */
}
```

**Self-balancing:** `hpMax>=20` means the classic swarm roster (hp 3–15) never hulks — wave pacing and screen-clear feel untouched. Only the FREEDOM 2.0 roster (`broodDrone` 22 → `warlordElite` 320, cr 8–110) participates. Tiny ships naturally vaporize (any hit ≥1.5 dmg overshoots a 3hp dart by 50%) — reads correctly: light craft flash to plasma, heavy hulls die in stages.

**Salvage-bay fiction** (codex copy): every 2.0-era hull carries three bays — **WEAPON bay** (a module), **ENGINE bay** (parts credits), **HOLD** (cargo). Vaporized = 0 bays. Clean kill = "one bay survived, maybe" (today's rolls). Delivered hulk = all three, guaranteed.

## 5.2 The hulk object + tow (G key; `keys.KeyG`, same map as the `keys.KeyE` breach hold)

```js
var hulks=[], salvCount=0; /* salvCount resets in the wave-start block that resets rescueT (~5785) */
function spawnHulk(e){
  var d=ROSTER[e.key];
  boomFx(e.x,e.y,'#8A93A6'); sfx('deny');
  hulks.push({key:e.key, x:e.x,y:e.y, vx:e.vx*0.2,vy:e.vy*0.2,
    rad:e.rad||d.rad, cr:(d.cr||1), elite:!!e.elite,
    integ:30, integMax:30, wreckT:45, st:'drift', blink:0});
  floaters.push({x:e.x-34,y:e.y-24,vy:-20,a:1.8,txt:'HULK \u2014 HOLD G TO TRACTOR',col:'#5EEAD4'});
  showBanner('PRECISION KILL','Hulk intact 45s \u2014 tractor it to THE HAVEN for full salvage','#5EEAD4');
}
var TB_RANGE=90;                                   /* trange module: ×1.4 = 126 (C5) */
function towedCount(){ var n=0,i; for(i=0;i<hulks.length;i++) if(hulks[i].st==='tow') n++;
  if(rescueShip&&rescueShip.st==='tow') n++; return n; }        /* rescue counts against capacity */
function towCapacity(){ return MS.towSlots||1; }                /* tdual module -> 2 */
function updateHulks(dt){
  for(var i=hulks.length-1;i>=0;i--){ var h=hulks[i]; h.blink+=dt;
    if(h.st==='drift'){
      h.x+=h.vx*dt; h.y+=h.vy*dt; h.vx*=Math.exp(-1.2*dt); h.vy*=Math.exp(-1.2*dt);
      h.wreckT-=dt;
      if(keys.KeyG && towedCount()<towCapacity() && Math.hypot(cx-h.x,cy-h.y)<shipR+TB_RANGE*(MS.tractorRangeMul||1)){
        h.st='tow'; floaters.push({x:h.x-24,y:h.y-26,vy:-20,a:1.4,txt:'TRACTOR LOCKED',col:'#5EEAD4'}); sfx('shield');
      }
      if(h.wreckT<=0){ boomFx(h.x,h.y,'#8A93A6'); dropCredits(h.x,h.y,Math.round(h.cr*1.5));
        floaters.push({x:h.x-26,y:h.y-18,vy:-18,a:1.4,txt:'HULK LOST',col:'#8A93A6'}); hulks.splice(i,1); continue; }
    } else { /* st==='tow' — identical math to the rescue tow (~6695) */
      var tdx=cx-h.x, tdy=cy-h.y, tdd=Math.hypot(tdx,tdy)||1;
      if(tdd>46){ var pull=Math.min(420,(tdd-46)*6); h.x+=tdx/tdd*pull*dt; h.y+=tdy/tdd*pull*dt; }
      if(defendNode && Math.hypot(h.x,h.y)<DOCK_R){ salvagePayout(h); hulks.splice(i,1); continue; }
    }
    if(h.integ<=0){ boomFx(h.x,h.y,'#E0703C'); dropCredits(h.x,h.y,Math.round(h.cr*1.5));
      floaters.push({x:h.x-30,y:h.y-18,vy:-18,a:1.6,txt:'HULK DESTROYED',col:'#E0447C'}); hulks.splice(i,1); }
  }
}
```

Hulks take splash/stray enemy fire (`h.integ` — one distance check in `updateEBul`'s hit loop). Below 50% integrity the delivery downgrades (module becomes a 50% roll) — **protecting your tow is gameplay.**

## 5.3 Tow penalty — you fly impaired

Applied where player thrust resolves (`ctrlMode` movement block ~4641): multiply accel AND max speed by:

```js
function towSpeedMul(){
  var m=1, grip=MS.towGrip||0;                     /* tgrip: 0.45/copy, cap 0.9 (C5) */
  for(var i=0;i<hulks.length;i++) if(hulks[i].st==='tow'){
    var p=Math.min(0.5, hulks[i].rad/40);          /* rad 12 drone: -30% … rad 20 barge: -50% */
    m*=1-p*(1-grip);
  }
  return m;
}
```

Rules while towing: **boost costs ×2 energy** · **Space dash SEVERS the cable** (hulk reverts to `drift` — the panic button when a wave turns on you) · dual-tow penalties multiply (two barges at zero grip = 25% speed: possible, miserable, hilarious).

## 5.4 Payout

```js
function salvagePayout(h){
  if(salvCount>=salvCap()){ h.st='drift'; showBanner('SALVAGE DOCK FULL','The yard takes no more this wave','#8A93A6'); return; }
  salvCount++;
  var got=addCredits(Math.round(h.cr*6));                       /* ENGINE bay: parts credits */
  var mods=(h.integ>=h.integMax*0.5)?1:(Math.random()<0.5?1:0); /* WEAPON bay */
  if(mods){ h.elite?grantModule('rare'):maybeDropModule(0,0,1); }
  addCargo(dropCargoKey(ROSTER[h.key]&&ROSTER[h.key].fac),1); addCargo('cells',1);  /* HOLD: 2 goods straight in */
  kills++; if(mission&&mission.t==='hunt'&&h.elite) mission.prog=Math.min(mission.target,mission.prog+1);
  showBanner('SALVAGE DOCKED','+'+got+' CR \u00B7 '+(mods?'1 module':'module bay wrecked')+' \u00B7 2 cargo','#5EEAD4');
  grings.push({x:h.x,y:h.y,r:12,a:0.9,col:'#5EEAD4',grow:false,spd:320,lw:2.4}); sfx('win');
}
function salvCap(){ return 2+((MSHIP.scrapyard|0)>=1?1:0); }    /* Scrapyard facility raises 2 -> 3 (§6.2) */
```

Delivery requires `defendNode` — which stays alive **through the fly-home stretch** (~6656), so late-wave hulks can be towed home after the horn. On non-Haven levels (v1.1): end-of-wave salvage beacon auto-claims drifting hulks at 60% value. Dock ring reuses the existing tow-brightening draw (~6718): condition becomes `(rescueShip&&rescueShip.st==='tow')||towedCount()>0`.

## 5.5 Dogfight incentive shifts (consequential, not arcade-dumb)

- **Precision > spray.** The Repeater Array (small per-hit dmg) rarely vaporizes and lands inside the hulk window on big hulls — it quietly becomes the salvager's finisher. Coherence Rail / Seeker Plasmoid / Burst Emitter overshoot by design → "I just want it dead" tools that eat the material economy. **No weapon nerfs needed; the tier thresholds do it.**
- **Ion is the salvage identity.** The Ion Cannon already does ×0.6 hull damage — bad at killing, and its killing blows get the **widened 0.25 hulk window**. Ion + tractor = freighter-captain build; ion + boarding was already the pirate build. Riftwork addendum: `lag`/`tether` are salvage-adjacent rift arms (control without overkill); `sing` near a low ship almost always vaporizes — the black hole is the anti-salvage statement weapon, on purpose.
- **Board vs tractor on disabled elites** (`warlordElite`/`duelist`): while `e.disabled`, **E = breach** (loot NOW + kill credit via `endBoarding`→`killEnemy` ~6096) or **G = tractor** (tow lock freezes `e.discT` — clamps disarm the scuttle charges: `if(e.towLock) e.discT+=dt;` in the disabled-drift block ~6931 — deliver for `220+level*10` CR + guaranteed **rare** module + kill credit, but you fly at ~55% speed with a warlord on the hook). Boarding pays in risk-now; tractoring pays in risk-spread.

## 5.6 Enemy system-loss tells (cheap, E5-consistent fiction)

Only `e.hpMax>=20` ships. Computed at the top of the per-enemy update (~6949, next to shield regen):

```js
var hf=e.hp/e.hpMax, big=e.hpMax>=20;
e.sysW = big && hf<0.30;   /* WEAPONS DARK */
e.sysE = big && hf<0.20;   /* ENGINES DARK */
if(big && hf<0.60 && Math.random()<dt*3)   /* coil-bloom sparks */
  grings.push({x:e.x+(Math.random()-0.5)*e.rad, y:e.y+(Math.random()-0.5)*e.rad,
               r:3,a:0.5,col:'#F1D27A',grow:true,spd:60,lw:1.2});
```

| Hull | Tell | Mechanical effect | Cost |
|---|---|---|---|
| <60% | amber spark flicker | fire cooldowns ×1.5 | 3 lines |
| <30% | muzzle glow dies; sparks turn white | **stops firing** — `if(e.sysW) return;` inside `eShoot` (single choke point) | 1 line |
| <20% | engine flame not drawn; ship visibly limps | `maxV*=0.5; turn*=0.6` (alongside the ion `slowMul` ~6953) | 2 lines |

Fiction: energy-era ships don't carry magazines to cook off — they lose **coil pressure**. 60%: targeting coils bloom. 30%: emitters brown-out. 20%: drive ring collapses to a cold ember. A dark, limping hull is the game teaching "this one wants to be a hulk" without a tutorial. **Enemies run the same systems you do (E9)** — the codex documents their rooms with the same `ROOMS` table, and future boarding maps use the same `INTERIORS` schema (§1.6).

## 5.7 Economy table

Anchors: clean kill = `cr*3` chips; elites +180 flat; rescue = `150+level*20`; `CRATE_CR=14`; wave income ~100–165 CR. All salvage values are multipliers of `cr*3`, so they scale with the roster automatically:

| Outcome | Credits | Modules | Cargo | vs clean kill |
|---|---|---|---|---|
| Vaporized | `cr*1.5` | none | none | **0.5×, no materials** |
| Clean kill | `cr*3` | 3% base / 45% elite (unchanged) | 20% crate roll | 1× baseline preserved |
| Hulk lost/destroyed | `cr*1.5` scrap on the spot | none | none | punishes sloppy towing |
| Hulk delivered | `cr*6` | **1 guaranteed** (50% if integrity <50%) | 2 goods into the hold | ~**2.5–3×** |
| Elite hulk delivered | `220+level*10` | 1 guaranteed **rare** | 2 goods | vs boarding: bigger, later, safer-ish |

Per-wave: a dedicated tow player converting both capped deliveries on 2.0 ships (cr 14–22) adds ~**+120–190 CR and 1–2 modules** — a specialization bump, not an economy break, paid for in real risk (50% speed under fire, dash = drop the prize). Spray players lose ~15–30 CR/wave of material to vaporization. Guaranteed-module inflation is bounded by: hpMax≥20 + precision finish + a tow across the map + the 2/wave cap (3 with Scrapyard). Salvage-focused module income ≈1.5/wave vs today's elite 0.45 — that's the point of the build; everyone else stays at current rates.

**Dev hooks:** `window.__forceHulk=function(){ spawnEnemy('clanRaider'); var e=enemies[enemies.length-1]; e.hp=-0.01; killEnemy(e,enemies.length-1); }`; expose `hulks` (and `rbul`, `CARGO`, `havenFund`) in `__dbg`.

---

# 6) CORE LOOP · BASE SELF-UPGRADE · REST (E13, E4-rest, E12)

## 6.1 Mission rotation — attack / defend / return-cargo

Defend stays the spine. Two variants reuse **dormant engine code** — `startLevel()` (~5770) already branches on unused mission types `'cargo'/'hunt'/'beacons'/'survive'`; `updateCrates()` (~6626) has crate pickup (cap `3+SHIP.cargo`), carry-slow (−14% accel/crate ~4768), and Haven delivery fully built.

| Type | `t` | Win | Haven present? |
|---|---|---|---|
| **DEFEND** (unchanged) | `'defend'` | survive `target` seconds | yes, full trader traffic |
| **SORTIE** (attack, new ~25 lines) | `'sortie'` | destroy an objective structure 700–900u out + its escort | yes, **half trader rate** (`traderT` starts 10) — you left home lightly guarded: that's the tension |
| **HAUL** (return-cargo, engine exists) | `'cargo'` | deliver `target` crates to the Haven | yes, plus light harassment (`cap:8`) so carry-slow matters |

**One engine change for both:** in `startLevel()`, spawn `defendNode` (+ trader/rescue timers) for **all** non-boss types, not just `'defend'`.

**Sortie sketch:**

```js
/* startLevel(), after the 'defend' branch (~5785) */
else if(L.t==='sortie'){
  var sa=Math.random()*6.2832, sr=700+Math.random()*200;
  enemies.push({key:'depot',depot:true,x:Math.cos(sa)*sr,y:Math.sin(sa)*sr,
    hp:260+level*30,hpMax:260+level*30,sh:80,shMax:80,shT:0,t:0,fireCd:2,
    vx:0,vy:0,ang:sa+Math.PI,rad:34,noDrift:true});
  mission.target=1; minimapOn=true;
  defendNode={hp:mshipHpMax(),hpMax:mshipHpMax(),sh:150,shMax:150,shT:99};
  traders.length=0; traderT=10; mturT=1.2;
}
/* killEnemy(): if(e.depot){ mission.prog=1; } — win check (~8102): add 'sortie' to the list */
else if((mission.t==='massacre'||mission.t==='cargo'||mission.t==='hunt'||mission.t==='beacons'||mission.t==='sortie') && mission.prog>=mission.target){ levelDone(); }
```
Escort keeps spawning from `L.pool` while the depot lives (`cap` 10–14). Depot fires slow aimed bolts (reuse sniper pattern). Salvage tie-in: the depot obeys the §5.1 tiers (overkill it = 2 module rolls fewer; hpMax 260 means it can be hulked and towed — a whole-wave prize).

**Haul:** set `t:'cargo'` in LEVELS — `startLevel` already scatters `target+2` crates at 300–640u, `updateCrates` handles the rest, minimap shows BASE when carrying, `companionSay('cargoDelivered')` exists. Add only: `defendNode` + harassment spawner. Target 10–14 crates; each delivery also feeds the Haven fund (§6.2).

**Mapping onto the existing 20 LEVELS** (edit `t:` + story verbs only; pools/elites/themes unchanged) — result: **9 defend · 4 sortie · 3 haul · 4 boss**, rhythm ≈ *defend, defend, attack, (haul), boss* per block:

| Wave | Now | Becomes | Objective |
|---|---|---|---|
| 1–2 | defend | defend | teach the core |
| **3** | defend `claimjump` | **sortie** | destroy the rival claim-stake platform |
| 4 | defend | defend | — |
| 5 | boss 1 | boss | — |
| **6** | defend `refugee` | **haul** (10) | recover jettisoned supply pods |
| 7 | defend `alien1` | defend | — |
| **8** | defend `redledger` | **sortie** (elite `clanCaptain` escort) | burn the Crimson Ledger's forward depot |
| 9–11 | defend/boss/defend | unchanged | mines wave + boss 2 + audit stay pure defends |
| **12** | defend `sporetide` | **haul** (12) | harvest drifting bio-pods before they hatch |
| **13** | defend `headhunt` | **sortie** (elite `duelist` escort) | kill the mercenary command boat |
| 14–15 | defend `siegeworks` / boss 4 | unchanged | barge mechanic stays a defend |
| **16** | defend `warlord` | **sortie** (elite `warlordElite`) | destroy the warlord's flag platform |
| 17 | defend `broodguard` | defend | enrage stays a defend |
| **18** | defend `reckoning` | **haul** (14) | evacuate the sector's valuables before the storm |
| 19–20 | defend `storm` / boss 3 | unchanged | climax |

*(E12: the §CONFLICTS C12 15-wave cut list preserves all 7 variant waves.)*

## 6.2 The Haven upgrades ITSELF (E13)

The Haven keeps its **own ledger** (`havenFund`), separate from player credits. It earns while you fight; when the fund covers the cheapest next facility rank, it auto-buys **at dock** (never mid-wave, so the banner lands). Player donations pour straight in. Direct player purchases via `buyMship()` remain — instant, player-paid, Entrepreneur-discounted, unchanged.

**Income (all additive hooks):**

| Source | Hook | Amount |
|---|---|---|
| Trader docking (Haven's cut) | `updateHaven()` fee site ~6684, after `addCredits(fee)` | `havenFund += Math.round(fee*1.5)` (player fee untouched — shadow cut) |
| Wave-end stipend | `levelDone()` after reward ~5843 | `havenFund += 25 + 5*level` |
| Rescue completed | rescue payout ~6703 | `havenFund += 40` |
| Haul delivery | delivery site ~6630 | `havenFund += got*6` (Haven taxes the cargo) |
| Rest (time passes; traders keep docking) | `applyRest()` §6.3 | `havenFund += 35` |
| **Donation** | new dock button | 1:1, plus `repAdd('civilian',1)` per 250 CR (cap +4 rep per dock) |

**Pacing** (traders ~1 dock/13s, fee 12 × market bonus, cut 1.5×): waves 1–4 ≈ ~120 fund/wave → first auto-buy (Marketplace R1, 300) lands ~wave 3–4. Market R1 raises fees 25% → the fund compounds. Mid-game ≈250–300/wave; passive total over 20 waves ≈ **3.5–4.5k** → the Haven self-buys **5–6 of the facility ranks** (full max-out ≈15.5k undiscounted). Donations close the gap — they matter without being mandatory. Tune knob: the single `1.5` trader-cut multiplier. *(Owner flag: if you prefer a literal split — player 60% / Haven 40% — change two lines at the fee site and re-tune.)*

**New facility** (E9 tie-in, add to `MSHIP_DEFS` ~4094): `scrapyard:{n:'Scrapyard', c:'#8A93A6', cost:500, m:2, d:'R1: salvage deliveries 2→3 per wave · R2: hulk timers +15s'}`.

**Auto-buy rule** — cheapest-next-rank wins; ties break by priority `market > repair > shield > turret > scrapyard` (market first = self-accelerating economy, which reads great). Auto-buys use **undiscounted** cost — the station doesn't get your Entrepreneur discount:

```js
var havenFund=0, havenBought=0;                       /* persist: bdg_haven {f,b} */
function havenNextBuy(){ var best=null,order=['market','repair','shield','turret','scrapyard'];
  for(var i=0;i<order.length;i++){ var id=order[i],def=MSHIP_DEFS[id],r=MSHIP[id]||0;
    if(!def||r>=def.m) continue; var c=Math.round(def.cost*Math.pow(1.7,r));
    if(!best||c<best.cost) best={id:id,def:def,cost:c}; }
  return best; }
function havenAutoBuy(){ var nb=havenNextBuy(), n=0;
  while(nb && havenFund>=nb.cost && n++<2){            /* max 2 ranks per dock — keep buys legible */
    havenFund-=nb.cost; MSHIP[nb.id]=(MSHIP[nb.id]||0)+1; havenBought++;
    showBanner(nb.def.n.toUpperCase()+' RANK '+MSHIP[nb.id],'THE HAVEN built it from its own docking income',nb.def.c);
    sfx('shield'); nb=havenNextBuy(); }
  saveMeta(); }
function donateHaven(n){ n=Math.min(n,credits); if(n<=0){ sfx('deny'); return; }
  credits-=n; havenFund+=n; var rep=Math.min(4,Math.floor(n/250));
  if(rep) repAdd('civilian',rep); saveMeta(); renderDock(); sfx('coin');
  showBanner('DONATION','+'+n+' CR to the Haven fund \u2014 the dockworkers cheer','#F1D27A'); }
```

`havenAutoBuy()` is called from `openDock()` (§4.5 patch). **Haven tab UI** (top of `renderMship()`, above `#gMshipGrid`):

```js
var nb=havenNextBuy(), pct=nb?Math.min(100,Math.round(havenFund/nb.cost*100)):100;
html+='<div class="hv-fund"><b>HAVEN FUND \u00B7 '+havenFund+' CR</b>'
  +(nb?'<span>Next self-build: '+nb.def.n+' R'+((MSHIP[nb.id]||0)+1)+' \u00B7 '+nb.cost+' CR</span>'
       :'<span>All facilities complete</span>')
  +'<i class="hv-bar"><em style="width:'+pct+'%;background:'+(nb?nb.def.c:'#5EEAD4')+'"></em></i>'
  +'<div class="hv-donate"><button class="dk-buy" data-donate="100">+100</button>'
  +'<button class="dk-buy" data-donate="500">+500</button>'
  +'<button class="dk-buy" data-donate="all">ALL IN</button></div></div>';
```
Wire `data-donate` in the delegated click handler next to `data-mship` (~8255): `donateHaven(v==='all'?credits:parseInt(v,10))`. The progress bar fills in the target facility's own color — reads as "the Haven is saving up for *that*".

## 6.3 REST — living quarters between waves (E4, canon per C7)

**Rules:** available only while docked; **one rest per dock visit** (`restedThisDock`, reset in `openDock()`). Resting consumes time-at-dock: traders keep docking while you sleep → `havenFund += 35`. Skipping rest is always allowed and free. Pick **one** of three boons — that's the whole decision, no menus-in-menus:

| Boon | Cost | Effect |
|---|---|---|
| **SLEEP IT OFF** | free | `player.hp = player.hpMax` **and** `restBuff`: next wave starts with +10 shield and **energy regen ×1.15**. This is the **only full heal in the game** — hull persists between waves and the dock has no repair today, so attrition resolves *here*, which is why it competes with the other two boons. |
| **PATCH THE CREW** | `60+10*level` CR | Clear one crew member's `injuredUntil` (soonest-to-recover first) — first-ever early injury recovery. |
| **CLEAR YOUR HEAD** | 40 CR | `rerolls++` — banks one draft reroll (existing currency ~4064). |

**Hull scaling (E4/E11):** runabout quarters = one apartment (bunk + galley + head) → the table above. **Hauler/gunship** (bigger quarters, `crewSlots` 2/3) grant the *Rested* regen buff **in addition to** whichever boon is chosen — one `if(curFrame().crewSlots>=2)`.

**Quarters modules hook in (from §2.3):** `qbunk` — restBuff persists **two** waves instead of one · `qgalley` — after resting, +10% damage for the first 60s of the next wave (`MS.restBuffDmg`) · `qrec` — injured crew recover one wave sooner passively (`MS.crewHealAdd`).

```js
var restedThisDock=false, restBuff=false;
function applyRest(kind){
  if(restedThisDock){ sfx('deny'); return; }
  var cost = kind==='crew' ? (60+10*level) : kind==='reroll' ? 40 : 0;
  if(credits<cost){ sfx('deny'); return; }
  credits-=cost; restedThisDock=true; havenFund+=35;
  var big = curFrame().crewSlots>=2;
  if(kind==='heal'||big) restBuff=true;
  if(kind==='heal'){ player.hp=player.hpMax; showBanner('RESTED','Hull patched, head clear','#5EEAD4'); }
  else if(kind==='crew'){ for(var i=0;i<CREW.length;i++){ if((CREW[i].injuredUntil||0)>level){ CREW[i].injuredUntil=0;
      showBanner('BACK ON THEIR FEET',CREW[i].name+' returns to duty',CREW_ROLES[CREW[i].role].c); break; } } }
  else { rerolls++; showBanner('CLEAR-HEADED','+1 draft reroll banked','#C4B5FD'); }
  saveMeta(); renderDock(); sfx('shield');
}
/* startLevel(): if(restBuff){ if(!(MS.restMul>1)) restBuff=false;  // qbunk keeps it one extra wave
     player.sh=Math.min(player.shMax,player.sh+10); player.rested=true; }
   energy regen site (~8213): *(player.rested?1.15:1); clear player.rested at levelDone() unless qbunk extends. */
```

UI: a `LIVING QUARTERS` row on the **Ship** tab (it's about *your* ship, not the Haven) — three `dk-row` cards, greyed once `restedThisDock`; PATCH disabled when no crew is injured. Interior tie-in: the quarters room glows warm while `restBuff` is banked (§1.3 — one flag read, no coupling).

**Morale-lite (optional v2, behind `var MORALE_ON=false`):** run-scoped `morale=50` (0–100), small bar in the crew panel. Deltas: +8 rest with crew aboard · +4 wave clear with zero injuries · +2 per 250 CR donated · −10 per crew injury · −6 skipping rest two docks in a row. Effects touch only the crew tier multiplier (~4338): ≥70 → +0.10 tier factor; ≤30 → crew effects ×0.85, hire costs +20%. Zero cost when the flag is off.

**The full E13 loop, stated:** ATTACK (sortie waves + hunt elites) → DEFEND (core waves; Haven earns trader income all the while) → RETURN CARGO (haul waves + hulk tows + the hold, sold at the split-dock) → UPGRADE SHIP (parts→FIT, frames, ranks, modules) → UPGRADE BASE (Haven self-builds from its cut; donations accelerate it) → REST → next wave.

---

# 7) CODEX REQUIREMENTS (E7)

The menu codex (builders `buildUpgrades()` 4909, `WPX{}` 4798, `buildBestiary()` 4836, `buildWeapons()` 4851, click routing 8246–8256) must document **all** game info. Required entries — each maps to a builder change:

1. **THE ERA** — the §0 lore paragraph verbatim, as the intro card of the Weapons codex page. CE arms vs RIFTWORK definitions, the Ejecta Accords, harmonic shielding.
2. **Every room type** — all 11 `ROOMS` entries with name, color, description, and *your current hull's* slot count. Paste-ready extension to `buildUpgrades()` (~4930, after the Weapon Lab section; reuses existing `.upg-sec/.upg-h/.upg-mods/.upg-mod` CSS — zero new CSS):

```js
html+='<div class="upg-sec"><div class="upg-h" style="--c:#E0529E">Ship Rooms &amp; Modules \u00B7 every system is a place</div>'
  +'<p class="upg-p">Every ship \u2014 yours and theirs \u2014 is built from rooms. Each room carries <b>1&ndash;3 module slots</b> '
  +'(weapon bays up to 10 on capital hulls). Salvaged or bought modules socket into a matching room at the Dock. '
  +'Bay fittings (Weapon Lab marks) are welded on permanently.</p>';
var rid,ri2; for(ri2=0;ri2<ROOM_ORDER.length;ri2++){ rid=ROOM_ORDER[ri2]; var R=ROOMS[rid], F2=curFrame(), ns=(F2.rooms&&F2.rooms[rid])|0;
  html+='<div class="upg-h" style="--c:'+R.c+';margin-top:.7rem">'+R.n+' \u00B7 '+ns+' slot'+(ns===1?'':'s')+' on your '+F2.name+'</div>'
    +'<p class="upg-p">'+R.d+'</p><div class="upg-mods">';
  for(var mid2 in MODULES){ var md2=MODULES[mid2]; if(!roomAccepts(rid,md2)) continue; if(md2.room==='wep'&&rid==='wepB') continue; /* list wep mods once, under the Lance Bay */
    var src=(md2.drop>0?'drops '+(md2.drop*100).toFixed(1)+'%':'')+(md2.drop>0&&md2.cost>0?' \u00B7 ':'')+(md2.cost>0?'shop '+md2.cost+' cr':'');
    html+='<div class="upg-mod" style="--c:'+md2.c+'"><b>'+md2.n+'</b><span>'+md2.d+' \u00B7 <i>'+src+'</i></span></div>'; }
  html+='</div>'; }
html+='</div>';
```
   (`buildUpgrades()` is cache-guarded by `host.children.length` — add `host.innerHTML=''` to the frame-purchase path ~6260 for live refresh.)
3. **Every module** — covered by the loop above (all 33, with drop rates and shop prices).
4. **Every weapon** — `buildWeapons()` gains a second group: **CE ARMS** (the 8 re-flavored entries, existing stats) and **RIFTWORK** (the 8 rift arms: energy cost, cooldown, behavior line, "clan sources & boarding loot only"). WLAB section renamed **BAY FITTINGS**.
5. **Factions** — imperial/civilian/clan pages: rep bands, outlaw path, and the riftwork note ("the clan path is the riftwork path"); contraband rep effects (§4.6 `lux`).
6. **Enemies** — `buildBestiary()` gains per-big-ship salvage lines: hulk-eligible? (hpMax≥20), cr value, the three-bay fiction, and the coil-pressure tells table (§5.6).
7. **Mechanics pages** — new codex cards: **Salvage Doctrine** (vaporize/clean/hulk table + tow controls G/dash-sever + 2-per-wave cap), **Tractor Bay** (range 90/126, penalties, modules), **The Hold** (cargo vs parts, capacity math, death stake), **Rest & Quarters** (three boons + big-hull bonus), **The Haven Fund** (income table, auto-buy order, donations), **Rooms & Damage** (hard hits disable rooms; R-weld/engineer/dock repairs).
8. Codex must render from the live data objects (`ROOMS`, `MODULES`, `RIFT`, `CARGO_DEFS`, `MSHIP_DEFS`) — never hand-copied strings — so it can't drift from the game.

---

# 8) BUILD PHASES — I1..I5 (each = one session, each ends playable)

Every phase ends with the game fully playable from the menu, saves loading clean, and a verify block using the existing dev hooks (`__dbg`, `__shot`, `__give`, `__forceSkill`) plus the new ones added along the way (`__forceHulk`, `__rift`). Run via the PowerShell `static-server.ps1` local server (no Node/Python on this machine).

### I1 — FOUNDATIONS & THE INTERIOR (save v3, rooms, catalog, TAB overlay)
**Build:** `SAVE_VERSION='3'` + `migrateSave()` EQUIP re-key (§2.4) · `ROOMS`/`ROOM_ORDER`/`ROOM_ICON` · `FRAMES.rooms` + `cargoCap` · `equipInit()` · MODULES 2.0 catalog (§2.3, all 33; new fx keys inert until consumers land) · data-driven `recomputeStats()` block · `roomAccepts()` + generalized `renderSockets()` (delete `sockGroups()`) · `INTERIORS` + `drawShipInterior()` + `ROOMHP` scaffolding (§1.2–1.3) · Tab/Esc keydown patches, `sho('gInv',…)`, `setView` patch, `openInv/closeInv`, `repStripHTML()` refactor, `renderInv()` (hold section renders "empty" — CARGO stub `{}` defined), `invRoomClick` popover.
**Ends playable:** full campaign unchanged; Tab opens a live inventory with bars/rep/gear/skills + clickable FTL interior showing real socketed modules as boxes; dock sockets panel lists all rooms.
**Verify:**
1. Seed a v2 save (`localStorage` fixture with `bdg_equip={"w1":["scharge",null],"w2":[null,null],"re":["capbank",null]}`), reload → `__dbg()` shows `EQUIP.wepA[0]==='scharge'`, `EQUIP.energy[0]==='capbank'`, `bdg_v==='3'`.
2. Start a run, press Tab → overlay opens, sim frozen (`__dbg()` frame counter static); `__shot('i1-inventory')` — interior shows 9 rooms, scharge box glows orange in the Lance Bay, WLAB pips if any.
3. Click Energy Core room → popover lists Capacitor Bank; Esc closes; Tab during a story card does nothing.
4. `__give('module','mcharge')` then dock → Charge Coupler cyclable into a Lance Bay socket; `recomputeStats` runs without error (`MS.chargeMod===1`).

### I2 — THE HOLD & THE TWO-PANEL DOCK (cargo, parts, sell/fit/scrap)
**Build:** `CARGO_DEFS/CARGO/MOD_VAL/cargoCap/cargoCount/addCargo/sellCargo/scrapModule/dropCargoKey` (§4.6) · replace instant-sell pickup branch · civilian/hostile cargo drops (20% clean-kill roll — interim gate until I4 tiers) · `bdg_cargo` save/load · death stake · PARTS list in `renderInv` · `dock-split` CSS + `toggleDockSplit` + `openDock` auto-split patch + `#gDockHold` button + SELL/FIT/SCRAP click wiring.
**Ends playable:** cargo accumulates in a real hold, hold-full skims at 50%, docking auto-opens the 40/60 split, one-click stack selling, FIT deep-links to sockets with a flash, SCRAP converts spares.
**Verify:**
1. `__give('cargo','core',3)` (extend `__give`) → Tab shows Data Cores ×3, `3/10` capacity on runabout; `__shot('i2-hold')`.
2. Fill the hold to 10, pick up an 11th → "HOLD FULL — SKIMMED" floater, credits +7.
3. Dock with cargo → split auto-opens; `__shot('i2-split')` shows 40/60 layout; SELL Data Cores → +120 CR ×cargo-rank multiplier exactly once (check `__dbg` credits delta vs `addCredits` math).
4. Die with 6 cargo → reload run → hold halved to 3; window <900px → panels stack (resize + `__shot('i2-narrow')`).

### I3 — RIFTWORK (era renames, rift engine, RMB, module consumers)
**Build:** `WEAPONS{}` re-flavor strings + tooltip text (§3.1) · `rbul/updateRift/riftForce` · `RIFT{}` table with **sling, shear, arc, sing** fully implemented (phase, lag, smine, tether if session allows — else early I4) · `ENERGY_COST` extension · `hasW2()`/`fireWeapon2()`/`w2cd()` rewrite (C4) · rift sourcing (clan story card grants `sling`; clan/boarding drop hooks; `WPN_UNLOCKED` for rift keys; w2-chip CE·RIFT groups; calibration banner) · `RIFT_MODOK` socket gate · weapon-module consumers in the fire path: `mcharge` (hold-to-charge any weapon via `isChargeWeapon()||MS.chargeMod`), `mhoming/homingAdd`, `mnova/shotSpdMul`, `mspread`, `mleech`, `rover` overcharge · shield consumers `sregen/sbubble/smirror/ssurge`.
**Ends playable:** the era reads energy-only; RMB fires rift arms on the runabout; the Singularity Caster visibly bends enemy bullets, your bolts, and enemy hulls; old CE-in-slot-2 saves still fire.
**Verify:**
1. `window.__rift=function(k){ player.weapon2=k; WPN_UNLOCKED[k]=1; }`; `__rift('sing')`, RMB → well spawns; spawn a swarm (`__give` or wave 7) → enemy bolts curve into the hole; `__shot('i3-singularity')`.
2. `__dbg()` energy: full bank 60 → exactly 3 sing casts; 4th shows deny flash.
3. Legacy check: set `bdg_w2='railgun'`, reload → RMB still fires the Coherence Rail via swap trick.
4. Socket `mcharge` on the Pulse Blaster → hold LMB charges to +150%; socket `split2` attempt on `sing` → socket UI rejects; on `phase` → accepts.

### I4 — SALVAGE & TRACTOR (tiers, hulks, tow, tells)
**Build:** `lastHitIon` + overkill tiers in `killEnemy` (§5.1; the I2 cargo roll moves inside the clean-kill branch) · `hulks[]/spawnHulk/updateHulks/salvagePayout/salvCap/towSpeedMul/towedCount/towCapacity` · G-key latch, dash-sever, boost ×2 energy, integrity damage from `updateEBul` · tractor module consumers (`trange/tgrip/tdual` via MS keys) · enemy tells `sysW/sysE` + `eShoot` gate + engine-flame skip · board-vs-tractor on disabled elites (`towLock` freezing `discT`, elite payout `220+level*10` + rare) · dock-ring tow glow condition · inventory tow slot reads `hulks` (already written that way in §4.4) · `__forceHulk` hook · Scrapyard `MSHIP_DEFS` entry (consumer only; auto-buy comes in I5).
**Ends playable:** dogfights are consequential — vaporize for score, feather for hulks, tow for treasure; visible system-loss tells on big ships.
**Verify:**
1. `__forceHulk()` → drifting grey wreck + "HOLD G TO TRACTOR" floater; hold G within range → LATCHED; `__dbg()` shows `hulks[0].st==='tow'`; fly to Haven ring → "SALVAGE DOCKED +N CR · 1 module · 2 cargo" and the module lands in `INV`, cargo in `CARGO`.
2. Overkill a `broodDrone` with the Coherence Rail → "VAPORIZED" floater, credits only (`cr*1.5`), no module/cargo drop; clean-kill the same type → salvage roll drawn from the broodDrone's **own declared system loadout** (§5 loadout table — its named room modules, not a generic table); land the killing blow on a specific section → that section's module survives the roll (precision preserves systems, overkill deletes specific entries).
3. While towing: `__dbg()` speed ≤ expected `towSpeedMul()` value computed over **all `TOWED[]` entries**; dash (Space, **off cooldown**) → cable severs (sever executes inside `tryDash`'s success branch only, at the line `dashCd` is set), hulk reverts to `drift`. Attempt a dash **on cooldown / out of energy** while towing → deny sfx + "CABLE HOLDS" floater, cable intact — the input is never silent.
4. Damage a `warlordElite` to <30% → it stops firing (watch `eShoot` gate); <20% → limps at half speed, no engine glow; `__shot('i4-tells')`.
5. Socket `tdual` → tow capacity = `1 + (tdual?1:0)` = 2; tow two hulks at once — penalties multiply inside the single `towSpeedMul()` pass, and the rescue trader (registered as a `TOWED[]` entry) **counts against capacity**; deliver a 3rd hulk in a wave without Scrapyard → "SALVAGE DOCK FULL". Reload → Scrapyard rank persists (its key is added to the `bdg_mship` whitelist rebuild at 4258 in this phase).
6. Tow a hulk, Esc → quit to menu, start a new run → `__dbg().hulks` empty, `TOWED.length===0`, no cable drawn (I4 adds `hulks.length=0; TOWED.length=0` to `resetGameState` 5046 **and** the `startLevel` reset line 5924).
7. On mobile (`MOB`): near a hulk the context-action button (new div beside `chargeBtn`) reads TRACTOR; inside breach range it reads BOARD (board outranks tractor); out of range it hides. Tap executes the verb.
8. Load a save produced by the I3 build → zero console errors, no lost state (cross-phase save rule, §8A.5).

### I5a — LOOP & HAVEN ECONOMY (wave rotation, Haven fund)
**Current-state audit:** mission types massacre/cargo/beacons/hunt SHIPPED @7912 (objective tracker), 8493 (base draw gates on `mission.t==='cargo'`), 6873 (crate scatter + `player.carry` slow), 5924 (startLevel resets); Haven dock tab SHIPPED @3790/3822. Everything below is DELTA on that machinery — do not build parallel mission code.
**Build:** sortie + haul wave types per the §6.1 mapping table, implemented as **re-skins of shipped mission types**: haul → `t:'cargo'` unmodified except one hook — `havenFund += got*6` at the **existing** delivery site; sortie → `t:'hunt'` with a stationary depot entity spawned 700–900u out, reusing the hunt win-check (the only genuinely new code is the depot's draw + hp) · `defendNode` on all non-boss waves · LEVELS `t:` edits per the mapping table · story verb tweaks · `havenFund/havenNextBuy/havenAutoBuy/donateHaven`: `buyMship` is factored into a shared `applyMshipRank(id)` (rank++, `def.m` cap check, banner, `saveMeta`) used by **both** player purchase and auto-buy; `havenAutoBuy` pays **RAW `mshipCost` — never `barterPrice`** (the player's Entrepreneur/card discounts must not discount the Haven's own fund), max 2 ranks per dock visit, executed **inside `openDock`** so the rank banner provably fires at dock; a player purchase during the same visit simply advances the rank the auto-buy prices next · income hooks (trader cut, stipend, rescue, haul tax, rest fee) · Haven tab fund UI rendered into the existing `.dk-panel[data-panel="haven"]` (3822) with ids `#gHavenFund`/`#gHavenNext`; donate buttons carry `data-donate="100|500|all"` and are wired by adding one `t.closest('[data-donate]')` line to the delegated stage click handler at 8565 (never per-render `.onclick` — `renderDock` rebuilds innerHTML) · `bdg_haven` save/load via the try/default `loadMeta` pattern, never version-gated.
**Ends playable:** the attack/defend/haul rotation is live and the Haven visibly builds itself from its own docking income.
**Verify:**
1. Set wave 3 (`__forceSkill` or level select) → sortie spawns a depot 700–900u out on the minimap (hunt machinery: objective tracker 7912 and minimap arrows unmodified); kill it → wave ends; `__shot('i5a-sortie')`.
2. Wave 6 haul: crates scatter, carry-slow felt at 3 crates, delivery inside the Haven ring ticks `mission.prog` AND `havenFund += got*6` (check `__dbg().havenFund` delta) — both fire from the one existing delivery site.
3. Play waves 1–4 without donating → `__dbg().havenFund` ≈ 350–500; dock after it crosses 300 → "MARKETPLACE RANK 1 — THE HAVEN built it from its own docking income" banner fires **at dock via the shared `applyMshipRank`**, never mid-wave; buy the same facility yourself in the same visit → no race, no double-rank, auto-buy simply targets the next-cheapest.
4. Donate 500 → fund +500, civilian rep +2, banner; ALL IN with 0 credits → deny sfx, no state change.
5. Load a save produced by the I4 build → zero errors, no lost state.

### I5b — REST & ROOM DAMAGE (quarters, welding, module consumers)
**Build:** `applyRest()` three boons + **rest fee: 50 cr, paid into `havenFund`** (this is the "rest" entry in the income-hook table), once per dock, pick **one of three** — the decision is fee + exclusivity: skipping rest saves 50 cr and keeps the choice open for a later dock · LIVING QUARTERS dock row: rest options carry `data-rest="sleep|clear|drill"` inside `#gRestRow` in the ship panel, wired by the second new `t.closest('[data-rest]')` line in the 8565 delegated handler · `restBuff` consumption in `startLevel` + energy-regen multiplier + quarters module consumers (`qbunk/qgalley/qrec`) · room damage live: `roomDamage()` call after the player-hit line, `applyRoomPenalties()` in `recomputeStats`, **R-weld routed at the single `engHeld` consumption site** (see §8A.10): while R is held, if any `ROOMHP` entry is below max → weld the most-damaged room first at +0.5 hp/s (works with or without engineer crew; engineer crew multiplies weld rate ×2), else fall through to the existing hull repair — one consumer, one code site · life-support bleed · `resetRooms()` on dock · run-state resets: `resetRooms()` + `restBuff=null` added to `resetGameState` 5046 (rule: **rooms persist across waves but never across runs**) · life/helm module consumers (`lo2/lgrav/lmed/haim/hsensor/hlock`) · mobile context-action button gains the WELD verb (hold behavior covers the R-weld hold; priority board → tractor → weld → hidden).
**Ends playable:** rest is a real priced decision and rooms break, penalize, and get welded.
**Verify:**
1. Take 20+ damage in one hit → a room disables ("X DISABLED" banner), Tab shows red hazard stripes on it; hold R with a room down → **room** welds (+0.5 hp/s, most-damaged first), not hull; hold R with all rooms full → existing hull repair runs; dock → `ROOMHP` clears.
2. Rest SLEEP IT OFF → 50 cr deducted, `__dbg().havenFund` +50, hull full, next wave +10 shield and regen ×1.15 (`__dbg().player.rested===true`); try resting twice in one dock → deny. On a hauler, pick CLEAR YOUR HEAD → reroll banked AND restBuff granted (big-quarters bonus). Rest with <50 cr → deny sfx, no boon.
3. Die with a room disabled, start a new run → `__dbg().ROOMHP` full, `recomputeStats` shows no phantom `applyRoomPenalties` effect.
4. Load a save produced by the I5a build → zero errors, no lost state.

### I5c — CODEX & REGRESSION (docs from live data, final pass)
**Current-state audit:** the game already ships documentation views — `gEnemies`, `gWeapons`, `gUpgrades`, `gHow`, `gArmory` (view names at 7930, `sho()`/`setView` pattern). The codex is built **into** this infrastructure, not beside it.
**Build:** all §7 codex pages folded into the existing view system: extend `gWeapons` to render CE ARMS + RIFTWORK groups directly from `WEAPONS`/`FLUX_WEAPONS`; add Rooms / Modules / Factions panels using the same `sho()`/`setView` pattern and the existing `.dk-tab` CSS; `gUpgrades` and `gArmory` content they supersede is redirected into the new panels (no orphaned duplicate pages — one documentation system, zero drift by construction, all pages rendered from live data objects) · final `__dbg` exposure of `hulks/TOWED/rbul/CARGO/havenFund/ROOMHP` · full regression.
**Ends playable:** the complete loop with a codex that documents everything from live data.
**Verify:**
1. Open codex → Rooms page lists all **11 room TYPES** with your hull's mounted instances and slot counts (9/11/13 instances per §8A.1); Weapons page shows CE ARMS and RIFTWORK groups; `__shot('i5c-codex')`.
2. Menu → the old gWeapons/gUpgrades routes land on the new panels; no stale page reachable.
3. Full regression: seed a **real v2 save**, play menu → wave 1 → dock → wave 2 with zero console errors; every module socketed in the v2 save is present in the new EQUIP; `localStorage` contains `bdg_v='3', bdg_cargo, bdg_haven`.
4. Load a save produced by the I5b build → zero errors, no lost state.

**Phase discipline:** if any phase runs long, cut from the tail of its build list (I3: later rift arms; morale is already flagged v2) — the codex can no longer be cut as a tail because it **owns** phase I5c and is acceptance item E7. Never ship a phase with a half-wired save migration or a broken keybinding. Every phase build list is **delta-only** against the SHIPPED rows in §8A.13 — never re-implement, fork, or regress a shipped system.

---

# 8A) FINAL-REVISION ADDENDA — binding deltas to earlier sections

These addenda are normative and override the earlier text where they differ.

**8A.1 — Room types vs instances (§1.2, §7, checklist).** There are **11 room TYPES** — this is the master count and what the codex lists. Hulls mount **9/11/13 room INSTANCES**: the runabout mounts 8 types (2× weapon bay → 9 instances); the hauler mounts 10 types (2× weapon bay → 11 instances); the gunship mounts 11 types (3× weapon bay → 13 instances). Use "types" and "instances" with exactly these meanings everywhere. The 33-module catalog spans 9 of the 11 types (the remaining 2 types carry no module sockets).

**8A.2 — Weapon-bay slot rule (§2.2, FRAMES).** One rule, everywhere: **bay slots = `2 + sizeTier`, hard cap 10.** SizeTiers 0/1/2 (runabout/hauler/gunship) → bay slots **2/3/4**, matching `FRAMES.rooms`. The §2.2 formula, the E6 row, the E11 row, and the FRAMES table all state this same rule. The 10-slot cap is reachable **only** on the proposed capital frame (8A.3) — no shipped hull reaches it.

**8A.3 — Capital frame (owner's "up to 10 slots").** The 3-hull plan never reaches 10 bay slots. Proposed: a 4th, post-campaign-unlock capital frame — `FRAMES.dreadnought` (sizeTier 3, 17 room instances, bay slots **hard-set to 10** overriding the formula, cargoCap 30, crewSlots 6) — unlocked by beating the final boss. This frame is **open item (4)** and requires owner sign-off before I1 locks the FRAMES table; until signed, the honest ceiling is the gunship's 4 and the checklist says so.

**8A.4 — Module implementation & stacking (§2.3).** The file already has three projectile/damage module systems (MODULES.split2/split3, WLAB.split, MOD_DEFS.splitFire, plus scharge/coil/cycler). Rules: (a) the owner's four ride **existing S-flags** — `mspread` sets `S.projAdd` (aliasing split2 where identical), `mcharge` reuses the existing charge pipeline (`isChargeWeapon` 5476), `mhoming` reuses `rocketHome` steering (7357) with a **cached target reacquired no more often than every 0.15s** — never a per-frame nearest-enemy search per bullet (protects the O(P×E) `updatePBul` hot loop 7355–7379); (b) §2.3 carries an explicit **stacking table** (WLAB × MODULES × MOD_DEFS × new catalog) and `recomputeStats` enforces a hard total cap **`S.projAdd ≤ 6`**; (c) each of the 33 modules names the existing S-flag it drives, or is marked NEW with its single consumer site. **The crisp mechanical line:** WLAB = passive numeric stat **ranks** (the gold pips — split/coil/cycler stay as flat rank bonuses); bay modules = **firing-behavior changers**. `mspread` and `mnova` are re-statted to honor that line: `mspread` converts the shot pattern to a 3-round fan at −20% per-projectile damage (a behavior swap, not WLAB.split's flat +1 proj/rank); `mnova` converts the shot to a slower, larger projectile with +80% range and an on-expiry detonation radius (a behavior swap, not coil's range rank or cycler's fire-rate rank). Same reasoning for MOD_DEFS: run-scoped card stacks (different lifetime, reset every run) — kept separate deliberately, but bounded by the same stacking table and the `S.projAdd` cap.

**8A.5 — Save migration owns the loader (§2.4) — BLOCKER FIX.** `loadMeta` reconstructs saved objects through shape whitelists: EQUIP loads only if `eq.w1&&eq.w2&&eq.re` (4261), and SHIP/WLAB/MSHIP are rebuilt key-by-key from fixed lists (4256–4258). Therefore the migration works **both sides**: (1) in `migrateSave`, read `bdg_equip`, translate `{w1,w2,re}` → the new room keys per the §2.4 map, write back, **and only then set `bdg_v='3'`** — and make it idempotent: any object still shaped `{w1,...}` re-migrates regardless of version; (2) update the 4261 guard to validate the NEW shape; (3) every phase that introduces a new SHIP/WLAB/MSHIP key (I4's `scrapyard` into `bdg_mship`, etc.) appends that key to the whitelist rebuilds at 4256–4258 **in the same phase**. I1's verify gains: "load a real v2 save → every previously socketed module present in the new EQUIP" — not just "no console errors". **Version policy:** `bdg_v='3'` is bumped **once, at I1** (the EQUIP re-key is the only destructive change); every key added in I2–I5 (`bdg_cargo`, `bdg_haven`, …) is read via the existing `try{...||default}catch` pattern of `loadMeta` (4252–4269) and **never gates on version** — `migrateSave`'s early return at 4245 makes version-gated reads unsafe across phases. Every phase's verify list ends with: "load a save produced by the previous phase's build — zero errors, no lost state."

**8A.6 — Rift-arm field engineering (§3.3) — mandatory.** (a) All eight rift arms share **one `FIELDS[]` array** `{x,y,r,r2,type,k,t}` with a **single `applyFields(dt)` pass** over enemies/pbul/ebul — squared-distance early-out (`dx*dx+dy*dy > r2` → skip) **before any sqrt** (today `bendBul` 5409–5410 hypots every bullet before its radius gate; the new pass must not repeat that). (b) Hard cap **`MAX_FIELDS = 4`**, oldest evicted. (c) Time dilation = a per-entity **velocity multiplier applied inside that same pass** — never a per-entity dt fork (every update function takes dt directly; forking it is a rewrite). (d) Chain arcs reuse `bounceBullet`'s retarget (7373) — no new nearest-neighbor search. (e) Render budget: all fields share **one glow layer**, ≤2 concurrent `shadowBlur` (the file already has 126 shadowBlur sites; drawFlux's blur 12/18 is the ceiling, not the floor), all field FX behind the existing `reduceMo` flag. (f) Force curve `f = k*(1−d/r)` with k capped so projectiles **cannot orbit-capture** (ebul lives 5–6s; a captured bullet cloud near the player never hits the screen-distance cull at 7393). **Naming:** the code's existing weapon (4642, 5388–5472, 8452) is the **Singularity Driver** — that name wins; every bible occurrence of "Singularity Caster" is renamed. I3 **extends** `FLUX_WEAPONS`/wells at 5388; it does not create a parallel RIFT system.

**8A.7 — Starter bay 2 ships loaded (§3.3/C4).** The runabout ships with the **Singularity Driver equipped in bay 2 by default** (it already exists in code as the RMB weapon) — the owner's "one energy + one exotic from the start" is met at wave 1, not after a shop unlock. I3 verify addition: "fresh save → bay 2 shows SINGULARITY DRIVER equipped before the first shot is fired."

**8A.8 — Towing is generalized, not cloned (§5).** `rescueShip` (7005/7030) stays a single-object state machine but **registers as an entry** in one new **`TOWED[]` array** of `{ent, radius, integrity}`. One `towSpeedMul()` computes over all entries; one cable-draw, one dash-sever, one delivery check iterate `TOWED`. Capacity = `1 + (tdual?1:0)`; **the rescue trader counts against capacity** (rule stated, not implied). `gInvTow` (6767) is updated to list all `TOWED` entries — it must never read only `rescueShip`. `tdual` and the tow-while-rescuing interaction fall out for free. **Sever:** executes inside `tryDash`'s success branch only (one line at the point `dashCd` is set); a failed dash while towing plays deny sfx + "CABLE HOLDS" floater.

**8A.9 — Enemy loadouts drive salvage (§5, owner E9).** "Enemy ships run the same systems" is implemented literally at data level: **each enemy/faction declares a system loadout** (named room modules from the same catalog — the drop table is skinned per enemy as those named entries), and the salvage roll **draws from surviving systems**: overkill tiers destroy specific loadout entries (vaporize = all, clean = roll intact, hulk-tow = full loadout), and precision damage to a section preserves that section's module. You salvage what the ship actually ran.

**8A.10 — R-weld routing (I5b).** KeyR already sets `player.engHeld` for the engineer hull-repair hold (4652–4656). There is exactly **one consumer**, at the existing `engHeld` consumption site: while R is held, if any `ROOMHP` entry is below max → weld the **most-damaged room first** (+0.5 hp/s; works with or without engineer crew; engineer crew multiplies weld rate ×2), else fall through to the existing hull repair. One paragraph, one code site, zero key conflicts.

**8A.11 — Dock-split host (§4.5).** The overlay is **`#gDock`**, not `gInv` — `toggleInventory` hard-blocks outside `view==='play'` (6674) and stays untouched. The HOLD column is a new element **`#gHold`** inside `#gDock`, placed before the `.dk-tabs` panel column; a **`.dock-split`** class is toggled on `#gDock` whenever `CARGO` is non-empty — that class IS the "auto-open". dk-tabs live in the 60% column. FIT deep-links call `setDockTab('weapons')` then flash `#gSockets` (3817). The <900px fallback is a concrete media query: `@media (max-width:900px){ #gDock.dock-split { flex-direction:column } }` (HOLD stacks above the shop). **Click over drag, deliberately:** the owner said "drag-simple"; one-click stack SELL + FIT deep-link was chosen because the codebase has no drag infrastructure and clicks give mobile parity — this reinterpretation is stated here for sign-off, and drag-item-onto-panel is reserved as a supported future gesture on the same two drop targets.

**8A.12 — UI wiring & content ownership.** Fund UI renders into `.dk-panel[data-panel="haven"]` (3822) with ids `#gHavenFund`/`#gHavenNext`; donate buttons carry `data-donate="100|500|all"`; rest options carry `data-rest="sleep|clear|drill"` inside `#gRestRow` in the ship panel; both are wired as **two new `t.closest` lines in the delegated stage click handler at 8565–8572** (the established `[data-hire]/[data-gear]/[data-livery]` pattern) — never per-render `.onclick`, which `renderDock`'s innerHTML rebuild destroys. **Content ownership note:** `gInvCargoCap` currently shows "CR banked" (6750); E2's `n / cargoCap()` **REPLACES** that content — stated here so two writers don't fight over one span.

**8A.13 — Current-state audit (all phases are delta-only).** 

| Item | Status | Where |
|---|---|---|
| Tab inventory + free pause | **SHIPPED** (tagged 'E1' in code) | 8503, 6672–6675 |
| `gInvBars`/`gInvTow`/`gInvCargoCap` | **SHIPPED** | 3894–3899, 6750–6758 |
| Interior renderer + room layouts | **SHIPPED** | 6468–6505 |
| Haven dock tab | **SHIPPED** | 3790, 3822 |
| Singularity Driver gravity-well weapon on RMB | **SHIPPED** | 4642, 5388–5472, 8452 |
| Mission types cargo/hunt/massacre/beacons | **SHIPPED** | 7912, 8493, 6873, 5924 |
| EQUIP re-key + 33-module catalog + module boxes | **DELTA** (I1) | boxes added to the existing renderer |
| Combat-sprite sheet-D silhouette pass | **NEW** (I1) | see 8A.14 |
| Rift arms 2–8 | **NEW** (I3) | extend FLUX_WEAPONS/wells @5388 — no parallel system |
| Hulks/`TOWED[]`/tractor | **NEW** (I4) | generalizes rescueShip 7005/7030 per 8A.8 |
| haul/sortie waves, havenFund, rest, room damage, codex | **DELTA+NEW** (I5a–c) | per I5a–c audits |

**8A.14 — Combat sprite joins sheet-D (owner E10).** The in-game top-down combat sprite is **no longer left in the old art**: I1 includes a simplified sheet-D silhouette pass on the flown sprite — charcoal body + one livery accent + white neon seams + ring thrusters, reduced to sprite scale (no interior detail) — so the ship you fly matches the interior you inspect. This closes the scoping gap instead of hiding it.

**8A.15 — Mobile context-action button (I4 + I5b).** The MOB layer (4800–4809) has only joystick/fire/charge/pause; G-tractor, hold-R weld, and E-board would otherwise be silently desktop-only. One context-action button (one div beside `chargeBtn`, ~10 lines of routing) whose verb resolves by priority: **board** (in breach range) → **tractor** (hulk in range) → **weld** (room disabled; hold behavior covers the R-weld hold) → hidden. Specced in I4 (button + first two verbs); I5b adds the weld verb.

---

# 9) ACCEPTANCE CHECKLIST — E1–E14

| Req | Requirement (owner's words, condensed) | Satisfied where |
|---|---|---|
| **E1** | TAB opens an inventory overlay in-run | **SHIPPED** @8503, 6672–6675 (tagged 'E1' in code) — §4.3 keydown patch + §4.4 `openInv`. Pauses free of `MAX_PAUSES`; blocked during BOARD/cards/dialogue/menus; Esc also closes; 250ms anti-spam. I1 touches this only as delta. |
| **E2** | Inventory shows health, relationships, FTL top-down interior, cargo + capacity, tractor beam + payload | §4.4 `renderInv`: `gInvBars` (hull/shield/energy — SHIPPED 3894–3899), `repStripHTML()`, `drawShipInterior` canvas, `gInvCargoCap` showing `n / cargoCap()` (**replaces** the current "CR banked" content at 6750 — 8A.12), `gInvTow` listing **all `TOWED[]` entries** per 8A.8 (I1–I2, tow live in I4). |
| **E3** | Room-based FTL interior on the ship silhouette, modules visible as small boxes | §1.3 renderer (**SHIPPED** 6468–6505): per-frame deck-plan silhouette, deck-plate rooms; I1 delta adds module boxes on each room's bottom edge from `EQUIP`, WLAB gold pips, crew dots, hazard stripes. |
| **E4** | Required rooms scaling with hull; two weapon bays on the starter (energy + exotic, non-magic name — 3 options, pick 1); shield/engine/energy-core/life-support/tractor/quarters; rest mechanic designed | §1.2 layouts under the 8A.1 rule: **11 room types; 9/11/13 instances** (runabout = 8 types, 2× weapon bay). Names proposed (RIFTWORK / X-PHYS / METRIC ARMS), **RIFTWORK picked** and used everywhere. Both starter bays live at wave 1: bay 1 energy arm + bay 2 ships with the **Singularity Driver pre-equipped** (8A.7, I3 verify: fresh save → bay 2 loaded before the first shot). Rest = §6.3 three-boon dock rest, **priced**: 50 cr fee → havenFund, once per dock, pick one of three (8A per I5b) (I5b). |
| **E5** | No bullets/rockets — energy + exotic-physics era; mini-black-hole example; 6–10 exotic weapons with 2D-canvas physics; 8 existing weapons re-flavored | §0 era lore; §3.1 all 8 CE re-flavors (paste-ready, zero mechanics change); §3.3 **8 rift arms** led by the **Singularity Driver** (code name wins — 8A.6; SHIPPED core at 5388–5472, arms 2–8 extend it): gravity wells, repulsor, time dilation, chain arcs, phase, projectile-bending sling, mines, tether, with exact forces/costs/cooldowns — all under the 8A.6 engineering mandates (shared FIELDS pass, MAX_FIELDS=4, no dt fork, glow budget, anti-orbit k cap) (I3). |
| **E6** | 1–3 module slots per room (weapon bays to 10); CHARGE/HOMING/FAST+LONG/SPREAD modules; full per-room catalog; modules visible in interior; reconcile with MODULES/EQUIP/WLAB — migrate, don't duplicate | §2.2 slot table + bay formula **`2 + sizeTier` (cap 10)** → bay slots **2/3/4** on runabout/hauler/gunship, agreeing with `FRAMES.rooms`; 10 reachable only via the proposed capital frame (8A.3, open item 4). Owner's four = `mcharge/mhoming/mnova/mspread`, implemented on **existing S-flags** with the stacking table + `S.projAdd≤6` cap (8A.4); §2.3 33-module catalog across 9 of the 11 room types, each module naming its S-flag or single new consumer; boxes rendered in §1.3. Reconciliation: EQUIP **migrated** (re-keyed, translated in `migrateSave` **before** `bdg_v='3'`, 4261 guard updated to the new shape, whitelists 4256–4258 extended — 8A.5, old saves keep everything **verifiably**: I1 verify loads a real v2 save and checks every socketed module); WLAB kept under the stated line — **WLAB = passive stat ranks (gold pips), bay modules = firing-behavior changers** — with `mspread`/`mnova` re-statted so they demonstrably do not duplicate split/coil/cycler (8A.4); `MOD_DEFS` kept separate for its run-scoped lifetime, bounded by the same stacking table (I1). |
| **E7** | Codex documents ALL game info | §7 folded into the **existing doc views at 7930** (`gWeapons` extended for CE ARMS + RIFTWORK from `WEAPONS`/`FLUX_WEAPONS`; new Rooms/Modules/Factions panels via `sho()`/`setView` + `.dk-tab` CSS; superseded gUpgrades/gArmory content redirected) — one documentation system, rendered from live data objects so it can't drift (I5c). |
| **E8** | Cargo (sellables) separate from ship parts (modules/weapons) | §4.6 `CARGO/CARGO_DEFS` hold vs §4.4 PARTS view (`INV − equippedCount` spares + unequipped `WPN_UNLOCKED`); different affordances (SELL vs FIT/SCRAP) (I2). |
| **E9** | Salvage depends on HOW you destroyed them; tractor a hulk home for full salvage; consequential dogfights; tow penalties/capacity | §5 per 8A.8/8A.9: **each enemy/faction declares a system loadout and the salvage roll draws from surviving systems** — overkill destroys specific loadout entries (vaporize `cr*1.5` no materials / clean roll / hulk = full loadout), precision damage preserves the targeted section's module; G-key tractor via the **generalized `TOWED[]`** (rescueShip becomes its first entry — not a clone), radius-scaled speed penalty + grip/range/winch modules, capacity `1+(tdual?1:0)` with the rescue trader counting against it, dash-success-only sever, integrity, 2-per-wave cap (+Scrapyard), enemy coil-pressure tells, board-vs-tractor decision (I4). |
| **E10** | Sheet-D art language; ships sized to contain their rooms (Milano scale) | §1.2 grid cell 1.5m — runabout 21m/9 compartments, hauler 27m, gunship 30m; §1.3 renderer uses charcoal + one livery accent + white neon seams + ring thrusters; **combat sprite included** via the 8A.14 simplified silhouette pass — the flown ship matches its interior view (I1). |
| **E11** | Hull types matter — room counts per hull | `FRAMES.rooms` (§2.2 under 8A.1/8A.2): **9/11/13 room instances of 11 types**, bay slots **2/3/4** from `2+sizeTier` (10 only on the proposed capital frame — open item 4), `cargoCap` 10/24/14, quarters bunks = crewSlots, hauler's oversized 2-slot tractor bay (I1–I2). |
| **E12** | "15 levels" vs the built 20 waves | **FLAGGED, not changed** — C12 in the conflicts table: recommendation keep 20; corrected 15-wave recipe: drop original waves **2/4/11/17/19** → the surviving 15 renumber so the **four** bosses (orig 5/10/15/20 — LEVELS 4135/4140/4145/4150) land at **3/8/12/15**; rewards ×1.33; awaiting owner decision. Every system in this bible is per-wave and works for either. |
| **E13** | Core loop attack/defend/return-cargo/upgrade-ship/upgrade-base; Haven self-upgrades from docking income, faster via donations | §6.1 sortie/haul rotation (9 defend · 4 sortie · 3 haul · 4 boss) mapped onto **shipped mission machinery** (haul→`t:'cargo'` + one havenFund hook; sortie→`t:'hunt'` + static depot — I5a audit); §6.2 `havenFund` income table (incl. the 50 cr rest fee), auto-buy via the shared **`applyMshipRank`** at RAW `mshipCost` — no barterPrice, no player-discount leakage, max 2/visit, banner fires inside `openDock` (8A per I5a); donation buttons with civilian rep, pacing ≈120→300 fund/wave, 5–6 self-built ranks per campaign (I5a). |
| **E14** | Beautiful hangar/shop beside the inventory when docked; drag-simple selling/refitting | §4.5 40/60 `dock-split` hosted **in `#gDock`** (new `#gHold` column + `.dock-split` class per 8A.11; `toggleInventory` untouched), auto-opens when the hold has cargo (the class toggle), HOLD-first column order, one-click stack SELL, FIT deep-link (`setDockTab('weapons')` + `#gSockets` flash), SCRAP, existing dock tabs untouched, concrete <900px stacked media query. **Click chosen over drag deliberately** (no drag infra, mobile parity — 8A.11), with drag-onto-panel reserved as a future alternate gesture; flagged for owner sign-off (I2). |

**Open items requiring an owner decision before or during the build:** (1) E12 wave count — keep 20 or cut to 15 per the **corrected** C12 recipe (drop 2/4/11/17/19; bosses renumber to 3/8/12/15); (2) whether the Singularity Driver's optional 30%-strength pull on the *player* ships on (the "realistic" toggle, §3.3.1); (3) whether the Haven's trader cut stays a shadow 1.5× or becomes a literal 60/40 split (§6.2 flag); (4) the **capital frame** (8A.3) — the owner's "weapon rooms up to 10 slots" is unreachable on the 3-hull plan (gunship ceiling = 4); sign off the proposed post-campaign `FRAMES.dreadnought` (sizeTier 3, 17 rooms, 10-slot bay, cargoCap 30) or accept the 4-slot ceiling. Everything else in this document — including the combat-sprite sheet-D pass (8A.14) and the click-over-drag dock (8A.11), both now stated rather than silent — is decided and buildable as written.