// Accessoires de « PÉPIN ! » : noisette dorée, ver, brindille-ressort, ombre chinoise d'aigle.
import * as THREE from 'three';
import { mat, sph, cap, group, makeEye, poseEye } from './parts.js';

// Noisette dorée brillante (coque + cupule de feuilles) ; open() la fend en deux moitiés
export function createNut() {
  const g = new THREE.Group();
  const shellM = new THREE.MeshStandardMaterial({ color: 0xd9a02c, roughness: 0.25, metalness: 0.35, emissive: 0x5a3a00, emissiveIntensity: 0.35 });
  const halves = [-1, 1].map((s) => {
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.06, 32, 20, s > 0 ? 0 : Math.PI, Math.PI), shellM);
    h.scale.set(1, 1.15, 1); h.castShadow = true;
    const inner = new THREE.Mesh(new THREE.CircleGeometry(0.058, 24), mat(0x6a4520, 0.9)); inner.rotation.y = s > 0 ? Math.PI : 0; h.add(inner);
    const hg = group([0, 0, 0], h); g.add(hg); return hg;
  });
  // cupule verte frisée au sommet
  const cup = group([0, 0.06, 0]); g.add(cup);
  for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; const l = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.06, 5), mat(0x7da83a, 0.6)); l.position.set(Math.cos(a) * 0.035, 0.0, Math.sin(a) * 0.035); l.rotation.set(Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9); l.castShadow = true; cup.add(l); }
  const stem = cap(0.006, 0.05, mat(0x5a4020, 0.8), [0, 0.03, 0]); cup.add(stem);
  const open = (k) => { halves.forEach((h, i) => { const s = i ? 1 : -1; h.rotation.x = s * k * 1.2; h.position.z = s * k * 0.03; }); cup.visible = k < 0.05; };
  return { root: g, open };
}

// Le ver qui fait coucou
export function createWorm() {
  const g = new THREE.Group(); const m = mat(0xf0a0a8, 0.5);
  const segs = []; let par = g;
  for (let i = 0; i < 6; i++) { const s = group([0, i ? 0.016 : 0, 0]); s.add(sph(0.012 - i * 0.0004, m, [1, 1.1, 1], [0, 0.008, 0], 12)); par.add(s); segs.push(s); par = s; }
  const head = group([0, 0.018, 0]); par.add(head); head.add(sph(0.014, m, [1, 1, 1], [0, 0.006, 0], 14));
  const eyes = [-1, 1].map((s) => { const e = makeEye(0.007, m, 0x2a1a10, mat(0x111111), s, 1.3); e.position.set(s * 0.007, 0.01, 0.01); head.add(e); return e; });
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.006, 0.0013, 5, 12, Math.PI), mat(0x5a1a22)); smile.rotation.z = Math.PI; smile.position.set(0, 0.003, 0.0135); head.add(smile);
  const hand = cap(0.003, 0.014, m, [0.012, 0.012, 0.006], [0, 0, -0.6]); segs[4].add(hand);
  const pose = (t, wave = 1) => { segs.forEach((s, i) => (s.rotation.z = Math.sin(t * 3 - i * 0.8) * 0.18)); hand.rotation.z = -0.6 - Math.abs(Math.sin(t * 9)) * 0.9 * wave; eyes.forEach((e) => poseEye(e, { lid: 0.05, scale: 1 })); };
  return { root: g, pose };
}

// Silhouette d'aigle ailes déployées (ombre chinoise projetée sur un nuage)
export function createEagleShadow() {
  const s = new THREE.Shape();
  const pts = [[0, 0.55], [0.08, 0.42], [0.12, 0.2], [0.6, 0.38], [1.25, 0.3], [1.1, 0.18], [1.2, 0.08], [1.0, 0.02], [1.05, -0.08], [0.55, -0.02], [0.18, -0.08], [0.25, -0.5], [0.0, -0.4]];
  s.moveTo(0, 0.55); pts.forEach(([x, y]) => s.lineTo(x, y)); [...pts].reverse().forEach(([x, y]) => s.lineTo(-x, y));
  const m = new THREE.Mesh(new THREE.ShapeGeometry(s), new THREE.MeshBasicMaterial({ color: 0x0e121c, transparent: true, opacity: 0.55, depthWrite: false }));
  return m;
}

// Brindille porte-noisette qui plie puis claque comme un ressort
export function createTwig(barkMat) {
  const g = new THREE.Group();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.025, 0.45, 8), barkMat || mat(0x8a5030, 0.9)); m.position.y = -0.2; m.rotation.z = 0; m.castShadow = true; g.add(m);
  const tip = group([0, -0.42, 0]); g.add(tip);
  [[-0.4, 0.2], [0.5, -0.1]].forEach(([a, y]) => { const l = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 6), mat(0x6aa83a, 0.6)); l.scale.set(0.4, 1, 0.08); l.position.set(Math.sin(a) * 0.05, -0.2 + y * 0.3, 0); l.rotation.z = a; g.add(l); });
  return { root: g, tip };
}
