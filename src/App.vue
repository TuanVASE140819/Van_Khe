<script setup lang="ts">
import { useRoute } from 'vue-router'
import SiteFooter from './components/SiteFooter.vue'
import SiteHeader from './components/SiteHeader.vue'

// Trang chủ cho ảnh hero chạy dưới thanh điều hướng; các trang khác chừa chỗ cho thanh cố định.
const route = useRoute()
</script>

<template>
  <a class="skip-link" href="#noi-dung">Bỏ qua tới nội dung</a>
  <SiteHeader />
  <main id="noi-dung" tabindex="-1" :class="{ 'under-header': route.name !== 'home' }">
    <RouterView />
  </main>
  <SiteFooter />
</template>

<style scoped>
main {
  outline: none;
  min-height: 60vh;
}

.under-header {
  padding-top: var(--nav-h);
}
</style>
