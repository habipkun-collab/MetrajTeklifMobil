import type { ComputedMaterial } from '../types/workItem'

export interface ExcavationInput {
  lengthM: number
  widthM: number
  depthM: number
  bulkingPct: number
}

export function computeExcavation(input: ExcavationInput): {
  materials: ComputedMaterial[]
  notes: string[]
} {
  const base = input.lengthM * input.widthM * input.depthM
  const bulking = 1 + Math.min(50, Math.max(0, input.bulkingPct)) / 100
  const volume = base * bulking
  const notes = [
    'Kazı hacmi = boy × en × derinlik; şişme payı hafriyat sahası / nakliye için eklenir.',
    'İksa, kazık, drenaj ve zemin iyileştirme kalemlerini maliyet şablonlarından ayrıca ekleyin.',
  ]

  if (base <= 0) {
    return { materials: [], notes: ['Geçerli kazı ölçüsü girin.'] }
  }

  return {
    materials: [
      {
        key: 'excavation_m3',
        label: 'Kazı / hafriyat hacmi',
        quantity: round3(volume),
        unit: 'm3',
        category: 'Kazı',
      },
    ],
    notes,
  }
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000
}
