"""Voix off de la pub Odyssée : script.json -> out/odyssee/vo.wav + pub/odyssee/timeline.json.

Chaque ligne est dite par edge-tts (voix neuronale), avec le minutage de chaque mot.
Les scènes s'enchaînent d'après la durée réelle de la voix.
Usage : python3 -I pub/odyssee/tools/tts.py
"""
import asyncio, json, os, subprocess, sys
import numpy as np
import edge_tts

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # pub/odyssee
ROOT = os.path.dirname(os.path.dirname(HERE))
OUT = os.path.join(ROOT, 'out', 'odyssee', 'vo')
os.makedirs(OUT, exist_ok=True)
SR = 44100
script = json.load(open(os.path.join(HERE, 'script.json'), encoding='utf8'))


async def say(text, path):
    words = []
    if os.path.exists(path + '.json') and os.path.exists(path):
        cached = json.load(open(path + '.json', encoding='utf8'))
        if cached.get('text') == text and cached.get('voice') == script['voice'] + script['rate']:
            return cached['words']
    com = edge_tts.Communicate(text, script['voice'], rate=script['rate'], boundary='WordBoundary')
    with open(path, 'wb') as f:
        async for ch in com.stream():
            if ch['type'] == 'audio':
                f.write(ch['data'])
            elif ch['type'] == 'WordBoundary':
                words.append({'w': ch['text'], 's': ch['offset'] / 1e7, 'e': (ch['offset'] + ch['duration']) / 1e7})
    json.dump({'text': text, 'voice': script['voice'] + script['rate'], 'words': words}, open(path + '.json', 'w', encoding='utf8'), ensure_ascii=False)
    return words


def decode(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


async def main():
    t = 0.0
    timeline = {'scenes': []}
    clips = []
    n = 0
    for sc in script['scenes']:
        start = t
        cur = start + sc.get('lead', 0.15)
        lines = []
        for li in sc['vo']:
            li = li if isinstance(li, dict) else {'t': li}
            path = os.path.join(OUT, f'{n:02d}.mp3'); n += 1
            words = await say(li['t'], path)
            s0, s1 = words[0]['s'], words[-1]['e']
            off = cur - s0  # décalage pour que la parole commence à cur
            clips.append((off, path))
            lines.append({**li, 'start': round(cur, 3), 'end': round(off + s1, 3),
                          'words': [{'w': w['w'], 's': round(off + w['s'], 3), 'e': round(off + w['e'], 3)} for w in words]})
            cur = off + s1 + sc.get('gap', 0.3)
        end = max(lines[-1]['end'] + sc.get('pad', 0.4), start + sc.get('min', 0))
        timeline['scenes'].append({'id': sc['id'], 'start': round(start, 3), 'end': round(end, 3), 'lines': lines})
        t = end
    timeline['duration'] = round(t, 3)
    vo = np.zeros(int((t + 1) * SR), dtype=np.float32)
    for off, path in clips:
        a = decode(path); i = int(round(off * SR))
        if i < 0: a, i = a[-i:], 0
        vo[i:i + len(a)] += a[:len(vo) - i]
    pcm = (np.clip(vo, -1, 1) * 32767).astype('<i2').tobytes()
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', '-', os.path.join(ROOT, 'out', 'odyssee', 'vo.wav')], input=pcm, check=True)
    json.dump(timeline, open(os.path.join(HERE, 'timeline.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
    for s in timeline['scenes']:
        print(f"{s['id']:9s} {s['start']:7.2f} -> {s['end']:7.2f}  ({s['end'] - s['start']:.1f} s)")
    print('durée totale', timeline['duration'])

asyncio.run(main())
