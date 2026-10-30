# Tạo ảnh chia sẻ 1200 × 630 (JPG) cho Facebook, Zalo từ ảnh đầu tiên của mỗi dự án và ảnh hero trang chủ.
# Chạy lại mỗi khi thay ảnh dự án:  python scripts/anh-chia-se.py   (cần Pillow: pip install pillow)
# Ảnh ra ở public/images/chia-se/<slug>.jpg và trang-chu.jpg, đường dẫn khai báo trong src/lib/seo-pages.ts.
import json
from pathlib import Path

from PIL import Image

GOC = Path(__file__).resolve().parent.parent
ANH = GOC / 'public'
RA = ANH / 'images' / 'chia-se'
W, H = 1200, 630


def cat_vua(nguon: Path, dich: Path) -> None:
    """Cắt giữa theo tỉ lệ 1200:630 rồi thu về đúng cỡ."""
    with Image.open(nguon) as im:
        im = im.convert('RGB')
        ti_le = W / H
        if im.width / im.height > ti_le:
            rong = round(im.height * ti_le)
            x = (im.width - rong) // 2
            im = im.crop((x, 0, x + rong, im.height))
        else:
            cao = round(im.width / ti_le)
            y = (im.height - cao) // 2
            im = im.crop((0, y, im.width, y + cao))
        im.resize((W, H), Image.LANCZOS).save(dich, 'JPEG', quality=82, optimize=True, progressive=True)


RA.mkdir(parents=True, exist_ok=True)
du_lieu = json.loads((GOC / 'src' / 'data' / 'projects.json').read_text(encoding='utf-8'))
cat_vua(ANH / 'images' / 'hero.webp', RA / 'trang-chu.jpg')
for p in du_lieu['projects']:
    cat_vua(ANH / p['images'][0]['src'].lstrip('/'), RA / f"{p['slug']}.jpg")
print(f'Đã tạo {len(du_lieu["projects"]) + 1} ảnh chia sẻ trong {RA.relative_to(GOC)}')
