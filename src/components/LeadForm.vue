<script setup lang="ts">
import { PhCheckCircle, PhWarningCircle } from '@phosphor-icons/vue'
import { computed, nextTick, ref } from 'vue'
import { useRoute } from 'vue-router'
import { company, projects } from '@/data/catalog'
import { SLOT_LABEL, emptyLead, submitLead, todayVn, validateLead, type LeadErrors, type LeadForm, type TimeSlot } from '@/lib/lead'

// Form đăng ký tư vấn / đặt lịch xem nhà. Lỗi hiện ngay dưới từng ô; kết quả đọc qua aria-live.
// tone "block": đặt trên khối màu xanh rừng (chữ sáng, ô nhập trắng)
const props = withDefaults(defineProps<{ project?: string; idPrefix?: string; tone?: 'default' | 'block' }>(), { project: '', idPrefix: 'lead', tone: 'default' })

const route = useRoute()
const form = ref<LeadForm>(emptyLead(props.project))
const errors = ref<LeadErrors>({})
const state = ref<'idle' | 'sending' | 'done' | 'failed'>('idle')
const failure = ref('')
const today = todayVn()
const formEl = ref<HTMLFormElement | null>(null)
const id = (field: string) => `${props.idPrefix}-${field}`
const describedBy = (field: keyof LeadForm) => (errors.value[field] ? id(`${field}-error`) : undefined)
const tel = company.hotline.replace(/\s/g, '')
const slots = Object.entries(SLOT_LABEL) as [TimeSlot, string][]
const chosen = computed(() => projects.find((p) => p.slug === form.value.project)?.name ?? '')

async function submit(): Promise<void> {
  errors.value = validateLead(form.value, today)
  if (Object.keys(errors.value).length) {
    await nextTick()
    formEl.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
    return
  }
  state.value = 'sending'
  try {
    const { consent: _consent, ...data } = form.value
    await submitLead({ ...data, submittedAt: new Date().toISOString(), page: route.fullPath }, { endpoint: import.meta.env.VITE_LEAD_ENDPOINT })
    state.value = 'done'
  } catch (error) {
    failure.value = error instanceof Error ? error.message : 'Lỗi không xác định'
    state.value = 'failed'
  }
}

function reset(): void {
  form.value = emptyLead(props.project)
  errors.value = {}
  state.value = 'idle'
}
</script>

