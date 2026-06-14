/**
 * Vizag Cafe — Coastal Premium Enhancements (index2 only)
 * Loader, parallax, hero dish carousel, premium reviews
 */
(function () {
  'use strict';

  if (!document.body.classList.contains('theme-premium')) return;

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initPremiumLoader();
    initHeroEntrance();
    initHeroParallax();
    initHeroDishCarousels();
    initPremiumReviews();
  }

  function initPremiumLoader() {
    const loader = document.getElementById('loader');
    const progress = document.querySelector('.premium-loader-progress');
    if (!loader) return;

    let pct = 0;
    const tick = setInterval(() => {
      pct = Math.min(pct + Math.random() * 18 + 8, 92);
      if (progress) progress.style.width = `${pct}%`;
    }, 120);

    function finish() {
      clearInterval(tick);
      if (progress) progress.style.width = '100%';
      setTimeout(() => loader.classList.add('hidden'), 450);
    }

    window.addEventListener('load', () => setTimeout(finish, 400));
    setTimeout(finish, 2800);
  }

  function initHeroEntrance() {
    const hero = document.querySelector('.hero-coastal');
    if (!hero) return;
    requestAnimationFrame(() => hero.classList.add('hero-ready'));
  }

  function initHeroParallax() {
    const hero = document.querySelector('.hero-coastal');
    const image = hero?.querySelector('.hero-image');
    const orbs = hero?.querySelector('.hero-premium-orbs');
    if (!hero || !image || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let ticking = false;

    function update() {
      const rect = hero.getBoundingClientRect();
      const progress = Math.min(Math.max(-rect.top / rect.height, 0), 1);
      image.style.transform = `scale(1.06) translateY(${progress * 10}px)`;
      if (orbs) orbs.style.transform = `translateY(${progress * 6}px)`;
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });

    update();
  }

  /* --- Hero Dish Carousel (crossfade + thumbs) --- */
  function initHeroDishCarousels() {
    document.querySelectorAll('[data-hero-carousel]').forEach(initOneHeroCarousel);
  }

  function initOneHeroCarousel(root) {
    const slides = [...root.querySelectorAll('.hero-dish-slide')];
    const thumbs = [...root.querySelectorAll('.hero-dish-thumbs button')];
    const progressBar = root.querySelector('.hero-dish-progress-bar');
    if (!slides.length) return;

    let index = 0;
    let timer = null;
    const duration = 4500;
    let progressStart = 0;
    let progressRaf = null;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach((slide, si) => slide.classList.toggle('is-active', si === index));
      thumbs.forEach((btn, bi) => {
        btn.classList.toggle('is-active', bi === index);
        btn.setAttribute('aria-selected', bi === index ? 'true' : 'false');
      });
      resetProgress();
    }

    function next() {
      goTo(index + 1);
    }

    function resetProgress() {
      if (!progressBar || reducedMotion) return;
      cancelAnimationFrame(progressRaf);
      progressStart = performance.now();
      progressBar.style.width = '0%';

      function tick(now) {
        const pct = Math.min((now - progressStart) / duration, 1);
        progressBar.style.width = `${pct * 100}%`;
        if (pct < 1) progressRaf = requestAnimationFrame(tick);
      }
      progressRaf = requestAnimationFrame(tick);
    }

    function startAutoplay() {
      stopAutoplay();
      if (reducedMotion) return;
      timer = setInterval(next, duration);
      resetProgress();
    }

    function stopAutoplay() {
      clearInterval(timer);
      cancelAnimationFrame(progressRaf);
    }

    thumbs.forEach((btn) => {
      btn.addEventListener('click', () => {
        goTo(Number(btn.dataset.go));
        startAutoplay();
      });
    });

    root.addEventListener('mouseenter', stopAutoplay);
    root.addEventListener('mouseleave', startAutoplay);

    let touchStartX = 0;
    root.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoplay();
    }, { passive: true });

    root.addEventListener('touchend', (e) => {
      const diff = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(diff) > 40) goTo(index + (diff < 0 ? 1 : -1));
      startAutoplay();
    }, { passive: true });

    goTo(0);
    startAutoplay();
  }

  /* --- Premium Reviews Carousel --- */
  function initPremiumReviews() {
    const track = document.getElementById('reviews-track');
    const dotsWrap = document.getElementById('reviews-dots');
    const prevBtn = document.getElementById('review-prev');
    const nextBtn = document.getElementById('review-next');
    if (!track || !dotsWrap) return;

    const cards = [...track.querySelectorAll('.review-card')];
    let currentIndex = 0;
    let slidesPerView = getSlidesPerView();
    let maxIndex = 0;
    let autoplayTimer = null;
    const gap = 20;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function getSlidesPerView() {
      if (window.innerWidth >= 1024) return 3;
      if (window.innerWidth >= 640) return 2;
      return 1;
    }

    function buildDots() {
      dotsWrap.innerHTML = '';
      const total = maxIndex + 1;
      for (let i = 0; i < total; i++) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'reviews-dot' + (i === currentIndex ? ' is-active' : '');
        dot.setAttribute('aria-label', `Go to review slide ${i + 1}`);
        dot.addEventListener('click', () => {
          goTo(i);
          startAutoplay();
        });
        dotsWrap.appendChild(dot);
      }
    }

    function updateSlider(animate = true) {
      const viewport = track.parentElement;
      const viewportWidth = viewport?.offsetWidth || 0;
      const cardWidth = cards[0]?.offsetWidth || viewportWidth;
      const offset = currentIndex * (cardWidth + gap);

      track.style.transition = animate && !reducedMotion
        ? 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)'
        : 'none';
      track.style.transform = `translate3d(-${offset}px, 0, 0)`;

      cards.forEach((card, i) => {
        const inView = i >= currentIndex && i < currentIndex + slidesPerView;
        card.classList.toggle('is-center', slidesPerView === 1 && i === currentIndex);
        card.classList.toggle('is-visible', slidesPerView > 1 && inView);
      });

      dotsWrap.querySelectorAll('.reviews-dot').forEach((dot, i) => {
        dot.classList.toggle('is-active', i === currentIndex);
      });
    }

    function recalc() {
      slidesPerView = getSlidesPerView();
      maxIndex = Math.max(0, cards.length - slidesPerView);
      if (currentIndex > maxIndex) currentIndex = maxIndex;
      buildDots();
      updateSlider(false);
    }

    function goTo(index) {
      currentIndex = Math.max(0, Math.min(index, maxIndex));
      updateSlider();
    }

    function next() {
      goTo(currentIndex >= maxIndex ? 0 : currentIndex + 1);
    }

    function prev() {
      goTo(currentIndex <= 0 ? maxIndex : currentIndex - 1);
    }

    function startAutoplay() {
      stopAutoplay();
      if (reducedMotion) return;
      autoplayTimer = setInterval(next, 5500);
    }

    function stopAutoplay() {
      clearInterval(autoplayTimer);
    }

    prevBtn?.addEventListener('click', () => { prev(); startAutoplay(); });
    nextBtn?.addEventListener('click', () => { next(); startAutoplay(); });

    const carousel = track.closest('.reviews-carousel-premium');
    carousel?.addEventListener('mouseenter', stopAutoplay);
    carousel?.addEventListener('mouseleave', startAutoplay);

    let touchStartX = 0;
    track.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoplay();
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      const diff = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(diff) > 50) diff < 0 ? next() : prev();
      startAutoplay();
    }, { passive: true });

    window.addEventListener('resize', recalc);

    recalc();
    startAutoplay();
  }
})();
