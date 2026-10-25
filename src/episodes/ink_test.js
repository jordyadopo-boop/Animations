// Test du style « rubber hose » : planche (t < 3) puis petit extrait animé
import { drawPepin, drawMargot, drawBouboule } from '../characters/inkcast.js';
import { INK, WHITE, GREY, ell, shape, line, union } from '../engine/ink.js';
export const world = 'ink', fps = 30, duration = 3;

// décor : tronc veiné, branche, nuages au trait
export function trunk(ctx, x, top, bottom, w, seed = 1) {
  const L = [], R = [];
  for (let y = top; y <= bottom; y += 60) { const k = (y - top) / (bottom - top); L.push([x - w / 2 - k * 10 + Math.sin(y * 0.01 + seed) * 6, y]); R.push([x + w / 2 + k * 10 + Math.sin(y * 0.012 + seed * 2) * 6, y]); }
  shape(ctx, [...L, ...R.reverse()], { fill: '#fbf6ec', w: 7, seed });
  for (let i = 1; i < 5; i++) { const xx = x - w / 2 + (w * i) / 5; const pts = []; for (let y = top + 20; y < bottom - 20; y += 50) pts.push([xx + Math.sin(y * 0.02 + i * 2 + seed) * 8, y]); line(ctx, pts, 3, seed + i * 3); }
}
export function branch(ctx, a, b, r, seed = 9) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  shape(ctx, [[a[0] + nx * r, a[1] + ny * r], [b[0] + nx * r * 0.5, b[1] + ny * r * 0.5], [b[0] + dx / L * r * 0.4, b[1] + dy / L * r * 0.4], [b[0] - nx * r * 0.5, b[1] - ny * r * 0.5], [a[0] - nx * r, a[1] - ny * r]], { fill: '#fbf6ec', w: 6, seed });
  line(ctx, [[a[0] + dx * 0.2, a[1] + dy * 0.2 - 2], [a[0] + dx * 0.7, a[1] + dy * 0.7 + 2]], 3, seed + 1);
}
export function cloud(ctx, x, y, s, seed = 5) { union(ctx, [ell(x, y, 80 * s, 50 * s, 0, 14), ell(x + 70 * s, y + 10 * s, 60 * s, 40 * s, 0, 12), ell(x - 70 * s, y + 12 * s, 55 * s, 36 * s, 0, 12), ell(x + 20 * s, y - 34 * s, 50 * s, 40 * s, 0, 12)], { fill: '#fbf6ec', w: 5, seed }); }

export function build({ ctx, begin, view, finish, cam, fx }) {
  return (t) => {
    begin(t);
    cam.x = 960; cam.y = 540; cam.zoom = 1; view();
    cloud(ctx, 300, 160, 1.1, 1); cloud(ctx, 1500, 120, 0.9, 2);
    trunk(ctx, 170, -50, 1200, 190, 3); trunk(ctx, 1830, -50, 1200, 160, 4);
    branch(ctx, [100, 860], [1900, 880], 34, 5);
    // planche : Pépin (calme / surpris), Margot, Bouboule
    const base = 850;
    ctx.save(); ctx.translate(420, base); ctx.scale(1.25, 1.25); drawPepin(ctx, { lookX: 0.4, smirk: 0.8, lid: 0.45, tilt: 0.2, tuft: 0.3, tail: 0.7, tailWave: t * 2 }); ctx.restore();
    ctx.save(); ctx.translate(820, base); ctx.scale(-1.25, 1.25); drawPepin(ctx, { eyePop: 1, lid: 0, lidLow: 0, mouth: 0.8, tongue: 0.4, tuft: 1.3, browAng: 0.8, brow: 1, neck: 1.6, armL: [2.6, -0.3], armR: [2.4, 0.3], handOpen: 1, legL: [-0.5, 0.2], legR: [0.6, -0.2], ear: -0.4, tail: 1 }); ctx.restore();
    ctx.save(); ctx.translate(1180, base); ctx.scale(-1.3, 1.3); drawMargot(ctx, { lookX: 0.5, beak: 0.15 }); ctx.restore();
    ctx.save(); ctx.translate(1560, base); ctx.scale(-1.05, 1.05); drawBouboule(ctx, { lookX: 0.4, armR: [0.9, 0.3] }); ctx.restore();
    finish();
    fx.set([{ text: 'PÉPIN !', x: 0.5, y: 0.1, size: 120, color: '#ffffff', rot: -3 }]);
  };
}
