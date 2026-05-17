import type { NormProfile } from '../types/norms'
import type { ComputedMaterial } from '../types/workItem'

export function computePlaster(
  areaM2: number,
  thicknessMm: number,
  wastePct: number,
  norms: NormProfile
) {
  const waste = 1 + Math.min(30, Math.max(0, wastePct)) / 100
  const thicknessM = Math.max(1, thicknessMm) / 1000
  const volumeM3 = areaM2 * thicknessM * waste
  const plasterKg = volumeM3 * norms.plasterDensityKgM3

  const materials: ComputedMaterial[] = []
  if (areaM2 <= 0) {
    return { materials: [], notes: ['Geçerli alan girin.'] }
  }

  materials.push(
    {
      key: 'plaster_kg',
      label: 'Sıva harcı / alçı sıva',
      quantity: round2(plasterKg),
      unit: 'kg',
      category: 'Sıva',
    },
    {
      key: 'area',
      label: 'Sıva alanı',
      quantity: round2(areaM2),
      unit: 'm2',
      category: 'Metraj',
    }
  )

  return {
    materials,
    notes: ['Sıva yoğunluğu normu ayarlardan düzenlenebilir.'],
  }
}

export function computeScreed(
  areaM2: number,
  thicknessCm: number,
  wastePct: number,
  norms: NormProfile
) {
  const waste = 1 + Math.min(30, Math.max(0, wastePct)) / 100
  const volumeM3 = areaM2 * (Math.max(1, thicknessCm) / 100) * waste

  if (areaM2 <= 0) {
    return { materials: [], notes: ['Geçerli alan girin.'] }
  }

  const materials: ComputedMaterial[] = [
    {
      key: 'screed_m3',
      label: 'Şap / tesviye harcı hacmi',
      quantity: round3(volumeM3),
      unit: 'm3',
      category: 'Şap',
    },
    {
      key: 'cement',
      label: 'Çimento (şap için yaklaşık)',
      quantity: round2(volumeM3 * norms.screedCementKgPerM3),
      unit: 'kg',
      category: 'Şap',
    },
  ]
  return {
    materials,
    notes: ['Şap çimento normu ayarlardan düzenlenebilir.'],
  }
}

export function computePaint(
  areaM2: number,
  coats: number,
  wastePct: number,
  norms: NormProfile
) {
  const waste = 1 + Math.min(20, Math.max(0, wastePct)) / 100
  const c = Math.max(1, Math.min(5, Math.round(coats)))
  const liters = areaM2 * norms.paintLitersPerM2PerCoat * c * waste

  if (areaM2 <= 0) {
    return { materials: [], notes: ['Geçerli alan girin.'] }
  }

  const materials: ComputedMaterial[] = [
    {
      key: 'paint_lt',
      label: 'Boya (iç cephe, yaklaşık)',
      quantity: round2(liters),
      unit: 'lt',
      category: 'Boya',
    },
    {
      key: 'area',
      label: 'Boyalanacak alan',
      quantity: round2(areaM2),
      unit: 'm2',
      category: 'Metraj',
    },
  ]
  return {
    materials,
    notes: [`~${norms.paintLitersPerM2PerCoat} lt/m²/kat normu (ayarlanabilir).`],
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000
}
