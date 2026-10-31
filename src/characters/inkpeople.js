// Personnages humains au trait (encre noire sur papier crème) pour les visions de « L'INSTANT ».
// Dessinés de profil, regard vers +x ; origine aux pieds ; ~300 px pour un adulte à l'échelle 1.
// Angles : 0 = membre vers le bas, > 0 = vers l'avant (+x).
import { INK, WHITE, GREY, GREY2, ell, shape as shapeSmooth, line, hose, path, sn } from '../engine/ink.js';
// polygones à peu de points (rectangles, trapèzes) : traits droits qui « respirent » à peine ; sinon courbe lisse
let INK_T = 0; export const setInkT = (t) => (INK_T = t);
function shape(ctx, pts, o = {}) {
  if (pts.length > 5) return shapeSmooth(ctx, pts, o);
  const { fill = WHITE, w = 6, closed = true, seed = 1, stroke = INK } = o;
  ctx.beginPath();
  pts.forEach(([x, y], i) => { const jx = sn(seed + i * 1.37, INK_T) * 0.7, jy = sn(seed + i * 2.11 + 50, INK_T) * 0.7; i ? ctx.lineTo(x + jx, y + jy) : ctx.moveTo(x + jx, y + jy); });
  if (closed) ctx.closePath();
  if (fill && closed) { ctx.fillStyle = fill; ctx.fill(); }
  if (w > 0) { ctx.lineWidth = w; ctx.strokeStyle = stroke; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }
}


const PI = Math.PI;
const pol = (o, len, a) => [o[0] + Math.sin(a) * len, o[1] + Math.cos(a) * len];
const rot = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];

const KINDS = {
  man: { thigh: 80, shin: 78, torso: 112, headR: 30, armU: 66, armL: 60, limb: 24, chest: 66, waist: 56, neck: 14, top: GREY2, bottom: '#6b665c', hair: 'short', beard: true },
  son: { thigh: 80, shin: 78, torso: 110, headR: 30, armU: 66, armL: 60, limb: 23, chest: 62, waist: 54, neck: 14, top: '#8b8378', bottom: '#4a463f', hair: 'short', beard: true },
  woman: { thigh: 76, shin: 74, torso: 100, headR: 28, armU: 60, armL: 55, limb: 18, chest: 54, waist: 44, neck: 15, top: WHITE, bottom: GREY, hair: 'bun', dress: true },
  partner: { thigh: 76, shin: 74, torso: 100, headR: 28, armU: 60, armL: 55, limb: 18, chest: 52, waist: 44, neck: 15, top: '#d8cdbb', bottom: GREY2, hair: 'long', dress: true },
  child: { thigh: 42, shin: 40, torso: 60, headR: 27, armU: 34, armL: 31, limb: 15, chest: 38, waist: 36, neck: 6, top: '#e9e2d4', bottom: '#e9e2d4', hair: 'kid' },
  cop: { thigh: 80, shin: 78, torso: 112, headR: 29, armU: 66, armL: 60, limb: 24, chest: 64, waist: 58, neck: 14, top: '#3b3a3f', bottom: '#2c2b30', hair: 'cap' },
};

export const PEOPLE0 = {
  lean: 0, headTilt: 0, armF: [0.1, 0.25], armB: [-0.05, 0.2], legF: [0.05, 0], legB: [-0.05, 0], fistF: 0, fistB: 0,
  mood: 'neutral', eyes: 1, mouth: 0, look: 0, sit: 0, kneel: 0, coat: 0, scaleY: 1,
};

