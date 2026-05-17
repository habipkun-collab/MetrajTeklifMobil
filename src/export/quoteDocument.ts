import { computeCostTotals, lineAmount, type CostTotals } from '../catalog/costEstimateLogic'
import { DISCIPLINE_LABELS } from '../constants/disciplines'
import { COST_UNIT_LABELS } from '../types/costEstimate'
import type { OrganizationProfile } from '../types/organization'
import type { Project } from '../types/domain'

const DV = 'div'

function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function escCsvCell(s: string): string {
  if (/[;"\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function formatMoney(n: number): string {
  return n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDateTr(d: Date): string {
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function htmlEl(tag: string, attrs: string, inner: string): string {
  const attr = attrs ? ' ' + attrs : ''
  return '<' + tag + attr + '>' + inner + '</' + tag + '>'
}

export function buildQuoteCsv(project: Project, org: OrganizationProfile): string {
  const totals = computeCostTotals(project.costEstimate, project.vatRatePct)
  const rows: string[] = []
  const sep = ';'
  const push = (cells: (string | number)[]) =>
    rows.push(cells.map((c) => escCsvCell(String(c))).join(sep))

  rows.push('\uFEFF')
  push(['FİRMA', org.companyName || '—'])
  if (org.taxNo) push(['Vergi no', org.taxNo])
  push(['PROJE', project.name])
  if (project.clientName) push(['Müşteri', project.clientName])
  push(['Branş', DISCIPLINE_LABELS[project.discipline]])
  push(['Tarih', formatDateTr(new Date())])
  rows.push('')
  push(['Kalem', 'Kategori', 'Miktar', 'Birim', 'Birim fiyat (TRY)', 'Tutar (TRY)'])

  for (const line of project.costEstimate.lines) {
    const amt = lineAmount(line)
    push([
      line.label,
      line.category ?? '',
      line.quantity,
      COST_UNIT_LABELS[line.unit],
      line.unitPriceTry ?? '',
      amt != null ? formatMoney(amt) : '',
    ])
  }

  rows.push('')
  push(['Malzeme ara toplamı', '', '', '', '', formatMoney(totals.materialSubtotal)])
  if (project.costEstimate.laborMarkupPct > 0) {
    push([
      `İşçilik %${project.costEstimate.laborMarkupPct}`,
      '',
      '',
      '',
      '',
      formatMoney(totals.laborAmount),
    ])
  }
  push(['Ara toplam (KDV hariç)', '', '', '', '', formatMoney(totals.subtotalBeforeVat)])
  push([`KDV %${project.vatRatePct}`, '', '', '', '', formatMoney(totals.vatAmount)])
  push(['GENEL TOPLAM', '', '', '', '', formatMoney(totals.grandTotal)])

  return rows.join('\r\n')
}

function companyMetaHtml(org: OrganizationProfile): string {
  const parts: string[] = []
  if (org.companyName) {
    parts.push(htmlEl(DV, 'class="company-name"', escHtml(org.companyName)))
  }
  if (org.tagline) parts.push(escHtml(org.tagline))
  if (org.addressLine1) parts.push(escHtml(org.addressLine1))
  if (org.addressLine2) parts.push(escHtml(org.addressLine2))
  if (org.city) parts.push(escHtml(org.city))
  if (org.phone) parts.push('Tel: ' + escHtml(org.phone))
  if (org.email) parts.push(escHtml(org.email))
  if (org.website) parts.push(escHtml(org.website))
  if (org.taxOffice || org.taxNo) {
    parts.push(
      (org.taxOffice ? 'VD: ' + escHtml(org.taxOffice) : '') +
        (org.taxOffice && org.taxNo ? ' · ' : '') +
        (org.taxNo ? 'VKN: ' + escHtml(org.taxNo) : '')
    )
  }
  return parts.join('<br/>')
}

export function buildQuoteHtml(
  project: Project,
  org: OrganizationProfile,
  totals: CostTotals = computeCostTotals(project.costEstimate, project.vatRatePct)
): string {
  const logoBlock = org.logoBase64
    ? '<img src="' +
      org.logoBase64 +
      '" alt="Logo" style="max-height:72px;max-width:200px;object-fit:contain;" />'
    : ''

  const rowsHtml = project.costEstimate.lines
    .map((line) => {
      const amt = lineAmount(line)
      return (
        '<tr>' +
        '<td>' +
        escHtml(line.label) +
        '</td>' +
        '<td>' +
        escHtml(line.category ?? '—') +
        '</td>' +
        '<td class="num">' +
        line.quantity +
        '</td>' +
        '<td>' +
        escHtml(COST_UNIT_LABELS[line.unit]) +
        '</td>' +
        '<td class="num">' +
        (line.unitPriceTry != null ? formatMoney(line.unitPriceTry) : '—') +
        '</td>' +
        '<td class="num">' +
        (amt != null ? formatMoney(amt) : '—') +
        '</td>' +
        '</tr>'
      )
    })
    .join('')

  const laborRow =
    project.costEstimate.laborMarkupPct > 0
      ? '<tr class="sub"><td colspan="5">İşçilik (%' +
        project.costEstimate.laborMarkupPct +
        ')</td><td class="num">' +
        formatMoney(totals.laborAmount) +
        ' ₺</td></tr>'
      : ''

  const clientRow = project.clientName
    ? htmlEl(DV, '', '<span class="meta-label">Müşteri: </span>' + escHtml(project.clientName))
    : ''

  const meta = htmlEl(
    DV,
    'class="meta-grid"',
    [
      htmlEl(DV, '', '<span class="meta-label">Proje: </span>' + escHtml(project.name)),
      htmlEl(DV, '', '<span class="meta-label">Tarih: </span>' + formatDateTr(new Date())),
      clientRow,
      htmlEl(DV, '', '<span class="meta-label">Branş: </span>' + escHtml(DISCIPLINE_LABELS[project.discipline])),
    ].join('')
  )

  const footer = org.quoteFooterNote ? escHtml(org.quoteFooterNote) : ''

  const styles = [
    "body { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; color: #1c1530; margin: 0; padding: 32px; font-size: 11pt; }",
    '.header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #3b2f5c; padding-bottom: 16px; margin-bottom: 24px; }',
    '.company-name { font-size: 18pt; font-weight: 800; color: #3b2f5c; }',
    '.company-meta { font-size: 9.5pt; line-height: 1.45; color: #5c5470; text-align: right; max-width: 55%; }',
    '.doc-title { font-size: 14pt; font-weight: 700; margin: 0 0 8px; color: #3b2f5c; }',
    '.meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; margin-bottom: 20px; font-size: 10pt; }',
    '.meta-label { color: #5c5470; font-weight: 600; }',
    'table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }',
    'th { background: #3b2f5c; color: #fff; text-align: left; padding: 10px 8px; font-size: 9.5pt; }',
    'td { border-bottom: 1px solid #e2dce8; padding: 8px; vertical-align: top; }',
    'tr:nth-child(even) td { background: #f9f8fb; }',
    '.num { text-align: right; white-space: nowrap; }',
    '.totals { width: 100%; max-width: 320px; margin-left: auto; }',
    '.totals td { border: none; padding: 6px 8px; }',
    '.totals .grand td { font-weight: 800; font-size: 12pt; color: #3b2f5c; border-top: 2px solid #3b2f5c; }',
    '.footer { margin-top: 28px; font-size: 8.5pt; color: #5c5470; line-height: 1.5; border-top: 1px solid #e2dce8; padding-top: 12px; }',
  ].join(' ')

  return [
    '<!DOCTYPE html>',
    '<html lang="tr">',
    '<head><meta charset="utf-8" /><style>' + styles + '</style></head>',
    '<body>',
    htmlEl(
      DV,
      'class="header"',
      htmlEl(DV, '', logoBlock) + htmlEl(DV, 'class="company-meta"', companyMetaHtml(org))
    ),
    '<h1 class="doc-title">YAKLAŞIK MALİYET / TEKLİF ÖZETİ</h1>',
    meta,
    '<table><thead><tr><th>Kalem</th><th>Kategori</th><th>Miktar</th><th>Birim</th><th>Birim fiyat</th><th>Tutar (₺)</th></tr></thead><tbody>' +
      (rowsHtml || '<tr><td colspan="6">Maliyet kalemi yok</td></tr>') +
      '</tbody></table>',
    '<table class="totals">' +
      '<tr><td>Malzeme ara toplamı</td><td class="num">' +
      formatMoney(totals.materialSubtotal) +
      ' ₺</td></tr>' +
      laborRow +
      '<tr><td>Ara toplam (KDV hariç)</td><td class="num">' +
      formatMoney(totals.subtotalBeforeVat) +
      ' ₺</td></tr>' +
      '<tr><td>KDV %' +
      project.vatRatePct +
      '</td><td class="num">' +
      formatMoney(totals.vatAmount) +
      ' ₺</td></tr>' +
      '<tr class="grand"><td>Genel toplam</td><td class="num">' +
      formatMoney(totals.grandTotal) +
      ' ₺</td></tr></table>',
    htmlEl(DV, 'class="footer"', footer),
    '</body></html>',
  ].join('\n')
}
