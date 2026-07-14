# Swing-feel spec (from deep research, 2026-06-21)

Reference for tuning the melee swing. Timings at 60fps; ms in parentheses.

## Timing + arm keyframes
LIGHT swing ~300ms total:
- Wind-up 0-117ms (7f): shoulder yaw 0 -> -55deg, ease-OUT (coil), hold last 1-2f.
- Active 117-167ms (3f): yaw -55 -> +85deg, LINEAR (constant arc speed). Hitbox live ONLY here.
- Follow-through 167-250ms: yaw +85 -> +100deg overshoot, ease-OUT (this is where weight reads).
- Recovery 250-400ms: settle back, +2deg overshoot. Cancel opens ~f20.

HEAVY swing ~850ms total: wind-up 0-300ms (big telegraph), active 300-417ms (6f linear), follow-through to 650ms (+25deg overshoot), recovery to 850ms, cancel ~f48. Movement locked through follow-through.

Slime "wind cutter": no arm rig. Drive swingT 0->1 over the same windows: squash body ~12% on wind-up, STRETCH ~10% along the cut on active, spawn crescent+trail at active apex.

## Juice (light / heavy)
- Hit-stop (freeze both): 50ms / 130ms. Formula frames = min(20, floor(dmg*0.65+5)), x1.5 crit.
- Screen-shake trauma added: +0.30 / +0.85. offset = maxOffset * trauma^2 (3px / 16px), noise not pure random, ADD don't overwrite.
- Knockback: 6 / 20 px-equiv, decays 4-6f. Self-recoil 2 / 4px.
- Hit-flash white on target 100ms, fired on the FIRST contact frame so the frozen pose is the flashed one.
- Impact particles 4-6 / 8-15, biased backward along hit dir. Camera kick 3 / 10px.

## The 4 highest-impact weight changes
1. Hit-stop scaled by hit type (biggest "it connected" lever). Hold contact pose during freeze.
2. Snap the active arc fast+LINEAR, pay for it in a long decelerating follow-through with 10-20deg overshoot. Slow swings read as WEAK.
3. Commit: lock movement/turn during wind-up+active; gate cancels to late recovery. Heavy commits harder.
4. Stack everything on the contact frame + exaggerate the VICTIM's knockback/over-extended pose.

## Blade/wind TRAIL (plain three.js, the "ultimate" upgrade — NOT yet shipped)
Ring buffer of recent {hilt,tip} world positions stitched into a fading triangle strip. One pre-allocated BufferGeometry, attribute updates only, AdditiveBlending + depthWrite:false + DoubleSide, per-vertex alpha = (maxID-nodeID)/(maxID-minID). Sample blade-tip bone getWorldPosition() each frame while swinging; lerp head toward live tip if undersampled. For the slime, tip/hilt = the two ends of the wind-cut arc. Put behind UnrealBloomPass to glow.

## SHIPPED so far (Essence3D index.html)
Sweeping double-crescent (bright leading arc + faint wind body that rotates across the arc over 0.22s) + wind-streak sparks; slime coil->stretch phases; contact-frame white impact burst; hit-stop light 0.05 / heavy 0.13; shake heavy 7. NOT yet: the ribbon trail class, the full overshoot follow-through curve on the human arm rig.
