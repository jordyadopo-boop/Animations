// La Canopée des Géants : arbres immenses au-dessus d'une mer de nuages.
// Ciel dégradé + soleil, mer de nuages instanciée, troncs à écorce rouge-orangé, houppiers, branches, trou d'arbre.
import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export const PALETTE = {
  skyTop: 0x2a6fdc, skyHorizon: 0xcfe9ff, haze: 0xbcdcf5,
  bark: 0xb5562e, barkDark: 0x7a3519, leaf: 0x4fa83a, leafDark: 0x2f7d2a, leafLight: 0x8fd14f,
  cloud: 0xffffff, cloudShade: 0xc9d9f0,
};

export const mat = (color, roughness = 0.85, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, ...extra });

let seed = 7;
const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);

// Écorce procédurale : carte de hauteur (crevasses verticales + plaques) -> couleur + relief (normal map)
function barkMaps() {
  const W = 512, H = 1024, hgt = new Float32Array(W * H);
  const n2 = (x, y) => { const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; return s - Math.floor(s); };
  // bruit de valeur périodique (px, py cellules) -> texture raccordable
  const pn = (x, y, px, py) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi; const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const X0 = ((xi % px) + px) % px, X1 = (X0 + 1) % px, Y0 = ((yi % py) + py) % py, Y1 = (Y0 + 1) % py;
    const a = n2(X0, Y0), b = n2(X1, Y0), c = n2(X0, Y1), d = n2(X1, Y1); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; };
  const fbm = (x, y, px, py, o = 4) => { let s = 0, amp = 0.5, f = 1; for (let i = 0; i < o; i++) { s += amp * pn(x * f, y * f, px * f, py * f); amp *= 0.5; f *= 2; } return s; };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const u = x / W, v = y / H;
    // fibres verticales : beaucoup de cellules en x, peu en y ; légère torsion
    const warp = (fbm(u * 6, v * 6, 6, 6, 2) - 0.5) * 1.2;
    const fib = fbm(u * 24 + warp, v * 3, 24, 3, 4);
    const ridged = 1 - Math.abs(fib * 2 - 1);                // crêtes fines
    const crack = Math.pow(ridged, 3.5);                      // crevasses profondes entre les plaques
    const plates = fbm(u * 10, v * 5, 10, 5, 3);
    const grain = pn(u * 128, v * 24, 128, 24) * 0.12;
    hgt[y * W + x] = Math.min(1, (1 - crack) * (0.55 + plates * 0.55) + grain);
  }
  const col = document.createElement('canvas'); col.width = W; col.height = H; const cg = col.getContext('2d'); const ci = cg.createImageData(W, H);
  const nor = document.createElement('canvas'); nor.width = W; nor.height = H; const ng = nor.getContext('2d'); const ni = ng.createImageData(W, H);
  const at = (x, y) => hgt[((y + H) % H) * W + ((x + W) % W)];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const h = at(x, y), i = (y * W + x) * 4;
    const moss = Math.max(0, fbm(x / W * 4, y / H * 2, 4, 2, 3) - 0.6) * 2.2 * (1 - h);
    const tone = 0.35 + h * 0.75 + (n2(x, y) - 0.5) * 0.08;
    ci.data[i] = Math.min(255, (178 * tone) * (1 - moss) + 95 * moss); ci.data[i + 1] = Math.min(255, (86 * tone) * (1 - moss) + 130 * moss); ci.data[i + 2] = Math.min(255, (48 * tone) * (1 - moss) + 55 * moss); ci.data[i + 3] = 255;
    const dx = (at(x + 1, y) - at(x - 1, y)) * 4.0, dy = (at(x, y + 1) - at(x, y - 1)) * 4.0;
    const l = Math.hypot(dx, dy, 1);
    ni.data[i] = (-dx / l * 0.5 + 0.5) * 255; ni.data[i + 1] = (dy / l * 0.5 + 0.5) * 255; ni.data[i + 2] = (1 / l * 0.5 + 0.5) * 255; ni.data[i + 3] = 255;
  }
  cg.putImageData(ci, 0, 0); ng.putImageData(ni, 0, 0);
  const map = new THREE.CanvasTexture(col); map.colorSpace = THREE.SRGBColorSpace; const normalMap = new THREE.CanvasTexture(nor);
  [map, normalMap].forEach((t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; });
  return { map, normalMap };
}
let BARK; const barkMat = () => (BARK ||= new THREE.MeshStandardMaterial({ ...barkMaps(), normalScale: new THREE.Vector2(1.6, 1.6), roughness: 0.92, color: 0xffffff }));

