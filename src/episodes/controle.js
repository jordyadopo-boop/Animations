// « IL T'AIME ? » — sensibilisation à la jalousie et au contrôle dans le couple (style bonhommes, 16:9, ~62 s).
// Chaque contrôle devient un fil rouge entre sa main à lui et elle. Elle finit marionnette… puis coupe les fils.
import { PI, clamp, range, lerp, ease, eout, fade, figure, walkPose, mixPose, HOR, depthY, depthS, stage, actor, caption, mixC } from '../engine/bonhomme.js';

export const world = 'flat', fps = 24, duration = 62, width = 1920, height = 1080;
export const title = 'IL T’AIME ?';
const T = { love: 0, phone: 6, clothes: 14, friends: 22, puppet: 30, still: 38, cut: 44, free: 52, end: 58.4 };

export const CUES = [
  ['piano', 0.2, { theme: 'main', until: 6.2 }], ['notif', 7.0], ['clench', 8.4], ['clench', 15.6], ['clench', 24.6],
  ['piano', 6, { theme: 'tension', until: 22.2 }], ['piano', 22, { theme: 'partir', until: 38.2 }], ['creak', 31, { dur: 6 }],
  ['heart', 38, { until: 44, from: 60, to: 110 }], ['piano', 38, { theme: 'heritage', until: 44.2 }],
  ['crack', 45.2], ['crack', 46.4], ['crack', 47.6], ['crack', 48.8], ['breath', 49.5, { dur: 2.5 }],
  ['piano', 44.2, { theme: 'main', until: 52.2 }], ['steps', 52.4, { dur: 4 }], ['piano', 52, { theme: 'fin', until: 61.8 }],
];

const HER = '#ffd2ec', HIM = '#d8e2ff', RED = 'rgba(255,70,80,0.95)';
// fils : [instant d'apparition, point d'attache sur elle]
const STRINGS = [[8.6, 'hand'], [15.8, 'head'], [24.8, 'hip'], [30.4, 'foot'], [31.4, 'handB']];
const CUTS = [45.2, 46.4, 47.6, 48.8, 49.6];

