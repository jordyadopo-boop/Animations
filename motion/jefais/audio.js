// Bande-son de l'auto-promo « Je fais ton site » : beat minimal à 120 BPM + sons d'interface (clics, frappe, bulles), calés sur score.js.
// Usage : node motion/jefais/audio.js   -> out/jefais.wav (44,1 kHz stéréo)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as S from './score.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SR = 44100, N = Math.ceil(S.duration * SR) + SR, B = S.BEAT;
const L = new Float32Array(N), R = new Float32Array(N);

// ---------- outils ----------
let seed = 5; const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
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
    const v = wave === 'sine' ? Math.sin(2 * Math.PI * p) : wave === 'saw' ? 2 * p - 1 : wave === 'tri' ? 1 - 4 * Math.abs(p - 0.5) : noise();
    out[i] = v * env(t, dur);
  }
  return out;
}
const lp = (s, fc) => { const a = Math.exp(-2 * Math.PI * fc / SR); let y = 0; return s.map((x) => (y = (1 - a) * x + a * y)); };
const hp = (s, fc) => { const l = lp(s, fc); return s.map((x, i) => x - l[i]); };
const perc = (a, d) => (t) => Math.min(1, t / a) * Math.exp(-t / d);
const sum = (...ss) => { const n = Math.max(...ss.map((s) => s.length)), o = new Float32Array(n); ss.forEach((s) => s.forEach((v, i) => (o[i] += v))); return o; };

// ---------- sons ----------
const kick = () => osc(0.4, (t) => 48 + 110 * Math.exp(-t * 30), 'sine', perc(0.002, 0.13));
const hat = () => hp(osc(0.05, 0, 'noise', perc(0.001, 0.014)), 8000);
const clap = () => hp(lp(osc(0.2, 0, 'noise', perc(0.001, 0.05)), 5000), 1000);
const sub = (m, d) => lp(osc(d, mtof(m), 'tri', (t, D) => Math.min(1, t / 0.005) * Math.min(1, (D - t) / 0.03)), 300);
const pad = (ms, d) => { const n = Math.floor(d * SR), o = new Float32Array(n); ms.forEach((m) => [0, 0.1].forEach((det) => { const s = osc(d, mtof(m + det), 'saw', (t, D) => Math.min(1, t / 0.2) * Math.min(1, (D - t) / 0.4)); for (let i = 0; i < n; i++) o[i] += s[i] / 8; })); return lp(o, 1500); };
const key = () => sum(hp(osc(0.03, 0, 'noise', perc(0.0005, 0.005)), 2000), osc(0.03, 1800 + rnd() * 400, 'sine', perc(0.0005, 0.004)).map((v) => v * 0.4));
const click = () => sum(hp(osc(0.025, 0, 'noise', perc(0.0005, 0.004)), 1500), osc(0.04, 1200, 'sine', perc(0.001, 0.01)).map((v) => v * 0.6));
const pop = (f = 700) => osc(0.12, (t) => f * (1 + Math.min(1, t / 0.04)), 'sine', perc(0.002, 0.035));
const blip = (m, d = 0.2) => osc(d, mtof(m), 'sine', perc(0.002, d / 3));
const swoosh = (d, up = true) => { const n = osc(d, 0, 'noise', (t, D) => Math.sin(Math.PI * Math.pow(t / D, up ? 1.5 : 0.6))); let y = 0; const o = new Float32Array(n.length); for (let i = 0; i < n.length; i++) { const k = i / n.length, fc = up ? 400 + 6000 * k * k : 6000 - 5400 * k; const a = Math.exp(-2 * Math.PI * fc / SR); y = (1 - a) * n[i] + a * y; o[i] = y; } return o; };
const hit = () => sum(kick(), lp(osc(0.6, 0, 'noise', perc(0.002, 0.15)), 2500).map((v) => v * 0.4));
const sentSfx = () => osc(0.25, (t) => 500 + 1400 * Math.min(1, t / 0.12), 'sine', (t) => Math.sin(Math.PI * Math.min(1, t / 0.25)) * 0.8);

