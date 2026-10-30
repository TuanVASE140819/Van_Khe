<script setup lang="ts">
import { PhArrowRight, PhPhone } from '@phosphor-icons/vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import LeadForm from '@/components/LeadForm.vue'
import ProgressTimeline from '@/components/ProgressTimeline.vue'
import QuickSearch from '@/components/QuickSearch.vue'
import TravelTimes from '@/components/TravelTimes.vue'
import ProjectTour from '@/components/tour/ProjectTour.vue'
import { cities, company, findProject, projects, totalUnits } from '@/data/catalog'
import { formatPrice, keepTogether } from '@/lib/format'
import { headerOverPhoto } from '@/lib/header'
import { onScrollFx } from '@/lib/scrollfx'
import { setSeo } from '@/lib/seo'
import { seoHome } from '@/lib/seo-pages'

// Trang chủ dẫn dắt bằng dự án chủ lực: số liệu lấy từ dữ liệu dự án, không viết cứng.
const flagship = findProject('van-khe-riverside')!
const tel = company.hotline.replace(/\s/g, '')
const delivered = projects.filter((p) => p.status === 'da-ban-giao').length
const hero = ref<HTMLElement | null>(null)
const heroMedia = ref<HTMLElement | null>(null)
const heroCopy = ref<HTMLElement | null>(null)
const statement = ref<HTMLElement | null>(null)
const consult = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null
const stops: (() => void)[] = []

// Đoạn tuyên ngôn: từng chữ đậm dần theo nhịp cuộn
const STATEMENT = 'Từ căn hộ bên sông Sài Gòn tới biệt thự cách biển Mỹ Khê 300\u00a0m. Mỗi dự án công bố giấy phép, tiến độ và bảng giá ngay trên trang.'
const words = STATEMENT.split(' ')

const clamp01 = (t: number) => Math.min(1, Math.max(0, t))

function scrollScenes(): void {
  // Hero: ảnh trôi chậm, chữ mờ dần và trượt lên khi rời màn hình
  if (hero.value) {
    stops.push(
      onScrollFx(hero.value, (_p, rect) => {
        const k = clamp01(-rect.top / rect.height)
        if (heroMedia.value) heroMedia.value.style.transform = `translate3d(0, ${(k * 24).toFixed(2)}%, 0)`
        if (heroCopy.value) {
          heroCopy.value.style.opacity = (1 - k * 1.6).toFixed(3)
          heroCopy.value.style.transform = `translate3d(0, ${(-k * 90).toFixed(1)}px, 0)`
        }
      }),
    )
  }
  if (statement.value) {
    const spans = [...statement.value.querySelectorAll<HTMLElement>('.w')]
    stops.push(
      onScrollFx(statement.value, (_p, rect, vh) => {
        const q = clamp01((vh * 0.88 - rect.top) / (vh * 0.6)) * (spans.length + 6)
        spans.forEach((span, i) => (span.style.opacity = (0.16 + 0.84 * clamp01((q - i) / 6)).toFixed(3)))
      }),
    )
  }
  // Khối tư vấn: từ khung nhỏ mở ra tràn màn hình khi cuộn tới
  const block = consult.value
  if (block) {
    stops.push(
      onScrollFx(block, (_p, rect, vh) => {
        const k = 1 - clamp01((vh - rect.top) / (vh * 0.7))
        // Lề ngang nhỏ hơn lề nội dung để chữ trong khối không bị cắt
        block.style.clipPath = `inset(${(k * 6).toFixed(2)}% ${(k * 4).toFixed(2)}% 0 ${(k * 4).toFixed(2)}%)`
      }),
    )
  }
}

onMounted(() => {
  setSeo(seoHome())
  // Thanh điều hướng trong suốt khi còn nằm trên ảnh hero
  headerOverPhoto.value = true
  if (hero.value && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver(([entry]) => (headerOverPhoto.value = entry.isIntersecting), { rootMargin: '-72px 0px 0px 0px', threshold: 0.08 })
    observer.observe(hero.value)
  }
  scrollScenes()
})
onBeforeUnmount(() => {
  observer?.disconnect()
  stops.forEach((stop) => stop())
  headerOverPhoto.value = false
})
</script>

