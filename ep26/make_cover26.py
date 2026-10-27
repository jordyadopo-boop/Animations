# Couverture de l'episode 26 : le trou blanc en grand (image du rendu 3D)
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'couvertures'); os.makedirs(OUT, exist_ok=True)
BOLD = '/usr/share/fonts/opentype/inter/InterDisplay-Black.otf'
if not os.path.exists(BOLD): BOLD = '/usr/share/fonts/opentype/inter/InterDisplay-Bold.otf'
MED = '/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'
ORANGE = (217, 119, 87)
bh = Image.open(os.path.join(HERE, 'cov/t1.50.jpg')).convert('RGB').resize((1080, 1920), Image.LANCZOS)
wh = Image.open(os.path.join(HERE, 'cov/t7.50.jpg')).convert('RGB').resize((1080, 1920), Image.LANCZOS)
# trou blanc en grand, en haut
im = wh.copy()
grad = Image.new('L', im.size, 0); gd = ImageDraw.Draw(grad)
for y in range(1920): gd.line([(0, y), (1080, y)], fill=int(235 * max(0, min(1, (y - 1000) / 260))))
im = Image.composite(Image.new('RGB', im.size, (4, 5, 12)), im, grad)
d = ImageDraw.Draw(im)
f = ImageFont.truetype(BOLD, 112); lines = ['LES TROUS BLANCS', 'EXISTENT-ILS ?']
fb = ImageFont.truetype(BOLD, 52); lab = 'ÉPISODE 26'; tw = d.textlength(lab, font=fb)
y0 = 1180
d.rounded_rectangle([(540 - tw / 2 - 34, y0), (540 + tw / 2 + 34, y0 + 92)], radius=46, fill=ORANGE)
d.text((540, y0 + 46), lab, font=fb, fill='white', anchor='mm')
y = y0 + 135; lh = 128
for i, ln in enumerate(lines): d.text((540, y + i * lh), ln, font=f if i else ImageFont.truetype(BOLD, 100), fill='white', anchor='ma', stroke_width=5, stroke_fill=(5, 5, 12))
yb = y + len(lines) * lh + 26
d.rectangle([(450, yb), (630, yb + 10)], fill=ORANGE)
d.text((540, yb + 40), 'Do white holes exist?', font=ImageFont.truetype(MED, 50), fill=(225, 232, 245), anchor='ma', stroke_width=3, stroke_fill=(5, 5, 12))
im.save(os.path.join(OUT, 'couverture_ep26.jpg'), quality=93)
print('ok')
