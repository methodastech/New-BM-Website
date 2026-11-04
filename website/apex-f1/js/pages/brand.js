/* Brand page: copy-to-clipboard swatches. Reveals come from page.js. */
(() => {
  const hint = document.querySelector('.sys__hint');
  document.querySelectorAll('.swatch').forEach((b) => b.addEventListener('click', async () => {
    const hex = b.dataset.hex;
    try { await navigator.clipboard.writeText(hex); } catch (e) { /* clipboard blocked — still show the value */ }
    document.querySelectorAll('.swatch.is-copied').forEach((x) => x.classList.remove('is-copied'));
    b.classList.add('is-copied');
    if (hint) hint.textContent = `Copied ${hex}`;
  }));
})();
