// Briques communes : materiaux, humains low-poly, Claude, eau, pluie, oiseaux, decors
import * as THREE from 'three';

export const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
export const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
export const lerp = (a, b, t) => a + (b - a) * t;
export const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
export const win = (t, a, b, fi = 0.4, fo = 0.4) => sstep(a, a + fi, t) * (1 - sstep(b - fo, b, t));

export function M(color, o = {}) { return new THREE.MeshLambertMaterial({ color, flatShading: true, ...o }); }
export function G(color, k = 2) { return new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k) }); }
export function holoMat(color = 0x55e6ff, op = 0.35) {
  return new THREE.MeshBasicMaterial({ color, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
}
export function box(w, h, d, mat) { return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); }
export function at(o, x, y, z) { o.position.set(x, y, z); return o; }

// lignes epaisses (pour holos et eclairs)
export function beam(a, b, th, mat) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const m = box(th, th, A.distanceTo(B), mat);
  m.position.copy(A).add(B).multiplyScalar(0.5); m.lookAt(B); return m;
}

export function holo(geo, color = 0x55e6ff, op = 0.18) {
  const g = new THREE.Group();
  const f = new THREE.Mesh(geo, holoMat(color, op));
  const e = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 20), new THREE.LineBasicMaterial({ color: new THREE.Color(color).multiplyScalar(2.2), transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
  g.add(f, e); g.userData.mats = [f.material, e.material]; g.userData.base = [op, 0.9];
  return g;
}
// regle l'opacite de tout un groupe holo (ou de materiaux transparents)
export function fade(obj, k) {
  obj.visible = k > 0.01;
  obj.traverse(o => {
    if (o.material) {
      const ms = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of ms) {
        if (m.userData.op0 === undefined) { m.userData.op0 = m.opacity; m.transparent = true; }
        m.opacity = m.userData.op0 * k;
      }
    }
  });
}

export function label(text, { w = 2, h = 0.4, color = '#ffffff', font = 'bold 120px Inter', sub = null, subColor = '#cfd8e6' } = {}) {
  const c = document.createElement('canvas'); c.width = 1024; c.height = Math.round(1024 * h / w);
  const g = c.getContext('2d'); g.textAlign = 'center'; g.textBaseline = 'middle';
  g.shadowColor = color; g.shadowBlur = 18; g.fillStyle = color; g.font = font;
  g.fillText(text, c.width / 2, sub ? c.height * 0.38 : c.height / 2);
  if (sub) { g.font = font.replace(/\d+px/, m => Math.round(parseInt(m) * 0.5) + 'px'); g.fillStyle = subColor; g.fillText(sub, c.width / 2, c.height * 0.8); }
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false }));
}

