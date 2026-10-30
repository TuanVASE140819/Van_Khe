// Sinh HTML tĩnh cho từng đường dẫn sau khi build (PB-6): dist/du-an/<slug>/index.html… có sẵn tiêu đề, mô tả, ảnh chia sẻ,
// dữ liệu có cấu trúc của trang đó, để Facebook, Zalo, Google đọc được khi chưa chạy JavaScript. Ứng dụng vẫn chạy như cũ.
// Nội dung thẻ lấy từ src/lib/seo-pages.ts (vite build --ssr đã dịch ra .seo-build/seo-pages.js).
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'

const dist = new URL('../dist/', import.meta.url)
const buildSeo = new URL('../.seo-build/', import.meta.url)
const { allPages, renderHead, seoNotFound } = await import(new URL('seo-pages.js', buildSeo).href)

const goc = readFileSync(new URL('index.html', dist), 'utf8')
// Ghi cả du-an/<slug>.html (máy chủ tìm theo đuôi .html khi đường dẫn không có dấu / cuối: Vite preview, Netlify, Vercel,
// Cloudflare Pages, GitHub Pages) lẫn du-an/<slug>/index.html (máy chủ chỉ tìm index.html trong thư mục)
const viet = (path, html) => {
  const files = path === '/' ? ['index.html'] : [`${path.slice(1)}.html`, `${path.slice(1)}/index.html`]
  for (const f of files) {
    const file = new URL(f, dist)
    mkdirSync(new URL('.', file), { recursive: true })
    writeFileSync(file, html)
  }
}

const pages = allPages()
for (const page of pages) viet(page.path, renderHead(goc, page))
// Máy chủ tĩnh (GitHub Pages, Cloudflare Pages, Netlify) trả 404.html cho đường dẫn lạ: ứng dụng tự hiện trang "Không tìm thấy"
writeFileSync(new URL('404.html', dist), renderHead(goc, seoNotFound()))

for (const img of new Set(pages.map((p) => p.image))) {
  if (!existsSync(new URL(img.slice(1), dist))) throw new Error(`Thiếu ảnh chia sẻ ${img}: chạy python scripts/anh-chia-se.py`)
}
rmSync(buildSeo, { recursive: true, force: true, maxRetries: 5 })
console.log(`HTML tĩnh: ${pages.length} trang + 404.html`)
