/**
 * Vizag Cafe — Main JavaScript
 * Handles all interactive features
 */

(function () {
  'use strict';

  /* --- DOM Ready --- */
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initLoader();
    initNavbar();
    initMobileMenu();
    initScrollReveal();
    initMenuFilter();
    if (!document.body.classList.contains('theme-premium')) {
      initReviewsSlider();
    }
    initCounters();
    initFAQ();
    initBackToTop();
    initContactForm();
    initSmoothScroll();
    initImageFallback();
  }

  /* --- Loading Animation --- */
  function initLoader() {
    const loader = document.getElementById('loader');
    if (!loader) return;

    window.addEventListener('load', () => {
      setTimeout(() => loader.classList.add('hidden'), 600);
    });

    setTimeout(() => loader.classList.add('hidden'), 3000);
  }

  /* --- Sticky Navbar --- */
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    if (!navbar) return;

    function updateNavbar() {
      const scrolled = window.scrollY > 60;
      navbar.classList.toggle('scrolled', scrolled);
      navbar.classList.toggle('on-hero', !scrolled);
      updateActiveNav(navLinks, sections);
    }

    window.addEventListener('scroll', updateNavbar);
    updateNavbar();
  }

  function updateActiveNav(links, sections) {
    const scrollPos = window.scrollY + 120;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        links.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }

  /* --- Mobile Menu --- */
  function initMobileMenu() {
    const toggle = document.getElementById('mobile-toggle');
    const menu = document.getElementById('mobile-menu');
    const overlay = document.getElementById('mobile-overlay');
    const closeBtn = document.getElementById('mobile-close');
    const mobileLinks = menu?.querySelectorAll('a');
    let scrollPosition = 0;
    let isOpen = false;

    if (!toggle || !menu) return;

    function preventTouchMove(e) {
      if (isOpen) e.preventDefault();
    }

    function openMenu() {
      if (isOpen) return;
      isOpen = true;
      scrollPosition = window.scrollY;
      menu.classList.add('open');
      menu.setAttribute('aria-hidden', 'false');
      overlay?.classList.add('open');
      document.documentElement.classList.add('menu-open');
      document.body.classList.add('menu-open');
      document.body.style.top = `-${scrollPosition}px`;
      toggle.setAttribute('aria-expanded', 'true');
      document.addEventListener('touchmove', preventTouchMove, { passive: false });
    }

    function closeMenu() {
      if (!isOpen) return;
      isOpen = false;
      menu.classList.remove('open');
      menu.setAttribute('aria-hidden', 'true');
      overlay?.classList.remove('open');
      document.documentElement.classList.remove('menu-open');
      document.body.classList.remove('menu-open');
      document.body.style.top = '';
      toggle.setAttribute('aria-expanded', 'false');
      document.removeEventListener('touchmove', preventTouchMove);
      window.scrollTo(0, scrollPosition);
    }

    toggle.addEventListener('click', () => (isOpen ? closeMenu() : openMenu()));
    closeBtn?.addEventListener('click', closeMenu);
    overlay?.addEventListener('click', closeMenu);
    mobileLinks?.forEach((link) => link.addEventListener('click', closeMenu));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) closeMenu();
    });

    window.addEventListener('resize', () => {
      if (isOpen && window.innerWidth >= 1024) closeMenu();
    });
  }

  /* --- Smooth Scroll --- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (!targetId || targetId === '#') return;

        const target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  /* --- Scroll Reveal --- */
  function initScrollReveal() {
    const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach((el) => observer.observe(el));
  }

  /* --- Menu Filter --- */
  function initMenuFilter() {
    const filterBtns = document.querySelectorAll('.menu-filter-btn');
    const menuItems = document.querySelectorAll('.menu-item');

    if (!filterBtns.length || !menuItems.length) return;

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const category = btn.dataset.filter;

        filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        menuItems.forEach((item) => {
          const itemCategory = item.dataset.category;
          const show = category === 'all' || itemCategory === category;
          item.classList.toggle('hidden', !show);

          if (show) {
            item.style.animation = 'none';
            item.offsetHeight;
            item.style.animation = 'hero-fade-up 0.5s ease forwards';
          }
        });
      });
    });
  }

  /* --- Reviews Slider --- */
  function initReviewsSlider() {
    const track = document.getElementById('reviews-track');
    const dots = document.querySelectorAll('.slider-dot');
    const prevBtn = document.getElementById('review-prev');
    const nextBtn = document.getElementById('review-next');

    if (!track) return;

    const cards = track.querySelectorAll('.review-card');
    let currentIndex = 0;
    let slidesPerView = getSlidesPerView();
    let maxIndex = Math.max(0, cards.length - slidesPerView);
    let autoplayInterval;

    function getSlidesPerView() {
      if (window.innerWidth >= 1024) return 3;
      if (window.innerWidth >= 640) return 2;
      return 1;
    }

    function updateSlider() {
      const cardWidth = cards[0]?.offsetWidth || 0;
      const gap = 24;
      const offset = currentIndex * (cardWidth + gap);
      track.style.transform = `translateX(-${offset}px)`;

      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });
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

    prevBtn?.addEventListener('click', prev);
    nextBtn?.addEventListener('click', next);

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => goTo(i));
    });

    function startAutoplay() {
      autoplayInterval = setInterval(next, 5000);
    }

    function stopAutoplay() {
      clearInterval(autoplayInterval);
    }

    track.addEventListener('mouseenter', stopAutoplay);
    track.addEventListener('mouseleave', startAutoplay);

    window.addEventListener('resize', () => {
      slidesPerView = getSlidesPerView();
      maxIndex = Math.max(0, cards.length - slidesPerView);
      if (currentIndex > maxIndex) currentIndex = maxIndex;
      updateSlider();
    });

    updateSlider();
    startAutoplay();
  }

  /* --- Animated Counters --- */
  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((counter) => observer.observe(counter));
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);

      el.textContent = current.toLocaleString('en-IN') + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target.toLocaleString('en-IN') + suffix;
      }
    }

    requestAnimationFrame(update);
  }

  /* --- FAQ Accordion --- */
  function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach((item) => {
      const question = item.querySelector('.faq-question');
      question?.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        faqItems.forEach((other) => other.classList.remove('active'));

        if (!isActive) {
          item.classList.add('active');
        }
      });
    });
  }

  /* --- Back to Top --- */
  function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 500);
    });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* --- Contact Form --- */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = form.querySelector('[name="name"]')?.value.trim();
      const email = form.querySelector('[name="email"]')?.value.trim();
      const phone = form.querySelector('[name="phone"]')?.value.trim();
      const message = form.querySelector('[name="message"]')?.value.trim();

      if (!name || !email || !message) {
        showToast('Please fill in all required fields.', 'error');
        return;
      }

      if (!isValidEmail(email)) {
        showToast('Please enter a valid email address.', 'error');
        return;
      }

      const whatsappMsg = encodeURIComponent(
        `Hi Vizag Cafe!\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\n\nMessage: ${message}`
      );

      window.open(`https://wa.me/916265331779?text=${whatsappMsg}`, '_blank');
      showToast('Redirecting to WhatsApp...', 'success');
      form.reset();
    });
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /* --- Image Fallback --- */
  function initImageFallback() {
    const fallback = 'images/dosa.jpg';

    document.querySelectorAll('img').forEach((img) => {
      img.addEventListener('error', function onError() {
        if (this.src.includes(fallback)) return;
        this.removeEventListener('error', onError);
        this.src = fallback;
      }, { once: false });
    });
  }

  function showToast(message, type) {
    const existing = document.querySelector('.toast-notification');
    existing?.remove();

    const toast = document.createElement('div');
    toast.className = `toast-notification fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full text-sm font-medium shadow-lg transition-all duration-300 opacity-0 ${
      type === 'success'
        ? 'bg-green-600 text-white'
        : 'bg-red-500 text-white'
    }`;
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
})();
