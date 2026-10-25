// Squelette d'oiseau caricatural commun (Margot la pie, Bec-de-Fer l'aigle) :
// corps à plumage en relief, cou extensible, bec articulé, yeux expressifs, ailes en vraies plumes
// (déployées / repliées, battement), queue en éventail, pattes à serres.
// Orienté vers +z.
import * as THREE from 'three';
import { mat, sph, cap, group, makeEye, poseEye } from './parts.js';
import { addFur } from '../engine/fur.js';

// Plume : contour arrondi extrudé, dégradé de couleur racine -> pointe (couleurs de sommets)
function featherGeo(len, w) {
  const s = new THREE.Shape();
  s.moveTo(-w * 0.25, 0); s.quadraticCurveTo(-w * 0.6, len * 0.55, -w * 0.15, len); s.quadraticCurveTo(w * 0.35, len * 1.02, w * 0.5, len * 0.6); s.quadraticCurveTo(w * 0.45, len * 0.2, w * 0.25, 0); s.lineTo(-w * 0.25, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: w * 0.04, bevelEnabled: true, bevelSize: w * 0.04, bevelThickness: w * 0.03, bevelSegments: 1, curveSegments: 5 });
  g.translate(0, 0, -w * 0.02); g.computeVertexNormals();
  return g;
}
function colorFeather(geo, root, tip, len) {
  const p = geo.attributes.position, c = [], a = new THREE.Color(root), b = new THREE.Color(tip), t = new THREE.Color();
  for (let i = 0; i < p.count; i++) { t.copy(a).lerp(b, Math.min(1, Math.max(0, p.getY(i) / len))); c.push(t.r, t.g, t.b); }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(c, 3)); return geo;
}

export const B0 = {
  squash: 1, pitch: 0, roll: 0, bodyY: 0, neck: 1, headTurn: 0, headTilt: 0, headNod: 0,
  beak: 0, eyeScale: 1, eyePop: 0, lookX: 0, lookY: 0, lid: 0.35, lidLow: 0.1, cross: 0, brow: 0, browAng: -0.5, smirk: 0,
  // ailes : open 0 = repliée le long du corps, 1 = grande ouverte ; flap = angle de battement (+ haut) ; sweep = vers l'avant/arrière
  wingL: [0, 0, 0], wingR: [0, 0, 0], tailSpread: 0.2, tailLift: 0, tailWag: 0,
  legL: [0, 0], legR: [0, 0], grip: 0, crest: 0,
};

