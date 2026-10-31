// FOI DE MÈRE — planche de casting : la famille et les voisins dans une rue de Bouaké (fin d'après-midi).
import { blob, stroke, ell, poly, tone, LINE } from '../engine/flat.js';
import { person, CAST } from '../characters/foi_cast.js';
export const world = 'flat', fps = 24, duration = 1;

let seed = 11; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);

export function rueBouake(ctx, W, H, ground = 820) {
  // ciel de fin d'après-midi
  const g = ctx.createLinearGradient(0, 0, 0, ground); g.addColorStop(0, '#4f8fd0'); g.addColorStop(0.6, '#f2b880'); g.addColorStop(1, '#f6d3a0');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, ground);
  // soleil + nuages plats
  blob(ctx, ell(1500, 230, 60, 60, 0, 24), { fill: '#ffe9a8', w: 0, shade: 0 });
  [[300, 140, 1.2], [900, 90, 0.9], [1650, 120, 1]].forEach(([x, y, k]) => blob(ctx, [[x - 120 * k, y + 20], [x - 80 * k, y - 20], [x - 10 * k, y - 35], [x + 70 * k, y - 18], [x + 120 * k, y + 20]], { fill: '#fff4e6', w: 0, shade: 0.06 }));
  // immeubles lointains
  seed = 11;
  for (let x = -40; x < W; x += 140 + rnd() * 60) { const h = 120 + rnd() * 160, w = 110 + rnd() * 60; blob(ctx, [[x, ground - 40], [x, ground - 40 - h], [x + w, ground - 40 - h], [x + w, ground - 40]], { fill: '#c9a38a', straight: true, w: 2.5, shade: 0.1, stroke: '#8a6a5a' });
    for (let yy = ground - 40 - h + 18; yy < ground - 60; yy += 30) for (let xx = x + 12; xx < x + w - 20; xx += 26) { ctx.fillStyle = '#9c7a68'; ctx.fillRect(xx, yy, 12, 14); } }
  // immeuble de 5 étages (le leur) à droite
  const bx = 1380, bw = 470, fh = 112;
  blob(ctx, [[bx, ground], [bx, ground - fh * 5 - 30], [bx + bw, ground - fh * 5 - 30], [bx + bw, ground]], { fill: '#e7d3b0', straight: true, w: 4, shade: 0.12 });
  for (let f = 0; f < 5; f++) { const y = ground - fh * (f + 1) - 10; for (let k = 0; k < 3; k++) { const x = bx + 30 + k * 150;
    blob(ctx, [[x, y], [x + 110, y], [x + 110, y + 70], [x, y + 70]], { fill: f === 4 && k === 1 ? '#f7d774' : '#5d7a8f', straight: true, w: 3, shade: 0.1 });
    blob(ctx, [[x - 10, y + 70], [x + 120, y + 70], [x + 120, y + 82], [x - 10, y + 82]], { fill: '#d9c19a', straight: true, w: 3, shade: 0 });
    for (let b = 0; b < 6; b++) stroke(ctx, [[x - 6 + b * 24, y + 70], [x - 6 + b * 24, y + 50]], 2.5); stroke(ctx, [[x - 10, y + 50], [x + 120, y + 50]], 2.5); } }
  // linge au balcon du 5e
  ['#e0682f', '#2e6fb5', '#f2c14e'].forEach((c, i) => blob(ctx, [[bx + 190 + i * 30, ground - fh * 5 + 34], [bx + 214 + i * 30, ground - fh * 5 + 34], [bx + 212 + i * 30, ground - fh * 5 + 66], [bx + 192 + i * 30, ground - fh * 5 + 66]], { fill: c, straight: true, w: 2.5, shade: 0 }));
  // manguier à gauche
  blob(ctx, [[150, ground], [170, ground - 260], [210, ground - 260], [235, ground]], { fill: '#6b4a32', w: 4, shade: 0.25 });
  [[110, ground - 330, 150], [250, ground - 360, 140], [180, ground - 450, 130], [330, ground - 290, 100], [40, ground - 290, 100]].forEach(([x, y, r], i) => blob(ctx, ell(x, y, r, r * 0.82, 0, 22), { fill: ['#3f8a3a', '#4f9c40', '#357a33'][i % 3], w: 4, shade: 0.22 }));
  for (let i = 0; i < 6; i++) blob(ctx, ell(90 + i * 45, ground - 300 + (i % 2) * 40, 11, 15, 0.3, 12), { fill: '#f2a93b', w: 2.5, shade: 0.2 });
  // boutique « Alimentation »
  blob(ctx, [[420, ground], [420, ground - 210], [760, ground - 210], [760, ground]], { fill: '#f0e6cf', straight: true, w: 4, shade: 0.1 });
  blob(ctx, [[400, ground - 210], [780, ground - 210], [760, ground - 150], [420, ground - 150]], { fill: '#2e8b57', straight: true, w: 4, shade: 0.1 });
  ctx.fillStyle = '#fff'; ctx.font = "bold 34px 'Arial Black', Arial, sans-serif"; ctx.textAlign = 'center'; ctx.fillText('ALIMENTATION', 590, ground - 168);
  blob(ctx, [[470, ground], [470, ground - 130], [560, ground - 130], [560, ground]], { fill: '#5a3a28', straight: true, w: 3.5, shade: 0.1 });
  // sol en latérite rouge + caniveau
  blob(ctx, [[-20, ground], [W + 20, ground], [W + 20, H + 20], [-20, H + 20]], { fill: '#c1592f', straight: true, w: 4, shade: 0 });
  ctx.fillStyle = '#a84a26'; for (let i = 0; i < 90; i++) { ctx.beginPath(); ctx.ellipse(rnd() * W, ground + 20 + rnd() * (H - ground), 8 + rnd() * 20, 2 + rnd() * 4, 0, 0, 7); ctx.fill(); }
  stroke(ctx, [[-20, ground + 14], [W + 20, ground + 14]], 3, '#8a3a1c');
}

