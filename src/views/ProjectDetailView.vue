<script setup lang="ts">
import { PhArrowLeft } from '@phosphor-icons/vue'
import { computed, watchEffect } from 'vue'
import AmenityList from '@/components/AmenityList.vue'
import LeadForm from '@/components/LeadForm.vue'
import MapEmbed from '@/components/MapEmbed.vue'
import PriceTable from '@/components/PriceTable.vue'
import ProgressTimeline from '@/components/ProgressTimeline.vue'
import ProjectCard from '@/components/ProjectCard.vue'
import ProjectGallery from '@/components/ProjectGallery.vue'
import TravelTimes from '@/components/TravelTimes.vue'
import { STATUS_LABEL, TYPE_LABEL, findProject, projects } from '@/data/catalog'
import { formatPrice, keepTogether } from '@/lib/format'
import { setSeo } from '@/lib/seo'
import { seoProject } from '@/lib/seo-pages'
import NotFoundView from './NotFoundView.vue'

const props = defineProps<{ slug: string }>()
const project = computed(() => findProject(props.slug))
const related = computed(() => {
  const p = project.value
  if (!p) return []
  return projects
    .filter((other) => other.slug !== p.slug)
    .sort((a, b) => Number(b.city === p.city) - Number(a.city === p.city) || Number(b.type === p.type) - Number(a.type === p.type))
    .slice(0, 3)
})

watchEffect(() => {
  if (project.value) setSeo(seoProject(project.value))
})
</script>

<template>
  <NotFoundView v-if="!project" />
  <article v-else class="page">
    <div class="container">
      <nav class="crumbs" aria-label="Đường dẫn">
        <RouterLink to="/du-an"><PhArrowLeft :size="16" aria-hidden="true" /> Tất cả dự án</RouterLink>
      </nav>

      <header class="head">
        <p class="meta">
          <span :class="{ live: project.status === 'dang-mo-ban' }">{{ STATUS_LABEL[project.status] }}</span>
          <span>{{ TYPE_LABEL[project.type] }}</span>
          <span>{{ project.district }}, {{ project.city }}</span>
        </p>
        <h1>{{ project.name }}</h1>
        <p class="summary">{{ project.summary }}</p>
      </header>

      <ProjectGallery :images="project.images" />

      <section class="intro" aria-labelledby="gioi-thieu">
        <div>
          <h2 id="gioi-thieu" class="visually-hidden">Giới thiệu</h2>
          <p class="intro-lead">{{ project.description[0] }}</p>
          <p v-for="(paragraph, index) in project.description.slice(1)" :key="index" class="intro-text">{{ paragraph }}</p>
        </div>
        <aside class="facts" aria-label="Thông tin nhanh">
          <dl>
            <div><dt>Giá từ</dt><dd class="price">{{ project.priceFrom !== null ? formatPrice(project.priceFrom) : 'Công bố khi mở bán' }}</dd></div>
            <div><dt>Quy mô</dt><dd>{{ project.facts.scale }}</dd></div>
            <div><dt>Diện tích</dt><dd>{{ keepTogether(project.facts.area) }}</dd></div>
            <div><dt>Bàn giao</dt><dd>{{ project.facts.handover }}</dd></div>
            <div><dt>Pháp lý</dt><dd>{{ project.facts.legal }}</dd></div>
            <div><dt>Chủ đầu tư</dt><dd>{{ project.facts.developer }}</dd></div>
          </dl>
          <a href="#dang-ky" class="btn btn-primary">Đăng ký tư vấn</a>
        </aside>
      </section>

      <section id="bang-gia" class="block" aria-labelledby="bang-gia-title">
        <h2 id="bang-gia-title">Bảng giá</h2>
        <PriceTable :prices="project.prices" form-anchor="#dang-ky" />
      </section>

      <section class="block two" aria-labelledby="tien-ich">
        <h2 id="tien-ich">Tiện ích</h2>
        <AmenityList :amenities="project.amenities" :photos="project.amenityPhotos" />
      </section>

      <section class="block" aria-labelledby="vi-tri">
        <h2 id="vi-tri">Vị trí</h2>
        <div class="location">
          <MapEmbed :lat="project.lat" :lng="project.lng" :label="project.name" :address="project.address" />
          <div>
            <h3 class="sub">Đi lại</h3>
            <TravelTimes :items="project.travel" />
          </div>
        </div>
      </section>

      <section class="block" aria-labelledby="tien-do">
        <h2 id="tien-do">Tiến độ</h2>
        <ProgressTimeline :milestones="project.progress" />
      </section>
    </div>

    <section id="dang-ky" class="consult" aria-labelledby="dang-ky-title">
      <div class="container consult-grid">
        <div>
          <h2 id="dang-ky-title">Đăng ký tư vấn <span class="nowrap">{{ project.name }}</span></h2>
          <p class="consult-text">Nhận bảng giá, mặt bằng căn và lịch xem nhà mẫu.</p>
        </div>
        <LeadForm :key="project.slug" :project="project.slug" id-prefix="detail" tone="block" />
      </div>
    </section>

    <section class="container block" aria-labelledby="khac">
      <h2 id="khac">Dự án khác</h2>
      <ul class="related">
        <li v-for="p in related" :key="p.slug"><ProjectCard :project="p" /></li>
      </ul>
    </section>
  </article>