// Tronc géant légèrement noueux. bottom/top en y, rayon r.
export function makeTrunk(r = 1.5, bottom = -20, top = 40, s = 1) {
  const h = top - bottom;
  const geo = new THREE.CylinderGeometry(r * 0.82, r * 1.15, h, 40, Math.round(h * 1.5), true);
  const p = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(z, x);
    const k = 1 + 0.05 * Math.sin(a * 7 + y * 0.3 + s) + 0.04 * Math.sin(a * 3 - y * 0.5 + s * 2);
    p.setXYZ(i, x * k + Math.sin(y * 0.05 + s) * 0.3, y, z * k);
    uv.setXY(i, uv.getX(i) * 4, uv.getY(i) * h / 5);
  }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, barkMat()); m.position.y = bottom + h / 2; m.castShadow = m.receiveShadow = true;
  return m;
}

// Texture de feuille (forme pointue, nervures, bord plus clair) avec transparence
let LEAF;
function leafMaterial() {
  if (LEAF) return LEAF;
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  g.translate(64, 64); g.rotate(-Math.PI / 4);
  const grad = g.createLinearGradient(-50, 0, 50, 0); grad.addColorStop(0, '#3f8a2a'); grad.addColorStop(1, '#7cc24a');
  g.fillStyle = grad; g.beginPath(); g.moveTo(-58, 0); g.quadraticCurveTo(-10, -34, 58, 0); g.quadraticCurveTo(-10, 34, -58, 0); g.fill();
  g.strokeStyle = 'rgba(210,240,150,0.55)'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(-56, 0); g.lineTo(54, 0); g.stroke();
  g.lineWidth = 1.2; for (let i = -40; i < 45; i += 13) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 12, -15); g.moveTo(i, 0); g.lineTo(i + 12, 15); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  LEAF = new THREE.MeshStandardMaterial({ map: t, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.7 });
  return LEAF;
}
const LEAF_GEO = new THREE.PlaneGeometry(1, 1);

// Amas de feuilles : un cœur sombre + des centaines de feuilles orientées vers l'extérieur
export function leafCluster(r, n = 260, leafSize = 0.32, shadows = true) {
  const g = new THREE.Group();
  const cg = mergeVertices(new THREE.IcosahedronGeometry(r * 0.8, 3)); cg.computeVertexNormals(); const core = new THREE.Mesh(cg, mat(0x2a5e1f, 1)); core.castShadow = shadows; core.receiveShadow = true; g.add(core);
  const inst = new THREE.InstancedMesh(LEAF_GEO, leafMaterial(), n);
  const o = new THREE.Object3D(), c = new THREE.Color(), n3 = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    n3.set(rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1).normalize();
    if (n3.y < -0.5) n3.y *= 0.4;
    const d = r * (0.8 + rnd() * 0.3);
    o.position.copy(n3).multiplyScalar(d);
    o.lookAt(n3.clone().multiplyScalar(d * 2)); o.rotateZ(rnd() * 6.28); o.rotateX((rnd() - 0.5) * 1.2);
    o.scale.setScalar(leafSize * (0.7 + rnd() * 0.6)); o.updateMatrix(); inst.setMatrixAt(i, o.matrix);
    c.setHSL(0.25 + rnd() * 0.07, 0.55 + rnd() * 0.2, 0.32 + rnd() * 0.22 + Math.max(0, n3.y) * 0.12); inst.setColorAt(i, c);
  }
  inst.castShadow = shadows; inst.receiveShadow = true; g.add(inst);
  return g;
}

// Houppier : grappe d'amas de feuilles (detail=false : boules simples pour le lointain)
export function makeCrown(r = 5, n = 9, detail = true) {
  const g = new THREE.Group();
  const cols = [PALETTE.leaf, PALETTE.leafDark, PALETTE.leafLight];
  for (let i = 0; i < n; i++) {
    const a = rnd() * Math.PI * 2, d = rnd() * r * 0.6, rr = r * (0.45 + rnd() * 0.35);
    const b = detail ? leafCluster(rr, Math.round(rr * rr * 110), 0.6, true) : new THREE.Mesh(new THREE.IcosahedronGeometry(rr, 2), mat(cols[i % 3], 0.9));
    b.position.set(Math.cos(a) * d, (rnd() - 0.3) * r * 0.6, Math.sin(a) * d); g.add(b);
  }
  return g;
}

