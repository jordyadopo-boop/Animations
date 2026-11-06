// Pub Le Glaceur, 16:9. Expose window.renderFrame(t) (asynchrone) au moteur de rendu.
import { createScreen } from './screen.js';

const TL = await (await fetch('timeline.json')).json();
const COUNTS = await (await fetch('/out/leglaceur/frames/counts.json')).json();
const cache = new Map();
const load = (src) => { if (!cache.has(src)) { const im = new Image(); im.src = src; cache.set(src, im); } return cache.get(src); };
const pending = new Set();
const IMG = {
  games: [],
  get(src) { const im = load(src); if (!im.complete) pending.add(im); return im; },
  frame(name, lt) { const n = COUNTS[name] || 1; const i = Math.min(n, Math.max(1, Math.floor(lt * 30) + 1)); return this.get(`/out/leglaceur/frames/${name}/${String(i).padStart(4, '0')}.jpg`); },
};
// précharge les visuels fixes
for (const g of ['glacons', 'grain', 'pilee', 'carboglace', 'gobelet', 'barres', 'abidjan', 'eau-pure', 'usage-restaurant', 'usage-whisky', 'usage-event', 'usage-poisson', 'usage-jus']) IMG.get(`assets/img/${g}.jpg`);
for (const f of ['logo-full-white.svg']) IMG.get(`assets/brand/${f}`);
await Promise.all(["800 80px 'Barlow Condensed'", "600 80px 'Barlow Condensed'", '400 30px Barlow', '600 30px Barlow', '700 30px Barlow'].map((f) => document.fonts.load(f)));
const screen = createScreen(TL, IMG);

async function settle() { while (pending.size) { const l = [...pending]; pending.clear(); await Promise.all(l.map((im) => im.decode().catch(() => {}))); } }
window.EPISODE = { duration: TL.duration, fps: 30, width: 1920, height: 1080 };
window.renderFrame = async (t) => { screen.draw(t); if (pending.size) { await settle(); screen.draw(t); } };
await settle();
await window.renderFrame(Number(new URLSearchParams(location.search).get('t') || 0));
window.READY = true;
