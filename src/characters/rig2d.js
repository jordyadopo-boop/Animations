// PANTIN 2D ARTICULÉ (style série télé à plat) pour « FOI DE MÈRE ».
// - Tête en pseudo-3D : les traits du visage sont des points sur un ellipsoïde, projetés selon l'angle `turn`
//   (-1 = profil gauche, 0 = face, 1 = profil droit). Les yeux, le nez, la bouche et les oreilles glissent
//   et s'aplatissent naturellement en trois quarts.
// - Corps : épaules / coudes / poignets / hanches / genoux, mains à doigts, vêtements avec plis.
// - Animation secondaire : respiration, clignements, cheveux et boucles d'oreilles qui suivent avec retard.
// Unités : un adulte mesure 100 ; `scale` = pixels par unité. Origine entre les pieds, y vers le bas.
import { LINE, blob, stroke, smooth, ell, tone } from '../engine/flat.js';

const PI = Math.PI, clamp = (x, a, b) => Math.max(a, Math.min(b, x)), lerp = (a, b, k) => a + (b - a) * k;

// ---------- gabarits ----------
export const BODY = {
  woman: { H: 100, head: [9.4, 10.8, 9.8], sh: 10.5, waist: 7.2, hip: 10.2, neck: 2.4, armU: 16.5, armF: 15, hand: 5.8, thigh: 24, shin: 22, limb: 3.1, leg: 3.7 },
  man: { H: 106, head: [9.6, 11.2, 10], sh: 14, waist: 10.5, hip: 10.5, neck: 3.4, armU: 18, armF: 16.5, hand: 6.4, thigh: 25, shin: 23.5, limb: 4.2, leg: 5.2 },
  teen: { H: 84, head: [8.8, 10, 9.2], sh: 9.6, waist: 7, hip: 8, neck: 2.3, armU: 14.5, armF: 13, hand: 5.2, thigh: 20, shin: 18.5, limb: 2.9, leg: 3.6 },
  child: { H: 62, head: [9.2, 10, 9.4], sh: 7.6, waist: 6.8, hip: 7, neck: 2.0, armU: 10, armF: 9, hand: 4.4, thigh: 12.5, shin: 11.5, limb: 2.6, leg: 3.0 },
};

export const POSE0 = {
  turn: 0, bodyTurn: 0, lean: 0, tilt: 0, nod: 0, breathe: 0, bob: 0,
  // bras : [écart (rad, + = vers l'extérieur), avant-bras (rad, + = plié vers le haut/intérieur)], main : ouverture 0..1 et rotation
  armL: [0.12, 0.15], armR: [0.12, 0.15], handL: 0.4, handR: 0.4, handRotL: 0, handRotR: 0,
  // jambes : [écart/pas (rad), genou]
  legL: [0.04, 0], legR: [0.04, 0],
  look: [0, 0], blink: 0, brow: 0, browIn: 0, mouth: 'ferme', smile: 0.3, cheeks: 0,
  sway: 0, // inertie des cheveux / boucles (rad)
};

// ---------- motifs de tissus ----------
export const FABRIC = {
  pagne: (c1, c2, c3) => (ctx, s) => {
    ctx.fillStyle = c2;
    const st = 3.3, d = 0.95;
    for (let y = -150; y < 20; y += st) for (let x = -40; x < 40; x += st) { const o = ((Math.round(y / st)) & 1) * st / 2; ctx.beginPath(); ctx.moveTo(x + o, y - d); ctx.lineTo(x + o + d, y); ctx.lineTo(x + o, y + d); ctx.lineTo(x + o - d, y); ctx.closePath(); ctx.fill(); }
    ctx.fillStyle = c3; for (let y = -150; y < 20; y += st) for (let x = -40; x < 40; x += st) { const o = ((Math.round(y / st)) & 1) * st / 2; ctx.beginPath(); ctx.arc(x + o + st / 2, y, 0.38, 0, 7); ctx.fill(); }
  },
  camo: () => (ctx) => { const cs = ['#4f5a32', '#6b6a3e', '#3a3f26']; let s = 3; const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280); for (let i = 0; i < 260; i++) { ctx.fillStyle = cs[i % 3]; ctx.beginPath(); ctx.ellipse(-30 + r() * 60, -140 + r() * 150, 1.6 + r() * 2.4, 1 + r() * 1.6, r() * 3, 0, 7); ctx.fill(); } },
  check: (c) => (ctx) => { ctx.strokeStyle = c; ctx.lineWidth = 0.8; for (let x = -40; x < 40; x += 3.4) { ctx.beginPath(); ctx.moveTo(x, -150); ctx.lineTo(x, 20); ctx.stroke(); } for (let y = -150; y < 20; y += 3.4) { ctx.beginPath(); ctx.moveTo(-40, y); ctx.lineTo(40, y); ctx.stroke(); } },
};

