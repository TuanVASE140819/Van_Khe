<script setup lang="ts">
import { PhArrowDown, PhArrowRight } from '@phosphor-icons/vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { STATUS_LABEL, TYPE_LABEL, thumbOf, type Project } from '@/data/catalog'
import { formatPrice, keepTogether } from '@/lib/format'
import { GROUND_Y, HALF_STRIDE, clamp01, present, smooth, walkPose, wave } from '@/lib/rig'
import { buildTimeline, easeInOut, holdMiddle, locate, sceneState, type Stop, type Timeline } from '@/lib/tour'
import ConsultantFigure from './ConsultantFigure.vue'

// "Đi xem dự án cùng chuyên viên": sân khấu đứng yên (sticky) trong một khối cao; cuộn trang
// là tua kịch bản. Chuyên viên đi qua lại giữa các dự án, dừng lại giới thiệu, cảnh ảnh quét
// theo hướng cô ấy đi. Người dùng chọn giảm chuyển động (hoặc màn hình quá thấp) thì hiện
// dạng danh sách tĩnh với cùng nội dung.

const props = defineProps<{ projects: Project[] }>()
const GUIDE = 'Linh'
const n = props.projects.length
const lines = [
  `Chào anh chị, em là ${GUIDE}, chuyên viên tư vấn của Vân Khê Land. Anh chị kéo xuống, em dẫn đi xem ${n} dự án nhé.`,
  ...props.projects.map((p) => p.pitch),
  'Anh chị ưng dự án nào thì để lại số điện thoại, em gọi lại trong 24 giờ và giữ lịch xem nhà mẫu.',
]
const pad = (i: number) => String(i).padStart(2, '0')

// Khung hình: viewBox của nhân vật là -170 40 340 520
const VIEW_W = 340
const VIEW_H = 520
const VIEW_TOP = 40

const animated = ref(
  typeof window !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches && window.innerHeight >= 520,
)
const units = ref(0)

const root = ref<HTMLElement | null>(null)
const stage = ref<HTMLElement | null>(null)
const track = ref<HTMLElement | null>(null)
const actor = ref<HTMLElement | null>(null)
const floor = ref<HTMLElement | null>(null)
const bar = ref<HTMLElement | null>(null)
const route = ref<HTMLElement | null>(null)
const figure = ref<InstanceType<typeof ConsultantFigure> | null>(null)
const infos: HTMLElement[] = []
const frames: HTMLElement[] = []
const wipes: HTMLElement[] = []
const bubbles: HTMLElement[] = []

interface Layout {
  mobile: boolean
  stageW: number
  stageH: number
  left: number
  width: number
  figH: number
  scale: number
  floorY: number
  angle: number
  stickyTop: number
  timeline: Timeline
  /** Kích thước từng bong bóng, đo một lần để không phải đo lại mỗi khung hình */
  bubbleSize: [number, number][]
  /** Vùng chữ của từng cảnh (toạ độ sân khấu): bong bóng không được đè lên */
  textBoxes: { left: number; right: number; bottom: number }[][]
}
let layout: Layout | null = null

function stopsFor(mobile: boolean, offscreen: number): Stop[] {
  const station = (i: number): Stop => {
    const first = i % 2 === 0
    return mobile
      ? { x: first ? 0.2 : 0.8, facing: first ? 1 : -1, gesture: 'present', hold: 1.2, scene: i + 1 }
      : { x: first ? 0.3 : 0.7, facing: first ? 1 : -1, gesture: 'present', hold: 1.2, scene: i + 1 }
  }
  return [
    { x: offscreen, facing: 1, gesture: 'none', hold: 0, scene: -1 },
    { x: mobile ? 0.3 : 0.22, facing: 1, gesture: 'wave', hold: 1.2, scene: 0 },
    ...props.projects.map((_, i) => station(i)),
    { x: mobile ? 0.24 : 0.3, facing: 1, gesture: 'present', hold: 1, scene: n + 1 },
  ]
}

