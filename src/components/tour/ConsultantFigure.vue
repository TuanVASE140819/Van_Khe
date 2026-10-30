<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { GROUND_Y, HIP_Y, STAND, bodyDrop, type Pose } from '@/lib/rig'

// Nhân vật chuyên viên tư vấn vẽ bằng SVG, nhìn nghiêng 3/4 sang phải.
// Mỗi khớp là một nhóm <g> quay quanh gốc của nó; apply(pose) đặt góc trực tiếp lên DOM
// (không qua state của Vue) để chạy mượt 60 khung hình khi cuộn.

const NEAR_SHOULDER = [-16, 168] as const
const FAR_SHOULDER = [20, 166] as const
const NEAR_HIP = [-8, HIP_Y] as const
const FAR_HIP = [10, HIP_Y - 2] as const

const body = ref<SVGGElement | null>(null)
const upper = ref<SVGGElement | null>(null)
const farArmWrap = ref<SVGGElement | null>(null)
const head = ref<SVGGElement | null>(null)
const joints = {
  nearHip: ref<SVGGElement | null>(null),
  nearKnee: ref<SVGGElement | null>(null),
  nearAnkle: ref<SVGGElement | null>(null),
  farHip: ref<SVGGElement | null>(null),
  farKnee: ref<SVGGElement | null>(null),
  farAnkle: ref<SVGGElement | null>(null),
  nearShoulder: ref<SVGGElement | null>(null),
  nearElbow: ref<SVGGElement | null>(null),
  nearWrist: ref<SVGGElement | null>(null),
  farShoulder: ref<SVGGElement | null>(null),
  farElbow: ref<SVGGElement | null>(null),
  farWrist: ref<SVGGElement | null>(null),
}
const { nearHip, nearKnee, nearAnkle, farHip, farKnee, farAnkle, nearShoulder, nearElbow, nearWrist, farShoulder, farElbow, farWrist } = joints

const set = (el: SVGGElement | null, transform: string) => el?.setAttribute('transform', transform)
const f = (n: number) => n.toFixed(2)

function apply(pose: Pose): void {
  set(body.value, `translate(0 ${f(bodyDrop(pose))})`)
  const lean = `rotate(${f(pose.lean)} 0 ${HIP_Y})`
  set(upper.value, lean)
  set(farArmWrap.value, lean)
  set(head.value, `rotate(${f(pose.headTilt)} 6 128)`)
  set(nearHip.value, `translate(${NEAR_HIP[0]} ${NEAR_HIP[1]}) rotate(${f(pose.nearThigh)})`)
  set(nearKnee.value, `translate(0 120) rotate(${f(pose.nearKnee)})`)
  set(nearAnkle.value, `translate(0 113) rotate(${f(pose.nearFoot)})`)
  set(farHip.value, `translate(${FAR_HIP[0]} ${FAR_HIP[1]}) rotate(${f(pose.farThigh)})`)
  set(farKnee.value, `translate(0 120) rotate(${f(pose.farKnee)})`)
  set(farAnkle.value, `translate(0 113) rotate(${f(pose.farFoot)})`)
  set(nearShoulder.value, `translate(${NEAR_SHOULDER[0]} ${NEAR_SHOULDER[1]}) rotate(${f(pose.nearShoulder)})`)
  set(nearElbow.value, `translate(0 86) rotate(${f(pose.nearElbow)})`)
  set(nearWrist.value, `translate(0 62) rotate(${f(pose.nearWrist)})`)
  set(farShoulder.value, `translate(${FAR_SHOULDER[0]} ${FAR_SHOULDER[1]}) rotate(${f(pose.farShoulder)})`)
  set(farElbow.value, `translate(0 86) rotate(${f(pose.farElbow)})`)
  set(farWrist.value, `translate(0 62) rotate(${f(pose.farWrist)})`)
}

const props = withDefaults(defineProps<{ pose?: Pose }>(), { pose: () => STAND })
onMounted(() => apply(props.pose))
defineExpose({ apply })
</script>