// dessine une personne ; renvoie les points utiles (mains, tête) en coordonnées locales
export function person(ctx, kind, P = {}) {
  const p = { ...PEOPLE0, ...P }, K = { ...KINDS[kind], ...(P.look2 || {}) };
  const W = 5;
  // jambes depuis la hanche
  const hip0 = [0, 0];
  const legPts = (a) => { const knee = pol(hip0, K.thigh, a[0]); const foot = pol(knee, K.shin, a[0] - a[1]); return { knee, foot }; };
  let LF = legPts(p.legF), LB = legPts(p.legB);
  if (p.sit) { LF = { knee: [K.thigh, 0], foot: [K.thigh + 4, K.shin] }; LB = { knee: [K.thigh - 6, 2], foot: [K.thigh - 4, K.shin] }; }
  if (p.kneel) { LF = { knee: pol(hip0, K.thigh, 1.2), foot: [0, 0] }; LF.foot = [LF.knee[0], LF.knee[1] + K.shin * 0.9]; LB = { knee: pol(hip0, K.thigh, 0.15) }; LB.foot = [LB.knee[0] - K.shin, LB.knee[1] + 4]; }
  const lowY = Math.max(LF.foot[1], LB.foot[1]);
  ctx.save(); ctx.translate(0, -lowY);
  if (p.scaleY !== 1) ctx.scale(1, p.scaleY);
  const hip = hip0;
  const sh = pol(hip, -K.torso, -p.lean); // épaule
  const neckTop = pol(sh, -K.neck, -p.lean - p.headTilt * 0.3);
  const hc = add(pol(neckTop, -K.headR * 0.85, -p.lean - p.headTilt), [4, 0]);
  const armPts = (a, f) => { const el = pol(sh, K.armU, a[0] + p.lean * 0.2); const hd = pol(el, K.armL, a[0] + a[1] + p.lean * 0.2); return { el, hd }; };
  const AF = armPts(p.armF), AB = armPts(p.armB);
  const hand = (pt, fist, fill, seed) => {
    if (fist) { shape(ctx, ell(pt[0], pt[1], K.limb * 0.62, K.limb * 0.55, 0, 12), { fill, w: 4, seed }); line(ctx, [[pt[0] + K.limb * 0.1, pt[1] - K.limb * 0.3], [pt[0] + K.limb * 0.45, pt[1] - K.limb * 0.05]], 3, seed + 1); }
    else shape(ctx, ell(pt[0], pt[1], K.limb * 0.5, K.limb * 0.62, 0.3, 12), { fill, w: 4, seed });
  };
  // ---- membres du fond ----
  hose(ctx, sh, AB.el, 0.04, K.limb * 0.92, { fill: GREY, w: 4, seed: 11 }); hose(ctx, AB.el, AB.hd, 0.04, K.limb * 0.82, { fill: GREY, w: 4, seed: 12 });
  hand(AB.hd, p.fistB, GREY, 13);
  hose(ctx, hip, LB.knee, 0.03, K.limb * 1.15, { fill: K.dress ? GREY : K.bottom === WHITE ? GREY : GREY2, w: 4, seed: 14 }); hose(ctx, LB.knee, LB.foot, 0.03, K.limb * 0.95, { fill: K.dress ? GREY : GREY2, w: 4, seed: 15 });
  shape(ctx, ell(LB.foot[0] + 10, LB.foot[1] - 4, 20, 8, 0, 10), { fill: INK, w: 3, seed: 16 });
  // ---- torse ----
  const dirT = [Math.sin(-p.lean) * -1, -Math.cos(p.lean)]; // vers le haut
  const nrm = [Math.cos(p.lean), Math.sin(p.lean)];
  const T = (pt, f) => [pt[0] + nrm[0] * f, pt[1] + nrm[1] * f];
  const torso = [T(sh, K.chest * 0.5), T(pol(hip, -K.torso * 0.55, -p.lean), K.chest * 0.42), T(hip, K.waist * 0.5), T(hip, -K.waist * 0.5), T(pol(hip, -K.torso * 0.6, -p.lean), -K.chest * 0.45), T(sh, -K.chest * 0.42), pol(sh, -8, -p.lean)];
  if (K.dress) { // robe trapèze jusqu'aux genoux
    const kn = p.sit ? [K.thigh + 6, -2] : [LF.knee[0] * 0.5 + LB.knee[0] * 0.5, LF.knee[1] - 4];
    shape(ctx, [T(pol(hip, -K.torso * 0.45, -p.lean), K.waist * 0.5), [kn[0] + 34, kn[1] + 6], [kn[0] - 40, kn[1] + 8], T(pol(hip, -K.torso * 0.45, -p.lean), -K.waist * 0.5)], { fill: K.bottom, w: W, seed: 17 });
  }
  shape(ctx, torso, { fill: K.top, w: W, seed: 18 });
  if (p.coat) shape(ctx, [T(sh, K.chest * 0.55), T(hip, K.waist * 0.6), [hip[0] + 10, hip[1] + 40], [hip[0] - 34, hip[1] + 40], T(sh, -K.chest * 0.5)], { fill: GREY2, w: W, seed: 19 });
  if (kind === 'cop') { line(ctx, [T(hip, K.waist * 0.5), T(hip, -K.waist * 0.5)], 7, 20); shape(ctx, ell(...T(pol(sh, 30, -p.lean), K.chest * 0.22), 9, 11, 0, 8), { fill: '#e8d9a8', w: 3, seed: 21 }); }
  // ---- jambe avant ----
  if (!K.dress || p.sit || p.kneel || true) {
    hose(ctx, hip, LF.knee, 0.03, K.limb * 1.15, { fill: K.dress ? WHITE : K.bottom, w: 4, seed: 22 }); hose(ctx, LF.knee, LF.foot, 0.03, K.limb * 0.95, { fill: K.dress ? WHITE : K.bottom, w: 4, seed: 23 });
    shape(ctx, ell(LF.foot[0] + 10, LF.foot[1] - 4, 21, 8.5, 0, 10), { fill: INK, w: 3, seed: 24 });
  }
  if (K.dress && !p.sit && !p.kneel) { // la robe recouvre le haut de la jambe avant
    const kn = [LF.knee[0] * 0.5 + LB.knee[0] * 0.5, LF.knee[1] - 4];
    shape(ctx, [T(pol(hip, -K.torso * 0.45, -p.lean), K.waist * 0.5), [kn[0] + 34, kn[1] + 6], [kn[0] - 40, kn[1] + 8], T(pol(hip, -K.torso * 0.45, -p.lean), -K.waist * 0.5)], { fill: K.bottom, w: W, seed: 17 });
  }
  // ---- cou + tête ----
  hose(ctx, sh, neckTop, 0, K.neck * 1.2 + 6, { fill: WHITE, w: 4, seed: 25 });
  drawHead(ctx, kind, K, hc, p);
  // ---- bras avant ----
  hose(ctx, sh, AF.el, 0.04, K.limb * 0.95, { fill: K.top === WHITE ? WHITE : K.top, w: 4, seed: 26 }); hose(ctx, AF.el, AF.hd, 0.04, K.limb * 0.85, { fill: WHITE, w: 4, seed: 27 });
  hand(AF.hd, p.fistF, WHITE, 28);
  ctx.restore();
  return { head: [hc[0], hc[1] - lowY], handF: [AF.hd[0], AF.hd[1] - lowY], handB: [AB.hd[0], AB.hd[1] - lowY], sh: [sh[0], sh[1] - lowY] };
}

