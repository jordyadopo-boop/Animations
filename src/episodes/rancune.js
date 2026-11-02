// « RANCUNE » — sensibilisation au pardon (style bonhommes, 16:9, ~62 s).
// Deux frères inséparables. Une dispute pour presque rien. Chacun porte sa pierre de rancune,
// qui grossit avec les années et les éloigne. Jusqu'au jour où l'un des deux la pose.
import { PI, clamp, range, lerp, ease, eout, fade, figure, walkPose, mixPose, HOR, depthY, depthS, stage, actor, caption, mixC } from '../engine/bonhomme.js';

export const world = 'flat', fps = 24, duration = 62, width = 1920, height = 1080;
export const title = 'RANCUNE';
const T = { kids: 0, fight: 6, apart: 12, years: 22, mother: 32, drop1: 40, drop2: 47, hug: 50, end: 58.4 };

export const CUES = [
  ['piano', 0.2, { theme: 'main', until: 6.2 }], ['argue', 7.2, { dur: 3.6 }], ['thud', 10.8], ['thud', 11.2],
  ['piano', 6.4, { theme: 'tension', until: 12.2 }], ['steps', 12.4, { dur: 4 }], ['clockFast', 18, { dur: 4 }],
  ['piano', 12, { theme: 'partir', until: 32.2 }], ['piano', 32, { theme: 'deuil', until: 40.2 }],
  ['thud', 41.4], ['breath', 42, { dur: 2.5 }], ['thud', 48.4], ['steps', 49, { dur: 1.8 }],
  ['piano', 40.2, { theme: 'main', until: 50.2 }], ['piano', 50, { theme: 'fin', until: 61.8 }],
];

