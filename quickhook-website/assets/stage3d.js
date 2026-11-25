/* Brand Method, Sales page 1: the "Need more? Go Premium." band, as a real 3D stage. NEXT: version 2, refined.
   This file is the candidate that replaces stage3d.js once the owner has seen it (same mount() and options). It is
   generated from version 2 by the script build_next.py kept with the test captures, and it differs from the text below in
   these ways. Owner, 15 Nov, on a version with signs hanging in the room: "last one looks better", "why this looks bad and
   not refined", "maybe you could just increase the layout size instead", "i wish the 3d look a lot better". So: version 2's
   arrangement is kept; nothing hangs in front of the back wall any more (the pay button is a small orange button on a stem
   on the counter); the address bar reads www.yourwebsite.com with a slim "Open 24/7" pill beside it; the room is 8.6 m
   wide because the box on the page is now about 1.6 times as wide as it is tall; the tubs are three quarters of the size,
   straight, in blocks of 1 product, on a 2 step stand in place of the table; a soft key and a low fill light; a light
   ceiling with 3 slim light strips; a touch of shade drawn into the corners; contact shadows with a darker core (round
   under people, square under furniture); orange and gold kept to the buttons, the bags, the price tags and 1 counter line.

   15 Nov 2026, the owner: "i like the people walking, i wish they would be in and out of them. Maybe for this it is like a
   website shop where everybody is trying to buy and see in the shop, with a lounge, so as if the website is an amazing shop",
   then "no need to look isometric", "but it is 3D". Later that day, on version 1: "looking good, if you can do it better go
   ahead and grand", "take a bit more space", "why is it moving slowly though".

   Later still, on version 2 in progress: "check eskayvie and sell their product at this store, and orange and gold theme".

   What it is: the website is a shop, and the shop is an Eskayvie store. The shop front is a giant browser window (3 dots, an
   address bar) and you look through it into a tall room: the Eskayvie page fills the back wall, Eskayvie's own products
   stand on plinths under their own pictures, on a table in the middle, on a shelf and at the counter (the Mindtropic and
   Mindtropic Junior tubs are real 3D, wrapped in their own labels), there is a lounge with a sofa and an armchair, and a
   counter with a cashier under an orange button. 4 real, rigged people (6 until 18 Nov): 1 sits in the lounge, 1 stands at the till, and 2
   walk in through the door, stop at the products, pick one up, pay and leave with a bag, sit down in the lounge,
   and then walk back past the shop on the street, so each is on stage for nearly the whole loop and nobody is there twice.
   Version 2 fills its frame (the shop front spans about 9 tenths of the width), people walk about a sixth faster than real
   pace with their feet still planted, something moves in every second (a pointer clicks the cards and their pictures change,
   the pay button gives). The camera drifted in versions 2 to 4; since 17 Nov it is still (see the camera section).
   White and light grey objects with a fine dark edge, Eskayvie's violet and gold as the accents (see PURPLE and GOLDEN
   below for where each was read), nothing behind it. The loop is 36 s. Everybody's route starts and ends off stage and
   every motion is a whole number of cycles a loop, so nothing visibly resets.

   Nothing is generated and nothing comes from another server. Everything loads from ./stage3d/ beside this file, and only
   when mount() is called: three.js (MIT, vendored) and 4 Microsoft Rocketbox people (MIT, licence beside them), packed with meshopt.

   Use:
     import { mount } from './assets/stage3d.js';
     mount(element, { onFail() { ...show the drawing instead... } });
   The element needs a size (width and height, or an aspect ratio; it is composed for 1.6, and holds from 1.2). mount() resolves to
   { dispose() } or to null on failure.
   Options: base (folder of the assets), builds (folder of the build pictures), shots (file names: the first fills the back
   wall, the next 2 hang at the far end of the side walls), products (folder of the Eskayvie pictures), accent and gold (the
   2 accent colours, as 0xRRGGBB or '#rrggbb'; default Eskayvie's orange and gold), colour (default: the people keep their
   own colours; false draws them in 3 flat tones with an ink outline), woman, man (file names of the 2 lead shoppers), still
   (true draws 1 frame and stops; default follows prefers-reduced-motion), start (seconds into the loop to open at), loop
   (seconds, at least 36), site (the tall picture of the page for the back wall), video (the film of the page's top that plays on the
   back wall; false keeps the still), scroll (page pixels the wall scrolls down and back each loop; default 0, the wall
   stays on the top of the page; with a scroll there is no film), dress (false leaves the people's cloth as it comes), reflect (false: a matt floor with no
   reflection), props (false: only the built
   props; or the names of those to replace by their model: 'plant', 'sofa', 'armchair', 'table'), offsets (when each of the 4 visits starts, for tests), onReady, onFail. */

const HERE = new URL('./stage3d/', import.meta.url).href;
const EDGE = 0x1E2433, WHITE = 0xffffff, GREY = 0xdfe3ec, SOFT = 0xe9edf8;
// The shop is an Eskayvie store (owner, 15 Nov: "sell their product at this store, and orange and gold theme"; 16 Nov, on
// the refined shop: "maybe not orange but purple for this"). Both accents are read from the Eskayvie page that fills the
// back wall, not chosen: the violet is --violet in its stylesheet, the colour of its "Shop Mindtropic" button (#5B3FA0; the
// most common pixel of that button in the page picture is #5A3FA0), the gold is --gold-2 in the same stylesheet (#F6C544).
// The orange it replaced (#EF6D3B, their Diffenz banner) still works as accent: '#EF6D3B'.
const PURPLE = 0x5B3FA0, GOLDEN = 0xF6C544;
// The props that are replaced by a model when it has loaded (see FIT). The sofa and the armchair also have a model (a black
// tufted leather sofa, a carved Victorian armchair), but those fight the clean, light shop, so the built ones stay unless
// they are asked for by name: props: ['plant', 'sofa', 'armchair', 'table'].
const PROPS = ['plant', 'table'];

