const BILLION = 1_000_000_000
const MILLION = 1_000_000

const trim = (value: number): string => value.toLocaleString('vi-VN', { maximumFractionDigits: 1 })

/** 3200000000 → "3,2 tỷ"; 850000000 → "850 triệu"; null → "Liên hệ". */
export function formatPrice(vnd: number | null): string {
  if (vnd === null) return 'Liên hệ'
  // Khoảng trắng không ngắt: số và đơn vị không bị tách sang hai dòng.
  if (vnd >= BILLION) return `${trim(Math.round((vnd / BILLION) * 10) / 10)}\u00a0tỷ`
  return `${trim(Math.round(vnd / MILLION))}\u00a0triệu`
}

/** "Đất 250 - 400 m²" → khoảng số và đơn vị dính liền, không bị ngắt dòng giữa chừng. */
export const keepTogether = (text: string): string =>
  text.replace(/(\d) - (\d)/g, '$1\u00a0-\u00a0$2').replace(/(\d) (m²|km|tầng|căn|phút)/g, '$1\u00a0$2')

/** "2026-09-15" → "15/09/2026" */
export const formatDate = (iso: string): string => {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}
