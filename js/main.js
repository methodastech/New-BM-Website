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

const mobileServices = document.querySelector('.nav-mobile-services');
const mobileServicesToggle = document.querySelector('.nav-mobile-services-toggle');
if (mobileServices && mobileServicesToggle) {
  mobileServicesToggle.addEventListener('click', () => {
    const isOpen = mobileServices.classList.toggle('open');
    mobileServicesToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

// Active nav link
const currentPage = window.location.pathname.includes('/blog/')
  ? 'resources.html'
  : (window.location.pathname.split('/').pop() || 'index.html');
const servicePages = [
  'services.html',
  'brand-strategy.html',
  'system-playbook.html',
  'marketing-ads.html',
  'content-creation.html',
  'website-apps.html'
];
const activePage = servicePages.includes(currentPage) ? 'services.html' : currentPage;
document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(link => {
  const href = link.getAttribute('href').split('/').pop();
  if (href === currentPage || href === activePage || (currentPage === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

// Reveal on scroll
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
reveals.forEach(el => observer.observe(el));

// Footer brand stamp reveal
(function () {
  const stamp = document.querySelector('.brand-stamp');
  if (!stamp) return;

  const stampObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        stamp.classList.add('is-visible');
        stampObserver.disconnect();
      }
    });
  }, { threshold: 0.28, rootMargin: '0px 0px -12% 0px' });

  stampObserver.observe(stamp);
})();

// Work filter
const filterBtns = document.querySelectorAll('.filter-btn');
const workCards = document.querySelectorAll('.work-card[data-cat]');
const workSearch = document.querySelector('.work-search');

function encodeWorkImagePath(name) {
  return name
    .trim()
    .split('/')
    .map(part => encodeURIComponent(part))
    .join('/');
}

function loadWorkCardImages() {
  document.querySelectorAll('.work-card').forEach(card => {
    const fileName = card.dataset.workImage;
    if (!fileName) return;

    const source = `./work-images/${encodeWorkImagePath(fileName)}`;
    const image = new Image();
    image.decoding = 'async';
    image.loading = 'lazy';

    image.addEventListener('load', () => {
      let background = card.querySelector('.work-card-bg');
      if (!background) {
        background = document.createElement('div');
        background.className = 'work-card-bg';
        card.prepend(background);
      }
      background.style.backgroundImage = `url("${source}")`;
      card.classList.add('has-work-bg');
    }, { once: true });

    image.src = source;
  });
}

loadWorkCardImages();

if (workSearch && workCards.length) {
  workSearch.addEventListener('input', () => {
    const query = workSearch.value.trim().toLowerCase();
    workCards.forEach(card => {
      const searchableText = `${card.dataset.search || ''} ${card.textContent}`.toLowerCase();
      card.style.display = searchableText.includes(query) ? '' : 'none';
    });
  });
}

workCards.forEach(card => {
  const href = card.dataset.href;
  if (!href) return;

  card.addEventListener('click', event => {
    if (event.target.closest('a')) return;
    window.location.href = href;
  });

  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'link');
  card.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      window.location.href = href;
    }
  });
});

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
    if (form.getAttribute('action')) return;

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

// Slider arrow controls
(function () {
  const sliderConfigs = [
    { selector: '.approach-list', item: '.approach-item' },
    { selector: '.testimonials-carousel', item: '.testimonial-card', compact: true, pause: '.testimonials-track' },
    { selector: '.team-scroll-wrap', item: '.team-member', compact: true, pause: '.team-scroll-track' },
    { selector: '.service-card-grid', item: '.service-detail-card', compact: true, mobileOnly: true },
    { selector: '.service-point-list', item: '.service-point', compact: true, mobileOnly: true },
    { selector: '.work-bento', item: '.work-bento-card', compact: true, mobileOnly: true },
    { selector: '.why-method-list', item: '.why-method-card', compact: true, mobileOnly: true, wrapperClass: 'bm-slider--why-method' },
    { selector: '.standout-grid', item: '.standout-card', compact: true, mobileOnly: true },
    { selector: '.process-steps-wrap', item: '.process-step', compact: true, mobileOnly: true }
  ];

  function ensureSliderWrap(target, config) {
    const existing = target.closest('.approach-slider, .bm-slider');
    if (existing) return existing;

    const wrap = document.createElement('div');
    wrap.className = 'bm-slider';
    if (config.compact) wrap.classList.add('bm-slider--compact');
    if (config.mobileOnly) wrap.classList.add('bm-slider--mobile-only');
    if (config.wrapperClass) wrap.classList.add(config.wrapperClass);

    target.parentNode.insertBefore(wrap, target);
    wrap.appendChild(target);
    return wrap;
  }

  function getScrollAmount(target, config) {
    const item = target.querySelector(config.item);
    if (!item) return target.clientWidth;

    const styles = window.getComputedStyle(target);
    const gap = parseFloat(styles.columnGap || styles.gap) || 0;
    return item.getBoundingClientRect().width + gap;
  }

  function setupSlider(target, config) {
    const wrap = ensureSliderWrap(target, config);
    if (wrap.querySelector(':scope > .bm-slider-controls')) return;

    const controls = document.createElement('div');
    controls.className = 'bm-slider-controls';
    controls.setAttribute('aria-label', 'Slider navigation');
    controls.innerHTML = [
      '<button class="bm-slider-arrow bm-slider-arrow--prev" type="button" aria-label="Previous item">&#8592;</button>',
      '<button class="bm-slider-arrow bm-slider-arrow--next" type="button" aria-label="Next item">&#8594;</button>'
    ].join('');
    wrap.insertBefore(controls, target);
    wrap.classList.add('has-slider-controls');

    const prev = controls.querySelector('.bm-slider-arrow--prev');
    const next = controls.querySelector('.bm-slider-arrow--next');
    const pauseTarget = config.pause ? target.querySelector(config.pause) : null;

    function hasActiveControls() {
      return !config.mobileOnly || window.matchMedia('(max-width: 768px)').matches;
    }

    function updateButtons() {
      const maxScroll = target.scrollWidth - target.clientWidth;
      const canScroll = maxScroll > 4 && hasActiveControls();
      controls.hidden = !canScroll;
      wrap.classList.toggle('has-slider-controls', canScroll);
      prev.disabled = !canScroll || target.scrollLeft <= 2;
      next.disabled = !canScroll || target.scrollLeft >= maxScroll - 2;
    }

    function scrollByItem(direction) {
      if (pauseTarget) {
        pauseTarget.style.animationPlayState = 'paused';
      }
      target.scrollBy({ left: direction * getScrollAmount(target, config), behavior: 'smooth' });
    }

    prev.addEventListener('click', () => scrollByItem(-1));
    next.addEventListener('click', () => scrollByItem(1));
    target.addEventListener('scroll', updateButtons, { passive: true });
    window.addEventListener('resize', updateButtons);
    updateButtons();
  }

  sliderConfigs.forEach(config => {
    document.querySelectorAll(config.selector).forEach(target => setupSlider(target, config));
  });
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
