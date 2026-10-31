// Moteur 2D « dessin à plat » (style série animée télé) : trait fin sombre, aplats de couleurs,
// ombre propre en croissant (lumière en haut à gauche), grands yeux ronds. Canvas 2D, image par image.
export const LINE = '#1d1a22';

// courbe lisse fermée/ouverte à travers des points (Catmull-Rom -> Bézier), sans tremblement
export function smooth(ctx, pts, closed = true, tension = 1) {
  const n = pts.length; if (n < 2) return;
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  const get = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2), k = tension / 6;
    ctx.bezierCurveTo(p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k, p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k, p2[0], p2[1]);
  }
  if (closed) ctx.closePath();
}
export function poly(ctx, pts, closed = true) { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); if (closed) ctx.closePath(); }
export const ell = (cx, cy, rx, ry, rot = 0, n = 20) => { const o = [], c = Math.cos(rot), s = Math.sin(rot); for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, x = Math.cos(a) * rx, y = Math.sin(a) * ry; o.push([cx + x * c - y * s, cy + x * s + y * c]); } return o; };

// assombrit / éclaircit une couleur hex
export function tone(hex, k) {
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  if (k < 0) { r *= 1 + k; g *= 1 + k; b *= 1 + k * 0.85; } else { r += (255 - r) * k; g += (255 - g) * k; b += (255 - b) * k; }
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}

// forme pleine : aplat + ombre en croissant (décalage de la forme) + contour
// o : { fill, w (épaisseur du trait), shade (0..1 force), dx, dy (direction de l'ombre), straight (polygone), pattern(ctx) }
export function blob(ctx, pts, o = {}) {
  const { fill = '#fff', w = 3.5, shade = 0.22, dx = 0.07, dy = 0.06, straight = false, stroke = LINE } = o;
  const trace = () => (straight ? poly(ctx, pts) : smooth(ctx, pts));
  trace(); ctx.fillStyle = fill; ctx.fill();
  if (o.pattern) { ctx.save(); trace(); ctx.clip(); o.pattern(ctx); ctx.restore(); }
  if (shade > 0) {
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; pts.forEach(([x, y]) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); });
    const sx = (x1 - x0) * dx, sy = (y1 - y0) * dy;
    ctx.save(); trace(); ctx.clip();
    ctx.beginPath(); ctx.rect(x0 - 50, y0 - 50, x1 - x0 + 100, y1 - y0 + 100);
    const sh = pts.map(([x, y]) => [x - sx, y - sy]);
    // zone d'ombre = forme moins forme décalée vers la lumière (règle pair-impair)
    if (straight) { sh.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); }
    else { const n = sh.length; ctx.moveTo(sh[0][0], sh[0][1]); for (let i = 0; i < n; i++) { const p0 = sh[(i - 1 + n) % n], p1 = sh[i], p2 = sh[(i + 1) % n], p3 = sh[(i + 2) % n]; ctx.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]); } ctx.closePath(); }
    ctx.fillStyle = `rgba(20,10,40,${shade})`; ctx.fill('evenodd');
    ctx.restore();
  }
  if (w > 0) { trace(); ctx.lineWidth = w; ctx.strokeStyle = stroke; ctx.lineJoin = 'round'; ctx.stroke(); }
}
export function stroke(ctx, pts, w = 3, color = LINE, closed = false) { smooth(ctx, pts, closed); ctx.lineWidth = w; ctx.strokeStyle = color; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); }

// membre « tube » effilé de a vers b (largeurs wa -> wb), légèrement courbé
export function limb(ctx, a, b, wa, wb, fill, bend = 0, o = {}) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  const m = [(a[0] + b[0]) / 2 + nx * bend * L, (a[1] + b[1]) / 2 + ny * bend * L], wm = (wa + wb) / 2;
  blob(ctx, [[a[0] + nx * wa / 2, a[1] + ny * wa / 2], [m[0] + nx * wm / 2, m[1] + ny * wm / 2], [b[0] + nx * wb / 2, b[1] + ny * wb / 2], [b[0] + dx / L * wb * 0.35, b[1] + dy / L * wb * 0.35], [b[0] - nx * wb / 2, b[1] - ny * wb / 2], [m[0] - nx * wm / 2, m[1] - ny * wm / 2], [a[0] - nx * wa / 2, a[1] - ny * wa / 2]], { fill, ...o });
}

export function createWorld(canvas, width, height) {
  const ctx = canvas.getContext('2d'); canvas.width = width; canvas.height = height;
  const cam = { x: width / 2, y: height / 2, zoom: 1 };
  const begin = () => { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, width, height); };
  const view = (par = 1) => { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(width / 2, height / 2); ctx.scale(cam.zoom, cam.zoom); ctx.translate(-cam.x * par, -cam.y * par); };
  return { ctx, cam, begin, view, width, height, update: () => {}, render: () => {} };
}
