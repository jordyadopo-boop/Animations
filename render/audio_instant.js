// Studio son de « L'INSTANT » : ambiance dramatique, entièrement synthétisée et calée sur CUES.
// Usage : node render/audio_instant.js instant   -> out/instant.wav (44,1 kHz stéréo)
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './serve.js';

const SR = 44100;
const epName = process.argv[2] || 'instant';
const ep = await import(path.join(ROOT, 'src/episodes', `${epName}.js`)).catch(async (e) => { console.error(e.message); process.exit(1); });
const N = Math.ceil(ep.duration * SR) + SR;
const L = new Float32Array(N), R = new Float32Array(N);       // bruitages
const ML = new Float32Array(N), MR = new Float32Array(N);     // musique (réverbe longue)

let seed = 777; const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const noise = () => rnd() * 2 - 1;
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
function mixTo(bl, br, t0, sig, gain = 1, pan = 0) {
  const s0 = Math.floor(t0 * SR), gl = gain * Math.cos((pan + 1) * Math.PI / 4), gr = gain * Math.sin((pan + 1) * Math.PI / 4);
  for (let i = 0; i < sig.length; i++) { const k = s0 + i; if (k < 0 || k >= N) continue; bl[k] += sig[i] * gl; br[k] += sig[i] * gr; }
}
const sfx = (t, s, g = 1, pan = 0) => mixTo(L, R, t, s, g, pan);
const mus = (t, s, g = 1, pan = 0) => mixTo(ML, MR, t, s, g, pan);
function gen(dur, f) { const n = Math.max(1, Math.floor(dur * SR)), o = new Float32Array(n); for (let i = 0; i < n; i++) o[i] = f(i / SR, i); return o; }
function osc(dur, freq, wave = 'sine', env = () => 1) {
  let ph = 0; return gen(dur, (t) => { const f = typeof freq === 'function' ? freq(t) : freq; ph += f / SR; const p = ph % 1;
    const v = wave === 'sine' ? Math.sin(2 * Math.PI * p) : wave === 'saw' ? 2 * p - 1 : wave === 'tri' ? 1 - 4 * Math.abs(p - 0.5) : wave === 'square' ? (p < 0.5 ? 1 : -1) : noise();
    return v * env(t, dur); });
}
const lp = (s, fc) => { const a = Math.exp(-2 * Math.PI * fc / SR); let y = 0; return s.map((x) => (y = (1 - a) * x + a * y)); };
const hp = (s, fc) => { const l = lp(s, fc); return s.map((x, i) => x - l[i]); };
function bp(s, fc, q = 3) { const w = 2 * Math.PI * fc / SR, al = Math.sin(w) / (2 * q), a0 = 1 + al, a1 = -2 * Math.cos(w), a2 = 1 - al; let x1 = 0, x2 = 0, y1 = 0, y2 = 0; return s.map((x) => { const y = (al * x - al * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = x; y2 = y1; y1 = y; return y; }); }
const gain = (s, g) => s.map((v) => v * g);
const add = (...ss) => { const n = Math.max(...ss.map((s) => s.length)), o = new Float32Array(n); ss.forEach((s) => s.forEach((v, i) => (o[i] += v))); return o; };
const ad = (a, d) => (t) => Math.min(1, t / a) * Math.exp(-t / d);
const hold = (a, r) => (t, dur) => Math.min(1, t / a) * Math.min(1, Math.max(0, (dur - t) / r));
const swell = (t, d) => Math.sin(Math.PI * Math.min(1, t / d));
const sat = (s, k = 2) => s.map((v) => Math.tanh(v * k) / Math.tanh(k));

// ---------- instruments ----------
// piano doux (harmoniques qui décroissent, attaque feutrée, léger désaccord)
function piano(m, dur = 3, vel = 0.5) {
  const f = mtof(m), b = 1 + 0.0004 * (m - 60);
  return gen(dur, (t) => { let v = 0; for (let h = 1; h <= 6; h++) v += Math.sin(2 * Math.PI * f * h * Math.sqrt(1 + b * h * h * 1e-4) * t + h) * Math.exp(-t * (0.9 + h * 0.75)) / (h * h * 0.6 + 0.4); v += 0.4 * Math.sin(2 * Math.PI * f * 1.002 * t) * Math.exp(-t * 1.1); return v * vel * Math.min(1, t / 0.006) * Math.min(1, (dur - t) / 0.3); });
}
// nappe de cordes (dents de scie filtrées, vibrato lent)
function pad(ms, dur, vol = 0.15, fc = 900) { let o = new Float32Array(Math.floor(dur * SR)); ms.forEach((m, i) => { const s = osc(dur, (t) => mtof(m) * (1 + 0.003 * Math.sin(t * 5 + i)), 'saw', (t) => swell(t, dur) ** 1.5); o = add(o, s); }); return gain(lp(lp(o, fc), fc), vol); }
function cello(m, dur, vol = 0.18, bright = 1400) {
  const f = mtof(m);
  const s = osc(dur, (t) => f * (1 + 0.006 * Math.min(1, t / 0.6) * Math.sin(2 * Math.PI * 5.2 * t)), 'saw', (t) => Math.min(1, t / 0.35) * Math.min(1, (dur - t) / 0.5) * (0.85 + 0.15 * Math.sin(t * 1.3)));
  return gain(lp(add(bp(s, f * 2.2, 1.2), gain(lp(s, bright), 0.6)), bright * 1.4), vol);
}
function voice(dur, f0, formants, vib = 5, grit = 0) {
  const src = osc(dur, (t) => f0(t) * (1 + 0.02 * Math.sin(2 * Math.PI * vib * t)), 'saw', hold(0.04, 0.15));
  const v = add(...formants.map(([f, g]) => gain(bp(src, f, 6), g)));
  return grit ? sat(v, 1 + grit * 3) : v;
}

// ---------- bruitages ----------
const FX = {
  heart(o, t0) { // battements : « lub-dub », bpm qui varie
    const until = o.until, out = []; let t = t0;
    while (t < until) { const k = (t - t0) / Math.max(0.01, until - t0), bpm = o.from + (o.to - o.from) * k;
      const thump = (d) => add(osc(0.18, (tt) => 55 * Math.exp(-tt * 6) + 32, 'sine', ad(0.004, 0.06)), gain(lp(osc(0.05, 0, 'noise', ad(0.001, 0.01)), 300), 0.5));
      out.push([t, thump(), o.soft ? 0.55 : 0.9], [t + 0.16 * (70 / bpm), thump(), o.soft ? 0.38 : 0.6]); t += 60 / bpm; }
    out.forEach(([tt, s, g]) => sfx(tt, s, g * 1.4));
  },
  drone(o, t0) { const d = o.until - t0; sfx(t0, gain(lp(add(osc(d, (t) => 46 + t * 4, 'saw', (t) => (t / d) ** 2), osc(d, (t) => 69.5 + t * 6, 'saw', (t) => (t / d) ** 2.5)), 260), 0.35)); },
  clench: () => add(gain(bp(osc(0.35, 0, 'noise', (t) => (Math.sin(t * 90) > 0.3 ? 1 : 0.2) * Math.exp(-t * 6)), 1400, 2), 0.6), osc(0.2, 70, 'sine', ad(0.01, 0.08))),
  gasp: () => gain(bp(osc(0.45, 0, 'noise', (t) => swell(t, 0.45) ** 0.6), 1600, 1.5), 0.6),
  shout: (o) => { const d = o.dur || 2.5; const v = voice(d, (t) => 150 + 40 * Math.min(1, t * 1.5) + 8 * Math.sin(t * 13), [[700, 1], [1150, 0.6], [2600, 0.25]], 7, 0.8); return gain(lp(v.map((x, i) => x * Math.min(1, i / SR / 0.3) * (0.6 + 0.4 * Math.min(1, i / SR / d * 1.6))), 1800), 0.7); },
  tick(o, t0) { for (let t = Math.ceil(t0); t < o.until; t += 1) sfx(t, gain(hp(osc(0.03, 0, 'noise', ad(0.0005, 0.006)), 2500), 0.35), 1, -0.5); },
  tip: () => add(osc(1.2, 2480, 'sine', ad(0.001, 0.25)), gain(osc(1.2, 3710, 'sine', ad(0.001, 0.15)), 0.5), gain(osc(0.08, 900, 'sine', ad(0.001, 0.02)), 0.4)).map((v) => v * 0.35),
  swing: (o) => { const d = o.dur || 0.7; return gain(bp(osc(d, 0, 'noise', (t) => swell(t, d) ** 2), 500, 0.8), 1.4); },
  freeze: () => add(gain(lp(osc(2.5, 0, 'noise', ad(0.002, 0.5)), 180), 2.5), osc(2.5, (t) => 48 * Math.exp(-t * 0.6) + 20, 'sine', ad(0.002, 0.9)), gain(hp(osc(0.15, 0, 'noise', ad(0.0005, 0.03)), 3000), 0.6)),
  ring: (o) => { const d = o.dur || 4; return add(gain(osc(d, 7400, 'sine', (t) => Math.exp(-t * 0.5) * Math.min(1, t / 0.05)), 0.05), gain(osc(d, 3700, 'sine', (t) => Math.exp(-t * 0.9)), 0.03)); },
  room(o, t0) { const d = o.until - t0; sfx(t0, gain(lp(osc(d, 0, 'noise', (t) => Math.min(1, t / 0.8) * Math.min(1, (d - t) / 0.5)), 220), 0.18)); },
  dive: () => add(gain(lp(osc(1.6, 0, 'noise', (t) => (t / 1.6) ** 2), 900), 0.9), gain(osc(1.6, (t) => 300 + 1600 * (t / 1.6) ** 2, 'sine', (t) => 0.25 * (t / 1.6) ** 3), 0.7), ...[0.3, 0.6, 0.9, 1.1, 1.25].map((tt) => { const s = new Float32Array(Math.floor(1.6 * SR)); const b = osc(0.06, (t) => 600 + 2500 * t, 'sine', ad(0.002, 0.02)); s.set(b, Math.floor(tt * SR)); return gain(s, 0.25); })),
  undive: () => gain(lp(osc(1.4, 0, 'noise', (t) => Math.exp(-t * 2.5) * Math.min(1, t / 0.02)), 1400), 0.9),
  paper(o, t0) { const d = o.until - t0; sfx(t0, gain(hp(lp(osc(d, 0, 'noise', (t) => (0.5 + 0.5 * Math.sin(t * 0.7)) * Math.min(1, t / 0.4) * Math.min(1, (d - t) / 0.4)), 5000), 1200), 0.035)); },
  zip: () => gain(bp(osc(0.7, 0, 'noise', (t) => (Math.sin(t * 380) > 0 ? 1 : 0.3) * swell(t, 0.7)), 3000, 2), 0.35),
  wheels: (o) => { const d = o.dur || 2; return add(gain(lp(osc(d, 0, 'noise', (t) => swell(t, d) ** 0.4), 250), 0.7), gain(bp(osc(d, 0, 'noise', (t) => (Math.sin(t * 2 * Math.PI * 3.1) > 0.92 ? 1 : 0) * swell(t, d)), 900, 2), 0.8)); },
  doorClose: () => add(gain(lp(osc(0.6, 0, 'noise', ad(0.002, 0.1)), 300), 2.2), osc(0.5, 62, 'sine', ad(0.002, 0.15)), (() => { const s = new Float32Array(Math.floor(0.6 * SR)); s.set(gain(hp(osc(0.03, 0, 'noise', ad(0.0005, 0.006)), 2000), 0.8), Math.floor(0.12 * SR)); return s; })()),
  clockFast(o, t0) { const d = o.dur || 3; let t = 0; while (t < d) { sfx(t0 + t, gain(hp(osc(0.02, 0, 'noise', ad(0.0005, 0.004)), 3000), 0.3), 1, -0.4); t += 0.25 * Math.exp(-t * 0.9) + 0.03; } },
  phone(o, t0) { const d = o.dur || 5; for (let t = 0; t < d; t += 5) sfx(t0 + t, gain(lp(osc(Math.min(1.5, d - t), 440, 'sine', hold(0.01, 0.02)), 2000), 0.12), 1, 0.3); },
  voicemail: () => gain(osc(0.45, 1000, 'sine', hold(0.01, 0.02)), 0.12),
  rain(o, t0) { const d = o.until - t0; const s = add(gain(hp(lp(osc(d, 0, 'noise', (t) => Math.min(1, t / 1.5) * Math.min(1, (d - t) / 0.6)), 6000), 400), 0.12)); sfx(t0, s); for (let i = 0; i < d * 12; i++) sfx(t0 + rnd() * d, gain(bp(osc(0.02, 0, 'noise', ad(0.0005, 0.005)), 2000 + rnd() * 2000, 4), 0.25), 1, rnd() * 2 - 1); },
  thud: () => add(gain(lp(osc(0.8, 0, 'noise', ad(0.002, 0.12)), 160), 2.6), osc(0.8, (t) => 50 * Math.exp(-t * 2) + 28, 'sine', ad(0.002, 0.25))),
  silence: () => new Float32Array(1),
  glassRoll: (o) => { const d = o.dur || 1.5; return add(gain(bp(osc(d, 0, 'noise', (t) => (1 - t / d) * (0.6 + 0.4 * Math.sin(t * 40))), 2600, 6), 0.3), gain(osc(d, 3100, 'sine', (t) => 0.1 * (1 - t / d) * (Math.sin(t * 25) > 0.8 ? 1 : 0.2)), 0.6)); },
  flatline: (o) => pad([38, 45, 50], o.dur || 3.5, 0.22, 500), // nappe grave de chagrin
  siren(o, t0) { const d = o.dur || 6; const s = osc(d, (t) => (Math.floor(t / 0.6) % 2 ? 580 : 435), 'tri', (t) => Math.min(1, t / 1.2) * Math.min(1, (d - t) / 1.5)); sfx(t0, gain(lp(s, 2200), 0.14)); sfx(t0 + 0.4, gain(lp(osc(d - 0.4, (t) => (Math.floor(t / 0.55) % 2 ? 560 : 420), 'tri', (t) => Math.min(1, t / 1.6) * Math.min(1, (d - 0.4 - t) / 1.5)), 1500), 0.08), 1, 0.4); },
  cuffs: () => { const o = new Float32Array(Math.floor(0.6 * SR)); for (let i = 0; i < 7; i++) o.set(gain(add(hp(osc(0.02, 0, 'noise', ad(0.0003, 0.004)), 3000), osc(0.05, 4200 + i * 80, 'sine', ad(0.0005, 0.01))), 0.7), Math.floor((0.05 + i * 0.035 + (i > 3 ? 0.18 : 0)) * SR)); return o; },
  steps(o, t0) { const d = o.dur || 2; for (let t = 0; t < d; t += 0.45) sfx(t0 + t, add(gain(lp(osc(0.12, 0, 'noise', ad(0.002, 0.03)), 400), 1.2), osc(0.1, 90, 'sine', ad(0.002, 0.03))), 0.8, Math.sin(t) * 0.3); },
  cellDoor: () => add(...[1, 2.76, 5.4, 8.9, 13.3].map((h, i) => osc(3, 92 * h, 'sine', ad(0.001, 1.2 / (1 + i * 0.6))).map((v) => v * 0.4 / (i + 1))), gain(lp(osc(0.4, 0, 'noise', ad(0.001, 0.06)), 900), 2)),
  argue: (o) => { const d = o.dur || 4, out = new Float32Array(Math.floor(d * SR)); let t = 0, k = 0; while (t < d - 0.5) { const len = 0.35 + rnd() * 0.6, man = k % 2 === 0; const v = voice(len, (tt) => (man ? 140 : 250) + 30 * Math.sin(tt * 7), man ? [[650, 1], [1100, 0.5]] : [[850, 1], [1500, 0.5]], 6, man ? 0.6 : 0.3); out.set(v.subarray(0, Math.min(v.length, out.length - Math.floor(t * SR))), Math.floor(t * SR)); t += len + 0.1 + rnd() * 0.25; k++; } return gain(lp(out, 700), 0.6); },
  breath: (o) => { const d = o.dur || 3; return gain(lp(bp(osc(d, 0, 'noise', (t) => (t < d * 0.4 ? t / (d * 0.4) : Math.exp(-(t - d * 0.4) * 1.5))), 900, 0.7), 1500), 0.7); },
  unfreeze: () => add(gain(hp(osc(0.55, 0, 'noise', (t) => (t / 0.55) ** 3), 1500), 0.7), osc(0.55, (t) => 200 + 400 * t, 'sine', (t) => 0.2 * (t / 0.55) ** 2)),
  shatter: () => { const d = 1.6; let o = gain(hp(osc(d, 0, 'noise', ad(0.0005, 0.12)), 2500), 1.1); for (let i = 0; i < 26; i++) { const s = new Float32Array(Math.floor(d * SR)); const p = add(osc(0.4, 2000 + rnd() * 5000, 'sine', ad(0.0005, 0.06 + rnd() * 0.1)), gain(hp(osc(0.03, 0, 'noise', ad(0.0003, 0.008)), 4000), 0.6)); s.set(p, Math.floor((Math.pow(rnd(), 2) * 0.8) * SR)); o = add(o, gain(s, 0.25)); } return add(o, gain(lp(osc(0.3, 0, 'noise', ad(0.001, 0.05)), 400), 1.2)); },
};

// ---------- musique ----------
// ré mineur. Chaque thème : liste de [temps relatif, note midi, durée, vélocité]
function theme(name, t0, until) {
  const notes = [], chords = [];
  const span = until - t0;
  if (name === 'instant') { [[0, 62], [2.2, 69], [4.4, 65], [7.0, 64], [9.6, 62], [12.0, 57]].forEach(([t, m]) => notes.push([t, m, 4, 0.32])); chords.push([0, [38, 45, 50], span]); }
  if (name === 'partir') {
    const prog = [[50, 53, 57], [46, 50, 53], [41, 45, 48], [48, 52, 55]]; // Rém – Si♭ – Fa – Do
    const bar = 3.6; for (let b = 0; b * bar < span - 1; b++) { const c = prog[b % 4]; [0, 1, 2, 1].forEach((j, k) => notes.push([b * bar + k * 0.9, c[j] + 12, 2.6, 0.26])); notes.push([b * bar, c[0] - 12, bar + 1, 0.3]); if (b % 2 === 1) notes.push([b * bar + 1.8, [69, 67, 65, 64][Math.floor(b / 2) % 4], 3, 0.24]); }
    chords.push([0, [38, 45], span]);
  }
  if (name === 'cellule') { [[0, 50], [2.5, 53], [5.0, 52], [7.5, 45]].forEach(([t, m]) => { notes.push([t, m, 4, 0.3]); notes.push([t, m - 12, 4, 0.25]); }); chords.push([0, [38, 41, 45], span]); }
  if (name === 'heritage') {
    const prog = [[50, 53, 57], [46, 50, 53], [43, 46, 50], [45, 49, 52]]; const bar = 3.2;
    for (let b = 0; b * bar < span - 2; b++) { const c = prog[b % 4]; [0, 1, 2, 1].forEach((j, k) => notes.push([b * bar + k * 0.8, c[j] + 12, 2.2, 0.22 + b * 0.02])); notes.push([b * bar, c[0] - 12, bar + 1, 0.3]); }
    chords.push([0, [38, 45, 50], span * 0.7]); chords.push([span * 0.65, [37, 44, 49, 50], span * 0.35]); // tension (seconde mineure)
  }
  if (name === 'fin') { // résolution : Rém → Fa → Si♭ → RÉ MAJEUR (l'espoir)
    [[0, [50, 53, 57, 62]], [4, [41, 48, 57, 65]], [8, [46, 53, 58, 62]], [12.5, [38, 50, 54, 57, 62, 66]]].forEach(([t, ch]) => ch.forEach((m, i) => notes.push([t + i * 0.12, m, 5.5, 0.26])));
    chords.push([0, [38, 45], 12.5]); chords.push([12.5, [38, 45, 50, 54], span - 12.5]);
  }
  const lines = []; // mélodies à l'archet : [t, midi, durée, volume]
  if (name === 'tension') { chords.push([0, [33, 40], span]); [[0.5, 45, 2.5], [3.0, 46, 3.2]].forEach(([t, m, d]) => lines.push([t, m, d, 0.12])); }
  if (name === 'instant') lines.push([3.5, 57, 5, 0.1], [9, 62, 4, 0.1], [13.5, 60, 3, 0.1], [16.5, 58, 3.5, 0.1]);
  if (name === 'partir') [[1.8, 69, 3.4], [5.4, 67, 1.8], [7.2, 65, 3.6], [10.8, 64, 3.6], [14.4, 62, 3.4], [17.8, 65, 1.8], [19.6, 64, 1.8], [21.4, 62, 3.2], [24.6, 61, 3.4]].forEach(([t, m, d]) => lines.push([t, m, d, 0.16]));
  if (name === 'pont') { chords.push([0, [38, 45, 53], span]); notes.push([0.2, 62, 3, 0.2], [1.8, 57, 3, 0.18]); }
  if (name === 'deuil') { chords.push([0, [38, 41, 45], span]); [[0.5, 50, 4], [4.6, 48, 3], [7.6, 46, 4.5], [12.2, 45, 4.5]].forEach(([t, m, d]) => lines.push([t, m, d, 0.2])); }
  if (name === 'cellule') [[1.2, 57, 3.5], [4.8, 55, 2], [6.8, 53, 4]].forEach(([t, m, d]) => lines.push([t, m, d, 0.13]));
  if (name === 'heritage') [[1.6, 69, 3.2], [4.8, 67, 1.6], [6.4, 65, 3.2], [9.6, 64, 3.2], [12.8, 65, 1.6], [14.4, 67, 1.6], [16.0, 69, 3.0], [19.2, 70, 3.6]].forEach(([t, m, d], i) => lines.push([t, m, d, 0.13 + i * 0.012]));
  if (name === 'main') { // la main s'ouvre : la mélodie de « Partir » revient, apaisée, et monte vers la lumière
    chords.push([0, [38, 45, 50], 6.5]); chords.push([6.5, [41, 48, 53], span - 6.5]);
    [[0.5, 62, 2.5], [3.0, 65, 2.5], [5.5, 69, 2.5], [8.0, 67, 2.5], [10.5, 69, 2.6]].forEach(([t, m, d]) => notes.push([t, m, d, 0.24]));
    [[1.0, 57, 5], [6.2, 60, 6]].forEach(([t, m, d]) => lines.push([t, m, d, 0.13]));
  }
  if (name === 'fin') [[2.0, 69, 4], [6.2, 72, 4], [10.4, 70, 3], [13.0, 69, 5.5]].forEach(([t, m, d]) => lines.push([t, m, d, 0.13]));
  lines.forEach(([t, m, d, v]) => { if (t < span) mus(t0 + t, cello(m, Math.min(d, span - t + 0.3), v), 1, m > 60 ? 0.25 : -0.25); });
  notes.forEach(([t, m, d, v]) => { if (t < span) mus(t0 + t, piano(m, Math.min(d, span - t + 0.5), v), 1, ((m % 7) / 7 - 0.5) * 0.6); });
  chords.forEach(([t, ms, d]) => mus(t0 + t, pad(ms, d, 0.06, 700), 1));
}

// ---------- rendu ----------
for (const [name, t, o = {}] of ep.CUES) {
  if (name === 'piano') { theme(o.theme, t, o.until); continue; }
  const f = FX[name]; if (!f) { console.warn('son inconnu :', name); continue; }
  const G = { shatter: 2.4, siren: 1.6, doorClose: 1.3, cellDoor: 1.5, thud: 1.4, freeze: 1.2 };
  const s = f(o, t); if (s) sfx(t, s, G[name] || 1, 0);
}
// réverbe (peignes + passe-tout) sur la musique, et un peu sur les bruitages
function reverb(inL, inR, wet, size = 1) {
  const combs = [1557, 1617, 1491, 1422, 1277, 1356].map((d) => Math.floor(d * size));
  const out = [new Float32Array(N), new Float32Array(N)];
  [inL, inR].forEach((x, ch) => { combs.forEach((d, j) => { const buf = new Float32Array(d + ch * 23); let i2 = 0, f = 0; for (let i = 0; i < N; i++) { const y = buf[i2]; f = y * 0.75 + f * 0.25; buf[i2] = x[i] + f * 0.82; i2 = (i2 + 1) % buf.length; out[ch][i] += y * wet / combs.length; } }); });
  return out;
}
const [mrl, mrr] = reverb(ML, MR, 0.7, 1.2), [srl, srr] = reverb(L, R, 0.25, 0.9);
// pendant les visions, l'ambiance des bruitages est plus feutrée ; normalisation douce
const outL = new Float32Array(N), outR = new Float32Array(N);
for (let i = 0; i < N; i++) { outL[i] = L[i] + srl[i] + (ML[i] * 0.6 + mrl[i]) * 1.35; outR[i] = R[i] + srr[i] + (MR[i] * 0.6 + mrr[i]) * 1.35; }
let peak = 0; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(outL[i]), Math.abs(outR[i]));
// niveau calé sur le 99,9e centile (les rares crêtes, comme le bris de verre, passent dans le limiteur doux)
const mags = []; for (let i = 0; i < N; i += 7) mags.push(Math.max(Math.abs(outL[i]), Math.abs(outR[i]))); mags.sort((a, b) => a - b);
const g = 0.8 / Math.max(mags[Math.floor(mags.length * 0.999)], peak / 2.5);
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVE', 8); buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { buf.writeInt16LE(Math.round(Math.tanh(outL[i] * g * 1.1) * 32767 * 0.95), 44 + i * 4); buf.writeInt16LE(Math.round(Math.tanh(outR[i] * g * 1.1) * 32767 * 0.95), 46 + i * 4); }
fs.mkdirSync(path.join(ROOT, 'out'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'out', `${epName}.wav`), buf);
console.log(`son : out/${epName}.wav  (${ep.duration}s, crête ${peak.toFixed(2)})`);