// ---------- tête pseudo-3D ----------
function drawHead(ctx, S, B, P, hc, lw) {
  const [rx, ry, rz] = B.head, a = clamp(P.turn, -1, 1) * 1.15, ca = Math.cos(a), sa = Math.sin(a);
  const proj = ([x, y, z]) => [hc[0] + x * ca + z * sa, hc[1] + y];
  const depth = ([x, , z]) => -x * sa + z * ca; // > 0 : face caméra
  const facing = (p) => clamp(depth(p) / Math.hypot(p[0], p[2] || 1e-6), 0, 1);
  const rxp = Math.sqrt((rx * ca) ** 2 + (rz * sa) ** 2);
  const chinX = sa * rz * 0.5, skin = S.skin;
  // contour : crâne + mâchoire qui pointe vers le côté regardé
  const outline = (grow = 0) => { const o = []; for (let i = 0; i < 28; i++) { const t = (i / 28) * PI * 2 - PI / 2; let x = Math.cos(t) * (rxp + grow), y = Math.sin(t) * (ry + grow); if (y > ry * 0.15) { const k = (y - ry * 0.15) / (ry * 0.85); x = lerp(x, chinX, k * k * 0.32) * (1 - k * 0.08 * S.jaw); y = y + k * k * ry * 0.02; } o.push([hc[0] + x, hc[1] + y]); } return o; };
  // oreilles (derrière si elles ne font pas face)
  const ears = [-1, 1].map((sd) => { const p = [sd * rx * 0.98, ry * 0.1, -rz * 0.05]; return { p, d: depth(p), sd }; });
  const drawEar = (e) => { const [x, y] = proj(e.p); const w = 0.9 + 0.6 * Math.abs(Math.sin(a + e.sd * PI / 2)); blob(ctx, ell(x + e.sd * ca * 0.2, y, w, 2.1, 0, 14), { fill: skin, w: lw, shade: 0.2 }); if (S.earrings) { const sw = P.sway * 2.5; blob(ctx, ell(x + e.sd * ca * 0.4 + sw, y + 3.6, 0.9, 1.4, 0, 10), { fill: S.earrings, w: lw * 0.7, shade: 0 }); } };
  // cheveux arrière (tresses, nattes)
  if (S.hair === 'braids') {
    for (let i = 0; i < 9; i++) { const ang = (i / 8 - 0.5) * 2.6 + PI; const p = [Math.sin(ang) * rx * 0.95, -ry * 0.2, Math.cos(ang) * rz * 0.95]; if (depth(p) > rz * 0.3) continue; const [x, y] = proj(p); const sw = P.sway * (6 + i % 3); blob(ctx, [[x - 1.2, y], [x + 1.2, y], [x + 1.3 + sw, y + 20], [x - 0.3 + sw, y + 21]], { fill: S.hairC, w: lw * 0.8, shade: 0 }); }
  }
  if (S.hair === 'braids' || S.hair === 'bun') { const p = [0, -ry * 0.75, -rz * 0.55]; const [x, y] = proj(p); if (depth(p) < 0) blob(ctx, ell(x, y - 2, 4.2, 3.6, 0, 16), { fill: S.hairC, w: lw, shade: 0.1 }); }
  ears.filter((e) => e.d < 0).forEach(drawEar);
  // cou
  blob(ctx, [[hc[0] - B.neck, hc[1] + ry * 0.55], [hc[0] + B.neck, hc[1] + ry * 0.55], [hc[0] + B.neck * 1.25, hc[1] + ry * 1.3], [hc[0] - B.neck * 1.25, hc[1] + ry * 1.3]], { fill: tone(skin, -0.12), w: lw, shade: 0, straight: true });
  // tête
  blob(ctx, outline(), { fill: skin, w: lw, shade: 0.16, dx: 0.08 + sa * 0.06, dy: 0.05 });
  // joues
  if (P.cheeks > 0) [-1, 1].forEach((sd) => { const p = [sd * rx * 0.55, ry * 0.3, rz * 0.75]; if (depth(p) <= 0) return; const [x, y] = proj(p); ctx.fillStyle = `rgba(200,70,60,${0.25 * P.cheeks})`; ctx.beginPath(); ctx.ellipse(x, y, 2.2 * facing(p), 1.2, 0, 0, 7); ctx.fill(); });
  // cheveux devant (calotte délimitée par la ligne des cheveux)
  const hairCap = (yLine, grow, color) => {
    const top = outline(grow).filter(([, y]) => y < hc[1] + yLine);
    const line = []; for (let i = 0; i <= 12; i++) { const ang = (i / 12 - 0.5) * PI * 1.1; const p = [Math.sin(ang) * rx * 1.02, yLine - Math.cos(ang) * ry * 0.18, Math.cos(ang) * rz * 1.02]; line.push(proj(p)); }
    if (top.length < 3) return;
    top.sort((p, q) => Math.atan2(p[1] - hc[1], p[0] - hc[0]) - Math.atan2(q[1] - hc[1], q[0] - hc[0]));
    const pts = [...top, ...line.sort((p, q) => q[0] - p[0])];
    blob(ctx, pts, { fill: color, w: lw, shade: 0.12 });
  };
  if (S.hair === 'short' || S.hair === 'beret') hairCap(-ry * 0.42, 0.6, S.hairC);
  if (S.hair === 'braids' || S.hair === 'bun') { hairCap(-ry * 0.4, 0.9, S.hairC); for (let i = -4; i <= 4; i++) { const p0 = [Math.sin(i * 0.22) * rx, -ry * 0.98, Math.cos(i * 0.22) * rz * 0.3], p1 = [Math.sin(i * 0.25) * rx * 1.02, -ry * 0.45, Math.cos(i * 0.25) * rz * 1.0]; if (depth(p1) < 0) continue; stroke(ctx, [proj(p0), proj(p1)], lw * 0.55, tone(S.hairC, 0.18)); } }
  if (S.hair === 'bun' || S.hair === 'braids') { const p = [0, -ry * 1.02, -rz * 0.2]; const [x, y] = proj(p); if (depth([0, 0, -rz * 0.55]) >= 0) blob(ctx, ell(x, y - 2.2, 4.2, 3.4, 0, 16), { fill: S.hairC, w: lw, shade: 0.12 }); }
  if (S.hair === 'puffs') { hairCap(-ry * 0.42, 0.6, S.hairC); [-1, 1].forEach((sd) => { const [x, y] = proj([sd * rx * 0.75, -ry * 0.8, 0]); blob(ctx, ell(x, y, 4.4, 4.2, 0, 16), { fill: S.hairC, w: lw, shade: 0.1 }); }); }
  if (S.hair === 'wrap') { hairCap(-ry * 0.35, 0.6, S.hairC); const top = outline(1.6).filter(([, y]) => y < hc[1] - ry * 0.2); const [kx, ky] = proj([rx * 0.5, -ry * 1.1, rz * 0.2]); blob(ctx, [...top, [hc[0] + rxp * 0.7, hc[1] - ry * 1.55], [hc[0], hc[1] - ry * 1.75], [hc[0] - rxp * 0.8, hc[1] - ry * 1.5]], { fill: S.wrap[0], w: lw, shade: 0.18, pattern: (c) => { c.save(); c.translate(hc[0], hc[1]); FABRIC.pagne(...S.wrap)(c); c.restore(); } }); blob(ctx, ell(kx, ky - 4, 3.6, 2.6, 0.6, 14), { fill: S.wrap[0], w: lw, shade: 0.2 }); }
  if (S.hair === 'beret') { const p = [rx * 0.2, -ry * 0.9, 0]; const [x, y] = proj(p); blob(ctx, [[x - rxp * 1.15, y + 3.5], [x - rxp * 0.9, y - 3], [x, y - 4.6], [x + rxp * 1.25, y - 1], [x + rxp * 1.05, y + 3.8]], { fill: S.beret, w: lw, shade: 0.25 }); const [bx, by] = proj([-rx * 0.45, -ry * 0.62, rz * 0.8]); blob(ctx, ell(bx, by, 1.4, 1.6, 0, 10), { fill: '#d4af37', w: lw * 0.6, shade: 0 }); }
  ears.filter((e) => e.d >= 0).forEach(drawEar);
  // ---- visage ----
  const eyeR = (S.eyeR || 0.31) * rx, ey = -ry * 0.05 + P.look[1] * 0.2, ex = rx * 0.4;
  const eyes = [-1, 1].map((sd) => { const p = [sd * ex, ey, rz * 0.86]; return { p, sd, d: depth(p), f: facing(p) }; });
  eyes.forEach((e) => {
    if (e.d <= rz * 0.05) return;
    const [x, y] = proj(e.p), w = eyeR * (0.25 + 0.75 * e.f), h = eyeR * 1.08;
    const open = 1 - P.blink;
    // œil : blanc, pupille, paupière haute épaisse, poche sous l'œil
    if (open > 0.08) {
      blob(ctx, ell(x, y, w, h * Math.max(open, 0.08), 0, 20), { fill: '#fff', w: lw * 0.9, shade: 0 });
      ctx.save(); smooth(ctx, ell(x, y, w, h * open, 0, 20)); ctx.clip();
      ctx.fillStyle = LINE; ctx.beginPath(); ctx.ellipse(x + (P.look[0] * 0.5 + sa * 0.25) * w, y + P.look[1] * h * 0.4, eyeR * 0.24 * (0.6 + 0.4 * e.f), eyeR * 0.26, 0, 0, 7); ctx.fill(); ctx.restore();
    }
    stroke(ctx, [[x - w * 1.0, y - h * 0.15 * open - (1 - open) * 0.5], [x, y - h * open - 0.3], [x + w * 1.0, y - h * 0.15 * open]], lw * (open > 0.5 ? 1.2 : 1));
    if (open <= 0.08) stroke(ctx, [[x - w, y], [x, y + h * 0.15], [x + w, y]], lw);
    stroke(ctx, [[x - w * 0.6, y + h * 1.25], [x + w * 0.5, y + h * 1.3]], lw * 0.55, tone(skin, -0.35)); // poche
    if (S.lashes && open > 0.3) stroke(ctx, [[x + e.sd * w * 0.85, y - h * 0.55], [x + e.sd * w * 1.35, y - h * 0.85]], lw * 0.8);
    // sourcils
    const bIn = P.browIn * e.sd, by = y - h * 1.45 - P.brow * 1.6;
    stroke(ctx, [[x - w * 1.0, by + bIn * 0.9 + 0.4], [x - w * 0.1, by - 0.5 - P.brow * 0.3], [x + w * 1.0, by - bIn * 0.9 + 0.4]], lw * (S.thickBrows ? 1.9 : 1.3));
  });
  // nez (sort du profil quand la tête tourne)
  const nt = proj([0, ry * 0.3, rz * 1.1]), nn = proj([0, ry * 0.37, rz * 0.98]);
  stroke(ctx, [[nt[0] - sa * 1.2 - 0.6, nt[1] - 2.2], [nt[0] + sa * 0.5, nt[1]], [nn[0] - sa * 0.4 + 0.4, nn[1]]], lw * 0.95);
  const nos = proj([0.15 * rx, ry * 0.36, rz * 1.0]); ctx.fillStyle = tone(skin, -0.45); ctx.beginPath(); ctx.ellipse(nos[0], nos[1], 0.7, 0.45, 0, 0, 7); ctx.fill();
  // bouche
  const mc = proj([0, ry * 0.58, rz * 0.9]), mf = facing([0, 0, 1]) * 0.5 + 0.5, mw = rx * 0.38 * mf * (1 + P.smile * 0.25);
  const M = P.mouth, sm = P.smile;
  const corner = (sd) => [mc[0] + sd * mw + sa * 0.6, mc[1] - sm * 1.2];
  const shapes = { ferme: 0, A: 3.6, E: 1.8, O: 3.0, M: 0, U: 1.6, cri: 5 };
  const open = shapes[M] ?? 0;
  if (open <= 0.1) { stroke(ctx, [corner(-1), [mc[0] + sa * 0.6, mc[1] + sm * 0.9], corner(1)], lw * 1.05); if (sm > 0.5) [-1, 1].forEach((sd) => { const c = corner(sd); stroke(ctx, [[c[0] - sd * 0.3, c[1] - 0.6], [c[0] + sd * 0.5, c[1] + 0.4]], lw * 0.7); }); }
  else {
    const wM = M === 'O' || M === 'U' ? mw * 0.55 : M === 'E' ? mw * 1.1 : mw;
    const pts = [[mc[0] - wM + sa * 0.6, mc[1] - sm], [mc[0] + sa * 0.6, mc[1] - 0.6], [mc[0] + wM + sa * 0.6, mc[1] - sm], [mc[0] + wM * 0.6 + sa * 0.6, mc[1] + open * 0.75], [mc[0] + sa * 0.6, mc[1] + open], [mc[0] - wM * 0.6 + sa * 0.6, mc[1] + open * 0.75]];
    blob(ctx, pts, { fill: '#4a1414', w: lw, shade: 0 });
    ctx.save(); smooth(ctx, pts); ctx.clip();
    ctx.fillStyle = '#fff'; ctx.fillRect(mc[0] - wM, mc[1] - 3, wM * 2, 2.6 + (M === 'E' ? 0.4 : 0));
    ctx.fillStyle = '#c0504d'; ctx.beginPath(); ctx.ellipse(mc[0] + sa * 0.6, mc[1] + open, wM * 0.6, open * 0.4, 0, 0, 7); ctx.fill();
    ctx.restore(); smooth(ctx, pts); ctx.lineWidth = lw; ctx.strokeStyle = LINE; ctx.stroke();
  }
  if (S.moustache) { const m0 = proj([0, ry * 0.47, rz * 1.0]); blob(ctx, [[m0[0] - mw * 1.1, m0[1] + 0.8], [m0[0], m0[1] - 0.8], [m0[0] + mw * 1.1, m0[1] + 0.8], [m0[0] + mw * 0.8, m0[1] + 1.6], [m0[0] - mw * 0.8, m0[1] + 1.6]], { fill: S.hairC, w: lw * 0.6, shade: 0 }); }
  if (S.beard) { ctx.save(); smooth(ctx, outline()); ctx.clip(); ctx.fillStyle = 'rgba(30,20,15,0.35)'; ctx.beginPath(); ctx.ellipse(chinX + hc[0], hc[1] + ry * 0.75, rxp * 0.9, ry * 0.42, 0, 0, 7); ctx.fill(); ctx.restore(); }
}

