<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { PhArrowRight } from '@phosphor-icons/vue'
import { cities, projects, TYPE_LABEL, type ProjectType } from '@/data/catalog'
import { applyFilters, filtersToQuery, PRICE_RANGES, quickFilters, type PriceRange } from '@/lib/filters'

// Ô tìm nhanh ngay dưới ảnh đầu trang (PB-7, học Gamuda Land và Berkeley): chọn khu vực, loại hình, giá
// rồi sang trang danh sách với đúng bộ lọc đó trên URL. Nút báo trước có bao nhiêu dự án khớp.
const router = useRouter()
const city = ref('')
const type = ref<ProjectType | ''>('')
const price = ref<PriceRange | ''>('')
const TYPES = Object.entries(TYPE_LABEL) as [ProjectType, string][]

const filters = computed(() => quickFilters(city.value, type.value, price.value))
const count = computed(() => applyFilters(projects, filters.value).length)

function submit(): void {
  if (count.value) router.push({ path: '/du-an', query: filtersToQuery(filters.value) })
}
</script>

<template>
  <section class="quick" aria-labelledby="tim-nhanh-title">
    <div class="container quick-inner">
      <div class="quick-head">
        <h2 id="tim-nhanh-title">Tìm dự án</h2>
        <p>{{ projects.length }} dự án ở {{ cities.length }} tỉnh thành</p>
      </div>
      <form class="quick-form" @submit.prevent="submit">
        <label class="field">
          <span>Khu vực</span>
          <select id="tim-khu-vuc" v-model="city">
            <option value="">Tất cả khu vực</option>
            <option v-for="c in cities" :key="c" :value="c">{{ c }}</option>
          </select>
        </label>
        <label class="field">
          <span>Loại hình</span>
          <select id="tim-loai" v-model="type">
            <option value="">Tất cả loại hình</option>
            <option v-for="[value, label] in TYPES" :key="value" :value="value">{{ label }}</option>
          </select>
        </label>
        <label class="field">
          <span>Khoảng giá</span>
          <select id="tim-gia" v-model="price">
            <option value="">Mọi mức giá</option>
            <option v-for="r in PRICE_RANGES" :key="r.id" :value="r.id">{{ r.label }}</option>
          </select>
        </label>
        <button type="submit" class="btn btn-primary go" :disabled="!count" aria-live="polite">
          <template v-if="count">Xem {{ count }} dự án <PhArrowRight :size="16" aria-hidden="true" /></template>
          <template v-else>Chưa có dự án phù hợp</template>
        </button>
      </form>
    </div>
  </section>
</template>

<style scoped>
.quick {
  border-bottom: 1px solid var(--line);
}

.quick-inner {
  display: grid;
  gap: 20px;
  padding-block: 28px 32px;
}

.quick-head {
  display: grid;
  gap: 4px;
}

h2 {
  margin: 0;
  font: 500 var(--text-h3) / 1.15 var(--font-display);
}

.quick-head p {
  margin: 0;
  color: var(--ink-2);
  font-size: 15px;
}

.quick-form {
  display: grid;
  gap: 14px;
}

.field {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.field span {
  color: var(--ink-2);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

select {
  width: 100%;
  min-height: 50px;
  padding: 0 40px 0 14px;
  border: 1px solid var(--line);
  border-radius: 0;
  background: var(--surface);
  color: var(--ink);
  font: 400 15px var(--font);
}

select:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.go {
  white-space: nowrap;
}

/* Nút khoá khi không có dự án nào khớp: không phải đang tải nên không dùng con trỏ chờ */
.go[disabled] {
  cursor: not-allowed;
}

@media (min-width: 640px) {
  .quick-form {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .go {
    grid-column: 1 / -1;
  }
}

@media (min-width: 1024px) {
  .quick-inner {
    grid-template-columns: minmax(180px, 0.7fr) 3fr;
    align-items: end;
    gap: 40px;
  }

  .quick-form {
    grid-template-columns: repeat(3, minmax(0, 1fr)) auto;
    align-items: end;
  }

  .go {
    grid-column: auto;
    min-width: 200px;
  }
}
</style>
