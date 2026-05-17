import type { NormProfile } from '../types/norms'
import type { ComputedMaterial } from '../types/workItem'
import type { ElectricalDensity, InsulationType } from '../types/workItem'

export function computeElectrical(
  areaM2: number,
  density: ElectricalDensity,
  norms: NormProfile
): { materials: ComputedMaterial[]; notes: string[] } {
  const cablePerM2 =
    density === 'light'
      ? norms.electricalCableMPerM2Light
      : density === 'dense'
        ? norms.electricalCableMPerM2Dense
        : norms.electricalCableMPerM2Standard

  if (areaM2 <= 0) {
    return { materials: [], notes: ['Geçerli alan girin.'] }
  }

  const cableM = areaM2 * cablePerM2
  const outlets = Math.ceil(areaM2 * norms.electricalOutletsPerM2)

  const materials: ComputedMaterial[] = [
      {
        key: 'cable',
        label: 'Kablo (yaklaşık toplam)',
        quantity: round2(cableM),
        unit: 'm',
        category: 'Elektrik',
      },
      {
        key: 'outlets',
        label: 'Priz / anahtar noktası (yaklaşık)',
        quantity: outlets,
        unit: 'adet',
        category: 'Elektrik',
      },
      {
        key: 'panel',
        label: 'Pano / dağıtım (paket)',
        quantity: Math.max(1, Math.ceil(areaM2 / 120)),
        unit: 'takim',
        category: 'Elektrik',
      },
    ]
  return {
    materials,
    notes: [
      'Alan bazlı kablo ve nokta yoğunluğu; proje projesine göre düzeltin.',
      'Normlar: Ayarlar → Elektrik bölümü.',
    ],
  }
}

export function computePlumbing(
  areaM2: number,
  fixtureCount: number,
  norms: NormProfile
): { materials: ComputedMaterial[]; notes: string[] } {
  if (areaM2 <= 0 && fixtureCount <= 0) {
    return { materials: [], notes: ['Alan veya armatür sayısı girin.'] }
  }

  const pipeM = Math.max(areaM2, fixtureCount * 8) * norms.plumbingPipeMPerM2

  const materials: ComputedMaterial[] = [
      {
        key: 'pipe',
        label: 'Tesisat borusu (yaklaşık)',
        quantity: round2(pipeM),
        unit: 'm',
        category: 'Tesisat',
      },
      {
        key: 'fittings',
        label: 'Bağlantı / fittings paketi',
        quantity: Math.max(1, Math.ceil(pipeM / 25)),
        unit: 'takim',
        category: 'Tesisat',
      },
      ...(fixtureCount > 0
        ? [
            {
              key: 'fixtures',
              label: 'Armatür (lavabo, klozet vb.)',
              quantity: fixtureCount,
              unit: 'adet' as const,
              category: 'Tesisat',
            },
          ]
        : []),
    ]
  return {
    materials,
    notes: ['Sıhhi tesisat paket metrajı; detaylı keşif için hat bazlı kalem ekleyin.'],
  }
}

export function computeInsulation(
  areaM2: number,
  thicknessCm: number,
  type: InsulationType,
  wastePct: number,
  norms: NormProfile
): { materials: ComputedMaterial[]; notes: string[] } {
  const waste = 1 + Math.min(30, Math.max(0, wastePct)) / 100
  const area = areaM2 * waste

  if (areaM2 <= 0) {
    return { materials: [], notes: ['Geçerli alan girin.'] }
  }

  const factor = type === 'mineral_wool' ? norms.insulationWoolM2PerM2 : norms.insulationEpsM2PerM2
  const kg = areaM2 * Math.max(1, thicknessCm) * norms.insulationKgPerM2PerCm * waste

  const materials: ComputedMaterial[] = [
      {
        key: 'board',
        label: type === 'mineral_wool' ? 'Taş yünü levha' : 'EPS / XPS levha',
        quantity: round2(area * factor),
        unit: 'm2',
        category: 'Yalıtım',
      },
      {
        key: 'adhesive',
        label: 'Yapıştırıcı / dübel (yaklaşık kg)',
        quantity: round2(kg * 0.15),
        unit: 'kg',
        category: 'Yalıtım',
      },
    ]
  return {
    materials,
    notes: ['Mantolama / döşeme altı yalıtım için alan × kalınlık normu.'],
  }
}

export function computeWaterproofing(
  areaM2: number,
  layers: number,
  wastePct: number,
  norms: NormProfile
): { materials: ComputedMaterial[]; notes: string[] } {
  const waste = 1 + Math.min(30, Math.max(0, wastePct)) / 100
  const membraneM2 = areaM2 * norms.waterproofingM2PerM2 * Math.max(1, layers) * waste

  if (areaM2 <= 0) {
    return { materials: [], notes: ['Geçerli alan girin.'] }
  }

  const materials: ComputedMaterial[] = [
      {
        key: 'membrane',
        label: 'Su yalıtımı (membran / sürme)',
        quantity: round2(membraneM2),
        unit: 'm2',
        category: 'Yalıtım',
      },
      {
        key: 'primer',
        label: 'Astar',
        quantity: round2(areaM2 * norms.waterproofingPrimerLtPerM2 * layers),
        unit: 'lt',
        category: 'Yalıtım',
      },
    ]
  return {
    materials,
    notes: ['Temel/perde/banyo yalıtımı; kat sayısı bindirme içindir.'],
  }
}

export function computeFormwork(
  concreteVolumeM3: number,
  norms: NormProfile
): { materials: ComputedMaterial[]; notes: string[] } {
  if (concreteVolumeM3 <= 0) {
    return { materials: [], notes: ['Beton hacmi girin.'] }
  }

  const m2 = concreteVolumeM3 * norms.formworkM2PerM3Concrete

  const materials: ComputedMaterial[] = [
      {
        key: 'formwork',
        label: 'Kalıp işi (temas yüzeyi yaklaşık)',
        quantity: round2(m2),
        unit: 'm2',
        category: 'Kalıp',
      },
    ]
  return {
    materials,
    notes: ['m³ beton başına kalıp m² normu; kolon/kiriş için artırılabilir.'],
  }
}

function round2(n: number) {
  return Math.round(n * 100) / 100
}
