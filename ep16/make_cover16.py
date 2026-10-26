# Couverture de l'episode 16 : le vrai visage du Cri en grand
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import os
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'couvertures'); os.makedirs(OUT, exist_ok=True)
BOLD = '/usr/share/fonts/opentype/inter/InterDisplay-Black.otf'
if not os.path.exists(BOLD): BOLD = '/usr/share/fonts/opentype/inter/InterDisplay-Bold.otf'
MED = '/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'
ORANGE = (217, 119, 87)
src = Image.open(os.path.join(HERE, 'assets/cri.jpg')).convert('RGB')
# cadrage : visage et mains dans le tiers haut
ch = 980; cw = int(ch * 1080 / 1920); cx, fy = 690, 874
y0 = fy - int(ch * 0.30); x0 = cx - cw // 2
im = src.crop((x0, y0, x0 + cw, y0 + ch)).resize((1080, 1920), Image.LANCZOS)
im = ImageEnhance.Contrast(im).enhance(1.12)
grad = Image.new('L', im.size, 0); gd = ImageDraw.Draw(grad)
for y in range(1920):
    gd.line([(0, y), (1080, y)], fill=int(200 * max(0, min(1, (y - 820) / 260)) ** 0.8))
im = Image.composite(Image.new('RGB', im.size, (10, 8, 14)), im, grad)
d = ImageDraw.Draw(im)
f = ImageFont.truetype(BOLD, 170); lines = ['IL NE', 'CRIE PAS']
fb = ImageFont.truetype(BOLD, 52); lab = 'ÉPISODE 16'; tw = d.textlength(lab, font=fb)
y0 = 1040
d.rounded_rectangle([(540 - tw / 2 - 34, y0), (540 + tw / 2 + 34, y0 + 92)], radius=46, fill=ORANGE)
d.text((540, y0 + 46), lab, font=fb, fill='white', anchor='mm')
y = y0 + 140; lh = 180
sh = Image.new('RGBA', im.size, (0, 0, 0, 0)); sd = ImageDraw.Draw(sh)
for i, ln in enumerate(lines): sd.text((540, y + i * lh), ln, font=f, fill=(0, 0, 0, 230), anchor='ma')
sh = sh.filter(ImageFilter.GaussianBlur(14)); im.paste(sh, (0, 8), sh); d = ImageDraw.Draw(im)
for i, ln in enumerate(lines): d.text((540, y + i * lh), ln, font=f, fill='white', anchor='ma', stroke_width=5, stroke_fill=(10, 10, 20))
yb = y + len(lines) * lh + 30
d.rectangle([(450, yb), (630, yb + 10)], fill=ORANGE)
d.text((540, yb + 42), 'He is not screaming', font=ImageFont.truetype(MED, 58), fill=(225, 230, 240), anchor='ma', stroke_width=3, stroke_fill=(10, 10, 20))
im.save(os.path.join(OUT, 'couverture_ep16.jpg'), quality=93)
print('ok')
