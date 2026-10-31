// Personnages de la série « FOI DE MÈRE », style dessin à plat (vue de face).
// person(ctx, spec, pose) : origine aux pieds (y négatif vers le haut). spec.h = taille en px.
import { LINE, blob, stroke, limb, ell, smooth, tone } from '../engine/flat.js';

const PI = Math.PI;
export const SKIN = { a: '#7a4a2e', b: '#8d5a38', c: '#6a3f27', d: '#9a6440' };

// motifs de tissus
const pagne = (base, c1, c2) => (ctx) => {
  ctx.fillStyle = c1;
  for (let y = -900; y < 100; y += 34) for (let x = -400; x < 400; x += 34) { const o = ((y / 34) & 1) * 17; ctx.beginPath(); ctx.moveTo(x + o, y - 9); ctx.lineTo(x + o + 9, y); ctx.lineTo(x + o, y + 9); ctx.lineTo(x + o - 9, y); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = c2; for (let y = -900; y < 100; y += 34) for (let x = -400; x < 400; x += 34) { const o = ((y / 34) & 1) * 17; ctx.beginPath(); ctx.arc(x + o + 17, y, 3.5, 0, 7); ctx.fill(); }
};
const camo = (ctx) => { const cs = ['#4f5a32', '#6b6a3e', '#3a3f26']; let s = 3; const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280); for (let i = 0; i < 140; i++) { ctx.fillStyle = cs[i % 3]; ctx.beginPath(); ctx.ellipse(-300 + r() * 600, -900 + r() * 1000, 10 + r() * 16, 6 + r() * 10, r() * 3, 0, 7); ctx.fill(); } };
const check = (c) => (ctx) => { ctx.strokeStyle = c; ctx.lineWidth = 5; for (let x = -400; x < 400; x += 22) { ctx.beginPath(); ctx.moveTo(x, -900); ctx.lineTo(x, 100); ctx.stroke(); } for (let y = -900; y < 100; y += 22) { ctx.beginPath(); ctx.moveTo(-400, y); ctx.lineTo(400, y); ctx.stroke(); } };

export const CAST = {
  maman: { h: 440, kind: 'woman', skin: SKIN.b, hair: 'braids', hairC: '#1a1210', outfit: 'dress', c1: '#e0682f', c2: '#f2c14e', c3: '#2c6e63', shoes: '#5a2b1d', label: 'Maman', sub: 'journaliste' },
  papa: { h: 490, kind: 'man', skin: SKIN.c, hair: 'beret', hairC: '#15100d', outfit: 'military', shoes: '#1a1614', label: 'Papa', sub: 'militaire' },
  grand: { h: 360, kind: 'teen', skin: SKIN.a, hair: 'short', hairC: '#15100d', outfit: 'uniform', long: true, shoes: '#2a2420', label: 'Le grand frère', sub: '11 ans · 6e' },
  jumeau1: { h: 245, kind: 'child', skin: SKIN.b, hair: 'short', hairC: '#15100d', outfit: 'uniform', shoes: '#2a2420', bag: '#c0392b', label: 'Jumeau 1', sub: '5 ans · CP1' },
  jumeau2: { h: 245, kind: 'child', skin: SKIN.b, hair: 'short', hairC: '#15100d', outfit: 'uniform', shoes: '#2a2420', bag: '#2e6fb5', label: 'Jumeau 2', sub: '5 ans · CP1' },
  amie: { h: 420, kind: 'woman', skin: SKIN.d, hair: 'wrap', hairC: '#1a1210', outfit: 'dress', c1: '#6a3fa0', c2: '#f4d35e', c3: '#e8e0f0', shoes: '#3a2418', label: 'L’amie d’en face', sub: 'voisine' },
  mari: { h: 470, kind: 'man', skin: SKIN.a, hair: 'short', hairC: '#15100d', outfit: 'check', c1: '#3f6fa5', c2: '#d9e2ec', shoes: '#2a1d14', moustache: true, label: 'Son mari', sub: 'il a la voiture' },
  fille: { h: 230, kind: 'child', skin: SKIN.d, hair: 'puffs', hairC: '#15100d', outfit: 'dress', c1: '#f28aa0', c2: '#ffffff', c3: '#ffffff', shoes: '#c0392b', girl: true, label: 'Leur fille', sub: '7 ans' },
};

