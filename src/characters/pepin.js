// PÉPIN — l'écureuil volant héros. Petit, rond, énormes yeux noirs, mèche rebelle,
// membrane de vol tendue entre poignets et chevilles, queue plate et touffue.
// Orienté vers +z. Longueur ~0.5 (sans la queue).
import * as THREE from 'three';
import { mat, sph, cap, group, makeEye, poseEye } from './parts.js';

export const P0 = {
    squash: 1, pitch: 0, roll: 0, yaw: 0, bodyY: 0,
    headTurn: 0, headTilt: 0, headNod: 0,
    // bras : swing (avant +), spread (écarté +), bend (coude) ; idem jambes
    armL: [0.2, 0.15, 0.4], armR: [0.2, 0.15, 0.4], legL: [-0.2, 0.15, -0.6], legR: [-0.2, 0.15, -0.6],
    tailCurl: 0.6, tailWave: 0, tailPhase: 0, tailSide: 0, tailFluff: 1,
    eyeScale: 1, lookX: 0, lookY: 0, lid: 0, lidLow: 0, wink: 0, cross: 0, brow: 0, browAng: 0,
    mouth: 0, smile: 0.4, teeth: 1, cheeks: 0, nose: 0, earBack: 0, tuft: 0, billow: 0.3,
  };

const C = { fur: 0x9c7a5c, furDark: 0x6e5240, belly: 0xf4ead8, pink: 0xf2a0a0, nose: 0xe36c78, rim: 0xe9d7bd, tuft: 0x7d5d44 };

