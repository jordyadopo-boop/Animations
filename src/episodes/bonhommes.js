// « L'INSTANT » version BONHOMMES — court-métrage contre la violence, style minimaliste :
// bonhommes lumineux sans visage sur fond noir, sol miroir, foule grise, une phrase en haut de l'écran.
// Horizontal 16:9, ~62 s, musique triste (render/audio_instant.js lit les CUES).
export const world = 'flat', fps = 24, duration = 62, width = 1920, height = 1080;
export const title = 'L’INSTANT';

const PI = Math.PI, clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), range = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k, ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2), eout = (k) => 1 - Math.pow(1 - k, 3);
const fade = (t, a, b, c, d) => clamp(Math.min(range(t, a, b), 1 - range(t, c, d)));

// ---- chronologie ----
const T = { walk: 0, stop: 7.5, anger: 8.5, raise: 13.4, freeze: 14.2, v1: 19, v2: 28, v3: 37.5, back: 47, lower: 48.5, together: 53.5, black: 59.5 };

export const CUES = [
  ['piano', 0.2, { theme: 'instant', until: 8.5 }],
  ['heart', 8.6, { until: 14.2, from: 70, to: 150 }], ['drone', 8.6, { until: 14.2, rise: true }], ['shout', 10.2, { dur: 2.6 }], ['swing', 13.5, { dur: 0.7 }],
  ['freeze', 14.2], ['ring', 14.2, { dur: 4 }], ['heart', 15.5, { until: 18.8, from: 46, to: 46, soft: true }],
  ['dive', 17.6], ['piano', 19.0, { theme: 'partir', until: 28.2 }], ['doorClose', 26.6],
  ['thud', 28.6], ['silence', 28.65, { dur: 1.5 }], ['piano', 30.0, { theme: 'deuil', until: 37.6 }], ['siren', 31.0, { dur: 4.5 }], ['cellDoor', 34.6],
  ['piano', 37.5, { theme: 'heritage', until: 47.2 }], ['heart', 43, { until: 47, from: 80, to: 140 }],
  ['undive', 46.9], ['breath', 48.6, { dur: 3.5 }], ['piano', 47.2, { theme: 'main', until: 53.6 }],
  ['piano', 53.4, { theme: 'fin', until: 61.8 }],
];

