// « ARGENT FACILE » — sensibilisation au recrutement des jeunes par les réseaux criminels
// (style bonhommes + habillage reconstitution). 16:9, ~62 s.
// Un ado sans argent accepte « juste une livraison ». Chaque livraison ajoute un lien rouge, puis les barreaux d'une cage.
// Sa mère appelle ; un jour, il répond, et sort de la cage.
import { PI, clamp, range, lerp, ease, eout, fade, walkPose, mixPose, depthY, depthS, stage, actor, caption, mixC } from '../engine/bonhomme.js';
import { kcap, panel, label, big, hookBox, alarm, corners, battery, YEL, RED, ORA } from '../engine/hud.js';

export const world = 'flat', fps = 24, duration = 62, width = 1920, height = 1080;
export const title = 'ARGENT FACILE';
const T = { hook: 0, rew: 4.4, start: 5.6, offer: 12, first: 18, more: 24, cage: 30, ask: 35.8, call: 39.4, out: 43.2, free: 47, end: 58.4 };

// livraisons : [départ, retour, gain]
const TRIPS = [[18.4, 21.2, 50], [24.2, 25.6, 150], [25.8, 27.2, 300], [27.4, 28.8, 600], [29, 30.4, 1300]];
const ALERTS = [[25, 'SÈCHE LES COURS', 'skips school'], [27.6, 'MENT À SA MÈRE', 'lying to mom'], [30.4, 'UNE « DETTE »', 'a "debt"'], [32.8, 'MENACES', 'threats']];

export const CUES = [
  ['heart', 0, { until: 4.4, from: 112, to: 120 }], ['rewind', 4.4, { dur: 1.3 }],
  ['piano', 5.6, { theme: 'main', until: 12.2 }], ['steps', 9.6, { dur: 2.4 }], ['notif', 12.6],
  ['piano', 12, { theme: 'tension', until: 30.2 }], ...TRIPS.map(([, b]) => ['ding', b]), ['steps', 18.4, { dur: 2.6 }], ['steps', 24.2, { dur: 6 }],
  ...ALERTS.map(([s]) => ['clench', s]), ['piano', 30, { theme: 'deuil', until: 39.6 }], ['cuffs', 33], ['cellDoor', 34.4],
  ['heart', 35.8, { until: 39.4, from: 80, to: 130 }], ['phone', 39.4, { dur: 3.5 }],
  ['crack', 43.6], ['crack', 44], ['crack', 44.4], ['breath', 44.8, { dur: 2 }],
  ['piano', 43.2, { theme: 'main', until: 50.6 }], ['steps', 45.4, { dur: 2.8 }], ['piano', 50.4, { theme: 'fin', until: 61.8 }],
];

const TEEN = '#ffd9a8', RECR = '#9a3a3a', MUM = '#ffe9c4', CHAIN = 'rgba(255,70,80,0.95)';
const TX = 760, TD = 0.66, RX = 1120, RD = 0.6, MX = 300, MD = 0.52;

function parcel(ctx, p, s = 1, a = 1, hot = 0) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.translate(p[0], p[1]); ctx.scale(s, s); ctx.fillStyle = mixC('#a8794a', '#7a2020', hot); ctx.strokeStyle = hot ? '#ff5b5b' : '#e2c08f'; ctx.lineWidth = 3; ctx.shadowColor = hot ? RED : '#e2c08f'; ctx.shadowBlur = 10 + hot * 20;
  ctx.fillRect(-22, -18, 44, 36); ctx.strokeRect(-22, -18, 44, 36); ctx.beginPath(); ctx.moveTo(-22, 0); ctx.lineTo(22, 0); ctx.moveTo(0, -18); ctx.lineTo(0, 18); ctx.stroke(); ctx.restore(); }

