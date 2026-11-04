// Musique originale de fête, synthétisée : groove afro-pop (kick, shaker, cloche, congas), balafon, basse, nappes.
// Usage : node trajets/music.mjs koumassi_mockeyville   -> out/musique_<nom>.wav (44,1 kHz stéréo)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import TRAJETS from './trajets.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const name = process.argv[2] || 'koumassi_mockeyville';
const CFG = TRAJETS[name];
const SR = 44100, DUR = CFG.duration, N = Math.ceil(DUR * SR);
const T_ARR = DUR - (CFG.endHold || 6);          // arrivée : moment de l'épingle
const L = new Float32Array(N), R = new Float32Array(N);
let seed = 7; const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const mtof = (m) => 440 * 2 ** ((m - 69) / 12);
const add = (t0, sig, g = 1, pan = 0) => { const s0 = Math.floor(t0 * SR), gl = g * Math.cos((pan + 1) * Math.PI / 4), gr = g * Math.sin((pan + 1) * Math.PI / 4); for (let i = 0; i < sig.length; i++) { const k = s0 + i; if (k >= 0 && k < N) { L[k] += sig[i] * gl; R[k] += sig[i] * gr; } } };
const buf = (d, f) => { const n = Math.floor(d * SR), o = new Float32Array(n); for (let i = 0; i < n; i++) o[i] = f(i / SR); return o; };

// instruments
const kick = () => buf(0.35, (t) => Math.sin(2 * Math.PI * (48 * t + 90 * (1 - Math.exp(-t * 28)) / 28)) * Math.exp(-t * 9));
let hp = 0; const shaker = (a) => buf(0.07, (t) => { const n = rnd() * 2 - 1, y = n - hp; hp = n; return y * Math.exp(-t * 60) * a; });
const bell = (f) => buf(0.5, (t) => (Math.sin(2 * Math.PI * f * t + 1.8 * Math.sin(2 * Math.PI * f * 2.76 * t) * Math.exp(-t * 9)) * Math.exp(-t * 7)));
const conga = (f) => buf(0.3, (t) => Math.sin(2 * Math.PI * f * t * (1 + 0.25 * Math.exp(-t * 40))) * Math.exp(-t * 14) + (rnd() - 0.5) * 0.15 * Math.exp(-t * 80));
// balafon : lame de bois (fondamental + partiels inharmoniques, attaque nette)
const balafon = (m, d = 0.6) => { const f = mtof(m); return buf(d, (t) => (Math.sin(2 * Math.PI * f * t) + 0.35 * Math.sin(2 * Math.PI * f * 3.92 * t) * Math.exp(-t * 18) + 0.12 * Math.sin(2 * Math.PI * f * 9.8 * t) * Math.exp(-t * 40)) * Math.exp(-t * 6.5) * Math.min(1, t / 0.002)); };
const bass = (m, d) => { const f = mtof(m); let lp = 0; return buf(d, (t) => { const v = Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(4 * Math.PI * f * t); lp += (v - lp) * 0.2; return lp * Math.min(1, t / 0.006) * Math.exp(-t * 2.2) * Math.min(1, (d - t) / 0.03); }); };
const pad = (ms, d) => { const fs = ms.map(mtof); return buf(d, (t) => { let v = 0; for (const f of fs) for (const dt of [-0.12, 0.12]) v += Math.sin(2 * Math.PI * (f + dt) * t) + 0.25 * Math.sin(4 * Math.PI * (f + dt) * t); return v / fs.length * 0.22 * Math.min(1, t / 0.6) * Math.min(1, (d - t) / 0.6); }); };

