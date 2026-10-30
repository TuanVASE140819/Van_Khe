<script setup lang="ts">
import { PhFunnel, PhX } from '@phosphor-icons/vue'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProjectCard from '@/components/ProjectCard.vue'
import { STATUS_LABEL, TYPE_LABEL, cities, projects, type ProjectStatus, type ProjectType } from '@/data/catalog'
import { PRICE_RANGES, SORTS, activeFilterCount, applyFilters, emptyFilters, filtersFromQuery, filtersToQuery, type Filters } from '@/lib/filters'
import { setSeo } from '@/lib/seo'
import { seoProjects } from '@/lib/seo-pages'

const route = useRoute()
const router = useRouter()
const filters = computed<Filters>(() => filtersFromQuery(route.query, cities))
const results = computed(() => applyFilters(projects, filters.value))
const active = computed(() => activeFilterCount(filters.value))
const sheetOpen = ref(false)

const TYPES = Object.entries(TYPE_LABEL) as [ProjectType, string][]
const STATUSES = Object.entries(STATUS_LABEL) as [ProjectStatus, string][]
// Tên tỉnh thành không bị ngắt giữa chừng ("Hà / Nội").
const cityList = cities.map((city) => city.replaceAll(' ', '\u00a0')).join(', ')

function update(patch: Partial<Filters>): void {
  void router.replace({ query: filtersToQuery({ ...filters.value, ...patch }) })
}
function toggleType(type: ProjectType): void {
  const types = filters.value.types.includes(type) ? filters.value.types.filter((t) => t !== type) : [...filters.value.types, type]
  update({ types })
}
function clear(): void {
  void router.replace({ query: filtersToQuery({ ...emptyFilters(), sort: filters.value.sort }) })
}

watch(sheetOpen, (open) => (document.body.style.overflow = open ? 'hidden' : ''))
onMounted(() => setSeo(seoProjects()))
</script>

<template>
  <div class="container page">
    <header class="head">
      <div>
        <h1>Dự án</h1>
        <p class="lead">{{ results.length }} dự án{{ active ? ' khớp bộ lọc' : '' }}. Căn hộ, nhà phố và biệt thự tại {{ cityList }}.</p>
      </div>
      <div class="tools">
        <button type="button" class="btn btn-line filter-btn" :aria-expanded="sheetOpen" aria-controls="bo-loc" @click="sheetOpen = true">
          <PhFunnel :size="18" aria-hidden="true" /> Bộ lọc<template v-if="active"> ({{ active }})</template>
        </button>
        <label class="sort">
          <span class="visually-hidden">Sắp xếp</span>
          <select :value="filters.sort" @change="update({ sort: ($event.target as HTMLSelectElement).value as Filters['sort'] })">
            <option v-for="s in SORTS" :key="s.id" :value="s.id">{{ s.label }}</option>
          </select>
        </label>
      </div>
    </header>

    <div class="layout">
      <aside id="bo-loc" class="filters" :class="{ open: sheetOpen }" aria-label="Bộ lọc dự án">
        <div class="sheet-head">
          <p class="sheet-title">Bộ lọc</p>
          <button type="button" class="close" aria-label="Đóng bộ lọc" @click="sheetOpen = false"><PhX :size="22" /></button>
        </div>

        <label class="field">
          <span>Khu vực</span>
          <select :value="filters.city ?? ''" @change="update({ city: ($event.target as HTMLSelectElement).value || null })">
            <option value="">Tất cả khu vực</option>
            <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
          </select>
        </label>

        <fieldset class="field">
          <legend>Loại hình</legend>
          <div class="toggles">
            <button
              v-for="[value, label] in TYPES"
              :key="value"
              type="button"
              class="toggle"
              :aria-pressed="filters.types.includes(value)"
              @click="toggleType(value)"
            >
              {{ label }}
            </button>
          </div>
        </fieldset>

        <label class="field">
          <span>Khoảng giá</span>
          <select :value="filters.price ?? ''" @change="update({ price: (($event.target as HTMLSelectElement).value || null) as Filters['price'] })">
            <option value="">Mọi mức giá</option>
            <option v-for="r in PRICE_RANGES" :key="r.id" :value="r.id">{{ r.label }}</option>
          </select>
        </label>

        <label class="field">
          <span>Trạng thái</span>
          <select :value="filters.status ?? ''" @change="update({ status: (($event.target as HTMLSelectElement).value || null) as Filters['status'] })">
            <option value="">Tất cả</option>
            <option v-for="[value, label] in STATUSES" :key="value" :value="value">{{ label }}</option>
          </select>
        </label>

        <div class="filter-actions">
          <button type="button" class="btn btn-line" :disabled="!active" @click="clear">Xoá bộ lọc</button>
          <button type="button" class="btn btn-primary apply" @click="sheetOpen = false">Xem {{ results.length }} dự án</button>
        </div>
      </aside>
      <div v-if="sheetOpen" class="scrim" aria-hidden="true" @click="sheetOpen = false" />

      <section aria-live="polite" class="results">
        <ul v-if="results.length" class="grid">
          <li v-for="(project, index) in results" :key="project.slug">
            <ProjectCard :project="project" :eager="index < 3" />
          </li>
        </ul>
        <div v-else class="empty">
          <p class="empty-title">Chưa có dự án phù hợp</p>
          <p class="muted">Thử bỏ bớt điều kiện lọc, hoặc để lại số điện thoại để được gợi ý dự án.</p>
          <div class="empty-actions">
            <button type="button" class="btn btn-primary" @click="clear">Xoá bộ lọc</button>
            <RouterLink to="/dang-ky-tu-van" class="btn btn-line">Đăng ký tư vấn</RouterLink>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding-top: clamp(40px, 6vw, 80px);
  padding-bottom: var(--section);
}