export function createPepin() {
  const fur = mat(C.fur, 0.95), furDark = mat(C.furDark, 0.95), belly = mat(C.belly, 0.95), pink = mat(C.pink, 0.7);
  const root = new THREE.Group(), squash = new THREE.Group(); root.add(squash);
  const body = group([0, 0.17, 0]); squash.add(body);

  // tronc
  body.add(sph(0.16, fur, [1, 0.92, 1.45], [0, 0, 0.04]));
  body.add(sph(0.14, belly, [0.88, 0.75, 1.3], [0, -0.04, 0.05]));

  // tête
  const neck = group([0, 0.07, 0.22]); body.add(neck);
  const head = group([0, 0.08, 0.06]); neck.add(head);
  head.add(sph(0.155, fur, [1.08, 0.95, 1]));
  head.add(sph(0.085, belly, [1.25, 0.85, 1], [0, -0.05, 0.1]));
  const nose = sph(0.026, mat(C.nose, 0.4), [1.3, 1, 1], [0, -0.015, 0.19]); head.add(nose);
  const whisk = mat(0x4a3526, 0.6);
  [-1, 1].forEach((s) => [0.15, -0.05].forEach((a) => head.add(cap(0.003, 0.2, whisk, [s * 0.1, -0.03, 0.16], [0, s * 0.3, Math.PI / 2 + s * a]))));
  // bouche : ouverture sombre + sourire + 2 incisives
  const mouth = group([0, -0.07, 0.165]); head.add(mouth);
  const mouthIn = sph(0.04, mat(0x5a1a22, 0.8), [1.3, 0.35, 0.6]); mouth.add(mouthIn);
  const teeth = group([0, 0.004, 0.012], cap(0.008, 0.016, mat(0xffffff, 0.2), [-0.009, -0.01, 0]), cap(0.008, 0.016, mat(0xffffff, 0.2), [0.009, -0.01, 0])); mouth.add(teeth);
  const smileM = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.0055, 6, 20, Math.PI * 0.9), mat(0x3a1d14, 0.7)); smileM.position.set(0, 0.01, 0.005); mouth.add(smileM);
  // joues (abajoues extensibles)
  const cheeks = [-1, 1].map((s) => { const c = sph(0.06, fur, [1, 0.9, 0.9], [s * 0.085, -0.055, 0.07]); head.add(c); return c; });
  // yeux immenses et sombres (animal nocturne)
  const eyes = [-1, 1].map((s) => { const e = makeEye(0.072, fur, 0x2b170c, mat(0x3b2a1e, 0.8), s, 1.45); e.position.set(s * 0.072, 0.035, 0.112); e.rotation.y = s * 0.3; head.add(e); return e; });
  // oreilles rondes
  const ears = [-1, 1].map((s) => { const e = group([s * 0.095, 0.115, -0.03]); e.add(sph(0.055, fur, [1, 1.15, 0.35])); e.add(sph(0.04, pink, [1, 1.1, 0.2], [0, 0, 0.012])); head.add(e); return e; });
  // mèche rebelle
  const tuft = group([0, 0.145, 0.02]); head.add(tuft);
  const tuftMat = mat(C.tuft, 0.9);
  const spikes = [[-0.035, -0.35], [0, 0], [0.035, 0.35]].map(([x, a]) => { const g = group([x, 0, 0]); const c = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.11, 8), tuftMat); c.position.y = 0.05; c.castShadow = true; g.add(c); g.rotation.z = -a; tuft.add(g); return g; });

  // membres : épaule -> coude -> poignet ; hanche -> genou -> cheville
  const limb = (p, upper, lower, end, m) => {
    const sh = group(p); const u = cap(0.032, upper, m, [0, -upper / 2, 0]); sh.add(u);
    const el = group([0, -upper, 0]); sh.add(el); el.add(cap(0.026, lower, m, [0, -lower / 2, 0]));
    const tip = group([0, -lower - 0.02, 0]); el.add(tip); tip.add(end);
    return { sh, el, tip };
  };
  const arms = [-1, 1].map((s) => { const L = limb([s * 0.1, -0.03, 0.17], 0.07, 0.07, sph(0.03, belly, [1, 0.7, 1.3]), fur); body.add(L.sh); L.s = s; return L; });
  const legs = [-1, 1].map((s) => {
    const L = limb([s * 0.1, -0.03, -0.1], 0.08, 0.08, sph(0.034, belly, [0.9, 0.55, 1.9], [0, 0, 0.03]), fur); body.add(L.sh);
    L.sh.add(sph(0.075, fur, [0.8, 1, 1.15], [0, -0.02, 0])); L.s = s; return L;
  });

  // queue plate et touffue : chaîne de segments
  const tailSegs = []; let parent = group([0, 0.03, -0.2]); body.add(parent);
  const tailRoot = parent;
  for (let i = 0; i < 9; i++) {
    const seg = group([0, 0, i ? -0.085 : 0]); parent.add(seg);
    const w = 0.05 + Math.sin((i / 8) * Math.PI * 0.85) * 0.07;
    seg.add(sph(1, i % 2 ? fur : mat(0x8e6d52, 0.95), [w, 0.035, 0.065], [0, 0, -0.04], 16));
    tailSegs.push(seg); parent = seg;
  }

  // membranes de vol (géométrie reconstruite à chaque pose)
  const NU = 8, NV = 6;
  const memMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, side: THREE.DoubleSide });
  const membranes = [-1, 1].map((s) => {
    const g = new THREE.BufferGeometry();
    const n = (NU + 1) * (NV + 1);
    g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(n * 3), 3));
    const col = [], idx = [], cFur = new THREE.Color(C.fur), cRim = new THREE.Color(C.rim);
    for (let j = 0; j <= NV; j++) for (let i = 0; i <= NU; i++) { const c = cFur.clone().lerp(cRim, Math.pow(j / NV, 3)); col.push(c.r, c.g, c.b); }
    for (let j = 0; j < NV; j++) for (let i = 0; i < NU; i++) { const a = j * (NU + 1) + i, b = a + NU + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx);
    const m = new THREE.Mesh(g, memMat); m.castShadow = true; m.frustumCulled = false; body.add(m);
    return { m, g, s };
  });
  const V = new THREE.Vector3(), Q = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];


  function pose(p = {}) {
    p = { ...P0, ...p };
    const s = p.squash; squash.scale.set(1 / Math.sqrt(s), s, 1 / Math.sqrt(s));
    body.position.y = 0.17 + p.bodyY;
    body.rotation.set(p.pitch, p.yaw, p.roll);
    neck.rotation.set(p.headNod - p.pitch * 0.55, p.headTurn, p.headTilt);
    const setLimb = (L, [sw, sp, bd], invert) => { L.sh.rotation.set(-sw, 0, L.s * sp); L.el.rotation.set(invert ? bd : -bd, 0, 0); };
    setLimb(arms[0], p.armL); setLimb(arms[1], p.armR); setLimb(legs[0], p.legL, true); setLimb(legs[1], p.legR, true);
    tailSegs.forEach((g, i) => { g.rotation.set(p.tailCurl * 0.22 + Math.sin(p.tailPhase - i * 0.7) * p.tailWave * 0.12, p.tailSide * 0.08 + Math.sin(p.tailPhase * 0.7 - i * 0.5) * p.tailWave * 0.06, 0); g.scale.x = p.tailFluff; });
    tailRoot.rotation.x = -0.2;
    eyes.forEach((e, i) => poseEye(e, { lookX: p.lookX + (i ? -1 : 1) * p.cross, lookY: p.lookY, lid: i ? Math.max(p.lid, p.wink) : p.lid, lidLow: p.lidLow, browY: p.brow, browAng: p.browAng, scale: p.eyeScale }));
    const mo = p.mouth; mouthIn.scale.set(1.3, 0.2 + mo * 2.2, 0.6); mouthIn.visible = mo > 0.05;
    teeth.visible = p.teeth > 0.5; teeth.position.y = 0.004 + mo * 0.02;
    smileM.visible = mo < 0.35; smileM.rotation.z = p.smile >= 0 ? Math.PI * 1.05 : Math.PI * 0.05; smileM.scale.set(1, Math.abs(p.smile) * 1.2 + 0.2, 1); smileM.position.y = p.smile >= 0 ? 0.012 : -0.025;
    cheeks.forEach((c) => c.scale.set(1 + p.cheeks * 1.5, 0.9 + p.cheeks * 1.1, 0.9 + p.cheeks * 1.1));
    nose.scale.setScalar(1 + p.nose * 0.5);
    ears.forEach((e, i) => e.rotation.set(-0.2 - p.earBack * 0.9, 0, (i ? -1 : 1) * (0.25 + p.earBack * 0.4)));
    // mèche : -1 aplatie, 0 normale, 1 dressée « idée ! »
    spikes.forEach((g, i) => { g.rotation.x = -0.6 + p.tuft * 0.55 - (p.tuft < 0 ? 0.6 * -p.tuft : 0); g.scale.y = 1 + Math.max(0, p.tuft) * 0.35; });
    // membranes : épaule -> poignet -> cheville -> hanche
    root.updateMatrixWorld(true);
    membranes.forEach(({ g, s: side }, k) => {
      const arm = arms[k], leg = legs[k];
      Q[0].set(side * 0.12, -0.01, 0.16);
      body.worldToLocal(arm.tip.getWorldPosition(Q[1]));
      body.worldToLocal(leg.tip.getWorldPosition(Q[2]));
      Q[3].set(side * 0.12, -0.01, -0.1);
      const pos = g.attributes.position; let n = 0;
      const span = Q[1].distanceTo(Q[2]);
      for (let j = 0; j <= NV; j++) {
        const v = j / NV;
        for (let i = 0; i <= NU; i++) {
          const u = i / NU;
          // bord intérieur (corps) épaule->hanche, bord extérieur poignet->cheville (légèrement creusé)
          const inX = Q[0].x + (Q[3].x - Q[0].x) * u, inY = Q[0].y + (Q[3].y - Q[0].y) * u, inZ = Q[0].z + (Q[3].z - Q[0].z) * u;
          const outX = Q[1].x + (Q[2].x - Q[1].x) * u, outY = Q[1].y + (Q[2].y - Q[1].y) * u, outZ = Q[1].z + (Q[2].z - Q[1].z) * u;
          const scallop = Math.sin(u * Math.PI) * 0.18 * v * v;
          let x = inX + (outX - inX) * (v - scallop * 0.6), y = inY + (outY - inY) * v, z = inZ + (outZ - inZ) * v;
          y += Math.sin(u * Math.PI) * Math.sin(v * Math.PI) * p.billow * span * 0.12;
          pos.setXYZ(n++, x, y, z);
        }
      }
      pos.needsUpdate = true; g.computeVertexNormals(); g.computeBoundingSphere();
    });
  }
  pose();
  return { root, pose, parts: { head, body, mouth } };
}