export function createBird(cfg) {
  const S = cfg.scale;
  const F = (m, o) => addFur(m, { comb: [0, -0.2, -0.9], ...o });
  const bodyMat = mat(cfg.body, 0.55), bellyMat = mat(cfg.belly, 0.7), headMat = mat(cfg.head ?? cfg.body, 0.55);
  const featherMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: cfg.gloss ? 0.35 : 0.7, metalness: cfg.gloss ? 0.15 : 0, side: THREE.DoubleSide });
  const root = new THREE.Group(), squash = new THREE.Group(); root.add(squash);
  const body = group([0, cfg.legLen * S + 0.16 * S, 0]); squash.add(body);
  F((body.add(sph(0.16 * S, bodyMat, cfg.bodyShape, [0, 0, 0])), body.children.at(-1)), { length: 0.014 * S, density: 260 / S, shells: 10 });
  F((body.add(sph(0.14 * S, bellyMat, cfg.bellyShape, [0, -0.04 * S, 0.06 * S])), body.children.at(-1)), { length: 0.016 * S, density: 260 / S, shells: 10, comb: [0, -0.6, -0.3] });

  // cou extensible + tête
  const neck = group([0, 0.12 * S, 0.17 * S]); body.add(neck);
  const neckStem = group([0, 0, 0]); neckStem.rotation.x = 0.3; neck.add(neckStem);
  F(neckStem.add(cap(cfg.neckR * S, 0.1 * S, cfg.neckMat === 'belly' ? bellyMat : headMat, [0, 0.06 * S, 0])) && neckStem.children.at(-1), { length: 0.012 * S, density: 260 / S, shells: 8 });
  const head = group([0, 0.15 * S, 0.03 * S]); neck.add(head);
  F((head.add(sph(0.11 * S, headMat, cfg.headShape)), head.children.at(-1)), { length: 0.012 * S, density: 300 / S, shells: 8, comb: [0, 0, -0.9] });
  // bec : supérieur (crochu ou droit) + inférieur articulé
  const beakMat = mat(cfg.beak, 0.35);
  const upper = new THREE.Mesh(new THREE.ConeGeometry(cfg.beakW * S, cfg.beakLen * S, 16), beakMat);
  upper.rotation.x = Math.PI / 2; upper.scale.set(1, 1, 0.7); upper.position.set(0, -0.005 * S, 0.1 * S + cfg.beakLen * S / 2); upper.castShadow = true; head.add(upper);
  if (cfg.hook) {
    upper.scale.set(1, 1, 1.0);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(cfg.beakW * 0.55 * S, cfg.beakLen * 0.45 * S, 12), beakMat);
    tip.position.set(0, -0.035 * S, 0.1 * S + cfg.beakLen * S * 0.95); tip.rotation.x = Math.PI * 0.85; tip.castShadow = true; head.add(tip);
    head.add(sph(0.055 * S, beakMat, [1.05, 0.75, 0.8], [0, 0.0, 0.11 * S])); // cire jaune à la base du bec
  }
  const jaw = group([0, -0.035 * S, 0.1 * S]); head.add(jaw);
  const lower = new THREE.Mesh(new THREE.ConeGeometry(cfg.beakW * 0.75 * S, cfg.beakLen * 0.8 * S, 16), beakMat); lower.rotation.x = Math.PI / 2; lower.scale.set(1, 1, 0.5); lower.position.set(0, 0, cfg.beakLen * 0.4 * S); jaw.add(lower);
  const tongue = sph(0.02 * S, mat(0xd8506a, 0.5), [1, 0.4, 2], [0, 0.01 * S, cfg.beakLen * 0.25 * S]); jaw.add(tongue);
  // yeux + sourcils
  const eyes = [-1, 1].map((s) => {
    const e = makeEye(cfg.eyeR * S, headMat, cfg.iris, mat(cfg.brow, 0.8), s, cfg.irisScale ?? 1);
    e.position.set(s * cfg.eyeX * S, 0.035 * S, cfg.eyeZ * S); e.userData.base = e.position.clone(); e.rotation.y = s * cfg.eyeYaw; head.add(e);
    e.userData.brow.scale.set(...cfg.browScale); return e;
  });
  // huppe / plumes de tête
  const crest = group([0, 0.09 * S, -0.02 * S]); head.add(crest);
  for (let i = 0; i < (cfg.crest ?? 0); i++) { const g = colorFeather(featherGeo(0.09 * S, 0.035 * S), cfg.head ?? cfg.body, cfg.crestTip ?? cfg.body, 0.09 * S); const f = new THREE.Mesh(g, featherMat); f.rotation.set(-0.9 - i * 0.12, 0, (i - (cfg.crest - 1) / 2) * 0.3); f.castShadow = true; crest.add(f); }

  // ailes : 3 segments (bras, avant-bras, main) portant secondaires et primaires
  const wings = [-1, 1].map((s) => {
    const sh = group([s * 0.13 * S, 0.06 * S, 0.06 * S]); body.add(sh);
    const arm = group([0, 0, 0]); sh.add(arm);
    const fore = group([s * cfg.span * 0.32 * S, 0, 0]); arm.add(fore);
    const hand = group([s * cfg.span * 0.32 * S, 0, 0]); fore.add(hand);
    arm.add(F(cap(0.045 * S, cfg.span * 0.28 * S, bodyMat, [s * cfg.span * 0.16 * S, 0, 0], [0, 0, Math.PI / 2]), { length: 0.012 * S, density: 260 / S, shells: 6 }));
    fore.add(cap(0.035 * S, cfg.span * 0.28 * S, bodyMat, [s * cfg.span * 0.16 * S, 0, 0], [0, 0, Math.PI / 2]));
    const feathers = [];
    const addF = (parent, n, len, w, x0, x1, kind) => {
      for (let i = 0; i < n; i++) {
        const k = i / (n - 1), L = len * (kind === 'p' ? 1 - k * 0.25 : 0.85 + 0.15 * Math.sin(k * 3));
        const [cr, ct] = cfg.featherColors(kind, k);
        const f = new THREE.Mesh(colorFeather(featherGeo(L * S, w * S), cr, ct, L * S), featherMat); f.castShadow = true;
        const g = group([s * (x0 + (x1 - x0) * k) * S, 0, -0.01 * S]); g.add(f); parent.add(g);
        f.rotation.x = -Math.PI / 2; // plume couchée vers l'arrière (-z)
        g.userData = { k, kind, s }; feathers.push(g);
      }
    };
    addF(arm, 5, cfg.span * 0.24, 0.13, 0.05 * cfg.span, 0.3 * cfg.span, 's');
    addF(fore, 7, cfg.span * 0.32, 0.14, 0.0, 0.3 * cfg.span, 's');
    addF(hand, 8, cfg.span * 0.44, 0.13, 0.0, 0.18 * cfg.span, 'p');
    return { sh, arm, fore, hand, feathers, s };
  });

  // ailes repliées (affichées quand l'aile est fermée) : capot emplumé + longues primaires sur la queue
  const folded = [-1, 1].map((s) => {
    const g = group([s * 0.12 * S, 0.04 * S, -0.02 * S]); body.add(g);
    F((g.add(sph(0.12 * S, bodyMat, [0.35, 0.75, 1.35])), g.children.at(-1)), { length: 0.01 * S, density: 260 / S, shells: 8, comb: [0, 0, -1] });
    for (let i = 0; i < 4; i++) {
      const [cr, ct] = cfg.featherColors('p', i / 3); const L = cfg.span * 0.38 * (1 - i * 0.08);
      const f = new THREE.Mesh(colorFeather(featherGeo(L * S, 0.1 * S), cr, ct, L * S), featherMat); f.castShadow = true;
      f.rotation.set(-Math.PI / 2 - 0.12, 0, Math.PI / 2 * s); f.position.set(s * 0.01 * S * i, -0.02 * S - i * 0.012 * S, -0.06 * S); g.add(f);
    }
    g.rotation.y = s * 0.12; return g;
  });

  // queue en éventail
  const tail = group([0, 0.02 * S, -0.18 * S]); body.add(tail);
  const tailF = [];
  for (let i = 0; i < cfg.tailN; i++) {
    const k = i / (cfg.tailN - 1) - 0.5; const L = cfg.tailLen * (1 - Math.abs(k) * 0.3);
    const [cr, ct] = cfg.featherColors('t', Math.abs(k) * 2);
    const f = new THREE.Mesh(colorFeather(featherGeo(L * S, 0.08 * S), cr, ct, L * S), featherMat); f.rotation.x = -Math.PI / 2; f.castShadow = true;
    const g = group([k * 0.06 * S, 0, 0]); g.add(f); g.userData.k = k; tail.add(g); tailF.push(g);
  }

  // pattes : cuisse emplumée, tarse jaune, 3 doigts + 1 arrière à serres
  const legMat = mat(cfg.legColor, 0.5), talon = mat(0x1d1712, 0.3);
  const legs = [-1, 1].map((s) => {
    const hip = group([s * 0.07 * S, -0.08 * S, 0.0]); body.add(hip);
    F(hip.add(sph(0.06 * S, cfg.trousers ? bodyMat : bellyMat, [0.9, 1.3, 1], [0, -0.03 * S, 0])) && hip.children.at(-1), { length: 0.02 * S, density: 200 / S, shells: 8, comb: [0, -0.9, 0] });
    hip.add(cap(0.018 * S, cfg.legLen * S, legMat, [0, -cfg.legLen * S / 2 - 0.05 * S, 0]));
    const foot = group([0, -cfg.legLen * S - 0.07 * S, 0]); hip.add(foot);
    const toes = [];
    [[-0.5, 1], [0, 1], [0.5, 1], [Math.PI, 0.7]].forEach(([a, l]) => {
      const t = group([0, 0, 0]); t.rotation.y = a; foot.add(t);
      t.add(cap(0.012 * S, 0.06 * S * l, legMat, [0, 0, 0.035 * S * l], [Math.PI / 2, 0, 0]));
      const c = new THREE.Mesh(new THREE.ConeGeometry(0.008 * S, 0.035 * S, 6), talon); c.position.set(0, -0.01 * S, 0.075 * S * l); c.rotation.x = Math.PI / 2 + 0.7; t.add(c); toes.push(t);
    });
    return { hip, foot, toes, s };
  });

  function pose(p = {}) {
    p = { ...B0, ...p };
    const s = p.squash; squash.scale.set(1 / Math.sqrt(s), s, 1 / Math.sqrt(s));
    body.position.y = cfg.legLen * S + 0.16 * S + p.bodyY;
    body.rotation.set(p.pitch, 0, p.roll);
    neck.rotation.set(p.headNod - p.pitch * 0.9, p.headTurn, p.headTilt);
    neckStem.scale.set(1 / Math.sqrt(p.neck), p.neck, 1 / Math.sqrt(p.neck));
    head.position.set(0, (0.15 + (p.neck - 1) * 0.12) * S, (0.03 + (p.neck - 1) * 0.04) * S);
    jaw.rotation.x = p.beak * 0.9;
    eyes.forEach((e, i) => {
      const side = i ? 1 : -1;
      e.position.copy(e.userData.base).add(new THREE.Vector3(side * 0.015 * S * p.eyePop, 0.03 * S * p.eyePop, 0.02 * S * p.eyePop));
      poseEye(e, { lookX: p.lookX + (i ? -1 : 1) * p.cross, lookY: p.lookY, lid: p.lid, lidLow: p.lidLow, browY: p.brow, browAng: p.browAng + (i ? -1 : 1) * p.smirk * 0.4, scale: p.eyeScale * (1 + p.eyePop * 0.5) });
    });
    crest.rotation.x = -p.crest * 0.6;
    wings.forEach((w, i) => {
      const [open, flap, sweep] = i ? p.wingR : p.wingL, sd = w.s;
      const shown = open > 0.2; w.sh.visible = shown; folded[i].visible = !shown;
      const fold = Math.max(0, (0.6 - open) / 0.4) * 0.6;
      // repliée : bras vers l'arrière, avant-bras vers l'avant, main vers l'arrière (zig-zag) ; ouverte : alignés
      w.sh.rotation.set(0, sd * (fold * 1.35 - sweep * 0.5), sd * flap);
      w.fore.rotation.set(0, -sd * fold * 2.6, sd * flap * 0.35);
      w.hand.rotation.set(0, sd * fold * 2.3, sd * flap * 0.25);
      w.feathers.forEach((g) => { const { k, kind } = g.userData; g.rotation.y = sd * (kind === 'p' ? (-0.15 + k * 0.85) * open : (0.1 - k * 0.1) * open) * -1; g.rotation.z = 0; });
    });
    tail.rotation.set(-p.tailLift - p.pitch * 0.3, p.tailWag, 0);
    tailF.forEach((g) => (g.rotation.y = -g.userData.k * (0.3 + p.tailSpread * 1.6)));
    legs.forEach((l, i) => { const [sw, bend] = i ? p.legR : p.legL; l.hip.rotation.x = -sw; l.foot.rotation.x = bend; l.toes.forEach((t, j) => (t.rotation.x = (j < 3 ? 1 : -1) * p.grip * 0.9)); });
  }
  pose();
  return { root, pose, parts: { head, body, jaw, legs: legs.map((l) => l.foot) } };
}

