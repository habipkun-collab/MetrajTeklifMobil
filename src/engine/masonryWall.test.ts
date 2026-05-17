import { describe, expect, it } from 'vitest'
import { defaultNormProfile } from '../types/norms'
import { computeMasonryWall } from './masonryWall'

describe('computeMasonryWall', () => {
  it('computes net area and brick count', () => {
    const r = computeMasonryWall({
      lengthM: 10,
      heightM: 3,
      openingsM2: 4,
      material: 'brick_19',
      wastePct: 0,
    }, defaultNormProfile())
    expect(r.wallAreaM2).toBe(26)
    const bricks = r.materials.find((m) => m.key === 'brick')
    expect(bricks?.quantity).toBe(26 * 110)
  })
})
