"""Extrait les images des extraits de gameplay (clips.json) à 30 i/s, 1920x1080, dans out/odyssee/frames/<nom>/0001.jpg…
La durée de chaque extrait vient de timeline.json. Usage : python3 pub/odyssee/tools/frames.py [dossier media de games-02]"""
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT = os.path.dirname(os.path.dirname(HERE))
MEDIA = sys.argv[1] if len(sys.argv) > 1 else '/home/user/games-02/media'
clips = json.load(open(os.path.join(HERE, 'clips.json'), encoding='utf8'))
tl = json.load(open(os.path.join(HERE, 'timeline.json'), encoding='utf8'))
need = {}
for sc in tl['scenes']:
    if sc['id'] in clips: need[sc['id']] = sc['end'] - sc['start']
    for i, li in enumerate(sc['lines']):
        c = li.get('clip')
        if c in clips:
            nxt = sc['lines'][i + 1]['start'] if i + 1 < len(sc['lines']) else sc['end']
            need[c] = nxt - li['start']
out = {}
for name, dur in need.items():
    d = os.path.join(ROOT, 'out', 'odyssee', 'frames', name); os.makedirs(d, exist_ok=True)
    for f in os.listdir(d): os.remove(os.path.join(d, f))
    c = clips[name]; dur += 1.0
    subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(c['from']), '-t', f'{dur:.2f}', '-i', os.path.join(MEDIA, c['src']),
                    '-vf', 'fps=30,scale=1920:1080', '-q:v', '3', os.path.join(d, '%04d.jpg')], check=True)
    out[name] = len(os.listdir(d)); print(name, f'{dur:.1f}s', out[name], 'images')
json.dump(out, open(os.path.join(ROOT, 'out', 'odyssee', 'frames', 'counts.json'), 'w'))