// ---------- membres ----------
function arm(ctx, S, B, P, side, sh, lw, layerFront) {
  const [abd, el] = side > 0 ? P.armL : P.armR;
  const a1 = side * abd, a2 = a1 + side * el;
  const E = [sh[0] + Math.sin(a1) * B.armU, sh[1] + Math.cos(a1) * B.armU];
  const Wr = [E[0] + Math.sin(a2) * B.armF, E[1] + Math.cos(a2) * B.armF];
  const sleeve = S.sleeve ?? 'court';
  const cloth = S.top, pat = S.topPattern;
  const skinOrCloth = sleeve === 'long' ? cloth : S.skin;
  const lim = (a, b, wa, wb, fill, p) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L; blob(ctx, [[a[0] + nx * wa, a[1] + ny * wa], [b[0] + nx * wb, b[1] + ny * wb], [b[0] + dx / L * wb * 0.9, b[1] + dy / L * wb * 0.9], [b[0] - nx * wb, b[1] - ny * wb], [a[0] - nx * wa, a[1] - ny * wa], [a[0] - dx / L * wa * 0.8, a[1] - dy / L * wa * 0.8]], { fill, w: lw, shade: layerFront ? 0.2 : 0.32, pattern: p }); };
  lim(sh, E, B.limb * 1.05, B.limb * 0.92, skinOrCloth, sleeve === 'long' ? pat : null);
  if (sleeve !== 'long' && sleeve !== 'nu') lim(sh, [lerp(sh[0], E[0], 0.45), lerp(sh[1], E[1], 0.45)], B.limb * 1.18, B.limb * 1.08, cloth, pat);
  lim(E, Wr, B.limb * 0.92, B.limb * 0.75, skinOrCloth, sleeve === 'long' ? pat : null);
  if (sleeve === 'long') lim([lerp(E[0], Wr[0], 0.85), lerp(E[1], Wr[1], 0.85)], Wr, B.limb * 0.8, B.limb * 0.7, S.skin);
  hand(ctx, S, B, Wr, a2, side > 0 ? P.handL : P.handR, (side > 0 ? P.handRotL : P.handRotR), side, lw, layerFront);
  return { E, Wr };
}
// main à 4 doigts + pouce ; open 0 = poing, 1 = doigts tendus
function hand(ctx, S, B, w, ang, open, rot, side, lw, front) {
  const h = B.hand; ctx.save(); ctx.translate(w[0], w[1]); ctx.rotate(-ang + rot); ctx.scale(side, 1);
  const fill = S.skin, sh = front ? 0.18 : 0.3;
  const fingers = [-1.5, -0.5, 0.5, 1.5].map((k, i) => { const len = h * (0.95 - Math.abs(k) * 0.12) * lerp(0.35, 1, open), x = k * h * 0.2; return [[x - h * 0.11, h * 0.55], [x + h * 0.11, h * 0.55], [x + h * 0.1, h * 0.55 + len], [x, h * 0.6 + len + h * 0.08], [x - h * 0.1, h * 0.55 + len]]; });
  fingers.forEach((f) => blob(ctx, f, { fill, w: lw * 0.8, shade: sh }));
  blob(ctx, ell(0, h * 0.35, h * 0.42, h * 0.38, 0, 16), { fill, w: lw * 0.9, shade: sh });
  const ta = lerp(0.2, 1.1, open);
  blob(ctx, [[h * 0.3, h * 0.2], [h * 0.42, h * 0.38], [h * 0.42 + Math.sin(ta) * h * 0.6, h * 0.3 + Math.cos(ta) * h * 0.55], [h * 0.3 + Math.sin(ta) * h * 0.62, h * 0.26 + Math.cos(ta) * h * 0.62]], { fill, w: lw * 0.8, shade: sh });
  if (open < 0.5) for (let i = 0; i < 3; i++) stroke(ctx, [[-h * 0.3 + i * h * 0.2, h * 0.52], [-h * 0.24 + i * h * 0.2, h * 0.62]], lw * 0.6);
  ctx.restore();
}
function leg(ctx, S, B, P, side, hip, lw) {
  const [step, knee] = side > 0 ? P.legL : P.legR;
  const a1 = side * 0.04 + step, a2 = a1 - knee;
  const K = [hip[0] + Math.sin(a1) * B.thigh, hip[1] + Math.cos(a1) * B.thigh];
  const A = [K[0] + Math.sin(a2) * B.shin, K[1] + Math.cos(a2) * B.shin];
  const lim = (a, b, wa, wb, fill, p) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L; blob(ctx, [[a[0] + nx * wa, a[1] + ny * wa], [b[0] + nx * wb, b[1] + ny * wb], [b[0] - nx * wb, b[1] - ny * wb], [a[0] - nx * wa, a[1] - ny * wa]], { fill, w: lw, shade: 0.22, straight: true, pattern: p }); };
  const pant = S.pants ?? S.skin, short = S.shorts;
  lim(hip, K, B.leg, B.leg * 0.85, pant, S.pantsPattern);
  lim(K, A, B.leg * 0.85, B.leg * 0.65, short ? S.skin : pant, short ? null : S.pantsPattern);
  if (short) { blob(ctx, ell(A[0], A[1] - 1, B.leg * 0.7, 1.4, 0, 12), { fill: '#eee8dc', w: lw * 0.8, shade: 0 }); }
  if (S.boots) lim([A[0], A[1] - 6], A, B.leg * 0.75, B.leg * 0.72, S.shoes);
  const turnX = Math.sin(P.bodyTurn * 1.1) * 2.5;
  blob(ctx, [[A[0] - B.leg * 0.8, A[1] - 1.2], [A[0] + B.leg * 0.7 + turnX + side * 0.6, A[1] - 1.6], [A[0] + B.leg * 1.25 + turnX, A[1] + 0.6], [A[0] + B.leg * 0.9 + turnX, A[1] + 1.6], [A[0] - B.leg * 0.85, A[1] + 1.6]], { fill: S.shoes, w: lw, shade: 0.25 });
  return { K, A };
}

