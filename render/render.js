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

const srv = await serve();
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1920 } });
page.on('console', (m) => { if (m.text().startsWith('sculpt')) console.log(m.text()); if (m.type() === 'error') { console.error('[page]', m.text()); if (/module|SyntaxError|not provide/.test(m.text())) process.exit(1); } });
page.on('pageerror', (e) => { console.error('[page]', e.message); process.exit(1); });
await page.goto(`http://localhost:${srv.address().port}/?ep=${ep}${args.q ? '&' + args.q : ''}`);
await page.waitForFunction(() => window.READY === true, null, { timeout: 120000 });
const { duration, fps } = await page.evaluate(() => window.EPISODE);
const stage = await page.$('#stage');

if (args.stills) {
  for (const t of String(args.stills).split(',').map(Number)) {
    await page.evaluate((t) => window.renderFrame(t), t);
    const f = path.join(outDir, 'stills', `${ep}_${t.toFixed(2)}.jpg`);
    await stage.screenshot({ path: f, type: 'jpeg', quality: 90 });
    console.log(f);
  }
} else {
  const from = Number(args.from || 0), to = Math.min(Number(args.to || duration), duration);
  const n = Math.round((to - from) * fps);
  const suffix = args.from || args.to ? `_${from}-${to}` : '';
  const silent = path.join(outDir, `${ep}${suffix}_video.mp4`);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', silent], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    await page.evaluate((t) => window.renderFrame(t), from + i / fps);
    const buf = await stage.screenshot({ type: 'jpeg', quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % 30 === 0) process.stdout.write(`\rimage ${i}/${n}  (${((Date.now() - t0) / (i + 1)).toFixed(0)} ms/image)`);
  }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
  console.log(`\nvidéo muette : ${silent}`);
  const wav = path.join(outDir, `${ep}.wav`);
  if (fs.existsSync(wav)) {
    const final = path.join(outDir, `${ep}${suffix}.mp4`);
    await new Promise((r) => spawn('ffmpeg', ['-y', '-v', 'error', '-i', silent, '-ss', String(from), '-t', String(to - from), '-i', wav,
      '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', final], { stdio: 'inherit' }).on('close', r));
    console.log(`final : ${final}`);
  }
}
await browser.close(); srv.close();
