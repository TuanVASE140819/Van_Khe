<script setup lang="ts">
import type { PriceRow } from '@/data/catalog'
import { formatPrice, keepTogether } from '@/lib/format'

defineProps<{ prices: PriceRow[]; formAnchor: string }>()
</script>

<template>
  <div v-if="prices.length" class="table-wrap">
    <table>
      <caption class="visually-hidden">Bảng giá tham khảo theo loại căn</caption>
      <thead>
        <tr>
          <th scope="col">Loại căn</th>
          <th scope="col">Diện tích</th>
          <th scope="col" class="num">Giá từ</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in prices" :key="row.unit">
          <th scope="row">{{ row.unit }}</th>
          <td>{{ keepTogether(row.area) }}</td>
          <td class="num"><strong>{{ formatPrice(row.from) }}</strong></td>
        </tr>
      </tbody>
    </table>
    <p class="note muted">Giá tham khảo (dữ liệu mẫu). Bảng giá chính thức và mặt bằng từng căn gửi kèm khi tư vấn.</p>
  </div>
  <div v-else class="empty">
    <p class="empty-title">Liên hệ để nhận báo giá</p>
    <p class="muted">Dự án chưa công bố giá. Đăng ký để nhận bảng giá ngay khi mở bán.</p>
    <a :href="formAnchor" class="btn btn-primary">Đăng ký tư vấn</a>
  </div>
</template>

<style scoped>
.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 16px;
}

th,
td {
  padding: 14px 12px;
  text-align: left;
  border-bottom: 1px solid var(--line);
}

thead th {
  color: var(--ink-2);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border-bottom-color: var(--ink);
}

tbody th {
  font-weight: 500;
}

tbody td strong {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 500;
}

.num {
  text-align: right;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.note {
  margin-top: 12px;
  font-size: 14px;
}

.empty {
  display: grid;
  justify-items: start;
  gap: 10px;
  padding: 24px;
  border-top: 1px solid var(--ink);
}

.empty-title {
  font-family: var(--font-display);
  font-size: 1.9rem;
  line-height: 1.1;
}
</style>