<template>
  <!-- Ảnh tràn màn hình, chữ ở góc dưới -->
  <section ref="hero" class="hero" aria-labelledby="hero-title">
    <div ref="heroMedia" class="hero-media">
      <img class="hero-img" src="/images/hero.webp" alt="Trung tâm TP.HCM nhìn từ bờ sông Sài Gòn lúc hoàng hôn" width="2000" height="1125" fetchpriority="high" />
    </div>
    <div class="hero-scrim" aria-hidden="true" />
    <div class="container hero-inner">
      <div ref="heroCopy" class="hero-copy">
        <p class="label">Dự án chủ lực, {{ flagship.district }}</p>
        <h1 id="hero-title">{{ flagship.name }}</h1>
        <p class="hero-sub">
          {{ flagship.facts.scale.split(',').slice(0, 2).join(',') }} bên sông Sài Gòn. Căn hộ {{ keepTogether(flagship.facts.area) }}, từ
          {{ formatPrice(flagship.priceFrom) }}, bàn giao {{ flagship.facts.handover }}.
        </p>
        <div class="hero-actions">
          <RouterLink :to="`/dang-ky-tu-van?du-an=${flagship.slug}`" class="btn btn-light">Đăng ký tư vấn</RouterLink>
          <RouterLink :to="`/du-an/${flagship.slug}`" class="link-arrow">Xem chi tiết dự án <PhArrowRight :size="16" aria-hidden="true" /></RouterLink>
        </div>
      </div>
    </div>
    <p class="hero-credit">Ảnh minh họa: trung tâm TP.HCM nhìn từ bờ sông</p>
  </section>

  <!-- Tìm nhanh theo khu vực, loại hình, giá -->
  <QuickSearch />

  <!-- Đi xem dự án cùng chuyên viên: cuộn để chuyên viên dẫn qua từng dự án -->
  <ProjectTour id="du-an" :projects="projects" />

  <!-- Đoạn tuyên ngôn + số liệu -->
  <section class="section container statement" aria-label="Giới thiệu chủ đầu tư">
    <p ref="statement" class="statement-text">
      <template v-for="(word, i) in words" :key="i"><span class="w">{{ word }}</span>{{ i < words.length - 1 ? ' ' : '' }}</template>
    </p>
    <dl v-reveal="120" class="facts">
      <div><dt>Dự án</dt><dd v-count="projects.length" /></div>
      <div><dt>Tỉnh thành</dt><dd v-count="cities.length" /></div>
      <div><dt>Căn hộ và nhà</dt><dd v-count="totalUnits" /></div>
      <div><dt>Đã bàn giao</dt><dd v-count="delivered" data-suffix=" dự án" /></div>
    </dl>
  </section>

  <!-- Dự án chủ lực: ảnh dọc + số liệu + thời gian di chuyển -->
  <section id="noi-bat" class="section container feature" aria-labelledby="noi-bat-title">
    <figure v-reveal class="feature-media">
      <div class="media"><img v-parallax="8" :src="flagship.images[0].src" :alt="flagship.images[0].alt" width="1600" height="1000" loading="lazy" decoding="async" /></div>
      <figcaption class="caption">Ảnh minh họa</figcaption>
    </figure>
    <div class="feature-body">
      <h2 id="noi-bat-title">Bên sông, cách <span class="nowrap">quận 1</span> mười lăm phút</h2>
      <p class="lead">{{ flagship.description[0] }}</p>
      <dl class="spec">
        <div><dt>Quy mô</dt><dd>{{ flagship.facts.scale }}</dd></div>
        <div><dt>Diện tích căn</dt><dd>{{ keepTogether(flagship.facts.area) }}</dd></div>
        <div><dt>Giá từ</dt><dd>{{ formatPrice(flagship.priceFrom) }}</dd></div>
        <div><dt>Bàn giao</dt><dd>{{ flagship.facts.handover }}</dd></div>
        <div><dt>Pháp lý</dt><dd>{{ flagship.facts.legal }}</dd></div>
      </dl>
      <h3 class="sub">Đi lại</h3>
      <TravelTimes :items="flagship.travel" />
      <RouterLink :to="`/du-an/${flagship.slug}#bang-gia`" class="link-arrow more">Xem bảng giá theo loại căn <PhArrowRight :size="16" aria-hidden="true" /></RouterLink>
    </div>
  </section>

  <!-- Ghép ảnh tiện ích lệch nhịp -->
  <section class="section life" aria-labelledby="tien-ich-title">
    <div class="container">
      <h2 id="tien-ich-title" class="life-title">Trong khuôn viên</h2>
      <div class="mosaic">
        <figure v-reveal class="m-wide">
          <div class="media"><img v-parallax="10" src="/images/life-pool.webp" alt="Hồ bơi giữa vườn cây nội khu" width="1600" height="1100" loading="lazy" decoding="async" /></div>
          <figcaption><strong>Hồ bơi 50 m</strong> giữa vườn nội khu, mở 6:00 - 21:00</figcaption>
        </figure>
        <figure v-reveal="100" class="m-tall">
          <div class="media"><img v-parallax="16" src="/images/life-interior.webp" alt="Góc phòng khách tối giản với ghế bành vàng" width="1200" height="1500" loading="lazy" decoding="async" /></div>
          <figcaption><strong>Căn hộ mẫu</strong> 2 phòng ngủ, 74 m², bàn giao hoàn thiện</figcaption>
        </figure>
        <figure v-reveal="200" class="m-tall offset">
          <div class="media"><img v-parallax="12" src="/images/life-gym.webp" alt="Phòng tập với giá tạ" width="1200" height="1500" loading="lazy" decoding="async" /></div>
          <figcaption><strong>Phòng tập</strong> cho cư dân, mở 5:00 - 23:00</figcaption>
        </figure>
        <figure v-reveal class="m-small">
          <div class="media"><img v-parallax="10" src="/images/tien-ich/van-khe-riverside-tre-em.webp" alt="Sân chơi trẻ em dưới tán cây" width="1200" height="900" loading="lazy" decoding="async" /></div>
          <figcaption><strong>Sân chơi trẻ em</strong> dưới tán cây, cạnh nhà trẻ ở khối đế</figcaption>
        </figure>
        <figure v-reveal="100" class="m-pano">
          <div class="media"><img v-parallax="8" src="/images/tien-ich/van-khe-riverside-cong-vien.webp" alt="Lối đi bộ dưới hàng cây trong công viên" width="1200" height="900" loading="lazy" decoding="async" /></div>
          <figcaption><strong>Công viên ven sông 1,2 km</strong>, lối đi bộ nối thẳng vào nội khu</figcaption>
        </figure>
      </div>
      <p class="caption">Ảnh minh họa</p>
    </div>
  </section>

  <!-- Tiến độ xây dựng -->
  <section id="tien-do" class="section container progress" aria-labelledby="tien-do-title">
    <p class="label muted">Cập nhật 10/2026</p>
    <h2 id="tien-do-title">Tiến độ <span class="nowrap">{{ flagship.name }}</span></h2>
    <ProgressTimeline :milestones="flagship.progress" />
  </section>

  <!-- Khối màu duy nhất: đăng ký tư vấn -->
  <section id="tu-van" ref="consult" class="consult" aria-labelledby="tu-van-title">
    <div class="container consult-grid">
      <div class="consult-copy">
        <h2 id="tu-van-title">Hẹn xem căn hộ mẫu tại Thủ Đức</h2>
        <p>Nhà mẫu mở {{ company.hours.split(',')[0] }} mỗi ngày. Chuyên viên gọi lại trong 24 giờ để gửi bảng giá và giữ lịch.</p>
        <a :href="`tel:${tel}`" class="hotline"><PhPhone :size="22" aria-hidden="true" /> {{ company.hotline }}</a>
        <figure class="consult-photo">
          <div class="media"><img :src="flagship.images[1].src" :alt="flagship.images[1].alt" width="1600" height="1000" loading="lazy" decoding="async" /></div>
          <figcaption>Căn hộ mẫu {{ flagship.name }}. Ảnh minh họa</figcaption>
        </figure>
      </div>
      <LeadForm id-prefix="home" tone="block" :project="flagship.slug" />
    </div>
  </section>
