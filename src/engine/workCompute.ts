import { computeTileSurface } from './tileMath'
import { computeMasonryWall } from './masonryWall'
import { computeExcavation } from './excavation'
import {
  computeConcreteVolume,
  computeReinforcedConcrete,
  rebarKgPerM3ForElement,
} from './concrete'
import { computePlaster, computePaint, computeScreed } from './finishing'
import { computeRoof } from './roof'
import { computeSteel } from './steelWork'
import {
  computeElectrical,
  computeFormwork,
  computeInsulation,
  computePlumbing,
  computeWaterproofing,
} from './mepPackages'
import { computeFacade } from './facade'
import { computeElevator, computeHvac, computeScaffolding } from './buildingPackages'
import { finalizeComputation } from './applyNormMultiplier'
import type { NormProfile } from '../types/norms'
import { defaultNormProfile } from '../types/norms'
import type { ComputedMaterial, WorkItem, WorkItemInput } from '../types/workItem'

function wrapComputed<T extends WorkItem>(item: T, raw: { summary: string; materials: ComputedMaterial[]; notes: string[] }): T {
  return { ...item, computed: finalizeComputation(item, raw) }
}

export function computeWorkItem(item: WorkItem, norms: NormProfile = defaultNormProfile()): WorkItem {
  const computed = computeWorkItemRaw(item, norms)
  return computed
}

function computeWorkItemRaw(item: WorkItem, norms: NormProfile): WorkItem {
  switch (item.kind) {
    case 'tile':
      return computeTileWork(item)
    case 'masonry_wall':
      return computeMasonryWork(item, norms)
    case 'excavation':
      return computeExcavationWork(item)
    case 'concrete':
      return computeConcreteWork(item, norms)
    case 'reinforced_concrete':
      return computeReinforcedConcreteWork(item, norms)
    case 'plaster':
      return computePlasterWork(item, norms)
    case 'screed':
      return computeScreedWork(item, norms)
    case 'paint':
      return computePaintWork(item, norms)
    case 'roof':
      return computeRoofWork(item, norms)
    case 'steel':
      return computeSteelWork(item, norms)
    case 'electrical':
      return computeElectricalWork(item, norms)
    case 'plumbing':
      return computePlumbingWork(item, norms)
    case 'insulation':
      return computeInsulationWork(item, norms)
    case 'waterproofing':
      return computeWaterproofingWork(item, norms)
    case 'formwork':
      return computeFormworkWork(item, norms)
    case 'facade':
      return computeFacadeWork(item, norms)
    case 'elevator':
      return computeElevatorWork(item, norms)
    case 'hvac':
      return computeHvacWork(item, norms)
    case 'scaffolding':
      return computeScaffoldingWork(item, norms)
    default:
      return item
  }
}

function computeTileWork(item: Extract<WorkItem, { kind: 'tile' }>): WorkItem {
  const wastePct = Math.min(50, Math.max(0, item.wastePct))
  try {
    const tileComputed = computeTileSurface({
      areaM2: item.areaM2,
      tileWidthCm: item.tileWidthCm,
      tileHeightCm: item.tileHeightCm,
      jointMm: Math.max(0, item.jointMm),
      wastePct,
      wastePolicy: item.wastePolicy,
      includeGroutEstimate: item.includeGroutEstimate,
    })
    const materials: ComputedMaterial[] = []
    if (tileComputed.grossPieces > 0) {
      materials.push({
        key: 'tile_pieces',
        label: 'Kaplama plakası (brüt)',
        quantity: tileComputed.grossPieces,
        unit: 'adet',
        category: 'Kaplama',
      })
    }
    if (item.includeGroutEstimate && tileComputed.groutApproxKg != null && tileComputed.groutApproxKg > 0) {
      materials.push({
        key: 'grout',
        label: 'Derz harcı',
        quantity: tileComputed.groutApproxKg,
        unit: 'kg',
        category: 'Derz',
      })
    }
    return wrapComputed(item, {
      summary: `${item.areaM2} m² → ${tileComputed.grossPieces} plaka`,
      materials,
      notes: ['Kaplama metrajı plaka adedi ve isteğe bağlı derz kg üretir.'],
    })
  } catch {
    return { ...item, tileComputed: undefined, computed: undefined }
  }
}