export function skyDome(top, bottom, mid = null) {
  const geo = new THREE.SphereGeometry(400, 24, 16);
  const ct = new THREE.Color(top), cb = new THREE.Color(bottom), cm = mid ? new THREE.Color(mid) : null;
  const cols = [], p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i) / 400; const c = new THREE.Color();
    if (cm) { if (y > 0.05) c.lerpColors(cm, ct, clamp(y / 0.6, 0, 1)); else c.lerpColors(cb, cm, clamp((y + 0.2) / 0.25, 0, 1)); }
    else c.lerpColors(cb, ct, clamp((y + 0.1) / 0.7, 0, 1));
    cols.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  return new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }));
}
export function stars(n = 600, r = 300, k = 1.6) {
  const pos = [];
  for (let i = 0; i < n; i++) {
    const u = hash(i * 3.1), v = hash(i * 7.7) * 0.9 + 0.08;
    const th = u * Math.PI * 2, ph = Math.asin(v);
    pos.push(r * Math.cos(ph) * Math.cos(th), r * Math.sin(ph), r * Math.cos(ph) * Math.sin(th));
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  return new THREE.Points(g, new THREE.PointsMaterial({ color: new THREE.Color(0xffffff).multiplyScalar(k), size: 1.6, sizeAttenuation: false, fog: false }));
}

// ---------------- humains
const BLACK = new THREE.MeshBasicMaterial({ color: 0x111111 });
export class Human {
  constructor(o = {}) {
    const hol = o.holo;
    const mk = (c) => hol ? holoMat(hol, 0.45) : M(c);
    this.o = o;
    this.root = new THREE.Group();
    this.root.scale.setScalar(o.h || 1);
    const skin = mk(o.skin ?? 0xc68a5a), top = mk(o.top ?? 0x445566), bot = mk(o.bottom ?? 0x333333),
      shoe = mk(o.shoes ?? 0x2a2420), hairM = mk(o.hair ?? 0x2a1a10);
    this.mats = { skin, top, bot };
    this.pelvis = new THREE.Group(); this.pelvis.position.y = 0.88; this.root.add(this.pelvis);
    this.pelvis.add(box(0.36, 0.18, 0.22, bot));
    this.spine = new THREE.Group(); this.spine.position.y = 0.05; this.pelvis.add(this.spine);
    const torso = at(box(0.4, 0.56, 0.24, top), 0, 0.3, 0); this.spine.add(torso);
    if (o.belt) this.spine.add(at(box(0.41, 0.06, 0.25, mk(o.belt)), 0, 0.05, 0));
    if (o.jacket !== undefined) {
      this.jacketMat = mk(o.jacket);
      this.jacket = at(box(0.44, 0.58, 0.28, this.jacketMat), 0, 0.31, 0);
      this.jacket.add(at(box(0.12, 0.3, 0.02, top), 0, 0.12, 0.141));
      this.spine.add(this.jacket);
    }
    this.neck = new THREE.Group(); this.neck.position.y = 0.6; this.spine.add(this.neck);
    this.neck.add(at(box(0.1, 0.08, 0.1, skin), 0, 0.02, 0));
    const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.15, 1), skin);
    head.scale.set(1, 1.12, 1); head.position.y = 0.17; this.neck.add(head);
    this.head = head;
    if (!hol) {
      this.eyes = [];
      for (const s of [-1, 1]) {
        const e = at(box(0.035, 0.045, 0.02, BLACK), s * 0.055, 0.19, 0.137); this.neck.add(e); this.eyes.push(e);
      }
      this.brows = [];
      for (const s of [-1, 1]) {
        const b = at(box(0.065, 0.016, 0.02, o.browColor ? M(o.browColor) : hairM), s * 0.058, 0.235, 0.14); this.neck.add(b); this.brows.push(b);
      }
      this.mouth = at(box(0.07, 0.018, 0.02, new THREE.MeshBasicMaterial({ color: 0x3a1010 })), 0, 0.095, 0.142); this.neck.add(this.mouth);
    }
    this.neck.add(at(box(0.035, 0.05, 0.04, skin), 0, 0.145, 0.15));
    const hs = o.hairStyle ?? 'short';
    const H = (w, h, d, x, y, z, m = hairM) => this.neck.add(at(box(w, h, d, m), x, y, z));
    if (hs === 'short') { H(0.32, 0.09, 0.32, 0, 0.3, 0); H(0.32, 0.2, 0.08, 0, 0.21, -0.13); H(0.04, 0.12, 0.2, -0.155, 0.23, -0.03); H(0.04, 0.12, 0.2, 0.155, 0.23, -0.03); }
    if (hs === 'bald') { H(0.05, 0.1, 0.2, -0.15, 0.17, -0.04); H(0.05, 0.1, 0.2, 0.15, 0.17, -0.04); H(0.3, 0.1, 0.06, 0, 0.17, -0.14); }
    if (hs === 'long') { H(0.33, 0.09, 0.33, 0, 0.3, 0); H(0.34, 0.46, 0.09, 0, 0.08, -0.13); H(0.05, 0.36, 0.22, -0.16, 0.13, -0.04); H(0.05, 0.36, 0.22, 0.16, 0.13, -0.04); }
    if (hs === 'bun') { H(0.32, 0.09, 0.32, 0, 0.3, 0); H(0.32, 0.2, 0.08, 0, 0.21, -0.13); this.neck.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.08, 0), hairM), 0, 0.3, -0.16)); }
    if (hs === 'wrap') { const w = new THREE.Mesh(new THREE.IcosahedronGeometry(0.17, 1), hairM); w.scale.set(1.02, 1.05, 1.05); w.position.set(0, 0.2, -0.025); this.neck.add(w); H(0.3, 0.36, 0.07, 0, 0.0, -0.13); H(0.34, 0.05, 0.05, 0, 0.27, 0.12); }
    if (hs === 'curly') { for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; const c = new THREE.Mesh(new THREE.IcosahedronGeometry(0.075, 0), hairM); c.position.set(Math.cos(a) * 0.12, 0.28 + Math.sin(i) * 0.02, Math.sin(a) * 0.1 - 0.03); this.neck.add(c); } }
    const bc = o.beardColor ?? o.hair ?? 0x2a1a10, bm = mk(bc);
    if (o.beard === 'full') { H(0.26, 0.13, 0.1, 0, 0.065, 0.1, bm); H(0.2, 0.08, 0.08, 0, 0.0, 0.08, bm); H(0.05, 0.14, 0.14, -0.13, 0.12, 0.04, bm); H(0.05, 0.14, 0.14, 0.13, 0.12, 0.04, bm); H(0.08, 0.02, 0.02, 0, 0.12, 0.153, bm); }
    if (o.beard === 'long') { H(0.26, 0.13, 0.1, 0, 0.065, 0.1, bm); H(0.2, 0.22, 0.08, 0, -0.06, 0.09, bm); H(0.05, 0.14, 0.14, -0.13, 0.12, 0.04, bm); H(0.05, 0.14, 0.14, 0.13, 0.12, 0.04, bm); H(0.1, 0.02, 0.02, 0, 0.12, 0.153, bm); }
    if (o.beard === 'side') { H(0.05, 0.16, 0.12, -0.15, 0.1, 0.02, bm); H(0.05, 0.16, 0.12, 0.15, 0.1, 0.02, bm); }
    if (o.hat === 'top') { const hm = mk(o.hatColor ?? 0x151515); H(0.4, 0.02, 0.4, 0, 0.33, 0, hm); H(0.26, 0.26, 0.26, 0, 0.47, 0, hm); }
    if (o.hat === 'wide') { const hm = mk(o.hatColor ?? 0xd8c8a0); H(0.5, 0.025, 0.5, 0, 0.33, 0, hm); H(0.28, 0.12, 0.28, 0, 0.4, 0, hm); }
    if (o.hat === 'pith') { const hm = mk(o.hatColor ?? 0xe8e0c8); const p = new THREE.Mesh(new THREE.SphereGeometry(0.19, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), hm); p.position.y = 0.27; this.neck.add(p); H(0.46, 0.02, 0.46, 0, 0.27, 0, hm); }
    if (o.hat === 'crown') { const hm = G(0xffcc55, 1.5); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; H(0.05, 0.1, 0.05, Math.cos(a) * 0.12, 0.36, Math.sin(a) * 0.12, hm); } H(0.3, 0.04, 0.3, 0, 0.31, 0, hm); }
    if (o.hat === 'cap') { const hm = mk(o.hatColor ?? 0xaa3333); H(0.33, 0.08, 0.33, 0, 0.32, 0, hm); }
    // bras
    this.sh = {}; this.el = {}; this.hand = {}; this.sleeve = {};
    for (const [k, s] of [['L', 1], ['R', -1]]) {
      const sg = new THREE.Group(); sg.position.set(s * 0.26, 0.52, 0); this.spine.add(sg);
      const up = at(box(0.11, 0.32, 0.11, this.jacketMat ?? top), 0, -0.15, 0); sg.add(up);
      const eg = new THREE.Group(); eg.position.y = -0.31; sg.add(eg);
      const fo = at(box(0.1, 0.28, 0.1, o.shortSleeve ? skin : (this.jacketMat ?? top)), 0, -0.14, 0); eg.add(fo);
      const hg = new THREE.Group(); hg.position.y = -0.31; eg.add(hg);
      hg.add(box(0.09, 0.09, 0.09, skin));
      this.sh[k] = sg; this.el[k] = eg; this.hand[k] = hg; this.sleeve[k] = [up, fo];
    }
    // jambes
    this.hip = {}; this.knee = {};
    for (const [k, s] of [['L', 1], ['R', -1]]) {
      const hg = new THREE.Group(); hg.position.set(s * 0.1, -0.04, 0); this.pelvis.add(hg);
      hg.add(at(box(0.14, 0.42, 0.15, bot), 0, -0.2, 0));
      const kg = new THREE.Group(); kg.position.y = -0.42; hg.add(kg);
      kg.add(at(box(0.12, 0.4, 0.13, o.robe ? skin : bot), 0, -0.2, 0));
      kg.add(at(box(0.12, 0.06, 0.22, shoe), 0, -0.41, 0.04));
      this.hip[k] = hg; this.knee[k] = kg;
    }
    if (o.robe) {
      const rm = mk(o.robe);
      const sk = new THREE.Mesh(new THREE.CylinderGeometry(0.21, o.robeW ?? 0.33, o.robeL ?? 0.72, 8, 1, true), rm);
      rm.side = THREE.DoubleSide;
      sk.position.y = -(o.robeL ?? 0.72) / 2 + 0.04; this.pelvis.add(sk); this.skirt = sk;
    }
    if (o.sash) this.spine.add(at(box(0.08, 0.6, 0.26, mk(o.sash)), 0.06, 0.3, 0.005)).rotation?.z;
    this.blinkOff = hash((o.seed ?? 1) * 1.37) * 4;
    this.root.traverse(m => { if (m.isMesh) { m.castShadow = !hol; m.receiveShadow = !hol; } });
    this.pose({});
  }
  takeOffJacket() {
    if (!this.jacket) return; this.jacket.visible = false;
    for (const k of ['L', 'R']) for (const m of this.sleeve[k]) m.material = this.mats.top;
  }
  pose(p) {
    const d = (k, v) => p[k] ?? v;
    this.pelvis.position.y = d('py', 0.88);
    this.spine.rotation.set(d('lean', 0), d('twist', 0), d('side', 0));
    this.neck.rotation.set(d('hp', 0), d('hy', 0), d('hr', 0));
    for (const [k, s] of [['L', 1], ['R', -1]]) {
      const a = d('a' + k, [0.05, 0.12]);
      this.sh[k].rotation.set(-a[0], a[2] ?? 0, s * a[1]);
      this.el[k].rotation.set(-d('e' + k, 0.15), 0, 0);
      this.hip[k].rotation.set(-d('l' + k, 0), 0, s * d('ls' + k, 0));
      this.knee[k].rotation.set(d('k' + k, 0), 0, 0);
    }
    if (this.skirt) this.skirt.visible = !p.hideSkirt;
  }
  face(amp, expr = 'neutral', t = 0) {
    if (!this.mouth) return;
    const smile = { happy: 0.45, joy: 0.6, awe: 0.0, neutral: 0.1, serious: 0, sad: -0.1, fear: 0 }[expr] ?? 0.1;
    const open = { joy: 1.5, awe: 1.8, fear: 1.2 }[expr] ?? 0;
    this.mouth.scale.set(1 + smile - 0.15 * amp, 1 + open + amp * 5.5, 1);
    const br = { awe: 0.025, joy: 0.02, fear: 0.025, happy: 0.01, sad: 0.0, serious: -0.006 }[expr] ?? 0;
    const ang = { sad: 0.3, fear: 0.25, serious: -0.18, angry: -0.35 }[expr] ?? 0;
    this.brows.forEach((b, i) => { b.position.y = 0.235 + br + amp * 0.008; b.rotation.z = (i ? -1 : 1) * ang; });
    const bt = (t + this.blinkOff) % 3.9;
    const bl = bt < 0.12 ? 0.15 : 1;
    this.eyes.forEach(e => e.scale.y = bl);
  }
  place(x, y, z, ry = 0) { this.root.position.set(x, y, z); this.root.rotation.y = ry; return this; }
}

