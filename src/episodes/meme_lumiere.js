// « MÊME LUMIÈRE » — sensibilisation au racisme (style bonhommes, 16:9, ~62 s).
// Chacun brille d'une couleur. On juge, on se sépare, on dresse des murs.
// Dans le noir, plus de couleurs : la même petite lumière au cœur de chacun.
import { PI, clamp, range, lerp, ease, eout, fade, figure, walkPose, mixPose, HOR, depthY, depthS, stage, actor, caption, mixC } from '../engine/bonhomme.js';

export const world = 'flat', fps = 24, duration = 62, width = 1920, height = 1080;
export const title = 'MÊME LUMIÈRE';
const T = { arrive: 0, judge: 6, walls: 14, kids: 24, dark: 32, fall: 42, together: 52, end: 58.4 };

export const CUES = [
  ['piano', 0.2, { theme: 'main', until: 6.2 }], ['steps', 0.8, { dur: 3.5 }],
  ['piano', 6, { theme: 'tension', until: 14.2 }], ['laugh', 9.6],
  ['cellDoor', 16.2], ['cellDoor', 17.6], ['cellDoor', 19.0], ['piano', 14, { theme: 'partir', until: 32.2 }],
  ['pop', 26.2], ['pop', 27.8], ['pop', 29.4],
  ['drone', 32, { until: 37 }], ['heart', 34, { until: 42, from: 52, to: 52, soft: true }], ['piano', 34, { theme: 'deuil', until: 42.2 }],
  ['shatter', 43.2], ['shatter', 44.0], ['shatter', 44.8], ['piano', 42.2, { theme: 'main', until: 52.2 }],
  ['steps', 52.5, { dur: 4 }], ['piano', 52, { theme: 'fin', until: 61.8 }],
];

const COLS = ['#ffb347', '#6fa8ff', '#7ed98a', '#ff8fc8'];
// quatre groupes de couleur (positions séparées par les murs)
const GROUPS = COLS.map((c, g) => ({ c, cx: 330 + g * 420, people: Array.from({ length: 4 }, (_, i) => ({ dx: (i - 1.5) * 78 + ((i * 37) % 23), d: 0.6 + ((i * 7 + g * 3) % 5) * 0.06, h: i === 3 ? 300 : 440 + ((i * 13) % 50) })) }));

function heart(ctx, x, y, r, a) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; const g = ctx.createRadialGradient(x, y, 1, x, y, r * 5); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,250,235,0.6)'); g.addColorStop(1, 'rgba(255,250,235,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 5, 0, PI * 2); ctx.fill(); ctx.restore(); }
function wall(ctx, x, k, crack = 0) {
  if (k <= 0) return; const top = lerp(depthY(0.95), 240, k);
  ctx.save(); ctx.globalAlpha = 1 - crack; ctx.fillStyle = 'rgba(200,205,225,0.13)'; ctx.strokeStyle = 'rgba(220,225,245,0.75)'; ctx.lineWidth = 4; ctx.shadowColor = '#dfe6ff'; ctx.shadowBlur = 14;
  const off = crack * 60;
  ctx.fillRect(x - 18 - off, top + crack * 200, 36, depthY(0.95) - top); ctx.strokeRect(x - 18 - off, top + crack * 200, 36, depthY(0.95) - top);
  if (crack > 0) { ctx.beginPath(); ctx.moveTo(x - 18, top + 120); ctx.lineTo(x + 10, top + 260); ctx.lineTo(x - 8, top + 420); ctx.stroke(); }
  ctx.restore();
}

