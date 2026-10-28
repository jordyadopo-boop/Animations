# Couverture de l'episode 37 : le vase de bronze et les 72 lueurs qui s'echappent (image du rendu 3D)
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'couvertures'); os.makedirs(OUT, exist_ok=True)
BOLD = '/usr/share/fonts/opentype/inter/InterDisplay-Black.otf'
if not os.path.exists(BOLD): BOLD = '/usr/share/fonts/opentype/inter/InterDisplay-Bold.otf'
MED = '/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'
ORANGE = (217, 119, 87)
src = Image.open(os.path.join(HERE, 'cov/t1000.00.jpg')).convert('RGB')
s = 1960 / src.height; src = src.resize((int(src.width * s), 1960), Image.LANCZOS)
cx = int(src.width * 0.5); x0 = max(0, min(src.width - 1080, cx - 540))
im = src.crop((x0, 20, x0 + 1080, 1940))
# bande sombre au milieu pour le titre
grad = Image.new('L', im.size, 0); gd = ImageDraw.Draw(grad)
for y in range(1920):
    k = max(0.0, min(1.0, (y - 1180) / 260)); gd.line([(0, y), (1080, y)], fill=int(215 * min(1, k * 1.6)))
im = Image.composite(Image.new('RGB', im.size, (12, 8, 6)), im, grad)
d = ImageDraw.Draw(im)
f = ImageFont.truetype(BOLD, 100); lines = ['LE ROI QUI AVAIT', 'ENFERMÉ', '72 DÉMONS']
fb = ImageFont.truetype(BOLD, 52); lab = 'ÉPISODE 37'; tw = d.textlength(lab, font=fb)
y0 = 1250
d.rounded_rectangle([(540 - tw / 2 - 34, y0), (540 + tw / 2 + 34, y0 + 92)], radius=46, fill=ORANGE)
d.text((540, y0 + 46), lab, font=fb, fill='white', anchor='mm')
y = y0 + 135; lh = 124
sh = Image.new('RGBA', im.size, (0, 0, 0, 0)); sd = ImageDraw.Draw(sh)
for i, ln in enumerate(lines): sd.text((540, y + i * lh), ln, font=f, fill=(0, 0, 0, 230), anchor='ma')
sh = sh.filter(ImageFilter.GaussianBlur(14)); im.paste(sh, (0, 8), sh); d = ImageDraw.Draw(im)
for i, ln in enumerate(lines): d.text((540, y + i * lh), ln, font=f, fill='white', anchor='ma', stroke_width=5, stroke_fill=(10, 8, 6))
yb = y + len(lines) * lh + 26
d.rectangle([(450, yb), (630, yb + 10)], fill=ORANGE)
d.text((540, yb + 40), 'The king who locked up 72 demons', font=ImageFont.truetype(MED, 44), fill=(235, 228, 215), anchor='ma', stroke_width=3, stroke_fill=(10, 8, 6))
im.save(os.path.join(OUT, 'couverture_ep37.jpg'), quality=93)
print('ok')
