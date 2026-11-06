import sys,glob
from PIL import Image, ImageDraw
fs=sorted(glob.glob(sys.argv[1]+'/*.jpg'), key=lambda f: float(f.split('/t')[-1][:-4]))
cols=6; w,h=240,427
rows=(len(fs)+cols-1)//cols
S=Image.new('RGB',(cols*w,rows*h))
for i,f in enumerate(fs):
    im=Image.open(f).resize((w,h)); d=ImageDraw.Draw(im); d.text((5,5),f.split('/t')[-1][:-4],fill=(255,255,0))
    S.paste(im,((i%cols)*w,(i//cols)*h))
S.save(sys.argv[2])
