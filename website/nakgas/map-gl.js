/* NakGas, 21 Oct 2026: the order engine on a real map (Zieel: "realistic map, remove the rings, correct accurate placement of
   buildings, roads"). MapLibre GL 4.7 with OpenStreetMap data from OpenFreeMap: real Taman Molek streets, street names and 3D
   building footprints in a night style. The home and six dealers sit on real coordinates snapped to real roads (OSRM, built
   into tools/map-21oct.json), the route is a real driving route. The nearest dealer gets a 45 second ring and declines, the next
   accepts, the route draws and the lorry drives it home while the camera follows. Drives the step list and the chip like the
   radar did; without WebGL the SVG radar stays. */
(function () {
  'use strict';
  var root = document.querySelector('[data-rgl]'); if (!root) return;
  var box = root.querySelector('[data-map]'); if (!box) return;
  var probe = document.createElement('canvas'); if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) return;
  var D; try { D = JSON.parse(box.getAttribute('data-map')); } catch (e) { return; }
  var css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl.css'; document.head.appendChild(css);
  var sc = document.createElement('script'); sc.src = 'https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl.js'; sc.onload = go; document.head.appendChild(sc);

  function go() {
    if (!window.maplibregl) return;
    var ML = window.maplibregl, HOME = D.home, DL = D.dealers, RT = D.route;
    var NAV = '#06101F';
    var style = { version: 8, glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
      sources: { omt: { type: 'vector', url: 'https://tiles.openfreemap.org/planet' } },
      layers: [
        { id: 'bg', type: 'background', paint: { 'background-color': NAV } },
        { id: 'res', type: 'fill', source: 'omt', 'source-layer': 'landuse', filter: ['in', 'class', 'residential', 'suburb', 'neighbourhood'], paint: { 'fill-color': '#08162A' } },
        { id: 'park', type: 'fill', source: 'omt', 'source-layer': 'park', paint: { 'fill-color': '#0A2A22', 'fill-opacity': .9 } },
        { id: 'green', type: 'fill', source: 'omt', 'source-layer': 'landcover', filter: ['in', 'class', 'grass', 'wood', 'farmland'], paint: { 'fill-color': '#0A251F', 'fill-opacity': .8 } },
        { id: 'water', type: 'fill', source: 'omt', 'source-layer': 'water', paint: { 'fill-color': '#0B2442' } },
        { id: 'road-minor', type: 'line', source: 'omt', 'source-layer': 'transportation', filter: ['in', 'class', 'minor', 'service', 'track'], layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': '#22344F', 'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 13, .6, 15, 2.4, 17, 7] } },
        { id: 'road-mid', type: 'line', source: 'omt', 'source-layer': 'transportation', filter: ['in', 'class', 'tertiary', 'secondary'], layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': '#34507A', 'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 13, 1.4, 15, 4, 17, 11] } },
        { id: 'road-major', type: 'line', source: 'omt', 'source-layer': 'transportation', filter: ['in', 'class', 'primary', 'trunk', 'motorway'], layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': '#1E8A62', 'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 13, 2, 15, 6, 17, 15] } },
        { id: 'bldg', type: 'fill-extrusion', source: 'omt', 'source-layer': 'building', minzoom: 13,
          paint: { 'fill-extrusion-color': ['interpolate', ['linear'], ['coalesce', ['get', 'render_height'], 6], 0, '#1A2A44', 30, '#26446A', 90, '#3D6B9A'],
            'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 6], 'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0], 'fill-extrusion-opacity': .92, 'fill-extrusion-vertical-gradient': true } },
        { id: 'road-name', type: 'symbol', source: 'omt', 'source-layer': 'transportation_name', minzoom: 14.5,
          layout: { 'symbol-placement': 'line', 'text-field': ['get', 'name'], 'text-font': ['Noto Sans Regular'], 'text-size': 11, 'text-letter-spacing': .02 },
          paint: { 'text-color': '#8FA6C4', 'text-halo-color': NAV, 'text-halo-width': 1.4 } },
        { id: 'place', type: 'symbol', source: 'omt', 'source-layer': 'place', filter: ['in', 'class', 'suburb', 'neighbourhood', 'quarter'],
          layout: { 'text-field': ['get', 'name'], 'text-font': ['Noto Sans Bold'], 'text-size': 12.5, 'text-transform': 'uppercase', 'text-letter-spacing': .08 },
          paint: { 'text-color': '#7FE3B8', 'text-halo-color': NAV, 'text-halo-width': 1.6, 'text-opacity': .85 } }
      ] };
    root.classList.add('gl-on', 'map-on');   /* before the map starts, so its box has a size */
    var zf = (box.getBoundingClientRect().width / (box.clientWidth || 1)) || 1;   /* the 2K and 4K page zoom */
    var map = new ML.Map({ container: box, style: style, center: HOME, zoom: 14.15, pitch: 55, bearing: -18, interactive: false, attributionControl: false, fadeDuration: 0, antialias: true, pixelRatio: Math.min(3, (window.devicePixelRatio || 1) * zf) });
    map.addControl(new ML.AttributionControl({ compact: true, customAttribution: '© OpenStreetMap contributors · OpenFreeMap' }));
    map.on('load', function () { map.resize(); });
    if ('ResizeObserver' in window) new ResizeObserver(function () { map.resize(); }).observe(box);

    /* pins: a truck for each dealer, the house, the lorry; the icon centred on its point, the label to the right */
    var TRUCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 6.5c0-.6.4-1 1-1h9c.6 0 1 .4 1 1v8.5h-11z" fill="currentColor"/><path d="M13.5 9h3.9c.3 0 .6.1.8.4l2.9 3.3c.2.2.3.4.3.7V15h-7.9z" fill="currentColor" opacity=".72"/><path d="M2.5 15h19v1.6c0 .5-.4.9-.9.9H3.4c-.5 0-.9-.4-.9-.9z" fill="currentColor"/><circle cx="7" cy="17.6" r="2.2" fill="currentColor" stroke="#04121F" stroke-width="1.4"/><circle cx="17" cy="17.6" r="2.2" fill="currentColor" stroke="#04121F" stroke-width="1.4"/></svg>';
    var HOUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2 2.8 10.6l1.3 1.5L12 5.8l7.9 6.3 1.3-1.5z" fill="currentColor"/><path d="M5.5 11.4V20c0 .6.4 1 1 1h3.7v-5.2h3.6V21h3.7c.6 0 1-.4 1-1v-8.6L12 6.4z" fill="currentColor" opacity=".85"/></svg>';
    function pinEl(svg, ms, en, cls) { var e = document.createElement('span'); e.className = 'rg-pin on ' + cls; e.setAttribute('data-c', cls); e.innerHTML = '<i>' + svg + '</i>' + (ms ? '<b><span lang="ms">' + ms + '</span><span lang="en">' + en + '</span></b>' : ''); return e; }
    function marker(el, ll, half) { return new ML.Marker({ element: el, anchor: 'left', offset: [-half, 0] }).setLngLat(ll).addTo(map); }
    var PD = DL.map(function (d) { var el = pinEl(TRUCK, d.km.toFixed(1) + ' km', d.km.toFixed(1) + ' km', 'dl'); marker(el, d.p, 15); return el; });
    var PH = pinEl(HOUSE, 'Rumah anda', 'Your home', 'home'); marker(PH, HOME, 18);
    var LE = pinEl(TRUCK, '', '', 'lorry'); var LM = new ML.Marker({ element: LE, anchor: 'center' }).setLngLat(RT[0]).addTo(map);
    function st(el, s) { el.className = 'rg-pin on ' + el.getAttribute('data-c') + (s ? ' ' + s : ''); }
    /* the accepting dealer is the second nearest (index 1), as on the step list */
    var chip = root.querySelector('.radar-chip'), num = chip && chip.querySelector('b'), txt = chip ? [].slice.call(chip.querySelectorAll('[data-t]')) : [];
    txt.forEach(function (t) { if (t.getAttribute('data-t') === '3') t.innerHTML = '<span lang="ms">Diterima · ' + DL[1].km.toFixed(1) + ' km dari anda</span><span lang="en">Accepted · ' + DL[1].km.toFixed(1) + ' km from you</span>'; });
    var steps = [].slice.call(root.parentNode.querySelectorAll('.rsteps li')), ls = -1, lk = '';
    function step(k) { if (k === ls) return; ls = k; steps.forEach(function (s, j) { s.classList.toggle('on', j === k); }); }
    function say(k, n, ok) { var key = k + '|' + n; if (key === lk || !chip) return; lk = key; txt.forEach(function (t) { t.hidden = t.getAttribute('data-t') !== String(k); }); if (num) num.textContent = n == null ? '' : n; chip.classList.toggle('ok', !!ok); }
    /* the route, measured so the lorry moves at an even pace */
    var cum = [0]; for (var i = 1; i < RT.length; i++) { var dx = (RT[i][0] - RT[i - 1][0]) * Math.cos(HOME[1] * Math.PI / 180), dy = RT[i][1] - RT[i - 1][1]; cum.push(cum[i - 1] + Math.sqrt(dx * dx + dy * dy)); }
    var TOT = cum[cum.length - 1];
    function along(f) { var d = f * TOT, k = 1; while (k < cum.length - 1 && cum[k] < d) k++; var u = (d - cum[k - 1]) / ((cum[k] - cum[k - 1]) || 1); return [RT[k - 1][0] + (RT[k][0] - RT[k - 1][0]) * u, RT[k - 1][1] + (RT[k][1] - RT[k - 1][1]) * u, k]; }
    function part(f) { if (f <= 0) return []; var a = along(f), out = RT.slice(0, a[2]); out.push([a[0], a[1]]); return out; }
    var ready = false, LORRY = null;
    /* 21 Oct: a real 3D NakGas lorry (Zieel: "the truck supposed to be real, like 3D moving"): white cab, green stripe, a cage of
       grey cylinders, turning wheels, headlights; it faces along the road and drives the route. Scaled up 16 times so it reads at
       neighbourhood zoom. Falls back to the DOM truck pin if Three.js does not load. */
    function lorryLayer(THREE) {
      var S = 16, lay = { id: 'lorry3d', type: 'custom', renderingMode: '3d', pos: null, head: 0, vis: false, spin: 0 };
      lay.onAdd = function (m, gl) {
        this.cam = new THREE.Camera(); this.scene = new THREE.Scene();
        this.scene.add(new THREE.HemisphereLight(0xffffff, 0x334455, 1.4)); var d = new THREE.DirectionalLight(0xffffff, 1.6); d.position.set(30, 80, 40); this.scene.add(d);
        var g = new THREE.Group(), M = function (c, r, me) { return new THREE.MeshStandardMaterial({ color: c, roughness: r == null ? .5 : r, metalness: me || 0 }); };
        function box(w, h, l, mat, x, y, z) { var b = new THREE.Mesh(new THREE.BoxGeometry(l, h, w), mat); b.position.set(x, y, z); g.add(b); return b; }
        var white = M(0xF4F6F5, .45), green = M(0x0CA66A, .5), dark = M(0x101820, .6), glass = M(0x1E3A55, .2, .3), steel = M(0x9AA4AD, .4, .5), grey = M(0x8E98A2, .45, .4);
        box(2.2, .5, 6.4, dark, 0, .75, 0);                       /* chassis */
        box(2.25, 2.1, 1.9, white, 2.15, 1.95, 0);                /* cab */
        box(2.27, .32, 1.92, green, 2.15, 1.35, 0);              /* green stripe */
        box(2.0, .9, .06, glass, 3.12, 2.45, 0);                  /* windscreen */
        box(.06, .7, .9, glass, 2.3, 2.45, 1.14); box(.06, .7, .9, glass, 2.3, 2.45, -1.14);
        box(.4, .22, .06, M(0xFFF6D8, .2), 3.13, 1.25, .78); box(.4, .22, .06, M(0xFFF6D8, .2), 3.13, 1.25, -.78);   /* headlights */
        box(2.2, .14, 4.1, grey, -1.05, 1.07, 0);                 /* the bed */
        var cy = new THREE.CylinderGeometry(.3, .3, 1.05, 14);
        for (var i = 0; i < 6; i++) for (var j = 0; j < 3; j++) { var c = new THREE.Mesh(cy, steel); c.position.set(-2.75 + i * .68, 1.68, -.68 + j * .68); g.add(c); }   /* the cylinders */
        var rail = M(0xDDE3E6, .4, .6);
        [[-1.05, 2.25, 1.1, 4.1, .06, .06], [-1.05, 2.25, -1.1, 4.1, .06, .06], [-1.05, 1.7, 1.1, 4.1, .05, .05], [-1.05, 1.7, -1.1, 4.1, .05, .05]].forEach(function (r) { var b = new THREE.Mesh(new THREE.BoxGeometry(r[3], r[4], r[5]), rail); b.position.set(r[0], r[1], r[2]); g.add(b); });
        for (var k = 0; k < 6; k++) { [1.1, -1.1].forEach(function (z) { var b = new THREE.Mesh(new THREE.BoxGeometry(.06, 1.2, .06), rail); b.position.set(-3.05 + k * .8, 1.7, z); g.add(b); }); }
        this.wheels = []; var wg = new THREE.CylinderGeometry(.48, .48, .36, 18), wm = M(0x15191E, .8), hm = M(0xC9CED3, .3, .7);
        [[2.0, 1.12], [2.0, -1.12], [-1.9, 1.12], [-1.9, -1.12]].forEach(function (p) { var w = new THREE.Group(), t = new THREE.Mesh(wg, wm), h = new THREE.Mesh(new THREE.CylinderGeometry(.24, .24, .38, 12), hm); w.add(t); w.add(h); w.rotation.x = Math.PI / 2; w.position.set(p[0], .48, p[1]); g.add(w); this.wheels.push(w); }, this);
        var sh = new THREE.Mesh(new THREE.PlaneGeometry(7.4, 3), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .35, depthWrite: false })); sh.rotation.x = -Math.PI / 2; sh.position.y = .02; g.add(sh);
        g.scale.setScalar(S); this.g = g; this.scene.add(g);
        this.renderer = new THREE.WebGLRenderer({ canvas: m.getCanvas(), context: gl, antialias: true }); this.renderer.autoClear = false;
      };
      lay.render = function (gl, matrix) {
        if (!this.vis || !this.pos) return;
        var mc = ML.MercatorCoordinate.fromLngLat(this.pos, 0), sc = mc.meterInMercatorCoordinateUnits();
        var l = new THREE.Matrix4().makeTranslation(mc.x, mc.y, mc.z).scale(new THREE.Vector3(sc, -sc, sc)).multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2)).multiply(new THREE.Matrix4().makeRotationY(this.head));
        this.cam.projectionMatrix = new THREE.Matrix4().fromArray(matrix).multiply(l);
        this.wheels.forEach(function (w) { w.rotation.y = lay.spin; });
        this.renderer.resetState(); this.renderer.render(this.scene, this.cam);
      };
      return lay;
    }
    map.on('load', function () {
      map.addSource('route', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [] } } });
      map.addLayer({ id: 'route-glow', type: 'line', source: 'route', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#7FE3B8', 'line-width': 22, 'line-blur': 14, 'line-opacity': .55 } });
      map.addLayer({ id: 'route-case', type: 'line', source: 'route', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#04121F', 'line-width': 10 } });
      map.addLayer({ id: 'route', type: 'line', source: 'route', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#E6FFF3', 'line-width': 5 } });
      ready = true;
      import('three').then(function (THREE) { LORRY = lorryLayer(THREE); map.addLayer(LORRY); }).catch(function () { LORRY = null; });
    });
    function sm(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
    function lerp(a, b, u) { return a + (b - a) * u; }
    /* the dispatch, 14 s a loop */
    var CITY = 14, t0 = 0, run = false, raf = 0, lastF = -1, mid = [(HOME[0] + DL[1].p[0]) / 2, (HOME[1] + DL[1].p[1]) / 2], camAt = '', camLoop = -1;
    function easeIO(x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
    function frame(now) {
      var c = ((now - t0) / 1000) % CITY, t = now / 1000;
      var ACT = -1, NO = -1, OK = -1, rem = 1, rp = 0, tk = -1;
      if (c >= .8 && c < 5.3) { ACT = 0; rem = 1 - (c - .8) / 4.5; } else if (c >= 5.3 && c < 6.4) NO = 0; else if (c >= 6.4 && c < 7.9) { NO = 0; ACT = 1; rem = 1 - (c - 6.4) / 1.5 * .16; }
      if (c >= 5.3) NO = 0; if (c >= 7.9) { OK = 1; ACT = -1; rp = sm((c - 7.9) / 1.2); } if (c >= 9.1) tk = Math.min(1, (c - 9.1) / 3.4);
      PD.forEach(function (el, i) { st(el, i === NO ? 'no' : i === OK ? 'ok' : i === ACT ? 'act' : ''); });
      st(PH, tk >= 1 ? 'arr' : '');
      if (ready) { var f = Math.round(rp * 200); if (f !== lastF) { lastF = f; map.getSource('route').setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: part(rp) } }); } }
      var lp = tk >= 0 ? along(sm(tk)) : null, drive = !!lp && tk < 1;
      if (LORRY) { LE.style.display = 'none'; LORRY.vis = drive; if (lp) { var k2 = Math.min(RT.length - 1, lp[2]), a0 = RT[k2 - 1], a1 = RT[k2], dx = (a1[0] - a0[0]) * Math.cos(HOME[1] * Math.PI / 180), dy = a1[1] - a0[1]; LORRY.pos = [lp[0], lp[1]]; LORRY.head = Math.atan2(dy, dx); LORRY.spin -= .35; } map.triggerRepaint(); }
      else { LE.style.display = drive ? '' : 'none'; if (lp) LM.setLngLat([lp[0], lp[1]]); }
      /* camera: still, with three smooth moves a loop: wide while dealers are asked, close on the route while the lorry drives, back */
      var loopN = Math.floor((now - t0) / 1000 / CITY), want = c < 8.2 ? 'wide' : c < 12.8 ? 'route' : 'home';
      if (want !== camAt || loopN !== camLoop) { camAt = want; camLoop = loopN;
        if (want === 'wide') map.easeTo({ center: HOME, zoom: 14.15, bearing: -18, pitch: 55, duration: c < .5 ? 0 : 1400, easing: easeIO });
        else if (want === 'route') map.easeTo({ center: mid, zoom: 15.25, bearing: -18, pitch: 60, duration: 1800, easing: easeIO });
        else map.easeTo({ center: HOME, zoom: 14.15, bearing: -18, pitch: 55, duration: 1200, easing: easeIO }); }
      if (c < .8) { step(0); say(0, null); } else if (c < 5.3) { step(1); say(1, Math.ceil(45 * rem)); } else if (c < 6.4) { step(2); say(2, null); }
      else if (c < 7.9) { step(1); say(1, 45 - Math.round((c - 6.4) / 1.5 * 7)); } else if (c < 10) { step(3); say(3, null, true); } else { step(3); say(4, null, true); }
      if (run) raf = requestAnimationFrame(frame);
    }
    function start() { if (run) return; run = true; map.resize(); if (!t0) t0 = performance.now(); raf = requestAnimationFrame(frame); }
    function stop() { run = false; cancelAnimationFrame(raf); }
    window.__nakmap = map;
    window.__nakmapAt = function (c) { t0 = performance.now() - c * 1000; frame(performance.now()); };   /* for still captures (tools/render-app-assets.cjs) */
    var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var rb = root.parentNode.querySelector('.replay'); if (rb) rb.addEventListener('click', function () { t0 = performance.now(); if (!run) start(); });
    if (RM) { t0 = performance.now() - 11000; map.on('load', function () { frame(performance.now()); }); return; }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? start() : stop(); }); }, { threshold: .15 }).observe(root); else start();
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });

  }
})();
