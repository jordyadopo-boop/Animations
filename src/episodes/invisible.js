// « INVISIBLE » — sensibilisation à la santé mentale et à la dépression (style bonhommes, 16:9, ~64 s).
// Un homme sourit à tout le monde ; personne ne voit que sa lumière s'éteint. Jusqu'au jour où quelqu'un s'arrête.
// Aucune image de suicide : la dépression est montrée par la lumière qui faiblit, le poids, l'eau noire qui monte.
import { PI, clamp, range, lerp, ease, eout, fade, figure, walkPose, mixPose, HOR, depthY, depthS, stage, actor, crowd, caption, mixC, fadeIO } from '../engine/bonhomme.js';

export const world = 'flat', fps = 24, duration = 64, width = 1920, height = 1080;
export const title = 'INVISIBLE';

const T = { crowd: 0, flicker: 7, home: 15, phone: 17.5, heavy: 25, sink: 32, friend: 40, up: 49, door: 52, end: 58 };

export const CUES = [
  ['piano', 0.2, { theme: 'instant', until: 15.2 }],
  ['room', 15, { until: 25 }], ['tick', 15, { until: 25 }], ['voicemail', 19.2], ['voicemail', 21.6],
  ['piano', 25.0, { theme: 'deuil', until: 40.2 }], ['heart', 25.5, { until: 40, from: 60, to: 44, soft: true }], ['rain', 32, { until: 40.5 }],
  ['steps', 40.6, { dur: 2.2 }], ['breath', 44, { dur: 3.5 }],
  ['piano', 40.4, { theme: 'main', until: 52.2 }], ['piano', 52, { theme: 'fin', until: 63.8 }],
];

const GREY = (k) => mixC('#ffffff', '#4a4c55', k); // sa lumière qui s'éteint (k = 0 → blanc, 1 → éteint)

// bulle de message lumineuse
function bubble(ctx, x, y, text, a, right = false) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.font = "500 38px 'Courier New', monospace";
  const w = ctx.measureText(text).width + 50, h = 70;
  ctx.fillStyle = right ? 'rgba(120,170,255,0.9)' : 'rgba(235,238,245,0.92)'; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 18;
  ctx.beginPath(); ctx.roundRect(x - (right ? w : 0), y, w, h, 22); ctx.fill(); ctx.shadowBlur = 0;
  ctx.fillStyle = right ? '#fff' : '#1a1b22'; ctx.textAlign = 'left'; ctx.fillText(text, x - (right ? w : 0) + 25, y + 47); ctx.restore();
}
// eau noire qui monte autour de lui (métaphore : il se noie en silence)
function darkWater(ctx, W, level, t) {
  if (level <= 0) return; const y = HOR + 420 - level;
  ctx.save(); const g = ctx.createLinearGradient(0, y, 0, y + 400); g.addColorStop(0, 'rgba(8,10,18,0.92)'); g.addColorStop(1, 'rgba(2,2,4,1)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 1080); for (let x = 0; x <= W; x += 40) ctx.lineTo(x, y + Math.sin(x * 0.01 + t * 1.5) * 6); ctx.lineTo(W, 1080); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(160,170,200,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); for (let x = 0; x <= W; x += 40) (x ? ctx.lineTo : ctx.moveTo).call(ctx, x, y + Math.sin(x * 0.01 + t * 1.5) * 6); ctx.stroke(); ctx.restore();
}
// pluie grise sur lui seul
function personalRain(ctx, x, top, bottom, t, a) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a;
  ctx.fillStyle = 'rgba(40,42,52,0.85)'; ctx.beginPath(); ctx.ellipse(x, top, 150, 42, 0, 0, PI * 2); ctx.ellipse(x - 80, top + 10, 90, 34, 0, 0, PI * 2); ctx.ellipse(x + 85, top + 8, 95, 36, 0, 0, PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(150,155,175,0.6)'; ctx.lineWidth = 2;
  for (let i = 0; i < 26; i++) { const xx = x - 140 + ((i * 53.7) % 280), yy = top + 30 + ((i * 41.3 + t * 520) % (bottom - top)); ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx - 3, yy + 18); ctx.stroke(); }
  ctx.restore();
}
// poids sombre qu'il traîne
function weight(ctx, x, y, r, a) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#121318'; ctx.strokeStyle = 'rgba(120,125,140,0.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y - r, r, 0, PI * 2); ctx.fill(); ctx.stroke(); ctx.restore(); }

