import type { NormProfile } from '../types/norms'
import type { ComputedMaterial } from '../types/workItem'
import type { FacadeCladding } from '../types/workItem'

export interface FacadeInput {
  areaM2: number
  cladding: FacadeCladding
  wastePct: number
}

export function computeFacade(
  input: FacadeInput,
  norms: NormProfile
): { materials: ComputedMaterial[]; notes: string[] } {
  const waste = 1 + Math.min(30, Math.max(0, input.wastePct)) / 100
  const area = input.areaM2 * waste

  if (input.areaM2 <= 0) {
    return { materials: [], notes: ['Geçerli cephe alanı girin.'] }
  }

  const materials: ComputedMaterial[] = [
    {
      key: 'facade_area',
      label: 'Cephe kaplama alanı',
      quantity: round2(input.areaM2),
      unit: 'm2',
      category: 'Metraj',
    },
  ]

  switch (input.cladding) {
    case 'stone':
      materials.push({
        key: 'stone',
        label: 'Doğal taş / dış kaplama',
        quantity: round2(area * norms.facadeStoneM2PerM2),
        unit: 'm2',
        category: 'Cephe',
      })
      break
    case 'composite':
      materials.push({
        key: 'composite',
        label: 'Kompozit panel',
        quantity: round2(area * norms.facadeCompositeM2PerM2),
        unit: 'm2',
        category: 'Cephe',
      })
      break
    case 'glass':
      materials.push({
        key: 'glass',
        label: 'Cam cephe / doğrama',
        quantity: round2(area * norms.facadeGlassM2PerM2),
        unit: 'm2',
        category: 'Cephe',
      })
      break
    case 'paint_only':
      materials.push({
        key: 'paint',
        label: 'Dış cephe boya',
        quantity: round2(area * norms.facadePaintM2PerM2),
        unit: 'm2',
        category: 'Cephe',
      })
      break
  }

  materials.push({
    key: 'subframe',
    label: 'Taşıyıcı konstrüksiyon / alt karkas (yaklaşık)',
    quantity: round2(area * norms.facadeSubframeM2PerM2),
    unit: 'm2',
    category: 'Cephe',
  })

  return {
    materials,
    notes: ['Cephe alanı net m²; kaplama ve karkas normları ayarlardan gelir.'],
  }
}

function round2(n: number) {
  return Math.round(n * 100) / 100
}
