// FOI DE MÈRE — essai d'animation fluide (9:16) : Maman dans le salon de l'appartement de Bouaké, 2001.
import { blob, stroke, ell, tone, LINE } from '../engine/flat.js';
import { drawCharacter, blinkAt, mouthAt, parleFin, FABRIC } from '../characters/rig2d.js';
export const world = 'flat', fps = 24, duration = 10, width = 1080, height = 1920;

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), range = (t, a, b) => clamp((t - a) / (b - a));
const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2), lerp = (a, b, k) => a + (b - a) * k;
const spring = (t, t0, amp = 1, f = 3, d = 4) => (t < t0 ? 0 : amp * Math.exp(-(t - t0) * d) * Math.sin((t - t0) * f * Math.PI * 2));

export const MAMAN = { body: 'woman', skin: '#8d5a38', hair: 'braids', hairC: '#1a1210', earrings: '#f2c14e', lashes: true, dress: true, dressLen: 0.95,
  top: '#e0682f', topPattern: FABRIC.pagne('#e0682f', '#f2c14e', '#2c6e63'), belt: '#2c6e63', shoes: '#5a2b1d', sleeve: 'court', jaw: 0.6 };
const TWIN = (bag) => ({ body: 'child', skin: '#8d5a38', hair: 'short', hairC: '#15100d', top: '#c8ae74', pants: '#b49a64', shorts: true, collar: true, buttons: true, pockets: true, shoes: '#2a2420', bag, sleeve: 'court', jaw: 0.3, eyeR: 0.34 });
const J1 = TWIN('#c0392b'), J2 = TWIN('#2e6fb5');

