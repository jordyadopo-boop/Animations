// « JUSTE UNE FOIS » — sensibilisation à la drogue et à l'alcool (style bonhommes, 16:9, ~62 s).
// Chaque verre, chaque prise le fait briller plus fort quelques secondes… puis un peu moins qu'avant.
// Il perd ses amis, sa famille, lui-même. Sa mère revient lui tendre la main : il repousse le verre.
import { PI, clamp, range, lerp, ease, eout, fade, walkPose, mixPose, HOR, depthY, depthS, stage, actor, caption, mixC, fadeIO } from '../engine/bonhomme.js';

export const world = 'flat', fps = 24, duration = 62, width = 1920, height = 1080;
export const title = 'JUSTE UNE FOIS';

// prises : [instant, objet] — chacune : éclat bref puis lumière plus basse qu'avant
const DOSES = [[8.2, 'verre'], [13.0, 'verre'], [16.4, 'joint'], [19.6, 'pilule'], [24.0, 'verre'], [27.2, 'pilule']];
const T = { party: 0, offer: 6, lonely: 22, family: 30, bottom: 38, mother: 44, take: 49, rise: 52, end: 58.4 };

export const CUES = [
  ['piano', 0.2, { theme: 'main', until: 6.4 }],
  ...DOSES.map(([t]) => ['dive', t - 1.3]),
  ['heart', 6.5, { until: 22, from: 80, to: 120, soft: true }], ['piano', 6.2, { theme: 'tension', until: 22.2 }],
  ['piano', 22, { theme: 'partir', until: 38.2 }], ['doorClose', 35.6],
  ['heart', 38.2, { until: 44, from: 50, to: 38, soft: true }], ['piano', 38, { theme: 'deuil', until: 44.2 }],
  ['steps', 44.2, { dur: 2 }], ['shatter', 50.0], ['piano', 44.2, { theme: 'main', until: 52.2 }],
  ['breath', 52.2, { dur: 3 }], ['piano', 52, { theme: 'fin', until: 61.8 }],
];

// lumière du héros : 1 = pleine ; chaque prise : éclat puis palier plus bas
function lightAt(t) {
  let base = 1, spike = 0;
  DOSES.forEach(([t0]) => { if (t > t0) { const dt = t - t0; spike = Math.max(spike, dt < 0.3 ? dt / 0.3 : Math.exp(-(dt - 0.3) * 2.2)); base -= 0.13 * clamp(dt / 1.5); } });
  base -= 0.12 * range(t, 30, 42); // il s'éteint presque
  base = Math.max(0.05, base) + 0.65 * ease(range(t, T.take + 0.4, T.end)); // la lumière revient (pas tout à fait)
  return { L: Math.min(1, base), spike };
}
// objets lumineux dans la main
function item(ctx, p, kind, a = 1, s = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a;
  if (kind === 'verre') { ctx.fillStyle = '#ffb347'; ctx.shadowColor = '#ffb347'; ctx.shadowBlur = 22; ctx.fillRect(p[0] - 10 * s, p[1] - 30 * s, 20 * s, 30 * s); }
  if (kind === 'pilule') { ctx.fillStyle = '#c9b6ff'; ctx.shadowColor = '#c9b6ff'; ctx.shadowBlur = 18; ctx.beginPath(); ctx.ellipse(p[0], p[1] - 6 * s, 12 * s, 7 * s, 0.4, 0, PI * 2); ctx.fill(); }
  if (kind === 'joint') { ctx.strokeStyle = '#e8e3d6'; ctx.lineWidth = 6 * s; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(p[0] - 14 * s, p[1]); ctx.lineTo(p[0] + 14 * s, p[1] - 6 * s); ctx.stroke(); ctx.fillStyle = 'rgba(200,200,210,0.35)'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(p[0] + 18 * s + Math.sin(i * 1.7) * 8, p[1] - 14 * s - i * 16 * s, (5 + i * 3) * s, 0, PI * 2); ctx.fill(); } }
  ctx.restore();
}