</template>

<style scoped>
/* ---------- Hero ---------- */
.hero {
  position: relative;
  display: grid;
  align-items: end;
  min-height: max(560px, min(100svh, 940px));
  color: #f3f4f1;
  overflow: hidden;
  background: #1b2420;
}

/* Khung ảnh cao hơn hero một chút để trôi thị sai không lộ mép dưới */
.hero-media {
  position: absolute;
  inset: 0 0 -12%;
  will-change: transform;
}

.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  animation: settle 2.2s var(--ease) both;
}

.hero-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgb(8 12 10 / 20%) 0%, transparent 35%, rgb(8 12 10 / 72%) 100%);
}

.hero-inner {
  position: relative;
  padding-bottom: clamp(56px, 9vh, 96px);
  animation: rise 1.2s var(--ease) 0.2s both;
}

.hero-copy {
  display: grid;
  gap: 18px;
  will-change: transform, opacity;
}

.hero h1 {
  font-size: var(--text-hero);
  line-height: 0.95;
}

.hero-sub {
  max-width: 44ch;
  font-size: clamp(1rem, 0.9rem + 0.4vw, 1.2rem);
  color: rgb(243 244 241 / 88%);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px 28px;
  margin-top: 8px;
}

.btn-light {
  background: #f3f4f1;
  color: #16211c;
}

.btn-light:hover {
  background: #ffffff;
}

.hero .link-arrow:hover {
  color: #ffffff;
}

