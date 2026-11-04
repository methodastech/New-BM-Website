# APEX F1 — portfolio build

Brand Method · independent F1 fan site — live 2026 data, race replays, tyre strategy,
team radio, driver and team pages, 3D garage.

Static HTML / CSS / JS, no build step. Upload this whole folder; `index.html` is the entry.
All paths are relative, so it works from a sub-folder (e.g. `/work/apex-f1/`).

```
index.html … garage.html       pages (garage = 3D Mercedes W17)
css/                           styles
js/core · pages · features · 3d   scripts (three.js 0.160 from jsDelivr)
assets/                        images, logos, 3D models, video
```

Lighter than the dev `site/` folder: trailer re-encoded to 720p, background loop to 540p,
pit-crew model trimmed to the 3 animations it uses, test page removed.

Fan project — images, video and photos of drivers, cars, helmets and team logos belong to
Formula 1, the teams and Netflix.

Preview locally: `python -m http.server` in this folder, then open http://localhost:8000/
(open via a server, not by double-clicking — ES modules and 3D models need http).
