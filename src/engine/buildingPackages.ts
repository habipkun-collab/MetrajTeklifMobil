import type { NormProfile } from '../types/norms'
import type { ComputedMaterial } from '../types/workItem'
import type { HvacSystem } from '../types/workItem'

export function computeElevator(
  elevatorCount: number,
  stopCount: number,
  norms: NormProfile
): { materials: ComputedMaterial[]; notes: string[] } {
  if (elevatorCount <= 0) {
    return { materials: [], notes: ['Asansör adedi girin.'] }
  }
  const stops = Math.max(2, stopCount)

  return {
    materials: [
      {
        key: 'elevator',
        label: 'Asansör (makine + kabin paketi)',
        quantity: elevatorCount,
        unit: 'takim',
        category: 'Asansör',
      },
      {
        key: 'install',
        label: 'Montaj ve ray (durak başına yaklaşık)',
        quantity: round2(elevatorCount * stops * norms.elevatorInstallUnitsPerStop),
        unit: 'takim',
        category: 'Asansör',
      },
    ],
    notes: ['Paket fiyat; özel asansör projesinde ayrı keşif gerekir.'],
  }
}

export function computeHvac(
  areaM2: number,
  system: HvacSystem,
  norms: NormProfile
): { materials: ComputedMaterial[]; notes: string[] } {
  if (areaM2 <= 0) {
    return { materials: [], notes: ['Alan girin.'] }
  }

  const factor =
    system === 'vrf' ? norms.hvacVrfFactor : system === 'ducted' ? norms.hvacDuctedFactor : 1

  return {
    materials: [
      {
        key: 'hvac',
        label:
          system === 'vrf'
            ? 'VRF klima sistemi (paket)'
            : system === 'ducted'
              ? 'Kanallı klima / AHU (paket)'
              : 'Split klima (paket)',
        quantity: round2(areaM2 * norms.hvacUnitPerM2 * factor),
        unit: 'takim',
        category: 'Mekanik',
      },
      {
        key: 'duct',
        label: 'Kanal / bakır hat (yaklaşık m)',
        quantity: round2(areaM2 * norms.hvacDuctMPerM2 * factor),
        unit: 'm',
        category: 'Mekanik',
      },
    ],
    notes: ['Isıtma-soğutma paket metrajı; detay proje ile doğrulanmalı.'],
  }
}

export function computeScaffolding(
  perimeterM: number,
  heightM: number,
  norms: NormProfile
): { materials: ComputedMaterial[]; notes: string[] } {
  const faceM2 = perimeterM * heightM
  if (faceM2 <= 0) {
    return { materials: [], notes: ['Çevre ve yükseklik girin.'] }
  }

  return {
    materials: [
      {
        key: 'scaffold',
        label: 'İskele kiralama / kurulum (yüzey m²)',
        quantity: round2(faceM2 * norms.scaffoldM2PerFaceM2),
        unit: 'm2',
        category: 'İskele',
      },
    ],
    notes: ['Cephe iskelesi = çevre × yükseklik; norm çarpanı ayarlardan.'],
  }
}

function round2(n: number) {
  return Math.round(n * 100) / 100
}
