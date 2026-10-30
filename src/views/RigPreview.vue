<script setup lang="ts">
// Trang chỉ có khi chạy dev (/__nhan-vat): xem các dáng của nhân vật để chỉnh hình vẽ.
import ConsultantFigure from '@/components/tour/ConsultantFigure.vue'
import { STAND, present, walkPose, wave, type Pose } from '@/lib/rig'

const frames: { label: string; pose: Pose }[] = [
  { label: 'Đứng', pose: STAND },
  ...Array.from({ length: 8 }, (_, i) => ({ label: `Bước ${i}/8`, pose: walkPose((i / 8) * Math.PI * 2, 1) })),
  { label: 'Giới thiệu', pose: present(STAND, 1) },
  { label: 'Chỉ lên', pose: present(STAND, 1, -125) },
  { label: 'Vẫy tay', pose: wave(STAND, 1, 0) },
]
</script>

<template>
  <div class="big"><ConsultantFigure /></div>
  <div class="grid">
    <figure v-for="frame in frames" :key="frame.label">
      <div class="box"><ConsultantFigure :pose="frame.pose" /></div>
      <figcaption>{{ frame.label }}</figcaption>
    </figure>
  </div>
</template>

<style scoped>
.big {
  height: 900px;
  background: var(--surface);
}

.grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  padding: 16px;
}

figure {
  margin: 0;
  background: var(--surface);
}

.box {
  height: 360px;
  border-bottom: 1px solid var(--line);
}

figcaption {
  padding: 4px 8px;
  font-size: 12px;
}
</style>