// pose : { armL:[haut, avant-bras] (radians, + = vers l'extérieur), armR, look:[x,y], mood: 'calme'|'sourire'|'peur'|'triste'|'priere', blink }
export function person(ctx, s, pose = {}) {
  const H = s.h, child = s.kind === 'child', teen = s.kind === 'teen', woman = s.kind === 'woman', man = s.kind === 'man';
  const headH = H * (child ? 0.31 : teen ? 0.245 : 0.225), headW = headH * (child ? 0.9 : 0.8);
  const yHead = -H + headH * 0.52, chin = -H + headH, shY = chin + headH * (child ? 0.16 : 0.28);
  const hipY = -H * (child ? 0.42 : 0.47);
  const sw = headW * (man ? 1.18 : woman ? 0.9 : teen ? 0.9 : 0.78);
  const hw = sw * (woman ? 0.98 : 0.78);
  const skin = s.skin, P = { armL: [0.12, 0.05], armR: [0.12, 0.05], look: [0, 0], mood: 'calme', ...pose };
  const W = 3.5;
  // ---- cheveux derrière (tresses) ----
  if (s.hair === 'braids') { for (let i = -3; i <= 3; i++) { if (Math.abs(i) < 2) continue; const x = i * headW * 0.16; blob(ctx, [[x - 8, yHead - headH * 0.1], [x + 8, yHead - headH * 0.1], [x + 9 + i * 4, shY + headH * 0.9], [x - 1 + i * 4, shY + headH * 0.95]], { fill: s.hairC, w: 2.5, shade: 0 }); } }
  // ---- jambes ----
  const legW = child ? H * 0.075 : H * 0.07, footY = 0;
  [-1, 1].forEach((sd) => {
    const x = sd * hw * 0.48;
    const pant = s.outfit === 'military' ? '#56603a' : s.outfit === 'uniform' ? '#b49a64' : s.outfit === 'check' ? '#3a3d4a' : skin;
    const shortLeg = s.outfit === 'uniform' && !s.long;
    if (shortLeg) { limb(ctx, [x, hipY], [x * 1.02, hipY * 0.55], legW * 1.25, legW * 1.15, pant, 0, { shade: 0.18 }); limb(ctx, [x * 1.02, hipY * 0.6], [x * 1.04, -14], legW * 0.8, legW * 0.7, skin, 0); blob(ctx, ell(x * 1.04, -12, legW * 0.55, 6, 0, 12), { fill: '#e8e2d6', w: 2.5, shade: 0 }); }
    else limb(ctx, [x, hipY], [x * 1.05, -10], legW * (s.outfit === 'dress' ? 0.75 : 1.2), legW * (s.outfit === 'dress' ? 0.62 : 1.0), pant, 0, { shade: 0.2 });
    if (s.outfit === 'military') blob(ctx, [[x * 1.05 - legW * 0.62, -60], [x * 1.05 + legW * 0.62, -60], [x * 1.05 + legW * 0.66, -8], [x * 1.05 - legW * 0.66, -8]], { fill: s.shoes, straight: true, w: W, shade: 0.15 }); // rangers
    blob(ctx, ell(x * 1.05 + sd * 6, footY - 8, legW * 0.75, legW * 0.38, 0, 16), { fill: s.shoes, w: W, shade: 0.25 });
  });
  // ---- torse / vêtement ----
  const waist = (shY + hipY) / 2;
  if (s.outfit === 'dress') {
    const hem = child ? hipY * 0.45 : hipY * 0.32;
    blob(ctx, [[-sw * 0.85, shY], [sw * 0.85, shY], [sw * 0.74, waist], [hw * 1.05, hipY], [hw * 1.32, hem], [-hw * 1.32, hem], [-hw * 1.05, hipY], [-sw * 0.74, waist]], { fill: s.c1, w: W, shade: 0.2, pattern: pagne(s.c1, s.c2, s.c3) });
    if (!child) { blob(ctx, [[-sw * 0.78, waist + 4], [sw * 0.78, waist + 4], [sw * 0.8, waist + 22], [-sw * 0.8, waist + 22]], { fill: s.c3, w: 2.5, shade: 0, straight: true }); }
  } else {
    const top = s.outfit === 'military' ? '#5e6a3c' : s.outfit === 'uniform' ? '#c8ae74' : s.c1;
    const pat = s.outfit === 'military' ? camo : s.outfit === 'check' ? check(s.c2 + '88') : null;
    blob(ctx, [[-sw, shY + 6], [sw, shY + 6], [sw * 0.92, waist], [hw * 1.02, hipY + 8], [-hw * 1.02, hipY + 8], [-sw * 0.92, waist]], { fill: top, w: W, shade: 0.2, pattern: pat });
    // col, boutons, poches
    blob(ctx, [[-headW * 0.32, shY + 2], [0, shY + headH * 0.32], [headW * 0.32, shY + 2], [headW * 0.12, shY - 4], [-headW * 0.12, shY - 4]], { fill: skin, w: 2.5, shade: 0 });
    stroke(ctx, [[-headW * 0.36, shY + 2], [-headW * 0.06, shY + headH * 0.42]], 3); stroke(ctx, [[headW * 0.36, shY + 2], [headW * 0.06, shY + headH * 0.42]], 3);
    for (let i = 0; i < 4; i++) { ctx.fillStyle = LINE; ctx.beginPath(); ctx.arc(0, shY + headH * 0.5 + i * (hipY - shY) * 0.17, 2.6, 0, 7); ctx.fill(); }
    if (s.outfit !== 'check') [-1, 1].forEach((sd) => blob(ctx, [[sd * sw * 0.2, shY + headH * 0.45], [sd * sw * 0.62, shY + headH * 0.45], [sd * sw * 0.62, shY + headH * 0.85], [sd * sw * 0.2, shY + headH * 0.85]], { fill: tone(top.startsWith('#') ? top : '#888888', -0.08), w: 2.2, shade: 0, straight: true }));
    if (s.outfit === 'military' || s.outfit === 'uniform') [-1, 1].forEach((sd) => blob(ctx, [[sd * sw * 0.45, shY + 4], [sd * sw * 0.98, shY + 8], [sd * sw * 0.98, shY + 20], [sd * sw * 0.45, shY + 16]], { fill: tone(s.outfit === 'military' ? '#5e6a3c' : '#c8ae74', -0.12), w: 2.2, shade: 0, straight: true })); // épaulettes
    if (s.outfit === 'military') blob(ctx, [[-hw * 1.02, hipY - 6], [hw * 1.02, hipY - 6], [hw * 1.02, hipY + 10], [-hw * 1.02, hipY + 10]], { fill: '#2a2620', w: 2.5, shade: 0, straight: true });
    if (s.outfit === 'uniform' && !s.long) blob(ctx, [[-hw * 1.05, hipY - 4], [hw * 1.05, hipY - 4], [hw * 1.15, hipY + H * 0.12], [-hw * 1.15, hipY + H * 0.12]], { fill: '#b49a64', w: W, shade: 0.15, straight: true });
  }
  // cartable
  if (s.bag) [-1, 1].forEach((sd) => stroke(ctx, [[sd * sw * 0.55, shY + 4], [sd * sw * 0.6, hipY - 10]], 6, s.bag));
  // ---- bras ----
  const sleeve = s.outfit === 'dress' ? s.c1 : s.outfit === 'military' ? '#5e6a3c' : s.outfit === 'uniform' ? '#c8ae74' : s.c1;
  const armW = child ? H * 0.06 : H * 0.052, Lu = (hipY - shY) * 0.52, Lf = (hipY - shY) * 0.5;
  const hands = [];
  [-1, 1].forEach((sd) => {
    const [a1, a2] = sd < 0 ? P.armR : P.armL;
    const S = [sd * sw * 0.9, shY + armW * 0.4];
    const E = [S[0] + sd * Math.sin(a1) * Lu, S[1] + Math.cos(a1) * Lu];
    const Wr = [E[0] + sd * Math.sin(a1 + a2) * Lf, E[1] + Math.cos(a1 + a2) * Lf];
    limb(ctx, S, E, armW * 1.15, armW, s.outfit === 'military' || s.outfit === 'check' ? sleeve : skin, 0, { shade: 0.2, pattern: s.outfit === 'military' ? camo : null });
    if (s.outfit !== 'military' && s.outfit !== 'check') limb(ctx, S, [S[0] + (E[0] - S[0]) * 0.45, S[1] + (E[1] - S[1]) * 0.45], armW * 1.45, armW * 1.3, sleeve, 0, { shade: 0.2, pattern: s.outfit === 'dress' ? pagne(s.c1, s.c2, s.c3) : null });
    limb(ctx, E, Wr, armW, armW * 0.85, s.outfit === 'military' || s.outfit === 'check' ? sleeve : skin, 0, { shade: 0.2, pattern: s.outfit === 'military' ? camo : null });
    blob(ctx, ell(Wr[0], Wr[1] + armW * 0.5, armW * 0.62, armW * 0.75, 0, 14), { fill: skin, w: W, shade: 0.2 });
    stroke(ctx, [[Wr[0] - sd * armW * 0.45, Wr[1] + armW * 0.3], [Wr[0] - sd * armW * 0.7, Wr[1] + armW * 0.75]], 3);
    hands.push(Wr);
  });
  // ---- cou + tête ----
  limb(ctx, [0, chin - headH * 0.1], [0, shY + 6], headW * 0.36, headW * 0.42, skin, 0, { shade: 0.3 });
  [-1, 1].forEach((sd) => blob(ctx, ell(sd * headW * 0.5, yHead + headH * 0.05, headW * 0.11, headH * 0.13, 0, 12), { fill: skin, w: W, shade: 0.15 }));
  const face = [[-headW * 0.5, yHead - headH * 0.15], [-headW * 0.42, yHead - headH * 0.45], [0, yHead - headH * 0.52], [headW * 0.42, yHead - headH * 0.45], [headW * 0.5, yHead - headH * 0.15], [headW * 0.46, yHead + headH * 0.2], [headW * 0.28, yHead + headH * 0.42], [0, yHead + headH * 0.5], [-headW * 0.28, yHead + headH * 0.42], [-headW * 0.46, yHead + headH * 0.2]];
  blob(ctx, face, { fill: skin, w: W, shade: 0.18, dx: 0.1, dy: 0.05 });
  // ---- cheveux devant ----
  const cap = (h = 0.32, c = s.hairC) => blob(ctx, [[-headW * 0.52, yHead - headH * 0.05], [-headW * 0.5, yHead - headH * 0.38], [-headW * 0.25, yHead - headH * 0.56], [headW * 0.25, yHead - headH * 0.56], [headW * 0.5, yHead - headH * 0.38], [headW * 0.52, yHead - headH * 0.05], [headW * 0.4, yHead - headH * h], [0, yHead - headH * (h + 0.05)], [-headW * 0.4, yHead - headH * h]], { fill: c, w: W, shade: 0.12 });
  if (s.hair === 'short' || s.hair === 'beret') cap(0.3);
  if (s.hair === 'braids') { cap(0.25); for (let i = -3; i <= 3; i++) stroke(ctx, [[i * headW * 0.12, yHead - headH * 0.5], [i * headW * 0.15, yHead - headH * 0.28]], 2, '#3a2a24'); blob(ctx, ell(0, yHead - headH * 0.62, headW * 0.3, headH * 0.16, 0, 16), { fill: s.hairC, w: W, shade: 0.12 }); }
  if (s.hair === 'puffs') { cap(0.3); [-1, 1].forEach((sd) => { blob(ctx, ell(sd * headW * 0.5, yHead - headH * 0.5, headW * 0.25, headW * 0.25, 0, 16), { fill: s.hairC, w: W, shade: 0.1 }); blob(ctx, ell(sd * headW * 0.36, yHead - headH * 0.38, 7, 5, 0, 10), { fill: '#f4d35e', w: 2, shade: 0 }); }); }
  if (s.hair === 'wrap') { cap(0.25); blob(ctx, [[-headW * 0.56, yHead - headH * 0.2], [-headW * 0.6, yHead - headH * 0.62], [-headW * 0.2, yHead - headH * 0.95], [headW * 0.35, yHead - headH * 0.92], [headW * 0.62, yHead - headH * 0.6], [headW * 0.56, yHead - headH * 0.2], [0, yHead - headH * 0.32]], { fill: s.c1, w: W, shade: 0.2, pattern: pagne(s.c1, s.c2, s.c3) }); blob(ctx, ell(headW * 0.42, yHead - headH * 0.82, headW * 0.2, headH * 0.13, 0.6, 14), { fill: s.c1, w: W, shade: 0.2, pattern: pagne(s.c1, s.c2, s.c3) }); }
  if (s.hair === 'beret') { blob(ctx, [[-headW * 0.56, yHead - headH * 0.3], [-headW * 0.45, yHead - headH * 0.6], [headW * 0.1, yHead - headH * 0.72], [headW * 0.72, yHead - headH * 0.5], [headW * 0.62, yHead - headH * 0.3]], { fill: '#2f4a2a', w: W, shade: 0.25 }); blob(ctx, ell(-headW * 0.25, yHead - headH * 0.42, 8, 9, 0, 10), { fill: '#d4af37', w: 2, shade: 0 }); }
  // ---- visage : grands yeux ronds, sourcils, nez, bouche ----
  const er = headW * (child ? 0.2 : 0.17), ey = yHead - headH * 0.04, ex = headW * 0.19;
  const m = P.mood;
  [-1, 1].forEach((sd) => {
    const cx = sd * ex;
    blob(ctx, ell(cx, ey, er, er * (m === 'priere' || P.blink ? 0.15 : 1.05), 0, 20), { fill: '#ffffff', w: 3, shade: 0 });
    if (!(m === 'priere' || P.blink)) { ctx.fillStyle = LINE; ctx.beginPath(); ctx.arc(cx + P.look[0] * er * 0.45, ey + P.look[1] * er * 0.45, er * (m === 'peur' ? 0.16 : 0.24), 0, 7); ctx.fill(); }
    if (woman || s.girl) stroke(ctx, [[cx + sd * er * 0.7, ey - er * 0.75], [cx + sd * er * 1.1, ey - er * 1.0]], 2.5);
    const bAng = m === 'peur' || m === 'triste' ? -0.35 : m === 'colere' ? 0.4 : 0;
    stroke(ctx, [[cx - er * 0.8, ey - er * 1.35 + sd * bAng * er * 0.6], [cx + er * 0.8, ey - er * 1.35 - sd * bAng * er * 0.6]], man ? 5 : 3.5);
  });
  stroke(ctx, [[-headW * 0.06, ey + er * 1.0], [-headW * 0.1, ey + er * 1.55], [headW * 0.02, ey + er * 1.7], [headW * 0.1, ey + er * 1.55]], 3); // nez
  const my = yHead + headH * 0.27;
  if (m === 'sourire') { blob(ctx, [[-headW * 0.2, my - 4], [headW * 0.2, my - 4], [headW * 0.1, my + headH * 0.08], [-headW * 0.1, my + headH * 0.08]], { fill: '#5a1f1f', w: 3, shade: 0 }); blob(ctx, [[-headW * 0.17, my - 3], [headW * 0.17, my - 3], [headW * 0.14, my + 3], [-headW * 0.14, my + 3]], { fill: '#fff', w: 0, shade: 0, straight: true }); }
  else if (m === 'peur') blob(ctx, ell(0, my + 4, headW * 0.09, headH * 0.07, 0, 14), { fill: '#3a1414', w: 3, shade: 0 });
  else if (m === 'triste') stroke(ctx, [[-headW * 0.13, my + 6], [0, my], [headW * 0.13, my + 6]], 3.2);
  else stroke(ctx, [[-headW * 0.13, my], [0, my + 4], [headW * 0.13, my]], 3.2);
  if (s.moustache) blob(ctx, [[-headW * 0.2, my - 6], [0, my - 12], [headW * 0.2, my - 6], [headW * 0.16, my - 1], [-headW * 0.16, my - 1]], { fill: s.hairC, w: 2, shade: 0 });
  if (woman) { ctx.fillStyle = '#f2c14e'; [-1, 1].forEach((sd) => { ctx.beginPath(); ctx.arc(sd * headW * 0.52, yHead + headH * 0.2, 4, 0, 7); ctx.fill(); }); } // boucles d'oreilles
  return { hands, head: [0, yHead], top: -H };
}