// Branche : capsule d'écorce de a vers b, avec touffes de feuilles optionnelles
export function makeBranch(a, b, r = 0.25, leaves = true) {
  const g = new THREE.Group();
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A), len = d.length();
  const geo = new THREE.CylinderGeometry(r * 0.55, r, len, 16, 8); geo.translate(0, len / 2, 0);
  const p = geo.attributes.position, buv = geo.attributes.uv; for (let i = 0; i < p.count; i++) { p.setX(i, p.getX(i) + Math.sin(p.getY(i) * 1.3) * 0.06); buv.setXY(i, buv.getX(i) * 1.5, buv.getY(i) * len / 1.2); }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, barkMat()); m.castShadow = m.receiveShadow = true;
  m.position.copy(A); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()); g.add(m);
  if (leaves) for (let i = 0; i < 3; i++) { const l = leafCluster(0.35 + rnd() * 0.2, 260, 0.16); l.position.copy(A.clone().lerp(B, 0.6 + i * 0.18)).add(new THREE.Vector3(0, 0.25 + rnd() * 0.2, -0.35 - rnd() * 0.3)); g.add(l); }
  g.userData = { A, B, r };
  return g;
}

// Trou d'arbre : creux sombre ovale + bourrelet d'écorce, plaqué sur un tronc (normale = direction n)
export function makeHollow(w = 0.9, h = 1.2) {
  const g = new THREE.Group();
  const hole = new THREE.Mesh(new THREE.CircleGeometry(1, 40), new THREE.MeshBasicMaterial({ color: 0x1e0d06 })); hole.scale.set(w * 0.5, h * 0.5, 1); hole.position.z = 0.02; g.add(hole);
  const inner = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat(0x3a1a0b, 1, { side: THREE.BackSide })); inner.scale.set(w * 0.5, h * 0.5, 0.6); inner.rotation.x = -Math.PI / 2; g.add(inner);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1, 0.18, 12, 40), barkMat()); rim.scale.set(w * 0.52, h * 0.52, 0.6); rim.position.z = 0.05; rim.castShadow = true; g.add(rim);
  const moss = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 8), mat(0x6fb04a, 1)); moss.scale.set(w * 0.42, 0.08, 0.35); moss.position.set(0, -h * 0.47, 0.1); g.add(moss);
  return g;
}