.hero-credit {
  position: absolute;
  right: var(--gutter);
  bottom: 16px;
  color: rgb(243 244 241 / 70%);
  font-size: 12px;
}

@keyframes settle {
  from {
    transform: scale(1.06);
  }
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-img,
  .hero-inner {
    animation: none;
  }
}

/* ---------- Tuyên ngôn ---------- */
.statement {
  display: grid;
  gap: 56px;
}

.statement-text .w {
  transition: opacity 0.2s linear;
}

.statement-text {
  max-width: 26ch;
  font-family: var(--font-display);
  font-size: var(--text-display);
  font-weight: 500;
  line-height: 1.12;
  text-wrap: pretty;
}

.facts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  margin: 0;
  border-top: 1px solid var(--ink);
}

@media (min-width: 768px) {
  .facts {
    grid-template-columns: repeat(4, 1fr);
  }
}

.facts div {
  padding: 20px 20px 0 0;
}

.facts dt {
  color: var(--ink-2);
  font-size: 14px;
}

.facts dd {
  margin: 6px 0 0;
  font-family: var(--font-display);
  font-size: clamp(2.2rem, 1.6rem + 2vw, 3.4rem);
  line-height: 1;
}

/* ---------- Dự án chủ lực ---------- */
.feature {
  display: grid;
  gap: 40px;
  border-top: 1px solid var(--line);
}

@media (min-width: 1024px) {
  .feature {
    grid-template-columns: 6fr 5fr;
    gap: 72px;
    align-items: start;
  }

  .feature-media {
    position: sticky;
    top: calc(var(--nav-h) + 24px);
  }
}

.feature-media {
  margin: 0;
}

.feature-media .media {
  aspect-ratio: 4 / 5;
}

.feature-body {
  display: grid;
  align-content: start;
  gap: 24px;
}

.spec {
  margin: 8px 0 0;
  display: grid;
}

.spec div {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 16px;
  padding: 12px 0;
  border-top: 1px solid var(--line);
}

.spec dt {
  color: var(--ink-2);
}

.spec dd {
  margin: 0;
  font-weight: 500;
}

.sub {
  margin-top: 16px;
}

.more {
  justify-self: start;
  margin-top: 8px;
}

/* ---------- Ghép ảnh ---------- */
.life {
  background: var(--surface);
}

.life-title {
  margin-bottom: 40px;
}

.mosaic {
  display: grid;
  gap: 24px;
}

.mosaic figure {
  margin: 0;
  display: grid;
  gap: 12px;
}

.mosaic figcaption {
  color: var(--ink-2);
  font-size: 15px;
}

.mosaic figcaption strong {
  color: var(--ink);
  font-weight: 600;
}

.m-wide .media {
  aspect-ratio: 16 / 11;
}

.m-tall .media {
  aspect-ratio: 4 / 5;
}

.m-small .media {
  aspect-ratio: 4 / 3;
}

.m-pano .media {
  aspect-ratio: 16 / 9;
}

/* Hàng hai đảo nhịp hàng một: ảnh nhỏ bên trái, ảnh ngang rộng bên phải */
@media (min-width: 900px) {
  .mosaic {
    grid-template-columns: 1.6fr 1fr 1fr;
    align-items: start;
  }

  .m-tall.offset {
    margin-top: 96px;
  }

  .m-small {
    align-self: end;
  }

  .m-pano {
    grid-column: 2 / 4;
  }
}

/* ---------- Tiến độ ---------- */
.progress {
  display: grid;
  gap: 16px;
}

.progress h2 {
  margin-bottom: 40px;
}

/* ---------- Khối màu tư vấn ---------- */
.consult {
  padding-block: var(--section);
  background: var(--block);
  color: var(--on-block);
  will-change: clip-path;
}

.consult-grid {
  display: grid;
  gap: 48px;
}

@media (min-width: 1024px) {
  .consult-grid {
    grid-template-columns: 5fr 6fr;
    gap: 80px;
  }
}

.consult-copy {
  display: grid;
  align-content: start;
  gap: 20px;
}

.consult-copy p {
  max-width: 42ch;
  color: var(--on-block-2);
  font-size: 1.0625rem;
}

.consult-photo {
  margin: 20px 0 0;
  display: grid;
  gap: 10px;
}

.consult-photo .media {
  aspect-ratio: 16 / 10;
}

.consult-photo figcaption {
  color: var(--on-block-2);
  font-size: 13px;
}

.hotline {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  font-family: var(--font-display);
  font-size: clamp(2rem, 1.6rem + 1.4vw, 2.8rem);
  text-decoration: none;
}
</style>
