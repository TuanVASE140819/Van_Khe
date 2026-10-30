<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { Milestone } from '@/data/catalog'
import { onScrollFx } from '@/lib/scrollfx'

// Tiến độ xây dựng: mốc đã xong tô đặc, mốc sắp tới để rỗng. Ngang trên máy tính, dọc trên điện thoại.
// Khi cuộn tới, vạch màu nhấn chạy từ mốc đầu tới mốc đã xong gần nhất (không vẽ quá phần chưa làm).
const props = defineProps<{ milestones: Milestone[] }>()
const list = ref<HTMLOListElement | null>(null)
const trail = ref<HTMLElement | null>(null)
const lastDone = props.milestones.map((m) => m.done).lastIndexOf(true)
let stop = () => {}

onMounted(() => {
  const ol = list.value
  if (!ol || lastDone < 0) return
  const items = [...ol.querySelectorAll<HTMLElement>('li')]
  stop = onScrollFx(ol, (_p, rect, vh) => {
    const q = Math.min(1, Math.max(0, (vh * 0.9 - rect.top) / (vh * 0.45)))
    const horizontal = getComputedStyle(ol).gridAutoFlow.startsWith('column')
    const end = items[lastDone]
    const length = horizontal ? end.offsetLeft + 6 : end.offsetTop + 12
    if (trail.value) {
      trail.value.style.width = horizontal ? `${(q * length).toFixed(1)}px` : ''
      trail.value.style.height = horizontal ? '' : `${(q * length).toFixed(1)}px`
    }
    ol.classList.add('fx')
    items.forEach((li) => li.classList.toggle('reached', q * length >= (horizontal ? li.offsetLeft : li.offsetTop) - 2))
  })
})
onBeforeUnmount(() => stop())
</script>

<template>
  <div class="wrap">
    <span ref="trail" class="trail" aria-hidden="true" />
    <ol ref="list" class="timeline">
      <li v-for="m in milestones" :key="m.date + m.label" :class="{ done: m.done }">
        <span class="mark" aria-hidden="true" />
        <p class="date">{{ m.date }}</p>
        <p class="what">{{ m.label }}</p>
        <p class="state">{{ m.done ? 'Đã xong' : 'Kế hoạch' }}</p>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.wrap {
  position: relative;
}

.timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0;
}

li {
  position: relative;
  display: grid;
  gap: 4px;
  padding: 0 0 28px 32px;
  border-left: 1px solid var(--line);
}

li:last-child {
  border-left-color: transparent;
}

.mark {
  position: absolute;
  left: -7px;
  top: 6px;
  width: 13px;
  height: 13px;
  border: 1px solid var(--accent);
  background: var(--bg);
}

.done .mark {
  background: var(--accent);
}

/* Vạch tiến độ chạy khi cuộn tới (chỉ khi có hiệu ứng) */
.trail {
  position: absolute;
  z-index: 1;
  left: 0;
  top: 0;
  width: 2px;
  height: 0;
  background: var(--accent);
}

.mark {
  z-index: 2;
  transition:
    transform 0.4s var(--ease),
    background-color 0.3s var(--ease);
}

.fx .done:not(.reached) .mark {
  transform: scale(0.55);
  background: var(--bg);
}

.date {
  font-family: var(--font-display);
  font-size: 1.6rem;
  line-height: 1.1;
}

.what {
  font-weight: 500;
}

.state {
  color: var(--ink-2);
  font-size: 13px;
}

@media (min-width: 768px) {
  .timeline {
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
  }

  li {
    padding: 32px 24px 0 0;
    border-left: 0;
    border-top: 1px solid var(--line);
  }

  li:last-child {
    border-top-color: var(--line);
  }

  .mark {
    left: 0;
    top: -7px;
  }

  .trail {
    top: -1px;
    width: 0;
    height: 2px;
  }
}
</style>
