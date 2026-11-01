// « UNE SECONDE DE TROP » — sensibilisation au téléphone au volant (style bonhommes, 16:9, ~62 s).
// Un père rentre chez lui. Sa fille lui écrit « Tu arrives quand ? ». Il baisse les yeux une seconde…
// Une autre petite fille traversait. Elle aussi, quelqu'un l'attendait. Puis le temps se rembobine.
import { PI, clamp, range, lerp, ease, eout, fade, figure, walkPose, mixPose, HOR, depthY, depthS, stage, actor, caption, mixC } from '../engine/bonhomme.js';

export const world = 'flat', fps = 24, duration = 62, width = 1920, height = 1080;
export const title = 'UNE SECONDE DE TROP';
const T = { drive: 0, msg: 6.5, look: 12, impact: 15.6, after: 16.4, homes: 28, rewind: 40, replay: 43, home: 51, end: 58.4 };

export const CUES = [
  ['engine', 0, { until: 15.6 }], ['piano', 0.2, { theme: 'main', until: 12.2 }], ['notif', 7.0], ['notif', 10.6],
  ['heart', 12, { until: 15.5, from: 90, to: 160 }], ['tires', 14.6], ['silence', 15.6, { dur: 1.5 }],
  ['ring', 15.7, { dur: 4 }], ['piano', 17.6, { theme: 'deuil', until: 28.2 }], ['siren', 21, { dur: 5 }],
  ['piano', 28, { theme: 'partir', until: 40.2 }], ['notif', 30.4], ['notif', 33.0],
  ['rewind', 40.0, { dur: 2.8 }], ['engine', 43, { until: 51 }], ['notif', 44.0], ['piano', 43, { theme: 'main', until: 51.2 }],
  ['steps', 51.5, { dur: 1.6 }], ['piano', 51, { theme: 'fin', until: 61.8 }],
];

