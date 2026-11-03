// « LA PAROLE » — sensibilisation à la rumeur et au partage sur les réseaux (style bonhommes, 16:9, ~62 s).
// Une phrase fausse écrite sur une fille passe de téléphone en téléphone ; chaque partage éteint sa lumière.
// Jusqu'à ce qu'un garçon refuse de partager et aille s'asseoir à côté d'elle.
import { PI, clamp, range, lerp, ease, eout, fade, walkPose, mixPose, depthY, depthS, stage, actor, caption, mixC } from '../engine/bonhomme.js';

export const world = 'flat', fps = 24, duration = 62, width = 1920, height = 1080;
export const title = 'LA PAROLE';
const T = { joy: 0, write: 6, share: 12, curl: 30, boy: 37.5, refuse: 42.5, walk: 45, rise: 53, end: 58.4 };

// [x, profondeur, taille, instant du partage, source du message]
const SH = [[300, 0.7, 470, 8.6, -1], [480, 0.55, 420, 13.5, 0], [1460, 0.6, 430, 16, 0], [640, 0.42, 380, 19, 1], [1300, 0.45, 390, 20.5, 2],
  [180, 0.5, 410, 22, 1], [1620, 0.48, 400, 23, 2], [800, 0.3, 340, 24.5, 3], [1150, 0.3, 340, 25.5, 4]];
const BOY = { x: 1720, d: 0.86, H: 500 };
const HERX = 960, HERD = 0.8;

export const CUES = [
  ['piano', 0.2, { theme: 'main', until: 6.2 }], ['laugh', 1.5],
  ['piano', 6.2, { theme: 'tension', until: 30.2 }], ['tick', 7.4], ['tick', 7.8], ['tick', 8.1], ['notif', 8.6],
  ...SH.slice(1).map(([, , , s]) => ['notif', s]), ['laugh', 20.8], ['laugh', 23.4], ['laugh', 26],
  ['heart', 24, { until: 30, from: 70, to: 100 }], ['piano', 30, { theme: 'deuil', until: 37.6 }],
  ['notif', 38.2], ['heart', 38.4, { until: 42.4, from: 70, to: 125 }], ['shatter', 42.5], ['breath', 43.2, { dur: 2 }],
  ['piano', 43.4, { theme: 'main', until: 52.2 }], ['steps', 45.2, { dur: 2.8 }], ['piano', 52, { theme: 'fin', until: 61.8 }],
];

const HER = '#ffd2ec', BOYC = '#cfe0ff', PEOPLE = '#aab0c0', SCREEN = '#9cc4ff', RUM = '#ff8f9c';

// bulle de message (la rumeur)
function bubble(ctx, x, y, s = 1, a = 1, col = RUM) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(20,12,16,0.9)'; ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.shadowColor = col; ctx.shadowBlur = 16;
  ctx.beginPath(); ctx.roundRect(-38, -24, 76, 44, 16); ctx.moveTo(-14, 20); ctx.lineTo(-24, 34); ctx.lineTo(-2, 20); ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0; ctx.fillStyle = col; for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.arc(i * 16, -2, 5, 0, PI * 2); ctx.fill(); }
  ctx.restore();
}
function phone(ctx, p, a = 1, lit = 1) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = mixC('#3a4050', '#d6e6ff', lit); ctx.shadowColor = SCREEN; ctx.shadowBlur = 18 * lit; ctx.fillRect(p[0] - 8, p[1] - 14, 16, 28); ctx.restore(); }
// compteur de partages (icône de partage + nombre)
function counter(ctx, n, a) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = RUM; ctx.fillStyle = RUM; ctx.lineWidth = 4; ctx.shadowColor = RUM; ctx.shadowBlur = 12;
  const x = 1640, y = 120; ctx.beginPath(); ctx.arc(x, y, 18, PI * 0.15, PI * 1.6); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + 6, y - 26); ctx.lineTo(x + 20, y - 14); ctx.lineTo(x + 2, y - 8); ctx.fill();
  ctx.font = "600 44px 'Courier New', monospace"; ctx.textAlign = 'left'; ctx.fillText(n.toLocaleString('fr-FR').replace(/ | /g, ' '), x + 36, y + 15); ctx.restore();
}

