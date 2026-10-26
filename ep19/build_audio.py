import asyncio, ssl, os, json, hashlib, subprocess, sys
import numpy as np
from scipy.signal import butter, sosfilt
import edge_tts, edge_tts.communicate
from script_ep19 import SCRIPT, VOICES

edge_tts.communicate._SSL_CTX = ssl.create_default_context(cafile="/root/.ccr/ca-bundle.crt")
# Force le francais : edge-tts code en dur xml:lang='en-US', ce qui fait lire certaines phrases en anglais aux voix multilingues
def _mkssml_fr(tc, escaped_text):
    if isinstance(escaped_text, bytes): escaped_text = escaped_text.decode("utf-8")
    return ("<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='fr-FR'>"
            f"<voice name='{tc.voice}'>"
            f"<prosody pitch='{tc.pitch}' rate='{tc.rate}' volume='{tc.volume}'>"
            f"{escaped_text}</prosody></voice></speak>")
edge_tts.communicate.mkssml = _mkssml_fr
SR = 48000
FPS = 24
HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, "tts_cache"); os.makedirs(CACHE, exist_ok=True)
OUT = os.path.join(HERE, "build"); os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(6)

async def tts(text, spk):
    v = VOICES[spk]
    key = hashlib.md5((text + json.dumps(v) + "fr-FR").encode()).hexdigest()
    mp3 = os.path.join(CACHE, key + ".mp3")
    if not os.path.exists(mp3) or os.path.getsize(mp3) < 1000:
        for attempt in range(4):
            try:
                c = edge_tts.Communicate(text, v["voice"], rate=v["rate"], pitch=v["pitch"])
                await c.save(mp3); break
            except Exception as e:
                print("retry", e); await asyncio.sleep(2 ** attempt)
    raw = subprocess.run(["ffmpeg", "-v", "quiet", "-i", mp3, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                         capture_output=True).stdout
    a = np.frombuffer(raw, np.float32).copy()
    # trim silence
    thr = 0.01; idx = np.where(np.abs(a) > thr)[0]
    if len(idx): a = a[max(0, idx[0] - 800): idx[-1] + 2400]
    return a

def lp(x, f, order=2): return sosfilt(butter(order, f, "low", fs=SR, output="sos"), x)
def hp(x, f, order=2): return sosfilt(butter(order, f, "high", fs=SR, output="sos"), x)
def bp(x, lo, hi, order=2): return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)
def mtof(m): return 440 * 2 ** ((m - 69) / 12)

