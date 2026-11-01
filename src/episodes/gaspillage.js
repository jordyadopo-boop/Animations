// « CE QUE TU JETTES » — sensibilisation au gaspillage de nourriture (style bonhommes, 16:9, ~62 s).
// Écran partagé : à gauche, une table pleine et une poubelle ; à droite, des enfants aux bols vides.
// La nourriture jetée traverse la frontière… et la frontière finit par tomber.
import { PI, clamp, range, lerp, ease, eout, fade, figure, walkPose, mixPose, HOR, depthY, depthS, stage, actor, caption, mixC } from '../engine/bonhomme.js';

export const world = 'flat', fps = 24, duration = 62, width = 1920, height = 1080;
export const title = 'CE QUE TU JETTES';
const T = { eat: 0, throw: 6, waste: 14, cross: 22, dream: 32, share: 42, table: 52, end: 58.4 };

export const CUES = [
  ['piano', 0.2, { theme: 'main', until: 6.2 }], ['word', 8.2], ['word', 11.4], ['word', 15.2], ['word', 17.0], ['word', 18.8],
  ['piano', 6, { theme: 'partir', until: 22.2 }], ['dive', 22.6], ['twinkle', 24], ['piano', 22, { theme: 'deuil', until: 32.2 }],
  ['piano', 32, { theme: 'main', until: 42.2 }], ['steps', 43, { dur: 2 }], ['shatter', 47.4],
  ['piano', 42, { theme: 'fin', until: 61.8 }],
];