function computeMasonryWork(
  item: Extract<WorkItem, { kind: 'masonry_wall' }>,
  norms: NormProfile
): WorkItem {
  const r = computeMasonryWall(
    {
      lengthM: item.lengthM,
      heightM: item.heightM,
      openingsM2: item.openingsM2,
      material: item.material,
      wastePct: item.wastePct,
    },
    norms
  )
  return wrapComputed(item, {
    summary: `Duvar ${r.wallAreaM2.toFixed(2)} m²`,
    materials: r.materials,
    notes: r.notes,
  })
}

function computeExcavationWork(item: Extract<WorkItem, { kind: 'excavation' }>): WorkItem {
  const r = computeExcavation({
    lengthM: item.lengthM,
    widthM: item.widthM,
    depthM: item.depthM,
    bulkingPct: item.bulkingPct,
  })
  const vol = item.lengthM * item.widthM * item.depthM
  return wrapComputed(item, {
    summary: `Kazı ${vol > 0 ? vol.toFixed(2) : '0'} m³`,
    materials: r.materials,
    notes: r.notes,
  })
}

function computeConcreteWork(
  item: Extract<WorkItem, { kind: 'concrete' }>,
  norms: NormProfile
): WorkItem {
  const r = computeConcreteVolume(
    {
      lengthM: item.lengthM,
      widthM: item.widthM,
      thicknessM: item.thicknessM,
      mix: item.mix,
      wastePct: item.wastePct,
    },
    norms
  )
  return wrapComputed(item, {
    summary: `Beton ${r.volumeM3.toFixed(2)} m³`,
    materials: r.materials,
    notes: r.notes,
  })
}

function computeReinforcedConcreteWork(
  item: Extract<WorkItem, { kind: 'reinforced_concrete' }>,
  norms: NormProfile
): WorkItem {
  const element = item.element ?? 'foundation'
  const rebarKgPerM3 =
    item.rebarKgPerM3 > 0 ? item.rebarKgPerM3 : rebarKgPerM3ForElement(element, norms)
  const useImport = item.useImportedRebarKg && item.importedRebarKg > 0
  const r = computeReinforcedConcrete(
    {
      lengthM: item.lengthM,
      widthM: item.widthM,
      thicknessM: item.thicknessM,
      mix: item.mix,
      wastePct: item.wastePct,
      rebarKgPerM3: useImport ? 0 : rebarKgPerM3,
    },
    norms
  )
  let materials = r.materials
  if (useImport) {
    materials = materials.map((m) =>
      m.key === 'rebar'
        ? {
            ...m,
            label: 'Donatı çelik (statik/keşif)',
            quantity: Math.round(item.importedRebarKg * 100) / 100,
          }
        : m
    )
    if (!materials.some((m) => m.key === 'rebar')) {
      materials.push({
        key: 'rebar',
        label: 'Donatı çelik (statik/keşif)',
        quantity: Math.round(item.importedRebarKg * 100) / 100,
        unit: 'kg',
        category: 'Betonarme',
      })
    }
  }
  const summary = useImport
    ? `Betonarme ${r.volumeM3.toFixed(2)} m³ · donatı ${item.importedRebarKg} kg (import)`
    : `Betonarme ${r.volumeM3.toFixed(2)} m³ · ${rebarKgPerM3} kg/m³`
  return wrapComputed(
    { ...item, element, rebarKgPerM3 },
    {
      summary,
      materials,
      notes: useImport
        ? [...r.notes, 'Donatı miktarı statik/keşiften import edildi.']
        : r.notes,
    }
  )
}

function computePlasterWork(
  item: Extract<WorkItem, { kind: 'plaster' }>,
  norms: NormProfile
): WorkItem {
  const r = computePlaster(item.areaM2, item.thicknessMm, item.wastePct, norms)
  return wrapComputed(item, {
    summary: `Sıva ${item.areaM2} m²`,
    materials: r.materials,
    notes: r.notes,
  })
}

function computeScreedWork(item: Extract<WorkItem, { kind: 'screed' }>, norms: NormProfile): WorkItem {
  const r = computeScreed(item.areaM2, item.thicknessCm, item.wastePct, norms)
  return wrapComputed(item, {
    summary: `Şap ${item.areaM2} m²`,
    materials: r.materials,
    notes: r.notes,
  })
}

function computePaintWork(item: Extract<WorkItem, { kind: 'paint' }>, norms: NormProfile): WorkItem {
  const r = computePaint(item.areaM2, item.coats, item.wastePct, norms)
  return wrapComputed(item, {
    summary: `Boya ${item.areaM2} m² · ${item.coats} kat`,
    materials: r.materials,
    notes: r.notes,
  })
}

