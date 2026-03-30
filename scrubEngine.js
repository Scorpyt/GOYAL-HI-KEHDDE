/* ──────────────────────────────────────────────────────────────
   scrubEngine.js  –  High-performance image-sequence scrubber
   ────────────────────────────────────────────────────────────── */

export class ScrubEngine {
  /**
   * @param {Object} opts
   * @param {number}   opts.totalFrames   – total frame count (e.g. 190)
   * @param {string}   opts.basePath      – directory path  (e.g. './Model image/')
   * @param {string}   opts.prefix        – filename prefix (e.g. 'ezgif-frame-')
   * @param {string}   opts.ext           – extension        (e.g. '.jpg')
   * @param {number}  [opts.padLength=3]  – zero-pad digits
   * @param {number}  [opts.cacheSize=30] – max cached textures
   * @param {Function} [opts.onProgress]  – (loaded, total) => void
   */
  constructor(opts) {
    this.totalFrames = opts.totalFrames;
    this.basePath    = opts.basePath;
    this.prefix      = opts.prefix;
    this.ext         = opts.ext;
    this.padLength   = opts.padLength  ?? 3;
    this.cacheSize   = opts.cacheSize  ?? 30;
    this.onProgress  = opts.onProgress ?? (() => {});

    /** @type {HTMLImageElement[]} */
    this._images   = new Array(this.totalFrames);
    /** @type {Map<number, THREE.Texture>} */
    this._texCache = new Map();
    this._loaded   = 0;
    this._ready    = false;

    // fallback: plain canvas texture while loading
    this._fallbackTex = this._createFallback();
  }

  /* ── public ─────────────────────────────────────────────── */

  /** Preload every frame as an HTMLImageElement. Returns a Promise. */
  preload() {
    return new Promise((resolve) => {
      let loaded = 0;
      for (let i = 0; i < this.totalFrames; i++) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = this._framePath(i);

        img.onload = () => {
          loaded++;
          this.onProgress(loaded, this.totalFrames);
          if (loaded === this.totalFrames) {
            this._ready = true;
            resolve();
          }
        };

        img.onerror = () => {
          // Still count so we don't hang
          loaded++;
          this.onProgress(loaded, this.totalFrames);
          if (loaded === this.totalFrames) {
            this._ready = true;
            resolve();
          }
        };

        this._images[i] = img;
      }
    });
  }

  /**
   * Get the Three.js Texture for a given normalised progress (0–1).
   * Manages an LRU texture cache for memory efficiency.
   * @param {number} progress – 0 → 1
   * @returns {THREE.Texture}
   */
  getTexture(progress) {
    if (!this._ready) return this._fallbackTex;

    const idx = this._progressToIndex(progress);

    // cache hit
    if (this._texCache.has(idx)) return this._texCache.get(idx);

    // cache miss → create texture
    const img = this._images[idx];
    if (!img || !img.complete) return this._fallbackTex;

    const tex = new THREE.Texture(img);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.format    = THREE.RGBAFormat;
    tex.needsUpdate = true;

    // evict oldest if over budget
    if (this._texCache.size >= this.cacheSize) {
      const oldest = this._texCache.keys().next().value;
      const old    = this._texCache.get(oldest);
      old.dispose();
      this._texCache.delete(oldest);
    }

    this._texCache.set(idx, tex);
    return tex;
  }

  /** Clean up all GPU textures. */
  dispose() {
    this._texCache.forEach((t) => t.dispose());
    this._texCache.clear();
    if (this._fallbackTex) this._fallbackTex.dispose();
  }

  /* ── private ────────────────────────────────────────────── */

  _progressToIndex(p) {
    const clamped = Math.max(0, Math.min(1, p));
    return Math.min(
      Math.floor(clamped * this.totalFrames),
      this.totalFrames - 1
    );
  }

  _framePath(index) {
    // frames are 1-indexed:  ezgif-frame-001.jpg … ezgif-frame-190.jpg
    const num = String(index + 1).padStart(this.padLength, '0');
    return `${this.basePath}${this.prefix}${num}${this.ext}`;
  }

  _createFallback() {
    const c   = document.createElement('canvas');
    c.width   = 4;
    c.height  = 4;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#0B0B0D';
    ctx.fillRect(0, 0, 4, 4);

    const tex = new THREE.Texture(c);
    tex.needsUpdate = true;
    return tex;
  }
}
