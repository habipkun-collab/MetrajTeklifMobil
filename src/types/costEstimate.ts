export type CostUnit = 'adet' | 'kg' | 'm2' | 'm3' | 'm' | 'lt' | 'torba' | 'takim' | 'diger'

export const COST_UNIT_LABELS: Record<CostUnit, string> = {
  adet: 'adet',
  kg: 'kg',
  m2: 'm²',
  m3: 'm³',
  m: 'm',
  lt: 'lt',
  torba: 'torba',
  takim: 'takım',
  diger: 'birim',
}

export type CostLineSource =
  | { type: 'metraj'; spaceId: string; workItemId: string; materialKey: string }
  /** @deprecated Eski projeler */
  | { type: 'tile_pieces'; spaceId: string; lineItemId: string }
  | { type: 'tile_grout'; spaceId: string; lineItemId: string }
  | { type: 'manual' }

export interface CostLine {
  id: string
  label: string
  quantity: number
  unit: CostUnit
  unitPriceTry?: number
  source: CostLineSource
  /** Teklifte gruplama (örn. Kaplama, Tesisat) */
  category?: string
}

export interface CostEstimate {
  lines: CostLine[]
  /** Malzeme ara toplamı üzerine uygulanır (0–100) */
  laborMarkupPct: number
}

export function emptyCostEstimate(): CostEstimate {
  return { lines: [], laborMarkupPct: 0 }
}
