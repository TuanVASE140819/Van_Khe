<script setup lang="ts">
import { STATUS_LABEL, TYPE_LABEL, thumbOf, type Project } from '@/data/catalog'
import { formatPrice } from '@/lib/format'

// Thẻ dự án: ảnh vuông góc, tên chữ có chân, dòng thông tin mảnh. Không chip, không bóng.
withDefaults(defineProps<{ project: Project; eager?: boolean; ratio?: 'wide' | 'tall' }>(), { eager: false, ratio: 'wide' })
</script>

<template>
  <RouterLink :to="`/du-an/${project.slug}`" class="card" :class="ratio">
    <div class="media">
      <img
        :src="thumbOf(project.images[0].src)"
        :srcset="`${thumbOf(project.images[0].src)} 800w, ${project.images[0].src} 1600w`"
        sizes="(min-width: 1024px) 33vw, 90vw"
        :alt="project.images[0].alt"
        width="800"
        height="500"
        :loading="eager ? 'eager' : 'lazy'"
        decoding="async"
      />
    </div>
    <p class="meta">
      <span :class="{ live: project.status === 'dang-mo-ban' }">{{ STATUS_LABEL[project.status] }}</span>
      <span>{{ TYPE_LABEL[project.type] }}</span>
    </p>
    <h3>{{ project.name }}</h3>
    <p class="place">{{ project.district }}, {{ project.city }}</p>
    <p class="price">{{ project.priceFrom !== null ? `Từ ${formatPrice(project.priceFrom)}` : 'Giá công bố khi mở bán' }}</p>
  </RouterLink>
</template>

<style scoped>
.card {
  display: grid;
  gap: 6px;
  color: inherit;
  text-decoration: none;
}

.media {
  aspect-ratio: 16 / 10;
  margin-bottom: 14px;
}

.tall .media {
  aspect-ratio: 4 / 5;
}

.media img {
  transition: transform 1.2s var(--ease);
}

.card:hover .media img {
  transform: scale(1.04);
}

.meta {
  display: flex;
  gap: 16px;
  color: var(--ink-2);
  font-size: 13px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.meta .live {
  color: var(--accent);
  font-weight: 600;
}

h3 {
  font-size: clamp(1.6rem, 1.3rem + 0.8vw, 2rem);
}

.card:hover h3 {
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 6px;
}

.place {
  color: var(--ink-2);
}

.price {
  font-weight: 500;
}

@media (prefers-reduced-motion: reduce) {
  .media img {
    transition: none;
  }

  .card:hover .media img {
    transform: none;
  }
}
</style>
