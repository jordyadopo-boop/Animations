// Habillage « reconstitution » : sous-titres mot à mot (mots-clés en jaune), encadrés de données, jauges.
import { PI, clamp, range, lerp, eout } from './bonhomme.js';
import { EN } from './traductions.js';

export const YEL = '#ffc928', RED = '#ff3b3b', ORA = '#ff7a1a', INK = 'rgba(14,16,22,0.88)';
const FONT = (w, s) => `${w} ${s}px Inter, 'Liberation Sans', sans-serif`;
const MONO = (w, s) => `${w} ${s}px 'JetBrains Mono', monospace`;

// sous-titre mot à mot : les mots entre *étoiles* sont en jaune ; la traduction anglaise s'affiche dessous
export function kcap(ctx, W, text, t, t0, t1, y = 950, size = 58) {
  if (t < t0 || t > t1 + 0.4) return;
  const out = 1 - range(t, t1, t1 + 0.4), plain = text.replace(/\*/g, '');
  const lines = text.split('\n').map((l) => l.split(' ').filter(Boolean));
  const total = lines.flat().length, per = Math.min(0.16, (t1 - t0) * 0.45 / total);
  ctx.save(); ctx.textBaseline = 'alphabetic'; ctx.font = FONT(900, size); ctx.lineJoin = 'round';
  let n = 0; const lh = size * 1.12, y0 = y - (lines.length - 1) * lh;
  lines.forEach((ws, li) => {
    const parts = ws.map((w) => ({ hl: /\*/.test(w), w: w.replace(/\*/g, '') }));
    const sp = size * 0.28, wid = parts.reduce((s, p) => s + ctx.measureText(p.w).width, 0) + sp * (parts.length - 1);
    let x = W / 2 - wid / 2;
    parts.forEach((p) => {
      const k = eout(range(t, t0 + n * per, t0 + n * per + 0.18)); n++;
      const w = ctx.measureText(p.w).width;
      if (k > 0) { ctx.save(); ctx.globalAlpha = k * out; ctx.translate(x + w / 2, y0 + li * lh); ctx.scale(0.7 + 0.3 * k, 0.7 + 0.3 * k);
        ctx.strokeStyle = 'rgba(0,0,0,0.85)'; ctx.lineWidth = size * 0.16; ctx.textAlign = 'center'; ctx.strokeText(p.w, 0, 0); ctx.fillStyle = p.hl ? YEL : '#ffffff'; ctx.fillText(p.w, 0, 0); ctx.restore(); }
      x += w + sp;
    });
  });
  const en = EN[plain];
  if (en) { const k = range(t, t0 + 0.3, t0 + 0.9) * out; ctx.globalAlpha = k; ctx.font = FONT('italic 600', Math.round(size * 0.5)); ctx.textAlign = 'center'; ctx.fillStyle = '#d6dcea'; ctx.strokeStyle = 'rgba(0,0,0,0.8)'; ctx.lineWidth = 6;
    en.split('\n').forEach((l, i) => { const yy = y + size * 0.78 + i * size * 0.6; ctx.strokeText(l, W / 2, yy); ctx.fillText(l, W / 2, yy); }); }
  ctx.restore();
}

