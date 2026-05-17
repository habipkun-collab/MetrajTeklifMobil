import { describe, expect, it } from 'vitest'
import { buildMetrajCostLines, computeCostTotals, syncCostLinesFromMetraj } from './costEstimateLogic'
import type { Project } from '../types/domain'
import { emptyCostEstimate } from '../types/costEstimate'
import { computeWorkItem } from '../engine/workCompute'

function miniProject(): Project {
  const tile = computeWorkItem({
    kind: 'tile',
    id: 'li1',
    label: 'Zemin',
    areaM2: 12,
    tileWidthCm: 60,
    tileHeightCm: 120,
    jointMm: 2,
    wastePct: 8,
    wastePolicy: 'medium',
    includeGroutEstimate: true,
  })
  return {
    id: 'p1',
    name: 'Test',
    discipline: 'interior',
    vatRatePct: 20,
    createdAt: '2026-01-01',
    costEstimate: emptyCostEstimate(),
    spaces: [
      {
        id: 's1',
        name: 'Banyo',
        workItems: [tile],
      },
    ],
  }
}

describe('buildMetrajCostLines', () => {
  it('creates plaka and derz lines from tile work item', () => {
    const lines = buildMetrajCostLines(miniProject())
    expect(lines.length).toBeGreaterThanOrEqual(2)
    expect(lines.some((l) => l.unit === 'adet')).toBe(true)
    expect(lines.some((l) => l.unit === 'kg')).toBe(true)
    expect(lines[0].source.type).toBe('metraj')
  })

  it('includes masonry materials', () => {
    const wall = computeWorkItem({
      kind: 'masonry_wall',
      id: 'w1',
      label: 'Dış duvar',
      lengthM: 10,
      heightM: 3,
      thicknessCm: 19,
      openingsM2: 4,
      material: 'brick_19',
      wastePct: 5,
    }, undefined)
    const p = miniProject()
    p.spaces[0].workItems.push(wall)
    const lines = buildMetrajCostLines(p)
    expect(lines.some((l) => l.label.includes('Tuğla'))).toBe(true)
    expect(lines.some((l) => l.unit === 'kg' && l.label.includes('Çimento'))).toBe(true)
  })
})

describe('syncCostLinesFromMetraj', () => {
  it('preserves unit prices', () => {
    const p = miniProject()
    p.costEstimate.lines = buildMetrajCostLines(p).map((l, i) => ({
      ...l,
      unitPriceTry: 100 + i,
    }))
    const synced = syncCostLinesFromMetraj(p, p.costEstimate)
    expect(synced.lines[0].unitPriceTry).toBe(100)
  })
})

describe('computeCostTotals', () => {
  it('applies labor and vat', () => {
    const est = {
      laborMarkupPct: 20,
      lines: [{ id: '1', label: 'x', quantity: 10, unit: 'adet' as const, unitPriceTry: 100, source: { type: 'manual' as const } }],
    }
    const t = computeCostTotals(est, 20)
    expect(t.materialSubtotal).toBe(1000)
    expect(t.laborAmount).toBe(200)
    expect(t.grandTotal).toBe(1440)
  })
})