function salon(ctx, W, H, t) {
  const floorY = 1500;
  // mur
  ctx.fillStyle = '#e9c98f'; ctx.fillRect(0, 0, W, floorY);
  ctx.fillStyle = 'rgba(160,110,60,0.10)'; for (let x = 0; x < W; x += 60) ctx.fillRect(x, 0, 28, floorY);
  // fenêtre sur Bouaké
  const wx = 560, wy = 260, ww = 420, wh = 520;
  const g = ctx.createLinearGradient(0, wy, 0, wy + wh); g.addColorStop(0, '#5aa0e0'); g.addColorStop(1, '#f5cf96'); ctx.fillStyle = g; ctx.fillRect(wx, wy, ww, wh);
  [[wx + 20, 120, 150], [wx + 160, 90, 190], [wx + 270, 130, 140]].forEach(([x, w, h], i) => blob(ctx, [[x, wy + wh], [x, wy + wh - h], [x + w, wy + wh - h], [x + w, wy + wh]], { fill: ['#d9a98a', '#c99478', '#e0b898'][i], straight: true, w: 2.5, shade: 0.1 }));
  blob(ctx, ell(wx + 90, wy + wh - 160, 80, 60, 0, 18), { fill: '#3f8a3a', w: 2.5, shade: 0.2 });
  ctx.fillStyle = '#b5532a'; ctx.fillRect(wx, wy + wh - 30, ww, 30);
  blob(ctx, ell(wx + 330 + Math.sin(t * 0.2) * 6, wy + 90, 50, 18, 0, 16), { fill: '#fff6ea', w: 0, shade: 0.05 });
  [[wx - 14, wy - 14, ww + 28, 22], [wx - 14, wy + wh - 8, ww + 28, 26], [wx - 14, wy - 14, 22, wh + 30], [wx + ww - 8, wy - 14, 22, wh + 30], [wx + ww / 2 - 8, wy, 16, wh]].forEach(([x, y, w, h]) => blob(ctx, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], { fill: '#f6efe2', straight: true, w: 3, shade: 0.08 }));
  // rideaux (ondulent un peu)
  [-1, 1].forEach((sd) => { const x0 = sd < 0 ? wx - 70 : wx + ww - 10, sw = Math.sin(t * 1.3 + sd) * 6; blob(ctx, [[x0, wy - 40], [x0 + 80, wy - 40], [x0 + 86 + sw, wy + wh + 40], [x0 + sw * 0.5, wy + wh + 60]], { fill: '#2c6e63', w: 3, shade: 0.2 }); for (let k = 1; k < 4; k++) stroke(ctx, [[x0 + k * 20, wy - 30], [x0 + k * 20 + sw * 0.8, wy + wh + 40]], 2, 'rgba(0,0,0,0.25)'); });
  // calendrier 2001, croix, horloge
  blob(ctx, [[110, 330], [300, 330], [300, 590], [110, 590]], { fill: '#fffaf0', straight: true, w: 3, shade: 0.06 });
  blob(ctx, [[110, 330], [300, 330], [300, 400], [110, 400]], { fill: '#c0392b', straight: true, w: 3, shade: 0 });
  ctx.fillStyle = '#fff'; ctx.font = "bold 42px 'Arial Black', Arial"; ctx.textAlign = 'center'; ctx.fillText('2001', 205, 382);
  ctx.fillStyle = '#555'; for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) ctx.fillRect(126 + c * 28, 420 + r * 32, 18, 18);
  blob(ctx, [[400, 300], [418, 300], [418, 450], [400, 450]], { fill: '#7a4a2a', straight: true, w: 3, shade: 0.15 }); blob(ctx, [[365, 340], [453, 340], [453, 358], [365, 358]], { fill: '#7a4a2a', straight: true, w: 3, shade: 0.15 });
  // meuble télé + vieux téléviseur, bible sur la table basse
  blob(ctx, [[40, 1180], [480, 1180], [480, 1500], [40, 1500]], { fill: '#8a5a36', straight: true, w: 3.5, shade: 0.15 });
  [[60, 1220], [270, 1220]].forEach(([x, y]) => { blob(ctx, [[x, y], [x + 190, y], [x + 190, y + 250], [x, y + 250]], { fill: '#7a4c2c', straight: true, w: 3, shade: 0.08 }); blob(ctx, ell(x + 170, y + 125, 7, 7, 0, 10), { fill: '#d4af37', w: 2, shade: 0 }); });
  blob(ctx, [[80, 900], [440, 900], [440, 1180], [80, 1180]], { fill: '#2a2a2e', straight: true, w: 3.5, shade: 0.15 });
  blob(ctx, [[110, 930], [380, 930], [380, 1150], [110, 1150]], { fill: '#4a5866', straight: true, w: 3, shade: 0 });
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(125, 945, 120, 60);
  [400, 420].forEach((y, i) => blob(ctx, ell(410, 950 + i * 40, 10, 10, 0, 12), { fill: '#777', w: 2, shade: 0 }));
  stroke(ctx, [[180, 900], [140, 820]], 3); stroke(ctx, [[300, 900], [350, 820]], 3);
  // sol carrelé
  ctx.fillStyle = '#d8cbb6'; ctx.fillRect(0, floorY, W, H - floorY);
  ctx.strokeStyle = 'rgba(90,70,50,0.35)'; ctx.lineWidth = 2; for (let i = -12; i < 20; i++) { ctx.beginPath(); ctx.moveTo(W / 2 + i * 60, floorY); ctx.lineTo(W / 2 + i * 260, H); ctx.stroke(); }
  for (let y = floorY, k = 30; y < H; y += k, k *= 1.35) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  stroke(ctx, [[0, floorY], [W, floorY]], 3.5);
  return floorY;
}

const LINE1 = 'Bouaké, deux mille un. Cinquième étage, deux chambres, un salon…';
const LINE2 = 'Et mes trois garçons !';

