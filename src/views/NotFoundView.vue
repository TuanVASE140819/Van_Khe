<script setup lang="ts">
import { onMounted } from 'vue'
import { setSeo } from '@/lib/seo'
import { seoNotFound } from '@/lib/seo-pages'

onMounted(() => setSeo(seoNotFound()))
</script>

<template>
  <div class="container page">
    <h1>Không tìm thấy trang</h1>
    <p class="lead">Trang không tồn tại hoặc dự án đã đổi địa chỉ.</p>
    <div class="actions">
      <RouterLink to="/du-an" class="btn btn-primary">Xem dự án</RouterLink>
      <RouterLink to="/" class="btn btn-line">Về trang chủ</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.page {
  display: grid;
  justify-items: start;
  gap: 18px;
  padding-top: var(--section);
  padding-bottom: var(--section);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
