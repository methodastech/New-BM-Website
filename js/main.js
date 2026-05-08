// Nav scroll
const nav = document.querySelector('nav');
const homepageHero = document.querySelector('body.hero-page .hero');
let lastNavScrollY = window.scrollY;

function updateNavState() {
  if (!nav) return;

  const currentY = window.scrollY;
  const scrollingDown = currentY > lastNavScrollY;
  const mobileMenuOpen = document.querySelector('.nav-mobile.open');
  const heroVisible = homepageHero
    ? currentY < homepageHero.offsetHeight - nav.offsetHeight
    : false;

  nav.classList.toggle('hero-visible', heroVisible);
  nav.classList.toggle('scrolled', !heroVisible && currentY > 20);
  nav.classList.toggle('nav-hidden', scrollingDown && currentY > nav.offsetHeight + 40 && !mobileMenuOpen);
  document.body.classList.toggle('float-actions-active', currentY > 120);
  lastNavScrollY = currentY;
}

updateNavState();
window.addEventListener('scroll', updateNavState, { passive: true });
window.addEventListener('resize', updateNavState);

const scrollTopFloat = document.querySelector('.scroll-top-float');
if (scrollTopFloat) {
  scrollTopFloat.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

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

// Leadership carousel seamless loop distance
(function () {
  const track = document.querySelector('.team-scroll-track');
  if (!track) return;

  function setTeamLoopDistance() {
    const items = Array.from(track.querySelectorAll('.team-member'));
    if (items.length < 2 || items.length % 2 !== 0) return;

    const first = items[0];
    const duplicateFirst = items[items.length / 2];
    const distance = duplicateFirst.offsetLeft - first.offsetLeft;
    if (distance <= 0) return;

    track.style.setProperty('--team-loop-distance', `-${distance}px`);
  }

  setTeamLoopDistance();
  window.addEventListener('resize', setTeamLoopDistance);
  window.addEventListener('load', setTeamLoopDistance, { once: true });
})();

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
  form.addEventListener('submit', async (e) => {
    const action = form.getAttribute('action');

    if (action) {
      e.preventDefault();

      const submitButton = form.querySelector('button[type="submit"]');
      const message = form.querySelector('.form-inline-message');
      const originalButtonText = submitButton ? submitButton.textContent : '';

      if (message) {
        message.className = 'form-inline-message';
        message.textContent = 'Sending your project brief...';
      }
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
      }

      try {
        const response = await fetch(action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });

        if (!response.ok) {
          throw new Error('Form submission failed');
        }

        form.reset();
        if (message) {
          message.classList.add('is-success');
          message.textContent = 'Thank you for sharing your project brief. We have received your details and will get back to you soon.';
        }
      } catch (error) {
        if (message) {
          message.classList.add('is-error');
          message.textContent = 'Sorry, your message could not be sent right now. Please try again in a moment.';
        }
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
        }
      }

      return;
    }

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
    { selector: '.deliverables-grid', item: '.service-detail-card, .reveal', compact: true, mobileOnly: true },
    { selector: '.service-point-list', item: '.service-point', compact: true, mobileOnly: true },
    { selector: '.work-bento', item: '.work-bento-card', compact: true, mobileOnly: true },
    { selector: '.why-method-list', item: '.why-method-card', compact: true, mobileOnly: true, wrapperClass: 'bm-slider--why-method' },
    { selector: '.standout-grid', item: '.standout-card', compact: true, mobileOnly: true },
    { selector: '.marketing-problem-grid', item: '.marketing-problem-card', compact: true, mobileOnly: true },
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
    const progress = document.createElement('div');
    progress.className = 'bm-slider-progress';
    progress.setAttribute('aria-hidden', 'true');
    progress.innerHTML = '<span></span>';
    wrap.appendChild(progress);
    wrap.classList.add('has-slider-controls');

    const prev = controls.querySelector('.bm-slider-arrow--prev');
    const next = controls.querySelector('.bm-slider-arrow--next');
    const progressBar = progress.querySelector('span');
    const pauseTarget = config.pause ? target.querySelector(config.pause) : null;
    let resumeTimer = null;

    function hasActiveControls() {
      return !config.mobileOnly || window.matchMedia('(max-width: 768px)').matches;
    }

    function updateButtons() {
      const maxScroll = target.scrollWidth - target.clientWidth;
      const canScroll = maxScroll > 4 && hasActiveControls();
      controls.hidden = !canScroll;
      progress.hidden = !canScroll;
      wrap.classList.toggle('has-slider-controls', canScroll);
      prev.disabled = !canScroll || target.scrollLeft <= 2;
      next.disabled = !canScroll || target.scrollLeft >= maxScroll - 2;
      const ratio = canScroll ? Math.min(Math.max(target.scrollLeft / maxScroll, 0), 1) : 0;
      const maxProgressTravel = Math.max(progress.clientWidth - progressBar.clientWidth, 0);
      progressBar.style.transform = `translateX(${(ratio * maxProgressTravel).toFixed(2)}px)`;
    }

    function scrollByItem(direction) {
      if (pauseTarget) {
        pauseTarget.style.animationPlayState = 'paused';
        window.clearTimeout(resumeTimer);
        resumeTimer = window.setTimeout(() => {
          pauseTarget.style.animationPlayState = '';
        }, 1800);
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
const aboutStatsMobileQuery = window.matchMedia('(max-width: 768px)');

function setMobileAboutStats() {
  if (!aboutStatsMobileQuery.matches) return;

  document.querySelectorAll('.about-stats-section .about-stat-num[data-count]').forEach(el => {
    el.textContent = `${el.dataset.count}${el.dataset.suffix || ''}`;
  });
}

function animateCounters() {
  document.querySelectorAll('.stat-num[data-count], .about-stat-num[data-count]').forEach(el => {
    if (aboutStatsMobileQuery.matches && el.closest('.about-stats-section')) {
      el.textContent = `${el.dataset.count}${el.dataset.suffix || ''}`;
      return;
    }

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
setMobileAboutStats();
aboutStatsMobileQuery.addEventListener('change', setMobileAboutStats);

const statsSection = document.querySelector('.stats-row, .about-stats-inner');
if (statsSection) {
  const statsObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) { animateCounters(); statsObserver.disconnect(); }
  }, { threshold: 0.3 });
  statsObserver.observe(statsSection);
}

// Homepage hero YouTube background
(function () {
  const iframe = document.getElementById('heroVideoPlayer');
  if (!iframe) return;

  let player = null;
  let loopTimer = null;

  function keepBackgroundLooping() {
    if (!player || typeof player.getDuration !== 'function') return;

    clearInterval(loopTimer);
    loopTimer = setInterval(() => {
      const duration = player.getDuration();
      const currentTime = player.getCurrentTime();

      if (duration && currentTime && duration - currentTime < 1.2) {
        player.seekTo(0, true);
        player.playVideo();
      }
    }, 400);
  }

  window.onYouTubeIframeAPIReady = function () {
    player = new YT.Player('heroVideoPlayer', {
      events: {
        onReady(event) {
          event.target.mute();
          event.target.playVideo();
          keepBackgroundLooping();
        },
        onStateChange(event) {
          if (event.data === YT.PlayerState.ENDED) {
            event.target.seekTo(0, true);
            event.target.playVideo();
          }
        }
      }
    });
  };

  const script = document.createElement('script');
  script.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(script);
})();
