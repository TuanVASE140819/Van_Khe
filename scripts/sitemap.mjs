// Sinh dist/sitemap.xml và dist/robots.txt từ dữ liệu dự án. SITE_URL lấy từ biến môi trường VITE_SITE_URL.
import { readFileSync, writeFileSync } from 'node:fs'

const site = (process.env.VITE_SITE_URL ?? 'https://vankhe.example').replace(/\/$/, '')
const { projects } = JSON.parse(readFileSync(new URL('../src/data/projects.json', import.meta.url), 'utf8'))
const paths = ['/', '/du-an', '/dang-ky-tu-van', ...projects.map((p) => `/du-an/${p.slug}`)]
const today = new Date().toISOString().slice(0, 10)
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((path) => `  <url><loc>${site}${path}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`
writeFileSync(new URL('../dist/sitemap.xml', import.meta.url), xml)
writeFileSync(new URL('../dist/robots.txt', import.meta.url), `User-agent: *\nAllow: /\nSitemap: ${site}/sitemap.xml\n`)
console.log(`sitemap.xml: ${paths.length} đường dẫn`)
