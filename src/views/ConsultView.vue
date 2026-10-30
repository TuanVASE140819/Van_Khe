<script setup lang="ts">
import { PhPhone } from '@phosphor-icons/vue'
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import LeadForm from '@/components/LeadForm.vue'
import { company, findProject, projects, thumbOf } from '@/data/catalog'
import { setSeo } from '@/lib/seo'
import { seoConsult } from '@/lib/seo-pages'

const route = useRoute()
const project = computed(() => {
  const slug = route.query['du-an']
  return typeof slug === 'string' && findProject(slug) ? slug : ''
})
const tel = company.hotline.replace(/\s/g, '')
// Nhà mẫu đặt tại dự án chủ lực, cùng dự án ở trang chủ.
const showroom = findProject('van-khe-riverside') ?? projects[0]

onMounted(() => setSeo(seoConsult()))
</script>

<template>
  <div class="container page">
    <div class="intro">
      <h1>Đăng ký tư vấn</h1>
      <p class="lead">Chuyên viên gọi lại trong 24 giờ để gửi bảng giá, chính sách thanh toán và giữ lịch xem nhà mẫu.</p>
      <a :href="`tel:${tel}`" class="hotline"><PhPhone :size="22" aria-hidden="true" /> {{ company.hotline }}</a>
      <p class="muted">{{ company.hours }}</p>
      <figure class="showroom">
        <div class="media">
          <img :src="thumbOf(showroom.images[1].src)" :alt="showroom.images[1].alt" width="800" height="500" loading="lazy" decoding="async" />
        </div>
        <figcaption>
          <strong>Căn hộ mẫu {{ showroom.name }}</strong>
          <span>{{ showroom.address }}. Ảnh minh họa.</span>
        </figcaption>
      </figure>
    </div>
    <div class="card">
      <LeadForm :project="project" id-prefix="consult" />
    </div>
  </div>
</template>

<style scoped>
.page {
  display: grid;
  gap: 32px;
  padding-top: clamp(28px, 5vw, 64px);
  padding-bottom: var(--section);
}

@media (min-width: 960px) {
  .page {
    grid-template-columns: 5fr 7fr;
    gap: 64px;
    align-items: start;
  }
}

.intro {
  display: grid;
  gap: 16px;
}

.intro h1 {
  font-size: var(--text-display);
}

.hotline {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  color: var(--ink);
  font-family: var(--font-display);
  font-size: 2.4rem;
  text-decoration: none;
}

.hotline :deep(svg) {
  color: var(--accent);
}

.showroom {
  display: grid;
  gap: 12px;
  margin: 24px 0 0;
}

.showroom .media {
  aspect-ratio: 16 / 10;
}

.showroom figcaption {
  display: grid;
  gap: 2px;
  font-size: 14px;
}

.showroom figcaption span {
  color: var(--ink-2);
}

.card {
  padding: clamp(20px, 4vw, 36px);
  border-top: 1px solid var(--ink);
  background: var(--surface);
}
</style>
