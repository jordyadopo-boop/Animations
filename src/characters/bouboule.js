// BOUBOULE — le raton laveur du trio, version SCULPTÉE (style Oscar & Co) :
// une seule forme continue, debout sur deux pattes, gros ventre, épaules tombantes, petite tête au long museau,
// masque de bandit peint, arcades sourcilières en bourrelets, yeux enfoncés, grandes mains.
// Gros, lent, glouton et bourrin. Orienté vers +z. Hauteur ~0.95.
import * as THREE from 'three';
import { Sculpture } from '../engine/sculpt.js';
import { mat, sph, group, makeEye, poseEye } from './parts.js';

const C = { fur: 0x857e74, belly: 0xb8ae9c, light: 0xe6dfd2, dark: 0x1e1b19, inner: 0x5e1a22 };

export const R0 = {
  lean: 0.15, hipsY: 0, belly: 0, breathe: 0, twist: 0, headTurn: 0, headTilt: 0, headNod: 0,
  // bras : [avant, écarté, coude] ; jambes : [avant, genou]
  armL: [0.15, 0.25, 0.35], armR: [0.15, 0.25, 0.35], legL: [0, 0.1], legR: [0, 0.1],
  brow: 0, browAng: -0.6, lid: 0.45, lidLow: 0.3, tilt: 0.6, pupil: 0.5, lookX: 0, lookY: 0, cross: 0, eyeScale: 1,
  mouth: 0, grin: 0.6, tailCurl: 0.5, tailWag: 0, squash: 1,
};

