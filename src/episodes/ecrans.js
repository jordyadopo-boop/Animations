// « LÈVE LES YEUX » — sensibilisation à l'addiction aux écrans (style bonhommes, 16:9, ~62 s).
// Une famille à table. Un écran, puis deux. L'enfant cherche un regard… puis fait comme eux.
// Jusqu'à ce que quelqu'un pose son téléphone.
import { PI, clamp, range, lerp, ease, eout, fade, figure, walkPose, mixPose, HOR, depthY, depthS, stage, actor, caption, mixC, fadeIO } from '../engine/bonhomme.js';

export const world = 'flat', fps = 24, duration = 62, width = 1920, height = 1080;
export const title = 'LÈVE LES YEUX';

const T = { warm: 0, phone1: 7, phone2: 10.5, kid: 14, giveup: 24, apart: 30, notif: 38, look: 46, pop: 48.5, joy: 53, end: 59.5 };

export const CUES = [
  ['piano', 0.2, { theme: 'main', until: 7.4 }],
  ['notif', 7.6], ['notif', 11.0], ['piano', 7.2, { theme: 'pont', until: 13.8 }],
  ['piano', 14, { theme: 'partir', until: 30.2 }], ['notif', 26.2],
  ['clockFast', 30.5, { dur: 6 }], ['piano', 30, { theme: 'deuil', until: 46.2 }],
  ...Array.from({ length: 14 }, (_, i) => ['notif', 38.4 + i * 0.5 + (i % 3) * 0.13]),
  ['breath', 46.2, { dur: 2.2 }], ['pop', 48.6], ['pop', 50.0], ['pop', 51.2],
  ['piano', 48.6, { theme: 'fin', until: 61.8 }],
];

const WARM = '#ffe9c4', BLUE = '#7fb2ff';
const SIT = { legF: [1.5, 1.45], legB: [1.42, 1.4], lean: 0.04, armF: [0.9, 0.7], armB: [0.8, 0.8] };
const PHONE = { lean: 0.22, head: 0.62, armF: [0.75, 1.15], armB: [0.7, 1.2] };

// bulle bleue d'écran autour d'une personne ; k : 0 → absente, 1 → pleine ; pop : 0..1 éclatement
function screenBubble(ctx, x, y, r, k, pop = 0) {
  if (k <= 0 || pop >= 1) return;
  ctx.save();
  if (pop > 0) { // la bulle éclate en éclats de lumière
    for (let i = 0; i < 18; i++) { const a = (i / 18) * PI * 2, d = r * (1 + eout(pop) * 0.7); ctx.fillStyle = `rgba(150,195,255,${1 - pop})`; ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.9, 5 * (1 - pop) + 1, 0, PI * 2); ctx.fill(); }
    ctx.restore(); return;
  }
  const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r); g.addColorStop(0, `rgba(80,140,255,${0.10 * k})`); g.addColorStop(0.85, `rgba(80,140,255,${0.22 * k})`); g.addColorStop(1, `rgba(150,195,255,${0.55 * k})`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.92, 0, 0, PI * 2); ctx.fill();
  ctx.strokeStyle = `rgba(170,210,255,${0.7 * k})`; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.restore();
}
// le téléphone (rectangle lumineux) dans la main
function phone(ctx, p, on = 1, s = 1) {
  ctx.save(); ctx.fillStyle = on ? '#cfe2ff' : '#30333c'; if (on) { ctx.shadowColor = BLUE; ctx.shadowBlur = 26; }
  ctx.fillRect(p[0] - 9 * s, p[1] - 15 * s, 18 * s, 30 * s); ctx.restore();
}
// table vue de côté + chaises
function table(ctx, cx, d, len, a = 1) {
  const y = depthY(d), s = depthS(d); ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = 'rgba(210,214,226,0.75)'; ctx.lineWidth = 6 * s; ctx.lineCap = 'round';
  const top = y - 230 * s; ctx.beginPath(); ctx.moveTo(cx - len / 2, top); ctx.lineTo(cx + len / 2, top); ctx.moveTo(cx - len / 2 + 30, top); ctx.lineTo(cx - len / 2 + 30, y); ctx.moveTo(cx + len / 2 - 30, top); ctx.lineTo(cx + len / 2 - 30, y); ctx.stroke(); ctx.restore();
}
// notifications qui pleuvent
function notifs(ctx, t, x, y0, n, k) {
  if (k <= 0) return; ctx.save(); let s = 3; const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < n; i++) { const t0 = T.notif + r() * 7, xx = x + (r() - 0.5) * 900, fall = clamp((t - t0) / 1.6); if (fall <= 0) continue; const yy = lerp(-60, y0 + r() * 120, eout(fall));
    ctx.globalAlpha = k * (0.9 - r() * 0.3); ctx.fillStyle = '#9cc4ff'; ctx.shadowColor = BLUE; ctx.shadowBlur = 12; ctx.beginPath(); ctx.roundRect(xx - 26, yy - 14, 52, 28, 10); ctx.fill();
    ctx.shadowBlur = 0; ctx.fillStyle = '#ff4d5a'; ctx.beginPath(); ctx.arc(xx + 24, yy - 12, 8, 0, PI * 2); ctx.fill(); }
  ctx.restore();
}

