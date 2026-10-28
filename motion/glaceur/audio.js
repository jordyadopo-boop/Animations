// Bande-son du film Le Glaceur : pop électro lumineuse à 120 BPM (ré majeur) + bruitages de glace, synthétisés et calés sur score.js.
// Usage : node motion/glaceur/audio.js   -> out/glaceur.wav (44,1 kHz stéréo)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as S from './score.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SR = 44100, N = Math.ceil(S.duration * SR) + SR, B = S.BEAT;
const L = new Float32Array(N), R = new Float32Array(N);

// ---------- outils ----------
let seed = 11; const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const noise = () => rnd() * 2 - 1;
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
function add(t0, sig, g = 1, pan = 0) {
  const s0 = Math.floor(t0 * SR), gl = g * Math.cos((pan + 1) * Math.PI / 4), gr = g * Math.sin((pan + 1) * Math.PI / 4);
  for (let i = 0; i < sig.length; i++) { const k = s0 + i; if (k >= 0 && k < N) { L[k] += sig[i] * gl; R[k] += sig[i] * gr; } }
}
function osc(dur, f, wave, env) {
  const n = Math.floor(dur * SR), out = new Float32Array(n); let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR; ph += (typeof f === 'function' ? f(t) : f) / SR; const p = ph % 1;
    const v = wave === 'sine' ? Math.sin(2 * Math.PI * p) : wave === 'saw' ? 2 * p - 1 : wave === 'square' ? (p < 0.5 ? 1 : -1) : wave === 'tri' ? 1 - 4 * Math.abs(p - 0.5) : noise();
    out[i] = v * env(t, dur);
  }
  return out;
}
const lp = (s, fc) => { const a = Math.exp(-2 * Math.PI * fc / SR); let y = 0; return s.map((x) => (y = (1 - a) * x + a * y)); };
const hp = (s, fc) => { const l = lp(s, fc); return s.map((x, i) => x - l[i]); };
const perc = (a, d) => (t) => Math.min(1, t / a) * Math.exp(-t / d);
const sum = (...ss) => { const n = Math.max(...ss.map((s) => s.length)), o = new Float32Array(n); ss.forEach((s) => s.forEach((v, i) => (o[i] += v))); return o; };

// ---------- instruments ----------
const kick = () => osc(0.45, (t) => 45 + 120 * Math.exp(-t * 28), 'sine', perc(0.002, 0.15));
const hat = (open) => hp(osc(open ? 0.2 : 0.05, 0, 'noise', perc(0.001, open ? 0.06 : 0.015)), 8000);
const snap = () => hp(lp(osc(0.2, 0, 'noise', perc(0.001, 0.05)), 5000), 1200);
const bass = (m, d) => lp(osc(d, mtof(m), 'saw', (t, D) => Math.min(1, t / 0.005) * Math.min(1, (D - t) / 0.02) * 0.9), 420);
const bell = (m, d = 0.5) => sum(osc(d, mtof(m), 'sine', perc(0.002, 0.18)), osc(d, mtof(m) * 2.76, 'sine', perc(0.001, 0.06)).map((v) => v * 0.35));
const pad = (ms, d) => { const n = Math.floor(d * SR), out = new Float32Array(n); ms.forEach((m) => [0, 0.1, -0.08].forEach((det) => { const s = osc(d, mtof(m + det), 'saw', (t, D) => Math.min(1, t / 0.3) * Math.min(1, (D - t) / 0.5)); for (let i = 0; i < n; i++) out[i] += s[i] / 9; })); return lp(out, 1800); };
// tintement de glace : partiels inharmoniques très aigus, courts
const clink = (f = 2400, d = 0.35) => sum(...[1, 2.32, 4.1, 5.43].map((r, i) => osc(d, f * r, 'sine', perc(0.0005, 0.07 / (i + 1))).map((v) => v * [1, 0.6, 0.35, 0.2][i])));
const thud = () => lp(osc(0.3, (t) => 70 + 80 * Math.exp(-t * 22), 'sine', perc(0.002, 0.09)), 600);
const whoosh = (d, up = true) => { const n = osc(d, 0, 'noise', (t, D) => Math.sin(Math.PI * Math.pow(t / D, up ? 1.6 : 0.6))); let y = 0; const out = new Float32Array(n.length); for (let i = 0; i < n.length; i++) { const k = i / n.length, fc = up ? 300 + 6000 * k * k : 6000 - 5400 * k; const a = Math.exp(-2 * Math.PI * fc / SR); y = (1 - a) * n[i] + a * y; out[i] = y; } return out; };
const tick = () => hp(osc(0.02, 0, 'noise', perc(0.0005, 0.004)), 3000);
const tap = () => sum(hp(osc(0.03, 0, 'noise', perc(0.0005, 0.006)), 1500), osc(0.05, 900, 'sine', perc(0.001, 0.012)).map((v) => v * 0.5));
const crackle = (d) => { const o = new Float32Array(Math.floor(d * SR)); for (let i = 0; i < o.length; i++) if (rnd() < 0.004) { const a = rnd(); for (let j = 0; j < 60 && i + j < o.length; j++) o[i + j] += noise() * a * Math.exp(-j / 12); } return hp(o, 2500); };
const waPop = () => osc(0.12, (t) => 600 + 900 * Math.min(1, t / 0.05), 'sine', perc(0.003, 0.04));

// ---------- partition (ré majeur : D A Bm G, une mesure = 2 s) ----------
const CH = [[62, 66, 69], [61, 64, 69], [59, 62, 66], [59, 62, 67]];
const ROOTS = [38, 33, 35, 31];
const bar = (t) => Math.floor(t / (4 * B)) % 4;

