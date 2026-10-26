from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
OUT = '/home/user/couvertures'; os.makedirs(OUT, exist_ok=True)
SP = os.path.dirname(os.path.abspath(__file__))
BOLD = '/usr/share/fonts/opentype/inter/InterDisplay-Black.otf'
if not os.path.exists(BOLD): BOLD = '/usr/share/fonts/opentype/inter/InterDisplay-Bold.otf'
MED = '/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'
ORANGE = (217, 119, 87)
EPS = [
    (1, 'covers_raw/ep1.png', 'LA SOLITUDE', 'Loneliness'),
    (2, 'covers_raw/ep2.png', 'LA MOISISSURE QUI A SAUVÉ LE MONDE', 'The mould that saved the world'),
    (3, 'covers_raw/ep3.png', 'TOMBER DANS UN TROU NOIR', 'Falling into a black hole'),
    (4, 'covers_raw/ep4.png', 'LE TEMPS N\'EST PAS LE MÊME PARTOUT', 'Time is not the same everywhere'),
    (5, 'covers_raw/ep5.png', 'LE TEMPLE PLUS VIEUX QUE L\'AGRICULTURE', 'The temple older than farming'),
    (6, '../ep6/cov6/t0.95.jpg', 'LE DÉLUGE AVANT LA BIBLE', 'The Flood before the Bible'),
    (7, 'cov7/t8.00.jpg', 'LES STATUES QUI MARCHAIENT', 'The walking statues'),
    (8, '../ep8s/cov/t9.00.jpg', 'ENTRE DEUX MONDES', 'Between two worlds'),
    (9, '../ep9/cov/t9.40.jpg', 'L\'ORDINATEUR DE 2 000 ANS', 'The 2,000-year-old computer'),
    (10, '../ep10/cov/t9.60.jpg', 'LE SIGNAL WOW!', 'The Wow! signal'),
    (11, '../ep11/cov/t5.00.jpg', 'L\'ENFANT DE TAUNG', 'The Taung Child'),
    (12, '../ep12/cov/t9.50.jpg', 'SAINTE JOSÉPHINE BAKHITA', 'Saint Josephine Bakhita'),
    (13, '../ep13/cov/t2.00.jpg', 'DEVENIR RICHE GRÂCE À L\'IA ?', 'Getting rich with AI?'),
    (14, '../ep14/cov/t55.00.jpg', 'ET SI DEMAIN N\'ARRIVAIT PAS ?', 'What if tomorrow never came?'),
    (15, '../ep15/cov/t0.70.jpg', 'POURQUOI ON DÉTESTE LE LUNDI ?', 'Why do we hate Mondays?'),
]
def wrap(d, text, font, maxw):
    words, lines, cur = text.split(), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=font) <= maxw: cur = t
        else: lines.append(cur); cur = w
    lines.append(cur); return lines
for n, src, fr, en in EPS:
    im = Image.open(os.path.join(SP, src)).convert('RGB').resize((1080, 1920), Image.LANCZOS)
    # degrade sombre derriere le titre
    grad = Image.new('L', (1080, 1920), 0); gd = ImageDraw.Draw(grad)
    for y in range(1920):
        a = int(170 * max(0, 1 - abs(y - 960) / 520) ** 0.7)
        gd.line([(0, y), (1080, y)], fill=a)
    im = Image.composite(Image.new('RGB', im.size, (8, 8, 16)), im, grad)
    d = ImageDraw.Draw(im)
    size = 150
    while True:
        f = ImageFont.truetype(BOLD, size)
        lines = wrap(d, fr, f, 960)
        if (len(lines) <= 4 and max(d.textlength(l, font=f) for l in lines) <= 960) or size < 90: break
        size -= 8
    # badge episode
    fb = ImageFont.truetype(BOLD, 52)
    lab = f'ÉPISODE {n}'; tw = d.textlength(lab, font=fb)
    lh = int(size * 1.08)
    block = 92 + 58 + len(lines) * lh + 30 + 10 + 42 + 60
    y0 = int(960 - block / 2)
    d.rounded_rectangle([(540 - tw / 2 - 34, y0), (540 + tw / 2 + 34, y0 + 92)], radius=46, fill=ORANGE)
    d.text((540, y0 + 46), lab, font=fb, fill='white', anchor='mm')
    # titre
    y = y0 + 150; lh = int(size * 1.08)
    shadow = Image.new('RGBA', im.size, (0, 0, 0, 0)); sd = ImageDraw.Draw(shadow)
    for i, ln in enumerate(lines): sd.text((540, y + i * lh), ln, font=f, fill=(0, 0, 0, 230), anchor='ma')
    shadow = shadow.filter(ImageFilter.GaussianBlur(14))
    im.paste(shadow, (0, 8), shadow)
    d = ImageDraw.Draw(im)
    for i, ln in enumerate(lines):
        d.text((540, y + i * lh), ln, font=f, fill='white', anchor='ma', stroke_width=5, stroke_fill=(10, 10, 20))
    yb = y + len(lines) * lh + 30
    d.rectangle([(540 - 90, yb), (540 + 90, yb + 10)], fill=ORANGE)
    fe = ImageFont.truetype(MED, 54)
    d.text((540, yb + 42), en, font=fe, fill=(225, 230, 240), anchor='ma', stroke_width=3, stroke_fill=(10, 10, 20))
    im.save(f'{OUT}/couverture_ep{n}.jpg', quality=93)
print('ok')
