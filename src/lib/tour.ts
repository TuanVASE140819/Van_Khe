// Kịch bản "đi xem dự án cùng chuyên viên": chuỗi điểm dừng, giữa hai điểm là một đoạn đi bộ.
// Mọi trạng thái là hàm của vị trí cuộn (đơn vị kịch bản), nên cuộn ngược cũng chạy ngược đúng.

import { clamp01, smooth } from './rig'

export type Gesture = 'none' | 'wave' | 'present'

export interface Stop {
  /** Vị trí ngang, tỉ lệ trên bề rộng sân khấu */
  x: number
  /** Hướng nhìn khi đứng ở điểm này: 1 sang phải, -1 sang trái */
  facing: 1 | -1
  gesture: Gesture
  /** Độ dài khi đứng lại (đơn vị kịch bản); 0 là đi qua luôn */
  hold: number
  /** Cảnh hiện ở điểm này: -1 không có, 0 mở đầu, 1..n dự án, n+1 kết */
  scene: number
}

export interface Segment {
  kind: 'walk' | 'hold'
  start: number
  end: number
  from: Stop
  to: Stop
}

export interface Timeline {
  segments: Segment[]
  total: number
}

export function buildTimeline(stops: Stop[], walk = 1): Timeline {
  const segments: Segment[] = []
  let t = 0
  stops.forEach((stop, i) => {
    if (i > 0) {
      segments.push({ kind: 'walk', start: t, end: t + walk, from: stops[i - 1], to: stop })
      t += walk
    }
    if (stop.hold > 0) {
      segments.push({ kind: 'hold', start: t, end: t + stop.hold, from: stop, to: stop })
      t += stop.hold
    }
  })
  return { segments, total: t }
}

export function locate(timeline: Timeline, u: number): { segment: Segment; s: number } {
  const { segments } = timeline
  const at = Math.min(Math.max(u, 0), timeline.total)
  const segment = segments.find((seg) => at < seg.end) ?? segments[segments.length - 1]
  return { segment, s: clamp01((at - segment.start) / (segment.end - segment.start)) }
}

/** Đơn vị kịch bản ở giữa lúc đứng tại cảnh `scene` (để cuộn tới khi bấm Tab vào cảnh đó). */
export function holdMiddle(timeline: Timeline, scene: number): number | null {
  const seg = timeline.segments.find((s) => s.kind === 'hold' && s.from.scene === scene)
  return seg ? (seg.start + seg.end) / 2 : null
}

export const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

export interface SceneState {
  /** 0..1: ảnh đang hiện bao nhiêu; dir: hướng quét (1 từ trái sang, -1 từ phải sang) */
  photo: number
  /** true: ảnh đang bị quét đi (phần còn lại nằm phía trước hướng đi) */
  leaving: boolean
  dir: 1 | -1
  info: number
  /** Chữ đang rời đi (trượt ngang) hay đang tới (trượt lên) */
  infoLeaving: boolean
}

/** Trạng thái hiển thị của một cảnh tại thời điểm hiện tại. */
export function sceneState(segment: Segment, s: number, scene: number): SceneState {
  const hidden: SceneState = { photo: 0, leaving: false, dir: 1, info: 0, infoLeaving: false }
  if (segment.kind === 'hold') {
    return segment.from.scene === scene ? { photo: 1, leaving: false, dir: 1, info: 1, infoLeaving: false } : hidden
  }
  const dir: 1 | -1 = segment.to.x >= segment.from.x ? 1 : -1
  if (segment.from.scene === scene) {
    return { photo: 1 - smooth(s / 0.55), leaving: true, dir, info: 1 - smooth(s / 0.3), infoLeaving: true }
  }
  if (segment.to.scene === scene) {
    // Cảnh mở đầu hiện sẵn khi nhân vật mới bước vào
    const info = segment.from.scene < 0 ? 1 : smooth((s - 0.5) / 0.45)
    return { photo: smooth((s - 0.15) / 0.75), leaving: false, dir, info, infoLeaving: false }
  }
  return hidden
}