function measure(): void {
  if (!stage.value || !track.value) return
  const stageW = stage.value.clientWidth
  const stageH = stage.value.clientHeight
  const width = track.value.clientWidth
  const left = track.value.offsetLeft
  const mobile = width < 860
  const figH = mobile ? Math.min(280, Math.max(180, stageH * 0.3)) : Math.min(520, Math.max(260, stageH * 0.52))
  const scale = figH / VIEW_H
  const floorY = stageH * (mobile ? 0.975 : 0.95)
  // Ngoài mép trái sân khấu (thân người rộng khoảng 120 đơn vị hình vẽ)
  const offscreen = (-70 * scale - left) / width
  const timeline = buildTimeline(stopsFor(mobile, offscreen))
  const stickyTop = parseFloat(getComputedStyle(stage.value).top) || 0
  stage.value.style.setProperty('--fw', `${(VIEW_W * scale).toFixed(1)}px`)
  stage.value.style.setProperty('--fh', `${figH.toFixed(1)}px`)
  const bubbleSize = bubbles.map((el): [number, number] => [el.offsetWidth, el.offsetHeight])
  const box = (el: HTMLElement | null | undefined) =>
    el ? { left: left + el.offsetLeft, right: left + el.offsetLeft + el.offsetWidth, bottom: el.offsetTop + el.offsetHeight } : null
  const textBoxes = infos.map((el, k) => [box(el), k === 0 ? box(route.value) : null].filter((b) => b !== null))
  layout = { mobile, stageW, stageH, left, width, figH, scale, floorY, angle: -48, stickyTop, timeline, bubbleSize, textBoxes }
  units.value = timeline.total
  if (floor.value) floor.value.style.top = `${floorY.toFixed(1)}px`
}

/** Hướng nhìn khi đang quay người từ a sang b (qua 0 = nhìn nghiêng mỏng). */
function turn(a: number, b: number, t: number): number {
  if (a === b) return a
  const v = a * Math.cos(Math.PI * clamp01(t))
  return Math.abs(v) < 0.08 ? (t < 0.5 ? a : b) * 0.08 : v
}

function render(u: number, now: number): boolean {
  const L = layout
  if (!L) return false
  const { segment, s } = locate(L.timeline, u)
  const { from, to } = segment
  const px = (x: number) => L.left + x * L.width
  let x = from.x
  let facing = from.facing as number
  let face = facing
  let pose = walkPose(0, 0)
  let idle = false

  if (segment.kind === 'walk') {
    const dir = to.x >= from.x ? 1 : -1
    x = from.x + (to.x - from.x) * easeInOut(s)
    facing = turn(from.hold > 0 ? from.facing : dir, dir, s / 0.1)
    face = dir
    const w = smooth(s / 0.14) * (1 - smooth((s - 0.86) / 0.14))
    const travelled = Math.abs(x - from.x) * L.width
    pose = walkPose((Math.PI * travelled) / (HALF_STRIDE * L.scale), w)
  } else {
    const prev = L.timeline.segments[L.timeline.segments.indexOf(segment) - 1]
    const arrival = prev ? (prev.to.x >= prev.from.x ? 1 : -1) : from.facing
    facing = turn(arrival, from.facing, s / 0.12)
    face = from.facing
    const g = smooth((s - 0.08) / 0.2) * (1 - smooth((s - 0.84) / 0.16))
    if (from.gesture === 'wave') {
      pose = wave(pose, g, now / 160)
      idle = g > 0
    } else if (from.gesture === 'present') {
      pose = present(pose, g, L.angle)
    }
  }

  // Nhân vật
  const cx = px(x)
  const top = L.floorY - (GROUND_Y - VIEW_TOP) * L.scale
  if (actor.value) actor.value.style.transform = `translate3d(${(cx - (VIEW_W * L.scale) / 2).toFixed(1)}px, ${top.toFixed(1)}px, 0) scaleX(${facing.toFixed(3)})`
  figure.value?.apply(pose)

  // Bong bóng lời nói: chỉ khi đứng lại
  bubbles.forEach((el, k) => {
    const on = segment.kind === 'hold' && from.scene === k ? smooth((s - 0.14) / 0.16) * (1 - smooth((s - 0.88) / 0.12)) : 0
    el.style.opacity = on.toFixed(3)
    if (on <= 0) return
    const [w, h] = L.bubbleSize[k] ?? [el.offsetWidth, el.offsetHeight]
    const headX = cx + face * 12 * L.scale
    // Máy tính: bong bóng trên đầu. Điện thoại: ngang miệng để không đè phần chữ phía trên
    const bottom = top + (L.mobile ? 92 : 44) * L.scale
    // Đang vẫy tay thì đẩy bong bóng ra xa hơn để cánh tay không che chữ
    const gap = (from.gesture === 'wave' ? 110 : 26) * L.scale
    let left = face > 0 ? headX + gap : headX - gap - w
    left = Math.min(Math.max(left, 12), L.stageW - w - 12)
    // Màn hình thấp: hạ bong bóng xuống dưới phần chữ nếu hai bên chồng lên nhau
    let y = bottom - h - 12
    for (const b of L.textBoxes[k] ?? []) {
      if (left < b.right && left + w > b.left) y = Math.max(y, b.bottom + 12)
    }
    el.style.setProperty('--tail', `${Math.min(Math.max(headX - left, 18), w - 18).toFixed(0)}px`)
    el.style.transform = `translate3d(${left.toFixed(1)}px, ${(y + 8 * (1 - on)).toFixed(1)}px, 0)`
  })

  // Các cảnh: ảnh quét theo hướng đi, chữ mờ dần
  for (let k = 0; k <= n + 1; k++) {
    const st = sceneState(segment, s, k)
    const info = infos[k]
    if (info) {
      info.style.opacity = st.info.toFixed(3)
      info.style.transform = st.infoLeaving
        ? `translate3d(${(-st.dir * 32 * (1 - st.info)).toFixed(1)}px, 0, 0)`
        : `translate3d(0, ${(24 * (1 - st.info)).toFixed(1)}px, 0)`
      info.style.pointerEvents = st.info > 0.6 ? 'auto' : 'none'
    }
    if (k === 0 && route.value) {
      route.value.style.opacity = st.info.toFixed(3)
      route.value.style.pointerEvents = info?.style.pointerEvents ?? 'none'
    }
    const frame = frames[k - 1]
    if (frame) {
      const hide = ((1 - st.photo) * 100).toFixed(2)
      // Ảnh rời đi: phần còn lại nằm phía trước hướng đi. Ảnh tới: lộ dần theo hướng đi.
      const fromLeft = st.leaving ? st.dir > 0 : st.dir < 0
      frame.style.clipPath = fromLeft ? `inset(0 0 0 ${hide}%)` : `inset(0 ${hide}% 0 0)`
      const img = frame.firstElementChild as HTMLElement | null
      if (img) img.style.transform = `scale(${st.leaving ? 1 : (1 + 0.08 * (1 - st.photo)).toFixed(4)})`
      const wipe = wipes[k - 1]
      if (wipe) {
        const edge = st.leaving ? (st.dir > 0 ? 1 - st.photo : st.photo) : st.dir > 0 ? st.photo : 1 - st.photo
        wipe.style.left = `${(edge * 100).toFixed(2)}%`
        wipe.style.opacity = st.photo > 0.01 && st.photo < 0.99 ? '1' : '0'
      }
    }
  }
  if (bar.value) bar.value.style.transform = `scaleX(${(u / L.timeline.total).toFixed(4)})`
  return idle
}

