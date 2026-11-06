"""Extrait les images des extraits de gameplay (clips.json) à 30 i/s, 1920x1080, dans out/odyssee/frames/<nom>/0001.jpg…
La durée de chaque extrait vient de timeline.json. Usage : python3 pub/odyssee/tools/frames.py [dossier media de games-02]"""
import json, os, shutil, subprocess, sys
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT = os.path.dirname(os.path.dirname(HERE))
MEDIA = sys.argv[1] if len(sys.argv) > 1 else '/home/user/games-02/media'
clips = json.load(open(os.path.join(HERE, 'clips.json'), encoding='utf8'))
tl = json.load(open(os.path.join(HERE, 'timeline.json'), encoding='utf8'))
need = {}
for sc in tl['scenes']:
    c = sc.get('clip', sc['id'])
    if c in clips: need[c] = sc['end'] - sc['start']
    for i, li in enumerate(sc['lines']):
        c = li.get('clip')
        if c in clips:
            nxt = sc['lines'][i + 1]['start'] if i + 1 < len(sc['lines']) else sc['end']
            need[c] = nxt - li['start']
out = {}
for name, dur in need.items():
    d = os.path.join(ROOT, 'out', 'odyssee', 'frames', name); shutil.rmtree(d, ignore_errors=True); os.makedirs(d)
    c = clips[name]; src = c['src']
    src = os.path.join(ROOT, src[1:]) if src.startswith('@') else os.path.join(MEDIA, src)
    segs = c.get('seg') or [[c['from'], dur + 1.0]]
    n = 0
    for k, (a, l) in enumerate(segs):
        tmp = os.path.join(d, f'seg{k}'); os.makedirs(tmp)
        subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(a), '-t', f'{l:.2f}', '-i', src, '-vf', 'fps=30,scale=1920:1080', '-q:v', '3', os.path.join(tmp, '%04d.jpg')], check=True)
        for f in sorted(os.listdir(tmp)): n += 1; os.rename(os.path.join(tmp, f), os.path.join(d, f'{n:04d}.jpg'))
        os.rmdir(tmp)
    out[name] = n; print(f'{name:7s} besoin {dur:5.1f}s  -> {n / 30:5.1f}s ({n} images)')
json.dump(out, open(os.path.join(ROOT, 'out', 'odyssee', 'frames', 'counts.json'), 'w'))