const MID = 960, SIT = { legF: [1.5, 1.45], legB: [1.42, 1.4], lean: 0.05, armF: [1.2, 0.5], armB: [1.1, 0.6] };
const FOOD = '#ffb347';
function plate(ctx, x, y, s, full) { ctx.save(); ctx.strokeStyle = 'rgba(230,234,245,0.8)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(x, y, 46 * s, 10 * s, 0, 0, PI * 2); ctx.stroke(); if (full > 0) { ctx.fillStyle = FOOD; ctx.shadowColor = FOOD; ctx.shadowBlur = 16; ctx.globalAlpha = full; ctx.beginPath(); ctx.ellipse(x, y - 10 * s, 34 * s, 14 * s, 0, PI, 0); ctx.fill(); } ctx.restore(); }
function bowl(ctx, x, y, s, full) { ctx.save(); ctx.strokeStyle = 'rgba(200,205,220,0.75)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y - 20 * s, 26 * s, 0, PI); ctx.stroke(); if (full > 0) { ctx.fillStyle = FOOD; ctx.shadowColor = FOOD; ctx.shadowBlur = 14; ctx.globalAlpha = Math.min(1, full); ctx.beginPath(); ctx.ellipse(x, y - 20 * s, 24 * s, 7 * s * full, 0, 0, PI * 2); ctx.fill(); } ctx.restore(); }
function bin(ctx, x, y, fill) { ctx.save(); ctx.strokeStyle = 'rgba(200,205,220,0.7)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x - 50, y - 130); ctx.lineTo(x - 40, y); ctx.lineTo(x + 40, y); ctx.lineTo(x + 50, y - 130); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x - 60, y - 135); ctx.lineTo(x + 60, y - 135); ctx.stroke();
  ctx.fillStyle = FOOD; ctx.shadowColor = FOOD; ctx.shadowBlur = 12; for (let i = 0; i < fill * 26; i++) { ctx.beginPath(); ctx.arc(x - 34 + (i * 23) % 68, y - 10 - Math.floor(i / 4) * 16 - (i % 2) * 5, 9, 0, PI * 2); ctx.fill(); } ctx.restore(); }
function table(ctx, x0, x1, d) { const y = depthY(d) - 220 * depthS(d); ctx.save(); ctx.strokeStyle = 'rgba(210,214,226,0.75)'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.moveTo(x0 + 30, y); ctx.lineTo(x0 + 30, depthY(d)); ctx.moveTo(x1 - 30, y); ctx.lineTo(x1 - 30, depthY(d)); ctx.stroke(); ctx.restore(); return y; }

export function build({ ctx, begin, W, H }) {
  return (t) => {
    begin();
    stage(ctx, W, H, 1, t > T.table ? ease(range(t, T.table, T.table + 2)) * 0.8 : 0);
    const wallK = 1 - ease(range(t, T.share + 4.5, T.share + 6.5)); // la frontière tombe
    // côté droit plus sombre
    if (wallK > 0) { ctx.fillStyle = `rgba(0,0,0,${0.45 * wallK})`; ctx.fillRect(MID, 0, W - MID, H); }
    const together = t > T.table;
    // ---- côté gauche : la famille qui mange et qui jette ----
    const tableL = together ? null : table(ctx, 180, 760, 0.74);
    const throwT = [8.0, 11.2, 15.0, 16.8, 18.6];
    const binFill = clamp(throwT.filter((x) => t > x + 0.6).length / 5);
    if (!together) bin(ctx, 860, depthY(0.8), binFill * (1 - range(t, T.cross, T.cross + 6)));
    const famL = [[260, 470, 1], [680, 450, -1], [470, 320, 1]];
    if (!together) famL.forEach(([x, h, f], i) => {
      const thrower = i === 1;
      const tw = throwT.find((x2) => t > x2 - 0.6 && t < x2 + 0.5);
      let pose = { ...SIT, armF: [1.3 + Math.sin(t * 3 + i) * 0.15, 0.4], head: 0.05 };
      if (thrower && tw) pose = { ...SIT, lean: -0.05, armF: [2.0, -0.3], armB: [1.0, 0.6] };
      if (i === 2 && t > T.dream && t < T.share + 4) pose = t < T.share ? { armF: [0.3, 0.3], head: -0.05 } : walkPose(t * 4);
      const kx = i === 2 && t > T.share ? lerp(x, MID - 60, ease(range(t, T.share, T.share + 2.5))) : x;
      actor(ctx, kx, i === 2 ? 0.7 : 0.76, h, pose, { color: '#ffe9c4', glow: 18, flip: f });
      if (i !== 2 || t < T.dream) plate(ctx, x + f * 70, tableL - 8, 1, thrower && t > 7.8 ? 0.5 : 1);
    });
    // nourriture jetée dans la poubelle
    throwT.forEach((x2) => { const k = range(t, x2, x2 + 0.6); if (k > 0 && k < 1) { ctx.save(); ctx.fillStyle = FOOD; ctx.shadowColor = FOOD; ctx.shadowBlur = 12; for (let j = 0; j < 5; j++) { ctx.beginPath(); ctx.arc(lerp(760, 860, k) + j * 8, lerp(depthY(0.76) - 260, depthY(0.8) - 120, k) - Math.sin(k * PI) * 90 + j * 6, 8, 0, PI * 2); ctx.fill(); } ctx.restore(); } });
    // ---- côté droit : des enfants aux bols vides ----
    const kidsR = [[1240, 0.78], [1480, 0.72], [1720, 0.8]];
    const fillR = ease(range(t, T.cross + 2, T.dream + 2));
    const shown = (i) => i === 0 || t > T.waste + i * 1.6;
    if (!together) kidsR.forEach(([x, d], i) => {
      if (!shown(i)) return;
      const eating = fillR > 0.6;
      const pose = eating ? { kneel: 1, lean: 0.15, head: 0.1, armF: [1.3 + Math.abs(Math.sin(t * 4 + i)) * 0.4, 0.8], armB: [1.0, 0.8] } : { kneel: 1, lean: 0.45, head: 0.5, armF: [0.9, 0.9], armB: [0.8, 0.9] };
      actor(ctx, x, d, 330, pose, { color: mixC('#6a6c76', '#fff6d8', fillR), glow: lerp(2, 18, fillR), flip: -1, alpha: i === 0 ? 1 : clamp(t - (T.waste + i * 1.6)) });
      bowl(ctx, x - 70 * depthS(d), depthY(d), depthS(d) * 1.4, fillR);
    });
    // la nourriture jetée traverse la frontière et remplit les bols
    if (t > T.cross && t < T.dream + 2) { ctx.save(); ctx.fillStyle = FOOD; ctx.shadowColor = FOOD; ctx.shadowBlur = 16; for (let j = 0; j < 30; j++) { const k = clamp((t - T.cross - j * 0.25) / 2.4); if (k <= 0 || k >= 1) continue; const tgt = kidsR[j % 3]; const x = lerp(860, tgt[0] - 70, eout(k)), y = lerp(depthY(0.8) - 140, depthY(tgt[1]) - 30, k) - Math.sin(k * PI) * 300; ctx.beginPath(); ctx.arc(x, y, 8, 0, PI * 2); ctx.fill(); } ctx.restore(); }
    // la frontière de lumière
    if (wallK > 0) { ctx.save(); ctx.globalAlpha = wallK; ctx.fillStyle = 'rgba(210,215,235,0.16)'; ctx.strokeStyle = 'rgba(225,230,250,0.8)'; ctx.lineWidth = 4; ctx.shadowColor = '#dfe6ff'; ctx.shadowBlur = 14; const top = 250; ctx.fillRect(MID - 14, top, 28, depthY(0.95) - top); ctx.strokeRect(MID - 14, top, 28, depthY(0.95) - top); ctx.restore(); }
    // l'enfant de gauche tend une assiette de l'autre côté
    if (t > T.share + 2.5 && !together) { const k = ease(range(t, T.share + 2.5, T.share + 4)); plate(ctx, lerp(MID - 10, MID + 120, k), depthY(0.7) - 190, 1, 1); }
    // ---- ensemble, à une seule grande table ----
    if (together) {
      const ty = table(ctx, 240, 1680, 0.76);
      [[340, 470], [520, 330], [700, 450], [900, 330], [1080, 330], [1260, 470], [1460, 330], [1620, 450]].forEach(([x, h], i) => {
        actor(ctx, x, i % 2 ? 0.7 : 0.76, h, { ...SIT, armF: [1.3 + Math.abs(Math.sin(t * 3.4 + i)) * 0.3, 0.4], bob: -Math.abs(Math.sin(t * 5 + i)) * 0.01 }, { color: i % 3 === 1 ? '#fff6d8' : '#ffe9c4', glow: 20, flip: x < 960 ? 1 : -1 });
        plate(ctx, x + (x < 960 ? 60 : -60), ty - 8, 1, 0.7);
      });
      ctx.fillStyle = `rgba(0,0,0,${1 - range(t, T.table, T.table + 0.8)})`; ctx.fillRect(0, 0, W, H);
    }
    // textes
    caption(ctx, W, 'Ici, on mange à sa faim', fade(t, 0.8, 2, 5.2, 6));
    caption(ctx, W, 'Et on jette ce qu’on ne finit pas', fade(t, 6.8, 8, 12.4, 13.4));
    caption(ctx, W, 'Près d’un tiers de la nourriture\nfinit gaspillé', fade(t, 14.4, 15.6, 18.4, 19.2));
    caption(ctx, W, 'Pendant que des millions\nd’enfants ont faim', fade(t, 19.4, 20.4, 21.6, 22.2));
    caption(ctx, W, 'Et si ce que tu jettes\nallait ailleurs ?', fade(t, 23, 24.2, 30.6, 31.6));
    caption(ctx, W, 'Ce que tu jettes,\nquelqu’un en rêve', fade(t, 33, 34.2, 40.4, 41.4));
    caption(ctx, W, 'Prends ce que tu manges.\nPartage le reste.', fade(t, 43, 44.2, 50.4, 51.4));
    caption(ctx, W, 'Rien ne se perd\nquand on partage', fade(t, 53, 54.2, 57.6, 58.3));
    if (t > T.end) { ctx.fillStyle = `rgba(0,0,0,${range(t, T.end, T.end + 0.8)})`; ctx.fillRect(0, 0, W, H); if (t > T.end + 0.8) { caption(ctx, W, 'Ne jette pas. Partage.', fade(t, 59.3, 59.9, 61.3, 61.9), 440, 52); caption(ctx, W, 'Ce que tu jettes', fade(t, 59.9, 60.5, 61.3, 61.9) * 0.7, 700, 34); } }
  };
}