export function build({ ctx, begin, W, H }) {
  return (t) => {
    begin();
    const dark = ease(range(t, T.dark, T.dark + 2.5)) * (1 - ease(range(t, T.fall, T.fall + 2)));
    stage(ctx, W, H, 1 - dark * 0.92, t > T.together ? ease(range(t, T.together, T.together + 2)) * 0.8 : 0);
    const colorK = 1 - dark; // dans le noir, les couleurs disparaissent
    if (t < T.walls) { // ---- un seul nouveau, bleu, dans une foule ambrée ----
      const kA = ease(range(t, 0.4, 5)), away = ease(range(t, T.judge, T.judge + 2.5));
      const crowd = Array.from({ length: 9 }, (_, i) => ({ x: 240 + i * 180 + ((i * 53) % 40), d: 0.55 + ((i * 5) % 4) * 0.08 }));
      crowd.forEach((p, i) => {
        const side = p.x < 1100 ? -1 : 1, dx = away * side * (230 - Math.abs(p.x - 1100) * 0.1);
        const pointing = t > 8.5 && t < 13 && i % 3 === 0;
        const pose = t < T.judge ? walkPose(t * 3.5 + i, 0.6) : away < 1 ? walkPose(t * 4 + i, 0.6) : pointing ? { armF: [1.55, 0.05], lean: -0.05 } : { armF: [0.9, 1.5], armB: [0.8, 1.6], head: 0.05 };
        actor(ctx, p.x + dx + (t < T.judge ? Math.sin(t * 0.8 + i) * 20 : 0), p.d, 440, pose, { color: '#ffb347', glow: 18, flip: t >= T.judge ? (p.x < 1100 ? 1 : -1) : (i % 2 ? 1 : -1) });
      });
      const nx = lerp(2050, 1100, kA);
      actor(ctx, nx, 0.8, 470, kA < 1 ? walkPose(t * 4) : { armF: [0.3, 0.3], head: lerp(-0.05, 0.4, away) }, { color: '#6fa8ff', glow: 22, flip: -1 });
      if (kA < 1) { ctx.save(); ctx.fillStyle = '#6fa8ff'; ctx.shadowColor = '#6fa8ff'; ctx.shadowBlur = 10; ctx.fillRect(nx + 60, depthY(0.8) - 90, 60, 80); ctx.restore(); } // valise
      caption(ctx, W, 'Il venait d’ailleurs', fade(t, 0.8, 2, 5, 6));
      caption(ctx, W, 'On l’a jugé sur sa couleur.\nAvant même de le connaître.', fade(t, 6.8, 8, 12.6, 13.6));
      ctx.fillStyle = `rgba(0,0,0,${range(t, T.walls - 0.6, T.walls)})`; ctx.fillRect(0, 0, W, H);
    } else { // ---- groupes, murs, enfants, noir, réunion ----
      const wallK = (i) => ease(range(t, T.walls + 1.6 + i * 1.4, T.walls + 2.6 + i * 1.4));
      const crack = (i) => ease(range(t, 43 + i * 0.8, 44.4 + i * 0.8));
      const mixK = ease(range(t, T.fall + 3, T.together)); // ils traversent les murs écroulés
      const walkTog = t > T.together;
      // personnages
      GROUPS.forEach((g, gi) => g.people.forEach((p, i) => {
        let x = g.cx + p.dx, d = p.d;
        if (mixK > 0) { const idx = i * 4 + gi, target = 230 + idx * 92; x = lerp(x, target, mixK); d = lerp(d, 0.62 + (idx % 3) * 0.08, mixK); } // les couleurs se mélangent
        if (walkTog) { x += ease(range(t, T.together, T.end)) * 140; }
        const isKid = i === 3 && (gi === 0 || gi === 1);
        let pose = { armF: [0.9, 1.5], armB: [0.8, 1.6] }; // bras croisés
        if (t < T.walls + 1.5) pose = walkPose(t * 4 + i, 0.6);
        if (isKid && t > T.kids && t < T.dark) pose = { kneel: 1, lean: 0.25, armF: [1.3 + Math.sin(t * 4) * 0.2, 0.2], armB: [0.4, 0.4] };
        if (mixK > 0 && mixK < 1) pose = walkPose(t * 4 + i, 0.7);
        if (mixK >= 1 && !walkTog) pose = { armF: [1.2, 0.3], armB: [1.2, 0.3] }; // mains tendues
        if (walkTog) pose = walkPose(t * 4 + i * 0.7, 0.8);
        const col = mixC('#ffffff', g.c, colorK * (1 - 0.35 * ease(range(t, T.together, T.end))));
        const hh = actor(ctx, isKid && t > T.kids && t < T.dark ? g.cx + (gi === 0 ? 150 : -150) : x, isKid && t > T.kids && t < T.dark ? 0.86 : d, p.h, pose, { color: col, glow: lerp(20, 2, dark), flip: walkTog ? 1 : ((gi === 0 ? 1 : gi === 3 ? -1 : (i % 2 ? 1 : -1))), alpha: lerp(1, 0.12, dark) });
        // la petite lumière du cœur : identique pour tous
        const hy = depthY(d) - p.h * depthS(d) * 0.62;
        heart(ctx, (isKid && t > T.kids && t < T.dark ? g.cx + (gi === 0 ? 150 : -150) : x) + 4, hy, 4 + 3 * depthS(d), fade(t, T.dark + 1.5, T.dark + 3, T.fall + 1, T.fall + 3));
      }));
      // ballon qui passe sous le mur entre les deux enfants
      if (t > T.kids && t < T.dark) { const ph = ((t - T.kids) / 1.6) % 2, k = ph < 1 ? ph : 2 - ph; const bx = lerp(GROUPS[0].cx + 190, GROUPS[1].cx - 190, ease(k)); ctx.save(); ctx.fillStyle = '#ffffff'; ctx.shadowColor = '#fff'; ctx.shadowBlur = 14; ctx.beginPath(); ctx.arc(bx, depthY(0.86) - 16, 16, 0, PI * 2); ctx.fill(); ctx.restore(); }
      // murs entre les groupes (ils ont un petit espace en bas : le ballon passe)
      [0, 1, 2].forEach((i) => wall(ctx, (GROUPS[i].cx + GROUPS[i + 1].cx) / 2, wallK(i) * (1 - dark * 0.7), crack(i)));
      caption(ctx, W, 'Alors chacun s’est enfermé\ndans sa couleur', fade(t, 15, 16.2, 22.6, 23.6));
      caption(ctx, W, 'Les enfants, eux,\nne voyaient pas les murs', fade(t, 24.8, 26, 30.6, 31.6));
      caption(ctx, W, 'Dans le noir, plus de couleurs.\nJuste des lumières.', fade(t, 34.4, 35.6, 40.6, 41.6));
      caption(ctx, W, 'À l’intérieur,\non brille tous pareil', fade(t, 44.6, 45.8, 50.6, 51.6));
      caption(ctx, W, 'Le racisme s’apprend.\nLe respect aussi.', fade(t, 52.8, 54, 57.6, 58.3));
      ctx.fillStyle = `rgba(0,0,0,${1 - range(t, T.walls, T.walls + 0.8)})`; ctx.fillRect(0, 0, W, H);
    }
    if (t > T.end) { ctx.fillStyle = `rgba(0,0,0,${range(t, T.end, T.end + 0.8)})`; ctx.fillRect(0, 0, W, H); if (t > T.end + 0.8) { caption(ctx, W, 'Juge le cœur, pas la couleur.', fade(t, 59.3, 59.9, 61.3, 61.9), 440, 50); caption(ctx, W, 'Même lumière', fade(t, 59.9, 60.5, 61.3, 61.9) * 0.7, 700, 34); } }
  };
}
