/* ──────────────────────────────────────────────────────────────
   tunnelShader.js  –  Custom GLSL for the mouth-tunnel zoom
   ────────────────────────────────────────────────────────────── */

export const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fragmentShader = /* glsl */ `
  precision highp float;

  uniform sampler2D uTexture;
  uniform float     uProgress;   // 0 → 1 scroll progress
  uniform float     uDistortion; // base distortion strength
  uniform vec2      uResolution; // viewport resolution

  varying vec2 vUv;

  /* ── barrel / pincushion distortion ────────────────────────── */
  vec2 barrelDistort(vec2 uv, float strength) {
    vec2 center = vec2(0.5, 0.51);          // focal point on face
    vec2 delta  = uv - center;
    float r2    = dot(delta, delta);
    float r4    = r2 * r2;
    // k1 = barrel, k2 = higher-order refinement
    float k1 = strength;
    float k2 = strength * 0.35;
    vec2 distorted = center + delta * (1.0 + k1 * r2 + k2 * r4);
    return distorted;
  }

  /* ── subtle chromatic aberration ──────────────────────────── */
  vec3 chromaticSample(vec2 uv, float spread) {
    float r = texture2D(uTexture, barrelDistort(uv, spread *  1.02)).r;
    float g = texture2D(uTexture, barrelDistort(uv, spread *  1.00)).g;
    float b = texture2D(uTexture, barrelDistort(uv, spread *  0.98)).b;
    return vec3(r, g, b);
  }

  void main() {
    // Ramp distortion with scroll progress
    float dynamicStrength = uDistortion * (0.15 + uProgress * 0.85);

    // Aspect-ratio–corrected UVs for distortion
    vec2 uv = vUv;

    // Main colour with subtle chromatic aberration
    vec3 color = chromaticSample(uv, dynamicStrength);

    // ── Vignette ───────────────────────────────────────────────
    vec2 vigUv = vUv * (1.0 - vUv);               // parabolic mask
    float vig  = vigUv.x * vigUv.y * 16.0;         // normalise 0→1
    vig = pow(vig, 0.18 + uProgress * 0.08);       // soften with scroll

    color *= mix(0.82, 1.0, vig);                  // darken edges

    // ── Subtle film grain ──────────────────────────────────────
    float grain = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453);
    color += (grain - 0.5) * 0.03;

    gl_FragColor = vec4(color, 1.0);
  }
`;
