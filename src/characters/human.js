// Humains SCULPTÉS (pâte à modeler) pour « L'INSTANT » : l'homme, la femme, l'enfant.
// Trois sculptures par personnage : le corps (grain moyen), la tête (grain fin : nez, arcades, lèvres)
// et chaque main (grain très fin : doigts articulés, poing qui se serre).
// Repère : origine aux pieds, regard vers +z, gauche du personnage = +x. Un adulte mesure ~1.0.
import * as THREE from 'three';
import { Sculpture } from '../engine/sculpt.js';
import { mat, sph, group, makeEye, poseEye } from './parts.js';

const PI = Math.PI;
const CLAY = () => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.72, metalness: 0 });

// gabarits
const BUILDS = {
  man: { hipY: 0.47, thigh: 0.225, shin: 0.215, spine: 0.12, chest: 0.115, neck: 0.1, shW: 0.14, armU: 0.175, armF: 0.16, hand: 1,
    hipsS: [0.105, 0.075, 0.072], bellyS: [0.112, 0.095, 0.085], chestS: [0.14, 0.095, 0.085], legR: [0.055, 0.042], armR: [0.042, 0.032], headS: [0.074, 0.088, 0.082], jaw: 1.15, neckR: 0.04 },
  woman: { hipY: 0.45, thigh: 0.22, shin: 0.205, spine: 0.11, chest: 0.105, neck: 0.1, shW: 0.112, armU: 0.165, armF: 0.15, hand: 0.88,
    hipsS: [0.112, 0.08, 0.078], bellyS: [0.078, 0.08, 0.065], chestS: [0.105, 0.085, 0.072], legR: [0.05, 0.034], armR: [0.03, 0.023], headS: [0.068, 0.083, 0.077], jaw: 0.9, neckR: 0.03 },
  child: { hipY: 0.235, thigh: 0.11, shin: 0.105, spine: 0.07, chest: 0.06, neck: 0.075, shW: 0.072, armU: 0.095, armF: 0.085, hand: 0.55,
    hipsS: [0.065, 0.05, 0.05], bellyS: [0.068, 0.062, 0.058], chestS: [0.07, 0.055, 0.052], legR: [0.033, 0.026], armR: [0.022, 0.018], headS: [0.072, 0.08, 0.076], jaw: 0.85, neckR: 0.022 },
};

export const H0 = {
  hipsY: 0, lean: 0, leanSide: 0, twist: 0, chestTwist: 0, chestLean: 0, headTurn: 0, headTilt: 0, headNod: 0,
  armL: [0.05, 0.12, 0.2], armR: [0.05, 0.12, 0.2], armTwistL: 0, armTwistR: 0, wristL: [0, 0], wristR: [0, 0], fistL: 0.25, fistR: 0.25, thumbL: 0.3, thumbR: 0.3,
  legL: [0, 0.04, 0.05], legR: [0, 0.04, 0.05], footL: 0, footR: 0,
  brow: 0, browAng: 0, lid: 0.32, lidLow: 0.12, tilt: 0, lookX: 0, lookY: 0, pupil: 1, eyeScale: 1,
  mouth: 0, mouthW: 0, smile: 0, sneer: 0, cheek: 0, nostril: 0,
};

