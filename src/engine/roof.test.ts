import { describe, expect, it } from 'vitest'
import { defaultNormProfile } from '../types/norms'
import { computeRoof } from './roof'

describe('computeRoof', () => {
  it('computes tile count from area', () => {
    const r = computeRoof(
      { areaM2: 100, covering: 'tile', wastePct: 0, slopeExtraPct: 0 },
      defaultNormProfile()
    )
    const tiles = r.materials.find((m) => m.key === 'roof_tile')
    expect(tiles?.quantity).toBe(100 * 10)
  })
})