function sky(scene) {
  const mat2 = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color(PALETTE.skyTop) }, hor: { value: new THREE.Color(PALETTE.skyHorizon) }, sunDir: { value: new THREE.Vector3(0.5, 0.35, -0.8).normalize() } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform vec3 top, hor, sunDir; varying vec3 vP;
      void main(){ float k = pow(clamp(vP.y*1.2+0.08,0.0,1.0),0.6); vec3 c = mix(hor, top, k);
        float s = max(dot(normalize(vP), sunDir), 0.0); c += vec3(1.0,0.92,0.7) * (pow(s, 600.0)*2.5 + pow(s, 12.0)*0.35);
        gl_FragColor = vec4(c,1.0); }`,
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(500, 32, 16), mat2); m.renderOrder = -1; scene.add(m);
  return mat2.uniforms.sunDir.value;
}

// Mer de nuages : boules blanches aplaties, instanciées
function cloudSea(scene) {
  const geo = new THREE.SphereGeometry(1, 20, 12);
  const m = new THREE.MeshStandardMaterial({ color: PALETTE.cloud, roughness: 1, emissive: 0x9fb8dd, emissiveIntensity: 0.35 });
  const n = 900, inst = new THREE.InstancedMesh(geo, m, n);
  const o = new THREE.Object3D();
  for (let i = 0; i < n; i++) {
    const a = rnd() * Math.PI * 2, d = 6 + Math.pow(rnd(), 0.7) * 220;
    const r = 3 + rnd() * 6 + d * 0.03;
    o.position.set(Math.cos(a) * d, -2 + rnd() * 2.5 - d * 0.01, Math.sin(a) * d - 20);
    o.scale.set(r * (1 + rnd()), r * 0.45, r * (1 + rnd())); o.rotation.y = rnd() * 6; o.updateMatrix(); inst.setMatrixAt(i, o.matrix);
  }
  inst.receiveShadow = true; scene.add(inst);
  return inst;
}

// Nuage flottant isolé (décor ou « écran » pour ombres chinoises)
export function makeCloud(size = 3, s = 1) {
  const g = new THREE.Group(); const m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, emissive: 0xb6c9e6, emissiveIntensity: 0.45 });
  const n = 7;
  for (let i = 0; i < n; i++) { const r = size * (0.45 + rnd() * 0.4); const b = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), m); b.position.set((i - n / 2) * size * 0.45, (n / 2 - Math.abs(i - n / 2)) * size * 0.12 + rnd() * size * 0.2, rnd() * size * 0.3); b.scale.y = 0.75; b.receiveShadow = true; g.add(b); }
  return g;
}

export function createWorld(canvas, width, height) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(width, height, false);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(PALETTE.haze, 45, 260);
  const sunDir = sky(scene);
  cloudSea(scene);

  scene.add(new THREE.HemisphereLight(0xd6ecff, 0x8a7a6a, 1.25));
  const sun = new THREE.DirectionalLight(0xfff0d0, 2.6);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 1, far: 80 });
  sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.04; sun.shadow.radius = 4;
  scene.add(sun, sun.target);

  // Forêt lointaine : troncs + houppiers dans la brume
  for (let i = 0; i < 46; i++) {
    const a = rnd() * Math.PI * 2, d = 30 + rnd() * 120;
    const x = Math.cos(a) * d, z = Math.sin(a) * d - 25;
    if (Math.abs(x) < 22 && z > -12) continue;
    const h = 26 + rnd() * 22, r = 1.2 + rnd() * 1.6;
    const t = makeTrunk(r, -10, h, i); t.position.x = x; t.position.z = z; t.castShadow = false; scene.add(t);
    const c = makeCrown(4 + rnd() * 4, 6, false); c.position.set(x, h + 2, z); scene.add(c);
  }

  const camera = new THREE.PerspectiveCamera(40, width / height, 0.05, 1200);
  const look = new THREE.Vector3();
  const setCamera = ({ pos, target, fov = 40, roll = 0 }) => {
    camera.fov = fov; camera.updateProjectionMatrix();
    camera.position.set(...pos); look.set(...target); camera.up.set(Math.sin(roll), Math.cos(roll), 0); camera.lookAt(look);
  };
  const animated = [];
  const update = (t) => animated.forEach((f) => f(t));
  // le soleil suit la zone d'action (ombres nettes là où on filme)
  // lumière principale venant de l'avant-gauche (visages bien éclairés, comme dans Oscar & Co) ;
  // le disque solaire du ciel sert aux contre-jours
  const KEY = new THREE.Vector3(-0.45, 0.8, 0.55).normalize();
  const focusShadow = (x, y, z, dir = KEY) => { sun.position.set(x + dir.x * 40, y + dir.y * 40, z + dir.z * 40); sun.target.position.set(x, y, z); };
  focusShadow(0, 20, 0);
  // Post-production « film » : occlusion ambiante (ombres de contact), profondeur de champ, sortie tonemappée
  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(1); composer.setSize(width, height);
  composer.addPass(new RenderPass(scene, camera));
  const ao = new GTAOPass(scene, camera, width, height);
  ao.updateGtaoMaterial({ radius: 0.35, distanceExponent: 1.5, thickness: 1, scale: 1.2, samples: 12 });
  ao.blendIntensity = 0.85; composer.addPass(ao);
  const bokeh = new BokehPass(scene, camera, { focus: 3, aperture: 0.004, maxblur: 0.008 }); bokeh.enabled = false; composer.addPass(bokeh);
  composer.addPass(new OutputPass());
  // dof(focusDistance, force) ; force 0 = désactivé
  const dof = (focus, amount = 0) => { bokeh.enabled = amount > 0; bokeh.uniforms.focus.value = focus; bokeh.uniforms.aperture.value = 0.0025 * amount; bokeh.uniforms.maxblur.value = 0.01 * amount; };
  const render = () => composer.render();
  return { THREE, renderer, scene, camera, setCamera, update, focusShadow, animated, sunDir, render, dof, ao };
}
