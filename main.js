/* ═══════════════════════════════════════════════════════════════
   main.js  –  Travel Shutter Portfolio · Entry Point
   Locomotive Scroll + GSAP ScrollTrigger
   ═══════════════════════════════════════════════════════════════ */

/* ── Configuration ────────────────────────────────────────────── */

const PROJECTS = [
  {
    title:    'Pune',
    category: 'Typography',
    image:    'assets/images/bridging-the-gap.png',
    slug:     'pune',
  },
  {
    title:    'Kalsubai',
    category: 'Architecture',
    image:    'assets/images/urban-horizons.png',
    slug:     'kalsubai',
  },
  {
    title:    'Varanasi',
    category: 'Landscape',
    image:    'assets/images/lost-trails.png',
    slug:     'varanasi',
  },
];

/* ── State ────────────────────────────────────────────────────── */

let locoScroll = null;

/* ── DOM Refs ─────────────────────────────────────────────────── */

const loaderEl     = document.getElementById('loader');
const heroSection  = document.getElementById('hero-section');
const workGrid     = document.getElementById('work-grid');
const scrollWrapper = document.querySelector('[data-scroll-container]');

/* ═══════════════════════════════════════════════════════════════
   1.  Locomotive Scroll + GSAP ScrollTrigger Integration
   ═══════════════════════════════════════════════════════════════ */

function initLocomotiveScroll() {
  if (!scrollWrapper) return;

  locoScroll = new LocomotiveScroll({
    el: scrollWrapper,
    smooth: true,
    multiplier: 0.85,
    lerp: 0.07,
    smartphone: { smooth: true, multiplier: 1.2 },
    tablet: { smooth: true, multiplier: 1.2 },
    getDirection: true,
    reloadOnContextChange: true,
  });

  // Sync Locomotive Scroll with GSAP ScrollTrigger
  locoScroll.on('scroll', ScrollTrigger.update);

  ScrollTrigger.scrollerProxy(scrollWrapper, {
    scrollTop(value) {
      return arguments.length
        ? locoScroll.scrollTo(value, { duration: 0, disableLerp: true })
        : locoScroll.scroll.instance.scroll.y;
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };
    },
    pinType: scrollWrapper.style.transform ? 'transform' : 'fixed',
  });

  ScrollTrigger.addEventListener('refresh', () => locoScroll.update());
  ScrollTrigger.defaults({ scroller: scrollWrapper });
}

function initScrollTrigger() {
  gsap.registerPlugin(ScrollTrigger);

  // Init Locomotive first
  initLocomotiveScroll();

  const scrollerEl = scrollWrapper || undefined;

  // Parallax effect on hero background image
  if (heroSection) {
    const heroBg = heroSection.querySelector('.hero-bg-image');
    if (heroBg) {
      gsap.to(heroBg, {
        y: '20%',
        scale: 1.1,
        scrollTrigger: {
          trigger: heroSection,
          scroller: scrollerEl,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }

    // Fade hero text out as user scrolls
    gsap.to('#hero-overlay', {
      opacity: 0,
      scrollTrigger: {
        trigger: heroSection,
        scroller: scrollerEl,
        start: 'top top',
        end: '+=60%',
        scrub: true,
      },
    });
  }

  // Animate About Section
  const aboutImage = document.querySelector('#about-image');
  if (aboutImage) {
    gsap.from('#about-image', {
      scale: 0.95,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '#about',
        scroller: scrollerEl,
        start: 'top 80%',
      },
    });
    
    gsap.from('#about-quote', {
      y: 50,
      opacity: 0,
      duration: 1.2,
      delay: 0.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '#about',
        scroller: scrollerEl,
        start: 'top 80%',
      },
    });

    gsap.from('#about-details', {
      y: 40,
      opacity: 0,
      duration: 1,
      delay: 0.4,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '#about',
        scroller: scrollerEl,
        start: 'top 80%',
      },
    });
  }

  // Animate work section in
  const workHeader = document.querySelector('.work-header');
  if (workHeader) {
    gsap.from('.work-header', {
      y: 60,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '#work',
        scroller: scrollerEl,
        start: 'top 85%',
      },
    });
  }

  const workGridEl = document.querySelector('#work-grid');
  if (workGridEl) {
    gsap.from('.project-card', {
      y: 80,
      opacity: 0,
      duration: 0.9,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '#work-grid',
        scroller: scrollerEl,
        start: 'top 85%',
      },
    });
  }

  // Footer entrance
  const footer = document.querySelector('.site-footer');
  if (footer) {
    gsap.from('.footer-inner', {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.site-footer',
        scroller: scrollerEl,
        start: 'top 90%',
      },
    });
  }

  // Refresh after a tick
  setTimeout(() => {
    ScrollTrigger.refresh();
    if (locoScroll) locoScroll.update();
  }, 500);
}