// Margot la pie : noire à reflets bleu-vert, ventre et épaules blancs, longue queue, regard vaniteux
export function createMargot() {
  return createBird({
    scale: 1.15, body: 0x17191f, belly: 0xf2f2ee, head: 0x14161c, gloss: true, neckR: 0.05, neckMat: 'head',
    bodyShape: [0.95, 0.9, 1.35], bellyShape: [0.95, 0.85, 1.05], headShape: [0.95, 0.92, 1.05],
    beak: 0x1a1a1e, beakW: 0.03, beakLen: 0.16, hook: false,
    eyeR: 0.05, eyeX: 0.065, eyeZ: 0.07, eyeYaw: 0.5, iris: 0x2b1810, irisScale: 1.1, brow: 0x0a0a0c, browScale: [1.5, 1, 1],
    crest: 0, span: 0.75, tailN: 7, tailLen: 0.55, legLen: 0.16, legColor: 0x22232a, trousers: true,
    featherColors: (kind, k) => kind === 'p' ? (k < 0.6 ? [0xf5f5f0, 0x1c2a44] : [0x1c2236, 0x0c1424]) : kind === 't' ? [0x10302e, 0x1a3d5a] : [0x14181f, 0x1d3550],
  });
}

// Bec-de-Fer l'aigle : brun sombre, nuque dorée, énorme bec jaune crochu, sourcils-falaises, « pantalon » de plumes
export function createBecDeFer() {
  return createBird({
    scale: 2.4, body: 0x3e2a1c, belly: 0x4a3222, head: 0xf3efe4, neckR: 0.045, neckMat: 'head',
    bodyShape: [1.1, 1.0, 1.25], bellyShape: [1.15, 1.05, 1.0], headShape: [0.95, 0.85, 1.1],
    beak: 0xf5c21c, beakW: 0.05, beakLen: 0.17, hook: true,
    eyeR: 0.036, eyeX: 0.06, eyeZ: 0.085, eyeYaw: 0.35, iris: 0xe0a414, irisScale: 0.85, brow: 0x2a1a10, browScale: [2.6, 2.0, 2.0],
    crest: 5, crestTip: 0xffffff, span: 1.05, tailN: 9, tailLen: 0.32, legLen: 0.14, legColor: 0xf5c21c, trousers: true,
    featherColors: (kind, k) => kind === 'p' ? [0x33231a, 0x15100b] : kind === 't' ? [0xf5f2ea, 0xffffff] : [0x4a3222, 0x2e1f15],
  });
}
