// PÉPIN — l'écureuil volant héros, version caricature (public ados / tout public, pas « bébé »).
// Museau long, grandes incisives de travers, yeux exorbités ambrés aux paupières lourdes, sourcils broussailleux,
// oreille ébréchée, mèche en bataille, fourrure en relief, membrane de vol bordée de sombre.
// Orienté vers +z. Longueur ~0.55 (sans la queue).
import * as THREE from 'three';
import { mat, sph, cap, group, makeEye, poseEye } from './parts.js';
import { addFur } from '../engine/fur.js';

export const P0 = {
  squash: 1, pitch: 0, roll: 0, yaw: 0, bodyY: 0,
  headTurn: 0, headTilt: 0, headNod: 0,
  // membres : [swing (avant +), spread (écarté +), bend (coude/genou)]
  armL: [0.2, 0.15, 0.4], armR: [0.2, 0.15, 0.4], legL: [-0.2, 0.15, -0.6], legR: [-0.2, 0.15, -0.6],
  tailCurl: 0.6, tailWave: 0, tailPhase: 0, tailSide: 0, tailFluff: 1,
  eyeScale: 1, lookX: 0, lookY: 0, lid: 0.48, lidLow: 0.12, wink: 0, cross: 0, brow: 0, browAng: 0,
  mouth: 0, smile: 0.3, smirk: 0, teeth: 1, cheeks: 0, nose: 0, earBack: 0, tuft: 0, billow: 0.3,
  // élasticité cartoon : cou extensible, yeux qui jaillissent (chacun le sien), doigts écartés, langue
  neck: 1, eyePop: 0, eyeL: 1, eyeR: 1, splitEyes: 0, fingers: 0.3, tongue: 0, stretchX: 1,
};

const C = { back: 0x7f6350, side: 0xa8744a, belly: 0xeedcc0, dark: 0x3e2c22, rim: 0xf1e6d2, pink: 0xd98a86, nose: 0x8a4a4a };

