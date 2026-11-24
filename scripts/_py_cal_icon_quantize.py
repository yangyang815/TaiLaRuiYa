# 灾厄物品图标量化辅助（被 scripts/build-cal-item-icons.js 调用）
# 用法：python _py_cal_icon_quantize.py <raw临时目录> <输出目录>
# raw 文件名形如 <id>.raw.png；输出 <id>.png（RGBA→256色量化，最长边≤120px）
import os
import sys
import json
from PIL import Image

tmp_dir = sys.argv[1]
out_dir = sys.argv[2]
os.makedirs(out_dir, exist_ok=True)

manifest = {}
for f in os.listdir(tmp_dir):
    if not f.endswith(".raw.png"):
        continue
    iid = f[:-8]
    try:
        im = Image.open(os.path.join(tmp_dir, f)).convert("RGBA")
        if max(im.width, im.height) > 120:
            scale = 120 / max(im.width, im.height)
            im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
        q = im.quantize(colors=256, method=Image.FASTOCTREE)
        q.save(os.path.join(out_dir, iid + ".png"), optimize=True)
        manifest[iid] = "/pkg-cal/assets/item/" + iid + ".png"
    except Exception as e:
        print("skip", iid, e)

print(json.dumps({"count": len(manifest)}))
