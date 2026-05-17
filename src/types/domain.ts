import type { TileComputationResult, WastePolicy } from '../engine/tileMath'
import { emptyCostEstimate, type CostEstimate } from './costEstimate'
import type { WorkItem } from './workItem'

export type Discipline = 'interior' | 'landscape' | 'civil'

export interface Project {
  id: string
  name: string
  discipline: Discipline
  clientName?: string
  vatRatePct: number
  spaces: Space[]
  costEstimate: CostEstimate
  createdAt: string
}

export interface Space {
  id: string
  name: string
  workItems: WorkItem[]
}

/** @deprecated Eski kayıtlar; normalizeSpace ile workItems’a taşınır */
export interface TileLineItem {
  id: string
  label: string
  areaM2: number
  tileWidthCm: number
  tileHeightCm: number
  jointMm: number
  wastePct: number
  wastePolicy: WastePolicy
  includeGroutEstimate: boolean
  unitPriceTry?: number
  computed?: TileComputationResult
}

type LegacySpace = Space & { lineItems?: TileLineItem[] }

function tileLineToWork(li: TileLineItem): WorkItem {
  return {
    kind: 'tile',
    id: li.id,
    label: li.label,
    areaM2: li.areaM2,
    tileWidthCm: li.tileWidthCm,
    tileHeightCm: li.tileHeightCm,
    jointMm: li.jointMm,
    wastePct: li.wastePct,
    wastePolicy: li.wastePolicy,
    includeGroutEstimate: li.includeGroutEstimate,
    tileComputed: li.computed,
  }
}

export function normalizeSpace(space: LegacySpace): Space {
  if (space.workItems && space.workItems.length > 0) {
    return { id: space.id, name: space.name, workItems: space.workItems }
  }
  const legacy = space.lineItems ?? []
  return {
    id: space.id,
    name: space.name,
    workItems: legacy.map(tileLineToWork),
  }
}

export function normalizeProject(p: Project & { spaces?: LegacySpace[] }): Project {
  return {
    ...p,
    spaces: (p.spaces ?? []).map(normalizeSpace),
    costEstimate: p.costEstimate ?? emptyCostEstimate(),
  }
}

export function emptyProject(name: string, discipline: Discipline): Project {
  const ts = Date.now()
  const id = `p_${ts}`
  const now = new Date().toISOString()
  return {
    id,
    name,
    discipline,
    vatRatePct: 20,
    spaces: [
      {
        id: `s_${ts}_default`,
        name: 'Varsayılan alan',
        workItems: [],
      },
    ],
    costEstimate: emptyCostEstimate(),
    createdAt: now,
  }
}
