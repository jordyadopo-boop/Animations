// Rendu d'un film « motion » (une page HTML pilotée par window.renderFrame(t)) en MP4 vertical.
// Flou de mouvement : chaque image est la moyenne de --sub sous-images (obturateur à 360°).
// Usage :
//   node motion/render.js portfolio                 -> out/portfolio.mp4 (avec out/portfolio.wav s'il existe)
//   node motion/render.js portfolio --stills 1,5.2  -> out/stills/portfolio_*.jpg
//   node motion/render.js portfolio --sub 1         (sans flou de mouvement, plus rapide)
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { serve, ROOT } from '../render/serve.js';

const { chromium } = createRequire(import.meta.url)('playwright');
const name = process.argv[2] || 'portfolio';
const args = Object.fromEntries(process.argv.slice(3).reduce((a, v, i, arr) => (v.startsWith('--') ? [...a, [v.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]] : a), []));
const outDir = path.join(ROOT, 'out'); fs.mkdirSync(path.join(outDir, 'stills'), { recursive: true });
const run = (cmd, a) => new Promise((res, rej) => spawn(cmd, a, { stdio: 'inherit' }).on('close', (c) => (c ? rej(new Error(`${cmd} : code ${c}`)) : res())));

const srv = await serve();
// WebGL logiciel (SwiftShader) : les films qui contiennent une scène three.js se rendent aussi sans GPU
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
page.on('pageerror', (e) => { console.error('[page]', e.message); process.exit(1); });
page.on('console', (m) => { if (m.type() === 'error') console.error('[page]', m.text()); });
await page.goto(`http://localhost:${srv.address().port}/motion/${name}/index.html?render`);
await page.waitForFunction(() => window.READY === true, null, { timeout: 60000 });
const { duration, fps, width, height } = await page.evaluate(() => window.FILM);
const shot = (o) => page.screenshot({ ...o, clip: { x: 0, y: 0, width, height }, animations: 'allow', caret: 'initial' });

if (args.stills) {
  for (const t of String(args.stills).split(',').map(Number)) {
    await page.evaluate((t) => window.renderFrame(t), t);
    const f = path.join(outDir, 'stills', `${name}_${t.toFixed(2)}.jpg`);
    await shot({ path: f, type: 'jpeg', quality: 90 });
    console.log(f);
  }
} else {
  const sub = Number(args.sub || 4), rate = fps * sub, n = Math.round(duration * rate);
  const silent = path.join(outDir, `${name}_video.mp4`);
  // tmix moyenne les « sub » dernières sous-images ; on garde la dernière de chaque groupe
  const vf = sub > 1 ? `tmix=frames=${sub},select='eq(mod(n\\,${sub})\\,${sub - 1})',setpts=N/(${fps}*TB)` : 'null';
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(rate), '-c:v', 'mjpeg', '-i', '-',
    '-vf', vf, '-r', String(fps), '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', silent], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    await page.evaluate((t) => window.renderFrame(t), Math.max(0, (i - (sub - 1) / 2) / rate));
    const buf = await shot({ type: 'jpeg', quality: 93 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % 20 === 0) process.stdout.write(`\rsous-image ${i}/${n}  (${((Date.now() - t0) / (i + 1)).toFixed(0)} ms)`);
  }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
  console.log(`\nvidéo muette : ${silent}`);
  const wav = path.join(outDir, `${name}.wav`), final = path.join(outDir, `${name}.mp4`);
  if (fs.existsSync(wav)) {
    await run('ffmpeg', ['-y', '-v', 'error', '-i', silent, '-i', wav, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', final]);
    console.log(`final : ${final}`);
  }
}
await browser.close(); srv.close();