export async function mount(el, opts = {}) {
  const base = opts.base || HERE;
  const builds = opts.builds || new URL('../builds/', base).href;
  // the Eskayvie page fills the back wall; 2 more of our builds hang at the far end of each side wall
  const shots = opts.shots || ['eskayvie.jpg', 'iaq-group.jpg', 'tenthpin-mc.jpg'];
  const goods = opts.products || new URL('products/', base).href;        // Eskayvie's own product pictures and tub labels
  const num = (v, d) => (v == null ? d : typeof v === 'string' ? parseInt(v.replace('#', ''), 16) : +v);
  const ACC = num(opts.accent, PURPLE), GOLD = num(opts.gold, GOLDEN);
  let R = null, cv = null, io = null, ro = null, dead = false, film = null;
  const cleanUp = () => {
    dead = true;
    try { if (film) { film.v.pause(); film.v.removeAttribute('src'); film.v.load(); if (film.url) URL.revokeObjectURL(film.url); film.vt.dispose(); } } catch (e) { /* already gone */ }
    try { if (R) { R.setAnimationLoop(null); R.dispose(); } } catch (e) { /* already gone */ }
    try { if (io) io.disconnect(); if (ro) ro.disconnect(); } catch (e) { /* already gone */ }
    try { if (cv && cv.parentNode) cv.parentNode.removeChild(cv); el.classList.remove('is-3d'); } catch (e) { /* already gone */ }
  };
  const fail = (e) => { cleanUp(); try { if (opts.onFail) opts.onFail(e); } catch (x) { /* the host's handler is its own business */ } return null; };

  try {
    const still = opts.still !== undefined ? !!opts.still : !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const [THREE, { GLTFLoader }, BGU, { MeshoptDecoder }] = await Promise.all([import(base + 'three/three.module.min.js'), import(base + 'three/addons/loaders/GLTFLoader.js'), import(base + 'three/addons/utils/BufferGeometryUtils.js'), import(base + 'three/addons/libs/meshopt_decoder.module.js')]);
    // the people and the furniture are packed with meshopt (18 Nov: 6.8 MB of people became about 1.1 MB), so every loader needs the decoder
    const gltfLoader = () => new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);

    cv = document.createElement('canvas');
    cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'display:block;width:100%;height:100%';
    // people come and go through the sides: the picture fades out there and at the foot, so no one is cut by an edge
    const fade = 'linear-gradient(90deg,transparent 0,#000 3%,#000 97%,transparent 100%),linear-gradient(180deg,#000 0,#000 88%,transparent 100%)';
    cv.style.webkitMaskImage = fade; cv.style.maskImage = fade; cv.style.webkitMaskComposite = 'source-in'; cv.style.maskComposite = 'intersect';
    R = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: 'low-power' });
    R.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    R.outputColorSpace = THREE.SRGBColorSpace;
    R.toneMapping = THREE.NoToneMapping;
    R.setClearColor(0x000000, 0);

    const S = new THREE.Scene();
    // soft and flat: light from the sky, 1 gentle key so a box shows 3 values (top lightest, the face to us in the middle, the side darkest)
    S.add(new THREE.HemisphereLight(0xffffff, 0xdde3f0, 2.0));
    const key = new THREE.DirectionalLight(0xffffff, 1.25); key.position.set(-3.2, 7, 6); S.add(key);
    const fill = new THREE.DirectionalLight(0xeef2ff, .38); fill.position.set(4.5, 2.5, 5); S.add(fill);
    // 2 soft lamps just under the ceiling: the walls, the floor and the fixtures fall off gently away from them
    [-2.2, 2.2].forEach((x) => { const l = new THREE.PointLight(0xfff8ef, 2.6, 0, 2); l.position.set(x, 3.95, -2.3); S.add(l); });

    /* ---- what the props are made of (owner, 16 Nov: "cleaner and smoother", "not less detail but more realistic, like plants,
       chairs"). The shop's shell keeps its white and its fine ink edge, so the browser window still reads. The furniture has no
       ink edge any more: it is rounded or bevelled and made of painted wood, oak, fabric, light metal and ceramic, and it reads
       by light and shade. For the soft sheen the props reflect a small bright room, drawn once into a blurred map. ---- */
    const envTex = (() => {
      try {
        const es = new THREE.Scene(), bm = (c, k) => { const m = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }); m.color.set(c).multiplyScalar(k); return m; };
        es.add(new THREE.Mesh(new THREE.BoxGeometry(12, 6, 12), bm(0xE4E8F0, .32)));
        [[0, 2.95, 0, 6, 3, Math.PI / 2, 0, 2.4], [-5.9, 1, 1, 4, 3, 0, Math.PI / 2, 1.1], [0, .5, 5.9, 8, 4, 0, Math.PI, .8]].forEach(([x, y, z, w, h, rx, ry2, k]) => {
          const l = new THREE.Mesh(new THREE.PlaneGeometry(w, h), bm(0xffffff, k)); l.rotation.set(rx, ry2, 0); l.position.set(x, y, z); es.add(l);
        });
        const pm = new THREE.PMREMGenerator(R), t = pm.fromScene(es, .03).texture; pm.dispose(); return t;
      } catch (e) { return null; }
    })();
    // colour, roughness, metalness, how much of the room shows in it
    const MATS = { wall: [0xF3F4F8, .92, 0, .2], trim: [0xC3C9D6, .5, 0, .35], field: [0xDDE3F1, .6, 0, .3], gloss: [0xFBFCFE, .12, 0, 1.1], kick: [0x9AA1B2, .7, 0, .15], paint: [0xE6E8EE, .4, 0, .45], oak: [0xC9A77E, .55, 0, .4], metal: [0xC6CBD5, .3, .6, 1.4], fabric: [0x9AA2BA, .95, 0, .3], cushion: [0xC3C9DA, .95, 0, .3], ceramic: [0xB9A892, .26, 0, .7], soil: [0x3E322A, 1, 0, .1] };
    const mat = (key) => { const [color, roughness, metalness, env] = MATS[key]; return new THREE.MeshStandardMaterial({ color, roughness, metalness, envMap: envTex, envMapIntensity: env }); };

    /* ---- the things. Every solid is baked into 1 mesh per colour and every edge into 1 set of lines: a handful of draw calls. ---- */
    const solid = {}, sets = { '': solid }, lines = [], shades = [];
    function put(g, m, c, thr, bin) {
      if (thr) { const e = new THREE.EdgesGeometry(g, thr); e.applyMatrix4(m); lines.push(e); }
      const n = g.index ? g.toNonIndexed() : g;
      n.deleteAttribute('uv'); n.applyMatrix4(m);
      const to = bin ? (sets[bin] = sets[bin] || {}) : solid;
      (to[c] = to[c] || []).push(n);
    }
    // a box with its edges taken off: a fine bevel on hard things, a full soft round on cloth (its normals are smoothed as well)
    function rbox(w, h, d, key) {
      const soft = key === 'fabric' || key === 'cushion', m = Math.min(w, h, d), b = soft ? Math.min(.05, m * .3) : Math.min(.012, m * .3), r = soft ? Math.min(.09, m * .45) : b;
      let g = new THREE.ExtrudeGeometry(rrect(w - 2 * b, h - 2 * b, Math.max(r - b, .002)), { depth: d - 2 * b, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: soft ? 4 : 2, curveSegments: soft ? 5 : 3 });
      g.translate(0, 0, -(d - 2 * b) / 2);
      if (soft) { g.deleteAttribute('uv'); g = BGU.mergeVertices(g, .0005); g.computeVertexNormals(); }
      return g;
    }
    function rrect(w, h, r) {
      const s = new THREE.Shape(), x = -w / 2, y = -h / 2; r = Math.min(r, w / 2, h / 2);
      s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0);
      s.lineTo(x + w, y + h - r); s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2);
      s.lineTo(x + r, y + h); s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
      s.lineTo(x, y + r); s.absarc(x + r, y + r, r, Math.PI, 1.5 * Math.PI);
      return s;
    }
    const slab = (shape, d) => { const g = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false, curveSegments: 8 }); g.translate(0, 0, -d / 2); return g; };
    // a local frame on the floor: x, z and a turn about the upright axis. Local +z is the thing's front.
    // With a skin (which colour is which material) the frame builds a prop: bevelled, in its materials, with no ink edge.
    function kit(x, z, ry = 0, skin = null, bin = '') {
      const B = new THREE.Matrix4().makeRotationY(ry).setPosition(x, 0, z), E = new THREE.Euler();
      const at = (lx, ly, lz, rx = 0, rz = 0, ry2 = 0) => new THREE.Matrix4().makeRotationFromEuler(E.set(rx, ry2, rz, 'YXZ')).setPosition(lx, ly, lz).premultiply(B);
      const sk = (c) => (skin && skin[c]) || c, th = (t) => (skin ? 0 : t);
      return {
        m: B, at, ry,
        box(w, h, d, lx, ly, lz, c = WHITE, thr = 1, rx = 0, rz = 0, ry2 = 0) { c = sk(c); put(skin && MATS[c] ? rbox(w, h, d, c) : new THREE.BoxGeometry(w, h, d), at(lx, ly, lz, rx, rz, ry2), c, th(thr), bin); },
        pill(w, h, d, lx, ly, lz, c = WHITE, r = 9, thr = 40) { put(slab(rrect(w, h, r), d), at(lx, ly, lz), sk(c), th(thr), bin); },
        disc(r, d, lx, ly, lz, c = WHITE, thr = 40) { const g = new THREE.CylinderGeometry(r, r, d, 28); g.rotateX(Math.PI / 2); put(g, at(lx, ly, lz), sk(c), th(thr), bin); },
        shape(sh, d, lx, ly, lz, c = WHITE, thr = 40, rx = 0, rz = 0, ry2 = 0) { put(slab(sh, d), at(lx, ly, lz, rx, rz, ry2), sk(c), th(thr), bin); },
        tube(r0, r1, h, lx, ly, lz, c = WHITE) { put(new THREE.CylinderGeometry(r1, r0, h, 32), at(lx, ly, lz), sk(c), th(40), bin); },
        // a turned shape: its outline as [radius, height] pairs, spun about the upright axis
        lathe(pts, lx, ly, lz, c = WHITE) { put(new THREE.LatheGeometry(pts.map((p) => new THREE.Vector2(p[0], p[1])), 40), at(lx, ly, lz), sk(c), 0, bin); },
        shade(w, d, lx = 0, lz = 0, round = 0) { const g = new THREE.PlaneGeometry(w, d), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, (round ? 0 : .5) + uv.getX(i) * .5); g.rotateX(-Math.PI / 2); g.applyMatrix4(at(lx, .006, lz)); const n = g.toNonIndexed(); n.deleteAttribute('normal'); shades.push(n); },
        pt(lx, ly, lz) { return new THREE.Vector3(lx, ly, lz).applyMatrix4(B); },
      };
    }
    const SKIN = { shell: { [WHITE]: 'wall', [GREY]: 'trim', [SOFT]: 'field' }, card: { [WHITE]: 'paint' }, stand: { [SOFT]: 'oak', [WHITE]: 'paint' }, seat: { [SOFT]: 'fabric', [WHITE]: 'cushion', [GREY]: 'oak' }, table: { [GREY]: 'metal' }, pay: { [WHITE]: 'paint', [SOFT]: 'oak', [GREY]: 'metal' } };
    const W0 = kit(0, 0, 0, SKIN.shell);
    // a tall room: 8.6 m wide, 4.3 m to the ceiling, 4.8 m deep (composed for a box about 1.6 times as wide as it is tall)
    const HW = 4.3, OPEN = 4.3, BAR = .56, DEPTH = 4.8, DOOR = 1.05, BACK = -DEPTH - .12, XI = HW - .05;
    // things people must walk round, for the checks: name, centre, turn, half width, half depth
    const blocks = [], block = (n, k, hw, hd, lx = 0, lz = 0) => { const c = k.pt(lx, 0, lz); blocks.push({ n, x: c.x, z: c.z, ry: k.ry, hw, hd }); };

    // the ground: 1 long pavement, the shop stands on it
    // the shop front is a browser window: 2 posts and the bar with its 3 dots, its address field (the address is written on
    // it further down), a slim "Open 24/7" pill beside the address, and its menu
    W0.box(.16, OPEN, .26, -HW, OPEN / 2, 0); W0.box(.16, OPEN, .26, HW, OPEN / 2, 0);
    W0.box(HW * 2 + .4, BAR, .4, 0, OPEN + BAR / 2, .04);
    const BZ = .04 + .2, BY = OPEN + BAR / 2;
    for (let k = 0; k < 3; k++) W0.disc(.075, .03, -HW + .36 + k * .27, BY, BZ + .012, GREY);
    const AX = -.7, AW = 4.4, AH = .34, OX = 2.5, OW = 1.46;
    W0.pill(AW, AH, .03, AX, BY, BZ + .012, SOFT);
    W0.disc(.06, .02, AX - AW / 2 + .27, BY, BZ + .034, ACC, 0);
    W0.pill(OW, AH, .03, OX, BY, BZ + .012, ACC);
    [.11, 0, -.11].forEach((dy) => W0.pill(.36, .065, .02, HW - .42, BY + dy, BZ + .012, GREY, 9, 0));
    // the window is open: you look and walk straight in. A fine threshold runs across it; the doorway is the blue in the middle.
    W0.box(HW * 2 - .16, .006, .12, 0, .003, 0, GREY, 0);                       // a flush metal threshold
    // the room: 2 side walls, the back wall, the ceiling
    W0.box(.1, OPEN, DEPTH, -HW, OPEN / 2, -DEPTH / 2 - .12); W0.box(.1, OPEN, DEPTH, HW, OPEN / 2, -DEPTH / 2 - .12);
    W0.box(HW * 2 + .1, OPEN, .1, 0, OPEN / 2, BACK - .05);
    W0.box(HW * 2 + .1, .1, DEPTH + .1, 0, OPEN + .05, -DEPTH / 2 - .12);
    // the welcome mat and the threshold: the door is where the blue is
    W0.box(DOOR * 2 - .34, .005, .8, 0, .0025, .66, ACC);                           // the mat, lying flat

    // the products: Eskayvie's Mindtropic and Mindtropic Junior tubs, real 3D, each wrapped in its own label.
    // A tub is listed here and drawn after the pictures have loaded: [x, y, z, the way its front faces, size].
    const TUB = { r: .06, hb: .14, hl: .056, turn: Math.PI };           // the logo sits half way round the label: this turn brings it to the front
    const tubs = { mt: [], jr: [] };
    const tub = (type, v, face = 0, size = 1) => tubs[type].push([v.x, v.y, v.z, face, size]);
    // a product card on a plinth: the product's own picture, 2 lines, a button the pointer can press, and 3 tubs to pick up
    const cards = [];
    function card(x, z, ry, kinds) {
      const k = kit(x, z, ry, SKIN.card);
      k.box(1.0, .46, .44, 0, .27, 0); k.box(.94, .04, .38, 0, .02, 0, 'kick'); k.box(1.006, .012, .446, 0, .47, 0, ACC);
      k.box(.92, .028, .3, 0, .514, .06, 'gloss'); k.box(1.3, 1.62, .06, 0, 1.345, 0); k.box(.085, .026, .006, .36, .4, .223, GOLD);
      k.pill(.6, .065, .014, -.25, .99, .036, GREY, 9, 0); k.pill(.4, .065, .014, -.35, .88, .036, GREY, 9, 0);
      k.shade(1.9, 1.15); block('card', k, .65, .23);
      [-.33, -.11, .11, .33].forEach((lx, i) => tub(kinds[i], k.pt(lx, .528, .12), ry));
      cards.push({ k, pic: k.at(0, 1.6, .0315), btn: k.at(.3, .93, .044), tip: k.pt(.4, .84, .2), look: k.pt(0, 1.5, .05), stand: (dist, side) => { const p = k.pt(side, 0, dist); return [p.x, p.z]; } });
      return cards[cards.length - 1];
    }
    const cardA = card(-3.5, -1.25, 1.0, ['mt', 'mt', 'mt', 'mt']), cardB = card(-3.55, -2.85, 1.3, ['jr', 'jr', 'jr', 'jr']), cardC = card(3.4, BACK + .8, -.8, ['mt', 'mt', 'jr', 'jr']);

    // 4 screens hang high on the side walls: Eskayvie's own banners nearest us, 2 of our other builds at the far end
    const wallPics = [];
    [[-1, -1.45], [-1, -3.45], [1, -1.45], [1, -3.45]].forEach(([s, z]) => {
      const k = kit(s * (HW - .05), z, -s * Math.PI / 2, SKIN.card);
      k.box(1.82, 1.14, .05, 0, 3.0, .025);
      wallPics.push(k.at(0, 3.0, .053));
    });

    // the stand in the middle, used from both sides: 2 steps, each row 1 block of Mindtropic and 1 of Junior, all facing out
    const ISL = kit(1.0, -2.45, 0, SKIN.stand);
    ISL.box(1.9, .46, .78, 0, .27, 0, SOFT); ISL.box(1.84, .04, .72, 0, .02, 0, 'kick'); ISL.box(1.964, .012, .844, 0, .494, 0, ACC);
    ISL.box(1.96, .04, .84, 0, .52, 0); ISL.box(1.9, .3, .26, 0, .69, 0, 'gloss'); ISL.box(1.96, .03, .3, 0, .855, 0, 'gloss');
    [-.8, -.61, -.42, -.23, .23, .42, .61, .8].forEach((lx) => {
      const a = lx < 0 ? 'mt' : 'jr', b = lx < 0 ? 'jr' : 'mt';
      tub(a, ISL.pt(lx, .54, .28), 0); tub(a, ISL.pt(lx, .87, 0), 0); tub(b, ISL.pt(lx, .54, -.28), Math.PI);
    });
    [-.515, .515].forEach((lx) => { ISL.box(.085, .026, .006, lx, .52, .423, GOLD); ISL.box(.085, .022, .006, lx, .855, .153, GOLD); });
    ISL.shade(2.7, 1.6); block('stand', ISL, .98, .42);
    const ISL_B1 = ISL.pt(-.55, 0, -.95), ISL_LOOK = ISL.pt(-.6, .75, -.28), ISL_B2 = ISL.pt(.55, 0, -.95), ISL_LOOK2 = ISL.pt(.6, .75, -.28), ISL_F = ISL.pt(-.55, 0, .95), ISL_LOOKF = ISL.pt(-.6, .75, .28);

    // a shelf unit on the right wall, between the counter and the far corner: 3 shelves of tubs
    const SHELF = kit(HW - .27, -2.8, -Math.PI / 2, SKIN.card);
    SHELF.box(1.3, 1.9, .04, 0, .97, -.17); SHELF.box(.04, 1.9, .36, -.65, .97, 0); SHELF.box(.04, 1.9, .36, .65, .97, 0);
    [.5, 1.02, 1.54].forEach((y, row) => {
      SHELF.box(1.26, .03, .34, 0, y, 0); SHELF.box(.085, .024, .006, 0, y - .004, .174, GOLD);
      [-.5, -.3, -.1, .1, .3, .5].forEach((lx) => tub(row === 1 ? 'jr' : 'mt', SHELF.pt(lx, y + .015, .04), -Math.PI / 2));
    });
    SHELF.shade(1.8, 1.0); block('wall shelf', SHELF, .65, .18);

    // the lounge: a sofa against the back wall under the headline, an armchair at an angle to it, a round low table, a rug
    const SOFA = kit(-2.15, BACK + .46, 0, SKIN.seat, 'sofa');
    // The seat is built to the body: its top 85 mm under the hip joint (0.47), its front edge behind the knee.
    SOFA.box(.94, .31, .64, -.47, .315, -.08, SOFT); SOFA.box(.94, .31, .64, .47, .315, -.08, SOFT);
    SOFA.box(1.88, .52, .2, 0, .73, -.3, SOFT); SOFA.box(.17, .3, .54, -1.025, .61, -.03, SOFT); SOFA.box(.17, .3, .54, 1.025, .61, -.03, SOFT);
    SOFA.box(2.18, .05, .64, 0, .135, -.08, GREY); [[-1, -.34], [1, -.34], [-1, .18], [1, .18]].forEach(([sx, lz]) => SOFA.tube(.018, .027, .11, sx, .055, lz, 'metal'));   // an oak frame on 4 short legs
    SOFA.box(.84, .34, .1, -.47, .66, -.17, WHITE, 1, -.2); SOFA.box(.84, .34, .1, .47, .66, -.17, WHITE, 1, -.2);   // 2 back cushions
    SOFA.shade(3.2, 1.5, 0, -.05); block('sofa', SOFA, 1.11, .34, 0, -.08);
    const SEAT = SOFA.pt(.44, 0, -.03);
    const CHAIR = kit(-.2, -4.2, -.95, SKIN.seat, 'armchair');
    CHAIR.box(.78, .31, .64, 0, .315, -.08, SOFT); CHAIR.box(.78, .52, .2, 0, .73, -.3, SOFT);
    CHAIR.box(.15, .3, .54, -.465, .61, -.03, SOFT); CHAIR.box(.15, .3, .54, .465, .61, -.03, SOFT);
    CHAIR.box(1.04, .05, .64, 0, .135, -.08, GREY); CHAIR.box(.7, .34, .1, 0, .66, -.17, WHITE, 1, -.2);
    [[-.45, -.34], [.45, -.34], [-.45, .18], [.45, .18]].forEach(([lx, lz]) => CHAIR.tube(.018, .027, .11, lx, .055, lz, 'metal'));
    CHAIR.shade(1.8, 1.5, 0, -.05); block('armchair', CHAIR, .54, .34, 0, -.08);
    const SEAT2 = CHAIR.pt(0, 0, -.03), STAND2 = CHAIR.pt(0, 0, .5), FACE2 = CHAIR.pt(0, 0, 3);
    const TABLE = kit(-1.7, -3.4, 0, SKIN.table, 'table'), TOP = kit(-1.7, -3.4);   // TOP: what lies on the table, whichever table it is
    TABLE.lathe([[0, .38], [.425, .38], [.44, .39], [.44, .41], [.425, .42], [0, .42]], 0, 0, 0, 'oak'); TABLE.tube(.032, .032, .36, 0, .2, 0, GREY); TABLE.lathe([[0, 0], [.25, 0], [.26, .008], [.24, .022], [.05, .034], [0, .034]], 0, 0, 0, 'metal');
    TOP.box(.3, .016, .22, -.1, .428, .04, SOFT, 0); tub('mt', TABLE.pt(-.16, .436, .04), .3); tub('jr', TABLE.pt(.0, .436, .03), -.2); TOP.box(.28, .018, .19, .2, .43, -.14, WHITE, 0, 0, 0, .4);
    TABLE.shade(1.3, 1.3, 0, 0, 1); block('low table', TABLE, .44, .44);
    W0.box(4.0, .01, 2.2, -1.45, .005, BACK + 1.15, SOFT, 0);                              // the rug
    // The plant: a turned ceramic pot with a rim, soil, and 26 leaves. Each leaf is a blade on a stalk that arches out and
    // down from the middle, folded a little along its rib, in its own green (darker at the foot, lighter along the rib).
    const leaves = [];
    function plant(x, z) {
      const k = kit(x, z, 0, {}, 'plant'), rnd = (i, s) => { const v = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453; return v - Math.floor(v); };
      k.lathe([[0, 0], [.165, 0], [.185, .012], [.225, .4], [.245, .43], [.25, .46], [.238, .475], [.222, .47], [.212, .44], [0, .44]], 0, 0, 0, 'ceramic');
      k.lathe([[0, .425], [.212, .425], [.212, .44], [0, .44]], 0, 0, 0, 'soil');
      k.shade(1.25, 1.25, 0, 0, 1);
      const N = 26, NS = 9, col = new THREE.Color();
      for (let i = 0; i < N; i++) {
        const f = i / (N - 1), a = i * 2.39996 + .4, len = .62 + .5 * rnd(i, 1) * (1 - .35 * f), wide = .15 + .07 * rnd(i, 2), lean = .1 + .95 * f * (.7 + .3 * rnd(i, 3)), bend = .5 + .9 * rnd(i, 4);
        const pos = [], cols = [], idx = [], hue = .3 + .045 * rnd(i, 5), sat = .46 + .16 * rnd(i, 6), lum = .13 + .08 * rnd(i, 7);
        let px = .03 + .05 * f, py = .44, th = lean;
        for (let n = 0; n <= NS; n++) {
          const t = n / NS, u = Math.max(0, (t - .3) / .7), w = t < .3 ? .014 : .012 + wide * Math.pow(Math.sin(Math.PI * Math.pow(u, .8)), .85) * (1 - .2 * u);
          if (n) { th = lean + bend * t * t; px += Math.sin(th) * len / NS; py += Math.cos(th) * len / NS; }
          const nx = -Math.cos(th), ny = Math.sin(th), fold = .22 * w;
          pos.push(px + nx * fold, py + ny * fold, -w / 2, px, py, 0, px + nx * fold, py + ny * fold, w / 2);
          [.92, 1.22, .92].forEach((g) => { col.setHSL(hue, sat, Math.min(.42, lum * g * (.7 + .55 * t))); cols.push(col.r, col.g, col.b); });
          if (n) { const o = (n - 1) * 3; idx.push(o, o + 3, o + 1, o + 1, o + 3, o + 4, o + 1, o + 4, o + 2, o + 2, o + 4, o + 5); }
        }
        const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); g.setIndex(idx);
        g.computeVertexNormals(); g.rotateY(a); g.applyMatrix4(k.m); leaves.push(g);
      }
    }

    // the pay point: a counter with a card reader and a till, a cashier behind it, 2 marks on the floor for the queue,
    // and a small orange pay button on a stem at the near end of the counter, which the pointer presses. Local +x runs towards us.
    const PAY = kit(3.2, -1.2, -Math.PI / 2, SKIN.pay);
    PAY.box(1.7, .96, .55, 0, .52, 0); PAY.box(1.64, .04, .49, 0, .02, 0, 'kick'); PAY.box(1.706, .012, .556, 0, .975, 0, ACC); PAY.box(1.76, .04, .61, 0, 1.02, 0, SOFT);
    PAY.box(.3, .04, .24, .25, 1.07, .1, WHITE, 1, .5); PAY.box(.2, .012, .14, .25, 1.094, .112, ACC, 0, .5);
    PAY.box(.34, .25, .03, -.12, 1.2, -.1, WHITE, 1, -.25); PAY.box(.05, .12, .05, -.12, 1.08, -.08, GREY);
    [-.72, -.5].forEach((lx, i) => { PAY.box(.2, .19, .08, lx, 1.135, .02 + i * .03, WHITE); PAY.box(.204, .045, .084, lx, 1.135, .02 + i * .03, ACC, 0); });   // 2 bags ready on the counter
    tub('mt', PAY.pt(.52, 1.04, -.1), -Math.PI / 2 + .15); tub('jr', PAY.pt(.64, 1.04, 0), -Math.PI / 2 - .1); PAY.box(.022, .19, .022, .8, 1.135, -.1, GREY);
    PAY.shade(2.4, 1.35); block('counter', PAY, .85, .275);
    const READER = PAY.pt(.25, 1.1, .12), Q1 = PAY.pt(.25, 0, .7), Q2 = new THREE.Vector3(Q1.x - .92, 0, Q1.z), TILL = PAY.pt(0, 0, -.55);
    const SIGNP = PAY.pt(.8, 1.29, -.1), SIGN = { x: SIGNP.x, y: SIGNP.y, z: SIGNP.z };
    const tick = new THREE.Shape(); [[-.1, .0], [-.035, -.07], [.1, .08], [.07, .11], [-.035, -.005], [-.07, .03]].forEach((p, i) => (i ? tick.lineTo(p[0], p[1]) : tick.moveTo(p[0], p[1])));

    // on the pavement: a tall plant by the left post, tight to the front so the walking lanes stay clear
    const PLANT = kit(-3.85, .46); plant(-3.85, .46);

    // bake
    const lams = {}, lam = (c) => lams[c] || (lams[c] = new THREE.MeshLambertMaterial({ color: c }));
    /* ---- the floor: pale and polished. It shows a soft, blurred reflection of the shop (the shop drawn once more each frame from
       under the floor, small, into a picture the floor reads), strongest inside the shop and fading out over the pavement. ---- */
    const mirrorHide = [], RT = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType }), TM = new THREE.Matrix4(), RPX = new THREE.Vector2(1 / 4, 1 / 4);
    RT.texture.generateMipmaps = false;
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xF6F7FA, roughness: .45, metalness: 0, envMap: envTex, envMapIntensity: .3 });
    const MIRROR = opts.reflect !== false;
    floorMat.onBeforeCompile = (sh) => {
      floorMat.userData.sh = sh;
      sh.uniforms.bmRefl = { value: RT.texture }; sh.uniforms.bmTM = { value: TM }; sh.uniforms.bmPx = { value: RPX }; sh.uniforms.bmOn = { value: MIRROR ? (opts.reflect > 0 ? +opts.reflect : 1) : 0 };
      sh.vertexShader = 'uniform mat4 bmTM;\nvarying vec4 bmUv;\nvarying vec3 bmW;\n' + sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n{ vec4 bmP = modelMatrix * vec4(transformed, 1.); bmW = bmP.xyz; bmUv = bmTM * bmP; }');
      sh.fragmentShader = 'uniform sampler2D bmRefl;\nuniform vec2 bmPx;\nuniform float bmOn;\nvarying vec4 bmUv;\nvarying vec3 bmW;\n' + sh.fragmentShader.replace('#include <opaque_fragment>',
        '{ vec2 bmQ = bmUv.xy / bmUv.w; vec4 bmR = vec4(0.);\n'
        + '  for (int i = -2; i <= 2; i++) for (int j = -2; j <= 2; j++) bmR += texture2D(bmRefl, bmQ + vec2(float(i), float(j)) * bmPx * 1.05);\n'
        + '  bmR /= 25.; float bmK = bmOn * (.34 * (1. - smoothstep(-.3, 1.4, bmW.z)) + .06 * (1. - smoothstep(1.4, 4.5, bmW.z)));\n'
        + '  outgoingLight = mix(outgoingLight, bmR.rgb / max(bmR.a, .001), clamp(bmR.a, 0., 1.) * bmK); }\n#include <opaque_fragment>');
    };
    const floorG = new THREE.PlaneGeometry(50, 11.6); floorG.rotateX(-Math.PI / 2); floorG.translate(0, 0, .5);
    const floor = new THREE.Mesh(floorG, floorMat); floor.renderOrder = -2; S.add(floor); mirrorHide.push(floor);
    const mirrorCam = new THREE.PerspectiveCamera();

    const built = {};
    Object.keys(sets).forEach((b) => {
      const grp = b ? new THREE.Group() : S;
      Object.keys(sets[b]).forEach((c) => { const m = new THREE.Mesh(BGU.mergeGeometries(sets[b][c], false), MATS[c] ? mat(c) : lam(+c)); m.matrixAutoUpdate = false; grp.add(m); });
      if (b) { built[b] = grp; S.add(grp); }
    });
    if (leaves.length) { const m = new THREE.Mesh(BGU.mergeGeometries(leaves, false), new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: .5, envMap: envTex, envMapIntensity: .3 })); m.matrixAutoUpdate = false; (built.plant || S).add(m); }
    const inkMat = new THREE.LineBasicMaterial({ color: EDGE }), whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff }), greyMat = new THREE.MeshBasicMaterial({ color: GREY }), goldMat = new THREE.MeshBasicMaterial({ color: GOLD }), darkM = new THREE.MeshBasicMaterial({ color: EDGE });
    if (lines.length) { const ink = new THREE.LineSegments(BGU.mergeGeometries(lines, false), inkMat); ink.matrixAutoUpdate = false; S.add(ink); }
    // the blue button is its own object, so it can give a little when it is pressed
    const sign = new THREE.Group(), pillG = slab(rrect(.36, .13, 9), .03), pill = new THREE.Mesh(pillG, lam(ACC));
    const signBar = new THREE.Mesh(slab(rrect(.13, .024, 9), .008), whiteMat), signTick = new THREE.Mesh(slab(tick, .012), whiteMat);
    signTick.scale.set(.3, .3, 1); signBar.position.set(.045, 0, .02); signTick.position.set(-.095, -.003, .02);
    sign.add(pill, signBar, signTick); sign.position.set(SIGN.x, SIGN.y, SIGN.z); sign.rotation.x = -.1; S.add(sign);
    // so is the button of each card: the pointer presses it and the card turns to another page
    const btnG = slab(rrect(.48, .15, 9), .024), btnE = new THREE.EdgesGeometry(btnG, 40);
    cards.forEach((c) => { c.button = new THREE.Mesh(btnG, lam(ACC)); c.button.applyMatrix4(c.btn); S.add(c.button); });
    const hangers = [];
    
    /* ---- words. Each is written once on a canvas, large, and shown as a picture with mipmaps, so it is sharp at any size the
       stage is shown at. The page's own typeface is used when the page has it. ---- */
    try { if (document.fonts && document.fonts.load) await Promise.race([document.fonts.load('600 40px Inter'), new Promise((r) => setTimeout(r, 1200))]); } catch (e) { /* the fallback face will do */ }
    const ANISO = Math.min(16, R.capabilities.getMaxAnisotropy());
    function words(text, em, colour) {
      const px = 176, font = '600 ' + px + 'px Inter, "Helvetica Neue", Helvetica, Arial, sans-serif', c = document.createElement('canvas');
      let x = c.getContext('2d'); x.font = font;
      c.width = Math.ceil(x.measureText(text).width) + 24; c.height = Math.round(px * 1.3);
      x = c.getContext('2d'); x.font = font; x.fillStyle = colour; x.textBaseline = 'middle'; x.fillText(text, 12, c.height / 2 + px * .03);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = ANISO;
      const h = em * 1.3, w = h * c.width / c.height, o = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false }));
      o.userData.w = w; return o;
    }
    // the address in the address field (this shop is a website), and beside it what a website is: a shop that never closes
    const address = words('www.yourwebsite.com', .215, '#1E2433');
    address.position.set(AX - AW / 2 + .44 + address.userData.w / 2, BY, BZ + .031); S.add(address);
    const openWords = words('Open 24/7', .2, '#ffffff');
    openWords.position.set(OX, BY, BZ + .031); S.add(openWords);
    
    /* ---- the ceiling and the corners. The ceiling is light, with 3 slim light strips that run from the front to the back.
       Where 2 surfaces meet the corner is a touch darker (drawn, not computed): 1 soft gradient, 1 draw call. ---- */
    {
      const ceil = new THREE.Mesh(new THREE.PlaneGeometry(XI * 2, DEPTH), new THREE.MeshBasicMaterial({ color: 0xF2F4FA }));
      ceil.rotation.x = Math.PI / 2; ceil.position.set(0, OPEN - .002, -DEPTH / 2 - .12); S.add(ceil);
      ceil.material.color.set(0xE7EAF2);
      const pool = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 6, 64, 64, 63);
        g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(.45, 'rgba(255,255,255,.45)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
      const poolM = new THREE.MeshBasicMaterial({ map: pool, transparent: true, depthWrite: false }), panelG = new THREE.ShapeGeometry(rrect(1.0, .5, .06));
      [-2.75, 0, 2.75].forEach((x) => [-1.5, -3.75].forEach((z) => {
        const halo = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.5), poolM), panel = new THREE.Mesh(panelG, whiteMat);
        halo.rotation.x = panel.rotation.x = Math.PI / 2; halo.position.set(x, OPEN - .004, z); panel.position.set(x, OPEN - .006, z); S.add(halo, panel);
      }));
      const data = new Uint8Array(32 * 4);
      for (let j = 0; j < 32; j++) { const k = 1 - j / 31; data.set([20, 24, 58, Math.round(255 * k * k)], j * 4); }
      const aoTex = new THREE.DataTexture(data, 1, 32, THREE.RGBAFormat); aoTex.magFilter = aoTex.minFilter = THREE.LinearFilter; aoTex.needsUpdate = true;
      const pos = [], uvs = [];
      // a strip: it starts at o, runs along a, and fades out along b
      const ao = (o, a, b) => {
        const p = [o, [o[0] + a[0], o[1] + a[1], o[2] + a[2]], [o[0] + a[0] + b[0], o[1] + a[1] + b[1], o[2] + a[2] + b[2]], [o[0] + b[0], o[1] + b[1], o[2] + b[2]]], u = [[0, 0], [1, 0], [1, 1], [0, 1]];
        [0, 1, 2, 0, 2, 3].forEach((i) => { pos.push(p[i][0], p[i][1], p[i][2]); uvs.push(u[i][0], u[i][1]); });
      };
      const zb = BACK + .008, zf = -.12, yc = OPEN - .02;
      ao([-XI, .004, BACK], [XI * 2, 0, 0], [0, 0, .85]); ao([-XI, .004, BACK], [0, 0, DEPTH], [.75, 0, 0]); ao([XI, .004, BACK], [0, 0, DEPTH], [-.75, 0, 0]);           // the floor, along the 3 walls
      ao([-XI, 0, zb], [XI * 2, 0, 0], [0, .5, 0]); ao([-XI, OPEN, zb], [XI * 2, 0, 0], [0, -.6, 0]); ao([-XI, 0, zb], [0, OPEN, 0], [.6, 0, 0]); ao([XI, 0, zb], [0, OPEN, 0], [-.6, 0, 0]);   // the back wall
      [-1, 1].forEach((sd) => { const x = sd * (XI - .006); ao([x, 0, BACK], [0, 0, DEPTH], [0, .5, 0]); ao([x, OPEN, BACK], [0, 0, DEPTH], [0, -.6, 0]); ao([x, 0, BACK], [0, OPEN, 0], [0, 0, .6]); });   // the side walls
      ao([-XI, yc, BACK], [XI * 2, 0, 0], [0, 0, .75]); ao([-XI, yc, BACK], [0, 0, DEPTH], [.7, 0, 0]); ao([XI, yc, BACK], [0, 0, DEPTH], [-.7, 0, 0]);                 // the ceiling
      ao([-XI, yc, zf], [XI * 2, 0, 0], [0, 0, -.5]);
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      const corners = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: aoTex, transparent: true, opacity: .27, depthWrite: false, side: THREE.DoubleSide }));
      corners.frustumCulled = false; corners.matrixAutoUpdate = false; S.add(corners); mirrorHide.push(corners);
    }

    // soft contact shadows, drawn, not computed: 1 texture for the things and the people
    const shadowTex = (() => {
      const c = document.createElement('canvas'); c.width = 256; c.height = 128;
      const x = c.getContext('2d'), g2 = x.createRadialGradient(64, 64, 2, 64, 64, 62);
      g2.addColorStop(0, 'rgba(14,18,48,.52)'); g2.addColorStop(.4, 'rgba(14,18,48,.22)'); g2.addColorStop(1, 'rgba(14,18,48,0)');
      x.fillStyle = g2; x.fillRect(0, 0, 128, 128);
      x.save(); x.beginPath(); x.rect(128, 0, 128, 128); x.clip();
      x.shadowColor = 'rgba(14,18,48,.5)'; x.shadowBlur = 24; x.shadowOffsetX = 400; x.fillStyle = '#000'; x.fillRect(128 + 27 - 400, 27, 74, 74); x.restore();
      return new THREE.CanvasTexture(c);
    })();
    const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });
    const floorShade = new THREE.Mesh(BGU.mergeGeometries(shades, false), shadowMat); floorShade.renderOrder = -1; floorShade.matrixAutoUpdate = false; S.add(floorShade);

    // the pictures: the Eskayvie page on the back wall, a product on each card, 4 screens on the side walls, the 2 tub labels
    const texLoader = new THREE.TextureLoader();
    const grab = (url) => texLoader.loadAsync(url).then((t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = ANISO; return t; });
    const GOODS = ['mindtropic', 'diffenz', 'junior', 'phytax', 'redianze', 'lumiera', 'banner-diffenz', 'banner-mindtropic', 'label-mindtropic', 'label-junior'];
    // the page on the back wall is 1 tall strip of the real site (3 screens); if it cannot be had, the single screen of it is used
    const [site, gtex] = await Promise.all([grab(opts.site || base + 'eskayvie-site-strip.webp').catch(() => null), Promise.all(GOODS.map((n) => grab(goods + n + '.webp')))]);
    const texs = await Promise.all(shots.map((f, i) => (i || !site ? grab(builds + f) : null)));
    const tx = (i) => texs[i % texs.length], good = (n) => gtex[GOODS.indexOf(n)];
    // cover: the plane keeps its own shape and the picture is cropped from the foot, so the top of the page always shows
    function crop(tex, w, h) {
      const t = tex.clone(); t.needsUpdate = true;
      const ia = tex.image.width / tex.image.height, pa = w / h;
      if (pa > ia) { t.repeat.set(1, ia / pa); t.offset.set(0, 1 - ia / pa); } else { t.repeat.set(pa / ia, 1); t.offset.set((1 - pa / ia) / 2, 0); }
      return t;
    }
    function picture(map, w, h, m4, lift = 0, see = false) {
      const o = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map, transparent: see, opacity: see ? 0 : 1, depthWrite: !see }));
      o.position.z = lift; o.updateMatrix(); o.applyMatrix4(m4); S.add(o); return o;
    }
    // It scrolls by moving the picture inside the wall (the texture's offset, nothing is laid out again): it holds on the top of
    // the page, eases down, holds, and eases back, once a loop. That is asked for with opts.scroll (page pixels; 1960 reaches the
    // next clean section). By default the wall stays on the top of the page (owner, 16 Nov: "just stay here").
    const WALL = { tex: null, top: 0, max: 0 }, wallW = HW * 2 - .1;
    if (site) {
      const span = Math.min(1, (site.image.width * OPEN / wallW) / site.image.height), page = site.image.height / 3 / 900;   // strip pixels per page pixel
      site.wrapS = site.wrapT = THREE.ClampToEdgeWrapping; site.repeat.set(1, span); site.offset.set(0, 1 - span);
      WALL.tex = site; WALL.top = 1 - span; WALL.max = Math.min(1 - span, (+opts.scroll || 0) * page / site.image.height);
    }
    picture(site || crop(tx(0), wallW, OPEN), wallW, OPEN, W0.at(0, OPEN / 2, BACK + .004));
    // The top of the real page moves (its own film of the family behind the headline, the shimmer on the gold word, the glow of
    // the button), so it moves here too: that part of the page was recorded as 1 short silent loop, and it is drawn over the
    // still while the stage runs. 1 video element, never added to the page, muted and inline so every browser lets it start
    // by itself; it plays only while the stage is on screen. The whole file is fetched first and played from memory, so it
    // loops on any server. If it cannot be had or cannot play, the still stays. Its first frame is the still's own top.
    if (site && !still && opts.video !== false && !WALL.max && typeof fetch === 'function') {
      const v = document.createElement('video');
      v.muted = true; v.defaultMuted = true; v.loop = true; v.playsInline = true; v.preload = 'auto'; v.disablePictureInPicture = true;
      ['muted', 'playsinline', 'webkit-playsinline', 'loop'].forEach((a) => v.setAttribute(a, '')); v.setAttribute('aria-hidden', 'true');
      const vt = new THREE.VideoTexture(v); vt.colorSpace = THREE.SRGBColorSpace; vt.anisotropy = ANISO;
      const plane = picture(vt, wallW, OPEN, W0.at(0, OPEN / 2, BACK + .006)); plane.visible = false;
      film = { v, vt, plane, url: '', want: false, ok: false };
      v.addEventListener('playing', () => { if (film) film.ok = true; });
      v.addEventListener('error', () => { if (film) { film.ok = false; plane.visible = false; } });
      fetch(opts.video || base + 'eskayvie-hero-loop.mp4').then((r) => { if (!r.ok) throw new Error('no film'); return r.blob(); }).then((bl) => {
        if (dead || !film) return;
        film.url = URL.createObjectURL(bl); v.src = film.url;
        if (film.want) v.play().catch(() => { /* the still stays */ });
      }).catch(() => { /* the still stays */ });
    }
    // each card holds 2 products: the one it shows, and the one it turns to when its button is pressed
    const PW = 1.06, PH = 1.0;
    [[cardA, 'mindtropic', 'diffenz'], [cardB, 'junior', 'phytax'], [cardC, 'redianze', 'lumiera']].forEach(([c, a, b]) => {
      c.maps = [crop(good(a), PW, PH), crop(good(b), PW, PH)];
      c.under = picture(c.maps[0], PW, PH, c.pic); c.over = picture(c.maps[1], PW, PH, c.pic, .003, true);
    });
    [good('banner-diffenz'), tx(1), good('banner-mindtropic'), tx(2)].forEach((t, i) => picture(crop(t, 1.7, 1.06), 1.7, 1.06, wallPics[i]));
    // the tubs: 1 body and 1 lid shape, drawn many times over (2 draw calls a kind)
    const UPY = new THREE.Vector3(0, 1, 0), bodyG = new THREE.CylinderGeometry(TUB.r, TUB.r, TUB.hb, 32, 1, true), lidG = new THREE.CylinderGeometry(TUB.r * 1.03, TUB.r * 1.03, TUB.hl, 32);
    bodyG.translate(0, TUB.hb / 2, 0); lidG.translate(0, TUB.hb + TUB.hl / 2, 0);
    // the lid colours are read from Eskayvie's own pack shots (the middle of each lid)
    const tubMat = { mt: [new THREE.MeshBasicMaterial({ map: good('label-mindtropic') }), lam(0x2A46C3)], jr: [new THREE.MeshBasicMaterial({ map: good('label-junior') }), lam(0x60B3E7)] };
    const M4 = new THREE.Matrix4(), Q4 = new THREE.Quaternion(), P4 = new THREE.Vector3(), S4 = new THREE.Vector3();
    Object.keys(tubs).forEach((t) => {
      const n = tubs[t].length; if (!n) return;
      const a = new THREE.InstancedMesh(bodyG, tubMat[t][0], n), b = new THREE.InstancedMesh(lidG, tubMat[t][1], n);
      tubs[t].forEach(([x, y, z, face, size], i) => { M4.compose(P4.set(x, y, z), Q4.setFromAxisAngle(UPY, face + TUB.turn), S4.set(size, size, size)); a.setMatrixAt(i, M4); b.setMatrixAt(i, M4); });
      a.frustumCulled = b.frustumCulled = false; S.add(a, b);
    });
    // a tub somebody carries: its own small object, held in the right hand from the shelf to the counter
    const handTub = (t) => { const g = new THREE.Group(); g.add(new THREE.Mesh(bodyG, tubMat[t][0]), new THREE.Mesh(lidG, tubMat[t][1])); g.visible = false; S.add(g); return g; };
    // the pointer: a mouse arrow that travels between the blue button and the cards, and presses them
    const arrow = new THREE.Shape(); [[0, 0], [0, -.52], [.125, -.4], [.215, -.6], [.29, -.565], [.2, -.37], [.37, -.37]].forEach((p, i) => (i ? arrow.lineTo(p[0], p[1]) : arrow.moveTo(p[0], p[1])));
    const arrowG = slab(arrow, .03), pointer = new THREE.Mesh(arrowG, lam(0x1E2433));
    pointer.add(new THREE.LineSegments(new THREE.EdgesGeometry(arrowG, 40), new THREE.LineBasicMaterial({ color: 0xffffff })));
    pointer.scale.setScalar(.4); S.add(pointer);
    const POINTER_AT = new THREE.Vector3(SIGN.x + .1, SIGN.y - .02, SIGN.z + .06);

    /* ---- the camera: perspective, about eye level, straight on, and still (owner, 17 Nov: "try not to move the whole thing
       back and forth"). It does not swing, push, bob or follow the pointer: the life is in the people, the film on the wall
       and the small things. The framing shows the whole shop front with room to spare at both sides. ---- */
    const FOV = 22, cam = new THREE.PerspectiveCamera(FOV, 1, .5, 90), TAN = Math.tan(FOV * Math.PI / 360);
    const HALF_W = 5.25, HALF_H = 3.3;                                  // metres that must show at the shop front, either side and up and down
    let camD = 16;
    function fit() {
      const w = el.clientWidth, h = el.clientHeight;
      if (!w || !h) return false;
      R.setSize(w, h, false);
      cam.aspect = w / h; camD = Math.max(HALF_W / (TAN * cam.aspect), HALF_H / TAN); cam.updateProjectionMatrix();
      const pr = R.getPixelRatio(), rw = Math.max(4, Math.round(w * pr / 3)), rh = Math.max(4, Math.round(h * pr / 3));
      RT.setSize(rw, rh); RPX.set(1 / rw, 1 / rh);
      camTick(0); cam.updateMatrixWorld();
      mirrorCam.copy(cam); mirrorCam.position.set(cam.position.x, -cam.position.y, cam.position.z); mirrorCam.up.set(0, 1, 0); mirrorCam.lookAt(0, -1.9, -1.5);
      mirrorCam.updateMatrixWorld(); mirrorCam.projectionMatrix.copy(cam.projectionMatrix); mirrorCam.projectionMatrixInverse.copy(cam.projectionMatrixInverse);
      TM.set(.5, 0, 0, .5, 0, .5, 0, .5, 0, 0, .5, .5, 0, 0, 0, 1).multiply(mirrorCam.projectionMatrix).multiply(mirrorCam.matrixWorldInverse);
      return true;
    }
    function paint() {
      if (MIRROR) { mirrorHide.forEach((o) => { o.visible = false; }); R.setRenderTarget(RT); R.clear(); R.render(S, mirrorCam); R.setRenderTarget(null); mirrorHide.forEach((o) => { o.visible = true; }); }
      R.render(S, cam);
    }
    function camTick(T) {
      cam.position.set(0, 2.6, camD);                                     // the same place at every moment (T is not used)
      cam.lookAt(0, 1.9, -1.5);
    }

    /* ---- the people ---- */
    const L = gltfLoader(), V = new THREE.Vector3();
    // The people keep their own colours (owner, 15 Nov: without colour they read as odd). opts.colour === false draws them in 3 flat tones.
    const SAT = opts.colour === false ? 1 : 0;
    const BANDS = new THREE.DataTexture(new Uint8Array([150, 150, 150, 255, 214, 214, 214, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat);
    BANDS.minFilter = BANDS.magFilter = THREE.NearestFilter; BANDS.needsUpdate = true;
    const olCache = {};
    function outlineMat(w) {
      const k = w.toFixed(5);
      if (olCache[k]) return olCache[k];
      const om = new THREE.MeshBasicMaterial({ color: EDGE, side: THREE.BackSide });
      om.onBeforeCompile = (sh) => { sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed += normalize(objectNormal) * ' + k + ';'); };
      om.customProgramCacheKey = () => 'bm-outline-' + k;
      return (olCache[k] = om);
    }
    // 1 file, read once: its materials are set up here and shared by every body made from it
    // The people as they come are flat: near black suits with no fold showing, nothing to part them from what is behind, 3 of
    // them in the same black. So, in the shader of their own materials: the darkest cloth is lifted until its folds show, a
    // soft cool rim runs round each figure, and the dark, colourless cloth of 3 suits takes a colour of its own (the hue only:
    // each pixel keeps its own brightness, so the folds stay). Skin, shirts, hair and faces are not touched.
    const SUITS = { 'rb-man-navy-suit': 0x30426E, 'rb-woman-black-suit': 0x2F5257, 'rb-man-purple-shirt': 0x6A5A50 };
    function dress(mt, file) {
      if (mt.map) { mt.map.anisotropy = ANISO; mt.map.needsUpdate = true; }
      const hex = mt.name === 'body' ? SUITS[file] : 0, c = hex ? new THREE.Color(hex) : null, l = c ? .2126 * c.r + .7152 * c.g + .0722 * c.b : 1;
      const tint = c ? '{ float bmL = dot(diffuseColor.rgb, vec3(.2126, .7152, .0722)), bmMx = max(diffuseColor.r, max(diffuseColor.g, diffuseColor.b)), bmMn = min(diffuseColor.r, min(diffuseColor.g, diffuseColor.b));\n'
        + '  float bmS = (bmMx - bmMn) / max(bmMx, .0001), bmK = (1. - smoothstep(.16, .3, bmL)) * mix(1., 1. - smoothstep(.3, .55, bmS), smoothstep(.03, .08, bmL));\n'
        + '  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(' + [c.r / l, c.g / l, c.b / l].map((v) => v.toFixed(4)).join(', ') + ') * bmL * 1.12, bmK); }\n' : '';
      mt.onBeforeCompile = (sh) => {
        sh.fragmentShader = sh.fragmentShader
          .replace('#include <map_fragment>', '#include <map_fragment>\n{ float bmL0 = dot(diffuseColor.rgb, vec3(.2126, .7152, .0722)); diffuseColor.rgb *= mix(2.3, 1., smoothstep(0., .2, bmL0)); }\n' + tint)
          .replace('#include <opaque_fragment>', '{ float bmF = pow(1. - saturate(dot(normalize(vViewPosition), normal)), 2.5); outgoingLight += vec3(.8, .86, 1.) * bmF * .18; }\n#include <opaque_fragment>');
      };
      mt.customProgramCacheKey = () => 'bm-dress-' + hex;
    }
    async function load(file) {
      const g = await L.loadAsync(base + 'people/' + file + '.glb');
      const m = g.scene, clips = {}, outlines = [];
      m.traverse((q) => {
        if (!q.isMesh) return;
        (Array.isArray(q.material) ? q.material : [q.material]).forEach((mt) => {
          if ('metalness' in mt) { mt.metalness = 0; mt.roughness = 1; }
          if (mt.transparent || mt.alphaMap) { mt.transparent = false; mt.alphaTest = .5; mt.depthWrite = true; }
          if (!SAT && mt.isMeshStandardMaterial && opts.dress !== false) dress(mt, file);
        });
        if (!SAT) return;
        const src = Array.isArray(q.material) ? q.material[0] : q.material;
        const toon = new THREE.MeshToonMaterial({ map: src.map || null, color: 0xffffff, gradientMap: BANDS, alphaTest: src.alphaTest || 0, side: src.side });
        toon.onBeforeCompile = (s2) => {
          s2.fragmentShader = s2.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\n#ifdef USE_MAP\n{ vec3 bmT = texture2D(map, vMapUv, 3.0).rgb;\n  float bmL = dot(bmT, vec3(.2126, .7152, .0722));\n  vec3 bmTone = mix(vec3(.23, .26, .33), vec3(.86, .88, .92), smoothstep(.10, .16, bmL));\n  diffuseColor.rgb = mix(bmTone, vec3(.99), smoothstep(.55, .62, bmL)); }\n#endif');
        };
        toon.customProgramCacheKey = () => 'bm-house-people';
        q.material = toon;
        if (q.isSkinnedMesh) {
          q.geometry.computeBoundingBox();
          const bb = q.geometry.boundingBox, tall = Math.max(bb.max.x - bb.min.x, bb.max.y - bb.min.y, bb.max.z - bb.min.z);
          const ol = new THREE.SkinnedMesh(q.geometry, outlineMat(tall * .011));
          ol.bind(q.skeleton, q.bindMatrix); ol.bindMode = q.bindMode;
          outlines.push([q, ol]);
        }
      });
      outlines.forEach(([q, ol]) => q.parent.add(ol));
      g.animations.forEach((c) => { clips[c.name] = c; });
      return { file, m, clips, planted: 0, size0: 1 };
    }
    const shared = {};                                                    // clips anyone may use: the rigs have the same bones
    function body(F, size, pace) {
      const m = F.m, o = new THREE.Group(), B = {};
      o.add(m); o.scale.setScalar(size); o.visible = false; S.add(o);
      // A soft contact shadow under each person: without it the feet float.
      const shG = new THREE.CircleGeometry(.5, 32), shUv = shG.attributes.uv; for (let i = 0; i < shUv.count; i++) shUv.setX(i, shUv.getX(i) * .5);
      const sh = new THREE.Mesh(shG, shadowMat);
      sh.rotation.x = -Math.PI / 2; sh.position.y = .012; sh.renderOrder = -1; o.add(sh);
      m.traverse((q) => { if (q.isBone) B[q.name] = q; if (q.isMesh) q.frustumCulled = false; });
      const clips = F.clips, mixer = new THREE.AnimationMixer(m);
      const p = { file: F.file, o, m, B, clips, mixer, size, pace, cur: null, name: '', look: 0, ptW: 0, ptAt: null, arm: 'r' };
      p.touch = ['upperarm_r', 'lowerarm_r', 'upperarm_l', 'lowerarm_l', 'spine_03', 'neck_01', 'head'].filter((n) => B[n]);
      p.play = (name, fadeT = .3) => {
        const clip = clips[name] || shared[name] || clips.idle;           // a clip nobody has: stand instead
        if (p.name === name) return;
        const a = mixer.clipAction(clip);
        a.reset().setEffectiveTimeScale(name === 'walk' ? pace : 1).setEffectiveWeight(1).fadeIn(fadeT).play();
        if (p.cur && p.cur !== a) p.cur.fadeOut(fadeT);
        p.cur = a; p.name = name;
      };
      // Walking speed, taken from the clip: while a foot is planted it moves back under the body at exactly the speed the body
      // must move forward. Measured over the samples where the foot is on the floor, so the feet do not slide. The clip and the
      // body are then sped up together (pace), so a brisk walk still plants its feet.
      if (!F.planted) {
        const wa = mixer.clipAction(clips.walk); wa.play();
        const N = 96, fy = [], fz = [];
        for (let i = 0; i <= N; i++) { mixer.setTime(clips.walk.duration * i / N); o.updateMatrixWorld(true); B.foot_l.getWorldPosition(V); fy.push(V.y); fz.push(V.z); }
        wa.stop(); mixer.setTime(0);
        const floor = Math.min.apply(null, fy), dtS = clips.walk.duration / N, vs = [];
        for (let i = 0; i < N; i++) if (fy[i] - floor < .012 && fy[i + 1] - floor < .012 && fz[i + 1] < fz[i]) vs.push((fz[i] - fz[i + 1]) / dtS);
        vs.sort((x, y) => x - y);
        F.planted = vs.length ? vs[Math.floor(vs.length / 2)] : 2 * (Math.max.apply(null, fz) - Math.min.apply(null, fz)) / clips.walk.duration;
        F.size0 = size;
      }
      p.speed = pace * F.planted * size / F.size0;                         // metres a second at this size and pace
      return p;
    }
    // smart dress, 4 different people (Microsoft Rocketbox), down from 6 on 18 Nov to lighten the page: the woman in the hijab
    // shops and pays, the man in the navy suit browses and sits a while, 1 sits in the lounge, 1 stands at the till.
    const FILES = [opts.woman || 'rb-woman-hijab', opts.man || 'rb-man-navy-suit', 'rb-woman-pink-blazer', 'rb-man-white-shirt'];
    const [fW1, fM1, fSit, fTill] = await Promise.all(FILES.map(load));
    if (dead) return null;
    shared.sit = fSit.clips.sit; shared.wave = fM1.clips.wave;
    // 2 walk, each at a pace of their own so they never move in step; 2 stay where they are
    const buyer = body(fW1, .94, 1.25), browser = body(fM1, .94, 1.2);
    const sitter = body(fSit, .94, 1), cashier = body(fTill, .94, 1);

    /* ---- the pose layer, after the clips every frame: a real reach or point, and heads that turn to what they look at.
       The mixer only writes a bone when the clip's value changes, so the clip's pose (clean) is kept apart from ours (mine). ---- */
    const UP = new THREE.Vector3(0, 1, 0), QW = new THREE.Quaternion(), QP = new THREE.Quaternion(), QD = new THREE.Quaternion(), ID = new THREE.Quaternion();
    const v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), v3 = new THREE.Vector3(), v4 = new THREE.Vector3(), v5 = new THREE.Vector3(), v6 = new THREE.Vector3();
    const sstep = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    const wrapA = (a) => Math.atan2(Math.sin(a), Math.cos(a));
    function clean(b) { const u = b.userData; if (!u.clean) { u.clean = b.quaternion.clone(); u.mine = new THREE.Quaternion(9, 9, 9, 9); } else if (b.quaternion.equals(u.mine)) b.quaternion.copy(u.clean); else u.clean.copy(b.quaternion); }
    function rotW(b, q) { b.getWorldQuaternion(QW); QW.premultiply(q); b.parent.getWorldQuaternion(QP); b.quaternion.copy(QP.invert().multiply(QW)); b.updateMatrixWorld(true); }
    function aim(b, child, dir, w) { b.getWorldPosition(v1); child.getWorldPosition(v2); v2.sub(v1).normalize(); QD.setFromUnitVectors(v2, dir); if (w < 1) QD.slerp(ID, 1 - w); rotW(b, QD); }
    function pointAt(p, at, w) {
      const up = p.B['upperarm_' + p.arm], lo = p.B['lowerarm_' + p.arm], hand = p.B['hand_' + p.arm]; if (!up || !lo || !hand) return;
      up.getWorldPosition(v5); v6.copy(at).sub(v5).normalize();
      aim(up, lo, v3.copy(v6).addScaledVector(UP, -.16).normalize(), w);
      aim(lo, hand, v4.copy(v6).addScaledVector(UP, .1).normalize(), w);
    }
    function pose(p, lookAt, lookW, dt) {
      p.touch.forEach((n) => clean(p.B[n]));
      p.o.updateMatrixWorld(true);
      if (p.ptW > .004 && p.ptAt) pointAt(p, p.ptAt, p.ptW);
      let want = 0;
      if (lookAt && lookW > 0) want = Math.max(-.95, Math.min(.95, wrapA(Math.atan2(lookAt.x - p.o.position.x, lookAt.z - p.o.position.z) - p.o.rotation.y))) * lookW;
      p.look += (want - p.look) * (dt > 0 ? Math.min(1, dt * 3.2) : 1);
      if (Math.abs(p.look) > .004 && p.B.head) { QD.setFromAxisAngle(UP, p.look * .2); rotW(p.B.spine_03, QD); QD.setFromAxisAngle(UP, p.look * .3); rotW(p.B.neck_01, QD); QD.setFromAxisAngle(UP, p.look * .5); rotW(p.B.head, QD); }
      p.touch.forEach((n) => p.B[n].userData.mine.copy(p.B[n].quaternion));
    }

    /* ---- routes. A route is a list of floor points; corners are rounded, the body follows the line at the speed of its own
       walk clip, slows to a stand over FADE seconds, turns on the spot to face what it came for, and sets off again. ---- */
    const FADE = .3, QUARTER = .36, A2 = new THREE.Vector2(), B2 = new THREE.Vector2(), P2 = new THREE.Vector2();
    function route(pts, r = .6) {
      const P = pts.map((q) => new THREE.Vector2(q[0], q[1])), out = [P[0].clone()];
      for (let i = 1; i < P.length - 1; i++) {
        const a = P[i - 1], b = P[i], c = P[i + 1], d1 = b.clone().sub(a), d2 = c.clone().sub(b), l1 = d1.length(), l2 = d2.length(), cut = Math.min(r, l1 / 2, l2 / 2);
        const s = b.clone().addScaledVector(d1, -cut / l1), e = b.clone().addScaledVector(d2, cut / l2);
        for (let k = 0; k <= 10; k++) { const u = k / 10, w0 = (1 - u) * (1 - u), w1 = 2 * u * (1 - u), w2 = u * u; out.push(new THREE.Vector2(w0 * s.x + w1 * b.x + w2 * e.x, w0 * s.y + w1 * b.y + w2 * e.y)); }
      }
      out.push(P[P.length - 1].clone());
      const cum = [0]; for (let i = 1; i < out.length; i++) cum.push(cum[i - 1] + out[i].distanceTo(out[i - 1]));
      const len = cum[cum.length - 1];
      const pos = (s, v) => { s = Math.max(0, Math.min(len, s)); let i = 1; while (i < cum.length - 1 && cum[i] < s) i++; const u = (s - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]); return v.set(out[i - 1].x + (out[i].x - out[i - 1].x) * u, out[i - 1].y + (out[i].y - out[i - 1].y) * u); };
      const head = (s) => { pos(s - .22, A2); pos(s + .22, B2); return Math.atan2(B2.x - A2.x, B2.y - A2.y); };
      return { len, pos, head };
    }
    function plan(p, steps) {
      const v = p.speed, segs = []; let t = 0, rot = 0, here = null, bagT = null, takeT = null, takes = 'mt';
      steps.forEach((st, i) => {
        if (st.walk) {
          const Rt = route(here ? [here].concat(st.walk) : st.walk), acc = !!here, dec = i < steps.length - 1 && !steps[i + 1].gone, h0 = Rt.head(0);
          const turn = acc ? QUARTER * Math.max(.5, Math.abs(wrapA(h0 - rot)) / (Math.PI / 2)) : 0;
          const cruise = Math.max(0, Rt.len - (acc ? v * FADE / 2 : 0) - (dec ? v * FADE / 2 : 0)) / v;
          segs.push({ walk: 1, t0: t, dur: turn + (acc ? FADE : 0) + cruise + (dec ? FADE : 0), turn, r0: rot, h0, Rt, acc, dec, cruise, st });
          here = st.walk[st.walk.length - 1]; rot = Rt.head(Rt.len);
        } else if (st.gone) { segs.push({ gone: 1, t0: t, dur: st.gone }); here = null; } else {
          const face = st.face ? Math.atan2(st.face[0] - here[0], st.face[1] - here[1]) : rot, d = wrapA(face - rot);
          segs.push({ hold: 1, t0: t, dur: st.hold, turn: QUARTER * Math.max(.5, Math.abs(d) / (Math.PI / 2)), r0: rot, r1: rot + d, x: here[0], z: here[1], st });
          if (st.bag != null) bagT = t + st.bag;
          if (st.take != null) { takeT = t + st.take; takes = st.takes || 'mt'; }
          rot = face;
        }
        t += segs[segs.length - 1].dur;
      });
      return { p, off: 0, segs, dur: t, bagT, takeT, takes, v, s: { vis: false, x: 0, z: 0, rot: 0, clip: 'idle', look: null, lookW: 0, pt: null, ptW: 0, bag: false, carry: false } };
    }
    function at(Q, t) {
      const o = Q.s; o.look = null; o.lookW = 0; o.pt = null; o.ptW = 0; o.clip = 'idle'; o.bag = Q.bagT != null && t >= Q.bagT; o.carry = Q.takeT != null && t >= Q.takeT && !o.bag;
      if (t >= Q.dur) { o.vis = false; return o; }
      let s = Q.segs[Q.segs.length - 1]; for (let i = 0; i < Q.segs.length; i++) if (t < Q.segs[i].t0 + Q.segs[i].dur) { s = Q.segs[i]; break; }
      const u = t - s.t0; o.vis = !s.gone;
      if (s.walk) {
        const v = Q.v, w = u - s.turn; let d = 0;
        if (w < 0) o.rot = s.r0 + wrapA(s.h0 - s.r0) * sstep(0, s.turn, u);
        else {
          const dA = s.acc ? v * FADE / 2 : 0, tD = (s.acc ? FADE : 0) + s.cruise;
          if (s.acc && w < FADE) d = v * w * w / (2 * FADE); else d = dA + v * (w - (s.acc ? FADE : 0));
          if (s.dec && w > tD) { const q = Math.min(FADE, w - tD); d = dA + v * s.cruise + v * (q - q * q / (2 * FADE)); } else o.clip = 'walk';
          o.rot = s.Rt.head(d);
        }
        s.Rt.pos(d, P2); o.x = P2.x; o.z = P2.y;
        if (s.st.glance) { o.look = s.st.glance; o.lookW = 1 - sstep(2.2, 4.6, Math.abs(o.x - s.st.glance.x)); }
      } else if (s.hold) {
        const st = s.st;
        o.x = s.x; o.z = s.z; o.rot = s.r0 + (s.r1 - s.r0) * sstep(0, s.turn, u);
        if (st.look) { o.look = st.look; o.lookW = sstep(0, s.turn + .2, u) * (1 - sstep(s.dur - .5, s.dur, u)); }
        if (st.point) { o.pt = st.point; o.ptW = sstep(st.from, st.from + .6, u) * (1 - sstep(st.to - .6, st.to, u)) * (st.reach || 1); }
        if (st.wave && u > st.wave[0] && u < st.wave[1]) o.clip = 'wave';
        // sitting down: the body steps back onto the seat as it folds, and comes forward again as it stands
        if (st.sit) {
          const k = Math.min(sstep(st.sit.from, st.sit.from + .75, u), 1 - sstep(st.sit.to - .1, st.sit.to + .65, u));
          o.x = s.x + (st.sit.at[0] - s.x) * k; o.z = s.z + (st.sit.at[1] - s.z) * k;
          if (u > st.sit.from && u < st.sit.to) o.clip = 'sit';
        }
      }
      return o;
    }

    /* ---- who does what. Street lanes run along x in front of the shop; people go in on the left of the door and come out on
       the right. Everybody's own time starts and ends off stage, and the offsets stagger them so the shop is never still. ---- */
    const P = (v) => [v.x, v.z], lookAt = (c) => [c.look.x, c.look.z];
    const AT_A = cardA.stand(1.2, -.2), AT_B = cardB.stand(1.2, .15), AT_C = cardC.stand(1.2, .2);
    const PAYF = [Q1.x + 1, Q1.z], OUTL = -5.6, OUTR = 5.6, IN = 1.15, OUT = 1.8, EXIT = [[2.4, -.3], [1.2, .2], [1.6, OUT], [OUTR, OUT]];
    // After the visit everybody walks back past the shop on the street, nearest to us, and looks in as they go by (those who
    // paid carry their bag). So each person is on stage for nearly the whole loop, and nobody is ever on stage twice.
    const GLANCE = new THREE.Vector3(0, 1.6, -2), PASS = 5.85;
    const back = (from, lane) => [{ gone: .5 }, { walk: [[from * PASS, lane], [-from * PASS, lane]], glance: GLANCE }];
    const TILLV = new THREE.Vector3(TILL.x, 1.5, TILL.z), SEATV = new THREE.Vector3(SEAT.x, 1.2, SEAT.z);
    const pay = (dur, bag) => ({ hold: dur, face: PAYF, look: READER, point: READER, from: .5, to: bag + .2, reach: .9, bag });
    // 1. she comes in from the left, looks at 2 cards along the wall, pays, and leaves to the right with her bag
    const pBuyer = plan(buyer, [
      { walk: [[OUTL, IN], [-1.2, IN], [-.5, .1], [-1.6, -.5], AT_A] },
      { hold: 2.6, face: lookAt(cardA), look: cardA.look, point: cardA.look, from: .7, to: 2.2 },
      { walk: [[-1.85, -1.15], [-1.8, -2.05], AT_B] },
      { hold: 2.5, face: lookAt(cardB), look: cardB.look, point: cardB.look, from: .4, to: 1.8, take: 1.8, takes: 'jr' },
      { walk: [[-1.7, -1.7], [-.6, -.75], [1.1, -.5], P(Q1)] },
      pay(3.0, 2.3),
      { walk: EXIT },
    ].concat(back(1, 2.62)));
    // 3. he comes in from the right, tries a laptop at the table, says hello in the lounge and sits down for a while, then leaves to the left
    const pBrowser = plan(browser, [
      { walk: [[OUTR, IN], [.35, IN], [-.4, .1], [-.62, -1.1], [-.66, -3.1], P(ISL_B1)] },
      { hold: 3.0, face: [ISL_B1.x, ISL_B1.z + 2], look: ISL_LOOK, point: ISL_LOOK, from: .7, to: 2.4, reach: .7 },
      { walk: [[-.2, -3.25], [-.6, -3.5], P(STAND2)] },
      { hold: 6.6, face: P(FACE2), look: SEATV, wave: [.35, 1.75], sit: { at: P(SEAT2), from: 2.0, to: 5.6 } },
      { walk: [[-.62, -3.15], [-.6, -1.9], [.3, -.85], [.5, .2], [-.4, OUT], [OUTL, OUT]] },
    ].concat(back(-1, 2.62)));
    const plans = [pBuyer, pBrowser];
    const LOOP = Math.max(opts.loop || 36, Math.ceil(Math.max.apply(null, plans.map((q) => q.dur)) + .3));
    // when each visit starts: half a loop apart, so 1 of them is always about
    const OFF = opts.offsets || [0, 18.75];
    plans.forEach((Q, i) => { Q.off = OFF[i]; });
    // 2 people do not walk: she sits in the lounge the whole time, he stands at the till
    sitter.o.position.set(SEAT.x, 0, SEAT.z); sitter.o.visible = true; sitter.play('sit', .01);
    cashier.o.position.set(TILL.x, 0, TILL.z); cashier.o.rotation.y = -Math.PI / 2; cashier.o.visible = true; cashier.play('idle', .01);
    // the bags: a white bag with a blue band, carried in the hand that is free
    const bagG = new THREE.BoxGeometry(.27, .25, .1), bagE = new THREE.EdgesGeometry(bagG), bagM = lam(WHITE), bandM = lam(ACC);
    plans.forEach((Q) => {
      if (Q.bagT == null) return;
      const b = new THREE.Group(), bd = new THREE.Mesh(bagG, bagM); bd.position.y = -.33;
      const band = new THREE.Mesh(new THREE.BoxGeometry(.274, .06, .104), bandM); band.position.y = -.33;
      const h1 = new THREE.Mesh(new THREE.BoxGeometry(.012, .21, .012), darkM); h1.position.set(-.055, -.1, 0); h1.rotation.z = -.5;
      const h2 = h1.clone(); h2.position.x = .055; h2.rotation.z = .5;
      b.add(bd, band, h1, h2); b.visible = false; S.add(b); Q.bag = b; Q.bagK = 0;
    });
    plans.forEach((Q) => { if (Q.takeT != null) { Q.tub = handTub(Q.takes); Q.tubK = 0; } });

    /* ---- the pointer's round. Each payment is a click on the blue button, just as the card is taken. Between payments it
       travels to a card and presses its button, and that card turns to its other page. Every card is pressed twice a loop,
       so each ends the loop on the page it began with. ---- */
    const mod = (x) => ((x % LOOP) + LOOP) % LOOP, gap = (a, b) => { const d = Math.abs(mod(a) - mod(b)); return Math.min(d, LOOP - d); };
    const PAYS = plans.filter((Q) => Q.bagT != null).map((Q) => mod(Q.off + Q.bagT - .3));
    const cardTip = (c) => new THREE.Vector3(c.tip.x, c.tip.y, c.tip.z);
    // the card clicks share out the time that is left between the payments (2.2 s clear either side of each), evenly
    const CLICKS = [], FREE = PAYS.slice().sort((x, y) => x - y).map((t, i, all) => { const a0 = t + 2.2, len = (i + 1 < all.length ? all[i + 1] : all[0] + LOOP) - 2.2 - a0; return { a0, len: Math.max(0, len) }; });
    const FREE_ALL = FREE.reduce((n, f) => n + f.len, 0), ROUND = [cardA, cardC, cardB, cardA, cardC, cardB];
    cards.forEach((c) => { c.clicks = []; });
    ROUND.forEach((c, i) => {
      let d = FREE_ALL * (i + .5) / ROUND.length, f = 0;
      while (f < FREE.length - 1 && d > FREE[f].len) { d -= FREE[f].len; f++; }
      const t = mod(FREE[f].a0 + d); CLICKS.push({ t, c }); c.clicks.push(t);
    });
    cards.forEach((c) => c.clicks.sort((x, y) => x - y));
    const STOPS = PAYS.map((t) => ({ t, at: POINTER_AT })).concat(CLICKS.map((k) => ({ t: k.t, at: cardTip(k.c) }))).sort((a, b) => a.t - b.t);
    function pointerAt(lt, out) {
      // which stop is next, and which was last (the round is a circle)
      let n = STOPS.findIndex((s) => s.t + .55 >= lt); if (n < 0) n = 0;
      const next = STOPS[n], prev = STOPS[(n + STOPS.length - 1) % STOPS.length];
      let left = next.t - lt; if (left < -.55) left += LOOP;               // seconds until the press
      const k = sstep(1.9, .75, left);                                     // it sets off 1.9 s before a press and is there .75 s before
      return out.copy(prev.at).lerp(next.at, k);
    }

    function script(T, dt) {
      const lt = mod(T);
      let atTill = null, atSeat = null;
      plans.forEach((Q) => {
        const p = Q.p, o = at(Q, mod(lt - Q.off));
        if (o.vis && !p.o.visible) { p.name = ''; p.look = 0; if (p.cur) { p.cur.stop(); p.cur = null; } p.play(o.clip, .01); }
        p.o.visible = o.vis;
        if (!o.vis) { if (Q.bag) Q.bag.visible = false; if (Q.tub) Q.tub.visible = false; return; }
        p.o.position.set(o.x, 0, o.z); p.o.rotation.y = o.rot; p.ptAt = o.pt; p.ptW = o.ptW;
        p.play(o.clip, o.clip === 'wave' || p.name === 'wave' ? .35 : o.clip === 'sit' || p.name === 'sit' ? .55 : FADE);
        p.mixer.update(dt);
        pose(p, o.look, o.lookW, dt);
        if (Q.bag) {
          Q.bagK += ((o.bag ? 1 : 0) - Q.bagK) * (dt > 0 ? Math.min(1, dt * 7) : 1);
          Q.bag.visible = Q.bagK > .02;
          if (Q.bag.visible) { p.B.hand_l.getWorldPosition(V); Q.bag.position.copy(V); Q.bag.rotation.y = o.rot + Math.PI / 2; Q.bag.scale.setScalar(Q.bagK); }
        }
        if (Q.tub) {
          Q.tubK += ((o.carry ? 1 : 0) - Q.tubK) * (dt > 0 ? Math.min(1, dt * 8) : 1);
          Q.tub.visible = Q.tubK > .02;
          if (Q.tub.visible) { p.B.hand_r.getWorldPosition(V); Q.tub.position.set(V.x, V.y - .15, V.z); Q.tub.rotation.y = o.rot + TUB.turn; Q.tub.scale.setScalar(Q.tubK); }
        }
        if (Math.hypot(o.x - Q1.x, o.z - Q1.z) < 1.3) atTill = o;
        if (Math.hypot(o.x - SEAT.x, o.z - SEAT.z) < 2.3) atSeat = o;
      });
      // the sitter turns her head to whoever comes to the lounge, the cashier to whoever is at the counter
      sitter.mixer.update(dt); pose(sitter, atSeat ? V.set(atSeat.x, 1.4, atSeat.z) : null, atSeat ? 1 : 0, dt);
      cashier.mixer.update(dt); pose(cashier, atTill ? V.set(atTill.x, 1.5, atTill.z) : null, atTill ? 1 : 0, dt);
      // the pointer, the presses, the pages
      let press = 0;
      PAYS.forEach((tp) => { const d = gap(lt, tp); press = Math.max(press, Math.exp(-d * d / .035)); });
      pointerAt(lt, pointer.position);
      let tap = press;
      cards.forEach((c) => {
        let hit = 0, turned = 0, since = 9;
        c.clicks.forEach((tc) => { const d = gap(lt, tc); hit = Math.max(hit, Math.exp(-d * d / .03)); if (lt >= tc) { turned++; since = lt - tc; } });
        c.button.scale.setScalar(1 - .1 * hit); tap = Math.max(tap, hit);
        // which page shows: it turns over .45 s after a press
        const now = turned % 2, k = turned ? sstep(0, .45, since) : 1;
        c.under.material.map = c.maps[k < 1 ? 1 - now : now]; c.over.material.map = c.maps[now]; c.over.material.opacity = k < 1 ? k : 0; c.over.visible = k < 1;
      });
      pointer.position.x += .03 * Math.sin(T * .9) - .05 * tap; pointer.position.y += .035 * Math.sin(T * 1.3) + .04 * tap; pointer.position.z -= .09 * tap;
      sign.scale.setScalar(1 - .06 * press);
      // the hanging boards sway, each a whole number of times a loop
      // the page on the back wall: on its top from 14.5 s to 24.5 s (of 36), down by 34.5 s, held, back up from 4.5 s to 14.5 s
      if (film) film.plane.visible = film.ok && film.v.readyState >= 2;
      if (WALL.tex) {
        const u = lt / LOOP * 36, e = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * x * (x * (x * 6 - 15) + 10); };
        const k = u >= 24.5 ? e((u - 24.5) / 10) : u < 4.5 ? 1 : 1 - e((u - 4.5) / 10);
        WALL.tex.offset.y = WALL.top - WALL.max * k;
      }
      camTick(T);
    }

    /* ---- running: only while on screen, 1 still frame for reduced motion, and a failed frame ends it cleanly ---- */
    // the story opens part way in, with the shop already busy
    const START = 19.5;
    let T = opts.start != null ? +opts.start : START, last = 0, running = false, shown = false, frames = 0, cpu = 0;
    function draw(dt) {
      const t0 = performance.now();
      T += dt;
      script(T, dt);
      paint();
      cpu += performance.now() - t0; frames++;
      if (!shown) { shown = true; el.classList.add('is-3d'); try { if (opts.onReady) opts.onReady(); } catch (e) { /* host's business */ } }
    }
    function frame(now) {
      if (dead) return;
      try { const dt = last ? Math.min(.05, (now - last) / 1000) : 0; last = now; draw(dt); }
      catch (e) { fail(e); }
    }
    // move the story on without drawing it (used for the still frame and by the test page)
    function run(seconds) { for (let n = Math.max(1, Math.round(seconds * 30)), i = 0; i < n; i++) { T += seconds / n; script(T, seconds / n); } }
    function drawStill() {
      try { T = (opts.start != null ? +opts.start : START) - 1.5; run(1.5); paint(); if (!shown) { shown = true; el.classList.add('is-3d'); if (opts.onReady) opts.onReady(); } }
      catch (e) { fail(e); }
    }
    function setRunning(on) {
      if (dead || still || on === running) return;
      running = on; last = 0;
      R.setAnimationLoop(on ? frame : null);
      if (film) { film.want = on; if (film.url) { if (on) film.v.play().catch(() => { /* the still stays */ }); else film.v.pause(); } }
    }
    el.appendChild(cv);
    fit();
    if (still) drawStill();
    ro = new ResizeObserver(() => { if (dead) return; if (fit()) { if (still) drawStill(); else if (!running && shown) paint(); } });
    ro.observe(el);
    if ('IntersectionObserver' in window) { io = new IntersectionObserver((en) => { setRunning(en.some((x) => x.isIntersecting)); }, { rootMargin: '120px 0px' }); io.observe(el); }
    else setRunning(true);

    /* ---- models. 4 props are also had as real models: CC0, from Poly Haven (polyhaven.com), thinned and packed for the web (see
       the README beside them). They are fetched after the stage is up; each takes the place of its built prop when it has
       loaded, on the same spot and contact shadow, and a model that cannot be had leaves the built prop where it is.
       opts.props: false for none, or the names wanted. Where each stands: [frame, scale x y z, how far forward in the frame]. ---- */
    const FIT = { plant: [PLANT, 1.5, 1.5, 1.5, 0], sofa: [SOFA, .97, .95, .95, .054], armchair: [CHAIR, .8, .8, .8, -.04], table: [TABLE, .69, .857, .69, 0] };
    const wanted = (opts.props === false ? [] : Array.isArray(opts.props) ? opts.props : PROPS).filter((n) => FIT[n]);
    let propsLeft = wanted.length;
    wanted.forEach((name) => {
      gltfLoader().loadAsync(base + 'props/' + name + '.glb').then((g) => {
        if (dead) return;
        const [k, sx, sy, sz, dz] = FIT[name], m = g.scene, p = k.pt(0, 0, dz);
        m.traverse((q) => { if (!q.isMesh) return; q.material.envMap = envTex; q.material.envMapIntensity = .45; [q.material.map, q.material.normalMap, q.material.roughnessMap].forEach((t) => { if (t) t.anisotropy = ANISO; }); });
        m.scale.set(sx, sy, sz); m.rotation.y = k.ry; m.position.set(p.x, 0, p.z); S.add(m);
        if (built[name]) built[name].visible = false;
        if (still) drawStill(); else if (!running && shown) paint();
      }).catch(() => { /* the built prop stays */ }).then(() => { propsLeft--; });
    });

    // where everybody is at a moment of the loop, for the checks below: [x, z, who, plan index or -1]
    const STILL = [[SEAT.x, SEAT.z, 'sitter', -1], [TILL.x, TILL.z, 'cashier', -1]], SEEN = 5.3;   // beyond 5.3 m either side nobody is in the picture
    function everyone(t, offs) {
      const out = STILL.slice();
      plans.forEach((Q, i) => { const o = at(Q, mod(t - (offs ? offs[i] : Q.off))); if (o.vis && Math.abs(o.x) < SEEN) out.push([o.x, o.z, Q.p.file, i]); });
      return out;
    }
    return {
      dispose: cleanUp, canvas: cv, loop: LOOP,
      debug: {
        plans, at, SEAT, people: plans.map((Q) => Q.p).concat([sitter, cashier]), info: R.info, twins: () => [], scene: S, camera: cam, offsets: () => plans.map((Q) => +Q.off.toFixed(2)), pays: PAYS, clicks: CLICKS.map((k) => +k.t.toFixed(2)),
        seek: (t) => { T = t; last = 0; }, run: (s) => { run(s); paint(); return T; }, time: () => T,
        stats: () => ({ frames, cpuMs: frames ? cpu / frames : 0, calls: R.info.render.calls, tris: R.info.render.triangles }),
        blocks, near: () => plans.map((Q) => blocks.map((b) => { let m = 9, when = 0; const c = Math.cos(b.ry), sn = Math.sin(b.ry); for (let t = 0; t <= Q.dur; t += .05) { const o = at(Q, t); if (!o.vis) continue; const dx = o.x - b.x, dz = o.z - b.z, d = Math.hypot(Math.max(Math.abs(dx * c - dz * sn) - b.hw, 0), Math.max(Math.abs(dx * sn + dz * c) - b.hd, 0)); if (d < m) { m = d; when = t; } } return [b.n, +m.toFixed(2), +when.toFixed(1)]; })),
        propsLeft: () => propsLeft, built, mirror: { RT, TM, floorMat, mirrorCam, R },
        speeds: () => plans.map((Q) => +Q.v.toFixed(2)), durs: () => plans.map((Q) => +Q.dur.toFixed(2)),
        // the closest any 2 people come to each other over the loop, and when
        clash: (stepS = .1, offs) => {
          let worst = { d: 9 };
          for (let t = 0; t < LOOP; t += stepS) {
            const st = everyone(t, offs);
            for (let i = 0; i < st.length; i++) for (let j = i + 1; j < st.length; j++) { const d = Math.hypot(st[i][0] - st[j][0], st[i][1] - st[j][1]); if (d < worst.d) worst = { d, t, a: st[i][2], b: st[j][2], at: [st[i][0], st[i][1]] }; }
          }
          return worst;
        },
        // how many people are on stage and how many are walking, second by second
        busy: () => { const out = []; for (let t = 0; t < LOOP; t += 1) { let on = 2, moving = 0; plans.forEach((Q) => { const o = at(Q, mod(t - Q.off)); if (o.vis) { on++; if (o.clip === 'walk') moving++; } }); out.push([t, on, moving]); } return out; },
      },
    };
  } catch (e) {
    return fail(e);
  }
}