.head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 40px;
  padding-bottom: 32px;
  border-bottom: 1px solid var(--ink);
}

h1 {
  font-size: var(--text-display);
}

.head .lead {
  margin-top: 14px;
}

.tools {
  display: flex;
  gap: 10px;
}

select {
  min-height: 48px;
  padding: 0 40px 0 14px;
  border: 1px solid var(--line);
  border-radius: 0;
  background: var(--surface);
  color: var(--ink);
  font: 400 15px var(--font);
  width: 100%;
}

.sort select {
  width: auto;
}

.layout {
  display: grid;
  gap: 32px;
}

@media (min-width: 1024px) {
  .layout {
    grid-template-columns: 250px minmax(0, 1fr);
    gap: 56px;
    align-items: start;
  }

  .filter-btn,
  .sheet-head,
  .apply,
  .scrim {
    display: none !important;
  }

  .filters {
    position: sticky;
    top: calc(var(--nav-h) + 24px);
  }
}

.filters {
  display: grid;
  gap: 24px;
  background: var(--bg);
}

/* Điện thoại / máy tính bảng: bộ lọc là tấm trượt từ dưới lên */
@media (max-width: 1023px) {
  .filters {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 40;
    max-height: 85dvh;
    overflow-y: auto;
    padding: 24px var(--gutter);
    border-top: 1px solid var(--ink);
    transform: translateY(100%);
    visibility: hidden;
    transition:
      transform 0.3s var(--ease),
      visibility 0.3s;
  }

  .filters.open {
    transform: none;
    visibility: visible;
  }

  .scrim {
    position: fixed;
    inset: 0;
    z-index: 35;
    background: var(--scrim);
  }
}

@media (prefers-reduced-motion: reduce) {
  .filters {
    transition: none;
  }
}

.sheet-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sheet-title {
  font-family: var(--font-display);
  font-size: 1.8rem;
}

.close {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 1px solid var(--line);
  background: none;
  color: var(--ink);
  cursor: pointer;
}

.field {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 14px;
  font-weight: 500;
}

legend {
  padding: 0;
  margin-bottom: 8px;
}

.toggles {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.toggle {
  min-height: 42px;
  padding: 0 16px;
  border: 1px solid var(--line);
  border-radius: 0;
  background: transparent;
  color: var(--ink);
  font: 400 14px var(--font);
  cursor: pointer;
}

.toggle[aria-pressed='true'] {
  border-color: var(--accent);
  background: var(--accent);
  color: var(--on-accent);
}

.filter-actions {
  display: grid;
  gap: 10px;
}

.grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
  gap: 48px 28px;
}

.empty {
  display: grid;
  justify-items: start;
  gap: 14px;
  padding: 48px 0;
  border-top: 1px solid var(--line);
}

.empty-title {
  font-family: var(--font-display);
  font-size: 2rem;
  line-height: 1.1;
}

.empty-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;
}
</style>
