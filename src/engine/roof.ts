import type { NormProfile } from '../types/norms'
import type { ComputedMaterial } from '../types/workItem'
import type { RoofCovering } from '../types/workItem'

export interface RoofInput {
  areaM2: number
  covering: RoofCovering
  wastePct: number
  slopeExtraPct: number
}

export function computeRoof(
  input: RoofInput,
  norms: NormProfile
): { materials: ComputedMaterial[]; notes: string[] } {
  const slopePct = input.slopeExtraPct ?? norms.roofSlopeWastePct
  const slope = 1 + Math.min(40, Math.max(0, slopePct)) / 100
  const waste = 1 + Math.min(30, Math.max(0, input.wastePct)) / 100
  const area = input.areaM2 * slope * waste
  const materials: ComputedMaterial[] = []
  const notes = [
    'Çatı alanı eğim ve bindirme payı ile artırılır.',
    'Kiremit adedi veya membran m² normları Ayarlar → Norm katsayılarından gelir.',
  ]

  if (input.areaM2 <= 0) {
    return { materials: [], notes: ['Geçerli çatı alanı girin.'] }
  }

  if (input.covering === 'tile') {
    materials.push({
      key: 'roof_tile',
      label: 'Kiremit / çatı kaplama',
      quantity: round2(area * norms.roofTilePerM2),
      unit: 'adet',
      category: 'Çatı',
    })
  } else if (input.covering === 'membrane') {
    materials.push({
      key: 'membrane',
      label: 'Su yalıtım membranı',
      quantity: round2(area * norms.roofMembraneM2PerM2),
      unit: 'm2',
      category: 'Çatı',
    })
  } else {
    materials.push({
      key: 'metal_sheet',
      label: 'Metal çatı kaplama',
      quantity: round2(area * norms.roofMetalSheetM2PerM2),
      unit: 'm2',
      category: 'Çatı',
    })
  }

  materials.push({
    key: 'roof_area',
    label: 'Çatı projeksiyon alanı',
    quantity: round2(input.areaM2),
    unit: 'm2',
    category: 'Metraj',
  })

  return { materials, notes }
}

function round2(n: number) {
  return Math.round(n * 100) / 100
}
