// Capture image par image du jeu de karts : requestAnimationFrame et performance.now pilotés par une horloge virtuelle.
const { chromium } = require('playwright');
(async () => {
  const dir = process.argv[2], W = 1600, H = 900;
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: W, height: H } });
  await p.addInitScript(() => {
    let vt = 1000, q = [], free = true;
    const realRaf = window.requestAnimationFrame.bind(window);
    performance.now = () => vt;
    window.requestAnimationFrame = (cb) => { if (free) return realRaf(cb); q.push(cb); return q.length; };
    window.__lock = () => { free = false; };
    window.__step = (ms) => { vt += ms; const l = q; q = []; for (const cb of l) cb(vt); };
    // tant que libre, le temps virtuel suit le temps réel
    const tick = (t) => { if (free) { vt = 1000 + t; realRaf(tick); } }; realRaf(tick);
  });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('http://localhost:8765/kappa/index.html'); await p.waitForTimeout(6000);
  const btn = (txt) => p.locator('button', { hasText: txt }).first();
  try { await btn('Nuit').click({ timeout: 2000 }); } catch {}
  await p.waitForTimeout(1500);
  await p.evaluate(() => window.__lock()); await p.waitForTimeout(300);
  let n = 0; const t0 = Date.now();
  const snap = async (k = 1) => { for (let i = 0; i < k; i++) { await p.evaluate(() => window.__step(1000 / 30)); await p.screenshot({ path: `${dir}/${String(++n).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 90 }); } };
  await snap(24); const next = p.locator('button', { hasText: '▶' });
  for (let i = 0; i < 2; i++) { await next.nth(1).click().catch(() => {}); await snap(14); }
  console.log('garage', n, ((Date.now() - t0) / n).toFixed(0), 'ms/image');
  await btn('Lancer la course').click(); await p.keyboard.down('ArrowUp');
  for (let i = 0; i < 30 * 15; i++) { await snap(1); if (i % 90 === 0) console.log('course', i, ((Date.now() - t0) / n).toFixed(0), 'ms/image'); }
  await b.close();
})();