async def main():
    t = 0.0
    scenes, lines, cues, dates, titles, subs = [], [], {}, [], [], []
    voice_tracks = []  # (start, audio, spk)
    for it in SCRIPT:
        k = it[0]
        if k == "scene":
            if scenes: scenes[-1]["end"] = t
            scenes.append({"id": it[1], "start": t})
        elif k == "pause": t += it[1]
        elif k == "cue": cues[it[1]] = t
        elif k == "date": dates.append({"fr": it[1], "en": it[2], "start": t, "end": t + it[3]})
        elif k == "title": titles.append({"fr": it[1], "en": it[2], "start": t, "end": t + it[3]})
        elif k == "say":
            spk, chunks, expr = it[1], it[2], it[3]
            ls = t
            for i, (fr, en) in enumerate(chunks):
                a = await tts(fr, spk)
                if spk == "ea":
                    out = np.zeros(len(a) + int(SR * 1.2), np.float32)
                    out[:len(a)] += a
                    for d, g in [(0.09, 0.45), (0.21, 0.3), (0.37, 0.18), (0.6, 0.1)]:
                        o = int(d * SR); out[o:o + len(a)] += g * lp(a, 2500)
                    a = out[:len(a) + int(SR * 0.5)]
                d = len(a) / SR
                voice_tracks.append((t, a, spk))
                subs.append({"start": t, "end": t + d, "en": en})
                t += d + (0.15 if i < len(chunks) - 1 else 0)
            lines.append({"speaker": spk, "start": ls, "end": t, "expr": expr})
            t += 0.25
    scenes[-1]["end"] = t
    T = t
    N = int(T * SR) + SR
    voice = np.zeros(N, np.float32)
    env = {}
    for st, a, spk in voice_tracks:
        i = int(st * SR); voice[i:i + len(a)] += a
        e = env.setdefault(spk, np.zeros(N, np.float32)); e[i:i + len(a)] += a
    # envelopes per frame
    nf = int(T * FPS) + 2
    envs = {}
    for spk, e in env.items():
        hop = SR // FPS
        v = np.array([np.sqrt(np.mean(e[j * hop:(j + 1) * hop] ** 2)) if j * hop < N else 0 for j in range(nf)])
        v = v / (np.percentile(v[v > 0.005], 95) + 1e-6)
        envs[spk] = [round(float(min(1.0, x)), 3) for x in v]

    sc = {s["id"]: s for s in scenes}
    tt = np.arange(N) / SR
    music = np.zeros(N)
    sfx = np.zeros(N)

    def seg_env(s, e, fi=1.0, fo=1.2):
        w = np.zeros(N); i0, i1 = int(s * SR), min(N, int(e * SR))
        w[i0:i1] = 1
        r = np.arange(i1 - i0) / SR
        w[i0:i1] *= np.clip(r / fi, 0, 1) * np.clip((e - s - r) / fo, 0, 1)
        return w

    def pad(chords, s, e, cd, vol=0.08, bright=1200):
        out = np.zeros(N)
        i0, i1 = int(s * SR), min(N, int(e * SR))
        x = tt[i0:i1]
        sig = np.zeros(i1 - i0)
        for ci in range(int(np.ceil((e - s) / cd))):
            notes = chords[ci % len(chords)]
            cs, ce = s + ci * cd, s + (ci + 1) * cd
            w = np.clip((x - cs) / 0.8, 0, 1) * np.clip((ce + 0.8 - x) / 0.8, 0, 1)
            for m in notes:
                f = mtof(m)
                for det in (-0.12, 0.12):
                    ph = 2 * np.pi * f * (1 + det / 100) * x
                    sig += w * (np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.15 * np.sin(3 * ph)) / len(notes)
        sig = lp(sig, bright)
        out[i0:i1] = sig * vol
        return out * seg_env(s, e)

    def pluck_seq(notes, s, e, step, vol=0.05, dec=4.0):
        out = np.zeros(N)
        k = 0; ts = s
        while ts < e - 0.2:
            m = notes[k % len(notes)]; f = mtof(m)
            i0 = int(ts * SR); L = int(SR * 1.2); i1 = min(N, i0 + L)
            x = np.arange(i1 - i0) / SR
            out[i0:i1] += vol * np.exp(-dec * x) * (np.sin(2 * np.pi * f * x) + 0.3 * np.sin(4 * np.pi * f * x))
            k += 1; ts += step
        return out * seg_env(s, e, 0.3, 1.0)

    def boom(at, vol=0.5, f0=60):
        i0 = int(at * SR); L = int(SR * 2.5); i1 = min(N, i0 + L)
        x = np.arange(i1 - i0) / SR
        f = f0 * (1 + 2 * np.exp(-x * 20))
        sfx[i0:i1] += vol * np.exp(-x * 2.2) * np.sin(2 * np.pi * np.cumsum(f) / SR)
        n = rng.standard_normal(i1 - i0) * np.exp(-x * 9)
        sfx[i0:i1] += vol * 0.4 * lp(n, 400)

    def thunder(at, vol=0.45):
        i0 = int(at * SR); L = int(SR * 4); i1 = min(N, i0 + L)
        x = np.arange(i1 - i0) / SR
        n = rng.standard_normal(i1 - i0)
        crack = hp(n, 1500) * np.exp(-x * 25) * 0.6
        rumble = lp(n, 160, 4) * 6 * np.exp(-x * 0.9) * (1 + 0.5 * np.sin(2 * np.pi * 3 * x))
        sfx[i0:i1] += vol * (crack + rumble)

    def noise_bed(s, e, lo, hi, vol, fi=1.5, fo=1.5, mod=0.0):
        n = rng.standard_normal(N)
        b = bp(n, lo, hi) * vol
        if mod: b *= 1 + mod * np.sin(2 * np.pi * 0.15 * tt)
        return b * seg_env(s, e, fi, fo)

    def whoosh(at, vol=0.18, d=1.0):
        i0 = int((at - d / 2) * SR); L = int(SR * d); i1 = min(N, i0 + L)
        x = np.arange(i1 - i0) / L
        n = rng.standard_normal(i1 - i0)
        w = np.sin(np.pi * x) ** 2
        sfx[i0:i1] += vol * w * bp(n, 300, 3000)

    def clicks(s, e, rate, vol, lo=800, hi=6000, dec=300):
        out = np.zeros(N)
        cnt = int((e - s) * rate)
        for _ in range(cnt):
            at = s + rng.random() * (e - s); i0 = int(at * SR); L = 1200
            if i0 + L >= N: continue
            x = np.arange(L) / SR
            out[i0:i0 + L] += rng.uniform(0.3, 1) * np.exp(-x * dec) * rng.standard_normal(L)
        return bp(out, lo, hi) * vol * seg_env(s, e, 0.5, 1.2)

    def thunk(at, vol=0.3):
        i0 = int(at * SR); L = int(SR * 0.4); i1 = min(N, i0 + L)
        x = np.arange(i1 - i0) / SR
        sfx[i0:i1] += vol * np.exp(-x * 18) * (np.sin(2 * np.pi * 110 * x) + 0.5 * lp(rng.standard_normal(i1 - i0), 900))

    def flutter(at, d=1.2, vol=0.12):
        i0 = int(at * SR); L = int(SR * d); i1 = min(N, i0 + L)
        x = np.arange(i1 - i0) / SR
        n = bp(rng.standard_normal(i1 - i0), 400, 2500)
        sfx[i0:i1] += vol * n * (0.5 + 0.5 * np.sin(2 * np.pi * 9 * x)) * np.sin(np.pi * x / d)

    # ---- music & ambience per scene
    def bell(at, vol=0.08, f=660):
        i = int(at * SR); L = int(SR * 3)
        if i + L >= N: return
        x = np.arange(L) / SR
        sfx[i:i + L] += vol * np.exp(-x * 1.2) * (np.sin(2 * np.pi * f * x) + 0.5 * np.sin(2 * np.pi * f * 2.76 * x) + 0.3 * np.sin(2 * np.pi * f * 5.4 * x))
    def riser(s, e, vol=0.12, lo=200, hi=2500):
        i0, i1 = int(s * SR), min(N, int(e * SR)); L = i1 - i0
        x = np.arange(L) / L
        n = rng.standard_normal(L)
        a1 = bp(n, lo, lo * 3); a2 = bp(n, hi / 3, hi)
        sig = (a1 * (1 - x) + a2 * x) * (x ** 2.2)
        # cluster de cordes qui monte
        for m in (62, 63, 68, 69):
            f = mtof(m) * (1 + 0.06 * x)
            sig += 0.25 * (x ** 2) * np.sin(2 * np.pi * np.cumsum(f) / SR) * (1 + 0.3 * np.sin(2 * np.pi * 6 * x * (e - s)))
        sfx[i0:i1] += vol * sig * np.clip((1 - x) / 0.03, 0, 1)
    def train(s, e, vol=0.05):
        return noise_bed(s, e, 40, 260, vol, 1.5, 2.0, 0.6)
    def heart(s, e, period=1.1, vol=0.25):
        ts_ = s
        while ts_ < e:
            for d, g in ((0, 1), (0.22, 0.7)):
                i0 = int((ts_ + d) * SR); L = int(SR * 0.25); i1 = min(N, i0 + L); x = np.arange(i1 - i0) / SR
                sfx[i0:i1] += vol * g * np.exp(-x * 22) * np.sin(2 * np.pi * 52 * x)
            ts_ += period
    def bounce(s, e, vol=0.03, seq=(60, 64, 67, 72, 67, 64), step=0.25):
        out = np.zeros(N); k = 0; ts_ = s
        while ts_ < e - 0.2:
            f = mtof(seq[k % len(seq)]); i0 = int(ts_ * SR); L = int(SR * 0.25); i1 = min(N, i0 + L); x = np.arange(i1 - i0) / SR
            out[i0:i1] += vol * np.exp(-x * 14) * np.sin(2 * np.pi * f * x) * 0.8
            bs = mtof(36 + [0, 5, 7, 5][(k // 4) % 4]); out[i0:i1] += vol * 1.1 * np.exp(-x * 10) * np.sin(2 * np.pi * bs * x) * (k % 2 == 0)
            k += 1; ts_ += step
        return lp(out, 3500) * seg_env(s, e, 0.3, 0.8)
    s = sc["intro"]
    music += pad([[45, 52, 57, 64], [41, 48, 53, 60], [43, 50, 55, 62]], 0.2, s["end"] + 0.5, 3.5, 0.05, 1600)
    music += pluck_seq([76, 79, 83, 88, 83, 79], 0.4, cues["title"], 0.3, 0.014)
    boom(cues["title"], 0.3, 50); whoosh(cues["title"], 0.12, 1.0); bell(cues["title"] + 0.05, 0.05, 988)
    s = sc["bus"]
    sfx += noise_bed(s["start"], cues["brake"] + 0.6, 60, 400, 0.04, 1.0, 0.3, 0.3)
    music += bounce(s["start"], cues["brake"], 0.024)
    whoosh(cues["brake"] + 0.3, 0.2, 0.6); boom(cues["brake"] + 0.35, 0.25, 70)
    music += pad([[45, 48, 52, 57]], cues["brake"], cues["relief"], 4, 0.05, 900)
    music += pad([[48, 55, 60, 64], [53, 60, 65, 69]], cues["relief"], s["end"] + 0.4, 3, 0.05, 2200)
    s = sc["lent"]
    music += pad([[50, 57, 62, 66], [45, 52, 57, 61], [47, 54, 59, 62]], s["start"], s["end"] + 0.4, 4, 0.05, 1800)
    music += pluck_seq([74, 78, 81, 86], cues["ines"], cues["oceans"], 0.3, 0.02)
    sfx += noise_bed(cues["oceans"], s["end"], 100, 900, 0.02, 1.5, 1.5, 0.6)
    s = sc["orbite"]
    music += pad([[38, 45, 50, 57], [36, 43, 48, 55]], s["start"], s["end"] + 0.5, 5, 0.055, 800)
    riser(s["start"] + 0.5, s["start"] + 4.0, 0.06)
    music += pluck_seq([81, 76, 72, 69], cues["life"], s["end"], 0.7, 0.014)
    s = sc["fin"]
    music += pad([[48, 55, 60, 64], [53, 60, 65, 69], [55, 62, 67, 71], [57, 64, 69, 72]], s["start"], s["end"] + 1, 3, 0.055, 2400)
    music += bounce(cues["question"], s["end"], 0.025)
    for sc_ in scenes[1:]: whoosh(sc_["start"], 0.09, 0.8)

    # ducking
    venv = lp(np.abs(voice).astype(np.float64), 4)
    duck = 1 - 0.5 * np.clip(venv / 0.05, 0, 1)
    mix = voice + (music * duck + sfx * (0.6 + 0.4 * duck)) * 0.9
    mix = mix[: int((T + 0.5) * SR)]
    st = np.stack([mix, mix], 1).astype(np.float32)
    raw = os.path.join(OUT, "mix_raw.f32")
    st.tofile(raw)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw,
                    "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", str(SR), os.path.join(OUT, "audio.wav")], check=True)
    os.remove(raw)

    tl = {"duration": T, "fps": FPS, "scenes": scenes, "lines": lines, "cues": cues,
          "dates": dates, "titles": titles, "subs": subs, "env": envs}
    json.dump(tl, open(os.path.join(OUT, "timeline.json"), "w"))

    # ---- ASS
    def ts(x):
        h = int(x // 3600); m = int(x % 3600 // 60); s_ = x % 60
        return f"{h}:{m:02d}:{s_:05.2f}"
    ass = ["[Script Info]", "ScriptType: v4.00+", "PlayResX: 1080", "PlayResY: 1920", "WrapStyle: 0", "",
           "[V4+ Styles]",
           "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
           "Style: Sub,Inter,58,&H00FFFFFF,&H00FFFFFF,&H80000000,&H00000000,1,0,0,0,100,100,0,0,1,2.2,1.5,8,90,90,170,1",
           "Style: Date,Inter Display,84,&H00FFFFFF,&H00FFFFFF,&H90000000,&H00000000,1,0,0,0,100,100,2,0,1,2.5,2,2,60,60,330,1",
           "Style: Title,Inter Display,104,&H00FFFFFF,&H00FFFFFF,&H90000000,&H00000000,1,0,0,0,100,100,3,0,1,3,3,5,60,60,0,1",
           "", "[Events]", "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]
    for sb in subs:
        ass.append(f"Dialogue: 0,{ts(sb['start'])},{ts(sb['end'] + 0.15)},Sub,,0,0,0,,{sb['en']}")
    for d in dates:
        ass.append(f"Dialogue: 1,{ts(d['start'])},{ts(d['end'])},Date,,0,0,0,,{{\\fad(350,450)}}{d['fr']}\\N{{\\fs50\\c&HDDDDDD&\\b0}}{d['en']}")
    for d in titles:
        ass.append(f"Dialogue: 1,{ts(d['start'])},{ts(d['end'])},Title,,0,0,0,,{{\\fad(300,500)\\c&H7797D9&}}{d['fr']}\\N{{\\fs60\\c&HFFFFFF&\\b0}}{d['en']}")
    open(os.path.join(OUT, "subs.ass"), "w").write("\n".join(ass) + "\n")
    print("duration", round(T, 2))
    for s_ in scenes: print(f"  {s_['id']:10s} {s_['start']:7.2f} {s_['end']:7.2f}  ({s_['end']-s_['start']:.1f}s)")
    print("cues", {k: round(v, 2) for k, v in cues.items()})

asyncio.run(main())
