import type { ComputedMaterial } from '../types/workItem'

const METRAJ_ONLY_KEYS = new Set(['wall_area', 'area', 'roof_area', 'facade_area'])

export function applyNormMultiplier(
  materials: ComputedMaterial[],
  normMultiplierPct = 100
): ComputedMaterial[] {
  const factor = Math.min(200, Math.max(50, normMultiplierPct)) / 100
  if (factor === 1) return materials

  return materials.map((m) => {
    if (METRAJ_ONLY_KEYS.has(m.key)) return m
    const qty = m.quantity * factor
    const rounded =
      m.unit === 'adet' || m.key === 'outlets' || m.key === 'panel' || m.key === 'fixtures'
        ? Math.ceil(qty)
        : Math.round(qty * 100) / 100
    return { ...m, quantity: rounded }
  })
}

export function finalizeComputation(
  item: { normMultiplierPct?: number },
  computed: { summary: string; materials: ComputedMaterial[]; notes: string[] }
) {
  const pct = item.normMultiplierPct ?? 100
  const materials = applyNormMultiplier(computed.materials, pct)
  const summary =
    pct !== 100 ? `${computed.summary} · kalem çarpanı %${pct}` : computed.summary
  const notes =
    pct !== 100
      ? [...computed.notes, `Malzeme miktarlarına %${pct} kalem çarpanı uygulandı.`]
      : computed.notes
  return { summary, materials, notes }
}