export function build({ ctx, begin, W, H }) {
  return (t) => {
    begin();
    const hook = t < T.rew, tt = hook ? 35 : t;
    const trips = TRIPS.filter(([, b]) => tt > b).length;
    const money = TRIPS.filter(([, b]) => tt > b).reduce((s, x) => s + x[2], 0);
    const out = hook ? 0 : ease(range(t, T.out, T.out + 1.5));
    let free = 1;
    if (tt > T.first) free = lerp(1, 0.6, range(tt, T.first, T.more));
    if (tt > T.more) free = lerp(0.6, 0.3, range(tt, T.more, T.cage));
    if (tt > T.cage) free = lerp(0.3, 0.04, range(tt, T.cage, T.ask));
    if (out > 0) free = lerp(0.04, 0.92, ease(range(t, T.out, T.free + 4)));
    const dim = clamp((1 - free) * 0.9);
    stage(ctx, W, H, lerp(1, 0.5, dim), !hook && t > T.free ? ease(range(t, T.free, T.free + 2)) * 0.7 : 0);
    // la mère, au loin, qui appelle
    const mumA = hook ? 0.8 : fade(t, T.cage - 1, T.cage + 1, 99, 100);
    if (mumA > 0) { let mp = { armF: [2.1, 0.9], armB: [0.2, 0.3], head: 0.15 }; if (!hook && t > T.out + 2.5) mp = mixPose(mp, { armF: [PI * 0.62, 0.2], armB: [PI * 0.58, 0.2], head: -0.05 }, ease(range(t, T.out + 2.5, T.out + 4)));
      const mk = hook ? 0 : ease(range(t, T.out + 2.2, T.free + 1)); if (mk > 0 && mk < 1) mp = walkPose(t * 4.2); const mum = actor(ctx, lerp(MX, TX - 170, mk), lerp(MD, TD, mk), lerp(460, 450, mk), mp, { color: MUM, glow: 14, flip: 1, alpha: mumA * lerp(0.75, 1, out) });
      if (tt > T.cage && (hook || t < T.out + 2.5)) { ctx.save(); ctx.globalAlpha = mumA; ctx.fillStyle = '#cfe2ff'; ctx.shadowColor = '#7fb2ff'; ctx.shadowBlur = 16; ctx.fillRect(mum.hand[0] - 8, mum.hand[1] - 14, 16, 28); ctx.restore(); } }
    // le recruteur
    const rIn = hook ? 1 : ease(range(t, 9.6, 12));
    let rp = rIn < 1 ? walkPose(t * 4) : { armF: [0.3, 0.3], armB: [0.2, 0.3], lean: -0.04 };
    if (!hook && t > 12.8 && t < 15.2) rp = { armF: [1.45, 0.1], armB: [0.2, 0.3], lean: 0.05 };
    if (tt > T.ask && tt < T.call + 1) rp = { armF: [1.5, 0.05], armB: [0.2, 0.3], lean: 0.1 };
    const rAlpha = (rIn > 0 ? 1 : 0) * (1 - out * 0.85);
    const rec = rAlpha > 0 ? actor(ctx, lerp(1800, RX, rIn), RD, lerp(500, 560, clamp(trips / 5)), rp, { color: RECR, glow: 8, flip: -1, alpha: 0.92 * rAlpha }) : null;
    // lui
    let x = TX, pose = { armF: [0.06, 0.1], armB: [-0.04, 0.1], head: 0.22 }, flip = 1; // mains dans les poches, tête basse
    if (!hook && t < T.start + 3) { x = lerp(420, TX, ease(range(t, T.start - 0.2, T.start + 3))); pose = walkPose(t * 3.6, 0.8); }
    if (!hook && t > 13.6 && t < T.first) pose = mixPose(pose, { armF: [1.35, 0.15], armB: [0.1, 0.2], head: 0.05 }, ease(range(t, 13.6, 14.6)));
    TRIPS.forEach(([a, b]) => { if (tt > a && tt < b) { const m = (a + b) / 2, k = tt < m ? ease(range(tt, a, m)) : 1 - ease(range(tt, m, b)); x = lerp(TX, 330, k); pose = walkPose(tt * 5); flip = tt < m ? -1 : 1; } });
    if (tt > T.cage && !(tt > TRIPS[4][0] && tt < TRIPS[4][1])) pose = mixPose(pose, { armF: [0.1, 0.2], armB: [0.05, 0.2], head: 0.4, lean: 0.12 }, ease(range(tt, T.cage + 0.4, T.cage + 2)));
    if (!hook && t > T.call && t < T.out + 2) pose = mixPose(pose, { armF: [2.6, 1.9], armB: [0.1, 0.2], head: 0.05, lean: 0 }, ease(range(t, T.call + 1.2, T.call + 2)));
    if (!hook && t > T.out + 2) { flip = -1; pose = mixPose(pose, { armF: [PI * 0.6, 0.2], armB: [PI * 0.55, 0.2], head: -0.05, lean: 0 }, ease(range(t, T.free, T.free + 1.2))); }
    const me = actor(ctx, x, TD, 470, pose, { color: mixC(TEEN, '#4a4650', dim), glow: lerp(22, 4, dim), flip });
    // le colis
    if (!hook && t > 12.8 && t < 14.6 && rec) parcel(ctx, rec.hand, 1, 1);
    const carrying = (!hook && t > 14.6 && t < T.first + 0.4) || TRIPS.some(([a, b]) => tt > a - 0.4 && tt < (a + b) / 2);
    if (carrying) parcel(ctx, me.hand, 1, 1);
    if (tt > T.ask && tt < T.out && rec) parcel(ctx, rec.hand, 1.6, 1 - range(tt, T.call + 1, T.out), 1);
    // liens rouges : un par livraison
    if (rec) for (let i = 0; i < trips; i++) {
      const a = rec.hand, b = [me.head[0] + (i - 2) * 14, me.head[1] + 60 + i * 30], cut = hook ? 0 : range(t, T.out + 0.4 + i * 0.25, T.out + 1.2 + i * 0.25);
      if (cut >= 1) continue; ctx.save(); ctx.strokeStyle = CHAIN; ctx.lineWidth = 3; ctx.shadowColor = RED; ctx.shadowBlur = 10; ctx.globalAlpha = 1 - cut; ctx.setLineDash([14, 8]);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo((a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 60 + Math.sin(t * 2 + i) * 8, b[0], b[1] + cut * 120); ctx.stroke(); ctx.restore();
    }
    // la cage qui se referme autour de lui
    const bars = hook ? 7 : Math.floor(clamp(range(t, T.cage, 34.4)) * 7.999);
    if (bars > 0) { const cx = TX, top = depthY(TD) - 470 * depthS(TD) - 50, bot = depthY(TD) + 6, wdt = 260; ctx.save(); ctx.strokeStyle = 'rgba(255,90,90,0.9)'; ctx.shadowColor = RED; ctx.shadowBlur = 14; ctx.lineWidth = 6;
      for (let i = 0; i < bars; i++) { const bx = cx - wdt / 2 + (i / 6) * wdt, fk = hook ? 0 : ease(range(t, T.out + i * 0.12, T.out + 1 + i * 0.12)); ctx.globalAlpha = 1 - fk; ctx.beginPath(); ctx.moveTo(bx + fk * (i - 3) * 30, top + fk * 200); ctx.lineTo(bx + fk * (i - 3) * 60, bot); ctx.stroke(); }
      if (bars >= 7) { const fk = hook ? 0 : range(t, T.out, T.out + 0.8); ctx.globalAlpha = 1 - fk; ctx.beginPath(); ctx.moveTo(cx - wdt / 2 - 10, top + fk * 300); ctx.lineTo(cx + wdt / 2 + 10, top + fk * 300); ctx.stroke(); }
      ctx.restore(); }
    // son téléphone qui sonne
    if (!hook && t > T.call && t < T.out + 2) { const p = me.hand, ring = t < T.call + 1.4 ? Math.sin(t * 40) * 3 : 0; ctx.save(); ctx.fillStyle = '#d6e6ff'; ctx.shadowColor = '#7fb2ff'; ctx.shadowBlur = 22; ctx.fillRect(p[0] - 8 + ring, p[1] - 14, 16, 28); ctx.restore(); }
    // ——— habillage
    corners(ctx, W, H, 1);
    panel(ctx, 70, 66, 510, 50); ctx.save(); ctx.fillStyle = ORA; ctx.beginPath(); ctx.roundRect(82, 76, 120, 30, 6); ctx.fill(); ctx.restore();
    label(ctx, 142, 98, 'JEUNESSE', '#111', 17, 1, 'center'); label(ctx, 218, 98, 'ARGENT FACILE · RECONSTITUTION', '#e6e9f2', 17);
    battery(ctx, 84, 150, free, t, 1, out > 0); label(ctx, 86, 262, 'LIBERTÉ · FREEDOM', '#aab2c4', 16);
    const month = tt < T.first ? 1 : Math.min(12, 1 + Math.floor(range(tt, T.first, T.ask) * 11.99));
    panel(ctx, W / 2 - 130, 56, 260, 96); big(ctx, W / 2, 112, `MOIS ${month}`, '#fff', 50, 1, 'center', 800); label(ctx, W / 2, 140, `MONTH ${month}`, '#aab2c4', 15, 1, 'center');
    const pa = hook ? 1 : range(t, T.offer + 0.4, T.offer + 1.2);
    if (pa > 0) { const px = 1430, py = 200, calls = tt < T.cage ? 0 : Math.min(15, 1 + Math.floor(range(tt, T.cage, T.call) * 14)); panel(ctx, px, py, 420, 330, pa);
      label(ctx, px + 24, py + 40, 'GAGNÉ · EARNED', '#aab2c4', 15, pa); big(ctx, px + 24, py + 94, `${money.toLocaleString('fr-FR').replace(/ | /g, ' ')} €`, money ? YEL : '#fff', 52, pa, 'left', 900);
      label(ctx, px + 24, py + 140, 'LIVRAISONS · DELIVERIES', '#aab2c4', 15, pa); big(ctx, px + 24, py + 192, `${trips}`, '#fff', 50, pa, 'left', 900);
      label(ctx, px + 24, py + 240, 'APPELS MANQUÉS · MISSED CALLS', '#aab2c4', 15, pa); big(ctx, px + 24, py + 300, `${calls}`, calls > 5 ? RED : '#fff', 50, pa, 'left', 900); label(ctx, px + 110, py + 300, 'MAMAN · MOM', '#aab2c4', 15, pa); }
    ALERTS.forEach(([s, fr, en], i) => { const a = hook ? 1 : eout(range(t, s, s + 0.4)) * (1 - range(t, T.out, T.out + 1)); if (a <= 0 || tt < s) return;
      const y = 570 + i * 64; panel(ctx, 1430, y, 420, 52, a, 'rgba(255,90,90,0.55)'); label(ctx, 1452, y + 34, `⚠ ${fr}`, '#ff8a8a', 17, a); label(ctx, 1830, y + 34, en, '#aab2c4', 14, a, 'right'); });
    if (!hook && t > 34.4 && t < T.call + 0.4) alarm(ctx, W / 2 + 40, 330, 'PIÉGÉ · TRAPPED', t, fade(t, 34.4, 34.8, T.call - 0.4, T.call + 0.4), 72);
    if (hook) { hookBox(ctx, W / 2, 360, '50 € POUR 10 MINUTES', 'c’est comme ça qu’on l’a piégé', fade(t, 0, 0.3, 3.9, 4.4), 74); label(ctx, W / 2, 470, '€50 FOR 10 MINUTES · THAT’S HOW THEY TRAPPED HIM', '#e6e9f2', 20, fade(t, 0.4, 0.8, 3.9, 4.4), 'center'); }
    if (t > T.rew && t < T.start) { const k = range(t, T.rew, T.start); ctx.save(); ctx.fillStyle = `rgba(0,0,0,${Math.sin(k * PI) * 0.85})`; ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = Math.sin(k * PI); ctx.fillStyle = 'rgba(255,255,255,0.08)'; for (let y = (t * 900) % 24; y < H; y += 24) ctx.fillRect(0, y, W, 3); ctx.restore();
      big(ctx, W / 2, H / 2 + 20, '◀◀  1 AN PLUS TÔT', '#fff', 70, Math.sin(k * PI), 'center', 900); label(ctx, W / 2, H / 2 + 76, '1 YEAR EARLIER', '#cfd6e4', 22, Math.sin(k * PI), 'center'); }
    // sous-titres mot à mot
    kcap(ctx, W, 'On lui a promis de *l’argent facile*.', t, 0.3, 4.1);
    kcap(ctx, W, 'Il avait 16 ans. *Pas un sou.*', t, 6.2, 11.6);
    kcap(ctx, W, 'Un « ami » lui a proposé *une livraison*.', t, 12.4, 17.6);
    kcap(ctx, W, '*50 €* pour 10 minutes.', t, 18.2, 23.6);
    kcap(ctx, W, 'Puis une autre. Et *encore une autre*.', t, 24.2, 29.6);
    kcap(ctx, W, 'L’argent facile a toujours *un prix*.', t, 30.2, 35.4);
    kcap(ctx, W, '« Cette fois, prends *celle-là*. »', t, 35.8, 39);
    kcap(ctx, W, 'Sa mère appelait. *Pour la 15e fois.*', t, 39.4, 42.8);
    kcap(ctx, W, 'Cette fois, *il a répondu*.', t, 43.2, 46.8);
    kcap(ctx, W, 'Il n’est *jamais trop tard* pour sortir.', t, 47.2, 52.4);
    kcap(ctx, W, 'Et toi, *on t’a déjà proposé* ?', t, 52.8, 58.2);
    if (t > T.end) { ctx.fillStyle = `rgba(0,0,0,${range(t, T.end, T.end + 0.8)})`; ctx.fillRect(0, 0, W, H); if (t > T.end + 0.8) { caption(ctx, W, 'L’argent facile coûte toujours plus cher.', fade(t, 59.3, 59.9, 61.3, 61.9), 440, 46); caption(ctx, W, 'Argent facile', fade(t, 59.9, 60.5, 61.3, 61.9) * 0.7, 700, 34); } }
  };
}
