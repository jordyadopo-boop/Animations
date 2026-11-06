// Pub Le Glaceur, plein cadre 16:9 (sortie 1920x1080, dessin en repère 1600x900) : typographie animée, photos produits, vraie navigation sur le site.
// Tout est calé sur timeline.json (voix off mot à mot). draw(t) est déterministe.

export const SW = 1600, SH = 900;
const GOLD = '#8ecfff', GOLD2 = '#4d9bff', CLAIR = '#bfe4ff', BLANC = '#f3faff', BRAISE = '#2a7deb', NOIR = '#040e24', WA = '#25d366', CHAUD = '#ff7a2a';
const METAL = ['#FFFFFF', '#F3FAFF', '#BFE4FF', '#8ECFFF', '#FFFFFF', '#E3F3FF', '#8ECFFF', '#4D9BFF', '#2A7DEB'];

// ---------- outils ----------
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lin = (t, a, b) => clamp((t - a) / (b - a));
export const eo = (x) => 1 - Math.pow(1 - clamp(x), 3);
const eio = (x) => (x = clamp(x), x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const back = (x) => { x = clamp(x); const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const rnd = (i) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const PHI = (1 + Math.sqrt(5)) / 2;

export function createScreen(TL, IMG) {
  const cv = document.getElementById('c'); cv.width = 1920; cv.height = 1080;
  const ctx = cv.getContext('2d');
  const scenes = Object.fromEntries(TL.scenes.map((s) => [s.id, s]));

  // ---------- primitives ----------
  function font(px, w = 600, fam = 'Barlow Condensed') { ctx.font = `${w} ${px}px '${fam}', 'Noto Sans', 'Noto Sans CJK SC', 'Noto Sans Arabic', 'Noto Sans Devanagari', sans-serif`; }
  function metal(y0, y1) { const g = ctx.createLinearGradient(0, y0, 0, y1); METAL.forEach((c, i) => g.addColorStop(i / (METAL.length - 1), c)); return g; }
  // texte : opts {size, w, fam, color, glow, align, base, ls, alpha, metal}
  function text(s, x, y, o = {}) {
    const size = o.size || 80; const fam = o.fam || 'Barlow Condensed'; font(size, fam === 'Barlow Condensed' ? 800 : (o.w || 600), fam);
    ctx.save(); ctx.globalAlpha *= o.alpha ?? 1; ctx.textAlign = o.align || 'center'; ctx.textBaseline = o.base || 'middle';
    if (o.ls) ctx.letterSpacing = `${o.ls}px`;
    const fill = o.metal ? metal(y - size * 0.55, y + size * 0.45) : (o.color || BLANC);
    if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = o.blur ?? size * 0.45; ctx.fillStyle = fill; ctx.fillText(s, x, y); ctx.shadowBlur = (o.blur ?? size * 0.45) * 0.3; ctx.fillText(s, x, y); ctx.shadowBlur = 0; }
    ctx.fillStyle = fill; ctx.fillText(s, x, y);
    const w = ctx.measureText(s).width; ctx.restore(); return w;
  }
  function measure(s, size, w = 600, fam = 'Barlow Condensed', ls = 0) { font(size, fam === 'Barlow Condensed' ? 800 : w, fam); ctx.save(); if (ls) ctx.letterSpacing = `${ls}px`; const m = ctx.measureText(s).width; ctx.restore(); return m; }
  function rrect(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
  function glowStroke(color, width, blur) { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.shadowColor = color; ctx.shadowBlur = blur; ctx.stroke(); ctx.shadowBlur = 0; ctx.lineWidth = width * 0.45; ctx.strokeStyle = '#f3faff'; ctx.globalAlpha *= 0.8; ctx.stroke(); ctx.restore(); }
  // pastille (comme « THE PROMPT ») : texte sur fond braise
  function chip(s, x, y, o = {}) {
    const size = o.size || 26; const pad = size * 0.5; const w = measure(s, size, 600, 'Barlow', o.ls ?? 2) + pad * 2, h = size * 1.6;
    const xx = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
    ctx.save(); ctx.globalAlpha *= o.alpha ?? 1;
    rrect(xx, y - h / 2, w * (o.k ?? 1), h, 6); ctx.fillStyle = o.bg || BRAISE; ctx.fill();
    ctx.clip(); text(s, xx + pad, y + 1, { size, w: 600, fam: 'Barlow', color: o.color || '#ffffff', align: 'left', ls: o.ls ?? 2 });
    ctx.restore(); return w;
  }
  function panel(x, y, w, h, o = {}) {
    ctx.save(); ctx.globalAlpha *= o.alpha ?? 1;
    rrect(x, y, w, h, o.r ?? 14); ctx.fillStyle = o.fill || 'rgba(6,22,52,.88)'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = o.stroke || 'rgba(142,207,255,.55)'; ctx.shadowColor = 'rgba(77,155,255,.6)'; ctx.shadowBlur = o.glow ?? 18; ctx.stroke();
    ctx.restore();
  }
  function cover(img, x, y, w, h, zoom = 1, ox = 0.5, oy = 0.5) {
    if (!img || !img.width) return;
    const s = Math.max(w / img.width, h / img.height) * zoom, iw = img.width * s, ih = img.height * s;
    ctx.drawImage(img, x + (w - iw) * ox, y + (h - ih) * oy, iw, ih);
  }
  function node(x, y, r, color = GOLD) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.save(); ctx.fillStyle = NOIR; ctx.fill(); ctx.restore(); glowStroke(color, r * 0.55, r * 2.5); }

  // ---------- le bonhomme (traits de craie braise, tête en anneau, bâton φ) ----------
  // p : progression du dessin 0..1 ; pose : 'stand' | 'walk' (ph = phase) | 'run'
  function stickman(x, y, h, p = 1, pose = 'stand', ph = 0, alpha = 1) {
    const u = h / 10; ctx.save(); ctx.globalAlpha *= alpha; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const sw = Math.sin(ph) * (pose === 'stand' ? 0.05 : pose === 'run' ? 0.9 : 0.5);
    const hip = [x, y - 4.6 * u], neck = [x + (pose === 'run' ? 0.6 * u : 0), y - 7.6 * u], head = [neck[0] + 0.15 * u, neck[1] - 1.25 * u];
    const leg = (a) => [[hip[0] + Math.sin(a) * 2.2 * u, hip[1] + Math.cos(a) * 2.3 * u], [hip[0] + Math.sin(a) * 3.1 * u + (a > 0 ? 0 : 0.3 * u), y]];
    const L1 = leg(0.32 + sw), L2 = leg(-0.32 - sw);
    const segs = [
      [neck, hip], [hip, L1[0], L1[1]], [hip, L2[0], L2[1]],
      [[neck[0], neck[1] + 0.6 * u], [neck[0] + 1.6 * u, neck[1] + 2.2 * u], [x + 2.9 * u, neck[1] + 1.3 * u]],
      [[neck[0], neck[1] + 0.6 * u], [neck[0] - 1.5 * u, neck[1] + 2.0 * u - sw * u], [neck[0] - 2.3 * u, neck[1] + 3.6 * u - sw * u]],
    ];
    const total = segs.length + 2; let k = p * total;
    ctx.beginPath();
    for (const s of segs) { if (k <= 0) break; const f = clamp(k); ctx.moveTo(...s[0]); for (let i = 1; i < s.length; i++) { const fi = clamp(f * (s.length - 1) - (i - 1)); if (fi <= 0) break; ctx.lineTo(s[i - 1][0] + (s[i][0] - s[i - 1][0]) * fi, s[i - 1][1] + (s[i][1] - s[i - 1][1]) * fi); } k -= 1; }
    glowStroke(BRAISE, 0.55 * u, 2.2 * u);
    if (k > 0) { ctx.beginPath(); ctx.arc(head[0], head[1], 1.15 * u, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamp(k)); glowStroke(BRAISE, 0.55 * u, 2.2 * u); k -= 1; }
    if (k > 0) { // bâton φ doré
      const sx = x + 2.9 * u, f = clamp(k); ctx.beginPath(); ctx.moveTo(sx, y); ctx.lineTo(sx, y - (y - (neck[1] - 2.6 * u)) * f); glowStroke(GOLD, 0.32 * u, 1.6 * u);
      if (f > 0.9) { ctx.beginPath(); ctx.ellipse(sx, neck[1] - 1.4 * u, 0.55 * u, 0.85 * u, 0, 0, Math.PI * 2); glowStroke(GOLD, 0.28 * u, 1.4 * u); node(sx, y, 0.32 * u); node(sx, neck[1] - 2.6 * u, 0.32 * u); }
    }
    ctx.restore();
  }

  // ---------- polyèdres en fil de fer ----------
  const POLY = (() => {
    const ico = [[-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0], [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI], [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1]];
    const cube = []; for (const a of [-1, 1]) for (const b of [-1, 1]) for (const c of [-1, 1]) cube.push([a, b, c]);
    const tet = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]];
    const oct = [[1.4, 0, 0], [-1.4, 0, 0], [0, 1.4, 0], [0, -1.4, 0], [0, 0, 1.4], [0, 0, -1.4]];
    const edges = (v) => { let m = Infinity; const d = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]); for (let i = 0; i < v.length; i++) for (let j = i + 1; j < v.length; j++) m = Math.min(m, d(v[i], v[j])); const e = []; for (let i = 0; i < v.length; i++) for (let j = i + 1; j < v.length; j++) if (d(v[i], v[j]) < m * 1.01) e.push([i, j]); return e; };
    const norm = (v) => { const r = Math.max(...v.map((p) => Math.hypot(...p))); return v.map((p) => p.map((c) => c / r)); };
    return Object.fromEntries(Object.entries({ ico, cube, tet, oct }).map(([k, v]) => [k, { v: norm(v), e: edges(v) }]));
  })();
  function poly(kind, x, y, r, rx, ry, color = GOLD, alpha = 1, width = 3) {
    const P = POLY[kind]; const cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry);
    const pts = P.v.map(([a, b, c]) => { const y1 = b * cx - c * sx, z1 = b * sx + c * cx; const x2 = a * cy + z1 * sy, z2 = -a * sy + z1 * cy; const s = 3 / (3 + z2 * 0.6); return [x + x2 * r * s, y + y1 * r * s]; });
    ctx.save(); ctx.globalAlpha *= alpha; ctx.beginPath(); for (const [i, j] of P.e) { ctx.moveTo(...pts[i]); ctx.lineTo(...pts[j]); }
    ctx.lineCap = 'round'; glowStroke(color, width, 16); ctx.restore();
  }
  function dust(t, n = 60, alpha = 0.6, seed = 0) {
    ctx.save();
    for (let i = 0; i < n; i++) { const k = i + seed * 100; const x = (rnd(k) * SW + t * (8 + rnd(k + 1) * 20)) % SW, y = (rnd(k + 2) * SH - t * (6 + rnd(k + 3) * 18) + SH * 10) % SH; const a = alpha * (0.3 + 0.7 * Math.abs(Math.sin(t * (0.5 + rnd(k + 4)) + k))); ctx.globalAlpha = a; ctx.fillStyle = rnd(k + 5) > 0.7 ? BRAISE : CLAIR; ctx.beginPath(); ctx.arc(x, y, 1 + rnd(k + 6) * 2.2, 0, 7); ctx.fill(); }
    ctx.restore();
  }

  // ---------- chrome de l'interface (petits détails comme dans la référence) ----------
  function chrome(t, line) {
    ctx.save(); ctx.globalAlpha = 0.55; ctx.strokeStyle = 'rgba(191,228,255,.35)'; ctx.lineWidth = 1.5;
    for (const [x, y, dx, dy] of [[30, 30, 1, 1], [SW - 30, 30, -1, 1], [30, SH - 30, 1, -1], [SW - 30, SH - 30, -1, -1]]) { ctx.beginPath(); ctx.moveTo(x, y + dy * 22); ctx.lineTo(x, y); ctx.lineTo(x + dx * 22, y); ctx.stroke(); }
    text('LE GLACEUR · ABIDJAN', SW - 60, 46, { size: 15, fam: 'Barlow', w: 500, color: CLAIR, align: 'right', ls: 4 });
    const s = Math.floor(t), tc = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}:${String(Math.floor((t % 1) * 30)).padStart(2, '0')}`;
    text(tc, SW - 60, SH - 44, { size: 15, fam: 'Barlow', w: 500, color: CLAIR, align: 'right', ls: 3 });
    ctx.fillStyle = BRAISE; ctx.globalAlpha = 0.5 + 0.5 * (Math.sin(t * 6) > 0); ctx.beginPath(); ctx.arc(60, SH - 49, 5, 0, 7); ctx.fill(); ctx.globalAlpha = 0.55;
    text('REC', 74, SH - 44, { size: 15, fam: 'Barlow', w: 500, color: CLAIR, align: 'left', ls: 3 });
    ctx.restore();
    // la phrase en cours, en petit, avec le mot dit surligné (comme la référence)
    if (line) {
      let x = 60; const y = 54; ctx.save(); ctx.globalAlpha = 0.9;
      for (const w of line.words) {
        const ww = measure(w.w, 20, 500, 'Barlow') + 7; const on = t >= w.s && t < w.e + 0.08;
        if (on) { rrect(x - 3, y - 14, ww - 1, 28, 4); ctx.fillStyle = BRAISE; ctx.fill(); }
        text(w.w, x, y + 1, { size: 20, fam: 'Barlow', w: 500, color: on ? '#ffffff' : '#d9c9a8', align: 'left' }); x += ww; if (x > 900) break;
      }
      ctx.restore();
    }
  }
  function bg(a = 1) {
    ctx.fillStyle = NOIR; ctx.fillRect(0, 0, SW, SH);
    const g = ctx.createRadialGradient(SW / 2, SH * 0.55, 50, SW / 2, SH * 0.55, SW * 0.7); g.addColorStop(0, `rgba(23,60,122,${0.55 * a})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, SW, SH);
  }
  // grille de points (sol d'atelier)
  function grid(t, a = 0.25) { ctx.save(); ctx.fillStyle = `rgba(191,228,255,${a})`; for (let x = 40; x < SW; x += 40) for (let y = 40; y < SH; y += 40) ctx.fillRect(x, y, 1.6, 1.6); ctx.restore(); }

  // ---------- accès temps ----------
  const at = (sc, i) => sc.lines[i].start - sc.start;               // début de la ligne i (local)
  const wd = (sc, i, j) => sc.lines[i].words[Math.min(j, sc.lines[i].words.length - 1)].s - sc.start; // mot j de la ligne i
  const lineEnd = (sc, i) => sc.lines[i].end - sc.start;
  function curLine(sc, t) { let L = null; for (const l of sc.lines) if (t >= l.start - 0.05) L = l; return L; }
  const frameOf = (name, lt) => IMG.frame(name, lt);

  // gameplay plein écran, avec léger zoom et cadre
  function clip(name, lt, o = {}) {
    const img = frameOf(name, lt);
    ctx.save(); ctx.globalAlpha *= o.alpha ?? 1;
    const z = (o.zoom ?? 1.04) + lt * (o.push ?? 0.004);
    cover(img, 0, 0, SW, SH, z);
    // fondu sombre sur les bords pour coller à l'univers
    const g = ctx.createLinearGradient(0, 0, 0, SH); g.addColorStop(0, 'rgba(4,14,36,.55)'); g.addColorStop(0.18, 'rgba(4,14,36,0)'); g.addColorStop(0.75, 'rgba(4,14,36,0)'); g.addColorStop(1, 'rgba(4,14,36,.75)'); ctx.fillStyle = g; ctx.fillRect(0, 0, SW, SH);
    ctx.restore();
  }

  // ---------- effets « studio » ----------
  // texte qui se décode (caractères aléatoires puis le vrai texte)
  const GLYPHS = 'ΦΩΣΔΛΞΨ#%&@0123456789ABCDEFGHKMNPRSTVXZ';
  function scramble(s, k, t) { const n = Math.floor(s.length * clamp(k)); let o = s.slice(0, n); for (let i = n; i < s.length; i++) o += s[i] === ' ' ? ' ' : GLYPHS[Math.floor(rnd(i * 7 + Math.floor(t * 30)) * GLYPHS.length)]; return o; }
  // titre : lettres qui montent une à une avec dépassement, puis un reflet qui balaie
  function staggerTitle(s, x, y, size, lt) {
    if (lt <= 0) return; let cx = x;
    for (let i = 0; i < s.length; i++) {
      const ch = s[i], w = measure(ch, size, 600, 'Barlow Condensed'); const k = back(lin(lt, i * 0.035, i * 0.035 + 0.32));
      if (k > 0) { ctx.save(); ctx.translate(cx + w / 2, y + (1 - k) * 60); ctx.rotate((1 - clamp(k)) * 0.25); text(ch, 0, 0, { size, w: 600, metal: true, glow: 'rgba(77,155,255,.55)', blur: size * 0.14, alpha: clamp(k * 1.4) }); ctx.restore(); }
      cx += w;
    }
    const sw = lin(lt, 0.55, 1.15); if (sw > 0 && sw < 1) shine(x, y - size * 0.6, cx - x, size * 1.1, sw, 0.55);
  }
  // reflet diagonal qui balaie une zone
  function shine(x, y, w, h, k, a = 0.45) {
    if (k <= 0 || k >= 1) return; ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.globalCompositeOperation = 'lighter';
    const cx = x - 80 + (w + 160) * k; const g = ctx.createLinearGradient(cx - 50, 0, cx + 50, 0); g.addColorStop(0, 'rgba(225,242,255,0)'); g.addColorStop(0.5, `rgba(225,242,255,${a})`); g.addColorStop(1, 'rgba(225,242,255,0)');
    ctx.fillStyle = g; ctx.transform(1, 0, -0.3, 1, 0, 0); ctx.fillRect(cx - 60 + (y + h) * 0.3 - h * 0.3, y, 120, h); ctx.restore();
  }
  // gerbe d'étincelles (0..0.6 s)
  function sparks(x, y, t, seed) {
    if (t < 0 || t > 0.6) return; ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 14; i++) { const a = -1.2 + rnd(seed * 31 + i) * 2.4, v = 260 + rnd(seed * 17 + i) * 380, px = x + Math.cos(a) * v * t, py = y + Math.sin(a) * v * t + 300 * t * t; ctx.globalAlpha = 1 - t / 0.6; ctx.fillStyle = i % 3 ? GOLD : '#fff1c2'; ctx.beginPath(); ctx.arc(px, py, 2.6 * (1 - t / 0.6) + 0.8, 0, 7); ctx.fill(); }
    ctx.restore();
  }
  // coins de visée qui se verrouillent sur l'image
  function hudCorners(lt, dur) {
    const k = eo(lin(lt, 0.1, 0.5)), m = 24 + (1 - k) * 70, L = 46; ctx.save(); ctx.globalAlpha = 0.85 * k * (1 - lin(lt, dur - 0.25, dur)); ctx.strokeStyle = GOLD; ctx.lineWidth = 3; ctx.shadowColor = GOLD; ctx.shadowBlur = 12;
    for (const [x, y, dx, dy] of [[m, m, 1, 1], [SW - m, m, -1, 1], [m, SH - m, 1, -1], [SW - m, SH - m, -1, -1]]) { ctx.beginPath(); ctx.moveTo(x, y + dy * L); ctx.lineTo(x, y); ctx.lineTo(x + dx * L, y); ctx.stroke(); }
    // ligne de balayage horizontale (scan)
    const sy = SH * lin(lt, 0.1, 0.9); if (sy > 0 && sy < SH) { ctx.globalAlpha = 0.25 * (1 - lin(lt, 0.7, 0.9)); ctx.fillStyle = CLAIR; ctx.fillRect(0, sy, SW, 2); }
    ctx.restore();
  }
  // notification « succès » comme dans les jeux
  function toast(sc, lt, dur) {
    const kin = back(lin(lt, 0.55, 0.95)), kout = eo(lin(lt, dur - 0.55, dur - 0.2)); const k = clamp(kin) * (1 - kout); if (k <= 0) return;
    const w = 430, h = 96, x = SW - w - 50 + (1 - clamp(kin)) * 480 + kout * 480, y = 70;
    ctx.save(); rrect(x, y, w, h, 14); ctx.fillStyle = 'rgba(6,22,52,.92)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(142,207,255,.7)'; ctx.shadowColor = BRAISE; ctx.shadowBlur = 24; ctx.stroke(); ctx.shadowBlur = 0;
    // icône : petit polyèdre qui tourne dans un cercle
    ctx.beginPath(); ctx.arc(x + 48, y + h / 2, 30, 0, 7); ctx.fillStyle = 'rgba(42,125,235,.18)'; ctx.fill(); ctx.restore();
    poly('ico', x + 48, y + h / 2, 20, lt * 2, lt * 2.6, GOLD, 1, 2);
    text('NOUVEAU PRODUIT', x + 92, y + 30, { size: 17, fam: 'Barlow', w: 600, color: BRAISE, align: 'left', ls: 4 });
    text(`${sc.label} · ${String(sc.num).padStart(2, '0')}/50`, x + 92, y + 58, { size: 26, fam: 'Barlow', w: 600, color: '#fff', align: 'left' });
    const pb = eo(lin(lt, 0.8, 1.6)); rrect(x + 92, y + 76, w - 120, 6, 3); ctx.fillStyle = 'rgba(191,228,255,.15)'; ctx.fill(); rrect(x + 92, y + 76, (w - 120) * (sc.num - 1 + pb) / 50, 6, 3); ctx.fillStyle = GOLD; ctx.fill();
    shine(x, y, w, h, lin(lt, 0.9, 1.5), 0.3);
  }


  // ---------- effets « glace » ----------
  // flocons / cristaux qui tombent doucement
  function frost(t, n = 70, a = 0.7, seed = 0) {
    ctx.save();
    for (let i = 0; i < n; i++) { const k = i + seed * 100; const x = (rnd(k) * SW + Math.sin(t * 0.6 + k) * 18 + SW * 10) % SW, y = (rnd(k + 2) * SH + t * (14 + rnd(k + 3) * 30)) % SH; ctx.globalAlpha = a * (0.3 + 0.7 * rnd(k + 4)); ctx.fillStyle = rnd(k + 5) > 0.8 ? GOLD : '#ffffff'; ctx.beginPath(); ctx.arc(x, y, 0.8 + rnd(k + 6) * 2.4, 0, 7); ctx.fill(); }
    ctx.restore();
  }
  // givre qui envahit les bords (k : 0..1)
  function frostEdges(k, seed = 1) {
    if (k <= 0) return; ctx.save();
    const g = ctx.createRadialGradient(SW / 2, SH / 2, SW * (0.62 - 0.32 * k), SW / 2, SH / 2, SW * 0.78); g.addColorStop(0, 'rgba(225,242,255,0)'); g.addColorStop(1, `rgba(225,242,255,${0.75 * k})`); ctx.fillStyle = g; ctx.fillRect(0, 0, SW, SH);
    // cristaux en étoile sur les bords
    ctx.strokeStyle = `rgba(255,255,255,${0.55 * k})`; ctx.lineWidth = 1.4;
    for (let i = 0; i < 60; i++) { const side = i % 4; const u = rnd(i * 3 + seed); const d = rnd(i * 5 + seed) * 160 * k; const x = side === 0 ? d : side === 1 ? SW - d : u * SW, y = side === 2 ? d : side === 3 ? SH - d : u * SH; const r = (6 + rnd(i * 7) * 22) * k; for (let j = 0; j < 6; j++) { const a = j * Math.PI / 3 + i; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); ctx.stroke(); } }
    ctx.restore();
  }
  // fissure de glace qui part d'un point (k : 0..1)
  function crack(x, y, k, seed = 3, color = 'rgba(232,246,255,') {
    if (k <= 0) return; ctx.save(); ctx.lineCap = 'round';
    for (let b = 0; b < 9; b++) { let px = x, py = y, a = b / 9 * Math.PI * 2 + rnd(b + seed); const L = (140 + rnd(b * 9 + seed) * 380) * eo(k); ctx.beginPath(); ctx.moveTo(px, py); for (let s = 0; s < 8; s++) { a += (rnd(b * 31 + s + seed) - 0.5) * 0.9; px += Math.cos(a) * L / 8; py += Math.sin(a) * L / 8; ctx.lineTo(px, py); } ctx.strokeStyle = color + (0.9 * (1 - lin(k, 0.7, 1)) + 0.1) + ')'; ctx.lineWidth = 2.2; ctx.shadowColor = '#8ecfff'; ctx.shadowBlur = 14; ctx.stroke(); }
    ctx.restore();
  }
  // brume (carboglace)
  function fog(t, a = 0.5) {
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 14; i++) { const x = (rnd(i) * SW * 1.4 - 200 + t * (20 + rnd(i + 1) * 40)) % (SW + 400) - 200, y = SH * (0.45 + rnd(i + 2) * 0.6) - t * 6, r = 220 + rnd(i + 3) * 260; const g = ctx.createRadialGradient(x, y, 10, x, y, r); g.addColorStop(0, `rgba(235,245,255,${a * 0.35})`); g.addColorStop(1, 'rgba(235,245,255,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
    ctx.restore();
  }
  function photo(name, x, y, w, h, z = 1, ox = 0.5, oy = 0.5, r = 0) { const im = IMG.get(`assets/img/${name}.jpg`); if (r) { ctx.save(); rrect(x, y, w, h, r); ctx.clip(); cover(im, x, y, w, h, z, ox, oy); ctx.restore(); } else cover(im, x, y, w, h, z, ox, oy); }
  function svgLogo(file, cx, cy, w, alpha = 1) { const im = IMG.get(`assets/brand/${file}`); if (!im.width) return; const h = w * im.height / im.width; ctx.save(); ctx.globalAlpha *= alpha; ctx.drawImage(im, cx - w / 2, cy - h / 2, w, h); ctx.restore(); }
  function glass(x, y, w, h, o = {}) { ctx.save(); ctx.globalAlpha *= o.alpha ?? 1; rrect(x, y, w, h, o.r ?? 18); const g = ctx.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, 'rgba(191,228,255,.16)'); g.addColorStop(1, 'rgba(77,155,255,.05)'); ctx.fillStyle = o.fill || 'rgba(6,22,52,.72)'; ctx.fill(); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 1.6; ctx.strokeStyle = 'rgba(191,228,255,.35)'; ctx.shadowColor = 'rgba(77,155,255,.5)'; ctx.shadowBlur = o.glow ?? 22; ctx.stroke(); ctx.restore(); }
  const PRODS = ['glacons', 'grain', 'pilee', 'carboglace', 'gobelet', 'barres'];

  // ======================= SCÈNES =======================
  const DRAW = {
    hook(sc, lt) {
      bg(); grid(lt, 0.08); frost(lt, 50, 0.5);
      const a1 = at(sc, 1), a2 = at(sc, 2);
      if (lt < a1 - 0.05) { const k = eo(lin(lt, at(sc, 0) - 0.1, at(sc, 0) + 0.25)); text('ATTENDEZ.', SW / 2, SH / 2, { size: 230, color: '#fff', glow: 'rgba(191,228,255,.6)', alpha: k, ls: 12 * (1 - k) + 4 }); }
      else {
        const k = eo(lin(lt, a1 - 0.05, a1 + 0.3)); text('VOTRE BOISSON EST', SW / 2, SH / 2 - 190, { size: 70, color: '#fff', alpha: k, ls: 6 });
        const kf = back(lin(lt, wd(sc, 1, 3) - 0.1, wd(sc, 1, 3) + 0.3)); ctx.save(); ctx.translate(SW / 2, SH / 2 - 40); ctx.scale(0.7 + 0.3 * kf, 0.7 + 0.3 * kf); text('FRAÎCHE…', 0, 0, { size: 200, metal: true, glow: 'rgba(77,155,255,.85)', alpha: clamp(kf * 2) }); ctx.restore();
        if (lt > a2 - 0.05) { const kt = back(lin(lt, a2, a2 + 0.35)); ctx.save(); ctx.translate(SW / 2, SH / 2 + 160); ctx.rotate(-0.04); ctx.scale(kt, kt); text('OU JUSTE TIÈDE ?', 0, 0, { size: 110, color: CHAUD, glow: 'rgba(255,122,42,.8)' }); ctx.restore(); }
      }
    },
    heat(sc, lt) {
      const a1 = at(sc, 1), dur = sc.end - sc.start;
      // Abidjan sous la chaleur : image chaude qui ondule, puis le givre l'envahit
      const cool = eo(lin(lt, a1, a1 + 1.2));
      const im = IMG.get('assets/img/abidjan.jpg');
      for (let y = 0; y < SH; y += 12) { const dx = Math.sin(y * 0.04 + lt * 7) * 5 * (1 - cool); ctx.save(); ctx.beginPath(); ctx.rect(0, y, SW, 12); ctx.clip(); cover(im, dx, 0, SW, SH, 1.08 + lt * 0.01); ctx.restore(); }
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = `rgba(255,${Math.round(150 + 105 * cool)},${Math.round(80 + 175 * cool)},1)`; ctx.fillRect(0, 0, SW, SH); ctx.restore();
      ctx.fillStyle = `rgba(4,14,36,${0.35 + 0.2 * cool})`; ctx.fillRect(0, 0, SW, SH);
      const k = eo(lin(lt, 0.05, 0.4));
      chip('ABIDJAN', 60, 110, { alpha: k, bg: CHAUD });
      if (lt < a1 - 0.05) { text('LA CHALEUR', 60, 380, { size: 150, color: '#fff', align: 'left', alpha: k }); text('NE PREND JAMAIS DE PAUSE.', 64, 500, { size: 80, color: CHAUD, align: 'left', alpha: eo(lin(lt, wd(sc, 0, 4) - 0.1, wd(sc, 0, 4) + 0.3)), glow: 'rgba(255,122,42,.6)' }); }
      else { const kk = eo(lin(lt, a1 - 0.05, a1 + 0.3)); text('ALORS VOTRE GLACE', 60, 380, { size: 130, color: '#fff', align: 'left', alpha: kk }); text('NON PLUS.', 64, 520, { size: 170, metal: true, align: 'left', glow: 'rgba(77,155,255,.85)', alpha: eo(lin(lt, wd(sc, 1, 3) - 0.1, wd(sc, 1, 3) + 0.3)) }); }
      frostEdges(cool);
      ctx.fillStyle = `rgba(4,14,36,${lin(lt, dur - 0.3, dur)})`; ctx.fillRect(0, 0, SW, SH);
    },
    logo(sc, lt) {
      bg(1.3); frost(lt, 90, 0.7, 2); const a0 = at(sc, 0), dur = sc.end - sc.start;
      const k = eo(lin(lt, 0.1, a0 + 0.5)); crack(SW / 2, SH / 2 - 60, lin(lt, 0.0, 0.9));
      const g = ctx.createRadialGradient(SW / 2, SH / 2 - 60, 10, SW / 2, SH / 2 - 60, 560); g.addColorStop(0, `rgba(77,155,255,${0.35 * k})`); g.addColorStop(1, 'rgba(77,155,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, SW, SH);
      ctx.save(); ctx.translate(SW / 2, SH / 2 - 60); const z = 0.85 + 0.15 * back(lin(lt, 0.1, 0.7)) + lt * 0.006; ctx.scale(z, z); svgLogo('logo-full-white.svg', 0, 0, 1050, k); ctx.restore();
      shine(SW / 2 - 525, SH / 2 - 230, 1050, 330, lin(lt, a0 + 0.4, a0 + 1.4), 0.5);
      const t2 = wd(sc, 0, 5); const kt = eo(lin(lt, t2 - 0.1, t2 + 0.4));
      text('LA FRAÎCHEUR SOUS TOUTES SES FORMES', SW / 2, SH / 2 + 220, { size: 58, color: CLAIR, ls: 10 * (1 - kt) + 6, alpha: kt });
      ctx.fillStyle = `rgba(4,14,36,${lin(lt, dur - 0.3, dur)})`; ctx.fillRect(0, 0, SW, SH);
    },
    values(sc, lt) {
      photo('eau-pure', 0, 0, SW, SH, 1.08 + lt * 0.012); ctx.fillStyle = 'rgba(4,14,36,.45)'; ctx.fillRect(0, 0, SW, SH);
      const g = ctx.createLinearGradient(0, 0, SW * 0.6, 0); g.addColorStop(0, 'rgba(4,14,36,.85)'); g.addColorStop(1, 'rgba(4,14,36,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, SW * 0.6, SH);
      const k = eo(lin(lt, 0.05, 0.4)); chip(scramble('NOTRE PROMESSE', lin(lt, 0.05, 0.5), lt), 60, 110, { alpha: k });
      staggerTitle('Glace alimentaire', 60, 220, 120, lt - 0.1);
      chipsList(sc, lt, 340);
      frost(lt, 40, 0.5, 4);
    },
    science(sc, lt) {
      bg(); grid(lt, 0.08); frost(lt, 40, 0.5, 6); const a1 = at(sc, 1), dur = sc.end - sc.start;
      // glaçon en fil de fer qui fond, flèches de chaleur qui entrent
      const melt = lin(lt, 0.6, a1);
      poly('cube', 1180, 430, 170 * (1 - 0.35 * melt), lt * 0.5, lt * 0.7, GOLD, 1, 4);
      for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, f = (lt * 0.8 + i / 8) % 1, r = 360 - 180 * f; ctx.save(); ctx.globalAlpha = Math.sin(f * Math.PI) * 0.9; ctx.beginPath(); ctx.moveTo(1180 + Math.cos(a) * r, 430 + Math.sin(a) * r); ctx.lineTo(1180 + Math.cos(a) * (r - 50), 430 + Math.sin(a) * (r - 50)); ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.strokeStyle = CHAUD; ctx.shadowColor = CHAUD; ctx.shadowBlur = 14; ctx.stroke(); ctx.restore(); }
      const k = eo(lin(lt, 0, 0.35)); chip('LA SCIENCE DU FROID', 60, 110, { alpha: k });
      const tn = wd(sc, 0, 13); const n = Math.round(334 * eo(lin(lt, tn - 1.0, tn + 0.4)));
      text(String(n), 60, 400, { size: 300, metal: true, align: 'left', glow: 'rgba(77,155,255,.85)', alpha: eo(lin(lt, 0.5, 1.0)) });
      text('JOULES', 66, 570, { size: 70, color: '#fff', align: 'left', ls: 10, alpha: eo(lin(lt, 0.8, 1.2)) });
      text('ABSORBÉS PAR GRAMME DE GLACE QUI FOND', 68, 640, { size: 26, fam: 'Barlow', w: 600, color: CLAIR, align: 'left', ls: 4, alpha: eo(lin(lt, 1.0, 1.4)) });
      if (lt > a1) chip("C'EST ÇA, LA VRAIE FRAÎCHEUR", 60, 740, { size: 34, alpha: eo(lin(lt, a1, a1 + 0.25)), k: eo(lin(lt, a1, a1 + 0.5)) });
      ctx.fillStyle = `rgba(4,14,36,${lin(lt, dur - 0.25, dur)})`; ctx.fillRect(0, 0, SW, SH);
    },
    trans(sc, lt) {
      bg(); frost(lt, 60, 0.6, 8);
      const k = eo(lin(lt, 0.05, 0.35)); text('6 GLACES.', SW / 2, 220, { size: 150, color: '#fff', alpha: k });
      text('6 USAGES.', SW / 2, 360, { size: 150, metal: true, glow: 'rgba(77,155,255,.8)', alpha: eo(lin(lt, wd(sc, 0, 2) - 0.1, wd(sc, 0, 2) + 0.25)) });
      PRODS.forEach((p, i) => { const kk = back(lin(lt, 0.3 + i * 0.12, 0.7 + i * 0.12)); if (kk <= 0) return; const w = 220, h = 275, x = 80 + i * 245, y = 520 + (1 - clamp(kk)) * 120; ctx.save(); ctx.globalAlpha = clamp(kk); photo(p, x, y, w, h, 1, 0.5, 0.5, 16); ctx.restore(); glass(x, y, w, h, { fill: 'rgba(0,0,0,0)', alpha: clamp(kk) }); });
    },
    // un produit : photo en verre à droite, nom, mécaniques, prix
    product(sc, lt) {
      const dur = sc.end - sc.start;
      bg(); frost(lt, 40, 0.45, sc.num);
      // photo
      const pin = eo(lin(lt, 0, 0.5)), px = 930 + (1 - pin) * 200, py = 70, pw = 600, ph = 760;
      ctx.save(); ctx.globalAlpha = pin; ctx.translate(px + pw / 2, py + ph / 2); ctx.rotate((1 - pin) * 0.08); photo(sc.img, -pw / 2, -ph / 2, pw, ph, 1.04 + lt * 0.01, 0.5, 0.5, 26); ctx.restore();
      glass(px, py, pw, ph, { fill: 'rgba(0,0,0,0)', alpha: pin, r: 26 });
      shine(px, py, pw, ph, lin(lt, 0.5, 1.3), 0.35);
      if (sc.fog) fog(lt, 0.9);
      hudCorners(lt, dur);
      const k = eo(lin(lt, 0.05, 0.4));
      chip(scramble(`${String(sc.num).padStart(2, '0')} / 06 · ${sc.alias.toUpperCase()}`, lin(lt, 0.05, 0.55), lt), 60, 110, { alpha: k, k });
      staggerTitle(sc.name, 60, 215, 118, lt - 0.12);
      if (sc.isNew) { const kn = back(lin(lt, 0.6, 0.95)); ctx.save(); ctx.translate(px + pw - 20, py + 20); ctx.rotate(0.12); ctx.scale(kn, kn); chip('NOUVEAU', 0, 0, { align: 'center', size: 30, bg: '#39a85b' }); ctx.restore(); }
      chipsList(sc, lt, 330);
      // étiquette de prix
      const tp = Math.min(1.4, dur * 0.3); const kp = back(lin(lt, tp, tp + 0.45)); if (kp > 0) {
        const x = 60, y = 690, w = Math.max(470, measure(sc.unit.toUpperCase(), 22, 600, 'Barlow', 3) + 70), h = 150; ctx.save(); ctx.translate(x, y + (1 - clamp(kp)) * 40); ctx.globalAlpha = clamp(kp * 1.5);
        rrect(0, 0, w, h, 18); const g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#2a7deb'); g.addColorStop(1, '#0f4fb3'); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(232,246,255,.7)'; ctx.shadowColor = '#4d9bff'; ctx.shadowBlur = 30; ctx.stroke(); ctx.shadowBlur = 0;
        const digits = sc.price.replace(/\s/g, ''); const val = Math.round(Number(digits) * eo(lin(lt, tp, tp + 0.9))); const shown = val.toLocaleString('fr-FR').replace(/ | /g, ' ');
        text(shown, 30, 66, { size: 96, color: '#fff', align: 'left' }); const wv = measure(shown, 96); text('FCFA', 40 + wv, 82, { size: 40, color: CLAIR, align: 'left' });
        text(sc.unit.toUpperCase(), 32, 125, { size: 22, fam: 'Barlow', w: 600, color: '#e3f3ff', align: 'left', ls: 3 });
        ctx.restore(); shine(x, y, w, h, lin(lt, tp + 0.5, tp + 1.1), 0.4);
      }
      const f = 1 - lin(lt, 0, 0.14); if (f > 0) { ctx.fillStyle = `rgba(232,246,255,${0.35 * f})`; ctx.fillRect(0, 0, SW, SH); }
      ctx.fillStyle = `rgba(4,14,36,${0.8 * lin(lt, dur - 0.15, dur)})`; ctx.fillRect(0, 0, SW, SH);
    },
    sectors(sc, lt) {
      const L = sc.lines; let i = 0; for (let k = 0; k < L.length; k++) if (lt >= at(sc, k) - 0.12) i = k;
      const l0 = lt - (at(sc, i) - 0.12), li = L[i];
      photo(li.img, 0, 0, SW, SH, 1.12 - 0.06 * eo(lin(l0, 0, 1.2)));
      const g = ctx.createLinearGradient(0, SH * 0.35, 0, SH); g.addColorStop(0, 'rgba(4,14,36,0)'); g.addColorStop(1, 'rgba(4,14,36,.9)'); ctx.fillStyle = g; ctx.fillRect(0, 0, SW, SH);
      const word = li.t.replace(/\.$/, '').toUpperCase(); const kk = back(lin(l0, 0.05, 0.35));
      ctx.save(); ctx.translate(70, SH - 130 + (1 - clamp(kk)) * 60); text(word, 0, 0, { size: 150, color: '#fff', align: 'left', alpha: clamp(kk * 1.5), glow: 'rgba(77,155,255,.6)' }); ctx.restore();
      chip(`SECTEUR ${i + 1} / ${L.length}`, 72, 120, { alpha: eo(lin(l0, 0, 0.2)) });
      const f = 1 - lin(l0, 0, 0.12); if (f > 0 && i > 0) { ctx.fillStyle = `rgba(232,246,255,${0.35 * f})`; ctx.fillRect(0, 0, SW, SH); }
    },
    order(sc, lt) {
      const dur = sc.end - sc.start, L = sc.lines; let i = 0; for (let k = 0; k < L.length; k++) if (lt >= at(sc, k) - 0.1) i = k;
      bg(); grid(lt, 0.06);
      // fenêtre de navigateur avec le vrai site filmé
      const homeEnd = 2.2; const useHome = lt < homeEnd; const img = useHome ? IMG.frame('home', lt + 3.2) : IMG.frame('devis', lt - homeEnd);
      const FOC = [[0, 0, 1], [0.0, 0.05, 1.0], [0.0, 0.0, 1.0], [0.0, 0.0, 1.0]];
      const bx = 150, by = 120, bw = 1300, bh = 731 + 46; const kin = eo(lin(lt, 0, 0.5));
      ctx.save(); ctx.translate(SW / 2, SH / 2 + 10); ctx.scale(0.9 + 0.1 * kin, 0.9 + 0.1 * kin); ctx.translate(-SW / 2, -SH / 2 - 10); ctx.globalAlpha = kin;
      glass(bx, by, bw, bh, { r: 16, fill: 'rgba(6,22,52,.95)' });
      [CHAUD, '#ffc93c', '#39a85b'].forEach((c, q) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(bx + 26 + q * 22, by + 23, 7, 0, 7); ctx.fill(); });
      rrect(bx + 110, by + 9, 560, 28, 14); ctx.fillStyle = 'rgba(191,228,255,.1)'; ctx.fill();
      const url = useHome ? 'www.leglaceur.ci' : 'www.leglaceur.ci/devis'; const nu = Math.floor(url.length * lin(lt, 0.1, 0.8));
      text('🔒 ' + url.slice(0, nu), bx + 128, by + 24, { size: 17, fam: 'Barlow', w: 500, color: '#e3f3ff', align: 'left' });
      // zoom de caméra sur la zone utile de chaque étape (z, ox, oy)
      const KEY = useHome ? [[1, 0.5, 0.5]] : [[1.55, 0.42, 0.42], [1.6, 0.3, 0.62], [1.7, 0.78, 0.55], [1.05, 0.5, 0.5]];
      const ki = useHome ? 0 : i, prev = KEY[Math.max(0, ki - 1)], cur = KEY[ki]; const m = useHome || ki === 0 ? eio(lin(lt, homeEnd, homeEnd + 0.7)) : eio(lin(lt, at(sc, ki) - 0.2, at(sc, ki) + 0.6));
      const from = ki === 0 ? [1, 0.5, 0.5] : prev; const zz = from[0] + (cur[0] - from[0]) * m, ox = from[1] + (cur[1] - from[1]) * m, oy = from[2] + (cur[2] - from[2]) * m;
      ctx.save(); rrect(bx + 6, by + 46, bw - 12, bh - 52, 10); ctx.clip(); cover(img, bx + 6, by + 46, bw - 12, bh - 52, zz, ox, oy); ctx.restore();
      ctx.restore();
      // étapes
      const steps = [['1', 'CHOISISSEZ VOS QUANTITÉS'], ['2', 'LIVRAISON OU RETRAIT'], ['3', 'DEVIS PDF · EXCEL → WHATSAPP'], ['4', 'PAIEMENT À LA LIVRAISON']];
      const s = steps[i]; const ks = back(lin(lt, at(sc, i) - 0.1, at(sc, i) + 0.3));
      ctx.save(); ctx.translate(SW / 2, 62); ctx.scale(clamp(ks), clamp(ks)); const w = chip(`ÉTAPE ${s[0]} · ${s[1]}`, 0, 0, { align: 'center', size: 30 }); ctx.restore();
      if (i === 3) { const kk = back(lin(lt, at(sc, 3) + 0.3, at(sc, 3) + 0.7)); ctx.save(); ctx.translate(SW - 300, SH - 230); ctx.rotate(-0.08); ctx.scale(kk, kk); ctx.lineWidth = 5; ctx.strokeStyle = WA; ctx.shadowColor = WA; ctx.shadowBlur = 20; rrect(-200, -55, 400, 110, 14); ctx.stroke(); ctx.shadowBlur = 0; text('0 F EN LIGNE', 0, -8, { size: 54, color: '#fff' }); text('VOUS PAYEZ À LA LIVRAISON', 0, 32, { size: 18, fam: 'Barlow', w: 600, color: CLAIR, ls: 3 }); ctx.restore(); }
      ctx.fillStyle = `rgba(4,14,36,${lin(lt, dur - 0.25, dur)})`; ctx.fillRect(0, 0, SW, SH);
    },
    delivery(sc, lt) {
      bg(); grid(lt, 0.08); frost(lt, 40, 0.5, 9); const a1 = at(sc, 1), a2 = at(sc, 2), dur = sc.end - sc.start;
      if (lt < a1 - 0.1) {
        const k = eo(lin(lt, 0, 0.35)); chip('LIVRAISON PARTOUT À ABIDJAN', 60, 110, { alpha: k });
        const C = ['Abobo', 'Adjamé', 'Anyama', 'Attécoubé', 'Bingerville', 'Cocody', 'Koumassi', 'Marcory', 'Plateau', 'Port-Bouët', 'Songon', 'Treichville', 'Yopougon', 'Grand-Bassam'];
        C.forEach((c, q) => { const kk = eo(lin(lt, 0.2 + q * 0.07, 0.5 + q * 0.07)); const x = 830 + (q % 2) * 330, y = 160 + Math.floor(q / 2) * 88; glass(x, y, 300, 66, { alpha: kk, glow: 8 }); ctx.save(); ctx.globalAlpha = kk; ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(x + 30, y + 33, 7, 0, 7); ctx.fill(); ctx.restore(); text(c.toUpperCase(), x + 52, y + 35, { size: 34, color: '#fff', align: 'left', alpha: kk }); });
        const tn = wd(sc, 0, 7); const n = Math.round(20 * eo(lin(lt, tn - 0.6, tn + 0.3)));
        text('OFFERTE DÈS', 60, 300, { size: 60, color: '#fff', align: 'left', alpha: eo(lin(lt, tn - 0.8, tn - 0.5)) });
        text(String(n), 60, 470, { size: 260, metal: true, align: 'left', glow: 'rgba(77,155,255,.85)', alpha: eo(lin(lt, tn - 0.8, tn - 0.5)) });
        text('ARTICLES', 64, 610, { size: 70, color: CLAIR, align: 'left', ls: 8, alpha: eo(lin(lt, tn, tn + 0.3)) });
        rrect(64, 680, 600, 14, 7); ctx.fillStyle = 'rgba(191,228,255,.12)'; ctx.fill(); rrect(64, 680, 600 * n / 20, 14, 7); ctx.fillStyle = n >= 20 ? '#39a85b' : BRAISE; ctx.fill();
        if (n >= 20) chip('LIVRAISON OFFERTE ✓', 64, 740, { bg: '#39a85b', size: 28 });
      } else if (lt < a2 - 0.1) {
        const k = eo(lin(lt, a1 - 0.1, a1 + 0.3)); chip('RETRAIT SUR PLACE · GRATUIT', 60, 110, { alpha: k });
        // épingle de carte
        const kp = back(lin(lt, a1, a1 + 0.5)); ctx.save(); ctx.translate(1150, 470 - (1 - clamp(kp)) * 200); ctx.globalAlpha = clamp(kp);
        for (let r = 0; r < 3; r++) { const rr = ((lt * 0.8 + r / 3) % 1); ctx.beginPath(); ctx.ellipse(0, 150, 60 + rr * 220, (60 + rr * 220) * 0.3, 0, 0, 7); ctx.strokeStyle = `rgba(142,207,255,${0.6 * (1 - rr)})`; ctx.lineWidth = 3; ctx.stroke(); }
        ctx.beginPath(); ctx.arc(0, 0, 80, Math.PI * 0.85, Math.PI * 0.15); ctx.lineTo(0, 150); ctx.closePath(); ctx.fillStyle = BRAISE; ctx.shadowColor = '#4d9bff'; ctx.shadowBlur = 40; ctx.fill(); ctx.shadowBlur = 0; ctx.beginPath(); ctx.arc(0, 0, 32, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore();
        text('ABATTA', 60, 380, { size: 170, color: '#fff', align: 'left', alpha: k }); text('CARREFOUR DROGBA', 64, 520, { size: 90, metal: true, align: 'left', glow: 'rgba(77,155,255,.7)', alpha: eo(lin(lt, wd(sc, 1, 3) - 0.1, wd(sc, 1, 3) + 0.3)) });
      } else {
        const k = eo(lin(lt, a2 - 0.1, a2 + 0.3));
        // horloge qui tourne vite
        const cx = 1150, cy = 450, R = 230; ctx.save(); ctx.globalAlpha = k; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.lineWidth = 6; ctx.strokeStyle = GOLD; ctx.shadowColor = '#4d9bff'; ctx.shadowBlur = 30; ctx.stroke(); ctx.shadowBlur = 0;
        for (let h = 0; h < 24; h++) { const a = h / 24 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * (R - 14), cy + Math.sin(a) * (R - 14)); ctx.lineTo(cx + Math.cos(a) * (R - (h % 6 ? 30 : 44)), cy + Math.sin(a) * (R - (h % 6 ? 30 : 44))); ctx.lineWidth = h % 6 ? 2 : 5; ctx.strokeStyle = CLAIR; ctx.stroke(); }
        const ang = (lt - a2) * 6; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ang - Math.PI / 2) * (R - 50), cy + Math.sin(ang - Math.PI / 2) * (R - 50)); ctx.lineWidth = 6; ctx.strokeStyle = '#fff'; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ang / 12 - Math.PI / 2) * (R - 110), cy + Math.sin(ang / 12 - Math.PI / 2) * (R - 110)); ctx.lineWidth = 9; ctx.stroke(); ctx.restore();
        text('24H/24', 60, 360, { size: 220, metal: true, align: 'left', glow: 'rgba(77,155,255,.85)', alpha: k });
        text('7J/7', 60, 560, { size: 220, color: '#fff', align: 'left', alpha: eo(lin(lt, wd(sc, 2, 5) - 0.1, wd(sc, 2, 5) + 0.3)) });
      }
      ctx.fillStyle = `rgba(4,14,36,${lin(lt, dur - 0.2, dur)})`; ctx.fillRect(0, 0, SW, SH);
    },
    climax(sc, lt) {
      const a1 = at(sc, 1), a2 = at(sc, 2), dur = sc.end - sc.start;
      if (lt < a2 - 0.05) {
        bg(); frost(lt, 50, 0.6, 10);
        if (lt < a1 - 0.05) {
          const k = eo(lin(lt, 0, 0.35)); text('LA VRAIE QUESTION', SW / 2, 200, { size: 30, fam: 'Barlow', w: 600, color: CLAIR, ls: 12, alpha: k });
          text('AVEZ-VOUS DE LA GLACE ?', SW / 2, SH / 2, { size: 120, color: '#fff', alpha: eo(lin(lt, wd(sc, 0, 6) - 0.1, wd(sc, 0, 6) + 0.3)) });
          const st = eo(lin(lt, lineEnd(sc, 0) - 0.1, lineEnd(sc, 0) + 0.3)); if (st > 0) { ctx.beginPath(); ctx.moveTo(SW / 2 - 620, SH / 2 + 6); ctx.lineTo(SW / 2 - 620 + 1240 * st, SH / 2 - 6); glowStroke(BRAISE, 10, 20); }
        } else {
          const k = eo(lin(lt, a1 - 0.05, a1 + 0.35));
          text('VOTRE GLACE EST-ELLE', SW / 2, SH / 2 - 100, { size: 110, color: '#fff', alpha: k });
          text('VRAIMENT ALIMENTAIRE ?', SW / 2, SH / 2 + 50, { size: 140, metal: true, glow: 'rgba(77,155,255,.85)', alpha: eo(lin(lt, wd(sc, 1, 4) - 0.1, wd(sc, 1, 4) + 0.3)) });
        }
      } else {
        const k = lin(lt, a2 - 0.05, a2 + 0.08);
        ctx.fillStyle = NOIR; ctx.fillRect(0, 0, SW, SH);
        ctx.globalAlpha = k; const g = ctx.createRadialGradient(SW / 2, SH / 2, 50, SW / 2, SH / 2, SW * 0.7); g.addColorStop(0, '#e3f3ff'); g.addColorStop(1, '#8ecfff'); ctx.fillStyle = g; ctx.fillRect(0, 0, SW, SH); ctx.globalAlpha = 1;
        crack(SW / 2, SH / 2, lin(lt, a2, a2 + 0.6), 7, 'rgba(15,79,179,');
        const p = back(lin(lt, a2, a2 + 0.4)); ctx.save(); ctx.translate(SW / 2, SH / 2); ctx.scale(0.8 + 0.2 * p, 0.8 + 0.2 * p);
        text('RESTEZ', 0, -90, { size: 190, color: '#0a1f44' }); text('AU FRAIS.', 0, 90, { size: 190, color: '#0a1f44' }); ctx.restore();
        frostEdges(lin(lt, a2, dur), 5);
        ctx.fillStyle = `rgba(255,255,255,${lin(lt, dur - 0.3, dur)})`; ctx.fillRect(0, 0, SW, SH);
      }
    },
    cta(sc, lt) {
      bg(1.3); frost(lt, 80, 0.7, 12);
      ctx.fillStyle = `rgba(255,255,255,${1 - lin(lt, 0, 0.5)})`; ctx.fillRect(0, 0, SW, SH);
      const k = eo(lin(lt, 0, 0.6)); svgLogo('logo-full-white.svg', SW / 2, 250, 920, k);
      const u = eo(lin(lt, wd(sc, 0, 3) - 0.1, wd(sc, 0, 3) + 0.4));
      glass(SW / 2 - 330, 470, 660, 100, { alpha: u, r: 50 }); text('www.leglaceur.ci', SW / 2, 522, { size: 54, fam: 'Barlow', w: 600, color: '#fff', alpha: u, ls: 2 });
      const wv = eo(lin(lt, wd(sc, 0, 8) - 0.1, wd(sc, 0, 8) + 0.4));
      ctx.save(); ctx.globalAlpha = wv; rrect(SW / 2 - 330, 610, 660, 96, 48); ctx.fillStyle = '#0e7a3f'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = WA; ctx.shadowColor = WA; ctx.shadowBlur = 26; ctx.stroke(); ctx.restore();
      text('WhatsApp  +225 07 87 64 07 72', SW / 2, 659, { size: 40, fam: 'Barlow', w: 600, color: '#fff', alpha: wv });
      text('24H/24 · 7J/7 · ABATTA – CARREFOUR DROGBA', SW / 2, 780, { size: 24, fam: 'Barlow', w: 600, color: CLAIR, ls: 6, alpha: wv });
    },
  };
  // liste de mécaniques à coches (repris des scènes jeu)
  function chipsList(sc, lt, y0) {
    const chips = sc.chips || []; let last = -1; chips.forEach((c, q) => { if (lt >= c.t - sc.start - 0.05) last = q; });
    chips.forEach((c, q) => {
      const t0 = c.t - sc.start - 0.05; const kk = back(lin(lt, t0, t0 + 0.3)); if (kk <= 0) return;
      const y = y0 + q * 76, on = q === last;
      ctx.save(); ctx.translate(60 + (1 - clamp(kk)) * -60, y); ctx.globalAlpha = clamp(kk * 1.5);
      const w = measure(c.text, 28, 600, 'Barlow', 3) + 90; rrect(0, -28, w, 56, 10);
      ctx.fillStyle = on ? BRAISE : 'rgba(6,22,52,.86)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = on ? '#bfe4ff' : 'rgba(142,207,255,.5)'; ctx.shadowColor = BRAISE; ctx.shadowBlur = on ? 26 : 0; ctx.stroke(); ctx.shadowBlur = 0;
      ctx.beginPath(); ctx.moveTo(20, 1); ctx.lineTo(30, 11); ctx.lineTo(48, -10); ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.strokeStyle = on ? '#ffffff' : GOLD; ctx.stroke();
      text(c.text, 66, 2, { size: 28, fam: 'Barlow', w: 600, color: '#fff', align: 'left', ls: 3 });
      ctx.restore();
      sparks(60, y, lt - t0, q + 7); shine(60, y - 28, w, 56, lin(lt, t0 + 0.15, t0 + 0.6));
    });
  }


  // ---------- post-traitement : secousses, glitch de coupe, bloom, fuites de lumière, grain, vignette ----------
  const IMPACTS = (() => {
    const L = []; const W = (id, i, j) => { const sc = scenes[id]; const w = sc && sc.lines[i] && sc.lines[i].words; return w ? w[Math.min(j, w.length - 1)].s : null; };
    TL.scenes.forEach((sc, i) => { if (i > 0) L.push({ t: sc.start, a: sc.type === 'product' ? 0.55 : 0.4, cut: true }); });
    for (const [t, a] of [[W('hook', 0, 0), 0.8], [W('hook', 2, 3), 1], [scenes.logo && scenes.logo.lines[0].start, 1], [W('count', 1, 9), 1], [scenes.climax && scenes.climax.lines[2].start, 1.3], [W('trans', 0, 5), 0.8]]) if (t != null) L.push({ t, a, cut: false });
    return L;
  })();
  const snap = document.createElement('canvas'); snap.width = 1920; snap.height = 1080; const sctx = snap.getContext('2d');
  const small = document.createElement('canvas'); small.width = 480; small.height = 270; const smctx = small.getContext('2d');
  const noise = document.createElement('canvas'); noise.width = 256; noise.height = 256; { const nc = noise.getContext('2d'), im = nc.createImageData(256, 256); for (let i = 0; i < im.data.length; i += 4) { const v = rnd(i) * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } nc.putImageData(im, 0, 0); }
  function energy(t) { let sh = 0, cut = 0, best = null; for (const I of IMPACTS) { const d = t - I.t; if (d >= -0.02 && d < 0.6) { const e = I.a * Math.exp(-Math.max(0, d) * 9); sh += e; if (!best || e > best.e) best = { ...I, e, d }; } if (I.cut && Math.abs(d) < 0.12) cut = Math.max(cut, 1 - Math.abs(d) / 0.12); } return { sh, cut, best }; }
  function post(t) {
    const E = energy(t), f = Math.floor(t * 30);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // glitch de coupe : bandes horizontales décalées + fantôme décalé
    if (E.cut > 0.05) {
      sctx.drawImage(cv, 0, 0);
      for (let i = 0; i < 9; i++) { const y = Math.floor(rnd(f * 13 + i) * 1080), h = 12 + rnd(f * 7 + i) * 90, dx = (rnd(f * 3 + i) - 0.5) * 160 * E.cut; ctx.drawImage(snap, 0, y, 1920, h, dx, y, 1920, h); }
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.28 * E.cut; ctx.drawImage(snap, 14 * E.cut, 0); ctx.globalAlpha = 0.18 * E.cut; ctx.drawImage(snap, -14 * E.cut, 0); ctx.restore();
      // traînée lumineuse diagonale
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; const x = -400 + 2700 * (0.5 + 0.5 * Math.sign(t - 0) * 0) ; const p = clamp((E.cut)); const gx = 1920 * (1 - p) - 200; const g = ctx.createLinearGradient(gx - 160, 0, gx + 160, 0); g.addColorStop(0, 'rgba(77,155,255,0)'); g.addColorStop(0.5, `rgba(205,232,255,${0.5 * p})`); g.addColorStop(1, 'rgba(77,155,255,0)'); ctx.fillStyle = g; ctx.transform(1, 0, -0.35, 1, 0, 0); ctx.fillRect(gx - 200, 0, 400 + 400, 1080); ctx.restore();
    }
    // bloom léger : image réduite, floutée, ajoutée en « screen »
    smctx.filter = 'blur(5px)'; smctx.drawImage(cv, 0, 0, 480, 270); smctx.filter = 'none';
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.32 + 0.4 * Math.min(1, E.sh); ctx.drawImage(small, 0, 0, 1920, 1080); ctx.restore();
    // fuite de lumière chaude sur les impacts
    if (E.best && E.best.e > 0.05) { ctx.save(); ctx.globalCompositeOperation = 'screen'; const cx = rnd(Math.floor(E.best.t * 10)) > 0.5 ? 1920 : 0; const g = ctx.createRadialGradient(cx, 300, 10, cx, 300, 1100); g.addColorStop(0, `rgba(90,170,255,${0.45 * Math.min(1, E.best.e)})`); g.addColorStop(1, 'rgba(90,170,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1920, 1080); ctx.restore(); }
    // vignette
    const v = ctx.createRadialGradient(960, 540, 420, 960, 540, 1150); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)'); ctx.fillStyle = v; ctx.fillRect(0, 0, 1920, 1080);
    // grain de film
    ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = 0.09; const ox = Math.floor(rnd(f) * 256), oy = Math.floor(rnd(f + 99) * 256); ctx.translate(-ox, -oy); ctx.fillStyle = ctx.createPattern(noise, 'repeat'); ctx.fillRect(0, 0, 1920 + 256, 1080 + 256); ctx.restore();
  }

  function draw(t) {
    let sc = TL.scenes[TL.scenes.length - 1]; for (const s of TL.scenes) if (t >= s.start && t < s.end) { sc = s; break; }
    const lt = t - sc.start; const E = energy(t), f = Math.floor(t * 30);
    const z = 1 + 0.035 * Math.min(1.2, E.sh), sx = (rnd(f) - 0.5) * 26 * E.sh, sy = (rnd(f + 7) - 0.5) * 18 * E.sh;
    ctx.setTransform(1.2 * z, 0, 0, 1.2 * z, 960 - 960 * z + sx, 540 - 540 * z + sy); ctx.save(); DRAW[sc.type === 'product' ? 'product' : sc.id](sc, lt); ctx.restore();
    ctx.save(); chrome(t, curLine(sc, t)); ctx.restore();
    post(t);
    // lignes de balayage très légères (écran)
    
    return sc;
  }
  return { canvas: cv, ctx, draw, scenes };
}
