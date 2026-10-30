import type { Directive } from 'vue'

// Hiệu ứng gắn với vị trí cuộn (thị sai, chữ hiện dần, khối màu mở rộng...).
// Một vòng requestAnimationFrame chung cho cả trang, chỉ chạy khi có cuộn hoặc đổi kích thước.
// Người dùng chọn giảm chuyển động thì không đăng ký hiệu ứng nào.

/**
 * p: 0 khi mép trên phần tử vừa chạm đáy màn hình, 1 khi mép dưới vừa rời đỉnh màn hình.
 * rect, vh: để hiệu ứng tự tính mốc riêng nếu cần.
 */
export type ScrollFx = (p: number, rect: DOMRect, vh: number) => void

const items = new Map<Element, ScrollFx>()
let scheduled = false

const clamp01 = (t: number) => Math.min(1, Math.max(0, t))

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function frame(): void {
  scheduled = false
  const vh = window.innerHeight
  for (const [el, fx] of items) {
    const rect = el.getBoundingClientRect()
    // Bỏ qua phần tử ở quá xa màn hình
    if (rect.bottom < -vh || rect.top > vh * 2) continue
    fx(clamp01((vh - rect.top) / (vh + rect.height)), rect, vh)
  }
}

function schedule(): void {
  if (scheduled) return
  scheduled = true
  requestAnimationFrame(frame)
}

/** Đăng ký hiệu ứng; trả về hàm huỷ. */
export function onScrollFx(el: Element, fx: ScrollFx): () => void {
  if (prefersReducedMotion()) return () => {}
  items.set(el, fx)
  if (items.size === 1) {
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
  }
  schedule()
  return () => {
    items.delete(el)
    if (items.size === 0) {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }
}

/**
 * v-parallax="10": ảnh trôi chậm hơn khung chứa (khung cần overflow: hidden).
 * Giá trị là biên độ, tính bằng % chiều cao ảnh; ảnh được phóng nhẹ để không lộ mép.
 */
const parallaxStops = new WeakMap<Element, () => void>()
export const vParallax: Directive<HTMLElement, number | undefined> = {
  mounted(el, binding) {
    const amount = binding.value ?? 10
    const zoom = 1 + amount / 50
    parallaxStops.set(
      el,
      onScrollFx(el.parentElement ?? el, (p) => {
        el.style.transform = `translate3d(0, ${((p - 0.5) * amount).toFixed(2)}%, 0) scale(${zoom.toFixed(3)})`
      }),
    )
  },
  unmounted(el) {
    parallaxStops.get(el)?.()
  },
}

/** v-count: số đếm lên khi khối số liệu hiện ra lần đầu. Giá trị: số đích; chữ đi kèm giữ nguyên. */
export const vCount: Directive<HTMLElement, number> = {
  mounted(el, binding) {
    const to = binding.value
    const suffix = el.dataset.suffix ?? ''
    const show = (v: number) => (el.textContent = `${Math.round(v).toLocaleString('vi-VN')}${suffix}`)
    show(to)
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) return
    show(0)
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        const start = performance.now()
        const run = (now: number) => {
          const t = clamp01((now - start) / 1400)
          show(to * (1 - (1 - t) ** 3))
          if (t < 1) requestAnimationFrame(run)
        }
        requestAnimationFrame(run)
      },
      { threshold: 0.6 },
    )
    io.observe(el)
  },
}
