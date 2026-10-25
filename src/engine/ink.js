// Moteur 2D « encre » (style rubber hose années 30) : trait noir épais sur papier crème.
// Tout est dessiné au Canvas 2D, image par image ; le trait « respire » très légèrement (bruit lisse,
// pas de tremblement saccadé) pour rester fluide. Rendu ~50 ms/image.
export const INK = '#151311';
export const PAPER = '#f3ecdf';
export const WHITE = '#fffdf8';
export const GREY = '#d9d1c2';
export const GREY2 = '#b9b0a0';

// bruit lisse déterministe (somme de sinus), pour faire vivre le trait sans saccade
export const sn = (s, t) => Math.sin(s * 12.9898 + t * 1.7) * 0.5 + Math.sin(s * 78.233 + t * 2.9) * 0.3 + Math.sin(s * 37.719 - t * 4.3) * 0.2;

let BOIL_T = 0, BOIL_A = 0.9;
export const setBoil = (t, a = 0.9) => { BOIL_T = t; BOIL_A = a; };

// points d'une ellipse (rotation en radians)
export function ell(cx, cy, rx, ry, rot = 0, n = 18, a0 = 0, a1 = Math.PI * 2) {
  const pts = [], c = Math.cos(rot), s = Math.sin(rot);
  const closed = Math.abs(a1 - a0 - Math.PI * 2) < 1e-6;
  const m = closed ? n : n + 1;
  for (let i = 0; i < m; i++) { const a = a0 + (a1 - a0) * (i / n); const x = Math.cos(a) * rx, y = Math.sin(a) * ry; pts.push([cx + x * c - y * s, cy + x * s + y * c]); }
  return pts;
}

// courbe lisse (Catmull-Rom -> Bézier) à travers des points ; le trait respire avec le bruit
export function path(ctx, pts, closed = true, seed = 1, boil = 1) {
  const P = pts.map(([x, y], i) => [x + sn(seed + i * 1.37, BOIL_T) * BOIL_A * boil, y + sn(seed + i * 2.11 + 50, BOIL_T) * BOIL_A * boil]);
  const n = P.length; if (n < 2) return;
  ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]);
  const get = (i) => (closed ? P[(i + n) % n] : P[Math.max(0, Math.min(n - 1, i))]);
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    ctx.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
  }
  if (closed) ctx.closePath();
}

// forme encrée : remplissage + contour noir
export function shape(ctx, pts, { fill = WHITE, w = 6, closed = true, seed = 1, stroke = INK, boil = 1 } = {}) {
  path(ctx, pts, closed, seed, boil);
  if (fill && closed) { ctx.fillStyle = fill; ctx.fill(); }
  if (w > 0) { ctx.lineWidth = w; ctx.strokeStyle = stroke; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }
}
export const line = (ctx, pts, w = 5, seed = 3) => shape(ctx, pts, { fill: null, w, closed: false, seed });

// union de formes : contour commun sans traits intérieurs (queue touffue, nuages, corps fondus)
export function union(ctx, shapes, { fill = WHITE, w = 6, seed = 7 } = {}) {
  shapes.forEach((pts, i) => { path(ctx, pts, true, seed + i * 9); ctx.lineWidth = w * 2; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.stroke(); });
  shapes.forEach((pts, i) => { path(ctx, pts, true, seed + i * 9); ctx.fillStyle = fill; ctx.fill(); });
}

// membre « tuyau » rubber hose : courbe a -> b, ventre perpendiculaire (bend), largeur constante
export function hose(ctx, a, b, bend, width, { fill = WHITE, w = 5, seed = 11 } = {}) {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
  const c = [mx - (dy / L) * bend * L, my + (dx / L) * bend * L];
  const draw = () => { const j = sn(seed, BOIL_T) * BOIL_A; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(c[0] + j, c[1] - j, b[0], b[1]); };
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  draw(); ctx.strokeStyle = INK; ctx.lineWidth = width + w * 2; ctx.stroke();
  draw(); ctx.strokeStyle = fill; ctx.lineWidth = width; ctx.stroke();
  return c;
}

