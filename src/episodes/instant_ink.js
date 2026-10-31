// Les trois VISIONS de « L'INSTANT », dessinées à l'encre (2D) :
//  1. « Partir »        — elle s'en va avec l'enfant ; il reste seul.
//  2. « L'irréparable » — le coup de trop ; gyrophares ; prison.
//  3. « L'héritage »    — l'enfant grandit… et serre le poing à son tour.
import { INK, WHITE, PAPER, GREY, GREY2, ell, shape as shapeSmooth, line, union, path, sn } from '../engine/ink.js';
import { setInkT } from '../characters/inkpeople.js';
const shape = (...a) => shapeP(...a);
import { person, shadowPerson, shapeP } from '../characters/inkpeople.js';
import { range, lerp, ease, clamp } from '../engine/anim.js';

export const VISIONS = [{ t0: 27, t1: 55 }, { t0: 60, t1: 92 }, { t0: 95, t1: 118 }];
const PI = Math.PI;
const fade = (t, a, b, c, d) => clamp(Math.min(range(t, a, b), 1 - range(t, c, d)));
const FLOOR = 880;
const S = 1.55; // échelle des personnages
function who(ctx, x, kind, P, s = S, flip = 1, y = FLOOR) { ctx.save(); ctx.translate(x, y); ctx.scale(s * flip, s); const r = person(ctx, kind, P); ctx.restore(); return { head: [x + r.head[0] * s * flip, y + r.head[1] * s], handF: [x + r.handF[0] * s * flip, y + r.handF[1] * s] }; }

// ---------------- décors ----------------
function room(ctx, { door = 1, doorX = 1480, win = true, winX = 360, light = 0, clock = null, frame = true } = {}) {
  // mur + sol
  ctx.fillStyle = '#efe6d6'; ctx.fillRect(-200, -200, 2400, FLOOR + 200);
  ctx.strokeStyle = 'rgba(21,19,17,0.10)'; ctx.lineWidth = 2; for (let x = -100; x < 2100; x += 46) { ctx.beginPath(); ctx.moveTo(x, -100); ctx.lineTo(x, FLOOR); ctx.stroke(); }
  shape(ctx, [[-200, FLOOR], [2200, FLOOR], [2200, 1300], [-200, 1300]], { fill: '#e2d6c0', w: 6, seed: 2 });
  for (let i = 0; i < 9; i++) line(ctx, [[-200, FLOOR + 28 + i * i * 6], [2200, FLOOR + 28 + i * i * 6]], 2, 3 + i);
  line(ctx, [[-200, FLOOR - 22], [2200, FLOOR - 22]], 3, 4); // plinthe
  if (win) { // fenêtre
    shape(ctx, [[winX, 250], [winX + 300, 250], [winX + 300, 600], [winX, 600]], { fill: light ? '#fbf6ea' : '#5d6270', w: 7, seed: 5 });
    line(ctx, [[winX + 150, 250], [winX + 150, 600]], 5, 6); line(ctx, [[winX, 425], [winX + 300, 425]], 5, 7);
    shape(ctx, [[winX - 24, 600], [winX + 324, 600], [winX + 324, 620], [winX - 24, 620]], { fill: WHITE, w: 5, seed: 8 });
  }
  if (door) { // porte
    shape(ctx, [[doorX, 330], [doorX + 190, 330], [doorX + 190, FLOOR], [doorX, FLOOR]], { fill: door === 2 ? '#fffaf0' : WHITE, w: 7, seed: 9 });
    if (door === 1) { line(ctx, [[doorX + 22, 360], [doorX + 168, 360], [doorX + 168, 600], [doorX + 22, 600], [doorX + 22, 360]], 3, 10); shape(ctx, ell(doorX + 30, 620, 8, 8, 0, 8), { fill: INK, w: 2, seed: 11 }); }
  }
  if (frame) { shape(ctx, [[880, 300], [990, 300], [990, 430], [880, 430]], { fill: WHITE, w: 5, seed: 12 }); line(ctx, [[900, 410], [925, 340], [945, 410]], 3, 13); line(ctx, [[935, 410], [955, 345], [972, 410]], 3, 14); }
  if (clock) drawClock(ctx, 1160, 280, 52, clock);
}
function drawClock(ctx, x, y, r, h) {
  shape(ctx, ell(x, y, r, r, 0, 20), { fill: WHITE, w: 6, seed: 15 });
  for (let i = 0; i < 12; i++) { const a = (i / 12) * PI * 2; line(ctx, [[x + Math.sin(a) * r * 0.78, y - Math.cos(a) * r * 0.78], [x + Math.sin(a) * r * 0.9, y - Math.cos(a) * r * 0.9]], 3, 16 + i); }
  const ha = (h / 12) * PI * 2, ma = (h % 1) * PI * 2;
  ctx.lineCap = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(ha) * r * 0.5, y - Math.cos(ha) * r * 0.5); ctx.stroke();
  ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(ma) * r * 0.75, y - Math.cos(ma) * r * 0.75); ctx.stroke();
}
function table(ctx, x, y, w, seed = 30) {
  shape(ctx, [[x, y], [x + w, y], [x + w, y + 22], [x, y + 22]], { fill: '#c9b79a', w: 6, seed });
  [[x + 20, y + 22], [x + w - 40, y + 22]].forEach(([a, b], i) => shape(ctx, [[a, b], [a + 20, b], [a + 20, FLOOR], [a, FLOOR]], { fill: '#c9b79a', w: 5, seed: seed + 1 + i }));
}
function chair(ctx, x, flip = 1, seed = 40) {
  const s = flip;
  shape(ctx, [[x, 762], [x + 130 * s, 762], [x + 130 * s, 780], [x, 780]], { fill: '#c9b79a', w: 5, seed });
  shape(ctx, [[x + (s > 0 ? -4 : -16), 560], [x + (s > 0 ? 14 : 4), 560], [x + (s > 0 ? 14 : 4), FLOOR], [x + (s > 0 ? -4 : -16), FLOOR]], { fill: '#c9b79a', w: 5, seed: seed + 1 });
  shape(ctx, [[x + 114 * s, 780], [x + 130 * s, 780], [x + 130 * s, FLOOR], [x + 114 * s, FLOOR]], { fill: '#c9b79a', w: 5, seed: seed + 2 });
}
function suitcase(ctx, x, y, seed = 50) {
  shape(ctx, [[x - 50, y - 120], [x + 50, y - 120], [x + 50, y], [x - 50, y]], { fill: GREY2, w: 6, seed });
  line(ctx, [[x - 20, y - 120], [x - 20, y - 150], [x + 20, y - 150], [x + 20, y - 120]], 5, seed + 1);
  shape(ctx, ell(x - 34, y + 4, 8, 8, 0, 8), { fill: INK, w: 2, seed: seed + 2 }); shape(ctx, ell(x + 34, y + 4, 8, 8, 0, 8), { fill: INK, w: 2, seed: seed + 3 });
}
// teinte multiplicative (lumière du jour / nuit / gyrophares)
function tint(ctx, color, a, W = 1920, H = 1080) { if (a <= 0) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = a; ctx.fillStyle = color; ctx.fillRect(0, 0, W, H); ctx.restore(); }
function black(ctx, a) { if (a <= 0) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = a; ctx.fillStyle = INK; ctx.fillRect(0, 0, 1920, 1080); ctx.restore(); }
function rain(ctx, t, x, y, w, h, n = 40) {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.strokeStyle = 'rgba(240,240,250,0.8)'; ctx.lineWidth = 2;
  for (let i = 0; i < n; i++) { const xx = x + ((i * 97.3) % w), yy = y + ((i * 53.1 + t * 900) % (h + 60)) - 30; ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx - 6, yy + 26); ctx.stroke(); }
  ctx.restore();
}
// cadrage : centre (cx, cy), zoom z
function frameView(ink, cx, cy, z = 1) { ink.cam.x = cx; ink.cam.y = cy; ink.cam.zoom = z; ink.cam.rot = 0; ink.view(); }

