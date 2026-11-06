// Pub Odyssée Games, 16:9. Expose window.renderFrame(t) (asynchrone) au moteur de rendu.
import { createScreen } from './screen.js';

const TL = await (await fetch('timeline.json')).json();
const COUNTS = await (await fetch('/out/odyssee/frames/counts.json')).json();
const cache = new Map();
const load = (src) => { if (!cache.has(src)) { const im = new Image(); im.src = src; cache.set(src, im); } return cache.get(src); };
const pending = new Set();
const IMG = {
  games: ['phi', 'infini', 'alpha', 'beta', 'pi', 'delta', 'sigma', 'tau', 'theta', 'gamma', 'xi', 'eta', 'zeta', 'chi', 'epsilon', 'mu', 'nu', 'omicron', 'rho', 'iota', 'upsilon', 'digamma', 'koppa', 'sampi', 'stigma', 'heta', 'san', 'sho', 'shai', 'fei', 'khei', 'hori', 'gangia', 'shima', 'dei', 'kai', 'wau', 'sam', 'qop', 'lun', 'tet', 'ant', 'dot', 'ado', 'yps', 'pom', 'thy', 'lambda'],
  get(src) { const im = load(src); if (!im.complete) pending.add(im); return im; },
  frame(name, lt) { const n = COUNTS[name] || 1; const i = Math.min(n, Math.max(1, Math.floor(lt * 30) + 1)); return this.get(`/out/odyssee/frames/${name}/${String(i).padStart(4, '0')}.jpg`); },
};
// précharge les visuels fixes
for (const g of IMG.games) IMG.get(`assets/jeux/${g}.jpg`);
for (const f of ['odyssee-lockup-vertical', 'odyssee-lockup-horizontal', 'odyssee-symbole']) IMG.get(`assets/logo/${f}.png`);
await Promise.all(['600 80px Cinzel', '700 80px Cinzel', '400 30px Jost', '500 30px Jost', '600 30px Jost'].map((f) => document.fonts.load(f)));
const screen = createScreen(TL, IMG);

async function settle() { while (pending.size) { const l = [...pending]; pending.clear(); await Promise.all(l.map((im) => im.decode().catch(() => {}))); } }
window.EPISODE = { duration: TL.duration, fps: 30, width: 1920, height: 1080 };
window.renderFrame = async (t) => { screen.draw(t); if (pending.size) { await settle(); screen.draw(t); } };
await settle();
const Q = new URLSearchParams(location.search);
if (Q.get('cover')) { screen.poster(); await settle(); screen.poster(); } else await window.renderFrame(Number(Q.get('t') || 0));
window.READY = true;
