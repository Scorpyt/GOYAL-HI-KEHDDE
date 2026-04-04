/* ═══════════════════════════════════════════════════════════════
   detail.js  –  Project detail page: Locomotive Scroll + transitions
   ═══════════════════════════════════════════════════════════════ */

let locoScroll = null;

/* ── Locomotive Scroll Init ──────────────────────────────────── */

function initLocomotiveScroll() {
  const scrollContainer = document.querySelector('[data-scroll-container]');
  if (!scrollContainer || typeof LocomotiveScroll === 'undefined') return;

  locoScroll = new LocomotiveScroll({
    el: scrollContainer,
    smooth: true,
    multiplier: 0.85,
    lerp: 0.07,
    smartphone: { smooth: true, multiplier: 1.2 },
    tablet: { smooth: true, multiplier: 1.2 },
    getDirection: true,
  });

  // Refresh after images load
  const images = document.querySelectorAll('img');
  let loaded = 0;
  const total = images.length;

  if (total === 0) {
    locoScroll.update();
    return;
  }

  images.forEach((img) => {
    if (img.complete) {
      loaded++;
      if (loaded === total) locoScroll.update();
    } else {
      img.addEventListener('load', () => {
        loaded++;
        if (loaded === total) locoScroll.update();
      });
      img.addEventListener('error', () => {
        loaded++;
        if (loaded === total) locoScroll.update();
      });
    }
  });
}

/* ── Page Transitions ────────────────────────────────────────── */

function initPageTransitions() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') ||
        href.startsWith('tel:') || href.startsWith('http') ||
        href.startsWith('javascript:') || href.includes('download')) {
      return;
    }

    e.preventDefault();

    // Create transition overlay
    const overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.classList.add('active');
    });

    setTimeout(() => {
      if (locoScroll) {
        locoScroll.destroy();
        locoScroll = null;
      }
      window.location.href = href;
    }, 450);
  });
}

/* ── Scroll Reveal Animations ────────────────────────────────── */

function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
  );

  document.querySelectorAll('.gallery-item, .project-nav-link').forEach((el) => {
    el.classList.add('reveal-on-scroll');
    observer.observe(el);
  });
}

/* ── Init ─────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  initLocomotiveScroll();
  initPageTransitions();
  initScrollReveal();
});
