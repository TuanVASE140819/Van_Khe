// Form đăng ký tư vấn / đặt lịch xem nhà: kiểm tra dữ liệu và gửi đi.

export type LeadIntent = 'goi-lai' | 'xem-nha'
export type TimeSlot = 'sang' | 'chieu' | 'toi'

export interface LeadForm {
  name: string
  phone: string
  email: string
  project: string
  intent: LeadIntent
  visitDate: string
  slot: TimeSlot
  note: string
  consent: boolean
}

export type LeadErrors = Partial<Record<keyof LeadForm, string>>

export const SLOT_LABEL: Record<TimeSlot, string> = { sang: 'Buổi sáng (8:00 - 12:00)', chieu: 'Buổi chiều (13:00 - 17:00)', toi: 'Buổi tối (18:00 - 20:00)' }

export const emptyLead = (project = ''): LeadForm => ({
  name: '',
  phone: '',
  email: '',
  project,
  intent: 'goi-lai',
  visitDate: '',
  slot: 'sang',
  note: '',
  consent: false,
})

/** Bỏ khoảng trắng, dấu chấm, gạch; +84 → 0. */
export const normalizePhone = (phone: string): string => phone.replace(/[\s.\-()]/g, '').replace(/^\+84/, '0')

/** Số di động Việt Nam: 10 số, đầu 03/05/07/08/09. */
export const isVietnamMobile = (phone: string): boolean => /^0[35789]\d{8}$/.test(normalizePhone(phone))

export function validateLead(form: LeadForm, today: string): LeadErrors {
  const errors: LeadErrors = {}
  const name = form.name.trim()
  if (!name) errors.name = 'Vui lòng nhập họ và tên'
  else if (name.length < 2 || name.length > 60) errors.name = 'Họ và tên từ 2 đến 60 ký tự'
  if (!form.phone.trim()) errors.phone = 'Vui lòng nhập số điện thoại'
  else if (!isVietnamMobile(form.phone)) errors.phone = 'Số điện thoại chưa đúng, ví dụ 0912 345 678'
  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Email chưa đúng định dạng'
  if (form.intent === 'xem-nha') {
    if (!form.visitDate) errors.visitDate = 'Chọn ngày muốn xem nhà'
    else if (form.visitDate < today) errors.visitDate = 'Ngày xem nhà phải từ hôm nay trở đi'
  }
  if (form.note.length > 500) errors.note = 'Ghi chú tối đa 500 ký tự'
  if (!form.consent) errors.consent = 'Cần đồng ý để chúng tôi liên hệ lại'
  return errors
}

export interface LeadPayload extends Omit<LeadForm, 'consent'> {
  submittedAt: string
  page: string
}

const STORAGE_KEY = 'vankhe-leads'

/**
 * Gửi lead tới VITE_LEAD_ENDPOINT (POST JSON). Chưa cấu hình endpoint thì lưu tạm trong trình duyệt
 * để site mẫu vẫn chạy được; khi chạy thật phải cấu hình endpoint.
 */
export async function submitLead(
  payload: LeadPayload,
  options: { endpoint?: string; fetchImpl?: typeof fetch; storage?: Pick<Storage, 'getItem' | 'setItem'> } = {},
): Promise<{ mode: 'api' | 'local' }> {
  const body = { ...payload, phone: normalizePhone(payload.phone) }
  if (options.endpoint) {
    const response = await (options.fetchImpl ?? fetch)(options.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!response.ok) throw new Error(`Máy chủ trả lỗi ${response.status}`)
    return { mode: 'api' }
  }
  const storage = options.storage ?? window.localStorage
  const saved = JSON.parse(storage.getItem(STORAGE_KEY) ?? '[]') as unknown[]
  storage.setItem(STORAGE_KEY, JSON.stringify([...saved, body].slice(-50)))
  await new Promise((resolve) => setTimeout(resolve, 400))
  return { mode: 'local' }
}

/** Hôm nay theo giờ Việt Nam, dạng YYYY-MM-DD (khớp với input type=date). */
export const todayVn = (now = new Date()): string => now.toLocaleDateString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' })
