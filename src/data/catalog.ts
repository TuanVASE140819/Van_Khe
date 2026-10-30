import raw from './projects.json'

// Dữ liệu dự án lấy từ projects.json (dữ liệu mẫu). Sửa tệp JSON để đổi nội dung, không cần sửa code.

export type ProjectType = 'can-ho' | 'nha-pho' | 'biet-thu'
export type ProjectStatus = 'dang-mo-ban' | 'sap-mo-ban' | 'da-ban-giao'
export type AmenityId =
  | 'ho-boi'
  | 'cong-vien'
  | 'gym'
  | 'tre-em'
  | 'bbq'
  | 'the-thao'
  | 'ham-xe'
  | 'an-ninh'
  | 'truong-hoc'
  | 'tttm'
  | 'bien'

export interface PriceRow {
  unit: string
  area: string
  from: number
}

export interface ProjectImage {
  src: string
  alt: string
}

/** Ảnh một tiện ích của dự án (khối Tiện ích ở trang chi tiết); caption là dòng chú thích dưới ảnh */
export interface AmenityPhoto extends ProjectImage {
  id: AmenityId
  caption: string
}

export interface TravelTime {
  place: string
  time: string
}

export interface Milestone {
  /** vd "03/2026" hoặc "Quý IV/2028" */
  date: string
  label: string
  done: boolean
}

export interface Project {
  slug: string
  name: string
  type: ProjectType
  city: string
  district: string
  address: string
  lat: number
  lng: number
  status: ProjectStatus
  featured: boolean
  launchedAt: string
  /** VND; null = chưa công bố giá */
  priceFrom: number | null
  summary: string
  /** Câu chuyên viên tư vấn nói khi dẫn khách tới dự án (trang chủ, phần đi xem dự án) */
  pitch: string
  description: string[]
  facts: { scale: string; area: string; handover: string; legal: string; developer: string }
  amenities: AmenityId[]
  amenityPhotos: AmenityPhoto[]
  prices: PriceRow[]
  images: ProjectImage[]
  units: number
  travel: TravelTime[]
  progress: Milestone[]
}

export interface Company {
  name: string
  hotline: string
  email: string
  address: string
  hours: string
}

export const TYPE_LABEL: Record<ProjectType, string> = {
  'can-ho': 'Căn hộ',
  'nha-pho': 'Nhà phố',
  'biet-thu': 'Biệt thự',
}

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  'dang-mo-ban': 'Đang mở bán',
  'sap-mo-ban': 'Sắp mở bán',
  'da-ban-giao': 'Đã bàn giao',
}

export const AMENITY_LABEL: Record<AmenityId, string> = {
  'ho-boi': 'Hồ bơi',
  'cong-vien': 'Công viên',
  gym: 'Phòng gym',
  'tre-em': 'Khu vui chơi trẻ em',
  bbq: 'Khu BBQ',
  'the-thao': 'Sân thể thao',
  'ham-xe': 'Hầm đỗ xe',
  'an-ninh': 'An ninh 24/7',
  'truong-hoc': 'Trường học nội khu',
  tttm: 'Trung tâm thương mại',
  bien: 'Gần biển',
}

export const company: Company = raw.company
export const projects: Project[] = raw.projects as Project[]

export const cities = [...new Set(projects.map((p) => p.city))]
export const totalUnits = projects.reduce((sum, p) => sum + p.units, 0)

/** Ảnh nhỏ cho thẻ (800px) đi kèm ảnh lớn 1600px. */
export const thumbOf = (src: string): string => src.replace(/\.webp$/, '-800.webp')

export function findProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}