// grille : 112 BPM, F majeur, I – V – vi – IV (Fa, Do, Rém, Si♭)
const BPM = 112, BEAT = 60 / BPM, BAR = 4 * BEAT;
const CH = [[53, [65, 69, 72]], [48, [64, 67, 72]], [50, [65, 69, 74]], [46, [65, 70, 74]]];
const MEL = [ // motifs de balafon (pas de croche : [position en croches, note])
  [[0, 77], [1, 76], [2, 77], [3, 81], [5, 79], [6, 77]],
  [[0, 76], [2, 72], [3, 74], [4, 76], [6, 79]],
  [[0, 74], [1, 77], [2, 81], [4, 79], [5, 77], [6, 76]],
  [[0, 74], [2, 77], [3, 76], [4, 74], [6, 72]],
];
const bars = Math.ceil(DUR / BAR);
for (let b = 0; b < bars; b++) {
  const t0 = b * BAR, [root, chord] = CH[b % 4], sec = b < 2 ? 0 : t0 > T_ARR - BAR ? 2 : 1; // intro / groove / final
  add(t0, pad(chord, BAR + 0.3), 0.55, 0);
  if (sec >= 1) {
    for (const k of [0, 1.5, 2, 3.5]) if (k !== 1.5 || b % 2) add(t0 + k * BEAT, kick(), 0.8);
    for (let i = 0; i < 16; i++) add(t0 + i * BEAT / 4, shaker(i % 4 === 2 ? 0.5 : 0.28), 0.5, 0.35);
    for (const k of [0, 1, 1.75, 2.5, 3]) add(t0 + k * BEAT, bell(1350), 0.13, -0.4);          // cloche 3-2
    for (const [k, f] of [[0.5, 210], [1.5, 260], [2.25, 210], [3.5, 260]]) add(t0 + k * BEAT, conga(f), 0.28, 0.2);
    for (const [k, dd, o] of [[0, 0.75, 0], [1, 0.5, 0], [1.5, 0.5, 12], [2.5, 0.5, 7], [3, 0.9, 0]]) add(t0 + k * BEAT, bass(root - 12 + o, dd * BEAT * 1.6), 0.5, 0);
  }
  const mel = MEL[b % 4];
  for (const [p, m] of mel) add(t0 + p * BEAT / 2 + (sec === 0 ? 0 : 0), balafon(m), sec === 0 ? 0.22 : 0.3, 0.25 * ((p % 2) * 2 - 1));
  if (sec >= 1 && b % 2) for (const [p, m] of mel) add(t0 + p * BEAT / 2 + BEAT / 4, balafon(m - 12, 0.4), 0.12, -0.3); // contrechant
}
// carillon d'arrivée (arpège montant) + coup de cymbale douce
[77, 81, 84, 89, 93].forEach((m, i) => add(T_ARR - 0.3 + i * 0.09, bell(mtof(m)), 0.16, (i - 2) * 0.2));
add(T_ARR - 0.3, buf(2.5, (t) => (rnd() * 2 - 1) * Math.exp(-t * 2.2) * 0.12), 1, 0);

// réverbe légère, fondu d'entrée/sortie, normalisation
const rev = (x) => { const y = new Float32Array(N); for (const [d, g] of [[0.031, 0.32], [0.047, 0.27], [0.071, 0.22], [0.11, 0.16]]) { const k = Math.floor(d * SR); for (let i = k; i < N; i++) y[i] += (x[i - k] + y[i - k] * 0.35) * g; } return y; };
const rl = rev(L), rr = rev(R);
let peak = 0;
for (let i = 0; i < N; i++) { const t = i / SR, f = Math.min(1, t / 1.2) * Math.min(1, (DUR - t) / 2.5); L[i] = (L[i] + rl[i] * 0.35) * f; R[i] = (R[i] + rr[i] * 0.35) * f; peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i])); }
const g = 0.89 / peak, out = Buffer.alloc(44 + N * 4);
out.write('RIFF', 0); out.writeUInt32LE(36 + N * 4, 4); out.write('WAVEfmt ', 8); out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(2, 22);
out.writeUInt32LE(SR, 24); out.writeUInt32LE(SR * 4, 28); out.writeUInt16LE(4, 32); out.writeUInt16LE(16, 34); out.write('data', 36); out.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * g)) * 32767), 44 + i * 4); out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * g)) * 32767), 46 + i * 4); }
const f = path.join(ROOT, 'out', `musique_${name}.wav`); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, out);
console.log(f);
