// One-shot extractor: pull the "Brand Defense Grid" game out of the marketing
// HTML into a clean, standalone game.html (all CSS + fonts + game markup + IIFE).
const fs = require('fs');
const SRC = '/Users/zieel/Downloads/methodas_redesign_47__21_ (1).html';
const lines = fs.readFileSync(SRC, 'utf8').split('\n');
const slice = (a, b) => lines.slice(a - 1, b).join('\n');   // 1-based inclusive

const fonts = slice(28, 31);          // preconnect + Google Fonts (line 32 has a stray <script>, skip it)
const cssAll = slice(108, 3367);      // full <style id="main"> contents
const gameJS = slice(6509, 7903);     // the game IIFE

// game HTML: balance <div> from line 4471 until depth returns to 0
let depth = 0, end = 4471;
for (let i = 4471; i <= lines.length; i++) {
  const L = lines[i - 1];
  depth += (L.match(/<div\b/g) || []).length;
  depth -= (L.match(/<\/div>/g) || []).length;
  if (depth <= 0) { end = i; break; }
}
let gameHTML = slice(4471, end);
// force the game "live" (normally toggled by an IntersectionObserver on scroll)
gameHTML = gameHTML.replace('class="scan-stage rv d1"', 'class="scan-stage rv d1 live"');

const out = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<title>METHODUS — Brand Defense Grid</title>
${fonts}
<style id="main">
${cssAll}
</style>
<style id="standalone">
/* standalone overrides: strip the page chrome, make the game fill the screen */
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;overflow:hidden;background:#070b16}
#scanStage,.scan-stage{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;
  aspect-ratio:auto!important;min-height:0!important;max-width:none!important;border:none!important;border-radius:0!important;margin:0!important;
  opacity:1!important;transform:none!important;filter:none!important;visibility:visible!important}
#scanStage canvas,.scan-stage canvas{width:100%!important;height:100%!important}
</style>
</head>
<body>
${gameHTML}
<script>
/* standalone: the marketing site normally reveals/activates the stage via a
   scroll IntersectionObserver. We're not including that, so force it live. */
(function(){ var s=document.getElementById('scanStage'); if(s){ s.classList.add('live'); s.classList.remove('rv','d1'); } })();
</script>
<script>
${gameJS}
</script>
</body>
</html>
`;
fs.writeFileSync('/Users/zieel/Documents/Claude Bazil New/Methodus the Game/game.html', out);
console.log('game.html written. HTML lines 4471-' + end + ' (' + (end - 4471 + 1) + '), JS 6509-7903, CSS 108-3367. Total out lines: ' + out.split('\n').length);
