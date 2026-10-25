// Les personnages de PÉPIN ! en version « rubber hose » (trait noir, aplats blancs/noirs).
// Chaque fonction dessine le personnage dans son repère local : origine aux pieds, regard vers +x,
// unité ≈ 1 px à l'échelle 1. Les mêmes proportions servent dans tous les plans (cohérence).
import { INK, WHITE, GREY, GREY2, ell, shape, line, union, hose, eye, brow, glove, path } from '../engine/ink.js';

const PI = Math.PI;
const rot = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
const polar = (o, len, ang) => [o[0] + Math.sin(ang) * len, o[1] + Math.cos(ang) * len]; // ang 0 = vers le bas, > 0 = vers l'avant
const mix = (a, b, k) => a + (b - a) * k;

// ---------------- PÉPIN ----------------
export const PEPIN0 = {
  squash: 1, lean: 0, neck: 1, headTilt: 0, lookX: 0.2, lookY: 0, lid: 0.35, lidLow: 0.08, tilt: 0, pupil: 1, cross: 0, eyePop: 0,
  brow: 0, browAng: 0, mouth: 0, smile: 0.5, smirk: 0, tongue: 0, cheeks: 0, tuft: 0, ear: 0,
  armL: [0.25, 0.2], armR: [0.35, 0.25], legL: [-0.1, -0.15], legR: [0.15, -0.15], handOpen: 0.5, tail: 0.5, tailWave: 0, glide: 0,
};