// ---------------- VISION 1 : PARTIR (27 → 55) ----------------
function vision1(ink, t) {
  const { ctx } = ink; let caption = null;
  if (t < 33.2) { // elle part avec l'enfant et la valise ; la porte se referme
    const z = lerp(1.0, 1.08, range(t, 27, 33.2));
    frameView(ink, 960, 560, z);
    const kd = range(t, 29.3, 29.9), kc = range(t, 32.4, 32.95);
    room(ctx, { door: kd > 0 && kc < 1 ? 2 : 1, light: 1, clock: 7.6 });
    const walk = ease.inOut(range(t, 28.6, 32.3));
    const x = lerp(420, 1560, walk), step = Math.sin(walk * 14);
    const leg = (s) => [step * 0.35 * s, Math.max(0, -step * s) * 0.4];
    ctx.save(); ctx.globalAlpha = 1 - range(walk, 0.86, 1);
    // l'enfant (tenu par la main, regarde en arrière)
    who(ctx, x - 170, 'child', { legF: leg(1), legB: leg(-1), armF: [0.9, 0.1], armB: [-0.2, 0.3], mood: 'sad', headTilt: -0.15, look: -1 }, 1.6);
    // elle, en manteau, la valise à la main
    who(ctx, x, 'woman', { legF: leg(1), legB: leg(-1), armF: [0.05, 0.05], armB: [-0.65, 0.2], mood: 'sad', coat: 1, eyes: 0.7, lean: 0.05 });
    ctx.save(); ctx.translate(x + 10, FLOOR - 2 + Math.abs(step) * 3); ctx.scale(1.4, 1.4); suitcase(ctx, 0, 0, 52); ctx.restore();
    ctx.restore();
    // la porte se referme (battant)
    if (kd > 0) { const open = kc < 1 ? 1 - kc : 0; if (open > 0) shape(ctx, [[1480 + 190, 330], [1480 + 190 + 120 * open, 300], [1480 + 190 + 120 * open, FLOOR + 30], [1480 + 190, FLOOR]], { fill: WHITE, w: 7, seed: 60 }); }
    if (t > 32.95) { const k = Math.exp(-(t - 32.95) * 12) * 6; ink.cam.x += k; }
  } else if (t < 38.2) { // seul à table ; le temps passe (horloge folle, vaisselle qui s'empile)
    frameView(ink, 960, 540, 1);
    const k = range(t, 33.2, 38.2), hours = 7.6 + k * 60;
    room(ctx, { door: 1, light: 1, clock: hours, frame: false });
    table(ctx, 700, 640, 560);
    const plates = Math.floor(k * 9);
    for (let i = 0; i < plates; i++) shape(ctx, ell(1080 + (i % 3) * 8, 632 - i * 9, 70, 9, 0, 14), { fill: WHITE, w: 4, seed: 70 + i });
    for (let i = 0; i < Math.floor(k * 5); i++) shape(ctx, [[860 + i * 40, 638], [876 + i * 40, 638], [878 + i * 40, 580], [858 + i * 40, 580]], { fill: '#d9e4e8', w: 4, seed: 80 + i });
    chair(ctx, 560, 1, 90); chair(ctx, 1400, -1, 93); // la chaise vide en face
    who(ctx, 600, 'man', { sit: 1, lean: 0.25, armF: [1.45, 0.4], armB: [1.3, 0.6], mood: 'sad', eyes: 0.5, headTilt: 0.25 });
    // jour / nuit qui alternent
    const day = 0.5 + 0.5 * Math.sin(k * PI * 2 * 4.5);
    tint(ctx, '#5a6488', (1 - day) * 0.55);
  } else if (t < 44.0) { // le téléphone : il appelle, personne ne répond
    frameView(ink, 960, 540, 1);
    ctx.fillStyle = '#e8dfcf'; ctx.fillRect(-100, -100, 2200, 1400);
    const kz = ease.out(range(t, 38.2, 39.2));
    ctx.save(); ctx.translate(960, 600 + (1 - kz) * 200); ctx.rotate(-0.08);
    // main + téléphone
    shape(ctx, [[-170, 260], [-120, 40], [120, 40], [190, 260]], { fill: WHITE, w: 7, seed: 100 });
    shape(ctx, [[-135, -380], [135, -380], [135, 280], [-135, 280]], { fill: INK, w: 7, seed: 101 });
    shape(ctx, [[-115, -350], [115, -350], [115, 250], [-115, 250]], { fill: '#f6f0e4', w: 3, seed: 102 });
    [[-150, 40], [-160, 110], [-150, 180]].forEach(([x, y], i) => shape(ctx, ell(x, y, 34, 26, 0.2, 10), { fill: WHITE, w: 6, seed: 103 + i }));
    shape(ctx, ell(150, 100, 30, 70, -0.2, 12), { fill: WHITE, w: 6, seed: 106 });
    // écran
    shape(ctx, ell(0, -220, 52, 52, 0, 16), { fill: GREY, w: 4, seed: 107 });
    ctx.fillStyle = INK; ctx.font = "600 44px 'Cormorant', Georgia, serif"; ctx.textAlign = 'center';
    ctx.font = "56px 'Cormorant', Georgia, serif"; ctx.fillText('♥', 0, -202);
    ctx.font = "600 40px 'Cormorant', Georgia, serif"; ctx.fillText('Mon cœur', 0, -120);
    const ring = t < 43.6;
    ctx.font = "italic 500 32px 'Cormorant', Georgia, serif"; ctx.fillText(ring ? 'Appel en cours' + '.'.repeat(1 + Math.floor((t * 2) % 3)) : 'Pas de réponse', 0, -70);
    if (t > 42.6) { ctx.font = "500 30px 'Cormorant', Georgia, serif"; const n = Math.min(14, 9 + Math.floor((t - 42.6) * 4)); ctx.fillText(`${n} appels manqués`, 0, 10); }
    shape(ctx, ell(0, 170, 40, 40, 0, 14), { fill: ring ? '#b8463a' : GREY2, w: 4, seed: 108 });
    if (ring) for (let i = 0; i < 3; i++) { const k = ((t * 1.3 + i / 3) % 1); ctx.strokeStyle = `rgba(21,19,17,${1 - k})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, -220, 60 + k * 120, -0.8, 0.8); ctx.stroke(); ctx.beginPath(); ctx.arc(0, -220, 60 + k * 120, PI - 0.8, PI + 0.8); ctx.stroke(); }
    ctx.restore();
  } else if (t < 49.5) { // le dessin d'enfant sur le frigo : le papa s'efface
    frameView(ink, 960, 540, lerp(1, 1.12, range(t, 44, 49.5)));
    ctx.fillStyle = '#f1ece2'; ctx.fillRect(-200, -200, 2400, 1500);
    line(ctx, [[300, -200], [300, 1300]], 5, 110); line(ctx, [[1620, -200], [1620, 1300]], 5, 111);
    shape(ctx, [[560, 180], [1360, 160], [1380, 820], [580, 840]], { fill: '#fffdf6', w: 5, seed: 112 });
    shape(ctx, ell(970, 190, 22, 22, 0, 10), { fill: '#b8463a', w: 4, seed: 113 }); // aimant
    // dessin au crayon : soleil, maison, trois personnages qui se tiennent la main
    const crayon = (pts, c, w = 6, seed = 1) => { ctx.save(); ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; path(ctx, pts, false, seed, 1.6); ctx.stroke(); ctx.restore(); };
    ctx.save(); ctx.strokeStyle = '#d9a531'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(1210, 300, 48, 0, 7); ctx.stroke(); for (let i = 0; i < 10; i++) { const a = i / 10 * PI * 2; ctx.beginPath(); ctx.moveTo(1210 + Math.cos(a) * 64, 300 + Math.sin(a) * 64); ctx.lineTo(1210 + Math.cos(a) * 90, 300 + Math.sin(a) * 90); ctx.stroke(); } ctx.restore();
    crayon([[640, 520], [640, 380], [740, 300], [840, 380], [840, 520], [640, 520]], '#b8463a', 6, 114);
    crayon([[600, 760], [1320, 760]], '#5f8a4a', 8, 115);
    const stick = (x, h, c, a = 1, seed = 120) => { ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = c; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(x, 760 - h, h * 0.18, 0, 7); ctx.stroke(); crayon([[x, 760 - h * 0.82], [x, 760 - h * 0.35]], c, 6, seed); crayon([[x - h * 0.2, 760], [x, 760 - h * 0.35], [x + h * 0.2, 760]], c, 6, seed + 1); crayon([[x - h * 0.3, 760 - h * 0.62], [x + h * 0.3, 760 - h * 0.62]], c, 6, seed + 2); ctx.restore(); };
    const kErase = ease.inOut(range(t, 46.0, 49.0));
    stick(940, 300, '#2f4f7a', 1 - kErase, 121); stick(1080, 190, '#d9733a', 1, 125); stick(1200, 280, '#8a3a6a', 1, 129);
    ctx.save(); ctx.fillStyle = '#2f4f7a'; ctx.globalAlpha = 1 - kErase; ctx.font = "italic 600 44px 'Cormorant', Georgia, serif"; ctx.fillText('PAPA', 890, 820); ctx.restore();
    ctx.fillStyle = '#d9733a'; ctx.font = "italic 600 44px 'Cormorant', Georgia, serif"; ctx.fillText('MOI', 1045, 820); ctx.fillStyle = '#8a3a6a'; ctx.fillText('MAMAN', 1125, 820);
    // sa main qui touche le dessin
    const kh = ease.out(range(t, 44.5, 45.8));
    ctx.save(); ctx.translate(lerp(1500, 1010, kh), lerp(1150, 640, kh)); ctx.rotate(-0.6);
    shape(ctx, [[-40, 0], [40, 0], [60, 600], [-60, 600]], { fill: GREY2, w: 6, seed: 130 });
    shape(ctx, ell(0, -20, 46, 60, 0, 14), { fill: WHITE, w: 6, seed: 131 });
    [[-30, -70], [-10, -88], [12, -86], [32, -72]].forEach(([x, y], i) => shape(ctx, ell(x, y, 11, 30, 0, 10), { fill: WHITE, w: 5, seed: 132 + i }));
    ctx.restore();
  } else { // plan large : il est seul à la fenêtre, la pluie
    const z = lerp(1.15, 1.0, ease.out(range(t, 49.5, 55)));
    frameView(ink, 960, 560, z);
    room(ctx, { door: 1, light: 0, winX: 820, frame: false });
    rain(ctx, t, 820, 250, 300, 350, 46);
    who(ctx, 900, 'man', { lean: 0.06, armF: [0.15, 0.2], armB: [-0.1, 0.2], mood: 'sad', eyes: 0.6, headTilt: 0.2 });
    // chambre d'enfant vide : le jouet au sol
    shape(ctx, [[1600, FLOOR - 30], [1660, FLOOR - 30], [1660, FLOOR - 4], [1600, FLOOR - 4]], { fill: '#b8463a', w: 4, seed: 140 });
    tint(ctx, '#56607e', 0.45);
    caption = [['Elle est vivante.', 80, fade(t, 50.4, 51.4, 54.2, 54.9), { dark: 1, dy: 330 }], ['Mais tu l’as perdue.', 80, fade(t, 51.8, 52.8, 54.2, 54.9), { italic: true, dark: 1, dy: 330 }]];
  }
  return caption;
}

// ---------------- VISION 2 : L'IRRÉPARABLE (60 → 92) ----------------
function vision2(ink, t) {
  const { ctx } = ink; let caption = null;
  if (t < 61.35) { // ombres chinoises sur le mur : le bras s'abat… noir
    frameView(ink, 960, 540, lerp(1, 1.15, range(t, 60, 61.3)));
    ctx.fillStyle = '#e9dcc2'; ctx.fillRect(-200, -200, 2400, 1500);
    const g = ctx.createRadialGradient(960, 420, 50, 960, 420, 900); g.addColorStop(0, 'rgba(255,240,200,0.6)'); g.addColorStop(1, 'rgba(60,40,20,0.5)'); ctx.fillStyle = g; ctx.fillRect(-200, -200, 2400, 1500);
    const k = ease.in(range(t, 60.5, 61.25));
    ctx.save(); ctx.filter = 'brightness(0)'; ctx.globalAlpha = 0.88;
    ctx.save(); ctx.translate(820, 980); ctx.scale(1.6, 1.6); person(ctx, 'man', { lean: 0.25 + k * 0.1, armF: [lerp(PI * 0.95, 1.2, k), lerp(-1.4, -0.1, k)], fistF: 1, armB: [0.8, 0.4], legF: [0.4, 0.3], legB: [-0.3, 0.1] }); ctx.restore();
    ctx.save(); ctx.translate(1240, 980); ctx.scale(-1.6, 1.6); person(ctx, 'woman', { lean: -0.3, armF: [2.4, 1.8], armB: [2.0, 2.0], legF: [0.2, 0.2], legB: [-0.3, 0.3] }); ctx.restore();
    ctx.restore();
    black(ctx, range(t, 61.2, 61.3));
  } else if (t < 64.2) { // silence. Le verre roule au sol… jusqu'à une main immobile
    frameView(ink, 960, 540, 1);
    ctx.fillStyle = '#e2d6c0'; ctx.fillRect(-200, -200, 2400, 1500);
    for (let i = 0; i < 6; i++) line(ctx, [[-200, 200 + i * 170], [2200, 230 + i * 170]], 3, 150 + i);
    shape(ctx, [[260, -200], [330, -200], [330, 700], [260, 700]], { fill: '#c9b79a', w: 6, seed: 156 }); // pied de table
    // la main (paume ouverte, immobile)
    ctx.save(); ctx.translate(1380, 620); ctx.rotate(0.3);
    shape(ctx, [[120, -60], [700, -110], [720, 90], [120, 70]], { fill: WHITE, w: 6, seed: 157 });
    shape(ctx, ell(40, 0, 90, 75, 0, 16), { fill: WHITE, w: 6, seed: 158 });
    [[-50, -70, -0.5], [-75, -20, -0.15], [-75, 30, 0.1], [-55, 75, 0.4], [10, -90, -1.1]].forEach(([x, y, a], i) => shape(ctx, ell(x, y, 50, 16, a, 12), { fill: WHITE, w: 5, seed: 159 + i }));
    ctx.restore();
    const kr = ease.out(range(t, 62.2, 63.8));
    const gx = lerp(300, 1180, kr);
    ctx.save(); ctx.translate(gx, 560); ctx.rotate(kr * 9);
    shape(ctx, [[-60, -40], [60, -48], [60, 48], [-60, 40]], { fill: '#e5eef0', w: 5, seed: 165 }); shape(ctx, ell(60, 0, 12, 48, 0, 12), { fill: '#f4f8f8', w: 4, seed: 166 });
    ctx.restore();
    black(ctx, 1 - range(t, 61.6, 62.4));
  } else if (t < 67.5) { // il est à genoux ; l'enfant, dans l'ombre de la porte, a tout vu
    frameView(ink, 960, 560, lerp(1.0, 1.1, range(t, 64.2, 67.5)));
    room(ctx, { door: 2, doorX: 1500, light: 0, win: false, frame: false });
    who(ctx, 1600, 'child', { mood: 'shock', armF: [1.2, 1.6], armB: [0.1, 0.2] }, 1.6, -1);
    who(ctx, 700, 'man', { kneel: 1, lean: 0.5, armF: [2.2, 1.9], armB: [2.1, 2.0], mood: 'shock', headTilt: 0.35 });
    // les pieds d'elle au premier plan (immobiles)
    shape(ctx, ell(1040, 930, 34, 14, 0.1, 10), { fill: INK, w: 3, seed: 170 }); shape(ctx, ell(1110, 942, 34, 14, -0.1, 10), { fill: INK, w: 3, seed: 171 });
    shape(ctx, [[930, 900], [1000, 890], [1010, 950], [920, 960]], { fill: WHITE, w: 5, seed: 172 });
    tint(ctx, '#4a5068', 0.5);
  } else if (t < 75.0) { // façade la nuit : ambulance et police, gyrophares
    frameView(ink, 960, 540, 1);
    ctx.fillStyle = '#3a3f52'; ctx.fillRect(-200, -200, 2400, 1500);
    shape(ctx, [[300, -100], [1620, -100], [1620, 860], [300, 860]], { fill: '#d8ccb4', w: 7, seed: 180 });
    for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) { const x = 380 + c * 205, y = 20 + r * 200, lit = (r * 7 + c * 3) % 5 === 0 || (r === 2 && c === 2); shape(ctx, [[x, y], [x + 120, y], [x + 120, y + 130], [x, y + 130]], { fill: lit ? '#f6e2a8' : '#5d6270', w: 5, seed: 181 + r * 6 + c }); }
    shape(ctx, [[-200, 860], [2200, 860], [2200, 1300], [-200, 1300]], { fill: '#55596a', w: 6, seed: 210 });
    // véhicules
    const van = (x, label, seed) => { shape(ctx, [[x, 700], [x + 420, 700], [x + 470, 780], [x + 470, 900], [x, 900]], { fill: WHITE, w: 7, seed }); shape(ctx, [[x + 330, 715], [x + 410, 715], [x + 450, 780], [x + 330, 780]], { fill: '#5d6270', w: 5, seed: seed + 1 }); shape(ctx, ell(x + 100, 905, 42, 42, 0, 14), { fill: INK, w: 4, seed: seed + 2 }); shape(ctx, ell(x + 370, 905, 42, 42, 0, 14), { fill: INK, w: 4, seed: seed + 3 }); ctx.fillStyle = INK; ctx.font = "600 52px 'Cormorant', Georgia, serif"; ctx.textAlign = 'center'; ctx.fillText(label, x + 170, 830); shape(ctx, [[x + 150, 670], [x + 210, 670], [x + 210, 700], [x + 150, 700]], { fill: '#8aa6d6', w: 4, seed: seed + 4 }); };
    van(250, 'SAMU', 220); van(1180, 'POLICE', 230);
    // brancard recouvert d'un drap (rien de montré)
    const ks = ease.inOut(range(t, 70.5, 74.5));
    if (ks > 0) { const x = lerp(820, 640, ks); shape(ctx, [[x, 760], [x + 300, 760], [x + 300, 790], [x, 790]], { fill: WHITE, w: 5, seed: 240 }); shape(ctx, [[x + 10, 760], [x + 60, 728], [x + 250, 724], [x + 295, 760]], { fill: '#fbf8f0', w: 5, seed: 241 }); line(ctx, [[x + 40, 790], [x + 40, 850]], 4, 242); line(ctx, [[x + 260, 790], [x + 260, 850]], 4, 243); }
    // gyrophares : bleu / rouge alternés
    const ph = Math.floor(t * 5) % 2;
    tint(ctx, ph ? '#3a5ad6' : '#c43a3a', 0.35);
    const g = ctx.createRadialGradient(ph ? 1360 : 430, 680, 10, ph ? 1360 : 430, 680, 700); g.addColorStop(0, ph ? 'rgba(90,130,255,0.45)' : 'rgba(255,80,80,0.45)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.fillRect(0, 0, 1920, 1080); ctx.restore();
  } else if (t < 80.4) { // les menottes ; il est emmené dans un couloir
    if (t < 77.0) {
      frameView(ink, 960, 540, lerp(1.05, 1.15, range(t, 75, 77)));
      ctx.fillStyle = '#d9cdb6'; ctx.fillRect(-200, -200, 2400, 1500);
      const kc = ease.out(range(t, 75.0, 75.25));
      // deux poignets croisés, menottes qui se ferment
      [[-1, -0.25], [1, 0.25]].forEach(([s, a], i) => { ctx.save(); ctx.translate(960 + s * 90, 560); ctx.rotate(a + PI); shape(ctx, [[-60, -400], [60, -400], [56, 40], [-56, 40]], { fill: GREY2, w: 7, seed: 250 + i }); shape(ctx, [[-52, 40], [52, 40], [48, 160], [-48, 160]], { fill: WHITE, w: 7, seed: 252 + i }); shape(ctx, ell(0, 210, 62, 66, 0, 16), { fill: WHITE, w: 7, seed: 254 + i }); ctx.restore(); });
      ctx.save(); ctx.lineWidth = 16; ctx.strokeStyle = '#2a2a2e'; [-1, 1].forEach((s) => { ctx.save(); ctx.translate(960 + s * 98, 455); ctx.scale(1, 0.45); ctx.beginPath(); ctx.arc(0, 0, 70, PI * (1 - kc * 0.98), PI * 2 + 0.01); ctx.stroke(); ctx.restore(); }); ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(930, 455); ctx.lineTo(990, 455); ctx.stroke(); ctx.restore();
    } else {
      frameView(ink, 960, 540, 1);
      ctx.fillStyle = '#d0c7b6'; ctx.fillRect(-200, -200, 2400, 1500);
      for (let i = 0; i < 8; i++) { const x = ((i * 300 - (t - 77) * 260) % 2400 + 2400) % 2400 - 200; shape(ctx, [[x, 200], [x + 160, 200], [x + 160, FLOOR], [x, FLOOR]], { fill: '#ece5d8', w: 5, seed: 260 + i }); }
      shape(ctx, [[-200, FLOOR], [2200, FLOOR], [2200, 1300], [-200, 1300]], { fill: '#b9b1a2', w: 6, seed: 270 });
      const step = Math.sin((t - 77) * 7), leg = (s) => [step * 0.3 * s, Math.max(0, -step * s) * 0.4];
      who(ctx, 560, 'cop', { legF: leg(1), legB: leg(-1), armF: [0.6, 0.6], armB: [-0.2, 0.2] });
      who(ctx, 900, 'man', { legF: leg(-1), legB: leg(1), armF: [-0.15, 0.6], armB: [-0.2, 0.5], mood: 'sad', eyes: 0.4, headTilt: 0.45, lean: 0.12 });
      who(ctx, 1240, 'cop', { legF: leg(1), legB: leg(-1), armF: [0.1, 0.2], armB: [-0.2, 0.2] });
    }
  } else { // la cellule : il tient la photo de mariage. Le temps passe (la lumière tourne)
    const z = lerp(1.0, 1.12, range(t, 80.4, 92));
    frameView(ink, 960, 560, z);
    ctx.fillStyle = '#cfc6b4'; ctx.fillRect(-200, -200, 2400, 1500);
    for (let y = -100; y < FLOOR; y += 70) for (let x = -200 + ((y / 70) % 2) * 70; x < 2200; x += 140) shape(ctx, [[x, y], [x + 136, y], [x + 136, y + 66], [x, y + 66]], { fill: '#d8d0bf', w: 2.5, seed: (x * 3 + y) % 97 });
    shape(ctx, [[-200, FLOOR], [2200, FLOOR], [2200, 1300], [-200, 1300]], { fill: '#a9a294', w: 6, seed: 300 });
    // petite fenêtre haute à barreaux et son rayon de lumière qui glisse
    shape(ctx, [[1180, 130], [1360, 130], [1360, 260], [1180, 260]], { fill: '#f8f2e2', w: 6, seed: 301 });
    for (let i = 1; i < 4; i++) line(ctx, [[1180 + i * 45, 130], [1180 + i * 45, 260]], 6, 302 + i);
    const sweep = lerp(-120, 220, range(t, 80.4, 92));
    ctx.save(); ctx.globalAlpha = 0.22; ctx.fillStyle = '#fff6d8'; ctx.beginPath(); ctx.moveTo(1180, 260); ctx.lineTo(1360, 260); ctx.lineTo(1000 + sweep + 320, FLOOR + 80); ctx.lineTo(800 + sweep, FLOOR + 80); ctx.closePath(); ctx.fill(); ctx.restore();
    // couchette
    shape(ctx, [[340, 762], [1060, 762], [1060, 800], [340, 800]], { fill: '#8a8478', w: 6, seed: 310 });
    shape(ctx, [[360, 800], [390, 800], [390, FLOOR], [360, FLOOR]], { fill: '#8a8478', w: 5, seed: 311 }); shape(ctx, [[1010, 800], [1040, 800], [1040, FLOOR], [1010, FLOOR]], { fill: '#8a8478', w: 5, seed: 312 });
    const r = who(ctx, 560, 'man', { sit: 1, lean: 0.38, armF: [1.0, 1.2], armB: [0.9, 1.3], mood: 'sad', eyes: 0.5, headTilt: 0.45, tear: range(t, 84, 86) });
    // la photo entre ses mains
    ctx.save(); ctx.translate(r.handF[0] + 18, r.handF[1] - 40); ctx.rotate(-0.15); ctx.scale(1.4, 1.4);
    shape(ctx, [[-42, -56], [42, -56], [42, 56], [-42, 56]], { fill: WHITE, w: 5, seed: 320 }); shape(ctx, ell(-12, -16, 10, 11, 0, 8), { fill: INK, w: 2, seed: 321 }); shape(ctx, ell(14, -12, 9, 10, 0, 8), { fill: GREY2, w: 2, seed: 322 }); line(ctx, [[-22, 40], [-12, 0], [-2, 40]], 3, 323); line(ctx, [[6, 40], [14, 4], [26, 40]], 3, 324);
    ctx.restore();
    // barreaux au premier plan
    for (let i = 0; i < 9; i++) { const x = 140 + i * 210; shape(ctx, [[x, -200], [x + 26, -200], [x + 26, 1300], [x, 1300]], { fill: '#3b3a3f', w: 5, seed: 330 + i }); }
    shape(ctx, [[-200, 160], [2200, 160], [2200, 188], [-200, 188]], { fill: '#3b3a3f', w: 5, seed: 340 });
    tint(ctx, '#6a6a7a', 0.35);
    black(ctx, 1 - range(t, 80.4, 80.9));
    caption = [['Une seconde de colère.', 80, fade(t, 85.6, 86.6, 90.8, 91.6)], ['Une vie entière de regrets.', 80, fade(t, 87.2, 88.2, 90.8, 91.6), { italic: true }]];
  }
  return caption;
}

// ---------------- VISION 3 : L'HÉRITAGE (95 → 118) ----------------
function vision3(ink, t) {
  const { ctx } = ink; let caption = null;
  if (t < 99.5) { // l'enfant dans son lit ; à travers la porte, les ombres des parents qui crient
    frameView(ink, 960, 560, lerp(1.0, 1.12, range(t, 95, 99.5)));
    ctx.fillStyle = '#4a4e62'; ctx.fillRect(-200, -200, 2400, 1500);
    shape(ctx, [[1220, 300], [1560, 300], [1560, FLOOR], [1220, FLOOR]], { fill: '#f3dfae', w: 7, seed: 400 }); // porte entrouverte, lumière du couloir
    ctx.save(); ctx.beginPath(); ctx.rect(1220, 300, 340, FLOOR - 300); ctx.clip();
    const sh = Math.sin(t * 3) * 10;
    ctx.save(); ctx.filter = 'brightness(0)'; ctx.globalAlpha = 0.75; ctx.translate(1290 + sh, FLOOR + 60); ctx.scale(1.4, 1.4); person(ctx, 'man', { lean: 0.2, armF: [2.3, -0.8], fistF: 1, armB: [0.6, 0.6] }); ctx.restore();
    ctx.save(); ctx.filter = 'brightness(0)'; ctx.globalAlpha = 0.75; ctx.translate(1560, FLOOR + 60); ctx.scale(-1.4, 1.4); person(ctx, 'woman', { lean: -0.25, armF: [2.0, 1.8], armB: [1.8, 1.9] }); ctx.restore();
    ctx.restore();
    shape(ctx, [[-200, FLOOR], [2200, FLOOR], [2200, 1300], [-200, 1300]], { fill: '#5e5f6a', w: 6, seed: 401 });
    // lit + couverture ; l'enfant serre son doudou, les yeux grands ouverts
    shape(ctx, [[200, 700], [1060, 700], [1060, 800], [200, 800]], { fill: '#9a8e7a', w: 6, seed: 402 });
    shape(ctx, [[190, 520], [236, 520], [236, FLOOR], [190, FLOOR]], { fill: '#9a8e7a', w: 5, seed: 403 });
    shape(ctx, ell(330, 640, 100, 44, 0, 16), { fill: WHITE, w: 5, seed: 404 });
    const c = who(ctx, 380, 'child', { sit: 1, lean: -0.05, armF: [1.6, 1.0], armB: [1.4, 1.1], mood: 'fear', look: 1 }, 1.7, 1, 700 + 40 * 1.7);
    shape(ctx, [[300, 690], [1050, 680], [1060, 760], [290, 770]], { fill: '#d8cdbb', w: 6, seed: 405 }); // couverture
    shape(ctx, ell(c.handF[0] + 10, c.handF[1] + 10, 34, 40, 0.3, 12), { fill: '#e8dcc6', w: 4, seed: 406 }); shape(ctx, ell(c.handF[0] - 6, c.handF[1] - 44, 11, 34, -0.4, 10), { fill: '#e8dcc6', w: 4, seed: 407 }); // doudou
    tint(ctx, '#3a3f60', 0.25);
  } else if (t < 104.5) { // il grandit : enfant → ado → adulte (fondus)
    frameView(ink, 960, 560, 1);
    ctx.fillStyle = '#e6dccb'; ctx.fillRect(-200, -200, 2400, 1500);
    shape(ctx, [[-200, FLOOR], [2200, FLOOR], [2200, 1300], [-200, 1300]], { fill: '#d4c7b0', w: 6, seed: 410 });
    const k = range(t, 99.5, 104.2);
    const stage = (a, kind, sc, P) => { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.translate(960, FLOOR); ctx.scale(sc, sc); person(ctx, kind, P); ctx.restore(); };
    stage(1 - range(k, 0.2, 0.4), 'child', 1.9, { mood: 'sad', armF: [0.1, 0.2] });
    stage(fade(k, 0.25, 0.45, 0.6, 0.8), 'son', 1.3, { mood: 'sad', armF: [0.1, 0.2], look2: { beard: false } });
    stage(range(k, 0.65, 0.85), 'son', 1.6, { mood: 'neutral', armF: [0.1, 0.2] });
    ctx.fillStyle = INK; ctx.font = "italic 500 56px 'Cormorant', Georgia, serif"; ctx.textAlign = 'center';
    const years = Math.round(lerp(6, 32, ease.inOut(k)));
    ctx.globalAlpha = fade(t, 99.8, 100.4, 103.8, 104.4); ctx.fillText(`${years} ans`, 960, 200); ctx.globalAlpha = 1;
  } else if (t < 110.0) { // sa cuisine à lui : la même dispute, le même geste
    const z = lerp(1.0, 1.1, range(t, 104.5, 110));
    frameView(ink, 960, 560, z);
    room(ctx, { door: 1, doorX: 1560, light: 0, winX: 220, frame: false });
    table(ctx, 260, 700, 420, 420);
    const kr = ease.inOut(range(t, 106.6, 109.5));
    const sh = Math.sin(t * 22) * 3 * range(t, 105, 106.5);
    who(ctx, 760 + sh, 'son', { lean: lerp(0.08, 0.25, kr), armF: [lerp(0.6, PI * 0.92, kr), lerp(0.9, -1.3, kr)], fistF: kr > 0.3 ? 1 : 0, armB: [0.4, 0.5], mood: 'angry', mouth: 0.7 * (1 - kr * 0.4) + Math.abs(Math.sin(t * 9)) * 0.2, legF: [0.3, 0.2], legB: [-0.2, 0.1] });
    who(ctx, 1230, 'partner', { lean: lerp(0, -0.25, kr), armF: [lerp(0.5, 2.3, kr), lerp(0.4, 1.8, kr)], armB: [lerp(0.2, 2.0, kr), lerp(0.3, 1.9, kr)], mood: 'fear', eyes: lerp(1, 0.1, kr), legF: [0.1, 0.1], legB: [-0.3, 0.3] }, S, -1);
    tint(ctx, '#5a5a78', 0.35);
  } else { // son poing qui se serre (même cadrage que celui du père)
    frameView(ink, 960, 540, lerp(1.0, 1.08, range(t, 110, 118)));
    ctx.fillStyle = '#d8ccb6'; ctx.fillRect(-200, -200, 2400, 1500);
    const kf = ease.inOut(range(t, 110.4, 112.2));
    ctx.save(); ctx.translate(960, 560); ctx.rotate(0.12);
    shape(ctx, [[-120, 160], [120, 160], [150, 900], [-150, 900]], { fill: '#8b8378', w: 8, seed: 450 }); // manche
    shape(ctx, [[-110, 40], [110, 40], [124, 200], [-124, 200]], { fill: WHITE, w: 8, seed: 449 }); // poignet
    shape(ctx, [[-118, 70], [118, 70], [118, 150], [-118, 150]], { fill: '#3a3530', w: 6, seed: 467 }); shape(ctx, ell(0, 110, 52, 50, 0, 18), { fill: '#2a2a2e', w: 6, seed: 468 }); line(ctx, [[0, 110], [10, 72]], 4, 469); // la montre du père
    shape(ctx, [[-140, -170], [140, -170], [130, 60], [-130, 60]], { fill: WHITE, w: 8, seed: 451 }); // dos de la main
    for (let i = 0; i < 4; i++) { // doigts : tendus vers le haut, puis repliés (phalanges)
      const x = -105 + i * 70, top = lerp(-420 + Math.abs(i - 1.5) * 40, -205, kf);
      shape(ctx, [[x - 33, -150], [x + 33, -150], [x + 31, top], [x - 31, top]], { fill: WHITE, w: 7, seed: 452 + i });
      shape(ctx, ell(x, top, 32, lerp(30, 36, kf), 0, 12), { fill: WHITE, w: 7, seed: 456 + i });
      if (kf > 0.55) { shape(ctx, [[x - 30, -150], [x + 30, -150], [x + 28, -60], [x - 28, -60]], { fill: WHITE, w: 6, seed: 470 + i }); line(ctx, [[x - 18, -110], [x + 18, -108]], 3, 474 + i); }
    }
    ctx.save(); ctx.translate(-150, -40); ctx.rotate(lerp(-0.7, 1.25, kf)); shape(ctx, [[-32, 0], [32, 0], [28, -170], [-28, -170]], { fill: WHITE, w: 7, seed: 465 }); shape(ctx, ell(0, -170, 30, 30, 0, 10), { fill: WHITE, w: 7, seed: 466 }); ctx.restore();
    ctx.restore();
    if (kf > 0.5) { line(ctx, [[880, 790], [905, 900], [890, 1000]], 3, 478); line(ctx, [[1040, 780], [1030, 940]], 3, 479); }
    caption = [['Ton fils apprend de toi.', 88, fade(t, 112.6, 113.6, 116.6, 117.3), { italic: true, dark: 1, dy: 380 }]];
    // l'encre pâlit vers le gris avant le raccord
    tint(ctx, '#7a6a5a', range(t, 116.5, 118) * 0.4);
  }
  return caption;
}

export function drawVision(ink, vi, t) {
  ink.begin(t); setInkT(t);
  const caption = [vision1, vision2, vision3][vi](ink, t);
  ink.finish();
  return { caption };
}
