// Ep. 51 — ELLE EST TOMBÉE, BABYLONE LA GRANDE (Apocalypse 18, 1-8), animation 2D au trait.
// Chaque image est une fonction pure de t ; les scènes et repères viennent de la narration (timeline.js).
(function () {
  const U = globalThis.U, G = globalThis.G, Ch = globalThis.Ch, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { clamp, lerp, ease } = U;
  const W = G.W, H = G.H, SAFE = G.SAFE, SC = S.S, C = S.C, TL = S.TL;
  const GROUND = Math.round(H * 0.70);
  const INK = '#2A2320', GOLD = '#F2B84B', RED = '#C8432E', TEAL = '#3D7A74', CREAM = '#FFF6E6', ORANGE = '#D97757';
  const CAP_Y = Math.round(H * 0.60); // cartes d'info : sous les sous-titres anglais (en haut), au-dessus de l'interface (en bas)
  const inS = (t, k) => t >= SC[k][0] && t < SC[k][1];
  const win = (t, a, b, fi = 0.35, fo = 0.35) => clamp((t - a) / fi) * clamp((b - t) / fo);
  const env = (t) => { const a = TL.env.claude || []; return a[Math.floor(t * 24)] || 0; };

  // ---------- bonhomme au trait (pieds en x, y)
  function stick(ctx, x, y, s0, o = {}) {
    const seed = o.seed || 1, bounce = o.still ? 0 : Math.sin((G.t || 0) * 8 + seed * 1.7);
    const sq = 1 + 0.07 * bounce, s = s0;
    ctx.save(); ctx.translate(x, y); ctx.scale(1 / Math.sqrt(sq), sq); ctx.translate(-x, -y);
    const c = INK, lw = 16 * s, run = o.run !== undefined, ph = o.run || 0;
    const hipY = y - 78 * s, shY = y - 140 * s, headY = y - 196 * s, lean = (o.lean || 0) * s;
    const hx = x + lean * 0.4, sx = x + lean;
    const shoe = (fx, fy, d) => G.ellipse(ctx, fx + d * 8 * s, fy - 6 * s, 20 * s, 11 * s, { fill: '#2A2320', lw: 3 * s, seed: seed + fx });
    const glove = (wx, wy) => G.ellipse(ctx, wx, wy, 13 * s, 13 * s, { fill: '#FFFFFF', lw: 4 * s, seed: seed + wx });
    if (o.sit) {
      G.limb(ctx, [[hx, hipY], [hx + 45 * s, hipY], [hx + 45 * s, y]], { color: o.robe || '#2A2320', lw, seed: seed + 1 }); shoe(hx + 45 * s, y, 1);
    } else if (o.kneel) {
      G.limb(ctx, [[hx, hipY + 30 * s], [hx + 30 * s, y - 8 * s], [hx - 20 * s, y]], { color: '#2A2320', lw, seed: seed + 1 });
    } else {
      const legA = run ? Math.sin(ph) * 0.9 : (o.legs || 0.22), legB = run ? -Math.sin(ph) * 0.9 : -(o.legs || 0.22);
      for (const [a, k, d] of [[legA, Math.max(0, Math.cos(ph)) * 0.8, 1], [legB, Math.max(0, -Math.cos(ph)) * 0.8, -1]]) {
        const kx = hx + Math.sin(a) * 42 * s, ky = hipY + Math.cos(a) * 42 * s;
        const fx = kx + Math.sin(a - (run ? k : 0)) * 40 * s, fy = Math.min(y, ky + Math.cos(a - (run ? k : 0)) * 40 * s);
        G.limb(ctx, [[hx, hipY], [kx, ky], [fx, fy]], { color: '#2A2320', lw, seed: seed + a }); shoe(fx, fy, d);
      }
    }
    const body = o.robe || '#E0703E';
    G.poly(ctx, [[sx - 26 * s, shY - 6 * s], [sx + 26 * s, shY - 6 * s], [hx + 40 * s, (o.sit ? hipY + 12 * s : y - 30 * s)], [hx - 40 * s, (o.sit ? hipY + 12 * s : y - 30 * s)]], { fill: body, lw: 5 * s, seed: seed + 5 });
    for (const [side, a] of [[-1, o.armL ?? 0.35], [1, o.armR ?? 0.35]]) {
      const ex = sx + side * Math.sin(a) * 40 * s, ey = shY + Math.cos(a) * 40 * s;
      const a2 = a + (o.elbow ?? 0.3);
      const wx = ex + side * Math.sin(a2) * 38 * s, wy = ey + Math.cos(a2) * 38 * s;
      G.limb(ctx, [[sx + side * 18 * s, shY], [ex, ey], [wx, wy]], { color: '#2A2320', lw: lw * 0.85, seed: seed + 3 + side }); glove(wx, wy);
    }
    const hxH = sx + (o.headX || 0) * s, hy = headY + (o.headY || 0) * s, R = 40 * s;
    G.ellipse(ctx, hxH, hy, R, R * 1.05, { fill: o.face || '#F6D8B0', lw: 6 * s, seed: seed + 7 });
    if (o.beard) G.poly(ctx, [[hxH - 30 * s, hy + 10 * s], [hxH + 30 * s, hy + 10 * s], [hxH, hy + 70 * s]], { fill: o.beard, lw: 4 * s, seed: seed + 8 });
    if (o.crown) G.poly(ctx, [[hxH - 34 * s, hy - 30 * s], [hxH - 34 * s, hy - 72 * s], [hxH - 17 * s, hy - 50 * s], [hxH, hy - 78 * s], [hxH + 17 * s, hy - 50 * s], [hxH + 34 * s, hy - 72 * s], [hxH + 34 * s, hy - 30 * s]], { fill: GOLD, lw: 5 * s, seed: seed + 9 });
    if (s > 0.3) {
      const look = (o.look || 0) * 6 * s, big = o.eyes === 'wide' ? 1.35 : 1;
      for (const d of [-1, 1]) {
        const ex = hxH + d * 15 * s + look, ey = hy - 6 * s;
        if (o.eyes === 'happy') { G.line(ctx, [[ex - 9 * s, ey + 3 * s], [ex, ey - 7 * s], [ex + 9 * s, ey + 3 * s]], { color: c, lw: 5 * s, seed: 9 + d }); continue; }
        G.ellipse(ctx, ex, ey, 11 * s * big, 15 * s * big, { fill: '#FFFFFF', lw: 4 * s, seed: 3 + d });
        if (o.eyes === 'proud') { G.rrect(ctx, ex - 11 * s, ey - 15 * s, 22 * s, 12 * s, 3 * s, { fill: o.face || '#F6D8B0', lw: 3 * s, seed: 6 + d }); G.ellipse(ctx, ex, ey + 4 * s, 5 * s, 6 * s, { fill: c, lw: 0, seed: 4 + d }); }
        else G.ellipse(ctx, ex + 2 * s, ey + 2 * s, 5.5 * s * big, 7 * s * big, { fill: c, lw: 0, seed: 4 + d });
      }
      if (o.mouth === 'open') G.ellipse(ctx, hxH + look, hy + 20 * s, 11 * s, 13 * s, { fill: '#7A1A1A', lw: 4 * s, seed: 4 });
      else if (o.mouth === 'smile') G.line(ctx, [[hxH - 15 * s + look, hy + 14 * s], [hxH + look, hy + 24 * s], [hxH + 15 * s + look, hy + 14 * s]], { color: c, lw: 5 * s, seed: 5 });
      else if (o.mouth === 'sad') G.line(ctx, [[hxH - 13 * s + look, hy + 24 * s], [hxH + look, hy + 16 * s], [hxH + 13 * s + look, hy + 24 * s]], { color: c, lw: 5 * s, seed: 5 });
      else G.line(ctx, [[hxH - 10 * s + look, hy + 20 * s], [hxH + 10 * s + look, hy + 20 * s]], { color: c, lw: 5 * s, seed: 5 });
    }
    ctx.restore();
    return { head: [hxH, hy - 12 * s], shoulder: [sx, shY] };
  }
  // bulle de bruitage (etoile a pointes)
  function burst(ctx, txt, x, y, t, t0, d = 1.4, size = 90, col = '#F2D24B') {
    const k = clamp((t - t0) / 0.18); if (k <= 0 || t > t0 + d) return;
    const out = clamp((t0 + d - t) / 0.25), sc = lerp(0.2, 1, ease.outBack(k, 3)) * (0.6 + 0.4 * out);
    ctx.save(); ctx.translate(x, y); ctx.rotate(-0.12 + 0.05 * Math.sin(t * 20)); ctx.scale(sc, sc); ctx.globalAlpha = out;
    const n = 14, pts = []; for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2, r = (i % 2 ? 0.62 : 1) * size * 2.4 * (0.9 + 0.2 * U.hash(i, t0)); pts.push([Math.cos(a) * r, Math.sin(a) * r * 0.62]); }
    G.poly(ctx, pts, { fill: col, lw: 8, seed: Math.round(t0 * 10) });
    G.text(ctx, txt, 0, size * 0.35, { size, fam: 'Bungee', weight: 400, color: '#C8432E', align: 'center', stroke: '#FFFFFF', strokeW: 10 });
    ctx.restore();
  }
  function speedLines(ctx, x, y, w, h, t, n = 12) { for (let i = 0; i < n; i++) { const yy = y + U.hash(i, 5) * h, xx = x + ((U.hash(i, 6) * w + t * 900) % w); G.line(ctx, [[xx, yy], [xx + 120, yy]], { color: 'rgba(255,255,255,0.8)', lw: 6, seed: i }); } }
  // ---------- l'ange : ailes a plumes, robe blanche, aureole
  function wing(ctx, bx, by, d, s, flap, seed) {
    // aile a plumes : bord d'attaque qui monte vers la pointe, puis plumes arrondies qui redescendent
    const f = flap * 0.12, P = (x, y) => [bx + d * x * s, by + (y - f * x) * s];
    const tip = [200, -150], pts = [P(0, 0), P(60, -95), P(130, -150), tip.length && P(200, -165)];
    const feathers = [[205, -120], [195, -70], [175, -25], [150, 15], [118, 48], [82, 72], [45, 85], [12, 60]];
    const out = [...pts];
    feathers.forEach(([x, y], i) => { const [px, py] = i ? feathers[i - 1] : [200, -165]; const mx = (px + x) / 2 + 14, my = (py + y) / 2 + 16; out.push(P(mx, my), P(x, y)); });
    G.poly(ctx, out, { fill: '#FFF8E6', lw: 4.5 * s, seed, hatch: { color: 'rgba(200,170,90,0.25)', gap: 9 } });
    for (let i = 1; i < feathers.length - 1; i += 1) { const [x, y] = feathers[i]; G.line(ctx, [P(x * 0.55, y * 0.45 - 40), P(x * 0.92, y * 0.92)], { color: 'rgba(120,90,40,0.6)', lw: 3 * s, seed: seed + i }); }
  }
  function angel(ctx, x, y, s, t, o = {}) {
    const flap = Math.sin(t * 2.4);
    for (const d of [-1, 1]) wing(ctx, x + d * 8 * s, y - 128 * s, d, s, flap, 30 + d * 10);
    const r = stick(ctx, x, y, s, { robe: '#FFFFFF', armL: o.armL ?? 2.6, armR: o.armR ?? 2.6, elbow: o.elbow ?? 0.1, eyes: o.eyes || 'normal', mouth: o.mouth || 'flat', seed: 40 });
    G.ellipse(ctx, r.head[0], r.head[1] - 44 * s, 30 * s, 8 * s, { fill: null, stroke: GOLD, lw: 6 * s, seed: 41 });
    return r;
  }

  // ---------- decor
  function city(ctx, cx, base, w, u, seed = 1, o = {}) {
    const steps = 5;
    for (let k = 0; k < steps; k++) {
      const sw = 360 - k * 62, sh = 70, y0 = base - k * sh;
      const fall = clamp(u * 1.4 - k * 0.12, 0, 1), dy = ease.inQuad(fall) * (120 + k * 70), rot = fall * (k % 2 ? 0.25 : -0.22);
      const c = [[-sw / 2, 0], [sw / 2, 0], [sw / 2, -sh], [-sw / 2, -sh]].map(([px, py]) => [cx + px * Math.cos(rot) - py * Math.sin(rot) + fall * (k % 2 ? 60 : -50), y0 + px * Math.sin(rot) + py * Math.cos(rot) + dy]);
      G.poly(ctx, c, { fill: k % 2 ? '#C98F55' : '#B9773F', lw: 5, seed: seed + 50 + k, hatch: { color: 'rgba(90,50,20,0.28)', gap: 8 } });
    }
    for (let i = 0; i < 9; i++) {
      const bw = 70 + U.hash(seed, i) * 60, bh = 160 + U.hash(seed, i, 2) * 260, bx = cx - w / 2 + (i + 0.5) * w / 9;
      if (Math.abs(bx - cx) < 190) continue;
      const fall = clamp(u * 1.5 - U.hash(seed, i, 9) * 0.5, 0, 1), side = bx < cx ? -1 : 1, a = side * fall * 1.2;
      const c = [[-bw / 2, 0], [bw / 2, 0], [bw / 2, -bh], [-bw / 2, -bh]].map(([px, py]) => [bx + px * Math.cos(a) - py * Math.sin(a), base + px * Math.sin(a) + py * Math.cos(a) + fall * 40]);
      G.poly(ctx, c, { fill: i % 2 ? '#D8A86A' : '#C48A4E', lw: 5, seed: seed + i, hatch: { color: 'rgba(90,50,20,0.25)', gap: 8 } });
      if (fall < 0.2) for (let k = 0; k < 3; k++) G.rrect(ctx, bx - 12, base - bh + 30 + k * 50, 24, 28, 4, { fill: o.lit ? '#FFD27A' : '#3A2A20', lw: 3, seed: i * 7 + k });
    }
    if (u > 0.15) for (let i = 0; i < 9; i++) { const k = clamp(u * 1.3 - 0.15), px = cx + (U.hash(seed, i, 4) - 0.5) * w, r = 40 + k * 90 * U.hash(seed, i, 5); G.ellipse(ctx, px, base - 20 - k * 60 * U.hash(i, 3), r, r * 0.6, { fill: 'rgba(150,130,110,0.45)', lw: 0, seed: i }); }
  }
  function sky(ctx, glow = 0, mood = 'dusk') {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    const P = { dusk: ['#27305C', '#8A5A7A', '#E8A86A'], night: ['#121633', '#2E2A4E', '#5A3A50'], gold: ['#C98A3A', '#F2C36A', '#FFE6B0'], fire: ['#2A1420', '#7A2A2A', '#E0703E'] }[mood];
    g.addColorStop(0, P[0]); g.addColorStop(0.55, P[1]); g.addColorStop(1, P[2]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    if (glow > 0) { const r = ctx.createRadialGradient(W / 2, H * 0.3, 0, W / 2, H * 0.3, H * 0.8); r.addColorStop(0, `rgba(255,240,190,${0.85 * glow})`); r.addColorStop(1, 'rgba(255,240,190,0)'); ctx.fillStyle = r; ctx.fillRect(0, 0, W, H); }
  }
  function ground(ctx, lit = 0, col = '#7A5A3A') {
    G.poly(ctx, [[-40, GROUND], [W + 40, GROUND], [W + 40, H + 40], [-40, H + 40]], { fill: col, lw: 5, seed: 8, hatch: { color: 'rgba(40,20,10,0.25)', gap: 9 } });
    if (lit > 0) { ctx.fillStyle = `rgba(255,236,170,${0.4 * lit})`; ctx.fillRect(0, GROUND, W, H - GROUND); }
  }
  function ref(ctx) { G.text(ctx, 'Apocalypse 18, 1-8 · traduction Louis Segond', W / 2, SAFE.y + SAFE.h - 6, { size: 38, fam: 'Patrick Hand', weight: 400, color: '#FFF4DE', align: 'center', stroke: 'rgba(30,20,15,0.85)', strokeW: 7 }); }
  function stamp(ctx, txt, x, y, size, t, t0, col = RED) {
    const k = clamp((t - t0) / 0.25); if (k <= 0) return;
    const sc = lerp(2.2, 1, ease.outBack(k, 2));
    ctx.save(); ctx.translate(x, y); ctx.rotate(-0.06); ctx.scale(sc, sc);
    G.text(ctx, txt, 0, 0, { size, fam: 'Bungee', weight: 400, color: col, align: 'center', stroke: '#FFF4DE', strokeW: 10 });
    ctx.restore();
  }
  // carte en papier dechire (info, reference)
  function paper(ctx, lines, t, a, b, o = {}) {
    const k = win(t, a, b, 0.3, 0.3); if (k <= 0) return;
    const y = o.y ?? CAP_Y, w = o.w ?? SAFE.w - 60, x = (o.x ?? W / 2) - w / 2, size = o.size ?? 48, h = o.h ?? (lines.length * size * 1.25 + 60);
    ctx.save(); ctx.globalAlpha = k; ctx.translate(0, (1 - ease.outCubic(k)) * 30);
    G.tornPaper(ctx, x, y, w, h, { fill: o.fill ?? CREAM, seed: o.seed ?? 3 });
    lines.forEach((l, i) => G.text(ctx, l, x + w / 2, y + 30 + size + i * size * 1.25 - size * 0.2, { size: i === 0 && o.head ? size * 1.05 : size * (i === 0 || !o.head ? 1 : 0.85), fam: i === 0 && o.head ? 'Bungee' : 'Patrick Hand', weight: 400, color: i === 0 && o.head ? (o.headColor ?? ORANGE) : INK, align: 'center' }));
    ctx.restore();
  }
  function scrollPaper(ctx, x, y, w, h, lines, seed = 5) {
    G.rrect(ctx, x, y, w, h, 10, { fill: '#F2E2BC', lw: 5, seed, hatch: { color: 'rgba(120,80,40,0.12)', gap: 10 } });
    for (const yy of [y, y + h]) G.rrect(ctx, x - 18, yy - 14, w + 36, 28, 14, { fill: '#B98A55', lw: 4, seed: seed + yy });
    lines.forEach((l, i) => G.text(ctx, l, x + w / 2, y + 70 + i * 62, { size: i ? 44 : 52, fam: i ? 'Caveat' : 'Bungee', weight: i ? 700 : 400, color: i ? '#3A2A1A' : RED, align: 'center' }));
  }
  function flames(ctx, cx, base, w, t, k) {
    if (k <= 0) return;
    for (let i = 0; i < 14; i++) { const x = cx + (U.hash(i, 31) - 0.5) * w, h = (120 + 220 * U.hash(i, 32)) * k * (0.8 + 0.25 * Math.sin(t * 9 + i)); G.poly(ctx, [[x - 40, base], [x - 10, base - h * 0.6], [x, base - h], [x + 14, base - h * 0.55], [x + 40, base]], { fill: i % 2 ? '#F2B84B' : '#E0703E', lw: 4, seed: 300 + i }); }
  }
  function beast7(ctx, x, y, s, t) { // la bete rouge aux sept tetes (silhouette)
    G.ellipse(ctx, x, y, 170 * s, 80 * s, { fill: '#B8322A', lw: 6 * s, seed: 70 });
    for (const lx of [-110, -50, 50, 110]) G.line(ctx, [[x + lx * s, y + 40 * s], [x + lx * s, y + 140 * s]], { color: INK, lw: 14 * s, seed: 71 + lx });
    for (let i = 0; i < 7; i++) { const a = -2.6 + i * 0.36, nx = x + Math.cos(a) * 160 * s, ny = y - 30 * s + Math.sin(a) * 170 * s + 6 * Math.sin(t * 2 + i) * s; G.line(ctx, [[x + Math.cos(a) * 60 * s, y - 30 * s], [nx, ny]], { color: '#B8322A', lw: 22 * s, seed: 80 + i }); G.ellipse(ctx, nx, ny, 28 * s, 22 * s, { fill: '#B8322A', lw: 5 * s, seed: 90 + i }); G.ellipse(ctx, nx + 8 * s, ny - 4 * s, 4 * s, 4 * s, { fill: '#F2D24B', lw: 0, seed: 95 + i }); G.line(ctx, [[nx - 8 * s, ny - 18 * s], [nx - 14 * s, ny - 40 * s]], { color: '#F2E6C8', lw: 6 * s, seed: 97 + i }); }
  }

  // ---------- scenes
  function sceneIntro(ctx, t) {
    if (t < C.serie || t >= C.title) {
      const d = clamp(t / 7);
      sky(ctx, 0.3 * d, 'night'); G.rays(ctx, W / 2, H * 0.22, { n: 22, r0: 60, r1: 900, color: GOLD, lw: 5, alpha: 0.35 * d, spin: t * 0.05 });
      ground(ctx, 0.2 * d, '#4A3A2E'); city(ctx, W / 2, GROUND, W * 1.1, 0, 3, { lit: true });
      angel(ctx, W / 2, lerp(H * 0.12, H * 0.42, ease.outCubic(d)), lerp(0.5, 1.2, d), t, { armL: 2.4, armR: 2.4, mouth: 'open', eyes: 'wide' });
      if (t < C.serie) paper(ctx, ['un ange… et une ville qui va tomber'], t, 1.0, C.serie - 0.3, { size: 46 });
      if (t >= C.title) { // titre
        const k = clamp((t - C.title) / 0.4), y0 = Math.round(H * 0.55);
        ctx.save(); ctx.globalAlpha = k; G.tornPaper(ctx, SAFE.x + 10, y0, SAFE.w - 20, 380, { fill: CREAM, seed: 4 }); ctx.restore();
        stamp(ctx, 'ELLE EST TOMBÉE,', W / 2, y0 + 150, 76, t, C.title + 0.1);
        stamp(ctx, 'BABYLONE LA GRANDE', W / 2, y0 + 270, 66, t, C.title + 0.5, INK);
      }
      return;
    }
    // Claude rappelle l'episode precedent
    ctx.fillStyle = '#F4EDE0'; ctx.fillRect(0, 0, W, H);
    const u = t - C.serie, y1 = Math.round(H * 0.29);
    G.tornPaper(ctx, SAFE.x + 20, y1, SAFE.w - 40, 250, { fill: '#FFFDF6', seed: 11 });
    G.text(ctx, 'On remonte la Bible,', SAFE.x + SAFE.w / 2, y1 + 100, { size: 64, fam: 'Caveat', weight: 700, align: 'center', color: INK });
    G.text(ctx, 'scène par scène', SAFE.x + SAFE.w / 2, y1 + 185, { size: 76, fam: 'Caveat', weight: 700, align: 'center', color: ORANGE });
    [['50', 'Tout perdu en une seule heure'], ['51', 'Elle est tombée, Babylone la grande']].forEach(([n, ttl], i) => { const y = y1 + 330 + i * 150, a = clamp((u - 0.8 - i * 1.2) / 0.5); if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; G.rrect(ctx, SAFE.x + 30, y, SAFE.w - 60, 120, 18, { fill: i ? GOLD : '#E8DFCC', lw: 5, seed: 20 + i }); G.text(ctx, `Ép. ${n}`, SAFE.x + 66, y + 76, { size: 44, fam: 'Bungee', weight: 400, color: INK }); G.text(ctx, ttl, SAFE.x + 230, y + 74, { size: 38, fam: 'Patrick Hand', weight: 400, color: INK }); ctx.restore(); });
    G.text(ctx, '▲ une scène avant', SAFE.x + SAFE.w / 2, y1 + 310, { size: 38, fam: 'Patrick Hand', weight: 400, align: 'center', color: INK, alpha: clamp((u - 2.2) / 0.5) });
    const m = env(t);
    Ch.claude(ctx, { x: W * 0.45, y: SAFE.y + SAFE.h - 10, s: 1.15, eyes: 'happy', mouth: m > 0.15 ? 'open' : 'smile', armL: 0.4, armR: 1.4 + 0.2 * Math.sin(t * 6), blush: 0.5 });
  }
  function sceneAnge(ctx, t) {
    const T0 = SC.ange[0], d = ease.outCubic(clamp((t - T0) / 5));
    const LY = globalThis.LAYERS ?? 99; // demonstration « making-of » : nombre de couches dessinees
    if (LY < 1) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, H); }
    if (LY >= 1) sky(ctx, d, 'dusk');
    if (LY >= 2) G.rays(ctx, W / 2, H * 0.3, { n: 28, r0: 160, r1: 1400, color: GOLD, lw: 6, alpha: 0.55 * d, spin: t * 0.05 });
    if (LY >= 3) { ground(ctx, d); city(ctx, W / 2, GROUND, W * 1.1, 0, 3, { lit: d > 0.5 }); }
    if (LY >= 4) angel(ctx, W / 2, lerp(-150, H * 0.5, d) - 60 * Math.abs(Math.sin(Math.min(1, (t - T0) / 5) * Math.PI * 3)) * (1 - d), 2.0, t, { armL: 0.9 + d, armR: 0.9 + d, mouth: 'smile' });
    if (LY < 5) return;
    if (t > C.gloire) { const k = clamp((t - C.gloire - 0.5) / 0.6); ctx.save(); ctx.globalAlpha = k; G.ellipse(ctx, SAFE.x + 110, SAFE.y + 330, 60, 60, { fill: '#FFD24A', lw: 5, seed: 51 }); G.rays(ctx, SAFE.x + 110, SAFE.y + 330, { n: 12, r0: 72, r1: 110, color: '#FFD24A', lw: 6, alpha: 1 }); ctx.restore(); }
    paper(ctx, ['« la terre fut éclairée de sa gloire »'], t, T0 + 0.6, C.gloire, { size: 46 });
    paper(ctx, ['comme un second soleil'], t, C.gloire + 0.5, SC.cri[0], { size: 50 });
    ref(ctx);
  }
  function sceneCri(ctx, t) {
    const T0 = SC.cri[0], hit = T0 + 2.6;
    if (t < C.isaie) {
      const fall = clamp((t - hit) / 4), sh = t > hit ? 40 * Math.exp(-(t - hit) * 2.5) : 0;
      ctx.save(); ctx.translate(U.noise1(t * 30, 1) * sh, U.noise1(t * 30, 2) * sh);
      sky(ctx, 0.3, 'dusk'); ground(ctx); city(ctx, W / 2, GROUND, W * 1.1, fall, 3);
      angel(ctx, W / 2, Math.round(H * 0.42), 1.2, t, { armL: 2.7, armR: 2.7, mouth: 'open', eyes: 'wide' });
      ctx.restore();
      if (t > hit) { ctx.fillStyle = `rgba(255,250,235,${0.8 * Math.exp(-(t - hit) * 10)})`; ctx.fillRect(0, 0, W, H); }
      stamp(ctx, 'ELLE EST TOMBÉE,', W / 2, Math.round(H * 0.50), 74, t, hit);
      stamp(ctx, 'ELLE EST TOMBÉE !', W / 2, Math.round(H * 0.57), 74, t, hit + 0.9);
      ref(ctx); return;
    }
    if (t < C.cyrus) { // Isaie 21 : la sentinelle sur la tour voit arriver le messager
      sky(ctx, 0, 'dusk'); ground(ctx, 0, '#8A6A44');
      G.rrect(ctx, W * 0.12, GROUND - 380, 170, 380, 6, { fill: '#C48A4E', lw: 5, seed: 61, hatch: { color: 'rgba(90,50,20,0.25)', gap: 8 } });
      for (let k = 0; k < 4; k++) G.rrect(ctx, W * 0.12 + k * 44, GROUND - 420, 30, 40, 2, { fill: '#C48A4E', lw: 4, seed: 62 + k });
      stick(ctx, W * 0.12 + 85, GROUND - 380, 0.9, { armR: 2.4, armL: 0.3, eyes: 'wide', mouth: 'open', robe: TEAL, seed: 63 });
      const u = clamp((t - C.isaie) / 7), hx = lerp(W * 1.1, W * 0.62, ease.outCubic(u));
      const hr = Ch.horse(ctx, { x: hx, y: GROUND + 60, s: 1.0, walk: t * 6, facing: -1, color: '#F2EEE3', shadow: true });
      if (hr && hr.seat) stick(ctx, hr.seat[0], hr.seat[1] + 40, 0.75, { sit: true, armR: 1.6, robe: RED, seed: 64 });
      paper(ctx, ['Isaïe 21, 9', '« Elle est tombée, elle est tombée, Babylone ! »'], t, C.isaie + 0.3, C.cyrus, { size: 44, head: true, y: Math.round(H * 0.20) + 230 });
      ref(ctx); return;
    }
    // 539 av. J.-C. : Cyrus entre par le lit du fleuve pendant la fete
    sky(ctx, 0, 'night'); ground(ctx, 0, '#4A3A2E');
    G.rrect(ctx, -20, GROUND - 380, W + 40, 300, 4, { fill: '#9A6A3E', lw: 6, seed: 71, hatch: { color: 'rgba(40,20,10,0.25)', gap: 9 } });
    for (let k = 0; k < 12; k++) G.rrect(ctx, k * 95, GROUND - 420, 55, 44, 3, { fill: '#9A6A3E', lw: 4, seed: 72 + k });
    // fete sur les remparts
    for (let i = 0; i < 5; i++) stick(ctx, W * (0.12 + i * 0.19), GROUND - 380, 0.55, { armL: 2.4 + 0.3 * Math.sin(t * 7 + i), armR: 2.4 + 0.3 * Math.sin(t * 7 + i + 1), eyes: 'happy', mouth: 'smile', robe: [GOLD, RED, TEAL, '#6A5AA0', ORANGE][i], seed: 120 + i });
    // le fleuve (presque a sec) et les soldats perses
    G.poly(ctx, [[W * 0.35, GROUND - 80], [W * 0.65, GROUND - 80], [W * 0.75, H + 20], [W * 0.25, H + 20]], { fill: '#4A6A8A', lw: 5, seed: 75 });
    for (let i = 0; i < 7; i++) { const u = ((t - C.cyrus) * 0.12 + i / 7) % 1; stick(ctx, lerp(W * 0.5 + (i % 2 ? 40 : -40), W * 0.5, u), lerp(H * 0.95, GROUND - 70, u), lerp(0.9, 0.35, u), { run: t * 9 + i, armL: 0.6, armR: 1.2, lean: 12, robe: '#6A6A5A', seed: 140 + i, eyes: 'normal' }); }
    paper(ctx, ['539 av. J.-C.', 'Cyrus prend Babylone par le lit du fleuve (Hérodote)'], t, C.cyrus + 0.3, SC.oiseaux[0], { size: 40, head: true, y: Math.round(H * 0.20) + 330 });
    ref(ctx);
  }
  function sceneOiseaux(ctx, t) {
    const T0 = SC.oiseaux[0], u = t - T0;
    sky(ctx, 0, 'night'); ground(ctx, 0, '#4A3A2E'); city(ctx, W / 2, GROUND, W * 1.1, 1, 3);
    for (let i = 0; i < 4; i++) { const x = W * (0.18 + i * 0.22), y = GROUND - 120 - (i % 2) * 70 + 8 * Math.sin(t * 2 + i); const a = clamp((u - 0.5 - i * 0.4) / 0.8); if (a <= 0) continue; ctx.save(); ctx.globalAlpha = a * (t < C.ruines ? 1 : 0.4); G.shape(ctx, G.ellPts(x, y, 46, 70), { fill: '#2A2028', lw: 3, seed: 60 + i }); for (const dd of [-1, 1]) G.ellipse(ctx, x + dd * 14, y - 20, 7, 9, { fill: '#F2D24B', lw: 0, seed: 70 + i + dd }); ctx.restore(); }
    for (let i = 0; i < 7; i++) { const k = clamp((u - i * 0.45) / 2.2), sx = W * (U.hash(i, 1) < 0.5 ? -0.1 : 1.1), ex = W * (0.1 + 0.8 * U.hash(i, 2)), ey = GROUND - 60 - 260 * U.hash(i, 3); Ch.bird(ctx, { x: lerp(sx, ex, ease.outCubic(k)), y: lerp(SAFE.y + 300, ey, ease.outCubic(k)), s: 1.2, color: '#1E1A22', t, flap: k < 1 ? 1 : 0.1, facing: sx < ex ? 1 : -1 }); }
    if (t >= C.ruines) { // Isaie 13 : hiboux et chacals
      const k = clamp((t - C.ruines) / 0.8);
      for (let i = 0; i < 3; i++) { const x = W * (0.2 + i * 0.3), y = GROUND - 200 - (i % 2) * 90; ctx.save(); ctx.globalAlpha = k; G.ellipse(ctx, x, y, 44, 56, { fill: '#8A6A4A', lw: 5, seed: 150 + i }); for (const dd of [-1, 1]) { G.ellipse(ctx, x + dd * 17, y - 14, 15, 15, { fill: '#FFF4DE', lw: 3, seed: 151 + dd }); G.ellipse(ctx, x + dd * 17, y - 14, 6, 6, { fill: INK, lw: 0, seed: 152 + dd }); } G.poly(ctx, [[x - 6, y + 2], [x + 6, y + 2], [x, y + 14]], { fill: GOLD, lw: 2, seed: 153 }); ctx.restore(); }
      Ch.dog(ctx, { x: W * 0.72, y: GROUND + 120, s: 1.1, color: '#9A8A6A', t, pose: 'stand', bark: Math.sin(t * 3) > 0.6 });
      Ch.dog(ctx, { x: W * 0.3, y: GROUND + 160, s: 1.0, color: '#8A7A5A', t: t + 1, pose: 'sit', look: 1 });
    }
    paper(ctx, ['« un repaire de tout esprit impur', 'et de tout oiseau impur »'], t, T0 + 0.6, C.ruines, { size: 44, y: Math.round(H * 0.20) + 260 });
    paper(ctx, ['Isaïe 13, 21-22', 'hiboux dans les maisons, chacals dans les palais'], t, C.ruines + 0.3, SC.sortez[0], { size: 40, head: true, y: Math.round(H * 0.20) + 260 });
    ref(ctx);
  }
  function sceneSortez(ctx, t) {
    const T0 = SC.sortez[0], u = t - T0;
    if (t < C.babel) {
      sky(ctx, 0.15, 'dusk'); G.rays(ctx, W / 2, -80, { n: 14, r0: 60, r1: 900, color: GOLD, lw: 5, alpha: 0.4 });
      ground(ctx); city(ctx, W * 0.5, GROUND - 120, W * 1.1, 0.25, 5);
      for (let i = 0; i < 10; i++) {
        const k = clamp(((u * 0.18 + i * 0.11) % 1.2)), row = i % 3;
        const x = W * (0.25 + 0.5 * U.hash(i, 7)) + (i % 2 ? 1 : -1) * k * 200, y = lerp(GROUND - 110, GROUND + 180 + row * 60, ease.inOutQuad(clamp(k))), s = lerp(0.45, 1.05 + row * 0.1, clamp(k));
        if (k <= 0 || k >= 1) continue;
        stick(ctx, x, y, s, { run: t * 11 + i, armL: 1.1 + 0.6 * Math.sin(t * 11 + i), armR: 1.1 - 0.6 * Math.sin(t * 11 + i), lean: 18, eyes: 'wide', mouth: 'open', seed: 100 + i, robe: [RED, TEAL, ORANGE, '#6A5AA0'][i % 4] });
      }
      if (t < C.jeremie) G.bubble(ctx, '« Sortez du milieu d\'elle,\nmon peuple ! »', W * 0.5, Math.round(H * 0.24) + 230, W * 0.5, Math.round(H * 0.18) + 150, t, T0 + 0.5, C.jeremie, { size: 54 });
      paper(ctx, ['Jérémie 51, 45', '« Sortez du milieu d\'elle, mon peuple ! »', 'aux Juifs exilés à Babylone'], t, C.jeremie + 0.3, C.babel, { size: 40, head: true, y: Math.round(H * 0.20) + 230 });
      ref(ctx); return;
    }
    // la tour de Babel qui monte « jusqu'au ciel »
    sky(ctx, 0, 'dusk'); ground(ctx);
    const k = clamp((t - C.babel) / 4);
    for (let i = 0; i < 9; i++) { if (k * 9 < i) break; const w = 420 - i * 36, y = GROUND - (i + 1) * 95; G.rrect(ctx, W / 2 - w / 2, y, w, 95, 6, { fill: i % 2 ? '#C98F55' : '#B9773F', lw: 5, seed: 200 + i, hatch: { color: 'rgba(90,50,20,0.25)', gap: 8 } }); for (let j = 0; j < 3; j++) G.rrect(ctx, W / 2 - w / 2 + 30 + j * (w - 80) / 2, y + 30, 26, 36, 4, { fill: '#3A2A20', lw: 3, seed: 210 + i * 3 + j }); }
    for (let i = 0; i < 5; i++) G.ellipse(ctx, W * (0.15 + i * 0.18), GROUND - 960 + (i % 2) * 40, 120, 40, { fill: 'rgba(255,255,255,0.75)', lw: 3, seed: 230 + i });
    paper(ctx, ['Genèse 11 : la tour de Babel', '« dont le sommet touche au ciel »'], t, C.babel + 0.5, SC.reine[0], { size: 42, head: true, headColor: ORANGE, y: Math.round(H * 0.20) + 230 });
    ref(ctx);
  }
  function sceneReine(ctx, t) {
    const T0 = SC.reine[0], fire = clamp((t - C.orgueil - 5.5) / 1.5);
    sky(ctx, 0, fire > 0 ? 'fire' : 'dusk'); ground(ctx, 0, '#6A4A30'); city(ctx, W / 2, GROUND - 40, W * 1.1, 0, 7, { lit: fire <= 0 });
    flames(ctx, W / 2, GROUND - 40, W * 1.05, t, fire);
    // la reine sur son trone
    const tx = W * 0.5, ty = GROUND + 150;
    G.rrect(ctx, tx - 110, ty - 260, 220, 260, 14, { fill: '#8A2A3A', lw: 6, seed: 251 }); G.rrect(ctx, tx - 140, ty - 120, 280, 40, 8, { fill: GOLD, lw: 5, seed: 252 });
    stick(ctx, tx - 25, ty - 80, 1.6, { sit: true, crown: true, robe: '#6A1A3A', eyes: fire > 0.3 ? 'wide' : 'proud', mouth: fire > 0.3 ? 'open' : 'smile', headY: -6, armL: 0.6, armR: 1.2, seed: 260 });
    if (t < C.orgueil - 4.6) G.bubble(ctx, '« Je suis assise en reine,\nje ne suis point veuve ! »', W * 0.5, Math.round(H * 0.24) + 230, tx, ty - 380, t, T0 + 3, C.orgueil - 4.6, { size: 50 });
    if (t > C.orgueil - 4.5 && t < C.orgueil + 5.3) ['LA MORT', 'LE DEUIL', 'LA FAMINE'].forEach((w, i) => stamp(ctx, w, W / 2, Math.round(H * 0.33) + 150 + i * 105, 76, t, C.orgueil - 4.5 + i * 0.7, i === 1 ? INK : RED));
    paper(ctx, ['« en un même jour »', 'le feu de l\'épisode 50'], t, C.orgueil + 6, SC.fin[0], { size: 44, head: true, headColor: RED, y: Math.round(H * 0.20) + 230 });
    ref(ctx);
  }
  function sceneFin(ctx, t) {
    const T0 = SC.fin[0];
    sky(ctx, 0.1, 'night'); ground(ctx, 0, '#3A2E26');
    beast7(ctx, W * 0.56, GROUND - 60, 1.45, t);
    stick(ctx, W * 0.56, GROUND - 175, 1.15, { sit: true, crown: true, robe: '#7A1A4A', eyes: 'proud', mouth: 'smile', seed: 300 });
    angel(ctx, W * 0.2, GROUND + 160, 1.0, t, { armL: 0.4, armR: 2.0, elbow: 0 });
    stick(ctx, W * 0.4, GROUND + 165, 0.95, { robe: '#D8C8A0', beard: '#E8E4DC', eyes: 'wide', mouth: 'open', seed: 301, armR: 0.9 });
    stamp(ctx, '?', W * 0.86, GROUND - 420, 170, t, T0 + 4, GOLD);
    paper(ctx, ['PROCHAIN ÉPISODE', 'Apocalypse 17, 7-18'], t, T0 + 7, S.DURATION + 1, { size: 46, head: true, y: Math.round(H * 0.20) + 230 });
  }
  function sceneCover(ctx, t) {
    sky(ctx, 0.7, 'dusk'); G.rays(ctx, W / 2, Math.round(H * 0.3), { n: 30, r0: 150, r1: 1400, color: GOLD, lw: 6, alpha: 0.6 });
    ground(ctx, 0.3); city(ctx, W / 2, GROUND, W * 1.1, 0.45, 3);
    angel(ctx, W / 2, Math.round(H * 0.47), 1.55, 2.0, { armL: 2.7, armR: 2.7, mouth: 'open', eyes: 'wide' });
    const y0 = SAFE.y + SAFE.h - 470;
    G.tornPaper(ctx, SAFE.x + 10, y0, SAFE.w - 20, 440, { fill: CREAM, seed: 4 });
    G.rrect(ctx, W / 2 - 170, y0 + 40, 340, 80, 40, { fill: ORANGE, lw: 4, seed: 6 });
    G.text(ctx, 'ÉPISODE 51', W / 2, y0 + 97, { size: 46, fam: 'Bungee', weight: 400, color: '#FFFFFF', align: 'center' });
    G.text(ctx, 'ELLE EST TOMBÉE,', W / 2, y0 + 230, { size: 72, fam: 'Bungee', weight: 400, color: RED, align: 'center' });
    G.text(ctx, 'BABYLONE', W / 2, y0 + 320, { size: 86, fam: 'Bungee', weight: 400, align: 'center', color: INK });
    G.text(ctx, 'LA GRANDE', W / 2, y0 + 405, { size: 86, fam: 'Bungee', weight: 400, align: 'center', color: INK });
  }

  Studio.film({
    draw(ctx, t) {
      if (!G.style || !G.style.slap) G.setStyle('flat', { lw: 1.7, amp: 0.35, slap: true, post: { vignette: 0.15, paper: 0, grain: 0 } });
      if (t >= 999) return sceneCover(ctx, t);
      if (inS(t, 'intro')) sceneIntro(ctx, t);
      else if (inS(t, 'ange')) sceneAnge(ctx, t);
      else if (inS(t, 'cri')) sceneCri(ctx, t);
      else if (inS(t, 'oiseaux')) sceneOiseaux(ctx, t);
      else if (inS(t, 'sortez')) sceneSortez(ctx, t);
      else if (inS(t, 'reine')) sceneReine(ctx, t);
      else sceneFin(ctx, t);
      // --- bruitages slapstick
      const hit = SC.cri[0] + 2.6, BY = Math.round(H * 0.42);
      burst(ctx, 'TA-DAAA !', W * 0.74, Math.round(H * 0.37), t, SC.ange[0] + 4.6, 1.6, 52);
      burst(ctx, 'BOUM !', W * 0.3, Math.round(H * 0.64), t, hit, 1.2, 76);
      burst(ctx, 'CRAAAC !', W * 0.7, Math.round(H * 0.68), t, hit + 1.1, 1.3, 64, '#FF9A5A');
      burst(ctx, 'PLOUF !', W * 0.5, Math.round(H * 0.82) - 260, t, C.cyrus + 1.2, 1.3, 84, '#9ADFFF');
      burst(ctx, 'FLAP FLAP !', W * 0.5, Math.round(H * 0.47), t, SC.oiseaux[0] + 1.0, 1.6, 56);
      burst(ctx, 'OUAOUUU !', W * 0.66, Math.round(H * 0.5), t, C.ruines + 2.0, 1.4, 70, '#D8C8A0');
      burst(ctx, 'ZOUUU !', W * 0.5, Math.round(H * 0.5), t, SC.sortez[0] + 0.6, 1.4, 90, '#9AFF9A');
      burst(ctx, 'BOING !', W * 0.72, Math.round(H * 0.40), t, C.babel + 3.8, 1.2, 80);
      burst(ctx, 'FOUF !', W * 0.24, Math.round(H * 0.46), t, C.orgueil + 5.5, 1.4, 80, '#FF9A3A');
      if (inS(t, 'sortez') && t < C.babel) speedLines(ctx, 0, Math.round(H * 0.72), W, 300, t);
      const fo = clamp((t - (TL.duration - 0.9)) / 0.9); if (fo > 0) { ctx.fillStyle = `rgba(0,0,0,${fo})`; ctx.fillRect(0, 0, W, H); }
    },
    post: { paper: 0.5, vignette: 0.3, grain: 0.05 },
    fadeOut: 0,
  });
})();
