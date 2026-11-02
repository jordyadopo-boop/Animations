// « MISE » — sensibilisation aux paris sportifs et jeux d'argent (style bonhommes, 16:9, ~62 s).
// Une petite pièce, un gain, puis plus. À chaque perte, un morceau de sa vie part sur la table :
// sa moto, son téléphone, ses amis, sa maison… jusqu'à sa propre lumière.
import { PI, clamp, range, lerp, ease, eout, fade, figure, walkPose, mixPose, HOR, depthY, depthS, stage, actor, caption, mixC } from '../engine/bonhomme.js';

export const world = 'flat', fps = 24, duration = 62, width = 1920, height = 1080;
export const title = 'MISE';
const T = { first: 0, win: 5, more: 10, lose: 16, items: 22, all: 34, light: 40, stop: 46, walk: 52, end: 58.4 };

// objets misés puis perdus : [instant, nom, couleur]
const STAKES = [[23, 'moto', '#ffb347'], [26, 'téléphone', '#9cc4ff'], [29, 'amis', '#ffe9c4'], [32, 'maison', '#ffd9a8'], [35, 'famille', '#fff6d8']];
export const CUES = [
  ['piano', 0.2, { theme: 'main', until: 5 }], ['ding', 3.4], ['twinkle', 5.2], ['notif', 6], ['notif', 6.5],
  ['heart', 9.5, { until: 22, from: 80, to: 130 }], ['piano', 9.5, { theme: 'tension', until: 22.2 }], ['ding', 12.2], ['twinkle', 13],
  ['thud', 17.4], ['thud', 19.6], ...STAKES.map(([t]) => ['word', t + 1.4]), ['piano', 22, { theme: 'partir', until: 40.2 }], ['doorClose', 32.8],
  ['drone', 40, { until: 45.8 }], ['heart', 40, { until: 46, from: 120, to: 160 }], ['silence', 46, { dur: 1 }],
  ['steps', 47.2, { dur: 2 }], ['breath', 48, { dur: 2.5 }], ['piano', 46.6, { theme: 'main', until: 52.2 }], ['piano', 52, { theme: 'fin', until: 61.8 }],
];

const GOLD = '#ffd36b', HOUSE = '#9a3a3a';
// la table de jeu (un tapis) et le croupier-maison, sombre, qui ramasse tout
function tableJeu(ctx, a = 1) { ctx.save(); ctx.globalAlpha = a; const y = depthY(0.74) - 200 * depthS(0.74); ctx.fillStyle = 'rgba(40,90,60,0.35)'; ctx.strokeStyle = 'rgba(200,220,205,0.7)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(1000, y, 320, 46, 0, 0, PI * 2); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(800, y + 30); ctx.lineTo(800, depthY(0.74)); ctx.moveTo(1200, y + 30); ctx.lineTo(1200, depthY(0.74)); ctx.stroke(); ctx.restore(); return y; }
function coin(ctx, x, y, r = 14, a = 1) { ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = GOLD; ctx.shadowColor = GOLD; ctx.shadowBlur = 14; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.45, 0, 0, PI * 2); ctx.fill(); ctx.restore(); }
function token(ctx, x, y, label, col, a = 1, s = 1) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.font = `600 ${Math.round(30 * s)}px 'Courier New', monospace`; const w = ctx.measureText(label).width + 40 * s; ctx.fillStyle = 'rgba(15,15,20,0.85)'; ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.shadowColor = col; ctx.shadowBlur = 14; ctx.beginPath(); ctx.roundRect(x - w / 2, y - 26 * s, w, 52 * s, 26 * s); ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0; ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.fillText(label, x, y + 10 * s); ctx.restore(); }