// poses utiles
export function walkPose(ph, amp = 1, extra = {}) {
  const s = Math.sin(ph), c = Math.cos(ph);
  return {
    lL: 0.45 * s * amp, lR: -0.45 * s * amp, kL: Math.max(0, -c) * 0.7 * amp + 0.05, kR: Math.max(0, c) * 0.7 * amp + 0.05,
    aL: [-0.4 * s * amp, 0.1], aR: [0.4 * s * amp, 0.1], eL: 0.3, eR: 0.3, py: 0.88 - Math.abs(c) * 0.02 * amp, ...extra
  };
}
export const sitPose = (seat = 0.46, extra = {}) => ({ py: seat + 0.06, lL: 1.5, lR: 1.5, kL: 1.5, kR: 1.5, hideSkirt: true, ...extra });
export const kneelPose = (extra = {}) => ({ py: 0.5, lL: 0.05, lR: 0.05, kL: 1.55, kR: 1.55, hideSkirt: true, ...extra });

// ---------------- Claude
export function makeClaude() {
  const g = new THREE.Group();
  const om = M(0xD97757);
  const body = new THREE.Group(); g.add(body);
  body.add(at(box(0.5, 0.4, 0.38, om), 0, 0.32, 0));
  const eyes = [];
  for (const s of [-1, 1]) { const e = at(box(0.065, 0.13, 0.02, BLACK), s * 0.1, 0.36, 0.193); body.add(e); eyes.push(e); }
  const arms = [];
  for (const s of [-1, 1]) {
    const a = new THREE.Group(); a.position.set(s * 0.25, 0.38, 0); body.add(a);
    a.add(at(box(0.09, 0.16, 0.11, om), s * 0.045, -0.07, 0)); arms.push(a);
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(at(box(0.08, 0.13, 0.08, om), sx * 0.15, 0.065, sz * 0.11));
  g.traverse(m => { if (m.isMesh) { m.castShadow = true; } });
  return {
    g, body, eyes, arms,
    update(t, amp = 0, mood = {}) {
      body.position.y = Math.abs(Math.sin(t * 2.2)) * 0.02 + amp * 0.03;
      body.rotation.z = Math.sin(t * 1.3) * 0.03;
      const w = amp * 0.7;
      arms[0].rotation.z = -(0.1 + w * (0.5 + 0.5 * Math.sin(t * 9)) + (mood.armsUp ?? 0) * 2.6);
      arms[1].rotation.z = (0.1 + w * (0.5 + 0.5 * Math.sin(t * 8 + 1)) + (mood.armsUp ?? 0) * 2.6 + (mood.wave ?? 0) * (2.2 + 0.4 * Math.sin(t * 10)));
      if (mood.ears) { arms[0].rotation.z = -2.3; arms[1].rotation.z = 2.3; body.position.y += 0.02 * Math.sin(t * 20); }
      const bt = t % 3.3; const bl = bt < 0.1 ? 0.12 : 1;
      eyes.forEach(e => e.scale.y = bl * (mood.squint ? 0.5 : 1));
    }
  };
}
export function makeProjector(color = 0x55e6ff, beamH = 0.6, beamR = 0.32) {
  const g = new THREE.Group();
  g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.17, 0.08, 10), M(0x22252e)), 0, 0.04, 0));
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.015, 4, 20), G(color, 2.5)); ring.rotation.x = Math.PI / 2; ring.position.y = 0.085; g.add(ring);
  const cone = new THREE.Mesh(new THREE.CylinderGeometry(beamR, 0.08, beamH, 20, 1, true), holoMat(color, 0.08));
  cone.position.y = 0.09 + beamH / 2; g.add(cone);
  g.userData.cone = cone; g.userData.top = 0.09 + beamH;
  return g;
}

