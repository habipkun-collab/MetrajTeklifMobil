import type { NormProfile } from '../types/norms'
import type { ComputedMaterial } from '../types/workItem'
import type { SteelQuantityMode, SteelRole } from '../types/workItem'

export interface SteelInput {
  role: SteelRole
  mode: SteelQuantityMode
  directKg: number
  areaM2: number
  kgPerM2: number
  wastePct: number
}

export function computeSteel(
  input: SteelInput,
  norms: NormProfile
): { materials: ComputedMaterial[]; notes: string[] } {
  const waste = 1 + Math.min(30, Math.max(0, input.wastePct || norms.steelWastePctDefault)) / 100
  let baseKg = 0

  if (input.mode === 'direct_kg') {
    baseKg = Math.max(0, input.directKg)
  } else {
    const perM2 =
      input.kgPerM2 > 0
        ? input.kgPerM2
        : input.role === 'structural'
          ? norms.steelStructuralKgPerM2
          : norms.steelMeshKgPerM2
    baseKg = Math.max(0, input.areaM2) * perM2
  }

  const kg = baseKg * waste
  const notes = [
    input.mode === 'direct_kg'
      ? 'Doğrudan kg girişi (keşif veya statikten).'
      : 'Alan × kg/m² normu kullanıldı; normlar ayarlardan değiştirilebilir.',
  ]

  if (kg <= 0) {
    return { materials: [], notes: ['Geçerli çelik miktarı girin.'] }
  }

  const label =
    input.role === 'structural'
      ? 'Çelik konstrüksiyon / profil'
      : input.role === 'mesh'
        ? 'Hasır çelik / serim'
        : 'Donatı çelik (işçilik+kesim)'

  return {
    materials: [
      {
        key: 'steel_kg',
        label,
        quantity: round2(kg),
        unit: 'kg',
        category: 'Çelik',
      },
    ],
    notes,
  }
}

function round2(n: number) {
  return Math.round(n * 100) / 100
}
