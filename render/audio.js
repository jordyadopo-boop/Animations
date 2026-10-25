// Studio son de « PÉPIN ! » : musique cartoon + bruitages, entièrement synthétisés, calés sur CUES.
// Usage : node render/audio.js ep01   -> out/ep01.wav (44,1 kHz stéréo)
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './serve.js';

const SR = 44100;
const epName = process.argv[2] || 'ep01';
const ep = await import(path.join(ROOT, 'src/episodes', `${epName}.js`));
const N = Math.ceil(ep.duration * SR) + SR;
const L = new Float32Array(N), Rr = new Float32Array(N);         // bus bruitages
const ML = new Float32Array(N), MR = new Float32Array(N);        // bus musique (avec réverbe)

// ---------- outils ----------
let seed = 12345; const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const noise = () => rnd() * 2 - 1;
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
function mix(bufL, bufR, t0, sig, gain = 1, pan = 0) {
  const s0 = Math.floor(t0 * SR), gl = gain * Math.cos((pan + 1) * Math.PI / 4), gr = gain * Math.sin((pan + 1) * Math.PI / 4);
  for (let i = 0; i < sig.length; i++) { const k = s0 + i; if (k < 0 || k >= N) continue; bufL[k] += sig[i] * gl; bufR[k] += sig[i] * gr; }
}
const sfx = (t, sig, g = 1, pan = 0) => mix(L, Rr, t, sig, g, pan);
const mus = (t, sig, g = 1, pan = 0) => mix(ML, MR, t, sig, g, pan);
// générateur : f(t) fréquence (Hz) ou nombre, forme d'onde, enveloppe env(t,dur)
function tone(dur, freq, wave = 'sine', env = (t, d) => Math.min(1, t / 0.005) * Math.exp(-t * 3)) {
  const n = Math.floor(dur * SR), out = new Float32Array(n); let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR, f = typeof freq === 'function' ? freq(t) : freq; ph += f / SR; const p = ph % 1;
    let v = wave === 'sine' ? Math.sin(2 * Math.PI * p) : wave === 'square' ? (p < 0.5 ? 1 : -1) : wave === 'saw' ? 2 * p - 1 : wave === 'tri' ? 1 - 4 * Math.abs(p - 0.5) : noise();
    out[i] = v * env(t, dur);
  }
  return out;
}
function lowpass(sig, fc) { const a = Math.exp(-2 * Math.PI * fc / SR); let y = 0; return sig.map((x) => (y = (1 - a) * x + a * y)); }
function highpass(sig, fc) { const lp = lowpass(sig, fc); return sig.map((x, i) => x - lp[i]); }
function bandpass(sig, fc, q = 4) { // biquad
  const w = 2 * Math.PI * fc / SR, al = Math.sin(w) / (2 * q), b0 = al, b2 = -al, a0 = 1 + al, a1 = -2 * Math.cos(w), a2 = 1 - al;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0; return sig.map((x) => { const y = (b0 * x + b2 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = x; y2 = y1; y1 = y; return y; });
}
const add = (...sigs) => { const n = Math.max(...sigs.map((s) => s.length)), o = new Float32Array(n); sigs.forEach((s) => s.forEach((v, i) => (o[i] += v))); return o; };
const gainS = (s, g) => s.map((v) => v * g);
const ad = (a, d) => (t) => Math.min(1, t / a) * Math.exp(-t / d);
const hold = (a, r) => (t, dur) => Math.min(1, t / a) * Math.min(1, Math.max(0, (dur - t) / r));
// corde pincée (Karplus-Strong)
function pluck(freq, dur, bright = 0.5) {
  const n = Math.floor(dur * SR), p = Math.max(2, Math.round(SR / freq)), buf = new Float32Array(p).map(() => noise()), o = new Float32Array(n);
  for (let i = 0; i < n; i++) { const j = i % p, nx = (j + 1) % p; const v = buf[j]; o[i] = v; buf[j] = (v * bright + buf[nx] * (1 - bright)) * 0.996; }
  return o;
}
// voix cartoon (charabia) : dents de scie filtrées par 2 formants
function voice(dur, f0, vowels = [[700, 1200]], vib = 6) {
  const src = tone(dur, (t) => f0(t) * (1 + 0.02 * Math.sin(2 * Math.PI * vib * t)), 'saw', hold(0.01, 0.04));
  const per = dur / vowels.length; const out = new Float32Array(src.length);
  vowels.forEach(([f1, f2], i) => { const a = Math.floor(i * per * SR), b = Math.floor((i + 1) * per * SR); const seg = src.slice(a, b); const v = add(bandpass(seg, f1, 5), gainS(bandpass(seg, f2, 6), 0.6)); out.set(v.map((x, k) => x * Math.min(1, k / 400, (v.length - k) / 400)), a); });
  return gainS(out, 3);
}

// ---------- bruitages ----------
const FX = {
  boing: (o) => tone(0.55, (t) => 180 + 220 * Math.exp(-t * 6) * (1 + 0.5 * Math.sin(t * 60)), 'sine', ad(0.002, 0.25)),
  doing: () => add(tone(1.1, (t) => 140 * (1 + 0.08 * Math.sin(t * 55) * Math.exp(-t * 2)), 'tri', ad(0.002, 0.5)), gainS(tone(0.08, 0, 'noise', ad(0.001, 0.02)), 0.4)),
  spring: () => tone(0.4, (t) => 120 + 900 * t, 'sine', ad(0.005, 0.2)),
  whoosh: (o) => { const d = o?.dur || 0.6; return gainS(bandpass(tone(d, 0, 'noise', (t) => Math.sin(Math.PI * t / d)), 900, 1.2), 1.4); },
  swoosh: () => gainS(bandpass(tone(0.35, 0, 'noise', (t) => Math.sin(Math.PI * t / 0.35)), 2200, 2), 1.6),
  wind: (o) => { const d = o?.dur || 2; return gainS(lowpass(tone(d, 0, 'noise', (t) => Math.sin(Math.PI * t / d) * (0.7 + 0.3 * Math.sin(t * 9))), 700), 2.2); },
  whistleUp: (o) => tone(o?.dur || 0.8, (t) => 500 + 1300 * t / (o?.dur || 0.8), 'sine', hold(0.02, 0.05)),
  whistleDown: (o) => tone(o?.dur || 0.8, (t) => 1700 - 1300 * t / (o?.dur || 0.8), 'sine', hold(0.02, 0.05)),
  slideUp: (o) => tone(o?.dur || 0.6, (t) => 300 + 800 * t, 'tri', hold(0.02, 0.05)),
  splat: () => add(gainS(lowpass(tone(0.35, 0, 'noise', ad(0.002, 0.09)), 1400), 2), tone(0.25, (t) => 90 * Math.exp(-t * 6), 'sine', ad(0.002, 0.1))),
  squeak: (o) => { const d = o?.dur || 1.2; return gainS(tone(d, (t) => 1500 + 400 * Math.sin(t * 18), 'tri', (t) => 0.4 * Math.sin(Math.PI * t / d) * (0.6 + 0.4 * Math.sin(t * 40))), 0.6); },
  scramble: (o) => { const d = o?.dur || 0.4, out = new Float32Array(Math.floor(d * SR)); for (let k = 0; k < d * 20; k++) out.set(gainS(highpass(tone(0.02, 0, 'noise', ad(0.001, 0.008)), 2000), 0.7), Math.floor(k * SR / 20)); return out; },
  tiptoe: (o) => { const d = o?.dur || 2, out = new Float32Array(Math.floor(d * SR)); for (let k = 0; k < d * 4; k++) out.set(pluck(mtof(76 + (k % 2) * 3), 0.15, 0.3).map((v) => v * 0.5), Math.floor(k * SR / 4)); return out; },
  gulp: () => tone(0.3, (t) => 300 - 600 * t + 80 * Math.sin(t * 50), 'sine', ad(0.01, 0.12)),
  screech: () => gainS(add(bandpass(tone(0.9, (t) => 1600 + 300 * Math.sin(t * 30), 'saw', hold(0.02, 0.2)), 2400, 3), bandpass(tone(0.9, 0, 'noise', hold(0.02, 0.2)), 3200, 4)), 0.9),
  screechMagpie: () => { const out = new Float32Array(Math.floor(0.9 * SR)); for (let k = 0; k < 4; k++) out.set(gainS(bandpass(tone(0.16, (t) => 1300 - 300 * t, 'saw', ad(0.005, 0.08)), 1800, 3), 1.6), Math.floor(k * 0.2 * SR)); return out; },
  tweet: (o) => { const d = o?.dur || 1.5, out = new Float32Array(Math.floor(d * SR)); for (let k = 0; k < d * 5; k++) out.set(tone(0.12, (t) => 2800 + 900 * Math.sin(t * 80) - k * 20, 'sine', ad(0.005, 0.05)).map((v) => v * 0.35), Math.floor(k * SR / 5)); return out; },
  flap: (o) => { const d = o?.dur || 1.5, out = new Float32Array(Math.floor(d * SR)); for (let k = 0; k < d * 7; k++) out.set(gainS(lowpass(tone(0.09, 0, 'noise', ad(0.004, 0.03)), 900), 1.2), Math.floor(k * SR / 7)); return out; },
  creak: (o) => { const d = o?.dur || 1.5; return gainS(bandpass(tone(d, (t) => 90 + 30 * Math.sin(t * 3), 'saw', (t) => Math.sin(Math.PI * t / d) * (0.5 + 0.5 * (Math.sin(t * 35) > 0.6 ? 1 : 0))), 700, 3), 1.2); },
  strain: (o) => voice(o?.dur || 0.8, (t) => 260 + 120 * t, [[400, 900]], 14),
  ploc: () => tone(0.15, (t) => 900 * Math.exp(-t * 20) + 300, 'sine', ad(0.001, 0.05)),
  ding: () => add(tone(1.2, 1568, 'sine', ad(0.002, 0.5)), gainS(tone(1.2, 3136, 'sine', ad(0.002, 0.25)), 0.4)),
  twinkle: () => { const out = new Float32Array(Math.floor(0.7 * SR)); [88, 91, 95, 100].forEach((m, k) => out.set(tone(0.3, mtof(m), 'sine', ad(0.002, 0.12)).map((v) => v * 0.4), Math.floor(k * 0.08 * SR))); return out; },
  zoom: () => gainS(bandpass(tone(0.35, 0, 'noise', (t) => t / 0.35), 1500, 1), 1.5),
  zoomAway: (o) => { const d = o?.dur || 1; return add(tone(d, (t) => 900 - 600 * t / d, 'tri', (t) => 0.4 * (1 - t / d)), gainS(bandpass(tone(d, 0, 'noise', (t) => 1 - t / d), 1200, 1), 1.2)); },
  catch: () => add(tone(0.1, 220, 'sine', ad(0.002, 0.04)), gainS(lowpass(tone(0.08, 0, 'noise', ad(0.001, 0.02)), 2500), 0.8)),
  crack: () => add(gainS(highpass(tone(0.2, 0, 'noise', ad(0.001, 0.03)), 1500), 2), tone(0.1, 400, 'square', ad(0.001, 0.02)).map((v) => v * 0.3)),
  blink: () => tone(0.06, 2400, 'sine', ad(0.001, 0.02)).map((v) => v * 0.3),
  drool: () => tone(0.4, (t) => 700 - 500 * t, 'sine', ad(0.01, 0.15)).map((v) => v * 0.5),
  idea: () => add(tone(0.5, 1319, 'sine', ad(0.002, 0.2)), tone(0.5, 1976, 'sine', ad(0.002, 0.2)).map((v) => v * 0.6)),
  spooky: (o) => { const d = o?.dur || 1.5; return add(tone(d, (t) => 220 + 30 * Math.sin(t * 6), 'sine', (t) => 0.4 * Math.sin(Math.PI * t / d)), tone(d, (t) => 233 + 30 * Math.sin(t * 6.5), 'sine', (t) => 0.3 * Math.sin(Math.PI * t / d))); },
  iris: () => tone(0.9, (t) => 600 - 400 * t, 'sine', (t) => 0.3 * (1 - t / 0.9)),
  snore: () => gainS(lowpass(tone(1.4, 0, 'noise', (t) => Math.sin(Math.PI * t / 1.4) ** 2 * (0.6 + 0.4 * Math.sin(t * 38))), 500), 1.6),
  growl: () => gainS(lowpass(tone(0.7, (t) => 60 + 20 * Math.sin(t * 20), 'saw', (t) => Math.sin(Math.PI * t / 0.7)), 300), 1.2),
  stretch: (o) => voice(o?.dur || 0.8, (t) => 300 - 80 * t, [[500, 1000], [650, 1100]], 8),
  yawn: () => voice(0.7, (t) => 330 - 150 * t, [[750, 1150], [700, 1100], [500, 900]], 5),
  hehe: () => { const out = new Float32Array(Math.floor(0.9 * SR)); for (let k = 0; k < 3; k++) out.set(voice(0.16, () => 720 + k * 30, [[450, 2000]], 0), Math.floor(k * 0.24 * SR)); return out; },
  coucou: () => { const out = new Float32Array(Math.floor(0.8 * SR)); out.set(voice(0.25, () => 880, [[350, 900], [300, 800]], 0)); out.set(voice(0.3, () => 740, [[350, 900], [300, 800]], 0), Math.floor(0.32 * SR)); return out; },
  sad: () => { const out = new Float32Array(Math.floor(2.6 * SR)); [58, 57, 56].forEach((m, k) => out.set(bandpass(tone(0.45, mtof(m), 'saw', hold(0.02, 0.1)), 700, 1.2).map((v) => v * 1.4), Math.floor(k * 0.5 * SR)));
    out.set(bandpass(tone(1.0, (t) => mtof(55) * (1 + 0.02 * Math.sin(t * 30)), 'saw', hold(0.02, 0.3)), 650, 1.2).map((v) => v * 1.4), Math.floor(1.5 * SR)); return out; },
  title: () => { const out = new Float32Array(Math.floor(1.6 * SR)); [72, 76, 79, 84].forEach((m, k) => out.set(add(tone(0.6, mtof(m), 'sine', ad(0.002, 0.3)), tone(0.6, mtof(m) * 4, 'sine', ad(0.002, 0.08)).map((v) => v * 0.3)), Math.floor(k * 0.11 * SR))); return out; },
  outro: () => { const out = new Float32Array(Math.floor(2.5 * SR)); [[60, 0], [64, 0.15], [67, 0.3], [72, 0.5]].forEach(([m, t0]) => out.set(add(pluck(mtof(m), 2, 0.4), tone(1.5, mtof(m) / 2, 'tri', ad(0.01, 0.6)).map((v) => v * 0.4)), Math.floor(t0 * SR))); return out; },
  beat: () => new Float32Array(1),
  eagleTheme: () => { const out = new Float32Array(Math.floor(1.6 * SR)); [[36, 0, 0.25], [36, 0.3, 0.25], [42, 0.6, 0.9]].forEach(([m, t0, d]) => out.set(add(lowpass(tone(d, mtof(m), 'saw', hold(0.02, 0.15)), 900), lowpass(tone(d, mtof(m + 12), 'saw', hold(0.02, 0.15)), 1200).map((v) => v * 0.5), tone(d, mtof(m - 12), 'sine', hold(0.02, 0.15))).map((v) => v * 0.7), Math.floor(t0 * SR))); return out; },
  margotTheme: () => { const out = new Float32Array(Math.floor(1.6 * SR)); [79, 78, 77, 76, 75, 74].forEach((m, k) => out.set(bandpass(tone(0.16, mtof(m), 'square', ad(0.005, 0.1)), mtof(m) * 1.5, 1).map((v) => v * 0.9), Math.floor(k * 0.18 * SR))); return out; },
};

// ---------- musique : petit séquenceur par sections ----------
const C = (root, kind) => (kind === 'm' ? [root, root + 3, root + 7] : kind === '7' ? [root, root + 4, root + 7, root + 10] : [root, root + 4, root + 7]);
const THEME = [[72, 0.5], [76, 0.5], [79, 0.5], [81, 0.5], [79, 0.5], [76, 0.5], [72, 1], [74, 0.5], [77, 0.5], [81, 0.5], [83, 0.5], [81, 0.5], [77, 0.5], [74, 1],
  [76, 0.5], [79, 0.5], [84, 0.5], [83, 0.5], [81, 0.5], [79, 0.5], [77, 0.5], [76, 0.5], [74, 0.5], [67, 0.5], [71, 0.5], [74, 0.5], [72, 2]];
const PROG = [C(48, ''), C(50, 'm'), C(55, '7'), C(48, ''), C(45, 'm'), C(50, 'm'), C(55, '7'), C(48, '')];
function xylo(m, dur, g = 0.35) { const f = mtof(m); return add(tone(Math.min(dur, 0.6), f, 'sine', ad(0.002, 0.18)), tone(0.15, f * 4, 'sine', ad(0.001, 0.03)).map((v) => v * 0.4)).map((v) => v * g); }
function clar(m, dur, g = 0.25) { return lowpass(tone(dur, (t) => mtof(m) * (1 + 0.006 * Math.sin(t * 34)), 'square', hold(0.03, 0.06)), mtof(m) * 3).map((v) => v * g); }
function tuba(m, dur, g = 0.5) { return lowpass(tone(dur, mtof(m), 'saw', hold(0.01, 0.06)), 400).map((v) => v * g); }
function kick(g = 0.8) { return tone(0.25, (t) => 50 + 110 * Math.exp(-t * 30), 'sine', ad(0.002, 0.09)).map((v) => v * g); }
function snare(g = 0.35) { return add(highpass(tone(0.18, 0, 'noise', ad(0.001, 0.05)), 1500), tone(0.1, 190, 'tri', ad(0.001, 0.04)).map((v) => v * 0.5)).map((v) => v * g); }
function hat(g = 0.12) { return highpass(tone(0.05, 0, 'noise', ad(0.001, 0.012)), 6000).map((v) => v * g); }

// une section : [t0, t1, style, bpm, transpose]
function section(t0, t1, style, bpm, tr = 0, gain = 1) {
  const beat = 60 / bpm; let bar = 0;
  for (let tb = t0; tb < t1 - 0.01; tb += beat * 4, bar++) {
    const ch = PROG[bar % PROG.length].map((m) => m + tr);
    for (let b = 0; b < 4; b++) {
      const tt = tb + b * beat; if (tt >= t1) break;
      if (style === 'calm') { if (b === 0) ch.forEach((m) => mus(tt, xylo(m + 12, 1.2, 0.12 * gain))); if (b % 2 === 0) mus(tt, tuba(ch[0] - 12, beat * 0.9, 0.25 * gain)); }
      if (style === 'play' || style === 'galop') {
        mus(tt, tuba(b % 2 ? ch[2] - 12 : ch[0] - 12, beat * 0.45, 0.45 * gain));
        if (b % 2) ch.forEach((m) => mus(tt, pluck(mtof(m), 0.25, 0.5).map((v) => v * 0.18 * gain), 1, 0.3));
        mus(tt, kick(b % 2 ? 0 : 0.5 * gain)); if (b % 2) mus(tt, snare(0.25 * gain), 1, -0.2);
        mus(tt, hat(0.1 * gain), 1, 0.4); mus(tt + beat / 2, hat(0.07 * gain), 1, 0.4);
        if (style === 'galop') mus(tt + beat / 2, tuba(ch[1] - 12, beat * 0.3, 0.3 * gain));
      }
      if (style === 'sneak') { mus(tt, pluck(mtof(ch[0] - 12 + [0, 3, 6, 3][b]), 0.2, 0.3).map((v) => v * 0.5 * gain)); if (b === 3) mus(tt + beat / 2, pluck(mtof(ch[0] + 11), 0.15, 0.4).map((v) => v * 0.3 * gain)); }
      if (style === 'danger') { mus(tt, lowpass(tone(beat, mtof(ch[0] - 24 + (bar % 2)), 'saw', hold(0.01, 0.1)), 500).map((v) => v * 0.5 * gain)); for (let k = 0; k < 4; k++) mus(tt + k * beat / 4, tone(beat / 4, mtof(ch[0] + 3), 'tri', ad(0.002, 0.04)).map((v) => v * 0.08 * gain), 1, 0.3); }
      if (style === 'rise') { mus(tt, tone(beat, mtof(ch[0] + bar * 2 + b), 'tri', ad(0.005, 0.2)).map((v) => v * 0.15 * gain)); mus(tt, kick(0.4 * gain)); }
    }
  }
  // mélodie : thème de Pépin (xylophone ou clarinette)
  if (style === 'play' || style === 'galop' || style === 'calm') {
    let tt = t0; let i = 0;
    while (tt < t1 - 0.05) { const [m, d] = THEME[i % THEME.length]; const dur = d * beat; if (style === 'calm') mus(tt, clar(m - 12 + tr, dur * 0.95, 0.12 * gain), 1, -0.2); else mus(tt, xylo(m + tr, dur, 0.3 * gain), 1, -0.15); tt += dur; i++; }
  }
}

// plan musical de l'épisode (calé sur les plans)
if (epName === 'ep01') {
  section(0, 5, 'calm', 100, 0, 0.9);
  section(5, 11.5, 'play', 120, 0, 0.8);
  section(11.5, 20, 'play', 140, 2, 0.9);
  section(20, 22.6, 'sneak', 110, -3, 1);
  section(22.6, 28.5, 'danger', 120, -3, 1);
  section(28.5, 31.05, 'rise', 120, 0, 1);
  section(31.05, 36, 'play', 140, 5, 0.9);
  section(36, 42.5, 'galop', 160, 0, 0.9);
  section(42.5, 46, 'play', 150, 7, 0.9);
  section(46, 49.7, 'calm', 100, 0, 0.8);
  section(54.5, 62, 'calm', 96, 0, 0.9);
}

// ---------- bruitages calés sur les CUES ----------
for (const [name, t, o] of ep.CUES) {
  if (name === 'music' || name === 'credits') continue;
  const f = FX[name]; if (!f) { console.warn('bruitage inconnu :', name); continue; }
  const pan = ((t * 7.3) % 1) * 0.6 - 0.3;
  sfx(t, f(o), ['eagleTheme', 'margotTheme', 'outro', 'title', 'sad'].includes(name) ? 0.9 : 0.75, ['eagleTheme', 'margotTheme', 'outro'].includes(name) ? 0 : pan);
}

// ---------- réverbe légère sur la musique, mixage, normalisation ----------
function reverb(x) {
  const combs = [1557, 1617, 1491, 1422].map((d) => ({ d, b: new Float32Array(d), i: 0 })), aps = [225, 556].map((d) => ({ d, b: new Float32Array(d), i: 0 }));
  const y = new Float32Array(x.length);
  for (let n = 0; n < x.length; n++) {
    let s = 0; for (const c of combs) { const o = c.b[c.i]; c.b[c.i] = x[n] + o * 0.78; c.i = (c.i + 1) % c.d; s += o; }
    s /= 4; for (const a of aps) { const o = a.b[a.i]; const v = -s + o; a.b[a.i] = s + o * 0.5; a.i = (a.i + 1) % a.d; s = v; }
    y[n] = s;
  }
  return y;
}
const rvL = reverb(ML), rvR = reverb(MR);
let peak = 0;
const outL = new Float32Array(N), outR = new Float32Array(N);
for (let i = 0; i < N; i++) {
  outL[i] = (ML[i] + rvL[i] * 0.25) * 1.8 + L[i] * 0.8; outR[i] = (MR[i] + rvR[i] * 0.25) * 1.8 + Rr[i] * 0.8;
  peak = Math.max(peak, Math.abs(outL[i]), Math.abs(outR[i]));
}
// limiteur doux : on remonte le niveau moyen sans écrêter les impacts
const pre = 1.6 / (peak || 1), lim = (x) => Math.tanh(x * pre * 1.4) / Math.tanh(1.4);
for (let i = 0; i < N; i++) { outL[i] = lim(outL[i]); outR[i] = lim(outR[i]); }
const g = 0.92;
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, outL[i] * g)) * 32767), 44 + i * 4); buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, outR[i] * g)) * 32767), 46 + i * 4); }
const out = path.join(ROOT, 'out', `${epName}.wav`); fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, buf);
console.log(`son : ${out} (${(N / SR).toFixed(1)} s, crête ${peak.toFixed(2)})`);