export function drawPepin(ctx, P = {}) {
  const p = { ...PEPIN0, ...P };
  ctx.save();
  ctx.scale(1 / Math.sqrt(p.squash), p.squash);
  const hips = [0, -78];
  const W = 6;
  ctx.save(); ctx.translate(...hips); ctx.rotate(p.lean);
  // repères (dans l'espace des hanches tournées)
  const sh = [6, -82], rump = [-26, -14];
  const hand = (side) => polar(sh, 74, (side ? p.armR : p.armL)[0] + PI * 0);
  const legRoot = (side) => [side ? 10 : -6, -6];
  const foot = (side) => polar(legRoot(side), 70, (side ? p.legR : p.legL)[0]);
  // --- bras et jambe du fond ---
  const hL = hand(0); hose(ctx, [sh[0] - 6, sh[1]], hL, p.armL[1], 9, { seed: 101, fill: GREY });
  glove(ctx, ...hL, PI / 2 - p.armL[0] - 0.3, 0.9, p.handOpen, 102);
  const fL = foot(0); hose(ctx, legRoot(0), fL, p.legL[1], 11, { seed: 103, fill: GREY });
  shape(ctx, ell(fL[0] + 16, fL[1] - 4, 24, 9, 0.05, 12), { fill: GREY, w: 5, seed: 104 });
  // --- queue touffue en S ---
  const tw = p.tailWave, tc = p.tail;
  const tp = (k) => [rump[0] - 40 * k - Math.sin(k * 3 + tw) * 14, rump[1] - k * (40 + 120 * tc) + Math.sin(k * PI) * 30 * (1 - tc)];
  const blobs = []; for (let i = 0; i <= 8; i++) { const k = i / 8; const [x, y] = tp(k); blobs.push(ell(x, y, 12 + 22 * Math.sin(k * PI * 0.9), 12 + 20 * Math.sin(k * PI * 0.9), 0, 12)); }
  union(ctx, blobs, { w: W - 1, seed: 105 });
  for (let i = 2; i < 8; i += 2) { const [x, y] = tp(i / 8); line(ctx, [[x - 8, y + 4], [x, y - 3], [x + 7, y + 5]], 3, 106 + i); }
  // --- membrane de vol (planeur) ---
  if (p.glide > 0.02) {
    const hR = hand(1), fR = foot(1), k = p.glide;
    const pts = [[sh[0] - 4, sh[1] + 6], [mix(sh[0], hR[0], 0.5), mix(sh[1], hR[1], 0.5) - 6], hR, [mix(hR[0], fR[0], 0.35) - 8 * k, mix(hR[1], fR[1], 0.35) + 10 * k], [mix(hR[0], fR[0], 0.7) - 6 * k, mix(hR[1], fR[1], 0.7) + 8 * k], fR, [legRoot(1)[0], legRoot(1)[1] - 6]];
    shape(ctx, pts, { fill: GREY, w: 5, seed: 107 });
  }
  // --- corps (petit, sec) ---
  shape(ctx, [...ell(0, -44, 30, 50, 0.08, 16)], { w: W, seed: 108 });
  line(ctx, [[14, -70], [20, -40], [12, -10]], 3, 109); // ligne du ventre
  // --- jambe avant ---
  const fR = foot(1); hose(ctx, legRoot(1), fR, p.legR[1], 11, { seed: 110 });
  shape(ctx, ell(fR[0] + 16, fR[1] - 4, 24, 9, 0.05, 12), { w: 5, seed: 111 });
  // --- tête au bout d'un cou fin ---
  const nb = [10, -92];
  const hc = [nb[0] + 14 + Math.sin(p.headTilt) * 10, nb[1] - 44 * p.neck];
  hose(ctx, nb, [hc[0] - 6, hc[1] + 30], 0.05, 16, { seed: 112 });
  ctx.save(); ctx.translate(...hc); ctx.rotate(p.headTilt);
  // oreilles (derrière)
  const earA = -0.35 - p.ear * 0.6;
  [[-22, -40, -0.2], [0, -48, 0.15]].forEach(([x, y, a], i) => { ctx.save(); ctx.translate(x, y); ctx.rotate(a + earA); shape(ctx, ell(0, -22, 15, 28, 0, 12), { fill: i ? WHITE : GREY, w: 5, seed: 113 + i }); line(ctx, [[0, -38], [-2, -18], [2, -6]], 3, 115 + i); ctx.restore(); });
  // mèche en bataille (noire)
  const tu = p.tuft;
  [[-18, -0.9, 30], [-6, -0.45, 40], [6, -0.1, 46], [17, 0.3, 38], [26, 0.7, 26]].forEach(([x, a, l], i) => {
    const ang = a * (1 - 0.5 * tu) - 0.3 - (tu < 0 ? -tu * 1.2 : 0), L = l * (1 + Math.max(0, tu) * 0.35);
    shape(ctx, [[x - 6, -46], [x + Math.sin(ang) * L, -46 - Math.cos(ang) * L], [x + 6, -46]], { fill: INK, w: 3, seed: 117 + i, boil: 0.6 });
  });
  // crâne + museau + joues fondus en une seule forme
  const ch = 1 + p.cheeks * 0.8;
  union(ctx, [ell(0, 0, 54, 50, 0, 18), ell(48, 14, 40, 24, -0.12, 14), ell(30, 28, 22 * ch, 18 * ch, 0, 12)], { w: W, seed: 122 });
  // bouche (sous le museau)
  if (p.mouth > 0.08) {
    const mo = p.mouth;
    shape(ctx, [[34, 30], [58, 26 + 2], [82, 24], [74, 30 + 46 * mo], [52, 34 + 56 * mo], [36, 34 + 30 * mo]], { fill: '#3a1d1d', w: 5, seed: 124 });
    if (p.tongue > 0.05) shape(ctx, ell(58 + 10 * p.tongue, 30 + 40 * mo, 16, 12 + 10 * p.tongue, 0.3, 12), { fill: '#e8a0a0', w: 4, seed: 125 });
  } else {
    const sm = p.smile, sk = p.smirk;
    line(ctx, [[30, 30 - sk * 8], [48, 34 + sm * 8], [66, 32 + sm * 6], [82, 22 - sm * 6 - sk * 4]], 5, 126);
  }
  // grandes incisives
  shape(ctx, [[64, 24], [64, 42], [73, 42], [73, 23]], { w: 4, seed: 127 }); shape(ctx, [[73, 23], [73, 40], [81, 39], [81, 21]], { w: 4, seed: 128 });
  // truffe + moustaches
  shape(ctx, ell(88, 8, 12, 10, 0, 12), { fill: INK, w: 3, seed: 129 });
  [[-0.25, 30], [0.05, 34], [0.3, 28]].forEach(([a, l], i) => line(ctx, [[74, 14 + i * 5], [74 + Math.cos(a) * l, 14 + i * 5 + Math.sin(a) * l]], 2.5, 130 + i));
  // yeux exorbités (part de tarte) + sourcils
  const pop = 1 + p.eyePop * 0.45;
  const E = [[12, -18, 15, 22, 0], [42, -20, 18, 26, 1]];
  E.forEach(([x, y, rx, ry, i]) => eye(ctx, x, y - p.eyePop * 10, rx * pop, ry * pop, { lookX: p.lookX + (i ? -1 : 1) * p.cross, lookY: p.lookY, lid: p.lid, lidLow: p.lidLow, tilt: p.tilt, pupil: p.pupil, seed: 132 + i, side: 1 }));
  E.forEach(([x, y, rx, ry, i]) => brow(ctx, x, y - ry * pop - 12 - p.brow * 10 - p.eyePop * 14, rx * 2.1, p.browAng + (i ? -1 : 1) * p.smirk * 0.4, i ? 1 : -1, 8));
  ctx.restore();
  // --- bras avant (par-dessus) ---
  const hR = hand(1); hose(ctx, sh, hR, p.armR[1], 10, { seed: 140 });
  glove(ctx, ...hR, PI / 2 - p.armR[0] - 0.3, 1, p.handOpen, 141);
  ctx.restore();
  ctx.restore();
}

