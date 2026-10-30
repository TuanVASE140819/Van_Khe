<script setup lang="ts">
import { AMENITY_LABEL, type AmenityId, type AmenityPhoto } from '@/data/catalog'

// Tiện ích dạng danh sách chữ chia cột: không icon trang trí. Có ảnh thì hàng ảnh tiện ích nằm trên danh sách.
defineProps<{ amenities: AmenityId[]; photos?: AmenityPhoto[] }>()
</script>

<template>
  <div class="amenity-block">
    <div v-if="photos?.length" class="photos">
      <figure v-for="(photo, index) in photos" :key="photo.src" v-reveal="index * 100">
        <div class="media"><img :src="photo.src" :alt="photo.alt" width="1200" height="900" loading="lazy" decoding="async" /></div>
        <figcaption>{{ photo.caption }}</figcaption>
      </figure>
      <p class="caption">Ảnh minh họa</p>
    </div>
    <ul class="amenities">
      <li v-for="id in amenities" :key="id">{{ AMENITY_LABEL[id] }}</li>
    </ul>
  </div>
</template>

<style scoped>
.amenity-block {
  display: grid;
  gap: 36px;
  min-width: 0;
}

.photos {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr));
  gap: 16px;
}

.photos figure {
  margin: 0;
  display: grid;
  gap: 10px;
}

.photos .media {
  aspect-ratio: 4 / 3;
}

.photos figcaption {
  font-size: 15px;
}

.photos .caption {
  grid-column: 1 / -1;
  margin-top: 0;
}

.amenities {
  list-style: none;
  margin: 0;
  padding: 0;
  columns: 2 220px;
  column-gap: 40px;
}

li {
  break-inside: avoid;
  padding: 12px 0;
  border-top: 1px solid var(--line);
  font-size: 17px;
}
</style>
