"""Tile frames into a contact sheet: python3 tools/sheet.py out.jpg a.jpg b.jpg ... (2 columns, 960x540 cells, labelled)."""
import sys
from PIL import Image, ImageDraw
out, files = sys.argv[1], sys.argv[2:]
W, H, cols = 960, 540, 2
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (W * cols, H * rows), 'black')
d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB').resize((W, H))
    x, y = (i % cols) * W, (i // cols) * H
    sheet.paste(im, (x, y))
    d.rectangle([x, y, x + 260, y + 28], fill='black'); d.text((x + 6, y + 6), f.split('/')[-1], fill='yellow')
sheet.save(out, quality=88)
