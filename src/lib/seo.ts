// Cập nhật thẻ <head> khi chuyển trang trong trình duyệt. Nội dung từng trang ở seo-pages.ts, dùng chung với bước build
// sinh HTML tĩnh (scripts/prerender.mjs), nên trang mở thẳng từ link chia sẻ và trang chuyển tới bằng JavaScript giống nhau.
import { absoluteUrl, fullTitle, SHARE_IMAGE, type Seo } from './seo-pages'

function meta(attr: 'name' | 'property', key: string, content: string | null): void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (content === null) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = content
}

export function setSeo(seo: Seo): void {
  const title = fullTitle(seo.title)
  const url = absoluteUrl(seo.path)
  document.title = title
  meta('name', 'description', seo.description)
  meta('name', 'robots', seo.noindex ? 'noindex' : null)
  meta('property', 'og:title', title)
  meta('property', 'og:description', seo.description)
  meta('property', 'og:url', url)
  meta('property', 'og:image', absoluteUrl(seo.image))
  meta('property', 'og:image:width', String(SHARE_IMAGE.width))
  meta('property', 'og:image:height', String(SHARE_IMAGE.height))
  meta('property', 'og:image:alt', seo.imageAlt)
  meta('name', 'twitter:card', 'summary_large_image')
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (seo.noindex) canonical?.remove()
  else {
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = url
  }
  document.getElementById('page-jsonld')?.remove()
  if (seo.jsonLd) {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = 'page-jsonld'
    script.textContent = JSON.stringify(seo.jsonLd)
    document.head.appendChild(script)
  }
}
