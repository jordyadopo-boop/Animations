// « SANS UN COUP » — sensibilisation au harcèlement moral (style bonhommes, 16:9, ~62 s).
// Les mots qui blessent deviennent des projectiles qui restent collés sur lui et éteignent sa lumière.
// Jusqu'au jour où quelqu'un se lève et dit « Stop ».
import { PI, clamp, range, lerp, ease, eout, fade, walkPose, mixPose, HOR, depthY, depthS, stage, actor, caption, mixC, fadeIO } from '../engine/bonhomme.js';

export const world = 'flat', fps = 24, duration = 62, width = 1920, height = 1080;
export const title = 'SANS UN COUP';

const T = { arrive: 0, words: 6, gaslight: 20, alone: 28, home: 36, stop: 42, heal: 51, end: 58.4 };

// mots lancés : [instant, texte, qui parle]
const WORDS = [
  [7.0, 'Encore toi ?', 'chef'], [8.4, 'Nul.', 'chef'], [9.6, 'Incapable.', 'chef'], [11.2, 'Regarde-toi…', 'c1'],
  [12.4, 'Inutile.', 'chef'], [13.8, 'Personne ne t’aime ici.', 'c2'], [15.4, 'Tu ne sers à rien.', 'chef'], [17.0, 'Démissionne.', 'chef'],
  [21.0, 'C’est pour rire !', 'c1'], [22.8, 'Tu es trop sensible.', 'chef'], [24.6, 'Tu exagères.', 'c2'], [26.2, 'C’est dans ta tête.', 'chef'],
  [44.6, 'Bon à rien.', 'chef'], [45.6, 'Minable.', 'chef'],
];
export const CUES = [
  ['piano', 0.2, { theme: 'main', until: 6.4 }], ['steps', 0.5, { dur: 2.5 }],
  ['heart', 6.5, { until: 19.5, from: 66, to: 96, soft: true }], ['piano', 6.2, { theme: 'tension', until: 20.2 }],
  ...WORDS.filter((w) => w[0] < 40).map((w) => ['word', w[0] + 0.55]), ['laugh', 11.4], ['laugh', 14.0], ['laugh', 21.2],
  ['piano', 20.2, { theme: 'partir', until: 36.2 }], ['clockFast', 36.5, { dur: 4 }], ['piano', 36, { theme: 'deuil', until: 42.2 }],
  ['steps', 42.6, { dur: 1.6 }], ['shatter', 45.2], ['shatter', 46.2], ['piano', 42.4, { theme: 'heritage', until: 51.2 }],
  ['breath', 51.2, { dur: 3 }], ['piano', 51, { theme: 'fin', until: 61.8 }],
];

const ME = { x: 960, d: 0.74 }, BOSS = { x: 1520, d: 0.76 }, C1 = { x: 470, d: 0.6 }, C2 = { x: 1320, d: 0.56 };
const SIT = { legF: [1.5, 1.45], legB: [1.42, 1.4], lean: 0.06, armF: [1.1, 0.6], armB: [1.0, 0.7] };

function desk(ctx, x, d, a = 1) {
  const y = depthY(d), s = depthS(d); ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = 'rgba(200,205,220,0.7)'; ctx.lineWidth = 5 * s; ctx.lineCap = 'round';
  const top = y - 230 * s; ctx.beginPath(); ctx.moveTo(x - 30 * s, top); ctx.lineTo(x + 260 * s, top); ctx.moveTo(x + 230 * s, top); ctx.lineTo(x + 230 * s, y); ctx.stroke();
  ctx.fillStyle = 'rgba(150,180,230,0.25)'; ctx.strokeRect(x + 120 * s, top - 110 * s, 110 * s, 80 * s); ctx.fillRect(x + 120 * s, top - 110 * s, 110 * s, 80 * s);
  ctx.beginPath(); ctx.moveTo(x + 175 * s, top - 30 * s); ctx.lineTo(x + 175 * s, top); ctx.stroke(); ctx.restore();
}
// un mot : vole de la bouche de quelqu'un jusqu'à lui, puis reste collé (étiquette sombre)
function word(ctx, text, from, to, k, stuck, a = 1, size = 34) {
  if (a <= 0) return;
  const x = lerp(from[0], to[0], eout(k)), y = lerp(from[1], to[1], eout(k)) - Math.sin(k * PI) * 90;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(stuck ? to[2] : (1 - k) * -0.2);
  ctx.font = `600 ${size}px 'Courier New', monospace`; const w = ctx.measureText(text).width + 24;
  ctx.fillStyle = stuck ? 'rgba(20,10,14,0.92)' : 'rgba(30,12,16,0.9)'; ctx.strokeStyle = 'rgba(255,90,90,0.85)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(-w / 2, -size * 0.75, w, size * 1.3, 6); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ff6b6b'; ctx.textAlign = 'center'; ctx.fillText(text, 0, size * 0.25); ctx.restore();
}

