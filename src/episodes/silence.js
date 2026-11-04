// « LE SILENCE DES HOMMES » — sensibilisation à la santé mentale des hommes (style bonhommes + habillage reconstitution).
// Enfant, on lui dit qu'un homme ne pleure pas : il se couvre d'une armure. Les coups de la vie la fissurent ;
// il répond toujours « ça va ». Un ami insiste ; l'armure tombe, il pleure, et sa lumière revient. 16:9, ~62 s.
import { PI, clamp, range, lerp, ease, eout, fade, walkPose, mixPose, depthY, depthS, stage, actor, caption, mixC } from '../engine/bonhomme.js';
import { kcap, panel, label, big, hookBox, corners, battery, YEL, RED, ORA } from '../engine/hud.js';

export const world = 'flat', fps = 24, duration = 62, width = 1920, height = 1080;
export const title = 'LE SILENCE DES HOMMES';
const T = { hook: 0, rew: 4.4, start: 5.6, grow: 12, hits: 18, fine: 24, stat: 30, ask: 35.8, cry: 42, talk: 48, end: 58.4 };

const HITS = [[18.6, 'CHÔMAGE', 'JOB LOSS'], [20, 'RUPTURE', 'BREAKUP'], [21.4, 'DEUIL', 'GRIEF'], [22.8, 'DETTES', 'DEBTS']];
// bulles de dialogue : [début, fin, qui, français, anglais]
const TALK = [[24.6, 26, 'f', 'Ça va ?', 'You okay?'], [25.8, 27.2, 'm', 'Ça va.', 'I’m fine.'], [27.4, 28.8, 'f', 'Ça va ?', 'You okay?'], [28.6, 30, 'm', 'Ça va.', 'I’m fine.'], [37.6, 41.4, 'f', 'Ça va… vraiment ?', 'Are you really okay?']];

export const CUES = [
  ['heart', 0, { until: 4.4, from: 96, to: 104 }], ['rewind', 4.4, { dur: 1.3 }],
  ['piano', 5.6, { theme: 'heritage', until: 12.2 }], ['thud', 6.6], ['cuffs', 10.2], ['cuffs', 13.4], ['cuffs', 15],
  ['piano', 12, { theme: 'tension', until: 30.2 }], ...HITS.flatMap(([s]) => [['thud', s + 0.5], ['crack', s + 0.55]]),
  ...TALK.slice(0, 4).map(([s]) => ['word', s]), ['piano', 30, { theme: 'deuil', until: 42.2 }],
  ['steps', 35.9, { dur: 1.8 }], ['heart', 37.6, { until: 42, from: 70, to: 118 }], ['crack', 42.1], ['shatter', 42.5], ['breath', 43.2, { dur: 3 }],
  ['piano', 42.2, { theme: 'main', until: 50.6 }], ['twinkle', 46.4], ['piano', 50.4, { theme: 'fin', until: 61.8 }],
];

const HIM = '#ffe2c0', FRIEND = '#cfe0ff', DAD = '#b9c0d2', STEEL = '#8b93a6';
const MX = 820, MD = 0.66, FX0 = 1260;

function tag(ctx, x, y, fr, en, col, a = 1, rot = 0) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(rot); ctx.font = "800 22px Inter, sans-serif"; const w = ctx.measureText(fr).width + 40;
  ctx.fillStyle = 'rgba(16,18,24,0.92)'; ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.shadowColor = col; ctx.shadowBlur = 12; ctx.beginPath(); ctx.roundRect(-w / 2, -24, w, 48, 8); ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
  ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.fillText(fr, 0, 0); ctx.font = "italic 600 14px Inter, sans-serif"; ctx.fillStyle = '#cfd6e4'; ctx.fillText(en, 0, 17); ctx.restore(); }
function speech(ctx, x, y, fr, en, a, left) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.font = "800 30px Inter, sans-serif"; const w = Math.max(ctx.measureText(fr).width, 120) + 44, h = 74;
  ctx.fillStyle = 'rgba(245,246,250,0.95)'; ctx.beginPath(); ctx.roundRect(x - w / 2, y - h, w, h, 18); ctx.moveTo(x + (left ? -10 : 10), y); ctx.lineTo(x + (left ? -26 : 26), y + 22); ctx.lineTo(x + (left ? 14 : -14), y); ctx.fill();
  ctx.fillStyle = '#111'; ctx.textAlign = 'center'; ctx.fillText(fr, x, y - 36); ctx.font = "italic 600 17px Inter, sans-serif"; ctx.fillStyle = '#555'; ctx.fillText(en, x, y - 12); ctx.restore(); }
