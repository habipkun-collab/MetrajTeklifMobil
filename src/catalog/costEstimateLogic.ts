import type { CostEstimate, CostLine, CostLineSource } from '../types/costEstimate'

import type { Project } from '../types/domain'



export function sourceKey(source: CostLineSource): string {

  if (source.type === 'manual') return 'manual'

  if (source.type === 'metraj') {

    return `metraj:${source.spaceId}:${source.workItemId}:${source.materialKey}`

  }

  return `${source.type}:${source.spaceId}:${source.lineItemId}`

}



export function buildMetrajCostLines(project: Project): CostLine[] {

  const lines: CostLine[] = []

  for (const space of project.spaces) {

    for (const wi of space.workItems) {

      const materials = wi.computed?.materials ?? []

      for (const m of materials) {

        if (m.key === 'wall_area' || m.key === 'area' || m.key === 'roof_area' || m.key === 'facade_area')
          continue

        lines.push({

          id: `cost_${wi.id}_${m.key}`,

          label: `${space.name} — ${wi.label} (${m.label})`,

          quantity: m.quantity,

          unit: m.unit,

          category: m.category,

          source: {

            type: 'metraj',

            spaceId: space.id,

            workItemId: wi.id,

            materialKey: m.key,

          },

        })

      }

    }

  }

  return lines

}



/** Metraj satırlarını günceller; elle eklenen kalemleri ve birim fiyatları mümkün olduğunca korur. */

export function syncCostLinesFromMetraj(

  project: Project,

  existing: CostEstimate

): CostEstimate {

  const fromMetraj = buildMetrajCostLines(project)

  const priceBySource = new Map<string, number>()

  for (const line of existing.lines) {

    if (line.unitPriceTry != null) {

      priceBySource.set(sourceKey(line.source), line.unitPriceTry)

    }

  }



  const manualLines = existing.lines.filter((l) => l.source.type === 'manual')



  const mergedMetraj = fromMetraj.map((line) => {

    const key = sourceKey(line.source)

    const prevPrice = priceBySource.get(key)

    return prevPrice != null ? { ...line, unitPriceTry: prevPrice } : line

  })



  return {

    laborMarkupPct: existing.laborMarkupPct,

    lines: [...mergedMetraj, ...manualLines],

  }

}



export function lineAmount(line: CostLine): number | undefined {

  if (line.unitPriceTry == null || line.quantity <= 0) return undefined

  return line.quantity * line.unitPriceTry

}



export interface CostTotals {

  materialSubtotal: number

  laborAmount: number

  subtotalBeforeVat: number

  vatAmount: number

  grandTotal: number

  pricedLineCount: number

  totalLineCount: number

}



export function computeCostTotals(

  estimate: CostEstimate,

  vatRatePct: number

): CostTotals {

  let materialSubtotal = 0

  let pricedLineCount = 0

  for (const line of estimate.lines) {

    const amt = lineAmount(line)

    if (amt != null) {

      materialSubtotal += amt

      pricedLineCount++

    }

  }

  const laborPct = Math.min(100, Math.max(0, estimate.laborMarkupPct))

  const laborAmount = materialSubtotal * (laborPct / 100)

  const subtotalBeforeVat = materialSubtotal + laborAmount

  const vatAmount = subtotalBeforeVat * (vatRatePct / 100)

  const grandTotal = subtotalBeforeVat + vatAmount



  return {

    materialSubtotal,

    laborAmount,

    subtotalBeforeVat,

    vatAmount,

    grandTotal,

    pricedLineCount,

    totalLineCount: estimate.lines.length,

  }

}


