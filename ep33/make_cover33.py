# Couverture de l'episode 33 : le vrai tableau, le regard de l'ange en grand
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'couvertures'); os.makedirs(OUT, exist_ok=True)
BOLD = '/usr/share/fonts/opentype/inter/InterDisplay-Black.otf'
if not os.path.exists(BOLD): BOLD = '/usr/share/fonts/opentype/inter/InterDisplay-Bold.otf'
MED = '/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'
ORANGE = (217, 119, 87)
src = Image.open(os.path.join(HERE, 'assets/ange.jpg')).convert('RGB'); W, H = src.size
# cadrage vertical centre sur le visage (u = 0.35, v = 0.33)
ch = int(H * 0.62); cw = int(ch * 9 / 16); cx, cy = int(W * 0.35), int(H * 0.40)
im = src.crop((cx - cw // 2, cy - ch // 2, cx + cw // 2, cy + ch // 2)).resize((1080, 1920), Image.LANCZOS)
grad = Image.new('L', im.size, 0); gd = ImageDraw.Draw(grad)
for y in range(1920): gd.line([(0, y), (1080, y)], fill=int(225 * max(0, min(1, (y - 1080) / 300))))
im = Image.composite(Image.new('RGB', im.size, (14, 8, 6)), im, grad)
d = ImageDraw.Draw(im)
f = ImageFont.truetype(BOLD, 120); lines = ['CET ANGE', 'PLEURE DE RAGE']
fb = ImageFont.truetype(BOLD, 52); lab = 'ÉPISODE 33'; tw = d.textlength(lab, font=fb)
y0 = 1300
d.rounded_rectangle([(540 - tw / 2 - 34, y0), (540 + tw / 2 + 34, y0 + 92)], radius=46, fill=ORANGE)
d.text((540, y0 + 46), lab, font=fb, fill='white', anchor='mm')
y = y0 + 135; lh = 140
for i, ln in enumerate(lines):
    ff = f if d.textlength(ln, font=f) < 1000 else ImageFont.truetype(BOLD, int(120 * 1000 / d.textlength(ln, font=f)))
    d.text((540, y + i * lh), ln, font=ff, fill='white', anchor='ma', stroke_width=5, stroke_fill=(10, 6, 4))
yb = y + len(lines) * lh + 20
d.rectangle([(450, yb), (630, yb + 10)], fill=ORANGE)
d.text((540, yb + 36), 'This angel is crying with rage', font=ImageFont.truetype(MED, 46), fill=(235, 228, 215), anchor='ma', stroke_width=3, stroke_fill=(10, 6, 4))
d.text((540, 1885), 'Alexandre Cabanel, « L\'Ange déchu », 1847', font=ImageFont.truetype(MED, 30), fill=(200, 190, 175), anchor='ma')
im.save(os.path.join(OUT, 'couverture_ep33.jpg'), quality=93)
print('ok')
