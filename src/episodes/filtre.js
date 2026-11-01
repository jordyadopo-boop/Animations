// « FILTRE » — sensibilisation à l'image de soi et aux réseaux sociaux (style bonhommes, 16:9, ~62 s).
// Elle brillait d'une lumière chaude. Pour plaire, elle ajoute des filtres… jusqu'à devenir transparente.
// Son reflet, lui, se souvient d'elle. Elle enlève tout.
import { PI, clamp, range, lerp, ease, eout, fade, figure, walkPose, mixPose, HOR, depthY, depthS, stage, actor, caption, mixC } from '../engine/bonhomme.js';

export const world = 'flat', fps = 24, duration = 62, width = 1920, height = 1080;
export const title = 'FILTRE';
const T = { self: 0, others: 6, filters: 14, vanish: 24, mirror: 32, peel: 40, friends: 50, end: 58.4 };

export const CUES = [
  ['piano', 0.2, { theme: 'main', until: 6.2 }], ['notif', 7.0], ['word', 8.6], ['word', 10.2], ['word', 11.8],
  ['piano', 6, { theme: 'tension', until: 14.2 }], ['twinkle', 14.6], ['twinkle', 17.4], ['twinkle', 20.2],
  ...Array.from({ length: 10 }, (_, i) => ['notif', 15 + i * 0.8]), ['piano', 14, { theme: 'partir', until: 32.2 }],
  ['drone', 24, { until: 30 }], ['piano', 32, { theme: 'deuil', until: 40.2 }],
  ['shatter', 41.2], ['shatter', 43], ['shatter', 44.6], ['breath', 46, { dur: 2.5 }], ['piano', 40, { theme: 'main', until: 50.2 }],
  ['piano', 50, { theme: 'fin', until: 61.8 }],
];

const WARM = '#ffcf8a', FAKE = '#ff9ee6';
const COMMENTS = [[8.4, 'Trop grosse'], [10.0, 'Pas jolie'], [11.6, 'Change de tête']];
const FILTERS = [15, 17.8, 20.6];

// téléphone tenu en selfie + compteur de likes
function selfie(ctx, p, likes, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#cfe2ff'; ctx.shadowColor = '#7fb2ff'; ctx.shadowBlur = 22; ctx.fillRect(p[0] - 14, p[1] - 26, 28, 48); ctx.restore();
  if (likes) { ctx.save(); ctx.globalAlpha = a; ctx.font = "600 34px 'Courier New', monospace"; ctx.fillStyle = '#ff6b8a'; ctx.textAlign = 'center'; ctx.shadowColor = '#ff6b8a'; ctx.shadowBlur = 12; ctx.fillText(`♥ ${likes}`, p[0], p[1] - 50); ctx.restore(); }
}
function comment(ctx, x, y, text, a) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.font = "500 32px 'Courier New', monospace"; const w = ctx.measureText(text).width + 40; ctx.fillStyle = 'rgba(30,12,16,0.9)'; ctx.strokeStyle = 'rgba(255,90,90,0.85)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(x - w / 2, y, w, 56, 16); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#ff6b6b'; ctx.textAlign = 'center'; ctx.fillText(text, x, y + 38); ctx.restore(); }
// masque de filtre : éclats roses, couronne, « oreilles » brillantes sur la tête
function filterMask(ctx, head, n, a, peel = 0) {
  if (a <= 0 || n <= 0) return; ctx.save(); ctx.globalAlpha = a * (1 - peel);
  const [x, y] = head;
  if (n >= 1) { ctx.fillStyle = 'rgba(255,170,230,0.55)'; ctx.shadowColor = FAKE; ctx.shadowBlur = 20; ctx.beginPath(); ctx.arc(x, y + peel * 200, 46, 0, PI * 2); ctx.fill(); }
  if (n >= 2) { ctx.fillStyle = FAKE; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(x - 36 + i * 36, y - 50 + peel * 260); ctx.lineTo(x - 26 + i * 36, y - 86 + peel * 260); ctx.lineTo(x - 16 + i * 36, y - 50 + peel * 260); ctx.fill(); } }
  if (n >= 3) { ctx.fillStyle = 'rgba(255,255,255,0.9)'; for (let i = 0; i < 10; i++) { const a2 = i / 10 * PI * 2 + performance.now() * 0; ctx.beginPath(); ctx.arc(x + Math.cos(a2) * 70, y + Math.sin(a2) * 70 + peel * 300, 4, 0, PI * 2); ctx.fill(); } }
  ctx.restore();
}