// ---- main articulée (sculpture propre) ----
function createHand(side, scale, skin, nail) {
  const s = side, k = scale;
  const root = group(); // le poignet
  const S = new Sculpture({ cell: 0.0011 * k, color: skin, material: CLAY() });
  const palm = group([0, -0.012 * k, 0]); root.add(palm);
  S.add(root, 'cone', [0.016 * k, 0.017 * k, 0.012 * k], { rot: [PI, 0, 0], pos: [0, 0.01 * k, 0], blend: 0.008 * k });
  S.add(palm, 'ell', [0.0105 * k, 0.026 * k, 0.024 * k], { pos: [0, -0.016 * k, 0], blend: 0.006 * k });
  S.add(palm, 'ell', [0.009 * k, 0.012 * k, 0.012 * k], { pos: [-s * 0.004 * k, -0.012 * k, 0.012 * k], blend: 0.01 * k }); // éminence du pouce
  const fingers = [];
  const L = [[0.019, 0.013, 0.011], [0.021, 0.015, 0.012], [0.02, 0.014, 0.011], [0.016, 0.011, 0.009]];
  [0.0158, 0.0053, -0.0052, -0.0155].forEach((z, i) => {
    let par = group([0, -0.04 * k, z * k]); palm.add(par); const segs = [];
    L[i].forEach((len, j) => {
      const g = j ? group([0, -L[i][j - 1] * k, 0]) : par; if (j) segs[j - 1].add(g); segs.push(g);
      const r = (0.0058 - j * 0.0006 - (i === 3 ? 0.0008 : 0)) * k;
      S.add(g, 'cone', [r, r * 0.92, len * k], { rot: [PI, 0, 0], blend: (j ? 0.0012 : 0.003) * k });
      if (j === 2) S.add(g, 'ell', [r * 0.75, r * 0.55, r * 0.5], { pos: [-s * r * 0.45, -len * k * 0.75, 0], op: 'paint', color: nail, sharp: 0.0015 * k });
    });
    fingers.push(segs);
  });
  // pouce : part de la base, vers l'avant (+z)
  const tb = group([-s * 0.002 * k, -0.008 * k, 0.017 * k]); palm.add(tb);
  const t1 = group([0, -0.017 * k, 0]); tb.add(t1);
  S.add(tb, 'cone', [0.0068 * k, 0.006 * k, 0.017 * k], { rot: [PI, 0, 0], blend: 0.005 * k });
  S.add(t1, 'cone', [0.006 * k, 0.0055 * k, 0.014 * k], { rot: [PI, 0, 0], blend: 0.003 * k });
  root.add(S.mesh);
  // curl : 0 main ouverte, 1 poing serré ; thumb : 0 écarté, 1 replié sur les doigts
  let last = '';
  function pose(curl = 0.2, thumb = 0.3, spread = 0) {
    const key = `${curl.toFixed(4)},${thumb.toFixed(4)},${spread}`; if (key === last) return; last = key;
    fingers.forEach((segs, i) => {
      const lag = i * 0.04;
      segs.forEach((g, j) => { g.rotation.set(0, 0, 0); g.rotation.z = -s * (Math.min(1, curl + lag * curl) * [1.55, 1.75, 1.2][j] + 0.08); });
      segs[0].rotation.x = (i - 1.5) * -0.08 * spread * (1 - curl);
    });
    tb.rotation.set(-0.5 - thumb * 0.4, 0, -s * (0.25 + thumb * 0.9)); t1.rotation.set(0, 0, -s * (0.2 + thumb * 1.0));
    S.update(root);
  }
  return { root, pose, S };
}

