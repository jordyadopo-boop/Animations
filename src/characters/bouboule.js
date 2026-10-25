// BOUBOULE — le raton laveur du trio : gros, lent, glouton et bourrin.
// Silhouette en poire (gros ventre qui ballotte), petites pattes, masque noir de bandit, queue annelée.
// Orienté vers +z. Hauteur debout ~0.75.
import * as THREE from 'three';
import { mat, sph, cap, group, makeEye, poseEye } from './parts.js';
import { addFur } from '../engine/fur.js';

export const R0 = {
  squash: 1, pitch: -1.2, bodyY: 0, belly: 0, bellyJiggle: 0, headTurn: 0, headTilt: 0, headNod: 0,
  eyeScale: 1, lookX: 0, lookY: 0, lid: 0.45, lidLow: 0.25, tilt: 0.6, pupil: 0.55, cross: 0, brow: -0.2, browAng: -0.8, smirk: 0,
  mouth: 0, grin: 0.7, tongue: 0, armL: [0.4, 0.3, 0.6], armR: [0.4, 0.3, 0.6], legL: [0, 0.2], legR: [0, 0.2], tailCurl: 0.6, tailWag: 0,
};

export function createBouboule() {
  const C = { fur: 0x8d8a86, dark: 0x2a2826, light: 0xe2ddd4, belly: 0xbab3a6 };
  const fur = mat(C.fur, 0.95), dark = mat(C.dark, 0.9), light = mat(C.light, 0.95), bellyM = mat(C.belly, 0.95);
  const F = (m, o) => addFur(m, { length: 0.022, density: 220, shells: 12, comb: [0, -0.5, -0.4], ...o });
  const root = new THREE.Group(), squash = new THREE.Group(); root.add(squash);
  const body = group([0, 0.2, 0]); squash.add(body);
  // gros corps en poire + ventre qui ballotte
  F((body.add(sph(0.3, fur, [1.05, 0.95, 1.2], [0, 0, -0.05])), body.children.at(-1)));
  const belly = group([0, -0.05, 0.12]); body.add(belly);
  F((belly.add(sph(0.24, bellyM, [1.05, 0.95, 0.9])), belly.children.at(-1)), { length: 0.016 });

  // tête petite pour le corps, museau pointu, masque de bandit
  const neck = group([0, 0.12, 0.3]); body.add(neck);
  const head = group([0, 0.1, 0.06]); neck.add(head);
  F((head.add(sph(0.17, fur, [1.15, 0.9, 1.0])), head.children.at(-1)), { comb: [0, 0, -0.9] });
  F((head.add(sph(0.11, light, [1.0, 0.75, 1.3], [0, -0.06, 0.12])), head.children.at(-1)), { length: 0.012 });
  [-1, 1].forEach((s) => F((head.add(sph(0.08, light, [1.2, 0.8, 0.8], [s * 0.1, -0.02, 0.06])), head.children.at(-1)), { length: 0.02, comb: [s * 0.8, -0.3, 0] })); // favoris blancs
  const mask = sph(0.15, dark, [1.18, 0.42, 0.92], [0, 0.03, 0.06]); head.add(mask); F(mask, { length: 0.008 });
  head.add(sph(0.032, mat(0x111111, 0.25), [1.3, 1, 1], [0, -0.04, 0.27])); // truffe
  // gueule : rictus gourmand plein de dents
  const jaw = group([0, -0.1, 0.12]); head.add(jaw);
  F((jaw.add(sph(0.075, light, [1.0, 0.45, 1.2], [0, -0.01, 0.04])), jaw.children.at(-1)), { length: 0.01 });
  head.add(sph(0.07, mat(0x5a1220, 0.85), [1, 0.6, 1.1], [0, -0.1, 0.13]));
  const tongue = sph(0.04, mat(0xd8506a, 0.5), [1, 0.35, 1.3], [0, 0.005, 0.05]); jaw.add(tongue);
  const grinG = group([0, -0.105, 0.235]); head.add(grinG);
  grinG.add(new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.008, 6, 24, Math.PI), mat(0x1a0d0d, 0.6))); grinG.children[0].rotation.set(0.3, 0, Math.PI); grinG.children[0].position.y = 0.012;
  const toothM = mat(0xf6efd8, 0.3);
  for (let i = 0; i < 7; i++) { const a = (i / 6 - 0.5) * 2.4; const t = new THREE.Mesh(new THREE.ConeGeometry(0.011, 0.032, 6), toothM); t.position.set(Math.sin(a) * 0.07, -0.004 - Math.cos(a) * 0.012, Math.cos(a) * 0.025); t.rotation.x = Math.PI; grinG.add(t); }
  // yeux méchants : petits, iris jaune, pupilles en tête d'épingle
  const eyes = [-1, 1].map((s) => { const e = makeEye(0.048, dark, 0xd9b21b, mat(0x161412, 0.8), s, 0.9); e.position.set(s * 0.07, 0.04, 0.14); e.rotation.y = s * 0.3; e.userData.brow.scale.set(2, 1.5, 1.5); head.add(e); return e; });
  // oreilles
  [-1, 1].forEach((s) => { const e = group([s * 0.12, 0.12, -0.03]); F((e.add(sph(0.055, fur, [1, 1.1, 0.35])), e.children.at(-1)), { length: 0.01 }); e.add(sph(0.035, light, [1, 1, 0.2], [0, 0, 0.015])); e.rotation.z = -s * 0.3; head.add(e); });

  // petits bras courts, mains noires « gantées »
  const limb = (p, len, end) => { const sh = group(p); sh.add(F(cap(0.045, len, fur, [0, -len / 2, 0]), { length: 0.015 })); const el = group([0, -len, 0]); sh.add(el); el.add(F(cap(0.04, len * 0.8, fur, [0, -len * 0.4, 0]), { length: 0.012 })); const tip = group([0, -len * 0.85, 0]); el.add(tip); tip.add(end); return { sh, el }; };
  const hand = () => { const g = group([0, 0, 0]); g.add(sph(0.04, dark, [1.1, 0.7, 1.2])); [-1, 0, 1].forEach((k) => g.add(cap(0.011, 0.03, dark, [k * 0.02, -0.01, 0.04], [Math.PI / 2, 0, 0]))); return g; };
  const arms = [-1, 1].map((s) => { const L = limb([s * 0.26, 0.1, 0.12], 0.11, hand()); body.add(L.sh); L.s = s; return L; });
  // jambes courtes et pieds plats
  const legs = [-1, 1].map((s) => { const hip = group([s * 0.17, -0.2, -0.05]); body.add(hip); F((hip.add(sph(0.1, fur, [0.9, 1, 1])), hip.children.at(-1))); const foot = sph(0.05, dark, [1.1, 0.5, 1.8], [0, -0.13, 0.04]); hip.add(foot); return { hip, s }; });
  // queue annelée
  const tail = group([0, -0.05, -0.38]); body.add(tail);
  const tailSegs = []; let par = tail;
  for (let i = 0; i < 7; i++) { const sg = group([0, 0, i ? -0.07 : 0]); par.add(sg); const m = sph(0.07 - i * 0.004, i % 2 ? dark : fur, [1, 1, 1.1], [0, 0, -0.035], 14); sg.add(m); F(m, { length: 0.03, density: 160 }); tailSegs.push(sg); par = sg; }

  function pose(p = {}) {
    p = { ...R0, ...p };
    const s = p.squash; squash.scale.set(1 / Math.sqrt(s), s, 1 / Math.sqrt(s));
    body.position.y = 0.2 + p.bodyY + (p.pitch < -0.6 ? 0.18 : 0);
    body.rotation.set(p.pitch, 0, 0);
    belly.scale.setScalar(1 + p.belly * 0.35 + p.bellyJiggle * 0.08); belly.position.y = -0.05 - p.bellyJiggle * 0.02;
    neck.rotation.set(p.headNod - p.pitch * 0.95, p.headTurn, p.headTilt);
    eyes.forEach((e, i) => poseEye(e, { lookX: p.lookX + (i ? -1 : 1) * p.cross, lookY: p.lookY, lid: p.lid, lidLow: p.lidLow, tilt: p.tilt, pupil: p.pupil, browY: p.brow, browAng: p.browAng + (i ? -1 : 1) * p.smirk * 0.4, scale: p.eyeScale }));
    jaw.rotation.x = p.mouth * 0.9; tongue.position.z = 0.05 + p.tongue * 0.06;
    grinG.visible = p.grin > 0.2; grinG.scale.set(0.8 + p.grin * 0.4, 1, 1);
    arms.forEach((a, i) => { const [sw, sp, bd] = i ? p.armR : p.armL; a.sh.rotation.set(-sw, 0, a.s * sp); a.el.rotation.x = -bd; });
    legs.forEach((l, i) => { const [sw] = i ? p.legR : p.legL; l.hip.rotation.x = -sw - p.pitch * 0.9; });
    tailSegs.forEach((g, i) => (g.rotation.set(p.tailCurl * 0.25, Math.sin(p.tailWag - i * 0.6) * 0.15, 0)));
  }
  pose();
  return { root, pose, parts: { head, body, jaw } };
}