// ---------------- MARGOT LA PIE (fine, pointue, rapide) ----------------
export const MARGOT0 = { squash: 1, lean: 0.15, lookX: 0.3, lookY: 0, lid: 0.38, lidLow: 0.15, tilt: 0.7, pupil: 0.75, beak: 0, flap: 0, wingOpen: 0, legs: 0, smirk: 1, tail: 0 };
export function drawMargot(ctx, P = {}) {
  const p = { ...MARGOT0, ...P };
  ctx.save(); ctx.scale(1 / Math.sqrt(p.squash), p.squash);
  // pattes fines
  if (p.legs >= 0) [[-8, 0], [10, 1]].forEach(([x, i]) => { line(ctx, [[x, -60], [x + 2, -20], [x + 6, 0]], 5, 300 + i); line(ctx, [[x - 6, 0], [x + 16, 0]], 5, 302 + i); });
  ctx.translate(0, -62); ctx.rotate(p.lean);
  // longue queue (deux plumes)
  [[-0.05, 0], [0.12, 1]].forEach(([a, i]) => { ctx.save(); ctx.rotate(a + p.tail * 0.3); shape(ctx, [[-40, -6], [-170, -4 - i * 10], [-185, 6 - i * 10], [-40, 14]], { fill: INK, w: 4, seed: 304 + i }); ctx.restore(); });
  // aile du fond
  const wing = (front) => { ctx.save(); ctx.translate(-4, -40); ctx.rotate(-0.15 - p.flap * (front ? 1 : 0.8) - p.wingOpen * 0.4);
    const L = 90 + p.wingOpen * 60;
    shape(ctx, [[0, 0], [-L * 0.5, -10 - p.wingOpen * 20], [-L, -4 - p.wingOpen * 30], [-L * 0.8, 16], [-L * 0.3, 22]], { fill: front ? INK : '#2a2724', w: 4, seed: 306 + front });
    shape(ctx, [[-L * 0.55, 2], [-L * 0.95, -2 - p.wingOpen * 28], [-L * 0.8, 12]], { fill: WHITE, w: 3, seed: 308 + front });
    ctx.restore(); };
  wing(0);
  // corps noir effilé + ventre blanc
  shape(ctx, [[-60, 0], [-20, -48], [24, -58], [46, -36], [40, 8], [0, 24]], { fill: INK, w: 5, seed: 310 });
  shape(ctx, [[-14, 6], [10, -16], [36, -14], [34, 12], [4, 22]], { fill: WHITE, w: 4, seed: 311 });
  wing(1);
  // tête + bec pointu
  ctx.save(); ctx.translate(40, -70);
  shape(ctx, ell(0, 0, 32, 30, 0, 16), { fill: INK, w: 5, seed: 312 });
  const bo = p.beak;
  shape(ctx, [[22, -8], [92, -2 + bo * 6], [24, 8]], { fill: '#3a3632', w: 4, seed: 313 });
  if (bo > 0.05) shape(ctx, [[22, 8], [80, 10 + bo * 26], [20, 14]], { fill: '#3a3632', w: 4, seed: 314 });
  eye(ctx, 8, -6, 16, 20, { lookX: p.lookX, lookY: p.lookY, lid: p.lid, lidLow: p.lidLow, tilt: p.tilt, pupil: p.pupil, seed: 315, skin: INK });
  eye(ctx, -16, -8, 12, 16, { lookX: p.lookX, lookY: p.lookY, lid: p.lid, lidLow: p.lidLow, tilt: p.tilt, pupil: p.pupil, seed: 316, skin: INK });
  // sourcils blancs en V (lisibles sur la tête noire)
  ctx.save(); ctx.strokeStyle = WHITE; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-4, -32); ctx.lineTo(22, -24); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-30, -26); ctx.lineTo(-8, -32); ctx.stroke();
  ctx.restore();
  ctx.restore();
  ctx.restore();
}