// ---------- Cuộn → kịch bản (có làm mượt) ----------
let current = 0
let target = 0
let raf = 0
let last = 0
let visible = false

function scrollTarget(): number {
  if (!root.value || !layout) return 0
  const rect = root.value.getBoundingClientRect()
  const travel = rect.height - layout.stageH
  return clamp01((layout.stickyTop - rect.top) / travel) * layout.timeline.total
}

function tick(now: number): void {
  const dt = Math.min(0.05, (now - last) / 1000 || 0.016)
  last = now
  current += (target - current) * (1 - Math.exp(-dt * 9))
  if (Math.abs(target - current) < 0.0005) current = target
  const idle = render(current, now)
  raf = visible && (current !== target || idle) ? requestAnimationFrame(tick) : 0
}

function wake(): void {
  if (!raf && visible) {
    last = performance.now()
    raf = requestAnimationFrame(tick)
  }
}

function onScroll(): void {
  target = scrollTarget()
  // Nhảy xa (bấm liên kết neo): đuổi kịp phần lớn ngay, chỉ làm mượt đoạn cuối
  if (Math.abs(target - current) > 3) current = target - Math.sign(target - current) * 1.5
  wake()
}

function onResize(): void {
  measure()
  target = current = scrollTarget()
  render(current, performance.now())
}

/** Cuộn tới lúc chuyên viên đang đứng giới thiệu cảnh `scene`. */
function goTo(scene: number, behavior: ScrollBehavior): void {
  if (!layout || !root.value) return
  const mid = holdMiddle(layout.timeline, scene)
  if (mid === null) return
  const rect = root.value.getBoundingClientRect()
  const y = window.scrollY + rect.top - layout.stickyTop + (mid / layout.timeline.total) * (rect.height - layout.stageH)
  window.scrollTo({ top: y, behavior })
}

