/* ═══════════════════════════════════════════════════════════════
   main.js  –  Travel Shutter Portfolio · Entry Point
   Locomotive Scroll + GSAP ScrollTrigger + Three.js
   ═══════════════════════════════════════════════════════════════ */

import { ScrubEngine }                    from './scrubEngine.js';
import { vertexShader, fragmentShader }   from './tunnelShader.js';

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

const FRAME_CONFIG = {
  totalFrames: 190,
  basePath:    './Model image/',
  prefix:      'ezgif-frame-',
  ext:         '.jpg',
  padLength:   3,
  cacheSize:   40,
};

/* ── State ────────────────────────────────────────────────────── */

let renderer, scene, camera, planeMesh, shaderMaterial;
let scrubber;
let scrollProgress = 0;
let raf;
let isReady = false;
let locoScroll = null;

/* ── DOM Refs ─────────────────────────────────────────────────── */

const canvas       = document.getElementById('hero-canvas');
const loaderEl     = document.getElementById('loader');
const loaderBar    = document.getElementById('loader-bar');
const heroSection  = document.getElementById('hero-section');
const workGrid     = document.getElementById('work-grid');
const scrollWrapper = document.querySelector('[data-scroll-container]');

/* ═══════════════════════════════════════════════════════════════
   1.  Three.js Setup (with error handling)
   ═══════════════════════════════════════════════════════════════ */

function initThree() {
  if (!canvas) {
    console.warn('Hero canvas not found, skipping Three.js init');
    return false;
  }

  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x0B0B0D, 1);

    scene  = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTexture:    { value: null },
        uProgress:   { value: 0 },
        uDistortion: { value: 0.12 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      },
      vertexShader,
      fragmentShader,
      depthTest:  false,
      depthWrite: false,
    });

    const geo = new THREE.PlaneGeometry(2, 2);
    planeMesh = new THREE.Mesh(geo, shaderMaterial);
    scene.add(planeMesh);

    return true;
  } catch (e) {
    console.error('WebGL initialization failed:', e);
    if (canvas) canvas.style.display = 'none';
    return false;
  }
}

/* ═══════════════════════════════════════════════════════════════
   2.  Image Sequence / ScrubEngine (with timeout)
   ═══════════════════════════════════════════════════════════════ */

async function initScrubber() {
  if (!shaderMaterial) return;

  scrubber = new ScrubEngine({
    ...FRAME_CONFIG,
    onProgress(loaded, total) {
      const pct = (loaded / total) * 100;
      if (loaderBar) loaderBar.style.width = `${pct}%`;
    },
  });

  // Add a timeout to prevent infinite hang
  const LOAD_TIMEOUT = 20000; // 20 seconds max
  try {
    await Promise.race([
      scrubber.preload(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Frame loading timeout')), LOAD_TIMEOUT)
      ),
    ]);
  } catch (e) {
    console.warn('Scrubber preload issue:', e.message);
  }

  // Apply first frame
  const firstTex = scrubber.getTexture(0);
  if (firstTex) shaderMaterial.uniforms.uTexture.value = firstTex;

  // Hide loader
  if (loaderEl) loaderEl.classList.add('hidden');
  isReady = true;
}

/* ═══════════════════════════════════════════════════════════════
   3.  Locomotive Scroll + GSAP ScrollTrigger Integration
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

  // Refresh both on update
  ScrollTrigger.addEventListener('refresh', () => locoScroll.update());
  ScrollTrigger.defaults({ scroller: scrollWrapper });
}

function initScrollTrigger() {
  gsap.registerPlugin(ScrollTrigger);

  // First init Locomotive
  initLocomotiveScroll();

  const scrollerEl = scrollWrapper || undefined;

  // Pin the hero and scrub the image sequence
  if (heroSection) {
    ScrollTrigger.create({
      trigger: heroSection,
      scroller: scrollerEl,
      start:   'top top',
      end:     '+=150%',
      pin:     true,
      pinSpacing: false,
      scrub:   0.6,
      onUpdate(self) {
        scrollProgress = self.progress;
      },
    });

    // Fade hero text out as user scrolls
    gsap.to('#hero-overlay', {
      opacity: 0,
      scrollTrigger: {
        trigger: heroSection,
        scroller: scrollerEl,
        start:  'top top',
        end:    '+=60%',
        scrub:  true,
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

  // Refresh ScrollTrigger after a tick so Loco sizes are settled
  setTimeout(() => {
    ScrollTrigger.refresh();
    if (locoScroll) locoScroll.update();
  }, 500);
}

/* ═══════════════════════════════════════════════════════════════
   4.  Render Loop
   ═══════════════════════════════════════════════════════════════ */

