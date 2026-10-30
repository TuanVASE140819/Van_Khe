<script setup lang="ts">
import { PhList, PhX } from '@phosphor-icons/vue'
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { headerOverPhoto } from '@/lib/header'

const LINKS = [
  { to: '/du-an', label: 'Dự án' },
  { to: '/#noi-bat', label: 'Vân Khê Riverside' },
  { to: '/#tien-do', label: 'Tiến độ' },
]

const route = useRoute()
const open = ref(false)
const panel = ref<HTMLElement | null>(null)

function onKey(event: KeyboardEvent): void {
  if (event.key === 'Escape') open.value = false
}

watch(open, async (value) => {
  document.body.style.overflow = value ? 'hidden' : ''
  if (value) {
    window.addEventListener('keydown', onKey)
    await nextTick()
    panel.value?.querySelector<HTMLElement>('a')?.focus()
  } else {
    window.removeEventListener('keydown', onKey)
  }
})
watch(() => route.fullPath, () => (open.value = false))
onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <header class="header" :class="{ 'over-photo': headerOverPhoto && !open }">
    <div class="container bar">
      <RouterLink to="/" class="brand" aria-label="Vân Khê Land, về trang chủ">
        <span class="brand-name">Vân Khê</span><span class="brand-sub">Land</span>
      </RouterLink>
      <nav class="nav" aria-label="Điều hướng chính">
        <RouterLink
          v-for="link in LINKS"
          :key="link.to"
          :to="link.to"
          class="nav-link"
          :exact-active-class="link.to.includes('#') ? '' : undefined"
          >{{ link.label }}</RouterLink
        >
      </nav>
      <RouterLink to="/dang-ky-tu-van" class="btn btn-line cta">Đăng ký tư vấn</RouterLink>
      <button type="button" class="menu-btn" :aria-expanded="open" aria-controls="menu-di-dong" aria-label="Mở menu" @click="open = true">
        <PhList :size="26" />
      </button>
    </div>

    <!-- Đưa ra body: header có backdrop-filter nên phần tử fixed bên trong bị giới hạn trong chiều cao header -->
    <Teleport to="body">
      <Transition name="sheet">
        <div v-if="open" id="menu-di-dong" ref="panel" class="mobile" role="dialog" aria-modal="true" aria-label="Menu">
          <div class="container mobile-bar">
            <RouterLink to="/" class="brand"><span class="brand-name">Vân Khê</span><span class="brand-sub">Land</span></RouterLink>
            <button type="button" class="menu-btn" aria-label="Đóng menu" @click="open = false"><PhX :size="26" /></button>
          </div>
          <nav class="container mobile-nav" aria-label="Điều hướng chính">
            <RouterLink v-for="link in LINKS" :key="link.to" :to="link.to">{{ link.label }}</RouterLink>
            <RouterLink to="/dang-ky-tu-van">Đăng ký tư vấn</RouterLink>
          </nav>
        </div>
      </Transition>
    </Teleport>
  </header>
</template>

<style scoped>
.header {
  position: fixed;
  inset: 0 0 auto;
  z-index: 20;
  color: var(--ink);
  background: color-mix(in srgb, var(--bg) 94%, transparent);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--line);
  transition:
    background-color 0.35s var(--ease),
    color 0.35s var(--ease),
    border-color 0.35s var(--ease);
}

/* Nằm trên ảnh hero: trong suốt, chữ sáng; có lớp tối mờ phía trên để chữ đọc được */
.header.over-photo {
  color: #f3f4f1;
  background: linear-gradient(rgb(8 12 10 / 45%), transparent);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border-bottom-color: transparent;
}

.bar {
  display: flex;
  align-items: center;
  gap: 32px;
  height: var(--nav-h);
}

.brand {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  color: inherit;
  text-decoration: none;
}

.brand-name {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 600;
  letter-spacing: 0.01em;
  line-height: 1;
}

.brand-sub {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.nav {
  display: none;
  gap: 32px;
  margin-left: auto;
}

.nav-link {
  color: inherit;
  font-size: 15px;
  text-decoration: none;
  white-space: nowrap;
  opacity: 0.85;
}

.nav-link:hover,
.nav-link.router-link-exact-active {
  opacity: 1;
  text-decoration: underline;
}

.cta {
  display: none;
  min-height: 44px;
  padding: 0 20px;
  color: inherit;
}

.over-photo .cta:hover {
  background: #f3f4f1;
  color: #16211c;
}

.menu-btn {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  margin-left: auto;
  border: 0;
  background: none;
  color: inherit;
  cursor: pointer;
}

@media (min-width: 960px) {
  .nav,
  .cta {
    display: flex;
  }

  .menu-btn {
    display: none;
  }
}

.mobile {
  position: fixed;
  inset: 0;
  z-index: 30;
  background: var(--bg);
  color: var(--ink);
  overflow-y: auto;
}

.mobile-bar {
  display: flex;
  align-items: center;
  height: var(--nav-h);
}

.mobile-nav {
  display: grid;
  padding-top: 32px;
  padding-bottom: 32px;
}

.mobile-nav a {
  padding: 16px 0;
  border-bottom: 1px solid var(--line);
  font-family: var(--font-display);
  font-size: 34px;
  font-weight: 500;
  text-decoration: none;
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.25s var(--ease);
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .header,
  .sheet-enter-active,
  .sheet-leave-active {
    transition: none;
  }
}
</style>
