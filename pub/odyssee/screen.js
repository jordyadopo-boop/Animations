// La pub en plein cadre 16:9 (sortie 1920x1080, dessin en repère 1600x900) : typographie animée, gameplay, interfaces.
// Tout est calé sur timeline.json (voix off mot à mot). draw(t) est déterministe.

export const SW = 1600, SH = 900;
const GOLD = '#ffc93c', GOLD2 = '#e9b949', CLAIR = '#ffe08a', BLANC = '#fff1c2', BRAISE = '#ff7a1a', NOIR = '#050302';
const METAL = ['#FFF4CF', '#FFE08A', '#E9B949', '#9C6315', '#E8B44A', '#FFE9A8', '#D9A23A', '#8A5612', '#5A360B'];

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
  function font(px, w = 600, fam = 'Cinzel') { ctx.font = `${w} ${px}px '${fam}', 'Noto Sans', 'Noto Sans CJK SC', 'Noto Sans Arabic', 'Noto Sans Devanagari', sans-serif`; }
  function metal(y0, y1) { const g = ctx.createLinearGradient(0, y0, 0, y1); METAL.forEach((c, i) => g.addColorStop(i / (METAL.length - 1), c)); return g; }
  // texte : opts {size, w, fam, color, glow, align, base, ls, alpha, metal}
  function text(s, x, y, o = {}) {
    const size = o.size || 80; font(size, o.w || 600, o.fam || 'Cinzel');
    ctx.save(); ctx.globalAlpha *= o.alpha ?? 1; ctx.textAlign = o.align || 'center'; ctx.textBaseline = o.base || 'middle';
    if (o.ls) ctx.letterSpacing = `${o.ls}px`;
    const fill = o.metal ? metal(y - size * 0.55, y + size * 0.45) : (o.color || BLANC);
    if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = o.blur ?? size * 0.45; ctx.fillStyle = fill; ctx.fillText(s, x, y); ctx.shadowBlur = (o.blur ?? size * 0.45) * 0.3; ctx.fillText(s, x, y); ctx.shadowBlur = 0; }
    ctx.fillStyle = fill; ctx.fillText(s, x, y);
    const w = ctx.measureText(s).width; ctx.restore(); return w;
  }
  function measure(s, size, w = 600, fam = 'Cinzel', ls = 0) { font(size, w, fam); ctx.save(); if (ls) ctx.letterSpacing = `${ls}px`; const m = ctx.measureText(s).width; ctx.restore(); return m; }
  function rrect(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
  function glowStroke(color, width, blur) { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.shadowColor = color; ctx.shadowBlur = blur; ctx.stroke(); ctx.shadowBlur = 0; ctx.lineWidth = width * 0.45; ctx.strokeStyle = '#fff6da'; ctx.globalAlpha *= 0.8; ctx.stroke(); ctx.restore(); }
  // pastille (comme « THE PROMPT ») : texte sur fond braise
  function chip(s, x, y, o = {}) {
    const size = o.size || 26; const pad = size * 0.5; const w = measure(s, size, 600, 'Jost', o.ls ?? 2) + pad * 2, h = size * 1.6;
    const xx = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
    ctx.save(); ctx.globalAlpha *= o.alpha ?? 1;
    rrect(xx, y - h / 2, w * (o.k ?? 1), h, 6); ctx.fillStyle = o.bg || BRAISE; ctx.fill();
    ctx.clip(); text(s, xx + pad, y + 1, { size, w: 600, fam: 'Jost', color: o.color || '#1a0d02', align: 'left', ls: o.ls ?? 2 });
    ctx.restore(); return w;
  }
  function panel(x, y, w, h, o = {}) {
    ctx.save(); ctx.globalAlpha *= o.alpha ?? 1;
    rrect(x, y, w, h, o.r ?? 14); ctx.fillStyle = o.fill || 'rgba(13,9,4,.88)'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = o.stroke || 'rgba(255,201,60,.55)'; ctx.shadowColor = 'rgba(255,180,58,.6)'; ctx.shadowBlur = o.glow ?? 18; ctx.stroke();
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
    ctx.save(); ctx.globalAlpha = 0.55; ctx.strokeStyle = 'rgba(255,224,138,.35)'; ctx.lineWidth = 1.5;
    for (const [x, y, dx, dy] of [[30, 30, 1, 1], [SW - 30, 30, -1, 1], [30, SH - 30, 1, -1], [SW - 30, SH - 30, -1, -1]]) { ctx.beginPath(); ctx.moveTo(x, y + dy * 22); ctx.lineTo(x, y); ctx.lineTo(x + dx * 22, y); ctx.stroke(); }
    text('ODYSSÉE · STUDIO', SW - 60, 46, { size: 15, fam: 'Jost', w: 500, color: CLAIR, align: 'right', ls: 4 });
    const s = Math.floor(t), tc = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}:${String(Math.floor((t % 1) * 30)).padStart(2, '0')}`;
    text(tc, SW - 60, SH - 44, { size: 15, fam: 'Jost', w: 500, color: CLAIR, align: 'right', ls: 3 });
    ctx.fillStyle = BRAISE; ctx.globalAlpha = 0.5 + 0.5 * (Math.sin(t * 6) > 0); ctx.beginPath(); ctx.arc(60, SH - 49, 5, 0, 7); ctx.fill(); ctx.globalAlpha = 0.55;
    text('REC', 74, SH - 44, { size: 15, fam: 'Jost', w: 500, color: CLAIR, align: 'left', ls: 3 });
    ctx.restore();
    // la phrase en cours, en petit, avec le mot dit surligné (comme la référence)
    if (line) {
      let x = 60; const y = 54; ctx.save(); ctx.globalAlpha = 0.9;
      for (const w of line.words) {
        const ww = measure(w.w, 20, 500, 'Jost') + 7; const on = t >= w.s && t < w.e + 0.08;
        if (on) { rrect(x - 3, y - 14, ww - 1, 28, 4); ctx.fillStyle = BRAISE; ctx.fill(); }
        text(w.w, x, y + 1, { size: 20, fam: 'Jost', w: 500, color: on ? '#1a0d02' : '#d9c9a8', align: 'left' }); x += ww; if (x > 900) break;
      }
      ctx.restore();
    }
  }
  function bg(a = 1) {
    ctx.fillStyle = NOIR; ctx.fillRect(0, 0, SW, SH);
    const g = ctx.createRadialGradient(SW / 2, SH * 0.55, 50, SW / 2, SH * 0.55, SW * 0.7); g.addColorStop(0, `rgba(40,24,8,${0.55 * a})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, SW, SH);
  }
  // grille de points (sol d'atelier)
  function grid(t, a = 0.25) { ctx.save(); ctx.fillStyle = `rgba(255,224,138,${a})`; for (let x = 40; x < SW; x += 40) for (let y = 40; y < SH; y += 40) ctx.fillRect(x, y, 1.6, 1.6); ctx.restore(); }

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
    const g = ctx.createLinearGradient(0, 0, 0, SH); g.addColorStop(0, 'rgba(5,3,2,.55)'); g.addColorStop(0.18, 'rgba(5,3,2,0)'); g.addColorStop(0.75, 'rgba(5,3,2,0)'); g.addColorStop(1, 'rgba(5,3,2,.75)'); ctx.fillStyle = g; ctx.fillRect(0, 0, SW, SH);
    ctx.restore();
  }

  // ======================= SCÈNES =======================
  const DRAW = {
    hook(sc, lt) {
      bg(); grid(lt, 0.12); dust(lt, 40, 0.5);
      const a0 = at(sc, 0), a1 = at(sc, 1), a2 = at(sc, 2);
      if (lt < a1 - 0.05) { const k = eo(lin(lt, a0 - 0.1, a0 + 0.25)); text('ATTENDS.', SW / 2, SH / 2 + 20, { size: 200, w: 700, color: '#fff', glow: 'rgba(255,241,194,.55)', alpha: k, ls: 10 * (1 - k) + 6 }); }
      else if (lt < a2 - 0.05) { const k = eo(lin(lt, a1 - 0.05, a1 + 0.3)); text('REGARDE', SW / 2, SH / 2 - 60, { size: 130, w: 700, color: '#fff', alpha: k }); text('BIEN.', SW / 2, SH / 2 + 80, { size: 150, w: 700, metal: true, glow: 'rgba(255,180,58,.7)', alpha: eo(lin(lt, wd(sc, 1, 1) - 0.05, wd(sc, 1, 1) + 0.2)) }); }
      else {
        const k = eo(lin(lt, a2 - 0.05, a2 + 0.3));
        text("TU N'ES PAS", SW / 2, SH / 2 - 120, { size: 70, w: 600, color: '#fff', alpha: k, ls: 8 });
        const kp = back(lin(lt, wd(sc, 2, 3) - 0.05, wd(sc, 2, 3) + 0.35));
        ctx.save(); ctx.translate(SW / 2, SH / 2 + 60); ctx.scale(0.6 + 0.4 * kp, 0.6 + 0.4 * kp);
        text('PRÊT', 0, 0, { size: 270, w: 700, metal: true, glow: 'rgba(255,150,40,.85)', alpha: clamp(kp * 2) }); ctx.restore();
        // petite barre de chargement sous le mot
        const lb = lin(lt, a2, sc.end - sc.start); rrect(SW / 2 - 160, SH / 2 + 230, 320, 6, 3); ctx.fillStyle = 'rgba(255,224,138,.15)'; ctx.fill(); rrect(SW / 2 - 160, SH / 2 + 230, 320 * lb, 6, 3); ctx.fillStyle = BRAISE; ctx.fill();
      }
    },
    intro(sc, lt) {
      bg(); grid(lt, 0.1); dust(lt, 30, 0.4, 2);
      const a0 = at(sc, 0), a1 = at(sc, 1), a2 = at(sc, 2), dur = sc.end - sc.start;
      const gy = 690;
      // ligne de craie
      const lk = eo(lin(lt, a1 - 0.1, a1 + 0.9));
      if (lk > 0) { ctx.beginPath(); ctx.moveTo(SW / 2 - 560 * lk, gy); ctx.lineTo(SW / 2 + 560 * lk, gy); glowStroke(GOLD, 4, 18); node(SW / 2 - 560 * lk, gy, 10); node(SW / 2 + 560 * lk, gy, 10); }
      // polyèdres menaçants
      const pk = lin(lt, a2 - 0.1, a2 + 1.2);
      if (pk > 0) {
        const kinds = [['ico', -480, -150, 120, GOLD], ['cube', 470, -190, 95, BRAISE], ['tet', -300, -330, 70, '#ff4a6e'], ['oct', 330, -350, 75, CLAIR], ['ico', 620, 40, 60, '#ff9a3c'], ['cube', -640, 20, 55, GOLD]];
        kinds.forEach(([k, dx, dy, r, c], i) => { const e = eo(clamp(pk * 1.6 - i * 0.12)); poly(k, SW / 2 + dx * (0.6 + 0.4 * e) + Math.sin(lt * 0.8 + i) * 10, gy - 280 + dy + (1 - e) * -400 + Math.cos(lt + i) * 8, r * (0.9 + 0.1 * Math.sin(lt * 2 + i)), lt * 0.7 + i, lt * 0.9 + i * 2, c, e, 3); });
      }
      // le bonhomme
      const sk = lin(lt, a0 - 0.1, a0 + 1.3);
      const shake = pk > 0.3 ? Math.sin(lt * 40) * 2 * (1 - lin(lt, a2 + 1.5, a2 + 2)) : 0;
      stickman(SW / 2 + shake, gy, 300, sk, 'stand', lt * 2);
      // libellés type « UI »
      if (lt > a0) chip('LE BONHOMME', 120, 150, { alpha: lin(lt, a0, a0 + 0.2) });
      if (lt > a1) chip('LA LIGNE DE CRAIE', 120, 205, { alpha: lin(lt, a1, a1 + 0.2), bg: GOLD });
      if (lt > a2) chip('LA GÉOMÉTRIE', 120, 260, { alpha: lin(lt, a2, a2 + 0.2), bg: '#ff4a6e' });
      ctx.globalAlpha = 1 - lin(lt, dur - 0.35, dur); // fondu vers le logo
      if (ctx.globalAlpha < 1) { ctx.fillStyle = `rgba(5,3,2,${1 - ctx.globalAlpha})`; ctx.globalAlpha = 1; ctx.fillRect(0, 0, SW, SH); }
    },
    logo(sc, lt) {
      bg(0.6); const a0 = at(sc, 0), dur = sc.end - sc.start;
      dust(lt, 70, 0.7, 3);
      const k = eo(lin(lt, 0.2, a0 + 0.4)); const img = IMG.get('assets/logo/odyssee-lockup-vertical.png');
      // halo
      const g = ctx.createRadialGradient(SW / 2, SH / 2 - 40, 10, SW / 2, SH / 2 - 40, 520); g.addColorStop(0, `rgba(255,180,58,${0.35 * k})`); g.addColorStop(1, 'rgba(255,180,58,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, SW, SH);
      if (img.width) { const h = 820 * (0.92 + 0.08 * k + lt * 0.006), w = h * img.width / img.height; ctx.save(); ctx.globalAlpha = k; ctx.drawImage(img, SW / 2 - w / 2, SH / 2 - h / 2 + 10, w, h); ctx.restore(); }
      // reflet qui balaie
      const sw = lin(lt, a0 + 0.2, a0 + 1.4); if (sw > 0 && sw < 1) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const x = -300 + sw * (SW + 600); const gg = ctx.createLinearGradient(x - 120, 0, x + 120, 0); gg.addColorStop(0, 'rgba(255,240,200,0)'); gg.addColorStop(0.5, 'rgba(255,240,200,.35)'); gg.addColorStop(1, 'rgba(255,240,200,0)'); ctx.fillStyle = gg; ctx.fillRect(0, 0, SW, SH); ctx.restore(); }
      ctx.fillStyle = `rgba(5,3,2,${lin(lt, dur - 0.3, dur)})`; ctx.fillRect(0, 0, SW, SH);
    },
    count(sc, lt) {
      bg(); const a0 = at(sc, 0), a1 = at(sc, 1), a2 = at(sc, 2), dur = sc.end - sc.start;
      const ids = IMG.games;
      // mur de vignettes qui se remplit pendant « cinquante et un jeux »
      const fill = lin(lt, a1, a2 + 0.6), cols = 8, rows = 6, tw = SW / cols, th = SH / rows;
      if (lt > a1 - 0.2) {
        ctx.save(); const z = 1 + 0.05 * lin(lt, a1, dur);
        ctx.translate(SW / 2, SH / 2); ctx.scale(z, z); ctx.translate(-SW / 2, -SH / 2);
        for (let i = 0; i < cols * rows; i++) {
          const ord = (i * 29) % (cols * rows); const on = clamp(fill * cols * rows * 1.05 - ord); if (on <= 0) continue;
          const x = (i % cols) * tw, y = Math.floor(i / cols) * th; ctx.globalAlpha = on * (lt > a2 ? 0.55 + 0.45 * Math.max(0, 1 - lin(lt, a2, a2 + 0.6)) : 0.85) * 0.75;
          cover(IMG.get(`assets/jeux/${ids[i % ids.length]}.jpg`), x + 3, y + 3, tw - 6, th - 6);
          if (lt > a2) { ctx.globalAlpha = 0.35 * Math.sin(clamp(lin(lt, a2 + ord * 0.012, a2 + ord * 0.012 + 0.5)) * Math.PI); ctx.fillStyle = GOLD; ctx.fillRect(x + 3, y + 3, tw - 6, th - 6); }
        }
        ctx.restore(); ctx.fillStyle = 'rgba(5,3,2,.55)'; ctx.fillRect(0, 0, SW, SH);
      }
      if (lt < a1 - 0.05) {
        const k = eo(lin(lt, a0 - 0.05, a0 + 0.3));
        text('UN JEU', SW / 2, SH / 2, { size: 190, w: 700, color: '#fff', alpha: k });
        const st = eo(lin(lt, wd(sc, 0, 4) - 0.1, wd(sc, 0, 4) + 0.3)); // « pas »
        if (st > 0) { ctx.beginPath(); ctx.moveTo(SW / 2 - 380, SH / 2 + 10); ctx.lineTo(SW / 2 - 380 + 760 * st, SH / 2 - 10); glowStroke(BRAISE, 12, 22); }
      } else {
        const n = Math.round(1 + 50 * eio(lin(lt, a1 + 0.1, wd(sc, 1, 4) + 0.2)));
        const pop = back(lin(lt, wd(sc, 1, 4) - 0.05, wd(sc, 1, 4) + 0.35));
        ctx.save(); ctx.translate(SW / 2, SH / 2 - 40); const s = 1 + 0.12 * pop * (n === 51 ? 1 : 0); ctx.scale(s, s);
        text(String(n), 0, 0, { size: 330, w: 700, metal: true, glow: 'rgba(255,160,40,.8)' }); ctx.restore();
        text('JEUX', SW / 2, SH / 2 + 170, { size: 70, w: 600, color: '#fff', ls: 30 });
        if (lt > a2) text('UN SEUL UNIVERS', SW / 2, SH / 2 + 260, { size: 30, fam: 'Jost', w: 500, color: CLAIR, ls: 14, alpha: lin(lt, a2, a2 + 0.3) });
      }
    },
    phi(sc, lt) {
      clip('phi', lt);
      const a0 = at(sc, 0), a1 = at(sc, 1), a2 = at(sc, 2), dur = sc.end - sc.start;
      chip('JEU Nº 1 · ODYSSÉE φ', 60, 110, { alpha: lin(lt, 0.2, 0.5) });
      const stat = (s, n, y, t0, c = GOLD) => { const k = eo(lin(lt, t0, t0 + 0.35)); if (k <= 0) return; panel(SW - 400 + (1 - k) * 80, y - 60, 340, 120, { alpha: k }); text(n, SW - 370 + (1 - k) * 80, y - 4, { size: 74, w: 700, metal: true, align: 'left', alpha: k }); text(s, SW - 250 + (1 - k) * 80, y, { size: 24, fam: 'Jost', w: 600, color: c, align: 'left', ls: 4, alpha: k }); };
      if (lt < a2) { stat('MONDES', '10', 200, wd(sc, 0, 10)); stat('GARDIENS', '10', 340, wd(sc, 0, 12)); }
      if (lt > a1 && lt < a2) { const k = eo(lin(lt, a1, a1 + 0.4)); poly('ico', 210 + Math.sin(lt * 3) * 20, 560, 120 * k, lt * 1.3, lt * 1.7, BRAISE, k * 0.95, 4); chip('POURSUITE · NIVEAU 10 DE CHAQUE MONDE', 60, 770, { alpha: k }); }
      if (lt > a2) {
        const k = eo(lin(lt, a2, a2 + 0.4)); panel(60, 560, 640, 250, { alpha: k });
        text('LA GRAINE', 90, 600, { size: 20, fam: 'Jost', w: 600, color: BRAISE, align: 'left', ls: 6, alpha: k });
        const typed = 'niveau(37) → toujours le même'; const n = Math.floor(typed.length * lin(lt, a2 + 0.3, wd(sc, 2, 12)));
        text(typed.slice(0, n) + (Math.sin(lt * 10) > 0 ? '▌' : ''), 90, 660, { size: 34, fam: 'Jost', w: 500, color: BLANC, align: 'left', alpha: k });
        const s1 = wd(sc, 2, 15), s2 = wd(sc, 2, 18);
        if (lt > s1) chip('TU L’APPRENDS', 90, 740, { alpha: lin(lt, s1, s1 + 0.2), bg: GOLD });
        if (lt > s2) chip('TU LE MAÎTRISES', 380, 740, { alpha: lin(lt, s2, s2 + 0.2) });
        const lv = Math.round(37 * eo(lin(lt, a2 + 0.2, wd(sc, 2, 10))));
        panel(SW - 400, 150, 340, 230, { alpha: k }); text('NIVEAU', SW - 230, 205, { size: 22, fam: 'Jost', w: 600, color: CLAIR, ls: 8, alpha: k }); text(String(lv), SW - 230, 300, { size: 120, w: 700, metal: true, alpha: k });
      }
      ctx.fillStyle = `rgba(5,3,2,${lin(lt, dur - 0.25, dur)})`; ctx.fillRect(0, 0, SW, SH);
    },
    infini(sc, lt) {
      clip('infini', lt);
      const a0 = at(sc, 0), a1 = at(sc, 1), a2 = at(sc, 2), dur = sc.end - sc.start;
      chip('ODYSSÉE ∞ · LA GLISSE SANS FIN', 60, 110, { alpha: lin(lt, 0.2, 0.5) });
      const verbs = [['COURS', 3], ['VOLE', 5], ['PLONGE', 7]];
      verbs.forEach(([v, j], i) => { const t0 = wd(sc, 0, j); if (lt > t0 && lt < a1) chip(v, 60 + i * 190, 175, { alpha: lin(lt, t0, t0 + 0.15), bg: i === 2 ? GOLD : BRAISE, size: 30 }); });
      if (lt > a1 && lt < a2) {
        const k = eo(lin(lt, a1, a1 + 0.4)); panel(SW - 470, 150, 410, 200, { alpha: k });
        text('OXYGÈNE', SW - 440, 195, { size: 22, fam: 'Jost', w: 600, color: CLAIR, ls: 8, align: 'left', alpha: k });
        const o2 = 14 * (1 - lin(lt, wd(sc, 1, 7), a2 + 0.3)); text(o2.toFixed(1) + ' s', SW - 440, 270, { size: 70, w: 700, metal: true, align: 'left', alpha: k });
        rrect(SW - 440, 315, 350, 10, 5); ctx.fillStyle = 'rgba(255,224,138,.15)'; ctx.fill(); rrect(SW - 440, 315, 350 * o2 / 14, 10, 5); ctx.fillStyle = o2 < 5 ? '#ff4a3c' : BRAISE; ctx.fill();
      }
      if (lt > a2) {
        const k = eo(lin(lt, a2, a2 + 0.4)); const sp = 40 + 400 * Math.pow(lin(lt, a2, dur), 1.6);
        panel(SW - 470, 150, 410, 200, { alpha: k }); text('VITESSE', SW - 440, 195, { size: 22, fam: 'Jost', w: 600, color: CLAIR, ls: 8, align: 'left', alpha: k });
        text(Math.round(sp) + ' km/h', SW - 440, 270, { size: 64, w: 700, metal: true, align: 'left', alpha: k });
        if (lt > wd(sc, 2, 5)) chip('SANS PLAFOND', SW - 440, 320, { alpha: lin(lt, wd(sc, 2, 5), wd(sc, 2, 5) + 0.2), bg: GOLD });
      }
      ctx.fillStyle = `rgba(5,3,2,${lin(lt, dur - 0.25, dur)})`; ctx.fillRect(0, 0, SW, SH);
    },
    omega(sc, lt) {
      clip('omega', lt, { zoom: 1.06 });
      const a1 = at(sc, 1), dur = sc.end - sc.start;
      chip('ODYSSÉE Ω · LE DUEL DES GARDIENS', 60, 110, { alpha: lin(lt, 0.2, 0.5) });
      if (lt > a1) {
        const k = eo(lin(lt, a1, a1 + 0.3)); const n = Math.round(50 * eo(lin(lt, a1, wd(sc, 1, 1) + 0.2)));
        panel(SW - 400, 150, 340, 210, { alpha: k }); text(String(n), SW - 230, 245, { size: 120, w: 700, metal: true, alpha: k }); text('GARDIENS', SW - 230, 325, { size: 22, fam: 'Jost', w: 600, color: CLAIR, ls: 8, alpha: k });
        const c1 = wd(sc, 1, 2), c2 = wd(sc, 1, 5);
        if (lt > c1) chip('CAMPAGNE', SW - 400, 410, { alpha: lin(lt, c1, c1 + 0.2), bg: GOLD });
        if (lt > c2) chip('DUEL', SW - 220, 410, { alpha: lin(lt, c2, c2 + 0.2) });
      }
      ctx.fillStyle = `rgba(5,3,2,${lin(lt, dur - 0.2, dur)})`; ctx.fillRect(0, 0, SW, SH);
    },
    montage(sc, lt) {
      const L = sc.lines; let i = 0; for (let k = 0; k < L.length; k++) if (lt >= at(sc, k) - 0.12) i = k;
      const li = L[i], l0 = lt - (at(sc, i) - 0.12), ln = (i + 1 < L.length ? at(sc, i + 1) : sc.end - sc.start) - at(sc, i);
      bg();
      if (!li.clip) { // « Et ça continue. »
        const k = eo(lin(l0, 0, 0.3)); text('ET ÇA', SW / 2, SH / 2 - 80, { size: 90, w: 600, color: '#fff', alpha: k }); text('CONTINUE.', SW / 2, SH / 2 + 60, { size: 150, w: 700, metal: true, glow: 'rgba(255,160,40,.7)', alpha: eo(lin(l0, 0.25, 0.5)) });
      } else if (li.clip === 'beta') {
        cover(IMG.get('assets/jeux/beta.jpg'), 0, 0, SW, SH, 1.08 + l0 * 0.04, 0.5 - l0 * 0.02);
      } else if (li.clip === 'sports') {
        const S = [['qop', 'TENNIS', 0], ['ado', 'BOWLING', 2], ['pom', 'MINIGOLF', 4], ['yps', 'TIRS AU BUT', 6]];
        S.forEach(([id, name, j], q) => { const t0 = wd(sc, i, j) - (at(sc, i) - 0.12); const k = eo(lin(l0, t0 - 0.05, t0 + 0.25)); if (k <= 0) return; const x = (q % 2) * SW / 2, y = Math.floor(q / 2) * SH / 2; ctx.save(); ctx.globalAlpha = k; cover(IMG.get(`assets/jeux/${id}.jpg`), x + 6, y + 6, SW / 2 - 12, SH / 2 - 12, 1.1 - 0.1 * k); ctx.restore(); chip(name, x + 30, y + 50, { alpha: k }); });
      } else if (li.clip === 'wall') {
        const ids = IMG.games, cols = 12, z = 2.2 - 1.2 * eo(lin(l0, 0, ln)), tw = SW / cols, th = tw * 9 / 16;
        ctx.save(); ctx.translate(SW / 2, SH / 2); ctx.scale(z, z); ctx.translate(-SW / 2, -SH / 2);
        for (let r = -1; r < 10; r++) for (let c = 0; c < cols; c++) { const n = (r + 1) * cols + c; ctx.globalAlpha = 0.85; cover(IMG.get(`assets/jeux/${ids[(n * 7) % ids.length]}.jpg`), c * tw + 3, r * th + 3 + ((c % 2) * th / 2 - lt * 30) % th, tw - 6, th - 6); }
        ctx.restore(); ctx.fillStyle = 'rgba(5,3,2,.45)'; ctx.fillRect(0, 0, SW, SH);
        const k = eo(lin(l0, 0.2, 0.6)); text('51', SW / 2, SH / 2 - 30, { size: 220, w: 700, metal: true, glow: 'rgba(255,160,40,.85)', alpha: k }); text('JEUX · ET ÇA CONTINUE', SW / 2, SH / 2 + 120, { size: 34, fam: 'Jost', w: 600, color: '#fff', ls: 10, alpha: k });
      } else {
        clip(li.clip, l0, { zoom: 1.02 });
      }
      if (li.label) { // titre du jeu, façon carte
        const k = eo(lin(l0, 0.05, 0.3)); const w = 520;
        ctx.save(); ctx.globalAlpha = k; const g = ctx.createLinearGradient(0, SH - 340, 0, SH); g.addColorStop(0, 'rgba(5,3,2,0)'); g.addColorStop(0.55, 'rgba(5,3,2,.8)'); g.addColorStop(1, 'rgba(5,3,2,.97)'); ctx.fillStyle = g; ctx.fillRect(0, SH - 340, SW, 340); ctx.restore();
        text(li.label, 70 + (1 - k) * -40, SH - 140, { size: 84, w: 600, metal: true, align: 'left', glow: 'rgba(255,160,40,.6)', alpha: k });
        chip(li.sub.toUpperCase(), 72, SH - 70, { alpha: k, k: eo(lin(l0, 0.15, 0.5)) });
        // compteur
        text(`${String(i).padStart(2, '0')} / 51`, SW - 70, SH - 70, { size: 22, fam: 'Jost', w: 600, color: CLAIR, align: 'right', ls: 6, alpha: k });
      }
      // coupe : petit flash à chaque changement
      const f = 1 - lin(l0, 0, 0.12); if (f > 0 && i > 0) { ctx.fillStyle = `rgba(255,241,194,${0.35 * f})`; ctx.fillRect(0, 0, SW, SH); }
    },

    // un jeu en détail : gameplay plein écran, titre, et ses mécaniques qui s'affichent au fil de la voix
    game(sc, lt) {
      const dur = sc.end - sc.start;
      clip(sc.clip, lt, { zoom: 1.03, push: 0.003 });
      // voile à gauche pour la lisibilité
      const g = ctx.createLinearGradient(0, 0, SW * 0.55, 0); g.addColorStop(0, 'rgba(5,3,2,.78)'); g.addColorStop(1, 'rgba(5,3,2,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, SW * 0.55, SH);
      const k = eo(lin(lt, 0.05, 0.4));
      chip(`JEU Nº ${sc.num} · ${sc.kicker.toUpperCase()}`, 60, 110, { alpha: k, k });
      text(sc.label, 60 + (1 - k) * -50, 210, { size: 96, w: 600, metal: true, align: 'left', glow: 'rgba(255,160,40,.6)', alpha: k });
      // mécaniques
      const chips = sc.chips || []; let last = -1; chips.forEach((c, q) => { if (lt >= c.t - sc.start - 0.05) last = q; });
      chips.forEach((c, q) => {
        const t0 = c.t - sc.start - 0.05; const kk = back(lin(lt, t0, t0 + 0.3)); if (kk <= 0) return;
        const y = 330 + q * 82, on = q === last;
        ctx.save(); ctx.translate(60 + (1 - clamp(kk)) * -60, y); ctx.globalAlpha = clamp(kk * 1.5);
        const w = measure(c.text, 30, 600, 'Jost', 3) + 90; rrect(0, -30, w, 60, 10);
        ctx.fillStyle = on ? BRAISE : 'rgba(13,9,4,.86)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = on ? '#ffb46a' : 'rgba(255,201,60,.5)'; ctx.shadowColor = BRAISE; ctx.shadowBlur = on ? 26 : 0; ctx.stroke(); ctx.shadowBlur = 0;
        ctx.beginPath(); ctx.moveTo(20, 1); ctx.lineTo(30, 11); ctx.lineTo(48, -10); ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.strokeStyle = on ? '#1a0d02' : GOLD; ctx.stroke();
        text(c.text, 66, 2, { size: 30, fam: 'Jost', w: 600, color: on ? '#1a0d02' : '#fff', align: 'left', ls: 3 });
        ctx.restore();
      });
      text(`${String(sc.num).padStart(2, '0')} / 51`, SW - 64, SH - 116, { size: 22, fam: 'Jost', w: 600, color: CLAIR, align: 'right', ls: 6, alpha: k });
      const f = 1 - lin(lt, 0, 0.14); if (f > 0) { ctx.fillStyle = `rgba(255,241,194,${0.4 * f})`; ctx.fillRect(0, 0, SW, SH); }
      ctx.fillStyle = `rgba(5,3,2,${0.8 * lin(lt, dur - 0.15, dur)})`; ctx.fillRect(0, 0, SW, SH);
    },
    trans(sc, lt) {
      bg(); grid(lt, 0.1); dust(lt, 50, 0.6, 11);
      const k = eo(lin(lt, 0.1, 0.4)), w = sc.lines[0].words, wd5 = w[Math.min(5, w.length - 1)].s - sc.start;
      text("CE N'EST QUE", SW / 2, SH / 2 - 90, { size: 80, w: 600, color: '#fff', alpha: k });
      text('LE DÉBUT.', SW / 2, SH / 2 + 40, { size: 170, w: 700, metal: true, glow: 'rgba(255,160,40,.8)', alpha: eo(lin(lt, wd5 - 0.3, wd5)) });
      const ids = IMG.games; const kk = lin(lt, 1.4, sc.end - sc.start);
      for (let q = 0; q < 14; q++) { const a = q / 14 * Math.PI * 2 + lt * 0.3, x = SW / 2 + Math.cos(a) * 640, y = SH / 2 + Math.sin(a) * 330; ctx.save(); ctx.globalAlpha = 0.5 * eo(clamp(kk * 3 - q * 0.1)); cover(IMG.get(`assets/jeux/${ids[(q * 3 + 2) % ids.length]}.jpg`), x - 80, y - 45, 160, 90); ctx.restore(); }
    },
    workflow(sc, lt) {
      bg(); grid(lt, 0.1);
      const a1 = at(sc, 1), dur = sc.end - sc.start;
      if (lt < a1 - 0.1) {
        { const w1 = measure('UN JEU MOBILE ', 34, 600, 'Jost', 4), w2 = measure('CLASSIQUE', 34, 600, 'Jost', 4), x0 = SW / 2 - (w1 + w2) / 2;
          text('UN JEU MOBILE ', x0, 150, { size: 34, fam: 'Jost', w: 600, color: '#fff', ls: 4, align: 'left' }); text('CLASSIQUE', x0 + w1, 150, { size: 34, fam: 'Jost', w: 600, color: BRAISE, ls: 4, align: 'left' }); }
        const steps = [['OUVRIR LE STORE', 5, '+2 MIN'], ['TÉLÉCHARGER · 300 Mo', 9, '+8 MIN'], ['CRÉER UN COMPTE', 14, '+4 MIN'], ['ATTENDRE LA MISE À JOUR', 19, '+6 MIN']];
        let mins = 0;
        steps.forEach(([s, j, m], q) => {
          const t0 = wd(sc, 0, j); const k = eo(lin(lt, t0 - 0.1, t0 + 0.3)); if (k <= 0) return;
          mins += [2, 8, 4, 6][q] * eo(lin(lt, t0, t0 + 0.6));
          const y = 260 + q * 120; panel(260, y, 780, 86, { alpha: k, stroke: 'rgba(255,74,60,.55)' });
          ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = '#ff4a3c'; ctx.fillRect(272, y + 14, 6, 58); ctx.restore();
          text(s, 300, y + 44, { size: 30, fam: 'Jost', w: 600, color: '#fff', align: 'left', ls: 3, alpha: k });
          // barre de progression lente
          const pb = lin(lt, t0, t0 + 3.5); rrect(760, y + 36, 180, 14, 7); ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fill(); rrect(760, y + 36, 180 * pb, 14, 7); ctx.fillStyle = 'rgba(255,74,60,.8)'; ctx.fill();
          text(m, 1010, y + 44, { size: 22, fam: 'Jost', w: 600, color: '#ff6a50', align: 'right', alpha: k });
        });
        const km = clamp(mins * 2); text('TEMPS PERDU', 1290, 300, { size: 20, fam: 'Jost', w: 600, color: CLAIR, ls: 6, alpha: km });
        text(`${Math.max(1, Math.round(mins))} MIN`, 1290, 390, { size: 110, w: 700, color: '#ff5a3c', glow: 'rgba(255,74,60,.7)', alpha: km });
      } else {
        const k = eo(lin(lt, a1 - 0.1, a1 + 0.3));
        text('ODYSSÉE', SW / 2, 170, { size: 60, w: 700, metal: true, alpha: k, ls: 12 });
        const n1 = eo(lin(lt, wd(sc, 1, 1) - 0.1, wd(sc, 1, 1) + 0.25)), n2 = eo(lin(lt, wd(sc, 1, 3) - 0.1, wd(sc, 1, 3) + 0.25));
        const y = 470;
        const box = (s, x, kk, fill) => { if (kk <= 0) return; ctx.save(); ctx.globalAlpha = kk; rrect(x - 170, y - 60, 340, 120, 16); ctx.fillStyle = fill ? BRAISE : 'rgba(13,9,4,.9)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = BRAISE; ctx.shadowColor = BRAISE; ctx.shadowBlur = 30; ctx.stroke(); ctx.restore(); text(s, x, y + 3, { size: 46, w: 700, color: fill ? '#1a0d02' : '#fff', alpha: kk }); };
        box('CLIQUE', SW / 2 - 300, n1, false);
        if (n2 > 0) { ctx.beginPath(); ctx.moveTo(SW / 2 - 130, y); ctx.lineTo(SW / 2 - 130 + 260 * n2, y); glowStroke(GOLD, 4, 16); node(SW / 2 + 130 * n2 * 0 + 130, y, 9); }
        box('JOUE', SW / 2 + 300, n2, true);
        if (lt > wd(sc, 1, 3) + 0.3) { const kk = eo(lin(lt, wd(sc, 1, 3) + 0.3, wd(sc, 1, 3) + 0.6)); text('TEMPS PERDU', SW / 2, 670, { size: 20, fam: 'Jost', w: 600, color: CLAIR, ls: 6, alpha: kk }); text('0 MIN', SW / 2, 750, { size: 90, w: 700, metal: true, glow: 'rgba(255,160,40,.7)', alpha: kk }); }
      }
      ctx.fillStyle = `rgba(5,3,2,${lin(lt, dur - 0.25, dur)})`; ctx.fillRect(0, 0, SW, SH);
    },
    features(sc, lt) {
      bg(); grid(lt, 0.08); dust(lt, 25, 0.35, 5);
      const L = sc.lines; let i = 0; for (let k = 0; k < L.length; k++) if (lt >= at(sc, k) - 0.1) i = k;
      const l0 = lt - (at(sc, i) - 0.1), k = eo(lin(l0, 0, 0.35));
      if (i === 0) { // navigateur
        const x = 300, y = 170, w = 1000, h = 560; panel(x, y, w, h, { alpha: k, r: 18 });
        ctx.save(); ctx.globalAlpha = k; [BRAISE, GOLD, CLAIR].forEach((c, q) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + 34 + q * 26, y + 32, 8, 0, 7); ctx.fill(); });
        rrect(x + 130, y + 14, 600, 36, 18); ctx.fillStyle = 'rgba(255,224,138,.1)'; ctx.fill(); ctx.restore();
        const url = 'odysseegames.com', n = Math.floor(url.length * lin(l0, 0.2, 1.0));
        text(url.slice(0, n), x + 156, y + 33, { size: 22, fam: 'Jost', w: 500, color: BLANC, align: 'left', alpha: k });
        ctx.save(); ctx.globalAlpha = k * lin(l0, 1.0, 1.4); cover(IMG.get('assets/jeux/phi.jpg'), x + 14, y + 64, w - 28, h - 78); ctx.restore();
        if (lt > wd(sc, 0, 4)) { const kk = back(lin(lt, wd(sc, 0, 4), wd(sc, 0, 4) + 0.35)); ctx.save(); ctx.translate(SW / 2, y + h - 20); ctx.rotate(-0.04); ctx.scale(kk, kk); chip('RIEN À INSTALLER', 0, 0, { align: 'center', size: 40 }); ctx.restore(); }
      } else if (i === 1 || i === 2) { // téléphones
        const ph = (cx, label, sub, kk, on) => { if (kk <= 0) return; ctx.save(); ctx.globalAlpha = kk * (on ? 1 : 0.45); const w = 250, h = 500, x = cx - w / 2, y = 170 + (1 - kk) * 60; rrect(x, y, w, h, 38); ctx.fillStyle = '#0d0904'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = GOLD2; ctx.shadowColor = 'rgba(255,180,58,.7)'; ctx.shadowBlur = on ? 30 : 6; ctx.stroke(); ctx.shadowBlur = 0; ctx.beginPath(); ctx.roundRect(x + 14, y + 14, w - 28, h - 28, 28); ctx.clip(); cover(IMG.get(`assets/jeux/${label === 'ANDROID' ? 'infini' : 'omicron'}.jpg`), x + 14, y + 14, w - 28, h - 28, 1, 0.5); ctx.restore(); text(label, cx, 720, { size: 30, fam: 'Jost', w: 600, color: '#fff', ls: 8, alpha: kk * (on ? 1 : 0.45) }); text(sub, cx, 770, { size: 24, fam: 'Jost', w: 500, color: on ? GOLD : CLAIR, ls: 3, alpha: kk * (on ? 1 : 0.45) }); };
        const kA = eo(lin(lt, at(sc, 1) - 0.1, at(sc, 1) + 0.3)), kI = eo(lin(lt, at(sc, 2) - 0.1, at(sc, 2) + 0.3));
        ph(SW / 2 - 260, 'ANDROID', "L'APPLI (APK)", kA, i === 1); ph(SW / 2 + 260, 'IPHONE', 'PARTAGER → ÉCRAN D’ACCUEIL', kI, i === 2);
        if (i === 1 && lt > wd(sc, 1, 5)) { const kk = back(lin(lt, wd(sc, 1, 5), wd(sc, 1, 5) + 0.4)); ctx.save(); ctx.translate(SW / 2 + 90, 400); ctx.scale(kk, kk); ctx.rotate(-0.06); text('< 1 Mo', 0, 0, { size: 80, w: 700, metal: true, glow: 'rgba(255,160,40,.8)' }); ctx.restore(); }
        if (i === 2) { const kk = back(lin(l0, 0.6, 1.0)); ctx.save(); ctx.translate(SW / 2 + 260 + 150, 280); ctx.scale(kk, kk); rrect(-55, -55, 110, 110, 24); ctx.fillStyle = BRAISE; ctx.fill(); text('+', 0, 4, { size: 90, w: 700, color: '#1a0d02', fam: 'Jost' }); ctx.restore(); }
      } else if (i === 3) { // 13 langues
        const langs = ['Français', 'English', 'Español', 'Português', 'Deutsch', 'Italiano', 'العربية', 'Русский', 'Türkçe', '中文', '日本語', '한국어', 'हिन्दी'];
        const n = Math.floor(clamp(l0 / 0.9) * 12.99);
        langs.forEach((s, q) => { const a = q * Math.PI * 2 / 13 + lt * 0.25, r = 330; const on = q <= n; text(s, SW / 2 + Math.cos(a) * r * 1.35, SH / 2 + Math.sin(a) * r * 0.95, { size: 34, fam: 'Jost', w: 500, color: on ? BLANC : 'rgba(255,224,138,.25)', glow: on ? 'rgba(255,180,58,.5)' : null, blur: 14, alpha: k }); });
        text(String(n + 1), SW / 2, SH / 2 - 30, { size: 200, w: 700, metal: true, glow: 'rgba(255,160,40,.8)', alpha: k }); text('LANGUES', SW / 2, SH / 2 + 100, { size: 34, fam: 'Jost', w: 600, color: '#fff', ls: 16, alpha: k });
      } else { // classement mondial
        text('CLASSEMENT MONDIAL', SW / 2, 120, { size: 44, w: 700, metal: true, alpha: k, ls: 6 });
        const rows = [['NOVA', 48210], ['KAÏ', 45980], ['MIRA', 41730], ['ZED', 39100], ['LUNA', 36540], ['TOI', 0]];
        const climb = eo(lin(l0, 0.8, wd(sc, 4, 8) - (at(sc, 4) - 0.1))); const myScore = Math.round(30000 + 20510 * climb);
        const pos = 5 - Math.min(5, Math.floor(climb * 5.999)); // rang du joueur (0 = premier)
        const others = rows.slice(0, 5); const list = [...others]; list.splice(pos, 0, ['TOI', myScore]);
        list.forEach(([name, sc2], q) => { const y = 210 + q * 92, me = name === 'TOI'; const kk = eo(lin(l0, 0.1 + q * 0.06, 0.4 + q * 0.06)); panel(400, y, 800, 76, { alpha: kk, fill: me ? 'rgba(255,122,26,.92)' : 'rgba(13,9,4,.88)', glow: me ? 34 : 10 }); text(`#${q + 1}`, 440, y + 39, { size: 30, fam: 'Jost', w: 600, color: me ? '#1a0d02' : CLAIR, align: 'left', alpha: kk }); text(name, 540, y + 39, { size: 32, fam: 'Jost', w: 600, color: me ? '#1a0d02' : '#fff', align: 'left', ls: 4, alpha: kk }); text(sc2.toLocaleString('fr-FR'), 1160, y + 39, { size: 32, fam: 'Jost', w: 600, color: me ? '#1a0d02' : GOLD, align: 'right', alpha: kk }); });
        const ts = wd(sc, 4, 11) - (at(sc, 4) - 0.1); if (l0 > ts) { const kk = back(lin(l0, ts, ts + 0.35)); ctx.save(); ctx.translate(SW / 2, 800); ctx.rotate(-0.05); ctx.scale(kk, kk); ctx.lineWidth = 5; ctx.strokeStyle = GOLD; ctx.shadowColor = GOLD; ctx.shadowBlur = 20; rrect(-160, -40, 320, 80, 10); ctx.stroke(); ctx.shadowBlur = 0; text('POUR TOUJOURS', 0, 3, { size: 34, w: 700, color: GOLD }); ctx.restore(); }
      }
    },
    climax(sc, lt) {
      const a1 = at(sc, 1), a2 = at(sc, 2), dur = sc.end - sc.start;
      if (lt < a2 - 0.05) {
        bg(); dust(lt, 50, 0.5, 7);
        if (lt < a1 - 0.05) {
          const k = eo(lin(lt, 0, 0.4)); text('LA VRAIE QUESTION', SW / 2, 200, { size: 26, fam: 'Jost', w: 600, color: CLAIR, ls: 12, alpha: k });
          const q0 = wd(sc, 0, 6); const kq = eo(lin(lt, q0 - 0.1, q0 + 0.3)); text("EST-CE QUE C'EST BIEN ?", SW / 2, SH / 2, { size: 92, w: 700, color: '#fff', alpha: kq });
          const st = eo(lin(lt, lineEnd(sc, 0) - 0.1, lineEnd(sc, 0) + 0.3)); if (st > 0) { ctx.beginPath(); ctx.moveTo(SW / 2 - 640, SH / 2 + 6); ctx.lineTo(SW / 2 - 640 + 1280 * st, SH / 2 - 6); glowStroke(BRAISE, 10, 20); }
        } else {
          // la porte d'or au loin, le bonhomme marche vers elle
          const k = eo(lin(lt, a1 - 0.05, a1 + 0.4));
          const img = IMG.get('assets/logo/odyssee-symbole.png'); if (img.width) { const h = 560 + 80 * lin(lt, a1, a2), w = h * img.width / img.height; ctx.save(); ctx.globalAlpha = 0.35 * k; ctx.drawImage(img, SW / 2 - w / 2, SH / 2 - h / 2 + 40, w, h); ctx.restore(); }
          text("JUSQU'OÙ", SW / 2, SH / 2 - 70, { size: 140, w: 700, color: '#fff', glow: 'rgba(255,241,194,.5)', alpha: k });
          text('TU VAS ALLER ?', SW / 2, SH / 2 + 80, { size: 110, w: 700, metal: true, glow: 'rgba(255,160,40,.8)', alpha: eo(lin(lt, wd(sc, 1, 3) - 0.1, wd(sc, 1, 3) + 0.3)) });
        }
      } else {
        // écran orange plein, comme « STRETCH. » dans la référence
        const k = lin(lt, a2 - 0.05, a2 + 0.08);
        ctx.fillStyle = NOIR; ctx.fillRect(0, 0, SW, SH);
        ctx.globalAlpha = k; const g = ctx.createRadialGradient(SW / 2, SH / 2, 50, SW / 2, SH / 2, SW * 0.7); g.addColorStop(0, '#ffa04a'); g.addColorStop(1, '#ff7a1a'); ctx.fillStyle = g; ctx.fillRect(0, 0, SW, SH); ctx.globalAlpha = 1;
        const p = back(lin(lt, a2, a2 + 0.4)); ctx.save(); ctx.translate(SW / 2, SH / 2); ctx.scale(0.8 + 0.2 * p, 0.8 + 0.2 * p);
        text('COMMENCE', 0, -75, { size: 120, w: 700, color: '#2a1405' }); text('TON ODYSSÉE.', 0, 75, { size: 120, w: 700, color: '#2a1405' }); ctx.restore();
        ctx.fillStyle = `rgba(255,241,194,${lin(lt, dur - 0.3, dur)})`; ctx.fillRect(0, 0, SW, SH);
      }
    },
    cta(sc, lt) {
      bg(0.8); dust(lt, 60, 0.6, 9);
      const k = eo(lin(lt, 0, 0.6)); const img = IMG.get('assets/logo/odyssee-lockup-horizontal.png');
      ctx.fillStyle = `rgba(255,241,194,${1 - lin(lt, 0, 0.5)})`; ctx.fillRect(0, 0, SW, SH);
      if (img.width) { const w = 1050, h = w * img.height / img.width; ctx.save(); ctx.globalAlpha = k; ctx.drawImage(img, SW / 2 - w / 2, 150, w, h); ctx.restore(); }
      const u = eo(lin(lt, wd(sc, 0, 3) - 0.1, wd(sc, 0, 3) + 0.4));
      ctx.save(); ctx.globalAlpha = u; rrect(SW / 2 - 330, 640, 660, 96, 48); ctx.fillStyle = 'rgba(13,9,4,.9)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = GOLD; ctx.shadowColor = GOLD; ctx.shadowBlur = 30; ctx.stroke(); ctx.restore();
      text('odysseegames.com', SW / 2, 690, { size: 50, fam: 'Jost', w: 500, color: BLANC, alpha: u, ls: 3 });
      text('ANDROID · IPHONE · ORDINATEUR', SW / 2, 800, { size: 22, fam: 'Jost', w: 600, color: GOLD2, ls: 10, alpha: u });
    },
  };

  function draw(t) {
    let sc = TL.scenes[TL.scenes.length - 1]; for (const s of TL.scenes) if (t >= s.start && t < s.end) { sc = s; break; }
    const lt = t - sc.start; ctx.setTransform(1.2, 0, 0, 1.2, 0, 0); ctx.save(); DRAW[sc.type === 'game' ? 'game' : sc.id](sc, lt); ctx.restore();
    ctx.save(); chrome(t, curLine(sc, t)); ctx.restore();
    // lignes de balayage très légères (écran)
    
    return sc;
  }
  return { canvas: cv, ctx, draw, scenes };
}