// ---------------- le bonhomme ----------------
// pose : angles depuis la verticale (0 = vers le bas, + = vers l'avant). bras : [épaule, coude], jambes : [hanche, genou]
const P0 = { lean: 0, head: 0, armF: [0.15, 0.2], armB: [-0.1, 0.2], legF: [0.05, 0.05], legB: [-0.05, 0.05], bob: 0, lie: 0, kneel: 0 };
function figure(ctx, x, y, Hh, pose, o = {}) {
  const p = { ...P0, ...pose }, f = o.flip ?? 1, col = o.color || '#ffffff', a = o.alpha ?? 1, glow = o.glow ?? 0;
  const L = { th: 0.25 * Hh, sh: 0.24 * Hh, tor: 0.3 * Hh, ua: 0.17 * Hh, fa: 0.16 * Hh, hr: 0.12 * Hh, w: 0.12 * Hh };
  const pol = (o2, len, ang) => [o2[0] + Math.sin(ang) * len * f, o2[1] + Math.cos(ang) * len];
  const legPts = ([h, k]) => { const kn = pol([0, 0], L.th, h); return [kn, pol(kn, L.sh, h - k)]; };
  let lf = legPts(p.legF), lb = legPts(p.legB);
  if (p.kneel) { const k = p.kneel; lf = [pol([0, 0], L.th, lerp(p.legF[0], 1.45, k)), null]; lf[1] = [lf[0][0] + lerp(0, -L.sh * 0.1 * f, k), lf[0][1] + lerp(L.sh, 0, 0)]; lf[1] = pol(lf[0], L.sh, lerp(p.legF[0] - p.legF[1], 0, k)); lb = [pol([0, 0], L.th, lerp(p.legB[0], 0, k)), null]; lb[1] = pol(lb[0], L.sh, lerp(p.legB[0] - p.legB[1], -1.5, k)); }
  const low = Math.max(lf[1][1], lb[1][1]);
  ctx.save(); ctx.translate(x, y); ctx.globalAlpha *= a;
  if (p.lie) { ctx.rotate(-f * p.lie * PI / 2); ctx.translate(f * p.lie * L.hr * 1.2, -p.lie * L.w * 0.5); }
  ctx.translate(0, -low + p.bob * Hh);
  const hip = [0, 0], sh = pol(hip, -L.tor, -p.lean), hc = pol(sh, -(L.hr * 1.25), -p.lean - p.head);
  const armPts = ([s, e]) => { const el = pol(sh, L.ua, s); return [el, pol(el, L.fa, s + e)]; };
  const af = armPts(p.armF), ab = armPts(p.armB);
  if (glow) { ctx.shadowColor = col; ctx.shadowBlur = glow; }
  ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const seg = (pts, w) => { ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); pts.slice(1).forEach((q) => ctx.lineTo(q[0], q[1])); ctx.stroke(); };
  // membres du fond un peu plus sombres
  ctx.save(); ctx.globalAlpha *= 0.78; seg([sh, ...ab], L.w * 0.92); seg([hip, ...lb], L.w); ctx.restore();
  seg([hip, sh], L.w * 1.25); seg([hip, ...lf], L.w); seg([sh, ...af], L.w * 0.92);
  ctx.beginPath(); ctx.arc(hc[0], hc[1], L.hr, 0, PI * 2); ctx.fill();
  ctx.restore();
  return { hand: [x + af[1][0], y - low + af[1][1] + p.bob * Hh], head: [x + hc[0], y - low + hc[1]] };
}
// cycle de marche (phase en radians)
const walkPose = (ph, k = 1) => ({ legF: [Math.sin(ph) * 0.42 * k, Math.max(0, Math.cos(ph)) * 0.65 * k + 0.05], legB: [-Math.sin(ph) * 0.42 * k, Math.max(0, -Math.cos(ph)) * 0.65 * k + 0.05], armF: [-Math.sin(ph) * 0.35 * k + 0.05, 0.25], armB: [Math.sin(ph) * 0.35 * k + 0.05, 0.25], bob: -Math.abs(Math.cos(ph)) * 0.015 * k, lean: 0.04 * k });
const mixPose = (A, B, k) => { const o = {}; for (const key of new Set([...Object.keys(A), ...Object.keys(B)])) { const a = A[key] ?? P0[key], b = B[key] ?? P0[key]; o[key] = Array.isArray(a) ? a.map((v, i) => lerp(v, b[i], k)) : lerp(a, b, k); } return o; };

