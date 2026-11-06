// Filme le vrai site Le Glaceur image par image (horloge virtuelle : 30 i/s parfaites), avec un curseur animé.
// Usage : node pub/leglaceur/tools/capture-site.cjs http://127.0.0.1:5179 home|devis <dossier de sortie> [timeline.json]
const { chromium } = require('playwright');
const fs = require('fs');
const [base, which, dir, tlPath] = process.argv.slice(2);
fs.mkdirSync(dir, { recursive: true });
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.addInitScript(() => {
    let vt = 1000, q = [], free = true; const realRaf = window.requestAnimationFrame.bind(window);
    performance.now = () => vt;
    window.requestAnimationFrame = (cb) => { if (free) return realRaf(cb); q.push(cb); return q.length; };
    window.__lock = () => { free = false; };
    window.__step = (ms) => { vt += ms; const l = q; q = []; for (const cb of l) cb(vt); };
    const tick = (t) => { if (free) { vt = 1000 + t; realRaf(tick); } }; realRaf(tick);
    // curseur dessiné dans la page
    addEventListener('DOMContentLoaded', () => {
      const c = document.createElement('div'); c.id = '__cur';
      c.style.cssText = 'position:fixed;left:0;top:0;width:34px;height:34px;z-index:2147483647;pointer-events:none;transform:translate(960px,700px);';
      c.innerHTML = '<svg width="34" height="34" viewBox="0 0 24 24"><path d="M4 2l15 11-6.5 1.2L9 21z" fill="#fff" stroke="#0a1f44" stroke-width="1.6" stroke-linejoin="round"/></svg><div id="__rip" style="position:absolute;left:-22px;top:-22px;width:44px;height:44px;border-radius:50%;border:3px solid #4d9bff;opacity:0"></div>';
      document.body.appendChild(c);
    });
  });
  p.on('pageerror', (e) => console.log('ERR', e.message));
  let n = 0, cx = 960, cy = 700;
  const snap = async (k = 1) => { for (let i = 0; i < k; i++) { await p.evaluate(() => window.__step(1000 / 30)); await p.screenshot({ path: `${dir}/${String(++n).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 90 }); } };
  const setCur = (x, y, rip = 0) => p.evaluate(([x, y, r]) => { const c = document.getElementById('__cur'); if (!c) return; c.style.transform = `translate(${x}px,${y}px)`; const e = document.getElementById('__rip'); e.style.opacity = r > 0 ? String(1 - r) : '0'; e.style.transform = `scale(${0.4 + r * 1.4})`; }, [x, y, rip]);
  async function moveTo(loc, frames = 12) {
    await loc.scrollIntoViewIfNeeded().catch(() => {});
    const bb = await loc.boundingBox(); if (!bb) return;
    const tx = bb.x + bb.width / 2, ty = bb.y + bb.height / 2, sx = cx, sy = cy;
    for (let i = 1; i <= frames; i++) { const k = 1 - Math.pow(1 - i / frames, 3); cx = sx + (tx - sx) * k; cy = sy + (ty - sy) * k; await setCur(cx, cy); await snap(); }
  }
  async function click(loc) { await moveTo(loc); await loc.click({ force: true }); for (let i = 1; i <= 6; i++) { await setCur(cx, cy, i / 6); await snap(); } await setCur(cx, cy, 0); }
  async function hover(loc) { await moveTo(loc); await loc.hover({ force: true }).catch(() => {}); for (let i = 1; i <= 6; i++) { await setCur(cx, cy, i / 6); await snap(); } await setCur(cx, cy, 0); }
  async function wheel(dy, frames) { for (let i = 0; i < frames; i++) { await p.mouse.wheel(0, dy / frames); await snap(); } }
  const holdUntil = async (f) => { while (n < f) await snap(); };

  if (which === 'home') {
    await p.goto(base + '/'); await p.waitForTimeout(6000); await p.evaluate(() => window.__lock()); await p.waitForTimeout(200);
    await setCur(1300, 820); cx = 1300; cy = 820;
    await snap(120);            // hero 3D (4 s)
    await wheel(1100, 75);      // défilement vers les produits
    await snap(45);
  } else {
    const tl = JSON.parse(fs.readFileSync(tlPath, 'utf8')); const sc = tl.scenes.find((s) => s.id === 'order');
    const HOME = 66; // les ~2,2 premières secondes de la scène montrent l'accueil (voir screen.js)
    const F = (i) => Math.round((sc.lines[i].start - sc.start) * 30) - HOME;
    await p.goto(base + '/devis.html'); await p.waitForTimeout(6000); await p.evaluate(() => window.__lock()); await p.waitForTimeout(200);
    await snap(8);
    const plus = (sku) => p.locator(`button[data-step="1"][aria-controls="q-qty-${sku}"]`);
    await click(plus('glacons-5kg')); await click(plus('glacons-5kg')); await click(plus('glacons-5kg'));
    await click(plus('pilee-50kg')); await click(plus('pilee-50kg'));
    await holdUntil(F(1) - 14);
    await click(p.locator('input[name="mode"][value="retrait"]').locator('xpath=..'));
    await holdUntil(F(2) - 14);
    // survol seulement : un clic demanderait d'abord le nom et le téléphone du client
    await hover(p.locator('[data-action="pdf"]').first()); await snap(10);
    await hover(p.locator('[data-action="xlsx"]').first()); await snap(10);
    await hover(p.locator('[data-action="whatsapp"]').first()); await snap(12);
    await holdUntil(Math.round((sc.end - sc.start) * 30) - HOME + 20);
  }
  console.log(which, n, 'images'); await b.close();
})();