/** Bấm Tab tới một liên kết trong cảnh đang ẩn: nhảy tới cảnh đó để thấy được nó. */
function onFocus(event: FocusEvent): void {
  const el = (event.target as Element | null)?.closest<HTMLElement>('[data-scene]')
  const scene = Number(el?.dataset.scene)
  if (!el || !layout) return
  const { segment } = locate(layout.timeline, current)
  if (!(segment.kind === 'hold' && segment.from.scene === scene)) goTo(scene, 'instant' as ScrollBehavior)
}

let io: IntersectionObserver | null = null
let ro: ResizeObserver | null = null

onMounted(() => {
  if (!animated.value) return
  measure()
  // Chiều cao khối vừa đổi theo số đơn vị kịch bản: đo lại vị trí sau khi trình duyệt dàn trang
  requestAnimationFrame(() => {
    target = current = scrollTarget()
    render(current, performance.now())
  })
  window.addEventListener('scroll', onScroll, { passive: true })
  ro = new ResizeObserver(onResize)
  if (stage.value) ro.observe(stage.value)
  io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (visible) onScroll()
  })
  if (root.value) io.observe(root.value)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  cancelAnimationFrame(raf)
  io?.disconnect()
  ro?.disconnect()
})
</script>

<template>
  <section
    ref="root"
    class="tour"
    :class="{ static: !animated }"
    :style="animated && units ? { '--units': units } : undefined"
    aria-labelledby="tour-title"
    @focusin="animated && onFocus($event)"
  >
    <div ref="stage" class="stage">
      <div ref="track" class="container track">
        <!-- Mở đầu -->
        <div :ref="(el) => (infos[0] = el as HTMLElement)" class="info intro" data-scene="0">
          <h2 id="tour-title">Sáu dự án, năm tỉnh thành</h2>
          <p class="lead">{{ GUIDE }}, chuyên viên tư vấn, dẫn anh chị đi xem từng dự án: vị trí, giá và điều khách hay hỏi nhất.</p>
          <p v-if="animated" class="hint"><PhArrowDown :size="18" aria-hidden="true" /> Kéo xuống để bắt đầu</p>
          <RouterLink to="/du-an" class="link-arrow">Xem dạng danh sách <PhArrowRight :size="16" aria-hidden="true" /></RouterLink>
          <div v-if="!animated" class="static-guide">
            <div class="static-figure"><ConsultantFigure /></div>
            <p class="quote">{{ lines[0] }}</p>
          </div>
        </div>

        <!-- Lộ trình: bấm để tới thẳng một dự án -->
        <nav v-if="animated" ref="route" class="route" aria-label="Lộ trình xem dự án" data-scene="0">
          <p class="count">Lộ trình</p>
          <ol>
            <li v-for="(p, i) in projects" :key="p.slug">
              <button type="button" @click="goTo(i + 1, 'smooth')">
                <span class="route-no">{{ pad(i + 1) }}</span>
                <span class="route-name">{{ p.name }}</span>
                <span class="route-place">{{ p.district }}</span>
              </button>
            </li>
          </ol>
        </nav>

        <!-- Từng dự án -->
        <article
          v-for="(p, i) in projects"
          :key="p.slug"
          class="station"
          :class="i % 2 === 0 ? 'photo-right' : 'photo-left'"
          :aria-labelledby="`tour-${p.slug}`"
        >
          <figure class="photo">
            <div :ref="(el) => (frames[i] = el as HTMLElement)" class="frame">
              <img
                :src="p.images[0].src"
                :srcset="`${thumbOf(p.images[0].src)} 800w, ${p.images[0].src} 1600w`"
                sizes="(min-width: 860px) 58vw, 100vw"
                :alt="p.images[0].alt"
                width="1600"
                height="1000"
                loading="lazy"
                decoding="async"
              />
            </div>
            <span :ref="(el) => (wipes[i] = el as HTMLElement)" class="wipe" aria-hidden="true" />
          </figure>
          <div :ref="(el) => (infos[i + 1] = el as HTMLElement)" class="info" :data-scene="i + 1">
            <p class="count">{{ pad(i + 1) }} / {{ pad(n) }}</p>
            <h3 :id="`tour-${p.slug}`">{{ p.name }}</h3>
            <p class="meta">
              <span :class="{ live: p.status === 'dang-mo-ban' }">{{ STATUS_LABEL[p.status] }}</span>
              <span>{{ TYPE_LABEL[p.type] }}</span>
              <span>{{ p.district }}, {{ p.city }}</span>
            </p>
            <p class="scale">{{ keepTogether(p.facts.scale) }} · {{ keepTogether(p.facts.area) }}</p>
            <p class="price">{{ p.priceFrom !== null ? `Từ ${formatPrice(p.priceFrom)}` : 'Giá công bố khi mở bán' }}</p>
            <RouterLink :to="`/du-an/${p.slug}`" class="link-arrow">Xem dự án <PhArrowRight :size="16" aria-hidden="true" /></RouterLink>
            <p class="caption">Ảnh minh họa</p>
            <p v-if="!animated" class="quote">{{ GUIDE }}: {{ p.pitch }}</p>
          </div>
        </article>

        <!-- Kết -->
        <div :ref="(el) => (infos[n + 1] = el as HTMLElement)" class="info outro" :data-scene="n + 1">
          <h2>Anh chị ưng dự án nào?</h2>
          <p class="lead">Để lại số điện thoại, chuyên viên gọi lại trong 24 giờ, gửi bảng giá và giữ lịch xem nhà mẫu.</p>
          <div class="actions">
            <a href="#tu-van" class="btn btn-primary">Đăng ký tư vấn</a>
            <RouterLink to="/du-an" class="link-arrow">Xem tất cả dự án <PhArrowRight :size="16" aria-hidden="true" /></RouterLink>
          </div>
          <p v-if="!animated" class="quote">{{ GUIDE }}: {{ lines[n + 1] }}</p>
        </div>

        <template v-if="animated">
          <div ref="floor" class="floor" aria-hidden="true" />
        </template>
      </div>

      <template v-if="animated">
        <div ref="actor" class="actor"><ConsultantFigure ref="figure" /></div>
        <p v-for="(line, k) in lines" :key="k" :ref="(el) => (bubbles[k] = el as HTMLElement)" class="bubble">
          <span v-if="k === 0" class="who">{{ GUIDE }} · Chuyên viên tư vấn</span>
          <span class="visually-hidden">{{ GUIDE }} nói: </span>{{ line }}
        </p>
        <span ref="bar" class="bar" aria-hidden="true" />
      </template>
    </div>
  </section>
