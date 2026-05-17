import type { NormProfile } from '../types/norms'
import type { ComputedMaterial } from '../types/workItem'
import type { ConcreteMix } from '../types/workItem'

export interface ConcreteVolumeInput {
  lengthM: number
  widthM: number
  thicknessM: number
  mix: ConcreteMix
  wastePct: number
}

export function concreteVolumeM3(lengthM: number, widthM: number, thicknessM: number): number {
  return lengthM * widthM * thicknessM
}

export function computeConcreteVolume(
  input: ConcreteVolumeInput,
  norms: NormProfile
): {
  volumeM3: number
  materials: ComputedMaterial[]
  notes: string[]
} {
  const raw = concreteVolumeM3(input.lengthM, input.widthM, input.thicknessM)
  const waste = 1 + Math.min(20, Math.max(0, input.wastePct)) / 100
  const volumeM3 = raw * waste
  const notes = [
    'Beton hacmi = boy × en × kalınlık (temel, döşeme, radye için aynı mantık).',
    'Donatı için “Betonarme (donatılı)” kalemini kullanın.',
  ]

  if (raw <= 0) {
    return { volumeM3: 0, materials: [], notes: ['Geçerli beton ölçüsü girin.'] }
  }

  const materials: ComputedMaterial[] = [
    {
      key: 'concrete_m3',
      label: input.mix === 'ready' ? 'Hazır beton' : 'Beton hacmi (şantiye karışım)',
      quantity: round3(volumeM3),
      unit: 'm3',
      category: 'Betonarme',
    },
  ]

  if (input.mix === 'site') {
    materials.push(
      {
        key: 'cement_bag',
        label: 'Çimento (50 kg torba)',
        quantity: round2(volumeM3 * norms.siteMixCementBagsPerM3),
        unit: 'torba',
        category: 'Betonarme',
      },
      {
        key: 'sand',
        label: 'Kum',
        quantity: round3(volumeM3 * norms.siteMixSandM3PerM3),
        unit: 'm3',
        category: 'Betonarme',
      },
      {
        key: 'gravel',
        label: 'Çakıl / agrega',
        quantity: round3(volumeM3 * norms.siteMixGravelM3PerM3),
        unit: 'm3',
        category: 'Betonarme',
      }
    )
    notes.push('Şantiye karışım normları ayarlardan düzenlenebilir.')
  }

  return { volumeM3, materials, notes }
}

export interface ReinforcedConcreteInput extends ConcreteVolumeInput {
  rebarKgPerM3: number
}

export function computeReinforcedConcrete(
  input: ReinforcedConcreteInput,
  norms: NormProfile
): {
  volumeM3: number
  materials: ComputedMaterial[]
  notes: string[]
} {
  const base = computeConcreteVolume(input, norms)
  const rebar = base.volumeM3 * Math.max(0, input.rebarKgPerM3)
  const notes = [
    ...base.notes,
    `Donatı yoğunluğu ${input.rebarKgPerM3} kg/m³ (norm varsayılanları ayarlarda).`,
  ]

  if (base.volumeM3 <= 0) return { ...base, notes }

  const materials: ComputedMaterial[] = [
    ...base.materials,
    {
      key: 'rebar',
      label: 'Donatı çelik (yaklaşık)',
      quantity: round2(rebar),
      unit: 'kg',
      category: 'Betonarme',
    },
  ]

  return { volumeM3: base.volumeM3, materials, notes }
}

export function rebarKgPerM3ForElement(
  element: 'foundation' | 'slab' | 'column',
  norms: NormProfile
): number {
  switch (element) {
    case 'slab':
      return norms.rebarKgPerM3Slab
    case 'column':
      return norms.rebarKgPerM3Column
    default:
      return norms.rebarKgPerM3Foundation
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000
}
