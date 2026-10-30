import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { projects } from '../data/catalog'
import { allPages, fullTitle, headTags, renderHead, seoNotFound, seoProject } from './seo-pages'

const indexHtml = readFileSync(new URL('../../index.html', import.meta.url), 'utf8')

describe('thẻ chia sẻ từng trang (PB-6)', () => {
  it('mỗi trang có đường dẫn riêng, tiêu đề riêng, ảnh chia sẻ JPG đường dẫn tuyệt đối', () => {
    const pages = allPages()
    expect(new Set(pages.map((p) => p.path)).size).toBe(pages.length)
    expect(new Set(pages.map((p) => fullTitle(p.title))).size).toBe(pages.length)
    for (const p of pages) {
      expect(p.image).toMatch(/^\/images\/chia-se\/[a-z-]+\.jpg$/)
      expect(headTags(p)).toMatch(/og:image" content="https?:\/\/[^"]+\.jpg"/)
      // Facebook, Zalo cắt mô tả dài; Google hiện khoảng 160 ký tự
      expect(p.description.length).toBeLessThanOrEqual(200)
    }
    expect(pages.filter((p) => p.path.startsWith('/du-an/'))).toHaveLength(projects.length)
  })

  it('trang dự án có ảnh, giá và dữ liệu có cấu trúc của đúng dự án', () => {
    const p = projects.find((x) => x.priceFrom !== null)!
    const seo = seoProject(p)
    expect(seo.image).toBe(`/images/chia-se/${p.slug}.jpg`)
    expect(seo.description).toContain('Giá từ')
    const html = headTags(seo)
    expect(html).toContain(`<link rel="canonical" href="https://vankhe.example/du-an/${p.slug}" />`)
    expect(html).toContain('"@type":"GeoCoordinates"')
  })

  it('thay đúng khối thẻ trong index.html, giữ nguyên phần còn lại', () => {
    const seo = seoProject(projects[0])
    const html = renderHead(indexHtml, seo)
    expect(html.match(/<title>/g)).toHaveLength(1)
    expect(html.match(/property="og:image"/g)).toHaveLength(1)
    expect(html).toContain(`<title>${fullTitle(seo.title)}</title>`)
    expect(html).toContain('<div id="app"></div>')
    expect(html).toContain('og:site_name')
    // chạy lại trên kết quả vẫn cho đúng một bộ thẻ
    expect(renderHead(html, seo)).toBe(html)
  })

  it('trang 404 không cho lập chỉ mục, không có canonical', () => {
    const html = headTags(seoNotFound())
    expect(html).toContain('<meta name="robots" content="noindex" />')
    expect(html).not.toContain('canonical')
  })

  it('chữ đặc biệt trong mô tả không làm vỡ thẻ HTML', () => {
    const html = headTags({ ...seoNotFound(), description: 'Giá "tốt" <nhất> & rẻ' })
    expect(html).toContain('content="Giá &quot;tốt&quot; &lt;nhất&gt; &amp; rẻ"')
  })
})