// ---------- personnage complet ----------
// x, y : position des pieds à l'écran ; scale : px par unité ; flip : -1 pour regarder à gauche
export function drawCharacter(ctx, S, pose, x, y, scale, flip = 1) {
  const P = { ...POSE0, ...pose }, B = BODY[S.body];
  const lw = 3.2 / scale * (S.lineScale || 1); // trait fin et constant à l'écran (~3 px)
  ctx.save(); ctx.translate(x, y); ctx.scale(scale * flip, scale);
  const bt = P.bodyTurn, cb = Math.cos(bt * 1.1), sb = Math.sin(bt * 1.1);
  const legLen = B.thigh + B.shin, hipY = -legLen + P.bob;
  const br = 1 + P.breathe * 0.012;
  const hip = [0, hipY], chest = [Math.sin(P.lean) * 22, hipY - 22 * Math.cos(P.lean) * br];
  const shW = B.sh * (0.62 + 0.38 * Math.abs(cb)), hipW = B.hip * (0.7 + 0.3 * Math.abs(cb));
  const shL = [chest[0] + shW, chest[1] - 3], shR = [chest[0] - shW, chest[1] - 3];
  const neckTop = [chest[0] + sb * 1.2, chest[1] - 6];
  const hc = [neckTop[0] + Math.sin(P.tilt) * 6 + P.turn * 0.8, neckTop[1] - B.head[1] * 1.25 + P.nod * 1.5];
  // profondeur : le bras « du fond » passe derrière le torse quand le corps tourne
  const backSide = sb > 0.15 ? -1 : sb < -0.15 ? 1 : 0;
  // jambes
  const legs = [-1, 1].map((sd) => ({ sd, hp: [hip[0] + sd * hipW * 0.45, hip[1] + 2] }));
  legs.forEach((l) => leg(ctx, S, B, P, l.sd, l.hp, lw));
  if (backSide) arm(ctx, S, B, P, backSide, backSide > 0 ? shL : shR, lw, false);
  // torse / vêtement
  const top = S.top, pat = S.topPattern;
  const waist = [lerp(hip[0], chest[0], 0.45), lerp(hip[1], chest[1], 0.45)];
  if (S.dress) {
    const hem = hip[1] + B.thigh * (S.dressLen ?? 0.85), sway = P.sway * 3;
    blob(ctx, [[shR[0] + 1.5, shR[1]], [shL[0] - 1.5, shL[1]], [waist[0] + B.waist * cb, waist[1]], [hip[0] + hipW * 1.05, hip[1]], [hip[0] + hipW * 1.18 + sway, hem], [hip[0] + sway, hem + 1.0], [hip[0] - hipW * 1.18 + sway, hem], [hip[0] - hipW * 1.05, hip[1]], [waist[0] - B.waist * cb, waist[1]]], { fill: top, w: lw, shade: 0.22, dx: 0.06 - sb * 0.05, pattern: pat });
    stroke(ctx, [[hip[0] + hipW * 0.4, hip[1] + 4], [hip[0] + hipW * 0.55 + sway, hem - 2]], lw * 0.6, tone(top, -0.4)); stroke(ctx, [[hip[0] - hipW * 0.3, hip[1] + 6], [hip[0] - hipW * 0.5 + sway, hem - 3]], lw * 0.6, tone(top, -0.4));
    if (S.belt) blob(ctx, [[waist[0] - B.waist * cb * 1.02, waist[1] - 1.3], [waist[0] + B.waist * cb * 1.02, waist[1] - 1.3], [waist[0] + B.waist * cb * 1.05, waist[1] + 1.6], [waist[0] - B.waist * cb * 1.05, waist[1] + 1.6]], { fill: S.belt, w: lw * 0.8, shade: 0, straight: true });
  } else {
    blob(ctx, [[shR[0] + 0.5, shR[1] - 0.5], [shL[0] - 0.5, shL[1] - 0.5], [shL[0] + 0.8, shL[1] + 4], [waist[0] + B.waist * cb, waist[1]], [hip[0] + hipW, hip[1] + 3], [hip[0] - hipW, hip[1] + 3], [waist[0] - B.waist * cb, waist[1]], [shR[0] - 0.8, shR[1] + 4]], { fill: top, w: lw, shade: 0.2, dx: 0.06 - sb * 0.05, pattern: pat });
    const cx = chest[0] + sb * B.sh * 0.35;
    // col en V + boutons + plis
    blob(ctx, [[cx - 2.6, chest[1] - 3.2], [cx + 2.6, chest[1] - 3.2], [cx + 0.2, chest[1] + 2.8]], { fill: S.skin, w: lw * 0.8, shade: 0.2, straight: true });
    if (S.collar) { stroke(ctx, [[cx - 3.2, chest[1] - 3.6], [cx - 0.6, chest[1] + 3]], lw); stroke(ctx, [[cx + 3.2, chest[1] - 3.6], [cx + 0.6, chest[1] + 3]], lw); }
    if (S.buttons) for (let i = 0; i < 4; i++) { ctx.fillStyle = LINE; ctx.beginPath(); ctx.arc(lerp(cx, hip[0] + sb * 2, i / 4) + 0.3, lerp(chest[1] + 4, hip[1], i / 4), 0.45, 0, 7); ctx.fill(); }
    if (S.pockets) [-1, 1].forEach((sd) => { const px = cx + sd * B.sh * 0.42 * cb; blob(ctx, [[px - 2.2, chest[1] + 1], [px + 2.2, chest[1] + 1], [px + 2.2, chest[1] + 5], [px - 2.2, chest[1] + 5]], { fill: tone(top.startsWith('#') ? top : '#888888', -0.08), w: lw * 0.7, shade: 0, straight: true }); });
    stroke(ctx, [[waist[0] - B.waist * 0.5, waist[1] + 2], [waist[0] - B.waist * 0.2, waist[1] + 4]], lw * 0.55, 'rgba(0,0,0,0.35)');
    if (S.belt) blob(ctx, [[hip[0] - hipW, hip[1] - 1], [hip[0] + hipW, hip[1] - 1], [hip[0] + hipW, hip[1] + 1.6], [hip[0] - hipW, hip[1] + 1.6]], { fill: S.belt, w: lw * 0.8, shade: 0, straight: true });
  }
  if (S.bag) [-1, 1].forEach((sd) => stroke(ctx, [[chest[0] + sd * shW * 0.55, chest[1] - 3], [chest[0] + sd * shW * 0.6, hip[1] - 2]], 1.1, S.bag));
  // tête
  drawHead(ctx, S, B, P, hc, lw);
  // bras (devant)
  const out = {};
  [-1, 1].forEach((sd) => { if (sd === backSide) return; out[sd] = arm(ctx, S, B, P, sd, sd > 0 ? shL : shR, lw, true); });
  ctx.restore();
  return { head: [x + hc[0] * scale * flip, y + hc[1] * scale] };
}

