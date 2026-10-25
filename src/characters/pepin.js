// PÉPIN — l'écureuil volant héros, version SCULPTÉE (style Oscar & Co).
// Chétif et nerveux : petit corps sec, cou fin extensible, pattes-bâtons, grosse tête au long museau,
// arcades sourcilières sculptées, yeux exorbités ambrés dans leurs orbites, grandes incisives, mèche en bataille,
// grandes mains à longs doigts, membrane de vol bordée de sombre, queue plate et touffue.
// Orienté vers +z. Longueur ~0.55 (sans la queue).
import * as THREE from 'three';
import { Sculpture } from '../engine/sculpt.js';
import { mat, sph, cap, group, makeEye, poseEye } from './parts.js';

export const P0 = {
  squash: 1, pitch: 0, roll: 0, yaw: 0, bodyY: 0,
  headTurn: 0, headTilt: 0, headNod: 0,
  // membres : [swing (avant +), spread (écarté +), bend (coude/genou)]
  armL: [0.2, 0.15, 0.4], armR: [0.2, 0.15, 0.4], legL: [-0.2, 0.15, -0.6], legR: [-0.2, 0.15, -0.6],
  tailCurl: 0.6, tailWave: 0, tailPhase: 0, tailSide: 0, tailFluff: 1,
  eyeScale: 1, lookX: 0, lookY: 0, lid: 0.48, lidLow: 0.12, tilt: 0, pupil: 1, wink: 0, cross: 0, brow: 0, browAng: 0,
  mouth: 0, smile: 0.3, smirk: 0, teeth: 1, cheeks: 0, nose: 0, earBack: 0, tuft: 0, billow: 0.3,
  // élasticité cartoon : cou extensible, yeux qui jaillissent, doigts écartés, langue, tête étirée
  neck: 1, eyePop: 0, eyeL: 1, eyeR: 1, splitEyes: 0, fingers: 0.3, tongue: 0, stretchX: 1,
};

const C = { back: 0x7a5f4c, side: 0xa36f45, belly: 0xeadac0, dark: 0x3a2a20, rim: 0xf1e6d2, pink: 0xd08c86, nose: 0x7a3c3c };
const PI = Math.PI;