export function createBouboule() {
  const S = new Sculpture({ cell: 0.0085, color: C.fur });
  const root = new THREE.Group(), squash = new THREE.Group(); root.add(squash);
  const hips = group([0, 0.36, 0]); squash.add(hips);
  const spine = group([0, 0.16, 0]); hips.add(spine);
  const neck = group([0, 0.26, 0.04]); spine.add(neck);
  const head = group([0, 0.11, 0.03]); neck.add(head);
  const jaw = group([0, -0.06, 0.06]); head.add(jaw);
  const brows = [-1, 1].map((s) => { const b = group([s * 0.052, 0.052, 0.112]); head.add(b); return b; });
  const PI = Math.PI;

  // tronc : bassin, gros ventre clair, poitrine, épaules tombantes
  S.add(hips, 'ell', [0.2, 0.17, 0.17], { pos: [0, 0, -0.01], blend: 0.06 });
  S.add(hips, 'ell', [0.235, 0.26, 0.215], { pos: [0, 0.12, 0.06], blend: 0.08, color: C.belly });
  S.add(spine, 'ell', [0.18, 0.15, 0.15], { pos: [0, 0.1, -0.01], blend: 0.07 });
  S.add(spine, 'cone', [0.085, 0.075, 0.12], { pos: [0, 0.17, 0.0], blend: 0.05 });
  // tête : crâne, favoris blancs, long museau, oreilles, masque peint, arcades, orbites, bouche
  S.add(head, 'ell', [0.135, 0.115, 0.125], { blend: 0.05 });
  [-1, 1].forEach((s) => S.add(head, 'ell', [0.075, 0.065, 0.06], { pos: [s * 0.095, -0.045, 0.03], blend: 0.045, color: C.light }));
  S.add(head, 'cone', [0.075, 0.032, 0.13], { pos: [0, -0.035, 0.07], rot: [PI / 2 - 0.15, 0, 0], blend: 0.05, color: C.light });
  [-1, 1].forEach((s) => S.add(head, 'ell', [0.045, 0.055, 0.018], { pos: [s * 0.1, 0.105, -0.03], rot: [0, 0, -s * 0.35], blend: 0.025 }));
  [-1, 1].forEach((s) => S.add(head, 'ell', [0.03, 0.035, 0.02], { pos: [s * 0.1, 0.105, -0.015], rot: [0, 0, -s * 0.35], op: 'paint', color: C.light, sharp: 0.006 }));
  S.add(head, 'ell', [0.16, 0.058, 0.15], { pos: [0, 0.02, 0.06], rot: [0.12, 0, 0], op: 'paint', color: C.dark, sharp: 0.012 }); // masque de bandit
  S.add(head, 'ell', [0.03, 0.022, 0.02], { pos: [0, 0.058, 0.13], op: 'paint', color: C.dark, sharp: 0.01 }); // trait du front
  brows.forEach((b, i) => S.add(b, 'ell', [0.05, 0.017, 0.028], { rot: [0, 0, 0], blend: 0.02, color: C.dark, sharp: 0.008 }));
  [-1, 1].forEach((s) => S.add(head, 'ell', [0.04, 0.034, 0.035], { pos: [s * 0.052, 0.018, 0.118], op: 'sub', blend: 0.015 }));
  S.add(head, 'ell', [0.06, 0.009, 0.05], { pos: [0, -0.075, 0.14], op: 'sub', blend: 0.01 }); // fente de la bouche
  S.add(jaw, 'ell', [0.062, 0.03, 0.085], { pos: [0, -0.012, 0.07], blend: 0.03, color: C.light });
  // bras longs et lourds, grandes mains sombres à 3 gros doigts
  const arms = [-1, 1].map((s) => {
    const sh = group([s * 0.17, 0.13, 0.0]); spine.add(sh);
    const el = group([0, -0.19, 0]); sh.add(el);
    const hand = group([0, -0.17, 0]); el.add(hand);
    S.add(sh, 'ell', [0.075, 0.08, 0.07], { blend: 0.05 });
    S.add(sh, 'cone', [0.068, 0.055, 0.19], { rot: [PI, 0, 0], blend: 0.035 });
    S.add(el, 'cone', [0.055, 0.048, 0.17], { rot: [PI, 0, 0], blend: 0.03 });
    S.add(hand, 'ell', [0.055, 0.058, 0.035], { pos: [0, -0.03, 0.01], blend: 0.02, color: C.dark, sharp: 0.006 });
    [-1, 0, 1].forEach((k) => S.add(hand, 'cone', [0.014, 0.012, 0.045], { pos: [k * 0.026, -0.07, 0.012], rot: [PI - 0.15, 0, k * 0.15], blend: 0.012, color: C.dark, sharp: 0.006 }));
    return { sh, el, hand, s };
  });
  // jambes courtes et arquées, gros pieds plats
  const legs = [-1, 1].map((s) => {
    const th = group([s * 0.11, -0.07, 0.01]); hips.add(th);
    const kn = group([0, -0.13, 0.02]); th.add(kn);
    const ft = group([0, -0.12, 0]); kn.add(ft);
    S.add(th, 'ell', [0.095, 0.11, 0.1], { pos: [0, -0.05, 0], blend: 0.05 });
    S.add(kn, 'cone', [0.06, 0.05, 0.11], { rot: [PI, 0, 0], blend: 0.03 });
    S.add(ft, 'ell', [0.065, 0.035, 0.1], { pos: [0, -0.015, 0.045], blend: 0.03, color: C.dark, sharp: 0.006 });
    return { th, kn, ft, s };
  });
  // queue touffue annelée
  const tail = []; let par = group([0, -0.02, -0.16]); hips.add(par); const tailRoot = par;
  for (let i = 0; i < 4; i++) {
    const g = group([0, i ? 0.1 : 0, 0]); par.add(g); tail.push(g);
    S.add(g, 'cone', [0.065 + i * 0.006, 0.07 + i * 0.006, 0.1], { blend: 0.03 });
    S.add(g, 'ell', [0.085, 0.022, 0.085], { pos: [0, 0.06, 0], op: 'paint', color: C.dark, sharp: 0.01 });
    par = g;
  }
  tailRoot.rotation.x = -2.2;

  // pièces non sculptées : yeux, truffe, intérieur de la gueule, dents
  const eyes = [-1, 1].map((s) => { const e = makeEye(0.033, mat(C.dark, 0.85), 0xd8b01a, mat(C.dark, 0.85), s, 0.95); e.position.set(s * 0.052, 0.018, 0.112); e.rotation.y = s * 0.3; e.userData.brow.visible = false; head.add(e); return e; });
  head.add(sph(0.026, mat(0x0e0e0e, 0.2), [1.3, 1, 1.1], [0, -0.045, 0.205]));
  head.add(sph(0.055, mat(C.inner, 0.85), [1, 0.5, 1.2], [0, -0.075, 0.1]));
  const teeth = group([0, -0.07, 0.165]); head.add(teeth);
  for (let i = 0; i < 6; i++) { const a = (i / 5 - 0.5) * 2.2; const t = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.022, 6), mat(0xf4ecd4, 0.3)); t.position.set(Math.sin(a) * 0.05, 0, Math.cos(a) * 0.02 - 0.012); t.rotation.x = PI; teeth.add(t); }
  root.add(S.mesh);

  function pose(p = {}) {
    p = { ...R0, ...p };
    const sq = p.squash; squash.scale.set(1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq));
    hips.position.y = 0.36 + p.hipsY; hips.rotation.set(p.lean * 0.4, p.twist, 0);
    spine.rotation.set(p.lean * 0.6, p.twist * 0.5, 0);
    spine.scale.setScalar(1 + p.breathe * 0.03);
    neck.rotation.set(p.headNod - p.lean * 0.9, p.headTurn, p.headTilt);
    jaw.rotation.x = p.mouth * 0.75;
    teeth.visible = p.grin > 0.2;
    brows.forEach((b, i) => { const s = i ? 1 : -1; b.position.y = 0.052 + p.brow * 0.012; b.rotation.z = -s * p.browAng * 0.6; });
    arms.forEach((a, i) => { const [fw, sp, bd] = i ? p.armR : p.armL; a.sh.rotation.set(-fw, 0, a.s * sp); a.el.rotation.set(-bd, 0, 0); });
    legs.forEach((l, i) => { const [fw, kn] = i ? p.legR : p.legL; l.th.rotation.set(-fw - p.lean * 0.4, 0, l.s * 0.12); l.kn.rotation.set(kn, 0, -l.s * 0.08); l.ft.rotation.set(-kn + fw * 0.5, 0, 0); });
    tail.forEach((g, i) => g.rotation.set(p.tailCurl * 0.3, 0, Math.sin(p.tailWag - i * 0.7) * 0.2));
    eyes.forEach((e, i) => poseEye(e, { lookX: p.lookX + (i ? -1 : 1) * p.cross, lookY: p.lookY, lid: p.lid, lidLow: p.lidLow, tilt: p.tilt, pupil: p.pupil, scale: p.eyeScale }));
    // le ventre gonfle quand il a mangé
    S.prims[1].size = [0.235 * (1 + p.belly * 0.3), 0.26 * (1 + p.belly * 0.15), 0.215 * (1 + p.belly * 0.4)];
    S.update(root);
  }
  pose();
  return { root, pose, parts: { head, hips, jaw, hands: arms.map((a) => a.hand) }, sculpture: S };
}