// ---------- partition (fa mineur : Fm Db Ab Eb) ----------
const CH = [[65, 68, 72], [61, 65, 68], [56, 60, 63], [63, 67, 70]], ROOTS = [41, 37, 44, 39];
const bar = (t) => Math.floor(t / (4 * B)) % 4;
// accroche : les blocs de couleur filent, les parenthèses claquent
for (let i = 0; i < 6; i++) add(S.HOOK.blocks + i * 0.05, swoosh(0.18, true), 0.18, i % 2 ? 0.5 : -0.5);
for (let i = 0; i < 6; i++) add(S.HOOK.words + i * 0.05, blip(77 + i * 2, 0.12), 0.12);
add(S.HOOK.paren, hit(), 0.7);
add(0, pad(CH[0], 2.1), 0.3);
// beat à partir de la recherche
for (let b = 4; b < 28; b++) {
  const t = b * B; if (t >= 13.6) break;
  const quiet = t >= S.T.chat[0] && t < S.T.end[0];
  add(t, kick(), quiet ? 0.45 : 0.85);
  add(t + B / 2, hat(), 0.2, 0.3); add(t + B / 4, hat(), 0.07, -0.3); add(t + 3 * B / 4, hat(), 0.07, -0.3);
  if (b % 2 === 1 && !quiet) add(t, clap(), 0.35);
}
for (let t = S.T.search[0]; t < 13.5; t += B / 2) add(t, sub(ROOTS[bar(t)] + (Math.round(t / (B / 2)) % 4 === 3 ? 12 : 0), B / 2 - 0.02), 0.45);
for (let k = 1; k < 7; k++) add(k * 4 * B, pad(CH[k % 4], 4 * B + 0.3), 0.16);
// recherche
add(S.SEARCH.pill, swoosh(0.3, false), 0.3);
add(S.SEARCH.dot + 0.13, click(), 0.8);
add(S.SEARCH.expand, pop(500), 0.4);
const q = S.SEARCH.query; for (let i = 0; i < q.length; i++) add(S.SEARCH.typeFrom + (i / q.length) * (S.SEARCH.typeTo - S.SEARCH.typeFrom), key(), 0.45, rnd() - 0.5);
add(S.SEARCH.enter, click(), 0.9); add(S.SEARCH.enter + 0.05, swoosh(0.45, true), 0.4);
// profil
add(S.PROFILE.avatar, pop(600), 0.5);
S.CHIPS.forEach((_, i) => add(S.PROFILE.chips + i * 0.07, blip(84 + [0, 3, 7, 10][i], 0.15), 0.18));
add(S.PROFILE.scroll, swoosh(0.35, false), 0.25);
[0, 1, 2].forEach((i) => add(S.PROFILE.thumbs + i * 0.08, pop(800 + i * 120), 0.25));
add(S.PROFILE.tap, click(), 0.9); add(S.PROFILE.tap + 0.1, swoosh(0.45, true), 0.45);
// réalisations
add(S.T.works[0], hit(), 0.6);
add(S.WORKS.tap, click(), 0.9); add(S.WORKS.tap, blip(89, 0.3), 0.2);
add(8.62, swoosh(0.25, true), 0.35);
// devis
add(S.DEVIS.band, swoosh(0.25, false), 0.45);
add(S.DEVIS.tile + 0.15, hit(), 0.7);
for (let i = 0; i < 16; i++) add(S.DEVIS.text + i * 0.025, click(), 0.12, (i % 2 ? 0.3 : -0.3));
add(S.DEVIS.zoom, swoosh(0.4, true), 0.3);
// message
add(S.CHAT.typing, pop(450), 0.4);
add(S.CHAT.text, sentSfx(), 0.5);
add(S.CHAT.wa, pop(900), 0.45);
// fin
add(S.END.logo, hit(), 0.9);
add(S.END.logo, pad([65, 72, 77, 80], 1.9), 0.45);

// ---------- master ----------
const end = Math.floor(S.duration * SR);
for (let i = 0; i < N; i++) { const f = i > end ? 0 : Math.min(1, (end - i) / (0.3 * SR)); L[i] = Math.tanh(L[i] * 1.1) * f; R[i] = Math.tanh(R[i] * 1.1) * f; }
let peak = 0; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const g = 0.89 / peak, buf = Buffer.alloc(44 + end * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + end * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(end * 4, 40);
const c16 = (x) => Math.round(Math.max(-32767, Math.min(32767, x * 32767)));
for (let i = 0; i < end; i++) { buf.writeInt16LE(c16(L[i] * g), 44 + i * 4); buf.writeInt16LE(c16(R[i] * g), 46 + i * 4); }
const out = path.join(ROOT, 'out', 'jefais.wav');
fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, buf);
console.log(out);