// armure : plastron + casque, avec fissures ; k = présence, fall = chute (0..1)
function armor(ctx, head, h, k, cracks, fall, t) {
  if (k <= 0 || fall >= 1) return; ctx.save(); ctx.globalAlpha = k * (1 - fall);
  const pw = h * 0.3, ph = h * 0.4, px = head[0] - pw / 2, py = head[1] + h * 0.15 + fall * h * 0.55, r = h * 0.075;
  ctx.fillStyle = 'rgba(70,76,92,0.92)'; ctx.strokeStyle = STEEL; ctx.lineWidth = 3;
  ctx.save(); ctx.translate(px + pw / 2, py + ph / 2); ctx.rotate(fall * 0.9); ctx.beginPath(); ctx.roundRect(-pw / 2, -ph / 2, pw, ph, 10); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,230,190,0.95)'; ctx.shadowColor = '#ffd9a0'; ctx.shadowBlur = 10; ctx.lineWidth = 2.5; // la lumière passe par les fissures
  for (let i = 0; i < cracks; i++) { let x = (i % 2 ? 0.25 : -0.2) * pw, y = (-0.4 + i * 0.22) * ph; ctx.beginPath(); ctx.moveTo(x, y); for (let j = 0; j < 4; j++) { x += (j % 2 ? -1 : 1) * pw * 0.12; y += ph * 0.07; ctx.lineTo(x, y); } ctx.stroke(); }
  ctx.restore();
  if (k > 0.5) { ctx.save(); ctx.translate(head[0], head[1] - fall * 40 + fall * h * 0.8); ctx.rotate(-fall * 1.4); ctx.fillStyle = 'rgba(70,76,92,0.92)'; ctx.strokeStyle = STEEL; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, r * 1.25, PI * 1.02, PI * 1.98); ctx.lineTo(r * 1.25, r * 0.15); ctx.lineTo(-r * 1.25, r * 0.15); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }
  ctx.restore();
}
function people(ctx, x, y, n, red, a) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; for (let i = 0; i < n; i++) { const cx = x + i * 70, col = i < red ? RED : '#e6e9f2'; ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = i < red ? 14 : 0;
  ctx.beginPath(); ctx.arc(cx, y, 14, 0, PI * 2); ctx.fill(); ctx.beginPath(); ctx.roundRect(cx - 20, y + 20, 40, 46, 14); ctx.fill(); } ctx.restore(); }

