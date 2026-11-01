// « IL SUFFIT D'UN » — sensibilisation au harcèlement à l'école (style bonhommes, 16:9, ~62 s).
// Les témoins regardent, filment, se taisent. Jusqu'au jour où un seul entre dans le cercle.
import { PI, clamp, range, lerp, ease, eout, fade, walkPose, mixPose, HOR, depthY, depthS, stage, actor, caption, mixC, fadeIO } from '../engine/bonhomme.js';

export const world = 'flat', fps = 24, duration = 62, width = 1920, height = 1080;
export const title = 'IL SUFFIT D’UN';
const T = { yard: 0, bully: 6, circle: 16, night: 24, alone: 32, one: 40, all: 48, together: 54, end: 58.4 };

export const CUES = [
  ['piano', 0.2, { theme: 'main', until: 6.4 }],
  ['heart', 6.4, { until: 16, from: 76, to: 110, soft: true }], ['piano', 6.2, { theme: 'tension', until: 16.2 }], ['thud', 9.6], ['laugh', 10.0], ['laugh', 13.2],
  ['laugh', 18.5], ['notif', 26.0], ['notif', 26.7], ['notif', 27.3], ['notif', 28.0], ['notif', 28.4], ['notif', 29.1], ['notif', 29.5],
  ['piano', 16, { theme: 'partir', until: 32.2 }], ['clockFast', 33, { dur: 5 }], ['piano', 32, { theme: 'deuil', until: 40.2 }],
  ['steps', 41.5, { dur: 1.6 }], ['piano', 40.2, { theme: 'heritage', until: 48.2 }], ['steps', 48.4, { dur: 4 }],
  ['breath', 54, { dur: 2.5 }], ['piano', 48.2, { theme: 'fin', until: 61.8 }],
];

const KID = '#ffe9c4', BULLY = '#b04a3c';
const ME = { x: 960, d: 0.74 };
// cercle de témoins autour de lui
const RING = Array.from({ length: 9 }, (_, i) => { const a = (i / 9) * PI * 2 + 0.3; return { x: ME.x + Math.cos(a) * 520, d: clamp(ME.d + Math.sin(a) * 0.2, 0.42, 0.98), a, film: i % 3 !== 1 }; });

function phone(ctx, p, s = 1, a = 1) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#cfe2ff'; ctx.shadowColor = '#7fb2ff'; ctx.shadowBlur = 20; ctx.fillRect(p[0] - 8 * s, p[1] - 14 * s, 16 * s, 28 * s); ctx.fillStyle = '#ff4d5a'; ctx.beginPath(); ctx.arc(p[0], p[1] - 22 * s, 4 * s, 0, PI * 2); ctx.fill(); ctx.restore(); }
function backpack(ctx, x, y, s, a = 1) { ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#5a8fd6'; ctx.shadowColor = '#5a8fd6'; ctx.shadowBlur = 10; ctx.beginPath(); ctx.roundRect(x - 26 * s, y - 60 * s, 52 * s, 60 * s, 10 * s); ctx.fill(); ctx.restore(); }
function emojiRain(ctx, t, a) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; let s = 5; const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280); ctx.font = "600 34px 'Courier New', monospace"; ctx.textAlign = 'center';
  for (let i = 0; i < 26; i++) { const t0 = T.night + 1.6 + r() * 5, k = clamp((t - t0) / 1.2); if (k <= 0) continue; const x = 300 + r() * 1320, y = lerp(-40, 360 + r() * 380, eout(k)); ctx.fillStyle = 'rgba(160,195,255,0.92)'; ctx.beginPath(); ctx.roundRect(x - 70, y - 26, 140, 44, 14); ctx.fill(); ctx.fillStyle = '#1a1b22'; ctx.fillText(['MDR', 'LOL', 'HAHA', 'partagé', 'nul', 'vu 1,2k'][i % 6], x, y + 6); } ctx.restore(); }

