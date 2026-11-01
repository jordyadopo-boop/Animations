// Photos de profil de la page (1080×1080, lisibles en petit dans un cercle).
// t = 0 : le bonhomme seul ; t = 1 : la main tendue ; t = 2 : bonhomme + nom ; t = 3 / 4 : images 1 et 2 avec le nom.
import { PI, figure, mixPose } from '../engine/bonhomme.js';
export const world = 'flat', fps = 1, duration = 6, width = 1080, height = 1080;

function fond(ctx, W, H) {
  ctx.fillStyle = '#050506'; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W / 2, H * 0.48, 30, W / 2, H * 0.5, W * 0.62); g.addColorStop(0, 'rgba(90,92,104,0.75)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function sol(ctx, W, y) { const g = ctx.createLinearGradient(0, y, 0, y + 260); g.addColorStop(0, 'rgba(70,72,82,0.55)'); g.addColorStop(1, 'rgba(5,5,6,0)'); ctx.fillStyle = g; ctx.fillRect(0, y, W, 260); ctx.strokeStyle = 'rgba(210,214,226,0.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(140, y); ctx.lineTo(W - 140, y); ctx.stroke(); }
// bonhomme vu de face (symétrique), lumineux
function face(ctx, x, y, h, o = {}) {
  const w = 0.12 * h, hr = 0.12 * h, hip = y - 0.5 * h, sh = hip - 0.3 * h, a = o.arms ?? 0.28;
  ctx.save(); ctx.strokeStyle = o.color || '#fff'; ctx.fillStyle = o.color || '#fff'; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; if (o.glow) { ctx.shadowColor = o.color || '#fff'; ctx.shadowBlur = o.glow; }
  const seg = (pts, lw) => { ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(...pts[0]); pts.slice(1).forEach((p) => ctx.lineTo(...p)); ctx.stroke(); };
  [-1, 1].forEach((sd) => { seg([[x + sd * w * 0.45, hip], [x + sd * w * 0.75, hip + 0.25 * h], [x + sd * w * 0.85, y - w * 0.4]], w); seg([[x + sd * w * 0.55, sh + w * 0.3], [x + sd * (w * 0.6 + Math.sin(a) * 0.17 * h), sh + w * 0.3 + Math.cos(a) * 0.17 * h], [x + sd * (w * 0.6 + Math.sin(a) * 0.17 * h + Math.sin(a * 0.6) * 0.16 * h), sh + w * 0.3 + Math.cos(a) * 0.17 * h + Math.cos(a * 0.6) * 0.16 * h]], w * 0.92); });
  seg([[x, hip], [x, sh]], w * 1.35); ctx.beginPath(); ctx.arc(x, sh - hr * 1.3, hr, 0, PI * 2); ctx.fill(); ctx.restore();
}
function faceReflet(ctx, x, y, h, o) { ctx.save(); ctx.beginPath(); ctx.rect(0, y, 1080, 1080); ctx.clip(); ctx.translate(0, 2 * y); ctx.scale(1, -1); ctx.globalAlpha = 0.22; face(ctx, x, y, h, { ...o, glow: 0 }); ctx.restore(); face(ctx, x, y, h, o); }
function avecReflet(ctx, x, y, h, pose, o) { ctx.save(); ctx.beginPath(); ctx.rect(0, y, 1080, 1080); ctx.clip(); ctx.translate(0, 2 * y); ctx.scale(1, -1); ctx.globalAlpha = 0.22; figure(ctx, x, y, h, pose, { ...o, glow: 0 }); ctx.restore(); figure(ctx, x, y, h, pose, o); }

export function build({ ctx, begin, W, H }) {
  return (t) => {
    begin(); fond(ctx, W, H);
    const v = Math.round(t);
    const nom = (y, s = 1) => { ctx.save(); ctx.fillStyle = '#f0f0f4'; ctx.textAlign = 'center'; ctx.shadowColor = '#ffffff'; ctx.shadowBlur = 16;
      ctx.font = `600 ${Math.round(96 * s)}px 'Courier New', monospace`; try { ctx.letterSpacing = `${Math.round(16 * s)}px`; } catch (e) {} ctx.fillText('LUMIÈRE', 548, y);
      ctx.font = `500 ${Math.round(56 * s)}px 'Courier New', monospace`; try { ctx.letterSpacing = `${Math.round(22 * s)}px`; } catch (e) {} ctx.globalAlpha = 0.85; ctx.fillText('HUMAINE', 552, y + 74 * s); ctx.restore(); };
    if (v === 3) { sol(ctx, W, 640); faceReflet(ctx, 540, 640, 440, { color: '#ffffff', glow: 44, arms: 0.3 }); nom(850); return; }
    if (v === 4) { ctx.save(); ctx.translate(540, 300); ctx.scale(0.78, 0.78); ctx.translate(-540, -300);
      sol(ctx, W, 800); avecReflet(ctx, 330, 800, 520, { kneel: 1, lean: 0.1, head: -0.25, armF: [2.2, -0.25], armB: [0.4, 0.5] }, { color: '#7a7c86', glow: 4 });
      avecReflet(ctx, 770, 800, 560, { lean: 0.22, head: 0.3, armF: [1.25, 0.2], armB: [0.2, 0.3], legF: [0.18, 0.08], legB: [-0.12, 0.05] }, { color: '#ffffff', glow: 42, flip: -1 });
      ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(545, 520, 5, 545, 520, 130); g.addColorStop(0, 'rgba(255,250,235,0.55)'); g.addColorStop(1, 'rgba(255,250,235,0)'); ctx.fillStyle = g; ctx.fillRect(400, 400, 300, 300); ctx.restore();
      ctx.fillStyle = '#050506'; ctx.fillRect(0, 760, W, 320); nom(860); return; }
    if (v === 0) { // le bonhomme lumineux, droit, le regard levé
      sol(ctx, W, 830); faceReflet(ctx, 540, 830, 620, { color: '#ffffff', glow: 50, arms: 0.3 });
    } else if (v === 1) { // la main tendue : un bonhomme lumineux relève un bonhomme gris
      sol(ctx, W, 800);
      avecReflet(ctx, 330, 800, 520, { kneel: 1, lean: 0.1, head: -0.25, armF: [2.2, -0.25], armB: [0.4, 0.5] }, { color: '#7a7c86', glow: 4 });
      avecReflet(ctx, 770, 800, 560, { lean: 0.22, head: 0.3, armF: [1.25, 0.2], armB: [0.2, 0.3], legF: [0.18, 0.08], legB: [-0.12, 0.05] }, { color: '#ffffff', glow: 42, flip: -1 });
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(545, 520, 5, 545, 520, 130); g.addColorStop(0, 'rgba(255,250,235,0.55)'); g.addColorStop(1, 'rgba(255,250,235,0)'); ctx.fillStyle = g; ctx.fillRect(400, 400, 300, 300); ctx.restore();
    } else { // bonhomme + nom
      sol(ctx, W, 600); faceReflet(ctx, 540, 600, 400, { color: '#ffffff', glow: 40, arms: 0.3 }); nom(830, 1.05);
    }
  };
}