export function build({ ctx, begin, W, H }) {
  return () => {
    begin(); rueBouake(ctx, W, H, 800);
    const row = [['papa', 250], ['maman', 470], ['grand', 670], ['jumeau1', 820], ['jumeau2', 960], ['amie', 1170], ['mari', 1380], ['fille', 1570]];
    const poses = { papa: { mood: 'calme', armL: [0.15, 0.1] }, maman: { mood: 'sourire', look: [0.3, 0] }, grand: { mood: 'calme', look: [-0.3, 0] }, jumeau1: { mood: 'sourire', look: [0.4, 0] }, jumeau2: { mood: 'sourire', look: [-0.4, 0] }, amie: { mood: 'sourire' }, mari: { mood: 'calme' }, fille: { mood: 'sourire', look: [-0.3, 0] } };
    row.forEach(([k, x]) => {
      const s = CAST[k], y = 990, ly = y + (k === 'jumeau1' || k === 'grand' ? 0 : 0);
      ctx.save(); ctx.translate(x, y); ctx.fillStyle = 'rgba(60,20,10,0.25)'; ctx.beginPath(); ctx.ellipse(0, 0, s.h * 0.2, 14, 0, 0, 7); ctx.fill(); person(ctx, s, poses[k]); ctx.restore();
      ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.strokeStyle = LINE; ctx.lineWidth = 6; ctx.font = "bold 26px 'Arial Black', Arial, sans-serif";
      const lab = s.label.replace('Le grand frère', 'Grand frère'); ctx.font = "bold 23px 'Arial Black', Arial, sans-serif"; ctx.strokeText(lab, x, y + 38); ctx.fillText(lab, x, y + 38);
      ctx.font = "italic 20px Georgia, serif"; ctx.lineWidth = 4; ctx.strokeText(s.sub, x, y + 64); ctx.fillText(s.sub, x, y + 64);
    });
    ctx.textAlign = 'left'; ctx.font = "bold 64px 'Arial Black', Arial, sans-serif"; ctx.lineWidth = 10; ctx.strokeStyle = LINE; ctx.fillStyle = '#f2c14e';
    ctx.strokeText('FOI DE MÈRE', 60, 100); ctx.fillText('FOI DE MÈRE', 60, 100);
    ctx.font = "italic 30px Georgia, serif"; ctx.lineWidth = 6; ctx.fillStyle = '#fff'; ctx.strokeText('Bouaké, 2001', 64, 146); ctx.fillText('Bouaké, 2001', 64, 146);
  };
}