export function build({ ctx, begin, W, H }) {
  return (t) => {
    begin();
    const hurt = clamp(range(t, 8, 38)) * (1 - ease(range(t, T.all, T.together + 2)));
    const meCol = mixC('#fff6d8', '#4a4c55', hurt * 0.85);
    if (t >= T.night && t < T.alone) { // ---- la nuit : la vidéo tourne sur tous les écrans ----
      stage(ctx, W, H, 0.3);
      const h = actor(ctx, 960, 0.8, 330, { lie: 1, armF: [2.4, 1.2], armB: [0.3, 0.4], legF: [0.3, 0.5] }, { color: meCol, glow: 3, flip: -1 });
      phone(ctx, [h.hand[0], h.hand[1] - 10], 1.4);
      ctx.save(); const g = ctx.createRadialGradient(h.hand[0], h.hand[1], 5, h.hand[0], h.hand[1], 260); g.addColorStop(0, 'rgba(110,160,255,0.35)'); g.addColorStop(1, 'rgba(110,160,255,0)'); ctx.fillStyle = g; ctx.fillRect(h.hand[0] - 300, h.hand[1] - 300, 600, 600); ctx.restore();
      emojiRain(ctx, t, fade(t, T.night + 1, T.night + 2, T.alone - 1, T.alone));
      caption(ctx, W, 'Le soir, ça continuait.\nSur tous les écrans.', fade(t, 24.8, 26, 30.8, 31.6));
      fadeIO(ctx, W, H, t, T.night, T.alone);
      return;
    }
    if (t >= T.alone && t < T.one) { // ---- seul, jour après jour ----
      stage(ctx, W, H, 0.55);
      const day = Math.floor((t - T.alone) / 2.6), k = ((t - T.alone) % 2.6) / 2.6;
      // des groupes d'élèves qui rient au loin, lui seul au premier plan
      [[400, 0.45], [520, 0.47], [1380, 0.44], [1500, 0.46]].forEach(([x, d], i) => actor(ctx, x, d, 300, { armF: [0.9 + Math.sin(t * 5 + i) * 0.3, 0.6], bob: -Math.abs(Math.sin(t * 5 + i)) * 0.02 }, { color: '#c9ccd6', glow: 6, flip: i < 2 ? 1 : -1 }));
      actor(ctx, lerp(560, 1360, k), 0.8, 330 * (1 - 0.08 * day), mixPose(walkPose(t * 3.2, 0.5), { lean: 0.35, head: 0.55, armF: [0.05, 0.05], armB: [0, 0.05] }, 0.6), { color: meCol, glow: 3 });
      ctx.fillStyle = `rgba(0,0,0,${Math.max(0, 1 - Math.abs(k - 0.5) * 2) ** 8})`; ctx.fillRect(0, 0, W, H);
      caption(ctx, W, 'Il a arrêté de parler.\nDe manger. De rire.', fade(t, 33, 34.2, 38.6, 39.4));
      fadeIO(ctx, W, H, t, T.alone, T.one);
      return;
    }
    // ---- la cour ----
    stage(ctx, W, H, t > T.together ? 1 : lerp(1, 0.65, range(t, 6, 12)), t > T.together ? ease(range(t, T.together, T.together + 2)) * 0.8 : 0);
    const first = t < T.alone;
    // élèves qui jouent (début), puis cercle de témoins
    const ringK = first ? ease(range(t, T.circle - 1, T.circle + 1.5)) : ease(range(t, T.one, T.one + 1));
    const joinK = (i) => ease(range(t, T.all + 0.3 + i * 0.45, T.all + 1.6 + i * 0.45)); // ils rejoignent son côté
    const playing = first && t < T.circle - 1;
    RING.forEach((r, i) => {
      if (r.d > ME.d + 0.04) return; // ceux de devant sont dessinés après lui
      drawWitness(r, i);
    });
    function drawWitness(r, i) {
      const sx = 200 + i * 190, sd = 0.5 + (i % 3) * 0.06;
      let x = lerp(sx + Math.sin(t * 1.3 + i) * 120, r.x, ringK), d = lerp(sd, r.d, ringK);
      const j = !first ? joinK(i) : 0;
      x = lerp(x, ME.x + (i % 2 ? 1 : -1) * (120 + (i >> 1) * 70), j); d = lerp(d, ME.d - 0.02 - (i % 3) * 0.03, j);
      const filming = r.film && ringK > 0.9 && j < 0.3 && (first ? t > T.circle + 1 : t < T.all + 0.5);
      const pose = playing ? walkPose(t * 5 + i, 0.9) : j > 0.05 && j < 0.95 ? walkPose(t * 4 + i, 0.7) : filming ? { armF: [1.9, 0.9], armB: [0.3, 0.3], head: -0.05 } : { armF: [0.3, 0.3], head: 0.05 };
      const h = actor(ctx, x, d, 320, pose, { color: j > 0.5 ? '#ffe9c4' : '#c9ccd6', glow: j > 0.5 ? 18 : 6, flip: x < ME.x ? 1 : -1 });
      if (filming) phone(ctx, h.hand, depthS(d));
    }
    // les harceleurs
    const bK = ease(range(t, T.bully, T.bully + 2)), back = ease(range(t, T.all + 2.5, T.together + 1));
    const bullies = [[ME.x + 300, 0.78], [ME.x + 470, 0.72], [ME.x + 230, 0.68]];
    const shove = t > 9.2 && t < 10.2;
    bullies.forEach(([bx, bd], i) => {
      const x = lerp(2150, bx, bK) + back * 700, a = 1 - back * 0.85;
      const pose = bK < 1 ? walkPose(t * 4.4 + i) : i === 0 && shove ? { lean: 0.3, armF: [1.6, 0.0], armB: [1.4, 0.1], legF: [0.4, 0.2], legB: [-0.3, 0.1] } : { lean: -0.05, armF: [t > 10 && t < 15 ? 1.5 + Math.sin(t * 9 + i) * 0.4 : 0.8, 1.2], armB: [0.5, 0.9], bob: (t > 10 && t < 15) || (t > 18 && t < 21) ? -Math.abs(Math.sin(t * 10 + i)) * 0.03 : 0 };
      if (first || t > T.one) actor(ctx, x, bd, 380, pose, { color: mixC(BULLY, '#5a4a48', back), glow: 8 * a, flip: -1, alpha: a });
    });
    // lui
    let me;
    const fall = ease(range(t, 9.4, 10.0)) * (1 - ease(range(t, 13.5, 15)));
    if (t < 4) me = walkPose(t * 4.4, 0.8);
    else if (first) me = mixPose({ armF: [0.3, 0.3], head: 0.1 }, { kneel: 1, lean: 0.6, head: 0.5, armF: [0.6, 0.8], armB: [0.4, 0.8] }, Math.max(fall, ease(range(t, 15, 17)) * 0.8));
    else me = mixPose({ kneel: 1, lean: 0.6, head: 0.5, armF: [0.6, 0.8] }, { kneel: 0, lean: 0, head: -0.05, armF: [0.3, 0.3], armB: [0.2, 0.3], legF: [0.05, 0.05], legB: [-0.05, 0.05] }, ease(range(t, T.all + 1, T.together)));
    const meX = t < 4 ? lerp(300, ME.x, ease(t / 4)) : ME.x;
    if (t >= T.together) me = walkPose(t * 4, 0.9);
    actor(ctx, meX + (t >= T.together ? ease(range(t, T.together, T.end)) * 200 : 0), ME.d, 330, me, { color: meCol, glow: lerp(20, 3, hurt) });
    // le sac jeté
    if (first && t > 10.4) { const k = range(t, 10.4, 11.4); backpack(ctx, lerp(ME.x + 260, ME.x + 760, k), lerp(depthY(ME.d) - 260, depthY(0.82), eout(k)) - Math.sin(k * PI) * 160, 1, 1 - range(t, 22, 24)); }
    // celui qui entre dans le cercle
    if (!first) {
      const kOne = ease(range(t, T.one + 1.2, T.one + 3.4));
      const pose = kOne < 1 ? walkPose(t * 4.6) : { armF: [PI * 0.55, 0.05], armB: [0.25, 0.3] };
      actor(ctx, lerp(RING[2].x, ME.x + 150, kOne), lerp(RING[2].d, ME.d + 0.02, kOne), 330, pose, { color: '#ffffff', glow: 24, flip: 1 });
    }
    RING.forEach((r, i) => { if (r.d > ME.d + 0.04) drawWitness(r, i); });
    // textes
    caption(ctx, W, 'Chaque matin,\nil avait peur d’aller à l’école', fade(t, 0.8, 2, 5.2, 6));
    caption(ctx, W, 'Pour eux, c’était un jeu', fade(t, 7.4, 8.6, 14.6, 15.6));
    caption(ctx, W, 'Les autres regardaient.\nCertains filmaient.', fade(t, 17.4, 18.6, 22.8, 23.8));
    caption(ctx, W, 'Jusqu’au jour où un seul a dit :\n« Laissez-le. »', fade(t, T.one + 1.6, T.one + 2.8, T.all - 0.6, T.all + 0.2));
    caption(ctx, W, 'Puis un autre. Puis tous.', fade(t, T.all + 0.8, T.all + 1.8, T.together - 0.6, T.together + 0.2));
    caption(ctx, W, 'Le harcèlement s’arrête\nquand les témoins ne se taisent plus', fade(t, T.together + 0.4, T.together + 1.4, T.end - 0.6, T.end));
    if (first) fadeIO(ctx, W, H, t, -1, T.night); else { const k = 1 - range(t, T.one, T.one + 0.8); if (k > 0) { ctx.fillStyle = `rgba(0,0,0,${k})`; ctx.fillRect(0, 0, W, H); } }
    if (t > T.end) { ctx.fillStyle = `rgba(0,0,0,${range(t, T.end, T.end + 0.8)})`; ctx.fillRect(0, 0, W, H); if (t > T.end + 0.8) { caption(ctx, W, 'Tu n’es pas obligé d’être son ami.\nJuste de ne pas rire.', fade(t, 59.3, 59.9, 61.3, 61.9), 420, 46); caption(ctx, W, 'Il suffit d’un', fade(t, 59.9, 60.5, 61.3, 61.9) * 0.7, 760, 34); } }
  };
}
