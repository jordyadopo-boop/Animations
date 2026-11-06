// Ep. 51 (essai stick animation) — Apocalypse 18, 1-8. Chaque image est une fonction pure de t.
(function () {
  const U = globalThis.U, G = globalThis.G, Ch = globalThis.Ch, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { clamp, lerp, ease } = U;
  const W = G.W, H = G.H, SAFE = G.SAFE;
  const GROUND = Math.round(H * 0.74);
  const dark = () => G.styleName === 'chalk' || G.styleName === 'neon';
  const INK = () => G.C.ink;
  const GOLD = '#F2B84B', RED = '#C8432E', TEAL = '#3D7A74';
  const inS = (t, k) => t >= S.S[k][0] && t < S.S[k][1];
  const loc = (t, k) => t - S.S[k][0];

  // ---------- bonhomme au trait (pieds en x, y)
  function stick(ctx, x, y, s, o = {}) {
    const c = o.color || INK(), lw = (o.lw || 7) * s, seed = o.seed || 1;
    const run = o.run !== undefined, ph = o.run || 0;
    const hipY = y - 78 * s, shY = y - 140 * s, headY = y - 178 * s, lean = (o.lean || 0) * s;
    const hx = x + lean * 0.4, sx = x + lean;
    // jambes
    const legA = run ? Math.sin(ph) * 0.7 : (o.legs || 0.18), legB = run ? -Math.sin(ph) * 0.7 : -(o.legs || 0.18);
    for (const [a, k] of [[legA, Math.max(0, Math.cos(ph)) * 0.8], [legB, Math.max(0, -Math.cos(ph)) * 0.8]]) {
      const kx = hx + Math.sin(a) * 42 * s, ky = hipY + Math.cos(a) * 42 * s;
      const fx = kx + Math.sin(a - (run ? k : 0)) * 40 * s, fy = Math.min(y, ky + Math.cos(a - (run ? k : 0)) * 40 * s);
      G.line(ctx, [[hx, hipY], [kx, ky], [fx, fy]], { color: c, lw, seed: seed + a, step: 12 });
    }
    // corps (ou robe)
    if (o.robe) G.poly(ctx, [[sx - 6 * s, shY], [sx + 6 * s, shY], [hx + 34 * s, y - 6 * s], [hx - 34 * s, y - 6 * s]], { fill: o.robe, lw: 4 * s, seed: seed + 5 });
    G.line(ctx, [[sx, shY - 8 * s], [hx, hipY]], { color: c, lw, seed: seed + 2, step: 14 });
    // bras : angles depuis le bas (+ = vers l'exterieur / le haut)
    for (const [side, a] of [[-1, o.armL ?? 0.35], [1, o.armR ?? 0.35]]) {
      const ex = sx + side * Math.sin(a) * 40 * s, ey = shY + Math.cos(a) * 40 * s;
      const a2 = a + (o.elbow ?? 0.3);
      const wx = ex + side * Math.sin(a2) * 38 * s, wy = ey + Math.cos(a2) * 38 * s;
      G.line(ctx, [[sx, shY], [ex, ey], [wx, wy]], { color: c, lw, seed: seed + 3 + side, step: 12 });
    }
    // tete
    const hxH = sx + (o.headX || 0) * s;
    G.ellipse(ctx, hxH, headY, 27 * s, 29 * s, { fill: o.face || (dark() ? '#1E2A24' : '#FBF6EA'), stroke: c, lw: lw * 0.75, seed: seed + 7 });
    if (s > 0.35) {
      const ey = headY - 3 * s, look = (o.look || 0) * 6 * s;
      for (const d of [-1, 1]) {
        if (o.eyes === 'happy') G.line(ctx, [[hxH + d * 10 * s - 6 * s + look, ey + 2 * s], [hxH + d * 10 * s + look, ey - 4 * s], [hxH + d * 10 * s + 6 * s + look, ey + 2 * s]], { color: c, lw: 3 * s, seed: 9 + d });
        else G.ellipse(ctx, hxH + d * 10 * s + look, ey, (o.eyes === 'wide' ? 5 : 3.6) * s, (o.eyes === 'wide' ? 6 : 4.4) * s, { fill: c, lw: 0, seed: 3 + d });
      }
      if (o.mouth === 'open') G.ellipse(ctx, hxH + look, headY + 13 * s, 7 * s, 8 * s, { fill: c, lw: 0, seed: 4 });
      else if (o.mouth === 'smile') G.line(ctx, [[hxH - 9 * s + look, headY + 10 * s], [hxH + look, headY + 15 * s], [hxH + 9 * s + look, headY + 10 * s]], { color: c, lw: 3 * s, seed: 5 });
      else G.line(ctx, [[hxH - 7 * s + look, headY + 13 * s], [hxH + 7 * s + look, headY + 13 * s]], { color: c, lw: 3 * s, seed: 5 });
    }
    return { head: [hxH, headY], shoulder: [sx, shY] };
  }

  // ---------- l'ange : grand bonhomme blanc, ailes, aureole, rayons
  function angel(ctx, x, y, s, t, o = {}) {
    const flap = Math.sin(t * 2.4) * 0.08;
    for (const d of [-1, 1]) {
      const bx = x + d * 10 * s, by = y - 135 * s;
      const pts = [[bx, by], [bx + d * 70 * s, by - (95 + 30 * flap * d) * s], [bx + d * 150 * s, by - 120 * s], [bx + d * 120 * s, by - 60 * s], [bx + d * 140 * s, by - 20 * s], [bx + d * 90 * s, by + 5 * s], [bx + d * 70 * s, by + 40 * s]];
      G.poly(ctx, pts, { fill: dark() ? 'rgba(242,238,227,0.18)' : '#FFF8E6', lw: 4 * s, seed: 30 + d, hatch: dark() ? null : { color: 'rgba(200,170,90,0.25)', gap: 9 } });
    }
    const r = stick(ctx, x, y, s, { robe: dark() ? 'rgba(242,238,227,0.25)' : '#FFFFFF', armL: o.armL ?? 2.6, armR: o.armR ?? 2.6, elbow: 0.1, eyes: o.eyes || 'wide', mouth: o.mouth || 'open', seed: 40 });
    G.ellipse(ctx, r.head[0], r.head[1] - 44 * s, 30 * s, 8 * s, { fill: null, stroke: GOLD, lw: 6 * s, seed: 41 });
    return r;
  }

  // ---------- la ville : tours + ziggourat ; u = effondrement 0..1
  function city(ctx, cx, base, w, u, seed = 1) {
    const blocks = [];
    for (let i = 0; i < 9; i++) {
      const bw = (70 + U.hash(seed, i) * 60), bh = 160 + U.hash(seed, i, 2) * 260, bx = cx - w / 2 + (i + 0.5) * w / 9;
      blocks.push({ x: bx, w: bw, h: bh, i });
    }
    // ziggourat au centre
    const steps = 5;
    for (let k = 0; k < steps; k++) {
      const sw = 360 - k * 62, sh = 70, y0 = base - k * sh;
      const fall = clamp(u * 1.4 - k * 0.12, 0, 1), dy = ease.inQuad(fall) * (120 + k * 70), rot = fall * (k % 2 ? 0.25 : -0.22);
      const c = [[-sw / 2, 0], [sw / 2, 0], [sw / 2, -sh], [-sw / 2, -sh]].map(([px, py]) => { const a = rot; return [cx + px * Math.cos(a) - py * Math.sin(a) + fall * (k % 2 ? 60 : -50), y0 + px * Math.sin(a) + py * Math.cos(a) + dy]; });
      G.poly(ctx, c, { fill: k % 2 ? '#C98F55' : '#B9773F', lw: 5, seed: seed + 50 + k, hatch: { color: 'rgba(90,50,20,0.28)', gap: 8 } });
    }
    for (const b of blocks) {
      if (Math.abs(b.x - cx) < 190) continue;
      const fall = clamp(u * 1.5 - U.hash(seed, b.i, 9) * 0.5, 0, 1), side = b.x < cx ? -1 : 1, a = side * fall * 1.2;
      const c = [[-b.w / 2, 0], [b.w / 2, 0], [b.w / 2, -b.h], [-b.w / 2, -b.h]].map(([px, py]) => [b.x + px * Math.cos(a) - py * Math.sin(a), base + px * Math.sin(a) + py * Math.cos(a) + fall * 40]);
      G.poly(ctx, c, { fill: b.i % 2 ? '#D8A86A' : '#C48A4E', lw: 5, seed: seed + b.i, hatch: { color: 'rgba(90,50,20,0.25)', gap: 8 } });
      if (fall < 0.2) for (let k = 0; k < 3; k++) G.rrect(ctx, b.x - 12, base - b.h + 30 + k * 50, 24, 28, 4, { fill: '#3A2A20', lw: 3, seed: b.i * 7 + k });
    }
    // poussiere
    if (u > 0.15) for (let i = 0; i < 9; i++) { const k = clamp(u * 1.3 - 0.15), px = cx + (U.hash(seed, i, 4) - 0.5) * w, r = 40 + k * 90 * U.hash(seed, i, 5); G.ellipse(ctx, px, base - 20 - k * 60 * U.hash(i, 3), r, r * 0.6, { fill: dark() ? 'rgba(220,220,210,0.25)' : 'rgba(150,130,110,0.45)', lw: 0, seed: i }); }
  }

  function sky(ctx, glow = 0) {
    if (dark()) { G.bg(ctx, '#2E4638'); return; }
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#27305C'); g.addColorStop(0.55, '#8A5A7A'); g.addColorStop(1, '#E8A86A');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    if (glow > 0) { const r = ctx.createRadialGradient(W / 2, H * 0.25, 0, W / 2, H * 0.25, H * 0.8); r.addColorStop(0, `rgba(255,240,190,${0.85 * glow})`); r.addColorStop(1, 'rgba(255,240,190,0)'); ctx.fillStyle = r; ctx.fillRect(0, 0, W, H); }
  }
  function ground(ctx) { G.poly(ctx, [[-40, GROUND], [W + 40, GROUND], [W + 40, H + 40], [-40, H + 40]], { fill: dark() ? 'rgba(242,238,227,0.08)' : '#7A5A3A', lw: 5, seed: 8, hatch: { color: 'rgba(40,20,10,0.25)', gap: 9 } }); }
  function ref(ctx) { G.text(ctx, 'Apocalypse 18, 1-8', W / 2, SAFE.y + SAFE.h - 10, { size: 34, fam: 'Patrick Hand', weight: 400, color: dark() ? '#F2EEE3' : '#FFF4DE', align: 'center' }); }
  function stamp(ctx, txt, x, y, size, t, t0, col = RED) {
    const k = clamp((t - t0) / 0.25); if (k <= 0) return;
    const sc = lerp(2.2, 1, ease.outBack(k, 2));
    ctx.save(); ctx.translate(x, y); ctx.rotate(-0.06); ctx.scale(sc, sc);
    G.text(ctx, txt, 0, 0, { size, fam: 'Bungee', weight: 400, color: col, align: 'center', stroke: dark() ? '#10180F' : '#FFF4DE', strokeW: 10 });
    ctx.restore();
  }

  function cap(ctx, c, t) {
    if (!dark()) { G.caption(ctx, c, t); return; }
    const k = clamp((t - c.t) / 0.3); if (k <= 0 || t >= c.end) return;
    const lines = c.text.split('\n');
    lines.forEach((l, i) => G.text(ctx, l, W / 2, c.y + 60 + i * c.size * 1.15, { size: c.size, fam: 'Caveat', weight: 700, align: 'center', color: '#F2EEE3', alpha: k }));
  }
  // ---------- scenes
  function sceneAnge(ctx, t) {
    const u = loc(t, 'ange'), d = ease.outCubic(clamp(u / 5));
    sky(ctx, d);
    G.rays(ctx, W / 2, H * 0.28, { n: 28, r0: 160, r1: 1300, color: GOLD, lw: 6, alpha: 0.55 * d, spin: u * 0.05 });
    ground(ctx); city(ctx, W / 2, GROUND, W * 1.1, 0, 3);
    // la terre s'illumine
    if (!dark()) { ctx.fillStyle = `rgba(255,236,170,${0.35 * d})`; ctx.fillRect(0, GROUND, W, H - GROUND); }
    angel(ctx, W / 2, lerp(-200, H * 0.47, d), 2.1, t, { armL: 0.9 + d, armR: 0.9 + d, mouth: 'flat', eyes: 'normal' });
    cap(ctx, { t: 1.0, end: 8, text: 'la terre fut éclairée de sa gloire', x: SAFE.x + 30, y: SAFE.y + 40, rot: -0.03, size: 58 }, t);
    ref(ctx);
  }
  function sceneTombee(ctx, t) {
    const u = loc(t, 'tombee'), fall = clamp((t - S.ev.chute) / 4);
    const sh = t > S.ev.chute ? 14 * Math.exp(-(t - S.ev.chute) * 3) : 0;
    ctx.save(); ctx.translate(U.noise1(t * 30, 1) * sh, U.noise1(t * 30, 2) * sh);
    sky(ctx, 0.25); ground(ctx); city(ctx, W / 2, GROUND, W * 1.1, fall, 3);
    angel(ctx, W * 0.5, SAFE.y + 560, 1.15, t, { armL: 2.7, armR: 2.7 });
    ctx.restore();
    stamp(ctx, 'ELLE EST', W / 2, SAFE.y + 690, 110, t, S.ev.cri);
    stamp(ctx, 'TOMBÉE !', W / 2, SAFE.y + 820, 130, t, S.ev.cri + 0.5);
    ref(ctx);
  }
  function sceneOiseaux(ctx, t) {
    const u = loc(t, 'oiseaux');
    sky(ctx, 0); ground(ctx); city(ctx, W / 2, GROUND, W * 1.1, 1, 3);
    // ombres (esprits impurs) : silhouettes sombres aux yeux jaunes
    for (let i = 0; i < 4; i++) { const x = W * (0.18 + i * 0.22), y = GROUND - 120 - (i % 2) * 70 + 8 * Math.sin(t * 2 + i); const a = clamp((u - 0.5 - i * 0.4) / 0.8); if (a <= 0) continue; ctx.save(); ctx.globalAlpha = a; G.shape(ctx, G.ellPts(x, y, 46, 70), { fill: dark() ? 'rgba(10,14,12,0.85)' : '#2A2028', lw: 3, seed: 60 + i }); for (const dd of [-1, 1]) G.ellipse(ctx, x + dd * 14, y - 20, 7, 9, { fill: '#F2D24B', lw: 0, seed: 70 + i + dd }); ctx.restore(); }
    // oiseaux noirs qui se posent
    for (let i = 0; i < 7; i++) { const k = clamp((u - i * 0.45) / 2.2), sx = W * (U.hash(i, 1) < 0.5 ? -0.1 : 1.1), ex = W * (0.1 + 0.8 * U.hash(i, 2)), ey = GROUND - 60 - 260 * U.hash(i, 3); Ch.bird(ctx, { x: lerp(sx, ex, ease.outCubic(k)), y: lerp(SAFE.y + 100, ey, ease.outCubic(k)), s: 1.2, color: '#1E1A22', t, flap: k < 1 ? 1 : 0.1, facing: sx < ex ? 1 : -1 }); }
    cap(ctx, { t: S.S.oiseaux[0] + 0.6, end: S.S.oiseaux[1], text: 'un repaire de démons\net d\'oiseaux impurs', x: SAFE.x + 30, y: SAFE.y + 40, rot: 0.03, size: 56 }, t);
    ref(ctx);
  }
  function sceneSortez(ctx, t) {
    const u = loc(t, 'sortez');
    sky(ctx, 0.15); G.rays(ctx, W / 2, -80, { n: 14, r0: 60, r1: 900, color: GOLD, lw: 5, alpha: 0.4 });
    ground(ctx); city(ctx, W * 0.5, GROUND - 120, W * 1.1, 0.35, 5);
    // le peuple sort en courant vers nous
    for (let i = 0; i < 9; i++) {
      const k = clamp((u - i * 0.25) / 5), row = i % 3;
      const x = W * (0.25 + 0.5 * U.hash(i, 7)) + (i % 2 ? 1 : -1) * k * 180, y = lerp(GROUND - 110, GROUND + 150 + row * 50, ease.inOutQuad(k)), s = lerp(0.45, 1.05 + row * 0.1, k);
      if (k <= 0) continue;
      stick(ctx, x, y, s, { run: t * 11 + i, armL: 1.1 + 0.6 * Math.sin(t * 11 + i), armR: 1.1 - 0.6 * Math.sin(t * 11 + i), lean: 18, eyes: 'wide', mouth: 'open', seed: 100 + i, robe: [RED, TEAL, '#E0703E', '#6A5AA0'][i % 4] });
    }
    if (dark()) cap(ctx, { t: S.S.sortez[0] + 0.4, end: S.S.sortez[1], text: '« Sortez du milieu d\'elle,\nmon peuple ! »', y: SAFE.y + 40, size: 64 }, t);
    else G.bubble(ctx, '« Sortez du milieu d\'elle,\nmon peuple ! »', W * 0.5, SAFE.y + 120, W * 0.62, SAFE.y + 20, t, S.S.sortez[0] + 0.4, S.S.sortez[1], { size: 54 });
  }
  function sceneClaude(ctx, t) {
    const u = loc(t, 'claude');
    if (dark()) G.bg(ctx, '#2E4638'); else { ctx.fillStyle = '#F4EDE0'; ctx.fillRect(0, 0, W, H); }
    if (dark()) G.rrect(ctx, SAFE.x + 20, SAFE.y + 40, SAFE.w - 40, 330, 24, { fill: null, lw: 5, seed: 11 }); else G.tornPaper(ctx, SAFE.x + 20, SAFE.y + 40, SAFE.w - 40, 330, { fill: '#FFFDF6', seed: 11 });
    G.text(ctx, 'On remonte la Bible,', SAFE.x + SAFE.w / 2, SAFE.y + 150, { size: 64, fam: 'Caveat', weight: 700, align: 'center', color: dark() ? '#F2EEE3' : '#2A2320' });
    G.text(ctx, 'scène par scène', SAFE.x + SAFE.w / 2, SAFE.y + 240, { size: 76, fam: 'Caveat', weight: 700, align: 'center', color: '#D97757' });
    // pile de « pages » : episodes precedents
    const eps = [['50', 'Tout perdu en une seule heure'], ['51', 'Elle est tombée, Babylone la grande']];
    eps.forEach(([n, ttl], i) => { const y = SAFE.y + 470 + i * 170, a = clamp((u - 0.6 - i * 0.8) / 0.5); if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; G.rrect(ctx, SAFE.x + 40, y, SAFE.w - 80, 130, 18, { fill: i ? '#F2B84B' : (dark() ? 'rgba(242,238,227,0.12)' : '#E8DFCC'), lw: 5, seed: 20 + i }); G.text(ctx, `Ép. ${n}`, SAFE.x + 80, y + 82, { size: 46, fam: 'Bungee', weight: 400, color: i ? '#2A2320' : undefined }); G.text(ctx, ttl, SAFE.x + 245, y + 80, { size: 40, fam: 'Patrick Hand', weight: 400, color: i ? '#2A2320' : undefined }); ctx.restore(); });
    G.text(ctx, '◀ une scène avant', SAFE.x + SAFE.w / 2, SAFE.y + 440, { size: 40, fam: 'Patrick Hand', weight: 400, align: 'center', alpha: clamp((u - 1.5) / 0.5) });
    Ch.claude(ctx, { x: W * 0.42, y: SAFE.y + SAFE.h - 40, s: 1.6, eyes: 'happy', mouth: 'smile', armL: 0.4, armR: 1.4 + 0.2 * Math.sin(t * 6), blush: 0.5 });
  }
  function sceneCover(ctx, t) {
    sky(ctx, 0.7);
    G.rays(ctx, W / 2, SAFE.y + 260, { n: 30, r0: 150, r1: 1300, color: GOLD, lw: 6, alpha: 0.6 });
    ground(ctx); city(ctx, W / 2, GROUND, W * 1.1, 0.45, 3);
    angel(ctx, W / 2, SAFE.y + 620, 1.55, 2.0, { armL: 2.7, armR: 2.7 });
    // bandeau titre
    const y0 = SAFE.y + SAFE.h - 470;
    G.tornPaper(ctx, SAFE.x + 10, y0, SAFE.w - 20, 440, { fill: dark() ? 'rgba(16,24,18,0.92)' : '#FFF6E6', seed: 4 });
    G.rrect(ctx, W / 2 - 170, y0 + 40, 340, 80, 40, { fill: '#D97757', lw: 4, seed: 6 });
    G.text(ctx, 'ÉPISODE 51', W / 2, y0 + 97, { size: 46, fam: 'Bungee', weight: 400, color: '#FFFFFF', align: 'center' });
    G.text(ctx, 'ELLE EST TOMBÉE,', W / 2, y0 + 230, { size: 72, fam: 'Bungee', weight: 400, color: RED, align: 'center' });
    G.text(ctx, 'BABYLONE', W / 2, y0 + 320, { size: 86, fam: 'Bungee', weight: 400, align: 'center' });
    G.text(ctx, 'LA GRANDE', W / 2, y0 + 405, { size: 86, fam: 'Bungee', weight: 400, align: 'center' });
  }

  Studio.film({
    draw(ctx, t) {
      if (inS(t, 'ange')) sceneAnge(ctx, t);
      else if (inS(t, 'tombee')) sceneTombee(ctx, t);
      else if (inS(t, 'oiseaux')) sceneOiseaux(ctx, t);
      else if (inS(t, 'sortez')) sceneSortez(ctx, t);
      else if (inS(t, 'claude')) sceneClaude(ctx, t);
      else sceneCover(ctx, t);
    },
    post: { paper: 0.5, vignette: 0.3, grain: 0.05 },
    fadeOut: 0,
  });
})();
