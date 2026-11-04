// « TOUT VA BIEN ? » — sensibilisation au burn-out (style bonhommes + habillage « reconstitution » : accroche,
// sous-titres mot à mot, batterie, horloge, compteurs, alertes). 16:9, ~62 s.
import { PI, clamp, range, lerp, ease, eout, fade, walkPose, mixPose, depthY, depthS, stage, actor, caption, mixC } from '../engine/bonhomme.js';
import { kcap, panel, label, big, hookBox, alarm, corners, battery, pulse, hhmm, YEL, RED, ORA } from '../engine/hud.js';

export const world = 'flat', fps = 24, duration = 62, width = 1920, height = 1080;
export const title = 'TOUT VA BIEN ?';
const T = { hook: 0, rew: 4.4, start: 5.6, load: 12, signs: 24, fall: 35.4, help: 40.4, rise: 43.5, rest: 50.4, end: 58.4 };

// ce qu'elle porte : [instant, français, anglais, couleur]
const BOX = [[13, 'TRAVAIL', 'WORK', '#9cc4ff'], [15, 'MAILS', 'EMAILS', '#b9a8ff'], [17, 'RÉUNIONS', 'MEETINGS', '#8fe0d0'], [19, 'ENFANTS', 'KIDS', '#ffd9a8'], [21, 'MAISON', 'HOME', '#ffb38a'], [22.6, 'TOUT LE MONDE', 'EVERYONE', '#ff9aa8']];
const ALERTS = [[25, 'MAUX DE TÊTE', 'headaches'], [27, 'INSOMNIE', 'insomnia'], [29, 'IRRITABLE', 'irritable'], [31, 'PLUS AUCUNE JOIE', 'no more joy']];

export const CUES = [
  ['heart', 0, { until: 4.4, from: 118, to: 124 }], ['rewind', 4.4, { dur: 1.3 }],
  ['piano', 5.6, { theme: 'main', until: 12.2 }], ['clockFast', 12.2, { dur: 4 }], ['clockFast', 18, { dur: 4 }],
  ...BOX.map(([s]) => ['thud', s + 0.55]), ['notif', 15.2], ['notif', 16.4], ['notif', 17.6], ['notif', 20.2],
  ['piano', 12, { theme: 'tension', until: 35.4 }], ...ALERTS.map(([s]) => ['ding', s]),
  ['heart', 24, { until: 35.4, from: 72, to: 128 }], ['silence', 35.4], ['thud', 36.2], ['thud', 36.6], ['thud', 36.9],
  ['piano', 36.4, { theme: 'deuil', until: 41.2 }], ['steps', 40.6, { dur: 2.6 }], ['breath', 44, { dur: 2.5 }],
  ['piano', 41, { theme: 'main', until: 50.6 }], ['twinkle', 47], ['piano', 50.4, { theme: 'fin', until: 61.8 }],
];

const HER = '#ffe2b8', FRIEND = '#cfe0ff', HX = 820, HD = 0.62;

function box(ctx, x, y, w, fr, en, col, a = 1, rot = 0) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = 'rgba(16,18,24,0.92)'; ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.shadowColor = col; ctx.shadowBlur = 12; ctx.beginPath(); ctx.roundRect(-w / 2, -24, w, 48, 8); ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
  ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.font = "800 22px Inter, sans-serif"; ctx.fillText(fr, 0, 0); ctx.font = "italic 600 14px Inter, sans-serif"; ctx.fillStyle = '#cfd6e4'; ctx.fillText(en, 0, 17); ctx.restore();
}

