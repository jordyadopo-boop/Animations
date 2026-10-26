// node render.js <startFrame> <endFrame> <out.mp4>   |  node render.js --stills t1,t2,... <dir>
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const ROOT = __dirname;
const TYPES = { '.js': 'text/javascript', '.html': 'text/html', '.json': 'application/json' };
function serve() {
  return new Promise(res => {
    const srv = http.createServer((req, r) => {
      const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
      fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' }); r.end(d); });
    }).listen(0, () => res(srv));
  });
}
(async () => {
  const srv = await serve();
  const port = srv.address().port;
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 720, height: 1280 } });
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.error('[page]', m.text()); });
  page.on('pageerror', e => console.error('[pageerror]', e.message));
  await page.goto(`http://localhost:${port}/web/index.html`);
  await page.waitForFunction(() => window.ready === true, null, { timeout: 120000 });
  const grab = async (t) => {
    const data = await page.evaluate((t) => { window.renderAt(t); return document.querySelector('canvas').toDataURL('image/jpeg', 0.93); }, t);
    return Buffer.from(data.split(',')[1], 'base64');
  };
  if (process.argv[2] === '--stills') {
    const ts = process.argv[3].split(',').map(Number), dir = process.argv[4];
    fs.mkdirSync(dir, { recursive: true });
    for (const t of ts) fs.writeFileSync(path.join(dir, `t${t.toFixed(2)}.jpg`), await grab(t));
  } else {
    const f0 = +process.argv[2], f1 = +process.argv[3], out = process.argv[4];
    const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', '24', '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let f = f0; f < f1; f++) {
      const buf = await grab(f / 24);
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if ((f - f0) % 48 === 0) console.log(`${out}: ${f - f0}/${f1 - f0}  ${((Date.now() - t0) / 1000 / Math.max(1, f - f0)).toFixed(2)} s/img`);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }
  await browser.close(); srv.close();
})();
