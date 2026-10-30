<script setup lang="ts">
import { ref, watch } from 'vue'
import { thumbOf, type ProjectImage } from '@/data/catalog'

const props = defineProps<{ images: ProjectImage[] }>()
const current = ref(0)
watch(
  () => props.images,
  () => (current.value = 0),
)
</script>

<template>
  <div class="gallery">
    <div class="media main">
      <img :src="images[current].src" :alt="images[current].alt" width="1600" height="1000" fetchpriority="high" />
    </div>
    <div class="thumbs" role="group" aria-label="Chọn ảnh" :style="{ '--cot': Math.min(images.length, 6) }">
      <button
        v-for="(image, index) in images"
        :key="image.src"
        type="button"
        class="thumb media"
        :aria-pressed="index === current"
        :aria-label="`Ảnh ${index + 1}: ${image.alt}`"
        @click="current = index"
      >
        <img :src="thumbOf(image.src)" alt="" width="800" height="500" loading="lazy" decoding="async" />
      </button>
    </div>
    <p class="caption">Ảnh minh họa, không phải ảnh của dự án.</p>
  </div>
</template>

<style scoped>
.gallery {
  display: grid;
  gap: 12px;
  min-width: 0;
}

.main {
  aspect-ratio: 16 / 10;
}

.thumbs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

/* Màn rộng xếp mọi ảnh nhỏ một hàng (tối đa 6), điện thoại hàng ba ảnh */
@media (min-width: 760px) {
  .thumbs {
    grid-template-columns: repeat(var(--cot, 3), 1fr);
  }
}

.thumb {
  aspect-ratio: 16 / 10;
  padding: 0;
  border: 0;
  outline: 2px solid transparent;
  outline-offset: 3px;
  cursor: pointer;
  opacity: 0.75;
  transition:
    opacity 0.2s var(--ease),
    border-color 0.2s var(--ease);
}

.thumb:hover,
.thumb[aria-pressed='true'] {
  opacity: 1;
}

.thumb[aria-pressed='true'] {
  outline-color: var(--accent);
}

</style>
