// Bande-son du film portfolio : groove électro minimal à 120 BPM + bruitages, tout synthétisé et calé sur score.js.
// Usage : node motion/portfolio/audio.js   -> out/portfolio.wav (44,1 kHz stéréo)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as S from './score.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SR = 44100, N = Math.ceil(S.duration * SR) + SR, B = S.BEAT;
const L = new Float32Array(N), R = new Float32Array(N);

// ---------- outils ----------
let seed = 7; const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
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

// ---------- instruments ----------
const kick = () => osc(0.45, (t) => 45 + 120 * Math.exp(-t * 28), 'sine', perc(0.002, 0.16));
const hat = (open) => hp(osc(open ? 0.22 : 0.06, 0, 'noise', perc(0.001, open ? 0.07 : 0.018)), 7000);
const clap = () => hp(lp(osc(0.25, 0, 'noise', (t) => (t < 0.03 ? (Math.floor(t * 300) % 3 === 0 ? 1 : 0.4) : Math.exp(-(t - 0.03) * 22))), 4000), 700);
const bass = (m, d) => lp(osc(d, mtof(m), 'saw', (t, D) => Math.min(1, t / 0.005) * Math.min(1, (D - t) / 0.02) * 0.9), 380);
const pluck = (m, d = 0.3) => lp(osc(d, mtof(m), 'square', perc(0.002, 0.07)), 2600);
const pad = (ms, d) => { const n = Math.floor(d * SR), out = new Float32Array(n); ms.forEach((m) => [0, 0.11, -0.09].forEach((det) => { const s = osc(d, mtof(m + det), 'saw', (t, D) => Math.min(1, t / 0.35) * Math.min(1, (D - t) / 0.5)); for (let i = 0; i < n; i++) out[i] += s[i] / 9; })); return lp(out, 1400); };
const blip = (f0, f1, d = 0.16) => osc(d, (t) => f0 + (f1 - f0) * Math.min(1, t / d), 'sine', perc(0.002, d / 3));
const whoosh = (d, up = true) => { const n = osc(d, 0, 'noise', (t, D) => Math.sin(Math.PI * Math.pow(t / D, up ? 1.6 : 0.6))); let y = 0, out = new Float32Array(n.length); for (let i = 0; i < n.length; i++) { const k = i / n.length, fc = up ? 300 + 5000 * k * k : 5000 - 4500 * k; const a = Math.exp(-2 * Math.PI * fc / SR); y = (1 - a) * n[i] + a * y; out[i] = y; } return out; };
const tick = () => hp(osc(0.02, 0, 'noise', perc(0.0005, 0.004)), 2500);
const thud = () => lp(osc(0.3, (t) => 70 + 90 * Math.exp(-t * 20), 'sine', perc(0.002, 0.09)), 600);

// ---------- partition ----------
const CH = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];   // Am F C G (une mesure = 2 s)
const ROOTS = [33, 29, 36, 31];
const bar = (t) => Math.floor(t / (4 * B)) % 4;

// 0-2 s : titre — nappe + cliquetis des lettres + montée
add(0, pad(CH[0], 2.2), 0.5);
for (let i = 0; i < 19; i++) add(0.12 + i * 0.05 + 0.18, tick(), 0.5, (i % 2 ? 0.3 : -0.3));
add(1.2, whoosh(0.85, true), 0.35);

// groove
for (let b = 4; b < 32; b++) {
  const t = b * B;
  if (t >= S.END.fade) break;
  if (t < S.T.morph[0] || t >= S.T.work[0]) add(t, kick(), 0.95);
  if (t >= S.T.work[0]) { add(t + B / 2, hat(b % 2 === 1), 0.25, 0.25); if (b % 2 === 1) add(t, clap(), 0.4, -0.1); }
  else add(t + B / 2, hat(false), 0.18, 0.25);
}
// basse en croches à partir des réalisations
for (let t = S.T.work[0]; t < 15.5; t += B / 2) add(t, bass(ROOTS[bar(t)] + (Math.round(t / (B / 2)) % 4 === 3 ? 12 : 0), B / 2 - 0.02), 0.42);
// arpège en doubles croches
for (let t = S.T.work[0]; t < S.END.reveal; t += B / 4) { const c = CH[bar(t)], k = Math.round(t / (B / 4)); add(t, pluck(c[k % 3] + 12 + (k % 8 >= 6 ? 12 : 0), 0.25), 0.07, (k % 2 ? 0.4 : -0.4)); }
for (let k = 1; k < 8; k++) add(k * 4 * B, pad(CH[k % 4], 4 * B + 0.4), k < 3 ? 0.35 : 0.22);