// ---------- outils d'animation ----------
// clignement naturel (déterministe) : 0 ouvert → 1 fermé
export function blinkAt(t, seed = 0) { const per = 2.9 + (seed % 3) * 0.7, p = ((t + seed * 1.37) % per) / per; return p > 0.955 ? Math.sin(((p - 0.955) / 0.045) * PI) : 0; }
// bouche parlante : alterne des formes selon les syllabes d'une réplique (débit en syllabes / s)
export function mouthAt(t, t0, text, rate = 6.5) {
  if (t < t0) return 'ferme';
  const syl = text.toLowerCase().replace(/[^a-zàâéèêëîïôûùç ]/g, '').split(/(?<=[aeiouyàâéèêëîïôûù])/).filter((s) => s.trim());
  const i = Math.floor((t - t0) * rate); if (i >= syl.length) return 'ferme';
  const s = syl[i], v = s.match(/[aeiouyàâéèêëîïôûù]/)?.[0] || 'a', k = ((t - t0) * rate) % 1;
  if (k > 0.78) return 'M';
  if ('oôu'.includes(v)) return v === 'u' ? 'U' : 'O'; if ('eéèêëiî'.includes(v)) return 'E'; return 'A';
}
export const parleFin = (text, rate = 6.5) => text.toLowerCase().replace(/[^a-zàâéèêëîïôûùç ]/g, '').split(/(?<=[aeiouyàâéèêëîïôûù])/).filter((s) => s.trim()).length / rate;
