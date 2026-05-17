import { describe, expect, it } from 'vitest'
import {
  computeTileSurface,
  grossPieces,
  netPieces,
  tileAreaM2,
} from './tileMath'

describe('tileAreaM2', () => {
  it('60x120 cm', () => {
    expect(tileAreaM2(60, 120)).toBeCloseTo(0.72, 6)
  })
})

describe('netPieces', () => {
  it('12 m2 duvar 60x120', () => {
    expect(netPieces(12, 60, 120)).toBeCloseTo(16.666666, 3)
  })
})

describe('grossPieces', () => {
  it('simple 12 m2 8%', () => {
    const n = netPieces(12, 60, 120)
    expect(grossPieces(n, 8, 'simple')).toBe(18)
  })
  it('medium 12 m2 8%', () => {
    const n = netPieces(12, 60, 120)
    expect(grossPieces(n, 8, 'medium')).toBe(19)
  })
  it('conservative 12 m2 8%', () => {
    const n = netPieces(12, 60, 120)
    expect(grossPieces(n, 8, 'conservative')).toBe(20)
  })
  it('simple 5.5 m2 30x30 10%', () => {
    const n = netPieces(5.5, 30, 30)
    expect(grossPieces(n, 10, 'simple')).toBe(68)
  })
  it('medium 1 m2 100x100 0%', () => {
    const n = netPieces(1, 100, 100)
    expect(grossPieces(n, 0, 'medium')).toBe(1)
  })
  it('medium 0.99 m2 100x100 0%', () => {
    const n = netPieces(0.99, 100, 100)
    expect(grossPieces(n, 0, 'medium')).toBe(1)
  })
  it('simple 20 m2 45x45 15%', () => {
    const n = netPieces(20, 45, 45)
    expect(grossPieces(n, 15, 'simple')).toBe(114)
  })
})

describe('computeTileSurface', () => {
  it('includes grout when requested', () => {
    const r = computeTileSurface({
      areaM2: 10,
      tileWidthCm: 60,
      tileHeightCm: 60,
      jointMm: 2,
      wastePct: 5,
      wastePolicy: 'simple',
      includeGroutEstimate: true,
      groutKgPerM2: 1.3,
    })
    expect(r.groutApproxKg).toBe(13)
    expect(r.steps.some((s) => s.includes('Derz harcı'))).toBe(true)
  })
})