function drawHead(ctx, kind, K, c, p) {
  const r = K.headR, a = -p.lean - p.headTilt;
  ctx.save(); ctx.translate(c[0], c[1]); ctx.rotate(a);
  // cheveux derrière (chignon, cheveux longs)
  if (K.hair === 'bun') shape(ctx, ell(-r * 0.75, -r * 0.55, r * 0.42, r * 0.38, 0, 12), { fill: INK, w: 4, seed: 31 });
  if (K.hair === 'long') shape(ctx, [[-r * 0.9, -r * 0.5], [-r * 1.05, r * 0.9], [-r * 0.2, r * 1.05], [r * 0.2, -r * 0.6]], { fill: INK, w: 4, seed: 32 });
  // crâne + profil (front, nez, lèvres, menton)
  const face = [[-r * 0.85, -r * 0.45], [-r * 0.45, -r * 0.98], [r * 0.25, -r * 0.98], [r * 0.78, -r * 0.55], [r * 0.86, -r * 0.18], [r * 1.12, r * 0.08], [r * 0.88, r * 0.22], [r * 0.9, r * 0.42], [r * 0.82, r * 0.55], [r * 0.85, r * 0.68], [r * 0.5, r * 0.98], [-r * 0.1, r * 0.92], [-r * 0.65, r * 0.55], [-r * 0.92, r * 0.05]];
  shape(ctx, face, { fill: WHITE, w: 5, seed: 33 });
  // cheveux
  if (K.hair === 'short' || K.hair === 'kid') shape(ctx, [[-r * 0.92, r * 0.1], [-r * 0.98, -r * 0.5], [-r * 0.5, -r * 1.06], [r * 0.25, -r * 1.06], [r * 0.7, -r * 0.7], [r * 0.45, -r * 0.6], [-r * 0.1, -r * 0.55], [-r * 0.45, -r * 0.2], [-r * 0.6, r * 0.12]], { fill: INK, w: 4, seed: 34 });
  if (K.hair === 'bun' || K.hair === 'long') { shape(ctx, [[-r * 0.95, r * 0.2], [-r * 0.98, -r * 0.55], [-r * 0.45, -r * 1.08], [r * 0.3, -r * 1.06], [r * 0.75, -r * 0.62], [r * 0.2, -r * 0.62], [-r * 0.4, -r * 0.3], [-r * 0.55, r * 0.2]], { fill: INK, w: 4, seed: 35 }); }
  if (K.hair === 'bun') line(ctx, [[-r * 0.85, -r * 0.62], [r * 0.6, -r * 0.88]], 6, 36);
  if (K.hair === 'cap') { shape(ctx, [[-r * 0.95, -r * 0.3], [-r * 0.7, -r * 1.05], [r * 0.4, -r * 1.05], [r * 0.7, -r * 0.45]], { fill: '#3b3a3f', w: 4, seed: 37 }); shape(ctx, [[r * 0.4, -r * 0.5], [r * 1.25, -r * 0.42], [r * 0.7, -r * 0.3]], { fill: INK, w: 3, seed: 38 }); }
  if (K.beard) shape(ctx, [[r * 0.2, r * 0.42], [r * 0.82, r * 0.55], [r * 0.85, r * 0.68], [r * 0.5, r * 0.98], [-r * 0.1, r * 0.92], [-r * 0.35, r * 0.4], [-r * 0.1, r * 0.55]], { fill: '#5a554d', w: 0, seed: 39 });
  // oreille
  shape(ctx, ell(-r * 0.15, r * 0.02, r * 0.16, r * 0.22, 0, 10), { fill: WHITE, w: 3.5, seed: 40 });
  // œil, sourcil, bouche selon l'humeur
  const ex = r * 0.45, ey = -r * 0.15;
  const brows = { neutral: 0, angry: -0.5, sad: 0.45, fear: 0.6, shock: 0.7 };
  const ba = brows[p.mood] ?? 0;
  ctx.strokeStyle = INK; ctx.lineCap = 'round';
  if (p.eyes > 0.15) { ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(ex + p.look * 3, ey, r * 0.07, r * 0.11 * p.eyes, 0, 0, PI * 2); ctx.fill(); if (p.mood === 'shock' || p.mood === 'fear') { ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(ex, ey, r * 0.16, r * 0.19, 0, 0, PI * 2); ctx.stroke(); } }
  else { ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(ex, ey - 2, r * 0.13, 0.3, PI - 0.3); ctx.stroke(); }
  ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(ex - r * 0.2, ey - r * 0.26 + ba * r * 0.12); ctx.lineTo(ex + r * 0.22, ey - r * 0.26 - ba * r * 0.18); ctx.stroke();
  if (p.mood === 'sad' && p.eyes > 0.15 && p.tear) { shape(ctx, ell(ex + r * 0.05, ey + r * 0.35 + p.tear * r * 0.3, r * 0.06, r * 0.1, 0, 8), { fill: WHITE, w: 2.5, seed: 41 }); }
  if (p.mouth > 0.15) shape(ctx, ell(r * 0.68, r * 0.5, r * 0.12, r * 0.06 + p.mouth * r * 0.18, 0, 10), { fill: INK, w: 3, seed: 42 });
  else { ctx.lineWidth = 4; ctx.beginPath(); const sm = p.mood === 'sad' ? 1 : p.mood === 'angry' ? 0.6 : 0; ctx.moveTo(r * 0.5, r * 0.5 + sm * 3); ctx.lineTo(r * 0.82, r * 0.47 - sm * 2); ctx.stroke(); }
  ctx.restore();
}

// ombre portée « chinoise » d'une personne (silhouette pleine, pour les murs)
export function shadowPerson(ctx, kind, P, color = 'rgba(21,19,17,0.85)') {
  ctx.save();
  const c = document.createElement('canvas'); // rendu hors champ puis teinté
  ctx.restore();
  ctx.save(); ctx.globalAlpha = 1; ctx.filter = 'brightness(0)'; ctx.globalCompositeOperation = 'source-over';
  const r = person(ctx, kind, P); ctx.restore(); return r;
}

export const shapeP = shape;