const CAR_X = 760, ROAD = depthY(0.72); // la voiture reste à l'écran, la route défile
// voiture vue de côté, en traits lumineux
function car(ctx, x, y, s, glow = 18, dim = 0) {
  ctx.save(); ctx.strokeStyle = mixC('#ffffff', '#5a5c66', dim); ctx.lineWidth = 7 * s; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.shadowColor = '#ffffff'; ctx.shadowBlur = glow * (1 - dim);
  ctx.beginPath(); ctx.moveTo(x - 300 * s, y - 60 * s); ctx.lineTo(x - 290 * s, y - 130 * s); ctx.lineTo(x - 150 * s, y - 145 * s); ctx.lineTo(x - 80 * s, y - 230 * s); ctx.lineTo(x + 110 * s, y - 230 * s); ctx.lineTo(x + 200 * s, y - 140 * s); ctx.lineTo(x + 300 * s, y - 120 * s); ctx.lineTo(x + 310 * s, y - 60 * s); ctx.stroke();
  [-190, 190].forEach((wx) => { ctx.beginPath(); ctx.arc(x + wx * s, y - 50 * s, 48 * s, 0, PI * 2); ctx.stroke(); });
  ctx.beginPath(); ctx.moveTo(x - 135 * s, y - 60 * s); ctx.lineTo(x + 140 * s, y - 60 * s); ctx.stroke();
  // phares
  ctx.fillStyle = `rgba(255,245,210,${0.9 * (1 - dim)})`; ctx.beginPath(); ctx.arc(x + 300 * s, y - 100 * s, 10 * s, 0, PI * 2); ctx.fill();
  const g = ctx.createLinearGradient(x + 300 * s, 0, x + 900 * s, 0); g.addColorStop(0, `rgba(255,245,210,${0.25 * (1 - dim)})`); g.addColorStop(1, 'rgba(255,245,210,0)'); ctx.fillStyle = g; ctx.shadowBlur = 0;
  ctx.beginPath(); ctx.moveTo(x + 300 * s, y - 110 * s); ctx.lineTo(x + 900 * s, y - 200 * s); ctx.lineTo(x + 900 * s, y + 10 * s); ctx.lineTo(x + 300 * s, y - 90 * s); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function road(ctx, W, scroll, crossX = null) {
  ctx.save(); ctx.strokeStyle = 'rgba(220,224,235,0.55)'; ctx.lineWidth = 6; for (let x = -((scroll % 220) + 220); x < W + 220; x += 220) { ctx.beginPath(); ctx.moveTo(x, ROAD + 60); ctx.lineTo(x + 110, ROAD + 60); ctx.stroke(); }
  // réverbères
  for (let x = -((scroll * 0.6) % 700); x < W + 700; x += 700) { ctx.strokeStyle = 'rgba(160,165,180,0.5)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x, ROAD - 10); ctx.lineTo(x, ROAD - 470); ctx.lineTo(x + 60, ROAD - 470); ctx.stroke(); const g = ctx.createRadialGradient(x + 60, ROAD - 460, 2, x + 60, ROAD - 300, 300); g.addColorStop(0, 'rgba(255,220,160,0.35)'); g.addColorStop(1, 'rgba(255,220,160,0)'); ctx.fillStyle = g; ctx.fillRect(x - 250, ROAD - 480, 620, 520); }
  if (crossX !== null) { ctx.fillStyle = 'rgba(235,238,245,0.75)'; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(crossX + i * 34, ROAD + 20); ctx.lineTo(crossX + i * 34 + 18, ROAD + 20); ctx.lineTo(crossX + i * 34 + 40, ROAD + 110); ctx.lineTo(crossX + i * 34 + 22, ROAD + 110); ctx.closePath(); ctx.fill(); } }
  ctx.restore();
}
function bubble(ctx, x, y, text, a, s = 1) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.font = `500 ${Math.round(34 * s)}px 'Courier New', monospace`; const w = ctx.measureText(text).width + 44 * s; ctx.fillStyle = 'rgba(235,238,245,0.95)'; ctx.shadowColor = '#cfe2ff'; ctx.shadowBlur = 16; ctx.beginPath(); ctx.roundRect(x - w / 2, y, w, 62 * s, 20 * s); ctx.fill(); ctx.shadowBlur = 0; ctx.fillStyle = '#1a1b22'; ctx.textAlign = 'center'; ctx.fillText(text, x, y + 42 * s); ctx.restore(); }
function ball(ctx, x, y, r, a = 1) { ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#ff7a4a'; ctx.shadowColor = '#ff7a4a'; ctx.shadowBlur = 14; ctx.beginPath(); ctx.arc(x, y - r, r, 0, PI * 2); ctx.fill(); ctx.restore(); }
// fenêtre allumée d'une maison, quelqu'un attend derrière
function windowWait(ctx, x, y, who, light, t, phoneA = 0) {
  ctx.save(); ctx.strokeStyle = 'rgba(200,205,220,0.6)'; ctx.lineWidth = 6; ctx.fillStyle = `rgba(255,220,160,${0.16 * light})`; ctx.fillRect(x - 220, y - 520, 440, 420); ctx.strokeRect(x - 220, y - 520, 440, 420); ctx.beginPath(); ctx.moveTo(x, y - 520); ctx.lineTo(x, y - 100); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(x - 220, y - 520, 440, 420); ctx.clip(); const h = figure(ctx, x, y + 40, who === 'kid' ? 330 : 470, { armF: [phoneA ? 1.9 : 0.3, phoneA ? 0.9 : 0.3], head: -0.05 }, { color: mixC('#ffe9c4', '#4a4c55', 1 - light), glow: 16 * light }); ctx.restore();
  if (phoneA) { ctx.save(); ctx.globalAlpha = phoneA; ctx.fillStyle = '#cfe2ff'; ctx.shadowColor = '#7fb2ff'; ctx.shadowBlur = 18; ctx.fillRect(h.hand[0] - 8, h.hand[1] - 14, 16, 28); ctx.restore(); }
}

export function build({ ctx, begin, W, H }) {
  return (t) => {
    begin();
    const replay = t >= T.replay && t < T.home;
    if (t < T.after || replay) { // ---- sur la route ----
      const tt = replay ? t - T.replay + 6.5 : t; // la deuxième fois, on reprend au message
      const slow = replay ? 1 - 0.95 * ease(range(t, 47.8, 49.4)) : 1; // la 2e fois, il s'arrête au passage piéton
      const speed = 620 * slow;
      const dtS = clamp(t - 47.8, 0, 1.6); // freinage doux jusqu'au passage piéton
      const scroll = replay ? (t < 47.8 ? 620 * (t - T.replay + 10) : 620 * 14.8 + 620 * (dtS - dtS * dtS / 3.2)) : t * 620;
      stage(ctx, W, H, 0.55);
      // passage piéton + petite fille qui traverse avec son ballon
      const crossAt = 15.6 * 620 + CAR_X + 380; // position monde du passage
      const cx = crossAt - scroll;
      road(ctx, W, scroll, cx > -300 && cx < W + 300 ? cx : null);
      if (cx < W + 300 && cx > -300) {
        const kidT = replay ? range(t, 48.4, 51) : range(t, 13.4, 15.6);
        const kx = cx + 100, ky = lerp(ROAD - 40, ROAD + 120, kidT);
        const frozen = !replay && t > T.impact - 0.05;
        ctx.save(); ctx.globalAlpha = frozen ? 0.9 : 1;
        const hk = figure(ctx, kx, ky, 300 * depthS(0.75), mixPose(walkPose(t * 5, 0.8), replay && t > 50 ? { armF: [PI * 0.85, 0.1] } : {}, 1), { color: '#fff6d8', glow: 16, flip: replay && t > 50 ? -1 : 1 });
        ball(ctx, kx + 50, ky + 4, 16);
        ctx.restore();
      }
      const hurry = !replay && t > T.look;
      const tilt = hurry ? ease(range(t, T.look, T.look + 0.6)) : 0;
      const bounce = Math.sin(t * 18) * 2 * slow;
      // conducteur (assis, on ne voit que le haut du corps) puis la voiture
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, ROAD - 60 * 0.95); ctx.clip();
      const hd = figure(ctx, CAR_X - 20, ROAD + 40 + bounce, 420, { lean: 0.05 + tilt * 0.35, head: tilt * 0.75, armF: [1.3 - tilt * 0.3, -0.4 + tilt * 1.2], armB: [1.4, -0.4], legF: [1.5, 1.4], legB: [1.45, 1.4] }, { color: '#ffffff', glow: 14 });
      ctx.restore();
      car(ctx, CAR_X, ROAD + 10 + bounce, 0.95);
      // le téléphone sur le tableau de bord / dans la main
      const phoneLit = (tt > 6.8 && tt < 9) || (tt > 10.4 && tt < 12) || hurry;
      if (phoneLit || replay) { const px = hurry ? hd.hand[0] : CAR_X + 120, py = hurry ? hd.hand[1] : ROAD - 170 + bounce; ctx.save(); ctx.fillStyle = replay && t > 44.6 ? '#30333c' : '#cfe2ff'; ctx.shadowColor = '#7fb2ff'; ctx.shadowBlur = replay && t > 44.6 ? 0 : 22; ctx.fillRect(px - 10, py - 16, 20, 32); ctx.restore(); }
      bubble(ctx, CAR_X + 120, 330, 'Papa, tu arrives quand ?', replay ? fade(t, 44, 44.3, 46.4, 47) : fade(t, 7, 7.3, 15.4, 15.6) * (t < 10.6 || t > 11 ? 1 : 1));
      if (!replay) bubble(ctx, CAR_X + 120, 410, 'Réponds !', fade(t, 10.6, 10.9, 15.4, 15.6));
      // le gel : flash blanc puis noir
      if (!replay && t > T.impact - 0.08) { const k = range(t, T.impact - 0.08, T.impact); ctx.fillStyle = `rgba(255,255,255,${k})`; ctx.fillRect(0, 0, W, H); if (t > T.impact) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); } }
      caption(ctx, W, 'Il rentrait à la maison', fade(t, 0.8, 2, 5.4, 6.2));
      caption(ctx, W, 'Un message. Rien de grave.', fade(t, 7.6, 8.6, 11.2, 11.9));
      caption(ctx, W, 'Juste une seconde', fade(t, 12.4, 13, 15.2, 15.5));
      caption(ctx, W, 'Le message peut attendre', fade(t, 44.8, 45.8, 49.6, 50.4));
      if (replay) { ctx.fillStyle = `rgba(0,0,0,${1 - range(t, T.replay, T.replay + 0.6)})`; ctx.fillRect(0, 0, W, H); }
    } else if (t < T.homes) { // ---- après : le ballon seul, le téléphone au sol ----
      stage(ctx, W, H, 0.35);
      const kb = eout(range(t, 17, 21.5));
      ball(ctx, lerp(500, 1300, kb), ROAD + 80, 22, 1);
      ctx.save(); ctx.translate(820, ROAD + 90); ctx.rotate(-0.3); ctx.fillStyle = '#cfe2ff'; ctx.shadowColor = '#7fb2ff'; ctx.shadowBlur = 18; ctx.fillRect(-14, -24, 28, 48); ctx.restore();
      bubble(ctx, 960, 470, 'Papa, tu arrives quand ?', fade(t, 22.5, 23.2, 27.2, 27.8), 1.1);
      if (t > 21 && t < 26) { const ph = Math.floor(t * 4) % 2; ctx.fillStyle = ph ? 'rgba(60,90,255,0.08)' : 'rgba(255,60,60,0.08)'; ctx.fillRect(0, 0, W, H); }
      caption(ctx, W, 'Une seconde de trop', fade(t, 17.2, 18.2, 21.4, 22.2));
      caption(ctx, W, 'Elle aussi,\nquelqu’un l’attendait à la maison', fade(t, 23.4, 24.4, 27.2, 27.9));
      ctx.fillStyle = `rgba(0,0,0,${1 - range(t, T.after, T.after + 1.2)})`; ctx.fillRect(0, 0, W, H);
    } else if (t < T.rewind) { // ---- deux maisons, deux fenêtres ----
      stage(ctx, W, H, 0.4);
      const dimA = ease(range(t, 31, 38)) * 0.75;
      windowWait(ctx, 560, 820, 'kid', 1 - dimA * 0.3, t, fade(t, 29.5, 30, 39, 39.5));
      windowWait(ctx, 1360, 820, 'mum', 1 - dimA, t, fade(t, 32, 32.5, 39, 39.5));
      caption(ctx, W, 'Deux familles.\nUne seule seconde.', fade(t, 29, 30.2, 34.4, 35.2));
      caption(ctx, W, 'Et si tu pouvais revenir en arrière ?', fade(t, 35.8, 36.8, 39.2, 39.9));
      ctx.fillStyle = `rgba(0,0,0,${Math.max(1 - range(t, T.homes, T.homes + 0.8), range(t, T.rewind - 0.6, T.rewind))})`; ctx.fillRect(0, 0, W, H);
    } else if (t < T.replay) { // ---- rembobinage ----
      ctx.fillStyle = '#050506'; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.strokeStyle = 'rgba(220,225,240,0.5)'; ctx.lineWidth = 3; for (let i = 0; i < 40; i++) { const y = (i * 53 + t * 1400) % H; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y + 4); ctx.stroke(); } ctx.restore();
      ctx.save(); ctx.fillStyle = '#ffffff'; ctx.font = "600 90px 'Courier New', monospace"; ctx.textAlign = 'center'; ctx.globalAlpha = 0.85; ctx.fillText('◀◀', 960, 560); ctx.restore();
    } else { // ---- il arrive chez lui ; sa fille court vers lui ----
      stage(ctx, W, H, 1, ease(range(t, T.home, T.home + 2)) * 0.8);
      const k = ease(range(t, T.home + 0.3, T.home + 2.6));
      const hug = range(t, T.home + 2.6, T.home + 3.4);
      actor(ctx, lerp(560, 860, k), 0.78, 520, k < 1 ? walkPose(t * 4) : { lean: 0.25, armF: [1.4, 0.6], armB: [1.3, 0.7], kneel: hug }, { color: '#ffffff', glow: 24 });
      actor(ctx, lerp(1500, 1000, k), 0.78, 330, k < 1 ? walkPose(t * 6) : { armF: [PI * 0.7, 0.4], armB: [PI * 0.7, 0.4] }, { color: '#fff6d8', glow: 22, flip: -1 });
      caption(ctx, W, 'Eux, non.', fade(t, T.home + 1, T.home + 2, T.end - 0.8, T.end), 130, 52);
      ctx.fillStyle = `rgba(0,0,0,${1 - range(t, T.home, T.home + 0.8)})`; ctx.fillRect(0, 0, W, H);
    }
    if (t > T.end) { ctx.fillStyle = `rgba(0,0,0,${range(t, T.end, T.end + 0.8)})`; ctx.fillRect(0, 0, W, H); if (t > T.end + 0.8) { caption(ctx, W, 'Au volant, pose ton téléphone.', fade(t, 59.3, 59.9, 61.3, 61.9), 440, 50); caption(ctx, W, 'Une seconde de trop', fade(t, 59.9, 60.5, 61.3, 61.9) * 0.7, 700, 34); } }
  };
}