export function createHuman(kind = 'man', look = {}) {
  const B = BUILDS[kind];
  const C = { skin: 0x7a4a32, skinDark: 0x5c3423, lips: 0x5a2e26, hair: 0x15100d, shirt: 0x8a8f96, pants: 0x2c3a52, shoes: 0x1e1a18, nail: 0xc49a88, iris: 0x3a2312, ...look };
  const root = new THREE.Group();
  const body = new Sculpture({ cell: kind === 'child' ? 0.0034 : 0.005, color: C.shirt, material: CLAY() });
  const hips = group([0, B.hipY, 0]); root.add(hips);
  const spine = group([0, 0.05, 0]); hips.add(spine);
  const chest = group([0, B.spine, 0]); spine.add(chest);
  const neck = group([0, B.chest, 0.005]); chest.add(neck);
  const headB = group([0, B.neck, 0.012]); neck.add(headB);

  // ---- tronc ----
  const isW = kind === 'woman', isC = kind === 'child';
  body.add(hips, 'ell', B.hipsS, { pos: [0, 0, 0], blend: 0.03, color: isW ? C.pants : C.pants });
  body.add(spine, 'ell', B.bellyS, { pos: [0, 0.045, 0.008], blend: 0.035 });
  body.add(chest, 'ell', B.chestS, { pos: [0, 0.035, 0], blend: 0.035 });
  if (isW) [-1, 1].forEach((s) => body.add(chest, 'ell', [0.034, 0.032, 0.03], { pos: [s * 0.042, 0.01, 0.055], blend: 0.03 }));
  body.add(neck, 'cone', [B.neckR * 1.15, B.neckR, B.neck * 0.9], { pos: [0, -0.01, 0], blend: 0.02, color: C.skin, sharp: 0.006 });
  // col (encolure) : le tissu remonte un peu sur le cou
  body.add(chest, 'ell', [B.neckR * 1.6, 0.02, B.neckR * 1.4], { pos: [0, B.chest - 0.008, 0.004], blend: 0.015 });
  // trapèzes
  [-1, 1].forEach((s) => body.add(chest, 'ell', [B.shW * 0.5, 0.035, 0.05], { pos: [s * B.shW * 0.5, B.chest - 0.03, -0.01], rot: [0, 0, -s * 0.35], blend: 0.03 }));
  if (isW) { // jupe-pull : tunique qui descend sur les hanches
    body.add(hips, 'cone', [0.1, 0.13, 0.2], { pos: [0, -0.01, 0], rot: [PI, 0, 0], blend: 0.03, color: C.skirt ?? C.shirt });
  }

  // ---- bras ----
  const arms = [-1, 1].map((s) => {
    const sh = group([s * B.shW, B.chest - 0.025, -0.005]); chest.add(sh);
    const el = group([0, -B.armU, 0]); sh.add(el);
    const wr = group([0, -B.armF, 0]); el.add(wr);
    body.add(sh, 'ell', [B.armR[0] * 1.2, B.armR[0] * 1.3, B.armR[0] * 1.15], { pos: [0, -0.008, 0], blend: 0.025 });
    const sleeve = look.longSleeves ? 1.02 : 0.45;
    body.add(sh, 'cone', [B.armR[0] * 1.08, B.armR[1] * 1.18, B.armU * sleeve], { rot: [PI, 0, 0], blend: 0.02 });
    body.add(sh, 'cone', [B.armR[0] * 0.95, B.armR[1] * 0.95, B.armU], { rot: [PI, 0, 0], blend: 0.02, color: look.longSleeves ? C.shirt : C.skin, sharp: 0.004 });
    body.add(el, 'cone', [B.armR[1] * 0.98, B.armR[1] * 0.72, B.armF * 0.98], { rot: [PI, 0, 0], blend: 0.015, color: look.longSleeves ? C.shirt : C.skin, sharp: 0.004 });
    if (look.longSleeves) body.add(el, 'cone', [B.armR[1] * 0.74, B.armR[1] * 0.7, B.armF * 0.15], { pos: [0, -B.armF * 0.86, 0], rot: [PI, 0, 0], blend: 0.006, color: C.skin, sharp: 0.002 });
    const hand = createHand(s, B.hand * 1.05, C.skin, C.nail); wr.add(hand.root);
    return { sh, el, wr, hand, s };
  });

  // ---- jambes ----
  const legs = [-1, 1].map((s) => {
    const th = group([s * B.hipsS[0] * 0.5, -0.01, 0]); hips.add(th);
    const kn = group([0, -B.thigh, 0]); th.add(kn);
    const an = group([0, -B.shin, 0]); kn.add(an);
    body.add(th, 'cone', [B.legR[0], B.legR[0] * 0.8, B.thigh], { rot: [PI, 0, 0], blend: 0.03, color: C.pants });
    body.add(kn, 'cone', [B.legR[0] * 0.8, B.legR[1], B.shin], { rot: [PI, 0, 0], blend: 0.02, color: C.pants });
    if (isW || look.bareShins) body.add(kn, 'cone', [B.legR[0] * 0.72, B.legR[1] * 0.85, B.shin * 0.98], { pos: [0, -0.02, 0], rot: [PI, 0, 0], blend: 0.01, color: C.skin, sharp: 0.003 });
    const fl = isC ? 0.06 : 0.085;
    body.add(an, 'ell', [B.legR[1] * 1.15, B.legR[1] * 0.75, fl * 0.62], { pos: [0, -0.012, fl * 0.32], blend: 0.015, color: C.shoes, sharp: 0.004 });
    return { th, kn, an, s };
  });

  // ---- tête (sculpture fine) ----
  const head = new Sculpture({ cell: 0.0015, color: C.skin, material: CLAY() });
  const hroot = group(); headB.add(hroot);
  const hs = B.headS, J = B.jaw, k = hs[1] / 0.088;
  const jaw = group([0, -0.028 * k, 0.012 * k]); hroot.add(jaw);
  const browB = [-1, 1].map((s) => { const b = group([s * 0.028 * k, 0.03 * k, 0.07 * k]); hroot.add(b); return b; });
  const lipU = group([0, -0.048 * k, 0.075 * k]); hroot.add(lipU);
  // crâne, joues, mâchoire, menton
  head.add(hroot, 'ell', hs, { pos: [0, 0.012 * k, 0], blend: 0.03 });
  head.add(hroot, 'cone', [B.neckR * 0.95, B.neckR * 1.05, 0.06 * k], { pos: [0, -0.06 * k, -0.015 * k], rot: [PI - 0.15, 0, 0], blend: 0.03 });
  head.add(jaw, 'ell', [0.054 * k * J, 0.036 * k, 0.056 * k], { pos: [0, -0.014 * k, 0.012 * k], blend: 0.018 });
  [-1, 1].forEach((s) => head.add(jaw, 'ell', [0.018 * k, 0.03 * k, 0.034 * k], { pos: [s * 0.044 * k * J, -0.022 * k, 0.0], rot: [0.5, 0, s * 0.3], blend: 0.014 })); // angles de la mâchoire
  head.add(jaw, 'ell', [0.022 * k * J, 0.017 * k, 0.019 * k], { pos: [0, -0.04 * k, 0.056 * k], blend: 0.012 }); // menton
  [-1, 1].forEach((s) => head.add(hroot, 'ell', [0.022 * k, 0.016 * k, 0.018 * k], { pos: [s * 0.04 * k, -0.008 * k, 0.058 * k], blend: 0.014 })); // pommettes
  // nez large et rond, ailes du nez
  const noseG = group([0, -0.012 * k, 0.083 * k]); hroot.add(noseG);
  head.add(noseG, 'ell', [0.012 * k, 0.026 * k, 0.016 * k], { pos: [0, 0.008 * k, -0.004 * k], rot: [-0.25, 0, 0], blend: 0.012 });
  head.add(noseG, 'ell', [0.016 * k, 0.012 * k, 0.014 * k], { pos: [0, -0.012 * k, 0.006 * k], blend: 0.01 });
  [-1, 1].forEach((s) => head.add(noseG, 'ell', [0.01 * k, 0.009 * k, 0.01 * k], { pos: [s * 0.015 * k, -0.015 * k, -0.002 * k], blend: 0.006 }));
  const nostrils = [-1, 1].map((s) => head.add(noseG, 'ell', [0.0035 * k, 0.0022 * k, 0.004 * k], { pos: [s * 0.0085 * k, -0.021 * k, 0.002 * k], op: 'sub', blend: 0.002 }));
  // arcades (sur des os mobiles), orbites creusées
  browB.forEach((b, i) => head.add(b, 'ell', [0.027 * k, 0.009 * k, 0.014 * k], { rot: [0, (i ? -1 : 1) * 0.25, 0], blend: 0.012 }));
  const browHair = browB.map((b, i) => head.add(b, 'ell', [0.022 * k, 0.0045 * k, 0.012 * k], { pos: [0, 0.004 * k, 0.006 * k], rot: [0, (i ? -1 : 1) * 0.25, 0], op: 'paint', color: C.hair, sharp: 0.0018 }));
  [-1, 1].forEach((s) => head.add(hroot, 'ell', [0.018 * k, 0.015 * k, 0.016 * k], { pos: [s * 0.028 * k, 0.011 * k, 0.066 * k], op: 'sub', blend: 0.006 }));
  // oreilles
  [-1, 1].forEach((s) => { head.add(hroot, 'ell', [0.008 * k, 0.02 * k, 0.014 * k], { pos: [s * hs[0] * 0.98, 0.0, -0.006 * k], rot: [0, s * 0.3, 0], blend: 0.01 }); head.add(hroot, 'ell', [0.004 * k, 0.011 * k, 0.007 * k], { pos: [s * (hs[0] * 0.98 + 0.006 * k), 0.0, -0.004 * k], op: 'sub', blend: 0.004 }); });
  // lèvres et bouche (ouverture pilotée par la mâchoire + creusement)
  const upperLip = head.add(lipU, 'ell', [0.022 * k, 0.0075 * k, 0.012 * k], { pos: [0, 0, 0], blend: 0.008, color: C.lips, sharp: 0.003 });
  const lowerLip = head.add(jaw, 'ell', [0.021 * k, 0.008 * k, 0.012 * k], { pos: [0, -0.024 * k, 0.064 * k], blend: 0.008, color: C.lips, sharp: 0.003 });
  const mouthHole = head.add(hroot, 'ell', [0.02 * k, 0.002 * k, 0.03 * k], { pos: [0, -0.056 * k, 0.07 * k], op: 'sub', blend: 0.005 });
  const mouthIn = head.add(hroot, 'ell', [0.024 * k, 0.03 * k, 0.03 * k], { pos: [0, -0.06 * k, 0.062 * k], op: 'paint', color: 0x2a0d0c, sharp: 0.004 });
  // cheveux / barbe
  if (kind === 'man') {
    head.add(hroot, 'ell', [hs[0] * 1.03, hs[1] * 0.92, hs[2] * 1.0], { pos: [0, 0.026 * k, -0.01 * k], blend: 0.008, color: C.hair, sharp: 0.003 });
    head.add(hroot, 'ell', [0.086 * k, 0.086 * k, 0.1 * k], { pos: [0, 0.042 * k, -0.03 * k], op: 'paint', color: C.hair, sharp: 0.0025 });
    head.add(jaw, 'ell', [0.066 * k * J, 0.034 * k, 0.07 * k], { pos: [0, -0.03 * k, 0.03 * k], op: 'paint', color: C.beard ?? 0x2a1810, sharp: 0.005 }); // barbe courte
    head.add(lipU, 'ell', [0.026 * k, 0.006 * k, 0.012 * k], { pos: [0, 0.008 * k, 0.002 * k], op: 'paint', color: C.beard ?? 0x2a1810, sharp: 0.003 }); // moustache
  } else if (isW) {
    head.add(hroot, 'ell', [hs[0] * 1.12, hs[1] * 0.95, hs[2] * 1.06], { pos: [0, 0.03 * k, -0.012 * k], blend: 0.012, color: C.hair, sharp: 0.003 });
    head.add(hroot, 'ell', [0.09 * k, 0.088 * k, 0.102 * k], { pos: [0, 0.046 * k, -0.028 * k], op: 'paint', color: C.hair, sharp: 0.0025 });
    head.add(hroot, 'ell', [0.05 * k, 0.045 * k, 0.045 * k], { pos: [0, 0.075 * k, -0.06 * k], blend: 0.02, color: C.hair, sharp: 0.003 }); // chignon
    head.add(hroot, 'ell', [hs[0] * 1.14, 0.012 * k, hs[2] * 1.08], { pos: [0, 0.052 * k, -0.01 * k], rot: [-0.3, 0, 0], blend: 0.006, color: C.band ?? 0xc9a23a, sharp: 0.003 }); // bandeau
  } else {
    head.add(hroot, 'ell', [hs[0] * 1.06, hs[1] * 0.9, hs[2] * 1.02], { pos: [0, 0.03 * k, -0.012 * k], blend: 0.012, color: C.hair, sharp: 0.003 });
    head.add(hroot, 'ell', [0.086 * k, 0.086 * k, 0.1 * k], { pos: [0, 0.045 * k, -0.03 * k], op: 'paint', color: C.hair, sharp: 0.0025 });
  }
  hroot.add(head.mesh);
  // dents (haut, fixes ; bas, sur la mâchoire) et yeux
  const teethM = mat(0xcfc6b2, 0.5);
  const teethU = new THREE.Mesh(new THREE.CylinderGeometry(0.016 * k, 0.016 * k, 0.005 * k, 16, 1, false, -1.0, 2.0), teethM); teethU.position.set(0, -0.051 * k, 0.054 * k); hroot.add(teethU);
  const teethL = new THREE.Mesh(new THREE.CylinderGeometry(0.017 * k, 0.017 * k, 0.006 * k, 16, 1, false, -1.1, 2.2), teethM); teethL.position.set(0, -0.026 * k, 0.046 * k); jaw.add(teethL);
  const lidM = mat(C.skinDark, 0.7);
  const eyes = [-1, 1].map((s) => { const e = makeEye(0.0128 * k, lidM, C.iris, lidM, s, 1.12); e.position.set(s * 0.028 * k, 0.011 * k, 0.06 * k); e.rotation.y = s * 0.12; e.userData.brow.visible = false; hroot.add(e); return e; });

  let lastBody = '', lastHead = '';
  function pose(P = {}) {
    const p = { ...H0, ...P };
    hips.position.y = B.hipY + p.hipsY; hips.rotation.set(p.lean * 0.3, p.twist, p.leanSide * 0.5);
    spine.rotation.set(p.lean * 0.4, p.chestTwist * 0.5, p.leanSide * 0.5);
    chest.rotation.set(p.lean * 0.3 + p.chestLean, p.chestTwist * 0.5, 0);
    neck.rotation.set(p.headNod * 0.5 - p.lean * 0.45, p.headTurn * 0.5, p.headTilt * 0.5);
    headB.rotation.set(p.headNod * 0.5 - p.lean * 0.3, p.headTurn * 0.5, p.headTilt * 0.5);
    arms.forEach((a, i) => {
      const [fw, out, bend] = i ? p.armL : p.armR; const tw = i ? p.armTwistL : p.armTwistR; const [wx, wz] = i ? p.wristL : p.wristR;
      a.sh.rotation.set(-fw, tw, a.s * out); a.el.rotation.set(-bend, 0, 0); a.wr.rotation.set(wx, 0, a.s * wz);
    });
    legs.forEach((l, i) => { const [fw, out, kn] = i ? p.legL : p.legR; l.th.rotation.set(-fw - p.lean * 0.3, 0, l.s * out); l.kn.rotation.set(kn, 0, 0); l.an.rotation.set(-kn + fw - (i ? p.footL : p.footR) + p.lean * 0.3, 0, -l.s * out * 0.8); });
    // visage
    jaw.rotation.x = p.mouth * 0.32;
    jaw.position.x = 0;
    browB.forEach((b, i) => { const s = i ? 1 : -1; b.position.y = (0.03 + p.brow * 0.007) * k; b.rotation.z = -s * p.browAng * 0.35; b.position.z = (0.07 - Math.max(0, -p.browAng) * 0.004) * k; });
    lipU.position.set(0, (-0.048 + p.sneer * 0.004) * k, 0.075 * k);
    upperLip.size = [(0.022 + p.mouthW * 0.006) * k, 0.0075 * k, 0.012 * k];
    lowerLip.size = [(0.021 + p.mouthW * 0.006) * k, 0.008 * k, 0.012 * k];
    mouthHole.size = [(0.019 + p.mouthW * 0.009 + p.smile * 0.004) * k, (0.0025 + p.mouth * 0.016) * k, 0.03 * k];
    mouthHole.pos = [0, (-0.05 - p.mouth * 0.008) * k, 0.07 * k];
    mouthHole.local.compose(new THREE.Vector3(...mouthHole.pos), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
    teethU.visible = false; teethL.visible = false;
    teethU.scale.x = 1 + p.mouthW * 0.3; teethL.scale.x = 1 + p.mouthW * 0.3;
    eyes.forEach((e, i) => poseEye(e, { lookX: p.lookX, lookY: p.lookY, lid: p.lid, lidLow: p.lidLow, tilt: p.tilt, pupil: p.pupil, scale: p.eyeScale }));
    arms.forEach((a, i) => a.hand.pose(i ? p.fistL : p.fistR, i ? p.thumbL : p.thumbR));
    // ne recalcule les sculptures que si la pose a changé
    const kb = JSON.stringify([p.hipsY, p.lean, p.leanSide, p.twist, p.chestTwist, p.chestLean, p.armL, p.armR, p.armTwistL, p.armTwistR, p.legL, p.legR, p.footL, p.footR]);
    if (kb !== lastBody) { body.update(root); lastBody = kb; }
    const kh = JSON.stringify([p.mouth, p.mouthW, p.smile, p.sneer, p.brow, p.browAng]);
    if (kh !== lastHead) { head.update(hroot); lastHead = kh; }
  }
  root.add(body.mesh);
  pose();
  return { root, pose, parts: { head: hroot, hips, chest, hands: arms.map((a) => a.wr), handsL: arms }, body, head };
}