<template>
  <div class="lead-form" :class="tone">
    <div v-if="state === 'done'" class="result ok" role="status" aria-live="polite">
      <PhCheckCircle :size="36" aria-hidden="true" />
      <p class="result-title">Cảm ơn, chúng tôi sẽ gọi lại trong 24 giờ</p>
      <p class="note">
        <template v-if="form.intent === 'xem-nha'">Lịch xem nhà {{ chosen ? `dự án ${chosen} ` : '' }}sẽ được xác nhận qua điện thoại.</template>
        <template v-else>Chuyên viên tư vấn sẽ liên hệ số {{ form.phone }}.</template>
      </p>
      <button type="button" class="btn btn-line" @click="reset">Gửi yêu cầu khác</button>
    </div>

    <form v-else ref="formEl" novalidate @submit.prevent="submit">
      <div class="row">
        <div class="field">
          <label :for="id('name')">Họ và tên</label>
          <input :id="id('name')" v-model="form.name" type="text" autocomplete="name" maxlength="60" :aria-invalid="!!errors.name" :aria-describedby="describedBy('name')" />
          <p v-if="errors.name" :id="id('name-error')" class="error"><PhWarningCircle :size="16" aria-hidden="true" />{{ errors.name }}</p>
        </div>
        <div class="field">
          <label :for="id('phone')">Số điện thoại</label>
          <input :id="id('phone')" v-model="form.phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="16" :aria-invalid="!!errors.phone" :aria-describedby="describedBy('phone')" />
          <p v-if="errors.phone" :id="id('phone-error')" class="error"><PhWarningCircle :size="16" aria-hidden="true" />{{ errors.phone }}</p>
        </div>
      </div>

      <div class="row">
        <div class="field">
          <label :for="id('email')">Email <span class="optional">(không bắt buộc)</span></label>
          <input :id="id('email')" v-model="form.email" type="email" autocomplete="email" :aria-invalid="!!errors.email" :aria-describedby="describedBy('email')" />
          <p v-if="errors.email" :id="id('email-error')" class="error"><PhWarningCircle :size="16" aria-hidden="true" />{{ errors.email }}</p>
        </div>
        <div class="field">
          <label :for="id('project')">Dự án quan tâm</label>
          <select :id="id('project')" v-model="form.project">
            <option value="">Chưa chọn, cần tư vấn thêm</option>
            <option v-for="p in projects" :key="p.slug" :value="p.slug">{{ p.name }} ({{ p.district }})</option>
          </select>
        </div>
      </div>

      <fieldset class="field intent">
        <legend>Bạn cần</legend>
        <label class="radio"><input v-model="form.intent" type="radio" value="goi-lai" :name="id('intent')" /> Được gọi lại tư vấn</label>
        <label class="radio"><input v-model="form.intent" type="radio" value="xem-nha" :name="id('intent')" /> Đặt lịch xem nhà mẫu</label>
      </fieldset>

      <div v-if="form.intent === 'xem-nha'" class="row">
        <div class="field">
          <label :for="id('visitDate')">Ngày xem nhà</label>
          <input :id="id('visitDate')" v-model="form.visitDate" type="date" :min="today" :aria-invalid="!!errors.visitDate" :aria-describedby="describedBy('visitDate')" />
          <p v-if="errors.visitDate" :id="id('visitDate-error')" class="error"><PhWarningCircle :size="16" aria-hidden="true" />{{ errors.visitDate }}</p>
        </div>
        <div class="field">
          <label :for="id('slot')">Khung giờ</label>
          <select :id="id('slot')" v-model="form.slot">
            <option v-for="[value, label] in slots" :key="value" :value="value">{{ label }}</option>
          </select>
        </div>
      </div>

      <div class="field">
        <label :for="id('note')">Ghi chú <span class="optional">(không bắt buộc)</span></label>
        <textarea :id="id('note')" v-model="form.note" rows="3" maxlength="500" :aria-invalid="!!errors.note" :aria-describedby="describedBy('note')" />
        <p v-if="errors.note" :id="id('note-error')" class="error"><PhWarningCircle :size="16" aria-hidden="true" />{{ errors.note }}</p>
      </div>

      <div class="field">
        <label class="check">
          <input v-model="form.consent" type="checkbox" :aria-invalid="!!errors.consent" :aria-describedby="describedBy('consent')" />
          <span>Tôi đồng ý để {{ company.name }} liên hệ tư vấn qua số điện thoại và email đã cung cấp.</span>
        </label>
        <p v-if="errors.consent" :id="id('consent-error')" class="error"><PhWarningCircle :size="16" aria-hidden="true" />{{ errors.consent }}</p>
      </div>

      <div v-if="state === 'failed'" class="result failed" role="alert">
        <PhWarningCircle :size="22" aria-hidden="true" />
        <p>Chưa gửi được ({{ failure }}). Thử lại, hoặc gọi <a :href="`tel:${tel}`">{{ company.hotline }}</a>.</p>
      </div>

      <button type="submit" class="btn btn-primary submit" :disabled="state === 'sending'">
        {{ state === 'sending' ? 'Đang gửi…' : 'Gửi yêu cầu' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.lead-form {
  --f-label: var(--ink);
  --f-muted: var(--ink-2);
  --f-input: var(--surface);
  --f-border: var(--line);
  --f-error: var(--danger);
  --f-btn: var(--accent);
  --f-btn-ink: var(--on-accent);
  color: var(--f-label);
}

.lead-form.block {
  --f-label: var(--on-block);
  --f-muted: var(--on-block-2);
  --f-input: #fbfcfb;
  --f-border: transparent;
  --f-error: var(--danger-on-block);
  --f-btn: var(--on-block);
  --f-btn-ink: var(--block);
}

form {
  display: grid;
  gap: 20px;
}

.row {
  display: grid;
  gap: 20px;
}

@media (min-width: 640px) {
  .row {
    grid-template-columns: 1fr 1fr;
  }
}

.field {
  display: grid;
  gap: 8px;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}

label,
legend {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.02em;
}

legend {
  padding: 0;
  margin-bottom: 8px;
}

.optional {
  color: var(--f-muted);
  font-weight: 400;
}

input:not([type='radio'], [type='checkbox']),
select,
textarea {
  width: 100%;
  min-height: 50px;
  padding: 12px 14px;
  border: 1px solid var(--f-border);
  border-radius: 0;
  background: var(--f-input);
  color: #16211c;
  font: 400 16px/1.4 var(--font);
}

.lead-form.default input:not([type='radio'], [type='checkbox']),
.lead-form.default select,
.lead-form.default textarea {
  color: var(--ink);
}

textarea {
  resize: vertical;
}

input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: 2px solid var(--f-label);
  outline-offset: 2px;
}

[aria-invalid='true']:not([type='checkbox']) {
  border-color: var(--f-error);
  box-shadow: inset 0 0 0 1px var(--f-error);
}

.intent {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 28px;
}

.intent legend {
  width: 100%;
}

.radio,
.check {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-weight: 400;
  font-size: 15px;
  cursor: pointer;
}

.radio input,
.check input {
  width: 20px;
  height: 20px;
  margin: 2px 0 0;
  accent-color: var(--f-btn);
  flex: none;
}

.error {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--f-error);
  font-size: 14px;
  font-weight: 500;
}

.submit {
  justify-self: start;
  min-width: 200px;
  background: var(--f-btn);
  color: var(--f-btn-ink);
}

.submit:hover {
  filter: brightness(1.08);
}

.result {
  display: grid;
  justify-items: start;
  gap: 12px;
}

.result.ok {
  padding: 32px;
  border: 1px solid var(--f-label);
}

.note {
  color: var(--f-muted);
}

.result-title {
  font-family: var(--font-display);
  font-size: 2rem;
  line-height: 1.1;
}

.result.ok .btn {
  color: var(--f-label);
}

.result.failed {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 16px;
  border: 1px solid var(--f-error);
  color: var(--f-error);
}

.result.failed a {
  color: inherit;
}
</style>