// ---------------- décor : noir, sol miroir, perspective ----------------
const HOR = 600; // ligne d'horizon (sol)
const depthY = (d) => HOR + d * 400, depthS = (d) => 0.28 + d * 0.6; // d : 0 (loin) → 1 (près)
function stage(ctx, W, H, light = 1, path = 0) {
  ctx.fillStyle = '#050506'; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W / 2, HOR - 150, 50, W / 2, HOR, 1200); g.addColorStop(0, `rgba(70,72,80,${0.55 * light})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const fg = ctx.createLinearGradient(0, HOR, 0, H); fg.addColorStop(0, `rgba(60,62,70,${0.55 * light})`); fg.addColorStop(1, 'rgba(8,8,10,1)'); ctx.fillStyle = fg; ctx.fillRect(0, HOR, W, H - HOR);
  ctx.strokeStyle = `rgba(200,205,220,${0.35 * light})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, HOR); ctx.lineTo(W, HOR); ctx.stroke();
  if (path > 0) { // chemin de lumière vers l'horizon (fin)
    ctx.save(); ctx.globalAlpha = path; const pg = ctx.createLinearGradient(0, HOR, 0, H); pg.addColorStop(0, 'rgba(255,250,235,0.5)'); pg.addColorStop(1, 'rgba(255,250,235,0.05)'); ctx.fillStyle = pg;
    ctx.beginPath(); ctx.moveTo(W / 2 - 40, HOR); ctx.lineTo(W / 2 + 40, HOR); ctx.lineTo(W / 2 + 520, H); ctx.lineTo(W / 2 - 520, H); ctx.closePath(); ctx.fill();
    const sg = ctx.createRadialGradient(W / 2, HOR - 10, 5, W / 2, HOR - 10, 160); sg.addColorStop(0, 'rgba(255,248,230,0.9)'); sg.addColorStop(1, 'rgba(255,248,230,0)'); ctx.fillStyle = sg; ctx.fillRect(W / 2 - 200, HOR - 180, 400, 360); ctx.restore();
  }
}
// dessine un bonhomme + son reflet sur le sol
function actor(ctx, x, d, Hh, pose, o = {}) {
  const y = depthY(d), s = depthS(d), h = Hh * s;
  ctx.save(); ctx.beginPath(); ctx.rect(0, y, 1920, 1080); ctx.clip(); ctx.translate(0, 2 * y); ctx.scale(1, -1); ctx.globalAlpha = 0.22 * (o.alpha ?? 1); figure(ctx, x, y, h, pose, { ...o, glow: 0 }); ctx.restore();
  return figure(ctx, x, y, h, pose, o);
}
// foule grise (assise, couchée, debout) — déterministe
function crowd(ctx, t, mode, k = 1, seed = 1) {
  if (k <= 0) return; let s = seed; const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const list = []; for (let i = 0; i < 70; i++) list.push({ x: r() * 2200 - 140, d: Math.pow(r(), 0.8) * 0.95, kind: r(), ph: r() * 6, f: r() < 0.5 ? 1 : -1 });
  list.sort((a, b) => a.d - b.d).forEach((c) => {
    if (mode === 'heritage' && c.d > 0.55 && Math.abs(c.x - 960) < 300) return;
    let pose;
    if (mode === 'walk') pose = walkPose(t * 4 + c.ph, 0.8);
    else if (mode === 'heritage') { const kr = ease(range(t, 41.5 + c.d * 2 + c.ph * 0.15, 43 + c.d * 2 + c.ph * 0.15)); pose = mixPose({ armF: [0.2, 0.3] }, { lean: 0.15, armF: [PI * 0.88, -0.55], armB: [0.6, 0.4], legF: [0.35, 0.2], legB: [-0.3, 0.1] }, kr); }
    else pose = c.kind < 0.4 ? { lie: 1, armF: [1.2, 0.4], legF: [0.2, 0.3] } : c.kind < 0.75 ? { kneel: 1, lean: 0.5, head: 0.3, armF: [0.6, 0.6] } : { lean: 0.3, head: 0.4, armF: [0.3, 0.3] };
    const grey = Math.round(70 + c.d * 70);
    actor(ctx, c.mode === 'walk' ? c.x : c.x + (mode === 'walk' ? ((t * 40 * c.f) % 300) : 0), c.d, 380, pose, { color: `rgb(${grey},${grey},${grey + 6})`, alpha: k * (0.5 + c.d * 0.5), flip: c.f });
  });
}

// texte du haut, majuscules espacées
function caption(ctx, W, text, a, y = 130, size = 40) {
  if (a <= 0 || !text) return; ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#e8e8ec'; ctx.textAlign = 'center'; ctx.font = `500 ${size}px 'Courier New', monospace`;
  try { ctx.letterSpacing = `${Math.round(size * 0.22)}px`; } catch (e) {}
  String(text).split('\n').forEach((l, i) => ctx.fillText(l.toUpperCase(), W / 2, y + i * size * 1.6)); ctx.restore();
}