// encadré sombre à coins arrondis
export function panel(ctx, x, y, w, h, a = 1, border = 'rgba(255,255,255,0.14)') { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = INK; ctx.strokeStyle = border; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(x, y, w, h, 14); ctx.fill(); ctx.stroke(); ctx.restore(); }
// petite étiquette en capitales (mono)
export function label(ctx, x, y, text, col = '#aab2c4', size = 18, a = 1, align = 'left') { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.font = MONO(700, size); ctx.fillStyle = col; ctx.textAlign = align; try { ctx.letterSpacing = '2px'; } catch (e) {} ctx.fillText(text, x, y); ctx.restore(); }
export function big(ctx, x, y, text, col = '#fff', size = 64, a = 1, align = 'left', w = 900) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.font = FONT(w, size); ctx.fillStyle = col; ctx.textAlign = align; ctx.fillText(text, x, y); ctx.restore(); }
// bandeau d'accroche jaune (titre-choc)
export function hookBox(ctx, cx, y, text, sub, a = 1, size = 96) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.font = FONT(900, size); const w = ctx.measureText(text).width + 60;
  ctx.fillStyle = YEL; ctx.beginPath(); ctx.roundRect(cx - w / 2, y - size * 0.92, w, size * 1.14, 10); ctx.fill();
  ctx.fillStyle = '#111'; ctx.textAlign = 'center'; ctx.fillText(text, cx, y);
  if (sub) { ctx.font = FONT(800, size * 0.46); ctx.fillStyle = '#fff'; ctx.strokeStyle = 'rgba(0,0,0,0.8)'; ctx.lineWidth = 8; ctx.lineJoin = 'round'; ctx.strokeText(sub, cx, y + size * 0.72); ctx.fillText(sub, cx, y + size * 0.72); }
  ctx.restore();
}
// alerte rouge clignotante
export function alarm(ctx, cx, y, text, t, a = 1, size = 80) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.font = FONT(900, size); const w = ctx.measureText(text).width + 60, on = Math.sin(t * 12) > -0.3;
  ctx.fillStyle = RED; ctx.shadowColor = RED; ctx.shadowBlur = on ? 40 : 10; ctx.beginPath(); ctx.roundRect(cx - w / 2, y - size * 0.95, w, size * 1.2, 10); ctx.fill(); ctx.shadowBlur = 0; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText(text, cx, y); ctx.restore(); }
// coins de cadre façon viseur
export function corners(ctx, W, H, a = 1, m = 40, L = 60) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a * 0.6; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath();
  [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]].forEach(([x, y, sx, sy]) => { ctx.moveTo(x, y + sy * L); ctx.lineTo(x, y); ctx.lineTo(x + sx * L, y); }); ctx.stroke(); ctx.restore(); }
// jauge de batterie (0..1), rouge quand elle est vide, éclair quand elle charge
export function battery(ctx, x, y, v, t, a = 1, charging = false) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; const w = 190, h = 74;
  const col = v > 0.5 ? '#46d37a' : v > 0.2 ? YEL : RED, blink = v < 0.06 && !charging && Math.sin(t * 10) < 0;
  ctx.strokeStyle = '#e6e9f2'; ctx.lineWidth = 5; ctx.beginPath(); ctx.roundRect(x, y, w, h, 12); ctx.stroke(); ctx.fillStyle = '#e6e9f2'; ctx.fillRect(x + w + 4, y + h * 0.3, 10, h * 0.4);
  if (!blink) { ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 16; ctx.beginPath(); ctx.roundRect(x + 9, y + 9, Math.max(6, (w - 18) * clamp(v)), h - 18, 6); ctx.fill(); ctx.shadowBlur = 0; }
  if (charging) { ctx.fillStyle = '#fff'; ctx.beginPath(); const cx = x + w / 2, cy = y + h / 2; ctx.moveTo(cx + 6, cy - 28); ctx.lineTo(cx - 16, cy + 4); ctx.lineTo(cx - 1, cy + 4); ctx.lineTo(cx - 6, cy + 28); ctx.lineTo(cx + 16, cy - 4); ctx.lineTo(cx + 1, cy - 4); ctx.closePath(); ctx.fill(); }
  ctx.font = FONT(900, 56); ctx.fillStyle = col; ctx.textAlign = 'left'; ctx.fillText(`${Math.round(clamp(v) * 100)} %`, x + w + 34, y + h * 0.75);
  ctx.restore();
}
// tracé de pouls (fréquence en battements/min)
export function pulse(ctx, x, y, w, h, t, bpm, col = '#ff5b6b', a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.shadowColor = col; ctx.shadowBlur = 10; ctx.beginPath();
  const per = 60 / bpm, span = 3;
  for (let i = 0; i <= w; i += 3) { const tt = t - span + (i / w) * span, ph = ((tt % per) + per) % per / per; let v = 0;
    if (ph > 0.1 && ph < 0.14) v = -0.25; else if (ph >= 0.14 && ph < 0.18) v = 1; else if (ph >= 0.18 && ph < 0.22) v = -0.45; else if (ph > 0.35 && ph < 0.45) v = 0.18 * Math.sin((ph - 0.35) / 0.1 * PI);
    const py = y + h / 2 - v * h * 0.45; i ? ctx.lineTo(x + i, py) : ctx.moveTo(x + i, py); }
  ctx.stroke(); ctx.restore();
}
export const hhmm = (m) => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(Math.floor(m) % 60).padStart(2, '0')}`;