export function build({ ctx, begin, W, H }) {
  return (t) => {
    begin();
    const lost = STAKES.filter(([t0]) => t > t0 + 1.4).length;
    const dark = clamp(range(t, T.lose, T.light + 4)) * (1 - ease(range(t, T.stop + 1, T.walk + 2)));
    stage(ctx, W, H, lerp(1, 0.45, dark), t > T.walk ? ease(range(t, T.walk, T.walk + 2)) * 0.8 : 0);
    const ty = tableJeu(ctx, t < T.stop + 2 ? 1 : 1 - range(t, T.stop + 2, T.stop + 3.5));
    // la « maison » : une grande silhouette rouge sombre derrière la table, qui grandit à mesure qu'il perd
    const houseH = lerp(520, 760, clamp(lost / 5));
    const hk = t < T.stop + 2 ? 1 : 1 - range(t, T.stop + 2, T.stop + 4);
    const collecting = STAKES.some(([t0]) => t > t0 + 1.2 && t < t0 + 2.4) || (t > 17.2 && t < 18.4) || (t > 19.4 && t < 20.6);
    actor(ctx, 1080, 0.6, houseH, { armF: [collecting ? 1.5 : 0.6, collecting ? -0.2 : 0.5], armB: [0.4, 0.4], lean: collecting ? 0.15 : 0 }, { color: HOUSE, glow: 8, flip: -1, alpha: 0.9 * hk });
    // lui
    const me = { x: 760, d: 0.78 };
    const kIn = ease(range(t, 0, 3));
    const lightLoss = clamp(lost / 6 + range(t, T.all + 2, T.light + 4) * 0.25) * (1 - ease(range(t, T.stop + 1, T.walk + 3)) * 0.85);
    const col = mixC('#ffffff', '#3f4048', lightLoss * 0.95);
    let pose = t < 3 ? walkPose(t * 4) : { armF: [1.2, 0.5], armB: [0.4, 0.4], lean: 0.05 };
    const betting = t > 3 && t < T.stop && (Math.sin(t * 2.4) > 0.6 || STAKES.some(([t0]) => t > t0 && t < t0 + 1.2));
    if (betting) pose = { armF: [1.6, 0.0], armB: [0.4, 0.4], lean: 0.15 };
    if (t > T.win && t < T.win + 1.6) pose = { armF: [PI * 0.85, 0.1], armB: [PI * 0.8, 0.1], bob: -Math.abs(Math.sin(t * 9)) * 0.04 }; // il gagne !
    if (t > 12 && t < 13.4) pose = { armF: [PI * 0.85, 0.1], armB: [PI * 0.8, 0.1], bob: -Math.abs(Math.sin(t * 9)) * 0.04 };
    if (t > T.lose && t < T.all) pose = mixPose(pose, { lean: 0.25, head: 0.35 }, clamp(lost / 4 + 0.3));
    if (t > T.light && t < T.stop) pose = { lean: 0.35, head: 0.5, armF: [1.55 + Math.sin(t * 2) * 0.05, -0.1], armB: [0.2, 0.3] }; // il tend sa dernière lumière
    if (t > T.stop) pose = mixPose({ lean: 0.35, head: 0.5, armF: [1.55, -0.1] }, { lean: -0.02, head: -0.05, armF: [0.2, 0.3], armB: [0.1, 0.3] }, ease(range(t, T.stop, T.stop + 1.6)));
    if (t > T.walk) pose = walkPose(t * 4.2);
    const mx = t < 3 ? lerp(300, me.x, kIn) : t > T.walk ? lerp(me.x, me.x - 80, ease(range(t, T.walk, T.end))) : me.x;
    const hm = actor(ctx, mx, me.d, 520, pose, { color: col, glow: lerp(22, 2, lightLoss) });
    // pièces : la mise, le gain
    if (t > 3 && t < T.lose) { const n = t < T.win ? 1 : t < T.more ? 3 : t < 12 ? 6 : 12; for (let i = 0; i < n; i++) coin(ctx, 940 + (i % 6) * 24, ty - 8 - Math.floor(i / 6) * 9); }
    if (t > T.win && t < T.win + 1.4) for (let i = 0; i < 8; i++) { const k = range(t, T.win + i * 0.05, T.win + 1 + i * 0.05); coin(ctx, lerp(1000, hm.hand[0], k) + i * 4, lerp(ty - 10, hm.hand[1], k) - Math.sin(k * PI) * 120, 12, 1 - k * 0.3); }
    // pertes : les pièces repartent vers la maison
    [17.2, 19.4].forEach((t0) => { if (t > t0 && t < t0 + 1.2) for (let i = 0; i < 10; i++) { const k = range(t, t0 + i * 0.03, t0 + 0.8 + i * 0.03); coin(ctx, lerp(960 + (i % 6) * 24, 1080, k), lerp(ty - 8, depthY(0.6) - 300, k), 12, 1 - k); } });
    // objets de sa vie misés et perdus
    STAKES.forEach(([t0, label, c], i) => {
      if (t < t0 - 0.4) return;
      const k1 = ease(range(t, t0 - 0.4, t0 + 0.6)); // posé sur la table
      const k2 = ease(range(t, t0 + 1.4, t0 + 2.4)); // ramassé par la maison
      const x = lerp(hm.hand[0], 900 + (i % 3) * 110, k1), y = lerp(hm.hand[1], ty - 30 - Math.floor(i / 3) * 56, k1);
      token(ctx, lerp(x, 1100, k2), lerp(y, depthY(0.6) - houseH * depthS(0.6) * 0.6, k2), label, c, (1 - k2 * 0.85) * (t < T.stop + 2 ? 1 : 0), lerp(1, 0.7, k2));
    });
    // les amis et la famille qui partent (derrière lui)
    [[380, 0.66, 29.4], [250, 0.62, 29.8], [520, 0.6, 35.4], [440, 0.56, 35.8]].forEach(([fx, fd, tGo], i) => { const k = ease(range(t, tGo, tGo + 2.6)); const back = ease(range(t, T.walk - 0.5 + i * 0.3, T.walk + 1.8 + i * 0.3)); const x = lerp(fx, -200, k * (1 - back)); if (k > 0.99 && back < 0.01) return; actor(ctx, x, fd, i > 1 ? 440 : 470, k > 0.01 && k < 0.99 ? walkPose(t * 4 + i) : back > 0.5 ? { armF: [1.2, 0.3] } : { armF: [0.4, 0.4], head: 0.15 }, { color: i === 2 ? '#ffd9a8' : '#ffe9c4', glow: 16, flip: k > 0.01 && k < 0.99 ? -1 : 1, alpha: 1 - k * 0.6 * (1 - back) }); });
    // sa dernière lumière dans sa main, qu'il retire au dernier moment
    if (t > T.light && t < T.stop + 2) { const k = ease(range(t, T.stop, T.stop + 1.4)); const p = [hm.hand[0] + 10, hm.hand[1] - 6]; ctx.save(); const g = ctx.createRadialGradient(p[0], p[1], 2, p[0], p[1], 46); g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.globalAlpha = 1 - k; ctx.beginPath(); ctx.arc(p[0], p[1], 46, 0, PI * 2); ctx.fill(); ctx.restore(); }
    // textes
    caption(ctx, W, 'Juste une petite pièce.\nPour s’amuser.', fade(t, 0.8, 2, 4.4, 5));
    caption(ctx, W, 'Il a gagné. Une fois.', fade(t, 5.4, 6.4, 9.2, 10));
    caption(ctx, W, 'Alors il a misé plus', fade(t, 10.4, 11.4, 15.2, 16));
    caption(ctx, W, 'Puis il a perdu.\nPour se refaire, il a misé encore.', fade(t, 16.4, 17.6, 21.2, 22));
    caption(ctx, W, 'Sa moto. Son téléphone.\nSes amis. Sa maison.', fade(t, 23, 24.2, 33.2, 34));
    caption(ctx, W, 'Sa famille.', fade(t, 34.6, 35.4, 38.6, 39.4));
    caption(ctx, W, 'Il ne lui restait\nque sa propre lumière', fade(t, 40.4, 41.6, 45.2, 46));
    caption(ctx, W, 'Il a dit : « Stop. »', fade(t, 46.6, 47.6, 51.2, 52), 130, 52);
    caption(ctx, W, 'Au jeu, la maison\ngagne toujours', fade(t, 52.6, 53.8, 57.6, 58.3));
    if (t > T.end) { ctx.fillStyle = `rgba(0,0,0,${range(t, T.end, T.end + 0.8)})`; ctx.fillRect(0, 0, W, H); if (t > T.end + 0.8) { caption(ctx, W, 'Ne mise pas ta vie.', fade(t, 59.3, 59.9, 61.3, 61.9), 440, 52); caption(ctx, W, 'Mise', fade(t, 59.9, 60.5, 61.3, 61.9) * 0.7, 700, 34); } }
  };
}