// 2-4.5 s : rebonds, mots, frappe du code
S.IMPACTS.forEach((t, i) => add(t, blip(880 - i * 90, 330 - i * 30, 0.2), [0.7, 0.55, 0.4, 0.25, 0.15][i]));
for (let t = S.TYPING[0]; t < S.TYPING[1]; t += 0.032 + rnd() * 0.02) add(t, tick(), 0.35, rnd() - 0.5);
add(S.PULLBACK[0], whoosh(0.6, false), 0.2);

// 4.5-6 s : la balle grossit, remplit l'écran
add(S.MORPH.grow, blip(220, 660, 0.35), 0.5);
add(S.MORPH.fill - 0.25, whoosh(0.5, true), 0.5);
add(S.MORPH.wipe + 0.3, thud(), 0.8);

// 6-9 s : cartes
S.PROJECT_IN.forEach((t) => { add(t - 0.12, whoosh(0.25, true), 0.35, 0.2); add(t + 0.1, thud(), 0.5); });
add(8.9, whoosh(0.4, true), 0.4);
// 9-11 s : services, une note par carte
S.SERVICES.forEach((_, i) => add(S.GRID_IN + i * S.GRID_STAGGER, blip(mtof([69, 72, 76, 79, 81, 84][i]), mtof([69, 72, 76, 79, 81, 84][i]) * 1.01, 0.12), 0.3, i % 2 ? 0.3 : -0.3));
add(10.75, whoosh(0.4, true), 0.4);
// 11-13 s : chiffres
S.STAT_IN.forEach((t, j) => { for (let k = 0; k < 6; k++) add(t - 0.12 + k * 0.02, tick(), 0.4); add(t + 0.05, blip(mtof(76 + j * 3), mtof(76 + j * 3), 0.25), 0.4); });
// 13-16 s : fin
add(S.END.reveal, whoosh(0.4, false), 0.45);
add(S.T.end[0] + 0.15, kick(), 0.9);
add(S.T.end[0] + 0.15, pad([57, 64, 69, 72], 2.9), 0.55);
for (let i = 0; i < S.CONTACT.logo.length; i++) add(S.END.type + i * 0.035, tick(), 0.3, (i % 2 ? 0.2 : -0.2));
add(S.END.button, blip(440, 880, 0.18), 0.4);
add(S.END.click, tick(), 1); add(S.END.click, blip(1320, 990, 0.12), 0.5);

// ---------- master : saturation douce, fondu de fin, normalisation ----------
const end = Math.floor(S.duration * SR);
for (let i = 0; i < N; i++) {
  const f = i > end ? 0 : Math.min(1, (end - i) / (0.3 * SR));
  L[i] = Math.tanh(L[i] * 1.1) * f; R[i] = Math.tanh(R[i] * 1.1) * f;
}
let peak = 0; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const g = 0.89 / peak, n = end, buf = Buffer.alloc(44 + n * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 4, 40);
for (let i = 0; i < n; i++) { buf.writeInt16LE(Math.round(clamp16(L[i] * g)), 44 + i * 4); buf.writeInt16LE(Math.round(clamp16(R[i] * g)), 46 + i * 4); }
function clamp16(x) { return Math.max(-32767, Math.min(32767, x * 32767)); }
const out = path.join(ROOT, 'out', 'portfolio.wav');
fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, buf);
console.log(out);
