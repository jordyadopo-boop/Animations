"""Musique + bruitages synthétisés de la pub Odyssée, calés sur timeline.json, puis mixage avec la voix.
Sortie : out/odyssee/mix.wav (stéréo 44,1 kHz, -14 LUFS). Usage : python3 pub/odyssee/tools/music.py"""
import json, os, subprocess
import numpy as np

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT = os.path.dirname(os.path.dirname(HERE))
OUT = os.path.join(ROOT, 'out', 'odyssee')
SR = 44100
TL = json.load(open(os.path.join(HERE, 'timeline.json'), encoding='utf8'))
S = {s['id']: s for s in TL['scenes']}
DUR = TL['duration'] + 0.5
N = int(DUR * SR)
rng = np.random.default_rng(7)
M = np.zeros((2, N))   # musique
FX = np.zeros((2, N))  # bruitages

def mtof(m): return 440 * 2 ** ((m - 69) / 12)
def env_ad(n, a, d): t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
def lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); acc = 0.0
    # filtre passe-bas 1 pôle (boucle numpy rapide via lfilter-like)
    from itertools import accumulate
    return lfilt(x, a)
def lfilt(x, a):
    # y[n] = (1-a) x[n] + a y[n-1]
    import scipy.signal as ss
    return ss.lfilter([1 - a], [1, -a], x)