const A = '#ffd9a8', B = '#cfe0ff', MUM = '#ffe9c4';
// pierre de rancune portée à deux mains
function stone(ctx, p, r, a = 1) { if (a <= 0 || r <= 1) return; ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#26272e'; ctx.strokeStyle = 'rgba(150,155,170,0.75)'; ctx.lineWidth = 3;
  ctx.beginPath(); for (let i = 0; i < 9; i++) { const ang = (i / 9) * PI * 2, rr = r * (0.86 + ((i * 37) % 11) / 60); ctx.lineTo(p[0] + Math.cos(ang) * rr, p[1] + Math.sin(ang) * rr * 0.85); } ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(120,125,140,0.5)'; ctx.beginPath(); ctx.moveTo(p[0] - r * 0.4, p[1] - r * 0.2); ctx.lineTo(p[0] + r * 0.1, p[1] + r * 0.1); ctx.lineTo(p[0] + r * 0.3, p[1] - r * 0.3); ctx.stroke(); ctx.restore(); }
function ball(ctx, x, y, r) { ctx.save(); ctx.fillStyle = '#ff9a5a'; ctx.shadowColor = '#ff9a5a'; ctx.shadowBlur = 14; ctx.beginPath(); ctx.arc(x, y - r, r, 0, PI * 2); ctx.fill(); ctx.restore(); }

export function build({ ctx, begin, W, H }) {
  return (t) => {
    begin();
    const grown = ease(range(t, T.fight - 0.5, T.fight + 1.2));
    const stoneR = t < 10.8 ? 0 : lerp(30, 120, ease(range(t, 11, T.mother + 4)));
    const drop1 = ease(range(t, T.drop1 + 0.8, T.drop1 + 1.6)), drop2 = ease(range(t, T.drop2 + 0.8, T.drop2 + 1.6));
    const weight = (dropped) => (stoneR / 120) * (1 - dropped);
    const dim = (dropped) => ease(range(t, T.apart, T.mother + 6)) * (1 - ease(range(t, T.drop1 + 1, T.hug + 2))) * (1 - dropped * 0.6);
    stage(ctx, W, H, lerp(1, 0.6, dim(0)), t > T.hug ? ease(range(t, T.hug, T.hug + 2)) * 0.8 : 0);
    // positions : ensemble → éloignés → se rapprochent
    const apart = ease(range(t, T.apart, T.years + 2)) * (1 - ease(range(t, T.drop2 + 1.2, T.hug + 1)));
    const comeA = ease(range(t, T.drop1 + 2, T.drop2 + 2)) * 0.45; // le premier fait déjà la moitié du chemin
    const xA = lerp(lerp(840, 260, apart), 760, comeA * (t < T.drop2 + 1.2 ? 1 : 0)) , xB = lerp(1080, 1660, apart);
    const hug = ease(range(t, T.hug - 0.6, T.hug + 0.8));
    const fxA = t >= T.drop2 + 1.2 ? lerp(xA, 800, ease(range(t, T.drop2 + 1.2, T.hug))) : xA;
    const fxB = t >= T.drop2 + 1.2 ? lerp(xB, 1120, ease(range(t, T.drop2 + 1.2, T.hug))) : xB;
    const h = lerp(320, 520, grown);
    // ---- la mère, au milieu, qui attend (à partir des années) ----
    if (t > T.years - 1) {
      const mk = fade(t, T.years - 1, T.years + 1, 99, 100);
      const age = ease(range(t, T.years, T.mother + 6)) * (1 - ease(range(t, T.hug, T.hug + 3)) * 0.6);
      const wait = { legF: [1.5, 1.45], legB: [1.42, 1.4], lean: lerp(0.05, 0.35, age), head: lerp(0, 0.4, age), armF: [t > T.mother + 2 && t < T.hug ? 1.4 : 0.9, 0.4], armB: [t > T.mother + 2 && t < T.hug ? 1.4 : 0.8, 0.5] };
      const hugP = { lean: 0, head: -0.1, armF: [PI * 0.6, 0.3], armB: [PI * 0.6, 0.3], legF: [0.05, 0.05], legB: [-0.05, 0.05] };
      ctx.save(); ctx.globalAlpha = mk;
      actor(ctx, 960, lerp(0.6, 0.8, ease(range(t, T.hug, T.hug + 1.5))), 430, t > T.hug ? mixPose(wait, hugP, ease(range(t, T.hug, T.hug + 1.5))) : wait, { color: mixC(MUM, '#7a7680', age * 0.6), glow: lerp(16, 6, age) });
      // deux chaises vides à ses côtés
      if (t < T.hug + 1) [[820, 0.6], [1100, 0.6]].forEach(([cx, cd]) => { const y = depthY(cd), s = depthS(cd); ctx.strokeStyle = 'rgba(190,195,210,0.5)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx - 40 * s, y - 120 * s); ctx.lineTo(cx + 40 * s, y - 120 * s); ctx.moveTo(cx + 40 * s, y - 120 * s); ctx.lineTo(cx + 40 * s, y); ctx.moveTo(cx - 40 * s, y - 120 * s); ctx.lineTo(cx - 40 * s, y); ctx.moveTo(cx - 40 * s, y - 120 * s); ctx.lineTo(cx - 40 * s, y - 230 * s); ctx.stroke(); });
      ctx.restore();
    }
    // ---- les deux frères ----
    const brother = (who, x, flip, dropped, dropT) => {
      let pose;
      if (t < T.fight) pose = { armF: [1.4 + Math.sin(t * 6 + (who === 'A' ? 0 : 2)) * 0.4, 0.3], armB: [0.4, 0.3], bob: -Math.abs(Math.sin(t * 6 + (who === 'A' ? 0 : 1))) * 0.03 };
      else if (t < 10.8) pose = { lean: 0.1, armF: [1.3 + Math.sin(t * 9 + (who === 'A' ? 0 : 1.5)) * 0.5, 0.4], armB: [0.6, 0.6] }; // dispute
      else {
        const w = weight(dropped);
        const moving = (t > T.apart && t < T.years + 2) || (who === 'A' && t > T.drop1 + 2 && t < T.drop2 + 2) || (t > T.drop2 + 1.2 && t < T.hug);
        const carry = { lean: 0.15 + w * 0.45, head: 0.2 + w * 0.3, armF: [1.25 - w * 0.3, 1.0], armB: [1.2 - w * 0.3, 1.1] };
        pose = moving ? mixPose(walkPose(t * (3.2 + (1 - w) * 1.2), 0.7), dropped > 0.5 ? {} : carry, dropped > 0.5 ? 0 : 0.7) : carry;
        if (dropped > 0) pose = mixPose(pose, moving ? walkPose(t * 4.4) : { lean: 0, head: -0.05, armF: [0.3, 0.3], armB: [0.2, 0.3] }, dropped);
        if (t > T.hug - 0.6) pose = mixPose(pose, { lean: 0.05, head: 0.05, armF: [1.6, 0.5], armB: [1.5, 0.6], legF: [0.05, 0.05], legB: [-0.05, 0.05] }, hug);
      }
      const col = mixC(who === 'A' ? A : B, '#55575f', dim(dropped) * 0.8);
      const hh = actor(ctx, x, 0.78, h, pose, { color: col, glow: lerp(20, 4, dim(dropped)), flip });
      // la pierre : dans les bras, puis posée au sol
      if (t > 10.8) {
        if (dropT >= 1) return hh; // posée : dessinée à part, à sa place
        const held = [x + flip * (50 + stoneR * 0.75) * depthS(0.78), depthY(0.78) - h * depthS(0.78) * 0.5];
        const ground = [x + flip * 160, depthY(0.78) - stoneR * 0.8];
        const k = dropT;
        stone(ctx, k > 0 ? [lerp(held[0], ground[0] + (who === 'A' && t > T.drop1 + 2 ? (xA - x) : 0), k), lerp(held[1], ground[1], k * k)] : held, stoneR * depthS(0.78), 1 - range(t, T.hug + 2, T.hug + 4));
      }
      return hh;
    };
    // la pierre de A reste à l'endroit où il l'a posée
    const dropPosA = lerp(840, 260, ease(range(T.drop1, T.apart, T.years + 2)));
    if (t > T.drop1 + 1.6) { stone(ctx, [dropPosA + 160, depthY(0.78) - stoneR * 0.8], stoneR * depthS(0.78), 1 - range(t, T.hug + 2, T.hug + 4)); }
    brother('A', t > T.drop1 + 1.6 ? fxA : xA, 1, drop1, t > T.drop1 + 1.6 ? 2 : drop1);
    if (t > T.drop2 + 1.6) { stone(ctx, [1660 - 160, depthY(0.78) - stoneR * 0.8], stoneR * depthS(0.78), 1 - range(t, T.hug + 2, T.hug + 4)); }
    brother('B', fxB, -1, drop2, t > T.drop2 + 1.6 ? 2 : drop2);
    // enfants qui jouent au ballon au début (eux) et à la fin (leurs enfants)
    if (t < T.fight) ball(ctx, lerp(880, 1040, (Math.sin(t * 3) + 1) / 2), depthY(0.78) - Math.abs(Math.sin(t * 6)) * 60, 18);
    if (t > T.hug + 2) { const k = (Math.sin(t * 3) + 1) / 2; [[700, 1], [1220, -1]].forEach(([cx, f], i) => actor(ctx, cx, 0.88, 320, { armF: [1.4 + Math.sin(t * 6 + i * 2) * 0.4, 0.3], bob: -Math.abs(Math.sin(t * 6 + i)) * 0.03 }, { color: i ? B : A, glow: 18, flip: f })); ball(ctx, lerp(760, 1160, k), depthY(0.88) - Math.abs(Math.sin(t * 6)) * 70, 18); }
    // textes
    caption(ctx, W, 'Deux frères. Inséparables.', fade(t, 0.8, 2, 5.2, 6));
    caption(ctx, W, 'Un jour, une dispute.\nPour presque rien.', fade(t, 6.8, 8, 11, 11.8));
    caption(ctx, W, 'Chacun a gardé sa pierre', fade(t, 12.6, 13.8, 17, 17.8));
    caption(ctx, W, 'Les années ont passé.\nLa pierre a grossi.', fade(t, 18.2, 19.4, 23.4, 24.2));
    caption(ctx, W, 'Mariages, naissances, fêtes…\nJamais ensemble.', fade(t, 24.8, 26, 30.8, 31.8));
    caption(ctx, W, 'Leur mère n’attendait\nqu’une seule chose', fade(t, 32.6, 33.8, 38.6, 39.6));
    caption(ctx, W, 'Un jour, l’un des deux\na posé sa pierre', fade(t, 40.6, 41.8, 46.2, 47));
    caption(ctx, W, 'Et l’autre aussi', fade(t, 47.6, 48.6, 50.6, 51.4));
    caption(ctx, W, 'Pardonner, c’est d’abord\nse libérer soi-même', fade(t, 52, 53.2, 57.6, 58.3));
    if (t > T.end) { ctx.fillStyle = `rgba(0,0,0,${range(t, T.end, T.end + 0.8)})`; ctx.fillRect(0, 0, W, H); if (t > T.end + 0.8) { caption(ctx, W, 'Appelle celui à qui tu ne parles plus.', fade(t, 59.3, 59.9, 61.3, 61.9), 440, 48); caption(ctx, W, 'Rancune', fade(t, 59.9, 60.5, 61.3, 61.9) * 0.7, 700, 34); } }
  };
}
