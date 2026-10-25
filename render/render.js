// Rendu headless : Chromium (WebGL logiciel) -> images -> ffmpeg -> MP4 (16:9 par défaut) avec bande-son.
// Usage :
//   node render/render.js --ep ep01                      (épisode complet -> out/ep01.mp4)
//   node render/render.js --ep ep01 --stills 3.2,7.5     (images fixes -> out/stills/)
//   node render/render.js --ep ep01 --from 10 --to 14    (extrait)
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { serve, ROOT } from './serve.js';

// Playwright : installé localement (npm i -D playwright) ou globalement
const { chromium } = createRequire(import.meta.url)('playwright');

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith('--') ? [...a, [v.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]] : a), []));
const ep = args.ep || 'ep01';
const outDir = path.join(ROOT, 'out'); fs.mkdirSync(path.join(outDir, 'stills'), { recursive: true });

// rendu parallèle : découpe en tranches rendues par plusieurs processus, puis assemblage + son
if (args.workers && !args.part) {
  const W = Number(args.workers);
  const probe = await import(path.join(ROOT, 'src/episodes', `${ep}.js`));
  const fps = probe.fps || 30, total = Math.round(probe.duration * fps), per = Math.ceil(total / W);
  fs.mkdirSync(path.join(outDir, 'parts'), { recursive: true });
  const t0 = Date.now();
  await Promise.all([...Array(W)].map((_, i) => new Promise((res, rej) => {
    const a = i * per, b = Math.min(total, (i + 1) * per); if (a >= b) return res();
    const c = spawn(process.execPath, [process.argv[1], '--ep', ep, '--from', String(a / fps), '--to', String(b / fps), '--part', String(i)], { stdio: ['ignore', 'pipe', 'inherit'] });
    c.stdout.on('data', (d) => { const m = String(d).match(/image (\d+)\/(\d+)/g); if (m) process.stdout.write(`\r[tranche ${i}] ${m.at(-1)}   `); });
    c.on('close', (code) => (code ? rej(new Error(`tranche ${i} : code ${code}`)) : res()));
  })));
  const list = path.join(outDir, 'parts', `${ep}.txt`);
  fs.writeFileSync(list, [...Array(W)].map((_, i) => `file '${ep}_part${i}.mp4'`).filter((_, i) => i * per < total).join('\n'));
  const silent = path.join(outDir, `${ep}_video.mp4`), final = path.join(outDir, `${ep}.mp4`), wav = path.join(outDir, `${ep}.wav`);
  await new Promise((r) => spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', silent], { stdio: 'inherit' }).on('close', r));
  if (fs.existsSync(wav)) await new Promise((r) => spawn('ffmpeg', ['-y', '-v', 'error', '-i', silent, '-i', wav, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', final], { stdio: 'inherit' }).on('close', r));
  console.log(`\nfini en ${((Date.now() - t0) / 60000).toFixed(1)} min : ${final}`);
  process.exit(0);
}
const srv = await serve();
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1920 } });
page.on('console', (m) => { if (m.text().startsWith('sculpt')) console.log(m.text()); if (m.type() === 'error') { console.error('[page]', m.text()); if (/module|SyntaxError|not provide/.test(m.text())) process.exit(1); } });
page.on('pageerror', (e) => { console.error('[page]', e.message); process.exit(1); });
await page.goto(`http://localhost:${srv.address().port}/?ep=${ep}${args.q ? '&' + args.q : ''}`);
await page.waitForFunction(() => window.READY === true, null, { timeout: 0 });
const { duration, fps, width, height } = await page.evaluate(() => window.EPISODE);
const shot = (o) => page.screenshot({ ...o, clip: { x: 0, y: 0, width, height }, timeout: 0, animations: 'allow', caret: 'initial' });
const stage = await page.$('#stage');

if (args.stills) {
  for (const t of String(args.stills).split(',').map(Number)) {
    await page.evaluate((t) => window.renderFrame(t), t);
    const f = path.join(outDir, 'stills', `${ep}_${t.toFixed(2)}.jpg`);
    await shot({ path: f, type: 'jpeg', quality: 90 });
    console.log(f);
  }
} else {
  const from = Number(args.from || 0), to = Math.min(Number(args.to || duration), duration);
  const n = Math.round((to - from) * fps);
  const suffix = args.from || args.to ? `_${from}-${to}` : '';
  const silent = args.part !== undefined ? path.join(outDir, 'parts', `${ep}_part${args.part}.mp4`) : path.join(outDir, `${ep}${suffix}_video.mp4`);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', silent], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    await page.evaluate((t) => window.renderFrame(t), from + i / fps);
    const buf = await shot({ type: 'jpeg', quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % 30 === 0) process.stdout.write(`\rimage ${i}/${n}  (${((Date.now() - t0) / (i + 1)).toFixed(0)} ms/image)`);
  }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
  console.log(`\nvidéo muette : ${silent}`);
  const wav = path.join(outDir, `${ep}.wav`);
  if (fs.existsSync(wav) && args.part === undefined) {
    const final = path.join(outDir, `${ep}${suffix}.mp4`);
    await new Promise((r) => spawn('ffmpeg', ['-y', '-v', 'error', '-i', silent, '-ss', String(from), '-t', String(to - from), '-i', wav,
      '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', final], { stdio: 'inherit' }).on('close', r));
    console.log(`final : ${final}`);
  }
}
await browser.close(); srv.close();