<template>
  <svg class="figure" viewBox="-170 40 340 520" role="img" aria-label="Chuyên viên tư vấn (hình minh họa)">
    <ellipse class="shadow" cx="0" :cy="GROUND_Y" rx="62" ry="7" />
    <g ref="body">
      <g class="breathe">
        <!-- Tay xa: sau lưng, sau cả chân -->
        <g ref="farArmWrap">
          <g ref="farShoulder">
            <rect class="sleeve-far" x="-11" y="-12" width="22" height="100" rx="11" />
            <g ref="farElbow">
              <rect class="sleeve-far" x="-10" y="-10" width="20" height="66" rx="10" />
              <rect class="cuff-far" x="-9" y="52" width="18" height="8" rx="3" />
              <g ref="farWrist">
                <g transform="rotate(-8)">
                  <rect class="folder" x="-2" y="-4" width="34" height="46" />
                  <rect class="folder-band" x="-2" y="-4" width="34" height="9" />
                </g>
                <path class="skin-far" d="M-7 -1C-9 7-8 17-3 21C3 24 8 19 8 11C8 6 7 2 6 -1Z" />
              </g>
            </g>
          </g>
        </g>

        <!-- Chân xa -->
        <g ref="farHip">
          <rect class="pants-far" x="-15" y="-14" width="30" height="138" rx="15" />
          <g ref="farKnee">
            <rect class="pants-far" x="-13" y="-12" width="26" height="118" rx="13" />
            <g ref="farAnkle">
              <rect class="skin-far" x="-7" y="-12" width="13" height="14" rx="5" />
              <path class="shoe-far" d="M-11 -5C-11 -9 7 -9 12 -6L24 2C31 5 33 9 32 13L-12 13C-13 8-12 0-11 -5Z" />
            </g>
          </g>
        </g>

        <!-- Chân gần -->
        <g ref="nearHip">
          <rect class="pants" x="-15" y="-14" width="30" height="138" rx="15" />
          <g ref="nearKnee">
            <rect class="pants" x="-13" y="-12" width="26" height="118" rx="13" />
            <g ref="nearAnkle">
              <rect class="skin" x="-7" y="-12" width="13" height="14" rx="5" />
              <path class="shoe" d="M-11 -5C-11 -9 7 -9 12 -6L24 2C31 5 33 9 32 13L-12 13C-13 8-12 0-11 -5Z" />
            </g>
          </g>
        </g>

        <!-- Thân trên: áo vest, đầu, tay gần -->
        <g ref="upper">
          <rect class="skin" x="-2" y="128" width="18" height="34" rx="6" />
          <path class="skin-far" d="M-2 141C4 147 12 147 16 141L16 147C10 151 3 151 -2 147Z" />
          <path
            class="blazer"
            d="M-22 160C-10 153 12 153 24 160C31 166 33 186 31 204C29 228 23 248 22 262C24 284 28 304 29 322C10 328 -12 328 -27 320C-26 300 -22 280 -22 262C-24 244 -30 220 -29 198C-29 180 -28 166 -22 160Z"
          />
          <path class="shirt" d="M1 156L23 157L12 206Z" />
          <path class="lapel" d="M1 156L12 206L5 216L-7 172Z" />
          <path class="lapel" d="M23 157L12 206L20 212L31 174Z" />
          <path class="seam" d="M12 206L16 323" />
          <path class="seam" d="M-18 282L0 283" />
          <circle class="button" cx="15" cy="238" r="2.4" />
          <circle class="button" cx="16" cy="266" r="2.4" />
          <rect class="badge" x="-19" y="196" width="13" height="7" />
          <rect class="badge-line" x="-17" y="199" width="9" height="1.4" />

          <g ref="head">
            <g transform="translate(0 12)">
              <circle class="hair" cx="-25" cy="76" r="15" />
              <ellipse class="skin" cx="6" cy="100" rx="26" ry="31" />
              <path class="skin" d="M29 96C36 102 36 108 30 111Z" />
              <ellipse class="skin-far" cx="-13" cy="104" rx="5" ry="8" />
              <path
                class="hair"
                d="M33 90C31 70 15 61 -1 65C-20 69 -33 85 -31 106C-30 116 -25 124 -19 128L-15 112C-18 100 -13 90 -5 86C7 93 22 94 33 90Z"
              />
              <circle class="blush" cx="5" cy="111" r="5" />
              <circle class="blush" cx="27" cy="110" r="3.2" />
              <g class="eyes">
                <ellipse class="ink" cx="11" cy="100" rx="2.7" ry="3.5" />
                <ellipse class="ink" cx="25" cy="99" rx="2.1" ry="3.2" />
              </g>
              <path class="brow" d="M6 92Q11 89 16 91" />
              <path class="brow" d="M22 91Q25 89 28 90" />
              <path class="mouth" d="M13 116Q19 120 24 115" />
            </g>
          </g>

          <g ref="nearShoulder">
            <rect class="sleeve" x="-12" y="-12" width="24" height="100" rx="12" />
            <g ref="nearElbow">
              <rect class="sleeve" x="-11" y="-10" width="22" height="66" rx="11" />
              <rect class="cuff" x="-10" y="52" width="20" height="8" rx="3" />
              <g ref="nearWrist">
                <path class="skin" d="M-8 -1C-10 8-9 18-3 22C3 25 9 20 9 12C9 6 8 2 7 -1Z" />
                <path class="skin" d="M6 3C13 5 13 12 8 15Z" />
              </g>
            </g>
          </g>
        </g>
      </g>
    </g>
  </svg>
