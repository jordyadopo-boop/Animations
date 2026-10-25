// Monde sous-marin de « POUF ! » : fond de sable avec caustiques animées, rayons de lumière,
// neige marine, bulles, algues qui ondulent, coraux, anémones, rochers.
import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

export const PALETTE = {
  deep: 0x0a3d6b, mid: 0x1a7fb5, top: 0x7fe0ff, fog: 0x1b77a8,
  sand: 0xf2d9a0, rock: 0x7d6f8f, kelp: 0x5a9a35, kelpDark: 0x3d7424,
};

// Horloge partagée par tous les shaders (caustiques, rayons, surface)
export const U = { uTime: { value: 0 } };

export function floorHeight(x, z) {
  const g = (cx, cz, a, s) => a * Math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / (2 * s * s));
  return g(-7, -6, 2.2, 3.5) + g(8, -9, 3, 4) + g(0, -16, 4, 6) + 0.08 * Math.sin(x * 0.9 + z * 0.5) + 0.05 * Math.sin(x * 2.1 - z * 1.7);
}

// Ajoute des caustiques (reflets de vagues) sur les surfaces éclairées d'en haut
export function causticMaterial(params, strength = 0.55) {
  const m = new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0, ...params });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = U.uTime;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWPos; varying vec3 vWNorm;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWPos = (modelMatrix * vec4(transformed,1.0)).xyz; vWNorm = normalize(mat3(modelMatrix) * objectNormal);');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
      varying vec3 vWPos; varying vec3 vWNorm; uniform float uTime;
      float cau(vec2 p){ float t = uTime;
        vec2 q = p + vec2(sin(p.y*1.7 + t*0.9), cos(p.x*1.3 - t*0.8)) * 0.6;
        float v = sin(q.x*3.1 + t) * sin(q.y*2.9 - t*1.1) + 0.5 * sin((q.x + q.y)*4.7 + t*1.7);
        return pow(clamp(1.0 - abs(v), 0.0, 1.0), 6.0); }`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        float up = clamp(vWNorm.y, 0.0, 1.0);
        float cv = cau(vWPos.xz * 0.9) ;
        totalEmissiveRadiance += vec3(0.75, 0.95, 1.0) * cv * ${strength.toFixed(2)} * up * clamp(1.0 - (vWPos.y - 0.0) * 0.02, 0.3, 1.0);`);
  };
  return m;
}

function waterBackground(scene) {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { deep: { value: new THREE.Color(PALETTE.deep) }, mid: { value: new THREE.Color(PALETTE.mid) }, top: { value: new THREE.Color(PALETTE.top) } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform vec3 deep, mid, top; varying vec3 vP;
      void main(){ float y = vP.y; vec3 c = y < 0.0 ? mix(mid, deep, clamp(-y*2.2,0.0,1.0)) : mix(mid, top, pow(clamp(y*1.3,0.0,1.0),1.4)); gl_FragColor = vec4(c,1.0); }`,
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(300, 32, 16), mat); m.renderOrder = -1; scene.add(m);
}

// Surface de l'eau vue d'en dessous (miroitement)
function surface(scene) {
  const mat = new THREE.ShaderMaterial({
    side: THREE.DoubleSide, transparent: true, depthWrite: false, fog: false, uniforms: { uTime: U.uTime },
    vertexShader: 'varying vec2 vUv; varying vec3 vW; void main(){ vUv = uv; vW = (modelMatrix*vec4(position,1.0)).xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform float uTime; varying vec3 vW;
      void main(){ vec2 p = vW.xz*0.25; float w = sin(p.x*3.0+uTime*1.3)*sin(p.y*2.7-uTime)+0.5*sin(p.x*7.0-p.y*5.0+uTime*2.0);
        float d = length(vW.xz)/120.0; vec3 c = mix(vec3(0.75,0.97,1.0), vec3(0.3,0.75,0.95), 0.5+0.5*w);
        gl_FragColor = vec4(c, (0.85 - d*0.6)); }`,
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(400, 400, 1, 1), mat); m.rotation.x = Math.PI / 2; m.position.y = 16; scene.add(m);
}

