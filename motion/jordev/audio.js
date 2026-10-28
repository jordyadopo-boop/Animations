// Bande-son du film JorDEV : groove électro sombre à 120 BPM (ré mineur) + bruitages calés sur chaque service cité, synthétisés.
// Usage : node motion/jordev/audio.js   -> out/jordev.wav (44,1 kHz stéréo)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as S from './score.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SR = 44100, N = Math.ceil(S.duration * SR) + SR, B = S.BEAT;
const L = new Float32Array(N), R = new Float32Array(N);

// ---------- outils ----------
let seed = 3; const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
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
    const v = wave === 'sine' ? Math.sin(2 * Math.PI * p) : wave === 'saw' ? 2 * p - 1 : wave === 'tri' ? 1 - 4 * Math.abs(p - 0.5) : wave === 'square' ? (p < 0.5 ? 1 : -1) : noise();
    out[i] = v * env(t, dur);
  }
  return out;
}
const lp = (s, fc) => { const a = Math.exp(-2 * Math.PI * fc / SR); let y = 0; return s.map((x) => (y = (1 - a) * x + a * y)); };
const hp = (s, fc) => { const l = lp(s, fc); return s.map((x, i) => x - l[i]); };
const perc = (a, d) => (t) => Math.min(1, t / a) * Math.exp(-t / d);
const sum = (...ss) => { const n = Math.max(...ss.map((s) => s.length)), o = new Float32Array(n); ss.forEach((s) => s.forEach((v, i) => (o[i] += v))); return o; };

// ---------- sons ----------
const kick = () => osc(0.45, (t) => 46 + 120 * Math.exp(-t * 30), 'sine', perc(0.002, 0.15));
const hat = (o) => hp(osc(o ? 0.18 : 0.05, 0, 'noise', perc(0.001, o ? 0.05 : 0.014)), 8000);
const clap = () => hp(lp(osc(0.22, 0, 'noise', (t) => (t < 0.025 ? (Math.floor(t * 320) % 3 === 0 ? 1 : 0.4) : Math.exp(-(t - 0.025) * 24))), 5000), 900);
const bass = (m, d) => lp(osc(d, mtof(m), 'saw', (t, D) => Math.min(1, t / 0.005) * Math.min(1, (D - t) / 0.02) * 0.9), 360);
const pad = (ms, d) => { const n = Math.floor(d * SR), o = new Float32Array(n); ms.forEach((m) => [0, 0.11, -0.09].forEach((det) => { const s = osc(d, mtof(m + det), 'saw', (t, D) => Math.min(1, t / 0.3) * Math.min(1, (D - t) / 0.5)); for (let i = 0; i < n; i++) o[i] += s[i] / 9; })); return lp(o, 1300); };
const pluck = (m, d = 0.25) => lp(osc(d, mtof(m), 'square', perc(0.002, 0.06)), 2400);
const blip = (m, d = 0.18) => osc(d, mtof(m), 'sine', perc(0.002, d / 3));
const swoosh = (d, up = true) => { const n = osc(d, 0, 'noise', (t, D) => Math.sin(Math.PI * Math.pow(t / D, up ? 1.5 : 0.6))); let y = 0; const o = new Float32Array(n.length); for (let i = 0; i < n.length; i++) { const k = i / n.length, fc = up ? 400 + 6500 * k * k : 6500 - 5800 * k; const a = Math.exp(-2 * Math.PI * fc / SR); y = (1 - a) * n[i] + a * y; o[i] = y; } return o; };
const hit = () => sum(kick(), lp(osc(0.7, 0, 'noise', perc(0.002, 0.18)), 2600).map((v) => v * 0.45));
const key = () => sum(hp(osc(0.03, 0, 'noise', perc(0.0005, 0.005)), 2000), osc(0.03, 1800 + rnd() * 400, 'sine', perc(0.0005, 0.004)).map((v) => v * 0.4));
const click = () => sum(hp(osc(0.025, 0, 'noise', perc(0.0005, 0.004)), 1500), osc(0.04, 1200, 'sine', perc(0.001, 0.01)).map((v) => v * 0.6));
const riser = (d) => osc(d, (t) => 200 + 1600 * Math.pow(t / d, 2), 'saw', (t, D) => Math.pow(t / D, 2) * 0.5);
const glitch = () => { const o = new Float32Array(Math.floor(0.18 * SR)); for (let i = 0; i < o.length; i++) o[i] = (Math.floor(i / 220) % 2 ? 1 : -1) * (rnd() < 0.5 ? 0.6 : 0.2) * Math.exp(-i / o.length * 3); return hp(o, 600); };
const pop = (f = 700) => osc(0.12, (t) => f * (1 + Math.min(1, t / 0.04)), 'sine', perc(0.002, 0.035));