def put(buf, t, sig, g=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N: return
    if i < 0: sig, i = sig[-i:], 0
    n = min(len(sig), N - i)
    buf[0, i:i + n] += sig[:n] * g * np.cos((pan + 1) * np.pi / 4) * 1.414
    buf[1, i:i + n] += sig[:n] * g * np.sin((pan + 1) * np.pi / 4) * 1.414
def osc(f, n, kind='sine'):
    ph = np.cumsum(np.full(n, f) if np.isscalar(f) else f) / SR
    if kind == 'sine': return np.sin(2 * np.pi * ph)
    if kind == 'saw': return 2 * (ph % 1) - 1
    if kind == 'tri': return 1 - 4 * np.abs((ph % 1) - 0.5)

# ---------- repères ----------
def line(sid, i): return S[sid]['lines'][i]['start']
def word(sid, i, j): return S[sid]['lines'][i]['words'][j]['s']
BPM = 112; BEAT = 60 / BPM
T_INTRO, T_LOGO, T_COUNT = S['intro']['start'], line('logo', 0), S['count']['start']
T_PHI, T_MONT, T_WF, T_FEAT, T_CLI = S['phi']['start'], S['trans']['start'], S['workflow']['start'], S['features']['start'], S['climax']['start']
T_ORANGE, T_CTA, T_END = line('climax', 2), S['cta']['start'], TL['duration']

# intensité de la musique dans le temps (0..1)
def intensity(t):
    pts = [(0, 0.15), (T_INTRO, 0.3), (T_LOGO - 0.3, 0.45), (T_LOGO, 0.2), (T_COUNT, 0.45), (T_PHI, 0.75), (T_MONT, 0.9), (T_WF - 0.1, 0.9),
           (T_WF, 0.4), (T_FEAT, 0.7), (T_CLI, 0.35), (T_ORANGE - 0.05, 0.6), (T_ORANGE, 1.0), (T_CTA, 0.8), (T_END - 2, 0.6), (DUR, 0)]
    xs, ys = zip(*pts); return np.interp(t, xs, ys)
tt = np.arange(N) / SR
I = intensity(tt)

# ---------- harmonie : Ré mineur, Dm - Bb - F - C (2 mesures chacun) ----------
CH = [[50, 53, 57], [46, 50, 53], [41, 45, 48], [48, 52, 55]]
BAR = 4 * BEAT
def chord_at(t): return CH[int(t // (2 * BAR)) % 4]

# nappe (pad) : dents de scie désaccordées, filtrées, à partir de l'intro
pad = np.zeros(N)
nb = int(DUR // (2 * BAR)) + 1
for b in range(nb):
    t0 = b * 2 * BAR; n = int(2 * BAR * SR) + SR
    ch = CH[b % 4]; seg = np.zeros(n)
    for m in ch + [ch[0] + 12]:
        for d in (-0.08, 0.08): seg += osc(mtof(m) * (1 + d / 100 * 12), n, 'saw')
    e = np.minimum(1, np.arange(n) / (0.8 * SR)) * np.minimum(1, (n - np.arange(n)) / (1.0 * SR))
    seg = lfilt(seg * e, np.exp(-2 * np.pi * 900 / SR)) * 0.05
    i = int(t0 * SR); k = min(n, N - i)
    if k > 0: pad[i:i + k] += seg[:k]
pad *= np.clip((tt - T_INTRO + 1) / 2, 0, 1) * (0.5 + 0.5 * I)
M[0] += pad; M[1] += np.roll(pad, 300)

# basse sub : fondamentale de l'accord en croches pulsées
bass = np.zeros(N)
t = T_COUNT
while t < T_END - 1:
    ch = chord_at(t); n = int(BEAT / 2 * SR)
    s = osc(mtof(ch[0] - 12), n, 'sine') * 0.9 + osc(mtof(ch[0] - 12), n, 'saw') * 0.15
    put_i = int(t * SR); k = min(n, N - put_i); bass[put_i:put_i + k] += (s * env_ad(n, 0.005, 0.18))[:k]
    t += BEAT / 2
bass = lfilt(bass, np.exp(-2 * np.pi * 300 / SR)) * 0.5 * np.clip(I * 1.2, 0, 1)
M += bass

# arpège pincé (doubles croches) : de l'intro à la fin, densité selon l'intensité
t = T_INTRO; k = 0
while t < T_END - 1.5:
    if not (T_ORANGE - 1.2 < t < T_ORANGE):
        ch = chord_at(t); m = (ch + [ch[0] + 12])[[0, 1, 2, 3, 2, 1, 3, 1][k % 8]] + 12
        n = int(0.35 * SR); s = (osc(mtof(m), n, 'tri') + 0.3 * osc(mtof(m) * 2, n, 'sine')) * env_ad(n, 0.002, 0.09)
        g = 0.07 * float(intensity(t)) * (1 if (k % 2 == 0 or intensity(t) > 0.5) else 0)
        put(M, t, s, g, pan=0.35 * np.sin(k * 0.7))
    t += BEAT / 4; k += 1

# batterie : grosse caisse, caisse claire, charleston, à partir de Phi
def kick(): n = int(0.4 * SR); f = 50 + 120 * np.exp(-np.arange(n) / SR / 0.04); return osc(f, n) * env_ad(n, 0.001, 0.14)
def snare(): n = int(0.3 * SR); return (rng.standard_normal(n) * 0.6 * env_ad(n, 0.001, 0.07) + osc(190, n) * env_ad(n, 0.001, 0.05)) * 0.8
def hat(): n = int(0.06 * SR); x = rng.standard_normal(n); return (x - lfilt(x, np.exp(-2 * np.pi * 7000 / SR))) * env_ad(n, 0.0005, 0.015)
KICK, SNARE, HAT = kick(), snare(), hat()
b = 0; t = T_PHI
while t < T_END - 2:
    it = float(intensity(t)); quiet = (T_WF < t < T_FEAT and b % 2) or (T_CLI < t < T_ORANGE)
    if not quiet:
        if b % 4 in (0,) or (it > 0.8 and b % 4 == 2.5): put(M, t, KICK, 0.55 * it)
        if b % 4 == 2 and it > 0.6: put(M, t, KICK, 0.4 * it)
        if b % 4 in (1, 3) and it > 0.5: put(M, t, SNARE, 0.18 * it)
        for h in range(2): put(M, t + h * BEAT / 2, HAT, 0.10 * it, pan=0.3)
    t += BEAT; b += 1

# ---------- bruitages ----------
def boom(dur=3.0):
    n = int(dur * SR); f = 38 + 60 * np.exp(-np.arange(n) / SR / 0.15)
    s = osc(f, n) * env_ad(n, 0.002, 0.9)
    nz = rng.standard_normal(n); nz = lfilt(nz, np.exp(-2 * np.pi * 400 / SR)) * env_ad(n, 0.001, 0.5) * 2
    return s + nz
def riser(dur):
    n = int(dur * SR); x = rng.standard_normal(n); out = np.zeros(n); seg = 2048
    for i in range(0, n, seg):  # bruit filtré qui s'ouvre
        fc = 200 + 7000 * (i / n) ** 2; out[i:i + seg] = lfilt(x[i:i + seg], np.exp(-2 * np.pi * fc / SR))
    tone = osc(np.linspace(mtof(50), mtof(74), n), n, 'saw') * 0.15
    return (out * 1.5 + lfilt(tone, 0.9)) * np.linspace(0, 1, n) ** 2
def whoosh(dur=0.5):
    n = int(dur * SR); x = rng.standard_normal(n); e = np.sin(np.linspace(0, np.pi, n)) ** 2
    return lfilt(x, np.exp(-2 * np.pi * 2500 / SR)) * e * 1.2
def shimmer(dur=2.5):
    n = int(dur * SR); s = np.zeros(n)
    for m in (74, 77, 81, 86, 89):
        s += osc(mtof(m), n) * env_ad(n, 0.01, 0.9) * 0.2
    return s
def tick(): n = int(0.03 * SR); return rng.standard_normal(n) * env_ad(n, 0.0003, 0.004)

put(FX, line('hook', 0), boom(2.0), 0.6)                                       # « Attends. »
put(FX, word('hook', 2, 3), boom(2.5), 0.7); put(FX, word('hook', 2, 3), shimmer(), 0.25)  # « PRÊT »
put(FX, T_LOGO - 2.5, riser(2.5), 0.3)
put(FX, T_LOGO, boom(4.0), 0.9); put(FX, T_LOGO, shimmer(3.5), 0.4)            # logo
for j in range(0, 22): put(FX, line('count', 1) + 0.1 + j * 0.055, tick(), 0.25)  # compteur 1 → 51
put(FX, word('count', 1, 4), boom(2.5), 0.6)
for i, sc in enumerate(TL['scenes'][4:-1]):  # une transition à chaque scène
    put(FX, sc['start'] - 0.25, whoosh(0.45), 0.35, pan=0.4 * (-1) ** i)
    if sc.get('type') == 'game': put(FX, sc['start'], KICK, 0.3); put(FX, sc['start'], shimmer(1.2), 0.08)
for sc in TL['scenes']:  # petit « tic » à chaque mécanique affichée
    for c in sc.get('chips', []): put(FX, c['t'] - 0.05, tick(), 0.35)
for l in S['montage']['lines']: put(FX, l['start'] - 0.2, whoosh(0.35), 0.3)
put(FX, T_ORANGE - 2.4, riser(2.4), 0.4)
put(FX, T_ORANGE, boom(4.0), 1.0); put(FX, T_ORANGE, shimmer(3.5), 0.45)        # « Commence ton odyssée »
put(FX, T_CTA, shimmer(4.0), 0.3)

# ---------- mixage ----------
def reverb(x, g=0.35):
    y = x.copy()
    for d, a in ((0.031, 0.5), (0.047, 0.42), (0.071, 0.36), (0.113, 0.3), (0.173, 0.24), (0.257, 0.18), (0.383, 0.12)):
        k = int(d * SR); y[:, k:] += x[:, :-k] * a * g * 1.6
    return lfilt(y, np.exp(-2 * np.pi * 6000 / SR))
music = reverb(M, 0.35) + reverb(FX, 0.25)
music *= np.clip((T_END + 0.3 - tt) / 1.5, 0, 1)  # fin en fondu

raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(OUT, 'vo.wav'), '-f', 'f64le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
vo = np.frombuffer(raw, dtype=np.float64)[:N]; vo = np.pad(vo, (0, N - len(vo)))
# compression de voix légère + atténuation de la musique sous la voix
env = lfilt(np.abs(vo), np.exp(-2 * np.pi * 4 / SR)); duck = 1 - 0.42 * np.clip(env / (env.max() * 0.25), 0, 1)
music /= np.abs(music).max() + 1e-9
mix = music * 0.55 * duck + vo[None, :] * 1.0 / (np.abs(vo).max() + 1e-9) * 0.9
pcm = (np.clip(mix.T, -1, 1) * 32767).astype('<i2').tobytes()
tmp = os.path.join(OUT, 'mix_raw.wav')
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 's16le', '-ar', str(SR), '-ac', '2', '-i', '-', tmp], input=pcm, check=True)
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', tmp, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', str(SR), os.path.join(OUT, 'mix.wav')], check=True)
print('ok', os.path.join(OUT, 'mix.wav'))