// ---------------- eau / pluie / eclairs
export function waveH(x, z, t, A) {
  return A * (0.5 * Math.sin(x * 0.35 + t * 1.3) + 0.35 * Math.sin(z * 0.5 - t * 1.7 + 1.3) + 0.2 * Math.sin(x * 0.7 + z * 0.6 + t * 2.4));
}
export function makeWater(size, seg, color, o = {}) {
  const geo = new THREE.PlaneGeometry(size, size, seg, seg); geo.rotateX(-Math.PI / 2);
  const mat = M(color, { emissive: new THREE.Color(o.emissive ?? 0x000000), transparent: !!o.opacity, opacity: o.opacity ?? 1 });
  const mesh = new THREE.Mesh(geo, mat); mesh.receiveShadow = true;
  const p = geo.attributes.position;
  return {
    mesh, update(t, A) {
      for (let i = 0; i < p.count; i++) p.setY(i, waveH(p.getX(i) + mesh.position.x, p.getZ(i) + mesh.position.z, t, A));
      p.needsUpdate = true; geo.computeVertexNormals();
    }
  };
}
export function makeRain(n, area, H, color = 0xa8bcd8, op = 0.5) {
  const pos = new Float32Array(n * 6);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const obj = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity: op }));
  obj.frustumCulled = false;
  return {
    obj, update(t, cx = 0, cz = 0, wind = 0.25, on = 1) {
      obj.material.opacity = op * on; obj.visible = on > 0.01;
      for (let i = 0; i < n; i++) {
        const x = cx + (hash(i) - 0.5) * area, z = cz + (hash(i + 0.31) - 0.5) * area;
        const y = H - ((t * 16 + hash(i + 0.77) * H) % H) - 1;
        pos.set([x, y, z, x - wind * 0.5, y + 0.6, z], i * 6);
      }
      g.attributes.position.needsUpdate = true;
    }
  };
}
export function makeBolt(seed, from, to, mat) {
  const g = new THREE.Group(); let prev = from;
  const N = 9;
  for (let i = 1; i <= N; i++) {
    const u = i / N;
    const p = i === N ? to : [lerp(from[0], to[0], u) + (hash(seed + i) - 0.5) * 4, lerp(from[1], to[1], u), lerp(from[2], to[2], u) + (hash(seed + i * 2.3) - 0.5) * 3];
    g.add(beam(prev, p, 0.18, mat)); prev = p;
  }
  return g;
}
export function flashK(t, times) {
  let k = 0;
  for (const ti of times) if (t >= ti && t < ti + 0.6) { const d = t - ti; k = Math.max(k, Math.exp(-d * 7) * (d < 0.08 || (d > 0.13 && d < 0.2) ? 1 : 0.4)); }
  return k;
}

