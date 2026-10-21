/* Shared page behaviour: keep the section bar under the admin bar, light the current section. */
(function(){
  var bar=document.querySelector('.bmws');
  function setH(){ if(bar) document.documentElement.style.setProperty('--bh',bar.offsetHeight+'px'); }
  setH(); if(window.ResizeObserver&&bar) new ResizeObserver(setH).observe(bar); window.addEventListener('resize',setH);
  var links=[].slice.call(document.querySelectorAll('.nav a[href^="#"]'));
  if(!links.length||!('IntersectionObserver' in window)) return;
  var map={}; links.forEach(function(a){ map[a.getAttribute('href').slice(1)]=a; });
  var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ links.forEach(function(l){l.classList.remove('on')}); var a=map[e.target.id]; if(a){a.classList.add('on'); a.scrollIntoView({block:'nearest',inline:'nearest'});} } }); },{rootMargin:'-40% 0px -55% 0px'});
  Object.keys(map).forEach(function(id){ var el=document.getElementById(id); if(el) io.observe(el); });
})();
