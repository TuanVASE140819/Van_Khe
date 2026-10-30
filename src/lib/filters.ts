import type { Project, ProjectStatus, ProjectType } from '@/data/catalog'

// Bộ lọc danh sách dự án. Trạng thái lọc nằm trên URL (?khu-vuc=…) để chia sẻ được đường dẫn.

export type PriceRange = 'duoi-3' | '3-6' | '6-10' | 'tren-10'
export type SortKey = 'moi-nhat' | 'gia-tang' | 'gia-giam'

export interface Filters {
  city: string | null
  types: ProjectType[]
  price: PriceRange | null
  status: ProjectStatus | null
  sort: SortKey
}

export const PRICE_RANGES: { id: PriceRange; label: string; min: number; max: number }[] = [
  { id: 'duoi-3', label: 'Dưới 3 tỷ', min: 0, max: 3e9 },
  { id: '3-6', label: '3 - 6 tỷ', min: 3e9, max: 6e9 },
  { id: '6-10', label: '6 - 10 tỷ', min: 6e9, max: 10e9 },
  { id: 'tren-10', label: 'Trên 10 tỷ', min: 10e9, max: Number.POSITIVE_INFINITY },
]

export const SORTS: { id: SortKey; label: string }[] = [
  { id: 'moi-nhat', label: 'Mới nhất' },
  { id: 'gia-tang', label: 'Giá tăng dần' },
  { id: 'gia-giam', label: 'Giá giảm dần' },
]

const TYPES: ProjectType[] = ['can-ho', 'nha-pho', 'biet-thu']
const STATUSES: ProjectStatus[] = ['dang-mo-ban', 'sap-mo-ban', 'da-ban-giao']

export const emptyFilters = (): Filters => ({ city: null, types: [], price: null, status: null, sort: 'moi-nhat' })

type Query = Record<string, string | null | (string | null)[] | undefined>
const one = (value: Query[string]): string | null => (Array.isArray(value) ? (value[0] ?? null) : (value ?? null))

/** Đọc bộ lọc từ query URL; giá trị lạ bị bỏ qua. */
export function filtersFromQuery(query: Query, cities: string[]): Filters {
  const city = one(query['khu-vuc'])
  const price = one(query.gia)
  const status = one(query['trang-thai'])
  const sort = one(query['sap-xep'])
  const types = (one(query.loai) ?? '').split(',').filter((t): t is ProjectType => TYPES.includes(t as ProjectType))
  return {
    city: city && cities.includes(city) ? city : null,
    types,
    price: PRICE_RANGES.some((r) => r.id === price) ? (price as PriceRange) : null,
    status: STATUSES.includes(status as ProjectStatus) ? (status as ProjectStatus) : null,
    sort: SORTS.some((s) => s.id === sort) ? (sort as SortKey) : 'moi-nhat',
  }
}

export function filtersToQuery(filters: Filters): Record<string, string> {
  const query: Record<string, string> = {}
  if (filters.city) query['khu-vuc'] = filters.city
  if (filters.types.length) query.loai = filters.types.join(',')
  if (filters.price) query.gia = filters.price
  if (filters.status) query['trang-thai'] = filters.status
  if (filters.sort !== 'moi-nhat') query['sap-xep'] = filters.sort
  return query
}

/** Bộ lọc của ô tìm nhanh trên trang chủ: một khu vực, một loại hình, một khoảng giá; ô bỏ trống là "tất cả". */
export function quickFilters(city: string, type: ProjectType | '', price: PriceRange | ''): Filters {
  return { ...emptyFilters(), city: city || null, types: type ? [type] : [], price: price || null }
}

export const activeFilterCount =(f: Filters): number => [f.city, f.price, f.status].filter(Boolean).length + (f.types.length ? 1 : 0)

export function applyFilters(list: Project[], f: Filters): Project[] {
  const range = PRICE_RANGES.find((r) => r.id === f.price)
  const result = list.filter(
    (p) =>
      (!f.city || p.city === f.city) &&
      (!f.types.length || f.types.includes(p.type)) &&
      (!f.status || p.status === f.status) &&
      (!range || (p.priceFrom !== null && p.priceFrom >= range.min && p.priceFrom < range.max)),
  )
  // Dự án chưa có giá luôn xếp cuối khi sắp theo giá
  const price = (p: Project, missing: number) => p.priceFrom ?? missing
  switch (f.sort) {
    case 'gia-tang':
      return result.sort((a, b) => price(a, Infinity) - price(b, Infinity))
    case 'gia-giam':
      return result.sort((a, b) => price(b, -Infinity) - price(a, -Infinity))
    default:
      return result.sort((a, b) => b.launchedAt.localeCompare(a.launchedAt))
  }
}
