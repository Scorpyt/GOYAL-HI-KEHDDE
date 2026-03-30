/* ═══════════════════════════════════════════════════════════════
   main.js  –  Maya Portfolio · Entry Point
   ═══════════════════════════════════════════════════════════════ */

import { ScrubEngine }                    from './scrubEngine.js';
import { vertexShader, fragmentShader }   from './tunnelShader.js';

/* ── Configuration ────────────────────────────────────────────── */

const PROJECTS = [
  {
    title:    'Transcendence',
    category: 'Creative Direction',
    image:    'assets/images/transcendence.png',
    slug:     'transcendence',
  },
  {
    title:    'Notice Everything',
    category: 'Brand Identity',
    image:    'assets/images/notice-everything.png',
    slug:     'notice-everything',
  },
  {
    title:    'Saint Petersburg',
    category: 'Editorial Design',
    image:    'assets/images/saint-petersburg.png',
    slug:     'saint-petersburg',
  },
  {
    title:    'Bridging the Gap',
    category: 'Typography',
    image:    'assets/images/bridging-the-gap.png',
    slug:     'bridging-the-gap',
  },
  {
    title:    'Urban Horizons',
    category: 'Architecture',
    image:    'assets/images/urban-horizons.png',
    slug:     'urban-horizons',
  },
  {
    title:    'Lost Trails',
    category: 'Landscape',
    image:    'assets/images/lost-trails.png',
    slug:     'lost-trails',
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

/* ── DOM Refs ─────────────────────────────────────────────────── */

const canvas       = document.getElementById('hero-canvas');
const loaderEl     = document.getElementById('loader');
const loaderBar    = document.getElementById('loader-bar');
const heroSection  = document.getElementById('hero-section');
const workGrid     = document.getElementById('work-grid');

/* ═══════════════════════════════════════════════════════════════
   1.  Three.js Setup
   ═══════════════════════════════════════════════════════════════ */

function initThree() {
  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x0B0B0D, 1);

  // Scene + Camera
  scene  = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  // Shader Material
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

  // Fullscreen plane
  const geo = new THREE.PlaneGeometry(2, 2);
  planeMesh = new THREE.Mesh(geo, shaderMaterial);
  scene.add(planeMesh);
}

/* ═══════════════════════════════════════════════════════════════
   2.  Image Sequence / ScrubEngine
   ═══════════════════════════════════════════════════════════════ */

async function initScrubber() {
  scrubber = new ScrubEngine({
    ...FRAME_CONFIG,
    onProgress(loaded, total) {
      const pct = (loaded / total) * 100;
      if (loaderBar) loaderBar.style.width = `${pct}%`;
    },
  });

  await scrubber.preload();

  // Apply first frame immediately
  const firstTex = scrubber.getTexture(0);
  shaderMaterial.uniforms.uTexture.value = firstTex;

  // Hide loader
  if (loaderEl) loaderEl.classList.add('hidden');
  isReady = true;
}

/* ═══════════════════════════════════════════════════════════════
   3.  GSAP ScrollTrigger
   ═══════════════════════════════════════════════════════════════ */

function initScrollTrigger() {
  gsap.registerPlugin(ScrollTrigger);

  // Pin the hero and scrub the image sequence
  ScrollTrigger.create({
    trigger: heroSection,
    start:   'top top',
    end:     '+=150%',          // 1.5× viewport scrub length
    pin:     true,
    scrub:   0.6,               // smooth 0.6s lag
    onUpdate(self) {
      scrollProgress = self.progress;
    },
  });

  // Fade hero text out as user scrolls
  gsap.to('#hero-overlay', {
    opacity: 0,
    scrollTrigger: {
      trigger: heroSection,
      start:  'top top',
      end:    '+=60%',
      scrub:  true,
    },
  });

  // Animate work section in
  gsap.from('.work-header', {
    y: 60,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '#work',
      start: 'top 85%',
    },
  });

  gsap.from('.project-card', {
    y: 80,
    opacity: 0,
    duration: 0.9,
    stagger: 0.15,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '#work-grid',
      start: 'top 85%',
    },
  });

  // Footer entrance
  gsap.from('.footer-inner', {
    y: 40,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.site-footer',
      start: 'top 90%',
    },
  });
}

/* ═══════════════════════════════════════════════════════════════
   4.  Render Loop
   ═══════════════════════════════════════════════════════════════ */

function render() {
  raf = requestAnimationFrame(render);

  if (!isReady) return;

  // Update texture from scrubber
  const tex = scrubber.getTexture(scrollProgress);
  if (tex) shaderMaterial.uniforms.uTexture.value = tex;

  // Update shader uniforms
  shaderMaterial.uniforms.uProgress.value = scrollProgress;

  renderer.render(scene, camera);
}

/* ═══════════════════════════════════════════════════════════════
   5.  Work Grid
   ═══════════════════════════════════════════════════════════════ */

function renderWorkGrid() {
  const arrowSVG = `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>`;

  workGrid.innerHTML = PROJECTS.map((p, i) => `
    <a href="project-${p.slug}.html" class="project-card-link" id="project-link-${i}">
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
   6.  Resize Handler
   ═══════════════════════════════════════════════════════════════ */

function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  renderer.setSize(w, h);
  shaderMaterial.uniforms.uResolution.value.set(w, h);
}

/* ═══════════════════════════════════════════════════════════════
   7.  Init
   ═══════════════════════════════════════════════════════════════ */

(async function main() {
  renderWorkGrid();
  initThree();
  await initScrubber();
  initScrollTrigger();
  render();

  window.addEventListener('resize', onResize);
})();