export function build({ ctx, begin, W, H }) {
  return (t) => {
    begin();
    const light = lerp(1, 0.55, range(t, T.phone1, T.apart)) + 0.45 * range(t, T.pop, T.joy);
    stage(ctx, W, H, Math.min(1, light), t > T.joy ? ease(range(t, T.joy, T.joy + 2)) : 0);
    // écart qui grandit entre eux (la table s'allonge)
    const apart = ease(range(t, T.apart, T.notif)) * (1 - ease(range(t, T.pop, T.joy)));
    const dad = 700 - apart * 260, mom = 1220 + apart * 260, kidX = 960;
    const dD = 0.78, dK = 0.5;
    if (t < T.joy) table(ctx, 960, 0.72, 520 + apart * 520);
    // ---- états des téléphones ----
    const dadPh = range(t, T.phone1, T.phone1 + 0.8) * (1 - range(t, T.pop + 1.4, T.pop + 1.8));
    const momPh = range(t, T.phone2, T.phone2 + 0.8) * (1 - range(t, T.look + 0.6, T.look + 1.4));
    const kidPh = range(t, T.giveup + 2, T.giveup + 2.8) * (1 - range(t, T.pop + 0.4, T.pop + 1.0));
    const col = (k) => mixC('#ffe9c4', '#7f9cc8', k);
    // ---- l'enfant ----
    let kp, kx = kidX, kd = dK;
    if (t < T.kid) kp = mixPose(SIT, { armF: [1.2 + Math.sin(t * 6) * 0.2, 0.6], head: -0.1 }, 1);
    else if (t < T.giveup) { // il essaie d'attirer leur attention
      const k = range(t, T.kid, T.giveup);
      kx = lerp(960, 820, ease(range(t, T.kid, T.kid + 1.6))) + (t > 18.5 ? lerp(0, 330, ease(range(t, 18.5, 20))) : 0);
      kd = lerp(dK, 0.74, ease(range(t, T.kid, T.kid + 1.6)));
      const jump = t > 20 && t < 22.5 ? Math.abs(Math.sin(t * 7)) * 0.05 : 0;
      kp = t < 16 ? walkPose(t * 6) : t < 18.5 ? { lean: 0.15, armF: [1.3, 0.2], armB: [0.2, 0.3] } /* tire le bras */ : t < 20 ? walkPose(t * 6) : { armF: [PI * 0.9 + Math.sin(t * 9) * 0.25, -0.2], armB: [PI * 0.85 - Math.sin(t * 9) * 0.25, -0.2], bob: -jump };
      if (t > 22.5) kp = mixPose(kp, { lean: 0.25, head: 0.5, armF: [0.1, 0.1], armB: [0.05, 0.1] }, ease(range(t, 22.5, 23.8)));
    } else { // il abandonne, se rassoit, prend un téléphone
      kx = lerp(1150, 960, ease(range(t, T.giveup, T.giveup + 1.6))); kd = lerp(0.74, dK, ease(range(t, T.giveup, T.giveup + 1.6)));
      kp = t < T.giveup + 1.6 ? walkPose(t * 4.5, 0.6) : mixPose(SIT, PHONE, kidPh);
      if (t > T.pop) kp = mixPose(kp, { ...SIT, armF: [1.4, 0.3], head: -0.1 }, ease(range(t, T.pop + 0.4, T.pop + 1.2)));
    }
    if (t > T.joy) { kx = 960; kd = lerp(dK, 0.7, ease(range(t, T.joy, T.joy + 2))); kp = { bob: -Math.abs(Math.sin(t * 6)) * 0.06, armF: [PI * 0.85, 0], armB: [PI * 0.85, 0] }; }
    // ---- les parents ----
    const dp = mixPose(mixPose(SIT, { armF: [1.1 + Math.sin(t * 2) * 0.15, 0.7] }, 1), PHONE, dadPh);
    let mp = mixPose(mixPose(SIT, { armF: [1.0, 0.8] }, 1), PHONE, momPh);
    if (t > T.look) mp = mixPose(mp, { ...SIT, head: -0.15, lean: 0, armF: [1.25, 0.3] }, ease(range(t, T.look + 0.6, T.look + 2)));
    let dpp = dp; if (t > T.joy) { dpp = mixPose(dp, { legF: [0.05, 0.05], legB: [-0.05, 0.05], lean: 0, head: -0.1, armF: [0.9, 1.6], armB: [0.8, 1.7] }, ease(range(t, T.joy, T.joy + 1.5))); mp = mixPose(mp, { legF: [0.05, 0.05], legB: [-0.05, 0.05], lean: 0, head: -0.1, armF: [0.9, 1.5], armB: [0.7, 1.6] }, ease(range(t, T.joy, T.joy + 1.5))); }
    // ordre : enfant derrière la table (au début), parents devant
    const blueK = (k) => k;
    const drawKid = () => { const h = actor(ctx, kx, kd, 300, kp, { color: col(kidPh * 0.9), glow: lerp(20, 8, kidPh) }); if (kidPh > 0.05) phone(ctx, h.hand, 1, depthS(kd)); screenBubble(ctx, kx, depthY(kd) - 150 * depthS(kd), 170 * depthS(kd), kidPh, range(t, T.pop + 0.9, T.pop + 1.5)); };
    if (kd <= 0.72) drawKid();
    const hd = actor(ctx, dad, dD, 520, dpp, { color: col(dadPh * 0.9), glow: lerp(22, 8, dadPh) });
    if (dadPh > 0.05) phone(ctx, hd.hand, 1, depthS(dD));
    screenBubble(ctx, dad + 30, depthY(dD) - 260 * depthS(dD), 300 * depthS(dD), dadPh, range(t, T.pop + 2.2, T.pop + 2.8));
    const hm = actor(ctx, mom, dD, 480, mp, { color: col(momPh * 0.9), glow: lerp(22, 8, momPh), flip: -1 });
    if (momPh > 0.05) phone(ctx, hm.hand, 1, depthS(dD));
    if (t > T.look + 1.2 && t < T.joy) phone(ctx, [mom - 190, depthY(0.72) - 230 * depthS(0.72) - 6], 0, depthS(0.72)); // posé, écran éteint
    screenBubble(ctx, mom - 30, depthY(dD) - 250 * depthS(dD), 290 * depthS(dD), momPh, range(t, T.look + 0.3, T.look + 1.0));
    if (kd > 0.72) drawKid();
    notifs(ctx, t, 960, 760, 40, fade(t, T.notif, T.notif + 0.5, T.look, T.look + 1.2));
    // ---- textes ----
    caption(ctx, W, 'Avant, on se parlait', fade(t, 0.8, 2, 6, 7));
    caption(ctx, W, 'Puis un écran. Puis deux.', fade(t, 7.8, 9, 12.8, 13.8));
    caption(ctx, W, 'Il voulait juste\nqu’on le regarde', fade(t, 15, 16.2, 22.6, 23.6));
    caption(ctx, W, 'Alors il a fait comme nous', fade(t, 25, 26.2, 29, 30));
    caption(ctx, W, 'Ensemble. Mais seuls.', fade(t, 31.2, 32.4, 37, 38));
    caption(ctx, W, 'Mille notifications.\nPas un regard.', fade(t, 39.2, 40.4, 45, 46));
    caption(ctx, W, 'Il suffit de lever les yeux', fade(t, 47.2, 48.4, 52, 53));
    caption(ctx, W, 'Pose ton téléphone.\nRegarde-les.', fade(t, 53.8, 55, 58.4, 59.2));
    fadeIO(ctx, W, H, t, -1, T.end);
    if (t > T.end) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); caption(ctx, W, 'Ils ne resteront pas petits longtemps.', fade(t, 59.6, 60.2, 61.4, 61.9), 500, 50); caption(ctx, W, 'Lève les yeux', fade(t, 60.1, 60.7, 61.4, 61.9) * 0.7, 640, 34); }
  };
}
