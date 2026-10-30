import { describe, expect, it, vi } from 'vitest'
import { emptyLead, isVietnamMobile, normalizePhone, submitLead, validateLead } from './lead'

const TODAY = '2026-10-24'
const valid = { ...emptyLead('van-khe-riverside'), name: 'Nguyễn Thu Hà', phone: '0912 345 678', consent: true }

describe('lead form validation', () => {
  it('accepts Vietnamese mobile formats and rejects others', () => {
    expect(normalizePhone('+84 912.345.678')).toBe('0912345678')
    for (const phone of ['0912345678', '0912 345 678', '+84912345678', '0387-654-321']) expect(isVietnamMobile(phone)).toBe(true)
    for (const phone of ['091234567', '0212345678', 'abc', '09123456789']) expect(isVietnamMobile(phone)).toBe(false)
  })

  it('requires name, valid phone, consent; visit date only when booking', () => {
    expect(validateLead(valid, TODAY)).toEqual({})
    const errors = validateLead(emptyLead(), TODAY)
    expect(Object.keys(errors).sort()).toEqual(['consent', 'name', 'phone'])
    expect(validateLead({ ...valid, phone: '12345' }, TODAY).phone).toContain('chưa đúng')
    expect(validateLead({ ...valid, email: 'ha@' }, TODAY).email).toBeDefined()
    expect(validateLead({ ...valid, intent: 'xem-nha' }, TODAY).visitDate).toBe('Chọn ngày muốn xem nhà')
    expect(validateLead({ ...valid, intent: 'xem-nha', visitDate: '2026-10-23' }, TODAY).visitDate).toContain('từ hôm nay')
    expect(validateLead({ ...valid, intent: 'xem-nha', visitDate: TODAY }, TODAY)).toEqual({})
  })
})

describe('submitLead', () => {
  const payload = { ...valid, submittedAt: '2026-10-24T02:00:00Z', page: '/' }

  it('posts JSON to the endpoint with a normalized phone', async () => {
    const fetchImpl = vi.fn(async () => new Response('{}', { status: 201 }))
    await expect(submitLead(payload, { endpoint: 'https://api.example/leads', fetchImpl })).resolves.toEqual({ mode: 'api' })
    const [, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit]
    expect(JSON.parse(init.body as string)).toMatchObject({ phone: '0912345678', project: 'van-khe-riverside' })
    const failing = vi.fn(async () => new Response('', { status: 500 }))
    await expect(submitLead(payload, { endpoint: 'https://api.example/leads', fetchImpl: failing })).rejects.toThrow('500')
  })

  it('falls back to browser storage when no endpoint is configured', async () => {
    const store = new Map<string, string>()
    const storage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) }
    await expect(submitLead(payload, { storage })).resolves.toEqual({ mode: 'local' })
    expect(JSON.parse(store.get('vankhe-leads') ?? '[]')).toHaveLength(1)
  })
})