export function build({ ctx, begin, W, H }) {
  return (t) => {
    begin(); const floor = salon(ctx, W, H, t);
    // jumeaux qui courent derrière (au fond, plus petits)
    const run = (t0, x0, x1, S, seed, flip) => { const k = range(t, t0, t0 + 2.2); if (k <= 0 || k >= 1) return; const ph = t * 14 + seed, x = lerp(x0, x1, k);
      drawCharacter(ctx, S, { turn: 0.85 * flip, bodyTurn: 0.6 * flip, lean: 0.12 * flip, legL: [Math.sin(ph) * 0.6, Math.max(0, Math.cos(ph)) * 0.9], legR: [-Math.sin(ph) * 0.6, Math.max(0, -Math.cos(ph)) * 0.9], armL: [0.3, 0.9 + Math.sin(ph) * 0.5], armR: [0.3, 0.9 - Math.sin(ph) * 0.5], bob: -Math.abs(Math.sin(ph)) * 2, mouth: 'A', smile: 1, blink: blinkAt(t, seed), handL: 0.7, handR: 0.7, look: [flip * 0.5, 0] }, x, floor + 30, 9.5, flip); };
    run(5.4, -150, 1250, J1, 1, 1); run(5.75, -150, 1250, J2, 4, 1);
    // ---- Maman ----
    const kWalk = range(t, 0, 2.6), walking = t < 2.6;
    const x = lerp(-250, 470, ease(kWalk)), ph = t * 8.5;
    const speak1 = 3.4, end1 = speak1 + parleFin(LINE1), speak2 = end1 + 0.5, end2 = speak2 + parleFin(LINE2);
    const kTurn = ease(range(t, 2.3, 3.2)), kLook = ease(range(t, 6.0, 6.6)) * (1 - ease(range(t, 8.1, 8.8)));
    const stopBounce = spring(t, 2.6, 0.08, 2.2, 5);
    const gesture = ease(range(t, speak1 + 0.6, speak1 + 1.3)) * (1 - ease(range(t, end1 - 0.3, end1 + 0.4)));
    const big = ease(range(t, speak2 - 0.1, speak2 + 0.4)) * (1 - ease(range(t, 8.6, 9.4)));
    const pose = {
      turn: lerp(0.75, 0.05, kTurn) - kLook * 0.95 + Math.sin(t * 1.7) * 0.03,
      bodyTurn: lerp(0.55, 0.05, kTurn) - kLook * 0.25,
      lean: walking ? 0.06 : stopBounce + Math.sin(t * 1.2) * 0.01,
      tilt: Math.sin(t * 2.3) * 0.04 * (t > speak1 ? 1 : 0) - kLook * 0.06,
      nod: (t > speak1 && t < end2 ? Math.sin(t * 7) * 0.5 : 0),
      breathe: Math.sin(t * 2.2), bob: walking ? -Math.abs(Math.sin(ph)) * 1.4 : 0,
      legL: walking ? [Math.sin(ph) * 0.38, Math.max(0, Math.cos(ph)) * 0.55] : [0.02, 0.02],
      legR: walking ? [-Math.sin(ph) * 0.38, Math.max(0, -Math.cos(ph)) * 0.55] : [0.05, 0.04],
      armL: walking ? [0.15, 0.2 - Math.sin(ph) * 0.35] : [lerp(0.15, 0.55, gesture) + big * 0.9, lerp(0.2, 1.6, gesture) + big * 0.3 + Math.sin(t * 5) * 0.08 * gesture],
      armR: walking ? [0.15, 0.2 + Math.sin(ph) * 0.35] : [0.15 + big * 1.0, 0.2 + big * 0.4],
      handL: lerp(0.4, 1, Math.max(gesture, big)), handR: lerp(0.4, 1, big), handRotL: gesture * 0.4,
      look: [-kLook * 0.8, 0], blink: blinkAt(t, 2), brow: big * 1 + gesture * 0.4, smile: lerp(0.35, 1, big),
      mouth: t > 8.6 && t < 9.4 ? 'A' : t < end1 + 0.05 ? mouthAt(t, speak1, LINE1) : mouthAt(t, speak2, LINE2, 5),
      cheeks: big, sway: walking ? Math.sin(ph) * 0.15 : spring(t, 2.6, 0.25, 1.6, 2.5) + Math.sin(t * 1.5) * 0.04 - kLook * 0.1,
    };
    drawCharacter(ctx, MAMAN, pose, x + 40, floor + 300, 14.8, 1);
    // sous-titres
    const sub = t > speak1 - 0.1 && t < end1 + 0.4 ? LINE1.replace('deux mille un', '2001') : t > speak2 - 0.1 && t < 9.8 ? LINE2 : '';
    if (sub) { ctx.textAlign = 'center'; ctx.font = "bold 44px 'Arial Black', Arial, sans-serif"; ctx.lineJoin = 'round'; const lines = sub.length > 30 ? [sub.slice(0, sub.indexOf('.') + 1), sub.slice(sub.indexOf('.') + 2)] : [sub];
      lines.forEach((l, i) => { ctx.lineWidth = 12; ctx.strokeStyle = LINE; ctx.strokeText(l, W / 2, 1700 + i * 66); ctx.fillStyle = '#fff'; ctx.fillText(l, W / 2, 1700 + i * 66); }); }
  };
}