// œil « part de tarte » : blanc ovale, pupille noire entaillée, paupière (lid 0..1) inclinée (tilt), sourcil
export function eye(ctx, x, y, rx, ry, { lookX = 0, lookY = 0, lid = 0, lidLow = 0, tilt = 0, pupil = 1, seed = 21, side = 1, skin = WHITE, w = 5 } = {}) {
  const outline = ell(x, y, rx, ry, 0, 16);
  shape(ctx, outline, { fill: WHITE, w, seed });
  // pupille en part de tarte
  ctx.save(); path(ctx, outline, true, seed); ctx.clip();
  const px = x + lookX * rx * 0.45, py = y + lookY * ry * 0.4 + ry * 0.12;
  const prx = rx * 0.5 * pupil, pry = ry * 0.62 * pupil;
  ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(px, py, prx, pry, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = WHITE; ctx.beginPath(); ctx.moveTo(px + prx * 0.15 * side, py - pry * 0.1); ctx.lineTo(px + prx * 0.95 * side, py - pry * 0.75); ctx.lineTo(px + prx * 0.2 * side, py - pry * 1.05); ctx.closePath(); ctx.fill();
  // paupières (couleur de peau) avec bord encré
  const cover = (k, low) => {
    if (k <= 0.01) return;
    const yy = low ? y + ry - k * 2 * ry : y - ry + k * 2 * ry;
    ctx.save(); ctx.translate(x, yy); ctx.rotate((low ? -1 : 1) * tilt * side * 0.5);
    ctx.fillStyle = skin; ctx.fillRect(-rx * 2, low ? 0 : -ry * 3, rx * 4, ry * 3);
    ctx.strokeStyle = INK; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(-rx * 1.5, 0); ctx.lineTo(rx * 1.5, 0); ctx.stroke(); ctx.restore();
  };
  cover(lid, false); cover(lidLow, true);
  ctx.restore();
  shape(ctx, outline, { fill: null, w, seed });
}

// sourcil : trait épais incurvé ; ang > 0 = levé au centre (inquiet), < 0 = froncé en V (méchant)
export function brow(ctx, x, y, len, ang, side = 1, w = 9) {
  const a = -ang * side * 0.6;
  const dx = Math.cos(a) * len / 2, dy = Math.sin(a) * len / 2;
  ctx.lineCap = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = w;
  ctx.beginPath(); ctx.moveTo(x - dx, y - dy); ctx.quadraticCurveTo(x, y - len * 0.18, x + dx, y + dy); ctx.stroke();
}

// main gantée (4 doigts boudinés) ; open 0 = poing, 1 = doigts écartés
export function glove(ctx, x, y, ang, s = 1, open = 0.5, seed = 31) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
  const fingers = [-1.5, -0.5, 0.5, 1.5].map((k) => ell(14 + 10 * open, k * (7 + 5 * open), 10 + 6 * open, 5.5, k * 0.25 * open, 10));
  union(ctx, [ell(0, 0, 15, 14, 0, 14), ...fingers, ell(4, -13, 6, 9, -0.6, 10)], { w: 4, seed });
  ctx.restore();
}

// ---- monde : caméra 2D, papier, grain, vignettage ----
export function createWorld(canvas, width, height) {
  const ctx = canvas.getContext('2d');
  canvas.width = width; canvas.height = height;
  const cam = { x: 0, y: 0, zoom: 1, rot: 0 };
  // grain de papier pré-calculé
  const grain = document.createElement('canvas'); grain.width = 512; grain.height = 512;
  { const g = grain.getContext('2d'), im = g.createImageData(512, 512); let s = 9; for (let i = 0; i < im.data.length; i += 4) { s = (s * 16807) % 2147483647; const v = (s % 1000) / 1000; im.data[i] = im.data[i + 1] = im.data[i + 2] = v > 0.5 ? 255 : 0; im.data[i + 3] = 10; } g.putImageData(im, 0, 0); }
  let T = 0;
  const begin = (t) => {
    T = t; setBoil(t);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = PAPER; ctx.fillRect(0, 0, width, height);
  };
  // place la caméra (x, y = point visé en unités monde, zoom) ; parallax : facteur de profondeur (0 = fixe)
  const view = (parallax = 1) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.translate(width / 2, height / 2); ctx.rotate(cam.rot); ctx.scale(cam.zoom, cam.zoom); ctx.translate(-cam.x * parallax, -cam.y * parallax);
  };
  const finish = () => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = ctx.createPattern(grain, 'repeat'); ctx.fillRect(0, 0, width, height); ctx.globalCompositeOperation = 'source-over';
    const v = ctx.createRadialGradient(width / 2, height / 2, height * 0.45, width / 2, height / 2, height * 0.95);
    v.addColorStop(0, 'rgba(60,45,30,0)'); v.addColorStop(1, 'rgba(60,45,30,0.28)'); ctx.fillStyle = v; ctx.fillRect(0, 0, width, height);
  };
  return { ctx, cam, begin, view, finish, update: () => {}, render: () => {}, width, height, get t() { return T; } };
}