// ---------------- BOUBOULE LE RATON LAVEUR (gros, lent, bourrin) ----------------
export const BOU0 = { squash: 1, lean: 0, lookX: 0.2, lookY: 0, lid: 0.45, lidLow: 0.25, tilt: 0.6, pupil: 0.6, mouth: 0, grin: 1, armL: [0.3, 0.2], armR: [0.4, 0.2], legL: [-0.05, 0], legR: [0.08, 0], handOpen: 0.5, tail: 0, belly: 0 };
export function drawBouboule(ctx, P = {}) {
  const p = { ...BOU0, ...P };
  ctx.save(); ctx.scale(1 / Math.sqrt(p.squash), p.squash);
  const legRoot = (s) => [s ? 34 : -30, -60];
  const foot = (s) => polar(legRoot(s), 50, (s ? p.legR : p.legL)[0]);
  // queue annelée (derrière)
  const tps = []; for (let i = 0; i <= 6; i++) { const k = i / 6; tps.push([-90 - k * 70, -80 - k * 90 + Math.sin(k * 3 + p.tail) * 12]); }
  union(ctx, tps.map(([x, y], i) => ell(x, y, 30 - i * 1.5, 30 - i * 1.5, 0, 12)), { w: 6, seed: 400 });
  tps.forEach(([x, y], i) => { if (i % 2) shape(ctx, ell(x, y, 26 - i, 9, 1.0, 12), { fill: INK, w: 0, seed: 401 + i }); });
  // bras et jambe du fond
  const sh = [-50, -205];
  const hL = polar(sh, 95, p.armL[0]); hose(ctx, sh, hL, p.armL[1], 24, { seed: 410, fill: GREY }); glove(ctx, ...hL, PI / 2 - p.armL[0] - 0.3, 1.4, p.handOpen, 411);
  const fL = foot(0); hose(ctx, legRoot(0), fL, p.legL[1], 26, { seed: 412, fill: GREY }); shape(ctx, ell(fL[0] + 20, fL[1] - 6, 34, 13, 0, 12), { fill: INK, w: 5, seed: 413 });
  // gros corps en poire + ventre
  const b = 1 + p.belly * 0.15;
  shape(ctx, [[-90 * b, -60], [-80, -170], [-30, -235], [40, -232], [85, -170], [100 * b, -70], [60, -32], [-50, -30]], { w: 7, seed: 414 });
  shape(ctx, ell(18, -105, 62 * b, 64, 0.05, 16), { fill: '#efe8da', w: 4, seed: 415 });
  // jambe avant
  const fR = foot(1); hose(ctx, legRoot(1), fR, p.legR[1], 26, { seed: 416 }); shape(ctx, ell(fR[0] + 20, fR[1] - 6, 34, 13, 0, 12), { fill: INK, w: 5, seed: 417 });
  // tête : petite pour le corps, long museau, masque de bandit
  ctx.save(); ctx.translate(30, -262);
  [[-38, -40, -0.4], [16, -48, 0.3]].forEach(([x, y, a], i) => { shape(ctx, ell(x, y, 18, 22, a, 12), { w: 5, seed: 418 + i }); shape(ctx, ell(x, y + 3, 9, 12, a, 10), { fill: INK, w: 0, seed: 420 + i }); });
  union(ctx, [ell(0, 0, 58, 46, 0, 18), ell(52, 14, 42, 24, -0.08, 14)], { w: 7, seed: 422 });
  // masque noir avec trous pour les yeux
  shape(ctx, [[-52, -6], [-20, -26], [30, -24], [74, -6], [60, 12], [24, 4], [-10, 10], [-48, 12]], { fill: INK, w: 0, seed: 423 });
  eye(ctx, 2, -4, 13, 15, { lookX: p.lookX, lookY: p.lookY, lid: p.lid, lidLow: p.lidLow, tilt: p.tilt, pupil: p.pupil, seed: 424, skin: INK });
  eye(ctx, 34, -6, 15, 17, { lookX: p.lookX, lookY: p.lookY, lid: p.lid, lidLow: p.lidLow, tilt: p.tilt, pupil: p.pupil, seed: 425, skin: INK });
  ctx.save(); ctx.strokeStyle = INK; brow(ctx, 2, -30, 30, -0.9, -1, 10); brow(ctx, 36, -32, 34, -0.9, 1, 10); ctx.restore();
  shape(ctx, ell(92, 10, 13, 11, 0, 12), { fill: INK, w: 3, seed: 426 });
  // rictus de brute plein de dents
  const mo = p.mouth;
  shape(ctx, [[30, 26], [60, 30 + mo * 30], [88, 24], [74, 40 + mo * 40], [44, 42 + mo * 36]], { fill: '#3a1d1d', w: 5, seed: 427 });
  if (p.grin > 0.2) for (let i = 0; i < 5; i++) { const x = 40 + i * 9; shape(ctx, [[x, 30 + i * 0.5], [x + 4, 40], [x + 8, 30 + i * 0.5]], { w: 2.5, seed: 428 + i }); }
  ctx.restore();
  // bras avant
  const sR = [50, -200];
  const hR = polar(sR, 95, p.armR[0]); hose(ctx, sR, hR, p.armR[1], 26, { seed: 440 }); glove(ctx, ...hR, PI / 2 - p.armR[0] - 0.3, 1.5, p.handOpen, 441);
  ctx.restore();
}
