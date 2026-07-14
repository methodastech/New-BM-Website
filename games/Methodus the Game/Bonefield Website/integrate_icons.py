#!/usr/bin/env python3
# Patches index.html <symbol> glyphs from icons-new.json and emits icons-test.html (medallion QA grid).
import json, re, sys, html

ROOT = "/Users/zieel/Bazil Claude 3/Games/Methodus the Game/Essence3D"
WRAP_OPEN = '<symbol id="{id}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'

def main():
    with open(f"{ROOT}/icons-new.json") as f:
        icons = json.load(f)
    with open(f"{ROOT}/index.html", encoding="utf-8") as f:
        src = f.read()

    patched, missing = 0, []
    for ic in icons:
        iid = ic["id"]; inner = ic["inner"].strip()
        new_sym = WRAP_OPEN.format(id=iid) + inner + "</symbol>"
        pat = re.compile(r'<symbol id="' + re.escape(iid) + r'"[ >].*?</symbol>', re.DOTALL)
        if pat.search(src):
            src = pat.sub(lambda m: new_sym, src, count=1)
            patched += 1
        else:
            missing.append(iid)

    with open(f"{ROOT}/index.html", "w", encoding="utf-8") as f:
        f.write(src)
    print(f"patched {patched}/{len(icons)} symbols; missing: {missing}")

    # --- QA grid: render every new icon inside a site-style medallion ---
    defs = "".join(WRAP_OPEN.format(id=ic["id"]) + ic["inner"].strip() + "</symbol>" for ic in icons)
    cells = ""
    for ic in icons:
        cells += (
            '<figure><span class="med"><svg viewBox="0 0 24 24"><use href="#%s"/></svg></span>'
            '<figcaption>%s</figcaption></figure>' % (ic["id"], html.escape(ic["id"]))
        )
    grid = f"""<!doctype html><html><head><meta charset="utf-8"><title>Bonefield icons QA</title>
<style>
 body{{margin:0;background:#0b0805;color:#caa24a;font-family:'Grenze Gotisch',Georgia,serif;padding:26px}}
 h1{{text-align:center;color:#e6cd8e;font-weight:400;letter-spacing:.1em}}
 .grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:18px;max-width:1280px;margin:0 auto}}
 figure{{margin:0;text-align:center}}
 .med{{display:inline-flex;align-items:center;justify-content:center;width:74px;height:74px;border-radius:50%;
   color:#f0dca0;background:radial-gradient(circle at 50% 34%,#3a2a14,#160d05 82%);
   box-shadow:inset 0 3px 6px rgba(255,238,200,.22),inset 0 -5px 10px rgba(0,0,0,.6),0 0 0 3px #100b05,0 0 0 5px #b8923f,0 0 0 8px #100b05}}
 .med svg{{width:38px;height:38px}}
 figcaption{{font-size:11px;color:#8a7c63;margin-top:9px;letter-spacing:.04em}}
 .small{{margin-top:34px}} .small .med{{width:30px;height:30px;box-shadow:0 0 0 2px #100b05,0 0 0 3px #b8923f}} .small .med svg{{width:18px;height:18px}}
</style></head><body>
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>{defs}</defs></svg>
<h1>Bonefield emblem set — {len(icons)} glyphs</h1>
<div class="grid">{cells}</div>
<h1 class="small">Favicon-scale read</h1>
<div class="grid">{cells}</div>
</body></html>"""
    with open(f"{ROOT}/icons-test.html", "w", encoding="utf-8") as f:
        f.write(grid)
    print("wrote icons-test.html")

if __name__ == "__main__":
    main()