// Poses de base (à mélanger avec blend)
export const POSE = {
  sit: { pitch: -1.15, bodyY: 0.06, armL: [1.5, 0.1, 1.2], armR: [1.5, 0.1, 1.2], legL: [1.1, 0.25, 1.9], legR: [1.1, 0.25, 1.9], tailCurl: 2.4, billow: 0.1 },
  stand: { pitch: 0, armL: [0.1, 0.1, 0.3], armR: [0.1, 0.1, 0.3], legL: [-0.1, 0.15, -0.5], legR: [-0.1, 0.15, -0.5], tailCurl: 1.6 },
  glide: { pitch: 0, bodyY: 0, armL: [0.55, 1.35, 0.05], armR: [0.55, 1.35, 0.05], legL: [-0.45, 1.25, 0.05], legR: [-0.45, 1.25, 0.05], tailCurl: 0.1, billow: 0.7, earBack: 0.6 },
  curl: { pitch: -0.2, squash: 0.9, armL: [1.6, 0.0, 1.8], armR: [1.6, 0.0, 1.8], legL: [1.4, 0.1, 2.0], legR: [1.4, 0.1, 2.0], tailCurl: 3.4, billow: 0.05, lid: 1 },
  splat: { pitch: 0, armL: [0.2, 1.5, 0], armR: [0.2, 1.5, 0], legL: [-0.2, 1.5, 0], legR: [-0.2, 1.5, 0], tailCurl: -0.4, billow: 0.0 },
};

// Mélange de poses (nombres et tableaux), k de 0 à 1
export function blend(a, b, k) {
  a = { ...P0, ...a }; b = { ...P0, ...b };
  const out = { ...a };
  for (const key of Object.keys(b)) {
    const va = a[key], vb = b[key];
    if (va === undefined) { out[key] = vb; continue; }
    out[key] = Array.isArray(vb) ? vb.map((x, i) => va[i] + (x - va[i]) * k) : va + (vb - va) * k;
  }
  return out;
}