export function createPepin() {
  const S = new Sculpture({ cell: 0.0055, color: C.back });
  const root = new THREE.Group(), squash = new THREE.Group(); root.add(squash);
  const body = group([0, 0.22, 0]); squash.add(body);
  const neck = group([0, 0.04, 0.17]); body.add(neck);
  const neckStem = group([0, 0, 0]); neckStem.rotation.x = 0.45; neck.add(neckStem);
  const head = group([0, 0.11, 0.05]); neck.add(head);
  const jaw = group([0, -0.07, 0.04]); head.add(jaw);
  const brows = [-1, 1].map((s) => { const b = group([s * 0.068, 0.1, 0.12]); head.add(b); return b; });
  const earG = [-1, 1].map((s) => { const e = group([s * 0.1, 0.11, -0.04]); head.add(e); return e; });

  // corps sec : dos brun, flancs cannelle, ventre crème peint
  S.add(body, 'ell', [0.075, 0.072, 0.19], { pos: [0, 0.01, 0.02], blend: 0.03 });
  S.add(body, 'ell', [0.07, 0.05, 0.16], { pos: [0, -0.035, 0.03], op: 'paint', color: C.belly, sharp: 0.012 });
  S.add(body, 'ell', [0.08, 0.03, 0.17], { pos: [0, -0.005, 0.02], op: 'paint', color: C.side, sharp: 0.015 });
  S.add(neckStem, 'cone', [0.034, 0.03, 0.1], { pos: [0, 0, 0], blend: 0.03 });
  // tête : grosse, crâne bombé, long museau crème, joues-abajoues, oreilles pointues (gauche cabossée)
  S.add(head, 'ell', [0.15, 0.13, 0.155], { blend: 0.03 });
  S.add(head, 'cone', [0.085, 0.038, 0.16], { pos: [0, -0.04, 0.06], rot: [PI / 2 - 0.12, 0, 0], blend: 0.045, color: C.belly });
  const cheekP = [-1, 1].map((s) => S.add(head, 'ell', [0.05, 0.045, 0.045], { pos: [s * 0.075, -0.06, 0.09], blend: 0.035, color: C.side }));
  earG.forEach((e, i) => {
    const s = i ? 1 : -1;
    S.add(e, 'ell', [0.045, s < 0 ? 0.068 : 0.08, 0.016], { pos: [0, 0.045, 0], blend: 0.02 });
    S.add(e, 'ell', [0.032, s < 0 ? 0.05 : 0.06, 0.02], { pos: [0, 0.045, 0.014], op: 'paint', color: C.pink, sharp: 0.004 });
  });
  // arcades sourcilières sculptées (sombres) + orbites creusées
  brows.forEach((b) => S.add(b, 'ell', [0.048, 0.014, 0.024], { blend: 0.018, color: C.dark, sharp: 0.006 }));
  [-1, 1].forEach((s) => S.add(head, 'ell', [0.066, 0.062, 0.05], { pos: [s * 0.068, 0.05, 0.12], op: 'sub', blend: 0.015 }));
  S.add(head, 'ell', [0.06, 0.008, 0.05], { pos: [0, -0.08, 0.18], op: 'sub', blend: 0.008 }); // fente de bouche
  S.add(jaw, 'ell', [0.07, 0.03, 0.11], { pos: [0, -0.012, 0.1], blend: 0.025, color: C.belly });
  // membres en bâtons
  const limb = (p, upper, lower, r1, r2) => {
    const sh = group(p); body.add(sh); const el = group([0, -upper, 0]); sh.add(el); const tip = group([0, -lower - 0.02, 0]); el.add(tip);
    S.add(sh, 'cone', [r1, r1 * 0.85, upper], { rot: [PI, 0, 0], blend: 0.02, color: C.side });
    S.add(el, 'cone', [r1 * 0.85, r2, lower], { rot: [PI, 0, 0], blend: 0.015, color: C.side });
    return { sh, el, tip };
  };
  const arms = [-1, 1].map((s) => { const L = limb([s * 0.06, -0.02, 0.14], 0.11, 0.105, 0.02, 0.015); L.s = s; return L; });
  const legs = [-1, 1].map((s) => {
    const L = limb([s * 0.062, -0.02, -0.13], 0.12, 0.12, 0.022, 0.016); L.s = s;
    S.add(L.sh, 'ell', [0.04, 0.05, 0.05], { pos: [0, -0.025, 0], blend: 0.03, color: C.side });
    S.add(L.tip, 'ell', [0.028, 0.016, 0.07], { pos: [0, 0, 0.035], blend: 0.015, color: C.belly });
    return L;
  });
  // queue plate et touffue
  const tailSegs = []; let par = group([0, 0.02, -0.19]); body.add(par); const tailRoot = par;
  for (let i = 0; i < 9; i++) {
    const g = group([0, 0, i ? -0.085 : 0]); par.add(g); tailSegs.push(g); par = g;
    const w = 0.03 + Math.sin((i / 8) * PI * 0.85) * 0.045;
    S.add(g, 'ell', [w, 0.032, 0.062], { pos: [0, 0, -0.04], blend: 0.04, color: i === 8 ? C.dark : i % 2 ? C.side : C.back });
  }
  root.add(S.mesh);

  // pièces non sculptées
  const belly = mat(C.belly, 0.9), claw = mat(0x2a1d16, 0.4);
  const eyes = [-1, 1].map((s) => {
    const e = makeEye(0.064, mat(C.back, 0.85), 0xc98a1b, mat(C.dark, 0.8), s, 1.05);
    e.position.set(s * 0.068, 0.05, 0.12); e.userData.base = e.position.clone(); e.rotation.y = s * 0.28; e.userData.brow.visible = false; head.add(e); return e;
  });
  const nose = sph(0.022, mat(C.nose, 0.2), [1.4, 1, 1], [0, -0.012, 0.262]); head.add(nose);
  const whisk = mat(0x2a1d16, 0.6);
  [-1, 1].forEach((s) => [0.2, 0.02, -0.14].forEach((a, i) => head.add(cap(0.0022, 0.24, whisk, [s * 0.075, -0.035, 0.215 - i * 0.008], [0, s * 0.35, PI / 2 + s * a]))));
  head.add(sph(0.06, mat(0x5e1220, 0.85), [0.95, 0.6, 1.3], [0, -0.075, 0.11]));
  const tongue = sph(0.045, mat(0xe0566e, 0.45), [0.85, 0.3, 1.2], [0, 0.008, 0.1]); jaw.add(tongue);
  const toothM = mat(0xfff6dc, 0.25);
  const teeth = group([0, -0.072, 0.232], cap(0.011, 0.03, toothM, [-0.012, -0.018, 0], [0.15, 0, 0.06]), cap(0.011, 0.022, toothM, [0.012, -0.014, 0.002], [0.15, 0, -0.1])); head.add(teeth);
  const smileM = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.0045, 6, 20, PI * 0.9), mat(0x2a120c, 0.7)); smileM.position.set(0, -0.06, 0.219); head.add(smileM);
  // mèche en bataille
  const tuft = group([0, 0.13, 0.04]); head.add(tuft);
  const spikes = [[-0.05, -0.6, 0.7, 0], [-0.035, -0.35, 1.0, 0.02], [-0.018, -0.15, 1.2, -0.01], [0, 0.02, 1.35, 0.015], [0.018, 0.2, 1.15, -0.02], [0.035, 0.4, 0.95, 0.01], [0.05, 0.65, 0.7, 0]].map(([x, a, l, z]) => {
    const g = group([x, 0, z]); const c = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.1 * l, 7), mat(C.dark, 0.9)); c.position.y = 0.05 * l; c.rotation.x = 0.25; c.castShadow = true; g.add(c); g.rotation.z = -a; tuft.add(g); return g;
  });
  // grandes mains à longs doigts
  const fingerGroups = [];
  arms.forEach((a) => {
    const g = group([0, 0, 0]); a.tip.add(g); g.add(sph(0.024, belly, [1.15, 0.55, 1.1]));
    [-1.5, -0.5, 0.5, 1.5].forEach((k) => {
      const f = group([k * 0.011, 0, 0.012]); f.userData.k = k; g.add(f); fingerGroups.push(f);
      f.add(cap(0.0062, 0.05, belly, [0, 0, 0.028], [PI / 2, 0, 0]));
      const c = new THREE.Mesh(new THREE.ConeGeometry(0.004, 0.014, 5), claw); c.rotation.x = PI / 2; c.position.set(0, 0, 0.065); f.add(c);
    });
  });

  // membranes de vol (reconstruites à chaque pose) : dessus brun, bordure sombre puis frange claire
  const NU = 10, NV = 7;
  const memMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, side: THREE.DoubleSide });
  const membranes = [-1, 1].map((s) => {
    const g = new THREE.BufferGeometry(); const n = (NU + 1) * (NV + 1);
    g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(n * 3), 3));
    const col = [], idx = [], cA = new THREE.Color(C.side), cD = new THREE.Color(C.dark), cR = new THREE.Color(C.rim);
    for (let j = 0; j <= NV; j++) for (let i = 0; i <= NU; i++) { const v = j / NV; const c = v < 0.75 ? cA.clone().lerp(cD, Math.pow(v / 0.75, 3)) : cD.clone().lerp(cR, (v - 0.75) / 0.25); col.push(c.r, c.g, c.b); }
    for (let j = 0; j < NV; j++) for (let i = 0; i < NU; i++) { const a = j * (NU + 1) + i, b = a + NU + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx);
    const m = new THREE.Mesh(g, memMat); m.castShadow = true; m.frustumCulled = false; body.add(m);
    return { g, s };
  });
  const Q = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()], V3 = new THREE.Vector3();

  function pose(p = {}) {
    p = { ...P0, ...p };
    const s = p.squash; squash.scale.set(1 / Math.sqrt(s), s, 1 / Math.sqrt(s));
    body.position.y = 0.22 + p.bodyY;
    body.rotation.set(p.pitch, p.yaw, p.roll);
    neck.rotation.set(p.headNod - p.pitch * 0.95, p.headTurn, p.headTilt);
    neckStem.scale.set(1, p.neck, 1);
    head.position.set(0, 0.11 + (p.neck - 1) * 0.105, 0.05 + (p.neck - 1) * 0.045);
    head.scale.set(p.stretchX, 1, 1);
    fingerGroups.forEach((f) => (f.rotation.y = f.userData.k * (0.12 + p.fingers * 0.3)));
    const setLimb = (L, [sw, sp, bd], leg) => { L.sh.rotation.set(-sw, 0, L.s * sp); L.el.rotation.set(leg ? bd : -bd, 0, 0); };
    setLimb(arms[0], p.armL); setLimb(arms[1], p.armR); setLimb(legs[0], p.legL, true); setLimb(legs[1], p.legR, true);
    tailSegs.forEach((g, i) => { g.rotation.set(p.tailCurl * 0.22 + Math.sin(p.tailPhase - i * 0.7) * p.tailWave * 0.12, p.tailSide * 0.08 + Math.sin(p.tailPhase * 0.7 - i * 0.5) * p.tailWave * 0.06, 0); g.scale.x = p.tailFluff; });
    tailRoot.rotation.x = -0.2;
    // arcades : hauteur (brow) et angle (browAng < 0 = en V), suivent les yeux qui jaillissent
    brows.forEach((b, i) => { const sd = i ? 1 : -1; b.position.set(sd * 0.068, 0.1 + p.brow * 0.014 + p.eyePop * 0.04 - p.lid * 0.006, 0.12 + p.eyePop * 0.02); b.rotation.z = sd * (-p.browAng * 0.55 + (i ? -1 : 1) * p.smirk * 0.25); });
    eyes.forEach((e, i) => {
      const sd = i ? 1 : -1, pop = p.eyePop;
      e.position.copy(e.userData.base).add(V3.set(sd * 0.02 * pop, 0.035 * pop, 0.03 * pop));
      poseEye(e, { lookX: p.lookX + (i ? -1 : 1) * p.cross + sd * p.splitEyes, lookY: p.lookY + (i ? 0.4 : -0.4) * p.splitEyes, lid: i ? Math.max(p.lid, p.wink) : p.lid, lidLow: p.lidLow, tilt: p.tilt, pupil: p.pupil,
        scale: p.eyeScale * (1 + pop * 0.55) * (i ? p.eyeR : p.eyeL) });
    });
    const mo = p.mouth; jaw.rotation.x = Math.min(mo, 0.6) * 1.3; jaw.scale.set(1 + mo * 0.25, 1 + Math.max(0, mo - 0.4) * 1.6, 1 + Math.max(0, mo - 0.4) * 0.5);
    jaw.position.y = -0.07 - Math.max(0, mo - 0.5) * 0.06;
    tongue.position.z = 0.1 + p.tongue * 0.07; tongue.scale.set(0.85, 0.3, 1.2 + p.tongue * 0.8);
    teeth.visible = p.teeth > 0.5;
    smileM.visible = mo < 0.12; smileM.rotation.z = (p.smile >= 0 ? PI * 1.05 : PI * 0.05) + p.smirk * 0.35;
    smileM.scale.set(1, Math.abs(p.smile) * 1.2 + 0.2, 1); smileM.position.y = p.smile >= 0 ? -0.06 : -0.098;
    cheekP.forEach((c) => (c.size = [0.05 * (1 + p.cheeks * 1.3), 0.045 * (1 + p.cheeks * 1.0), 0.045 * (1 + p.cheeks * 1.0)]));
    nose.scale.setScalar(1 + p.nose * 0.5);
    earG.forEach((e, i) => e.rotation.set(-0.2 - p.earBack * 0.9, 0, (i ? -1 : 1) * (0.3 + p.earBack * 0.4)));
    spikes.forEach((g, i) => { g.rotation.x = -0.5 + p.tuft * 0.5 - (p.tuft < 0 ? 0.6 * -p.tuft : 0) + (i % 2) * 0.15; g.scale.y = 1 + Math.max(0, p.tuft) * 0.35; });
    S.update(root);
    membranes.forEach(({ g, s: sd }, k) => {
      Q[0].set(sd * 0.068, -0.005, 0.14); body.worldToLocal(arms[k].tip.getWorldPosition(Q[1]));
      body.worldToLocal(legs[k].tip.getWorldPosition(Q[2])); Q[3].set(sd * 0.068, -0.005, -0.13);
      const pos = g.attributes.position; let n = 0; const span = Q[1].distanceTo(Q[2]);
      for (let j = 0; j <= NV; j++) {
        const v = j / NV;
        for (let i = 0; i <= NU; i++) {
          const u = i / NU, sc = Math.sin(u * PI) * 0.18 * v * v;
          const ix = Q[0].x + (Q[3].x - Q[0].x) * u, iy = Q[0].y + (Q[3].y - Q[0].y) * u, iz = Q[0].z + (Q[3].z - Q[0].z) * u;
          const ox = Q[1].x + (Q[2].x - Q[1].x) * u, oy = Q[1].y + (Q[2].y - Q[1].y) * u, oz = Q[1].z + (Q[2].z - Q[1].z) * u;
          const y = iy + (oy - iy) * v + Math.sin(u * PI) * Math.sin(v * PI) * p.billow * span * 0.12;
          pos.setXYZ(n++, ix + (ox - ix) * (v - sc * 0.6), y, iz + (oz - iz) * v);
        }
      }
      pos.needsUpdate = true; g.computeVertexNormals(); g.computeBoundingSphere();
    });
  }
  pose();
  return { root, pose, parts: { head, body, mouth: jaw, hands: arms.map((a) => a.tip) } };
}