export function build({ ctx, begin, W, H }) {
  return (t) => {
    begin();
    const nShared = SH.filter(([, , , s]) => t > s).length;
    const back = ease(range(t, T.walk + 2.8, T.walk + 7)); // sa lumière revient
    const dim = clamp(nShared / SH.length + range(t, T.curl, T.boy) * 0.15) * (1 - back);
    stage(ctx, W, H, lerp(1, 0.55, dim), t > T.rise ? ease(range(t, T.rise, T.rise + 2)) * 0.7 : 0);
    const phones = [];
    // les autres : amis d'abord, puis spectateurs derrière leurs téléphones
    SH.forEach(([x, d, h, s], i) => {
      const flip = x < HERX ? 1 : -1, lower = T.refuse + 1.5 + i * 0.45;
      let p = t < T.write ? { armF: [PI * 0.55 + Math.sin(t * 5 + i) * 0.35, 0.3], armB: [0.2, 0.3], bob: -Math.abs(Math.sin(t * 6 + i)) * 0.012 } : { armF: [0.3, 0.3], armB: [0.15, 0.3] };
      const hold = ease(range(t, s - 0.6, s - 0.1));
      if (hold > 0) p = mixPose(p, { armF: [2.0, 0.9], armB: [0.2, 0.3], head: 0.2 }, hold);
      if (t > s + 0.8 && t < T.refuse && i % 2 === 1) p = mixPose(p, { armB: [1.55, 0.05], bob: -Math.abs(Math.sin(t * 10)) * 0.015, head: -0.1 }, ease(range(t, s + 0.8, s + 1.6))); // il la montre du doigt
      const lk = ease(range(t, lower, lower + 1.2));
      if (lk > 0) p = mixPose(p, { armF: [0.2, 0.2], armB: [0.1, 0.2], head: 0.35, lean: 0.06, bob: 0 }, lk);
      const a = actor(ctx, x, d, h, p, { color: PEOPLE, glow: 6, flip, alpha: lerp(0.8, 0.45, clamp((0.75 - d) / 0.45)) });
      if (hold > 0) phones[i] = { p: a.hand, a: hold * (1 - lk), lit: t > s - 0.2 ? 1 : 0.4, head: a.head };
    });
    // le garçon (à droite, au premier plan)
    const walkK = ease(range(t, T.walk, T.walk + 2.8));
    const bx = lerp(BOY.x, HERX + 230, walkK), bd = lerp(BOY.d, HERD + 0.01, walkK);
    let bp = t < T.write ? { armF: [PI * 0.55 + Math.sin(t * 5 + 3) * 0.35, 0.3], armB: [0.2, 0.3] } : { armF: [0.3, 0.3], armB: [0.15, 0.3], head: 0.1 };
    const bh = ease(range(t, T.boy, T.boy + 0.6)) * (1 - ease(range(t, T.refuse + 0.4, T.refuse + 1.4)));
    if (bh > 0) bp = mixPose(bp, { armF: [2.0, 0.9], armB: [0.2, 0.3], head: 0.25 }, bh);
    if (t > T.walk && t < T.walk + 2.8) bp = walkPose(t * 4.2);
    const sitK = ease(range(t, T.walk + 2.8, T.walk + 4)) * (1 - ease(range(t, T.rise, T.rise + 1.5)));
    if (sitK > 0) bp = mixPose(bp, { kneel: 1, lean: 0.2, head: 0.1, armF: [1.2, 0.6], armB: [0.4, 0.5] }, sitK);
    if (t > T.rise) bp = mixPose(bp, { kneel: 0, lie: 0, lean: 0, head: -0.05, armF: [1.3, 0.2], armB: [0.2, 0.3], legF: [0.05, 0.05], legB: [-0.05, 0.05] }, ease(range(t, T.rise, T.rise + 1.5)));
    const boy = actor(ctx, bx, bd, BOY.H, bp, { color: BOYC, glow: 20, flip: -1 });
    // elle, au centre
    let hp = t < T.write ? { armF: [PI * 0.7 + Math.sin(t * 5) * 0.3, 0.2], armB: [PI * 0.62 - Math.sin(t * 5) * 0.3, 0.2], bob: -Math.abs(Math.sin(t * 6)) * 0.02 } : { armF: [0.3, 0.3], armB: [0.15, 0.3] };
    if (t > T.share) hp = mixPose(hp, { armF: [0.5, 1.2], armB: [0.4, 1.2], head: 0.25 + Math.sin(t * 1.3) * 0.1 }, ease(range(t, T.share, T.share + 4)) * clamp(nShared / 3));
    const curl = ease(range(t, T.curl - 1, T.curl + 1.2)) * (1 - ease(range(t, T.rise, T.rise + 1.5)));
    if (curl > 0) hp = mixPose(hp, { kneel: 1, lean: 0.55, head: 0.45 - back * 0.4, armF: [0.9, 1.6], armB: [0.8, 1.7] }, curl);
    if (t > T.rise) hp = mixPose(hp, { kneel: 0, lie: 0, lean: 0, head: -0.05, armF: [1.3, 0.2], armB: [0.2, 0.3], legF: [0.05, 0.05], legB: [-0.05, 0.05] }, ease(range(t, T.rise, T.rise + 1.5)));
    const her = actor(ctx, HERX, HERD, 480, hp, { color: mixC(HER, '#4a4650', dim), glow: lerp(24, 3, dim), flip: 1 });
    // téléphones et rumeur qui circule
    phones.forEach((ph) => ph && phone(ctx, ph.p, ph.a, ph.lit));
    if (bh > 0) phone(ctx, boy.hand, bh, 1);
    SH.forEach(([, , , s, src], i) => {
      if (!phones[i]) return;
      if (src < 0) { const k = range(t, s - 0.4, s + 0.4); if (t > s - 0.4 && t < T.share) bubble(ctx, phones[i].p[0], phones[i].p[1] - 50 - k * 20, 0.4 + k * 0.6, eout(k)); return; }
      const A = phones[src]?.p, B = phones[i].p; if (!A) return;
      const k = range(t, s - 1, s);
      if (k > 0 && k < 1) bubble(ctx, lerp(A[0], B[0], ease(k)), lerp(A[1], B[1], ease(k)) - 50 - Math.sin(k * PI) * 160, 0.8, 1);
      if (t > s && t < s + 1.2) bubble(ctx, B[0], B[1] - 50, 0.8, 1 - range(t, s + 0.6, s + 1.2)); // reçu, puis repart
    });
    // les bulles s'accumulent autour d'elle
    const swarm = Math.min(nShared, SH.length) * (1 - ease(range(t, T.refuse, T.walk + 3)));
    for (let j = 0; j < Math.floor(swarm + 0.999); j++) {
      const a = clamp(swarm - j) * 0.85, ang = t * 0.5 + j * 2.4, r = 150 + (j % 3) * 50;
      bubble(ctx, her.head[0] + Math.cos(ang) * r * 1.3, her.head[1] - 20 + Math.sin(ang) * r * 0.55, 0.6, a);
    }
    // le message arrive chez lui ; il ne le partage pas : la bulle se brise
    if (t > T.boy && t < T.refuse) { const k = eout(range(t, T.boy + 0.4, T.boy + 1)), p = boy.hand; bubble(ctx, p[0] - 10, p[1] - 70 - k * 20, 0.6 + k * 0.5 + Math.sin(t * 4) * 0.03, k); }
    if (t > T.refuse && t < T.refuse + 1.5) {
      const k = range(t, T.refuse, T.refuse + 1.5), c = [boy.hand[0] - 10, boy.hand[1] - 90]; ctx.save(); ctx.fillStyle = RUM; ctx.shadowColor = RUM; ctx.shadowBlur = 10;
      for (let j = 0; j < 14; j++) { const an = j * 0.9 + 0.3, dd = eout(k) * (60 + (j % 4) * 30); ctx.globalAlpha = 1 - k; ctx.beginPath(); ctx.arc(c[0] + Math.cos(an) * dd, c[1] + Math.sin(an) * dd + k * k * 80, 4 + (j % 3), 0, PI * 2); ctx.fill(); }
      ctx.restore();
    }
    counter(ctx, Math.floor(Math.pow(10, range(t, T.share, T.boy) * 4.6)) + (t > T.share ? nShared : 0), fade(t, T.share + 0.5, T.share + 1.2, T.refuse, T.refuse + 1.2));
    // textes
    caption(ctx, W, 'Elle riait avec tout le monde', fade(t, 0.8, 2, 5.2, 6));
    caption(ctx, W, 'Un jour, quelqu’un a écrit\nune phrase sur elle', fade(t, 6.6, 7.6, 11.4, 12.2));
    caption(ctx, W, 'Ce n’était pas vrai.', fade(t, 12.8, 13.6, 17, 17.8));
    caption(ctx, W, 'Mais tout le monde l’a partagée', fade(t, 18.2, 19.2, 23.4, 24.2));
    caption(ctx, W, 'Chaque partage éteignait\nun peu sa lumière', fade(t, 24.6, 25.6, 29.4, 30.2));
    caption(ctx, W, 'Personne ne savait si c’était vrai.\nPersonne n’a demandé.', fade(t, 30.8, 31.8, 36.4, 37.2));
    caption(ctx, W, 'Puis le message est arrivé chez lui', fade(t, 37.8, 38.6, 41.4, 42.2));
    caption(ctx, W, 'Il n’a pas partagé.', fade(t, 42.6, 43.4, 46.6, 47.4), 130, 50);
    caption(ctx, W, 'Il est allé s’asseoir à côté d’elle', fade(t, 47.8, 48.6, 51.8, 52.6));
    caption(ctx, W, 'Avant de partager,\ndemande-toi : et si c’était toi ?', fade(t, 53, 54.2, 57.6, 58.3));
    if (t > T.end) { ctx.fillStyle = `rgba(0,0,0,${range(t, T.end, T.end + 0.8)})`; ctx.fillRect(0, 0, W, H); if (t > T.end + 0.8) { caption(ctx, W, 'Réfléchis avant de partager.', fade(t, 59.3, 59.9, 61.3, 61.9), 440, 50); caption(ctx, W, 'La Parole', fade(t, 59.9, 60.5, 61.3, 61.9) * 0.7, 700, 34); } }
  };
}