function computeRoofWork(item: Extract<WorkItem, { kind: 'roof' }>, norms: NormProfile): WorkItem {
  const r = computeRoof(
    {
      areaM2: item.areaM2,
      covering: item.covering,
      wastePct: item.wastePct,
      slopeExtraPct: item.slopeExtraPct,
    },
    norms
  )
  return wrapComputed(item, {
    summary: `Çatı ${item.areaM2} m²`,
    materials: r.materials,
    notes: r.notes,
  })
}

function computeSteelWork(item: Extract<WorkItem, { kind: 'steel' }>, norms: NormProfile): WorkItem {
  const r = computeSteel(
    {
      role: item.role,
      mode: item.mode,
      directKg: item.directKg,
      areaM2: item.areaM2,
      kgPerM2: item.kgPerM2,
      wastePct: item.wastePct,
    },
    norms
  )
  return wrapComputed(item, {
    summary:
      item.mode === 'direct_kg'
        ? `Çelik ${item.directKg} kg`
        : `Çelik ${item.areaM2} m² × ${item.kgPerM2 || 'norm'} kg/m²`,
    materials: r.materials,
    notes: r.notes,
  })
}

function computeElectricalWork(
  item: Extract<WorkItem, { kind: 'electrical' }>,
  norms: NormProfile
): WorkItem {
  const r = computeElectrical(item.areaM2, item.density, norms)
  return wrapComputed(item, {
    summary: `Elektrik ${item.areaM2} m² · ${item.density}`,
    materials: r.materials,
    notes: r.notes,
  })
}

function computePlumbingWork(
  item: Extract<WorkItem, { kind: 'plumbing' }>,
  norms: NormProfile
): WorkItem {
  const r = computePlumbing(item.areaM2, item.fixtureCount, norms)
  return wrapComputed(item, {
    summary: `Sıhhi ${item.areaM2} m² · ${item.fixtureCount} armatür`,
    materials: r.materials,
    notes: r.notes,
  })
}

function computeInsulationWork(
  item: Extract<WorkItem, { kind: 'insulation' }>,
  norms: NormProfile
): WorkItem {
  const r = computeInsulation(item.areaM2, item.thicknessCm, item.insulationType, item.wastePct, norms)
  return wrapComputed(item, {
    summary: `Yalıtım ${item.areaM2} m²`,
    materials: r.materials,
    notes: r.notes,
  })
}

function computeWaterproofingWork(
  item: Extract<WorkItem, { kind: 'waterproofing' }>,
  norms: NormProfile
): WorkItem {
  const r = computeWaterproofing(item.areaM2, item.layers, item.wastePct, norms)
  return wrapComputed(item, {
    summary: `Su yalıtımı ${item.areaM2} m² · ${item.layers} kat`,
    materials: r.materials,
    notes: r.notes,
  })
}

function computeFormworkWork(
  item: Extract<WorkItem, { kind: 'formwork' }>,
  norms: NormProfile
): WorkItem {
  const r = computeFormwork(item.concreteVolumeM3, norms)
  return wrapComputed(item, {
    summary: `Kalıp ${item.concreteVolumeM3} m³ beton için`,
    materials: r.materials,
    notes: r.notes,
  })
}

function computeFacadeWork(item: Extract<WorkItem, { kind: 'facade' }>, norms: NormProfile): WorkItem {
  const r = computeFacade(
    { areaM2: item.areaM2, cladding: item.cladding, wastePct: item.wastePct },
    norms
  )
  return wrapComputed(item, {
    summary: `Cephe ${item.areaM2} m²`,
    materials: r.materials,
    notes: r.notes,
  })
}

function computeElevatorWork(item: Extract<WorkItem, { kind: 'elevator' }>, norms: NormProfile): WorkItem {
  const r = computeElevator(item.elevatorCount, item.stopCount, norms)
  return wrapComputed(item, {
    summary: `${item.elevatorCount} asansör · ${item.stopCount} durak`,
    materials: r.materials,
    notes: r.notes,
  })
}

function computeHvacWork(item: Extract<WorkItem, { kind: 'hvac' }>, norms: NormProfile): WorkItem {
  const r = computeHvac(item.areaM2, item.system, norms)
  return wrapComputed(item, {
    summary: `HVAC ${item.areaM2} m² · ${item.system}`,
    materials: r.materials,
    notes: r.notes,
  })
}

function computeScaffoldingWork(
  item: Extract<WorkItem, { kind: 'scaffolding' }>,
  norms: NormProfile
): WorkItem {
  const r = computeScaffolding(item.perimeterM, item.heightM, norms)
  return wrapComputed(item, {
    summary: `İskele ${item.perimeterM}×${item.heightM} m`,
    materials: r.materials,
    notes: r.notes,
  })
}

