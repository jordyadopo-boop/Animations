// Squelette d'oiseau caricatural commun (Margot la pie, Bec-de-Fer l'aigle) :
// corps à plumage en relief, cou extensible, bec articulé, yeux expressifs, ailes en vraies plumes
// (déployées / repliées, battement), queue en éventail, pattes à serres.
// Orienté vers +z.
import * as THREE from 'three';
import { mat, sph, cap, group, makeEye, poseEye } from './parts.js';
import { Sculpture } from '../engine/sculpt.js';

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
  beak: 0, eyeScale: 1, eyePop: 0, lookX: 0, lookY: 0, lid: 0.35, lidLow: 0.1, tilt: 0, pupil: 1, cross: 0, brow: 0, browAng: -0.5, smirk: 0,
  // ailes : open 0 = repliée le long du corps, 1 = grande ouverte ; flap = angle de battement (+ haut) ; sweep = vers l'avant/arrière
  wingL: [0, 0, 0], wingR: [0, 0, 0], tailSpread: 0.2, tailLift: 0, tailWag: 0,
  legL: [0, 0], legR: [0, 0], grip: 0, crest: 0,
};

export function createBird(cfg) {
  const S = cfg.scale;
  const PI = Math.PI;
  const SC = new Sculpture({ cell: 0.0052 * S, color: cfg.body });
  SC.mesh.material.sheen = cfg.gloss ? 0.2 : 0.4;
  const featherMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: cfg.gloss ? 0.35 : 0.7, metalness: cfg.gloss ? 0.15 : 0, side: THREE.DoubleSide });
  const root = new THREE.Group(), squash = new THREE.Group(); root.add(squash);
  const body = group([0, cfg.legLen * S + 0.16 * S, 0]); squash.add(body);
  const r = (k, v) => v * k * S;
  SC.add(body, 'ell', cfg.bodyShape.map((v) => v * 0.16 * S), { blend: 0.04 * S });
  SC.add(body, 'ell', cfg.bellyShape.map((v) => v * 0.14 * S), { pos: [0, -0.04 * S, 0.06 * S], blend: 0.05 * S, color: cfg.body });
  SC.add(body, 'ell', cfg.bellyShape.map((v) => v * 0.15 * S), { pos: [0, -0.06 * S, 0.08 * S], op: 'paint', color: cfg.belly, sharp: 0.012 * S });

  // cou extensible + tête sculptés d'un bloc avec le bec
  const neck = group([0, 0.12 * S, 0.17 * S]); body.add(neck);
  const neckStem = group([0, 0, 0]); neckStem.rotation.x = 0.3; neck.add(neckStem);
  const headCol = cfg.head ?? cfg.body;
  SC.add(neckStem, 'cone', [cfg.neckR * S * 1.15, cfg.neckR * S, 0.13 * S], { blend: 0.03 * S, color: cfg.neckMat === 'belly' ? cfg.belly : headCol });
  const head = group([0, 0.15 * S, 0.03 * S]); neck.add(head);
  SC.add(head, 'ell', cfg.headShape.map((v) => v * 0.11 * S), { blend: 0.035 * S, color: headCol });
  const bk = { blend: 0.012 * S, color: cfg.beak, sharp: 0.004 * S };
  SC.add(head, 'cone', [cfg.beakW * S, cfg.beakW * 0.22 * S, cfg.beakLen * S], { pos: [0, -0.01 * S, 0.075 * S], rot: [PI / 2, 0, 0], ...bk });
  if (cfg.hook) {
    SC.add(head, 'cone', [cfg.beakW * 0.5 * S, 0.004 * S, cfg.beakLen * 0.38 * S], { pos: [0, -0.012 * S, 0.075 * S + cfg.beakLen * S * 0.9], rot: [PI * 0.82, 0, 0], ...bk });
    SC.add(head, 'ell', [0.05 * S, 0.035 * S, 0.04 * S], { pos: [0, 0.0, 0.1 * S], ...bk }); // cire à la base du bec
  }
  const jaw = group([0, -0.035 * S, 0.085 * S]); head.add(jaw);
  SC.add(jaw, 'cone', [cfg.beakW * 0.75 * S, cfg.beakW * 0.15 * S, cfg.beakLen * 0.8 * S], { pos: [0, 0, 0], rot: [PI / 2, 0, 0], ...bk });
  const tongue = sph(0.02 * S, mat(0xd8506a, 0.5), [1, 0.4, 2], [0, 0.012 * S, cfg.beakLen * 0.3 * S]); jaw.add(tongue);
  head.add(sph(0.03 * S, mat(0x4a0f1a, 0.9), [1, 0.5, 2.2], [0, -0.028 * S, 0.12 * S]));
  // arcades sculptées + orbites, yeux enfoncés
  const brows = [-1, 1].map((sd) => { const b = group([sd * cfg.eyeX * S, 0.035 * S + cfg.eyeR * S * 1.15, cfg.eyeZ * S + cfg.eyeR * S * 0.2]); head.add(b);
    SC.add(b, 'ell', [cfg.eyeR * S * 1.25 * cfg.browScale[0] / 2, cfg.eyeR * S * 0.32 * cfg.browScale[1], cfg.eyeR * S * 0.6], { blend: 0.025 * S, color: cfg.brow, sharp: 0.006 * S }); return b; });
  [-1, 1].forEach((sd) => SC.add(head, 'ell', [cfg.eyeR * S * 1.05, cfg.eyeR * S * 1.0, cfg.eyeR * S * 0.8], { pos: [sd * cfg.eyeX * S, 0.035 * S, cfg.eyeZ * S], op: 'sub', blend: 0.01 * S }));
  const eyes = [-1, 1].map((sd) => {
    const e = makeEye(cfg.eyeR * S, mat(headCol, 0.6), cfg.iris, mat(cfg.brow, 0.8), sd, cfg.irisScale ?? 1);
    e.position.set(sd * cfg.eyeX * S, 0.035 * S, cfg.eyeZ * S); e.userData.base = e.position.clone(); e.rotation.y = sd * cfg.eyeYaw; head.add(e);
    e.userData.brow.visible = false; return e;
  });
  // huppe / plumes de tête
  const crest = group([0, 0.09 * S, -0.02 * S]); head.add(crest);
  for (let i = 0; i < (cfg.crest ?? 0); i++) { const g = colorFeather(featherGeo(0.09 * S, 0.035 * S), cfg.crestTip && cfg.crestTip === 0xe0262a ? 0xc81e22 : (cfg.head ?? cfg.body), cfg.crestTip ?? cfg.body, 0.09 * S); const f = new THREE.Mesh(g, featherMat); f.rotation.set(-0.9 - i * 0.12, 0, (i - (cfg.crest - 1) / 2) * 0.3); f.castShadow = true; crest.add(f); }

  // ailes : 3 segments (bras, avant-bras, main) portant secondaires et primaires
  const wings = [-1, 1].map((s) => {
    const sh = group([s * 0.13 * S, 0.06 * S, 0.06 * S]); body.add(sh);
    const arm = group([0, 0, 0]); sh.add(arm);
    const fore = group([s * cfg.span * 0.32 * S, 0, 0]); arm.add(fore);
    const hand = group([s * cfg.span * 0.32 * S, 0, 0]); fore.add(hand);
    const bones = [SC.add(arm, 'cone', [0.05 * S, 0.04 * S, cfg.span * 0.32 * S], { rot: [0, 0, -s * PI / 2], blend: 0.03 * S }),
      SC.add(fore, 'cone', [0.04 * S, 0.03 * S, cfg.span * 0.32 * S], { rot: [0, 0, -s * PI / 2], blend: 0.02 * S })];
    bones.forEach((b) => (b.base = b.size.slice()));
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
    return { sh, arm, fore, hand, feathers, s, bones };
  });

  // ailes repliées (affichées quand l'aile est fermée) : capot emplumé + longues primaires sur la queue
  const folded = [-1, 1].map((s) => {
    const g = group([s * 0.12 * S, 0.04 * S, -0.02 * S]); body.add(g);
    g.userData.cover = SC.add(g, 'ell', [0.042 * S, 0.09 * S, 0.165 * S], { blend: 0.03 * S }); g.userData.cover.base = g.userData.cover.size.slice();
    for (let i = 0; i < 4; i++) {
      const [cr, ct] = cfg.featherColors('p', i / 3); const L = cfg.span * 0.38 * (1 - i * 0.08);
      const f = new THREE.Mesh(colorFeather(featherGeo(L * S, 0.1 * S), cr, ct, L * S), featherMat); f.castShadow = true;
      f.rotation.set(-Math.PI / 2 - 0.12, s * 0.08 * i, 0); f.position.set(s * 0.01 * S * i - 0.02 * S, -0.02 * S - i * 0.012 * S, -0.06 * S); g.add(f);
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
    SC.add(hip, 'ell', [0.055 * S, 0.075 * S, 0.06 * S], { pos: [0, -0.03 * S, 0], blend: 0.03 * S, color: cfg.trousers ? cfg.body : cfg.belly });
    SC.add(hip, 'cone', [0.02 * S, 0.016 * S, cfg.legLen * S + 0.02 * S], { pos: [0, -0.05 * S, 0], rot: [PI, 0, 0], blend: 0.012 * S, color: cfg.legColor, sharp: 0.006 * S });
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
      poseEye(e, { lookX: p.lookX + (i ? -1 : 1) * p.cross, lookY: p.lookY, lid: p.lid, lidLow: p.lidLow, tilt: p.tilt, pupil: p.pupil, scale: p.eyeScale * (1 + p.eyePop * 0.5) });
    });
    brows.forEach((b, i) => { const sd = i ? 1 : -1; b.position.y = 0.035 * S + cfg.eyeR * S * (1.15 + p.brow * 0.35 + p.eyePop * 0.6); b.rotation.z = sd * (-p.browAng * 0.55 + (i ? -1 : 1) * p.smirk * 0.25); });
    crest.rotation.x = -p.crest * 0.6;
    wings.forEach((w, i) => {
      const [open, flap, sweep] = i ? p.wingR : p.wingL, sd = w.s;
      const shown = open > 0.2; w.sh.visible = shown; folded[i].visible = !shown;
      w.bones.forEach((b) => (b.size = shown ? b.base : [1e-4, 1e-4, 1e-4]));
      const cv = folded[i].userData.cover; cv.size = shown ? [1e-4, 1e-4, 1e-4] : cv.base;
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
    SC.update(root);
  }
  root.add(SC.mesh);
  pose();
  return { root, pose, parts: { head, body, jaw, legs: legs.map((l) => l.foot) } };
}

// Margot la pie : noire à reflets bleu-vert, ventre et épaules blancs, longue queue, regard vaniteux
export function createMargot() {
  return createBird({
    scale: 1.1, body: 0x15171d, belly: 0xf2f2ee, head: 0x121419, gloss: true, neckR: 0.042, neckMat: 'head',
    bodyShape: [0.78, 0.82, 1.45], bellyShape: [0.8, 0.8, 1.1], headShape: [0.88, 0.9, 1.15],
    beak: 0x16161a, beakW: 0.026, beakLen: 0.2, hook: false,
    eyeR: 0.046, eyeX: 0.06, eyeZ: 0.075, eyeYaw: 0.45, iris: 0xd6a51e, irisScale: 1.0, brow: 0x050506, browScale: [1.8, 1.2, 1.2],
    crest: 0, span: 0.78, tailN: 7, tailLen: 0.7, legLen: 0.17, legColor: 0x22232a, trousers: true,
    featherColors: (kind, k) => kind === 'p' ? (k < 0.6 ? [0xf5f5f0, 0x1c2a44] : [0x1c2236, 0x0c1424]) : kind === 't' ? [0x10302e, 0x1a3d5a] : [0x14181f, 0x1d3550],
  });
}

// Tac-Tac le pic-vert : maigre et dégingandé, long cou, tête trop grosse, calotte rouge, long bec droit, yeux qui louchent
export function createTacTac() {
  return createBird({
    scale: 1.0, body: 0x5f8a2c, belly: 0xd9d6a0, head: 0x6e9a33, neckR: 0.035, neckMat: 'head',
    bodyShape: [0.62, 0.95, 1.05], bellyShape: [0.62, 0.9, 0.8], headShape: [1.2, 1.15, 1.2],
    beak: 0x8a8476, beakW: 0.026, beakLen: 0.26, hook: false,
    eyeR: 0.06, eyeX: 0.075, eyeZ: 0.08, eyeYaw: 0.4, iris: 0xe8e2c8, irisScale: 0.75, brow: 0x1b1b1b, browScale: [1.3, 1, 1],
    crest: 7, crestTip: 0xe0262a, span: 0.6, tailN: 5, tailLen: 0.3, legLen: 0.22, legColor: 0x8a8476, trousers: false,
    featherColors: (kind, k) => kind === 'p' ? [0x4f7424, 0x2d4316] : kind === 't' ? [0x2b2b22, 0x111111] : [0x6a9632, 0x4a6e22],
  });
}

// Bec-de-Fer l'aigle : brun sombre, nuque dorée, énorme bec jaune crochu, sourcils-falaises, « pantalon » de plumes
export function createBecDeFer() {
  return createBird({
    scale: 2.4, body: 0x3e2a1c, belly: 0x4a3222, head: 0xf3efe4, neckR: 0.045, neckMat: 'head',
    bodyShape: [1.25, 1.15, 1.3], bellyShape: [1.3, 1.2, 1.1], headShape: [0.8, 0.75, 1.0],
    beak: 0xf5c21c, beakW: 0.05, beakLen: 0.17, hook: true,
    eyeR: 0.036, eyeX: 0.06, eyeZ: 0.085, eyeYaw: 0.35, iris: 0xe0a414, irisScale: 0.85, brow: 0x2a1a10, browScale: [2.6, 2.0, 2.0],
    crest: 5, crestTip: 0xffffff, span: 1.05, tailN: 9, tailLen: 0.32, legLen: 0.14, legColor: 0xf5c21c, trousers: true,
    featherColors: (kind, k) => kind === 'p' ? [0x33231a, 0x15100b] : kind === 't' ? [0xf5f2ea, 0xffffff] : [0x4a3222, 0x2e1f15],
  });
}