export function build({ ctx, begin, W, H }) {
  return (t) => {
    begin();
    stage(ctx, W, H, 1, t > T.friends ? ease(range(t, T.friends, T.friends + 2)) * 0.7 : 0);
    const nF = FILTERS.filter((x) => t > x).length;
    const fade1 = ease(range(t, T.filters, T.vanish + 4)) * (1 - ease(range(t, T.peel + 1, T.peel + 6))); // 0 = elle-même, 1 = « filtrée » et transparente
    const vanish = ease(range(t, T.vanish, T.vanish + 4)) * (1 - ease(range(t, T.peel + 1, T.peel + 5)));
    const col = mixC(WARM, FAKE, Math.min(1, fade1 * 1.3));
    const peel = range(t, T.peel + 0.6, T.peel + 5);
    const x = 960, d = 0.8;
    // le reflet : il garde sa vraie couleur (dessiné à part, au sol)
    const holding = t < T.peel + 0.5;
    const pose = holding ? { armF: [2.35, 0.55], armB: [0.3, 0.3], head: -0.15, lean: -0.03 } : t < T.friends ? mixPose({ armF: [0.3, 0.3], head: 0.3 }, { armF: [PI * 0.75, 0.2], armB: [PI * 0.7, 0.2], head: -0.15 }, ease(range(t, T.peel + 5, T.peel + 7))) : { armF: [PI * 0.7 + Math.sin(t * 4) * 0.1, 0.2], armB: [PI * 0.65, 0.2], bob: -Math.abs(Math.sin(t * 4)) * 0.01 };
    // ombre / reflet au sol : sa vraie couleur, de plus en plus visible quand elle disparaît
    const y = depthY(d), h = 500 * depthS(d);
    ctx.save(); ctx.beginPath(); ctx.rect(0, y, W, H); ctx.clip(); ctx.translate(0, 2 * y); ctx.scale(1, -1); ctx.globalAlpha = 0.22 + 0.5 * fade(t, T.mirror, T.mirror + 2, T.peel + 3, T.peel + 6); figure(ctx, x, y, h, pose, { color: WARM, glow: 14 * fade(t, T.mirror, T.mirror + 2, T.peel + 3, T.peel + 6) }); ctx.restore();
    // elle
    const body = figure(ctx, x, y, h, pose, { color: col, glow: lerp(24, 6, vanish), alpha: lerp(1, 0.14, vanish) });
    if (vanish > 0.2) { ctx.save(); ctx.globalAlpha = vanish * 0.8; ctx.strokeStyle = 'rgba(255,190,240,0.7)'; ctx.lineWidth = 2; ctx.setLineDash([6, 8]); ctx.beginPath(); ctx.arc(body.head[0], body.head[1], 30, 0, PI * 2); ctx.stroke(); ctx.restore(); }
    filterMask(ctx, body.head, nF, 1 - vanish * 0.5, peel);
    // éclats des filtres qui tombent
    if (peel > 0 && peel < 1) { ctx.save(); ctx.fillStyle = FAKE; ctx.shadowColor = FAKE; ctx.shadowBlur = 10; for (let i = 0; i < 24; i++) { const k = clamp(peel * 1.6 - i * 0.02); ctx.globalAlpha = 1 - k; ctx.fillRect(x - 120 + (i * 37) % 240, body.head[1] + k * 520 + (i % 5) * 20, 9, 9); } ctx.restore(); }
    // téléphone + likes
    const likes = t < T.others ? '12' : t < T.filters ? '9' : t < T.vanish + 4 ? `${Math.round(lerp(40, 12000, ease(range(t, T.filters, T.vanish + 3))))}`.replace(/(\d)(?=(\d{3})+$)/g, '$1 ') : null;
    if (holding) selfie(ctx, body.hand, likes, 1 - range(t, T.peel, T.peel + 0.5));
    if (t > T.peel && t < T.peel + 2) { const k = eout(range(t, T.peel, T.peel + 0.8)); selfie(ctx, [lerp(body.hand[0], body.hand[0] + 60, k), lerp(body.hand[1], depthY(d) - 20, k)], null, 1 - range(t, T.peel + 1.2, T.peel + 2)); }
    // commentaires blessants
    COMMENTS.forEach(([t0, txt], i) => comment(ctx, 1380 + (i % 2) * 120, 300 + i * 90, txt, fade(t, t0, t0 + 0.3, 13.4, 14)));
    // les autres « parfaits » (écrans) au début
    if (t > T.others && t < T.filters + 1) [[360, 0.62], [560, 0.58], [1500, 0.6]].forEach(([fx, fd], i) => { ctx.save(); ctx.globalAlpha = fade(t, T.others, T.others + 1, T.filters, T.filters + 1); actor(ctx, fx, fd, 470, { armF: [2.3, 0.5], head: -0.15 }, { color: FAKE, glow: 26, flip: fx < 960 ? 1 : -1 }); ctx.restore(); });
    // les amis qui l'entourent à la fin
    if (t > T.friends - 1) [[620, 0.72, 1], [760, 0.68, 1], [1160, 0.68, -1], [1300, 0.72, -1]].forEach(([fx, fd, f], i) => { const k = ease(range(t, T.friends - 1 + i * 0.3, T.friends + 1 + i * 0.3)); actor(ctx, lerp(fx - f * 700, fx, k), fd, 460, k < 1 ? walkPose(t * 4 + i) : { armF: [PI * 0.6, 0.2], armB: [0.3, 0.3], bob: -Math.abs(Math.sin(t * 5 + i)) * 0.015 }, { color: '#ffe9c4', glow: 20, flip: f }); });
    // textes
    caption(ctx, W, 'Elle se trouvait belle', fade(t, 0.8, 2, 5.2, 6));
    caption(ctx, W, 'Puis elle a lu les commentaires', fade(t, 6.8, 8, 12.8, 13.8));
    caption(ctx, W, 'Un filtre. Puis un autre.\nPour plaire.', fade(t, 15, 16.2, 22.4, 23.4));
    caption(ctx, W, 'À force de plaire,\nelle a disparu', fade(t, 25, 26.2, 30.6, 31.6));
    caption(ctx, W, 'Mais son reflet\nse souvenait d’elle', fade(t, 33, 34.2, 38.8, 39.8));
    caption(ctx, W, 'Alors elle a tout enlevé', fade(t, 41, 42.2, 48.4, 49.4));
    caption(ctx, W, 'Tu n’as pas besoin\nde filtre pour briller', fade(t, 51, 52.2, 57.6, 58.3));
    if (t > T.end) { ctx.fillStyle = `rgba(0,0,0,${range(t, T.end, T.end + 0.8)})`; ctx.fillRect(0, 0, W, H); if (t > T.end + 0.8) { caption(ctx, W, 'Tu es assez. Comme tu es.', fade(t, 59.3, 59.9, 61.3, 61.9), 440, 52); caption(ctx, W, 'Filtre', fade(t, 59.9, 60.5, 61.3, 61.9) * 0.7, 700, 34); } }
  };
}