</template>

<style scoped>
/* ---------- Bản động: sân khấu dính trong khối cao ---------- */
.tour {
  --unit: 40svh;
  position: relative;
  height: calc(100svh - var(--nav-h) + var(--units, 18) * var(--unit));
}

@media (max-width: 859px) {
  .tour {
    --unit: 34svh;
  }
}

.stage {
  position: sticky;
  top: var(--nav-h);
  height: calc(100svh - var(--nav-h));
  overflow: hidden;
}

/* Bề rộng như .container nhưng không có padding: con định vị tuyệt đối thẳng hàng với lề nội dung */
.track {
  position: relative;
  width: min(var(--page), 100% - var(--gutter) * 2);
  height: 100%;
  padding-inline: 0;
}

.info {
  position: absolute;
  z-index: 2;
  display: grid;
  align-content: start;
  justify-items: start;
  gap: 10px;
  opacity: 0;
  will-change: opacity, transform;
}

.intro {
  top: 9%;
  left: 0;
  width: min(46%, 560px);
  gap: 18px;
}

.outro {
  top: 16%;
  right: 0;
  width: min(46%, 560px);
  gap: 18px;
}

.route {
  position: absolute;
  z-index: 2;
  top: 9%;
  right: 0;
  width: min(36%, 420px);
  opacity: 0;
}

.route ol {
  list-style: none;
  margin: 12px 0 0;
  padding: 0;
  border-top: 1px solid var(--ink);
}

