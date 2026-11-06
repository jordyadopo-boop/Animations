// Couverture de la vidéo : node pub/odyssee/tools/cover.mjs -> episodes_rendus/ODYSSEE_GAMES_couverture.jpg
import { createRequire } from 'node:module';
import path from 'node:path';
import { serve, ROOT } from '../../../render/serve.js';
const { chromium } = createRequire(import.meta.url)('playwright');
const srv = await serve(); const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('pageerror', (e) => { console.error(e.message); process.exit(1); });
await p.goto(`http://localhost:${srv.address().port}/pub/odyssee/index.html?cover=1`); await p.waitForFunction(() => window.READY === true);
const out = path.join(ROOT, 'episodes_rendus', 'ODYSSEE_GAMES_couverture.jpg');
await p.screenshot({ path: out, type: 'jpeg', quality: 92 }); console.log(out); await b.close(); srv.close();