export function createPepin({ fur: withFur = true } = {}) {
  const back = mat(C.back, 0.95), side = mat(C.side, 0.95), belly = mat(C.belly, 0.95), dark = mat(C.dark, 0.9), pink = mat(C.pink, 0.7);
  const F = (m, o) => (withFur ? addFur(m, o) : m);
  const root = new THREE.Group(), squash = new THREE.Group(); root.add(squash);
  const body = group([0, 0.22, 0]); squash.add(body);

  // tronc nerveux : dos gris-brun, flancs cannelle, ventre crème
  F((body.add(sph(0.085, back, [1, 0.95, 2.3], [0, 0.01, 0.02])), body.children.at(-1)), { length: 0.012, density: 380 });
  F((body.add(sph(0.078, side, [1.08, 0.75, 2.1], [0, -0.012, 0.02])), body.children.at(-1)), { length: 0.01, density: 380 });
  F((body.add(sph(0.068, belly, [0.85, 0.7, 2.0], [0, -0.03, 0.03])), body.children.at(-1)), { length: 0.009, density: 380, comb: [0, -0.2, -0.3] });

  // tête
  const neck = group([0, 0.04, 0.17]); body.add(neck);
  const neckStem = group([0, 0, 0]); neckStem.rotation.x = 0.45; neck.add(neckStem);
  neckStem.add(F(cap(0.028, 0.08, back, [0, 0.05, 0]), { length: 0.01, density: 380 }));
  const head = group([0, 0.11, 0.05]); neck.add(head);
  F((head.add(sph(0.155, back, [1.02, 0.9, 1.05])), head.children.at(-1)), { length: 0.018, comb: [0, 0.1, -0.7] });
  F((head.add(sph(0.095, belly, [0.95, 0.5, 1.5], [0, -0.035, 0.11])), head.children.at(-1)), { length: 0.012, comb: [0, -0.3, 0.2] });
  // intérieur de la gueule (visible quand la mâchoire tombe)
  head.add(sph(0.07, mat(0x5e1220, 0.85), [0.95, 0.75, 1.3], [0, -0.075, 0.1]));
  const jaw = group([0, -0.07, 0.04]); head.add(jaw);
  F((jaw.add(sph(0.08, belly, [0.92, 0.42, 1.45], [0, -0.012, 0.105])), jaw.children.at(-1)), { length: 0.01, comb: [0, -0.4, 0.2] });
  const tongue = sph(0.05, mat(0xe0566e, 0.45), [0.85, 0.3, 1.2], [0, 0.012, 0.1]); jaw.add(tongue);
  jaw.add(cap(0.008, 0.012, mat(0xfff6dc, 0.25), [-0.009, 0.02, 0.215], [0, 0, 0]), cap(0.008, 0.012, mat(0xfff6dc, 0.25), [0.009, 0.02, 0.215], [0, 0, 0]));
  const nose = sph(0.022, mat(C.nose, 0.2), [1.4, 1, 1], [0, -0.012, 0.252]); head.add(nose);
  const whisk = mat(0x2a1d16, 0.6);
  [-1, 1].forEach((s) => [0.2, 0.02, -0.14].forEach((a, i) => head.add(cap(0.0025, 0.24, whisk, [s * 0.075, -0.035, 0.215 - i * 0.008], [0, s * 0.35, Math.PI / 2 + s * a]))));
  // bouche + grandes incisives de travers
  const mouth = group([0, -0.065, 0.215]); head.add(mouth);
  const mouthIn = sph(0.045, mat(0x4a141c, 0.8), [1.3, 0.35, 0.55]); mouth.add(mouthIn);
  const toothM = mat(0xfff6dc, 0.25);
  const teeth = group([0, 0.006, 0.018], cap(0.011, 0.03, toothM, [-0.012, -0.018, 0], [0, 0, 0.06]), cap(0.011, 0.022, toothM, [0.012, -0.014, 0.002], [0, 0, -0.1])); mouth.add(teeth);
  const smileM = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.005, 6, 20, Math.PI * 0.9), mat(0x2a120c, 0.7)); smileM.position.set(0, 0.012, 0.004); mouth.add(smileM);
  // joues (abajoues extensibles)
  const cheeks = [-1, 1].map((s) => { const c = sph(0.045, side, [1, 0.9, 0.9], [s * 0.08, -0.06, 0.085]); head.add(c); F(c, { length: 0.01 }); return c; });
  // yeux exorbités, iris ambre, paupières lourdes
  const eyes = [-1, 1].map((s) => {
    const e = makeEye(0.068, back, 0xc98a1b, dark, s, 1.05);
    e.position.set(s * 0.068, 0.05, 0.118); e.userData.base = e.position.clone(); e.rotation.y = s * 0.28; head.add(e);
    e.userData.brow.scale.set(1.6, 1.1, 1.1); F(e.userData.brow, { length: 0.01, shells: 8, density: 500, comb: [0, 0.3, 0.3] }); // sourcils broussailleux
    return e;
  });
  // oreilles pointues, la gauche ébréchée
  const ears = [-1, 1].map((s) => {
    const e = group([s * 0.1, 0.11, -0.04]); head.add(e);
    F((e.add(sph(0.055, back, [0.85, 1.45, 0.32], [0, 0.04, 0])), e.children.at(-1)), { length: 0.01 });
    e.add(sph(0.04, pink, [0.8, 1.35, 0.18], [0, 0.04, 0.012]));
    if (s < 0) e.scale.set(0.9, 0.82, 1); // oreille gauche plus courte et cabossée
    return e;
  });
  // mèche en bataille
  const tuft = group([0, 0.14, 0.03]); head.add(tuft);
  const tuftMat = mat(C.dark, 0.9);
  const spikes = [[-0.05, -0.6, 0.7, 0], [-0.035, -0.35, 1.0, 0.02], [-0.018, -0.15, 1.2, -0.01], [0, 0.02, 1.35, 0.015], [0.018, 0.2, 1.15, -0.02], [0.035, 0.4, 0.95, 0.01], [0.05, 0.65, 0.7, 0]].map(([x, a, l, z]) => {
    const g = group([x, 0, z]); const c = new THREE.Mesh(new THREE.ConeGeometry(0.013, 0.1 * l, 6), tuftMat); c.position.y = 0.05 * l; c.rotation.x = 0.25; c.castShadow = true; g.add(c); F(c, { length: 0.008, shells: 6, density: 600, comb: [0, 0.5, -0.3] }); g.rotation.z = -a; tuft.add(g); return g;
  });

  // membres
  const limb = (p, upper, lower, end, m) => {
    const sh = group(p); sh.add(F(cap(0.017, upper, m, [0, -upper / 2, 0]), { length: 0.014, shells: 10 }));
    const el = group([0, -upper, 0]); sh.add(el); el.add(F(cap(0.014, lower, m, [0, -lower / 2, 0]), { length: 0.012, shells: 10 }));
    const tip = group([0, -lower - 0.02, 0]); el.add(tip); tip.add(end);
    return { sh, el, tip };
  };
  const claw = mat(0x2a1d16, 0.4);
  const fingerGroups = [];
  const hand = () => {
    const g = group([0, 0, 0]); g.add(sph(0.026, belly, [1.15, 0.55, 1.1]));
    [-1.5, -0.5, 0.5, 1.5].forEach((k) => {
      const f = group([k * 0.011, 0, 0.012]); f.userData.k = k; g.add(f); fingerGroups.push(f);
      f.add(cap(0.0065, 0.05, belly, [0, 0, 0.028], [Math.PI / 2, 0, 0]));
      const c = new THREE.Mesh(new THREE.ConeGeometry(0.004, 0.014, 5), claw); c.rotation.x = Math.PI / 2; c.position.set(0, 0, 0.065); f.add(c);
    });
    return g;
  };
  const foot = () => { const g = group([0, 0, 0]); g.add(F(sph(0.036, belly, [0.95, 0.5, 2.0], [0, 0, 0.035]), { length: 0.008, shells: 8 })); [-1, 0, 1].forEach((k) => g.add(sph(0.013, belly, [1, 0.9, 1.4], [k * 0.02, -0.004, 0.1]))); return g; };
  const arms = [-1, 1].map((s) => { const L = limb([s * 0.065, -0.02, 0.14], 0.11, 0.105, hand(), side); body.add(L.sh); L.s = s; return L; });
  const legs = [-1, 1].map((s) => {
    const L = limb([s * 0.065, -0.02, -0.13], 0.12, 0.12, foot(), side); body.add(L.sh);
    F((L.sh.add(sph(0.045, side, [0.8, 1.1, 1.1], [0, -0.025, 0])), L.sh.children.at(-1)), { length: 0.01 }); L.s = s; return L;
  });

  // queue plate, très touffue
  const tailSegs = []; let parent = group([0, 0.02, -0.19]); body.add(parent);
  const tailRoot = parent;
  for (let i = 0; i < 9; i++) {
    const seg = group([0, 0, i ? -0.085 : 0]); parent.add(seg);
    const w = 0.028 + Math.sin((i / 8) * Math.PI * 0.85) * 0.035;
    const m = sph(1, i === 8 ? dark : i % 2 ? side : back, [w, 0.032, 0.062], [0, 0, -0.04], 16); seg.add(m);
    F(m, { length: 0.04, density: 160, comb: [0, 0.2, -0.9], shells: 12, tip: 0xfff2dc });
    tailSegs.push(seg); parent = seg;
  }

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
    neckStem.scale.set(1 / Math.sqrt(p.neck), p.neck, 1 / Math.sqrt(p.neck));
    head.position.set(0, 0.11 + (p.neck - 1) * 0.105, 0.05 + (p.neck - 1) * 0.045);
    head.scale.set(p.stretchX, 1, 1);
    fingerGroups.forEach((f) => (f.rotation.y = f.userData.k * (0.12 + p.fingers * 0.3)));
    const setLimb = (L, [sw, sp, bd], leg) => { L.sh.rotation.set(-sw, 0, L.s * sp); L.el.rotation.set(leg ? bd : -bd, 0, 0); };
    setLimb(arms[0], p.armL); setLimb(arms[1], p.armR); setLimb(legs[0], p.legL, true); setLimb(legs[1], p.legR, true);
    tailSegs.forEach((g, i) => { g.rotation.set(p.tailCurl * 0.22 + Math.sin(p.tailPhase - i * 0.7) * p.tailWave * 0.12, p.tailSide * 0.08 + Math.sin(p.tailPhase * 0.7 - i * 0.5) * p.tailWave * 0.06, 0); g.scale.x = p.tailFluff; });
    tailRoot.rotation.x = -0.2;
    eyes.forEach((e, i) => {
      const side = i ? 1 : -1, pop = p.eyePop;
      e.position.copy(e.userData.base).add(V3.set(side * 0.02 * pop, 0.035 * pop, 0.03 * pop));
      poseEye(e, { lookX: p.lookX + (i ? -1 : 1) * p.cross + side * p.splitEyes, lookY: p.lookY + (i ? 0.4 : -0.4) * p.splitEyes, lid: i ? Math.max(p.lid, p.wink) : p.lid, lidLow: p.lidLow, browY: p.brow, browAng: p.browAng + (i ? -1 : 1) * p.smirk * 0.4,
        scale: p.eyeScale * (1 + pop * 0.55) * (i ? p.eyeR : p.eyeL) });
    });
    // mâchoire : s'ouvre puis s'allonge jusqu'à la poitrine
    const mo = p.mouth; jaw.rotation.x = Math.min(mo, 0.6) * 1.3; jaw.scale.set(1 + mo * 0.25, 1 + Math.max(0, mo - 0.4) * 1.6, 1 + Math.max(0, mo - 0.4) * 0.5);
    jaw.position.y = -0.07 - Math.max(0, mo - 0.5) * 0.06;
    tongue.position.z = 0.1 + p.tongue * 0.07; tongue.scale.set(0.85, 0.3, 1.2 + p.tongue * 0.8);
    mouthIn.visible = false;
    teeth.visible = p.teeth > 0.5; teeth.position.y = 0.006;
    smileM.visible = mo < 0.12; smileM.rotation.z = (p.smile >= 0 ? Math.PI * 1.05 : Math.PI * 0.05) + p.smirk * 0.35;
    smileM.scale.set(1, Math.abs(p.smile) * 1.2 + 0.2, 1); smileM.position.y = p.smile >= 0 ? 0.012 : -0.028;
    cheeks.forEach((c) => c.scale.set(1 + p.cheeks * 1.5, 0.9 + p.cheeks * 1.1, 0.9 + p.cheeks * 1.1));
    nose.scale.setScalar(1 + p.nose * 0.5);
    ears.forEach((e, i) => e.rotation.set(-0.2 - p.earBack * 0.9, 0, (i ? -1 : 1) * (0.3 + p.earBack * 0.4)));
    spikes.forEach((g, i) => { g.rotation.x = -0.5 + p.tuft * 0.5 - (p.tuft < 0 ? 0.6 * -p.tuft : 0) + (i % 2) * 0.15; g.scale.y = 1 + Math.max(0, p.tuft) * 0.35; });
    root.updateMatrixWorld(true);
    membranes.forEach(({ g, s: sd }, k) => {
      Q[0].set(sd * 0.075, -0.005, 0.14); body.worldToLocal(arms[k].tip.getWorldPosition(Q[1]));
      body.worldToLocal(legs[k].tip.getWorldPosition(Q[2])); Q[3].set(sd * 0.075, -0.005, -0.13);
      const pos = g.attributes.position; let n = 0; const span = Q[1].distanceTo(Q[2]);
      for (let j = 0; j <= NV; j++) {
        const v = j / NV;
        for (let i = 0; i <= NU; i++) {
          const u = i / NU, sc = Math.sin(u * Math.PI) * 0.18 * v * v;
          const ix = Q[0].x + (Q[3].x - Q[0].x) * u, iy = Q[0].y + (Q[3].y - Q[0].y) * u, iz = Q[0].z + (Q[3].z - Q[0].z) * u;
          const ox = Q[1].x + (Q[2].x - Q[1].x) * u, oy = Q[1].y + (Q[2].y - Q[1].y) * u, oz = Q[1].z + (Q[2].z - Q[1].z) * u;
          const y = iy + (oy - iy) * v + Math.sin(u * Math.PI) * Math.sin(v * Math.PI) * p.billow * span * 0.12;
          pos.setXYZ(n++, ix + (ox - ix) * (v - sc * 0.6), y, iz + (oz - iz) * v);
        }
      }
      pos.needsUpdate = true; g.computeVertexNormals(); g.computeBoundingSphere();
    });
  }
  pose();
  return { root, pose, parts: { head, body, mouth, hands: arms.map((a) => a.tip) } };
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
