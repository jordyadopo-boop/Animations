# Couverture de l'episode 19 : la Terre en bas a gauche, le systeme solaire au fond en haut a droite,
# le titre en diagonale entre les deux, de plus en plus petit vers le Soleil (l'eloignement)
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'couvertures'); os.makedirs(OUT, exist_ok=True)
BOLD = '/usr/share/fonts/opentype/inter/InterDisplay-Black.otf'
if not os.path.exists(BOLD): BOLD = '/usr/share/fonts/opentype/inter/InterDisplay-Bold.otf'
MED = '/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'
ORANGE = (217, 119, 87)
im = Image.open(os.path.join(HERE, 'cov/t1000.00.jpg')).convert('RGB').resize((1080, 1920), Image.LANCZOS)
d = ImageDraw.Draw(im)
# ligne pointillee Terre -> Soleil
E, Sn = (330, 1380), (935, 245)
for k in range(0, 60):
    if k % 2: continue
    a, b = k / 60, (k + 1) / 60
    d.line([(E[0] + (Sn[0] - E[0]) * a, E[1] + (Sn[1] - E[1]) * a), (E[0] + (Sn[0] - E[0]) * b, E[1] + (Sn[1] - E[1]) * b)], fill=(120, 200, 255), width=4)
lines = [("ET SI", 70, (780, 560)), ("LA TERRE", 110, (640, 790)), ("S'ARRÊTAIT ?", 138, (540, 1040))]
sh = Image.new('RGBA', im.size, (0, 0, 0, 0)); sd = ImageDraw.Draw(sh)
for tx, sz, (x, y) in lines: sd.text((x, y), tx, font=ImageFont.truetype(BOLD, sz), fill=(0, 0, 0, 240), anchor='mm')
sh = sh.filter(ImageFilter.GaussianBlur(16)); im.paste(sh, (0, 8), sh); d = ImageDraw.Draw(im)
for tx, sz, (x, y) in lines: d.text((x, y), tx, font=ImageFont.truetype(BOLD, sz), fill='white', anchor='mm', stroke_width=max(3, sz // 30), stroke_fill=(10, 10, 20))
fb = ImageFont.truetype(BOLD, 52); lab = 'ÉPISODE 19'; tw = d.textlength(lab, font=fb)
bx, by = 540, 1175
d.rounded_rectangle([(bx - tw / 2 - 34, by - 46), (bx + tw / 2 + 34, by + 46)], radius=46, fill=ORANGE)
d.text((bx, by), lab, font=fb, fill='white', anchor='mm')
d.text((540, 1262), 'What if the Earth stopped?', font=ImageFont.truetype(MED, 52), fill=(225, 230, 240), anchor='mm', stroke_width=3, stroke_fill=(10, 10, 20))
im.save(os.path.join(OUT, 'couverture_ep19.jpg'), quality=93)
print('ok')
