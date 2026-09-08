# 目录精灵图量化压缩（>1.5KB 的重编码，只保留更小的结果）
from PIL import Image
import os, io, sys

sprites = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'catalog-stage', 'sprites')
saved = 0
count = 0
total = 0
for root, dirs, files in os.walk(sprites):
    for f in files:
        p = os.path.join(root, f)
        sz = os.path.getsize(p)
        total += sz
        if sz < 1500:
            continue
        try:
            im = Image.open(p)
            im.load()
            w, h = im.size
            if max(w, h) > 128:
                scale = 128 / max(w, h)
                im = im.resize((max(1, int(w * scale)), max(1, int(h * scale))), Image.LANCZOS)
            if im.mode != 'RGBA':
                im = im.convert('RGBA')
            buf = io.BytesIO()
            im.quantize(128, method=Image.FASTOCTREE).save(buf, 'PNG', optimize=True)
            data = buf.getvalue()
            if len(data) < sz * 0.92:
                open(p, 'wb').write(data)
                saved += sz - len(data)
                count += 1
        except Exception as e:
            print('跳过', f, str(e)[:40])
print('量化 %d 张, 节省 %.1f KB / 目录总量 %.1f MB' % (count, saved / 1024, total / 1024 / 1024))
