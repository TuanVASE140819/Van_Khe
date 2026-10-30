import { describe, expect, it } from 'vitest'
import { cities, projects } from '../data/catalog'
import { activeFilterCount, applyFilters, emptyFilters, filtersFromQuery, filtersToQuery, quickFilters } from './filters'
import { formatPrice, keepTogether } from './format'

describe('formatPrice', () => {
  // Số và đơn vị nối bằng khoảng trắng không ngắt.
  it('formats VND like Vietnamese listings', () => {
    expect(formatPrice(3_200_000_000)).toBe('3,2\u00a0tỷ')
    expect(formatPrice(12_000_000_000)).toBe('12\u00a0tỷ')
    expect(formatPrice(850_000_000)).toBe('850\u00a0triệu')
    expect(formatPrice(null)).toBe('Liên hệ')
  })
})

describe('keepTogether', () => {
  it('keeps number ranges and units on one line', () => {
    expect(keepTogether('Đất 250 - 400 m²')).toBe('Đất 250\u00a0-\u00a0400\u00a0m²')
    expect(keepTogether('Quý IV/2028')).toBe('Quý IV/2028')
  })
})

describe('project filters', () => {
  it('filters by city, type, price range and status', () => {
    const names = (f: ReturnType<typeof emptyFilters>) => applyFilters(projects, f).map((p) => p.slug)
    expect(names({ ...emptyFilters(), city: 'TP.HCM' })).toEqual(['van-khe-riverside', 'van-khe-sky'])
    expect(names({ ...emptyFilters(), types: ['biet-thu', 'nha-pho'] })).toEqual(['van-khe-garden', 'van-khe-villas'])
    // Dự án chưa có giá không lọt vào khoảng giá nào
    expect(names({ ...emptyFilters(), price: 'duoi-3' })).toEqual([])
    expect(names({ ...emptyFilters(), price: '3-6' }).sort()).toEqual(['van-khe-central', 'van-khe-garden', 'van-khe-riverside'])
    expect(names({ ...emptyFilters(), status: 'sap-mo-ban' })).toEqual(['van-khe-park'])
  })

  it('sorts by price with unpriced projects last, newest first by default', () => {
    const asc = applyFilters(projects, { ...emptyFilters(), sort: 'gia-tang' }).map((p) => p.slug)
    expect(asc[0]).toBe('van-khe-riverside')
    expect(asc.at(-1)).toBe('van-khe-park')
    const desc = applyFilters(projects, { ...emptyFilters(), sort: 'gia-giam' }).map((p) => p.slug)
    expect(desc[0]).toBe('van-khe-villas')
    expect(desc.at(-1)).toBe('van-khe-park')
    expect(applyFilters(projects, emptyFilters())[0].slug).toBe('van-khe-park')
  })

  it('round-trips through the URL and ignores junk values', () => {
    const f = { ...emptyFilters(), city: 'Đà Nẵng', types: ['biet-thu' as const], price: 'tren-10' as const, sort: 'gia-giam' as const }
    expect(filtersFromQuery(filtersToQuery(f), cities)).toEqual(f)
    expect(filtersFromQuery({ 'khu-vuc': 'Sao Hỏa', loai: 'lau-dai,can-ho', gia: 'free', 'sap-xep': 'x' }, cities)).toEqual({
      ...emptyFilters(),
      types: ['can-ho'],
    })
    expect(activeFilterCount(f)).toBe(3)
    expect(filtersToQuery(emptyFilters())).toEqual({})
  })
})

describe('ô tìm nhanh trên trang chủ', () => {
  it('ô bỏ trống là tất cả; chọn rồi thì ra đúng query của trang danh sách', () => {
    expect(quickFilters('', '', '')).toEqual(emptyFilters())
    const f = quickFilters('TP.HCM', 'can-ho', '3-6')
    expect(filtersToQuery(f)).toEqual({ 'khu-vuc': 'TP.HCM', loai: 'can-ho', gia: '3-6' })
    // trang danh sách đọc lại đúng bộ lọc đó, nên số dự án nút báo trước khớp với trang sẽ mở
    const doc = filtersFromQuery(filtersToQuery(f), cities)
    expect(applyFilters(projects, doc).map((p) => p.slug)).toEqual(applyFilters(projects, f).map((p) => p.slug))
    expect(applyFilters(projects, f).map((p) => p.slug)).toEqual(['van-khe-riverside'])
  })
})