export function build({ ctx, begin, W, H }) {
  const WHITE = '#ffffff', RED = '#ff5040', WOM = '#f4f1ff', KID = '#fff6d8';
  return (t) => {
    begin();
    const frozen = t >= T.freeze && t < T.lower;
    // ---------- tableaux ----------
    if (t < T.v1 || (t >= T.back && t < T.together)) {
      stage(ctx, W, H, 1);
      if (t < T.stop) crowd(ctx, t, 'walk', 0.4 * fade(t, 0, 1.5, 5.5, 7.2), 3);
      // positions : marche ensemble puis face à face
      const kw = ease(range(t, 0, T.stop)), ph = t * 5.2, walking = t < T.stop;
      const mx = lerp(200, 830, kw), wx = mx + 210, kx = mx + 105;
      const kA = ease(range(t, T.anger, T.anger + 1.2)); // il se tourne vers elle, colère
      const kR = ease(range(t, T.raise, T.freeze)); // le bras se lève
      const kL = ease(range(t, T.lower, T.lower + 3)); // il baisse le bras
      const shake = !frozen && t > T.anger && t < T.freeze ? Math.sin(t * 40) * 3 * kA : 0;
      const manCol = t < T.anger ? WHITE : t < T.lower ? mixC(WHITE, RED, kA) : mixC(RED, WHITE, kL);
      let man = walking ? walkPose(ph) : mixPose({}, { lean: 0.12, armF: [0.9, 0.6], armB: [0.5, 0.8], legF: [0.25, 0.1], legB: [-0.2, 0.05] }, kA);
      if (!walking && t > T.anger && t < T.raise) man.armF = [0.9 + Math.sin(t * 9) * 0.35 * kA, 0.6 + Math.cos(t * 7) * 0.3]; // gestes de colère
      man = mixPose(man, { lean: 0.18, armF: [PI * 0.88, -0.55], armB: [0.7, 0.5], legF: [0.42, 0.25], legB: [-0.32, 0.1] }, kR);
      if (t >= T.lower) man = mixPose(man, { lean: -0.02, head: 0.35, armF: [0.15, 0.2], armB: [0.05, 0.2], legF: [0.05, 0.05], legB: [-0.08, 0.05] }, kL);
      if (t >= T.lower + 3) man = mixPose(man, { lean: 0.05, head: 0.1, armF: [1.2, 0.1] }, ease(range(t, T.lower + 3.2, T.together))); // il tend la main
      let wom = walking ? walkPose(ph + 0.6) : mixPose({}, { lean: -0.05, armF: [0.4, 0.8] }, kA);
      const kRec = ease(range(t, T.raise - 0.3, T.freeze));
      wom = mixPose(wom, { lean: -0.32, head: -0.3, armF: [2.4, 1.9], armB: [2.2, 2.0], legF: [0.15, 0.25], legB: [-0.35, 0.3] }, kRec);
      if (t >= T.lower) wom = mixPose(wom, { lean: -0.1, head: 0, armF: [0.5, 0.6], armB: [0.3, 0.4], legF: [0.05, 0.05], legB: [-0.1, 0.05] }, ease(range(t, T.lower + 2.5, T.together)));
      let kid = walking ? walkPose(ph * 1.15 + 1.2) : mixPose({}, { armF: [0.3, 0.3] }, kA);
      const kidStep = ease(range(t, T.anger + 1.0, T.anger + 2.2));
      kid = mixPose(kid, { lean: -0.15, armF: [2.0, 1.6], armB: [1.6, 1.8], head: -0.1 }, kidStep);
      if (t >= T.lower) kid = mixPose(kid, { lean: 0, armF: [0.3, 0.3], armB: [0.2, 0.3] }, ease(range(t, T.lower + 2.8, T.together)));
      const kxx = walking ? kx : lerp(kx, kx + 160, kidStep) - (t >= T.lower ? 0 : 0);
      const glow = frozen ? 8 : 22, gcol = frozen ? 0.7 : 1;
      actor(ctx, wx, 0.72, 470, wom, { color: frozen ? '#c9cfe0' : WOM, glow, flip: walking ? 1 : -1, alpha: gcol });
      actor(ctx, kxx + (walking ? 0 : 230), 0.66, 270, kid, { color: frozen ? '#c9cfe0' : KID, glow, flip: walking ? 1 : -1 });
      actor(ctx, mx + shake, 0.75, 520, man, { color: manCol, glow: 24 + kA * 16 });
      // particules de poussière figées
      dust(ctx, t, frozen);
      if (frozen) { ctx.fillStyle = `rgba(150,170,220,${0.12 * range(t, T.freeze, T.freeze + 0.4)})`; ctx.fillRect(0, 0, W, H); }
      flash(ctx, W, H, 1 - range(t, T.freeze, T.freeze + 0.3), t >= T.freeze);
      caption(ctx, W, 'Ils s’aimaient', fade(t, 0.8, 2, 6, 7.2));
      caption(ctx, W, 'Un soir, la colère', fade(t, 8.6, 9.6, 12.6, 13.4));
      caption(ctx, W, 'Il reste une seconde', fade(t, 14.8, 15.8, 18.2, 18.9));
      caption(ctx, W, 'Arrête-toi', fade(t, 49, 50, 52.6, 53.4));
      if (t > 17.6 && t < T.v1) { ctx.fillStyle = `rgba(0,0,0,${range(t, 17.6, 19)})`; ctx.fillRect(0, 0, W, H); }
      if (t > T.back && t < T.back + 1) { ctx.fillStyle = `rgba(0,0,0,${1 - range(t, T.back, T.back + 1)})`; ctx.fillRect(0, 0, W, H); }
    } else if (t < T.v2) { // VISION 1 : elle part avec l'enfant ; il reste seul
      stage(ctx, W, H, 0.8 - range(t, 24, 28) * 0.4);
      const k = ease(range(t, 20, 27)), ph = t * 4.5;
      const d = lerp(0.62, 0.02, k), sc = 1 - k * 0.2;
      const a = 1 - range(t, 25.5, 27.2);
      actor(ctx, lerp(1060, 1000, k), d, 470 * sc, walkPose(ph), { color: '#f4f1ff', glow: 16, flip: 1, alpha: a });
      actor(ctx, lerp(960, 975, k), d - 0.01, 270 * sc, walkPose(ph * 1.15 + 1), { color: '#fff6d8', glow: 16, flip: 1, alpha: a });
      // lui, de dos, au premier plan, qui s'effondre doucement
      const ks = ease(range(t, 23, 27));
      actor(ctx, 640, 0.9, 520, mixPose({ armF: [0.3, 0.2] }, { lean: 0.35, head: 0.5, armF: [0.15, 0.1], armB: [0.1, 0.1], kneel: 0 }, ks), { color: '#d8d8de', glow: 6, flip: 1 });
      caption(ctx, W, 'Si tu frappes…\nelle part', fade(t, 19.6, 20.8, 26.2, 27.4));
      fadeIO(ctx, W, H, t, T.v1, T.v2);
    } else if (t < T.v3) { // VISION 2 : elle ne se relève pas ; barreaux de lumière
      stage(ctx, W, H, 0.7);
      const kf = ease(range(t, 28.2, 28.65));
      actor(ctx, 1080, 0.72, 470, mixPose({ lean: -0.32, armF: [2.4, 1.9], armB: [2.2, 2.0] }, { lie: 1, armF: [1.4, 0.3], armB: [1.6, 0.2], legF: [0.1, 0.2] }, kf), { color: t > 29 ? '#8a8a92' : '#f4f1ff', glow: t > 29 ? 0 : 14, flip: -1 });
      const kk = ease(range(t, 29.5, 31));
      actor(ctx, 800, 0.75, 520, mixPose({ lean: 0.2, armF: [PI * 0.97, -1.5] }, { kneel: 1, lean: 0.55, head: 0.45, armF: [0.9, 1.6], armB: [0.8, 1.7] }, kk), { color: '#ff7a6a', glow: 18 });
      // gyrophares discrets
      if (t > 31 && t < 35.5) { const ph = Math.floor(t * 4) % 2; ctx.fillStyle = ph ? 'rgba(60,90,255,0.10)' : 'rgba(255,60,60,0.10)'; ctx.fillRect(0, 0, W, H); }
      // barreaux qui tombent autour de lui
      const kb = eout(range(t, 34.2, 34.7));
      if (kb > 0) { ctx.save(); ctx.shadowColor = '#fff'; ctx.shadowBlur = 18; ctx.fillStyle = 'rgba(235,238,250,0.9)'; for (let i = 0; i < 6; i++) { const x = 640 + i * 66; ctx.fillRect(x, lerp(-900, 420, kb), 11, 600); } ctx.restore(); }
      caption(ctx, W, 'Ou pire :\nelle ne se relève pas', fade(t, 29.6, 30.8, 36.2, 37.2));
      ctx.fillStyle = `rgba(0,0,0,${range(t, 28.6, 28.65) * (1 - range(t, 28.65, 29.8))})`; ctx.fillRect(0, 0, W, H);
      fadeIO(ctx, W, H, t, T.v2, T.v3);
    } else if (t < T.back) { // VISION 3 : l'enfant grandit… et lève le bras à son tour ; la foule aussi
      stage(ctx, W, H, 0.8);
      crowd(ctx, t, 'heritage', fade(t, 41, 42.5, 46, 46.9), 7);
      const kg = ease(range(t, 38.2, 41)), kr = ease(range(t, 41.5, 42.6));
      const h = lerp(270, 520, kg);
      actor(ctx, 960, 0.76, h, mixPose({ armF: [0.2, 0.3] }, { lean: 0.18, armF: [PI * 0.88, -0.55], armB: [0.7, 0.5], legF: [0.42, 0.25], legB: [-0.32, 0.1] }, kr), { color: kr > 0 ? mixC('#fff6d8', '#ff5040', kr) : '#fff6d8', glow: 22 });
      caption(ctx, W, 'Et ton fils apprend', fade(t, 38.2, 39.4, 41.2, 41.9));
      caption(ctx, W, 'Ce qu’il voit,\nil le répétera', fade(t, 42.6, 43.6, 46, 46.8));
      fadeIO(ctx, W, H, t, T.v3, T.back);
    } else { // ENSEMBLE : ils avancent vers nous sur un chemin de lumière
      const k = range(t, T.together, T.black);
      stage(ctx, W, H, 1, ease(range(t, T.together, T.together + 2)));
      const ph = t * 4.2, d = lerp(0.15, 0.9, ease(k)), s = 1;
      actor(ctx, 880, d, 520 * s, walkPose(ph), { color: '#ffffff', glow: 24, flip: 1 });
      actor(ctx, 970, d - 0.02, 270 * s, walkPose(ph * 1.15 + 1), { color: '#fff6d8', glow: 20, flip: 1 });
      actor(ctx, 1060, d - 0.01, 470 * s, walkPose(ph + 0.6), { color: '#f4f1ff', glow: 22, flip: 1 });
      caption(ctx, W, 'Un seul geste\npeut tout te prendre', fade(t, 54.4, 55.6, 58.6, 59.4));
      ctx.fillStyle = `rgba(0,0,0,${range(t, 58.8, T.black)})`; ctx.fillRect(0, 0, W, H);
      if (t > T.black) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); caption(ctx, W, 'Arrête-toi avant', fade(t, 59.6, 60.2, 61.4, 61.9), 520, 56); caption(ctx, W, 'L’instant', fade(t, 60.1, 60.7, 61.4, 61.9) * 0.7, 640, 34); }
    }
  };
}

function mixC(a, b, k) { const p = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], clamp(k)))).join(',')})`; }
function flash(ctx, W, H, a, on) { if (!on || a <= 0) return; ctx.fillStyle = `rgba(230,236,255,${a * 0.85})`; ctx.fillRect(0, 0, W, H); }
function fadeIO(ctx, W, H, t, a, b) { const k = Math.max(1 - range(t, a, a + 0.8), range(t, b - 0.8, b)); if (k > 0) { ctx.fillStyle = `rgba(0,0,0,${k})`; ctx.fillRect(0, 0, W, H); } }
function dust(ctx, t, frozen) { let s = 9; const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280); const tt = frozen ? 14.2 : t; ctx.fillStyle = 'rgba(220,225,240,0.45)'; for (let i = 0; i < 28; i++) { const x = r() * 1920, y = 250 + r() * 750, sp = 10 + r() * 20; ctx.beginPath(); ctx.arc(x + Math.sin(tt * 0.4 + i) * 12, y - (tt * sp) % 300, 1.5 + r() * 1.5, 0, 7); ctx.fill(); } }