// ---------------- objets
export function makeArk(o = {}) {
  const g = new THREE.Group();
  const w1 = M(0x6b4a2f), w2 = M(0x4f3420), w3 = M(0x7a5634), roof = M(0x5a3b22);
  g.add(at(box(5, 1.2, 1.6, w1), 0, 0.6, 0));
  for (const s of [-1, 1]) {
    const e = at(box(1.2, 1.2, 1.6, w1), s * 2.85, 0.75, 0); e.rotation.z = s * 0.45; g.add(e);
  }
  for (let i = 0; i < 4; i++) for (const s of [-1, 1]) g.add(at(box(5.2, 0.05, 0.02, w2), 0, 0.2 + i * 0.28, s * 0.81));
  g.add(at(box(3.6, 0.9, 1.2, w3), 0, 1.65, 0));
  const r = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 3.9, 3), roof); r.rotation.z = Math.PI / 2; r.rotation.x = Math.PI / 2; r.scale.set(1, 1, 0.55); r.position.y = 2.35; g.add(r);
  for (let i = -1; i <= 1; i++) g.add(at(box(0.35, 0.3, 0.02, new THREE.MeshBasicMaterial({ color: o.lit ? 0xffb060 : 0x140c06 })), i * 1.1, 1.75, 0.61));
  g.add(at(box(0.7, 0.8, 0.03, w2), 0.8, 0.55, 0.81));
  g.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  return g;
}
export function makeCubeBoat() {
  const g = new THREE.Group();
  const w1 = M(0x7a5a38), w2 = M(0x4a3420), pitch = M(0x2a2018);
  g.add(at(box(2.6, 2.2, 2.6, w1), 0, 1.1, 0));
  for (let i = 1; i < 7; i++) for (const r of [0, 1, 2, 3]) {
    const b = at(box(2.64, 0.05, 0.04, w2), 0, i * 0.31, 0); b.rotation.y = r * Math.PI / 2; b.translateZ(1.31); g.add(b);
  }
  g.add(at(box(2.7, 0.25, 2.7, pitch), 0, 0.12, 0));
  g.add(at(box(1.4, 0.6, 1.4, w1), 0, 2.5, 0));
  const r = new THREE.Mesh(new THREE.ConeGeometry(1.1, 0.5, 4), w2); r.rotation.y = Math.PI / 4; r.position.y = 3.05; g.add(r);
  g.add(at(box(0.3, 0.3, 0.02, new THREE.MeshBasicMaterial({ color: 0xffa050 })), 0, 2.5, 0.71));
  g.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  return g;
}
// tablette d'argile cassee avec signes cuneiformes ; reveal 0..1 illumine les lignes
export function makeTablet(o = {}) {
  const g = new THREE.Group();
  const pts = [[-0.5, -0.66], [-0.1, -0.7], [0.08, -0.6], [0.32, -0.68], [0.5, -0.45], [0.47, -0.1], [0.53, 0.25], [0.38, 0.55], [0.12, 0.68], [-0.15, 0.6], [-0.42, 0.66], [-0.5, 0.3], [-0.55, -0.05]];
  const sh = new THREE.Shape(); pts.forEach((p, i) => i ? sh.lineTo(p[0], p[1]) : sh.moveTo(p[0], p[1]));
  const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 1 });
  geo.translate(0, 0, -0.06);
  const clay = new THREE.Mesh(geo, M(o.color ?? 0xa0805c)); g.add(clay); clay.castShadow = true;
  const inside = (x, y) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  const cells = [];
  for (let r = 0; r < 20; r++) for (let c = 0; c < 16; c++) {
    const x = -0.42 + c * 0.056 + (c >= 8 ? 0.03 : 0), y = 0.56 - r * 0.06;
    if (hash(r * 31 + c) < 0.18) continue;
    if (inside(x - 0.04, y) && inside(x + 0.04, y) && inside(x, y - 0.04) && inside(x, y + 0.04)) cells.push([x, y, r, hash(r * 7 + c * 13)]);
  }
  const wg = new THREE.ConeGeometry(0.018, 0.05, 3); wg.rotateZ(Math.PI / 2);
  const dark = new THREE.InstancedMesh(wg, M(0x5a4430), cells.length);
  const glow = new THREE.InstancedMesh(wg, G(o.glow ?? 0xffb347, 2.2), cells.length);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  cells.forEach(([x, y, r, h], i) => {
    e.set(0, 0, h < 0.3 ? -Math.PI / 2 : h < 0.45 ? 0.6 : 0); q.setFromEuler(e);
    m4.compose(new THREE.Vector3(x, y, 0.091), q, new THREE.Vector3(1, 1, 1)); dark.setMatrixAt(i, m4);
    m4.compose(new THREE.Vector3(x, y, 0.096), q, new THREE.Vector3(1, 1, 1)); glow.setMatrixAt(i, m4);
  });
  g.add(dark, glow); glow.count = 0;
  g.userData.setReveal = (k) => { glow.count = Math.floor(clamp(k, 0, 1) * cells.length); };
  return g;
}
export function makeBird(color = 0xf2f2f2, s = 1) {
  const g = new THREE.Group(); const m = M(color);
  g.add(box(0.12, 0.1, 0.3, m));
  g.add(at(box(0.09, 0.09, 0.09, m), 0, 0.05, 0.17));
  g.add(at(box(0.03, 0.03, 0.06, M(0xe0902a)), 0, 0.04, 0.24));
  g.add(at(box(0.1, 0.02, 0.12, m), 0, 0.02, -0.18));
  const wings = [];
  for (const sd of [-1, 1]) { const w = new THREE.Group(); w.position.set(sd * 0.06, 0.03, 0); w.add(at(box(0.3, 0.02, 0.16, m), sd * 0.15, 0, 0)); g.add(w); wings.push([w, sd]); }
  const leaf = at(box(0.1, 0.01, 0.05, M(0x5a9a3a)), 0.03, 0.04, 0.27); leaf.visible = false; g.add(leaf);
  g.scale.setScalar(s);
  g.userData.leaf = leaf;
  g.userData.flap = (t, k = 1) => wings.forEach(([w, sd]) => w.rotation.z = sd * (0.2 + 0.9 * k * Math.sin(t * 22)));
  return g;
}
export function makePalm(h = 4, seed = 1) {
  const g = new THREE.Group(); const tm = M(0x7a5a3a), lm = M(0x3f7a35);
  let x = 0, y = 0;
  for (let i = 0; i < 6; i++) { const s = at(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, h / 6, 6), tm), x, y + h / 12, 0); s.rotation.z = -0.04 * i; g.add(s); x += 0.04 * i * (h / 6); y += h / 6; }
  for (let i = 0; i < 8; i++) {
    const lg = new THREE.Group(); lg.position.set(x, y, 0); lg.rotation.y = i / 8 * Math.PI * 2 + seed; g.add(lg);
    const l = at(box(0.3, 0.04, 1.6, lm), 0, 0, 0.75); lg.add(l); lg.rotation.x = 0; l.rotation.x = 0.45 + hash(i + seed) * 0.3; l.position.y = -0.3;
  }
  g.traverse(m => { if (m.isMesh) m.castShadow = true; });
  return g;
}
export function makeFire() {
  const g = new THREE.Group(); const fl = [];
  g.add(at(box(0.6, 0.12, 0.6, M(0x4a4038)), 0, 0.06, 0));
  for (let i = 0; i < 5; i++) {
    const c = new THREE.Mesh(new THREE.ConeGeometry(0.15 - i * 0.015, 0.6, 5), G(i % 2 ? 0xffc040 : 0xff6a20, 2.4));
    c.position.set((hash(i) - 0.5) * 0.25, 0.4, (hash(i + 2) - 0.5) * 0.25); g.add(c); fl.push(c);
  }
  const light = new THREE.PointLight(0xff8a40, 6, 8, 1.6); light.position.y = 0.8; g.add(light);
  const smoke = [];
  for (let i = 0; i < 18; i++) { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 0), new THREE.MeshLambertMaterial({ color: 0x9a948c, flatShading: true, transparent: true, opacity: 0.5, depthWrite: false })); g.add(s); smoke.push(s); }
  g.userData.update = (t, k = 1) => {
    fl.forEach((c, i) => { const s = 0.7 + 0.4 * Math.abs(Math.sin(t * (7 + i) + i)); c.scale.set(k, s * k, k); c.position.y = 0.12 + 0.3 * s * k; });
    light.intensity = (5 + 2 * Math.sin(t * 13)) * k;
    smoke.forEach((s, i) => { const ph = (t * 0.22 + i / smoke.length) % 1; s.position.set(Math.sin(i * 2.1 + t * 0.3) * 0.3 + ph * 0.8, 0.6 + ph * 4.5, Math.cos(i * 1.7) * 0.25); s.scale.setScalar((0.5 + ph * 2.2) * k); s.material.opacity = 0.45 * (1 - ph) * k; s.visible = k > 0.02; });
  };
  return g;
}
export function makeAnimal(kind) {
  const g = new THREE.Group(); const legs = [];
  const S = {
    elephant: { c: 0x8c8c94, b: [0.9, 0.8, 1.4], lh: 0.7, lw: 0.24, head: [0.6, 0.6, 0.5], hy: 1.45, hz: 0.8 },
    giraffe: { c: 0xd9a441, b: [0.45, 0.55, 1.0], lh: 1.1, lw: 0.1, head: [0.18, 0.2, 0.34], hy: 3.0, hz: 0.8, neck: 1.4 },
    lion: { c: 0xc8963e, b: [0.42, 0.45, 1.0], lh: 0.45, lw: 0.13, head: [0.3, 0.3, 0.32], hy: 0.95, hz: 0.6, mane: 0x7a4a1e },
    sheep: { c: 0xf0ece0, b: [0.45, 0.42, 0.65], lh: 0.3, lw: 0.08, head: [0.18, 0.2, 0.25], hy: 0.62, hz: 0.42, leg: 0x2a2a2a },
    zebra: { c: 0xf2f2f2, b: [0.4, 0.5, 1.0], lh: 0.7, lw: 0.1, head: [0.2, 0.25, 0.45], hy: 1.5, hz: 0.75, neck: 0.5, stripes: 1 },
    camel: { c: 0xc89a62, b: [0.45, 0.5, 1.1], lh: 0.9, lw: 0.11, head: [0.2, 0.22, 0.4], hy: 1.9, hz: 0.85, neck: 0.7, hump: 1 },
  }[kind];
  const m = M(S.c), lm = M(S.leg ?? S.c);
  const by = S.lh + S.b[1] / 2;
  if (kind === 'sheep') { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.4, 1), m); b.scale.set(S.b[0] / 0.8 * 1.6, S.b[1] / 0.8 * 1.6, S.b[2] / 0.8 * 1.6); b.position.y = by; g.add(b); }
  else g.add(at(box(...S.b, m), 0, by, 0));
  if (S.hump) g.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.25, 0), m), 0, by + 0.3, -0.05));
  if (S.stripes) for (let i = 0; i < 6; i++) g.add(at(box(S.b[0] + 0.02, 0.06, 0.05, M(0x1a1a1a)), 0, by + 0.05, -0.4 + i * 0.16));
  if (kind === 'giraffe') for (let i = 0; i < 8; i++) g.add(at(box(0.47, 0.1, 0.1, M(0x8a5a22)), 0, by + (hash(i) - 0.5) * 0.3, -0.4 + i * 0.11));
  if (S.neck) { const n = box(0.14, S.neck, 0.18, m); n.position.set(0, (by + S.hy) / 2 + 0.05, S.hz - 0.15); n.rotation.x = 0.35; g.add(n); }
  g.add(at(box(...S.head, m), 0, S.hy, S.hz + (S.neck ? 0.05 : 0)));
  for (const s of [-1, 1]) g.add(at(box(0.03, 0.04, 0.02, BLACK), s * S.head[0] / 2, S.hy + 0.04, S.hz + S.head[2] / 2 - 0.08));
  if (kind === 'elephant') {
    for (let i = 0; i < 3; i++) { const tr = box(0.16 - i * 0.03, 0.3, 0.16 - i * 0.03, m); tr.position.set(0, S.hy - 0.3 - i * 0.25, S.hz + 0.3 + i * 0.04); g.add(tr); }
    for (const s of [-1, 1]) { const e = box(0.05, 0.5, 0.45, m); e.position.set(s * 0.35, S.hy + 0.05, S.hz - 0.15); e.rotation.y = s * 0.5; g.add(e); }
  }
  if (S.mane) { const mn = new THREE.Mesh(new THREE.IcosahedronGeometry(0.26, 0), M(S.mane)); mn.position.set(0, S.hy, S.hz - 0.08); g.add(mn); }
  for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
    const lg = new THREE.Group(); lg.position.set(sx * (S.b[0] / 2 - S.lw / 2), S.lh, sz * (S.b[2] / 2 - S.lw)); g.add(lg);
    lg.add(at(box(S.lw, S.lh, S.lw, lm), 0, -S.lh / 2, 0)); legs.push(lg);
  }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  g.userData.walk = (ph) => legs.forEach((l, i) => l.rotation.x = 0.4 * Math.sin(ph + ([0, Math.PI, Math.PI, 0][i])));
  return g;
}
export function makeCloud(seed, s = 1, color = 0x7a8290) {
  const g = new THREE.Group(); const m = M(color);
  for (let i = 0; i < 6; i++) { const c = new THREE.Mesh(new THREE.IcosahedronGeometry(1 + hash(seed + i) * 1.2, 0), m); c.position.set((i - 2.5) * 1.3, hash(seed + i * 3) * 0.8, (hash(seed + i * 5) - 0.5) * 1.5); g.add(c); }
  g.scale.setScalar(s); return g;
}
export function groundPlane(size, seg, color, amp = 0.3, seed = 1) {
  const geo = new THREE.PlaneGeometry(size, size, seg, seg); geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, amp * (Math.sin(x * 0.21 + seed) * Math.cos(z * 0.17) + 0.5 * Math.sin(x * 0.53 + z * 0.41 + seed * 2))); }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, M(color)); m.receiveShadow = true; return m;
}
export function camKeys(cam, t, keys) {
  let i = 0; while (i < keys.length - 1 && t >= keys[i + 1].t) i++;
  const a = keys[i], b = keys[Math.min(i + 1, keys.length - 1)];
  const u = (b === a || t <= a.t) ? 0 : (b.lin ? clamp((t - a.t) / (b.t - a.t), 0, 1) : sstep(a.t, b.t, t));
  const P = a.p.map((v, j) => lerp(v, b.p[j], u)), L = a.l.map((v, j) => lerp(v, b.l[j], u));
  cam.position.set(...P); cam.lookAt(...L);
  const f = lerp(a.f ?? 45, b.f ?? 45, u); if (cam.fov !== f) { cam.fov = f; cam.updateProjectionMatrix(); }
  if (a.roll || b.roll) cam.rotateZ(lerp(a.roll ?? 0, b.roll ?? 0, u));
}
