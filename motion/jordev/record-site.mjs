// Enregistre une vraie navigation sur le site « Je fais ton site » (dépôt business-sites), image par image :
// curseur qui va sur « Portfolio », clic, défilement fluide jusqu'aux réalisations, survol d'une carte.
// Le cerveau du fond est piloté en mode vidéo du site (window.__VIDEO + __brain.render), donc chaque image est exacte.
// Usage : node motion/jordev/record-site.mjs <chemin du dépôt business-sites>   -> motion/jordev/assets/frames/site/001.jpg …
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const { chromium } = createRequire(import.meta.url)('playwright');
const ROOT = process.argv[2] || '../jordyadopo-boop/business-sites';
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'assets/frames/site');
const N = 66, W = 1280, H = 800;                  // 66 images, jouées en accéléré dans le film
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.glb': 'model/gltf-binary', '.woff2': 'font/woff2' };
const srv = http.createServer((q, res) => {
  let p = decodeURIComponent(new URL(q.url, 'http://x').pathname); if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
}).listen(0);
await new Promise((r) => srv.on('listening', r));

const ease = (u) => (u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2);
const lerp = (a, b, k) => a + (b - a) * k;
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: W, height: H } });
await p.addInitScript(() => { window.__VIDEO = true; });
await p.goto(`http://localhost:${srv.address().port}/`, { waitUntil: 'networkidle' });
await p.waitForFunction(() => window.__brain && window.__brain.ready(), null, { timeout: 90000 });
await p.evaluate(() => {   // curseur visible (même dessin que tools/video/scroll.cjs)
  const c = document.createElement('div'); c.id = '__cur';
  c.innerHTML = '<svg width="34" height="34" viewBox="0 0 24 24"><path d="M4 2l16 9-7 2-3 7z" fill="#fff" stroke="#000" stroke-width="1.6" stroke-linejoin="round"/></svg><i></i>';
  c.style.cssText = 'position:fixed;left:0;top:0;z-index:2147483647;pointer-events:none;filter:drop-shadow(0 3px 6px rgba(0,0,0,.5))';
  c.querySelector('i').style.cssText = 'position:absolute;left:-14px;top:-14px;width:28px;height:28px;border-radius:50%;border:3px solid #ff3b4e;opacity:0';
  document.documentElement.appendChild(c); document.documentElement.style.scrollBehavior = 'auto';
});
const geo = await p.evaluate(() => {
  const r = [...document.querySelectorAll('nav a')].find((a) => a.textContent.trim() === 'Portfolio').getBoundingClientRect();
  const sec = document.getElementById('portfolio'), card = sec.querySelector('.card, article, a');
  return { mx: r.left + r.width / 2, my: r.top + r.height / 2, top: sec.getBoundingClientRect().top + scrollY - 40, card: card ? card.getBoundingClientRect() : null };
});
fs.mkdirSync(OUT, { recursive: true });
for (let i = 0; i < N; i++) {
  const t = i / 30;
  const k1 = ease(Math.min(1, t / 0.55)), k2 = ease(Math.min(1, Math.max(0, (t - 0.65) / 1.2)));
  const cx = lerp(lerp(900, geo.mx, k1), 760, k2), cy = lerp(lerp(560, geo.my, k1), 460, k2);
  const ring = Math.max(0, 1 - Math.abs(t - 0.6) / 0.15);
  await p.evaluate(([y, cx, cy, ring, t]) => {
    scrollTo(0, y);
    const c = document.getElementById('__cur'); c.style.transform = `translate(${cx}px, ${cy}px)`;
    const r = c.querySelector('i'); r.style.opacity = ring; r.style.transform = `scale(${1 + (1 - ring) * 0.6})`;
    window.__brain.render(t + 2);
  }, [geo.top * k2, cx, cy, ring, t]);
  await p.screenshot({ path: path.join(OUT, `${String(i + 1).padStart(3, '0')}.jpg`), type: 'jpeg', quality: 80 });
}
console.log(`${N} images -> ${OUT}`);
await b.close(); srv.close();
