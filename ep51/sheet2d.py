import sys, glob
from PIL import Image, ImageDraw
fs = sorted(glob.glob(sys.argv[1] + '/t_*.png'), key=lambda f: float(f.split('t_')[-1][:-4]))
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 6; w, h = 270, 480
rows = (len(fs) + cols - 1) // cols
S = Image.new('RGB', (cols * w, rows * h), 'black')
for i, f in enumerate(fs):
    im = Image.open(f).convert('RGB').resize((w, h)); d = ImageDraw.Draw(im); d.text((6, 6), f.split('t_')[-1][:-4], fill=(255, 255, 0))
    S.paste(im, ((i % cols) * w, (i // cols) * h))
S.save(sys.argv[2], quality=90)