export function build({ ctx, begin, W, H }) {
  return (t) => {
    begin();
    const hook = t < T.rew, tt = hook ? 33 : t;
    const nHit = HITS.filter(([s]) => tt > s + 0.5).length;
    const broke = hook ? 0 : ease(range(t, T.cry + 0.2, T.cry + 1.6));
    let inner = 1;
    if (tt > T.start + 1) inner = lerp(1, 0.75, range(tt, T.start + 1, T.grow));
    if (tt > T.grow) inner = lerp(0.75, 0.4, range(tt, T.grow, T.fine));
    if (tt > T.fine) inner = lerp(0.4, 0.06, range(tt, T.fine, T.ask + 2));
    const heal = hook ? 0 : ease(range(t, T.cry + 1, T.talk + 3));
    if (heal > 0) inner = lerp(0.06, 0.9, heal);
    const dim = clamp((1 - inner) * 0.85);
    stage(ctx, W, H, lerp(1, 0.5, dim), !hook && t > T.talk ? ease(range(t, T.talk, T.talk + 2)) * 0.7 : 0);
    // enfance : le père
    if (!hook && t > T.start && t < T.grow + 1) { const a = fade(t, T.start, T.start + 0.8, T.grow - 0.4, T.grow + 0.8); let dp = { armF: [0.3, 0.3], armB: [0.2, 0.3] }; if (t > 7.4 && t < 9.6) dp = { armF: [1.5, 0.05], armB: [0.2, 0.3], lean: 0.05 }; actor(ctx, 560, MD - 0.02, 520, dp, { color: DAD, glow: 10, flip: 1, alpha: a * 0.9 }); }
    // lui (enfant qui grandit)
    const grow = hook ? 1 : ease(range(t, T.grow, T.grow + 4.5)), Hh = lerp(290, 480, grow);
    let pose = { armF: [0.2, 0.25], armB: [0.1, 0.25] };
    if (!hook && t < T.grow) { if (t > 6.4 && t < 9.4) pose = mixPose(pose, { kneel: 1, lean: 0.4, head: 0.4, armF: [2.3, 2.3], armB: [2.2, 2.4] }, ease(range(t, 6.4, 6.9))); if (t >= 9.4) pose = mixPose({ kneel: 1, lean: 0.4, head: 0.4, armF: [2.3, 2.3], armB: [2.2, 2.4] }, { kneel: 0, lean: 0, head: -0.05, armF: [0.15, 0.2], armB: [0.1, 0.2], legF: [0.05, 0.05], legB: [-0.05, 0.05] }, ease(range(t, 9.4, 10.2))); }
    if (tt > T.hits) pose = mixPose(pose, { lean: 0.05 * nHit, head: 0.06 * nHit }, 1);
    HITS.forEach(([s]) => { const k = range(tt, s + 0.45, s + 0.9); if (k > 0 && k < 1) pose = mixPose(pose, { lean: -0.2 }, Math.sin(k * PI)); });
    if (tt > T.ask) pose = mixPose(pose, { head: 0.45, lean: 0.15 }, ease(range(tt, T.ask, T.ask + 2)));
    if (broke > 0) pose = mixPose(pose, { kneel: 1, lean: 0.45, head: 0.45, armF: [2.4, 2.4], armB: [2.3, 2.5] }, broke); // il pleure, le visage dans les mains
    const up = hook ? 0 : ease(range(t, T.talk, T.talk + 1.6));
    if (up > 0) pose = mixPose(pose, { kneel: 0, lie: 0, lean: 0, head: -0.08, armF: [0.3, 0.3], armB: [0.2, 0.3], legF: [0.05, 0.05], legB: [-0.05, 0.05] }, up);
    // l'ami
    const fIn = hook ? 1 : ease(range(t, T.fine - 1.6, T.fine));
    let fx = FX0, fp = fIn < 1 ? walkPose(t * 4) : { armF: [0.3, 0.3], armB: [0.2, 0.3] };
    if (!hook && t > T.ask) { const k = ease(range(t, T.ask, T.ask + 1.8)); fx = lerp(FX0, MX + 190, k); if (k > 0 && k < 1) fp = walkPose(t * 4.2); else if (k >= 1) fp = { armF: [1.25, 0.2], armB: [0.2, 0.3], lean: 0.08 }; }
    if (broke > 0) fp = mixPose(fp, { kneel: 1, lean: 0.3, head: 0.25, armF: [1.5, 0.4], armB: [0.6, 0.6] }, broke);
    if (up > 0) fp = mixPose(fp, { kneel: 0, lie: 0, lean: 0, head: -0.05, armF: [1.0, 0.3], armB: [0.2, 0.3], legF: [0.05, 0.05], legB: [-0.05, 0.05] }, up);
    if (fIn > 0) actor(ctx, lerp(1800, fx, fIn), MD + 0.01, 470, fp, { color: FRIEND, glow: 18, flip: -1 });
    const me = actor(ctx, MX, MD, Hh, pose, { color: mixC(HIM, '#4a4650', dim), glow: lerp(24, 4, dim), flip: 1 });
    // larmes (enfant, puis adulte)
    const tears = (!hook && t > 6.6 && t < 9.6) || (!hook && t > T.cry + 0.8 && t < T.talk);
    if (tears) { ctx.save(); ctx.fillStyle = '#9fd0ff'; ctx.shadowColor = '#9fd0ff'; ctx.shadowBlur = 8; for (let i = 0; i < 4; i++) { const ph = (t * 1.4 + i * 0.25) % 1; ctx.globalAlpha = 1 - ph; ctx.beginPath(); ctx.arc(me.head[0] + 18 + (i % 2) * 10, me.head[1] + 12 + ph * 70, 4, 0, PI * 2); ctx.fill(); } ctx.restore(); }
    // l'armure
    const armK = hook ? 1 : ease(range(t, 10.2, 10.8)), cracks = Math.min(5, nHit + (tt > T.ask + 2 ? 1 : 0));
    armor(ctx, me.head, Hh * depthS(MD), armK, cracks, broke, t);
    if (!hook && t > T.cry && t < T.cry + 1.2) { const k = range(t, T.cry, T.cry + 1.2); ctx.save(); ctx.fillStyle = STEEL; for (let j = 0; j < 16; j++) { const an = j * 0.8, d = eout(k) * (50 + (j % 4) * 35); ctx.globalAlpha = 1 - k; ctx.fillRect(me.head[0] + Math.cos(an) * d, me.head[1] + 90 + Math.sin(an) * d + k * k * 120, 8, 5); } ctx.restore(); }
    // les coups de la vie
    HITS.forEach(([s, fr, en], i) => { if (tt < s) return; const k = range(tt, s, s + 0.5), d = ease(range(tt, s + 0.6, s + 1.4));
      const tx = me.head[0] + 30, ty = me.head[1] + 90; const x = lerp(1700, tx, eout(k)), y = lerp(ty - 120, ty, eout(k));
      tag(ctx, lerp(x, 150 + i * 125, d), lerp(y, depthY(MD) - 20, d) - Math.sin(d * PI) * 60, fr, en, ['#9cc4ff', '#ff9aa8', '#d9d2ff', '#ffb38a'][i], hook ? 0.8 : 1 - range(t, T.ask, T.ask + 1), d * (i % 2 ? 0.12 : -0.1)); });
    // bulles
    TALK.forEach(([a, b, who, fr, en]) => { if (hook) return; const al = fade(t, a, a + 0.25, b - 0.3, b); if (al <= 0) return; if (who === 'm') speech(ctx, me.head[0] - 40, me.head[1] - 60, fr, en, al, false); else speech(ctx, lerp(1800, fx, fIn) + 30, me.head[1] - 70, fr, en, al, true); });
    // ——— habillage
    corners(ctx, W, H, 1);
    panel(ctx, 70, 66, 560, 50); ctx.save(); ctx.fillStyle = ORA; ctx.beginPath(); ctx.roundRect(82, 76, 170, 30, 6); ctx.fill(); ctx.restore();
    label(ctx, 167, 98, 'SANTÉ MENTALE', '#111', 17, 1, 'center'); label(ctx, 268, 98, 'LE SILENCE DES HOMMES', '#e6e9f2', 17);
    battery(ctx, 84, 150, inner, t, 1, heal > 0); label(ctx, 86, 262, 'LUMIÈRE INTÉRIEURE · INNER LIGHT', '#aab2c4', 16);
    const age = hook ? 34 : tt < T.grow ? 7 : Math.round(lerp(7, 34, range(tt, T.grow, T.fine)));
    panel(ctx, W / 2 - 130, 56, 260, 96); big(ctx, W / 2, 112, `${age} ANS`, '#fff', 50, 1, 'center', 800); label(ctx, W / 2, 140, `AGE ${age}`, '#aab2c4', 15, 1, 'center');
    const pa = hook ? 1 : range(t, T.grow + 0.4, T.grow + 1.2);
    if (pa > 0) { const px = 1430, py = 200, fine = tt < T.grow ? 0 : Math.round(Math.pow(range(tt, T.grow, T.ask), 1.3) * 1095), talked = !hook && t > T.cry ? 1 : 0, cried = !hook && t > T.cry + 0.8 ? 1 : 0; panel(ctx, px, py, 420, 330, pa);
      label(ctx, px + 24, py + 40, '« ÇA VA » DITS · "I’M FINE" SAID', '#aab2c4', 15, pa); big(ctx, px + 24, py + 94, `${fine.toLocaleString('fr-FR').replace(/ | /g, ' ')}`, fine > 500 ? ORA : '#fff', 52, pa, 'left', 900);
      label(ctx, px + 24, py + 140, 'À QUI IL A PARLÉ · TALKED TO', '#aab2c4', 15, pa); big(ctx, px + 24, py + 192, `${talked}`, talked ? '#46d37a' : RED, 50, pa, 'left', 900);
      label(ctx, px + 24, py + 240, 'FOIS OÙ IL A PLEURÉ · TIMES CRIED', '#aab2c4', 15, pa); big(ctx, px + 24, py + 300, `${cried}`, cried ? '#46d37a' : RED, 50, pa, 'left', 900); }
    // le chiffre
    const sa = hook ? 0 : fade(t, T.stat, T.stat + 0.6, T.ask + 4, T.ask + 5);
    if (sa > 0) { const px = 1430, py = 560; panel(ctx, px, py, 420, 290, sa, 'rgba(255,90,90,0.55)'); label(ctx, px + 24, py + 36, 'BEAUCOUP DE PAYS · MANY COUNTRIES', '#ff8a8a', 13, sa);
      people(ctx, px + 70, py + 76, 4, Math.floor(clamp(range(t, T.stat + 0.4, T.stat + 2)) * 3.99), sa); big(ctx, px + 24, py + 212, '3 suicides sur 4', '#fff', 40, sa, 'left', 900);
      label(ctx, px + 24, py + 242, 'sont des hommes · 3 in 4 suicides are men', '#cfd6e4', 13, sa); label(ctx, px + 24, py + 272, 'SOURCE : OMS, STATISTIQUES NATIONALES', '#7c8496', 12, sa); }
    if (hook) { hookBox(ctx, W / 2, 360, '« ÇA VA. »', 'Il l’a dit 1 095 fois. Ce n’était jamais vrai.', fade(t, 0, 0.3, 3.9, 4.4), 84); label(ctx, W / 2, 470, '"I’M FINE." HE SAID IT 1,095 TIMES. IT WAS NEVER TRUE.', '#e6e9f2', 20, fade(t, 0.4, 0.8, 3.9, 4.4), 'center'); }
    if (t > T.rew && t < T.start) { const k = range(t, T.rew, T.start); ctx.save(); ctx.fillStyle = `rgba(0,0,0,${Math.sin(k * PI) * 0.85})`; ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = Math.sin(k * PI); ctx.fillStyle = 'rgba(255,255,255,0.08)'; for (let y = (t * 900) % 24; y < H; y += 24) ctx.fillRect(0, y, W, 3); ctx.restore();
      big(ctx, W / 2, H / 2 + 20, '◀◀  27 ANS PLUS TÔT', '#fff', 70, Math.sin(k * PI), 'center', 900); label(ctx, W / 2, H / 2 + 76, '27 YEARS EARLIER', '#cfd6e4', 22, Math.sin(k * PI), 'center'); }
    kcap(ctx, W, 'Il disait toujours : *« Ça va. »*', t, 0.3, 4.1);
    kcap(ctx, W, 'On lui a appris : *un homme ne pleure pas*.', t, 6.2, 11.6);
    kcap(ctx, W, 'Alors il a tout gardé *à l’intérieur*.', t, 12.4, 17.6);
    kcap(ctx, W, 'Le chômage. La rupture. *Le deuil.*', t, 18.2, 23.6);
    kcap(ctx, W, 'À chaque « Ça va ? »,\nil répondait : *« Ça va. »*', t, 24.2, 29.8);
    kcap(ctx, W, 'Beaucoup d’hommes souffrent *en silence*.', t, 30.2, 35.4);
    kcap(ctx, W, 'Un jour, un ami a insisté : *« Vraiment ? »*', t, 35.8, 41.6);
    kcap(ctx, W, 'Et pour la première fois, *il a pleuré*.', t, 42, 47.6);
    kcap(ctx, W, 'Pleurer n’est pas une faiblesse.\n*Parler, c’est du courage.*', t, 48, 52.8);
    kcap(ctx, W, 'Et toi, *à qui tu parles* ?', t, 53.2, 58.2);
    if (t > T.end) { ctx.fillStyle = `rgba(0,0,0,${range(t, T.end, T.end + 0.8)})`; ctx.fillRect(0, 0, W, H); if (t > T.end + 0.8) { caption(ctx, W, 'Un homme a le droit de dire :\n« Ça ne va pas. »', fade(t, 59.3, 59.9, 61.3, 61.9), 420, 46); caption(ctx, W, 'Le silence des hommes', fade(t, 59.9, 60.5, 61.3, 61.9) * 0.7, 720, 34); } }
  };
}