// Poses de base (à mélanger avec blend)
export const POSE = {
  sit: { pitch: -1.15, bodyY: 0.06, armL: [1.5, 0.1, 1.2], armR: [1.5, 0.1, 1.2], legL: [1.1, 0.25, 1.9], legR: [1.1, 0.25, 1.9], tailCurl: 2.4, billow: 0.1 },
  stand: { pitch: 0, armL: [0.1, 0.1, 0.3], armR: [0.1, 0.1, 0.3], legL: [-0.1, 0.15, -0.5], legR: [-0.1, 0.15, -0.5], tailCurl: 1.6 },
  glide: { pitch: 0, armL: [0.55, 1.35, 0.05], armR: [0.55, 1.35, 0.05], legL: [-0.45, 1.25, 0.05], legR: [-0.45, 1.25, 0.05], tailCurl: 0.1, billow: 0.7, earBack: 0.6 },
  curl: { pitch: -0.2, squash: 0.9, armL: [1.6, 0.0, 1.8], armR: [1.6, 0.0, 1.8], legL: [1.4, 0.1, 2.0], legR: [1.4, 0.1, 2.0], tailCurl: 3.4, billow: 0.05, lid: 1 },
  splat: { pitch: 0, armL: [0.2, 1.5, 0], armR: [0.2, 1.5, 0], legL: [-0.2, 1.5, 0], legR: [-0.2, 1.5, 0], tailCurl: -0.4, billow: 0.0 },
};

export function blend(a, b, k) {
  a = { ...P0, ...a }; b = { ...P0, ...b };
  const out = { ...a };
  for (const key of Object.keys(b)) { const va = a[key], vb = b[key]; out[key] = Array.isArray(vb) ? vb.map((x, i) => va[i] + (x - va[i]) * k) : va + (vb - va) * k; }
  return out;
}