export function defaultWorkItem(kind: WorkItem['kind'], norms: NormProfile = defaultNormProfile()): WorkItemInput {
  switch (kind) {
    case 'tile':
      return {
        kind: 'tile',
        label: 'Seramik / fayans',
        areaM2: 12,
        tileWidthCm: 60,
        tileHeightCm: 60,
        jointMm: 2,
        wastePct: 8,
        wastePolicy: 'medium',
        includeGroutEstimate: true,
      }
    case 'masonry_wall':
      return {
        kind: 'masonry_wall',
        label: 'Duvar örme',
        lengthM: 5,
        heightM: 2.8,
        thicknessCm: 19,
        openingsM2: 2,
        material: 'brick_19',
        wastePct: 5,
      }
    case 'excavation':
      return {
        kind: 'excavation',
        label: 'Temel kazısı',
        lengthM: 10,
        widthM: 8,
        depthM: 1.2,
        bulkingPct: 15,
      }
    case 'concrete':
      return {
        kind: 'concrete',
        label: 'Temel betonu',
        lengthM: 10,
        widthM: 8,
        thicknessM: 0.35,
        mix: 'ready',
        wastePct: 3,
      }
    case 'reinforced_concrete':
      return {
        kind: 'reinforced_concrete',
        label: 'Temel betonarme',
        lengthM: 10,
        widthM: 8,
        thicknessM: 0.35,
        element: 'foundation',
        rebarKgPerM3: norms.rebarKgPerM3Foundation,
        useImportedRebarKg: false,
        importedRebarKg: 0,
        mix: 'ready',
        wastePct: 3,
        normMultiplierPct: 100,
      }
    case 'plaster':
      return { kind: 'plaster', label: 'İç sıva', areaM2: 40, thicknessMm: 15, wastePct: 8 }
    case 'screed':
      return { kind: 'screed', label: 'Şap', areaM2: 40, thicknessCm: 4, wastePct: 5 }
    case 'paint':
      return { kind: 'paint', label: 'İç cephe boya', areaM2: 40, coats: 2, wastePct: 5 }
    case 'roof':
      return {
        kind: 'roof',
        label: 'Çatı kaplama',
        areaM2: 120,
        covering: 'tile',
        slopeExtraPct: norms.roofSlopeWastePct,
        wastePct: 5,
      }
    case 'steel':
      return {
        kind: 'steel',
        label: 'Donatı / çelik',
        role: 'rebar',
        mode: 'per_m2',
        directKg: 0,
        areaM2: 100,
        kgPerM2: 0,
        wastePct: norms.steelWastePctDefault,
      }
    case 'electrical':
      return {
        kind: 'electrical',
        label: 'Elektrik tesisatı (paket)',
        areaM2: 100,
        density: 'standard',
      }
    case 'plumbing':
      return {
        kind: 'plumbing',
        label: 'Sıhhi tesisat (paket)',
        areaM2: 100,
        fixtureCount: 8,
      }
    case 'insulation':
      return {
        kind: 'insulation',
        label: 'Mantolama / yalıtım',
        areaM2: 80,
        thicknessCm: 5,
        insulationType: 'eps',
        wastePct: 5,
      }
    case 'waterproofing':
      return {
        kind: 'waterproofing',
        label: 'Su yalıtımı',
        areaM2: 40,
        layers: 2,
        wastePct: 8,
      }
    case 'formwork':
      return {
        kind: 'formwork',
        label: 'Kalıp işi',
        concreteVolumeM3: 28,
        normMultiplierPct: 100,
      }
    case 'facade':
      return {
        kind: 'facade',
        label: 'Cephe kaplama',
        areaM2: 200,
        cladding: 'composite',
        wastePct: 5,
        normMultiplierPct: 100,
      }
    case 'elevator':
      return {
        kind: 'elevator',
        label: 'Asansör',
        elevatorCount: 1,
        stopCount: 5,
        normMultiplierPct: 100,
      }
    case 'hvac':
      return {
        kind: 'hvac',
        label: 'Isıtma-soğutma',
        areaM2: 150,
        system: 'split',
        normMultiplierPct: 100,
      }
    case 'scaffolding':
      return {
        kind: 'scaffolding',
        label: 'Cephe iskelesi',
        perimeterM: 40,
        heightM: 12,
        normMultiplierPct: 100,
      }
    default:
      return defaultWorkItem('tile', norms)
  }
}
