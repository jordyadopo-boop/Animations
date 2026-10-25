// Extrait de test (8 s) en style rubber hose : élan, vol plané, SPLATCH contre le tronc,
// glissade, rebond sur le ventre de Bouboule, Pépin sonné, Margot se moque.
import { drawPepin, drawMargot, drawBouboule } from '../characters/inkcast.js';
import { INK, WHITE, ell, shape, line } from '../engine/ink.js';
import { trunk, branch, cloud } from './ink_test.js';
import { track, range, lerp, ease, wobble, hop, shake, clamp } from '../engine/anim.js';
export const world = 'ink', fps = 30, duration = 8;

export const CUES = [
  ['tiptoe', 0.2, { dur: 0.6 }], ['spring', 1.15], ['whoosh', 1.25, { dur: 0.6 }], ['whistleDown', 1.9, { dur: 1.2 }], ['gulp', 2.85],
  ['splat', 3.2], ['squeak', 3.4, { dur: 1.5 }], ['whistleDown', 5.0, { dur: 0.45 }], ['boing', 5.5], ['hehe', 5.9], ['tweet', 6.3, { dur: 1.6 }], ['hehe', 6.9], ['sad', 7.3],
];
export const MUSIC = [[0, 3.2, 'play', 140, 0, 0.8], [3.2, 5.0, 'sneak', 110, -3, 0.7], [5.0, 8, 'play', 150, 5, 0.6]];

const blend = (a, b, k) => { const o = { ...a }; for (const key in b) { const va = a[key], vb = b[key]; o[key] = va === undefined ? vb : Array.isArray(vb) ? vb.map((x, i) => lerp(va[i], x, k)) : lerp(va, vb, k); } return o; };
function star(ctx, x, y, r, a, seed) { const p = []; for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.45 : r, an = a + (i / 10) * Math.PI * 2; p.push([x + Math.cos(an) * rr, y + Math.sin(an) * rr]); } shape(ctx, p, { fill: WHITE, w: 4, seed, boil: 0.3 }); }

