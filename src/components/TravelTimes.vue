<script setup lang="ts">
import type { TravelTime } from '@/data/catalog'

defineProps<{ items: TravelTime[] }>()
</script>

<template>
  <dl class="travel">
    <div v-for="item in items" :key="item.place">
      <dt>{{ item.place }}</dt>
      <dd>{{ item.time }}</dd>
    </div>
  </dl>
</template>

<style scoped>
.travel {
  margin: 0;
  display: grid;
}

.travel div {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  padding: 12px 0;
  border-top: 1px solid var(--line);
}

dt {
  color: var(--ink-2);
}

dd {
  margin: 0;
  font-weight: 500;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
</style>