export function build({ ctx, begin, W, H }) {
  return (t) => {
    begin();
    const nStuck = WORDS.filter((w) => w[0] < 40 && t > w[0] + 0.6).length;
    const dim = clamp(nStuck / 12) * (1 - ease(range(t, T.heal, T.heal + 3)));
    const myCol = mixC('#ffffff', '#4a4c55', dim * 0.85);
    if (t < T.home || t >= T.stop) {
      stage(ctx, W, H, lerp(1, 0.6, dim));
      // collègues qui s'éloignent quand il est isolé
      const iso = ease(range(t, T.alone, T.alone + 3)) * (1 - ease(range(t, T.stop + 3, T.stop + 5)));
      const c1x = C1.x - iso * 300, c2x = C2.x + iso * 380;
      desk(ctx, c1x - 120, C1.d); desk(ctx, c2x - 120, C2.d);
      const laugh = (t0) => (t > t0 && t < t0 + 1.6 ? Math.abs(Math.sin((t - t0) * 12)) * 0.03 : 0);
      const turnAway = t > T.alone && t < T.stop + 2;
      const cPose = (t0, t1) => ({ ...SIT, lean: turnAway ? 0.1 : -0.05, head: turnAway ? 0.3 : -0.2, armF: laugh(t0) || laugh(t1) ? [1.6, 1.4] : [1.0, 0.7], bob: -(laugh(t0) + laugh(t1)) });
      const standK = ease(range(t, T.stop + 3.4, T.stop + 4.6));
      const c1 = mixPose(cPose(11.4, 21.2), { legF: [0.05, 0.05], legB: [-0.05, 0.05], lean: 0, head: 0, armF: [0.2, 0.2], armB: [0.1, 0.2] }, standK);
      const c2 = mixPose(cPose(14.0, 21.2), { legF: [0.05, 0.05], legB: [-0.05, 0.05], lean: 0, head: 0, armF: [0.2, 0.2], armB: [0.1, 0.2] }, standK);
      const h1 = actor(ctx, c1x + standK * 260, C1.d, 470, c1, { color: '#c9ccd6', glow: 8 });
      const h2 = actor(ctx, c2x - standK * 280, C2.d, 450, c2, { color: '#c9ccd6', glow: 8, flip: -1 });
      // lui, à son bureau
      desk(ctx, ME.x - 120, ME.d);
      const kA = ease(range(t, 0, 4)), arriving = t < 4.2;
      const shrink = 1 - 0.18 * dim;
      let me = arriving ? walkPose(t * 4.6) : mixPose(SIT, { lean: lerp(0.06, 0.55, dim), head: lerp(0, 0.6, dim), armF: [lerp(1.1, 0.5, dim), lerp(0.6, 1.5, dim)], armB: [lerp(1.0, 0.4, dim), lerp(0.7, 1.6, dim)] }, 1);
      if (t > T.heal) me = mixPose(me, { ...SIT, lean: 0, head: -0.1, armF: [1.0, 0.5] }, ease(range(t, T.heal, T.heal + 3)));
      const meX = arriving ? lerp(300, ME.x, kA) : ME.x;
      const hm = actor(ctx, meX, ME.d, 520 * shrink, me, { color: myCol, glow: lerp(24, 3, dim) });
      // le chef : arrive à droite, grand, sombre
      const kb = ease(range(t, 5, 6.6)), bx = lerp(2100, BOSS.x, kb) - ease(range(t, T.stop + 1.6, T.stop + 2.6)) * 0 ;
      const speaking = WORDS.some((w) => t > w[0] - 0.2 && t < w[0] + 0.5 && (w[2] === 'chef'));
      const bossPose = t < 6.6 ? walkPose(t * 4) : { lean: 0.12, armF: [speaking ? 1.5 : 0.6, speaking ? 0.2 : 0.6], armB: [0.2, 0.4], legF: [0.15, 0.05], legB: [-0.15, 0.05] };
      const bossRetreat = ease(range(t, 47.5, 50));
      const hb = actor(ctx, bx + bossRetreat * 500, BOSS.d, 600, bossPose, { color: '#8c3a3a', glow: 10, flip: -1, alpha: 1 - bossRetreat * 0.8 });
      // l'amie qui se lève et s'interpose
      const kf = ease(range(t, T.stop + 0.4, T.stop + 2.2));
      if (t > T.stop) {
        const fx = lerp(c2x, ME.x + 190, kf);
        const fpose = kf < 1 ? walkPose(t * 4.6) : { armF: [PI * 0.55, 0.05], armB: [0.2, 0.3], lean: -0.05 };
        actor(ctx, fx, ME.d + 0.02, 500, fpose, { color: '#ffffff', glow: 24, flip: 1 });
      }
      // mots : en vol puis collés sur lui
      const meTop = [meX, depthY(ME.d) - 420 * depthS(ME.d) * shrink];
      const who = { chef: [bx - 60, depthY(BOSS.d) - 480 * depthS(BOSS.d)], c1: h1.head, c2: h2.head };
      let si = 0;
      WORDS.forEach(([t0, txt, src], i) => {
        if (t < t0) return;
        const k = clamp((t - t0) / 0.6);
        if (t0 > 40) { // pendant le « stop » : les mots se brisent sur la main de l'amie
          const tgt = [ME.x + 330, depthY(ME.d) - 420 * depthS(ME.d)];
          if (k < 1) word(ctx, txt, who[src], [tgt[0], tgt[1], 0], k, false);
          else { const kk = range(t, t0 + 0.6, t0 + 1.4); for (let j = 0; j < 6; j++) { ctx.fillStyle = `rgba(255,107,107,${1 - kk})`; ctx.fillRect(tgt[0] + Math.cos(j) * kk * 120, tgt[1] + Math.sin(j * 2) * kk * 80 + kk * kk * 200, 8, 8); } }
          return;
        }
        const off = [[-60, 40, -0.2], [70, 110, 0.15], [-40, 180, 0.1], [60, -20, -0.12], [-80, 250, 0.2], [40, 300, -0.15], [-20, 80, 0.05], [90, 200, -0.2], [-90, 130, 0.12], [20, 360, 0.08], [-60, 330, -0.1], [80, 30, 0.18]][si++ % 12];
        const to = [meTop[0] + off[0] * 1.9 * depthS(ME.d), meTop[1] + (off[1] * 1.15 - 60) * depthS(ME.d) * shrink, off[2]];
        // guérison : les mots tombent et s'effacent
        const fall = range(t, T.heal + 0.2 + i * 0.12, T.heal + 1.8 + i * 0.12);
        const to2 = [to[0] + (i % 2 ? 40 : -40) * fall, to[1] + eout(fall) * 260, to[2] + fall * (i % 2 ? 1 : -1)];
        word(ctx, txt, who[src], fall > 0 ? to2 : to, k, k >= 1, 1 - fall, k >= 1 ? 26 : 34);
      });
      // « Stop » : la main levée de l'amie
      if (t > T.stop + 2) caption(ctx, W, '« Stop. »', fade(t, T.stop + 2.2, T.stop + 2.6, T.stop + 7.6, T.stop + 8.4), 300, 56);
      caption(ctx, W, 'Il n’a jamais reçu un seul coup', fade(t, 0.8, 2, 5, 6));
      caption(ctx, W, 'Mais chaque jour, des mots', fade(t, 7.2, 8.4, 18.4, 19.4));
      caption(ctx, W, 'Et quand il se plaint :\n« Tu exagères. »', fade(t, 20.6, 21.8, 26.8, 27.8));
      caption(ctx, W, 'Les mots ne laissent pas de bleus.\nIls laissent des marques.', fade(t, 29, 30.2, 34.8, 35.8));
      caption(ctx, W, 'Jusqu’au jour où quelqu’un\ns’est levé', fade(t, T.stop + 0.4, T.stop + 1.4, T.stop + 1.9, T.stop + 2.2));
      caption(ctx, W, 'Ce n’est pas de ta faute', fade(t, 52, 53.2, 55.2, 56));
      caption(ctx, W, 'Le harcèlement moral\nest une violence', fade(t, 56.2, 57, 58, 58.6));
      { const k = t < T.home ? range(t, T.home - 0.8, T.home) : 1 - range(t, T.stop, T.stop + 0.8); if (k > 0) { ctx.fillStyle = `rgba(0,0,0,${k})`; ctx.fillRect(0, 0, W, H); } }
    } else { // ---- la nuit, chez lui : les mots le suivent ----
      stage(ctx, W, H, 0.3);
      const p = { lie: 1, armF: [0.4, 1.4], armB: [0.2, 1.5], legF: [0.3, 0.6], legB: [0.2, 0.5] };
      actor(ctx, 1000, 0.8, 520, p, { color: '#5a5c66', glow: 2, flip: -1 });
      WORDS.filter((w) => w[0] < 30).forEach(([, txt], i) => { const a = (i / 12) * PI * 2 + t * 0.15; word(ctx, txt, [0, 0], [960 + Math.cos(a) * (380 + (i % 3) * 120), 520 + Math.sin(a) * (200 + (i % 2) * 70), Math.sin(a) * 0.2], 1, true, 0.75 * fade(t, T.home, T.home + 1, T.stop - 1, T.stop), 28); });
      caption(ctx, W, 'Ils le suivent jusque chez lui.\nToutes les nuits.', fade(t, T.home + 0.6, T.home + 1.6, T.stop - 1.2, T.stop - 0.4));
      fadeIO(ctx, W, H, t, T.home, T.stop);
    }
    if (t > T.end) { ctx.fillStyle = `rgba(0,0,0,${range(t, T.end, T.end + 0.8)})`; ctx.fillRect(0, 0, W, H); if (t > T.end + 0.8) { caption(ctx, W, 'Si tu le vois : ne te tais pas.', fade(t, 59.3, 59.9, 61.3, 61.9), 500, 50); caption(ctx, W, 'Sans un coup', fade(t, 59.9, 60.5, 61.3, 61.9) * 0.7, 640, 34); } }
  };
}