export function build({ ctx, begin, W, H }) {
  return (t) => {
    begin();
    const dim = ease(range(t, 8, 40)) * (1 - ease(range(t, T.cut + 2, T.free)));
    stage(ctx, W, H, lerp(1, 0.6, dim), t > T.free ? ease(range(t, T.free, T.free + 2)) * 0.8 : 0);
    const nStr = STRINGS.filter(([s], i) => t > s && !(t > CUTS[i])).length;
    // positions
    const walkTog = t < T.phone;
    const hx = walkTog ? lerp(500, 820, ease(range(t, 0, 5.5))) : 820;
    let sx = walkTog ? hx + 140 : 1140;
    if (t > T.free) sx = lerp(1140, 1700, ease(range(t, T.free, T.end)));
    const sd = 0.78, hd = 0.8;
    // marionnette : ses mouvements suivent la main de l'homme
    const puppet = ease(range(t, T.puppet, T.puppet + 1.5)) * (1 - ease(range(t, T.cut, T.cut + 5)));
    const pull = Math.sin(t * 2.2) * puppet;
    // lui
    let hp = walkTog ? walkPose(t * 4) : { armF: [0.3, 0.3], armB: [0.2, 0.3] };
    if (t > T.phone && t < 9.5) hp = { armF: [1.5, 0.1], armB: [0.3, 0.3], lean: 0.1 }; // il prend son téléphone
    if (t > 9.5 && t < 13) hp = { armF: [2.2, 0.8], armB: [0.3, 0.3], head: 0.25 }; // il lit
    if (t > T.clothes && t < 18) hp = { armF: [1.4 + Math.sin(t * 6) * 0.25, 0.1], armB: [0.3, 0.3] }; // « non, pas ça »
    if (t > T.friends && t < 28) hp = { armF: [1.2, -0.2], armB: [0.3, 0.3], lean: -0.1 }; // il la retient
    if (t > T.puppet && t < T.cut + 3) hp = { armF: [2.3 + pull * 0.3, 0.2], armB: [2.1 - pull * 0.3, 0.3], lean: -0.05 }; // il tire les fils
    if (t > T.cut + 3) hp = mixPose(hp, { armF: [0.2, 0.2], armB: [0.1, 0.2], head: 0.35, lean: 0.1 }, ease(range(t, T.cut + 3, T.cut + 5)));
    const alone = ease(range(t, T.cut + 3, T.free + 2)); // à la fin, il reste seul, éteint
    const him = actor(ctx, hx - alone * 260, hd, 520, hp, { color: mixC(HIM, '#5a5c66', alone), glow: lerp(18, 2, alone), alpha: 1 - alone * 0.35 });
    // elle
    let sp = walkTog ? walkPose(t * 4 + 0.6) : { armF: [0.3, 0.3], armB: [0.2, 0.3] };
    if (t > T.phone && t < 9.5) sp = { armF: [1.3, 0.2], armB: [0.2, 0.3], lean: -0.1 }; // elle tend le téléphone
    if (t > T.friends && t < 28) sp = { armF: [1.4, 0.1], armB: [0.2, 0.3], lean: 0.12, legF: [0.3, 0.2], legB: [-0.2, 0.1] }; // elle veut rejoindre ses amis
    if (puppet > 0.01) sp = mixPose(sp, { armF: [1.6 + pull * 0.9, 0.3], armB: [0.6 - pull * 0.6, 0.3], head: 0.3 + pull * 0.2, legF: [0.2 + pull * 0.3, 0.2], legB: [-0.2, 0.1], bob: -Math.abs(pull) * 0.02 }, puppet);
    if (t > T.still && t < T.cut) sp = mixPose(sp, { armF: [0.1, 0.1], armB: [0.05, 0.1], head: 0.5, lean: 0.1 }, ease(range(t, T.still, T.still + 1.5)));
    if (t > T.cut) sp = mixPose(sp, { armF: [PI * 0.62 + Math.sin(t * 9) * 0.1, 0.2], armB: [PI * 0.6, 0.2], head: -0.1 }, ease(range(t, T.cut, T.cut + 1)));
    if (t > T.free) sp = walkPose(t * 4.2);
    const herCol = mixC(HER, '#5c5a66', dim * 0.8);
    const her = actor(ctx, sx, sd, 480, sp, { color: herCol, glow: lerp(22, 4, dim), flip: t > T.free ? 1 : -1 });
    // ses amis (à droite), qui s'éloignent quand il la retient, reviennent à la fin
    const friendsK = fade(t, 20, 22, 27, 30) + ease(range(t, T.free - 1, T.free + 1));
    if (friendsK > 0) [[1520, 0.7], [1660, 0.66], [1800, 0.72]].forEach(([fx, fd], i) => actor(ctx, fx + (t > 26 && t < 30 ? (t - 26) * 120 : 0) + (t > T.free ? (t - T.free) * 90 : 0), fd, 440, t > T.free ? walkPose(t * 4 + i) : { armF: [PI * 0.7 + Math.sin(t * 5 + i) * 0.3, 0.2] }, { color: '#ffe9c4', glow: 16, alpha: Math.min(1, friendsK), flip: t > T.free ? 1 : -1 }));
    // les fils rouges, de sa main à lui vers elle ; ils cassent un à un
    const anchor = (k) => { const hy = depthY(sd), s = depthS(sd) * 480; const base = { head: her.head, hand: her.hand, hip: [sx, hy - s * 0.5], foot: [sx + 10, hy - 10], handB: [sx - 30, hy - s * 0.55] }; return base[k]; };
    STRINGS.forEach(([s0, where], i) => {
      if (t < s0) return; const k = clamp((t - s0) / 0.6), cut = range(t, CUTS[i], CUTS[i] + 0.8);
      const a = him.hand, b = anchor(where);
      ctx.save(); ctx.strokeStyle = RED; ctx.lineWidth = 3; ctx.shadowColor = '#ff4650'; ctx.shadowBlur = 10; ctx.globalAlpha = 1 - cut;
      if (cut <= 0) { const mx = lerp(a[0], b[0], 0.5), my = Math.min(a[1], b[1]) - 60 + Math.sin(t * 2 + i) * 10; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(mx, my, lerp(a[0], b[0], k), lerp(a[1], b[1], k)); ctx.stroke(); }
      else { const mid = [lerp(a[0], b[0], 0.5), lerp(a[1], b[1], 0.5)]; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(mid[0] - 20, mid[1] + cut * 200); ctx.moveTo(b[0], b[1]); ctx.lineTo(mid[0] + 20, mid[1] + cut * 200); ctx.stroke();
        ctx.fillStyle = '#ffd36b'; for (let j = 0; j < 6; j++) { ctx.globalAlpha = 1 - cut; ctx.beginPath(); ctx.arc(mid[0] + Math.cos(j) * cut * 60, mid[1] + Math.sin(j * 1.7) * cut * 40, 4, 0, PI * 2); ctx.fill(); } }
      ctx.restore();
    });
    // le téléphone qu'il lui prend
    if (t > T.phone && t < 13) { const p = t < 8.6 ? her.hand : him.hand; ctx.save(); ctx.fillStyle = '#cfe2ff'; ctx.shadowColor = '#7fb2ff'; ctx.shadowBlur = 18; ctx.fillRect(p[0] - 9, p[1] - 16, 18, 32); ctx.restore(); }
    // textes
    caption(ctx, W, 'Au début, c’était de l’amour', fade(t, 0.8, 2, 5.2, 6));
    caption(ctx, W, 'Puis il a voulu lire ses messages', fade(t, 6.8, 8, 12.6, 13.6));
    caption(ctx, W, 'Choisir ses vêtements', fade(t, 14.6, 15.6, 20.4, 21.4));
    caption(ctx, W, 'L’éloigner de ses amis', fade(t, 22.6, 23.6, 28.6, 29.6));
    caption(ctx, W, 'Il disait que c’était\nparce qu’il l’aimait', fade(t, 31, 32.2, 37, 38));
    caption(ctx, W, 'Mais l’amour ne tient\npersonne en laisse', fade(t, 38.6, 39.6, 43.2, 44));
    caption(ctx, W, 'Un jour, elle a coupé les fils', fade(t, 45, 46.2, 50.6, 51.6));
    caption(ctx, W, 'L’amour ne contrôle pas.\nIl libère.', fade(t, 53, 54.2, 57.6, 58.3));
    if (t > T.end) { ctx.fillStyle = `rgba(0,0,0,${range(t, T.end, T.end + 0.8)})`; ctx.fillRect(0, 0, W, H); if (t > T.end + 0.8) { caption(ctx, W, 'Si tu te reconnais, parles-en.', fade(t, 59.3, 59.9, 61.3, 61.9), 440, 50); caption(ctx, W, 'Il t’aime ?', fade(t, 59.9, 60.5, 61.3, 61.9) * 0.7, 700, 34); } }
  };
}
