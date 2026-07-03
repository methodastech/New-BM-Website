/* RubexPay mobile navigation — builds a real slide-in menu from the existing nav (replaces the dead burger redirect) */
(function(){
  function lbl(el){ var d = el.getAttribute && el.getAttribute('data-en'); return (d !== null && d !== undefined && d !== '') ? d : el.textContent.trim(); }
  function init(){
    var burger = document.querySelector('.burger');
    var navLinks = document.querySelector('.nav-links');
    if(!burger || !navLinks) return;

    // Replace the node to strip any previously-attached listeners (the old contact.html redirect).
    var fresh = burger.cloneNode(true);
    burger.parentNode.replaceChild(fresh, burger);
    burger = fresh;
    burger.setAttribute('aria-label', 'Open menu');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-controls', 'mobileNav');

    var ov = document.createElement('div');
    ov.className = 'mnav'; ov.id = 'mobileNav'; ov.hidden = true;
    ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Menu');
    var html = '<div class="mnav-panel"><nav class="mnav-links" aria-label="Mobile navigation">';
    [].forEach.call(navLinks.querySelectorAll('a'), function(a){
      var cur = a.hasAttribute('aria-current') ? ' aria-current="page"' : '';
      html += '<a href="' + a.getAttribute('href') + '"' + cur + '>' + lbl(a) + '</a>';
    });
    html += '</nav>';
    var cta = document.querySelector('.nav-cta');
    if(cta) html += '<a class="mnav-cta" href="' + cta.getAttribute('href') + '">' + lbl(cta) + '</a>';
    var ls = document.querySelector('.lang-switch');
    if(ls) html += '<div class="mnav-lang" role="group" aria-label="Language">' + ls.innerHTML + '</div>';
    html += '</div>';
    ov.innerHTML = html;
    document.body.appendChild(ov);

    var lastFocus = null;
    function open(){
      lastFocus = document.activeElement;
      ov.hidden = false;
      void ov.offsetWidth; // force reflow so the slide/fade transition runs
      ov.classList.add('is-open');
      document.documentElement.classList.add('mnav-open');
      burger.classList.add('is-active'); burger.setAttribute('aria-expanded', 'true');
      var f = ov.querySelector('.mnav-links a'); if(f) f.focus();
    }
    function close(){
      ov.classList.remove('is-open');
      document.documentElement.classList.remove('mnav-open');
      burger.classList.remove('is-active'); burger.setAttribute('aria-expanded', 'false');
      window.setTimeout(function(){ ov.hidden = true; }, 380);
      if(lastFocus && lastFocus.focus) lastFocus.focus();
    }
    function toggle(){ ov.classList.contains('is-open') ? close() : open(); }

    burger.addEventListener('click', function(e){ e.preventDefault(); toggle(); });
    ov.addEventListener('click', function(e){
      if(e.target === ov) return close();
      var a = e.target.closest && e.target.closest('.mnav-links a,.mnav-cta');
      if(a) close();
    });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && ov.classList.contains('is-open')) close(); });

    // The overlay was just built; translate it to the active language (links are in the i18n selector).
    if(window.RBX_applyLang){ window.RBX_applyLang(document.documentElement.lang === 'zh-CN' ? 'zh' : 'en'); }
  }
  if(document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);
})();
