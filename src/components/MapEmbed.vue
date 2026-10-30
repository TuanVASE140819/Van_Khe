<script setup lang="ts">
import { PhArrowUpRight, PhMapPin } from '@phosphor-icons/vue'
import { computed } from 'vue'

// Bản đồ OpenStreetMap nhúng (không cần API key); luôn kèm liên kết mở bản đồ lớn.
const props = defineProps<{ lat: number; lng: number; label: string; address: string }>()

const embed = computed(() => {
  const { lat, lng } = props
  const bbox = [lng - 0.012, lat - 0.007, lng + 0.012, lat + 0.007].map((n) => n.toFixed(5)).join('%2C')
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`
})
const full = computed(() => `https://www.openstreetmap.org/?mlat=${props.lat}&mlon=${props.lng}#map=16/${props.lat}/${props.lng}`)
</script>

<template>
  <div class="map">
    <div class="frame media">
      <!-- hiện khi bản đồ chưa tải được (mất mạng, bị chặn); iframe phủ lên khi tải xong -->
      <p class="fallback muted">Đang tải bản đồ. Nếu không hiện, bấm "Mở bản đồ lớn".</p>
      <iframe :src="embed" :title="`Bản đồ vị trí ${label}`" loading="lazy" referrerpolicy="no-referrer" />
    </div>
    <div class="info">
      <p class="address"><PhMapPin :size="20" aria-hidden="true" /> {{ address }}</p>
      <a :href="full" target="_blank" rel="noopener" class="open">Mở bản đồ lớn <PhArrowUpRight :size="16" aria-hidden="true" /></a>
    </div>
  </div>
</template>

<style scoped>
.map {
  display: grid;
  gap: 12px;
}

.frame {
  aspect-ratio: 16 / 9;
}

iframe {
  position: relative;
  width: 100%;
  height: 100%;
  border: 0;
}

.fallback {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 24px;
  text-align: center;
  font-size: 15px;
}

.info {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px 20px;
}

.address {
  display: flex;
  gap: 8px;
  color: var(--ink-2);
}

.address :deep(svg) {
  flex: none;
  margin-top: 3px;
  color: var(--accent);
}

.open {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  white-space: nowrap;
}
</style>
