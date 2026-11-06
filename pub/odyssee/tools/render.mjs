// Rendu de la pub Odyssée (16:9) : Chromium headless -> JPEG -> ffmpeg.
//   node pub/odyssee/tools/render.mjs --stills 1,5,12      images fixes -> out/odyssee/stills/
//   node pub/odyssee/tools/render.mjs --workers 4          vidéo complète muette -> out/odyssee/video.mp4
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { serve, ROOT } from '../../../render/serve.js';
const { chromium } = createRequire(import.meta.url)('playwright');
const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith('--') ? [...a, [v.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]] : a), []));
const OUT = path.join(ROOT, 'out', 'odyssee'); fs.mkdirSync(path.join(OUT, 'stills'), { recursive: true }); fs.mkdirSync(path.join(OUT, 'parts'), { recursive: true });
const TL = JSON.parse(fs.readFileSync(path.join(ROOT, 'pub/odyssee/timeline.json'), 'utf8'));
const FPS = 30, total = Math.round(TL.duration * FPS);
const run = (cmd, a) => new Promise((res, rej) => spawn(cmd, a, { stdio: 'inherit' }).on('close', (c) => (c ? rej(new Error(cmd + ' ' + c)) : res())));

if (args.workers && args.part === undefined) {
  const W = Number(args.workers), per = Math.ceil(total / W), t0 = Date.now();
  await Promise.all([...Array(W)].map((_, i) => new Promise((res, rej) => {
    const c = spawn(process.execPath, [process.argv[1], '--part', String(i), '--a', String(i * per), '--b', String(Math.min(total, (i + 1) * per))], { stdio: ['ignore', 'pipe', 'inherit'] });
    c.stdout.on('data', (d) => process.stdout.write(`[${i}] ${d}`)); c.on('close', (code) => (code ? rej(new Error('part ' + i)) : res()));
  })));
  const list = path.join(OUT, 'parts', 'list.txt'); fs.writeFileSync(list, [...Array(W)].map((_, i) => `file 'part${i}.mp4'`).join('\n'));
  await run('ffmpeg', ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', path.join(OUT, 'video.mp4')]);
  console.log(`vidéo muette en ${((Date.now() - t0) / 60000).toFixed(1)} min`); process.exit(0);
}
const srv = await serve();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.on('pageerror', (e) => { console.error('[page]', e.message); process.exit(1); });
page.on('console', (m) => { if (m.type() === 'error') console.error('[page]', m.text()); });
await page.goto(`http://localhost:${srv.address().port}/pub/odyssee/index.html`);
await page.waitForFunction(() => window.READY === true, null, { timeout: 0 });
const shot = (o) => page.screenshot({ ...o, clip: { x: 0, y: 0, width: 1920, height: 1080 }, timeout: 0 });
if (args.stills) {
  for (const t of String(args.stills).split(',').map(Number)) { await page.evaluate((t) => window.renderFrame(t), t); const f = path.join(OUT, 'stills', `${t.toFixed(2)}.jpg`); await shot({ path: f, type: 'jpeg', quality: 85 }); console.log(f); }
} else {
  const a = Number(args.a ?? 0), b = Number(args.b ?? total);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', path.join(OUT, 'parts', `part${args.part ?? 0}.mp4`)], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = a; i < b; i++) {
    await page.evaluate((t) => window.renderFrame(t), i / FPS);
    const buf = await shot({ type: 'jpeg', quality: 93 }); if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if ((i - a) % 150 === 0) console.log(`${i - a}/${b - a}`);
  }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
}
await browser.close(); srv.close();