function render() {
  raf = requestAnimationFrame(render);

  if (!isReady || !scrubber || !shaderMaterial || !renderer) return;

  const tex = scrubber.getTexture(scrollProgress);
  if (tex) shaderMaterial.uniforms.uTexture.value = tex;

  shaderMaterial.uniforms.uProgress.value = scrollProgress;

  renderer.render(scene, camera);
}

/* ═══════════════════════════════════════════════════════════════
   5.  Work Grid
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
   6.  Page Transition (smooth fade-out before navigate)
   ═══════════════════════════════════════════════════════════════ */

function initPageTransitions() {
  // Intercept all internal links for a smooth fade-out transition
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href');
    // Skip external links, anchors, mailto, tel
    if (!href || href.startsWith('#') || href.startsWith('mailto:') ||
        href.startsWith('tel:') || href.startsWith('http') || href.startsWith('javascript:')) {
      return;
    }

    e.preventDefault();

    // Create transition overlay
    const overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    document.body.appendChild(overlay);

    // Trigger the transition
    requestAnimationFrame(() => {
      overlay.classList.add('active');
    });

    // Cleanup WebGL before navigating
    setTimeout(() => {
      cleanup();
      window.location.href = href;
    }, 450);
  });
}

/* ═══════════════════════════════════════════════════════════════
   7.  Cleanup (prevent memory leaks)
   ═══════════════════════════════════════════════════════════════ */

function cleanup() {
  // Cancel render loop
  if (raf) cancelAnimationFrame(raf);

  // Dispose scrubber textures
  if (scrubber) scrubber.dispose();

  // Dispose Three.js
  if (renderer) {
    renderer.dispose();
    renderer.forceContextLoss();
    renderer = null;
  }
  if (shaderMaterial) {
    shaderMaterial.dispose();
    shaderMaterial = null;
  }
  if (planeMesh) {
    if (planeMesh.geometry) planeMesh.geometry.dispose();
    planeMesh = null;
  }

  // Kill ScrollTrigger instances
  ScrollTrigger.getAll().forEach(t => t.kill());

  // Destroy Locomotive Scroll
  if (locoScroll) {
    locoScroll.destroy();
    locoScroll = null;
  }

  // Remove resize listener
  window.removeEventListener('resize', onResize);
}

/* ═══════════════════════════════════════════════════════════════
   8.  Resize Handler
   ═══════════════════════════════════════════════════════════════ */

function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  if (renderer) {
    renderer.setSize(w, h);
  }
  if (shaderMaterial) {
    shaderMaterial.uniforms.uResolution.value.set(w, h);
  }
}

/* ═══════════════════════════════════════════════════════════════
   9.  Init
   ═══════════════════════════════════════════════════════════════ */

(async function main() {
  // Setup page transitions
  initPageTransitions();

  // Render work grid
  renderWorkGrid();

  // Try Three.js init
  const threeOK = initThree();

  if (threeOK) {
    await initScrubber();
    render();
  } else {
    // Still hide the loader even if WebGL failed
    if (loaderEl) loaderEl.classList.add('hidden');
  }

  // Init scroll system
  initScrollTrigger();

  // Resize handler
  window.addEventListener('resize', onResize);

  // Cleanup on page unload
  window.addEventListener('beforeunload', cleanup);
  window.addEventListener('pagehide', cleanup);
})();