// 0-4,7 s : le glaçon. Nappe, tintements sur les rebonds
add(0, pad(CH[0], 4.2), 0.45);
add(0, whoosh(0.5, true), 0.25);
S.IMPACTS.forEach((t, i) => { add(t, clink(2600 - i * 180), [0.6, 0.45, 0.32, 0.2][i], 0); add(t, thud(), [0.7, 0.5, 0.3, 0.15][i]); });
S.RAIN.forEach((t, i) => add(t, clink(3000 + i * 250, 0.25), 0.28, i % 2 ? 0.5 : -0.5));
S.HEADLINE.forEach((t, i) => add(t, bell(74 + [0, 4, 7][i], 0.6), 0.2));
add(S.DIVE[0], whoosh(S.DIVE[1] - S.DIVE[0], true), 0.45);
add(S.FROST, crackle(0.5), 0.6);
// groove
for (let b = 4; b < 42; b++) {
  const t = b * B;
  if (t >= S.END.fade) break;
  const inIce = t < S.T.products[0];
  if (!inIce || b % 2 === 0) add(t, kick(), inIce ? 0.6 : 0.9);
  if (!inIce) { add(t + B / 2, hat(b % 2 === 1), 0.22, 0.25); if (b % 2 === 1) add(t, snap(), 0.35, -0.1); add(t + B / 4, hat(false), 0.08, -0.3); add(t + 3 * B / 4, hat(false), 0.08, -0.3); }
}
for (let t = S.T.products[0] + 0.05; t < 20.5; t += B / 2) add(t, bass(ROOTS[bar(t)] + (Math.round(t / (B / 2)) % 4 === 3 ? 12 : 0), B / 2 - 0.02), 0.4);
for (let k = 2; k < 11; k++) add(k * 4 * B, pad(CH[k % 4], 4 * B + 0.4), 0.22);
// mélodie de cloches pendant les produits et la carte
const MEL = [74, 76, 78, 81, 78, 76, 74, 73];
for (let t = 4.5, k = 0; t < 8.4; t += B / 2, k++) if (k % 2 === 0 || k % 8 === 7) add(t, bell(MEL[k % 8] + 12, 0.4), 0.09, k % 2 ? 0.3 : -0.3);

// produits : un clic de glace par cran du carrousel
S.PRODUCT_IN.forEach((t, i) => { add(t - 0.1, whoosh(0.18, true), 0.25, 0.3); add(t, clink(2200 + i * 150, 0.2), 0.3, -0.2); });
add(8.05, whoosh(0.45, true), 0.4);
// devis : chaque appui, le PDF, WhatsApp
const allTaps = S.QUOTE_LINES.flatMap((l) => l.taps).sort((a, b) => a - b);
allTaps.forEach((t, i) => add(t, tap(), 0.55, 0.2));
const unlock = allTaps[S.FREE_FROM - 1];
[0, 4, 7, 12].forEach((s, i) => add(unlock + i * 0.06, bell(81 + s, 0.6), 0.25));
add(unlock, clink(3200, 0.4), 0.35);
add(S.QUOTE.pdfTap, tap(), 0.7); add(S.QUOTE.pdfTap + 0.05, whoosh(0.3, false), 0.35, -0.4);
add(S.QUOTE.waTap, tap(), 0.7); add(S.QUOTE.waTap + 0.05, whoosh(0.25, true), 0.25, 0.4);
add(S.QUOTE.sent, waPop(), 0.45); add(S.QUOTE.read, tick(), 0.4); add(S.QUOTE.reply, waPop(), 0.35);
add(S.QUOTE.out, whoosh(0.35, true), 0.35);
// carte : une note par commune livrée (pentatonique)
const PENTA = [74, 76, 78, 81, 83, 86, 88, 90];
S.COMMUNES.forEach((_, i) => add(S.ROUTES_IN + i * S.ROUTE_STAGGER + 0.42, bell(PENTA[i % PENTA.length], 0.3), 0.12, ((i % 5) - 2) * 0.2));
add(15.9, clink(2800, 0.3), 0.3);
// froid : craquements de givre + chute
add(16.9, whoosh(0.4, false), 0.4);
add(S.COLD.count[0], crackle(1.2), 0.8);
add(S.COLD.count[0], osc(0.9, (t) => 900 * Math.exp(-t * 2.5) + 80, 'sine', perc(0.01, 0.4)), 0.25);
add(S.COLD.count[1], thud(), 0.7); add(S.COLD.count[1], clink(1800, 0.5), 0.35);
// fin
add(S.T.end[0], whoosh(0.35, true), 0.4);
add(S.END.logo, clink(2600, 0.5), 0.45); add(S.END.logo, kick(), 0.8);
add(S.END.logo, pad([62, 66, 69, 74], 2.4), 0.5);
add(S.END.button, bell(86, 0.4), 0.25);
add(S.END.tap, tap(), 0.8); add(S.END.tap, waPop(), 0.4);

// ---------- master ----------
const end = Math.floor(S.duration * SR);
for (let i = 0; i < N; i++) { const f = i > end ? 0 : Math.min(1, (end - i) / (0.3 * SR)); L[i] = Math.tanh(L[i] * 1.1) * f; R[i] = Math.tanh(R[i] * 1.1) * f; }
let peak = 0; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const g = 0.89 / peak, buf = Buffer.alloc(44 + end * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + end * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(end * 4, 40);
const c16 = (x) => Math.round(Math.max(-32767, Math.min(32767, x * 32767)));
for (let i = 0; i < end; i++) { buf.writeInt16LE(c16(L[i] * g), 44 + i * 4); buf.writeInt16LE(c16(R[i] * g), 46 + i * 4); }
const out = path.join(ROOT, 'out', 'glaceur.wav');
fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, buf);
console.log(out);