/* ═══════════════════════════════════════════════════════════════
   2.  Work Grid
   ═══════════════════════════════════════════════════════════════ */

function renderWorkGrid() {
  if (!workGrid) return;

  const arrowSVG = `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>`;

  workGrid.innerHTML = PROJECTS.map((p, i) => `
    <a href="project-${p.slug}.html" class="project-card-link" id="project-link-${i}" data-scroll data-scroll-speed="1">
      <article class="project-card" id="project-${i}">
        <div class="project-card-image-wrap">
          <img
            class="project-card-image"
            src="${p.image}"
            alt="${p.title} — ${p.category}"
            loading="lazy"
          />
        </div>
        <div class="project-card-info">
          <div>
            <h3 class="project-card-title">${p.title}</h3>
            <span class="project-card-category">${p.category}</span>
          </div>
          <span class="project-card-arrow">${arrowSVG}</span>
        </div>
      </article>
    </a>
  `).join('');
}

/* ═══════════════════════════════════════════════════════════════
   3.  Page Transitions
   ═══════════════════════════════════════════════════════════════ */

function initPageTransitions() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') ||
        href.startsWith('tel:') || href.startsWith('http') || href.startsWith('javascript:')) {
      return;
    }

    // Skip download links
    if (link.hasAttribute('download')) return;

    e.preventDefault();

    const overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.classList.add('active');
    });

    setTimeout(() => {
      cleanup();
      window.location.href = href;
    }, 450);
  });
}

/* ═══════════════════════════════════════════════════════════════
   4.  Contact Modal
   ═══════════════════════════════════════════════════════════════ */

function initContactModal() {
  const contactBtns = document.querySelectorAll('.contact-pill, #nav-contact');
  const modal = document.getElementById('contact-modal');
  const closeBtn = document.getElementById('contact-modal-close');

  if (!modal) return;

  const openModal = (e) => {
    e.preventDefault();
    modal.classList.add('active');
  };

  const closeModal = () => {
    modal.classList.remove('active');
  };

  contactBtns.forEach(btn => btn.addEventListener('click', openModal));
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  
  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

/* ═══════════════════════════════════════════════════════════════
   5.  Cleanup
   ═══════════════════════════════════════════════════════════════ */

function cleanup() {
  ScrollTrigger.getAll().forEach(t => t.kill());

  if (locoScroll) {
    locoScroll.destroy();
    locoScroll = null;
  }
}

/* ═══════════════════════════════════════════════════════════════
   6.  Init
   ═══════════════════════════════════════════════════════════════ */

(function main() {
  // Hide loader immediately (no more frame loading)
  if (loaderEl) loaderEl.classList.add('hidden');

  // Setup page transitions
  initPageTransitions();
  
  // Setup contact modal
  initContactModal();

  // Render work grid
  renderWorkGrid();

  // Init scroll system
  initScrollTrigger();

  // Cleanup on page unload
  window.addEventListener('beforeunload', cleanup);
  window.addEventListener('pagehide', cleanup);
})();
