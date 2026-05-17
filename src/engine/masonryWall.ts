import type { NormProfile } from '../types/norms'
import type { MasonryMaterial } from '../types/workItem'
import type { ComputedMaterial } from '../types/workItem'

export interface MasonryInput {
  lengthM: number
  heightM: number
  openingsM2: number
  material: MasonryMaterial
  wastePct: number
}

function materialNorms(norms: NormProfile, material: MasonryMaterial) {
  switch (material) {
    case 'brick_12':
      return { bricksPerM2: norms.brick12PerM2, mortarM3PerM2: norms.mortarM3PerM2Brick12 }
    case 'brick_19':
      return { bricksPerM2: norms.brick19PerM2, mortarM3PerM2: norms.mortarM3PerM2Brick19 }
    case 'aerated_20':
      return {
        blocksPerM2: norms.aeratedBlockPerM2,
        mortarM3PerM2: 0,
        glueKgPerM2: norms.aeratedGlueKgPerM2,
      }
  }
}

export function computeMasonryWall(
  input: MasonryInput,
  norms: NormProfile
): {
  wallAreaM2: number
  materials: ComputedMaterial[]
  notes: string[]
} {
  const gross = input.lengthM * input.heightM
  const wallAreaM2 = Math.max(0, gross - Math.max(0, input.openingsM2))
  const waste = 1 + Math.min(30, Math.max(0, input.wastePct)) / 100
  const norm = materialNorms(norms, input.material)
  const materials: ComputedMaterial[] = []
  const notes = [
    'Duvar alanı = boy × yükseklik − kapı/pencere boşlukları.',
    'Tuğla/gazbeton normları Ayarlar → Norm katsayıları ekranından gelir.',
  ]

  if (wallAreaM2 <= 0) {
    return { wallAreaM2: 0, materials: [], notes: ['Geçerli duvar alanı girin.'] }
  }

  if ('bricksPerM2' in norm && norm.bricksPerM2) {
    materials.push({
      key: 'brick',
      label: input.material === 'brick_12' ? 'Tuğla (12 cm duvar)' : 'Tuğla (19 cm duvar)',
      quantity: round2(wallAreaM2 * norm.bricksPerM2 * waste),
      unit: 'adet',
      category: 'Duvar',
    })
  }

  if ('blocksPerM2' in norm && norm.blocksPerM2) {
    materials.push({
      key: 'block',
      label: 'Gazbeton / briket blok',
      quantity: round2(wallAreaM2 * norm.blocksPerM2 * waste),
      unit: 'adet',
      category: 'Duvar',
    })
  }

  if ('glueKgPerM2' in norm && norm.glueKgPerM2) {
    materials.push({
      key: 'aac_glue',
      label: 'Gazbeton yapıştırıcısı',
      quantity: round2(wallAreaM2 * norm.glueKgPerM2 * waste),
      unit: 'kg',
      category: 'Duvar',
    })
  }

  if (norm.mortarM3PerM2 > 0) {
    const mortarM3 = wallAreaM2 * norm.mortarM3PerM2 * waste
    materials.push({
      key: 'mortar_m3',
      label: 'Duvar harcı (kumlu)',
      quantity: round3(mortarM3),
      unit: 'm3',
      category: 'Duvar',
    })
    materials.push({
      key: 'cement',
      label: 'Çimento (harç için)',
      quantity: round2(mortarM3 * norms.cementKgPerM3Mortar),
      unit: 'kg',
      category: 'Duvar',
    })
    materials.push({
      key: 'sand',
      label: 'Kum (harç için)',
      quantity: round3(mortarM3 * norms.sandM3PerM3Mortar),
      unit: 'm3',
      category: 'Duvar',
    })
  }

  materials.push({
    key: 'wall_area',
    label: 'Duvar yüzey alanı (net)',
    quantity: round2(wallAreaM2),
    unit: 'm2',
    category: 'Metraj',
  })

  return { wallAreaM2, materials, notes }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000
}