export function build({ ctx, begin, W, H }) {
  return (t) => {
    begin();
    if (t < T.home) { // ---- dans la foule : il sourit, mais sa lumière vacille ----
      stage(ctx, W, H, 1);
      ctx.save(); ctx.translate(-((t * 90) % 600), 0); crowd(ctx, t, 'walk', 0.7, 5); ctx.restore();
      const dim = range(t, 6, 14) * 0.55, flick = t > T.flicker ? (Math.sin(t * 23) > 0.85 ? 0.25 : 0) * range(t, 7, 9) : 0;
      const k = range(t, 0, 14), ph = t * 4.2 * lerp(1, 0.6, range(t, 8, 13));
      const x = lerp(820, 960, ease(k)); // il reste au centre, la foule défile
      let pose = walkPose(ph, lerp(1, 0.6, range(t, 8, 13)));
      if (t > 12.5) pose = mixPose(pose, { lean: 0.2, head: 0.45, armF: [0.05, 0.1], armB: [0, 0.1] }, ease(range(t, 12.5, 14)));
      actor(ctx, x, 0.86, 560, pose, { color: GREY(dim + flick), glow: lerp(26, 4, dim) });
      // des passants le frôlent sans le voir
      [[t * 260 - 300, 0.84, 1], [1900 - t * 230, 0.86, -1], [t * 300 - 1800, 0.82, 1]].forEach(([px, d, f], i) => actor(ctx, px, d, 500, walkPose(t * 5 + i), { color: '#ffffff', glow: 18, flip: f, alpha: 0.95 }));
      caption(ctx, W, 'Il sourit à tout le monde', fade(t, 0.8, 2, 6, 7));
      caption(ctx, W, 'Personne ne voit\nque sa lumière s’éteint', fade(t, 8, 9.2, 13.6, 14.6));
      fadeIO(ctx, W, H, t, -1, T.home);
    } else if (t < T.heavy) { // ---- chez lui, seul ; le téléphone : « ça va ? » / « ça va. » ----
      stage(ctx, W, H, 0.35);
      const pose = { kneel: 1, lean: 0.75, head: 0.55, armF: [1.1, 1.4], armB: [1.0, 1.5] };
      actor(ctx, 900, 0.8, 520, pose, { color: GREY(0.65), glow: 2 });
      // écran du téléphone qui éclaire son visage
      const ph = t > T.phone ? 1 : 0;
      if (ph) { ctx.save(); const g = ctx.createRadialGradient(1010, 840, 5, 1010, 840, 220); g.addColorStop(0, 'rgba(120,170,255,0.45)'); g.addColorStop(1, 'rgba(120,170,255,0)'); ctx.fillStyle = g; ctx.fillRect(780, 620, 460, 440); ctx.fillStyle = '#cfe0ff'; ctx.shadowColor = '#9fc0ff'; ctx.shadowBlur = 20; ctx.fillRect(1000, 828, 26, 44); ctx.restore(); }
      bubble(ctx, 1150, 380, 'Ça va ? On ne te voit plus', fade(t, 18.4, 18.8, 24, 24.6));
      bubble(ctx, 1150, 460, 'Tout va bien ?', fade(t, 20.8, 21.2, 24, 24.6));
      const typed = 'Ça va.'.slice(0, Math.floor(range(t, 22.2, 23.2) * 6));
      bubble(ctx, 1600, 560, typed, typed ? fade(t, 22.2, 22.4, 24, 24.6) : 0, true);
      caption(ctx, W, 'Chaque soir, la même réponse', fade(t, 15.6, 16.8, 18, 18.6));
      caption(ctx, W, '« Ça va. »', fade(t, 23.3, 23.8, 24.4, 24.9), 130, 48);
      fadeIO(ctx, W, H, t, T.home, T.heavy);
    } else if (t < T.friend) { // ---- le poids, la pluie, l'eau noire qui monte ----
      stage(ctx, W, H, 0.6);
      crowd(ctx, t, 'walk', 0.5 * (1 - range(t, 30, 33)), 8);
      const kw = range(t, 25, 32), x = lerp(500, 900, ease(kw)), ph = t * 2.6;
      let pose = mixPose(walkPose(ph, 0.5), { lean: 0.45, head: 0.5, armF: [0.05, 0.05], armB: [-0.1, 0.05] }, 0.6);
      if (t > 32) pose = mixPose(pose, { kneel: 1, lean: 0.6, head: 0.6, armF: [0.4, 0.4], armB: [0.3, 0.5] }, ease(range(t, 32, 34)));
      weight(ctx, x - 150, depthY(0.8), 46, 1 - range(t, 31.5, 33));
      if (t < 33) { ctx.save(); ctx.strokeStyle = 'rgba(120,125,140,0.7)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x - 110, depthY(0.8) - 40); ctx.lineTo(x - 20, depthY(0.8) - 150); ctx.stroke(); ctx.restore(); }
      actor(ctx, x, 0.8, 520, pose, { color: GREY(0.72), glow: 0 });
      personalRain(ctx, x, 250, depthY(0.8), t, fade(t, 27, 29, 39, 40.5));
      darkWater(ctx, W, lerp(0, 330, ease(range(t, 33, 39))), t);
      caption(ctx, W, 'La dépression ne se voit pas', fade(t, 26, 27.2, 30.6, 31.4));
      caption(ctx, W, 'Elle pèse. Elle noie.\nEn silence.', fade(t, 33.2, 34.4, 38.6, 39.6));
    } else if (t < T.up) { // ---- quelqu'un s'arrête ----
      stage(ctx, W, H, lerp(0.6, 0.9, range(t, 44, 49)));
      const water = lerp(330, 0, ease(range(t, 44.5, 48.5)));
      const kf = ease(range(t, 40.4, 43.4)), fx = lerp(1800, 1040, kf);
      const fpose = t < 43.4 ? walkPose(t * 4.6) : mixPose({}, { kneel: 1, lean: 0.35, head: 0.25, armF: [1.3, 0.5], armB: [0.6, 0.5] }, ease(range(t, 43.4, 44.6)));
      const glowBack = range(t, 45, 49);
      actor(ctx, 900, 0.8, 520, { kneel: 1, lean: lerp(0.6, 0.35, glowBack), head: lerp(0.6, 0.15, glowBack), armF: [0.4, 0.4], armB: [0.3, 0.5] }, { color: GREY(lerp(0.72, 0.2, glowBack)), glow: lerp(0, 14, glowBack) });
      actor(ctx, fx, 0.81, 500, fpose, { color: '#ffffff', glow: 22, flip: -1 });
      // la lumière de l'ami touche la sienne
      if (t > 44.2) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(970, 780, 10, 970, 780, 260); g.addColorStop(0, `rgba(255,250,235,${0.35 * range(t, 44.2, 46)})`); g.addColorStop(1, 'rgba(255,250,235,0)'); ctx.fillStyle = g; ctx.fillRect(700, 520, 540, 520); ctx.restore(); }
      darkWater(ctx, W, water, t);
      caption(ctx, W, 'Jusqu’au jour où quelqu’un\ns’est arrêté', fade(t, 40.8, 42, 45.4, 46.2));
      caption(ctx, W, 'Et a vraiment demandé :\n« Comment tu vas ? »', fade(t, 46.4, 47.4, 48.4, 49));
    } else { // ---- il se relève ; ils marchent vers une porte de lumière ----
      const kd = range(t, T.door, T.end);
      stage(ctx, W, H, 1, ease(range(t, T.door, T.door + 2)));
      const ku = ease(range(t, 49, 51.5));
      const ph = t * 4.0, d = lerp(0.8, 0.25, ease(kd));
      const walk = t > T.door;
      const p1 = walk ? walkPose(ph) : mixPose({ kneel: 1, lean: 0.35, head: 0.15 }, { armF: [0.3, 0.3] }, ku);
      const p2 = walk ? walkPose(ph + 0.7) : mixPose({ kneel: 1, lean: 0.35, armF: [1.3, 0.5] }, { armF: [0.9, 0.3] }, ku);
      const xx = walk ? lerp(900, 940, kd) : 900;
      actor(ctx, xx, d, 520, p1, { color: GREY(lerp(0.2, 0, ku)), glow: lerp(14, 22, ku) });
      actor(ctx, walk ? lerp(1040, 1000, kd) : 1040, d + 0.01, 500, p2, { color: '#ffffff', glow: 22, flip: walk ? 1 : -1 });
      caption(ctx, W, 'Parler n’est pas une faiblesse', fade(t, 50, 51.2, 55, 55.8));
      caption(ctx, W, 'Demande comment ça va.\nVraiment.', fade(t, 56, 57, 59.6, 60.4));
      ctx.fillStyle = `rgba(0,0,0,${range(t, 60, 60.8)})`; ctx.fillRect(0, 0, W, H);
      if (t > 60.8) { caption(ctx, W, 'Et si c’est toi : parles-en.', fade(t, 60.9, 61.5, 63.2, 63.8), 500, 50); caption(ctx, W, 'Invisible', fade(t, 61.6, 62.2, 63.2, 63.8) * 0.7, 640, 34); }
    }
  };
}