.route button {
  display: grid;
  grid-template-columns: 36px 1fr auto;
  align-items: baseline;
  gap: 12px;
  width: 100%;
  min-height: 48px;
  padding: 10px 0;
  border: 0;
  border-bottom: 1px solid var(--line);
  background: none;
  color: var(--ink);
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.route button:hover .route-name {
  text-decoration: underline;
}

.route-no {
  color: var(--ink-2);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.route-name {
  font-family: var(--font-display);
  font-size: 1.3rem;
}

.route-place {
  color: var(--ink-2);
  font-size: 14px;
}

.station {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.photo {
  position: absolute;
  top: 6%;
  height: 74%;
  width: 58%;
  margin: 0;
}

.photo-right .photo {
  right: 0;
}

.photo-left .photo {
  left: 0;
}

.frame {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: var(--surface-2);
  clip-path: inset(0 0 0 100%);
  will-change: clip-path;
}

.frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  will-change: transform;
}

/* Vạch sáng ở mép quét khi chuyển cảnh */
.wipe {
  position: absolute;
  top: -3%;
  bottom: -3%;
  width: 3px;
  margin-left: -1.5px;
  background: var(--accent);
  opacity: 0;
}

.station .info {
  top: 8%;
  width: 34%;
}

.photo-right .info {
  left: 0;
}

.photo-left .info {
  right: 0;
}

.count {
  color: var(--ink-2);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.08em;
}

.info h3 {
  font-size: var(--text-h2);
  line-height: 1.02;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  color: var(--ink-2);
  font-size: 13px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.meta .live {
  color: var(--accent);
  font-weight: 600;
}

.scale {
  color: var(--ink-2);
}

.price {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 1.2rem + 0.8vw, 1.9rem);
  line-height: 1.1;
}

.caption {
  margin-top: 6px;
}

.hint {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--ink-2);
  font-size: 14px;
}

.hint :deep(svg) {
  animation: nudge 1.6s var(--ease) infinite;
}

@keyframes nudge {
  50% {
    transform: translateY(4px);
  }
}

.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px 28px;
}

.floor {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--line);
}

/* Nhân vật nằm trên bong bóng: tay vẫy / tay giới thiệu không bị che */
.actor {
  position: absolute;
  z-index: 4;
  left: 0;
  top: 0;
  width: var(--fw, 200px);
  height: var(--fh, 300px);
  pointer-events: none;
  will-change: transform;
}

.bubble {
  position: absolute;
  z-index: 3;
  left: 0;
  top: 0;
  max-width: 300px;
  padding: 14px 16px;
  border: 1px solid var(--line);
  background: var(--surface);
  color: var(--ink);
  font-size: 15px;
  line-height: 1.5;
  opacity: 0;
  pointer-events: none;
  will-change: transform, opacity;
}

.bubble::after {
  content: '';
  position: absolute;
  left: var(--tail, 24px);
  bottom: -7px;
  width: 12px;
  height: 12px;
  border-right: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  background: var(--surface);
  transform: translateX(-50%) rotate(45deg);
}

.who {
  display: block;
  margin-bottom: 4px;
  color: var(--accent);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.bar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  background: var(--accent);
  transform: scaleX(0);
  transform-origin: left;
}

/* Điện thoại: ảnh trên, chữ giữa, chuyên viên đi dưới cùng */
@media (max-width: 859px) {
  .intro,
  .outro {
    top: 5%;
    left: 0;
    right: 0;
    width: auto;
    gap: 14px;
  }

  .photo,
  .photo-left .photo,
  .photo-right .photo {
    top: 3%;
    left: 0;
    right: 0;
    width: auto;
    height: 31%;
  }

  .station .info,
  .photo-left .info,
  .photo-right .info {
    top: 36%;
    left: 0;
    right: 0;
    width: auto;
    gap: 6px;
  }

  .station .caption,
  .station .scale,
  .route {
    display: none;
  }

  .bubble {
    max-width: min(230px, 62vw);
    padding: 10px 12px;
    font-size: 14px;
  }
}

/* ---------- Bản tĩnh: giảm chuyển động hoặc màn hình quá thấp ---------- */
.tour.static {
  height: auto;
  padding-block: var(--section);
}

.static .stage {
  position: static;
  height: auto;
  overflow: visible;
}

.static .track {
  display: grid;
  gap: clamp(56px, 8vw, 96px);
  height: auto;
}

.static .info,
.static .station,
.static .photo {
  position: static;
  width: auto;
  opacity: 1;
}

.static .station {
  display: grid;
  gap: 20px;
  pointer-events: auto;
}

@media (min-width: 860px) {
  .static .station {
    grid-template-columns: 7fr 4fr;
    gap: 48px;
    align-items: start;
  }

  .static .photo-left .photo {
    order: 2;
  }
}

.static .photo {
  aspect-ratio: 16 / 10;
  position: relative;
}

.static .frame {
  clip-path: none;
}

.static .static-guide {
  display: flex;
  align-items: end;
  gap: 16px;
}

.static-figure {
  flex: none;
  width: 120px;
  height: 184px;
}

.quote {
  padding: 12px 14px;
  border-left: 2px solid var(--accent);
  background: var(--surface);
  font-size: 15px;
}
</style>
