// La Canopée des Géants : arbres immenses au-dessus d'une mer de nuages.
// Ciel dégradé + soleil, mer de nuages instanciée, troncs à écorce rouge-orangé, houppiers, branches, trou d'arbre.
import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

export const PALETTE = {
  skyTop: 0x2a6fdc, skyHorizon: 0xcfe9ff, haze: 0xbcdcf5,
  bark: 0xb5562e, barkDark: 0x7a3519, leaf: 0x4fa83a, leafDark: 0x2f7d2a, leafLight: 0x8fd14f,
  cloud: 0xffffff, cloudShade: 0xc9d9f0,
};

export const mat = (color, roughness = 0.85, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, ...extra });

let seed = 7;
const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);

function barkTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 512; const g = c.getContext('2d');
  g.fillStyle = '#c0663a'; g.fillRect(0, 0, 256, 512);
  for (let i = 0; i < 70; i++) {
    const x = Math.random() * 256, w = 3 + Math.random() * 9;
    g.strokeStyle = `rgba(${90 + Math.random() * 40},${35 + Math.random() * 20},15,${0.35 + Math.random() * 0.4})`; g.lineWidth = w;
    g.beginPath(); g.moveTo(x + Math.sin(i) * 6, 0); for (let y = 0; y <= 512; y += 16) g.lineTo(x + Math.sin((y / 512) * Math.PI * 2 * 2 + i) * 6, y); g.stroke();
  }
  for (let i = 0; i < 40; i++) { g.strokeStyle = 'rgba(240,160,110,0.35)'; g.lineWidth = 2; const x = Math.random() * 256; g.beginPath(); g.moveTo(x + Math.sin(i) * 4, 0); for (let y = 0; y <= 512; y += 16) g.lineTo(x + Math.sin((y / 512) * Math.PI * 2 * 3 + i) * 4, y); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; return t;
}
let BARK; const barkMat = () => (BARK ||= new THREE.MeshStandardMaterial({ map: barkTexture(), roughness: 0.9, color: 0xffffff }));

// Tronc géant légèrement noueux. bottom/top en y, rayon r.
export function makeTrunk(r = 1.5, bottom = -20, top = 40, s = 1) {
  const h = top - bottom;
  const geo = new THREE.CylinderGeometry(r * 0.82, r * 1.15, h, 40, Math.round(h * 1.5), true);
  const p = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(z, x);
    const k = 1 + 0.05 * Math.sin(a * 7 + y * 0.3 + s) + 0.04 * Math.sin(a * 3 - y * 0.5 + s * 2);
    p.setXYZ(i, x * k + Math.sin(y * 0.05 + s) * 0.3, y, z * k);
    uv.setXY(i, uv.getX(i) * 3, uv.getY(i) * h / 6);
  }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, barkMat()); m.position.y = bottom + h / 2; m.castShadow = m.receiveShadow = true;
  return m;
}

// Boule de feuillage bosselée
function leafBlob(r, color) {
  const geo = mergeVertices(new THREE.IcosahedronGeometry(r, 3)); const p = geo.attributes.position;
  const s = rnd() * 10;
  for (let i = 0; i < p.count; i++) { const v = new THREE.Vector3().fromBufferAttribute(p, i); const k = 1 + 0.12 * Math.sin(v.x * 3 + s) * Math.sin(v.y * 3.3 + s) * Math.sin(v.z * 2.7); v.multiplyScalar(k); p.setXYZ(i, v.x, v.y, v.z); }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, mat(color, 0.8)); m.castShadow = m.receiveShadow = true; return m;
}

// Houppier : grappe de boules de feuillage
export function makeCrown(r = 5, n = 9) {
  const g = new THREE.Group();
  const cols = [PALETTE.leaf, PALETTE.leafDark, PALETTE.leafLight];
  for (let i = 0; i < n; i++) {
    const a = rnd() * Math.PI * 2, d = rnd() * r * 0.6, rr = r * (0.45 + rnd() * 0.35);
    const b = leafBlob(rr, cols[i % 3]); b.position.set(Math.cos(a) * d, (rnd() - 0.3) * r * 0.6, Math.sin(a) * d); g.add(b);
  }
  return g;
}

// Branche : capsule d'écorce de a vers b, avec touffes de feuilles optionnelles
export function makeBranch(a, b, r = 0.25, leaves = true) {
  const g = new THREE.Group();
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A), len = d.length();
  const geo = new THREE.CylinderGeometry(r * 0.55, r, len, 16, 8); geo.translate(0, len / 2, 0);
  const p = geo.attributes.position; for (let i = 0; i < p.count; i++) p.setX(i, p.getX(i) + Math.sin(p.getY(i) * 1.3) * 0.06);
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, barkMat()); m.castShadow = m.receiveShadow = true;
  m.position.copy(A); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()); g.add(m);
  if (leaves) for (let i = 0; i < 3; i++) { const l = leafBlob(0.3 + rnd() * 0.2, [PALETTE.leaf, PALETTE.leafLight][i % 2]); l.position.copy(A.clone().lerp(B, 0.55 + i * 0.2)).add(new THREE.Vector3(0, 0.25 + rnd() * 0.2, -0.3 - rnd() * 0.4)); g.add(l); }
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
    const c = makeCrown(4 + rnd() * 4, 6); c.position.set(x, h + 2, z); c.children.forEach((b) => (b.castShadow = false)); scene.add(c);
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
  return { THREE, renderer, scene, camera, setCamera, update, focusShadow, animated, sunDir };
}
