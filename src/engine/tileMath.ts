/**
 * Deterministik kaplama (fayans) metraj motoru.
 * Davranış: docs/MATH_SPEC.md
 */

export type WastePolicy = 'simple' | 'medium' | 'conservative'

export interface TileSurfaceInput {
  areaM2: number
  tileWidthCm: number
  tileHeightCm: number
  jointMm: number
  wastePct: number
  wastePolicy: WastePolicy
  /** Yaklaşık derz harcı kg (uyarı metni ile birlikte sunulmalı) */
  includeGroutEstimate?: boolean
  /** kg/m², varsayılan 1.3 */
  groutKgPerM2?: number
}

export interface TileComputationResult {
  tileAreaM2: number
  netPieces: number
  grossPieces: number
  groutApproxKg?: number
  steps: string[]
}

const GROUT_DISCLAIMER =
  'Yaklaşık; ürün teknik föyüne ve şantiye derz derinliğine göre doğrulayın.'

export function tileAreaM2(tileWidthCm: number, tileHeightCm: number): number {
  return (tileWidthCm / 100) * (tileHeightCm / 100)
}

export function netPieces(areaM2: number, tileWidthCm: number, tileHeightCm: number): number {
  const a = tileAreaM2(tileWidthCm, tileHeightCm)
  if (a <= 0) throw new Error('Geçersiz plaka boyutu')
  if (areaM2 <= 0) throw new Error('Alan pozitif olmalı')
  return areaM2 / a
}

/** Kayan nokta gürültüsünde (ör. 18.000000000004) gereksiz üst tamsayıyı önler. */
function stableCeil(x: number): number {
  const r = Math.round(x)
  if (Math.abs(x - r) < 1e-6) return r
  return Math.ceil(x - 1e-9)
}

export function grossPieces(
  net: number,
  wastePct: number,
  policy: WastePolicy
): number {
  if (wastePct < 0 || wastePct > 100) throw new Error('Ziyan payı % 0–100 aralığında olmalı')
  const f = 1 + wastePct / 100
  switch (policy) {
    case 'simple':
      return stableCeil(net * f)
    case 'medium':
      return stableCeil(Math.ceil(net) * f)
    case 'conservative':
      return stableCeil(Math.ceil(net) * f) + 1
    default:
      throw new Error('Bilinmeyen ziyan politikası')
  }
}

export function computeTileSurface(input: TileSurfaceInput): TileComputationResult {
  const { areaM2, tileWidthCm, tileHeightCm, jointMm, wastePct, wastePolicy } = input
  if (jointMm < 0) throw new Error('Derz negatif olamaz')

  const aTile = tileAreaM2(tileWidthCm, tileHeightCm)
  const nNet = netPieces(areaM2, tileWidthCm, tileHeightCm)
  const nGross = grossPieces(nNet, wastePct, wastePolicy)

  const steps: string[] = [
    `A_plaka = (${tileWidthCm}/100)×(${tileHeightCm}/100) = ${aTile.toFixed(4)} m²`,
    `N_net = ${areaM2} / ${aTile.toFixed(4)} = ${nNet.toFixed(4)} plaka`,
    `Ziyan politikası: ${wastePolicy}, ziyan %${wastePct} → N_gross = ${nGross}`,
  ]

  let groutApproxKg: number | undefined
  if (input.includeGroutEstimate) {
    const k = input.groutKgPerM2 ?? 1.3
    groutApproxKg = Math.round(areaM2 * k * 100) / 100
    steps.push(`Derz harcı (yaklaşık): ${areaM2}×${k} ≈ ${groutApproxKg} kg — ${GROUT_DISCLAIMER}`)
  }

  return {
    tileAreaM2: aTile,
    netPieces: nNet,
    grossPieces: nGross,
    groutApproxKg,
    steps,
  }
}