export function build({ ctx, begin, W, H }) {
  return (t) => {
    begin();
    const { L, spike } = lightAt(t);
    const amb = lerp(0.35, 1, L) + spike * 0.25;
    stage(ctx, W, H, Math.min(1, amb), t > T.rise ? ease(range(t, T.rise, T.rise + 2)) * 0.8 : 0);
    if (spike > 0.05) { ctx.fillStyle = `rgba(255,190,110,${spike * 0.12})`; ctx.fillRect(0, 0, W, H); }
    const me = { x: 1000, d: 0.78 };
    // ---- amis et famille : présents, puis s'en vont un à un, puis reviennent ----
    const people = [
      { x: 560, d: 0.62, h: 470, col: '#ffe9c4', leave: 17.4, flip: 1 }, { x: 1350, d: 0.6, h: 460, col: '#ffe9c4', leave: 20.6, flip: -1 },
      { x: 720, d: 0.5, h: 430, col: '#ffe9c4', leave: 25.0, flip: 1 }, { x: 1520, d: 0.66, h: 300, col: '#fff6d8', leave: 33.5, flip: -1, kid: true },
    ];
    people.forEach((p, i) => {
      const kLeave = ease(range(t, p.leave, p.leave + 3.2)), kBack = ease(range(t, T.rise + 0.5 + i * 0.4, T.rise + 3 + i * 0.4));
      const away = kLeave * (1 - kBack);
      const x = p.x + away * (p.flip > 0 ? -1200 : 1200);
      const party = t < T.offer + 2 ? { armF: [PI * 0.75 + Math.sin(t * 6 + i) * 0.3, 0.2], armB: [PI * 0.7 - Math.sin(t * 6 + i) * 0.3, 0.2], bob: -Math.abs(Math.sin(t * 6 + i)) * 0.03 } : null;
      const pose = away > 0.02 && away < 0.98 ? walkPose(t * 4 + i, 0.8) : party || (kBack > 0.5 ? { armF: [1.1, 0.3] } : { head: 0.1 });
      actor(ctx, x, p.d, p.h, pose, { color: p.col, glow: 16, flip: away > 0.02 && kBack < 0.5 ? -p.flip : p.flip, alpha: 1 - away * 0.7 });
    });
    // ---- l'ombre qui tend la chose suivante ----
    const shadowK = fade(t, 6, 7.5, T.take, T.take + 1.5);
    const sh = 520 + range(t, 22, 42) * 260;
    const nextDose = DOSES.find(([t0]) => t0 > t - 0.2);
    const offering = nextDose && t > nextDose[0] - 1.6 && t < nextDose[0];
    const lastOffer = t > 40 && t < T.take + 0.6;
    const hs = actor(ctx, 1240 - range(t, 22, 42) * 80, 0.8, sh, { lean: 0.18, head: 0.2, armF: [offering || lastOffer ? 1.45 : 0.4, 0.15], armB: [0.2, 0.3] }, { color: '#2a2b33', glow: 0, flip: -1, alpha: shadowK });
    if (offering) item(ctx, hs.hand, nextDose[1], shadowK, 1.2);
    if (lastOffer) item(ctx, hs.hand, 'verre', shadowK * (1 - range(t, T.take - 0.1, T.take + 0.3)), 1.2);
    // ---- lui ----
    const col = mixC('#ffffff', '#3e4048', clamp(1 - L)), glow = 6 + 20 * L + spike * 30;
    let pose;
    const dose = DOSES.find(([t0]) => t > t0 - 0.6 && t < t0 + 0.4);
    if (t < T.offer + 2) pose = { armF: [PI * 0.75 + Math.sin(t * 6) * 0.3, 0.2], armB: [PI * 0.7 - Math.sin(t * 6) * 0.3, 0.2], bob: -Math.abs(Math.sin(t * 6)) * 0.03 };
    else if (dose) pose = { lean: -0.12, head: -0.4, armF: [2.6, 1.2], armB: [0.2, 0.3] }; // il porte à la bouche
    else if (t < T.lonely) pose = { lean: 0.05 + (1 - L) * 0.2, head: (1 - L) * 0.3, armF: [0.3, 0.3], armB: [0.2, 0.3], bob: Math.sin(t * 9) * 0.004 * (1 - L) };
    else if (t < T.bottom) pose = { kneel: ease(range(t, T.lonely, T.lonely + 2)), lean: 0.5, head: 0.5, armF: [0.5, 0.6], armB: [0.4, 0.6], bob: Math.sin(t * 13) * 0.004 };
    else if (t < T.take) pose = mixPose({ kneel: 1, lean: 0.5, head: 0.5, armF: [0.5, 0.6], armB: [0.4, 0.6] }, { kneel: 1, lean: 0.85, head: 0.75, armF: [0.15, 0.3], armB: [0.1, 0.3] }, ease(range(t, T.bottom, T.bottom + 1.5)));
    else pose = mixPose({ kneel: 1, lean: 0.85, head: 0.75, armF: [0.15, 0.3], armB: [0.1, 0.3] }, { kneel: 1, lean: 0.25, head: 0.05, armF: [1.5, 0.2], armB: [0.3, 0.4] }, ease(range(t, T.take, T.take + 1.2)));
    if (t >= T.rise) pose = mixPose(pose, { kneel: 0, lie: 0, lean: 0.02, head: -0.05, armF: [0.9, 0.3], armB: [0.2, 0.3], legF: [0.05, 0.05], legB: [-0.05, 0.05] }, ease(range(t, T.rise, T.rise + 2.5)));
    // la mère qui le repousse… puis qui revient
    if (t > 28 && t < 36) { // elle tend la main, il se détourne ; elle part
      const kgo = ease(range(t, 33.5, 36));
      actor(ctx, 760 - kgo * 900, 0.8, 480, kgo > 0.02 ? walkPose(t * 4) : { lean: 0.2, armF: [1.4, 0.2], armB: [0.3, 0.3] }, { color: '#ffd9a8', glow: 18, flip: kgo > 0.02 ? -1 : 1, alpha: 1 - kgo * 0.8 });
      if (t > 30 && t < 33.5) pose = mixPose(pose, { armF: [1.3, 0.2] }, 0.4); // il la repousse
    }
    if (t > T.mother) {
      const kc = ease(range(t, T.mother, T.mother + 2.2));
      const kneelM = { kneel: 1, lean: 0.3, head: 0.2, armF: [1.45, 0.15], armB: [0.4, 0.5] };
      const mp = kc < 1 ? walkPose(t * 4.2) : t < T.rise ? kneelM : mixPose(kneelM, { kneel: 0, lean: 0, head: 0, armF: [1.0, 0.3], armB: [0.2, 0.3], legF: [0.05, 0.05], legB: [-0.05, 0.05] }, ease(range(t, T.rise, T.rise + 2.5)));
      actor(ctx, lerp(-100, 640, kc), 0.8, 480, mp, { color: '#ffd9a8', glow: 22 });
    }
    const hm = actor(ctx, me.x, me.d, 540, pose, { color: col, glow, flip: t > T.take + 0.3 && t < T.rise + 2.5 ? -1 : 1 });
    if (dose) item(ctx, hm.hand, dose[1], 1, 1.2);
    // verre repoussé qui tombe et se brise
    if (t > T.take && t < T.take + 2.4) { const k = range(t, T.take, T.take + 0.9); const gx = lerp(1150, 1300, k), gy = lerp(depthY(0.8) - 300, depthY(0.8) - 10, k * k); if (k < 1) item(ctx, [gx, gy], 'verre', 1, 1.2); else for (let j = 0; j < 8; j++) { const kk = range(t, T.take + 0.9, T.take + 2.2); ctx.fillStyle = `rgba(255,179,71,${1 - kk})`; ctx.fillRect(gx + Math.cos(j) * kk * 140, gy - Math.abs(Math.sin(j * 2)) * kk * 60, 7, 7); } }
    // ---- textes ----
    caption(ctx, W, 'Il brillait', fade(t, 0.8, 2, 5, 6));
    caption(ctx, W, '« Juste une fois. »', fade(t, 6.4, 7.2, 10.4, 11.4), 130, 48);
    caption(ctx, W, 'Chaque fois, il brillait plus fort.\nQuelques secondes.', fade(t, 12, 13.2, 17.4, 18.4));
    caption(ctx, W, 'Puis un peu moins qu’avant', fade(t, 19, 20.2, 24.4, 25.4));
    caption(ctx, W, 'Il a perdu ses amis.\nSa famille. Lui-même.', fade(t, 27.4, 28.6, 36.4, 37.4));
    caption(ctx, W, 'Ce qui te fait briller une nuit…', fade(t, 38.4, 39.4, 41.2, 41.8));
    caption(ctx, W, '…peut t’éteindre pour toujours', fade(t, 41.8, 42.6, 43.8, 44.6));
    caption(ctx, W, 'Il n’est jamais trop tard\npour dire non', fade(t, 45.4, 46.6, 51, 52));
    caption(ctx, W, 'Demande de l’aide.\nTu n’es pas seul.', fade(t, 52.6, 53.8, 57.4, 58.2));
    if (t > T.end) { ctx.fillStyle = `rgba(0,0,0,${range(t, T.end, T.end + 0.8)})`; ctx.fillRect(0, 0, W, H); if (t > T.end + 0.8) { caption(ctx, W, '« Juste une fois », c’est déjà une de trop.', fade(t, 59.3, 59.9, 61.3, 61.9), 500, 46); caption(ctx, W, 'Juste une fois', fade(t, 59.9, 60.5, 61.3, 61.9) * 0.7, 640, 34); } }
  };
}
