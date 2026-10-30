// Khung xương của nhân vật tư vấn (vẽ nhìn nghiêng 3/4, quay mặt sang phải).
// Mọi góc tính bằng độ, chiều dương là quay theo kim đồng hồ trên SVG:
// với chân / tay chĩa xuống, góc âm là đưa ra trước (về phía mặt nhìn), góc dương là ra sau.

export const THIGH = 120
export const SHIN = 113
export const SHOE = 13
export const HIP_Y = 300
export const GROUND_Y = HIP_Y + THIGH + SHIN + SHOE

export interface Pose {
  nearThigh: number
  nearKnee: number
  nearFoot: number
  farThigh: number
  farKnee: number
  farFoot: number
  nearShoulder: number
  nearElbow: number
  nearWrist: number
  farShoulder: number
  farElbow: number
  farWrist: number
  /** Nghiêng thân trên quanh hông */
  lean: number
  headTilt: number
}

const rad = (deg: number) => (deg * Math.PI) / 180
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const clamp01 = (t: number) => Math.min(1, Math.max(0, t))
export const smooth = (t: number) => {
  const x = clamp01(t)
  return x * x * (3 - 2 * x)
}

export const STAND: Pose = {
  nearThigh: -2,
  nearKnee: 3,
  nearFoot: -1,
  farThigh: 4,
  farKnee: 2,
  farFoot: -6,
  nearShoulder: 5,
  nearElbow: -12,
  nearWrist: 0,
  farShoulder: -4,
  farElbow: -10,
  farWrist: 0,
  lean: 0,
  headTilt: 0,
}

/** Một chân trong chu kỳ bước. phase 0: chân thẳng đứng đang đưa ra trước. */
function leg(phase: number, w: number) {
  const thigh = -20 * w * Math.sin(phase)
  // Gối gập nhiều nhất khi đùi vừa qua dưới thân trong pha đưa chân, gần thẳng khi gót chạm đất
  const knee = 4 + w * 46 * Math.max(0, Math.cos(phase - 0.25)) ** 1.5
  // Bàn chân giữ gần song song mặt đất, cuối pha chống thì kiễng mũi
  const toe = 16 * w * Math.max(0, Math.sin(phase - Math.PI))
  return { thigh, knee, foot: -(thigh + knee) + toe }
}

/** Dáng đi ở pha `phase` (radian), `w` từ 0 (đứng yên) tới 1 (bước đủ). */
export function walkPose(phase: number, w: number): Pose {
  const near = leg(phase, w)
  const far = leg(phase + Math.PI, w)
  const swing = Math.sin(phase)
  const pose: Pose = {
    nearThigh: near.thigh,
    nearKnee: near.knee,
    nearFoot: near.foot,
    farThigh: far.thigh,
    farKnee: far.knee,
    farFoot: far.foot,
    // Tay vung ngược chân cùng bên
    nearShoulder: 16 * w * swing,
    nearElbow: -(10 + 16 * w * Math.max(0, -swing)),
    nearWrist: 0,
    farShoulder: -16 * w * swing,
    farElbow: -(10 + 16 * w * Math.max(0, swing)),
    farWrist: 0,
    lean: 3 * w,
    headTilt: 0,
  }
  return blend(STAND, pose, smooth(w * 4))
}

export function blend(a: Pose, b: Pose, t: number): Pose {
  const out = { ...a }
  for (const key of Object.keys(a) as (keyof Pose)[]) out[key] = lerp(a[key], b[key], t)
  return out
}

/** Đưa tay gần (tay phải của người xem) ra giới thiệu. `angle` là góc vai khi giơ hẳn. */
export function present(pose: Pose, t: number, angle = -48): Pose {
  // Mặc định: cánh tay hạ chéo, cẳng tay ngửa ra trước như mời khách nhìn sang
  const up = angle < -90
  return {
    ...pose,
    nearShoulder: lerp(pose.nearShoulder, angle, t),
    nearElbow: lerp(pose.nearElbow, up ? -24 : -46, t),
    nearWrist: lerp(pose.nearWrist, up ? -10 : -22, t),
    headTilt: lerp(pose.headTilt, -3, t),
  }
}

/** Vẫy tay chào: `beat` chạy liên tục để cẳng tay đung đưa. */
export function wave(pose: Pose, t: number, beat: number): Pose {
  return {
    ...pose,
    nearShoulder: lerp(pose.nearShoulder, -108, t),
    nearElbow: lerp(pose.nearElbow, -58 + 16 * Math.sin(beat), t),
    nearWrist: lerp(pose.nearWrist, 10 * Math.sin(beat + 0.7), t),
    headTilt: lerp(pose.headTilt, -4, t),
  }
}

/** Chiều cao thẳng đứng từ hông tới đế giày của một chân. */
export const legReach = (thigh: number, knee: number) => THIGH * Math.cos(rad(thigh)) + SHIN * Math.cos(rad(thigh + knee)) + SHOE

/** Hạ thân xuống bao nhiêu để chân đang chống chạm đúng mặt đất. */
export const bodyDrop = (pose: Pose) => THIGH + SHIN + SHOE - Math.max(legReach(pose.nearThigh, pose.nearKnee), legReach(pose.farThigh, pose.farKnee))

/** Vị trí ngang của mắt cá so với hông (dương là phía trước). */
export const footAhead = (thigh: number, knee: number) => -(THIGH * Math.sin(rad(thigh)) + SHIN * Math.sin(rad(thigh + knee)))

/**
 * Quãng đường thân đi được trong nửa chu kỳ bước (đơn vị của hình vẽ), đo từ lúc gót chạm đất
 * tới lúc nhấc mũi chân. Dùng để đổi quãng đường cuộn thành pha bước, chân không bị trượt.
 */
export const HALF_STRIDE = (() => {
  const strike = leg(Math.PI / 2, 1)
  const toeOff = leg((3 * Math.PI) / 2, 1)
  return footAhead(strike.thigh, strike.knee) - footAhead(toeOff.thigh, toeOff.knee)
})()
