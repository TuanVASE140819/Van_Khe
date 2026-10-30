<script setup lang="ts">
import { company, projects } from '@/data/catalog'

const year = new Date().getFullYear()
const tel = company.hotline.replace(/\s/g, '')
</script>

<template>
  <footer class="footer">
    <div class="container top">
      <div>
        <RouterLink to="/" class="brand"><span class="brand-name">Vân Khê</span><span class="brand-sub">Land</span></RouterLink>
        <p class="muted about">Nhà ở tại TP.HCM, Bình Dương, Long An, Đà Nẵng và Hà Nội.</p>
      </div>
      <div>
        <p class="heading">Liên hệ</p>
        <p><a :href="`tel:${tel}`">{{ company.hotline }}</a></p>
        <p><a :href="`mailto:${company.email}`">{{ company.email }}</a></p>
        <p class="muted">{{ company.address }}</p>
        <p class="muted">{{ company.hours }}</p>
      </div>
      <nav aria-label="Dự án">
        <p class="heading">Dự án</p>
        <ul>
          <li v-for="p in projects" :key="p.slug">
            <RouterLink :to="`/du-an/${p.slug}`">{{ p.name }}</RouterLink>
            <span class="muted">{{ p.district }}</span>
          </li>
        </ul>
      </nav>
    </div>
    <div class="container bottom">
      <p>© {{ year }} {{ company.name }}</p>
      <p>Website mẫu: tên dự án, giá, số liên hệ là dữ liệu minh họa. Ảnh minh họa từ Unsplash.</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid var(--line);
  padding-top: 72px;
}

.top {
  display: grid;
  gap: 40px;
}

@media (min-width: 768px) {
  .top {
    grid-template-columns: 1.3fr 1fr 1.2fr;
  }
}

.brand {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  text-decoration: none;
}

.brand-name {
  font-family: var(--font-display);
  font-size: 34px;
  font-weight: 600;
  line-height: 1;
}

.brand-sub {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.about {
  margin-top: 16px;
  max-width: 30ch;
}

.heading {
  margin-bottom: 14px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.top p + p {
  margin-top: 6px;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
}

li {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

a {
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.bottom {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px 24px;
  margin-top: 64px;
  padding-top: 20px;
  padding-bottom: 32px;
  border-top: 1px solid var(--line);
  color: var(--ink-2);
  font-size: 13px;
}
</style>
