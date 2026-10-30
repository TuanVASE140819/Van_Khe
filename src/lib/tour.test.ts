import { describe, expect, it } from 'vitest'
import { GROUND_Y, HALF_STRIDE, HIP_Y, STAND, bodyDrop, legReach, present, walkPose } from './rig'
import { buildTimeline, holdMiddle, locate, sceneState, type Stop } from './tour'

describe('consultant rig', () => {
  it('stands still when the walk amount is zero', () => {
    expect(walkPose(1.3, 0)).toEqual(STAND)
  })

  it('keeps the supporting foot on the ground through a whole step', () => {
    for (let i = 0; i < 32; i++) {
      const pose = walkPose((i / 32) * Math.PI * 2, 1)
      const lowest = Math.max(legReach(pose.nearThigh, pose.nearKnee), legReach(pose.farThigh, pose.farKnee))
      expect(HIP_Y + bodyDrop(pose) + lowest).toBeCloseTo(GROUND_Y, 6)
      expect(Math.abs(pose.nearThigh)).toBeLessThanOrEqual(20)
      expect(pose.nearKnee).toBeGreaterThanOrEqual(0)
      expect(pose.nearKnee).toBeLessThanOrEqual(52)
    }
  })

  it('has a believable stride length for the drawing', () => {
    expect(HALF_STRIDE).toBeGreaterThan(120)
    expect(HALF_STRIDE).toBeLessThan(260)
  })

  it('raises the near arm to the requested angle when presenting', () => {
    expect(present(STAND, 1, -48).nearShoulder).toBe(-48)
    expect(present(STAND, 0, -48).nearShoulder).toBe(STAND.nearShoulder)
  })
})

describe('tour timeline', () => {
  const stops: Stop[] = [
    { x: -0.1, facing: 1, gesture: 'none', hold: 0, scene: -1 },
    { x: 0.4, facing: 1, gesture: 'wave', hold: 1, scene: 0 },
    { x: 0.3, facing: 1, gesture: 'present', hold: 2, scene: 1 },
    { x: 0.7, facing: -1, gesture: 'present', hold: 2, scene: 2 },
  ]
  const timeline = buildTimeline(stops)

  it('alternates walks and holds', () => {
    expect(timeline.segments.map((s) => s.kind)).toEqual(['walk', 'hold', 'walk', 'hold', 'walk', 'hold'])
    expect(timeline.total).toBe(3 + 1 + 2 + 2)
  })

  it('finds the segment for any scroll position, clamped at both ends', () => {
    expect(locate(timeline, -5)).toMatchObject({ s: 0, segment: { kind: 'walk' } })
    expect(locate(timeline, 2.5).segment).toMatchObject({ kind: 'walk', from: stops[1], to: stops[2] })
    expect(locate(timeline, 99)).toMatchObject({ s: 1, segment: { kind: 'hold', from: stops[3] } })
  })

  it('shows exactly one scene while the consultant stands still', () => {
    const { segment, s } = locate(timeline, 3.5)
    expect(sceneState(segment, s, 1)).toMatchObject({ photo: 1, info: 1 })
    expect(sceneState(segment, s, 2)).toMatchObject({ photo: 0, info: 0 })
  })

  it('wipes the old scene out and the new one in while walking', () => {
    const walk = timeline.segments[4]
    expect(sceneState(walk, 0, 1).photo).toBe(1)
    expect(sceneState(walk, 1, 1).photo).toBe(0)
    expect(sceneState(walk, 0, 2).photo).toBe(0)
    expect(sceneState(walk, 1, 2).photo).toBe(1)
    const mid = sceneState(walk, 0.5, 2)
    expect(mid.photo).toBeGreaterThan(0)
    expect(mid.photo).toBeLessThan(1)
    expect(mid.dir).toBe(1)
  })

  it('jumps to the middle of a scene for keyboard focus and route buttons', () => {
    expect(holdMiddle(timeline, 2)).toBe(7)
    expect(holdMiddle(timeline, 9)).toBeNull()
  })
})
