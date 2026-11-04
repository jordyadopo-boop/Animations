// Rendu headless d'une vidéo de trajet -> out/trajet_<nom>.mp4 (1080x1920, 30 i/s)
// Usage : node trajets/render.mjs --name bassam_angre [--fmt carre] [--stills 0,5,10] [--workers 4] [--audio fichier.wav]
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { serve, ROOT } from '../render/serve.js';

const { chromium } = createRequire(import.meta.url)('playwright');
const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith('--') ? [...a, [v.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]] : a), []));
const name = args.name || 'bassam_angre';
const fmt = args.fmt === 'carre' ? 'carre' : '';
const VH = fmt ? 1080 : 1920, SUF = fmt ? '_carre' : '';
const outDir = path.join(ROOT, 'out'); fs.mkdirSync(path.join(outDir, 'stills'), { recursive: true }); fs.mkdirSync(path.join(outDir, 'parts'), { recursive: true });
const run = (cmd, a) => new Promise((res, rej) => spawn(cmd, a, { stdio: 'inherit' }).on('close', (c) => (c ? rej(new Error(`${cmd} ${c}`)) : res())));

if (args.workers && args.part === undefined) {
  const Wk = Number(args.workers), cfg = (await import('./trajets.js')).default[name], fps = 30, total = Math.round(cfg.duration * fps), per = Math.ceil(total / Wk);
  const t0 = Date.now();
  await Promise.all([...Array(Wk)].map((_, i) => new Promise((res, rej) => {
    const c = spawn(process.execPath, [process.argv[1], '--name', name, ...(fmt ? ['--fmt', fmt] : []), '--f0', String(i * per), '--f1', String(Math.min(total, (i + 1) * per)), '--part', String(i)], { stdio: ['ignore', 'pipe', 'inherit'] });
    c.stdout.on('data', (d) => { const m = String(d).match(/image (\d+)\/(\d+)/g); if (m) process.stdout.write(`\r[tranche ${i}] ${m.at(-1)}   `); });
    c.on('close', (code) => (code ? rej(new Error(`tranche ${i}`)) : res()));
  })));
  const list = path.join(outDir, 'parts', `${name}.txt`);
  fs.writeFileSync(list, [...Array(Wk)].map((_, i) => `file '${name}${SUF}_part${i}.mp4'`).join('\n'));
  const silent = path.join(outDir, `trajet_${name}${SUF}_video.mp4`), final = path.join(outDir, `trajet_${name}${SUF}.mp4`);
  await run('ffmpeg', ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', silent]);
  if (args.audio) await run('ffmpeg', ['-y', '-v', 'error', '-i', silent, '-i', args.audio, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', final]);
  else await run('ffmpeg', ['-y', '-v', 'error', '-i', silent, '-c', 'copy', '-movflags', '+faststart', final]);
  console.log(`\nfini en ${((Date.now() - t0) / 60000).toFixed(1)} min : ${final}`);
  process.exit(0);
}

const srv = await serve();
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--js-flags=--max-old-space-size=8000'] });
const page = await browser.newPage({ viewport: { width: 1080, height: VH } });
page.on('console', (m) => console.log('[page]', m.text()));
page.on('pageerror', (e) => { console.error('[page]', e.message); process.exit(1); });
const tl = Date.now();
await page.goto(`http://localhost:${srv.address().port}/trajets/index.html?name=${name}${fmt ? '&fmt=' + fmt : ''}`);
await page.waitForFunction(() => window.READY === true, null, { timeout: 0 });
console.log(`scène prête en ${((Date.now() - tl) / 1000).toFixed(0)} s`);
const shot = (o) => page.screenshot({ ...o, clip: { x: 0, y: 0, width: 1080, height: VH }, timeout: 0 });

if (args.stills) {
  for (const t of String(args.stills).split(',').map(Number)) {
    const t1 = Date.now();
    await page.evaluate((t) => window.renderFrame(t), t);
    const f = path.join(outDir, 'stills', `trajet_${name}${SUF}_${t.toFixed(2)}.jpg`);
    await shot({ path: f, type: 'jpeg', quality: 88 });
    console.log(f, `${Date.now() - t1} ms`);
  }
} else {
  const { duration, fps } = await page.evaluate(() => window.EPISODE);
  const f0 = Number(args.f0 || 0), f1 = Number(args.f1 || Math.round(duration * fps)), n = f1 - f0;
  const silent = args.part !== undefined ? path.join(outDir, 'parts', `${name}${SUF}_part${args.part}.mp4`) : path.join(outDir, `trajet_${name}${SUF}.mp4`);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', silent], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    await page.evaluate((t) => window.renderFrame(t), (f0 + i) / fps);
    const buf = await shot({ type: 'jpeg', quality: 93 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % 10 === 0) process.stdout.write(`\rimage ${i}/${n}  (${((Date.now() - t0) / (i + 1)).toFixed(0)} ms/image)\n`);
  }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
  console.log(`vidéo : ${silent}`);
}
await browser.close(); srv.close();