export function build({ ctx, begin, W, H }) {
  return (t) => {
    begin();
    const hook = t < T.rew; // l'accroche montre la fin avant de remonter le temps
    const tt = hook ? 37.5 : t; // instant de l'histoire affiché
    const nBox = BOX.filter(([s]) => tt > s + 0.5).length;
    // batterie
    let bat = 1;
    if (tt > T.load) bat = lerp(1, 0.35, range(tt, T.load, T.signs));
    if (tt > T.signs) bat = lerp(0.35, 0.08, range(tt, T.signs, T.fall));
    if (tt > T.fall) bat = lerp(0.08, 0.02, range(tt, T.fall, T.fall + 1));
    const charging = !hook && t > T.rise;
    if (charging) bat = lerp(0.02, 0.84, ease(range(t, T.rise, T.rest + 3)));
    const dim = clamp((1 - bat) * 0.9);
    stage(ctx, W, H, lerp(1, 0.5, dim), !hook && t > T.rest ? ease(range(t, T.rest, T.rest + 2)) * 0.7 : 0);
    // elle
    let pose = { armF: [0.3, 0.3], armB: [0.15, 0.3] }, x = HX;
    if (!hook && t < T.load) { const k = ease(range(t, T.start, T.start + 3.6)); x = lerp(380, HX, k); pose = k < 1 ? walkPose(t * 4.2) : { armF: [0.5, 0.4], armB: [0.2, 0.3], head: -0.08 }; }
    const carry = clamp(range(tt, BOX[0][0], BOX[0][0] + 0.6));
    if (carry > 0) pose = mixPose(pose, { armF: [PI * 0.86, 0.25], armB: [PI * 0.82, 0.25], lean: 0.035 * nBox, head: 0.05 * nBox, legF: [0.12 + 0.03 * nBox, 0.12 + 0.05 * nBox], legB: [-0.08, 0.05], bob: Math.sin(tt * 3) * 0.004 * nBox }, carry);
    const fallK = ease(range(tt, T.fall + 0.4, T.fall + 1.4));
    if (fallK > 0) pose = mixPose(pose, { kneel: 1, lean: 0.55, head: 0.45, armF: [0.9, 1.6], armB: [0.8, 1.7] }, fallK);
    const up = hook ? 0 : ease(range(t, T.rise, T.rise + 2));
    if (up > 0) pose = mixPose(pose, { kneel: 0, lie: 0, lean: 0, head: 0, armF: [1.1, 0.2], armB: [0.2, 0.3], legF: [0.05, 0.05], legB: [-0.05, 0.05] }, up);
    if (!hook && t > T.rest) pose = mixPose(pose, { armF: [0.25, 0.25], armB: [0.15, 0.25], head: -0.12 }, ease(range(t, T.rest, T.rest + 1.5)));
    // l'amie qui vient l'aider
    let fx = 1750, fp = { armF: [0.3, 0.3] };
    if (!hook && t > T.help) { const k = ease(range(t, T.help, T.help + 2.6)); fx = lerp(1750, HX + 190, k); fp = k < 1 ? walkPose(t * 4.2) : mixPose({ armF: [0.3, 0.3] }, { armF: [1.35, 0.15], armB: [0.2, 0.3], lean: 0.12 }, ease(range(t, T.help + 2.6, T.rise))); if (t > T.rise + 2) fp = mixPose(fp, { armF: [0.9, 0.3], lean: 0, head: -0.05 }, ease(range(t, T.rise + 2, T.rise + 3))); }
    if (!hook && t > T.help) actor(ctx, fx, HD + 0.01, 470, fp, { color: FRIEND, glow: 20, flip: -1 });
    const her = actor(ctx, x, HD, 480, pose, { color: mixC(HER, '#4a4650', dim), glow: lerp(24, 4, dim), flip: 1 });
    // ce qu'elle porte : la pile monte au-dessus d'elle, puis tombe au sol quand elle s'effondre
    const floorY = depthY(HD) - 26;
    BOX.forEach(([s, fr, en, col], i) => {
      if (tt < s) return; const k = eout(range(tt, s, s + 0.55));
      const sway = Math.sin(tt * 2.2) * i * 3 * (1 - fallK);
      const sx = her.head[0] + sway, sy = her.head[1] - 70 - i * 50;
      const tx = HX - 420 + i * 150 + (i % 2) * 30, ty = floorY - (i % 2) * 6, rot = (i % 2 ? 0.12 : -0.1);
      const fk = ease(range(tt, T.fall + 0.3 + i * 0.08, T.fall + 1.1 + i * 0.08));
      const gone = hook ? 0 : range(t, 46 + i * 0.55, 46.6 + i * 0.55); // elle apprend à poser
      box(ctx, lerp(sx, tx, fk), lerp(lerp(-60, sy, k), ty, fk) - Math.sin(fk * PI) * 80, 210, fr, en, col, 1 - gone, lerp(0, rot, fk));
    });
    // ——— habillage
    corners(ctx, W, H, 1);
    panel(ctx, 70, 66, 470, 50); ctx.save(); ctx.fillStyle = ORA; ctx.beginPath(); ctx.roundRect(82, 76, 96, 30, 6); ctx.fill(); ctx.restore();
    label(ctx, 130, 98, 'SANTÉ', '#111', 17, 1, 'center'); label(ctx, 196, 98, 'BURN-OUT · RECONSTITUTION', '#e6e9f2', 17);
    battery(ctx, 84, 150, bat, t, 1, charging); label(ctx, 86, 262, 'ÉNERGIE · ENERGY', '#aab2c4', 16);
    // horloge et jours qui défilent
    const day = tt < T.load ? 1 : Math.max(1, Math.round(Math.pow(range(tt, T.load, T.fall), 1.4) * 1095));
    const mins = tt < T.load ? 420 + (tt - T.start) * 4 : tt < T.fall ? 420 + ((tt - T.load) * 1300) % 960 : 420;
    panel(ctx, W / 2 - 130, 56, 260, 96); ctx.save(); ctx.fillStyle = RED; ctx.globalAlpha = Math.sin(t * 6) > 0 ? 1 : 0.3; ctx.beginPath(); ctx.arc(W / 2 - 92, 92, 9, 0, PI * 2); ctx.fill(); ctx.restore();
    big(ctx, W / 2 + 14, 110, hhmm(mins), '#fff', 52, 1, 'center', 800); label(ctx, W / 2, 140, `JOUR ${day} · DAY ${day}`, '#aab2c4', 15, 1, 'center');
    // compteurs à droite
    const pa = hook ? 1 : range(t, T.load - 0.4, T.load + 0.4);
    if (pa > 0) {
      const px = 1430, py = 200; panel(ctx, px, py, 420, 330, pa);
      const heal = hook ? 0 : ease(range(t, T.rise + 1, T.rest + 2)), mails = Math.round((tt < 14 ? 0 : Math.pow(range(tt, 14, T.fall), 1.2) * 312) * (1 - heal)), sleep = lerp(lerp(8, 4, range(tt, T.load, 28)), 7.5, heal), bpm = Math.round(lerp(72, 126, range(tt, T.signs, T.fall)));
      label(ctx, px + 24, py + 40, 'MAILS NON LUS · UNREAD', '#aab2c4', 15, pa); big(ctx, px + 24, py + 92, `${mails}`, mails > 150 ? ORA : '#fff', 50, pa, 'left', 900);
      label(ctx, px + 24, py + 140, 'SOMMEIL · SLEEP', '#aab2c4', 15, pa); big(ctx, px + 24, py + 192, `${sleep.toFixed(1).replace('.', ',')} h`, sleep < 5 ? ORA : '#fff', 50, pa, 'left', 900);
      label(ctx, px + 24, py + 240, 'CŒUR · HEART', '#aab2c4', 15, pa); big(ctx, px + 24, py + 300, `${tt > T.rise && !hook ? 74 : bpm}`, bpm > 105 && !(tt > T.rise) ? RED : '#fff', 50, pa, 'left', 900); label(ctx, px + 130, py + 300, 'BPM', '#aab2c4', 15, pa);
      pulse(ctx, px + 190, py + 250, 210, 60, t, tt > T.rise && !hook ? 74 : bpm, '#ff5b6b', pa);
    }
    // alertes du corps
    ALERTS.forEach(([s, fr, en], i) => {
      const a = hook ? 1 : eout(range(t, s, s + 0.4)) * (1 - range(t, T.rise, T.rise + 1)); if (a <= 0 || tt < s) return;
      const y = 570 + i * 64; panel(ctx, 1430, y, 420, 52, a, 'rgba(255,90,90,0.55)');
      label(ctx, 1452, y + 34, `⚠ ${fr}`, '#ff8a8a', 18, a); label(ctx, 1830, y + 34, en, '#aab2c4', 14, a, 'right');
    });
    if (!hook && tt > T.fall + 0.2 && tt < T.rise + 0.5) alarm(ctx, W / 2 + 40, 330, 'BURN-OUT', t, hook ? 1 : fade(t, T.fall + 0.2, T.fall + 0.5, T.rise - 0.5, T.rise + 0.3), 84);
    // accroche du début (et de la fin)
    if (hook) { hookBox(ctx, W / 2, 470, '2 % D’ÉNERGIE', 'après 3 ans de « tout va bien »', fade(t, 0, 0.3, 3.9, 4.4)); label(ctx, W / 2, 610, '2% ENERGY · AFTER 3 YEARS OF "I’M FINE"', '#e6e9f2', 20, fade(t, 0.4, 0.8, 3.9, 4.4), 'center'); }
    if (t > T.rew && t < T.start) { const k = range(t, T.rew, T.start); ctx.save(); ctx.fillStyle = `rgba(0,0,0,${Math.sin(k * PI) * 0.85})`; ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = Math.sin(k * PI); ctx.fillStyle = 'rgba(255,255,255,0.08)'; for (let y = (t * 900) % 24; y < H; y += 24) ctx.fillRect(0, y, W, 3); ctx.restore();
      big(ctx, W / 2, H / 2 + 20, '◀◀  3 ANS PLUS TÔT', '#fff', 70, Math.sin(k * PI), 'center', 900); label(ctx, W / 2, H / 2 + 76, '3 YEARS EARLIER', '#cfd6e4', 22, Math.sin(k * PI), 'center'); }
    // sous-titres mot à mot
    kcap(ctx, W, 'Elle disait toujours : *« Tout va bien. »*', t, 0.3, 4.1);
    kcap(ctx, W, 'Elle *aimait* son travail.', t, 6.2, 11.6);
    kcap(ctx, W, 'Elle disait *oui* à tout.', t, 12.4, 17.6);
    kcap(ctx, W, 'Elle dormait *de moins en moins*.', t, 18, 23.6);
    kcap(ctx, W, 'Son corps envoyait des *signaux*.', t, 24.4, 29.2);
    kcap(ctx, W, 'Elle répondait : *« Tout va bien. »*', t, 29.6, 34.8);
    kcap(ctx, W, 'Un matin, elle n’a *pas pu se lever*.', t, 35.8, 40.2);
    kcap(ctx, W, 'Elle a *demandé de l’aide*.', t, 40.8, 45.6);
    kcap(ctx, W, 'Elle a appris à *poser* des choses.', t, 46, 50.2);
    kcap(ctx, W, 'Se reposer n’est *pas une faiblesse*.', t, 50.8, 54.8);
    kcap(ctx, W, 'Et toi, *ça va vraiment* ?', t, 55.2, 58.2);
    if (t > T.end) { ctx.fillStyle = `rgba(0,0,0,${range(t, T.end, T.end + 0.8)})`; ctx.fillRect(0, 0, W, H); if (t > T.end + 0.8) { caption(ctx, W, 'Tu n’as pas à tout porter.', fade(t, 59.3, 59.9, 61.3, 61.9), 440, 50); caption(ctx, W, 'Tout va bien ?', fade(t, 59.9, 60.5, 61.3, 61.9) * 0.7, 700, 34); } }
  };
}