</template>

<style scoped>
.page {
  padding-top: 24px;
  padding-bottom: var(--section);
}

.crumbs a {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 44px;
  color: var(--ink-2);
  text-decoration: none;
}

.crumbs a:hover {
  color: var(--ink);
}

.head {
  display: grid;
  gap: 14px;
  margin: 16px 0 40px;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
  color: var(--ink-2);
  font-size: 13px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.meta .live {
  color: var(--accent);
  font-weight: 600;
}

h1 {
  font-size: var(--text-hero);
  line-height: 0.95;
}

.summary {
  max-width: 54ch;
  color: var(--ink-2);
  font-size: 1.125rem;
}

.intro {
  display: grid;
  gap: 48px;
  padding-top: clamp(48px, 7vw, 96px);
}

@media (min-width: 1024px) {
  .intro {
    grid-template-columns: 7fr 4fr;
    gap: 80px;
  }
}

.intro-lead {
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 1.3rem + 1.6vw, 2.6rem);
  line-height: 1.2;
}

.intro-text {
  margin-top: 20px;
  max-width: 62ch;
  color: var(--ink-2);
  font-size: 1.0625rem;
}

.facts {
  display: grid;
  align-content: start;
  gap: 24px;
}

dl {
  margin: 0;
  border-top: 1px solid var(--ink);
}

dl div {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid var(--line);
}

dt {
  color: var(--ink-2);
}

dd {
  margin: 0;
  font-weight: 500;
}

dd.price {
  font-family: var(--font-display);
  font-size: 1.7rem;
  line-height: 1.1;
}

.block {
  display: grid;
  gap: 28px;
  padding-top: clamp(64px, 8vw, 112px);
}

@media (min-width: 900px) {
  .block.two {
    grid-template-columns: 4fr 7fr;
    gap: 80px;
  }
}

.location {
  display: grid;
  gap: 32px;
}

@media (min-width: 900px) {
  .location {
    grid-template-columns: 7fr 4fr;
    gap: 56px;
  }
}

.sub {
  margin-bottom: 12px;
}

.consult {
  margin-top: clamp(64px, 8vw, 112px);
  padding-block: clamp(56px, 8vw, 104px);
  background: var(--block);
  color: var(--on-block);
}

.consult-grid {
  display: grid;
  gap: 40px;
}

@media (min-width: 1024px) {
  .consult-grid {
    grid-template-columns: 5fr 6fr;
    gap: 80px;
  }
}

.consult-text {
  margin-top: 16px;
  color: var(--on-block-2);
  font-size: 1.0625rem;
}

.related {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
  gap: 40px 28px;
}
</style>
