import sys, subprocess, numpy as np
from faster_whisper import WhisperModel
m = WhisperModel('small', device='cpu', compute_type='int8')
def load(p):
    raw = subprocess.run(["ffmpeg","-v","quiet","-i",p,"-f","f32le","-ac","1","-ar","16000","-"],capture_output=True).stdout
    return np.frombuffer(raw, np.float32).copy()
for p in sys.argv[1:]:
    segs, info = m.transcribe(load(p), beam_size=1)
    print(f"{info.language} {info.language_probability:.2f} | {' '.join(s.text for s in segs).strip()}", flush=True)
