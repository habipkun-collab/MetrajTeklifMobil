import type { TileComputationResult, WastePolicy } from '../engine/tileMath'
import type { CostUnit } from './costEstimate'

export type WorkKind =
  | 'tile'
  | 'masonry_wall'
  | 'excavation'
  | 'concrete'
  | 'reinforced_concrete'
  | 'plaster'
  | 'screed'
  | 'paint'
  | 'roof'
  | 'steel'
  | 'electrical'
  | 'plumbing'
  | 'insulation'
  | 'waterproofing'
  | 'formwork'
  | 'facade'
  | 'elevator'
  | 'hvac'
  | 'scaffolding'

export type MasonryMaterial = 'brick_12' | 'brick_19' | 'aerated_20'
export type FacadeCladding = 'stone' | 'composite' | 'glass' | 'paint_only'
export type HvacSystem = 'split' | 'vrf' | 'ducted'
export type ConcreteMix = 'ready' | 'site'
export type RoofCovering = 'tile' | 'membrane' | 'metal_sheet'
export type SteelRole = 'rebar' | 'mesh' | 'structural'
export type SteelQuantityMode = 'direct_kg' | 'per_m2'
export type ElectricalDensity = 'light' | 'standard' | 'dense'
export type InsulationType = 'eps' | 'xps' | 'mineral_wool'
export type RebarElement = 'foundation' | 'slab' | 'column'

export interface ComputedMaterial {
  key: string
  label: string
  quantity: number
  unit: CostUnit
  category: string
}

export interface WorkComputation {
  summary: string
  materials: ComputedMaterial[]
  notes: string[]
}

export interface WorkItemBase {
  id: string
  label: string
  /** Malzeme miktarlarına uygulanır (100 = norm, 110 = %10 şantiye payı) */
  normMultiplierPct?: number
  computed?: WorkComputation
}

export interface TileWorkItem extends WorkItemBase {
  kind: 'tile'
  areaM2: number
  tileWidthCm: number
  tileHeightCm: number
  jointMm: number
  wastePct: number
  wastePolicy: WastePolicy
  includeGroutEstimate: boolean
  tileComputed?: TileComputationResult
}

export interface MasonryWallWorkItem extends WorkItemBase {
  kind: 'masonry_wall'
  lengthM: number
  heightM: number
  thicknessCm: number
  openingsM2: number
  material: MasonryMaterial
  wastePct: number
}

export interface ExcavationWorkItem extends WorkItemBase {
  kind: 'excavation'
  lengthM: number
  widthM: number
  depthM: number
  bulkingPct: number
}

export interface ConcreteWorkItem extends WorkItemBase {
  kind: 'concrete'
  lengthM: number
  widthM: number
  thicknessM: number
  mix: ConcreteMix
  wastePct: number
}

export interface ReinforcedConcreteWorkItem extends WorkItemBase {
  kind: 'reinforced_concrete'
  lengthM: number
  widthM: number
  thicknessM: number
  element: RebarElement
  rebarKgPerM3: number
  /** Statik/keşiften gelen toplam donatı kg — açıkken hacim×yoğunluk yerine kullanılır */
  useImportedRebarKg: boolean
  importedRebarKg: number
  mix: ConcreteMix
  wastePct: number
}

export interface PlasterWorkItem extends WorkItemBase {
  kind: 'plaster'
  areaM2: number
  thicknessMm: number
  wastePct: number
}

export interface ScreedWorkItem extends WorkItemBase {
  kind: 'screed'
  areaM2: number
  thicknessCm: number
  wastePct: number
}

export interface PaintWorkItem extends WorkItemBase {
  kind: 'paint'
  areaM2: number
  coats: number
  wastePct: number
}

export interface RoofWorkItem extends WorkItemBase {
  kind: 'roof'
  areaM2: number
  covering: RoofCovering
  slopeExtraPct: number
  wastePct: number
}

export interface SteelWorkItem extends WorkItemBase {
  kind: 'steel'
  role: SteelRole
  mode: SteelQuantityMode
  directKg: number
  areaM2: number
  kgPerM2: number
  wastePct: number
}

export interface ElectricalWorkItem extends WorkItemBase {
  kind: 'electrical'
  areaM2: number
  density: ElectricalDensity
}

export interface PlumbingWorkItem extends WorkItemBase {
  kind: 'plumbing'
  areaM2: number
  fixtureCount: number
}

export interface InsulationWorkItem extends WorkItemBase {
  kind: 'insulation'
  areaM2: number
  thicknessCm: number
  insulationType: InsulationType
  wastePct: number
}

export interface WaterproofingWorkItem extends WorkItemBase {
  kind: 'waterproofing'
  areaM2: number
  layers: number
  wastePct: number
}

export interface FormworkWorkItem extends WorkItemBase {
  kind: 'formwork'
  concreteVolumeM3: number
}

export interface FacadeWorkItem extends WorkItemBase {
  kind: 'facade'
  areaM2: number
  cladding: FacadeCladding
  wastePct: number
}

export interface ElevatorWorkItem extends WorkItemBase {
  kind: 'elevator'
  elevatorCount: number
  stopCount: number
}

export interface HvacWorkItem extends WorkItemBase {
  kind: 'hvac'
  areaM2: number
  system: HvacSystem
}

export interface ScaffoldingWorkItem extends WorkItemBase {
  kind: 'scaffolding'
  perimeterM: number
  heightM: number
}

export type WorkItem =
  | TileWorkItem
  | MasonryWallWorkItem
  | ExcavationWorkItem
  | ConcreteWorkItem
  | ReinforcedConcreteWorkItem
  | PlasterWorkItem
  | ScreedWorkItem
  | PaintWorkItem
  | RoofWorkItem
  | SteelWorkItem
  | ElectricalWorkItem
  | PlumbingWorkItem
  | InsulationWorkItem
  | WaterproofingWorkItem
  | FormworkWorkItem
  | FacadeWorkItem
  | ElevatorWorkItem
  | HvacWorkItem
  | ScaffoldingWorkItem

export type WorkItemInput =
  | Omit<TileWorkItem, 'id' | 'computed' | 'tileComputed'>
  | Omit<MasonryWallWorkItem, 'id' | 'computed'>
  | Omit<ExcavationWorkItem, 'id' | 'computed'>
  | Omit<ConcreteWorkItem, 'id' | 'computed'>
  | Omit<ReinforcedConcreteWorkItem, 'id' | 'computed'>
  | Omit<PlasterWorkItem, 'id' | 'computed'>
  | Omit<ScreedWorkItem, 'id' | 'computed'>
  | Omit<PaintWorkItem, 'id' | 'computed'>
  | Omit<RoofWorkItem, 'id' | 'computed'>
  | Omit<SteelWorkItem, 'id' | 'computed'>
  | Omit<ElectricalWorkItem, 'id' | 'computed'>
  | Omit<PlumbingWorkItem, 'id' | 'computed'>
  | Omit<InsulationWorkItem, 'id' | 'computed'>
  | Omit<WaterproofingWorkItem, 'id' | 'computed'>
  | Omit<FormworkWorkItem, 'id' | 'computed'>
  | Omit<FacadeWorkItem, 'id' | 'computed'>
  | Omit<ElevatorWorkItem, 'id' | 'computed'>
  | Omit<HvacWorkItem, 'id' | 'computed'>
  | Omit<ScaffoldingWorkItem, 'id' | 'computed'>