// Rayons de lumière (god rays) : cônes additifs qui ondulent
function godRays(scene) {
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false, uniforms: { uTime: U.uTime },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform float uTime; varying vec2 vUv;
      void main(){ float a = pow(vUv.y, 1.6) * (0.5 + 0.5*sin(vUv.x*40.0 + uTime*0.7)) * (0.6+0.4*sin(uTime*0.9 + vUv.x*13.0));
        float edge = smoothstep(0.0,0.3,vUv.x)*smoothstep(1.0,0.7,vUv.x);
        gl_FragColor = vec4(vec3(0.75,0.95,1.0), a * 0.11); }`,
  });
  const rays = [];
  for (let i = 0; i < 9; i++) {
    const r = new THREE.Mesh(new THREE.CylinderGeometry(1.4 + (i % 3), 0.4, 26, 24, 1, true), mat);
    r.position.set(-14 + i * 3.6, 4, -6 - (i % 4) * 3); r.rotation.z = 0.32; r.rotation.x = -0.1; r.userData.p = i * 1.7;
    scene.add(r); rays.push(r);
  }
  return (t) => rays.forEach((r) => { r.rotation.z = 0.32 + Math.sin(t * 0.3 + r.userData.p) * 0.05; });
}

// Neige marine : particules en suspension qui dérivent
function marineSnow(scene) {
  const n = 1500, pos = new Float32Array(n * 3), base = [];
  for (let i = 0; i < n; i++) { base.push([(Math.random() - 0.5) * 50, Math.random() * 14, (Math.random() - 0.5) * 40 - 4, Math.random() * 6.28]); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const c = document.createElement('canvas'); c.width = c.height = 32; const g = c.getContext('2d');
  const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32);
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.06, map: new THREE.CanvasTexture(c), transparent: true, opacity: 0.7, depthWrite: false, color: 0xd8f4ff }));
  scene.add(pts);
  return (t) => { base.forEach(([x, y, z, p], i) => { pos[i * 3] = x + Math.sin(t * 0.3 + p) * 0.4; pos[i * 3 + 1] = ((y + t * 0.08 + Math.sin(t * 0.5 + p) * 0.2) % 14); pos[i * 3 + 2] = z; }); geo.attributes.position.needsUpdate = true; };
}

// Algue géante : chaîne de segments qui ondulent (rotation cumulée)
export function makeKelp(h = 6, seed = 1) {
  const root = new THREE.Group(); const segs = []; const n = Math.round(h / 0.45);
  const mat = causticMaterial({ color: 0x7a8f2a, roughness: 0.6 }, 0.3), leafMat = causticMaterial({ color: 0x8aa83a, roughness: 0.55, side: THREE.DoubleSide }, 0.3);
  let parent = root;
  for (let i = 0; i < n; i++) {
    const s = new THREE.Group(); s.position.y = i ? 0.45 : 0; parent.add(s);
    const stem = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.4, 4, 6), mat); stem.position.y = 0.22; s.add(stem);
    if (i > 0) { const side = i % 2 ? 1 : -1; const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 8), leafMat); leaf.scale.set(0.38, 1.9, 0.05); leaf.position.set(side * 0.3, 0.35, 0); leaf.rotation.set(0, i * 0.9, side * -0.85); leaf.castShadow = true; s.add(leaf); }
    segs.push(s); parent = s;
  }
  root.userData.update = (t, push = 0) => segs.forEach((s, i) => { s.rotation.z = Math.sin(t * 1.1 + i * 0.45 + seed) * 0.08 + push * 0.1; s.rotation.x = Math.sin(t * 0.8 + i * 0.3 + seed * 2) * 0.05; });
  return root;
}

export function makeRock(size = 1, color = PALETTE.rock, seed = 1) {
  const geo = mergeVertices(new THREE.IcosahedronGeometry(size, 4)); const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const v = new THREE.Vector3().fromBufferAttribute(p, i); const k = 1 + 0.18 * Math.sin(v.x * 3 + seed) * Math.sin(v.y * 4 + seed * 2) * Math.cos(v.z * 3.5); v.multiplyScalar(k); v.y *= 0.7; p.setXYZ(i, v.x, v.y, v.z); }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, causticMaterial({ color, roughness: 0.95 })); m.castShadow = m.receiveShadow = true; return m;
}

// Corail branchu
export function makeCoral(color = 0xff7a59, seed = 3, scale = 1) {
  const g = new THREE.Group(); const mat = causticMaterial({ color, roughness: 0.7 }, 0.4);
  let s = seed; const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const branch = (parent, len, r, depth) => {
    const b = new THREE.Group(); parent.add(b);
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 4, 8), mat); m.position.y = len / 2; m.castShadow = true; b.add(m);
    if (depth > 0) for (let i = 0; i < 2 + (rnd() > 0.5 ? 1 : 0); i++) { const c = branch(b, len * 0.75, r * 0.75, depth - 1); c.position.y = len * (0.6 + rnd() * 0.4); c.rotation.set((rnd() - 0.5) * 1.2, rnd() * 6, (rnd() - 0.5) * 1.4); }
    else { const tip = new THREE.Mesh(new THREE.SphereGeometry(r * 1.3, 8, 6), mat); tip.position.y = len; b.add(tip); }
    return b;
  };
  branch(g, 0.5 * scale, 0.07 * scale, 3);
  return g;
}

// Corail-cerveau (boule bosselée)
export function makeBrainCoral(r = 0.8, color = 0xc77dff) {
  const geo = new THREE.SphereGeometry(r, 48, 32); const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const v = new THREE.Vector3().fromBufferAttribute(p, i); const k = 1 + 0.05 * Math.sin(v.x * 14 + Math.sin(v.z * 9) * 2) * Math.sin(v.z * 12); v.multiplyScalar(k); if (v.y < 0) v.y *= 0.3; p.setXYZ(i, v.x, v.y, v.z); }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, causticMaterial({ color, roughness: 0.8 })); m.castShadow = m.receiveShadow = true; return m;
}

// Anémone : tentacules qui ondulent
export function makeAnemone(color = 0xff5fa2, n = 26) {
  const g = new THREE.Group(); const mat = causticMaterial({ color, roughness: 0.5 }, 0.3);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.32, 0.25, 16), causticMaterial({ color: 0x9a3a6b })); base.position.y = 0.12; g.add(base);
  const tent = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 * 2.6, r = 0.08 + (i / n) * 0.16;
    const t = new THREE.Group(); t.position.set(Math.cos(a) * r, 0.24, Math.sin(a) * r); g.add(t);
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.35, 4, 6), mat); m.position.y = 0.2; t.add(m);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), causticMaterial({ color: 0xffd1e8 })); tip.position.y = 0.4; t.add(tip);
    t.userData = { a, p: i * 0.7 }; tent.push(t);
  }
  g.userData.update = (t, shut = 0) => tent.forEach((x) => { const out = 0.35 + Math.sin(t * 1.6 + x.userData.p) * 0.12; x.rotation.set(Math.sin(x.userData.a) * out * (1 - shut), 0, -Math.cos(x.userData.a) * out * (1 - shut)); x.scale.y = 1 - shut * 0.6; });
  return g;
}

export function makeStarfish(color = 0xff8a3d) {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) { const r = i % 2 ? 0.08 : 0.22, a = (i / 10) * Math.PI * 2; i ? shape.lineTo(Math.cos(a) * r, Math.sin(a) * r) : shape.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
  const m = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.04, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 3 }), causticMaterial({ color }));
  m.rotation.x = -Math.PI / 2; m.castShadow = true; return m;
}

// Bulles : sphères brillantes ; spawn(t0, x, y, z, n) -> positions calculées à partir de t
export function createBubbles(scene, max = 120) {
  const mat = new THREE.MeshStandardMaterial({ color: 0xe6fbff, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.55, emissive: 0x6fd6ff, emissiveIntensity: 0.25 });
  const geo = new THREE.SphereGeometry(1, 12, 10);
  const pool = []; for (let i = 0; i < max; i++) { const m = new THREE.Mesh(geo, mat); m.visible = false; scene.add(m); pool.push(m); }
  const emitters = [];
  const add = (t0, pos, n = 8, spread = 0.2, size = 0.05, life = 2.5) => emitters.push({ t0, pos, n, spread, size, life });
  const update = (t) => {
    let k = 0;
    pool.forEach((m) => (m.visible = false));
    for (const e of emitters) {
      for (let i = 0; i < e.n && k < max; i++) {
        const dt = t - e.t0 - i * 0.04; if (dt < 0 || dt > e.life) continue;
        const m = pool[k++]; const ph = i * 2.39;
        const p = typeof e.pos === 'function' ? e.pos(e.t0 + i * 0.04) : e.pos;
        m.visible = true; const s = e.size * (0.5 + ((i * 7) % 5) / 5) * (1 + dt * 0.3);
        m.scale.setScalar(s); m.position.set(p[0] + Math.sin(ph) * e.spread + Math.sin(dt * 6 + ph) * 0.05, p[1] + dt * (0.9 + (i % 3) * 0.25), p[2] + Math.cos(ph) * e.spread);
      }
    }
  };
  return { add, update };
}

export function createOcean(canvas, width, height) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(width, height, false);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(PALETTE.fog, 0.045);
  waterBackground(scene); surface(scene);
  const rays = godRays(scene), snow = marineSnow(scene);

  scene.add(new THREE.HemisphereLight(0x9fe8ff, 0x1d4f7a, 1.5));
  const sun = new THREE.DirectionalLight(0xe8fbff, 2.2);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 1, far: 50 });
  sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.03; sun.shadow.radius = 5;
  scene.add(sun, sun.target);
  // contre-jour bleuté pour détacher les silhouettes
  const rim = new THREE.DirectionalLight(0x66ccff, 0.9); rim.position.set(3, 4, -8); scene.add(rim);

  const geo = new THREE.PlaneGeometry(200, 200, 200, 200); geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setY(i, floorHeight(pos.getX(i), pos.getZ(i)));
  geo.computeVertexNormals();
  const floor = new THREE.Mesh(geo, causticMaterial({ color: PALETTE.sand, roughness: 1 }, 0.8)); floor.receiveShadow = true; scene.add(floor);

  const camera = new THREE.PerspectiveCamera(42, width / height, 0.05, 500);
  const look = new THREE.Vector3();
  const setCamera = ({ pos, target, fov = 42, roll = 0 }) => {
    camera.fov = fov; camera.updateProjectionMatrix();
    camera.position.set(...pos); look.set(...target); camera.up.set(Math.sin(roll), Math.cos(roll), 0); camera.lookAt(look);
  };
  const animated = [];
  const update = (t) => { U.uTime.value = t; rays(t); snow(t); animated.forEach((f) => f(t)); };
  const focusShadow = (x, z) => { sun.position.set(x + 3, 18, z + 5); sun.target.position.set(x, 0, z); };
  focusShadow(0, 0);
  return { THREE, renderer, scene, camera, setCamera, update, focusShadow, animated };
}
