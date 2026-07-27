/* ============================================================
   THE PAUSE : Ambient hero layer
   Soft, slow particles drifting upward, like scent in warm light.
   Very subtle. Pauses off screen. Skips on reduced motion / ?still.
   ============================================================ */

export function initHeroAmbient(hero) {
  if (!hero) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches || location.search.includes("still");
  if (reduced) return;

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "position:absolute;inset:0;z-index:1;pointer-events:none;";
  hero.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w = 0, h = 0;

  function resize() {
    w = hero.clientWidth; h = hero.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + "px"; canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  const N = 30;
  const parts = Array.from({ length: N }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: 44 + Math.random() * 90,
    vy: 0.018 + Math.random() * 0.03,
    sway: Math.random() * Math.PI * 2,
    swaySpeed: 0.002 + Math.random() * 0.004,
    op: 0.025 + Math.random() * 0.045,
  }));

  let raf = null;
  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const p of parts) {
      p.y -= p.vy / 100;
      p.sway += p.swaySpeed;
      if (p.y < -0.12) { p.y = 1.12; p.x = Math.random(); }
      const px = (p.x + Math.sin(p.sway) * 0.03) * w;
      const py = p.y * h;
      const g = ctx.createRadialGradient(px, py, 0, px, py, p.r);
      g.addColorStop(0, `rgba(248,246,242,${p.op})`);
      g.addColorStop(1, "rgba(248,246,242,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(px, py, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    raf = requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", resize);
  const start = () => { if (!raf) draw(); };
  const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = null; } };
  new IntersectionObserver((ents) => ents.forEach((e) => (e.isIntersecting ? start() : stop())), { threshold: 0 }).observe(hero);
  start();
}
