// Nav scroll
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
});

// Mobile menu
const hamburger = document.querySelector('.nav-hamburger');
const mobileMenu = document.querySelector('.nav-mobile');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    const bars = hamburger.querySelectorAll('span');
    const isOpen = mobileMenu.classList.contains('open');
    bars[0].style.transform = isOpen ? 'rotate(45deg) translate(5px, 5px)' : '';
    bars[1].style.opacity = isOpen ? '0' : '';
    bars[2].style.transform = isOpen ? 'rotate(-45deg) translate(5px, -5px)' : '';
  });
}

// Active nav link
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

// Reveal on scroll
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
reveals.forEach(el => observer.observe(el));

// Work filter
const filterBtns = document.querySelectorAll('.filter-btn');
const workCards = document.querySelectorAll('.work-card[data-cat]');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.filter;
    workCards.forEach(card => {
      const show = cat === 'all' || card.dataset.cat === cat;
      card.style.display = show ? 'block' : 'none';
    });
  });
});

// Contact form
const form = document.querySelector('.contact-form form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    form.style.display = 'none';
    const success = document.querySelector('.form-success');
    if (success) success.style.display = 'block';
  });
}

// Scroll-driven logo slider
(function () {
  const rightTracks = document.querySelectorAll('.clients-track--right');
  const leftTracks  = document.querySelectorAll('.clients-track--left');
  if (!rightTracks.length) return;

  const SPEED = 0.018;  // how much logos move per px scrolled
  const LERP  = 0.07;   // smoothing (lower = more inertia)

  let target  = 0;
  let current = 0;
  let lastY   = window.scrollY;
  let rafId   = null;

  function mod(n, m) { return ((n % m) + m) % m; }

  function render() {
    current += (target - current) * LERP;

    const rPct = -mod(current, 50);
    const lPct =  mod(current, 50) - 50;

    rightTracks.forEach(t => { t.style.transform = `translateX(${rPct.toFixed(4)}%)`; });
    leftTracks.forEach(t  => { t.style.transform = `translateX(${lPct.toFixed(4)}%)`; });

    rafId = Math.abs(target - current) > 0.005
      ? requestAnimationFrame(render)
      : null;
  }

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    target += (y - lastY) * SPEED;
    lastY = y;
    if (!rafId) rafId = requestAnimationFrame(render);
  }, { passive: true });
})();

// Counter animation
function animateCounters() {
  document.querySelectorAll('.stat-num[data-count], .about-stat-num[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    let current = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current) + suffix;
      if (current >= target) clearInterval(timer);
    }, 25);
  });
}
const statsSection = document.querySelector('.stats-row, .about-stats-inner');
if (statsSection) {
  const statsObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) { animateCounters(); statsObserver.disconnect(); }
  }, { threshold: 0.3 });
  statsObserver.observe(statsSection);
}
