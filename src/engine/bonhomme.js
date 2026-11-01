// Moteur « BONHOMMES » : bonhommes lumineux sans visage sur fond noir, sol miroir, foule grise,
// phrase en majuscules espacées en haut de l'écran. Partagé par les vidéos de sensibilisation (16:9).
export const PI = Math.PI, clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), range = (t, a, b) => clamp((t - a) / (b - a));
export const lerp = (a, b, k) => a + (b - a) * k, ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2), eout = (k) => 1 - Math.pow(1 - k, 3);
export const fade = (t, a, b, c, d) => clamp(Math.min(range(t, a, b), 1 - range(t, c, d)));
// ---------------- le bonhomme ----------------
// pose : angles depuis la verticale (0 = vers le bas, + = vers l'avant). bras : [épaule, coude], jambes : [hanche, genou]
export const P0 = { lean: 0, head: 0, armF: [0.15, 0.2], armB: [-0.1, 0.2], legF: [0.05, 0.05], legB: [-0.05, 0.05], bob: 0, lie: 0, kneel: 0 };
export function figure(ctx, x, y, Hh, pose, o = {}) {
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
export const walkPose = (ph, k = 1) => ({ legF: [Math.sin(ph) * 0.42 * k, Math.max(0, Math.cos(ph)) * 0.65 * k + 0.05], legB: [-Math.sin(ph) * 0.42 * k, Math.max(0, -Math.cos(ph)) * 0.65 * k + 0.05], armF: [-Math.sin(ph) * 0.35 * k + 0.05, 0.25], armB: [Math.sin(ph) * 0.35 * k + 0.05, 0.25], bob: -Math.abs(Math.cos(ph)) * 0.015 * k, lean: 0.04 * k });
export const mixPose = (A, B, k) => { const o = {}; for (const key of new Set([...Object.keys(A), ...Object.keys(B)])) { const a = A[key] ?? P0[key], b = B[key] ?? A[key] ?? P0[key]; /* une clé absente de B garde la valeur de A */ o[key] = Array.isArray(a) ? a.map((v, i) => lerp(v, b[i], k)) : lerp(a, b, k); } return o; };

// ---------------- décor : noir, sol miroir, perspective ----------------
export const HOR = 600; // ligne d'horizon (sol)
export const depthY = (d) => HOR + d * 400, depthS = (d) => 0.28 + d * 0.6; // d : 0 (loin) → 1 (près)
export function stage(ctx, W, H, light = 1, path = 0) {
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
export function actor(ctx, x, d, Hh, pose, o = {}) {
  const y = depthY(d), s = depthS(d), h = Hh * s;
  ctx.save(); ctx.beginPath(); ctx.rect(0, y, 1920, 1080); ctx.clip(); ctx.translate(0, 2 * y); ctx.scale(1, -1); ctx.globalAlpha = 0.22 * (o.alpha ?? 1); figure(ctx, x, y, h, pose, { ...o, glow: 0 }); ctx.restore();
  return figure(ctx, x, y, h, pose, o);
}
// foule grise (assise, couchée, debout) — déterministe
export function crowd(ctx, t, mode, k = 1, seed = 1) {
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
export function caption(ctx, W, text, a, y = 130, size = 40) {
  if (a <= 0 || !text) return; ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#e8e8ec'; ctx.textAlign = 'center'; ctx.font = `500 ${size}px 'Courier New', monospace`;
  try { ctx.letterSpacing = `${Math.round(size * 0.22)}px`; } catch (e) {}
  String(text).split('\n').forEach((l, i) => ctx.fillText(l.toUpperCase(), W / 2, y + i * size * 1.6)); ctx.restore();
}
export function mixC(a, b, k) { const p = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], clamp(k)))).join(',')})`; }
export function flash(ctx, W, H, a, on) { if (!on || a <= 0) return; ctx.fillStyle = `rgba(230,236,255,${a * 0.85})`; ctx.fillRect(0, 0, W, H); }
export function fadeIO(ctx, W, H, t, a, b) { const k = Math.max(1 - range(t, a, a + 0.8), range(t, b - 0.8, b)); if (k > 0) { ctx.fillStyle = `rgba(0,0,0,${k})`; ctx.fillRect(0, 0, W, H); } }
export function dust(ctx, t, frozen) { let s = 9; const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280); const tt = frozen ? 14.2 : t; ctx.fillStyle = 'rgba(220,225,240,0.45)'; for (let i = 0; i < 28; i++) { const x = r() * 1920, y = 250 + r() * 750, sp = 10 + r() * 20; ctx.beginPath(); ctx.arc(x + Math.sin(tt * 0.4 + i) * 12, y - (tt * sp) % 300, 1.5 + r() * 1.5, 0, 7); ctx.fill(); } }