</template>

<style scoped>
.figure {
  --c-skin: #e3b591;
  --c-skin-far: #cf9c78;
  --c-hair: #1e1a17;
  --c-blazer: #1f4d3a;
  --c-blazer-far: #163a2b;
  --c-lapel: #173d2d;
  --c-shirt: #f6f7f4;
  --c-pants: #262d31;
  --c-pants-far: #1a2023;
  --c-shoe: #121514;
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}

@media (prefers-color-scheme: dark) {
  .figure {
    --c-pants: #3a454b;
    --c-pants-far: #2c353a;
    --c-shoe: #070908;
    --c-blazer: #2a6a50;
    --c-blazer-far: #1f5039;
    --c-lapel: #215640;
  }
}

.shadow {
  fill: rgb(10 16 13 / 14%);
}

.skin {
  fill: var(--c-skin);
}

.skin-far {
  fill: var(--c-skin-far);
}

.hair {
  fill: var(--c-hair);
}

.blazer,
.sleeve {
  fill: var(--c-blazer);
}

.sleeve-far {
  fill: var(--c-blazer-far);
}

.lapel {
  fill: var(--c-lapel);
}

.shirt,
.cuff,
.badge {
  fill: var(--c-shirt);
}

.cuff-far {
  fill: #d9ddd8;
}

.folder {
  fill: #e9ece7;
}

.folder-band {
  fill: var(--c-blazer-far);
}

.badge-line {
  fill: var(--c-blazer);
}

.seam {
  fill: none;
  stroke: var(--c-lapel);
  stroke-width: 1.6;
  stroke-linecap: round;
}

.button {
  fill: var(--c-lapel);
}

.pants {
  fill: var(--c-pants);
}

.pants-far {
  fill: var(--c-pants-far);
}

.shoe {
  fill: var(--c-shoe);
}

.shoe-far {
  fill: #000;
}

.ink {
  fill: var(--c-hair);
}

.brow,
.mouth {
  fill: none;
  stroke: var(--c-hair);
  stroke-width: 2;
  stroke-linecap: round;
}

.mouth {
  stroke: #8a4a3c;
  stroke-width: 2.2;
}

.blush {
  fill: #e98b7a;
  opacity: 0.28;
}

/* Thở nhẹ và chớp mắt: chạy theo thời gian, độc lập với cuộn */
.breathe {
  animation: breathe 4.2s ease-in-out infinite;
}

.eyes {
  transform-box: fill-box;
  transform-origin: center;
  animation: blink 5.6s infinite;
}

@keyframes breathe {
  50% {
    transform: translateY(-1.5px);
  }
}

@keyframes blink {
  0%,
  95%,
  100% {
    transform: scaleY(1);
  }

  97% {
    transform: scaleY(0.1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .breathe,
  .eyes {
    animation: none;
  }
}
</style>
