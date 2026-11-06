// Couvertures : node pub/odyssee/tools/cover.mjs [--v]  (16:9 -> ODYSSEE_GAMES_couverture.jpg, 9:16 -> ODYSSEE_GAMES_couverture_9x16.jpg)
import { createRequire } from 'node:module';
import path from 'node:path';
import { serve, ROOT } from '../../../render/serve.js';
const { chromium } = createRequire(import.meta.url)('playwright');
const V = process.argv.includes('--v'), VW = V ? 1080 : 1920, VH = V ? 1920 : 1080;
const srv = await serve(); const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: VW, height: VH } });
p.on('pageerror', (e) => { console.error(e.message); process.exit(1); });
await p.goto(`http://localhost:${srv.address().port}/pub/odyssee/index.html?cover=${V ? 'v' : '1'}`); await p.waitForFunction(() => window.READY === true);
const out = path.join(ROOT, 'episodes_rendus', V ? 'ODYSSEE_GAMES_couverture_9x16.jpg' : 'ODYSSEE_GAMES_couverture.jpg');
await p.screenshot({ path: out, type: 'jpeg', quality: 92 }); console.log(out); await b.close(); srv.close();