export function build({ ctx, begin, view, finish, cam, fx }) {
  const TRUNK_R = 2600, TRUNK_W = 190, IMPACT = [TRUNK_R - TRUNK_W / 2 - 6, 700];
  const BOU = [2300, 1000], MAR = [1560, 1006];
  // trajectoire du vol : Bézier quadratique départ -> sommet -> impact
  const glidePos = (k) => { const a = [860, 430], c = [1550, 330], b = IMPACT; const u = 1 - k; return [u * u * a[0] + 2 * u * k * c[0] + k * k * b[0], u * u * a[1] + 2 * u * k * c[1] + k * k * b[1]]; };

  return (t) => {
    begin(t);
    // ---------- caméra (mouvements amortis) ----------
    cam.x = track([[0, 760], [1.3, 820], [3.2, 2240], [5.0, 2330], [5.6, 2120], [8, 2000]])(t);
    cam.y = track([[0, 520], [1.5, 470], [3.2, 540], [5.0, 650], [5.6, 820], [8, 840]])(t);
    cam.zoom = track([[0, 1.45], [1.3, 1.35], [2.4, 1.15], [3.15, 1.2], [3.3, 1.38, 'out'], [5.0, 1.35], [5.6, 1.2], [8, 1.3]])(t);
    const sh = shake(t, t > 3.2 && t < 3.55 ? 14 : t > 5.5 && t < 5.7 ? 8 : 0, 22);
    cam.x += sh[0]; cam.y += sh[1];
    // ---------- décor : nuages lointains (parallaxe), troncs, branches ----------
    view(0.35); cloud(ctx, 700, 60, 1.1, 1); cloud(ctx, 1300, -40, 0.8, 2); cloud(ctx, 1900, 90, 1.0, 3);
    view(1);
    trunk(ctx, 150, -400, 1700, 200, 3); trunk(ctx, TRUNK_R, -400, 1700, TRUNK_W, 4);
    branch(ctx, [150, 620], [960, 612], 24, 5);
    branch(ctx, [1380, 1024], [TRUNK_R, 1004], 26, 6);

    // ---------- Pépin ----------
    let pos, P, sx = 1, sy = 1, rotZ = 0, facing = 1;
    const idle = { tail: 0.6, tailWave: t * 2.2, lookX: 0.3, lid: 0.35 };
    if (t < 1.2) { // élan
      pos = [620, 598];
      const look = range(t, 0.25, 0.4) * (1 - range(t, 0.75, 0.85));
      const crouch = ease.out(range(t, 0.8, 1.15));
      P = blend({ ...idle, lookX: -0.6 * look + 0.3 * (1 - look), smirk: look * 1.2, lid: 0.45, tilt: 0.3 * look, tuft: 0.3 },
        { squash: 0.68, lean: -0.25, armL: [-0.9, -0.2], armR: [-0.7, -0.2], legL: [0.5, 0.4], legR: [0.7, 0.4], tuft: 0.8, browAng: -0.6, lid: 0.3, smirk: 0.6, ear: 0.5 }, crouch);
      P.squash = (P.squash ?? 1) + Math.sin(t * 5) * 0.015 * (1 - crouch);
    } else if (t < 1.55) { // détente : il s'étire en l'air
      const k = ease.out(range(t, 1.2, 1.55));
      pos = [lerp(620, 860, k), lerp(598, 430, k)];
      P = { ...idle, squash: lerp(1.45, 1.15, k), lean: 0.2, armL: [1.9, 0.1], armR: [2.1, 0.1], legL: [-1.2, 0], legR: [-1.0, 0], tuft: -0.6, ear: 1, mouth: 0.3, lid: 0.1, glide: k };
    } else if (t < 3.2) { // vol plané fluide, puis il voit le tronc arriver
      const k = ease.inOut(range(t, 1.55, 3.2)); pos = glidePos(k); pos[1] += Math.sin(t * 6) * 6;
      const see = range(t, 2.75, 2.95);
      P = { tail: 0.05, tailWave: t * 10, squash: 1, lean: 0.25 + Math.sin(t * 6) * 0.04, glide: 1, armL: [2.0, -0.15], armR: [2.2, -0.15], legL: [-1.15, 0.1], legR: [-0.95, 0.1], handOpen: 1,
        tuft: -0.8 + see * 2, ear: 1, lid: 0.3 * (1 - see), smile: 0.9, mouth: see * 0.7, eyePop: see, lookX: 0.6, browAng: see * 0.9, neck: 1 + see * 0.3 };
    } else if (t < 5.0) { // SPLATCH : aplati contre le tronc, il glisse lentement
      const slide = ease.in(range(t, 3.45, 5.0));
      pos = [IMPACT[0], IMPACT[1] + slide * 190];
      const hit = t < 3.32 ? range(t, 3.2, 3.32) : 1;
      sx = lerp(0.6, 0.32, hit) + wobble(t, 3.32, 0.06, 7, 5); sy = 1.25;
      P = { glide: 0.3, armL: [2.7, 0.0], armR: [2.5, 0.0], legL: [-0.6, 0], legR: [0.6, 0], handOpen: 1, tuft: -1, ear: 1, cross: 0.6, lid: 0.2, mouth: 0.25, tongue: 1, eyePop: 0.3, tail: -0.2, lookX: 0 };
    } else if (t < 5.5) { // il se décolle et tombe en arrière sur le ventre de Bouboule
      const k = ease.in(range(t, 5.0, 5.5));
      pos = [lerp(IMPACT[0], BOU[0] + 40, k), lerp(IMPACT[1] + 190, BOU[1] - 120, k)];
      rotZ = -k * 1.4; sx = lerp(0.5, 1, ease.out(k));
      P = { armL: [2.6, 0.3], armR: [2.8, 0.3], legL: [1.0, 0], legR: [1.4, 0], handOpen: 1, tuft: 1.2, ear: -0.5, eyePop: 0.8, lid: 0, mouth: 0.8, cross: 0.2 };
    } else { // BOÏNG sur le ventre, rebond, il atterrit assis et sonné
      const k = range(t, 5.5, 6.3);
      const land = [1900, 1004];
      pos = k < 1 ? [lerp(BOU[0] + 40, land[0], ease.out(k)), lerp(BOU[1] - 120, land[1], k) - hop(t, 5.5, 6.3, 260)] : land;
      rotZ = k < 1 ? -1.4 - k * Math.PI * 2 + 1.4 * k : 0;
      const sat = k >= 1;
      const dz = range(t, 6.3, 6.5), glare = range(t, 7.2, 7.4);
      facing = -1;
      P = sat ? { squash: t < 6.42 ? 0.7 : 1 + wobble(t, 6.42, 0.08, 5, 5), lean: -0.15, armL: [0.2, 0.5], armR: [0.25, 0.5], legL: [1.5, 0.4], legR: [1.4, 0.4], tail: 0.9, tailWave: t * 2,
        cross: 0.5 * (1 - glare), headTilt: Math.sin(t * 6) * 0.15 * (1 - glare), lid: lerp(0.35, 0.55, glare), tilt: 0.4 * glare, browAng: -0.8 * glare, brow: -0.3 * glare, smile: -0.5, lookX: glare ? -0.7 : 0, tuft: -0.5, ear: 0.6 }
        : { armL: [2.4, 0.3], armR: [2.6, 0.3], legL: [1.2, 0], legR: [1.0, 0], handOpen: 1, tuft: 1, eyePop: 0.5, lid: 0, mouth: 0.6 };
    }
    // traînées de vitesse derrière lui en vol
    if (t > 1.3 && t < 3.2) for (let i = 0; i < 4; i++) { const y = pos[1] - 120 + i * 30; const len = 120 + i * 30; line(ctx, [[pos[0] - 120 - len, y], [pos[0] - 110, y + 2]], 4, 600 + i); }

    // ---------- Bouboule (gros, rit en se tenant le ventre) ----------
    const laugh = range(t, 5.55, 5.75) * (1 - range(t, 7.6, 7.9));
    const hit = t > 5.5 && t < 5.9;
    ctx.save(); ctx.translate(...BOU); ctx.scale(-1, 1);
    drawBouboule(ctx, { squash: 1 + (hit ? -0.18 * Math.sin(range(t, 5.5, 5.9) * Math.PI) : 0) + laugh * Math.abs(Math.sin(t * 14)) * 0.04, belly: laugh * 0.4 + (hit ? 0.5 : 0),
      lookX: t < 5.5 ? 0.6 : 0.3, lid: laugh ? 0.75 : 0.45, mouth: laugh * (0.6 + 0.3 * Math.sin(t * 14)), grin: 1, lean: -0.1 * laugh,
      armL: laugh ? [1.2, 0.5] : [0.3, 0.2], armR: laugh ? [1.0, 0.5] : [0.4, 0.2], tail: t * 3 });
    ctx.restore();
    // ---------- Margot (perchée, ricane) ----------
    const sneer = range(t, 6.8, 7.0);
    ctx.save(); ctx.translate(...MAR); ctx.scale(1, 1);
    drawMargot(ctx, { lookX: 0.6, beak: sneer * (0.4 + 0.3 * Math.sin(t * 20)), lid: 0.45, tilt: 0.8, lean: 0.15 + sneer * Math.sin(t * 20) * 0.05, tail: Math.sin(t * 3) * 0.2 });
    ctx.restore();

    // ---------- Pépin (dessiné par-dessus) ----------
    ctx.save(); ctx.translate(...pos); ctx.rotate(rotZ); ctx.scale(facing * 1.3 * sx, 1.3 * sy);
    drawPepin(ctx, P);
    ctx.restore();
    // étoiles qui tournent autour de sa tête sonnée
    if (t > 6.35 && t < 7.2) for (let i = 0; i < 3; i++) { const a = t * 6 + (i * Math.PI * 2) / 3; star(ctx, pos[0] + Math.cos(a) * 70 - 20, pos[1] - 250 + Math.sin(a) * 18, 14, t * 3, 700 + i); }
    // éclat d'impact
    if (t > 3.2 && t < 3.5) { const k = range(t, 3.2, 3.5); for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; const r0 = 90 + k * 80, r1 = r0 + 50 * (1 - k); line(ctx, [[IMPACT[0] + Math.cos(a) * r0, IMPACT[1] - 150 + Math.sin(a) * r0], [IMPACT[0] + Math.cos(a) * r1, IMPACT[1] - 150 + Math.sin(a) * r1]], 7, 650 + i); } }

    finish();
    fx.flash(t > 3.2 && t < 3.24 ? 0.9 : 0);
    const pop = (t0, text, x, y, o = {}) => { const d = o.dur || 0.9; if (t < t0 || t > t0 + d) return null; const k = (t - t0) / d; return { text, x, y: y - k * 0.02, size: o.size || 140, rot: o.rot ?? -6, scale: ease.elastic(clamp(k * 3.2)) * (1 - ease.in(range(k, 0.75, 1))) + 0.001 }; };
    fx.set([pop(1.25, 'HOP !', 0.3, 0.3, { size: 110, dur: 0.6 }), pop(1.7, 'YAHOOO !', 0.55, 0.2, { size: 120, dur: 1.1 }), pop(2.85, 'GLOUPS', 0.62, 0.3, { size: 110, dur: 0.45 }),
      pop(3.2, 'SPLATCH !', 0.45, 0.25, { size: 190, rot: -8 }), pop(3.6, 'fuiiiiik…', 0.62, 0.72, { size: 80, dur: 1.4 }), pop(5.5, 'BOÏNG !', 0.55, 0.3, { size: 160 }),
      pop(5.9, 'HO HO HO !', 0.72, 0.18, { size: 120, dur: 1.5 }), pop(6.9, 'hé hé', 0.2, 0.45, { size: 90, dur: 0.9 })].filter(Boolean));
  };
}
