# Couverture de l'episode 18 : la vraie Joconde a gauche, le cadre vide a droite
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import os
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'couvertures'); os.makedirs(OUT, exist_ok=True)
BOLD = '/usr/share/fonts/opentype/inter/InterDisplay-Black.otf'
if not os.path.exists(BOLD): BOLD = '/usr/share/fonts/opentype/inter/InterDisplay-Bold.otf'
MED = '/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'
ORANGE = (217, 119, 87)
im = Image.new('RGB', (1080, 1920), (110, 26, 22))
d = ImageDraw.Draw(im)
for y in range(1920): d.line([(0, y), (1080, y)], fill=(int(120 - y * 0.03), int(28 - y * 0.006), int(24 - y * 0.005)))
src = Image.open(os.path.join(HERE, 'assets/joconde.jpg')).convert('RGB')
pw = 470; ph = int(pw * src.height / src.width)
p = src.resize((pw, ph), Image.LANCZOS)
fx, fy = 50, 150
d.rectangle([(fx - 26, fy - 26), (fx + pw + 26, fy + ph + 26)], fill=(150, 112, 40))
d.rectangle([(fx - 12, fy - 12), (fx + pw + 12, fy + ph + 12)], fill=(90, 64, 24))
im.paste(p, (fx, fy))
# cadre vide a droite
ex = 560
for k, c in [(26, (150, 112, 40)), (12, (90, 64, 24))]:
    d.rectangle([(ex - k, fy - k), (ex + pw + k, fy + ph + k)], outline=c, width=14)
d.rectangle([(ex, fy), (ex + pw, fy + ph)], outline=(240, 220, 200), width=4)
for x, y in [(ex + 120, fy + 120), (ex + pw - 120, fy + 120), (ex + 120, fy + ph - 120), (ex + pw - 120, fy + ph - 120)]:
    d.ellipse([(x - 10, y - 10), (x + 10, y + 10)], fill=(30, 30, 30))
f2 = ImageFont.truetype(BOLD, 200); d.text((ex + pw / 2, fy + ph / 2), '?', font=f2, fill=(255, 230, 200), anchor='mm')
grad = Image.new('L', im.size, 0); gd = ImageDraw.Draw(grad)
for y in range(1920): gd.line([(0, y), (1080, y)], fill=int(200 * max(0, min(1, (y - 760) / 260)) ** 0.8))
im = Image.composite(Image.new('RGB', im.size, (14, 8, 8)), im, grad)
d = ImageDraw.Draw(im)
f = ImageFont.truetype(BOLD, 128); lines = ['LE JOUR OÙ', 'LA JOCONDE', 'A DISPARU']
fb = ImageFont.truetype(BOLD, 52); lab = 'ÉPISODE 18'; tw = d.textlength(lab, font=fb)
y0 = 1000
d.rounded_rectangle([(540 - tw / 2 - 34, y0), (540 + tw / 2 + 34, y0 + 92)], radius=46, fill=ORANGE)
d.text((540, y0 + 46), lab, font=fb, fill='white', anchor='mm')
y = y0 + 130; lh = 140
sh = Image.new('RGBA', im.size, (0, 0, 0, 0)); sd = ImageDraw.Draw(sh)
for i, ln in enumerate(lines): sd.text((540, y + i * lh), ln, font=f, fill=(0, 0, 0, 230), anchor='ma')
sh = sh.filter(ImageFilter.GaussianBlur(14)); im.paste(sh, (0, 8), sh); d = ImageDraw.Draw(im)
for i, ln in enumerate(lines): d.text((540, y + i * lh), ln, font=f, fill='white', anchor='ma', stroke_width=5, stroke_fill=(10, 10, 20))
yb = y + len(lines) * lh + 30
d.rectangle([(450, yb), (630, yb + 10)], fill=ORANGE)
d.text((540, yb + 42), 'The day the Mona Lisa vanished', font=ImageFont.truetype(MED, 54), fill=(225, 230, 240), anchor='ma', stroke_width=3, stroke_fill=(10, 10, 20))
im.save(os.path.join(OUT, 'couverture_ep18.jpg'), quality=93)
print('ok')