// ---------- partition ----------
const CH = [[62, 65, 69], [58, 62, 65], [60, 64, 67], [57, 61, 64]], ROOTS = [38, 34, 36, 33];  // Dm Bb C A
const bar = (t) => Math.floor(t / (4 * B)) % 4;
// accroche : les pixels filent, puis un coup + une note par service cité
for (let i = 0; i < 5; i++) add(S.QUESTION + i * 0.06, swoosh(0.2, true), 0.15, i % 2 ? 0.5 : -0.5);
add(0.45, hit(), 0.6);
S.SERVICES.forEach((s, i) => { add(s.t, hit(), 0.75); add(s.t, blip(74 + [0, 3, 5, 7, 10, 12][i], 0.3), 0.25); add(s.t - 0.12, swoosh(0.15, true), 0.2); });
S.EDIT.beats.forEach((b) => add(b, swoosh(0.08, false), 0.15));
add(S.EDIT.cut - 0.04, glitch(), 0.5); add(S.EDIT.cut, swoosh(0.2, true), 0.35);
add(S.GATHER - 0.4, riser(0.95), 0.25); add(S.GATHER, swoosh(0.5, true), 0.4);
// groove : retenu pendant l'accroche, plein ensuite
for (let b = 0; b < 50; b++) {
  const t = b * B; if (t >= S.CTA.fade + 0.2) break;
  const full = t >= S.LOGO.brain;
  if (full || b % 2 === 0) add(t, kick(), full ? 0.9 : 0.55);
  add(t + B / 2, hat(b % 4 === 3), full ? 0.22 : 0.14, 0.25);
  if (full) { add(t + B / 4, hat(false), 0.07, -0.3); add(t + 3 * B / 4, hat(false), 0.07, -0.3); if (b % 2 === 1) add(t, clap(), 0.38, -0.1); }
}
for (let t = 0; t < 24.5; t += B / 2) add(t, bass(ROOTS[bar(t)] + (Math.round(t / (B / 2)) % 4 === 3 ? 12 : 0), B / 2 - 0.02), t < S.LOGO.brain ? 0.3 : 0.42);
for (let k = 0; k < 13; k++) add(k * 4 * B, pad(CH[k % 4], 4 * B + 0.4), 0.18);
for (let t = S.LOGO.brain; t < S.CTA.brain; t += B / 4) { const c = CH[bar(t)], k = Math.round(t / (B / 4)); add(t, pluck(c[k % 3] + 12 + (k % 8 >= 6 ? 12 : 0)), 0.06, k % 2 ? 0.4 : -0.4); }
// marque
add(S.LOGO.brain, hit(), 0.95); add(S.LOGO.brain, pad([62, 69, 74, 77], 1.6), 0.45);
// recherche
add(S.SEARCH.pill, pop(500), 0.4);
const q = S.SEARCH.query; for (let i = 0; i < q.length; i++) add(S.SEARCH.typeFrom + (i / q.length) * (S.SEARCH.typeTo - S.SEARCH.typeFrom), key(), 0.4, rnd() - 0.5);
add(S.SEARCH.enter, click(), 0.9); add(S.SEARCH.enter + 0.05, swoosh(0.4, true), 0.4);
// savoir-faire, preuves, pour qui, promesse
add(S.SKILLS.panel, swoosh(0.4, false), 0.35);
S.PROOFS.items.forEach((_, i) => { const t = S.PROOFS.from + i * S.PROOFS.step; add(t, click(), 0.5); add(t, blip(81 + i * 2, 0.15), 0.18); });
S.WHO.words.forEach(([, , t]) => add(t, swoosh(0.18, true), 0.3));
add(S.T.who[1] - 0.3, swoosh(0.35, true), 0.35);
add(S.PROMISE.from, hit(), 0.6);
// appel
add(S.CTA.brain, hit(), 0.95); add(S.CTA.brain, pad([62, 69, 74, 77, 81], 3.2), 0.5);
add(S.CTA.button, pop(800), 0.5); add(S.CTA.button + 1.2, click(), 0.7);
for (let i = 0; i < S.CONTACT.slogan.length; i++) add(S.CTA.slogan + (i / S.CONTACT.slogan.length) * 0.7, key(), 0.25);

// ---------- master ----------
const end = Math.floor(S.duration * SR);
for (let i = 0; i < N; i++) { const f = i > end ? 0 : Math.min(1, (end - i) / (0.4 * SR)); L[i] = Math.tanh(L[i] * 1.1) * f; R[i] = Math.tanh(R[i] * 1.1) * f; }
let peak = 0; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const g = 0.89 / peak, buf = Buffer.alloc(44 + end * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + end * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(end * 4, 40);
const c16 = (x) => Math.round(Math.max(-32767, Math.min(32767, x * 32767)));
for (let i = 0; i < end; i++) { buf.writeInt16LE(c16(L[i] * g), 44 + i * 4); buf.writeInt16LE(c16(R[i] * g), 46 + i * 4); }
const out = path.join(ROOT, 'out', 'jordev.wav');
fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, buf);
console.log(out);
