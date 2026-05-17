import { describe, expect, it } from 'vitest'
import { buildQuoteCsv, buildQuoteHtml } from './quoteDocument'
import { emptyOrganizationProfile } from '../types/organization'
import { emptyProject } from '../types/domain'
import type { CostLine } from '../types/costEstimate'

function line(partial: Partial<CostLine> & Pick<CostLine, 'label'>): CostLine {
  return {
    id: 'l1',
    label: partial.label,
    quantity: partial.quantity ?? 10,
    unit: partial.unit ?? 'm2',
    unitPriceTry: partial.unitPriceTry ?? 100,
    source: { type: 'manual' },
    category: partial.category,
  }
}

describe('buildQuoteCsv', () => {
  it('includes BOM, firm name and totals', () => {
    const org = { ...emptyOrganizationProfile(), companyName: 'ABC İnşaat' }
    const project = emptyProject('Villa', 'civil')
    project.costEstimate.lines = [line({ label: 'Beton', category: 'Betonarme' })]
    const csv = buildQuoteCsv(project, org)
    expect(csv.charCodeAt(0)).toBe(0xfeff)
    expect(csv).toContain('ABC İnşaat')
    expect(csv).toContain('Beton')
    expect(csv).toContain('GENEL TOPLAM')
  })
})

describe('buildQuoteHtml', () => {
  it('renders company block and line table', () => {
    const org = {
      ...emptyOrganizationProfile(),
      companyName: 'Test Ltd',
      logoBase64: 'data:image/png;base64,abc',
    }
    const project = emptyProject('Proje X', 'interior')
    project.clientName = 'Müşteri A'
    project.costEstimate.lines = [line({ label: 'Fayans', category: 'Kaplama' })]
    const html = buildQuoteHtml(project, org)
    expect(html).toContain('Test Ltd')
    expect(html).toContain('data:image/png;base64,abc')
    expect(html).toContain('Müşteri A')
    expect(html).toContain('Fayans')
    expect(html).toContain('YAKLAŞIK MALİYET')
    expect(html).not.toContain('motion-placeholder')
  })
})
