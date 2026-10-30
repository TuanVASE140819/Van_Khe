import { cities, findProject, projects, TYPE_LABEL, type Project } from '@/data/catalog'
import { formatPrice } from './format'

// Tiêu đề, mô tả, ảnh chia sẻ và dữ liệu có cấu trúc của từng trang (PB-6). Không dùng DOM: trình duyệt dùng qua setSeo
// (seo.ts), còn bước build dùng để sinh HTML tĩnh cho từng đường dẫn (scripts/prerender.mjs), nhờ vậy Facebook, Zalo
// đọc được tiêu đề và ảnh riêng của từng dự án mà không cần chạy JavaScript.

export const SITE_URL = (import.meta.env.VITE_SITE_URL ?? 'https://vankhe.example').replace(/\/$/, '')
export const SITE_NAME = 'Vân Khê Land'
/** Ảnh chia sẻ 1200 × 630 (tỉ lệ Facebook, Zalo khuyên dùng), JPG; tạo bằng scripts/anh-chia-se.py. */
export const SHARE_IMAGE = { width: 1200, height: 630 }

export interface Seo {
  title: string
  description: string
  path: string
  /** Đường dẫn ảnh chia sẻ, tính từ gốc site */
  image: string
  imageAlt: string
  jsonLd?: Record<string, unknown> | null
  /** Trang không cho máy tìm kiếm lập chỉ mục (404) */
  noindex?: boolean
}

export const absoluteUrl = (path: string): string => (path.startsWith('http') ? path : `${SITE_URL}${path}`)
export const fullTitle = (title: string): string => (title.startsWith(SITE_NAME) ? title : `${title} | ${SITE_NAME}`)
export const shareImageOf = (name: string): string => `/images/chia-se/${name}.jpg`

const flagship = findProject('van-khe-riverside') ?? projects[0]
const HOME_IMAGE_ALT = 'Trung tâm TP.HCM nhìn từ bờ sông Sài Gòn lúc hoàng hôn'

export function seoHome(): Seo {
  return {
    title: `${SITE_NAME} | Căn hộ, nhà phố, biệt thự pháp lý rõ ràng`,
    description: `${flagship.name}: ${flagship.facts.scale} bên sông Sài Gòn, giá từ ${formatPrice(flagship.priceFrom)}. Căn hộ, nhà phố, biệt thự tại ${cities.join(', ')}.`,
    path: '/',
    image: shareImageOf('trang-chu'),
    imageAlt: HOME_IMAGE_ALT,
  }
}

export function seoProjects(): Seo {
  return {
    title: 'Dự án căn hộ, nhà phố, biệt thự',
    description: 'Lọc dự án theo khu vực, khoảng giá, loại hình và trạng thái mở bán.',
    path: '/du-an',
    image: shareImageOf('trang-chu'),
    imageAlt: HOME_IMAGE_ALT,
  }
}

export function seoConsult(): Seo {
  return {
    title: 'Đăng ký tư vấn và đặt lịch xem nhà',
    description: 'Để lại số điện thoại để nhận bảng giá, chính sách thanh toán và lịch xem nhà mẫu.',
    path: '/dang-ky-tu-van',
    image: shareImageOf(flagship.slug),
    imageAlt: flagship.images[0].alt,
  }
}

export function seoNotFound(): Seo {
  return {
    title: 'Không tìm thấy trang',
    description: 'Trang không tồn tại hoặc đã đổi địa chỉ.',
    path: '/404',
    image: shareImageOf('trang-chu'),
    imageAlt: HOME_IMAGE_ALT,
    noindex: true,
  }
}

export function seoProject(p: Project): Seo {
  return {
    title: `${p.name}: ${TYPE_LABEL[p.type].toLowerCase()} ${p.district}`,
    description: `${p.summary} ${p.priceFrom !== null ? `Giá từ ${formatPrice(p.priceFrom)}.` : 'Đăng ký để nhận bảng giá.'}`,
    path: `/du-an/${p.slug}`,
    image: shareImageOf(p.slug),
    imageAlt: p.images[0].alt,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': p.type === 'can-ho' ? 'ApartmentComplex' : 'Residence',
      name: p.name,
      description: p.summary,
      url: absoluteUrl(`/du-an/${p.slug}`),
      image: p.images.map((i) => absoluteUrl(i.src)),
      address: { '@type': 'PostalAddress', streetAddress: p.address, addressRegion: p.city, addressCountry: 'VN' },
      geo: { '@type': 'GeoCoordinates', latitude: p.lat, longitude: p.lng },
    },
  }
}

/** Mọi trang có đường dẫn cố định, để sinh HTML tĩnh khi build. */
export const allPages = (): Seo[] => [seoHome(), seoProjects(), seoConsult(), ...projects.map(seoProject)]

const escapeHtml = (s: string): string => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Các thẻ <head> của một trang (thay cho các thẻ mặc định trong index.html). */
export function headTags(seo: Seo): string {
  const title = escapeHtml(fullTitle(seo.title))
  const description = escapeHtml(seo.description)
  const tags = [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    seo.noindex ? '<meta name="robots" content="noindex" />' : `<link rel="canonical" href="${absoluteUrl(seo.path)}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${absoluteUrl(seo.path)}" />`,
    `<meta property="og:image" content="${absoluteUrl(seo.image)}" />`,
    `<meta property="og:image:width" content="${SHARE_IMAGE.width}" />`,
    `<meta property="og:image:height" content="${SHARE_IMAGE.height}" />`,
    `<meta property="og:image:alt" content="${escapeHtml(seo.imageAlt)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
  ]
  // "</" trong JSON có thể đóng thẻ script sớm
  if (seo.jsonLd) tags.push(`<script type="application/ld+json" id="page-jsonld">${JSON.stringify(seo.jsonLd).replace(/</g, '\\u003c')}</script>`)
  return tags.join('\n    ')
}

/** Thay khối thẻ giữa hai chú thích <!-- seo:start … --> và <!-- seo:end --> trong index.html bằng thẻ của trang. */
export function renderHead(html: string, seo: Seo): string {
  const start = html.indexOf('<!-- seo:start')
  const startEnd = start < 0 ? -1 : html.indexOf('-->', start) + 3
  const end = html.indexOf('<!-- seo:end -->')
  if (start < 0 || end < startEnd) throw new Error('index.html thiếu chú thích <!-- seo:start --> … <!-- seo:end -->')
  return `${html.slice(0, startEnd)}\n    ${headTags(seo)}\n    ${html.slice(end)}`
}
